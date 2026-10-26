import React from 'react';
import { cn } from '@/lib/utils';
import type { Pastor } from '../Index';
import { useTranslate } from '@/hooks/use-translate';
import { QrCode } from 'lucide-react';

export interface PastorCarnetCardProps {
    pastor: Pastor;
    activeSide?: 'front' | 'back';
    onFlip?: () => void;
    interactive?: boolean;
    scale?: number;
    templateFrontUrl?: string;
    templateBackUrl?: string;
    className?: string;
}

export function formatDocumento(doc?: string) {
    if (!doc) return 'V-00.000.000';
    const clean = doc.trim().toUpperCase();
    if (clean.includes('-')) return clean;
    const match = clean.match(/^([VEJ])?(\d+)$/);
    if (match) {
        const letter = match[1] || 'V';
        const num = parseInt(match[2], 10).toLocaleString('es-VE');
        return `${letter}-${num}`;
    }
    return clean;
}

/**
 * Retorna el nombre completo del pastor con el prefijo "REV." si es Ministro Ordenado
 */
export function getPastorCarnetFullName(pastor: Pastor, uppercase = false): string {
    const raw = `${pastor.nombres || ''} ${pastor.apellidos || ''}`.trim().replace(/\s+/g, ' ');
    const isOrdenado = (pastor.nivel_ministerial || '').toLowerCase().includes('ordenado');
    let fullName = raw;

    if (isOrdenado && !/^rev\.?\s+/i.test(raw)) {
        fullName = uppercase ? `REV. ${raw}` : `Rev. ${raw}`;
    }

    return uppercase ? fullName.toUpperCase() : fullName;
}

export function getPastorPhotoUrl(foto?: string | null): string | null {
    if (!foto) return null;
    const trimmed = foto.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }
    if (trimmed.startsWith('storage/')) {
        return `/${trimmed}`;
    }
    if (trimmed.startsWith('pastores/')) {
        return `/storage/${trimmed}`;
    }
    if (trimmed.startsWith('/')) {
        return trimmed;
    }
    return `/pastores/${trimmed}`;
}

export function PastorCarnetCard({
    pastor,
    activeSide = 'front',
    onFlip,
    interactive = true,
    scale = 1,
    templateFrontUrl = '/image/Credencial-frente.png',
    templateBackUrl = '/image/Credencial-atras.png',
    className,
}: PastorCarnetCardProps) {
    const { __ } = useTranslate();
    const photoUrl = getPastorPhotoUrl(pastor.foto || (pastor as any).foto_url);
    const initials = `${pastor.nombres?.trim()?.[0] || ''}${pastor.apellidos?.trim()?.[0] || ''}`.toUpperCase() || 'P';
    const [imgError, setImgError] = React.useState(false);

    const lugarTrabajo = React.useMemo(() => {
        // Priorizar el nombre oficial de la extensión donde se encuentra el pastor
        if (pastor.extension_nombre && pastor.extension_nombre.trim()) {
            return pastor.extension_nombre.trim();
        }
        if ((pastor as any).extension && typeof (pastor as any).extension === 'string') {
            return (pastor as any).extension.trim();
        }
        if (Array.isArray((pastor as any).iglesias) && (pastor as any).iglesias.length > 0) {
            const ig = (pastor as any).iglesias[0];
            if (ig?.nombre) return ig.nombre.trim();
        }
        const parts: string[] = [];
        if (pastor.zona) parts.push(`ZONA ${pastor.zona}`);
        if (pastor.distrito) parts.push(pastor.distrito);
        if (parts.length === 0) return 'REPÚBLICA BOLIVARIANA DE VENEZUELA';
        return parts.join(' • ');
    }, [pastor.extension_nombre, (pastor as any).extension, (pastor as any).iglesias, pastor.zona, pastor.distrito]);

    React.useEffect(() => {
        setImgError(false);
    }, [photoUrl]);

    const verificationUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/validar-credencial/${encodeURIComponent(pastor.codigo || pastor.documento || pastor.id)}`
        : `/validar-credencial/${pastor.codigo || pastor.id}`;

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(verificationUrl)}`;

    const isFlipped = activeSide === 'back';

    return (
        <div
            className={cn('relative select-none flex items-center justify-center shrink-0 overflow-visible', className)}
            style={{
                width: `${Math.round(720 * scale)}px`,
                height: `${Math.round(440 * scale)}px`,
            }}
        >
            {/* Contenedor anclado al centro absoluto con perspectiva 3D (Formato Oficial 9cm x 5.5cm) */}
            <div
                style={{
                    width: '720px',
                    height: '440px',
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    transformOrigin: 'center center',
                    perspective: '1400px',
                }}
                className="shrink-0 flex items-center justify-center pointer-events-auto"
            >
                {/* Elemento que rota 3D con pivot exacto en el CENTRO */}
                <div
                    onClick={interactive ? onFlip : undefined}
                    className={cn(
                        'relative w-[720px] h-[440px] rounded-2xl shadow-2xl transition-transform duration-700 ease-out',
                        interactive && 'cursor-pointer hover:shadow-indigo-500/25'
                    )}
                    style={{
                        transformStyle: 'preserve-3d',
                        transformOrigin: 'center center',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                >
                    {/* --- CARA FRONTAL (FRONT) --- */}
                    <div
                        className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-slate-300/80 bg-white text-slate-900 shadow-xl"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            backgroundImage: `url('${templateFrontUrl}')`,
                            backgroundSize: '100% 100%',
                            backgroundRepeat: 'no-repeat',
                        }}
                    >
                        {/* Foto Rectangular Tipo Carnet Calibrada (Izquierda - Encaja exactamente en el marco de la plantilla) */}
                        <div className="absolute left-[39px] top-[117px] w-[208px] h-[288px] rounded-[14px] overflow-hidden bg-transparent flex items-center justify-center">
                            {photoUrl && !imgError ? (
                                <img
                                    src={photoUrl}
                                    alt=""
                                    className="w-full h-full object-cover object-top bg-transparent"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <div className="w-full h-full bg-transparent flex items-center justify-center">
                                    <span className="font-cocogoose font-black text-5xl tracking-widest select-none text-slate-500/40">
                                        {initials}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Bloque 1: Identificación Titular (Debajo del banner PASTOR, encima de GRADO MINISTERIAL) */}
                        <div className="absolute left-[260px] right-[26px] top-[190px] h-[82px] flex flex-col items-center justify-center text-center px-2">
                            <h2 className="font-cocogoose text-[19px] font-bold uppercase leading-tight tracking-tight text-black line-clamp-2">
                                {getPastorCarnetFullName(pastor, true)}
                            </h2>
                            <p className="font-aribau text-[13.5px] font-normal text-slate-800 mt-1 tracking-wider">
                                C.I. {formatDocumento(pastor.documento)}
                            </p>
                        </div>

                        {/* Bloque 2: Grado Ministerial (Valor oficial en Titular Cocogoose, ubicado DIRECTAMENTE ARRIBA de la etiqueta GRADO MINISTERIAL) */}
                        <div className="absolute left-[260px] right-[26px] top-[276px] h-[30px] flex items-end justify-center px-2">
                            <span className="font-cocogoose text-[15px] font-bold uppercase tracking-wide text-black text-center line-clamp-1">
                                {pastor.nivel_ministerial || 'MINISTRO ORDENADO'}
                            </span>
                        </div>

                        {/* Bloque 3: Lugar de Trabajo (Valor oficial en Titular Cocogoose, ubicado DIRECTAMENTE ARRIBA de la etiqueta LUGAR DE TRABAJO) */}
                        <div className="absolute left-[260px] right-[26px] top-[332px] h-[35px] flex items-end justify-center px-2">
                            <span className="font-cocogoose text-[13px] font-bold uppercase tracking-wide text-black text-center line-clamp-2 leading-tight">
                                {lugarTrabajo}
                            </span>
                        </div>

                        {/* Indicador de Identidad y Medida Oficial (9cm x 5.5cm) */}
                        <div className="absolute right-4 bottom-2 text-[8px] uppercase font-aribau font-semibold text-slate-400/80 tracking-wider">
                            90 × 55 mm • FORMATO OFICIAL
                        </div>
                    </div>

                    {/* --- CARA TRASERA (BACK) --- */}
                    <div
                        className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-slate-300 bg-white text-slate-900 shadow-xl"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            backgroundImage: `url('${templateBackUrl}')`,
                            backgroundSize: '100% 100%',
                            backgroundRepeat: 'no-repeat',
                        }}
                    >
                        {/* Sección Inferior Izquierda: Nombre Titular y Cédula (zona libre bajo el texto legal) */}
                        <div className="absolute left-[54px] top-[328px] w-[450px] text-left">
                            <span className="font-cocogoose text-[16px] font-bold uppercase text-[#0f3563] tracking-wide block leading-[22px] truncate">
                                {getPastorCarnetFullName(pastor, false)}
                            </span>
                            <span className="font-aribau text-[11.5px] font-medium text-slate-600 block mt-0.5">
                                C.I. {formatDocumento(pastor.documento)}{pastor.codigo ? `  |  Cód: ${pastor.codigo}` : ''}
                            </span>
                            <div className="font-aribau mt-[12px] w-[230px] border-t border-slate-400/80 pt-1 text-[8px] uppercase font-bold text-slate-500 tracking-wider">
                                Firma del Ministro Titular
                            </div>
                        </div>

                        {/* Sección Inferior Derecha: Código QR Oficial de Validación (alejado de la cinta decorativa) */}
                        <div className="absolute left-[530px] top-[296px] w-[96px] flex flex-col items-center shrink-0" title={__('Escanear para verificar credencial')}>
                            <div className="size-[96px] p-[6px] bg-white border border-[#e2d08a] rounded-lg shadow-sm flex items-center justify-center">
                                <img
                                    src={qrImageUrl}
                                    alt={__('Verification QR Code')}
                                    className="size-[84px] object-contain"
                                    crossOrigin="anonymous"
                                />
                            </div>
                            <span className="font-aribau text-[7.5px] font-extrabold text-slate-600 uppercase tracking-wide mt-1 flex items-center gap-1 whitespace-nowrap">
                                <QrCode className="size-2.5 text-[#d9820b]" />
                                {__('Validar QR')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
