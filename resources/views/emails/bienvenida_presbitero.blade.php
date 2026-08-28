<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenida al Sistema Automatizado de Registro Pastoral | Credenciales de acceso</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        body { margin: 0; padding: 0; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 10px;">
        <tr>
            <td align="center">
                <!-- Preheader Oculto -->
                <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
                    Sus credenciales de acceso institucional como Presbítero del Movimiento Misionero Mundial Venezuela.
                </div>

                <!-- Contenedor Principal -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                    
                    <!-- Header Institucional -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 32px 24px; text-align: center;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 12px;">
                                        <img src="{{ $logoUrl ?? url('/icons/logo_mmm-a-color-sin-fondo.png') }}" alt="Logo MMM Venezuela" width="68" height="68" style="display: block; margin: 0 auto; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <div style="font-size: 13px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase; line-height: 1.3;">
                                            Iglesia Cristiana Pentecostés de Venezuela
                                        </div>
                                        <div style="font-size: 11px; font-weight: 700; color: #93c5fd; letter-spacing: 1.2px; text-transform: uppercase; margin-top: 4px;">
                                            Movimiento Misionero Mundial
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Título y Saludo -->
                    <tr>
                        <td style="padding: 32px 32px 16px 32px;">
                            <div style="display: inline-block; background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px;">
                                🛡️ Cuenta Institucional de Presbiterio
                            </div>
                            <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                                Estimado Presbítero {{ $nombre }}:
                            </h2>
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #334155;">
                                El <strong>Movimiento Misionero Mundial Venezuela</strong> le informa que se ha creado exitosamente su cuenta de acceso institucional al <strong>Sistema Automatizado de Registro Pastoral</strong> con el rol oficial de <strong>Presbítero</strong>.
                            </p>
                        </td>
                    </tr>

                    <!-- Jurisdicción Asignada -->
                    <tr>
                        <td style="padding: 0 32px 16px 32px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px;">
                                <tr>
                                    <td>
                                        <div style="font-size: 12px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                                            📍 Jurisdicción Ministerial Asignada
                                        </div>
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
                                            <tr>
                                                <td style="padding: 4px 0; color: #64748b; width: 35%;"><strong>Zona(s):</strong></td>
                                                <td style="padding: 4px 0; color: #0f172a; font-weight: 700;">{{ $zonas ?: 'Sin asignar' }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 4px 0; color: #64748b; width: 35%;"><strong>Distrito(s):</strong></td>
                                                <td style="padding: 4px 0; color: #0f172a; font-weight: 700;">{{ $distritos ?: 'Sin asignar' }}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Credenciales de Acceso -->
                    <tr>
                        <td style="padding: 0 32px 20px 32px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a; border-radius: 12px; padding: 22px 24px; color: #ffffff;">
                                <tr>
                                    <td>
                                        <div style="font-size: 12px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                                            🔐 Credenciales de Acceso Oficial
                                        </div>
                                        
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px;">
                                            <tr>
                                                <td style="padding: 6px 0; color: #94a3b8; width: 40%;"><strong>Usuario / Correo:</strong></td>
                                                <td style="padding: 6px 0; color: #ffffff; font-weight: 700; font-family: monospace; font-size: 14px;">{{ $email }}</td>
                                            </tr>
                                            @if(!empty($password))
                                            <tr>
                                                <td style="padding: 6px 0; color: #94a3b8; width: 40%;"><strong>Contraseña temporal:</strong></td>
                                                <td style="padding: 6px 0; color: #fde047; font-weight: 800; font-family: monospace; font-size: 15px; letter-spacing: 0.5px;">{{ $password }}</td>
                                            </tr>
                                            @endif
                                        </table>

                                        <div style="margin-top: 20px; text-align: center;">
                                            <a href="{{ $loginUrl }}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(37,99,235,0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                                                Ingresar al Sistema →
                                            </a>
                                        </div>
                                        
                                        <div style="margin-top: 14px; text-align: center; font-size: 11px; color: #64748b;">
                                            Enlace directo: <a href="{{ $loginUrl }}" target="_blank" style="color: #38bdf8; text-decoration: underline;">{{ $loginUrl }}</a>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Funciones del Panel -->
                    <tr>
                        <td style="padding: 0 32px 16px 32px;">
                            <p style="margin: 0 0 10px 0; font-size: 13px; line-height: 1.6; color: #334155;">
                                Desde su panel administrativo usted podrá:
                            </p>
                            <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6; color: #475569;">
                                <li style="margin-bottom: 4px;">Dar seguimiento a las <strong>fichas ministeriales</strong> de los pastores y obreros a su cargo.</li>
                                <li style="margin-bottom: 4px;">Consultar las <strong>iglesias y extensiones</strong> bajo su cobertura territorial.</li>
                                <li style="margin-bottom: 4px;">Recibir <strong>balances estadísticos y notificaciones automáticas</strong> ante nuevos registros.</li>
                            </ul>
                        </td>
                    </tr>

                    <!-- Nota de Seguridad Importante -->
                    <tr>
                        <td style="padding: 0 32px 24px 32px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 14px 16px;">
                                <tr>
                                    <td>
                                        <div style="font-size: 12px; font-weight: 800; color: #b45309; text-transform: uppercase; margin-bottom: 4px;">
                                            ⚠️ Nota Importante de Seguridad
                                        </div>
                                        <div style="font-size: 12px; line-height: 1.5; color: #78350f;">
                                            Esta cuenta es de <strong>uso personal e intransferible</strong>. Por políticas de seguridad, al ingresar por primera vez, el sistema le solicitará cambiar su contraseña obligatoriamente.
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Soporte y Contacto -->
                    <tr>
                        <td style="padding: 0 32px 24px 32px; font-size: 12px; line-height: 1.5; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                            Para mayor información o asistencia técnica con la plataforma, puede comunicarse con la Oficina Nacional:
                            <br>
                            @if(!empty($telefonoContacto))
                                📞 <strong>Teléfono / WhatsApp:</strong> {{ $telefonoContacto }}<br>
                            @endif
                            @if(!empty($emailContacto))
                                ✉️ <strong>Correo Electrónico:</strong> <a href="mailto:{{ $emailContacto }}" style="color: #2563eb; text-decoration: none;">{{ $emailContacto }}</a>
                            @endif
                        </td>
                    </tr>

                    <!-- Firma Institucional -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                                Movimiento Misionero Mundial Venezuela
                            </div>
                            <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-top: 2px;">
                                Oficina Nacional de Secretaría y Administración
                            </div>
                            <div style="font-size: 10px; color: #94a3b8; margin-top: 8px;">
                                © {{ date('Y') }} MMM Venezuela. Todos los derechos reservados.
                            </div>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
