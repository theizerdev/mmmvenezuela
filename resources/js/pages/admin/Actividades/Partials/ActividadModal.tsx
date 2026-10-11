import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    CalendarCheck,
    Calendar,
    Clock,
    MapPin,
    Layers,
    Utensils,
    Heart,
    Plus,
    Trash2,
    Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface SesionData {
    id?: number;
    nombre: string;
    fecha_hora_inicio: string;
    fecha_hora_fin: string;
    es_obligatoria: boolean;
    tipo_comida: string;
}

export interface ActividadData {
    id: number;
    nombre: string;
    tipo: string;
    descripcion: string | null;
    fecha_inicio: string;
    fecha_fin: string;
    lugar: string | null;
    zona: string | null;
    distrito: string | null;
    estado: 'planificada' | 'en_curso' | 'finalizada' | 'cancelada';
    permite_conyuge: boolean;
    controla_comida: boolean;
    capacidad_maxima: number | null;
    sesiones?: SesionData[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    actividad: ActividadData | null;
    tiposDisponibles: string[];
}

export function ActividadModal({ isOpen, onClose, actividad, tiposDisponibles }: Props) {
    const toDatetimeLocal = (val?: string | null) => {
        if (!val) return '';
        const d = new Date(val);
        if (isNaN(d.getTime())) return '';
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const getInitialFechas = () => {
        const now = new Date();
        const start = new Date(now);
        start.setDate(start.getDate() + 1);
        start.setHours(8, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 2);
        end.setHours(18, 0, 0, 0);

        return {
            inicio: toDatetimeLocal(start.toISOString()),
            fin: toDatetimeLocal(end.toISOString()),
        };
    };

    const defaultFechas = getInitialFechas();

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nombre: '',
        tipo: 'Convención',
        descripcion: '',
        fecha_inicio: defaultFechas.inicio,
        fecha_fin: defaultFechas.fin,
        lugar: '',
        zona: '',
        distrito: '',
        estado: 'planificada' as 'planificada' | 'en_curso' | 'finalizada' | 'cancelada',
        permite_conyuge: true,
        controla_comida: false,
        capacidad_maxima: '',
        sesiones: [
            {
                nombre: 'Culto de Apertura / Noche',
                fecha_hora_inicio: defaultFechas.inicio,
                fecha_hora_fin: defaultFechas.inicio,
                es_obligatoria: true,
                tipo_comida: 'ninguna',
            },
        ] as SesionData[],
    });

    useEffect(() => {
        clearErrors();
        if (actividad) {
            setData({
                nombre: actividad.nombre || '',
                tipo: actividad.tipo || 'Convención',
                descripcion: actividad.descripcion || '',
                fecha_inicio: toDatetimeLocal(actividad.fecha_inicio),
                fecha_fin: toDatetimeLocal(actividad.fecha_fin),
                lugar: actividad.lugar || '',
                zona: actividad.zona || '',
                distrito: actividad.distrito || '',
                estado: actividad.estado || 'planificada',
                permite_conyuge: Boolean(actividad.permite_conyuge),
                controla_comida: Boolean(actividad.controla_comida),
                capacidad_maxima: actividad.capacidad_maxima ? String(actividad.capacidad_maxima) : '',
                sesiones: (actividad.sesiones || []).map((s) => ({
                    id: s.id,
                    nombre: s.nombre,
                    fecha_hora_inicio: toDatetimeLocal(s.fecha_hora_inicio),
                    fecha_hora_fin: toDatetimeLocal(s.fecha_hora_fin),
                    es_obligatoria: Boolean(s.es_obligatoria),
                    tipo_comida: s.tipo_comida || 'ninguna',
                })),
            });
        } else {
            const fechas = getInitialFechas();
            setData({
                nombre: '',
                tipo: 'Convención',
                descripcion: '',
                fecha_inicio: fechas.inicio,
                fecha_fin: fechas.fin,
                lugar: '',
                zona: '',
                distrito: '',
                estado: 'planificada',
                permite_conyuge: true,
                controla_comida: false,
                capacidad_maxima: '',
                sesiones: [
                    {
                        nombre: 'Culto de Apertura / Noche',
                        fecha_hora_inicio: fechas.inicio,
                        fecha_hora_fin: fechas.inicio,
                        es_obligatoria: true,
                        tipo_comida: 'ninguna',
                    },
                ],
            });
        }
    }, [actividad, isOpen]);

    const addSesion = () => {
        setData('sesiones', [
            ...data.sesiones,
            {
                nombre: `Sesión ${data.sesiones.length + 1}`,
                fecha_hora_inicio: data.fecha_inicio,
                fecha_hora_fin: data.fecha_fin,
                es_obligatoria: true,
                tipo_comida: 'ninguna',
            },
        ]);
    };

    const removeSesion = (index: number) => {
        const updated = [...data.sesiones];
        updated.splice(index, 1);
        setData('sesiones', updated);
    };

    const updateSesion = (index: number, field: keyof SesionData, value: any) => {
        const updated = [...data.sesiones];
        updated[index] = { ...updated[index], [field]: value };
        setData('sesiones', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (actividad) {
            put(`/admin/actividades/${actividad.id}`, {
                onSuccess: () => {
                    onClose();
                },
            });
        } else {
            post('/admin/actividades', {
                onSuccess: () => {
                    onClose();
                },
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                        <div className="size-8 sm:size-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <CalendarCheck className="size-4 sm:size-5" />
                        </div>
                        {actividad ? 'Editar Actividad' : 'Nueva Actividad'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                        {actividad
                            ? 'Actualiza las fechas, sede o programa de sesiones de este evento.'
                            : 'Registra un evento con su fecha de inicio, fin y sesiones de asistencia.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid grid-cols-3 w-full bg-slate-100 dark:bg-slate-800/80 p-1 h-auto">
                            <TabsTrigger value="general" className="text-[11px] sm:text-xs font-semibold gap-1 sm:gap-1.5 py-1.5 px-1 sm:px-3 truncate">
                                <Calendar className="size-3.5 shrink-0" />
                                <span className="truncate">General</span>
                            </TabsTrigger>
                            <TabsTrigger value="sesiones" className="text-[11px] sm:text-xs font-semibold gap-1 sm:gap-1.5 py-1.5 px-1 sm:px-3 truncate">
                                <Layers className="size-3.5 shrink-0" />
                                <span className="truncate">Sesiones ({data.sesiones.length})</span>
                            </TabsTrigger>
                            <TabsTrigger value="logistica" className="text-[11px] sm:text-xs font-semibold gap-1 sm:gap-1.5 py-1.5 px-1 sm:px-3 truncate">
                                <Settings className="size-3.5 shrink-0" />
                                <span className="truncate">Logística</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Pestaña 1: Datos Generales */}
                        <TabsContent value="general" className="space-y-4 pt-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="modal_nombre" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Nombre de la Actividad <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="modal_nombre"
                                    placeholder="Ej: Convención Nacional de Pastores 2026, Retiro Zona 9..."
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    required
                                    className="h-9 text-sm"
                                />
                                {errors.nombre && <p className="text-xs text-red-500">{errors.nombre}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="modal_tipo" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Tipo de Evento <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="modal_tipo"
                                        value={data.tipo}
                                        onChange={(e) => setData('tipo', e.target.value)}
                                        className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {tiposDisponibles.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.tipo && <p className="text-xs text-red-500">{errors.tipo}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="modal_estado" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Estado
                                    </Label>
                                    <select
                                        id="modal_estado"
                                        value={data.estado}
                                        onChange={(e) => setData('estado', e.target.value as any)}
                                        className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="planificada">Planificada</option>
                                        <option value="en_curso">En Curso (Lista para escanear)</option>
                                        <option value="finalizada">Finalizada</option>
                                        <option value="cancelada">Cancelada</option>
                                    </select>
                                </div>
                            </div>

                            {/* Fechas de Inicio y Fin */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                                <div className="space-y-1.5">
                                    <Label htmlFor="modal_fecha_inicio" className="text-xs font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                                        <Clock className="size-3.5" />
                                        Fecha y Hora de Inicio <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="modal_fecha_inicio"
                                        type="datetime-local"
                                        value={data.fecha_inicio}
                                        onChange={(e) => setData('fecha_inicio', e.target.value)}
                                        required
                                        className="h-9 text-xs"
                                    />
                                    {errors.fecha_inicio && <p className="text-xs text-red-500">{errors.fecha_inicio}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="modal_fecha_fin" className="text-xs font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                                        <Clock className="size-3.5" />
                                        Fecha y Hora de Culminación <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="modal_fecha_fin"
                                        type="datetime-local"
                                        value={data.fecha_fin}
                                        onChange={(e) => setData('fecha_fin', e.target.value)}
                                        required
                                        className="h-9 text-xs"
                                    />
                                    {errors.fecha_fin && <p className="text-xs text-red-500">{errors.fecha_fin}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="modal_lugar" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Lugar / Sede del Evento
                                </Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                                    <Input
                                        id="modal_lugar"
                                        placeholder="Ej: Centro de Convenciones MMM - La Victoria, Estado Aragua..."
                                        value={data.lugar}
                                        onChange={(e) => setData('lugar', e.target.value)}
                                        className="pl-8 h-9 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="modal_zona" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Zona Específica (Opcional)
                                    </Label>
                                    <Input
                                        id="modal_zona"
                                        placeholder="Ej: 9 (Dejar vacío si es Nacional)"
                                        value={data.zona}
                                        onChange={(e) => setData('zona', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="modal_capacidad" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Capacidad / Aforo Estimado
                                    </Label>
                                    <Input
                                        id="modal_capacidad"
                                        type="number"
                                        placeholder="Ej: 800"
                                        value={data.capacidad_maxima}
                                        onChange={(e) => setData('capacidad_maxima', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="modal_desc" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Descripción o Instrucciones
                                </Label>
                                <Textarea
                                    id="modal_desc"
                                    rows={2}
                                    placeholder="Detalles sobre hospedaje, vestimenta, recomendaciones..."
                                    value={data.descripcion}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                    className="text-xs"
                                />
                            </div>
                        </TabsContent>

                        {/* Pestaña 2: Sesiones y Cultos */}
                        <TabsContent value="sesiones" className="space-y-3 pt-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-500">
                                    Define los cultos o bloques para medir la asistencia por servicio
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addSesion}
                                    className="gap-1.5 h-8 text-xs font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                >
                                    <Plus className="size-3" />
                                    Agregar Culto / Sesión
                                </Button>
                            </div>

                            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                                {data.sesiones.map((sesion, index) => (
                                    <div
                                        key={index}
                                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-2.5 relative"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                                                Bloque #{index + 1}
                                            </span>
                                            {data.sesiones.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeSesion(index)}
                                                    className="size-6 p-0 text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="size-3" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div className="space-y-1 sm:col-span-2">
                                                <Label className="text-[11px] font-medium">Nombre de la Sesión</Label>
                                                <Input
                                                    placeholder="Ej: Día 1 - Culto Inaugural"
                                                    value={sesion.nombre}
                                                    onChange={(e) => updateSesion(index, 'nombre', e.target.value)}
                                                    className="h-8 text-xs"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-medium">Inicio</Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={sesion.fecha_hora_inicio}
                                                    onChange={(e) => updateSesion(index, 'fecha_hora_inicio', e.target.value)}
                                                    className="h-8 text-[11px]"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-medium">Culminación</Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={sesion.fecha_hora_fin}
                                                    onChange={(e) => updateSesion(index, 'fecha_hora_fin', e.target.value)}
                                                    className="h-8 text-[11px]"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-medium">Comida Asociada</Label>
                                                <select
                                                    value={sesion.tipo_comida}
                                                    onChange={(e) => updateSesion(index, 'tipo_comida', e.target.value)}
                                                    className="w-full h-8 px-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[11px] font-medium"
                                                >
                                                    <option value="ninguna">Ninguna</option>
                                                    <option value="desayuno">Desayuno</option>
                                                    <option value="almuerzo">Almuerzo</option>
                                                    <option value="cena">Cena</option>
                                                </select>
                                            </div>

                                            <div className="flex items-center gap-2 pt-4">
                                                <input
                                                    type="checkbox"
                                                    id={`modal_obl_${index}`}
                                                    checked={sesion.es_obligatoria}
                                                    onChange={(e) => updateSesion(index, 'es_obligatoria', e.target.checked)}
                                                    className="rounded border-slate-300 text-indigo-600 size-3.5"
                                                />
                                                <label htmlFor={`modal_obl_${index}`} className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                                                    Obligatoria para Quórum
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Pestaña 3: Logística */}
                        <TabsContent value="logistica" className="space-y-3 pt-3">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                                            <Heart className="size-4 text-pink-500" />
                                            Registro de Cónyuge
                                        </div>
                                        <p className="text-[11px] text-slate-500">
                                            Permite marcar con un solo clic si el pastor asiste con su esposa
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.permite_conyuge}
                                        onCheckedChange={(val) => setData('permite_conyuge', val)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                                            <Utensils className="size-4 text-amber-500" />
                                            Control de Comedor / Alimentación
                                        </div>
                                        <p className="text-[11px] text-slate-500">
                                            Habilita el registro de entrega de comidas por el escáner
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.controla_comida}
                                        onCheckedChange={(val) => setData('controla_comida', val)}
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing} className="w-full sm:w-auto">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                            {processing ? 'Guardando...' : actividad ? 'Guardar Cambios' : 'Crear Actividad'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
