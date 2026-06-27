const crypto = require('crypto');

/**
 * Genera un código numérico aleatorio de 6 dígitos
 * @returns {string}
 */
const generarCodigo6Digitos = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Oculta parcialmente un correo electrónico para mostrar en pantalla
 * @param {string} correo - Correo electrónico completo.
 * @returns {string} Correo parcialmente oculto.
 */
const ocultarCorreo = (correo) => {
  const [local, dominio] = correo.split('@');
  if (local.length <= 2) {
    return `${local[0]}***@${dominio}`;
  }
  const primerChar = local[0];
  const ultimoChar = local[local.length - 1];
  const asteriscos = '*'.repeat(Math.min(local.length - 2, 3));
  return `${primerChar}${asteriscos}${ultimoChar}@${dominio}`;
};

/**
 * Valida que una contraseña cumpla con los requisitos de seguridad
 * @returns {{ valida: boolean, errores: string[] }}
 */
const validarFortalezaContrasena = (contrasena) => {
  const errores = [];

  if (!contrasena || contrasena.length < 8) {
    errores.push('Mínimo 8 caracteres');
  }
  if (!/[A-Z]/.test(contrasena)) {
    errores.push('Al menos 1 letra mayúscula');
  }
  if (!/[a-z]/.test(contrasena)) {
    errores.push('Al menos 1 letra minúscula');
  }
  if (!/[0-9]/.test(contrasena)) {
    errores.push('Al menos 1 número');
  }
  if (!/[@$!%*?&]/.test(contrasena)) {
    errores.push('Al menos 1 carácter especial (@$!%*?&)');
  }

  return {
    valida: errores.length === 0,
    errores,
  };
};

module.exports = {
  generarCodigo6Digitos,
  ocultarCorreo,
  validarFortalezaContrasena,
};
