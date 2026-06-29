const { AppError } = require('./errores.middleware');
const { validarFortalezaContrasena } = require('../utils/helpers');

//Regex para validar formato de correo electrónico
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validarRegistro = (req, res, next) => {
  const { nombreCompleto, correo, contrasena, fechaNacimiento } = req.body;

  // Verificar que todos los campos obligatorios estén presentes
  if (!nombreCompleto || !correo || !contrasena || !fechaNacimiento) {
    return next(new AppError('Todos los campos obligatorios deben estar completos.', 400));
  }

  // Verificar formato de correo
  if (!EMAIL_REGEX.test(correo)) {
    return next(new AppError('El formato del correo electrónico no es válido.', 400));
  }

  // Verificar fortaleza de contraseña
  const { valida, errores } = validarFortalezaContrasena(contrasena);
  if (!valida) {
    return next(
      new AppError(
        'Debe contener por lo menos 1 mayúscula, minúscula, un número y carácter especial.',
        400
      )
    );
  }

  // Verificar formato de fecha
  const fecha = new Date(fechaNacimiento);
  if (isNaN(fecha.getTime())) {
    return next(new AppError('La fecha de nacimiento no es válida.', 400));
  }

  next();
};

// validación de datos de inicio de sesión
const validarLogin = (req, res, next) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return next(new AppError('El correo y la contraseña son obligatorios.', 400));
  }

  if (!EMAIL_REGEX.test(correo)) {
    return next(new AppError('El formato del correo electrónico no es válido.', 400));
  }

  next();
};

// Valida que se proporcione un código de 6 dígitos numéricos
const validarCodigo = (req, res, next) => {
  const { codigo } = req.body;

  if (!codigo) {
    return next(new AppError('El código de verificación es obligatorio.', 400));
  }

  // El código debe ser exactamente 6 dígitos numéricos
  if (!/^\d{6}$/.test(codigo)) {
    return next(new AppError('El código debe ser de 6 dígitos numéricos.', 400));
  }

  next();
};

// Valida el correo para solicitud de recuperación de contraseña
const validarRecuperacion = (req, res, next) => {
  const { correo } = req.body;

  if (!correo) {
    return next(new AppError('El correo electrónico es obligatorio.', 400));
  }

  if (!EMAIL_REGEX.test(correo)) {
    return next(new AppError('El formato del correo electrónico no es válido.', 400));
  }

  next();
};

// Valida los campos para restablecer contraseña y verifica que la nueva contraseña cumpla requisitos y coincida con la confirmación
const validarResetContrasena = (req, res, next) => {
  const { nuevaContrasena } = req.body;

  if (!nuevaContrasena) {
    return next(new AppError('La nueva contraseña es obligatoria.', 400));
  }

  const { valida } = validarFortalezaContrasena(nuevaContrasena);
  if (!valida) {
    return next(
      new AppError(
        'Debe contener por lo menos 1 mayúscula, minúscula, un número y carácter especial.',
        400
      )
    );
  }

  next();
};


module.exports = {
  validarRegistro,
  validarLogin,
  validarCodigo,
  validarRecuperacion,
  validarResetContrasena,
};
