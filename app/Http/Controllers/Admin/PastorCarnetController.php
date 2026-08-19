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
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:pastores,id',
        ]);

        $pastores = Pastor::whereIn('id', $request->input('ids'))->get();

        $fpdf = new CarnetFpdf('P', 'mm', 'Letter');
        $this->carnetService->generarPdfMasivo($pastores, $fpdf);

        $nombreArchivo = 'carnets_pastores_masivo.pdf';

        return response($fpdf->Output('S', $nombreArchivo))
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="' . $nombreArchivo . '"');
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

