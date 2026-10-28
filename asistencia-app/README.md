# Asistencia MMM - App Móvil (Expo React Native)

Aplicación móvil oficial para el **Terminal de Registro y Escaneo de Asistencia Nacional** del **Movimiento Misionero Mundial Venezuela**.

## Características Implementadas

1. **Acceso Público Directo (Sin Login):**
   - El operador abre la app y se conecta directamente con la base de datos nacional sin necesidad de credenciales de usuario ni tokens CSRF.
2. **Identidad Visual Oficial (Fiel al Sistema Web):**
   - **Logotipo adaptativo oficial:**
     - En **Modo Oscuro (`Dark Mode`)**: Muestra el logotipo blanco oficial (`logo_light.png`).
     - En **Modo Claro (`Light Mode`)**: Muestra el logotipo oficial a todo color (`logo_color.png`).
   - **Tipografía Institucional:** Mismo estilo tipográfico de `login.tsx` usando la fuente oficial **Cocogoose Bold** y tracking institucional.
   - Alternador de tema (Sol / Luna) en la cabecera.
3. **Modalidad 1: Registro por Escaneo QR (Cámara Nativa):**
   - Cámara de alta velocidad a 60 FPS (`expo-camera`).
   - Botón para encender/apagar linterna en auditorios y templos oscuros.
   - Al escanear el carnet/credencial, muestra la **Ficha del Obrero**:
     - Foto, Cédula, Nivel Ministerial.
     - **Extensión / Iglesia donde labora** (e.g. *Extensión MMM km 17 del junquito*).
     - Switch: *¿Su cónyuge se encuentra en las instalaciones?* (muestra el nombre del cónyuge y acredita a ambos si está activo).
     - Alerta de duplicados si ya había marcado asistencia previa en la sesión.
     - Respuesta háptica (vibración) de confirmación.
4. **Modalidad 2: Registro Manual (Búsqueda por Cédula):**
   - Teclado numérico móvil optimizado.
   - Búsqueda en vivo o con botón "Buscar".
   - Muestra la misma ficha con los datos de extensión y cónyuge.
5. **Cinta de Últimos Escaneos:**
   - Visualización inferior de los últimos 10 obreros acreditados en tiempo real.
6. **Configuración Rápida de Red:**
   - Selector para ajustar la IP del servidor Laragon o VPS (`http://192.168.101.102` por defecto) con test de conexión integrado.

---

## Cómo Iniciar la App

1. Entra en el directorio de la app:
   ```bash
   cd asistencia-app
   ```

2. Inicia el servidor de Expo:
   ```bash
   npx expo start
   ```

3. **Para probar en tu teléfono físico (Android o iPhone):**
   - Instala la app gratuita **Expo Go** desde Google Play Store o App Store.
   - Conecta el teléfono a la misma red Wi-Fi de tu computadora.
   - Escanea el código QR que aparecerá en tu terminal.

4. **Para generar el archivo APK autónomo (Instalador Android directo):**
   ```bash
   npx eas build -p android --profile preview
   ```

