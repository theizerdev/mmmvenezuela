import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Upload,
    ZoomIn,
    ZoomOut,
    Scissors,
    Move,
    Save,
    RotateCcw,
    RotateCw,
    Loader2,
    Undo2,
    Redo2,
    Sun,
    Wand2,
    Eye,
    Eraser,
    Paintbrush,
    Crosshair,
    FlipHorizontal2,
    Columns2,
    IdCard,
    AlertTriangle,
    CheckCircle2,
    Info,
    Layers,
    X,
    ChevronDown,
    Camera,
    Frame,
    SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Pastor } from '../Index';
import { useTranslate } from '@/hooks/use-translate';
import {
    getPastorPhotoUrl,
    getPastorCarnetFullName,
    formatDocumento,
} from './PastorCarnetCard';
import { removeBackgroundWithAi } from './ai-photo-segmenter';
import {
    type StudioAdjustments,
    type StudioBackdropPreset,
    type AgentDiagnosis,
    type BrushToolMode,
    DEFAULT_STUDIO_ADJUSTMENTS,
    STUDIO_COLOR_PRESETS,
    STUDIO_BACKDROP_OPTIONS,
} from './studio-photo-types';
import {
    STUDIO_FRAME_W,
    STUDIO_FRAME_H,
    STUDIO_MASTER_W,
    STUDIO_MASTER_H,
    renderStudioComposite,
    mapCanvasPointToSourceImage,
} from './studio-canvas-renderer';

interface PastorPhotoAdjustModalProps {
    pastor: Pastor | null;
    isOpen: boolean;
    onClose: () => void;
    onPhotoUpdated: (newPhotoUrl: string) => void;
    templateFrontUrl?: string;
}

type StudioTab = 'optimize' | 'background' | 'light' | 'framing';

interface HistorySnapshot {
    adjustments: StudioAdjustments;
    activeImageSrc: string;
    cutoutDataUrl: string | null;
}

const FRAME_RATIO = STUDIO_FRAME_W / STUDIO_FRAME_H;

/** Valores neutros de luz y color (para restablecer la sección completa). */
const NEUTRAL_LIGHT_VALUES: Partial<StudioAdjustments> = {
    exposure: 0,
    brightness: 0,
    contrast: 0,
    shadows: 0,
    highlights: 0,
    temperature: 0,
    tint: 0,
    vibrance: 0,
    saturation: 0,
    clarity: 0,
    sharpness: 0,
};

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => {
            const fallback = new Image();
            fallback.onload = () => resolve(fallback);
            fallback.onerror = (err) => reject(err);
            fallback.src = src;
        };
        img.src = src;
    });
}

// =============================================================================
// COMPONENTES DE INTERFAZ REUTILIZABLES DEL ESTUDIO
// =============================================================================

interface StudioSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    defaultValue?: number;
    onChange: (val: number) => void;
    onCommit?: () => void;
    accentClass?: string;
}

function StudioSlider({
    label,
    value,
    min,
    max,
    step = 1,
    unit = '',
    defaultValue = 0,
    onChange,
    onCommit,
    accentClass = 'accent-indigo-600',
}: StudioSliderProps) {
    const isModified = Math.abs(value - defaultValue) > 0.01;
    const formatted =
        step < 1 ? value.toFixed(1) : `${value > 0 && min < 0 ? '+' : ''}${Math.round(value)}`;

    const reset = () => {
        onChange(defaultValue);
        onCommit?.();
    };

    return (
        <div className="group/slider space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs">
                <span
                    onDoubleClick={reset}
                    title="Doble clic para restablecer"
                    className={cn(
                        'select-none truncate',
                        isModified ? 'font-semibold text-foreground' : 'text-muted-foreground',
                    )}
                >
                    {label}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                    {isModified && (
                        <button
                            type="button"
                            onClick={reset}
                            className="opacity-0 group-hover/slider:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                            title="Restablecer"
                        >
                            <RotateCcw className="size-3" />
                        </button>
                    )}
                    <span
                        className={cn(
                            'min-w-[38px] text-right font-mono text-[11px] tabular-nums',
                            isModified
                                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                                : 'text-muted-foreground',
                        )}
                    >
                        {formatted}
                        {unit}
                    </span>
                </div>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                onMouseUp={onCommit}
                onTouchEnd={onCommit}
                onKeyUp={onCommit}
                className={cn(
                    'w-full h-1.5 bg-muted rounded-full cursor-pointer',
                    accentClass,
                )}
            />
        </div>
    );
}

interface PanelSectionProps {
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
    description?: string;
    action?: React.ReactNode;
    collapsible?: boolean;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

function PanelSection({
    title,
    icon: Icon,
    description,
    action,
    collapsible = false,
    defaultOpen = true,
    children,
}: PanelSectionProps) {
    const [open, setOpen] = useState<boolean>(defaultOpen);
    const isOpen = !collapsible || open;

    return (
        <section className="rounded-xl border border-border bg-background">
            <div
                className={cn(
                    'flex items-center justify-between gap-2 px-3.5 py-2.5',
                    collapsible && 'cursor-pointer select-none hover:bg-muted/40 rounded-xl',
                )}
                onClick={collapsible ? () => setOpen((v) => !v) : undefined}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {Icon && <Icon className="size-4 text-muted-foreground shrink-0" />}
                    <div className="min-w-0">
                        <h4 className="text-[13px] font-semibold text-foreground leading-tight">
                            {title}
                        </h4>
                        {description && (
                            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
                    {collapsible && (
                        <ChevronDown
                            className={cn(
                                'size-4 text-muted-foreground transition-transform',
                                isOpen && 'rotate-180',
                            )}
                        />
                    )}
                </div>
            </div>
            {isOpen && <div className="px-3.5 pb-3.5 pt-0.5 space-y-3">{children}</div>}
        </section>
    );
}

interface ToggleRowProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className="w-full flex items-center justify-between gap-3 text-left"
        >
            <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">{label}</p>
                {description && (
                    <p className="text-[11px] text-muted-foreground leading-snug">{description}</p>
                )}
            </div>
            <span
                className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
                    checked ? 'bg-indigo-600' : 'bg-muted-foreground/30',
                )}
            >
                <span
                    className={cn(
                        'inline-block size-4 rounded-full bg-white shadow-sm transition-transform',
                        checked ? 'translate-x-[18px]' : 'translate-x-0.5',
                    )}
                />
            </span>
        </button>
    );
}

interface ToolbarButtonProps {
    onClick: () => void;
    title: string;
    active?: boolean;
    disabled?: boolean;
    label?: string;
    icon: React.ComponentType<{ className?: string }>;
}

function ToolbarButton({ onClick, title, active, disabled, label, icon: Icon }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            aria-pressed={active}
            className={cn(
                'inline-flex items-center gap-1.5 h-8 rounded-md text-xs font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none',
                label ? 'px-2.5' : 'w-8 justify-center',
                active
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/70',
            )}
        >
            <Icon className="size-4" />
            {label && <span className="hidden xl:inline">{label}</span>}
        </button>
    );
}

// =============================================================================
// HELPER PARA PROCESAR RESPUESTAS JSON DE FORMA SEGURA (EVITA SyntaxError ANTE ERRORES HTML)
// =============================================================================
async function safeParseJson(response: Response): Promise<any> {
    const rawText = await response.text();
    try {
        return JSON.parse(rawText);
    } catch {
        if (!response.ok) {
            throw new Error(`Error en el servidor (${response.status}: ${response.statusText || 'Fallo de conexión'}).`);
        }
        throw new Error('El servidor devolvió una respuesta no válida.');
    }
}

// =============================================================================
// ESTUDIO FOTOGRÁFICO PROFESIONAL (PANTALLA COMPLETA)
// =============================================================================

export function PastorPhotoAdjustModal({
    pastor,
    isOpen,
    onClose,
    onPhotoUpdated,
    templateFrontUrl = '/image/Credencial-frente.png',
}: PastorPhotoAdjustModalProps) {
    const { __ } = useTranslate();

    const [activeTab, setActiveTab] = useState<StudioTab>('optimize');
    const [adj, setAdj] = useState<StudioAdjustments>({ ...DEFAULT_STUDIO_ADJUSTMENTS });
    const adjRef = useRef<StudioAdjustments>(adj);
    adjRef.current = adj;

    // Imágenes base: original inicial (para comparador Antes/Después) e imagen activa de trabajo (escena completa)
    const [initialOriginalImg, setInitialOriginalImg] = useState<HTMLImageElement | null>(null);
    const [workingImg, setWorkingImg] = useState<HTMLImageElement | null>(null);
    const [workingImgSrc, setWorkingImgSrc] = useState<string>('');
    const [cutoutCanvas, setCutoutCanvas] = useState<HTMLCanvasElement | null>(null);
    const [cutoutDataUrl, setCutoutDataUrl] = useState<string | null>(null);

    // Pincel de retoque (Borrar / Restaurar bordes)
    const [brushMode, setBrushMode] = useState<BrushToolMode>('none');
    const [brushSize, setBrushSize] = useState<number>(22);
    const [brushSoftness, setBrushSoftness] = useState<number>(65);
    const [hasBrushStrokes, setHasBrushStrokes] = useState<boolean>(false);
    const [brushRenderTick, setBrushRenderTick] = useState<number>(0);
    const [cursorPreview, setCursorPreview] = useState<{ x: number; y: number } | null>(null);
    const brushMaskCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Diagnóstico de calidad y procesamiento
    const [diagnosis, setDiagnosis] = useState<AgentDiagnosis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [isRunningNeural, setIsRunningNeural] = useState<boolean>(false);
    const [neuralStatusText, setNeuralStatusText] = useState<string>('');
    const [isRemovingBg, setIsRemovingBg] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Herramientas visuales del escenario
    const [showBiometricGuides, setShowBiometricGuides] = useState<boolean>(true);
    const [showCompareSplit, setShowCompareSplit] = useState<boolean>(false);
    const [comparePosition, setComparePosition] = useState<number>(50);
    const [showLiveCardPreview, setShowLiveCardPreview] = useState<boolean>(true);
    const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);

    // Historial Undo / Redo
    const [history, setHistory] = useState<HistorySnapshot[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);

    // Tamaño de visualización adaptable a la pantalla (render interno siempre 748 x 1124 HD)
    const [displaySize, setDisplaySize] = useState<{ w: number; h: number }>({ w: 266, h: 399 });

    const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const beforeCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const stageViewportRef = useRef<HTMLDivElement | null>(null);
    const isInteractingRef = useRef<boolean>(false);
    const isDraggingCompareRef = useRef<boolean>(false);
    const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const analyzeAbortRef = useRef<AbortController | null>(null);

    const photoUrl = pastor ? getPastorPhotoUrl((pastor as any).foto_url || pastor.foto) : null;
    const isBusy = isRunningNeural || isRemovingBg || isSaving;

    // Ajuste responsivo del lienzo al espacio disponible del escenario
    useEffect(() => {
        if (!isOpen) return;
        const el = stageViewportRef.current;
        if (!el) return;

        const update = () => {
            const rect = el.getBoundingClientRect();
            const availH = Math.max(320, rect.height - 24);
            const availW = Math.max(220, rect.width - 32);
            let h = Math.min(availH, availW / FRAME_RATIO, 860);
            h = Math.max(300, h);
            const w = h * FRAME_RATIO;
            setDisplaySize({ w: Math.round(w), h: Math.round(h) });
        };

        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [isOpen, pastor?.id]);

    const initBrushMaskForImage = useCallback((img: HTMLImageElement) => {
        const mask = document.createElement('canvas');
        mask.width = img.width;
        mask.height = img.height;
        const mCtx = mask.getContext('2d');
        if (mCtx) {
            mCtx.fillStyle = '#000000';
            mCtx.fillRect(0, 0, mask.width, mask.height);
        }
        brushMaskCanvasRef.current = mask;
        setHasBrushStrokes(false);
    }, []);

    const pushHistory = useCallback(
        (
            nextAdj: StudioAdjustments,
            nextImgSrc: string,
            nextCutoutUrl: string | null,
        ) => {
            const snapshot: HistorySnapshot = {
                adjustments: { ...nextAdj },
                activeImageSrc: nextImgSrc,
                cutoutDataUrl: nextCutoutUrl,
            };
            setHistory((prev) => {
                const sliced = prev.slice(0, historyIndex + 1);
                const updated = [...sliced, snapshot].slice(-20);
                setHistoryIndex(updated.length - 1);
                return updated;
            });
        },
        [historyIndex],
    );

    const restoreSnapshot = useCallback(
        async (snap: HistorySnapshot) => {
            setAdj({ ...snap.adjustments });
            if (snap.activeImageSrc !== workingImgSrc) {
                try {
                    const loaded = await loadHtmlImage(snap.activeImageSrc);
                    setWorkingImg(loaded);
                    setWorkingImgSrc(snap.activeImageSrc);
                    initBrushMaskForImage(loaded);
                } catch {
                    // mantener actual si falla
                }
            }
            if (snap.cutoutDataUrl) {
                try {
                    const cutImg = await loadHtmlImage(snap.cutoutDataUrl);
                    const c = document.createElement('canvas');
                    c.width = cutImg.width;
                    c.height = cutImg.height;
                    c.getContext('2d')?.drawImage(cutImg, 0, 0);
                    setCutoutCanvas(c);
                    setCutoutDataUrl(snap.cutoutDataUrl);
                } catch {
                    setCutoutCanvas(null);
                    setCutoutDataUrl(null);
                }
            } else {
                setCutoutCanvas(null);
                setCutoutDataUrl(null);
            }
        },
        [workingImgSrc, initBrushMaskForImage],
    );

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const prevIdx = historyIndex - 1;
            setHistoryIndex(prevIdx);
            void restoreSnapshot(history[prevIdx]);
        }
    }, [history, historyIndex, restoreSnapshot]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const nextIdx = historyIndex + 1;
            setHistoryIndex(nextIdx);
            void restoreSnapshot(history[nextIdx]);
        }
    }, [history, historyIndex, restoreSnapshot]);

    // Atajos de teclado Ctrl+Z / Ctrl+Y
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    handleRedo();
                } else {
                    handleUndo();
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                handleRedo();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, handleUndo, handleRedo]);

    // Análisis de calidad de la fotografía (motor local)
    const runAgentDiagnosis = useCallback(
        async (dataUri?: string) => {
            if (!pastor) return;
            analyzeAbortRef.current?.abort();
            const controller = new AbortController();
            analyzeAbortRef.current = controller;

            try {
                setIsAnalyzing(true);
                const csrfToken =
                    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                const response = await fetch(`/admin/pastores/${pastor.id}/ia-analyze`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        Accept: 'application/json',
                    },
                    body: JSON.stringify(dataUri ? { foto: dataUri } : {}),
                    signal: controller.signal,
                });

                const result = await safeParseJson(response);
                if (response.ok && result.success) {
                    setDiagnosis(result as AgentDiagnosis);
                    const rec = result.recommended_params || {};
                    setAdj((prev) => ({
                        ...prev,
                        faceRestore: Boolean(rec.face_restore ?? true),
                        faceStrength: Number(rec.face_strength ?? 65),
                        eyeClarity: Number(rec.eye_clarity ?? 28),
                        skinSmooth: Number(rec.skin_smooth ?? 18),
                        denoise: Number(rec.denoise ?? 12),
                        upscale: Boolean(rec.upscale ?? false),
                        neuralRemoveBg: Boolean(rec.remove_bg ?? true),
                    }));
                }
            } catch (err: any) {
                if (err?.name !== 'AbortError') {
                    console.debug('Análisis de calidad omitido:', err);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsAnalyzing(false);
                }
            }
        },
        [pastor],
    );

    // Inicializar estudio al abrir modal
    useEffect(() => {
        if (!isOpen || !pastor) return;

        setActiveTab('optimize');
        setBrushMode('none');
        setShowCompareSplit(false);
        setComparePosition(50);
        setDiagnosis(null);
        setCutoutCanvas(null);
        setCutoutDataUrl(null);
        const freshAdj = { ...DEFAULT_STUDIO_ADJUSTMENTS };
        setAdj(freshAdj);

        if (!photoUrl) {
            setInitialOriginalImg(null);
            setWorkingImg(null);
            setWorkingImgSrc('');
            setHistory([]);
            setHistoryIndex(-1);
            return;
        }

        let cancelled = false;
        loadHtmlImage(photoUrl)
            .then((img) => {
                if (cancelled) return;
                setInitialOriginalImg(img);
                setWorkingImg(img);
                setWorkingImgSrc(photoUrl);
                initBrushMaskForImage(img);

                let initialCutoutUrl: string | null = null;

                // Inspeccionar esquinas para detectar color de croma o si la foto ya posee canal alfa recortado
                try {
                    const tmp = document.createElement('canvas');
                    tmp.width = img.width;
                    tmp.height = img.height;
                    const tCtx = tmp.getContext('2d');
                    if (tCtx) {
                        tCtx.drawImage(img, 0, 0);
                        const cTopLeft = tCtx.getImageData(4, 4, 1, 1).data;
                        const cTopRight = tCtx.getImageData(Math.max(0, img.width - 5), 4, 1, 1).data;

                        if (cTopLeft[3] < 240 && cTopRight[3] < 240) {
                            // La imagen actual ya es un recorte transparente: habilitar cambio de fondo instantáneo
                            setCutoutCanvas(tmp);
                            initialCutoutUrl = tmp.toDataURL('image/png');
                            setCutoutDataUrl(initialCutoutUrl);
                            freshAdj.bgMode = 'ai_cutout';
                            freshAdj.backdropPreset = 'transparent';
                            freshAdj.dropShadow = 0;
                        } else {
                            const hex =
                                '#' +
                                ((1 << 24) + (cTopLeft[0] << 16) + (cTopLeft[1] << 8) + cTopLeft[2])
                                    .toString(16)
                                    .slice(1);
                            freshAdj.chromaColor = hex;
                        }
                        setAdj({ ...freshAdj });
                    }
                } catch {
                    // ignorar CORS
                }

                setHistory([
                    {
                        adjustments: { ...freshAdj },
                        activeImageSrc: photoUrl,
                        cutoutDataUrl: initialCutoutUrl,
                    },
                ]);
                setHistoryIndex(0);
                void runAgentDiagnosis();
            })
            .catch(() => {
                if (!cancelled) {
                    setInitialOriginalImg(null);
                    setWorkingImg(null);
                }
            });

        return () => {
            cancelled = true;
            analyzeAbortRef.current?.abort();
        };
    }, [isOpen, pastor?.id, photoUrl, initBrushMaskForImage, runAgentDiagnosis]);

    // Subir nueva fotografía local desde disco
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            const dataUrl = ev.target?.result as string;
            if (!dataUrl) return;
            try {
                const img = await loadHtmlImage(dataUrl);
                const freshAdj = { ...DEFAULT_STUDIO_ADJUSTMENTS };
                setInitialOriginalImg(img);
                setWorkingImg(img);
                setWorkingImgSrc(dataUrl);
                setCutoutCanvas(null);
                setCutoutDataUrl(null);
                setAdj(freshAdj);
                setBrushMode('none');
                initBrushMaskForImage(img);
                pushHistory(freshAdj, dataUrl, null);
                toast.info(__('Fotografía cargada. Analizando calidad...'));
                void runAgentDiagnosis(dataUrl);
            } catch {
                toast.error(__('No se pudo leer el archivo de imagen seleccionado.'));
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    // Extraer DataURL limpio de la imagen de trabajo actual
    const getWorkingImageDataUrl = useCallback((): string | null => {
        if (!workingImg) return null;
        if (workingImgSrc.startsWith('data:image/')) {
            return workingImgSrc;
        }
        try {
            const c = document.createElement('canvas');
            c.width = workingImg.naturalWidth || workingImg.width;
            c.height = workingImg.naturalHeight || workingImg.height;
            const ctx = c.getContext('2d');
            if (!ctx) return null;
            ctx.drawImage(workingImg, 0, 0);
            return c.toDataURL('image/png');
        } catch {
            return null;
        }
    }, [workingImg, workingImgSrc]);

    // =========================================================================
    // ACCIÓN 1: OPTIMIZAR FOTO (1 CLIC) Y RETOQUE AVANZADO
    // =========================================================================
    const handleRunNeuralDesigner = async (mode: 'auto_magic' | 'custom_neural') => {
        if (!pastor || !workingImg) return;

        try {
            setIsRunningNeural(true);
            setNeuralStatusText(
                mode === 'auto_magic'
                    ? __('Restaurando rostro, ajustando la luz y recortando el fondo...')
                    : __('Aplicando retoque avanzado con tus parámetros...'),
            );

            const currentAdj = adjRef.current;
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const sourceDataUrl = getWorkingImageDataUrl();

            // Solicitar capas separadas (return_layers: true) para conservar escena completa mejorada
            // (útil en modo Original, Bokeh y Pincel Restaurar) + capa de recorte RGBA limpia sin halos
            const serverDefringe = currentAdj.defringe > 0 ? currentAdj.defringe : 68;
            const optionsPayload =
                mode === 'auto_magic'
                    ? {
                          auto_pilot: true,
                          return_layers: true,
                          remove_bg: currentAdj.neuralRemoveBg,
                          matting_mode: 'ensemble',
                          defringe: serverDefringe,
                          edge_feather: currentAdj.edgeFeather,
                          edge_shift: currentAdj.edgeShift,
                          face_restore: true,
                          bg_type: 'transparent',
                          drop_shadow: 0,
                          auto_frame: false,
                      }
                    : {
                          auto_pilot: false,
                          return_layers: true,
                          remove_bg: currentAdj.neuralRemoveBg,
                          matting_mode: 'ensemble',
                          defringe: serverDefringe,
                          edge_feather: currentAdj.edgeFeather,
                          edge_shift: currentAdj.edgeShift,
                          face_restore: currentAdj.faceRestore,
                          face_strength: currentAdj.faceStrength,
                          eye_clarity: currentAdj.eyeClarity,
                          skin_smooth: currentAdj.skinSmooth,
                          denoise: currentAdj.denoise,
                          upscale: currentAdj.upscale,
                          upscale_mode: currentAdj.upscaleMode,
                          bg_type: 'transparent',
                          drop_shadow: 0,
                          auto_frame: false,
                      };

            const payload: Record<string, any> = { options: optionsPayload };
            if (sourceDataUrl) {
                payload.foto = sourceDataUrl;
            }

            const response = await fetch(`/admin/pastores/${pastor.id}/ia-enhance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await safeParseJson(response);
            if (!response.ok || !result.success) {
                throw new Error(result.error || __('No se pudo optimizar la fotografía.'));
            }

            const outSrc: string = result.data_url || result.foto_url;
            if (!outSrc) {
                throw new Error(__('El optimizador no devolvió una imagen.'));
            }

            const processedSceneImg = await loadHtmlImage(outSrc);
            setWorkingImg(processedSceneImg);
            setWorkingImgSrc(outSrc);
            initBrushMaskForImage(processedSceneImg);

            const latestAdj = adjRef.current;
            let newCutoutUrl: string | null = cutoutDataUrl;
            const steps: string[] = result.steps_applied || [];
            const didMatting = steps.includes('studio_matting') || Boolean(result.cutout_data_url);

            const nextAdj: StudioAdjustments = {
                ...latestAdj,
                defringe: 0, // El motor local ya aplicó descontaminación precisa en el recorte
                exposure: mode === 'auto_magic' ? 0 : latestAdj.exposure,
                brightness: mode === 'auto_magic' ? 0 : latestAdj.brightness,
                contrast: mode === 'auto_magic' ? 0 : latestAdj.contrast,
                shadows: mode === 'auto_magic' ? 0 : latestAdj.shadows,
                highlights: mode === 'auto_magic' ? 0 : latestAdj.highlights,
                temperature: mode === 'auto_magic' ? 0 : latestAdj.temperature,
                tint: mode === 'auto_magic' ? 0 : latestAdj.tint,
                vibrance: mode === 'auto_magic' ? 0 : latestAdj.vibrance,
                saturation: mode === 'auto_magic' ? 0 : latestAdj.saturation,
                clarity: mode === 'auto_magic' ? 0 : latestAdj.clarity,
                sharpness: mode === 'auto_magic' ? 0 : latestAdj.sharpness,
            };

            const diag: AgentDiagnosis | null = result.diagnosis || diagnosis;
            if (mode === 'auto_magic' && diag?.biometric?.available) {
                nextAdj.rotation = diag.biometric.rotation_deg;
                nextAdj.scale = Math.max(1.0, diag.biometric.ui_scale);
                nextAdj.panX = diag.biometric.ui_pan_x;
                nextAdj.panY = diag.biometric.ui_pan_y;
            }

            if (didMatting) {
                const cutoutSrc: string = result.cutout_data_url || outSrc;
                const cutImg =
                    cutoutSrc === outSrc ? processedSceneImg : await loadHtmlImage(cutoutSrc);
                const c = document.createElement('canvas');
                c.width = cutImg.width;
                c.height = cutImg.height;
                c.getContext('2d')?.drawImage(cutImg, 0, 0);
                setCutoutCanvas(c);
                newCutoutUrl = cutoutSrc;
                setCutoutDataUrl(cutoutSrc);
                nextAdj.bgMode = 'ai_cutout';
            }

            if (result.diagnosis) {
                setDiagnosis(result.diagnosis);
            }

            setAdj(nextAdj);
            setShowCompareSplit(true);
            pushHistory(nextAdj, outSrc, newCutoutUrl);

            const scoreMsg =
                result.before_score && result.after_score
                    ? ` (${__('Calidad')}: ${result.before_score} → ${result.after_score}/100)`
                    : '';

            toast.success(__('¡Foto optimizada!') + scoreMsg, {
                description: __('Elige un fondo o desliza la barra para comparar el antes y después.'),
            });
        } catch (err: any) {
            console.error('Error al optimizar la fotografía:', err);
            toast.error(err?.message || __('No se pudo optimizar la fotografía.'));
        } finally {
            setIsRunningNeural(false);
            setNeuralStatusText('');
        }
    };

    // =========================================================================
    // ACCIÓN 2: RECORTE DE FONDO DE ALTA PRECISIÓN (CABELLO + BORDES LIMPIOS)
    // =========================================================================
    const handleStudioRemoveBackground = async (targetBackdrop?: StudioBackdropPreset) => {
        if (!pastor || !workingImg) return;

        try {
            setIsRemovingBg(true);
            const currentAdj = adjRef.current;
            const sourceDataUrl = getWorkingImageDataUrl();
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            let cutCanvas: HTMLCanvasElement | null = null;
            let cutUrl: string | null = null;

            // 1. Motor local del servidor (recorte de alta precisión con limpieza de bordes)
            if (sourceDataUrl) {
                try {
                    const resp = await fetch(`/admin/pastores/${pastor.id}/ia-remove-bg`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            Accept: 'application/json',
                        },
                        body: JSON.stringify({
                            foto: sourceDataUrl,
                            options: {
                                mode: 'ensemble',
                                defringe: currentAdj.defringe > 0 ? currentAdj.defringe : 68,
                                edge_feather: currentAdj.edgeFeather,
                                edge_shift: currentAdj.edgeShift,
                            },
                        }),
                    });

                    const data = await safeParseJson(resp);
                    if (resp.ok && data.success && data.data_url) {
                        const cutImg = await loadHtmlImage(data.data_url);
                        cutCanvas = document.createElement('canvas');
                        cutCanvas.width = cutImg.width;
                        cutCanvas.height = cutImg.height;
                        cutCanvas.getContext('2d')?.drawImage(cutImg, 0, 0);
                        cutUrl = data.data_url;
                    }
                } catch (serverErr) {
                    console.warn('Motor del servidor no disponible para recorte, usando el navegador:', serverErr);
                }
            }

            // 2. Respaldo en el navegador
            if (!cutCanvas) {
                const segData = await removeBackgroundWithAi(
                    workingImg,
                    workingImg.width,
                    workingImg.height,
                );
                cutCanvas = document.createElement('canvas');
                cutCanvas.width = workingImg.width;
                cutCanvas.height = workingImg.height;
                cutCanvas.getContext('2d')?.putImageData(segData, 0, 0);
                cutUrl = cutCanvas.toDataURL('image/png');
            }

            setCutoutCanvas(cutCanvas);
            setCutoutDataUrl(cutUrl);

            const latestAdj = adjRef.current;
            const nextAdj: StudioAdjustments = {
                ...latestAdj,
                bgMode: 'ai_cutout',
                backdropPreset: targetBackdrop ?? latestAdj.backdropPreset,
                defringe: 0,
            };
            setAdj(nextAdj);
            pushHistory(nextAdj, workingImgSrc, cutUrl);
            toast.success(__('Fondo recortado con precisión (cabello y bordes limpios).'));
        } catch (error) {
            console.error('Error al recortar fondo:', error);
            toast.error(__('No se pudo recortar el fondo automáticamente. Se activó el modo por color.'));
            setAdj((prev) => ({
                ...prev,
                bgMode: 'chroma',
                backdropPreset: targetBackdrop ?? prev.backdropPreset,
            }));
        } finally {
            setIsRemovingBg(false);
        }
    };

    // Cambio rápido y 100% fiel de escenario/fondo desde cualquier pestaña
    const handleSelectQuickBackdrop = (preset: StudioBackdropPreset | 'keep_original') => {
        if (preset === 'keep_original') {
            const next: StudioAdjustments = { ...adjRef.current, bgMode: 'original' };
            setAdj(next);
            pushHistory(next, workingImgSrc, cutoutDataUrl);
            return;
        }

        if (adjRef.current.bgMode === 'original' && !cutoutCanvas) {
            setAdj((prev) => ({ ...prev, backdropPreset: preset }));
            void handleStudioRemoveBackground(preset);
            return;
        }

        const next: StudioAdjustments = {
            ...adjRef.current,
            bgMode: adjRef.current.bgMode === 'original' ? 'ai_cutout' : adjRef.current.bgMode,
            backdropPreset: preset,
        };
        setAdj(next);
        pushHistory(next, workingImgSrc, cutoutDataUrl);
    };

    // =========================================================================
    // ACCIÓN 3: CALIBRACIÓN AUTOMÁTICA Y ENCUADRE OFICIAL (INSTANTÁNEO)
    // =========================================================================
    const handleApplyRecommendedGrading = () => {
        if (!diagnosis?.recommended_params) {
            toast.info(__('Perfil Estudio Ejecutivo aplicado.'));
            const execPreset = STUDIO_COLOR_PRESETS[1].values;
            const next = { ...adjRef.current, ...execPreset };
            setAdj(next);
            pushHistory(next, workingImgSrc, cutoutDataUrl);
            return;
        }
        const r = diagnosis.recommended_params;
        const next: StudioAdjustments = {
            ...adjRef.current,
            exposure: Number(r.exposure ?? 0),
            brightness: Number(r.brightness ?? 0),
            contrast: Number(r.contrast ?? 8),
            shadows: Number(r.shadows ?? 12),
            highlights: Number(r.highlights ?? -8),
            temperature: Number(r.temperature ?? 0),
            tint: Number(r.tint ?? 0),
            vibrance: Number(r.vibrance ?? 8),
            saturation: Number(r.saturation ?? 0),
            clarity: Number(r.clarity ?? 12),
            sharpness: Number(r.sharpness ?? 18),
        };
        setAdj(next);
        pushHistory(next, workingImgSrc, cutoutDataUrl);
        toast.success(__('Luz, color y nitidez calibrados automáticamente.'));
    };

    const handleResetLight = () => {
        const next = { ...adjRef.current, ...NEUTRAL_LIGHT_VALUES };
        setAdj(next);
        pushHistory(next, workingImgSrc, cutoutDataUrl);
    };

    const handleApplyBiometricFraming = () => {
        if (!diagnosis?.biometric?.available) {
            const next = { ...adjRef.current, scale: 1.18, panX: 0, panY: 0, rotation: 0 };
            setAdj(next);
            pushHistory(next, workingImgSrc, cutoutDataUrl);
            toast.info(__('Encuadre estándar de credencial aplicado.'));
            return;
        }

        const b = diagnosis.biometric;
        const safeScale = Math.max(1.0, b.ui_scale);
        const minPanY = -140.5 * Math.max(0, safeScale - 1);
        const next: StudioAdjustments = {
            ...adjRef.current,
            rotation: b.rotation_deg,
            scale: safeScale,
            panX: b.ui_pan_x,
            panY: Math.max(minPanY, b.ui_pan_y),
        };
        setAdj(next);
        pushHistory(next, workingImgSrc, cutoutDataUrl);
        toast.success(__('Ojos nivelados y encuadre oficial aplicado.'));
    };

    const handleResetGeometry = () => {
        const next = {
            ...adjRef.current,
            scale: 1,
            panX: 0,
            panY: 0,
            rotation: 0,
            flipX: false,
        };
        setAdj(next);
        pushHistory(next, workingImgSrc, cutoutDataUrl);
    };

    const handleToggleFlip = () => {
        const next = { ...adjRef.current, flipX: !adjRef.current.flipX };
        setAdj(next);
        pushHistory(next, workingImgSrc, cutoutDataUrl);
    };

    const handleRotate90 = () => {
        const next = {
            ...adjRef.current,
            rotation: ((adjRef.current.rotation + 90 + 180) % 360) - 180,
        };
        setAdj(next);
        pushHistory(next, workingImgSrc, cutoutDataUrl);
    };

    const applyScale = (s: number) => {
        const nextScale = Math.max(0.55, Math.min(2.6, Number(s.toFixed(3))));
        setAdj((prev) => {
            const minPanY = nextScale >= 1 ? -140.5 * (nextScale - 1) : prev.panY;
            return { ...prev, scale: nextScale, panY: Math.max(minPanY, prev.panY) };
        });
    };

    // =========================================================================
    // RENDERIZADO EN TIEMPO REAL DEL LIENZO PRINCIPAL + ANTES/DESPUÉS + TARJETA
    // =========================================================================
    useEffect(() => {
        if (!isOpen || !mainCanvasRef.current || !workingImg) return;

        const canvas = mainCanvasRef.current;
        canvas.width = STUDIO_MASTER_W;
        canvas.height = STUDIO_MASTER_H;

        renderStudioComposite({
            targetCanvas: canvas,
            originalImage: workingImg,
            cutoutCanvas,
            brushMaskCanvas: brushMaskCanvasRef.current,
            hasBrushStrokes,
            adjustments: adj,
        });

        // Actualizar lienzo "Antes" si el comparador deslizable está activo
        if (showCompareSplit && beforeCanvasRef.current && initialOriginalImg) {
            const bCanvas = beforeCanvasRef.current;
            bCanvas.width = STUDIO_MASTER_W;
            bCanvas.height = STUDIO_MASTER_H;
            renderStudioComposite({
                targetCanvas: bCanvas,
                originalImage: initialOriginalImg,
                cutoutCanvas: null,
                brushMaskCanvas: null,
                hasBrushStrokes: false,
                adjustments: {
                    ...DEFAULT_STUDIO_ADJUSTMENTS,
                    bgMode: 'original',
                    scale: adj.scale,
                    panX: adj.panX,
                    panY: adj.panY,
                    rotation: adj.rotation,
                    flipX: adj.flipX,
                },
            });
        }

        // Actualizar miniatura para la Vista Previa de la Credencial en Vivo
        if (showLiveCardPreview) {
            const id = window.requestAnimationFrame(() => {
                try {
                    setLivePreviewUrl(canvas.toDataURL('image/png'));
                } catch {
                    // ignorar si imagen remota sin CORS
                }
            });
            return () => window.cancelAnimationFrame(id);
        }
    }, [
        isOpen,
        workingImg,
        initialOriginalImg,
        cutoutCanvas,
        hasBrushStrokes,
        brushRenderTick,
        adj,
        showCompareSplit,
        showLiveCardPreview,
        displaySize,
    ]);

    // =========================================================================
    // INTERACCIÓN EN LIENZO: ARRASTRE, RUEDA DE ZOOM Y PINCEL DE RETOQUE
    // =========================================================================
    const paintBrushStrokeAtClient = (clientX: number, clientY: number) => {
        if (brushMode === 'none' || !mainCanvasRef.current || !workingImg || !brushMaskCanvasRef.current) {
            return;
        }
        const rect = mainCanvasRef.current.getBoundingClientRect();
        const canvasX = ((clientX - rect.left) / rect.width) * mainCanvasRef.current.width;
        const canvasY = ((clientY - rect.top) / rect.height) * mainCanvasRef.current.height;

        const mapped = mapCanvasPointToSourceImage(
            canvasX,
            canvasY,
            mainCanvasRef.current.width,
            mainCanvasRef.current.height,
            workingImg.width,
            workingImg.height,
            adj,
        );

        const mCtx = brushMaskCanvasRef.current.getContext('2d');
        if (!mCtx) return;

        const canvasPxPerDisplayPx = mainCanvasRef.current.width / rect.width;
        const radiusInSrc = Math.max(
            2,
            brushSize * canvasPxPerDisplayPx * mapped.scaleToSrc * 0.5,
        );
        const innerR = radiusInSrc * Math.max(0.05, 1 - brushSoftness / 100);

        const grad = mCtx.createRadialGradient(
            mapped.x,
            mapped.y,
            innerR,
            mapped.x,
            mapped.y,
            radiusInSrc,
        );
        const colorRgb = brushMode === 'restore' ? '255, 0, 0' : '0, 255, 0';
        grad.addColorStop(0, `rgba(${colorRgb}, 0.92)`);
        grad.addColorStop(1, `rgba(${colorRgb}, 0)`);

        mCtx.fillStyle = grad;
        mCtx.beginPath();
        mCtx.arc(mapped.x, mapped.y, radiusInSrc, 0, Math.PI * 2);
        mCtx.fill();

        if (!hasBrushStrokes) {
            setHasBrushStrokes(true);
        }
        setBrushRenderTick((t) => t + 1);
    };

    const handleCanvasPointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        isInteractingRef.current = true;
        lastPointerRef.current = { x: e.clientX, y: e.clientY };

        if (brushMode !== 'none') {
            paintBrushStrokeAtClient(e.clientX, e.clientY);
        }
    };

    const handleCanvasPointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (mainCanvasRef.current) {
            const rect = mainCanvasRef.current.getBoundingClientRect();
            setCursorPreview({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }

        if (!isInteractingRef.current) return;

        if (brushMode !== 'none') {
            paintBrushStrokeAtClient(e.clientX, e.clientY);
            return;
        }

        const dx = e.clientX - lastPointerRef.current.x;
        const dy = e.clientY - lastPointerRef.current.y;
        lastPointerRef.current = { x: e.clientX, y: e.clientY };

        setAdj((prev) => {
            const rawPanY = prev.panY + dy * (STUDIO_FRAME_H / displaySize.h);
            // Evitar que al arrastrar hacia arriba con zoom >= 100% se despegue el borde inferior del saco
            const minPanY = prev.scale >= 1 ? -140.5 * (prev.scale - 1) : -180;
            return {
                ...prev,
                panX: prev.panX + dx * (STUDIO_FRAME_W / displaySize.w),
                panY: Math.max(minPanY, rawPanY),
            };
        });
    };

    const handleCanvasPointerUp = () => {
        if (isInteractingRef.current) {
            isInteractingRef.current = false;
            if (brushMode === 'none') {
                pushHistory(adjRef.current, workingImgSrc, cutoutDataUrl);
            }
        }
    };

    const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.06 : -0.06;
        setAdj((prev) => {
            const nextScale = Math.max(0.55, Math.min(3.0, Number((prev.scale + delta).toFixed(3))));
            const minPanY = nextScale >= 1 ? -140.5 * (nextScale - 1) : prev.panY;
            return {
                ...prev,
                scale: nextScale,
                panY: Math.max(minPanY, prev.panY),
            };
        });
    };

    const handleClearBrushStrokes = () => {
        if (workingImg) {
            initBrushMaskForImage(workingImg);
            setBrushRenderTick((t) => t + 1);
            toast.info(__('Trazos del pincel restablecidos.'));
        }
    };

    const handleResetAll = () => {
        const fresh = { ...DEFAULT_STUDIO_ADJUSTMENTS };
        setAdj(fresh);
        setBrushMode('none');
        setShowCompareSplit(false);
        if (initialOriginalImg) {
            setWorkingImg(initialOriginalImg);
            const origSrc = photoUrl || workingImgSrc;
            setWorkingImgSrc(origSrc);
            setCutoutCanvas(null);
            setCutoutDataUrl(null);
            initBrushMaskForImage(initialOriginalImg);
            pushHistory(fresh, origSrc, null);
        }
    };

    // =========================================================================
    // GUARDAR FOTOGRAFÍA HD EN LA CREDENCIAL DEL PASTOR (100% WYSIWYG)
    // =========================================================================
    const handleSavePhoto = async () => {
        if (!pastor || !mainCanvasRef.current || !workingImg) return;

        try {
            setIsSaving(true);
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = STUDIO_MASTER_W;
            exportCanvas.height = STUDIO_MASTER_H;

            renderStudioComposite({
                targetCanvas: exportCanvas,
                originalImage: workingImg,
                cutoutCanvas,
                brushMaskCanvas: brushMaskCanvasRef.current,
                hasBrushStrokes,
                adjustments: adjRef.current,
                forExport: true,
            });

            const dataUrl = exportCanvas.toDataURL('image/png');
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const response = await fetch(`/admin/pastores/${pastor.id}/actualizar-foto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
                body: JSON.stringify({ foto: dataUrl }),
            });

            const result = await safeParseJson(response);
            if (response.ok && result.success) {
                toast.success(result.message || __('Fotografía guardada en la credencial.'));
                onPhotoUpdated(result.foto_url);
                onClose();
            } else {
                toast.error(result.error || __('Error al guardar la fotografía.'));
            }
        } catch (error) {
            console.error('Error al guardar foto:', error);
            toast.error(__('Ocurrió un error al exportar y guardar la fotografía.'));
        } finally {
            setIsSaving(false);
        }
    };

    if (!pastor) return null;

    const updateAdj = <K extends keyof StudioAdjustments>(key: K, val: StudioAdjustments[K]) => {
        setAdj((prev) => ({ ...prev, [key]: val }));
    };

    const commitAdjHistory = () => {
        pushHistory(adjRef.current, workingImgSrc, cutoutDataUrl);
    };

    const pastorFullName = getPastorCarnetFullName(pastor, true);

    const scoreValue = diagnosis?.quality_score ?? null;
    const scoreTone =
        scoreValue === null
            ? { text: 'text-muted-foreground', stroke: 'stroke-muted-foreground/40' }
            : scoreValue >= 85
              ? { text: 'text-emerald-600 dark:text-emerald-400', stroke: 'stroke-emerald-500' }
              : scoreValue >= 68
                ? { text: 'text-indigo-600 dark:text-indigo-400', stroke: 'stroke-indigo-500' }
                : { text: 'text-amber-600 dark:text-amber-400', stroke: 'stroke-amber-500' };
    const scoreCircumference = 2 * Math.PI * 22;

    const activeBackdropLabel =
        adj.bgMode === 'original' && !hasBrushStrokes
            ? __('Original')
            : adj.bgMode === 'chroma'
              ? `${__('Por color')} · ${STUDIO_BACKDROP_OPTIONS.find((o) => o.id === adj.backdropPreset)?.label || ''}`
              : STUDIO_BACKDROP_OPTIONS.find((o) => o.id === adj.backdropPreset)?.label ||
                __('Estudio');

    const tabs: Array<{ id: StudioTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
        { id: 'optimize', label: __('Optimizar'), icon: Wand2 },
        { id: 'background', label: __('Fondo'), icon: Layers },
        { id: 'light', label: __('Luz y color'), icon: Sun },
        { id: 'framing', label: __('Encuadre'), icon: Frame },
    ];

    // ---------------------------------------------------------------------
    // Bloque reutilizable: Calidad de la foto
    // ---------------------------------------------------------------------
    const qualityBlock = (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="relative size-14 shrink-0">
                    <svg viewBox="0 0 52 52" className="size-14 -rotate-90">
                        <circle cx="26" cy="26" r="22" className="fill-none stroke-muted" strokeWidth="5" />
                        <circle
                            cx="26"
                            cy="26"
                            r="22"
                            className={cn('fill-none transition-all duration-700', scoreTone.stroke)}
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={scoreCircumference}
                            strokeDashoffset={
                                scoreCircumference * (1 - Math.min(100, Math.max(0, scoreValue ?? 0)) / 100)
                            }
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        {isAnalyzing ? (
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        ) : (
                            <span className={cn('text-sm font-bold tabular-nums', scoreTone.text)}>
                                {scoreValue ?? '—'}
                            </span>
                        )}
                    </div>
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                        {isAnalyzing
                            ? __('Analizando...')
                            : diagnosis?.grade || __('Sin analizar')}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        {diagnosis
                            ? `${diagnosis.dimensions.width}×${diagnosis.dimensions.height}px · ${__('Nitidez')} ${diagnosis.metrics.sharpness}%`
                            : __('Rostro, luz, ruido y fondo')}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isAnalyzing || !workingImg}
                    onClick={() => runAgentDiagnosis(getWorkingImageDataUrl() || undefined)}
                    className="h-7 px-2 text-[11px] text-muted-foreground"
                    title={__('Volver a analizar')}
                >
                    <RotateCw className="size-3.5" />
                </Button>
            </div>

            {diagnosis?.findings && diagnosis.findings.length > 0 && (
                <ul className="space-y-2">
                    {diagnosis.findings.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11.5px] leading-snug">
                            {f.type === 'warning' ? (
                                <AlertTriangle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                            ) : f.type === 'ok' ? (
                                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                                <Info className="size-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0">
                                <p className="font-medium text-foreground">{f.label}</p>
                                <p className="text-muted-foreground">{f.detail}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => !open && !isRunningNeural && !isSaving && onClose()}
        >
            <DialogContent className="top-0 left-0 translate-x-0 translate-y-0 w-screen max-w-none sm:max-w-none h-[100dvh] max-h-none rounded-none border-0 p-0 gap-0 overflow-hidden bg-background text-foreground flex flex-col data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100 [&>button]:hidden">
                {/* ==================== BARRA SUPERIOR ==================== */}
                <header className="h-14 shrink-0 border-b border-border bg-card px-3 sm:px-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="size-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <Camera className="size-4.5" />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-sm font-semibold text-foreground leading-tight truncate">
                                {__('Estudio Fotográfico')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground truncate">
                                {pastor.nombres} {pastor.apellidos} · {formatDocumento(pastor.documento)}
                            </DialogDescription>
                        </div>
                    </div>

                    {/* Herramientas de vista (centro) */}
                    <div className="hidden md:flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
                        <ToolbarButton
                            onClick={handleUndo}
                            disabled={historyIndex <= 0 || isBusy}
                            title={__('Deshacer (Ctrl+Z)')}
                            icon={Undo2}
                        />
                        <ToolbarButton
                            onClick={handleRedo}
                            disabled={historyIndex >= history.length - 1 || isBusy}
                            title={__('Rehacer (Ctrl+Y)')}
                            icon={Redo2}
                        />
                        <div className="w-px h-5 bg-border mx-1" />
                        <ToolbarButton
                            onClick={() => setShowBiometricGuides((v) => !v)}
                            active={showBiometricGuides}
                            title={__('Guías de encuadre (ojos, cabeza y hombros)')}
                            label={__('Guías')}
                            icon={Crosshair}
                        />
                        <ToolbarButton
                            onClick={() => setShowCompareSplit((v) => !v)}
                            active={showCompareSplit}
                            disabled={!initialOriginalImg}
                            title={__('Comparar antes y después')}
                            label={__('Comparar')}
                            icon={Columns2}
                        />
                        <ToolbarButton
                            onClick={() => setShowLiveCardPreview((v) => !v)}
                            active={showLiveCardPreview}
                            title={__('Vista previa en la credencial')}
                            label={__('Credencial')}
                            icon={IdCard}
                        />
                    </div>

                    {/* Acciones (derecha) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <label
                            className={cn(
                                'cursor-pointer',
                                isBusy && 'pointer-events-none opacity-50',
                            )}
                            title={__('Subir otra fotografía')}
                        >
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium transition-colors">
                                <Upload className="size-4" />
                                <span className="hidden sm:inline">{__('Subir foto')}</span>
                            </span>
                        </label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleResetAll}
                            disabled={isBusy}
                            className="size-9 text-muted-foreground"
                            title={__('Restablecer todo al original')}
                        >
                            <RotateCcw className="size-4" />
                        </Button>
                        <div className="hidden sm:block w-px h-6 bg-border mx-1" />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            disabled={isRunningNeural || isSaving}
                            className="hidden sm:inline-flex h-9 text-xs"
                        >
                            {__('Cancelar')}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSavePhoto}
                            disabled={isBusy || !workingImg}
                            className="h-9 px-4 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                        >
                            {isSaving ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Save className="size-4" />
                            )}
                            <span className="hidden sm:inline">
                                {isSaving ? __('Guardando...') : __('Guardar en credencial')}
                            </span>
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            disabled={isRunningNeural || isSaving}
                            className="size-9 text-muted-foreground"
                            title={__('Cerrar')}
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                </header>

                {/* ==================== CUERPO: 3 ZONAS ==================== */}
                <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
                    {/* -------- PANEL IZQUIERDO: CALIDAD + VISTA EN CREDENCIAL -------- */}
                    <aside className="order-3 lg:order-1 lg:w-[300px] shrink-0 border-t lg:border-t-0 lg:border-r border-border bg-card lg:overflow-y-auto">
                        <div className="p-4 space-y-5">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                    {__('Calidad de la foto')}
                                </p>
                                {qualityBlock}
                            </div>

                            {showLiveCardPreview && (
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                                        <Eye className="size-3.5" />
                                        {__('Vista en la credencial')}
                                    </p>
                                    <div
                                        className="relative overflow-hidden rounded-lg border border-border shadow-sm bg-white mx-auto"
                                        style={{ width: '268px', height: '171px' }}
                                    >
                                        <div
                                            style={{
                                                width: '680px',
                                                height: '432px',
                                                transform: 'scale(0.395)',
                                                transformOrigin: 'top left',
                                                backgroundImage: `url('${templateFrontUrl}')`,
                                                backgroundSize: '100% 100%',
                                                position: 'relative',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    left: '49px',
                                                    top: '116px',
                                                    width: '187px',
                                                    height: '281px',
                                                    borderRadius: '15px',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {livePreviewUrl && (
                                                    <img
                                                        src={livePreviewUrl}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>

                                            <div className="absolute left-[241px] w-[406px] top-[202px] h-[33px] flex items-center justify-center text-center px-3">
                                                <span
                                                    className="font-bold uppercase tracking-tight text-black whitespace-nowrap leading-none text-[18px]"
                                                    style={{
                                                        fontFamily: "'Cocogoose', 'COCOGOOSE', sans-serif",
                                                    }}
                                                >
                                                    {pastorFullName}
                                                </span>
                                            </div>
                                            <div className="absolute left-[241px] w-[406px] top-[239px] h-[20px] flex items-center justify-center text-center px-3">
                                                <span className="text-[12.5px] text-slate-900 tracking-wider uppercase leading-none">
                                                    C.I. {formatDocumento(pastor.documento)}
                                                </span>
                                            </div>
                                            <div className="absolute left-[241px] w-[406px] top-[265px] h-[26px] flex items-center justify-center text-center px-3">
                                                <span
                                                    className="text-[14px] font-bold uppercase tracking-wide text-black whitespace-nowrap leading-none"
                                                    style={{
                                                        fontFamily: "'Cocogoose', 'COCOGOOSE', sans-serif",
                                                    }}
                                                >
                                                    {(pastor.nivel_ministerial || 'MINISTRO ORDENADO').toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-2 text-center">
                                        {__('Simulación a escala real sobre la plantilla activa.')}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                    {__('Resumen')}
                                </p>
                                <dl className="rounded-lg border border-border divide-y divide-border text-xs">
                                    {[
                                        [__('Fondo'), activeBackdropLabel],
                                        [__('Zoom'), `${Math.round(adj.scale * 100)}%`],
                                        [__('Ángulo'), `${adj.rotation.toFixed(1)}°`],
                                        [__('Espejo'), adj.flipX ? __('Sí') : __('No')],
                                        [__('Retoques de pincel'), hasBrushStrokes ? __('Sí') : __('No')],
                                        [__('Salida'), `${STUDIO_MASTER_W}×${STUDIO_MASTER_H}px PNG`],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex items-center justify-between gap-2 px-3 py-2">
                                            <dt className="text-muted-foreground">{k}</dt>
                                            <dd className="font-medium text-foreground text-right truncate">{v}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        </div>
                    </aside>

                    {/* -------- ESCENARIO CENTRAL: LIENZO -------- */}
                    <main className="order-1 lg:order-2 flex-1 min-w-0 flex flex-col bg-muted/50 dark:bg-muted/20">
                        {/* Barra de estado superior del escenario */}
                        <div className="shrink-0 flex flex-wrap items-center justify-center gap-2 px-4 pt-3">
                            <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-background border border-border text-[11px] text-muted-foreground">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                {__('Fondo a guardar')}:{' '}
                                <strong className="font-semibold text-foreground">{activeBackdropLabel}</strong>
                            </span>
                            {brushMode !== 'none' && (
                                <span
                                    className={cn(
                                        'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-semibold border',
                                        brushMode === 'erase'
                                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
                                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
                                    )}
                                >
                                    {brushMode === 'erase' ? (
                                        <Eraser className="size-3.5" />
                                    ) : (
                                        <Paintbrush className="size-3.5" />
                                    )}
                                    {brushMode === 'erase' ? __('Pincel: borrando') : __('Pincel: restaurando')}
                                    <button
                                        type="button"
                                        onClick={() => setBrushMode('none')}
                                        className="ml-0.5 opacity-70 hover:opacity-100"
                                        title={__('Salir del pincel')}
                                    >
                                        <X className="size-3" />
                                    </button>
                                </span>
                            )}
                        </div>

                        {/* Área del lienzo (se adapta al espacio disponible) */}
                        <div
                            ref={stageViewportRef}
                            className="flex-1 min-h-[440px] lg:min-h-0 flex items-center justify-center p-3"
                        >
                            <style>{`
                                @keyframes studioLaserY {
                                    0% { top: 3%; }
                                    100% { top: 96%; }
                                }
                            `}</style>

                            {/* Damero real de transparencia detrás del canvas: jamás un color falso no exportable */}
                            <div
                                className={cn(
                                    'relative rounded-[18px] overflow-hidden shadow-xl ring-1 ring-black/10 dark:ring-white/10 select-none',
                                    'bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#ffffff_0%_50%)] dark:bg-[repeating-conic-gradient(#334155_0%_25%,#1e293b_0%_50%)] bg-[length:16px_16px]',
                                    brushMode !== 'none'
                                        ? 'cursor-none'
                                        : 'cursor-grab active:cursor-grabbing',
                                )}
                                style={{
                                    width: `${displaySize.w}px`,
                                    height: `${displaySize.h}px`,
                                }}
                                onMouseLeave={() => {
                                    handleCanvasPointerUp();
                                    setCursorPreview(null);
                                }}
                            >
                                {/* Lienzo Principal (idéntico píxel a píxel a lo que se guarda) */}
                                <canvas
                                    ref={mainCanvasRef}
                                    onMouseDown={handleCanvasPointerDown}
                                    onMouseMove={handleCanvasPointerMove}
                                    onMouseUp={handleCanvasPointerUp}
                                    onWheel={handleCanvasWheel}
                                    className="w-full h-full block"
                                />

                                {!workingImg && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground bg-background/80">
                                        <Camera className="size-8 opacity-50" />
                                        <p className="text-xs">{__('Sube una fotografía para comenzar')}</p>
                                    </div>
                                )}

                                {/* Comparador "Antes / Después" */}
                                {showCompareSplit && initialOriginalImg && (
                                    <>
                                        <div
                                            className="absolute inset-0 pointer-events-none overflow-hidden"
                                            style={{ clipPath: `inset(0 ${100 - comparePosition}% 0 0)` }}
                                        >
                                            <canvas ref={beforeCanvasRef} className="w-full h-full block" />
                                            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-semibold uppercase tracking-wider text-white">
                                                {__('Antes')}
                                            </span>
                                        </div>
                                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-semibold uppercase tracking-wider text-white pointer-events-none">
                                            {__('Después')}
                                        </span>
                                        <div
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                isDraggingCompareRef.current = true;
                                                const onMove = (ev: MouseEvent) => {
                                                    if (!isDraggingCompareRef.current || !mainCanvasRef.current) return;
                                                    const r = mainCanvasRef.current.getBoundingClientRect();
                                                    const pct = ((ev.clientX - r.left) / r.width) * 100;
                                                    setComparePosition(Math.max(4, Math.min(96, pct)));
                                                };
                                                const onUp = () => {
                                                    isDraggingCompareRef.current = false;
                                                    window.removeEventListener('mousemove', onMove);
                                                    window.removeEventListener('mouseup', onUp);
                                                };
                                                window.addEventListener('mousemove', onMove);
                                                window.addEventListener('mouseup', onUp);
                                            }}
                                            className="absolute inset-y-0 w-6 -ml-3 cursor-ew-resize z-20 flex items-center justify-center"
                                            style={{ left: `${comparePosition}%` }}
                                        >
                                            <div className="h-full w-[2px] bg-white shadow-[0_0_6px_rgba(0,0,0,0.4)]" />
                                            <div className="absolute size-7 rounded-full bg-white text-slate-900 shadow-lg flex items-center justify-center">
                                                <Columns2 className="size-3.5" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Guías de encuadre oficial */}
                                {showBiometricGuides && !isRunningNeural && workingImg && (
                                    <div className="absolute inset-0 pointer-events-none z-10">
                                        <div className="absolute inset-y-0 left-1/2 w-px border-l border-dashed border-cyan-500/50" />
                                        <div
                                            className="absolute inset-x-4 h-px border-t border-dotted border-cyan-500/45"
                                            style={{ top: '11%' }}
                                        />
                                        <div className="absolute inset-x-0 flex items-center" style={{ top: '39.5%' }}>
                                            <div className="w-full h-px bg-cyan-500/70" />
                                            <span className="absolute right-2 -top-4 text-[9px] font-semibold uppercase tracking-wider text-white bg-black/55 px-1.5 rounded">
                                                {__('Ojos')}
                                            </span>
                                        </div>
                                        <div
                                            className="absolute left-1/2 -translate-x-1/2 rounded-full border border-dashed border-indigo-500/40"
                                            style={{ top: '13%', width: '56%', height: '46%' }}
                                        />
                                        <div
                                            className="absolute inset-x-3 h-px border-t border-dotted border-cyan-500/45"
                                            style={{ top: '78%' }}
                                        />
                                    </div>
                                )}

                                {/* Cursor circular del pincel */}
                                {brushMode !== 'none' && cursorPreview && (
                                    <div
                                        className={cn(
                                            'pointer-events-none absolute rounded-full border-2 z-20 -translate-x-1/2 -translate-y-1/2',
                                            brushMode === 'erase'
                                                ? 'border-rose-500 bg-rose-500/15'
                                                : 'border-emerald-500 bg-emerald-500/15',
                                        )}
                                        style={{
                                            left: `${cursorPreview.x}px`,
                                            top: `${cursorPreview.y}px`,
                                            width: `${brushSize}px`,
                                            height: `${brushSize}px`,
                                        }}
                                    />
                                )}

                                {/* Superposición de procesamiento */}
                                {(isRunningNeural || isRemovingBg) && (
                                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-30 select-none">
                                        <div
                                            className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-white/80 to-transparent"
                                            style={{ animation: 'studioLaserY 2s ease-in-out infinite alternate' }}
                                        />
                                        <Loader2 className="size-7 text-white animate-spin mb-3" />
                                        <p className="text-sm font-semibold text-white">
                                            {isRemovingBg ? __('Recortando fondo...') : __('Optimizando fotografía...')}
                                        </p>
                                        <p className="text-xs text-white/75 mt-1 leading-snug max-w-[220px]">
                                            {neuralStatusText || __('Esto puede tardar unos segundos.')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Barra inferior: fondos rápidos + geometría */}
                        <div className="shrink-0 px-3 pb-3">
                            <div className="mx-auto max-w-[760px] rounded-xl border border-border bg-background shadow-sm px-3 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                                {/* Fondos rápidos */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-medium text-muted-foreground mr-1">
                                        {__('Fondo')}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectQuickBackdrop('keep_original')}
                                        disabled={isBusy}
                                        title={__('Conservar el fondo original de la foto')}
                                        className={cn(
                                            'h-6 px-2 rounded-md text-[10.5px] font-semibold border transition-colors',
                                            adj.bgMode === 'original'
                                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                                : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted',
                                        )}
                                    >
                                        {__('Original')}
                                    </button>
                                    {(
                                        [
                                            'credential_silver',
                                            'studio_white',
                                            'pearl_gray',
                                            'passport_sky',
                                            'mmm_blue',
                                            'bokeh',
                                            'transparent',
                                        ] as StudioBackdropPreset[]
                                    ).map((presetId) => {
                                        const opt = STUDIO_BACKDROP_OPTIONS.find((o) => o.id === presetId);
                                        if (!opt) return null;
                                        const isSelected =
                                            adj.bgMode !== 'original' && adj.backdropPreset === presetId;
                                        return (
                                            <button
                                                key={presetId}
                                                type="button"
                                                disabled={isBusy}
                                                onClick={() => handleSelectQuickBackdrop(presetId)}
                                                title={opt.label}
                                                className={cn(
                                                    'size-6 rounded-full border transition-transform hover:scale-110 disabled:opacity-50',
                                                    isSelected
                                                        ? 'ring-2 ring-indigo-600 ring-offset-2 ring-offset-background border-transparent'
                                                        : 'border-border',
                                                )}
                                                style={{ background: opt.previewCss }}
                                            />
                                        );
                                    })}
                                </div>

                                {/* Geometría rápida */}
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => applyScale(adj.scale - 0.1)}
                                        className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                                        title={__('Alejar')}
                                    >
                                        <ZoomOut className="size-4" />
                                    </button>
                                    <input
                                        type="range"
                                        min="0.55"
                                        max="2.6"
                                        step="0.02"
                                        value={adj.scale}
                                        onChange={(e) => applyScale(parseFloat(e.target.value))}
                                        onMouseUp={commitAdjHistory}
                                        onTouchEnd={commitAdjHistory}
                                        className="w-24 sm:w-28 accent-indigo-600 h-1.5 bg-muted rounded-full cursor-pointer"
                                        aria-label={__('Zoom')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => applyScale(adj.scale + 0.1)}
                                        className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                                        title={__('Acercar')}
                                    >
                                        <ZoomIn className="size-4" />
                                    </button>
                                    <span className="w-10 text-center font-mono text-[11px] tabular-nums text-muted-foreground">
                                        {Math.round(adj.scale * 100)}%
                                    </span>
                                    <div className="w-px h-5 bg-border mx-1" />
                                    <button
                                        type="button"
                                        onClick={handleApplyBiometricFraming}
                                        className="h-7 px-2 inline-flex items-center gap-1.5 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                                        title={__('Centrar rostro y nivelar ojos automáticamente')}
                                    >
                                        <Crosshair className="size-4" />
                                        <span className="hidden sm:inline">{__('Auto-encuadrar')}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleToggleFlip}
                                        className={cn(
                                            'size-7 inline-flex items-center justify-center rounded-md transition-colors',
                                            adj.flipX
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                                        )}
                                        title={__('Voltear horizontalmente (espejo)')}
                                    >
                                        <FlipHorizontal2 className="size-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRotate90}
                                        className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                                        title={__('Girar 90°')}
                                    >
                                        <RotateCw className="size-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Vista/Herramientas en pantallas pequeñas */}
                            <div className="md:hidden mt-2 flex items-center justify-center gap-0.5 rounded-lg bg-muted p-0.5 w-fit mx-auto">
                                <ToolbarButton onClick={handleUndo} disabled={historyIndex <= 0 || isBusy} title={__('Deshacer')} icon={Undo2} />
                                <ToolbarButton onClick={handleRedo} disabled={historyIndex >= history.length - 1 || isBusy} title={__('Rehacer')} icon={Redo2} />
                                <ToolbarButton onClick={() => setShowBiometricGuides((v) => !v)} active={showBiometricGuides} title={__('Guías')} icon={Crosshair} />
                                <ToolbarButton onClick={() => setShowCompareSplit((v) => !v)} active={showCompareSplit} disabled={!initialOriginalImg} title={__('Comparar')} icon={Columns2} />
                                <ToolbarButton onClick={() => setShowLiveCardPreview((v) => !v)} active={showLiveCardPreview} title={__('Credencial')} icon={IdCard} />
                            </div>
                        </div>
                    </main>

                    {/* -------- PANEL DERECHO: HERRAMIENTAS -------- */}
                    <aside className="order-2 lg:order-3 lg:w-[380px] xl:w-[400px] shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col lg:min-h-0">
                        {/* Pestañas */}
                        <div className="shrink-0 p-2 border-b border-border">
                            <div className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1">
                                {tabs.map((t) => {
                                    const Icon = t.icon;
                                    const active = activeTab === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => {
                                                setActiveTab(t.id);
                                                if (t.id !== 'background' && brushMode !== 'none') {
                                                    setBrushMode('none');
                                                }
                                            }}
                                            className={cn(
                                                'flex flex-col items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-medium transition-all',
                                                active
                                                    ? 'bg-background text-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            <Icon className={cn('size-4', active && 'text-indigo-600 dark:text-indigo-400')} />
                                            <span className="truncate">{t.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Contenido de la pestaña activa */}
                        <div className="flex-1 lg:overflow-y-auto p-3 space-y-3">
                            {/* ================= OPTIMIZAR ================= */}
                            {activeTab === 'optimize' && (
                                <>
                                    <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/[0.06] p-4 space-y-3">
                                        <div>
                                            <h3 className="text-sm font-semibold text-foreground">
                                                {__('Optimizar foto')}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                {__(
                                                    'Restaura el rostro, equilibra la luz y el color, limpia el ruido, recorta el fondo y nivela los ojos automáticamente.',
                                                )}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={() => handleRunNeuralDesigner('auto_magic')}
                                            disabled={isBusy || !workingImg}
                                            className="w-full h-10 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                                        >
                                            {isRunningNeural ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <Wand2 className="size-4" />
                                            )}
                                            {isRunningNeural ? __('Optimizando...') : __('Optimizar foto')}
                                        </Button>
                                        <p className="text-[11px] text-muted-foreground">
                                            {__('Al terminar podrás comparar el antes y después y elegir el fondo.')}
                                        </p>
                                    </div>

                                    <PanelSection
                                        title={__('Retoque avanzado')}
                                        icon={SlidersHorizontal}
                                        description={__('Controla cada paso de la optimización.')}
                                        collapsible
                                        defaultOpen={false}
                                    >
                                        <ToggleRow
                                            label={__('Restaurar detalles del rostro')}
                                            description={__('Ojos, piel y rasgos más definidos.')}
                                            checked={adj.faceRestore}
                                            onChange={(v) => updateAdj('faceRestore', v)}
                                        />
                                        {adj.faceRestore && (
                                            <div className="space-y-3 pl-3 border-l-2 border-indigo-500/30">
                                                <StudioSlider
                                                    label={__('Intensidad (conserva la identidad)')}
                                                    value={adj.faceStrength}
                                                    min={15}
                                                    max={95}
                                                    defaultValue={65}
                                                    unit="%"
                                                    onChange={(v) => updateAdj('faceStrength', v)}
                                                />
                                                <StudioSlider
                                                    label={__('Claridad de ojos')}
                                                    value={adj.eyeClarity}
                                                    min={0}
                                                    max={80}
                                                    defaultValue={28}
                                                    unit="%"
                                                    onChange={(v) => updateAdj('eyeClarity', v)}
                                                />
                                                <StudioSlider
                                                    label={__('Suavizado natural de piel')}
                                                    value={adj.skinSmooth}
                                                    min={0}
                                                    max={75}
                                                    defaultValue={18}
                                                    unit="%"
                                                    onChange={(v) => updateAdj('skinSmooth', v)}
                                                />
                                            </div>
                                        )}
                                        <StudioSlider
                                            label={__('Reducción de ruido')}
                                            value={adj.denoise}
                                            min={0}
                                            max={75}
                                            defaultValue={12}
                                            unit="%"
                                            onChange={(v) => updateAdj('denoise', v)}
                                        />
                                        <div className="pt-1 space-y-3 border-t border-border">
                                            <div className="pt-2">
                                                <ToggleRow
                                                    label={__('Aumentar resolución (x4)')}
                                                    description={__('Recomendado para fotos pequeñas o de WhatsApp.')}
                                                    checked={adj.upscale}
                                                    onChange={(v) => updateAdj('upscale', v)}
                                                />
                                            </div>
                                            <ToggleRow
                                                label={__('Recortar fondo al optimizar')}
                                                checked={adj.neuralRemoveBg}
                                                onChange={(v) => updateAdj('neuralRemoveBg', v)}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isBusy || !workingImg}
                                            onClick={() => handleRunNeuralDesigner('custom_neural')}
                                            className="w-full h-9 text-xs font-semibold gap-1.5"
                                        >
                                            <SlidersHorizontal className="size-3.5" />
                                            {__('Aplicar retoque avanzado')}
                                        </Button>
                                    </PanelSection>

                                    {/* Calidad en pantallas pequeñas (en escritorio está en el panel izquierdo) */}
                                    <div className="lg:hidden">
                                        <PanelSection title={__('Calidad de la foto')}>{qualityBlock}</PanelSection>
                                    </div>
                                </>
                            )}

                            {/* ================= FONDO ================= */}
                            {activeTab === 'background' && (
                                <>
                                    <PanelSection title={__('Recorte del fondo')} icon={Scissors}>
                                        <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1 text-[11px]">
                                            {(
                                                [
                                                    ['original', __('Original')],
                                                    ['ai_cutout', __('Recortado')],
                                                    ['chroma', __('Por color')],
                                                ] as const
                                            ).map(([modeKey, label]) => (
                                                <button
                                                    key={modeKey}
                                                    type="button"
                                                    disabled={isBusy}
                                                    onClick={() => {
                                                        if (modeKey === 'ai_cutout' && !cutoutCanvas) {
                                                            void handleStudioRemoveBackground();
                                                        } else {
                                                            const next = { ...adjRef.current, bgMode: modeKey };
                                                            setAdj(next);
                                                            pushHistory(next, workingImgSrc, cutoutDataUrl);
                                                        }
                                                    }}
                                                    className={cn(
                                                        'py-1.5 rounded-md font-medium transition-colors',
                                                        adj.bgMode === modeKey
                                                            ? 'bg-background text-foreground shadow-sm'
                                                            : 'text-muted-foreground hover:text-foreground',
                                                    )}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>

                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={isBusy || !workingImg}
                                            onClick={() => handleStudioRemoveBackground()}
                                            className="w-full h-9 text-xs font-semibold gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            {isRemovingBg ? (
                                                <Loader2 className="size-3.5 animate-spin" />
                                            ) : (
                                                <Scissors className="size-3.5" />
                                            )}
                                            {isRemovingBg
                                                ? __('Recortando...')
                                                : cutoutCanvas
                                                  ? __('Volver a recortar')
                                                  : __('Quitar fondo')}
                                        </Button>

                                        {adj.bgMode === 'ai_cutout' && (
                                            <div className="space-y-3 pt-1">
                                                <StudioSlider
                                                    label={__('Limpieza extra de bordes')}
                                                    value={adj.defringe}
                                                    min={0}
                                                    max={100}
                                                    defaultValue={0}
                                                    unit="%"
                                                    onChange={(v) => updateAdj('defringe', v)}
                                                    onCommit={commitAdjHistory}
                                                />
                                                <StudioSlider
                                                    label={__('Contorno (contraer / expandir)')}
                                                    value={adj.edgeShift}
                                                    min={-3}
                                                    max={3}
                                                    step={0.2}
                                                    defaultValue={0}
                                                    unit="px"
                                                    onChange={(v) => updateAdj('edgeShift', v)}
                                                    onCommit={commitAdjHistory}
                                                />
                                            </div>
                                        )}

                                        {adj.bgMode === 'chroma' && (
                                            <div className="space-y-3 pt-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">{__('Color a eliminar')}</span>
                                                    <input
                                                        type="color"
                                                        value={adj.chromaColor}
                                                        onChange={(e) => updateAdj('chromaColor', e.target.value)}
                                                        className="h-7 w-10 rounded cursor-pointer bg-transparent border border-border"
                                                    />
                                                </div>
                                                <StudioSlider
                                                    label={__('Tolerancia')}
                                                    value={adj.chromaTolerance}
                                                    min={5}
                                                    max={65}
                                                    defaultValue={24}
                                                    unit="%"
                                                    onChange={(v) => updateAdj('chromaTolerance', v)}
                                                    onCommit={commitAdjHistory}
                                                />
                                            </div>
                                        )}
                                    </PanelSection>

                                    <PanelSection
                                        title={__('Color de fondo')}
                                        icon={Layers}
                                        description={__('Se guarda exactamente como lo ves.')}
                                    >
                                        <div className="grid grid-cols-5 gap-2">
                                            {STUDIO_BACKDROP_OPTIONS.map((opt) => {
                                                const selected =
                                                    adj.backdropPreset === opt.id && adj.bgMode !== 'original';
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => handleSelectQuickBackdrop(opt.id)}
                                                        title={opt.label}
                                                        className="group flex flex-col items-center gap-1 disabled:opacity-50"
                                                    >
                                                        <div
                                                            className={cn(
                                                                'w-full aspect-square rounded-lg border transition-all',
                                                                selected
                                                                    ? 'ring-2 ring-indigo-600 ring-offset-2 ring-offset-background border-transparent'
                                                                    : 'border-border group-hover:border-indigo-400',
                                                            )}
                                                            style={{ background: opt.previewCss }}
                                                        />
                                                        <span
                                                            className={cn(
                                                                'text-[10px] leading-tight text-center line-clamp-2',
                                                                selected ? 'text-foreground font-semibold' : 'text-muted-foreground',
                                                            )}
                                                        >
                                                            {opt.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {(adj.backdropPreset === 'custom_solid' ||
                                            adj.backdropPreset === 'custom_gradient') && (
                                            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                                                <span className="text-muted-foreground">{__('Colores personalizados')}</span>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={adj.customBgColor}
                                                        onChange={(e) => updateAdj('customBgColor', e.target.value)}
                                                        onBlur={commitAdjHistory}
                                                        className="h-7 w-10 rounded cursor-pointer bg-transparent border border-border"
                                                    />
                                                    {adj.backdropPreset === 'custom_gradient' && (
                                                        <input
                                                            type="color"
                                                            value={adj.customBgSecondary}
                                                            onChange={(e) => updateAdj('customBgSecondary', e.target.value)}
                                                            onBlur={commitAdjHistory}
                                                            className="h-7 w-10 rounded cursor-pointer bg-transparent border border-border"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </PanelSection>

                                    <PanelSection
                                        title={__('Efectos de estudio')}
                                        icon={Sun}
                                        collapsible
                                        defaultOpen={false}
                                    >
                                        <StudioSlider
                                            label={__('Sombra de contacto')}
                                            value={adj.dropShadow}
                                            min={0}
                                            max={80}
                                            defaultValue={20}
                                            unit="%"
                                            onChange={(v) => updateAdj('dropShadow', v)}
                                            onCommit={commitAdjHistory}
                                        />
                                        <StudioSlider
                                            label={__('Luz de contorno')}
                                            value={adj.rimLight}
                                            min={0}
                                            max={65}
                                            defaultValue={0}
                                            unit="%"
                                            onChange={(v) => updateAdj('rimLight', v)}
                                            onCommit={commitAdjHistory}
                                        />
                                        <StudioSlider
                                            label={__('Viñeta suave')}
                                            value={adj.vignette}
                                            min={0}
                                            max={50}
                                            defaultValue={0}
                                            unit="%"
                                            onChange={(v) => updateAdj('vignette', v)}
                                            onCommit={commitAdjHistory}
                                        />
                                    </PanelSection>

                                    <PanelSection
                                        title={__('Pincel de retoque')}
                                        icon={Paintbrush}
                                        description={__('Corrige a mano zonas del recorte.')}
                                        collapsible
                                        defaultOpen={brushMode !== 'none'}
                                        action={
                                            hasBrushStrokes ? (
                                                <button
                                                    type="button"
                                                    onClick={handleClearBrushStrokes}
                                                    className="text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline"
                                                >
                                                    {__('Limpiar')}
                                                </button>
                                            ) : undefined
                                        }
                                    >
                                        <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                                            {(
                                                [
                                                    ['none', __('Mover'), Move, ''],
                                                    ['erase', __('Borrar'), Eraser, 'text-rose-600 dark:text-rose-400'],
                                                    ['restore', __('Restaurar'), Paintbrush, 'text-emerald-600 dark:text-emerald-400'],
                                                ] as const
                                            ).map(([modeKey, label, Icon, activeColor]) => (
                                                <button
                                                    key={modeKey}
                                                    type="button"
                                                    onClick={() => setBrushMode(modeKey)}
                                                    className={cn(
                                                        'py-1.5 rounded-md text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors',
                                                        brushMode === modeKey
                                                            ? cn('bg-background shadow-sm text-foreground', activeColor)
                                                            : 'text-muted-foreground hover:text-foreground',
                                                    )}
                                                >
                                                    <Icon className="size-3.5" />
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                        {brushMode !== 'none' && (
                                            <div className="space-y-3">
                                                <StudioSlider
                                                    label={__('Tamaño')}
                                                    value={brushSize}
                                                    min={6}
                                                    max={72}
                                                    defaultValue={22}
                                                    unit="px"
                                                    onChange={setBrushSize}
                                                />
                                                <StudioSlider
                                                    label={__('Suavidad del borde')}
                                                    value={brushSoftness}
                                                    min={0}
                                                    max={95}
                                                    defaultValue={65}
                                                    unit="%"
                                                    onChange={setBrushSoftness}
                                                />
                                            </div>
                                        )}
                                    </PanelSection>
                                </>
                            )}

                            {/* ================= LUZ Y COLOR ================= */}
                            {activeTab === 'light' && (
                                <>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleApplyRecommendedGrading}
                                            disabled={!workingImg}
                                            className="h-9 text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            <Wand2 className="size-3.5" />
                                            {__('Calibrar automático')}
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={handleResetLight}
                                            className="h-9 text-xs font-medium gap-1.5"
                                        >
                                            <RotateCcw className="size-3.5" />
                                            {__('Restablecer')}
                                        </Button>
                                    </div>

                                    <PanelSection title={__('Estilos')} icon={Sun}>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {STUDIO_COLOR_PRESETS.map((preset) => (
                                                <button
                                                    key={preset.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const next = { ...adjRef.current, ...preset.values };
                                                        setAdj(next);
                                                        pushHistory(next, workingImgSrc, cutoutDataUrl);
                                                    }}
                                                    className="px-2.5 py-2 rounded-lg border border-border bg-background hover:bg-muted hover:border-indigo-400 text-left transition-colors"
                                                >
                                                    <p className="text-[11.5px] font-medium text-foreground truncate">
                                                        {preset.name}
                                                    </p>
                                                    {preset.badge && (
                                                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                                                            {preset.badge}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </PanelSection>

                                    <PanelSection title={__('Iluminación')} collapsible defaultOpen>
                                        <StudioSlider
                                            label={__('Exposición')}
                                            value={adj.exposure}
                                            min={-50}
                                            max={50}
                                            onChange={(v) => updateAdj('exposure', v)}
                                            onCommit={commitAdjHistory}
                                        />
                                        <StudioSlider
                                            label={__('Sombras')}
                                            value={adj.shadows}
                                            min={-60}
                                            max={60}
                                            onChange={(v) => updateAdj('shadows', v)}
                                            onCommit={commitAdjHistory}
                                        />
                                        <StudioSlider
                                            label={__('Altas luces (brillos)')}
                                            value={adj.highlights}
                                            min={-60}
                                            max={60}
                                            onChange={(v) => updateAdj('highlights', v)}
                                            onCommit={commitAdjHistory}
                                        />
                                        <StudioSlider
                                            label={__('Brillo')}
                                            value={adj.brightness}
                                            min={-50}
                                            max={50}
                                            onChange={(v) => updateAdj('brightness', v)}
                                            onCommit={commitAdjHistory}
                                        />
                                        <StudioSlider
                                            label={__('Contraste')}
                                            value={adj.contrast}
                                            min={-50}
                                            max={50}
                                            onChange={(v) => updateAdj('contrast', v)}
                                            onCommit={commitAdjHistory}
                                        />
                                    </PanelSection>

                                    <PanelSection title={__('Color')} collapsible defaultOpen>
                                        <StudioSlider
                                            label={__('Temperatura (frío ↔ cálido)')}
                                            value={adj.temperature}
                                            min={-60}
                                            max={60}
                                            onChange={(v) => updateAdj('temperature', v)}
                                            onCommit={commitAdjHistory}
                                        />
                                        <StudioSlider
                                            label={__('Matiz (verde ↔ magenta)')}
                                            value={adj.tint}
                                            min={-50}
                                            max={50}
                                            onChange={(v) => updateAdj('tint', v)}
                                            onCommit={commitAdjHistory}
                                        />
                                        <StudioSlider
                                            label={__('Intensidad (protege la piel)')}
                                            value={adj.vibrance}
                                            min={-50}
                                            max={60}
                                            onChange={(v) => updateAdj('vibrance', v)}
                                            onCommit={commitAdjHistory}
                                        />
                                        <StudioSlider
                                            label={__('Saturación')}
                                            value={adj.saturation}
                                            min={-60}
                                            max={60}
                                            onChange={(v) => updateAdj('saturation', v)}
                                            onCommit={commitAdjHistory}
                                        />
                                    </PanelSection>

                                    <PanelSection title={__('Detalle')} collapsible defaultOpen={false}>
                                        <StudioSlider
                                            label={__('Claridad')}
                                            value={adj.clarity}
                                            min={-30}
                                            max={60}
                                            onChange={(v) => updateAdj('clarity', v)}
                                            onCommit={commitAdjHistory}
                                        />
                                        <StudioSlider
                                            label={__('Nitidez')}
                                            value={adj.sharpness}
                                            min={0}
                                            max={60}
                                            onChange={(v) => updateAdj('sharpness', v)}
                                            onCommit={commitAdjHistory}
                                        />
                                    </PanelSection>
                                </>
                            )}

                            {/* ================= ENCUADRE ================= */}
                            {activeTab === 'framing' && (
                                <>
                                    <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                                        <div>
                                            <h3 className="text-sm font-semibold text-foreground">
                                                {__('Encuadre oficial')}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                {__(
                                                    'Nivela la inclinación de la cabeza y ubica los ojos a la altura oficial sin cortar los hombros.',
                                                )}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleApplyBiometricFraming}
                                            disabled={!workingImg}
                                            className="w-full h-9 text-xs font-semibold gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            <Crosshair className="size-4" />
                                            {__('Alinear ojos y encuadrar')}
                                        </Button>
                                    </div>

                                    <PanelSection title={__('Ajuste manual')} icon={Move}>
                                        <StudioSlider
                                            label={__('Ángulo')}
                                            value={adj.rotation}
                                            min={-20}
                                            max={20}
                                            step={0.1}
                                            defaultValue={0}
                                            unit="°"
                                            onChange={(v) => updateAdj('rotation', v)}
                                            onCommit={commitAdjHistory}
                                        />
                                        <StudioSlider
                                            label={__('Zoom')}
                                            value={Math.round(adj.scale * 100)}
                                            min={55}
                                            max={260}
                                            step={1}
                                            defaultValue={100}
                                            unit="%"
                                            onChange={(v) => updateAdj('scale', v / 100)}
                                            onCommit={commitAdjHistory}
                                        />
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {[
                                                { label: '100%', hint: __('Base'), val: 1.0 },
                                                { label: '120%', hint: __('Oficial'), val: 1.2 },
                                                { label: '138%', hint: __('Retrato'), val: 1.38 },
                                            ].map((p) => (
                                                <button
                                                    key={p.label}
                                                    type="button"
                                                    onClick={() => {
                                                        const next = { ...adjRef.current, scale: p.val };
                                                        setAdj(next);
                                                        pushHistory(next, workingImgSrc, cutoutDataUrl);
                                                    }}
                                                    className={cn(
                                                        'py-1.5 rounded-lg border text-center transition-colors',
                                                        Math.abs(adj.scale - p.val) < 0.005
                                                            ? 'border-indigo-600 bg-indigo-500/10'
                                                            : 'border-border bg-background hover:bg-muted',
                                                    )}
                                                >
                                                    <p className="text-[11.5px] font-semibold text-foreground">{p.label}</p>
                                                    <p className="text-[10px] text-muted-foreground">{p.hint}</p>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                                            <Button type="button" variant="outline" size="sm" onClick={handleToggleFlip} className="h-8 text-[11px] gap-1">
                                                <FlipHorizontal2 className="size-3.5" />
                                                {__('Espejo')}
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" onClick={handleRotate90} className="h-8 text-[11px] gap-1">
                                                <RotateCw className="size-3.5" />
                                                90°
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" onClick={handleResetGeometry} className="h-8 text-[11px] gap-1">
                                                <RotateCcw className="size-3.5" />
                                                {__('Centrar')}
                                            </Button>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            {__('Consejo: arrastra la foto para moverla y usa la rueda del ratón para el zoom.')}
                                        </p>
                                    </PanelSection>
                                </>
                            )}
                        </div>
                    </aside>
                </div>
            </DialogContent>
        </Dialog>
    );
}
