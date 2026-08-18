import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    Users,
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
    Layers
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
import ExtensionesMapView, { PinExtension, EstadoCount } from '@/components/extensiones-map-view';

interface DashboardStats {
    total_extensiones: number;
    extensiones_activas: number;
    extensiones_inactivas: number;
    total_miembros: number;
    total_campos_blancos: number;
    total_fundadas: number;
    total_medios: number;
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
    registrosChart: RegistrosChartData;
    donutData: DonutItem[];
    extensionesRecientes: ExtensionReciente[];
    extensionesPorEstado: EstadoCount[];
    pinesMapa: PinExtension[];
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
    extensionesPorEstado = [],
    pinesMapa = [],
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

    // Configuración ApexCharts para Donut Chart de Tipo de Local
    const donutChartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'donut',
            height: 320,
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

                {/* TARJETAS DE ESTADÍSTICAS OFICIALES (STAT CARDS DEL SISTEMA) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title={__('EXTENSIONES ACTIVAS')}
                        value={stats.extensiones_activas}
                        icon={<CheckCircle2 className="size-5" />}
                        colorClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                    />
                    <StatCard
                        title={__('EXTENSIONES INACTIVAS')}
                        value={stats.extensiones_inactivas}
                        icon={<XCircle className="size-5" />}
                        colorClassName="bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                    />
                    <StatCard
                        title={__('MIEMBROS ACTIVOS')}
                        value={stats.total_miembros.toLocaleString()}
                        icon={<Users className="size-5" />}
                        colorClassName="bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                    />
                    <StatCard
                        title={__('CAMPOS BLANCOS / OBRAS')}
                        value={stats.total_campos_blancos}
                        icon={<TrendingUp className="size-5" />}
                        colorClassName="bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                    />
                </div>

                {/* SECCIÓN DE GRÁFICOS APEXCHARTS EN SECTION CARDS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Gráfico de Área: Registros en el tiempo con Filtro de Rango Temporal */}
                    <div className="lg:col-span-2">
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
                    </div>

                    {/* Gráfico Donut: Distribución por Tipo de Local */}
                    <SectionCard
                        title={__('Distribución por Tipo de Local')}
                        description={__('Porcentaje según condición del inmueble (Propio, Alquilado, etc.).')}
                    >
                        <ClientChart options={donutChartOptions} series={donutChartSeries} type="donut" height={320} />
                    </SectionCard>
                </div>

                {/* SECCIÓN 3: MAPA INTERACTIVO DE VENEZUELA A TODO ANCHO (100% WIDE) */}
                <SectionCard
                    title={__('Distribución Geográfica de Extensiones en Venezuela')}
                    description={__('Exploración interactiva en mapa Mapbox. Seleccione un estado para enfocar y ver sus extensiones.')}
                >
                    <ExtensionesMapView pines={pinesMapa} estadosCount={extensionesPorEstado} />
                </SectionCard>

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
