import React, { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Building2, Layers, MapPin, ShieldAlert } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslate } from '@/hooks/use-translate';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface PinExtension {
    id: number;
    nombre: string;
    pastor: string;
    ubicacion: string;
    tipo_local: string;
    lat: number | null;
    lng: number | null;
    activa: boolean;
    miembros: number;
    direccion: string;
}

export interface EstadoCount {
    estado_id: number | null;
    estado_nombre: string;
    cantidad: number;
}

interface ExtensionesMapViewProps {
    pines: PinExtension[];
    estadosCount: EstadoCount[];
    className?: string;
}

// Coordenadas [lng, lat] para Mapbox de los Estados de Venezuela
const MAPBOX_ESTADOS_COORDS: Record<string, [number, number]> = {
    'Amazonas': [-67.5833, 5.6639],
    'Anzoátegui': [-64.6667, 9.3333],
    'Apure': [-68.8333, 7.0833],
    'Aragua': [-67.6000, 10.2500],
    'Barinas': [-70.2075, 8.6226],
    'Bolívar': [-63.0000, 6.0000],
    'Carabobo': [-68.0000, 10.1667],
    'Cojedes': [-68.5833, 9.6667],
    'Delta Amacuro': [-61.5000, 8.7500],
    'Distrito Capital': [-66.9167, 10.5000],
    'Falcón': [-69.6739, 11.4042],
    'Guárico': [-66.3333, 8.8333],
    'Lara': [-69.3570, 10.0647],
    'Mérida': [-71.1444, 8.5983],
    'Miranda': [-66.7000, 10.2500],
    'Monagas': [-63.1667, 9.7500],
    'Nueva Esparta': [-63.9167, 10.9833],
    'Portuguesa': [-69.2500, 9.0833],
    'Sucre': [-63.6667, 10.4500],
    'Táchira': [-72.2333, 7.7667],
    'Trujillo': [-70.4333, 9.3667],
    'Vargas': [-66.9333, 10.6000],
    'La Guaira': [-66.9333, 10.6000],
    'Yaracuy': [-68.7500, 10.3333],
    'Zulia': [-71.6333, 10.2167],
};

export function ExtensionesMapView({
    pines,
    estadosCount,
    className = 'h-[480px] w-full rounded-xl overflow-hidden border shadow-xs',
}: ExtensionesMapViewProps) {
    const { __ } = useTranslate();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapboxMapRef = useRef<mapboxgl.Map | null>(null);
    const mapboxMarkersRef = useRef<mapboxgl.Marker[]>([]);

    const leafletMapRef = useRef<L.Map | null>(null);
    const leafletLayerRef = useRef<L.LayerGroup | null>(null);

    const [selectedEstadoFilter, setSelectedEstadoFilter] = useState<string>('todos');
    const [useMapbox, setUseMapbox] = useState<boolean>(true);

    // Obtener clave Mapbox desde Inertia global props
    const pageProps = usePage().props as any;
    const mapboxApiKey = pageProps.mapbox_api_key || pageProps.auth?.user?.empresa?.mapbox_api_key;
    const mapboxActive = pageProps.mapbox_active !== undefined ? pageProps.mapbox_active : pageProps.auth?.user?.empresa?.mapbox_active;

    // Pines válidos con coordenadas
    const pinesConCoordenadas = pines.filter(
        (p) => p.lat !== null && p.lng !== null && !isNaN(p.lat) && !isNaN(p.lng)
    );

    // Inicialización del Mapa (Mapbox GL JS con fallback a Leaflet)
    useEffect(() => {
        if (!mapContainerRef.current) return;

        if (mapboxActive && mapboxApiKey) {
            setUseMapbox(true);
            mapboxgl.accessToken = mapboxApiKey;

            try {
                if (typeof (mapboxgl as any).setTelemetryEnabled === 'function') {
                    (mapboxgl as any).setTelemetryEnabled(false);
                }
                (mapboxgl as any).telemetry = false;
            } catch {
                // Ignore
            }

            const isDark = document.documentElement.classList.contains('dark');
            const mapStyle = isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12';

            const map = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: mapStyle,
                center: [-69.8371, 9.0820], // Venezuela [lng, lat]
                zoom: 5.5,
            });

            map.addControl(new mapboxgl.NavigationControl(), 'top-right');
            mapboxMapRef.current = map;
        } else {
            // Fallback Leaflet / OpenStreetMap
            setUseMapbox(false);
            const map = L.map(mapContainerRef.current, {
                center: [9.0820, -69.8371],
                zoom: 6,
                zoomControl: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            const layerGroup = L.layerGroup().addTo(map);
            leafletLayerRef.current = layerGroup;
            leafletMapRef.current = map;
        }

        return () => {
            if (mapboxMapRef.current) {
                mapboxMapRef.current.remove();
                mapboxMapRef.current = null;
            }
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
            }
        };
    }, [mapboxApiKey, mapboxActive]);

    // Renderizar Pines y Manejar Zoom/FlyTo en Mapbox GL
    useEffect(() => {
        const pinesFiltrados = selectedEstadoFilter === 'todos'
            ? pinesConCoordenadas
            : pinesConCoordenadas.filter((p) => p.ubicacion.toLowerCase().includes(selectedEstadoFilter.toLowerCase()));

        if (useMapbox && mapboxMapRef.current) {
            // Limpiar marcadores anteriores de Mapbox
            mapboxMarkersRef.current.forEach((m) => m.remove());
            mapboxMarkersRef.current = [];

            pinesFiltrados.forEach((pin) => {
                if (pin.lat === null || pin.lng === null) return;

                // Crear elemento HTML personalizado para el marcador Mapbox
                const el = document.createElement('div');
                el.className = 'custom-mapbox-marker cursor-pointer transition-transform hover:scale-110';
                el.innerHTML = `
                    <div style="background-color: ${pin.activa ? '#10b981' : '#f43f5e'}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                        </svg>
                    </div>
                `;

                const popupHtml = `
                    <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px; min-width: 210px;">
                        <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 4px;">
                            ${pin.nombre}
                        </div>
                        <div style="font-size: 12px; color: #475569; margin-bottom: 3px;">
                            📍 <strong>Ubicación:</strong> ${pin.ubicacion || 'Venezuela'}
                        </div>
                        <div style="font-size: 12px; color: #475569; margin-bottom: 3px;">
                            👤 <strong>Pastor:</strong> ${pin.pastor}
                        </div>
                        <div style="font-size: 12px; color: #475569; margin-bottom: 3px;">
                            🏢 <strong>Tipo de Local:</strong> ${pin.tipo_local}
                        </div>
                        <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">
                            👥 <strong>Miembros Activos:</strong> ${pin.miembros}
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
                            <span style="font-size: 11px; font-weight: 700; color: ${pin.activa ? '#059669' : '#e11d48'};">
                                ● ${pin.activa ? 'ACTIVA' : 'INACTIVA'}
                            </span>
                            <a href="/admin/extensiones/${pin.id}/edit" style="font-size: 11px; color: #4f46e5; font-weight: 700; text-decoration: none;">
                                Ver detalles &rarr;
                            </a>
                        </div>
                    </div>
                `;

                const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml);
                const marker = new mapboxgl.Marker({ element: el })
                    .setLngLat([pin.lng, pin.lat])
                    .setPopup(popup)
                    .addTo(mapboxMapRef.current!);

                mapboxMarkersRef.current.push(marker);
            });

            // Animación flyTo de Mapbox GL según estado seleccionado
            if (selectedEstadoFilter !== 'todos' && MAPBOX_ESTADOS_COORDS[selectedEstadoFilter]) {
                const [eLng, eLat] = MAPBOX_ESTADOS_COORDS[selectedEstadoFilter];
                mapboxMapRef.current.flyTo({
                    center: [eLng, eLat],
                    zoom: 10,
                    essential: true,
                    duration: 1600,
                });
            } else {
                mapboxMapRef.current.flyTo({
                    center: [-69.8371, 9.0820],
                    zoom: 5.5,
                    duration: 1200,
                });
            }
        } else if (!useMapbox && leafletMapRef.current && leafletLayerRef.current) {
            // Manejo Fallback Leaflet
            leafletLayerRef.current.clearLayers();
            pinesFiltrados.forEach((pin) => {
                if (pin.lat === null || pin.lng === null) return;
                const marker = L.marker([pin.lat, pin.lng]);
                marker.bindPopup(`<b>${pin.nombre}</b><br>${pin.ubicacion}<br>Pastor: ${pin.pastor}`);
                leafletLayerRef.current?.addLayer(marker);
            });
            if (selectedEstadoFilter !== 'todos' && MAPBOX_ESTADOS_COORDS[selectedEstadoFilter]) {
                const [eLng, eLat] = MAPBOX_ESTADOS_COORDS[selectedEstadoFilter];
                leafletMapRef.current.setView([eLat, eLng], 10);
            } else {
                leafletMapRef.current.setView([9.0820, -69.8371], 6);
            }
        }
    }, [useMapbox, pinesConCoordenadas, selectedEstadoFilter]);

    return (
        <div className="space-y-3">
            {/* Chips de Selección por Estado */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                <Button
                    type="button"
                    variant={selectedEstadoFilter === 'todos' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedEstadoFilter('todos')}
                    className="h-7 text-xs rounded-full shrink-0"
                >
                    <Layers className="size-3.5 mr-1" />
                    {__('Todos los Estados')} ({pinesConCoordenadas.length})
                </Button>

                {estadosCount
                    .filter((e) => e.cantidad > 0)
                    .map((est) => (
                        <Button
                            key={est.estado_nombre}
                            type="button"
                            variant={selectedEstadoFilter === est.estado_nombre ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedEstadoFilter(est.estado_nombre)}
                            className="h-7 text-xs rounded-full shrink-0"
                        >
                            {est.estado_nombre} ({est.cantidad})
                        </Button>
                    ))}
            </div>

            {/* Contenedor del Mapa Mapbox GL */}
            <div className="relative">
                <div ref={mapContainerRef} className={className} />

                {/* Overlays de leyenda Mapbox */}
                <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-md border rounded-lg px-3 py-1.5 shadow-md z-[10] flex items-center gap-2 text-xs font-semibold">
                    <MapPin className="size-4 text-indigo-600" />
                    <span>{useMapbox ? __('Mapbox GL Venezuela') : __('Mapa de Venezuela')}</span>
                </div>

                <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-md border rounded-lg px-3 py-1.5 shadow-md z-[10] flex items-center gap-3 text-xs font-semibold">
                    <div className="flex items-center gap-1 text-emerald-600">
                        <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{pinesConCoordenadas.filter((p) => p.activa).length} {__('Activas')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-rose-600">
                        <span className="size-2.5 rounded-full bg-rose-500" />
                        <span>{pinesConCoordenadas.filter((p) => !p.activa).length} {__('Inactivas')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExtensionesMapView;
