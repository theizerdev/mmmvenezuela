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

type ModoTab = 'scan' | 'manual';

function MainApp() {
  const { isDark, colors } = useTheme();

  // Estados de conexión y actividades
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [actividadActual, setActividadActual] = useState<Actividad | null>(null);
  const [sesionActual, setSesionActual] = useState<Sesion | null>(null);
  const [loadingActividades, setLoadingActividades] = useState<boolean>(true);
  const [serverOnline, setServerOnline] = useState<boolean>(true);

  // Modo activo: Escaneo QR o Búsqueda Manual
  const [modo, setModo] = useState<ModoTab>('manual');

  // Modal de configuración de servidor
  const [configModalVisible, setConfigModalVisible] = useState<boolean>(false);

  // Carga de actividades
  const cargarActividades = useCallback(async () => {
    setLoadingActividades(true);
    try {
      await api.init();
      const res = await api.getActividadesActivas();
      if (res.success && res.actividades.length > 0) {
        setActividades(res.actividades);
        setServerOnline(true);

        setActividadActual((prev) => {
          const matched = prev ? res.actividades.find((a) => a.id === prev.id) : null;
          const selected = matched || res.actividades[0];
          setSesionActual(selected.sesion_activa || selected.sesiones[0] || null);
          return selected;
        });
      } else {
        setActividades([]);
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

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
            Sin conexión con {api.getBaseUrl()}. Toque aquí para configurar la IP del servidor.
          </Text>
        </Pressable>
      )}

      {/* 3. TABS SHADCN / RADIX PRIMITIVES PARA LAS 2 MODALIDADES */}
      <Tabs
        value={modo}
        onValueChange={(val) => setModo(val as ModoTab)}
        style={styles.tabsRoot}
      >
        <View style={styles.tabsHeaderContainer}>
          <TabsList style={styles.tabsList}>
            <TabsTrigger value="scan">
              <QrCode size={15} color={modo === 'scan' ? '#ffffff' : colors.textSecondary} />
              <Text style={[styles.tabTriggerText, { color: modo === 'scan' ? '#ffffff' : colors.textSecondary }]}>
                Escaneo QR
              </Text>
            </TabsTrigger>

            <TabsTrigger value="manual">
              <Search size={15} color={modo === 'manual' ? '#ffffff' : colors.textSecondary} />
              <Text style={[styles.tabTriggerText, { color: modo === 'manual' ? '#ffffff' : colors.textSecondary }]}>
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

      {/* 4. MODAL DE CONFIGURACIÓN DE IP */}
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
    'Cocogoose': require('./assets/fonts/cocogoose-bold.ttf'),
    'CocogooseBold': require('./assets/fonts/cocogoose-bold.ttf'),
    'CocogooseRegular': require('./assets/fonts/cocogoose-regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  offlineText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  tabsRoot: {
    flex: 1,
  },
  tabsHeaderContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  tabsList: {
    width: '100%',
  },
  tabTriggerText: {
    fontSize: 13,
    fontWeight: '800',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
