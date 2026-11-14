import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Users,
    FileText,
    FileSpreadsheet,
    RotateCcw,
    Search,
    MapPin,
    Heart,
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    Clock,
    Shield,
    Layers,
    AlertCircle,
    ChevronsUpDown,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface AsistenteItem {
    id: number;
    pastor_id: number;
    codigo: string;
    documento: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    nombre_mostrado: string;
    nivel_ministerial: string;
    cargo_nacional?: string | null;
    zona: string;
    distrito?: string | null;
    iglesia?: string | null;
    estado?: string | null;
    telefono?: string | null;
    sesion: string;
    hora: string;
    fecha_hora: string;
    metodo: string;
    metodo_label: string;
    asistio_con_conyuge: boolean;
    nombre_acompanante?: string | null;
}

interface ZonaResumen {
    zona: string;
    nombre_zona: string;
    presbitero_nombre: string;
    total_padron: number;
    total_presentes: number;
    total_pendientes: number;
    total_con_conyuge: number;
    total_registros: number;
    porcentaje: number;
    semaforo: 'green' | 'amber' | 'red' | 'empty';
    asistentes: AsistenteItem[];
}

interface SesionOption {
    id: number;
    nombre: string;
    fecha_hora_inicio?: string | null;
    fecha_hora_fin?: string | null;
    es_obligatoria: boolean;
    is_activa: boolean;
    asistencias_count: number;
}

interface DetalleResponse {
    success: boolean;
    actividad: {
        id: number;
        nombre: string;
        tipo: string;
        lugar: string | null;
        zona: string | null;
        estado: string;
        permite_conyuge: boolean;
    };
    scope: 'sesion' | 'actividad';
    sesion_seleccionada: {
        id: number;
        nombre: string;
        fecha_hora_inicio?: string | null;
        fecha_hora_fin?: string | null;
        es_obligatoria: boolean;
        is_activa: boolean;
    } | null;
    sesiones: SesionOption[];
    metricas: {
        total_padron: number;
        total_presentes: number;
        porcentaje_quorum: number;
        total_con_conyuge: number;
        total_ausentes: number;
        zonas_con_asistencia: number;
        total_zonas: number;
        total_registros: number;
    };
    zonas: ZonaResumen[];
    asistentes_cronologico: AsistenteItem[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    actividadId: number | null;
    actividadNombre?: string;
    initialSesionId?: number | 'all' | null;
}

export function SesionAsistentesModal({
    isOpen,
    onClose,
    actividadId,
    actividadNombre,
    initialSesionId = null,
}: Props) {
    const [selectedSesionScope, setSelectedSesionScope] = useState<string>(
        initialSesionId !== null && initialSesionId !== undefined ? String(initialSesionId) : 'activa'
    );
    const [detalle, setDetalle] = useState<DetalleResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<'zonas' | 'listado'>('zonas');
    const [zonaFilter, setZonaFilter] = useState<'todas' | 'con_asistencia' | 'sin_asistencia'>('todas');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [expandedZonas, setExpandedZonas] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (isOpen) {
            setSelectedSesionScope(
                initialSesionId !== null && initialSesionId !== undefined ? String(initialSesionId) : 'activa'
            );
            setSearchQuery('');
            setZonaFilter('todas');
            setActiveTab('zonas');
        }
    }, [isOpen, actividadId, initialSesionId]);

    const cargarDetalle = useCallback(
        async (sesionScope: string) => {
            if (!actividadId) return;
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                if (sesionScope) {
                    params.set('sesion_id', sesionScope);
                }

                const res = await fetch(`/admin/actividades/${actividadId}/sesion-detalle?${params.toString()}`, {
                    headers: {
                        Accept: 'application/json',
                    },
                });

                if (!res.ok) {
                    throw new Error(`No se pudo cargar el detalle del servicio (HTTP ${res.status}).`);
                }

                const json: DetalleResponse = await res.json();
                setDetalle(json);

                // Expandir automáticamente las primeras 5 zonas con asistentes para inspección inmediata
                const initialExpanded: Record<string, boolean> = {};
                let opened = 0;
                for (const z of json.zonas) {
                    if (z.total_presentes > 0 && opened < 5) {
                        initialExpanded[z.zona] = true;
                        opened++;
                    }
                }
                setExpandedZonas(initialExpanded);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error inesperado al cargar asistentes.');
            } finally {
                setLoading(false);
            }
        },
        [actividadId]
    );

    useEffect(() => {
        if (isOpen && actividadId) {
            cargarDetalle(selectedSesionScope);
        }
    }, [isOpen, actividadId, selectedSesionScope, cargarDetalle]);

    const pdfDownloadUrl = useMemo(() => {
        if (!actividadId) return '#';
        const sesionParam = detalle?.sesion_seleccionada?.id
            ? String(detalle.sesion_seleccionada.id)
            : selectedSesionScope === 'all'
              ? 'all'
              : 'activa';
        return `/admin/actividades/${actividadId}/exportar-pdf?sesion_id=${encodeURIComponent(sesionParam)}`;
    }, [actividadId, detalle?.sesion_seleccionada?.id, selectedSesionScope]);

    const matchesSearch = useCallback((as: AsistenteItem, q: string) => {
        return (
            as.nombre_mostrado.toLowerCase().includes(q) ||
            as.nombre_completo.toLowerCase().includes(q) ||
            as.documento.toLowerCase().includes(q) ||
            as.codigo.toLowerCase().includes(q) ||
            (as.iglesia && as.iglesia.toLowerCase().includes(q)) ||
            (as.nivel_ministerial && as.nivel_ministerial.toLowerCase().includes(q))
        );
    }, []);

    const zonasFiltradas = useMemo(() => {
        if (!detalle) return [];
        const q = searchQuery.trim().toLowerCase();

        return detalle.zonas
            .map((z) => {
                if (zonaFilter === 'con_asistencia' && z.total_presentes === 0) return null;
                if (zonaFilter === 'sin_asistencia' && z.total_presentes > 0) return null;

                if (!q) {
                    return { ...z, matchedAsistentes: z.asistentes };
                }

                const zoneMatches =
                    z.nombre_zona.toLowerCase().includes(q) ||
                    z.zona.toLowerCase() === q ||
                    z.presbitero_nombre.toLowerCase().includes(q);

                const matchedAsistentes = zoneMatches
                    ? z.asistentes
                    : z.asistentes.filter((as) => matchesSearch(as, q));

                if (!zoneMatches && matchedAsistentes.length === 0) {
                    return null;
                }

                return { ...z, matchedAsistentes };
            })
            .filter((z): z is ZonaResumen & { matchedAsistentes: AsistenteItem[] } => z !== null);
    }, [detalle, zonaFilter, searchQuery, matchesSearch]);

    const listadoFiltrado = useMemo(() => {
        if (!detalle) return [];
        const q = searchQuery.trim().toLowerCase();
        if (!q) return detalle.asistentes_cronologico;

        return detalle.asistentes_cronologico.filter(
            (as) =>
                matchesSearch(as, q) ||
                `zona ${as.zona}`.toLowerCase().includes(q) ||
                as.zona.toLowerCase() === q
        );
    }, [detalle, searchQuery, matchesSearch]);

    const zonasConAsistenciaCount = useMemo(
        () => (detalle ? detalle.zonas.filter((z) => z.total_presentes > 0).length : 0),
        [detalle]
    );
    const zonasSinAsistenciaCount = useMemo(
        () => (detalle ? detalle.zonas.filter((z) => z.total_presentes === 0).length : 0),
        [detalle]
    );

    const anyExpanded = useMemo(
        () => zonasFiltradas.some((z) => !!expandedZonas[z.zona]),
        [zonasFiltradas, expandedZonas]
    );

    const toggleZona = (zonaKey: string) => {
        setExpandedZonas((prev) => ({
            ...prev,
            [zonaKey]: !prev[zonaKey],
        }));
    };

    const toggleExpandAllConAsistencia = () => {
        if (anyExpanded) {
            setExpandedZonas({});
            return;
        }
        const next: Record<string, boolean> = {};
        for (const z of zonasFiltradas) {
            if (z.matchedAsistentes.length > 0) {
                next[z.zona] = true;
            }
        }
        setExpandedZonas(next);
    };

    const getSemaforoBadge = (semaforo: ZonaResumen['semaforo'], pct: number) => {
        switch (semaforo) {
            case 'green':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
            case 'amber':
                return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
            case 'red':
                return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
            default:
                return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
        }
    };

    const formatHorarioSesion = (inicio?: string | null, fin?: string | null) => {
        if (!inicio) return '';
        try {
            const dIni = new Date(inicio);
            const fmtDate = dIni.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const fmtIni = dIni.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
            if (!fin) return `${fmtDate} ${fmtIni}`;
            const dFin = new Date(fin);
            const fmtFin = dFin.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
            return `${fmtDate} • ${fmtIni} - ${fmtFin}`;
        } catch {
            return '';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-6xl sm:max-w-6xl w-[95vw] max-h-[92vh] flex flex-col overflow-hidden p-0">
                {/* Header fijo */}
                <DialogHeader className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pr-8">
                        <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                                    <Layers className="size-3.5" />
                                    {detalle?.actividad.nombre || actividadNombre || 'Actividad'}
                                </span>
                                {detalle?.sesion_seleccionada?.is_activa && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Culto Activo Oficial
                                    </span>
                                )}
                            </div>
                            <DialogTitle className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 truncate">
                                {detalle?.sesion_seleccionada
                                    ? `Detalle de Asistentes: ${detalle.sesion_seleccionada.nombre}`
                                    : 'Detalle Consolidado de Asistentes por Zonas'}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                                {detalle?.sesion_seleccionada?.fecha_hora_inicio
                                    ? `${formatHorarioSesion(detalle.sesion_seleccionada.fecha_hora_inicio, detalle.sesion_seleccionada.fecha_hora_fin)} • Desglose ordenado por zonas eclesiásticas`
                                    : 'Visualiza los pastores acreditados organizados por todas las zonas y exporta el reporte oficial en PDF.'}
                            </DialogDescription>
                        </div>

                        {/* Controles de sesión y exportación */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {detalle && detalle.sesiones.length > 0 && (
                                <select
                                    value={detalle.sesion_seleccionada ? String(detalle.sesion_seleccionada.id) : 'all'}
                                    onChange={(e) => setSelectedSesionScope(e.target.value)}
                                    aria-label="Seleccionar servicio o sesión"
                                    className="h-9 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[260px]"
                                >
                                    {detalle.sesiones.map((s) => (
                                        <option key={s.id} value={String(s.id)}>
                                            {s.is_activa ? '● [ACTIVO] ' : ''}
                                            {s.nombre} ({s.asistencias_count})
                                        </option>
                                    ))}
                                    <option value="all">Todas las sesiones (Consolidado)</option>
                                </select>
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => cargarDetalle(selectedSesionScope)}
                                disabled={loading}
                                className="h-9 gap-1.5 text-xs cursor-pointer"
                            >
                                <RotateCcw className={cn('size-3.5', loading && 'animate-spin')} />
                                <span className="hidden sm:inline">Refrescar</span>
                            </Button>

                            {actividadId && (
                                <>
                                    <a href={`/admin/actividades/${actividadId}/exportar-excel`} target="_blank" rel="noopener noreferrer">
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="h-9 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                                        >
                                            <FileSpreadsheet className="size-3.5" />
                                            <span>Excel</span>
                                        </Button>
                                    </a>

                                    <a href={pdfDownloadUrl} target="_blank" rel="noopener noreferrer">
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="h-9 gap-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm cursor-pointer"
                                        >
                                            <FileText className="size-3.5" />
                                            <span>Exportar PDF por Zonas</span>
                                        </Button>
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* Cuerpo scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                    {loading && !detalle && (
                        <div className="py-16 text-center space-y-2 text-slate-500">
                            <RotateCcw className="size-7 mx-auto animate-spin text-indigo-500" />
                            <p className="text-sm font-medium">Cargando detalle de asistentes y resumen de zonas...</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-3 text-xs text-rose-700 dark:text-rose-300">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="size-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => cargarDetalle(selectedSesionScope)}
                                className="h-7 text-xs"
                            >
                                Reintentar
                            </Button>
                        </div>
                    )}

                    {detalle && (
                        <>
                            {/* KPIs del servicio */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                        Padrón Convocado
                                    </span>
                                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                                        {detalle.metricas.total_padron}
                                    </span>
                                </div>

                                <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                                        Pastores Presentes
                                    </span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200">
                                            {detalle.metricas.total_presentes}
                                        </span>
                                        <span className="text-[11px] font-bold text-emerald-600">
                                            ({detalle.metricas.porcentaje_quorum}%)
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/60 dark:bg-pink-950/30">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 dark:text-pink-400 block">
                                        Con Cónyuge
                                    </span>
                                    <span className="text-xl font-extrabold text-pink-800 dark:text-pink-200">
                                        {detalle.metricas.total_con_conyuge}
                                    </span>
                                </div>

                                <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/30">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block">
                                        Zonas con Presencia
                                    </span>
                                    <span className="text-xl font-extrabold text-indigo-800 dark:text-indigo-200">
                                        {detalle.metricas.zonas_con_asistencia} / {detalle.metricas.total_zonas}
                                    </span>
                                </div>

                                <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 col-span-2 sm:col-span-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                                        Pendientes
                                    </span>
                                    <span className="text-xl font-extrabold text-amber-800 dark:text-amber-200">
                                        {detalle.metricas.total_ausentes}
                                    </span>
                                </div>
                            </div>

                            {/* Tabs y Buscador */}
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'zonas' | 'listado')} className="space-y-3">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                                    <TabsList className="bg-slate-100 dark:bg-slate-800/80 w-fit">
                                        <TabsTrigger value="zonas" className="text-xs font-bold gap-1.5 cursor-pointer">
                                            <MapPin className="size-3.5" />
                                            <span>Por Zonas ({detalle.zonas.length})</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="listado" className="text-xs font-bold gap-1.5 cursor-pointer">
                                            <Users className="size-3.5" />
                                            <span>Listado General ({detalle.asistentes_cronologico.length})</span>
                                        </TabsTrigger>
                                    </TabsList>

                                    <div className="flex flex-wrap items-center gap-2 flex-1 md:justify-end">
                                        <div className="relative flex-1 sm:max-w-xs min-w-[210px]">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                                            <Input
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Buscar zona, presbítero, pastor o cédula..."
                                                className="h-8 pl-8 text-xs bg-white dark:bg-slate-950"
                                            />
                                        </div>

                                        {activeTab === 'zonas' && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={toggleExpandAllConAsistencia}
                                                className="h-8 text-xs gap-1.5 cursor-pointer"
                                            >
                                                <ChevronsUpDown className="size-3.5" />
                                                <span>{anyExpanded ? 'Colapsar todas' : `Expandir activas (${zonasConAsistenciaCount})`}</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Tab 1: Organización por Todas las Zonas */}
                                <TabsContent value="zonas" className="space-y-3 mt-0">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={zonaFilter === 'todas' ? 'default' : 'outline'}
                                            onClick={() => setZonaFilter('todas')}
                                            className="h-7 text-[11px] font-semibold cursor-pointer"
                                        >
                                            Todas ({detalle.zonas.length})
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={zonaFilter === 'con_asistencia' ? 'default' : 'outline'}
                                            onClick={() => setZonaFilter('con_asistencia')}
                                            className="h-7 text-[11px] font-semibold cursor-pointer"
                                        >
                                            Con Asistencia ({zonasConAsistenciaCount})
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={zonaFilter === 'sin_asistencia' ? 'default' : 'outline'}
                                            onClick={() => setZonaFilter('sin_asistencia')}
                                            className="h-7 text-[11px] font-semibold cursor-pointer"
                                        >
                                            Sin Asistencia ({zonasSinAsistenciaCount})
                                        </Button>
                                    </div>

                                    {zonasFiltradas.length === 0 ? (
                                        <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500">
                                            No se encontraron zonas ni asistentes que coincidan con el filtro aplicado.
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {zonasFiltradas.map((z) => {
                                                const isOpenZona = searchQuery.trim() !== '' || !!expandedZonas[z.zona];
                                                const listaMostrar = z.matchedAsistentes;

                                                return (
                                                    <div
                                                        key={z.zona}
                                                        className={cn(
                                                            'rounded-xl border transition-colors overflow-hidden',
                                                            z.total_presentes > 0
                                                                ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'
                                                                : 'border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-900/30'
                                                        )}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleZona(z.zona)}
                                                            className="w-full px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left hover:bg-slate-50/90 dark:hover:bg-slate-900/70 transition-colors cursor-pointer"
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                {isOpenZona ? (
                                                                    <ChevronDown className="size-4 text-indigo-600 shrink-0" />
                                                                ) : (
                                                                    <ChevronRight className="size-4 text-slate-400 shrink-0" />
                                                                )}
                                                                <div className="min-w-0">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                                                                            {z.nombre_zona}
                                                                        </span>
                                                                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                                            Presbítero: <strong className="text-slate-700 dark:text-slate-200">{z.presbitero_nombre}</strong>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-2 sm:justify-end pl-6 sm:pl-0 shrink-0">
                                                                {z.total_con_conyuge > 0 && (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 px-2 py-0.5 text-[10px] font-semibold text-pink-700 dark:text-pink-300">
                                                                        <Heart className="size-2.5" /> {z.total_con_conyuge} cón.
                                                                    </span>
                                                                )}

                                                                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                                                                    {z.total_presentes} / {z.total_padron}
                                                                </span>

                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn('text-[11px] font-bold px-2 py-0.5', getSemaforoBadge(z.semaforo, z.porcentaje))}
                                                                >
                                                                    {z.porcentaje}%
                                                                </Badge>
                                                            </div>
                                                        </button>

                                                        {isOpenZona && (
                                                            <div className="border-t border-slate-100 dark:border-slate-800/80">
                                                                {listaMostrar.length === 0 ? (
                                                                    <div className="px-4 py-3 text-xs text-slate-400 italic">
                                                                        Sin asistentes acreditados en esta zona para el servicio seleccionado ({z.total_pendientes} pendientes de {z.total_padron}).
                                                                    </div>
                                                                ) : (
                                                                    <div className="overflow-x-auto">
                                                                        <table className="w-full text-left border-collapse text-xs">
                                                                            <thead>
                                                                                <tr className="bg-slate-50 dark:bg-slate-900/70 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                                                                    <th className="py-2 px-3 w-10 text-center">N°</th>
                                                                                    <th className="py-2 px-3">Pastor / Cargo</th>
                                                                                    <th className="py-2 px-3">Cédula / Código</th>
                                                                                    <th className="py-2 px-3">Grado Ministerial</th>
                                                                                    <th className="py-2 px-3">Iglesia / Distrito</th>
                                                                                    <th className="py-2 px-3 text-center">Hora</th>
                                                                                    <th className="py-2 px-3 text-center">Método</th>
                                                                                    <th className="py-2 px-3">Cónyuge</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                                                                {listaMostrar.map((as, idx) => (
                                                                                    <tr
                                                                                        key={as.id}
                                                                                        className="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20"
                                                                                    >
                                                                                        <td className="py-2 px-3 text-center text-slate-400 font-mono">
                                                                                            {idx + 1}
                                                                                        </td>
                                                                                        <td className="py-2 px-3">
                                                                                            <div className="font-bold text-slate-900 dark:text-slate-100">
                                                                                                {as.apellidos} {as.nombres}
                                                                                            </div>
                                                                                            {as.cargo_nacional && (
                                                                                                <div className="text-[10px] text-slate-500">
                                                                                                    {as.cargo_nacional}
                                                                                                </div>
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="py-2 px-3 font-mono text-[11px]">
                                                                                            <div className="text-slate-800 dark:text-slate-200">{as.documento}</div>
                                                                                            <div className="text-[10px] text-slate-400">{as.codigo}</div>
                                                                                        </td>
                                                                                        <td className="py-2 px-3">
                                                                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                                                                                                <Shield className="size-3 text-indigo-500 shrink-0" />
                                                                                                {as.nivel_ministerial}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className="py-2 px-3 text-[11px] text-slate-600 dark:text-slate-300">
                                                                                            <div>{as.iglesia || '—'}</div>
                                                                                            {as.distrito && (
                                                                                                <div className="text-[10px] text-slate-400">
                                                                                                    Distrito {as.distrito}
                                                                                                </div>
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="py-2 px-3 text-center text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                                                            <span className="inline-flex items-center gap-1">
                                                                                                <Clock className="size-3 text-slate-400" />
                                                                                                {as.hora}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className="py-2 px-3 text-center">
                                                                                            <span className="inline-block rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                                                                                                {as.metodo_label}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className="py-2 px-3 text-[11px]">
                                                                                            {as.asistio_con_conyuge ? (
                                                                                                <span className="inline-flex items-center gap-1 text-pink-700 dark:text-pink-300 font-semibold">
                                                                                                    <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                                                                                                    <span>
                                                                                                        Sí{as.nombre_acompanante ? ` — ${as.nombre_acompanante}` : ''}
                                                                                                    </span>
                                                                                                </span>
                                                                                            ) : (
                                                                                                <span className="text-slate-400">—</span>
                                                                                            )}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Tab 2: Listado Cronológico Global */}
                                <TabsContent value="listado" className="mt-0">
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto bg-white dark:bg-slate-950">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                                    <th className="py-2.5 px-3 w-10 text-center">N°</th>
                                                    <th className="py-2.5 px-3">Pastor</th>
                                                    <th className="py-2.5 px-3">Cédula</th>
                                                    <th className="py-2.5 px-3 text-center">Zona</th>
                                                    <th className="py-2.5 px-3">Grado</th>
                                                    <th className="py-2.5 px-3">Iglesia</th>
                                                    {detalle.scope === 'actividad' && <th className="py-2.5 px-3">Sesión</th>}
                                                    <th className="py-2.5 px-3 text-center">Hora</th>
                                                    <th className="py-2.5 px-3 text-center">Método</th>
                                                    <th className="py-2.5 px-3">Cónyuge</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {listadoFiltrado.length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={detalle.scope === 'actividad' ? 10 : 9}
                                                            className="py-8 text-center text-slate-400"
                                                        >
                                                            No hay asistentes registrados para mostrar.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    listadoFiltrado.map((as, idx) => (
                                                        <tr key={as.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                                                            <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                                                            <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">
                                                                {as.nombre_mostrado}
                                                            </td>
                                                            <td className="py-2 px-3 font-mono text-[11px]">{as.documento}</td>
                                                            <td className="py-2 px-3 text-center">
                                                                <Badge variant="outline" className="text-[10px] font-bold">
                                                                    Zona {as.zona}
                                                                </Badge>
                                                            </td>
                                                            <td className="py-2 px-3 text-[11px]">{as.nivel_ministerial}</td>
                                                            <td className="py-2 px-3 text-[11px] text-slate-600 dark:text-slate-300">
                                                                {as.iglesia || '—'}
                                                            </td>
                                                            {detalle.scope === 'actividad' && (
                                                                <td className="py-2 px-3 text-[11px]">{as.sesion}</td>
                                                            )}
                                                            <td className="py-2 px-3 text-center text-[11px] whitespace-nowrap">{as.hora}</td>
                                                            <td className="py-2 px-3 text-center">
                                                                <span className="inline-block rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold">
                                                                    {as.metodo_label}
                                                                </span>
                                                            </td>
                                                            <td className="py-2 px-3 text-[11px]">
                                                                {as.asistio_con_conyuge
                                                                    ? `Sí${as.nombre_acompanante ? ` — ${as.nombre_acompanante}` : ''}`
                                                                    : '—'}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </div>

                {/* Footer fijo */}
                <DialogFooter className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between sm:justify-between shrink-0">
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                        El PDF generado incluye el cuadro resumen de todas las zonas (1 a 41) y el listado nominal organizado por zona.
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                        {actividadId && (
                            <a href={pdfDownloadUrl} target="_blank" rel="noopener noreferrer">
                                <Button
                                    type="button"
                                    size="sm"
                                    className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                                >
                                    <FileText className="size-3.5" />
                                    Descargar PDF por Zonas
                                </Button>
                            </a>
                        )}
                        <Button type="button" variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
                            Cerrar
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

