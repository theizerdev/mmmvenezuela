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
