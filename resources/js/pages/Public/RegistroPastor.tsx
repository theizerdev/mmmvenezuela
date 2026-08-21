import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    User,
    Church,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    IdCard,
    Calendar,
    Phone,
    Mail,
    Award,
    MapPin,
    AlertCircle,
    Camera,
    Sparkles,
    FileText,
    RefreshCw,
    X,
    Heart,
    Users,
    AlertTriangle,
    Loader2,
    Info,
    Scan,
    Check,
    Edit2,
    TrendingUp,
    UserCheck,
    Clock
} from 'lucide-react';
import PhotoEditorModal from '@/Components/PhotoEditorModal';

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface EstadoItem {
    id: number;
    nombre: string;
}

interface RegistroPastorProps {
    estados: EstadoItem[];
    gradosMinisteriales: string[];
    estadosCiviles: string[];
    generos?: string[];
    flash?: {
        success?: {
            codigo: string;
            nombre: string;
            mensaje: string;
        };
    };
}

export default function RegistroPastor({
    estados,
    gradosMinisteriales,
    estadosCiviles,
    generos = ['Masculino', 'Femenino'],
    flash
}: RegistroPastorProps) {
    const [step, setStep] = useState<number>(1);
    const [fotoCedulaPreview, setFotoCedulaPreview] = useState<string | null>(null);
    const [fotoPerfilPreview, setFotoPerfilPreview] = useState<string | null>(null);

    // OCR Escaneo de Cédula Estados
    const [isOcrAnalyzing, setIsOcrAnalyzing] = useState<boolean>(false);
    const [ocrStatusMessage, setOcrStatusMessage] = useState<string | null>(null);
    const [ocrVerified, setOcrVerified] = useState<boolean>(false);
    const [ocrMismatch, setOcrMismatch] = useState<boolean>(false);
    const [extractedCedulaNumber, setExtractedCedulaNumber] = useState<string | null>(null);

    // Modal Editor de Foto (Recorte, Rotación, Brillo/Contraste)
    const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
    const [editorImageSrc, setEditorImageSrc] = useState<string | null>(null);
    const [editorTarget, setEditorTarget] = useState<'foto_cedula' | 'foto'>('foto_cedula');

    // Validación de Cédula Principal duplicada en tiempo real
    const [isCheckingCedula, setIsCheckingCedula] = useState<boolean>(false);
    const [cedulaExiste, setCedulaExiste] = useState<boolean>(false);
    const [cedulaEsConyugeVinculado, setCedulaEsConyugeVinculado] = useState<boolean>(false);
    const [cedulaExistenteNombre, setCedulaExistenteNombre] = useState<string | null>(null);
    const [cedulaExistenteConyuge, setCedulaExistenteConyuge] = useState<string | null>(null);
    const [extensionCargadaPorConyuge, setExtensionCargadaPorConyuge] = useState<boolean>(false);

    // Validación de Cédula Cónyuge duplicada en tiempo real
    const [isCheckingCedulaConyuge, setIsCheckingCedulaConyuge] = useState<boolean>(false);
    const [cedulaConyugeExiste, setCedulaConyugeExiste] = useState<boolean>(false);
    const [cedulaConyugeEsVinculado, setCedulaConyugeEsVinculado] = useState<boolean>(false);
    const [cedulaConyugeExistenteNombre, setCedulaConyugeExistenteNombre] = useState<string | null>(null);

    // Cámara Estados
    const [cameraTarget, setCameraTarget] = useState<'foto_cedula' | 'foto' | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
    const [currentCameraIndex, setCurrentCameraIndex] = useState<number>(0);
    const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        nombres: '',
        apellidos: '',
        documento: '',
        genero: 'Masculino',
        fe_nacimiento: '',
        estado_civil: 'Casado(a)',
        nombre_conyuge: '',
        conyuge_pastorea: false,
        cedula_conyuge: '',
        telefono_tlf: '',
        email: '',

        nivel_ministerial: 'Ministro Ordenado',
        ano_promocion: '',

        nombre_extension: '',
        direccion_extension: '',
        estado_id: estados?.[0]?.id ? String(estados[0].id) : '',
        zona: '',
        distrito: '',

        miembros_activos: '',
        cantidad_campos_blancos: '',
        miembro_probante: '',
        tiempo_trabajo: '',
        iglesias_fundadas: '',
        pastores_ministerio: '',

        foto_cedula: null as File | null,
        foto: null as File | null,
    });

    const successData = flash?.success;

    // Función utilitaria para calcular la edad automáticamente
    const calculateAge = (dobString: string): number | null => {
        if (!dobString) return null;
        const birthDate = new Date(dobString);
        if (isNaN(birthDate.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? age : null;
    };

    const computedEdad = calculateAge(data.fe_nacimiento);

    // Cargar Tesseract.js dinámicamente para OCR en vivo
    useEffect(() => {
        if (!window.Tesseract) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    // Detectar cámaras disponibles
    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                const videoDevices = devices.filter((device) => device.kind === 'videoinput');
                setAvailableCameras(videoDevices);
            }).catch(() => { });
        }
    }, []);

    // Detener la cámara al desmontar
    useEffect(() => {
        return () => {
            stopCameraStream();
        };
    }, []);

    // Pre-procesar imagen en canvas para optimizar lectura OCR (Escala de grises + Alto Contraste)
    const preprocessImageForOcr = (imageSrc: string, degrees: number = 0): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(imageSrc);
                    return;
                }

                const rad = (degrees * Math.PI) / 180;
                const isRotated90or270 = degrees === 90 || degrees === 270;
                const targetW = isRotated90or270 ? img.height : img.width;
                const targetH = isRotated90or270 ? img.width : img.height;

                const zoomFactor = 1.15;
                const finalW = Math.max(1280, Math.round(targetW * zoomFactor));
                const finalH = Math.round(targetH * zoomFactor);

                canvas.width = finalW;
                canvas.height = finalH;

                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);

                if (degrees !== 0) {
                    ctx.rotate(rad);
                }

                const drawW = isRotated90or270 ? finalH : finalW;
                const drawH = isRotated90or270 ? finalW : finalH;

                ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
                ctx.restore();

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const d = imageData.data;

                for (let i = 0; i < d.length; i += 4) {
                    const avg = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
                    const v = avg > 122 ? 255 : 0;
                    d[i] = v;     // R
                    d[i + 1] = v; // G
                    d[i + 2] = v; // B
                }

                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.95));
            };
            img.onerror = () => resolve(imageSrc);
            img.src = imageSrc;
        });
    };

    // Ejecutar OCR automático sobre la imagen de la cédula cargada o capturada
    const analyzeCedulaWithOcr = async (imageUrl: string) => {
        setIsOcrAnalyzing(true);
        setOcrStatusMessage('Optimizando nitidez y escaneando OCR...');
        setOcrVerified(false);
        setOcrMismatch(false);
        setExtractedCedulaNumber(null);

        try {
            if (window.Tesseract) {
                // Pre-procesar imagen para máximo contraste de caracteres
                const processedImage = await preprocessImageForOcr(imageUrl);

                const result = await window.Tesseract.recognize(processedImage, 'eng', {
                    logger: (m: any) => {
                        if (m.status === 'recognizing text') {
                            setOcrStatusMessage(`Escaneando documento (${Math.round((m.progress || 0) * 100)}%)...`);
                        }
                    }
                });

                const normRawText = (result.data.text || '')
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toUpperCase()
                    .replace(/[^A-Z0-9\s]/g, ' ');

                const cleanTextDigits = normRawText.replace(/\D/g, '');
                const cleanDigitsInput = data.documento.replace(/\D/g, '');

                // Buscar secuencias de 7 u 8 dígitos (cédulas venezolanas)
                const matches = normRawText.match(/\b\d{7,8}\b/g) || [];

                // Extraer palabras de nombres/apellidos para validación cruzada (sin acentos)
                const normalizeWords = (str: string) =>
                    (str || '')
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toUpperCase()
                        .split(/\s+/)
                        .filter(p => p.length >= 2);

                const palabrasNombres = normalizeWords(data.nombres);
                const palabrasApellidos = normalizeWords(data.apellidos);

                const coincideNombre = palabrasNombres.length > 0 && palabrasNombres.some(p => normRawText.includes(p));
                const coincideApellido = palabrasApellidos.length > 0 && palabrasApellidos.some(p => normRawText.includes(p));
                const coincideNombresOApellidos = coincideNombre || coincideApellido;

                let coincideFecha = true;
                if (data.fe_nacimiento) {
                    const parts = data.fe_nacimiento.split('-');
                    if (parts.length === 3) {
                        const [yyyy, mmStr, ddStr] = parts;
                        const mmNum = parseInt(mmStr, 10);
                        const ddNum = parseInt(ddStr, 10);

                        const yy = yyyy.substring(2);
                        const mesNombres = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
                        const mesNombre = mesNombres[mmNum - 1] || '';

                        const ddPadded = ddNum < 10 ? `0${ddNum}` : `${ddNum}`;
                        const mmPadded = mmNum < 10 ? `0${mmNum}` : `${mmNum}`;

                        const datePatterns = [
                            `${ddPadded}/${mmPadded}/${yyyy}`, `${ddPadded}-${mmPadded}-${yyyy}`, `${ddPadded}.${mmPadded}.${yyyy}`, `${ddPadded} ${mmPadded} ${yyyy}`,
                            `${ddPadded}/${mmPadded}/${yy}`, `${ddPadded}-${mmPadded}-${yy}`, `${ddPadded}.${mmPadded}.${yy}`,
                            `${ddPadded} ${mesNombre} ${yyyy}`, `${ddPadded}-${mesNombre}-${yyyy}`, `${ddPadded}/${mesNombre}/${yyyy}`,
                            `${ddNum}/${mmNum}/${yyyy}`, `${ddNum}-${mmNum}-${yyyy}`, `${ddNum}/${mmNum}/${yy}`,
                            `${yyyy}-${mmPadded}-${ddPadded}`, `${yyyy}/${mmPadded}/${ddPadded}`
                        ];

                        const hasYear = normRawText.includes(yyyy) || normRawText.includes(` ${yy} `);
                        const hasDayOrMonth = normRawText.includes(ddPadded) || normRawText.includes(mmPadded) || (mesNombre && normRawText.includes(mesNombre));

                        coincideFecha = datePatterns.some(p => normRawText.includes(p)) || (hasYear && hasDayOrMonth);
                    }
                }

                let isCedulaMatch = false;
                let detectedCedulaNum: string | null = null;

                if (cleanDigitsInput) {
                    if (cleanTextDigits.includes(cleanDigitsInput) || matches.includes(cleanDigitsInput)) {
                        isCedulaMatch = true;
                        detectedCedulaNum = cleanDigitsInput;
                    } else if (matches.length > 0) {
                        detectedCedulaNum = matches[0];
                    } else if (cleanTextDigits.length >= 7) {
                        for (let len = 8; len >= 7; len--) {
                            for (let i = 0; i <= cleanTextDigits.length - len; i++) {
                                const sub = cleanTextDigits.substring(i, i + len);
                                if (sub.startsWith('1') || sub.startsWith('2') || sub.startsWith('3')) {
                                    detectedCedulaNum = sub;
                                    break;
                                }
                            }
                            if (detectedCedulaNum) break;
                        }
                    }

                    if (isCedulaMatch) {
                        if ((palabrasNombres.length > 0 || palabrasApellidos.length > 0) && !coincideNombresOApellidos) {
                            // Los nombres o apellidos ingresados no pertenecen a la Cédula
                            setOcrVerified(false);
                            setOcrMismatch(true);
                            setExtractedCedulaNumber(`V-${cleanDigitsInput}`);
                            setOcrStatusMessage(`⚠️ La Cédula V-${cleanDigitsInput} fue leída, pero los Nombres/Apellidos (${data.apellidos} ${data.nombres}) NO coinciden con los impresos en la foto.`);
                        } else if (data.fe_nacimiento && !coincideFecha) {
                            // La Fecha de Nacimiento no coincide
                            setOcrVerified(false);
                            setOcrMismatch(true);
                            setExtractedCedulaNumber(`V-${cleanDigitsInput}`);
                            setOcrStatusMessage(`⚠️ La Cédula V-${cleanDigitsInput} fue leída, pero la Fecha de Nacimiento (${data.fe_nacimiento}) no coincide con la impresa en la foto.`);
                        } else {
                            // Cédula, Nombres y Fecha validados con éxito
                            setOcrVerified(true);
                            setOcrMismatch(false);
                            setExtractedCedulaNumber(`V-${cleanDigitsInput}`);
                            setOcrStatusMessage(`✨ ¡Cédula V-${cleanDigitsInput}, Titular (${data.apellidos} ${data.nombres}) y Datos validados con OCR!`);
                        }
                    } else if (detectedCedulaNum && detectedCedulaNum !== cleanDigitsInput) {
                        setOcrVerified(false);
                        setOcrMismatch(true);
                        setExtractedCedulaNumber(`V-${detectedCedulaNum}`);
                        setOcrStatusMessage(`⚠️ La Cédula en la foto (V-${detectedCedulaNum}) NO coincide con la Cédula ingresada (V-${cleanDigitsInput}).`);
                    } else {
                        setOcrVerified(false);
                        setOcrMismatch(false);
                        setExtractedCedulaNumber(null);
                        setOcrStatusMessage('Imagen procesada. Asegúrese de colocar la Cédula bien iluminada.');
                    }
                } else if (matches.length > 0 || detectedCedulaNum) {
                    const finalNum = matches[0] || detectedCedulaNum;
                    setExtractedCedulaNumber(`V-${finalNum}`);
                    setOcrVerified(true);
                    setOcrMismatch(false);
                    setOcrStatusMessage(`Se detectó el N° de Cédula: V-${finalNum}`);
                    setData('documento', `V-${finalNum}`);
                } else {
                    setOcrVerified(false);
                    setOcrMismatch(false);
                    setOcrStatusMessage('Imagen de Cédula procesada.');
                }
            } else {
                setOcrVerified(false);
                setOcrStatusMessage('Fotografía de Cédula procesada.');
            }
        } catch (err) {
            console.error('Error en OCR:', err);
            setOcrVerified(false);
            setOcrStatusMessage('Imagen de Cédula adjuntada.');
        } finally {
            setIsOcrAnalyzing(false);
        }
    };

    // Verificar en tiempo real la cédula duplicada (Pastor Principal)
    const checkCedulaDuplicada = async (doc: string) => {
        const cleanDoc = doc.trim();
        if (!cleanDoc || cleanDoc.length < 5) {
            setCedulaExiste(false);
            setCedulaEsConyugeVinculado(false);
            setCedulaExistenteNombre(null);
            setCedulaExistenteConyuge(null);
            setExtensionCargadaPorConyuge(false);
            return;
        }

        setIsCheckingCedula(true);
        try {
            const resp = await fetch(`/registro-pastor/verificar-cedula/${encodeURIComponent(cleanDoc)}`);
            if (resp.ok) {
                const resData = await resp.json();
                if (resData.existe) {
                    if (resData.es_conyuge_vinculado) {
                        // Es un cónyuge vinculado previamente -> PERMITIR AVANZAR
                        setCedulaExiste(false);
                        setCedulaEsConyugeVinculado(true);

                        // Auto-completar y corregir datos personales del titular simultáneamente
                        setData(prev => ({
                            ...prev,
                            nombres: resData.nombres || prev.nombres,
                            apellidos: resData.apellidos || prev.apellidos,
                            genero: resData.genero || prev.genero,
                            fe_nacimiento: resData.fe_nacimiento || prev.fe_nacimiento,
                            nombre_conyuge: resData.nombre_conyuge || prev.nombre_conyuge,
                            estado_civil: resData.estado_civil || prev.estado_civil,
                        }));

                        // Pre-cargar extensión de su cónyuge si existe
                        if (resData.extension) {
                            setExtensionCargadaPorConyuge(true);
                            setData(prev => ({
                                ...prev,
                                nombre_extension: resData.extension.nombre || prev.nombre_extension,
                                estado_id: resData.extension.estado_id ? String(resData.extension.estado_id) : prev.estado_id,
                                zona: resData.extension.zona || prev.zona,
                                distrito: resData.extension.distrito || prev.distrito,
                                direccion_extension: resData.extension.direccion || prev.direccion_extension,
                                miembros_activos: resData.extension.miembros_activos !== undefined && resData.extension.miembros_activos !== null ? String(resData.extension.miembros_activos) : prev.miembros_activos,
                                cantidad_campos_blancos: resData.extension.cantidad_campos_blancos !== undefined && resData.extension.cantidad_campos_blancos !== null ? String(resData.extension.cantidad_campos_blancos) : prev.cantidad_campos_blancos,
                                miembro_probante: resData.extension.miembro_probante !== undefined && resData.extension.miembro_probante !== null ? String(resData.extension.miembro_probante) : prev.miembro_probante,
                                tiempo_trabajo: resData.extension.tiempo_trabajo || prev.tiempo_trabajo,
                                iglesias_fundadas: resData.extension.iglesias_fundadas !== undefined && resData.extension.iglesias_fundadas !== null ? String(resData.extension.iglesias_fundadas) : prev.iglesias_fundadas,
                                pastores_ministerio: resData.extension.pastores_ministerio !== undefined && resData.extension.pastores_ministerio !== null ? String(resData.extension.pastores_ministerio) : prev.pastores_ministerio,
                            }));
                        }
                    } else {
                        // Es una cédula ya registrada por completo -> BLOQUEAR
                        setCedulaExiste(true);
                        setCedulaEsConyugeVinculado(false);
                    }
                    setCedulaExistenteNombre(resData.nombre || null);
                    setCedulaExistenteConyuge(resData.nombre_conyuge || null);
                } else {
                    setCedulaExiste(false);
                    setCedulaEsConyugeVinculado(false);
                    setCedulaExistenteNombre(null);
                    setCedulaExistenteConyuge(null);
                    setExtensionCargadaPorConyuge(false);
                }
            }
        } catch (err) {
            console.error('Error al verificar cédula:', err);
        } finally {
            setIsCheckingCedula(false);
        }
    };

    // Verificar en tiempo real la cédula duplicada (Cónyuge Pastor)
    const checkCedulaConyugeDuplicada = async (doc: string) => {
        const cleanDoc = doc.trim();
        if (!cleanDoc || cleanDoc.length < 5) {
            setCedulaConyugeExiste(false);
            setCedulaConyugeEsVinculado(false);
            setCedulaConyugeExistenteNombre(null);
            return;
        }

        setIsCheckingCedulaConyuge(true);
        try {
            const resp = await fetch(`/registro-pastor/verificar-cedula/${encodeURIComponent(cleanDoc)}`);
            if (resp.ok) {
                const resData = await resp.json();
                if (resData.existe) {
                    if (resData.es_conyuge_vinculado) {
                        setCedulaConyugeExiste(false);
                        setCedulaConyugeEsVinculado(true);
                    } else {
                        setCedulaConyugeExiste(true);
                        setCedulaConyugeEsVinculado(false);
                    }
                    setCedulaConyugeExistenteNombre(resData.nombre || null);
                } else {
                    setCedulaConyugeExiste(false);
                    setCedulaConyugeEsVinculado(false);
                    setCedulaConyugeExistenteNombre(null);
                }
            }
        } catch (err) {
            console.error('Error al verificar cédula cónyuge:', err);
        } finally {
            setIsCheckingCedulaConyuge(false);
        }
    };

    const stopCameraStream = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
        }
    };

    const startCamera = async (target: 'foto_cedula' | 'foto', mode?: 'user' | 'environment', deviceIndex?: number) => {
        stopCameraStream();
        setCameraError(null);
        setIsCameraLoading(true);
        setCameraTarget(target);

        // Si es foto de cédula, preferir la cámara trasera en móviles para mayor nitidez
        const defaultMode = target === 'foto_cedula' ? 'environment' : 'user';
        const targetFacingMode = mode || defaultMode;
        const targetIndex = deviceIndex !== undefined ? deviceIndex : currentCameraIndex;

        try {
            let constraints: MediaStreamConstraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                }
            };

            if (availableCameras.length > 1 && availableCameras[targetIndex]) {
                constraints = {
                    video: {
                        deviceId: { exact: availableCameras[targetIndex].deviceId },
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                };
            } else {
                constraints = {
                    video: {
                        facingMode: targetFacingMode,
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                };
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            mediaStreamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setIsCameraLoading(false);
        } catch (err: any) {
            console.error('Camera error:', err);
            setIsCameraLoading(false);
            setCameraError('No se pudo acceder a la cámara. Por favor permite los permisos o intenta subir un archivo.');
        }
    };

    const flipCamera = () => {
        if (availableCameras.length > 1) {
            const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
            setCurrentCameraIndex(nextIndex);
            if (cameraTarget) {
                startCamera(cameraTarget, facingMode, nextIndex);
            }
        } else {
            const newMode = facingMode === 'user' ? 'environment' : 'user';
            setFacingMode(newMode);
            if (cameraTarget) {
                startCamera(cameraTarget, newMode);
            }
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !cameraTarget) return;

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

            canvas.toBlob((blob) => {
                if (blob) {
                    const filename = `${cameraTarget}_${Date.now()}.jpg`;
                    const file = new File([blob], filename, { type: 'image/jpeg' });
                    setData(cameraTarget, file);

                    if (cameraTarget === 'foto_cedula') {
                        setFotoCedulaPreview(dataUrl);
                        analyzeCedulaWithOcr(dataUrl);
                    } else {
                        setFotoPerfilPreview(dataUrl);
                    }
                    closeCameraModal();
                }
            }, 'image/jpeg', 0.95);
        }
    };

    const closeCameraModal = () => {
        stopCameraStream();
        setCameraTarget(null);
        setCameraError(null);
    };

    const autoCorregirFotoDirecta = (
        imageSrc: string,
        field: 'foto_cedula' | 'foto',
        forcedDegrees?: number
    ) => {
        setIsOcrAnalyzing(true);
        setOcrStatusMessage('🪄 Auto-corregiendo orientación de frente, zoom y contraste...');

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const isVertical = img.height > img.width;
            let degrees = forcedDegrees;
            if (degrees === undefined) {
                // Rotar 270° (-90° anti-horario) para orientar el texto hacia la parte superior y de frente
                degrees = (field === 'foto_cedula' && isVertical) ? 270 : 0;
            }

            const rad = (degrees * Math.PI) / 180;
            const isRotated90or270 = degrees === 90 || degrees === 270;

            const targetW = isRotated90or270 ? img.height : img.width;
            const targetH = isRotated90or270 ? img.width : img.height;

            const zoomFactor = field === 'foto_cedula' ? 1.15 : 1.05;
            const finalW = Math.max(1280, Math.round(targetW * zoomFactor));
            const finalH = Math.round(targetH * zoomFactor);

            canvas.width = finalW;
            canvas.height = finalH;

            ctx.save();
            ctx.filter = 'brightness(115%) contrast(125%)';
            ctx.translate(canvas.width / 2, canvas.height / 2);

            if (degrees !== 0) {
                ctx.rotate(rad);
            }

            const drawW = isRotated90or270 ? finalH : finalW;
            const drawH = isRotated90or270 ? finalW : finalH;

            ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.restore();

            const correctedDataUrl = canvas.toDataURL('image/jpeg', 0.95);

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `${field}_autocorregida.jpg`, { type: 'image/jpeg' });
                    setData(field, file);

                    if (field === 'foto_cedula') {
                        setFotoCedulaPreview(correctedDataUrl);
                        analyzeCedulaWithOcr(correctedDataUrl);
                    } else {
                        setFotoPerfilPreview(correctedDataUrl);
                        setIsOcrAnalyzing(false);
                    }
                }
            }, 'image/jpeg', 0.95);
        };
        img.src = imageSrc;
    };

    const autoCorregirFoto = (field: 'foto_cedula' | 'foto') => {
        const imageSrc = field === 'foto_cedula' ? fotoCedulaPreview : fotoPerfilPreview;
        if (imageSrc) {
            autoCorregirFotoDirecta(imageSrc, field);
        }
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: 'foto_cedula' | 'foto'
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setData(field, file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const res = reader.result as string;
                if (field === 'foto_cedula') {
                    setFotoCedulaPreview(res);

                    // Auto-detectar si la imagen de la cédula es vertical para rotarla horizontalmente de inmediato
                    const checkImg = new Image();
                    checkImg.onload = () => {
                        if (checkImg.height > checkImg.width) {
                            autoCorregirFotoDirecta(res, field);
                        } else {
                            analyzeCedulaWithOcr(res);
                        }
                    };
                    checkImg.src = res;
                } else {
                    setFotoPerfilPreview(res);
                }
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleEditorSave = (file: File, dataUrl: string) => {
        if (editorTarget === 'foto_cedula') {
            setFotoCedulaPreview(dataUrl);
            setData('foto_cedula', file);
            analyzeCedulaWithOcr(dataUrl);
        } else {
            setFotoPerfilPreview(dataUrl);
            setData('foto', file);
        }
    };

    const nextStep = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        if (step === 1 && (cedulaExiste || cedulaConyugeExiste)) {
            return;
        }
        if (step < 3) setStep((prev) => prev + 1);
    };

    const prevStep = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        if (step > 1) setStep((prev) => prev - 1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) {
            if (step === 1 && (cedulaExiste || cedulaConyugeExiste)) return;
            setStep((prev) => prev + 1);
            return;
        }
        if (ocrMismatch) {
            alert('⚠️ ATENCIÓN: La foto de la Cédula cargada (V- ' + extractedCedulaNumber + ') NO coincide con la Cédula del pastor a registrar (' + data.documento + '). Por favor suba la Cédula correcta.');
            return;
        }
        post('/registro-pastor', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setStep(4);
            },
        });
    };

    return (
        <>
            <Head title="Registro de Pastores y Extensión - Movimiento Misionero Mundial Venezuela" />

            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
                {/* Header Institucional Claro */}
                <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-xs">
                    <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="/icons/logo_mmm-a-color-sin-fondo.png"
                                alt="Logo MMM"
                                className="h-11 w-auto object-contain drop-shadow-xs"
                                onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                }}
                            />
                            <div>
                                <h1 className="text-xs md:text-sm font-black tracking-wider uppercase text-blue-900">
                                    MOVIMIENTO MISIONERO MUNDIAL
                                </h1>
                                <p className="text-xs text-slate-500 font-medium">
                                    Oficina Nacional de Venezuela • Censo Pastoral
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 border-blue-200 font-medium">
                            <ShieldCheck className="size-3.5 text-emerald-600" />
                            <span>Formulario Oficial</span>
                        </Badge>
                    </div>
                </header>

                {/* Contenido Principal */}
                <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12">
                    {/* Pantalla de Éxito al Completar */}
                    {step === 4 || successData ? (
                        <Card className="bg-white border-slate-200 shadow-xl rounded-3xl p-6 md:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            <div className="size-20 mx-auto bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center shadow-md">
                                <CheckCircle2 className="size-10 text-emerald-600 stroke-[2.5]" />
                            </div>

                            <div className="space-y-2">
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs px-3 py-1 font-bold uppercase tracking-wider">
                                    ¡Registro Recibido Exitosamente!
                                </Badge>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                                    {successData?.nombre || `${data.nombres} ${data.apellidos}`}
                                </h2>
                                <p className="text-slate-600 text-sm max-w-md mx-auto">
                                    Tus datos y la información de la extensión han sido registrados en nuestro censo pastoral nacional.
                                </p>
                            </div>

                            {/* Tarjeta de Código Generado */}
                            {successData?.codigo && (
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto space-y-2 shadow-inner">
                                    <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                                        Código Eclesiástico Asignado
                                    </span>
                                    <div className="text-2xl md:text-3xl font-mono font-black text-blue-900 tracking-widest select-all">
                                        {successData.codigo}
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        Guarda este código para tus consultas y trámites eclesiásticos.
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 flex justify-center gap-4">
                                <Button
                                    onClick={() => {
                                        reset();
                                        setFotoCedulaPreview(null);
                                        setFotoPerfilPreview(null);
                                        setCedulaExiste(false);
                                        setCedulaEsConyugeVinculado(false);
                                        setCedulaExistenteNombre(null);
                                        setCedulaExistenteConyuge(null);
                                        setCedulaConyugeExiste(false);
                                        setCedulaConyugeEsVinculado(false);
                                        setCedulaConyugeExistenteNombre(null);
                                        setExtensionCargadaPorConyuge(false);
                                        setStep(1);
                                    }}
                                    variant="outline"
                                    className="border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
                                >
                                    Registrar otro Pastor
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <Card className="bg-white border-slate-200 shadow-xl rounded-3xl overflow-hidden">
                            {/* Stepper Header Radix */}
                            <CardHeader className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white p-6 md:p-8 border-b border-blue-800">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white">
                                            <Sparkles className="size-5 text-amber-400" />
                                            Censo Nacional de Pastores
                                        </CardTitle>
                                        <CardDescription className="text-xs text-blue-100 mt-1">
                                            Ingresa la información requerida del pastor y su extensión eclesiástica.
                                        </CardDescription>
                                    </div>
                                    <Badge className="bg-blue-800/80 text-blue-100 border border-blue-700 text-xs px-3 py-1 font-semibold">
                                        Paso {step} de 3
                                    </Badge>
                                </div>

                                {/* Barra de Progreso */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div className={`h-2 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-amber-400' : 'bg-blue-950/60'}`} />
                                    <div className={`h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-amber-400' : 'bg-blue-950/60'}`} />
                                    <div className={`h-2 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-amber-400' : 'bg-blue-950/60'}`} />
                                </div>

                                {/* Etiquetas del Stepper */}
                                <div className="grid grid-cols-3 gap-2 text-[11px] font-medium text-blue-200 mt-2 text-center">
                                    <span className={step === 1 ? 'text-amber-300 font-bold' : ''}>1. Datos del Pastor</span>
                                    <span className={step === 2 ? 'text-amber-300 font-bold' : ''}>2. Extensión y Ministerio</span>
                                    <span className={step === 3 ? 'text-amber-300 font-bold' : ''}>3. Documentos y Fotos</span>
                                </div>
                            </CardHeader>

                            {/* Formulario */}
                            <form onSubmit={handleSubmit}>
                                <CardContent className="p-6 md:p-8 space-y-6">
                                    {/* PASO 1: DATOS PERSONALES */}
                                    {step === 1 && (
                                        <div className="space-y-6 animate-in fade-in duration-200">
                                            <div className="border-b border-slate-200 pb-3 flex items-center gap-2 text-blue-900 font-bold text-sm">
                                                <User className="size-4 text-blue-700" />
                                                <span>Información Personal y Contacto</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Nombres */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="nombres" className="text-xs font-semibold text-slate-700">
                                                        Nombres <span className="text-rose-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="nombres"
                                                        type="text"
                                                        required
                                                        value={data.nombres}
                                                        onChange={(e) => setData('nombres', e.target.value)}
                                                        placeholder="Ej. Juan Carlos"
                                                        className="bg-slate-50/50 border-slate-300 focus:bg-white"
                                                    />
                                                    {errors.nombres && <p className="text-xs text-rose-500">{errors.nombres}</p>}
                                                </div>

                                                {/* Apellidos */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="apellidos" className="text-xs font-semibold text-slate-700">
                                                        Apellidos <span className="text-rose-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="apellidos"
                                                        type="text"
                                                        required
                                                        value={data.apellidos}
                                                        onChange={(e) => setData('apellidos', e.target.value)}
                                                        placeholder="Ej. Pérez Rodríguez"
                                                        className="bg-slate-50/50 border-slate-300 focus:bg-white"
                                                    />
                                                    {errors.apellidos && <p className="text-xs text-rose-500">{errors.apellidos}</p>}
                                                </div>

                                                {/* Cédula con Validación en Tiempo Real */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="documento" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                            <IdCard className="size-3.5 text-slate-500" />
                                                            Cédula de Identidad <span className="text-rose-500">*</span>
                                                        </Label>
                                                        {isCheckingCedula && (
                                                            <span className="text-[11px] text-blue-700 flex items-center gap-1 font-medium">
                                                                <Loader2 className="size-3 animate-spin" />
                                                                Verificando...
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Input
                                                        id="documento"
                                                        type="text"
                                                        required
                                                        value={data.documento}
                                                        onChange={(e) => {
                                                            setData('documento', e.target.value);
                                                            checkCedulaDuplicada(e.target.value);
                                                        }}
                                                        onBlur={(e) => checkCedulaDuplicada(e.target.value)}
                                                        placeholder="Ej. V-12345678"
                                                        className={`bg-slate-50/50 focus:bg-white ${cedulaExiste ? 'border-rose-500 ring-rose-500/20 ring-2' : cedulaEsConyugeVinculado ? 'border-indigo-500 ring-indigo-500/20 ring-2' : 'border-slate-300'}`}
                                                    />
                                                    {errors.documento && <p className="text-xs text-rose-500">{errors.documento}</p>}

                                                    {/* Alerta 1: Cédula de un Pastor Completo (Bloqueante) */}
                                                    {cedulaExiste && (
                                                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 font-medium animate-in fade-in duration-150">
                                                            <AlertTriangle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                                                            <div>
                                                                <p className="font-bold">¡Cédula de Identidad Ya Registrada!</p>
                                                                <p className="text-[11px] text-rose-700 mt-0.5">
                                                                    La cédula <b>{data.documento}</b> pertenece al pastor registrado: <b>{cedulaExistenteNombre}</b>
                                                                    {cedulaExistenteConyuge && (
                                                                        <span> (Casado/a con <b>{cedulaExistenteConyuge}</b>)</span>
                                                                    )}.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Alerta 2: Cédula de Cónyuge Pre-Vinculado (Informativa y Permitida) */}
                                                    {cedulaEsConyugeVinculado && (
                                                        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-2.5 text-xs text-indigo-950 font-medium animate-in fade-in duration-150 shadow-2xs">
                                                            <Info className="size-4 shrink-0 text-indigo-600 mt-0.5" />
                                                            <div>
                                                                <p className="font-bold text-indigo-900">
                                                                    Censo de Cónyuge Pastor Detectado
                                                                </p>
                                                                <p className="text-[11px] text-indigo-800 mt-0.5 leading-relaxed">
                                                                    La cédula <b>{data.documento}</b> fue relacionada previamente al registrar al cónyuge <b>{cedulaExistenteConyuge || 'Pastor'}</b>.
                                                                    Al avanzar, completarás el registro oficial para <b>{cedulaExistenteNombre || 'el titular'}</b>.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Género */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-slate-700">
                                                        Género <span className="text-rose-500">*</span>
                                                    </Label>
                                                    <Select
                                                        value={data.genero}
                                                        onValueChange={(val) => setData('genero', val)}
                                                    >
                                                        <SelectTrigger className="bg-slate-50/50 border-slate-300 w-full">
                                                            <SelectValue placeholder="Selecciona género" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white border-slate-200">
                                                            {generos.map((g) => (
                                                                <SelectItem key={g} value={g}>
                                                                    {g}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.genero && <p className="text-xs text-rose-500">{errors.genero}</p>}
                                                </div>

                                                {/* Fecha de Nacimiento y Edad Calculada */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="fe_nacimiento" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                            <Calendar className="size-3.5 text-slate-500" />
                                                            Fecha de Nacimiento <span className="text-rose-500">*</span>
                                                        </Label>
                                                        {computedEdad !== null && (
                                                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[11px] font-bold px-2.5 py-0.5">
                                                                {computedEdad} años
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <Input
                                                        id="fe_nacimiento"
                                                        type="date"
                                                        required
                                                        value={data.fe_nacimiento}
                                                        onChange={(e) => setData('fe_nacimiento', e.target.value)}
                                                        className="bg-slate-50/50 border-slate-300 focus:bg-white"
                                                    />
                                                    {errors.fe_nacimiento && <p className="text-xs text-rose-500">{errors.fe_nacimiento}</p>}
                                                </div>

                                                {/* Estado Civil (Radix UI Select) */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-slate-700">
                                                        Estado Civil <span className="text-rose-500">*</span>
                                                    </Label>
                                                    <Select
                                                        value={data.estado_civil}
                                                        onValueChange={(val) => {
                                                            setData('estado_civil', val);
                                                            if (val !== 'Casado(a)') {
                                                                setData('nombre_conyuge', '');
                                                                setData('conyuge_pastorea', false);
                                                                setData('cedula_conyuge', '');
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className="bg-slate-50/50 border-slate-300 w-full">
                                                            <SelectValue placeholder="Selecciona estado civil" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white border-slate-200">
                                                            {estadosCiviles.map((ec) => (
                                                                <SelectItem key={ec} value={ec}>
                                                                    {ec}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.estado_civil && <p className="text-xs text-rose-500">{errors.estado_civil}</p>}
                                                </div>

                                                {/* Teléfono Móvil */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="telefono_tlf" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                        <Phone className="size-3.5 text-slate-500" />
                                                        Teléfono Móvil <span className="text-rose-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="telefono_tlf"
                                                        type="tel"
                                                        required
                                                        value={data.telefono_tlf}
                                                        onChange={(e) => setData('telefono_tlf', e.target.value)}
                                                        placeholder="Ej. 0414-1234567"
                                                        className="bg-slate-50/50 border-slate-300 focus:bg-white"
                                                    />
                                                    {errors.telefono_tlf && <p className="text-xs text-rose-500">{errors.telefono_tlf}</p>}
                                                </div>

                                                {/* Correo Electrónico */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="email" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                        <Mail className="size-3.5 text-slate-500" />
                                                        Correo Electrónico
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        placeholder="Ej. pastor@ejemplo.com"
                                                        className="bg-slate-50/50 border-slate-300 focus:bg-white"
                                                    />
                                                    {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
                                                </div>

                                                {/* SECCIÓN ESPECIAL PARA CÓNYUGE: Si el estado civil es Casado(a) */}
                                                {data.estado_civil === 'Casado(a)' && (
                                                    cedulaEsConyugeVinculado ? (
                                                        /* Si es un cónyuge ya vinculado por la otra cédula, mostramos una tarjeta elegante con su cónyuge */
                                                        <div className="md:col-span-2 mt-2 p-4 bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-indigo-50/80 border border-indigo-200/80 rounded-2xl flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
                                                            <div className="space-y-1">
                                                                <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider flex items-center gap-1.5">
                                                                    <Heart className="size-3.5 text-rose-500 fill-rose-500" />
                                                                    <span>Cónyuge Pastor Vinculado</span>
                                                                </span>
                                                                <p className="text-base font-black text-indigo-950">
                                                                    {cedulaExistenteConyuge || data.nombre_conyuge || 'Pastor Registrado'}
                                                                </p>
                                                                <p className="text-[11px] text-slate-600">
                                                                    Tu registro se encuentra vinculado al de tu cónyuge. Ambos compartirán la misma extensión eclesiástica.
                                                                </p>
                                                            </div>
                                                            <Badge className="bg-indigo-700 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shrink-0">
                                                                Vinculado ✓
                                                            </Badge>
                                                        </div>
                                                    ) : (
                                                        /* Si es un registro nuevo regular de casado, solicitamos el nombre del cónyuge */
                                                        <div className="md:col-span-2 mt-2 p-4 bg-indigo-50/60 border border-indigo-200/80 rounded-2xl space-y-4 animate-in fade-in duration-200">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="nombre_conyuge" className="text-xs font-semibold text-indigo-900 flex items-center gap-1">
                                                                    <Heart className="size-3.5 text-rose-500 fill-rose-500" />
                                                                    Nombre Completo de su Cónyuge <span className="text-rose-500">*</span>
                                                                </Label>
                                                                <Input
                                                                    id="nombre_conyuge"
                                                                    type="text"
                                                                    required={data.estado_civil === 'Casado(a)'}
                                                                    value={data.nombre_conyuge}
                                                                    onChange={(e) => setData('nombre_conyuge', e.target.value)}
                                                                    placeholder="Ej. María Elena de Pérez"
                                                                    className="bg-white border-indigo-200 focus:border-indigo-500"
                                                                />
                                                                {errors.nombre_conyuge && <p className="text-xs text-rose-500">{errors.nombre_conyuge}</p>}
                                                            </div>

                                                            <div className="flex items-center justify-between pt-2 border-t border-indigo-200/60">
                                                                <div className="space-y-0.5">
                                                                    <Label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                                                                        <Users className="size-4 text-indigo-700" />
                                                                        <span>¿Su cónyuge también está pastoreando?</span>
                                                                    </Label>
                                                                    <p className="text-[11px] text-slate-500">
                                                                        Active esta opción para registrar a su cónyuge como pastor y vincular ambas cédulas eclesiásticas.
                                                                    </p>
                                                                </div>
                                                                <Switch
                                                                    checked={data.conyuge_pastorea}
                                                                    onCheckedChange={(checked) => {
                                                                        setData('conyuge_pastorea', checked);
                                                                        if (!checked) {
                                                                            setData('cedula_conyuge', '');
                                                                            setCedulaConyugeExiste(false);
                                                                            setCedulaConyugeEsVinculado(false);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>

                                                            {data.conyuge_pastorea && (
                                                                <div className="space-y-2 pt-2 border-t border-indigo-200/60 animate-in fade-in duration-200">
                                                                    <div className="flex items-center justify-between">
                                                                        <Label htmlFor="cedula_conyuge" className="text-xs font-semibold text-indigo-900 flex items-center gap-1">
                                                                            <IdCard className="size-3.5 text-indigo-600" />
                                                                            Cédula de Identidad de su Cónyuge Pastor <span className="text-rose-500">*</span>
                                                                        </Label>
                                                                        {isCheckingCedulaConyuge && (
                                                                            <span className="text-[11px] text-indigo-700 flex items-center gap-1 font-medium">
                                                                                <Loader2 className="size-3 animate-spin" />
                                                                                Verificando Cédula...
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <Input
                                                                        id="cedula_conyuge"
                                                                        type="text"
                                                                        required={data.conyuge_pastorea}
                                                                        value={data.cedula_conyuge}
                                                                        onChange={(e) => {
                                                                            setData('cedula_conyuge', e.target.value);
                                                                            checkCedulaConyugeDuplicada(e.target.value);
                                                                        }}
                                                                        onBlur={(e) => checkCedulaConyugeDuplicada(e.target.value)}
                                                                        placeholder="Ej. V-87654321"
                                                                        className={`bg-white focus:border-indigo-500 ${cedulaConyugeExiste ? 'border-rose-500 ring-rose-500/20 ring-2' : 'border-indigo-200'}`}
                                                                    />
                                                                    {errors.cedula_conyuge && <p className="text-xs text-rose-500">{errors.cedula_conyuge}</p>}

                                                                    {cedulaConyugeExiste && (
                                                                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 font-medium animate-in fade-in duration-150">
                                                                            <AlertTriangle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                                                                            <div>
                                                                                <p className="font-bold">¡Cédula del Cónyuge Ya Registrada!</p>
                                                                                <p className="text-[11px] text-rose-700 mt-0.5">
                                                                                    La cédula <b>{data.cedula_conyuge}</b> ya pertenece a un pastor registrado: <b>{cedulaConyugeExistenteNombre}</b>.
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* PASO 2: EXTENSIÓN Y MINISTERIO */}
                                    {step === 2 && (
                                        <div className="space-y-6 animate-in fade-in duration-200">
                                            {/* BLOQUE 1: DATOS DE LA EXTENSIÓN (IGLESIA) */}
                                            <div className="space-y-4">
                                                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                                                        <Church className="size-4 text-blue-700" />
                                                        <span>1. Datos de la Extensión (Iglesia)</span>
                                                    </div>
                                                    {extensionCargadaPorConyuge && (
                                                        <Badge className="bg-indigo-100 text-indigo-900 border-indigo-300 text-[10px] px-2.5 py-0.5 font-semibold">
                                                            Cargado por Cónyuge ✓
                                                        </Badge>
                                                    )}
                                                </div>

                                                {extensionCargadaPorConyuge && (
                                                    <div className="p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-xl flex items-center gap-2 text-xs text-indigo-900">
                                                        <Info className="size-4 shrink-0 text-indigo-600" />
                                                        <span>
                                                            Se han pre-cargado automáticamente la extensión y ubicación registradas previamente por tu cónyuge (<b>{cedulaExistenteConyuge}</b>). Puedes modificarlas si lo requieres.
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {/* Nombre de la Extensión */}
                                                    <div className="space-y-2 md:col-span-3">
                                                        <Label htmlFor="nombre_extension" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                            <Church className="size-3.5 text-slate-500" />
                                                            Nombre de la Extensión (Iglesia) <span className="text-rose-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="nombre_extension"
                                                            type="text"
                                                            required
                                                            value={data.nombre_extension}
                                                            onChange={(e) => setData('nombre_extension', e.target.value)}
                                                            placeholder="Ej. MMM Central Barquisimeto"
                                                            className="bg-slate-50/50 border-slate-300 focus:bg-white"
                                                        />
                                                        {errors.nombre_extension && <p className="text-xs text-rose-500">{errors.nombre_extension}</p>}
                                                    </div>

                                                    {/* Estado */}
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-semibold text-slate-700">
                                                            Estado <span className="text-rose-500">*</span>
                                                        </Label>
                                                        <Select
                                                            value={data.estado_id}
                                                            onValueChange={(val) => setData('estado_id', val)}
                                                        >
                                                            <SelectTrigger className="bg-slate-50/50 border-slate-300 w-full">
                                                                <SelectValue placeholder="Selecciona estado" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-white border-slate-200">
                                                                {estados.map((est) => (
                                                                    <SelectItem key={est.id} value={String(est.id)}>
                                                                        {est.nombre}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {errors.estado_id && <p className="text-xs text-rose-500">{errors.estado_id}</p>}
                                                    </div>

                                                    {/* Zona */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="zona" className="text-xs font-semibold text-slate-700">
                                                            Zona
                                                        </Label>
                                                        <Input
                                                            id="zona"
                                                            type="text"
                                                            value={data.zona}
                                                            onChange={(e) => setData('zona', e.target.value)}
                                                            placeholder="Ej. Zona 1"
                                                            className="bg-slate-50/50 border-slate-300 focus:bg-white"
                                                        />
                                                        {errors.zona && <p className="text-xs text-rose-500">{errors.zona}</p>}
                                                    </div>

                                                    {/* Distrito */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="distrito" className="text-xs font-semibold text-slate-700">
                                                            Distrito
                                                        </Label>
                                                        <Input
                                                            id="distrito"
                                                            type="text"
                                                            value={data.distrito}
                                                            onChange={(e) => setData('distrito', e.target.value)}
                                                            placeholder="Ej. Distrito Central"
                                                            className="bg-slate-50/50 border-slate-300 focus:bg-white"
                                                        />
                                                        {errors.distrito && <p className="text-xs text-rose-500">{errors.distrito}</p>}
                                                    </div>

                                                    {/* Dirección Completa */}
                                                    <div className="space-y-2 md:col-span-3">
                                                        <Label htmlFor="direccion_extension" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                            <MapPin className="size-3.5 text-slate-500" />
                                                            Dirección de la Extensión (Iglesia) <span className="text-rose-500">*</span>
                                                        </Label>
                                                        <Textarea
                                                            id="direccion_extension"
                                                                    required
                                                            rows={2}
                                                            value={data.direccion_extension}
                                                            onChange={(e) => setData('direccion_extension', e.target.value)}
                                                            placeholder="Ej. Av. Principal con Calle 12, Sector Centro"
                                                            className="bg-slate-50/50 border-slate-300 focus:bg-white resize-none"
                                                        />
                                                        {errors.direccion_extension && <p className="text-xs text-rose-500">{errors.direccion_extension}</p>}
                                                    </div>

                                                    {/* SUB-SECCIÓN: ESTADÍSTICAS DE LA IGLESIA */}
                                                    <div className="md:col-span-3 pt-3 border-t border-slate-200/80 space-y-3">
                                                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                                                            <TrendingUp className="size-4 text-blue-600" />
                                                            <span>Estadísticas de la Iglesia</span>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
                                                            {/* Miembros Activos */}
                                                            <div className="space-y-1.5">
                                                                <Label htmlFor="miembros_activos" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                                    <Users className="size-3.5 text-blue-600" />
                                                                    Miembros Activos
                                                                </Label>
                                                                <Input
                                                                    id="miembros_activos"
                                                                    type="number"
                                                                    min="0"
                                                                    value={data.miembros_activos}
                                                                    onChange={(e) => setData('miembros_activos', e.target.value)}
                                                                    placeholder="Ej. 50"
                                                                    className="bg-white border-slate-300 focus:border-blue-500"
                                                                />
                                                                {errors.miembros_activos && <p className="text-xs text-rose-500">{errors.miembros_activos}</p>}
                                                            </div>

                                                            {/* Miembros Probantes */}
                                                            <div className="space-y-1.5">
                                                                <Label htmlFor="miembro_probante" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                                    <UserCheck className="size-3.5 text-indigo-600" />
                                                                    Miembro Probante
                                                                </Label>
                                                                <Input
                                                                    id="miembro_probante"
                                                                    type="number"
                                                                    min="0"
                                                                    value={data.miembro_probante}
                                                                    onChange={(e) => setData('miembro_probante', e.target.value)}
                                                                    placeholder="Ej. 15"
                                                                    className="bg-white border-slate-300 focus:border-blue-500"
                                                                />
                                                                {errors.miembro_probante && <p className="text-xs text-rose-500">{errors.miembro_probante}</p>}
                                                            </div>

                                                            {/* Campos Blancos */}
                                                            <div className="space-y-1.5">
                                                                <Label htmlFor="cantidad_campos_blancos" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                                    <MapPin className="size-3.5 text-emerald-600" />
                                                                    Campos Blancos
                                                                </Label>
                                                                <Input
                                                                    id="cantidad_campos_blancos"
                                                                    type="number"
                                                                    min="0"
                                                                    value={data.cantidad_campos_blancos}
                                                                    onChange={(e) => setData('cantidad_campos_blancos', e.target.value)}
                                                                    placeholder="Ej. 3"
                                                                    className="bg-white border-slate-300 focus:border-blue-500"
                                                                />
                                                                {errors.cantidad_campos_blancos && <p className="text-xs text-rose-500">{errors.cantidad_campos_blancos}</p>}
                                                            </div>

                                                            {/* Tiempo de Trabajo */}
                                                            <div className="space-y-1.5">
                                                                <Label htmlFor="tiempo_trabajo" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                                    <Clock className="size-3.5 text-amber-600" />
                                                                    Tiempo de Trabajo
                                                                </Label>
                                                                <Input
                                                                    id="tiempo_trabajo"
                                                                    type="text"
                                                                    value={data.tiempo_trabajo}
                                                                    onChange={(e) => setData('tiempo_trabajo', e.target.value)}
                                                                    placeholder="Ej. 5 años"
                                                                    className="bg-white border-slate-300 focus:border-blue-500"
                                                                />
                                                                {errors.tiempo_trabajo && <p className="text-xs text-rose-500">{errors.tiempo_trabajo}</p>}
                                                            </div>

                                                            {/* Iglesias Fundadas */}
                                                            <div className="space-y-1.5">
                                                                <Label htmlFor="iglesias_fundadas" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                                    <Church className="size-3.5 text-cyan-600" />
                                                                    Iglesias Fundadas
                                                                </Label>
                                                                <Input
                                                                    id="iglesias_fundadas"
                                                                    type="number"
                                                                    min="0"
                                                                    value={data.iglesias_fundadas}
                                                                    onChange={(e) => setData('iglesias_fundadas', e.target.value)}
                                                                    placeholder="Ej. 2"
                                                                    className="bg-white border-slate-300 focus:border-blue-500"
                                                                />
                                                                {errors.iglesias_fundadas && <p className="text-xs text-rose-500">{errors.iglesias_fundadas}</p>}
                                                            </div>

                                                            {/* Pastores al Ministerio */}
                                                            <div className="space-y-1.5">
                                                                <Label htmlFor="pastores_ministerio" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                                    <Award className="size-3.5 text-purple-600" />
                                                                    Pastores al Ministerio
                                                                </Label>
                                                                <Input
                                                                    id="pastores_ministerio"
                                                                    type="number"
                                                                    min="0"
                                                                    value={data.pastores_ministerio}
                                                                    onChange={(e) => setData('pastores_ministerio', e.target.value)}
                                                                    placeholder="Ej. 1"
                                                                    className="bg-white border-slate-300 focus:border-blue-500"
                                                                />
                                                                {errors.pastores_ministerio && <p className="text-xs text-rose-500">{errors.pastores_ministerio}</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* BLOQUE 2: INFORMACIÓN MINISTERIAL */}
                                            <div className="space-y-4 pt-2">
                                                <div className="border-b border-slate-200 pb-3 flex items-center gap-2 text-blue-900 font-bold text-sm">
                                                    <Award className="size-4 text-blue-700" />
                                                    <span>2. Datos Ministeriales del Pastor</span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                 {/* Apellidos */}
                                                 <div className="space-y-2">
                                                     <Label htmlFor="apellidos" className="text-xs font-semibold text-slate-700">
                                                         Apellidos <span className="text-rose-500">*</span>
                                                     </Label>
                                                     <Input
                                                         id="apellidos"
                                                         type="text"
                                                         required
                                                         value={data.apellidos}
                                                         onChange={(e) => setData('apellidos', e.target.value)}
                                                         placeholder="Ej. Pérez Rodríguez"
                                                         className="bg-slate-50/50 border-slate-300 focus:bg-white"
                                                     />
                                                     {errors.apellidos && <p className="text-xs text-rose-500">{errors.apellidos}</p>}
                                                 </div>

                                                 {/* Nombres */}
                                                 <div className="space-y-2">
                                                     <Label htmlFor="nombres" className="text-xs font-semibold text-slate-700">
                                                         Nombres <span className="text-rose-500">*</span>
                                                     </Label>
                                                     <Input
                                                         id="nombres"
                                                         type="text"
                                                         required
                                                         value={data.nombres}
                                                         onChange={(e) => setData('nombres', e.target.value)}
                                                         placeholder="Ej. Juan Carlos"
                                                         className="bg-slate-50/50 border-slate-300 focus:bg-white"
                                                     />
                                                     {errors.nombres && <p className="text-xs text-rose-500">{errors.nombres}</p>}
                                                 </div>

                                                    {/* Grado Ministerial (Radix UI Select) */}
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-semibold text-slate-700">
                                                            Grado Ministerial <span className="text-rose-500">*</span>
                                                        </Label>
                                                        <Select
                                                            value={data.nivel_ministerial}
                                                            onValueChange={(val) => setData('nivel_ministerial', val)}
                                                        >
                                                            <SelectTrigger className="bg-slate-50/50 border-slate-300 w-full">
                                                                <SelectValue placeholder="Selecciona grado ministerial" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-white border-slate-200">
                                                                {gradosMinisteriales.map((gm) => (
                                                                    <SelectItem key={gm} value={gm}>
                                                                        {gm}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {errors.nivel_ministerial && <p className="text-xs text-rose-500">{errors.nivel_ministerial}</p>}
                                                    </div>

                                                    {/* Último año de promoción */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="ano_promocion" className="text-xs font-semibold text-slate-700">
                                                            Último Año de Promoción
                                                        </Label>
                                                        <Input
                                                            id="ano_promocion"
                                                            type="text"
                                                            value={data.ano_promocion}
                                                            onChange={(e) => setData('ano_promocion', e.target.value)}
                                                            placeholder="Ej. 2020"
                                                            className="bg-slate-50/50 border-slate-300 focus:bg-white"
                                                        />
                                                        {errors.ano_promocion && <p className="text-xs text-rose-500">{errors.ano_promocion}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* PASO 3: ARCHIVOS Y FOTOGRAFÍAS */}
                                    {step === 3 && (
                                        <div className="space-y-6 animate-in fade-in duration-200">
                                            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                                                    <Camera className="size-4 text-blue-700" />
                                                    <span>Documentos y Fotografías Requeridas</span>
                                                </div>
                                                <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 text-[11px] font-bold">
                                                    Validación Obligatoria
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Dropzone / Cámara 1: Foto de la Cédula (Con OCR en Vivo) */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                            <Scan className="size-3.5 text-blue-700" />
                                                            Foto de la Cédula de Identidad <span className="text-rose-500">*</span>
                                                        </Label>
                                                        <span className="text-[10px] text-slate-500 font-medium">Anverso Legible • OCR Activo</span>
                                                    </div>
                                                    <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 rounded-2xl p-4 bg-slate-50/60 flex flex-col items-center justify-center text-center transition group">
                                                        {fotoCedulaPreview ? (
                                                            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-center">
                                                                <img
                                                                    src={fotoCedulaPreview}
                                                                    alt="Cédula Preview"
                                                                    className="w-full h-full object-contain"
                                                                />
                                                                <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => autoCorregirFoto('foto_cedula')}
                                                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md transition"
                                                                        title="Voltea la foto a horizontal, aplica brillo, contraste y zoom óptimo para OCR"
                                                                    >
                                                                        <Sparkles className="size-3 text-amber-300 animate-pulse" />
                                                                        <span>Auto-corregir</span>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setEditorImageSrc(fotoCedulaPreview);
                                                                            setEditorTarget('foto_cedula');
                                                                            setIsEditorOpen(true);
                                                                        }}
                                                                        className="bg-slate-900/80 hover:bg-slate-950 text-white text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur-xs transition shadow"
                                                                    >

                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFotoCedulaPreview(null);
                                                                            setData('foto_cedula', null);
                                                                            setOcrVerified(false);
                                                                            setOcrStatusMessage(null);
                                                                            setExtractedCedulaNumber(null);
                                                                        }}
                                                                        className="bg-rose-600 text-white rounded-lg p-1 text-xs hover:bg-rose-700 transition shadow"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>

                                                                {/* Insignia u Overlay OCR */}
                                                                {isOcrAnalyzing ? (
                                                                    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                                                                        <Loader2 className="size-7 animate-spin text-amber-400" />
                                                                        <p className="text-xs font-semibold">{ocrStatusMessage}</p>
                                                                    </div>
                                                                ) : ocrMismatch ? (
                                                                    <div className="absolute bottom-2 left-2 right-2 bg-rose-950/95 backdrop-blur-xs text-white p-2.5 rounded-xl text-xs flex flex-col gap-1.5 border border-rose-500 shadow-lg animate-in slide-in-from-bottom-2">
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="flex items-center gap-1.5 font-bold text-rose-300">
                                                                                <AlertCircle className="size-4 shrink-0 text-rose-400" />
                                                                                <span>
                                                                                    {extractedCedulaNumber && extractedCedulaNumber.replace(/\D/g, '') === data.documento.replace(/\D/g, '')
                                                                                        ? '¡Nombres o Datos No Coinciden!'
                                                                                        : '¡Número de Cédula No Coincide!'}
                                                                                </span>
                                                                            </span>
                                                                            {extractedCedulaNumber && (
                                                                                <Badge className="bg-rose-600 text-white text-[10px] font-mono font-bold">
                                                                                    Foto: {extractedCedulaNumber}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-[11px] text-rose-100 leading-tight">
                                                                            {ocrStatusMessage || `La Cédula en la foto (${extractedCedulaNumber}) no coincide con los datos del registro (${data.documento}).`}
                                                                        </p>

                                                                        {cedulaEsConyugeVinculado && cedulaExistenteNombre && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const partes = (cedulaExistenteNombre || '').trim().split(/\s+/);
                                                                                    const n = partes.length > 1 ? partes.slice(0, Math.ceil(partes.length / 2)).join(' ') : (partes[0] || '');
                                                                                    const a = partes.length > 1 ? partes.slice(Math.ceil(partes.length / 2)).join(' ') : '';

                                                                                    setData(prev => ({
                                                                                        ...prev,
                                                                                        nombres: n || prev.nombres,
                                                                                        apellidos: a || prev.apellidos,
                                                                                    }));

                                                                                    setOcrMismatch(false);
                                                                                    setOcrVerified(true);
                                                                                    setOcrStatusMessage(`✨ ¡Nombres y Apellidos auto-corregidos a "${cedulaExistenteNombre}"!`);
                                                                                }}
                                                                                className="mt-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[11px] px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow transition"
                                                                            >
                                                                                <Sparkles className="size-3.5 text-slate-950" />
                                                                                <span>Corregir Nombres a "{cedulaExistenteNombre}"</span>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ) : ocrVerified ? (
                                                                    <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-xs text-white p-2 rounded-xl text-[11px] flex items-center justify-between shadow">
                                                                        <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                                                                            <CheckCircle2 className="size-3.5" />
                                                                            <span>{ocrStatusMessage || 'Documento Validado con OCR'}</span>
                                                                        </span>
                                                                        {extractedCedulaNumber && (
                                                                            <Badge className="bg-emerald-500 text-white text-[10px] font-mono font-bold">
                                                                                {extractedCedulaNumber}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                ) : ocrStatusMessage ? (
                                                                    <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white p-2 rounded-xl text-[11px] flex items-center justify-between shadow">
                                                                        <span className="flex items-center gap-1.5 font-medium text-slate-200">
                                                                            <Info className="size-3.5 text-blue-400" />
                                                                            <span>{ocrStatusMessage}</span>
                                                                        </span>
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        ) : (
                                                            <div className="w-full py-4 flex flex-col items-center justify-center gap-3">
                                                                <div className="size-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-700 shadow-xs group-hover:scale-110 transition">
                                                                    <IdCard className="size-6" />
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <p className="text-xs font-semibold text-slate-800">
                                                                        Escanear o subir foto de Cédula
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-500">
                                                                        Validación obligatoria de identidad • PNG, JPG max 5MB
                                                                    </p>
                                                                </div>

                                                                <div className="flex items-center gap-2 pt-1 w-full justify-center">
                                                                    <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition inline-flex items-center gap-1.5">
                                                                        <span>Subir Documento</span>
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            onChange={(e) => handleFileChange(e, 'foto_cedula')}
                                                                            className="hidden"
                                                                        />
                                                                    </label>
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() => startCamera('foto_cedula')}
                                                                        className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold px-3 py-1.5 h-auto rounded-lg shadow-2xs flex items-center gap-1.5"
                                                                    >
                                                                        <Camera className="size-3.5" />
                                                                        <span>Escanear Cámara</span>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {errors.foto_cedula && <p className="text-xs text-rose-500">{errors.foto_cedula}</p>}
                                                </div>

                                                {/* Dropzone / Cámara 2: Foto Tipo Carnet */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs font-semibold text-slate-700">
                                                            Foto Tipo Carnet <span className="text-rose-500">*</span>
                                                        </Label>
                                                        <span className="text-[10px] text-blue-700 font-semibold">Fondo Blanco • Medio Cuerpo</span>
                                                    </div>
                                                    <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 rounded-2xl p-4 bg-slate-50/60 flex flex-col items-center justify-center text-center transition group">
                                                        {fotoPerfilPreview ? (
                                                            <div className="relative w-full aspect-square max-w-[180px] mx-auto rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs">
                                                                <img
                                                                    src={fotoPerfilPreview}
                                                                    alt="Perfil Preview"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setEditorImageSrc(fotoPerfilPreview);
                                                                            setEditorTarget('foto');
                                                                            setIsEditorOpen(true);
                                                                        }}
                                                                        className="bg-slate-900/80 hover:bg-slate-950 text-white text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur-xs transition shadow"
                                                                    >
                                                                        <Edit2 className="size-3 text-blue-400" />
                                                                        <span>Editar</span>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFotoPerfilPreview(null);
                                                                            setData('foto', null);
                                                                        }}
                                                                        className="bg-rose-600 text-white rounded-lg p-1 text-xs hover:bg-rose-700 transition shadow"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="w-full py-4 flex flex-col items-center justify-center gap-3">
                                                                <div className="size-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-700 shadow-xs group-hover:scale-110 transition">
                                                                    <User className="size-6" />
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <p className="text-xs font-semibold text-slate-800">
                                                                        Subir o capturar foto formal
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-600 font-medium">
                                                                        Requisito: Fondo blanco, vestimenta formal.
                                                                    </p>
                                                                </div>

                                                                <div className="flex items-center gap-2 pt-1 w-full justify-center">
                                                                    <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition inline-flex items-center gap-1.5">
                                                                        <span>Subir Imagen</span>
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            onChange={(e) => handleFileChange(e, 'foto')}
                                                                            className="hidden"
                                                                        />
                                                                    </label>
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() => startCamera('foto')}
                                                                        className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold px-3 py-1.5 h-auto rounded-lg shadow-2xs flex items-center gap-1.5"
                                                                    >
                                                                        <Camera className="size-3.5" />
                                                                        <span>Tomar Foto</span>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {errors.foto && <p className="text-xs text-rose-500">{errors.foto}</p>}
                                                </div>
                                            </div>

                                            {/* Declaración de Veracidad */}
                                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                                                <AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
                                                <p>
                                                    Declaración de Veracidad: Al enviar este formulario declaro que los datos ingresados y las fotografías adjuntas de la Cédula de Identidad y carnet son fidedignos y corresponden al titular para la verificación oficial.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
                                    {step > 1 ? (
                                        <Button
                                            type="button"
                                            onClick={(e) => prevStep(e)}
                                            variant="outline"
                                            className="border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                                        >
                                            <ArrowLeft className="size-4" />
                                            <span>Anterior</span>
                                        </Button>
                                    ) : (
                                        <div />
                                    )}

                                    {step < 3 ? (
                                        <Button
                                            type="button"
                                            onClick={(e) => nextStep(e)}
                                            disabled={step === 1 && (cedulaExiste || cedulaConyugeExiste)}
                                            className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span>Siguiente Paso</span>
                                            <ArrowRight className="size-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-2.5 rounded-xl shadow-md flex items-center gap-2"
                                        >
                                            {processing ? (
                                                <span>Enviando...</span>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="size-4" />
                                                    <span>Enviar Registro</span>
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </CardFooter>
                            </form>
                        </Card>
                    )}
                </main>

                {/* MODAL DE CÁMARA WEB / MULTI-CÁMARA CON GUÍA DE ENCUADRE DE CÉDULA */}
                {cameraTarget && (
                    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0">
                            {/* Header del Modal */}
                            <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <Camera className="size-4 text-amber-400" />
                                    <span>
                                        {cameraTarget === 'foto_cedula'
                                            ? 'Escanear Cédula de Identidad'
                                            : 'Capturar Foto Tipo Carnet'}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeCameraModal}
                                    className="text-blue-200 hover:text-white transition"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            {/* Viewport de la Cámara con Guía de Documento */}
                            <div className="relative bg-slate-950 aspect-video flex items-center justify-center overflow-hidden">
                                {isCameraLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-2 bg-slate-950 z-20">
                                        <RefreshCw className="size-8 animate-spin text-amber-400" />
                                        <p className="text-xs">Iniciando cámara...</p>
                                    </div>
                                )}

                                {cameraError ? (
                                    <div className="p-6 text-center text-rose-400 space-y-2 text-xs z-20">
                                        <AlertCircle className="size-8 mx-auto text-rose-500" />
                                        <p>{cameraError}</p>
                                    </div>
                                ) : (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-contain"
                                        />

                                        {/* GUÍA DE ENCUADRE TIPO CÉDULA DE IDENTIDAD */}
                                        {cameraTarget === 'foto_cedula' && (
                                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 z-10">
                                                <div className="w-[85%] h-[75%] border-2 border-dashed border-amber-400 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] flex flex-col items-center justify-between p-3 animate-pulse">
                                                    <span className="text-[10px] font-bold text-amber-300 bg-slate-900/80 px-3 py-1 rounded-full uppercase tracking-wider">
                                                        Alinea la Cédula dentro del recuadro
                                                    </span>
                                                    <span className="text-[10px] text-amber-200 bg-slate-900/80 px-2.5 py-0.5 rounded-full">
                                                        Procura buena iluminación
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Acciones y Voltear Cámara */}
                            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                                <Button
                                    type="button"
                                    onClick={flipCamera}
                                    variant="outline"
                                    className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 text-xs"
                                    title="Voltear Cámara (Frontal / Trasera)"
                                >
                                    <RefreshCw className="size-3.5" />
                                    <span>
                                        {availableCameras.length > 1
                                            ? `Cambiar Cámara (${currentCameraIndex + 1}/${availableCameras.length})`
                                            : 'Voltear Cámara'}
                                    </span>
                                </Button>

                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        onClick={closeCameraModal}
                                        variant="ghost"
                                        className="text-slate-600 hover:bg-slate-200 text-xs"
                                    >
                                        Cancelar
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={capturePhoto}
                                        disabled={isCameraLoading || !!cameraError}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow flex items-center gap-1.5"
                                    >
                                        <Camera className="size-4" />
                                        <span>Capturar Foto</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Claro */}
                <footer className="w-full border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
                    <div className="max-w-6xl mx-auto px-4">
                        &copy; {new Date().getFullYear()} Movimiento Misionero Mundial Venezuela. Todos los derechos reservados.
                    </div>
                </footer>
            </div>

            {/* Modal Editor de Fotografías (Cédula y Carnet) */}
            <PhotoEditorModal
                isOpen={isEditorOpen}
                imageSrc={editorImageSrc}
                aspectRatio={editorTarget === 'foto_cedula' ? 'cedula' : 'carnet'}
                title={editorTarget === 'foto_cedula' ? 'Editar y Ajustar Foto de Cédula' : 'Editar Foto Tipo Carnet'}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleEditorSave}
            />
        </>
    );
}
