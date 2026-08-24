import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select2, Select2Option } from '@/components/ui/select2';
import {
    User,
    GraduationCap,
    Cross,
    Stethoscope,
    Camera,
    ArrowLeft,
    ArrowRight,
    Save,
    Check,
    MapPin,
    Upload,
    Trash2,
    Video,
    AlertCircle,
    PhoneCall,
    Plus,
    SwitchCamera,
    CheckCircle2,
    IdCard,
    ShieldCheck,
    Info,
    Sparkles,
    Heart,
    Loader2,
    Cloud,
    RotateCcw,
    Send,
    FileCheck2
} from 'lucide-react';

interface EstadoItem {
    id: number;
    nombre: string;
    codigo?: string;
}

interface MunicipioItem {
    id: number;
    estado_id: number;
    nombre: string;
    codigo?: string;
}

interface ParroquiaItem {
    id: number;
    municipio_id: number;
    nombre: string;
    codigo?: string;
}

interface RegistroPastorProps {
    estados: EstadoItem[];
    municipios: MunicipioItem[];
    parroquias: ParroquiaItem[];
    gradosMinisteriales?: string[];
    estadosCiviles?: string[];
    generos?: string[];
    flash?: {
        success?: {
            codigo: string;
            nombre: string;
            mensaje: string;
        };
    };
}

const DRAFT_STORAGE_KEY = 'mmm_pastor_registro_draft_v5';

export default function RegistroPastor({
    estados = [],
    municipios = [],
    parroquias = [],
    gradosMinisteriales = ['Colaborador', 'Laico', 'Licenciado', 'Ministro Ordenado'],
    estadosCiviles = ['Soltero(a)', 'Casado(a)', 'Viudo(a)', 'Divorciado(a)'],
    generos = ['Masculino', 'Femenino'],
    flash,
}: RegistroPastorProps) {
    const { props } = usePage<any>();
    const [activeTab, setActiveTab] = useState<number>(1);

    // Estados de Borrador Local (Auto-Save)
    const [hasPendingDraft, setHasPendingDraft] = useState<boolean>(false);
    const [draftStep, setDraftStep] = useState<number>(1);
    const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
    const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);

    // Estados del Modal de Envío y Progreso (0% a 100%)
    const [isSubmittingModalOpen, setIsSubmittingModalOpen] = useState<boolean>(false);
    const [submitProgress, setSubmitProgress] = useState<number>(0);
    const [submitStage, setSubmitStage] = useState<string>('Iniciando envío...');
    const [submittedResult, setSubmittedResult] = useState<{
        codigo: string;
        nombre: string;
        mensaje: string;
    } | null>(null);

    // Estados de verificación de Cédula Principal en tiempo real
    const [isCheckingCedula, setIsCheckingCedula] = useState<boolean>(false);
    const [cedulaExistenteNombre, setCedulaExistenteNombre] = useState<string | null>(null);

    // Estados de verificación de Cédula Cónyuge en tiempo real
    const [isCheckingCedulaConyuge, setIsCheckingCedulaConyuge] = useState<boolean>(false);
    const [cedulaConyugeEncontrada, setCedulaConyugeEncontrada] = useState<string | null>(null);

    // Cámara Web para Foto de Perfil y Cédula
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [activeCameraTarget, setActiveCameraTarget] = useState<'foto' | 'foto_cedula'>('foto');

    const { data, setData, post, processing, errors, reset } = useForm({
        codigo: '',
        nombres: '',
        apellidos: '',
        documento: '',
        genero: 'Masculino',
        edad: '',
        fe_nacimiento: '',
        foto: '',
        foto_cedula: '',
        estado_civil: 'Casado(a)',
        nombre_conyuge: '',
        cedula_conyuge: '',
        conyuge_pastorea: false,
        conyuge_id: '',

        // Eclesiásticos
        nivel_ministerial: 'Ministro Ordenado',
        zona: '',
        distrito: '',
        ano_promocion: '',
        tiempo_colaborando: '',
        batizado_espiritu_santo: true,
        pertenece_ministerio: true,
        cargo_nacional: '',
        mencion: '',
        nota: '',

        // Académicos
        grado_instruccion: 'Universitario',
        titulo_obtenido: '',
        estudio_teologico: false,
        titulo_teologico: '',
        tiempo_de_estudio_teologico: '',
        instituto_teologico: '',

        // Ubicación y Contacto
        edificio_casa_quinta: '',
        piso: '',
        apartamento: '',
        calle_avenida: '',
        urbanizacion: '',
        estado_id: estados?.[0]?.id ? String(estados[0].id) : '',
        municipio_id: '',
        parroquia_id: '',
        municipio: '',
        telefono_hab: '',
        telefono_tlf: '',
        telefono_otro: '',
        email: '',

        // Salud y Emergencia
        grupo_sanguineo: 'O+',
        condicion_salud: 'Buena',
        padece_enfermedad: false,
        enfermedades_cronicas: '',
        toma_medicamentos: false,
        medicamentos_recetados: '',
        alergias: '',
        contacto_emergencia_nombre: '',
        contacto_emergencia_telefono: '',
        observaciones_salud: '',
    });

    const esCasado = data.estado_civil.toLowerCase().includes('casad');

    // Opciones para Select2
    const generoOptions: Select2Option[] = useMemo(() => [
        { value: 'Masculino', label: 'Masculino' },
        { value: 'Femenino', label: 'Femenino' },
    ], []);

    const estadoCivilOptions: Select2Option[] = useMemo(() => {
        return estadosCiviles.map((ec) => ({ value: ec, label: ec }));
    }, [estadosCiviles]);

    const gradoInstruccionOptions: Select2Option[] = useMemo(() => [
        { value: 'Primaria', label: 'Primaria' },
        { value: 'Secundaria / Bachillerato', label: 'Secundaria / Bachillerato' },
        { value: 'Técnico Medio / Superior', label: 'Técnico Medio / Superior' },
        { value: 'Universitario', label: 'Universitario' },
        { value: 'Postgrado / Maestría', label: 'Postgrado / Maestría' },
    ], []);

    const nivelMinisterialOptions: Select2Option[] = useMemo(() => {
        return gradosMinisteriales.map((gm) => ({ value: gm, label: gm }));
    }, [gradosMinisteriales]);

    const grupoSanguineoOptions: Select2Option[] = useMemo(() => [
        { value: 'O+', label: 'O+' },
        { value: 'O-', label: 'O-' },
        { value: 'A+', label: 'A+' },
        { value: 'A-', label: 'A-' },
        { value: 'B+', label: 'B+' },
        { value: 'B-', label: 'B-' },
        { value: 'AB+', label: 'AB+' },
        { value: 'AB-', label: 'AB-' },
    ], []);

    const condicionSaludOptions: Select2Option[] = useMemo(() => [
        { value: 'Excelente', label: 'Excelente' },
        { value: 'Buena', label: 'Buena' },
        { value: 'Regular', label: 'Regular' },
        { value: 'Delicada', label: 'Delicada' },
    ], []);

    const distritoOptions: Select2Option[] = useMemo(() => [
        { value: '1', label: 'Distrito 1' },
        { value: '2', label: 'Distrito 2' },
        { value: '3', label: 'Distrito 3' },
        { value: '4', label: 'Distrito 4' },
        { value: '5', label: 'Distrito 5' },
    ], []);

    const estadoOptions: Select2Option[] = useMemo(() => {
        return estados.map((est) => ({ value: String(est.id), label: est.nombre }));
    }, [estados]);

    const municipioOptions: Select2Option[] = useMemo(() => {
        if (!data.estado_id) return [];
        return municipios
            .filter((m) => String(m.estado_id) === String(data.estado_id))
            .map((m) => ({ value: String(m.id), label: m.nombre }));
    }, [municipios, data.estado_id]);

    const parroquiaOptions: Select2Option[] = useMemo(() => {
        if (!data.municipio_id) return [];
        return parroquias
            .filter((p) => String(p.municipio_id) === String(data.municipio_id))
            .map((p) => ({ value: String(p.id), label: p.nombre }));
    }, [parroquias, data.municipio_id]);

    // 1. Detectar si existe un borrador guardado previamente al montar el componente
    useEffect(() => {
        // Si hay flash de éxito de un registro reciente, limpiar borrador
        if (flash?.success || props?.flash?.success) {
            try {
                localStorage.removeItem(DRAFT_STORAGE_KEY);
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith('mmm_pastor_registro_draft')) {
                        localStorage.removeItem(k);
                    }
                }
            } catch (e) { }
            setHasPendingDraft(false);
            setLastSavedTime(null);
            return;
        }

        try {
            const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (rawDraft) {
                const parsed = JSON.parse(rawDraft);
                if (parsed && parsed.data && (parsed.data.nombres || parsed.data.documento || parsed.data.apellidos)) {
                    setHasPendingDraft(true);
                    setDraftStep(parsed.activeTab || 1);
                }
            }
        } catch (e) {
            // Ignorar
        }
    }, [flash, props?.flash]);

    // 2. Auto-guardar borrador continuamente en localStorage al cambiar data o pestaña
    useEffect(() => {
        // Si el registro ya fue completado o está en proceso de envío, no guardar borrador
        if (submittedResult || isSubmittingModalOpen) return;
        const hasContent = data.nombres || data.apellidos || data.documento || data.telefono_tlf;
        if (!hasContent) return;

        setIsSavingDraft(true);
        const timer = setTimeout(() => {
            try {
                const payload = {
                    data,
                    activeTab,
                    savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                };
                localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
                setLastSavedTime(payload.savedAt);
            } catch (e) {
                // Quota exceeded fallback
            } finally {
                setIsSavingDraft(false);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [data, activeTab, submittedResult, isSubmittingModalOpen]);

    const handleRestoreDraft = () => {
        try {
            const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (rawDraft) {
                const parsed = JSON.parse(rawDraft);
                if (parsed.data) {
                    setData((prev) => ({
                        ...prev,
                        ...parsed.data,
                    }));
                }
                if (parsed.activeTab) {
                    setActiveTab(parsed.activeTab);
                }
                setLastSavedTime(parsed.savedAt || 'Reciente');
            }
        } catch (e) {
            console.error('Error al restaurar borrador', e);
        } finally {
            setHasPendingDraft(false);
        }
    };

    const handleDiscardDraft = () => {
        try {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('mmm_pastor_registro_draft')) {
                    localStorage.removeItem(k);
                }
            }
        } catch (e) { }
        setHasPendingDraft(false);
        setLastSavedTime(null);
    };

    // Calcular edad automáticamente al cambiar fecha de nacimiento
    const calculateAge = (birthDateString: string): string => {
        if (!birthDateString) return '';
        const birthDate = new Date(birthDateString);
        if (isNaN(birthDate.getTime())) return '';
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? String(age) : '';
    };

    const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const computedAge = calculateAge(val);
        setData((prev) => ({
            ...prev,
            fe_nacimiento: val,
            edad: computedAge !== '' ? computedAge : prev.edad,
        }));
    };

    const handleEstadoChange = (val: string) => {
        setData((prev) => ({
            ...prev,
            estado_id: val,
            municipio_id: '',
            parroquia_id: '',
        }));
    };

    const handleMunicipioChange = (val: string) => {
        const munFound = municipios.find((m) => String(m.id) === val);
        setData((prev) => ({
            ...prev,
            municipio_id: val,
            parroquia_id: '',
            municipio: munFound ? munFound.nombre : prev.municipio,
        }));
    };

    // Manejo de Medicamentos
    const [nuevoMedicamentoNombre, setNuevoMedicamentoNombre] = useState('');
    const [nuevoMedicamentoDosis, setNuevoMedicamentoDosis] = useState('');

    const medicamentosList = useMemo(() => {
        const raw = data.medicamentos_recetados;
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string') {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) { }
            return raw.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean).map((nombre) => ({ nombre, dosis: '' }));
        }
        return [];
    }, [data.medicamentos_recetados]);

    const handleAgregarMedicamento = () => {
        if (!nuevoMedicamentoNombre.trim()) return;
        const nuevaLista = [
            ...medicamentosList,
            { nombre: nuevoMedicamentoNombre.trim(), dosis: nuevoMedicamentoDosis.trim() }
        ];
        setData('medicamentos_recetados', JSON.stringify(nuevaLista));
        setNuevoMedicamentoNombre('');
        setNuevoMedicamentoDosis('');
    };

    const handleEliminarMedicamento = (index: number) => {
        const nuevaLista = medicamentosList.filter((_, i) => i !== index);
        setData('medicamentos_recetados', nuevaLista.length > 0 ? JSON.stringify(nuevaLista) : '');
    };

    // Búsqueda y Carga de Datos de Cédula en tiempo real (Crear o Editar)
    const checkCedulaDuplicada = async (doc: string) => {
        const trimmed = doc.trim();
        if (trimmed.length < 5) {
            setCedulaExistenteNombre(null);
            return;
        }

        setIsCheckingCedula(true);
        try {
            const res = await fetch(`/registro/verificar-cedula/${encodeURIComponent(trimmed)}`);
            if (res.ok) {
                const result = await res.json();
                if (result.existe && result.pastor) {
                    const p = result.pastor;
                    setCedulaExistenteNombre(result.nombre || `${p.nombres} ${p.apellidos}`);

                    // Cargar todos los datos registrados del pastor para su edición
                    setData((prev) => ({
                        ...prev,
                        codigo: p.codigo || prev.codigo,
                        nombres: p.nombres || prev.nombres,
                        apellidos: p.apellidos || prev.apellidos,
                        documento: p.documento || prev.documento,
                        genero: p.genero || prev.genero,
                        fe_nacimiento: p.fe_nacimiento || prev.fe_nacimiento,
                        edad: p.edad || prev.edad,
                        estado_civil: p.estado_civil || prev.estado_civil,
                        nombre_conyuge: p.nombre_conyuge || prev.nombre_conyuge,
                        cedula_conyuge: p.cedula_conyuge || prev.cedula_conyuge,
                        conyuge_pastorea: Boolean(p.conyuge_pastorea || p.cedula_conyuge),
                        conyuge_id: p.conyuge_id || prev.conyuge_id,
                        telefono_tlf: p.telefono_tlf || prev.telefono_tlf,
                        telefono_hab: p.telefono_hab || prev.telefono_hab,
                        telefono_otro: p.telefono_otro || prev.telefono_otro,
                        email: p.email || prev.email,
                        estado_id: p.estado_id || prev.estado_id,
                        municipio_id: p.municipio_id || prev.municipio_id,
                        parroquia_id: p.parroquia_id || prev.parroquia_id,
                        municipio: p.municipio || prev.municipio,
                        edificio_casa_quinta: p.edificio_casa_quinta || prev.edificio_casa_quinta,
                        piso: p.piso || prev.piso,
                        apartamento: p.apartamento || prev.apartamento,
                        calle_avenida: p.calle_avenida || prev.calle_avenida,
                        urbanizacion: p.urbanizacion || prev.urbanizacion,
                        grado_instruccion: p.grado_instruccion || prev.grado_instruccion,
                        titulo_obtenido: p.titulo_obtenido || prev.titulo_obtenido,
                        estudio_teologico: Boolean(p.estudio_teologico),
                        titulo_teologico: p.titulo_teologico || prev.titulo_teologico,
                        tiempo_de_estudio_teologico: p.tiempo_de_estudio_teologico || prev.tiempo_de_estudio_teologico,
                        instituto_teologico: p.instituto_teologico || prev.instituto_teologico,
                        nivel_ministerial: p.nivel_ministerial || prev.nivel_ministerial,
                        zona: p.zona || prev.zona,
                        distrito: p.distrito || prev.distrito,
                        ano_promocion: p.ano_promocion || prev.ano_promocion,
                        tiempo_colaborando: p.tiempo_colaborando || prev.tiempo_colaborando,
                        batizado_espiritu_santo: p.batizado_espiritu_santo !== undefined ? Boolean(p.batizado_espiritu_santo) : prev.batizado_espiritu_santo,
                        pertenece_ministerio: p.pertenece_ministerio !== undefined ? Boolean(p.pertenece_ministerio) : prev.pertenece_ministerio,
                        cargo_nacional: p.cargo_nacional || prev.cargo_nacional,
                        mencion: p.mencion || prev.mencion,
                        nota: p.nota || prev.nota,
                        grupo_sanguineo: p.grupo_sanguineo || prev.grupo_sanguineo,
                        condicion_salud: p.condicion_salud || prev.condicion_salud,
                        padece_enfermedad: Boolean(p.padece_enfermedad),
                        enfermedades_cronicas: p.enfermedades_cronicas || prev.enfermedades_cronicas,
                        toma_medicamentos: Boolean(p.toma_medicamentos),
                        medicamentos_recetados: p.medicamentos_recetados || prev.medicamentos_recetados,
                        alergias: p.alergias || prev.alergias,
                        contacto_emergencia_nombre: p.contacto_emergencia_nombre || prev.contacto_emergencia_nombre,
                        contacto_emergencia_telefono: p.contacto_emergencia_telefono || prev.contacto_emergencia_telefono,
                        observaciones_salud: p.observaciones_salud || prev.observaciones_salud,
                        foto: p.foto || prev.foto,
                        foto_cedula: p.foto_cedula || prev.foto_cedula,
                    }));
                } else {
                    setCedulaExistenteNombre(null);
                }
            }
        } catch (e) {
            // Ignorar errores de red
        } finally {
            setIsCheckingCedula(false);
        }
    };

    // Validación de Cédula Cónyuge en tiempo real
    const checkCedulaConyuge = async (doc: string) => {
        const trimmed = doc.trim();
        if (trimmed.length < 5) {
            setCedulaConyugeEncontrada(null);
            return;
        }

        setIsCheckingCedulaConyuge(true);
        try {
            const res = await fetch(`/registro/verificar-cedula/${encodeURIComponent(trimmed)}`);
            if (res.ok) {
                const result = await res.json();
                if (result.existe && result.nombre) {
                    setCedulaConyugeEncontrada(result.nombre);
                    setData((prev) => ({
                        ...prev,
                        nombre_conyuge: result.nombre,
                        conyuge_pastorea: true,
                    }));
                } else {
                    setCedulaConyugeEncontrada(null);
                }
            }
        } catch (e) {
            // Ignorar
        } finally {
            setIsCheckingCedulaConyuge(false);
        }
    };

    // Cámara Web y Compresión de Fotos
    const resizeAndCompressImage = (imageSrc: string, targetW = 400, targetH = 480, quality = 0.85): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = imageSrc;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = targetW;
                canvas.height = targetH;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const imgRatio = img.width / img.height;
                    const targetRatio = targetW / targetH;

                    let sourceW = img.width;
                    let sourceH = img.height;
                    let sourceX = 0;
                    let sourceY = 0;

                    if (imgRatio > targetRatio) {
                        sourceW = img.height * targetRatio;
                        sourceX = (img.width - sourceW) / 2;
                    } else {
                        sourceH = img.width / targetRatio;
                        sourceY = (img.height - sourceH) / 2;
                    }

                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, targetW, targetH);
                    ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, targetW, targetH);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                } else {
                    resolve(imageSrc);
                }
            };
            img.onerror = () => resolve(imageSrc);
        });
    };

    const startCamera = async (target: 'foto' | 'foto_cedula', overrideFacingMode?: 'user' | 'environment') => {
        setActiveCameraTarget(target);
        const mode = overrideFacingMode || facingMode;
        if (mediaStream) {
            mediaStream.getTracks().forEach((t) => t.stop());
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: mode },
            });
            setMediaStream(stream);
            setIsCameraActive(true);
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            alert('No se pudo acceder a la cámara web. Verifique los permisos en su navegador.');
        }
    };

    const stopCamera = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach((t) => t.stop());
            setMediaStream(null);
        }
        setIsCameraActive(false);
    };

    const capturePhoto = async () => {
        if (videoRef.current) {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const raw = canvas.toDataURL('image/jpeg', 0.9);
                const compressed = await resizeAndCompressImage(raw);
                setData(activeCameraTarget, compressed);
                stopCamera();
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'foto' | 'foto_cedula') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const result = event.target?.result as string;
                if (result) {
                    const compressed = await resizeAndCompressImage(result);
                    setData(target, compressed);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Envío del Formulario con Modal de Progreso (0% a 100%)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Si aún no está en el Paso 5, avanzar al siguiente paso sin enviar
        if (activeTab < 5) {
            setActiveTab((prev) => prev + 1);
            return;
        }

        // Validaciones básicas de campos requeridos antes de abrir modal
        if (!data.nombres.trim() || !data.apellidos.trim() || !data.documento.trim()) {
            setActiveTab(1);
            alert('Por favor complete los campos obligatorios del Paso 1 (Nombres, Apellidos y Cédula).');
            return;
        }

        setIsSubmittingModalOpen(true);
        setSubmitProgress(10);
        setSubmitStage('Validando datos ministeriales y estructura...');

        // Simulación visual fluida del avance mientras el backend procesa
        let currentP = 10;
        const progressInterval = setInterval(() => {
            currentP += Math.floor(Math.random() * 12) + 5;
            if (currentP > 88) {
                currentP = 88;
                setSubmitStage('Guardando registros en la base de datos nacional...');
            } else if (currentP > 60) {
                setSubmitStage('Generando código ministerial y procesando fotografías...');
            } else if (currentP > 30) {
                setSubmitStage('Enviando datos para su revisión y confirmación oficial...');
            }
            setSubmitProgress(currentP);
        }, 300);

        post('/registro', {
            preserveScroll: true,
            onSuccess: (page: any) => {
                clearInterval(progressInterval);
                setSubmitProgress(100);
                setSubmitStage('¡Registro completado y recibido exitosamente!');

                const flashSuccess = page?.props?.flash?.success || props?.flash?.success;
                setSubmittedResult({
                    codigo: flashSuccess?.codigo || data.codigo || 'GENERADO',
                    nombre: flashSuccess?.nombre || `${data.nombres} ${data.apellidos}`,
                    mensaje: flashSuccess?.mensaje || 'Los datos han sido enviados para su revisión y confirmación oficial.',
                });

                // Limpiar completamente el borrador local para evitar confusiones
                try {
                    localStorage.removeItem(DRAFT_STORAGE_KEY);
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (k && k.startsWith('mmm_pastor_registro_draft')) {
                            localStorage.removeItem(k);
                        }
                    }
                } catch (err) { }
                setHasPendingDraft(false);
                setLastSavedTime(null);
            },
            onError: (errs) => {
                clearInterval(progressInterval);
                setIsSubmittingModalOpen(false);
                setSubmitProgress(0);

                // Si hay error en campos específicos, llevar al paso correspondiente
                if (errs.nombres || errs.apellidos || errs.documento || errs.estado_id || errs.telefono_tlf) {
                    setActiveTab(1);
                } else if (errs.nivel_ministerial) {
                    setActiveTab(3);
                }
                alert('Hubo observaciones en el formulario. Por favor revise los campos marcados en rojo.');
            },
        });
    };

    const handleResetOtro = () => {
        try {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('mmm_pastor_registro_draft')) {
                    localStorage.removeItem(k);
                }
            }
        } catch (e) { }
        setHasPendingDraft(false);
        setLastSavedTime(null);
        setIsSubmittingModalOpen(false);
        setSubmittedResult(null);
        setSubmitProgress(0);
        setActiveTab(1);
        setCedulaExistenteNombre(null);
        reset();
        router.get('/registro', {}, { replace: true, preserveState: false });
    };

    const steps = [
        { id: 1, title: 'Datos Personales', icon: User, desc: 'Identificación, cónyuge y dirección' },
        { id: 2, title: 'Datos Académicos', icon: GraduationCap, desc: 'Nivel de estudio y teología' },
        { id: 3, title: 'Datos Eclesiásticos', icon: Cross, desc: 'Nivel ministerial, zona y distrito' },
        { id: 4, title: 'Estado de Salud', icon: Stethoscope, desc: 'Historial médico y emergencia' },
        { id: 5, title: 'Fotografía', icon: Camera, desc: 'Foto de perfil y cédula de identidad' },
    ];

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans relative">
            <Head title="Registro Oficial de Pastores - MMM Venezuela" />

            {/* MODAL DE ENVÍO Y PROGRESO (0% a 100%) */}
            {isSubmittingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg bg-white border-slate-200 shadow-2xl rounded-3xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-300">
                        {/* Cabecera del Modal */}
                        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-6 text-white text-center relative">
                            <div className="mx-auto w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-xs shadow-inner">
                                {submitProgress === 100 ? (
                                    <CheckCircle2 className="w-9 h-9 text-white animate-bounce" />
                                ) : (
                                    <Send className="w-8 h-8 text-white animate-pulse" />
                                )}
                            </div>
                            <h3 className="text-xl font-black tracking-tight">
                                {submitProgress === 100 ? '¡Datos Enviados Satisfactoriamente!' : 'Enviando Registro Ministerial'}
                            </h3>
                            <p className="text-blue-200 text-xs mt-1">
                                Movimiento Misionero Mundial en Venezuela
                            </p>
                        </div>

                        <CardContent className="p-6 sm:p-8 space-y-6">
                            {/* Progreso del 0% al 100% */}
                            {submitProgress < 100 ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-bold text-slate-700 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                            {submitStage}
                                        </span>
                                        <span className="font-mono font-extrabold text-blue-700 text-lg">
                                            {submitProgress}%
                                        </span>
                                    </div>

                                    {/* Barra de progreso */}
                                    <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 border border-slate-200 overflow-hidden shadow-inner">
                                        <div
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300 shadow-sm"
                                            style={{ width: `${submitProgress}%` }}
                                        />
                                    </div>

                                    <p className="text-xs text-slate-500 text-center leading-relaxed">
                                        Sus datos y fotografías se están procesando y enviando para su <b>revisión y confirmación</b> ante el presbiterio y secretaría nacional.
                                    </p>
                                </div>
                            ) : (
                                /* Pantalla de Confirmación Exitosa al llegar a 100% */
                                <div className="space-y-5 text-center">
                                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                                        <p className="text-xs uppercase tracking-wider text-emerald-800 font-bold mb-0.5">
                                            Código Ministerial Asignado
                                        </p>
                                        <span className="font-mono text-3xl font-black text-emerald-900 tracking-wider">
                                            {submittedResult?.codigo || 'ASIGNADO'}
                                        </span>
                                    </div>

                                    <div className="space-y-1.5 text-slate-600 text-sm">
                                        <p className="font-bold text-base text-slate-900">
                                            {submittedResult?.nombre}
                                        </p>
                                        <p className="text-slate-600 text-xs leading-relaxed">
                                            {submittedResult?.mensaje || 'Los datos han sido recibidos para su revisión y confirmación oficial.'}
                                        </p>
                                    </div>

                                    <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                                        <Button
                                            type="button"
                                            onClick={handleResetOtro}
                                            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-md text-sm"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Registrar a Otro Pastor
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Header Institucional en Fondo Claro */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/icons/logo_mmm-a-color-sin-fondo.png"
                            alt="Logo MMM Venezuela"
                            className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/icons/logo_mmm.png';
                            }}
                        />
                        <div>
                            <h1 className="font-black text-sm sm:text-base text-slate-900 tracking-tight leading-tight">
                                Movimiento Misionero Mundial
                            </h1>
                            <p className="text-[11px] sm:text-xs text-blue-700 font-bold">
                                Ficha de Registro Ministerial Oficial
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Indicador de Auto-Save */}
                        {lastSavedTime && (
                            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                {isSavingDraft ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                                        <span className="text-[11px] font-medium text-slate-600">Guardando borrador...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-[11px] font-medium text-slate-600">Borrador auto-guardado ({lastSavedTime})</span>
                                    </>
                                )}
                            </div>
                        )}

                        <Badge variant="outline" className="hidden md:inline-flex border-blue-200 text-blue-800 bg-blue-50 py-1 px-3 text-xs font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                            Portal Oficial MMM
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">
                {/* Banner de Recuperación de Borrador */}
                {hasPendingDraft && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                                <RotateCcw className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-blue-950">
                                    ¡Tienes un borrador en progreso guardado en este equipo!
                                </h3>
                                <p className="text-xs text-blue-800 mt-0.5">
                                    Puedes retomar en el <b>Paso {draftStep}: {steps[draftStep - 1]?.title}</b> con los datos que habías ingresado previamente.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                                type="button"
                                onClick={handleRestoreDraft}
                                className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex-1 sm:flex-initial shadow-md"
                            >
                                <Cloud className="w-4 h-4 mr-1.5" />
                                Continuar Borrador
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleDiscardDraft}
                                className="border-slate-300 text-slate-700 hover:text-rose-600 hover:border-rose-300 text-xs sm:text-sm flex-1 sm:flex-initial"
                            >
                                Empezar de Cero
                            </Button>
                        </div>
                    </div>
                )}

                {/* Formulario Wizard */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header de Título y Progreso */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-blue-600" />
                                Formulario de Registro de Pastor
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Su avance se guarda de forma continua para evitar pérdidas de información.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            {activeTab > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab(activeTab - 1)}
                                    className="border-slate-300 text-slate-700 hover:bg-slate-50 flex-1 md:flex-initial font-medium"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                                    Anterior
                                </Button>
                            )}
                            {activeTab < 5 && (
                                <Button
                                    type="button"
                                    onClick={() => setActiveTab(activeTab + 1)}
                                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold flex-1 md:flex-initial shadow-md"
                                >
                                    Siguiente
                                    <ArrowRight className="w-4 h-4 ml-1.5" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Stepper Tabs - Modo Claro */}
                    <div className="space-y-3">
                        {/* Barra Móvil */}
                        <div className="block sm:hidden bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="font-bold text-blue-700">
                                    Paso {activeTab} de 5: {steps[activeTab - 1].title}
                                </span>
                                <span className="font-mono font-bold text-slate-500">{Math.round((activeTab / 5) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                                    style={{ width: `${(activeTab / 5) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Grid de Pasos */}
                        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 scrollbar-thin">
                            {steps.map((step) => {
                                const Icon = step.icon;
                                const isActive = activeTab === step.id;
                                const isCompleted = activeTab > step.id;

                                return (
                                    <button
                                        key={step.id}
                                        type="button"
                                        onClick={() => setActiveTab(step.id)}
                                        className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left min-w-[170px] sm:min-w-0 shrink-0 sm:shrink ${isActive
                                                ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                                                : isCompleted
                                                    ? 'bg-white border-emerald-300 hover:border-emerald-400'
                                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div
                                            className={`flex items-center justify-center h-9 w-9 rounded-lg shrink-0 font-bold text-xs sm:text-sm ${isActive
                                                    ? 'bg-blue-700 text-white shadow-xs'
                                                    : isCompleted
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}
                                        >
                                            {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                                Paso {step.id}
                                            </span>
                                            <h3 className="font-bold text-xs sm:text-sm truncate text-slate-900">
                                                {step.title}
                                            </h3>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* PASO 1: DATOS PERSONALES, CÓNYUGE, CONTACTO Y DIRECCIÓN */}
                    {activeTab === 1 && (
                        <Card className="bg-white border-slate-200 shadow-sm text-slate-800 rounded-2xl">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                                <div className="flex items-center gap-2 text-blue-800 font-bold text-base">
                                    <User className="h-5 w-5 text-blue-600" />
                                    <span>Paso 1: Información Personal, Cónyuge y Ubicación</span>
                                </div>
                                <CardDescription className="text-slate-500 text-xs font-medium">
                                    Ingrese sus datos de identidad, datos del cónyuge para vinculación ministerial y su dirección.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-6">
                                {/* Fila 1: Nombres, Apellidos, Cédula, Género */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <Label htmlFor="nombres" className="text-xs font-bold uppercase text-slate-700">
                                            Nombres <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            id="nombres"
                                            required
                                            value={data.nombres}
                                            onChange={(e) => setData('nombres', e.target.value)}
                                            placeholder="Ej. Juan Carlos"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                        {errors.nombres && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.nombres}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="apellidos" className="text-xs font-bold uppercase text-slate-700">
                                            Apellidos <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            id="apellidos"
                                            required
                                            value={data.apellidos}
                                            onChange={(e) => setData('apellidos', e.target.value)}
                                            placeholder="Ej. Pérez Rodríguez"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                        {errors.apellidos && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.apellidos}</p>}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="documento" className="text-xs font-bold uppercase text-slate-700">
                                                Cédula de Identidad <span className="text-rose-500">*</span>
                                            </Label>
                                            {isCheckingCedula && (
                                                <span className="text-[10px] text-blue-600 flex items-center gap-1 font-medium">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    Verificando...
                                                </span>
                                            )}
                                        </div>
                                        <Input
                                            id="documento"
                                            required
                                            value={data.documento}
                                            onChange={(e) => {
                                                setData('documento', e.target.value);
                                                checkCedulaDuplicada(e.target.value);
                                            }}
                                            onBlur={(e) => checkCedulaDuplicada(e.target.value)}
                                            placeholder="Ej. V-12345678"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600 font-mono"
                                        />
                                        {cedulaExistenteNombre && (
                                            <p className="text-xs text-emerald-700 mt-1.5 flex items-center gap-1 font-semibold">
                                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                                                Pastor(a) registrado(a): {cedulaExistenteNombre} (Datos cargados para edición/actualización)
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="genero" className="text-xs font-bold uppercase text-slate-700">
                                            Género <span className="text-rose-500">*</span>
                                        </Label>
                                        <Select2
                                            id="genero"
                                            options={generoOptions}
                                            value={data.genero}
                                            onChange={(val) => setData('genero', val)}
                                            placeholder="Seleccione Género"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                {/* Fila 2: Fecha Nacimiento, Edad, Estado Civil */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="fe_nacimiento" className="text-xs font-bold uppercase text-slate-700">
                                            Fecha de Nacimiento
                                        </Label>
                                        <Input
                                            id="fe_nacimiento"
                                            type="date"
                                            value={data.fe_nacimiento}
                                            onChange={handleBirthDateChange}
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="edad" className="text-xs font-bold uppercase text-slate-700">
                                            Edad (Años)
                                        </Label>
                                        <Input
                                            id="edad"
                                            type="number"
                                            value={data.edad}
                                            onChange={(e) => setData('edad', e.target.value)}
                                            placeholder="Calculada autom."
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="estado_civil" className="text-xs font-bold uppercase text-slate-700">
                                            Estado Civil <span className="text-rose-500">*</span>
                                        </Label>
                                        <Select2
                                            id="estado_civil"
                                            options={estadoCivilOptions}
                                            value={data.estado_civil}
                                            onChange={(val) => setData('estado_civil', val)}
                                            placeholder="Seleccione Estado Civil"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                {/* SECCIÓN DEDICADA DE CÓNYUGE */}
                                {esCasado && (
                                    <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-4 shadow-xs">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-200/80">
                                            <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
                                                <Heart className="h-4 w-4 text-rose-500 shrink-0 fill-rose-500/20" />
                                                <span>Información del Cónyuge y Vinculación</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-200">
                                                <Label htmlFor="conyuge_pastorea" className="text-xs font-bold cursor-pointer text-slate-700">
                                                    ¿El cónyuge también pastorea o pertenece al ministerio?
                                                </Label>
                                                <Switch
                                                    id="conyuge_pastorea"
                                                    checked={data.conyuge_pastorea}
                                                    onCheckedChange={(checked) => {
                                                        setData((prev) => ({
                                                            ...prev,
                                                            conyuge_pastorea: checked,
                                                            cedula_conyuge: checked ? prev.cedula_conyuge : '',
                                                            conyuge_id: checked ? prev.conyuge_id : '',
                                                        }));
                                                        if (!checked) {
                                                            setCedulaConyugeEncontrada(null);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {/* 1. Nombre Completo del Cónyuge - Ancho Completo */}
                                            <div className="w-full">
                                                <Label htmlFor="nombre_conyuge" className="text-xs font-bold uppercase text-slate-700">
                                                    Nombre Completo del Cónyuge <span className="text-rose-500">*</span>
                                                </Label>
                                                <Input
                                                    id="nombre_conyuge"
                                                    required={esCasado}
                                                    value={data.nombre_conyuge}
                                                    onChange={(e) => setData('nombre_conyuge', e.target.value)}
                                                    placeholder="Nombres y Apellidos completos de su esposo(a)"
                                                    className="mt-1 w-full bg-white border-slate-300 text-slate-900 focus:border-blue-600 text-sm"
                                                />
                                                {errors.nombre_conyuge && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.nombre_conyuge}</p>}
                                            </div>

                                            {/* 2. Cédula del Cónyuge - Solo visible si es pastor, ancho completo y sin texto rojo */}
                                            {data.conyuge_pastorea && (
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="cedula_conyuge" className="text-xs font-bold uppercase text-slate-700">
                                                            Cédula de Identidad del Cónyuge <span className="text-rose-500">*</span>
                                                        </Label>
                                                        {isCheckingCedulaConyuge && (
                                                            <span className="text-[10px] text-blue-600 flex items-center gap-1 font-medium">
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                                Verificando...
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Input
                                                        id="cedula_conyuge"
                                                        required={data.conyuge_pastorea}
                                                        value={data.cedula_conyuge}
                                                        onChange={(e) => {
                                                            setData('cedula_conyuge', e.target.value);
                                                            checkCedulaConyuge(e.target.value);
                                                        }}
                                                        onBlur={(e) => checkCedulaConyuge(e.target.value)}
                                                        placeholder="Ej. V-23456789"
                                                        className="mt-1 w-full bg-white border-slate-300 text-slate-900 focus:border-blue-600 font-mono"
                                                    />
                                                    {errors.cedula_conyuge && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.cedula_conyuge}</p>}
                                                    {cedulaConyugeEncontrada && (
                                                        <p className="text-xs text-emerald-700 mt-1.5 flex items-center gap-1 font-semibold">
                                                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                                                            Pastor(a) encontrado(a): {cedulaConyugeEncontrada} (Vinculación ministerial automática)
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Fila 3: Teléfonos y Correo */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="telefono_tlf" className="text-xs font-bold uppercase text-slate-700">
                                            Teléfono Celular / WhatsApp <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            id="telefono_tlf"
                                            required
                                            value={data.telefono_tlf}
                                            onChange={(e) => setData('telefono_tlf', e.target.value)}
                                            placeholder="0414-1234567"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                        {errors.telefono_tlf && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.telefono_tlf}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="telefono_hab" className="text-xs font-bold uppercase text-slate-700">
                                            Teléfono de Habitación / Fijo
                                        </Label>
                                        <Input
                                            id="telefono_hab"
                                            value={data.telefono_hab}
                                            onChange={(e) => setData('telefono_hab', e.target.value)}
                                            placeholder="0212-1234567"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-700">
                                            Correo Electrónico
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="pastor@ejemplo.com"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                        {errors.email && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email}</p>}
                                    </div>
                                </div>

                                {/* Fila 4: Dirección Territorial */}
                                <div className="border-t border-slate-200 pt-5">
                                    <h4 className="text-xs uppercase font-bold text-blue-900 tracking-wider mb-3 flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        Dirección y Ubicación Geográfica
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <Label htmlFor="estado_id" className="text-xs font-bold uppercase text-slate-700">
                                                Estado <span className="text-rose-500">*</span>
                                            </Label>
                                            <Select2
                                                id="estado_id"
                                                options={estadoOptions}
                                                value={data.estado_id}
                                                onChange={(val) => handleEstadoChange(val)}
                                                placeholder="Seleccione Estado"
                                                searchPlaceholder="Buscar estado..."
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="municipio_id" className="text-xs font-bold uppercase text-slate-700">
                                                Municipio
                                            </Label>
                                            <Select2
                                                id="municipio_id"
                                                options={municipioOptions}
                                                value={data.municipio_id}
                                                onChange={(val) => handleMunicipioChange(val)}
                                                disabled={!data.estado_id}
                                                placeholder={data.estado_id ? "Seleccione Municipio" : "Primero seleccione Estado"}
                                                searchPlaceholder="Buscar municipio..."
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="parroquia_id" className="text-xs font-bold uppercase text-slate-700">
                                                Parroquia
                                            </Label>
                                            <Select2
                                                id="parroquia_id"
                                                options={parroquiaOptions}
                                                value={data.parroquia_id}
                                                onChange={(val) => setData('parroquia_id', val)}
                                                disabled={!data.municipio_id}
                                                placeholder={data.municipio_id ? "Seleccione Parroquia" : "Primero seleccione Municipio"}
                                                searchPlaceholder="Buscar parroquia..."
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <Label htmlFor="urbanizacion" className="text-xs font-bold uppercase text-slate-700">
                                                Sector / Urbanización
                                            </Label>
                                            <Input
                                                id="urbanizacion"
                                                value={data.urbanizacion}
                                                onChange={(e) => setData('urbanizacion', e.target.value)}
                                                placeholder="Ej. Urb. La Concordia"
                                                className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="calle_avenida" className="text-xs font-bold uppercase text-slate-700">
                                                Calle / Avenida
                                            </Label>
                                            <Input
                                                id="calle_avenida"
                                                value={data.calle_avenida}
                                                onChange={(e) => setData('calle_avenida', e.target.value)}
                                                placeholder="Ej. Av. Principal"
                                                className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="edificio_casa_quinta" className="text-xs font-bold uppercase text-slate-700">
                                                Casa / Edificio / Quinta
                                            </Label>
                                            <Input
                                                id="edificio_casa_quinta"
                                                value={data.edificio_casa_quinta}
                                                onChange={(e) => setData('edificio_casa_quinta', e.target.value)}
                                                placeholder="Ej. Casa N° 12-A"
                                                className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="piso" className="text-xs font-bold uppercase text-slate-700">
                                                Piso / Apto
                                            </Label>
                                            <Input
                                                id="piso"
                                                value={data.piso}
                                                onChange={(e) => setData('piso', e.target.value)}
                                                placeholder="Ej. Piso 2 / Apto 4"
                                                className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 sm:p-6 bg-slate-50/70 border-t border-slate-200 flex items-center justify-end rounded-b-2xl">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(2);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-md text-sm"
                                >
                                    Siguiente: Datos Académicos
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* PASO 2: DATOS ACADÉMICOS Y TEOLÓGICOS */}
                    {activeTab === 2 && (
                        <Card className="bg-white border-slate-200 shadow-sm text-slate-800 rounded-2xl">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                                <div className="flex items-center gap-2 text-blue-800 font-bold text-base">
                                    <GraduationCap className="h-5 w-5 text-blue-600" />
                                    <span>Paso 2: Formación Académica & Estudios Teológicos</span>
                                </div>
                                <CardDescription className="text-slate-500 text-xs font-medium">
                                    Nivel de instrucción académica secular y preparación teológica o bíblica.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="grado_instruccion" className="text-xs font-bold uppercase text-slate-700">
                                            Grado de Instrucción Académica
                                        </Label>
                                        <Select2
                                            id="grado_instruccion"
                                            options={gradoInstruccionOptions}
                                            value={data.grado_instruccion}
                                            onChange={(val) => setData('grado_instruccion', val)}
                                            placeholder="Seleccione Grado de Instrucción"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="titulo_obtenido" className="text-xs font-bold uppercase text-slate-700">
                                            Título Secular Obtenido
                                        </Label>
                                        <Input
                                            id="titulo_obtenido"
                                            value={data.titulo_obtenido}
                                            onChange={(e) => setData('titulo_obtenido', e.target.value)}
                                            placeholder="Ej. Lic. en Educación, Ing. Civil, Bachiller"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 pt-5 space-y-4">
                                    <div className="flex items-center justify-between bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                                        <div>
                                            <p className="font-bold text-sm text-blue-950">¿Posee Estudios Teológicos?</p>
                                            <p className="text-xs text-slate-600">
                                                Indique si ha cursado estudios en seminarios o institutos bíblicos.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.estudio_teologico}
                                            onCheckedChange={(checked) => setData('estudio_teologico', checked)}
                                        />
                                    </div>

                                    {data.estudio_teologico && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                            <div>
                                                <Label htmlFor="titulo_teologico" className="text-xs font-bold uppercase text-slate-700">
                                                    Título Teológico
                                                </Label>
                                                <Input
                                                    id="titulo_teologico"
                                                    value={data.titulo_teologico}
                                                    onChange={(e) => setData('titulo_teologico', e.target.value)}
                                                    placeholder="Ej. Bachiller en Teología"
                                                    className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="instituto_teologico" className="text-xs font-bold uppercase text-slate-700">
                                                    Instituto / Seminario
                                                </Label>
                                                <Input
                                                    id="instituto_teologico"
                                                    value={data.instituto_teologico}
                                                    onChange={(e) => setData('instituto_teologico', e.target.value)}
                                                    placeholder="Ej. Instituto Bíblico Elim"
                                                    className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="tiempo_de_estudio_teologico" className="text-xs font-bold uppercase text-slate-700">
                                                    Tiempo de Estudio
                                                </Label>
                                                <Input
                                                    id="tiempo_de_estudio_teologico"
                                                    value={data.tiempo_de_estudio_teologico}
                                                    onChange={(e) => setData('tiempo_de_estudio_teologico', e.target.value)}
                                                    placeholder="Ej. 3 Años"
                                                    className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 sm:p-6 bg-slate-50/70 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 rounded-b-2xl">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setActiveTab(1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Anterior: Datos Personales
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(3);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-md text-sm"
                                >
                                    Siguiente: Datos Eclesiásticos
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* PASO 3: DATOS ECLESIÁSTICOS */}
                    {activeTab === 3 && (
                        <Card className="bg-white border-slate-200 shadow-sm text-slate-800 rounded-2xl">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                                <div className="flex items-center gap-2 text-blue-800 font-bold text-base">
                                    <Cross className="h-5 w-5 text-blue-600" />
                                    <span>Paso 3: Trayectoria y Datos Eclesiásticos</span>
                                </div>
                                <CardDescription className="text-slate-500 text-xs font-medium">
                                    Grado ministerial, zona, distrito y responsabilidades dentro de la obra.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="nivel_ministerial" className="text-xs font-bold uppercase text-slate-700">
                                            Grado Ministerial <span className="text-rose-500">*</span>
                                        </Label>
                                        <Select2
                                            id="nivel_ministerial"
                                            options={nivelMinisterialOptions}
                                            value={data.nivel_ministerial}
                                            onChange={(val) => setData('nivel_ministerial', val)}
                                            placeholder="Seleccione Grado Ministerial"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="zona" className="text-xs font-bold uppercase text-slate-700">
                                            Zona
                                        </Label>
                                        <Input
                                            id="zona"
                                            type="text"
                                            inputMode="numeric"
                                            value={data.zona}
                                            onChange={(e) => setData('zona', e.target.value.replace(/\D/g, ''))}
                                            placeholder="Ej. 1"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="distrito" className="text-xs font-bold uppercase text-slate-700">
                                            Distrito
                                        </Label>
                                        <Select2
                                            id="distrito"
                                            options={distritoOptions}
                                            value={data.distrito ? String(data.distrito).replace(/\D/g, '') : ''}
                                            onChange={(val) => setData('distrito', val)}
                                            placeholder="Seleccione Distrito (1 al 5)"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="ano_promocion" className="text-xs font-bold uppercase text-slate-700">
                                            Año de Promoción / Ordenación
                                        </Label>
                                        <Input
                                            id="ano_promocion"
                                            value={data.ano_promocion}
                                            onChange={(e) => setData('ano_promocion', e.target.value)}
                                            placeholder="Ej. 2018"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="tiempo_colaborando" className="text-xs font-bold uppercase text-slate-700">
                                            Tiempo en el Ministerio
                                        </Label>
                                        <Input
                                            id="tiempo_colaborando"
                                            value={data.tiempo_colaborando}
                                            onChange={(e) => setData('tiempo_colaborando', e.target.value)}
                                            placeholder="Ej. 12 Años y 4 Meses"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="cargo_nacional" className="text-xs font-bold uppercase text-slate-700">
                                            Cargo Nacional / Responsabilidad
                                        </Label>
                                        <Input
                                            id="cargo_nacional"
                                            value={data.cargo_nacional}
                                            onChange={(e) => setData('cargo_nacional', e.target.value)}
                                            placeholder="Ej. Supervisor de Zona / Presbítero"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                                        <div>
                                            <p className="font-bold text-sm text-blue-950">Bautizado en el Espíritu Santo</p>
                                            <p className="text-xs text-slate-600">Con la evidencia bíblica de hablar en otras lenguas</p>
                                        </div>
                                        <Switch
                                            checked={data.batizado_espiritu_santo}
                                            onCheckedChange={(c) => setData('batizado_espiritu_santo', c)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                                        <div>
                                            <p className="font-bold text-sm text-blue-950">Pertenece al Ministerio Oficial MMM</p>
                                            <p className="text-xs text-slate-600">Obrero activo en la nómina nacional</p>
                                        </div>
                                        <Switch
                                            checked={data.pertenece_ministerio}
                                            onCheckedChange={(c) => setData('pertenece_ministerio', c)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="nota" className="text-xs font-bold uppercase text-slate-700">
                                        Observaciones o Notas Ministeriales
                                    </Label>
                                    <Textarea
                                        id="nota"
                                        rows={2}
                                        value={data.nota}
                                        onChange={(e) => setData('nota', e.target.value)}
                                        placeholder="Información adicional sobre su labor ministerial..."
                                        className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 sm:p-6 bg-slate-50/70 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 rounded-b-2xl">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setActiveTab(2);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Anterior: Datos Académicos
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(4);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-md text-sm"
                                >
                                    Siguiente: Estado de Salud
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* PASO 4: ESTADO DE SALUD */}
                    {activeTab === 4 && (
                        <Card className="bg-white border-slate-200 shadow-sm text-slate-800 rounded-2xl">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                                <div className="flex items-center gap-2 text-blue-800 font-bold text-base">
                                    <Stethoscope className="h-5 w-5 text-blue-600" />
                                    <span>Paso 4: Ficha de Salud & Contacto de Emergencia</span>
                                </div>
                                <CardDescription className="text-slate-500 text-xs font-medium">
                                    Datos médicos vitales para atención preventiva y asistencia en eventos nacionales.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="grupo_sanguineo" className="text-xs font-bold uppercase text-slate-700">
                                            Grupo Sanguíneo
                                        </Label>
                                        <Select2
                                            id="grupo_sanguineo"
                                            options={grupoSanguineoOptions}
                                            value={data.grupo_sanguineo}
                                            onChange={(val) => setData('grupo_sanguineo', val)}
                                            placeholder="Seleccione Grupo"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="condicion_salud" className="text-xs font-bold uppercase text-slate-700">
                                            Condición General de Salud
                                        </Label>
                                        <Select2
                                            id="condicion_salud"
                                            options={condicionSaludOptions}
                                            value={data.condicion_salud}
                                            onChange={(val) => setData('condicion_salud', val)}
                                            placeholder="Seleccione Condición"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="alergias" className="text-xs font-bold uppercase text-slate-700">
                                            Alergias Conocidas
                                        </Label>
                                        <Input
                                            id="alergias"
                                            value={data.alergias}
                                            onChange={(e) => setData('alergias', e.target.value)}
                                            placeholder="Ej. Penicilina, polen, ninguna"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-sm text-blue-950">¿Padece alguna Enfermedad?</p>
                                                <p className="text-xs text-slate-600">Hipertensión, diabetes, afección cardíaca, etc.</p>
                                            </div>
                                            <Switch
                                                checked={data.padece_enfermedad}
                                                onCheckedChange={(c) => setData('padece_enfermedad', c)}
                                            />
                                        </div>
                                        {data.padece_enfermedad && (
                                            <Textarea
                                                rows={2}
                                                value={data.enfermedades_cronicas}
                                                onChange={(e) => setData('enfermedades_cronicas', e.target.value)}
                                                placeholder="Describa el diagnóstico o enfermedad crónica..."
                                                className="bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                            />
                                        )}
                                    </div>

                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-sm text-blue-950">¿Toma Medicamentos Diarios?</p>
                                                <p className="text-xs text-slate-600">Tratamiento prescrito permanente</p>
                                            </div>
                                            <Switch
                                                checked={data.toma_medicamentos}
                                                onCheckedChange={(c) => setData('toma_medicamentos', c)}
                                            />
                                        </div>

                                        {data.toma_medicamentos && (
                                            <div className="space-y-2">
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={nuevoMedicamentoNombre}
                                                        onChange={(e) => setNuevoMedicamentoNombre(e.target.value)}
                                                        placeholder="Nombre del medicamento"
                                                        className="bg-white border-slate-300 text-xs text-slate-900"
                                                    />
                                                    <Input
                                                        value={nuevoMedicamentoDosis}
                                                        onChange={(e) => setNuevoMedicamentoDosis(e.target.value)}
                                                        placeholder="Dosis (Ej. 50mg)"
                                                        className="bg-white border-slate-300 text-xs text-slate-900 w-28"
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={handleAgregarMedicamento}
                                                        className="bg-blue-700 hover:bg-blue-800 text-white"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                {medicamentosList.length > 0 && (
                                                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                                        {medicamentosList.map((m: any, idx: number) => (
                                                            <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-md text-xs border border-slate-200 shadow-xs">
                                                                <span className="text-slate-800">
                                                                    <b>{m.nombre}</b> {m.dosis ? `(${m.dosis})` : ''}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEliminarMedicamento(idx)}
                                                                    className="text-rose-600 hover:text-rose-800"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 pt-4">
                                    <h4 className="text-xs uppercase font-bold text-blue-900 tracking-wider mb-3 flex items-center gap-1.5">
                                        <PhoneCall className="w-4 h-4 text-blue-600" />
                                        Contacto para Emergencias
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="contacto_emergencia_nombre" className="text-xs font-bold uppercase text-slate-700">
                                                Nombre del Contacto
                                            </Label>
                                            <Input
                                                id="contacto_emergencia_nombre"
                                                value={data.contacto_emergencia_nombre}
                                                onChange={(e) => setData('contacto_emergencia_nombre', e.target.value)}
                                                placeholder="Ej. María Pérez (Esposa / Familiar)"
                                                className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="contacto_emergencia_telefono" className="text-xs font-bold uppercase text-slate-700">
                                                Teléfono de Emergencia
                                            </Label>
                                            <Input
                                                id="contacto_emergencia_telefono"
                                                value={data.contacto_emergencia_telefono}
                                                onChange={(e) => setData('contacto_emergencia_telefono', e.target.value)}
                                                placeholder="Ej. 0412-9876543"
                                                className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 sm:p-6 bg-slate-50/70 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 rounded-b-2xl">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setActiveTab(3);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Anterior: Datos Eclesiásticos
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(5);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-md text-sm"
                                >
                                    Siguiente: Fotografías
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* PASO 5: FOTOGRAFÍA DEL PASTOR Y CÉDULA */}
                    {activeTab === 5 && (
                        <Card className="bg-white border-slate-200 shadow-sm text-slate-800 rounded-2xl">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                                <div className="flex items-center gap-2 text-blue-800 font-bold text-base">
                                    <Camera className="h-5 w-5 text-blue-600" />
                                    <span>Paso 5: Fotografía Tipo Carnet y Foto de la Cédula</span>
                                </div>
                                <CardDescription className="text-slate-500 text-xs font-medium">
                                    Tome o suba una foto nítida de perfil (tipo carnet) con vestimenta adecuada y la foto de su cédula de identidad.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-6">
                                {/* Modal de Cámara en Vivo si está activa */}
                                {isCameraActive && (
                                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 flex flex-col items-center shadow-lg">
                                        <div className="relative rounded-xl overflow-hidden bg-black max-w-md w-full aspect-video border border-slate-700">
                                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                onClick={capturePhoto}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
                                            >
                                                <Camera className="w-4 h-4" />
                                                Capturar Fotografía
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    const nextMode = facingMode === 'user' ? 'environment' : 'user';
                                                    setFacingMode(nextMode);
                                                    startCamera(activeCameraTarget, nextMode);
                                                }}
                                                className="bg-white border-slate-300 text-slate-700"
                                            >
                                                <SwitchCamera className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={stopCamera}
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Fotografía de Perfil */}
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-4">
                                        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                                            <User className="w-4 h-4 text-blue-600" />
                                            Foto de Perfil (Tipo Carnet)
                                        </h4>

                                        <div className="w-36 h-44 rounded-xl border-2 border-dashed border-slate-300 bg-white overflow-hidden flex items-center justify-center relative shadow-inner">
                                            {data.foto ? (
                                                <img src={data.foto} alt="Foto Perfil" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-slate-400 text-xs flex flex-col items-center p-2">
                                                    <Camera className="w-8 h-8 mb-1 opacity-50" />
                                                    <span>Sin Foto</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 justify-center w-full">
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => startCamera('foto')}
                                                className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold gap-1"
                                            >
                                                <Video className="w-3.5 h-3.5" />
                                                Usar Cámara
                                            </Button>
                                            <Label
                                                htmlFor="upload-foto"
                                                className="cursor-pointer inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold py-2 px-3 rounded-md shadow-xs"
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                Subir Archivo
                                            </Label>
                                            <input
                                                id="upload-foto"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, 'foto')}
                                            />
                                            {data.foto && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setData('foto', '')}
                                                    className="text-rose-600 hover:text-rose-800 text-xs"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Fotografía de la Cédula */}
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-4">
                                        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                                            <IdCard className="w-4 h-4 text-blue-600" />
                                            Foto de la Cédula de Identidad
                                        </h4>

                                        <div className="w-56 h-36 rounded-xl border-2 border-dashed border-slate-300 bg-white overflow-hidden flex items-center justify-center relative shadow-inner">
                                            {data.foto_cedula ? (
                                                <img src={data.foto_cedula} alt="Cédula" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-slate-400 text-xs flex flex-col items-center p-2">
                                                    <IdCard className="w-8 h-8 mb-1 opacity-50" />
                                                    <span>Sin Cédula</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 justify-center w-full">
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => startCamera('foto_cedula', 'environment')}
                                                className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold gap-1"
                                            >
                                                <Video className="w-3.5 h-3.5" />
                                                Usar Cámara
                                            </Button>
                                            <Label
                                                htmlFor="upload-cedula"
                                                className="cursor-pointer inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold py-2 px-3 rounded-md shadow-xs"
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                Subir Archivo
                                            </Label>
                                            <input
                                                id="upload-cedula"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, 'foto_cedula')}
                                            />
                                            {data.foto_cedula && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setData('foto_cedula', '')}
                                                    className="text-rose-600 hover:text-rose-800 text-xs"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 rounded-b-2xl">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setActiveTab(4);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Anterior: Estado de Salud
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg text-sm"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {processing ? 'Enviando Datos...' : 'Finalizar y Enviar Registro'}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </form>
            </main>

            {/* Footer Institucional */}
            <footer className="bg-white border-t border-slate-200 text-center py-4 text-xs text-slate-500">
                <p>© {new Date().getFullYear()} Movimiento Misionero Mundial en Venezuela. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
