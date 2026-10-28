import AsyncStorage from '@react-native-async-storage/async-storage';

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn('[SecureStore] Failed to write item:', e);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn('[SecureStore] Failed to read item:', e);
      return null;
    }
  },

  async deleteItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('[SecureStore] Failed to delete item:', e);
    }
  },

  KEYS: {
    AUTH_TOKEN: 'mmm_presbiterio_token',
    AUTH_USER: 'mmm_presbiterio_user',
    BIOMETRIC_ENABLED: 'mmm_biometric_enabled',
    BIOMETRIC_TOKEN: 'mmm_biometric_token',
    ACTIVE_SERVER_ID: 'mmm_active_server_id',
    RECENT_SERVERS: 'mmm_recent_servers',
    QUICK_ACCESS_PIN: 'mmm_quick_access_pin',
    QUICK_ACCESS_CONFIGURED: 'mmm_quick_access_configured',
    QUICK_ACCESS_TYPE: 'mmm_quick_access_type', // 'biometric' | 'pin' | 'both' | 'dismissed'
    SAVED_CREDENTIALS: 'mmm_saved_credentials',
  },
};
