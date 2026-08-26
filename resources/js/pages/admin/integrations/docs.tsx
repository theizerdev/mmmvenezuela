import { Head, Link } from '@inertiajs/react';
import {
    BookOpen, Code2, Copy, Check, Shield, Flame, Clock, Sparkles, Terminal,
    FileText, ArrowLeft, ExternalLink, Zap, Layers, RefreshCw, Send, CheckCircle2,
    Database, Server, HelpCircle, CheckCircle, AlertCircle, ChevronRight, Hash
} from 'lucide-react';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslate } from '@/hooks/use-translate';

interface PageProps {
    empresa_id: number;
    empresa_nombre: string;
    whatsapp_api_url: string;
    whatsapp_instance: string;
    whatsapp_api_key: string;
}

export default function WhatsAppDocs({
    empresa_id,
    empresa_nombre,
    whatsapp_api_url,
    whatsapp_instance,
    whatsapp_api_key
}: PageProps) {
    const { __ } = useTranslate();
    const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState('intro');

    // Interactive Spintax Simulator State
    const [simTemplate, setSimTemplate] = useState('{Hola|Buen día|Qué tal} {{nombre}}, {te confirmamos que|te notificamos que} tu solicitud #{{codigo}} está lista.');
    const [simVariations, setSimVariations] = useState<string[]>([]);
    const [simulating, setSimulating] = useState(false);

    const handleCopy = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedIndex(id);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleSimulateSpintax = () => {
        setSimulating(true);
        const variations: string[] = [];
        const regex = /\{([^{}]+)\}/g;

        for (let i = 0; i < 4; i++) {
            let res = simTemplate;
            res = res.replace(regex, (_, choices) => {
                const parts = choices.split('|');
                return parts[Math.floor(Math.random() * parts.length)];
            });
            res = res.replace(/\{\{nombre\}\}/g, ['Carlos Mendoza', 'María Gómez', 'Pastor David', 'Ana Rodríguez'][i % 4]);
            res = res.replace(/\{\{codigo\}\}/g, `DOC-${Math.floor(1000 + Math.random() * 9000)}`);
            res = res.replace(/\{\{random\}\}/g, String(Math.floor(1000 + Math.random() * 9000)));
            variations.push(res);
        }

        setTimeout(() => {
            setSimVariations(variations);
            setSimulating(false);
        }, 150);
    };

    const breadcrumbs = [
        { title: __('Dashboard'), href: '/admin/dashboard' },
        { title: __('Settings'), href: '#' },
        { title: __('Integrations'), href: '/admin/integrations' },
        { title: __('WhatsApp'), href: '/admin/integrations/whatsapp' },
        { title: __('Documentation'), href: '/docs' }
    ];

    const sections = [
        { id: 'intro', title: __('1. Overview & Requirements'), icon: BookOpen },
        { id: 'env', title: __('2. Environment Configuration'), icon: Server },
        { id: 'service', title: __('3. WhatsAppService Class'), icon: Code2 },
        { id: 'qr', title: __('4. QR Linking & Polling'), icon: Zap },
        { id: 'spintax', title: __('5. Spintax & Dynamic Data'), icon: Sparkles },
        { id: 'jobs', title: __('6. Asynchronous Queue Jobs'), icon: Layers },
        { id: 'webhooks', title: __('7. Webhooks & Opt-Out'), icon: Terminal },
        { id: 'antiban', title: __('8. Anti-Ban Best Practices'), icon: Shield },
        { id: 'swagger', title: __('9. Interactive Swagger / OpenAPI'), icon: ExternalLink },
    ];

    return (
        <>
            <Head title={__('WhatsApp API Documentation')} />
            <div className="space-y-6 w-full pb-16">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 md:p-8 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 backdrop-blur-md">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                                            {__('WhatsApp API Integration Manual')}
                                        </h1>
                                        <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-mono text-xs">
                                            v2.0 Baileys
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-300">
                                        {__('Complete technical guide for safe Anti-Ban messaging, Spintax, Queues, and Webhooks in Laravel.')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link href="/admin/integrations/whatsapp">
                                <Button size="sm" variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-white text-xs gap-1.5 backdrop-blur-md">
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    {__('Back to WhatsApp Settings')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Content Layout (Sidebar + Sections) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Navigation Sidebar */}
                    <div className="md:col-span-4 lg:col-span-3 space-y-4">
                        <div className="sticky top-20 space-y-2">
                            <Card className="shadow-sm border">
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        {__('Table of Contents')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 space-y-1">
                                    {sections.map((sec) => {
                                        const Icon = sec.icon;
                                        const isActive = activeSection === sec.id;
                                        return (
                                            <a
                                                key={sec.id}
                                                href={`#${sec.id}`}
                                                onClick={() => setActiveSection(sec.id)}
                                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                                    isActive
                                                        ? 'bg-emerald-600 text-white shadow-sm'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                <Icon className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{sec.title}</span>
                                            </a>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* Quick Credentials Info Box */}
                            <Card className="shadow-sm border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
                                <CardContent className="p-4 space-y-2 text-xs">
                                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block">{__('Your Company Credentials:')}</span>
                                    <div className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                                        <div><strong className="text-muted-foreground font-sans">{__('Instance:')}</strong> {whatsapp_instance}</div>
                                        <div><strong className="text-muted-foreground font-sans">{__('Base URL:')}</strong> {whatsapp_api_url}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="md:col-span-8 lg:col-span-9 space-y-8">
                        {/* 1. OVERVIEW & REQUIREMENTS */}
                        <section id="intro" className="scroll-mt-24 space-y-4">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <BookOpen className="h-6 w-6 text-emerald-600" />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{__('1. Overview & Architecture')}</h2>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                {__('The WhatsApp API module provides a Multi-Instance, multi-tenant integration with WhatsApp Baileys socket engine. It features native protection against Meta phone bans, automated Spintax variations, pre-flight phone number validation, rate-throttling with randomized Jitter, nocturnal pause, and inbound webhook processing for Opt-Out (STOP/BAJA).')}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900/50 space-y-1">
                                    <Shield className="h-5 w-5 text-emerald-600" />
                                    <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">{__('Anti-Ban Protection')}</h4>
                                    <p className="text-[11px] text-muted-foreground">{__('Human presence emulation, typing simulation, and warm-up schedule.')}</p>
                                </div>
                                <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900/50 space-y-1">
                                    <Sparkles className="h-5 w-5 text-amber-500" />
                                    <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">{__('Spintax Permutations')}</h4>
                                    <p className="text-[11px] text-muted-foreground">{__('Prevents message fingerprint detection by rotating phrase options.')}</p>
                                </div>
                                <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900/50 space-y-1">
                                    <Terminal className="h-5 w-5 text-indigo-500" />
                                    <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">{__('Webhooks & Opt-Out')}</h4>
                                    <p className="text-[11px] text-muted-foreground">{__('Automatic blacklist management when recipients reply STOP or BAJA.')}</p>
                                </div>
                            </div>
                        </section>

                        {/* 2. ENVIRONMENT CONFIGURATION */}
                        <section id="env" className="scroll-mt-24 space-y-4">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <Server className="h-6 w-6 text-emerald-600" />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{__('2. Environment Configuration (.env)')}</h2>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                {__('Configure connection parameters in your')} <code className="font-mono text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">.env</code> {__('and')} <code className="font-mono text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">config/whatsapp.php</code>:
                            </p>

                            <div className="relative rounded-xl bg-slate-950 text-slate-100 p-4 font-mono text-xs overflow-x-auto shadow-inner">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCopy(`WHATSAPP_API_URL=${whatsapp_api_url}\nWHATSAPP_API_KEY=${whatsapp_api_key}\nWHATSAPP_DEFAULT_INSTANCE=${whatsapp_instance}\nQUEUE_CONNECTION=database`, 'env')}
                                    className="absolute top-2 right-2 h-7 text-xs gap-1 text-slate-400 hover:text-white"
                                >
                                    {copiedIndex === 'env' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                    {copiedIndex === 'env' ? __('Copied') : __('Copy')}
                                </Button>
                                <pre className="text-emerald-400 font-bold mb-1"># WhatsApp Engine Config</pre>
                                <code>
                                    WHATSAPP_API_URL={whatsapp_api_url}<br />
                                    WHATSAPP_API_KEY={whatsapp_api_key}<br />
                                    WHATSAPP_DEFAULT_INSTANCE={whatsapp_instance}<br />
                                    QUEUE_CONNECTION=database
                                </code>
                            </div>
                        </section>

                        {/* 3. WHATSAPP SERVICE CLASS */}
                        <section id="service" className="scroll-mt-24 space-y-4">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <Code2 className="h-6 w-6 text-emerald-600" />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{__('3. WhatsAppService in Laravel')}</h2>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                {__('The service is centrally located at')} <code className="font-mono text-xs font-semibold text-emerald-600">App\\Services\\WhatsAppService</code>. {__('It can be instantiated for the default company or any specific tenant:')}
                            </p>

                            <div className="relative rounded-xl bg-slate-950 text-slate-100 p-4 font-mono text-xs overflow-x-auto shadow-inner">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCopy(`use App\\Services\\WhatsAppService;\n\n// 1. Usar empresa del usuario autenticado:\n$whatsapp = new WhatsAppService();\n\n// 2. O para una empresa específica:\n$whatsapp = new WhatsAppService($empresa);\n\n// 3. Validar si el número existe en WhatsApp:\n$check = $whatsapp->checkNumber('584121234567');\nif ($check['exists']) {\n    // Enviar mensaje con Spintax y variables\n    $whatsapp->sendText(\n        '584121234567',\n        '{Hola|Buen día} {{nombre}}, tu código es {{codigo}}',\n        ['nombre' => 'Carlos', 'codigo' => '9942'],\n        false // sync = false para encolado seguro\n    );\n}`, 'service_code')}
                                    className="absolute top-2 right-2 h-7 text-xs gap-1 text-slate-400 hover:text-white"
                                >
                                    {copiedIndex === 'service_code' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                    {copiedIndex === 'service_code' ? __('Copied') : __('Copy')}
                                </Button>
                                <pre className="text-blue-400 font-bold mb-2">// Código de Ejemplo en Laravel Controller / Service</pre>
                                <code>
                                    <span className="text-purple-400">use</span> App\Services\WhatsAppService;<br /><br />
                                    <span className="text-slate-500">// 1. Instanciar servicio</span><br />
                                    $whatsapp = <span className="text-purple-400">new</span> WhatsAppService();<br /><br />
                                    <span className="text-slate-500">// 2. Validar existencia del número (Meta check)</span><br />
                                    $check = $whatsapp-&gt;<span className="text-yellow-400">checkNumber</span>(<span className="text-emerald-300">'584121234567'</span>);<br /><br />
                                    <span className="text-purple-400">if</span> ($check[<span className="text-emerald-300">'exists'</span>]) &#123;<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;$whatsapp-&gt;<span className="text-yellow-400">sendText</span>(<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-300">'584121234567'</span>,<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-300">'{'{Hola|Buen día}'} &#123;&#123;nombre&#125;&#125;, tu código es &#123;&#123;codigo&#125;&#125;'</span>,<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[<span className="text-emerald-300">'nombre'</span> =&gt; <span className="text-emerald-300">'Carlos'</span>, <span className="text-emerald-300">'codigo'</span> =&gt; <span className="text-emerald-300">'9942'</span>],<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">false</span> <span className="text-slate-500">// sync = false para cola segura</span><br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;);<br />
                                    &#125;
                                </code>
                            </div>
                        </section>

                        {/* 4. SPINTAX SIMULATOR & SYNTAX */}
                        <section id="spintax" className="scroll-mt-24 space-y-4">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <Sparkles className="h-6 w-6 text-amber-500" />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{__('4. Spintax Permutations & Interactive Tester')}</h2>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                {__('Spintax allows you to define alternative words in curly braces')} <code className="font-mono font-bold text-emerald-600">{'{opción1|opción2|opción3}'}</code>. {__('Every outbound message will choose a randomized path, creating unique message hashes that avoid Meta spam filters.')}
                            </p>

                            {/* Interactive Spintax Sandbox */}
                            <Card className="border-2 border-amber-400/40 bg-amber-50/20 dark:bg-amber-950/10 shadow-sm">
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-amber-500" />
                                        {__('Live Spintax Simulator')}
                                    </CardTitle>
                                    <CardDescription>{__('Type your template and generate instant variations.')}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <Input
                                        value={simTemplate}
                                        onChange={(e) => setSimTemplate(e.target.value)}
                                        className="font-mono text-xs bg-white dark:bg-slate-950"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleSimulateSpintax}
                                        disabled={simulating}
                                        className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" />
                                        {__('Generate Random Variations')}
                                    </Button>

                                    {simVariations.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                                            {simVariations.map((v, i) => (
                                                <div key={i} className="p-2.5 bg-white dark:bg-slate-900 border rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 shadow-sm">
                                                    <span className="text-amber-600 font-bold mr-1">#{i + 1}:</span> {v}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>

                        {/* 5. ASYNCHRONOUS QUEUE JOBS */}
                        <section id="jobs" className="scroll-mt-24 space-y-4">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <Layers className="h-6 w-6 text-indigo-500" />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{__('5. Mass Campaigns with Laravel Jobs')}</h2>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                {__('Never send mass notifications with synchronous loops. Dispatch')} <code className="font-mono text-xs font-semibold text-indigo-600">SendWhatsAppNotificationJob</code> {__('with spaced delay intervals:')}
                            </p>

                            <div className="relative rounded-xl bg-slate-950 text-slate-100 p-4 font-mono text-xs overflow-x-auto shadow-inner">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCopy(`use App\\Jobs\\SendWhatsAppNotificationJob;\nuse App\\Models\\User;\n\n$users = User::where('whatsapp_opt_out', false)->get();\n\n$template = "{Hola|Buen día} {{nombre}}, le recordamos su cita.";\n\nforeach ($users as $index => $user) {\n    SendWhatsAppNotificationJob::dispatch(\n        $user->telefono,\n        $template,\n        ['nombre' => $user->name]\n    )->delay(now()->addSeconds($index * 15)); // Espaciado seguro\n}`, 'job_code')}
                                    className="absolute top-2 right-2 h-7 text-xs gap-1 text-slate-400 hover:text-white"
                                >
                                    {copiedIndex === 'job_code' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                    {copiedIndex === 'job_code' ? __('Copied') : __('Copy')}
                                </Button>
                                <pre className="text-indigo-400 font-bold mb-2">// Despacho Seguro de Campaña en Laravel</pre>
                                <code>
                                    <span className="text-purple-400">use</span> App\Jobs\SendWhatsAppNotificationJob;<br />
                                    <span className="text-purple-400">use</span> App\Models\User;<br /><br />
                                    <span className="text-slate-500">// Filtrar usuarios que no hayan pedido baja</span><br />
                                    $users = User::where(<span className="text-emerald-300">'whatsapp_opt_out'</span>, <span className="text-amber-400">false</span>)-&gt;get();<br /><br />
                                    $template = <span className="text-emerald-300">'{'{Hola|Buen día}'} &#123;&#123;nombre&#125;&#125;, recordatorio ministerial.'</span>;<br /><br />
                                    <span className="text-purple-400">foreach</span> ($users <span className="text-purple-400">as</span> $index =&gt; $user) &#123;<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;SendWhatsAppNotificationJob::<span className="text-yellow-400">dispatch</span>(<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$user-&gt;telefono,<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$template,<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[<span className="text-emerald-300">'nombre'</span> =&gt; $user-&gt;name]<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;)-&gt;<span className="text-yellow-400">delay</span>(now()-&gt;addSeconds($index * <span className="text-cyan-400">15</span>)); <span className="text-slate-500">// 15s de espacio</span><br />
                                    &#125;
                                </code>
                            </div>
                        </section>

                        {/* 6. WEBHOOKS & OPT-OUT */}
                        <section id="webhooks" className="scroll-mt-24 space-y-4">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <Terminal className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{__('6. Inbound Webhooks & Automated Opt-Out')}</h2>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                {__('When recipients reply STOP, BAJA, or CANCELAR, Meta sends the')} <code className="font-mono text-xs font-semibold text-emerald-600">contact.opt_out</code> {__('event. The system automatically marks')} <code className="font-mono text-xs">whatsapp_opt_out = true</code> {__('on the User model and blacklists the number in the Baileys engine.')}
                            </p>

                            <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/50 space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{__('Registered Webhook Endpoint:')}</span>
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border-emerald-300">POST /webhooks/whatsapp</Badge>
                                </div>
                                <p className="text-muted-foreground">{__('Exempt from CSRF validation in bootstrap/app.php for seamless external delivery.')}</p>
                            </div>
                        </section>

                        {/* 7. ANTI-BAN RULES */}
                        <section id="antiban" className="scroll-mt-24 space-y-4">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <Shield className="h-6 w-6 text-amber-600" />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{__('7. Anti-Ban Golden Rules')}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="p-4 rounded-xl border bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                                    <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                        <CheckCircle className="h-4 w-4" /> {__('Do’s (Safe Actions)')}
                                    </h4>
                                    <ul className="space-y-1.5 text-muted-foreground list-disc list-inside">
                                        <li>{__('Always check numbers with checkNumber() before mass sends.')}</li>
                                        <li>{__('Rotate phrase patterns using Spintax in every message.')}</li>
                                        <li>{__('Respect nocturnal pause hours (08:00 - 20:00).')}</li>
                                        <li>{__('Warm up new phone numbers progressively for 2 weeks.')}</li>
                                    </ul>
                                </div>

                                <div className="p-4 rounded-xl border bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
                                    <h4 className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                                        <AlertCircle className="h-4 w-4" /> {__('Don’ts (Avoid Ban)')}
                                    </h4>
                                    <ul className="space-y-1.5 text-muted-foreground list-disc list-inside">
                                        <li>{__('Never send identical text to more than 5 users in a row.')}</li>
                                        <li>{__('Do not use fresh SIM cards for instant bulk blasts.')}</li>
                                        <li>{__('Never ignore opt-out requests or unsubscriptions.')}</li>
                                        <li>{__('Avoid bypassing queue delays for bulk marketing.')}</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 8. SWAGGER / OPENAPI */}
                        <section id="swagger" className="scroll-mt-24 space-y-4">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <ExternalLink className="h-6 w-6 text-emerald-600" />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{__('8. Swagger UI & OpenAPI Specification')}</h2>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                {__('The WhatsApp Node.js engine provides an interactive OpenAPI 3.0 specification available directly at the API server:')}
                            </p>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <a
                                    href={`${whatsapp_api_url}/docs`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-md transition-all"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    {__('Open Interactive Swagger UI')} ({whatsapp_api_url}/docs)
                                </a>
                                <a
                                    href={`${whatsapp_api_url}/api/docs.json`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs border shadow-sm transition-all"
                                >
                                    <Code2 className="h-4 w-4" />
                                    {__('OpenAPI 3.0 JSON Spec')}
                                </a>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
