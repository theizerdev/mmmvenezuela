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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    Sparkles,
    Loader2,
    Cloud,
    RotateCcw,
    Send,
    Building2,
    Users,
    Radio,
    Crown,
    Heart,
    X,
    XCircle,
    Info
} from 'lucide-react';
import LocationMapPicker, { GeocodedAddressDetails } from '@/components/location-map-picker';
import BiometricCameraModal, { BiometricCaptureResult, BiometricMode, optimizeAndCompressImage } from '@/components/biometric-camera-modal';

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

interface TipoLocalItem {
    id: number;
    nombre: string;
}

interface MediaItem {
    cual: string;
    donde: string;
    nota?: string;
}

interface PastorItem {
    id: number;
    nombres: string;
    apellidos: string;
    codigo?: string;
    documento: string;
    genero?: string;
}

interface RegistroPastorProps {
    estados: EstadoItem[];
    municipios: MunicipioItem[];
    parroquias: ParroquiaItem[];
    tiposLocal?: TipoLocalItem[];
    pastoresDisponibles: PastorItem[];
    gradosMinisteriales: string[];
    estadosCiviles: string[];
    generos: string[];
    flash?: {
        success?: {
            codigo: string;
            nombre: string;
            pastor_id?: number;
            iglesia?: string;
            mensaje: string;
        };
        error?: string;
    };
}

const DRAFT_STORAGE_KEY = 'mmm_pastor_registro_draft_v2';

export default function RegistroPastor({
    estados = [],
    municipios = [],
    parroquias = [],
    tiposLocal = [],
    pastoresDisponibles = [],
    gradosMinisteriales = [],
    estadosCiviles = [],
    flash,
}: RegistroPastorProps) {
    const { props } = usePage<any>();
    const { data, setData, post, processing, errors } = useForm({
        codigo: '',
        nombres: '',
        apellidos: '',
        tipo_documento: 'V',
        numero_documento: '',
        documento: '',
        genero: 'Masculino',
        fe_nacimiento: '',
        edad: '',
        estado_civil: 'Casado(a)',
        nombre_conyuge: '',
        tipo_documento_conyuge: 'V',
        numero_documento_conyuge: '',
        cedula_conyuge: '',
        conyuge_pastorea: false,
        conyuge_id: '',

        // Académicos
        grado_instruccion: 'Universitario',
        titulo_obtenido: '',
        estudio_teologico: false,
        titulo_teologico: '',
        tiempo_de_estudio_teologico: '',
        instituto_teologico: '',

        // Eclesiásticos
        nivel_ministerial: 'Ministro Ordenado',
        zona: '',
        distrito: '',
        ano_promocion: '',
        tiempo_colaborando: '',
        batizado_espiritu_santo: true,
        pertenece_ministerio: true,
        cargo_nacional: 'Ninguno',
        mencion: '',
        nota: '',

        // Fotografías
        foto: '',
        foto_cedula: '',

        // Contacto y Ubicación Pastor
        edificio_casa_quinta: '',
        piso: '',
        apartamento: '',
        calle_avenida: '',
        urbanizacion: '',
        estado_id: '',
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

        // Iglesia / Extensión a su Cargo
        tiene_extension: true,
        extension_id: '',
        extension_nombre: '',
        extension_tipo_local_id: '',
        extension_estado_id: '',
        extension_municipio_id: '',
        extension_parroquia_id: '',
        extension_direccion: '',
        extension_sector: '',
        extension_calle: '',
        extension_avenida: '',
        extension_latitud: '',
        extension_longitud: '',
        extension_zona: '',
        extension_distrito: '',
        extension_fecha_fundacion: '',
        extension_anios_activa: '',
        extension_tiempo_trabajo: '',
        extension_descripcion: '',
        extension_miembros_activos: '',
        extension_cantidad_campos_blancos: '',
        extension_miembro_probante: '',
        extension_logros_obtenidos: '',
        extension_iglesias_fundadas: '',
        extension_pastores_ministerio: '',
        extension_posee_medio_comunicacion: false,
        extension_medios_lista: [] as MediaItem[],
        extension_rol_pastor: 'principal' as 'principal' | 'conyuge_principal' | 'asistente',
    });

    const esCasado = (data.estado_civil || '').toLowerCase().includes('casad');
    const [activeTab, setActiveTab] = useState<number>(1);
    const [attemptedSteps, setAttemptedSteps] = useState<Record<number, boolean>>({});
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

    // Listas dinámicas locales de municipios y parroquias
    const [localMunicipios, setLocalMunicipios] = useState<MunicipioItem[]>(municipios);
    const [localParroquias, setLocalParroquias] = useState<ParroquiaItem[]>(parroquias);

    // Modal de agregar municipio rápido
    const [isAddMunicipioModalOpen, setIsAddMunicipioModalOpen] = useState<boolean>(false);
    const [addMunicipioTarget, setAddMunicipioTarget] = useState<'pastor' | 'extension'>('pastor');
    const [nuevoMunicipioNombre, setNuevoMunicipioNombre] = useState<string>('');
    const [isSavingMunicipio, setIsSavingMunicipio] = useState<boolean>(false);
    const [addMunicipioError, setAddMunicipioError] = useState<string | null>(null);

    // Modal de agregar parroquia rápida
    const [isAddParroquiaModalOpen, setIsAddParroquiaModalOpen] = useState<boolean>(false);
    const [addParroquiaTarget, setAddParroquiaTarget] = useState<'pastor' | 'extension'>('pastor');
    const [nuevaParroquiaNombre, setNuevaParroquiaNombre] = useState<string>('');
    const [isSavingParroquia, setIsSavingParroquia] = useState<boolean>(false);
    const [addParroquiaError, setAddParroquiaError] = useState<string | null>(null);

    // Estados para búsqueda de cédula
    const [isCheckingCedula, setIsCheckingCedula] = useState<boolean>(false);
    const [cedulaExistenteNombre, setCedulaExistenteNombre] = useState<string | null>(null);
    const [cedulaExistentePastorId, setCedulaExistentePastorId] = useState<number | null>(null);
    const [isCheckingConyugeCedula, setIsCheckingConyugeCedula] = useState<boolean>(false);
    const [conyugeExtensionData, setConyugeExtensionData] = useState<any>(null);

    // Estados para borrador automático
    const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
    const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
    const [hasPendingDraft, setHasPendingDraft] = useState<boolean>(false);
    const [draftStep, setDraftStep] = useState<number>(1);

    // Estados para Cámara Biométrica Inteligente (face-api.js)
    const [isBiometricModalOpen, setIsBiometricModalOpen] = useState<boolean>(false);
    const [biometricTarget, setBiometricTarget] = useState<BiometricMode>('foto');
    const [biometricInitialFacing, setBiometricInitialFacing] = useState<'user' | 'environment'>('user');
    const [fotoSizeKb, setFotoSizeKb] = useState<number | null>(null);
    const [fotoCedulaSizeKb, setFotoCedulaSizeKb] = useState<number | null>(null);
    const [fotoLoadError, setFotoLoadError] = useState<boolean>(false);
    const [fotoCedulaLoadError, setFotoCedulaLoadError] = useState<boolean>(false);
    const fotoInputRef = useRef<HTMLInputElement | null>(null);
    const fotoCedulaInputRef = useRef<HTMLInputElement | null>(null);
    const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
    const [activeCameraTarget, setActiveCameraTarget] = useState<'foto' | 'foto_cedula'>('foto');
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const fotoPreviewUrl = useMemo(() => {
        setFotoLoadError(false);
        if (!data.foto || typeof data.foto !== 'string') return null;
        const trimmed = data.foto.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed;
        }
        if (trimmed.startsWith('storage/')) {
            return `/${trimmed}`;
        }
        if (trimmed.startsWith('pastores/')) {
            return `/${trimmed}`;
        }
        if (trimmed.startsWith('/')) {
            return trimmed;
        }
        return `/pastores/${trimmed}`;
    }, [data.foto]);

    const fotoCedulaPreviewUrl = useMemo(() => {
        setFotoCedulaLoadError(false);
        if (!data.foto_cedula || typeof data.foto_cedula !== 'string') return null;
        const trimmed = data.foto_cedula.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed;
        }
        if (trimmed.startsWith('storage/')) {
            return `/${trimmed}`;
        }
        if (trimmed.startsWith('pastores_cedulas/')) {
            return `/${trimmed}`;
        }
        if (trimmed.startsWith('/')) {
            return trimmed;
        }
        return `/pastores_cedulas/${trimmed}`;
    }, [data.foto_cedula]);

    // Estados para Medicamentos Dinámicos
    const [nuevoMedicamentoNombre, setNuevoMedicamentoNombre] = useState<string>('');
    const [nuevoMedicamentoDosis, setNuevoMedicamentoDosis] = useState<string>('');

    // Estados para Medios de Comunicación Dinámicos de la Iglesia
    const [nuevoMedioCual, setNuevoMedioCual] = useState<string>('');
    const [nuevoMedioDonde, setNuevoMedioDonde] = useState<string>('');
    const [nuevoMedioNota, setNuevoMedioNota] = useState<string>('');

    // Estados de envío y progreso
    const [isSubmittingModalOpen, setIsSubmittingModalOpen] = useState<boolean>(false);
    const [submitProgress, setSubmitProgress] = useState<number>(0);
    const [submitStage, setSubmitStage] = useState<string>('Iniciando validación ministerial...');
    const [submittedResult, setSubmittedResult] = useState<{
        codigo: string;
        nombre: string;
        pastor_id?: number | null;
        iglesia?: string | null;
        mensaje: string;
    } | null>(null);

    // Parse de medicamentos si existen
    const medicamentosList = useMemo(() => {
        if (!data.medicamentos_recetados) return [];
        try {
            const parsed = JSON.parse(data.medicamentos_recetados);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }, [data.medicamentos_recetados]);

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
        return localMunicipios
            .filter((m) => String(m.estado_id) === String(data.estado_id))
            .map((m) => ({ value: String(m.id), label: m.nombre }));
    }, [localMunicipios, data.estado_id]);

    const parroquiaOptions: Select2Option[] = useMemo(() => {
        if (!data.municipio_id) return [];
        return localParroquias
            .filter((p) => String(p.municipio_id) === String(data.municipio_id))
            .map((p) => ({ value: String(p.id), label: p.nombre }));
    }, [localParroquias, data.municipio_id]);

    const tipoLocalOptions: Select2Option[] = useMemo(() => {
        return tiposLocal.map((t) => ({ value: String(t.id), label: t.nombre }));
    }, [tiposLocal]);

    const extensionMunicipioOptions: Select2Option[] = useMemo(() => {
        const estId = data.extension_estado_id || data.estado_id;
        if (!estId) return [];
        return localMunicipios
            .filter((m) => String(m.estado_id) === String(estId))
            .map((m) => ({ value: String(m.id), label: m.nombre }));
    }, [localMunicipios, data.extension_estado_id, data.estado_id]);

    const extensionParroquiaOptions: Select2Option[] = useMemo(() => {
        const munId = data.extension_municipio_id || data.municipio_id;
        if (!munId) return [];
        return localParroquias
            .filter((p) => String(p.municipio_id) === String(munId))
            .map((p) => ({ value: String(p.id), label: p.nombre }));
    }, [localParroquias, data.extension_municipio_id, data.municipio_id]);

    const selectedPastorEstadoNombre = useMemo(() => {
        if (!data.estado_id) return undefined;
        const found = estados.find((e) => String(e.id) === String(data.estado_id));
        return found?.nombre;
    }, [data.estado_id, estados]);

    const selectedPastorMunicipioNombre = useMemo(() => {
        if (!data.municipio_id) return undefined;
        const found = localMunicipios.find((m) => String(m.id) === String(data.municipio_id));
        return found?.nombre;
    }, [data.municipio_id, localMunicipios]);

    const selectedExtensionEstadoNombre = useMemo(() => {
        const estId = data.extension_estado_id || data.estado_id;
        if (!estId) return undefined;
        const found = estados.find((e) => String(e.id) === String(estId));
        return found?.nombre;
    }, [data.extension_estado_id, data.estado_id, estados]);

    const selectedExtensionMunicipioNombre = useMemo(() => {
        const munId = data.extension_municipio_id || data.municipio_id;
        if (!munId) return undefined;
        const found = localMunicipios.find((m) => String(m.id) === String(munId));
        return found?.nombre;
    }, [data.extension_municipio_id, data.municipio_id, localMunicipios]);

    const cleanText = (str?: string) => {
        if (!str) return '';
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    };

    const handleExtensionMapLocationSelect = (newLat: number, newLng: number, details?: GeocodedAddressDetails) => {
        let matchedEstadoId = data.extension_estado_id || data.estado_id;
        let matchedMunicipioId = data.extension_municipio_id || data.municipio_id;
        let matchedParroquiaId = data.extension_parroquia_id || data.parroquia_id;

        const fullText = cleanText(
            `${details?.estado || ''} ${details?.municipio || ''} ${details?.parroquia || ''} ${details?.direccion || ''}`
        );

        const foundState = estados.find((e) => {
            const normE = cleanText(e.nombre);
            if (!normE) return false;
            if (normE === 'distrito capital' && (fullText.includes('distrito capital') || fullText.includes('caracas') || fullText.includes('distrito federal'))) {
                return true;
            }
            if ((normE === 'la guaira' || normE === 'vargas') && (fullText.includes('la guaira') || fullText.includes('vargas'))) {
                return true;
            }
            return fullText.includes(normE);
        });

        if (foundState) {
            matchedEstadoId = String(foundState.id);
        }

        markFieldTouched('extension_latitud');
        markFieldTouched('extension_longitud');

        setData((prev) => ({
            ...prev,
            extension_latitud: String(newLat),
            extension_longitud: String(newLng),
            extension_estado_id: matchedEstadoId,
            extension_municipio_id: matchedMunicipioId,
            extension_parroquia_id: matchedParroquiaId,
            extension_direccion: details?.direccion ? details.direccion : prev.extension_direccion,
            extension_sector: details?.sector ? details.sector : prev.extension_sector,
            extension_calle: details?.calle ? details.calle : prev.extension_calle,
            extension_avenida: details?.avenida ? details.avenida : prev.extension_avenida,
        }));
    };

    const handleExtensionAnoFundacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawVal = e.target.value;
        const cleanAno = rawVal.replace(/\D/g, '').slice(0, 4);
        markFieldTouched('extension_fecha_fundacion');

        if (cleanAno.length === 4) {
            const fundYear = parseInt(cleanAno, 10);
            const currentYear = new Date().getFullYear();
            const years = Math.max(0, currentYear - fundYear);
            const tiempoText = years === 1 ? '1 año' : `${years} años`;

            setData((prev) => ({
                ...prev,
                extension_fecha_fundacion: `${cleanAno}-01-01`,
                extension_anios_activa: String(years),
                extension_tiempo_trabajo: tiempoText,
            }));
            return;
        }

        setData((prev) => ({
            ...prev,
            extension_fecha_fundacion: cleanAno,
            extension_anios_activa: '',
            extension_tiempo_trabajo: '',
        }));
    };

    const handleAgregarMedio = () => {
        if (!nuevoMedioCual.trim()) return;
        const list = [...(data.extension_medios_lista || [])];
        list.push({ cual: nuevoMedioCual.trim(), donde: nuevoMedioDonde.trim(), nota: nuevoMedioNota.trim() });
        setData('extension_medios_lista', list);
        setNuevoMedioCual('');
        setNuevoMedioDonde('');
        setNuevoMedioNota('');
    };

    const handleEliminarMedio = (idx: number) => {
        const list = (data.extension_medios_lista || []).filter((_, i) => i !== idx);
        setData('extension_medios_lista', list);
    };

    // Funciones para registrar Municipio / Parroquia en caliente
    const openAddMunicipioModal = (target: 'pastor' | 'extension') => {
        const currentEstadoId = target === 'pastor' ? data.estado_id : (data.extension_estado_id || data.estado_id);
        if (!currentEstadoId) {
            alert('Por favor seleccione primero un Estado.');
            return;
        }
        setAddMunicipioTarget(target);
        setNuevoMunicipioNombre('');
        setAddMunicipioError(null);
        setIsAddMunicipioModalOpen(true);
    };

    const openAddParroquiaModal = (target: 'pastor' | 'extension') => {
        const currentMunicipioId = target === 'pastor' ? data.municipio_id : (data.extension_municipio_id || data.municipio_id);
        if (!currentMunicipioId) {
            alert('Por favor seleccione primero un Municipio.');
            return;
        }
        setAddParroquiaTarget(target);
        setNuevaParroquiaNombre('');
        setAddParroquiaError(null);
        setIsAddParroquiaModalOpen(true);
    };

    const handleCrearMunicipio = async (e: React.FormEvent) => {
        e.preventDefault();
        const targetEstadoId = addMunicipioTarget === 'pastor' ? data.estado_id : (data.extension_estado_id || data.estado_id);
        if (!targetEstadoId) {
            setAddMunicipioError('Primero debe seleccionar un Estado.');
            return;
        }
        if (!nuevoMunicipioNombre.trim()) {
            setAddMunicipioError('Ingrese el nombre del Municipio.');
            return;
        }

        setIsSavingMunicipio(true);
        setAddMunicipioError(null);

        try {
            const res = await fetch('/registro/crear-municipio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    estado_id: targetEstadoId,
                    nombre: nuevoMunicipioNombre.trim(),
                }),
            });

            const result = await res.json();
            if (res.ok && result.success && result.municipio) {
                const newMun = result.municipio;
                setLocalMunicipios((prev) => {
                    if (prev.some((m) => String(m.id) === String(newMun.id))) return prev;
                    return [...prev, newMun].sort((a, b) => a.nombre.localeCompare(b.nombre));
                });

                if (addMunicipioTarget === 'pastor') {
                    markFieldTouched('municipio_id');
                    setData((prev) => ({
                        ...prev,
                        municipio_id: String(newMun.id),
                        municipio: newMun.nombre,
                        parroquia_id: '',
                    }));
                } else {
                    markFieldTouched('extension_municipio_id');
                    setData((prev) => ({
                        ...prev,
                        extension_municipio_id: String(newMun.id),
                        extension_parroquia_id: '',
                    }));
                }

                setIsAddMunicipioModalOpen(false);
                setNuevoMunicipioNombre('');
            } else {
                setAddMunicipioError(result.message || 'No se pudo registrar el municipio.');
            }
        } catch (err) {
            setAddMunicipioError('Error de conexión al registrar el municipio.');
        } finally {
            setIsSavingMunicipio(false);
        }
    };

    const handleCrearParroquia = async (e: React.FormEvent) => {
        e.preventDefault();
        const targetMunicipioId = addParroquiaTarget === 'pastor' ? data.municipio_id : (data.extension_municipio_id || data.municipio_id);
        if (!targetMunicipioId) {
            setAddParroquiaError('Primero debe seleccionar un Municipio.');
            return;
        }
        if (!nuevaParroquiaNombre.trim()) {
            setAddParroquiaError('Ingrese el nombre de la Parroquia.');
            return;
        }

        setIsSavingParroquia(true);
        setAddParroquiaError(null);

        try {
            const res = await fetch('/registro/crear-parroquia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    municipio_id: targetMunicipioId,
                    nombre: nuevaParroquiaNombre.trim(),
                }),
            });

            const result = await res.json();
            if (res.ok && result.success && result.parroquia) {
                const newParr = result.parroquia;
                setLocalParroquias((prev) => {
                    if (prev.some((p) => String(p.id) === String(newParr.id))) return prev;
                    return [...prev, newParr].sort((a, b) => a.nombre.localeCompare(b.nombre));
                });

                if (addParroquiaTarget === 'pastor') {
                    markFieldTouched('parroquia_id');
                    setData((prev) => ({
                        ...prev,
                        parroquia_id: String(newParr.id),
                    }));
                } else {
                    markFieldTouched('extension_parroquia_id');
                    setData((prev) => ({
                        ...prev,
                        extension_parroquia_id: String(newParr.id),
                    }));
                }

                setIsAddParroquiaModalOpen(false);
                setNuevaParroquiaNombre('');
            } else {
                setAddParroquiaError(result.message || 'No se pudo registrar la parroquia.');
            }
        } catch (err) {
            setAddParroquiaError('Error de conexión al registrar la parroquia.');
        } finally {
            setIsSavingParroquia(false);
        }
    };

    // Auto-Save Draft y Captura de Registro Exitoso (Flash)
    useEffect(() => {
        const successData = flash?.success || props?.flash?.success;
        if (successData) {
            setSubmittedResult({
                codigo: successData.codigo || 'GENERADO',
                nombre: successData.nombre || 'Pastor',
                pastor_id: successData.pastor_id || null,
                iglesia: successData.iglesia || null,
                mensaje: successData.mensaje || '¡Su ficha ministerial y los datos de su Iglesia/Extensión han sido registrados satisfactoriamente en el sistema nacional!',
            });
            setIsSubmittingModalOpen(false);
            try {
                localStorage.removeItem(DRAFT_STORAGE_KEY);
            } catch (e) { }
            setHasPendingDraft(false);
            setLastSavedTime(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
        } catch (e) { }
    }, [flash, props?.flash]);

    useEffect(() => {
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
                try {
                    // Si excede la cuota de localStorage por imágenes base64, guardamos sin las fotos pesadas para no perder los datos del formulario
                    const fallbackData = { ...data, foto: '', foto_cedula: '' };
                    const fallbackPayload = {
                        data: fallbackData,
                        activeTab,
                        savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    };
                    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(fallbackPayload));
                    setLastSavedTime(fallbackPayload.savedAt);
                } catch (err2) { }
            } finally {
                setIsSavingDraft(false);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [data, activeTab, submittedResult, isSubmittingModalOpen]);

    const parseCedula = (raw?: string): { tipo: string; numero: string } => {
        if (!raw) return { tipo: 'V', numero: '' };
        const trimmed = raw.trim().toUpperCase();
        let tipo = 'V';
        let numero = '';
        if (trimmed.startsWith('P-') || trimmed.startsWith('P')) {
            tipo = 'P';
            numero = trimmed.replace(/^P[-]?/, '').replace(/[^A-Z0-9]/g, '');
        } else if (trimmed.startsWith('E-') || trimmed.startsWith('E')) {
            tipo = 'E';
            numero = trimmed.replace(/^E[-]?/, '').replace(/\D/g, '');
        } else if (trimmed.startsWith('V-') || trimmed.startsWith('V')) {
            tipo = 'V';
            numero = trimmed.replace(/^V[-]?/, '').replace(/\D/g, '');
        } else {
            numero = trimmed.replace(/\D/g, '');
        }
        return { tipo: tipo || 'V', numero };
    };

    const handleRestoreDraft = () => {
        try {
            const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (rawDraft) {
                const parsed = JSON.parse(rawDraft);
                if (parsed.data) {
                    setData((prev) => ({ ...prev, ...parsed.data }));
                }
                if (parsed.activeTab) {
                    setActiveTab(parsed.activeTab);
                }
                setLastSavedTime(parsed.savedAt || 'Reciente');
            }
        } catch (e) { } finally {
            setHasPendingDraft(false);
        }
    };

    const handleDiscardDraft = () => {
        try {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch (e) { }
        setHasPendingDraft(false);
        setLastSavedTime(null);
    };

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
        markFieldTouched('fe_nacimiento');
        const computedAge = calculateAge(val);
        setData((prev) => ({
            ...prev,
            fe_nacimiento: val,
            edad: computedAge !== '' ? computedAge : prev.edad,
        }));
    };

    const handleEstadoChange = (val: string) => {
        markFieldTouched('estado_id');
        setData((prev) => ({
            ...prev,
            estado_id: val,
            municipio_id: '',
            parroquia_id: '',
            extension_estado_id: prev.extension_estado_id || val,
        }));
    };

    const handleMunicipioChange = (val: string) => {
        markFieldTouched('municipio_id');
        const munFound = localMunicipios.find((m) => String(m.id) === val);
        setData((prev) => ({
            ...prev,
            municipio_id: val,
            parroquia_id: '',
            municipio: munFound ? munFound.nombre : '',
            extension_municipio_id: prev.extension_municipio_id || val,
        }));
    };

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

    // Búsqueda y Carga de Datos de Cédula en tiempo real
    const checkCedulaDuplicada = async (doc: string) => {
        const trimmed = doc.trim();
        const numOnly = trimmed.replace(/\D/g, '');
        if (numOnly.length < 4) {
            setCedulaExistenteNombre(null);
            setCedulaExistentePastorId(null);
            return;
        }

        setIsCheckingCedula(true);
        try {
            const res = await fetch(`/registro/verificar-cedula/${encodeURIComponent(trimmed)}`);
            if (res.ok) {
                const result = await res.json();
                if (result.existe && result.pastor) {
                    const p = result.pastor;
                    const parsedDoc = parseCedula(p.documento || trimmed);
                    const parsedConyugeDoc = parseCedula(p.cedula_conyuge);
                    setCedulaExistenteNombre(result.nombre || `${p.nombres} ${p.apellidos}`);
                    setCedulaExistentePastorId(result.pastor_id || p.id);

                    setData((prev) => ({
                        ...prev,
                        codigo: p.codigo || prev.codigo,
                        nombres: p.nombres || prev.nombres,
                        apellidos: p.apellidos || prev.apellidos,
                        tipo_documento: parsedDoc.tipo,
                        numero_documento: parsedDoc.numero,
                        documento: p.documento || `${parsedDoc.tipo}-${parsedDoc.numero}`,
                        genero: p.genero || prev.genero,
                        fe_nacimiento: p.fe_nacimiento || prev.fe_nacimiento,
                        edad: p.edad || prev.edad,
                        estado_civil: p.estado_civil || prev.estado_civil,
                        nombre_conyuge: p.nombre_conyuge || prev.nombre_conyuge,
                        tipo_documento_conyuge: parsedConyugeDoc.tipo,
                        numero_documento_conyuge: parsedConyugeDoc.numero,
                        cedula_conyuge: p.cedula_conyuge || (parsedConyugeDoc.numero ? `${parsedConyugeDoc.tipo}-${parsedConyugeDoc.numero}` : ''),
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
                        foto: p.foto_url || p.foto || prev.foto,
                        foto_cedula: p.foto_cedula_url || p.foto_cedula || prev.foto_cedula,
                    }));

                    if (result.extension) {
                        const ext = result.extension;
                        let parsedMeds: MediaItem[] = [];
                        if (ext.medio_comunicacion) {
                            try {
                                const m = JSON.parse(ext.medio_comunicacion);
                                if (Array.isArray(m)) parsedMeds = m;
                            } catch (e) { }
                        }

                        setData((prev) => ({
                            ...prev,
                            tiene_extension: true,
                            extension_id: ext.id ? String(ext.id) : prev.extension_id,
                            extension_nombre: ext.nombre || prev.extension_nombre,
                            extension_tipo_local_id: ext.tipo_local_id ? String(ext.tipo_local_id) : prev.extension_tipo_local_id,
                            extension_estado_id: ext.estado_id ? String(ext.estado_id) : (p.estado_id ? String(p.estado_id) : prev.extension_estado_id),
                            extension_municipio_id: ext.municipio_id ? String(ext.municipio_id) : (p.municipio_id ? String(p.municipio_id) : prev.extension_municipio_id),
                            extension_parroquia_id: ext.parroquia_id ? String(ext.parroquia_id) : (p.parroquia_id ? String(p.parroquia_id) : prev.extension_parroquia_id),
                            extension_direccion: ext.direccion || prev.extension_direccion,
                            extension_sector: ext.sector || prev.extension_sector,
                            extension_calle: ext.calle || prev.extension_calle,
                            extension_avenida: ext.avenida || prev.extension_avenida,
                            extension_latitud: ext.latitud ? String(ext.latitud) : prev.extension_latitud,
                            extension_longitud: ext.longitud ? String(ext.longitud) : prev.extension_longitud,
                            extension_zona: ext.zona || p.zona || prev.extension_zona,
                            extension_distrito: ext.distrito || p.distrito || prev.extension_distrito,
                            extension_fecha_fundacion: ext.fecha_fundacion || prev.extension_fecha_fundacion,
                            extension_anios_activa: ext.anios_activa ? String(ext.anios_activa) : prev.extension_anios_activa,
                            extension_tiempo_trabajo: ext.tiempo_trabajo || prev.extension_tiempo_trabajo,
                            extension_descripcion: ext.descripcion || prev.extension_descripcion,
                            extension_miembros_activos: ext.miembros_activos ? String(ext.miembros_activos) : prev.extension_miembros_activos,
                            extension_cantidad_campos_blancos: ext.cantidad_campos_blancos ? String(ext.cantidad_campos_blancos) : prev.extension_cantidad_campos_blancos,
                            extension_miembro_probante: ext.miembro_probante ? String(ext.miembro_probante) : prev.extension_miembro_probante,
                            extension_logros_obtenidos: ext.logros_obtenidos || prev.extension_logros_obtenidos,
                            extension_iglesias_fundadas: ext.iglesias_fundadas ? String(ext.iglesias_fundadas) : prev.extension_iglesias_fundadas,
                            extension_pastores_ministerio: ext.pastores_ministerio ? String(ext.pastores_ministerio) : prev.extension_pastores_ministerio,
                            extension_posee_medio_comunicacion: Boolean(ext.posee_medio_comunicacion),
                            extension_medios_lista: parsedMeds.length > 0 ? parsedMeds : prev.extension_medios_lista,
                        }));
                    }
                } else {
                    setCedulaExistenteNombre(null);
                    setCedulaExistentePastorId(null);
                }
            }
        } catch (e) {
            console.error('Error al verificar cédula', e);
        } finally {
            setIsCheckingCedula(false);
        }
    };

    // Búsqueda y Carga de Datos de la Cédula del Cónyuge
    const checkConyugeCedula = async (doc: string) => {
        const trimmed = doc.trim();
        const numOnly = trimmed.replace(/\D/g, '');
        if (numOnly.length < 4) {
            setConyugeExtensionData(null);
            return;
        }

        setIsCheckingConyugeCedula(true);
        try {
            const res = await fetch(`/registro/verificar-cedula/${encodeURIComponent(trimmed)}`);
            if (res.ok) {
                const result = await res.json();
                if (result.existe) {
                    if (!data.nombre_conyuge && result.nombre) {
                        setData((prev) => ({
                            ...prev,
                            nombre_conyuge: result.nombre,
                        }));
                    }
                    if (result.extension) {
                        setConyugeExtensionData(result.extension);
                        const ext = result.extension;
                        let parsedMeds: MediaItem[] = [];
                        if (ext.medio_comunicacion) {
                            try {
                                const m = JSON.parse(ext.medio_comunicacion);
                                if (Array.isArray(m)) parsedMeds = m;
                            } catch (e) { }
                        }
                        setData((prev) => ({
                            ...prev,
                            extension_rol_pastor: 'conyuge_principal',
                            extension_id: ext.id ? String(ext.id) : prev.extension_id,
                            extension_nombre: ext.nombre || prev.extension_nombre,
                            extension_tipo_local_id: ext.tipo_local_id ? String(ext.tipo_local_id) : prev.extension_tipo_local_id,
                            extension_estado_id: ext.estado_id ? String(ext.estado_id) : prev.extension_estado_id,
                            extension_municipio_id: ext.municipio_id ? String(ext.municipio_id) : prev.extension_municipio_id,
                            extension_parroquia_id: ext.parroquia_id ? String(ext.parroquia_id) : prev.extension_parroquia_id,
                            extension_direccion: ext.direccion || prev.extension_direccion,
                            extension_sector: ext.sector || prev.extension_sector,
                            extension_calle: ext.calle || prev.extension_calle,
                            extension_avenida: ext.avenida || prev.extension_avenida,
                            extension_latitud: ext.latitud ? String(ext.latitud) : prev.extension_latitud,
                            extension_longitud: ext.longitud ? String(ext.longitud) : prev.extension_longitud,
                            extension_zona: ext.zona || prev.extension_zona,
                            extension_distrito: ext.distrito || prev.extension_distrito,
                            extension_fecha_fundacion: ext.fecha_fundacion || prev.extension_fecha_fundacion,
                            extension_anios_activa: ext.anios_activa ? String(ext.anios_activa) : prev.extension_anios_activa,
                            extension_tiempo_trabajo: ext.tiempo_trabajo || prev.extension_tiempo_trabajo,
                            extension_descripcion: ext.descripcion || prev.extension_descripcion,
                            extension_miembros_activos: ext.miembros_activos ? String(ext.miembros_activos) : prev.extension_miembros_activos,
                            extension_cantidad_campos_blancos: ext.cantidad_campos_blancos ? String(ext.cantidad_campos_blancos) : prev.extension_cantidad_campos_blancos,
                            extension_miembro_probante: ext.miembro_probante ? String(ext.miembro_probante) : prev.extension_miembro_probante,
                            extension_logros_obtenidos: ext.logros_obtenidos || prev.extension_logros_obtenidos,
                            extension_iglesias_fundadas: ext.iglesias_fundadas ? String(ext.iglesias_fundadas) : prev.extension_iglesias_fundadas,
                            extension_pastores_ministerio: ext.pastores_ministerio ? String(ext.pastores_ministerio) : prev.extension_pastores_ministerio,
                            extension_posee_medio_comunicacion: Boolean(ext.posee_medio_comunicacion),
                            extension_medios_lista: parsedMeds.length > 0 ? parsedMeds : prev.extension_medios_lista,
                        }));
                    }
                }
            }
        } catch (e) {
            console.error('Error al verificar cédula del cónyuge:', e);
        } finally {
            setIsCheckingConyugeCedula(false);
        }
    };

    // Cámara Web
    const startCamera = async (target: 'foto' | 'foto_cedula', customFacing?: 'user' | 'environment') => {
        setActiveCameraTarget(target);
        setIsCameraActive(true);
        const mode = customFacing || facingMode;

        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });
            streamRef.current = mediaStream;
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error('Error al acceder a la cámara:', err);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };

    const resizeAndCompressImage = (base64Str: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1000;
                const MAX_HEIGHT = 1000;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.82));
            };
            img.onerror = () => resolve(base64Str);
        });
    };

    // Handlers para Cámara Biométrica Inteligente (face-api.js)
    const handleOpenBiometricCamera = (target: BiometricMode, defaultFacing: 'user' | 'environment' = 'user') => {
        setBiometricTarget(target);
        setBiometricInitialFacing(defaultFacing);
        setIsBiometricModalOpen(true);
    };

    const handleBiometricCapture = (result: BiometricCaptureResult) => {
        markFieldTouched(result.mode);
        setData(result.mode, result.dataUrl);
        if (result.mode === 'foto') {
            setFotoSizeKb(result.sizeKb);
        } else {
            setFotoCedulaSizeKb(result.sizeKb);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'foto' | 'foto_cedula') => {
        const file = e.target.files?.[0];
        if (file) {
            markFieldTouched(target);
            const reader = new FileReader();
            reader.onload = async (event) => {
                const result = event.target?.result as string;
                if (result) {
                    const optimized = await optimizeAndCompressImage(
                        result,
                        target === 'foto' ? 900 : 1200,
                        target === 'foto' ? 1200 : 800,
                        350,
                        true,
                        target
                    );
                    setData(target, optimized.dataUrl);
                    if (target === 'foto') {
                        setFotoSizeKb(optimized.sizeKb);
                    } else {
                        setFotoCedulaSizeKb(optimized.sizeKb);
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Helper de rastreo de campos tocados
    const markFieldTouched = (fieldName: string) => {
        setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
    };

    // Validación exhaustiva en tiempo real (Paso a Paso)
    const getFieldError = (fieldName: string): string | null => {
        if ((data.extension_rol_pastor === 'conyuge_principal' || data.extension_rol_pastor === 'asistente') && fieldName.startsWith('extension_')) {
            return null;
        }

        const docNumero = data.numero_documento.trim() || data.documento.replace(/^[VEPvep]-?/, '').trim();
        const conyugeDocNum = data.numero_documento_conyuge.trim() || data.cedula_conyuge.replace(/^[VEPvep]-?/, '').trim();

        switch (fieldName) {
            // Paso 1
            case 'nombres':
                if (!data.nombres.trim()) return 'Los nombres son requeridos.';
                break;
            case 'apellidos':
                if (!data.apellidos.trim()) return 'Los apellidos son requeridos.';
                break;
            case 'numero_documento':
                if (!docNumero) return 'El número de cédula / documento es requerido.';
                break;
            case 'genero':
                if (!data.genero) return 'Seleccione el género.';
                break;
            case 'fe_nacimiento':
                if (!data.fe_nacimiento) return 'La fecha de nacimiento es requerida.';
                break;
            case 'estado_civil':
                if (!data.estado_civil) return 'Seleccione el estado civil.';
                break;
            case 'nombre_conyuge':
                if (esCasado && !data.nombre_conyuge.trim()) return 'El nombre del cónyuge es requerido.';
                break;
            case 'numero_documento_conyuge':
                if (esCasado && data.conyuge_pastorea && !conyugeDocNum) return 'La cédula del cónyuge es requerida.';
                break;
            case 'telefono_tlf':
                if (!data.telefono_tlf.trim()) return 'El teléfono celular / WhatsApp es requerido.';
                break;
            case 'email':
                if (!data.email.trim()) return 'El correo electrónico es requerido.';
                break;
            case 'estado_id':
                if (!data.estado_id) return 'Seleccione el estado de su ubicación.';
                break;
            case 'municipio_id':
                if (!data.municipio_id && !data.municipio) return 'Seleccione el municipio de su ubicación.';
                break;
            case 'parroquia_id':
                if (!data.parroquia_id) return 'Seleccione la parroquia de su ubicación.';
                break;
            case 'urbanizacion':
                if (!data.urbanizacion.trim()) return 'El sector o urbanización es requerido.';
                break;
            case 'calle_avenida':
                if (!data.calle_avenida.trim()) return 'La calle o avenida es requerida.';
                break;
            case 'edificio_casa_quinta':
                if (!data.edificio_casa_quinta.trim()) return 'La casa, edificio o quinta es requerida.';
                break;

            // Paso 2
            case 'grado_instruccion':
                if (!data.grado_instruccion) return 'Seleccione el grado de instrucción académica.';
                break;
            case 'titulo_obtenido':
                if (!data.titulo_obtenido.trim()) return 'El título secular obtenido es requerido.';
                break;
            case 'titulo_teologico':
                if (data.estudio_teologico && !data.titulo_teologico.trim()) return 'El título teológico es requerido.';
                break;
            case 'instituto_teologico':
                if (data.estudio_teologico && !data.instituto_teologico.trim()) return 'El instituto teológico es requerido.';
                break;
            case 'tiempo_de_estudio_teologico':
                if (data.estudio_teologico && !data.tiempo_de_estudio_teologico.trim()) return 'El tiempo de estudio teológico es requerido.';
                break;

            // Paso 3
            case 'nivel_ministerial':
                if (!data.nivel_ministerial) return 'Seleccione el grado ministerial.';
                break;
            case 'zona':
                if (!data.zona.trim()) return 'La zona ministerial es requerida.';
                break;
            case 'distrito':
                if (!data.distrito) return 'Seleccione el distrito.';
                break;
            case 'ano_promocion':
                if (!data.ano_promocion.trim()) return 'El año de ordenación / promoción es requerido.';
                break;
            case 'tiempo_colaborando':
                if (!data.tiempo_colaborando.trim()) return 'El tiempo en el ministerio es requerido.';
                break;
            case 'cargo_nacional':
                if (!data.cargo_nacional.trim()) return 'El cargo o responsabilidad nacional es requerido.';
                break;

            // Paso 4
            case 'grupo_sanguineo':
                if (!data.grupo_sanguineo) return 'Seleccione el grupo sanguíneo.';
                break;
            case 'condicion_salud':
                if (!data.condicion_salud) return 'Seleccione la condición general de salud.';
                break;
            case 'alergias':
                if (!data.alergias.trim()) return 'Indique alergias conocidas o escriba "Ninguna".';
                break;
            case 'enfermedades_cronicas':
                if (data.padece_enfermedad && !data.enfermedades_cronicas.trim()) return 'Describa el diagnóstico o enfermedad crónica.';
                break;
            case 'medicamentos_recetados':
                if (data.toma_medicamentos && medicamentosList.length === 0 && !nuevoMedicamentoNombre.trim()) {
                    return 'Agregue al menos un medicamento a la lista.';
                }
                break;
            case 'contacto_emergencia_nombre':
                if (!data.contacto_emergencia_nombre.trim()) return 'El nombre del contacto de emergencia es requerido.';
                break;
            case 'contacto_emergencia_telefono':
                if (!data.contacto_emergencia_telefono.trim()) return 'El teléfono de emergencia es requerido.';
                break;

            // Paso 5 (Fotografías OBLIGATORIAS)
            case 'foto':
                if (!data.foto) return 'La fotografía tipo carnet es obligatoria.';
                break;
            case 'foto_cedula':
                if (!data.foto_cedula) return 'La fotografía de la cédula es obligatoria.';
                break;

            // Paso 6 (Iglesia)
            case 'extension_nombre':
                if (!data.extension_nombre.trim()) return 'El nombre de la Iglesia / Extensión es requerido.';
                break;
            case 'extension_tipo_local_id':
                if (!data.extension_tipo_local_id) return 'Seleccione el tipo de local.';
                break;
            case 'extension_fecha_fundacion': {
                const rawAno = String(data.extension_fecha_fundacion || '').replace(/\D/g, '').slice(0, 4);
                if (!rawAno || rawAno.length < 4) return 'El año de fundación es requerido (Ej. 1995).';
                const yr = parseInt(rawAno, 10);
                const currentYear = new Date().getFullYear();
                if (yr < 1920 || yr > currentYear) return `Ingrese un año válido entre 1920 y ${currentYear}.`;
                break;
            }
            case 'extension_tiempo_trabajo':
                if (!data.extension_tiempo_trabajo.trim()) return 'El tiempo de trabajo activo es requerido.';
                break;

            // Paso 7 (Ubicación GPS Iglesia)
            case 'extension_estado_id':
                if (!data.extension_estado_id) return 'Seleccione el estado de la iglesia.';
                break;
            case 'extension_municipio_id':
                if (!data.extension_municipio_id) return 'Seleccione el municipio de la iglesia.';
                break;
            case 'extension_parroquia_id':
                if (!data.extension_parroquia_id) return 'Seleccione la parroquia de la iglesia.';
                break;
            case 'extension_direccion':
                if (!data.extension_direccion.trim() && !data.extension_sector.trim()) return 'La dirección o sector de la iglesia es requerida.';
                break;
            case 'extension_latitud':
            case 'extension_longitud':
                if (!data.extension_latitud || !data.extension_longitud) return 'Seleccione la ubicación en el mapa GPS.';
                break;

            // Paso 8 (Membresía y Medios)
            case 'extension_miembros_activos':
                if (!data.extension_miembros_activos.trim()) return 'La cantidad de miembros activos es requerida.';
                break;
            case 'extension_cantidad_campos_blancos':
                if (!data.extension_cantidad_campos_blancos.trim()) return 'La cantidad de campos blancos es requerida (o 0).';
                break;
            case 'extension_miembro_probante':
                if (!data.extension_miembro_probante.trim()) return 'La cantidad de miembros probantes es requerida (o 0).';
                break;
            case 'extension_iglesias_fundadas':
                if (!data.extension_iglesias_fundadas.trim()) return 'Indique cantidad de iglesias fundadas (o 0).';
                break;
            case 'extension_pastores_ministerio':
                if (!data.extension_pastores_ministerio.trim()) return 'Indique pastores levantados (o 0).';
                break;
            case 'extension_logros_obtenidos':
                if (!data.extension_logros_obtenidos.trim()) return 'Indique logros o testimonios relevantes.';
                break;
            case 'extension_medios_lista':
                if (data.extension_posee_medio_comunicacion && (data.extension_medios_lista?.length || 0) === 0 && !nuevoMedioCual.trim()) {
                    return 'Agregue al menos un medio de comunicación en la lista.';
                }
                break;

            default:
                break;
        }

        return null;
    };

    const isFieldVisibleError = (fieldName: string, stepOfField: number): string | null => {
        const error = getFieldError(fieldName);
        if (!error) return null;
        if (attemptedSteps[stepOfField] || touchedFields[fieldName]) {
            return error;
        }
        return null;
    };

    const isStepValid = (stepNumber: number): boolean => {
        if (!data.tiene_extension && stepNumber >= 6) {
            return true;
        }

        if (stepNumber >= 6 && (data.extension_rol_pastor === 'conyuge_principal' || data.extension_rol_pastor === 'asistente')) {
            return true;
        }

        const fieldsByStep: Record<number, string[]> = {
            1: [
                'nombres', 'apellidos', 'numero_documento', 'genero', 'fe_nacimiento', 'estado_civil',
                ...(esCasado ? ['nombre_conyuge'] : []),
                ...(esCasado && data.conyuge_pastorea ? ['numero_documento_conyuge'] : []),
                'telefono_tlf', 'email', 'estado_id', 'municipio_id', 'parroquia_id',
                'urbanizacion', 'calle_avenida', 'edificio_casa_quinta'
            ],
            2: [
                'grado_instruccion', 'titulo_obtenido',
                ...(data.estudio_teologico ? ['titulo_teologico', 'instituto_teologico', 'tiempo_de_estudio_teologico'] : [])
            ],
            3: [
                'nivel_ministerial', 'zona', 'distrito', 'ano_promocion', 'tiempo_colaborando', 'cargo_nacional'
            ],
            4: [
                'grupo_sanguineo', 'condicion_salud', 'alergias',
                ...(data.padece_enfermedad ? ['enfermedades_cronicas'] : []),
                ...(data.toma_medicamentos ? ['medicamentos_recetados'] : []),
                'contacto_emergencia_nombre', 'contacto_emergencia_telefono'
            ],
            5: [
                'foto', 'foto_cedula'
            ],
            6: [
                'extension_nombre', 'extension_tipo_local_id', 'extension_fecha_fundacion', 'extension_tiempo_trabajo'
            ],
            7: [
                'extension_estado_id', 'extension_municipio_id', 'extension_parroquia_id', 'extension_direccion',
                'extension_latitud', 'extension_longitud'
            ],
            8: [
                'extension_miembros_activos', 'extension_cantidad_campos_blancos', 'extension_miembro_probante',
                'extension_iglesias_fundadas', 'extension_pastores_ministerio', 'extension_logros_obtenidos',
                ...(data.extension_posee_medio_comunicacion ? ['extension_medios_lista'] : [])
            ],
        };

        const list = fieldsByStep[stepNumber] || [];
        for (const field of list) {
            if (getFieldError(field) !== null) {
                return false;
            }
        }
        return true;
    };

    const handleTabClick = (targetStep: number) => {
        if (targetStep === activeTab) return;
        if (!data.tiene_extension && targetStep > 5) return;

        if (targetStep > activeTab) {
            for (let s = 1; s < targetStep; s++) {
                if (!isStepValid(s)) {
                    setAttemptedSteps((prev) => ({ ...prev, [s]: true }));
                    setActiveTab(s);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
            }
        }

        setActiveTab(targetStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Envío del Formulario con Modal de Progreso (0% a 100%)
    const handleSubmit = (e?: React.FormEvent) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        // Validar rigurosamente los pasos correspondientes (1 a 5 si no tiene extensión, 1 a 8 si tiene)
        const maxSteps = data.tiene_extension ? 8 : 5;
        for (let s = 1; s <= maxSteps; s++) {
            if (!isStepValid(s)) {
                setAttemptedSteps((prev) => ({ ...prev, [s]: true }));
                setActiveTab(s);
                window.scrollTo({ top: 120, behavior: 'smooth' });
                return;
            }
        }

        setIsSubmittingModalOpen(true);
        setSubmitProgress(10);
        setSubmitStage('Validando ficha pastoral y datos ministeriales...');

        let currentP = 10;
        const progressInterval = setInterval(() => {
            currentP += Math.floor(Math.random() * 12) + 5;
            if (currentP > 88) {
                currentP = 88;
                setSubmitStage('Guardando registros en la base de datos nacional...');
            } else if (currentP > 65) {
                setSubmitStage('Registrando Iglesia / Extensión y geolocalización GPS...');
            } else if (currentP > 40) {
                setSubmitStage('Generando código ministerial y procesando fotografías...');
            } else if (currentP > 15) {
                setSubmitStage('Enviando datos para revisión y confirmación oficial...');
            }
            setSubmitProgress(currentP);
        }, 280);

        post('/registro', {
            preserveScroll: true,
            onSuccess: (page: any) => {
                clearInterval(progressInterval);
                setSubmitProgress(100);
                setSubmitStage('¡Registro completado y recibido exitosamente!');

                const flashSuccess = page?.props?.flash?.success || props?.flash?.success;
                const finalPastorId = flashSuccess?.pastor_id || cedulaExistentePastorId || null;

                setSubmittedResult({
                    codigo: flashSuccess?.codigo || data.codigo || 'GENERADO',
                    nombre: flashSuccess?.nombre || `${data.nombres} ${data.apellidos}`,
                    pastor_id: finalPastorId,
                    iglesia: flashSuccess?.iglesia || data.extension_nombre || null,
                    mensaje: flashSuccess?.mensaje || 'Su ficha ministerial y los datos de su Iglesia/Extensión han sido registrados satisfactoriamente.',
                });

                try {
                    localStorage.removeItem(DRAFT_STORAGE_KEY);
                } catch (e) { }
            },
            onError: (errs) => {
                clearInterval(progressInterval);
                setIsSubmittingModalOpen(false);
                setSubmitProgress(0);

                if (errs.nombres || errs.apellidos || errs.documento || errs.telefono_tlf) {
                    setActiveTab(1);
                    setAttemptedSteps((prev) => ({ ...prev, 1: true }));
                } else if (errs.grado_instruccion || errs.titulo_obtenido) {
                    setActiveTab(2);
                    setAttemptedSteps((prev) => ({ ...prev, 2: true }));
                } else if (errs.nivel_ministerial || errs.distrito || errs.zona) {
                    setActiveTab(3);
                    setAttemptedSteps((prev) => ({ ...prev, 3: true }));
                } else if (errs.grupo_sanguineo || errs.contacto_emergencia_nombre) {
                    setActiveTab(4);
                    setAttemptedSteps((prev) => ({ ...prev, 4: true }));
                } else if (errs.foto || errs.foto_cedula) {
                    setActiveTab(5);
                    setAttemptedSteps((prev) => ({ ...prev, 5: true }));
                } else if (errs.extension_nombre || errs.extension_tipo_local_id) {
                    setActiveTab(6);
                    setAttemptedSteps((prev) => ({ ...prev, 6: true }));
                } else if (errs.extension_estado_id || errs.extension_latitud) {
                    setActiveTab(7);
                    setAttemptedSteps((prev) => ({ ...prev, 7: true }));
                } else if (errs.extension_miembros_activos) {
                    setActiveTab(8);
                    setAttemptedSteps((prev) => ({ ...prev, 8: true }));
                }
            },
        });
    };

    const handleNextStep = (currentStepNumber: number) => {
        if (!isStepValid(currentStepNumber)) {
            setAttemptedSteps((prev) => ({ ...prev, [currentStepNumber]: true }));
            window.scrollTo({ top: 120, behavior: 'smooth' });
            return;
        }

        if (currentStepNumber === 5 && !data.tiene_extension) {
            handleSubmit();
            return;
        }

        setActiveTab(currentStepNumber + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const steps = [
        { id: 1, title: 'Datos Personales', icon: User, desc: 'Identidad, cónyuge y contacto' },
        { id: 2, title: 'Formación Académica', icon: GraduationCap, desc: 'Nivel secular y teología' },
        { id: 3, title: 'Datos Eclesiásticos', icon: Cross, desc: 'Grado, zona y ordenación' },
        { id: 4, title: 'Estado de Salud', icon: Stethoscope, desc: 'Ficha médica y emergencia' },
        { id: 5, title: 'Fotografías', icon: Camera, desc: 'Carnet y foto cédula (Obligatorias)' },
        { id: 6, title: 'Datos de la Iglesia', icon: Building2, desc: 'Nombre, local y fundación' },
        { id: 7, title: 'Ubicación GPS Iglesia', icon: MapPin, desc: 'Dirección y mapa satelital' },
        { id: 8, title: 'Membresía y Medios', icon: Radio, desc: 'Miembros, frutos y medios' },
    ];

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans relative">
            <Head title="Registro Ministerial y de Extensión - MMM Venezuela" />

            {/* MODAL DE CÁMARA BIOMÉTRICA CON INTELIGENCIA ARTIFICIAL (face-api.js) */}
            <BiometricCameraModal
                isOpen={isBiometricModalOpen}
                mode={biometricTarget}
                initialFacingMode={biometricInitialFacing}
                onClose={() => setIsBiometricModalOpen(false)}
                onCapture={handleBiometricCapture}
            />

            {/* MODAL AGREGAR MUNICIPIO RÁPIDO */}
            {isAddMunicipioModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-md bg-white border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                <h3 className="font-bold text-sm">Agregar Nuevo Municipio</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddMunicipioModalOpen(false)}
                                className="text-white/80 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCrearMunicipio} className="p-5 space-y-4">
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                                Estado seleccionado:{' '}
                                <b>
                                    {addMunicipioTarget === 'pastor'
                                        ? selectedPastorEstadoNombre
                                        : selectedExtensionEstadoNombre}
                                </b>
                            </div>

                            <div>
                                <Label htmlFor="nuevo_municipio" className="text-xs font-bold text-slate-700">
                                    Nombre del Municipio <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="nuevo_municipio"
                                    value={nuevoMunicipioNombre}
                                    onChange={(e) => setNuevoMunicipioNombre(e.target.value)}
                                    placeholder="Ej. Iribarren, Valencia, Caroní..."
                                    autoFocus
                                    className="mt-1 bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                                />
                                {addMunicipioError && (
                                    <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                        {addMunicipioError}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAddMunicipioModalOpen(false)}
                                    className="text-xs border-slate-300 text-slate-700"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSavingMunicipio}
                                    className="text-xs bg-blue-700 hover:bg-blue-800 text-white font-bold"
                                >
                                    {isSavingMunicipio ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Guardando...
                                        </>
                                    ) : (
                                        'Guardar y Seleccionar'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* MODAL AGREGAR PARROQUIA RÁPIDA */}
            {isAddParroquiaModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-md bg-white border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                <h3 className="font-bold text-sm">Agregar Nueva Parroquia</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddParroquiaModalOpen(false)}
                                className="text-white/80 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCrearParroquia} className="p-5 space-y-4">
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                                Municipio seleccionado:{' '}
                                <b>
                                    {addParroquiaTarget === 'pastor'
                                        ? selectedPastorMunicipioNombre
                                        : selectedExtensionMunicipioNombre}
                                </b>
                            </div>

                            <div>
                                <Label htmlFor="nueva_parroquia" className="text-xs font-bold text-slate-700">
                                    Nombre de la Parroquia <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="nueva_parroquia"
                                    value={nuevaParroquiaNombre}
                                    onChange={(e) => setNuevaParroquiaNombre(e.target.value)}
                                    placeholder="Ej. Catedral, Santa Rosa, Juan de Villegas..."
                                    autoFocus
                                    className="mt-1 bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                                />
                                {addParroquiaError && (
                                    <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                        {addParroquiaError}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAddParroquiaModalOpen(false)}
                                    className="text-xs border-slate-300 text-slate-700"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSavingParroquia}
                                    className="text-xs bg-blue-700 hover:bg-blue-800 text-white font-bold"
                                >
                                    {isSavingParroquia ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Guardando...
                                        </>
                                    ) : (
                                        'Guardar y Seleccionar'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* MODAL DE PROGRESO Y CONFIRMACIÓN */}
            {isSubmittingModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg bg-white border-slate-200 shadow-2xl rounded-3xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-300">
                        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-6 text-white text-center relative">
                            <div className="mx-auto w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-xs shadow-inner">
                                {submitProgress === 100 ? (
                                    <CheckCircle2 className="w-9 h-9 text-white animate-bounce" />
                                ) : (
                                    <Send className="w-8 h-8 text-white animate-pulse" />
                                )}
                            </div>
                            <h3 className="text-xl font-black tracking-tight">
                                {submitProgress === 100 ? '¡Registro Oficial Completado!' : 'Enviando Registro Nacional'}
                            </h3>
                            <p className="text-blue-200 text-xs mt-1">
                                Movimiento Misionero Mundial en Venezuela
                            </p>
                        </div>

                        <CardContent className="p-6 sm:p-8 space-y-6">
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

                                    <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 border border-slate-200 overflow-hidden shadow-inner">
                                        <div
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300 shadow-sm"
                                            style={{ width: `${submitProgress}%` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5 text-center">
                                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2">
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-emerald-800 font-bold mb-0.5">
                                                Código Ministerial Asignado
                                            </p>
                                            <span className="font-mono text-2xl font-black text-emerald-950 tracking-tight">
                                                {submittedResult?.codigo}
                                            </span>
                                        </div>

                                        <p className="text-sm text-emerald-900 font-bold">
                                            Pastor: {submittedResult?.nombre}
                                        </p>

                                        {submittedResult?.iglesia && (
                                            <div className="pt-1 border-t border-emerald-200/80">
                                                <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold">
                                                    Iglesia / Extensión Vinculada
                                                </p>
                                                <p className="text-xs font-bold text-emerald-950">
                                                    {submittedResult?.iglesia}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-slate-600 text-xs leading-relaxed">
                                        {submittedResult?.mensaje}
                                    </p>

                                    <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                                        <Button
                                            type="button"
                                            onClick={() => router.get('/registro')}
                                            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-md text-sm"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Realizar Otro Registro
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Topbar Institucional */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
                <div className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                        <img
                            src="/icons/logo_mmm-a-color-sin-fondo.png"
                            alt="Logo MMM Venezuela"
                            className="h-11 w-11 sm:h-14 sm:w-14 object-contain shrink-0 drop-shadow-xs"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/icons/logo_mmm.png';
                            }}
                        />
                        <div>
                            <h1 className="font-black text-sm sm:text-lg text-slate-900 leading-tight">
                                IGLESIA CRISTIANA PENTECOSTÉS DE VENEZUELA
                            </h1>
                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                                Movimiento Misionero Mundial
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Indicador de Auto-Save */}
                        {lastSavedTime && (
                            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
                                {isSavingDraft ? (
                                    <>
                                        <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                                        <span className="text-xs font-medium text-slate-600">Guardando borrador...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span className="text-xs font-medium text-slate-600">Borrador guardado ({lastSavedTime})</span>
                                    </>
                                )}
                            </div>
                        )}

                        <Badge variant="outline" className="hidden md:inline-flex border-blue-200 text-blue-800 bg-blue-50 py-1.5 px-3.5 text-xs font-semibold">
                            <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-600" />
                            Portal Oficial MMM
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="flex-1 w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8">
                {submittedResult ? (
                    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <Card className="bg-white border-slate-200 shadow-xl rounded-3xl overflow-hidden text-center">
                            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-8 text-white relative">
                                <div className="mx-auto w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-4 backdrop-blur-xs shadow-inner">
                                    <CheckCircle2 className="w-12 h-12 text-white" />
                                </div>
                                <Badge className="bg-white/20 text-white hover:bg-white/30 text-xs font-bold px-3.5 py-1 rounded-full mb-2">
                                    <ShieldCheck className="w-4 h-4 mr-1.5 inline" /> Registro Confirmado y Guardado
                                </Badge>
                                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
                                    ¡Ficha Ministerial Registrada!
                                </h2>
                                <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                                    Movimiento Misionero Mundial en Venezuela
                                </p>
                            </div>

                            <CardContent className="p-6 sm:p-8 space-y-6 text-slate-800">
                                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">
                                            Código Ministerial Asignado
                                        </p>
                                        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
                                            <span className="font-mono text-2xl font-black text-blue-900 tracking-wider">
                                                {submittedResult.codigo}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200/70 text-left">
                                        <div>
                                            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                                                Pastor(a)
                                            </p>
                                            <p className="text-sm font-bold text-slate-900">
                                                {submittedResult.nombre}
                                            </p>
                                        </div>

                                        {submittedResult.iglesia && (
                                            <div>
                                                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                                                    Iglesia / Extensión
                                                </p>
                                                <p className="text-sm font-bold text-slate-900">
                                                    {submittedResult.iglesia}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 text-xs sm:text-sm flex items-start gap-3 text-left">
                                    <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <p className="leading-relaxed font-medium">
                                        {submittedResult.mensaje || 'Sus datos y fotografías fueron almacenados exitosamente en la base de datos nacional y han sido notificados al presbiterio correspondiente.'}
                                    </p>
                                </div>

                                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setSubmittedResult(null);
                                            window.location.href = '/registro';
                                        }}
                                        className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl shadow-md text-sm"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Registrar Otro Pastor / Extensión
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <>
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
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                                        <Sparkles className="w-6 h-6 text-blue-600" />
                                        Registro Unificado de Pastor & Extensión
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                        {data.tiene_extension
                                            ? 'Complete los 8 pasos de la ficha ministerial y los datos de su Iglesia / Extensión.'
                                            : 'Complete los 5 pasos de su ficha ministerial personal.'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    {activeTab > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setActiveTab(activeTab - 1);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="border-slate-300 text-slate-700 hover:bg-slate-50 flex-1 md:flex-initial font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                                            Anterior
                                        </Button>
                                    )}
                                    {activeTab < (data.tiene_extension ? 8 : 5) ? (
                                        <Button
                                            type="button"
                                            onClick={() => handleNextStep(activeTab)}
                                            className="bg-blue-700 hover:bg-blue-800 text-white font-bold flex-1 md:flex-initial shadow-md text-xs sm:text-sm py-2.5 px-6 rounded-xl"
                                        >
                                            Siguiente
                                            <ArrowRight className="w-4 h-4 ml-1.5" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={processing}
                                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-black flex-1 md:flex-initial shadow-lg text-xs sm:text-sm py-2.5 px-6 rounded-xl transition-all"
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                            Finalizar Registro
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Barra de Pasos */}
                            <div className="space-y-3">
                                {/* Versión Móvil */}
                                <div className="block sm:hidden bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="font-bold text-blue-700 text-sm">
                                            Paso {activeTab} de {data.tiene_extension ? 8 : 5}: {steps[activeTab - 1]?.title}
                                        </span>
                                        <span className="font-mono font-bold text-slate-600">
                                            {Math.round((activeTab / (data.tiene_extension ? 8 : 5)) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                                            style={{ width: `${(activeTab / (data.tiene_extension ? 8 : 5)) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Grid de Pasos */}
                                <div className={`flex gap-3 overflow-x-auto pb-1 sm:pb-0 sm:grid ${data.tiene_extension ? 'sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8' : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'} scrollbar-thin`}>
                                    {(data.tiene_extension ? steps : steps.filter((s) => s.id <= 5)).map((step) => {
                                        const Icon = step.icon;
                                        const isActive = activeTab === step.id;
                                        const isCompleted = activeTab > step.id;

                                        return (
                                            <button
                                                key={step.id}
                                                type="button"
                                                onClick={() => handleTabClick(step.id)}
                                                className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all text-left min-w-[165px] sm:min-w-0 shrink-0 sm:shrink ${isActive
                                                    ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-600/20 shadow-sm'
                                                    : isCompleted
                                                        ? 'bg-white border-emerald-300 hover:border-emerald-400'
                                                        : 'bg-white border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div
                                                    className={`flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl shrink-0 font-bold text-xs sm:text-sm ${isActive
                                                        ? 'bg-blue-700 text-white shadow-xs'
                                                        : isCompleted
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-slate-100 text-slate-500'
                                                        }`}
                                                >
                                                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
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
                                <Card className="bg-white border-slate-200 shadow-md text-slate-800 rounded-3xl">
                                    <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-6 sm:p-8 rounded-t-3xl">
                                        <div className="flex items-center gap-3 text-blue-900 font-black text-lg sm:text-xl">
                                            <User className="h-6 w-6 text-blue-600" />
                                            <span>Paso 1: Información Personal, Cónyuge y Ubicación</span>
                                        </div>
                                        <CardDescription className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                                            Ingrese sus datos de identidad, datos del cónyuge para vinculación ministerial y su dirección.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8 lg:p-10 space-y-8">
                                        {/* Fila 1: Nombres, Apellidos, Cédula, Género */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">


                                            <div>
                                                <div className="h-5 flex items-center justify-between">
                                                    <Label htmlFor="numero_documento" className="text-xs font-bold uppercase text-slate-700 flex items-center">
                                                        Cédula de Identidad <span className="text-rose-500 ml-0.5">*</span>
                                                    </Label>
                                                    {isCheckingCedula && (
                                                        <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                                                            <Loader2 className="w-3 h-3 animate-spin" /> Verificando...
                                                        </span>
                                                    )}
                                                </div>

                                                <div className={`mt-1 flex items-center w-full h-10 border rounded-md shadow-xs overflow-hidden transition-all ${isFieldVisibleError('numero_documento', 1) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 bg-white focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600'}`}>
                                                    <Select
                                                        value={data.tipo_documento || 'V'}
                                                        onValueChange={(val) => {
                                                            markFieldTouched('numero_documento');
                                                            setData((prev) => ({
                                                                ...prev,
                                                                tipo_documento: val,
                                                                documento: `${val}-${prev.numero_documento}`,
                                                            }));
                                                            if (data.numero_documento) {
                                                                checkCedulaDuplicada(`${val}-${data.numero_documento}`);
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-[62px] h-full rounded-none border-0 border-r border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-800 shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-hidden shrink-0">
                                                            <SelectValue placeholder="V" />
                                                        </SelectTrigger>
                                                        <SelectContent className="min-w-[70px] bg-white border-slate-200">
                                                            <SelectItem value="V" className="text-xs font-bold">V</SelectItem>
                                                            <SelectItem value="E" className="text-xs font-bold">E</SelectItem>
                                                            <SelectItem value="P" className="text-xs font-bold">P</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <input
                                                        id="numero_documento"
                                                        type="text"
                                                        value={data.numero_documento}
                                                        onChange={(e) => {
                                                            const rawVal = e.target.value;
                                                            const cleanNum = data.tipo_documento === 'P'
                                                                ? rawVal.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
                                                                : rawVal.replace(/\D/g, '');

                                                            markFieldTouched('numero_documento');
                                                            setData((prev) => ({
                                                                ...prev,
                                                                numero_documento: cleanNum,
                                                                documento: `${prev.tipo_documento}-${cleanNum}`,
                                                            }));
                                                            checkCedulaDuplicada(`${data.tipo_documento}-${cleanNum}`);
                                                        }}
                                                        placeholder={data.tipo_documento === 'P' ? 'Ej. PAS123456' : 'Ej. 12345678'}
                                                        className="flex-1 h-full min-w-0 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden border-0 shadow-none"
                                                    />
                                                </div>

                                                {isFieldVisibleError('numero_documento', 1) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('numero_documento', 1)}
                                                    </p>
                                                )}

                                                {cedulaExistenteNombre && (
                                                    <div className="mt-1 p-1.5 bg-emerald-50 border border-emerald-200 rounded-md text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                                                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                        <span>Ficha encontrada: <b>{cedulaExistenteNombre}</b> (Modo Edición)</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="nombres" className="text-xs font-bold uppercase text-slate-700 h-5 flex items-center">
                                                    Nombres <span className="text-rose-500 ml-0.5">*</span>
                                                </Label>
                                                <Input
                                                    id="nombres"
                                                    value={data.nombres}
                                                    onChange={(e) => {
                                                        markFieldTouched('nombres');
                                                        setData('nombres', e.target.value);
                                                    }}
                                                    placeholder="Ej. Juan Carlos"
                                                    className={`mt-1 h-10 bg-white text-slate-900 ${isFieldVisibleError('nombres', 1) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                />
                                                {isFieldVisibleError('nombres', 1) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('nombres', 1)}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="apellidos" className="text-xs font-bold uppercase text-slate-700 h-5 flex items-center">
                                                    Apellidos <span className="text-rose-500 ml-0.5">*</span>
                                                </Label>
                                                <Input
                                                    id="apellidos"
                                                    value={data.apellidos}
                                                    onChange={(e) => {
                                                        markFieldTouched('apellidos');
                                                        setData('apellidos', e.target.value);
                                                    }}
                                                    placeholder="Ej. Pérez Rodríguez"
                                                    className={`mt-1 h-10 bg-white text-slate-900 ${isFieldVisibleError('apellidos', 1) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                />
                                                {isFieldVisibleError('apellidos', 1) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('apellidos', 1)}
                                                    </p>
                                                )}
                                            </div>


                                            <div>
                                                <Label htmlFor="genero" className="text-xs font-bold uppercase text-slate-700 h-5 flex items-center">
                                                    Género <span className="text-rose-500 ml-0.5">*</span>
                                                </Label>
                                                <Select2
                                                    id="genero"
                                                    options={generoOptions}
                                                    value={data.genero}
                                                    onChange={(val) => {
                                                        markFieldTouched('genero');
                                                        setData('genero', val);
                                                    }}
                                                    placeholder="Seleccione Género"
                                                    className="mt-1"
                                                />
                                                {isFieldVisibleError('genero', 1) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('genero', 1)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Fila 2: Fecha de Nacimiento, Edad, Estado Civil */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                            <div>
                                                <Label htmlFor="fe_nacimiento" className="text-xs font-bold uppercase text-slate-700 h-5 flex items-center">
                                                    Fecha de Nacimiento <span className="text-rose-500 ml-0.5">*</span>
                                                </Label>
                                                <Input
                                                    id="fe_nacimiento"
                                                    type="date"
                                                    value={data.fe_nacimiento}
                                                    onChange={handleBirthDateChange}
                                                    className={`mt-1 h-10 bg-white text-slate-900 ${isFieldVisibleError('fe_nacimiento', 1) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                />
                                                {isFieldVisibleError('fe_nacimiento', 1) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('fe_nacimiento', 1)}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="edad" className="text-xs font-bold uppercase text-slate-700 h-5 flex items-center">
                                                    Edad (Años)
                                                </Label>
                                                <Input
                                                    id="edad"
                                                    type="number"
                                                    readOnly
                                                    value={data.edad}
                                                    placeholder="Automático"
                                                    className="mt-1 h-10 bg-slate-100 border-slate-300 text-slate-700 cursor-not-allowed font-bold"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="estado_civil" className="text-xs font-bold uppercase text-slate-700 h-5 flex items-center">
                                                    Estado Civil <span className="text-rose-500 ml-0.5">*</span>
                                                </Label>
                                                <Select2
                                                    id="estado_civil"
                                                    options={estadoCivilOptions}
                                                    value={data.estado_civil}
                                                    onChange={(val) => {
                                                        markFieldTouched('estado_civil');
                                                        setData('estado_civil', val);
                                                    }}
                                                    placeholder="Seleccione Estado Civil"
                                                    className="mt-1"
                                                />
                                                {isFieldVisibleError('estado_civil', 1) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('estado_civil', 1)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bloque Condicional de Cónyuge */}
                                        {esCasado && (
                                            <div className="bg-blue-50/50 p-4 sm:p-5 rounded-2xl border border-blue-200 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs uppercase font-bold text-blue-900 tracking-wider flex items-center gap-1.5">
                                                        <User className="w-4 h-4 text-blue-600" />
                                                        Datos del Cónyuge Ministerial
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold text-slate-700">¿Es Pastor/Pastora?</span>
                                                        <Switch
                                                            checked={data.conyuge_pastorea}
                                                            onCheckedChange={(checked) => setData('conyuge_pastorea', checked)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="nombre_conyuge" className="text-xs font-bold uppercase text-slate-700">
                                                            Nombre Completo del Cónyuge <span className="text-rose-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="nombre_conyuge"
                                                            value={data.nombre_conyuge}
                                                            onChange={(e) => {
                                                                markFieldTouched('nombre_conyuge');
                                                                setData('nombre_conyuge', e.target.value);
                                                            }}
                                                            placeholder="Ej. Carmen Elena de Pérez"
                                                            className={`mt-1 h-10 bg-white text-slate-900 ${isFieldVisibleError('nombre_conyuge', 1) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                        />
                                                        {isFieldVisibleError('nombre_conyuge', 1) && (
                                                            <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                                {isFieldVisibleError('nombre_conyuge', 1)}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {data.conyuge_pastorea && (
                                                        <div>
                                                            <Label htmlFor="numero_documento_conyuge" className="text-xs font-bold uppercase text-slate-700">
                                                                Cédula de Identidad del Cónyuge <span className="text-rose-500">*</span>
                                                            </Label>

                                                            <div className={`mt-1 flex items-center w-full h-10 border rounded-md shadow-xs overflow-hidden transition-all ${isFieldVisibleError('numero_documento_conyuge', 1) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 bg-white focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600'}`}>
                                                                <Select
                                                                    value={data.tipo_documento_conyuge || 'V'}
                                                                    onValueChange={(val) => {
                                                                        markFieldTouched('numero_documento_conyuge');
                                                                        setData((prev) => ({
                                                                            ...prev,
                                                                            tipo_documento_conyuge: val,
                                                                            cedula_conyuge: `${val}-${prev.numero_documento_conyuge}`,
                                                                        }));
                                                                        if (data.numero_documento_conyuge) {
                                                                            checkConyugeCedula(`${val}-${data.numero_documento_conyuge}`);
                                                                        }
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="w-[62px] h-full rounded-none border-0 border-r border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-800 shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-hidden shrink-0">
                                                                        <SelectValue placeholder="V" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="min-w-[70px] bg-white border-slate-200">
                                                                        <SelectItem value="V" className="text-xs font-bold">V</SelectItem>
                                                                        <SelectItem value="E" className="text-xs font-bold">E</SelectItem>
                                                                        <SelectItem value="P" className="text-xs font-bold">P</SelectItem>
                                                                    </SelectContent>
                                                                </Select>

                                                                <input
                                                                    id="numero_documento_conyuge"
                                                                    type="text"
                                                                    value={data.numero_documento_conyuge}
                                                                    onChange={(e) => {
                                                                        const rawVal = e.target.value;
                                                                        const cleanNum = data.tipo_documento_conyuge === 'P'
                                                                            ? rawVal.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
                                                                            : rawVal.replace(/\D/g, '');

                                                                        markFieldTouched('numero_documento_conyuge');
                                                                        setData((prev) => ({
                                                                            ...prev,
                                                                            numero_documento_conyuge: cleanNum,
                                                                            cedula_conyuge: `${prev.tipo_documento_conyuge}-${cleanNum}`,
                                                                        }));
                                                                        checkConyugeCedula(`${data.tipo_documento_conyuge}-${cleanNum}`);
                                                                    }}
                                                                    placeholder={data.tipo_documento_conyuge === 'P' ? 'Ej. PAS987654' : 'Ej. 98765432'}
                                                                    className="flex-1 h-full min-w-0 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden border-0 shadow-none"
                                                                />
                                                            </div>

                                                            {isFieldVisibleError('numero_documento_conyuge', 1) && (
                                                                <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                                    <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                                    {isFieldVisibleError('numero_documento_conyuge', 1)}
                                                                </p>
                                                            )}

                                                            {conyugeExtensionData && (
                                                                <div className="mt-1 p-1.5 bg-emerald-50 border border-emerald-200 rounded-md text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                                                                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                                    <span>Iglesia detectada: <b>{conyugeExtensionData.nombre}</b> (Se vinculará sin duplicar)</span>
                                                                </div>
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
                                                    value={data.telefono_tlf}
                                                    onChange={(e) => {
                                                        markFieldTouched('telefono_tlf');
                                                        setData('telefono_tlf', e.target.value);
                                                    }}
                                                    placeholder="0414-1234567"
                                                    className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('telefono_tlf', 1) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                />
                                                {isFieldVisibleError('telefono_tlf', 1) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('telefono_tlf', 1)}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="telefono_hab" className="text-xs font-bold uppercase text-slate-700">
                                                    Teléfono de Habitación / Fijo <span className="text-slate-400 font-normal text-[10px] lowercase">(opcional)</span>
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
                                                    Correo Electrónico <span className="text-rose-500">*</span>
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => {
                                                        markFieldTouched('email');
                                                        setData('email', e.target.value);
                                                    }}
                                                    placeholder="pastor@ejemplo.com"
                                                    className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('email', 1) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                />
                                                {isFieldVisibleError('email', 1) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('email', 1)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Fila 4: Dirección Territorial Pastor */}
                                        <div className="border-t border-slate-200 pt-5">
                                            <h4 className="text-xs uppercase font-bold text-blue-900 tracking-wider mb-3 flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-blue-600" />
                                                Dirección y Residencia Personal del Pastor
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
                                                    {isFieldVisibleError('estado_id', 1) && (
                                                        <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                            {isFieldVisibleError('estado_id', 1)}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="municipio_id" className="text-xs font-bold uppercase text-slate-700">
                                                            Municipio <span className="text-rose-500">*</span>
                                                        </Label>
                                                        {data.estado_id && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openAddMunicipioModal('pastor')}
                                                                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-0.5"
                                                            >
                                                                <Plus className="w-3 h-3" /> Agregar
                                                            </button>
                                                        )}
                                                    </div>
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
                                                    {isFieldVisibleError('municipio_id', 1) && (
                                                        <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                            {isFieldVisibleError('municipio_id', 1)}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="parroquia_id" className="text-xs font-bold uppercase text-slate-700">
                                                            Parroquia <span className="text-rose-500">*</span>
                                                        </Label>
                                                        {data.municipio_id && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openAddParroquiaModal('pastor')}
                                                                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-0.5"
                                                            >
                                                                <Plus className="w-3 h-3" /> Agregar
                                                            </button>
                                                        )}
                                                    </div>
                                                    <Select2
                                                        id="parroquia_id"
                                                        options={parroquiaOptions}
                                                        value={data.parroquia_id}
                                                        onChange={(val) => {
                                                            markFieldTouched('parroquia_id');
                                                            setData('parroquia_id', val);
                                                        }}
                                                        disabled={!data.municipio_id}
                                                        placeholder={data.municipio_id ? "Seleccione Parroquia" : "Primero seleccione Municipio"}
                                                        searchPlaceholder="Buscar parroquia..."
                                                        className="mt-1"
                                                    />
                                                    {isFieldVisibleError('parroquia_id', 1) && (
                                                        <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                            {isFieldVisibleError('parroquia_id', 1)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div>
                                                    <Label htmlFor="urbanizacion" className="text-xs font-bold uppercase text-slate-700">
                                                        Sector / Urbanización <span className="text-rose-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="urbanizacion"
                                                        value={data.urbanizacion}
                                                        onChange={(e) => {
                                                            markFieldTouched('urbanizacion');
                                                            setData('urbanizacion', e.target.value);
                                                        }}
                                                        placeholder="Ej. Urb. La Concordia"
                                                        className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('urbanizacion', 1) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                    />
                                                    {isFieldVisibleError('urbanizacion', 1) && (
                                                        <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                            {isFieldVisibleError('urbanizacion', 1)}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="calle_avenida" className="text-xs font-bold uppercase text-slate-700">
                                                        Calle / Avenida <span className="text-rose-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="calle_avenida"
                                                        value={data.calle_avenida}
                                                        onChange={(e) => {
                                                            markFieldTouched('calle_avenida');
                                                            setData('calle_avenida', e.target.value);
                                                        }}
                                                        placeholder="Ej. Av. Principal"
                                                        className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('calle_avenida', 1) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                    />
                                                    {isFieldVisibleError('calle_avenida', 1) && (
                                                        <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                            {isFieldVisibleError('calle_avenida', 1)}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="edificio_casa_quinta" className="text-xs font-bold uppercase text-slate-700">
                                                        Casa / Edificio / Quinta <span className="text-rose-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="edificio_casa_quinta"
                                                        value={data.edificio_casa_quinta}
                                                        onChange={(e) => {
                                                            markFieldTouched('edificio_casa_quinta');
                                                            setData('edificio_casa_quinta', e.target.value);
                                                        }}
                                                        placeholder="Ej. Casa N° 12-A"
                                                        className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('edificio_casa_quinta', 1) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                    />
                                                    {isFieldVisibleError('edificio_casa_quinta', 1) && (
                                                        <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                            {isFieldVisibleError('edificio_casa_quinta', 1)}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="piso" className="text-xs font-bold uppercase text-slate-700">
                                                        Piso / Apto <span className="text-slate-400 font-normal text-[10px] lowercase">(opcional)</span>
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
                                            onClick={() => handleNextStep(1)}
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
                                <Card className="bg-white border-slate-200 shadow-md text-slate-800 rounded-3xl">
                                    <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-6 sm:p-8 rounded-t-3xl">
                                        <div className="flex items-center gap-3 text-blue-900 font-black text-lg sm:text-xl">
                                            <GraduationCap className="h-6 w-6 text-blue-600" />
                                            <span>Paso 2: Formación Académica & Estudios Teológicos</span>
                                        </div>
                                        <CardDescription className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                                            Nivel de instrucción académica secular y preparación teológica o bíblica.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8 lg:p-10 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="grado_instruccion" className="text-xs font-bold uppercase text-slate-700">
                                                    Grado de Instrucción Académica <span className="text-rose-500">*</span>
                                                </Label>
                                                <Select2
                                                    id="grado_instruccion"
                                                    options={gradoInstruccionOptions}
                                                    value={data.grado_instruccion}
                                                    onChange={(val) => {
                                                        markFieldTouched('grado_instruccion');
                                                        setData('grado_instruccion', val);
                                                    }}
                                                    placeholder="Seleccione Grado de Instrucción"
                                                    className="mt-1"
                                                />
                                                {isFieldVisibleError('grado_instruccion', 2) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('grado_instruccion', 2)}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="titulo_obtenido" className="text-xs font-bold uppercase text-slate-700">
                                                    Título Secular Obtenido <span className="text-rose-500">*</span>
                                                </Label>
                                                <Input
                                                    id="titulo_obtenido"
                                                    value={data.titulo_obtenido}
                                                    onChange={(e) => {
                                                        markFieldTouched('titulo_obtenido');
                                                        setData('titulo_obtenido', e.target.value);
                                                    }}
                                                    placeholder="Ej. Lic. en Educación, Ing. Civil, Bachiller"
                                                    className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('titulo_obtenido', 2) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                />
                                                {isFieldVisibleError('titulo_obtenido', 2) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('titulo_obtenido', 2)}
                                                    </p>
                                                )}
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
                                                            Título Teológico <span className="text-rose-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="titulo_teologico"
                                                            value={data.titulo_teologico}
                                                            onChange={(e) => {
                                                                markFieldTouched('titulo_teologico');
                                                                setData('titulo_teologico', e.target.value);
                                                            }}
                                                            placeholder="Ej. Bachiller en Teología"
                                                            className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('titulo_teologico', 2) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                        />
                                                        {isFieldVisibleError('titulo_teologico', 2) && (
                                                            <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                                {isFieldVisibleError('titulo_teologico', 2)}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="instituto_teologico" className="text-xs font-bold uppercase text-slate-700">
                                                            Instituto / Seminario <span className="text-rose-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="instituto_teologico"
                                                            value={data.instituto_teologico}
                                                            onChange={(e) => {
                                                                markFieldTouched('instituto_teologico');
                                                                setData('instituto_teologico', e.target.value);
                                                            }}
                                                            placeholder="Ej. Instituto Bíblico Elim"
                                                            className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('instituto_teologico', 2) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                        />
                                                        {isFieldVisibleError('instituto_teologico', 2) && (
                                                            <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                                {isFieldVisibleError('instituto_teologico', 2)}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="tiempo_de_estudio_teologico" className="text-xs font-bold uppercase text-slate-700">
                                                            Tiempo de Estudio <span className="text-rose-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="tiempo_de_estudio_teologico"
                                                            value={data.tiempo_de_estudio_teologico}
                                                            onChange={(e) => {
                                                                markFieldTouched('tiempo_de_estudio_teologico');
                                                                setData('tiempo_de_estudio_teologico', e.target.value);
                                                            }}
                                                            placeholder="Ej. 3 Años"
                                                            className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('tiempo_de_estudio_teologico', 2) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                        />
                                                        {isFieldVisibleError('tiempo_de_estudio_teologico', 2) && (
                                                            <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                                {isFieldVisibleError('tiempo_de_estudio_teologico', 2)}
                                                            </p>
                                                        )}
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
                                            onClick={() => handleNextStep(2)}
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
                                <Card className="bg-white border-slate-200 shadow-md text-slate-800 rounded-3xl">
                                    <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-6 sm:p-8 rounded-t-3xl">
                                        <div className="flex items-center gap-3 text-blue-900 font-black text-lg sm:text-xl">
                                            <Cross className="h-6 w-6 text-blue-600" />
                                            <span>Paso 3: Trayectoria y Datos Eclesiásticos</span>
                                        </div>
                                        <CardDescription className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                                            Grado ministerial, zona, distrito y responsabilidades dentro de la obra.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8 lg:p-10 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="nivel_ministerial" className="text-xs font-bold uppercase text-slate-700">
                                                    Grado Ministerial <span className="text-rose-500">*</span>
                                                </Label>
                                                <Select2
                                                    id="nivel_ministerial"
                                                    options={nivelMinisterialOptions}
                                                    value={data.nivel_ministerial}
                                                    onChange={(val) => {
                                                        markFieldTouched('nivel_ministerial');
                                                        setData('nivel_ministerial', val);
                                                    }}
                                                    placeholder="Seleccione Grado Ministerial"
                                                    className="mt-1"
                                                />
                                                {isFieldVisibleError('nivel_ministerial', 3) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('nivel_ministerial', 3)}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="zona" className="text-xs font-bold uppercase text-slate-700">
                                                    Zona <span className="text-rose-500">*</span>
                                                </Label>
                                                <Input
                                                    id="zona"
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={data.zona}
                                                    onChange={(e) => {
                                                        const clean = e.target.value.replace(/\D/g, '');
                                                        markFieldTouched('zona');
                                                        setData((prev) => ({
                                                            ...prev,
                                                            zona: clean,
                                                            extension_zona: prev.extension_zona || clean,
                                                        }));
                                                    }}
                                                    placeholder="Ej. 1"
                                                    className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('zona', 3) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                />
                                                {isFieldVisibleError('zona', 3) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('zona', 3)}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="distrito" className="text-xs font-bold uppercase text-slate-700">
                                                    Distrito <span className="text-rose-500">*</span>
                                                </Label>
                                                <Select2
                                                    id="distrito"
                                                    options={distritoOptions}
                                                    value={data.distrito ? String(data.distrito).replace(/\D/g, '') : ''}
                                                    onChange={(val) => {
                                                        markFieldTouched('distrito');
                                                        setData((prev) => ({
                                                            ...prev,
                                                            distrito: val,
                                                            extension_distrito: prev.extension_distrito || val,
                                                        }));
                                                    }}
                                                    placeholder="Seleccione Distrito (1 al 5)"
                                                    className="mt-1"
                                                />
                                                {isFieldVisibleError('distrito', 3) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('distrito', 3)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="ano_promocion" className="text-xs font-bold uppercase text-slate-700">
                                                    Año de Promoción / Ordenación <span className="text-rose-500">*</span>
                                                </Label>
                                                <Input
                                                    id="ano_promocion"
                                                    value={data.ano_promocion}
                                                    onChange={(e) => {
                                                        markFieldTouched('ano_promocion');
                                                        setData('ano_promocion', e.target.value);
                                                    }}
                                                    placeholder="Ej. 2018"
                                                    className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('ano_promocion', 3) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                />
                                                {isFieldVisibleError('ano_promocion', 3) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('ano_promocion', 3)}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="tiempo_colaborando" className="text-xs font-bold uppercase text-slate-700">
                                                    Tiempo en el Ministerio <span className="text-rose-500">*</span>
                                                </Label>
                                                <Input
                                                    id="tiempo_colaborando"
                                                    value={data.tiempo_colaborando}
                                                    onChange={(e) => {
                                                        markFieldTouched('tiempo_colaborando');
                                                        setData('tiempo_colaborando', e.target.value);
                                                    }}
                                                    placeholder="Ej. 12 Años y 4 Meses"
                                                    className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('tiempo_colaborando', 3) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                />
                                                {isFieldVisibleError('tiempo_colaborando', 3) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('tiempo_colaborando', 3)}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="cargo_nacional" className="text-xs font-bold uppercase text-slate-700">
                                                    Cargo Nacional / Responsabilidad <span className="text-rose-500">*</span>
                                                </Label>
                                                <Input
                                                    id="cargo_nacional"
                                                    value={data.cargo_nacional}
                                                    onChange={(e) => {
                                                        markFieldTouched('cargo_nacional');
                                                        setData('cargo_nacional', e.target.value);
                                                    }}
                                                    placeholder="Ej. Supervisor de Zona / Presbítero"
                                                    className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('cargo_nacional', 3) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                />
                                                {isFieldVisibleError('cargo_nacional', 3) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('cargo_nacional', 3)}
                                                    </p>
                                                )}
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
                                                Observaciones o Notas Ministeriales <span className="text-slate-400 font-normal text-[10px] lowercase">(opcional)</span>
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
                                            onClick={() => handleNextStep(3)}
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
                                <Card className="bg-white border-slate-200 shadow-md text-slate-800 rounded-3xl">
                                    <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-6 sm:p-8 rounded-t-3xl">
                                        <div className="flex items-center gap-3 text-blue-900 font-black text-lg sm:text-xl">
                                            <Stethoscope className="h-6 w-6 text-blue-600" />
                                            <span>Paso 4: Ficha de Salud & Contacto de Emergencia</span>
                                        </div>
                                        <CardDescription className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                                            Datos médicos vitales para atención preventiva y asistencia en eventos nacionales.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8 lg:p-10 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="grupo_sanguineo" className="text-xs font-bold uppercase text-slate-700">
                                                    Grupo Sanguíneo <span className="text-rose-500">*</span>
                                                </Label>
                                                <Select2
                                                    id="grupo_sanguineo"
                                                    options={grupoSanguineoOptions}
                                                    value={data.grupo_sanguineo}
                                                    onChange={(val) => {
                                                        markFieldTouched('grupo_sanguineo');
                                                        setData('grupo_sanguineo', val);
                                                    }}
                                                    placeholder="Seleccione Grupo"
                                                    className="mt-1"
                                                />
                                                {isFieldVisibleError('grupo_sanguineo', 4) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('grupo_sanguineo', 4)}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="condicion_salud" className="text-xs font-bold uppercase text-slate-700">
                                                    Condición General de Salud <span className="text-rose-500">*</span>
                                                </Label>
                                                <Select2
                                                    id="condicion_salud"
                                                    options={condicionSaludOptions}
                                                    value={data.condicion_salud}
                                                    onChange={(val) => {
                                                        markFieldTouched('condicion_salud');
                                                        setData('condicion_salud', val);
                                                    }}
                                                    placeholder="Seleccione Condición"
                                                    className="mt-1"
                                                />
                                                {isFieldVisibleError('condicion_salud', 4) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('condicion_salud', 4)}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="alergias" className="text-xs font-bold uppercase text-slate-700">
                                                    Alergias Conocidas <span className="text-rose-500">*</span>
                                                </Label>
                                                <Input
                                                    id="alergias"
                                                    value={data.alergias}
                                                    onChange={(e) => {
                                                        markFieldTouched('alergias');
                                                        setData('alergias', e.target.value);
                                                    }}
                                                    placeholder="Ej. Ninguna, polen, penicilina"
                                                    className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('alergias', 4) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                />
                                                {isFieldVisibleError('alergias', 4) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('alergias', 4)}
                                                    </p>
                                                )}
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
                                                    <div>
                                                        <Textarea
                                                            rows={2}
                                                            value={data.enfermedades_cronicas}
                                                            onChange={(e) => {
                                                                markFieldTouched('enfermedades_cronicas');
                                                                setData('enfermedades_cronicas', e.target.value);
                                                            }}
                                                            placeholder="Describa el diagnóstico o enfermedad crónica..."
                                                            className={`bg-white text-slate-900 ${isFieldVisibleError('enfermedades_cronicas', 4) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                        />
                                                        {isFieldVisibleError('enfermedades_cronicas', 4) && (
                                                            <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                                {isFieldVisibleError('enfermedades_cronicas', 4)}
                                                            </p>
                                                        )}
                                                    </div>
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

                                                        {isFieldVisibleError('medicamentos_recetados', 4) && (
                                                            <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                                {isFieldVisibleError('medicamentos_recetados', 4)}
                                                            </p>
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
                                                        Nombre del Contacto <span className="text-rose-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="contacto_emergencia_nombre"
                                                        value={data.contacto_emergencia_nombre}
                                                        onChange={(e) => {
                                                            markFieldTouched('contacto_emergencia_nombre');
                                                            setData('contacto_emergencia_nombre', e.target.value);
                                                        }}
                                                        placeholder="Ej. María Pérez (Esposa / Familiar)"
                                                        className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('contacto_emergencia_nombre', 4) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                    />
                                                    {isFieldVisibleError('contacto_emergencia_nombre', 4) && (
                                                        <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                            {isFieldVisibleError('contacto_emergencia_nombre', 4)}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="contacto_emergencia_telefono" className="text-xs font-bold uppercase text-slate-700">
                                                        Teléfono de Emergencia <span className="text-rose-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="contacto_emergencia_telefono"
                                                        value={data.contacto_emergencia_telefono}
                                                        onChange={(e) => {
                                                            markFieldTouched('contacto_emergencia_telefono');
                                                            setData('contacto_emergencia_telefono', e.target.value);
                                                        }}
                                                        placeholder="Ej. 0412-9876543"
                                                        className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('contacto_emergencia_telefono', 4) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                    />
                                                    {isFieldVisibleError('contacto_emergencia_telefono', 4) && (
                                                        <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                            {isFieldVisibleError('contacto_emergencia_telefono', 4)}
                                                        </p>
                                                    )}
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
                                            onClick={() => handleNextStep(4)}
                                            className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-md text-sm"
                                        >
                                            Siguiente: Fotografías
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )}

                            {/* PASO 5: FOTOGRAFÍA DEL PASTOR Y CÉDULA (OBLIGATORIAS) */}
                            {activeTab === 5 && (
                                <Card className="bg-white border-slate-200 shadow-md text-slate-800 rounded-3xl overflow-hidden">
                                    <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 p-6 sm:p-8 rounded-t-3xl">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-3 text-blue-900 font-black text-lg sm:text-xl">
                                                <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 shadow-xs shrink-0">
                                                    <Camera className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <span>Paso 5: Fotografía Tipo Carnet y Cédula</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Badge className="bg-blue-600 hover:bg-blue-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                                                            <Sparkles className="w-3 h-3 mr-1 inline" /> Captura en Vivo con IA
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 bg-blue-50/80 border border-blue-200/70 rounded-2xl p-3.5 sm:p-4 text-slate-700 text-xs sm:text-sm space-y-1.5 shadow-xs">
                                            <p className="font-bold text-blue-950 flex items-center gap-1.5">
                                                <Sparkles className="w-4 h-4 text-blue-600" />
                                                Instrucciones para la toma de fotografías:
                                            </p>
                                            <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs pl-1">
                                                <li><strong>Foto Tipo Carnet:</strong> Ubíquese de frente en un lugar bien iluminado. Alinee su cabeza en la guía superior y la barbilla en la marca inferior (deben visualizarse cabeza, cuello y hombros).</li>
                                                <li><strong>Cédula de Identidad:</strong> Coloque la cédula sobre una superficie plana y sin reflejos. Encuadre los 4 bordes dentro del recuadro para que el texto sea nítido y legible.</li>
                                            </ul>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8 lg:p-10 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Input oculto para subir archivo de foto */}
                                            <input
                                                ref={fotoInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, 'foto')}
                                            />
                                            {/* Input oculto para subir archivo de cédula */}
                                            <input
                                                ref={fotoCedulaInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, 'foto_cedula')}
                                            />

                                            {/* Fotografía de Perfil / Carnet */}
                                            <div
                                                className={`bg-slate-50/80 p-6 rounded-3xl border-2 flex flex-col items-center text-center space-y-4 transition-all duration-200 ${isFieldVisibleError('foto', 5)
                                                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                                                    : data.foto && !fotoLoadError
                                                        ? 'border-emerald-500/50 bg-emerald-50/10 shadow-sm'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                                                        <User className="w-4 h-4 text-blue-600" />
                                                        Foto de Perfil (Tipo Carnet) <span className="text-rose-500 ml-0.5">*</span>
                                                    </h4>
                                                    {data.foto && !fotoLoadError && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                                            <CheckCircle2 className="w-3 h-3" /> Lista {fotoSizeKb ? `(${fotoSizeKb} KB)` : ''}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Marco de Previsualización Clickeable */}
                                                <div
                                                    onClick={() => fotoInputRef.current?.click()}
                                                    title="Haga clic para seleccionar o tomar foto"
                                                    className={`w-40 h-52 rounded-2xl border-2 border-dashed overflow-hidden flex items-center justify-center relative shadow-inner cursor-pointer transition-all hover:opacity-95 ${data.foto && !fotoLoadError
                                                        ? 'border-emerald-500 bg-slate-900'
                                                        : fotoLoadError
                                                            ? 'border-amber-400 bg-amber-50/40 hover:border-amber-500'
                                                            : isFieldVisibleError('foto', 5)
                                                                ? 'border-rose-400 bg-rose-50/30'
                                                                : 'border-slate-300 bg-white hover:border-blue-400'
                                                        }`}
                                                >
                                                    {data.foto && !fotoLoadError && fotoPreviewUrl ? (
                                                        <img
                                                            src={fotoPreviewUrl}
                                                            alt="Foto Perfil"
                                                            className="w-full h-full object-cover"
                                                            onError={() => setFotoLoadError(true)}
                                                        />
                                                    ) : data.foto && fotoLoadError ? (
                                                        <div className="text-amber-700 text-xs flex flex-col items-center p-3 text-center space-y-1">
                                                            <AlertCircle className="w-8 h-8 text-amber-500 mb-1" />
                                                            <span className="font-bold">Foto no disponible</span>
                                                            <span className="text-[10px] text-slate-500">Toque aquí para seleccionar una foto</span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-slate-400 text-xs flex flex-col items-center p-3 text-center space-y-1">
                                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                                                                <User className="w-6 h-6 opacity-60" />
                                                            </div>
                                                            <span className="font-semibold text-slate-600">Toque para seleccionar</span>
                                                            <span className="text-[10px] text-slate-400">Desde galería o archivo</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Botones de Acción */}
                                                <div className="flex flex-wrap items-center gap-2 w-full justify-center">
                                                    <Button
                                                        type="button"
                                                        onClick={() => fotoInputRef.current?.click()}
                                                        className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-2xl shadow-md h-11 px-4 gap-2 flex-1 transition-transform active:scale-98"
                                                    >
                                                        <Upload className="w-4 h-4 text-blue-200" />
                                                        {data.foto ? 'Cambiar Foto' : 'Seleccionar Foto'}
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => handleOpenBiometricCamera('foto', 'user')}
                                                        className="border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-2xl h-11 px-3 gap-1.5"
                                                        title="Usar cámara web en vivo"
                                                    >
                                                        <Camera className="w-4 h-4 text-slate-500" />
                                                        Cámara
                                                    </Button>

                                                    {data.foto && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setData('foto', '');
                                                                setFotoSizeKb(null);
                                                                setFotoLoadError(false);
                                                            }}
                                                            className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-2xl h-11 px-3"
                                                            title="Eliminar Fotografía"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                {isFieldVisibleError('foto', 5) && (
                                                    <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('foto', 5)}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Fotografía de la Cédula */}
                                            <div
                                                className={`bg-slate-50/80 p-6 rounded-3xl border-2 flex flex-col items-center text-center space-y-4 transition-all duration-200 ${isFieldVisibleError('foto_cedula', 5)
                                                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                                                    : data.foto_cedula && !fotoCedulaLoadError
                                                        ? 'border-emerald-500/50 bg-emerald-50/10 shadow-sm'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                                                        <IdCard className="w-4 h-4 text-blue-600" />
                                                        Foto de la Cédula de Identidad <span className="text-rose-500 ml-0.5">*</span>
                                                    </h4>
                                                    {data.foto_cedula && !fotoCedulaLoadError && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                                            <CheckCircle2 className="w-3 h-3" /> Lista {fotoCedulaSizeKb ? `(${fotoCedulaSizeKb} KB)` : ''}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Marco de Previsualización Cédula Clickeable */}
                                                <div
                                                    onClick={() => fotoCedulaInputRef.current?.click()}
                                                    title="Haga clic para seleccionar o tomar foto de la cédula"
                                                    className={`w-56 h-36 rounded-2xl border-2 border-dashed overflow-hidden flex items-center justify-center relative shadow-inner cursor-pointer transition-all hover:opacity-95 ${data.foto_cedula && !fotoCedulaLoadError
                                                        ? 'border-emerald-500 bg-slate-900'
                                                        : fotoCedulaLoadError
                                                            ? 'border-amber-400 bg-amber-50/40 hover:border-amber-500'
                                                            : isFieldVisibleError('foto_cedula', 5)
                                                                ? 'border-rose-400 bg-rose-50/30'
                                                                : 'border-slate-300 bg-white hover:border-blue-400'
                                                        }`}
                                                >
                                                    {data.foto_cedula && !fotoCedulaLoadError && fotoCedulaPreviewUrl ? (
                                                        <img
                                                            src={fotoCedulaPreviewUrl}
                                                            alt="Cédula"
                                                            className="w-full h-full object-cover"
                                                            onError={() => setFotoCedulaLoadError(true)}
                                                        />
                                                    ) : data.foto_cedula && fotoCedulaLoadError ? (
                                                        <div className="text-amber-700 text-xs flex flex-col items-center p-3 text-center space-y-1">
                                                            <AlertCircle className="w-8 h-8 text-amber-500 mb-1" />
                                                            <span className="font-bold">Cédula no disponible</span>
                                                            <span className="text-[10px] text-slate-500">Toque aquí para seleccionar cédula</span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-slate-400 text-xs flex flex-col items-center p-3 text-center space-y-1">
                                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                                                                <IdCard className="w-6 h-6 opacity-60" />
                                                            </div>
                                                            <span className="font-semibold text-slate-600">Toque para seleccionar</span>
                                                            <span className="text-[10px] text-slate-400">Desde galería o archivo</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Botones de Acción */}
                                                <div className="flex flex-wrap items-center gap-2 w-full justify-center">
                                                    <Button
                                                        type="button"
                                                        onClick={() => fotoCedulaInputRef.current?.click()}
                                                        className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-2xl shadow-md h-11 px-4 gap-2 flex-1 transition-transform active:scale-98"
                                                    >
                                                        <Upload className="w-4 h-4 text-blue-200" />
                                                        {data.foto_cedula ? 'Cambiar Cédula' : 'Seleccionar Cédula'}
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => handleOpenBiometricCamera('foto_cedula', 'environment')}
                                                        className="border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-2xl h-11 px-3 gap-1.5"
                                                        title="Usar cámara web en vivo"
                                                    >
                                                        <Camera className="w-4 h-4 text-slate-500" />
                                                        Cámara
                                                    </Button>

                                                    {data.foto_cedula && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setData('foto_cedula', '');
                                                                setFotoCedulaSizeKb(null);
                                                                setFotoCedulaLoadError(false);
                                                            }}
                                                            className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-2xl h-11 px-3"
                                                            title="Eliminar Fotografía"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                {isFieldVisibleError('foto_cedula', 5) && (
                                                    <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('foto_cedula', 5)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Pregunta: ¿Tiene Extensión / Iglesia a su cargo? */}
                                        <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-slate-50 p-6 rounded-3xl border-2 border-blue-200/90 shadow-xs space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-5 h-5 text-blue-700" />
                                                        <h4 className="font-bold text-base text-slate-900">
                                                            ¿Tiene una Iglesia / Extensión a su cargo? <span className="text-rose-500">*</span>
                                                        </h4>
                                                    </div>
                                                    <p className="text-xs text-slate-600">
                                                        Indique si actualmente pastorea o es responsable de una iglesia/extensión para registrar sus datos geográficos y membresía.
                                                    </p>
                                                </div>

                                                {/* Interruptor de Selección Sí / No */}
                                                <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-inner shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setData('tiene_extension', true);
                                                            if (data.extension_rol_pastor === 'asistente') {
                                                                setData('extension_rol_pastor', 'principal');
                                                            }
                                                        }}
                                                        className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${data.tiene_extension
                                                            ? 'bg-blue-700 text-white shadow-md'
                                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                                            }`}
                                                    >
                                                        <CheckCircle2 className={`w-4 h-4 ${data.tiene_extension ? 'text-white' : 'text-slate-400'}`} />
                                                        SÍ, tengo extensión
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setData('tiene_extension', false);
                                                            setData('extension_rol_pastor', 'asistente');
                                                        }}
                                                        className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${!data.tiene_extension
                                                            ? 'bg-amber-600 text-white shadow-md'
                                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                                            }`}
                                                    >
                                                        <XCircle className={`w-4 h-4 ${!data.tiene_extension ? 'text-white' : 'text-slate-400'}`} />
                                                        NO, sin extensión
                                                    </button>
                                                </div>
                                            </div>

                                            {!data.tiene_extension && (
                                                <div className="bg-amber-50/90 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                                                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                    <span>
                                                        Al seleccionar <strong>"NO"</strong>, solo se registrará su ficha ministerial personal (Pasos 1 al 5). Podrá finalizar y enviar su registro inmediatamente.
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 sm:p-6 bg-slate-50/70 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 rounded-b-2xl">
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

                                        {data.tiene_extension ? (
                                            <Button
                                                type="button"
                                                onClick={() => handleNextStep(5)}
                                                className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-md text-sm"
                                            >
                                                Siguiente: Datos de la Iglesia
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={handleSubmit}
                                                disabled={processing}
                                                className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl text-sm transition-all"
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Finalizar y Enviar Registro Ministerial
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            )}

                            {/* PASO 6: DATOS DE LA IGLESIA / EXTENSIÓN */}
                            {activeTab === 6 && (
                                <Card className="bg-white border-slate-200 shadow-md text-slate-800 rounded-3xl">
                                    <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-6 sm:p-8 rounded-t-3xl">
                                        <div className="flex items-center gap-3 text-blue-900 font-black text-lg sm:text-xl">
                                            <Building2 className="h-6 w-6 text-blue-600" />
                                            <span>Paso 6: Información General de la Iglesia / Extensión</span>
                                        </div>
                                        <CardDescription className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                                            Diferencie su rol ministerial en la obra o vincúlese a la extensión de su cónyuge para evitar duplicar registros.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8 lg:p-10 space-y-8">
                                        {/* Selector de Rol Ministerial en la Iglesia / Extensión */}
                                        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                                    <Crown className="w-4 h-4 text-amber-600" />
                                                    ¿Cuál es su rol en esta Iglesia / Extensión?
                                                </Label>
                                                {isCheckingConyugeCedula && (
                                                    <span className="text-xs text-blue-600 flex items-center gap-1">
                                                        <Loader2 className="w-3 h-3 animate-spin" /> Verificando cónyuge...
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                                <button
                                                    type="button"
                                                    onClick={() => setData('extension_rol_pastor', 'principal')}
                                                    className={`w-full p-5 sm:p-6 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${data.extension_rol_pastor === 'principal'
                                                        ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-600/20'
                                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                                        }`}
                                                >
                                                    <div className="w-full">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                                                                <Building2 className="w-5 h-5 text-blue-700 shrink-0" />
                                                                Pastor Principal
                                                            </span>
                                                            {data.extension_rol_pastor === 'principal' && (
                                                                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                                                            Estoy a cargo de la dirección general y registro de esta obra o extensión.
                                                        </p>
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setData('extension_rol_pastor', 'conyuge_principal')}
                                                    className={`w-full p-5 sm:p-6 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${data.extension_rol_pastor === 'conyuge_principal'
                                                        ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-600/20'
                                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                                        }`}
                                                >
                                                    <div className="w-full">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                                                                <Heart className="w-5 h-5 text-emerald-700 shrink-0" />
                                                                Mi Cónyuge es el Pastor Principal
                                                            </span>
                                                            {data.extension_rol_pastor === 'conyuge_principal' && (
                                                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                                                            {data.nombre_conyuge
                                                                ? `Vincularme a la iglesia de ${data.nombre_conyuge} sin duplicar datos.`
                                                                : 'Mi cónyuge ya registró o registrará los datos de la extensión.'}
                                                        </p>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>

                                        {/* CASO 1: CÓNYUGE ES EL PASTOR PRINCIPAL */}
                                        {data.extension_rol_pastor === 'conyuge_principal' && (
                                            <div className="bg-emerald-50 border-2 border-emerald-300 p-6 rounded-2xl space-y-4 animate-in fade-in duration-300">
                                                <div className="flex items-start gap-3.5">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                                                        <CheckCircle2 className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm sm:text-base font-black text-emerald-950">
                                                            Vinculación Automática con la Extensión de su Cónyuge
                                                        </h4>
                                                        <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
                                                            Su ficha ministerial quedará vinculada automáticamente a la obra{' '}
                                                            <b>{data.extension_nombre || 'de su cónyuge'}</b> a cargo de{' '}
                                                            <b>{data.nombre_conyuge || 'su cónyuge'}</b>.
                                                            <span className="block mt-0.5 text-emerald-700 font-medium">
                                                                No es necesario volver a ingresar la dirección, mapa satelital ni estadísticas de congregación para evitar registros duplicados.
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {data.extension_nombre && (
                                                    <div className="bg-white/80 p-4 rounded-xl border border-emerald-200 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                                        <div>
                                                            <span className="font-bold uppercase text-[10px] text-slate-400 block">Iglesia / Extensión</span>
                                                            <span className="font-bold text-slate-900">{data.extension_nombre}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold uppercase text-[10px] text-slate-400 block">Pastor Principal</span>
                                                            <span className="font-bold text-emerald-800">{data.nombre_conyuge || 'Cónyuge'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold uppercase text-[10px] text-slate-400 block">Estado / Municipio</span>
                                                            <span className="font-medium text-slate-800">{selectedExtensionEstadoNombre || 'Registrado'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold uppercase text-[10px] text-slate-400 block">Años de Fundada</span>
                                                            <span className="font-bold text-slate-800">{data.extension_anios_activa ? `${data.extension_anios_activa} años` : 'Registrado'}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-md text-sm"
                                                    >
                                                        <Save className="w-4 h-4 mr-2" />
                                                        {processing ? 'Guardando Registro Completo...' : 'Finalizar y Enviar Registro Ahora'}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* CASO 2: PASTOR ASISTENTE */}
                                        {data.extension_rol_pastor === 'asistente' && (
                                            <div className="bg-indigo-50 border-2 border-indigo-200 p-6 rounded-2xl space-y-4 animate-in fade-in duration-300">
                                                <div className="flex items-start gap-3.5">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                                                        <Users className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm sm:text-base font-black text-indigo-950">
                                                            Pastor Asistente / Sin Extensión a Cargo
                                                        </h4>
                                                        <p className="text-xs sm:text-sm text-indigo-800 mt-1 leading-relaxed">
                                                            Ha indicado que labora como pastor asociado o asistente sin tener una extensión propia a su cargo.
                                                            Su ficha ministerial será registrada con su grado y datos eclesiásticos.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md text-sm"
                                                    >
                                                        <Save className="w-4 h-4 mr-2" />
                                                        {processing ? 'Guardando Registro...' : 'Finalizar y Enviar Registro Ministerial'}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* CASO 3: PASTOR PRINCIPAL (FORMULARIO COMPLETO) */}
                                        {data.extension_rol_pastor === 'principal' && (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <Label htmlFor="extension_nombre" className="text-xs font-bold uppercase text-slate-700">
                                                            Nombre de la Iglesia / Anexo / Extensión <span className="text-rose-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="extension_nombre"
                                                            value={data.extension_nombre}
                                                            onChange={(e) => {
                                                                markFieldTouched('extension_nombre');
                                                                setData('extension_nombre', e.target.value);
                                                            }}
                                                            placeholder="Ej. Iglesia Central MMM Barquisimeto"
                                                            className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('extension_nombre', 6) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                        />
                                                        {isFieldVisibleError('extension_nombre', 6) && (
                                                            <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                                {isFieldVisibleError('extension_nombre', 6)}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="extension_tipo_local_id" className="text-xs font-bold uppercase text-slate-700">
                                                            Tipo de Local / Inmueble <span className="text-rose-500">*</span>
                                                        </Label>
                                                        <Select2
                                                            id="extension_tipo_local_id"
                                                            options={tipoLocalOptions}
                                                            value={data.extension_tipo_local_id}
                                                            onChange={(val) => {
                                                                markFieldTouched('extension_tipo_local_id');
                                                                setData('extension_tipo_local_id', val);
                                                            }}
                                                            placeholder="Seleccione Tipo de Local (Propio, Alquilado...)"
                                                            className="mt-1"
                                                        />
                                                        {isFieldVisibleError('extension_tipo_local_id', 6) && (
                                                            <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                                {isFieldVisibleError('extension_tipo_local_id', 6)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <Label htmlFor="extension_fecha_fundacion" className="text-xs font-bold uppercase text-slate-700">
                                                            Año de Fundación <span className="text-rose-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="extension_fecha_fundacion"
                                                            type="text"
                                                            inputMode="numeric"
                                                            maxLength={4}
                                                            value={data.extension_fecha_fundacion ? (String(data.extension_fecha_fundacion).includes('-') ? String(data.extension_fecha_fundacion).split('-')[0] : data.extension_fecha_fundacion) : ''}
                                                            onChange={handleExtensionAnoFundacionChange}
                                                            placeholder="Ej. 1995"
                                                            className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('extension_fecha_fundacion', 6) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                        />
                                                        {isFieldVisibleError('extension_fecha_fundacion', 6) && (
                                                            <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                                {isFieldVisibleError('extension_fecha_fundacion', 6)}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="extension_anios_activa" className="text-xs font-bold uppercase text-slate-700">
                                                            Años de Fundada
                                                        </Label>
                                                        <Input
                                                            id="extension_anios_activa"
                                                            readOnly
                                                            value={data.extension_anios_activa ? `${data.extension_anios_activa} año(s)` : ''}
                                                            placeholder="Calculado automáticamente"
                                                            className="mt-1 bg-slate-100 border-slate-300 text-slate-700 font-bold cursor-not-allowed"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="extension_tiempo_trabajo" className="text-xs font-bold uppercase text-slate-700">
                                                            Tiempo de Trabajo Activo <span className="text-rose-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="extension_tiempo_trabajo"
                                                            value={data.extension_tiempo_trabajo}
                                                            onChange={(e) => {
                                                                markFieldTouched('extension_tiempo_trabajo');
                                                                setData('extension_tiempo_trabajo', e.target.value);
                                                            }}
                                                            placeholder="Ej. 5 años y 3 meses"
                                                            className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('extension_tiempo_trabajo', 6) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                        />
                                                        {isFieldVisibleError('extension_tiempo_trabajo', 6) && (
                                                            <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                                {isFieldVisibleError('extension_tiempo_trabajo', 6)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor="extension_descripcion" className="text-xs font-bold uppercase text-slate-700">
                                                        Descripción o Reseña de la Obra <span className="text-slate-400 font-normal text-[10px] lowercase">(opcional)</span>
                                                    </Label>
                                                    <Textarea
                                                        id="extension_descripcion"
                                                        rows={2}
                                                        value={data.extension_descripcion}
                                                        onChange={(e) => setData('extension_descripcion', e.target.value)}
                                                        placeholder="Breve reseña sobre el inicio y desarrollo de la obra..."
                                                        className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                    <CardFooter className="p-4 sm:p-6 bg-slate-50/70 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 rounded-b-2xl">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setActiveTab(5);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Anterior: Fotografías
                                        </Button>
                                        {data.extension_rol_pastor === 'principal' ? (
                                            <Button
                                                type="button"
                                                onClick={() => handleNextStep(6)}
                                                className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-md text-sm"
                                            >
                                                Siguiente: Ubicación GPS
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        ) : (
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md text-sm"
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                {processing ? 'Guardando...' : 'Finalizar y Enviar Registro'}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            )}

                            {/* PASO 7: UBICACIÓN Y MAPA GPS DE LA IGLESIA */}
                            {activeTab === 7 && (
                                <Card className="bg-white border-slate-200 shadow-md text-slate-800 rounded-3xl">
                                    <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-6 sm:p-8 rounded-t-3xl">
                                        <div className="flex items-center gap-3 text-blue-900 font-black text-lg sm:text-xl">
                                            <MapPin className="h-6 w-6 text-blue-600" />
                                            <span>Paso 7: Ubicación Geográfica & Mapa GPS de la Iglesia</span>
                                        </div>
                                        <CardDescription className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                                            Dirección detallada y fijación satelital en el mapa nacional de Venezuela.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8 lg:p-10 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="extension_estado_id" className="text-xs font-bold uppercase text-slate-700">
                                                    Estado de la Iglesia <span className="text-rose-500">*</span>
                                                </Label>
                                                <Select2
                                                    id="extension_estado_id"
                                                    options={estadoOptions}
                                                    value={data.extension_estado_id || data.estado_id}
                                                    onChange={(val) => {
                                                        markFieldTouched('extension_estado_id');
                                                        setData((prev) => ({
                                                            ...prev,
                                                            extension_estado_id: val,
                                                            extension_municipio_id: '',
                                                            extension_parroquia_id: '',
                                                        }));
                                                    }}
                                                    placeholder="Seleccione Estado"
                                                    searchPlaceholder="Buscar estado..."
                                                    className="mt-1"
                                                />
                                                {isFieldVisibleError('extension_estado_id', 7) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('extension_estado_id', 7)}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="extension_municipio_id" className="text-xs font-bold uppercase text-slate-700">
                                                        Municipio <span className="text-rose-500">*</span>
                                                    </Label>
                                                    {(data.extension_estado_id || data.estado_id) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openAddMunicipioModal('extension')}
                                                            className="text-[11px] text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-0.5"
                                                        >
                                                            <Plus className="w-3 h-3" /> Agregar
                                                        </button>
                                                    )}
                                                </div>
                                                <Select2
                                                    id="extension_municipio_id"
                                                    options={extensionMunicipioOptions}
                                                    value={data.extension_municipio_id || data.municipio_id}
                                                    onChange={(val) => {
                                                        markFieldTouched('extension_municipio_id');
                                                        setData((prev) => ({
                                                            ...prev,
                                                            extension_municipio_id: val,
                                                            extension_parroquia_id: '',
                                                        }));
                                                    }}
                                                    disabled={!(data.extension_estado_id || data.estado_id)}
                                                    placeholder="Seleccione Municipio"
                                                    searchPlaceholder="Buscar municipio..."
                                                    className="mt-1"
                                                />
                                                {isFieldVisibleError('extension_municipio_id', 7) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('extension_municipio_id', 7)}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="extension_parroquia_id" className="text-xs font-bold uppercase text-slate-700">
                                                        Parroquia <span className="text-rose-500">*</span>
                                                    </Label>
                                                    {(data.extension_municipio_id || data.municipio_id) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openAddParroquiaModal('extension')}
                                                            className="text-[11px] text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-0.5"
                                                        >
                                                            <Plus className="w-3 h-3" /> Agregar
                                                        </button>
                                                    )}
                                                </div>
                                                <Select2
                                                    id="extension_parroquia_id"
                                                    options={extensionParroquiaOptions}
                                                    value={data.extension_parroquia_id || data.parroquia_id}
                                                    onChange={(val) => {
                                                        markFieldTouched('extension_parroquia_id');
                                                        setData('extension_parroquia_id', val);
                                                    }}
                                                    disabled={!(data.extension_municipio_id || data.municipio_id)}
                                                    placeholder="Seleccione Parroquia"
                                                    searchPlaceholder="Buscar parroquia..."
                                                    className="mt-1"
                                                />
                                                {isFieldVisibleError('extension_parroquia_id', 7) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('extension_parroquia_id', 7)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="extension_sector" className="text-xs font-bold uppercase text-slate-700">
                                                    Sector / Urbanización
                                                </Label>
                                                <Input
                                                    id="extension_sector"
                                                    value={data.extension_sector}
                                                    onChange={(e) => setData('extension_sector', e.target.value)}
                                                    placeholder="Ej. Sector Centro"
                                                    className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="extension_calle" className="text-xs font-bold uppercase text-slate-700">
                                                    Calle
                                                </Label>
                                                <Input
                                                    id="extension_calle"
                                                    value={data.extension_calle}
                                                    onChange={(e) => setData('extension_calle', e.target.value)}
                                                    placeholder="Ej. Calle Bolívar"
                                                    className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="extension_avenida" className="text-xs font-bold uppercase text-slate-700">
                                                    Avenida
                                                </Label>
                                                <Input
                                                    id="extension_avenida"
                                                    value={data.extension_avenida}
                                                    onChange={(e) => setData('extension_avenida', e.target.value)}
                                                    placeholder="Ej. Av. 5 de Julio"
                                                    className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="extension_direccion" className="text-xs font-bold uppercase text-slate-700">
                                                Dirección Completa / Punto de Referencia <span className="text-rose-500">*</span>
                                            </Label>
                                            <Input
                                                id="extension_direccion"
                                                value={data.extension_direccion}
                                                onChange={(e) => {
                                                    markFieldTouched('extension_direccion');
                                                    setData('extension_direccion', e.target.value);
                                                }}
                                                placeholder="Ej. Frente a la Plaza Bolívar, al lado del ambulatorio"
                                                className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('extension_direccion', 7) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                            />
                                            {isFieldVisibleError('extension_direccion', 7) && (
                                                <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                    {isFieldVisibleError('extension_direccion', 7)}
                                                </p>
                                            )}
                                        </div>

                                        {/* MAPA GPS INTERACTIVO */}
                                        <div className="space-y-3 pt-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-blue-600" />
                                                    Geolocalización Satelital GPS de la Iglesia <span className="text-rose-500">*</span>
                                                </Label>
                                                <span className="text-xs text-slate-500">Haga clic en el mapa para ubicar el local</span>
                                            </div>

                                            <div className={`rounded-2xl overflow-hidden border shadow-inner ${isFieldVisibleError('extension_latitud', 7) ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-300'}`}>
                                                <LocationMapPicker
                                                    lat={data.extension_latitud}
                                                    lng={data.extension_longitud}
                                                    onLocationSelect={handleExtensionMapLocationSelect}
                                                    estadoNombre={selectedExtensionEstadoNombre}
                                                    municipioNombre={selectedExtensionMunicipioNombre}
                                                    className="h-[360px] w-full"
                                                />
                                            </div>

                                            {isFieldVisibleError('extension_latitud', 7) && (
                                                <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                    {isFieldVisibleError('extension_latitud', 7)}
                                                </p>
                                            )}

                                            {data.extension_latitud && data.extension_longitud && (
                                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                                    <span>Coordenadas fijadas: Lat: <b>{Number(data.extension_latitud).toFixed(6)}</b>, Lng: <b>{Number(data.extension_longitud).toFixed(6)}</b></span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 sm:p-6 bg-slate-50/70 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 rounded-b-2xl">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setActiveTab(6);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Anterior: Datos de la Iglesia
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => handleNextStep(7)}
                                            className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-md text-sm"
                                        >
                                            Siguiente: Membresía y Medios
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )}

                            {/* PASO 8: MEMBRESÍA, FRUTOS Y MEDIOS DE COMUNICACIÓN */}
                            {activeTab === 8 && (
                                <Card className="bg-white border-slate-200 shadow-md text-slate-800 rounded-3xl">
                                    <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-6 sm:p-8 rounded-t-3xl">
                                        <div className="flex items-center gap-3 text-blue-900 font-black text-lg sm:text-xl">
                                            <Users className="h-6 w-6 text-blue-600" />
                                            <span>Paso 8: Membresía, Frutos y Medios de Comunicación</span>
                                        </div>
                                        <CardDescription className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                                            Estadísticas de congregación, obras anexas, frutos ministeriales y medios de difusión.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8 lg:p-10 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="extension_miembros_activos" className="text-xs font-bold uppercase text-slate-700">
                                                    Miembros Activos <span className="text-rose-500">*</span>
                                                </Label>
                                                <Input
                                                    id="extension_miembros_activos"
                                                    type="number"
                                                    min="0"
                                                    value={data.extension_miembros_activos}
                                                    onChange={(e) => {
                                                        markFieldTouched('extension_miembros_activos');
                                                        setData('extension_miembros_activos', e.target.value);
                                                    }}
                                                    placeholder="Ej. 65"
                                                    className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('extension_miembros_activos', 8) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                />
                                                {isFieldVisibleError('extension_miembros_activos', 8) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('extension_miembros_activos', 8)}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="extension_cantidad_campos_blancos" className="text-xs font-bold uppercase text-slate-700">
                                                    Campos Blancos / Obras Anexas <span className="text-rose-500">*</span>
                                                </Label>
                                                <Input
                                                    id="extension_cantidad_campos_blancos"
                                                    type="number"
                                                    min="0"
                                                    value={data.extension_cantidad_campos_blancos}
                                                    onChange={(e) => {
                                                        markFieldTouched('extension_cantidad_campos_blancos');
                                                        setData('extension_cantidad_campos_blancos', e.target.value);
                                                    }}
                                                    placeholder="Ej. 2 (o 0 si no tiene)"
                                                    className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('extension_cantidad_campos_blancos', 8) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                />
                                                {isFieldVisibleError('extension_cantidad_campos_blancos', 8) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('extension_cantidad_campos_blancos', 8)}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="extension_miembro_probante" className="text-xs font-bold uppercase text-slate-700">
                                                    Miembros Probantes <span className="text-rose-500">*</span>
                                                </Label>
                                                <Input
                                                    id="extension_miembro_probante"
                                                    type="number"
                                                    min="0"
                                                    value={data.extension_miembro_probante}
                                                    onChange={(e) => {
                                                        markFieldTouched('extension_miembro_probante');
                                                        setData('extension_miembro_probante', e.target.value);
                                                    }}
                                                    placeholder="Ej. 10 (o 0 si no tiene)"
                                                    className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('extension_miembro_probante', 8) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                />
                                                {isFieldVisibleError('extension_miembro_probante', 8) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('extension_miembro_probante', 8)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="extension_iglesias_fundadas" className="text-xs font-bold uppercase text-slate-700">
                                                    Iglesias Fundadas desde esta Obra <span className="text-rose-500">*</span>
                                                </Label>
                                                <Input
                                                    id="extension_iglesias_fundadas"
                                                    type="number"
                                                    min="0"
                                                    value={data.extension_iglesias_fundadas}
                                                    onChange={(e) => {
                                                        markFieldTouched('extension_iglesias_fundadas');
                                                        setData('extension_iglesias_fundadas', e.target.value);
                                                    }}
                                                    placeholder="Ej. 1 (o 0)"
                                                    className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('extension_iglesias_fundadas', 8) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                />
                                                {isFieldVisibleError('extension_iglesias_fundadas', 8) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('extension_iglesias_fundadas', 8)}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="extension_pastores_ministerio" className="text-xs font-bold uppercase text-slate-700">
                                                    Pastores / Obreros Levantados <span className="text-rose-500">*</span>
                                                </Label>
                                                <Input
                                                    id="extension_pastores_ministerio"
                                                    type="number"
                                                    min="0"
                                                    value={data.extension_pastores_ministerio}
                                                    onChange={(e) => {
                                                        markFieldTouched('extension_pastores_ministerio');
                                                        setData('extension_pastores_ministerio', e.target.value);
                                                    }}
                                                    placeholder="Ej. 3 (o 0)"
                                                    className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('extension_pastores_ministerio', 8) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                                />
                                                {isFieldVisibleError('extension_pastores_ministerio', 8) && (
                                                    <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                        {isFieldVisibleError('extension_pastores_ministerio', 8)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="extension_logros_obtenidos" className="text-xs font-bold uppercase text-slate-700">
                                                Logros y Frutos Obtenidos <span className="text-rose-500">*</span>
                                            </Label>
                                            <Textarea
                                                id="extension_logros_obtenidos"
                                                rows={2}
                                                value={data.extension_logros_obtenidos}
                                                onChange={(e) => {
                                                    markFieldTouched('extension_logros_obtenidos');
                                                    setData('extension_logros_obtenidos', e.target.value);
                                                }}
                                                placeholder="Ej. Construcción de templo propio, apertura de escuela bíblica, impacto en la comunidad..."
                                                className={`mt-1 bg-white text-slate-900 ${isFieldVisibleError('extension_logros_obtenidos', 8) ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-600'}`}
                                            />
                                            {isFieldVisibleError('extension_logros_obtenidos', 8) && (
                                                <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                    {isFieldVisibleError('extension_logros_obtenidos', 8)}
                                                </p>
                                            )}
                                        </div>

                                        {/* Medios de Comunicación */}
                                        <div className="border-t border-slate-200 pt-4 space-y-4">
                                            <div className="flex items-center justify-between bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                                                <div>
                                                    <p className="font-bold text-sm text-blue-950 flex items-center gap-1.5">
                                                        <Radio className="w-4 h-4 text-blue-600" />
                                                        ¿Cuenta con Medios de Comunicación?
                                                    </p>
                                                    <p className="text-xs text-slate-600">
                                                        Radio FM/AM, canal de TV, programa semanal o transmisión por internet.
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={data.extension_posee_medio_comunicacion}
                                                    onCheckedChange={(checked) => setData('extension_posee_medio_comunicacion', checked)}
                                                />
                                            </div>

                                            {data.extension_posee_medio_comunicacion && (
                                                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                        <div>
                                                            <Label className="text-xs font-bold text-slate-700">Tipo de Medio</Label>
                                                            <Input
                                                                value={nuevoMedioCual}
                                                                onChange={(e) => setNuevoMedioCual(e.target.value)}
                                                                placeholder="Ej. Radio Bethel / Streaming"
                                                                className="mt-1 bg-white text-xs text-slate-900 border-slate-300"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs font-bold text-slate-700">Frecuencia / Enlace / Canal</Label>
                                                            <Input
                                                                value={nuevoMedioDonde}
                                                                onChange={(e) => setNuevoMedioDonde(e.target.value)}
                                                                placeholder="Ej. 104.5 FM / Facebook Live"
                                                                className="mt-1 bg-white text-xs text-slate-900 border-slate-300"
                                                            />
                                                        </div>
                                                        <div className="flex items-end gap-2">
                                                            <div className="flex-1">
                                                                <Label className="text-xs font-bold text-slate-700">Horario / Observación</Label>
                                                                <Input
                                                                    value={nuevoMedioNota}
                                                                    onChange={(e) => setNuevoMedioNota(e.target.value)}
                                                                    placeholder="Ej. Domingos 8:00 AM"
                                                                    className="mt-1 bg-white text-xs text-slate-900 border-slate-300"
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                onClick={handleAgregarMedio}
                                                                className="bg-blue-700 hover:bg-blue-800 text-white shrink-0"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {data.extension_medios_lista && data.extension_medios_lista.length > 0 && (
                                                        <div className="space-y-2 pt-2">
                                                            {data.extension_medios_lista.map((m, idx) => (
                                                                <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs shadow-xs">
                                                                    <div>
                                                                        <span className="font-bold text-slate-900">{m.cual}</span>
                                                                        {m.donde && <span className="text-blue-700 ml-2">({m.donde})</span>}
                                                                        {m.nota && <span className="text-slate-500 ml-2">- {m.nota}</span>}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleEliminarMedio(idx)}
                                                                        className="text-rose-600 hover:text-rose-800 p-1"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {isFieldVisibleError('extension_medios_lista', 8) && (
                                                        <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                            {isFieldVisibleError('extension_medios_lista', 8)}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 rounded-b-2xl">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setActiveTab(7);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Anterior: Ubicación GPS
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg text-sm"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            {processing ? 'Guardando Registro Completo...' : 'Finalizar y Enviar Registro'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )}
                        </form>
                    </>
                )}
            </main>

            {/* Footer Institucional */}
            <footer className="bg-white border-t border-slate-200 text-center py-4 text-xs text-slate-500">
                <p>© {new Date().getFullYear()} Movimiento Misionero Mundial en Venezuela. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
