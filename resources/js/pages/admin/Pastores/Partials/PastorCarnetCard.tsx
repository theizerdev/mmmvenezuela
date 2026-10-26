import React from 'react';
import { cn } from '@/lib/utils';
import type { Pastor } from '../Index';
import { useTranslate } from '@/hooks/use-translate';
import { QrCode, Scissors } from 'lucide-react';

export interface PastorCarnetCardProps {
    pastor: Pastor;
    activeSide?: 'front' | 'back';
    onFlip?: () => void;
    onEditPhoto?: () => void;
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

/**
 * Retorna la línea de ubicación inferior para el reverso del carnet (ej: CARACAS - ZONA 1- DISTRITO 1)
 */
export function getPastorCarnetReversoLocation(pastor: Pastor): string {
    let lugar = '';
    if (pastor.extension_nombre && pastor.extension_nombre.trim()) {
        lugar = pastor.extension_nombre.trim();
    } else if ((pastor as any).extension && typeof (pastor as any).extension === 'string') {
        lugar = (pastor as any).extension.trim();
    } else if (Array.isArray((pastor as any).iglesias) && (pastor as any).iglesias.length > 0) {
        const ig = (pastor as any).iglesias[0];
        if (ig?.nombre) lugar = ig.nombre.trim();
    } else if ((pastor as any).municipio) {
        lugar = (pastor as any).municipio;
    }

    if (/^iglesia\s+central\s+/i.test(lugar)) {
        lugar = lugar.replace(/^iglesia\s+central\s+/i, '');
    } else if (/^iglesia\s+extensi[oó]n\s+/i.test(lugar)) {
        lugar = lugar.replace(/^iglesia\s+extensi[oó]n\s+/i, '');
    } else if (/^iglesia\s+/i.test(lugar)) {
        lugar = lugar.replace(/^iglesia\s+/i, '');
    }

    if (/catia/i.test(lugar) || (pastor as any).estado_id === 10) {
        lugar = 'CARACAS';
    }

    if (!lugar || /^zona\s+/i.test(lugar)) {
        lugar = (pastor as any).municipio || 'VENEZUELA';
    }

    let linea = lugar.trim().toUpperCase();
    if (pastor.zona) {
        linea += ` - ZONA ${pastor.zona}`;
    }
    if (pastor.distrito) {
        linea += `- DISTRITO ${pastor.distrito}`;
    }
    return linea;
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
    onEditPhoto,
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

    const cleanLugar = React.useMemo(() => {
        let str = lugarTrabajo.trim();
        if (str.length > 24 && /^iglesia\s+extensi[oó]n\s+/i.test(str)) {
            str = str.replace(/^iglesia\s+/i, '');
        }
        return str.toUpperCase();
    }, [lugarTrabajo]);

    const reversoLocation = React.useMemo(() => getPastorCarnetReversoLocation(pastor), [pastor]);

    const rawFullName = getPastorCarnetFullName(pastor, true);
    const nameFontSize = rawFullName.length > 28
        ? 'text-[15px]'
        : (rawFullName.length > 22 ? 'text-[17px]' : 'text-[19.5px]');

    const lugarFontSize = cleanLugar.length > 28
        ? 'text-[11px]'
        : (cleanLugar.length > 20 ? 'text-[12.5px]' : 'text-[14px]');

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
                        {/* Foto Rectangular Tipo Carnet Calibrada (Izquierda - Encaja exactamente en el marco oficial: 198x286 px en vista 720x440) */}
                        <div
                            onClick={interactive && onEditPhoto ? (e) => { e.stopPropagation(); onEditPhoto(); } : undefined}
                            className={cn(
                                'absolute left-[52px] top-[118px] w-[198px] h-[286px] rounded-[16px] overflow-hidden bg-transparent flex items-center justify-center group/photo',
                                interactive && onEditPhoto && 'cursor-pointer'
                            )}
                            style={{
                                left: '52px',
                                top: '118px',
                                width: '198px',
                                height: '286px',
                                borderRadius: '16px',
                            }}
                            title={interactive && onEditPhoto ? __('Haz clic para ajustar la foto al marco oficial') : undefined}
                        >
                            {photoUrl && !imgError ? (
                                <img
                                    src={photoUrl}
                                    alt=""
                                    className="w-full h-full object-cover object-top bg-transparent transition-transform duration-300 group-hover/photo:scale-[1.02]"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <div className="w-full h-full bg-transparent flex items-center justify-center">
                                    <span
                                        className="font-cocogoose font-black text-5xl tracking-widest select-none text-slate-500/40"
                                        style={{ fontFamily: "'Cocogoose', 'COCOGOOSE', sans-serif", fontWeight: 900 }}
                                    >
                                        {initials}
                                    </span>
                                </div>
                            )}

                            {/* Botón interactivo superpuesto al pasar el mouse sobre la foto */}
                            {interactive && onEditPhoto && (
                                <div className="absolute inset-x-0 bottom-0 py-2 bg-gradient-to-t from-slate-950/85 via-slate-900/60 to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-[11px] font-semibold pointer-events-none">
                                    <Scissors className="size-3 text-emerald-400" />
                                    <span>{__('Ajustar al Marco')}</span>
                                </div>
                            )}
                        </div>

                        {/* Bloque 1: Identificación Titular (Debajo del banner PASTOR) */}
                        <div className="absolute left-[255px] w-[430px] top-[206px] h-[34px] flex items-center justify-center text-center px-3 pointer-events-none">
                            <h2
                                className={cn('font-cocogoose font-bold uppercase tracking-tight text-black whitespace-nowrap select-text leading-none', nameFontSize)}
                                style={{ fontFamily: "'Cocogoose', 'COCOGOOSE', sans-serif", fontWeight: 700 }}
                            >
                                {rawFullName}
                            </h2>
                        </div>

                        {/* Bloque 2: Cédula de Identidad (Aribau Grotesk Regular) */}
                        <div className="absolute left-[255px] w-[430px] top-[243px] h-[20px] flex items-center justify-center text-center px-3 pointer-events-none">
                            <p
                                className="font-aribau text-[13px] font-normal text-slate-900 tracking-wider whitespace-nowrap select-text leading-none"
                                style={{ fontFamily: "'Aribau Grotesk', 'Instrument Sans', sans-serif" }}
                            >
                                C.I. {formatDocumento(pastor.documento)}
                            </p>
                        </div>

                        {/* Bloque 3: Grado Ministerial - Valor (Titular Cocogoose, ubicado DIRECTAMENTE ARRIBA de la etiqueta GRADO MINISTERIAL) */}
                        <div className="absolute left-[255px] w-[430px] top-[270px] h-[26px] flex items-center justify-center text-center px-3 pointer-events-none">
                            <span
                                className="font-cocogoose text-[15px] font-bold uppercase tracking-wide text-black text-center whitespace-nowrap select-text leading-none"
                                style={{ fontFamily: "'Cocogoose', 'COCOGOOSE', sans-serif", fontWeight: 700 }}
                            >
                                {pastor.nivel_ministerial || 'MINISTRO ORDENADO'}
                            </span>
                        </div>

                        {/* Bloque 4: Lugar de Trabajo - Valor (Titular Cocogoose, ubicado DIRECTAMENTE ARRIBA de la etiqueta LUGAR DE TRABAJO) */}
                        <div className="absolute left-[255px] w-[430px] top-[334px] h-[26px] flex items-center justify-center text-center px-3 pointer-events-none">
                            <span
                                className={cn('font-cocogoose font-bold uppercase tracking-wide text-black text-center whitespace-nowrap select-text leading-none', lugarFontSize)}
                                style={{ fontFamily: "'Cocogoose', 'COCOGOOSE', sans-serif", fontWeight: 700 }}
                            >
                                {cleanLugar}
                            </span>
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
                        {/* Sección Inferior Izquierda: Nombre en Cursiva y Ubicación (idéntico a ejemplo.png) */}
                        <div
                            className="absolute text-left pointer-events-none select-text"
                            style={{
                                left: '58px',
                                top: '344px',
                                width: '470px',
                            }}
                        >
                            <span
                                className="text-[19px] italic font-normal tracking-tight text-black block leading-[24px] truncate"
                                style={{
                                    fontFamily: "'Instrument Sans', 'Aribau Grotesk', Arial, sans-serif",
                                    fontStyle: 'italic',
                                }}
                            >
                                {getPastorCarnetFullName(pastor, false)}
                            </span>
                            <span
                                className="text-[11.5px] font-bold uppercase text-black tracking-wider block mt-1 leading-none truncate"
                                style={{
                                    fontFamily: "'Aribau Grotesk', 'Instrument Sans', Arial, sans-serif",
                                }}
                            >
                                {reversoLocation}
                            </span>
                        </div>

                        {/* Sección Inferior Derecha: Código QR Oficial de Validación (sin marco ni texto decorativo, idéntico a ejemplo.png) */}
                        <div
                            className="absolute flex items-center justify-center shrink-0"
                            style={{
                                left: '556px',
                                top: '294px',
                                width: '96px',
                                height: '96px',
                            }}
                            title={__('Escanear para verificar credencial')}
                        >
                            <img
                                src={qrImageUrl}
                                alt={__('Verification QR Code')}
                                className="w-full h-full object-contain"
                                crossOrigin="anonymous"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
