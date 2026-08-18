import { Head, useForm, router } from '@inertiajs/react';
import { Map, Plus, MapPin, CheckCircle, XCircle, Trash2, MoreVertical, Pencil, ToggleRight, Building } from 'lucide-react';
import React, { useState, Suspense, lazy } from 'react';
import type { ColumnDef } from '@/components/data-table';
import { DataTable } from '@/components/data-table';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { FilterBar, FilterField } from '@/components/filter-bar';
import { ModuleHeader } from '@/components/module-header';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminSaasLayout from '@/layouts/admin/admin-saas-layout';
import { cn, cleanParams } from '@/lib/utils';
import type { Auth } from '@/types';
import type { Paginated } from '@/types/app';
import { useTranslate } from '@/hooks/use-translate';
import MapboxMap from '@/components/mapbox-map';

const EstadosMap = lazy(() => import('./Partials/EstadosMap'));

export interface PaisOption {
    id: number;
    nombre: string;
    codigo_iso2: string;
}

export interface Estado {
    id: number;
    pais_id: number;
    nombre: string;
    codigo?: string | null;
    capital?: string | null;
    latitud: number | null;
    longitud: number | null;
    activo: boolean;
    created_at?: string;
    pais?: PaisOption;
}

interface EstadosPageProps {
    auth: Auth;
    estados: Paginated<Estado>;
    paises: PaisOption[];
    stats: {
        total: number;
        activos: number;
        inactivos: number;
    };
    filters: {
        search?: string;
        status?: string;
        pais_id?: string;
        perPage?: string;
        sortBy?: string;
        sortDir?: string;
    };
}

export default function EstadosIndexPage({ auth, estados, paises, stats, filters }: EstadosPageProps) {
    const { __ } = useTranslate();

    const breadcrumbs = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('Estados'), href: '/estados' },
    ];

    const userPermissions = (auth as any)?.user?.permissions || [];
    const hasPermission = (perm: string) => userPermissions.includes(perm);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEstado, setEditingEstado] = useState<Estado | null>(null);

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [paisFilter, setPaisFilter] = useState(filters.pais_id || '');
    const [perPageFilter, setPerPageFilter] = useState(filters.perPage || '10');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('tabla');

    // Default Venezuela pais_id
    const venezuelaPais = paises.find(p => p.codigo_iso2 === 'VE');
    const defaultPaisId = venezuelaPais ? venezuelaPais.id : (paises[0]?.id || 0);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        pais_id: defaultPaisId,
        nombre: '',
        codigo: '',
        capital: '',
        latitud: 10.4806 as number | null,
        longitud: -66.9036 as number | null,
        activo: true,
    });

    React.useEffect(() => {
        const unbindStart = router.on('start', () => setIsTableLoading(true));
        const unbindFinish = router.on('finish', () => setIsTableLoading(false));

        return () => {
            unbindStart();
            unbindFinish();
        };
    }, []);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                window.location.pathname,
                cleanParams({
                    search: searchTerm,
                    status: statusFilter,
                    pais_id: paisFilter,
                    perPage: perPageFilter,
                    sortBy: filters.sortBy,
                    sortDir: filters.sortDir,
                }),
                { preserveState: true, preserveScroll: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, paisFilter, perPageFilter]);

    const handleCreateClick = () => {
        setEditingEstado(null);
        reset();
        setData({
            pais_id: defaultPaisId,
            nombre: '',
            codigo: '',
            capital: '',
            latitud: 10.4806,
            longitud: -66.9036,
            activo: true,
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (estado: Estado) => {
        setEditingEstado(estado);
        setData({
            pais_id: estado.pais_id,
            nombre: estado.nombre || '',
            codigo: estado.codigo || '',
            capital: estado.capital || '',
            latitud: estado.latitud !== undefined && estado.latitud !== null ? Number(estado.latitud) : 10.4806,
            longitud: estado.longitud !== undefined && estado.longitud !== null ? Number(estado.longitud) : -66.9036,
            activo: estado.activo,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingEstado) {
            put(`/estados/${editingEstado.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingEstado(null);
                    reset();
                },
            });
        } else {
            post('/estados', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleToggleStatus = (estado: Estado) => {
        router.post(`/estados/${estado.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const handleConfirmBulkDelete = () => {
        router.post('/estados/bulk-destroy', { ids: selectedIds }, {
            onSuccess: () => {
                setSelectedIds([]);
                setIsDeleteDialogOpen(false);
            },
        });
    };

    const handleSortChange = (columnId: string, direction: 'asc' | 'desc') => {
        router.get(
            window.location.pathname,
            cleanParams({
                search: searchTerm,
                status: statusFilter,
                pais_id: paisFilter,
                perPage: perPageFilter,
                sortBy: columnId,
                sortDir: direction,
            }),
            { preserveState: true, preserveScroll: true }
        );
    };

    const columns: ColumnDef<Estado>[] = [
        {
            id: 'nombre',
            header: __('State'),
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{row.nombre}</span>
                    {row.pais && (
                        <span className="text-xs text-muted-foreground">
                            {row.pais.nombre} ({row.pais.codigo_iso2})
                        </span>
                    )}
                </div>
            ),
            sortable: true,
        },
        {
            id: 'codigo',
            header: __('Code'),
            cell: (row) => (
                <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                    {row.codigo || 'N/A'}
                </span>
            ),
            sortable: true,
        },
        {
            id: 'capital',
            header: __('Capital'),
            cell: (row) => row.capital || '—',
            sortable: true,
        },
        {
            id: 'coordenadas',
            header: __('Geographic Location'),
            cell: (row) => (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    {row.latitud !== null && row.longitud !== null ? (
                        <span>
                            {Number(row.latitud).toFixed(4)}, {Number(row.longitud).toFixed(4)}
                        </span>
                    ) : (
                        <span className="italic text-slate-400">Sin ubicación</span>
                    )}
                </div>
            ),
        },
        {
            id: 'activo',
            header: __('Status'),
            cell: (row) => (
                <span
                    className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                        row.activo
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                    )}
                >
                    <span
                        className={cn(
                            'size-1.5 rounded-full',
                            row.activo ? 'bg-emerald-500' : 'bg-slate-400'
                        )}
                    />
                    {row.activo ? __('Active') : __('Inactive')}
                </span>
            ),
            sortable: true,
        },
        {
            id: 'actions',
            header: __('Actions'),
            cell: (row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {hasPermission('estados.edit') && (
                            <>
                                <DropdownMenuItem onClick={() => handleEditClick(row)}>
                                    <Pencil className="mr-2 size-4 text-blue-500" />
                                    {__('Edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(row)}>
                                    <ToggleRight className="mr-2 size-4 text-amber-500" />
                                    {row.activo ? __('Deactivate') : __('Activate')}
                                </DropdownMenuItem>
                            </>
                        )}
                        {hasPermission('estados.delete') && (
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
        <AdminSaasLayout breadcrumbs={breadcrumbs}>
            <Head title={__('Estados de Venezuela')} />

            <div className="space-y-6 p-6">
                <ModuleHeader
                    title={__('Estados de Venezuela')}
                    subtitle={__('Gestión de estados, capitales y coordenadas geográficas')}
                    actionButton={
                        hasPermission('estados.create') ? (
                            <Button onClick={handleCreateClick} className="gap-2">
                                <Plus className="size-4" />
                                {__('Nuevo Estado')}
                            </Button>
                        ) : undefined
                    }
                />

                {/* Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard
                        title={__('Total Estados')}
                        value={stats.total}
                        icon={MapPin}
                        description={__('Entidades geográficas registradas')}
                    />
                    <StatCard
                        title={__('Estados Activos')}
                        value={stats.activos}
                        icon={CheckCircle}
                        className="border-emerald-200 dark:border-emerald-900/50"
                        description={__('Disponibles en la plataforma')}
                    />
                    <StatCard
                        title={__('Estados Inactivos')}
                        value={stats.inactivos}
                        icon={XCircle}
                        className="border-slate-200 dark:border-slate-800"
                        description={__('Desactivados temporalmente')}
                    />
                </div>

                {/* Tabs & Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
                        <TabsList>
                            <TabsTrigger value="tabla" className="gap-2">
                                <Building className="size-4" />
                                {__('Tabla de Estados')}
                            </TabsTrigger>
                            <TabsTrigger value="mapa" className="gap-2">
                                <Map className="size-4" />
                                {__('Mapa Geográfico')}
                            </TabsTrigger>
                        </TabsList>

                        {selectedIds.length > 0 && hasPermission('estados.delete') && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                className="gap-2"
                            >
                                <Trash2 className="size-4" />
                                {__('Eliminar seleccionados')} ({selectedIds.length})
                            </Button>
                        )}
                    </div>

                    <TabsContent value="tabla" className="mt-4 space-y-4">
                        <FilterBar>
                            <div className="flex flex-wrap items-end gap-4 w-full">
                                <FilterField label={__('Search')}>
                                    <Input
                                        placeholder={__('Buscar por nombre, código, capital...')}
                                        className="w-full md:w-80"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </FilterField>
                                <FilterField label={__('Status')}>
                                    <Select
                                        value={statusFilter}
                                        onValueChange={(val) => setStatusFilter(val)}
                                    >
                                        <SelectTrigger className="w-full md:w-44">
                                            <SelectValue placeholder={__('All statuses')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">{__('All statuses')}</SelectItem>
                                            <SelectItem value="1">{__('Active')}</SelectItem>
                                            <SelectItem value="0">{__('Inactive')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FilterField>
                                <FilterField label={__('Country')}>
                                    <Select
                                        value={paisFilter}
                                        onValueChange={(val) => setPaisFilter(val)}
                                    >
                                        <SelectTrigger className="w-full md:w-48">
                                            <SelectValue placeholder={__('All countries')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">{__('All countries')}</SelectItem>
                                            {paises.map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>
                                                    {p.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FilterField>
                                <FilterField label={__('Records per page')}>
                                    <Select
                                        value={perPageFilter}
                                        onValueChange={(val) => setPerPageFilter(val)}
                                    >
                                        <SelectTrigger className="w-full md:w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FilterField>
                            </div>
                        </FilterBar>

                        <DataTable
                            data={estados.data}
                            columns={columns}
                            pagination={estados}
                            onSort={handleSortChange}
                            sortBy={filters.sortBy}
                            sortDir={filters.sortDir as 'asc' | 'desc'}
                            selectable={hasPermission('estados.delete')}
                            onSelectionChange={setSelectedIds}
                            loading={isTableLoading}
                        />
                    </TabsContent>

                    <TabsContent value="mapa" className="mt-4">
                        <Suspense
                            fallback={
                                <div className="flex h-96 items-center justify-center rounded-lg border bg-muted/20">
                                    <span className="text-sm text-muted-foreground">{__('Cargando mapa interactivo...')}</span>
                                </div>
                            }
                        >
                            <EstadosMap estados={estados.data} />
                        </Suspense>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modal para Crear / Editar Estado */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingEstado ? __('Editar Estado') : __('Nuevo Estado')}
                        </DialogTitle>
                        <DialogDescription>
                            {__('Ingrese los detalles geográficos y administrativos del estado.')}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="pais_id">{__('País')}</Label>
                                <Select
                                    value={String(data.pais_id)}
                                    onValueChange={(val) => setData('pais_id', Number(val))}
                                >
                                    <SelectTrigger id="pais_id">
                                        <SelectValue placeholder={__('Seleccione un país')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paises.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.nombre} ({p.codigo_iso2})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.pais_id && <p className="text-xs text-destructive">{errors.pais_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nombre">{__('Nombre del Estado')} *</Label>
                                <Input
                                    id="nombre"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    placeholder="Ej: Aragua, Zulia, Miranda..."
                                    required
                                />
                                {errors.nombre && <p className="text-xs text-destructive">{errors.nombre}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="codigo">{__('Código / ISO')}</Label>
                                <Input
                                    id="codigo"
                                    value={data.codigo}
                                    onChange={(e) => setData('codigo', e.target.value)}
                                    placeholder="Ej: VE-D, VE-V..."
                                />
                                {errors.codigo && <p className="text-xs text-destructive">{errors.codigo}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="capital">{__('Capital')}</Label>
                                <Input
                                    id="capital"
                                    value={data.capital}
                                    onChange={(e) => setData('capital', e.target.value)}
                                    placeholder="Ej: Maracay, Maracaibo, Caracas..."
                                />
                                {errors.capital && <p className="text-xs text-destructive">{errors.capital}</p>}
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold flex items-center gap-2">
                                    <MapPin className="size-4 text-primary" />
                                    {__('Ubicación Geográfica (Latitud / Longitud)')}
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                    {__('Puedes arrastrar el pin o hacer clic en el mapa para ajustar.')}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="latitud">{__('Latitud')}</Label>
                                    <Input
                                        id="latitud"
                                        type="number"
                                        step="0.0000001"
                                        value={data.latitud !== null ? data.latitud : ''}
                                        onChange={(e) => setData('latitud', e.target.value ? parseFloat(e.target.value) : null)}
                                        placeholder="Ej: 10.2354"
                                    />
                                    {errors.latitud && <p className="text-xs text-destructive">{errors.latitud}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="longitud">{__('Longitud')}</Label>
                                    <Input
                                        id="longitud"
                                        type="number"
                                        step="0.0000001"
                                        value={data.longitud !== null ? data.longitud : ''}
                                        onChange={(e) => setData('longitud', e.target.value ? parseFloat(e.target.value) : null)}
                                        placeholder="Ej: -67.5911"
                                    />
                                    {errors.longitud && <p className="text-xs text-destructive">{errors.longitud}</p>}
                                </div>
                            </div>

                            {/* Selector de Mapa interactivo dentro del Modal */}
                            <div className="pt-2">
                                <MapboxMap
                                    lat={data.latitud ?? 10.4806}
                                    lng={data.longitud ?? -66.9036}
                                    zoom={7}
                                    interactive={true}
                                    onChange={(newLat, newLng) => {
                                        setData(prev => ({
                                            ...prev,
                                            latitud: Number(newLat.toFixed(7)),
                                            longitud: Number(newLng.toFixed(7))
                                        }));
                                    }}
                                    className="h-60 w-full rounded-md border"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-4">
                            <Label htmlFor="activo" className="flex flex-col gap-1 cursor-pointer">
                                <span>{__('Estado Activo')}</span>
                                <span className="text-xs font-normal text-muted-foreground">
                                    {__('Habilitar o deshabilitar este estado en los desplegables de la aplicación.')}
                                </span>
                            </Label>
                            <Switch
                                id="activo"
                                checked={data.activo}
                                onCheckedChange={(val) => setData('activo', val)}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                            >
                                {__('Cancelar')}
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {editingEstado ? __('Guardar Cambios') : __('Crear Estado')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Diálogo para Confirmar Eliminación */}
            <DeleteConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleConfirmBulkDelete}
                title={__('¿Confirmar eliminación?')}
                description={
                    selectedIds.length > 1
                        ? __('Esta acción eliminará los :count estados seleccionados permanentemente.', { count: selectedIds.length })
                        : __('Esta acción eliminará el estado seleccionado permanentemente.')
                }
            />
        </AdminSaasLayout>
    );
}
