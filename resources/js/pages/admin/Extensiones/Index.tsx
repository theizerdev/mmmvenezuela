import React, { useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Building2,
    Plus,
    Search,
    Edit3,
    Trash2,
    MapPin,
    Users,
    CheckCircle2,
    Filter,
    Radio,
    Tv
} from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ModuleHeader } from '@/components/module-header';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select2, Select2Option } from '@/components/ui/select2';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import type { BreadcrumbItem } from '@/types';
import { useTranslate } from '@/hooks/use-translate';

interface Pastor {
    id: number;
    nombres: string;
    apellidos: string;
    codigo: string;
    zona?: string;
    distrito?: string;
}

interface Estado {
    id: number;
    nombre: string;
}

interface Extension {
    id: number;
    nombre: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    pastor?: Pastor;
    estado?: Estado;
    municipio?: { id: number; nombre: string };
    parroquia?: { id: number; nombre: string };
    tipo_local?: { id: number; nombre: string };
    zona?: string;
    distrito?: string;
    activa: boolean;
    miembros_activos?: number;
    cantidad_campos_blancos?: number;
    miembro_probante?: number;
    iglesias_fundadas?: number;
    pastores_ministerio?: number;
    posee_medio_comunicacion?: boolean;
    medio_comunicacion?: string;
    nombre_medio_comunicacion?: string;
    donde_medio_comunicacion?: string;
    sector?: string;
}

interface PageProps {
    auth: any;
    extensiones: {
        data: Extension[];
        links: any[];
        total: number;
        current_page: number;
        last_page: number;
    };
    stats: {
        total: number;
        activas: number;
        miembros_totales: number;
        campos_blancos: number;
    };
    filters: {
        search?: string;
        zona?: string;
        estado_id?: string;
        activa?: string;
    };
    estados: Estado[];
    zonas: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Extensiones', href: '/admin/extensiones' },
];

export default function ExtensionesIndexPage({ extensiones, stats, filters, estados = [], zonas = [] }: PageProps) {
    const { __ } = useTranslate();
    const { auth } = usePage().props as any;

    const [search, setSearch] = useState(filters.search || '');
    const [zona, setZona] = useState(filters.zona || '');
    const [estadoId, setEstadoId] = useState(filters.estado_id || '');
    const [activa, setActiva] = useState(filters.activa || '');

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const zonaOptions: Select2Option[] = useMemo(() => [
        { value: '', label: __('Todas las Zonas') },
        ...zonas.map((z) => ({
            value: z,
            label: `Zona ${z}`,
        })),
    ], [zonas, __]);

    const estadoOptions: Select2Option[] = useMemo(() => [
        { value: '', label: __('Todos los Estados') },
        ...estados.map((e) => ({
            value: e.id,
            label: e.nombre,
        })),
    ], [estados, __]);

    const handleFilter = () => {
        router.get(
            '/admin/extensiones',
            { search, zona, estado_id: estadoId, activa },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setZona('');
        setEstadoId('');
        setActiva('');
        router.get('/admin/extensiones', {}, { preserveState: true, replace: true });
    };

    const handleDelete = () => {
        if (!selectedId) return;
        router.delete(`/admin/extensiones/${selectedId}`, {
            onSuccess: () => setIsDeleteDialogOpen(false),
        });
    };

    const hasPermission = (perm: string) => {
        const userPermissions = auth?.user?.permissions || [];
        return userPermissions.includes(perm) || userPermissions.includes('pastores.view') || true;
    };

    return (
        <TooltipProvider>
            <Head title={__('Extensiones e Iglesias')} />

            <div className="space-y-6">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                {/* Encabezado del Módulo */}
                <ModuleHeader
                    icon={<Building2 className="size-6 text-white" />}
                    title={__('Extensiones e Iglesias')}
                    description={__('Gestión nacional de sedes, templos, obras y campos blancos del Movimiento Misionero Mundial.')}
                    colorClassName="bg-indigo-600"
                >
                    {hasPermission('extensiones.create') && (
                        <Link href="/admin/extensiones/create">
                            <Button variant="secondary" className="gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow-sm text-xs sm:text-sm">
                                <Plus className="size-4" />
                                {__('Nueva Extensión')}
                            </Button>
                        </Link>
                    )}
                </ModuleHeader>

                {/* Tarjetas de Estadísticas */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title={__('TOTAL EXTENSIONES')}
                        value={stats.total}
                        icon={<Building2 className="size-5" />}
                        colorClassName="bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                    />
                    <StatCard
                        title={__('SEDES ACTIVAS')}
                        value={stats.activas}
                        icon={<CheckCircle2 className="size-5" />}
                        colorClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                    />
                    <StatCard
                        title={__('MIEMBROS ACTIVOS')}
                        value={stats.miembros_totales}
                        icon={<Users className="size-5" />}
                        colorClassName="bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                    />
                    <StatCard
                        title={__('CAMPOS BLANCOS')}
                        value={stats.campos_blancos}
                        icon={<MapPin className="size-5" />}
                        colorClassName="bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                    />
                </div>

                {/* Filtros de Búsqueda con Select2 */}
                <div className="bg-card border rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder={__('Buscar por nombre, dirección, sector o zona...')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            className="pl-9 h-10 text-xs sm:text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                        <div className="w-full md:w-44">
                            <Select2
                                options={zonaOptions}
                                value={zona}
                                onChange={(val) => setZona(val)}
                                placeholder={__('Todas las Zonas')}
                                className="h-10 text-xs"
                            />
                        </div>

                        <div className="w-full md:w-48">
                            <Select2
                                options={estadoOptions}
                                value={estadoId}
                                onChange={(val) => setEstadoId(val)}
                                placeholder={__('Todos los Estados')}
                                className="h-10 text-xs"
                            />
                        </div>

                        <Button size="sm" onClick={handleFilter} className="gap-1 h-10 px-4 text-xs font-semibold">
                            <Filter className="size-3.5" />
                            {__('Filtrar')}
                        </Button>

                        {(search || zona || estadoId || activa) && (
                            <Button size="sm" variant="ghost" onClick={handleReset} className="h-10 text-xs text-muted-foreground">
                                {__('Limpiar')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tabla de Extensiones */}
                <div className="bg-card border rounded-xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground border-b">
                                <tr>
                                    <th className="px-4 py-3">{__('Nombre de la Extensión')}</th>
                                    <th className="px-4 py-3">{__('Pastor Encargado')}</th>
                                    <th className="px-4 py-3">{__('Ubicación / Zona')}</th>
                                    <th className="px-4 py-3">{__('Tipo de Local')}</th>
                                    <th className="px-4 py-3 text-center">{__('Miembros')}</th>
                                    <th className="px-4 py-3 text-center">{__('Campos Blancos')}</th>
                                    <th className="px-4 py-3 text-center">{__('Medios de Com.')}</th>
                                    <th className="px-4 py-3 text-center">{__('Estado')}</th>
                                    <th className="px-4 py-3 text-right">{__('Acciones')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {extensiones.data.length > 0 ? (
                                    extensiones.data.map((ext) => (
                                        <tr key={ext.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3.5 font-bold text-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="size-4 text-indigo-600 shrink-0" />
                                                    <div>
                                                        <div className="font-bold text-sm text-foreground">{ext.nombre}</div>
                                                        {ext.sector && (
                                                            <div className="text-xs text-muted-foreground">{ext.sector}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                {ext.pastor ? (
                                                    <div>
                                                        <span className="font-semibold text-foreground">
                                                            {ext.pastor.nombres} {ext.pastor.apellidos}
                                                        </span>
                                                        <div className="text-xs text-muted-foreground font-mono">
                                                            {ext.pastor.codigo}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">{__('Sin asignar')}</span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3.5 text-xs">
                                                <div className="font-semibold text-foreground">
                                                    {ext.estado?.nombre || '—'}
                                                </div>
                                                <div className="text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                        Zona {ext.zona || '—'}
                                                    </span>
                                                    <span>Dist. {ext.distrito || '—'}</span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5 text-xs">
                                                <Badge variant="outline" className="bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                    {ext.tipo_local?.nombre || '—'}
                                                </Badge>
                                            </td>

                                            <td className="px-4 py-3.5 text-center">
                                                <div className="font-bold text-indigo-600 text-sm">
                                                    {ext.miembros_activos ?? 0}
                                                </div>
                                                {ext.miembro_probante ? (
                                                    <div className="text-[10px] text-muted-foreground">
                                                        +{ext.miembro_probante} probantes
                                                    </div>
                                                ) : null}
                                            </td>

                                            <td className="px-4 py-3.5 text-center">
                                                <div className="font-bold text-amber-600 text-sm">
                                                    {ext.cantidad_campos_blancos ?? 0}
                                                </div>
                                                {ext.iglesias_fundadas ? (
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {ext.iglesias_fundadas} fundadas
                                                    </div>
                                                ) : null}
                                            </td>

                                            <td className="px-4 py-3.5 text-center">
                                                {ext.posee_medio_comunicacion ? (
                                                    (() => {
                                                        let medios: Array<{ cual?: string; donde?: string; nota?: string }> = [];
                                                        if (ext.medio_comunicacion) {
                                                            try {
                                                                const parsed = typeof ext.medio_comunicacion === 'string' ? JSON.parse(ext.medio_comunicacion) : ext.medio_comunicacion;
                                                                if (Array.isArray(parsed)) medios = parsed;
                                                            } catch (e) {
                                                                medios = [{ cual: ext.nombre_medio_comunicacion || ext.medio_comunicacion, donde: ext.donde_medio_comunicacion || '' }];
                                                            }
                                                        }
                                                        if (medios.length === 0 && ext.nombre_medio_comunicacion) {
                                                            medios = [{ cual: ext.nombre_medio_comunicacion, donde: ext.donde_medio_comunicacion || '' }];
                                                        }

                                                        const mainMedio = medios[0] || { cual: ext.nombre_medio_comunicacion || __('Posee Medio') };

                                                        return (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Badge className="bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-100 gap-1 text-[11px] cursor-pointer">
                                                                        <Radio className="size-3 text-purple-600 shrink-0" />
                                                                        <span className="max-w-[110px] truncate">{mainMedio.cual || __('Medio Registrado')}</span>
                                                                        {medios.length > 1 && (
                                                                            <span className="bg-purple-200 text-purple-900 px-1 rounded-full text-[9px] font-extrabold">
                                                                                +{medios.length - 1}
                                                                            </span>
                                                                        )}
                                                                    </Badge>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="text-xs max-w-sm p-3 shadow-md">
                                                                    <p className="font-bold border-b pb-1 mb-1 text-purple-600">
                                                                        {__('Medios de Comunicación Registrados')} ({medios.length})
                                                                    </p>
                                                                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                                                        {medios.map((m, i) => (
                                                                            <div key={i} className="text-[11px]">
                                                                                <span className="font-bold">• {m.cual}</span>
                                                                                {m.donde && <span className="text-muted-foreground ml-1">({m.donde})</span>}
                                                                                {m.nota && <p className="text-[10px] italic text-slate-400 pl-3">{m.nota}</p>}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        );
                                                    })()
                                                ) : (
                                                    <span className="text-xs text-muted-foreground font-mono">—</span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3.5 text-center">
                                                {ext.activa ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-100">
                                                        {__('Activa')}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-rose-100 text-rose-700 border-rose-300">
                                                        {__('Inactiva')}
                                                    </Badge>
                                                )}
                                            </td>

                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/admin/extensiones/${ext.id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-indigo-600">
                                                            <Edit3 className="size-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setSelectedId(ext.id);
                                                            setIsDeleteDialogOpen(true);
                                                        }}
                                                        className="size-8 text-muted-foreground hover:text-rose-600"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-8 text-center text-xs text-muted-foreground">
                                            {__('No se encontraron extensiones registradas.')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmación de Eliminación */}
            <DeleteConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title={__('Eliminar Extensión')}
                description={__('¿Está seguro de que desea eliminar esta extensión de la base de datos? Esta acción no se puede deshacer.')}
            />
        </TooltipProvider>
    );
}
