<?php

namespace App\Services;

use App\Models\Actividad;
use App\Models\Asistencia;
use App\Models\Pastor;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AsistenciaExcelExportService
{
    /**
     * Genera y descarga el archivo Excel (.xlsx) con pestañas para el reporte de asistencia
     */
    public function export(int $actividadId): StreamedResponse
    {
        $actividad = Actividad::with(['sesiones'])->findOrFail($actividadId);

        // 1. Obtener padrón de pastores convocados
        $pastoresConvocadosQuery = Pastor::where('status', true);
        if ($actividad->zona) {
            $pastoresConvocadosQuery->where('zona', $actividad->zona);
        }
        $pastoresConvocados = $pastoresConvocadosQuery
            ->with(['estado', 'municipioModel'])
            ->orderBy('apellidos')
            ->orderBy('nombres')
            ->get();

        $totalPadron = $pastoresConvocados->count();

        // 2. Obtener asistencias registradas
        $asistencias = Asistencia::with(['pastor.estado', 'pastor.municipioModel', 'sesion', 'registradoPor'])
            ->where('actividad_id', $actividad->id)
            ->orderBy('fecha_registro', 'asc')
            ->get();

        $pastorIdsPresentes = $asistencias->pluck('pastor_id')->unique()->filter()->values();
        $totalPresentes = $pastorIdsPresentes->count();
        $porcentajeQuorum = $totalPadron > 0 ? round(($totalPresentes / $totalPadron) * 100, 1) : 0;

        $totalConConyuge = $asistencias->where('asistio_con_conyuge', true)->unique('pastor_id')->count();
        $totalKits = $asistencias->where('kit_entregado', true)->unique('pastor_id')->count();
        $totalComidas = $asistencias->where('comida_entregada', true)->count();
        $totalAusentes = max(0, $totalPadron - $totalPresentes);

        // 3. Pastores ausentes / pendientes
        $pastoresAusentes = $pastoresConvocados->whereNotIn('id', $pastorIdsPresentes)->values();

        // 4. Desglose por grados ministeriales
        $gradosConvocados = $pastoresConvocados->groupBy('nivel_ministerial')->map->count();
        $gradosPresentes = Pastor::whereIn('id', $pastorIdsPresentes)->get()->groupBy('nivel_ministerial')->map->count();

        // 5. Desglose por zonas
        $zonasConvocadas = $pastoresConvocados->whereNotNull('zona')->groupBy('zona')->map->count();
        $zonasPresentes = Pastor::whereIn('id', $pastorIdsPresentes)->whereNotNull('zona')->get()->groupBy('zona')->map->count();

        // 6. Construir Spreadsheet con PhpOffice
        $spreadsheet = new Spreadsheet();
        $spreadsheet->getProperties()
            ->setCreator('Movimiento Misionero Mundial Venezuela')
            ->setLastModifiedBy('Sistema MMM Venezuela')
            ->setTitle("Reporte Asistencia - {$actividad->nombre}")
            ->setSubject('Control de Asistencia y Quórum Ministerial')
            ->setDescription('Informe detallado de asistentes, quórum y pastores pendientes generado desde el Monitor de Actividades');

        // Pestaña 1: Resumen y Quórum
        $sheetResumen = $spreadsheet->getActiveSheet();
        $sheetResumen->setTitle('Resumen y Quórum');
        $this->buildResumenSheet(
            $sheetResumen,
            $actividad,
            $totalPadron,
            $totalPresentes,
            $porcentajeQuorum,
            $totalConConyuge,
            $totalKits,
            $totalComidas,
            $totalAusentes,
            $gradosConvocados,
            $gradosPresentes,
            $zonasConvocadas,
            $zonasPresentes
        );

        // Pestaña 2: Asistentes
        $sheetAsistentes = $spreadsheet->createSheet();
        $sheetAsistentes->setTitle('Asistentes Registrados');
        $this->buildAsistentesSheet($sheetAsistentes, $actividad, $asistencias);

        // Pestaña 3: Pendientes
        $sheetPendientes = $spreadsheet->createSheet();
        $sheetPendientes->setTitle('Pendientes por Asistir');
        $this->buildPendientesSheet($sheetPendientes, $actividad, $pastoresAusentes);

        // Dejar activa la primera pestaña
        $spreadsheet->setActiveSheetIndex(0);

        // Generar descarga
        $slugActividad = preg_replace('/[^A-Za-z0-9_]/', '_', $actividad->nombre);
        $timestamp = Carbon::now()->format('Ymd_His');
        $filename = "MMM_Asistencia_{$slugActividad}_{$timestamp}.xlsx";

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
     * Construye la Pestaña 1: Resumen Ejecutivo, Quórum y Estadísticas
     */
    protected function buildResumenSheet(
        $sheet,
        Actividad $actividad,
        int $totalPadron,
        int $totalPresentes,
        float $porcentajeQuorum,
        int $totalConConyuge,
        int $totalKits,
        int $totalComidas,
        int $totalAusentes,
        $gradosConvocados,
        $gradosPresentes,
        $zonasConvocadas,
        $zonasPresentes
    ): void {
        // Encabezado institucional
        $sheet->setCellValue('A1', 'MOVIMIENTO MISIONERO MUNDIAL - VENEZUELA');
        $sheet->mergeCells('A1:G1');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E293B']], // Slate-800
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(32);

        $sheet->setCellValue('A2', "INFORME EJECUTIVO DE ASISTENCIA Y QUÓRUM MINISTERIAL | {$actividad->nombre}");
        $sheet->mergeCells('A2:G2');
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => '1E293B']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E2E8F0']], // Slate-200
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(22);

        // Fila 4: Datos Generales del Evento
        $sheet->setCellValue('A4', 'DATOS GENERALES DE LA ACTIVIDAD');
        $sheet->mergeCells('A4:G4');
        $sheet->getStyle('A4')->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '312E81']], // Indigo-900
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(4)->setRowHeight(22);

        $datosEvento = [
            ['Actividad:', $actividad->nombre, 'Fechas:', Carbon::parse($actividad->fecha_inicio)->format('d/m/Y') . ' al ' . Carbon::parse($actividad->fecha_fin)->format('d/m/Y')],
            ['Tipo:', ucfirst($actividad->tipo), 'Lugar:', $actividad->lugar ?: 'No especificado'],
            ['Zona Convocada:', $actividad->zona ? "Zona {$actividad->zona}" : 'Nacional (Todas las Zonas)', 'Emisión Reporte:', Carbon::now()->format('d/m/Y h:i A')],
        ];

        $r = 5;
        foreach ($datosEvento as $fila) {
            $sheet->setCellValue("A{$r}", $fila[0]);
            $sheet->setCellValue("B{$r}", $fila[1]);
            $sheet->mergeCells("B{$r}:C{$r}");
            $sheet->setCellValue("D{$r}", $fila[2]);
            $sheet->setCellValue("E{$r}", $fila[3]);
            $sheet->mergeCells("E{$r}:G{$r}");

            $sheet->getStyle("A{$r}")->getFont()->setBold(true);
            $sheet->getStyle("D{$r}")->getFont()->setBold(true);
            $sheet->getStyle("A{$r}:G{$r}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F8FAFC']],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $sheet->getRowDimension($r)->setRowHeight(20);
            $r++;
        }

        // Fila 9: Indicadores de Quórum
        $r = 9;
        $sheet->setCellValue("A{$r}", 'MÉTRICAS CLAVE Y QUÓRUM ALCANZADO');
        $sheet->mergeCells("A{$r}:G{$r}");
        $sheet->getStyle("A{$r}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0F766E']], // Teal-700
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension($r)->setRowHeight(22);

        $r = 10;
        $metricasCards = [
            ['PADRÓN CONVOCADO', $totalPadron, 'Total pastores en convocatoria'],
            ['ASISTENTES PRESENTES', $totalPresentes, 'Pastores acreditados en sala'],
            ['% QUÓRUM ALCANZADO', "{$porcentajeQuorum}%", 'Porcentaje de participación legal'],
            ['CÓNYUGES PRESENTES', $totalConConyuge, 'Acompañantes en sala'],
            ['KITS ENTREGADOS', $totalKits, 'Material ministerial acreditado'],
            ['COMIDAS SERVIDAS', $totalComidas, 'Raciones de comedor registradas'],
            ['PASTORES PENDIENTES', $totalAusentes, 'Pastores ausentes por registrar'],
        ];

        foreach ($metricasCards as $m) {
            $sheet->setCellValue("A{$r}", $m[0]);
            $sheet->setCellValue("B{$r}", $m[1]);
            $sheet->setCellValue("C{$r}", $m[2]);
            $sheet->mergeCells("C{$r}:G{$r}");

            $sheet->getStyle("A{$r}")->getFont()->setBold(true)->setSize(9);
            $sheet->getStyle("B{$r}")->applyFromArray([
                'font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => '1E3A8A']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
            $sheet->getStyle("A{$r}:G{$r}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F1F5F9']],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'CBD5E1']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $sheet->getRowDimension($r)->setRowHeight(20);
            $r++;
        }

        // Fila de separación
        $r++;

        // Tabla 1: Grados Ministeriales
        $sheet->setCellValue("A{$r}", 'DESGLOSE POR GRADO MINISTERIAL');
        $sheet->mergeCells("A{$r}:D{$r}");
        $sheet->getStyle("A{$r}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4338CA']], // Indigo-700
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension($r)->setRowHeight(22);
        $r++;

        // Headers tabla grados
        $sheet->setCellValue("A{$r}", 'GRADO MINISTERIAL');
        $sheet->setCellValue("B{$r}", 'CONVOCADOS');
        $sheet->setCellValue("C{$r}", 'PRESENTES');
        $sheet->setCellValue("D{$r}", '% ASISTENCIA');
        $sheet->getStyle("A{$r}:D{$r}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 9, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E1B4B']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $r++;

        $gradosLista = ['Ministro Ordenado', 'Licenciado', 'Laico', 'Pastor Asociado'];
        foreach ($gradosLista as $grado) {
            $convocados = $gradosConvocados->get($grado, 0);
            $presentes = $gradosPresentes->get($grado, 0);
            $pct = $convocados > 0 ? round(($presentes / $convocados) * 100, 1) : 0;

            $sheet->setCellValue("A{$r}", $grado);
            $sheet->setCellValue("B{$r}", $convocados);
            $sheet->setCellValue("C{$r}", $presentes);
            $sheet->setCellValue("D{$r}", "{$pct}%");

            $sheet->getStyle("A{$r}:D{$r}")->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $sheet->getStyle("B{$r}:D{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getRowDimension($r)->setRowHeight(19);
            $r++;
        }

        // Auto-size columns
        foreach (range('A', 'G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }

    /**
     * Construye la Pestaña 2: Registro Detallado de Asistentes Acreditados
     */
    protected function buildAsistentesSheet($sheet, Actividad $actividad, $asistencias): void
    {
        $headers = [
            'N°',
            'CÓDIGO',
            'CÉDULA / DOC.',
            'APELLIDOS',
            'NOMBRES',
            'GRADO MINISTERIAL',
            'CARGO NACIONAL',
            'ZONA',
            'DISTRITO',
            'ESTADO',
            'MUNICIPIO',
            'SESIÓN / BLOQUE',
            'FECHA Y HORA MARCAJE',
            'MÉTODO MARCAJE',
            '¿CON CÓNYUGE?',
            'NOMBRE CÓNYUGE / ACOMPAÑANTE',
            '¿KIT ENTREGADO?',
            '¿COMIDA SERVIDA?',
            'OBSERVACIONES',
            'REGISTRADO POR',
        ];

        $lastColLetter = Coordinate::stringFromColumnIndex(count($headers));

        // Título
        $sheet->setCellValue('A1', 'MOVIMIENTO MISIONERO MUNDIAL - VENEZUELA');
        $sheet->mergeCells("A1:{$lastColLetter}1");
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E293B']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(32);

        $subtitle = "REGISTRO DETALLADO DE ASISTENCIA | {$actividad->nombre} | TOTAL PRESENTES: " . $asistencias->count() . " REGISTROS | EMISIÓN: " . Carbon::now()->format('d/m/Y h:i A');
        $sheet->setCellValue('A2', $subtitle);
        $sheet->mergeCells("A2:{$lastColLetter}2");
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => '1E293B']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E2E8F0']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(22);

        // Fila 4: Cabeceras
        $headerRow = 4;
        foreach ($headers as $idx => $headerText) {
            $colLetter = Coordinate::stringFromColumnIndex($idx + 1);
            $sheet->setCellValue("{$colLetter}{$headerRow}", $headerText);
        }

        $sheet->getStyle("A{$headerRow}:{$lastColLetter}{$headerRow}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 9.5, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '047857']], // Emerald-700
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '065F46']]],
        ]);
        $sheet->getRowDimension($headerRow)->setRowHeight(26);

        // Filas de datos
        $currentRow = 5;
        foreach ($asistencias as $index => $as) {
            $isEven = ($index % 2 === 0);
            $rowBg = $isEven ? 'FFFFFF' : 'F8FAFC';

            $metodoTexto = match ($as->metodo) {
                'facial' => 'Biometría Facial',
                'qr_carnet' => 'Carnet Digital QR',
                'manual' => 'Registro Manual',
                default => ucfirst((string) $as->metodo),
            };

            $sheet->setCellValue("A{$currentRow}", $index + 1);
            $sheet->setCellValueExplicit("B{$currentRow}", $as->pastor?->codigo ?: '', DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("C{$currentRow}", $as->pastor?->documento ?: '', DataType::TYPE_STRING);
            $sheet->setCellValue("D{$currentRow}", $as->pastor?->apellidos ?: '');
            $sheet->setCellValue("E{$currentRow}", $as->pastor?->nombres ?: '');
            $sheet->setCellValue("F{$currentRow}", $as->pastor?->nivel_ministerial ?: 'Pastor');
            $sheet->setCellValue("G{$currentRow}", $as->pastor?->cargo_nacional ?: 'Ninguno');
            $sheet->setCellValue("H{$currentRow}", $as->pastor?->zona ? "Zona {$as->pastor->zona}" : 'N/A');
            $sheet->setCellValue("I{$currentRow}", $as->pastor?->distrito ? "Distrito {$as->pastor->distrito}" : 'N/A');
            $sheet->setCellValue("J{$currentRow}", $as->pastor?->estado?->nombre ?: '');
            $sheet->setCellValue("K{$currentRow}", $as->pastor?->municipioModel?->nombre ?: '');
            $sheet->setCellValue("L{$currentRow}", $as->sesion?->nombre ?: 'Sesión General');
            $sheet->setCellValue("M{$currentRow}", $as->fecha_registro ? $as->fecha_registro->format('d/m/Y h:i:s A') : '');
            $sheet->setCellValue("N{$currentRow}", $metodoTexto);
            $sheet->setCellValue("O{$currentRow}", $as->asistio_con_conyuge ? 'SÍ' : 'NO');
            $sheet->setCellValue("P{$currentRow}", $as->nombre_acompanante ?: ($as->asistio_con_conyuge ? ($as->pastor?->nombre_conyuge ?: 'Cónyuge') : 'N/A'));
            $sheet->setCellValue("Q{$currentRow}", $as->kit_entregado ? 'SÍ' : 'NO');
            $sheet->setCellValue("R{$currentRow}", $as->comida_entregada ? 'SÍ' : 'NO');
            $sheet->setCellValue("S{$currentRow}", $as->observaciones ?: '');
            $sheet->setCellValue("T{$currentRow}", $as->registradoPor?->name ?: 'Sistema Terminal');

            $sheet->getStyle("A{$currentRow}:{$lastColLetter}{$currentRow}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rowBg]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            // Centrar celdas de códigos, fechas e indicadores
            $sheet->getStyle("A{$currentRow}:C{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("H{$currentRow}:I{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("L{$currentRow}:O{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("Q{$currentRow}:R{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $sheet->getRowDimension($currentRow)->setRowHeight(20);
            $currentRow++;
        }

        // Auto-filtro en encabezados
        $sheet->setAutoFilter("A{$headerRow}:{$lastColLetter}" . max(5, $currentRow - 1));

        // Auto-dimensionar columnas
        for ($col = 1; $col <= count($headers); $col++) {
            $colLetter = Coordinate::stringFromColumnIndex($col);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }
    }

    /**
     * Construye la Pestaña 3: Pastores Convocados Pendientes por Asistir (Ausentes)
     */
    protected function buildPendientesSheet($sheet, Actividad $actividad, $pastoresAusentes): void
    {
        $headers = [
            'N°',
            'CÓDIGO',
            'CÉDULA / DOC.',
            'APELLIDOS',
            'NOMBRES',
            'GRADO MINISTERIAL',
            'CARGO NACIONAL',
            'ZONA',
            'DISTRITO',
            'TELÉFONO MÓVIL',
            'TELÉFONO HABITACIÓN',
            'ESTADO',
            'MUNICIPIO',
        ];

        $lastColLetter = Coordinate::stringFromColumnIndex(count($headers));

        // Título
        $sheet->setCellValue('A1', 'MOVIMIENTO MISIONERO MUNDIAL - VENEZUELA');
        $sheet->mergeCells("A1:{$lastColLetter}1");
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E293B']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(32);

        $subtitle = "PASTORES CONVOCADOS PENDIENTES POR ASISTIR (AUSENTES) | {$actividad->nombre} | TOTAL PENDIENTES: " . $pastoresAusentes->count() . " PASTORES";
        $sheet->setCellValue('A2', $subtitle);
        $sheet->mergeCells("A2:{$lastColLetter}2");
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => '991B1B']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FEE2E2']], // Red-100
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(22);

        // Fila 4: Cabeceras
        $headerRow = 4;
        foreach ($headers as $idx => $headerText) {
            $colLetter = Coordinate::stringFromColumnIndex($idx + 1);
            $sheet->setCellValue("{$colLetter}{$headerRow}", $headerText);
        }

        $sheet->getStyle("A{$headerRow}:{$lastColLetter}{$headerRow}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 9.5, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '991B1B']], // Red-800
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '7F1D1D']]],
        ]);
        $sheet->getRowDimension($headerRow)->setRowHeight(26);

        // Filas de datos
        $currentRow = 5;
        foreach ($pastoresAusentes as $index => $pastor) {
            $isEven = ($index % 2 === 0);
            $rowBg = $isEven ? 'FFFFFF' : 'FEF2F2';

            $sheet->setCellValue("A{$currentRow}", $index + 1);
            $sheet->setCellValueExplicit("B{$currentRow}", $pastor->codigo ?: '', DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("C{$currentRow}", $pastor->documento ?: '', DataType::TYPE_STRING);
            $sheet->setCellValue("D{$currentRow}", $pastor->apellidos ?: '');
            $sheet->setCellValue("E{$currentRow}", $pastor->nombres ?: '');
            $sheet->setCellValue("F{$currentRow}", $pastor->nivel_ministerial ?: 'Pastor');
            $sheet->setCellValue("G{$currentRow}", $pastor->cargo_nacional ?: 'Ninguno');
            $sheet->setCellValue("H{$currentRow}", $pastor->zona ? "Zona {$pastor->zona}" : 'N/A');
            $sheet->setCellValue("I{$currentRow}", $pastor->distrito ? "Distrito {$pastor->distrito}" : 'N/A');
            $sheet->setCellValueExplicit("J{$currentRow}", $pastor->telefono_tlf ?: '', DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("K{$currentRow}", $pastor->telefono_hab ?: '', DataType::TYPE_STRING);
            $sheet->setCellValue("L{$currentRow}", $pastor->estado?->nombre ?: '');
            $sheet->setCellValue("M{$currentRow}", $pastor->municipioModel?->nombre ?: '');

            $sheet->getStyle("A{$currentRow}:{$lastColLetter}{$currentRow}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rowBg]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FECACA']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            $sheet->getStyle("A{$currentRow}:C{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("H{$currentRow}:K{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $sheet->getRowDimension($currentRow)->setRowHeight(20);
            $currentRow++;
        }

        // Auto-filtro
        $sheet->setAutoFilter("A{$headerRow}:{$lastColLetter}" . max(5, $currentRow - 1));

        // Auto-dimensionar columnas
        for ($col = 1; $col <= count($headers); $col++) {
            $colLetter = Coordinate::stringFromColumnIndex($col);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }
    }
}
