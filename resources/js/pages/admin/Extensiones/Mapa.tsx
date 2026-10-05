import React, { useEffect, useRef, useState, useMemo } from 'react';
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
    Sparkles
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
    cantidad: number;
}

interface MapaPageProps {
    pines: PinExtension[];
    estados: EstadoOption[];
    zonas: string[];
}

type MapLayerStyle = 'streets' | 'satellite' | 'dark';

const cleanText = (str?: string) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
};

export default function ExtensionesMapaPage({ pines = [], estados = [], zonas = [] }: MapaPageProps) {
    const { __ } = useTranslate();
    const pageProps = usePage().props as any;

    const mapboxApiKey = pageProps.mapbox_api_key || pageProps.auth?.user?.empresa?.mapbox_api_key;
    const mapboxActive = pageProps.mapbox_active !== undefined ? pageProps.mapbox_active : pageProps.auth?.user?.empresa?.mapbox_active;

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapboxMapRef = useRef<mapboxgl.Map | null>(null);
    const mapboxMarkersRef = useRef<mapboxgl.Marker[]>([]);

    const leafletMapRef = useRef<L.Map | null>(null);
    const leafletMarkersLayerRef = useRef<L.LayerGroup | null>(null);
    const leafletLibRef = useRef<any>(null);

    // Estados de filtros y búsqueda
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [selectedEstado, setSelectedEstado] = useState<string>('todos');
    const [selectedZona, setSelectedZona] = useState<string>('todas');
    const [selectedDistrito, setSelectedDistrito] = useState<string>('todos');
    const [selectedEstatus, setSelectedEstatus] = useState<string>('todos'); // 'todos', 'activa', 'inactiva'
    const [soloCamposBlancos, setSoloCamposBlancos] = useState<boolean>(false);

    // Capa visual del mapa y vista
    const [activeStyle, setActiveStyle] = useState<MapLayerStyle>('streets');
    const [selectedPin, setSelectedPin] = useState<PinExtension | null>(null);
    const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);
    const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);
    const [useMapbox, setUseMapbox] = useState<boolean>(true);

    // Pines con coordenadas numéricas válidas
    const validPines = useMemo(() => {
        return pines.filter(
            (p) => p.lat !== null && p.lng !== null && !isNaN(Number(p.lat)) && !isNaN(Number(p.lng))
        );
    }, [pines]);

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

            // Filtro por Búsqueda de texto (si se aplica directamente)
            if (searchQuery.trim().length > 1) {
                const q = cleanText(searchQuery);
                const matchNombre = cleanText(pin.nombre).includes(q);
                const matchPastor = cleanText(pin.pastor).includes(q);
                const matchUbicacion = cleanText(pin.ubicacion).includes(q);
                const matchSector = cleanText(pin.sector).includes(q);
                if (!matchNombre && !matchPastor && !matchUbicacion && !matchSector) return false;
            }

            return true;
        });
    }, [validPines, selectedEstado, selectedZona, selectedDistrito, selectedEstatus, soloCamposBlancos, searchQuery]);

    // Resultados de búsqueda instantánea para el desplegable
    const searchResults = useMemo(() => {
        if (!searchQuery || searchQuery.trim().length < 2) return [];
        const q = cleanText(searchQuery);
        return validPines
            .filter((pin) => {
                return (
                    cleanText(pin.nombre).includes(q) ||
                    cleanText(pin.pastor).includes(q) ||
                    cleanText(pin.ubicacion).includes(q) ||
                    cleanText(pin.sector).includes(q) ||
                    cleanText(pin.zona).includes(q)
                );
            })
            .slice(0, 7);
    }, [validPines, searchQuery]);

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

            const getStyleUrl = (style: MapLayerStyle) => {
                switch (style) {
                    case 'satellite':
                        return 'mapbox://styles/mapbox/satellite-streets-v12';
                    case 'dark':
                        return 'mapbox://styles/mapbox/dark-v11';
                    case 'streets':
                    default:
                        return 'mapbox://styles/mapbox/streets-v12';
                }
            };

            const map = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: getStyleUrl(activeStyle),
                center: [-66.5897, 8.2], // Centro geográfico equilibrado de Venezuela
                zoom: 6,
            });

            // Controles de navegación nativos
            map.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }), 'bottom-right');
            mapboxMapRef.current = map;
        } else {
            // Fallback Leaflet / OpenStreetMap
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

                LInstance.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors',
                    maxZoom: 19,
                }).addTo(map);

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

    // Cambio dinámico de capa visual en Mapbox
    const changeMapStyle = (newStyle: MapLayerStyle) => {
        setActiveStyle(newStyle);
        if (useMapbox && mapboxMapRef.current) {
            let url = 'mapbox://styles/mapbox/streets-v12';
            if (newStyle === 'satellite') url = 'mapbox://styles/mapbox/satellite-streets-v12';
            if (newStyle === 'dark') url = 'mapbox://styles/mapbox/dark-v11';
            mapboxMapRef.current.setStyle(url);
        }
    };

    // Renderizar Pines y Eventos
    useEffect(() => {
        if (useMapbox && mapboxMapRef.current) {
            // Limpiar marcadores anteriores
            mapboxMarkersRef.current.forEach((m) => m.remove());
            mapboxMarkersRef.current = [];

            filteredPines.forEach((pin) => {
                if (pin.lat === null || pin.lng === null) return;

                const el = document.createElement('div');
                const isSelected = selectedPin?.id === pin.id;
                el.className = `cursor-pointer transition-all duration-300 transform hover:scale-125 ${isSelected ? 'scale-125 z-50' : 'z-10'}`;

                // Marcador con pin SVG de alta calidad
                el.innerHTML = `
                    <div style="
                        position: relative;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: ${isSelected ? '36px' : '28px'};
                        height: ${isSelected ? '36px' : '28px'};
                        border-radius: 50%;
                        background-color: ${pin.activa ? '#10b981' : '#f43f5e'};
                        border: ${isSelected ? '3px solid #ffffff' : '2px solid #ffffff'};
                        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
                    ">
                        <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? '18' : '14'}" height="${isSelected ? '18' : '14'}" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                        </svg>
                        ${pin.campos_blancos > 0 ? `
                            <span style="
                                position: absolute;
                                top: -4px;
                                right: -4px;
                                background-color: #8b5cf6;
                                color: #ffffff;
                                font-size: 9px;
                                font-weight: 800;
                                width: 14px;
                                height: 14px;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                border: 1.5px solid #ffffff;
                            ">+${pin.campos_blancos}</span>
                        ` : ''}
                    </div>
                `;

                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleSelectPin(pin);
                });

                const marker = new mapboxgl.Marker({ element: el })
                    .setLngLat([pin.lng, pin.lat])
                    .addTo(mapboxMapRef.current!);

                mapboxMarkersRef.current.push(marker);
            });
        } else if (!useMapbox && leafletMapRef.current && leafletMarkersLayerRef.current) {
            leafletMarkersLayerRef.current.clearLayers();
            const LInstance = leafletLibRef.current;
            if (LInstance) {
                filteredPines.forEach((pin) => {
                    if (pin.lat === null || pin.lng === null) return;
                    const marker = LInstance.marker([pin.lat, pin.lng]);
                    marker.on('click', () => handleSelectPin(pin));
                    leafletMarkersLayerRef.current?.addLayer(marker);
                });
            }
        }
    }, [useMapbox, filteredPines, selectedPin]);

    // Seleccionar iglesia y volar suavemente a ella
    const handleSelectPin = (pin: PinExtension) => {
        setSelectedPin(pin);

        if (useMapbox && mapboxMapRef.current && pin.lng !== null && pin.lat !== null) {
            mapboxMapRef.current.flyTo({
                center: [pin.lng, pin.lat],
                zoom: 14,
                duration: 1200,
                essential: true,
            });
        } else if (!useMapbox && leafletMapRef.current && pin.lat !== null && pin.lng !== null) {
            leafletMapRef.current.setView([pin.lat, pin.lng], 14, { animate: true });
        }
    };

    // Restablecer vista general de Venezuela
    const resetVenezuelaView = () => {
        setSelectedPin(null);
        setSelectedEstado('todos');
        setSelectedZona('todas');
        setSelectedDistrito('todos');
        setSelectedEstatus('todos');
        setSoloCamposBlancos(false);
        setSearchQuery('');

        if (useMapbox && mapboxMapRef.current) {
            mapboxMapRef.current.flyTo({
                center: [-66.5897, 8.2],
                zoom: 6,
                duration: 1400,
            });
        } else if (leafletMapRef.current) {
            leafletMapRef.current.setView([8.2, -66.5897], 6.5);
        }
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
        <div className="h-screen w-screen overflow-hidden bg-slate-950 text-foreground relative flex flex-col select-none font-sans">
            <Head title={__('Explorador Geográfico de Extensiones - MMM Venezuela')} />

            {/* BARRA SUPERIOR FLOTANTE DE COMANDO (GLASSMORPHISM) */}
            <div className="absolute top-4 left-4 right-4 z-40 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-none">
                {/* Lado Izquierdo: Volver y Branding */}
                <div className="flex items-center gap-2 pointer-events-auto w-full md:w-auto">
                    <Link href="/admin/extensiones/dashboard">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="gap-2 bg-slate-900/90 hover:bg-slate-900 text-white border border-slate-700/60 backdrop-blur-md shadow-xl text-xs font-semibold h-9 rounded-xl transition-all"
                        >
                            <ArrowLeft className="size-4 text-indigo-400" />
                            <span className="hidden sm:inline">{__('Volver al Dashboard')}</span>
                        </Button>
                    </Link>

                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/85 border border-slate-700/60 backdrop-blur-md shadow-xl">
                        <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-white tracking-wide">
                            {__('MMM Venezuela')}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-semibold text-indigo-300">
                            {filteredPines.length} {__('Sedes')}
                        </span>
                    </div>
                </div>

                {/* Centro: Buscador Flotante Instantáneo */}
                <div className="relative w-full md:w-[380px] pointer-events-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            placeholder={__('Buscar iglesia, pastor, municipio, zona...')}
                            className="pl-9 pr-8 h-9 text-xs bg-slate-900/90 hover:bg-slate-900 text-white placeholder:text-slate-400 border-slate-700/60 rounded-xl backdrop-blur-md shadow-xl focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Desplegable de Resultados de Búsqueda */}
                    {isSearchFocused && searchResults.length > 0 && (
                        <div
                            className="absolute top-11 left-0 right-0 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-lg overflow-hidden z-50 divide-y divide-slate-800"
                            onMouseDown={(e) => e.preventDefault()} // Evita desenfocar antes del clic
                        >
                            {searchResults.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        handleSelectPin(item);
                                        setIsSearchFocused(false);
                                    }}
                                    className="w-full text-left p-2.5 hover:bg-indigo-950/50 transition-colors flex items-center justify-between gap-3 text-xs"
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
                                        <span className="text-[10px] font-bold text-indigo-300 bg-indigo-900/40 px-1.5 py-0.5 rounded border border-indigo-700/40">
                                            Zona {item.zona || '—'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lado Derecho: Filtros, Capas y Vista Completa */}
                <div className="flex items-center gap-2 pointer-events-auto">
                    {/* Botón de Filtros */}
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                        className={`gap-1.5 h-9 text-xs font-semibold rounded-xl border backdrop-blur-md shadow-xl transition-all ${
                            showFiltersPanel || selectedEstado !== 'todos' || selectedZona !== 'todas' || selectedDistrito !== 'todos' || selectedEstatus !== 'todos'
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500'
                                : 'bg-slate-900/90 hover:bg-slate-900 text-white border-slate-700/60'
                        }`}
                    >
                        <Filter className="size-3.5 text-indigo-300" />
                        <span>{__('Filtros')}</span>
                        {(selectedEstado !== 'todos' || selectedZona !== 'todas' || selectedDistrito !== 'todos' || selectedEstatus !== 'todos') && (
                            <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                    </Button>

                    {/* Selector de Capas */}
                    <div className="hidden sm:flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md shadow-xl">
                        <Button
                            type="button"
                            size="sm"
                            variant={activeStyle === 'streets' ? 'default' : 'ghost'}
                            onClick={() => changeMapStyle('streets')}
                            className="h-8 text-xs font-semibold px-2.5 rounded-lg text-white"
                            title={__('Vista Calles')}
                        >
                            <Compass className="size-3.5 mr-1" />
                            {__('Calles')}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={activeStyle === 'satellite' ? 'default' : 'ghost'}
                            onClick={() => changeMapStyle('satellite')}
                            className="h-8 text-xs font-semibold px-2.5 rounded-lg text-white"
                            title={__('Vista Satélite de Alta Resolución')}
                        >
                            <Satellite className="size-3.5 mr-1" />
                            {__('Satélite')}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={activeStyle === 'dark' ? 'default' : 'ghost'}
                            onClick={() => changeMapStyle('dark')}
                            className="h-8 text-xs font-semibold px-2.5 rounded-lg text-white"
                            title={__('Modo Oscuro')}
                        >
                            <Moon className="size-3.5 mr-1" />
                            {__('Oscuro')}
                        </Button>
                    </div>

                    {/* Botón Reestablecer Vista */}
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={resetVenezuelaView}
                        className="size-9 p-0 bg-slate-900/90 hover:bg-slate-900 text-white border border-slate-700/60 rounded-xl backdrop-blur-md shadow-xl"
                        title={__('Centrar Mapa en Venezuela')}
                    >
                        <RotateCcw className="size-4 text-slate-300" />
                    </Button>

                    {/* Botón Pantalla Completa Nativa */}
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="size-9 p-0 bg-slate-900/90 hover:bg-slate-900 text-white border border-slate-700/60 rounded-xl backdrop-blur-md shadow-xl"
                        title={__('Pantalla Completa Nativa')}
                    >
                        {isNativeFullscreen ? (
                            <Minimize2 className="size-4 text-indigo-400" />
                        ) : (
                            <Maximize2 className="size-4 text-indigo-400" />
                        )}
                    </Button>
                </div>
            </div>

            {/* PANEL FLOTANTE DE FILTROS AVANZADOS */}
            {showFiltersPanel && (
                <div className="absolute top-18 right-4 z-40 w-80 max-w-[calc(100vw-32px)] bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl space-y-3.5 text-xs text-slate-200">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="font-bold text-white flex items-center gap-1.5 text-sm">
                            <Filter className="size-4 text-indigo-400" />
                            {__('Filtros Territoriales')}
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowFiltersPanel(false)}
                            className="text-slate-400 hover:text-white"
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    {/* Selector de Estado */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-400">{__('Estado Geográfico')}</label>
                        <select
                            value={selectedEstado}
                            onChange={(e) => setSelectedEstado(e.target.value)}
                            className="w-full h-8 text-xs bg-slate-950 border border-slate-700 rounded-lg px-2 text-white focus:outline-none focus:border-indigo-500"
                        >
                            <option value="todos">{__('Todos los Estados')} ({validPines.length})</option>
                            {estados.map((est) => (
                                <option key={est.estado_nombre} value={est.estado_nombre}>
                                    {est.estado_nombre} ({est.cantidad})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de Zona */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-400">{__('Zona Ministerial')}</label>
                            <select
                                value={selectedZona}
                                onChange={(e) => setSelectedZona(e.target.value)}
                                className="w-full h-8 text-xs bg-slate-950 border border-slate-700 rounded-lg px-2 text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="todas">{__('Todas las Zonas')}</option>
                                {zonasList.map((z) => (
                                    <option key={z} value={z}>
                                        {__('Zona')} {z}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Selector de Distrito */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-400">{__('Distrito')}</label>
                            <select
                                value={selectedDistrito}
                                onChange={(e) => setSelectedDistrito(e.target.value)}
                                className="w-full h-8 text-xs bg-slate-950 border border-slate-700 rounded-lg px-2 text-white focus:outline-none focus:border-indigo-500"
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
                        <label className="text-[11px] font-semibold text-slate-400">{__('Estatus de la Sede')}</label>
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

                    {/* Toggle Campos Blancos */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={soloCamposBlancos}
                                onChange={(e) => setSoloCamposBlancos(e.target.checked)}
                                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                            />
                            {__('Solo con Campos Blancos')}
                        </label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={resetVenezuelaView}
                            className="h-6 text-[10px] text-indigo-400 hover:text-indigo-300 p-0"
                        >
                            {__('Restablecer')}
                        </Button>
                    </div>
                </div>
            )}

            {/* CONTENEDOR PRINCIPAL DEL MAPA (CANVAS 100% FULLSCREEN) */}
            <div className="flex-1 w-full h-full relative">
                <div ref={mapContainerRef} className="w-full h-full" />

                {/* INSIGNIA INFERIOR IZQUIERDA CON ESTADÍSTICAS RÁPIDAS */}
                <div className="absolute bottom-5 left-5 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-2.5 shadow-xl flex items-center gap-3.5 text-xs text-white">
                    <div className="flex items-center gap-1.5 font-bold">
                        <MapPin className="size-4 text-indigo-400" />
                        <span>{filteredPines.length} {__('Mostradas')}</span>
                    </div>

                    <div className="h-3.5 w-px bg-slate-700" />

                    <div className="flex items-center gap-3 text-[11px] font-medium">
                        <div className="flex items-center gap-1 text-emerald-400">
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{filteredPines.filter((p) => p.activa).length} {__('Activas')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-rose-400">
                            <span className="size-2 rounded-full bg-rose-500" />
                            <span>{filteredPines.filter((p) => !p.activa).length} {__('Inactivas')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* PANEL LATERAL DESLIZABLE (SLIDE-OVER DRAWER DE LA IGLESIA SELECCIONADA) */}
            {selectedPin && (
                <div className="absolute top-0 right-0 bottom-0 z-50 w-full sm:w-[390px] bg-slate-900/95 border-l border-slate-700/80 shadow-2xl backdrop-blur-2xl flex flex-col transform transition-transform duration-300 ease-out text-slate-100">
                    {/* Cabecera del Panel */}
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/60">
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
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
                                <Avatar className="size-11 border border-indigo-500/30 shrink-0">
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
                                            href={`https://wa.me/${(selectedPin.pastor_telefono || selectedPin.telefono)?.replace(/\D/g, '')}`}
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
                                {selectedPin.direccion && (
                                    <div className="pt-1 text-[11px] text-slate-400 italic">
                                        📍 {selectedPin.direccion}
                                    </div>
                                )}
                                <div className="pt-1 text-[10px] text-slate-500 font-mono">
                                    Coords: {selectedPin.lat?.toFixed(5)}, {selectedPin.lng?.toFixed(5)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pie del Panel con Botones de Acción */}
                    <div className="p-4 border-t border-slate-800 bg-slate-950/70 space-y-2">
                        {selectedPin.lat !== null && selectedPin.lng !== null && (
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPin.lat},${selectedPin.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
                            >
                                <Navigation className="size-4" />
                                {__('Cómo Llegar (Google Maps / GPS)')}
                                <ExternalLink className="size-3.5 ml-auto" />
                            </a>
                        )}

                        <Link
                            href={`/admin/extensiones/${selectedPin.id}/edit`}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
                        >
                            <Building2 className="size-4" />
                            {__('Ver / Editar Ficha de Extensión')}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
