import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  QrCode,
  Search,
  CloudOff,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { Header } from './src/components/Header';
import { ActivitySelector } from './src/components/ActivitySelector';
import { ServerConfigModal } from './src/components/ServerConfigModal';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { ManualScreen } from './src/screens/ManualScreen';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from './src/components/ui';
import { api } from './src/services/api';
import { Actividad, Sesion, Pastor, UltimoEscaneo } from './src/types';

type ModoKiosco = 'scan' | 'manual';

function MainApp() {
  const { isDark, colors } = useTheme();

  // Sub-modo Kiosco: Escaneo QR o Búsqueda Manual
  const [modoKiosco, setModoKiosco] = useState<ModoKiosco>('manual');

  // Estados de conexión y actividades
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [actividadActual, setActividadActual] = useState<Actividad | null>(null);
  const [sesionActual, setSesionActual] = useState<Sesion | null>(null);
  const [ultimosEscaneos, setUltimosEscaneos] = useState<UltimoEscaneo[]>([]);
  const [loadingActividades, setLoadingActividades] = useState<boolean>(true);
  const [serverOnline, setServerOnline] = useState<boolean>(true);
  const [configModalVisible, setConfigModalVisible] = useState<boolean>(false);

  // Estados de Modo Offline y Cola de Sincronización
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [padronOfflineCount, setPadronOfflineCount] = useState<number>(0);
  const [syncingOffline, setSyncingOffline] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string>('');

  const actualizarContadoresLocales = useCallback(() => {
    setPendingSyncCount(api.getPendingQueueCount());
    setPadronOfflineCount(api.getPadronCount());
  }, []);

  const cargarUltimosEscaneos = useCallback(
    async (actividadId: number) => {
      try {
        const res = await api.getUltimosEscaneos(actividadId);
        if (res.success && Array.isArray(res.ultimos)) {
          setUltimosEscaneos(res.ultimos);
        }
      } catch {}
      actualizarContadoresLocales();
    },
    [actualizarContadoresLocales]
  );

  const sincronizarColaPendiente = useCallback(
    async (actividadId?: number) => {
      const enCola = api.getPendingQueueCount();
      if (enCola === 0) return;

      setSyncingOffline(true);
      try {
        const res = await api.sincronizarColaOffline();
        setPendingSyncCount(res.pending);

        if (res.synced > 0) {
          setServerOnline(true);
          setSyncNotice(
            `¡${res.synced} asistencia${res.synced > 1 ? 's' : ''} offline sincronizada${res.synced > 1 ? 's' : ''} con éxito!`
          );
          setTimeout(() => setSyncNotice(''), 4500);

          if (typeof res.lastTotalPresentes === 'number') {
            setActividadActual((prev) =>
              prev ? { ...prev, total_presentes: res.lastTotalPresentes! } : null
            );
          }

          const actId = actividadId || actividadActual?.id;
          if (actId) {
            await cargarUltimosEscaneos(actId);
          }
        }
      } catch {} finally {
        setSyncingOffline(false);
      }
    },
    [actividadActual?.id, cargarUltimosEscaneos]
  );

  // Carga de actividades + sincronización de padrón offline
  const cargarActividades = useCallback(async () => {
    setLoadingActividades(true);
    try {
      await api.init();
      actualizarContadoresLocales();

      // Si había asistencias pendientes en cola offline, intentar sincronizarlas primero
      if (api.getPendingQueueCount() > 0) {
        await sincronizarColaPendiente();
      }

      const res = await api.getActividadesActivas();
      if (res.success && res.actividades.length > 0) {
        const enCurso = res.actividades.filter((a) => a.estado === 'en_curso');
        setActividades(enCurso);
        setServerOnline(!res.fromCache);

        const selected = enCurso[0] || null;
        setActividadActual((prev) => {
          const matched = prev ? enCurso.find((a) => a.id === prev.id) : null;
          const target = matched || selected;
          if (target) {
            setSesionActual((prevSes) => {
              if (prevSes && target.sesiones.some((s) => s.id === prevSes.id)) {
                return prevSes;
              }
              return target.sesion_activa || target.sesiones[0] || null;
            });
          } else {
            setSesionActual(null);
          }
          return target;
        });

        if (selected) {
          cargarUltimosEscaneos(selected.id);
          if (!res.fromCache) {
            api.sincronizarPadronOffline(selected.id).then((padronRes) => {
              if (padronRes.total > 0) {
                setPadronOfflineCount(padronRes.total);
              }
            });
          }
        }
      } else {
        setServerOnline(true);
        setActividades([]);
        setActividadActual(null);
        setSesionActual(null);
        setUltimosEscaneos([]);
      }
    } catch (err) {
      setServerOnline(false);
      actualizarContadoresLocales();
      console.warn('Error conectando al backend:', err);
    } finally {
      setLoadingActividades(false);
    }
  }, [actualizarContadoresLocales, cargarUltimosEscaneos, sincronizarColaPendiente]);

  useEffect(() => {
    cargarActividades();
  }, [cargarActividades]);

  // Monitor automático cada 12 segundos para reconectar y sincronizar cola offline automáticamente
  useEffect(() => {
    const interval = setInterval(async () => {
      const pending = api.getPendingQueueCount();
      if (pending > 0) {
        await sincronizarColaPendiente(actividadActual?.id);
      } else if (!serverOnline) {
        const ok = await api.testConnection(api.getBaseUrl());
        if (ok) {
          cargarActividades();
        }
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [actividadActual?.id, cargarActividades, serverOnline, sincronizarColaPendiente]);

  const handleSelectActividad = (act: Actividad) => {
    setActividadActual(act);
    setSesionActual(act.sesion_activa || act.sesiones[0] || null);
    cargarUltimosEscaneos(act.id);
    api.sincronizarPadronOffline(act.id).then((r) => {
      if (r.total > 0) setPadronOfflineCount(r.total);
    });
  };

  const handleSelectSesion = (ses: Sesion) => {
    setSesionActual(ses);
  };

  const handleAsistenciaRegistrada = (pastor: Pastor, conConyuge: boolean, totalPresentes?: number) => {
    actualizarContadoresLocales();
    if (api.getPendingQueueCount() > 0) {
      setServerOnline(false);
    } else {
      setServerOnline(true);
    }

    setActividadActual((prev) => {
      if (!prev) return null;
      const nuevoTotal =
        typeof totalPresentes === 'number'
          ? totalPresentes
          : (prev.total_presentes || 0) + (conConyuge ? 2 : 1);
      return {
        ...prev,
        total_presentes: nuevoTotal,
      };
    });

    if (actividadActual?.id) {
      cargarUltimosEscaneos(actividadActual.id);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* 1. ENCABEZADO INSTITUCIONAL OFICIAL */}
      <Header
        actividad={actividadActual}
        onOpenServerConfig={() => setConfigModalVisible(true)}
        onRefresh={cargarActividades}
        serverOnline={serverOnline}
      />

      {/* 2. SELECTOR DE ACTIVIDAD Y SESIÓN */}
      <ActivitySelector
        actividades={actividades}
        actividadActual={actividadActual}
        sesionActual={sesionActual}
        onSelectActividad={handleSelectActividad}
        onSelectSesion={handleSelectSesion}
        loading={loadingActividades}
      />

      {/* BANNER DE NOTIFICACIÓN CUANDO SE SINCRONIZAN ASISTENCIAS OFFLINE */}
      {syncNotice ? (
        <View style={[styles.offlineBanner, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
          <CheckCircle2 size={15} color={colors.success} />
          <Text style={[styles.offlineText, { color: colors.success }]}>
            {syncNotice}
          </Text>
        </View>
      ) : null}

      {/* BANNER DE COLA DE SINCRONIZACIÓN PENDIENTE */}
      {pendingSyncCount > 0 && (
        <Pressable
          style={[styles.offlineBanner, { backgroundColor: colors.warningBg, borderColor: colors.warningBorder }]}
          onPress={() => sincronizarColaPendiente(actividadActual?.id)}
          disabled={syncingOffline}
        >
          {syncingOffline ? (
            <ActivityIndicator size="small" color={colors.warning} />
          ) : (
            <RefreshCw size={15} color={colors.warning} />
          )}
          <Text style={[styles.offlineText, { color: isDark ? '#fde68a' : '#92400e' }]}>
            {syncingOffline
              ? `Sincronizando ${pendingSyncCount} asistencia(s) con el servidor...`
              : `${pendingSyncCount} asistencia(s) guardada(s) en Modo Offline. Se sincronizarán al volver internet (Toque para reintentar).`}
          </Text>
        </Pressable>
      )}

      {/* ALERTA SI ESTÁ OPERANDO SIN CONEXIÓN CON EL SERVIDOR */}
      {!serverOnline && (
        <Pressable
          style={[styles.offlineBanner, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}
          onPress={() => setConfigModalVisible(true)}
        >
          <CloudOff size={15} color={colors.danger} />
          <Text style={[styles.offlineText, { color: isDark ? '#fecdd3' : colors.danger }]}>
            {padronOfflineCount > 0
              ? `Modo Offline activo (${padronOfflineCount} obreros en memoria local). Puede seguir acreditando sin internet.`
              : `Sin conexión con ${api.getBaseUrl()}. Toque aquí para configurar el servidor.`}
          </Text>
        </Pressable>
      )}

      {/* 3. KIOSCO DE CONTROL DE ACCESO EN PUERTA (EXCLUSIVO) */}
      <Tabs
        value={modoKiosco}
        onValueChange={(val) => setModoKiosco(val as ModoKiosco)}
        style={styles.tabsRoot}
      >
        <View style={styles.tabsHeaderContainer}>
          <TabsList style={styles.tabsList}>
            <TabsTrigger value="scan">
              <QrCode size={15} color={modoKiosco === 'scan' ? '#ffffff' : colors.textSecondary} />
              <Text style={[styles.tabTriggerText, { color: modoKiosco === 'scan' ? '#ffffff' : colors.textSecondary }]}>
                Escaneo QR
              </Text>
            </TabsTrigger>

            <TabsTrigger value="manual">
              <Search size={15} color={modoKiosco === 'manual' ? '#ffffff' : colors.textSecondary} />
              <Text style={[styles.tabTriggerText, { color: modoKiosco === 'manual' ? '#ffffff' : colors.textSecondary }]}>
                Registro Manual
              </Text>
            </TabsTrigger>
          </TabsList>
        </View>

        {loadingActividades ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Conectando con la base de datos nacional...
            </Text>
          </View>
        ) : (
          <>
            <TabsContent value="scan">
              <ScannerScreen
                actividad={actividadActual}
                sesion={sesionActual}
                onAsistenciaRegistrada={handleAsistenciaRegistrada}
              />
            </TabsContent>

            <TabsContent value="manual">
              <ManualScreen
                actividad={actividadActual}
                sesion={sesionActual}
                ultimosEscaneos={ultimosEscaneos}
                onAsistenciaRegistrada={handleAsistenciaRegistrada}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* MODAL DE CONFIGURACIÓN DE IP */}
      <ServerConfigModal
        visible={configModalVisible}
        onClose={() => setConfigModalVisible(false)}
        onSaved={cargarActividades}
      />
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    CocogooseBold: require('./assets/fonts/cocogoose-bold.ttf'),
    CocogooseRegular: require('./assets/fonts/cocogoose-regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginHorizontal: 12,
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  offlineText: {
    fontSize: 11.5,
    fontWeight: '700',
    flex: 1,
  },
  tabsRoot: {
    flex: 1,
  },
  tabsHeaderContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabsList: {
    width: '100%',
  },
  tabTriggerText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
