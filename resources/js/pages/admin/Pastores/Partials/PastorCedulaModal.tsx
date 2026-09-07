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
import {
    Download,
    CreditCard,
    ExternalLink,
    AlertCircle,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Pencil,
    ShieldCheck
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { Pastor } from '../Index';
import { useTranslate } from '@/hooks/use-translate';

interface PastorCedulaModalProps {
    pastor: Pastor | null;
    isOpen: boolean;
    onClose: () => void;
}

export function PastorCedulaModal({ pastor, isOpen, onClose }: PastorCedulaModalProps) {
    const { __ } = useTranslate();
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [imageError, setImageError] = useState<boolean>(false);

    if (!pastor) return null;

    const hasCedula = Boolean(pastor.foto_cedula_url || pastor.foto_cedula);
    const cedulaUrl = pastor.foto_cedula_url || (pastor.foto_cedula ? `/pastores_cedulas/${pastor.foto_cedula}` : null);

    const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
    const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
    const handleResetZoom = () => setZoomLevel(1);

    const downloadUrl = `/admin/pastores/${pastor.id}/cedula-descargar`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                setZoomLevel(1);
                setImageError(false);
                onClose();
            }
        }}>
            <DialogContent className="sm:max-w-[760px] max-w-[95vw] w-full p-0 overflow-hidden bg-card border border-border shadow-2xl rounded-2xl">
                {/* Header con gradiente elegante */}
                <DialogHeader className="p-5 pb-4 border-b bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <CreditCard className="size-5 text-amber-400" />
                            <DialogTitle className="text-lg sm:text-xl font-bold text-white tracking-tight">
                                {__('Cédula de Identidad')}
                            </DialogTitle>
                            {hasCedula && !imageError && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold">
                                    <ShieldCheck className="size-3" />
                                    {__('Digitalizada')}
                                </span>
                            )}
                        </div>
                        <DialogDescription className="text-xs text-slate-300">
                            {pastor.nombres} {pastor.apellidos} &bull; <span className="font-mono font-semibold text-amber-300">{pastor.documento}</span>
                        </DialogDescription>
                    </div>

                    {/* Controles de Zoom rápidos (cuando hay imagen) */}
                    {hasCedula && !imageError && (
                        <div className="hidden sm:flex items-center gap-1 bg-white/10 p-1 rounded-lg border border-white/10">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleZoomOut}
                                disabled={zoomLevel <= 0.75}
                                className="h-7 w-7 p-0 text-white hover:bg-white/20"
                                title={__('Alejar')}
                            >
                                <ZoomOut className="size-3.5" />
                            </Button>
                            <span className="text-[11px] font-mono px-1.5 text-slate-200">
                                {Math.round(zoomLevel * 100)}%
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleZoomIn}
                                disabled={zoomLevel >= 2.5}
                                className="h-7 w-7 p-0 text-white hover:bg-white/20"
                                title={__('Acercar')}
                            >
                                <ZoomIn className="size-3.5" />
                            </Button>
                            {zoomLevel !== 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResetZoom}
                                    className="h-7 w-7 p-0 text-amber-300 hover:bg-white/20"
                                    title={__('Restablecer zoom')}
                                >
                                    <RotateCcw className="size-3.5" />
                                </Button>
                            )}
                        </div>
                    )}
                </DialogHeader>

                {/* Contenedor Visualizador */}
                <div className="p-4 sm:p-6 bg-slate-950/25 flex flex-col items-center justify-center min-h-[380px] max-h-[70vh] overflow-auto">
                    {hasCedula && !imageError && cedulaUrl ? (
                        <div className="flex flex-col items-center gap-4 w-full">
                            <div className="w-full flex items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-700/50 shadow-inner overflow-hidden min-h-[320px]">
                                <img
                                    src={cedulaUrl}
                                    alt={`Cédula de ${pastor.nombres} ${pastor.apellidos}`}
                                    className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-200"
                                    style={{ transform: `scale(${zoomLevel})` }}
                                    onError={() => setImageError(true)}
                                />
                            </div>

                            {/* Ficha rápida de detalles */}
                            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                <div className="bg-card/80 border rounded-lg p-2 flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">{__('Documento')}</span>
                                    <span className="font-bold text-foreground font-mono truncate">{pastor.documento}</span>
                                </div>
                                <div className="bg-card/80 border rounded-lg p-2 flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">{__('Código')}</span>
                                    <span className="font-bold text-foreground font-mono truncate">{pastor.codigo}</span>
                                </div>
                                <div className="bg-card/80 border rounded-lg p-2 flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">{__('Ministerial Grade')}</span>
                                    <span className="font-bold text-foreground truncate">{__(pastor.nivel_ministerial)}</span>
                                </div>
                                <div className="bg-card/80 border rounded-lg p-2 flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">{__('Ubicación')}</span>
                                    <span className="font-bold text-foreground truncate">
                                        {__('Zone')} {pastor.zona || '—'} &bull; {__('Dist.')} {pastor.distrito || '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Estado vacío cuando no hay cédula digital */
                        <div className="p-8 sm:p-12 text-center max-w-md mx-auto flex flex-col items-center">
                            <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-4 shadow-inner">
                                <AlertCircle className="size-8" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">
                                {__('Sin Cédula Digitalizada')}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                {__('Este pastor no posee una copia de su cédula de identidad registrada en el sistema. Puedes adjuntarla editando los datos del pastor.')}
                            </p>
                            <div className="mt-5 flex items-center gap-2">
                                <Link href={`/admin/pastores/${pastor.id}/edit`}>
                                    <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs">
                                        <Pencil className="size-3.5" />
                                        {__('Editar Pastor para Adjuntar')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer con acciones */}
                <DialogFooter className="p-4 border-t bg-muted/40 flex flex-wrap items-center justify-between gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={onClose}
                        className="text-xs h-9 px-4"
                    >
                        {__('Cerrar')}
                    </Button>

                    {hasCedula && !imageError && cedulaUrl && (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(cedulaUrl, '_blank')}
                                className="gap-1.5 text-xs h-9 px-3"
                                title={__('Ver en tamaño completo')}
                            >
                                <ExternalLink className="size-3.5 text-slate-500" />
                                <span>{__('Ver Original')}</span>
                            </Button>

                            <a href={downloadUrl} download>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs h-9 px-4 shadow-sm"
                                >
                                    <Download className="size-3.5" />
                                    {__('Descargar Cédula')}
                                </Button>
                            </a>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
