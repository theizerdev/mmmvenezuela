# 🇻🇪 Sistema de Gestión MMM Venezuela (Movimiento Misionero Mundial)

![MMM Venezuela Banner](public/image/logo/larareact_full_logo.jpg)

Sistema Integral Enterprise para la administración centralizada de **Ministros (Pastores)**, **Iglesias y Extensiones**, **Distribución Geográfica Nacional**, **Planillas Oficiales en PDF** y **Dashboards Estadísticos**.

---

## 🛠️ Stack Tecnológico

### **Backend**
- **PHP 8.2+ / Laravel 11.x**: Framework PHP de última generación para arquitectura empresarial.
- **Inertia.js v3**: Bridge monolítico moderno entre Laravel y React sin necesidad de APIs REST desacopladas.
- **Spatie Laravel Permission**: Control de acceso basado en roles (RBAC) y permisos granulares.
- **Spatie Activity Log**: Sistema completo de auditoría y registro de actividad de usuarios.
- **FPDF / PlanillaService**: Motor de generación de planillas y reportes PDF ajustados con precisión milimétrica.

### **Frontend**
- **React 19.x & TypeScript 5.7+**: Componentes cliente fuertemente tipados para máxima robustez.
- **Tailwind CSS v4 & Shadcn UI**: Interfaz de usuario adaptable, responsiva, moderna y con soporte nativo de Modo Oscuro / Claro.
- **Mapbox GL JS (`mapbox-gl`) & Leaflet (`leaflet`)**: Integración de mapas interactivos 2D/3D con geocodificación inversa, geolocalización GPS y animaciones de cámara `flyTo`.
- **ApexCharts (`react-apexcharts`)**: Visualización analítica de datos con gráficos de área y donas interactivos.
- **Lucide React & Sonner**: Iconografía moderna y sistema de notificaciones toast.

---

## 📦 Módulos Principales del Sistema

### 📊 1. Dashboard Ejecutivo y Analítica
- **Dashboard General (`/admin/dashboard`)**:
  - Resumen demográfico nacional de la membresía e iglesias.
  - Distribución de grados ministeriales (Licenciado, Oficial, Laico, etc.).
  - Módulo de cumpleañeros del mes con accesos directos de contacto.
  - Estadísticas consolidadas por Zonas, Distritos y Estados.
- **Dashboard de Extensiones (`/admin/extensiones/dashboard`)**:
  - **Métricas KPI**: Resumen en tiempo real de Extensiones Activas, Inactivas, Miembros Activos y Campos Blancos / Obras.
  - **Gráfico de Crecimiento en Serie Temporal (ApexCharts)**: Frecuencia de registros filtrable por rango de tiempo (`7 días`, `1 mes`, `3 meses`, `1 año`, `Todo`).
  - **Gráfico Donut por Tipo de Local**: Porcentaje según la condición del inmueble (Propio, Alquilado, Prestado/Cedido, En Construcción, Casa de Culto).
  - **Mapa Interactivo Mapbox GL Venezuela (100% Full Width)**:
    - Filtros por chips con contador de extensiones por estado.
    - Animación de zoom regional automático (`flyTo` / `fitBounds`) al presionar cualquier estado.
    - Modo **Pantalla Completa (Full Screen)** responsivo.
    - Marcadores interactivos (Verde: *Activas*, Rojo: *Inactivas*) con popups detallados y enlace directo a edición.
  - **Línea de Tiempo de Extensiones Recientes**: Cuadrícula con las últimas iglesias y extensiones ingresadas al sistema.

---

### 👥 2. Módulo de Pastores y Ministros (`/admin/pastores`)
- **Gestión Ministerial Completa (CRUD)**:
  - Generador automático de Código Ministerial único.
  - **Asociación Matrimonial Bidireccional (`conyuge_id`)**: Vincula automáticamente al pastor y a su cónyuge para evitar registros duplicados.
  - Registro completo de Cédula de Identidad, nombres, apellidos, teléfono, correo, fecha de nacimiento, fecha de ordenación y salud.
  - Filtros avanzados por Zonas, Distritos, Estados, Grado Ministerial y Estado Civil.
- **Planilla Oficial en PDF (FPDF)**:
  - Exportación de la planilla oficial de pastor alineada a 190mm.
  - Generación de Código de Barras / QR.
  - Tabla consolidada y deduplicada de **Extensiones Eclesiásticas** (refleja las extensiones del pastor y de su cónyuge).
  - Tabla estructurada a 3 columnas para **Medios de Comunicación** asociados.
- **Notificador de Cumpleaños Programado**:
  - Tareas de fondo (*Cron Jobs*) ejecutadas automáticamente a las **8:00 AM** y **10:00 PM**.
  - Notificaciones para el equipo ministerial sobre los cumpleañeros del día.

---

### 🏢 3. Módulo de Iglesias y Extensiones (`/admin/extensiones`)
- **Asistente en Formulario Wizard de 4 Pasos (`ExtensionFormWizard`)**:
  - **Paso 1: Datos Generales**:
    - Nombre de la extensión, selector de Pastor Encargado (Select2), Condición de Local, Estado Activo/Inactivo.
    - Fecha de Fundación con **Cálculo Automático Instantáneo**:
      - *Años de Actividad*: Cantidad exacta de años transcurridos.
      - *Tiempo de Trabajo*: Texto legible en años y meses (ejemplo: `"14 años y 5 meses"`).
  - **Paso 2: Ubicación Geográfica y Mapa Selector**:
    - Selectores encadenados de Estado, Municipio y Parroquia de Venezuela.
    - Campos detallados de Zona, Distrito, Sector, Calle, Avenida y Dirección exacta.
    - **MapPicker Interactivo (Leaflet / Mapbox)** con botón GPS "Obtener mi ubicación actual".
    - **Geocodificación Inversa Autodidacta**: Al hacer clic en el mapa o usar GPS, detecta las coordenadas de latitud/longitud y asocia automáticamente el Estado, Municipio y Parroquia en los menús desplegables.
  - **Paso 3: Membresía y Fruto**:
    - Registro de Miembros Activos, Miembros Probantes, Campos Blancos, Iglesias Fundadas, Pastores Formados y Logros.
  - **Paso 4: Medios de Comunicación (Carrito de Compras Multi-Medio)**:
    - Agregador dinámico para registrar múltiples medios de comunicación (Radio FM/AM, Televisión, Web/Streaming, Redes Sociales, Prensa).
    - Incluye tipo de medio, frecuencia/ubicación y notas adicionales por cada ítem.
- **Sincronización en Pivote `iglesia_pastor`**:
  - Al asociar una extensión a un pastor, el sistema sincroniza automáticamente el registro para su cónyuge en la base de datos.

---

### 🗺️ 4. Módulo Geográfico y Catálogos (`/admin/geografia`)
- **División Territorial de Venezuela**: Tablas completas de Estados, Municipios y Parroquias.
- **Catálogo de Locales**: Tipos de local administrables (Propio, Alquilado, Prestado, En Construcción, Casa de Culto).
- **Organización Ministerial**: Gestión de Zonas y Distritos.

---

### 💬 5. Integración de WhatsApp API
- **Mensajería Automatizada**: Envío de comunicados, recordatorios e imágenes/documentos.
- **Endpoints Laravel**:
  - `POST /api/whatsapp/send`: Envío de texto y mensajes interactivos.
  - `POST /api/whatsapp/send-document`: Envío de planillas PDF y archivos adjuntos (hasta 16 MiB).

---

### 🖥️ 6. Monitoreo del Servidor y Sistema
- **Dashboard de Servidor**: Indicadores en tiempo real de consumo de memoria RAM, CPU y almacenamiento.
- **Auditoría de Logs**: Visor integrado para filtrar y revisar logs de Laravel y eventos del sistema.

---

## 💻 Instalación y Configuración Local

### **Requisitos Previos**
- **PHP** >= 8.2
- **Node.js** >= 20.x
- **Composer** >= 2.x
- **MySQL** >= 8.0 o **MariaDB** >= 10.5

### **Pasos de Instalación**

```bash
# 1. Clonar el repositorio
git clone https://github.com/theizerdev/mmmvenezuela.git
cd mmmvenezuela

# 2. Instalar dependencias de PHP y JavaScript
composer install
npm install

# 3. Copiar archivo de configuración de entorno
cp .env.example .env
php artisan key:generate

# 4. Configurar la base de datos en el archivo .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mmmvenezuela
DB_USERNAME=root
DB_PASSWORD=

# 5. Ejecutar migraciones y datos iniciales (Seeders)
php artisan migrate --seed

# 6. Iniciar los servidores de desarrollo
npm run dev          # Servidor Vite para React
php artisan serve    # Servidor de Laravel
```

---

## 🧪 Comandos y Scripts Disponibles

```bash
# Compilacion para Producción
npm run build        # Compilar componentes React y estilos CSS

# Calidad de Código y Linters
npm run lint         # ESLint para React / TypeScript
composer run lint    # Laravel Pint para PHP
composer run test    # Tests automatizados PHPUnit

# Limpieza de Caché de Laravel
php artisan route:clear
php artisan cache:clear
php artisan config:clear
```

---

## 📄 Licencia y Mantenimiento

- **Organización**: Movimiento Misionero Mundial (MMM Venezuela).
- **Desarrollador / Mantenedor**: `theizerdev`.
- **Licencia**: Propiedad de MMM Venezuela / Licencia MIT para componentes base.