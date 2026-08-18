import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    LayoutDashboard,
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
import { ModuleHeader } from '@/components/module-header';
import { StatCard } from '@/components/stat-card';
import { SectionCard } from '@/components/ui/section-card';
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
        href: '/dashboard',
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

export default function Dashboard({
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

    // ApexCharts Options: Pastores por Zona
    const zonasChartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: 'inherit',
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '55%',
                distributed: true,
            },
        },
        colors: ['#4F46E5', '#6366F1', '#818CF8', '#3B82F6', '#60A5FA', '#10B981', '#34D399', '#F59E0B', '#8B5CF6', '#EC4899'],
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

    // ApexCharts Options: Donut Género
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

    // ApexCharts Options: Donut Salud
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

                {/* ModuleHeader Estándar del Proyecto */}
                <ModuleHeader
                    icon={<LayoutDashboard className="size-6 text-white" />}
                    title={__('Dashboard Ministerial')}
                    description={__('Resumen ejecutivo de pastores, distribución geográfica por zonas, salud y registros recientes.')}
                    colorClassName="bg-indigo-600"
                >
                    <Link href="/admin/pastores">
                        <Button variant="secondary" className="gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow-sm text-xs sm:text-sm">
                            <Users className="size-4" />
                            {__('Ver Pastores')} ({totalPastores})
                        </Button>
                    </Link>
                    <Link href="/admin/pastores/create">
                        <Button className="gap-2 bg-indigo-900 hover:bg-indigo-950 text-white font-semibold shadow-sm text-xs sm:text-sm">
                            <Plus className="size-4" />
                            {__('Nuevo Pastor')}
                        </Button>
                    </Link>
                </ModuleHeader>

                {/* StatCards Estándar por Grado Ministerial */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title={__('COLABORADORES')}
                        value={gradosStats.colaboradores}
                        icon={<Users className="size-5" />}
                        colorClassName="bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                    />
                    <StatCard
                        title={__('LAICOS')}
                        value={gradosStats.laicos}
                        icon={<UserCheck className="size-5" />}
                        colorClassName="bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                    />
                    <StatCard
                        title={__('LICENCIADOS')}
                        value={gradosStats.licenciados}
                        icon={<BookOpen className="size-5" />}
                        colorClassName="bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400"
                    />
                    <StatCard
                        title={__('MINISTROS ORDENADOS')}
                        value={gradosStats.ordenados}
                        icon={<Award className="size-5" />}
                        colorClassName="bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                    />
                </div>

                {/* Gráficas ApexCharts en SectionCard */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Pastores por Zona */}
                    <div className="lg:col-span-7">
                        <SectionCard
                            title={__('Distribución de Pastores por Zona')}
                            description={__('Cantidad de pastores registrados por cada zona geográfica nacional')}
                        >
                            <div className="pt-2">
                                <ClientChart
                                    options={zonasChartOptions}
                                    series={[{ name: __('Pastores'), data: zonasChart.series }]}
                                    type="bar"
                                    height={320}
                                />
                            </div>
                        </SectionCard>
                    </div>

                    {/* Gráficas Donut */}
                    <div className="lg:col-span-5 grid grid-cols-1 gap-6">
                        <SectionCard title={__('Distribución por Género')}>
                            <ClientChart
                                options={generoChartOptions}
                                series={[generoChart.masculino, generoChart.femenino]}
                                type="donut"
                                height={220}
                            />
                        </SectionCard>

                        <SectionCard title={__('Estado de Salud')}>
                            <ClientChart
                                options={saludChartOptions}
                                series={[saludChart.sanos, saludChart.enfermos]}
                                type="donut"
                                height={220}
                            />
                        </SectionCard>
                    </div>
                </div>

                {/* Timeline en SectionCard */}
                <SectionCard
                    title={__('Pastores Recientemente Registrados')}
                    description={__('Línea de tiempo con las últimas altas en el sistema')}
                    headerAction={
                        <Link href="/admin/pastores">
                            <Button variant="ghost" size="sm" className="gap-1 text-xs text-indigo-600">
                                {__('Ver Todos')}
                                <ChevronRight className="size-4" />
                            </Button>
                        </Link>
                    }
                >
                    <div className="relative pl-6 space-y-5 my-2 before:absolute before:left-2.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-border">
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
                </SectionCard>
            </div>
        </>
    );
}
