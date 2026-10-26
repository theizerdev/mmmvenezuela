import type { Pastor } from '../Index';
import { formatDocumento, getPastorPhotoUrl, getPastorCarnetFullName } from './PastorCarnetCard';

/**
 * Carga una imagen como HTMLImageElement de forma asíncrona
 */
function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
    });
}

/**
 * Exporta la cara frontal o trasera de un carnet a imagen PNG de alta resolución (300 DPI - 1063 x 650 px para 90 x 55 mm)
 */
export async function exportPastorCarnetPng(
    pastor: Pastor,
    side: 'front' | 'back' = 'front',
    customTemplateUrl?: string
): Promise<void> {
    // 90 mm x 55 mm a 300 DPI exactos
    const width = 1063;
    const height = 650;
    const scale = width / 720; // Factor de escala respecto a 720x440 (~1.4764)

    // Precargar tipografías oficiales de la identidad
    if (typeof document !== 'undefined' && document.fonts) {
        try {
            await Promise.all([
                document.fonts.load('700 24px Cocogoose'),
                document.fonts.load('bold 24px Cocogoose'),
                document.fonts.load('400 16px "Aribau Grotesk"'),
                document.fonts.load('normal 16px "Aribau Grotesk"'),
            ]);
        } catch {
            // Continuar con fuentes alternativas si la API falla
        }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (side === 'front') {
        // 1. Cargar y dibujar fondo frontal
        const bgUrl = customTemplateUrl || '/image/Credencial-frente.png';
        try {
            const bgImg = await loadImage(bgUrl);
            ctx.drawImage(bgImg, 0, 0, width, height);
        } catch {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, width, height);
        }

        // 2. Foto del Pastor (Alineada exactamente dentro del marco oficial de la plantilla: x=77, y=174, w=292, h=422, r=24 a 1063x650)
        const photoX = Math.round(52 * scale);
        const photoY = Math.round(118 * scale);
        const photoW = Math.round(198 * scale);
        const photoH = Math.round(286 * scale);
        const photoRadius = Math.round(16 * scale);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius);
        ctx.clip();

        const photoUrl = getPastorPhotoUrl(pastor.foto || (pastor as any).foto_url);
        let photoLoaded = false;
        if (photoUrl) {
            try {
                const photoImg = await loadImage(photoUrl);
                const imgRatio = photoImg.width / photoImg.height;
                const targetRatio = photoW / photoH;
                let sW = photoImg.width;
                let sH = photoImg.height;
                let sX = 0;
                let sY = 0;

                if (imgRatio > targetRatio) {
                    sW = photoImg.height * targetRatio;
                    sX = (photoImg.width - sW) / 2;
                } else {
                    sH = photoImg.width / targetRatio;
                    sY = 0; // Priorizar rostro
                }

                ctx.drawImage(photoImg, sX, sY, sW, sH, photoX, photoY, photoW, photoH);
                photoLoaded = true;
            } catch {
                photoLoaded = false;
            }
        }

        if (!photoLoaded) {
            ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
            ctx.font = `bold ${48 * scale}px Cocogoose, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const initials = `${pastor.nombres?.trim()?.[0] || ''}${pastor.apellidos?.trim()?.[0] || ''}`.toUpperCase() || 'P';
            ctx.fillText(initials, photoX + photoW / 2, photoY + photoH / 2);
        }
        ctx.restore();

        // 3. Textos Frontales Oficiales (Identidad Visual: Cocogoose Titular + Aribau Grotesk Descripción)
        const textCenterX = 470 * scale;
        const textMaxWidth = 430 * scale;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Bloque 1: Identificación Titular (Debajo de franja PASTOR)
        const nombreCompleto = getPastorCarnetFullName(pastor, true);
        const nameFontSize = nombreCompleto.length > 28 ? 15 * scale : (nombreCompleto.length > 22 ? 17 * scale : 19.5 * scale);
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${nameFontSize}px Cocogoose, sans-serif`;
        ctx.fillText(nombreCompleto, textCenterX, 223 * scale, textMaxWidth);

        // Documento de Identidad (Aribau Grotesk Regular, Negro Carbón)
        ctx.fillStyle = '#0f172a';
        ctx.font = `normal ${13 * scale}px "Aribau Grotesk", sans-serif`;
        ctx.fillText(`C.I. ${formatDocumento(pastor.documento)}`, textCenterX, 253 * scale);

        // Bloque 2: Grado Ministerial (Valor ARRIBA de la etiqueta GRADO MINISTERIAL)
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${15 * scale}px Cocogoose, sans-serif`;
        const nivel = (pastor.nivel_ministerial || 'MINISTRO ORDENADO').toUpperCase();
        ctx.fillText(nivel, textCenterX, 283 * scale, textMaxWidth);

        // Bloque 3: Lugar de Trabajo (Valor ARRIBA de la etiqueta LUGAR DE TRABAJO)
        let lugarTexto = pastor.extension_nombre?.trim() || '';
        if (!lugarTexto && (pastor as any).extension && typeof (pastor as any).extension === 'string') {
            lugarTexto = (pastor as any).extension.trim();
        }
        if (!lugarTexto && Array.isArray((pastor as any).iglesias) && (pastor as any).iglesias.length > 0) {
            lugarTexto = (pastor as any).iglesias[0]?.nombre?.trim() || '';
        }
        if (!lugarTexto) {
            const lugarParts: string[] = [];
            if (pastor.zona) lugarParts.push(`ZONA ${pastor.zona}`);
            if (pastor.distrito) lugarParts.push(pastor.distrito);
            lugarTexto = lugarParts.length > 0 ? lugarParts.join(' • ') : 'REPÚBLICA BOLIVARIANA DE VENEZUELA';
        }

        if (lugarTexto.length > 24 && /^iglesia\s+extensi[oó]n\s+/i.test(lugarTexto)) {
            lugarTexto = lugarTexto.replace(/^iglesia\s+/i, '');
        }

        const lugarFontSize = lugarTexto.length > 28 ? 11 * scale : (lugarTexto.length > 20 ? 12.5 * scale : 14 * scale);
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${lugarFontSize}px Cocogoose, sans-serif`;
        ctx.fillText(lugarTexto.toUpperCase(), textCenterX, 347 * scale, textMaxWidth);
    } else {
        // --- CARA TRASERA (BACK) ---
        const bgUrl = customTemplateUrl || '/image/Credencial-atras.png';
        try {
            const bgImg = await loadImage(bgUrl);
            ctx.drawImage(bgImg, 0, 0, width, height);
        } catch {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
        }

        // Nombre y Cédula inferior izquierdo (zona libre bajo el texto legal)
        const textX = 54 * scale;
        const textY = 345 * scale;

        ctx.fillStyle = '#0f3563';
        ctx.font = `bold ${16 * scale}px Cocogoose, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(getPastorCarnetFullName(pastor, false), textX, textY, 450 * scale);

        ctx.fillStyle = '#475569';
        ctx.font = `normal ${11.5 * scale}px "Aribau Grotesk", sans-serif`;
        const docText = `C.I. ${formatDocumento(pastor.documento)}${pastor.codigo ? `  |  Cód: ${pastor.codigo}` : ''}`;
        ctx.fillText(docText, textX, textY + (18 * scale));

        // Línea de firma
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(textX, textY + (38 * scale));
        ctx.lineTo(textX + (230 * scale), textY + (38 * scale));
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = `bold ${8 * scale}px "Aribau Grotesk", sans-serif`;
        ctx.fillText('FIRMA DEL MINISTRO TITULAR', textX, textY + (49 * scale));

        // Código QR inferior derecho (alejado de la cinta decorativa)
        const qrBox = 96 * scale;
        const qrPad = 6 * scale;
        const qrBoxX = 530 * scale;
        const qrBoxY = 296 * scale;
        const qrSize = qrBox - qrPad * 2;
        const qrX = qrBoxX + qrPad;
        const qrY = qrBoxY + qrPad;

        const verificationUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/validar-credencial/${encodeURIComponent(pastor.codigo || pastor.documento || pastor.id)}`
            : `/validar-credencial/${pastor.codigo || pastor.id}`;

        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(verificationUrl)}`;

        try {
            const qrImg = await loadImage(qrImageUrl);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(qrBoxX, qrBoxY, qrBox, qrBox, 8 * scale);
            ctx.fill();
            ctx.strokeStyle = '#e2d08a';
            ctx.lineWidth = 1 * scale;
            ctx.stroke();

            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

            ctx.fillStyle = '#475569';
            ctx.font = `bold ${7.5 * scale}px "Aribau Grotesk", sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('VALIDAR QR', qrBoxX + qrBox / 2, qrBoxY + qrBox + (11 * scale));
        } catch {
            // Fallback si QR no carga
        }
    }

    // Convertir canvas a archivo descargable
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const cleanDoc = (pastor.documento || `${pastor.id}`).replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `tarjeta_pastor_${cleanDoc}_${side}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
