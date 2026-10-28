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
import * as Notifications from 'expo-notifications';
import { CloudOff } from 'lucide-react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Header } from './src/components/Header';
import { ActivitySelector } from './src/components/ActivitySelector';
import { ServerConfigModal } from './src/components/ServerConfigModal';
import { SetupQuickAccessModal } from './src/components/SetupQuickAccessModal';
import { LoginScreen } from './src/screens/LoginScreen';
import { PresbiteroDashboardScreen } from './src/screens/PresbiteroDashboardScreen';
import { SupervisorDashboardScreen } from './src/screens/SupervisorDashboardScreen';
import { api } from './src/services/api';
import { Actividad, Sesion } from './src/types';

// Notificaciones en primer plano para Expo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function MainApp() {
  const { ui, resolvedTheme } = useTheme();
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    shouldShowQuickAccessSetup,
    setShouldShowQuickAccessSetup,
  } = useAuth();

  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [actividadActual, setActividadActual] = useState<Actividad | null>(null);
  const [sesionActual, setSesionActual] = useState<Sesion | null>(null);
  const [loadingActividades, setLoadingActividades] = useState<boolean>(true);
  const [serverOnline, setServerOnline] = useState<boolean>(true);
  const [configModalVisible, setConfigModalVisible] = useState<boolean>(false);

  const cargarActividades = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingActividades(true);
    try {
      await api.init();
      const resp = await api.getActividades();
      if (resp.success && resp.data.length > 0) {
        setActividades(resp.data);
        setActividadActual((prev) => {
          const matched = prev ? resp.data.find((a) => a.id === prev.id) : null;
          return matched || resp.data.find((a) => a.activa) || resp.data[0];
        });
        setServerOnline(true);
      } else {
        setServerOnline(false);
      }
    } catch {
      setServerOnline(false);
    } finally {
      if (!isSilent) setLoadingActividades(false);
    }
  }, []);

  useEffect(() => {
    cargarActividades();
    const interval = setInterval(() => cargarActividades(true), 15000); // 15s sincronización en vivo
    return () => clearInterval(interval);
  }, [cargarActividades]);

  const handleSelectActividad = (act: Actividad) => {
    setActividadActual(act);
    setSesionActual(act.sesion_activa || act.sesiones[0] || null);
  };

  const handleSelectSesion = (ses: Sesion) => {
    setSesionActual(ses);
  };

  if (authLoading) {
    return (
      <View style={[styles.loadingFull, { backgroundColor: ui.background }]}>
        <ActivityIndicator size="large" color={ui.brand} />
        <Text style={[styles.loadingFullText, { color: ui.mutedForeground }]}>
          Iniciando Portal Presbiteral MMM...
        </Text>
      </View>
    );
  }

  // SI NO ESTÁ AUTENTICADO: LOGIN SCREEN (SENTINELA HUD)
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: ui.background }]}>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
        <LoginScreen onLoginSuccess={cargarActividades} />
      </SafeAreaView>
    );
  }

  // SI ESTÁ AUTENTICADO: DASHBOARD EJECUTIVO (PRESBÍTERO O SUPERVISOR)
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: ui.background }]}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />

      {/* CABECERA INSTITUCIONAL */}
      <Header
        actividad={actividadActual}
        onOpenServerConfig={() => setConfigModalVisible(true)}
        serverOnline={serverOnline}
      />

      {/* SELECTOR DE ACTIVIDAD */}
      <ActivitySelector
        actividades={actividades}
        actividadActual={actividadActual}
        sesionActual={sesionActual}
        onSelectActividad={handleSelectActividad}
        onSelectSesion={handleSelectSesion}
        loading={loadingActividades}
      />

      {/* ALERTA DE DESCONEXIÓN */}
      {!serverOnline && (
        <Pressable
          style={[styles.offlineBanner, { backgroundColor: ui.destructiveSoft, borderColor: ui.destructiveBorder }]}
          onPress={() => setConfigModalVisible(true)}
        >
          <CloudOff size={15} color={ui.destructive} />
          <Text style={[styles.offlineText, { color: ui.destructive }]}>
            Sin conexión con el servidor nacional ({api.getBaseUrl()}). Toque para ajustar la IP.
          </Text>
        </Pressable>
      )}

      {/* VISTA EJECUTIVA SEGÚN EL ROL */}
      <View style={{ flex: 1 }}>
        {user.es_supervisor ? (
          <SupervisorDashboardScreen
            actividad={actividadActual}
            sesion={sesionActual}
          />
        ) : (
          <PresbiteroDashboardScreen
            actividad={actividadActual}
            sesion={sesionActual}
          />
        )}
      </View>

      {/* CONFIGURACIÓN DE IP */}
      <ServerConfigModal
        visible={configModalVisible}
        onClose={() => setConfigModalVisible(false)}
        onSaved={cargarActividades}
      />

      {/* CONFIGURACIÓN DE ACCESO RÁPIDO (PRIMER INGRESO O AJUSTE) */}
      <SetupQuickAccessModal
        visible={shouldShowQuickAccessSetup}
        onClose={() => setShouldShowQuickAccessSetup(false)}
        isInitialSetup
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
        <AuthProvider>
          <MainApp />
        </AuthProvider>
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
    backgroundColor: '#09090B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingFullText: {
    fontSize: 13,
    fontWeight: '600',
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
});

