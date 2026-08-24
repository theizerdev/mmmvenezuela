import React, { useState, useMemo } from 'react';
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
    Building2,
    MapPin,
    Users,
    Radio,
    User,
    ShieldCheck,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    Save,
    Check,
    Plus,
    Trash2,
    Send,
    Loader2,
    Sparkles,
    CheckCheck,
    ArrowUpRight
} from 'lucide-react';
import LocationMapPicker, { GeocodedAddressDetails } from '@/components/location-map-picker';

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

interface PastorData {
    id: number;
    codigo?: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    documento: string;
    nombre_conyuge?: string;
    cedula_conyuge?: string;
    conyuge_id?: number | string;
    nivel_ministerial?: string;
    zona?: string;
    distrito?: string;
    telefono_tlf?: string;
    estado_id?: string | number;
    municipio_id?: string | number;
    parroquia_id?: string | number;
}

interface RegistroExtensionProps {
    pastor: PastorData;
    iglesia?: any;
    estados: EstadoItem[];
    municipios: MunicipioItem[];
    parroquias: ParroquiaItem[];
    tiposLocal?: TipoLocalItem[];
    flash?: {
        success?: {
            codigo: string;
            pastor: string;
            iglesia: string;
            mensaje: string;
        };
    };
}

export default function RegistroExtension({
    pastor,
    iglesia,
    estados = [],
    municipios = [],
    parroquias = [],
    tiposLocal = [],
    flash,
}: RegistroExtensionProps) {
    const { props } = usePage<any>();
    const [activeTab, setActiveTab] = useState<number>(1);

    // Estados de medios de comunicación
    const [nuevoMedioCual, setNuevoMedioCual] = useState<string>('');
    const [nuevoMedioDonde, setNuevoMedioDonde] = useState<string>('');
    const [nuevoMedioNota, setNuevoMedioNota] = useState<string>('');

    // Estados de envío y confirmación
    const [isSubmittingModalOpen, setIsSubmittingModalOpen] = useState<boolean>(false);
    const [submitProgress, setSubmitProgress] = useState<number>(0);
    const [submitStage, setSubmitStage] = useState<string>('Iniciando registro...');
    const [submittedResult, setSubmittedResult] = useState<{
        codigo: string;
        pastor: string;
        iglesia: string;
        mensaje: string;
    } | null>(null);

    // Parse inicial de medios si existen
    const parsedMedios: MediaItem[] = useMemo(() => {
        if (!iglesia?.medio_comunicacion) return [];
        try {
            const parsed = JSON.parse(iglesia.medio_comunicacion);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) { }
        return [];
    }, [iglesia]);

    const { data, setData, post, processing, errors } = useForm({
        extension_id: iglesia?.id ? String(iglesia.id) : '',
        nombre: iglesia?.nombre || '',
        tipo_local_id: iglesia?.tipo_local_id ? String(iglesia.tipo_local_id) : '',
        estado_id: iglesia?.estado_id
            ? String(iglesia.estado_id)
            : (pastor.estado_id ? String(pastor.estado_id) : (estados?.[0]?.id ? String(estados[0].id) : '')),
        municipio_id: iglesia?.municipio_id
            ? String(iglesia.municipio_id)
            : (pastor.municipio_id ? String(pastor.municipio_id) : ''),
        parroquia_id: iglesia?.parroquia_id
            ? String(iglesia.parroquia_id)
            : (pastor.parroquia_id ? String(pastor.parroquia_id) : ''),
        direccion: iglesia?.direccion || '',
        sector: iglesia?.sector || '',
        calle: iglesia?.calle || '',
        avenida: iglesia?.avenida || '',
        latitud: iglesia?.latitud ? String(iglesia.latitud) : '',
        longitud: iglesia?.longitud ? String(iglesia.longitud) : '',
        zona: iglesia?.zona || pastor.zona || '',
        distrito: iglesia?.distrito ? String(iglesia.distrito).replace(/\D/g, '') : (pastor.distrito ? String(pastor.distrito).replace(/\D/g, '') : ''),
        fecha_fundacion: iglesia?.fecha_fundacion || '',
        anios_activa: iglesia?.anios_activa ? String(iglesia.anios_activa) : '',
        tiempo_trabajo: iglesia?.tiempo_trabajo || '',
        descripcion: iglesia?.descripcion || '',
        miembros_activos: iglesia?.miembros_activos ? String(iglesia.miembros_activos) : '',
        cantidad_campos_blancos: iglesia?.cantidad_campos_blancos ? String(iglesia.cantidad_campos_blancos) : '',
        miembro_probante: iglesia?.miembro_probante ? String(iglesia.miembro_probante) : '',
        logros_obtenidos: iglesia?.logros_obtenidos || '',
        iglesias_fundadas: iglesia?.iglesias_fundadas ? String(iglesia.iglesias_fundadas) : '',
        pastores_ministerio: iglesia?.pastores_ministerio ? String(iglesia.pastores_ministerio) : '',
        posee_medio_comunicacion: Boolean(iglesia?.posee_medio_comunicacion),
        medios_lista: parsedMedios,
    });

    const steps = [
        { id: 1, title: 'Información General', icon: Building2, desc: 'Nombre, local y fundación' },
        { id: 2, title: 'Ubicación y Mapa GPS', icon: MapPin, desc: 'Dirección y geolocalización' },
        { id: 3, title: 'Membresía y Frutos', icon: Users, desc: 'Miembros, anexos y logros' },
        { id: 4, title: 'Medios de Comunicación', icon: Radio, desc: 'Radio, TV y Redes' },
    ];

    const tipoLocalOptions: Select2Option[] = useMemo(() => {
        return tiposLocal.map((t) => ({ value: String(t.id), label: t.nombre }));
    }, [tiposLocal]);

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

    const selectedEstadoNombre = useMemo(() => {
        if (!data.estado_id) return undefined;
        const found = estados.find((e) => String(e.id) === String(data.estado_id));
        return found?.nombre;
    }, [data.estado_id, estados]);

    const selectedMunicipioNombre = useMemo(() => {
        if (!data.municipio_id) return undefined;
        const found = municipios.find((m) => String(m.id) === String(data.municipio_id));
        return found?.nombre;
    }, [data.municipio_id, municipios]);

    const cleanText = (str?: string) => {
        if (!str) return '';
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    };

    const handleMapLocationSelect = (newLat: number, newLng: number, details?: GeocodedAddressDetails) => {
        let matchedEstadoId = data.estado_id;
        let matchedMunicipioId = data.municipio_id;
        let matchedParroquiaId = data.parroquia_id;

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

        setData((prev) => ({
            ...prev,
            latitud: String(newLat),
            longitud: String(newLng),
            estado_id: matchedEstadoId,
            municipio_id: matchedMunicipioId,
            parroquia_id: matchedParroquiaId,
            direccion: details?.direccion ? details.direccion : prev.direccion,
            sector: details?.sector ? details.sector : prev.sector,
            calle: details?.calle ? details.calle : prev.calle,
            avenida: details?.avenida ? details.avenida : prev.avenida,
        }));
    };

    const handleFechaFundacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val) {
            const fundDate = new Date(val);
            const today = new Date();
            if (!isNaN(fundDate.getTime())) {
                let years = today.getFullYear() - fundDate.getFullYear();
                let months = today.getMonth() - fundDate.getMonth();
                if (months < 0 || (months === 0 && today.getDate() < fundDate.getDate())) {
                    years--;
                    months += 12;
                }
                const tiempoText = years > 0 ? `${years} año(s) y ${months} mes(es)` : `${months} mes(es)`;
                setData((prev) => ({
                    ...prev,
                    fecha_fundacion: val,
                    anios_activa: String(Math.max(0, years)),
                    tiempo_trabajo: tiempoText,
                }));
                return;
            }
        }
        setData((prev) => ({ ...prev, fecha_fundacion: val }));
    };

    const handleAgregarMedio = () => {
        if (!nuevoMedioCual.trim()) return;
        const list = [...(data.medios_lista || [])];
        list.push({ cual: nuevoMedioCual.trim(), donde: nuevoMedioDonde.trim(), nota: nuevoMedioNota.trim() });
        setData('medios_lista', list);
        setNuevoMedioCual('');
        setNuevoMedioDonde('');
        setNuevoMedioNota('');
    };

    const handleEliminarMedio = (idx: number) => {
        const list = (data.medios_lista || []).filter((_, i) => i !== idx);
        setData('medios_lista', list);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (activeTab < 4) {
            setActiveTab((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!data.nombre.trim()) {
            setActiveTab(1);
            alert('Por favor ingrese el nombre de la Iglesia / Extensión.');
            return;
        }

        setIsSubmittingModalOpen(true);
        setSubmitProgress(15);
        setSubmitStage('Validando datos de la Iglesia / Extensión...');

        let currentP = 15;
        const progressInterval = setInterval(() => {
            currentP += Math.floor(Math.random() * 14) + 6;
            if (currentP > 88) {
                currentP = 88;
                setSubmitStage('Registrando geolocalización y vinculando al pastor...');
            } else if (currentP > 50) {
                setSubmitStage('Guardando membresía y medios de comunicación...');
            } else if (currentP > 25) {
                setSubmitStage('Procesando datos en la base de datos nacional...');
            }
            setSubmitProgress(currentP);
        }, 250);

        post(`/registro/${pastor.id}/extension`, {
            preserveScroll: true,
            onSuccess: (page: any) => {
                clearInterval(progressInterval);
                setSubmitProgress(100);
                setSubmitStage('¡Extensión registrada exitosamente!');

                const flashSuccess = page?.props?.flash?.success || props?.flash?.success;
                setSubmittedResult({
                    codigo: flashSuccess?.codigo || pastor.codigo || 'OK',
                    pastor: flashSuccess?.pastor || pastor.nombre_completo,
                    iglesia: flashSuccess?.iglesia || data.nombre,
                    mensaje: flashSuccess?.mensaje || 'La Iglesia / Extensión ha sido guardada satisfactoriamente.',
                });
            },
            onError: (errs) => {
                clearInterval(progressInterval);
                setIsSubmittingModalOpen(false);
                setSubmitProgress(0);

                if (errs.nombre || errs.tipo_local_id) {
                    setActiveTab(1);
                } else if (errs.estado_id || errs.latitud) {
                    setActiveTab(2);
                }
                alert('Hubo observaciones en el formulario de la extensión. Por favor revise los campos en rojo.');
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans relative">
            <Head title={`Registro de Extensión - ${pastor.nombre_completo} - MMM Venezuela`} />

            {/* MODAL DE PROGRESO Y CONFIRMACIÓN */}
            {isSubmittingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
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
                                {submitProgress === 100 ? '¡Extensión Registrada con Éxito!' : 'Registrando Iglesia / Extensión'}
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
                                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                                        <p className="text-xs uppercase tracking-wider text-emerald-800 font-bold mb-0.5">
                                            Iglesia / Extensión Oficial
                                        </p>
                                        <span className="font-mono text-2xl font-black text-emerald-950 tracking-tight">
                                            {submittedResult?.iglesia}
                                        </span>
                                        <p className="text-xs text-emerald-700 font-semibold mt-1">
                                            Pastor a Cargo: {submittedResult?.pastor}
                                        </p>
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
                                            Volver al Registro de Pastores
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Header Institucional */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
                <div className="max-w-[1480px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
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
                                Ficha de Registro de Iglesias y Extensiones
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => router.get('/registro')}
                            className="text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                            Registro de Pastores
                        </Button>
                        <Badge variant="outline" className="hidden md:inline-flex border-blue-200 text-blue-800 bg-blue-50 py-1 px-3 text-xs font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                            Portal Oficial MMM
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="flex-1 max-w-[1480px] w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
                {/* Banner de Confirmación si viene de completar la ficha del pastor */}
                {(flash?.success || props?.flash?.success) && (
                    <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-center justify-between gap-3 text-emerald-950 shadow-sm animate-in fade-in">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-wider text-emerald-900">
                                    {(flash?.success?.codigo || props?.flash?.success?.codigo)
                                        ? `¡Ficha Pastoral Registrada! (Cód: ${flash?.success?.codigo || props?.flash?.success?.codigo})`
                                        : '¡Ficha Pastoral Registrada Exitosamente!'}
                                </p>
                                <p className="text-xs text-emerald-800 mt-0.5 font-medium">
                                    {flash?.success?.mensaje || props?.flash?.success?.mensaje || 'Ahora complete a continuación los datos de la Iglesia o Extensión.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* TARJETA DE IDENTIFICACIÓN DEL PASTOR A CARGO */}
                <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-blue-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0 shadow-inner">
                            <User className="w-7 h-7 text-blue-300" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
                                    Pastor a Cargo
                                </span>
                                {pastor.codigo && (
                                    <span className="text-[11px] font-mono font-bold bg-white/10 text-white px-2 py-0.5 rounded-md">
                                        Cód: {pastor.codigo}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white mt-1">
                                {pastor.nombre_completo}
                            </h2>
                            <p className="text-xs text-blue-200 mt-0.5">
                                Cédula: <b>{pastor.documento}</b> {pastor.nivel_ministerial ? `• ${pastor.nivel_ministerial}` : ''}
                            </p>
                            {pastor.nombre_conyuge && (
                                <div className="mt-1.5 flex items-center gap-2 flex-wrap text-xs text-emerald-200 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                                    <span>💍 Cónyuge: <b className="text-white font-bold">{pastor.nombre_conyuge}</b> {pastor.cedula_conyuge ? `(C.I. ${pastor.cedula_conyuge})` : ''}</span>
                                    <span className="text-[10px] bg-emerald-500/30 text-emerald-100 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                        Vinculación Automática
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap w-full md:w-auto pt-3 md:pt-0 border-t border-white/10 md:border-t-0 text-xs">
                        <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 flex-1 md:flex-initial text-center md:text-left">
                            <span className="text-[10px] text-blue-300 uppercase font-bold block">Zona Asignada</span>
                            <span className="font-extrabold text-white text-sm">{pastor.zona ? `Zona ${pastor.zona}` : 'Sin Asignar'}</span>
                        </div>
                        <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 flex-1 md:flex-initial text-center md:text-left">
                            <span className="text-[10px] text-blue-300 uppercase font-bold block">Distrito</span>
                            <span className="font-extrabold text-white text-sm">{pastor.distrito ? `Distrito ${pastor.distrito}` : 'Sin Asignar'}</span>
                        </div>
                    </div>
                </div>

                {/* Formulario Wizard de 4 Pasos */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header y Navegación de Pasos */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-blue-600" />
                                Formulario de Iglesia / Extensión
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Complete los 4 pasos para registrar la sede eclesiástica vinculada al pastor.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            {activeTab > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setActiveTab(activeTab - 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="border-slate-300 text-slate-700 hover:bg-slate-50 flex-1 md:flex-initial font-medium"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                                    Anterior
                                </Button>
                            )}
                            {activeTab < 4 && (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(activeTab + 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold flex-1 md:flex-initial shadow-md"
                                >
                                    Siguiente
                                    <ArrowRight className="w-4 h-4 ml-1.5" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Stepper Tabs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            const isActive = activeTab === step.id;
                            const isCompleted = activeTab > step.id;

                            return (
                                <button
                                    key={step.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(step.id);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left ${isActive
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
                                        <h4 className="font-bold text-xs sm:text-sm truncate text-slate-900">
                                            {step.title}
                                        </h4>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* PASO 1: INFORMACIÓN GENERAL */}
                    {activeTab === 1 && (
                        <Card className="bg-white border-slate-200 shadow-sm text-slate-800 rounded-2xl animate-in fade-in duration-200">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                                <div className="flex items-center gap-2 text-blue-800 font-bold text-base">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    <span>Paso 1: Información General de la Iglesia / Extensión</span>
                                </div>
                                <CardDescription className="text-slate-500 text-xs font-medium mt-1">
                                    Datos básicos de identificación, tipo de local, tiempo de labor y reseña histórica.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="nombre" className="text-xs font-bold uppercase text-slate-700">
                                            Nombre de la Iglesia / Extensión <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            id="nombre"
                                            required
                                            value={data.nombre}
                                            onChange={(e) => setData('nombre', e.target.value)}
                                            placeholder="Ej. Iglesia Central Barquisimeto"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                        {errors.nombre && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.nombre}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="tipo_local_id" className="text-xs font-bold uppercase text-slate-700">
                                            Tipo de Local
                                        </Label>
                                        <Select2
                                            id="tipo_local_id"
                                            options={tipoLocalOptions}
                                            value={data.tipo_local_id}
                                            onChange={(val) => setData('tipo_local_id', val)}
                                            placeholder="Seleccione Tipo de Local"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="fecha_fundacion" className="text-xs font-bold uppercase text-slate-700">
                                            Fecha de Fundación / Apertura
                                        </Label>
                                        <Input
                                            id="fecha_fundacion"
                                            type="date"
                                            value={data.fecha_fundacion}
                                            onChange={handleFechaFundacionChange}
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="anios_activa" className="text-xs font-bold uppercase text-slate-700">
                                            Años Activa
                                        </Label>
                                        <Input
                                            id="anios_activa"
                                            type="number"
                                            min="0"
                                            value={data.anios_activa}
                                            onChange={(e) => setData('anios_activa', e.target.value)}
                                            placeholder="Ej. 12"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="tiempo_trabajo" className="text-xs font-bold uppercase text-slate-700">
                                            Tiempo de Trabajo Pastoral
                                        </Label>
                                        <Input
                                            id="tiempo_trabajo"
                                            value={data.tiempo_trabajo}
                                            onChange={(e) => setData('tiempo_trabajo', e.target.value)}
                                            placeholder="Ej. 4 años y 6 meses"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="zona" className="text-xs font-bold uppercase text-slate-700">
                                            Zona de la Iglesia (Número)
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
                                            Distrito de la Iglesia
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

                                <div>
                                    <Label htmlFor="descripcion" className="text-xs font-bold uppercase text-slate-700">
                                        Reseña Histórica / Descripción de la Iglesia
                                    </Label>
                                    <Textarea
                                        id="descripcion"
                                        rows={3}
                                        value={data.descripcion}
                                        onChange={(e) => setData('descripcion', e.target.value)}
                                        placeholder="Breve reseña sobre la apertura de la obra, desarrollo del templo, etc..."
                                        className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                    />
                                </div>
                            </CardContent>

                            <CardFooter className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex justify-end rounded-b-2xl">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(2);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-md text-sm"
                                >
                                    Siguiente: Ubicación y Mapa (Paso 2)
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* PASO 2: UBICACIÓN Y MAPA GPS */}
                    {activeTab === 2 && (
                        <Card className="bg-white border-slate-200 shadow-sm text-slate-800 rounded-2xl animate-in fade-in duration-200">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                                <div className="flex items-center gap-2 text-blue-800 font-bold text-base">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                    <span>Paso 2: Ubicación Geográfica y Mapa GPS</span>
                                </div>
                                <CardDescription className="text-slate-500 text-xs font-medium mt-1">
                                    Indique la ubicación exacta del templo o marque las coordenadas en el mapa interactivo.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="estado_id" className="text-xs font-bold uppercase text-slate-700">
                                            Estado <span className="text-rose-500">*</span>
                                        </Label>
                                        <Select2
                                            id="estado_id"
                                            options={estadoOptions}
                                            value={data.estado_id}
                                            onChange={(val) => setData((prev) => ({ ...prev, estado_id: val, municipio_id: '', parroquia_id: '' }))}
                                            placeholder="Seleccione Estado"
                                            className="mt-1"
                                        />
                                        {errors.estado_id && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.estado_id}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="municipio_id" className="text-xs font-bold uppercase text-slate-700">
                                            Municipio
                                        </Label>
                                        <Select2
                                            id="municipio_id"
                                            options={municipioOptions}
                                            value={data.municipio_id}
                                            onChange={(val) => setData((prev) => ({ ...prev, municipio_id: val, parroquia_id: '' }))}
                                            placeholder="Seleccione Municipio"
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
                                            placeholder="Seleccione Parroquia"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="sector" className="text-xs font-bold uppercase text-slate-700">
                                            Sector / Urbanización
                                        </Label>
                                        <Input
                                            id="sector"
                                            value={data.sector}
                                            onChange={(e) => setData('sector', e.target.value)}
                                            placeholder="Ej. Sector Centro"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="calle" className="text-xs font-bold uppercase text-slate-700">
                                            Calle
                                        </Label>
                                        <Input
                                            id="calle"
                                            value={data.calle}
                                            onChange={(e) => setData('calle', e.target.value)}
                                            placeholder="Ej. Calle 14"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="avenida" className="text-xs font-bold uppercase text-slate-700">
                                            Avenida / Transversal
                                        </Label>
                                        <Input
                                            id="avenida"
                                            value={data.avenida}
                                            onChange={(e) => setData('avenida', e.target.value)}
                                            placeholder="Ej. Av. 20 con Carrera 18"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="direccion" className="text-xs font-bold uppercase text-slate-700">
                                        Punto de Referencia / Dirección Detallada
                                    </Label>
                                    <Input
                                        id="direccion"
                                        value={data.direccion}
                                        onChange={(e) => setData('direccion', e.target.value)}
                                        placeholder="Ej. Frente a la plaza principal, casa color beige con portón blanco"
                                        className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                    />
                                </div>

                                {/* Mapa GPS */}
                                <div className="space-y-2 pt-2">
                                    <Label className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-rose-600" />
                                        Ubicación en Mapa Interactivo (GPS)
                                    </Label>
                                    <LocationMapPicker
                                        lat={data.latitud}
                                        lng={data.longitud}
                                        onLocationSelect={handleMapLocationSelect}
                                        estadoNombre={selectedEstadoNombre}
                                        municipioNombre={selectedMunicipioNombre}
                                        className="h-80 rounded-xl overflow-hidden border border-slate-300 shadow-sm"
                                    />
                                </div>
                            </CardContent>

                            <CardFooter className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 rounded-b-2xl">
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
                                    Anterior: General
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(3);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-md text-sm"
                                >
                                    Siguiente: Membresía (Paso 3)
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* PASO 3: MEMBRESÍA Y FRUTOS */}
                    {activeTab === 3 && (
                        <Card className="bg-white border-slate-200 shadow-sm text-slate-800 rounded-2xl animate-in fade-in duration-200">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                                <div className="flex items-center gap-2 text-blue-800 font-bold text-base">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    <span>Paso 3: Membresía, Obras y Frutos Ministeriales</span>
                                </div>
                                <CardDescription className="text-slate-500 text-xs font-medium mt-1">
                                    Información estadística de la congregación, anexos abiertos y avance espiritual.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="miembros_activos" className="text-xs font-bold uppercase text-slate-700">
                                            Miembros Activos / Bautizados
                                        </Label>
                                        <Input
                                            id="miembros_activos"
                                            type="number"
                                            min="0"
                                            value={data.miembros_activos}
                                            onChange={(e) => setData('miembros_activos', e.target.value)}
                                            placeholder="Ej. 120"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="cantidad_campos_blancos" className="text-xs font-bold uppercase text-slate-700">
                                            Campos Blancos / Anexos
                                        </Label>
                                        <Input
                                            id="cantidad_campos_blancos"
                                            type="number"
                                            min="0"
                                            value={data.cantidad_campos_blancos}
                                            onChange={(e) => setData('cantidad_campos_blancos', e.target.value)}
                                            placeholder="Ej. 3"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="miembro_probante" className="text-xs font-bold uppercase text-slate-700">
                                            Miembros Probantes / Asistentes
                                        </Label>
                                        <Input
                                            id="miembro_probante"
                                            type="number"
                                            min="0"
                                            value={data.miembro_probante}
                                            onChange={(e) => setData('miembro_probante', e.target.value)}
                                            placeholder="Ej. 40"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="iglesias_fundadas" className="text-xs font-bold uppercase text-slate-700">
                                            Iglesias / Obras Fundadas
                                        </Label>
                                        <Input
                                            id="iglesias_fundadas"
                                            type="number"
                                            min="0"
                                            value={data.iglesias_fundadas}
                                            onChange={(e) => setData('iglesias_fundadas', e.target.value)}
                                            placeholder="Ej. 2"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="pastores_ministerio" className="text-xs font-bold uppercase text-slate-700">
                                            Pastores Enviados al Ministerio
                                        </Label>
                                        <Input
                                            id="pastores_ministerio"
                                            type="number"
                                            min="0"
                                            value={data.pastores_ministerio}
                                            onChange={(e) => setData('pastores_ministerio', e.target.value)}
                                            placeholder="Ej. 4"
                                            className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="logros_obtenidos" className="text-xs font-bold uppercase text-slate-700">
                                        Logros, Avances y Frutos Ministeriales
                                    </Label>
                                    <Textarea
                                        id="logros_obtenidos"
                                        rows={3}
                                        value={data.logros_obtenidos}
                                        onChange={(e) => setData('logros_obtenidos', e.target.value)}
                                        placeholder="Detalle construcciones, compra de terrenos, campañas y eventos relevantes..."
                                        className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-blue-600"
                                    />
                                </div>
                            </CardContent>

                            <CardFooter className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 rounded-b-2xl">
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
                                    Anterior: Ubicación
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(4);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-md text-sm"
                                >
                                    Siguiente: Medios (Paso 4)
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* PASO 4: MEDIOS DE COMUNICACIÓN */}
                    {activeTab === 4 && (
                        <Card className="bg-white border-slate-200 shadow-sm text-slate-800 rounded-2xl animate-in fade-in duration-200">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                                <div className="flex items-center gap-2 text-blue-800 font-bold text-base">
                                    <Radio className="h-5 w-5 text-blue-600" />
                                    <span>Paso 4: Medios de Comunicación y Transmisión</span>
                                </div>
                                <CardDescription className="text-slate-500 text-xs font-medium mt-1">
                                    Programas de Radio FM/AM, Señal de TV o Redes Sociales activas de la iglesia.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6 space-y-4">
                                <div className="flex items-center justify-between bg-blue-50/70 p-4 rounded-xl border border-blue-200">
                                    <div>
                                        <p className="font-bold text-sm text-blue-950">¿Posee Medio de Comunicación?</p>
                                        <p className="text-xs text-slate-600">Transmisiones activas por emisoras, canales o plataformas digitales</p>
                                    </div>
                                    <Switch
                                        checked={data.posee_medio_comunicacion}
                                        onCheckedChange={(c) => setData('posee_medio_comunicacion', c)}
                                    />
                                </div>

                                {data.posee_medio_comunicacion && (
                                    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <p className="text-xs font-bold uppercase text-slate-700">Agregar Medio de Transmisión:</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <Input
                                                value={nuevoMedioCual}
                                                onChange={(e) => setNuevoMedioCual(e.target.value)}
                                                placeholder="Medio (Ej. Radio Impacto 95.1 FM)"
                                                className="bg-white text-xs"
                                            />
                                            <Input
                                                value={nuevoMedioDonde}
                                                onChange={(e) => setNuevoMedioDonde(e.target.value)}
                                                placeholder="Dial / Canal / Red Social"
                                                className="bg-white text-xs"
                                            />
                                            <div className="flex gap-2">
                                                <Input
                                                    value={nuevoMedioNota}
                                                    onChange={(e) => setNuevoMedioNota(e.target.value)}
                                                    placeholder="Horario / Días"
                                                    className="bg-white text-xs"
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={handleAgregarMedio}
                                                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shrink-0"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {data.medios_lista && data.medios_lista.length > 0 && (
                                            <div className="space-y-2 pt-2">
                                                <p className="text-xs font-bold text-slate-600">Medios Registrados:</p>
                                                <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white overflow-hidden">
                                                    {data.medios_lista.map((item, idx) => (
                                                        <div key={idx} className="p-3 flex items-center justify-between text-xs">
                                                            <div>
                                                                <p className="font-bold text-slate-900">{item.cual}</p>
                                                                <p className="text-slate-500">{item.donde} {item.nota ? `• ${item.nota}` : ''}</p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleEliminarMedio(idx)}
                                                                className="text-rose-600 hover:text-rose-800 h-7 w-7 p-0"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 rounded-b-2xl">
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
                                    Anterior: Membresía
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg text-sm"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {processing ? 'Enviando Extensión...' : 'Finalizar y Guardar Extensión'}
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
