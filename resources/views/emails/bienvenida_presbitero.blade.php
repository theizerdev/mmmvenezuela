<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenida al Sistema Automatizado de Registro Pastoral | Credenciales de acceso</title>
    <style>
        body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        body { margin: 0; padding: 0; width: 100% !important; background-color: #ffffff; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; }
        @media only screen and (max-width: 768px) {
            .col-stack { display: block !important; width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; margin-bottom: 16px !important; }
            .container-padding { padding-left: 20px !important; padding-right: 20px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; width: 100% !important; background-color: #ffffff; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    
    <!-- Preheader Oculto -->
    <div style="display: none; font-size: 1px; color: #ffffff; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        Comunicado Institucional: Asignación de Jurisdicción y Credenciales de Acceso para el Presbítero {{ $nombre }}.
    </div>

    <!-- Contenedor 100% Ancho Completo -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100% !important; min-width: 100%; background-color: #ffffff; margin: 0; padding: 0; border-collapse: collapse;">
        
        <!-- Barra Superior de Acento Institucional -->
        <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #0f172a 0%, #1e3a8a 35%, #2563eb 70%, #0284c7 100%);"></td>
        </tr>

        <!-- Membrete Oficial 100% Ancho -->
        <tr>
            <td class="container-padding" style="padding: 36px 60px 24px 60px; background-color: #ffffff; border-bottom: 2px solid #0f172a;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td width="95" style="vertical-align: middle; text-align: left; padding-right: 20px;">
                            <img src="{{ $logoUrl }}" alt="Logo MMM Venezuela" width="90" style="display: block; width: 90px; height: auto; border: 0; outline: none; text-decoration: none;">
                        </td>
                        <td style="vertical-align: middle; text-align: left;">
                            <div style="font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: 0.6px; text-transform: uppercase; line-height: 1.3;">
                                Iglesia Cristiana Pentecostés de Venezuela
                            </div>
                            <div style="font-size: 15px; font-weight: 800; color: #1d4ed8; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;">
                                Movimiento Misionero Mundial
                            </div>
                            <div style="font-size: 12px; font-weight: 600; color: #64748b; letter-spacing: 0.6px; text-transform: uppercase; margin-top: 4px;">
                                Oficina Nacional de Secretaría y Supervisión Pastoral
                            </div>
                        </td>
                        <td class="col-stack" style="vertical-align: middle; text-align: right;">
                            <div style="display: inline-block; background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 12px; font-weight: 800; padding: 8px 18px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.6px;">
                                🛡️ Presbiterio Oficial
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Ficha de Oficio y Comunicación -->
        <tr>
            <td class="container-padding" style="padding: 30px 60px 10px 60px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 22px 28px; font-size: 14px; line-height: 1.7;">
                    <tr>
                        <td class="col-stack" width="50%" style="vertical-align: top; padding-right: 20px;">
                            <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">FECHA DE EMISIÓN:</div>
                            <div style="color: #0f172a; font-weight: 700; font-size: 15px; margin-top: 3px;">{{ $fechaFormal ?? date('d/m/Y') }}</div>
                            
                            <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 14px;">DESTINATARIO:</div>
                            <div style="color: #0f172a; font-weight: 800; font-size: 15px; text-transform: uppercase; margin-top: 3px;">Presbítero {{ $nombre }}</div>
                        </td>
                        <td class="col-stack" width="50%" style="vertical-align: top; padding-left: 20px; border-left: 1px solid #e2e8f0;">
                            <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">EMITIDO POR:</div>
                            <div style="color: #0f172a; font-weight: 700; font-size: 14px; margin-top: 3px;">Junta Nacional de Presbiterio • Secretaría General</div>
                            
                            <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 14px;">ASUNTO:</div>
                            <div style="color: #1d4ed8; font-weight: 800; font-size: 14px; margin-top: 3px;">Acreditación y Credenciales de Acceso Institucional</div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Mensaje Principal y Contenido -->
        <tr>
            <td class="container-padding" style="padding: 20px 60px 30px 60px;">
                
                <p style="font-size: 16px; line-height: 1.6; color: #0f172a; margin: 0 0 16px 0;">
                    <strong>Estimado Presbítero {{ $nombre }}:</strong>
                </p>

                <p style="font-size: 15px; line-height: 1.8; color: #334155; margin: 0 0 28px 0; text-align: justify;">
                    El <strong>Movimiento Misionero Mundial Venezuela</strong> le informa que se ha creado exitosamente su cuenta de acceso institucional al <strong>Sistema Automatizado de Registro Pastoral</strong>.
                </p>

                <!-- Bloque 1: Jurisdicción y Credenciales (2 Columnas Amplias) -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                    <tr>
                        <!-- Columna 1: Jurisdicción -->
                        <td class="col-stack" width="48%" style="vertical-align: top; padding-right: 15px;">
                            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 22px 24px; min-height: 185px; box-sizing: border-box;">
                                <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px;">
                                    📍 Jurisdicción Asignada
                                </div>
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; line-height: 1.7;">
                                    <tr>
                                        <td style="color: #64748b; padding: 5px 0; width: 45%;"><strong>Zona(s):</strong></td>
                                        <td style="color: #0f172a; font-weight: 800; padding: 5px 0;">{{ $zonas ?: 'Sin asignar' }}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #64748b; padding: 5px 0; width: 45%;"><strong>Distrito(s):</strong></td>
                                        <td style="color: #0f172a; font-weight: 800; padding: 5px 0;">{{ $distritos ?: 'Sin asignar' }}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #64748b; padding: 5px 0; width: 45%;"><strong>Cargo:</strong></td>
                                        <td style="color: #1d4ed8; font-weight: 800; padding: 5px 0;">Presbítero Supervisor</td>
                                    </tr>
                                </table>
                            </div>
                        </td>

                        <!-- Columna 2: Credenciales -->
                        <td class="col-stack" width="52%" style="vertical-align: top; padding-left: 15px;">
                            <div style="background-color: #0f172a; border-radius: 8px; padding: 22px 26px; color: #ffffff; min-height: 185px; box-sizing: border-box;">
                                <div style="font-size: 13px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.6px; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 14px;">
                                    🔐 Credenciales Oficiales de Acceso
                                </div>
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; line-height: 1.7;">
                                    <tr>
                                        <td style="color: #94a3b8; padding: 4px 0; width: 38%;">Usuario / Correo:</td>
                                        <td style="color: #ffffff; font-weight: 700; font-family: monospace; font-size: 14px; padding: 4px 0;">{{ $email }}</td>
                                    </tr>
                                    @if(!empty($password))
                                    <tr>
                                        <td style="color: #94a3b8; padding: 4px 0; width: 38%;">Clave Temporal:</td>
                                        <td style="color: #fde047; font-weight: 800; font-family: monospace; font-size: 15px; padding: 4px 0; letter-spacing: 0.5px;">{{ $password }}</td>
                                    </tr>
                                    @endif
                                </table>

                                <div style="text-align: center; margin-top: 18px;">
                                    <a href="{{ $loginUrl }}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 800; padding: 11px 28px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.6px;">
                                        Acceder al Sistema Ministerial →
                                    </a>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>

                <!-- Bloque 2: Módulos y Facultades (3 Columnas que abarcan todo el ancho) -->
                <div style="margin-bottom: 28px;">
                    <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                        Módulos y Facultades Habilitadas en su Panel
                    </div>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td class="col-stack" width="32%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; vertical-align: top;">
                                <div style="font-weight: 800; font-size: 13px; color: #1d4ed8; margin-bottom: 6px;">📄 Fichas Ministeriales</div>
                                <div style="font-size: 13px; line-height: 1.6; color: #475569;">Consulta, verificación y seguimiento de pastores, obreros y laicos adscritos a su zona.</div>
                            </td>
                            <td width="2%"></td>
                            <td class="col-stack" width="32%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; vertical-align: top;">
                                <div style="font-weight: 800; font-size: 13px; color: #1d4ed8; margin-bottom: 6px;">🏛️ Cobertura Territorial</div>
                                <div style="font-size: 13px; line-height: 1.6; color: #475569;">Supervisión y geolocalización de iglesias centrales, anexos y campos blancos asignados.</div>
                            </td>
                            <td width="2%"></td>
                            <td class="col-stack" width="32%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; vertical-align: top;">
                                <div style="font-weight: 800; font-size: 13px; color: #1d4ed8; margin-bottom: 6px;">📊 Balances y Alertas</div>
                                <div style="font-size: 13px; line-height: 1.6; color: #475569;">Acceso a reportes estadísticos actualizados y notificaciones inmediatas ante nuevos registros.</div>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Bloque 3: Protocolo de Seguridad -->
                <div style="margin-bottom: 28px; background-color: #fffbeb; border: 1px solid #fde68a; border-left: 5px solid #d97706; border-radius: 6px; padding: 18px 22px;">
                    <div style="font-size: 13px; font-weight: 800; color: #92400e; text-transform: uppercase; margin-bottom: 6px;">
                        ⚠️ Protocolo Institucional de Seguridad y Confidencialidad
                    </div>
                    <p style="margin: 0; font-size: 13px; line-height: 1.65; color: #78350f;">
                        Esta cuenta institucional es de <strong>uso estrictamente personal, confidencial e intransferible</strong>. En cumplimiento de las normativas institucionales de seguridad, al iniciar su primera sesión en la plataforma el sistema le solicitará establecer una <strong>nueva contraseña personalizada</strong> de su conocimiento exclusivo.
                    </p>
                </div>

                <!-- Bloque 4: Soporte y Canales Oficiales -->
                <div style="font-size: 13px; line-height: 1.7; color: #64748b; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                    <strong>Oficina Nacional de Atención y Soporte:</strong>
                    @if(!empty($telefonoContacto))
                        &nbsp;📞 {{ $telefonoContacto }} &nbsp;|&nbsp;
                    @endif
                    @if(!empty($emailContacto))
                        &nbsp;✉️ <a href="mailto:{{ $emailContacto }}" style="color: #2563eb; text-decoration: none; font-weight: 600;">{{ $emailContacto }}</a>
                    @endif
                    &nbsp;|&nbsp; Enlace al portal: <a href="{{ $loginUrl }}" target="_blank" style="color: #2563eb; text-decoration: underline;">{{ $loginUrl }}</a>
                </div>

            </td>
        </tr>

        <!-- Pie de Página Institucional 100% Ancho -->
        <tr>
            <td class="container-padding" style="background-color: #f8fafc; padding: 32px 60px; border-top: 2px solid #e2e8f0; text-align: center;">
                <div style="font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 6px;">
                    Fraternalmente en Cristo,
                </div>
                <div style="font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.8px;">
                    Oficina Nacional de Secretaría
                </div>
                <div style="font-size: 12px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; margin-top: 2px;">
                    Movimiento Misionero Mundial Venezuela
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 14px;">
                    Este es un mensaje oficial emitido automáticamente por el Sistema Automatizado de Registro Pastoral.<br>
                    © {{ date('Y') }} Todos los derechos reservados.
                </div>
            </td>
        </tr>

    </table>
</body>
</html>
