<?php

namespace App\Services;

use App\Models\Iglesia;
use App\Models\Pastor;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PastorExcelExportService
{
    /**
     * Genera y descarga el libro de Excel con las tres pestañas:
     * 1. Pastores
     * 2. Extensiones
     * 3. Campos Blancos
     */
    public function export(array $filters = []): StreamedResponse
    {
        $zonaFilter = !empty($filters['zona']) ? trim((string) $filters['zona']) : null;
        $numZona = $zonaFilter ? preg_replace('/\D/', '', $zonaFilter) : null;

        // 1. Consultar Pastores
        $pastoresQuery = Pastor::with([
            'conyuge',
            'estado',
            'municipioModel',
            'parroquia',
            'iglesiasPrincipales',
            'iglesias',
        ]);

        if ($zonaFilter) {
            $pastoresQuery->where(function ($q) use ($zonaFilter, $numZona) {
                $q->where('zona', $zonaFilter);
                if (!empty($numZona)) {
                    $q->orWhere('zona', $numZona)
                      ->orWhere('zona', "Zona {$numZona}");
                }
            });
        }

        if (!empty($filters['distrito'])) {
            $distVal = trim((string) $filters['distrito']);
            $numDist = preg_replace('/\D/', '', $distVal);
            $pastoresQuery->where(function ($q) use ($distVal, $numDist) {
                $q->where('distrito', $distVal);
                if (!empty($numDist)) {
                    $q->orWhere('distrito', $numDist)
                      ->orWhere('distrito', "Distrito {$numDist}")
                      ->orWhere('distrito', "D-{$numDist}");
                }
            });
        }

        if (!empty($filters['nivel_ministerial'])) {
            $pastoresQuery->where('nivel_ministerial', $filters['nivel_ministerial']);
        }

        if (isset($filters['status']) && $filters['status'] !== '') {
            $pastoresQuery->where('status', (bool) $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $pastoresQuery->where(function ($q) use ($search) {
                $q->where('codigo', 'like', "%{$search}%")
                  ->orWhere('nombres', 'like', "%{$search}%")
                  ->orWhere('apellidos', 'like', "%{$search}%")
                  ->orWhere('documento', 'like', "%{$search}%")
                  ->orWhere('zona', 'like', "%{$search}%")
                  ->orWhere('distrito', 'like', "%{$search}%");
            });
        }

        $pastores = $pastoresQuery
            ->orderByRaw('CAST(zona AS UNSIGNED) ASC, zona ASC')
            ->orderBy('apellidos', 'asc')
            ->orderBy('nombres', 'asc')
            ->get();

        // 2. Consultar Extensiones (Iglesias)
        $extensionesQuery = Iglesia::with([
            'pastor',
            'estado',
            'municipio',
            'parroquia',
            'tipoLocal',
        ]);

        if ($zonaFilter) {
            $extensionesQuery->where(function ($q) use ($zonaFilter, $numZona) {
                $q->where('zona', $zonaFilter);
                if (!empty($numZona)) {
                    $q->orWhere('zona', $numZona)
                      ->orWhere('zona', "Zona {$numZona}");
                }
            });
        }

        if (!empty($filters['distrito'])) {
            $distVal = trim((string) $filters['distrito']);
            $numDist = preg_replace('/\D/', '', $distVal);
            $extensionesQuery->where(function ($q) use ($distVal, $numDist) {
                $q->where('distrito', $distVal);
                if (!empty($numDist)) {
                    $q->orWhere('distrito', $numDist)
                      ->orWhere('distrito', "Distrito {$numDist}")
                      ->orWhere('distrito', "D-{$numDist}");
                }
            });
        }

        $extensiones = $extensionesQuery
            ->orderByRaw('CAST(zona AS UNSIGNED) ASC, zona ASC')
            ->orderBy('nombre', 'asc')
            ->get();

        // 3. Consultar Campos Blancos (Extensiones con cantidad_campos_blancos > 0)
        $camposBlancosQuery = Iglesia::with([
            'pastor',
            'estado',
            'municipio',
            'parroquia',
            'tipoLocal',
        ])->where('cantidad_campos_blancos', '>', 0);

        if ($zonaFilter) {
            $camposBlancosQuery->where(function ($q) use ($zonaFilter, $numZona) {
                $q->where('zona', $zonaFilter);
                if (!empty($numZona)) {
                    $q->orWhere('zona', $numZona)
                      ->orWhere('zona', "Zona {$numZona}");
                }
            });
        }

        if (!empty($filters['distrito'])) {
            $distVal = trim((string) $filters['distrito']);
            $numDist = preg_replace('/\D/', '', $distVal);
            $camposBlancosQuery->where(function ($q) use ($distVal, $numDist) {
                $q->where('distrito', $distVal);
                if (!empty($numDist)) {
                    $q->orWhere('distrito', $numDist)
                      ->orWhere('distrito', "Distrito {$numDist}")
                      ->orWhere('distrito', "D-{$numDist}");
                }
            });
        }

        $camposBlancos = $camposBlancosQuery
            ->orderByRaw('CAST(zona AS UNSIGNED) ASC, zona ASC')
            ->orderBy('cantidad_campos_blancos', 'desc')
            ->orderBy('nombre', 'asc')
            ->get();

        // 4. Construir Spreadsheet
        $spreadsheet = new Spreadsheet();
        $spreadsheet->getProperties()
            ->setCreator('Movimiento Misionero Mundial Venezuela')
            ->setLastModifiedBy('Sistema MMM Venezuela')
            ->setTitle('Reporte de Pastores, Extensiones y Campos Blancos')
            ->setSubject('Directorio Oficial y Estadísticas Ecuestres')
            ->setDescription('Exportación generada automáticamente desde el Módulo de Pastores');

        $filterLabel = $numZona ? "ZONA {$numZona}" : ($zonaFilter ? strtoupper($zonaFilter) : 'TODAS LAS ZONAS (NACIONAL)');

        // Pestaña 1: Pastores
        $sheetPastores = $spreadsheet->getActiveSheet();
        $sheetPastores->setTitle('Pastores');
        $this->buildPastoresSheet($sheetPastores, $pastores, $filterLabel);

        // Pestaña 2: Extensiones
        $sheetExtensiones = $spreadsheet->createSheet();
        $sheetExtensiones->setTitle('Extensiones');
        $this->buildExtensionesSheet($sheetExtensiones, $extensiones, $filterLabel);

        // Pestaña 3: Campos Blancos
        $sheetCamposBlancos = $spreadsheet->createSheet();
        $sheetCamposBlancos->setTitle('Campos Blancos');
        $this->buildCamposBlancosSheet($sheetCamposBlancos, $camposBlancos, $filterLabel);

        // Volver a seleccionar la primera pestaña activa
        $spreadsheet->setActiveSheetIndex(0);

        // Nombre del archivo
        $cleanZoneName = $numZona ? "Zona_{$numZona}" : 'Nacional';
        $timestamp = Carbon::now()->format('Ymd_His');
        $filename = "MMM_Reporte_Pastores_{$cleanZoneName}_{$timestamp}.xlsx";

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'max-age=0, no-cache, no-store, must-revalidate',
            'Pragma' => 'public',
        ]);
    }

    /**
     * Construye la Pestaña 1: Pastores
     */
    protected function buildPastoresSheet($sheet, $pastores, string $filterLabel): void
    {
        $headers = [
            'N°',
            'CÓDIGO',
            'APELLIDOS',
            'NOMBRES',
            'CÉDULA / DOC.',
            'GÉNERO',
            'EDAD',
            'FECHA NAC.',
            'ESTADO CIVIL',
            'CÓNYUGE',
            'NIVEL MINISTERIAL',
            'CARGO NACIONAL',
            'ZONA',
            'DISTRITO',
            'TELÉFONO MÓVIL',
            'TELÉFONO HAB.',
            'CORREO ELECTRÓNICO',
            'ESTADO',
            'MUNICIPIO',
            'PARROQUIA',
            'DIRECCIÓN / RESIDENCIA',
            'EXTENSIÓN ASIGNADA',
            'ESTATUS',
            'AÑO PROMOCIÓN',
            'TIEMPO COLABORANDO',
            'GRADO INSTRUCCIÓN',
            'ESTUDIO TEOLÓGICO',
        ];

        $lastColLetter = Coordinate::stringFromColumnIndex(count($headers));

        // Encabezado corporativo MMM
        $sheet->setCellValue('A1', 'MOVIMIENTO MISIONERO MUNDIAL - VENEZUELA');
        $sheet->mergeCells("A1:{$lastColLetter}1");
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E293B']], // Slate-800
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(32);

        $subtitle = "DIRECTORIO OFICIAL DE PASTORES | FILTRO: {$filterLabel} | EMISIÓN: " . Carbon::now()->format('d/m/Y h:i A') . " | TOTAL: " . $pastores->count() . " PASTORES";
        $sheet->setCellValue('A2', $subtitle);
        $sheet->mergeCells("A2:{$lastColLetter}2");
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => '1E293B']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E2E8F0']], // Slate-200
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(22);

        // Fila 3 en blanco
        $sheet->getRowDimension(3)->setRowHeight(8);

        // Fila 4: Cabecera de columnas
        $headerRow = 4;
        foreach ($headers as $colIdx => $headerText) {
            $colLetter = Coordinate::stringFromColumnIndex($colIdx + 1);
            $sheet->setCellValue("{$colLetter}{$headerRow}", $headerText);
        }

        $sheet->getStyle("A{$headerRow}:{$lastColLetter}{$headerRow}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '312E81']], // Indigo-900
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '4338CA']]],
        ]);
        $sheet->getRowDimension($headerRow)->setRowHeight(26);

        // Datos
        $currentRow = 5;
        foreach ($pastores as $index => $pastor) {
            $isEven = ($index % 2 === 0);
            $rowBg = $isEven ? 'FFFFFF' : 'F8FAFC';

            // Extensión asignada (principal o vinculada)
            $iglesiaNombre = 'Sin iglesia asignada';
            if ($pastor->iglesiasPrincipales->isNotEmpty()) {
                $iglesiaNombre = $pastor->iglesiasPrincipales->pluck('nombre')->join(', ');
            } elseif ($pastor->iglesias->isNotEmpty()) {
                $iglesiaNombre = $pastor->iglesias->pluck('nombre')->join(', ');
            }

            // Cónyuge
            $conyugeText = 'N/A';
            if ($pastor->conyuge) {
                $conyugeText = "{$pastor->conyuge->nombres} {$pastor->conyuge->apellidos}";
            } elseif (!empty($pastor->nombre_conyuge)) {
                $conyugeText = $pastor->nombre_conyuge;
            }

            $sheet->setCellValue("A{$currentRow}", $index + 1);
            $sheet->setCellValueExplicit("B{$currentRow}", $pastor->codigo ?: '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet->setCellValue("C{$currentRow}", $pastor->apellidos ?: '');
            $sheet->setCellValue("D{$currentRow}", $pastor->nombres ?: '');
            $sheet->setCellValueExplicit("E{$currentRow}", $pastor->documento ?: '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet->setCellValue("F{$currentRow}", $pastor->genero ?: '');
            $sheet->setCellValue("G{$currentRow}", $pastor->edad ?: '');
            $sheet->setCellValue("H{$currentRow}", $pastor->fe_nacimiento ? Carbon::parse($pastor->fe_nacimiento)->format('d/m/Y') : '');
            $sheet->setCellValue("I{$currentRow}", $pastor->estado_civil ?: '');
            $sheet->setCellValue("J{$currentRow}", $conyugeText);
            $sheet->setCellValue("K{$currentRow}", $pastor->nivel_ministerial ?: '');
            $sheet->setCellValue("L{$currentRow}", $pastor->cargo_nacional ?: 'Ninguno');
            $sheet->setCellValue("M{$currentRow}", $pastor->zona ? "Zona {$pastor->zona}" : 'N/A');
            $sheet->setCellValue("N{$currentRow}", $pastor->distrito ? "Distrito {$pastor->distrito}" : 'N/A');
            $sheet->setCellValueExplicit("O{$currentRow}", $pastor->telefono_tlf ?: '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("P{$currentRow}", $pastor->telefono_hab ?: '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet->setCellValue("Q{$currentRow}", $pastor->email ?: '');
            $sheet->setCellValue("R{$currentRow}", $pastor->estado?->nombre ?: '');
            $sheet->setCellValue("S{$currentRow}", $pastor->municipioModel?->nombre ?: ($pastor->municipio ?: ''));
            $sheet->setCellValue("T{$currentRow}", $pastor->parroquia?->nombre ?: '');
            $sheet->setCellValue("U{$currentRow}", trim("{$pastor->calle_avenida} {$pastor->urbanizacion} {$pastor->edificio_casa_quinta}"));
            $sheet->setCellValue("V{$currentRow}", $iglesiaNombre);
            $sheet->setCellValue("W{$currentRow}", $pastor->status ? 'Activo' : 'Inactivo');
            $sheet->setCellValue("X{$currentRow}", $pastor->ano_promocion ?: '');
            $sheet->setCellValue("Y{$currentRow}", $pastor->tiempo_colaborando ?: '');
            $sheet->setCellValue("Z{$currentRow}", $pastor->grado_instruccion ?: '');
            $sheet->setCellValue("AA{$currentRow}", $pastor->estudio_teologico ? ($pastor->titulo_teologico ?: 'Sí') : 'No');

            // Formato de fila
            $sheet->getStyle("A{$currentRow}:{$lastColLetter}{$currentRow}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rowBg]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            // Alineaciones específicas
            $sheet->getStyle("A{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("B{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("E{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("F{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("G{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("H{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("M{$currentRow}:N{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("W{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Color del estatus
            if (!$pastor->status) {
                $sheet->getStyle("W{$currentRow}")->getFont()->getColor()->setRGB('DC2626'); // Red-600
                $sheet->getStyle("W{$currentRow}")->getFont()->setBold(true);
            } else {
                $sheet->getStyle("W{$currentRow}")->getFont()->getColor()->setRGB('16A34A'); // Green-600
                $sheet->getStyle("W{$currentRow}")->getFont()->setBold(true);
            }

            $sheet->getRowDimension($currentRow)->setRowHeight(21);
            $currentRow++;
        }

        // Auto-filtro y congelar encabezado
        $lastDataRow = max($currentRow - 1, $headerRow);
        $sheet->setAutoFilter("A{$headerRow}:{$lastColLetter}{$lastDataRow}");
        $sheet->freezePane("A5");

        // Auto-ajustar ancho de columnas
        foreach (range(1, count($headers)) as $colIdx) {
            $colLetter = Coordinate::stringFromColumnIndex($colIdx);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }
    }

    /**
     * Construye la Pestaña 2: Extensiones
     */
    protected function buildExtensionesSheet($sheet, $extensiones, string $filterLabel): void
    {
        $headers = [
            'N°',
            'NOMBRE DE LA EXTENSIÓN / IGLESIA',
            'ZONA',
            'DISTRITO',
            'PASTOR RESPONSABLE',
            'CÉDULA PASTOR',
            'TELÉFONO PASTOR',
            'ESTADO',
            'MUNICIPIO',
            'PARROQUIA',
            'SECTOR / DIRECCIÓN',
            'TIPO DE LOCAL',
            'TELÉFONO EXTENSIÓN',
            'MIEMBROS ACTIVOS',
            'MIEMBROS PROBANTES',
            'TOTAL MEMBRESÍA',
            'CANT. CAMPOS BLANCOS',
            'MEDIO COMUNICACIÓN',
            'ESTATUS',
            'FECHA FUNDACIÓN',
            'AÑOS ACTIVA',
        ];

        $lastColLetter = Coordinate::stringFromColumnIndex(count($headers));

        // Encabezado corporativo MMM
        $sheet->setCellValue('A1', 'MOVIMIENTO MISIONERO MUNDIAL - VENEZUELA');
        $sheet->mergeCells("A1:{$lastColLetter}1");
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A8A']], // Blue-900
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(32);

        $subtitle = "DIRECTORIO OFICIAL DE EXTENSIONES E IGLESIAS | FILTRO: {$filterLabel} | EMISIÓN: " . Carbon::now()->format('d/m/Y h:i A') . " | TOTAL: " . $extensiones->count() . " EXTENSIONES";
        $sheet->setCellValue('A2', $subtitle);
        $sheet->mergeCells("A2:{$lastColLetter}2");
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => '1E3A8A']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'DBEAFE']], // Blue-100
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(22);

        // Fila 3 en blanco
        $sheet->getRowDimension(3)->setRowHeight(8);

        // Fila 4: Cabecera de columnas
        $headerRow = 4;
        foreach ($headers as $colIdx => $headerText) {
            $colLetter = Coordinate::stringFromColumnIndex($colIdx + 1);
            $sheet->setCellValue("{$colLetter}{$headerRow}", $headerText);
        }

        $sheet->getStyle("A{$headerRow}:{$lastColLetter}{$headerRow}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1D4ED8']], // Blue-700
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '2563EB']]],
        ]);
        $sheet->getRowDimension($headerRow)->setRowHeight(26);

        // Datos
        $currentRow = 5;
        $startDataRow = $currentRow;

        foreach ($extensiones as $index => $ext) {
            $isEven = ($index % 2 === 0);
            $rowBg = $isEven ? 'FFFFFF' : 'F8FAFC';

            $pastorNombre = $ext->pastor ? "{$ext->pastor->nombres} {$ext->pastor->apellidos}" : 'Sin pastor asignado';
            $pastorCedula = $ext->pastor?->documento ?: '';
            $pastorTelefono = $ext->pastor?->telefono_tlf ?: ($ext->pastor?->telefono_hab ?: '');

            $activos = (int) ($ext->miembros_activos ?? 0);
            $probantes = (int) ($ext->miembro_probante ?? 0);
            $totalMembresia = $activos + $probantes;
            $camposBlancos = (int) ($ext->cantidad_campos_blancos ?? 0);

            $medioComText = 'No';
            if ($ext->posee_medio_comunicacion) {
                $medioComText = $ext->medio_comunicacion ?: ($ext->nombre_medio_comunicacion ?: 'Sí');
            }

            $sheet->setCellValue("A{$currentRow}", $index + 1);
            $sheet->setCellValue("B{$currentRow}", $ext->nombre ?: '');
            $sheet->setCellValue("C{$currentRow}", $ext->zona ? "Zona {$ext->zona}" : 'N/A');
            $sheet->setCellValue("D{$currentRow}", $ext->distrito ? "Distrito {$ext->distrito}" : 'N/A');
            $sheet->setCellValue("E{$currentRow}", $pastorNombre);
            $sheet->setCellValueExplicit("F{$currentRow}", $pastorCedula, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("G{$currentRow}", $pastorTelefono, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet->setCellValue("H{$currentRow}", $ext->estado?->nombre ?: '');
            $sheet->setCellValue("I{$currentRow}", $ext->municipio?->nombre ?: '');
            $sheet->setCellValue("J{$currentRow}", $ext->parroquia?->nombre ?: '');
            $sheet->setCellValue("K{$currentRow}", trim("{$ext->sector} {$ext->calle} {$ext->avenida} {$ext->direccion}"));
            $sheet->setCellValue("L{$currentRow}", $ext->tipoLocal?->nombre ?: 'N/A');
            $sheet->setCellValueExplicit("M{$currentRow}", $ext->telefono ?: '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            
            $sheet->setCellValue("N{$currentRow}", $activos);
            $sheet->setCellValue("O{$currentRow}", $probantes);
            $sheet->setCellValue("P{$currentRow}", $totalMembresia);
            $sheet->setCellValue("Q{$currentRow}", $camposBlancos);

            $sheet->setCellValue("R{$currentRow}", $medioComText);
            $sheet->setCellValue("S{$currentRow}", $ext->activa ? 'Activa' : 'Inactiva');
            $sheet->setCellValue("T{$currentRow}", $ext->fecha_fundacion ? Carbon::parse($ext->fecha_fundacion)->format('d/m/Y') : '');
            $sheet->setCellValue("U{$currentRow}", $ext->anios_activa ?: '');

            // Formato de fila
            $sheet->getStyle("A{$currentRow}:{$lastColLetter}{$currentRow}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rowBg]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            // Alineaciones
            $sheet->getStyle("A{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("C{$currentRow}:D{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("F{$currentRow}:G{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("M{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("N{$currentRow}:Q{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("N{$currentRow}:Q{$currentRow}")->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1);
            $sheet->getStyle("S{$currentRow}:U{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            if (!$ext->activa) {
                $sheet->getStyle("S{$currentRow}")->getFont()->getColor()->setRGB('DC2626');
                $sheet->getStyle("S{$currentRow}")->getFont()->setBold(true);
            } else {
                $sheet->getStyle("S{$currentRow}")->getFont()->getColor()->setRGB('16A34A');
                $sheet->getStyle("S{$currentRow}")->getFont()->setBold(true);
            }

            $sheet->getRowDimension($currentRow)->setRowHeight(21);
            $currentRow++;
        }

        // Fila de TOTALES
        if ($extensiones->isNotEmpty()) {
            $totalRow = $currentRow;
            $sheet->setCellValue("B{$totalRow}", 'TOTALES GENERALES:');
            $sheet->setCellValue("N{$totalRow}", "=SUM(N{$startDataRow}:N" . ($totalRow - 1) . ")");
            $sheet->setCellValue("O{$totalRow}", "=SUM(O{$startDataRow}:O" . ($totalRow - 1) . ")");
            $sheet->setCellValue("P{$totalRow}", "=SUM(P{$startDataRow}:P" . ($totalRow - 1) . ")");
            $sheet->setCellValue("Q{$totalRow}", "=SUM(Q{$startDataRow}:Q" . ($totalRow - 1) . ")");

            $sheet->getStyle("A{$totalRow}:{$lastColLetter}{$totalRow}")->applyFromArray([
                'font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => '1E3A8A']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'EFF6FF']], // Blue-50
                'borders' => [
                    'top' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '1D4ED8']],
                    'bottom' => ['borderStyle' => Border::BORDER_DOUBLE, 'color' => ['rgb' => '1D4ED8']],
                ],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $sheet->getStyle("B{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("N{$totalRow}:Q{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("N{$totalRow}:Q{$totalRow}")->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1);
            $sheet->getRowDimension($totalRow)->setRowHeight(24);
            $currentRow++;
        }

        // Auto-filtro y congelar encabezado
        $lastDataRow = max($currentRow - 1, $headerRow);
        $sheet->setAutoFilter("A{$headerRow}:{$lastColLetter}{$lastDataRow}");
        $sheet->freezePane("A5");

        // Auto-ajustar ancho de columnas
        foreach (range(1, count($headers)) as $colIdx) {
            $colLetter = Coordinate::stringFromColumnIndex($colIdx);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }
    }

    /**
     * Construye la Pestaña 3: Campos Blancos
     */
    protected function buildCamposBlancosSheet($sheet, $camposBlancos, string $filterLabel): void
    {
        $headers = [
            'N°',
            'EXTENSIÓN / IGLESIA MATRIZ',
            'CANT. CAMPOS BLANCOS',
            'ZONA',
            'DISTRITO',
            'PASTOR RESPONSABLE',
            'CÉDULA PASTOR',
            'TELÉFONO PASTOR',
            'ESTADO',
            'MUNICIPIO',
            'PARROQUIA',
            'SECTOR / UBICACIÓN',
            'TIPO DE LOCAL MATRIZ',
            'MEMBRESÍA MATRIZ',
            'ESTATUS EXTENSIÓN',
        ];

        $lastColLetter = Coordinate::stringFromColumnIndex(count($headers));

        // Encabezado corporativo MMM
        $sheet->setCellValue('A1', 'MOVIMIENTO MISIONERO MUNDIAL - VENEZUELA');
        $sheet->mergeCells("A1:{$lastColLetter}1");
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '581C87']], // Purple-900
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(32);

        $totalCamposBlancosSum = $camposBlancos->sum('cantidad_campos_blancos');
        $subtitle = "REPORTE DE CAMPOS BLANCOS Y OBRAS ANEXAS | FILTRO: {$filterLabel} | EMISIÓN: " . Carbon::now()->format('d/m/Y h:i A') . " | TOTAL CAMPOS BLANCOS: {$totalCamposBlancosSum}";
        $sheet->setCellValue('A2', $subtitle);
        $sheet->mergeCells("A2:{$lastColLetter}2");
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => '581C87']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F3E8FF']], // Purple-100
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(22);

        // Fila 3 en blanco
        $sheet->getRowDimension(3)->setRowHeight(8);

        // Fila 4: Cabecera de columnas
        $headerRow = 4;
        foreach ($headers as $colIdx => $headerText) {
            $colLetter = Coordinate::stringFromColumnIndex($colIdx + 1);
            $sheet->setCellValue("{$colLetter}{$headerRow}", $headerText);
        }

        $sheet->getStyle("A{$headerRow}:{$lastColLetter}{$headerRow}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '7E22CE']], // Purple-700
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '9333EA']]],
        ]);
        $sheet->getRowDimension($headerRow)->setRowHeight(26);

        // Datos
        $currentRow = 5;
        $startDataRow = $currentRow;

        foreach ($camposBlancos as $index => $ext) {
            $isEven = ($index % 2 === 0);
            $rowBg = $isEven ? 'FFFFFF' : 'FDF4FF'; // Purple tint

            $pastorNombre = $ext->pastor ? "{$ext->pastor->nombres} {$ext->pastor->apellidos}" : 'Sin pastor asignado';
            $pastorCedula = $ext->pastor?->documento ?: '';
            $pastorTelefono = $ext->pastor?->telefono_tlf ?: ($ext->pastor?->telefono_hab ?: '');

            $activos = (int) ($ext->miembros_activos ?? 0);
            $probantes = (int) ($ext->miembro_probante ?? 0);
            $totalMembresia = $activos + $probantes;
            $cantCB = (int) ($ext->cantidad_campos_blancos ?? 0);

            $sheet->setCellValue("A{$currentRow}", $index + 1);
            $sheet->setCellValue("B{$currentRow}", $ext->nombre ?: '');
            $sheet->setCellValue("C{$currentRow}", $cantCB);
            $sheet->setCellValue("D{$currentRow}", $ext->zona ? "Zona {$ext->zona}" : 'N/A');
            $sheet->setCellValue("E{$currentRow}", $ext->distrito ? "Distrito {$ext->distrito}" : 'N/A');
            $sheet->setCellValue("F{$currentRow}", $pastorNombre);
            $sheet->setCellValueExplicit("G{$currentRow}", $pastorCedula, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("H{$currentRow}", $pastorTelefono, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet->setCellValue("I{$currentRow}", $ext->estado?->nombre ?: '');
            $sheet->setCellValue("J{$currentRow}", $ext->municipio?->nombre ?: '');
            $sheet->setCellValue("K{$currentRow}", $ext->parroquia?->nombre ?: '');
            $sheet->setCellValue("L{$currentRow}", trim("{$ext->sector} {$ext->calle} {$ext->avenida} {$ext->direccion}"));
            $sheet->setCellValue("M{$currentRow}", $ext->tipoLocal?->nombre ?: 'N/A');
            $sheet->setCellValue("N{$currentRow}", $totalMembresia);
            $sheet->setCellValue("O{$currentRow}", $ext->activa ? 'Activa' : 'Inactiva');

            // Formato de fila
            $sheet->getStyle("A{$currentRow}:{$lastColLetter}{$currentRow}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rowBg]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            // Alineaciones
            $sheet->getStyle("A{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("C{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("C{$currentRow}")->getFont()->setBold(true)->getColor()->setRGB('6B21A8');
            $sheet->getStyle("D{$currentRow}:E{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("G{$currentRow}:H{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("N{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("N{$currentRow}")->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1);
            $sheet->getStyle("O{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            if (!$ext->activa) {
                $sheet->getStyle("O{$currentRow}")->getFont()->getColor()->setRGB('DC2626');
                $sheet->getStyle("O{$currentRow}")->getFont()->setBold(true);
            } else {
                $sheet->getStyle("O{$currentRow}")->getFont()->getColor()->setRGB('16A34A');
                $sheet->getStyle("O{$currentRow}")->getFont()->setBold(true);
            }

            $sheet->getRowDimension($currentRow)->setRowHeight(21);
            $currentRow++;
        }

        // Fila de TOTALES
        if ($camposBlancos->isNotEmpty()) {
            $totalRow = $currentRow;
            $sheet->setCellValue("B{$totalRow}", 'TOTAL CAMPOS BLANCOS:');
            $sheet->setCellValue("C{$totalRow}", "=SUM(C{$startDataRow}:C" . ($totalRow - 1) . ")");

            $sheet->getStyle("A{$totalRow}:{$lastColLetter}{$totalRow}")->applyFromArray([
                'font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => '581C87']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FAF5FF']], // Purple-50
                'borders' => [
                    'top' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '7E22CE']],
                    'bottom' => ['borderStyle' => Border::BORDER_DOUBLE, 'color' => ['rgb' => '7E22CE']],
                ],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $sheet->getStyle("B{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("C{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getRowDimension($totalRow)->setRowHeight(24);
            $currentRow++;
        }

        // Auto-filtro y congelar encabezado
        $lastDataRow = max($currentRow - 1, $headerRow);
        $sheet->setAutoFilter("A{$headerRow}:{$lastColLetter}{$lastDataRow}");
        $sheet->freezePane("A5");

        // Auto-ajustar ancho de columnas
        foreach (range(1, count($headers)) as $colIdx) {
            $colLetter = Coordinate::stringFromColumnIndex($colIdx);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }
    }
}
