import type { StudioAdjustments, StudioBackdropPreset } from './studio-photo-types';

/**
 * Dimensiones maestras del estudio:
 * Marco visual en tarjeta 680x432: 187 x 281 px
 * Lienzo 2x: 374 x 562 px
 * Lienzo Master Studio 4x (>600 DPI real): 748 x 1124 px
 */
export const STUDIO_FRAME_W = 187;
export const STUDIO_FRAME_H = 281;
export const STUDIO_BASE_W = 374;
export const STUDIO_BASE_H = 562;
export const STUDIO_MASTER_W = 748;
export const STUDIO_MASTER_H = 1124;

function clampByte(v: number): number {
    return v < 0 ? 0 : v > 255 ? 255 : v | 0;
}

/**
 * Construye una tabla LUT de 256 entradas para evaluar Exposición, Sombras, Altas Luces,
 * Brillo y Contraste en O(1) por canal a 60fps en el navegador.
 */
function buildToneLut(adj: StudioAdjustments): Uint8Array {
    const lut = new Uint8Array(256);
    const evGain = Math.pow(2, (adj.exposure / 100) * 1.15);
    const sh = adj.shadows / 100;
    const hl = adj.highlights / 100;
    const brGamma = Math.pow(2, -(adj.brightness / 100) * 0.55);
    const ct = adj.contrast / 100;

    for (let i = 0; i < 256; i++) {
        let x = i / 255;

        // 1. Exposición con compresión suave de altas luces (soft-knee)
        if (adj.exposure !== 0) {
            const xg = x * evGain;
            x = xg / (1 + Math.max(0, xg - 0.82) * 0.55);
        }

        // 2. Levantamiento de Sombras (Relight)
        if (sh !== 0) {
            const shadowMask = Math.pow(Math.max(0, 1 - x), 1.85);
            x += sh * 0.34 * shadowMask;
        }

        // 3. Recuperación / control de Altas Luces
        if (hl !== 0) {
            const hiMask = Math.pow(Math.max(0, x), 2.1);
            x += hl * 0.3 * hiMask;
        }

        x = Math.max(0, Math.min(1, x));

        // 4. Brillo gamma
        if (adj.brightness !== 0 && x > 0) {
            x = Math.pow(x, brGamma);
        }

        // 5. Contraste curva S centrada en 0.5
        if (ct !== 0) {
            const c = x - 0.5;
            x = 0.5 + c * (1 + ct * 0.65) - ct * 0.35 * c * c * c * 4;
        }

        lut[i] = clampByte(Math.round(Math.max(0, Math.min(1, x)) * 255));
    }

    return lut;
}

/**
 * Aplica calibración fotográfica completa (Tono, Temperatura, Matiz, Vibrancia con protección
 * de piel, Saturación, Claridad y Nitidez) directamente sobre un ImageData RGBA.
 */
export function applyRealtimeColorGrading(imageData: ImageData, adj: StudioAdjustments): void {
    const hasTone =
        adj.exposure !== 0 ||
        adj.brightness !== 0 ||
        adj.contrast !== 0 ||
        adj.shadows !== 0 ||
        adj.highlights !== 0;

    const hasColor =
        adj.temperature !== 0 ||
        adj.tint !== 0 ||
        adj.vibrance !== 0 ||
        adj.saturation !== 0;

    const hasDetail = adj.clarity !== 0 || adj.sharpness > 0;

    if (!hasTone && !hasColor && !hasDetail) {
        return;
    }

    const data = imageData.data;
    const len = data.length;
    const lut = hasTone ? buildToneLut(adj) : null;

    const tempShift = adj.temperature * 0.52;
    const tintShift = adj.tint * 0.42;
    const satFactor = 1 + (adj.saturation / 100) * 0.65;
    const vibAmount = (adj.vibrance / 100) * 0.65;

    if (lut || hasColor) {
        for (let i = 0; i < len; i += 4) {
            if (data[i + 3] === 0) continue;

            let r = lut ? lut[data[i]] : data[i];
            let g = lut ? lut[data[i + 1]] : data[i + 1];
            let b = lut ? lut[data[i + 2]] : data[i + 2];

            if (hasColor) {
                // Peso de medios tonos para proteger blancos y negros puros en balance de blancos
                const lumaNorm = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                const midWeight = Math.max(0.18, Math.min(1, 3.8 * lumaNorm * (1 - lumaNorm * 0.82)));

                if (tempShift !== 0 || tintShift !== 0) {
                    r += (tempShift + tintShift * 0.45) * midWeight;
                    g += (-tintShift * 0.75) * midWeight;
                    b += (-tempShift + tintShift * 0.45) * midWeight;
                }

                if (adj.saturation !== 0 || adj.vibrance !== 0) {
                    const maxC = Math.max(r, g, b);
                    const minC = Math.min(r, g, b);
                    const curSat = maxC > 0 ? (maxC - minC) / maxC : 0;

                    // Detectar cercanía a tonos piel (R > G > B moderado) para evitar saturación naranja artificial
                    const isSkinLike = r > g && g > b && r - b > 18 && r - b < 130 ? 0.55 : 0;
                    const vibBoost = vibAmount * (1 - curSat) * (1 - isSkinLike);
                    const totalSat = Math.max(0, satFactor + vibBoost);

                    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    r = gray + (r - gray) * totalSat;
                    g = gray + (g - gray) * totalSat;
                    b = gray + (b - gray) * totalSat;
                }

                data[i] = clampByte(r);
                data[i + 1] = clampByte(g);
                data[i + 2] = clampByte(b);
            } else {
                data[i] = r;
                data[i + 1] = g;
                data[i + 2] = b;
            }
        }
    }

    // Nitidez / Claridad sin halos (Unsharp Luminance Kernel rápido)
    if (hasDetail) {
        const w = imageData.width;
        const h = imageData.height;
        const srcCopy = new Uint8ClampedArray(data);
        const amount = Math.max(-0.25, (adj.sharpness / 100) * 0.55 + (adj.clarity / 100) * 0.32);

        if (Math.abs(amount) > 0.01) {
            const stride = w * 4;
            for (let y = 1; y < h - 1; y++) {
                const rowOffset = y * stride;
                for (let x = 1; x < w - 1; x++) {
                    const idx = rowOffset + x * 4;
                    if (srcCopy[idx + 3] < 16) continue;

                    for (let c = 0; c < 3; c++) {
                        const center = srcCopy[idx + c];
                        const neighbors =
                            (srcCopy[idx - stride + c] +
                                srcCopy[idx + stride + c] +
                                srcCopy[idx - 4 + c] +
                                srcCopy[idx + 4 + c]) *
                            0.25;
                        const diff = center - neighbors;
                        if (Math.abs(diff) > 1.5) {
                            const clampedDiff = Math.max(-22, Math.min(22, diff));
                            data[idx + c] = clampByte(center + clampedDiff * amount);
                        }
                    }
                }
            }
        }
    }
}

/**
 * Aplica eliminación por color croma + descontaminación básica cuando se usa el modo 'chroma'.
 */
export function applyChromaKeyToImageData(
    imgData: ImageData,
    hexColor: string,
    tolerance: number,
    feather: number,
): void {
    const data = imgData.data;
    const clean = hexColor.replace('#', '');
    const tr = parseInt(clean.substring(0, 2), 16) || 255;
    const tg = parseInt(clean.substring(2, 4), 16) || 255;
    const tb = parseInt(clean.substring(4, 6), 16) || 255;

    const maxDist = 441.67;
    const tolDist = (tolerance / 100) * (maxDist * 0.68);
    const smoothRange = Math.max(6, feather * 12);

    for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a === 0) continue;

        const dr = data[i] - tr;
        const dg = data[i + 1] - tg;
        const db = data[i + 2] - tb;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        if (dist <= tolDist) {
            data[i + 3] = 0;
        } else if (dist < tolDist + smoothRange) {
            const factor = (dist - tolDist) / smoothRange;
            data[i + 3] = Math.round(a * factor);
        }
    }
}

/**
 * Aplica refinamiento de bordes y descontaminación de halos en vivo sobre recortes IA.
 */
export function refineAlphaAndDefringeLive(
    imgData: ImageData,
    defringePct: number,
    edgeShift: number,
): void {
    if (defringePct <= 0 && Math.abs(edgeShift) < 0.05) return;

    const data = imgData.data;
    const w = imgData.width;
    const h = imgData.height;

    // Ajuste ligero de umbral alfa (contraer / expandir sub-píxel sobre bordes suavizados)
    if (Math.abs(edgeShift) >= 0.05) {
        const bias = -edgeShift * 26; // edgeShift < 0 contrae el borde semitransparente
        for (let i = 3; i < data.length; i += 4) {
            const a = data[i];
            if (a > 0 && a < 255) {
                data[i] = clampByte(Math.round((a - bias) * 1.08));
            }
        }
    }

    // Supresión de halos claros/coloridos en píxeles de borde semitransparente
    if (defringePct > 2) {
        const strength = (defringePct / 100) * 0.75;
        const copy = new Uint8ClampedArray(data);
        const radius = 3;

        for (let y = radius; y < h - radius; y++) {
            for (let x = radius; x < w - radius; x++) {
                const idx = (y * w + x) * 4;
                const a = copy[idx + 3];
                if (a <= 12 || a >= 242) continue;

                // Buscar vecino más opaco cercano para heredar crominancia limpia del cabello/traje
                let bestA = a;
                let bestIdx = idx;
                for (const [ox, oy] of [
                    [-radius, 0],
                    [radius, 0],
                    [0, -radius],
                    [0, radius],
                    [-2, 2],
                    [2, 2],
                ]) {
                    const nIdx = ((y + oy) * w + (x + ox)) * 4;
                    if (copy[nIdx + 3] > bestA) {
                        bestA = copy[nIdx + 3];
                        bestIdx = nIdx;
                    }
                }

                if (bestIdx !== idx && bestA > a + 20) {
                    const blend = strength * (1 - a / 255);
                    data[idx] = clampByte(copy[idx] * (1 - blend) + copy[bestIdx] * blend);
                    data[idx + 1] = clampByte(copy[idx + 1] * (1 - blend) + copy[bestIdx + 1] * blend);
                    data[idx + 2] = clampByte(copy[idx + 2] * (1 - blend) + copy[bestIdx + 2] * blend);
                }
            }
        }
    }
}

/**
 * Dibuja el escenario de estudio seleccionado en el contexto destino.
 */
export function drawStudioBackdrop(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    preset: StudioBackdropPreset,
    customColor: string,
    customSecondary: string,
    originalImage: HTMLImageElement | HTMLCanvasElement | null,
    drawSubjectTransform?: (targetCtx: CanvasRenderingContext2D) => void,
): void {
    if (preset === 'transparent') {
        return;
    }

    ctx.save();

    if (preset === 'bokeh' && originalImage && drawSubjectTransform) {
        ctx.filter = `blur(${Math.round(w * 0.032)}px) brightness(96%)`;
        drawSubjectTransform(ctx);
        ctx.filter = 'none';
        ctx.restore();
        return;
    }

    if (preset === 'custom_solid') {
        ctx.fillStyle = customColor || '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
        return;
    }

    if (preset === 'credential_silver') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#cfd7e1');
        grad.addColorStop(0.45, '#dbe1e8');
        grad.addColorStop(1, '#c2cbd5');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
        return;
    }

    const radialStops: Record<string, [string, string]> = {
        studio_white: ['#ffffff', '#eceff4'],
        pearl_gray: ['#f8fafc', '#cbd5e1'],
        passport_sky: ['#e2f4fe', '#b2d8f5'],
        mmm_blue: ['#1e40af', '#0f172a'],
        warm_ivory: ['#fcfaf8', '#e5dfd5'],
        custom_gradient: [customColor || '#ffffff', customSecondary || '#cbd5e1'],
    };

    const [inner, outer] = radialStops[preset] || radialStops.studio_white;
    const rad = ctx.createRadialGradient(w * 0.5, h * 0.38, w * 0.06, w * 0.5, h * 0.45, h * 0.72);
    rad.addColorStop(0, inner);
    rad.addColorStop(1, outer);
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
}

/**
 * Compone la imagen completa del Estudio (Fondo + Luz de contorno + Sombra 3D + Sujeto Calibrado + Viñeta)
 * sobre el canvas principal o de exportación.
 */
export function renderStudioComposite(params: {
    targetCanvas: HTMLCanvasElement;
    originalImage: HTMLImageElement;
    cutoutCanvas: HTMLCanvasElement | null;
    brushMaskCanvas: HTMLCanvasElement | null; // Fondo negro opaco: R=restaurar, G=borrar en espacio de imagen original
    hasBrushStrokes?: boolean;
    adjustments: StudioAdjustments;
    forExport?: boolean;
}): void {
    const {
        targetCanvas,
        originalImage,
        cutoutCanvas,
        brushMaskCanvas,
        hasBrushStrokes = false,
        adjustments,
    } = params;
    const w = targetCanvas.width;
    const h = targetCanvas.height;
    const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const scaleFactor = w / STUDIO_BASE_W;

    // Función auxiliar que aplica la transformación geométrica (pan, rotación, espejo, zoom object-cover)
    const drawTransformedSource = (
        c: CanvasRenderingContext2D,
        src: HTMLImageElement | HTMLCanvasElement,
    ) => {
        c.save();
        c.translate(
            w / 2 + adjustments.panX * 2 * scaleFactor,
            h / 2 + adjustments.panY * 2 * scaleFactor,
        );
        if (adjustments.rotation !== 0) {
            c.rotate((adjustments.rotation * Math.PI) / 180);
        }
        c.scale(
            adjustments.flipX ? -adjustments.scale : adjustments.scale,
            adjustments.scale,
        );

        const imgRatio = src.width / src.height;
        const targetRatio = w / h;
        let drawW = w;
        let drawH = h;
        if (imgRatio > targetRatio) {
            drawH = h;
            drawW = h * imgRatio;
        } else {
            drawW = w;
            drawH = w / imgRatio;
        }

        c.drawImage(src, -drawW / 2, -drawH / 2, drawW, drawH);
        c.restore();
    };

    // 1. Preparar capa del sujeto (Original, Cutout IA o Croma + Pincel Mágico)
    const subjectCanvas = document.createElement('canvas');
    subjectCanvas.width = w;
    subjectCanvas.height = h;
    const sCtx = subjectCanvas.getContext('2d', { willReadFrequently: true });
    if (!sCtx) return;

    const useCutout = adjustments.bgMode === 'ai_cutout' && cutoutCanvas !== null;
    const baseSource = useCutout ? cutoutCanvas : originalImage;

    if (adjustments.edgeFeather > 0.2 && (useCutout || adjustments.bgMode === 'chroma')) {
        // Suavizado ligero aplicado solo después al alfa
    }

    drawTransformedSource(sCtx, baseSource);

    // Si hay trazos manuales del Pincel Mágico (Borrar / Restaurar), aplicarlos en el mismo espacio transformado
    if (brushMaskCanvas && hasBrushStrokes) {
        const maskProjected = document.createElement('canvas');
        maskProjected.width = w;
        maskProjected.height = h;
        const mCtx = maskProjected.getContext('2d', { willReadFrequently: true });

        const origProjected = document.createElement('canvas');
        origProjected.width = w;
        origProjected.height = h;
        const oCtx = origProjected.getContext('2d', { willReadFrequently: true });

        if (mCtx && oCtx) {
            drawTransformedSource(mCtx, brushMaskCanvas);
            drawTransformedSource(oCtx, originalImage);

            const subData = sCtx.getImageData(0, 0, w, h);
            const maskData = mCtx.getImageData(0, 0, w, h).data;
            const origData = oCtx.getImageData(0, 0, w, h).data;
            const sd = subData.data;

            for (let i = 0; i < sd.length; i += 4) {
                const restoreAmt = maskData[i] / 255;     // Canal Rojo = Restaurar imagen original
                const eraseAmt = maskData[i + 1] / 255;   // Canal Verde = Borrar a transparente
                if (restoreAmt > 0.01) {
                    sd[i] = Math.round(sd[i] * (1 - restoreAmt) + origData[i] * restoreAmt);
                    sd[i + 1] = Math.round(sd[i + 1] * (1 - restoreAmt) + origData[i + 1] * restoreAmt);
                    sd[i + 2] = Math.round(sd[i + 2] * (1 - restoreAmt) + origData[i + 2] * restoreAmt);
                    sd[i + 3] = clampByte(Math.max(sd[i + 3], Math.round(origData[i + 3] * restoreAmt)));
                }
                if (eraseAmt > 0.01) {
                    sd[i + 3] = clampByte(Math.round(sd[i + 3] * (1 - eraseAmt)));
                }
            }
            sCtx.putImageData(subData, 0, 0);
        }
    }

    // Procesar píxeles del sujeto: Croma, Defringe/EdgeShift y Calibración de Luz y Color
    const subjectImgData = sCtx.getImageData(0, 0, w, h);
    if (adjustments.bgMode === 'chroma') {
        applyChromaKeyToImageData(
            subjectImgData,
            adjustments.chromaColor,
            adjustments.chromaTolerance,
            adjustments.edgeFeather,
        );
    } else if (useCutout) {
        refineAlphaAndDefringeLive(subjectImgData, adjustments.defringe, adjustments.edgeShift);
    }

    applyRealtimeColorGrading(subjectImgData, adjustments);
    sCtx.putImageData(subjectImgData, 0, 0);

    const hasCutoutLayer = useCutout || adjustments.bgMode === 'chroma' || hasBrushStrokes;

    // 2. Dibujar Fondo de Estudio (si el fondo fue removido o se usó el borrador mágico)
    if (hasCutoutLayer && (adjustments.bgMode !== 'original' || hasBrushStrokes)) {
        drawStudioBackdrop(
            ctx,
            w,
            h,
            adjustments.backdropPreset,
            adjustments.customBgColor,
            adjustments.customBgSecondary,
            originalImage,
            (targetCtx) => drawTransformedSource(targetCtx, originalImage),
        );

        const offscreenShift = w + 256;

        // 2.1 Luz de Recorte / Rim Light de Estudio detrás de los hombros y cabeza (solo halo, sin duplicar alfa del sujeto)
        if (adjustments.rimLight > 0) {
            ctx.save();
            const rimAlpha = (adjustments.rimLight / 100) * 0.65;
            ctx.shadowColor = `rgba(255, 255, 255, ${rimAlpha.toFixed(2)})`;
            ctx.shadowBlur = Math.round(14 * scaleFactor);
            ctx.shadowOffsetX = offscreenShift;
            ctx.shadowOffsetY = Math.round(-2 * scaleFactor);
            ctx.drawImage(subjectCanvas, -offscreenShift, 0);
            ctx.restore();
        }

        // 2.2 Sombra de Contacto 3D de Estudio detrás del pastor (solo sombra pura, sin sobre-opacar bordes de cabello)
        if (adjustments.dropShadow > 0) {
            ctx.save();
            const shOpacity = (adjustments.dropShadow / 100) * 0.45;
            ctx.shadowColor = `rgba(15, 23, 42, ${shOpacity.toFixed(2)})`;
            ctx.shadowBlur = Math.round(18 * scaleFactor);
            ctx.shadowOffsetX = offscreenShift + Math.round(6 * scaleFactor);
            ctx.shadowOffsetY = Math.round(8 * scaleFactor);
            ctx.drawImage(subjectCanvas, -offscreenShift, 0);
            ctx.restore();
        }
    }

    // 3. Dibujar al Sujeto Principal Calibrado
    ctx.drawImage(subjectCanvas, 0, 0);

    // 4. Viñeta Suave de Retrato (opcional, solo cuando no es PNG transparente puro)
    if (
        adjustments.vignette > 0 &&
        !(hasCutoutLayer && adjustments.bgMode !== 'original' && adjustments.backdropPreset === 'transparent')
    ) {
        ctx.save();
        const vigAlpha = (adjustments.vignette / 100) * 0.48;
        const vig = ctx.createRadialGradient(w * 0.5, h * 0.42, w * 0.28, w * 0.5, h * 0.5, h * 0.72);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, `rgba(15, 23, 42, ${vigAlpha.toFixed(2)})`);
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }
}

/**
 * Convierte coordenadas del puntero en el canvas a coordenadas exactas de la imagen original
 * para pintar con el Pincel Mágico (Borrar / Restaurar) independientemente del zoom, pan o rotación.
 */
export function mapCanvasPointToSourceImage(
    canvasX: number,
    canvasY: number,
    canvasW: number,
    canvasH: number,
    srcW: number,
    srcH: number,
    adj: StudioAdjustments,
): { x: number; y: number; scaleToSrc: number } {
    const scaleFactor = canvasW / STUDIO_BASE_W;
    const cx = canvasW / 2 + adj.panX * 2 * scaleFactor;
    const cy = canvasH / 2 + adj.panY * 2 * scaleFactor;

    let dx = canvasX - cx;
    let dy = canvasY - cy;

    if (adj.rotation !== 0) {
        const rad = (-adj.rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const rx = dx * cos - dy * sin;
        const ry = dx * sin + dy * cos;
        dx = rx;
        dy = ry;
    }

    dx /= adj.flipX ? -adj.scale : adj.scale;
    dy /= adj.scale;

    const imgRatio = srcW / srcH;
    const targetRatio = canvasW / canvasH;
    const drawW = imgRatio > targetRatio ? canvasH * imgRatio : canvasW;
    const drawH = imgRatio > targetRatio ? canvasH : canvasW / imgRatio;

    const u = (dx + drawW / 2) / drawW;
    const v = (dy + drawH / 2) / drawH;

    return {
        x: u * srcW,
        y: v * srcH,
        scaleToSrc: (srcW / drawW) / adj.scale,
    };
}
