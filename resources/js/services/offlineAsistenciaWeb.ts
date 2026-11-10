/**
 * Servicio de Almacenamiento Offline (IndexedDB) para el Terminal de Asistencia Web
 * Permite escanear, validar y registrar asistencia 100% sin conexión a internet,
 * sincronizando automáticamente cuando se restablezca la red.
 */

export interface PastorOfflineItem {
    id: number;
    codigo: string | null;
    documento: string | null;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    foto?: string | null;
    nivel_ministerial?: string | null;
    cargo_nacional?: string | null;
    zona?: string | null;
    distrito?: string | null;
    nombre_conyuge?: string | null;
    iglesia?: string | null;
    estado?: string | null;
    municipio?: string | null;
}

export interface AsistenciaOfflineItem {
    temp_id: string;
    actividad_id: number;
    actividad_sesion_id?: number | null;
    pastor_id: number;
    codigo_qr?: string;
    nombre_completo: string;
    documento?: string;
    codigo?: string;
    foto?: string | null;
    zona?: string | null;
    asistio_con_conyuge: boolean;
    metodo: 'qr_carnet' | 'cedula' | 'manual' | 'facial';
    dispositivo: string;
    fecha_registro: string;
    hora_legible: string;
}

const DB_NAME = 'MMM_Asistencia_Web_DB';
const DB_VERSION = 1;
const STORE_PADRON = 'padron';
const STORE_COLA = 'cola_pendientes';
const STORE_PREVIAS = 'asistencias_previas';

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            return reject(new Error('IndexedDB no soportado en este navegador'));
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains(STORE_PADRON)) {
                const store = db.createObjectStore(STORE_PADRON, { keyPath: 'id' });
                store.createIndex('documento', 'documento', { unique: false });
                store.createIndex('codigo', 'codigo', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORE_COLA)) {
                const store = db.createObjectStore(STORE_COLA, { keyPath: 'temp_id' });
                store.createIndex('actividad_id', 'actividad_id', { unique: false });
                store.createIndex('pastor_id', 'pastor_id', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORE_PREVIAS)) {
                const store = db.createObjectStore(STORE_PREVIAS, { keyPath: 'key' });
                store.createIndex('actividad_id', 'actividad_id', { unique: false });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Guarda o actualiza la lista completa de pastores en IndexedDB
 */
export async function guardarPadronEnIndexedDB(pastores: PastorOfflineItem[]): Promise<number> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PADRON, 'readwrite');
        const store = tx.objectStore(STORE_PADRON);

        // Limpiar para actualizar padrón fresco
        store.clear();

        for (const pastor of pastores) {
            store.put(pastor);
        }

        tx.oncomplete = () => {
            try {
                localStorage.setItem('mmm_padron_offline_timestamp', new Date().toISOString());
                localStorage.setItem('mmm_padron_offline_total', String(pastores.length));
            } catch { }
            resolve(pastores.length);
        };
        tx.onerror = () => reject(tx.error);
    });
}

/**
 * Obtiene todos los pastores guardados en IndexedDB
 */
export async function obtenerPadronDeIndexedDB(): Promise<PastorOfflineItem[]> {
    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_PADRON, 'readonly');
            const store = tx.objectStore(STORE_PADRON);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    } catch {
        return [];
    }
}

/**
 * Guarda las asistencias previas para evitar duplicados offline
 */
export async function guardarAsistenciasPreviasIndexedDB(
    actividadId: number,
    asistencias: Array<{ pastor_id: number; actividad_sesion_id?: number | null }>
): Promise<void> {
    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_PREVIAS, 'readwrite');
            const store = tx.objectStore(STORE_PREVIAS);

            for (const a of asistencias) {
                const key = `${actividadId}_${a.pastor_id}_${a.actividad_sesion_id || 'general'}`;
                store.put({ key, actividad_id: actividadId, pastor_id: a.pastor_id, actividad_sesion_id: a.actividad_sesion_id });
            }

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch { }
}

/**
 * Normaliza cadenas para búsqueda de cédula o código
 */
export function limpiarIdentificador(raw: string): { clean: string; soloNumeros: string } {
    let texto = raw.trim();

    // Si viene de una URL ej: https://.../pastor/18816680
    if (texto.includes('/')) {
        const partes = texto.split('/');
        texto = partes[partes.length - 1] || texto;
    }

    // Si viene formato JSON ej: {"id":12,"cedula":"18816680"}
    if (texto.startsWith('{') && texto.endsWith('}')) {
        try {
            const parsed = JSON.parse(texto);
            texto = String(parsed.cedula || parsed.codigo || parsed.id || texto);
        } catch { }
    }

    const clean = texto.replace(/[.\-\s]/g, '').toUpperCase();
    const soloNumeros = texto.replace(/\D/g, '');

    return { clean, soloNumeros };
}

/**
 * Busca un obrero en el padrón local por QR, cédula o código
 */
export function buscarPastorEnPadron(
    rawClave: string,
    padron: PastorOfflineItem[]
): PastorOfflineItem | null {
    if (!rawClave || !padron || padron.length === 0) return null;

    const { clean, soloNumeros } = limpiarIdentificador(rawClave);
    const upperRaw = rawClave.trim().toUpperCase();

    // 1. Coincidencia exacta por código o documento
    const matchExacto = padron.find((p) => {
        const pDoc = (p.documento || '').replace(/[.\-\s]/g, '').toUpperCase();
        const pCod = (p.codigo || '').toUpperCase();
        return pCod === upperRaw || pDoc === clean;
    });

    if (matchExacto) return matchExacto;

    // 2. Coincidencia por solo números (cédula)
    if (soloNumeros.length >= 5) {
        const matchNumeros = padron.find((p) => {
            const pDocNum = (p.documento || '').replace(/\D/g, '');
            return pDocNum === soloNumeros;
        });
        if (matchNumeros) return matchNumeros;
    }

    // 3. Coincidencia por ID numérico si la clave es solo número
    if (/^\d+$/.test(rawClave.trim())) {
        const numId = parseInt(rawClave.trim(), 10);
        const matchId = padron.find((p) => p.id === numId);
        if (matchId) return matchId;
    }

    return null;
}

/**
 * Encola una nueva asistencia offline en IndexedDB
 */
export async function encolarAsistenciaOffline(item: AsistenciaOfflineItem): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_COLA, STORE_PREVIAS], 'readwrite');
        const colaStore = tx.objectStore(STORE_COLA);
        const previasStore = tx.objectStore(STORE_PREVIAS);

        colaStore.put(item);

        // Marcar en asistencias previas para que no permita duplicar
        const key = `${item.actividad_id}_${item.pastor_id}_${item.actividad_sesion_id || 'general'}`;
        previasStore.put({
            key,
            actividad_id: item.actividad_id,
            pastor_id: item.pastor_id,
            actividad_sesion_id: item.actividad_sesion_id,
        });

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

/**
 * Obtiene la cola de asistencias offline pendientes para una actividad
 */
export async function obtenerColaOffline(actividadId: number): Promise<AsistenciaOfflineItem[]> {
    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_COLA, 'readonly');
            const store = tx.objectStore(STORE_COLA);
            const request = store.getAll();

            request.onsuccess = () => {
                const all = (request.result || []) as AsistenciaOfflineItem[];
                resolve(all.filter((item) => item.actividad_id === actividadId));
            };
            request.onerror = () => reject(request.error);
        });
    } catch {
        return [];
    }
}

/**
 * Elimina registros específicos de la cola (cuando ya han sido sincronizados)
 */
export async function eliminarDeColaOffline(tempIds: string[]): Promise<void> {
    if (tempIds.length === 0) return;
    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_COLA, 'readwrite');
            const store = tx.objectStore(STORE_COLA);

            for (const id of tempIds) {
                store.delete(id);
            }

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch { }
}

/**
 * Sincroniza la cola pendiente con el servidor
 */
export async function sincronizarColaOfflineWeb(
    actividadId: number,
    csrfToken: string
): Promise<{
    success: boolean;
    sincronizados: number;
    duplicados: number;
    total_presentes?: number;
    pastor_ids_acreditados?: number[];
    nuevas_asistencias?: any[];
    message?: string;
}> {
    const cola = await obtenerColaOffline(actividadId);
    if (cola.length === 0) {
        return { success: true, sincronizados: 0, duplicados: 0 };
    }

    try {
        const response = await fetch('/admin/actividades/asistencias/sincronizar-lote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                Accept: 'application/json',
            },
            body: JSON.stringify({
                actividad_id: actividadId,
                asistencias: cola.map((item) => ({
                    pastor_id: item.pastor_id,
                    codigo_qr: item.codigo_qr || item.documento || item.codigo,
                    actividad_sesion_id: item.actividad_sesion_id,
                    asistio_con_conyuge: item.asistio_con_conyuge,
                    metodo: item.metodo,
                    dispositivo: item.dispositivo,
                    fecha_registro: item.fecha_registro,
                })),
            }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Eliminar de la cola local los que ya se sincronizaron
            const tempIds = cola.map((c) => c.temp_id);
            await eliminarDeColaOffline(tempIds);

            return {
                success: true,
                sincronizados: data.sincronizados ?? cola.length,
                duplicados: data.duplicados ?? 0,
                total_presentes: data.total_presentes,
                pastor_ids_acreditados: data.pastor_ids_acreditados,
                nuevas_asistencias: data.nuevas_asistencias,
                message: data.message,
            };
        } else {
            return {
                success: false,
                sincronizados: 0,
                duplicados: 0,
                message: data.message || 'Error al sincronizar con el servidor',
            };
        }
    } catch (err: any) {
        return {
            success: false,
            sincronizados: 0,
            duplicados: 0,
            message: 'No se pudo conectar con el servidor para sincronizar.',
        };
    }
}

