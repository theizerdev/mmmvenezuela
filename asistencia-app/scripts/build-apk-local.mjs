import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');
const androidDir = path.join(appRoot, 'android');

// 1. Detectar JAVA_HOME (JDK 17) y ANDROID_HOME en Windows automáticamente
let javaHome = process.env.JAVA_HOME || '';
if (!javaHome || !fs.existsSync(path.join(javaHome, 'bin', 'java.exe'))) {
  const msJdkBase = 'C:\\Program Files\\Microsoft';
  if (fs.existsSync(msJdkBase)) {
    const jdkDir = fs.readdirSync(msJdkBase).find((d) => d.startsWith('jdk-17'));
    if (jdkDir) {
      javaHome = path.join(msJdkBase, jdkDir);
    }
  }
}

const androidHome =
  process.env.ANDROID_HOME ||
  process.env.ANDROID_SDK_ROOT ||
  path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk');

console.log(`🔧 JAVA_HOME: ${javaHome}`);
console.log(`🔧 ANDROID_HOME: ${androidHome}`);

const env = {
  ...process.env,
  JAVA_HOME: javaHome,
  ANDROID_HOME: androidHome,
  ANDROID_SDK_ROOT: androidHome,
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://saprcoe.mmmvenezuela.org',
  NODE_ENV: 'production',
  PATH: `${path.join(javaHome, 'bin')};${path.join(androidHome, 'platform-tools')};${path.join(androidHome, 'cmdline-tools', 'latest', 'bin')};${process.env.PATH || ''}`,
};

// 2. Asegurar proyecto nativo android/
if (!fs.existsSync(path.join(androidDir, 'gradlew.bat'))) {
  console.log('📦 Generando carpeta android/ con Expo Prebuild...');
  execSync('pnpm.cmd exec expo prebuild --platform android --no-install', {
    cwd: appRoot,
    stdio: 'inherit',
    env,
  });
}

// 3. Escribir local.properties con la ruta del SDK
const escapedSdkDir = androidHome.replace(/\\/g, '\\\\').replace(/:/g, '\\:');
fs.writeFileSync(path.join(androidDir, 'local.properties'), `sdk.dir=${escapedSdkDir}\n`, 'utf8');

console.log('🚀 Compilando APK de Producción (Gradle Release) en Windows...');
execSync('gradlew.bat assembleRelease -x lint -x test', {
  cwd: androidDir,
  stdio: 'inherit',
  env,
});

const apkSrc = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
const apkDest = path.join(appRoot, 'Asistencia-MMM-Venezuela.apk');

if (fs.existsSync(apkSrc)) {
  fs.copyFileSync(apkSrc, apkDest);
  console.log(`\n✅ ¡APK compilado con éxito en tu Windows!\n📍 Archivo listo en: ${apkDest}`);
}

