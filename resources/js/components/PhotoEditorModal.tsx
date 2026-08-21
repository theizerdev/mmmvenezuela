import React, { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import {
    RotateCcw,
    RotateCw,
    ZoomIn,
    Sun,
    Contrast,
    Check,
    X,
    Crop,
    Sparkles,
    Move
} from 'lucide-react';

interface PhotoEditorModalProps {
    isOpen: boolean;
    imageSrc: string | null;
    aspectRatio?: 'cedula' | 'carnet'; // 'cedula' (3:2 horizontal) | 'carnet' (3:4 vertical)
    title?: string;
    onClose: () => void;
    onSave: (file: File, dataUrl: string) => void;
}

export default function PhotoEditorModal({
    isOpen,
    imageSrc,
    aspectRatio = 'cedula',
    title,
    onClose,
    onSave,
}: PhotoEditorModalProps) {
    const [rotation, setRotation] = useState<number>(0);
    const [zoom, setZoom] = useState<number>(1);
    const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [brightness, setBrightness] = useState<number>(100); // %
    const [contrast, setContrast] = useState<number>(100);     // %

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const [isBlurry, setIsBlurry] = useState<boolean>(false);
    const [sharpnessScore, setSharpnessScore] = useState<number>(100);

    // Cargar imagen cuando cambia imageSrc o abre modal
    useEffect(() => {
        if (isOpen && imageSrc) {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                imageRef.current = img;
                handleReset();
            };
            img.src = imageSrc;
        }
    }, [isOpen, imageSrc]);

    const handleReset = () => {
        setRotation(0);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setBrightness(100);
        setContrast(100);
    };

    const rotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
    const rotateRight = () => setRotation((prev) => (prev + 90) % 360);

    // Renderizar previsualización en el canvas en tiempo real
    useEffect(() => {
        if (!isOpen || !imageRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = imageRef.current;
        const containerWidth = 500;
        const containerHeight = 350;

        canvas.width = containerWidth;
        canvas.height = containerHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Guardar estado del contexto
        ctx.save();

        // Aplicar filtros de Brillo y Contraste
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

        // Trasladar al centro para aplicar rotación y escala
        const centerX = containerWidth / 2 + pan.x;
        const centerY = containerHeight / 2 + pan.y;

        ctx.translate(centerX, centerY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);

        // Calcular dimensiones escaladas
        const fitScale = Math.min(
            containerWidth / (rotation % 180 === 0 ? img.width : img.height),
            containerHeight / (rotation % 180 === 0 ? img.height : img.width)
        ) * 0.85;

        const drawW = img.width * fitScale;
        const drawH = img.height * fitScale;

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

        ctx.restore();

        // Calcular Nitidez / Borrosidad (Varianza del Laplaciano)
        try {
            const imageData = ctx.getImageData(0, 0, containerWidth, containerHeight);
            const d = imageData.data;
            let sum = 0, sumSq = 0, count = 0;
            const step = 4;
            for (let y = 1; y < containerHeight - 1; y += step) {
                for (let x = 1; x < containerWidth - 1; x += step) {
                    const idx = (y * containerWidth + x) * 4;
                    const c = 0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2];
                    const u = 0.299 * d[idx - containerWidth * 4] + 0.587 * d[idx - containerWidth * 4 + 1] + 0.114 * d[idx - containerWidth * 4 + 2];
                    const dn = 0.299 * d[idx + containerWidth * 4] + 0.587 * d[idx + containerWidth * 4 + 1] + 0.114 * d[idx + containerWidth * 4 + 2];
                    const l = 0.299 * d[idx - 4] + 0.587 * d[idx - 4 + 1] + 0.114 * d[idx - 4 + 2];
                    const r = 0.299 * d[idx + 4] + 0.587 * d[idx + 4 + 1] + 0.114 * d[idx + 4 + 2];
                    const lap = Math.abs(4 * c - u - dn - l - r);
                    sum += lap;
                    sumSq += lap * lap;
                    count++;
                }
            }
            if (count > 0) {
                const mean = sum / count;
                const variance = sumSq / count - mean * mean;
                setSharpnessScore(Math.round(variance));
                setIsBlurry(variance < 22);
            }
        } catch (_) {}

        // Dibujar máscara de recorte / guía de encuadre
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';

        // Dimensiones del área útil de corte según aspect ratio
        let cropW = 380;
        let cropH = aspectRatio === 'cedula' ? 240 : 320;
        if (aspectRatio === 'carnet') {
            cropW = 240;
            cropH = 320;
        }

        const cropX = (containerWidth - cropW) / 2;
        const cropY = (containerHeight - cropH) / 2;

        // Máscara oscura exterior
        ctx.beginPath();
        ctx.rect(0, 0, containerWidth, containerHeight);
        ctx.rect(cropX, cropY, cropW, cropH);
        ctx.fill('evenodd');

        // Borde punteado del recuadro
        ctx.strokeStyle = isBlurry ? '#f59e0b' : '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(cropX, cropY, cropW, cropH);

        ctx.restore();
    }, [isOpen, rotation, zoom, pan, brightness, contrast, aspectRatio]);

    // Arrastre con Mouse o Touch
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setDragStart({ x: clientX - pan.x, y: clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setPan({
            x: clientX - dragStart.x,
            y: clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    // Exportar imagen recortada y editada con alta resolución
    const handleSaveCrop = () => {
        if (!imageRef.current) return;

        const img = imageRef.current;
        const outCanvas = document.createElement('canvas');
        const outCtx = outCanvas.getContext('2d');

        if (!outCtx) return;

        // Dimensiones de salida en píxeles (alta resolución)
        const targetW = aspectRatio === 'cedula' ? 1200 : 900;
        const targetH = aspectRatio === 'cedula' ? 800 : 1200;

        outCanvas.width = targetW;
        outCanvas.height = targetH;

        // Fondo blanco
        outCtx.fillStyle = '#ffffff';
        outCtx.fillRect(0, 0, targetW, targetH);

        outCtx.save();
        outCtx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

        const outCenterX = targetW / 2 + (pan.x * (targetW / 380));
        const outCenterY = targetH / 2 + (pan.y * (targetH / 240));

        outCtx.translate(outCenterX, outCenterY);
        outCtx.rotate((rotation * Math.PI) / 180);
        outCtx.scale(zoom, zoom);

        const containerW = 500;
        const containerH = 350;
        const fitScale = Math.min(
            containerW / (rotation % 180 === 0 ? img.width : img.height),
            containerH / (rotation % 180 === 0 ? img.height : img.width)
        ) * 0.85;

        const scaleRatio = targetW / (aspectRatio === 'cedula' ? 380 : 240);
        const finalDrawW = img.width * fitScale * scaleRatio;
        const finalDrawH = img.height * fitScale * scaleRatio;

        outCtx.drawImage(img, -finalDrawW / 2, -finalDrawH / 2, finalDrawW, finalDrawH);
        outCtx.restore();

        const dataUrl = outCanvas.toDataURL('image/jpeg', 0.95);

        // Convertir DataURL a File
        fetch(dataUrl)
            .then((res) => res.blob())
            .then((blob) => {
                const fileName = aspectRatio === 'cedula' ? 'cedula_editada.jpg' : 'foto_carnet_editada.jpg';
                const file = new File([blob], fileName, { type: 'image/jpeg' });
                onSave(file, dataUrl);
                onClose();
            });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl bg-slate-900 text-slate-100 border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
                <DialogHeader className="border-b border-slate-800 pb-3 flex flex-row items-center justify-between">
                    <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                        <Crop className="size-5 text-blue-400" />
                        <span>{title || (aspectRatio === 'cedula' ? 'Ajustar y Editar Cédula' : 'Ajustar Foto Carnet')}</span>
                    </DialogTitle>
                </DialogHeader>

                {/* Canvas de Edición Interactivo */}
                <div className="relative flex flex-col items-center justify-center bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 select-none">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleMouseDown}
                        onTouchMove={handleMouseMove}
                        onTouchEnd={handleMouseUp}
                        className="cursor-move max-w-full h-auto rounded-xl touch-none"
                    />

                    {/* Guía Flotante */}
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-medium text-slate-300 flex items-center gap-1.5 border border-slate-700">
                        <Move className="size-3 text-blue-400" />
                        <span>Arrastra la foto para encuadrar</span>
                    </div>
                </div>

                {/* Barra de Herramientas de Ajuste */}
                <div className="space-y-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-800/80">
                    {/* Botones de Rotación y Zoom */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={rotateLeft}
                                className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 text-xs gap-1.5"
                            >
                                <RotateCcw className="size-3.5 text-blue-400" />
                                <span>-90°</span>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={rotateRight}
                                className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 text-xs gap-1.5"
                            >
                                <RotateCw className="size-3.5 text-blue-400" />
                                <span>+90°</span>
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="text-slate-400 hover:text-white text-xs gap-1.5"
                            >
                                <Sparkles className="size-3.5 text-amber-400" />
                                <span>Restablecer</span>
                            </Button>
                        </div>
                    </div>

                    {/* Controles de Deslizadores (Zoom, Brillo, Contraste) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                        {/* Zoom */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-slate-300">
                                <span className="flex items-center gap-1">
                                    <ZoomIn className="size-3.5 text-blue-400" />
                                    <span>Zoom</span>
                                </span>
                                <span className="font-mono text-[11px] text-slate-400">{Math.round(zoom * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0.8"
                                max="2.5"
                                step="0.05"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-full accent-blue-500 bg-slate-700 h-1.5 rounded-lg cursor-pointer"
                            />
                        </div>

                        {/* Brillo */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-slate-300">
                                <span className="flex items-center gap-1">
                                    <Sun className="size-3.5 text-amber-400" />
                                    <span>Brillo</span>
                                </span>
                                <span className="font-mono text-[11px] text-slate-400">{brightness}%</span>
                            </div>
                            <input
                                type="range"
                                min="60"
                                max="160"
                                step="5"
                                value={brightness}
                                onChange={(e) => setBrightness(parseInt(e.target.value))}
                                className="w-full accent-amber-400 bg-slate-700 h-1.5 rounded-lg cursor-pointer"
                            />
                        </div>

                        {/* Contraste */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-slate-300">
                                <span className="flex items-center gap-1">
                                    <Contrast className="size-3.5 text-emerald-400" />
                                    <span>Contraste</span>
                                </span>
                                <span className="font-mono text-[11px] text-slate-400">{contrast}%</span>
                            </div>
                            <input
                                type="range"
                                min="60"
                                max="160"
                                step="5"
                                value={contrast}
                                onChange={(e) => setContrast(parseInt(e.target.value))}
                                className="w-full accent-emerald-400 bg-slate-700 h-1.5 rounded-lg cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex items-center justify-between gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                        <X className="size-4 mr-1.5" />
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSaveCrop}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 shadow-md"
                    >
                        <Check className="size-4 mr-1.5" />
                        Aplicar y Guardar Foto
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
