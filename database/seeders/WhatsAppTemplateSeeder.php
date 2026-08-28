<?php

namespace Database\Seeders;

use App\Models\Empresa;
use App\Models\WhatsAppTemplate;
use Illuminate\Database\Seeder;

class WhatsAppTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $empresas = Empresa::all();
        if ($empresas->isEmpty()) {
            $empresas = collect([Empresa::firstOrCreate(['id' => 1], ['nombre' => 'MMM Venezuela'])]);
        }

        $templates = [
            [
                'nombre' => 'Código de Verificación OTP',
                'categoria' => 'seguridad',
                'contenido' => "{Tu código de verificación|Tu clave de seguridad|Código de acceso OTP} para {{proposito}} en {{empresa}} es: *{{otp}}*. Válido por {{minutos}} minutos. {Por favor no compartas este código con nadie.|Uso personal y confidencial.}",
                'variables' => ['otp', 'proposito', 'empresa', 'minutos'],
                'activo' => true,
            ],
            [
                'nombre' => 'Bienvenida de Presbítero al Sistema',
                'categoria' => 'seguridad',
                'contenido' => "👋 *{¡Bienvenido al Sistema Ministerial MMM Venezuela!|Paz de Dios, Estimado Presbítero}*\n\nEstimado Presbítero *{{nombre}}*, se ha creado su cuenta de acceso institucional:\n\n🔐 *Credenciales de acceso:*\n• *Usuario:* {{email}}\n{{password_line}}• *Enlace de ingreso:* {{login_url}}\n\n⚠️ *Nota:* Esta cuenta es de uso personal e intransferible. Al ingresar, el sistema le solicitará cambiar su contraseña por motivos de seguridad.",
                'variables' => ['nombre', 'email', 'password_line', 'login_url', 'empresa'],
                'activo' => true,
            ],
            [
                'nombre' => 'Bienvenida de Usuario al Sistema',
                'categoria' => 'seguridad',
                'contenido' => "👋 *{¡Bienvenido a la Plataforma MMM Venezuela!|Dios le bendiga, Saludos Cordiales}*\n\nEstimado(a) *{{nombre}}*,\n\nSe ha configurado su cuenta de acceso institucional a la plataforma administrativa de {{empresa}}.\n\n📋 *Detalles de su cuenta:*\n• *Rol asignado:* {{rol}}\n• *Institución:* {{empresa}}\n\n🔐 *Sus credenciales:*\n• *Usuario / Correo:* {{email}}\n{{password_line}}\n🌐 *Enlace de ingreso:*\n{{login_url}}\n\n_{Por seguridad, mantenga sus credenciales en resguardo y cambie su clave periódicamente.|Agradecemos su compromiso en el servicio.}_",
                'variables' => ['nombre', 'rol', 'email', 'password_line', 'login_url', 'empresa'],
                'activo' => true,
            ],
            [
                'nombre' => 'Confirmación de Cambio de Clave',
                'categoria' => 'seguridad',
                'contenido' => "{¡Hola {{nombre}}! 👋|Dios le bendiga {{nombre}},}\n\n{Tu contraseña ha sido actualizada con éxito en la plataforma de {{empresa}}.|Le confirmamos que su clave de acceso ha sido restablecida satisfactoriamente.} 🔒\n\n_{¿No fuiste tú? Por favor contáctanos de inmediato para proteger tu cuenta.|Si no realizaste esta acción, notifícalo a la administración.}_",
                'variables' => ['nombre', 'empresa'],
                'activo' => true,
            ],
            [
                'nombre' => 'Notificación Ministerial a Presbítero',
                'categoria' => 'pastoral',
                'contenido' => "{🔔 *MMM Venezuela - Notificación Ministerial*|📋 *Ficha de Registro Ministerial*|📢 *Notificación de Obrero a su Cargo*}\n\nEstimado Presbítero,\n{Se ha completado la ficha de registro ministerial de un obrero a su cargo:|Le notificamos el registro exitoso del pastor:}\n\n👤 *Pastor:* {{nombre}}\n🆔 *Cédula:* {{documento}}\n🏷️ *Código Asignado:* {{codigo}}\n📜 *Grado Ministerial:* {{grado}}\n📍 *Zona:* {{zona}}\n🏛️ *Distrito:* {{distrito}}\n📱 *Teléfono:* {{telefono}}\n📋 *Estado Civil:* {{estado_civil}}\n\nLos datos se encuentran listos en el panel administrativo para su revisión y confirmación oficial.",
                'variables' => ['nombre', 'documento', 'codigo', 'grado', 'zona', 'distrito', 'telefono', 'estado_civil', 'empresa'],
                'activo' => true,
            ],
            [
                'nombre' => 'Bienvenida / Registro de Pastor',
                'categoria' => 'pastoral',
                'contenido' => "{¡Dios le bendiga y bendiciones!|¡Un saludo fraternal en Cristo!|¡Bienvenido al registro ministerial!} Pastor(a) *{{nombre}}*,\n\n{Le confirmamos que su registro ministerial ha sido completado satisfactoriamente en|Le damos la más cordial bienvenida a} la plataforma oficial de {{empresa}}.\n\n🏷️ *Código Ministerial:* {{codigo}}\n📍 *Zona:* {{zona}}\n🏛️ *Distrito:* {{distrito}}\n📜 *Grado:* {{grado}}\n\n{Que el Señor continúe bendiciendo y respaldando su ministerio y familia.|Agradecemos su fidelidad en la obra del Señor.}",
                'variables' => ['nombre', 'codigo', 'zona', 'distrito', 'grado', 'empresa'],
                'activo' => true,
            ],
            [
                'nombre' => 'Felicitación y Bendición Ministerial',
                'categoria' => 'pastoral',
                'contenido' => "{🎉 ¡FELIZ CUMPLEAÑOS! 🎂|¡Muchas bendiciones en su cumpleaños! 🎂|¡Paz y gozo en su día especial! 🎉}\n\n{Estimado(a) Pastor(a)|Apreciado(a) Siervo(a) de Dios} *{{nombre}}*,\n\nDe parte de la directiva nacional y de toda la familia de {{empresa}}, {le enviamos un caluroso saludo y nuestras más sinceras felicitaciones|le felicitamos con gran gozo fraternal} en este día tan especial.\n\n{Que el Señor continúe bendiciendo grandemente su vida, su hogar y su valioso ministerio en la Zona {{zona}}.|Que la gracia y favor de Dios sigan respaldando su labor ministerial.}\n\n📖 *«El Señor te bendiga y te guarde; el Señor haga resplandecer su rostro sobre ti...» (Números 6:24-25)*",
                'variables' => ['nombre', 'zona', 'empresa'],
                'activo' => true,
            ],
            [
                'nombre' => 'Convocatoria a Reunión Pastoral',
                'categoria' => 'convocatorias',
                'contenido' => "{Estimado Pastor|Apreciado Siervo de Dios|Saludos fraternales en Cristo} {{nombre}}, {le convocamos fraternalmente a|le recordamos la realización de} la reunión de {{zona}} que se llevará a cabo el día {{fecha}} a las {{hora}} en {{lugar}}. Contamos con su valiosa presencia.",
                'variables' => ['nombre', 'zona', 'fecha', 'hora', 'lugar', 'empresa'],
                'activo' => true,
            ],
            [
                'nombre' => 'Recordatorio de Informe Mensual',
                'categoria' => 'convocatorias',
                'contenido' => "{Dios le bendiga|Estimado Pastor} {{nombre}}, {le recordamos amablemente que|esperamos que se encuentre bien, le notificamos que} está habilitada la entrega del informe mensual de {{iglesia}}. Agradecemos enviarlo antes del {{fecha_limite}}. Código de seguimiento: {{random}}.",
                'variables' => ['nombre', 'iglesia', 'fecha_limite', 'random', 'empresa'],
                'activo' => true,
            ],
            [
                'nombre' => 'Aviso Circular Oficial',
                'categoria' => 'avisos',
                'contenido' => "{COMUNICADO OFICIAL|CIRCULAR INFORMATIVA|AVISO IMPORTANTE}: {Hacemos de su conocimiento que|Se les notifica a todos los pastores y líderes de {{zona}} que} {{mensaje_circular}}. {Para mayor información comunicarse con la directiva nacional.|Dios les bendiga grandemente.}",
                'variables' => ['zona', 'mensaje_circular', 'empresa'],
                'activo' => true,
            ],
            [
                'nombre' => 'Notificación de Marcaje y Asistencia',
                'categoria' => 'asistencia',
                'contenido' => "{🟢 ¡HOLA {{nombre}}!|Dios le bendiga {{nombre}},|Saludos cordiales {{nombre}},}\n\nSe ha registrado tu *{{tipo_marcaje}}* a las *{{hora}} hrs* el día {{fecha}} (Vía {{origen}}).\n\n{{detalles_turno}}",
                'variables' => ['nombre', 'tipo_marcaje', 'hora', 'fecha', 'origen', 'detalles_turno', 'empresa'],
                'activo' => true,
            ],
            [
                'nombre' => 'Circular Ministerial a Presbíteros',
                'categoria' => 'pastoral',
                'contenido' => "{🏛️ *CIRCULAR OFICIAL A PRESBÍTEROS*|📢 *COMUNICADO MINISTERIAL*|📜 *CIRCULAR NACIONAL*}\n\n{Dios le bendiga, Estimado Presbítero|Saludos fraternales en Cristo, Estimado Siervo de Dios} *{{nombre}}*,\n\n{Por medio de la presente, la Directiva Nacional le comunica la siguiente disposición oficial para la Zona {{zonas}} y Distritos {{distritos}}:|Le hacemos llegar la siguiente circular ministerial correspondiente a su jurisdicción pastoral:}\n\n{{mensaje_circular}}\n\n_{Agradecemos la oportuna socialización con los obreros a su cargo. Dios continúe respaldando su labor ministerial.|Contamos con su fiel respaldo y apoyo en la obra del Señor.}_",
                'variables' => ['nombre', 'zonas', 'distritos', 'mensaje_circular', 'empresa'],
                'activo' => true,
            ],
            [
                'nombre' => 'Convocatoria a Junta y Presbiterio',
                'categoria' => 'convocatorias',
                'contenido' => "{🤝 *CONVOCATORIA A REUNIÓN DE PRESBÍTEROS*|🗓️ *CITACIÓN OFICIAL DE PRESBITERIO*}\n\nEstimado Presbítero *{{nombre}}*,\n\n{Se le convoca formalmente a la reunión ministerial de presbíteros|Por instrucciones de la Directiva Nacional, se le cita a la asamblea de presbiterio} que se llevará a cabo:\n\n📅 *Fecha:* {{fecha}}\n⏰ *Hora:* {{hora}}\n📍 *Lugar:* {{lugar}}\n📝 *Agenda:* {{motivo}}\n\n_Contamos con su puntual y bendecida asistencia en el Señor._",
                'variables' => ['nombre', 'fecha', 'hora', 'lugar', 'motivo', 'empresa'],
                'activo' => true,
            ]
        ];

        foreach ($empresas as $empresa) {
            foreach ($templates as $t) {
                WhatsAppTemplate::updateOrCreate(
                    [
                        'empresa_id' => $empresa->id,
                        'nombre' => $t['nombre'],
                    ],
                    [
                        'categoria' => $t['categoria'],
                        'contenido' => $t['contenido'],
                        'variables' => $t['variables'],
                        'activo' => $t['activo'],
                    ]
                );
            }
        }
    }
}
