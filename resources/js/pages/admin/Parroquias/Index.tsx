import { Head, useForm, router } from '@inertiajs/react';
import { Map, Plus, MapPin, CheckCircle, XCircle, Trash2, MoreVertical, Pencil, ToggleRight, Landmark } from 'lucide-react';
import React, { useState, Suspense, lazy, useMemo } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
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
import { Select2 } from '@/components/ui/select2';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, cleanParams } from '@/lib/utils';
import type { Auth } from '@/types';
import type { Paginated } from '@/types/app';
import { useTranslate } from '@/hooks/use-translate';
import MapboxMap from '@/components/mapbox-map';

const ParroquiasMap = lazy(() => import('./Partials/ParroquiasMap'));

export interface PaisOption {
    id: number;
    nombre: string;
    codigo_iso2: string;
}

export interface EstadoOption {
    id: number;
    pais_id: number;
    nombre: string;
    codigo?: string | null;
    pais?: PaisOption;
}

export interface MunicipioOption {
    id: number;
    estado_id: number;
    nombre: string;
    codigo?: string | null;
    estado?: EstadoOption;
}

export interface Parroquia {
    id: number;
    municipio_id: number;
    nombre: string;
    codigo?: string | null;
    capital?: string | null;
    latitud: number | null;
    longitud: number | null;
    activo: boolean;
    created_at?: string;
    municipio?: MunicipioOption;
}

interface ParroquiasPageProps {
    auth: Auth;
    parroquias: Paginated<Parroquia>;
    municipios: MunicipioOption[];
    estados: EstadoOption[];
    paises: PaisOption[];
    stats: {
        total: number;
        activas: number;
        inactivas: number;
    };
    filters: {
        search?: string;
        status?: string;
        municipio_id?: string;
        estado_id?: string;
        pais_id?: string;
        perPage?: string;
        sortBy?: string;
        sortDir?: string;
    };
}

export default function ParroquiasIndexPage({
    auth,
    parroquias,
    municipios,
    estados,
    paises,
    stats,
    filters,
}: ParroquiasPageProps) {
    const { __ } = useTranslate();

    const breadcrumbs = [
        { title: __('Dashboard'), href: '/admin/dashboard' },
        { title: __('Parishes'), href: '/admin/parroquias' },
    ];

    const userPermissions = (auth as any)?.user?.permissions || [];
    const hasPermission = (perm: string) => userPermissions.includes(perm);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingParroquia, setEditingParroquia] = useState<Parroquia | null>(null);

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [municipioFilter, setMunicipioFilter] = useState(filters.municipio_id || '');
    const [estadoFilter, setEstadoFilter] = useState(filters.estado_id || '');
    const [paisFilter, setPaisFilter] = useState(filters.pais_id || '');
    const [perPageFilter, setPerPageFilter] = useState(filters.perPage || '10');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('tabla');

    // Default selection for modal
    const defaultEstadoId = estados[0]?.id || 0;
    const defaultMunicipioId = municipios.find(m => m.estado_id === defaultEstadoId)?.id || municipios[0]?.id || 0;

    const [modalEstadoId, setModalEstadoId] = useState<number>(defaultEstadoId);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        municipio_id: defaultMunicipioId,
        nombre: '',
        codigo: '',
        capital: '',
        latitud: 10.5000 as number | null,
        longitud: -66.9167 as number | null,
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
                    municipio_id: municipioFilter,
                    estado_id: estadoFilter,
                    pais_id: paisFilter,
                    perPage: perPageFilter,
                    sortBy: filters.sortBy,
                    sortDir: filters.sortDir,
                }),
                { preserveState: true, preserveScroll: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, municipioFilter, estadoFilter, paisFilter, perPageFilter]);

    // Available municipios filtered by modal selected Estado
    const availableMunicipiosForModal = useMemo(() => {
        if (!modalEstadoId) return municipios;
        return municipios.filter(m => Number(m.estado_id) === Number(modalEstadoId));
    }, [modalEstadoId, municipios]);

    // Available estados filtered by paisFilter
    const filteredEstadosForFilter = useMemo(() => {
        if (!paisFilter) return estados;
        return estados.filter(e => String(e.pais_id) === String(paisFilter));
    }, [paisFilter, estados]);

    // Available municipios filtered by estadoFilter
    const filteredMunicipiosForFilter = useMemo(() => {
        if (!estadoFilter) return municipios;
        return municipios.filter(m => String(m.estado_id) === String(estadoFilter));
    }, [estadoFilter, municipios]);

    const handleCreateClick = () => {
        setEditingParroquia(null);
        reset();
        const firstEstado = estados[0]?.id || 0;
        const firstMun = municipios.find(m => m.estado_id === firstEstado)?.id || municipios[0]?.id || 0;
        setModalEstadoId(firstEstado);
        setData({
            municipio_id: firstMun,
            nombre: '',
            codigo: '',
            capital: '',
            latitud: 10.5000,
            longitud: -66.9167,
            activo: true,
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (parroquia: Parroquia) => {
        setEditingParroquia(parroquia);
        const parentEstadoId = parroquia.municipio?.estado_id || defaultEstadoId;
        setModalEstadoId(parentEstadoId);
        setData({
            municipio_id: parroquia.municipio_id,
            nombre: parroquia.nombre || '',
            codigo: parroquia.codigo || '',
            capital: parroquia.capital || '',
            latitud: parroquia.latitud !== undefined && parroquia.latitud !== null ? Number(parroquia.latitud) : 10.5000,
            longitud: parroquia.longitud !== undefined && parroquia.longitud !== null ? Number(parroquia.longitud) : -66.9167,
            activo: parroquia.activo,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingParroquia) {
            put(`/admin/parroquias/${editingParroquia.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingParroquia(null);
                    reset();
                },
            });
        } else {
            post('/admin/parroquias', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleToggleStatus = (parroquia: Parroquia) => {
        router.post(`/admin/parroquias/${parroquia.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const handleConfirmBulkDelete = () => {
        router.post('/admin/parroquias/bulk-destroy', { ids: selectedIds }, {
            onSuccess: () => {
                setSelectedIds([]);
                setIsDeleteDialogOpen(false);
            },
        });
    };

    const columns: ColumnDef<Parroquia>[] = [
        {
            accessorKey: 'nombre',
            header: __('Parish'),
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{row.nombre}</span>
                    {row.municipio && (
                        <span className="text-xs text-muted-foreground">
                            {row.municipio.nombre} {row.municipio.estado ? `(${row.municipio.estado.nombre})` : ''}
                        </span>
                    )}
                </div>
            ),
            sortable: true,
        },
        {
            accessorKey: 'codigo',
            header: __('Code'),
            cell: (row) => (
                <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                    {row.codigo || 'N/A'}
                </span>
            ),
            sortable: true,
        },
        {
            accessorKey: 'capital',
            header: __('Locality / Capital'),
            cell: (row) => row.capital || '—',
            sortable: true,
        },
        {
            accessorKey: 'latitud',
            header: __('Geographic Location'),
            cell: (row) => (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    {row.latitud !== null && row.longitud !== null ? (
                        <span>
                            {Number(row.latitud).toFixed(4)}, {Number(row.longitud).toFixed(4)}
                        </span>
                    ) : (
                        <span className="italic text-slate-400">{__('No location set')}</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'activo',
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
                        {hasPermission('parroquias.edit') && (
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
                        {hasPermission('parroquias.delete') && (
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
            <Head title={__('Parishes of Venezuela')} />

            <div className="space-y-6">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                <ModuleHeader
                    icon={<Landmark className="size-6 text-white" />}
                    title={__('Parishes of Venezuela')}
                    description={__('Management of parishes, localities and geographic coordinates')}
                    colorClassName="bg-emerald-600"
                >
                    {hasPermission('parroquias.create') && (
                        <Button onClick={handleCreateClick} variant="secondary" className="gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-semibold shadow-sm">
                            <Plus className="size-4" />
                            {__('New Parish')}
                        </Button>
                    )}
                </ModuleHeader>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard
                        title={__('TOTAL PARISHES')}
                        value={stats.total}
                        icon={<Landmark className="size-5" />}
                        colorClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                    />
                    <StatCard
                        title={__('ACTIVE PARISHES')}
                        value={stats.activas}
                        icon={<CheckCircle className="size-5" />}
                        colorClassName="bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400"
                    />
                    <StatCard
                        title={__('INACTIVE PARISHES')}
                        value={stats.inactivas}
                        icon={<XCircle className="size-5" />}
                        colorClassName="bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                    />
                </div>

                {/* Tabs & Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
                        <TabsList>
                            <TabsTrigger value="tabla" className="gap-2">
                                <Landmark className="size-4" />
                                {__('Parishes Table')}
                            </TabsTrigger>
                            <TabsTrigger value="mapa" className="gap-2">
                                <Map className="size-4" />
                                {__('Geographic Map')}
                            </TabsTrigger>
                        </TabsList>

                        {selectedIds.length > 0 && hasPermission('parroquias.delete') && (
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

                    <TabsContent value="tabla" className="mt-4 space-y-4">
                        <FilterBar>
                            <div className="flex flex-wrap items-end gap-4 w-full">
                                <FilterField label={__('Search')}>
                                    <Input
                                        placeholder={__('Search by name, code, locality...')}
                                        className="w-full md:w-64"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
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
                                <FilterField label={__('Country')}>
                                    <Select2
                                        options={[
                                            { value: '', label: __('All countries') },
                                            ...paises.map((p) => ({
                                                value: String(p.id),
                                                label: p.nombre,
                                                sublabel: p.codigo_iso2,
                                            })),
                                        ]}
                                        value={paisFilter}
                                        onChange={(val) => {
                                            setPaisFilter(String(val));
                                            setEstadoFilter('');
                                            setMunicipioFilter('');
                                        }}
                                        placeholder={__('All countries')}
                                        searchPlaceholder={__('Search country...')}
                                        className="w-full md:w-44"
                                    />
                                </FilterField>
                                <FilterField label={__('State')}>
                                    <Select2
                                        options={[
                                            { value: '', label: __('All states') },
                                            ...filteredEstadosForFilter.map((e) => ({
                                                value: String(e.id),
                                                label: e.nombre,
                                                sublabel: e.codigo || undefined,
                                            })),
                                        ]}
                                        value={estadoFilter}
                                        onChange={(val) => {
                                            setEstadoFilter(String(val));
                                            setMunicipioFilter('');
                                        }}
                                        placeholder={__('All states')}
                                        searchPlaceholder={__('Search state...')}
                                        className="w-full md:w-48"
                                    />
                                </FilterField>
                                <FilterField label={__('Municipality')}>
                                    <Select2
                                        options={[
                                            { value: '', label: __('All municipalities') },
                                            ...filteredMunicipiosForFilter.map((m) => ({
                                                value: String(m.id),
                                                label: m.nombre,
                                                sublabel: m.estado ? m.estado.nombre : undefined,
                                            })),
                                        ]}
                                        value={municipioFilter}
                                        onChange={(val) => setMunicipioFilter(String(val))}
                                        placeholder={__('All municipalities')}
                                        searchPlaceholder={__('Search municipality...')}
                                        className="w-full md:w-52"
                                    />
                                </FilterField>
                                <FilterField label={__('Records per page')}>
                                    <Select
                                        value={perPageFilter}
                                        onValueChange={(val) => setPerPageFilter(val)}
                                    >
                                        <SelectTrigger className="w-full md:w-24">
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
                            data={parroquias}
                            columns={columns}
                            selectedIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                            isLoading={isTableLoading}
                            filters={{
                                sortBy: filters.sortBy,
                                sortDir: filters.sortDir,
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="mapa" className="mt-4">
                        <Suspense
                            fallback={
                                <div className="flex h-96 items-center justify-center rounded-lg border bg-muted/20">
                                    <span className="text-sm text-muted-foreground">{__('Loading interactive map...')}</span>
                                </div>
                            }
                        >
                            <ParroquiasMap parroquias={parroquias.data} />
                        </Suspense>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modal para Crear / Editar Parroquia */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-6 sm:p-8">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            {editingParroquia ? __('Edit Parish') : __('New Parish')}
                        </DialogTitle>
                        <DialogDescription>
                            {__('Enter the geographic and administrative details of the parish.')}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 py-2">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="modal_estado_id">{__('State')} *</Label>
                                <Select2
                                    id="modal_estado_id"
                                    options={estados.map((e) => ({
                                        value: e.id,
                                        label: e.nombre,
                                        sublabel: e.pais ? e.pais.nombre : undefined,
                                    }))}
                                    value={modalEstadoId}
                                    onChange={(val) => {
                                        const newEstadoId = Number(val);
                                        setModalEstadoId(newEstadoId);
                                        const firstMatchingMun = municipios.find(m => Number(m.estado_id) === newEstadoId);
                                        if (firstMatchingMun) {
                                            setData('municipio_id', firstMatchingMun.id);
                                        }
                                    }}
                                    placeholder={__('Select a state')}
                                    searchPlaceholder={__('Search state...')}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="municipio_id">{__('Municipality')} *</Label>
                                <Select2
                                    id="municipio_id"
                                    options={availableMunicipiosForModal.map((m) => ({
                                        value: m.id,
                                        label: m.nombre,
                                        sublabel: m.codigo || undefined,
                                    }))}
                                    value={data.municipio_id}
                                    onChange={(val) => setData('municipio_id', Number(val))}
                                    placeholder={__('Select a municipality')}
                                    searchPlaceholder={__('Search municipality...')}
                                    emptyText={__('No municipality found for this state')}
                                    className="w-full"
                                />
                                {errors.municipio_id && <p className="text-xs text-destructive">{errors.municipio_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nombre">{__('Parish Name')} *</Label>
                                <Input
                                    id="nombre"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    placeholder="Ej: Altagracia, El Limón, Chacao..."
                                    required
                                />
                                {errors.nombre && <p className="text-xs text-destructive">{errors.nombre}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="codigo">{__('Code / INE')}</Label>
                                <Input
                                    id="codigo"
                                    value={data.codigo}
                                    onChange={(e) => setData('codigo', e.target.value)}
                                    placeholder="Ej: VE-A-LIB-01, VE-D-GIR-01..."
                                />
                                {errors.codigo && <p className="text-xs text-destructive">{errors.codigo}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="capital">{__('Locality / Seat')}</Label>
                                <Input
                                    id="capital"
                                    value={data.capital}
                                    onChange={(e) => setData('capital', e.target.value)}
                                    placeholder="Ej: Centro, El Limón, Catia..."
                                />
                                {errors.capital && <p className="text-xs text-destructive">{errors.capital}</p>}
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                                <Label className="text-sm font-semibold flex items-center gap-2">
                                    <MapPin className="size-4 text-primary" />
                                    {__('Geographic Location (Latitude / Longitude)')}
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                    {__('You can drag the pin or click on the map to adjust.')}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="latitud">{__('Latitude')}</Label>
                                    <Input
                                        id="latitud"
                                        type="number"
                                        step="0.0000001"
                                        value={data.latitud !== null ? data.latitud : ''}
                                        onChange={(e) => setData('latitud', e.target.value ? parseFloat(e.target.value) : null)}
                                        placeholder="Ej: 10.5111"
                                    />
                                    {errors.latitud && <p className="text-xs text-destructive">{errors.latitud}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="longitud">{__('Longitude')}</Label>
                                    <Input
                                        id="longitud"
                                        type="number"
                                        step="0.0000001"
                                        value={data.longitud !== null ? data.longitud : ''}
                                        onChange={(e) => setData('longitud', e.target.value ? parseFloat(e.target.value) : null)}
                                        placeholder="Ej: -66.9142"
                                    />
                                    {errors.longitud && <p className="text-xs text-destructive">{errors.longitud}</p>}
                                </div>
                            </div>

                            {/* Selector de Mapa interactivo dentro del Modal */}
                            <div className="pt-2">
                                <MapboxMap
                                    lat={data.latitud ?? 10.5000}
                                    lng={data.longitud ?? -66.9167}
                                    zoom={9}
                                    interactive={true}
                                    onChange={(newLat, newLng) => {
                                        setData(prev => ({
                                            ...prev,
                                            latitud: Number(newLat.toFixed(7)),
                                            longitud: Number(newLng.toFixed(7))
                                        }));
                                    }}
                                    className="h-80 w-full rounded-lg border shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-4">
                            <Label htmlFor="activo" className="flex flex-col gap-1 cursor-pointer">
                                <span>{__('Active Parish')}</span>
                                <span className="text-xs font-normal text-muted-foreground">
                                    {__('Enable or disable this parish in application dropdowns.')}
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
                                {__('Cancel')}
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {editingParroquia ? __('Save Changes') : __('Create Parish')}
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
                title={__('Confirm deletion?')}
                description={
                    selectedIds.length > 1
                        ? __('This action will permanently delete the :count selected parishes.', { count: String(selectedIds.length) })
                        : __('This action will permanently delete the selected parish.')
                }
            />
        </>
    );
}
