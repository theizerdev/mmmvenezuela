import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthResponse,
  PresbiteroDashboardData,
  SupervisorDashboardData,
  Actividad,
} from '../types';

export const DEFAULT_API_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://mmmvenezuela.test').replace(/\/+$/, '');
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
    };
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  async login(usuario: string, password: string): Promise<AuthResponse> {
    try {
      const resp = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          login: usuario,
          usuario: usuario,
          password: password,
        }),
      });
      const data = await resp.json();
      if (data.success && data.token) {
        this.setAuthToken(data.token);
      }
      return data;
    } catch (e: any) {
      return { success: false, message: e.message || 'Error de conexión con el servidor nacional' };
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

    const resp = await fetch(`${this.baseUrl}/api/v1/presbitero/dashboard?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    return resp.json();
  }

  async getSupervisorDashboard(actividadId?: number): Promise<SupervisorDashboardData> {
    const params = new URLSearchParams();
    if (actividadId) params.append('actividad_id', String(actividadId));

    const resp = await fetch(`${this.baseUrl}/api/v1/supervisor/dashboard?${params.toString()}`, {
      headers: this.getHeaders(),
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
      let resp = await fetch(`${this.baseUrl}/api/v1/actividades/activas`, {
        headers: this.getHeaders(),
      });
      if (!resp.ok) {
        resp = await fetch(`${this.baseUrl}/api/v1/actividades`, {
          headers: this.getHeaders(),
        });
      }
      const json = await resp.json();
      return { success: json.success ?? true, data: json.actividades || json.data || [] };
    } catch {
      return { success: false, data: [] };
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

