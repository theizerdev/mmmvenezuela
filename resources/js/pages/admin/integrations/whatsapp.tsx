import { Head, useForm, router } from '@inertiajs/react';
import {
    Settings2, MessageSquare, QrCode, RefreshCw, Power, Send, Key,
    Database, AlertTriangle, CheckCircle2, Copy, Check, Activity, Phone,
    Shield, Clock, Sparkles, UserCheck, Flame, ListOrdered, CheckCircle,
    XCircle, HelpCircle, Server, Radio, ShieldCheck, ArrowRight, ExternalLink,
    Zap, Globe, Terminal, Layers
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ModuleHeader } from '@/components/module-header';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslate } from '@/hooks/use-translate';
import type { PaisPhoneOption } from '@/pages/admin/Empresas/Partials/PhoneInputGroup';
import PhoneInputGroup from '@/pages/admin/Empresas/Partials/PhoneInputGroup';

interface LiveStatus {
    isConnected: boolean;
    connectionState: string;
    qrCode: string | null;
    qrDataUrl?: string | null;
    token?: string | null;
    user: {
        id: string;
        name?: string;
    } | null;
    userJid?: string | null;
    lastSeen: string | null;
    reconnectAttempts: number;
    _error?: string;
}

interface QueueStats {
    totalQueued?: number;
    queued?: number;
    sentToday?: number;
    dailyLimit?: number;
    warmupMode?: boolean;
    rateLimitPerMin?: number;
    workingHoursEnabled?: boolean;
    workingHoursStart?: string;
    workingHoursEnd?: string;
    [key: string]: any;
}

interface PageProps {
    empresa_id: number;
    empresa_nombre: string;
    whatsapp_api_key: string | null;
    whatsapp_api_url: string;
    whatsapp_instance?: string;
    whatsapp_rate_limit: number;
    whatsapp_active: boolean;
    whatsapp_phone: string | null;
    whatsapp_status: string | null;
    live_status: LiveStatus | null;
    queue_stats?: QueueStats | null;
    paises: PaisPhoneOption[];
}

export default function WhatsAppIntegration({
    empresa_id,
    empresa_nombre,
    whatsapp_api_key,
    whatsapp_api_url,
    whatsapp_instance = '',
    whatsapp_rate_limit,
    whatsapp_active,
    whatsapp_phone,
    whatsapp_status,
    live_status,
    queue_stats,
    paises
}: PageProps) {
    const { __ } = useTranslate();
    const [copiedToken, setCopiedToken] = useState(false);
    const [copiedWebhook, setCopiedWebhook] = useState(false);
    const [liveStatusState, setLiveStatusState] = useState<LiveStatus | null>(live_status);
    const [queueStatsState, setQueueStatsState] = useState<QueueStats | null>(queue_stats || null);
    const [isPolling, setIsPolling] = useState(false);
    const [sendingMsg, setSendingMsg] = useState(false);
    const [checkingNumber, setCheckingNumber] = useState(false);
    const [numberCheckResult, setNumberCheckResult] = useState<{ checked: boolean; exists?: boolean; jid?: string; error?: string } | null>(null);
    const [previewingSpintax, setPreviewingSpintax] = useState(false);
    const [spintaxPreviews, setSpintaxPreviews] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('connection');

    const webhookUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/webhooks/whatsapp`
        : '/webhooks/whatsapp';

    // Formulario de configuración principal
    const configForm = useForm({
        whatsapp_api_url: whatsapp_api_url,
        whatsapp_instance: whatsapp_instance || `empresa_${empresa_id}`,
        whatsapp_api_key: whatsapp_api_key || '',
        whatsapp_active: whatsapp_active,
        whatsapp_rate_limit: whatsapp_rate_limit,
    });

    // Formulario de parámetros Anti-Baneo
    const antiBanForm = useForm({
        dailyLimit: queueStatsState?.dailyLimit || 100,
        warmupMode: queueStatsState?.warmupMode ?? true,
        workingHoursEnabled: queueStatsState?.workingHoursEnabled ?? true,
        workingHoursStart: queueStatsState?.workingHoursStart || '08:00',
        workingHoursEnd: queueStatsState?.workingHoursEnd || '20:00',
        proxyUrl: '',
    });

    // Formulario de mensaje de prueba con Spintax
    const [testMessage, setTestMessage] = useState({
        paisId: '',
        phoneNumber: '',
        message: '{Hola|Buen día|Qué tal} {{nombre}}, {te confirmamos que|te notificamos que} tu solicitud en {{empresa}} está lista. Código: {{random}}.',
        useSync: false,
    });

    // Determinar si la hora actual está dentro del horario laboral configurado
    const isWithinWorkingHours = useMemo(() => {
        if (!antiBanForm.data.workingHoursEnabled) return true;
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        const [startH, startM] = (antiBanForm.data.workingHoursStart || '08:00').split(':').map(Number);
        const [endH, endM] = (antiBanForm.data.workingHoursEnd || '20:00').split(':').map(Number);
        const startMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;
        return currentMins >= startMins && currentMins <= endMins;
    }, [antiBanForm.data.workingHoursEnabled, antiBanForm.data.workingHoursStart, antiBanForm.data.workingHoursEnd]);

    // Polling del estado de WhatsApp y Estadísticas de cola
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const shouldPoll = whatsapp_active;

        if (shouldPoll) {
            setIsPolling(true);
            intervalId = setInterval(async () => {
                try {
                    const response = await fetch('/admin/integrations/whatsapp/status');
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            setLiveStatusState(data.status);

                            if (data.status?.isConnected && !liveStatusState?.isConnected) {
                                Swal.fire({
                                    title: __('Connected!'),
                                    text: __('WhatsApp has been successfully linked.'),
                                    icon: 'success',
                                    timer: 3000,
                                    showConfirmButton: false,
                                });
                                router.reload({ only: ['whatsapp_phone', 'whatsapp_status'] });
                            }
                        }
                    }

                    if (liveStatusState?.isConnected) {
                        const queueRes = await fetch('/admin/integrations/whatsapp/queue-stats');
                        if (queueRes.ok) {
                            const queueData = await queueRes.json();
                            if (queueData.success && queueData.stats) {
                                setQueueStatsState(queueData.stats);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error polling status:', error);
                }
            }, 3500);
        } else {
            setIsPolling(false);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [whatsapp_active, liveStatusState?.isConnected, liveStatusState?.connectionState]);

    const handleSaveConfig = (e: React.FormEvent) => {
        e.preventDefault();
        configForm.put('/admin/integrations/whatsapp/update', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: __('Settings Saved'),
                    text: __('WhatsApp configuration has been successfully updated.'),
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
                router.reload();
            },
        });
    };

    const handleSaveAntiBan = (e: React.FormEvent) => {
        e.preventDefault();
        antiBanForm.post('/admin/integrations/whatsapp/antiban', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: __('Anti-Ban Updated'),
                    text: __('Anti-ban limits and schedule settings saved successfully.'),
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
        });
    };

    const handleGenerateToken = () => {
        Swal.fire({
            title: __('Are you sure?'),
            text: __('Generating a new token will invalidate the current one.'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: __('Yes, generate new token'),
            cancelButtonText: __('Cancel'),
            confirmButtonColor: '#e11d48',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post('/admin/integrations/whatsapp/generate-token', {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: __('Token Generated'),
                            text: __('A new API key has been created for your company.'),
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    }
                });
            }
        });
    };

    const handleSyncCompany = () => {
        Swal.fire({
            title: __('Synchronize Company?'),
            text: __('This will sync the company information and token with the WhatsApp server database.'),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: __('Yes, synchronize'),
            cancelButtonText: __('Cancel'),
            confirmButtonColor: '#059669',
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: __('Syncing...'),
                    text: __('Updating server credentials...'),
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                router.post('/admin/integrations/whatsapp/sync', {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: __('Synchronized!'),
                            text: __('The company credentials have been sent to the WhatsApp API server.'),
                            icon: 'success',
                            timer: 2500,
                            showConfirmButton: false,
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            title: __('Error'),
                            text: __('Failed to sync company credentials with WhatsApp API server.'),
                            icon: 'error',
                        });
                    }
                });
            }
        });
    };

    const handleConnect = () => {
        router.post('/admin/integrations/whatsapp/connect', {}, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: __('Connecting...'),
                    text: __('Initializing WhatsApp session. Please wait...'),
                    icon: 'info',
                    timer: 3000,
                    showConfirmButton: false,
                });
                setLiveStatusState(prev => prev ? { ...prev, connectionState: 'connecting' } : null);
            }
        });
    };

    const handleDisconnect = () => {
        Swal.fire({
            title: __('Disconnect WhatsApp?'),
            text: __('You will stop sending and receiving messages. The session on this device will be closed.'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: __('Yes, disconnect'),
            cancelButtonText: __('Cancel'),
            confirmButtonColor: '#e11d48',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post('/admin/integrations/whatsapp/disconnect', {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: __('Disconnected'),
                            text: __('Session closed successfully.'),
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                        setLiveStatusState(null);
                    }
                });
            }
        });
    };

    const handleReconnect = () => {
        router.post('/admin/integrations/whatsapp/reconnect', {}, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: __('Reconnecting'),
                    text: __('Requesting session reset from Baileys server...'),
                    icon: 'info',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        });
    };

    const getFullPhoneNumber = () => {
        if (!testMessage.paisId || !testMessage.phoneNumber) return '';
        const selectedPais = paises.find(p => p.id === Number(testMessage.paisId));
        if (!selectedPais?.codigo_telefonico) return '';
        const cleanCode = selectedPais.codigo_telefonico.replace(/^\+/, '');
        return `${cleanCode}${testMessage.phoneNumber.replace(/\D/g, '')}`;
    };

    const handleCheckNumber = async () => {
        const fullNumber = getFullPhoneNumber();
        if (!fullNumber) {
            Swal.fire({
                title: __('Missing Phone'),
                text: __('Please select a country and enter a phone number first.'),
                icon: 'warning',
            });
            return;
        }

        setCheckingNumber(true);
        setNumberCheckResult(null);

        try {
            const res = await fetch('/admin/integrations/whatsapp/check-number', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ phone: fullNumber }),
            });

            const json = await res.json();
            setCheckingNumber(false);

            if (json.success && json.data) {
                const exists = Boolean(json.data.exists);
                setNumberCheckResult({
                    checked: true,
                    exists: exists,
                    jid: json.data.jid || json.data.id || fullNumber,
                });

                if (exists) {
                    Swal.fire({
                        title: __('Registered on WhatsApp!'),
                        text: `${fullNumber} ${__('is a valid active WhatsApp account.')}`,
                        icon: 'success',
                        timer: 2500,
                        showConfirmButton: false,
                    });
                } else {
                    Swal.fire({
                        title: __('Number Not Found'),
                        text: `${fullNumber} ${__('is NOT registered on WhatsApp. Meta will penalize sending to this number.')}`,
                        icon: 'warning',
                    });
                }
            } else {
                setNumberCheckResult({
                    checked: true,
                    exists: false,
                    error: json.error || __('Verification error'),
                });
            }
        } catch (err: any) {
            setCheckingNumber(false);
            Swal.fire({
                title: __('Error'),
                text: err.message || __('Failed to check number.'),
                icon: 'error',
            });
        }
    };

    const handlePreviewSpintax = async () => {
        if (!testMessage.message.trim()) return;

        setPreviewingSpintax(true);
        try {
            const res = await fetch('/admin/integrations/whatsapp/preview-spintax', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    template: testMessage.message,
                    count: 4,
                    variables: {
                        nombre: 'Juan Pérez',
                        empresa: empresa_nombre,
                    }
                }),
            });

            const json = await res.json();
            setPreviewingSpintax(false);

            if (json.success && json.data?.variations) {
                setSpintaxPreviews(json.data.variations);
            } else if (json.data && Array.isArray(json.data)) {
                setSpintaxPreviews(json.data);
            }
        } catch (err) {
            setPreviewingSpintax(false);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        const fullNumber = getFullPhoneNumber();

        if (!fullNumber) {
            Swal.fire({
                title: __('Missing Phone'),
                text: __('Please select a country and enter a valid phone number.'),
                icon: 'error',
            });
            return;
        }

        setSendingMsg(true);
        router.post('/admin/integrations/whatsapp/send-message', {
            to: fullNumber,
            message: testMessage.message,
            sync: testMessage.useSync,
            variables: {
                nombre: 'Cliente de Prueba',
                empresa: empresa_nombre,
            }
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSendingMsg(false);
                Swal.fire({
                    title: __('Message Dispatched'),
                    text: __('Message processed with Anti-Ban protection and Spintax variation.'),
                    icon: 'success',
                    timer: 2500,
                    showConfirmButton: false,
                });
            },
            onError: (errors) => {
                setSendingMsg(false);
                Swal.fire({
                    title: __('Failed to Send'),
                    text: Object.values(errors).join(', ') || __('Error occurred during sending.'),
                    icon: 'error',
                });
            }
        });
    };

    const copyTokenToClipboard = () => {
        if (configForm.data.whatsapp_api_key) {
            navigator.clipboard.writeText(configForm.data.whatsapp_api_key);
            setCopiedToken(true);
            setTimeout(() => setCopiedToken(false), 2000);
        }
    };

    const copyWebhookToClipboard = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopiedWebhook(true);
        setTimeout(() => setCopiedWebhook(false), 2000);
    };

    const breadcrumbs = [
        { title: __('Dashboard'), href: '/admin/dashboard' },
        { title: __('Settings'), href: '#' },
        { title: __('Integrations'), href: '/admin/integrations' },
        { title: __('WhatsApp'), href: '/admin/integrations/whatsapp' }
    ];

    const isConnected = Boolean(liveStatusState?.isConnected);
    const isConnecting = liveStatusState?.connectionState === 'connecting';
    const isQrReady = liveStatusState?.connectionState === 'qr_ready' || liveStatusState?.status === 'qr' || Boolean(liveStatusState?.qrCode || liveStatusState?.qrDataUrl);
    const isServiceUnavailable = liveStatusState?._error === 'service_unavailable';

    const sentTodayCount = queueStatsState?.sentToday ?? 0;
    const dailyLimitCount = queueStatsState?.dailyLimit ?? antiBanForm.data.dailyLimit ?? 100;
    const quotaPercentage = Math.min(100, Math.round((sentTodayCount / (dailyLimitCount || 1)) * 100));

    return (
        <>
            <Head title={__('WhatsApp Integration')} />
            <div className="space-y-6 w-full pb-10">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                {/* Module Header */}
                <ModuleHeader
                    icon={<MessageSquare className="h-6 w-6 text-white" />}
                    title={__('WhatsApp API Module')}
                    description={`${__('Multi-Instance Baileys Engine for')} ${empresa_nombre}`}
                    colorClassName="bg-emerald-600"
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="bg-black/20 text-white border-white/20 font-mono text-xs">
                            {configForm.data.whatsapp_instance}
                        </Badge>
                        
                        <Badge className={`gap-1.5 text-xs ${
                            isConnected
                                ? 'bg-emerald-500 hover:bg-emerald-500 text-white'
                                : isConnecting || isQrReady
                                ? 'bg-amber-500 hover:bg-amber-500 text-white'
                                : 'bg-rose-500 hover:bg-rose-500 text-white'
                        }`}>
                            <span className={`h-2 w-2 rounded-full ${
                                isConnected
                                    ? 'bg-white animate-pulse'
                                    : isConnecting || isQrReady
                                    ? 'bg-white animate-ping'
                                    : 'bg-white'
                            }`} />
                            {isConnected ? __('Connected') : isQrReady ? __('Waiting Scan') : isConnecting ? __('Connecting...') : __('Disconnected')}
                        </Badge>

                        {isConnected && (
                            <div className="flex gap-2 ml-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleReconnect}
                                    className="h-8 bg-white/10 hover:bg-white/20 border-white/20 text-white text-xs gap-1.5"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    {__('Reset Session')}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleDisconnect}
                                    className="h-8 bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1.5"
                                >
                                    <Power className="h-3.5 w-3.5" />
                                    {__('Disconnect')}
                                </Button>
                            </div>
                        )}
                    </div>
                </ModuleHeader>

                {/* Server Offline Alert Banner */}
                {isServiceUnavailable && (
                    <Card className="border-rose-400/60 bg-rose-500/10 dark:bg-rose-950/20 backdrop-blur-sm shadow-sm">
                        <CardContent className="flex items-start gap-3.5 p-4">
                            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-rose-800 dark:text-rose-300">{__('WhatsApp Server Offline')}</h3>
                                <p className="text-sm text-rose-700 dark:text-rose-400/90 mt-1">
                                    {__('The WhatsApp API service at')} <code className="font-mono text-xs font-semibold px-1 py-0.5 bg-rose-100 dark:bg-rose-900/50 rounded">{whatsapp_api_url}</code> {__('is currently unreachable. Please make sure the Node.js service is running.')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Enhanced Shadcn Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Socket State */}
                    <Card className="p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {__('Socket State')}
                            </span>
                            <div className={`p-2 rounded-xl ${
                                isConnected
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : isConnecting || isQrReady
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                                <Activity className="h-4 w-4" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${
                                    isConnected
                                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                                        : isConnecting || isQrReady
                                        ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-ping'
                                        : 'bg-slate-400'
                                }`} />
                                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                                    {isConnected ? __('Active Session') : isQrReady ? __('Waiting Scan') : isConnecting ? __('Connecting...') : __('No Link')}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                                {isConnected && liveStatusState?.userJid
                                    ? `+${liveStatusState.userJid.split('@')[0]}`
                                    : `${__('Instance')}: ${configForm.data.whatsapp_instance || 'empresa_1'}`}
                            </p>
                        </div>
                    </Card>

                    {/* Card 2: Daily Limit */}
                    <Card className="p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {__('Daily Limit (24h)')}
                            </span>
                            <Badge variant="outline" className={`text-[10px] font-semibold font-mono ${
                                quotaPercentage >= 90
                                    ? 'border-rose-300 text-rose-600 bg-rose-50 dark:bg-rose-950/30'
                                    : 'border-blue-300 text-blue-600 bg-blue-50 dark:bg-blue-950/30'
                            }`}>
                                {quotaPercentage}% {__('used')}
                            </Badge>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                                    {sentTodayCount}
                                </span>
                                <span className="text-xs text-muted-foreground font-medium">
                                    / {dailyLimitCount} {__('messages')}
                                </span>
                            </div>
                            <Progress value={quotaPercentage} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>{__('Remaining:')} {Math.max(0, dailyLimitCount - sentTodayCount)}</span>
                                <span>{dailyLimitCount} {__('max')}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Card 3: Outbound Queue */}
                    <Card className="p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {__('Pending in Queue')}
                            </span>
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                <ListOrdered className="h-4 w-4" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                                    {queueStatsState?.queued ?? queueStatsState?.totalQueued ?? 0}
                                </span>
                                <span className="text-xs text-muted-foreground font-medium">
                                    {__('in queue')}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Shield className="h-3 w-3 text-indigo-500" />
                                {__('Anti-Ban Jitter: 20-40s')}
                            </p>
                        </div>
                    </Card>

                    {/* Card 4: Anti-Ban Schedule */}
                    <Card className="p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {__('Anti-Ban Schedule')}
                            </span>
                            <div className={`p-2 rounded-xl ${
                                isWithinWorkingHours
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}>
                                <Clock className="h-4 w-4" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-xs font-semibold ${
                                    isWithinWorkingHours
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border-emerald-300'
                                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 border-amber-300'
                                }`}>
                                    {isWithinWorkingHours ? __('Active Hours') : __('Night Pause')}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">
                                {antiBanForm.data.workingHoursStart || '08:00'} - {antiBanForm.data.workingHoursEnd || '20:00'}
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Main Tabbed Interface */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto p-1.5 bg-slate-100/80 dark:bg-slate-900/80 rounded-xl gap-1">
                        <TabsTrigger value="connection" className="py-2.5 gap-2 text-xs md:text-sm font-medium rounded-lg">
                            <QrCode className="h-4 w-4" />
                            {__('Connection & QR')}
                        </TabsTrigger>
                        <TabsTrigger value="antiban" className="py-2.5 gap-2 text-xs md:text-sm font-medium rounded-lg">
                            <Shield className="h-4 w-4" />
                            {__('Anti-Ban Policies')}
                        </TabsTrigger>
                        <TabsTrigger value="dispatcher" className="py-2.5 gap-2 text-xs md:text-sm font-medium rounded-lg">
                            <Send className="h-4 w-4" />
                            {__('Test & Spintax')}
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="py-2.5 gap-2 text-xs md:text-sm font-medium rounded-lg">
                            <Settings2 className="h-4 w-4" />
                            {__('Server & Webhook')}
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: CONNECTION & QR CODE */}
                    <TabsContent value="connection" className="space-y-6">
                        <div className="grid md:grid-cols-12 gap-6">
                            {/* Visual QR / Connected Device Card */}
                            <div className="md:col-span-7">
                                <Card className="shadow-sm h-full flex flex-col justify-between">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Radio className="h-5 w-5 text-emerald-600" />
                                            {__('WhatsApp Device Linking')}
                                        </CardTitle>
                                        <CardDescription>
                                            {__('Scan QR Code with your mobile phone or inspect active session details.')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center justify-center min-h-[320px] text-center p-6">
                                        {!whatsapp_active ? (
                                            <div className="space-y-3 max-w-sm">
                                                <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <AlertTriangle className="h-7 w-7" />
                                                </div>
                                                <h3 className="font-semibold text-slate-700 dark:text-slate-200">{__('Integration Inactive')}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {__('You must check the "Enable WhatsApp Integration" switch and save configurations to start.')}
                                                </p>
                                                <Button size="sm" onClick={() => setActiveTab('settings')} variant="outline" className="gap-1.5 text-xs">
                                                    {__('Go to Server Settings')} <ArrowRight className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        ) : isConnected ? (
                                            /* CONNECTED VIEW */
                                            <div className="space-y-6 w-full max-w-md py-4">
                                                <div className="mx-auto w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 shadow-inner">
                                                    <CheckCircle2 className="h-10 w-10" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{__('WhatsApp Connected')}</h3>
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                        {__('Active Multi-Session on Baileys Engine')}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 p-4 border rounded-xl bg-slate-50/70 dark:bg-slate-900/40 text-left text-xs">
                                                    <div className="space-y-1">
                                                        <span className="text-muted-foreground block">{__('Account Name')}</span>
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                            {liveStatusState.user?.name || __('WhatsApp Account')}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-muted-foreground block">{__('Phone JID')}</span>
                                                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                                            {(liveStatusState.userJid || liveStatusState.user?.id || '')?.split('@')[0]}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2 border-t pt-2 mt-1 flex justify-between">
                                                        <span className="text-muted-foreground">{__('Last Sync / Connection')}</span>
                                                        <span className="font-mono text-slate-700 dark:text-slate-300">
                                                            {liveStatusState.lastSeen ? new Date(liveStatusState.lastSeen).toLocaleTimeString() : __('Active')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : isQrReady && (liveStatusState?.qrCode || liveStatusState?.qrDataUrl) ? (
                                            /* QR CODE SCAN VIEW */
                                            <div className="space-y-4 py-2">
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                                                        {__('Scan QR Code to Link Account')}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                                        {__('Open WhatsApp on your phone, go to Linked Devices > Link a Device, and point your camera.')}
                                                    </p>
                                                </div>

                                                <div className="relative mx-auto w-64 h-64 border-4 border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 bg-white shadow-md flex items-center justify-center">
                                                    <img
                                                        src={liveStatusState.qrDataUrl || liveStatusState.qrCode || ''}
                                                        alt="WhatsApp QR Code"
                                                        className="w-full h-full object-contain select-none"
                                                    />
                                                    {isPolling && (
                                                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg animate-pulse" title={__('Checking scan status...')}>
                                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                                                    <span>{__('Waiting for phone scan... (Auto-refreshes)')}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            /* DISCONNECTED STATE */
                                            <div className="space-y-4 max-w-sm">
                                                <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                    <QrCode className="h-8 w-8" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">{__('Engine Disconnected')}</h3>
                                                    <p className="text-xs text-muted-foreground">
                                                        {__('Click Initiate Connection to launch the multi-session instance and generate a new linking QR code.')}
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={handleConnect}
                                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                                                >
                                                    <Power className="h-4 w-4" />
                                                    {__('Initiate Connection')}
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="border-t bg-slate-50/50 dark:bg-slate-900/10 px-6 py-3 flex justify-between items-center text-xs text-muted-foreground">
                                        <span>{__('Multi-Device Baileys Socket Protocol')}</span>
                                        <span>{isPolling ? '● ' + __('Live Polling Active') : '○ ' + __('Idle')}</span>
                                    </CardFooter>
                                </Card>
                            </div>

                            {/* Quick Instructions & Best Practices Card */}
                            <div className="md:col-span-5 space-y-6">
                                <Card className="shadow-sm border-t-4 border-t-blue-500 h-full flex flex-col justify-between">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <HelpCircle className="h-5 w-5 text-blue-600" />
                                            {__('Connection Checklist')}
                                        </CardTitle>
                                        <CardDescription>{__('Follow these rules for seamless linking.')}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-xs">
                                        <div className="space-y-3">
                                            <div className="flex gap-3 items-start p-3 border rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                                                <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">{__('Prepare Official WhatsApp')}</h4>
                                                    <p className="text-muted-foreground mt-0.5">{__('Ensure you are using the official WhatsApp or WhatsApp Business application with stable internet.')}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 items-start p-3 border rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                                                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">{__('Point Camera at QR')}</h4>
                                                    <p className="text-muted-foreground mt-0.5">{__('Go to Linked Devices > Link a Device and scan the QR code before the 30-second expiry timeout.')}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 items-start p-3 border rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                                                <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">{__('Session Persists Automatically')}</h4>
                                                    <p className="text-muted-foreground mt-0.5">{__('Once linked, auth credentials persist in local storage. Disconnecting from your phone clears the link.')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t bg-slate-50/50 dark:bg-slate-900/10 px-6 py-3 flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground">{__('Need technical assistance?')}</span>
                                        <a href="/docs" target="_blank" className="text-emerald-600 hover:underline flex items-center gap-1 font-medium">
                                            {__('API Docs')} <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB 2: ANTI-BAN POLICIES & WORKING HOURS */}
                    <TabsContent value="antiban" className="space-y-6">
                        <div className="grid md:grid-cols-12 gap-6">
                            <div className="md:col-span-8">
                                <Card className="shadow-sm border-t-4 border-t-amber-500">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-amber-600" />
                                            {__('Anti-Ban Protection & Messaging Policies')}
                                        </CardTitle>
                                        <CardDescription>
                                            {__('Adjust safety throttle limits, warm-up pacing, and nocturnal silence to prevent Meta phone bans.')}
                                        </CardDescription>
                                    </CardHeader>
                                    <form onSubmit={handleSaveAntiBan}>
                                        <CardContent className="space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Warmup Mode Toggle */}
                                                <div className="p-4 border rounded-xl bg-slate-50/70 dark:bg-slate-900/40 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="font-semibold text-sm flex items-center gap-1.5">
                                                            <Flame className="h-4 w-4 text-amber-500" />
                                                            {__('Warm-Up Mode')}
                                                        </Label>
                                                        <Switch
                                                            checked={antiBanForm.data.warmupMode}
                                                            onCheckedChange={(c) => antiBanForm.setData('warmupMode', c)}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {__('Automatically throttles messages with dynamic intervals (20-40s) for newly connected phone lines.')}
                                                    </p>
                                                </div>

                                                {/* Daily Message Limit Input */}
                                                <div className="p-4 border rounded-xl bg-slate-50/70 dark:bg-slate-900/40 space-y-2">
                                                    <Label htmlFor="dailyLimit" className="font-semibold text-sm block">
                                                        {__('Daily Message Limit')}
                                                    </Label>
                                                    <Input
                                                        id="dailyLimit"
                                                        type="number"
                                                        min="10"
                                                        max="20000"
                                                        value={antiBanForm.data.dailyLimit}
                                                        onChange={(e) => antiBanForm.setData('dailyLimit', parseInt(e.target.value) || 100)}
                                                        className="bg-white dark:bg-slate-950 font-mono"
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        {__('Recommended: 30 for week 1, 80 for week 2, 200+ for mature lines.')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Working Hours Timeframe */}
                                            <div className="p-4 border rounded-xl bg-slate-50/70 dark:bg-slate-900/40 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="font-semibold text-sm flex items-center gap-1.5">
                                                            <Clock className="h-4 w-4 text-blue-500" />
                                                            {__('Working Hours / Nocturnal Silence')}
                                                        </Label>
                                                        <p className="text-xs text-muted-foreground">
                                                            {__('Retains outbound messages queued outside safe daytime hours and dispatches next morning.')}
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={antiBanForm.data.workingHoursEnabled}
                                                        onCheckedChange={(c) => antiBanForm.setData('workingHoursEnabled', c)}
                                                    />
                                                </div>

                                                {antiBanForm.data.workingHoursEnabled && (
                                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">{__('Allowed Start Time')}</Label>
                                                            <Input
                                                                type="time"
                                                                value={antiBanForm.data.workingHoursStart}
                                                                onChange={(e) => antiBanForm.setData('workingHoursStart', e.target.value)}
                                                                className="bg-white dark:bg-slate-950 mt-1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">{__('Allowed End Time')}</Label>
                                                            <Input
                                                                type="time"
                                                                value={antiBanForm.data.workingHoursEnd}
                                                                onChange={(e) => antiBanForm.setData('workingHoursEnd', e.target.value)}
                                                                className="bg-white dark:bg-slate-950 mt-1"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Dedicated Proxy URL */}
                                            <div className="p-4 border rounded-xl bg-slate-50/70 dark:bg-slate-900/40 space-y-2">
                                                <Label htmlFor="proxyUrl" className="font-semibold text-sm flex items-center gap-1.5">
                                                    <Globe className="h-4 w-4 text-slate-500" />
                                                    {__('Dedicated HTTP/SOCKS5 Proxy (Optional)')}
                                                </Label>
                                                <Input
                                                    id="proxyUrl"
                                                    placeholder="http://user:password@proxy-ip:port"
                                                    value={antiBanForm.data.proxyUrl}
                                                    onChange={(e) => antiBanForm.setData('proxyUrl', e.target.value)}
                                                    className="bg-white dark:bg-slate-950 font-mono text-xs"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    {__('Route this specific WhatsApp instance through a static residential proxy IP.')}
                                                </p>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="border-t bg-slate-50/50 dark:bg-slate-900/10 px-6 py-4 flex justify-end">
                                            <Button type="submit" disabled={antiBanForm.processing} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow">
                                                <Shield className="h-4 w-4" />
                                                {__('Save Anti-Ban Policies')}
                                            </Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                            </div>

                            {/* Anti-Ban Guidelines & Recommendations */}
                            <div className="md:col-span-4 space-y-6">
                                <Card className="shadow-sm border-t-4 border-t-amber-500">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Flame className="h-4 w-4 text-amber-500" />
                                            {__('Recommended Warm-Up Schedule')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-xs">
                                        <div className="p-2.5 rounded-lg border bg-amber-50/40 dark:bg-amber-950/20">
                                            <span className="font-bold text-amber-800 dark:text-amber-300 block">{__('Week 1 (New Line)')}</span>
                                            <span className="text-muted-foreground">{__('20 to 30 messages/day. Keep 20-40s jitter delays.')}</span>
                                        </div>
                                        <div className="p-2.5 rounded-lg border bg-blue-50/40 dark:bg-blue-950/20">
                                            <span className="font-bold text-blue-800 dark:text-blue-300 block">{__('Week 2 (Progressive)')}</span>
                                            <span className="text-muted-foreground">{__('50 to 80 messages/day. Always use Spintax variations.')}</span>
                                        </div>
                                        <div className="p-2.5 rounded-lg border bg-emerald-50/40 dark:bg-emerald-950/20">
                                            <span className="font-bold text-emerald-800 dark:text-emerald-300 block">{__('Week 3+ (Mature)')}</span>
                                            <span className="text-muted-foreground">{__('100 to 300+ messages/day. Maintain opt-out compliance.')}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB 3: TEST DISPATCHER & SPINTAX SANDBOX */}
                    <TabsContent value="dispatcher" className="space-y-6">
                        <Card className="shadow-sm border-t-4 border-t-emerald-600">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Send className="h-5 w-5 text-emerald-600" />
                                    {__('Message Sandbox & Spintax Permutations')}
                                </CardTitle>
                                <CardDescription>
                                    {__('Validate numbers in Meta servers, preview dynamic Spintax variations, and execute test transmissions.')}
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSendMessage}>
                                <CardContent className="space-y-5">
                                    {/* Recipient Phone with Number Verifier */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-semibold">{__('Recipient Phone Number')}</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCheckNumber}
                                                disabled={checkingNumber || !testMessage.phoneNumber}
                                                className="h-8 text-xs gap-1.5 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50"
                                            >
                                                <UserCheck className="h-3.5 w-3.5" />
                                                {checkingNumber ? __('Verifying on WhatsApp...') : __('Check Number in WhatsApp')}
                                            </Button>
                                        </div>

                                        <PhoneInputGroup
                                            paises={paises}
                                            selectedPaisId={testMessage.paisId}
                                            phoneValue={testMessage.phoneNumber}
                                            onPaisChange={(paisId) => setTestMessage(prev => ({ ...prev, paisId: String(paisId) }))}
                                            onPhoneChange={(phone) => {
                                                setTestMessage(prev => ({ ...prev, phoneNumber: phone }));
                                                setNumberCheckResult(null);
                                            }}
                                            placeholder={__('4121234567')}
                                        />

                                        {numberCheckResult && (
                                            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                                                numberCheckResult.exists
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                                                    : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300'
                                            }`}>
                                                {numberCheckResult.exists ? <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" /> : <XCircle className="h-4 w-4 text-rose-600 shrink-0" />}
                                                <span>
                                                    {numberCheckResult.exists
                                                        ? __('Registered WhatsApp user detected. Safe to dispatch.')
                                                        : __('Warning: Number NOT found on WhatsApp. Meta will penalize sending unsolicited messages here.')}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Spintax Message Template Textarea */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="test_msg" className="text-sm font-semibold flex items-center gap-1.5">
                                                <Sparkles className="h-4 w-4 text-amber-500" />
                                                {__('Message Template (Spintax & Variables Supported)')}
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handlePreviewSpintax}
                                                disabled={previewingSpintax || !testMessage.message}
                                                className="h-8 text-xs gap-1.5 text-amber-600 hover:text-amber-700 dark:text-amber-400"
                                            >
                                                <Sparkles className="h-3.5 w-3.5" />
                                                {previewingSpintax ? __('Generating...') : __('Preview Spintax Variations')}
                                            </Button>
                                        </div>

                                        <textarea
                                            id="test_msg"
                                            rows={3}
                                            value={testMessage.message}
                                            onChange={(e) => setTestMessage(prev => ({ ...prev, message: e.target.value }))}
                                            className="w-full flex min-h-[90px] rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                        />
                                        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                                            <span>{__('Spintax Syntax:')} <code className="text-emerald-600 font-bold">{'{Hola|Buen día|Saludos}'}</code></span>
                                            <span>• {__('Variables:')} <code className="text-blue-600 font-bold">{'{{nombre}}'}</code>, <code className="text-blue-600 font-bold">{'{{empresa}}'}</code>, <code className="text-blue-600 font-bold">{'{{random}}'}</code></span>
                                        </div>

                                        {/* Spintax Interactive Variations Output */}
                                        {spintaxPreviews.length > 0 && (
                                            <div className="p-4 border rounded-xl bg-amber-50/40 dark:bg-amber-950/20 space-y-2.5 mt-3">
                                                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block flex items-center gap-1.5">
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                    {__('Spintax Permutation Samples:')}
                                                </span>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {spintaxPreviews.map((variation, idx) => (
                                                        <div key={idx} className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border text-xs text-slate-800 dark:text-slate-200 shadow-sm">
                                                            <span className="text-amber-600 font-bold mr-1.5">#{idx + 1}:</span>
                                                            {variation}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t bg-slate-50/50 dark:bg-slate-900/10 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-2.5">
                                        <Switch
                                            id="use_sync"
                                            checked={testMessage.useSync}
                                            onCheckedChange={(checked) => setTestMessage(prev => ({ ...prev, useSync: checked }))}
                                        />
                                        <Label htmlFor="use_sync" className="text-xs text-muted-foreground cursor-pointer">
                                            {__('Immediate Sync Dispatch (Bypass Queue)')}
                                        </Label>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={sendingMsg || !isConnected}
                                        className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                                    >
                                        <Send className={`h-4 w-4 ${sendingMsg ? 'animate-pulse' : ''}`} />
                                        {__('Send Protected Message')}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    {/* TAB 4: SERVER SETTINGS & WEBHOOKS */}
                    <TabsContent value="settings" className="space-y-6">
                        <div className="grid md:grid-cols-12 gap-6">
                            {/* Server credentials & tokens */}
                            <div className="md:col-span-7">
                                <Card className="shadow-sm border-t-4 border-t-emerald-600">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Server className="h-5 w-5 text-emerald-600" />
                                            {__('Server & Multi-Instance Configuration')}
                                        </CardTitle>
                                        <CardDescription>
                                            {__('Endpoint routing and company authentication credentials.')}
                                        </CardDescription>
                                    </CardHeader>
                                    <form onSubmit={handleSaveConfig}>
                                        <CardContent className="space-y-4">
                                            {/* Enable Switch */}
                                            <div className="flex items-center justify-between p-3.5 border rounded-xl bg-slate-50/70 dark:bg-slate-900/40">
                                                <div className="space-y-0.5">
                                                    <Label className="text-sm font-semibold">{__('Enable WhatsApp Integration')}</Label>
                                                    <p className="text-xs text-muted-foreground">{__('Enable automated template sending.')}</p>
                                                </div>
                                                <Switch
                                                    checked={configForm.data.whatsapp_active}
                                                    onCheckedChange={(checked) => configForm.setData('whatsapp_active', checked)}
                                                />
                                            </div>

                                            {/* Connection IP / API URL */}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="whatsapp_api_url">{__('Connection IP / API URL')}</Label>
                                                <Input
                                                    id="whatsapp_api_url"
                                                    placeholder="http://localhost:3000"
                                                    value={configForm.data.whatsapp_api_url}
                                                    onChange={(e) => configForm.setData('whatsapp_api_url', e.target.value)}
                                                    className="font-mono text-sm"
                                                />
                                            </div>

                                            {/* Instance Name */}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="whatsapp_instance">{__('WhatsApp Instance Name')}</Label>
                                                <Input
                                                    id="whatsapp_instance"
                                                    placeholder="empresa_1"
                                                    value={configForm.data.whatsapp_instance}
                                                    onChange={(e) => configForm.setData('whatsapp_instance', e.target.value)}
                                                    className="font-mono text-sm"
                                                />
                                            </div>

                                            {/* Company Token */}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="whatsapp_api_key">{__('Company API Token (x-api-key)')}</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="whatsapp_api_key"
                                                        type="text"
                                                        value={configForm.data.whatsapp_api_key}
                                                        onChange={(e) => configForm.setData('whatsapp_api_key', e.target.value)}
                                                        className="font-mono text-sm"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={copyTokenToClipboard}
                                                        disabled={!configForm.data.whatsapp_api_key}
                                                        className="shrink-0"
                                                    >
                                                        {copiedToken ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="border-t bg-slate-50/50 dark:bg-slate-900/10 px-6 py-4 flex flex-col sm:flex-row justify-between gap-3">
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleGenerateToken}
                                                    className="gap-1.5 text-xs text-slate-700 dark:text-slate-200"
                                                >
                                                    <Key className="h-3.5 w-3.5" />
                                                    {__('Generate Token')}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleSyncCompany}
                                                    disabled={!whatsapp_api_key}
                                                    className="gap-1.5 text-xs text-slate-700 hover:text-emerald-700 dark:text-slate-200"
                                                >
                                                    <Database className="h-3.5 w-3.5" />
                                                    {__('Sync Company')}
                                                </Button>
                                            </div>

                                            <Button type="submit" disabled={configForm.processing} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                                                <RefreshCw className={`h-4 w-4 ${configForm.processing ? 'animate-spin' : ''}`} />
                                                {__('Save Settings')}
                                            </Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                            </div>

                            {/* Webhook Endpoint Info Card */}
                            <div className="md:col-span-5 space-y-6">
                                <Card className="shadow-sm border-t-4 border-t-indigo-500">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Terminal className="h-5 w-5 text-indigo-600" />
                                            {__('Inbound Webhook Endpoint')}
                                        </CardTitle>
                                        <CardDescription>
                                            {__('Receives opt-out unsubscriptions and incoming user replies.')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-xs">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">{__('Webhook URL (Auto-Registered)')}</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    readOnly
                                                    value={webhookUrl}
                                                    className="font-mono text-xs bg-slate-50 dark:bg-slate-900 select-all"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={copyWebhookToClipboard}
                                                    className="shrink-0"
                                                >
                                                    {copiedWebhook ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="p-3.5 border rounded-xl bg-slate-50/70 dark:bg-slate-900/40 space-y-2">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">{__('Listening Events:')}</span>
                                            <div className="space-y-1.5 text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Badge variant="outline" className="font-mono text-[10px] bg-white dark:bg-slate-950">contact.opt_out</Badge>
                                                    <span>{__('Handles STOP / BAJA unsubscriptions.')}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Badge variant="outline" className="font-mono text-[10px] bg-white dark:bg-slate-950">message.received</Badge>
                                                    <span>{__('Handles incoming user messages & interactive bot replies.')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}