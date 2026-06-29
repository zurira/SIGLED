

const authService = require('../services/auth.service');
const usuarioModel = require('../models/usuario.model');
const { AppError } = require('../middlewares/errores.middleware');

// Registro de cuenta
async function registrar(req, res, next) {
  try {
    const {
      nombreCompleto,
      correo,
      contrasena,
      fechaNacimiento
    } = req.body;
    const resultado = await authService.registrar({ nombreCompleto, correo, contrasena, fechaNacimiento });
    return res.status(201).json({
      exito: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
}

// verificación de cuenta nueva mediante OTP
async function verificarCuenta(req, res, next) {
  try {
    const { correo, codigo } = req.body;
    const resultado = await authService.verificarCuenta({ correo, codigo });
    return res.status(200).json({
      exito: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
}


async function login(req, res, next) {
  try {
    const { correo, contrasena } = req.body;
    const resultado = await authService.login({ correo, contrasena });
    return res.status(200).json({
      exito: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
}


async function verificar2FA(req, res, next) {
  try {
    const { correo, codigo } = req.body;
    const resultado = await authService.verificar2FA({ correo, codigo });
    return res.status(200).json({
      exito: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
}


async function solicitarRecuperacion(req, res, next) {
  try {
    const { correo } = req.body;
    const resultado = await authService.solicitarRecuperacion({ correo });
    return res.status(200).json({
      exito: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
}


async function verificarCodigoRecuperacion(req, res, next) {
  try {
    const { correo, codigo } = req.body;
    const resultado = await authService.verificarCodigoRecuperacion({ correo, codigo });
    return res.status(200).json({
      exito: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
}


async function resetearContrasena(req, res, next) {
  try {
    const { token, nuevaContrasena } = req.body;
    const resultado = await authService.resetearContrasena({ token, nuevaContrasena });
    return res.status(200).json({
      exito: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
}

// reenvía los códigos
async function reenviarCodigo(req, res, next) {
  try {
    const { correo, tipo } = req.body;
    const resultado = await authService.reenviarCodigo({ correo, tipo });
    return res.status(200).json({
      exito: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
}


async function logout(req, res) {
  return res.status(200).json({
    exito: true,
    mensaje: 'Sesión cerrada correctamente.',
  });
}


async function obtenerPerfil(req, res, next) {
  try {
    const usuario = await usuarioModel.buscarPorId(req.usuario.id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado.', 404);
    }
    return res.status(200).json({
      exito: true,
      usuario,
    });
  } catch (error) {
    next(error);
  }
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
  logout,
  obtenerPerfil,
};