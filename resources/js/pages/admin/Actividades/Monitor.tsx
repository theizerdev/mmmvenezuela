import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    BarChart3,
    ArrowLeft,
    Users,
    Heart,
    Package,
    Utensils,
    QrCode,
    FileSpreadsheet,
    Clock,
    Phone,
    MessageCircle,
    CheckCircle2,
    XCircle,
    Shield,
    RotateCcw,
    MapPin,
    Search,
    ChevronRight,
    UserCheck,
    Calendar,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ModuleHeader } from '@/components/module-header';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Actividad {
    id: number;
    nombre: string;
    tipo: string;
    fecha_inicio: string;
    fecha_fin: string;
    lugar: string | null;
    zona: string | null;
    permite_conyuge: boolean;
    controla_comida: boolean;
}

interface Metricas {
    total_padron: number;
    total_presentes: number;
    porcentaje: number;
    con_conyuge: number;
    kits_entregados: number;
    comidas_entregadas: number;
}

interface UltimaAsistencia {
    id: number;
    pastor_id: number;
    nombre_completo: string;
    documento: string;
    codigo: string;
    foto?: string;
    zona?: string;
    nivel_ministerial?: string;
    sesion: string;
    metodo: string;
    fecha_registro: string;
    asistio_con_conyuge: boolean;
    kit_entregado: boolean;
    comida_entregada: boolean;
}

interface PastorAusente {
    id: number;
    codigo: string;
    nombres: string;
    apellidos: string;
    documento: string;
    foto?: string;
    telefono_tlf?: string;
    telefono_hab?: string;
    zona?: string;
    distrito?: string;
    nivel_ministerial?: string;
}

interface Props {
    actividad: Actividad;
    metricas: Metricas;
    niveles: {
        convocados: Record<string, number>;
        presentes: Record<string, number>;
    };
    zonas: {
        convocadas: Record<string, number>;
        presentes: Record<string, number>;
    };
    ultimasAsistencias: UltimaAsistencia[];
    ausentes: PastorAusente[];
}

export default function ActividadesMonitor({
    actividad,
    metricas,
    niveles,
    zonas,
    ultimasAsistencias,
    ausentes,
}: Props) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Actividades', href: '/admin/actividades' },
        { title: `Monitor: ${actividad.nombre}`, href: `/admin/actividades/${actividad.id}/monitor` },
    ];

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [zonaSearch, setZonaSearch] = useState('');
    const [asistenciaSearch, setAsistenciaSearch] = useState('');
    const [ausenteSearch, setAusenteSearch] = useState('');
    const [zonaFilterTab, setZonaFilterTab] = useState<'todas' | 'con_asistencia' | 'sin_asistencia'>('todas');

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            onFinish: () => setIsRefreshing(false),
        });
    };

    const getFotoUrl = (foto?: string) => {
        if (!foto) return undefined;
        if (foto.startsWith('http://') || foto.startsWith('https://')) return foto;
        if (foto.startsWith('/storage/')) return foto;
        if (foto.startsWith('storage/')) return `/${foto}`;
        return `/storage/${foto}`;
    };

    const getInitials = (nombre: string) => {
        return nombre
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join('');
    };

    // Filtrado de zonas
    const filteredZonas = useMemo(() => {
        const entries = Object.entries(zonas.convocadas);
        return entries
            .filter(([zona, total]) => {
                const presentes = zonas.presentes[zona] || 0;
                const matchesSearch = zona.toLowerCase().includes(zonaSearch.toLowerCase()) ||
                    `zona ${zona}`.toLowerCase().includes(zonaSearch.toLowerCase());
                
                if (!matchesSearch) return false;

                if (zonaFilterTab === 'con_asistencia') return presentes > 0;
                if (zonaFilterTab === 'sin_asistencia') return presentes === 0;
                return true;
            })
            .sort((a, b) => {
                const numA = parseInt(a[0], 10);
                const numB = parseInt(b[0], 10);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return a[0].localeCompare(b[0]);
            });
    }, [zonas, zonaSearch, zonaFilterTab]);

    // Filtrado de asistencias recientes
    const filteredAsistencias = useMemo(() => {
        if (!asistenciaSearch.trim()) return ultimasAsistencias;
        const q = asistenciaSearch.toLowerCase();
        return ultimasAsistencias.filter(
            (as) =>
                as.nombre_completo.toLowerCase().includes(q) ||
                as.documento.toLowerCase().includes(q) ||
                as.codigo?.toLowerCase().includes(q) ||
                (as.zona && `zona ${as.zona}`.toLowerCase().includes(q))
        );
    }, [ultimasAsistencias, asistenciaSearch]);

    // Filtrado de ausentes
    const filteredAusentes = useMemo(() => {
        if (!ausenteSearch.trim()) return ausentes;
        const q = ausenteSearch.toLowerCase();
        return ausentes.filter((p) => {
            const fullName = `${p.nombres} ${p.apellidos}`.toLowerCase();
            return (
                fullName.includes(q) ||
                p.documento.toLowerCase().includes(q) ||
                p.codigo?.toLowerCase().includes(q) ||
                (p.zona && `zona ${p.zona}`.toLowerCase().includes(q))
            );
        });
    }, [ausentes, ausenteSearch]);

    const getNivelBadgeClass = (nivel?: string) => {
        switch (nivel) {
            case 'Ministro Ordenado':
                return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
            case 'Licenciado':
                return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
            case 'Laico':
                return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
            case 'Pastor Asociado':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        }
    };

    return (
        <>
            <Head title={`Monitor en Vivo — ${actividad.nombre}`} />

            <div className="space-y-6">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                {/* Header Integrado del Módulo */}
                <ModuleHeader
                    icon={<BarChart3 className="size-6 text-white" />}
                    title={`Monitor en Vivo: ${actividad.nombre}`}
                    description="Métricas de asistencia en tiempo real, quórum ministerial y control de acceso por zonas"
                    colorClassName="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900"
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href="/admin/actividades">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium border-0 cursor-pointer transition-colors"
                            >
                                <ArrowLeft className="size-3.5" />
                                <span>Actividades</span>
                            </Button>
                        </Link>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium border-0 cursor-pointer transition-colors"
                        >
                            <RotateCcw className={cn('size-3.5', isRefreshing && 'animate-spin')} />
                            <span>Refrescar</span>
                        </Button>

                        <a href={`/admin/actividades/${actividad.id}/exportar-asistencia`}>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold border-0 shadow-sm cursor-pointer transition-transform hover:scale-[1.02]"
                            >
                                <FileSpreadsheet className="size-3.5" />
                                <span>Exportar CSV</span>
                            </Button>
                        </a>

                        <Link href={`/admin/actividades/${actividad.id}/escanear`}>
                            <Button
                                size="sm"
                                className="gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold shadow-md cursor-pointer transition-transform hover:scale-105"
                            >
                                <QrCode className="size-4" />
                                <span>Terminal de Escaneo</span>
                            </Button>
                        </Link>
                    </div>
                </ModuleHeader>

                {/* Grid de 4 StatCards Estandarizadas al Layout */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="QUÓRUM ALCANZADO"
                        value={`${metricas.porcentaje}%`}
                        icon={<Users className="size-5" />}
                        colorClassName="bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                        subtitle={`${metricas.total_presentes} de ${metricas.total_padron} convocados`}
                    />
                    <StatCard
                        title="CÓNYUGES PRESENTES"
                        value={metricas.con_conyuge}
                        icon={<Heart className="size-5" />}
                        colorClassName="bg-pink-100 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400"
                        subtitle="Acompañantes en sala"
                    />
                    <StatCard
                        title="KITS ENTREGADOS"
                        value={metricas.kits_entregados}
                        icon={<Package className="size-5" />}
                        colorClassName="bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400"
                        subtitle="Material acreditado"
                    />
                    <StatCard
                        title="COMIDAS SERVIDAS"
                        value={metricas.comidas_entregadas}
                        icon={<Utensils className="size-5" />}
                        colorClassName="bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                        subtitle="Raciones registradas"
                    />
                </div>

                {/* Banner de Quórum con Barra de Progreso Elegante */}
                <Card className="p-5 sm:p-6 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Participación General de Pastores
                                </span>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'font-bold text-[11px]',
                                        metricas.porcentaje >= 50
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
                                            : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300'
                                    )}
                                >
                                    {metricas.porcentaje}% Quórum
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                <strong className="text-slate-900 dark:text-white font-bold">{metricas.total_presentes}</strong> pastores registrados de un padrón total de <strong className="text-slate-900 dark:text-white font-bold">{metricas.total_padron}</strong> convocados.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 text-left sm:text-right shrink-0">
                            <div>
                                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                                    {Math.max(0, metricas.total_padron - metricas.total_presentes)}
                                </span>
                                <span className="text-xs text-slate-500 block font-medium">Pastores por registrar</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                        <Progress value={metricas.porcentaje} className="h-3 bg-slate-100 dark:bg-slate-800" />
                        <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            <span>0% Apertura</span>
                            <span>50% Quórum Legal ({Math.round(metricas.total_padron * 0.5)})</span>
                            <span>100% Total Padrón ({metricas.total_padron})</span>
                        </div>
                    </div>
                </Card>

                {/* Desglose por Niveles Ministeriales y Zonas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Niveles Ministeriales */}
                    <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm space-y-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Shield className="size-4 text-indigo-500" />
                                Asistencia por Grado Ministerial
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                                {Object.keys(niveles.convocados).length} Grados
                            </Badge>
                        </div>

                        <div className="space-y-3.5">
                            {Object.entries(niveles.convocados).map(([nivel, totalConvocados]) => {
                                const presentes = niveles.presentes[nivel] || 0;
                                const pct = totalConvocados > 0 ? Math.round((presentes / totalConvocados) * 100) : 0;

                                return (
                                    <div key={nivel} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={cn('text-[11px] font-semibold', getNivelBadgeClass(nivel))}>
                                                    {nivel || 'Sin Nivel'}
                                                </Badge>
                                            </div>
                                            <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                                                <strong className="text-slate-900 dark:text-white font-bold">{presentes}</strong> / {totalConvocados} ({pct}%)
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Zonas / Presbiterios */}
                    <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm space-y-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <MapPin className="size-4 text-emerald-500" />
                                Asistencia por Zonas Presbiteriales
                            </h3>
                            <Badge variant="secondary" className="text-xs w-fit">
                                {Object.keys(zonas.convocadas).length} Zonas Convocadas
                            </Badge>
                        </div>

                        {/* Filtros de Zonas */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Buscar por número de zona..."
                                    value={zonaSearch}
                                    onChange={(e) => setZonaSearch(e.target.value)}
                                    className="h-8 pl-8 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setZonaFilterTab('todas')}
                                    className={cn(
                                        'px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer',
                                        zonaFilterTab === 'todas'
                                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                    )}
                                >
                                    Todas
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setZonaFilterTab('con_asistencia')}
                                    className={cn(
                                        'px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer',
                                        zonaFilterTab === 'con_asistencia'
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                    )}
                                >
                                    Con Asistencia
                                </button>
                            </div>
                        </div>

                        {/* Lista de Zonas con scroll suave y cómodo */}
                        <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1.5 custom-scrollbar">
                            {filteredZonas.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-6">
                                    No se encontraron zonas que coincidan con la búsqueda.
                                </p>
                            ) : (
                                filteredZonas.map(([zona, totalConvocados]) => {
                                    const presentes = zonas.presentes[zona] || 0;
                                    const pct = totalConvocados > 0 ? Math.round((presentes / totalConvocados) * 100) : 0;

                                    return (
                                        <div
                                            key={zona}
                                            className="p-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-1.5 transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
                                        >
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                                    Zona {zona}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[11px] font-mono text-slate-500">
                                                        {presentes} / {totalConvocados}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'text-[10px] px-1.5 py-0 h-4 font-bold border-0',
                                                            pct >= 80
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                                                : pct > 0
                                                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                        )}
                                                    >
                                                        {pct}%
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                                <div
                                                    className={cn(
                                                        'h-full rounded-full transition-all duration-500',
                                                        pct >= 80
                                                            ? 'bg-emerald-500'
                                                            : pct >= 50
                                                            ? 'bg-indigo-500'
                                                            : pct > 0
                                                            ? 'bg-amber-500'
                                                            : 'bg-slate-300 dark:bg-slate-700'
                                                    )}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Card>
                </div>

                {/* Tabs de Listados: Asistentes Recientes vs Pastores Ausentes */}
                <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm">
                    <Tabs defaultValue="presentes" className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 w-full sm:w-auto">
                                <TabsTrigger value="presentes" className="gap-2 font-bold text-xs flex-1 sm:flex-none">
                                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                                    <span>Últimas Asistencias</span>
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                        {ultimasAsistencias.length}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="ausentes" className="gap-2 font-bold text-xs flex-1 sm:flex-none">
                                    <XCircle className="size-3.5 text-rose-500" />
                                    <span>Pastores Pendientes</span>
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                        {ausentes.length}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Tab: Últimas Asistencias */}
                        <TabsContent value="presentes" className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="Filtrar por nombre, cédula o zona..."
                                        value={asistenciaSearch}
                                        onChange={(e) => setAsistenciaSearch(e.target.value)}
                                        className="h-8 pl-8 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                    />
                                </div>
                                <span className="text-xs text-slate-400 hidden sm:inline">
                                    Mostrando {filteredAsistencias.length} registros
                                </span>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                            <th className="py-2.5 px-3">Pastor</th>
                                            <th className="py-2.5 px-3">Grado</th>
                                            <th className="py-2.5 px-3">Zona</th>
                                            <th className="py-2.5 px-3">Sesión</th>
                                            <th className="py-2.5 px-3">Hora</th>
                                            <th className="py-2.5 px-3">Cónyuge</th>
                                            <th className="py-2.5 px-3">Kit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/30">
                                        {filteredAsistencias.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-8 text-center text-slate-400">
                                                    No se encontraron registros de asistencia.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredAsistencias.map((as) => (
                                                <tr key={as.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="py-2.5 px-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <Avatar className="size-8 border border-slate-200 dark:border-slate-700 shrink-0">
                                                                <AvatarImage src={getFotoUrl(as.foto)} alt={as.nombre_completo} />
                                                                <AvatarFallback className="text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                                                    {getInitials(as.nombre_completo)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-bold text-slate-900 dark:text-slate-100">
                                                                    {as.nombre_completo}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-mono">
                                                                    C.I. {as.documento} {as.codigo ? `· ${as.codigo}` : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <Badge variant="outline" className={cn('text-[10px] font-semibold', getNivelBadgeClass(as.nivel_ministerial))}>
                                                            {as.nivel_ministerial || 'Pastor'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                                                        {as.zona ? `Zona ${as.zona}` : 'N/A'}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                                                        {as.sesion}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                                                        {as.fecha_registro}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        {as.asistio_con_conyuge ? (
                                                            <span className="inline-flex items-center gap-1 text-pink-600 dark:text-pink-400 font-bold text-[11px]">
                                                                <Heart className="size-3 fill-pink-500/20" /> Sí
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 text-[11px]">No</span>
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        {as.kit_entregado ? (
                                                            <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold text-[11px]">
                                                                <Package className="size-3" /> Entregado
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 text-[11px]">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </TabsContent>

                        {/* Tab: Pastores Ausentes con botón de llamada / WhatsApp rápido */}
                        <TabsContent value="ausentes" className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="Filtrar por nombre, cédula o zona..."
                                        value={ausenteSearch}
                                        onChange={(e) => setAusenteSearch(e.target.value)}
                                        className="h-8 pl-8 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                    />
                                </div>
                                <span className="text-xs text-slate-400 hidden sm:inline">
                                    Mostrando {filteredAusentes.length} pastores pendientes
                                </span>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                            <th className="py-2.5 px-3">Pastor Pendiente</th>
                                            <th className="py-2.5 px-3">Cédula</th>
                                            <th className="py-2.5 px-3">Grado</th>
                                            <th className="py-2.5 px-3">Zona</th>
                                            <th className="py-2.5 px-3">Teléfono</th>
                                            <th className="py-2.5 px-3 text-right">Acción de Contacto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/30">
                                        {filteredAusentes.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-slate-400">
                                                    No se encontraron pastores pendientes según los filtros.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredAusentes.map((p) => {
                                                const phoneRaw = p.telefono_tlf || p.telefono_hab;
                                                const phoneWa = phoneRaw ? phoneRaw.replace(/\D/g, '') : '';
                                                const waMessage = encodeURIComponent(
                                                    `Paz de Cristo Pastor ${p.nombres}, le saludamos fraternalmente del MMM Venezuela. Le recordamos registrar su asistencia a la actividad "${actividad.nombre}".`
                                                );

                                                return (
                                                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="py-2.5 px-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <Avatar className="size-8 border border-slate-200 dark:border-slate-700 shrink-0">
                                                                    <AvatarImage src={getFotoUrl(p.foto)} alt={`${p.nombres} ${p.apellidos}`} />
                                                                    <AvatarFallback className="text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                                        {getInitials(`${p.nombres} ${p.apellidos}`)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-bold text-slate-900 dark:text-slate-100">
                                                                        {p.nombres} {p.apellidos}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-400 font-mono">
                                                                        {p.codigo ? `${p.codigo}` : 'Sin código'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-mono">
                                                            {p.documento}
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            <Badge variant="outline" className={cn('text-[10px] font-semibold', getNivelBadgeClass(p.nivel_ministerial))}>
                                                                {p.nivel_ministerial || 'Pastor'}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                                                            {p.zona ? `Zona ${p.zona}` : 'N/A'}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                                                            {phoneRaw || 'No registrado'}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-right">
                                                            {phoneRaw ? (
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <a
                                                                        href={`tel:${phoneRaw}`}
                                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 inline-flex items-center transition-colors"
                                                                        title="Llamar por teléfono"
                                                                    >
                                                                        <Phone className="size-3.5" />
                                                                    </a>
                                                                    <a
                                                                        href={`https://wa.me/${phoneWa}?text=${waMessage}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-1.5 rounded-lg text-emerald-600 hover:text-white hover:bg-emerald-600 dark:hover:bg-emerald-500 inline-flex items-center transition-colors"
                                                                        title="Enviar recordatorio por WhatsApp"
                                                                    >
                                                                        <MessageCircle className="size-3.5" />
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[11px] text-slate-400 italic">Sin teléfono</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </>
    );
}
