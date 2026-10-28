export interface Sesion {
  id: number;
  nombre: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  es_obligatoria: boolean;
  tipo_comida?: string | null;
}

export interface Actividad {
  id: number;
  nombre: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  lugar: string | null;
  zona: string | null;
  permite_conyuge: boolean;
  controla_comida: boolean;
  total_presentes: number;
  sesion_activa: Sesion | null;
  sesiones: Sesion[];
}

export interface Pastor {
  id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  documento: string;
  foto: string | null;
  nivel_ministerial: string;
  cargo_nacional: string | null;
  zona: string | null;
  distrito: string | null;
  extension_nombre: string;
  extension_estado: string;
  iglesia: string;
  estado: string | null;
  municipio: string | null;
  nombre_conyuge: string | null;
  tiene_conyuge: boolean;
}

export interface AsistenciaPrevia {
  id: number;
  hora: string;
  asistio_con_conyuge: boolean;
  kit_entregado: boolean;
  comida_entregada: boolean;
}

export interface UltimoEscaneo {
  id: number;
  pastor_id: number;
  nombre_completo: string;
  documento: string;
  codigo: string;
  foto: string | null;
  zona: string | null;
  extension_nombre: string;
  extension_estado: string;
  sesion: string;
  hora: string;
  asistio_con_conyuge: boolean;
}

export interface RegistroResponse {
  success: boolean;
  message: string;
  ya_registrado?: boolean;
  pastor: Pastor;
  asistencia?: {
    id: number;
    hora: string;
    asistio_con_conyuge: boolean;
    conyuge_nombre?: string | null;
    conyuge_acreditado_independiente?: boolean;
  };
  total_presentes?: number;
}

// ----------------------------------------------------------------------
// TIPOS PARA LIDERAZGO (PRESBÍTEROS Y SUPERVISORES)
// ----------------------------------------------------------------------

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  telefono: string | null;
  zona: string | null;
  distrito: string | null;
  zona_2: string | null;
  roles: string[];
  es_presbitero: boolean;
  es_supervisor: boolean;
  push_notificaciones_activas: boolean;
  push_modo_silencioso: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface PastorPresente {
  id: number;
  asistencia_id: number;
  nombre_completo: string;
  documento: string;
  codigo: string;
  foto: string | null;
  nivel_ministerial: string;
  extension_nombre: string;
  extension_estado: string;
  distrito: string | null;
  hora: string;
  metodo: string;
  asistio_con_conyuge: boolean;
  nombre_conyuge: string | null;
}

export interface PastorPendiente {
  id: number;
  nombre_completo: string;
  documento: string;
  codigo: string;
  foto: string | null;
  nivel_ministerial: string;
  extension_nombre: string;
  extension_estado: string;
  distrito: string | null;
  telefono: string | null;
  telefono_limpio: string;
  tiene_telefono: boolean;
  nombre_conyuge: string | null;
}

export interface PresbiteroDashboardData {
  success: boolean;
  zona: string;
  actividad: {
    id: number;
    nombre: string;
    tipo: string;
    lugar: string | null;
  };
  metricas: {
    total_padron: number;
    total_presentes: number;
    total_pendientes: number;
    porcentaje_asistencia: number;
    con_conyuge: number;
  };
  presentes: PastorPresente[];
  pendientes: PastorPendiente[];
}

export interface ZonaResumen {
  zona: string;
  nombre_zona: string;
  presbitero_nombre: string;
  presbitero_telefono: string | null;
  padron: number;
  presentes: number;
  pendientes: number;
  porcentaje: number;
  semaforo: 'green' | 'amber' | 'red';
}

export interface SupervisorDashboardData {
  success: boolean;
  actividad: {
    id: number;
    nombre: string;
    tipo: string;
    lugar: string | null;
  };
  metricas_nacionales: {
    total_padron: number;
    total_presentes: number;
    total_pendientes: number;
    porcentaje_asistencia: number;
    total_con_conyuge: number;
    total_zonas: number;
  };
  zonas: ZonaResumen[];
}
