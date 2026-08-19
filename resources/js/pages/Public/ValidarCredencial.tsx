import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ShieldCheck, ShieldAlert, CheckCircle2, Award, MapPin, User, Calendar, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PastorVerification {
    id: number;
    codigo: string;
    nombres: string;
    apellidos: string;
    documento: string;
    foto?: string;
    nivel_ministerial: string;
    cargo_nacional?: string;
    zona?: string;
    distrito?: string;
    status: boolean;
    estado?: string;
    municipio?: string;
}

interface ValidarCredencialProps {
    pastor: PastorVerification | null;
    codigoBuscado: string;
}

export default function ValidarCredencialPage({ pastor, codigoBuscado }: ValidarCredencialProps) {
    const getPastorPhotoUrl = (foto?: string | null) => {
        if (!foto) return null;
        const trimmed = foto.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('data:') || trimmed.startsWith('http') || trimmed.startsWith('/')) {
            return trimmed;
        }
        return `/pastores/${trimmed}`;
    };

    const photoUrl = pastor ? getPastorPhotoUrl(pastor.foto) : null;
    const initials = pastor
        ? `${pastor.nombres?.trim()?.[0] || ''}${pastor.apellidos?.trim()?.[0] || ''}`.toUpperCase()
        : 'P';

    return (
        <>
            <Head title={pastor ? `Verificación: ${pastor.nombres} ${pastor.apellidos}` : 'Credencial no encontrada'} />

            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
                {/* Contenedor Principal */}
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header Institucional */}
                    <div className="bg-gradient-to-r from-indigo-950 via-blue-900 to-indigo-950 p-6 text-center border-b border-indigo-800/40 relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 size-36 bg-blue-500/10 rounded-full blur-2xl" />
                        <div className="relative z-10 flex flex-col items-center">
                            <img
                                src="/icons/logo_mmm.png"
                                alt="Logo MMM"
                                className="h-14 w-auto object-contain mb-3 drop-shadow-md"
                            />
                            <h1 className="text-sm font-black tracking-wider uppercase text-white">
                                MOVIMIENTO MISIONERO MUNDIAL
                            </h1>
                            <p className="text-[11px] font-semibold text-blue-200 uppercase tracking-widest mt-0.5">
                                República Bolivariana de Venezuela
                            </p>
                            <span className="text-[9px] font-mono text-slate-300 mt-1 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                                RIF: J-30187446-3 • N° DG/520 DF/620-100.361
                            </span>
                        </div>
                    </div>

                    {pastor ? (
                        <div className="p-6 space-y-6">
                            {/* Insignia de Verificación */}
                            <div className="flex items-center justify-center gap-2 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 py-2.5 px-4 rounded-2xl shadow-inner">
                                <ShieldCheck className="size-5 text-emerald-400 shrink-0" />
                                <span className="text-xs font-bold uppercase tracking-wide">
                                    CREDENCIAL MINISTERIAL OFICIAL Y VÁLIDA
                                </span>
                            </div>

                            {/* Foto + Nombres */}
                            <div className="flex flex-col items-center text-center">
                                <div className="size-28 rounded-full ring-4 ring-blue-500/30 shadow-2xl overflow-hidden bg-slate-800 flex items-center justify-center border-2 border-white/20 mb-3">
                                    {photoUrl ? (
                                        <img
                                            src={photoUrl}
                                            alt={`${pastor.nombres} ${pastor.apellidos}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-blue-800 text-white font-bold text-2xl flex items-center justify-center">
                                            {initials}
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-xl font-extrabold text-white tracking-tight uppercase">
                                    {pastor.nombres} {pastor.apellidos}
                                </h2>

                                <p className="text-xs font-mono font-semibold text-blue-300 mt-0.5">
                                    C.I: {pastor.documento} • Código: {pastor.codigo}
                                </p>

                                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-900/60 text-cyan-200 border border-blue-700/50">
                                    <Award className="size-3.5" />
                                    <span>{pastor.nivel_ministerial || 'MINISTRO ORDENADO'}</span>
                                </div>
                            </div>

                            {/* Detalles de Registro */}
                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3 text-xs">
                                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                                        <Building2 className="size-3.5 text-blue-400" />
                                        Estado de Credencial:
                                    </span>
                                    <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${pastor.status ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                                        {pastor.status ? 'ACTIVO / HABITADO' : 'INACTIVO'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                                        <MapPin className="size-3.5 text-blue-400" />
                                        Ubicación Eclesiástica:
                                    </span>
                                    <span className="font-semibold text-slate-200">
                                        Zona {pastor.zona || '—'} • Distrito {pastor.distrito || '—'}
                                    </span>
                                </div>

                                {pastor.cargo_nacional && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                                            <Award className="size-3.5 text-blue-400" />
                                            Cargo Nacional:
                                        </span>
                                        <span className="font-semibold text-amber-300">
                                            {pastor.cargo_nacional}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Mensaje de Garantía Institucional */}
                            <p className="text-[10px] text-center text-slate-400 leading-relaxed italic">
                                "Esta acreditación confirma que el portador es un ministro acreditado del Movimiento Misionero Mundial en Venezuela. Se solicita a las autoridades civiles y militares brindar la colaboración necesaria."
                            </p>
                        </div>
                    ) : (
                        <div className="p-8 text-center space-y-4">
                            <div className="inline-flex p-4 rounded-full bg-rose-950/60 border border-rose-800/60 text-rose-400">
                                <ShieldAlert className="size-10" />
                            </div>
                            <h2 className="text-lg font-bold text-white">Credencial no Encontrada</h2>
                            <p className="text-xs text-slate-400">
                                No se encontró ningún registro para el código o documento: <span className="font-mono text-slate-200 font-bold">{codigoBuscado}</span>.
                            </p>
                        </div>
                    )}

                    <div className="p-4 bg-slate-950 border-t border-slate-800/80 text-center">
                        <span className="text-[10px] text-slate-500">
                            © {new Date().getFullYear()} Movimiento Misionero Mundial de Venezuela. Todos los derechos reservados.
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
