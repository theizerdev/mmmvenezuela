import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig, type Plugin } from 'vite';

function faceApiSsrPlugin(): Plugin {
    return {
        name: 'vite-plugin-face-api-ssr',
        enforce: 'pre',
        resolveId(id: string, _importer: string | undefined, options?: { ssr?: boolean }) {
            if (options?.ssr && (id === '@vladmandic/face-api' || id.startsWith('@tensorflow/tfjs-node'))) {
                return '\0face-api-ssr-mock';
            }
        },
        load(id: string) {
            if (id === '\0face-api-ssr-mock') {
                return `
                    export default {};
                    export const nets = {
                        tinyFaceDetector: { loadFromUri: async () => {} },
                        faceLandmark68TinyNet: { loadFromUri: async () => {} },
                        faceRecognitionNet: { loadFromUri: async () => {} },
                    };
                    export class TinyFaceDetectorOptions {}
                    export class LabeledFaceDescriptors {}
                    export class FaceMatcher {}
                    export const fetchImage = async () => ({});
                    export const detectSingleFace = () => ({
                        withFaceLandmarks: () => ({
                            withFaceDescriptor: async () => null,
                        }),
                    });
                `;
            }
        },
    };
}

export default defineConfig({
    define: {
        __dirname: '""',
    },
    plugins: [
        faceApiSsrPlugin(),
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
                // Tipografía de marca para el landing page (Hoshō)
                bunny('Space Grotesk', {
                    weights: [500, 700],
                }),
                bunny('Inter', {
                    weights: [400, 500, 600, 700],
                }),
                bunny('IBM Plex Mono', {
                    weights: [400, 500],
                }),
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
        VitePWA({
            registerType: 'autoUpdate',
            // Usamos el manifest manual en /public/pwa/manifest.json
            manifest: false,
            includeAssets: ['icons/*.png', 'image/logo/**'],
            workbox: {
                // Solo cachear assets estáticos; las requests API siguen al servidor
                globPatterns: ['**/*.{js,css,html}'],
                maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
                runtimeCaching: [
                    {
                        urlPattern: /^\/icons\//,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'kiosko-icons',
                            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
                        },
                    },
                    {
                        urlPattern: /^\/image\//,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'kiosko-images',
                            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
                        },
                    },
                ],
                navigateFallback: null,
            },
        }),
    ],
    server: {
        watch: {
            usePolling: true,
            interval: 100, // Revisa cambios cada 100ms (más sensible para Windows)
            ignored: ['**/storage/**', '**/public/storage/**'],
        },
    },
});