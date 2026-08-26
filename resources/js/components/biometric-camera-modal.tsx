import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Camera,
    SwitchCamera,
    X,
    Check,
    RotateCcw,
    AlertTriangle,
    CheckCircle2,
    Sparkles,
    Loader2,
    Sun,
    Maximize2,
    SlidersHorizontal,
    IdCard,
    User
} from 'lucide-react';

export type BiometricMode = 'foto' | 'foto_cedula';

export interface BiometricCaptureResult {
    dataUrl: string;
    sizeKb: number;
    width: number;
    height: number;
    mode: BiometricMode;
}

interface BiometricCameraModalProps {
    isOpen: boolean;
    mode: BiometricMode;
    onClose: () => void;
    onCapture: (result: BiometricCaptureResult) => void;
    initialFacingMode?: 'user' | 'environment';
}

type StatusColor = 'red' | 'yellow' | 'green';

interface AnalysisFeedback {
    color: StatusColor;
    message: string;
    score: number; // 0 to 100
    details?: {
        faceDetected: boolean;
        brightnessOk: boolean;
        centered: boolean;
        sizeOk: boolean;
        blurOk: boolean;
    };
}

/**
 * Aplica procesamiento y realce automático inteligente a la imagen capturada o subida.
 * Mejora nitidez, contraste dinámico, iluminación y balance de color según el modo (Cédula o Foto de Pastor).
 */
export function enhanceImageCanvas(
    sourceCanvas: HTMLCanvasElement,
    mode: BiometricMode = 'foto'
): HTMLCanvasElement {
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    const destCanvas = document.createElement('canvas');
    destCanvas.width = width;
    destCanvas.height = height;
    const ctx = destCanvas.getContext('2d');
    if (!ctx) return sourceCanvas;

    // 1. Ajuste fino de color, brillo y contraste mediante filtros de renderizado
    ctx.save();
    if (mode === 'foto') {
        // Foto de Perfil / Carnet: Brillo equilibrado, ligera corrección de sombras y tonos de piel vivos y naturales
        ctx.filter = 'brightness(1.05) contrast(1.08) saturate(1.06)';
    } else {
        // Cédula de Identidad: Alto contraste de texto, corrección de fondo blanco y saturación de sellos/banderas
        ctx.filter = 'brightness(1.06) contrast(1.22) saturate(1.12)';
    }
    ctx.drawImage(sourceCanvas, 0, 0, width, height);
    ctx.restore();

    // 2. Filtro Convolucional de Realce de Nitidez (Unsharp Masking Inteligente)
    try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const copyData = new Uint8ClampedArray(data);

        // Intensidad adaptativa: mayor para texto de cédula, sutil para piel humana
        const strength = mode === 'foto_cedula' ? 0.35 : 0.20;
        const centerWeight = 1 + 4 * strength;

        for (let y = 1; y < height - 1; y++) {
            const rowOffset = y * width * 4;
            const prevRow = (y - 1) * width * 4;
            const nextRow = (y + 1) * width * 4;

            for (let x = 1; x < width - 1; x++) {
                const idx = rowOffset + x * 4;
                const idxLeft = rowOffset + (x - 1) * 4;
                const idxRight = rowOffset + (x + 1) * 4;
                const idxUp = prevRow + x * 4;
                const idxDown = nextRow + x * 4;

                for (let c = 0; c < 3; c++) {
                    const center = copyData[idx + c];
                    const up = copyData[idxUp + c];
                    const down = copyData[idxDown + c];
                    const left = copyData[idxLeft + c];
                    const right = copyData[idxRight + c];

                    const sharpened = center * centerWeight - (up + down + left + right) * strength;
                    data[idx + c] = Math.min(255, Math.max(0, sharpened));
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);
    } catch (e) {
        // Continuar de forma segura si la lectura de imagen está restringida
    }

    return destCanvas;
}

/**
 * Optimiza, mejora y comprime agresivamente una imagen a tamaño liviano (KB)
 * Reduciendo cualquier imagen de 4MB+ a un rango óptimo de 100KB - 350KB con realce automático.
 */
export async function optimizeAndCompressImage(
    source: string | HTMLCanvasElement | HTMLImageElement,
    maxWidth = 1000,
    maxHeight = 1333, // 3:4 proporción típica de carnet
    targetMaxKb = 400,
    autoEnhance = true,
    mode: BiometricMode = 'foto'
): Promise<{ dataUrl: string; sizeKb: number; width: number; height: number }> {
    return new Promise((resolve) => {
        const processImage = (img: HTMLImageElement | HTMLCanvasElement) => {
            let width = img.width || (img as HTMLImageElement).naturalWidth;
            let height = img.height || (img as HTMLImageElement).naturalHeight;

            // Escalar manteniendo proporción
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            let canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve({ dataUrl: typeof source === 'string' ? source : '', sizeKb: 0, width, height });
                return;
            }

            // Fondo blanco limpio para evitar transparencias
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            // Aplicar realce inteligente (nitidez, contraste, balance de color)
            if (autoEnhance) {
                canvas = enhanceImageCanvas(canvas, mode);
            }

            // Bucle de compresión iterativo para garantizar < targetMaxKb (ej. < 400KB)
            let quality = 0.86;
            let resultDataUrl = canvas.toDataURL('image/jpeg', quality);
            let sizeBytes = Math.round((resultDataUrl.length * 3) / 4);

            while (sizeBytes > targetMaxKb * 1024 && quality > 0.45) {
                quality -= 0.08;
                resultDataUrl = canvas.toDataURL('image/jpeg', quality);
                sizeBytes = Math.round((resultDataUrl.length * 3) / 4);
            }

            const sizeKb = Math.round(sizeBytes / 1024);
            resolve({ dataUrl: resultDataUrl, sizeKb, width, height });
        };

        if (source instanceof HTMLCanvasElement) {
            processImage(source);
        } else if (source instanceof HTMLImageElement) {
            if (source.complete) {
                processImage(source);
            } else {
                source.onload = () => processImage(source);
            }
        } else if (typeof source === 'string') {
            const img = new Image();
            img.onload = () => processImage(img);
            img.onerror = () => resolve({ dataUrl: source, sizeKb: 0, width: 0, height: 0 });
            img.src = source;
        }
    });
}

export default function BiometricCameraModal({
    isOpen,
    mode,
    onClose,
    onCapture,
    initialFacingMode,
}: BiometricCameraModalProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const guideFrameRef = useRef<HTMLDivElement | null>(null);

    // Estados de configuración de cámara
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
        initialFacingMode || (mode === 'foto' ? 'user' : 'environment')
    );
    const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

    // Estados del ciclo de IA y video
    const [isModelsLoaded, setIsModelsLoaded] = useState<boolean>(false);
    const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // Feedback en tiempo real (Rojo, Amarillo, Verde)
    const [feedback, setFeedback] = useState<AnalysisFeedback>({
        color: 'red',
        message: 'Iniciando detector biométrico...',
        score: 0,
    });

    // Auto-captura y cuenta regresiva
    const [autoCaptureEnabled, setAutoCaptureEnabled] = useState<boolean>(true);
    const [countdown, setCountdown] = useState<number | null>(null);
    const greenStreakRef = useRef<number>(0);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Foto capturada para vista previa y confirmación
    const [previewResult, setPreviewResult] = useState<BiometricCaptureResult | null>(null);
    const [isProcessingCapture, setIsProcessingCapture] = useState<boolean>(false);
    const [flashEffect, setFlashEffect] = useState<boolean>(false);

    // Referencia dinámica de Google MediaPipe FaceLandmarker para evitar errores en SSR
    const mediaPipeLandmarkerRef = useRef<any>(null);

    // 1. Cargar Google MediaPipe FaceLandmarker (Ultra rápido por WebAssembly / GPU)
    useEffect(() => {
        let isMounted = true;
        const loadMediaPipe = async () => {
            try {
                if (typeof window === 'undefined') return;
                const { FilesetResolver, FaceLandmarker } = await import('@mediapipe/tasks-vision');
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
                );
                const landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numFaces: 1,
                });

                if (isMounted) {
                    mediaPipeLandmarkerRef.current = landmarker;
                    setIsModelsLoaded(true);
                }
            } catch (err) {
                console.warn('Error al cargar Google MediaPipe con GPU, reintentando con CPU:', err);
                try {
                    const { FilesetResolver, FaceLandmarker } = await import('@mediapipe/tasks-vision');
                    const vision = await FilesetResolver.forVisionTasks(
                        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
                    );
                    const landmarker = await FaceLandmarker.createFromOptions(vision, {
                        baseOptions: {
                            modelAssetPath:
                                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                            delegate: 'CPU',
                        },
                        runningMode: 'VIDEO',
                        numFaces: 1,
                    });
                    if (isMounted) {
                        mediaPipeLandmarkerRef.current = landmarker;
                        setIsModelsLoaded(true);
                    }
                } catch (e) {
                    console.error('No se pudo inicializar Google MediaPipe:', e);
                }
            }
        };

        if (isOpen) {
            loadMediaPipe();
        }

        return () => {
            isMounted = false;
        };
    }, [isOpen]);

    // 2. Enumerar dispositivos de video disponibles
    useEffect(() => {
        const getDevices = async () => {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const videoDevices = devices.filter((d) => d.kind === 'videoinput');
                    setAvailableCameras(videoDevices);
                }
            } catch (e) {
                console.warn('No se pudieron listar cámaras:', e);
            }
        };
        if (isOpen) {
            getDevices();
        }
    }, [isOpen]);

    // 3. Inicializar / Reiniciar Stream de Cámara
    const startCamera = useCallback(
        async (targetFacing: 'user' | 'environment', deviceId?: string) => {
            setCameraError(null);
            setIsCameraActive(false);

            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            }

            try {
                const videoConstraints: MediaTrackConstraints = {
                    width: { ideal: 1920, min: 1280 },
                    height: { ideal: 1080, min: 720 },
                };

                if (deviceId) {
                    videoConstraints.deviceId = { exact: deviceId };
                } else {
                    videoConstraints.facingMode = { ideal: targetFacing };
                }

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: videoConstraints,
                    audio: false,
                });

                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    setIsCameraActive(true);
                }
            } catch (err: any) {
                console.error('Error al acceder a la cámara:', err);
                setCameraError(
                    err.name === 'NotAllowedError'
                        ? 'Permiso de cámara denegado. Habilite el acceso a la cámara en su navegador.'
                        : 'No se pudo iniciar la cámara seleccionada. Pruebe con otra cámara o suba un archivo.'
                );
            }
        },
        []
    );

    // Detener la cámara
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
        }
        setIsCameraActive(false);
        setCountdown(null);
        greenStreakRef.current = 0;
    }, []);

    // Iniciar cámara cuando el modal se abre o cambian los parámetros
    useEffect(() => {
        if (isOpen) {
            setPreviewResult(null);
            startCamera(facingMode, selectedDeviceId);
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [isOpen, facingMode, selectedDeviceId, startCamera, stopCamera]);

    // 4. Analizador de Luminosidad y Nitidez por Canvas
    const analyzeImageQuality = (video: HTMLVideoElement, cropBox: { x: number; y: number; w: number; h: number }) => {
        const offCanvas = document.createElement('canvas');
        const cw = Math.min(160, cropBox.w);
        const ch = Math.min(200, cropBox.h);
        offCanvas.width = cw;
        offCanvas.height = ch;
        const ctx = offCanvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return { brightness: 128, isBrightOk: true, sharpness: 100 };

        ctx.drawImage(video, cropBox.x, cropBox.y, cropBox.w, cropBox.h, 0, 0, cw, ch);
        const imgData = ctx.getImageData(0, 0, cw, ch);
        const data = imgData.data;

        let totalBrightness = 0;
        let diffSum = 0;
        const sampleStep = 4;
        let count = 0;

        for (let i = 0; i < data.length; i += 4 * sampleStep) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            totalBrightness += lum;

            if (i + 4 < data.length) {
                const nextLum = 0.299 * data[i + 4] + 0.587 * data[i + 5] + 0.114 * data[i + 6];
                diffSum += Math.abs(lum - nextLum);
            }
            count++;
        }

        const avgBrightness = count > 0 ? totalBrightness / count : 128;
        const sharpness = count > 0 ? (diffSum / count) * 4 : 50;
        const isBrightOk = avgBrightness >= 55 && avgBrightness <= 225;

        return { brightness: avgBrightness, isBrightOk, sharpness };
    };

    // 5. Bucle de Análisis en Tiempo Real (Loop Inteligente)
    useEffect(() => {
        if (!isOpen || !isCameraActive || previewResult || !videoRef.current) return;

        let isRunning = true;
        let lastAnalysisTime = 0;

        const loop = async (timestamp: number) => {
            if (!isRunning) return;

            if (timestamp - lastAnalysisTime > 140 && videoRef.current && videoRef.current.readyState >= 2) {
                lastAnalysisTime = timestamp;
                const video = videoRef.current;
                const vWidth = video.videoWidth;
                const vHeight = video.videoHeight;

                if (vWidth > 0 && vHeight > 0) {
                    if (mode === 'foto') {
                        // --- ANÁLISIS FACIAL GOOGLE MEDIAPIPE (478 PUNTOS BIOMÉTRICOS) ---
                        const containerAspect = 3 / 4;
                        const videoAspect = vWidth / vHeight;
                        let visibleW: number;
                        let visibleH: number;
                        let visibleX: number;
                        let visibleY: number;

                        if (videoAspect > containerAspect) {
                            visibleH = vHeight;
                            visibleW = vHeight * containerAspect;
                            visibleX = (vWidth - visibleW) / 2;
                            visibleY = 0;
                        } else {
                            visibleW = vWidth;
                            visibleH = vWidth / containerAspect;
                            visibleX = 0;
                            visibleY = (vHeight - visibleH) / 2;
                        }

                        const targetBox = {
                            x: visibleX,
                            y: visibleY,
                            w: visibleW,
                            h: visibleH,
                        };

                        const quality = analyzeImageQuality(video, targetBox);

                        if (isModelsLoaded && mediaPipeLandmarkerRef.current) {
                            try {
                                const landmarker = mediaPipeLandmarkerRef.current;
                                const results = landmarker.detectForVideo(video, timestamp);

                                if (!results || !results.faceLandmarks || results.faceLandmarks.length === 0) {
                                    setFeedback({
                                        color: 'red',
                                        message: '🔴 No se detecta el rostro. Sitúese frente a la cámara.',
                                        score: 20,
                                        details: { faceDetected: false, brightnessOk: quality.isBrightOk, centered: false, sizeOk: false, blurOk: true },
                                    });
                                    greenStreakRef.current = 0;
                                } else {
                                    const landmarks = results.faceLandmarks[0];
                                    // Puntos clave normalizados (0.0 a 1.0)
                                    // 10: Coronilla/Frente, 152: Barbilla, 1: Nariz, 33: Ojo izq, 263: Ojo der
                                    const topOfHeadY = landmarks[10].y;
                                    const chinY = landmarks[152].y;
                                    const noseX = landmarks[1].x;
                                    const leftEyeY = landmarks[33].y;
                                    const rightEyeY = landmarks[263].y;

                                    const headHeight = chinY - topOfHeadY;
                                    const faceCenterY = (topOfHeadY + chinY) / 2;
                                    const faceCenterX = noseX;
                                    const tilt = Math.abs(leftEyeY - rightEyeY);

                                    // En carnet 30x40mm (3:4), centrado horizontal y vertical en el tercio superior
                                    const isCenteredX = Math.abs(faceCenterX - 0.50) < 0.15;
                                    const isCenteredY = Math.abs(faceCenterY - 0.44) < 0.15;

                                    // Altura de cabeza: norma 30x40mm (debe ocupar entre 26% y 48% de la altura)
                                    const isTooClose = headHeight > 0.48;
                                    const isTooFar = headHeight < 0.25;
                                    const isSizeOk = !isTooClose && !isTooFar;
                                    const isStraight = tilt < 0.06;

                                    if (isTooFar) {
                                        setFeedback({
                                            color: 'red',
                                            message: '🔴 Rostro muy lejos. Acérquese a la cámara hasta llenar la guía.',
                                            score: 40,
                                            details: { faceDetected: true, brightnessOk: quality.isBrightOk, centered: isCenteredX, sizeOk: false, blurOk: true },
                                        });
                                        greenStreakRef.current = 0;
                                    } else if (isTooClose) {
                                        setFeedback({
                                            color: 'red',
                                            message: '🔴 Rostro muy cerca. Aléjese para que se vean sus hombros.',
                                            score: 40,
                                            details: { faceDetected: true, brightnessOk: quality.isBrightOk, centered: isCenteredX, sizeOk: false, blurOk: true },
                                        });
                                        greenStreakRef.current = 0;
                                    } else if (!isCenteredX) {
                                        setFeedback({
                                            color: 'red',
                                            message: '🔴 Rostro fuera de centro. Centre su cabeza en el recuadro.',
                                            score: 50,
                                            details: { faceDetected: true, brightnessOk: quality.isBrightOk, centered: false, sizeOk: isSizeOk, blurOk: true },
                                        });
                                        greenStreakRef.current = 0;
                                    } else if (!isCenteredY) {
                                        setFeedback({
                                            color: 'red',
                                            message: faceCenterY > 0.44
                                                ? '🔴 Rostro muy abajo. Suba la cámara o alinee su cabeza arriba.'
                                                : '🔴 Rostro muy arriba. Baje un poco la cámara.',
                                            score: 50,
                                            details: { faceDetected: true, brightnessOk: quality.isBrightOk, centered: false, sizeOk: isSizeOk, blurOk: true },
                                        });
                                        greenStreakRef.current = 0;
                                    } else if (!isStraight) {
                                        setFeedback({
                                            color: 'red',
                                            message: '🔴 Cabeza inclinada. Manténgase derecho mirando al frente.',
                                            score: 55,
                                            details: { faceDetected: true, brightnessOk: quality.isBrightOk, centered: true, sizeOk: true, blurOk: true },
                                        });
                                        greenStreakRef.current = 0;
                                    } else if (!quality.isBrightOk || quality.sharpness < 5) {
                                        setFeedback({
                                            color: 'yellow',
                                            message:
                                                quality.brightness < 35
                                                    ? '🟡 Poca iluminación. Busque un lugar más iluminado.'
                                                    : quality.brightness > 240
                                                    ? '🟡 Mucho brillo o contraluz. Ajuste la luz.'
                                                    : '🟡 Ajustando nitidez... mantenga el pulso.',
                                            score: 75,
                                            details: { faceDetected: true, brightnessOk: quality.isBrightOk, centered: true, sizeOk: true, blurOk: quality.sharpness >= 5 },
                                        });
                                        greenStreakRef.current = 0;
                                    } else {
                                        // ¡ESTADO VERDE PERFECTO!
                                        setFeedback({
                                            color: 'green',
                                            message: '🟢 ¡Posición perfecta (30 × 40 mm)! Manténgase quieto...',
                                            score: 100,
                                            details: { faceDetected: true, brightnessOk: true, centered: true, sizeOk: true, blurOk: true },
                                        });
                                        greenStreakRef.current += 1;
                                    }
                                }
                            } catch (e) {
                                // Fallback
                            }
                        } else {
                            // Si el modelo está cargando, dar feedback básico
                            setFeedback({
                                color: quality.isBrightOk ? 'yellow' : 'red',
                                message: 'Cargando Google MediaPipe AI... Alinee su rostro en el marco 30x40 mm.',
                                score: 50,
                            });
                        }
                    } else {
                        // --- ANÁLISIS DE CÉDULA DE IDENTIDAD ---
                        const targetBoxW = vWidth * 0.72;
                        const targetBoxH = targetBoxW / 1.58; // Proporción ID card
                        const targetBox = {
                            x: (vWidth - targetBoxW) / 2,
                            y: (vHeight - targetBoxH) / 2,
                            w: targetBoxW,
                            h: targetBoxH,
                        };

                        const quality = analyzeImageQuality(video, targetBox);

                        if (!quality.isBrightOk) {
                            setFeedback({
                                color: 'yellow',
                                message:
                                    quality.brightness < 55
                                        ? '🟡 Poca iluminación. Ilumine la cédula directamente.'
                                        : '🟡 Reflejos o exceso de brillo sobre la cédula.',
                                score: 65,
                            });
                            greenStreakRef.current = 0;
                        } else if (quality.sharpness < 15) {
                            setFeedback({
                                color: 'red',
                                message: '🔴 Enfoque la cédula y mantenga firme el teléfono.',
                                score: 40,
                            });
                            greenStreakRef.current = 0;
                        } else {
                            setFeedback({
                                color: 'green',
                                message: '🟢 ¡Cédula nítida y bien encuadrada! Puede capturar.',
                                score: 98,
                            });
                            greenStreakRef.current += 1;
                        }
                    }
                }
            }

            animFrameRef.current = requestAnimationFrame(loop);
        };

        animFrameRef.current = requestAnimationFrame(loop);

        return () => {
            isRunning = false;
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [isOpen, isCameraActive, isModelsLoaded, mode, previewResult]);

    // 6. Manejador de Cuenta Regresiva para Auto-disparo cuando está en Verde (3 Segundos)
    useEffect(() => {
        if (!autoCaptureEnabled || previewResult || feedback.color !== 'green') {
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
                countdownTimerRef.current = null;
            }
            setCountdown(null);
            return;
        }

        // Si se mantiene verde por al menos 3 ciclos (~450ms)
        if (greenStreakRef.current >= 3 && countdown === null) {
            setCountdown(3); // Cuenta regresiva visible de 3 segundos
            countdownTimerRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev === null) return null;
                    if (prev <= 1) {
                        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                        countdownTimerRef.current = null;
                        executeCapture();
                        return null;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    }, [feedback.color, autoCaptureEnabled, previewResult]);

    // Calcula las coordenadas exactas de recorte proyectando el marco guía visual sobre la resolución nativa del video
    const calculateVideoCrop = () => {
        if (!videoRef.current || !guideFrameRef.current) return null;
        const video = videoRef.current;
        const vWidth = video.videoWidth;
        const vHeight = video.videoHeight;
        if (!vWidth || !vHeight) return null;

        const videoRect = video.getBoundingClientRect();
        const frameRect = guideFrameRef.current.getBoundingClientRect();
        if (videoRect.width <= 0 || videoRect.height <= 0) return null;

        // Calcular la escala de 'object-cover' del elemento <video>
        const scale = Math.max(videoRect.width / vWidth, videoRect.height / vHeight);
        const renderedW = vWidth * scale;
        const renderedH = vHeight * scale;
        const offsetX = (renderedW - videoRect.width) / 2;
        const offsetY = (renderedH - videoRect.height) / 2;

        // Coordenadas del marco en el espacio de píxeles del video
        const screenFrameX = frameRect.left - videoRect.left + offsetX;
        const screenFrameY = frameRect.top - videoRect.top + offsetY;

        let rawCropX = screenFrameX / scale;
        const rawCropY = screenFrameY / scale;
        const rawCropW = frameRect.width / scale;
        const rawCropH = frameRect.height / scale;

        // Si la cámara frontal está espejada horizontalmente en pantalla (-scale-x-100)
        if (facingMode === 'user' && mode === 'foto') {
            rawCropX = vWidth - rawCropX - rawCropW;
        }

        const cropX = Math.max(0, Math.min(vWidth - 10, Math.round(rawCropX)));
        const cropY = Math.max(0, Math.min(vHeight - 10, Math.round(rawCropY)));
        const cropW = Math.max(10, Math.min(vWidth - cropX, Math.round(rawCropW)));
        const cropH = Math.max(10, Math.min(vHeight - cropY, Math.round(rawCropH)));

        return { cropX, cropY, cropW, cropH, vWidth, vHeight };
    };

    // 7. Ejecución de la Captura, Auto-Recorte Exacto y Compresión a KB
    const executeCapture = async () => {
        if (!videoRef.current || isProcessingCapture) return;
        setIsProcessingCapture(true);

        // Efecto visual de flash
        setFlashEffect(true);
        setTimeout(() => setFlashEffect(false), 200);

        try {
            const video = videoRef.current;
            const crop = calculateVideoCrop();
            if (!crop) return;

            const { cropX, cropY, cropW, cropH } = crop;

            const rawCanvas = document.createElement('canvas');
            rawCanvas.width = cropW;
            rawCanvas.height = cropH;
            const ctx = rawCanvas.getContext('2d');

            if (ctx) {
                // Si la cámara es frontal ('user') Y es foto de perfil, aplicamos espejo para selfie natural
                // Si es CÉDULA DE IDENTIDAD, NUNCA se espeja para que el texto de la cédula quede derecho y legible
                if (facingMode === 'user' && mode === 'foto') {
                    ctx.save();
                    ctx.translate(cropW, 0);
                    ctx.scale(-1, 1);
                    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
                    ctx.restore();
                } else {
                    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
                }

                // Compresión inteligente y reducción a tamaño ligero en KB (< 350 KB)
                const optimized = await optimizeAndCompressImage(
                    rawCanvas,
                    mode === 'foto' ? 900 : 1200,
                    mode === 'foto' ? 1200 : 800,
                    350
                );

                setPreviewResult({
                    dataUrl: optimized.dataUrl,
                    sizeKb: optimized.sizeKb,
                    width: optimized.width,
                    height: optimized.height,
                    mode,
                });
            }
        } catch (e) {
            console.error('Error al capturar y optimizar foto:', e);
        } finally {
            setIsProcessingCapture(false);
            setCountdown(null);
        }
    };

    // Alternar entre cámara frontal y trasera
    const handleToggleCameraFacing = () => {
        const next = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(next);
        setSelectedDeviceId('');
    };

    // Confirmar y entregar foto al formulario
    const handleConfirmPhoto = () => {
        if (previewResult) {
            onCapture(previewResult);
            onClose();
        }
    };

    // Descartar vista previa y reanudar cámara inmediatamente
    const handleRetake = () => {
        setPreviewResult(null);
        setCountdown(null);
        greenStreakRef.current = 0;

        // Asegurar que el stream siga fluyendo hacia el elemento video
        if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => {});
        } else {
            startCamera(facingMode, selectedDeviceId);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[99999] bg-slate-950 flex flex-col items-center justify-between overflow-hidden select-none font-sans animate-in fade-in duration-200"
        >
            {/* EFECTO DE FLASH BLANCO AL DISPARAR */}
            {flashEffect && (
                <div className="absolute inset-0 bg-white z-[100000] pointer-events-none animate-out fade-out duration-200" />
            )}

            {/* BARRA SUPERIOR DE CONTROL */}
            <header className="w-full z-30 px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-b from-slate-950 via-slate-950/80 to-transparent flex items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                        {mode === 'foto' ? <User className="w-5 h-5" /> : <IdCard className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="font-black text-sm sm:text-base leading-tight flex items-center gap-1.5">
                            {mode === 'foto' ? 'Captura Biométrica Tipo Carnet' : 'Escaneo de Cédula de Identidad'}
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                IA
                            </span>
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-400">
                            {mode === 'foto'
                                ? 'Encuadre su rostro en el óvalo con buena luz'
                                : 'Coloque la cédula plana y nítida dentro del recuadro'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Botón Alternar Cámara Frontal / Trasera */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleToggleCameraFacing}
                        className="bg-slate-900/80 border-slate-700 hover:bg-slate-800 text-white rounded-xl gap-1.5 h-9 px-3 text-xs shadow-md"
                        title="Cambiar Cámara"
                    >
                        <SwitchCamera className="w-4 h-4 text-blue-400" />
                        <span className="hidden md:inline font-semibold">
                            {facingMode === 'user' ? 'Cámara Frontal' : 'Cámara Trasera'}
                        </span>
                    </Button>

                    {/* Selector de Dispositivos de Cámara si hay más de 1 */}
                    {availableCameras.length > 1 && (
                        <select
                            value={selectedDeviceId}
                            onChange={(e) => setSelectedDeviceId(e.target.value)}
                            className="bg-slate-900/90 border border-slate-700 text-white text-xs rounded-xl px-2.5 py-1.5 h-9 outline-none focus:ring-1 focus:ring-blue-500 max-w-[130px] sm:max-w-[180px] truncate"
                        >
                            <option value="">Auto Cámara</option>
                            {availableCameras.map((cam, idx) => (
                                <option key={cam.deviceId || idx} value={cam.deviceId}>
                                    {cam.label || `Cámara ${idx + 1}`}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Cerrar Modal */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-slate-900/80 border-slate-700 hover:bg-rose-900/40 hover:border-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* ÁREA PRINCIPAL DEL VISOR DE VIDEO & MÁSCARA BIOMÉTRICA */}
            <main className="relative flex-1 w-full flex items-center justify-center p-4 overflow-hidden bg-slate-950">
                {/* AMBIENTE DE ESTUDIO BIOMÉTRICO (FONDO CON EFECTO DE LUZ SUAVE) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                    <div className="w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl" />
                </div>

                {/* ERROR DE CÁMARA SI EXISTE */}
                {cameraError && (
                    <div className="z-40 max-w-md p-6 bg-slate-900/90 border border-rose-500/50 rounded-2xl text-center space-y-4 shadow-2xl mx-4">
                        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
                        <h4 className="text-white font-bold text-base">Problema de Acceso a la Cámara</h4>
                        <p className="text-slate-300 text-xs">{cameraError}</p>
                        <div className="flex gap-2 justify-center">
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => startCamera(facingMode, selectedDeviceId)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                            >
                                <RotateCcw className="w-4 h-4 mr-1.5" /> Reintentar
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-slate-300">
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}

                {/* VISOR ENFOCADO (CONTENEDOR DE CÁMARA RESTRINGIDO A LA FORMA EXACTA DEL CARNET / CÉDULA) */}
                <div
                    ref={guideFrameRef}
                    className={`${previewResult ? 'hidden' : 'relative flex'} flex-col items-center justify-between transition-all duration-300 overflow-hidden bg-slate-900 ${
                        mode === 'foto'
                            ? 'w-[min(82vw,360px)] aspect-[3/4] max-h-[62vh] rounded-3xl'
                            : 'w-[min(92vw,520px)] aspect-[1.58/1] max-h-[58vh] rounded-3xl'
                    } border-4 ${
                        feedback.color === 'green'
                            ? 'border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.6)]'
                            : feedback.color === 'yellow'
                            ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]'
                            : 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)]'
                    }`}
                >
                    {/* VIDEO STREAM DIRECTAMENTE DENTRO DEL CONTENEDOR ENFOCADO */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ${
                            facingMode === 'user' && mode === 'foto' ? '-scale-x-100' : ''
                        } ${!isCameraActive ? 'opacity-0' : 'opacity-100'}`}
                    />

                    {/* SPINNER DE INICIALIZACIÓN DE CÁMARA */}
                    {!isCameraActive && !cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-slate-300 gap-3 z-20">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                            <span className="text-xs font-semibold">Iniciando cámara y sensor biométrico...</span>
                        </div>
                    )}

                    {/* BADGE SUPERIOR DE IDENTIFICACIÓN */}
                    <div className="z-10 mt-3 bg-slate-950/85 px-3 py-1 rounded-full border border-slate-700/80 text-[11px] font-bold text-slate-200 shadow flex items-center gap-1.5 backdrop-blur-md">
                        {mode === 'foto' ? (
                            <>
                                <User className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Foto Carnet Oficial (30 × 40 mm)</span>
                            </>
                        ) : (
                            <>
                                <IdCard className="w-3.5 h-3.5 text-blue-400" />
                                <span>Cédula de Identidad</span>
                            </>
                        )}
                    </div>

                    {/* SILUETA / GUÍAS DE ENCUADRE 30 x 40 mm */}
                    {mode === 'foto' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-between p-3 pointer-events-none overflow-hidden">
                            {/* Línea guía de coronilla (Cabello) - 30 mm superior */}
                            <div className="w-full flex items-center justify-between px-2 pt-8 opacity-70">
                                <div className="h-[1px] flex-1 border-t border-dashed border-white" />
                                <span className="text-[9px] font-mono font-bold text-white px-2 bg-slate-950/80 rounded">Coronilla</span>
                                <div className="h-[1px] flex-1 border-t border-dashed border-white" />
                            </div>

                            {/* Silueta de Cabeza */}
                            <div className="w-32 h-44 rounded-[50%] border-2 border-dashed border-white/60 -mt-2 flex items-center justify-center">
                                <div className="w-16 border-t border-dashed border-white/30" />
                            </div>

                            {/* Línea guía de barbilla - 30 mm inferior */}
                            <div className="w-full flex items-center justify-between px-2 opacity-70 -mt-4">
                                <div className="h-[1px] flex-1 border-t border-dashed border-white" />
                                <span className="text-[9px] font-mono font-bold text-white px-2 bg-slate-950/80 rounded">Barbilla</span>
                                <div className="h-[1px] flex-1 border-t border-dashed border-white" />
                            </div>

                            {/* Cuello y Hombros en la base */}
                            <div className="w-[96%] h-14 rounded-t-[40px] border-2 border-dashed border-white/50 flex items-center justify-center bg-white/5">
                                <span className="text-[9px] uppercase font-bold text-white/50 tracking-wider">Cuello y Hombros</span>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[90%] h-[82%] border-2 border-dashed border-white/70 rounded-2xl flex items-center justify-center">
                                <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Alinee la Cédula Aquí</span>
                            </div>
                        </div>
                    )}

                    {/* ANIMACIÓN DE CUENTA REGRESIVA 3.. 2.. 1.. CON ANILLO LUMINOSO */}
                    {countdown !== null && (
                        <div className="absolute inset-0 m-auto z-30 flex flex-col items-center justify-center w-28 h-28 rounded-full bg-emerald-600/95 text-white shadow-[0_0_50px_rgba(16,185,129,0.9)] border-4 border-white animate-pulse">
                            <span className="font-black text-6xl leading-none">{countdown}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-100 mt-1">Capturando</span>
                        </div>
                    )}
                </div>

                {/* VISTA PREVIA DE FOTO CAPTURADA Y CONFIRMACIÓN */}
                {previewResult && (
                    <div className="z-30 flex flex-col items-center justify-center p-4 max-w-lg w-full animate-in zoom-in-95 duration-200">
                        <div className="relative bg-slate-900 border-2 border-emerald-500/70 rounded-3xl p-3 shadow-2xl overflow-hidden flex flex-col items-center">
                            <div className="relative rounded-2xl overflow-hidden shadow-inner bg-black max-h-[55vh]">
                                <img
                                    src={previewResult.dataUrl}
                                    alt="Foto Capturada"
                                    className="w-full h-auto max-h-[55vh] object-contain"
                                />
                                <div className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1.5 border border-emerald-400/40">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Auto-Realzada & Verificada
                                </div>
                            </div>

                            <div className="w-full mt-3 p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300">
                                <span className="font-medium text-slate-400">
                                    {previewResult.width} × {previewResult.height} px
                                </span>
                                <span className="font-bold font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-800/40">
                                    Peso: {previewResult.sizeKb} KB
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* BARRA INFERIOR DE ACCIONES Y MENSAJE DE ESTADO */}
            <footer className="w-full z-30 px-4 py-4 sm:px-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex flex-col items-center gap-3">
                {/* BANNER DE FEEDBACK EN VIVO (ROJO / AMARILLO / VERDE) */}
                {!previewResult && isCameraActive && (
                    <div
                        className={`w-full max-w-md px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center text-center gap-2 shadow-lg backdrop-blur-md transition-all duration-300 ${
                            feedback.color === 'green'
                                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                                : feedback.color === 'yellow'
                                ? 'bg-amber-950/80 border-amber-500/60 text-amber-200'
                                : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
                        }`}
                    >
                        {feedback.color === 'green' && <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />}
                        {feedback.color === 'yellow' && <Sun className="w-4 h-4 text-amber-400 shrink-0" />}
                        {feedback.color === 'red' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
                        <span>
                            {countdown !== null
                                ? `🟢 ¡Posición perfecta! Tomando foto en ${countdown} segundo${countdown > 1 ? 's' : ''}...`
                                : feedback.message}
                        </span>
                    </div>
                )}

                {/* BOTONES DE ACCIÓN */}
                <div className="flex items-center justify-center gap-4 w-full max-w-md">
                    {previewResult ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleRetake}
                                className="flex-1 bg-slate-900 border-slate-700 hover:bg-slate-800 text-white font-bold h-12 rounded-2xl gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Repetir Foto
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConfirmPhoto}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-2xl gap-2 shadow-lg shadow-emerald-600/30"
                            >
                                <Check className="w-4 h-4" />
                                Usar Fotografía
                            </Button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3 w-full justify-center">
                            {/* Botón de Disparo Principal */}
                            <Button
                                type="button"
                                onClick={executeCapture}
                                disabled={!isCameraActive || isProcessingCapture}
                                className={`flex-1 sm:flex-none sm:w-64 h-14 rounded-2xl font-black text-sm sm:text-base gap-2 shadow-2xl transition-all duration-200 ${
                                    feedback.color === 'green'
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/40 ring-4 ring-emerald-500/30'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                                }`}
                            >
                                {isProcessingCapture ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Optimizando...
                                    </>
                                ) : (
                                    <>
                                        <Camera className="w-5 h-5" />
                                        {feedback.color === 'green' ? 'Capturar Ahora' : 'Capturar Fotografía'}
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </footer>
        </div>
    );
}
