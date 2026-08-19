import React, { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    UploadCloud,
    FileText,
    FileImage,
    CheckCircle2,
    Lock,
    KeyRound,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    RefreshCw,
    X,
    Eye,
    Zap,
    ShieldCheck
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import PasswordInput from '@/components/password-input';
import PasskeyVerify from '@/components/passkey-verify';
import { useTranslate } from '@/hooks/use-translate';

interface Extension {
    id: number;
    nombre: string;
    documento_path?: string;
    documento_nombre?: string;
    documento_size?: number;
    documento_mime?: string;
    documento_url?: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    extension: Extension | null;
}

export function ExtensionDocumentoWizardModal({ isOpen, onClose, extension }: ModalProps) {
    const { __ } = useTranslate();
    const { auth } = usePage().props as any;

    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

    // Step 1: File selection & optimization state
    const [rawFile, setRawFile] = useState<File | null>(null);
    const [optimizedFile, setOptimizedFile] = useState<File | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationStats, setOptimizationStats] = useState<{
        originalSize: number;
        newSize: number;
        savedBytes: number;
        percentSaved: number;
    } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Step 2: Preview state
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Step 3: Security verification state
    const [password, setPassword] = useState('');
    const [securityError, setSecurityError] = useState<string | null>(null);
    const [isVerifyingSecurity, setIsVerifyingSecurity] = useState(false);
    const [securityVerified, setSecurityVerified] = useState(false);

    // Step 4: Progress & upload state
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // Reset state on open/close
    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(1);
            setRawFile(null);
            setOptimizedFile(null);
            setIsOptimizing(false);
            setOptimizationStats(null);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setPassword('');
            setSecurityError(null);
            setIsVerifyingSecurity(false);
            setSecurityVerified(false);
            setUploadProgress(0);
            setIsUploading(false);
            setUploadError(null);
            setUploadSuccess(false);
        }
    }, [isOpen]);

    if (!extension) return null;

    // --- Helper Functions ---
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Client-side HTML5 Canvas optimization for images (>4MB or large images)
    const optimizeImage = async (file: File): Promise<{ file: File; originalSize: number; newSize: number }> => {
        return new Promise((resolve, reject) => {
            const originalSize = file.size;

            // If file is PDF, we keep file as is
            if (!file.type.startsWith('image/')) {
                resolve({ file, originalSize, newSize: originalSize });
                return;
            }

            const img = new Image();
            const objectUrl = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(objectUrl);

                const canvas = document.createElement('canvas');
                let { width, height } = img;

                // Max dimensions 1920px for optimal quality vs size
                const maxDim = 1920;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve({ file, originalSize, newSize: originalSize });
                    return;
                }

                // Draw background white for transparent PNGs converted to JPEG
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                // Compression quality: 0.78 for JPEG
                const quality = originalSize > 4 * 1024 * 1024 ? 0.75 : 0.85;
                const outputType = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            resolve({ file, originalSize, newSize: originalSize });
                            return;
                        }

                        const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
                        const compressedFile = new File([blob], newFileName, {
                            type: outputType,
                            lastModified: Date.now()
                        });

                        resolve({
                            file: compressedFile,
                            originalSize,
                            newSize: compressedFile.size
                        });
                    },
                    outputType,
                    quality
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                resolve({ file, originalSize, newSize: originalSize });
            };

            img.src = objectUrl;
        });
    };

    const handleFileProcess = async (file: File) => {
        // Validate mime types: pdf, png, jpg, jpeg, webp
        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert(__('Por favor seleccione un archivo válido (PDF o Imagen PNG, JPG, WEBP).'));
            return;
        }

        setRawFile(file);
        setIsOptimizing(true);

        try {
            // Process file optimization if file > 4MB or if image
            if (file.type.startsWith('image/')) {
                const res = await optimizeImage(file);
                setOptimizedFile(res.file);
                const savedBytes = Math.max(0, res.originalSize - res.newSize);
                const percentSaved = res.originalSize > 0 ? Math.round((savedBytes / res.originalSize) * 100) : 0;

                setOptimizationStats({
                    originalSize: res.originalSize,
                    newSize: res.newSize,
                    savedBytes,
                    percentSaved
                });

                const url = URL.createObjectURL(res.file);
                setPreviewUrl(url);
            } else {
                // PDF File
                setOptimizedFile(file);
                setOptimizationStats({
                    originalSize: file.size,
                    newSize: file.size,
                    savedBytes: 0,
                    percentSaved: 0
                });
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            }
        } catch (e) {
            setOptimizedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileProcess(e.dataTransfer.files[0]);
        }
    };

    // Step 3: Handle Security Verification
    const handleVerifySecurity = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!password) {
            setSecurityError(__('Por favor ingrese su contraseña.'));
            return;
        }

        setIsVerifyingSecurity(true);
        setSecurityError(null);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch('/admin/extensiones/verify-security', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSecurityVerified(true);
                // Advance to Step 4 and trigger upload!
                setCurrentStep(4);
                startUpload();
            } else {
                setSecurityError(data.message || __('La contraseña ingresada es incorrecta.'));
            }
        } catch (err) {
            setSecurityError(__('Error al verificar credenciales de seguridad.'));
        } finally {
            setIsVerifyingSecurity(false);
        }
    };

    // Step 4: Execute real-time upload progress with XHR (0% to 100%)
    const startUpload = () => {
        const fileToUpload = optimizedFile || rawFile;
        if (!fileToUpload) return;

        setIsUploading(true);
        setUploadProgress(0);
        setUploadError(null);

        const formData = new FormData();
        formData.append('documento', fileToUpload);

        const xhr = new XMLHttpRequest();
        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

        xhr.open('POST', `/admin/extensiones/${extension.id}/documento`, true);
        xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken);
        xhr.setRequestHeader('Accept', 'application/json');

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(percent);
            }
        };

        xhr.onload = () => {
            setIsUploading(false);
            if (xhr.status >= 200 && xhr.status < 300) {
                setUploadProgress(100);
                setUploadSuccess(true);
            } else {
                try {
                    const resp = JSON.parse(xhr.responseText);
                    setUploadError(resp.message || __('Ocurrió un error al subir el documento.'));
                } catch (e) {
                    setUploadError(__('Error en el servidor al subir el documento.'));
                }
            }
        };

        xhr.onerror = () => {
            setIsUploading(false);
            setUploadError(__('Error de red al subir el documento.'));
        };

        xhr.send(formData);
    };

    const handleFinish = () => {
        onClose();
        router.reload({ preserveScroll: true });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden rounded-2xl border bg-card shadow-2xl">
            {/* Header del Wizard */}
            <div className="bg-slate-900 text-white p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-800"
                >
                    <X className="size-5" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-xl">
                        <UploadCloud className="size-6" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold text-white">
                            {__('Adjuntar Documento de Extensión')}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs mt-0.5">
                            {extension.nombre} — {__('Proceso interactivo en 4 pasos')}
                        </DialogDescription>
                    </div>
                </div>

                {/* Steps Navigation Bar */}
                <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-slate-800">
                    {[
                        { step: 1, label: __('1. Adjuntar'), icon: UploadCloud },
                        { step: 2, label: __('2. Vista Previa'), icon: Eye },
                        { step: 3, label: __('3. Seguridad'), icon: ShieldCheck },
                        { step: 4, label: __('4. Carga (0-100%)'), icon: RefreshCw },
                    ].map((s) => {
                        const Icon = s.icon;
                        const isActive = currentStep === s.step;
                        const isDone = currentStep > s.step || (s.step === 4 && uploadSuccess);

                        return (
                            <div
                                key={s.step}
                                className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold transition-all ${
                                    isActive
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : isDone
                                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                        : 'bg-slate-800/50 text-slate-400 opacity-60'
                                }`}
                            >
                                <div className={`size-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                    isActive ? 'bg-white text-indigo-700' : isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                                }`}>
                                    {isDone ? <CheckCircle2 className="size-3.5" /> : s.step}
                                </div>
                                <span className="truncate hidden sm:inline">{s.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Contenido según el Paso Activo */}
            <div className="p-6 min-h-[380px] max-h-[70vh] overflow-y-auto">
                {/* ---------------- PASO 1: ADJUNTAR Y OPTIMIZAR ---------------- */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                                isDragging
                                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[0.99]'
                                    : rawFile
                                    ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                                    : 'border-muted-foreground/30 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg,.webp"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
                            />

                            {isOptimizing ? (
                                <div className="py-8 flex flex-col items-center gap-3">
                                    <Zap className="size-10 text-amber-500 animate-bounce" />
                                    <p className="font-bold text-foreground">{__('Optimizando documento...')}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {__('Reduciendo peso en KB para conservar espacio en el sistema.')}
                                    </p>
                                </div>
                            ) : rawFile ? (
                                <div className="py-4 flex flex-col items-center gap-2">
                                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full">
                                        {rawFile.type.startsWith('image/') ? <FileImage className="size-8" /> : <FileText className="size-8" />}
                                    </div>
                                    <h4 className="font-bold text-foreground text-base">{rawFile.name}</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {__('Tamaño Original:')} {formatFileSize(rawFile.size)}
                                    </p>
                                    <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mt-2">
                                        ✓ {__('Archivo Seleccionado — Hacer clic para cambiar')}
                                    </Badge>
                                </div>
                            ) : (
                                <div className="py-6 flex flex-col items-center gap-3">
                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-full">
                                        <UploadCloud className="size-10" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground text-base">
                                            {__('Arrastra y suelta el documento aquí')}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {__('o haz clic para explorar tus archivos (Soporta PDF, PNG, JPG, WEBP)')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="secondary" className="text-[10px]">
                                            <Zap className="size-3 text-amber-500 mr-1" />
                                            {__('Optimización Automática (>4 MB)')}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Banner Informativo de Optimización */}
                        {optimizationStats && optimizationStats.percentSaved > 0 && (
                            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500 text-white rounded-lg">
                                        <Zap className="size-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-amber-900 dark:text-amber-300 text-sm">
                                            {__('Optimización de Tamaño Aplicada Exitosamente')}
                                        </p>
                                        <p className="text-xs text-amber-700 dark:text-amber-400">
                                            {__('El archivo pesaba')} <span className="line-through">{formatFileSize(optimizationStats.originalSize)}</span> {__('y se redujo a')} <span className="font-bold">{formatFileSize(optimizationStats.newSize)}</span>.
                                        </p>
                                    </div>
                                </div>
                                <Badge className="bg-amber-500 text-white font-extrabold text-xs">
                                    -{optimizationStats.percentSaved}% {__('reducido')}
                                </Badge>
                            </div>
                        )}
                    </div>
                )}

                {/* ---------------- PASO 2: VISTA PREVIA ---------------- */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl border">
                            <div className="flex items-center gap-3">
                                {rawFile?.type.startsWith('image/') ? <FileImage className="size-6 text-indigo-600" /> : <FileText className="size-6 text-rose-600" />}
                                <div>
                                    <p className="font-bold text-sm text-foreground">{optimizedFile?.name || rawFile?.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(optimizedFile?.size || 0)} • {optimizedFile?.type}
                                    </p>
                                </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => setCurrentStep(1)} className="text-xs">
                                {__('Cambiar Archivo')}
                            </Button>
                        </div>

                        {/* Visor interactivo */}
                        <div className="border rounded-xl bg-slate-950 p-2 flex items-center justify-center min-h-[280px] max-h-[350px] overflow-hidden">
                            {previewUrl ? (
                                rawFile?.type.startsWith('image/') ? (
                                    <img src={previewUrl} alt="Vista previa" className="max-h-[330px] object-contain rounded" />
                                ) : (
                                    <iframe src={previewUrl} title="PDF Preview" className="w-full h-[330px] rounded border-0" />
                                )
                            ) : (
                                <p className="text-xs text-slate-400">{__('No hay vista previa disponible')}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* ---------------- PASO 3: VERIFICACIÓN DE SEGURIDAD ---------------- */}
                {currentStep === 3 && (
                    <div className="space-y-6 max-w-md mx-auto py-4">
                        <div className="text-center space-y-2">
                            <div className="size-12 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                                <Lock className="size-6" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground">{__('Verificación de Seguridad')}</h3>
                            <p className="text-xs text-muted-foreground">
                                {__('Para adjuntar este documento a la extensión, por favor confirme su contraseña o Passkey de usuario logueado.')}
                            </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 border rounded-xl p-4 flex items-center gap-3">
                            <div className="size-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {auth?.user?.name ? auth.user.name.charAt(0) : 'U'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-xs text-foreground truncate">{auth?.user?.name}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{auth?.user?.email}</p>
                            </div>
                        </div>

                        {securityError && (
                            <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 dark:text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
                                <AlertCircle className="size-4 shrink-0" />
                                <span>{securityError}</span>
                            </div>
                        )}

                        <form onSubmit={handleVerifySecurity} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="sec-password" className="text-xs font-semibold">
                                    {__('Contraseña de Confirmación')}
                                </Label>
                                <PasswordInput
                                    id="sec-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    autoFocus
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isVerifyingSecurity || !password}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold text-xs h-10"
                            >
                                {isVerifyingSecurity ? (
                                    <>
                                        <RefreshCw className="size-4 mr-2 animate-spin" />
                                        {__('Verificando...')}
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="size-4 mr-2" />
                                        {__('Confirmar e Iniciar Carga')}
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                )}

                {/* ---------------- PASO 4: BARRA DE CARGA (0 a 100%) ---------------- */}
                {currentStep === 4 && (
                    <div className="space-y-6 py-6 max-w-md mx-auto text-center">
                        {!uploadSuccess ? (
                            <div className="space-y-6">
                                <div className="size-16 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                    <RefreshCw className="size-8 animate-spin text-indigo-600" />
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg text-foreground">
                                        {__('Cargando Documento al Servidor')}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {__('Por favor espere mientras completamos la transferencia de datos.')}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-foreground">
                                        <span>{__('Progreso de Subida')}</span>
                                        <span className="text-indigo-600 font-mono text-sm">{uploadProgress}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-3" />
                                </div>

                                {uploadError && (
                                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                                        <AlertCircle className="size-4 shrink-0" />
                                        <span>{uploadError}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6 py-4 animate-in fade-in zoom-in duration-300">
                                <div className="size-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                                    <CheckCircle2 className="size-12" />
                                </div>

                                <div>
                                    <Badge className="bg-emerald-500 text-white font-extrabold px-3 py-1 text-xs mb-2">
                                        ✓ 100% {__('Completado')}
                                    </Badge>
                                    <h3 className="font-bold text-xl text-foreground">
                                        {__('Documento Adjuntado Exitosamente')}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {__('El archivo ha sido asociado correctamente a la extensión')} <span className="font-bold text-foreground">{extension.nombre}</span>.
                                    </p>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900 border rounded-xl p-4 text-left text-xs space-y-1.5">
                                    <p><span className="font-bold">{__('Nombre:')}</span> {optimizedFile?.name}</p>
                                    <p><span className="font-bold">{__('Tamaño Final:')}</span> {formatFileSize(optimizedFile?.size || 0)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer con Acciones de Navegación del Wizard */}
            <div className="bg-muted/40 border-t p-4 flex items-center justify-between">
                {currentStep > 1 && currentStep < 4 && !securityVerified ? (
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep((currentStep - 1) as any)} className="gap-1 text-xs font-semibold">
                        <ArrowLeft className="size-4" />
                        {__('Paso Anterior')}
                    </Button>
                ) : (
                    <div />
                )}

                <div className="flex items-center gap-2">
                    {currentStep === 1 && (
                        <Button
                            disabled={!optimizedFile || isOptimizing}
                            onClick={() => setCurrentStep(2)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-xs font-bold px-5"
                        >
                            {__('Siguiente: Vista Previa')}
                            <ArrowRight className="size-4" />
                        </Button>
                    )}

                    {currentStep === 2 && (
                        <Button
                            onClick={() => setCurrentStep(3)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-xs font-bold px-5"
                        >
                            {__('Siguiente: Verificación de Seguridad')}
                            <ArrowRight className="size-4" />
                        </Button>
                    )}

                    {currentStep === 4 && uploadSuccess && (
                        <Button
                            onClick={handleFinish}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6"
                        >
                            {__('Finalizar y Cerrar')}
                        </Button>
                    )}
                </div>
            </div>
        </DialogContent>
    </Dialog>
);
}
