import React, { useState, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import { useTranslate } from '@/hooks/use-translate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Select2 from '@/components/ui/select2';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    User, 
    GraduationCap, 
    Cross, 
    ArrowLeft, 
    ArrowRight, 
    Save, 
    Check, 
    Building2, 
    Phone, 
    Heart, 
    Award, 
    MapPin,
    FileText,
    Camera,
    Upload,
    Trash2,
    Video,
    RefreshCw,
    Stethoscope,
    Activity,
    Pill,
    AlertCircle,
    PhoneCall,
    Plus,
    ShoppingBag,
    SwitchCamera,
    HelpCircle,
    Lightbulb,
    UserCheck
} from 'lucide-react';
import pastoresRoutes from '@/routes/admin/pastores';

interface PastorFormWizardProps {
    pastor?: any;
    pastoresDisponibles: Array<{ id: number; nombres: string; apellidos: string; codigo: string; documento: string; genero?: string }>;
    estados: Array<{ id: number; nombre: string; codigo: string }>;
    municipios: Array<{ id: number; estado_id: number; nombre: string; codigo: string }>;
    parroquias: Array<{ id: number; municipio_id: number; nombre: string; codigo: string }>;
    isEditing?: boolean;
}

export default function PastorFormWizard({
    pastor,
    pastoresDisponibles = [],
    estados = [],
    municipios = [],
    parroquias = [],
    isEditing = false,
}: PastorFormWizardProps) {
    const { __ } = useTranslate();
    const [activeTab, setActiveTab] = useState<number>(1);

    const { data, setData, post, put, processing, errors } = useForm({
        codigo: pastor?.codigo || `PAS-${Math.floor(100 + Math.random() * 900)}`,
        nombres: pastor?.nombres || '',
        apellidos: pastor?.apellidos || '',
        documento: pastor?.documento || '',
        genero: pastor?.genero || 'M',
        edad: pastor?.edad || '',
        fe_nacimiento: pastor?.fe_nacimiento ? pastor.fe_nacimiento.split('T')[0] : '',
        foto: pastor?.foto || '',
        estado_civil: pastor?.estado_civil || 'Casado',
        nombre_conyuge: pastor?.nombre_conyuge || '',
        conyuge_id: pastor?.conyuge_id ? String(pastor.conyuge_id) : '',

        // Eclesiásticos
        nivel_ministerial: pastor?.nivel_ministerial || 'Colaborador',
        zona: pastor?.zona || '',
        distrito: pastor?.distrito || '',
        ano_promocion: pastor?.ano_promocion || '',
        tiempo_colaborando: pastor?.tiempo_colaborando || '',
        batizado_espiritu_santo: pastor ? Boolean(pastor.batizado_espiritu_santo) : true,
        pertenece_ministerio: pastor ? Boolean(pastor.pertenece_ministerio) : true,
        cargo_nacional: pastor?.cargo_nacional || '',
        mencion: pastor?.mencion || '',
        nota: pastor?.nota || '',

        // Académicos
        grado_instruccion: pastor?.grado_instruccion || 'Universitario',
        titulo_obtenido: pastor?.titulo_obtenido || '',
        estudio_teologico: pastor ? Boolean(pastor.estudio_teologico) : false,
        titulo_teologico: pastor?.titulo_teologico || '',
        tiempo_de_estudio_teologico: pastor?.tiempo_de_estudio_teologico || '',
        instituto_teologico: pastor?.instituto_teologico || '',

        // Ubicación y Contacto
        edificio_casa_quinta: pastor?.edificio_casa_quinta || '',
        piso: pastor?.piso || '',
        apartamento: pastor?.apartamento || '',
        calle_avenida: pastor?.calle_avenida || '',
        urbanizacion: pastor?.urbanizacion || '',
        estado_id: pastor?.estado_id ? String(pastor.estado_id) : '',
        municipio_id: pastor?.municipio_id ? String(pastor.municipio_id) : '',
        parroquia_id: pastor?.parroquia_id ? String(pastor.parroquia_id) : '',
        municipio: pastor?.municipio || '',
        telefono_hab: pastor?.telefono_hab || '',
        telefono_tlf: pastor?.telefono_tlf || '',
        telefono_otro: pastor?.telefono_otro || '',
        status: pastor ? Boolean(pastor.status) : true,

        // Salud y Emergencia
        grupo_sanguineo: pastor?.grupo_sanguineo || 'O+',
        condicion_salud: pastor?.condicion_salud || 'Buena',
        padece_enfermedad: pastor ? Boolean(pastor.padece_enfermedad) : false,
        enfermedades_cronicas: pastor?.enfermedades_cronicas || '',
        toma_medicamentos: pastor ? Boolean(pastor.toma_medicamentos) : false,
        medicamentos_recetados: pastor?.medicamentos_recetados || '',
        alergias: pastor?.alergias || '',
        contacto_emergencia_nombre: pastor?.contacto_emergencia_nombre || '',
        contacto_emergencia_telefono: pastor?.contacto_emergencia_telefono || '',
        observaciones_salud: pastor?.observaciones_salud || '',
    });

    const [conyugePerteneceMinisterio, setConyugePerteneceMinisterio] = useState<boolean>(
        pastor?.conyuge_id ? true : false
    );

    // Opciones para Select2 de cónyuge filtradas por género opuesto
    const pastoresOptions = useMemo(() => {
        let filtrados = pastoresDisponibles;

        if (data.genero === 'M') {
            filtrados = pastoresDisponibles.filter((p) => p.genero === 'F');
        } else if (data.genero === 'F') {
            filtrados = pastoresDisponibles.filter((p) => p.genero === 'M');
        }

        return [
            { value: '', label: __('-- Seleccione Pastor(a) Cónyuge --') },
            ...filtrados.map((p) => ({
                value: String(p.id),
                label: `${p.nombres} ${p.apellidos} (${p.documento})`,
            })),
        ];
    }, [pastoresDisponibles, data.genero, __]);

    const estadosOptions = useMemo(() => {
        return [
            { value: '', label: __('Seleccione Estado') },
            ...estados.map((e) => ({
                value: String(e.id),
                label: e.nombre,
            })),
        ];
    }, [estados, __]);

    const municipiosFiltrados = useMemo(() => {
        if (!data.estado_id) return [];
        return municipios.filter((m) => String(m.estado_id) === String(data.estado_id));
    }, [municipios, data.estado_id]);

    const municipiosOptions = useMemo(() => {
        return [
            { value: '', label: __('Seleccione Municipio') },
            ...municipiosFiltrados.map((m) => ({
                value: String(m.id),
                label: m.nombre,
            })),
        ];
    }, [municipiosFiltrados, __]);

    const parroquiasFiltradas = useMemo(() => {
        if (!data.municipio_id) return [];
        return parroquias.filter((p) => String(p.municipio_id) === String(data.municipio_id));
    }, [parroquias, data.municipio_id]);

    const parroquiasOptions = useMemo(() => {
        return [
            { value: '', label: __('Seleccione Parroquia') },
            ...parroquiasFiltradas.map((p) => ({
                value: String(p.id),
                label: p.nombre,
            })),
        ];
    }, [parroquiasFiltradas, __]);

    // Función para calcular la edad automáticamente basada en la fecha de nacimiento
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

    // Manejo de cambio de estado territorial
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
        if (!nuevoMedicamentoNombre.trim()) {
            alert(__('Por favor ingrese el nombre del medicamento.'));
            return;
        }
        const updated = [
            ...medicamentosList,
            { nombre: nuevoMedicamentoNombre.trim(), dosis: nuevoMedicamentoDosis.trim() },
        ];
        setData('medicamentos_recetados', updated);
        setNuevoMedicamentoNombre('');
        setNuevoMedicamentoDosis('');
    };

    const handleEliminarMedicamento = (index: number) => {
        const updated = medicamentosList.filter((_, i) => i !== index);
        setData('medicamentos_recetados', updated);
    };

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    const resizeAndCompressImage = (imageSrc: string, targetW = 350, targetH = 420, quality = 0.85): Promise<string> => {
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

                    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressedDataUrl);
                } else {
                    resolve(imageSrc);
                }
            };
            img.onerror = () => resolve(imageSrc);
        });
    };

    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

    const startCamera = async (overrideFacingMode?: 'user' | 'environment') => {
        const mode = overrideFacingMode || facingMode;
        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
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
            alert(__('No se pudo acceder a la cámara web. Verifique los permisos de su navegador.'));
        }
    };

    const toggleCameraFacingMode = () => {
        const nextMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(nextMode);
        startCamera(nextMode);
    };

    const stopCamera = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
            setMediaStream(null);
        }
        setIsCameraActive(false);
    };

    const capturePhoto = async () => {
        if (videoRef.current) {
            const video = videoRef.current;
            const vw = video.videoWidth || 640;
            const vh = video.videoHeight || 480;

            const targetW = 350;
            const targetH = 420;

            const videoRatio = vw / vh;
            const targetRatio = targetW / targetH;

            let sourceW = vw;
            let sourceH = vh;
            let sourceX = 0;
            let sourceY = 0;

            if (videoRatio > targetRatio) {
                // El video es más ancho que la tarjeta vertical carnet: recortar laterales sobrantes
                sourceW = vh * targetRatio;
                sourceX = (vw - sourceW) / 2;
            } else {
                // El video es más alto: recortar arriba/abajo sobrante
                sourceH = vw / targetRatio;
                sourceY = (vh - sourceH) / 2;
            }

            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, targetW, targetH);
                ctx.drawImage(video, sourceX, sourceY, sourceW, sourceH, 0, 0, targetW, targetH);

                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                setData('foto', compressedDataUrl);
                stopCamera();
            }
        }
    };

    const processFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert(__('Por favor seleccione un archivo de imagen válido (JPEG, PNG, WEBP).'));
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            if (e.target?.result) {
                const rawBase64 = e.target.result as string;
                // Redimensionar a formato carnet (350x420 px) y comprimir a JPG (~50KB-90KB)
                const compressed = await resizeAndCompressImage(rawBase64, 350, 420, 0.8);
                setData('foto', compressed);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const photoPreviewUrl = useMemo(() => {
        if (!data.foto) return null;
        if (data.foto.startsWith('data:') || data.foto.startsWith('http') || data.foto.startsWith('/')) {
            return data.foto;
        }
        return `/pastores/${data.foto}`;
    }, [data.foto]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && pastor) {
            put(pastoresRoutes.update(pastor.id));
        } else {
            post(pastoresRoutes.store());
        }
    };

    const steps = [
        { id: 1, title: __('Datos Personales'), icon: User, desc: __('Información básica y contacto') },
        { id: 2, title: __('Datos Académicos'), icon: GraduationCap, desc: __('Estudios y formación teológica') },
        { id: 3, title: __('Datos Eclesiásticos'), icon: Cross, desc: __('Grado ministerial y cargos') },
        { id: 4, title: __('Estado de Salud'), icon: Stethoscope, desc: __('Antecedentes médicos y emergencias') },
        { id: 5, title: __('Fotografía Pastor'), icon: Camera, desc: __('Subir o tomar foto del obrero') },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header del Formulario */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card border rounded-xl p-4 sm:p-5 shadow-xs">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                        {isEditing ? `${__('Editar Pastor')}: ${pastor.nombres} ${pastor.apellidos}` : __('Nuevo Registro de Pastor')}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {__('Complete la información requerida en cada uno de los módulos del formulario wizard.')}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {isEditing && pastor && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.open(`/admin/pastores/${pastor.id}/planilla`, '_blank')}
                            className="gap-2 text-emerald-600 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs sm:text-sm flex-1 md:flex-initial"
                        >
                            <FileText className="h-4 w-4" />
                            {__('Planilla PDF')}
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.get(pastoresRoutes.index())}
                        className="gap-2 text-xs sm:text-sm flex-1 md:flex-initial"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {__('Cancelar')}
                    </Button>
                    <Button type="submit" disabled={processing} className="gap-2 shadow text-xs sm:text-sm w-full sm:w-auto">
                        <Save className="h-4 w-4" />
                        {isEditing ? __('Actualizar Pastor') : __('Guardar Pastor')}
                    </Button>
                </div>
            </div>

            {/* Stepper Tabs - Responsive para Móvil, Tablet y Escritorio */}
            <div className="space-y-3">
                {/* Barra de progreso visual únicamente para pantallas móviles */}
                <div className="block sm:hidden space-y-1.5 bg-card p-3 border rounded-xl shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-primary flex items-center gap-1.5 truncate">
                            {__('Paso')} {activeTab} {__('de')} 5: {steps[activeTab - 1].title}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                            {Math.round((activeTab / 5) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-primary h-full transition-all duration-300 rounded-full"
                            style={{ width: `${(activeTab / 5) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Grid adaptable / Tira deslizable horizontal en pantallas pequeñas */}
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
                                className={`flex items-center gap-2.5 p-3 sm:p-4 rounded-xl border transition-all text-left min-w-[170px] sm:min-w-0 shrink-0 sm:shrink ${
                                    isActive
                                        ? 'bg-primary/5 border-primary ring-2 ring-primary/20 shadow-xs'
                                        : isCompleted
                                        ? 'bg-card border-emerald-500/30 hover:border-emerald-500/50'
                                        : 'bg-card border-border hover:bg-accent/50'
                                }`}
                            >
                                <div
                                    className={`flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-lg shrink-0 font-semibold text-xs sm:text-sm transition-colors ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : isCompleted
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {isCompleted ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <Icon className="h-4 w-4 sm:h-5 sm:w-5" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            {__('Paso')} {step.id}
                                        </span>
                                        {isActive && (
                                            <Badge variant="secondary" className="text-[9px] py-0 px-1 font-normal hidden xs:inline-flex">
                                                {__('Actual')}
                                            </Badge>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-xs sm:text-sm truncate text-foreground leading-snug">
                                        {step.title}
                                    </h3>
                                    <p className="text-[11px] text-muted-foreground truncate hidden sm:block">
                                        {step.desc}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* PASO 1: DATOS PERSONALES */}
            {activeTab === 1 && (
                <Card className="border shadow-sm">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex items-center gap-2 text-primary font-semibold text-base">
                            <User className="h-5 w-5" />
                            <span>{__('Paso 1: Información Personal, Contacto y Dirección')}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Fila 1: Código, Nombres, Apellidos, Documento */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="codigo" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Código (8 Dígitos)')} <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="codigo"
                                    value={data.codigo}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                                        setData('codigo', val);
                                    }}
                                    placeholder="25212001"
                                    maxLength={8}
                                    className="mt-1 font-mono tracking-wider"
                                />
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {__('5 dígitos de cédula + 001')}
                                </p>
                                {errors.codigo && <p className="text-xs text-destructive mt-1">{errors.codigo}</p>}
                            </div>

                            <div>
                                <Label htmlFor="nombres" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Nombres')} <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nombres"
                                    value={data.nombres}
                                    onChange={(e) => setData('nombres', e.target.value)}
                                    placeholder="Juan Carlos"
                                    className="mt-1"
                                />
                                {errors.nombres && <p className="text-xs text-destructive mt-1">{errors.nombres}</p>}
                            </div>

                            <div>
                                <Label htmlFor="apellidos" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Apellidos')} <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="apellidos"
                                    value={data.apellidos}
                                    onChange={(e) => setData('apellidos', e.target.value)}
                                    placeholder="Pérez Gómez"
                                    className="mt-1"
                                />
                                {errors.apellidos && <p className="text-xs text-destructive mt-1">{errors.apellidos}</p>}
                            </div>

                            <div>
                                <Label htmlFor="documento" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Documento / Cédula')} <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="documento"
                                    value={data.documento}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setData((prev) => {
                                            let autoCode = prev.codigo;
                                            if (!isEditing) {
                                                const numDoc = val.replace(/\D/g, '');
                                                if (numDoc) {
                                                    const numZ = prev.zona.replace(/\D/g, '') || '1';
                                                    const numD = prev.distrito.replace(/\D/g, '') || '1';
                                                    autoCode = `${numDoc}${numZ}${numD}0001`;
                                                }
                                            }
                                            return {
                                                ...prev,
                                                documento: val,
                                                codigo: autoCode,
                                            };
                                        });
                                    }}
                                    placeholder="V-25212293"
                                    className="mt-1"
                                />
                                {errors.documento && <p className="text-xs text-destructive mt-1">{errors.documento}</p>}
                            </div>
                        </div>

                        {/* Fila 2: Género, Fecha Nacimiento, Edad, Estado Civil */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="genero" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Género')}
                                </Label>
                                <Select2
                                    options={[
                                        { value: 'M', label: __('Masculino') },
                                        { value: 'F', label: __('Femenino') },
                                    ]}
                                    value={data.genero}
                                    onChange={(val) => setData('genero', val)}
                                    placeholder={__('Seleccione Género')}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="fe_nacimiento" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Fecha de Nacimiento')}
                                </Label>
                                <Input
                                    id="fe_nacimiento"
                                    type="date"
                                    value={data.fe_nacimiento}
                                    onChange={handleBirthDateChange}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="edad" className="text-xs font-semibold uppercase tracking-wider">
                                        {__('Edad (Años)')}
                                    </Label>
                                    <span className="text-[10px] text-muted-foreground italic">{__('Auto-calculada')}</span>
                                </div>
                                <Input
                                    id="edad"
                                    type="number"
                                    value={data.edad}
                                    onChange={(e) => setData('edad', e.target.value)}
                                    placeholder="45"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="estado_civil" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Estado Civil')}
                                </Label>
                                <Select2
                                    options={[
                                        { value: 'Soltero', label: __('Soltero(a)') },
                                        { value: 'Casado', label: __('Casado(a)') },
                                        { value: 'Viudo', label: __('Viudo(a)') },
                                        { value: 'Divorciado', label: __('Divorciado(a)') },
                                    ]}
                                    value={data.estado_civil}
                                    onChange={(val) => setData('estado_civil', val)}
                                    placeholder={__('Seleccione Estado Civil')}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Sección Cónyuge */}
                        <div className="p-4 bg-muted/40 rounded-xl border space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Heart className="h-4 w-4 text-rose-500 shrink-0" />
                                    <span>{__('Información del Cónyuge y Vinculación Pastoral')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="conyuge_pertenece_ministerio" className="text-xs font-semibold cursor-pointer text-foreground">
                                        {__('¿El cónyuge pertenece al ministerio?')}
                                    </Label>
                                    <Switch
                                        id="conyuge_pertenece_ministerio"
                                        checked={conyugePerteneceMinisterio}
                                        onCheckedChange={(checked) => {
                                            setConyugePerteneceMinisterio(checked);
                                            if (!checked) {
                                                setData('conyuge_id', '');
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="nombre_conyuge" className="text-xs font-semibold uppercase tracking-wider">
                                        {__('Nombre del Cónyuge')}
                                    </Label>
                                    <Input
                                        id="nombre_conyuge"
                                        value={data.nombre_conyuge}
                                        onChange={(e) => setData('nombre_conyuge', e.target.value)}
                                        placeholder={__('Nombre completo del cónyuge')}
                                        className="mt-1"
                                    />
                                </div>

                                {conyugePerteneceMinisterio && (
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="conyuge_id" className="text-xs font-semibold uppercase tracking-wider">
                                                {__('Vincular Pastor(a) Cónyuge')}
                                            </Label>
                                            {data.genero && (
                                                <span className="text-[10px] text-primary font-medium italic">
                                                    {data.genero === 'M' ? __('(Mostrando pastores mujeres)') : __('(Mostrando pastores hombres)')}
                                                </span>
                                            )}
                                        </div>
                                        <Select2
                                            options={pastoresOptions}
                                            value={data.conyuge_id}
                                            onChange={(val) => {
                                                setData('conyuge_id', val);
                                                if (val) {
                                                    const pFound = pastoresDisponibles.find((p) => String(p.id) === val);
                                                    if (pFound) {
                                                        setData('nombre_conyuge', `${pFound.nombres} ${pFound.apellidos}`);
                                                    }
                                                }
                                            }}
                                            placeholder={__('Buscar pastor(a) cónyuge...')}
                                            className="mt-1"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sección Teléfonos */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="telefono_tlf" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Teléfono Celular')}
                                </Label>
                                <Input
                                    id="telefono_tlf"
                                    value={data.telefono_tlf}
                                    onChange={(e) => setData('telefono_tlf', e.target.value)}
                                    placeholder="0414-1234567"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="telefono_hab" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Teléfono Habitación')}
                                </Label>
                                <Input
                                    id="telefono_hab"
                                    value={data.telefono_hab}
                                    onChange={(e) => setData('telefono_hab', e.target.value)}
                                    placeholder="0212-9876543"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="telefono_otro" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Teléfono Adicional')}
                                </Label>
                                <Input
                                    id="telefono_otro"
                                    value={data.telefono_otro}
                                    onChange={(e) => setData('telefono_otro', e.target.value)}
                                    placeholder="0424-9998877"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Sección Dirección y Ubicación Territorial */}
                        <div className="p-4 bg-muted/40 rounded-xl border space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>{__('Dirección y Ubicación Geográfica')}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-xs font-semibold uppercase tracking-wider">
                                        {__('Estado')}
                                    </Label>
                                    <Select2
                                        options={estadosOptions}
                                        value={data.estado_id}
                                        onChange={handleEstadoChange}
                                        placeholder={__('Seleccione Estado')}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs font-semibold uppercase tracking-wider">
                                        {__('Municipio')}
                                    </Label>
                                    <Select2
                                        options={municipiosOptions}
                                        value={data.municipio_id}
                                        onChange={handleMunicipioChange}
                                        placeholder={__('Seleccione Municipio')}
                                        disabled={!data.estado_id}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs font-semibold uppercase tracking-wider">
                                        {__('Parroquia')}
                                    </Label>
                                    <Select2
                                        options={parroquiasOptions}
                                        value={data.parroquia_id}
                                        onChange={(val) => setData('parroquia_id', val)}
                                        placeholder={__('Seleccione Parroquia')}
                                        disabled={!data.municipio_id}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <Label htmlFor="urbanizacion" className="text-xs font-semibold uppercase tracking-wider">
                                        {__('Urbanización / Sector / Barrio')}
                                    </Label>
                                    <Input
                                        id="urbanizacion"
                                        value={data.urbanizacion}
                                        onChange={(e) => setData('urbanizacion', e.target.value)}
                                        placeholder="Ej. Sabana Grande"
                                        className="mt-1"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="calle_avenida" className="text-xs font-semibold uppercase tracking-wider">
                                        {__('Calle / Avenida')}
                                    </Label>
                                    <Input
                                        id="calle_avenida"
                                        value={data.calle_avenida}
                                        onChange={(e) => setData('calle_avenida', e.target.value)}
                                        placeholder="Ej. Av. Francisco de Miranda"
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="edificio_casa_quinta" className="text-xs font-semibold uppercase tracking-wider">
                                        {__('Edificio / Casa / Quinta')}
                                    </Label>
                                    <Input
                                        id="edificio_casa_quinta"
                                        value={data.edificio_casa_quinta}
                                        onChange={(e) => setData('edificio_casa_quinta', e.target.value)}
                                        placeholder="Ej. Res. El Sol"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="piso" className="text-xs font-semibold uppercase tracking-wider">
                                        {__('Piso')}
                                    </Label>
                                    <Input
                                        id="piso"
                                        value={data.piso}
                                        onChange={(e) => setData('piso', e.target.value)}
                                        placeholder="Ej. 4"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="apartamento" className="text-xs font-semibold uppercase tracking-wider">
                                        {__('Apartamento / Nro.')}
                                    </Label>
                                    <Input
                                        id="apartamento"
                                        value={data.apartamento}
                                        onChange={(e) => setData('apartamento', e.target.value)}
                                        placeholder="Ej. 4-B"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* PASO 2: DATOS ACADÉMICOS */}
            {activeTab === 2 && (
                <Card className="border shadow-sm">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex items-center gap-2 text-primary font-semibold text-base">
                            <GraduationCap className="h-5 w-5" />
                            <span>{__('Paso 2: Nivel Académico y Formación Teológica')}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="grado_instruccion" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Grado de Instrucción')}
                                </Label>
                                <Select2
                                    options={[
                                        { value: 'Primaria', label: __('Primaria') },
                                        { value: 'Bachiller', label: __('Bachiller') },
                                        { value: 'Técnico Medio / TSU', label: __('Técnico Medio / TSU') },
                                        { value: 'Universitario', label: __('Universitario') },
                                        { value: 'Postgrado / Maestría', label: __('Postgrado / Maestría') },
                                        { value: 'Doctorado', label: __('Doctorado') },
                                    ]}
                                    value={data.grado_instruccion}
                                    onChange={(val) => setData('grado_instruccion', val)}
                                    placeholder={__('Seleccione Grado de Instrucción')}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="titulo_obtenido" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Título Secular Obtenido')}
                                </Label>
                                <Input
                                    id="titulo_obtenido"
                                    value={data.titulo_obtenido}
                                    onChange={(e) => setData('titulo_obtenido', e.target.value)}
                                    placeholder="Ej. Licenciado en Educación"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Sección Teológica */}
                        <div className="p-5 bg-muted/40 rounded-xl border space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Award className="h-5 w-5 text-amber-500" />
                                    <span>{__('Formación y Estudios Teológicos')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="estudio_teologico" className="text-xs font-semibold cursor-pointer">
                                        {__('¿Tiene estudios teológicos?')}
                                    </Label>
                                    <Switch
                                        id="estudio_teologico"
                                        checked={data.estudio_teologico}
                                        onCheckedChange={(val) => setData('estudio_teologico', val)}
                                    />
                                </div>
                            </div>

                            {data.estudio_teologico && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                    <div>
                                        <Label htmlFor="titulo_teologico" className="text-xs font-semibold uppercase tracking-wider">
                                            {__('Título Teológico')}
                                        </Label>
                                        <Input
                                            id="titulo_teologico"
                                            value={data.titulo_teologico}
                                            onChange={(e) => setData('titulo_teologico', e.target.value)}
                                            placeholder="Ej. Licenciado en Teología"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="tiempo_de_estudio_teologico" className="text-xs font-semibold uppercase tracking-wider">
                                            {__('Tiempo de Estudio')}
                                        </Label>
                                        <Input
                                            id="tiempo_de_estudio_teologico"
                                            value={data.tiempo_de_estudio_teologico}
                                            onChange={(e) => setData('tiempo_de_estudio_teologico', e.target.value)}
                                            placeholder="Ej. 4 años"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="instituto_teologico" className="text-xs font-semibold uppercase tracking-wider">
                                            {__('Instituto / Seminario Teológico')}
                                        </Label>
                                        <Input
                                            id="instituto_teologico"
                                            value={data.instituto_teologico}
                                            onChange={(e) => setData('instituto_teologico', e.target.value)}
                                            placeholder="Ej. Instituto Bíblico Central"
                                            className="mt-1"
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
                <Card className="border shadow-sm">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex items-center gap-2 text-primary font-semibold text-base">
                            <Cross className="h-5 w-5" />
                            <span>{__('Paso 3: Trayectoria Ministerial y Asignaciones')}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="nivel_ministerial" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Grado Ministerial')} <span className="text-destructive">*</span>
                                </Label>
                                <Select2
                                    options={[
                                        { value: 'Colaborador', label: __('Colaborador') },
                                        { value: 'Laico', label: __('Laico') },
                                        { value: 'Licenciado', label: __('Licenciado') },
                                        { value: 'Ministro Ordenado', label: __('Ministro Ordenado') },
                                    ]}
                                    value={data.nivel_ministerial}
                                    onChange={(val) => setData('nivel_ministerial', val)}
                                    placeholder={__('Seleccione Grado Ministerial')}
                                    className="mt-1"
                                />
                                {errors.nivel_ministerial && <p className="text-xs text-destructive mt-1">{errors.nivel_ministerial}</p>}
                            </div>

                            <div>
                                <Label htmlFor="zona" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Zona Ministerial')}
                                </Label>
                                <Input
                                    id="zona"
                                    value={data.zona}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setData((prev) => {
                                            let autoCode = prev.codigo;
                                            if (!isEditing) {
                                                const numDoc = prev.documento.replace(/\D/g, '');
                                                if (numDoc) {
                                                    const numZ = val.replace(/\D/g, '') || '1';
                                                    const numD = prev.distrito.replace(/\D/g, '') || '1';
                                                    autoCode = `${numDoc}${numZ}${numD}0001`;
                                                }
                                            }
                                            return { ...prev, zona: val, codigo: autoCode };
                                        });
                                    }}
                                    placeholder="Ej. 1"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="distrito" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Distrito')}
                                </Label>
                                <Input
                                    id="distrito"
                                    value={data.distrito}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setData((prev) => {
                                            let autoCode = prev.codigo;
                                            if (!isEditing) {
                                                const numDoc = prev.documento.replace(/\D/g, '');
                                                if (numDoc) {
                                                    const numZ = prev.zona.replace(/\D/g, '') || '1';
                                                    const numD = val.replace(/\D/g, '') || '1';
                                                    autoCode = `${numDoc}${numZ}${numD}0001`;
                                                }
                                            }
                                            return { ...prev, distrito: val, codigo: autoCode };
                                        });
                                    }}
                                    placeholder="Ej. 1"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="ano_promocion" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Año de Promoción')}
                                </Label>
                                <Input
                                    id="ano_promocion"
                                    value={data.ano_promocion}
                                    onChange={(e) => setData('ano_promocion', e.target.value)}
                                    placeholder="2015"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="tiempo_colaborando" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Tiempo Colaborando')}
                                </Label>
                                <Input
                                    id="tiempo_colaborando"
                                    value={data.tiempo_colaborando}
                                    onChange={(e) => setData('tiempo_colaborando', e.target.value)}
                                    placeholder="10 años"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="cargo_nacional" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Cargo Nacional / Responsabilidad')}
                                </Label>
                                <Input
                                    id="cargo_nacional"
                                    value={data.cargo_nacional}
                                    onChange={(e) => setData('cargo_nacional', e.target.value)}
                                    placeholder="Ej. Director de Jóvenes"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Switches Eclesiásticos */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/40 rounded-xl border">
                            <div className="flex items-center justify-between p-2">
                                <Label htmlFor="batizado_espiritu_santo" className="text-xs font-semibold cursor-pointer">
                                    {__('¿Bautizado en el Espíritu Santo?')}
                                </Label>
                                <Switch
                                    id="batizado_espiritu_santo"
                                    checked={data.batizado_espiritu_santo}
                                    onCheckedChange={(val) => setData('batizado_espiritu_santo', val)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-2">
                                <Label htmlFor="pertenece_ministerio" className="text-xs font-semibold cursor-pointer">
                                    {__('¿Pertenece al Ministerio?')}
                                </Label>
                                <Switch
                                    id="pertenece_ministerio"
                                    checked={data.pertenece_ministerio}
                                    onCheckedChange={(val) => setData('pertenece_ministerio', val)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-2">
                                <Label htmlFor="status" className="text-xs font-semibold cursor-pointer">
                                    {__('Estatus Activo')}
                                </Label>
                                <Switch
                                    id="status"
                                    checked={data.status}
                                    onCheckedChange={(val) => setData('status', val)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="mencion" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Mención / Observaciones Eclesiásticas')}
                                </Label>
                                <Textarea
                                    id="mencion"
                                    rows={3}
                                    value={data.mencion}
                                    onChange={(e) => setData('mencion', e.target.value)}
                                    placeholder="Observaciones de nombramiento o trayectoria..."
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="nota" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Notas Adicionales')}
                                </Label>
                                <Textarea
                                    id="nota"
                                    rows={3}
                                    value={data.nota}
                                    onChange={(e) => setData('nota', e.target.value)}
                                    placeholder="Notas de expediente pastor..."
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* PASO 4: ESTADO DE SALUD Y ANTECEDENTES MÉDICOS */}
            {activeTab === 4 && (
                <Card className="border shadow-sm">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex items-center gap-2 text-primary font-semibold text-base">
                            <Stethoscope className="h-5 w-5" />
                            <span>{__('Paso 4: Estado de Salud')}</span>
                        </div>
                        <CardDescription className="text-xs">
                            {__('Registre la información médica del pastor, grupo sanguíneo, alergias y contacto en caso de emergencia.')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="grupo_sanguineo" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Grupo Sanguíneo')}
                                </Label>
                                <Select2
                                    id="grupo_sanguineo"
                                    value={data.grupo_sanguineo}
                                    onChange={(val) => setData('grupo_sanguineo', val)}
                                    options={[
                                        { value: 'O+', label: 'O Positivo (O+)' },
                                        { value: 'O-', label: 'O Negativo (O-)' },
                                        { value: 'A+', label: 'A Positivo (A+)' },
                                        { value: 'A-', label: 'A Negativo (A-)' },
                                        { value: 'B+', label: 'B Positivo (B+)' },
                                        { value: 'B-', label: 'B Negativo (B-)' },
                                        { value: 'AB+', label: 'AB Positivo (AB+)' },
                                        { value: 'AB-', label: 'AB Negativo (AB-)' },
                                    ]}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="condicion_salud" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Condición General de Salud')}
                                </Label>
                                <Select2
                                    id="condicion_salud"
                                    value={data.condicion_salud}
                                    onChange={(val) => setData('condicion_salud', val)}
                                    options={[
                                        { value: 'Excelente', label: __('Excelente') },
                                        { value: 'Buena', label: __('Buena / Estable') },
                                        { value: 'Regular', label: __('Regular') },
                                        { value: 'Delicada', label: __('Delicada / Bajo Tratamiento') },
                                    ]}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="alergias" className="text-xs font-semibold uppercase tracking-wider">
                                    {__('Alergias Conocidas')}
                                </Label>
                                <Input
                                    id="alergias"
                                    value={data.alergias}
                                    onChange={(e) => setData('alergias', e.target.value)}
                                    placeholder="Ej. Penicilina, Polvo, Mariscos..."
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Diagnósticos y Medicamentos de Uso Continuo */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-4 rounded-xl border">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="padece_enfermedad" className="text-xs font-semibold cursor-pointer flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-primary" />
                                        {__('¿Padece alguna enfermedad o condición crónica?')}
                                    </Label>
                                    <Switch
                                        id="padece_enfermedad"
                                        checked={data.padece_enfermedad}
                                        onCheckedChange={(val) => setData('padece_enfermedad', val)}
                                    />
                                </div>

                                {data.padece_enfermedad && (
                                    <Textarea
                                        id="enfermedades_cronicas"
                                        rows={2}
                                        value={data.enfermedades_cronicas}
                                        onChange={(e) => setData('enfermedades_cronicas', e.target.value)}
                                        placeholder="Detalle los diagnósticos (ej. Hipertensión arterial, Diabetes tipo 2...)"
                                        className="mt-1 bg-background"
                                    />
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="toma_medicamentos" className="text-xs font-semibold cursor-pointer flex items-center gap-2">
                                        <Pill className="h-4 w-4 text-primary" />
                                        {__('¿Toma medicamentos de tratamiento continuo?')}
                                    </Label>
                                    <Switch
                                        id="toma_medicamentos"
                                        checked={data.toma_medicamentos}
                                        onCheckedChange={(val) => setData('toma_medicamentos', val)}
                                    />
                                </div>

                                {data.toma_medicamentos && (
                                    <div className="space-y-4 pt-2">
                                        {/* Formulario de Agregar Medicamento (Carrito) */}
                                        <div className="p-3 bg-background rounded-lg border space-y-3 shadow-xs">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                                {__('Añadir Medicamento a la Ficha Médica')}
                                            </span>
                                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                                                <div className="sm:col-span-2">
                                                    <Input
                                                        value={nuevoMedicamentoNombre}
                                                        onChange={(e) => setNuevoMedicamentoNombre(e.target.value)}
                                                        placeholder="Nombre (ej. Losartán, Metformina)..."
                                                        className="h-8 text-xs"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleAgregarMedicamento();
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <Input
                                                        value={nuevoMedicamentoDosis}
                                                        onChange={(e) => setNuevoMedicamentoDosis(e.target.value)}
                                                        placeholder="Dosis/Frecuencia (ej. 50mg c/12h)..."
                                                        className="h-8 text-xs"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleAgregarMedicamento();
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="sm:col-span-1">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={handleAgregarMedicamento}
                                                        className="w-full h-8 text-xs gap-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        {__('Añadir')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Listado de Medicamentos Registrados (Carrito) */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span className="font-semibold text-foreground flex items-center gap-1.5">
                                                    <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                                                    {__('Medicamentos Registrados')}
                                                </span>
                                                <Badge variant="outline" className="text-[10px]">
                                                    {medicamentosList.length} {__('medicamento(s)')}
                                                </Badge>
                                            </div>

                                            {medicamentosList.length > 0 ? (
                                                <div className="divide-y border rounded-lg overflow-hidden bg-background max-h-48 overflow-y-auto">
                                                    {medicamentosList.map((med, index) => (
                                                        <div key={index} className="flex items-center justify-between p-2 hover:bg-accent/30 text-xs">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <div className="p-1 rounded-full bg-primary/10 text-primary shrink-0">
                                                                    <Pill className="h-3.5 w-3.5" />
                                                                </div>
                                                                <div className="truncate">
                                                                    <span className="font-semibold text-foreground">{med.nombre}</span>
                                                                    {med.dosis && (
                                                                        <span className="text-muted-foreground ml-2">
                                                                            — {med.dosis}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleEliminarMedicamento(index)}
                                                                className="h-6 w-6 text-destructive hover:bg-destructive/10 shrink-0"
                                                                title={__('Quitar medicamento')}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-3 border border-dashed rounded-lg text-center text-xs text-muted-foreground bg-background/50">
                                                    {__('No ha añadido medicamentos. Ingrese el nombre y la dosis arriba y haga clic en "Añadir".')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contacto de Emergencia */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b pb-2">
                                <PhoneCall className="h-4 w-4 text-rose-500" />
                                {__('Contacto Familiar / Emergencia Médica')}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="contacto_emergencia_nombre" className="text-xs font-semibold uppercase tracking-wider">
                                        {__('Nombre del Contacto de Emergencia')}
                                    </Label>
                                    <Input
                                        id="contacto_emergencia_nombre"
                                        value={data.contacto_emergencia_nombre}
                                        onChange={(e) => setData('contacto_emergencia_nombre', e.target.value)}
                                        placeholder="Nombre y relación (ej. María Pérez - Esposa / Hijo)"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="contacto_emergencia_telefono" className="text-xs font-semibold uppercase tracking-wider">
                                        {__('Teléfono de Contacto directo')}
                                    </Label>
                                    <Input
                                        id="contacto_emergencia_telefono"
                                        value={data.contacto_emergencia_telefono}
                                        onChange={(e) => setData('contacto_emergencia_telefono', e.target.value)}
                                        placeholder="0414-1234567 / 0212-9876543"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="observaciones_salud" className="text-xs font-semibold uppercase tracking-wider">
                                {__('Observaciones Médicas / Recomendaciones')}
                            </Label>
                            <Textarea
                                id="observaciones_salud"
                                rows={2}
                                value={data.observaciones_salud}
                                onChange={(e) => setData('observaciones_salud', e.target.value)}
                                placeholder="Indicaciones médicas especiales, centro clínico preferido o tipo de seguro..."
                                className="mt-1"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* PASO 5: FOTOGRAFÍA DEL PASTOR (TIPO CARNET COMPACTO) */}
            {activeTab === 5 && (
                <Card className="border shadow-sm max-w-xl mx-auto">
                    <CardHeader className="border-b bg-muted/20 py-3 px-5">
                        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                            <Camera className="h-4 w-4" />
                            <span>{__('Paso 5: Fotografía Tipo Carnet del Pastor')}</span>
                        </div>
                        <CardDescription className="text-xs">
                            {__('Suba una foto o tome una captura con su cámara web. Las fotos se redimensionan y comprimen automáticamente en tamaño (KB).')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 flex flex-col items-center gap-5">
                        {/* Guía de Ayuda y Recomendaciones */}
                        <div className="w-full bg-muted/30 border rounded-lg p-3 space-y-2 text-xs">
                            <div className="flex items-center gap-1.5 text-primary font-semibold text-xs border-b pb-1">
                                <HelpCircle className="h-4 w-4" />
                                <span>{__('Recomendaciones para una buena foto tipo carnet')}</span>
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                                <li className="flex items-start gap-1.5">
                                    <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                                    <span>{__('Buena iluminación frontal sin sombras.')}</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <UserCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{__('Rostro centrado mirando a la cámara.')}</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <Camera className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                                    <span>{__('Fondo liso preferiblemente claro.')}</span>
                                </li>
                            </ul>
                        </div>

                        {/* Acciones principales */}
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {!isCameraActive ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => startCamera()}
                                    className="gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/5"
                                >
                                    <Camera className="h-3.5 w-3.5" />
                                    {__('Tomar Foto con Cámara')}
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={toggleCameraFacingMode}
                                        className="gap-1.5 text-xs border-emerald-500/50 text-emerald-700 hover:bg-emerald-50"
                                        title={__('Cambiar entre cámara frontal y trasera')}
                                    >
                                        <SwitchCamera className="h-3.5 w-3.5 text-emerald-600" />
                                        {facingMode === 'user' ? __('Usar Cámara Trasera') : __('Usar Cámara Frontal')}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={stopCamera}
                                        className="gap-1.5 text-xs"
                                    >
                                        <Video className="h-3.5 w-3.5" />
                                        {__('Detener Cámara')}
                                    </Button>
                                </>
                            )}

                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="gap-1.5 text-xs"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                {__('Buscar Archivo')}
                            </Button>

                            {data.foto && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setData('foto', '')}
                                    className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    {__('Quitar Foto')}
                                </Button>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileInputChange}
                                className="hidden"
                            />
                        </div>

                        {/* Recuadro Tipo Carnet Exacto (175px x 210px) con Guía Visual */}
                        <div className="relative flex flex-col items-center">
                            {isCameraActive ? (
                                <div className="relative w-[175px] h-[210px] rounded-lg overflow-hidden border-2 border-primary bg-black shadow-md flex items-center justify-center">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Mascara Ovalada / Silueta Guía de Alineación de Rostro */}
                                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center pb-6">
                                        <div className="w-[105px] h-[130px] border-2 border-dashed border-emerald-400/90 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.3)] flex items-center justify-center">
                                            <span className="text-[9px] font-bold text-emerald-200 uppercase tracking-widest text-center px-1 drop-shadow">
                                                {__('Rostro')}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={capturePhoto}
                                        className="absolute bottom-2 left-1/2 -translate-x-1/2 gap-1 text-[11px] h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow z-10"
                                    >
                                        <Camera className="h-3 w-3" />
                                        {__('Capturar Foto')}
                                    </Button>
                                </div>
                            ) : photoPreviewUrl ? (
                                <div className="relative group w-[175px] h-[210px]">
                                    <img
                                        src={photoPreviewUrl}
                                        alt="Foto Pastor Carnet"
                                        className="w-full h-full object-cover rounded-lg border-2 border-primary/40 shadow-sm"
                                    />
                                    <Badge variant="secondary" className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] py-0 px-1.5 bg-background/90 backdrop-blur shadow-sm">
                                        {__('Formato Carnet (OK)')}
                                    </Badge>
                                </div>
                            ) : (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-[175px] h-[210px] border-2 border-dashed rounded-lg cursor-pointer transition-all flex flex-col items-center justify-center p-3 text-center ${
                                        isDragOver
                                            ? 'border-primary bg-primary/10 scale-[1.02]'
                                            : 'border-border hover:border-primary/60 hover:bg-accent/40 bg-card'
                                    }`}
                                >
                                    <Upload className="h-7 w-7 text-muted-foreground/60 mb-2" />
                                    <span className="text-xs font-semibold text-foreground leading-tight">
                                        {__('Arrastre la foto aquí')}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground mt-1">
                                        {__('o clic para explorar')}
                                    </span>
                                </div>
                            )}

                            <canvas ref={canvasRef} className="hidden" />
                        </div>

                        <p className="text-[11px] text-muted-foreground text-center max-w-xs italic">
                            {__('Dimensiones estándar tipo carnet (3.5 cm x 4.2 cm). Compresión automática activada.')}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Footer Navegación entre pasos */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab((prev) => Math.max(prev - 1, 1))}
                    disabled={activeTab === 1}
                    className="gap-2 w-full sm:w-auto text-xs sm:text-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {__('Paso Anterior')}
                </Button>

                {activeTab < 5 ? (
                    <Button
                        type="button"
                        onClick={() => setActiveTab((prev) => Math.min(prev + 1, 5))}
                        className="gap-2 w-full sm:w-auto text-xs sm:text-sm"
                    >
                        {__('Siguiente Paso')}
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button type="submit" disabled={processing} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow w-full sm:w-auto text-xs sm:text-sm">
                        <Save className="h-4 w-4" />
                        {isEditing ? __('Guardar Cambios') : __('Finalizar y Registrar Pastor')}
                    </Button>
                )}
            </div>
        </form>
    );
}
