import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Building2, ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ModuleHeader } from '@/components/module-header';
import { Button } from '@/components/ui/button';
import ExtensionFormWizard from './Partials/ExtensionFormWizard';
import type { BreadcrumbItem } from '@/types';
import { useTranslate } from '@/hooks/use-translate';

interface PageProps {
    pastores: any[];
    estados: any[];
    municipios: any[];
    parroquias: any[];
    tiposLocal: any[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Extensiones', href: '/admin/extensiones' },
    { title: 'Nuevo Registro', href: '/admin/extensiones/create' },
];

export default function ExtensionCreatePage({ pastores = [], estados = [], municipios = [], parroquias = [], tiposLocal = [] }: PageProps) {
    const { __ } = useTranslate();

    return (
        <>
            <Head title={__('Nueva Extensión')} />

            <div className="space-y-6">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                <ModuleHeader
                    icon={<Building2 className="size-6 text-white" />}
                    title={__('Nueva Extensión / Iglesia')}
                    description={__('Asistente de registro institucional, ubicación geolocalizada y medios de comunicación.')}
                    colorClassName="bg-indigo-600"
                >
                    <Link href="/admin/extensiones">
                        <Button variant="outline" className="gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow-sm text-xs sm:text-sm">
                            <ArrowLeft className="size-4" />
                            {__('Volver al Listado')}
                        </Button>
                    </Link>
                </ModuleHeader>

                <ExtensionFormWizard
                    pastores={pastores}
                    estados={estados}
                    municipios={municipios}
                    parroquias={parroquias}
                    tiposLocal={tiposLocal}
                />
            </div>
        </>
    );
}
