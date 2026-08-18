import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    UserCheck, 
    Plus, 
    CheckCircle, 
    XCircle, 
    Trash2, 
    MoreVertical, 
    Pencil, 
    ToggleRight, 
    Award, 
    Heart, 
    Phone, 
    MapPin,
    FileText
} from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import type { ColumnDef } from '@/components/data-table';
import { DataTable } from '@/components/data-table';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { FilterBar, FilterField } from '@/components/filter-bar';
import { ModuleHeader } from '@/components/module-header';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select2 } from '@/components/ui/select2';
import { cn, cleanParams } from '@/lib/utils';
import type { Auth } from '@/types';
import type { Paginated } from '@/types/app';
import { useTranslate } from '@/hooks/use-translate';

export interface Pastor {
    id: number;
    codigo: string;
    nombres: string;
    apellidos: string;
    documento: string;
    genero?: string;
    edad?: number;
    fe_nacimiento?: string;
    foto?: string;
    estado_civil?: string;
    nombre_conyuge?: string;
    conyuge_id?: number;
    conyuge?: Pastor;
    nivel_ministerial: 'Colaborador' | 'Laico' | 'Licenciado' | 'Ministro Ordenado';
    zona?: string;
    distrito?: string;
    cargo_nacional?: string;
    telefono_tlf?: string;
    telefono_hab?: string;
    status: boolean;
    created_at?: string;
}

interface PastoresPageProps {
    auth: Auth;
    pastores: Paginated<Pastor>;
    stats: {
        total: number;
        activos: number;
        inactivos: number;
        ordenados: number;
    };
    filters: {
        search?: string;
        nivel_ministerial?: string;
        status?: string;
        zona?: string;
        distrito?: string;
        perPage?: string;
        sortBy?: string;
        sortDir?: string;
    };
}

export default function PastoresIndexPage({ auth, pastores, stats, filters }: PastoresPageProps) {
    const { __ } = useTranslate();

    const breadcrumbs = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('Pastors'), href: '/admin/pastores' },
    ];

    const userPermissions = (auth as any)?.user?.permissions || [];
    const hasPermission = (perm: string) => userPermissions.includes(perm);

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [nivelFilter, setNivelFilter] = useState(filters.nivel_ministerial || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [perPageFilter, setPerPageFilter] = useState(filters.perPage || '10');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        const unbindStart = router.on('start', () => setIsTableLoading(true));
        const unbindFinish = router.on('finish', () => setIsTableLoading(false));

        return () => {
            unbindStart();
            unbindFinish();
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                window.location.pathname,
                cleanParams({
                    search: searchTerm,
                    nivel_ministerial: nivelFilter,
                    status: statusFilter,
                    perPage: perPageFilter,
                    sortBy: filters.sortBy,
                    sortDir: filters.sortDir,
                }),
                { preserveState: true, preserveScroll: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, nivelFilter, statusFilter, perPageFilter]);

    const handleToggleStatus = (pastor: Pastor) => {
        router.post(`/admin/pastores/${pastor.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const handleConfirmBulkDelete = () => {
        router.post('/admin/pastores/bulk-destroy', { ids: selectedIds }, {
            onSuccess: () => {
                setSelectedIds([]);
                setIsDeleteDialogOpen(false);
            },
        });
    };

    const getNivelBadge = (nivel: string) => {
        switch (nivel) {
            case 'Ministro Ordenado':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-950/50 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-300">
                        <span className="size-1.5 rounded-full bg-purple-500" />
                        {__(nivel)}
                    </span>
                );
            case 'Licenciado':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-950/50 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                        <span className="size-1.5 rounded-full bg-blue-500" />
                        {__(nivel)}
                    </span>
                );
            case 'Laico':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/50 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
                        <span className="size-1.5 rounded-full bg-amber-500" />
                        {__(nivel)}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        {__(nivel)}
                    </span>
                );
        }
    };

    const columns: ColumnDef<Pastor>[] = [
        {
            accessorKey: 'codigo',
            header: __('Code'),
            cell: (row) => (
                <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {row.codigo}
                </span>
            ),
            sortable: true,
        },
        {
            accessorKey: 'nombres',
            header: __('Pastor'),
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <Avatar className="size-9 border">
                        <AvatarImage src={row.foto || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {row.nombres?.[0]}{row.apellidos?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-foreground truncate">
                            {row.nombres} {row.apellidos}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                            {row.documento} {row.cargo_nacional ? `• ${row.cargo_nacional}` : ''}
                        </span>
                    </div>
                </div>
            ),
            sortable: true,
            sortKey: 'nombres',
        },
        {
            accessorKey: 'nivel_ministerial',
            header: __('Ministerial Grade'),
            cell: (row) => getNivelBadge(row.nivel_ministerial),
            sortable: true,
        },
        {
            accessorKey: 'zona',
            header: __('Zone / District'),
            cell: (row) => (
                <div className="flex flex-col text-xs">
                    <span className="font-medium text-foreground">{row.distrito || '—'}</span>
                    <span className="text-muted-foreground">{row.zona || '—'}</span>
                </div>
            ),
        },
        {
            accessorKey: 'nombre_conyuge',
            header: __('Spouse'),
            cell: (row) => (
                <div className="flex items-center gap-1 text-xs">
                    {row.conyuge ? (
                        <span className="flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400">
                            <Heart className="size-3 fill-rose-500 text-rose-500 shrink-0" />
                            {row.conyuge.nombres} {row.conyuge.apellidos}
                        </span>
                    ) : row.nombre_conyuge ? (
                        <span className="text-muted-foreground">{row.nombre_conyuge}</span>
                    ) : (
                        <span className="italic text-slate-400">—</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'telefono_tlf',
            header: __('Phone'),
            cell: (row) => (
                <span className="text-xs font-mono text-muted-foreground">
                    {row.telefono_tlf || row.telefono_hab || '—'}
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: __('Status'),
            cell: (row) => (
                <span
                    className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                        row.status
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                    )}
                >
                    <span
                        className={cn(
                            'size-1.5 rounded-full',
                            row.status ? 'bg-emerald-500' : 'bg-slate-400'
                        )}
                    />
                    {row.status ? __('Active') : __('Inactive')}
                </span>
            ),
            sortable: true,
        },
        {
            accessorKey: 'id',
            header: __('Actions'),
            cell: (row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {hasPermission('pastores.edit') && (
                            <>
                                <DropdownMenuItem asChild>
                                    <a href={`/admin/pastores/${row.id}/planilla`} target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer">
                                        <FileText className="mr-2 size-4 text-emerald-500" />
                                        {__('Planilla PDF')}
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/pastores/${row.id}/edit`} className="flex items-center cursor-pointer">
                                        <Pencil className="mr-2 size-4 text-blue-500" />
                                        {__('Edit')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(row)}>
                                    <ToggleRight className="mr-2 size-4 text-amber-500" />
                                    {row.status ? __('Deactivate') : __('Activate')}
                                </DropdownMenuItem>
                            </>
                        )}
                        {hasPermission('pastores.delete') && (
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedIds([row.id]);
                                    setIsDeleteDialogOpen(true);
                                }}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 size-4" />
                                {__('Delete')}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <>
            <Head title={__('Pastors of Venezuela')} />

            <div className="space-y-6">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                <ModuleHeader
                    icon={<UserCheck className="size-6 text-white" />}
                    title={__('Pastors of Venezuela')}
                    description={__('Management of pastors, ministerial grades and ecclesiastical records')}
                    colorClassName="bg-indigo-600"
                >
                    {hasPermission('pastores.create') && (
                        <Link href="/admin/pastores/create">
                            <Button variant="secondary" className="gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow-sm">
                                <Plus className="size-4" />
                                {__('New Pastor')}
                            </Button>
                        </Link>
                    )}
                </ModuleHeader>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title={__('TOTAL PASTORS')}
                        value={stats.total}
                        icon={<UserCheck className="size-5" />}
                        colorClassName="bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                    />
                    <StatCard
                        title={__('ACTIVE PASTORS')}
                        value={stats.activos}
                        icon={<CheckCircle className="size-5" />}
                        colorClassName="bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400"
                    />
                    <StatCard
                        title={__('INACTIVE PASTORS')}
                        value={stats.inactivos}
                        icon={<XCircle className="size-5" />}
                        colorClassName="bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                    />
                    <StatCard
                        title={__('ORDAINED MINISTERS')}
                        value={stats.ordenados}
                        icon={<Award className="size-5" />}
                        colorClassName="bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400"
                    />
                </div>

                {/* Main Content & Filters */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
                        <h2 className="text-lg font-bold tracking-tight text-foreground">
                            {__('Pastors List')}
                        </h2>

                        {selectedIds.length > 0 && hasPermission('pastores.delete') && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                className="gap-2"
                            >
                                <Trash2 className="size-4" />
                                {__('Delete selected')} ({selectedIds.length})
                            </Button>
                        )}
                    </div>

                    <FilterBar>
                        <div className="flex flex-wrap items-end gap-4 w-full">
                            <FilterField label={__('Search')}>
                                <Input
                                    placeholder={__('Search by code, name, document...')}
                                    className="w-full md:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </FilterField>

                            <FilterField label={__('Ministerial Grade')}>
                                <Select2
                                    options={[
                                        { value: '', label: __('All grades') },
                                        { value: 'Colaborador', label: __('Colaborador') },
                                        { value: 'Laico', label: __('Laico') },
                                        { value: 'Licenciado', label: __('Licenciado') },
                                        { value: 'Ministro Ordenado', label: __('Ministro Ordenado') },
                                    ]}
                                    value={nivelFilter}
                                    onChange={(val) => setNivelFilter(String(val))}
                                    placeholder={__('All grades')}
                                    className="w-full md:w-48"
                                />
                            </FilterField>

                            <FilterField label={__('Status')}>
                                <Select2
                                    options={[
                                        { value: '', label: __('All statuses') },
                                        { value: '1', label: __('Active') },
                                        { value: '0', label: __('Inactive') },
                                    ]}
                                    value={statusFilter}
                                    onChange={(val) => setStatusFilter(String(val))}
                                    placeholder={__('All statuses')}
                                    className="w-full md:w-36"
                                />
                            </FilterField>

                            <FilterField label={__('Show')}>
                                <Select2
                                    options={[
                                        { value: '10', label: '10' },
                                        { value: '25', label: '25' },
                                        { value: '50', label: '50' },
                                        { value: '100', label: '100' },
                                    ]}
                                    value={perPageFilter}
                                    onChange={(val) => setPerPageFilter(String(val))}
                                    className="w-20"
                                />
                            </FilterField>
                        </div>
                    </FilterBar>

                    <DataTable
                        columns={columns}
                        data={pastores}
                        isLoading={isTableLoading}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                    />
                </div>

                <DeleteConfirmationDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={handleConfirmBulkDelete}
                    title={__('Delete Pastor')}
                    description={
                        selectedIds.length > 1
                            ? `Esta acción eliminará los ${selectedIds.length} pastores seleccionados permanentemente.`
                            : 'Esta acción eliminará el pastor seleccionado permanentemente.'
                    }
                />
            </div>
        </>
    );
}
