import React, { useState, useMemo } from 'react';
import { useForm, Link } from '@inertiajs/react';
import {
    Building2,
    MapPin,
    Users,
    Radio,
    ArrowLeft,
    ArrowRight,
    Save,
    Check,
    Plus,
    Trash2,
    ShoppingBag,
    HelpCircle,
    Info,
    Tv
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select2, Select2Option } from '@/components/ui/select2';
import { Badge } from '@/components/ui/badge';
import LocationMapPicker, { GeocodedAddressDetails } from '@/components/location-map-picker';
import { useTranslate } from '@/hooks/use-translate';

interface Pastor {
    id: number;
    nombre_completo: string;
    zona?: string;
    distrito?: string;
}

interface Estado {
    id: number;
    nombre: string;
}

interface Municipio {
    id: number;
    estado_id: number;
    nombre: string;
}

interface Parroquia {
    id: number;
    municipio_id: number;
    nombre: string;
}

interface TipoLocal {
    id: number;
    nombre: string;
}

interface MediaItem {
    cual: string;
    donde: string;
    nota?: string;
}

interface ExtensionFormWizardProps {
    extension?: any;
    pastores: Pastor[];
    estados: Estado[];
    municipios: Municipio[];
    parroquias: Parroquia[];
    tiposLocal: TipoLocal[];
    isEditing?: boolean;
}

export default function ExtensionFormWizard({
    extension,
    pastores = [],
    estados = [],
    municipios = [],
    parroquias = [],
    tiposLocal = [],
    isEditing = false,
}: ExtensionFormWizardProps) {
    const { __ } = useTranslate();
    const [currentStep, setCurrentStep] = useState<number>(1);

    // Estado local para agregar items al "carrito" de medios de comunicación
    const initialMedios: MediaItem[] = extension?.medios_lista && Array.isArray(extension.medios_lista)
        ? extension.medios_lista
        : (extension?.posee_medio_comunicacion && (extension?.nombre_medio_comunicacion || extension?.medio_comunicacion))
            ? [{ cual: extension.nombre_medio_comunicacion || 'Medio de Comunicación', donde: extension.donde_medio_comunicacion || '', nota: extension.medio_comunicacion || '' }]
            : [];

    const [nuevoMedioCual, setNuevoMedioCual] = useState('');
    const [nuevoMedioDonde, setNuevoMedioDonde] = useState('');
    const [nuevoMedioNota, setNuevoMedioNota] = useState('');

    const { data, setData, post, put, processing, errors } = useForm({
        nombre: extension?.nombre || '',
        direccion: extension?.direccion || '',
        telefono: extension?.telefono || '',
        email: extension?.email || '',
        pastor_id: extension?.pastor_id ? String(extension.pastor_id) : '',
        estado_id: extension?.estado_id ? String(extension.estado_id) : '',
        municipio_id: extension?.municipio_id ? String(extension.municipio_id) : '',
        parroquia_id: extension?.parroquia_id ? String(extension.parroquia_id) : '',
        tipo_local_id: extension?.tipo_local_id ? String(extension.tipo_local_id) : '',
        latitud: extension?.latitud !== undefined && extension?.latitud !== null ? String(extension.latitud) : '',
        longitud: extension?.longitud !== undefined && extension?.longitud !== null ? String(extension.longitud) : '',
        zona: extension?.zona || '',
        distrito: extension?.distrito || '',
        fecha_fundacion: extension?.fecha_fundacion || '',
        anios_activa: extension?.anios_activa !== undefined && extension?.anios_activa !== null ? String(extension.anios_activa) : '',
        descripcion: extension?.descripcion || '',
        activa: extension?.activa ?? true,
        miembros_activos: extension?.miembros_activos !== undefined && extension?.miembros_activos !== null ? String(extension.miembros_activos) : '',
        cantidad_campos_blancos: extension?.cantidad_campos_blancos !== undefined && extension?.cantidad_campos_blancos !== null ? String(extension.cantidad_campos_blancos) : '',
        miembro_probante: extension?.miembro_probante !== undefined && extension?.miembro_probante !== null ? String(extension.miembro_probante) : '',
        logros_obtenidos: extension?.logros_obtenidos || '',
        tiempo_trabajo: extension?.tiempo_trabajo || '',
        sector: extension?.sector || '',
        calle: extension?.calle || '',
        avenida: extension?.avenida || '',
        iglesias_fundadas: extension?.iglesias_fundadas !== undefined && extension?.iglesias_fundadas !== null ? String(extension.iglesias_fundadas) : '',
        pastores_ministerio: extension?.pastores_ministerio !== undefined && extension?.pastores_ministerio !== null ? String(extension.pastores_ministerio) : '',
        posee_medio_comunicacion: extension?.posee_medio_comunicacion ?? (initialMedios.length > 0),
        medios_lista: initialMedios as MediaItem[],
    });

    // Opciones formateadas para Select2
    const pastorOptions: Select2Option[] = useMemo(() => [
        { value: '', label: __('Sin asignar / Ninguno') },
        ...pastores.map((p) => ({
            value: p.id,
            label: p.nombre_completo,
            sublabel: p.zona ? `Zona ${p.zona}` : undefined,
        })),
    ], [pastores, __]);

    const estadoOptions: Select2Option[] = useMemo(() => [
        { value: '', label: __('Seleccionar Estado...') },
        ...estados.map((e) => ({
            value: e.id,
            label: e.nombre,
        })),
    ], [estados, __]);

    const municipiosFiltrados = useMemo(() => {
        if (!data.estado_id) return [];
        return municipios.filter((m) => String(m.estado_id) === String(data.estado_id));
    }, [municipios, data.estado_id]);

    const municipioOptions: Select2Option[] = useMemo(() => [
        { value: '', label: __('Seleccionar Municipio...') },
        ...municipiosFiltrados.map((m) => ({
            value: m.id,
            label: m.nombre,
        })),
    ], [municipiosFiltrados, __]);

    const parroquiasFiltradas = useMemo(() => {
        if (!data.municipio_id) return [];
        return parroquias.filter((p) => String(p.municipio_id) === String(data.municipio_id));
    }, [parroquias, data.municipio_id]);

    const parroquiaOptions: Select2Option[] = useMemo(() => [
        { value: '', label: __('Seleccionar Parroquia...') },
        ...parroquiasFiltradas.map((p) => ({
            value: p.id,
            label: p.nombre,
        })),
    ], [parroquiasFiltradas, __]);

    const tipoLocalOptions: Select2Option[] = useMemo(() => [
        { value: '', label: __('Seleccionar Tipo de Local...') },
        ...tiposLocal.map((t) => ({
            value: t.id,
            label: t.nombre,
        })),
    ], [tiposLocal, __]);

    const handlePastorChange = (val: any) => {
        setData('pastor_id', val);
        if (val) {
            const found = pastores.find((p) => String(p.id) === String(val));
            if (found) {
                if (found.zona && !data.zona) setData('zona', found.zona);
                if (found.distrito && !data.distrito) setData('distrito', found.distrito);
            }
        }
    };

    const handleEstadoChange = (val: any) => {
        setData((prev) => ({
            ...prev,
            estado_id: val,
            municipio_id: '',
            parroquia_id: '',
        }));
    };

    const handleMunicipioChange = (val: any) => {
        setData((prev) => ({
            ...prev,
            municipio_id: val,
            parroquia_id: '',
        }));
    };

    const handleFechaFundacionChange = (val: string) => {
        if (!val) {
            setData((prev) => ({
                ...prev,
                fecha_fundacion: '',
            }));
            return;
        }

        const start = new Date(val);
        const today = new Date();

        if (!isNaN(start.getTime()) && start <= today) {
            let years = today.getFullYear() - start.getFullYear();
            let months = today.getMonth() - start.getMonth();

            if (today.getDate() < start.getDate()) {
                months--;
            }

            if (months < 0) {
                years--;
                months += 12;
            }

            const yearsText = years > 0 ? `${years} ${years === 1 ? 'año' : 'años'}` : '';
            const monthsText = months > 0 ? `${months} ${months === 1 ? 'mes' : 'meses'}` : '';

            let tiempoTrabajoText = '';
            if (yearsText && monthsText) {
                tiempoTrabajoText = `${yearsText} y ${monthsText}`;
            } else if (yearsText) {
                tiempoTrabajoText = yearsText;
            } else if (monthsText) {
                tiempoTrabajoText = monthsText;
            } else {
                tiempoTrabajoText = 'Menos de 1 mes';
            }

            setData((prev) => ({
                ...prev,
                fecha_fundacion: val,
                anios_activa: String(years),
                tiempo_trabajo: tiempoTrabajoText,
            }));
        } else {
            setData((prev) => ({
                ...prev,
                fecha_fundacion: val,
            }));
        }
    };

    const selectedEstadoNombre = useMemo(() => {
        if (!data.estado_id) return undefined;
        const found = estados.find((e) => String(e.id) === String(data.estado_id));
        return found?.nombre;
    }, [data.estado_id, estados]);

    const cleanText = (str?: string) => {
        if (!str) return '';
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    };

    const handleMapLocationSelect = (newLat: number, newLng: number, details?: GeocodedAddressDetails) => {
        let matchedEstadoId = data.estado_id;
        let matchedMunicipioId = data.municipio_id;
        let matchedParroquiaId = data.parroquia_id;

        const fullText = cleanText(
            `${details?.estado || ''} ${details?.municipio || ''} ${details?.parroquia || ''} ${details?.direccion || ''}`
        );

        // 1. Coincidir Estado
        const foundState = estados.find((e) => {
            const normE = cleanText(e.nombre);
            if (!normE) return false;

            // Alias conocidos en Venezuela
            if (normE === 'distrito capital' && (fullText.includes('distrito capital') || fullText.includes('caracas') || fullText.includes('distrito federal'))) {
                return true;
            }
            if ((normE === 'la guaira' || normE === 'vargas') && (fullText.includes('la guaira') || fullText.includes('vargas'))) {
                return true;
            }

            return fullText.includes(normE);
        });

        if (foundState) {
            matchedEstadoId = String(foundState.id);
        }

        // 2. Coincidir Municipio
        if (matchedEstadoId) {
            const munsOfState = municipios.filter((m) => String(m.estado_id) === String(matchedEstadoId));
            const foundMun = munsOfState.find((m) => {
                const normM = cleanText(m.nombre);
                if (!normM) return false;
                const cleanMunName = normM.replace(/^municipio\s+/, '').replace(/^autonomo\s+/, '');
                return fullText.includes(normM) || (cleanMunName.length >= 3 && fullText.includes(cleanMunName));
            });

            if (foundMun) {
                matchedMunicipioId = String(foundMun.id);
            } else {
                matchedMunicipioId = '';
                matchedParroquiaId = '';
            }
        }

        // 3. Coincidir Parroquia
        if (matchedMunicipioId) {
            const parrsOfMun = parroquias.filter((p) => String(p.municipio_id) === String(matchedMunicipioId));
            const foundParr = parrsOfMun.find((p) => {
                const normP = cleanText(p.nombre);
                if (!normP) return false;
                const cleanParrName = normP.replace(/^parroquia\s+/, '');
                return fullText.includes(normP) || (cleanParrName.length >= 3 && fullText.includes(cleanParrName));
            });

            if (foundParr) {
                matchedParroquiaId = String(foundParr.id);
            } else {
                matchedParroquiaId = '';
            }
        }

        setData((prev) => ({
            ...prev,
            latitud: String(newLat),
            longitud: String(newLng),
            estado_id: matchedEstadoId,
            municipio_id: matchedMunicipioId,
            parroquia_id: matchedParroquiaId,
            direccion: details?.direccion ? details.direccion : prev.direccion,
            sector: details?.sector ? details.sector : prev.sector,
            calle: details?.calle ? details.calle : prev.calle,
        }));
    };

    // Funciones del Carrito de Medios de Comunicación
    const handleAddMedio = () => {
        if (!nuevoMedioCual.trim()) return;
        const item: MediaItem = {
            cual: nuevoMedioCual.trim(),
            donde: nuevoMedioDonde.trim(),
            nota: nuevoMedioNota.trim(),
        };
        const updated = [...data.medios_lista, item];
        setData((prev) => ({
            ...prev,
            medios_lista: updated,
            posee_medio_comunicacion: true,
        }));
        setNuevoMedioCual('');
        setNuevoMedioDonde('');
        setNuevoMedioNota('');
    };

    const handleRemoveMedio = (index: number) => {
        const updated = data.medios_lista.filter((_, i) => i !== index);
        setData((prev) => ({
            ...prev,
            medios_lista: updated,
            posee_medio_comunicacion: updated.length > 0,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && extension?.id) {
            put(`/admin/extensiones/${extension.id}`);
        } else {
            post('/admin/extensiones');
        }
    };

    const steps = [
        { id: 1, title: __('General'), icon: Building2, desc: __('Información básica') },
        { id: 2, title: __('Ubicación'), icon: MapPin, desc: __('Estado y Dirección') },
        { id: 3, title: __('Membresía'), icon: Users, desc: __('Frutos y Logros') },
        { id: 4, title: __('Medios de Com.'), icon: Radio, desc: __('Radio, TV y Redes') },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header de Pasos (Wizard Tabs) */}
            <div className="bg-card border rounded-xl p-3 shadow-xs">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {steps.map((step) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => setCurrentStep(step.id)}
                                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                                    isActive
                                        ? 'bg-indigo-50 border-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs'
                                        : isCompleted
                                        ? 'bg-emerald-50/60 border-emerald-300 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                                        : 'bg-background border-border text-muted-foreground hover:bg-accent/40'
                                }`}
                            >
                                <div
                                    className={`size-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                        isActive
                                            ? 'bg-indigo-600 text-white'
                                            : isCompleted
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {isCompleted ? <Check className="size-4" /> : step.id}
                                </div>
                                <div className="min-w-0 flex-1 hidden sm:block">
                                    <div className="font-bold text-xs truncate">{step.title}</div>
                                    <div className="text-[10px] text-muted-foreground truncate">{step.desc}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* PASO 1: INFORMACIÓN GENERAL */}
            {currentStep === 1 && (
                <div className="bg-card border rounded-xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b pb-2">
                        <Building2 className="size-5 text-indigo-600" />
                        {__('1. Información General de la Extensión')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="nombre" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Nombre de la Extensión / Iglesia')} *
                            </Label>
                            <Input
                                id="nombre"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                placeholder="Ej. Extensión Central Barquisimeto"
                                className="h-10 text-sm"
                                required
                            />
                            {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre}</p>}
                        </div>

                        <div>
                            <Label htmlFor="pastor_id" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Pastor Encargado')}
                            </Label>
                            <Select2
                                id="pastor_id"
                                options={pastorOptions}
                                value={data.pastor_id}
                                onChange={handlePastorChange}
                                placeholder={__('Buscar Pastor por nombre o código...')}
                                searchPlaceholder={__('Escriba nombre o código de pastor...')}
                                clearable
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="tipo_local_id" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Tipo de Local')}
                            </Label>
                            <Select2
                                id="tipo_local_id"
                                options={tipoLocalOptions}
                                value={data.tipo_local_id}
                                onChange={(val) => setData('tipo_local_id', val)}
                                placeholder={__('Seleccionar Tipo...')}
                            />
                        </div>

                        <div>
                            <Label htmlFor="fecha_fundacion" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Fecha de Fundación')}
                            </Label>
                            <Input
                                id="fecha_fundacion"
                                type="date"
                                value={data.fecha_fundacion}
                                onChange={(e) => handleFechaFundacionChange(e.target.value)}
                                className="h-10 text-sm"
                            />
                        </div>

                        <div>
                            <Label htmlFor="anios_activa" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Años de Actividad')}
                            </Label>
                            <Input
                                id="anios_activa"
                                type="number"
                                value={data.anios_activa}
                                onChange={(e) => setData('anios_activa', e.target.value)}
                                placeholder="Ej. 12"
                                className="h-10 text-sm"
                            />
                        </div>

                        <div>
                            <Label htmlFor="tiempo_trabajo" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Tiempo de Trabajo')}
                            </Label>
                            <Input
                                id="tiempo_trabajo"
                                value={data.tiempo_trabajo}
                                onChange={(e) => setData('tiempo_trabajo', e.target.value)}
                                placeholder="Ej. 5 años y 6 meses"
                                className="h-10 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Switch
                            id="activa"
                            checked={data.activa}
                            onCheckedChange={(checked) => setData('activa', Boolean(checked))}
                        />
                        <Label htmlFor="activa" className="text-xs font-semibold cursor-pointer">
                            {__('Estado de la Iglesia / Extensión: ')}
                            <span className={data.activa ? 'text-emerald-600 font-bold ml-1' : 'text-rose-600 font-bold ml-1'}>
                                {data.activa ? __('ACTIVA') : __('INACTIVA')}
                            </span>
                        </Label>
                    </div>
                </div>
            )}

            {/* PASO 2: UBICACIÓN GEOGRÁFICA */}
            {currentStep === 2 && (
                <div className="bg-card border rounded-xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b pb-2">
                        <MapPin className="size-5 text-indigo-600" />
                        {__('2. Ubicación Geográfica y Dirección')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="estado_id" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Estado')}
                            </Label>
                            <Select2
                                id="estado_id"
                                options={estadoOptions}
                                value={data.estado_id}
                                onChange={handleEstadoChange}
                                placeholder={__('Seleccionar Estado...')}
                                searchPlaceholder={__('Buscar Estado...')}
                            />
                        </div>

                        <div>
                            <Label htmlFor="municipio_id" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Municipio')}
                            </Label>
                            <Select2
                                id="municipio_id"
                                options={municipioOptions}
                                value={data.municipio_id}
                                onChange={handleMunicipioChange}
                                placeholder={__('Seleccionar Municipio...')}
                                searchPlaceholder={__('Buscar Municipio...')}
                                disabled={!data.estado_id}
                            />
                        </div>

                        <div>
                            <Label htmlFor="parroquia_id" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Parroquia')}
                            </Label>
                            <Select2
                                id="parroquia_id"
                                options={parroquiaOptions}
                                value={data.parroquia_id}
                                onChange={(val) => setData('parroquia_id', val)}
                                placeholder={__('Seleccionar Parroquia...')}
                                searchPlaceholder={__('Buscar Parroquia...')}
                                disabled={!data.municipio_id}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="zona" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Zona Ministerial')}
                            </Label>
                            <Input
                                id="zona"
                                value={data.zona}
                                onChange={(e) => setData('zona', e.target.value)}
                                placeholder="Ej. 1"
                                className="h-10 text-sm"
                            />
                        </div>

                        <div>
                            <Label htmlFor="distrito" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Distrito')}
                            </Label>
                            <Input
                                id="distrito"
                                value={data.distrito}
                                onChange={(e) => setData('distrito', e.target.value)}
                                placeholder="Ej. 1"
                                className="h-10 text-sm"
                            />
                        </div>

                        <div>
                            <Label htmlFor="sector" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Sector / Urbanización')}
                            </Label>
                            <Input
                                id="sector"
                                value={data.sector}
                                onChange={(e) => setData('sector', e.target.value)}
                                placeholder="Ej. Sector El Centro"
                                className="h-10 text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="calle" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Calle')}
                            </Label>
                            <Input
                                id="calle"
                                value={data.calle}
                                onChange={(e) => setData('calle', e.target.value)}
                                placeholder="Ej. Calle 24"
                                className="h-10 text-sm"
                            />
                        </div>

                        <div>
                            <Label htmlFor="avenida" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Avenida')}
                            </Label>
                            <Input
                                id="avenida"
                                value={data.avenida}
                                onChange={(e) => setData('avenida', e.target.value)}
                                placeholder="Ej. Av. Libertador"
                                className="h-10 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="direccion" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                            {__('Dirección Completa / Punto de Referencia')}
                        </Label>
                        <Textarea
                            id="direccion"
                            value={data.direccion}
                            onChange={(e) => setData('direccion', e.target.value)}
                            placeholder="Describa detalladamente la ubicación del templo..."
                            className="text-sm"
                            rows={2}
                        />
                    </div>

                    {/* Mapa Interactivo de Ubicación */}
                    <div className="pt-3 border-t">
                        <LocationMapPicker
                            lat={data.latitud}
                            lng={data.longitud}
                            onLocationSelect={handleMapLocationSelect}
                            estadoNombre={selectedEstadoNombre}
                        />
                    </div>
                </div>
            )}

            {/* PASO 3: MEMBRESÍA Y MINISTERIO */}
            {currentStep === 3 && (
                <div className="bg-card border rounded-xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b pb-2">
                        <Users className="size-5 text-indigo-600" />
                        {__('3. Estadísticas de Membresía, Pastores y Logros')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <Label htmlFor="miembros_activos" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Miembros Activos')}
                            </Label>
                            <Input
                                id="miembros_activos"
                                type="number"
                                value={data.miembros_activos}
                                onChange={(e) => setData('miembros_activos', e.target.value)}
                                placeholder="Ej. 150"
                                className="h-10 text-sm"
                            />
                        </div>

                        <div>
                            <Label htmlFor="cantidad_campos_blancos" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Campos Blancos')}
                            </Label>
                            <Input
                                id="cantidad_campos_blancos"
                                type="number"
                                value={data.cantidad_campos_blancos}
                                onChange={(e) => setData('cantidad_campos_blancos', e.target.value)}
                                placeholder="Ej. 3"
                                className="h-10 text-sm"
                            />
                        </div>

                        <div>
                            <Label htmlFor="miembro_probante" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Miembros Probantes')}
                            </Label>
                            <Input
                                id="miembro_probante"
                                type="number"
                                value={data.miembro_probante}
                                onChange={(e) => setData('miembro_probante', e.target.value)}
                                placeholder="Ej. 25"
                                className="h-10 text-sm"
                            />
                        </div>

                        <div>
                            <Label htmlFor="iglesias_fundadas" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Iglesias Fundadas')}
                            </Label>
                            <Input
                                id="iglesias_fundadas"
                                type="number"
                                value={data.iglesias_fundadas}
                                onChange={(e) => setData('iglesias_fundadas', e.target.value)}
                                placeholder="Ej. 2"
                                className="h-10 text-sm"
                            />
                        </div>

                        <div>
                            <Label htmlFor="pastores_ministerio" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                                {__('Pastores Ministerio')}
                            </Label>
                            <Input
                                id="pastores_ministerio"
                                type="number"
                                value={data.pastores_ministerio}
                                onChange={(e) => setData('pastores_ministerio', e.target.value)}
                                placeholder="Ej. 4"
                                className="h-10 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="logros_obtenidos" className="text-xs font-semibold uppercase tracking-wider mb-1 block">
                            {__('Logros y Frutos Obtenidos en el Ministerio')}
                        </Label>
                        <Textarea
                            id="logros_obtenidos"
                            value={data.logros_obtenidos}
                            onChange={(e) => setData('logros_obtenidos', e.target.value)}
                            placeholder="Describa los principales logros espirituales, construcción de templo, eventos u obras fundadas..."
                            className="text-sm"
                            rows={3}
                        />
                    </div>
                </div>
            )}

            {/* PASO 4: MEDIOS DE COMUNICACIÓN (CARRITO DE MEDIOS) */}
            {currentStep === 4 && (
                <div className="bg-card border rounded-xl p-5 shadow-xs space-y-5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b pb-3">
                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                            <Radio className="size-5 text-indigo-600" />
                            {__('4. Medios de Comunicación Institucionales')}
                        </h3>

                        <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-lg border">
                            <Switch
                                id="posee_medio_comunicacion"
                                checked={data.posee_medio_comunicacion}
                                onCheckedChange={(checked) => setData('posee_medio_comunicacion', Boolean(checked))}
                            />
                            <Label htmlFor="posee_medio_comunicacion" className="text-xs font-semibold cursor-pointer select-none">
                                {__('¿Esta extensión posee o transmite por medios de comunicación?')}
                            </Label>
                        </div>
                    </div>

                    {data.posee_medio_comunicacion ? (
                        <div className="space-y-6">
                            {/* Formulario Agregar Nuevo Medio (Simil Carrito) */}
                            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 rounded-xl p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                                        <Plus className="size-4 text-indigo-600" />
                                        {__('Agregar Nuevo Medio de Comunicación')}
                                    </div>
                                    <Badge variant="outline" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-[10px]">
                                        {data.medios_lista.length} {__('registrado(s)')}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <Label className="text-xs font-semibold block mb-1">
                                            {__('¿Cuál medio es? (Nombre / Tipo)')} *
                                        </Label>
                                        <Input
                                            value={nuevoMedioCual}
                                            onChange={(e) => setNuevoMedioCual(e.target.value)}
                                            placeholder="Ej. Radio Celestial 98.5 FM"
                                            className="h-9 text-xs bg-white dark:bg-slate-900"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs font-semibold block mb-1">
                                            {__('¿Dónde se encuentra? (Frecuencia / Dial / Plataforma)')}
                                        </Label>
                                        <Input
                                            value={nuevoMedioDonde}
                                            onChange={(e) => setNuevoMedioDonde(e.target.value)}
                                            placeholder="Ej. Dial 98.5 FM / Barquisimeto"
                                            className="h-9 text-xs bg-white dark:bg-slate-900"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs font-semibold block mb-1">
                                            {__('Nota Adicional')}
                                        </Label>
                                        <Input
                                            value={nuevoMedioNota}
                                            onChange={(e) => setNuevoMedioNota(e.target.value)}
                                            placeholder="Ej. Programa cultos dominicales 10am"
                                            className="h-9 text-xs bg-white dark:bg-slate-900"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleAddMedio}
                                        disabled={!nuevoMedioCual.trim()}
                                        className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-4"
                                    >
                                        <ShoppingBag className="size-3.5" />
                                        {__('Agregar a la lista')}
                                    </Button>
                                </div>
                            </div>

                            {/* Lista / Carrito de Medios Registrados */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Tv className="size-4" />
                                    {__('Lista de Medios de Comunicación Agregados')}
                                </Label>

                                {data.medios_lista.length > 0 ? (
                                    <div className="border rounded-xl divide-y overflow-hidden shadow-2xs bg-card">
                                        {data.medios_lista.map((item, idx) => (
                                            <div key={idx} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors gap-3">
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className="size-8 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 shrink-0 font-bold text-xs">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-bold text-sm text-foreground truncate">{item.cual}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                                                            {item.donde && <span className="font-semibold text-indigo-600">{item.donde}</span>}
                                                            {item.nota && <span className="italic text-slate-500">— {item.nota}</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveMedio(idx)}
                                                    className="size-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="border border-dashed rounded-xl p-8 text-center bg-muted/10">
                                        <Radio className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                        <p className="text-xs font-semibold text-muted-foreground">
                                            {__('No ha agregado medios de comunicación a la lista aún.')}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            {__('Ingrese los datos arriba y presione "Agregar a la lista".')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="border border-dashed rounded-xl p-8 text-center bg-muted/10 space-y-2">
                            <Info className="size-8 text-muted-foreground mx-auto opacity-50" />
                            <p className="text-xs font-semibold text-muted-foreground">
                                {__('Esta extensión no tiene registrados medios de comunicación.')}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                {__('Si la sede cuenta con emisora de radio, canal de TV o redes sociales, active la casilla superior.')}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* BOTONES DE NAVEGACIÓN Y GUARDADO DEL WIZARD */}
            <div className="bg-card border rounded-xl p-4 shadow-xs flex items-center justify-between">
                <div>
                    {currentStep > 1 ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                            className="gap-2 text-xs sm:text-sm font-semibold"
                        >
                            <ArrowLeft className="size-4" />
                            {__('Anterior')}
                        </Button>
                    ) : (
                        <Link href="/admin/extensiones">
                            <Button type="button" variant="ghost" className="text-xs sm:text-sm text-muted-foreground">
                                {__('Cancelar')}
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {currentStep < 4 ? (
                        <Button
                            type="button"
                            onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
                            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow"
                        >
                            {__('Siguiente')}
                            <ArrowRight className="size-4" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md"
                        >
                            <Save className="size-4" />
                            {isEditing ? __('Guardar Cambios') : __('Finalizar y Registrar Extensión')}
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
}
