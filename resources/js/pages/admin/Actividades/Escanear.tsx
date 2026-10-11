import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    QrCode,
    Camera,
    CameraOff,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Volume2,
    VolumeX,
    Maximize2,
    Minimize2,
    ArrowLeft,
    Users,
    Utensils,
    Package,
    Heart,
    Search,
    RotateCcw,
    Barcode,
    ScanFace,
    Sparkles,
    ShieldCheck,
    Clock,
    RefreshCw,
    Church,
    MapPin,
    BadgeCheck,
    Keyboard,
    UserCheck,
    Radio,
    UserPlus,
    Check,
    Smartphone,
    Download,
    Share2,
} from 'lucide-react';
import jsQR from 'jsqr';
import * as faceapi from '@vladmandic/face-api';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Sesion {
    id: number;
    nombre: string;
    fecha_hora_inicio: string;
    fecha_hora_fin: string;
    es_obligatoria: boolean;
    tipo_comida: string;
}

interface Actividad {
    id: number;
    nombre: string;
    tipo: string;
    fecha_inicio: string;
    fecha_fin: string;
    lugar: string | null;
    zona: string | null;
    permite_conyuge: boolean;
    controla_comida: boolean;
    sesiones: Sesion[];
}

interface EscaneoHistorial {
    id: number;
    pastor_id: number;
    nombre_completo: string;
    documento: string;
    codigo: string;
    foto?: string | null;
    zona?: string;
    nivel_ministerial?: string;
    sesion: string;
    hora: string;
    asistio_con_conyuge: boolean;
    kit_entregado: boolean;
    comida_entregada: boolean;
}

interface PastorData {
    id: number;
    codigo: string;
    nombres?: string;
    apellidos?: string;
    nombre_completo: string;
    documento: string;
    foto?: string | null;
    foto_disponible?: boolean;
    nivel_ministerial?: string;
    cargo_nacional?: string;
    zona?: string;
    distrito?: string;
    nombre_conyuge?: string;
    estado?: string;
    municipio?: string;
    iglesia?: string;
}

interface Props {
    actividad: Actividad;
    sesionActiva: Sesion | null;
    ultimosEscaneos: EscaneoHistorial[];
    totalPresentes: number;
    pastoresConvocados: PastorData[];
}

type ModoEscaneo = 'qr' | 'facial';

export default function ActividadesEscanear({
    actividad,
    sesionActiva: sesionActivaProp,
    ultimosEscaneos: ultimosEscaneosProp,
    totalPresentes: totalPresentesProp,
    pastoresConvocados = [],
}: Props) {
    // Modo de operación: Código QR o Reconocimiento Facial
    const [modo, setModo] = useState<ModoEscaneo>('qr');

    // Estados de configuración de sesión y logística
    const [sesionSeleccionada, setSesionSeleccionada] = useState<number | null>(
        sesionActivaProp?.id ?? actividad.sesiones[0]?.id ?? null
    );
    const [asistioConConyuge, setAsistioConConyuge] = useState<boolean>(false);
    const [kitEntregado, setKitEntregado] = useState<boolean>(false);
    const [comidaEntregada, setComidaEntregada] = useState<boolean>(false);

    // Hardware y Entrada
    const [codigoManualInput, setCodigoManualInput] = useState<string>('');
    const [autoFocusGun, setAutoFocusGun] = useState<boolean>(true);
    const [cameraActive, setCameraActive] = useState<boolean>(true);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    // Feedback visual del HUD
    const [ultimoPastor, setUltimoPastor] = useState<PastorData | null>(null);
    const [estadoEscaneo, setEstadoEscaneo] = useState<'idle' | 'success' | 'duplicate' | 'error'>('idle');
    const [mensajeFeedback, setMensajeFeedback] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [contadorPresentes, setContadorPresentes] = useState<number>(totalPresentesProp);
    const [historial, setHistorial] = useState<EscaneoHistorial[]>(ultimosEscaneosProp);

    // Estados del Reconocimiento Facial Dinámico
    const [modelosCargados, setModelosCargados] = useState<boolean>(false);
    const [cargandoModelos, setCargandoModelos] = useState<boolean>(false);
    const [rostroDetectado, setRostroDetectado] = useState<boolean>(false);
    const [estadoBiometrico, setEstadoBiometrico] = useState<'esperando' | 'analizando' | 'coincidencia' | 'no_coincide'>('esperando');
    const [textoOverlayBiometrico, setTextoOverlayBiometrico] = useState<string>('Buscando rostro...');
    const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);
    const [progresoEntrenamiento, setProgresoEntrenamiento] = useState<string>('');
    const [progresoPorcentaje, setProgresoPorcentaje] = useState<number>(0);
    const [totalRostrosIndexados, setTotalRostrosIndexados] = useState<number>(0);

    // Modal de Enrolamiento de Rostro en Vivo (captura de foto desde la cámara)
    const [isEnrolarModalOpen, setIsEnrolarModalOpen] = useState<boolean>(false);
    const [capturaSnapshot, setCapturaSnapshot] = useState<string | null>(null);
    const [pastorSeleccionadoParaEnrolar, setPastorSeleccionadoParaEnrolar] = useState<PastorData | null>(null);
    const [enrolandoGuardando, setEnrolandoGuardando] = useState<boolean>(false);

    // Modal de búsqueda manual de pastor
    const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
    const [busquedaManualQuery, setBusquedaManualQuery] = useState<string>('');
    const [resultadosBusquedaManual, setResultadosBusquedaManual] = useState<PastorData[]>([]);
    const [buscandoManual, setBuscandoManual] = useState<boolean>(false);

    // Detección de autenticación y soporte PWA móvil
    const { props: pageProps } = usePage();
    const isAuth = !!(pageProps.auth as any)?.user;
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(false);
    const [showIosInstallModal, setShowIosInstallModal] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
                setIsPwaInstalled(true);
            }

            const handlePrompt = (e: any) => {
                e.preventDefault();
                setDeferredPrompt(e);
            };

            window.addEventListener('beforeinstallprompt', handlePrompt);
            window.addEventListener('appinstalled', () => {
                setIsPwaInstalled(true);
                setDeferredPrompt(null);
            });

            return () => {
                window.removeEventListener('beforeinstallprompt', handlePrompt);
            };
        }
    }, []);

    const handleInstallPwa = async () => {
        const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
        if (isIos && !(window.navigator as any).standalone) {
            setShowIosInstallModal(true);
            return;
        }

        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setIsPwaInstalled(true);
                setDeferredPrompt(null);
            }
        } else {
            setShowIosInstallModal(true);
        }
    };

    // Refs
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasHiddenRef = useRef<HTMLCanvasElement | null>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const inputGunRef = useRef<HTMLInputElement | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const lastScannedCodeRef = useRef<string>('');
    const lastScanTimeRef = useRef<number>(0);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const labeledDescriptorsRef = useRef<faceapi.LabeledFaceDescriptors[]>([]);

    // Audio Web API
    const getAudioContext = useCallback(() => {
        if (!audioCtxRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioCtxRef.current = new AudioContextClass();
            }
        }
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    }, []);

    const playSound = useCallback(
        (type: 'success' | 'duplicate' | 'error') => {
            if (isMuted) return;
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const now = ctx.currentTime;

                if (type === 'success') {
                    const osc1 = ctx.createOscillator();
                    const osc2 = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc1.type = 'sine';
                    osc1.frequency.setValueAtTime(880, now);
                    osc2.type = 'triangle';
                    osc2.frequency.setValueAtTime(1175, now + 0.08);

                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

                    osc1.connect(gain);
                    osc2.connect(gain);
                    gain.connect(ctx.destination);

                    osc1.start(now);
                    osc1.stop(now + 0.08);
                    osc2.start(now + 0.08);
                    osc2.stop(now + 0.25);
                } else if (type === 'duplicate') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(320, now);

                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.setValueAtTime(0.001, now + 0.1);
                    gain.gain.setValueAtTime(0.2, now + 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.35);
                } else {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(220, now);
                    gain.gain.setValueAtTime(0.25, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.3);
                }
            } catch (err) {
                console.warn('Audio error', err);
            }
        },
        [isMuted, getAudioContext]
    );

    // Procesar registro en el servidor
    const procesarCodigo = useCallback(
        async (rawCodigo: string, metodo: 'qr_carnet' | 'cedula' | 'manual' | 'facial' = 'qr_carnet') => {
            const codigoLimpio = rawCodigo.trim();
            if (!codigoLimpio || isLoading) return;

            const now = Date.now();
            if (codigoLimpio === lastScannedCodeRef.current && now - lastScanTimeRef.current < 2500) {
                return;
            }

            lastScannedCodeRef.current = codigoLimpio;
            lastScanTimeRef.current = now;

            setIsLoading(true);

            try {
                const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

                const response = await fetch('/admin/actividades/asistencias/registrar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        actividad_id: actividad.id,
                        actividad_sesion_id: sesionSeleccionada,
                        codigo_qr: codigoLimpio,
                        asistio_con_conyuge: asistioConConyuge,
                        kit_entregado: kitEntregado,
                        comida_entregada: comidaEntregada,
                        metodo: metodo,
                    }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setEstadoEscaneo('success');
                    setUltimoPastor(data.pastor);
                    setMensajeFeedback(data.message);
                    setContadorPresentes(data.totalPresentes);
                    playSound('success');

                    if (data.asistencias && Array.isArray(data.asistencias)) {
                        setHistorial((prev) => [...data.asistencias, ...prev.slice(0, Math.max(0, 10 - data.asistencias.length))]);
                    } else if (data.asistencia) {
                        setHistorial((prev) => [data.asistencia, ...prev.slice(0, 9)]);
                    }
                } else if (data.ya_registrado) {
                    setEstadoEscaneo('duplicate');
                    setUltimoPastor(data.pastor);
                    setMensajeFeedback(data.message);
                    playSound('duplicate');
                } else {
                    setEstadoEscaneo('error');
                    setUltimoPastor(null);
                    setMensajeFeedback(data.message || 'Código o carnet no encontrado en el sistema');
                    playSound('error');
                }
            } catch (err: any) {
                setEstadoEscaneo('error');
                setMensajeFeedback('Error de conexión con el servidor. Reintente en un momento.');
                playSound('error');
            } finally {
                setIsLoading(false);
                setCodigoManualInput('');
                if (autoFocusGun && inputGunRef.current) {
                    inputGunRef.current.focus();
                }
            }
        },
        [
            actividad.id,
            sesionSeleccionada,
            asistioConConyuge,
            kitEntregado,
            comidaEntregada,
            isLoading,
            playSound,
            autoFocusGun,
        ]
    );

    // Cargar modelos locales de face-api desde /models
    const cargarModelosFaceApi = useCallback(async () => {
        if (modelosCargados || cargandoModelos) return;
        setCargandoModelos(true);
        setProgresoEntrenamiento('Cargando modelos de IA...');
        setProgresoPorcentaje(25);

        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            ]);

            setModelosCargados(true);
            setProgresoPorcentaje(50);
            setProgresoEntrenamiento('Modelos listos. Analizando fotos disponibles...');

            // Entrenar descriptores de fotos disponibles
            await entrenarPadronFacial(pastoresConvocados);
        } catch (err) {
            console.error('Error al cargar modelos de face-api:', err);
            setProgresoEntrenamiento('Error al cargar modelos biométricos.');
        } finally {
            setCargandoModelos(false);
        }
    }, [modelosCargados, cargandoModelos, pastoresConvocados]);

    // Indexar descriptores faciales disponibles en memoria
    const entrenarPadronFacial = async (pastores: PastorData[]) => {
        const pastoresConFoto = pastores.filter((p) => p.foto && p.foto_disponible !== false);

        if (pastoresConFoto.length === 0) {
            setProgresoEntrenamiento('Padrón facial activo (utilice "Vincular Rostro" para enrolar).');
            setProgresoPorcentaje(100);
            setTotalRostrosIndexados(0);
            return;
        }

        const lote = pastoresConFoto.slice(0, 150);
        setProgresoEntrenamiento(`Indexando ${lote.length} fotos para biometría...`);
        const descriptors: faceapi.LabeledFaceDescriptors[] = [];

        for (let i = 0; i < lote.length; i++) {
            const p = lote[i];
            if (!p.foto) continue;

            try {
                const img = await faceapi.fetchImage(p.foto);
                const detection = await faceapi
                    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
                    .withFaceLandmarks(true)
                    .withFaceDescriptor();

                if (detection) {
                    descriptors.push(
                        new faceapi.LabeledFaceDescriptors(p.documento || String(p.id), [detection.descriptor])
                    );
                }
            } catch (e) {
                // Silencioso si la foto no es accesible
            }

            const pct = 50 + Math.round(((i + 1) / lote.length) * 50);
            setProgresoPorcentaje(pct);

            if (i % 5 === 0) {
                setProgresoEntrenamiento(`Indexando biometría: ${i + 1}/${lote.length}...`);
            }
        }

        labeledDescriptorsRef.current = descriptors;

        if (descriptors.length > 0) {
            const matcher = new faceapi.FaceMatcher(descriptors, 0.60);
            setFaceMatcher(matcher);
            setTotalRostrosIndexados(descriptors.length);
            setProgresoEntrenamiento(`¡Listo! ${descriptors.length} pastores acreditables por rostro.`);
        } else {
            setProgresoEntrenamiento('Listo para enrolar rostros directamente.');
            setTotalRostrosIndexados(0);
        }
        setProgresoPorcentaje(100);
    };

    // Inicializar modelos al seleccionar modo facial
    useEffect(() => {
        if (modo === 'facial' && !modelosCargados && !cargandoModelos) {
            cargarModelosFaceApi();
        }
    }, [modo, modelosCargados, cargandoModelos, cargarModelosFaceApi]);

    // Función para dibujar HUD táctico dinámico sobre la cara en el Canvas transparente
    const drawFaceTracker = (
        canvas: HTMLCanvasElement,
        video: HTMLVideoElement,
        box: faceapi.Box,
        statusText: string,
        themeColor: string
    ) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Ajustar resolución del canvas al tamaño real mostrado del video
        if (canvas.width !== video.clientWidth || canvas.height !== video.clientHeight) {
            canvas.width = video.clientWidth;
            canvas.height = video.clientHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Escalar la caja detectada (video nativo) a las dimensiones de pantalla
        const scaleX = video.clientWidth / video.videoWidth;
        const scaleY = video.clientHeight / video.videoHeight;

        const x = box.x * scaleX;
        const y = box.y * scaleY;
        const w = box.width * scaleX;
        const h = box.height * scaleY;

        // 1. Dibujar brackets tácticos dinámicos alrededor del rostro
        const cornerLen = Math.min(28, w * 0.22);
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = themeColor;
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 12;

        // Top-Left
        ctx.beginPath();
        ctx.moveTo(x, y + cornerLen);
        ctx.lineTo(x, y);
        ctx.lineTo(x + cornerLen, y);
        ctx.stroke();

        // Top-Right
        ctx.beginPath();
        ctx.moveTo(x + w - cornerLen, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + cornerLen);
        ctx.stroke();

        // Bottom-Left
        ctx.beginPath();
        ctx.moveTo(x, y + h - cornerLen);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x + cornerLen, y + h);
        ctx.stroke();

        // Bottom-Right
        ctx.beginPath();
        ctx.moveTo(x + w - cornerLen, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + w, y + h - cornerLen);
        ctx.stroke();

        // 2. Línea de escaneo láser que oscila dentro de la caja facial
        const scanLineY = y + (Math.sin(Date.now() / 200) * 0.5 + 0.5) * h;
        ctx.lineWidth = 1.5;
        const gradient = ctx.createLinearGradient(x, scanLineY, x + w, scanLineY);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, themeColor);
        gradient.addColorStop(1, 'transparent');
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x + 5, scanLineY);
        ctx.lineTo(x + w - 5, scanLineY);
        ctx.stroke();

        // 3. Etiqueta flotante con el estado biométrico
        ctx.shadowBlur = 0;
        ctx.font = 'bold 12px ui-sans-serif, system-ui, -apple-system';
        const textMetrics = ctx.measureText(statusText);
        const tagH = 24;
        const tagW = textMetrics.width + 24;
        const tagX = Math.max(10, Math.min(x + (w - tagW) / 2, canvas.width - tagW - 10));
        const tagY = Math.max(tagH + 10, y - 10);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(tagX, tagY - tagH, tagW, tagH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(statusText, tagX + 12, tagY - 7);
    };

    const clearFaceTracker = (canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    // Bucle de Escaneo continuo (QR o Facial)
    useEffect(() => {
        let stream: MediaStream | null = null;
        let active = true;

        const startCamera = async () => {
            if (!cameraActive) return;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: facingMode,
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                });

                if (videoRef.current && active) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute('playsinline', 'true');
                    await videoRef.current.play();
                    requestScan();
                }
            } catch (err) {
                console.warn('Error al acceder a la cámara:', err);
                setCameraActive(false);
            }
        };

        let lastFaceCheck = 0;
        let unknownCount = 0;

        const scanFrame = async () => {
            if (!active || !cameraActive) return;

            const video = videoRef.current;
            const canvasHidden = canvasHiddenRef.current;
            const overlayCanvas = overlayCanvasRef.current;

            if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
                // 1. MODO QR
                if (modo === 'qr' && canvasHidden) {
                    const ctx = canvasHidden.getContext('2d', { willReadFrequently: true });
                    if (ctx) {
                        canvasHidden.width = video.videoWidth;
                        canvasHidden.height = video.videoHeight;
                        ctx.drawImage(video, 0, 0, canvasHidden.width, canvasHidden.height);

                        const imageData = ctx.getImageData(0, 0, canvasHidden.width, canvasHidden.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height, {
                            inversionAttempts: 'dontInvert',
                        });
                        if (code && code.data) {
                            procesarCodigo(code.data, 'qr_carnet');
                        }
                    }
                }
                // 2. MODO FACIAL DINÁMICO
                else if (modo === 'facial' && modelosCargados && overlayCanvas) {
                    const now = Date.now();
                    // Ejecutar detección cada 180ms para óptima fluidez
                    if (now - lastFaceCheck > 180 && !isLoading) {
                        lastFaceCheck = now;

                        try {
                            const detection = await faceapi
                                .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.45 }))
                                .withFaceLandmarks(true)
                                .withFaceDescriptor();

                            if (detection) {
                                setRostroDetectado(true);
                                const confidence = Math.round(detection.detection.score * 100);

                                if (faceMatcher && totalRostrosIndexados > 0) {
                                    const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

                                    if (bestMatch.label !== 'unknown' && bestMatch.distance <= 0.60) {
                                        unknownCount = 0;
                                        setEstadoBiometrico('coincidencia');
                                        const similarityPct = Math.round((1 - bestMatch.distance) * 100);
                                        const labelText = `✓ Identificado (${similarityPct}%)`;
                                        setTextoOverlayBiometrico(labelText);
                                        drawFaceTracker(overlayCanvas, video, detection.detection.box, labelText, '#10b981'); // Verde esmeralda

                                        // Registrar asistencia automáticamente
                                        procesarCodigo(bestMatch.label, 'facial');
                                    } else {
                                        unknownCount++;
                                        setEstadoBiometrico('no_coincide');
                                        const labelText = unknownCount > 2 ? 'Rostro no registrado en el padrón' : `Analizando... (${confidence}%)`;
                                        setTextoOverlayBiometrico(labelText);
                                        drawFaceTracker(overlayCanvas, video, detection.detection.box, labelText, '#f59e0b'); // Ámbar
                                    }
                                } else {
                                    // Padrón sin fotos aún
                                    setEstadoBiometrico('no_coincide');
                                    const labelText = `Rostro enfocado (${confidence}%) • Sin enrolar`;
                                    setTextoOverlayBiometrico(labelText);
                                    drawFaceTracker(overlayCanvas, video, detection.detection.box, labelText, '#a855f7'); // Púrpura
                                }
                            } else {
                                setRostroDetectado(false);
                                setEstadoBiometrico('esperando');
                                setTextoOverlayBiometrico('Mire de frente a la cámara');
                                clearFaceTracker(overlayCanvas);
                            }
                        } catch (e) {
                            // Silencioso en frame
                        }
                    }
                }
            }

            requestScan();
        };

        const requestScan = () => {
            if (active && cameraActive) {
                animFrameRef.current = requestAnimationFrame(scanFrame);
            }
        };

        startCamera();

        return () => {
            active = false;
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [cameraActive, facingMode, modo, modelosCargados, faceMatcher, totalRostrosIndexados, procesarCodigo, isLoading]);

    // Capturar foto actual desde la cámara para enrolamiento
    const capturarSnapshotDeCamara = () => {
        const video = videoRef.current;
        if (!video) return null;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.88);
    };

    const handleAbrirEnrolamiento = () => {
        const snapshot = capturarSnapshotDeCamara();
        setCapturaSnapshot(snapshot);
        setPastorSeleccionadoParaEnrolar(null);
        setBusquedaManualQuery('');
        setResultadosBusquedaManual([]);
        setIsEnrolarModalOpen(true);
    };

    // Guardar foto capturada y enrolar pastor en vivo
    const handleGuardarEnrolamiento = async () => {
        if (!pastorSeleccionadoParaEnrolar || !capturaSnapshot || enrolandoGuardando) return;

        setEnrolandoGuardando(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            const res = await fetch('/admin/actividades/asistencias/enrolar-rostro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    pastor_id: pastorSeleccionadoParaEnrolar.id,
                    imagen_base64: capturaSnapshot,
                    actividad_id: actividad.id,
                    actividad_sesion_id: sesionSeleccionada,
                    asistio_con_conyuge: asistioConConyuge,
                    kit_entregado: kitEntregado,
                    comida_entregada: comidaEntregada,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Actualizar estado del HUD
                setEstadoEscaneo('success');
                setUltimoPastor(data.pastor);
                setMensajeFeedback(data.message);
                setContadorPresentes(data.totalPresentes);
                playSound('success');

                if (data.asistencias && Array.isArray(data.asistencias)) {
                    setHistorial((prev) => [...data.asistencias, ...prev.slice(0, Math.max(0, 10 - data.asistencias.length))]);
                } else if (data.asistencia) {
                    setHistorial((prev) => [data.asistencia, ...prev.slice(0, 9)]);
                }

                // Extraer el descriptor facial de la nueva foto y añadirlo al FaceMatcher en memoria
                try {
                    const img = await faceapi.fetchImage(data.foto_url || capturaSnapshot);
                    const det = await faceapi
                        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
                        .withFaceLandmarks(true)
                        .withFaceDescriptor();

                    if (det) {
                        const newDescriptor = new faceapi.LabeledFaceDescriptors(
                            pastorSeleccionadoParaEnrolar.documento || String(pastorSeleccionadoParaEnrolar.id),
                            [det.descriptor]
                        );
                        labeledDescriptorsRef.current.push(newDescriptor);
                        const newMatcher = new faceapi.FaceMatcher(labeledDescriptorsRef.current, 0.60);
                        setFaceMatcher(newMatcher);
                        setTotalRostrosIndexados(labeledDescriptorsRef.current.length);
                    }
                } catch (e) {
                    console.warn('Descriptor extraction on enrolled photo failed', e);
                }

                setIsEnrolarModalOpen(false);
            } else {
                alert(data.message || 'Error al guardar el enrolamiento');
            }
        } catch (err) {
            console.error('Error al enrolar rostro:', err);
            alert('Error de conexión al guardar el rostro.');
        } finally {
            setEnrolandoGuardando(false);
        }
    };

    // Autofoco constante para pistola lectora USB / Bluetooth
    useEffect(() => {
        if (!autoFocusGun) return;
        const handleGlobalClick = () => {
            setTimeout(() => {
                const activeEl = document.activeElement;
                if (!activeEl || (activeEl.tagName !== 'INPUT' && activeEl.tagName !== 'TEXTAREA')) {
                    inputGunRef.current?.focus();
                }
            }, 300);
        };

        window.addEventListener('click', handleGlobalClick);
        inputGunRef.current?.focus();
        return () => window.removeEventListener('click', handleGlobalClick);
    }, [autoFocusGun]);

    // Atajos de teclado ergonómicos
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
            if (e.key === 'c' || e.key === 'C') setAsistioConConyuge((prev) => !prev);
            else if (e.key === 'k' || e.key === 'K') setKitEntregado((prev) => !prev);
            else if (e.key === 'm' || e.key === 'M') setComidaEntregada((prev) => !prev);
            else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
            else if (e.key === 'b' || e.key === 'B') setIsManualModalOpen(true);
            else if (e.key === 'e' || e.key === 'E') handleAbrirEnrolamiento();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
        }
    };

    const handleRevertir = async (asistenciaId: number) => {
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch(`/admin/actividades/asistencias/${asistenciaId}/revertir`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
            });
            const data = await res.json();
            if (data.success) {
                setHistorial((prev) => prev.filter((item) => item.id !== asistenciaId));
                setContadorPresentes(data.totalPresentes);
                playSound('duplicate');
            }
        } catch (err) {
            console.error('Error al revertir', err);
        }
    };

    const handleBuscarManual = async (term: string) => {
        setBusquedaManualQuery(term);
        if (term.length < 2) {
            setResultadosBusquedaManual([]);
            return;
        }

        setBuscandoManual(true);
        try {
            const res = await fetch(`/admin/actividades/asistencias/buscar-pastores?q=${encodeURIComponent(term)}`);
            const data = await res.json();
            setResultadosBusquedaManual(data);
        } catch (err) {
            console.error(err);
        } finally {
            setBuscandoManual(false);
        }
    };

    const handleSeleccionarManual = (pastor: PastorData) => {
        setIsManualModalOpen(false);
        setBusquedaManualQuery('');
        setResultadosBusquedaManual([]);
        procesarCodigo(pastor.documento || pastor.codigo, 'manual');
    };

    const getInitials = (name?: string) => {
        if (!name) return 'PA';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className="w-full min-h-svh bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans antialiased overflow-x-hidden">
            <Head title={`Terminal de Acreditación — ${actividad.nombre}`} />

            {/* TOP HEADER: BARRA DE CONTROL KIOSK */}
            <header className="p-2.5 sm:px-6 sm:py-3.5 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 shrink-0 shadow-lg z-20">
                <div className="max-w-[1780px] mx-auto flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
                    {/* IZQUIERDA: REGRESAR / LOGO + INFO ACTIVIDAD */}
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        {isAuth ? (
                            <Link href="/admin/actividades">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8 sm:size-9 rounded-xl border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                                    title="Volver al Panel de Actividades"
                                >
                                    <ArrowLeft className="size-4 sm:size-4.5" />
                                </Button>
                            </Link>
                        ) : (
                            <div className="size-8 sm:size-9 rounded-xl border border-indigo-500/40 bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                <QrCode className="size-4.5 sm:size-5" />
                            </div>
                        )}

                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="relative flex size-2 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                                </span>
                                <h1 className="text-xs sm:text-base font-extrabold text-white tracking-tight truncate max-w-[140px] sm:max-w-md lg:max-w-lg">
                                    {actividad.nombre}
                                </h1>
                                <Badge variant="secondary" className="hidden sm:inline-flex bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-[10px] sm:text-[11px] font-semibold">
                                    {actividad.tipo}
                                </Badge>
                                {!isAuth && (
                                    <Badge className="hidden sm:inline-flex bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                                        Público
                                    </Badge>
                                )}
                            </div>
                            <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5 sm:gap-2 mt-0.5 font-medium">
                                <span className="text-emerald-400 flex items-center gap-1 font-semibold truncate">
                                    <Radio className="size-2.5 sm:size-3 animate-pulse" /> Terminal Activo
                                </span>
                                {actividad.lugar && (
                                    <>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="truncate max-w-[150px] sm:max-w-[200px] hidden sm:flex items-center gap-1 text-slate-300">
                                            <MapPin className="size-3 text-slate-400" /> {actividad.lugar}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CENTRO: SELECTOR DE MODO VIA TABS (SHADCN/UI) */}
                    <div className="flex items-center order-3 sm:order-2 w-full sm:w-auto justify-center">
                        <Tabs value={modo} onValueChange={(val) => setModo(val as ModoEscaneo)} className="w-full sm:w-auto">
                            <TabsList className="bg-slate-950 border border-slate-800 p-1 rounded-xl h-9 sm:h-10 w-full sm:w-auto grid grid-cols-2 sm:flex">
                                <TabsTrigger
                                    value="qr"
                                    className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 rounded-lg px-2.5 sm:px-4 text-[11px] sm:text-xs font-bold gap-1.5 sm:gap-2 transition-all"
                                >
                                    <QrCode className="size-3.5" />
                                    <span>Carnet QR</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="facial"
                                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400 rounded-lg px-2.5 sm:px-4 text-[11px] sm:text-xs font-bold gap-1.5 sm:gap-2 transition-all"
                                >
                                    <ScanFace className="size-3.5" />
                                    <span>Biometría Facial</span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* DERECHA: SESIÓN + TOTAL ASISTENTES + CONTROLES */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5 order-2 sm:order-3">
                        {/* Botón de Instalar App PWA Móvil */}
                        {!isPwaInstalled && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleInstallPwa}
                                className="h-8 sm:h-9 px-2 sm:px-3 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-indigo-500/50 hover:bg-indigo-600/50 text-white rounded-xl text-[11px] sm:text-xs font-bold gap-1 sm:gap-1.5 shadow-sm transition-all cursor-pointer"
                                title="Instalar como aplicación en este dispositivo móvil"
                            >
                                <Smartphone className="size-3.5 text-indigo-300" />
                                <span className="hidden sm:inline">Instalar App</span>
                                <span className="sm:hidden">App</span>
                            </Button>
                        )}

                        {/* Selector de Sesión / Bloque */}
                        {actividad.sesiones.length > 0 && (
                            <div className="hidden md:flex items-center">
                                <Select
                                    value={sesionSeleccionada ? String(sesionSeleccionada) : undefined}
                                    onValueChange={(val) => setSesionSeleccionada(Number(val))}
                                >
                                    <SelectTrigger className="h-9 min-w-[150px] bg-slate-800/90 border-slate-700 text-xs font-bold text-white rounded-xl">
                                        <SelectValue placeholder="Seleccionar Sesión" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                                        {actividad.sesiones.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* KPI En Vivo de Asistentes */}
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-emerald-950/70 border border-emerald-500/40 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-emerald-300 shadow-sm shadow-emerald-950">
                            <Users className="size-3.5 sm:size-4 text-emerald-400" />
                            <div className="leading-none flex items-baseline gap-1">
                                <span className="text-sm sm:text-base font-black tracking-tight">{contadorPresentes}</span>
                                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-400/80">Presentes</span>
                            </div>
                        </div>

                        {/* Botón de Sonido */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsMuted((m) => !m)}
                            className="size-8 sm:size-9 rounded-xl border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white"
                            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
                        >
                            {isMuted ? <VolumeX className="size-3.5 sm:size-4 text-rose-400" /> : <Volume2 className="size-3.5 sm:size-4 text-emerald-400" />}
                        </Button>

                        {/* Pantalla Completa */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleFullscreen}
                            className="size-8 sm:size-9 rounded-xl border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white"
                            title="Pantalla Completa (F)"
                        >
                            {isFullscreen ? <Minimize2 className="size-3.5 sm:size-4" /> : <Maximize2 className="size-3.5 sm:size-4" />}
                        </Button>
                    </div>
                </div>
            </header>

            {/* BARRA LOGÍSTICA: SWITCHES DE SERVICIO + STATUS BIOMÉTRICO (Scroll horizontal suave en móviles) */}
            <div className="px-2.5 sm:px-6 py-2 bg-slate-900/60 border-b border-slate-800/60 shrink-0">
                <div className="max-w-[1780px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
                    {/* SWITCHES DE LOGÍSTICA RÁPIDA */}
                    <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] flex items-center gap-1.5 shrink-0">
                            <Package className="size-3.5 text-indigo-400" />
                            <span className="hidden sm:inline">Opciones de Acreditación:</span>
                            <span className="sm:hidden">Opciones:</span>
                        </span>

                        {actividad.permite_conyuge && (
                            <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none group shrink-0">
                                <Switch
                                    checked={asistioConConyuge}
                                    onCheckedChange={setAsistioConConyuge}
                                    className="data-[state=checked]:bg-pink-600 scale-90 sm:scale-100"
                                />
                                <span className={cn('text-[11px] sm:text-xs font-bold transition-colors flex items-center gap-1', asistioConConyuge ? 'text-pink-300' : 'text-slate-300 group-hover:text-white')}>
                                    <Heart className={cn('size-3 sm:size-3.5', asistioConConyuge && 'fill-pink-400 text-pink-400')} />
                                    + Cónyuge
                                </span>
                                <Badge variant="outline" className="hidden sm:inline-flex px-1.5 py-0 text-[10px] font-mono border-slate-700 text-slate-400">C</Badge>
                            </label>
                        )}

                        <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none group shrink-0">
                            <Switch
                                checked={kitEntregado}
                                onCheckedChange={setKitEntregado}
                                className="data-[state=checked]:bg-purple-600 scale-90 sm:scale-100"
                            />
                            <span className={cn('text-[11px] sm:text-xs font-bold transition-colors flex items-center gap-1', kitEntregado ? 'text-purple-300' : 'text-slate-300 group-hover:text-white')}>
                                <Package className="size-3 sm:size-3.5" />
                                Entregar Kit
                            </span>
                            <Badge variant="outline" className="hidden sm:inline-flex px-1.5 py-0 text-[10px] font-mono border-slate-700 text-slate-400">K</Badge>
                        </label>

                        {actividad.controla_comida && (
                            <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none group shrink-0">
                                <Switch
                                    checked={comidaEntregada}
                                    onCheckedChange={setComidaEntregada}
                                    className="data-[state=checked]:bg-amber-600 scale-90 sm:scale-100"
                                />
                                <span className={cn('text-[11px] sm:text-xs font-bold transition-colors flex items-center gap-1', comidaEntregada ? 'text-amber-300' : 'text-slate-300 group-hover:text-white')}>
                                    <Utensils className="size-3 sm:size-3.5" />
                                    Comedor
                                </span>
                                <Badge variant="outline" className="hidden sm:inline-flex px-1.5 py-0 text-[10px] font-mono border-slate-700 text-slate-400">M</Badge>
                            </label>
                        )}
                    </div>

                    {/* DERECHA: STATUS DE IA + ACCIONES RÁPIDAS */}
                    <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
                        {modo === 'facial' && (
                            <div className="flex items-center gap-1.5 sm:gap-2.5 bg-purple-950/60 border border-purple-500/30 px-2.5 sm:px-3 py-1 rounded-xl text-purple-200">
                                {cargandoModelos ? (
                                    <RefreshCw className="size-3 sm:size-3.5 animate-spin text-purple-400" />
                                ) : (
                                    <Sparkles className="size-3 sm:size-3.5 text-purple-400" />
                                )}
                                <span className="font-semibold text-[10px] sm:text-[11px] truncate max-w-[120px] sm:max-w-xs">{progresoEntrenamiento || 'IA activa'}</span>
                                {cargandoModelos && <Progress value={progresoPorcentaje} className="w-12 sm:w-16 h-1.5 bg-purple-950" />}
                            </div>
                        )}

                        <div className="flex items-center gap-1.5 sm:gap-2">
                            {modo === 'facial' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAbrirEnrolamiento}
                                    className="h-7 sm:h-8 px-2 sm:px-3 rounded-xl border-purple-500/40 text-purple-300 bg-purple-950/40 hover:bg-purple-900/60 hover:text-white font-bold text-[11px] sm:text-xs gap-1 sm:gap-1.5 shadow-sm"
                                    title="Capturar foto de la cámara para vincular a un pastor (E)"
                                >
                                    <UserPlus className="size-3 sm:size-3.5" />
                                    <span className="hidden sm:inline">Vincular Rostro (E)</span>
                                    <span className="sm:hidden">Rostro</span>
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsManualModalOpen(true)}
                                className="h-7 sm:h-8 px-2 sm:px-3 rounded-xl border-indigo-500/40 text-indigo-300 bg-indigo-950/30 hover:bg-indigo-900/50 hover:text-white font-bold text-[11px] sm:text-xs gap-1 sm:gap-1.5 shadow-sm"
                            >
                                <Search className="size-3 sm:size-3.5" />
                                <span className="hidden sm:inline">Búsqueda Manual (B)</span>
                                <span className="sm:hidden">Buscar</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL: CÁMARA (IZQUIERDA) + HUD TARJETA CREDENCIAL (DERECHA) */}
            <main className="flex-1 p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-[1780px] w-full mx-auto items-stretch">
                {/* COLUMNA IZQUIERDA: LECTOR ÓPTICO Y CÁMARA BIOMÉTRICA (5 COLS) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    <Card className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-900/90 border-slate-800 shadow-2xl backdrop-blur-sm relative">
                        {/* HEADER DEL VISOR */}
                        <CardHeader className="p-3.5 sm:px-4 sm:py-3 bg-slate-950/80 border-b border-slate-800/80 flex flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-2">
                                {modo === 'qr' ? (
                                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 gap-1.5 px-2.5 py-1">
                                        <QrCode className="size-3.5" />
                                        <span className="font-bold">Lector Óptico QR</span>
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 gap-1.5 px-2.5 py-1">
                                        <ScanFace className="size-3.5" />
                                        <span className="font-bold">Biometría Dinámica Facial</span>
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFacingMode((f) => (f === 'user' ? 'environment' : 'user'))}
                                    className="h-7 px-2.5 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                                >
                                    Girar Cámara
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCameraActive((c) => !c)}
                                    className="size-7 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                                    title={cameraActive ? 'Pausar cámara' : 'Encender cámara'}
                                >
                                    {cameraActive ? <Camera className="size-4 text-emerald-400" /> : <CameraOff className="size-4 text-slate-400" />}
                                </Button>
                            </div>
                        </CardHeader>

                        {/* VISOR DE CÁMARA CON OVERLAYS TÁCTICOS DINÁMICOS */}
                        <div className="relative aspect-video sm:aspect-4/3 bg-black flex items-center justify-center overflow-hidden flex-1 min-h-[300px]">
                            {cameraActive ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        className="w-full h-full object-cover"
                                        playsInline
                                        muted
                                    />
                                    {/* Canvas oculto para decodificación jsQR */}
                                    <canvas ref={canvasHiddenRef} className="hidden" />

                                    {/* Canvas transparente interactivo para tracking biométrico dinámico */}
                                    <canvas
                                        ref={overlayCanvasRef}
                                        className="absolute inset-0 w-full h-full pointer-events-none z-10"
                                    />

                                    {/* RETÍCULA QR CON LÁSER */}
                                    {modo === 'qr' && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="size-44 sm:size-60 md:size-72 relative border-2 border-dashed border-cyan-400/50 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.15)]">
                                                <div className="absolute top-0 left-0 size-5 sm:size-7 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl" />
                                                <div className="absolute top-0 right-0 size-5 sm:size-7 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl" />
                                                <div className="absolute bottom-0 left-0 size-5 sm:size-7 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl" />
                                                <div className="absolute bottom-0 right-0 size-5 sm:size-7 border-b-4 border-r-4 border-cyan-400 rounded-br-xl" />

                                                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse" />

                                                <Badge className="bg-black/80 text-cyan-300 border-cyan-500/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest absolute bottom-3 sm:bottom-4 px-2.5 sm:px-3 py-1 backdrop-blur-md">
                                                    Muestre el Carnet Ministerial
                                                </Badge>
                                            </div>
                                        </div>
                                    )}

                                    {/* BANNER DINÁMICO DE CONFIRMACIÓN EN MÓVIL (PWA Mobile Live Feedback) */}
                                    {ultimoPastor && (estadoEscaneo === 'success' || estadoEscaneo === 'duplicate' || estadoEscaneo === 'error') && (
                                        <div className="absolute top-3 left-3 right-3 z-30 lg:hidden animate-in slide-in-from-top-3 duration-300">
                                            <div className={cn(
                                                'p-2.5 sm:p-3 rounded-2xl flex items-center justify-between gap-2.5 shadow-2xl border backdrop-blur-md',
                                                estadoEscaneo === 'success' && 'bg-emerald-950/95 border-emerald-500/80 text-white shadow-emerald-950/50',
                                                estadoEscaneo === 'duplicate' && 'bg-amber-950/95 border-amber-500/80 text-amber-200 shadow-amber-950/50',
                                                estadoEscaneo === 'error' && 'bg-rose-950/95 border-rose-500/80 text-rose-200 shadow-rose-950/50'
                                            )}>
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    {ultimoPastor.foto ? (
                                                        <img src={ultimoPastor.foto} alt="" className="size-9 rounded-xl object-cover shrink-0 border border-white/20" />
                                                    ) : (
                                                        <div className="size-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-white shrink-0">
                                                            {getInitials(ultimoPastor.nombre_completo)}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-black truncate">{ultimoPastor.nombre_completo}</p>
                                                        <p className="text-[10px] opacity-90 truncate font-semibold">
                                                            {mensajeFeedback} • {ultimoPastor.nivel_ministerial || 'Pastor'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={cn('text-[10px] shrink-0 font-bold', estadoEscaneo === 'success' ? 'bg-emerald-500 text-slate-950' : estadoEscaneo === 'duplicate' ? 'bg-amber-500 text-slate-950' : 'bg-rose-500 text-white')}>
                                                    {estadoEscaneo === 'success' ? 'Acreditado' : estadoEscaneo === 'duplicate' ? 'Repetido' : 'Error'}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}

                                    {/* BANNER DINÁMICO FLOTANTE CUANDO NO COINCIDE EL ROSTRO */}
                                    {modo === 'facial' && rostroDetectado && estadoBiometrico === 'no_coincide' && (
                                        <div className="absolute bottom-4 left-4 right-4 z-20 animate-in slide-in-from-bottom-2 duration-200">
                                            <div className="p-3 rounded-2xl bg-slate-950/90 border border-amber-500/60 backdrop-blur-md flex items-center justify-between gap-3 shadow-2xl">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                                        <Sparkles className="size-3.5" /> Rostro en cámara detectado
                                                    </p>
                                                    <p className="text-[11px] text-slate-300 truncate">
                                                        ¿No estás en el padrón local? Vincula tu foto en un clic.
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={handleAbrirEnrolamiento}
                                                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shrink-0 gap-1.5 shadow-md"
                                                >
                                                    <UserPlus className="size-3.5" />
                                                    Vincular Rostro
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center p-8 space-y-3">
                                    <CameraOff className="size-12 text-slate-600 mx-auto" />
                                    <p className="text-sm text-slate-400 font-medium">La cámara se encuentra pausada</p>
                                    <Button
                                        size="sm"
                                        onClick={() => setCameraActive(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-xs text-white font-bold rounded-xl"
                                    >
                                        Reanudar Cámara
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* FOOTER DEL VISOR: ENTRADA PARA PISTOLA LECTORA USB */}
                        <CardFooter className="p-3.5 bg-slate-950 border-t border-slate-800/80 flex flex-col gap-2">
                            <div className="w-full flex items-center justify-between text-xs text-slate-400">
                                <span className="flex items-center gap-1.5 font-bold text-slate-300">
                                    <Barcode className="size-4 text-indigo-400" />
                                    Lector USB / Bluetooth
                                </span>
                                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-400 hover:text-slate-200">
                                    <input
                                        type="checkbox"
                                        checked={autoFocusGun}
                                        onChange={(e) => setAutoFocusGun(e.target.checked)}
                                        className="rounded border-slate-700 text-indigo-600 focus:ring-0 size-3.5"
                                    />
                                    <span>Mantener Foco</span>
                                </label>
                            </div>

                            <form
                                className="w-full"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    procesarCodigo(codigoManualInput, 'qr_carnet');
                                }}
                            >
                                <div className="relative">
                                    <Input
                                        ref={inputGunRef}
                                        placeholder="Escanee con pistola o escriba cédula y presione Enter..."
                                        value={codigoManualInput}
                                        onChange={(e) => setCodigoManualInput(e.target.value)}
                                        className="h-10 bg-slate-900 border-slate-700 text-white text-xs placeholder:text-slate-500 font-mono rounded-xl pr-10 focus-visible:ring-indigo-500"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        variant="ghost"
                                        className="absolute right-1 top-1 size-8 text-slate-400 hover:text-white"
                                        disabled={!codigoManualInput.trim() || isLoading}
                                    >
                                        <CheckCircle2 className="size-4 text-indigo-400" />
                                    </Button>
                                </div>
                            </form>
                        </CardFooter>
                    </Card>
                </div>

                {/* COLUMNA DERECHA: TARJETA HUD BIOMÉTRICA EJECUTIVA (7 COLS) */}
                <div className="lg:col-span-7 flex flex-col">
                    <Card
                        className={cn(
                            'flex-1 flex flex-col justify-between overflow-hidden border-2 bg-slate-900/90 shadow-2xl transition-all duration-300 relative',
                            estadoEscaneo === 'success' && 'border-emerald-500/80 bg-emerald-950/10 shadow-emerald-950/50',
                            estadoEscaneo === 'duplicate' && 'border-amber-500/80 bg-amber-950/10 shadow-amber-950/50',
                            estadoEscaneo === 'error' && 'border-rose-500/80 bg-rose-950/10 shadow-rose-950/50',
                            estadoEscaneo === 'idle' && 'border-slate-800'
                        )}
                    >
                        {/* ESTADO IDLE (EN ESPERA) */}
                        {estadoEscaneo === 'idle' && (
                            <div className="my-auto py-16 px-6 text-center space-y-5 animate-in fade-in duration-300">
                                <div className="size-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-400 shadow-inner">
                                    {modo === 'qr' ? (
                                        <QrCode className="size-12 animate-pulse" />
                                    ) : (
                                        <ScanFace className="size-12 animate-pulse text-purple-400" />
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                        {modo === 'qr' ? 'Listo para Acreditar' : 'Biometría Facial Dinámica Activa'}
                                    </h3>
                                    <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                                        {modo === 'qr'
                                            ? 'Acerque el carnet con código QR al visor de la cámara o pase la pistola lectora de código de barras.'
                                            : 'El sistema rastrea dinámicamente el rostro enfocado y verifica sus rasgos biométricos en tiempo real.'}
                                    </p>
                                </div>

                                <div className="pt-4 flex flex-wrap justify-center gap-3">
                                    {modo === 'facial' && (
                                        <Button
                                            onClick={handleAbrirEnrolamiento}
                                            variant="outline"
                                            className="border-purple-500/40 bg-purple-950/40 text-purple-200 hover:bg-purple-900/50 rounded-xl text-xs font-bold gap-2"
                                        >
                                            <UserPlus className="size-4" /> Vincular Rostro Actual (E)
                                        </Button>
                                    )}
                                    <Badge variant="outline" className="border-slate-800 bg-slate-950 text-slate-400 text-xs py-1.5 px-3">
                                        <Keyboard className="size-3.5 mr-1.5 text-indigo-400" /> Atajo "B" para búsqueda manual
                                    </Badge>
                                </div>
                            </div>
                        )}

                        {/* ESTADO ERROR (NO ENCONTRADO) */}
                        {estadoEscaneo === 'error' && (
                            <div className="my-auto py-12 px-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
                                <div className="size-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center shadow-lg shadow-rose-950/40">
                                    <XCircle className="size-10" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
                                        No Acreditado
                                    </h3>
                                    <p className="text-sm text-slate-300 max-w-md mx-auto font-medium">
                                        {mensajeFeedback}
                                    </p>
                                </div>

                                <div className="pt-2 flex justify-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsManualModalOpen(true)}
                                        className="border-rose-500/40 text-rose-300 bg-rose-950/30 hover:bg-rose-900/50 rounded-xl font-bold"
                                    >
                                        <Search className="size-3.5 mr-1.5" />
                                        Buscar en Padrón Manualmente
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEstadoEscaneo('idle')}
                                        className="text-slate-400 hover:text-white rounded-xl"
                                    >
                                        Limpiar
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* RESULTADO POSITIVO O DUPLICADO: TARJETA COMPLETA DEL PASTOR */}
                        {ultimoPastor && (estadoEscaneo === 'success' || estadoEscaneo === 'duplicate') && (
                            <div className="p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300 flex-1 flex flex-col justify-between">
                                {/* BANNER DE ESTADO */}
                                <div
                                    className={cn(
                                        'p-4 rounded-2xl flex items-center gap-3.5 font-extrabold shadow-lg',
                                        estadoEscaneo === 'success'
                                            ? 'bg-emerald-600 text-white shadow-emerald-950/50'
                                            : 'bg-amber-500 text-slate-950 shadow-amber-950/50'
                                    )}
                                >
                                    {estadoEscaneo === 'success' ? (
                                        <CheckCircle2 className="size-7 shrink-0" />
                                    ) : (
                                        <AlertTriangle className="size-7 shrink-0" />
                                    )}
                                    <div className="leading-tight">
                                        <span className="text-base sm:text-lg block">{mensajeFeedback}</span>
                                        <span className="text-xs font-semibold opacity-90">
                                            {estadoEscaneo === 'success' ? 'Registro confirmado en la base de datos' : 'Asistencia ya había sido registrada anteriormente'}
                                        </span>
                                    </div>
                                </div>

                                {/* TARJETA DE CREDENCIAL DEL PASTOR */}
                                <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                                    {/* FOTO CON AVATAR SHADCN */}
                                    <Avatar className="size-24 sm:size-36 md:size-44 rounded-2xl border-2 border-indigo-500/40 shrink-0 shadow-xl overflow-hidden">
                                        {ultimoPastor.foto && (
                                            <AvatarImage
                                                src={ultimoPastor.foto}
                                                alt={ultimoPastor.nombre_completo}
                                                className="object-cover object-top size-full"
                                            />
                                        )}
                                        <AvatarFallback className="rounded-2xl bg-indigo-950 text-indigo-200 font-extrabold text-2xl sm:text-3xl">
                                            {getInitials(ultimoPastor.nombre_completo)}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* DATOS MINISTERIALES */}
                                    <div className="space-y-2.5 sm:space-y-3.5 flex-1 text-center sm:text-left min-w-0 w-full sm:w-auto">
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                                            <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs rounded-lg">
                                                <BadgeCheck className="size-3 sm:size-3.5 mr-1" />
                                                {ultimoPastor.nivel_ministerial || 'Pastor'}
                                            </Badge>

                                            {ultimoPastor.codigo && (
                                                <Badge variant="outline" className="border-slate-700 bg-slate-900 text-slate-300 font-mono font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs rounded-lg">
                                                    CÓD: {ultimoPastor.codigo}
                                                </Badge>
                                            )}

                                            {ultimoPastor.zona && (
                                                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs rounded-lg">
                                                    Zona {ultimoPastor.zona}
                                                </Badge>
                                            )}
                                        </div>

                                        <div>
                                            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                                                {ultimoPastor.nombre_completo}
                                            </h2>
                                            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                                                Cédula: <span className="font-bold text-white tracking-wide">{ultimoPastor.documento}</span>
                                            </p>
                                        </div>

                                        {/* DETALLES DE SEDE E IGLESIA */}
                                        <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                    Presbiterio / Distrito
                                                </span>
                                                <span className="font-extrabold text-white text-sm block mt-0.5 truncate">
                                                    {ultimoPastor.zona ? `Zona ${ultimoPastor.zona}` : 'Nacional'}
                                                    {ultimoPastor.distrito ? ` • Dtto ${ultimoPastor.distrito}` : ''}
                                                </span>
                                            </div>

                                            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                    Iglesia / Sede
                                                </span>
                                                <span className="font-extrabold text-white text-sm block mt-0.5 truncate">
                                                    {ultimoPastor.iglesia || ultimoPastor.estado || 'Principal'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* CÓNYUGE ACREDITADA */}
                                        {ultimoPastor.nombre_conyuge && (
                                            <div className="p-2.5 rounded-xl bg-pink-950/40 border border-pink-500/30 flex items-center justify-center sm:justify-start gap-2 text-xs text-pink-300">
                                                <Heart className="size-4 fill-pink-400 text-pink-400 shrink-0" />
                                                <span className="font-semibold">
                                                    Esposa Acreditada: <strong className="text-white">{ultimoPastor.nombre_conyuge}</strong>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* CHIPS DE SERVICIOS ENTREGADOS */}
                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                                    <span className="text-[11px] text-slate-400 font-semibold mr-1">Logística de Entrega:</span>
                                    {asistioConConyuge && (
                                        <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs py-1">
                                            ✓ Con Cónyuge
                                        </Badge>
                                    )}
                                    {kitEntregado && (
                                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs py-1">
                                            ✓ Kit Entregado
                                        </Badge>
                                    )}
                                    {comidaEntregada && (
                                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs py-1">
                                            ✓ Comedor Autorizado
                                        </Badge>
                                    )}
                                    {!asistioConConyuge && !kitEntregado && !comidaEntregada && (
                                        <span className="text-xs text-slate-500">Solo registro de entrada</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* FOOTER DEL HUD */}
                        <CardFooter className="p-3.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-emerald-500" />
                                Sistema de Acreditación Oficial MMM Venezuela
                            </span>
                            <span className="font-mono">Atajos: C, K, M, F, B, E</span>
                        </CardFooter>
                    </Card>
                </div>
            </main>

            {/* CINTA INFERIOR: HISTORIAL DE ÚLTIMOS ASISTENTES (Scroll horizontal suave en móviles) */}
            <footer className="p-2.5 sm:px-6 sm:py-3.5 bg-slate-900/90 border-t border-slate-800 shrink-0 backdrop-blur-md pb-safe">
                <div className="max-w-[1780px] mx-auto">
                    <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                        <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 text-[10px] sm:text-[11px]">
                            <Clock className="size-3.5 text-indigo-400" />
                            Últimos Pastores Acreditados ({historial.length})
                        </span>
                        <span className="text-[11px] text-slate-500 hidden md:inline">
                            Presione el botón de revertir si registró a un asistente por equivocación
                        </span>
                    </div>

                    <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                        {historial.slice(0, 5).map((as) => (
                            <div
                                key={as.id}
                                className="min-w-[220px] sm:min-w-0 p-2 sm:p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 flex items-center justify-between gap-2 hover:border-slate-700 transition-colors shadow-sm shrink-0 sm:shrink"
                            >
                                <Avatar className="size-8 rounded-lg shrink-0">
                                    {as.foto && <AvatarImage src={as.foto} alt={as.nombre_completo} />}
                                    <AvatarFallback className="rounded-lg bg-slate-800 text-slate-300 text-xs font-bold">
                                        {getInitials(as.nombre_completo)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-white truncate text-xs leading-tight">
                                        {as.nombre_completo}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                        <span className="text-slate-300 font-mono">{as.hora}</span>
                                        {as.zona ? ` • Z-${as.zona}` : ''}
                                        {as.asistio_con_conyuge ? ' • +Esposa' : ''}
                                    </p>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRevertir(as.id)}
                                    className="size-7 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0"
                                    title="Revertir este registro"
                                >
                                    <RotateCcw className="size-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </footer>

            {/* MODAL PARA VINCULAR/ENROLAR ROSTRO CAPTURADO DESDE LA CÁMARA */}
            <Dialog open={isEnrolarModalOpen} onOpenChange={setIsEnrolarModalOpen}>
                <DialogContent className="max-w-xl bg-slate-900 text-white border-slate-800 rounded-2xl shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-black text-white">
                            <UserPlus className="size-5 text-purple-400" />
                            Vincular Rostro al Padrón Pastoral
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs">
                            Seleccione al pastor correspondiente para asociar esta captura de rostro. En adelante, el sistema lo reconocerá automáticamente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 pt-3">
                        {/* FOTO CAPTURADA */}
                        <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                            {capturaSnapshot ? (
                                <img
                                    src={capturaSnapshot}
                                    alt="Captura de rostro"
                                    className="w-full aspect-4/3 object-cover rounded-xl border-2 border-purple-500/50 shadow-md"
                                />
                            ) : (
                                <div className="w-full aspect-4/3 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500">
                                    <Camera className="size-8" />
                                </div>
                            )}
                            <Badge variant="outline" className="mt-2.5 text-[10px] border-purple-500/40 text-purple-300">
                                Captura en Tiempo Real
                            </Badge>
                        </div>

                        {/* BUSCADOR DE PASTOR */}
                        <div className="sm:col-span-7 space-y-3">
                            <div className="relative">
                                <Search className="size-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                                <Input
                                    placeholder="Buscar pastor por nombre o cédula..."
                                    value={busquedaManualQuery}
                                    onChange={(e) => handleBuscarManual(e.target.value)}
                                    className="pl-9 bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 rounded-xl h-10 text-xs"
                                    autoFocus
                                />
                            </div>

                            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                                {buscandoManual && (
                                    <div className="flex items-center justify-center py-4 gap-2 text-slate-400 text-xs">
                                        <RefreshCw className="size-3.5 animate-spin text-purple-400" />
                                        <span>Buscando...</span>
                                    </div>
                                )}

                                {resultadosBusquedaManual.map((p) => {
                                    const isSelected = pastorSeleccionadoParaEnrolar?.id === p.id;
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => setPastorSeleccionadoParaEnrolar(p)}
                                            className={cn(
                                                'p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2.5 text-xs',
                                                isSelected
                                                    ? 'bg-purple-950/70 border-purple-500 text-white shadow-sm'
                                                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                                            )}
                                        >
                                            <div className="min-w-0">
                                                <p className="font-bold truncate text-white leading-tight">
                                                    {p.nombres} {p.apellidos}
                                                </p>
                                                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                                    C.I. {p.documento} {p.zona ? `• Z-${p.zona}` : ''}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <Badge className="bg-purple-600 text-white text-[10px] px-2 py-0.5 shrink-0">
                                                    <Check className="size-3 mr-0.5" /> Seleccionado
                                                </Badge>
                                            )}
                                        </div>
                                    );
                                })}

                                {!buscandoManual && busquedaManualQuery.length >= 2 && resultadosBusquedaManual.length === 0 && (
                                    <p className="text-center py-4 text-xs text-slate-500">
                                        No se encontraron coincidencias.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEnrolarModalOpen(false)}
                            className="text-slate-400 hover:text-white"
                        >
                            Cancelar
                        </Button>

                        <Button
                            onClick={handleGuardarEnrolamiento}
                            disabled={!pastorSeleccionadoParaEnrolar || !capturaSnapshot || enrolandoGuardando}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl gap-2"
                        >
                            {enrolandoGuardando ? (
                                <>
                                    <RefreshCw className="size-3.5 animate-spin" /> Guardando...
                                </>
                            ) : (
                                <>
                                    <Check className="size-3.5" /> Guardar y Acreditar Asistencia
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL SHADCN/UI DE BÚSQUEDA MANUAL */}
            <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
                <DialogContent className="max-w-lg bg-slate-900 text-white border-slate-800 rounded-2xl shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-black text-white">
                            <Search className="size-5 text-indigo-400" />
                            Buscar Pastor en el Padrón
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs">
                            Utilice el buscador para acreditar a pastores que no tengan su carnet físico disponible.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        <div className="relative">
                            <Search className="size-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                            <Input
                                placeholder="Escriba nombre, apellido o número de cédula..."
                                value={busquedaManualQuery}
                                onChange={(e) => handleBuscarManual(e.target.value)}
                                className="pl-9 bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 rounded-xl h-10"
                                autoFocus
                            />
                        </div>

                        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                            {buscandoManual && (
                                <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-xs">
                                    <RefreshCw className="size-4 animate-spin text-indigo-400" />
                                    <span>Buscando en la base de datos...</span>
                                </div>
                            )}

                            {resultadosBusquedaManual.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => handleSeleccionarManual(p)}
                                    className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-indigo-950/50 hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar className="size-10 rounded-xl shrink-0">
                                            {p.foto && <AvatarImage src={p.foto} alt={p.nombre_completo} />}
                                            <AvatarFallback className="rounded-xl bg-slate-800 text-xs font-bold text-slate-300">
                                                {getInitials(p.nombre_completo)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="min-w-0">
                                            <p className="font-bold text-white text-xs truncate">
                                                {p.nombres} {p.apellidos}
                                            </p>
                                            <p className="text-slate-400 text-[11px] mt-0.5 truncate">
                                                C.I. <span className="text-slate-200">{p.documento}</span>
                                                {p.zona ? ` • Zona ${p.zona}` : ''}
                                                {p.nivel_ministerial ? ` • ${p.nivel_ministerial}` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold h-8 rounded-xl shrink-0">
                                        Acreditar
                                    </Button>
                                </div>
                            ))}

                            {!buscandoManual && busquedaManualQuery.length >= 2 && resultadosBusquedaManual.length === 0 && (
                                <div className="text-center py-8 text-slate-400 text-xs space-y-1">
                                    <p className="font-semibold text-slate-300">No se encontraron coincidencias</p>
                                    <p className="text-[11px]">Verifique el número de cédula o el apellido ingresado.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* MODAL INSTRUCCIONES PWA MÓVIL (iOS / Android) */}
            <Dialog open={showIosInstallModal} onOpenChange={setShowIosInstallModal}>
                <DialogContent className="max-w-md bg-slate-900 text-white border-slate-800 rounded-2xl shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold text-white">
                            <Smartphone className="size-5 text-indigo-400" />
                            Instalar Terminal en tu Teléfono Móvil
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs">
                            Instala esta aplicación directamente en tu dispositivo para abrirla a pantalla completa, con acceso rápido y máximo rendimiento de la cámara.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3.5 py-2 text-xs">
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                            <h4 className="font-bold text-indigo-400 flex items-center gap-1.5">
                                🍏 En iPhone / iPad (Safari):
                            </h4>
                            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
                                <li>Presiona el botón <strong className="text-white">Compartir</strong> (icono de cuadrado con flecha hacia arriba <Share2 className="size-3.5 inline mx-0.5 text-indigo-400" />).</li>
                                <li>Desplázate hacia abajo y presiona <strong className="text-white">"Añadir a la pantalla de inicio"</strong>.</li>
                                <li>Toca en <strong className="text-white">"Añadir"</strong> en la esquina superior derecha.</li>
                            </ol>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                                🤖 En Android (Chrome / Edge):
                            </h4>
                            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
                                <li>Presiona el menú de <strong className="text-white">tres puntos (⋮)</strong> en la esquina superior.</li>
                                <li>Selecciona <strong className="text-white">"Instalar aplicación"</strong> o <strong className="text-white">"Añadir a pantalla de inicio"</strong>.</li>
                                <li>Confirma la instalación para crear el acceso directo.</li>
                            </ol>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowIosInstallModal(false)}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white border-slate-700 font-bold"
                        >
                            Entendido
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
