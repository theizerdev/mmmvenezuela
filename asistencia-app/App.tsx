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
import { Actividad, Sesion, Pastor } from './src/types';

type ModoKiosco = 'scan' | 'manual';

function MainApp() {
  const { isDark, colors } = useTheme();

  // Sub-modo Kiosco: Escaneo QR o Búsqueda Manual
  const [modoKiosco, setModoKiosco] = useState<ModoKiosco>('manual');

  // Estados de conexión y actividades
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [actividadActual, setActividadActual] = useState<Actividad | null>(null);
  const [sesionActual, setSesionActual] = useState<Sesion | null>(null);
  const [loadingActividades, setLoadingActividades] = useState<boolean>(true);
  const [serverOnline, setServerOnline] = useState<boolean>(true);
  const [configModalVisible, setConfigModalVisible] = useState<boolean>(false);

  // Carga de actividades
  const cargarActividades = useCallback(async () => {
    setLoadingActividades(true);
    try {
      await api.init();
      const res = await api.getActividadesActivas();
      if (res.success && res.actividades.length > 0) {
        // Filtrar estrictamente actividades 'en_curso'
        const enCurso = res.actividades.filter((a) => a.estado === 'en_curso');
        setActividades(enCurso);
        setServerOnline(true);

        setActividadActual((prev) => {
          const matched = prev ? enCurso.find((a) => a.id === prev.id) : null;
          const selected = matched || enCurso[0] || null;
          if (selected) {
            setSesionActual(selected.sesion_activa || selected.sesiones[0] || null);
          } else {
            setSesionActual(null);
          }
          return selected;
        });
      } else {
        setActividades([]);
        setActividadActual(null);
        setSesionActual(null);
      }
    } catch (err) {
      setServerOnline(false);
      console.warn('Error conectando al backend:', err);
    } finally {
      setLoadingActividades(false);
    }
  }, []);

  useEffect(() => {
    cargarActividades();
  }, [cargarActividades]);

  const handleSelectActividad = (act: Actividad) => {
    setActividadActual(act);
    setSesionActual(act.sesion_activa || act.sesiones[0] || null);
  };

  const handleSelectSesion = (ses: Sesion) => {
    setSesionActual(ses);
  };

  const handleAsistenciaRegistrada = (pastor: Pastor, conConyuge: boolean) => {
    setActividadActual((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        total_presentes: (prev.total_presentes || 0) + (conConyuge ? 2 : 1),
      };
    });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <StatusBar
        style={isDark ? 'light' : 'dark'}
        backgroundColor={colors.bgSecondary}
        translucent={false}
      />

      {/* 1. ENCABEZADO INSTITUCIONAL OFICIAL */}
      <Header
        actividad={actividadActual}
        onOpenServerConfig={() => setConfigModalVisible(true)}
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

      {/* ALERTA SI NO HAY CONEXIÓN CON EL SERVIDOR */}
      {!serverOnline && (
        <Pressable
          style={[styles.offlineBanner, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}
          onPress={() => setConfigModalVisible(true)}
        >
          <CloudOff size={15} color={colors.danger} />
          <Text style={[styles.offlineText, { color: isDark ? '#fecdd3' : colors.danger }]}>
            Sin conexión con {api.getBaseUrl()}. Toque la rueda de configuración para cambiar la IP.
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '600',
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
