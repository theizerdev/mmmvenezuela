import React from 'react';
import { Head } from '@inertiajs/react';
import { useTranslate } from '@/hooks/use-translate';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PastorFormWizard from './Partials/PastorFormWizard';

interface EditProps {
    pastor: any;
    pastoresDisponibles: Array<any>;
    estados: Array<any>;
    municipios: Array<any>;
    parroquias: Array<any>;
}

export default function Edit({
    pastor,
    pastoresDisponibles,
    estados,
    municipios,
    parroquias,
}: EditProps) {
    const { __ } = useTranslate();

    const breadcrumbs = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('Pastors'), href: '/admin/pastores' },
        { title: __('Edit Pastor'), href: `/admin/pastores/${pastor?.id}/edit` },
    ];

    return (
        <>
            <Head title={`${__('Edit Pastor')} - ${pastor?.nombres} ${pastor?.apellidos}`} />
            <div className="space-y-6">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
                <PastorFormWizard
                    pastor={pastor}
                    pastoresDisponibles={pastoresDisponibles}
                    estados={estados}
                    municipios={municipios}
                    parroquias={parroquias}
                    isEditing={true}
                />
            </div>
        </>
    );
}
