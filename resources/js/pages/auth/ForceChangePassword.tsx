import React, { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import {
    ShieldCheck,
    Lock,
    Eye,
    EyeOff,
    Check,
    X,
    LoaderCircle,
    LogOut,
    KeyRound,
    AlertCircle,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Props {
    user: {
        name: string;
        email: string;
        username?: string | null;
    };
    status?: string;
}

export default function ForceChangePassword({ user, status }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    // Validaciones en tiempo real
    const validations = useMemo(() => {
        const pass = data.password || '';
        const confirm = data.password_confirmation || '';

        return {
            hasValidLength: pass.length >= 8 && pass.length <= 12,
            hasUppercase: /[A-Z]/.test(pass),
            hasLowercase: /[a-z]/.test(pass),
            hasNumber: /[0-9]/.test(pass),
            hasSpecialChar: /[@$!%*#?&._\-]/.test(pass),
            matchesConfirm: pass.length > 0 && pass === confirm,
        };
    }, [data.password, data.password_confirmation]);

    const passedCount = useMemo(() => {
        return Object.values(validations).filter(Boolean).length;
    }, [validations]);

    const allPassed = passedCount === 6;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!allPassed) return;

        post('/cambiar-contrasena-obligatoria', {
            onError: () => {
                reset('password', 'password_confirmation');
            },
        });
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    // Barra de progreso de fortaleza
    const strengthPercentage = Math.round((passedCount / 6) * 100);
    const strengthColor =
        passedCount <= 2
            ? 'bg-rose-500'
            : passedCount <= 4
            ? 'bg-amber-500'
            : passedCount < 6
            ? 'bg-blue-500'
            : 'bg-emerald-500';

    const strengthLabel =
        passedCount <= 2
            ? 'Débil'
            : passedCount <= 4
            ? 'Media'
            : passedCount < 6
            ? 'Casi lista'
            : 'Excelente y Segura';

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
            <Head title="Cambio Obligatorio de Contraseña" />

            {/* Efectos decorativos de fondo */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-lg bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-8 z-10 space-y-6">
                {/* Encabezado */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-2 shadow-inner">
                        <KeyRound className="w-7 h-7" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Primer Inicio de Sesión
                    </h1>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto">
                        Por políticas de seguridad institucional, debe actualizar su contraseña temporal para acceder al sistema.
                    </p>
                </div>

                {/* Tarjeta con datos del usuario activo */}
                <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-xl bg-blue-950 text-blue-400 font-bold flex items-center justify-center shrink-0 border border-blue-800/50">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                            <p className="font-bold text-slate-200 truncate">{user.name}</p>
                            <p className="text-slate-400 truncate">{user.email}</p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 text-xs shrink-0 ml-2"
                    >
                        <LogOut className="w-3.5 h-3.5 mr-1" />
                        Salir
                    </Button>
                </div>

                {status && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>{status}</span>
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Campo Nueva Contraseña */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Nueva Contraseña
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Ingrese su nueva clave"
                                maxLength={12}
                                autoFocus
                                required
                                className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500 pr-10 focus:border-blue-500 focus:ring-blue-500/20 text-sm h-11 rounded-xl"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-rose-400 text-xs flex items-center gap-1 mt-1 font-medium">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Campo Confirmar Contraseña */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password_confirmation" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Confirmar Contraseña
                        </Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="Repita la nueva clave"
                                maxLength={12}
                                required
                                className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500 pr-10 focus:border-blue-500 focus:ring-blue-500/20 text-sm h-11 rounded-xl"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password_confirmation && (
                            <p className="text-rose-400 text-xs flex items-center gap-1 mt-1 font-medium">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {errors.password_confirmation}
                            </p>
                        )}
                    </div>

                    {/* Barra de progreso de fortaleza */}
                    {data.password.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Fortaleza de contraseña:</span>
                                <span className={cn(
                                    'font-bold',
                                    passedCount === 6 ? 'text-emerald-400' : 'text-slate-300'
                                )}>
                                    {strengthLabel}
                                </span>
                            </div>
                            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                                <div
                                    className={cn('h-full rounded-full transition-all duration-300', strengthColor)}
                                    style={{ width: `${strengthPercentage}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Checklist interactivo de requerimientos */}
                    <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 space-y-2.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-blue-400" />
                            Políticas de Seguridad Requeridas:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {/* 1. Longitud */}
                            <RequirementItem
                                label="Entre 8 y 12 caracteres"
                                isValid={validations.hasValidLength}
                            />
                            {/* 2. Mayúscula */}
                            <RequirementItem
                                label="Al menos una mayúscula (A-Z)"
                                isValid={validations.hasUppercase}
                            />
                            {/* 3. Minúscula */}
                            <RequirementItem
                                label="Al menos una minúscula (a-z)"
                                isValid={validations.hasLowercase}
                            />
                            {/* 4. Número */}
                            <RequirementItem
                                label="Al menos un número (0-9)"
                                isValid={validations.hasNumber}
                            />
                            {/* 5. Carácter Especial */}
                            <RequirementItem
                                label="Un símbolo (@ $ ! % * # ? & . _ -)"
                                isValid={validations.hasSpecialChar}
                            />
                            {/* 6. Coincidencia */}
                            <RequirementItem
                                label="Las contraseñas coinciden"
                                isValid={validations.matchesConfirm}
                            />
                        </div>
                    </div>

                    {/* Botón de Enviar */}
                    <Button
                        type="submit"
                        disabled={!allPassed || processing}
                        className={cn(
                            'w-full py-3 h-12 text-sm font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2',
                            allPassed
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/40 cursor-pointer'
                                : 'bg-slate-700/60 text-slate-400 cursor-not-allowed border border-slate-700'
                        )}
                    >
                        {processing ? (
                            <>
                                <LoaderCircle className="w-4 h-4 animate-spin" />
                                <span>Actualizando contraseña...</span>
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                <span>Guardar Contraseña y Continuar</span>
                            </>
                        )}
                    </Button>
                </form>
            </div>

            {/* Footer */}
            <p className="text-slate-500 text-xs mt-6 text-center z-10">
                © {new Date().getFullYear()} Movimiento Misionero Mundial en Venezuela
            </p>
        </div>
    );
}

function RequirementItem({ label, isValid }: { label: string; isValid: boolean }) {
    return (
        <div
            className={cn(
                'flex items-center gap-2 p-1.5 rounded-lg transition-colors',
                isValid ? 'text-emerald-400 bg-emerald-950/20 font-medium' : 'text-slate-400'
            )}
        >
            <div
                className={cn(
                    'w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold border transition-colors',
                    isValid
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'bg-slate-800 border-slate-600 text-slate-500'
                )}
            >
                {isValid ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3" />}
            </div>
            <span className="truncate">{label}</span>
        </div>
    );
}
