<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PastorExcelExportService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PastorExportController extends Controller
{
    protected PastorExcelExportService $exportService;

    public function __construct(PastorExcelExportService $exportService)
    {
        $this->exportService = $exportService;
    }

    /**
     * Exporta el libro de Excel con las pestañas de Pastores, Extensiones y Campos Blancos.
     * Filtra según la zona seleccionada (o todas las zonas si no se especifica).
     */
    public function export(Request $request): StreamedResponse
    {
        $filters = $request->only([
            'zona',
            'distrito',
            'nivel_ministerial',
            'status',
            'search',
        ]);

        return $this->exportService->export($filters);
    }
}
