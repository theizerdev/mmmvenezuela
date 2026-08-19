import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, RotateCw, ShieldCheck, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Pastor } from '../Index';
import { useTranslate } from '@/hooks/use-translate';

interface PastorCarnetModalProps {
    pastor: Pastor | null;
    isOpen: boolean;
    onClose: () => void;
}

export function PastorCarnetModal({ pastor, isOpen, onClose }: PastorCarnetModalProps) {
    const { __ } = useTranslate();
    const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');

    if (!pastor) return null;

    const getPastorPhotoUrl = (foto?: string | null) => {
        if (!foto) return null;
        const trimmed = foto.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('data:') || trimmed.startsWith('http') || trimmed.startsWith('/')) {
            return trimmed;
        }
        return `/pastores/${trimmed}`;
    };

    const photoUrl = getPastorPhotoUrl(pastor.foto);
    const initials = `${pastor.nombres?.trim()?.[0] || ''}${pastor.apellidos?.trim()?.[0] || ''}`.toUpperCase() || 'P';

    const formatDocumento = (doc?: string) => {
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
    };

    const handleDownloadPdf = () => {
        window.open(`/admin/pastores/${pastor.id}/carnet-pdf`, '_blank');
    };

    // URL oficial de verificación para el QR
    const verificationUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/validar-credencial/${encodeURIComponent(pastor.codigo || pastor.documento || pastor.id)}`
        : `/validar-credencial/${pastor.codigo}`;

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verificationUrl)}`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card border border-border shadow-2xl rounded-2xl">
                <DialogHeader className="p-5 pb-3 border-b bg-gradient-to-r from-indigo-950 via-blue-950 to-indigo-950 text-white flex flex-row items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-5 text-indigo-300" />
                            <DialogTitle className="text-lg font-bold text-white tracking-tight">
                                {__('Carnet Ministerial / Credencial')}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-indigo-200 mt-0.5">
                            {pastor.nombres} {pastor.apellidos} ({pastor.codigo})
                        </DialogDescription>
                    </div>

                    {/* Selector de Pestaña (Frontal / Reverso) */}
                    <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg border border-white/10">
                        <Button
                            type="button"
                            variant={activeTab === 'front' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('front')}
                            className={cn(
                                "h-7 px-3 text-xs font-semibold shadow-none transition-colors",
                                activeTab === 'front' ? "bg-white text-indigo-950 font-bold" : "text-white hover:bg-white/20"
                            )}
                        >
                            {__('Frontal')}
                        </Button>
                        <Button
                            type="button"
                            variant={activeTab === 'back' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('back')}
                            className={cn(
                                "h-7 px-3 text-xs font-semibold shadow-none transition-colors",
                                activeTab === 'back' ? "bg-white text-indigo-950 font-bold" : "text-white hover:bg-white/20"
                            )}
                        >
                            {__('Reverso')}
                        </Button>
                    </div>
                </DialogHeader>

                <div className="p-6 bg-slate-950/20 flex flex-col items-center justify-center min-h-[400px] select-none">
                    {/* Contenedor del Carnet CR80 Proporcional (510px x 321px) */}
                    <div
                        className="w-[510px] h-[321px] relative shadow-2xl rounded-xl overflow-hidden border border-slate-700/50 cursor-pointer transition-all duration-300 hover:shadow-indigo-500/20"
                        onClick={() => setActiveTab(activeTab === 'front' ? 'back' : 'front')}
                    >
                        {activeTab === 'front' ? (
                            /* --- CARA FRONTAL (FRONT - Réplica Exacta a Imagen 1) --- */
                            <div className="w-full h-full bg-[#0f3563] text-white p-4 flex flex-col justify-between overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
                                {/* Franja Diagonal Marfil/Crema (#ded7c5) */}
                                <div
                                    className="absolute inset-0 bg-[#ded7c5] pointer-events-none opacity-95"
                                    style={{
                                        clipPath: 'polygon(0% 100%, 21% 100%, 54% 0%, 37% 0%)'
                                    }}
                                />

                                {/* Header Derecho: Logo MMM + Textos Legales Exactos */}
                                <div className="relative z-10 flex items-start justify-between">
                                    <div className="w-16" />
                                    <div className="flex items-center gap-2.5 ml-auto text-right">
                                        <img
                                            src="/icons/logo_mmm.png"
                                            alt="Logo MMM"
                                            className="h-10 w-auto object-contain drop-shadow-md"
                                            onError={(e) => {
                                                (e.target as HTMLElement).style.display = 'none';
                                            }}
                                        />
                                        <div className="flex flex-col text-right leading-tight">
                                            <span className="text-[8.5px] font-extrabold uppercase tracking-tight text-white drop-shadow-xs whitespace-nowrap">
                                                MOVIMIENTO MISIONERO MUNDIAL
                                            </span>
                                            <span className="text-[6.5px] font-medium text-slate-100 mt-0.5 whitespace-nowrap">
                                                Inscrita en la Dirección de Justicia y Culto
                                            </span>
                                            <span className="text-[6.5px] font-medium text-slate-100 whitespace-nowrap">
                                                bajo el N° DG/520 DF/620-100.361
                                            </span>
                                            <span className="text-[7.5px] font-bold text-white tracking-wider mt-0.5 whitespace-nowrap">
                                                J - 3 0 1 8 7 4 4 6 - 3
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Cuerpo Principal: Foto Pastor (Izquierda) + Información (Derecha) */}
                                <div className="relative z-10 grid grid-cols-12 gap-3 items-center my-auto pl-1">
                                    {/* Foto Circular con Borde Ancho Crema (#ded7c5) */}
                                    <div className="col-span-5 flex justify-center">
                                        <div className="relative size-[145px] rounded-full border-[4px] border-[#ded7c5] shadow-2xl overflow-hidden bg-slate-800 flex items-center justify-center aspect-square">
                                            {photoUrl ? (
                                                <img
                                                    src={photoUrl}
                                                    alt={`${pastor.nombres} ${pastor.apellidos}`}
                                                    className="w-full h-full object-cover object-center rounded-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-indigo-700 to-blue-900 text-white font-black text-3xl flex items-center justify-center rounded-full">
                                                    {initials}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Textos: Nombre, Cédula y Acreditación Ministerial */}
                                    <div className="col-span-7 flex flex-col justify-center text-left pl-2">
                                        <h2 className="text-[16px] font-black uppercase leading-tight tracking-tight text-white line-clamp-2 drop-shadow-md">
                                            {pastor.nombres} {pastor.apellidos}
                                        </h2>
                                        <p className="text-[13px] font-extrabold text-slate-100 mt-1 tracking-wider">
                                            {formatDocumento(pastor.documento)}
                                        </p>

                                        <div className="mt-3">
                                            <span className="block text-[10.5px] font-normal text-slate-200 tracking-normal">
                                                Acreditación Ministerial
                                            </span>
                                            <span className="block text-[14px] font-black uppercase tracking-wide text-cyan-200 drop-shadow-sm mt-0.5">
                                                {pastor.nivel_ministerial || 'MINISTRO ORDENADO'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pie del Carnet: Lema en 2 Líneas Centradas (Idéntico a la Imagen) + Vencimiento */}
                                <div className="relative z-10 flex items-end justify-between border-t border-white/20 pt-1.5 text-white">
                                    <div className="w-16" />
                                    <div className="flex-1 text-center font-extrabold uppercase text-[7.5px] leading-[1.25] tracking-tight text-white px-2">
                                        <p>...UN ESFUERZO DE FE Y DE SACRIFICIO EN BIEN DE LA OBRA</p>
                                        <p>MISIONERA Y DE LA EVANGELIZACIÓN DEL MUNDO.</p>
                                    </div>
                                    <span className="whitespace-nowrap font-bold text-slate-100 text-[8.5px] shrink-0 self-end pb-0.5 tracking-tight">
                                        VENCE 12-{new Date().getFullYear() + 1}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            /* --- CARA TRASERA (BACK - Fiel a la Imagen 2) --- */
                            <div className="w-full h-full bg-white text-slate-900 p-4 flex flex-col justify-between overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
                                {/* Cortes Geométricos Azules en Esquinas (#0f3563) exactos a la Imagen 2 */}
                                <div
                                    className="absolute top-0 left-0 w-20 h-20 bg-[#0f3563] pointer-events-none"
                                    style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
                                />
                                <div
                                    className="absolute top-0 left-0 w-24 h-24 bg-[#0f3563] pointer-events-none opacity-80"
                                    style={{ clipPath: 'polygon(0 80%, 80% 0, 65% 0, 0 65%)' }}
                                />
                                <div
                                    className="absolute bottom-0 right-0 w-24 h-24 bg-[#0f3563] pointer-events-none"
                                    style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }}
                                />

                                {/* Header Trasero: Logo MMM + MOVIMIENTO MISIONERO MUNDIAL */}
                                <div className="relative z-10 flex items-center justify-center gap-2.5 pt-0.5">
                                    <img
                                        src="/icons/logo_mmm.png"
                                        alt="Logo MMM"
                                        className="h-8 w-auto object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                    <span className="text-[12.5px] font-black uppercase tracking-wide text-[#0f3563]">
                                        MOVIMIENTO MISIONERO MUNDIAL
                                    </span>
                                </div>

                                {/* Textos Legales e Institucionales (Exactos a la Imagen 2) */}
                                <div className="relative z-10 space-y-1.5 px-5 text-[7.5px] leading-snug font-medium text-slate-800 text-justify tracking-tight">
                                    <p>
                                        ORGANIZACION CRISTIANA, SIN FINES DE LUCRO, DEBIDAMENTE REGISTRADA ANTE LAS AUTORIDADES GUBERNAMENTALES DE LA REPÚBLICA BOLIVARIANA DE VENEZUELA, INSCRITA EN LA DIRECCIÓN DE JUSTICIA Y CULTO BAJO EL N° DG/520 DF/620-100.361.
                                    </p>
                                    <p>
                                        ESTE CARNET ES PERSONAL E INTRANSFERIBLE Y ACREDITA AL USUARIO COMO MIEMBRO DE LA IGLESIA CRISTIANA PENTECOSTÉS DE VENEZUELA DEL MOVIMIENTO MISIONERO MUNDIAL.
                                    </p>
                                    <p className="font-bold text-slate-900">
                                        SE LE AGRADECE A LAS AUTORIDADES CIVILES Y MILITARES TODA LA COLABORACIÓN PRESTADA AL PORTADOR DE ESTA CREDENCIAL.
                                    </p>
                                </div>

                                {/* Titular + Código de Barras + Código QR Real */}
                                <div className="relative z-10 flex flex-col items-center justify-center pt-0.5">
                                    {/* Nombre del Titular entre paréntesis */}
                                    <span className="text-[11px] font-semibold italic text-[#0f3563] font-serif tracking-wide">
                                        {pastor.nombres} {pastor.apellidos} ({pastor.documento?.replace(/\D/g, '') || pastor.codigo})
                                    </span>

                                    {/* Fila Inferior: Código de Barras (Izquierda) + QR Code Real (Derecha) */}
                                    <div className="w-full flex items-center justify-between px-6 mt-1">
                                        {/* Código de Barras */}
                                        <div className="flex flex-col items-start">
                                            <div className="w-48 h-8 flex items-center justify-center gap-[1.5px]">
                                                {[...Array(48)].map((_, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={cn(
                                                            "h-full bg-slate-900",
                                                            idx % 6 === 0 ? "w-1" : idx % 3 === 0 ? "w-[1.5px]" : "w-[1px]"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Código QR Real de Verificación */}
                                        <div className="flex flex-col items-center" title="Escanear para verificar pastor">
                                            <div className="p-1 bg-white border border-slate-300 rounded-md shadow-xs flex items-center justify-center">
                                                <img
                                                    src={qrImageUrl}
                                                    alt="Código QR de Verificación"
                                                    className="size-12 object-contain"
                                                />
                                            </div>
                                            <span className="text-[6px] font-bold text-slate-600 uppercase tracking-tighter mt-0.5">
                                                Escanear QR
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="text-[11px] text-muted-foreground mt-3.5 flex items-center gap-1.5 font-medium">
                        <QrCode className="size-3.5 text-blue-600" />
                        Haz clic en la tarjeta o usa los botones para alternar entre el Frontal y el Reverso
                    </p>
                </div>

                <DialogFooter className="p-4 border-t bg-muted/40 flex flex-wrap items-center justify-between gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab(activeTab === 'front' ? 'back' : 'front')}
                        className="gap-2 text-xs font-semibold"
                    >
                        <RotateCw className="size-3.5 text-indigo-600" />
                        {activeTab === 'front' ? __('Ver Reverso') : __('Ver Frontal')}
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={onClose}
                            className="text-xs"
                        >
                            {__('Cerrar')}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleDownloadPdf}
                            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm"
                        >
                            <Download className="size-3.5" />
                            {__('Descargar PDF (Imprimir)')}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
