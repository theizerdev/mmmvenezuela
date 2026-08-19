import { Head, router } from '@inertiajs/react';
import {
    Activity,
    PlusCircle,
    Edit3,
    Trash2,
    LogIn,
    Globe,
    User as UserIcon,
    Eye,
    Calendar,
    Search,
    Clock,
    FileText,
} from 'lucide-react';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import type { ColumnDef } from '@/components/data-table';
import { DataTable } from '@/components/data-table';
import { FilterBar, FilterField } from '@/components/filter-bar';
import { ModuleHeader } from '@/components/module-header';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslate } from '@/hooks/use-translate';
import { cleanParams, cn } from '@/lib/utils';
import type { Paginated } from '@/types/app';

interface ActivityUser {
    id: number;
    name: string;
    email: string;
}

interface ActivityLog {
    id: number;
    log_name: string;
    description: string;
    event: string;
    subject_type: string;
    subject_id?: number | null;
    causer?: ActivityUser | null;
    properties: Record<string, any>;
    ip_address: string;
    user_agent?: string | null;
    created_at: string;
    created_at_human: string;
}

interface Props {
    activities: Paginated<ActivityLog>;
    stats: {
        total_today: number;
        creations_today: number;
        updates_today: number;
        deletions_today: number;
        logins_today: number;
    };
    users: ActivityUser[];
    filters: {
        search?: string;
        event?: string;
        causer_id?: string;
        date_from?: string;
        date_to?: string;
        perPage?: string;
    };
}

export default function ActivityMonitoringIndexPage({
    activities,
    stats,
    users,
    filters,
}: Props) {
    const { __ } = useTranslate();

    const breadcrumbs = [
        { title: __('Dashboard'), href: '/admin/dashboard' },
        { title: __('Monitoring'), href: '/admin/monitoring/server' },
        { title: __('System Activities'), href: '/admin/monitoring/activities' },
    ];

    // States
    const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
    const [isTableLoading, setIsTableLoading] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [eventFilter, setEventFilter] = useState(filters.event || '');
    const [causerFilter, setCauserFilter] = useState(filters.causer_id || '');
    const [dateFromFilter, setDateFromFilter] = useState(filters.date_from || '');
    const [dateToFilter, setDateToFilter] = useState(filters.date_to || '');
    const [perPageFilter, setPerPageFilter] = useState(filters.perPage || '15');

    // Filter Query debouncing
    React.useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                window.location.pathname,
                cleanParams({
                    search: searchTerm,
                    event: eventFilter,
                    causer_id: causerFilter,
                    date_from: dateFromFilter,
                    date_to: dateToFilter,
                    perPage: perPageFilter,
                }),
                { preserveState: true, preserveScroll: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, eventFilter, causerFilter, dateFromFilter, dateToFilter, perPageFilter]);

    const getEventBadge = (event: string, logName: string) => {
        if (logName === 'autenticacion') {
            return (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800 gap-1">
                    <LogIn className="w-3 h-3" />
                    Acceso
                </Badge>
            );
        }

        switch (event) {
            case 'created':
                return (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800 gap-1">
                        <PlusCircle className="w-3 h-3" />
                        Creado
                    </Badge>
                );
            case 'updated':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800 gap-1">
                        <Edit3 className="w-3 h-3" />
                        Actualizado
                    </Badge>
                );
            case 'deleted':
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800 gap-1">
                        <Trash2 className="w-3 h-3" />
                        Eliminado
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 gap-1">
                        <Activity className="w-3 h-3" />
                        {event}
                    </Badge>
                );
        }
    };

    const columns: ColumnDef<ActivityLog>[] = [
        {
            header: 'Usuario',
            cell: (act) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-semibold text-xs text-indigo-600 dark:text-indigo-400">
                        {act.causer ? act.causer.name.substring(0, 2).toUpperCase() : 'SYS'}
                    </div>
                    <div>
                        <p className="font-medium text-xs text-slate-900 dark:text-slate-100">
                            {act.causer ? act.causer.name : 'Sistema'}
                        </p>
                        {act.causer && <p className="text-[11px] text-muted-foreground">{act.causer.email}</p>}
                    </div>
                </div>
            ),
        },
        {
            header: 'Acción',
            cell: (act) => getEventBadge(act.event, act.log_name),
        },
        {
            header: 'Módulo / Descripción',
            cell: (act) => (
                <div className="max-w-md">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{act.subject_type}</span>
                        {act.subject_id && <span className="text-slate-400 text-[11px]">(ID: #{act.subject_id})</span>}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5" title={act.description}>
                        {act.description}
                    </p>
                </div>
            ),
        },
        {
            header: 'Dirección IP',
            hideOn: 'mobile',
            cell: (act) => (
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" />
                    {act.ip_address}
                </span>
            ),
        },
        {
            header: 'Fecha y Hora',
            cell: (act) => (
                <div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{act.created_at}</p>
                    <p className="text-[11px] text-muted-foreground">{act.created_at_human}</p>
                </div>
            ),
        },
        {
            header: 'Detalles',
            className: 'text-right',
            stopRowClick: true,
            cell: (act) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                    onClick={() => setSelectedActivity(act)}
                >
                    <Eye className="w-3.5 h-3.5" />
                    Ver Cambios
                </Button>
            ),
        },
    ];

    return (
        <>
            <Head title={__('System Activities')} />

            <div className="space-y-6">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                <ModuleHeader
                    icon={<Activity className="h-6 w-6 text-white" />}
                    title={__('System Activities')}
                    description={__('Audit log, user actions, model changes, and authentication history.')}
                    colorClassName="bg-indigo-600"
                />

                {/* Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        icon={<Activity className="h-5 w-5" />}
                        title={__('ACTIVITIES TODAY')}
                        value={stats.total_today}
                        colorClassName="bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                    />
                    <StatCard
                        icon={<PlusCircle className="h-5 w-5" />}
                        title={__('CREATIONS')}
                        value={stats.creations_today}
                        colorClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                    />
                    <StatCard
                        icon={<Edit3 className="h-5 w-5" />}
                        title={__('UPDATES')}
                        value={stats.updates_today}
                        colorClassName="bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                    />
                    <StatCard
                        icon={<Trash2 className="h-5 w-5" />}
                        title={__('DELETIONS')}
                        value={stats.deletions_today}
                        colorClassName="bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                    />
                    <StatCard
                        icon={<LogIn className="h-5 w-5" />}
                        title={__('LOGINS')}
                        value={stats.logins_today}
                        colorClassName="bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
                    />
                </div>

                {/* FilterBar */}
                <FilterBar>
                    <div className="flex flex-wrap items-end gap-3 w-full">
                        <FilterField label={__('Search')}>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={__('Search description, IP...')}
                                    className="pl-8 w-full md:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </FilterField>

                        <FilterField label={__('Event')}>
                            <Select value={eventFilter} onValueChange={setEventFilter}>
                                <SelectTrigger className="w-full md:w-40">
                                    <SelectValue placeholder={__('All events')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">{__('All events')}</SelectItem>
                                    <SelectItem value="created">{__('Created')}</SelectItem>
                                    <SelectItem value="updated">{__('Updated')}</SelectItem>
                                    <SelectItem value="deleted">{__('Deleted')}</SelectItem>
                                    <SelectItem value="autenticacion">{__('Authentication')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FilterField>

                        <FilterField label={__('User')}>
                            <Select value={causerFilter} onValueChange={setCauserFilter}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder={__('All users')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">{__('All users')}</SelectItem>
                                    {users.map((u) => (
                                        <SelectItem key={u.id} value={String(u.id)}>
                                            {u.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FilterField>

                        <FilterField label={__('Date From')}>
                            <Input
                                type="date"
                                value={dateFromFilter}
                                onChange={(e) => setDateFromFilter(e.target.value)}
                                className="w-full md:w-36"
                            />
                        </FilterField>

                        <FilterField label={__('Date To')}>
                            <Input
                                type="date"
                                value={dateToFilter}
                                onChange={(e) => setDateToFilter(e.target.value)}
                                className="w-full md:w-36"
                            />
                        </FilterField>

                        <FilterField label={__('Per page')}>
                            <Select value={perPageFilter} onValueChange={setPerPageFilter}>
                                <SelectTrigger className="w-full md:w-28">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15</SelectItem>
                                    <SelectItem value="30">30</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </FilterField>
                    </div>
                </FilterBar>

                {/* Table */}
                <div className="w-full">
                    <DataTable
                        data={activities}
                        columns={columns}
                        isLoading={isTableLoading}
                        onRowClick={(act) => setSelectedActivity(act)}
                        emptyState={{
                            title: 'No activity logs found',
                            description: 'No system activities match your selected filter criteria.',
                        }}
                    />
                </div>
            </div>

            {/* Modal de Detalles de Actividad */}
            <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
                <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
                    {selectedActivity && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-base">
                                    <Activity className="w-5 h-5 text-indigo-600" />
                                    Detalle de Actividad #{selectedActivity.id}
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedActivity.description}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 mt-2">
                                {/* Metadata */}
                                <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-lg border text-xs">
                                    <div>
                                        <span className="font-semibold text-muted-foreground">Usuario:</span>
                                        <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                                            {selectedActivity.causer ? selectedActivity.causer.name : 'Sistema'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-muted-foreground">Módulo / Entidad:</span>
                                        <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                                            {selectedActivity.subject_type} {selectedActivity.subject_id ? `(#${selectedActivity.subject_id})` : ''}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-muted-foreground">Dirección IP:</span>
                                        <p className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                                            {selectedActivity.ip_address}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-muted-foreground">Fecha y Hora:</span>
                                        <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                                            {selectedActivity.created_at}
                                        </p>
                                    </div>
                                </div>

                                {/* Property Diffs */}
                                {selectedActivity.properties && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            Detalles de Cambios y Propiedades
                                        </h4>
                                        <div className="bg-slate-950 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-60 border">
                                            <pre className="whitespace-pre-wrap leading-relaxed">
                                                {JSON.stringify(selectedActivity.properties, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="mt-4">
                                <Button variant="outline" size="sm" onClick={() => setSelectedActivity(null)}>
                                    Cerrar
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
