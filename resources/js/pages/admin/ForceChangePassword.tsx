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
    KeyRound,
    AlertCircle,
    Sparkles,
    UserCheck,
    Smartphone,
    Fingerprint,
    Shield,
    LogOut,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ModuleHeader } from '@/components/module-header';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslate } from '@/hooks/use-translate';
import { cn } from '@/lib/utils';

type Props = {
    user: {
        name: string;
        email: string;
        username?: string | null;
    };
    status?: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

// Generador de contraseña segura compatible con las políticas (8-12 caracteres, mayúsculas, minúsculas, números y símbolos)
const generateStrongPassword = (length = 10): string => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '@$!%*#?&._-';

    const pass = [
        uppercase[Math.floor(Math.random() * uppercase.length)],
        lowercase[Math.floor(Math.random() * lowercase.length)],
        numbers[Math.floor(Math.random() * numbers.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
    ];

    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = pass.length; i < length; i++) {
        pass.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }

    return pass.sort(() => Math.random() - 0.5).join('');
};

export default function ForceChangePassword(props: Props) {
    const { user, status } = props;
    const { __ } = useTranslate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('password');

    const breadcrumbs = [
        { title: __('Seguridad'), href: '#' },
        { title: __('Primer Inicio de Sesión'), href: '#' },
    ];

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

    const handleAutoGenerate = () => {
        const generated = generateStrongPassword(10);
        setData({
            password: generated,
            password_confirmation: generated,
        });
        setShowPassword(true);
        setShowConfirmPassword(true);
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
            ? __('Débil')
            : passedCount <= 4
            ? __('Media')
            : passedCount < 6
            ? __('Casi lista')
            : __('Excelente y Segura');

    return (
        <>
            <Head title={__('Primer Inicio de Sesión - Seguridad')} />

            <div className="w-full space-y-6">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                <ModuleHeader
                    icon={<ShieldCheck className="h-6 w-6 text-white" />}
                    title={__('Configuración de Seguridad de la Cuenta')}
                    description={__(
                        'Establezca su contraseña personal y gestione métodos de autenticación avanzados (2FA y Passkeys).'
                    )}
                    colorClassName="bg-blue-600"
                />

                {status && (
                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 text-sm flex items-center gap-2 shadow-xs">
                        <Check className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{status}</span>
                    </div>
                )}

                {/* Resumen de Estado de Seguridad en 3 Columnas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. Usuario */}
                    <Card className="border-border shadow-xs bg-card">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200/50 dark:border-blue-900/50">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate min-w-0">
                                <p className="text-xs text-muted-foreground">{__('Sesión Activa')}</p>
                                <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Estado de Contraseña */}
                    <Card className="border-amber-200/70 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    {__('Cambio de Contraseña')}
                                </p>
                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                    {__('Obligatorio para continuar')}
                                </p>
                            </div>
                            <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 text-xs">
                                {__('Requerido')}
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* 3. Métodos Adicionales */}
                    <Card className="border-border shadow-xs bg-card">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    {__('Protección Avanzada')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {props.twoFactorEnabled
                                        ? __('2FA Habilitado')
                                        : props.passkeys && props.passkeys.length > 0
                                        ? `${props.passkeys.length} ${__('Passkey(s)')}`
                                        : __('2FA y Passkeys disponibles')}
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className={cn(
                                    'text-xs',
                                    props.twoFactorEnabled || (props.passkeys && props.passkeys.length > 0)
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                        : 'bg-muted text-muted-foreground border-border'
                                )}
                            >
                                {props.twoFactorEnabled || (props.passkeys && props.passkeys.length > 0)
                                    ? __('Protegido')
                                    : __('Opcional')}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Contenedor con Tabs Organizados */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                    <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full h-auto p-1.5 bg-muted/60 border border-border rounded-xl gap-1">
                        <TabsTrigger
                            value="password"
                            className="flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg"
                        >
                            <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>1. {__('Contraseña')}</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 ml-1">
                                {__('Requerido')}
                            </Badge>
                        </TabsTrigger>

                        <TabsTrigger
                            value="2fa"
                            className="flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg"
                        >
                            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>2. {__('Dos Pasos (2FA)')}</span>
                            {props.twoFactorEnabled && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ml-1" />
                            )}
                        </TabsTrigger>

                        <TabsTrigger
                            value="passkeys"
                            className="flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg"
                        >
                            <Fingerprint className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>3. {__('Llaves (Passkeys)')}</span>
                            {props.passkeys && props.passkeys.length > 0 && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">
                                    {props.passkeys.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: FORMULARIO PRINCIPAL DE CONTRASEÑA */}
                    <TabsContent value="password" className="mt-0 focus-visible:outline-none">
                        <Card className="border-border shadow-sm">
                            <form onSubmit={handleSubmit}>
                                <CardHeader className="border-b border-border/60 pb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                                                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                {__('Establecer Nueva Contraseña')}
                                            </CardTitle>
                                            <CardDescription className="text-xs text-muted-foreground">
                                                {__('Defina su clave cumpliendo los requisitos obligatorios de longitud y caracteres.')}
                                            </CardDescription>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={handleAutoGenerate}
                                            variant="outline"
                                            size="sm"
                                            className="self-start sm:self-auto text-xs font-semibold text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900 bg-blue-50/60 hover:bg-blue-100/60 dark:bg-blue-950/30 gap-1.5"
                                        >
                                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                            {__('Generar Contraseña Segura')}
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                        {/* Columna Izquierda: Entradas de Contraseña */}
                                        <div className="space-y-5">
                                            {/* Nueva Contraseña */}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="password" className="text-xs font-bold text-foreground">
                                                    {__('Nueva Contraseña')} *
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        placeholder={__('Ej. ClaveFuerte2026*')}
                                                        maxLength={12}
                                                        autoFocus
                                                        required
                                                        className="pr-10 h-11 text-sm bg-background"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                {errors.password && (
                                                    <p className="text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1 mt-1 font-medium">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        {errors.password}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Confirmar Contraseña */}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="password_confirmation" className="text-xs font-bold text-foreground">
                                                    {__('Confirmar Contraseña')} *
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password_confirmation"
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        value={data.password_confirmation}
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                        placeholder={__('Repita exactamente la misma clave')}
                                                        maxLength={12}
                                                        required
                                                        className="pr-10 h-11 text-sm bg-background"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                {errors.password_confirmation && (
                                                    <p className="text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1 mt-1 font-medium">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        {errors.password_confirmation}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Barra de Progreso y Fortaleza */}
                                            {data.password.length > 0 && (
                                                <div className="space-y-1.5 pt-2">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">{__('Nivel de Fortaleza:')}</span>
                                                        <span className={cn(
                                                            'font-bold',
                                                            passedCount === 6 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                                                        )}>
                                                            {strengthLabel}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden p-0.5 border border-border">
                                                        <div
                                                            className={cn('h-full rounded-full transition-all duration-300', strengthColor)}
                                                            style={{ width: `${strengthPercentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Columna Derecha: Checklist Interactivo de Requisitos */}
                                        <div className="bg-muted/40 border border-border rounded-2xl p-5 space-y-4">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    {__('Políticas de Seguridad Requeridas:')}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {__('Todos los indicadores deben completarse en verde para habilitar el guardado.')}
                                                </p>
                                            </div>

                                            <div className="space-y-2 text-xs">
                                                <RequirementItem
                                                    label={__('Longitud entre 8 y 12 caracteres')}
                                                    isValid={validations.hasValidLength}
                                                />
                                                <RequirementItem
                                                    label={__('Al menos una letra mayúscula (A-Z)')}
                                                    isValid={validations.hasUppercase}
                                                />
                                                <RequirementItem
                                                    label={__('Al menos una letra minúscula (a-z)')}
                                                    isValid={validations.hasLowercase}
                                                />
                                                <RequirementItem
                                                    label={__('Al menos un dígito numérico (0-9)')}
                                                    isValid={validations.hasNumber}
                                                />
                                                <RequirementItem
                                                    label={__('Un carácter especial (@, $, !, %, *, #, ?, &, ., _, -)')}
                                                    isValid={validations.hasSpecialChar}
                                                />
                                                <RequirementItem
                                                    label={__('Las dos contraseñas coinciden')}
                                                    isValid={validations.matchesConfirm}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="bg-muted/20 border-t border-border p-4 sm:p-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => router.post('/logout')}
                                        className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs w-full sm:w-auto"
                                    >
                                        <LogOut className="w-3.5 h-3.5 mr-1.5" />
                                        {__('Cerrar Sesión')}
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={!allPassed || processing}
                                        className={cn(
                                            'w-full sm:w-auto font-bold py-2.5 px-8 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm',
                                            allPassed
                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20 cursor-pointer'
                                                : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed border border-border'
                                        )}
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="w-4 h-4 animate-spin" />
                                                <span>{__('Actualizando contraseña...')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-4 h-4" />
                                                <span>{__('Guardar Contraseña y Continuar')}</span>
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    {/* TAB 2: AUTENTICACIÓN EN DOS PASOS (2FA) */}
                    <TabsContent value="2fa" className="mt-0 focus-visible:outline-none">
                        <Card className="border-border shadow-sm">
                            <CardHeader className="border-b border-border/60 pb-4">
                                <div className="flex items-center gap-2">
                                    <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <CardTitle className="text-base font-bold">
                                        {__('Autenticación en Dos Pasos (2FA)')}
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    {__('Proteja su acceso solicitando un código temporal de seguridad mediante aplicaciones TOTP como Google Authenticator o Authy.')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <ManageTwoFactor
                                    canManageTwoFactor={props.canManageTwoFactor}
                                    twoFactorEnabled={props.twoFactorEnabled}
                                    requiresConfirmation={props.requiresConfirmation}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB 3: LLAVES DE ACCESO / PASSKEYS */}
                    <TabsContent value="passkeys" className="mt-0 focus-visible:outline-none">
                        <Card className="border-border shadow-sm">
                            <CardHeader className="border-b border-border/60 pb-4">
                                <div className="flex items-center gap-2">
                                    <Fingerprint className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    <CardTitle className="text-base font-bold">
                                        {__('Llaves de Seguridad / Passkeys')}
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    {__('Inicie sesión al instante con autenticación biométrica (Touch ID, Face ID, Windows Hello o llave física FIDO2).')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <ManagePasskeys
                                    canManagePasskeys={props.canManagePasskeys}
                                    passkeys={props.passkeys}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

function RequirementItem({ label, isValid }: { label: string; isValid: boolean }) {
    return (
        <div
            className={cn(
                'flex items-center gap-2.5 p-2 rounded-xl transition-colors',
                isValid
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 font-medium border border-emerald-200/60 dark:border-emerald-900/60'
                    : 'text-muted-foreground bg-background/50 border border-transparent'
            )}
        >
            <div
                className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border transition-colors',
                    isValid
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-muted border-border text-muted-foreground'
                )}
            >
                {isValid ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
            </div>
            <span className="truncate">{label}</span>
        </div>
    );
}
