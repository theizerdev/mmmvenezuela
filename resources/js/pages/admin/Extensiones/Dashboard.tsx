import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    Users,
    UserCheck,
    MapPin,
    Plus,
    List,
    Radio,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar,
    ArrowUpRight,
    PieChartIcon,
    Layers,
    Sparkles
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ModuleHeader } from '@/components/module-header';
import { StatCard } from '@/components/stat-card';
import { SectionCard } from '@/components/ui/section-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';
import { useTranslate } from '@/hooks/use-translate';

interface DashboardStats {
    total_extensiones: number;
    extensiones_activas: number;
    extensiones_inactivas: number;
    total_miembros: number;
    total_miembros_general: number;
    miembros_activos: number;
    miembros_probantes: number;
    porcentaje_activos: number;
    porcentaje_probantes: number;
    total_campos_blancos: number;
    total_congregaciones: number;
    porcentaje_iglesias: number;
    porcentaje_campos_blancos: number;
    total_fundadas: number;
    total_medios: number;
}

interface MembresiaChartData {
    activos: number;
    probantes: number;
    porcentaje_activos: number;
    porcentaje_probantes: number;
    total: number;
}

interface CongregacionesChartData {
    iglesias: number;
    campos_blancos: number;
    porcentaje_iglesias: number;
    porcentaje_campos_blancos: number;
    total: number;
}

interface RegistrosChartData {
    categories: string[];
    series: number[];
}

interface DonutItem {
    label: string;
    value: number;
}

interface ExtensionReciente {
    id: number;
    nombre: string;
    created_at: string;
    fecha_humana: string;
    pastor_nombre: string;
    estado_nombre: string;
    municipio_nombre: string;
    tipo_local: string;
    activa: boolean;
}

interface DashboardProps {
    range: string;
    stats: DashboardStats;
    membresiaChart?: MembresiaChartData;
    congregacionesChart?: CongregacionesChartData;
    registrosChart: RegistrosChartData;
    donutData: DonutItem[];
    extensionesRecientes: ExtensionReciente[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Extensiones',
        href: '/admin/extensiones',
    },
    {
        title: 'Dashboard',
        href: '/admin/extensiones/dashboard',
    },
];

function ClientChart(props: any) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="h-[300px] w-full animate-pulse bg-muted/20 rounded-xl flex items-center justify-center text-xs text-muted-foreground">
                Cargando gráfica...
            </div>
        );
    }

    return <Chart {...props} />;
}

export default function ExtensionesDashboard({
    range = '3m',
    stats,
    registrosChart = { categories: [], series: [] },
    donutData = [],
    extensionesRecientes = [],
}: DashboardProps) {
    const { __ } = useTranslate();

    const handleRangeChange = (newRange: string) => {
        router.get('/admin/extensiones/dashboard', { range: newRange }, { preserveState: true, preserveScroll: true });
    };

    // Configuración ApexCharts para Registros en el Tiempo (Area Chart)
    const areaChartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'area',
            height: 320,
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: 'inherit',
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        colors: ['#4F46E5'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [0, 90, 100],
            },
        },
        xaxis: {
            categories: registrosChart.categories,
            labels: {
                style: { colors: '#64748B', fontSize: '11px' },
            },
        },
        yaxis: {
            labels: {
                style: { colors: '#64748B', fontSize: '11px' },
            },
        },
        grid: {
            borderColor: '#E2E8F0',
            strokeDashArray: 4,
        },
        tooltip: {
            theme: 'dark',
            y: { formatter: (val) => `${val} extensiones` },
        },
    };

    const areaChartSeries = [
        {
            name: __('Extensiones Registradas'),
            data: registrosChart.series,
        },
    ];

    // Configuración ApexCharts para Membresía: Activos vs Probantes (Hna Rebeca)
    const membresiaChartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'donut',
            height: 290,
            fontFamily: 'inherit',
        },
        labels: [
            `${__('Activos')} (${stats.porcentaje_activos || 0}%)`,
            `${__('Probantes')} (${stats.porcentaje_probantes || 0}%)`,
        ],
        colors: ['#10B981', '#F59E0B'],
        legend: {
            position: 'bottom',
            labels: { colors: '#64748B' },
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number) => `${Number(val).toFixed(1)}%`,
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '68%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: __('Total Miembros'),
                            fontSize: '12px',
                            color: '#64748B',
                            formatter: () => (stats.total_miembros_general || 0).toLocaleString(),
                        },
                    },
                },
            },
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: (val) => `${Number(val).toLocaleString()} miembros`,
            },
        },
    };

    const membresiaChartSeries = [stats.miembros_activos || 0, stats.miembros_probantes || 0];

    // Configuración ApexCharts para Iglesias vs Campos Blancos (Hna Rebeca)
    const congregacionesChartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'donut',
            height: 290,
            fontFamily: 'inherit',
        },
        labels: [
            `${__('Iglesias / Sedes')} (${stats.porcentaje_iglesias || 0}%)`,
            `${__('Campos Blancos')} (${stats.porcentaje_campos_blancos || 0}%)`,
        ],
        colors: ['#4F46E5', '#8B5CF6'],
        legend: {
            position: 'bottom',
            labels: { colors: '#64748B' },
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number) => `${Number(val).toFixed(1)}%`,
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '68%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: __('Total Obras'),
                            fontSize: '12px',
                            color: '#64748B',
                            formatter: () => (stats.total_congregaciones || 0).toLocaleString(),
                        },
                    },
                },
            },
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: (val) => `${Number(val).toLocaleString()} congregaciones`,
            },
        },
    };

    const congregacionesChartSeries = [stats.total_extensiones || 0, stats.total_campos_blancos || 0];

    // Configuración ApexCharts para Donut Chart de Tipo de Local
    const donutChartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'donut',
            height: 290,
            fontFamily: 'inherit',
        },
        labels: donutData.map((d) => d.label),
        colors: ['#4F46E5', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6'],
        legend: {
            position: 'bottom',
            labels: { colors: '#64748B' },
        },
        dataLabels: { enabled: true },
        plotOptions: {
            pie: {
                donut: {
                    size: '68%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: __('Total'),
                            fontSize: '12px',
                            color: '#64748B',
                            formatter: () => String(stats.total_extensiones),
                        },
                    },
                },
            },
        },
        tooltip: { theme: 'dark' },
    };

    const donutChartSeries = donutData.map((d) => d.value);

    return (
        <>
            <Head title={__('Dashboard de Extensiones')} />

            <div className="space-y-6">
                {/* BREADCRUMBS OFICIALES DEL SISTEMA */}
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                {/* MODULE HEADER ESTÁNDAR DEL PROYECTO */}
                <ModuleHeader
                    icon={<Building2 className="size-6 text-white" />}
                    title={__('Dashboard de Extensiones / Iglesias')}
                    description={__('Métricas ejecutivas de templos, analítica de crecimiento, distribución por local y ubicación interactiva.')}
                    colorClassName="bg-indigo-600"
                >
                    <Link href="/admin/extensiones/mapa">
                        <Button variant="secondary" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm text-xs sm:text-sm">
                            <MapPin className="size-4" />
                            {__('Explorador Geográfico')}
                        </Button>
                    </Link>
                    <Link href="/admin/extensiones">
                        <Button variant="secondary" className="gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow-sm text-xs sm:text-sm">
                            <List className="size-4" />
                            {__('Ver Extensiones')} ({stats.total_extensiones})
                        </Button>
                    </Link>
                    <Link href="/admin/extensiones/create">
                        <Button className="gap-2 bg-indigo-900 hover:bg-indigo-950 text-white font-semibold shadow-sm text-xs sm:text-sm">
                            <Plus className="size-4" />
                            {__('Nueva Extensión')}
                        </Button>
                    </Link>
                </ModuleHeader>

                {/* TARJETAS DE ESTADÍSTICAS: MEMBRESÍA GENERAL Y CONGREGACIONES */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title={__('TOTAL MIEMBROS EN GENERAL')}
                        value={(stats.total_miembros_general || 0).toLocaleString()}
                        subtitle={`${stats.porcentaje_activos || 0}% ${__('Activos')} · ${stats.porcentaje_probantes || 0}% ${__('Probantes')}`}
                        icon={<Users className="size-5" />}
                        colorClassName="bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                    />
                    <StatCard
                        title={__('MIEMBROS ACTIVOS')}
                        value={(stats.miembros_activos || 0).toLocaleString()}
                        subtitle={`${stats.porcentaje_activos || 0}% ${__('del total nacional')}`}
                        icon={<UserCheck className="size-5" />}
                        colorClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                    />
                    <StatCard
                        title={__('MIEMBROS PROBANTES')}
                        value={(stats.miembros_probantes || 0).toLocaleString()}
                        subtitle={`${stats.porcentaje_probantes || 0}% ${__('del total nacional')}`}
                        icon={<Clock className="size-5" />}
                        colorClassName="bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                    />
                    <StatCard
                        title={__('TOTAL CONGREGACIONES / OBRAS')}
                        value={(stats.total_congregaciones || 0).toLocaleString()}
                        subtitle={`${stats.porcentaje_iglesias || 0}% ${__('Iglesias')} · ${stats.porcentaje_campos_blancos || 0}% ${__('Campos Blancos')}`}
                        icon={<Layers className="size-5" />}
                        colorClassName="bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400"
                    />
                </div>

                {/* TARJETAS DE ESTADÍSTICAS: SEDES E INFRAESTRUCTURA */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title={__('IGLESIAS / EXTENSIONES')}
                        value={stats.total_extensiones}
                        subtitle={`${stats.porcentaje_iglesias || 0}% ${__('del total de obras')}`}
                        icon={<Building2 className="size-5" />}
                        colorClassName="bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                    />
                    <StatCard
                        title={__('SEDES ACTIVAS')}
                        value={stats.extensiones_activas}
                        subtitle={`${stats.extensiones_inactivas} ${__('inactivas')}`}
                        icon={<CheckCircle2 className="size-5" />}
                        colorClassName="bg-teal-100 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400"
                    />
                    <StatCard
                        title={__('CAMPOS BLANCOS / OBRAS')}
                        value={stats.total_campos_blancos}
                        subtitle={`${stats.porcentaje_campos_blancos || 0}% ${__('del total de obras')}`}
                        icon={<TrendingUp className="size-5" />}
                        colorClassName="bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400"
                    />
                    <StatCard
                        title={__('MEDIOS DE COMUNICACIÓN')}
                        value={stats.total_medios}
                        subtitle={`${stats.total_fundadas} ${__('iglesias fundadas')}`}
                        icon={<Radio className="size-5" />}
                        colorClassName="bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                    />
                </div>

                {/* SECCIÓN 1 DE GRÁFICOS: ESTADÍSTICAS RÁPIDAS (PROPORCIONES) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Donut 1: Membresía (Activos vs Probantes) */}
                    <SectionCard
                        title={__('Distribución de Membresía')}
                        description={__('Relación porcentual entre miembros activos y miembros probantes.')}
                    >
                        <div className="pt-2">
                            <ClientChart options={membresiaChartOptions} series={membresiaChartSeries} type="donut" height={290} />
                            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t text-center text-xs">
                                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                                    <div className="font-semibold text-emerald-700 dark:text-emerald-300">{__('Activos')}</div>
                                    <div className="text-sm font-bold text-foreground">{(stats.miembros_activos || 0).toLocaleString()}</div>
                                    <div className="text-[11px] text-emerald-600 font-medium">{stats.porcentaje_activos || 0}%</div>
                                </div>
                                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                                    <div className="font-semibold text-amber-700 dark:text-amber-300">{__('Probantes')}</div>
                                    <div className="text-sm font-bold text-foreground">{(stats.miembros_probantes || 0).toLocaleString()}</div>
                                    <div className="text-[11px] text-amber-600 font-medium">{stats.porcentaje_probantes || 0}%</div>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Donut 2: Iglesias vs Campos Blancos */}
                    <SectionCard
                        title={__('Estructura Congregacional')}
                        description={__('Proporción entre templos/iglesias constituidas y campos blancos.')}
                    >
                        <div className="pt-2">
                            <ClientChart options={congregacionesChartOptions} series={congregacionesChartSeries} type="donut" height={290} />
                            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t text-center text-xs">
                                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                                    <div className="font-semibold text-indigo-700 dark:text-indigo-300">{__('Iglesias')}</div>
                                    <div className="text-sm font-bold text-foreground">{stats.total_extensiones}</div>
                                    <div className="text-[11px] text-indigo-600 font-medium">{stats.porcentaje_iglesias || 0}%</div>
                                </div>
                                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                                    <div className="font-semibold text-purple-700 dark:text-purple-300">{__('Campos Blancos')}</div>
                                    <div className="text-sm font-bold text-foreground">{stats.total_campos_blancos}</div>
                                    <div className="text-[11px] text-purple-600 font-medium">{stats.porcentaje_campos_blancos || 0}%</div>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Donut 3: Tipo de Local */}
                    <SectionCard
                        title={__('Distribución por Tipo de Local')}
                        description={__('Porcentaje según condición del inmueble (Propio, Alquilado, etc.).')}
                    >
                        <div className="pt-2">
                            <ClientChart options={donutChartOptions} series={donutChartSeries} type="donut" height={290} />
                            <div className="mt-3 pt-3 border-t text-center text-xs text-muted-foreground">
                                {__('Total Iglesias Evaluadas')}: <strong className="text-foreground">{stats.total_extensiones}</strong>
                            </div>
                        </div>
                    </SectionCard>
                </div>

                {/* SECCIÓN 2: HISTORIAL DE REGISTROS EN EL TIEMPO */}
                <SectionCard
                    title={__('Crecimiento de Extensiones Registradas')}
                    description={__('Frecuencia de registros en el sistema durante el período seleccionado.')}
                    headerAction={
                        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border">
                            {[
                                { key: '7d', label: __('7 Días') },
                                { key: '1m', label: __('1 Mes') },
                                { key: '3m', label: __('3 Meses') },
                                { key: '1y', label: __('1 Año') },
                                { key: 'all', label: __('Todos') },
                            ].map((btn) => (
                                <Button
                                    key={btn.key}
                                    type="button"
                                    variant={range === btn.key ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => handleRangeChange(btn.key)}
                                    className="h-7 text-xs font-medium px-2.5"
                                >
                                    {btn.label}
                                </Button>
                            ))}
                        </div>
                    }
                >
                    <ClientChart options={areaChartOptions} series={areaChartSeries} type="area" height={320} />
                </SectionCard>

                {/* BANNER / ACCESO DIRECTO AL EXPLORADOR GEOGRÁFICO NACIONAL A PANTALLA COMPLETA */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-md border border-indigo-700/50">
                    <div className="absolute -right-8 -top-8 size-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1 max-w-2xl">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                                    <MapPin className="size-3 mr-1" />
                                    {__('100% Geolocalizado')}
                                </span>
                                <span className="text-xs text-indigo-200">
                                    {stats.total_extensiones} {__('templos registrados')}
                                </span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                                {__('Centro de Mando Geográfico y Cartografía Nacional')}
                            </h3>
                            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                                {__('Explora todo el territorio venezolano a pantalla completa con fotografía satelital de alta resolución, búsqueda instantánea, agrupación de templos (clustering), filtros por Zona (1-43) y Distrito, y cálculo de rutas GPS.')}
                            </p>
                        </div>

                        <Link href="/admin/extensiones/mapa">
                            <Button size="lg" className="gap-2 bg-white text-indigo-900 hover:bg-indigo-50 font-bold shadow-lg shrink-0 text-xs sm:text-sm">
                                <MapPin className="size-4 text-indigo-600" />
                                {__('Abrir Mapa en Pantalla Completa')}
                                <ArrowUpRight className="size-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* SECCIÓN 4: LÍNEA DE TIEMPO DE EXTENSIONES RECIENTES */}
                <SectionCard
                    title={__('Extensiones Recientes (Línea de Tiempo)')}
                    description={__('Últimos registros de iglesias y extensiones ingresados al sistema.')}
                    headerAction={
                        <Link href="/admin/extensiones">
                            <Button variant="ghost" size="sm" className="text-xs gap-1">
                                {__('Ver todas')}
                                <ArrowUpRight className="size-3.5" />
                            </Button>
                        </Link>
                    }
                >
                    {extensionesRecientes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {extensionesRecientes.map((item) => (
                                <div key={item.id} className="relative group">
                                    <div className="bg-card border rounded-lg p-3.5 hover:border-indigo-300 transition-colors shadow-2xs">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <Link
                                                href={`/admin/extensiones/${item.id}/edit`}
                                                className="font-bold text-sm text-foreground hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                                            >
                                                <Building2 className="size-4 text-indigo-600" />
                                                {item.nombre}
                                            </Link>
                                            <Badge variant={item.activa ? 'default' : 'secondary'} className="text-[10px] h-5">
                                                {item.activa ? __('ACTIVA') : __('INACTIVA')}
                                            </Badge>
                                        </div>

                                        <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1.5 pt-1 border-t">
                                            <div>
                                                <strong>{__('Pastor:')}</strong> {item.pastor_nombre}
                                            </div>
                                            <div>
                                                <strong>{__('Ubicación:')}</strong> {item.estado_nombre}
                                            </div>
                                            <div>
                                                <strong>{__('Local:')}</strong> {item.tipo_local}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground/80 font-mono text-right">
                                                {item.fecha_humana}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-xs text-muted-foreground">
                            {__('No hay extensiones registradas recientemente.')}
                        </div>
                    )}
                </SectionCard>
            </div>
        </>
    );
}
