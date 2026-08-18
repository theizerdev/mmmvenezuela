import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Edit3, ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ModuleHeader } from '@/components/module-header';
import { Button } from '@/components/ui/button';
import ExtensionFormWizard from './Partials/ExtensionFormWizard';
import type { BreadcrumbItem } from '@/types';
import { useTranslate } from '@/hooks/use-translate';

interface PageProps {
    extension: any;
    pastores: any[];
    estados: any[];
    municipios: any[];
    parroquias: any[];
    tiposLocal: any[];
}

export default function ExtensionEditPage({ extension, pastores = [], estados = [], municipios = [], parroquias = [], tiposLocal = [] }: PageProps) {
    const { __ } = useTranslate();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Extensiones', href: '/admin/extensiones' },
        { title: extension?.nombre || 'Editar', href: `/admin/extensiones/${extension?.id}/edit` },
    ];

    return (
        <>
            <Head title={`${__('Editar Extensión')} - ${extension?.nombre || ''}`} />

            <div className="space-y-6">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                <ModuleHeader
                    icon={<Edit3 className="size-6 text-white" />}
                    title={`${__('Editar Extensión')}: ${extension?.nombre || ''}`}
                    description={__('Modifique la información institucional, ubicación y medios de comunicación.')}
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
                    extension={extension}
                    pastores={pastores}
                    estados={estados}
                    municipios={municipios}
                    parroquias={parroquias}
                    tiposLocal={tiposLocal}
                    isEditing={true}
                />
            </div>
        </>
    );
}
