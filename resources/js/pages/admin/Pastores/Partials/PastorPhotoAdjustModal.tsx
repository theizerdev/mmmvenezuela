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
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Pastor } from '../Index';
import { useTranslate } from '@/hooks/use-translate';
import { getPastorPhotoUrl } from './PastorCarnetCard';

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
    const [removeBg, setRemoveBg] = useState<boolean>(false);
    const [tolerance, setTolerance] = useState<number>(25);
    const [targetColor, setTargetColor] = useState<string>('#ffffff');
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDraggingRef = useRef<boolean>(false);
    const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const photoUrl = pastor ? getPastorPhotoUrl(pastor.foto || (pastor as any).foto_url) : null;

    useEffect(() => {
        if (!isOpen || !pastor) return;

        setScale(1);
        setPanX(0);
        setPanY(0);
        setRemoveBg(false);
        setTolerance(25);

        if (photoUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                setImageObj(img);
                // Detectar color de la esquina superior izquierda como color de fondo
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
                setScale(1);
                setPanX(0);
                setPanY(0);
                toast.info(__('Foto cargada. Ajusta el encuadre y elimina el fondo.'));
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    // Renderizado en canvas
    useEffect(() => {
        if (!isOpen || !canvasRef.current || !imageObj) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Proporción exacta carnet: 178 x 226 px (escalada x2 para nitidez: 356 x 452)
        const W = 356;
        const H = 452;
        canvas.width = W;
        canvas.height = H;

        ctx.clearRect(0, 0, W, H);

        ctx.save();
        ctx.translate(W / 2 + panX, H / 2 + panY);
        ctx.scale(scale, scale);

        // Ajustar imagen para que cubra
        const imgRatio = imageObj.width / imageObj.height;
        const targetRatio = W / H;
        let drawW = W;
        let drawH = H;

        if (imgRatio > targetRatio) {
            drawH = H;
            drawW = H * imgRatio;
        } else {
            drawW = W;
            drawH = W / imgRatio;
        }

        ctx.drawImage(imageObj, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        if (removeBg) {
            const imgData = ctx.getImageData(0, 0, W, H);
            const data = imgData.data;

            const hex = targetColor.replace('#', '');
            const targetR = parseInt(hex.substring(0, 2), 16) || 255;
            const targetG = parseInt(hex.substring(2, 4), 16) || 255;
            const targetB = parseInt(hex.substring(4, 6), 16) || 255;

            const maxDist = 441.67;
            const tolDist = (tolerance / 100) * (maxDist * 0.7);
            const smoothRange = 12;

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
    }, [isOpen, imageObj, scale, panX, panY, removeBg, tolerance, targetColor]);

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
            <DialogContent className="sm:max-w-[560px] max-w-[95vw] p-0 overflow-hidden bg-card border border-border shadow-2xl rounded-2xl">
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
                                setRemoveBg(false);
                            }}
                            className="h-8 text-xs text-muted-foreground gap-1.5"
                        >
                            <RotateCcw className="size-3" />
                            {__('Restablecer')}
                        </Button>
                    </div>

                    {/* Canvas de recorte proporcional carnet 178x226 */}
                    <div className="flex flex-col items-center justify-center p-3 bg-muted/40 rounded-xl border border-dashed">
                        <div
                            className="relative rounded-xl overflow-hidden shadow-lg border-[3px] border-white dark:border-slate-800 cursor-grab active:cursor-grabbing"
                            style={{
                                width: '178px',
                                height: '226px',
                                backgroundImage: `
                                    linear-gradient(45deg, #cbd5e1 25%, transparent 25%),
                                    linear-gradient(-45deg, #cbd5e1 25%, transparent 25%),
                                    linear-gradient(45deg, transparent 75%, #cbd5e1 75%),
                                    linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)
                                `,
                                backgroundSize: '12px 12px',
                                backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                                backgroundColor: '#f8fafc',
                            }}
                            title={__('Arrastra para centrar el rostro')}
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

                        <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                            <Move className="size-3 text-indigo-600" />
                            <span>{__('Arrastra la foto para encuadrar el rostro')}</span>
                        </p>
                    </div>

                    {/* Controles de Tamaño y Eliminación de Fondo */}
                    <div className="space-y-3 bg-muted/30 p-3.5 rounded-xl border">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold flex items-center gap-1">
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
                        </div>

                        <div className="pt-2 border-t space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={removeBg}
                                        onChange={(e) => setRemoveBg(e.target.checked)}
                                        className="size-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                                    />
                                    <Scissors className="size-3.5 text-emerald-600" />
                                    <span>{__('Eliminar Fondo de la Foto')}</span>
                                </label>
                                {removeBg && (
                                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
                                        {__('Activo')}
                                    </Badge>
                                )}
                            </div>

                            {removeBg && (
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
                        disabled={isSaving}
                        className="text-xs h-9 px-4"
                    >
                        {__('Cancelar')}
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSavePhoto}
                        disabled={isSaving}
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

