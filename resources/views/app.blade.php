<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        {{-- Favicons y Apple Touch Icon generados a partir del logo oficial a color sin fondo --}}
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/pwa-192.png">
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/pwa-512.png">
        <link rel="icon" type="image/png" sizes="48x48" href="/icons/favicon.png">
        <link rel="icon" href="/icons/logo_mmm-a-color-sin-fondo.png" type="image/png">
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/pwa-192.png">
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/pwa-512.png">
        <link rel="apple-touch-icon" href="/icons/logo_mmm-a-color-sin-fondo.png">

        {{-- PWA Manifest & Soporte Móvil / Tablet / Kiosko --}}
        <link rel="manifest" href="/pwa/manifest.json">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="Asistencia MMM">
        <meta name="theme-color" content="#4f46e5">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
