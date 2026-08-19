<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Carnets Pastores - Impresión Masiva</title>
    <style>
        @page {
            size: letter portrait;
            margin: 10mm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
        }

        .page-break {
            page-break-after: always;
        }

        .grid-container {
            width: 100%;
        }

        .card-wrapper {
            width: 85.6mm;
            height: 53.9mm;
            float: left;
            margin-right: 5mm;
            margin-bottom: 5mm;
            position: relative;
            border: 0.5pt solid #cbd5e1;
            box-sizing: border-box;
            overflow: hidden;
        }

        .card-wrapper:nth-child(2n) {
            margin-right: 0;
        }

        /* Reutilización de estilos */
        .card-front {
            width: 85.6mm;
            height: 53.9mm;
            position: relative;
            background-color: #0f3563;
            overflow: hidden;
        }

        .diagonal-stripe {
            position: absolute;
            top: 0;
            left: 0;
            width: 85.6mm;
            height: 53.9mm;
            z-index: 1;
        }

        .front-header {
            position: absolute;
            top: 2mm;
            right: 2.5mm;
            z-index: 5;
            text-align: right;
        }

        .logo-mmm {
            height: 7.5mm;
            width: auto;
            vertical-align: middle;
            display: inline-block;
        }

        .header-text {
            display: inline-block;
            vertical-align: middle;
            text-align: right;
            color: #ffffff;
            margin-left: 1mm;
        }

        .header-title { font-size: 6pt; font-weight: bold; text-transform: uppercase; line-height: 1; }
        .header-sub { font-size: 3.8pt; line-height: 1.1; color: #e2e8f0; }
        .header-rif { font-size: 4pt; font-weight: bold; color: #ffffff; margin-top: 0.2mm; }

        .photo-container {
            position: absolute;
            top: 9.5mm;
            left: 4.5mm;
            width: 31mm;
            height: 31mm;
            z-index: 5;
        }

        .photo-img {
            width: 31mm;
            height: 31mm;
            border-radius: 50%;
            border: 2px solid #ffffff;
            object-fit: cover;
        }

        .photo-placeholder {
            width: 31mm;
            height: 31mm;
            border-radius: 50%;
            border: 2px solid #ffffff;
            background: #1e3a8a;
            color: #ffffff;
            font-size: 14pt;
            font-weight: bold;
            line-height: 31mm;
            text-align: center;
        }

        .pastor-info {
            position: absolute;
            top: 14mm;
            left: 38mm;
            width: 45mm;
            z-index: 5;
            color: #ffffff;
        }

        .pastor-name { font-size: 8pt; font-weight: 900; text-transform: uppercase; line-height: 1.1; color: #ffffff; }
        .pastor-doc { font-size: 7pt; font-weight: bold; color: #f1f5f9; margin-top: 0.5mm; }
        .acreditacion-label { font-size: 5pt; text-transform: uppercase; color: #bfdbfe; margin-top: 2mm; }
        .acreditacion-grado { font-size: 8pt; font-weight: 900; text-transform: uppercase; color: #a5f3fc; }

        .front-footer {
            position: absolute;
            bottom: 1.5mm;
            left: 3mm;
            right: 3mm;
            z-index: 5;
            border-top: 0.5pt solid rgba(255, 255, 255, 0.3);
            padding-top: 0.8mm;
        }

        .slogan-text { font-size: 3.8pt; font-weight: bold; color: #ffffff; text-transform: uppercase; width: 65mm; float: left; }
        .expiration-text { font-size: 4pt; font-weight: bold; color: #fde047; float: right; width: 14mm; text-align: right; }
    </style>
</head>
<body>

    @foreach(array_chunk($items, 8) as $chunkIndex => $pageItems)
        <div class="grid-container">
            @foreach($pageItems as $item)
                <div class="card-wrapper">
                    <div class="card-front">
                        <svg class="diagonal-stripe" viewBox="0 0 85.6 53.9" preserveAspectRatio="none">
                            <polygon points="0,53.9 18,53.9 48,0 33,0" fill="#ded7c5" />
                        </svg>

                        <div class="front-header">
                            @if(file_exists(public_path('icons/logo_mmm.png')))
                                <img src="{{ public_path('icons/logo_mmm.png') }}" class="logo-mmm" alt="MMM">
                            @endif
                            <div class="header-text">
                                <div class="header-title">MOVIMIENTO MISIONERO MUNDIAL</div>
                                <div class="header-sub">Inscrita en la Dirección de Justicia y Culto</div>
                                <div class="header-sub">bajo el N° DG/520 DF/620-100.361</div>
                                <div class="header-rif">J - 3 0 1 8 7 4 4 6 - 3</div>
                            </div>
                        </div>

                        <div class="photo-container">
                            @if($item['fotoCircularBase64'])
                                <img src="{{ $item['fotoCircularBase64'] }}" class="photo-img" alt="Foto">
                            @else
                                <div class="photo-placeholder">
                                    {{ strtoupper(substr($item['pastor']->nombres, 0, 1) . substr($item['pastor']->apellidos, 0, 1)) }}
                                </div>
                            @endif
                        </div>

                        <div class="pastor-info">
                            <div class="pastor-name">{{ $item['pastor']->nombres }} {{ $item['pastor']->apellidos }}</div>
                            <div class="pastor-doc">{{ $item['documentoFormateado'] }}</div>
                            <div class="acreditacion-label">Acreditación Ministerial</div>
                            <div class="acreditacion-grado">{{ $item['pastor']->nivel_ministerial ?: 'MINISTRO ORDENADO' }}</div>
                        </div>

                        <div class="front-footer">
                            <div class="slogan-text">
                                ...UN ESFUERZO DE FE Y DE SACRIFICIO EN BIEN DE LA OBRA MISIONERA Y DE LA EVANGELIZACIÓN DEL MUNDO.
                            </div>
                            <div class="expiration-text">
                                VENCE 12-{{ date('Y') + 1 }}
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        @if(!$loop->last)
            <div class="page-break"></div>
        @endif
    @endforeach

</body>
</html>
