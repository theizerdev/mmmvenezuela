<?php

$esJsonPath = __DIR__ . '/lang/es.json';
$enJsonPath = __DIR__ . '/lang/en.json';

$newKeys = [
    "Mass Broadcast" => "Difusión Masiva",
    "1. Target Audience & Recipients" => "1. Audiencia y Destinatarios",
    "Select the group and filter recipients for this broadcast." => "Selecciona el grupo y filtra los destinatarios para esta difusión.",
    "Selected" => "Seleccionados",
    "Target Group" => "Grupo Objetivo",
    "Presbyters (Role: Presbítero)" => "Presbíteros (Rol: Presbítero)",
    "All Active Pastors" => "Todos los Pastores Activos",
    "All System Users" => "Todos los Usuarios del Sistema",
    "Filter by Zone" => "Filtrar por Zona",
    "All Zones (National)" => "Todas las Zonas (Nacional)",
    "Zone" => "Zona",
    "Search recipient by name, phone..." => "Buscar destinatario por nombre, teléfono...",
    "Deselect All" => "Deseleccionar Todos",
    "Select All" => "Seleccionar Todos",
    "Zone / District" => "Zona / Distrito",
    "Loading audience list..." => "Cargando lista de audiencia...",
    "No recipients found matching current filters." => "No se encontraron destinatarios con los filtros seleccionados.",
    "No phone registered" => "Sin teléfono registrado",
    "Valid" => "Válido",
    "Invalid Phone" => "Teléfono Inválido",
    "2. Message & Spintax Content" => "2. Contenido del Mensaje y Spintax",
    "Compose broadcast with Spintax options and dynamic tags." => "Redacta la difusión con opciones Spintax y variables dinámicas.",
    "Load Official Template" => "Cargar Plantilla Oficial",
    "Select a template to load..." => "Selecciona una plantilla para cargar...",
    "Insert Dynamic Variables" => "Insertar Variables Dinámicas",
    "Message Body (Spintax Supported)" => "Cuerpo del Mensaje (Soporta Spintax)",
    "Write pastoral circular or load an official template..." => "Escribe la circular pastoral o carga una plantilla oficial...",
    "Anti-Ban Safety Delay" => "Retardo de Seguridad Anti-Baneo",
    "delay" => "de retardo",
    "Estimated total broadcast time:" => "Tiempo total estimado de difusión:",
    "minutes" => "minutos",
    "Sample Preview for" => "Vista Previa de Muestra para",
    "Enqueuing Campaign..." => "Encolando Campaña...",
    "Launch Safe Broadcast" => "Iniciar Difusión Segura",
    "No Recipients Selected" => "Ningún Destinatario Seleccionado",
    "Please select at least one recipient with a valid phone number." => "Por favor selecciona al menos un destinatario con número de teléfono válido.",
    "Empty Message" => "Mensaje Vacío",
    "Please compose a message or choose a template before sending." => "Por favor redacta un mensaje o elige una plantilla antes de enviar.",
    "Presbyters" => "Presbíteros",
    "Pastors" => "Pastores",
    "Users" => "Usuarios",
    "Dispatch Broadcast Campaign?" => "¿Despachar Campaña de Difusión?",
    "Target Audience:" => "Audiencia Objetivo:",
    "Recipients Count:" => "Total Destinatarios:",
    "recipients" => "destinatarios",
    "Safety Delay:" => "Retardo de Seguridad:",
    "seconds between messages" => "segundos entre mensajes",
    "Messages will be queued and sent safely with Spintax variation to protect the WhatsApp line." => "Los mensajes serán encolados y enviados de forma segura con variación Spintax para proteger la línea de WhatsApp.",
    "Yes, Dispatch Broadcast" => "Sí, Despachar Difusión",
    "Broadcast Enqueued!" => "¡Difusión Encolada!",
    "The broadcast messages have been successfully added to the dispatch queue." => "Los mensajes de difusión han sido agregados exitosamente a la cola de despacho.",
    "View History & Logs" => "Ver Historial & Logs",
    "Broadcast Error" => "Error en Difusión",
    "Failed to dispatch broadcast." => "Error al despachar la difusión.",
    "Network error attempting to send broadcast." => "Error de red al intentar enviar la difusión.",
    ":count broadcast messages enqueued successfully." => ":count mensajes de difusión encolados exitosamente.",
    "Unassigned" => "Sin asignar"
];

$esData = file_exists($esJsonPath) ? json_decode(file_get_contents($esJsonPath), true) : [];
$enData = file_exists($enJsonPath) ? json_decode(file_get_contents($enJsonPath), true) : [];

foreach ($newKeys as $key => $esVal) {
    $esData[$key] = $esVal;
    if (!isset($enData[$key])) {
        $enData[$key] = $key;
    }
}

file_put_contents($esJsonPath, json_encode($esData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents($enJsonPath, json_encode($enData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "Broadcast translations merged successfully\n";
unlink(__FILE__);
