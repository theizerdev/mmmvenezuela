import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Download,
    RotateCw,
    ShieldCheck,
    QrCode,
    ExternalLink,
    Image as ImageIcon,
    SlidersHorizontal,
    Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Pastor } from '../Index';
import { useTranslate } from '@/hooks/use-translate';
import { usePage, router } from '@inertiajs/react';
import { PastorCarnetCard } from './PastorCarnetCard';
import { exportPastorCarnetPng } from './carnet-export-image';
import { toast } from 'sonner';

interface PastorCarnetModalProps {
    pastor: Pastor | null;
    isOpen: boolean;
    onClose: () => void;
}

export function PastorCarnetModal({ pastor, isOpen, onClose }: PastorCarnetModalProps) {
    const { __ } = useTranslate();
    const { auth } = usePage<any>().props;
    const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
    const [viewMode, setViewMode] = useState<'flip' | 'both'>('flip');
    const [isExportingPng, setIsExportingPng] = useState(false);

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

    const handleDownloadPdf = () => {
        window.open(`/admin/pastores/${pastor.id}/carnet-pdf`, '_blank');
    };

    const handleDownloadPng = async (side: 'front' | 'back') => {
        try {
            setIsExportingPng(true);
            toast.info(__('Generando imagen de alta resolución a 300 DPI...'));
            await exportPastorCarnetPng(pastor, side);
            toast.success(__('Imagen del carnet descargada con éxito'));
        } catch (error) {
            console.error('Error al generar imagen del carnet:', error);
            toast.error(__('No se pudo generar la imagen del carnet'));
        } finally {
            setIsExportingPng(false);
        }
    };

    const handleGoToStudio = () => {
        onClose();
        router.visit(`/admin/pastores/carnets?pastor_id=${pastor.id}`);
    };

    const verificationUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/validar-credencial/${encodeURIComponent(pastor.codigo || pastor.documento || pastor.id)}`
        : `/validar-credencial/${pastor.codigo || pastor.id}`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[900px] max-w-[96vw] w-full p-0 overflow-hidden bg-card border border-border shadow-2xl rounded-2xl">
                {/* Cabecera estilizada */}
                <DialogHeader className="p-4 sm:p-5 pb-3.5 border-b bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-6 text-indigo-300" />
                            <DialogTitle className="text-lg sm:text-xl font-bold text-white tracking-tight">
                                {__('Credencial Ministerial Oficial')}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-indigo-200 mt-0.5">
                            {pastor.nombres} {pastor.apellidos} ({pastor.codigo || pastor.documento})
                        </DialogDescription>
                    </div>

                    {/* Controles de vista */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
                            <Button
                                type="button"
                                variant={viewMode === 'flip' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('flip')}
                                className={cn(
                                    'h-7 px-2.5 text-xs font-semibold shadow-none rounded-lg',
                                    viewMode === 'flip' ? 'bg-white text-indigo-950 font-bold' : 'text-white hover:bg-white/20'
                                )}
                            >
                                <RotateCw className="size-3 mr-1" />
                                {__('Giro 3D')}
                            </Button>
                            <Button
                                type="button"
                                variant={viewMode === 'both' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('both')}
                                className={cn(
                                    'h-7 px-2.5 text-xs font-semibold shadow-none rounded-lg',
                                    viewMode === 'both' ? 'bg-white text-indigo-950 font-bold' : 'text-white hover:bg-white/20'
                                )}
                            >
                                <Layers className="size-3 mr-1" />
                                {__('Doble Cara')}
                            </Button>
                        </div>

                        {viewMode === 'flip' && (
                            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
                                <Button
                                    type="button"
                                    variant={activeSide === 'front' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setActiveSide('front')}
                                    className={cn(
                                        'h-7 px-3 text-xs font-semibold shadow-none rounded-lg',
                                        activeSide === 'front' ? 'bg-white text-indigo-950 font-bold' : 'text-white hover:bg-white/20'
                                    )}
                                >
                                    {__('Frente')}
                                </Button>
                                <Button
                                    type="button"
                                    variant={activeSide === 'back' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setActiveSide('back')}
                                    className={cn(
                                        'h-7 px-3 text-xs font-semibold shadow-none rounded-lg',
                                        activeSide === 'back' ? 'bg-white text-indigo-950 font-bold' : 'text-white hover:bg-white/20'
                                    )}
                                >
                                    {__('Reverso')}
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                {/* Contenido Visual */}
                <div className="p-4 sm:p-8 bg-slate-950/20 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[500px] overflow-x-auto w-full no-scrollbar">
                    {viewMode === 'flip' ? (
                        <div className="w-full flex flex-col items-center justify-center py-2">
                            <PastorCarnetCard
                                pastor={pastor}
                                activeSide={activeSide}
                                onFlip={() => setActiveSide(activeSide === 'front' ? 'back' : 'front')}
                                interactive={true}
                                scale={1}
                            />
                            <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5 font-medium text-center">
                                <RotateCw className="size-3.5 text-indigo-600 animate-spin-slow shrink-0" />
                                <span>{__('Haz clic sobre la tarjeta o presiona Voltear para girarla en 3D')}</span>
                            </p>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col xl:flex-row items-center justify-center gap-6 py-2 overflow-x-auto">
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-muted-foreground uppercase mb-2">
                                    {__('Anverso (Frontal)')}
                                </span>
                                <PastorCarnetCard
                                    pastor={pastor}
                                    activeSide="front"
                                    interactive={false}
                                    scale={0.88}
                                />
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-muted-foreground uppercase mb-2">
                                    {__('Reverso (Dorso)')}
                                </span>
                                <PastorCarnetCard
                                    pastor={pastor}
                                    activeSide="back"
                                    interactive={false}
                                    scale={0.88}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Pie de acción */}
                <DialogFooter className="p-4 border-t bg-muted/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        {viewMode === 'flip' && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveSide(activeSide === 'front' ? 'back' : 'front')}
                                className="gap-2 text-xs font-semibold h-9 px-3"
                            >
                                <RotateCw className="size-3.5 text-indigo-600" />
                                {activeSide === 'front' ? __('Voltear al Reverso') : __('Voltear al Frente')}
                            </Button>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPng(activeSide)}
                            disabled={isExportingPng}
                            className="gap-2 text-xs font-semibold h-9 px-3"
                            title={__('Descargar imagen PNG de alta definición a 300 DPI')}
                        >
                            <ImageIcon className="size-3.5 text-emerald-600" />
                            {__('Descargar PNG')}
                        </Button>

                        <a
                            href={verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                        >
                            <QrCode className="size-3.5" />
                            <span>{__('Probar QR')}</span>
                            <ExternalLink className="size-3" />
                        </a>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleGoToStudio}
                            className="gap-1.5 text-xs font-semibold h-9 px-3 text-indigo-700 hover:bg-indigo-100/60"
                        >
                            <SlidersHorizontal className="size-3.5" />
                            {__('Abrir en Carnet Studio')}
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={onClose}
                            className="text-xs h-9 px-4"
                        >
                            {__('Cerrar')}
                        </Button>

                        {canDownloadPdf && (
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleDownloadPdf}
                                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-4 shadow-sm"
                            >
                                <Download className="size-3.5" />
                                {__('Descargar PDF (CR80)')}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
