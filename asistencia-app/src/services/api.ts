import AsyncStorage from '@react-native-async-storage/async-storage';
import padronSeed from '../data/padron-seed.json';
import {
  Actividad,
  Pastor,
  AsistenciaPrevia,
  RegistroResponse,
  UltimoEscaneo,
  PendingOfflineAsistencia,
  DeviceHistoryItem,
} from '../types';

const STORAGE_API_KEY = '@mmm_asistencia_api_url';
const STORAGE_CACHE_ACTIVIDADES = '@mmm_asistencia_cache_actividades';
const STORAGE_CACHE_PADRON = '@mmm_asistencia_cache_padron';
const STORAGE_CACHE_PREVIAS = '@mmm_asistencia_cache_previas';
const STORAGE_OFFLINE_QUEUE = '@mmm_asistencia_offline_queue';
const STORAGE_DEVICE_NAME = '@mmm_asistencia_device_name';
const STORAGE_DEVICE_HISTORY = '@mmm_asistencia_device_history';

const FALLBACK_ACTIVIDAD_SEED: Actividad[] = [
  {
    id: 1,
    nombre: 'Convención Nacional 2026',
    tipo: 'Convención',
    estado: 'en_curso',
    activa: true,
    fecha_inicio: '12/11/2026',
    fecha_fin: '15/11/2026',
    lugar: 'Barquisimeto',
    zona: null,
    permite_conyuge: true,
    controla_comida: false,
    total_presentes: 0,
    sesion_activa: {
      id: 1,
      nombre: 'Culto de Apertura / Noche',
      fecha_hora_inicio: '2026-10-21T12:00:00.000000Z',
      fecha_hora_fin: '2026-10-21T12:00:00.000000Z',
      es_obligatoria: true,
      tipo_comida: 'ninguna',
    },
    sesiones: [
      {
        id: 1,
        nombre: 'Culto de Apertura / Noche',
        fecha_hora_inicio: '2026-10-21T12:00:00.000000Z',
        fecha_hora_fin: '2026-10-21T12:00:00.000000Z',
        es_obligatoria: true,
        tipo_comida: 'ninguna',
      },
    ],
  },
];

interface CachedAsistenciaPrevia {
  id: number | string;
  pastor_id: number;
  actividad_id: number;
  actividad_sesion_id?: number | null;
  hora: string;
  asistio_con_conyuge: boolean;
  kit_entregado?: boolean;
  comida_entregada?: boolean;
}

function resolveDefaultApiUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'https://mmmvenezuela.test';
    }
    return window.location.origin.replace(/\/+$/, '');
  }
  return (process.env.EXPO_PUBLIC_API_URL || 'https://saprcoe.mmmvenezuela.org').replace(/\/+$/, '');
}

// Lee la URL base del backend automáticamente según el entorno
export const DEFAULT_API_URL = resolveDefaultApiUrl();

function normalizeText(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function extraerIdentificadorDeQr(raw: string): string {
  const data = (raw || '').trim();
  const matchPath = data.match(/\/validar-credencial\/([^/?#\s]+)/i);
  if (matchPath && matchPath[1]) {
    return decodeURIComponent(matchPath[1]);
  }
  const matchQuery = data.match(/[?&](?:codigo|id|doc)=([^&#\s]+)/i);
  if (matchQuery && matchQuery[1]) {
    return decodeURIComponent(matchQuery[1]);
  }
  return data;
}

class ApiService {
  private baseUrl: string = DEFAULT_API_URL;
  // Padrón Nacional pre-cargado de fábrica (899 pastores) para disponibilidad 100% inmediata en modo Offline
  private padronMemory: Pastor[] = (padronSeed as unknown as Pastor[]) || [];
  private previasMemory: CachedAsistenciaPrevia[] = [];
  private offlineQueueMemory: PendingOfflineAsistencia[] = [];
  private deviceName: string = 'Terminal Puerta #1';
  private deviceHistory: DeviceHistoryItem[] = [];
  private isSyncing: boolean = false;

  constructor() {
    this.init();
  }

  async init(): Promise<string> {
    try {
      const savedUrl = await AsyncStorage.getItem(STORAGE_API_KEY);
      if (savedUrl && savedUrl !== 'http://192.168.101.102') {
        this.baseUrl = savedUrl;
      } else if (savedUrl === 'http://192.168.101.102') {
        this.baseUrl = DEFAULT_API_URL;
        await AsyncStorage.removeItem(STORAGE_API_KEY);
      }

      const [rawPadron, rawPrevias, rawQueue, savedDeviceName, rawHistory] = await Promise.all([
        AsyncStorage.getItem(STORAGE_CACHE_PADRON),
        AsyncStorage.getItem(STORAGE_CACHE_PREVIAS),
        AsyncStorage.getItem(STORAGE_OFFLINE_QUEUE),
        AsyncStorage.getItem(STORAGE_DEVICE_NAME),
        AsyncStorage.getItem(STORAGE_DEVICE_HISTORY),
      ]);

      if (savedDeviceName) {
        this.deviceName = savedDeviceName;
      }
      if (rawHistory) {
        this.deviceHistory = JSON.parse(rawHistory);
      }

      if (rawPadron) {
        const parsed: Pastor[] = JSON.parse(rawPadron);
        if (Array.isArray(parsed) && parsed.length >= this.padronMemory.length) {
          this.padronMemory = parsed;
        }
      }
      if (rawPrevias) {
        this.previasMemory = JSON.parse(rawPrevias);
      }
      if (rawQueue) {
        this.offlineQueueMemory = JSON.parse(rawQueue);
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

  getPadronCount(): number {
    return this.padronMemory.length;
  }

  getPendingQueueCount(): number {
    return this.offlineQueueMemory.length;
  }

  getPendingQueue(): PendingOfflineAsistencia[] {
    return this.offlineQueueMemory;
  }

  getDeviceName(): string {
    return this.deviceName;
  }

  async setDeviceName(name: string): Promise<void> {
    const clean = (name || '').trim();
    this.deviceName = clean || 'Terminal Móvil';
    await AsyncStorage.setItem(STORAGE_DEVICE_NAME, this.deviceName);
  }

  getDeviceHistory(): DeviceHistoryItem[] {
    return this.deviceHistory;
  }

  async clearDeviceHistory(): Promise<void> {
    this.deviceHistory = [];
    await AsyncStorage.removeItem(STORAGE_DEVICE_HISTORY);
  }

  private async addDeviceHistoryEntry(entry: DeviceHistoryItem): Promise<void> {
    const filtered = this.deviceHistory.filter((h) => h.id !== entry.id);
    this.deviceHistory = [entry, ...filtered].slice(0, 200);
    try {
      await AsyncStorage.setItem(STORAGE_DEVICE_HISTORY, JSON.stringify(this.deviceHistory));
    } catch (e) {
      console.warn('Error guardando historial del dispositivo:', e);
    }
  }

  private async markDeviceHistoryAsSynced(pastorId: number, hora?: string): Promise<void> {
    let changed = false;
    this.deviceHistory = this.deviceHistory.map((h) => {
      if (h.pastor_id === pastorId && h.estado === 'en_cola_offline') {
        changed = true;
        return {
          ...h,
          estado: 'sincronizado' as const,
          hora: hora || h.hora,
        };
      }
      return h;
    });
    if (changed) {
      try {
        await AsyncStorage.setItem(STORAGE_DEVICE_HISTORY, JSON.stringify(this.deviceHistory));
      } catch (e) {
        console.warn('Error actualizando historial del dispositivo:', e);
      }
    }
  }

  resolveImageUrl(path?: string | null): string | null {
    if (!path) return null;
    let clean = path.trim();
    if (clean.includes('/pastores/')) {
      clean = '/pastores/' + clean.split('/pastores/')[1];
    }
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    const base = this.baseUrl.replace(/\/+$/, '');
    const cleanPath = clean.startsWith('/') ? clean : `/${clean}`;
    return `${base}${cleanPath}`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, timeoutMs = 8000): Promise<T> {
    const url = `${this.baseUrl}/api/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
  // 1. ACTIVIDADES ACTIVAS (CON CACHÉ OFFLINE + SEMILLA INTEGRADA)
  // ----------------------------------------------------------------------

  async getActividadesActivas(): Promise<{
    success: boolean;
    actividades: Actividad[];
    fromCache?: boolean;
  }> {
    try {
      const res = await this.request<{ success: boolean; actividades: Actividad[] }>(
        '/actividades/activas',
        {},
        6000
      );
      if (res && res.success) {
        await AsyncStorage.setItem(STORAGE_CACHE_ACTIVIDADES, JSON.stringify(res.actividades));
        return { ...res, fromCache: false };
      }
      return res;
    } catch {
      const cached = await AsyncStorage.getItem(STORAGE_CACHE_ACTIVIDADES);
      if (cached) {
        const actividades: Actividad[] = JSON.parse(cached);
        if (Array.isArray(actividades) && actividades.length > 0) {
          return {
            success: true,
            actividades,
            fromCache: true,
          };
        }
      }
      return {
        success: true,
        actividades: FALLBACK_ACTIVIDAD_SEED,
        fromCache: true,
      };
    }
  }

  // ----------------------------------------------------------------------
  // 2. ACTUALIZACIÓN DEL PADRÓN OFFLINE DESDE EL SERVIDOR
  // ----------------------------------------------------------------------

  async sincronizarPadronOffline(actividadId?: number): Promise<{
    ok: boolean;
    total: number;
  }> {
    try {
      const query = actividadId ? `?actividad_id=${actividadId}` : '';
      const res = await this.request<{
        success: boolean;
        pastores: Pastor[];
        asistencias_previas?: Array<{
          id: number;
          pastor_id: number;
          actividad_sesion_id?: number | null;
          hora: string;
          asistio_con_conyuge: boolean;
          kit_entregado?: boolean;
          comida_entregada?: boolean;
        }>;
      }>(`/pastores/padron-offline${query}`, {}, 10000);

      if (res && res.success && Array.isArray(res.pastores) && res.pastores.length > 0) {
        this.padronMemory = res.pastores;
        await AsyncStorage.setItem(STORAGE_CACHE_PADRON, JSON.stringify(res.pastores));

        if (actividadId && Array.isArray(res.asistencias_previas)) {
          const otrasActividades = this.previasMemory.filter((p) => p.actividad_id !== actividadId);
          const nuevasPrevias: CachedAsistenciaPrevia[] = res.asistencias_previas.map((a) => ({
            ...a,
            actividad_id: actividadId,
          }));
          this.previasMemory = [...otrasActividades, ...nuevasPrevias];
          await AsyncStorage.setItem(STORAGE_CACHE_PREVIAS, JSON.stringify(this.previasMemory));
        }

        return { ok: true, total: res.pastores.length };
      }
    } catch {
      // Si el servidor está offline o aún no tiene el endpoint nuevo, mantiene los 899 pastores integrados
    }
    return { ok: false, total: this.padronMemory.length };
  }

  private async upsertPastoresToCache(pastores: Pastor[]) {
    if (!pastores || pastores.length === 0) return;
    const map = new Map<number, Pastor>();
    for (const p of this.padronMemory) {
      map.set(p.id, p);
    }
    for (const p of pastores) {
      map.set(p.id, p);
    }
    this.padronMemory = Array.from(map.values());
    try {
      await AsyncStorage.setItem(STORAGE_CACHE_PADRON, JSON.stringify(this.padronMemory));
    } catch {}
  }

  private checkLocalRegistration(
    pastorId: number,
    actividadId?: number,
    sesionId?: number | null
  ): AsistenciaPrevia | null {
    if (!actividadId) return null;

    // 1. Revisar en la cola pendiente de sincronización
    const inQueue = this.offlineQueueMemory.find(
      (q) =>
        q.actividad_id === actividadId &&
        q.pastor_id === pastorId &&
        (!sesionId || !q.actividad_sesion_id || q.actividad_sesion_id === sesionId)
    );
    if (inQueue) {
      return {
        id: Date.now(),
        hora: `${inQueue.hora_legible} (Offline)`,
        asistio_con_conyuge: inQueue.asistio_con_conyuge,
        kit_entregado: false,
        comida_entregada: false,
      };
    }

    // 2. Revisar en el caché de asistencias previas descargadas
    const inPrevias = this.previasMemory.find(
      (p) =>
        p.actividad_id === actividadId &&
        p.pastor_id === pastorId &&
        (!sesionId || !p.actividad_sesion_id || p.actividad_sesion_id === sesionId)
    );
    if (inPrevias) {
      return {
        id: Number(inPrevias.id) || 1,
        hora: inPrevias.hora,
        asistio_con_conyuge: inPrevias.asistio_con_conyuge,
        kit_entregado: !!inPrevias.kit_entregado,
        comida_entregada: !!inPrevias.comida_entregada,
      };
    }

    return null;
  }

  // ----------------------------------------------------------------------
  // 3. BÚSQUEDA DE PASTOR (ONLINE + RESPALDO INSTANTÁNEO EN LOS 899 PASTORES)
  // ----------------------------------------------------------------------

  async buscarPastor(
    cedulaOCodigo: string,
    actividadId?: number,
    sesionId?: number,
    pastorId?: number
  ): Promise<{
    success: boolean;
    encontrado: boolean;
    offline?: boolean;
    multiple?: boolean;
    resultados?: Pastor[];
    message?: string;
    pastor?: Pastor;
    ya_registrado?: boolean;
    asistencia_previa?: AsistenciaPrevia | null;
  }> {
    let searchCedula = cedulaOCodigo;
    if (pastorId) {
      const localTarget = this.padronMemory.find((p) => p.id === pastorId);
      if (localTarget) {
        searchCedula = localTarget.documento || localTarget.codigo || String(pastorId);
      }
    }

    const query = new URLSearchParams({
      cedula: searchCedula,
      ...(pastorId ? { pastor_id: pastorId.toString() } : {}),
      ...(actividadId ? { actividad_id: actividadId.toString() } : {}),
      ...(sesionId ? { actividad_sesion_id: sesionId.toString() } : {}),
    });

    try {
      const res = await this.request<{
        success: boolean;
        encontrado: boolean;
        multiple?: boolean;
        resultados?: Pastor[];
        message?: string;
        pastor?: Pastor;
        ya_registrado?: boolean;
        asistencia_previa?: AsistenciaPrevia | null;
      }>(`/pastores/buscar?${query.toString()}`, {}, 5000);

      if (res.pastor) {
        this.upsertPastoresToCache([res.pastor]);
        const localReg = this.checkLocalRegistration(res.pastor.id, actividadId, sesionId);
        if (localReg && !res.ya_registrado) {
          res.ya_registrado = true;
          res.asistencia_previa = localReg;
        }
        return { ...res, offline: false };
      }

      if (res.resultados && res.resultados.length > 0) {
        this.upsertPastoresToCache(res.resultados);
        return { ...res, offline: false };
      }

      // Si el servidor aún no tiene el buscador por nombres desplegado, buscar en el padrón local
      const localFallback = this.buscarPastorEnCacheOffline(
        cedulaOCodigo,
        actividadId,
        sesionId,
        pastorId
      );
      if (localFallback.encontrado) {
        return localFallback;
      }

      return { ...res, offline: false };
    } catch {
      // SIN CONEXIÓN A INTERNET: Buscar directamente en el padrón local de 899 pastores
      return this.buscarPastorEnCacheOffline(cedulaOCodigo, actividadId, sesionId, pastorId);
    }
  }

  private buscarPastorEnCacheOffline(
    term: string,
    actividadId?: number,
    sesionId?: number,
    pastorId?: number
  ): {
    success: boolean;
    encontrado: boolean;
    offline: boolean;
    multiple?: boolean;
    resultados?: Pastor[];
    message?: string;
    pastor?: Pastor;
    ya_registrado?: boolean;
    asistencia_previa?: AsistenciaPrevia | null;
  } {
    let matchedPastor: Pastor | undefined;

    if (pastorId) {
      matchedPastor = this.padronMemory.find((p) => p.id === pastorId);
    } else {
      const clave = extraerIdentificadorDeQr(term);
      const cleanClave = clave.replace(/[.\-\s]/g, '').toUpperCase();
      const soloNumeros = clave.replace(/\D/g, '');

      // 1. Coincidencia exacta por código o documento
      matchedPastor = this.padronMemory.find((p) => {
        const docClean = (p.documento || '').replace(/[.\-\s]/g, '').toUpperCase();
        const docDigits = (p.documento || '').replace(/\D/g, '');
        const codClean = (p.codigo || '').trim().toUpperCase();

        if (codClean && codClean === clave.toUpperCase()) return true;
        if (docClean && docClean === cleanClave) return true;
        if (soloNumeros.length >= 5 && docDigits === soloNumeros) return true;
        return false;
      });

      // 2. Coincidencia parcial por documento o por nombre/apellido
      if (!matchedPastor) {
        const palabras = normalizeText(clave)
          .split(/\s+/)
          .filter((w) => w.length >= 2);

        const matches = this.padronMemory
          .filter((p) => {
            const docDigits = (p.documento || '').replace(/\D/g, '');
            if (soloNumeros.length >= 4 && docDigits.includes(soloNumeros)) {
              return true;
            }
            if (palabras.length > 0 && /[a-z]/i.test(clave)) {
              const fullNorm = normalizeText(`${p.nombres} ${p.apellidos} ${p.nombre_completo}`);
              return palabras.every((w) => fullNorm.includes(w));
            }
            return false;
          })
          .slice(0, 8);

        if (matches.length === 1) {
          matchedPastor = matches[0];
        } else if (matches.length > 1) {
          return {
            success: true,
            encontrado: true,
            offline: true,
            multiple: true,
            resultados: matches,
          };
        }
      }
    }

    if (!matchedPastor) {
      return {
        success: false,
        encontrado: false,
        offline: true,
        message: `No se encontró ningún obrero con "${term}".`,
      };
    }

    const asistenciaPrevia = this.checkLocalRegistration(matchedPastor.id, actividadId, sesionId);

    return {
      success: true,
      encontrado: true,
      offline: true,
      multiple: false,
      pastor: matchedPastor,
      ya_registrado: !!asistenciaPrevia,
      asistencia_previa: asistenciaPrevia,
    };
  }

  // ----------------------------------------------------------------------
  // 4. REGISTRAR ASISTENCIA (ONLINE O EN COLA OFFLINE AUTOMÁTICA)
  // ----------------------------------------------------------------------

  async registrarAsistencia(
    params: {
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
    },
    pastorFallback?: Pastor,
    sesionNombre?: string
  ): Promise<RegistroResponse> {
    try {
      const res = await this.request<RegistroResponse>(
        '/asistencias/registrar',
        {
          method: 'POST',
          body: JSON.stringify({
            ...params,
            dispositivo: this.deviceName,
          }),
        },
        6000
      );

      const targetPastor = res.pastor || pastorFallback || (params.pastor_id ? this.padronMemory.find(p => p.id === params.pastor_id) : undefined);

      if (res.success && params.pastor_id) {
        this.previasMemory.push({
          id: res.asistencia?.id || Date.now(),
          pastor_id: params.pastor_id,
          actividad_id: params.actividad_id,
          actividad_sesion_id: params.actividad_sesion_id,
          hora: res.asistencia?.hora || new Date().toLocaleTimeString(),
          asistio_con_conyuge: params.asistio_con_conyuge,
        });
        await AsyncStorage.setItem(STORAGE_CACHE_PREVIAS, JSON.stringify(this.previasMemory));
      }

      if (targetPastor) {
        const now = new Date();
        const horaStr = res.asistencia?.hora || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        await this.addDeviceHistoryEntry({
          id: `dev_${now.getTime()}_${targetPastor.id}`,
          pastor_id: targetPastor.id,
          nombre_completo: targetPastor.nombre_completo,
          documento: targetPastor.documento,
          codigo: targetPastor.codigo,
          foto: targetPastor.foto,
          zona: targetPastor.zona,
          extension_nombre: targetPastor.extension_nombre || targetPastor.iglesia,
          sesion: sesionNombre || 'General',
          hora: horaStr,
          asistio_con_conyuge: params.asistio_con_conyuge,
          estado: 'sincronizado',
          fecha_iso: now.toISOString(),
        });
      }

      return res;
    } catch (networkErr: any) {
      // MODO OFFLINE: Guardar en la cola local para sincronización automática
      const pastor =
        pastorFallback ||
        this.padronMemory.find((p) => p.id === params.pastor_id);

      if (!pastor) {
        throw networkErr;
      }

      const existing = this.checkLocalRegistration(
        pastor.id,
        params.actividad_id,
        params.actividad_sesion_id
      );

      if (existing) {
        return {
          success: false,
          ya_registrado: true,
          message: `Ya registrado en este dispositivo a las ${existing.hora}`,
          pastor,
          asistencia: {
            id: existing.id,
            hora: existing.hora,
            asistio_con_conyuge: existing.asistio_con_conyuge,
          },
        };
      }

      const now = new Date();
      const horaLegible = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const pendingItem: PendingOfflineAsistencia = {
        uid: `off_${now.getTime()}_${pastor.id}`,
        actividad_id: params.actividad_id,
        actividad_sesion_id: params.actividad_sesion_id,
        pastor_id: pastor.id,
        asistio_con_conyuge: params.asistio_con_conyuge,
        metodo: params.metodo,
        fecha_registro: now.toISOString(),
        hora_legible: horaLegible,
        sesion_nombre: sesionNombre || 'General',
        pastor,
      };

      this.offlineQueueMemory = [pendingItem, ...this.offlineQueueMemory];
      await AsyncStorage.setItem(STORAGE_OFFLINE_QUEUE, JSON.stringify(this.offlineQueueMemory));

      // Guardar también en el histórico local de este dispositivo
      await this.addDeviceHistoryEntry({
        id: pendingItem.uid,
        pastor_id: pastor.id,
        nombre_completo: pastor.nombre_completo,
        documento: pastor.documento,
        codigo: pastor.codigo,
        foto: pastor.foto,
        zona: pastor.zona,
        extension_nombre: pastor.extension_nombre || pastor.iglesia,
        sesion: sesionNombre || 'General',
        hora: `${horaLegible} (Offline)`,
        asistio_con_conyuge: params.asistio_con_conyuge,
        estado: 'en_cola_offline',
        fecha_iso: now.toISOString(),
      });

      return {
        success: true,
        guardado_offline: true,
        message: 'Acreditado en Modo Offline. Se sincronizará automáticamente al recuperar conexión.',
        pastor,
        asistencia: {
          id: pendingItem.uid,
          hora: `${horaLegible} (Offline)`,
          asistio_con_conyuge: params.asistio_con_conyuge,
          conyuge_nombre: pastor.nombre_conyuge,
        },
      };
    }
  }

  // ----------------------------------------------------------------------
  // 5. SINCRONIZACIÓN DE LA COLA OFFLINE CON EL SERVIDOR
  // ----------------------------------------------------------------------

  async sincronizarColaOffline(): Promise<{
    synced: number;
    pending: number;
    lastTotalPresentes?: number;
  }> {
    if (this.isSyncing || this.offlineQueueMemory.length === 0) {
      return { synced: 0, pending: this.offlineQueueMemory.length };
    }

    this.isSyncing = true;
    let syncedCount = 0;
    let lastTotalPresentes: number | undefined;
    const remaining: PendingOfflineAsistencia[] = [];

    try {
      const queueCopy = [...this.offlineQueueMemory].reverse();

      // Desduplicar en memoria por clave única (actividad_id + pastor_id + actividad_sesion_id)
      const seenKeys = new Set<string>();
      const uniqueQueue: PendingOfflineAsistencia[] = [];
      for (const item of queueCopy) {
        const key = `${item.actividad_id}_${item.pastor_id}_${item.actividad_sesion_id || 'general'}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueQueue.push(item);
        }
      }

      for (let i = 0; i < uniqueQueue.length; i++) {
        const item = uniqueQueue[i];
        try {
          const res = await this.request<RegistroResponse>(
            '/asistencias/registrar',
            {
              method: 'POST',
              body: JSON.stringify({
                actividad_id: item.actividad_id,
                actividad_sesion_id: item.actividad_sesion_id,
                pastor_id: item.pastor_id,
                cedula: item.pastor?.documento || item.pastor?.codigo,
                asistio_con_conyuge: item.asistio_con_conyuge,
                metodo: item.metodo,
                dispositivo: this.deviceName,
                fecha_registro: item.fecha_registro,
              }),
            },
            7000
          );

          if (res.success || res.ya_registrado) {
            syncedCount++;
            if (typeof res.total_presentes === 'number') {
              lastTotalPresentes = res.total_presentes;
            }
            this.previasMemory.push({
              id: res.asistencia?.id || Date.now(),
              pastor_id: item.pastor_id,
              actividad_id: item.actividad_id,
              actividad_sesion_id: item.actividad_sesion_id,
              hora: item.hora_legible,
              asistio_con_conyuge: item.asistio_con_conyuge,
            });

            await this.markDeviceHistoryAsSynced(item.pastor_id, item.hora_legible);
          } else {
            remaining.push(item);
          }
        } catch {
          remaining.push(...uniqueQueue.slice(i));
          break;
        }
      }

      this.offlineQueueMemory = remaining.reverse();
      await Promise.all([
        AsyncStorage.setItem(STORAGE_OFFLINE_QUEUE, JSON.stringify(this.offlineQueueMemory)),
        AsyncStorage.setItem(STORAGE_CACHE_PREVIAS, JSON.stringify(this.previasMemory)),
      ]);
    } finally {
      this.isSyncing = false;
    }

    return {
      synced: syncedCount,
      pending: this.offlineQueueMemory.length,
      lastTotalPresentes,
    };
  }

  // ----------------------------------------------------------------------
  // 6. ÚLTIMOS ESCANEOS (COMBINANDO PENDIENTES OFFLINE + SERVIDOR)
  // ----------------------------------------------------------------------

  getOfflineQueueAsUltimosEscaneos(actividadId: number): UltimoEscaneo[] {
    return this.offlineQueueMemory
      .filter((q) => q.actividad_id === actividadId)
      .map((q) => ({
        id: q.uid,
        pastor_id: q.pastor_id,
        nombre_completo: q.pastor.nombre_completo,
        documento: q.pastor.documento,
        codigo: q.pastor.codigo,
        foto: q.pastor.foto,
        zona: q.pastor.zona,
        extension_nombre: q.pastor.extension_nombre || q.pastor.iglesia,
        extension_estado: q.pastor.extension_estado || q.pastor.estado || 'Venezuela',
        sesion: q.sesion_nombre || 'En cola Offline',
        hora: q.hora_legible,
        asistio_con_conyuge: q.asistio_con_conyuge,
        pendiente_sync: true,
      }));
  }

  async getUltimosEscaneos(actividadId: number): Promise<{ success: boolean; ultimos: UltimoEscaneo[] }> {
    const pendientesLocales = this.getOfflineQueueAsUltimosEscaneos(actividadId);
    try {
      const res = await this.request<{ success: boolean; ultimos: UltimoEscaneo[] }>(
        `/actividades/${actividadId}/ultimos-escaneos`,
        {},
        6000
      );
      if (res.success && Array.isArray(res.ultimos)) {
        return {
          success: true,
          ultimos: [...pendientesLocales, ...res.ultimos].slice(0, 12),
        };
      }
    } catch {}

    return {
      success: true,
      ultimos: pendientesLocales,
    };
  }

  async ejecutarSincronizacionCompleta(
    onProgress?: (paso: string, porcentaje: number) => void
  ): Promise<{
    online: boolean;
    pastoresCount: number;
    actividadesCount: number;
    syncedQueueCount: number;
    pendingQueueCount: number;
  }> {
    onProgress?.('Verificando conexión con el servidor central...', 15);
    const online = await this.testConnection(this.baseUrl);

    onProgress?.('Sincronizando Padrón Nacional de Obreros...', 45);
    const padronResult = await this.sincronizarPadronOffline();

    onProgress?.('Descargando actividades y sesiones vigentes...', 70);
    const actResult = await this.getActividadesActivas();

    let syncedQueueCount = 0;
    if (online && this.offlineQueueMemory.length > 0) {
      onProgress?.('Sincronizando registros offline acumulados...', 88);
      const queueRes = await this.sincronizarColaOffline();
      syncedQueueCount = queueRes.synced;
    }

    onProgress?.('¡Sincronización completada con éxito!', 100);

    return {
      online,
      pastoresCount: padronResult.total,
      actividadesCount: actResult.actividades?.length || 0,
      syncedQueueCount,
      pendingQueueCount: this.offlineQueueMemory.length,
    };
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
