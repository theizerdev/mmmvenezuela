import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Search,
    MapPin,
    Building2,
    User,
    Phone,
    MessageCircle,
    Navigation,
    Compass,
    Maximize2,
    Minimize2,
    Filter,
    X,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Users,
    Satellite,
    Moon,
    Layers,
    RotateCcw,
    Radio,
    Clock,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    Box,
    Mountain,
    Grid,
    ChevronRight,
    Map as MapIcon
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslate } from '@/hooks/use-translate';
import type * as L from 'leaflet';

export interface PinExtension {
    id: number;
    nombre: string;
    pastor: string;
    pastor_foto?: string | null;
    pastor_telefono?: string;
    telefono?: string;
    zona?: string;
    distrito?: string;
    estado_id?: number | null;
    estado_nombre?: string;
    municipio_nombre?: string;
    parroquia_nombre?: string;
    sector?: string;
    ubicacion: string;
    tipo_local: string;
    lat: number | null;
    lng: number | null;
    activa: boolean;
    miembros_activos: number;
    miembros_probantes: number;
    total_miembros: number;
    campos_blancos: number;
    posee_medio: boolean;
    direccion: string;
}

export interface EstadoOption {
    estado_id: number | null;
    estado_nombre: string;
    latitud?: number | null;
    longitud?: number | null;
    cantidad: number;
}

interface MapaPageProps {
    pines: PinExtension[];
    estados: EstadoOption[];
    zonas: string[];
    mapboxApiKey?: string | null;
    mapboxActive?: boolean;
    googleMapsApiKey?: string | null;
    googleMapsActive?: boolean;
}

export type MapLayerStyle = 'satellite' | 'dark' | 'standard3d' | 'outdoors' | 'streets';
export type ViewMode = 'estados' | 'sedes'; // 'estados' = 1 icono por estado, 'sedes' = todas las sedes individuales

const cleanText = (str?: string) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
};

export default function ExtensionesMapaPage({
    pines = [],
    estados = [],
    zonas = [],
    mapboxApiKey: propMapboxApiKey,
    mapboxActive: propMapboxActive,
    googleMapsApiKey: propGoogleApiKey,
    googleMapsActive: propGoogleActive,
}: MapaPageProps) {
    const { __ } = useTranslate();
    const pageProps = usePage().props as any;

    const mapboxApiKey =
        propMapboxApiKey ||
        pageProps.mapboxApiKey ||
        pageProps.mapbox_api_key ||
        pageProps.auth?.user?.empresa?.mapbox_api_key;

    const mapboxActive =
        propMapboxActive ??
        pageProps.mapboxActive ??
        pageProps.mapbox_active ??
        pageProps.auth?.user?.empresa?.mapbox_active ??
        true;

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapboxMapRef = useRef<mapboxgl.Map | null>(null);
    const mapboxMarkersRef = useRef<mapboxgl.Marker[]>([]);
    const mapboxStateMarkersRef = useRef<mapboxgl.Marker[]>([]);

    const leafletMapRef = useRef<L.Map | null>(null);
    const leafletMarkersLayerRef = useRef<L.LayerGroup | null>(null);
    const leafletTileLayerRef = useRef<L.TileLayer | null>(null);
    const leafletLibRef = useRef<any>(null);

    // Modo de vista: 'estados' (por defecto: 1 icono por estado) o 'sedes' (todas las 458 sedes)
    const [viewMode, setViewMode] = useState<ViewMode>('estados');

    // Estado seleccionado actualmente (si se presiona un estado)
    const [selectedEstado, setSelectedEstado] = useState<string>('todos');
    const [selectedZona, setSelectedZona] = useState<string>('todas');
    const [selectedDistrito, setSelectedDistrito] = useState<string>('todos');
    const [selectedEstatus, setSelectedEstatus] = useState<string>('todos');
    const [soloCamposBlancos, setSoloCamposBlancos] = useState<boolean>(false);
    const [soloMedios, setSoloMedios] = useState<boolean>(false);

    // Búsqueda
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [stateSearchQuery, setStateSearchQuery] = useState('');

    // Capa visual del mapa y vista
    const [activeStyle, setActiveStyle] = useState<MapLayerStyle>('satellite');
    const [selectedPin, setSelectedPin] = useState<PinExtension | null>(null);
    const [isDrawerCollapsed, setIsDrawerCollapsed] = useState<boolean>(false);
    const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);
    const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);
    const [is3DMode, setIs3DMode] = useState<boolean>(false);
    const [useMapbox, setUseMapbox] = useState<boolean>(true);
    const [copiedCoords, setCopiedCoords] = useState<boolean>(false);

    // Pines con coordenadas numéricas válidas
    const validPines = useMemo(() => {
        return pines.filter(
            (p) => p.lat !== null && p.lng !== null && !isNaN(Number(p.lat)) && !isNaN(Number(p.lng))
        );
    }, [pines]);

    // Estados enriquecidos con coordenadas (centroid de las iglesias si el estado no tiene lat/lng)
    const enrichedEstados = useMemo(() => {
        return estados
            .map((est) => {
                let lat = est.latitud ? Number(est.latitud) : null;
                let lng = est.longitud ? Number(est.longitud) : null;

                const churchesInState = validPines.filter(
                    (p) => cleanText(p.estado_nombre) === cleanText(est.estado_nombre)
                );

                if ((lat === null || lng === null || isNaN(lat) || isNaN(lng)) && churchesInState.length > 0) {
                    const avgLat = churchesInState.reduce((acc, c) => acc + (c.lat || 0), 0) / churchesInState.length;
                    const avgLng = churchesInState.reduce((acc, c) => acc + (c.lng || 0), 0) / churchesInState.length;
                    lat = avgLat;
                    lng = avgLng;
                }

                const totalMiembros = churchesInState.reduce((acc, c) => acc + c.total_miembros, 0);
                const camposBlancos = churchesInState.reduce((acc, c) => acc + c.campos_blancos, 0);

                return {
                    ...est,
                    latitud: lat,
                    longitud: lng,
                    cantidad: churchesInState.length || est.cantidad,
                    totalMiembros,
                    camposBlancos,
                };
            })
            .filter((est) => est.latitud !== null && est.longitud !== null && est.cantidad > 0)
            .sort((a, b) => b.cantidad - a.cantidad);
    }, [estados, validPines]);

    // Filtrado en vivo de los pines según los criterios
    const filteredPines = useMemo(() => {
        return validPines.filter((pin) => {
            // Filtro por Estado
            if (selectedEstado !== 'todos') {
                const normEst = cleanText(pin.estado_nombre);
                const targetEst = cleanText(selectedEstado);
                if (!normEst || !normEst.includes(targetEst)) return false;
            }

            // Filtro por Zona
            if (selectedZona !== 'todas') {
                const numZona = pin.zona?.replace(/\D/g, '') || pin.zona;
                const targetZona = selectedZona.replace(/\D/g, '') || selectedZona;
                if (numZona !== targetZona) return false;
            }

            // Filtro por Distrito
            if (selectedDistrito !== 'todos') {
                const numDist = pin.distrito?.replace(/\D/g, '') || pin.distrito;
                const targetDist = selectedDistrito.replace(/\D/g, '') || selectedDistrito;
                if (numDist !== targetDist) return false;
            }

            // Filtro por Estatus
            if (selectedEstatus === 'activa' && !pin.activa) return false;
            if (selectedEstatus === 'inactiva' && pin.activa) return false;

            // Filtro por Campos Blancos
            if (soloCamposBlancos && pin.campos_blancos <= 0) return false;

            // Filtro por Medios de Comunicación
            if (soloMedios && !pin.posee_medio) return false;

            // Filtro por Búsqueda de texto
            if (searchQuery.trim().length > 1) {
                const q = cleanText(searchQuery);
                const matchNombre = cleanText(pin.nombre).includes(q);
                const matchPastor = cleanText(pin.pastor).includes(q);
                const matchMunicipio = cleanText(pin.municipio_nombre).includes(q);
                const matchSector = cleanText(pin.sector).includes(q);
                const matchZona = cleanText(pin.zona).includes(q);
                if (!matchNombre && !matchPastor && !matchMunicipio && !matchSector && !matchZona) {
                    return false;
                }
            }

            return true;
        });
    }, [validPines, selectedEstado, selectedZona, selectedDistrito, selectedEstatus, soloCamposBlancos, soloMedios, searchQuery]);

    // Iglesias del estado actualmente seleccionado (para el panel de estado)
    const activeStateChurches = useMemo(() => {
        if (selectedEstado === 'todos') return [];
        const targetEst = cleanText(selectedEstado);
        let list = validPines.filter((p) => cleanText(p.estado_nombre).includes(targetEst));
        if (stateSearchQuery.trim()) {
            const q = cleanText(stateSearchQuery);
            list = list.filter(
                (p) =>
                    cleanText(p.nombre).includes(q) ||
                    cleanText(p.pastor).includes(q) ||
                    cleanText(p.municipio_nombre).includes(q) ||
                    cleanText(p.zona).includes(q)
            );
        }
        return list;
    }, [validPines, selectedEstado, stateSearchQuery]);

    // Datos del estado activo
    const activeStateInfo = useMemo(() => {
        if (selectedEstado === 'todos') return null;
        return enrichedEstados.find((e) => cleanText(e.estado_nombre) === cleanText(selectedEstado));
    }, [enrichedEstados, selectedEstado]);

    // Resultados de búsqueda autocompletada
    const searchResults = useMemo(() => {
        if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
        const q = cleanText(searchQuery);
        return validPines
            .filter((pin) => {
                return (
                    cleanText(pin.nombre).includes(q) ||
                    cleanText(pin.pastor).includes(q) ||
                    cleanText(pin.municipio_nombre).includes(q) ||
                    cleanText(pin.estado_nombre).includes(q) ||
                    cleanText(pin.ubicacion).includes(q) ||
                    cleanText(pin.sector).includes(q) ||
                    cleanText(pin.zona).includes(q)
                );
            })
            .slice(0, 8);
    }, [validPines, searchQuery]);

    // URL de estilo de Mapbox
    const getMapboxStyleUrl = useCallback((style: MapLayerStyle) => {
        switch (style) {
            case 'satellite':
                return 'mapbox://styles/mapbox/satellite-streets-v12';
            case 'dark':
                return 'mapbox://styles/mapbox/dark-v11';
            case 'standard3d':
                return 'mapbox://styles/mapbox/streets-v12';
            case 'outdoors':
                return 'mapbox://styles/mapbox/outdoors-v12';
            case 'streets':
            default:
                return 'mapbox://styles/mapbox/streets-v12';
        }
    }, []);

    // Función para inyectar capa de edificios 3D en Mapbox
    const add3dBuildingsLayer = useCallback((map: mapboxgl.Map) => {
        try {
            if (map.getLayer('3d-buildings')) return;
            const layers = map.getStyle()?.layers;
            if (!layers) return;
            const labelLayerId = layers.find((l) => l.type === 'symbol' && (l.layout as any)?.['text-field'])?.id;

            map.addLayer(
                {
                    id: '3d-buildings',
                    source: 'composite',
                    'source-layer': 'building',
                    filter: ['==', 'extrude', 'true'],
                    type: 'fill-extrusion',
                    minzoom: 14,
                    paint: {
                        'fill-extrusion-color': [
                            'interpolate',
                            ['linear'],
                            ['get', 'height'],
                            0, '#1e293b',
                            50, '#334155',
                            100, '#475569'
                        ],
                        'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 15.05, ['get', 'height']],
                        'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 14, 0, 15.05, ['get', 'min_height']],
                        'fill-extrusion-opacity': 0.75,
                    },
                },
                labelLayerId
            );
        } catch (e) {
            // Ignore
        }
    }, []);

    // Inicialización del Mapa
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

            const map = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: getMapboxStyleUrl(activeStyle),
                center: [-66.5897, 8.2],
                zoom: 6.2,
                pitch: is3DMode ? 55 : 0,
                bearing: is3DMode ? -15 : 0,
                antialias: true,
            });

            map.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }), 'bottom-right');
            map.addControl(new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

            map.on('style.load', () => {
                add3dBuildingsLayer(map);
            });

            mapboxMapRef.current = map;
        } else {
            // Fallback Leaflet
            setUseMapbox(false);
            import('leaflet').then((leafletModule) => {
                const LInstance = (leafletModule as any).default || leafletModule;
                import('leaflet/dist/leaflet.css');
                leafletLibRef.current = LInstance;

                if (!mapContainerRef.current) return;

                const map = LInstance.map(mapContainerRef.current, {
                    center: [8.2, -66.5897],
                    zoom: 6.5,
                    zoomControl: false,
                });

                LInstance.control.zoom({ position: 'bottomright' }).addTo(map);

                const tileLayer = LInstance.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; CartoDB &copy; OpenStreetMap',
                    maxZoom: 19,
                }).addTo(map);

                leafletTileLayerRef.current = tileLayer;
                const markersLayer = LInstance.layerGroup().addTo(map);
                leafletMarkersLayerRef.current = markersLayer;
                leafletMapRef.current = map;
            });
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

    // Cambio dinámico de capa visual
    const changeMapStyle = (newStyle: MapLayerStyle) => {
        setActiveStyle(newStyle);
        if (useMapbox && mapboxMapRef.current) {
            const url = getMapboxStyleUrl(newStyle);
            mapboxMapRef.current.setStyle(url);
            mapboxMapRef.current.once('style.load', () => {
                if (mapboxMapRef.current) {
                    add3dBuildingsLayer(mapboxMapRef.current);
                }
            });
        } else if (!useMapbox && leafletMapRef.current && leafletLibRef.current) {
            const LInstance = leafletLibRef.current;
            if (leafletTileLayerRef.current) {
                leafletMapRef.current.removeLayer(leafletTileLayerRef.current);
            }
            let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
            if (newStyle === 'dark') {
                tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
            } else if (newStyle === 'satellite') {
                tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
            }
            const newLayer = LInstance.tileLayer(tileUrl, { maxZoom: 19 }).addTo(leafletMapRef.current);
            leafletTileLayerRef.current = newLayer;
        }
    };

    // Toggle 3D / 2D perspective
    const toggle3DMode = () => {
        const nextMode = !is3DMode;
        setIs3DMode(nextMode);

        if (useMapbox && mapboxMapRef.current) {
            if (nextMode) {
                mapboxMapRef.current.easeTo({
                    pitch: 58,
                    bearing: -18,
                    duration: 1200,
                });
            } else {
                mapboxMapRef.current.easeTo({
                    pitch: 0,
                    bearing: 0,
                    duration: 900,
                });
            }
        }
    };

    // Seleccionar un Estado (vuelo hacia el estado y revelación de sus iglesias)
    const handleSelectEstado = (est: typeof enrichedEstados[0]) => {
        setSelectedEstado(est.estado_nombre);
        setSelectedPin(null);
        setStateSearchQuery('');

        if (useMapbox && mapboxMapRef.current && est.longitud && est.latitud) {
            mapboxMapRef.current.flyTo({
                center: [est.longitud, est.latitud],
                zoom: 9.2,
                pitch: is3DMode ? 45 : 25,
                duration: 1500,
                essential: true,
            });
        } else if (!useMapbox && leafletMapRef.current && est.latitud && est.longitud) {
            leafletMapRef.current.setView([est.latitud, est.longitud], 9, { animate: true });
        }
    };

    // Regresar a la vista general de Venezuela (por estados)
    const handleBackToVenezuela = () => {
        setSelectedEstado('todos');
        setSelectedPin(null);
        setStateSearchQuery('');

        if (useMapbox && mapboxMapRef.current) {
            mapboxMapRef.current.flyTo({
                center: [-66.5897, 8.2],
                zoom: 6.2,
                pitch: is3DMode ? 35 : 0,
                bearing: 0,
                duration: 1500,
            });
        } else if (leafletMapRef.current) {
            leafletMapRef.current.setView([8.2, -66.5897], 6.5);
        }
    };

    // Seleccionar iglesia y volar suavemente a ella
    const handleSelectPin = (pin: PinExtension) => {
        setSelectedPin(pin);
        setIsDrawerCollapsed(false);

        // Si la iglesia pertenece a un estado diferente al seleccionado, asegurar que se muestre
        if (pin.estado_nombre && selectedEstado === 'todos') {
            setSelectedEstado(pin.estado_nombre);
        }

        if (useMapbox && mapboxMapRef.current && pin.lng !== null && pin.lat !== null) {
            mapboxMapRef.current.flyTo({
                center: [pin.lng, pin.lat],
                zoom: 15,
                pitch: is3DMode ? 55 : 40,
                duration: 1400,
                essential: true,
            });
        } else if (!useMapbox && leafletMapRef.current && pin.lat !== null && pin.lng !== null) {
            leafletMapRef.current.setView([pin.lat, pin.lng], 15, { animate: true });
        }
    };

    // RENDERIZADO DE MARCADORES (ESTADOS VS IGLESIAS)
    useEffect(() => {
        // MODO 1: VISTA POR ESTADOS (Cuando viewMode === 'estados' Y no hay un estado activo seleccionado)
        const isShowingStateBadges = viewMode === 'estados' && selectedEstado === 'todos';

        if (useMapbox && mapboxMapRef.current) {
            // Limpiar marcadores de iglesias anteriores
            mapboxMarkersRef.current.forEach((m) => m.remove());
            mapboxMarkersRef.current = [];

            // Limpiar marcadores de estados anteriores
            mapboxStateMarkersRef.current.forEach((m) => m.remove());
            mapboxStateMarkersRef.current = [];

            if (isShowingStateBadges) {
                // RENDERIZAR ÚNICAMENTE LOS 24 ICONOS DE ESTADOS
                enrichedEstados.forEach((est) => {
                    if (!est.latitud || !est.longitud) return;

                    const el = document.createElement('div');
                    el.className = 'state-badge-container group cursor-pointer relative';

                    el.innerHTML = `
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            background: rgba(15, 23, 42, 0.92);
                            border: 2px solid rgba(99, 102, 241, 0.85);
                            padding: 6px 14px;
                            border-radius: 9999px;
                            box-shadow: 0 8px 24px rgba(0,0,0,0.65), 0 0 20px rgba(99, 102, 241, 0.45);
                            backdrop-filter: blur(10px);
                            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                            transform: scale(1);
                        " class="state-pill">
                            <img
                                src="/icons/logo_mmm-a-color-sin-fondo.png"
                                alt="MMM"
                                style="width: 22px; height: 22px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"
                            />
                            <span style="
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                width: 26px;
                                height: 26px;
                                border-radius: 50%;
                                background: linear-gradient(135deg, #6366f1, #a855f7);
                                color: #ffffff;
                                font-weight: 800;
                                font-size: 11px;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                                border: 1.5px solid rgba(255,255,255,0.7);
                            ">
                                ${est.cantidad}
                            </span>
                            <div style="display: flex; flex-direction: column;">
                                <span style="
                                    color: #ffffff;
                                    font-weight: 800;
                                    font-size: 12px;
                                    letter-spacing: 0.02em;
                                    white-space: nowrap;
                                ">
                                    ${est.estado_nombre}
                                </span>
                            </div>
                        </div>

                        <!-- Tooltip al pasar el cursor -->
                        <div style="
                            position: absolute;
                            bottom: 100%;
                            left: 50%;
                            transform: translateX(-50%) translateY(-8px);
                            background: rgba(15, 23, 42, 0.96);
                            color: #ffffff;
                            padding: 6px 10px;
                            border-radius: 8px;
                            font-size: 11px;
                            font-weight: 600;
                            white-space: nowrap;
                            pointer-events: none;
                            opacity: 0;
                            transition: opacity 0.2s ease;
                            box-shadow: 0 6px 18px rgba(0,0,0,0.5);
                            border: 1px solid rgba(255,255,255,0.15);
                            z-index: 70;
                        " class="state-tooltip">
                            🏛️ ${est.cantidad} Sedes · Clic para explorar
                        </div>
                    `;

                    const pill = el.querySelector('.state-pill') as HTMLElement;
                    const tooltip = el.querySelector('.state-tooltip') as HTMLElement;

                    el.addEventListener('mouseenter', () => {
                        if (pill) pill.style.transform = 'scale(1.15)';
                        if (tooltip) tooltip.style.opacity = '1';
                    });

                    el.addEventListener('mouseleave', () => {
                        if (pill) pill.style.transform = 'scale(1)';
                        if (tooltip) tooltip.style.opacity = '0';
                    });

                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        handleSelectEstado(est);
                    });

                    const marker = new mapboxgl.Marker({ element: el })
                        .setLngLat([est.longitud, est.latitud])
                        .addTo(mapboxMapRef.current!);

                    mapboxStateMarkersRef.current.push(marker);
                });
            } else {
                // RENDERIZAR LAS IGLESIAS INDIVIDUALES (Del estado seleccionado o de todas si viewMode === 'sedes')
                const pinesToRender =
                    selectedEstado !== 'todos'
                        ? filteredPines.filter((p) => cleanText(p.estado_nombre).includes(cleanText(selectedEstado)))
                        : filteredPines;

                pinesToRender.forEach((pin) => {
                    if (pin.lat === null || pin.lng === null) return;

                    const isSelected = selectedPin?.id === pin.id;
                    const el = document.createElement('div');
                    el.className = 'church-marker-container group relative cursor-pointer';

                    const colorBg = pin.activa ? '#10b981' : '#f43f5e';
                    const pulseColor = pin.activa ? 'rgba(16, 185, 129, 0.45)' : 'rgba(244, 63, 94, 0.45)';
                    const sizePx = isSelected ? 38 : 28;

                    el.innerHTML = `
                        <div style="
                            position: relative;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: ${sizePx}px;
                            height: ${sizePx}px;
                            border-radius: 50%;
                            background-color: ${colorBg};
                            border: ${isSelected ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.9)'};
                            box-shadow: 0 4px 14px rgba(0,0,0,0.5), 0 0 16px ${pulseColor};
                            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                            transform: ${isSelected ? 'scale(1.25)' : 'scale(1)'};
                        " class="marker-bubble">
                            <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? '18' : '13'}" height="${isSelected ? '18' : '13'}" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                                <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                                <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                            </svg>

                            ${pin.campos_blancos > 0 ? `
                                <span style="
                                    position: absolute;
                                    top: -5px;
                                    right: -5px;
                                    background-color: #8b5cf6;
                                    color: #ffffff;
                                    font-size: 9px;
                                    font-weight: 800;
                                    min-width: 15px;
                                    height: 15px;
                                    padding: 0 3px;
                                    border-radius: 8px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    border: 1.5px solid #ffffff;
                                    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                                ">+${pin.campos_blancos}</span>
                            ` : ''}
                        </div>

                        <!-- Tooltip al pasar el cursor -->
                        <div style="
                            position: absolute;
                            bottom: 100%;
                            left: 50%;
                            transform: translateX(-50%) translateY(-6px);
                            background: rgba(15, 23, 42, 0.95);
                            color: #ffffff;
                            padding: 4px 8px;
                            border-radius: 6px;
                            font-size: 11px;
                            font-weight: 600;
                            white-space: nowrap;
                            pointer-events: none;
                            opacity: 0;
                            transition: opacity 0.2s ease;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                            border: 1px solid rgba(255,255,255,0.15);
                            z-index: 60;
                        " class="marker-hover-card">
                            ${pin.nombre}
                        </div>
                    `;

                    const bubble = el.querySelector('.marker-bubble') as HTMLElement;
                    const hoverCard = el.querySelector('.marker-hover-card') as HTMLElement;

                    el.addEventListener('mouseenter', () => {
                        if (bubble) bubble.style.transform = 'scale(1.35)';
                        if (hoverCard) hoverCard.style.opacity = '1';
                    });

                    el.addEventListener('mouseleave', () => {
                        if (bubble) bubble.style.transform = isSelected ? 'scale(1.25)' : 'scale(1)';
                        if (hoverCard) hoverCard.style.opacity = '0';
                    });

                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        handleSelectPin(pin);
                    });

                    const marker = new mapboxgl.Marker({ element: el })
                        .setLngLat([pin.lng, pin.lat])
                        .addTo(mapboxMapRef.current!);

                    mapboxMarkersRef.current.push(marker);
                });
            }
        } else if (!useMapbox && leafletMapRef.current && leafletMarkersLayerRef.current) {
            // Fallback Leaflet
            leafletMarkersLayerRef.current.clearLayers();
            const LInstance = leafletLibRef.current;
            if (LInstance) {
                if (isShowingStateBadges) {
                    enrichedEstados.forEach((est) => {
                        if (!est.latitud || !est.longitud) return;
                        const marker = LInstance.circleMarker([est.latitud, est.longitud], {
                            radius: 14,
                            fillColor: '#6366f1',
                            color: '#ffffff',
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 0.9,
                        });
                        marker.bindTooltip(`🏛️ ${est.estado_nombre} (${est.cantidad})`, { direction: 'top' });
                        marker.on('click', () => handleSelectEstado(est));
                        leafletMarkersLayerRef.current?.addLayer(marker);
                    });
                } else {
                    const pinesToRender =
                        selectedEstado !== 'todos'
                            ? filteredPines.filter((p) => cleanText(p.estado_nombre).includes(cleanText(selectedEstado)))
                            : filteredPines;

                    pinesToRender.forEach((pin) => {
                        if (pin.lat === null || pin.lng === null) return;
                        const marker = LInstance.circleMarker([pin.lat, pin.lng], {
                            radius: selectedPin?.id === pin.id ? 10 : 7,
                            fillColor: pin.activa ? '#10b981' : '#f43f5e',
                            color: '#ffffff',
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 0.9,
                        });
                        marker.bindTooltip(pin.nombre, { direction: 'top', offset: [0, -6] });
                        marker.on('click', () => handleSelectPin(pin));
                        leafletMarkersLayerRef.current?.addLayer(marker);
                    });
                }
            }
        }
    }, [useMapbox, viewMode, selectedEstado, enrichedEstados, filteredPines, selectedPin]);

    // Restablecer vista general de Venezuela
    const resetVenezuelaView = () => {
        setSelectedEstado('todos');
        setSelectedPin(null);
        setSelectedZona('todas');
        setSelectedDistrito('todos');
        setSelectedEstatus('todos');
        setSoloCamposBlancos(false);
        setSoloMedios(false);
        setSearchQuery('');
        setStateSearchQuery('');

        if (useMapbox && mapboxMapRef.current) {
            mapboxMapRef.current.flyTo({
                center: [-66.5897, 8.2],
                zoom: 6.2,
                pitch: 0,
                bearing: 0,
                duration: 1500,
            });
            setIs3DMode(false);
        } else if (leafletMapRef.current) {
            leafletMapRef.current.setView([8.2, -66.5897], 6.5);
        }
    };

    // Copiar coordenadas al portapapeles
    const copyCoordinates = (lat: number, lng: number) => {
        navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setCopiedCoords(true);
        setTimeout(() => setCopiedCoords(false), 2000);
    };

    // Pantalla completa nativa
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsNativeFullscreen(true);
            });
        } else {
            document.exitFullscreen().then(() => {
                setIsNativeFullscreen(false);
            });
        }
    };

    // Lista de Zonas ordenadas
    const zonasList = useMemo(() => {
        const set = new Set<string>();
        zonas.forEach((z) => {
            if (z) set.add(String(z).replace(/\D/g, '') || String(z));
        });
        for (let i = 1; i <= 43; i++) set.add(String(i));
        return Array.from(set).sort((a, b) => Number(a) - Number(b));
    }, [zonas]);

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-slate-950 text-foreground flex flex-col select-none font-sans z-50">
            <Head title={__('Explorador Geográfico Nacional - MMM Venezuela')} />

            {/* BARRA SUPERIOR FLOTANTE DE COMANDO (GLASSMORPHISM) */}
            <header className="absolute top-4 left-4 right-4 z-40 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-none">
                {/* Lado Izquierdo: Volver, Modo de Agrupación y Branding */}
                <div className="flex items-center gap-2 pointer-events-auto w-full md:w-auto">
                    <Link href="/admin/extensiones/dashboard">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="gap-2 bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 backdrop-blur-md shadow-2xl text-xs font-semibold h-10 px-3.5 rounded-xl transition-all"
                        >
                            <ArrowLeft className="size-4 text-indigo-400" />
                            <span>{__('Salir')}</span>
                        </Button>
                    </Link>

                    {/* Selector de Modo de Visualización: Por Estados vs Todas las Sedes */}
                    <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-2xl">
                        <button
                            type="button"
                            onClick={() => {
                                setViewMode('estados');
                                setSelectedEstado('todos');
                                setSelectedPin(null);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                viewMode === 'estados'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                            }`}
                            title={__('Agrupar por Estados (1 icono limpio por estado)')}
                        >
                            <MapIcon className="size-3.5" />
                            <span>{__('Por Estados')}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setViewMode('sedes');
                                setSelectedEstado('todos');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                viewMode === 'sedes'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                            }`}
                            title={__('Mostrar todas las 458 sedes simultáneamente')}
                        >
                            <Grid className="size-3.5" />
                            <span>{__('Todas las Sedes')}</span>
                        </button>
                    </div>

                    {/* Badge con logo MMM Venezuela y contador */}
                    <div className="flex items-center gap-2.5 px-3.5 h-10 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-2xl">
                        <img
                            src="/icons/logo_mmm-a-color-sin-fondo.png"
                            alt="MMM Venezuela"
                            className="h-7 w-auto object-contain"
                        />
                        <span className="hidden sm:inline text-xs font-bold text-white tracking-wide">
                            {__('MMM Venezuela')}
                        </span>
                        <span className="text-xs text-slate-500">·</span>
                        <span className="text-xs font-semibold text-indigo-300">
                            {viewMode === 'estados' && selectedEstado === 'todos'
                                ? `${enrichedEstados.length} Estados`
                                : `${filteredPines.length} Sedes`}
                        </span>
                    </div>
                </div>

                {/* Centro: Buscador Flotante Instantáneo */}
                <div className="relative w-full md:w-[380px] pointer-events-auto">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            placeholder={__('Buscar por nombre, pastor, municipio...')}
                            className="pl-9 pr-8 h-10 text-xs bg-slate-900/90 hover:bg-slate-900 text-white placeholder:text-slate-400 border-slate-700/80 rounded-xl backdrop-blur-md shadow-2xl focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Desplegable de Resultados de Búsqueda */}
                    {isSearchFocused && searchResults.length > 0 && (
                        <div
                            className="absolute top-12 left-0 right-0 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden z-50 divide-y divide-slate-800 max-h-72 overflow-y-auto"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            {searchResults.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        handleSelectPin(item);
                                        setIsSearchFocused(false);
                                    }}
                                    className="w-full text-left p-2.5 hover:bg-indigo-950/60 transition-colors flex items-center justify-between gap-3 text-xs"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-white truncate flex items-center gap-1.5">
                                            <Building2 className="size-3.5 text-indigo-400 shrink-0" />
                                            {item.nombre}
                                        </div>
                                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                            👤 {item.pastor} • 📍 {item.ubicacion}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-[10px] font-bold text-indigo-300 bg-indigo-900/50 px-1.5 py-0.5 rounded border border-indigo-700/50">
                                            {item.estado_nombre} · Z{item.zona || '—'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lado Derecho: Capas visuales, 3D, Filtros y Pantalla Completa */}
                <div className="flex items-center gap-2 pointer-events-auto">
                    {/* Selector de Capas Visuales */}
                    <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-2xl">
                        <Button
                            type="button"
                            size="sm"
                            variant={activeStyle === 'satellite' ? 'default' : 'ghost'}
                            onClick={() => changeMapStyle('satellite')}
                            className={`h-8 text-xs font-semibold px-2.5 rounded-lg transition-all ${
                                activeStyle === 'satellite'
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                            }`}
                            title={__('Satélite HD con relieve')}
                        >
                            <Satellite className="size-3.5 mr-1" />
                            <span className="hidden sm:inline">{__('Satélite')}</span>
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            variant={activeStyle === 'dark' ? 'default' : 'ghost'}
                            onClick={() => changeMapStyle('dark')}
                            className={`h-8 text-xs font-semibold px-2.5 rounded-lg transition-all ${
                                activeStyle === 'dark'
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                            }`}
                            title={__('Modo Oscuro Cyber GIS')}
                        >
                            <Moon className="size-3.5 mr-1" />
                            <span className="hidden sm:inline">{__('Oscuro')}</span>
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            variant={activeStyle === 'standard3d' ? 'default' : 'ghost'}
                            onClick={() => changeMapStyle('standard3d')}
                            className={`h-8 text-xs font-semibold px-2.5 rounded-lg transition-all ${
                                activeStyle === 'standard3d'
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                            }`}
                            title={__('Calles 3D y Edificios')}
                        >
                            <Box className="size-3.5 mr-1" />
                            <span className="hidden sm:inline">{__('3D Urbano')}</span>
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            variant={activeStyle === 'outdoors' ? 'default' : 'ghost'}
                            onClick={() => changeMapStyle('outdoors')}
                            className={`h-8 text-xs font-semibold px-2.5 rounded-lg transition-all ${
                                activeStyle === 'outdoors'
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                            }`}
                            title={__('Relieve Topográfico')}
                        >
                            <Mountain className="size-3.5 mr-1" />
                            <span className="hidden sm:inline">{__('Relieve')}</span>
                        </Button>
                    </div>

                    {/* Botón Perspectiva 3D */}
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={toggle3DMode}
                        className={`h-10 px-3 rounded-xl border backdrop-blur-md shadow-2xl text-xs font-bold transition-all ${
                            is3DMode
                                ? 'bg-indigo-600 text-white border-indigo-500'
                                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                        }`}
                        title={__('Alternar inclinación 3D')}
                    >
                        <Compass className={`size-4 mr-1 ${is3DMode ? 'rotate-45 text-white' : 'text-slate-400'}`} />
                        <span>{is3DMode ? '3D' : '2D'}</span>
                    </Button>

                    {/* Botón Filtros */}
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                        className={`h-10 px-3 text-xs font-semibold rounded-xl border backdrop-blur-md shadow-2xl transition-all ${
                            showFiltersPanel ||
                            selectedZona !== 'todas' ||
                            selectedDistrito !== 'todos' ||
                            selectedEstatus !== 'todos' ||
                            soloCamposBlancos ||
                            soloMedios
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500'
                                : 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700/80'
                        }`}
                    >
                        <Filter className="size-3.5 text-indigo-300 mr-1.5" />
                        <span className="hidden sm:inline">{__('Filtros')}</span>
                    </Button>

                    {/* Botón Reestablecer Vista */}
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={resetVenezuelaView}
                        className="size-10 p-0 bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 rounded-xl backdrop-blur-md shadow-2xl"
                        title={__('Centrar Mapa en Venezuela')}
                    >
                        <RotateCcw className="size-4 text-slate-300" />
                    </Button>

                    {/* Botón Pantalla Completa */}
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="size-10 p-0 bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 rounded-xl backdrop-blur-md shadow-2xl"
                        title={__('Pantalla Completa')}
                    >
                        {isNativeFullscreen ? (
                            <Minimize2 className="size-4 text-indigo-400" />
                        ) : (
                            <Maximize2 className="size-4 text-indigo-400" />
                        )}
                    </Button>
                </div>
            </header>

            {/* BARRA DE ESTADO ACTIVO (Si se ha presionado un estado para ver sus extensiones) */}
            {selectedEstado !== 'todos' && (
                <div className="absolute top-18 left-4 z-40 flex items-center gap-2 pointer-events-auto">
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleBackToVenezuela}
                        className="bg-indigo-600/95 hover:bg-indigo-500 text-white font-bold text-xs h-9 px-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-1.5 border border-indigo-400/40 transition-all transform hover:scale-105"
                    >
                        <ArrowLeft className="size-3.5" />
                        <span>{__('Ver Todo el País')}</span>
                    </Button>

                    <div className="bg-slate-900/90 border border-indigo-500/40 rounded-xl px-3 h-9 flex items-center gap-2 shadow-2xl backdrop-blur-md text-xs">
                        <span className="size-2 rounded-full bg-indigo-400 animate-ping" />
                        <span className="font-extrabold text-white">Estado {selectedEstado}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-indigo-300 font-semibold">
                            {activeStateChurches.length} {__('Extensiones')}
                        </span>
                    </div>
                </div>
            )}

            {/* PANEL FLOTANTE DE FILTROS AVANZADOS */}
            {showFiltersPanel && (
                <div className="absolute top-18 right-4 z-40 w-84 max-w-[calc(100vw-32px)] bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl space-y-3.5 text-xs text-slate-200">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="font-bold text-white flex items-center gap-1.5 text-sm">
                            <Filter className="size-4 text-indigo-400" />
                            {__('Filtros Territoriales')}
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowFiltersPanel(false)}
                            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    {/* Selector de Estado */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-400">{__('Filtrar por Estado')}</label>
                        <select
                            value={selectedEstado}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'todos') {
                                    handleBackToVenezuela();
                                } else {
                                    const match = enrichedEstados.find((es) => es.estado_nombre === val);
                                    if (match) handleSelectEstado(match);
                                    else setSelectedEstado(val);
                                }
                            }}
                            className="w-full h-9 text-xs bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 text-white focus:outline-none focus:border-indigo-500"
                        >
                            <option value="todos">{__('Todos los Estados')} ({enrichedEstados.length})</option>
                            {enrichedEstados.map((est) => (
                                <option key={est.estado_nombre} value={est.estado_nombre}>
                                    {est.estado_nombre} ({est.cantidad} sedes)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de Zona y Distrito */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-400">{__('Zona')}</label>
                            <select
                                value={selectedZona}
                                onChange={(e) => setSelectedZona(e.target.value)}
                                className="w-full h-9 text-xs bg-slate-950 border border-slate-700/80 rounded-lg px-2 text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="todas">{__('Todas las Zonas')}</option>
                                {zonasList.map((z) => (
                                    <option key={z} value={z}>
                                        {__('Zona')} {z}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-400">{__('Distrito')}</label>
                            <select
                                value={selectedDistrito}
                                onChange={(e) => setSelectedDistrito(e.target.value)}
                                className="w-full h-9 text-xs bg-slate-950 border border-slate-700/80 rounded-lg px-2 text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="todos">{__('Todos los Distritos')}</option>
                                {[1, 2, 3, 4, 5].map((d) => (
                                    <option key={d} value={String(d)}>
                                        {__('Distrito')} {d}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Selector de Estatus */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-400">{__('Estatus')}</label>
                        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                            {[
                                { key: 'todos', label: __('Todas') },
                                { key: 'activa', label: __('Activas') },
                                { key: 'inactiva', label: __('Inactivas') },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setSelectedEstatus(tab.key)}
                                    className={`py-1 text-[11px] font-bold rounded-md transition-colors ${
                                        selectedEstatus === tab.key
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toggles Adicionales */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                            <input
                                type="checkbox"
                                checked={soloCamposBlancos}
                                onChange={(e) => setSoloCamposBlancos(e.target.checked)}
                                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{__('Solo con Campos Blancos')}</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                            <input
                                type="checkbox"
                                checked={soloMedios}
                                onChange={(e) => setSoloMedios(e.target.checked)}
                                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{__('Con medios de comunicación')}</span>
                        </label>
                    </div>

                    {/* Botón Restablecer */}
                    <div className="pt-2 border-t border-slate-800 flex justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={resetVenezuelaView}
                            className="h-7 text-xs text-indigo-400 hover:text-indigo-300 p-0"
                        >
                            {__('Limpiar Filtros')}
                        </Button>
                    </div>
                </div>
            )}

            {/* CONTENEDOR 100% FULLSCREEN DEL MAPA */}
            <main className="w-full h-full flex-1 relative">
                <div ref={mapContainerRef} className="w-full h-full" />

                {/* INSIGNIA INFERIOR IZQUIERDA CON ESTADÍSTICAS RÁPIDAS */}
                <div className="absolute bottom-5 left-5 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-2xl flex items-center gap-3.5 text-xs text-white">
                    <div className="flex items-center gap-1.5 font-bold">
                        <MapPin className="size-4 text-indigo-400" />
                        <span>
                            {viewMode === 'estados' && selectedEstado === 'todos'
                                ? `${enrichedEstados.length} Estados`
                                : `${filteredPines.length} Sedes`}
                        </span>
                    </div>

                    <div className="h-3.5 w-px bg-slate-700" />

                    <div className="flex items-center gap-3 text-[11px] font-medium">
                        <div className="flex items-center gap-1 text-emerald-400">
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{validPines.filter((p) => p.activa).length} {__('Activas')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-purple-400">
                            <span>{validPines.reduce((a, b) => a + b.campos_blancos, 0)} {__('Campos Blancos')}</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* PANEL LATERAL IZQUIERDO: LISTADO DE IGLESIAS DEL ESTADO ACTIVO */}
            {selectedEstado !== 'todos' && !selectedPin && (
                <aside className="absolute top-28 left-4 bottom-5 z-40 w-80 sm:w-96 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden text-slate-100">
                    <div className="p-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                            <img
                                src="/icons/logo_mmm-a-color-sin-fondo.png"
                                alt="MMM"
                                className="size-8 object-contain shrink-0"
                            />
                            <div>
                                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                                    <span>Estado {selectedEstado}</span>
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    {activeStateChurches.length} {__('sedes en este estado')}
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleBackToVenezuela}
                            className="h-8 text-xs text-slate-400 hover:text-white"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>

                    {/* Buscador dentro del estado */}
                    <div className="p-2.5 border-b border-slate-800">
                        <Input
                            type="search"
                            value={stateSearchQuery}
                            onChange={(e) => setStateSearchQuery(e.target.value)}
                            placeholder={`${__('Filtrar iglesias en')} ${selectedEstado}...`}
                            className="h-8 text-xs bg-slate-950 border-slate-700 rounded-lg text-white"
                        />
                    </div>

                    {/* Lista scrollable de iglesias */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 p-1">
                        {activeStateChurches.map((pin) => (
                            <button
                                key={pin.id}
                                type="button"
                                onClick={() => handleSelectPin(pin)}
                                className="w-full text-left p-2.5 rounded-xl hover:bg-indigo-950/50 transition-all flex items-center justify-between gap-2.5 group"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="font-bold text-xs text-white group-hover:text-indigo-300 truncate">
                                        {pin.nombre}
                                    </div>
                                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                        👤 {pin.pastor}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate">
                                        📍 {pin.municipio_nombre || pin.ubicacion}
                                    </div>
                                </div>
                                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                    <span className="text-[10px] font-bold text-indigo-300 bg-indigo-900/50 px-1.5 py-0.5 rounded border border-indigo-700/50">
                                        Z{pin.zona || '—'}
                                    </span>
                                    {pin.campos_blancos > 0 && (
                                        <span className="text-[9px] font-bold text-purple-300 bg-purple-900/50 px-1 py-0.2 rounded">
                                            +{pin.campos_blancos} cb
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}

                        {activeStateChurches.length === 0 && (
                            <div className="p-6 text-center text-xs text-slate-400">
                                {__('No se encontraron extensiones con ese criterio.')}
                            </div>
                        )}
                    </div>
                </aside>
            )}

            {/* PANEL LATERAL DERECHO / DRAWER FLOTANTE DE LA IGLESIA SELECCIONADA */}
            {selectedPin && (
                <aside
                    className={`absolute top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] bg-slate-900/95 border-l border-slate-700/80 shadow-2xl backdrop-blur-2xl flex flex-col transform transition-transform duration-300 ease-out text-slate-100 ${
                        isDrawerCollapsed ? 'translate-x-[calc(100%-48px)]' : 'translate-x-0'
                    }`}
                >
                    {/* Botón de Colapsar / Expandir */}
                    <button
                        type="button"
                        onClick={() => setIsDrawerCollapsed(!isDrawerCollapsed)}
                        className="hidden sm:flex absolute -left-10 top-1/2 -translate-y-1/2 size-10 bg-slate-900/95 border-l border-t border-b border-slate-700 rounded-l-xl items-center justify-center text-slate-300 hover:text-white shadow-xl"
                        title={isDrawerCollapsed ? __('Expandir Ficha') : __('Colapsar')}
                    >
                        {isDrawerCollapsed ? '◀' : '▶'}
                    </button>

                    {/* Cabecera del Panel */}
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/70">
                        <img
                            src="/icons/logo_mmm-a-color-sin-fondo.png"
                            alt="MMM"
                            className="size-9 object-contain shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge
                                    variant={selectedPin.activa ? 'default' : 'destructive'}
                                    className="text-[10px] h-5 font-bold uppercase tracking-wider"
                                >
                                    {selectedPin.activa ? __('ACTIVA') : __('INACTIVA')}
                                </Badge>
                                <span className="text-[11px] text-slate-400 font-mono font-bold">
                                    Zona {selectedPin.zona || '—'} · Dist. {selectedPin.distrito || '—'}
                                </span>
                            </div>
                            <h2 className="text-base font-extrabold text-white truncate" title={selectedPin.nombre}>
                                {selectedPin.nombre}
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedPin(null)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title={__('Cerrar')}
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Contenido Detallado con Scroll */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs divide-y divide-slate-800/80">
                        {/* Tarjeta del Pastor */}
                        <div className="pt-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                {__('Pastor a Cargo')}
                            </span>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                                <Avatar className="size-12 border border-indigo-500/40 shrink-0">
                                    {selectedPin.pastor_foto && <AvatarImage src={selectedPin.pastor_foto} className="object-cover" />}
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-xs">
                                        {selectedPin.pastor?.substring(0, 2).toUpperCase() || 'P'}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                    <div className="font-bold text-sm text-white truncate">
                                        {selectedPin.pastor}
                                    </div>
                                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                        {selectedPin.pastor_telefono || selectedPin.telefono || __('Sin teléfono registrado')}
                                    </div>
                                </div>

                                {(selectedPin.pastor_telefono || selectedPin.telefono) && (
                                    <div className="flex items-center gap-1 shrink-0">
                                        <a
                                            href={`https://wa.me/${(selectedPin.pastor_telefono || selectedPin.telefono)?.replace(/\D/g, '')}?text=Dios%20le%20bendiga%20Pastor`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                                            title={__('Enviar WhatsApp')}
                                        >
                                            <MessageCircle className="size-4" />
                                        </a>
                                        <a
                                            href={`tel:${selectedPin.pastor_telefono || selectedPin.telefono}`}
                                            className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                                            title={__('Llamar')}
                                        >
                                            <Phone className="size-4" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Métricas de Membresía y Obras */}
                        <div className="pt-3.5 space-y-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                {__('Membresía y Congregación')}
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                                    <div className="text-[11px] text-emerald-400 font-semibold">{__('Miembros Activos')}</div>
                                    <div className="text-lg font-extrabold text-white mt-0.5">
                                        {selectedPin.miembros_activos.toLocaleString()}
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                                    <div className="text-[11px] text-amber-400 font-semibold">{__('Miembros Probantes')}</div>
                                    <div className="text-lg font-extrabold text-white mt-0.5">
                                        {selectedPin.miembros_probantes.toLocaleString()}
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                                    <div className="text-[11px] text-purple-400 font-semibold">{__('Campos Blancos')}</div>
                                    <div className="text-lg font-extrabold text-white mt-0.5">
                                        {selectedPin.campos_blancos}
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                                    <div className="text-[11px] text-blue-400 font-semibold">{__('Total Miembros')}</div>
                                    <div className="text-lg font-extrabold text-white mt-0.5">
                                        {selectedPin.total_miembros.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ubicación y Dirección */}
                        <div className="pt-3.5 space-y-2.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                {__('Datos Geográficos y Condición')}
                            </span>
                            <div className="space-y-1.5 text-slate-300">
                                <div>
                                    <strong className="text-slate-400">{__('Estado / Municipio:')}</strong> {selectedPin.ubicacion}
                                </div>
                                {selectedPin.parroquia_nombre && (
                                    <div>
                                        <strong className="text-slate-400">{__('Parroquia:')}</strong> {selectedPin.parroquia_nombre}
                                    </div>
                                )}
                                {selectedPin.sector && (
                                    <div>
                                        <strong className="text-slate-400">{__('Sector:')}</strong> {selectedPin.sector}
                                    </div>
                                )}
                                <div>
                                    <strong className="text-slate-400">{__('Condición de Inmueble:')}</strong> {selectedPin.tipo_local}
                                </div>
                                {selectedPin.posee_medio && (
                                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold pt-1">
                                        <Radio className="size-3.5" />
                                        <span>{__('Cuenta con Medio de Comunicación (Radio/TV)')}</span>
                                    </div>
                                )}
                                {selectedPin.direccion && (
                                    <div className="pt-1 text-[11px] text-slate-400 italic">
                                        📍 {selectedPin.direccion}
                                    </div>
                                )}
                                {selectedPin.lat !== null && selectedPin.lng !== null && (
                                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                                        <span>GPS: {selectedPin.lat.toFixed(5)}, {selectedPin.lng.toFixed(5)}</span>
                                        <button
                                            type="button"
                                            onClick={() => copyCoordinates(selectedPin.lat!, selectedPin.lng!)}
                                            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[10px]"
                                            title={__('Copiar coordenadas')}
                                        >
                                            {copiedCoords ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                                            <span>{copiedCoords ? __('Copiado') : __('Copiar')}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pie del Panel con Botones de Acción */}
                    <div className="p-4 border-t border-slate-800 bg-slate-950/70 space-y-2">
                        {selectedPin.lat !== null && selectedPin.lng !== null && (
                            <div className="grid grid-cols-2 gap-2">
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPin.lat},${selectedPin.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
                                >
                                    <Navigation className="size-3.5" />
                                    <span>Google Maps</span>
                                    <ExternalLink className="size-3 ml-auto opacity-70" />
                                </a>
                                <a
                                    href={`https://waze.com/ul?ll=${selectedPin.lat},${selectedPin.lng}&navigate=yes`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg transition-all"
                                >
                                    <Compass className="size-3.5" />
                                    <span>Waze GPS</span>
                                    <ExternalLink className="size-3 ml-auto opacity-70" />
                                </a>
                            </div>
                        )}

                        <Link
                            href={`/admin/extensiones/${selectedPin.id}/edit`}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
                        >
                            <Building2 className="size-4" />
                            {__('Ver / Editar Ficha de Extensión')}
                        </Link>
                    </div>
                </aside>
            )}
        </div>
    );
}
