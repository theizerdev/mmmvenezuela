import React, { useState, useMemo, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    Sparkles
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

interface PastorItem {
    id: number;
    nombres: string;
    apellidos: string;
    codigo: string;
    documento: string;
    genero?: string;
}

interface RegistroPastorProps {
    estados: EstadoItem[];
    municipios: MunicipioItem[];
    parroquias: ParroquiaItem[];
    pastoresDisponibles?: PastorItem[];
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

export default function RegistroPastor({
    estados = [],
    municipios = [],
    parroquias = [],
    pastoresDisponibles = [],
    gradosMinisteriales = ['Colaborador', 'Laico', 'Licenciado', 'Ministro Ordenado'],
    estadosCiviles = ['Soltero(a)', 'Casado(a)', 'Viudo(a)', 'Divorciado(a)'],
    generos = ['Masculino', 'Femenino'],
    flash,
}: RegistroPastorProps) {
    const [activeTab, setActiveTab] = useState<number>(1);
    const [dismissedSuccess, setDismissedSuccess] = useState<boolean>(false);

    // Estados de verificación de Cédula en tiempo real
    const [isCheckingCedula, setIsCheckingCedula] = useState<boolean>(false);
    const [cedulaExiste, setCedulaExiste] = useState<boolean>(false);
    const [cedulaEsConyugeVinculado, setCedulaEsConyugeVinculado] = useState<boolean>(false);
    const [cedulaExistenteNombre, setCedulaExistenteNombre] = useState<string | null>(null);

    // Cámara Web para Foto de Perfil
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

    const successData = !dismissedSuccess ? flash?.success : undefined;

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

    // Opciones territoriales en cascada
    const municipiosFiltrados = useMemo(() => {
        if (!data.estado_id) return [];
        return municipios.filter((m) => String(m.estado_id) === String(data.estado_id));
    }, [municipios, data.estado_id]);

    const parroquiasFiltradas = useMemo(() => {
        if (!data.municipio_id) return [];
        return parroquias.filter((p) => String(p.municipio_id) === String(data.municipio_id));
    }, [parroquias, data.municipio_id]);

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
            } catch (e) {}
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

    // Validación de Cédula duplicada en tiempo real
    const checkCedulaDuplicada = async (doc: string) => {
        const trimmed = doc.trim();
        if (trimmed.length < 5) {
            setCedulaExiste(false);
            setCedulaEsConyugeVinculado(false);
            setCedulaExistenteNombre(null);
            return;
        }

        setIsCheckingCedula(true);
        try {
            const res = await fetch(`/registro/verificar-cedula/${encodeURIComponent(trimmed)}`);
            if (res.ok) {
                const result = await res.json();
                if (result.existe) {
                    setCedulaExiste(!result.es_conyuge_vinculado);
                    setCedulaEsConyugeVinculado(Boolean(result.es_conyuge_vinculado));
                    setCedulaExistenteNombre(result.nombre || null);
                    if (result.es_conyuge_vinculado && result.nombres) {
                        setData((prev) => ({
                            ...prev,
                            nombres: prev.nombres || result.nombres,
                            apellidos: prev.apellidos || result.apellidos,
                            genero: result.genero || prev.genero,
                            fe_nacimiento: result.fe_nacimiento || prev.fe_nacimiento,
                            nombre_conyuge: result.nombre_conyuge || prev.nombre_conyuge,
                        }));
                    }
                } else {
                    setCedulaExiste(false);
                    setCedulaEsConyugeVinculado(false);
                    setCedulaExistenteNombre(null);
                }
            }
        } catch (e) {
            // Ignorar errores de red
        } finally {
            setIsCheckingCedula(false);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/registro', {
            preserveScroll: true,
            onSuccess: () => {
                setDismissedSuccess(false);
            },
        });
    };

    const handleResetOtro = () => {
        reset();
        setDismissedSuccess(true);
        setActiveTab(1);
        setCedulaExiste(false);
        setCedulaEsConyugeVinculado(false);
        router.get('/registro', {}, { replace: true, preserveState: false });
    };

    const steps = [
        { id: 1, title: 'Datos Personales', icon: User, desc: 'Identificación, contacto y dirección' },
        { id: 2, title: 'Datos Académicos', icon: GraduationCap, desc: 'Nivel de estudio y teología' },
        { id: 3, title: 'Datos Eclesiásticos', icon: Cross, desc: 'Nivel ministerial, zona y distrito' },
        { id: 4, title: 'Estado de Salud', icon: Stethoscope, desc: 'Historial médico y emergencia' },
        { id: 5, title: 'Fotografía', icon: Camera, desc: 'Foto de perfil y cédula de identidad' },
    ];

    // Si la operación fue exitosa, mostrar pantalla de confirmación
    if (successData) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6">
                <Head title="Registro Exitoso - MMM Venezuela" />
                <Card className="w-full max-w-xl bg-slate-800 border-slate-700 shadow-2xl text-slate-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center text-white">
                        <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-xs">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">¡Registro Completado con Éxito!</h2>
                        <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                            Movimiento Misionero Mundial en Venezuela
                        </p>
                    </div>

                    <CardContent className="p-6 sm:p-8 space-y-6 text-center">
                        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
                            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                                Código Ministerial Asignado
                            </p>
                            <span className="font-mono text-3xl font-extrabold text-amber-400 tracking-wider">
                                {successData.codigo}
                            </span>
                        </div>

                        <div className="space-y-1 text-slate-300 text-sm">
                            <p className="font-semibold text-lg text-white">{successData.nombre}</p>
                            <p className="text-slate-400 text-xs">
                                {successData.mensaje || 'Sus datos han sido recibidos para la validación y emisión de credencial ministerial.'}
                            </p>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                type="button"
                                onClick={handleResetOtro}
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Registrar a Otro Pastor
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            <Head title="Registro Oficial de Pastores - MMM Venezuela" />

            {/* Header Oficial Institucional */}
            <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg font-bold text-slate-950 text-lg">
                            🇻🇪
                        </div>
                        <div>
                            <h1 className="font-bold text-sm sm:text-base text-slate-100 tracking-tight leading-tight">
                                Movimiento Misionero Mundial
                            </h1>
                            <p className="text-[11px] sm:text-xs text-amber-400 font-medium">
                                Ficha de Registro Ministerial Oficial
                            </p>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                        <Badge variant="outline" className="border-slate-700 text-slate-300 bg-slate-800/50 py-1 px-2.5 text-xs">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                            Portal Seguro
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">
                {/* Formulario Wizard */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header de Título y Progreso */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                                Formulario de Registro de Pastor
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                                Complete los 5 módulos con información verídica y actualizada.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            {activeTab > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab(activeTab - 1)}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800 flex-1 md:flex-initial"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                                    Anterior
                                </Button>
                            )}
                            {activeTab < 5 ? (
                                <Button
                                    type="button"
                                    onClick={() => setActiveTab(activeTab + 1)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1 md:flex-initial shadow-md"
                                >
                                    Siguiente
                                    <ArrowRight className="w-4 h-4 ml-1.5" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex-1 md:flex-initial shadow-lg"
                                >
                                    <Save className="w-4 h-4 mr-1.5" />
                                    {processing ? 'Enviando Datos...' : 'Finalizar y Enviar Registro'}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Stepper Tabs - Responsivo */}
                    <div className="space-y-3">
                        {/* Barra Móvil */}
                        <div className="block sm:hidden bg-slate-900 border border-slate-800 p-3 rounded-xl">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="font-semibold text-amber-400">
                                    Paso {activeTab} de 5: {steps[activeTab - 1].title}
                                </span>
                                <span className="font-mono text-slate-400">{Math.round((activeTab / 5) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
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
                                        className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left min-w-[170px] sm:min-w-0 shrink-0 sm:shrink ${
                                            isActive
                                                ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                                                : isCompleted
                                                ? 'bg-slate-900 border-emerald-500/40 hover:border-emerald-500/60'
                                                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80'
                                        }`}
                                    >
                                        <div
                                            className={`flex items-center justify-center h-9 w-9 rounded-lg shrink-0 font-semibold text-xs sm:text-sm ${
                                                isActive
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : isCompleted
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-800 text-slate-400'
                                            }`}
                                        >
                                            {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                                                Paso {step.id}
                                            </span>
                                            <h3 className="font-semibold text-xs sm:text-sm truncate text-white">
                                                {step.title}
                                            </h3>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* PASO 1: DATOS PERSONALES, CONTACTO Y DIRECCIÓN */}
                    {activeTab === 1 && (
                        <Card className="bg-slate-900 border-slate-800 shadow-xl text-slate-100">
                            <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                                <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
                                    <User className="h-5 w-5" />
                                    <span>Paso 1: Información Personal, Contacto y Dirección</span>
                                </div>
                                <CardDescription className="text-slate-400 text-xs">
                                    Ingrese sus datos de identidad nacional, estado civil y residencia actual.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-6">
                                {/* Fila 1: Nombres, Apellidos, Cédula, Género */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <Label htmlFor="nombres" className="text-xs font-semibold uppercase text-slate-300">
                                            Nombres <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            id="nombres"
                                            required
                                            value={data.nombres}
                                            onChange={(e) => setData('nombres', e.target.value)}
                                            placeholder="Ej. Juan Carlos"
                                            className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                        />
                                        {errors.nombres && <p className="text-xs text-rose-400 mt-1">{errors.nombres}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="apellidos" className="text-xs font-semibold uppercase text-slate-300">
                                            Apellidos <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            id="apellidos"
                                            required
                                            value={data.apellidos}
                                            onChange={(e) => setData('apellidos', e.target.value)}
                                            placeholder="Ej. Pérez Rodríguez"
                                            className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                        />
                                        {errors.apellidos && <p className="text-xs text-rose-400 mt-1">{errors.apellidos}</p>}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="documento" className="text-xs font-semibold uppercase text-slate-300">
                                                Cédula de Identidad <span className="text-rose-500">*</span>
                                            </Label>
                                            {isCheckingCedula && <span className="text-[10px] text-blue-400 animate-pulse">Verificando...</span>}
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
                                            className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500 font-mono"
                                        />
                                        {errors.documento && <p className="text-xs text-rose-400 mt-1">{errors.documento}</p>}

                                        {cedulaExiste && (
                                            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                Ya registrada a nombre de: {cedulaExistenteNombre}
                                            </p>
                                        )}
                                        {cedulaEsConyugeVinculado && (
                                            <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
                                                <Info className="w-3.5 h-3.5 shrink-0" />
                                                Registro vinculado a su cónyuge. Se completará su perfil.
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="genero" className="text-xs font-semibold uppercase text-slate-300">
                                            Género <span className="text-rose-500">*</span>
                                        </Label>
                                        <select
                                            id="genero"
                                            value={data.genero}
                                            onChange={(e) => setData('genero', e.target.value)}
                                            className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-sm text-white focus:outline-hidden focus:border-blue-500"
                                        >
                                            {generos.map((g) => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Fila 2: Fecha Nacimiento, Edad, Estado Civil, Cónyuge */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <Label htmlFor="fe_nacimiento" className="text-xs font-semibold uppercase text-slate-300">
                                            Fecha de Nacimiento
                                        </Label>
                                        <Input
                                            id="fe_nacimiento"
                                            type="date"
                                            value={data.fe_nacimiento}
                                            onChange={handleBirthDateChange}
                                            className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="edad" className="text-xs font-semibold uppercase text-slate-300">
                                            Edad (Años)
                                        </Label>
                                        <Input
                                            id="edad"
                                            type="number"
                                            value={data.edad}
                                            onChange={(e) => setData('edad', e.target.value)}
                                            placeholder="Calculada autom."
                                            className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="estado_civil" className="text-xs font-semibold uppercase text-slate-300">
                                            Estado Civil
                                        </Label>
                                        <select
                                            id="estado_civil"
                                            value={data.estado_civil}
                                            onChange={(e) => setData('estado_civil', e.target.value)}
                                            className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-sm text-white focus:outline-hidden focus:border-blue-500"
                                        >
                                            {estadosCiviles.map((ec) => (
                                                <option key={ec} value={ec}>{ec}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="nombre_conyuge" className="text-xs font-semibold uppercase text-slate-300">
                                            Nombre del Cónyuge {data.estado_civil.includes('Casado') && <span className="text-rose-500">*</span>}
                                        </Label>
                                        <Input
                                            id="nombre_conyuge"
                                            value={data.nombre_conyuge}
                                            onChange={(e) => setData('nombre_conyuge', e.target.value)}
                                            placeholder="Nombre completo de su esposo(a)"
                                            className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Fila 3: Teléfonos y Correo */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="telefono_tlf" className="text-xs font-semibold uppercase text-slate-300">
                                            Teléfono Celular / WhatsApp <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            id="telefono_tlf"
                                            required
                                            value={data.telefono_tlf}
                                            onChange={(e) => setData('telefono_tlf', e.target.value)}
                                            placeholder="0414-1234567"
                                            className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                        />
                                        {errors.telefono_tlf && <p className="text-xs text-rose-400 mt-1">{errors.telefono_tlf}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="telefono_hab" className="text-xs font-semibold uppercase text-slate-300">
                                            Teléfono de Habitación / Fijo
                                        </Label>
                                        <Input
                                            id="telefono_hab"
                                            value={data.telefono_hab}
                                            onChange={(e) => setData('telefono_hab', e.target.value)}
                                            placeholder="0212-1234567"
                                            className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="email" className="text-xs font-semibold uppercase text-slate-300">
                                            Correo Electrónico
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="pastor@ejemplo.com"
                                            className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                        />
                                        {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
                                    </div>
                                </div>

                                {/* Fila 4: Dirección Territorial */}
                                <div className="border-t border-slate-800 pt-4">
                                    <h4 className="text-xs uppercase font-bold text-amber-400 tracking-wider mb-3 flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        Dirección y Ubicación Geográfica
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <Label htmlFor="estado_id" className="text-xs font-semibold uppercase text-slate-300">
                                                Estado <span className="text-rose-500">*</span>
                                            </Label>
                                            <select
                                                id="estado_id"
                                                value={data.estado_id}
                                                onChange={(e) => handleEstadoChange(e.target.value)}
                                                className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-sm text-white focus:outline-hidden focus:border-blue-500"
                                            >
                                                <option value="">-- Seleccione Estado --</option>
                                                {estados.map((est) => (
                                                    <option key={est.id} value={est.id}>{est.nombre}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <Label htmlFor="municipio_id" className="text-xs font-semibold uppercase text-slate-300">
                                                Municipio
                                            </Label>
                                            <select
                                                id="municipio_id"
                                                value={data.municipio_id}
                                                onChange={(e) => handleMunicipioChange(e.target.value)}
                                                disabled={!data.estado_id}
                                                className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-sm text-white focus:outline-hidden focus:border-blue-500 disabled:opacity-50"
                                            >
                                                <option value="">-- Seleccione Municipio --</option>
                                                {municipiosFiltrados.map((m) => (
                                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <Label htmlFor="parroquia_id" className="text-xs font-semibold uppercase text-slate-300">
                                                Parroquia
                                            </Label>
                                            <select
                                                id="parroquia_id"
                                                value={data.parroquia_id}
                                                onChange={(e) => setData('parroquia_id', e.target.value)}
                                                disabled={!data.municipio_id}
                                                className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-sm text-white focus:outline-hidden focus:border-blue-500 disabled:opacity-50"
                                            >
                                                <option value="">-- Seleccione Parroquia --</option>
                                                {parroquiasFiltradas.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <Label htmlFor="urbanizacion" className="text-xs font-semibold uppercase text-slate-300">
                                                Sector / Urbanización
                                            </Label>
                                            <Input
                                                id="urbanizacion"
                                                value={data.urbanizacion}
                                                onChange={(e) => setData('urbanizacion', e.target.value)}
                                                placeholder="Ej. Urb. La Concordia"
                                                className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="calle_avenida" className="text-xs font-semibold uppercase text-slate-300">
                                                Calle / Avenida
                                            </Label>
                                            <Input
                                                id="calle_avenida"
                                                value={data.calle_avenida}
                                                onChange={(e) => setData('calle_avenida', e.target.value)}
                                                placeholder="Ej. Av. Principal"
                                                className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="edificio_casa_quinta" className="text-xs font-semibold uppercase text-slate-300">
                                                Casa / Edificio / Quinta
                                            </Label>
                                            <Input
                                                id="edificio_casa_quinta"
                                                value={data.edificio_casa_quinta}
                                                onChange={(e) => setData('edificio_casa_quinta', e.target.value)}
                                                placeholder="Ej. Casa N° 12-A"
                                                className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="piso" className="text-xs font-semibold uppercase text-slate-300">
                                                Piso / Apto
                                            </Label>
                                            <Input
                                                id="piso"
                                                value={data.piso}
                                                onChange={(e) => setData('piso', e.target.value)}
                                                placeholder="Ej. Piso 2 / Apto 4"
                                                className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* PASO 2: DATOS ACADÉMICOS Y TEOLÓGICOS */}
                    {activeTab === 2 && (
                        <Card className="bg-slate-900 border-slate-800 shadow-xl text-slate-100">
                            <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                                <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
                                    <GraduationCap className="h-5 w-5" />
                                    <span>Paso 2: Formación Académica & Estudios Teológicos</span>
                                </div>
                                <CardDescription className="text-slate-400 text-xs">
                                    Nivel de instrucción académica secular y preparación teológica o bíblica.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="grado_instruccion" className="text-xs font-semibold uppercase text-slate-300">
                                            Grado de Instrucción Académica
                                        </Label>
                                        <select
                                            id="grado_instruccion"
                                            value={data.grado_instruccion}
                                            onChange={(e) => setData('grado_instruccion', e.target.value)}
                                            className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-sm text-white focus:outline-hidden focus:border-blue-500"
                                        >
                                            <option value="Primaria">Primaria</option>
                                            <option value="Secundaria / Bachillerato">Secundaria / Bachillerato</option>
                                            <option value="Técnico Medio / Superior">Técnico Medio / Superior</option>
                                            <option value="Universitario">Universitario</option>
                                            <option value="Postgrado / Maestría">Postgrado / Maestría</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="titulo_obtenido" className="text-xs font-semibold uppercase text-slate-300">
                                            Título Secular Obtenido
                                        </Label>
                                        <Input
                                            id="titulo_obtenido"
                                            value={data.titulo_obtenido}
                                            onChange={(e) => setData('titulo_obtenido', e.target.value)}
                                            placeholder="Ej. Lic. en Educación, Ing. Civil, Bachiller"
                                            className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-slate-800 pt-5 space-y-4">
                                    <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <div>
                                            <p className="font-semibold text-sm text-white">¿Posee Estudios Teológicos?</p>
                                            <p className="text-xs text-slate-400">
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
                                                <Label htmlFor="titulo_teologico" className="text-xs font-semibold uppercase text-slate-300">
                                                    Título Teológico
                                                </Label>
                                                <Input
                                                    id="titulo_teologico"
                                                    value={data.titulo_teologico}
                                                    onChange={(e) => setData('titulo_teologico', e.target.value)}
                                                    placeholder="Ej. Bachiller en Teología"
                                                    className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="instituto_teologico" className="text-xs font-semibold uppercase text-slate-300">
                                                    Instituto / Seminario
                                                </Label>
                                                <Input
                                                    id="instituto_teologico"
                                                    value={data.instituto_teologico}
                                                    onChange={(e) => setData('instituto_teologico', e.target.value)}
                                                    placeholder="Ej. Instituto Bíblico Elim"
                                                    className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="tiempo_de_estudio_teologico" className="text-xs font-semibold uppercase text-slate-300">
                                                    Tiempo de Estudio
                                                </Label>
                                                <Input
                                                    id="tiempo_de_estudio_teologico"
                                                    value={data.tiempo_de_estudio_teologico}
                                                    onChange={(e) => setData('tiempo_de_estudio_teologico', e.target.value)}
                                                    placeholder="Ej. 3 Años"
                                                    className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* PASO 3: DATOS ECLESIÁSTICOS */}
                    {activeTab === 3 && (
                        <Card className="bg-slate-900 border-slate-800 shadow-xl text-slate-100">
                            <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                                <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
                                    <Cross className="h-5 w-5" />
                                    <span>Paso 3: Trayectoria y Datos Eclesiásticos</span>
                                </div>
                                <CardDescription className="text-slate-400 text-xs">
                                    Grado ministerial, zona eclesiástica, distrito y responsabilidades dentro de la obra.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="nivel_ministerial" className="text-xs font-semibold uppercase text-slate-300">
                                            Grado Ministerial <span className="text-rose-500">*</span>
                                        </Label>
                                        <select
                                            id="nivel_ministerial"
                                            value={data.nivel_ministerial}
                                            onChange={(e) => setData('nivel_ministerial', e.target.value)}
                                            className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-sm text-white focus:outline-hidden focus:border-blue-500"
                                        >
                                            {gradosMinisteriales.map((gm) => (
                                                <option key={gm} value={gm}>{gm}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="zona" className="text-xs font-semibold uppercase text-slate-300">
                                            Zona Eclesiástica
                                        </Label>
                                        <Input
                                            id="zona"
                                            value={data.zona}
                                            onChange={(e) => setData('zona', e.target.value)}
                                            placeholder="Ej. Zona 1"
                                            className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="distrito" className="text-xs font-semibold uppercase text-slate-300">
                                            Distrito
                                        </Label>
                                        <Input
                                            id="distrito"
                                            value={data.distrito}
                                            onChange={(e) => setData('distrito', e.target.value)}
                                            placeholder="Ej. Distrito Capital"
                                            className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="ano_promocion" className="text-xs font-semibold uppercase text-slate-300">
                                            Año de Promoción / Ordenación
                                        </Label>
                                        <Input
                                            id="ano_promocion"
                                            value={data.ano_promocion}
                                            onChange={(e) => setData('ano_promocion', e.target.value)}
                                            placeholder="Ej. 2018"
                                            className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="tiempo_colaborando" className="text-xs font-semibold uppercase text-slate-300">
                                            Tiempo en el Ministerio
                                        </Label>
                                        <Input
                                            id="tiempo_colaborando"
                                            value={data.tiempo_colaborando}
                                            onChange={(e) => setData('tiempo_colaborando', e.target.value)}
                                            placeholder="Ej. 12 Años y 4 Meses"
                                            className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="cargo_nacional" className="text-xs font-semibold uppercase text-slate-300">
                                            Cargo Nacional / Responsabilidad
                                        </Label>
                                        <Input
                                            id="cargo_nacional"
                                            value={data.cargo_nacional}
                                            onChange={(e) => setData('cargo_nacional', e.target.value)}
                                            placeholder="Ej. Supervisor de Zona / Presbítero"
                                            className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <div>
                                            <p className="font-semibold text-sm text-white">Bautizado en el Espíritu Santo</p>
                                            <p className="text-xs text-slate-400">Con la evidencia bíblica de hablar en otras lenguas</p>
                                        </div>
                                        <Switch
                                            checked={data.batizado_espiritu_santo}
                                            onCheckedChange={(c) => setData('batizado_espiritu_santo', c)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <div>
                                            <p className="font-semibold text-sm text-white">Pertenece al Ministerio Oficial MMM</p>
                                            <p className="text-xs text-slate-400">Obrero activo en la nómina nacional</p>
                                        </div>
                                        <Switch
                                            checked={data.pertenece_ministerio}
                                            onCheckedChange={(c) => setData('pertenece_ministerio', c)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="nota" className="text-xs font-semibold uppercase text-slate-300">
                                        Observaciones o Notas Ministeriales
                                    </Label>
                                    <Textarea
                                        id="nota"
                                        rows={2}
                                        value={data.nota}
                                        onChange={(e) => setData('nota', e.target.value)}
                                        placeholder="Información adicional sobre su labor ministerial..."
                                        className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* PASO 4: ESTADO DE SALUD */}
                    {activeTab === 4 && (
                        <Card className="bg-slate-900 border-slate-800 shadow-xl text-slate-100">
                            <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                                <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
                                    <Stethoscope className="h-5 w-5" />
                                    <span>Paso 4: Ficha de Salud & Contacto de Emergencia</span>
                                </div>
                                <CardDescription className="text-slate-400 text-xs">
                                    Datos médicos vitales para atención preventiva y asistencia en eventos nacionales.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="grupo_sanguineo" className="text-xs font-semibold uppercase text-slate-300">
                                            Grupo Sanguíneo
                                        </Label>
                                        <select
                                            id="grupo_sanguineo"
                                            value={data.grupo_sanguineo}
                                            onChange={(e) => setData('grupo_sanguineo', e.target.value)}
                                            className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-sm text-white focus:outline-hidden focus:border-blue-500 font-mono"
                                        >
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="condicion_salud" className="text-xs font-semibold uppercase text-slate-300">
                                            Condición General de Salud
                                        </Label>
                                        <select
                                            id="condicion_salud"
                                            value={data.condicion_salud}
                                            onChange={(e) => setData('condicion_salud', e.target.value)}
                                            className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-sm text-white focus:outline-hidden focus:border-blue-500"
                                        >
                                            <option value="Excelente">Excelente</option>
                                            <option value="Buena">Buena</option>
                                            <option value="Regular">Regular</option>
                                            <option value="Delicada">Delicada</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="alergias" className="text-xs font-semibold uppercase text-slate-300">
                                            Alergias Conocidas
                                        </Label>
                                        <Input
                                            id="alergias"
                                            value={data.alergias}
                                            onChange={(e) => setData('alergias', e.target.value)}
                                            placeholder="Ej. Penicilina, polen, ninguna"
                                            className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-sm text-white">¿Padece alguna Enfermedad?</p>
                                                <p className="text-xs text-slate-400">Hipertensión, diabetes, afección cardíaca, etc.</p>
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
                                                className="bg-slate-800 border-slate-700 text-white focus:border-blue-500"
                                            />
                                        )}
                                    </div>

                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-sm text-white">¿Toma Medicamentos Diarios?</p>
                                                <p className="text-xs text-slate-400">Tratamiento prescrito permanente</p>
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
                                                        className="bg-slate-800 border-slate-700 text-xs text-white"
                                                    />
                                                    <Input
                                                        value={nuevoMedicamentoDosis}
                                                        onChange={(e) => setNuevoMedicamentoDosis(e.target.value)}
                                                        placeholder="Dosis (Ej. 50mg)"
                                                        className="bg-slate-800 border-slate-700 text-xs text-white w-28"
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={handleAgregarMedicamento}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                {medicamentosList.length > 0 && (
                                                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                                        {medicamentosList.map((m: any, idx: number) => (
                                                            <div key={idx} className="flex items-center justify-between bg-slate-900 p-2 rounded-md text-xs border border-slate-700">
                                                                <span className="text-slate-200">
                                                                    <b>{m.nombre}</b> {m.dosis ? `(${m.dosis})` : ''}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEliminarMedicamento(idx)}
                                                                    className="text-rose-400 hover:text-rose-300"
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

                                <div className="border-t border-slate-800 pt-4">
                                    <h4 className="text-xs uppercase font-bold text-amber-400 tracking-wider mb-3 flex items-center gap-1.5">
                                        <PhoneCall className="w-4 h-4" />
                                        Contacto para Emergencias
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="contacto_emergencia_nombre" className="text-xs font-semibold uppercase text-slate-300">
                                                Nombre del Contacto
                                            </Label>
                                            <Input
                                                id="contacto_emergencia_nombre"
                                                value={data.contacto_emergencia_nombre}
                                                onChange={(e) => setData('contacto_emergencia_nombre', e.target.value)}
                                                placeholder="Ej. María Pérez (Esposa / Familiar)"
                                                className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="contacto_emergencia_telefono" className="text-xs font-semibold uppercase text-slate-300">
                                                Teléfono de Emergencia
                                            </Label>
                                            <Input
                                                id="contacto_emergencia_telefono"
                                                value={data.contacto_emergencia_telefono}
                                                onChange={(e) => setData('contacto_emergencia_telefono', e.target.value)}
                                                placeholder="Ej. 0412-9876543"
                                                className="mt-1 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* PASO 5: FOTOGRAFÍA DEL PASTOR Y CÉDULA */}
                    {activeTab === 5 && (
                        <Card className="bg-slate-900 border-slate-800 shadow-xl text-slate-100">
                            <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                                <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
                                    <Camera className="h-5 w-5" />
                                    <span>Paso 5: Fotografía Tipo Carnet y Foto de la Cédula</span>
                                </div>
                                <CardDescription className="text-slate-400 text-xs">
                                    Tome o suba una foto nítida de perfil (tipo carnet) con vestimenta adecuada y la foto de su cédula.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-6">
                                {/* Modal de Cámara en Vivo si está activa */}
                                {isCameraActive && (
                                    <div className="bg-slate-950 border border-slate-700 p-4 rounded-2xl space-y-3 flex flex-col items-center">
                                        <div className="relative rounded-xl overflow-hidden bg-black max-w-md w-full aspect-video border border-slate-700">
                                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                onClick={capturePhoto}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
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
                                                className="border-slate-700 text-slate-300"
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
                                    <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60 flex flex-col items-center text-center space-y-4">
                                        <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                                            <User className="w-4 h-4 text-blue-400" />
                                            Foto de Perfil (Tipo Carnet)
                                        </h4>

                                        <div className="w-36 h-44 rounded-xl border-2 border-dashed border-slate-600 bg-slate-900 overflow-hidden flex items-center justify-center relative shadow-inner">
                                            {data.foto ? (
                                                <img src={data.foto} alt="Foto Perfil" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-slate-500 text-xs flex flex-col items-center p-2">
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
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1"
                                            >
                                                <Video className="w-3.5 h-3.5" />
                                                Usar Cámara
                                            </Button>
                                            <Label
                                                htmlFor="upload-foto"
                                                className="cursor-pointer inline-flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-2 px-3 rounded-md shadow-sm"
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
                                                    className="text-rose-400 hover:text-rose-300 text-xs"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Fotografía de la Cédula */}
                                    <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60 flex flex-col items-center text-center space-y-4">
                                        <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                                            <IdCard className="w-4 h-4 text-emerald-400" />
                                            Foto de la Cédula de Identidad
                                        </h4>

                                        <div className="w-56 h-36 rounded-xl border-2 border-dashed border-slate-600 bg-slate-900 overflow-hidden flex items-center justify-center relative shadow-inner">
                                            {data.foto_cedula ? (
                                                <img src={data.foto_cedula} alt="Cédula" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-slate-500 text-xs flex flex-col items-center p-2">
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
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                                            >
                                                <Video className="w-3.5 h-3.5" />
                                                Usar Cámara
                                            </Button>
                                            <Label
                                                htmlFor="upload-cedula"
                                                className="cursor-pointer inline-flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-2 px-3 rounded-md shadow-sm"
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
                                                    className="text-rose-400 hover:text-rose-300 text-xs"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 sm:p-6 bg-slate-900/80 border-t border-slate-800 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-8 rounded-xl shadow-xl text-sm"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {processing ? 'Guardando Registro...' : 'Completar y Enviar Registro'}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </form>
            </main>

            {/* Footer Institucional */}
            <footer className="bg-slate-900 border-t border-slate-800 text-center py-4 text-xs text-slate-500">
                <p>© {new Date().getFullYear()} Movimiento Misionero Mundial en Venezuela. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
