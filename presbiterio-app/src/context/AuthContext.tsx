import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { api } from '../services/api';
import { biometricService } from '../services/biometricService';
import { secureStorage } from '../services/secureStore';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (usuario: string, pass: string) => Promise<AuthResponse>;
  loginWithBiometrics: () => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  toggleModoSilencioso: () => Promise<void>;
  biometricsAvailable: boolean;
  biometricsEnabled: boolean;
  enableBiometrics: () => Promise<boolean>;
  disableBiometrics: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => ({ success: false }),
  loginWithBiometrics: async () => ({ success: false }),
  logout: async () => {},
  toggleModoSilencioso: async () => {},
  biometricsAvailable: false,
  biometricsEnabled: false,
  enableBiometrics: async () => false,
  disableBiometrics: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [biometricsAvailable, setBiometricsAvailable] = useState<boolean>(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(false);

  // Registrar Token de Notificaciones Push
  const registrarPushToken = useCallback(async (currentUser: User) => {
    if (Platform.OS === 'web') return;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return;

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      if (token && token !== currentUser.expo_push_token) {
        await api.updatePushSettings(
          token,
          currentUser.push_notificaciones_activas,
          currentUser.push_modo_silencioso
        );
        setUser((prev) => (prev ? { ...prev, expo_push_token: token } : null));
      }
    } catch (e) {
      console.warn('Error registrando push token:', e);
    }
  }, []);

  // Verificar hardware biométrico y sesión guardada
  useEffect(() => {
    const initAuth = async () => {
      try {
        await api.init();
        const bioStatus = await biometricService.getStatus();
        setBiometricsAvailable(bioStatus.isAvailable);

        const bioSaved = await secureStorage.getItem(secureStorage.KEYS.BIOMETRIC_ENABLED);
        setBiometricsEnabled(bioSaved === 'true');

        const userJson = await secureStorage.getItem(secureStorage.KEYS.AUTH_USER);
        if (userJson) {
          const parsedUser: User = JSON.parse(userJson);
          setUser(parsedUser);
          registrarPushToken(parsedUser);
        }
      } catch (e) {
        console.warn('Error iniciando AuthContext:', e);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [registrarPushToken]);

  const login = async (usuario: string, pass: string): Promise<AuthResponse> => {
    const res = await api.login(usuario, pass);
    if (res.success && res.user && res.token) {
      setUser(res.user);
      await secureStorage.setItem(secureStorage.KEYS.AUTH_TOKEN, res.token);
      await secureStorage.setItem(secureStorage.KEYS.AUTH_USER, JSON.stringify(res.user));
      await secureStorage.setItem('saved_credentials', JSON.stringify({ usuario, pass }));
      registrarPushToken(res.user);
    }
    return res;
  };

  const loginWithBiometrics = async (): Promise<{ success: boolean; message?: string }> => {
    const authResult = await biometricService.authenticate('Acceso Ejecutivo MMM Venezuela');
    if (!authResult.success) {
      return { success: false, message: authResult.error || 'Verificación biométrica fallida' };
    }

    const savedCreds = await secureStorage.getItem('saved_credentials');
    if (!savedCreds) {
      return { success: false, message: 'No hay credenciales registradas para huella. Inicie sesión con contraseña primero.' };
    }

    try {
      const { usuario, pass } = JSON.parse(savedCreds);
      const res = await login(usuario, pass);
      if (res.success) {
        return { success: true };
      }
      return { success: false, message: res.message || 'Error autenticando con credenciales guardadas.' };
    } catch {
      return { success: false, message: 'Error procesando credenciales biométricas.' };
    }
  };

  const logout = async () => {
    await api.logout();
    await secureStorage.deleteItem(secureStorage.KEYS.AUTH_TOKEN);
    await secureStorage.deleteItem(secureStorage.KEYS.AUTH_USER);
    setUser(null);
  };

  const toggleModoSilencioso = async () => {
    if (!user) return;
    const nuevoSilencioso = !user.push_modo_silencioso;
    setUser({ ...user, push_modo_silencioso: nuevoSilencioso });

    await api.updatePushSettings(
      user.expo_push_token || null,
      user.push_notificaciones_activas,
      nuevoSilencioso
    );
  };

  const enableBiometrics = async (): Promise<boolean> => {
    const authResult = await biometricService.authenticate('Confirmar huella para activación');
    if (authResult.success) {
      await secureStorage.setItem(secureStorage.KEYS.BIOMETRIC_ENABLED, 'true');
      setBiometricsEnabled(true);
      return true;
    }
    return false;
  };

  const disableBiometrics = async () => {
    await secureStorage.deleteItem(secureStorage.KEYS.BIOMETRIC_ENABLED);
    setBiometricsEnabled(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        loginWithBiometrics,
        logout,
        toggleModoSilencioso,
        biometricsAvailable,
        biometricsEnabled,
        enableBiometrics,
        disableBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

