<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Carnet Pastor - {{ $pastor->nombres }} {{ $pastor->apellidos }}</title>
    <style>
        @page {
            size: 85.6mm 53.9mm;
            margin: 0;
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

        /* --- CARA FRONTAL --- */
        .card-front {
            width: 85.6mm;
            height: 53.9mm;
            position: relative;
            background-color: #0f3563;
            overflow: hidden;
            box-sizing: border-box;
        }

        /* Franja Diagonal Marfil/Crema */
        .diagonal-stripe {
            position: absolute;
            top: 0;
            left: 0;
            width: 85.6mm;
            height: 53.9mm;
            z-index: 1;
        }

        /* Container Header Derecho */
        .front-header {
            position: absolute;
            top: 2.5mm;
            right: 3mm;
            z-index: 5;
            text-align: right;
        }

        .logo-mmm {
            height: 8mm;
            width: auto;
            vertical-align: middle;
            display: inline-block;
        }

        .header-text {
            display: inline-block;
            vertical-align: middle;
            text-align: right;
            color: #ffffff;
            margin-left: 1.5mm;
        }

        .header-title {
            font-size: 6.5pt;
            font-weight: bold;
            text-transform: uppercase;
            line-height: 1;
        }

        .header-sub {
            font-size: 4pt;
            line-height: 1.1;
            color: #e2e8f0;
        }

        .header-rif {
            font-size: 4.5pt;
            font-weight: bold;
            color: #ffffff;
            margin-top: 0.3mm;
        }

        /* Foto Pastor Circular */
        .photo-container {
            position: absolute;
            top: 10mm;
            left: 5mm;
            width: 31mm;
            height: 31mm;
            z-index: 5;
            text-align: center;
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

        /* Info Pastor */
        .pastor-info {
            position: absolute;
            top: 15mm;
            left: 39mm;
            width: 44mm;
            z-index: 5;
            color: #ffffff;
        }

        .pastor-name {
            font-size: 8.5pt;
            font-weight: 900;
            text-transform: uppercase;
            line-height: 1.15;
            color: #ffffff;
            word-wrap: break-word;
        }

        .pastor-doc {
            font-size: 7.5pt;
            font-weight: bold;
            color: #f1f5f9;
            margin-top: 1mm;
        }

        .acreditacion-label {
            font-size: 5.5pt;
            text-transform: uppercase;
            color: #bfdbfe;
            margin-top: 2.5mm;
            letter-spacing: 0.5px;
        }

        .acreditacion-grado {
            font-size: 8.5pt;
            font-weight: 900;
            text-transform: uppercase;
            color: #a5f3fc;
            line-height: 1.1;
        }

        /* Footer Frontal */
        .front-footer {
            position: absolute;
            bottom: 2mm;
            left: 3mm;
            right: 3mm;
            z-index: 5;
            border-top: 0.5pt solid rgba(255, 255, 255, 0.3);
            padding-top: 1mm;
        }

        .slogan-text {
            font-size: 3.8pt;
            font-weight: bold;
            color: #ffffff;
            text-transform: uppercase;
            width: 62mm;
            float: left;
            text-align: center;
            line-height: 1.1;
        }

        .expiration-text {
            font-size: 4.5pt;
            font-weight: bold;
            color: #fde047;
            float: right;
            width: 14mm;
            text-align: right;
        }

        /* --- CARA TRASERA --- */
        .card-back {
            width: 85.6mm;
            height: 53.9mm;
            position: relative;
            background-color: #ffffff;
            overflow: hidden;
            box-sizing: border-box;
        }

        /* Esquinas Geométricas Azules */
        .corner-top-left {
            position: absolute;
            top: 0;
            left: 0;
            width: 25mm;
            height: 25mm;
            z-index: 1;
        }

        .corner-bottom-right {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 22mm;
            height: 22mm;
            z-index: 1;
        }

        .back-header {
            position: relative;
            z-index: 5;
            text-align: center;
            padding-top: 3.5mm;
        }

        .back-header-title {
            font-size: 8pt;
            font-weight: 900;
            color: #0f3563;
            text-transform: uppercase;
            vertical-align: middle;
            margin-left: 1.5mm;
        }

        .legal-texts {
            position: relative;
            z-index: 5;
            margin: 2.5mm 5mm 0 5mm;
            font-size: 3.8pt;
            line-height: 1.25;
            color: #1e293b;
            text-align: justify;
        }

        .legal-paragraph {
            margin-bottom: 1mm;
        }

        .holder-info {
            position: absolute;
            bottom: 12mm;
            left: 4mm;
            right: 4mm;
            z-index: 5;
            text-align: center;
            font-family: 'Georgia', 'Times New Roman', serif;
            font-style: italic;
            font-size: 6.5pt;
            font-weight: bold;
            color: #0f3563;
        }

        .back-bottom-container {
            position: absolute;
            bottom: 2mm;
            left: 5mm;
            right: 5mm;
            z-index: 5;
        }

        .barcode-box {
            float: left;
            width: 48mm;
            text-align: left;
            padding-top: 1mm;
        }

        .barcode-img {
            height: 7mm;
            width: 45mm;
        }

        .qr-box {
            float: right;
            width: 15mm;
            text-align: right;
        }

        .qr-img {
            width: 12mm;
            height: 12mm;
            border: 0.5pt solid #cbd5e1;
            padding: 0.5mm;
            background: #ffffff;
        }
    </style>
</head>
<body>

    <!-- ==================== CARA FRONTAL ==================== -->
    <div class="card-front">
        <!-- SVG Franja Diagonal Marfil/Crema (#ded7c5) -->
        <svg class="diagonal-stripe" viewBox="0 0 85.6 53.9" preserveAspectRatio="none">
            <polygon points="0,53.9 18,53.9 48,0 33,0" fill="#ded7c5" />
        </svg>

        <!-- Header Derecho -->
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

        <!-- Foto Pastor Circular -->
        <div class="photo-container">
            @if($fotoCircularBase64)
                <img src="{{ $fotoCircularBase64 }}" class="photo-img" alt="Foto Pastor">
            @else
                <div class="photo-placeholder">
                    {{ strtoupper(substr($pastor->nombres, 0, 1) . substr($pastor->apellidos, 0, 1)) }}
                </div>
            @endif
        </div>

        <!-- Información del Pastor -->
        <div class="pastor-info">
            <div class="pastor-name">{{ $pastor->nombres }} {{ $pastor->apellidos }}</div>
            <div class="pastor-doc">{{ $documentoFormateado }}</div>

            <div class="acreditacion-label">Acreditación Ministerial</div>
            <div class="acreditacion-grado">{{ $pastor->nivel_ministerial ?: 'MINISTRO ORDENADO' }}</div>
        </div>

        <!-- Footer Frontal -->
        <div class="front-footer">
            <div class="slogan-text">
                <div>...UN ESFUERZO DE FE Y DE SACRIFICIO EN BIEN DE LA OBRA</div>
                <div>MISIONERA Y DE LA EVANGELIZACIÓN DEL MUNDO.</div>
            </div>
            <div class="expiration-text">
                VENCE 12-{{ date('Y') + 1 }}
            </div>
        </div>
    </div>

    <!-- PÁGINA SIGUIENTE PARA REVERSO -->
    <div class="page-break"></div>

    <!-- ==================== CARA TRASERA ==================== -->
    <div class="card-back">
        <!-- SVG Esquinas Azules (#0f3563) exactas a Imagen 2 -->
        <svg class="corner-top-left" viewBox="0 0 25 25">
            <polygon points="0,0 22,0 0,22" fill="#0f3563" />
            <polygon points="0,25 25,0 19,0 0,19" fill="#0f3563" opacity="0.85" />
        </svg>

        <svg class="corner-bottom-right" viewBox="0 0 22 22">
            <polygon points="22,22 0,22 22,0" fill="#0f3563" />
        </svg>

        <!-- Header Trasero -->
        <div class="back-header">
            @if(file_exists(public_path('icons/logo_mmm.png')))
                <img src="{{ public_path('icons/logo_mmm.png') }}" class="logo-mmm" alt="MMM">
            @endif
            <span class="back-header-title">MOVIMIENTO MISIONERO MUNDIAL</span>
        </div>

        <!-- Párrafos Legales -->
        <div class="legal-texts">
            <div class="legal-paragraph">
                ORGANIZACION CRISTIANA, SIN FINES DE LUCRO, DEBIDAMENTE REGISTRADA ANTE LAS AUTORIDADES GUBERNAMENTALES DE LA REPÚBLICA BOLIVARIANA DE VENEZUELA, INSCRITA EN LA DIRECCIÓN DE JUSTICIA Y CULTO BAJO EL N° DG/520 DF/620-100.361.
            </div>
            <div class="legal-paragraph">
                ESTE CARNET ES PERSONAL E INTRANSFERIBLE Y ACREDITA AL USUARIO COMO MIEMBRO DE LA IGLESIA CRISTIANA PENTECOSTÉS DE VENEZUELA DEL MOVIMIENTO MISIONERO MUNDIAL.
            </div>
            <div class="legal-paragraph" style="font-weight: bold;">
                SE LE AGRADECE A LAS AUTORIDADES CIVILES Y MILITARES TODA LA COLABORACIÓN PRESTADA AL PORTADOR DE ESTA CREDENCIAL.
            </div>
        </div>

        <!-- Nombre Titular (Formato Imagen 2) -->
        <div class="holder-info">
            {{ $pastor->nombres }} {{ $pastor->apellidos }} ({{ preg_replace('/[^0-9]/', '', $pastor->documento) ?: $pastor->codigo }})
        </div>

        <!-- Fila Inferior: Código de Barras + Código QR Real -->
        <div class="back-bottom-container">
            <div class="barcode-box">
                @if($barcodeBase64)
                    <img src="{{ $barcodeBase64 }}" class="barcode-img" alt="Código de Barras">
                @endif
            </div>

            <div class="qr-box">
                @if($qrBase64)
                    <img src="{{ $qrBase64 }}" class="qr-img" alt="QR Verificación">
                @endif
            </div>
        </div>
    </div>

</body>
</html>
