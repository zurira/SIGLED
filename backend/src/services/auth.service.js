const bcrypt = require('bcrypt');
const usuarioModel = require('../models/usuario.model');
const codigoModel = require('../models/codigo.model');
const jwtUtil = require('../utils/jwt.util');
const emailUtil = require('../utils/email.util');
const helpers = require('../utils/helpers');
const { AppError } = require('../middlewares/errores.middleware');

// Registrar nuevo usuario y valida mediante código
async function registrar({ nombreCompleto, correo, contrasena, fechaNacimiento }) {
  // Verificar si el correo ya existe
  const existente = await usuarioModel.buscarPorCorreo(correo);
  if (existente) {
    throw new AppError('Este correo ya está registrado.', 409);
  }

  // Cifrado de contraseña
  const contrasenaHash = await bcrypt.hash(contrasena, 10);

  // Crear el usuario (rol: 1 = TITULAR, estado: 1 = PENDIENTE_VERIFICACION)
  const usuarioId = await usuarioModel.crearUsuario({
    nombreCompleto,
    correo,
    contrasenaHash,
    rolId: 1,
    estadoId: 1,
    fechaNacimiento,
  });

  // Generación de código OTP
  const otp = helpers.generarCodigo6Digitos();
  const otpHash = await bcrypt.hash(otp, 10);

  // vigencia del código
  const vigenteHasta = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // almacena código en base de datos
  await codigoModel.crearCodigo({
    usuarioId,
    codigoCifrado: otpHash,
    tipoCodigoId: codigoModel.TIPOS.REGISTRO,
    vigenteHasta,
  });

  // Envío de código
  try {
    await emailUtil.enviarCodigoVerificacion(correo, otp, 'REGISTRO');
  } catch (error) {
    console.error('Error al enviar email de registro:', error);
    // No fallamos el registro completo si falla el correo, el usuario puede reenviar.
  }

  return {
    usuarioId,
    mensaje: 'Usuario registrado correctamente. Pendiente de verificación.',
  };
}

// verificación de cuenta mediante código
async function verificarCuenta({ correo, codigo }) {
  const usuario = await usuarioModel.buscarPorCorreo(correo);
  if (!usuario) {
    throw new AppError('Usuario no encontrado.', 404);
  }

  if (usuario.estado_id === 2) {
    throw new AppError('Esta cuenta ya está activa.', 400);
  }

  // Buscar el código vigente
  const dbCodigo = await codigoModel.buscarCodigoVigente(usuario.id, codigoModel.TIPOS.REGISTRO);
  if (!dbCodigo) {
    throw new AppError('El código de verificación expiró o no existe. Solicita uno nuevo.', 400);
  }

  // Comparar con bcrypt
  const esValido = await bcrypt.compare(codigo, dbCodigo.codigo_cifrado);
  if (!esValido) {
    await codigoModel.incrementarIntentos(dbCodigo.id);
    if (dbCodigo.intentos + 1 >= 3) {
      await codigoModel.marcarComoUsado(dbCodigo.id);
      throw new AppError('Código inválido. Has alcanzado el límite de intentos. Solicita uno nuevo.', 400);
    }
    throw new AppError('Código de verificación incorrecto.', 400);
  }

  // Marcar código como usado y activar cuenta
  await codigoModel.marcarComoUsado(dbCodigo.id);
  await usuarioModel.actualizarEstado(usuario.id, 2); // 2 = ACTIVO

  // Generación del token
  const token = jwtUtil.generarToken({
    id: usuario.id,
    correo: usuario.correo,
    rolId: usuario.rol_id,
  });

  return {
    mensaje: 'Cuenta activada exitosamente.',
    token,
    usuario: {
      id: usuario.id,
      nombreCompleto: usuario.nombre_completo,
      correo: usuario.correo,
      rolId: usuario.rol_id,
    },
  };
}

// Inicio de sesión y validación OTP
async function login({ correo, contrasena }) {
  const usuario = await usuarioModel.buscarPorCorreo(correo);
  if (!usuario) {
    throw new AppError('Credenciales incorrectas.', 401);
  }

  // Verificar si la cuenta está bloqueada temporalmente
  if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
    const tiempoRestante = Math.ceil((new Date(usuario.bloqueado_hasta) - new Date()) / 1000 / 60);
    throw new AppError(`Cuenta bloqueada temporalmente por exceso de intentos. Intenta en ${tiempoRestante} minutos.`, 403);
  }

  // Verificar estados especiales
  if (usuario.estado_id === 1) {
    throw new AppError('Tu cuenta está pendiente de verificación. Revisa tu correo.', 403);
  }
  if (usuario.estado_id === 3) {
    throw new AppError('Tu cuenta está inactiva.', 403);
  }

  // Verificar la contraseña
  const esValido = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!esValido) {
    await usuarioModel.incrementarIntentosFallidos(usuario.id);
    const intentosActuales = (usuario.intentos_fallidos || 0) + 1;

    if (intentosActuales >= 3) {
      const bloqueadoHasta = new Date(Date.now() + 15 * 60 * 1000); // Bloqueo de 15 minutos
      await usuarioModel.bloquearCuenta(usuario.id, bloqueadoHasta);
      throw new AppError('Credenciales incorrectas. Cuenta bloqueada temporalmente por 15 minutos.', 401);
    }

    throw new AppError('Credenciales incorrectas.', 401);
  }

  // Limpiar intentos fallidos si los había
  await usuarioModel.resetearIntentos(usuario.id);

  // Generar OTP para 2FA (5 minutos de vigencia)
  const otp = helpers.generarCodigo6Digitos();
  const otpHash = await bcrypt.hash(otp, 10);
  const vigenteHasta = new Date(Date.now() + 5 * 60 * 1000);

  // Invalidar códigos de 2FA anteriores
  await codigoModel.invalidarCodigosPrevios(usuario.id, codigoModel.TIPOS.LOGIN_OTP);

  // Guardar nuevo código
  await codigoModel.crearCodigo({
    usuarioId: usuario.id,
    codigoCifrado: otpHash,
    tipoCodigoId: codigoModel.TIPOS.LOGIN_OTP,
    vigenteHasta,
  });

  // Enviar por correo
  try {
    await emailUtil.enviarCodigoVerificacion(correo, otp, 'LOGIN_OTP');
  } catch (error) {
    console.error('Error al enviar email 2FA:', error);
  }

  return {
    mensaje: 'Código de verificación 2FA enviado al correo.',
    correoParcial: helpers.ocultarCorreo(correo),
    correo,
  };
}


// Valida el código 2FA ingresado y genera el token de sesión definitivo

async function verificar2FA({ correo, codigo }) {
  const usuario = await usuarioModel.buscarPorCorreo(correo);
  if (!usuario) {
    throw new AppError('Usuario no encontrado.', 404);
  }

  if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
    throw new AppError('La cuenta está bloqueada temporalmente.', 403);
  }

  const dbCodigo = await codigoModel.buscarCodigoVigente(usuario.id, codigoModel.TIPOS.LOGIN_OTP);
  if (!dbCodigo) {
    throw new AppError('El código 2FA expiró o no existe. Solicita uno nuevo.', 400);
  }

  const esValido = await bcrypt.compare(codigo, dbCodigo.codigo_cifrado);
  if (!esValido) {
    await codigoModel.incrementarIntentos(dbCodigo.id);
    if (dbCodigo.intentos + 1 >= 3) {
      await codigoModel.marcarComoUsado(dbCodigo.id);
      throw new AppError('Código inválido. Has alcanzado el límite de intentos. Solicita uno nuevo.', 400);
    }
    throw new AppError('Código 2FA incorrecto.', 400);
  }

  // Marcar código como usado
  await codigoModel.marcarComoUsado(dbCodigo.id);

  // Resetear intentos de bloqueo
  await usuarioModel.resetearIntentos(usuario.id);

  // Generar JWT
  const token = jwtUtil.generarToken({
    id: usuario.id,
    correo: usuario.correo,
    rolId: usuario.rol_id,
  });

  return {
    mensaje: 'Inicio de sesión exitoso.',
    token,
    usuario: {
      id: usuario.id,
      nombreCompleto: usuario.nombre_completo,
      correo: usuario.correo,
      rolId: usuario.rol_id,
    },
  };
}

// recuperación de contraseña
async function solicitarRecuperacion({ correo }) {
  const usuario = await usuarioModel.buscarPorCorreo(correo);

  const respuestaSegura = {
    mensaje: 'Si el correo está registrado, recibirás un código de recuperación.',
  };

  if (!usuario) {
    return respuestaSegura;
  }

  // Generar OTP de recuperación (5 minutos de vigencia)
  const otp = helpers.generarCodigo6Digitos();
  const otpHash = await bcrypt.hash(otp, 10);
  const vigenteHasta = new Date(Date.now() + 5 * 60 * 1000);

  // Invalidar códigos de recuperación anteriores
  await codigoModel.invalidarCodigosPrevios(usuario.id, codigoModel.TIPOS.RECUPERACION);

  // Guardar nuevo código
  await codigoModel.crearCodigo({
    usuarioId: usuario.id,
    codigoCifrado: otpHash,
    tipoCodigoId: codigoModel.TIPOS.RECUPERACION,
    vigenteHasta,
  });

  // Enviar por correo
  try {
    await emailUtil.enviarCodigoVerificacion(correo, otp, 'RECUPERACION');
  } catch (error) {
    console.error('Error al enviar email de recuperación:', error);
  }

  return respuestaSegura;
}


async function verificarCodigoRecuperacion({ correo, codigo }) {
  const usuario = await usuarioModel.buscarPorCorreo(correo);
  if (!usuario) {
    throw new AppError('Usuario no encontrado.', 404);
  }

  const dbCodigo = await codigoModel.buscarCodigoVigente(usuario.id, codigoModel.TIPOS.RECUPERACION);
  if (!dbCodigo) {
    throw new AppError('El código de recuperación expiró o no existe. Solicita uno nuevo.', 400);
  }

  const esValido = await bcrypt.compare(codigo, dbCodigo.codigo_cifrado);
  if (!esValido) {
    await codigoModel.incrementarIntentos(dbCodigo.id);
    if (dbCodigo.intentos + 1 >= 3) {
      await codigoModel.marcarComoUsado(dbCodigo.id);
      throw new AppError('Código inválido. Has alcanzado el límite de intentos. Solicita uno nuevo.', 400);
    }
    throw new AppError('Código de recuperación incorrecto.', 400);
  }

  // Marcar como usado
  await codigoModel.marcarComoUsado(dbCodigo.id);

  // Generar un token temporal con vigencia corta (10 minutos)
  const token = jwtUtil.generarToken({
    id: usuario.id,
    correo: usuario.correo,
    esRecovery: true,
  }, '10m');

  return {
    mensaje: 'Código verificado correctamente. Procede a cambiar la contraseña.',
    token,
  };
}


 //Cambia la contraseña del usuario usando el token temporal validado.

async function resetearContrasena({ token, nuevaContrasena }) {
  let decoded;
  try {
    decoded = jwtUtil.verificarToken(token);
  } catch (err) {
    throw new AppError('Token de restablecimiento inválido o expirado.', 401);
  }

  if (!decoded.esRecovery) {
    throw new AppError('Token no autorizado para esta acción.', 403);
  }

  // Hashear nueva contraseña
  const contrasenaHash = await bcrypt.hash(nuevaContrasena, 10);

  // Actualizar en la BD
  await usuarioModel.actualizarContrasena(decoded.id, contrasenaHash);

  // Desbloquear/resetear intentos en caso de estar bloqueado
  await usuarioModel.resetearIntentos(decoded.id);

  return {
    mensaje: 'Tu contraseña ha sido actualizada correctamente.',
  };
}

// Reenvía un código OTP vigente invalidando los anteriores.

async function reenviarCodigo({ correo, tipo }) {
  const usuario = await usuarioModel.buscarPorCorreo(correo);
  if (!usuario) {
    throw new AppError('Usuario no encontrado.', 404);
  }

  const tipoCodigoId = codigoModel.TIPOS[tipo];
  if (!tipoCodigoId) {
    throw new AppError('Tipo de código no válido.', 400);
  }

  if (tipo === 'REGISTRO' && usuario.estado_id === 2) {
    throw new AppError('Esta cuenta ya se encuentra activa.', 400);
  }

  // Invalidar códigos anteriores de este tipo
  await codigoModel.invalidarCodigosPrevios(usuario.id, tipoCodigoId);

  // Generar nuevo código
  const otp = helpers.generarCodigo6Digitos();
  const otpHash = await bcrypt.hash(otp, 10);

  // Configurar duración de vigencia
  const duracion = tipo === 'REGISTRO' ? 24 * 60 * 60 * 1000 : 5 * 60 * 1000;
  const vigenteHasta = new Date(Date.now() + duracion);

  // Guardar en BD
  await codigoModel.crearCodigo({
    usuarioId: usuario.id,
    codigoCifrado: otpHash,
    tipoCodigoId,
    vigenteHasta,
  });

  // Enviar correo
  try {
    await emailUtil.enviarCodigoVerificacion(correo, otp, tipo);
  } catch (error) {
    console.error(`Error reenviando email ${tipo}:`, error);
  }

  return {
    mensaje: 'Código reenviado correctamente.',
    correo,
  };
}

module.exports = {
  registrar,
  verificarCuenta,
  login,
  verificar2FA,
  solicitarRecuperacion,
  verificarCodigoRecuperacion,
  resetearContrasena,
  reenviarCodigo,
};
