export type StudioBgMode = 'original' | 'ai_cutout' | 'chroma';

export type StudioBackdropPreset =
    | 'transparent'
    | 'credential_silver'
    | 'studio_white'
    | 'pearl_gray'
    | 'mmm_blue'
    | 'passport_sky'
    | 'warm_ivory'
    | 'bokeh'
    | 'custom_solid'
    | 'custom_gradient';

export type BrushToolMode = 'none' | 'erase' | 'restore';

export interface StudioAdjustments {
    // Geometría y Encuadre
    scale: number;
    panX: number;
    panY: number;
    rotation: number;
    flipX: boolean;

    // Fondo, Bordes y Escenario
    bgMode: StudioBgMode;
    backdropPreset: StudioBackdropPreset;
    customBgColor: string;
    customBgSecondary: string;
    dropShadow: number;
    rimLight: number;
    vignette: number;
    edgeFeather: number;
    edgeShift: number;
    defringe: number;
    chromaColor: string;
    chromaTolerance: number;

    // Calibración de Luz, Color y Detalle en Tiempo Real
    exposure: number;
    brightness: number;
    contrast: number;
    shadows: number;
    highlights: number;
    temperature: number;
    tint: number;
    vibrance: number;
    saturation: number;
    clarity: number;
    sharpness: number;

    // Parámetros del Motor Neuronal Python (GFPGAN / Real-ESRGAN / Retoque)
    faceRestore: boolean;
    faceStrength: number;
    eyeClarity: number;
    skinSmooth: number;
    denoise: number;
    upscale: boolean;
    upscaleMode: 'fast' | 'ultra';
    neuralRemoveBg: boolean;
    neuralAutoFrame: boolean;
}

export interface AgentFinding {
    type: 'ok' | 'info' | 'warning';
    label: string;
    detail: string;
}

export interface AgentFaceData {
    bbox: [number, number, number, number];
    landmarks: [number, number][];
    eye_center: [number, number];
    inter_ocular_px: number;
    roll_deg: number;
    confidence: number;
    has_5_landmarks: boolean;
}

export interface AgentBiometricSuggestion {
    available: boolean;
    rotation_deg: number;
    ui_scale: number;
    ui_pan_x: number;
    ui_pan_y: number;
    crop_box: [number, number, number, number];
}

export interface AgentDiagnosis {
    success: boolean;
    quality_score: number;
    grade: string;
    dimensions: {
        width: number;
        height: number;
        has_alpha: boolean;
    };
    metrics: {
        sharpness: number;
        laplacian_var: number;
        noise_sigma: number;
        face_luma_median: number;
        dynamic_range: number;
        glare_pct: number;
        warm_cast: number;
        bg_clean: boolean;
    };
    face: AgentFaceData | null;
    biometric: AgentBiometricSuggestion;
    findings: AgentFinding[];
    recommended_params: Record<string, any>;
    duration_ms?: number;
}

export const DEFAULT_STUDIO_ADJUSTMENTS: StudioAdjustments = {
    scale: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
    flipX: false,

    bgMode: 'original',
    backdropPreset: 'credential_silver',
    customBgColor: '#ffffff',
    customBgSecondary: '#cbd5e1',
    dropShadow: 20,
    rimLight: 0,
    vignette: 0,
    edgeFeather: 1.2,
    edgeShift: 0,
    defringe: 0,
    chromaColor: '#ffffff',
    chromaTolerance: 24,

    exposure: 0,
    brightness: 0,
    contrast: 0,
    shadows: 0,
    highlights: 0,
    temperature: 0,
    tint: 0,
    vibrance: 0,
    saturation: 0,
    clarity: 0,
    sharpness: 0,

    faceRestore: true,
    faceStrength: 65,
    eyeClarity: 28,
    skinSmooth: 18,
    denoise: 12,
    upscale: false,
    upscaleMode: 'fast',
    neuralRemoveBg: true,
    neuralAutoFrame: false,
};

export interface StudioColorPreset {
    id: string;
    name: string;
    badge?: string;
    values: Partial<StudioAdjustments>;
}

export const STUDIO_COLOR_PRESETS: StudioColorPreset[] = [
    {
        id: 'neutral',
        name: 'Original Neutro',
        values: {
            exposure: 0,
            brightness: 0,
            contrast: 0,
            shadows: 0,
            highlights: 0,
            temperature: 0,
            tint: 0,
            vibrance: 0,
            saturation: 0,
            clarity: 0,
            sharpness: 0,
        },
    },
    {
        id: 'executive_studio',
        name: 'Estudio Ejecutivo',
        badge: 'Ideal Carnet',
        values: {
            exposure: 4,
            brightness: 2,
            contrast: 10,
            shadows: 16,
            highlights: -10,
            temperature: 0,
            tint: 0,
            vibrance: 10,
            saturation: 2,
            clarity: 14,
            sharpness: 18,
        },
    },
    {
        id: 'shadow_rescue',
        name: 'Rescate Contraluz',
        values: {
            exposure: 16,
            brightness: 6,
            contrast: 8,
            shadows: 42,
            highlights: -22,
            temperature: 4,
            tint: 0,
            vibrance: 12,
            saturation: 0,
            clarity: 16,
            sharpness: 20,
        },
    },
    {
        id: 'warm_portrait',
        name: 'Luz Cálida Natural',
        values: {
            exposure: 4,
            brightness: 2,
            contrast: 6,
            shadows: 12,
            highlights: -8,
            temperature: 14,
            tint: 2,
            vibrance: 12,
            saturation: 4,
            clarity: 8,
            sharpness: 14,
        },
    },
    {
        id: 'cool_balance',
        name: 'Anti-Bombillo Amarillo',
        values: {
            exposure: 4,
            brightness: 0,
            contrast: 8,
            shadows: 14,
            highlights: -10,
            temperature: -20,
            tint: -3,
            vibrance: 8,
            saturation: 0,
            clarity: 12,
            sharpness: 16,
        },
    },
    {
        id: 'crisp_hd',
        name: 'Nitidez Ultra HD',
        values: {
            exposure: 2,
            brightness: 0,
            contrast: 14,
            shadows: 10,
            highlights: -12,
            temperature: 0,
            tint: 0,
            vibrance: 8,
            saturation: 0,
            clarity: 26,
            sharpness: 34,
        },
    },
];

export interface BackdropOption {
    id: StudioBackdropPreset;
    label: string;
    previewCss: string;
}

export const STUDIO_BACKDROP_OPTIONS: BackdropOption[] = [
    {
        id: 'credential_silver',
        label: 'Plata Oficial',
        previewCss: 'linear-gradient(180deg, #cfd7e1 0%, #dbe1e8 45%, #c2cbd5 100%)',
    },
    {
        id: 'studio_white',
        label: 'Blanco Estudio',
        previewCss: 'radial-gradient(circle at 50% 38%, #ffffff 0%, #eceff3 100%)',
    },
    {
        id: 'pearl_gray',
        label: 'Gris Perla',
        previewCss: 'radial-gradient(circle at 50% 38%, #f8fafc 0%, #cbd5e1 100%)',
    },
    {
        id: 'passport_sky',
        label: 'Celeste Carnet',
        previewCss: 'radial-gradient(circle at 50% 38%, #e2f4fe 0%, #b2d8f5 100%)',
    },
    {
        id: 'mmm_blue',
        label: 'Azul MMM',
        previewCss: 'radial-gradient(circle at 50% 38%, #1d4ed8 0%, #0f172a 100%)',
    },
    {
        id: 'warm_ivory',
        label: 'Marfil Cálido',
        previewCss: 'radial-gradient(circle at 50% 38%, #fcfaf8 0%, #e5dfd5 100%)',
    },
    {
        id: 'bokeh',
        label: 'Bokeh Retrato',
        previewCss: 'linear-gradient(135deg, #64748b 0%, #94a3b8 50%, #475569 100%)',
    },
    {
        id: 'transparent',
        label: 'Sin Fondo PNG',
        previewCss:
            'repeating-conic-gradient(#cbd5e1 0% 25%, #ffffff 0% 50%) 50% / 10px 10px',
    },
    {
        id: 'custom_solid',
        label: 'Color Libre',
        previewCss: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
    },
    {
        id: 'custom_gradient',
        label: 'Degradado',
        previewCss: 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)',
    },
];

