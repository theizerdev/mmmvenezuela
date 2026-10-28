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
    ZoomIn,
    Scissors,
    Move,
    Save,
    RotateCcw,
    Sparkles,
    Loader2,
    Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Pastor } from '../Index';
import { useTranslate } from '@/hooks/use-translate';
import { getPastorPhotoUrl } from './PastorCarnetCard';
import { removeBackgroundWithAi } from './ai-photo-segmenter';

interface PastorPhotoAdjustModalProps {
    pastor: Pastor | null;
    isOpen: boolean;
    onClose: () => void;
    onPhotoUpdated: (newPhotoUrl: string) => void;
}

export function PastorPhotoAdjustModal({
    pastor,
    isOpen,
    onClose,
    onPhotoUpdated,
}: PastorPhotoAdjustModalProps) {
    const { __ } = useTranslate();
    const [scale, setScale] = useState<number>(1);
    const [panX, setPanX] = useState<number>(0);
    const [panY, setPanY] = useState<number>(0);

    // Modos de fondo: 'none' | 'ai' | 'color'
    const [bgMode, setBgMode] = useState<'none' | 'ai' | 'color'>('none');
    const [tolerance, setTolerance] = useState<number>(25);
    const [targetColor, setTargetColor] = useState<string>('#ffffff');
    const [isProcessingAi, setIsProcessingAi] = useState<boolean>(false);
    const [aiProcessedImage, setAiProcessedImage] = useState<HTMLCanvasElement | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDraggingRef = useRef<boolean>(false);
    const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const photoUrl = pastor ? getPastorPhotoUrl((pastor as any).foto_url || pastor.foto) : null;

    // Dimensiones exactas del marco oficial de la tarjeta (90x55 mm): 198 x 286 px (escalada x2 para 300 DPI: 396 x 572)
    const FRAME_W = 198;
    const FRAME_H = 286;
    const CANVAS_W = 396;
    const CANVAS_H = 572;

    useEffect(() => {
        if (!isOpen || !pastor) return;

        setScale(1);
        setPanX(0);
        setPanY(0);
        setBgMode('none');
        setTolerance(25);
        setAiProcessedImage(null);

        if (photoUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                setImageObj(img);
                // Detectar color de fondo preliminar en la esquina superior izquierda
                try {
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = img.width;
                    tempCanvas.height = img.height;
                    const tempCtx = tempCanvas.getContext('2d');
                    if (tempCtx) {
                        tempCtx.drawImage(img, 0, 0);
                        const corner = tempCtx.getImageData(5, 5, 1, 1).data;
                        const hex = '#' + ((1 << 24) + (corner[0] << 16) + (corner[1] << 8) + corner[2]).toString(16).slice(1);
                        setTargetColor(hex);
                    }
                } catch {
                    // Ignorar si hay restricciones CORS en imagen remota
                }
            };
            img.onerror = () => {
                // Reintentar sin crossOrigin si el servidor no incluye headers CORS
                if (img.crossOrigin) {
                    const fallbackImg = new Image();
                    fallbackImg.onload = () => setImageObj(fallbackImg);
                    fallbackImg.src = photoUrl;
                } else {
                    setImageObj(null);
                }
            };
            img.src = photoUrl;
        } else {
            setImageObj(null);
        }
    }, [isOpen, pastor, photoUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (!dataUrl) return;

            const img = new Image();
            img.onload = () => {
                setImageObj(img);
                setAiProcessedImage(null);
                setBgMode('none');
                setScale(1);
                setPanX(0);
                setPanY(0);
                toast.info(__('Foto cargada. Puedes recortarla o eliminar su fondo con IA.'));
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    // Procesamiento con Inteligencia Artificial (MediaPipe Selfie Segmentation)
    const handleApplyAiSegmentation = async () => {
        if (!imageObj) return;

        try {
            setIsProcessingAi(true);
            toast.info(__('Procesando silueta con Inteligencia Artificial...'));

            // Segmentar la imagen original
            const segmentedImageData = await removeBackgroundWithAi(imageObj, imageObj.width, imageObj.height);

            // Crear canvas con la imagen recortada
            const cutCanvas = document.createElement('canvas');
            cutCanvas.width = imageObj.width;
            cutCanvas.height = imageObj.height;
            const cutCtx = cutCanvas.getContext('2d');
            if (cutCtx) {
                cutCtx.putImageData(segmentedImageData, 0, 0);
                setAiProcessedImage(cutCanvas);
                setBgMode('ai');
                toast.success(__('Fondo eliminado con IA exitosamente. El sujeto ha quedado intacto.'));
            }
        } catch (error) {
            console.error('Error al segmentar con IA:', error);
            toast.error(__('No se pudo procesar con IA. Puedes usar el modo de color manual.'));
            setBgMode('color');
        } finally {
            setIsProcessingAi(false);
        }
    };

    // Renderizado en canvas en tiempo real
    useEffect(() => {
        if (!isOpen || !canvasRef.current || !imageObj) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = CANVAS_W;
        canvas.height = CANVAS_H;

        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        // Elegir fuente según el modo: si IA está activa y procesada, usar la silueta recortada
        const sourceToDraw = bgMode === 'ai' && aiProcessedImage ? aiProcessedImage : imageObj;

        ctx.save();
        ctx.translate(CANVAS_W / 2 + panX * 2, CANVAS_H / 2 + panY * 2);
        ctx.scale(scale, scale);

        // Ajustar imagen para que cubra la relación del marco oficial (object-cover)
        const imgRatio = sourceToDraw.width / sourceToDraw.height;
        const targetRatio = CANVAS_W / CANVAS_H;
        let drawW = CANVAS_W;
        let drawH = CANVAS_H;

        if (imgRatio > targetRatio) {
            drawH = CANVAS_H;
            drawW = CANVAS_H * imgRatio;
        } else {
            drawW = CANVAS_W;
            drawH = CANVAS_W / imgRatio;
        }

        ctx.drawImage(sourceToDraw, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // Si se seleccionó eliminación por color (croma clásico)
        if (bgMode === 'color') {
            const imgData = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
            const data = imgData.data;

            const hex = targetColor.replace('#', '');
            const targetR = parseInt(hex.substring(0, 2), 16) || 255;
            const targetG = parseInt(hex.substring(2, 4), 16) || 255;
            const targetB = parseInt(hex.substring(4, 6), 16) || 255;

            const maxDist = 441.67;
            const tolDist = (tolerance / 100) * (maxDist * 0.7);
            const smoothRange = 14;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                if (a === 0) continue;

                const dist = Math.sqrt(
                    (r - targetR) ** 2 +
                    (g - targetG) ** 2 +
                    (b - targetB) ** 2
                );

                if (dist <= tolDist) {
                    data[i + 3] = 0;
                } else if (dist < tolDist + smoothRange) {
                    const factor = (dist - tolDist) / smoothRange;
                    data[i + 3] = Math.round(a * factor);
                }
            }

            ctx.putImageData(imgData, 0, 0);
        }
    }, [isOpen, imageObj, scale, panX, panY, bgMode, aiProcessedImage, tolerance, targetColor]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        isDraggingRef.current = true;
        lastPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDraggingRef.current) return;
        const dx = e.clientX - lastPosRef.current.x;
        const dy = e.clientY - lastPosRef.current.y;
        lastPosRef.current = { x: e.clientX, y: e.clientY };

        setPanX((prev) => prev + dx);
        setPanY((prev) => prev + dy);
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    const handleSavePhoto = async () => {
        if (!pastor || !canvasRef.current) return;

        try {
            setIsSaving(true);
            const dataUrl = canvasRef.current.toDataURL('image/png');
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const response = await fetch(`/admin/pastores/${pastor.id}/actualizar-foto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ foto: dataUrl }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success(result.message || __('Foto actualizada con éxito'));
                onPhotoUpdated(result.foto_url);
                onClose();
            } else {
                toast.error(result.error || __('Error al actualizar la foto'));
            }
        } catch (error) {
            console.error('Error al guardar foto:', error);
            toast.error(__('Ocurrió un error al guardar la foto'));
        } finally {
            setIsSaving(false);
        }
    };

    if (!pastor) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[580px] max-w-[96vw] p-0 overflow-hidden bg-card border border-border shadow-2xl rounded-2xl">
                <DialogHeader className="p-4 sm:p-5 pb-3 border-b bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white">
                    <div className="flex items-center gap-2">
                        <Scissors className="size-5 text-indigo-300" />
                        <DialogTitle className="text-base font-bold text-white">
                            {__('Ajustar Fotografía del Pastor')}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-indigo-200 mt-0.5">
                        {pastor.nombres} {pastor.apellidos} ({pastor.codigo || pastor.documento})
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs">
                                <Upload className="size-3.5" />
                                <span>{__('Subir Nueva Foto')}</span>
                            </div>
                        </label>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setScale(1);
                                setPanX(0);
                                setPanY(0);
                                setBgMode('none');
                                setAiProcessedImage(null);
                            }}
                            className="h-8 text-xs text-muted-foreground gap-1.5"
                        >
                            <RotateCcw className="size-3" />
                            {__('Restablecer')}
                        </Button>
                    </div>

                    {/* Canvas de recorte con la proporción y forma exactas del marco oficial: 198 x 286 px */}
                    <div className="flex flex-col items-center justify-center p-3 bg-muted/40 rounded-xl border border-dashed">
                        <div
                            className="relative rounded-[16px] overflow-hidden shadow-xl border-[2.5px] border-indigo-500/70 cursor-grab active:cursor-grabbing"
                            style={{
                                width: `${FRAME_W}px`,
                                height: `${FRAME_H}px`,
                                backgroundImage: bgMode === 'ai'
                                    ? 'linear-gradient(180deg, #cfd7e1 0%, #dbe1e8 45%, #c2cbd5 100%)'
                                    : `
                                        linear-gradient(45deg, #cbd5e1 25%, transparent 25%),
                                        linear-gradient(-45deg, #cbd5e1 25%, transparent 25%),
                                        linear-gradient(45deg, transparent 75%, #cbd5e1 75%),
                                        linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)
                                    `,
                                backgroundSize: bgMode === 'ai' ? 'cover' : '12px 12px',
                                backgroundPosition: bgMode === 'ai' ? 'center' : '0 0, 0 6px, 6px -6px, -6px 0px',
                                backgroundColor: '#c8cfd8',
                            }}
                            title={__('Arrastra la foto para encuadrar el rostro con precisión')}
                        >
                            <canvas
                                ref={canvasRef}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                className="w-full h-full block"
                            />
                        </div>

                        <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1 font-medium">
                            <Move className="size-3 text-indigo-600 shrink-0" />
                            <span>{__('Arrastra la foto para encuadrar el rostro')} ({FRAME_W} × {FRAME_H} px)</span>
                        </p>
                    </div>

                    {/* Controles de Tamaño y Modos de Eliminación de Fondo */}
                    <div className="space-y-3 bg-muted/30 p-3.5 rounded-xl border">
                        {/* Control de Zoom */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-300">
                                    <ZoomIn className="size-3.5 text-indigo-600" />
                                    {__('Zoom de la Foto')}
                                </span>
                                <span className="font-mono text-muted-foreground">{Math.round(scale * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="2.5"
                                step="0.02"
                                value={scale}
                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                className="w-full accent-indigo-600 cursor-pointer"
                            />
                            <div className="flex items-center gap-1.5 pt-1">
                                <span className="text-[10px] text-muted-foreground">{__('Preajustes:')}</span>
                                <button
                                    type="button"
                                    onClick={() => setScale(1.0)}
                                    className={cn(
                                        'px-2 py-0.5 rounded text-[10.5px] border font-medium transition-colors',
                                        Math.round(scale * 100) === 100
                                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold'
                                            : 'hover:bg-accent text-muted-foreground'
                                    )}
                                >
                                    100%
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setScale(1.25)}
                                    className={cn(
                                        'px-2 py-0.5 rounded text-[10.5px] border font-medium transition-colors',
                                        Math.round(scale * 100) === 125
                                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold'
                                            : 'hover:bg-accent text-muted-foreground'
                                    )}
                                >
                                    125% ({__('Recomendado')})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setScale(1.40)}
                                    className={cn(
                                        'px-2 py-0.5 rounded text-[10.5px] border font-medium transition-colors',
                                        Math.round(scale * 100) === 140
                                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold'
                                            : 'hover:bg-accent text-muted-foreground'
                                    )}
                                >
                                    140% ({__('Primer Plano')})
                                </button>
                            </div>
                        </div>

                        {/* Selector de Modos de Eliminación de Fondo */}
                        <div className="pt-2.5 border-t space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Scissors className="size-3.5 text-indigo-600" />
                                    {__('Eliminación de Fondo')}
                                </span>

                                <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
                                    <button
                                        type="button"
                                        onClick={() => setBgMode('none')}
                                        className={cn(
                                            'px-2 py-0.5 rounded-md font-medium transition-colors',
                                            bgMode === 'none' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'
                                        )}
                                    >
                                        {__('Original')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (aiProcessedImage) {
                                                setBgMode('ai');
                                            } else {
                                                handleApplyAiSegmentation();
                                            }
                                        }}
                                        className={cn(
                                            'px-2 py-0.5 rounded-md font-medium transition-colors flex items-center gap-1',
                                            bgMode === 'ai' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                                        )}
                                    >
                                        <Sparkles className="size-3 text-amber-300" />
                                        {__('Con IA')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBgMode('color')}
                                        className={cn(
                                            'px-2 py-0.5 rounded-md font-medium transition-colors',
                                            bgMode === 'color' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'
                                        )}
                                    >
                                        {__('Color')}
                                    </button>
                                </div>
                            </div>

                            {/* Panel Informativo / Acción para Modo IA */}
                            {bgMode === 'ai' && (
                                <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-200">
                                        <div className="size-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                            {isProcessingAi ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[11.5px] leading-tight">
                                                {isProcessingAi ? __('IA analizando silueta...') : __('Recorte por IA Inteligente Activo')}
                                            </p>
                                            <p className="text-[10px] text-indigo-700/80 dark:text-indigo-300/80">
                                                {__('Sujeto aislado con precisión sin alterar cabello ni vestimenta.')}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={isProcessingAi}
                                        onClick={handleApplyAiSegmentation}
                                        className="h-7 text-[10.5px] border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                                    >
                                        {isProcessingAi ? __('Procesando...') : __('Volver a escanear')}
                                    </Button>
                                </div>
                            )}

                            {/* Si aún no ha procesado IA y está en modo original, mostrar botón directo sugerido */}
                            {bgMode === 'none' && !aiProcessedImage && (
                                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                                    <span className="text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                                        <Sparkles className="size-3.5 text-amber-600" />
                                        {__('¿Quieres remover el fondo automáticamente?')}
                                    </span>
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={isProcessingAi}
                                        onClick={handleApplyAiSegmentation}
                                        className="h-7 text-[11px] gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                    >
                                        {isProcessingAi ? (
                                            <>
                                                <Loader2 className="size-3 animate-spin" />
                                                <span>{__('Procesando...')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="size-3 text-amber-300" />
                                                <span>{__('Remover con IA')}</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* Panel de Ajustes para Modo Color */}
                            {bgMode === 'color' && (
                                <div className="space-y-2 pt-1 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground text-[11px]">{__('Tolerancia de corte:')}</span>
                                        <span className="font-mono">{tolerance}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="5"
                                        max="60"
                                        value={tolerance}
                                        onChange={(e) => setTolerance(parseInt(e.target.value, 10))}
                                        className="w-full accent-emerald-600 cursor-pointer"
                                    />

                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-muted-foreground text-[11px]">{__('Color de fondo a quitar:')}</span>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="color"
                                                value={targetColor}
                                                onChange={(e) => setTargetColor(e.target.value)}
                                                className="size-5 p-0 border rounded cursor-pointer"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setTargetColor('#ffffff')}
                                                className="h-5 px-1.5 text-[10px]"
                                            >
                                                {__('Blanco')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t bg-muted/30 flex items-center justify-between gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={onClose}
                        disabled={isSaving || isProcessingAi}
                        className="text-xs h-9 px-4"
                    >
                        {__('Cancelar')}
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSavePhoto}
                        disabled={isSaving || isProcessingAi}
                        className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-5 shadow-sm"
                    >
                        <Save className="size-3.5" />
                        {isSaving ? __('Guardando...') : __('Guardar Foto en Carnet')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
