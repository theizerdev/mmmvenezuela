<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenida al Sistema | Credenciales de acceso</title>
    
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
                    
                    <!-- Banner Institucional de Cabecera (Imagen Oficial) -->
                    <tr>
                        <td style="padding: 0; margin: 0; background-color: #1a3786; line-height: 0; font-size: 0;">
                            <!--[if mso]>
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640">
                            <tr>
                            <td width="640" style="line-height:0; font-size:0;">
                            <![endif]-->
                            <a href="https://mmmvenezuela.org" target="_blank" style="display: block; text-decoration: none; border: 0; outline: none; margin: 0; padding: 0;">
                                <img src="{{ 'https://mmmvenezuela.org/images/mails/banner-correo-mmmvenezuela.png' }}" 
                                     alt="Movimiento Misionero Mundial Venezuela" 
                                     width="640" 
                                     style="display: block; width: 100%; max-width: 640px; height: auto; border: 0; outline: none; margin: 0; padding: 0; -ms-interpolation-mode: bicubic;" />
                            </a>
                            <!--[if mso]>
                            </td>
                            </tr>
                            </table>
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
                                                <a href="{{ 'https://saprcoe.mmmvenezuela.org' }}" target="_blank" style="display: inline-block; background-color: #eca100; color: #1a3786; text-decoration: none; font-size: 13px; font-weight: 900; padding: 12px 30px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.8px;">
                                                    Ingresar al Sistema →
                                                </a>
                                            </div>
                                            
                                            <div style="text-align: center; margin-top: 14px; font-size: 11px; color: #93c5fd;">
                                                Enlace directo: <a href="{{ 'https://saprcoe.mmmvenezuela.org' }}" target="_blank" style="color: #ffffff; text-decoration: underline;">{{ 'https://saprcoe.mmmvenezuela.org' }}</a>
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
                                <img src="{{ 'https://mmmvenezuela.org/images/mails/footer_correo.png' }}" alt="Oficina Nacional - Movimiento Misionero Mundial Venezuela" width="640" class="footer-banner-img" style="display: block; width: 100%; max-width: 640px; height: auto; border: 0; outline: none; margin: 0; padding: 0; -ms-interpolation-mode: bicubic;" />
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
