import React from 'react';
import MapboxMap from '@/components/mapbox-map';

export interface EstadoMapItem {
    id: number;
    nombre: string;
    codigo?: string | null;
    capital?: string | null;
    latitud: number | null;
    longitud: number | null;
}

interface EstadosMapProps {
    estados: EstadoMapItem[];
}

export function EstadosMap({ estados }: EstadosMapProps) {
    const estadosConCoordenadas = estados.filter(
        (e) => e.latitud !== null && e.longitud !== null,
    );

    const markers = estadosConCoordenadas.map((e) => ({
        lat: Number(e.latitud),
        lng: Number(e.longitud),
        label: `${e.nombre}${e.capital ? ` (${e.capital})` : ''}`,
    }));

    // Coordenadas centradas por defecto en Venezuela (aprox Lat 7.5, Lng -66.5)
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

export default EstadosMap;
