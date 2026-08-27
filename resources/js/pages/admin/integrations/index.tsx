import { Head, useForm, Link, router } from '@inertiajs/react';
import { Settings2, Map, ShieldCheck, Save, MessageSquare, CreditCard, ExternalLink, Wifi, Loader2, Mail, Eye, EyeOff, Send, HelpCircle } from 'lucide-react';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslate } from '@/hooks/use-translate';

interface PageProps {
    mapbox_api_key: string | null;
    mapbox_active: boolean;
    google_maps_api_key: string | null;
    google_maps_active: boolean;
    google_smtp_host: string | null;
    google_smtp_port: number | null;
    google_smtp_encryption: string | null;
    google_smtp_email: string | null;
    google_smtp_password?: string | null;
    google_smtp_from_address: string | null;
    google_smtp_from_name: string | null;
    google_smtp_active: boolean;
    mailgun_domain: string | null;
    mailgun_secret?: string | null;
    mailgun_endpoint: string | null;
    mailgun_from_address: string | null;
    mailgun_from_name: string | null;
    mailgun_active: boolean;
    whatsapp_active: boolean;
    whatsapp_connected: boolean;
    control_acceso_base_url: string | null;
    control_acceso_app_token: string | null;
    control_acceso_user_token: string | null;
    control_acceso_active: boolean;
}

export default function Integrations({
    mapbox_api_key,
    mapbox_active,
    google_maps_api_key,
    google_maps_active,
    google_smtp_host,
    google_smtp_port,
    google_smtp_encryption,
    google_smtp_email,
    google_smtp_password,
    google_smtp_from_address,
    google_smtp_from_name,
    google_smtp_active,
    mailgun_domain,
    mailgun_secret,
    mailgun_endpoint,
    mailgun_from_address,
    mailgun_from_name,
    mailgun_active,
    whatsapp_active,
    whatsapp_connected,
    control_acceso_base_url,
    control_acceso_app_token,
    control_acceso_user_token,
    control_acceso_active,
}: PageProps) {
    const { __ } = useTranslate();
    const [testingConnection, setTestingConnection] = useState(false);
    const [testingSmtp, setTestingSmtp] = useState(false);
    const [showSmtpPassword, setShowSmtpPassword] = useState(false);
    const [testingMailgun, setTestingMailgun] = useState(false);
    const [showMailgunSecret, setShowMailgunSecret] = useState(false);

    const mapboxForm = useForm({
        mapbox_api_key: mapbox_api_key || '',
        mapbox_active: mapbox_active,
    });

    const googleMapsForm = useForm({
        google_maps_api_key: google_maps_api_key || '',
        google_maps_active: google_maps_active,
    });

    const googleSmtpForm = useForm({
        google_smtp_host: google_smtp_host || 'smtp.gmail.com',
        google_smtp_port: google_smtp_port || 587,
        google_smtp_encryption: google_smtp_encryption || 'tls',
        google_smtp_email: google_smtp_email || '',
        google_smtp_password: google_smtp_password || '',
        google_smtp_from_address: google_smtp_from_address || '',
        google_smtp_from_name: google_smtp_from_name || '',
        google_smtp_active: google_smtp_active,
    });

    const mailgunForm = useForm({
        mailgun_domain: mailgun_domain || '',
        mailgun_secret: mailgun_secret || '',
        mailgun_endpoint: mailgun_endpoint || 'api.mailgun.net',
        mailgun_from_address: mailgun_from_address || '',
        mailgun_from_name: mailgun_from_name || '',
        mailgun_active: mailgun_active,
    });

    const controlAccesoForm = useForm({
        control_acceso_base_url: control_acceso_base_url || '',
        control_acceso_app_token: control_acceso_app_token || '',
        control_acceso_user_token: control_acceso_user_token || '',
        control_acceso_active: control_acceso_active,
    });

    const handleSaveMapbox = (e: React.FormEvent) => {
        e.preventDefault();
        mapboxForm.put('/admin/integrations/mapbox', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: __('Settings Saved'),
                    text: __('Mapbox integration has been successfully updated.'),
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
        });
    };

    const handleSaveGoogleMaps = (e: React.FormEvent) => {
        e.preventDefault();
        googleMapsForm.put('/admin/integrations/google-maps', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: __('Settings Saved'),
                    text: __('Google Maps integration has been successfully updated.'),
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
        });
    };

    const handleSaveGoogleSmtp = (e: React.FormEvent) => {
        e.preventDefault();
        googleSmtpForm.put('/admin/integrations/google-smtp', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: __('Settings Saved'),
                    text: __('Google SMTP settings updated successfully.'),
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
        });
    };

    const handleTestGoogleSmtp = async () => {
        const { value: email } = await Swal.fire({
            title: __('Test Google SMTP Connection'),
            text: __('Enter a recipient email address to send a verification test message:'),
            input: 'email',
            inputPlaceholder: 'tu-correo@ejemplo.com',
            inputValue: googleSmtpForm.data.google_smtp_email || '',
            showCancelButton: true,
            confirmButtonText: __('Send Test Email'),
            cancelButtonText: __('Cancel'),
            confirmButtonColor: '#ea4335',
            inputValidator: (value) => {
                if (!value) {
                    return __('Please enter a valid email address.');
                }
            }
        });

        if (email) {
            setTestingSmtp(true);
            router.post('/admin/integrations/google-smtp/test', { test_email: email }, {
                preserveScroll: true,
                onFinish: () => setTestingSmtp(false),
            });
        }
    };

    const handleSaveMailgun = (e: React.FormEvent) => {
        e.preventDefault();
        mailgunForm.put('/admin/integrations/mailgun', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: __('Settings Saved'),
                    text: __('Mailgun integration settings updated successfully.'),
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
        });
    };

    const handleTestMailgun = async () => {
        const { value: email } = await Swal.fire({
            title: __('Test Mailgun Connection'),
            text: __('Enter a recipient email address to send a verification test message:'),
            input: 'email',
            inputPlaceholder: 'tu-correo@ejemplo.com',
            inputValue: mailgunForm.data.mailgun_from_address || '',
            showCancelButton: true,
            confirmButtonText: __('Send Test Email'),
            cancelButtonText: __('Cancel'),
            confirmButtonColor: '#f97316',
            inputValidator: (value) => {
                if (!value) {
                    return __('Please enter a valid email address.');
                }
            }
        });

        if (email) {
            setTestingMailgun(true);
            router.post('/admin/integrations/mailgun/test', { test_email: email }, {
                preserveScroll: true,
                onFinish: () => setTestingMailgun(false),
            });
        }
    };

    const handleSaveControlAcceso = (e: React.FormEvent) => {
        e.preventDefault();
        controlAccesoForm.put('/admin/integrations/control-acceso', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: __('Settings Saved'),
                    text: __('Access Control middleware settings updated successfully.'),
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
        });
    };

    const handleTestControlAcceso = () => {
        setTestingConnection(true);
        router.post('/admin/integrations/control-acceso/test', {}, {
            preserveScroll: true,
            onFinish: () => setTestingConnection(false),
        });
    };

    const breadcrumbs = [
        { title: __('Dashboard'), href: '/admin/dashboard' },
        { title: __('Settings'), href: '#' },
        { title: __('Integrations'), href: '/admin/integrations' }
    ];

    return (
        <>
            <Head title={__('Integrations')} />
            <div className="space-y-6">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Settings2 className="h-8 w-8 text-indigo-600" />
                            {__('Integrations Catalog')}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {__('Configure external APIs, mapping systems, and third-party services for your business.')}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Mapbox Integration */}
                    <Card className="shadow-sm border-t-4 border-t-indigo-600 flex flex-col justify-between">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600">
                                        <Map className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle>{__('Mapbox Maps')}</CardTitle>
                                        <CardDescription>{__('Interactive geolocation and high-performance vector maps.')}</CardDescription>
                                    </div>
                                </div>
                                <BadgeStatus active={mapboxForm.data.mapbox_active} />
                            </div>
                        </CardHeader>
                        <form onSubmit={handleSaveMapbox}>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">{__('Enable Mapbox')}</Label>
                                        <p className="text-xs text-muted-foreground">{__('Toggle map engine replacement from Leaflet to Mapbox.')}</p>
                                    </div>
                                    <Switch
                                        checked={mapboxForm.data.mapbox_active}
                                        onCheckedChange={(checked) => mapboxForm.setData('mapbox_active', checked)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mapbox_api_key">{__('Mapbox Access Token')}</Label>
                                    <Input
                                        id="mapbox_api_key"
                                        type="password"
                                        placeholder="pk.eyJ1..."
                                        value={mapboxForm.data.mapbox_api_key}
                                        onChange={(e) => mapboxForm.setData('mapbox_api_key', e.target.value)}
                                        disabled={!mapboxForm.data.mapbox_active}
                                        className="font-mono text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span>{__('Get your token from')}</span>
                                        <a
                                            href="https://mapbox.com"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-indigo-600 hover:underline flex items-center gap-0.5"
                                        >
                                            mapbox.com <ExternalLink className="h-3 w-3 inline" />
                                        </a>
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-slate-50/50 dark:bg-slate-900/10 px-6 py-4 flex justify-between">
                                <Link href="/admin/integrations/map">
                                    <Button variant="outline" size="sm" className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 dark:border-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-950/20" disabled={!mapboxForm.data.mapbox_active}>
                                        <Map className="h-4 w-4" />
                                        {__('View Routes')}
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={mapboxForm.processing || !mapboxForm.data.mapbox_active} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    {__('Save Changes')}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* Google Maps Integration */}
                    <Card className="shadow-sm border-t-4 border-t-blue-600 flex flex-col justify-between">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-600">
                                        <Map className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle>{__('Google Maps API')}</CardTitle>
                                        <CardDescription>{__('High-accuracy geocoding, places autocomplete, and directions service.')}</CardDescription>
                                    </div>
                                </div>
                                <BadgeStatus active={googleMapsForm.data.google_maps_active} />
                            </div>
                        </CardHeader>
                        <form onSubmit={handleSaveGoogleMaps}>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">{__('Enable Google Maps')}</Label>
                                        <p className="text-xs text-muted-foreground">{__('Enable Google Maps for routing and geocoding in Venezuela.')}</p>
                                    </div>
                                    <Switch
                                        checked={googleMapsForm.data.google_maps_active}
                                        onCheckedChange={(checked) => googleMapsForm.setData('google_maps_active', checked)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="google_maps_api_key">{__('Google Maps API Key')}</Label>
                                    <Input
                                        id="google_maps_api_key"
                                        type="password"
                                        placeholder="AIzaSy..."
                                        value={googleMapsForm.data.google_maps_api_key}
                                        onChange={(e) => googleMapsForm.setData('google_maps_api_key', e.target.value)}
                                        disabled={!googleMapsForm.data.google_maps_active}
                                        className="font-mono text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span>{__('Get your API key from')}</span>
                                        <a
                                            href="https://console.cloud.google.com"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 hover:underline flex items-center gap-0.5"
                                        >
                                            console.cloud.google.com <ExternalLink className="h-3 w-3 inline" />
                                        </a>
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-slate-50/50 dark:bg-slate-900/10 px-6 py-4 flex justify-end">
                                <Button type="submit" disabled={googleMapsForm.processing || !googleMapsForm.data.google_maps_active} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    {__('Save Changes')}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* Google SMTP Integration */}
                    <Card className="shadow-sm border-t-4 border-t-rose-500 flex flex-col justify-between">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/20 text-rose-600">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle>{__('Google SMTP (Gmail / Workspace)')}</CardTitle>
                                        <CardDescription>{__('Send transactional emails and notifications reliably using Google SMTP service.')}</CardDescription>
                                    </div>
                                </div>
                                <BadgeStatus active={googleSmtpForm.data.google_smtp_active} />
                            </div>
                        </CardHeader>
                        <form onSubmit={handleSaveGoogleSmtp}>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">{__('Enable Google SMTP')}</Label>
                                        <p className="text-xs text-muted-foreground">{__('Enable email dispatch via Google SMTP for company alerts.')}</p>
                                    </div>
                                    <Switch
                                        checked={googleSmtpForm.data.google_smtp_active}
                                        onCheckedChange={(checked) => googleSmtpForm.setData('google_smtp_active', checked)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="google_smtp_email">{__('Google Email / Username')}</Label>
                                        <Input
                                            id="google_smtp_email"
                                            type="email"
                                            placeholder="tu-correo@gmail.com"
                                            value={googleSmtpForm.data.google_smtp_email}
                                            onChange={(e) => googleSmtpForm.setData('google_smtp_email', e.target.value)}
                                            disabled={!googleSmtpForm.data.google_smtp_active}
                                            className="font-mono text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="google_smtp_password">{__('Google App Password')}</Label>
                                            <button
                                                type="button"
                                                onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                                tabIndex={-1}
                                            >
                                                {showSmtpPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                {showSmtpPassword ? __('Hide') : __('Show')}
                                            </button>
                                        </div>
                                        <Input
                                            id="google_smtp_password"
                                            type={showSmtpPassword ? 'text' : 'password'}
                                            placeholder="••••••••••••••••"
                                            value={googleSmtpForm.data.google_smtp_password}
                                            onChange={(e) => googleSmtpForm.setData('google_smtp_password', e.target.value)}
                                            disabled={!googleSmtpForm.data.google_smtp_active}
                                            className="font-mono text-sm tracking-wider"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="google_smtp_from_name">{__('Sender Name (From Name)')}</Label>
                                        <Input
                                            id="google_smtp_from_name"
                                            type="text"
                                            placeholder="MMM Venezuela"
                                            value={googleSmtpForm.data.google_smtp_from_name}
                                            onChange={(e) => googleSmtpForm.setData('google_smtp_from_name', e.target.value)}
                                            disabled={!googleSmtpForm.data.google_smtp_active}
                                            className="text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="google_smtp_from_address">{__('Sender Email (From Email)')}</Label>
                                        <Input
                                            id="google_smtp_from_address"
                                            type="email"
                                            placeholder="no-reply@tu-dominio.com"
                                            value={googleSmtpForm.data.google_smtp_from_address}
                                            onChange={(e) => googleSmtpForm.setData('google_smtp_from_address', e.target.value)}
                                            disabled={!googleSmtpForm.data.google_smtp_active}
                                            className="font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 pt-1">
                                    <div className="space-y-1">
                                        <Label htmlFor="google_smtp_host" className="text-xs text-muted-foreground">{__('SMTP Host')}</Label>
                                        <Input
                                            id="google_smtp_host"
                                            type="text"
                                            placeholder="smtp.gmail.com"
                                            value={googleSmtpForm.data.google_smtp_host}
                                            onChange={(e) => googleSmtpForm.setData('google_smtp_host', e.target.value)}
                                            disabled={!googleSmtpForm.data.google_smtp_active}
                                            className="font-mono text-xs h-9"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="google_smtp_port" className="text-xs text-muted-foreground">{__('Port')}</Label>
                                        <Input
                                            id="google_smtp_port"
                                            type="number"
                                            placeholder="587"
                                            value={googleSmtpForm.data.google_smtp_port}
                                            onChange={(e) => googleSmtpForm.setData('google_smtp_port', parseInt(e.target.value) || 587)}
                                            disabled={!googleSmtpForm.data.google_smtp_active}
                                            className="font-mono text-xs h-9"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="google_smtp_encryption" className="text-xs text-muted-foreground">{__('Encryption')}</Label>
                                        <select
                                            id="google_smtp_encryption"
                                            value={googleSmtpForm.data.google_smtp_encryption}
                                            onChange={(e) => googleSmtpForm.setData('google_smtp_encryption', e.target.value)}
                                            disabled={!googleSmtpForm.data.google_smtp_active}
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                                        >
                                            <option value="tls">TLS (587)</option>
                                            <option value="ssl">SSL (465)</option>
                                            <option value="starttls">STARTTLS</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                                    <div className="flex items-center gap-1.5 font-semibold">
                                        <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                        <span>{__('Google App Passwords Guide')}</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300/90">
                                        {__('For accounts with 2-Step Verification, generate a 16-character App Password at:')}{' '}
                                        <a
                                            href="https://myaccount.google.com/apppasswords"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-medium underline hover:text-amber-950 dark:hover:text-amber-100 inline-flex items-center gap-0.5"
                                        >
                                            myaccount.google.com/apppasswords <ExternalLink className="h-3 w-3 inline" />
                                        </a>
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-slate-50/50 dark:bg-slate-900/10 px-6 py-4 flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/20"
                                    disabled={!googleSmtpForm.data.google_smtp_active || testingSmtp}
                                    onClick={handleTestGoogleSmtp}
                                >
                                    {testingSmtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    {__('Test Connection')}
                                </Button>
                                <Button type="submit" disabled={googleSmtpForm.processing || !googleSmtpForm.data.google_smtp_active} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    {__('Save Changes')}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* Mailgun Integration */}
                    <Card className="shadow-sm border-t-4 border-t-orange-500 flex flex-col justify-between">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded bg-orange-50 dark:bg-orange-950/20 text-orange-600">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle>{__('Mailgun API')}</CardTitle>
                                        <CardDescription>{__('High-deliverability transactional email delivery via Mailgun REST API.')}</CardDescription>
                                    </div>
                                </div>
                                <BadgeStatus active={mailgunForm.data.mailgun_active} />
                            </div>
                        </CardHeader>
                        <form onSubmit={handleSaveMailgun}>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">{__('Enable Mailgun')}</Label>
                                        <p className="text-xs text-muted-foreground">{__('Enable email dispatch via Mailgun API for company notifications.')}</p>
                                    </div>
                                    <Switch
                                        checked={mailgunForm.data.mailgun_active}
                                        onCheckedChange={(checked) => mailgunForm.setData('mailgun_active', checked)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="mailgun_domain">{__('Mailgun Domain')}</Label>
                                        <Input
                                            id="mailgun_domain"
                                            type="text"
                                            placeholder="mg.tu-dominio.com"
                                            value={mailgunForm.data.mailgun_domain}
                                            onChange={(e) => mailgunForm.setData('mailgun_domain', e.target.value)}
                                            disabled={!mailgunForm.data.mailgun_active}
                                            className="font-mono text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="mailgun_secret">{__('Mailgun API Key')}</Label>
                                            <button
                                                type="button"
                                                onClick={() => setShowMailgunSecret(!showMailgunSecret)}
                                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                                tabIndex={-1}
                                            >
                                                {showMailgunSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                {showMailgunSecret ? __('Hide') : __('Show')}
                                            </button>
                                        </div>
                                        <Input
                                            id="mailgun_secret"
                                            type={showMailgunSecret ? 'text' : 'password'}
                                            placeholder="key-••••••••••••••••"
                                            value={mailgunForm.data.mailgun_secret}
                                            onChange={(e) => mailgunForm.setData('mailgun_secret', e.target.value)}
                                            disabled={!mailgunForm.data.mailgun_active}
                                            className="font-mono text-sm tracking-wider"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="mailgun_from_name">{__('Sender Name (From Name)')}</Label>
                                        <Input
                                            id="mailgun_from_name"
                                            type="text"
                                            placeholder="MMM Venezuela"
                                            value={mailgunForm.data.mailgun_from_name}
                                            onChange={(e) => mailgunForm.setData('mailgun_from_name', e.target.value)}
                                            disabled={!mailgunForm.data.mailgun_active}
                                            className="text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mailgun_from_address">{__('Sender Email (From Email)')}</Label>
                                        <Input
                                            id="mailgun_from_address"
                                            type="email"
                                            placeholder="no-reply@mg.tu-dominio.com"
                                            value={mailgunForm.data.mailgun_from_address}
                                            onChange={(e) => mailgunForm.setData('mailgun_from_address', e.target.value)}
                                            disabled={!mailgunForm.data.mailgun_active}
                                            className="font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mailgun_endpoint">{__('Mailgun Server Region / Endpoint')}</Label>
                                    <select
                                        id="mailgun_endpoint"
                                        value={mailgunForm.data.mailgun_endpoint}
                                        onChange={(e) => mailgunForm.setData('mailgun_endpoint', e.target.value)}
                                        disabled={!mailgunForm.data.mailgun_active}
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                                    >
                                        <option value="api.mailgun.net">US Region (api.mailgun.net)</option>
                                        <option value="api.eu.mailgun.net">EU Region (api.eu.mailgun.net)</option>
                                    </select>
                                </div>

                                <div className="p-3 rounded-lg bg-orange-50/80 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/50 text-xs text-orange-900 dark:text-orange-300 space-y-1">
                                    <div className="flex items-center gap-1.5 font-semibold">
                                        <HelpCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                                        <span>{__('Mailgun API Key Guide')}</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed text-orange-800 dark:text-orange-300/90">
                                        {__('Find your Sending API Key or Primary Account API Key in your Mailgun Security settings at:')}{' '}
                                        <a
                                            href="https://app.mailgun.com/app/account/security/api_keys"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-medium underline hover:text-orange-950 dark:hover:text-orange-100 inline-flex items-center gap-0.5"
                                        >
                                            app.mailgun.com/app/account/security/api_keys <ExternalLink className="h-3 w-3 inline" />
                                        </a>
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-slate-50/50 dark:bg-slate-900/10 px-6 py-4 flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 dark:border-orange-900/50 dark:text-orange-400 dark:hover:bg-orange-950/20"
                                    disabled={!mailgunForm.data.mailgun_active || testingMailgun}
                                    onClick={handleTestMailgun}
                                >
                                    {testingMailgun ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    {__('Test Connection')}
                                </Button>
                                <Button type="submit" disabled={mailgunForm.processing || !mailgunForm.data.mailgun_active} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    {__('Save Changes')}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* WhatsApp Integration */}
                    <Card className="shadow-sm border-t-4 border-t-emerald-600 flex flex-col justify-between">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle>{__('WhatsApp API')}</CardTitle>
                                        <CardDescription>{__('Automate customer messaging and trigger notification alerts.')}</CardDescription>
                                    </div>
                                </div>
                                <BadgeWhatsAppStatus active={whatsapp_active} connected={whatsapp_connected} />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 py-4 text-sm text-slate-600 dark:text-slate-400">
                            <p>
                                {__('Connect your corporate WhatsApp account using QR code. Send transactional alerts, customer reminders, and manage templates.')}
                            </p>
                        </CardContent>
                        <CardFooter className="border-t bg-slate-50/50 dark:bg-slate-900/10 px-6 py-4 flex justify-end">
                            <Link href="/admin/integrations/whatsapp">
                                <Button variant="outline" size="sm" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-950/20">
                                    <Settings2 className="h-4 w-4" />
                                    {__('Configure')}
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Control de Acceso Middleware Integration */}
                    <Card className="shadow-sm border-t-4 border-t-purple-600 flex flex-col justify-between">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded bg-purple-50 dark:bg-purple-950/20 text-purple-600">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle>{__('Access Control Middleware')}</CardTitle>
                                        <CardDescription>{__('Connect to the external Access Control middleware to authenticate requests such as employee lookups.')}</CardDescription>
                                    </div>
                                </div>
                                <BadgeStatus active={controlAccesoForm.data.control_acceso_active} />
                            </div>
                        </CardHeader>
                        <form onSubmit={handleSaveControlAcceso}>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">{__('Enable Access Control Middleware')}</Label>
                                        <p className="text-xs text-muted-foreground">{__('Toggle the connection to the external Access Control middleware service.')}</p>
                                    </div>
                                    <Switch
                                        checked={controlAccesoForm.data.control_acceso_active}
                                        onCheckedChange={(checked) => controlAccesoForm.setData('control_acceso_active', checked)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="control_acceso_base_url">{__('Base URL')}</Label>
                                    <Input
                                        id="control_acceso_base_url"
                                        type="text"
                                        placeholder="https://tu-middleware.ejemplo.com"
                                        value={controlAccesoForm.data.control_acceso_base_url}
                                        onChange={(e) => controlAccesoForm.setData('control_acceso_base_url', e.target.value)}
                                        disabled={!controlAccesoForm.data.control_acceso_active}
                                        className="font-mono text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="control_acceso_app_token">{__('App Token')}</Label>
                                    <Input
                                        id="control_acceso_app_token"
                                        type="password"
                                        placeholder="shk_..."
                                        value={controlAccesoForm.data.control_acceso_app_token}
                                        onChange={(e) => controlAccesoForm.setData('control_acceso_app_token', e.target.value)}
                                        disabled={!controlAccesoForm.data.control_acceso_active}
                                        className="font-mono text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground">{__('Sent as the Bearer Authorization header on every request.')}</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="control_acceso_user_token">{__('User Token')}</Label>
                                    <Input
                                        id="control_acceso_user_token"
                                        type="password"
                                        placeholder="usr_..."
                                        value={controlAccesoForm.data.control_acceso_user_token}
                                        onChange={(e) => controlAccesoForm.setData('control_acceso_user_token', e.target.value)}
                                        disabled={!controlAccesoForm.data.control_acceso_active}
                                        className="font-mono text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground">{__('Sent as the X-User-Token header on every request.')}</p>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-slate-50/50 dark:bg-slate-900/10 px-6 py-4 flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 dark:border-purple-900/50 dark:text-purple-400 dark:hover:bg-purple-950/20"
                                    disabled={!controlAccesoForm.data.control_acceso_active || testingConnection}
                                    onClick={handleTestControlAcceso}
                                >
                                    {testingConnection ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
                                    {__('Test Connection')}
                                </Button>
                                <Button type="submit" disabled={controlAccesoForm.processing || !controlAccesoForm.data.control_acceso_active} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    {__('Save Changes')}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* Placeholder Premium 2: Stripe Integration */}
                    <Card className="shadow-sm border-t-4 border-t-blue-600 opacity-60 flex flex-col justify-between">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-600">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle>{__('Stripe Billing')}</CardTitle>
                                    <CardDescription>{__('Accept credit card payments and manage subscriptions.')}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-center items-center py-6 text-center">
                            <p className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                {__('Coming Soon')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2 max-w-xs">
                                {__('Currently developing support for automated SaaS recurring credit cards billing.')}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function BadgeStatus({ active }: { active: boolean }) {
    const { __ } = useTranslate();

    return (
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${active
            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
            : 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-400'
            }`}>
            {active ? __('Active') : __('Inactive')}
        </span>
    );
}

function BadgeWhatsAppStatus({ active, connected }: { active: boolean; connected: boolean }) {
    const { __ } = useTranslate();

    if (!active) {
        return (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-400">
                {__('Inactive')}
            </span>
        );
    }

    if (connected) {
        return (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {__('Connected')}
            </span>
        );
    }

    return (
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            {__('Disconnected')}
        </span>
    );
}