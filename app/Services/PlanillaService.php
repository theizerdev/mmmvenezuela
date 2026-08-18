<?php

namespace App\Services;

use App\Models\Pastor;
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

    public function generarPdfParaPastor(Pastor $pastor, $fpdf = null) { if (!$fpdf) { $fpdf = app('fpdf'); }
        // Si el pastor es cónyuge, también cargar las iglesias del pastor principal
        $iglesias = $pastor->iglesias;
        if ($pastor->esConyuge() && $pastor->pastorPrincipal) {
            $iglesias = $iglesias->merge($pastor->pastorPrincipal->iglesias);
        }

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

        // ENCABEZADO PROFESIONAL MEJORADO

        // Título principal con fondo azul oscuro
        $fpdf->SetFillColor(41, 128, 185); // Azul más profesional
        $fpdf->SetTextColor(255, 255, 255);
        $fpdf->SetFont('Arial', 'B', 9);
        $fpdf->Cell(0, 12, utf8_decode('IGLESIA CRISTIANA PENTECOSTÉS DE VENEZUELA DEL MOVIMIENTO MISIONERO MUNDIAL'), 0, 1, 'C', true);

        // Subtítulo
        $fpdf->SetFont('Arial', 'I', 11);
        $fpdf->Cell(0, 6, utf8_decode('Registro de Datos de Obreros'), 0, 1, 'C', true);
        $fpdf->Ln(3);

        // Línea decorativa
        $fpdf->SetDrawColor(41, 128, 185);
        $fpdf->SetLineWidth(0.5);
        $fpdf->Line(10, $fpdf->GetY(), 200, $fpdf->GetY());
        $fpdf->Ln(3);

        // Sección de datos de la empresa en formato horizontal
        $fpdf->SetFont('Arial', 'B', 10);
        $fpdf->SetTextColor(41, 128, 185);
        $fpdf->Cell(30, 6, utf8_decode('Razón Social:'), 0, 0, 'L');
        $fpdf->SetFont('Arial', 'B', 10);
        $fpdf->SetTextColor(0, 0, 0);
        $fpdf->Cell(80, 6, utf8_decode('IGLESIA CRISTIANA PENTECOSTÉS DE VENEZUELA DEL MOVIMIENTO MISIONERO MUNDIAL'), 0, 0, 'L');

        $fpdf->SetFont('Arial', 'B', 10);
        $fpdf->SetTextColor(41, 128, 185);
        $fpdf->Cell(20, 6, utf8_decode(''), 0, 0, 'L');
        $fpdf->SetFont('Arial', '', 10);
        $fpdf->SetTextColor(0, 0, 0);
        $fpdf->Cell(50, 6, utf8_decode(''), 0, 1, 'L');

        $fpdf->SetFont('Arial', 'B', 10);
        $fpdf->SetTextColor(41, 128, 185);
        $fpdf->Cell(30, 6, utf8_decode('Teléfono:'), 0, 0, 'L');
        $fpdf->SetFont('Arial', '', 10);
        $fpdf->SetTextColor(0, 0, 0);
        $fpdf->Cell(80, 6, utf8_decode('0212-8600173'), 0, 0, 'L');

        $fpdf->SetFont('Arial', 'B', 10);
        $fpdf->SetTextColor(41, 128, 185);
        $fpdf->Cell(20, 6, utf8_decode('RIF:'), 0, 0, 'L');
        $fpdf->SetFont('Arial', '', 10);
        $fpdf->SetTextColor(0, 0, 0);
        $fpdf->Cell(50, 6, utf8_decode('J-301874463'), 0, 1, 'L');

        $fpdf->SetFont('Arial', 'B', 10);
        $fpdf->SetTextColor(41, 128, 185);
        $fpdf->Cell(30, 6, utf8_decode('Sede Central:'), 0, 0, 'L');
        $fpdf->SetFont('Arial', '', 10);
        $fpdf->SetTextColor(0, 0, 0);
        $fpdf->MultiCell(150, 6, utf8_decode('Av. Sucre de Catia, cruce con Calle El Carmen, Local 5B, Caracas - Venezuela'), 0, 'L');

        $fpdf->Ln(5);

        // Línea decorativa inferior
        $fpdf->SetDrawColor(41, 128, 185);
        $fpdf->SetLineWidth(0.5);
        $fpdf->Line(10, $fpdf->GetY(), 200, $fpdf->GetY());
        $fpdf->Ln(5);

        // Reset posición
        $fpdf->SetXY(165, 60);
           // Recuadro para la foto del pastor
        $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
        $fpdf->SetTextColor(0, 0, 0);
        $fpdf->SetFont('Arial', 'B', 10);
        $fpdf->Cell(35, 40, utf8_decode('FOTO DEL OBREO'), 1, 0, 'C', true);


        // Foto del pastor (si existe)
        if ($pastor->foto && (file_exists(public_path('pastores/'.str_replace(' ', '',$pastor->foto))))) {
            $imagePath = public_path('pastores/'.str_replace(' ', '',$pastor->foto));
            $fpdf->Image($imagePath, 165, 60, 35, 40);
        } else {
            // Si no hay foto, mostrar texto
            $fpdf->SetFont('Arial', 'I', 8);
            $fpdf->SetXY(11, 110);
            $fpdf->MultiCell(33, 4, utf8_decode('Sin foto disponible'), 0, 'C');
        }
        // Reset posición
        $fpdf->SetXY(10, 110);

        // Reset colores
        $fpdf->SetTextColor(0, 0, 0);

        // DATOS PERSONALES
        $fpdf->SetFillColor($headerColor[0], $headerColor[1], $headerColor[2]);
        $fpdf->SetTextColor(255, 255, 255);
        $fpdf->SetFont('Arial', 'B', 12);
        $fpdf->Cell(0, 10, utf8_decode('PLANILLA DE DATOS DEL PASTOR'), 0, 1, 'C', true);

        // Reset colores para contenido
        $fpdf->SetTextColor(0, 0, 0);
        $fpdf->SetFont('Arial', '', 10);

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

            $fpdf->Ln(38);
        }
         $fpdf->Ln(16);
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
                $fpdf->Cell(35, 7, utf8_decode('Tiene Medio Com.:'), 1, 0, 'L', true);
                $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                $fpdf->Cell(55, 7, utf8_decode($iglesia->posee_medio_comunicacion ? 'Sí' : 'No'), 1, 0, 'L', true);

                if ($iglesia->posee_medio_comunicacion) {
                    // Tipo de medio
                    $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                    $fpdf->Cell(35, 7, utf8_decode('Tipo Medio:'), 1, 0, 'L', true);
                    $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                    $fpdf->Cell(65, 7, utf8_decode($iglesia->medio_comunicacion ?? 'No especificado'), 1, 1, 'L', true);

                    // Nombre del medio
                    $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                    $fpdf->Cell(35, 7, utf8_decode('Nombre Medio:'), 1, 0, 'L', true);
                    $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                    $fpdf->Cell(155, 7, utf8_decode($iglesia->nombre_medio_comunicacion ?? 'No especificado'), 1, 0, 'L', true);

                    // Dónde está el medio
                    $fpdf->Ln(7);
                    $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                    $fpdf->Cell(35, 7, utf8_decode('Ubicación:'), 1, 0, 'L', true);
                    $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                    $fpdf->Cell(155, 7, utf8_decode($iglesia->donde_medio_comunicacion ?? 'No especificada'), 1, 1, 'L', true);
                } else {
                    // Relleno si no tiene medio de comunicación
                    $fpdf->SetFillColor($cellColor1[0], $cellColor1[1], $cellColor1[2]);
                    $fpdf->Cell(35, 7, utf8_decode(''), 1, 0, 'L', true);
                    $fpdf->SetFillColor($cellColor2[0], $cellColor2[1], $cellColor2[2]);
                    $fpdf->Cell(65, 7, utf8_decode(''), 1, 1, 'L', true);
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