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
import { usePage } from '@inertiajs/react';

interface PastorCarnetModalProps {
    pastor: Pastor | null;
    isOpen: boolean;
    onClose: () => void;
}

export function PastorCarnetModal({ pastor, isOpen, onClose }: PastorCarnetModalProps) {
    const { __ } = useTranslate();
    const { auth } = usePage<any>().props;
    const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');

    const userRoles: string[] = Array.isArray(auth?.user?.roles)
        ? auth.user.roles.map((r: any) => (typeof r === 'string' ? r : r?.name || ''))
        : [];

    const canDownloadPdf = Boolean(
        auth?.user?.is_super_admin ||
        userRoles.some((role: string) => {
            const normalized = role.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return normalized.includes('super') || normalized.includes('secretaria');
        })
    );

    if (!pastor) return null;

    const getPastorPhotoUrl = (foto?: string | null) => {
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

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(verificationUrl)}`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[820px] max-w-[95vw] w-full p-0 overflow-hidden bg-card border border-border shadow-2xl rounded-2xl">
                <DialogHeader className="p-5 pb-3.5 border-b bg-gradient-to-r from-indigo-950 via-blue-950 to-indigo-950 text-white flex flex-row items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-6 text-indigo-300" />
                            <DialogTitle className="text-xl font-bold text-white tracking-tight">
                                {__('Ministerial Credential / ID')}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-indigo-200 mt-0.5">
                            {pastor.nombres} {pastor.apellidos} ({pastor.codigo})
                        </DialogDescription>
                    </div>

                    {/* Selector de Pestaña (Frontal / Reverso) */}
                    <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/10">
                        <Button
                            type="button"
                            variant={activeTab === 'front' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('front')}
                            className={cn(
                                "h-8 px-4 text-xs font-semibold shadow-none transition-colors rounded-lg",
                                activeTab === 'front' ? "bg-white text-indigo-950 font-bold" : "text-white hover:bg-white/20"
                            )}
                        >
                            {__('Front')}
                        </Button>
                        <Button
                            type="button"
                            variant={activeTab === 'back' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('back')}
                            className={cn(
                                "h-8 px-4 text-xs font-semibold shadow-none transition-colors rounded-lg",
                                activeTab === 'back' ? "bg-white text-indigo-950 font-bold" : "text-white hover:bg-white/20"
                            )}
                        >
                            {__('Back')}
                        </Button>
                    </div>
                </DialogHeader>

                <div className="p-8 sm:p-10 bg-slate-950/20 flex flex-col items-center justify-center min-h-[520px] select-none">
                    {/* Contenedor del Carnet CR80 Grande (700px x 442px) */}
                    <div
                        className="w-[700px] h-[442px] relative shadow-2xl rounded-2xl overflow-hidden border border-slate-700/60 cursor-pointer transition-all duration-300 hover:shadow-indigo-500/25 bg-slate-950"
                        onClick={() => setActiveTab(activeTab === 'front' ? 'back' : 'front')}
                    >
                        {activeTab === 'front' ? (
                            /* --- CARA FRONTAL (FRONT) con plantilla oficial --- */
                            <div
                                className="w-full h-full text-white relative animate-in fade-in zoom-in-95 duration-200 select-none"
                                style={{
                                    backgroundImage: "url('/image/Credencial-frente.png')",
                                    backgroundSize: '100% 100%',
                                    backgroundRepeat: 'no-repeat',
                                }}
                            >
                                {/* Foto Rectangular Tipo Carnet Calibrada (Izquierda) */}
                                <div className="absolute left-[45px] top-[126px] w-[178px] h-[226px] rounded-xl border-[3px] border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.6)] overflow-hidden bg-slate-900 flex items-center justify-center">
                                    {photoUrl ? (
                                        <img
                                            src={photoUrl}
                                            alt={`${pastor.nombres} ${pastor.apellidos}`}
                                            className="w-full h-full object-cover object-top"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-700 to-blue-950 text-white font-black text-5xl flex items-center justify-center">
                                            {initials}
                                        </div>
                                    )}
                                </div>

                                {/* Textos Dinámicos: Nombre, Cédula y Acreditación Ministerial (Derecha) */}
                                <div className="absolute left-[248px] top-[136px] right-[36px] flex flex-col justify-center text-left">
                                    <h2 className="text-[23px] font-black uppercase leading-tight tracking-tight text-white line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                                        {pastor.nombres} {pastor.apellidos}
                                    </h2>
                                    <p className="text-[17px] font-extrabold text-cyan-200 mt-1 tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                                        {formatDocumento(pastor.documento)}
                                    </p>

                                    <div className="mt-3.5">
                                        <span className="block text-[11.5px] uppercase font-bold text-slate-200/90 tracking-wider drop-shadow-xs">
                                            {__('Acreditación Ministerial')}
                                        </span>
                                        <span className="block text-[19px] font-black uppercase tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-0.5">
                                            {pastor.nivel_ministerial || 'MINISTRO ORDENADO'}
                                        </span>
                                    </div>

                                    {(pastor.zona || pastor.codigo) && (
                                        <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-slate-100">
                                            {pastor.zona && (
                                                <span className="bg-slate-900/60 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/20 shadow-xs">
                                                    Zona: {pastor.zona}
                                                </span>
                                            )}
                                            {pastor.codigo && (
                                                <span className="bg-slate-900/60 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/20 shadow-xs">
                                                    Cód: {pastor.codigo}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* --- CARA TRASERA (BACK) con plantilla oficial --- */
                            <div
                                className="w-full h-full text-slate-900 relative animate-in fade-in zoom-in-95 duration-200 select-none"
                                style={{
                                    backgroundImage: "url('/image/Credencial-atras.png')",
                                    backgroundSize: '100% 100%',
                                    backgroundRepeat: 'no-repeat',
                                }}
                            >
                                {/* Sección Inferior Izquierda: Nombre Titular y Firma */}
                                <div className="absolute left-[54px] bottom-[30px] max-w-[420px] text-left">
                                    <span className="text-[17px] font-bold italic text-[#0f3563] font-serif tracking-wide block leading-snug">
                                        {pastor.nombres} {pastor.apellidos}
                                    </span>
                                    <span className="text-[12px] font-medium text-slate-600 block mt-0.5">
                                        C.I. {formatDocumento(pastor.documento)} {pastor.codigo ? ` | Cód: ${pastor.codigo}` : ''}
                                    </span>
                                    <div className="mt-2.5 w-44 border-t border-slate-400/80 pt-1 text-[8.5px] uppercase font-bold text-slate-500 tracking-wider">
                                        {__('Firma / Sello Acreditado')}
                                    </div>
                                </div>

                                {/* Sección Inferior Derecha: Código QR Oficial de Validación */}
                                <div className="absolute right-[50px] bottom-[22px] flex flex-col items-center shrink-0" title={__('Scan to verify pastor')}>
                                    <div className="p-1.5 bg-white border border-slate-300 rounded-xl shadow-md flex items-center justify-center">
                                        <img
                                            src={qrImageUrl}
                                            alt={__('Verification QR Code')}
                                            className="size-[92px] object-contain"
                                        />
                                    </div>
                                    <span className="text-[8.5px] font-extrabold text-slate-700 uppercase tracking-tight mt-1">
                                        {__('Validar QR')}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="text-[13px] text-muted-foreground mt-4 flex items-center gap-1.5 font-medium">
                        <QrCode className="size-4 text-blue-600" />
                        {__('Click on the card or use buttons to flip between Front and Back')}
                    </p>
                </div>

                <DialogFooter className="p-4 border-t bg-muted/40 flex flex-wrap items-center justify-between gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab(activeTab === 'front' ? 'back' : 'front')}
                        className="gap-2 text-xs font-semibold h-9 px-4"
                    >
                        <RotateCw className="size-3.5 text-indigo-600" />
                        {activeTab === 'front' ? __('View Back') : __('View Front')}
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={onClose}
                            className="text-xs h-9 px-4"
                        >
                            {__('Close')}
                        </Button>
                        {canDownloadPdf && (
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleDownloadPdf}
                                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-4 shadow-sm"
                            >
                                <Download className="size-3.5" />
                                {__('Download PDF (Print)')}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
