const nodemailer = require('nodemailer');

// Transporter reutilizable — se crea una sola vez al cargar el módulo.
// Usa STARTTLS (port 587, secure: false) que es el estándar de Gmail.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: false, // true para 465, false para otros puertos (usa STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Genera el HTML base del correo electrónico con branding consistente.
 * @param {string} titulo
 * @param {string} codigo
 * @param {string} descripcion
 * @param {string} vigencia
 * @returns {string}
 */
const generarPlantillaHTML = (titulo, codigo, descripcion, vigencia) => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f9; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden;">
          
          <!-- Header con gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, #0b1528 0%, #0052cc 100%); padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">
                Legado Eterno
              </h1>
              <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 8px 0 0 0;">
                SecureLegacy — Tu legado digital protegido
              </p>
            </td>
          </tr>

          <!-- Contenido principal -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #101828; font-size: 22px; margin: 0 0 12px 0; font-weight: 600;">
                ${titulo}
              </h2>
              <p style="color: #475467; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">
                ${descripcion}
              </p>

              <!-- Código OTP -->
              <div style="background-color: #f8f9fb; border: 2px dashed #d0d5dd; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;">
                <p style="color: #475467; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  Tu código de verificación
                </p>
                <p style="color: #0052cc; font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0;">
                  ${codigo}
                </p>
              </div>

              <p style="color: #667085; font-size: 13px; line-height: 1.5; margin: 0 0 8px 0;">
                ⏱ Este código es válido por <strong>${vigencia}</strong>.
              </p>
              <p style="color: #667085; font-size: 13px; line-height: 1.5; margin: 0;">
                Si no solicitaste este código, ignora este correo. Tu cuenta permanece segura.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fb; padding: 20px 40px; text-align: center; border-top: 1px solid #e4e7ec;">
              <p style="color: #98a2b3; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} SecureLegacy — Legado Eterno. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Configuración de plantillas según tipo de código
const plantillas = {
  REGISTRO: (codigo) => ({
    asunto: '🔐 Verificación de Cuenta — SecureLegacy',
    html: generarPlantillaHTML(
      'Verificación de Cuenta',
      codigo,
      'Gracias por registrarte en SecureLegacy. Para activar tu cuenta, ingresa el siguiente código de verificación en la plataforma.',
      '24 horas'
    ),
  }),

  LOGIN_OTP: (codigo) => ({
    asunto: '🔑 Código de Acceso — SecureLegacy',
    html: generarPlantillaHTML(
      'Verificación de Inicio de Sesión',
      codigo,
      'Se ha detectado un intento de inicio de sesión en tu cuenta. Ingresa el siguiente código para confirmar que eres tú.',
      '5 minutos'
    ),
  }),

  RECUPERACION: (codigo) => ({
    asunto: '🔄 Recuperación de Contraseña — SecureLegacy',
    html: generarPlantillaHTML(
      'Recuperación de Contraseña',
      codigo,
      'Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Usa el siguiente código para continuar con el proceso.',
      '5 minutos'
    ),
  }),
};

/**
 * Envía un correo con el código de verificación al destinatario.
 * @param {string} destinatario
 * @param {string} codigo
 * @param {string} tipo
 */
const enviarCodigoVerificacion = async (destinatario, codigo, tipo) => {
  const plantilla = plantillas[tipo];
  if (!plantilla) {
    throw new Error(`Tipo de código de verificación no reconocido: ${tipo}`);
  }

  const { asunto, html } = plantilla(codigo);

  await transporter.sendMail({
    from: `"SecureLegacy" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: asunto,
    html,
  });

  console.log(`📧 Código ${tipo} enviado a ${destinatario}`);
};

module.exports = { enviarCodigoVerificacion };
