import React from 'react';
import MapboxMap from '@/components/mapbox-map';

export interface MunicipioMapItem {
    id: number;
    nombre: string;
    codigo?: string | null;
    capital?: string | null;
    latitud: number | null;
    longitud: number | null;
    estado?: {
        nombre: string;
    };
}

interface MunicipiosMapProps {
    municipios: MunicipioMapItem[];
}

export function MunicipiosMap({ municipios }: MunicipiosMapProps) {
    const municipiosConCoordenadas = municipios.filter(
        (m) => m.latitud !== null && m.longitud !== null
    );

    const markers = municipiosConCoordenadas.map((m) => ({
        lat: Number(m.latitud),
        lng: Number(m.longitud),
        label: `${m.nombre}${m.estado ? ` (${m.estado.nombre})` : ''}`,
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

export default MunicipiosMap;
