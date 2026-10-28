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
  loginWithPin: (pin: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  toggleModoSilencioso: () => Promise<void>;
  biometricsAvailable: boolean;
  biometricsEnabled: boolean;
  biometricType: string;
  platformAuthName: string;
  hasPinConfigured: boolean;
  savedUserName: string | null;
  savedUserLogin: string | null;
  shouldShowQuickAccessSetup: boolean;
  setShouldShowQuickAccessSetup: (show: boolean) => void;
  setupQuickAccess: (options: {
    enableBiometrics?: boolean;
    pin?: string;
    dismiss?: boolean;
  }) => Promise<boolean>;
  removeQuickAccess: () => Promise<void>;
  clearSavedAccount: () => Promise<void>;
  enableBiometrics: () => Promise<boolean>;
  disableBiometrics: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => ({ success: false }),
  loginWithBiometrics: async () => ({ success: false }),
  loginWithPin: async () => ({ success: false }),
  logout: async () => {},
  toggleModoSilencioso: async () => {},
  biometricsAvailable: false,
  biometricsEnabled: false,
  biometricType: 'Biometría',
  platformAuthName: 'Dispositivo',
  hasPinConfigured: false,
  savedUserName: null,
  savedUserLogin: null,
  shouldShowQuickAccessSetup: false,
  setShouldShowQuickAccessSetup: () => {},
  setupQuickAccess: async () => false,
  removeQuickAccess: async () => {},
  clearSavedAccount: async () => {},
  enableBiometrics: async () => false,
  disableBiometrics: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [biometricsAvailable, setBiometricsAvailable] = useState<boolean>(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<string>('Biometría');
  const [platformAuthName, setPlatformAuthName] = useState<string>('Dispositivo');
  const [hasPinConfigured, setHasPinConfigured] = useState<boolean>(false);
  const [savedUserName, setSavedUserName] = useState<string | null>(null);
  const [savedUserLogin, setSavedUserLogin] = useState<string | null>(null);
  const [shouldShowQuickAccessSetup, setShouldShowQuickAccessSetup] = useState<boolean>(false);

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
        setBiometricType(bioStatus.biometricType);
        setPlatformAuthName(bioStatus.platformName);

        const bioSaved = await secureStorage.getItem(secureStorage.KEYS.BIOMETRIC_ENABLED);
        setBiometricsEnabled(bioSaved === 'true');

        const pinSaved = await secureStorage.getItem(secureStorage.KEYS.QUICK_ACCESS_PIN);
        setHasPinConfigured(!!pinSaved);

        const savedCreds = await secureStorage.getItem(secureStorage.KEYS.SAVED_CREDENTIALS);
        if (savedCreds) {
          try {
            const parsed = JSON.parse(savedCreds);
            setSavedUserName(parsed.name || null);
            setSavedUserLogin(parsed.usuario || null);
          } catch {
            // Ignored
          }
        }

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
      setSavedUserName(res.user.name);
      setSavedUserLogin(usuario);

      await secureStorage.setItem(secureStorage.KEYS.AUTH_TOKEN, res.token);
      await secureStorage.setItem(secureStorage.KEYS.AUTH_USER, JSON.stringify(res.user));
      await secureStorage.setItem(
        secureStorage.KEYS.SAVED_CREDENTIALS,
        JSON.stringify({ usuario, pass, name: res.user.name })
      );
      registrarPushToken(res.user);

      // Revisar si ya configuró acceso rápido
      const configState = await secureStorage.getItem(secureStorage.KEYS.QUICK_ACCESS_CONFIGURED);
      if (!configState) {
        setShouldShowQuickAccessSetup(true);
      }
    }
    return res;
  };

  const loginWithPin = async (
    enteredPin: string
  ): Promise<{ success: boolean; message?: string }> => {
    const savedPin = await secureStorage.getItem(secureStorage.KEYS.QUICK_ACCESS_PIN);
    if (!savedPin) {
      return { success: false, message: 'No hay PIN configurado en este dispositivo.' };
    }

    if (enteredPin !== savedPin) {
      return { success: false, message: 'El PIN ingresado es incorrecto.' };
    }

    const savedCreds = await secureStorage.getItem(secureStorage.KEYS.SAVED_CREDENTIALS);
    if (!savedCreds) {
      return { success: false, message: 'No se encontraron credenciales para ingresar con PIN.' };
    }

    try {
      const { usuario, pass } = JSON.parse(savedCreds);
      const res = await login(usuario, pass);
      if (res.success) {
        return { success: true };
      }
      return {
        success: false,
        message: res.message || 'Error autenticando con credenciales vinculadas al PIN.',
      };
    } catch {
      return { success: false, message: 'Error procesando autenticación por PIN.' };
    }
  };

  const loginWithBiometrics = async (): Promise<{ success: boolean; message?: string }> => {
    const authResult = await biometricService.authenticate(
      `Acceso Ejecutivo MMM Venezuela (${platformAuthName})`
    );
    if (!authResult.success) {
      return { success: false, message: authResult.error || 'Verificación biométrica fallida' };
    }

    const savedCreds = await secureStorage.getItem(secureStorage.KEYS.SAVED_CREDENTIALS);
    if (!savedCreds) {
      return {
        success: false,
        message: 'No hay credenciales registradas. Inicie sesión con contraseña primero.',
      };
    }

    try {
      const { usuario, pass } = JSON.parse(savedCreds);
      const res = await login(usuario, pass);
      if (res.success) {
        return { success: true };
      }
      return {
        success: false,
        message: res.message || 'Error autenticando con credenciales guardadas.',
      };
    } catch {
      return { success: false, message: 'Error procesando credenciales biométricas.' };
    }
  };

  const setupQuickAccess = async (options: {
    enableBiometrics?: boolean;
    pin?: string;
    dismiss?: boolean;
  }): Promise<boolean> => {
    if (options.dismiss) {
      await secureStorage.setItem(secureStorage.KEYS.QUICK_ACCESS_CONFIGURED, 'dismissed');
      setShouldShowQuickAccessSetup(false);
      return true;
    }

    let type: string = 'none';

    if (options.enableBiometrics) {
      const auth = await biometricService.register(
        user?.username || savedUserLogin || 'presbitero',
        user?.name || savedUserName || 'Presbítero MMM'
      );
      if (auth.success) {
        await secureStorage.setItem(secureStorage.KEYS.BIOMETRIC_ENABLED, 'true');
        setBiometricsEnabled(true);
        type = 'biometric';
      } else {
        return false;
      }
    }

    if (options.pin && options.pin.length >= 4) {
      await secureStorage.setItem(secureStorage.KEYS.QUICK_ACCESS_PIN, options.pin);
      setHasPinConfigured(true);
      type = type === 'biometric' ? 'both' : 'pin';
    }

    await secureStorage.setItem(secureStorage.KEYS.QUICK_ACCESS_CONFIGURED, 'true');
    await secureStorage.setItem(secureStorage.KEYS.QUICK_ACCESS_TYPE, type);
    setShouldShowQuickAccessSetup(false);
    return true;
  };

  const removeQuickAccess = async () => {
    await secureStorage.deleteItem(secureStorage.KEYS.QUICK_ACCESS_PIN);
    await secureStorage.deleteItem(secureStorage.KEYS.BIOMETRIC_ENABLED);
    await secureStorage.deleteItem('mmm_passkey_credential_id');
    await secureStorage.deleteItem(secureStorage.KEYS.QUICK_ACCESS_TYPE);
    await secureStorage.deleteItem(secureStorage.KEYS.QUICK_ACCESS_CONFIGURED);
    setHasPinConfigured(false);
    setBiometricsEnabled(false);
  };

  const clearSavedAccount = async () => {
    await logout();
    await secureStorage.deleteItem(secureStorage.KEYS.SAVED_CREDENTIALS);
    await removeQuickAccess();
    setSavedUserName(null);
    setSavedUserLogin(null);
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
    const authResult = await biometricService.register(
      user?.username || savedUserLogin || 'presbitero',
      user?.name || savedUserName || 'Presbítero MMM'
    );
    if (authResult.success) {
      await secureStorage.setItem(secureStorage.KEYS.BIOMETRIC_ENABLED, 'true');
      setBiometricsEnabled(true);
      return true;
    }
    return false;
  };

  const disableBiometrics = async () => {
    await secureStorage.deleteItem(secureStorage.KEYS.BIOMETRIC_ENABLED);
    await secureStorage.deleteItem('mmm_passkey_credential_id');
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
        loginWithPin,
        logout,
        toggleModoSilencioso,
        biometricsAvailable,
        biometricsEnabled,
        biometricType,
        platformAuthName,
        hasPinConfigured,
        savedUserName,
        savedUserLogin,
        shouldShowQuickAccessSetup,
        setShouldShowQuickAccessSetup,
        setupQuickAccess,
        removeQuickAccess,
        clearSavedAccount,
        enableBiometrics,
        disableBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
