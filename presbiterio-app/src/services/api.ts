import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthResponse,
  PresbiteroDashboardData,
  SupervisorDashboardData,
  Actividad,
  PastorConsulta,
} from '../types';

function resolveDefaultApiUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return window.location.origin.replace(/\/+$/, '');
    }
  }
  return (process.env.EXPO_PUBLIC_API_URL || 'https://saprcoe.mmmvenezuela.org').replace(/\/+$/, '');
}

export const DEFAULT_API_URL = resolveDefaultApiUrl();
const STORAGE_KEY_API_URL = '@mmm_presbiterio_api_url';
const STORAGE_KEY_AUTH_TOKEN = '@mmm_presbiterio_auth_token';

class ApiService {
  private baseUrl: string = DEFAULT_API_URL;
  private authToken: string | null = null;

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    try {
      const storedUrl = await AsyncStorage.getItem(STORAGE_KEY_API_URL);
      if (storedUrl && storedUrl.trim() && !storedUrl.includes('https://mmmvenezuela.test')) {
        this.baseUrl = storedUrl.trim().replace(/\/+$/, '');
      } else {
        this.baseUrl = DEFAULT_API_URL;
      }
      const token = await AsyncStorage.getItem(STORAGE_KEY_AUTH_TOKEN);
      if (token) {
        this.authToken = token;
      }
    } catch (e) {
      console.warn('Error inicializando ApiService:', e);
    }
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      AsyncStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEY_AUTH_TOKEN).catch(() => {});
    }
  }

  async setBaseUrl(url: string): Promise<void> {
    const clean = url.trim().replace(/\/+$/, '');
    this.baseUrl = clean;
    await AsyncStorage.setItem(STORAGE_KEY_API_URL, clean);
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    };
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  async login(usuario: string, password: string): Promise<AuthResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const resp = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          login: usuario,
          usuario: usuario,
          password: password,
        }),
        signal: controller.signal,
      });
      const data = await resp.json();
      if (data.success && data.token) {
        this.setAuthToken(data.token);
      }
      return data;
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        return { success: false, message: 'Tiempo de espera agotado al conectar con el servidor.' };
      }
      return { success: false, message: e.message || 'Error de conexión con el servidor nacional' };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.authToken) {
        await fetch(`${this.baseUrl}/api/v1/auth/logout`, {
          method: 'POST',
          headers: this.getHeaders(),
        });
      }
    } catch {
      // Ignored
    } finally {
      this.setAuthToken(null);
    }
  }

  async getPresbiteroDashboard(
    actividadId?: number,
    sesionId?: number,
    zona?: string
  ): Promise<PresbiteroDashboardData> {
    const params = new URLSearchParams();
    if (actividadId) params.append('actividad_id', String(actividadId));
    if (sesionId) params.append('sesion_id', String(sesionId));
    if (zona) params.append('zona', zona);
    params.append('_t', String(Date.now())); // Evita almacenamiento en caché de navegador

    const resp = await fetch(`${this.baseUrl}/api/v1/presbitero/dashboard?${params.toString()}`, {
      method: 'GET',
      headers: this.getHeaders(),
      cache: 'no-store',
    });
    return resp.json();
  }

  async getSupervisorDashboard(actividadId?: number): Promise<SupervisorDashboardData> {
    const params = new URLSearchParams();
    if (actividadId) params.append('actividad_id', String(actividadId));
    params.append('_t', String(Date.now())); // Evita almacenamiento en caché de navegador

    const resp = await fetch(`${this.baseUrl}/api/v1/supervisor/dashboard?${params.toString()}`, {
      method: 'GET',
      headers: this.getHeaders(),
      cache: 'no-store',
    });
    return resp.json();
  }

  async updatePushSettings(
    expoPushToken: string | null,
    activas: boolean,
    modoSilencioso: boolean
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const resp = await fetch(`${this.baseUrl}/api/v1/auth/push-settings`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          expo_push_token: expoPushToken,
          push_notificaciones_activas: activas,
          push_modo_silencioso: modoSilencioso,
        }),
      });
      return resp.json();
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  async getActividades(): Promise<{ success: boolean; data: Actividad[] }> {
    try {
      const t = Date.now();
      let resp = await fetch(`${this.baseUrl}/api/v1/actividades/activas?_t=${t}`, {
        method: 'GET',
        headers: this.getHeaders(),
        cache: 'no-store',
      });
      if (!resp.ok) {
        resp = await fetch(`${this.baseUrl}/api/v1/actividades?_t=${t}`, {
          method: 'GET',
          headers: this.getHeaders(),
          cache: 'no-store',
        });
      }
      const json = await resp.json();
      return { success: json.success ?? true, data: json.actividades || json.data || [] };
    } catch {
      return { success: false, data: [] };
    }
  }

  async consultarUsuarioPorCedula(cedula: string): Promise<{
    success: boolean;
    es_pastor_sin_acceso?: boolean;
    pastor?: PastorConsulta;
    message?: string;
  }> {
    const clean = encodeURIComponent(cedula.trim());
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      // 1. Intento con endpoint específico de consulta de usuario
      let resp = await fetch(`${this.baseUrl}/api/v1/auth/consultar-usuario?cedula=${clean}&_t=${Date.now()}`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal,
        cache: 'no-store',
      });

      // 2. Si la ruta no existe (404), fallback transparente a /pastores/buscar
      if (resp.status === 404) {
        resp = await fetch(`${this.baseUrl}/api/v1/pastores/buscar?cedula=${clean}&_t=${Date.now()}`, {
          method: 'GET',
          headers: this.getHeaders(),
          signal: controller.signal,
          cache: 'no-store',
        });
      }

      const json = await resp.json();

      if (!resp.ok || !json.success) {
        return {
          success: false,
          es_pastor_sin_acceso: json.es_pastor_sin_acceso ?? false,
          pastor: json.pastor,
          message: json.message || 'No se encontró ningún pastor con esa cédula.',
        };
      }

      const raw = json.pastor || json.data;
      if (!raw) {
        return {
          success: false,
          message: 'No se encontraron datos del pastor.',
        };
      }

      const usuarioFinal =
        raw.usuario ||
        (raw.email ? raw.email.split('@')[0] : `V-${String(raw.documento).replace(/\D/g, '')}`);

      const pastorData: PastorConsulta = {
        id: raw.id,
        codigo: raw.codigo,
        nombres: raw.nombres || '',
        apellidos: raw.apellidos || '',
        nombre_completo: raw.nombre_completo || `${raw.nombres || ''} ${raw.apellidos || ''}`.trim(),
        documento: raw.documento || cedula,
        email: raw.email || null,
        foto: this.resolveImageUrl(raw.foto),
        zona: raw.zona ? (String(raw.zona).toLowerCase().includes('zona') ? String(raw.zona) : `Zona ${raw.zona}`) : null,
        distrito: raw.distrito ? (String(raw.distrito).toLowerCase().includes('distrito') ? String(raw.distrito) : `Distrito ${raw.distrito}`) : null,
        cargo_nacional: raw.cargo_nacional || 'Pastor',
        usuario: usuarioFinal,
        user_name: raw.user_name || raw.nombre_completo,
        tiene_usuario_activo: raw.tiene_usuario_activo ?? true,
      };

      return {
        success: true,
        pastor: pastorData,
      };
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        return { success: false, message: 'Tiempo de espera agotado al consultar la cédula.' };
      }
      return { success: false, message: e.message || 'Error de conexión al consultar el pastor.' };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  resolveImageUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const clean = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${clean}`;
  }
}

export const api = new ApiService();

