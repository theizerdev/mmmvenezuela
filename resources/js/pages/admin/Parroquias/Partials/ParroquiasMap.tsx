import React from 'react';
import MapboxMap from '@/components/mapbox-map';

export interface ParroquiaMapItem {
    id: number;
    nombre: string;
    codigo?: string | null;
    capital?: string | null;
    latitud: number | null;
    longitud: number | null;
    municipio?: {
        nombre: string;
        estado?: {
            nombre: string;
        };
    };
}

interface ParroquiasMapProps {
    parroquias: ParroquiaMapItem[];
}

export function ParroquiasMap({ parroquias }: ParroquiasMapProps) {
    const parroquiasConCoordenadas = parroquias.filter(
        (p) => p.latitud !== null && p.longitud !== null
    );

    const markers = parroquiasConCoordenadas.map((p) => ({
        lat: Number(p.latitud),
        lng: Number(p.longitud),
        label: `${p.nombre}${p.municipio ? ` (${p.municipio.nombre}${p.municipio.estado ? `, ${p.municipio.estado.nombre}` : ''})` : ''}`,
    }));

    return (
        <div className="overflow-hidden rounded-lg border shadow-sm">
            <MapboxMap
                lat={7.5}
                lng={-66.5}
                zoom={5.8}
                interactive={true}
                markers={markers}
                className="h-[520px] w-full"
            />
        </div>
    );
}

export default ParroquiasMap;
