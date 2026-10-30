import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Upload,
    ZoomIn,
    ZoomOut,
    Scissors,
    Move,
    Save,
    RotateCcw,
    RotateCw,
    Sparkles,
    Loader2,
    Check,
    Undo2,
    Redo2,
    Sun,
    SlidersHorizontal,
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

type StudioTab = 'agent' | 'cutout' | 'light' | 'biometric';

interface HistorySnapshot {
    adjustments: StudioAdjustments;
    activeImageSrc: string;
    cutoutDataUrl: string | null;
}

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
    accentClass = 'accent-indigo-600 dark:accent-indigo-500',
}: StudioSliderProps) {
    const isModified = Math.abs(value - defaultValue) > 0.01;
    const formatted =
        step < 1 ? value.toFixed(1) : `${value > 0 && min < 0 ? '+' : ''}${Math.round(value)}`;

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
                <button
                    type="button"
                    onDoubleClick={() => {
                        onChange(defaultValue);
                        onCommit?.();
                    }}
                    title="Doble clic para restablecer este control"
                    className={cn(
                        'font-medium transition-colors text-left',
                        isModified
                            ? 'text-indigo-600 dark:text-indigo-300 font-semibold'
                            : 'text-foreground/85',
                    )}
                >
                    {label}
                </button>
                <div className="flex items-center gap-1.5">
                    <span
                        className={cn(
                            'font-mono text-[10.5px] px-1.5 py-0.5 rounded',
                            isModified
                                ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-200 font-bold'
                                : 'text-muted-foreground',
                        )}
                    >
                        {formatted}
                        {unit}
                    </span>
                    {isModified && (
                        <button
                            type="button"
                            onClick={() => {
                                onChange(defaultValue);
                                onCommit?.();
                            }}
                            className="text-[10px] text-muted-foreground hover:text-foreground"
                            title="Restablecer"
                        >
                            ↺
                        </button>
                    )}
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
                className={cn(
                    'w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer',
                    accentClass,
                )}
            />
        </div>
    );
}

export function PastorPhotoAdjustModal({
    pastor,
    isOpen,
    onClose,
    onPhotoUpdated,
    templateFrontUrl = '/image/Credencial-frente.png',
}: PastorPhotoAdjustModalProps) {
    const { __ } = useTranslate();

    const [activeTab, setActiveTab] = useState<StudioTab>('agent');
    const [adj, setAdj] = useState<StudioAdjustments>({ ...DEFAULT_STUDIO_ADJUSTMENTS });
    const adjRef = useRef<StudioAdjustments>(adj);
    adjRef.current = adj;

    // Imágenes base: original inicial (para comparador Antes/Después) e imagen activa de trabajo (escena completa)
    const [initialOriginalImg, setInitialOriginalImg] = useState<HTMLImageElement | null>(null);
    const [workingImg, setWorkingImg] = useState<HTMLImageElement | null>(null);
    const [workingImgSrc, setWorkingImgSrc] = useState<string>('');
    const [cutoutCanvas, setCutoutCanvas] = useState<HTMLCanvasElement | null>(null);
    const [cutoutDataUrl, setCutoutDataUrl] = useState<string | null>(null);

    // Pincel Mágico (Borrar / Restaurar bordes como Canva Pro / Picsart)
    const [brushMode, setBrushMode] = useState<BrushToolMode>('none');
    const [brushSize, setBrushSize] = useState<number>(22);
    const [brushSoftness, setBrushSoftness] = useState<number>(65);
    const [hasBrushStrokes, setHasBrushStrokes] = useState<boolean>(false);
    const [brushRenderTick, setBrushRenderTick] = useState<number>(0);
    const [cursorPreview, setCursorPreview] = useState<{ x: number; y: number } | null>(null);
    const brushMaskCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Diagnóstico del Agente Diseñador Python
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

    const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const beforeCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const stageViewportRef = useRef<HTMLDivElement | null>(null);
    const isInteractingRef = useRef<boolean>(false);
    const isDraggingCompareRef = useRef<boolean>(false);
    const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const analyzeAbortRef = useRef<AbortController | null>(null);

    const photoUrl = pastor ? getPastorPhotoUrl((pastor as any).foto_url || pastor.foto) : null;

    // Escala de visualización cómoda en el estudio (266 x 399 px en pantalla, renderizado interno 748 x 1124 HD)
    const DISPLAY_W = Math.round(STUDIO_FRAME_W * 1.42);
    const DISPLAY_H = Math.round(STUDIO_FRAME_H * 1.42);

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

    // Ejecutar auditoría del Agente Diseñador Python sobre la imagen
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

                const result = await response.json();
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
                    console.debug('Diagnóstico IA omitido:', err);
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

        setActiveTab('agent');
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
                toast.info(__('Fotografía cargada en el Estudio. Analizando con Agente IA...'));
                void runAgentDiagnosis(dataUrl);
            } catch {
                toast.error(__('No se pudo leer el archivo de imagen seleccionado.'));
            }
        };
        reader.readAsDataURL(file);
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
    // ACCIÓN 1: AUTO-DISEÑADOR MÁGICO 1-CLIC & MOTOR NEURONAL PYTHON
    // =========================================================================
    const handleRunNeuralDesigner = async (mode: 'auto_magic' | 'custom_neural') => {
        if (!pastor || !workingImg) return;

        try {
            setIsRunningNeural(true);
            setNeuralStatusText(
                mode === 'auto_magic'
                    ? __('Ejecutando receta adaptativa: restauración facial, recorte de cabello y luz de estudio...')
                    : __('Ejecutando redes neuronales GFPGAN / Real-ESRGAN y calibración profunda...'),
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

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error || __('No se pudo procesar con el Agente Diseñador.'));
            }

            const outSrc: string = result.data_url || result.foto_url;
            if (!outSrc) {
                throw new Error(__('El Agente IA no devolvió imagen resultante.'));
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
                defringe: 0, // El motor Python ya aplicó descontaminación precisa en el recorte
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

            toast.success(__('¡Diseño IA completado con éxito!') + scoreMsg, {
                description: __('Puedes elegir el color de fondo abajo o deslizar para comparar el Antes y Después.'),
            });
        } catch (err: any) {
            console.error('Error en Agente Diseñador:', err);
            toast.error(err?.message || __('Error al ejecutar el Agente Diseñador IA.'));
        } finally {
            setIsRunningNeural(false);
            setNeuralStatusText('');
        }
    };

    // =========================================================================
    // ACCIÓN 2: REMOCIÓN DE FONDO DE ESTUDIO HD (CABELLO + ANTI-HALOS)
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

            // 1. Motor Python de Estudio (RMBG-1.4 [-1,1] + MODNet cabello + Guided Filter + Defringe)
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

                    const data = await resp.json();
                    if (resp.ok && data.success && data.data_url) {
                        const cutImg = await loadHtmlImage(data.data_url);
                        cutCanvas = document.createElement('canvas');
                        cutCanvas.width = cutImg.width;
                        cutCanvas.height = cutImg.height;
                        cutCanvas.getContext('2d')?.drawImage(cutImg, 0, 0);
                        cutUrl = data.data_url;
                    }
                } catch (serverErr) {
                    console.warn('Motor Python no disponible para recorte, usando MediaPipe Wasm:', serverErr);
                }
            }

            // 2. Respaldo en navegador (MediaPipe Selfie Segmentation)
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
            toast.success(__('Fondo removido con precisión de estudio (cabello y bordes limpios).'));
        } catch (error) {
            console.error('Error al remover fondo:', error);
            toast.error(__('No se pudo remover el fondo con IA. Se activó el modo Croma manual.'));
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
    // ACCIÓN 3: APLICAR CALIBRACIÓN ÓPTIMA O BIOMETRÍA EN 1 CLIC (60FPS INSTANTÁNEO)
    // =========================================================================
    const handleApplyRecommendedGrading = () => {
        if (!diagnosis?.recommended_params) {
            toast.info(__('Aplicando perfil equilibrado de Estudio Ejecutivo.'));
            const execPreset = STUDIO_COLOR_PRESETS[1].values;
            const next = { ...adj, ...execPreset };
            setAdj(next);
            pushHistory(next, workingImgSrc, cutoutDataUrl);
            return;
        }
        const r = diagnosis.recommended_params;
        const next: StudioAdjustments = {
            ...adj,
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
        toast.success(__('Luz, balance de blancos y nitidez calibrados según diagnóstico IA.'));
    };

    const handleApplyBiometricFraming = () => {
        if (!diagnosis?.biometric?.available) {
            const next = { ...adj, scale: 1.18, panX: 0, panY: 0, rotation: 0 };
            setAdj(next);
            pushHistory(next, workingImgSrc, cutoutDataUrl);
            toast.info(__('Encuadre estándar de credencial aplicado.'));
            return;
        }

        const b = diagnosis.biometric;
        const safeScale = Math.max(1.0, b.ui_scale);
        const minPanY = -140.5 * Math.max(0, safeScale - 1);
        const next: StudioAdjustments = {
            ...adj,
            rotation: b.rotation_deg,
            scale: safeScale,
            panX: b.ui_pan_x,
            panY: Math.max(minPanY, b.ui_pan_y),
        };
        setAdj(next);
        pushHistory(next, workingImgSrc, cutoutDataUrl);
        toast.success(__('Ojos nivelados y encuadre biométrico oficial calibrado.'));
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
    ]);

    // =========================================================================
    // INTERACCIÓN EN LIENZO: ARRASTRE, RUEDA DE ZOOM Y PINCEL MÁGICO
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
            const rawPanY = prev.panY + dy * (STUDIO_FRAME_H / DISPLAY_H);
            // Evitar que al arrastrar hacia arriba con zoom >= 100% se despegue el borde inferior del saco
            const minPanY = prev.scale >= 1 ? -140.5 * (prev.scale - 1) : -180;
            return {
                ...prev,
                panX: prev.panX + dx * (STUDIO_FRAME_W / DISPLAY_W),
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
            toast.info(__('Trazos manuales del pincel restablecidos.'));
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
    // GUARDAR FOTOGRAFÍA MASTER HD EN LA CREDENCIAL DEL PASTOR (100% WYSIWYG)
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

            const result = await response.json();
            if (response.ok && result.success) {
                toast.success(
                    result.message || __('Fotografía de estudio guardada en la credencial.'),
                );
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

    const scoreValue = diagnosis?.quality_score ?? null;
    const scoreColor =
        scoreValue === null
            ? 'text-muted-foreground border-border bg-muted/40'
            : scoreValue >= 85
              ? 'text-emerald-700 dark:text-emerald-300 border-emerald-500/40 bg-emerald-500/10'
              : scoreValue >= 68
                ? 'text-indigo-700 dark:text-cyan-300 border-indigo-500/40 bg-indigo-500/10'
                : 'text-amber-700 dark:text-amber-300 border-amber-500/40 bg-amber-500/10';

    const updateAdj = <K extends keyof StudioAdjustments>(key: K, val: StudioAdjustments[K]) => {
        setAdj((prev) => ({ ...prev, [key]: val }));
    };

    const commitAdjHistory = () => {
        pushHistory(adjRef.current, workingImgSrc, cutoutDataUrl);
    };

    const pastorFullName = getPastorCarnetFullName(pastor, true);

    const activeBackdropLabel =
        adj.bgMode === 'original' && !hasBrushStrokes
            ? __('Original')
            : STUDIO_BACKDROP_OPTIONS.find((o) => o.id === adj.backdropPreset)?.label ||
              __('Estudio');

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => !open && !isRunningNeural && !isSaving && onClose()}
        >
            <DialogContent className="sm:max-w-[1160px] max-w-[98vw] h-[93vh] max-h-[880px] p-0 gap-0 overflow-hidden bg-background text-foreground border border-border shadow-2xl rounded-2xl flex flex-col [&>button]:hidden">
                {/* ==================== BARRA SUPERIOR ADAPTABLE AL TEMA ==================== */}
                <div className="px-4 py-2.5 border-b border-border bg-card flex flex-wrap items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-sm">
                            <Sparkles className="size-4 text-amber-200 fill-amber-200" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <DialogTitle className="text-sm font-bold text-foreground tracking-tight truncate">
                                    MMM Studio AI — {__('Agente Diseñador Fotográfico')}
                                </DialogTitle>
                                <Badge
                                    variant="outline"
                                    className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 text-[10px] px-1.5 py-0 h-4 font-semibold"
                                >
                                    PRO LOCAL
                                </Badge>
                            </div>
                            <DialogDescription className="text-[11px] text-muted-foreground truncate">
                                {pastor.nombres} {pastor.apellidos} •{' '}
                                {formatDocumento(pastor.documento)}
                            </DialogDescription>
                        </div>
                    </div>

                    {/* Acciones Globales Superiores */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-secondary-foreground font-semibold text-xs transition-colors">
                                <Upload className="size-3.5 text-indigo-600 dark:text-cyan-400" />
                                <span>{__('Subir Foto')}</span>
                            </div>
                        </label>

                        <div className="flex items-center bg-muted/60 border border-border rounded-lg p-0.5">
                            <button
                                type="button"
                                onClick={handleUndo}
                                disabled={historyIndex <= 0 || isRunningNeural}
                                title={__('Deshacer (Ctrl+Z)')}
                                className="p-1.5 rounded-md text-foreground/80 hover:bg-background disabled:opacity-35 transition-colors"
                            >
                                <Undo2 className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleRedo}
                                disabled={historyIndex >= history.length - 1 || isRunningNeural}
                                title={__('Rehacer (Ctrl+Y)')}
                                className="p-1.5 rounded-md text-foreground/80 hover:bg-background disabled:opacity-35 transition-colors"
                            >
                                <Redo2 className="size-3.5" />
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowBiometricGuides((v) => !v)}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                                showBiometricGuides
                                    ? 'bg-indigo-500/12 border-indigo-500/40 text-indigo-700 dark:text-cyan-200 font-semibold'
                                    : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground',
                            )}
                            title={__('Mostrar u ocultar guías biométricas de ojos, cabeza y hombros')}
                        >
                            <Crosshair className="size-3.5" />
                            <span className="hidden md:inline">{__('Guías')}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowCompareSplit((v) => !v)}
                            disabled={!initialOriginalImg}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                                showCompareSplit
                                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-800 dark:text-amber-200 font-semibold'
                                    : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground',
                            )}
                            title={__('Comparador interactivo Antes / Después')}
                        >
                            <Columns2 className="size-3.5" />
                            <span>{__('Antes / Después')}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowLiveCardPreview((v) => !v)}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                                showLiveCardPreview
                                    ? 'bg-indigo-500/12 border-indigo-500/40 text-indigo-700 dark:text-indigo-200 font-semibold'
                                    : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground',
                            )}
                            title={__('Mostrar vista en vivo sobre la credencial oficial')}
                        >
                            <IdCard className="size-3.5" />
                            <span className="hidden lg:inline">{__('Vista Carnet')}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleResetAll}
                            disabled={isRunningNeural || isSaving}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title={__('Restablecer todo al original')}
                        >
                            <RotateCcw className="size-3.5" />
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isRunningNeural || isSaving}
                            className="inline-flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>

                {/* ==================== CUERPO PRINCIPAL DE 2 ZONAS ==================== */}
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                    {/* -------- ZONA IZQUIERDA (7 cols): ESCENARIO INTERACTIVO + BARRA DE FONDOS + VISTA CARNET -------- */}
                    <div
                        ref={stageViewportRef}
                        className="lg:col-span-7 flex flex-col justify-between bg-slate-100/85 dark:bg-slate-950/80 border-b lg:border-b-0 lg:border-r border-border p-3 sm:p-4 overflow-y-auto"
                    >
                        <style>{`
                            @keyframes studioLaserY {
                                0% { top: 3%; }
                                100% { top: 96%; }
                            }
                            @keyframes studioLaserX {
                                0% { left: 4%; }
                                100% { left: 96%; }
                            }
                        `}</style>

                        {/* Escenario Central: Lienzo Retrato + Vista Previa del Carnet */}
                        <div className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-5 py-1">
                            {/* Contenedor del Lienzo Oficial 187:281 (100% WYSIWYG con la imagen que se guarda) */}
                            <div className="flex flex-col items-center">
                                <div className="mb-2 flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
                                    <span className="px-2 py-0.5 rounded-full bg-card border border-border font-mono text-[10px] text-muted-foreground shadow-2xs">
                                        {STUDIO_MASTER_W}×{STUDIO_MASTER_H}px HD
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-semibold text-indigo-700 dark:text-indigo-200">
                                        {__('Fondo a guardar')}: {activeBackdropLabel}
                                    </span>
                                    {brushMode !== 'none' && (
                                        <span
                                            className={cn(
                                                'px-2 py-0.5 rounded-full font-bold text-[10px] border',
                                                brushMode === 'erase'
                                                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-200 border-rose-500/40'
                                                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 border-emerald-500/40',
                                            )}
                                        >
                                            {brushMode === 'erase'
                                                ? __('🖌️ Borrando')
                                                : __('🖌️ Restaurando')}
                                        </span>
                                    )}
                                </div>

                                {/* Damero real de transparencia detrás del canvas: jamás un color falso no exportable */}
                                <div
                                    className={cn(
                                        'relative rounded-[21px] overflow-hidden shadow-xl ring-2 ring-indigo-500/55 select-none',
                                        'bg-[repeating-conic-gradient(#cbd5e1_0%_25%,#ffffff_0%_50%)] dark:bg-[repeating-conic-gradient(#334155_0%_25%,#1e293b_0%_50%)] bg-[length:14px_14px]',
                                        brushMode !== 'none'
                                            ? 'cursor-none'
                                            : 'cursor-grab active:cursor-grabbing',
                                    )}
                                    style={{
                                        width: `${DISPLAY_W}px`,
                                        height: `${DISPLAY_H}px`,
                                    }}
                                    onMouseLeave={() => {
                                        handleCanvasPointerUp();
                                        setCursorPreview(null);
                                    }}
                                >
                                    {/* Lienzo Principal (100% idéntico píxel a píxel a lo que se exporta y guarda) */}
                                    <canvas
                                        ref={mainCanvasRef}
                                        onMouseDown={handleCanvasPointerDown}
                                        onMouseMove={handleCanvasPointerMove}
                                        onMouseUp={handleCanvasPointerUp}
                                        onWheel={handleCanvasWheel}
                                        className="w-full h-full block"
                                    />

                                    {/* Capa Comparador "Antes" recortada dinámicamente */}
                                    {showCompareSplit && initialOriginalImg && (
                                        <>
                                            <div
                                                className="absolute inset-0 pointer-events-none overflow-hidden"
                                                style={{
                                                    clipPath: `inset(0 ${100 - comparePosition}% 0 0)`,
                                                }}
                                            >
                                                <canvas
                                                    ref={beforeCanvasRef}
                                                    className="w-full h-full block"
                                                />
                                                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-900/80 text-[9.5px] font-bold uppercase tracking-wider text-white border border-white/20">
                                                    {__('Antes')}
                                                </span>
                                            </div>
                                            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-indigo-600/95 text-[9.5px] font-bold uppercase tracking-wider text-white shadow-sm pointer-events-none">
                                                {__('Estudio IA')}
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
                                                className="absolute inset-y-0 w-5 -ml-2.5 cursor-ew-resize z-20 flex items-center justify-center"
                                                style={{ left: `${comparePosition}%` }}
                                            >
                                                <div className="h-full w-[2px] bg-white shadow-[0_0_8px_rgba(0,0,0,0.45)]" />
                                                <div className="absolute size-6 rounded-full bg-white text-slate-900 shadow-lg flex items-center justify-center text-[10px] font-black border border-indigo-500">
                                                    ↔
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Guías Biométricas Oficiales de Carnet */}
                                    {showBiometricGuides && !isRunningNeural && (
                                        <div className="absolute inset-0 pointer-events-none z-10">
                                            <div className="absolute inset-y-0 left-1/2 w-[1px] border-l border-dashed border-cyan-500/60" />
                                            <div
                                                className="absolute inset-x-4 h-[1px] border-t border-dotted border-cyan-500/50"
                                                style={{ top: '11%' }}
                                            />
                                            <div
                                                className="absolute inset-x-0 flex items-center"
                                                style={{ top: '39.5%' }}
                                            >
                                                <div className="w-full h-[1px] bg-cyan-500/75 shadow-[0_0_4px_rgba(6,182,212,0.5)]" />
                                                <span className="absolute right-1.5 -top-3.5 text-[8.5px] font-bold uppercase tracking-wider text-white bg-slate-900/75 px-1 rounded">
                                                    Ojos
                                                </span>
                                            </div>
                                            <div
                                                className="absolute left-1/2 -translate-x-1/2 rounded-full border border-dashed border-indigo-500/45"
                                                style={{
                                                    top: '13%',
                                                    width: '56%',
                                                    height: '46%',
                                                }}
                                            />
                                            <div
                                                className="absolute inset-x-3 h-[1px] border-t border-dotted border-cyan-500/50"
                                                style={{ top: '78%' }}
                                            />
                                        </div>
                                    )}

                                    {/* Cursor Circular en Vivo del Pincel Mágico */}
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

                                    {/* Superposición de Procesamiento Neuronal */}
                                    {(isRunningNeural || isRemovingBg) && (
                                        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[3px] flex flex-col items-center justify-center p-4 text-center z-30 select-none">
                                            <div
                                                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_18px_#22d3ee]"
                                                style={{
                                                    animation:
                                                        'studioLaserY 2.1s ease-in-out infinite alternate',
                                                }}
                                            />
                                            <div
                                                className="absolute inset-y-0 w-1 bg-gradient-to-b from-transparent via-indigo-400 to-transparent shadow-[0_0_18px_#818cf8]"
                                                style={{
                                                    animation:
                                                        'studioLaserX 2.1s ease-in-out infinite alternate',
                                                }}
                                            />
                                            <div className="size-12 rounded-2xl bg-indigo-500/25 border border-indigo-400/50 flex items-center justify-center mb-2.5 shadow-lg">
                                                <Loader2 className="size-6 text-amber-300 animate-spin" />
                                            </div>
                                            <p className="text-xs font-bold text-white">
                                                {isRemovingBg
                                                    ? __('Aislando silueta y hebras de cabello...')
                                                    : __('Agente Diseñador Procesando...')}
                                            </p>
                                            <p className="text-[10.5px] text-indigo-100 mt-1 leading-snug max-w-[205px]">
                                                {neuralStatusText ||
                                                    __('RMBG-1.4 + MODNet + Anti-Halos HD')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Selector Rápido de Fondo (1-Clic desde cualquier pestaña, 100% WYSIWYG) */}
                                <div className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-card border border-border shadow-xs flex items-center gap-1.5 flex-wrap justify-center">
                                    <span className="text-[10px] font-semibold text-muted-foreground mr-0.5">
                                        {__('Fondo')}:
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectQuickBackdrop('keep_original')}
                                        title={__('Conservar fondo original de la foto')}
                                        className={cn(
                                            'px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all',
                                            adj.bgMode === 'original'
                                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                                : 'border-border bg-muted/50 text-muted-foreground hover:text-foreground',
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
                                        const opt = STUDIO_BACKDROP_OPTIONS.find(
                                            (o) => o.id === presetId,
                                        );
                                        if (!opt) return null;
                                        const isSelected =
                                            adj.bgMode !== 'original' &&
                                            adj.backdropPreset === presetId;
                                        return (
                                            <button
                                                key={presetId}
                                                type="button"
                                                disabled={isRemovingBg || isRunningNeural}
                                                onClick={() => handleSelectQuickBackdrop(presetId)}
                                                title={opt.label}
                                                className={cn(
                                                    'size-5 rounded-full border transition-transform hover:scale-110',
                                                    isSelected
                                                        ? 'ring-2 ring-indigo-600 ring-offset-1 ring-offset-background border-indigo-600 scale-110'
                                                        : 'border-slate-400/60 dark:border-slate-600',
                                                )}
                                                style={{ background: opt.previewCss }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Vista Previa en Vivo Integrada sobre la Credencial Oficial MMM */}
                            {showLiveCardPreview && (
                                <div className="flex flex-col items-center">
                                    <span className="text-[10.5px] font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                                        <Eye className="size-3 text-indigo-600 dark:text-indigo-400" />
                                        {__('Así se verá en la Credencial Oficial')}
                                    </span>
                                    <div
                                        className="relative overflow-hidden rounded-xl border border-border shadow-lg bg-white"
                                        style={{ width: '299px', height: '190px' }}
                                    >
                                        <div
                                            style={{
                                                width: '680px',
                                                height: '432px',
                                                transform: 'scale(0.44)',
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
                                                        fontFamily:
                                                            "'Cocogoose', 'COCOGOOSE', sans-serif",
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
                                                        fontFamily:
                                                            "'Cocogoose', 'COCOGOOSE', sans-serif",
                                                    }}
                                                >
                                                    {(
                                                        pastor.nivel_ministerial ||
                                                        'MINISTRO ORDENADO'
                                                    ).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1.5 text-center max-w-[260px]">
                                        {__(
                                            'Simulación exacta a escala real (300+ DPI) sobre la plantilla activa.',
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Barra Flotante Inferior de Geometría Rápida */}
                        <div className="mt-2 p-2.5 rounded-xl bg-card border border-border shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const s = Math.max(0.55, Number((adj.scale - 0.1).toFixed(2)));
                                        const minPanY = s >= 1 ? -140.5 * (s - 1) : adj.panY;
                                        setAdj((prev) => ({
                                            ...prev,
                                            scale: s,
                                            panY: Math.max(minPanY, prev.panY),
                                        }));
                                    }}
                                    className="p-1 rounded bg-muted hover:bg-muted/80 text-foreground"
                                >
                                    <ZoomOut className="size-3.5" />
                                </button>
                                <input
                                    type="range"
                                    min="0.55"
                                    max="2.6"
                                    step="0.02"
                                    value={adj.scale}
                                    onChange={(e) => {
                                        const s = parseFloat(e.target.value);
                                        const minPanY = s >= 1 ? -140.5 * (s - 1) : adj.panY;
                                        setAdj((prev) => ({
                                            ...prev,
                                            scale: s,
                                            panY: Math.max(minPanY, prev.panY),
                                        }));
                                    }}
                                    onMouseUp={commitAdjHistory}
                                    className="w-28 sm:w-36 accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const s = Math.min(2.6, Number((adj.scale + 0.1).toFixed(2)));
                                        updateAdj('scale', s);
                                    }}
                                    className="p-1 rounded bg-muted hover:bg-muted/80 text-foreground"
                                >
                                    <ZoomIn className="size-3.5" />
                                </button>
                                <span className="font-mono text-[11px] text-foreground/80 w-11">
                                    {Math.round(adj.scale * 100)}%
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                    type="button"
                                    onClick={handleApplyBiometricFraming}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/12 hover:bg-indigo-500/20 border border-indigo-500/35 text-indigo-700 dark:text-indigo-200 text-[11px] font-semibold transition-colors"
                                    title={__('Centrar rostro y nivelar línea de los ojos con IA')}
                                >
                                    <Crosshair className="size-3 text-indigo-600 dark:text-cyan-300" />
                                    <span>{__('Auto-Encuadre IA')}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = { ...adj, flipX: !adj.flipX };
                                        setAdj(next);
                                        pushHistory(next, workingImgSrc, cutoutDataUrl);
                                    }}
                                    className={cn(
                                        'p-1.5 rounded-lg border transition-colors',
                                        adj.flipX
                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                            : 'bg-muted/60 border-border text-foreground/80 hover:bg-muted',
                                    )}
                                    title={__('Voltear horizontalmente (Espejo)')}
                                >
                                    <FlipHorizontal2 className="size-3.5" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = {
                                            ...adj,
                                            rotation: ((adj.rotation + 90 + 180) % 360) - 180,
                                        };
                                        setAdj(next);
                                        pushHistory(next, workingImgSrc, cutoutDataUrl);
                                    }}
                                    className="p-1.5 rounded-lg bg-muted/60 border border-border hover:bg-muted text-foreground/80"
                                    title={__('Girar 90°')}
                                >
                                    <RotateCw className="size-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* -------- ZONA DERECHA (5 cols): DOCK DEL AGENTE DISEÑADOR ADAPTABLE AL TEMA -------- */}
                    <div className="lg:col-span-5 flex flex-col min-h-0 bg-card text-card-foreground">
                        {/* Pestañas de Herramientas */}
                        <div className="grid grid-cols-4 gap-1 p-2 border-b border-border bg-muted/45 shrink-0">
                            {[
                                {
                                    id: 'agent' as StudioTab,
                                    label: __('Agente IA'),
                                    icon: Sparkles,
                                },
                                {
                                    id: 'cutout' as StudioTab,
                                    label: __('Fondo & Pincel'),
                                    icon: Scissors,
                                },
                                {
                                    id: 'light' as StudioTab,
                                    label: __('Luz & Color'),
                                    icon: Sun,
                                },
                                {
                                    id: 'biometric' as StudioTab,
                                    label: __('Encuadre'),
                                    icon: SlidersHorizontal,
                                },
                            ].map((t) => {
                                const Icon = t.icon;
                                const active = activeTab === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveTab(t.id);
                                            if (t.id !== 'cutout' && brushMode !== 'none') {
                                                setBrushMode('none');
                                            }
                                        }}
                                        className={cn(
                                            'flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-semibold transition-all',
                                            active
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-background/80',
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'size-3.5 shrink-0',
                                                active && t.id === 'agent' && 'text-amber-300',
                                            )}
                                        />
                                        <span className="truncate">{t.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Contenido Desplazable de la Pestaña Activa */}
                        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
                            {/* ================= PESTAÑA 1: AGENTE IA & RESTAURACIÓN ================= */}
                            {activeTab === 'agent' && (
                                <div className="space-y-4">
                                    {/* Tarjeta de Diagnóstico Fotográfico Inteligente */}
                                    <div className="p-3 rounded-xl bg-muted/35 dark:bg-slate-900/60 border border-border space-y-2.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={cn(
                                                        'size-11 rounded-xl border flex flex-col items-center justify-center shrink-0',
                                                        scoreColor,
                                                    )}
                                                >
                                                    {isAnalyzing ? (
                                                        <Loader2 className="size-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                                                    ) : (
                                                        <>
                                                            <span className="text-sm font-black leading-none">
                                                                {scoreValue ?? '--'}
                                                            </span>
                                                            <span className="text-[8px] uppercase opacity-75">
                                                                /100
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                        {isAnalyzing
                                                            ? __('Auditando fotografía con IA...')
                                                            : `${__('Diagnóstico')}: ${diagnosis?.grade || __('Listo')}`}
                                                    </p>
                                                    <p className="text-[10.5px] text-muted-foreground">
                                                        {diagnosis
                                                            ? `${diagnosis.dimensions.width}×${diagnosis.dimensions.height}px • Nitidez ${diagnosis.metrics.sharpness}%`
                                                            : __(
                                                                  'Inspección de rostro, iluminación, ruido y fondo',
                                                              )}
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={isAnalyzing || !workingImg}
                                                onClick={() =>
                                                    runAgentDiagnosis(
                                                        getWorkingImageDataUrl() || undefined,
                                                    )
                                                }
                                                className="h-7 px-2 text-[10.5px]"
                                            >
                                                {__('Re-auditar')}
                                            </Button>
                                        </div>

                                        {diagnosis?.findings && diagnosis.findings.length > 0 && (
                                            <div className="space-y-1.5 pt-2 border-t border-border max-h-28 overflow-y-auto pr-1">
                                                {diagnosis.findings.map((f, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-start gap-2 text-[10.5px] leading-snug"
                                                    >
                                                        {f.type === 'warning' ? (
                                                            <AlertTriangle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                                                        ) : f.type === 'ok' ? (
                                                            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                        ) : (
                                                            <Info className="size-3.5 text-indigo-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                                                        )}
                                                        <div>
                                                            <span className="font-semibold text-foreground">
                                                                {f.label}:
                                                            </span>{' '}
                                                            <span className="text-muted-foreground">
                                                                {f.detail}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* BOTÓN ESTRELLA: AUTO-DISEÑADOR MÁGICO 1-CLIC */}
                                    <button
                                        type="button"
                                        disabled={isRunningNeural || isSaving || !workingImg}
                                        onClick={() => handleRunNeuralDesigner('auto_magic')}
                                        className="w-full p-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:via-purple-500 hover:to-cyan-500 disabled:opacity-50 text-left shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="size-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                                                    {isRunningNeural ? (
                                                        <Loader2 className="size-5 text-amber-300 animate-spin" />
                                                    ) : (
                                                        <Wand2 className="size-5 text-amber-300" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-extrabold text-white tracking-wide">
                                                        {__('✨ Auto-Diseñador Mágico IA (1 Clic)')}
                                                    </p>
                                                    <p className="text-[10.5px] text-indigo-100 leading-tight mt-0.5">
                                                        {__(
                                                            'Restaura rostro (GFPGAN), remueve fondo sin halos, equilibra luz y alinea ojos.',
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Controles Minuciosos del Motor Neuronal Propio */}
                                    <div className="p-3.5 rounded-xl bg-muted/35 dark:bg-slate-900/60 border border-border space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-foreground">
                                                {__('Ajuste Fino del Motor Neuronal')}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="text-[9.5px] border-purple-500/40 text-purple-700 dark:text-purple-300 bg-purple-500/10"
                                            >
                                                GFPGAN v1.4 + ESRGAN
                                            </Badge>
                                        </div>

                                        <label className="flex items-center justify-between text-xs cursor-pointer">
                                            <span className="text-foreground/90 font-medium">
                                                {__('Restauración Facial Generativa')}
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={adj.faceRestore}
                                                onChange={(e) =>
                                                    updateAdj('faceRestore', e.target.checked)
                                                }
                                                className="accent-indigo-600 size-4 rounded"
                                            />
                                        </label>

                                        {adj.faceRestore && (
                                            <div className="space-y-2.5 pl-2.5 border-l-2 border-indigo-500/40">
                                                <StudioSlider
                                                    label={__(
                                                        'Intensidad / Fidelidad Facial (Identidad segura)',
                                                    )}
                                                    value={adj.faceStrength}
                                                    min={15}
                                                    max={95}
                                                    defaultValue={65}
                                                    unit="%"
                                                    onChange={(v) => updateAdj('faceStrength', v)}
                                                />
                                                <StudioSlider
                                                    label={__('Claridad de Ojos, Iris y Monturas')}
                                                    value={adj.eyeClarity}
                                                    min={0}
                                                    max={80}
                                                    defaultValue={28}
                                                    unit="%"
                                                    onChange={(v) => updateAdj('eyeClarity', v)}
                                                />
                                                <StudioSlider
                                                    label={__(
                                                        'Piel Natural (Separación de Frecuencias)',
                                                    )}
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
                                            label={__('Limpieza de Ruido ISO / WhatsApp')}
                                            value={adj.denoise}
                                            min={0}
                                            max={75}
                                            defaultValue={12}
                                            unit="%"
                                            onChange={(v) => updateAdj('denoise', v)}
                                        />

                                        <div className="pt-2 border-t border-border space-y-2">
                                            <label className="flex items-center justify-between text-xs cursor-pointer">
                                                <span className="text-foreground/90">
                                                    {__('Súper-Resolución Real-ESRGAN x4')}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={adj.upscale}
                                                    onChange={(e) =>
                                                        updateAdj('upscale', e.target.checked)
                                                    }
                                                    className="accent-indigo-600 size-4 rounded"
                                                />
                                            </label>

                                            <label className="flex items-center justify-between text-xs cursor-pointer">
                                                <span className="text-foreground/90">
                                                    {__(
                                                        'Aislar Fondo HD durante el procesado IA',
                                                    )}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={adj.neuralRemoveBg}
                                                    onChange={(e) =>
                                                        updateAdj(
                                                            'neuralRemoveBg',
                                                            e.target.checked,
                                                        )
                                                    }
                                                    className="accent-indigo-600 size-4 rounded"
                                                />
                                            </label>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            disabled={isRunningNeural || !workingImg}
                                            onClick={() => handleRunNeuralDesigner('custom_neural')}
                                            className="w-full h-8 text-xs font-bold border border-border hover:bg-indigo-600 hover:text-white transition-colors gap-1.5"
                                        >
                                            <Sparkles className="size-3.5 text-amber-500" />
                                            {__('Ejecutar Motor Neuronal con estos Parámetros')}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* ================= PESTAÑA 2: FONDO, BORDES & PINCEL MÁGICO ================= */}
                            {activeTab === 'cutout' && (
                                <div className="space-y-4">
                                    {/* Selector de Modo de Recorte */}
                                    <div className="p-3 rounded-xl bg-muted/35 dark:bg-slate-900/60 border border-border space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-bold text-foreground">
                                                {__('Aislamiento de Sujeto')}
                                            </span>
                                            <div className="flex bg-muted p-0.5 rounded-lg border border-border text-[10.5px]">
                                                {(
                                                    [
                                                        ['original', __('Original')],
                                                        ['ai_cutout', __('IA Studio HD')],
                                                        ['chroma', __('Croma Color')],
                                                    ] as const
                                                ).map(([modeKey, label]) => (
                                                    <button
                                                        key={modeKey}
                                                        type="button"
                                                        onClick={() => {
                                                            if (
                                                                modeKey === 'ai_cutout' &&
                                                                !cutoutCanvas
                                                            ) {
                                                                void handleStudioRemoveBackground();
                                                            } else {
                                                                const next = {
                                                                    ...adjRef.current,
                                                                    bgMode: modeKey,
                                                                };
                                                                setAdj(next);
                                                                pushHistory(
                                                                    next,
                                                                    workingImgSrc,
                                                                    cutoutDataUrl,
                                                                );
                                                            }
                                                        }}
                                                        className={cn(
                                                            'px-2 py-1 rounded-md font-semibold transition-colors',
                                                            adj.bgMode === modeKey
                                                                ? 'bg-indigo-600 text-white shadow-2xs'
                                                                : 'text-muted-foreground hover:text-foreground',
                                                        )}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={isRemovingBg || !workingImg}
                                            onClick={() => handleStudioRemoveBackground()}
                                            className="w-full h-9 text-xs font-bold gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
                                        >
                                            {isRemovingBg ? (
                                                <>
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                    <span>
                                                        {__(
                                                            'Recortando hebras de cabello con IA...',
                                                        )}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <Scissors className="size-3.5 text-amber-300" />
                                                    <span>
                                                        {cutoutCanvas
                                                            ? __(
                                                                  'Recalcular Recorte IA de Alta Precisión',
                                                              )
                                                            : __(
                                                                  'Remover Fondo HD (RMBG-1.4 + MODNet)',
                                                              )}
                                                    </span>
                                                </>
                                            )}
                                        </Button>

                                        {/* Controles de Refinamiento de Bordes y Anti-Halos */}
                                        {adj.bgMode === 'ai_cutout' && (
                                            <div className="space-y-2.5 pt-2 border-t border-border">
                                                <StudioSlider
                                                    label={__(
                                                        'Refinamiento Extra Anti-Halos (Defringe)',
                                                    )}
                                                    value={adj.defringe}
                                                    min={0}
                                                    max={100}
                                                    defaultValue={0}
                                                    unit="%"
                                                    onChange={(v) => updateAdj('defringe', v)}
                                                    onCommit={commitAdjHistory}
                                                />
                                                <StudioSlider
                                                    label={__(
                                                        'Ajuste de Contorno (Contraer / Expandir)',
                                                    )}
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

                                        {/* Controles de Croma Clásico */}
                                        {adj.bgMode === 'chroma' && (
                                            <div className="space-y-2.5 pt-2 border-t border-border">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-foreground/90">
                                                        {__('Color a eliminar:')}
                                                    </span>
                                                    <input
                                                        type="color"
                                                        value={adj.chromaColor}
                                                        onChange={(e) =>
                                                            updateAdj('chromaColor', e.target.value)
                                                        }
                                                        className="size-6 rounded cursor-pointer bg-transparent border border-border"
                                                    />
                                                </div>
                                                <StudioSlider
                                                    label={__('Tolerancia de Croma')}
                                                    value={adj.chromaTolerance}
                                                    min={5}
                                                    max={65}
                                                    defaultValue={24}
                                                    unit="%"
                                                    onChange={(v) =>
                                                        updateAdj('chromaTolerance', v)
                                                    }
                                                    onCommit={commitAdjHistory}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Pincel Mágico Manual (Borrar / Restaurar como Canva Pro) */}
                                    <div className="p-3 rounded-xl bg-muted/35 dark:bg-slate-900/60 border border-border space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                <Paintbrush className="size-3.5 text-indigo-600 dark:text-cyan-400" />
                                                {__('Pincel Mágico de Bordes')}
                                            </span>
                                            {hasBrushStrokes && (
                                                <button
                                                    type="button"
                                                    onClick={handleClearBrushStrokes}
                                                    className="text-[10.5px] text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                                                >
                                                    {__('Limpiar trazos')}
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-3 gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setBrushMode('none')}
                                                className={cn(
                                                    'py-1.5 px-2 rounded-lg text-[11px] font-semibold border flex items-center justify-center gap-1 transition-colors',
                                                    brushMode === 'none'
                                                        ? 'bg-foreground text-background border-foreground'
                                                        : 'bg-background border-border text-muted-foreground hover:text-foreground',
                                                )}
                                            >
                                                <Move className="size-3" />
                                                {__('Mover')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setBrushMode('erase')}
                                                className={cn(
                                                    'py-1.5 px-2 rounded-lg text-[11px] font-semibold border flex items-center justify-center gap-1 transition-colors',
                                                    brushMode === 'erase'
                                                        ? 'bg-rose-600 border-rose-600 text-white'
                                                        : 'bg-background border-border text-muted-foreground hover:text-rose-600',
                                                )}
                                            >
                                                <Eraser className="size-3" />
                                                {__('Borrar')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setBrushMode('restore')}
                                                className={cn(
                                                    'py-1.5 px-2 rounded-lg text-[11px] font-semibold border flex items-center justify-center gap-1 transition-colors',
                                                    brushMode === 'restore'
                                                        ? 'bg-emerald-600 border-emerald-600 text-white'
                                                        : 'bg-background border-border text-muted-foreground hover:text-emerald-600',
                                                )}
                                            >
                                                <Paintbrush className="size-3" />
                                                {__('Restaurar')}
                                            </button>
                                        </div>

                                        {brushMode !== 'none' && (
                                            <div className="space-y-2 pt-1">
                                                <StudioSlider
                                                    label={__('Tamaño del Pincel')}
                                                    value={brushSize}
                                                    min={6}
                                                    max={72}
                                                    defaultValue={22}
                                                    unit="px"
                                                    onChange={setBrushSize}
                                                />
                                                <StudioSlider
                                                    label={__('Suavidad del Borde')}
                                                    value={brushSoftness}
                                                    min={0}
                                                    max={95}
                                                    defaultValue={65}
                                                    unit="%"
                                                    onChange={setBrushSoftness}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Galería de Fondos de Estudio y Sombra 3D */}
                                    <div className="p-3 rounded-xl bg-muted/35 dark:bg-slate-900/60 border border-border space-y-3">
                                        <div>
                                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                <Layers className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                                                {__('Escenarios de Estudio & Sombra 3D')}
                                            </span>
                                            <p className="text-[10.5px] text-muted-foreground mt-0.5">
                                                {__(
                                                    'El fondo seleccionado se integra exactamente igual al guardar la foto.',
                                                )}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-5 gap-2">
                                            {STUDIO_BACKDROP_OPTIONS.map((opt) => {
                                                const selected =
                                                    adj.backdropPreset === opt.id &&
                                                    adj.bgMode !== 'original';
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        disabled={isRemovingBg || isRunningNeural}
                                                        onClick={() =>
                                                            handleSelectQuickBackdrop(opt.id)
                                                        }
                                                        title={opt.label}
                                                        className={cn(
                                                            'group flex flex-col items-center gap-1 p-1 rounded-lg border transition-all',
                                                            selected
                                                                ? 'border-indigo-600 bg-indigo-500/12 ring-1 ring-indigo-600'
                                                                : 'border-border bg-background/60 hover:border-indigo-400',
                                                        )}
                                                    >
                                                        <div
                                                            className="w-full h-7 rounded-md border border-slate-300 dark:border-slate-700 shadow-2xs"
                                                            style={{ background: opt.previewCss }}
                                                        />
                                                        <span className="text-[9px] text-foreground/85 font-medium truncate w-full text-center">
                                                            {opt.label.split(' ')[0]}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {(adj.backdropPreset === 'custom_solid' ||
                                            adj.backdropPreset === 'custom_gradient') && (
                                            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                                                <span className="text-muted-foreground text-[11px]">
                                                    {__('Color(es) de fondo:')}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={adj.customBgColor}
                                                        onChange={(e) =>
                                                            updateAdj(
                                                                'customBgColor',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="size-6 rounded cursor-pointer bg-transparent border border-border"
                                                    />
                                                    {adj.backdropPreset === 'custom_gradient' && (
                                                        <input
                                                            type="color"
                                                            value={adj.customBgSecondary}
                                                            onChange={(e) =>
                                                                updateAdj(
                                                                    'customBgSecondary',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className="size-6 rounded cursor-pointer bg-transparent border border-border"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2.5 pt-2 border-t border-border">
                                            <StudioSlider
                                                label={__('Sombra de Contacto 3D (Drop Shadow)')}
                                                value={adj.dropShadow}
                                                min={0}
                                                max={80}
                                                defaultValue={20}
                                                unit="%"
                                                onChange={(v) => updateAdj('dropShadow', v)}
                                                onCommit={commitAdjHistory}
                                            />
                                            <StudioSlider
                                                label={__('Luz de Recorte en Hombros (Rim Light)')}
                                                value={adj.rimLight}
                                                min={0}
                                                max={65}
                                                defaultValue={0}
                                                unit="%"
                                                onChange={(v) => updateAdj('rimLight', v)}
                                                onCommit={commitAdjHistory}
                                            />
                                            <StudioSlider
                                                label={__('Viñeta Suave de Estudio')}
                                                value={adj.vignette}
                                                min={0}
                                                max={50}
                                                defaultValue={0}
                                                unit="%"
                                                onChange={(v) => updateAdj('vignette', v)}
                                                onCommit={commitAdjHistory}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ================= PESTAÑA 3: CALIBRACIÓN DE LUZ Y COLOR (60 FPS) ================= */}
                            {activeTab === 'light' && (
                                <div className="space-y-4">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={handleApplyRecommendedGrading}
                                        className="w-full h-8 text-xs font-bold gap-1.5 bg-amber-500/12 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40"
                                    >
                                        <Wand2 className="size-3.5 text-amber-600 dark:text-amber-300" />
                                        {__('🪄 Auto-Calibrar Luz y Color según Diagnóstico IA')}
                                    </Button>

                                    {/* Preajustes de Estudio en 1 Clic */}
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {STUDIO_COLOR_PRESETS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => {
                                                    const next = {
                                                        ...adjRef.current,
                                                        ...preset.values,
                                                    };
                                                    setAdj(next);
                                                    pushHistory(
                                                        next,
                                                        workingImgSrc,
                                                        cutoutDataUrl,
                                                    );
                                                }}
                                                className="p-2 rounded-lg bg-muted/40 hover:bg-muted border border-border text-left transition-colors"
                                            >
                                                <p className="text-[10.5px] font-bold text-foreground truncate">
                                                    {preset.name}
                                                </p>
                                                {preset.badge && (
                                                    <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold">
                                                        {preset.badge}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Iluminación */}
                                    <div className="p-3 rounded-xl bg-muted/35 dark:bg-slate-900/60 border border-border space-y-2.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                                            {__('Iluminación de Estudio')}
                                        </span>
                                        <StudioSlider
                                            label={__('Exposición EV')}
                                            value={adj.exposure}
                                            min={-50}
                                            max={50}
                                            onChange={(v) => updateAdj('exposure', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-amber-500"
                                        />
                                        <StudioSlider
                                            label={__('Sombras / Luz de Relleno (Relight)')}
                                            value={adj.shadows}
                                            min={-60}
                                            max={60}
                                            onChange={(v) => updateAdj('shadows', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-amber-500"
                                        />
                                        <StudioSlider
                                            label={__('Altas Luces (Anti-Brillo Frente/Gafas)')}
                                            value={adj.highlights}
                                            min={-60}
                                            max={60}
                                            onChange={(v) => updateAdj('highlights', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-amber-500"
                                        />
                                        <StudioSlider
                                            label={__('Brillo')}
                                            value={adj.brightness}
                                            min={-50}
                                            max={50}
                                            onChange={(v) => updateAdj('brightness', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-amber-500"
                                        />
                                        <StudioSlider
                                            label={__('Contraste Dinámico')}
                                            value={adj.contrast}
                                            min={-50}
                                            max={50}
                                            onChange={(v) => updateAdj('contrast', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-amber-500"
                                        />
                                    </div>

                                    {/* Balance de Color */}
                                    <div className="p-3 rounded-xl bg-muted/35 dark:bg-slate-900/60 border border-border space-y-2.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 block">
                                            {__('Balance de Blancos & Tono de Piel')}
                                        </span>
                                        <StudioSlider
                                            label={__('Temperatura (Frío ↔ Cálido)')}
                                            value={adj.temperature}
                                            min={-60}
                                            max={60}
                                            onChange={(v) => updateAdj('temperature', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-cyan-600"
                                        />
                                        <StudioSlider
                                            label={__('Matiz (Verde ↔ Magenta)')}
                                            value={adj.tint}
                                            min={-50}
                                            max={50}
                                            onChange={(v) => updateAdj('tint', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-fuchsia-600"
                                        />
                                        <StudioSlider
                                            label={__('Vibrancia Inteligente (Piel protegida)')}
                                            value={adj.vibrance}
                                            min={-50}
                                            max={60}
                                            onChange={(v) => updateAdj('vibrance', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-emerald-600"
                                        />
                                        <StudioSlider
                                            label={__('Saturación Global')}
                                            value={adj.saturation}
                                            min={-60}
                                            max={60}
                                            onChange={(v) => updateAdj('saturation', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-emerald-600"
                                        />
                                    </div>

                                    {/* Detalle Óptico */}
                                    <div className="p-3 rounded-xl bg-muted/35 dark:bg-slate-900/60 border border-border space-y-2.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
                                            {__('Definición y Óptica')}
                                        </span>
                                        <StudioSlider
                                            label={__('Claridad (Presencia en Traje y Rasgos)')}
                                            value={adj.clarity}
                                            min={-30}
                                            max={60}
                                            onChange={(v) => updateAdj('clarity', v)}
                                            onCommit={commitAdjHistory}
                                        />
                                        <StudioSlider
                                            label={__('Nitidez Fina sin Halos')}
                                            value={adj.sharpness}
                                            min={0}
                                            max={60}
                                            onChange={(v) => updateAdj('sharpness', v)}
                                            onCommit={commitAdjHistory}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ================= PESTAÑA 4: BIOMETRÍA Y ENCUADRE FINO ================= */}
                            {activeTab === 'biometric' && (
                                <div className="space-y-4">
                                    <div className="p-3.5 rounded-xl bg-muted/35 dark:bg-slate-900/60 border border-border space-y-3">
                                        <span className="text-xs font-bold text-foreground block">
                                            {__('Alineación Biométrica Oficial MMM')}
                                        </span>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            {__(
                                                'Detecta la línea interpupilar mediante 5 puntos faciales para nivelar cualquier inclinación de cabeza y situar los ojos al 39.5% sin cortar los hombros.',
                                            )}
                                        </p>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleApplyBiometricFraming}
                                            className="w-full h-9 text-xs font-bold gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
                                        >
                                            <Crosshair className="size-4 text-cyan-200" />
                                            {__('🎯 Alinear Ojos y Encuadrar Automáticamente')}
                                        </Button>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-muted/35 dark:bg-slate-900/60 border border-border space-y-3">
                                        <span className="text-xs font-bold text-foreground block">
                                            {__('Geometría de Precisión')}
                                        </span>

                                        <StudioSlider
                                            label={__('Nivelación / Ángulo Fino')}
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
                                            label={__('Escala / Zoom')}
                                            value={Math.round(adj.scale * 100)}
                                            min={55}
                                            max={260}
                                            step={1}
                                            defaultValue={100}
                                            unit="%"
                                            onChange={(v) => updateAdj('scale', v / 100)}
                                            onCommit={commitAdjHistory}
                                        />

                                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                                            {[
                                                { label: '100% Base', val: 1.0 },
                                                { label: '120% Oficial', val: 1.2 },
                                                { label: '138% Retrato', val: 1.38 },
                                            ].map((p) => (
                                                <button
                                                    key={p.label}
                                                    type="button"
                                                    onClick={() => {
                                                        const next = {
                                                            ...adjRef.current,
                                                            scale: p.val,
                                                        };
                                                        setAdj(next);
                                                        pushHistory(
                                                            next,
                                                            workingImgSrc,
                                                            cutoutDataUrl,
                                                        );
                                                    }}
                                                    className="py-1.5 px-2 rounded-lg bg-background hover:bg-muted border border-border text-[10.5px] font-semibold text-foreground/85"
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
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
                                            }}
                                            className="w-full h-8 text-xs"
                                        >
                                            {__('Centrar posición y ángulo a 0°')}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pie de Confirmación del Estudio */}
                        <div className="p-3 border-t border-border bg-card flex items-center justify-between gap-2 shrink-0">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                disabled={isSaving || isRunningNeural}
                                className="text-xs text-muted-foreground hover:text-foreground h-9 px-3"
                            >
                                {__('Cancelar')}
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSavePhoto}
                                disabled={isSaving || isRunningNeural || !workingImg}
                                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs h-9 px-5 shadow-md shadow-emerald-600/20"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin" />
                                        <span>{__('Exportando Master HD...')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="size-3.5" />
                                        <Check className="size-3.5 -ml-1" />
                                        <span>{__('Guardar en Credencial Oficial')}</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
