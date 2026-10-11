<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Asistencia - {{ $actividad->nombre }}</title>
    <style>
        @page {
            size: letter landscape;
            margin: 10mm 10mm 14mm 10mm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 8.5px;
            color: #1e293b;
            margin: 0;
            padding: 0;
        }

        /* Cabecera Principal */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
            border-bottom: 2.5px solid #1e3a8a;
            padding-bottom: 6px;
        }

        .header-logo {
            width: 60px;
            text-align: left;
            vertical-align: middle;
        }

        .header-logo img {
            max-height: 48px;
            width: auto;
        }

        .header-title-box {
            text-align: center;
            vertical-align: middle;
        }

        .org-name {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }

        .doc-title {
            font-size: 10px;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 2px;
        }

        .activity-name {
            font-size: 9px;
            font-weight: normal;
            color: #475569;
        }

        .header-meta {
            width: 180px;
            text-align: right;
            vertical-align: middle;
            font-size: 7.5px;
            color: #64748b;
            line-height: 1.3;
        }

        .header-meta strong {
            color: #1e293b;
        }

        /* Tabla de Métricas Clave / KPIs */
        .kpi-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        .kpi-cell {
            padding: 5px 6px;
            text-align: center;
            border: 1px solid #cbd5e1;
            background-color: #f8fafc;
        }

        .kpi-label {
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            color: #64748b;
            display: block;
            margin-bottom: 2px;
        }

        .kpi-value {
            font-size: 11px;
            font-weight: bold;
            color: #1e3a8a;
        }

        .kpi-highlight {
            background-color: #eff6ff;
            border-color: #93c5fd;
        }

        .kpi-highlight .kpi-value {
            color: #1d4ed8;
        }

        .kpi-success {
            background-color: #f0fdf4;
            border-color: #86efac;
        }

        .kpi-success .kpi-value {
            color: #15803d;
        }

        /* Tabla Principal de Asistentes */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
        }

        .data-table th {
            background-color: #1e3a8a;
            color: #ffffff;
            font-size: 7.5px;
            font-weight: bold;
            text-transform: uppercase;
            padding: 5px 4px;
            text-align: left;
            border: 1px solid #1e40af;
        }

        .data-table th.center,
        .data-table td.center {
            text-align: center;
        }

        .data-table td {
            padding: 4px 4px;
            font-size: 8px;
            border: 1px solid #e2e8f0;
            vertical-align: middle;
        }

        .data-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }

        .badge-si {
            color: #166534;
            font-weight: bold;
        }

        .badge-no {
            color: #94a3b8;
        }

        .badge-method {
            font-size: 7px;
            padding: 1px 3px;
            background-color: #f1f5f9;
            border-radius: 2px;
            color: #334155;
            display: inline-block;
        }

        /* Pie de página */
        .footer-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            border-top: 1px solid #cbd5e1;
            padding-top: 5px;
            font-size: 7.5px;
            color: #64748b;
        }
    </style>
</head>
<body>
    {{-- Cabecera --}}
    <table class="header-table">
        <tr>
            <td class="header-logo">
                @if(!empty($logoBase64))
                    <img src="{{ $logoBase64 }}" alt="Logo MMM">
                @endif
            </td>
            <td class="header-title-box">
                <div class="org-name">Movimiento Misionero Mundial Venezuela</div>
                <div class="doc-title">Reporte Oficial de Asistencia y Quórum Ministerial</div>
                <div class="activity-name">
                    <strong>Actividad:</strong> {{ $actividad->nombre }} &bull;
                    <strong>Tipo:</strong> {{ ucfirst($actividad->tipo) }} &bull;
                    <strong>Lugar:</strong> {{ $actividad->lugar ?: 'Sede Central' }}
                </div>
            </td>
            <td class="header-meta">
                <div><strong>Emisión:</strong> {{ $fechaEmision }}</div>
                <div><strong>Fechas:</strong> {{ $fechasActividad }}</div>
                <div><strong>Convocatoria:</strong> {{ $actividad->zona ? "Zona {$actividad->zona}" : 'Nacional' }}</div>
            </td>
        </tr>
    </table>

    {{-- Banner de Métricas / Quórum --}}
    <table class="kpi-table">
        <tr>
            <td class="kpi-cell">
                <span class="kpi-label">Padrón Convocado</span>
                <span class="kpi-value">{{ $totalPadron }}</span>
            </td>
            <td class="kpi-cell kpi-highlight">
                <span class="kpi-label">Asistentes Presentes</span>
                <span class="kpi-value">{{ $totalPresentes }}</span>
            </td>
            <td class="kpi-cell kpi-success">
                <span class="kpi-label">Quórum Alcanzado</span>
                <span class="kpi-value">{{ $porcentajeQuorum }}%</span>
            </td>
            <td class="kpi-cell">
                <span class="kpi-label">Cónyuges en Sala</span>
                <span class="kpi-value">{{ $totalConConyuge }}</span>
            </td>
            <td class="kpi-cell">
                <span class="kpi-label">Kits Entregados</span>
                <span class="kpi-value">{{ $totalKits }}</span>
            </td>
            <td class="kpi-cell">
                <span class="kpi-label">Comidas Servidas</span>
                <span class="kpi-value">{{ $totalComidas }}</span>
            </td>
            <td class="kpi-cell">
                <span class="kpi-label">Pastores Pendientes</span>
                <span class="kpi-value" style="color: #dc2626;">{{ $totalAusentes }}</span>
            </td>
        </tr>
    </table>

    {{-- Tabla de Asistentes --}}
    <table class="data-table">
        <thead>
            <tr>
                <th class="center" style="width: 20px;">N°</th>
                <th class="center" style="width: 50px;">Código</th>
                <th class="center" style="width: 60px;">Cédula</th>
                <th>Pastor (Apellidos y Nombres)</th>
                <th style="width: 85px;">Grado Ministerial</th>
                <th class="center" style="width: 45px;">Zona</th>
                <th class="center" style="width: 45px;">Distrito</th>
                <th style="width: 95px;">Sesión / Bloque</th>
                <th class="center" style="width: 65px;">Hora</th>
                <th class="center" style="width: 60px;">Método</th>
                <th class="center" style="width: 45px;">Cónyuge</th>
                <th class="center" style="width: 40px;">Kit</th>
            </tr>
        </thead>
        <tbody>
            @forelse($asistencias as $idx => $as)
                <tr>
                    <td class="center">{{ $idx + 1 }}</td>
                    <td class="center" style="font-family: monospace; font-size: 7.5px;">{{ $as->pastor?->codigo ?? '—' }}</td>
                    <td class="center" style="font-family: monospace; font-size: 7.5px;">{{ $as->pastor?->documento ?? '—' }}</td>
                    <td>
                        <strong>{{ $as->pastor?->apellidos ?? '' }}</strong> {{ $as->pastor?->nombres ?? '' }}
                        @if($as->pastor?->cargo_nacional)
                            <span style="font-size: 7px; color: #64748b;">({{ $as->pastor->cargo_nacional }})</span>
                        @endif
                    </td>
                    <td>{{ $as->pastor?->nivel_ministerial ?? 'Pastor' }}</td>
                    <td class="center">{{ $as->pastor?->zona ? "Z-{$as->pastor->zona}" : '—' }}</td>
                    <td class="center">{{ $as->pastor?->distrito ? "D-{$as->pastor->distrito}" : '—' }}</td>
                    <td style="font-size: 7.5px;">{{ $as->sesion?->nombre ?? 'Sesión General' }}</td>
                    <td class="center" style="font-size: 7.5px;">{{ $as->fecha_registro ? $as->fecha_registro->format('h:i A') : '—' }}</td>
                    <td class="center">
                        <span class="badge-method">
                            @if($as->metodo === 'facial')
                                Facial
                            @elseif($as->metodo === 'qr_carnet')
                                QR
                            @else
                                Manual
                            @endif
                        </span>
                    </td>
                    <td class="center">
                        @if($as->asistio_con_conyuge)
                            <span class="badge-si">SÍ</span>
                        @else
                            <span class="badge-no">NO</span>
                        @endif
                    </td>
                    <td class="center">
                        @if($as->kit_entregado)
                            <span class="badge-si">SÍ</span>
                        @else
                            <span class="badge-no">—</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="12" class="center" style="padding: 16px; color: #94a3b8;">
                        No se han registrado asistencias para esta actividad.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    {{-- Footer con información de auditoría --}}
    <table class="footer-table">
        <tr>
            <td>
                Sistema de Control de Asistencia y Acreditación Digital &bull; Movimiento Misionero Mundial Venezuela
            </td>
            <td style="text-align: right;">
                Registros emitidos: {{ $asistencias->count() }} asistentes
            </td>
        </tr>
    </table>

    {{-- Script de numeración de páginas para DomPDF --}}
    <script type="text/php">
        if (isset($pdf)) {
            $text = "Página {PAGE_NUM} de {PAGE_COUNT}";
            $size = 7.5;
            $font = $fontMetrics->getFont("Helvetica");
            $width = $fontMetrics->get_text_width($text, $font, $size);
            $x = $pdf->get_width() - $width - 28;
            $y = $pdf->get_height() - 20;
            $pdf->page_text($x, $y, $text, $font, $size, array(0.4, 0.45, 0.5));
        }
    </script>
</body>
</html>
