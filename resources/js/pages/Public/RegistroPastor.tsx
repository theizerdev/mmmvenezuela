import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    User,
    Church,
    UploadCloud,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    FileText,
    IdCard,
    Calendar,
    Phone,
    Mail,
    Award,
    MapPin,
    AlertCircle,
    Camera,
    Sparkles,
    Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EstadoItem {
    id: number;
    nombre: string;
}

interface RegistroPastorProps {
    estados: EstadoItem[];
    gradosMinisteriales: string[];
    estadosCiviles: string[];
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
    flash
}: RegistroPastorProps) {
    const [step, setStep] = useState<number>(1);
    const [fotoCedulaPreview, setFotoCedulaPreview] = useState<string | null>(null);
    const [fotoPerfilPreview, setFotoPerfilPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        nombres: '',
        apellidos: '',
        documento: '',
        fe_nacimiento: '',
        estado_civil: 'Casado(a)',
        telefono_tlf: '',
        email: '',

        nivel_ministerial: 'Ministro Ordenado',
        ano_promocion: '',

        nombre_extension: '',
        direccion_extension: '',
        estado_id: estados?.[0]?.id ? String(estados[0].id) : '',
        zona: '',
        distrito: '',

        foto_cedula: null as File | null,
        foto: null as File | null,
    });

    const successData = flash?.success;

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: 'foto_cedula' | 'foto',
        setPreview: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setData(field, file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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

            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
                {/* Header Institucional */}
                <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
                    <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="/icons/logo_mmm.png"
                                alt="Logo MMM"
                                className="h-12 w-auto object-contain drop-shadow-md"
                                onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                }}
                            />
                            <div>
                                <h1 className="text-xs md:text-sm font-black tracking-wider uppercase text-amber-400">
                                    MOVIMIENTO MISIONERO MUNDIAL
                                </h1>
                                <p className="text-xs text-slate-400 font-medium">
                                    Oficina Nacional de Venezuela • Censo Pastoral
                                </p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                            <ShieldCheck className="size-4 text-emerald-400" />
                            <span>Formulario Oficial de Registro</span>
                        </div>
                    </div>
                </header>

                {/* Contenido Principal */}
                <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12">
                    {/* Pantalla de Éxito al Completar */}
                    {step === 4 || successData ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            <div className="size-20 mx-auto bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <CheckCircle2 className="size-10 text-slate-950 stroke-[2.5]" />
                            </div>

                            <div className="space-y-2">
                                <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                                    ¡Registro Recibido Exitosamente!
                                </span>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                                    {successData?.nombre || `${data.nombres} ${data.apellidos}`}
                                </h2>
                                <p className="text-slate-400 text-sm max-w-md mx-auto">
                                    Tus datos y la información de la extensión han sido registrados en nuestro sistema de censo pastoral nacional.
                                </p>
                            </div>

                            {/* Tarjeta de Código Generado */}
                            {successData?.codigo && (
                                <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 max-w-sm mx-auto space-y-2 shadow-inner">
                                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                                        Código Eclesiástico Asignado
                                    </span>
                                    <div className="text-2xl md:text-3xl font-mono font-black text-amber-400 tracking-widest select-all">
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
                                        setStep(1);
                                    }}
                                    variant="outline"
                                    className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200"
                                >
                                    Registrar otro Pastor
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                            {/* Stepper Header */}
                            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 border-b border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                                            <Sparkles className="size-5 text-amber-400" />
                                            Censo Nacional de Pastores
                                        </h2>
                                        <p className="text-xs text-slate-400">
                                            Por favor completa la información del pastor y la extensión correspondiente.
                                        </p>
                                    </div>
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                        Paso {step} de 3
                                    </span>
                                </div>

                                {/* Barra de Progreso */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div className={`h-2 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-amber-400' : 'bg-slate-800'}`} />
                                    <div className={`h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-amber-400' : 'bg-slate-800'}`} />
                                    <div className={`h-2 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-amber-400' : 'bg-slate-800'}`} />
                                </div>

                                {/* Etiquetas del Stepper */}
                                <div className="grid grid-cols-3 gap-2 text-[11px] font-medium text-slate-400 mt-2 text-center">
                                    <span className={step === 1 ? 'text-amber-400 font-bold' : ''}>1. Datos del Pastor</span>
                                    <span className={step === 2 ? 'text-amber-400 font-bold' : ''}>2. Ministerio y Extensión</span>
                                    <span className={step === 3 ? 'text-amber-400 font-bold' : ''}>3. Documentos y Fotos</span>
                                </div>
                            </div>

                            {/* Formulario */}
                            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                                {/* PASO 1: DATOS PERSONALES */}
                                {step === 1 && (
                                    <div className="space-y-6 animate-in fade-in duration-200">
                                        <div className="border-b border-slate-800 pb-3 flex items-center gap-2 text-amber-400 font-semibold text-sm">
                                            <User className="size-4" />
                                            <span>Información Personal y Contacto</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Nombres */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                                    Nombres <span className="text-rose-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={data.nombres}
                                                    onChange={(e) => setData('nombres', e.target.value)}
                                                    placeholder="Ej. Juan Carlos"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition"
                                                />
                                                {errors.nombres && <p className="text-xs text-rose-400">{errors.nombres}</p>}
                                            </div>

                                            {/* Apellidos */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                                    Apellidos <span className="text-rose-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={data.apellidos}
                                                    onChange={(e) => setData('apellidos', e.target.value)}
                                                    placeholder="Ej. Pérez Rodríguez"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition"
                                                />
                                                {errors.apellidos && <p className="text-xs text-rose-400">{errors.apellidos}</p>}
                                            </div>

                                            {/* Cédula */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                                    <IdCard className="size-3.5 text-slate-400" />
                                                    Cédula de Identidad <span className="text-rose-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={data.documento}
                                                    onChange={(e) => setData('documento', e.target.value)}
                                                    placeholder="Ej. V-12345678"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition"
                                                />
                                                {errors.documento && <p className="text-xs text-rose-400">{errors.documento}</p>}
                                            </div>

                                            {/* Fecha de Nacimiento */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                                    <Calendar className="size-3.5 text-slate-400" />
                                                    Fecha de Nacimiento <span className="text-rose-400">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={data.fe_nacimiento}
                                                    onChange={(e) => setData('fe_nacimiento', e.target.value)}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                                                />
                                                {errors.fe_nacimiento && <p className="text-xs text-rose-400">{errors.fe_nacimiento}</p>}
                                            </div>

                                            {/* Estado Civil */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                                    Estado Civil <span className="text-rose-400">*</span>
                                                </label>
                                                <select
                                                    value={data.estado_civil}
                                                    onChange={(e) => setData('estado_civil', e.target.value)}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                                                >
                                                    {estadosCiviles.map((ec) => (
                                                        <option key={ec} value={ec}>
                                                            {ec}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.estado_civil && <p className="text-xs text-rose-400">{errors.estado_civil}</p>}
                                            </div>

                                            {/* Teléfono Móvil */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                                    <Phone className="size-3.5 text-slate-400" />
                                                    Teléfono Móvil <span className="text-rose-400">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={data.telefono_tlf}
                                                    onChange={(e) => setData('telefono_tlf', e.target.value)}
                                                    placeholder="Ej. 0414-1234567"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition"
                                                />
                                                {errors.telefono_tlf && <p className="text-xs text-rose-400">{errors.telefono_tlf}</p>}
                                            </div>

                                            {/* Correo Electrónico */}
                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                                    <Mail className="size-3.5 text-slate-400" />
                                                    Correo Electrónico
                                                </label>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="Ej. pastor@ejemplo.com"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition"
                                                />
                                                {errors.email && <p className="text-xs text-rose-400">{errors.email}</p>}
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4 border-t border-slate-800">
                                            <Button
                                                type="button"
                                                onClick={nextStep}
                                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/10 flex items-center gap-2"
                                            >
                                                <span>Siguiente Paso</span>
                                                <ArrowRight className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* PASO 2: MINISTERIO Y EXTENSIÓN */}
                                {step === 2 && (
                                    <div className="space-y-6 animate-in fade-in duration-200">
                                        <div className="border-b border-slate-800 pb-3 flex items-center gap-2 text-amber-400 font-semibold text-sm">
                                            <Award className="size-4" />
                                            <span>Información Ministerial y de la Extensión</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Grado Ministerial */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                                    Grado Ministerial <span className="text-rose-400">*</span>
                                                </label>
                                                <select
                                                    value={data.nivel_ministerial}
                                                    onChange={(e) => setData('nivel_ministerial', e.target.value)}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                                                >
                                                    {gradosMinisteriales.map((gm) => (
                                                        <option key={gm} value={gm}>
                                                            {gm}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.nivel_ministerial && <p className="text-xs text-rose-400">{errors.nivel_ministerial}</p>}
                                            </div>

                                            {/* Último año de promoción */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                                    Último Año de Promoción
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.ano_promocion}
                                                    onChange={(e) => setData('ano_promocion', e.target.value)}
                                                    placeholder="Ej. 2020"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition"
                                                />
                                                {errors.ano_promocion && <p className="text-xs text-rose-400">{errors.ano_promocion}</p>}
                                            </div>

                                            {/* Nombre de la Extensión */}
                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                                    <Church className="size-3.5 text-slate-400" />
                                                    Nombre de la Extensión (Iglesia) <span className="text-rose-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={data.nombre_extension}
                                                    onChange={(e) => setData('nombre_extension', e.target.value)}
                                                    placeholder="Ej. MMM Central Barquisimeto"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition"
                                                />
                                                {errors.nombre_extension && <p className="text-xs text-rose-400">{errors.nombre_extension}</p>}
                                            </div>

                                            {/* Dirección de la extensión */}
                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                                    <MapPin className="size-3.5 text-slate-400" />
                                                    Dirección de la Extensión (Iglesia) <span className="text-rose-400">*</span>
                                                </label>
                                                <textarea
                                                    required
                                                    rows={2}
                                                    value={data.direccion_extension}
                                                    onChange={(e) => setData('direccion_extension', e.target.value)}
                                                    placeholder="Ej. Av. Principal con Calle 12, Sector Centro"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition resize-none"
                                                />
                                                {errors.direccion_extension && <p className="text-xs text-rose-400">{errors.direccion_extension}</p>}
                                            </div>

                                            {/* Estado */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                                    Estado <span className="text-rose-400">*</span>
                                                </label>
                                                <select
                                                    value={data.estado_id}
                                                    onChange={(e) => setData('estado_id', e.target.value)}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                                                >
                                                    {estados.map((est) => (
                                                        <option key={est.id} value={est.id}>
                                                            {est.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.estado_id && <p className="text-xs text-rose-400">{errors.estado_id}</p>}
                                            </div>

                                            {/* Zona */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                                    Zona
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.zona}
                                                    onChange={(e) => setData('zona', e.target.value)}
                                                    placeholder="Ej. Zona 1"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition"
                                                />
                                                {errors.zona && <p className="text-xs text-rose-400">{errors.zona}</p>}
                                            </div>

                                            {/* Distrito */}
                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                                    Distrito
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.distrito}
                                                    onChange={(e) => setData('distrito', e.target.value)}
                                                    placeholder="Ej. Distrito Central"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition"
                                                />
                                                {errors.distrito && <p className="text-xs text-rose-400">{errors.distrito}</p>}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                            <Button
                                                type="button"
                                                onClick={prevStep}
                                                variant="outline"
                                                className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center gap-2"
                                            >
                                                <ArrowLeft className="size-4" />
                                                <span>Anterior</span>
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={nextStep}
                                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/10 flex items-center gap-2"
                                            >
                                                <span>Siguiente Paso</span>
                                                <ArrowRight className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* PASO 3: ARCHIVOS Y FOTOGRAFÍAS */}
                                {step === 3 && (
                                    <div className="space-y-6 animate-in fade-in duration-200">
                                        <div className="border-b border-slate-800 pb-3 flex items-center gap-2 text-amber-400 font-semibold text-sm">
                                            <Camera className="size-4" />
                                            <span>Documentos y Fotografías Requeridas</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Dropzone 1: Foto de la Cédula */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                                                    <span>Foto de la Cédula de Identidad <span className="text-rose-400">*</span></span>
                                                    <span className="text-[10px] text-slate-400">Anverso Legible</span>
                                                </label>
                                                <div className="relative border-2 border-dashed border-slate-800 hover:border-amber-400/60 rounded-2xl p-4 bg-slate-950/50 flex flex-col items-center justify-center text-center transition group">
                                                    {fotoCedulaPreview ? (
                                                        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                                                            <img
                                                                src={fotoCedulaPreview}
                                                                alt="Cédula Preview"
                                                                className="w-full h-full object-contain"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setFotoCedulaPreview(null);
                                                                    setData('foto_cedula', null);
                                                                }}
                                                                className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1 text-xs hover:bg-rose-600 transition shadow"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="cursor-pointer w-full py-6 flex flex-col items-center justify-center gap-2">
                                                            <div className="size-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                                                                <IdCard className="size-6" />
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <p className="text-xs font-semibold text-slate-200">
                                                                    Haz clic para subir la foto de tu Cédula
                                                                </p>
                                                                <p className="text-[10px] text-slate-500">
                                                                    Usada como validador de los datos ingresados (PNG, JPG max 5MB)
                                                                </p>
                                                            </div>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                required
                                                                onChange={(e) => handleFileChange(e, 'foto_cedula', setFotoCedulaPreview)}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    )}
                                                </div>
                                                {errors.foto_cedula && <p className="text-xs text-rose-400">{errors.foto_cedula}</p>}
                                            </div>

                                            {/* Dropzone 2: Foto Tipo Carnet */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                                                    <span>Foto Tipo Carnet <span className="text-rose-400">*</span></span>
                                                    <span className="text-[10px] text-amber-400 font-medium">Fondo Blanco • Medio Cuerpo</span>
                                                </label>
                                                <div className="relative border-2 border-dashed border-slate-800 hover:border-amber-400/60 rounded-2xl p-4 bg-slate-950/50 flex flex-col items-center justify-center text-center transition group">
                                                    {fotoPerfilPreview ? (
                                                        <div className="relative w-full aspect-square max-w-[180px] mx-auto rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                                                            <img
                                                                src={fotoPerfilPreview}
                                                                alt="Perfil Preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setFotoPerfilPreview(null);
                                                                    setData('foto', null);
                                                                }}
                                                                className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1 text-xs hover:bg-rose-600 transition shadow"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="cursor-pointer w-full py-6 flex flex-col items-center justify-center gap-2">
                                                            <div className="size-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                                                                <User className="size-6" />
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <p className="text-xs font-semibold text-slate-200">
                                                                    Haz clic para subir tu foto formal
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-medium">
                                                                    Requisito: Fondo blanco, vestimenta formal, medio cuerpo.
                                                                </p>
                                                            </div>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                required
                                                                onChange={(e) => handleFileChange(e, 'foto', setFotoPerfilPreview)}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    )}
                                                </div>
                                                {errors.foto && <p className="text-xs text-rose-400">{errors.foto}</p>}
                                            </div>
                                        </div>

                                        {/* Nota de Declaración / Veracidad */}
                                        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-xs text-amber-300">
                                            <AlertCircle className="size-4 shrink-0 mt-0.5" />
                                            <p>
                                                Declaración de Veracidad: Al enviar este formulario declaro que los datos ingresados y las fotografías adjuntas son fidedignos y corresponden al titular.
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                            <Button
                                                type="button"
                                                onClick={prevStep}
                                                variant="outline"
                                                className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center gap-2"
                                            >
                                                <ArrowLeft className="size-4" />
                                                <span>Anterior</span>
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2"
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
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="w-full border-t border-slate-800 bg-slate-900/60 py-4 text-center text-xs text-slate-500">
                    <div className="max-w-6xl mx-auto px-4">
                        &copy; {new Date().getFullYear()} Movimiento Misionero Mundial Venezuela. Todos los derechos reservados.
                    </div>
                </footer>
            </div>
        </>
    );
}
