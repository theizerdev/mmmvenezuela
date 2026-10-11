import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarCheck,
    Plus,
    Search,
    MapPin,
    Clock,
    Users,
    QrCode,
    BarChart3,
    FileSpreadsheet,
    Pencil,
    Trash2,
    Calendar,
    Activity,
    Layers,
    Utensils,
    Heart,
    RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Swal from 'sweetalert2';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ModuleHeader } from '@/components/module-header';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ActividadModal, ActividadData } from './Partials/ActividadModal';

interface Sesion {
    id: number;
    nombre: string;
    fecha_hora_inicio: string;
    fecha_hora_fin: string;
    es_obligatoria: boolean;
    tipo_comida: string;
}

interface ActividadItem extends ActividadData {
    sesiones: Sesion[];
    asistencias_count: number;
    total_pastores_unicos: number;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    actividades: Paginated<ActividadItem>;
    filters: {
        search?: string;
        tipo?: string;
        estado?: string;
        zona?: string;
    };
    kpis: {
        total_actividades: number;
        en_curso: number;
        total_asistencias: number;
        total_pastores: number;
    };
    tiposDisponibles: string[];
}

export default function ActividadesIndex({ actividades, filters, kpis, tiposDisponibles }: Props) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Actividades y Asistencia', href: '/admin/actividades' },
    ];

    // Estados de filtros
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [tipoFilter, setTipoFilter] = useState(filters.tipo || '');
    const [estadoFilter, setEstadoFilter] = useState(filters.estado || '');
    const [zonaFilter, setZonaFilter] = useState(filters.zona || '');

    // Estado para la ventana modal de Crear / Editar
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActividad, setEditingActividad] = useState<ActividadItem | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (
                searchTerm !== (filters.search || '') ||
                tipoFilter !== (filters.tipo || '') ||
                estadoFilter !== (filters.estado || '') ||
                zonaFilter !== (filters.zona || '')
            ) {
                router.get(
                    '/admin/actividades',
                    {
                        search: searchTerm || undefined,
                        tipo: tipoFilter || undefined,
                        estado: estadoFilter || undefined,
                        zona: zonaFilter || undefined,
                    },
                    { preserveState: true, preserveScroll: true }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, tipoFilter, estadoFilter, zonaFilter]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setTipoFilter('');
        setEstadoFilter('');
        setZonaFilter('');
        router.get('/admin/actividades', {}, { preserveState: true, preserveScroll: true });
    };

    const handleOpenCreateModal = () => {
        setEditingActividad(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (actividad: ActividadItem) => {
        setEditingActividad(actividad);
        setIsModalOpen(true);
    };

    const handleDelete = (actividad: ActividadItem) => {
        Swal.fire({
            title: '¿Eliminar actividad?',
            text: `Se eliminará "${actividad.nombre}" y todos sus registros de asistencia asociados.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/actividades/${actividad.id}`);
            }
        });
    };

    const formatFecha = (fechaStr: string) => {
        try {
            return format(new Date(fechaStr), "d 'de' MMMM, yyyy", { locale: es });
        } catch {
            return fechaStr;
        }
    };

    const formatHora = (fechaStr: string) => {
        try {
            return format(new Date(fechaStr), 'hh:mm a', { locale: es });
        } catch {
            return '';
        }
    };

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'en_curso':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                        En Curso
                    </span>
                );
            case 'planificada':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <span className="size-2 rounded-full bg-blue-500" />
                        Planificada
                    </span>
                );
            case 'finalizada':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 border border-slate-500/30 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <span className="size-2 rounded-full bg-slate-400" />
                        Finalizada
                    </span>
                );
            case 'cancelada':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
                        <span className="size-2 rounded-full bg-red-500" />
                        Cancelada
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Head title="Módulo de Actividades y Asistencia" />

            <div className="space-y-6">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                {/* Encabezado con Botón que abre el Modal de Creación */}
                <ModuleHeader
                    icon={<CalendarCheck className="size-7 text-white" />}
                    title="Control de Asistencia a Actividades"
                    description="Registro de eventos, convenciones y asambleas pastorales con escaneo ultrarrápido de carnet QR"
                    colorClassName="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900"
                >
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleOpenCreateModal}
                        className="gap-2 bg-white text-indigo-900 hover:bg-slate-100 font-bold shadow-md cursor-pointer transition-transform hover:scale-105"
                    >
                        <Plus className="size-4" />
                        Nueva Actividad
                    </Button>
                </ModuleHeader>

                {/* Tarjetas KPI de Resumen */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="TOTAL ACTIVIDADES"
                        value={kpis.total_actividades}
                        icon={<Calendar className="size-5 text-indigo-600 dark:text-indigo-400" />}
                        colorClassName="bg-indigo-50 dark:bg-indigo-950/50"
                        subtitle="Eventos registrados"
                    />
                    <StatCard
                        title="EN CURSO / ACTIVAS"
                        value={kpis.en_curso}
                        icon={<Activity className="size-5 text-emerald-600 dark:text-emerald-400" />}
                        colorClassName="bg-emerald-50 dark:bg-emerald-950/50"
                        subtitle="Listas para escanear"
                    />
                    <StatCard
                        title="TOTAL ASISTENCIAS"
                        value={kpis.total_asistencias}
                        icon={<QrCode className="size-5 text-blue-600 dark:text-blue-400" />}
                        colorClassName="bg-blue-50 dark:bg-blue-950/50"
                        subtitle="Marcas registradas"
                    />
                    <StatCard
                        title="PADRÓN PASTORAL"
                        value={kpis.total_pastores}
                        icon={<Users className="size-5 text-purple-600 dark:text-purple-400" />}
                        colorClassName="bg-purple-50 dark:bg-purple-950/50"
                        subtitle="Pastores acreditados"
                    />
                </div>

                {/* Barra de Filtros */}
                <Card className="p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <Input
                                placeholder="Buscar actividad, lugar o descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-white dark:bg-slate-950"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            <select
                                value={tipoFilter}
                                onChange={(e) => setTipoFilter(e.target.value)}
                                className="h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Todos los tipos</option>
                                {tiposDisponibles.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={estadoFilter}
                                onChange={(e) => setEstadoFilter(e.target.value)}
                                className="h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Todos los estados</option>
                                <option value="en_curso">En Curso</option>
                                <option value="planificada">Planificada</option>
                                <option value="finalizada">Finalizada</option>
                                <option value="cancelada">Cancelada</option>
                            </select>

                            {(searchTerm || tipoFilter || estadoFilter || zonaFilter) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="gap-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                >
                                    <RotateCcw className="size-3.5" />
                                    Limpiar
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Grilla de Actividades */}
                {actividades.data.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-2 border-slate-300 dark:border-slate-800">
                        <div className="mx-auto size-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center mb-4">
                            <CalendarCheck className="size-8 text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            No se encontraron actividades
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                            Comienza creando tu primera actividad para gestionar fechas de inicio, sesiones y asistencia con el código QR.
                        </p>
                        <div className="mt-6">
                            <Button
                                onClick={handleOpenCreateModal}
                                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm cursor-pointer"
                            >
                                <Plus className="size-4" />
                                Crear Primera Actividad
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {actividades.data.map((actividad) => (
                            <Card
                                key={actividad.id}
                                className={cn(
                                    'group relative overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col justify-between border-slate-200 dark:border-slate-800',
                                    actividad.estado === 'en_curso' &&
                                        'ring-2 ring-emerald-500/50 bg-gradient-to-b from-emerald-500/[0.03] to-transparent'
                                )}
                            >
                                <div className="p-5 space-y-4">
                                    {/* Top Badges */}
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                            {actividad.tipo}
                                        </span>
                                        {getEstadoBadge(actividad.estado)}
                                    </div>

                                    {/* Título y Descripción */}
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {actividad.nombre}
                                        </h3>
                                        {actividad.descripcion && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                                                {actividad.descripcion}
                                            </p>
                                        )}
                                    </div>

                                    {/* Fechas y Horas */}
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                                            <Calendar className="size-3.5 text-indigo-500 shrink-0" />
                                            <span>
                                                {formatFecha(actividad.fecha_inicio)}
                                                {actividad.fecha_inicio !== actividad.fecha_fin && (
                                                    <> — {formatFecha(actividad.fecha_fin)}</>
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                            <Clock className="size-3.5 text-slate-400 shrink-0" />
                                            <span>
                                                {formatHora(actividad.fecha_inicio)} a {formatHora(actividad.fecha_fin)}
                                            </span>
                                        </div>
                                        {actividad.lugar && (
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 pt-0.5">
                                                <MapPin className="size-3.5 text-rose-500 shrink-0" />
                                                <span className="truncate">{actividad.lugar}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Métricas y características de la actividad */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30">
                                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                                                Asistentes Únicos
                                            </span>
                                            <div className="flex items-baseline gap-1 mt-0.5">
                                                <span className="text-base font-extrabold text-blue-900 dark:text-blue-100">
                                                    {actividad.total_pastores_unicos}
                                                </span>
                                                <span className="text-[10px] text-blue-500">pastores</span>
                                            </div>
                                        </div>

                                        <div className="p-2.5 rounded-lg bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30">
                                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                                                Sesiones / Cultos
                                            </span>
                                            <div className="flex items-baseline gap-1 mt-0.5">
                                                <span className="text-base font-extrabold text-purple-900 dark:text-purple-100">
                                                    {actividad.sesiones?.length || 1}
                                                </span>
                                                <span className="text-[10px] text-purple-500">bloques</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Badges de soporte (Cónyuge / Comida) */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                        {actividad.permite_conyuge && (
                                            <span className="inline-flex items-center gap-1 rounded-md bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 text-[10px] font-medium text-pink-700 dark:text-pink-300">
                                                <Heart className="size-3" /> Con Cónyuge
                                            </span>
                                        )}
                                        {actividad.controla_comida && (
                                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                                                <Utensils className="size-3" /> Control Comedor
                                            </span>
                                        )}
                                        {actividad.zona && (
                                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                                                Zona {actividad.zona}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Acciones en la base de la tarjeta */}
                                <div className="p-4 bg-slate-50/80 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                                    <Link href={`/admin/actividades/${actividad.id}/escanear`} className="flex-1">
                                        <Button
                                            size="sm"
                                            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer transition-all hover:scale-[1.02]"
                                        >
                                            <QrCode className="size-4" />
                                            Escanear QR
                                        </Button>
                                    </Link>

                                    <div className="flex items-center gap-1">
                                        <Link href={`/admin/actividades/${actividad.id}/monitor`} title="Monitor en Vivo">
                                            <Button variant="outline" size="icon" className="size-8 cursor-pointer text-slate-600 hover:text-indigo-600">
                                                <BarChart3 className="size-4" />
                                            </Button>
                                        </Link>

                                        <a
                                            href={`/admin/actividades/${actividad.id}/exportar-asistencia`}
                                            title="Descargar Asistencia CSV"
                                        >
                                            <Button variant="outline" size="icon" className="size-8 cursor-pointer text-emerald-600 hover:text-emerald-700">
                                                <FileSpreadsheet className="size-4" />
                                            </Button>
                                        </a>

                                        {/* Botón Editar que abre la ventana modal con los datos */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleOpenEditModal(actividad)}
                                            title="Editar Actividad"
                                            className="size-8 cursor-pointer text-slate-600 hover:text-blue-600"
                                        >
                                            <Pencil className="size-4" />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleDelete(actividad)}
                                            title="Eliminar Actividad"
                                            className="size-8 cursor-pointer text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Ventana Modal para Crear y Editar Actividad */}
                <ActividadModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingActividad(null);
                    }}
                    actividad={editingActividad}
                    tiposDisponibles={tiposDisponibles}
                />
            </div>
        </>
    );
}
