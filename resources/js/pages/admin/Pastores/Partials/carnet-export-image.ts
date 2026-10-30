import type { Pastor } from '../Index';
import { formatDocumento, getPastorPhotoUrl, getPastorCarnetFullName, getPastorCarnetReversoLocation } from './PastorCarnetCard';

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
 * Exporta la cara frontal o trasera de un carnet a imagen PNG de alta resolución (300 DPI - 1004 x 638 px para 8.5 x 5.4 cm)
 */
export async function exportPastorCarnetPng(
    pastor: Pastor,
    side: 'front' | 'back' = 'front',
    customTemplateUrl?: string
): Promise<void> {
    // 8.5 cm x 5.4 cm a 300 DPI exactos (85mm / 25.4 * 300 = 1004, 54mm / 25.4 * 300 = 638)
    const width = 1004;
    const height = 638;
    const scale = width / 680; // Factor de escala respecto a vista de 680x432 (~1.4765)

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

        // 2. Foto del Pastor (Alineada exactamente dentro del marco oficial de la plantilla: x=72, y=171, w=276, h=415, r=22 a 1004x638)
        const photoX = Math.round(49 * scale);
        const photoY = Math.round(116 * scale);
        const photoW = Math.round(187 * scale);
        const photoH = Math.round(281 * scale);
        const photoRadius = Math.round(15 * scale);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius);
        ctx.clip();

        const photoUrl = getPastorPhotoUrl((pastor as any).foto_url || pastor.foto);
        let photoLoaded = false;
        if (photoUrl) {
            try {
                const photoImg = await loadImage(photoUrl);
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
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
            ctx.font = `bold ${45 * scale}px Cocogoose, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const initials = `${pastor.nombres?.trim()?.[0] || ''}${pastor.apellidos?.trim()?.[0] || ''}`.toUpperCase() || 'P';
            ctx.fillText(initials, photoX + photoW / 2, photoY + photoH / 2);
        }
        ctx.restore();

        // 3. Textos Frontales Oficiales (Identidad Visual: Cocogoose Titular + Aribau Grotesk Descripción)
        const textCenterX = 444 * scale;
        const textMaxWidth = 406 * scale;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Bloque 1: Identificación Titular (Debajo de franja PASTOR)
        const nombreCompleto = getPastorCarnetFullName(pastor, true).toUpperCase();
        const nameFontSize = nombreCompleto.length > 28 ? 16.5 * scale : (nombreCompleto.length > 22 ? 18.5 * scale : 21 * scale);
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${nameFontSize}px Cocogoose, sans-serif`;
        ctx.fillText(nombreCompleto, textCenterX, 218 * scale, textMaxWidth);

        // Documento de Identidad (Aribau Grotesk Regular, Negro Carbón)
        ctx.fillStyle = '#0f172a';
        ctx.font = `normal ${12.5 * scale}px "Aribau Grotesk", sans-serif`;
        ctx.fillText(`C.I. ${formatDocumento(pastor.documento).toUpperCase()}`, textCenterX, 248 * scale);

        // Bloque 2: Grado Ministerial (Valor ARRIBA de la etiqueta GRADO MINISTERIAL)
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${14.5 * scale}px Cocogoose, sans-serif`;
        const nivel = (pastor.nivel_ministerial || 'MINISTRO ORDENADO').toUpperCase();
        ctx.fillText(nivel, textCenterX, 278 * scale, textMaxWidth);

        // Bloque 3: Lugar de Trabajo (Valor ARRIBA de la etiqueta LUGAR DE TRABAJO)
        let lugarTexto = pastor.estado?.nombre?.trim() || pastor.extension_nombre?.trim() || '';
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

        const lugarFontSize = lugarTexto.length > 28 ? 10.5 * scale : (lugarTexto.length > 20 ? 12 * scale : 13.5 * scale);
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${lugarFontSize}px Cocogoose, sans-serif`;
        ctx.fillText(lugarTexto.toUpperCase(), textCenterX, 341 * scale, textMaxWidth);
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

        // Nombre y Ubicación inferior izquierdo (idéntico a ejemplo.png)
        const textX = 55 * scale;
        const textY = 346 * scale;

        const reversoTitular = getPastorCarnetFullName(pastor, true).toUpperCase();
        const reversoFontSize = reversoTitular.length > 28 ? 15.5 * scale : (reversoTitular.length > 22 ? 17.5 * scale : 19.5 * scale);
        ctx.fillStyle = '#000000';
        ctx.font = `italic bold ${reversoFontSize}px "Aribau Grotesk", sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(reversoTitular, textX, textY, 444 * scale);

        ctx.fillStyle = '#000000';
        ctx.font = `bold ${11 * scale}px "Aribau Grotesk", sans-serif`;
        const reversoLocation = getPastorCarnetReversoLocation(pastor).toUpperCase();
        ctx.fillText(reversoLocation, textX, textY + (22 * scale), 444 * scale);

        // Código QR inferior derecho (sin recuadro ni adornos, idéntico a ejemplo.png)
        const qrSize = 94 * scale;
        const qrX = 525 * scale;
        const qrY = 289 * scale;

        const verificationUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/validar-credencial/${encodeURIComponent(pastor.codigo || pastor.documento || pastor.id)}`
            : `/validar-credencial/${pastor.codigo || pastor.id}`;

        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(verificationUrl)}`;

        try {
            const qrImg = await loadImage(qrImageUrl);
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        } catch {
            // Fallback si QR no carga
        }

        // Texto de vencimiento debajo del código QR
        const qrCenterX = qrX + qrSize / 2;
        const venceY = qrY + qrSize + (8 * scale);
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${8.5 * scale}px "Aribau Grotesk", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('VENCE - DICIEMBRE DEL 2028', qrCenterX, venceY);
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
