import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ExternalLink,
    Globe2,
    PauseCircle,
    PlayCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface PageProps {
    is_active: boolean;
    registration_url: string;
}

export default function PublicRegistrationMonitoring({
    is_active,
    registration_url,
}: PageProps) {
    const [processing, setProcessing] = useState(false);

    const updateStatus = (nextStatus: boolean) => {
        setProcessing(true);
        router.put(
            '/admin/monitoring/registration',
            { is_active: nextStatus },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Monitoreo', href: '#' },
        { title: 'Registro público', href: '/admin/monitoring/registration' },
    ];

    return (
        <>
            <Head title="Disponibilidad del registro público" />
            <div className="space-y-6">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                <div>
                    <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
                        <Globe2 className="size-8 text-indigo-600" />
                        Registro público de pastores
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Administra la disponibilidad del formulario de registro
                        y actualización ministerial.
                    </p>
                </div>

                <Card className="max-w-3xl shadow-sm">
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <CardTitle>Estado del servicio</CardTitle>
                                <CardDescription className="mt-1">
                                    El cambio se aplica inmediatamente a la ruta
                                    pública y a sus operaciones de registro.
                                </CardDescription>
                            </div>
                            <Badge
                                variant={is_active ? 'default' : 'secondary'}
                                className="gap-1.5"
                            >
                                {is_active ? (
                                    <CheckCircle2 className="size-3.5" />
                                ) : (
                                    <PauseCircle className="size-3.5" />
                                )}
                                {is_active ? 'Activo' : 'Cerrado'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between gap-4 rounded-2xl border p-4">
                            <div className="space-y-1">
                                <p className="font-semibold">
                                    {is_active
                                        ? 'El formulario está disponible'
                                        : 'El formulario está cerrado'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {is_active
                                        ? 'Las personas pueden completar y enviar el registro o la actualización.'
                                        : 'Las personas verán el aviso institucional de período concluido.'}
                                </p>
                            </div>
                            <Switch
                                checked={is_active}
                                disabled={processing}
                                onCheckedChange={updateStatus}
                                aria-label={
                                    is_active
                                        ? 'Cerrar el registro público'
                                        : 'Activar el registro público'
                                }
                            />
                        </div>

                        <div className="flex flex-col justify-between gap-3 rounded-2xl bg-muted/50 p-4 sm:flex-row sm:items-center">
                            <div>
                                <p className="text-sm font-semibold">
                                    Dirección pública
                                </p>
                                <a
                                    href={registration_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1 inline-flex items-center gap-1.5 text-sm break-all text-primary hover:underline"
                                >
                                    {registration_url}
                                    <ExternalLink className="size-3.5 shrink-0" />
                                </a>
                            </div>
                            <Button variant="outline" asChild>
                                <a
                                    href={registration_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Abrir página
                                </a>
                            </Button>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl border border-amber-300/70 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100">
                            {is_active ? (
                                <PauseCircle className="mt-0.5 size-5 shrink-0" />
                            ) : (
                                <PlayCircle className="mt-0.5 size-5 shrink-0" />
                            )}
                            <p>
                                {is_active
                                    ? 'Al cerrar el registro, el formulario dejará de aceptar envíos y se mostrará el aviso de período concluido.'
                                    : 'Al activar el registro, el formulario público volverá a estar disponible para recibir información.'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
