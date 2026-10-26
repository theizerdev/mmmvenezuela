import type { Pastor } from '../Index';
import { formatDocumento, getPastorPhotoUrl } from './PastorCarnetCard';

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
 * Exporta la cara frontal o trasera de un carnet a imagen PNG de alta resolución (300 DPI - 1011 x 637 px)
 */
export async function exportPastorCarnetPng(
    pastor: Pastor,
    side: 'front' | 'back' = 'front',
    customTemplateUrl?: string
): Promise<void> {
    const width = 1011;  // 85.6 mm a 300 DPI
    const height = 637;  // 53.9 mm a 300 DPI
    const scale = width / 700; // Factor de escala respecto al mockup 700x442 (~1.444)

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

        // 2. Foto del Pastor (Alineada exactamente dentro del marco plateado de la plantilla)
        const photoX = 38 * scale;
        const photoY = 117 * scale;
        const photoW = 201 * scale;
        const photoH = 285 * scale;
        const photoRadius = 14 * scale;

        ctx.save();
        // Máscara redondeada sin borde artificial añadido
        ctx.beginPath();
        ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius);
        ctx.clip();

        const photoUrl = getPastorPhotoUrl(pastor.foto || (pastor as any).foto_url);
        let photoLoaded = false;
        if (photoUrl) {
            try {
                const photoImg = await loadImage(photoUrl);
                // Cover behavior
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
                    sY = 0; // Priorizar parte superior para rostros
                }

                ctx.drawImage(photoImg, sX, sY, sW, sH, photoX, photoY, photoW, photoH);
                photoLoaded = true;
            } catch {
                photoLoaded = false;
            }
        }

        if (!photoLoaded) {
            ctx.fillStyle = '#0c2340';
            ctx.fillRect(photoX, photoY, photoW, photoH);
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${52 * scale}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const initials = `${pastor.nombres?.trim()?.[0] || ''}${pastor.apellidos?.trim()?.[0] || ''}`.toUpperCase() || 'P';
            ctx.fillText(initials, photoX + photoW / 2, photoY + photoH / 2);
        }
        ctx.restore();

        // 3. Textos Frontales Calibrados con la Plantilla Oficial
        const textCenterX = 465 * scale;
        const textMaxWidth = 410 * scale;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Zona 1: Nombre, Cédula y Código (Debajo de la franja PASTOR, encima de GRADO MINISTERIAL)
        ctx.fillStyle = '#0c2340';
        ctx.font = `900 ${20 * scale}px system-ui, -apple-system, sans-serif`;
        const nombreCompleto = `${pastor.nombres} ${pastor.apellidos}`.toUpperCase();
        ctx.fillText(nombreCompleto, textCenterX, 222 * scale, textMaxWidth);

        ctx.fillStyle = '#1e3a8a';
        ctx.font = `800 ${14 * scale}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(`C.I. ${formatDocumento(pastor.documento)}`, textCenterX, 248 * scale);

        if (pastor.codigo) {
            ctx.fillStyle = '#64748b';
            ctx.font = `700 ${10 * scale}px system-ui, -apple-system, sans-serif`;
            ctx.fillText(`CÓD: ${pastor.codigo}`, textCenterX, 268 * scale);
        }

        // Zona 2: Grado Ministerial (Centrado bajo el rótulo "GRADO MINISTERIAL")
        ctx.fillStyle = '#0c2340';
        ctx.font = `900 ${16 * scale}px system-ui, -apple-system, sans-serif`;
        const nivel = (pastor.nivel_ministerial || 'MINISTRO ORDENADO').toUpperCase();
        ctx.fillText(nivel, textCenterX, 342 * scale, textMaxWidth);

        // Zona 3: Lugar de Trabajo (Nombre de la extensión donde se encuentra)
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

        const fontSize = lugarTexto.length > 34 ? 12 * scale : 13.5 * scale;
        ctx.fillStyle = '#1e293b';
        ctx.font = `800 ${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(lugarTexto.toUpperCase(), textCenterX, 402 * scale, textMaxWidth);
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
        const textX = 52 * scale;
        const textY = 347 * scale;

        ctx.fillStyle = '#0f3563';
        ctx.font = `italic bold ${17 * scale}px Georgia, "Times New Roman", Times, serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(`${pastor.nombres} ${pastor.apellidos}`, textX, textY, 440 * scale);

        ctx.fillStyle = '#475569';
        ctx.font = `500 ${11.5 * scale}px system-ui, -apple-system, sans-serif`;
        const docText = `C.I. ${formatDocumento(pastor.documento)}${pastor.codigo ? `  |  Cód: ${pastor.codigo}` : ''}`;
        ctx.fillText(docText, textX, textY + (18 * scale));

        // Línea de firma
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(textX, textY + (40 * scale));
        ctx.lineTo(textX + (230 * scale), textY + (40 * scale));
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = `bold ${8 * scale}px system-ui, -apple-system, sans-serif`;
        ctx.fillText('FIRMA DEL MINISTRO TITULAR', textX, textY + (51 * scale));

        // Código QR inferior derecho (alejado de la cinta decorativa de la esquina)
        const qrBox = 96 * scale;
        const qrPad = 6 * scale;
        const qrBoxX = 516 * scale;
        const qrBoxY = 300 * scale;
        const qrSize = qrBox - qrPad * 2;
        const qrX = qrBoxX + qrPad;
        const qrY = qrBoxY + qrPad;

        const verificationUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/validar-credencial/${encodeURIComponent(pastor.codigo || pastor.documento || pastor.id)}`
            : `/validar-credencial/${pastor.codigo || pastor.id}`;

        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(verificationUrl)}`;

        try {
            const qrImg = await loadImage(qrImageUrl);
            // Fondo blanco para QR con borde dorado
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(qrBoxX, qrBoxY, qrBox, qrBox, 8 * scale);
            ctx.fill();
            ctx.strokeStyle = '#e2d08a';
            ctx.lineWidth = 1 * scale;
            ctx.stroke();

            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

            ctx.fillStyle = '#475569';
            ctx.font = `800 ${7.5 * scale}px system-ui, -apple-system, sans-serif`;
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
    link.download = `carnet_pastor_${cleanDoc}_${side}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

