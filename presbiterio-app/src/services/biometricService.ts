import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { secureStorage } from './secureStore';

export interface BiometricStatus {
  isAvailable: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  biometricType:
    | 'Windows Hello'
    | 'Touch ID'
    | 'FaceID'
    | 'Huella Dactilar'
    | 'Iris'
    | 'Passkey del Dispositivo'
    | 'Biometría'
    | 'No Disponible';
  platformName: string;
}

// Helpers seguros para ArrayBuffer <-> Base64 sin dependencias externas
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function detectWebPlatformName(): {
  name: string;
  type: BiometricStatus['biometricType'];
} {
  if (typeof window === 'undefined') {
    return { name: 'Dispositivo', type: 'Passkey del Dispositivo' };
  }
  const ua = window.navigator.userAgent;
  if (/Windows/i.test(ua)) {
    return { name: 'Windows Hello (PIN, Huella o Rostro)', type: 'Windows Hello' };
  }
  if (/Macintosh|Mac OS X/i.test(ua)) {
    return { name: 'Touch ID / Llave de Acceso Apple', type: 'Touch ID' };
  }
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return { name: 'Face ID / Touch ID de Apple', type: 'FaceID' };
  }
  if (/Android/i.test(ua)) {
    return { name: 'Huella o PIN de Android', type: 'Huella Dactilar' };
  }
  return { name: 'Llave de Acceso del Dispositivo (Passkey)', type: 'Passkey del Dispositivo' };
}

export const biometricService = {
  /**
   * Evalúa las capacidades de autenticación del dispositivo:
   * - En Web: WebAuthn / Passkeys de plataforma (Windows Hello, Touch ID, etc.)
   * - En Móvil: Sensores nativos (Face ID, lector de huellas o PIN)
   */
  async getStatus(): Promise<BiometricStatus> {
    try {
      if (Platform.OS === 'web') {
        const isWebAuthnSupported =
          typeof window !== 'undefined' &&
          !!window.PublicKeyCredential &&
          !!navigator.credentials;

        if (!isWebAuthnSupported) {
          return {
            isAvailable: false,
            hasHardware: false,
            isEnrolled: false,
            biometricType: 'No Disponible',
            platformName: 'Navegador sin soporte de Passkey',
          };
        }

        let isPlatformAuthAvailable = false;
        try {
          if (window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
            isPlatformAuthAvailable =
              await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          }
        } catch {
          isPlatformAuthAvailable = false;
        }

        const { name, type } = detectWebPlatformName();

        return {
          isAvailable: isPlatformAuthAvailable || isWebAuthnSupported,
          hasHardware: isPlatformAuthAvailable,
          isEnrolled: isPlatformAuthAvailable,
          biometricType: type,
          platformName: name,
        };
      }

      // Plataforma Nativa Móvil (iOS / Android)
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
        platformName: biometricType,
      };
    } catch (e) {
      console.warn('[Biometrics] Error evaluando autenticador:', e);
      return {
        isAvailable: false,
        hasHardware: false,
        isEnrolled: false,
        biometricType: 'No Disponible',
        platformName: 'No Disponible',
      };
    }
  },

  /**
   * Registra una llave de acceso (Passkey) vinculada a Windows Hello o sensor del equipo.
   */
  async register(
    username: string = 'presbitero',
    displayName: string = 'Líder MMM Venezuela'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (Platform.OS === 'web') {
        if (!navigator.credentials || !window.PublicKeyCredential) {
          return { success: false, error: 'Su navegador no soporta Passkeys o WebAuthn.' };
        }

        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const userIdBytes = new Uint8Array(16);
        window.crypto.getRandomValues(userIdBytes);

        // Invoca el diálogo nativo de Windows Hello o Passkey del sistema
        const credential = (await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: {
              name: 'MMM Venezuela - Portal Ejecutivo',
            },
            user: {
              id: userIdBytes,
              name: username,
              displayName: displayName,
            },
            pubKeyCredParams: [
              { alg: -7, type: 'public-key' }, // ES256
              { alg: -257, type: 'public-key' }, // RS256
            ],
            authenticatorSelection: {
              authenticatorAttachment: 'platform', // Obliga a usar Windows Hello / Touch ID
              userVerification: 'required', // Obliga a verificar con PIN o Huella de Windows
              residentKey: 'preferred',
            },
            timeout: 60000,
            attestation: 'none',
          },
        })) as any;

        if (credential && credential.rawId) {
          const rawIdBase64 = bufferToBase64(credential.rawId);
          await secureStorage.setItem('mmm_passkey_credential_id', rawIdBase64);
          return { success: true };
        }

        return { success: false, error: 'No se completó la creación de la llave de acceso.' };
      }

      // En móvil nativo: validamos sensor de huella o Face ID
      const auth = await this.authenticate('Vincular este dispositivo con su cuenta MMM');
      return auth;
    } catch (e: any) {
      console.warn('[Passkey] Error en registro:', e);
      if (e?.name === 'NotAllowedError') {
        return { success: false, error: 'Operación cancelada por el usuario en Windows Security.' };
      }
      return { success: false, error: e?.message || 'Error registrando llave de acceso.' };
    }
  },

  /**
   * Desbloquea la sesión solicitando la verificación de Windows Hello, Touch ID o huella.
   */
  async authenticate(
    promptMessage: string = 'Acceso Ejecutivo MMM Venezuela'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (Platform.OS === 'web') {
        if (!navigator.credentials || !window.PublicKeyCredential) {
          return { success: false, error: 'Navegador sin soporte de llaves de acceso.' };
        }

        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const savedCredentialId = await secureStorage.getItem('mmm_passkey_credential_id');

        const publicKeyOptions: PublicKeyCredentialRequestOptions = {
          challenge,
          userVerification: 'required', // Pide PIN o biometría de Windows Hello
          timeout: 60000,
        };

        if (savedCredentialId) {
          publicKeyOptions.allowCredentials = [
            {
              id: base64ToBuffer(savedCredentialId),
              type: 'public-key',
              transports: ['internal'],
            },
          ];
        }

        // Invoca el diálogo nativo de Windows Hello
        const assertion = (await navigator.credentials.get({
          publicKey: publicKeyOptions,
        })) as any;

        if (assertion && assertion.id) {
          return { success: true };
        }

        return { success: false, error: 'Verificación no completada.' };
      }

      // En móvil nativo
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
        fallbackLabel: 'Ingresar con PIN del dispositivo',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error:
            result.error === 'user_cancel'
              ? 'Autenticación cancelada por el usuario.'
              : 'Verificación biométrica no superada.',
        };
      }
    } catch (e: any) {
      console.warn('[Biometrics/WebAuthn] Error en autenticación:', e);
      if (e?.name === 'NotAllowedError') {
        return { success: false, error: 'Autenticación cancelada en Windows Security.' };
      }
      return { success: false, error: e?.message || 'Error en sensor de acceso.' };
    }
  },
};
