import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    UserCheck,
    Users,
    Award,
    BookOpen,
    Plus,
    Clock,
    Activity,
    Heart,
    ChevronRight,
    MapPin,
    Building2,
    ShieldCheck,
    CheckCircle2
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';
import { useTranslate } from '@/hooks/use-translate';

interface RecentPastor {
    id: number;
    codigo: string;
    nombres: string;
    apellidos: string;
    nivel_ministerial: string;
    zona: string;
    distrito: string;
    foto?: string | null;
    created_at_human: string;
    created_at_date: string;
}

interface DashboardProps {
    totalPastores: number;
    activosCount: number;
    inactivosCount: number;
    gradosStats: {
        colaboradores: number;
        laicos: number;
        licenciados: number;
        ordenados: number;
    };
    zonasChart: {
        labels: string[];
        series: number[];
    };
    generoChart: {
        masculino: number;
        femenino: number;
    };
    saludChart: {
        sanos: number;
        enfermos: number;
    };
    recentPastores: RecentPastor[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

function ClientChart(props: any) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="h-64 w-full animate-pulse bg-muted/20 rounded-xl flex items-center justify-center text-xs text-muted-foreground">
                Cargando gráfica...
            </div>
        );
    }

    return <Chart {...props} />;
}

export default function AdminDashboard({
    totalPastores = 0,
    activosCount = 0,
    inactivosCount = 0,
    gradosStats = { colaboradores: 0, laicos: 0, licenciados: 0, ordenados: 0 },
    zonasChart = { labels: [], series: [] },
    generoChart = { masculino: 0, femenino: 0 },
    saludChart = { sanos: 0, enfermos: 0 },
    recentPastores = [],
}: DashboardProps) {
    const { __ } = useTranslate();

    // Configuración ApexCharts: Pastores por Zona (Bar Column Chart)
    const zonasChartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: 'inherit',
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '50%',
                distributed: true,
            },
        },
        colors: ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#3B82F6', '#60A5FA', '#93C5FD', '#10B981', '#34D399', '#F59E0B', '#8B5CF6'],
        dataLabels: {
            enabled: true,
            style: { fontSize: '11px', fontWeight: 'bold' },
            dropShadow: { enabled: false },
        },
        legend: { show: false },
        xaxis: {
            categories: zonasChart.labels,
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
            y: {
                formatter: (val) => `${val} pastores`,
            },
        },
    };

    // Configuración ApexCharts: Distribución por Género (Donut Chart)
    const generoChartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'donut',
            fontFamily: 'inherit',
        },
        labels: [__('Masculino'), __('Femenino')],
        colors: ['#3B82F6', '#EC4899'],
        legend: {
            position: 'bottom',
            labels: { colors: '#64748B' },
        },
        dataLabels: { enabled: true },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: __('Total'),
                            fontSize: '12px',
                            color: '#64748B',
                            formatter: () => `${totalPastores}`,
                        },
                    },
                },
            },
        },
        tooltip: { theme: 'dark' },
    };

    // Configuración ApexCharts: Estado de Salud (Donut Chart)
    const saludChartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'donut',
            fontFamily: 'inherit',
        },
        labels: [__('Pastores Sanos'), __('Con Padecimientos')],
        colors: ['#10B981', '#F59E0B'],
        legend: {
            position: 'bottom',
            labels: { colors: '#64748B' },
        },
        dataLabels: { enabled: true },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: __('Evaluados'),
                            fontSize: '12px',
                            color: '#64748B',
                            formatter: () => `${totalPastores}`,
                        },
                    },
                },
            },
        },
        tooltip: { theme: 'dark' },
    };

    const getPastorInitials = (nombres?: string, apellidos?: string) => {
        const n = nombres?.trim()?.[0] || '';
        const a = apellidos?.trim()?.[0] || '';
        return `${n}${a}`.toUpperCase() || 'P';
    };

    return (
        <>
            <Head title={__('Dashboard Ministerial')} />

            <div className="space-y-6">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                {/* Encabezado del Dashboard */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border rounded-2xl p-5 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                {__('Dashboard Ministerial MMM Venezuela')}
                            </h1>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300">
                                <CheckCircle2 className="size-3 mr-1" />
                                {activosCount} {__('Activos')}
                            </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {__('Resumen ejecutivo de pastores, distribución geográfica por zonas, salud y registros recientes.')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/admin/pastores">
                            <Button variant="outline" className="gap-2 text-xs sm:text-sm">
                                <Users className="size-4" />
                                {__('Ver Pastores')} ({totalPastores})
                            </Button>
                        </Link>
                        <Link href="/admin/pastores/create">
                            <Button className="gap-2 shadow text-xs sm:text-sm">
                                <Plus className="size-4" />
                                {__('Nuevo Pastor')}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* 1. Tarjetas por Grado Ministerial */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Colaboradores */}
                    <div className="bg-card border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between border-l-4 border-l-amber-500">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {__('Colaboradores')}
                            </span>
                            <div className="text-2xl font-bold text-foreground mt-1">
                                {gradosStats.colaboradores}
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                {totalPastores > 0 ? Math.round((gradosStats.colaboradores / totalPastores) * 100) : 0}% {__('del total')}
                            </span>
                        </div>
                        <div className="size-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Users className="size-6" />
                        </div>
                    </div>

                    {/* Laicos */}
                    <div className="bg-card border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between border-l-4 border-l-blue-500">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {__('Laicos')}
                            </span>
                            <div className="text-2xl font-bold text-foreground mt-1">
                                {gradosStats.laicos}
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                {totalPastores > 0 ? Math.round((gradosStats.laicos / totalPastores) * 100) : 0}% {__('del total')}
                            </span>
                        </div>
                        <div className="size-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <UserCheck className="size-6" />
                        </div>
                    </div>

                    {/* Licenciados */}
                    <div className="bg-card border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between border-l-4 border-l-purple-500">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {__('Licenciados')}
                            </span>
                            <div className="text-2xl font-bold text-foreground mt-1">
                                {gradosStats.licenciados}
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                {totalPastores > 0 ? Math.round((gradosStats.licenciados / totalPastores) * 100) : 0}% {__('del total')}
                            </span>
                        </div>
                        <div className="size-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                            <BookOpen className="size-6" />
                        </div>
                    </div>

                    {/* Ministros Ordenados */}
                    <div className="bg-card border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between border-l-4 border-l-indigo-600">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {__('Ministros Ordenados')}
                            </span>
                            <div className="text-2xl font-bold text-foreground mt-1">
                                {gradosStats.ordenados}
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                {totalPastores > 0 ? Math.round((gradosStats.ordenados / totalPastores) * 100) : 0}% {__('del total')}
                            </span>
                        </div>
                        <div className="size-12 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Award className="size-6" />
                        </div>
                    </div>
                </div>

                {/* 2. Sección Gráficas ApexCharts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Gráfica por Zonas (Column Bar Chart) */}
                    <div className="lg:col-span-7 bg-card border rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                                    <MapPin className="size-5 text-indigo-600" />
                                    {__('Distribución de Pastores por Zona')}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {__('Cantidad de pastores registrados por cada zona geográfica nacional')}
                                </p>
                            </div>
                        </div>
                        <div className="pt-2">
                            <ClientChart
                                options={zonasChartOptions}
                                series={[{ name: __('Pastores'), data: zonasChart.series }]}
                                type="bar"
                                height={300}
                            />
                        </div>
                    </div>

                    {/* Gráficas Donut (Género y Salud) */}
                    <div className="lg:col-span-5 grid grid-cols-1 gap-6">
                        {/* Donut Género */}
                        <div className="bg-card border rounded-2xl p-5 shadow-xs space-y-3">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                                    <Users className="size-4 text-blue-500" />
                                    {__('Distribución por Género')}
                                </h3>
                            </div>
                            <ClientChart
                                options={generoChartOptions}
                                series={[generoChart.masculino, generoChart.femenino]}
                                type="donut"
                                height={220}
                            />
                        </div>

                        {/* Donut Salud */}
                        <div className="bg-card border rounded-2xl p-5 shadow-xs space-y-3">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                                    <Activity className="size-4 text-emerald-500" />
                                    {__('Estado de Salud')}
                                </h3>
                            </div>
                            <ClientChart
                                options={saludChartOptions}
                                series={[saludChart.sanos, saludChart.enfermos]}
                                type="donut"
                                height={220}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Timeline: Pastores Recientemente Agregados */}
                <div className="bg-card border rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                        <div>
                            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                                <Clock className="size-5 text-indigo-600" />
                                {__('Pastores Recientemente Registrados')}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {__('Línea de tiempo con las últimas altas en el sistema')}
                            </p>
                        </div>
                        <Link href="/admin/pastores">
                            <Button variant="ghost" size="sm" className="gap-1 text-xs text-indigo-600">
                                {__('Ver Todos')}
                                <ChevronRight className="size-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
                        {recentPastores.length > 0 ? (
                            recentPastores.map((pastor) => {
                                const initials = getPastorInitials(pastor.nombres, pastor.apellidos);
                                return (
                                    <div key={pastor.id} className="relative flex items-center justify-between gap-4 group">
                                        {/* Punto de tiempo */}
                                        <div className="absolute -left-6 top-1.5 size-5 rounded-full border-2 border-background bg-indigo-600 ring-2 ring-indigo-100 dark:ring-indigo-950 flex items-center justify-center shrink-0">
                                            <div className="size-1.5 bg-white rounded-full" />
                                        </div>

                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <Avatar className="size-10 border shrink-0">
                                                {pastor.foto && <AvatarImage src={pastor.foto} className="object-cover" />}
                                                <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-xs">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-sm text-foreground hover:text-indigo-600 transition-colors truncate">
                                                        {pastor.nombres} {pastor.apellidos}
                                                    </span>
                                                    <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                                                        {pastor.codigo}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                                                    <span>{pastor.nivel_ministerial}</span>
                                                    <span>•</span>
                                                    <span>Zona {pastor.zona || '—'} · Dist. {pastor.distrito || '—'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                                                {pastor.created_at_human}
                                            </span>
                                            <div className="text-[10px] text-muted-foreground mt-0.5">
                                                {pastor.created_at_date}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-xs text-muted-foreground py-4 text-center">
                                {__('No se registran pastores recientes.')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}