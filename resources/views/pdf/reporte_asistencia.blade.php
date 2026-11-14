<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Asistencia por Zonas - {{ $actividad->nombre }}</title>
    <style>
        @page {
            size: letter landscape;
            margin: 10mm 10mm 14mm 10mm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 8.2px;
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
            width: 58px;
            text-align: left;
            vertical-align: middle;
        }

        .header-logo img {
            max-height: 46px;
            width: auto;
        }

        .header-title-box {
            text-align: center;
            vertical-align: middle;
            padding: 0 8px;
        }

        .org-name {
            font-size: 12.5px;
            font-weight: bold;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }

        .doc-title {
            font-size: 9.8px;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 3px;
        }

        .activity-name {
            font-size: 8.5px;
            color: #475569;
            margin-bottom: 3px;
        }

        .service-pill {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
            background-color: #ecfdf5;
            border: 1px solid #10b981;
            color: #065f46;
        }

        .service-pill.general {
            background-color: #eff6ff;
            border-color: #93c5fd;
            color: #1e40af;
        }

        .header-meta {
            width: 190px;
            text-align: right;
            vertical-align: middle;
            font-size: 7.4px;
            color: #64748b;
            line-height: 1.35;
        }

        .header-meta strong {
            color: #1e293b;
        }

        /* KPIs */
        .kpi-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 9px;
        }

        .kpi-cell {
            width: 16.66%;
            padding: 5px 6px;
            text-align: center;
            border: 1px solid #cbd5e1;
            background-color: #f8fafc;
        }

        .kpi-label {
            font-size: 6.8px;
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

        .section-heading {
            background-color: #0f172a;
            color: #ffffff;
            font-size: 8.5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            padding: 4px 8px;
            margin-bottom: 6px;
        }

        /* Tabla Resumen de Zonas */
        .summary-grid-wrapper {
            width: 100%;
            border-collapse: collapse;
        }

        .summary-col {
            vertical-align: top;
        }

        .summary-table {
            width: 100%;
            border-collapse: collapse;
        }

        .summary-table th {
            background-color: #1e3a8a;
            color: #ffffff;
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            padding: 3.5px 4px;
            border: 1px solid #1e40af;
            text-align: left;
        }

        .summary-table td {
            padding: 3px 4px;
            font-size: 7.4px;
            border: 1px solid #e2e8f0;
            vertical-align: middle;
        }

        .summary-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }

        .summary-table tr.row-empty td {
            color: #94a3b8;
        }

        .center {
            text-align: center !important;
        }

        .right {
            text-align: right !important;
        }

        /* Badges de porcentaje */
        .pct-pill {
            display: inline-block;
            padding: 1px 5px;
            border-radius: 3px;
            font-size: 7px;
            font-weight: bold;
        }

        .pct-green { background-color: #dcfce7; color: #166534; }
        .pct-amber { background-color: #fef3c7; color: #92400e; }
        .pct-red { background-color: #fee2e2; color: #991b1b; }
        .pct-empty { background-color: #f1f5f9; color: #64748b; }

        /* Bloques por Zona */
        .page-break {
            page-break-before: always;
        }

        .zone-keep-together {
            page-break-inside: avoid;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 7px;
            margin-bottom: 6px;
        }

        .data-table thead {
            display: table-header-group;
        }

        .data-table tr {
            page-break-inside: avoid;
        }

        .data-table tr.zone-banner-row th {
            background-color: #1e3a8a;
            color: #ffffff;
            text-transform: none;
            padding: 4.5px 7px;
            border: 1px solid #1e3a8a;
            font-weight: bold;
        }

        .zone-banner-title {
            font-size: 8.6px;
            color: #ffffff;
        }

        .zone-presbitero {
            font-weight: normal;
            font-size: 7.7px;
            color: #cbd5e1;
        }

        .zone-banner-stats {
            text-align: right !important;
            font-size: 7.4px;
            color: #dbeafe;
            background-color: #1e40af !important;
        }

        .data-table tr.col-header-row th {
            background-color: #334155;
            color: #ffffff;
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            padding: 3.5px 4px;
            text-align: left;
            border: 1px solid #475569;
        }

        .data-table td {
            padding: 3.5px 4px;
            font-size: 7.6px;
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
            font-size: 6.8px;
            padding: 1px 4px;
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 2px;
            color: #334155;
            display: inline-block;
        }

        .empty-zones-box {
            margin-top: 10px;
            padding: 7px 10px;
            border: 1px solid #cbd5e1;
            background-color: #f8fafc;
            border-radius: 4px;
            font-size: 7.6px;
            color: #475569;
            page-break-inside: avoid;
        }

        .empty-zones-box strong {
            color: #0f172a;
        }

        /* Pie de página */
        .footer-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            border-top: 1px solid #cbd5e1;
            padding-top: 5px;
            font-size: 7.3px;
            color: #64748b;
        }
    </style>
</head>
<body>
    @php
        $totalZonasCount = count($zonas);
        $zonasConAsistentes = array_values(array_filter($zonas, fn ($z) => ($z['total_presentes'] ?? 0) > 0));
        $zonasSinAsistentes = array_values(array_filter($zonas, fn ($z) => ($z['total_presentes'] ?? 0) === 0));
        $usarDosColumnasResumen = $totalZonasCount > 12;
        $mitad = $usarDosColumnasResumen ? (int) ceil($totalZonasCount / 2) : $totalZonasCount;
        $zonasIzq = array_slice($zonas, 0, $mitad);
        $zonasDer = $usarDosColumnasResumen ? array_slice($zonas, $mitad) : [];
        $esActividadCompleta = empty($sesion);
    @endphp

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
                <div class="doc-title">Reporte Oficial de Asistencia Organizado por Zonas</div>
                <div class="activity-name">
                    <strong>Actividad:</strong> {{ $actividad->nombre }} &bull;
                    <strong>Tipo:</strong> {{ ucfirst($actividad->tipo) }} &bull;
                    <strong>Lugar:</strong> {{ $actividad->lugar ?: 'Sede Central' }}
                </div>
                <div>
                    @if($sesion)
                        <span class="service-pill">
                            @if($sesion->is_activa) CULTO ACTIVO OFICIAL: @else SERVICIO / BLOQUE: @endif
                            {{ $sesion->nombre }}
                        </span>
                    @else
                        <span class="service-pill general">
                            CONSOLIDADO GENERAL — TODAS LAS SESIONES / SERVICIOS
                        </span>
                    @endif
                </div>
            </td>
            <td class="header-meta">
                <div><strong>Emisión:</strong> {{ $fechaEmision }}</div>
                <div><strong>Fechas:</strong> {{ $fechasActividad }}</div>
                @if($sesion && $sesion->fecha_hora_inicio)
                    <div><strong>Horario Servicio:</strong> {{ \Carbon\Carbon::parse($sesion->fecha_hora_inicio)->format('d/m h:i A') }}</div>
                @endif
                <div><strong>Alcance:</strong> {{ $actividad->zona ? "Zona {$actividad->zona}" : "Nacional ({$totalZonasCount} Zonas)" }}</div>
            </td>
        </tr>
    </table>

    {{-- Banner de Métricas / Quórum --}}
    <table class="kpi-table">
        <tr>
            <td class="kpi-cell">
                <span class="kpi-label">Padrón Convocado</span>
                <span class="kpi-value">{{ $metricas['total_padron'] }}</span>
            </td>
            <td class="kpi-cell kpi-highlight">
                <span class="kpi-label">Pastores Presentes</span>
                <span class="kpi-value">{{ $metricas['total_presentes'] }}</span>
            </td>
            <td class="kpi-cell kpi-success">
                <span class="kpi-label">Quórum Alcanzado</span>
                <span class="kpi-value">{{ $metricas['porcentaje_quorum'] }}%</span>
            </td>
            <td class="kpi-cell">
                <span class="kpi-label">Cónyuges en Sala</span>
                <span class="kpi-value" style="color: #be185d;">{{ $metricas['total_con_conyuge'] }}</span>
            </td>
            <td class="kpi-cell">
                <span class="kpi-label">Zonas con Presencia</span>
                <span class="kpi-value" style="color: #0f766e;">{{ $metricas['zonas_con_asistencia'] }} / {{ $metricas['total_zonas'] }}</span>
            </td>
            <td class="kpi-cell">
                <span class="kpi-label">Pastores Pendientes</span>
                <span class="kpi-value" style="color: #dc2626;">{{ $metricas['total_ausentes'] }}</span>
            </td>
        </tr>
    </table>

    {{-- BLOQUE I: CUADRO RESUMEN CONSOLIDADO DE TODAS LAS ZONAS --}}
    <div class="section-heading">I. Resumen Consolidado de Asistencia por Zonas ({{ $totalZonasCount }} Zonas)</div>

    <table class="summary-grid-wrapper">
        <tr>
            <td class="summary-col" style="width: {{ $usarDosColumnasResumen ? '49.3%' : '100%' }};">
                <table class="summary-table">
                    <thead>
                        <tr>
                            <th style="width: 58px;">Zona</th>
                            <th>Presbítero</th>
                            <th class="center" style="width: 38px;">Padrón</th>
                            <th class="center" style="width: 42px;">Pres.</th>
                            <th class="center" style="width: 38px;">Cón.</th>
                            <th class="center" style="width: 38px;">Pend.</th>
                            <th class="center" style="width: 44px;">% Asist.</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($zonasIzq as $z)
                            @php
                                $pillClass = match($z['semaforo']) {
                                    'green' => 'pct-green',
                                    'amber' => 'pct-amber',
                                    'red' => 'pct-red',
                                    default => 'pct-empty',
                                };
                            @endphp
                            <tr class="{{ $z['total_presentes'] === 0 ? 'row-empty' : '' }}">
                                <td><strong>{{ $z['nombre_zona'] }}</strong></td>
                                <td>{{ $z['presbitero_nombre'] }}</td>
                                <td class="center">{{ $z['total_padron'] }}</td>
                                <td class="center"><strong>{{ $z['total_presentes'] }}</strong></td>
                                <td class="center">{{ $z['total_con_conyuge'] }}</td>
                                <td class="center">{{ $z['total_pendientes'] }}</td>
                                <td class="center"><span class="pct-pill {{ $pillClass }}">{{ $z['porcentaje'] }}%</span></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </td>

            @if($usarDosColumnasResumen)
                <td style="width: 1.4%;"></td>
                <td class="summary-col" style="width: 49.3%;">
                    <table class="summary-table">
                        <thead>
                            <tr>
                                <th style="width: 58px;">Zona</th>
                                <th>Presbítero</th>
                                <th class="center" style="width: 38px;">Padrón</th>
                                <th class="center" style="width: 42px;">Pres.</th>
                                <th class="center" style="width: 38px;">Cón.</th>
                                <th class="center" style="width: 38px;">Pend.</th>
                                <th class="center" style="width: 44px;">% Asist.</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($zonasDer as $z)
                                @php
                                    $pillClass = match($z['semaforo']) {
                                        'green' => 'pct-green',
                                        'amber' => 'pct-amber',
                                        'red' => 'pct-red',
                                        default => 'pct-empty',
                                    };
                                @endphp
                                <tr class="{{ $z['total_presentes'] === 0 ? 'row-empty' : '' }}">
                                    <td><strong>{{ $z['nombre_zona'] }}</strong></td>
                                    <td>{{ $z['presbitero_nombre'] }}</td>
                                    <td class="center">{{ $z['total_padron'] }}</td>
                                    <td class="center"><strong>{{ $z['total_presentes'] }}</strong></td>
                                    <td class="center">{{ $z['total_con_conyuge'] }}</td>
                                    <td class="center">{{ $z['total_pendientes'] }}</td>
                                    <td class="center"><span class="pct-pill {{ $pillClass }}">{{ $z['porcentaje'] }}%</span></td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </td>
            @endif
        </tr>
    </table>

    {{-- BLOQUE II: DETALLE NOMINAL POR CADA ZONA --}}
    <div class="page-break"></div>
    <div class="section-heading">
        II. Detalle Nominal de Asistentes Organizado por Zona
        @if($sesion) — {{ $sesion->nombre }} @endif
    </div>

    @forelse($zonasConAsistentes as $z)
        @php
            $keepTogether = count($z['asistentes']) <= 12;
        @endphp
        <div class="{{ $keepTogether ? 'zone-keep-together' : '' }}">
            <table class="data-table">
                <thead>
                    <tr class="zone-banner-row">
                        <th colspan="{{ $esActividadCompleta ? 6 : 5 }}" class="zone-banner-title">
                            {{ strtoupper($z['nombre_zona']) }}
                            <span class="zone-presbitero">&nbsp;&bull;&nbsp;Presbítero: {{ $z['presbitero_nombre'] }}</span>
                        </th>
                        <th colspan="4" class="zone-banner-stats">
                            Presentes: {{ $z['total_presentes'] }} / {{ $z['total_padron'] }} ({{ $z['porcentaje'] }}%)
                            &nbsp;|&nbsp; Cónyuges: {{ $z['total_con_conyuge'] }}
                            &nbsp;|&nbsp; Pendientes: {{ $z['total_pendientes'] }}
                        </th>
                    </tr>
                    <tr class="col-header-row">
                        <th class="center" style="width: 22px;">N°</th>
                        <th class="center" style="width: 72px;">Código</th>
                        <th class="center" style="width: 62px;">Cédula</th>
                        <th>Pastor (Apellidos y Nombres)</th>
                        <th style="width: 96px;">Grado Ministerial</th>
                        <th style="width: 120px;">Iglesia / Distrito</th>
                        @if($esActividadCompleta)
                            <th style="width: 105px;">Sesión / Bloque</th>
                        @endif
                        <th class="center" style="width: 52px;">Hora</th>
                        <th class="center" style="width: 48px;">Método</th>
                        <th style="width: 125px;">Cónyuge en Sala</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($z['asistentes'] as $idx => $as)
                        <tr>
                            <td class="center">{{ $idx + 1 }}</td>
                            <td class="center" style="font-family: monospace; font-size: 7px;">{{ $as['codigo'] }}</td>
                            <td class="center" style="font-family: monospace; font-size: 7.2px;">{{ $as['documento'] }}</td>
                            <td>
                                <strong>{{ $as['apellidos'] }}</strong> {{ $as['nombres'] }}
                                @if(!empty($as['cargo_nacional']))
                                    <span style="font-size: 6.8px; color: #64748b;">({{ $as['cargo_nacional'] }})</span>
                                @endif
                            </td>
                            <td>{{ $as['nivel_ministerial'] }}</td>
                            <td style="font-size: 7.1px;">
                                {{ $as['iglesia'] ?: '—' }}
                                @if(!empty($as['distrito']))
                                    <span style="color: #64748b;">(D-{{ $as['distrito'] }})</span>
                                @endif
                            </td>
                            @if($esActividadCompleta)
                                <td style="font-size: 7px;">{{ $as['sesion'] }}</td>
                            @endif
                            <td class="center" style="font-size: 7.2px;">{{ $as['hora'] }}</td>
                            <td class="center"><span class="badge-method">{{ $as['metodo_label'] }}</span></td>
                            <td style="font-size: 7.1px;">
                                @if($as['asistio_con_conyuge'])
                                    <span class="badge-si">SÍ</span>
                                    @if(!empty($as['nombre_acompanante']))
                                        <span style="color: #475569;">— {{ $as['nombre_acompanante'] }}</span>
                                    @endif
                                @else
                                    <span class="badge-no">NO</span>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @empty
        <div class="empty-zones-box" style="text-align: center; padding: 20px; color: #64748b;">
            No se han registrado asistencias para el servicio seleccionado todavía.
        </div>
    @endforelse

    @if(!$soloConAsistencia && count($zonasSinAsistentes) > 0)
        <div class="empty-zones-box">
            <strong>Zonas sin registros de asistencia en este servicio ({{ count($zonasSinAsistentes) }}):</strong>
            {{ collect($zonasSinAsistentes)->map(fn ($z) => "{$z['nombre_zona']} (0/{$z['total_padron']})")->implode(' • ') }}
        </div>
    @endif

    {{-- Resumen final de auditoría --}}
    <table class="footer-table">
        <tr>
            <td>
                SAPRCOE &bull; Sistema de Control de Asistencia y Acreditación Digital &bull; Movimiento Misionero Mundial Venezuela
            </td>
            <td style="text-align: right;">
                Asistentes únicos: {{ $metricas['total_presentes'] }} &bull; Registros emitidos: {{ $metricas['total_registros'] }}
            </td>
        </tr>
    </table>
</body>
</html>
