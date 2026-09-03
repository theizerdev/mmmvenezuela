<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenida al Sistema | Credenciales de acceso</title>
    <style>
        @font-face {
            font-family: 'Cocogoose';
            src: url('{{ $cocogooseB64 }}') format('opentype'),
                 url('https://mmmvenezuela.org/templates/mmmvenezuela/fonts/COCOGOOSE.otf') format('opentype');
            font-weight: 700;
            font-style: normal;
        }
        @font-face {
            font-family: 'AribauGrotesk';
            src: url('{{ $aribauB64 }}') format('opentype'),
                 url('https://mmmvenezuela.org/templates/mmmvenezuela/fonts/AribauGroteskTRIAL-Md.otf') format('opentype');
            font-weight: 500;
            font-style: normal;
        }
        body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        body { margin: 0; padding: 0; width: 100% !important; background-color: #f1ede5; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; }
        @media only screen and (max-width: 480px) {
            /* Contenedor general */
            .container-padding { padding-left: 16px !important; padding-right: 16px !important; }
            /* Banner: logo — se achica pero se mantiene al lado del texto */
            .banner-logo-td { padding: 10px 8px 10px 10px !important; width: 50px !important; }
            .banner-logo-img { width: 46px !important; }
            /* Banner: texto — se reduce para caber en una línea sin wrap */
            .banner-text-td { padding: 10px 10px 10px 4px !important; }
            .banner-text-sub  { font-size: 6.8px !important; letter-spacing: 2.2px !important; white-space: nowrap !important; }
            .banner-text-main { font-size: 14.5px !important; white-space: nowrap !important; letter-spacing: 0 !important; line-height: 1.1 !important; }
            /* Footer */
            .footer-banner-img { width: 100% !important; height: auto !important; display: block !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1ede5; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1ede5; padding: 36px 12px;">
        <tr>
            <td align="center">
                <!-- Preheader Oculto -->
                <div style="display: none; font-size: 1px; color: #f1ede5; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
                    Credenciales de acceso institucional al Sistema Automatizado de Registro Pastoral del Movimiento Misionero Mundial Venezuela.
                </div>

                <!-- Contenedor Estándar 640px Normativa MMM -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 640px; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(26, 55, 134, 0.08); border: 1px solid #e5dfd5;">
                    
                    <!-- Banner Institucional — Fondo Azul Marino Profundo (igual a imagen de referencia) -->
                    <tr>
                        <td style="padding: 0; background-color: #1a3786; border-top: 3px solid #1230a0; border-bottom: 2px solid #0f2460;">
                            <!--[if mso]>
                            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:640px;">
                            <v:fill type="solid" color="#1a3786"/>
                            <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                            <![endif]-->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <!-- Logo MMM -->
                                    <td class="banner-logo-td" width="95" style="padding: 16px 10px 16px 20px; vertical-align: middle; text-align: left;">
                                        <img class="banner-logo-img" src="{{ $logoUrl }}" alt="Logo MMM Venezuela" width="76" style="display: block; width: 76px; height: auto; border: 0; outline: none;">
                                    </td>
                                    <!-- Bloque de texto institucional en blanco -->
                                    <td class="banner-text-td" style="padding: 16px 20px 16px 2px; vertical-align: middle; text-align: left;">
                                        <!-- Línea superior — Denominación (AribauGrotesk) -->
                                        <div class="banner-text-sub" style="font-family: 'AribauGrotesk', 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 10px; font-weight: 500; color: #ffffff; letter-spacing: 3.55px; text-transform: uppercase; line-height: 1.35; margin: 0 0 3px 0; padding: 0; display: block;">IGLESIA CRISTIANA PENTECOSTÉS DE VENEZUELA</div>
                                        <!-- Línea inferior — Organización (Cocogoose) -->
                                        <div class="banner-text-main" style="font-family: 'Cocogoose', 'Arial Black', Arial, sans-serif; font-size: 21px; font-weight: 700; color: #ffffff; letter-spacing: 0.1px; text-transform: uppercase; line-height: 1.05; white-space: nowrap; margin: 0; padding: 0; display: block;">MOVIMIENTO MISIONERO MUNDIAL</div>
                                    </td>
                                </tr>
                            </table>
                            <!--[if mso]>
                            </v:textbox>
                            </v:rect>
                            <![endif]-->
                        </td>
                    </tr>

                    <!-- Cuerpo del Mensaje -->
                    <tr>
                        <td class="container-padding" style="padding: 30px 36px 20px 36px;">
                            
                            <!-- Saludo Oficial -->
                            <p style="font-size: 16px; line-height: 1.5; color: #1a3786; margin: 0 0 14px 0;">
                                <strong>Estimado(a) {{ $nombre }}:</strong>
                            </p>

                            <p style="font-size: 14px; line-height: 1.7; color: #334155; margin: 0 0 22px 0; text-align: justify;">
                                El <strong>Movimiento Misionero Mundial Venezuela</strong> le informa que se ha creado exitosamente su cuenta de acceso institucional a <strong>SAPRCOE</strong> (Sistema Automatizado de Registro y Control de Obreros y Extensiones).
                            </p>

                            <!-- Sección 1: Rol y Asignación Institucional -->
                            <div style="margin-bottom: 22px;">
                                <div style="font-size: 12px; font-weight: 900; color: #1a3786; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
                                    📋 Rol y Asignación Institucional
                                </div>
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; font-size: 13px; line-height: 1.6;">
                                    <tr style="background-color: #f8fafc;">
                                        <td style="padding: 9px 14px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569; width: 35%;">Rol(es) Asignado(s):</td>
                                        <td style="padding: 9px 14px; border: 1px solid #e2e8f0; font-weight: 800; color: #1a3786;">{{ $rol ?: 'Usuario del Sistema' }}</td>
                                    </tr>
                                    @if(!empty($zonas) || !empty($distritos))
                                    @if(!empty($zonas))
                                    <tr>
                                        <td style="padding: 9px 14px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Zona(s):</td>
                                        <td style="padding: 9px 14px; border: 1px solid #e2e8f0; font-weight: 800; color: #1a3786;">{{ $zonas }}</td>
                                    </tr>
                                    @endif
                                    @if(!empty($distritos))
                                    <tr style="background-color: #f8fafc;">
                                        <td style="padding: 9px 14px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569;">Distrito(s):</td>
                                        <td style="padding: 9px 14px; border: 1px solid #e2e8f0; font-weight: 800; color: #1a3786;">{{ $distritos }}</td>
                                    </tr>
                                    @endif
                                    @endif
                                </table>
                            </div>

                            <!-- Sección 2: Credenciales de Acceso -->
                            <div style="margin-bottom: 24px;">
                                <div style="font-size: 12px; font-weight: 900; color: #1a3786; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
                                    🔐 Credenciales de Acceso
                                </div>
                                
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1a3786; border-radius: 8px; color: #ffffff; padding: 22px 24px; box-shadow: 0 4px 12px rgba(26, 55, 134, 0.15);">
                                    <tr>
                                        <td>
                                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
                                                <tr>
                                                    <td style="padding: 5px 0; color: #cbd5e1; width: 38%;"><strong>Usuario / Correo:</strong></td>
                                                    <td style="padding: 5px 0; color: #ffffff; font-weight: 700; font-family: monospace; font-size: 14px;">{{ $email }}</td>
                                                </tr>
                                                @if(!empty($password))
                                                <tr>
                                                    <td style="padding: 6px 0; color: #cbd5e1; width: 38%;"><strong>Contraseña temporal:</strong></td>
                                                    <td style="padding: 6px 0; color: #eca100; font-weight: 900; font-family: monospace; font-size: 15px; letter-spacing: 0.5px;">{{ $password }}</td>
                                                </tr>
                                                @endif
                                            </table>

                                            <div style="text-align: center; margin-top: 20px;">
                                                <a href="{{ $loginUrl }}" target="_blank" style="display: inline-block; background-color: #eca100; color: #1a3786; text-decoration: none; font-size: 13px; font-weight: 900; padding: 12px 30px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.8px;">
                                                    Ingresar al Sistema →
                                                </a>
                                            </div>
                                            
                                            <div style="text-align: center; margin-top: 14px; font-size: 11px; color: #93c5fd;">
                                                Enlace directo: <a href="{{ $loginUrl }}" target="_blank" style="color: #ffffff; text-decoration: underline;">{{ $loginUrl }}</a>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Sección 3: Funciones del Panel -->
                            <div style="margin-bottom: 22px;">
                                <p style="margin: 0 0 10px 0; font-size: 13px; line-height: 1.6; color: #334155;">
                                    Desde su panel administrativo usted podrá:
                                </p>
                                <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.65; color: #475569;">
                                    <li style="margin-bottom: 4px;">Acceder a los <strong>módulos y registros</strong> correspondientes a su perfil.</li>
                                    <li style="margin-bottom: 4px;">Consultar información oficial del <strong>Movimiento Misionero Mundial Venezuela</strong>.</li>
                                    <li style="margin-bottom: 4px;">Recibir <strong>notificaciones automáticas</strong> y balances del sistema.</li>
                                </ul>
                            </div>

                            <!-- Sección 4: Nota de Seguridad -->
                            <div style="margin-bottom: 8px; background-color: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #eca100; border-radius: 6px; padding: 14px 18px;">
                                <div style="font-size: 12px; font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                                    📌 Recomendación de Seguridad
                                </div>
                                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #78350f;">
                                    Esta cuenta es de <strong>uso personal e intransferible</strong>. Por motivos de seguridad, le sugerimos cambiar su contraseña tras realizar su primer inicio de sesión.
                                </p>
                            </div>

                        </td>
                    </tr>

                    <!-- Footer Oficial Gráfico Institucional -->
                    <tr>
                        <td style="padding: 0; margin: 0; background-color: #0a2160; border-top: 3px solid #eca100; line-height: 0; font-size: 0;">
                            <!--[if mso]>
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640">
                            <tr>
                            <td width="640" style="line-height:0; font-size:0;">
                            <![endif]-->
                            <a href="https://mmmvenezuela.org" target="_blank" style="display: block; text-decoration: none; border: 0; outline: none; margin: 0; padding: 0;">
                                <img src="{{ $footerImageUrl }}" alt="Oficina Nacional - Movimiento Misionero Mundial Venezuela" width="640" class="footer-banner-img" style="display: block; width: 100%; max-width: 640px; height: auto; border: 0; outline: none; margin: 0; padding: 0; -ms-interpolation-mode: bicubic;" />
                            </a>
                            <!--[if mso]>
                            </td>
                            </tr>
                            </table>
                            <![endif]-->
                        </td>
                    </tr>

                    <!-- Barra Final de Derechos -->
                    <tr>
                        <td style="background-color: #0a1945; padding: 12px 32px; text-align: center; color: #93c5fd; font-size: 10px; letter-spacing: 0.5px;">
                            © {{ date('Y') }} Movimiento Misionero Mundial Venezuela. Todos los derechos reservados.
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
