import React from 'react';
import { Head } from '@inertiajs/react';
import { useTranslate } from '@/hooks/use-translate';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PastorFormWizard from './Partials/PastorFormWizard';

interface CreateProps {
    pastoresDisponibles: Array<any>;
    estados: Array<any>;
    municipios: Array<any>;
    parroquias: Array<any>;
}

export default function Create({
    pastoresDisponibles,
    estados,
    municipios,
    parroquias,
}: CreateProps) {
    const { __ } = useTranslate();

    const breadcrumbs = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('Pastors'), href: '/admin/pastores' },
        { title: __('New Pastor'), href: '/admin/pastores/create' },
    ];

    return (
        <>
            <Head title={__('New Pastor')} />
            <div className="space-y-6">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
                <PastorFormWizard
                    pastoresDisponibles={pastoresDisponibles}
                    estados={estados}
                    municipios={municipios}
                    parroquias={parroquias}
                    isEditing={false}
                />
            </div>
        </>
    );
}
