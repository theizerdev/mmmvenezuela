import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');
const outDir = path.resolve(appRoot, '..', 'public', 'app-presbiterio');

console.log('1/3 Compilando Presbiterio App para Web / iOS PWA...');
execSync('pnpm.cmd exec expo export -p web --output-dir ../public/app-presbiterio --clear', {
  cwd: appRoot,
  stdio: 'inherit',
});

console.log('2/4 Optimizando rutas de fuentes (.pnpm) para compatibilidad con Git y Windows...');
const nodeModulesAssetsDir = path.join(outDir, 'assets', 'node_modules');
const flatFontsDir = path.join(outDir, 'assets', 'fonts');

function collectFilesRecursively(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFilesRecursively(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

if (fs.existsSync(nodeModulesAssetsDir)) {
  fs.mkdirSync(flatFontsDir, { recursive: true });
  const deepFiles = collectFilesRecursively(nodeModulesAssetsDir);
  const replacements = [];

  for (const fullFilePath of deepFiles) {
    const fileName = path.basename(fullFilePath);
    const relOldPath = path.relative(outDir, fullFilePath).split(path.sep).join('/');
    const relNewPath = `assets/fonts/${fileName}`;
    fs.copyFileSync(fullFilePath, path.join(flatFontsDir, fileName));
    replacements.push({ relOldPath, relNewPath });
  }

  const jsWebDir = path.join(outDir, '_expo', 'static', 'js', 'web');
  if (fs.existsSync(jsWebDir)) {
    for (const jsFile of fs.readdirSync(jsWebDir)) {
      if (!jsFile.endsWith('.js')) continue;
      const jsPath = path.join(jsWebDir, jsFile);
      let content = fs.readFileSync(jsPath, 'utf8');
      for (const { relOldPath, relNewPath } of replacements) {
        content = content.split(relOldPath).join(relNewPath);
      }
      fs.writeFileSync(jsPath, content, 'utf8');
    }
  }

  fs.rmSync(nodeModulesAssetsDir, { recursive: true, force: true });
}

console.log('3/4 Copiando íconos de iOS (Apple Touch Icon) y creando manifest.json...');
const iconSrc = path.join(appRoot, 'assets', 'icon.png');
if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, path.join(outDir, 'apple-touch-icon.png'));
  fs.copyFileSync(iconSrc, path.join(outDir, 'icon-512.png'));
}

const manifest = {
  id: '/app-presbiterio/',
  name: 'Presbiterio & Supervisión MMM Venezuela',
  short_name: 'Presbiterio MMM',
  description: 'Portal Ejecutivo de Presbíteros y Supervisión Nacional - Movimiento Misionero Mundial',
  start_url: '/app-presbiterio/',
  scope: '/app-presbiterio/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#090d16',
  theme_color: '#090d16',
  icons: [
    {
      src: '/app-presbiterio/apple-touch-icon.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/app-presbiterio/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
  ],
};

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

console.log('3/3 Inyectando etiquetas nativas de iPhone (Apple Web App) en index.html...');
const indexHtmlPath = path.join(outDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  let html = fs.readFileSync(indexHtmlPath, 'utf8');

  // Reemplazar viewport para evitar zoom accidental en inputs de iPhone y soportar notch
  html = html.replace(
    /<meta name="viewport"[^>]*>/i,
    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />'
  );

  const iosTags = `
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Presbiterio MMM" />
    <meta name="application-name" content="Presbiterio MMM" />
    <meta name="theme-color" content="#090d16" />
    <link rel="apple-touch-icon" href="/app-presbiterio/apple-touch-icon.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/app-presbiterio/apple-touch-icon.png" />
    <link rel="manifest" href="/app-presbiterio/manifest.json" />
  `;

  html = html.replace('</head>', `${iosTags}\n  </head>`);
  fs.writeFileSync(indexHtmlPath, html, 'utf8');
}

console.log('✅ ¡Listo! App instalable para iPhone / Web generada en public/app-presbiterio');

