export interface User {
  id: number;
  name: string;
  username?: string;
  email: string;
  telefono?: string;
  cedula?: string;
  es_presbitero: boolean;
  es_supervisor: boolean;
  zona?: string | null;
  expo_push_token?: string | null;
  push_notificaciones_activas: boolean;
  push_modo_silencioso: boolean;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface Sesion {
  id: number;
  actividad_id: number;
  nombre: string;
  fecha_hora?: string;
  activa: boolean;
}

export interface Actividad {
  id: number;
  nombre: string;
  fecha: string;
  lugar?: string;
  activa: boolean;
  total_presentes?: number;
  sesiones: Sesion[];
  sesion_activa?: Sesion | null;
}

export interface PastorPresente {
  pastor_id: number;
  nombre_completo: string;
  documento: string;
  cargo?: string;
  extension_nombre: string;
  foto_url?: string | null;
  conyuge_presente: boolean;
  conyuge_nombre?: string | null;
  hora_asistencia: string;
}

export interface PastorPendiente {
  pastor_id: number;
  nombre_completo: string;
  documento: string;
  cargo?: string;
  extension_nombre: string;
  foto_url?: string | null;
  telefono?: string | null;
  direccion?: string | null;
}

export interface PresbiteroDashboardData {
  success: boolean;
  zona: string;
  presbitero_nombre: string;
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
  presbitero_telefono?: string | null;
  total_padron: number;
  presentes: number;
  porcentaje: number;
  con_conyuge: number;
  estado: 'optimo' | 'regular' | 'critico';
}

export interface SupervisorDashboardData {
  success: boolean;
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

