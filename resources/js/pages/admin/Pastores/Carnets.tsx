import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    IdCard,
    ArrowLeft,
    RotateCw,
    Download,
    Printer,
    Search,
    SlidersHorizontal,
    X,
    CheckSquare,
    Square,
    Layers,
    Image as ImageIcon,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    ShieldCheck,
    QrCode,
    Pencil,
    FileText,
    Users,
    Filter,
    Scissors,
    Upload,
    Sparkles,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ModuleHeader } from '@/components/module-header';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select2 } from '@/components/ui/select2';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { cn, cleanParams } from '@/lib/utils';
import type { Auth } from '@/types';
import type { Paginated } from '@/types/app';
import type { Pastor } from './Index';
import { useTranslate } from '@/hooks/use-translate';
import { PastorCarnetCard, getPastorPhotoUrl, formatDocumento } from './Partials/PastorCarnetCard';
import { exportPastorCarnetPng } from './Partials/carnet-export-image';
import { PastorCarnetTemplateModal } from './Partials/PastorCarnetTemplateModal';
import { PastorPhotoAdjustModal } from './Partials/PastorPhotoAdjustModal';
import { removeBackgroundWithAi } from './Partials/ai-photo-segmenter';

interface CarnetsPageProps {
    auth: Auth;
    pastores: Paginated<Pastor>;
    stats: {
        total: number;
        con_foto: number;
        sin_foto: number;
        ordenados: number;
    };
    filters: {
        search?: string;
        zona?: string;
        distrito?: string;
        nivel_ministerial?: string;
        con_foto?: string;
        status?: string;
        per_page?: string;
    };
    initialPastor?: Pastor | null;
    plantillas?: {
        frente: string;
        atras: string;
        esPersonalizadaFrente?: boolean;
        esPersonalizadaAtras?: boolean;
    };
}

export default function PastoresCarnetsPage({
    auth,
    pastores,
    stats,
    filters,
    initialPastor,
    plantillas,
}: CarnetsPageProps) {
    const { __ } = useTranslate();
    const userRoles = (auth as any)?.user?.roles || [];
    const canDownloadCarnet = Boolean(
        (auth as any)?.user?.is_super_admin ||
        (Array.isArray(userRoles) && userRoles.some((r: any) => {
            const name = (typeof r === 'string' ? r : r?.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return name.includes('super') || name.includes('administrador') || name.includes('admin') || name.includes('secretaria') || name.includes('junta');
        }))
    );

    const breadcrumbs = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('Pastores'), href: '/admin/pastores' },
        { title: __('Centro de Carnetización'), href: '/admin/pastores/carnets' },
    ];

    // Estados de filtros
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [zonaFilter, setZonaFilter] = useState(filters.zona ? (filters.zona.replace(/\D/g, '') || filters.zona) : '');
    const [nivelFilter, setNivelFilter] = useState(filters.nivel_ministerial || '');
    const [fotoFilter, setFotoFilter] = useState(filters.con_foto || '');

    // Plantillas de credencial modelo (Frontal y Reverso)
    const [frontTemplateUrl, setFrontTemplateUrl] = useState<string>(
        plantillas?.frente || '/image/Credencial-frente.png'
    );
    const [backTemplateUrl, setBackTemplateUrl] = useState<string>(
        plantillas?.atras || '/image/Credencial-atras.png'
    );

    // Modales de personalización
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

    // Pastor activo en el visor interactivo
    const [selectedPastor, setSelectedPastor] = useState<Pastor | null>(
        initialPastor || pastores.data[0] || null
    );

    // Estados del visor
    const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
    const [viewMode, setViewMode] = useState<'flip' | 'both'>('flip');
    const [isExportingPng, setIsExportingPng] = useState(false);
    const viewerContainerRef = React.useRef<HTMLDivElement>(null);
    const [viewerScale, setViewerScale] = useState<number>(0.85);

    // Ajuste responsivo de la escala del carnet según el ancho del contenedor para evitar desbordes
    useEffect(() => {
        const el = viewerContainerRef.current;
        if (!el) return;
        const updateScale = () => {
            if (!viewerContainerRef.current) return;
            const w = viewerContainerRef.current.clientWidth;
            const s = Math.min(0.92, Math.max(0.45, (w - 36) / 680));
            setViewerScale(Number(s.toFixed(2)));
        };
        updateScale();
        const ro = new ResizeObserver(updateScale);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // Selección masiva para impresión por lotes
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [tipoPliego, setTipoPliego] = useState<'duplex' | 'front_only' | 'cr80_individual'>('duplex');
    const [isPrinting, setIsPrinting] = useState(false);
    const [isBulkBackgroundModalOpen, setIsBulkBackgroundModalOpen] = useState(false);
    const [isRemovingBackground, setIsRemovingBackground] = useState(false);
    const [backgroundProgress, setBackgroundProgress] = useState({ completed: 0, total: 0 });
    const [isEnhancingSingleAi, setIsEnhancingSingleAi] = useState(false);
    const [isBulkAiModalOpen, setIsBulkAiModalOpen] = useState(false);
    const [isEnhancingBulkAi, setIsEnhancingBulkAi] = useState(false);

    // Sincronizar pastor seleccionado si cambia la lista
    useEffect(() => {
        if (!selectedPastor && pastores.data.length > 0) {
            setSelectedPastor(pastores.data[0]);
        }
    }, [pastores.data, selectedPastor]);

    // Sincronizar URLs de plantillas si cambian desde el servidor
    useEffect(() => {
        if (plantillas?.frente) {
            setFrontTemplateUrl(plantillas.frente);
        }
        if (plantillas?.atras) {
            setBackTemplateUrl(plantillas.atras);
        }
    }, [plantillas?.frente, plantillas?.atras]);

    // Opciones de zonas (1 a 43)
    const zonaOptions = useMemo(() => [
        { value: '', label: __('Todas las zonas') },
        ...Array.from({ length: 43 }, (_, i) => ({
            value: String(i + 1),
            label: `${__('Zona')} ${i + 1}`,
        })),
    ], [__]);

    const nivelOptions = useMemo(() => [
        { value: '', label: __('Todos los niveles') },
        { value: 'Ministro Ordenado', label: 'Ministro Ordenado' },
        { value: 'Licenciado', label: 'Licenciado' },
        { value: 'Pastor Asociado', label: 'Pastor Asociado' },
        { value: 'Colaborador', label: 'Colaborador' },
        { value: 'Laico', label: 'Laico' },
    ], [__]);

    const fotoOptions = useMemo(() => [
        { value: '', label: __('Todos (Con o sin foto)') },
        { value: 'si', label: __('Solo con foto acreditada') },
        { value: 'no', label: __('Solo sin foto de perfil') },
    ], [__]);

    // Aplicar filtros al backend
    const applyFilters = (newFilters: Record<string, string>) => {
        const params = cleanParams({
            search: searchTerm,
            zona: zonaFilter,
            nivel_ministerial: nivelFilter,
            con_foto: fotoFilter,
            per_page: filters.per_page || '40',
            pastor_id: selectedPastor?.id ? String(selectedPastor.id) : undefined,
            ...newFilters,
        });

        router.get('/admin/pastores/carnets', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search: searchTerm });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setZonaFilter('');
        setNivelFilter('');
        setFotoFilter('');
        router.get('/admin/pastores/carnets', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Selección múltiple
    const handleToggleSelectAll = () => {
        const pageIds = pastores.data.map((p) => p.id);
        const allSelected = pageIds.every((id) => selectedIds.includes(id));

        if (allSelected) {
            setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
        } else {
            setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
        }
    };

    const handleToggleSelectOne = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Acciones de descarga
    const handleDownloadSinglePdf = (pastor: Pastor) => {
        window.open(`/admin/pastores/${pastor.id}/carnet-pdf`, '_blank');
    };

    const handleDownloadPng = async (side: 'front' | 'back') => {
        if (!selectedPastor) return;
        try {
            setIsExportingPng(true);
            toast.info(__('Generando imagen de alta resolución a 300 DPI...'));
            const customUrl = side === 'front' ? frontTemplateUrl : backTemplateUrl;
            await exportPastorCarnetPng(selectedPastor, side, customUrl);
            toast.success(__('Imagen del carnet descargada'));
        } catch (error) {
            console.error('Error al generar imagen:', error);
            toast.error(__('No se pudo generar la imagen del carnet'));
        } finally {
            setIsExportingPng(false);
        }
    };

    // Callback cuando se actualiza la plantilla modelo
    const handleTemplateSaved = (tipo: 'frente' | 'atras', newUrl: string) => {
        const cacheBusted = `${newUrl.split('?')[0]}?v=${Date.now()}`;
        if (tipo === 'frente') {
            setFrontTemplateUrl(cacheBusted);
        } else {
            setBackTemplateUrl(cacheBusted);
        }
    };

    const handleTemplateRestored = () => {
        setFrontTemplateUrl(`/image/Credencial-frente.png?v=${Date.now()}`);
        setBackTemplateUrl(`/image/Credencial-atras.png?v=${Date.now()}`);
    };

    // Callback cuando se actualiza la foto del pastor activo
    const handlePhotoUpdated = (newPhotoUrl: string) => {
        if (!selectedPastor) return;
        setSelectedPastor({
            ...selectedPastor,
            foto: newPhotoUrl,
            foto_url: newPhotoUrl,
        });
        router.reload({ only: ['pastores'] });
    };

    // Mejora la foto original del pastor y conserva el resultado en su registro.
    const handleEnhanceSinglePastorAi = async (pastor: Pastor | null) => {
        if (!pastor) {
            return;
        }

        if (!pastor.foto) {
            toast.info(__('El pastor no tiene una fotografía registrada para mejorar.'));

            return;
        }

        try {
            setIsEnhancingSingleAi(true);
            toast.info(__('Mejorando la fotografía con IA...'), {
                description: __('Aumentando resolución, reduciendo ruido y equilibrando la iluminación.'),
            });

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch(`/admin/pastores/${pastor.id}/ia-enhance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({}),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success(__('¡Foto de :name mejorada con IA!', {
                    name: `${pastor.nombres} ${pastor.apellidos}`,
                }));
                handlePhotoUpdated(result.foto_url);
            } else {
                toast.error(result.error || __('No se pudo mejorar la fotografía con IA.'));
            }
        } catch (error) {
            console.error('Error al mejorar con IA:', error);
            toast.error(__('Ocurrió un error al procesar con IA.'));
        } finally {
            setIsEnhancingSingleAi(false);
        }
    };

    // Procesamiento masivo por lotes con IA de estudio
    const handleBulkAiEnhancement = async () => {
        if (selectedIds.length === 0 || isEnhancingBulkAi) {
            return;
        }

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        setIsEnhancingBulkAi(true);
        toast.info(__('Iniciando mejora con IA para los pastores seleccionados...'));

        try {
            const response = await fetch('/admin/pastores/bulk-ia-enhance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ ids: selectedIds }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                if (result.succeeded_count > 0) {

                    if (result.failed_count > 0) {
                        toast.warning(__('Se mejoraron :succeeded fotos; :failed no pudieron procesarse.', {
                            succeeded: String(result.succeeded_count),
                            failed: String(result.failed_count),
                        }), {
                            description: result.failed?.[0]?.error,
                        });
                    } else {
                        toast.success(__('¡:count fotos mejoradas con IA!', {
                            count: String(result.succeeded_count),
                        }));
                    }
                } else {
                    toast.error(__('No se pudo mejorar ninguna fotografía.'), {
                        description: result.failed?.[0]?.error,
                    });
                }

                setIsBulkAiModalOpen(false);
                if (result.succeeded_count > 0) {
                    router.reload({ only: ['pastores'] });
                }
            } else {
                toast.error(result.error || __('Error al procesar el lote con IA.'));
            }
        } catch (error) {
            console.error('Error en lote de IA:', error);
            toast.error(__('Ocurrió un error al procesar el lote con IA.'));
        } finally {
            setIsEnhancingBulkAi(false);
        }
    };

    const handleRemoveSelectedBackgrounds = async () => {
        if (selectedIds.length === 0 || isRemovingBackground) {
            return;
        }

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        setIsRemovingBackground(true);

        try {
            const listResponse = await fetch('/admin/pastores/carnets/fotos-seleccionadas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
                body: JSON.stringify({ ids: selectedIds }),
            });
            const listResult = await listResponse.json();

            if (!listResponse.ok) {
                throw new Error(listResult.message || listResult.error || __('No se pudieron cargar las fotos seleccionadas.'));
            }

            const pastorsWithPhotos: Array<{
                id: number;
                nombres: string;
                apellidos: string;
                foto: string;
            }> = listResult.pastores || [];

            if (pastorsWithPhotos.length === 0) {
                toast.info(__('Los obreros seleccionados no tienen fotos para procesar.'));
                setIsBulkBackgroundModalOpen(false);

                return;
            }

            setBackgroundProgress({ completed: 0, total: pastorsWithPhotos.length });

            let succeeded = 0;
            const failures: string[] = [];

            for (const pastor of pastorsWithPhotos) {
                const pastorName = `${pastor.nombres} ${pastor.apellidos}`.trim();

                try {
                    const photoUrl = getPastorPhotoUrl(pastor.foto);

                    if (!photoUrl) {
                        throw new Error(__('No se encontró la foto.'));
                    }

                    const image = new Image();
                    image.crossOrigin = 'anonymous';
                    await new Promise<void>((resolve, reject) => {
                        image.onload = () => resolve();
                        image.onerror = () => reject(new Error(__('No se pudo cargar la foto.')));
                        image.src = photoUrl;
                    });

                    const segmentedImageData = await removeBackgroundWithAi(
                        image,
                        image.naturalWidth,
                        image.naturalHeight
                    );
                    const canvas = document.createElement('canvas');
                    canvas.width = image.naturalWidth;
                    canvas.height = image.naturalHeight;
                    const context = canvas.getContext('2d');

                    if (!context) {
                        throw new Error(__('No se pudo preparar la foto procesada.'));
                    }

                    context.putImageData(segmentedImageData, 0, 0);

                    const saveResponse = await fetch(`/admin/pastores/${pastor.id}/actualizar-foto`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            Accept: 'application/json',
                        },
                        body: JSON.stringify({ foto: canvas.toDataURL('image/png') }),
                    });
                    const saveResult = await saveResponse.json();

                    if (!saveResponse.ok || !saveResult.success) {
                        throw new Error(saveResult.message || saveResult.error || __('No se pudo guardar la foto.'));
                    }

                    succeeded += 1;
                    setSelectedPastor((current) =>
                        current?.id === pastor.id
                            ? { ...current, foto: saveResult.foto_url, foto_url: saveResult.foto_url }
                            : current
                    );
                } catch (error) {
                    console.error(`Error al eliminar el fondo de la foto del obrero ${pastor.id}:`, error);
                    const reason = error instanceof Error ? error.message : __('Error desconocido');
                    failures.push(`${pastorName || pastor.id} (${reason})`);
                } finally {
                    setBackgroundProgress((current) => ({ ...current, completed: current.completed + 1 }));
                }
            }

            if (succeeded > 0) {
                toast.success(__('Fondo eliminado con IA en :count foto(s).', { count: String(succeeded) }));
                router.reload({ only: ['pastores'] });
            }

            if (failures.length > 0) {
                const failedNames = failures.slice(0, 3).join(', ');
                const moreFailures = failures.length > 3 ? ` (+${failures.length - 3})` : '';
                toast.error(
                    __('No se pudieron procesar :count foto(s): :names', {
                        count: String(failures.length),
                        names: `${failedNames}${moreFailures}`,
                    })
                );
            }

            setIsBulkBackgroundModalOpen(false);
        } catch (error) {
            console.error('Error al procesar las fotos seleccionadas:', error);
            toast.error(error instanceof Error ? error.message : __('No se pudieron procesar las fotos seleccionadas.'));
        } finally {
            setIsRemovingBackground(false);
        }
    };

    // Generar pliego masivo
    const handleConfirmBulkPrint = () => {
        if (selectedIds.length === 0) return;

        setIsPrinting(true);
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/admin/pastores/bulk-carnet-pdf';
        form.target = '_blank';

        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = token;
            form.appendChild(csrfInput);
        }

        const tipoInput = document.createElement('input');
        tipoInput.type = 'hidden';
        tipoInput.name = 'tipo_pliego';
        tipoInput.value = tipoPliego;
        form.appendChild(tipoInput);

        selectedIds.forEach((id) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'ids[]';
            input.value = String(id);
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        setIsPrinting(false);
        setIsPrintModalOpen(false);
        toast.success(__('Generando pliego PDF con :count credenciales...', { count: String(selectedIds.length) }));
    };

    // Pastores seleccionados que no tienen foto
    const selectedWithoutPhoto = useMemo(() => {
        return pastores.data.filter((p) => selectedIds.includes(p.id) && !p.foto);
    }, [pastores.data, selectedIds]);

    const verificationUrl = selectedPastor
        ? typeof window !== 'undefined'
            ? `${window.location.origin}/validar-credencial/${encodeURIComponent(selectedPastor.codigo || selectedPastor.documento || selectedPastor.id)}`
            : `/validar-credencial/${selectedPastor.codigo || selectedPastor.id}`
        : '';

    return (
        <>
            <Head title={__('Centro de Carnetización y Credenciales')} />

            <div className="space-y-6">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                {/* Encabezado del Módulo */}
                <ModuleHeader
                    icon={<IdCard className="size-6 text-white" />}
                    title={__('Centro de Carnetización Ministerial')}
                    description={__('Diseño, previsualización en alta definición y emisión de credenciales oficiales')}
                    colorClassName="bg-indigo-600"
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href="/admin/pastores">
                            <Button
                                variant="secondary"
                                className="gap-2 bg-white/15 text-white hover:bg-white/25 border border-white/20 font-semibold"
                            >
                                <ArrowLeft className="size-4" />
                                {__('Volver a Pastores')}
                            </Button>
                        </Link>

                        {/* Botón para Modificar Plantillas Modelo (Frontal y Reverso) */}
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsTemplateModalOpen(true)}
                            className="gap-2 bg-white/20 text-white hover:bg-white/30 border border-white/20 font-semibold shadow-xs"
                            title={__('Adjuntar o modificar la imagen modelo frontal y reverso del carnet')}
                        >
                            <Layers className="size-4" />
                            <span>{__('Plantillas Modelo')}</span>
                        </Button>

                        {canDownloadCarnet && (
                            <>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsBulkBackgroundModalOpen(true)}
                                    disabled={selectedIds.length === 0 || isRemovingBackground}
                                    className={cn(
                                        'gap-2 font-semibold shadow-xs transition-all',
                                        selectedIds.length > 0
                                            ? 'bg-white text-indigo-700 hover:bg-indigo-50 hover:scale-[1.02]'
                                            : 'bg-white/30 text-white/70 cursor-not-allowed'
                                    )}
                                >
                                    <Sparkles className="size-4" />
                                    <span>{__('Quitar fondo con IA')}</span>
                                    {selectedIds.length > 0 && (
                                        <Badge className="bg-indigo-600 text-white text-[10px] px-1.5 py-0 h-4 ml-1">
                                            {selectedIds.length}
                                        </Badge>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsBulkAiModalOpen(true)}
                                    disabled={selectedIds.length === 0 || isEnhancingBulkAi}
                                    className={cn(
                                        'gap-2 font-semibold shadow-xs transition-all',
                                        selectedIds.length > 0
                                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 hover:scale-[1.02]'
                                            : 'bg-white/30 text-white/70 cursor-not-allowed'
                                    )}
                                    title={__('Aumenta la resolución y mejora el ruido, el enfoque y la luz en las fotos seleccionadas')}
                                >
                                    {isEnhancingBulkAi ? (
                                        <Loader2 className="size-4 animate-spin text-amber-300" />
                                    ) : (
                                        <Sparkles className="size-4 text-amber-300 fill-amber-300" />
                                    )}
                                    <span>{__('✨ Mejorar con IA')}</span>
                                    {selectedIds.length > 0 && (
                                        <Badge className="bg-white/20 text-white text-[10px] px-1.5 py-0 h-4 ml-1">
                                            {selectedIds.length}
                                        </Badge>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsPrintModalOpen(true)}
                                    disabled={selectedIds.length === 0}
                                    className={cn(
                                        'gap-2 font-semibold shadow-xs transition-all',
                                        selectedIds.length > 0
                                            ? 'bg-white text-indigo-700 hover:bg-indigo-50 hover:scale-[1.02]'
                                            : 'bg-white/30 text-white/70 cursor-not-allowed'
                                    )}
                                >
                                    <Printer className="size-4" />
                                    <span>{__('Imprimir Pliego')}</span>
                                    {selectedIds.length > 0 && (
                                        <Badge className="bg-indigo-600 text-white text-[10px] px-1.5 py-0 h-4 ml-1">
                                            {selectedIds.length}
                                        </Badge>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </ModuleHeader>

                {/* Tarjetas de Estadísticas */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title={__('Total Pastores')}
                        value={stats.total.toLocaleString('es-VE')}
                        icon={<Users className="size-5 text-indigo-600" />}
                        colorClassName="bg-indigo-100 dark:bg-indigo-950/50"
                        subtitle={__('Registrados en el sistema')}
                    />
                    <StatCard
                        title={__('Con Foto Acreditada')}
                        value={stats.con_foto.toLocaleString('es-VE')}
                        icon={<CheckCircle2 className="size-5 text-emerald-600" />}
                        colorClassName="bg-emerald-100 dark:bg-emerald-950/50"
                        subtitle={__('Listos para emisión de carnet')}
                    />
                    <StatCard
                        title={__('Sin Foto de Perfil')}
                        value={stats.sin_foto.toLocaleString('es-VE')}
                        icon={<AlertCircle className="size-5 text-amber-600" />}
                        colorClassName="bg-amber-100 dark:bg-amber-950/50"
                        subtitle={__('Requieren actualizar foto')}
                    />
                    <StatCard
                        title={__('En Cola de Impresión')}
                        value={selectedIds.length}
                        icon={<Printer className="size-5 text-blue-600" />}
                        colorClassName="bg-blue-100 dark:bg-blue-950/50"
                        subtitle={__('Seleccionados en este lote')}
                    />
                </div>

                {/* ÁREA PRINCIPAL: ESTUDIO DE TRABAJO (2 COLUMNAS) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* COLUMNA IZQUIERDA (7 cols): VISOR INTERACTIVO Y ESTUDIO EN VIVO */}
                    <div className="lg:col-span-7 space-y-4">
                        <Card className="border border-border shadow-md overflow-hidden bg-card">
                            <CardHeader className="p-4 sm:p-5 border-b bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="size-5 text-indigo-600" />
                                        <CardTitle className="text-base sm:text-lg font-bold">
                                            {__('Estudio de Tarjetas de Pastorado (9 × 5.5 cm)')}
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs mt-0.5">
                                        {selectedPastor
                                            ? `${selectedPastor.nombres} ${selectedPastor.apellidos} • ${formatDocumento(selectedPastor.documento)}`
                                            : __('Selecciona un pastor de la lista')}
                                    </CardDescription>
                                </div>

                                {/* Selector de Modo de Visualización */}
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border">
                                        <Button
                                            type="button"
                                            variant={viewMode === 'flip' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('flip')}
                                            className={cn(
                                                'h-7 px-2.5 text-xs font-semibold rounded-md shadow-none',
                                                viewMode === 'flip' ? 'bg-indigo-600 text-white' : 'hover:bg-background'
                                            )}
                                        >
                                            <RotateCw className="size-3 mr-1" />
                                            {__('Giro 3D')}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={viewMode === 'both' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('both')}
                                            className={cn(
                                                'h-7 px-2.5 text-xs font-semibold rounded-md shadow-none',
                                                viewMode === 'both' ? 'bg-indigo-600 text-white' : 'hover:bg-background'
                                            )}
                                        >
                                            <Layers className="size-3 mr-1" />
                                            {__('Ambas Caras')}
                                        </Button>
                                    </div>

                                    {viewMode === 'flip' && (
                                        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border">
                                            <Button
                                                type="button"
                                                variant={activeSide === 'front' ? 'secondary' : 'ghost'}
                                                size="sm"
                                                onClick={() => setActiveSide('front')}
                                                className={cn(
                                                    'h-7 px-2.5 text-xs font-semibold rounded-md shadow-none',
                                                    activeSide === 'front' ? 'bg-background shadow-xs font-bold text-indigo-600' : ''
                                                )}
                                            >
                                                {__('Frente')}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={activeSide === 'back' ? 'secondary' : 'ghost'}
                                                size="sm"
                                                onClick={() => setActiveSide('back')}
                                                className={cn(
                                                    'h-7 px-2.5 text-xs font-semibold rounded-md shadow-none',
                                                    activeSide === 'back' ? 'bg-background shadow-xs font-bold text-indigo-600' : ''
                                                )}
                                            >
                                                {__('Reverso')}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent
                                ref={viewerContainerRef}
                                className="p-4 sm:p-6 bg-slate-950/15 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[460px] overflow-visible w-full select-none"
                            >
                                {selectedPastor ? (
                                    viewMode === 'flip' ? (
                                        <div className="w-full flex flex-col items-center justify-center py-2 overflow-visible">
                                            <PastorCarnetCard
                                                pastor={selectedPastor}
                                                activeSide={activeSide}
                                                onFlip={() => setActiveSide(activeSide === 'front' ? 'back' : 'front')}
                                                onEditPhoto={() => setIsPhotoModalOpen(true)}
                                                interactive={true}
                                                scale={viewerScale}
                                                templateFrontUrl={frontTemplateUrl}
                                                templateBackUrl={backTemplateUrl}
                                            />
                                            <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5 font-medium text-center">
                                                <RotateCw className="size-3.5 text-indigo-600 animate-spin-slow shrink-0" />
                                                <span>{__('Haz clic sobre la credencial o pulsa Voltear para girarla en 3D')}</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="w-full flex flex-col items-center justify-center gap-6 py-2 overflow-x-auto">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-bold text-muted-foreground uppercase mb-2">
                                                    {__('Anverso (Cara Frontal)')}
                                                </span>
                                                <PastorCarnetCard
                                                    pastor={selectedPastor}
                                                    activeSide="front"
                                                    interactive={false}
                                                    scale={Math.min(0.82, viewerScale)}
                                                    templateFrontUrl={frontTemplateUrl}
                                                    templateBackUrl={backTemplateUrl}
                                                />
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-bold text-muted-foreground uppercase mb-2">
                                                    {__('Reverso (Cara Trasera con QR)')}
                                                </span>
                                                <PastorCarnetCard
                                                    pastor={selectedPastor}
                                                    activeSide="back"
                                                    interactive={false}
                                                    scale={Math.min(0.82, viewerScale)}
                                                    templateFrontUrl={frontTemplateUrl}
                                                    templateBackUrl={backTemplateUrl}
                                                />
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <IdCard className="size-12 mx-auto text-muted-foreground/40 mb-3" />
                                        <p className="font-semibold">{__('No hay ningún pastor seleccionado')}</p>
                                        <p className="text-xs mt-1">{__('Selecciona un pastor de la lista a la derecha para previsualizar')}</p>
                                    </div>
                                )}
                            </CardContent>

                            {/* Barra de Herramientas del Visor */}
                            {selectedPastor && (
                                <div className="p-4 border-t bg-card flex flex-wrap items-center justify-between gap-2.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {viewMode === 'flip' && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setActiveSide(activeSide === 'front' ? 'back' : 'front')}
                                                className="gap-2 text-xs font-semibold h-9 px-3"
                                            >
                                                <RotateCw className="size-3.5 text-indigo-600" />
                                                {activeSide === 'front' ? __('Voltear al Reverso') : __('Voltear al Frente')}
                                            </Button>
                                        )}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsTemplateModalOpen(true)}
                                            className="gap-2 text-xs font-semibold h-9 px-3 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50/50"
                                            title={__('Adjuntar o modificar imagen modelo frontal/reverso')}
                                        >
                                            <Layers className="size-3.5 text-indigo-600" />
                                            {__('Modificar Plantilla')}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsPhotoModalOpen(true)}
                                            className="gap-2 text-xs font-semibold h-9 px-3 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50/50"
                                            title={__('Ajustar tamaño y eliminar fondo de la foto del pastor')}
                                        >
                                            <Scissors className="size-3.5 text-emerald-600" />
                                            {__('Ajustar Foto Pastor')}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isEnhancingSingleAi || !selectedPastor?.foto}
                                            onClick={() => handleEnhanceSinglePastorAi(selectedPastor)}
                                            className="gap-2 text-xs font-bold h-9 px-3 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800 hover:bg-purple-50/80 dark:hover:bg-purple-950/50 shadow-xs transition-all hover:scale-[1.02] active:scale-95"
                                            title={__('Aumenta la resolución y mejora la nitidez, el ruido y la iluminación con IA (1 clic)')}
                                        >
                                            {isEnhancingSingleAi ? (
                                                <>
                                                    <Loader2 className="size-3.5 animate-spin text-purple-600" />
                                                    <span>{__('Mejorando con IA...')}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="size-3.5 text-amber-500 fill-amber-400" />
                                                    <span>{__('✨ Mejorar con IA (1 Clic)')}</span>
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDownloadPng(activeSide)}
                                            disabled={isExportingPng}
                                            className="gap-2 text-xs font-semibold h-9 px-3"
                                            title={__('Descargar como imagen PNG de 300 DPI')}
                                        >
                                            <ImageIcon className="size-3.5 text-emerald-600" />
                                            {__('Descargar PNG')}
                                        </Button>

                                        {verificationUrl && (
                                            <a
                                                href={verificationUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50/50 transition-colors"
                                            >
                                                <QrCode className="size-3.5 text-indigo-600" />
                                                <span>{__('Validar QR')}</span>
                                                <ExternalLink className="size-3" />
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link href={`/admin/pastores/${selectedPastor.id}/edit`}>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="gap-1.5 text-xs h-9 px-3 text-muted-foreground hover:text-foreground"
                                            >
                                                <Pencil className="size-3.5" />
                                                {__('Editar Datos')}
                                            </Button>
                                        </Link>

                                        {canDownloadCarnet && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => handleDownloadSinglePdf(selectedPastor)}
                                                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-4 shadow-sm"
                                            >
                                                <Download className="size-3.5" />
                                                {__('Descargar PDF (9 × 5.5 cm)')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Ficha Técnica y Especificaciones de Impresión */}
                        {selectedPastor && (
                            <Card className="border border-border/80 shadow-xs bg-card">
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <FileText className="size-4 text-indigo-600" />
                                        {__('Ficha de Credencial & Calidad')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-1 space-y-3">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                        <div className="p-2.5 rounded-lg bg-muted/50 border">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                                                {__('Nivel Ministerial')}
                                            </span>
                                            <span className="font-semibold text-foreground mt-0.5 block truncate">
                                                {selectedPastor.nivel_ministerial || 'Ministro Ordenado'}
                                            </span>
                                        </div>

                                        <div className="p-2.5 rounded-lg bg-muted/50 border">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                                                {__('Zona y Distrito')}
                                            </span>
                                            <span className="font-semibold text-foreground mt-0.5 block truncate">
                                                Zona {selectedPastor.zona || 'N/A'}{selectedPastor.distrito ? ` • Dist. ${selectedPastor.distrito}` : ''}
                                            </span>
                                        </div>

                                        <div className="p-2.5 rounded-lg bg-muted/50 border">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                                                {__('Código Pastor')}
                                            </span>
                                            <span className="font-mono font-bold text-foreground mt-0.5 block truncate">
                                                {selectedPastor.codigo || 'S/C'}
                                            </span>
                                        </div>

                                        <div className="p-2.5 rounded-lg bg-muted/50 border">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                                                {__('Estado Fotográfico')}
                                            </span>
                                            <span className="font-semibold mt-0.5 flex items-center gap-1.5">
                                                {selectedPastor.foto ? (
                                                    <>
                                                        <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                                                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">{__('Foto OK')}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="size-2 rounded-full bg-amber-500 inline-block" />
                                                        <span className="text-amber-700 dark:text-amber-400 font-bold">{__('Sin Foto')}</span>
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-[11.5px] text-indigo-950 dark:text-indigo-200 flex items-start gap-2.5">
                                        <ShieldCheck className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold">{__('Especificación de Imprenta:')}</span>
                                            {' '}
                                            {__('Formato oficial de Tarjeta de Pastorado (9.0 × 5.5 cm) calibrado a 300 DPI. Tipografías Cocogoose y Aribau Grotesk. Apto para PVC o pliegos tiro y retiro en hoja Carta con marcas de corte.')}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* COLUMNA DERECHA (5 cols): SELECTOR Y COLA DE IMPRESIÓN POR LOTES */}
                    <div className="lg:col-span-5 space-y-4">
                        <Card className="border border-border shadow-md bg-card">
                            <CardHeader className="p-4 sm:p-5 border-b bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="size-5 text-indigo-600" />
                                        <CardTitle className="text-base font-bold">
                                            {__('Directorio de Pastores')}
                                        </CardTitle>
                                    </div>
                                    <Badge variant="outline" className="text-xs font-semibold">
                                        {pastores.total} {__('total')}
                                    </Badge>
                                </div>
                                <CardDescription className="text-xs mt-1">
                                    {__('Filtra y selecciona los pastores que deseas emitir o previsualizar')}
                                </CardDescription>

                                {/* Filtros Rápidos */}
                                <div className="space-y-2.5 mt-3 pt-3 border-t">
                                    <form onSubmit={handleSearchSubmit} className="relative">
                                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder={__('Buscar por nombre, cédula o código...')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 pr-9 h-9 text-xs"
                                        />
                                        {searchTerm && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    applyFilters({ search: '' });
                                                }}
                                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        )}
                                    </form>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Select2
                                                options={zonaOptions}
                                                value={zonaFilter}
                                                onChange={(val) => {
                                                    setZonaFilter(val);
                                                    applyFilters({ zona: val });
                                                }}
                                                placeholder={__('Zona')}
                                                className="h-9 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <Select2
                                                options={nivelOptions}
                                                value={nivelFilter}
                                                onChange={(val) => {
                                                    setNivelFilter(val);
                                                    applyFilters({ nivel_ministerial: val });
                                                }}
                                                placeholder={__('Nivel')}
                                                className="h-9 text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 pt-1">
                                        <div className="flex-1">
                                            <Select2
                                                options={fotoOptions}
                                                value={fotoFilter}
                                                onChange={(val) => {
                                                    setFotoFilter(val);
                                                    applyFilters({ con_foto: val });
                                                }}
                                                placeholder={__('Filtro de Foto')}
                                                className="h-9 text-xs"
                                            />
                                        </div>

                                        {(searchTerm || zonaFilter || nivelFilter || fotoFilter) && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleClearFilters}
                                                className="text-xs h-9 px-2.5 text-muted-foreground hover:text-foreground shrink-0"
                                                title={__('Limpiar todos los filtros')}
                                            >
                                                <X className="size-3.5 mr-1" />
                                                {__('Limpiar')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            {/* Barra de Selección Masiva */}
                            <div className="p-3 bg-muted/40 border-b flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleToggleSelectAll}
                                        className="flex items-center gap-1.5 font-semibold text-foreground hover:text-indigo-600 transition-colors"
                                    >
                                        {pastores.data.length > 0 &&
                                        pastores.data.every((p) => selectedIds.includes(p.id)) ? (
                                            <CheckSquare className="size-4 text-indigo-600" />
                                        ) : (
                                            <Square className="size-4 text-muted-foreground" />
                                        )}
                                        <span>{__('Seleccionar página')}</span>
                                    </button>

                                    {selectedIds.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedIds([])}
                                            className="text-muted-foreground hover:text-foreground text-[11px] underline"
                                        >
                                            {__('Deseleccionar')}
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={selectedIds.length > 0 ? 'default' : 'secondary'}
                                        className={cn(
                                            'text-xs font-bold',
                                            selectedIds.length > 0 && 'bg-indigo-600 text-white'
                                        )}
                                    >
                                        {selectedIds.length} {__('seleccionados')}
                                    </Badge>
                                </div>
                            </div>

                            {/* Lista de Pastores */}
                            <div className="divide-y max-h-[560px] overflow-y-auto no-scrollbar">
                                {pastores.data.length > 0 ? (
                                    pastores.data.map((pastor) => {
                                        const isSelected = selectedIds.includes(pastor.id);
                                        const isActive = selectedPastor?.id === pastor.id;
                                        const photoUrl = getPastorPhotoUrl((pastor as any).foto_url || pastor.foto);
                                        const initials = `${pastor.nombres?.trim()?.[0] || ''}${pastor.apellidos?.trim()?.[0] || ''}`.toUpperCase() || 'P';

                                        return (
                                            <div
                                                key={pastor.id}
                                                onClick={() => setSelectedPastor(pastor)}
                                                className={cn(
                                                    'p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors hover:bg-muted/60',
                                                    isActive && 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-l-indigo-600',
                                                    isSelected && !isActive && 'bg-muted/30'
                                                )}
                                            >
                                                {/* Checkbox de selección */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleToggleSelectOne(pastor.id, e)}
                                                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
                                                    title={isSelected ? __('Deseleccionar de lote') : __('Añadir a lote de impresión')}
                                                >
                                                    {isSelected ? (
                                                        <CheckSquare className="size-4 text-indigo-600" />
                                                    ) : (
                                                        <Square className="size-4 text-muted-foreground" />
                                                    )}
                                                </button>

                                                {/* Avatar */}
                                                <Avatar className="size-9 rounded-lg border shrink-0">
                                                    {photoUrl ? (
                                                        <AvatarImage src={photoUrl} alt={pastor.nombres} className="object-cover object-top" />
                                                    ) : null}
                                                    <AvatarFallback className="bg-slate-800 text-white font-bold text-xs rounded-lg">
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>

                                                {/* Info del Pastor */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-foreground truncate">
                                                        {pastor.nombres} {pastor.apellidos}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground truncate font-mono">
                                                        {formatDocumento(pastor.documento)} {pastor.codigo ? `• ${pastor.codigo}` : ''}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                        <span className="text-[9.5px] uppercase font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                            {pastor.nivel_ministerial || 'Ministro'}
                                                        </span>
                                                        {pastor.zona && (
                                                            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                                                Z-{pastor.zona}
                                                            </span>
                                                        )}
                                                        {!pastor.foto && (
                                                            <span className="text-[9.5px] font-semibold text-amber-600 dark:text-amber-400">
                                                                {__('Sin foto')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Botón rápido de previsualización */}
                                                <Button
                                                    type="button"
                                                    variant={isActive ? 'default' : 'ghost'}
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedPastor(pastor);
                                                    }}
                                                    className={cn(
                                                        'h-7 px-2 text-xs font-semibold shrink-0',
                                                        isActive ? 'bg-indigo-600 text-white' : 'text-muted-foreground'
                                                    )}
                                                >
                                                    {__('Ver')}
                                                </Button>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <p className="text-xs font-semibold">{__('No se encontraron pastores con estos filtros')}</p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleClearFilters}
                                            className="mt-3 text-xs h-8"
                                        >
                                            {__('Restablecer filtros')}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Paginación */}
                            {pastores.total > pastores.per_page && (
                                <div className="p-3 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        {pastores.from || 0} - {pastores.to || 0} de {pastores.total}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {pastores.prev_page_url && (
                                            <Link href={pastores.prev_page_url} preserveScroll preserveState>
                                                <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                                                    {__('Anterior')}
                                                </Button>
                                            </Link>
                                        )}
                                        {pastores.next_page_url && (
                                            <Link href={pastores.next_page_url} preserveScroll preserveState>
                                                <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                                                    {__('Siguiente')}
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            {/* MODAL PARA ADJUNTAR Y MODIFICAR PLANTILLAS MODELO (FRONTAL Y REVERSO) */}
            <PastorCarnetTemplateModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                currentFrontUrl={frontTemplateUrl}
                currentBackUrl={backTemplateUrl}
                onSaved={handleTemplateSaved}
                onRestored={handleTemplateRestored}
            />

            {/* MODAL PARA AJUSTAR FOTO DEL PASTOR (TAMAÑO Y ELIMINAR FONDO) */}
            <PastorPhotoAdjustModal
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                pastor={selectedPastor}
                onPhotoUpdated={handlePhotoUpdated}
            />

            {/* MODAL PARA ELIMINAR EL FONDO DE TODAS LAS FOTOS SELECCIONADAS */}
            <Dialog
                open={isBulkBackgroundModalOpen}
                onOpenChange={(open) => {
                    if (!isRemovingBackground) setIsBulkBackgroundModalOpen(open);
                }}
            >
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="size-5 text-indigo-600" />
                            {__('Quitar fondo de fotos seleccionadas')}
                        </DialogTitle>
                        <DialogDescription>
                            {__('Se procesarán con IA las fotos de los :count obreros seleccionados. Los obreros sin foto se omitirán. El procesamiento se realiza en este dispositivo.', {
                                count: String(selectedIds.length),
                            })}
                        </DialogDescription>
                    </DialogHeader>

                    {isRemovingBackground && (
                        <div className="flex items-center gap-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200">
                            <Loader2 className="size-4 animate-spin shrink-0" />
                            <span>
                                {__('Procesando foto :completed de :total...', {
                                    completed: String(backgroundProgress.completed + 1),
                                    total: String(backgroundProgress.total || selectedIds.length),
                                })}
                            </span>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsBulkBackgroundModalOpen(false)}
                            disabled={isRemovingBackground}
                        >
                            {__('Cancelar')}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleRemoveSelectedBackgrounds}
                            disabled={isRemovingBackground || selectedIds.length === 0}
                            className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            {isRemovingBackground ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    {__('Procesando...')}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-4" />
                                    {__('Procesar fotos')}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL PARA MEJORA MASIVA DE FOTOGRAFÍAS */}
            <Dialog
                open={isBulkAiModalOpen}
                onOpenChange={(open) => {
                    if (!isEnhancingBulkAi) setIsBulkAiModalOpen(open);
                }}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                            <Sparkles className="size-5 text-amber-500 fill-amber-400" />
                            {__('Mejorar fotos con IA')}
                        </DialogTitle>
                        <DialogDescription>
                            {__('Se aumentará la resolución y se mejorará el enfoque, el ruido y la iluminación de las fotos de :count pastores. Los pastores sin foto se omitirán.', {
                                count: String(selectedIds.length),
                            })}
                        </DialogDescription>
                    </DialogHeader>

                    {isEnhancingBulkAi && (
                        <div className="flex flex-col gap-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 p-3.5 text-xs text-purple-900 dark:text-purple-200">
                            <div className="flex items-center gap-3">
                                <Loader2 className="size-5 animate-spin text-purple-600 shrink-0" />
                                <div>
                                    <p className="font-bold">
                                        {__('Mejorando fotografías con IA en curso...')}
                                    </p>
                                    <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80">
                                        {__('Esto puede tomar unos segundos por cada foto. Por favor, mantén esta ventana abierta.')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsBulkAiModalOpen(false)}
                            disabled={isEnhancingBulkAi}
                        >
                            {__('Cancelar')}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleBulkAiEnhancement}
                            disabled={isEnhancingBulkAi || selectedIds.length === 0}
                            className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 font-semibold"
                        >
                            {isEnhancingBulkAi ? (
                                <>
                                    <Loader2 className="size-4 animate-spin text-amber-300" />
                                    {__('Mejorando con IA...')}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-4 text-amber-300 fill-amber-300" />
                                    {__('Iniciar Mejora con IA')}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL DE IMPRESIÓN POR LOTES */}
            <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
                <DialogContent className="sm:max-w-[540px] max-w-[95vw] p-0 overflow-hidden bg-card border border-border shadow-2xl rounded-2xl">
                    <DialogHeader className="p-5 pb-3 border-b bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white">
                        <div className="flex items-center gap-2">
                            <Printer className="size-5 text-indigo-300" />
                            <DialogTitle className="text-lg font-bold text-white">
                                {__('Configuración de Pliego de Impresión')}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-indigo-200 mt-1">
                            {__('Selecciona el formato y disposición para los :count carnets seleccionados', { count: String(selectedIds.length) })}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-5 space-y-4">
                        {/* Alerta si hay pastores sin foto */}
                        {selectedWithoutPhoto.length > 0 && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                                <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold">{__('Atención:')}</span>{' '}
                                    {__('Hay :count pastor(es) seleccionado(s) sin fotografía. Se generará un recuadro institucional con sus iniciales.', { count: String(selectedWithoutPhoto.length) })}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground block">
                                {__('Tipo de Pliego y Disposición')}
                            </label>

                            {/* Opción 1: Dúplex Carta */}
                            <div
                                onClick={() => setTipoPliego('duplex')}
                                className={cn(
                                    'p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3',
                                    tipoPliego === 'duplex'
                                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                                        : 'hover:bg-muted/50 border-border'
                                )}
                            >
                                <div className={cn(
                                    'p-2 rounded-lg shrink-0',
                                    tipoPliego === 'duplex' ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground'
                                )}>
                                    <Layers className="size-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-foreground">
                                            {__('Pliego Dúplex Tiro y Retiro (Hoja Carta)')}
                                        </h4>
                                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                                            {__('Recomendado')}
                                        </Badge>
                                    </div>
                                    <p className="text-[11.5px] text-muted-foreground mt-0.5">
                                        {__('8 carnets por pliego. Página 1 = Frentes; Página 2 = Dorsos alineados en espejo con marcas de corte de guillotina.')}
                                    </p>
                                </div>
                            </div>

                            {/* Opción 2: Solo Frontales */}
                            <div
                                onClick={() => setTipoPliego('front_only')}
                                className={cn(
                                    'p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3',
                                    tipoPliego === 'front_only'
                                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                                        : 'hover:bg-muted/50 border-border'
                                )}
                            >
                                <div className={cn(
                                    'p-2 rounded-lg shrink-0',
                                    tipoPliego === 'front_only' ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground'
                                )}>
                                    <FileText className="size-4" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xs font-bold text-foreground">
                                        {__('Solo Caras Frontales (Hoja Carta)')}
                                    </h4>
                                    <p className="text-[11.5px] text-muted-foreground mt-0.5">
                                        {__('8 credenciales por página en solo anverso. Ideal para laminado simple o papel fotográfico adhesivo.')}
                                    </p>
                                </div>
                            </div>

                            {/* Opción 3: CR80 Individual */}
                            <div
                                onClick={() => setTipoPliego('cr80_individual')}
                                className={cn(
                                    'p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3',
                                    tipoPliego === 'cr80_individual'
                                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                                        : 'hover:bg-muted/50 border-border'
                                )}
                            >
                                <div className={cn(
                                    'p-2 rounded-lg shrink-0',
                                    tipoPliego === 'cr80_individual' ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground'
                                )}>
                                    <IdCard className="size-4" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xs font-bold text-foreground">
                                        {__('Tarjetas PVC Individuales (Zebra / Evolis)')}
                                    </h4>
                                    <p className="text-[11.5px] text-muted-foreground mt-0.5">
                                        {__('Formato individual oficial (8.5 × 5.4 cm). Diseñado para tarjetas o credenciales individuales.')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-4 border-t bg-muted/30 flex items-center justify-between gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsPrintModalOpen(false)}
                            className="text-xs h-9 px-4"
                        >
                            {__('Cancelar')}
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            onClick={handleConfirmBulkPrint}
                            disabled={isPrinting}
                            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-5 shadow-sm"
                        >
                            <Download className="size-3.5" />
                            {__('Generar Pliego PDF')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
