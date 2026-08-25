import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Loader2, Navigation, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslate } from '@/hooks/use-translate';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corregir íconos por defecto de Leaflet en React/Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface GeocodedAddressDetails {
    direccion?: string;
    sector?: string;
    calle?: string;
    avenida?: string;
    estado?: string;
    municipio?: string;
    parroquia?: string;
}

interface LocationMapPickerProps {
    lat?: number | string | null;
    lng?: number | string | null;
    onLocationSelect: (lat: number, lng: number, details?: GeocodedAddressDetails) => void;
    estadoNombre?: string;
    municipioNombre?: string;
    className?: string;
}

// Coordenadas aproximadas de los Estados de Venezuela para centrar el mapa dinámicamente
const ESTADOS_COORDINATES: Record<string, [number, number]> = {
    'Amazonas': [5.6639, -67.5833],
    'Anzoátegui': [9.3333, -64.6667],
    'Apure': [7.0833, -68.8333],
    'Aragua': [10.2500, -67.6000],
    'Barinas': [8.6226, -70.2075],
    'Bolívar': [6.0000, -63.0000],
    'Carabobo': [10.1667, -68.0000],
    'Cojedes': [9.6667, -68.5833],
    'Delta Amacuro': [8.7500, -61.5000],
    'Distrito Capital': [10.5000, -66.9167],
    'Falcón': [11.4042, -69.6739],
    'Guárico': [8.8333, -66.3333],
    'Lara': [10.0647, -69.3570],
    'Mérida': [8.5983, -71.1444],
    'Miranda': [10.2500, -66.7000],
    'Monagas': [9.7500, -63.1667],
    'Nueva Esparta': [10.9833, -63.9167],
    'Portuguesa': [9.0833, -69.2500],
    'Sucre': [10.4500, -63.6667],
    'Táchira': [7.7667, -72.2333],
    'Trujillo': [9.3667, -70.4333],
    'Vargas': [10.6000, -66.9333],
    'La Guaira': [10.6000, -66.9333],
    'Yaracuy': [10.3333, -68.7500],
    'Zulia': [10.2167, -71.6333],
};

export function LocationMapPicker({
    lat,
    lng,
    onLocationSelect,
    estadoNombre,
    municipioNombre,
    className = 'h-[320px] w-full rounded-xl overflow-hidden border shadow-xs',
}: LocationMapPickerProps) {
    const { __ } = useTranslate();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    const [loadingReverse, setLoadingReverse] = useState(false);
    const [lastAddress, setLastAddress] = useState<string>('');

    // Coordenadas numéricas iniciales (default: Venezuela [9.0820, -69.8371])
    const currentLat = lat ? Number(lat) : 9.0820;
    const currentLng = lng ? Number(lng) : -69.8371;
    const hasCoordinates = Boolean(lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng)));

    // Función para obtener dirección desde Nominatim Reverse Geocoding
    const reverseGeocode = async (latitude: number, longitude: number) => {
        setLoadingReverse(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                { headers: { 'Accept-Language': 'es' } }
            );

            if (res.ok) {
                const data = await res.json();
                const addr = data.address || {};

                const sector = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || '';
                const calle = addr.road || addr.pedestrian || addr.street || '';
                const municipio = addr.municipality || addr.county || addr.city || addr.district || '';
                const estado = addr.state || addr.state_district || addr.province || addr.region || '';
                const parroquia = addr.suburb || addr.quarter || addr.neighbourhood || addr.village || addr.hamlet || '';

                const fullAddress = data.display_name || '';
                setLastAddress(fullAddress);

                onLocationSelect(latitude, longitude, {
                    direccion: fullAddress,
                    sector,
                    calle,
                    municipio,
                    estado,
                    parroquia,
                });
            } else {
                onLocationSelect(latitude, longitude);
            }
        } catch (e) {
            console.error('Error in reverse geocoding:', e);
            onLocationSelect(latitude, longitude);
        } finally {
            setLoadingReverse(false);
        }
    };

    // Inicialización del mapa Leaflet
    useEffect(() => {
        if (!mapContainerRef.current) return;

        if (!mapRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [currentLat, currentLng],
                zoom: hasCoordinates ? 14 : 6,
                zoomControl: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            const marker = L.marker([currentLat, currentLng], {
                draggable: true,
            }).addTo(map);

            // Al arrastrar el marcador
            marker.on('dragend', async () => {
                const position = marker.getLatLng();
                await reverseGeocode(position.lat, position.lng);
            });

            // Al hacer clic en cualquier punto del mapa
            map.on('click', async (e: L.LeafletMouseEvent) => {
                const { lat: clickedLat, lng: clickedLng } = e.latlng;
                marker.setLatLng([clickedLat, clickedLng]);
                map.panTo([clickedLat, clickedLng]);
                await reverseGeocode(clickedLat, clickedLng);
            });

            mapRef.current = map;
            markerRef.current = marker;
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
            }
        };
    }, []);

    // Actualizar posición del marcador cuando cambian lat/lng desde props externos
    useEffect(() => {
        if (mapRef.current && markerRef.current && hasCoordinates) {
            markerRef.current.setLatLng([currentLat, currentLng]);
            mapRef.current.setView([currentLat, currentLng], 15);
        }
    }, [lat, lng]);

    // Reacción dinámica al cambiar el Estado desde las Select2 del formulario
    useEffect(() => {
        if (estadoNombre && ESTADOS_COORDINATES[estadoNombre] && mapRef.current) {
            const [eLat, eLng] = ESTADOS_COORDINATES[estadoNombre];
            mapRef.current.setView([eLat, eLng], 10);
            if (markerRef.current && !hasCoordinates) {
                markerRef.current.setLatLng([eLat, eLng]);
            }
        }
    }, [estadoNombre]);

    // Función para centrar en la ubicación GPS actual del dispositivo
    const handleUseCurrentLocation = () => {
        if ('geolocation' in navigator) {
            setLoadingReverse(true);
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    if (mapRef.current && markerRef.current) {
                        markerRef.current.setLatLng([latitude, longitude]);
                        mapRef.current.setView([latitude, longitude], 16);
                    }
                    await reverseGeocode(latitude, longitude);
                },
                (err) => {
                    console.error('Geolocation error:', err);
                    setLoadingReverse(false);
                }
            );
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="size-4 text-indigo-600" />
                    {__('Selección Interactiva en el Mapa (Haga clic para ubicar la extensión)')}
                </Label>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseCurrentLocation}
                    disabled={loadingReverse}
                    className="gap-1.5 text-xs h-8 bg-background shadow-2xs"
                >
                    {loadingReverse ? (
                        <Loader2 className="size-3.5 animate-spin text-indigo-600" />
                    ) : (
                        <Navigation className="size-3.5 text-indigo-600" />
                    )}
                    {__('Usar mi ubicación GPS')}
                </Button>
            </div>

            <div className="relative isolate z-0 overflow-hidden rounded-2xl">
                <div ref={mapContainerRef} className={className} />

                {loadingReverse && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center z-[1000] rounded-xl">
                        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg shadow-md border">
                            <Loader2 className="size-4 animate-spin text-indigo-600" />
                            <span className="text-xs font-semibold">{__('Obteniendo dirección del mapa...')}</span>
                        </div>
                    </div>
                )}
            </div>

            {hasCoordinates && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                        <span className="text-emerald-900 dark:text-emerald-300 truncate font-medium">
                            {lastAddress || `Lat: ${currentLat.toFixed(6)}, Lng: ${currentLng.toFixed(6)}`}
                        </span>
                    </div>
                    <span className="font-mono text-[10px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded border text-muted-foreground shrink-0 ml-2">
                        {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
                    </span>
                </div>
            )}
        </div>
    );
}

export default LocationMapPicker;
