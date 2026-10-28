import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export interface BiometricStatus {
  isAvailable: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  biometricType: 'FaceID' | 'Huella Dactilar' | 'Iris' | 'Biometría' | 'No Disponible';
}

export const biometricService = {
  /**
   * Evaluates the hardware biometric capabilities of the device.
   */
  async getStatus(): Promise<BiometricStatus> {
    try {
      if (Platform.OS === 'web') {
        // WebAuthn / Passkeys detection could be added, but for local-authentication on web:
        return {
          isAvailable: false,
          hasHardware: false,
          isEnrolled: false,
          biometricType: 'No Disponible',
        };
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType: BiometricStatus['biometricType'] = 'Biometría';
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'FaceID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'Huella Dactilar';
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'Iris';
      }

      return {
        isAvailable: hasHardware && isEnrolled,
        hasHardware,
        isEnrolled,
        biometricType: hasHardware ? biometricType : 'No Disponible',
      };
    } catch (e) {
      console.warn('[Biometrics] Error evaluating biometric hardware:', e);
      return {
        isAvailable: false,
        hasHardware: false,
        isEnrolled: false,
        biometricType: 'No Disponible',
      };
    }
  },

  /**
   * Prompts the native biometrics sensor (FaceID or Fingerprint).
   */
  async authenticate(promptMessage: string = 'Autenticación Biométrica Sentinela'): Promise<{ success: boolean; error?: string }> {
    try {
      if (Platform.OS === 'web') {
        return { success: false, error: 'Biometría no soportada en navegador web estándar.' };
      }

      const status = await this.getStatus();
      if (!status.isAvailable) {
        return {
          success: false,
          error: !status.hasHardware
            ? 'Este dispositivo no cuenta con hardware biométrico.'
            : 'No hay datos biométricos configurados en este dispositivo.',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Ingresar con contraseña',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error === 'user_cancel' ? 'Autenticación cancelada por el usuario.' : 'Verificación biométrica no superada.',
        };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || 'Error en sensor biométrico.' };
    }
  },
};
