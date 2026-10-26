/**
 * Servicio de Segmentación y Remoción de Fondo con Inteligencia Artificial (Google MediaPipe Selfie Segmentation)
 * Ejecuta inferencia neuronal local en WebAssembly/GPU dentro del navegador sin enviar datos a servidores externos.
 */

let segmenterInstance: any = null;
let isInitializing = false;
let initPromise: Promise<any> | null = null;

export async function getAiSegmenter(): Promise<any> {
    if (segmenterInstance) {
        return segmenterInstance;
    }

    if (initPromise) {
        return initPromise;
    }

    initPromise = (async () => {
        try {
            const { FilesetResolver, ImageSegmenter } = await import('@mediapipe/tasks-vision');

            // Cargar resolución Wasm desde CDN oficial de Google MediaPipe
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
            );

            // Intentar con aceleración por GPU primero
            try {
                segmenterInstance = await ImageSegmenter.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
                        delegate: 'GPU',
                    },
                    runningMode: 'IMAGE',
                    outputConfidenceMasks: true,
                    outputCategoryMask: false,
                });
                return segmenterInstance;
            } catch (gpuErr) {
                console.warn('MediaPipe GPU delegate no disponible, reintentando con CPU:', gpuErr);
                segmenterInstance = await ImageSegmenter.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
                        delegate: 'CPU',
                    },
                    runningMode: 'IMAGE',
                    outputConfidenceMasks: true,
                    outputCategoryMask: false,
                });
                return segmenterInstance;
            }
        } catch (error) {
            console.error('Error al inicializar Google MediaPipe ImageSegmenter:', error);
            initPromise = null;
            throw error;
        }
    })();

    return initPromise;
}

/**
 * Aplica segmentación neuronal a un elemento de imagen o canvas y retorna el ImageData con fondo transparente.
 */
export async function removeBackgroundWithAi(
    source: HTMLImageElement | HTMLCanvasElement,
    targetWidth: number,
    targetHeight: number,
    feathering: number = 0.4
): Promise<ImageData> {
    const segmenter = await getAiSegmenter();

    return new Promise((resolve, reject) => {
        try {
            // Canvas temporal del tamaño deseado
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = targetWidth;
            tempCanvas.height = targetHeight;
            const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

            if (!tempCtx) {
                reject(new Error('No se pudo crear contexto 2D para segmentación'));
                return;
            }

            // Dibujar la fuente redimensionada
            tempCtx.drawImage(source, 0, 0, targetWidth, targetHeight);
            const originalImageData = tempCtx.getImageData(0, 0, targetWidth, targetHeight);
            const pixels = originalImageData.data;

            // Inferencia neuronal MediaPipe
            segmenter.segment(tempCanvas, (result: any) => {
                if (!result || !result.confidenceMasks || result.confidenceMasks.length === 0) {
                    reject(new Error('La IA no devolvió máscara de segmentación'));
                    return;
                }

                const maskData = result.confidenceMasks[0].getAsFloat32Array();
                const maskW = result.confidenceMasks[0].width;
                const maskH = result.confidenceMasks[0].height;

                // Umbrales de confianza para separación nítida con suavizado
                const lowerThreshold = 0.25;
                const upperThreshold = 0.65;
                const range = upperThreshold - lowerThreshold;

                for (let y = 0; y < targetHeight; y++) {
                    const my = Math.floor((y / targetHeight) * maskH);
                    for (let x = 0; x < targetWidth; x++) {
                        const mx = Math.floor((x / targetWidth) * maskW);
                        const maskIdx = my * maskW + mx;
                        const pixelIdx = (y * targetWidth + x) * 4;

                        const confidence = maskData[maskIdx]; // 0.0 (fondo) a 1.0 (persona)

                        if (confidence <= lowerThreshold) {
                            pixels[pixelIdx + 3] = 0; // Fondo eliminado al 100%
                        } else if (confidence < upperThreshold) {
                            // Borde suave (antialiasing / feathering)
                            const factor = (confidence - lowerThreshold) / range;
                            pixels[pixelIdx + 3] = Math.round(pixels[pixelIdx + 3] * factor);
                        }
                        // Si confidence >= upperThreshold, se mantiene la opacidad original del sujeto
                    }
                }

                resolve(originalImageData);
            });
        } catch (err) {
            reject(err);
        }
    });
}

