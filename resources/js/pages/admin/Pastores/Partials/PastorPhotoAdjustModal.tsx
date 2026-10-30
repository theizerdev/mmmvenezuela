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
    accentClass = 'accent-indigo-500',
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
                        isModified ? 'text-indigo-300 font-semibold' : 'text-slate-300',
                    )}
                >
                    {label}
                </button>
                <div className="flex items-center gap-1.5">
                    <span
                        className={cn(
                            'font-mono text-[10.5px] px-1.5 py-0.5 rounded',
                            isModified
                                ? 'bg-indigo-500/20 text-indigo-200 font-bold'
                                : 'text-slate-400',
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
                            className="text-[9.5px] text-slate-500 hover:text-slate-200"
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
                    'w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer',
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

    // Imágenes base: original inicial (para comparador Antes/Después) e imagen activa de trabajo
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

    // Escala de visualización cómoda en el estudio (262 x 394 px en pantalla, renderizado interno 748 x 1124 HD)
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

                // Detectar color de esquina para croma opcional
                try {
                    const tmp = document.createElement('canvas');
                    tmp.width = img.width;
                    tmp.height = img.height;
                    const tCtx = tmp.getContext('2d');
                    if (tCtx) {
                        tCtx.drawImage(img, 0, 0);
                        const c = tCtx.getImageData(4, 4, 1, 1).data;
                        const hex =
                            '#' +
                            ((1 << 24) + (c[0] << 16) + (c[1] << 8) + c[2])
                                .toString(16)
                                .slice(1);
                        freshAdj.chromaColor = hex;
                        setAdj({ ...freshAdj });
                    }
                } catch {
                    // ignorar CORS
                }

                setHistory([
                    {
                        adjustments: { ...freshAdj },
                        activeImageSrc: photoUrl,
                        cutoutDataUrl: null,
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

            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const sourceDataUrl = getWorkingImageDataUrl();

            const optionsPayload =
                mode === 'auto_magic'
                    ? {
                          auto_pilot: true,
                          remove_bg: adj.neuralRemoveBg,
                          matting_mode: 'ensemble',
                          defringe: adj.defringe,
                          edge_feather: adj.edgeFeather,
                          edge_shift: adj.edgeShift,
                          face_restore: true,
                          bg_type: 'transparent',
                          drop_shadow: 0,
                          auto_frame: false, // conservamos el encuadre interactivo biométrico no destructivo en el lienzo
                      }
                    : {
                          auto_pilot: false,
                          remove_bg: adj.neuralRemoveBg,
                          matting_mode: 'ensemble',
                          defringe: adj.defringe,
                          edge_feather: adj.edgeFeather,
                          edge_shift: adj.edgeShift,
                          face_restore: adj.faceRestore,
                          face_strength: adj.faceStrength,
                          eye_clarity: adj.eyeClarity,
                          skin_smooth: adj.skinSmooth,
                          denoise: adj.denoise,
                          upscale: adj.upscale,
                          upscale_mode: adj.upscaleMode,
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

            const processedImg = await loadHtmlImage(outSrc);
            setWorkingImg(processedImg);
            setWorkingImgSrc(outSrc);
            initBrushMaskForImage(processedImg);

            // Si el motor neuronal removió el fondo (PNG RGBA transparente), registrarlo como cutout activo
            let newCutoutUrl: string | null = null;
            const steps: string[] = result.steps_applied || [];
            const didMatting = steps.includes('studio_matting') || Boolean(optionsPayload.remove_bg);

            const nextAdj: StudioAdjustments = {
                ...adj,
                // Al haber calibrado ya en servidor en modo auto_magic, dejar sliders en 0 para permitir retoque adicional limpio
                exposure: mode === 'auto_magic' ? 0 : adj.exposure,
                brightness: mode === 'auto_magic' ? 0 : adj.brightness,
                contrast: mode === 'auto_magic' ? 0 : adj.contrast,
                shadows: mode === 'auto_magic' ? 0 : adj.shadows,
                highlights: mode === 'auto_magic' ? 0 : adj.highlights,
                temperature: mode === 'auto_magic' ? 0 : adj.temperature,
                tint: mode === 'auto_magic' ? 0 : adj.tint,
                vibrance: mode === 'auto_magic' ? 0 : adj.vibrance,
                saturation: mode === 'auto_magic' ? 0 : adj.saturation,
                clarity: mode === 'auto_magic' ? 0 : adj.clarity,
                sharpness: mode === 'auto_magic' ? 0 : adj.sharpness,
            };

            // Aplicar encuadre biométrico sugerido si está disponible en modo Auto-Mágico
            const diag: AgentDiagnosis | null = result.diagnosis || diagnosis;
            if (mode === 'auto_magic' && diag?.biometric?.available) {
                nextAdj.rotation = diag.biometric.rotation_deg;
                nextAdj.scale = diag.biometric.ui_scale;
                nextAdj.panX = diag.biometric.ui_pan_x;
                nextAdj.panY = diag.biometric.ui_pan_y;
            }

            if (didMatting) {
                const c = document.createElement('canvas');
                c.width = processedImg.width;
                c.height = processedImg.height;
                c.getContext('2d')?.drawImage(processedImg, 0, 0);
                setCutoutCanvas(c);
                newCutoutUrl = outSrc;
                setCutoutDataUrl(outSrc);
                nextAdj.bgMode = 'ai_cutout';
                if (nextAdj.backdropPreset === 'transparent' && nextAdj.dropShadow === 0) {
                    nextAdj.dropShadow = 22;
                }
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
                description: __('Desliza la barra central para comparar el Antes y Después.'),
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
    const handleStudioRemoveBackground = async () => {
        if (!pastor || !workingImg) return;

        try {
            setIsRemovingBg(true);
            const sourceDataUrl = getWorkingImageDataUrl();
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            let cutCanvas: HTMLCanvasElement | null = null;
            let cutUrl: string | null = null;

            // 1. Intentar con el motor Python de Estudio (RMBG-1.4 + MODNet cabello + Guided Filter + Defringe)
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
                                defringe: adj.defringe,
                                edge_feather: adj.edgeFeather,
                                edge_shift: adj.edgeShift,
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

            // 2. Respaldo automático en navegador (MediaPipe Selfie Segmentation)
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
            const nextAdj: StudioAdjustments = {
                ...adj,
                bgMode: 'ai_cutout',
            };
            setAdj(nextAdj);
            pushHistory(nextAdj, workingImgSrc, cutUrl);
            toast.success(__('Fondo removido con precisión de estudio (cabello y bordes limpios).'));
        } catch (error) {
            console.error('Error al remover fondo:', error);
            toast.error(__('No se pudo remover el fondo con IA. Se activó el modo Croma manual.'));
            setAdj((prev) => ({ ...prev, bgMode: 'chroma' }));
        } finally {
            setIsRemovingBg(false);
        }
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
            const next = { ...adj, scale: 1.22, panX: 0, panY: 8, rotation: 0 };
            setAdj(next);
            pushHistory(next, workingImgSrc, cutoutDataUrl);
            toast.info(__('Encuadre estándar de credencial aplicado.'));
            return;
        }

        const b = diagnosis.biometric;
        const next: StudioAdjustments = {
            ...adj,
            rotation: b.rotation_deg,
            scale: b.ui_scale,
            panX: b.ui_pan_x,
            panY: b.ui_pan_y,
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
                    scale: adj.scale,
                    panX: adj.panX,
                    panY: adj.panY,
                    rotation: adj.rotation,
                    flipX: adj.flipX,
                },
            });
        }

        // Actualizar miniatura para la Vista Previa de la Credencial en Vivo (con debounce ligero)
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

        // Escalar radio del pincel de pantalla a espacio de imagen original
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

        setAdj((prev) => ({
            ...prev,
            panX: prev.panX + dx * (STUDIO_FRAME_W / DISPLAY_W),
            panY: prev.panY + dy * (STUDIO_FRAME_H / DISPLAY_H),
        }));
    };

    const handleCanvasPointerUp = () => {
        if (isInteractingRef.current) {
            isInteractingRef.current = false;
            if (brushMode === 'none') {
                pushHistory(adj, workingImgSrc, cutoutDataUrl);
            }
        }
    };

    const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.06 : -0.06;
        setAdj((prev) => ({
            ...prev,
            scale: Math.max(0.45, Math.min(3.0, Number((prev.scale + delta).toFixed(3)))),
        }));
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
    // GUARDAR FOTOGRAFÍA MASTER HD EN LA CREDENCIAL DEL PASTOR
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
                adjustments: adj,
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
            ? 'text-slate-400 border-slate-700'
            : scoreValue >= 85
              ? 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10'
              : scoreValue >= 68
                ? 'text-cyan-300 border-cyan-500/50 bg-cyan-500/10'
                : 'text-amber-300 border-amber-500/50 bg-amber-500/10';

    const updateAdj = <K extends keyof StudioAdjustments>(key: K, val: StudioAdjustments[K]) => {
        setAdj((prev) => ({ ...prev, [key]: val }));
    };

    const commitAdjHistory = () => {
        pushHistory(adj, workingImgSrc, cutoutDataUrl);
    };

    const pastorFullName = getPastorCarnetFullName(pastor, true);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isRunningNeural && !isSaving && onClose()}>
            <DialogContent className="sm:max-w-[1160px] max-w-[98vw] h-[92vh] max-h-[860px] p-0 gap-0 overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 shadow-2xl rounded-2xl flex flex-col [&>button]:hidden">
                {/* ==================== BARRA SUPERIOR DEL ESTUDIO ==================== */}
                <div className="px-4 py-2.5 border-b border-slate-800/90 bg-gradient-to-r from-slate-950 via-indigo-950/70 to-slate-950 flex flex-wrap items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 p-[1px] shrink-0 shadow-lg shadow-indigo-500/20">
                            <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center">
                                <Sparkles className="size-4 text-amber-300 fill-amber-300" />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <DialogTitle className="text-sm font-bold text-white tracking-tight truncate">
                                    MMM Studio AI — {__('Agente Diseñador Fotográfico')}
                                </DialogTitle>
                                <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] px-1.5 py-0 h-4 font-semibold">
                                    PRO LOCAL
                                </Badge>
                            </div>
                            <DialogDescription className="text-[11px] text-slate-400 truncate">
                                {pastor.nombres} {pastor.apellidos} • {formatDocumento(pastor.documento)}
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
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold text-xs transition-colors">
                                <Upload className="size-3.5 text-cyan-400" />
                                <span>{__('Subir Foto')}</span>
                            </div>
                        </label>

                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                            <button
                                type="button"
                                onClick={handleUndo}
                                disabled={historyIndex <= 0 || isRunningNeural}
                                title={__('Deshacer (Ctrl+Z)')}
                                className="p-1.5 rounded-md text-slate-300 hover:bg-slate-800 disabled:opacity-35 transition-colors"
                            >
                                <Undo2 className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleRedo}
                                disabled={historyIndex >= history.length - 1 || isRunningNeural}
                                title={__('Rehacer (Ctrl+Y)')}
                                className="p-1.5 rounded-md text-slate-300 hover:bg-slate-800 disabled:opacity-35 transition-colors"
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
                                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200',
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
                                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-semibold'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200',
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
                                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200',
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
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title={__('Restablecer todo al original')}
                        >
                            <RotateCcw className="size-3.5" />
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isRunningNeural || isSaving}
                            className="inline-flex items-center justify-center size-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>

                {/* ==================== CUERPO PRINCIPAL DE 2 ZONAS ==================== */}
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                    {/* -------- ZONA IZQUIERDA (7 cols): ESCENARIO INTERACTIVO + VISTA CARNET -------- */}
                    <div
                        ref={stageViewportRef}
                        className="lg:col-span-7 flex flex-col justify-between bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black border-b lg:border-b-0 lg:border-r border-slate-800/80 p-3 sm:p-4 overflow-y-auto"
                    >
                        {/* Animaciones del escáner neuronal */}
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
                            {/* Contenedor del Lienzo Oficial 187:281 */}
                            <div className="flex flex-col items-center">
                                <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-400">
                                    <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300">
                                        MASTER {STUDIO_MASTER_W}×{STUDIO_MASTER_H} PX (600+ DPI)
                                    </span>
                                    {brushMode !== 'none' && (
                                        <span
                                            className={cn(
                                                'px-2 py-0.5 rounded-full font-bold text-[10px] border',
                                                brushMode === 'erase'
                                                    ? 'bg-rose-500/20 text-rose-200 border-rose-500/40'
                                                    : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
                                            )}
                                        >
                                            {brushMode === 'erase'
                                                ? __('🖌️ Pincel: Borrando fondo')
                                                : __('🖌️ Pincel: Restaurando sujeto')}
                                        </span>
                                    )}
                                </div>

                                <div
                                    className={cn(
                                        'relative rounded-[21px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(79,70,229,0.35)] border-2 border-indigo-500/60 select-none',
                                        brushMode !== 'none'
                                            ? 'cursor-none'
                                            : 'cursor-grab active:cursor-grabbing',
                                    )}
                                    style={{
                                        width: `${DISPLAY_W}px`,
                                        height: `${DISPLAY_H}px`,
                                        backgroundImage:
                                            adj.bgMode !== 'original' &&
                                            adj.backdropPreset === 'transparent'
                                                ? 'linear-gradient(180deg, #cfd7e1 0%, #dbe1e8 45%, #c2cbd5 100%)'
                                                : `
                                                    linear-gradient(45deg, #1e293b 25%, transparent 25%),
                                                    linear-gradient(-45deg, #1e293b 25%, transparent 25%),
                                                    linear-gradient(45deg, transparent 75%, #1e293b 75%),
                                                    linear-gradient(-45deg, transparent 75%, #1e293b 75%)
                                                `,
                                        backgroundSize:
                                            adj.bgMode !== 'original' &&
                                            adj.backdropPreset === 'transparent'
                                                ? 'cover'
                                                : '14px 14px',
                                        backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0px',
                                        backgroundColor: '#0f172a',
                                    }}
                                    onMouseLeave={() => {
                                        handleCanvasPointerUp();
                                        setCursorPreview(null);
                                    }}
                                >
                                    {/* Lienzo Principal (Después / Editado) */}
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
                                                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-950/85 text-[9.5px] font-bold uppercase tracking-wider text-slate-300 border border-slate-700">
                                                    {__('Antes')}
                                                </span>
                                            </div>
                                            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-indigo-950/90 text-[9.5px] font-bold uppercase tracking-wider text-amber-300 border border-indigo-500/50 pointer-events-none">
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
                                                <div className="h-full w-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
                                                <div className="absolute size-6 rounded-full bg-white text-slate-950 shadow-lg flex items-center justify-center text-[10px] font-black border border-indigo-400">
                                                    ↔
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Guías Biométricas Oficiales de Carnet */}
                                    {showBiometricGuides && !isRunningNeural && (
                                        <div className="absolute inset-0 pointer-events-none z-10">
                                            {/* Eje vertical de simetría */}
                                            <div className="absolute inset-y-0 left-1/2 w-[1px] border-l border-dashed border-cyan-400/45" />
                                            {/* Margen superior coronilla (11%) */}
                                            <div
                                                className="absolute inset-x-4 h-[1px] border-t border-dotted border-cyan-300/35"
                                                style={{ top: '11%' }}
                                            />
                                            {/* Línea áurea de los ojos (39.5%) */}
                                            <div
                                                className="absolute inset-x-0 flex items-center"
                                                style={{ top: '39.5%' }}
                                            >
                                                <div className="w-full h-[1px] bg-cyan-400/60 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
                                                <span className="absolute right-1.5 -top-3.5 text-[8.5px] font-bold uppercase tracking-wider text-cyan-200 bg-slate-950/75 px-1 rounded">
                                                    Ojos
                                                </span>
                                            </div>
                                            {/* Óvalo guía craneal */}
                                            <div
                                                className="absolute left-1/2 -translate-x-1/2 rounded-full border border-dashed border-indigo-300/35"
                                                style={{
                                                    top: '13%',
                                                    width: '56%',
                                                    height: '46%',
                                                }}
                                            />
                                            {/* Zona de hombros (78%) */}
                                            <div
                                                className="absolute inset-x-3 h-[1px] border-t border-dotted border-cyan-300/35"
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
                                                    ? 'border-rose-400 bg-rose-500/15'
                                                    : 'border-emerald-400 bg-emerald-500/15',
                                            )}
                                            style={{
                                                left: `${cursorPreview.x}px`,
                                                top: `${cursorPreview.y}px`,
                                                width: `${brushSize}px`,
                                                height: `${brushSize}px`,
                                            }}
                                        />
                                    )}

                                    {/* Superposición de Procesamiento Neuronal en Tiempo Real */}
                                    {(isRunningNeural || isRemovingBg) && (
                                        <div className="absolute inset-0 bg-slate-950/82 backdrop-blur-[3px] flex flex-col items-center justify-center p-4 text-center z-30 select-none">
                                            <div
                                                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_18px_#22d3ee]"
                                                style={{
                                                    animation:
                                                        'studioLaserY 2.1s ease-in-out infinite alternate',
                                                }}
                                            />
                                            <div
                                                className="absolute inset-y-0 w-1 bg-gradient-to-b from-transparent via-fuchsia-400 to-transparent shadow-[0_0_18px_#e879f9]"
                                                style={{
                                                    animation:
                                                        'studioLaserX 2.1s ease-in-out infinite alternate',
                                                }}
                                            />
                                            <div className="size-12 rounded-2xl bg-indigo-500/25 border border-indigo-400/50 flex items-center justify-center mb-2.5 shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                                                <Loader2 className="size-6 text-amber-300 animate-spin" />
                                            </div>
                                            <p className="text-xs font-bold text-white">
                                                {isRemovingBg
                                                    ? __('Aislando silueta y hebras de cabello...')
                                                    : __('Agente Diseñador Procesando...')}
                                            </p>
                                            <p className="text-[10.5px] text-cyan-200/90 mt-1 leading-snug max-w-[200px]">
                                                {neuralStatusText ||
                                                    __('RMBG-1.4 + MODNet + Guided Filter Anti-Halos')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Vista Previa en Vivo Integrada sobre la Credencial Oficial MMM */}
                            {showLiveCardPreview && (
                                <div className="flex flex-col items-center">
                                    <span className="text-[10.5px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                                        <Eye className="size-3 text-indigo-400" />
                                        {__('Vista en Vivo en Credencial Oficial')}
                                    </span>
                                    <div
                                        className="relative overflow-hidden rounded-xl border border-slate-700/80 shadow-xl bg-white"
                                        style={{ width: '299px', height: '190px' }}
                                    >
                                        {/* Escala 0.44 exacta respecto al diseño 680x432 */}
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
                                    <p className="text-[10px] text-slate-500 mt-1.5 text-center max-w-[260px]">
                                        {__(
                                            'Simulación exacta del marco plateado e identidad tipográfica a 300 DPI.',
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Barra Flotante Inferior de Geometría Rápida */}
                        <div className="mt-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const s = Math.max(0.45, Number((adj.scale - 0.1).toFixed(2)));
                                        updateAdj('scale', s);
                                    }}
                                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                                >
                                    <ZoomOut className="size-3.5" />
                                </button>
                                <input
                                    type="range"
                                    min="0.45"
                                    max="2.6"
                                    step="0.02"
                                    value={adj.scale}
                                    onChange={(e) => updateAdj('scale', parseFloat(e.target.value))}
                                    onMouseUp={commitAdjHistory}
                                    className="w-28 sm:w-36 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const s = Math.min(2.6, Number((adj.scale + 0.1).toFixed(2)));
                                        updateAdj('scale', s);
                                    }}
                                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                                >
                                    <ZoomIn className="size-3.5" />
                                </button>
                                <span className="font-mono text-[11px] text-slate-300 w-11">
                                    {Math.round(adj.scale * 100)}%
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                    type="button"
                                    onClick={handleApplyBiometricFraming}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 text-[11px] font-semibold transition-colors"
                                    title={__('Centrar rostro y nivelar línea de los ojos con IA')}
                                >
                                    <Crosshair className="size-3 text-cyan-300" />
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
                                        'p-1.5 rounded-lg border text-slate-300 transition-colors',
                                        adj.flipX
                                            ? 'bg-indigo-600 border-indigo-500 text-white'
                                            : 'bg-slate-800 border-slate-700 hover:bg-slate-700',
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
                                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300"
                                    title={__('Girar 90°')}
                                >
                                    <RotateCw className="size-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* -------- ZONA DERECHA (5 cols): DOCK DEL AGENTE DISEÑADOR -------- */}
                    <div className="lg:col-span-5 flex flex-col min-h-0 bg-slate-900/75">
                        {/* Pestañas de Herramientas */}
                        <div className="grid grid-cols-4 gap-1 p-2 border-b border-slate-800 bg-slate-950/70 shrink-0">
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
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70',
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
                                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={cn(
                                                        'size-11 rounded-xl border flex flex-col items-center justify-center shrink-0',
                                                        scoreColor,
                                                    )}
                                                >
                                                    {isAnalyzing ? (
                                                        <Loader2 className="size-4 animate-spin text-indigo-400" />
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
                                                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                                        {isAnalyzing
                                                            ? __('Auditando fotografía con IA...')
                                                            : `${__('Diagnóstico')}: ${diagnosis?.grade || __('Listo')}`}
                                                    </p>
                                                    <p className="text-[10.5px] text-slate-400">
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
                                                className="h-7 px-2 text-[10.5px] bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                                            >
                                                {__('Re-auditar')}
                                            </Button>
                                        </div>

                                        {diagnosis?.findings && diagnosis.findings.length > 0 && (
                                            <div className="space-y-1.5 pt-1 border-t border-slate-800/80 max-h-28 overflow-y-auto pr-1">
                                                {diagnosis.findings.map((f, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-start gap-2 text-[10.5px] leading-snug"
                                                    >
                                                        {f.type === 'warning' ? (
                                                            <AlertTriangle className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                                                        ) : f.type === 'ok' ? (
                                                            <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                                        ) : (
                                                            <Info className="size-3.5 text-cyan-400 shrink-0 mt-0.5" />
                                                        )}
                                                        <div>
                                                            <span className="font-semibold text-slate-200">
                                                                {f.label}:
                                                            </span>{' '}
                                                            <span className="text-slate-400">
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
                                        className="w-full p-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:via-purple-500 hover:to-cyan-500 disabled:opacity-50 text-left shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] group"
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
                                                    <p className="text-[10.5px] text-indigo-100/90 leading-tight mt-0.5">
                                                        {__(
                                                            'Restaura rostro (GFPGAN), remueve fondo (cabello HD), equilibra luz y alinea ojos.',
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Controles Minuciosos del Motor Neuronal Propio */}
                                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-200">
                                                {__('Ajuste Fino del Motor Neuronal')}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="text-[9.5px] border-purple-500/40 text-purple-300"
                                            >
                                                GFPGAN v1.4 + ESRGAN
                                            </Badge>
                                        </div>

                                        <label className="flex items-center justify-between text-xs cursor-pointer">
                                            <span className="text-slate-300">
                                                {__('Restauración Facial Generativa')}
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={adj.faceRestore}
                                                onChange={(e) =>
                                                    updateAdj('faceRestore', e.target.checked)
                                                }
                                                className="accent-indigo-500 size-4 rounded"
                                            />
                                        </label>

                                        {adj.faceRestore && (
                                            <div className="space-y-2.5 pl-2 border-l-2 border-indigo-500/40">
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

                                        <div className="pt-1 border-t border-slate-800/80 space-y-2">
                                            <label className="flex items-center justify-between text-xs cursor-pointer">
                                                <span className="text-slate-300">
                                                    {__('Súper-Resolución Real-ESRGAN x4')}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={adj.upscale}
                                                    onChange={(e) =>
                                                        updateAdj('upscale', e.target.checked)
                                                    }
                                                    className="accent-indigo-500 size-4 rounded"
                                                />
                                            </label>

                                            <label className="flex items-center justify-between text-xs cursor-pointer">
                                                <span className="text-slate-300">
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
                                                    className="accent-indigo-500 size-4 rounded"
                                                />
                                            </label>
                                        </div>

                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={isRunningNeural || !workingImg}
                                            onClick={() => handleRunNeuralDesigner('custom_neural')}
                                            className="w-full h-8 text-xs font-bold bg-slate-800 hover:bg-indigo-600 text-white border border-slate-700 transition-colors gap-1.5"
                                        >
                                            <Sparkles className="size-3.5 text-amber-300" />
                                            {__('Ejecutar Motor Neuronal con estos Parámetros')}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* ================= PESTAÑA 2: FONDO, BORDES & PINCEL MÁGICO ================= */}
                            {activeTab === 'cutout' && (
                                <div className="space-y-4">
                                    {/* Selector de Modo de Recorte */}
                                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-white">
                                                {__('Aislamiento de Sujeto')}
                                            </span>
                                            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10.5px]">
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
                                                                    ...adj,
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
                                                                ? 'bg-indigo-600 text-white'
                                                                : 'text-slate-400 hover:text-white',
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
                                            onClick={handleStudioRemoveBackground}
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
                                            <div className="space-y-2.5 pt-2 border-t border-slate-800">
                                                <StudioSlider
                                                    label={__(
                                                        'Descontaminar Halos de Color (Defringe)',
                                                    )}
                                                    value={adj.defringe}
                                                    min={0}
                                                    max={100}
                                                    defaultValue={65}
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
                                            <div className="space-y-2.5 pt-2 border-t border-slate-800">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-300">
                                                        {__('Color a eliminar:')}
                                                    </span>
                                                    <input
                                                        type="color"
                                                        value={adj.chromaColor}
                                                        onChange={(e) =>
                                                            updateAdj('chromaColor', e.target.value)
                                                        }
                                                        className="size-6 rounded cursor-pointer bg-transparent border border-slate-700"
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
                                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                                <Paintbrush className="size-3.5 text-cyan-400" />
                                                {__('Pincel Mágico de Bordes')}
                                            </span>
                                            {hasBrushStrokes && (
                                                <button
                                                    type="button"
                                                    onClick={handleClearBrushStrokes}
                                                    className="text-[10.5px] text-rose-400 hover:text-rose-300 font-medium"
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
                                                    'py-1.5 px-2 rounded-lg text-[11px] font-semibold border flex items-center justify-center gap-1',
                                                    brushMode === 'none'
                                                        ? 'bg-slate-800 border-slate-600 text-white'
                                                        : 'bg-slate-900 border-slate-800 text-slate-400',
                                                )}
                                            >
                                                <Move className="size-3" />
                                                {__('Mover')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setBrushMode('erase')}
                                                className={cn(
                                                    'py-1.5 px-2 rounded-lg text-[11px] font-semibold border flex items-center justify-center gap-1',
                                                    brushMode === 'erase'
                                                        ? 'bg-rose-600 border-rose-500 text-white'
                                                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-300',
                                                )}
                                            >
                                                <Eraser className="size-3" />
                                                {__('Borrar')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setBrushMode('restore')}
                                                className={cn(
                                                    'py-1.5 px-2 rounded-lg text-[11px] font-semibold border flex items-center justify-center gap-1',
                                                    brushMode === 'restore'
                                                        ? 'bg-emerald-600 border-emerald-500 text-white'
                                                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-300',
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
                                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <Layers className="size-3.5 text-indigo-400" />
                                            {__('Escenarios de Estudio & Sombra 3D')}
                                        </span>

                                        <div className="grid grid-cols-5 gap-2">
                                            {STUDIO_BACKDROP_OPTIONS.map((opt) => {
                                                const selected =
                                                    adj.backdropPreset === opt.id &&
                                                    adj.bgMode !== 'original';
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        onClick={() => {
                                                            if (
                                                                adj.bgMode === 'original' &&
                                                                !cutoutCanvas
                                                            ) {
                                                                updateAdj('backdropPreset', opt.id);
                                                                void handleStudioRemoveBackground();
                                                            } else {
                                                                const next: StudioAdjustments = {
                                                                    ...adj,
                                                                    bgMode:
                                                                        adj.bgMode === 'original'
                                                                            ? 'ai_cutout'
                                                                            : adj.bgMode,
                                                                    backdropPreset: opt.id,
                                                                };
                                                                setAdj(next);
                                                                pushHistory(
                                                                    next,
                                                                    workingImgSrc,
                                                                    cutoutDataUrl,
                                                                );
                                                            }
                                                        }}
                                                        title={opt.label}
                                                        className={cn(
                                                            'group flex flex-col items-center gap-1 p-1 rounded-lg border transition-all',
                                                            selected
                                                                ? 'border-indigo-400 bg-indigo-500/15 ring-1 ring-indigo-400'
                                                                : 'border-slate-800 hover:border-slate-600',
                                                        )}
                                                    >
                                                        <div
                                                            className="w-full h-7 rounded-md border border-black/20 shadow-inner"
                                                            style={{ background: opt.previewCss }}
                                                        />
                                                        <span className="text-[9px] text-slate-300 truncate w-full text-center">
                                                            {opt.label.split(' ')[0]}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {(adj.backdropPreset === 'custom_solid' ||
                                            adj.backdropPreset === 'custom_gradient') && (
                                            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                                                <span className="text-slate-400 text-[11px]">
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
                                                        className="size-6 rounded cursor-pointer bg-transparent"
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
                                                            className="size-6 rounded cursor-pointer bg-transparent"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2.5 pt-2 border-t border-slate-800">
                                            <StudioSlider
                                                label={__('Sombra de Contacto 3D (Drop Shadow)')}
                                                value={adj.dropShadow}
                                                min={0}
                                                max={80}
                                                defaultValue={22}
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
                                        onClick={handleApplyRecommendedGrading}
                                        className="w-full h-8 text-xs font-bold gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40"
                                    >
                                        <Wand2 className="size-3.5 text-amber-300" />
                                        {__('🪄 Auto-Calibrar Luz y Color según Diagnóstico IA')}
                                    </Button>

                                    {/* Preajustes de Estudio en 1 Clic */}
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {STUDIO_COLOR_PRESETS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => {
                                                    const next = { ...adj, ...preset.values };
                                                    setAdj(next);
                                                    pushHistory(
                                                        next,
                                                        workingImgSrc,
                                                        cutoutDataUrl,
                                                    );
                                                }}
                                                className="p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
                                            >
                                                <p className="text-[10.5px] font-bold text-slate-200 truncate">
                                                    {preset.name}
                                                </p>
                                                {preset.badge && (
                                                    <span className="text-[9px] text-indigo-400 font-semibold">
                                                        {preset.badge}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Iluminación */}
                                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90 block">
                                            {__('Iluminación de Estudio')}
                                        </span>
                                        <StudioSlider
                                            label={__('Exposición EV')}
                                            value={adj.exposure}
                                            min={-50}
                                            max={50}
                                            onChange={(v) => updateAdj('exposure', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-amber-400"
                                        />
                                        <StudioSlider
                                            label={__('Sombras / Luz de Relleno (Relight)')}
                                            value={adj.shadows}
                                            min={-60}
                                            max={60}
                                            onChange={(v) => updateAdj('shadows', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-amber-400"
                                        />
                                        <StudioSlider
                                            label={__('Altas Luces (Anti-Brillo Frente/Gafas)')}
                                            value={adj.highlights}
                                            min={-60}
                                            max={60}
                                            onChange={(v) => updateAdj('highlights', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-amber-400"
                                        />
                                        <StudioSlider
                                            label={__('Brillo')}
                                            value={adj.brightness}
                                            min={-50}
                                            max={50}
                                            onChange={(v) => updateAdj('brightness', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-amber-400"
                                        />
                                        <StudioSlider
                                            label={__('Contraste Dinámico')}
                                            value={adj.contrast}
                                            min={-50}
                                            max={50}
                                            onChange={(v) => updateAdj('contrast', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-amber-400"
                                        />
                                    </div>

                                    {/* Balance de Color */}
                                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300/90 block">
                                            {__('Balance de Blancos & Tono de Piel')}
                                        </span>
                                        <StudioSlider
                                            label={__('Temperatura (Frío ↔ Cálido)')}
                                            value={adj.temperature}
                                            min={-60}
                                            max={60}
                                            onChange={(v) => updateAdj('temperature', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-cyan-400"
                                        />
                                        <StudioSlider
                                            label={__('Matiz (Verde ↔ Magenta)')}
                                            value={adj.tint}
                                            min={-50}
                                            max={50}
                                            onChange={(v) => updateAdj('tint', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-fuchsia-400"
                                        />
                                        <StudioSlider
                                            label={__('Vibrancia Inteligente (Piel protegida)')}
                                            value={adj.vibrance}
                                            min={-50}
                                            max={60}
                                            onChange={(v) => updateAdj('vibrance', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-emerald-400"
                                        />
                                        <StudioSlider
                                            label={__('Saturación Global')}
                                            value={adj.saturation}
                                            min={-60}
                                            max={60}
                                            onChange={(v) => updateAdj('saturation', v)}
                                            onCommit={commitAdjHistory}
                                            accentClass="accent-emerald-400"
                                        />
                                    </div>

                                    {/* Detalle Óptico */}
                                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300/90 block">
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
                                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                                        <span className="text-xs font-bold text-white block">
                                            {__('Alineación Biométrica Oficial MMM')}
                                        </span>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            {__(
                                                'Detecta la línea interpupilar mediante 5 puntos faciales para nivelar cualquier inclinación de cabeza y situar los ojos al 39.5% del marco oficial.',
                                            )}
                                        </p>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleApplyBiometricFraming}
                                            className="w-full h-9 text-xs font-bold gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
                                        >
                                            <Crosshair className="size-4 text-cyan-300" />
                                            {__('🎯 Alinear Ojos y Encuadrar Automáticamente')}
                                        </Button>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                                        <span className="text-xs font-bold text-white block">
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
                                            min={45}
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
                                                        const next = { ...adj, scale: p.val };
                                                        setAdj(next);
                                                        pushHistory(
                                                            next,
                                                            workingImgSrc,
                                                            cutoutDataUrl,
                                                        );
                                                    }}
                                                    className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10.5px] font-semibold text-slate-300"
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
                                                    ...adj,
                                                    scale: 1,
                                                    panX: 0,
                                                    panY: 0,
                                                    rotation: 0,
                                                    flipX: false,
                                                };
                                                setAdj(next);
                                                pushHistory(next, workingImgSrc, cutoutDataUrl);
                                            }}
                                            className="w-full h-8 text-xs bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                                        >
                                            {__('Centrar posición y ángulo a 0°')}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pie de Confirmación del Estudio */}
                        <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-2 shrink-0">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                disabled={isSaving || isRunningNeural}
                                className="text-xs text-slate-400 hover:text-white h-9 px-3"
                            >
                                {__('Cancelar')}
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSavePhoto}
                                disabled={isSaving || isRunningNeural || !workingImg}
                                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs h-9 px-5 shadow-lg shadow-emerald-600/20"
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
