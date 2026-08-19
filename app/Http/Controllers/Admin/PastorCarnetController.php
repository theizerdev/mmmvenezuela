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
     * Descargar / Previsualizar el PDF del carnet de un pastor (Frontal + Trasero)
     */
    public function carnetPdf(int $id)
    {
        $pastor = Pastor::findOrFail($id);

        $pdf = $this->carnetService->generarPdfParaPastor($pastor);
        $nombreArchivo = 'carnet_pastor_' . str_replace(' ', '_', $pastor->nombres . '_' . $pastor->apellidos) . '.pdf';

        return $pdf->stream($nombreArchivo);
    }

    /**
     * Generar pliego PDF masivo para una lista de pastores seleccionados
     */
    public function bulkCarnetPdf(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:pastores,id',
        ]);

        $pastores = Pastor::whereIn('id', $request->input('ids'))->get();

        $pdf = $this->carnetService->generarPdfMasivo($pastores);
        $nombreArchivo = 'carnets_pastores_masivo.pdf';

        return $pdf->stream($nombreArchivo);
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

