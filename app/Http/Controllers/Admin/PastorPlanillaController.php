<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pastor;
use App\Services\PlanillaService;
use Codedge\Fpdf\Fpdf\Fpdf;

class PastorPlanillaController extends Controller
{
    protected $planillaService;

    public function __construct(PlanillaService $planillaService)
    {
        $this->planillaService = $planillaService;
    }

    public function planilla($id)
    {
        $pastor = Pastor::with(['estado', 'municipioModel', 'parroquia', 'conyuge'])->findOrFail($id);

        $fpdf = new Fpdf();
        $this->planillaService->generarPdfParaPastor($pastor, $fpdf);

        $nombre_archivo = 'planilla_pastor_' . str_replace(' ', '_', $pastor->nombres . '_' . $pastor->apellidos) . '.pdf';

        return response($fpdf->Output('S', $nombre_archivo))
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="' . $nombre_archivo . '"');
    }
}
