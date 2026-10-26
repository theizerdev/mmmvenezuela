import React, { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Upload,
    RotateCcw,
    ZoomIn,
    Scissors,
    Sparkles,
    Check,
    X,
    Maximize2,
    Move,
    Layers,
    Save,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslate } from '@/hooks/use-translate';

interface PastorCarnetTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFrontUrl: string;
    currentBackUrl: string;
    onSaved: (tipo: 'frente' | 'atras', newUrl: string) => void;
    onRestored: () => void;
}

export function PastorCarnetTemplateModal({
    isOpen,
    onClose,
    currentFrontUrl,
    currentBackUrl,
    onSaved,
    onRestored,
}: PastorCarnetTemplateModalProps) {
    const { __ } = useTranslate();
    const [activeTab, setActiveTab] = useState<'frente' | 'atras'>('frente');

    // Estados de edición para la cara actual
    const [scale, setScale] = useState<number>(1);
    const [panX, setPanX] = useState<number>(0);
    const [panY, setPanY] = useState<number>(0);
    const [removeBg, setRemoveBg] = useState<boolean>(false);
    const [tolerance, setTolerance] = useState<number>(30); // 0 a 100
    const [targetColor, setTargetColor] = useState<string>('#ffffff');
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Imagen cargada en memoria
    const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
    const [imageSrc, setImageSrc] = useState<string>('');

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDraggingRef = useRef<boolean>(false);
    const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    // Cuando cambia de pestaña o se abre el modal, cargar la plantilla correspondiente
    useEffect(() => {
        if (!isOpen) return;

        const url = activeTab === 'frente' ? currentFrontUrl : currentBackUrl;
        setImageSrc(url);
        handleResetControls();

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            setImageObj(img);
        };
        img.onerror = () => {
            console.error('Error al cargar plantilla base:', url);
        };
        img.src = url;
    }, [isOpen, activeTab, currentFrontUrl, currentBackUrl]);

    const handleResetControls = () => {
        setScale(1);
        setPanX(0);
        setPanY(0);
        setRemoveBg(false);
        setTolerance(30);
        setTargetColor('#ffffff');
    };

    // Cargar imagen personalizada desde archivo local
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (!dataUrl) return;

            setImageSrc(dataUrl);
            handleResetControls();

            const img = new Image();
            img.onload = () => {
                setImageObj(img);
                // Auto ajuste inteligente a relación CR80 (700x442)
                const targetRatio = 700 / 442;
                const imgRatio = img.width / img.height;
                if (imgRatio < targetRatio) {
                    setScale(targetRatio / imgRatio);
                } else {
                    setScale(1);
                }
                toast.info(__('Imagen modelo cargada. Ajusta el tamaño y fondo según desees.'));
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    // Dibujar en canvas con transformaciones y algoritmo de eliminación de fondo
    useEffect(() => {
        if (!isOpen || !canvasRef.current || !imageObj) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const W = 700;
        const H = 442;
        canvas.width = W;
        canvas.height = H;

        // Limpiar
        ctx.clearRect(0, 0, W, H);

        // Dibujar imagen centrada con pan y scale
        ctx.save();
        ctx.translate(W / 2 + panX, H / 2 + panY);
        ctx.scale(scale, scale);

        // Dibujar la imagen centrada
        const drawW = W;
        const drawH = (imageObj.height / imageObj.width) * W;
        ctx.drawImage(imageObj, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // Si se activó "Eliminar Fondo", procesar píxeles
        if (removeBg) {
            const imgData = ctx.getImageData(0, 0, W, H);
            const data = imgData.data;

            // Extraer color objetivo en RGB
            const hex = targetColor.replace('#', '');
            const targetR = parseInt(hex.substring(0, 2), 16) || 255;
            const targetG = parseInt(hex.substring(2, 4), 16) || 255;
            const targetB = parseInt(hex.substring(4, 6), 16) || 255;

            // Tolerancia convertida a distancia euclidiana (0 a 441 máx)
            const maxDist = 441.67;
            const tolDist = (tolerance / 100) * (maxDist * 0.7);
            const smoothRange = 15; // Rango de difuminado para bordes suaves

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                if (a === 0) continue;

                // Distancia euclidiana respecto al color de fondo
                const dist = Math.sqrt(
                    (r - targetR) ** 2 +
                    (g - targetG) ** 2 +
                    (b - targetB) ** 2
                );

                if (dist <= tolDist) {
                    // Píxel dentro del fondo a eliminar: completamente transparente
                    data[i + 3] = 0;
                } else if (dist < tolDist + smoothRange) {
                    // Transición suave (anti-aliasing)
                    const factor = (dist - tolDist) / smoothRange;
                    data[i + 3] = Math.round(a * factor);
                }
            }

            ctx.putImageData(imgData, 0, 0);
        }
    }, [isOpen, imageObj, scale, panX, panY, removeBg, tolerance, targetColor]);

    // Manejadores de arrastre con mouse sobre el canvas
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        isDraggingRef.current = true;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDraggingRef.current) return;
        const dx = e.clientX - lastMousePosRef.current.x;
        const dy = e.clientY - lastMousePosRef.current.y;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };

        setPanX((prev) => prev + dx);
        setPanY((prev) => prev + dy);
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    // Auto centrar y reescalar
    const handleFitCR80 = () => {
        if (!imageObj) return;
        setPanX(0);
        setPanY(0);
        const targetRatio = 700 / 442;
        const imgRatio = imageObj.width / imageObj.height;
        if (imgRatio < targetRatio) {
            setScale(targetRatio / imgRatio);
        } else {
            setScale(1);
        }
    };

    // Guardar plantilla en el servidor (generando resolución 1011x637 a 300 DPI)
    const handleSaveTemplate = async () => {
        if (!canvasRef.current) return;

        try {
            setIsSaving(true);

            // Generar canvas a 300 DPI (1011 x 637 px) para imprenta
            const hiResCanvas = document.createElement('canvas');
            hiResCanvas.width = 1011;
            hiResCanvas.height = 637;
            const hiResCtx = hiResCanvas.getContext('2d');
            if (!hiResCtx) return;

            // Dibujar el contenido del canvas visual escalado al tamaño de imprenta
            hiResCtx.drawImage(canvasRef.current, 0, 0, 1011, 637);
            const dataUrl = hiResCanvas.toDataURL('image/png');

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const response = await fetch('/admin/pastores/carnets/guardar-plantilla', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    tipo: activeTab,
                    imagen: dataUrl,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success(result.message || __('Plantilla guardada con éxito'));
                onSaved(activeTab, `${result.url.split('?')[0]}?v=${Date.now()}`);
                onClose();
            } else {
                toast.error(result.error || __('Error al guardar la plantilla'));
            }
        } catch (error) {
            console.error('Error al guardar plantilla:', error);
            toast.error(__('Ocurrió un error al guardar la plantilla'));
        } finally {
            setIsSaving(false);
        }
    };

    // Restablecer a plantilla oficial original
    const handleRestoreOfficial = async () => {
        if (!confirm(__('¿Estás seguro de restablecer esta plantilla a la versión oficial original?'))) {
            return;
        }

        try {
            setIsSaving(true);
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const response = await fetch('/admin/pastores/carnets/restablecer-plantilla', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ tipo: activeTab }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success(result.message || __('Plantilla restablecida'));
                onRestored();
                onClose();
            } else {
                toast.error(__('No se pudo restablecer la plantilla'));
            }
        } catch (error) {
            console.error('Error al restablecer:', error);
            toast.error(__('Ocurrió un error al restablecer'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[880px] max-w-[96vw] p-0 overflow-hidden bg-card border border-border shadow-2xl rounded-2xl">
                {/* Cabecera */}
                <DialogHeader className="p-4 sm:p-5 pb-3 border-b bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <Layers className="size-5 text-indigo-300" />
                            <DialogTitle className="text-lg font-bold text-white">
                                {__('Configuración de Plantilla Modelo del Carnet')}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-indigo-200 mt-0.5">
                            {__('Adjunta una imagen modelo, calibra su tamaño, posición y elimina el fondo')}
                        </DialogDescription>
                    </div>

                    {/* Selector de Pestaña (Frontal / Reverso) */}
                    <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
                        <Button
                            type="button"
                            variant={activeTab === 'frente' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('frente')}
                            className={cn(
                                'h-7 px-3 text-xs font-semibold rounded-lg',
                                activeTab === 'frente' ? 'bg-white text-indigo-950 font-bold' : 'text-white hover:bg-white/20'
                            )}
                        >
                            {__('Plantilla Frontal')}
                        </Button>
                        <Button
                            type="button"
                            variant={activeTab === 'atras' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('atras')}
                            className={cn(
                                'h-7 px-3 text-xs font-semibold rounded-lg',
                                activeTab === 'atras' ? 'bg-white text-indigo-950 font-bold' : 'text-white hover:bg-white/20'
                            )}
                        >
                            {__('Plantilla Trasera')}
                        </Button>
                    </div>
                </DialogHeader>

                {/* Contenido Principal */}
                <div className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto no-scrollbar">
                    {/* Botón de Adjuntar Imagen */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border">
                        <div className="flex items-center gap-3">
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs">
                                    <Upload className="size-3.5" />
                                    <span>{__('Adjuntar Imagen Modelo')}</span>
                                </div>
                            </label>

                            <span className="text-xs text-muted-foreground">
                                {__('Soporta PNG, JPG o WebP en alta resolución')}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleFitCR80}
                                className="h-8 text-xs gap-1.5"
                                title={__('Centrar y ajustar al tamaño estándar CR80')}
                            >
                                <Maximize2 className="size-3" />
                                {__('Auto-Ajustar CR80')}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleResetControls}
                                className="h-8 text-xs text-muted-foreground gap-1.5"
                                title={__('Restablecer controles de escala y posición')}
                            >
                                <RotateCcw className="size-3" />
                                {__('Restablecer')}
                            </Button>
                        </div>
                    </div>

                    {/* Lienzo Interactivo con Cuadrícula de Transparencia */}
                    <div className="flex flex-col items-center justify-center p-3 bg-slate-900/10 dark:bg-slate-950/40 rounded-2xl border border-dashed border-border overflow-x-auto">
                        <div
                            className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 cursor-grab active:cursor-grabbing shrink-0"
                            style={{
                                width: '700px',
                                height: '442px',
                                // Patrón ajedrezado para transparencia
                                backgroundImage: `
                                    linear-gradient(45deg, #cbd5e1 25%, transparent 25%),
                                    linear-gradient(-45deg, #cbd5e1 25%, transparent 25%),
                                    linear-gradient(45deg, transparent 75%, #cbd5e1 75%),
                                    linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)
                                `,
                                backgroundSize: '16px 16px',
                                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                                backgroundColor: '#f1f5f9',
                            }}
                            title={__('Arrastra con el mouse para mover la plantilla')}
                        >
                            <canvas
                                ref={canvasRef}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                className="w-full h-full block"
                            />

                            {/* Guía de esquinas CR80 */}
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white font-mono pointer-events-none">
                                {activeTab === 'frente' ? __('Frontal CR80') : __('Reverso CR80')} • 700×442 px
                            </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1.5">
                            <Move className="size-3 text-indigo-600" />
                            <span>{__('Haz clic y arrastra sobre la plantilla para centrarla o acomodarla')}</span>
                        </p>
                    </div>

                    {/* Controles de Modificación: Tamaño y Eliminación de Fondo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border">
                        {/* Control de Tamaño / Escala */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <ZoomIn className="size-3.5 text-indigo-600" />
                                    <span>{__('Tamaño / Zoom')}</span>
                                </label>
                                <span className="text-xs font-mono font-semibold text-muted-foreground">
                                    {Math.round(scale * 100)}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="2.5"
                                step="0.01"
                                value={scale}
                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                className="w-full accent-indigo-600 cursor-pointer"
                            />

                            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                                <div>
                                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">{__('Posición X')}</span>
                                    <input
                                        type="range"
                                        min="-250"
                                        max="250"
                                        value={panX}
                                        onChange={(e) => setPanX(parseInt(e.target.value, 10))}
                                        className="w-full accent-indigo-600 cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">{__('Posición Y')}</span>
                                    <input
                                        type="range"
                                        min="-200"
                                        max="200"
                                        value={panY}
                                        onChange={(e) => setPanY(parseInt(e.target.value, 10))}
                                        className="w-full accent-indigo-600 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Control de Eliminación de Fondo */}
                        <div className="space-y-3 md:border-l md:pl-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={removeBg}
                                        onChange={(e) => setRemoveBg(e.target.checked)}
                                        className="size-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                                    />
                                    <Scissors className="size-3.5 text-emerald-600" />
                                    <span>{__('Eliminar Fondo Sólido / Blanco')}</span>
                                </label>
                                {removeBg && (
                                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
                                        {__('Activo')}
                                    </Badge>
                                )}
                            </div>

                            {removeBg ? (
                                <div className="space-y-2 pt-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground text-[11px] font-medium">
                                            {__('Tolerancia / Sensibilidad')}
                                        </span>
                                        <span className="font-mono text-xs font-semibold">{tolerance}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="5"
                                        max="75"
                                        value={tolerance}
                                        onChange={(e) => setTolerance(parseInt(e.target.value, 10))}
                                        className="w-full accent-emerald-600 cursor-pointer"
                                    />

                                    <div className="flex items-center justify-between pt-1 text-xs">
                                        <span className="text-muted-foreground text-[11px]">{__('Color de fondo a eliminar:')}</span>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="color"
                                                value={targetColor}
                                                onChange={(e) => setTargetColor(e.target.value)}
                                                className="size-6 p-0 border rounded cursor-pointer"
                                                title={__('Seleccionar color de fondo')}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setTargetColor('#ffffff')}
                                                className="h-6 px-1.5 text-[10px]"
                                            >
                                                {__('Blanco')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-[11px] text-muted-foreground mt-2">
                                    {__('Activa esta casilla para quitar fondos blancos o unicolor de imágenes escaneadas y volverlos transparentes.')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pie de Acciones */}
                <DialogFooter className="p-4 border-t bg-muted/40 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRestoreOfficial}
                        disabled={isSaving}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1.5"
                    >
                        <Trash2 className="size-3.5" />
                        {__('Restablecer Plantilla Oficial')}
                    </Button>

                    <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={onClose}
                            disabled={isSaving}
                            className="text-xs h-9 px-4"
                        >
                            {__('Cerrar')}
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSaveTemplate}
                            disabled={isSaving}
                            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-5 shadow-sm"
                        >
                            <Save className="size-3.5" />
                            {isSaving ? __('Guardando...') : __('Guardar Esta Plantilla')}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

