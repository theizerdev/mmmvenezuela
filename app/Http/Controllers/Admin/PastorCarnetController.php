<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pastor;
use App\Services\CarnetFpdf;
use App\Services\CarnetService;
use Codedge\Fpdf\Fpdf\Fpdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PastorCarnetController extends Controller
{
    protected CarnetService $carnetService;

    public function __construct(CarnetService $carnetService)
    {
        $this->carnetService = $carnetService;
    }

    /**
     * Valida que el usuario tenga acceso a Carnets & Credenciales.
     * Permitido únicamente para roles: Super Administrador, Administrador, Secretaria Nacional y Junta Nacional.
     */
    protected function autorizarAccesoCarnets(): void
    {
        $user = auth()->user();
        if (!$user) {
            abort(401);
        }

        if ($user->isSuperAdmin()) {
            return;
        }

        $rolesPermitidos = [
            'Super Administrador',
            'super-admin',
            'Super Admin',
            'super_admin',
            'Administrador',
            'Admin',
            'admin',
            'Secretaria Nacional',
            'Junta Nacional',
        ];

        if ($user->hasAnyRole($rolesPermitidos)) {
            return;
        }

        $tieneRol = $user->roles()->where(function ($q) {
            $q->where('name', 'like', '%super%')
              ->orWhere('name', 'like', '%administrador%')
              ->orWhere('name', 'like', '%admin%')
              ->orWhere('name', 'like', '%secretaria%')
              ->orWhere('name', 'like', '%junta%');
        })->exists();

        if (!$tieneRol) {
            abort(403, 'Acceso restringido: El módulo de Carnets & Credenciales solo está disponible para los roles: Super Administrador, Administrador, Secretaría Nacional y Junta Nacional.');
        }
    }

    /**
     * Interfaz gráfica interactiva para el Centro de Carnetización y Emisión de Credenciales
     */
    public function carnets(Request $request)
    {
        $this->autorizarAccesoCarnets();

        $query = Pastor::query();

        // Filtro por búsqueda de texto
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nombres', 'like', "%{$search}%")
                  ->orWhere('apellidos', 'like', "%{$search}%")
                  ->orWhere('documento', 'like', "%{$search}%")
                  ->orWhere('codigo', 'like', "%{$search}%");
            });
        }

        // Filtro por zona
        if ($zona = $request->input('zona')) {
            $cleanZona = preg_replace('/\D/', '', $zona);
            $query->where(function ($q) use ($zona, $cleanZona) {
                $q->where('zona', $zona);
                if ($cleanZona) {
                    $q->orWhere('zona', $cleanZona)
                      ->orWhere('zona', 'Zona ' . $cleanZona);
                }
            });
        }

        // Filtro por distrito
        if ($distrito = $request->input('distrito')) {
            $cleanDistrito = preg_replace('/\D/', '', $distrito);
            $query->where(function ($q) use ($distrito, $cleanDistrito) {
                $q->where('distrito', $distrito);
                if ($cleanDistrito) {
                    $q->orWhere('distrito', $cleanDistrito)
                      ->orWhere('distrito', 'Distrito ' . $cleanDistrito);
                }
            });
        }

        // Filtro por nivel ministerial
        if ($nivel = $request->input('nivel_ministerial')) {
            $query->where('nivel_ministerial', $nivel);
        }

        // Filtro por foto
        if ($request->input('con_foto') === 'si') {
            $query->whereNotNull('foto')->where('foto', '!=', '');
        } elseif ($request->input('con_foto') === 'no') {
            $query->where(function ($q) {
                $q->whereNull('foto')->orWhere('foto', '');
            });
        }

        // Filtro por estatus
        if ($request->filled('status')) {
            $query->where('status', (bool) $request->input('status'));
        }

        // Estadísticas para el encabezado del módulo
        $stats = [
            'total' => Pastor::count(),
            'con_foto' => Pastor::whereNotNull('foto')->where('foto', '!=', '')->count(),
            'sin_foto' => Pastor::where(function ($q) {
                $q->whereNull('foto')->orWhere('foto', '');
            })->count(),
            'ordenados' => Pastor::where('nivel_ministerial', 'Ministro Ordenado')->count(),
        ];

        $perPage = (int) $request->input('per_page', 40);
        $relations = [
            'estado',
            'iglesiasPrincipales.estado',
            'iglesias.estado',
            'conyuge.iglesiasPrincipales.estado',
            'conyuge.iglesias.estado',
        ];
        $pastores = $query->with($relations)
        ->orderBy('nombres', 'asc')
        ->paginate($perPage)
        ->withQueryString();

        // Pastor preseleccionado para el visor
        $selectedPastorId = $request->input('pastor_id');
        $initialPastor = null;
        if ($selectedPastorId) {
            $initialPastor = Pastor::with($relations)->find($selectedPastorId);
        }
        if (!$initialPastor && $pastores->count() > 0) {
            $initialPastor = $pastores->first();
        }

        return Inertia::render('admin/Pastores/Carnets', [
            'pastores' => $pastores,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search', ''),
                'zona' => $request->input('zona', ''),
                'distrito' => $request->input('distrito', ''),
                'nivel_ministerial' => $request->input('nivel_ministerial', ''),
                'con_foto' => $request->input('con_foto', ''),
                'status' => $request->input('status', ''),
                'per_page' => (string) $perPage,
            ],
            'initialPastor' => $initialPastor,
            'plantillas' => [
                'frente' => CarnetService::getUrlPlantillaFrente(),
                'atras' => CarnetService::getUrlPlantillaAtras(),
                'esPersonalizadaFrente' => file_exists(public_path('image/custom-Credencial-frente.png')) || file_exists(storage_path('app/public/carnets/Credencial-frente.png')),
                'esPersonalizadaAtras' => file_exists(public_path('image/custom-Credencial-atras.png')) || file_exists(storage_path('app/public/carnets/Credencial-atras.png')),
            ],
        ]);
    }

    /**
     * Descargar / Previsualizar el PDF del carnet de un pastor (Frontal + Trasero)
     */
    public function carnetPdf(int $id)
    {
        $this->autorizarAccesoCarnets();
        @ini_set('memory_limit', '256M');

        $relations = [
            'estado',
            'iglesiasPrincipales.estado',
            'iglesias.estado',
            'conyuge.iglesiasPrincipales.estado',
            'conyuge.iglesias.estado',
        ];

        $pastor = Pastor::with($relations)->findOrFail($id);

        $fpdf = new CarnetFpdf('L', 'mm', [CarnetService::ANCHO_MM, CarnetService::ALTO_MM]);
        $this->carnetService->generarPdfParaPastor($pastor, $fpdf);

        $nombreArchivo = 'carnet_pastor_' . str_replace(' ', '_', $pastor->nombres . '_' . $pastor->apellidos) . '.pdf';

        return response($fpdf->Output('S', $nombreArchivo))
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="' . $nombreArchivo . '"');
    }

    /**
     * Generar pliego PDF masivo para una lista de pastores seleccionados
     */
    public function bulkCarnetPdf(Request $request)
    {
        $this->autorizarAccesoCarnets();
        @ini_set('memory_limit', '512M');
        @set_time_limit(300);

        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:pastores,id',
            'tipo_pliego' => 'nullable|string|in:duplex,front_only,cr80_individual',
        ]);

        $tipoPliego = $request->input('tipo_pliego', 'duplex');
        $relations = [
            'estado',
            'iglesiasPrincipales.estado',
            'iglesias.estado',
            'conyuge.iglesiasPrincipales.estado',
            'conyuge.iglesias.estado',
        ];
        $pastores = Pastor::with($relations)->whereIn('id', $request->input('ids'))->get();

        $fpdf = ($tipoPliego === 'cr80_individual')
            ? new CarnetFpdf('L', 'mm', [CarnetService::ANCHO_MM, CarnetService::ALTO_MM])
            : new CarnetFpdf('P', 'mm', 'Letter');

        $this->carnetService->generarPdfMasivo($pastores, $fpdf, $tipoPliego);

        $nombreArchivo = 'carnets_pastores_' . $tipoPliego . '.pdf';

        return response($fpdf->Output('S', $nombreArchivo))
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="' . $nombreArchivo . '"');
    }

    /**
     * Guarda la imagen modelo personalizada para la plantilla frontal o trasera del carnet
     */
    public function guardarPlantilla(Request $request)
    {
        $this->autorizarAccesoCarnets();

        $request->validate([
            'tipo' => 'required|string|in:frente,atras',
            'imagen' => 'required|string',
        ]);

        $tipo = $request->input('tipo');
        $dataUri = $request->input('imagen');

        if (!preg_match('/^data:image\/(\w+);base64,/', $dataUri, $matches)) {
            return response()->json(['error' => 'Formato de imagen inválido'], 422);
        }

        $base64Data = substr($dataUri, strpos($dataUri, ',') + 1);
        $decoded = base64_decode($base64Data);

        if ($decoded === false) {
            return response()->json(['error' => 'No se pudo decodificar la imagen'], 422);
        }

        $dirStorageApp = storage_path('app/public/carnets');
        if (!file_exists($dirStorageApp)) {
            mkdir($dirStorageApp, 0755, true);
        }

        $dirPublicStorage = public_path('storage/carnets');
        if (!file_exists($dirPublicStorage)) {
            mkdir($dirPublicStorage, 0755, true);
        }

        $dirPublicImage = public_path('image');
        if (!file_exists($dirPublicImage)) {
            mkdir($dirPublicImage, 0755, true);
        }

        $filename = ($tipo === 'frente') ? 'Credencial-frente.png' : 'Credencial-atras.png';
        
        // Guardar en todas las ubicaciones posibles para máxima compatibilidad con Apache/Laragon
        file_put_contents($dirPublicImage . '/custom-' . $filename, $decoded);
        file_put_contents($dirPublicStorage . '/' . $filename, $decoded);
        file_put_contents($dirStorageApp . '/' . $filename, $decoded);

        $url = ($tipo === 'frente')
            ? CarnetService::getUrlPlantillaFrente()
            : CarnetService::getUrlPlantillaAtras();

        return response()->json([
            'success' => true,
            'message' => 'Plantilla ' . ($tipo === 'frente' ? 'frontal' : 'trasera') . ' guardada con éxito',
            'url' => $url,
            'tipo' => $tipo,
        ]);
    }

    /**
     * Restablece la plantilla a la versión oficial original
     */
    public function restablecerPlantilla(Request $request)
    {
        $this->autorizarAccesoCarnets();

        $tipo = $request->input('tipo', 'ambas');
        $filesToDelete = [];

        if ($tipo === 'frente' || $tipo === 'ambas') {
            $filesToDelete[] = public_path('image/custom-Credencial-frente.png');
            $filesToDelete[] = public_path('storage/carnets/Credencial-frente.png');
            $filesToDelete[] = storage_path('app/public/carnets/Credencial-frente.png');
        }

        if ($tipo === 'atras' || $tipo === 'ambas') {
            $filesToDelete[] = public_path('image/custom-Credencial-atras.png');
            $filesToDelete[] = public_path('storage/carnets/Credencial-atras.png');
            $filesToDelete[] = storage_path('app/public/carnets/Credencial-atras.png');
        }

        foreach ($filesToDelete as $file) {
            if (file_exists($file)) {
                @unlink($file);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Plantilla(s) restablecida(s) a la versión oficial por defecto',
            'frenteUrl' => CarnetService::getUrlPlantillaFrente(),
            'atrasUrl' => CarnetService::getUrlPlantillaAtras(),
        ]);
    }

    /**
     * Actualizar o recortar foto de un pastor directamente desde el Carnet Studio
     */
    public function actualizarFotoPastor(Request $request, int $id)
    {
        $this->autorizarAccesoCarnets();

        $pastor = Pastor::findOrFail($id);

        $request->validate([
            'foto' => 'required|string',
        ]);

        $dataUri = $request->input('foto');

        if (!preg_match('/^data:image\/(\w+);base64,/', $dataUri, $matches)) {
            return response()->json(['error' => 'Formato de imagen inválido'], 422);
        }

        $ext = strtolower($matches[1]);
        if (!in_array($ext, ['png', 'jpg', 'jpeg', 'webp'])) {
            $ext = 'png';
        }

        $base64Data = substr($dataUri, strpos($dataUri, ',') + 1);
        $decoded = base64_decode($base64Data);

        if ($decoded === false) {
            return response()->json(['error' => 'Error al decodificar imagen'], 422);
        }

        $destDir = public_path('pastores');
        if (!file_exists($destDir)) {
            mkdir($destDir, 0755, true);
        }

        $cleanCodigo = preg_replace('/\D/', '', (string)($pastor->codigo ?: $pastor->id));
        $filename = 'pastor_' . $cleanCodigo . '_' . time() . '.' . $ext;

        $docRoot = !empty($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/\\') : null;
        $targetDirs = array_filter(array_unique([
            public_path('pastores'),
            base_path('public/pastores'),
            $docRoot ? $docRoot . '/pastores' : null,
            base_path('../public_html/pastores'),
        ]));

        foreach ($targetDirs as $destDir) {
            if (!file_exists($destDir)) {
                @mkdir($destDir, 0755, true);
            }
            if (is_dir($destDir) && is_writable($destDir)) {
                @file_put_contents($destDir . '/' . $filename, $decoded);

                // Limpiar fotos anteriores del mismo pastor
                if ($pastor->foto && !str_starts_with($pastor->foto, 'http')) {
                    $oldBase = basename($pastor->foto);
                    if ($oldBase !== $filename && file_exists($destDir . '/' . $oldBase)) {
                        @unlink($destDir . '/' . $oldBase);
                    }
                }
            }
        }

        $pastor->foto = $filename;
        $pastor->save();

        return response()->json([
            'success' => true,
            'message' => 'Fotografía del pastor actualizada con éxito',
            'foto' => $pastor->foto,
            'foto_url' => '/' . 'pastores/' . $filename . '?v=' . time(),
        ]);
    }

    /**
     * Servir fotografía del pastor con tolerancia a mayúsculas/minúsculas, extensiones (.jpg vs .jpeg vs .png)
     * y variaciones de timestamp para evitar errores 404 si la imagen fue renombrada o actualizada.
     */
    public function servirFotoPastor(string $filename)
    {
        $cleanUrl = urldecode($filename);
        if (($posQ = strpos($cleanUrl, '?')) !== false) {
            $cleanUrl = substr($cleanUrl, 0, $posQ);
        }
        $basename = basename(ltrim($cleanUrl, '/\\'));
        if (!$basename) {
            abort(404, 'Nombre de imagen no especificado');
        }

        $docRoot = !empty($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/\\') : null;
        $candidateDirs = array_filter(array_unique([
            public_path('pastores'),
            base_path('public/pastores'),
            $docRoot ? $docRoot . '/pastores' : null,
            base_path('../public_html/pastores'),
            storage_path('app/carnets_cache'),
        ]));

        // 1. Coincidencia exacta de archivo
        foreach ($candidateDirs as $dir) {
            $full = $dir . DIRECTORY_SEPARATOR . $basename;
            if (file_exists($full) && is_file($full) && filesize($full) > 0) {
                return response()->file($full, [
                    'Content-Type' => mime_content_type($full) ?: 'image/png',
                    'Cache-Control' => 'public, max-age=86400',
                ]);
            }
        }

        // 2. Insensible a mayúsculas/minúsculas y variaciones de extensión (.jpg vs .jpeg vs .png)
        $basenameNoExt = pathinfo($basename, PATHINFO_FILENAME);
        foreach ($candidateDirs as $dir) {
            if (is_dir($dir)) {
                $files = @scandir($dir);
                if ($files) {
                    foreach ($files as $f) {
                        if ($f === '.' || $f === '..') continue;
                        if (strcasecmp($f, $basename) === 0 || strcasecmp(pathinfo($f, PATHINFO_FILENAME), $basenameNoExt) === 0) {
                            $full = $dir . DIRECTORY_SEPARATOR . $f;
                            if (is_file($full) && filesize($full) > 0) {
                                return response()->file($full, [
                                    'Content-Type' => mime_content_type($full) ?: 'image/png',
                                    'Cache-Control' => 'public, max-age=86400',
                                ]);
                            }
                        }
                    }
                }
            }
        }

        // 3. Tolerancia por identificador del pastor (pastor_{codigo}_* o pastor_{documento}_*)
        if (preg_match('/^pastor_(\d+)_/i', $basename, $m)) {
            $idOrDoc = $m[1];
            foreach ($candidateDirs as $dir) {
                if (is_dir($dir)) {
                    $matches = glob($dir . DIRECTORY_SEPARATOR . 'pastor_' . $idOrDoc . '_*');
                    if ($matches && count($matches) > 0) {
                        usort($matches, fn($a, $b) => filemtime($b) <=> filemtime($a));
                        $found = $matches[0];
                        if (is_file($found) && filesize($found) > 0) {
                            return response()->file($found, [
                                'Content-Type' => mime_content_type($found) ?: 'image/png',
                                'Cache-Control' => 'public, max-age=86400',
                            ]);
                        }
                    }
                }
            }
        }

        abort(404, 'Fotografía del pastor no encontrada');
    }

    /**
     * Ruta pública para verificar la validez de la credencial ministerial escaneando el QR
     */
    public function validarCredencial(string $codigo)
    {
        $pastor = Pastor::with(['estado', 'municipioModel', 'parroquia'])
            ->where('codigo', $codigo)
            ->orWhere('documento', $codigo)
            ->orWhere('id', $codigo)
            ->first();

        return Inertia::render('Public/ValidarCredencial', [
            'pastor' => $pastor ? [
                'id' => $pastor->id,
                'codigo' => $pastor->codigo,
                'nombres' => $pastor->nombres,
                'apellidos' => $pastor->apellidos,
                'documento' => $pastor->documento,
                'foto' => $pastor->foto,
                'nivel_ministerial' => $pastor->nivel_ministerial,
                'cargo_nacional' => $pastor->cargo_nacional,
                'zona' => $pastor->zona,
                'distrito' => $pastor->distrito,
                'status' => $pastor->status,
                'estado' => $pastor->estado?->nombre,
                'municipio' => $pastor->municipioModel?->nombre,
            ] : null,
            'codigoBuscado' => $codigo,
        ]);
    }
}

