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
                'nombre' => 'Felicitación y Bendición Ministerial',
                'categoria' => 'pastoral',
                'contenido' => "{🎉 ¡FELIZ CUMPLEAÑOS! 🎂|¡Muchas bendiciones en su cumpleaños! 🎂|¡Paz y gozo en su día especial! 🎉}\n\n{Estimado(a) Pastor(a)|Apreciado(a) Siervo(a) de Dios} *{{nombre}}*,\n\nDe parte de la directiva nacional y de toda la familia de {{empresa}}, {le enviamos un caluroso saludo y nuestras más sinceras felicitaciones|le felicitamos con gran gozo fraternal} en este día tan especial.\n\n{Que el Señor continúe bendiciendo grandemente su vida, su hogar y su valioso ministerio en la Zona {{zona}}.|Que la gracia y favor de Dios sigan respaldando su labor ministerial.}\n\n📖 *«El Señor te bendiga y te guarde; el Señor haga resplandecer su rostro sobre ti...» (Números 6:24-25)*",
                'variables' => ['nombre', 'zona', 'empresa'],
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
                'contenido' => "{¡Bendiciones|Paz de Dios|Un cordial saludo} Pastor {{nombre}}, {le damos la más cordial bienvenida a|le confirmamos su registro en} la plataforma oficial de {{empresa}}. {Que el Señor continúe respaldando su labor ministerial.|Agradecemos su valioso servicio en la obra de Dios.}",
                'variables' => ['nombre', 'empresa'],
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
                'contenido' => "{Paz de Dios|Estimado Pastor} {{nombre}}, {le recordamos amablemente que|esperamos que se encuentre bien, le notificamos que} está habilitada la entrega del informe mensual de {{iglesia}}. Agradecemos enviarlo antes del {{fecha_limite}}. Código de seguimiento: {{random}}.",
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
                'contenido' => "{🟢 ¡HOLA {{nombre}}!|Paz de Dios {{nombre}},|Saludos cordiales {{nombre}},}\n\nSe ha registrado tu *{{tipo_marcaje}}* a las *{{hora}} hrs* el día {{fecha}} (Vía {{origen}}).\n\n{{detalles_turno}}",
                'variables' => ['nombre', 'tipo_marcaje', 'hora', 'fecha', 'origen', 'detalles_turno', 'empresa'],
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
