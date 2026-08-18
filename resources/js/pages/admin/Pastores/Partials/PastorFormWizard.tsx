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
    RefreshCw
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

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
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

    const stopCamera = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
            setMediaStream(null);
        }
        setIsCameraActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = 400;
            canvas.height = 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, 400, 480);
                const dataUrl = canvas.toDataURL('image/png');
                setData('foto', dataUrl);
                stopCamera();
            }
        }
    };

    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert(__('Por favor seleccione un archivo de imagen válido (JPEG, PNG, WEBP).'));
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setData('foto', e.target.result as string);
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
        { id: 4, title: __('Fotografía Pastor'), icon: Camera, desc: __('Subir o tomar foto del obrero') },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header del Formulario */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border rounded-xl p-5 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        {isEditing ? `${__('Editar Pastor')}: ${pastor.nombres} ${pastor.apellidos}` : __('Nuevo Registro de Pastor')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {__('Complete la información requerida en cada uno de los módulos del formulario wizard.')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing && pastor && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.open(`/admin/pastores/${pastor.id}/planilla`, '_blank')}
                            className="gap-2 text-emerald-600 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        >
                            <FileText className="h-4 w-4" />
                            {__('Planilla PDF')}
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.get(pastoresRoutes.index())}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {__('Cancelar')}
                    </Button>
                    <Button type="submit" disabled={processing} className="gap-2 shadow">
                        <Save className="h-4 w-4" />
                        {isEditing ? __('Actualizar Pastor') : __('Guardar Pastor')}
                    </Button>
                </div>
            </div>

            {/* Stepper Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {steps.map((step) => {
                    const Icon = step.icon;
                    const isActive = activeTab === step.id;
                    const isCompleted = activeTab > step.id;

                    return (
                        <button
                            key={step.id}
                            type="button"
                            onClick={() => setActiveTab(step.id)}
                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                                isActive
                                    ? 'bg-primary/5 border-primary ring-2 ring-primary/20 shadow-sm'
                                    : isCompleted
                                    ? 'bg-card border-emerald-500/30 hover:border-emerald-500/50'
                                    : 'bg-card border-border hover:bg-accent/50'
                            }`}
                        >
                            <div
                                className={`flex items-center justify-center h-10 w-10 rounded-lg shrink-0 font-semibold text-sm transition-colors ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : isCompleted
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {__('Paso')} {step.id}
                                    </span>
                                    {isActive && <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{__('Actual')}</Badge>}
                                </div>
                                <h3 className="font-semibold text-sm truncate text-foreground">{step.title}</h3>
                                <p className="text-xs text-muted-foreground truncate">{step.desc}</p>
                            </div>
                        </button>
                    );
                })}
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
                                            const numeric = val.replace(/\D/g, '');
                                            let autoCode = prev.codigo;
                                            if (!isEditing && numeric.length >= 5 && (!prev.codigo || prev.codigo.length === 8)) {
                                                const prefix = numeric.slice(0, 5).padStart(5, '0');
                                                autoCode = `${prefix}001`;
                                            }
                                            return {
                                                ...prev,
                                                documento: val,
                                                codigo: autoCode,
                                            };
                                        });
                                    }}
                                    placeholder="V-25212345"
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
                                    onChange={(e) => setData('zona', e.target.value)}
                                    placeholder="Ej. Zona 1 Central"
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
                                    onChange={(e) => setData('distrito', e.target.value)}
                                    placeholder="Ej. Distrito Capital"
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

            {/* PASO 4: FOTOGRAFÍA DEL PASTOR */}
            {activeTab === 4 && (
                <Card className="border shadow-sm">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex items-center gap-2 text-primary font-semibold text-base">
                            <Camera className="h-5 w-5" />
                            <span>{__('Paso 4: Fotografía Oficial del Pastor / Obrero')}</span>
                        </div>
                        <CardDescription className="text-xs">
                            {__('Cargue la foto oficial tipo carnet arrastrándola desde su equipo o tome una foto en directo con su cámara web.')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Columna Izquierda: Captura por Cámara o Drag & Drop */}
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    {!isCameraActive ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={startCamera}
                                            className="gap-2 border-primary/40 text-primary hover:bg-primary/5"
                                        >
                                            <Camera className="h-4 w-4" />
                                            {__('Activar Cámara Web')}
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={stopCamera}
                                            className="gap-2"
                                        >
                                            <Video className="h-4 w-4" />
                                            {__('Detener Cámara')}
                                        </Button>
                                    )}

                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="gap-2"
                                    >
                                        <Upload className="h-4 w-4" />
                                        {__('Buscar Archivo')}
                                    </Button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                    />
                                </div>

                                {/* Área de Cámara Activa */}
                                {isCameraActive ? (
                                    <div className="relative rounded-xl overflow-hidden border-2 border-primary bg-black aspect-[3.5/4.2] max-w-sm flex items-center justify-center shadow-lg">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                        <Button
                                            type="button"
                                            onClick={capturePhoto}
                                            className="absolute bottom-4 left-1/2 -translate-x-1/2 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                                        >
                                            <Camera className="h-4 w-4" />
                                            {__('Capturar Foto')}
                                        </Button>
                                    </div>
                                ) : (
                                    /* Zona Drag & Drop */
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[240px] ${
                                            isDragOver
                                                ? 'border-primary bg-primary/10 scale-[1.01]'
                                                : 'border-border hover:border-primary/50 hover:bg-accent/30'
                                        }`}
                                    >
                                        <div className="p-4 rounded-full bg-primary/10 text-primary mb-3">
                                            <Upload className="h-8 w-8" />
                                        </div>
                                        <h4 className="font-semibold text-sm text-foreground">
                                            {__('Arrastre y suelte su foto aquí')}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                                            {__('Soporta imágenes JPG, PNG o WEBP. Haga clic para explorar en sus archivos.')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Columna Derecha: Vista Previa Tipo Carnet */}
                            <div className="flex flex-col items-center justify-center p-6 bg-muted/20 border rounded-xl space-y-4 min-h-[280px]">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {__('Vista Previa (Tipo Carnet)')}
                                </span>

                                {photoPreviewUrl ? (
                                    <div className="relative group">
                                        <img
                                            src={photoPreviewUrl}
                                            alt="Foto Pastor"
                                            className="w-44 h-56 object-cover rounded-xl border-2 border-primary/40 shadow-md transition-all group-hover:brightness-95"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => setData('foto', '')}
                                            title={__('Eliminar Foto')}
                                            className="absolute -top-2 -right-2 rounded-full h-8 w-8 shadow"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="w-44 h-56 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-card p-4 text-center">
                                        <User className="h-16 w-16 stroke-[1.5] text-muted-foreground/40 mb-2" />
                                        <span className="text-xs font-medium italic">{__('Sin fotografía asignada')}</span>
                                    </div>
                                )}

                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Footer Navegación entre pasos */}
            <div className="flex items-center justify-between pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab((prev) => Math.max(prev - 1, 1))}
                    disabled={activeTab === 1}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {__('Paso Anterior')}
                </Button>

                {activeTab < 4 ? (
                    <Button
                        type="button"
                        onClick={() => setActiveTab((prev) => Math.min(prev + 1, 4))}
                        className="gap-2"
                    >
                        {__('Siguiente Paso')}
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button type="submit" disabled={processing} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow">
                        <Save className="h-4 w-4" />
                        {isEditing ? __('Guardar Cambios') : __('Finalizar y Registrar Pastor')}
                    </Button>
                )}
            </div>
        </form>
    );
}
