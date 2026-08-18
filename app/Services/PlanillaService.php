<?php

namespace App\Services;

use App\Models\Empresa;
use App\Models\Pastor;
use App\Models\Sucursal;
use Codedge\Fpdf\Facades\Fpdf;

class PlanillaService
{
    public function construirDireccionCompleta($pastor)
    {
        $direccion = '';

        if ($pastor->edificio_casa_quinta) {
            $direccion .= $pastor->edificio_casa_quinta;
        }

        if ($pastor->piso) {
            $direccion .= ($direccion ? ', ' : '') . 'Piso ' . $pastor->piso;
        }

        if ($pastor->apartamento) {
            $direccion .= ($direccion ? ', ' : '') . 'Apto ' . $pastor->apartamento;
        }

        if ($pastor->calle_avenida) {
            $direccion .= ($direccion ? ', ' : '') . $pastor->calle_avenida;
        }

        if ($pastor->urbanizacion) {
            $direccion .= ($direccion ? ', ' : '') . $pastor->urbanizacion;
        }

        return $direccion ?: 'No especificada';
    }

    public function generarPdfParaPastor(Pastor $pastor, $fpdf = null)
    {
        if (! $fpdf) {
            $fpdf = app('fpdf');
        }

        // Cargar iglesias asociadas al pastor y a su cónyuge
        $iglesias = collect();
        if (method_exists($pastor, 'iglesiasPrincipales') && $pastor->iglesiasPrincipales) {
            $iglesias = $iglesias->merge($pastor->iglesiasPrincipales);
        }
        if (method_exists($pastor, 'iglesias') && $pastor->iglesias) {
            $iglesias = $iglesias->merge($pastor->iglesias);
        }

        if ($pastor->conyuge) {
            if (method_exists($pastor->conyuge, 'iglesiasPrincipales') && $pastor->conyuge->iglesiasPrincipales) {
                $iglesias = $iglesias->merge($pastor->conyuge->iglesiasPrincipales);
            }
            if (method_exists($pastor->conyuge, 'iglesias') && $pastor->conyuge->iglesias) {
                $iglesias = $iglesias->merge($pastor->conyuge->iglesias);
            }
        }

        $iglesias = $iglesias->unique('id')->values();

        // Crear el PDF
        $fpdf->AddPage();
        $fpdf->SetAutoPageBreak(true, 10);

        // Configuración inicial
        $fpdf->SetFont('Arial', 'B', 16);
        $fpdf->SetTextColor(0, 0, 0);

        // Colores para las celdas
        $headerColor = array(52, 73, 94); // Azul oscuro
        $cellColor1 = array(236, 240, 241); // Gris muy claro
        $cellColor2 = array(255, 255, 255); // Blanco
        $borderColor = array(189, 195, 199); // Gris medio

        // ENCABEZADO CORPORATIVO UNIFICADO (X=10 a 160, Alto=42mm)
        $headerX = 10;
        $headerY = 10;
        $headerW = 150;
        $headerH = 42;

        // 1. Recuadro Azul Corporativo Unificado
        $fpdf->SetXY($headerX, $headerY);
        $fpdf->SetFillColor(41, 128, 185); // Azul profesional #2980b9
        $fpdf->Rect($headerX, $headerY, $headerW, $headerH, 'F');

        // 2. Logo dentro del Recuadro Azul (X=13, Y=13, Ancho=28, Alto=28)
        $logoPath = public_path('icons/logo_mmm.png');
        if (file_exists($logoPath)) {
            // Fondo blanco para destacar el logo dentro de la barra azul
            
            $fpdf->Rect(13, 13, 20, 28, 'F');
            $fpdf->Image($logoPath, 14, 20, 26, 20);
        }

        // 3. Textos Corporativos Unificados dentro de la barra azul
        $textX = 44;
        $textW = $headerW - 36; // 114mm

        // Títulos de la institución
        $fpdf->SetXY($textX, 12);
        $fpdf->SetTextColor(255, 255, 255);
        $fpdf->SetFont('Arial', 'B', 9);
        $fpdf->Cell($textW, 4.5, utf8_decode('IGLESIA CRISTIANA PENTECOSTÉS DE VENEZUELA'), 0, 1, 'C');

        $fpdf->SetX($textX);
        $fpdf->SetFont('Arial', 'B', 8.5);
        $fpdf->Cell($textW, 4.5, utf8_decode('MOVIMIENTO MISIONERO MUNDIAL'), 0, 1, 'C');

        $fpdf->SetX($textX);
        $fpdf->SetFont('Arial', 'I', 8.5);
        $fpdf->SetTextColor(224, 247, 250); // Celeste claro
        $fpdf->Cell($textW, 5, utf8_decode('REGISTRO DE DATOS DE OBREROS'), 0, 1, 'C');

        // Línea divisoria interna blanca
        $fpdf->SetDrawColor(255, 255, 255);
        $fpdf->SetLineWidth(0.3);
        $fpdf->Line($textX, 28, $headerX + $headerW - 3, 28);

        // Obtener datos dinámicos de la Empresa / Sucursal Sede Principal
        $empresa = Empresa::first();
        $sucursal = Sucursal::where('status', true)->first();

        $rifStr = $empresa?->documento ? "RIF: {$empresa->documento}" : 'RIF: J-301874463';
        $tlfStr = $sucursal?->telefono ?: ($empresa?->telefono ?: '0212-8600173');
        $dirStr = $sucursal?->direccion ?: ($empresa?->direccion ?: 'Av. Sucre de Catia, cruce Calle El Carmen, Local 5B, Caracas');
        $sedeLabel = $sucursal?->nombre ? "Sede Principal ({$sucursal->nombre})" : 'Sede Central';

        // Datos institucionales unificados y centrados
        $fpdf->SetXY($textX, 29.5);
        $fpdf->SetFont('Arial', '', 7.5);
        $fpdf->SetTextColor(255, 255, 255);
        $fpdf->Cell($textW, 4, utf8_decode("{$rifStr}   |   Teléfono: {$tlfStr}"), 0, 1, 'C');

        $fpdf->SetX($textX);
        $fpdf->Cell($textW, 4, utf8_decode("{$sedeLabel}: {$dirStr}"), 0, 1, 'C');

        // 4. FOTO DEL PASTOR TIPO CARNET A LA DERECHA (X=165, Y=10, Ancho=35, Alto=42)
        $photoX = 165;
        $photoY = 10;
        $photoW = 35;
        $photoH = 42;

        $fpdf->SetXY($photoX, $photoY);
        $fpdf->SetFillColor(250, 250, 250);
        $fpdf->SetDrawColor(189, 195, 199);
        $fpdf->SetLineWidth(0.4);
        $fpdf->Rect($photoX, $photoY, $photoW, $photoH, 'DF');

        if ($pastor->foto && file_exists(public_path('pastores/' . trim($pastor->foto)))) {
            $imagePath = public_path('pastores/' . trim($pastor->foto));
            $imgInfo = @getimagesize($imagePath);

          
                $origW = $imgInfo[0];
                $origH = $imgInfo[1];

                // Margen interno de 0.5mm dentro del recuadro carnet
                $maxW = $photoW - 1; // 34mm
                $maxH = $photoH - 1; // 41mm

                // Calcular escala para mantener aspecto sin estirar
                $scale = min($maxW / $origW, $maxH / $origH);
                $finalW = $origW * $scale;
                $finalH = $origH * $scale;

                // Centrar dentro del recuadro carnet
                $finalX = $photoX + 0.5 + ($maxW - $finalW) / 2;
                $finalY = $photoY + 0.5 + ($maxH - $finalH) / 2;

                $fpdf->Image($imagePath, 162, 10, 38, 42);
       
        } else {
            $fpdf->SetXY($photoX, $photoY + 18);
            $fpdf->SetFont('Arial', 'I', 8);
            $fpdf->SetTextColor(120, 120, 120);
            $fpdf->Cell($photoW, 4, utf8_decode('FOTO DEL OBRERO'), 0, 0, 'C');
        }

        // 5. SECCIÓN PLANILLA DE DATOS DEL PASTOR
        $fpdf->SetXY(10, 56);
        $fpdf->SetFillColor($headerColor[0], $headerColor[1], $headerColor[2]);
        $fpdf->SetTextColor(255, 255, 255);
        $fpdf->SetFont('Arial', 'B', 11);
        $fpdf->Cell(0, 8, utf8_decode('PLANILLA DE DATOS DEL PASTOR'), 0, 1, 'C', true);

        $fpdf->SetTextColor(0, 0, 0);
        $fpdf->SetFont('Arial', '', 9);

        // Primera fila de datos personales (después del recuadro de foto)
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Código:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(55, 7, utf8_decode($pastor->codigo ?? 'No especificado'), 1, 0, 'L', true);

        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Documento:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(65, 7, utf8_decode($pastor->documento ?? 'No especificado'), 1, 1, 'L', true);

        // Segunda fila
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Nombre:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(80, 7, utf8_decode($pastor->nombres . ' ' . $pastor->apellidos ?? 'No especificado'), 1, 0, 'L', true);

        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Edad:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(40, 7, utf8_decode($pastor->edad ?? 'No especificada'), 1, 1, 'L', true);

        // Tercera fila
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Fecha Nac.:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fecha_nac = $pastor->fe_nacimiento ? date('d/m/Y', strtotime($pastor->fe_nacimiento)) : 'No especificada';
        $fpdf->Cell(55, 7, utf8_decode($fecha_nac), 1, 0, 'L', true);

        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Género:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(65, 7, utf8_decode($pastor->genero ?? 'No especificado'), 1, 1, 'L', true);

        // Cuarta fila
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Estado Civil:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(55, 7, utf8_decode($pastor->estado_civil ?? 'No especificado'), 1, 0, 'L', true);

        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Teléfono:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $telefono = $pastor->telefono_hab ?? $pastor->telefono_tlf ?? $pastor->telefono_otro ?? 'No especificado';
        $fpdf->Cell(65, 7, utf8_decode($telefono), 1, 1, 'L', true);

        // Quinta fila
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Email:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(155, 7, utf8_decode($pastor->user->email ?? 'No especificado'), 1, 1, 'L', true);

        // Sexta fila
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Grado Instrucción:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(55, 7, utf8_decode($pastor->grado_instruccion ?? 'No especificado'), 1, 0, 'L', true);

        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Título Obtenido:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(65, 7, utf8_decode($pastor->titulo_obtenido ?? 'No especificado'), 1, 1, 'L', true);

        // Séptima fila
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Batizado Espíritu:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(55, 7, utf8_decode($pastor->batizado_espiritu_santo ? 'Sí' : 'No'), 1, 0, 'L', true);

        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('En Ministerio:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(65, 7, utf8_decode($pastor->pertenece_ministerio ? 'Sí' : 'No'), 1, 1, 'L', true);

        $fpdf->Ln(8);

        // DATOS DE UBICACIÓN
        $fpdf->SetFillColor($headerColor[0], $headerColor[1], $headerColor[2]);
        $fpdf->SetTextColor(255, 255, 255);
        $fpdf->SetFont('Arial', 'B', 12);
        $fpdf->Cell(0, 8, utf8_decode('DATOS DE UBICACIÓN'), 1, 1, 'C', true);

        $fpdf->SetTextColor(0, 0, 0);
        $fpdf->SetFont('Arial', '', 10);

        // Fila de ubicación
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Estado:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(55, 7, utf8_decode($pastor->estado->nombre ?? 'No especificado'), 1, 0, 'L', true);

        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Ciudad:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(65, 7, utf8_decode($pastor->ciudad->nombre ?? 'No especificado'), 1, 1, 'L', true);

        // Segunda fila de ubicación
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Municipio:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(55, 7, utf8_decode($pastor->municipio->nombre ?? 'No especificado'), 1, 0, 'L', true);

        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Parroquia:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(65, 7, utf8_decode($pastor->parroquia->nombre ?? 'No especificada'), 1, 1, 'L', true);

        // Dirección completa
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Dirección:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->MultiCell(155, 7, utf8_decode($this->construirDireccionCompleta($pastor)), 1, 'L', true);

        $fpdf->Ln(8);

        // DATOS MINISTERIALES
        $fpdf->SetFillColor($headerColor[0], $headerColor[1], $headerColor[2]);
        $fpdf->SetTextColor(255, 255, 255);
        $fpdf->SetFont('Arial', 'B', 12);
        $fpdf->Cell(0, 8, utf8_decode('DATOS MINISTERIALES'), 1, 1, 'C', true);

        $fpdf->SetTextColor(0, 0, 0);
        $fpdf->SetFont('Arial', '', 10);

        // Primera fila ministerial
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Nivel Ministerial:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(55, 7, utf8_decode($pastor->nivel_ministerial ?? 'No especificado'), 1, 0, 'L', true);

        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Año Promoción:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(65, 7, utf8_decode($pastor->ano_promocion ?? 'No especificado'), 1, 1, 'L', true);

        // Segunda fila ministerial
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('T. Ministerial:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(55, 7, utf8_decode($pastor->tiempo_colaborando ?? 'No especificado'), 1, 0, 'L', true);

        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Cargo Nacional:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(65, 7, utf8_decode($pastor->cargo_nacional ?? 'No especificado'), 1, 1, 'L', true);

        // Tercera fila ministerial
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Estado:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(55, 7, utf8_decode($pastor->status ? 'Activo' : 'Inactivo'), 1, 0, 'L', true);

        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Estudios Teológicos:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(65, 7, utf8_decode($pastor->estudio_teologico ? 'Sí' : 'No'), 1, 1, 'L', true);

        // Si tiene estudios teológicos
        if($pastor->estudio_teologico) {
            // Cuarta fila ministerial
            $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
            $fpdf->Cell(35, 7, utf8_decode('Título Teológico:'), 1, 0, 'L', true);
            $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
            $fpdf->Cell(155, 7, utf8_decode($pastor->titulo_teologico ?? 'No especificado'), 1, 1, 'L', true);

            // Quinta fila ministerial
            $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
            $fpdf->Cell(35, 7, utf8_decode('Tiempo de Estudio:'), 1, 0, 'L', true);
            $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
            $fpdf->Cell(55, 7, utf8_decode($pastor->tiempo_de_estudio_teologico ?? 'No especificado'), 1, 0, 'L', true);

            $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
            $fpdf->Cell(35, 7, utf8_decode('Instituto Teológico:'), 1, 0, 'L', true);
            $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
            $fpdf->Cell(65, 7, utf8_decode($pastor->instituto_teologico ?? 'No especificado'), 1, 1, 'L', true);
        }

        $fpdf->Ln(8);

        // Datos del cónyuge (si existe)
        if ($pastor->nombre_conyuge) {
            $fpdf->SetFillColor($headerColor[0], $headerColor[1], $headerColor[2]);
            $fpdf->SetTextColor(255, 255, 255);
            $fpdf->SetFont('Arial', 'B', 12);
            $fpdf->Cell(0, 8, utf8_decode('DATOS DEL CÓNYUGE'), 1, 1, 'C', true);

            $fpdf->SetTextColor(0, 0, 0);
            $fpdf->SetFont('Arial', '', 10);

            // Primera fila del cónyuge
            $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
            $fpdf->Cell(35, 7, utf8_decode('Nombre:'), 1, 0, 'L', true);
            $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
            $fpdf->Cell(155, 7, utf8_decode($pastor->nombre_conyuge), 1, 1, 'L', true);

            if ($pastor->conyuge) {
                // Segunda fila del cónyuge
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Documento:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(55, 7, utf8_decode($pastor->conyuge->documento ?? 'No especificado'), 1, 0, 'L', true);

                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Teléfono:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $telefono_conyuge = $pastor->conyuge->telefono_hab ?? $pastor->conyuge->telefono_tlf ?? $pastor->conyuge->telefono_otro ?? 'No especificado';
                $fpdf->Cell(65, 7, utf8_decode($telefono_conyuge), 1, 1, 'L', true);
            }

            $fpdf->Ln(8);
        }

        // DATOS DE SALUD
        $fpdf->SetFillColor($headerColor[0], $headerColor[1], $headerColor[2]);
        $fpdf->SetTextColor(255, 255, 255);
        $fpdf->SetFont('Arial', 'B', 12);
        $fpdf->Cell(0, 8, utf8_decode('DATOS DE SALUD'), 1, 1, 'C', true);

        $fpdf->SetTextColor(0, 0, 0);
        $fpdf->SetFont('Arial', '', 10);

        // Fila 1: Grupo Sanguíneo, Condición de Salud y Alergias
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('G. Sanguíneo:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(25, 7, utf8_decode($pastor->grupo_sanguineo ?? 'No especificado'), 1, 0, 'L', true);

        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(30, 7, utf8_decode('Condición:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(35, 7, utf8_decode($pastor->condicion_salud ?? 'Buena'), 1, 0, 'L', true);

        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(25, 7, utf8_decode('Alergias:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $fpdf->Cell(40, 7, utf8_decode($pastor->alergias ?? 'Ninguna'), 1, 1, 'L', true);

        // Fila 2: Padece Enfermedad / Diagnóstico
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Enfermedades:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $enfText = $pastor->padece_enfermedad ? ($pastor->enfermedades_cronicas ?: 'Sí (sin detalle)') : 'Ninguna declarada';
        $fpdf->Cell(155, 7, utf8_decode($enfText), 1, 1, 'L', true);

        // Fila 3: Medicamentos Recetados
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('Medicamentos:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);

        $medList = [];
        if ($pastor->toma_medicamentos && !empty($pastor->medicamentos_recetados)) {
            $raw = $pastor->medicamentos_recetados;
            if (is_array($raw)) {
                foreach ($raw as $m) {
                    $name = is_array($m) ? ($m['nombre'] ?? '') : (is_object($m) ? ($m->nombre ?? '') : (string)$m);
                    $dosis = is_array($m) ? ($m['dosis'] ?? '') : (is_object($m) ? ($m->dosis ?? '') : '');
                    if ($name) {
                        $medList[] = $name . ($dosis ? " ({$dosis})" : '');
                    }
                }
            } elseif (is_string($raw)) {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) {
                    foreach ($decoded as $m) {
                        $name = is_array($m) ? ($m['nombre'] ?? '') : (string)$m;
                        $dosis = is_array($m) ? ($m['dosis'] ?? '') : '';
                        if ($name) {
                            $medList[] = $name . ($dosis ? " ({$dosis})" : '');
                        }
                    }
                } else {
                    $medList[] = $raw;
                }
            }
        }

        $medText = !empty($medList) ? implode('; ', $medList) : ($pastor->toma_medicamentos ? 'Sí (sin medicamentos registrados)' : 'Ninguno de uso continuo');
        $fpdf->Cell(155, 7, utf8_decode($medText), 1, 1, 'L', true);

        // Fila 4: Contacto de Emergencia
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->Cell(35, 7, utf8_decode('C. Emergencia:'), 1, 0, 'L', true);
        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
        $contactoStr = ($pastor->contacto_emergencia_nombre ?? 'No especificado') . ($pastor->contacto_emergencia_telefono ? ' (' . $pastor->contacto_emergencia_telefono . ')' : '');
        $fpdf->Cell(155, 7, utf8_decode($contactoStr), 1, 1, 'L', true);

        // Iglesias asociadas
        if ($iglesias->count() > 0) {
            $fpdf->SetFillColor($headerColor[0], $headerColor[1], $headerColor[2]);
            $fpdf->SetTextColor(255, 255, 255);
            $fpdf->SetFont('Arial', 'B', 12);
            $fpdf->Cell(0, 8, utf8_decode('EXTENSIONES ASOCIADAS'), 1, 1, 'C', true);

            foreach ($iglesias as $index => $iglesia) {
                // Nombre de la iglesia como subheader
                $fpdf->SetFillColor(52, 152, 219); // Azul más claro
                $fpdf->SetTextColor(255, 255, 255);
                $fpdf->SetFont('Arial', 'B', 11);
                $fpdf->Cell(0, 7, utf8_decode('Iglesia #' . ($index + 1) . ': ' . ($iglesia->nombre ?? 'Sin nombre')), 1, 1, 'L', true);

                $fpdf->SetTextColor(0, 0, 0);
                $fpdf->SetFont('Arial', '', 10);

                // INFORMACIÓN BÁSICA
                $fpdf->SetFillColor($headerColor[0], $headerColor[1], $headerColor[2]);
                $fpdf->SetTextColor(255, 255, 255);
                $fpdf->SetFont('Arial', 'B', 10);
                $fpdf->Cell(0, 6, utf8_decode('INFORMACIÓN BÁSICA'), 1, 1, 'C', true);

                $fpdf->SetTextColor(0, 0, 0);
                $fpdf->SetFont('Arial', '', 10);

                // Primera fila - Tipo de local y fecha de fundación
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Tipo Local:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(55, 7, utf8_decode($iglesia->tipoLocal->nombre ?? 'No especificado'), 1, 0, 'L', true);

                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Fecha Fundación:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fecha_fundacion = $iglesia->fecha_fundacion ? date('d/m/Y', strtotime($iglesia->fecha_fundacion)) : 'No especificada';
                $fpdf->Cell(65, 7, utf8_decode($fecha_fundacion), 1, 1, 'L', true);

                // Segunda fila - Años activa y estado
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Años Activa:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(55, 7, utf8_decode($iglesia->anios_activa ?? '0') . utf8_decode(' años'), 1, 0, 'L', true);

                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Estado:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(65, 7, utf8_decode($iglesia->activa ? 'Activa' : 'Inactiva'), 1, 1, 'L', true);

                // Tercera fila - Descripción
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Descripción:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->MultiCell(155, 7, utf8_decode($iglesia->descripcion ?? 'No especificada'), 1, 'L', true);

                // INFORMACIÓN DE CONTACTO
                $fpdf->SetFillColor($headerColor[0], $headerColor[1], $headerColor[2]);
                $fpdf->SetTextColor(255, 255, 255);
                $fpdf->SetFont('Arial', 'B', 10);
                $fpdf->Cell(0, 6, utf8_decode('INFORMACIÓN DE CONTACTO'), 1, 1, 'C', true);

                $fpdf->SetTextColor(0, 0, 0);
                $fpdf->SetFont('Arial', '', 10);

                // Primera fila - Teléfono y Email
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Teléfono:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(55, 7, utf8_decode($iglesia->telefono ?? 'No especificado'), 1, 0, 'L', true);

                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Email:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(65, 7, utf8_decode($iglesia->email ?? 'No especificado'), 1, 1, 'L', true);

                // INFORMACIÓN DE UBICACIÓN
                $fpdf->SetFillColor($headerColor[0], $headerColor[1], $headerColor[2]);
                $fpdf->SetTextColor(255, 255, 255);
                $fpdf->SetFont('Arial', 'B', 10);
                $fpdf->Cell(0, 6, utf8_decode('INFORMACIÓN DE UBICACIÓN'), 1, 1, 'C', true);

                $fpdf->SetTextColor(0, 0, 0);
                $fpdf->SetFont('Arial', '', 10);

                // Primera fila - Estado y Ciudad
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Estado:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(55, 7, utf8_decode($iglesia->estado->nombre ?? 'No especificado'), 1, 0, 'L', true);

                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Ciudad:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(65, 7, utf8_decode($iglesia->ciudad->nombre ?? 'No especificado'), 1, 1, 'L', true);

                // Segunda fila - Municipio y Parroquia
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Municipio:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(55, 7, utf8_decode($iglesia->municipio->nombre ?? 'No especificado'), 1, 0, 'L', true);

                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Parroquia:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(65, 7, utf8_decode($iglesia->parroquia->nombre ?? 'No especificada'), 1, 1, 'L', true);

                // Tercera fila - Zona y Distrito
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Zona:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(55, 7, utf8_decode($iglesia->zona ?? 'No especificada'), 1, 0, 'L', true);

                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Distrito:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(65, 7, utf8_decode($iglesia->distrito ?? 'No especificado'), 1, 1, 'L', true);

                // Cuarta fila - Sector, Calle y Avenida
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Sector:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(55, 7, utf8_decode($iglesia->sector ?? 'No especificado'), 1, 0, 'L', true);

                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Calle:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(65, 7, utf8_decode($iglesia->calle ?? 'No especificada'), 1, 1, 'L', true);

                // Quinta fila - Avenida y Dirección completa
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Avenida:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(155, 7, utf8_decode($iglesia->avenida ?? 'No especificada'), 1, 0, 'L', true);
                $fpdf->Ln(7);
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(190, 7, utf8_decode('Dirección:'), 1, 0, 'L', true);
                $fpdf->Ln(7);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->MultiCell(190, 7, utf8_decode($iglesia->direccion ?? 'No especificada'), 1, 'L', true);

                // Sexta fila - Coordenadas
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Coordenadas:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $coordenadas = ($iglesia->latitud && $iglesia->longitud) ?
                    $iglesia->latitud . ', ' . $iglesia->longitud : 'No especificadas';
                $fpdf->Cell(155, 7, utf8_decode($coordenadas), 1, 1, 'L', true);

                // ESTADÍSTICAS DE LA IGLESIA
                $fpdf->SetFillColor($headerColor[0], $headerColor[1], $headerColor[2]);
                $fpdf->SetTextColor(255, 255, 255);
                $fpdf->SetFont('Arial', 'B', 10);
                $fpdf->Cell(0, 6, utf8_decode('ESTADÍSTICAS DE LA IGLESIA'), 1, 1, 'C', true);

                $fpdf->SetTextColor(0, 0, 0);
                $fpdf->SetFont('Arial', '', 10);

                // Primera fila - Miembros activos y campos blancos
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Miembros Activos:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(55, 7, utf8_decode($iglesia->miembros_activos ?? '0') . ' miembros', 1, 0, 'L', true);

                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Campos Blancos:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(65, 7, utf8_decode($iglesia->cantidad_campos_blancos ?? '0') . ' campos', 1, 1, 'L', true);

                // Segunda fila - Miembro probante y logros
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Miembro Probante:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(55, 7, utf8_decode($iglesia->miembro_probante ?? '0') . ' miembros', 1, 0, 'L', true);

                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Tiempo Trabajo:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(65, 7, utf8_decode($iglesia->tiempo_trabajo ?? 'No especificado'), 1, 1, 'L', true);

                // Tercera fila - Iglesias fundadas y pastores en ministerio
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Iglesias Fundadas:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(55, 7, utf8_decode($iglesia->iglesias_fundadas ?? '0') . ' iglesias', 1, 0, 'L', true);

                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Pastores Ministerio:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(65, 7, utf8_decode($iglesia->pastores_ministerio ?? '0') . ' pastores', 1, 1, 'L', true);

                // Cuarta fila - Logros obtenidos
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(190, 7, utf8_decode('Logros Obtenidos:'), 1, 0, 'L', true);
                $fpdf->Ln(7);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->MultiCell(190, 7, utf8_decode($iglesia->logros_obtenidos ?? 'No especificados'), 1, 'L', true);

                // MEDIOS DE COMUNICACIÓN
                $fpdf->SetFillColor($headerColor[0], $headerColor[1], $headerColor[2]);
                $fpdf->SetTextColor(255, 255, 255);
                $fpdf->SetFont('Arial', 'B', 10);
                $fpdf->Cell(0, 6, utf8_decode('MEDIOS DE COMUNICACIÓN'), 1, 1, 'C', true);

                $fpdf->SetTextColor(0, 0, 0);
                $fpdf->SetFont('Arial', '', 10);

                // Posee medio de comunicación
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(45, 7, utf8_decode('Tiene Medio Com.:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(145, 7, utf8_decode($iglesia->posee_medio_comunicacion ? 'Sí' : 'No'), 1, 1, 'L', true);

                if ($iglesia->posee_medio_comunicacion) {
                    $mediosList = [];
                    if ($iglesia->medio_comunicacion) {
                        try {
                            $decoded = json_decode($iglesia->medio_comunicacion, true);
                            if (is_array($decoded)) {
                                $mediosList = $decoded;
                            }
                        } catch (\Exception $e) {}
                    }

                    if (count($mediosList) > 0) {
                        // Cabecera de la tabla de Medios
                        $fpdf->SetFont('Arial', 'B', 9);
                        $fpdf->SetFillColor(230, 235, 242);
                        $fpdf->Cell(60, 6, utf8_decode('MEDIO / TIPO'), 1, 0, 'C', true);
                        $fpdf->Cell(65, 6, utf8_decode('PLATAFORMA / UBICACIÓN'), 1, 0, 'C', true);
                        $fpdf->Cell(65, 6, utf8_decode('OBSERVACIÓN / NOTA'), 1, 1, 'C', true);

                        $fpdf->SetFont('Arial', '', 9);
                        foreach ($mediosList as $mIdx => $mItem) {
                            $rowColor = ($mIdx % 2 == 0) ? $cellColor2 : $cellColor1;
                            $fpdf->SetFillColor($rowColor[0], $rowColor[1], $rowColor[2]);
                            $fpdf->Cell(60, 6, utf8_decode($mItem['cual'] ?? 'N/A'), 1, 0, 'L', true);
                            $fpdf->Cell(65, 6, utf8_decode($mItem['donde'] ?? 'N/A'), 1, 0, 'L', true);
                            $fpdf->Cell(65, 6, utf8_decode($mItem['nota'] ?? 'Sin observaciones'), 1, 1, 'L', true);
                        }
                    } else {
                        // Legacy single item format
                        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                        $fpdf->Cell(45, 7, utf8_decode('Tipo / Nombre Medio:'), 1, 0, 'L', true);
                        $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                        $fpdf->Cell(145, 7, utf8_decode($iglesia->nombre_medio_comunicacion ?: ($iglesia->medio_comunicacion ?? 'No especificado')), 1, 1, 'L', true);
                    }
                }

                // REGISTRO
                $fpdf->SetFillColor($headerColor[0], $headerColor[1], $headerColor[2]);
                $fpdf->SetTextColor(255, 255, 255);
                $fpdf->SetFont('Arial', 'B', 10);
                $fpdf->Cell(0, 6, utf8_decode('INFORMACIÓN DE REGISTRO'), 1, 1, 'C', true);

                $fpdf->SetTextColor(0, 0, 0);
                $fpdf->SetFont('Arial', '', 10);

                // Usuario que registró
                $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                $fpdf->Cell(35, 7, utf8_decode('Registrado Por:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $usuario_registro = $iglesia->usuarioRegistro ?
                    $iglesia->usuarioRegistro->name : 'No especificado';
                $fpdf->Cell(155, 7, utf8_decode($usuario_registro), 1, 1, 'L', true);

                if ($index < $pastor->iglesias->count() - 1) {
                    $fpdf->Ln(8);
                }
            }
        }

        // Pie de página
        $fpdf->Ln(10);
        $fpdf->SetFont('Arial', 'I', 8);
        $fpdf->Cell(0, 5, utf8_decode('Planilla generada el ' . date('d/m/Y H:i:s')), 0, 1, 'C');
    }
}