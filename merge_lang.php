<?php

$esJsonPath = __DIR__ . '/lang/es.json';
$enJsonPath = __DIR__ . '/lang/en.json';

$newKeys = [
    "Health Diagnostic" => "Diagnóstico de Salud",
    "WhatsApp Health Diagnostic" => "Diagnóstico de Salud de WhatsApp",
    "Real-time latency check and Baileys engine status test." => "Prueba de latencia y estado del motor Baileys en tiempo real.",
    "Executing server ping..." => "Ejecutando ping al servidor...",
    "Network Latency" => "Latencia de Red",
    "The WhatsApp engine is healthy and responding optimally." => "El motor de WhatsApp está saludable y respondiendo de forma óptima.",
    "Re-test" => "Volver a Probar",
    "Templates" => "Plantillas",
    "History & Logs" => "Historial & Logs",
    "Message Templates with Spintax" => "Plantillas de Mensajes con Spintax",
    "Create and manage reusable templates for pastoral notifications, calls, and announcements." => "Crea y gestiona plantillas reutilizables para notificaciones pastorales, convocatorias y comunicados.",
    "New Template" => "Nueva Plantilla",
    "Edit Template" => "Editar Plantilla",
    "New WhatsApp Template" => "Nueva Plantilla de WhatsApp",
    "Define a reusable template with Spintax options and dynamic variables." => "Define una plantilla reutilizable con opciones Spintax y variables dinámicas.",
    "Template Name" => "Nombre de la Plantilla",
    "e.g. Pastoral Assembly Call" => "ej. Convocatoria a Asamblea Pastoral",
    "Select category" => "Selecciona categoría",
    "Template Content (Spintax Supported)" => "Contenido de la Plantilla (con Spintax)",
    "Use {option1|option2}" => "Usa {opcion1|opcion2}",
    "Insert Quick Variables:" => "Insertar Variables Rápidas:",
    "Saving..." => "Guardando...",
    "Save Template" => "Guardar Plantilla",
    "Template Saved" => "Plantilla Guardada",
    "WhatsApp template successfully stored." => "Plantilla de WhatsApp guardada exitosamente.",
    "Delete Template?" => "¿Eliminar Plantilla?",
    "Template removed successfully." => "Plantilla eliminada exitosamente.",
    "Use in Sandbox" => "Usar en Sandbox",
    "Template Loaded" => "Plantilla Cargada",
    "Template loaded into the testing sandbox." => "Plantilla cargada en el sandbox de pruebas.",
    "No templates registered in this category." => "No hay plantillas registradas en esta categoría.",
    "Total Outbound" => "Total Salientes",
    "Delivery Rate" => "Tasa de Entrega",
    "Read Rate" => "Tasa de Lectura",
    "Failed" => "Fallidos",
    "Message & Delivery Registry" => "Registro de Mensajes y Entregas",
    "Live log of sent and received messages with read confirmation." => "Historial en vivo de mensajes enviados y recibidos con confirmación de lectura.",
    "Refresh" => "Refrescar",
    "Search by phone or message..." => "Buscar por teléfono o mensaje...",
    "All Statuses" => "Todos los Estados",
    "Delivered" => "Entregado",
    "Read" => "Leído",
    "Sent" => "Enviado",
    "Pending" => "Pendiente",
    "Inbound" => "Entrante",
    "Outbound" => "Saliente",
    "Retry" => "Reintentar",
    "Message Re-sent" => "Mensaje Reenviado",
    "The message has been re-queued for transmission." => "El mensaje ha sido puesto en cola para retransmisión.",
    "Retry Failed" => "Error al Reintentar",
    "Loading messages..." => "Cargando mensajes...",
    "No messages found with selected filters." => "No hay mensajes registrados con los filtros seleccionados.",
    "Message Details" => "Detalle del Mensaje",
    "Recipient:" => "Destinatario:",
    "Message ID:" => "ID del Mensaje:",
    "Sent Date:" => "Fecha de Envío:",
    "Read Date:" => "Fecha de Lectura:",
    "Retry Count:" => "Reintentos:",
    "Dispatched Content:" => "Contenido Enviado:",
    "Calls" => "Convocatorias",
    "Announcements" => "Avisos",
    "Security" => "Seguridad",
    "Attendance" => "Asistencia",
    "Load from Template:" => "Cargar desde Plantilla:",
    "Select a template..." => "Selecciona una plantilla...",
    "RSS Memory:" => "Memoria RSS:",
    "Database:" => "Base de Datos:",
    "Node.js:" => "Node.js:",
    "connected" => "conectado",
    "disconnected" => "desconectado",
    "idle" => "inactivo"
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
echo "Translations successfully merged into es.json and en.json\n";
unlink(__FILE__);
