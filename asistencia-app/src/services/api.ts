import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Actividad,
  Pastor,
  AsistenciaPrevia,
  RegistroResponse,
  UltimoEscaneo,
  AuthResponse,
  PresbiteroDashboardData,
  SupervisorDashboardData,
} from '../types';

const STORAGE_API_KEY = '@mmm_asistencia_api_url';
const STORAGE_AUTH_TOKEN_KEY = '@mmm_asistencia_auth_token';

// Lee la URL base del backend desde la variable de entorno EXPO_PUBLIC_API_URL (.env)
export const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.101.102';

class ApiService {
  private baseUrl: string = DEFAULT_API_URL;
  private authToken: string | null = null;

  constructor() {
    this.init();
  }

  async init(): Promise<string> {
    try {
      const [savedUrl, savedToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_API_KEY),
        AsyncStorage.getItem(STORAGE_AUTH_TOKEN_KEY),
      ]);

      if (savedUrl) {
        this.baseUrl = savedUrl;
      }
      if (savedToken) {
        this.authToken = savedToken;
      }
    } catch (e) {
      console.warn('Error inicializando ApiService:', e);
    }
    return this.baseUrl;
  }

  async setBaseUrl(url: string): Promise<void> {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    this.baseUrl = cleanUrl;
    await AsyncStorage.setItem(STORAGE_API_KEY, cleanUrl);
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
    if (token) {
      AsyncStorage.setItem(STORAGE_AUTH_TOKEN_KEY, token);
    } else {
      AsyncStorage.removeItem(STORAGE_AUTH_TOKEN_KEY);
    }
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  resolveImageUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = this.baseUrl.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000); // 9s timeout

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      return data as T;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Tiempo de espera agotado al conectar con el servidor.');
      }
      throw new Error(error.message || 'Error de conexión con el servidor.');
    }
  }

  // ----------------------------------------------------------------------
  // 1. MÉTODOS PÚBLICOS (KIOSCO)
  // ----------------------------------------------------------------------

  async getActividadesActivas(): Promise<{ success: boolean; actividades: Actividad[] }> {
    return this.request<{ success: boolean; actividades: Actividad[] }>('/actividades/activas');
  }

  async buscarPastor(
    cedulaOCodigo: string,
    actividadId?: number,
    sesionId?: number
  ): Promise<{
    success: boolean;
    encontrado: boolean;
    message?: string;
    pastor?: Pastor;
    ya_registrado?: boolean;
    asistencia_previa?: AsistenciaPrevia | null;
  }> {
    const query = new URLSearchParams({
      cedula: cedulaOCodigo,
      ...(actividadId ? { actividad_id: actividadId.toString() } : {}),
      ...(sesionId ? { actividad_sesion_id: sesionId.toString() } : {}),
    });

    return this.request(`/pastores/buscar?${query.toString()}`);
  }

  async registrarAsistencia(params: {
    actividad_id: number;
    actividad_sesion_id?: number | null;
    identificador?: string;
    codigo_qr?: string;
    cedula?: string;
    pastor_id?: number;
    asistio_con_conyuge: boolean;
    metodo: 'qr' | 'manual';
    kit_entregado?: boolean;
    comida_entregada?: boolean;
  }): Promise<RegistroResponse> {
    return this.request<RegistroResponse>('/asistencias/registrar', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getUltimosEscaneos(actividadId: number): Promise<{ success: boolean; ultimos: UltimoEscaneo[] }> {
    return this.request<{ success: boolean; ultimos: UltimoEscaneo[] }>(`/actividades/${actividadId}/ultimos-escaneos`);
  }

  async testConnection(testUrl: string): Promise<boolean> {
    const cleanUrl = testUrl.trim().replace(/\/+$/, '');
    const url = `${cleanUrl}/api/v1/actividades/activas`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      clearTimeout(timeoutId);
      return false;
    }
  }

  // ----------------------------------------------------------------------
  // 2. MÉTODOS DE AUTENTICACIÓN Y LIDERAZGO
  // ----------------------------------------------------------------------

  async login(login: string, password: string, expoPushToken?: string | null): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        login,
        password,
        expo_push_token: expoPushToken || null,
      }),
    });

    if (res.success && res.token) {
      this.setAuthToken(res.token);
    }
    return res;
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignorar error si no había conexión activa
    } finally {
      this.setAuthToken(null);
    }
    return { success: true, message: 'Sesión cerrada' };
  }

  async updatePushSettings(params: {
    expo_push_token?: string | null;
    push_notificaciones_activas?: boolean;
    push_modo_silencioso?: boolean;
  }): Promise<{ success: boolean }> {
    return this.request('/auth/push-settings', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getPresbiteroDashboard(
    actividadId?: number,
    sesionId?: number,
    zona?: string
  ): Promise<PresbiteroDashboardData> {
    const query = new URLSearchParams({
      ...(actividadId ? { actividad_id: actividadId.toString() } : {}),
      ...(sesionId ? { actividad_sesion_id: sesionId.toString() } : {}),
      ...(zona ? { zona } : {}),
    });

    return this.request<PresbiteroDashboardData>(`/presbitero/dashboard?${query.toString()}`);
  }

  async getSupervisorDashboard(actividadId?: number): Promise<SupervisorDashboardData> {
    const query = new URLSearchParams({
      ...(actividadId ? { actividad_id: actividadId.toString() } : {}),
    });

    return this.request<SupervisorDashboardData>(`/supervisor/dashboard?${query.toString()}`);
  }
}

export const api = new ApiService();
