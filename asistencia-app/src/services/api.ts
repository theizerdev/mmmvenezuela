import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Actividad,
  Pastor,
  AsistenciaPrevia,
  RegistroResponse,
  UltimoEscaneo,
} from '../types';

const STORAGE_API_KEY = '@mmm_asistencia_api_url';

// Lee la URL base del backend desde la variable de entorno EXPO_PUBLIC_API_URL (.env)
export const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.101.102';

class ApiService {
  private baseUrl: string = DEFAULT_API_URL;

  constructor() {
    this.init();
  }

  async init(): Promise<string> {
    try {
      const savedUrl = await AsyncStorage.getItem(STORAGE_API_KEY);
      if (savedUrl) {
        this.baseUrl = savedUrl;
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
  // MÉTODOS PÚBLICOS DEL KIOSCO DE ASISTENCIA
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
}

export const api = new ApiService();
