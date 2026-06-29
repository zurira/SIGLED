// Definición de rutas del sistema de acceso
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protegerRuta } = require('../middlewares/auth.middleware');
const {
  validarRegistro,
  validarLogin,
  validarCodigo,
  validarRecuperacion,
  validarResetContrasena,
} = require('../middlewares/validacion.middleware');

router.post('/registro', validarRegistro, authController.registrar);

router.post('/verificar-cuenta', validarCodigo, authController.verificarCuenta);

router.post('/login', validarLogin, authController.login);

router.post('/verificar-2fa', validarCodigo, authController.verificar2FA);

router.post('/recuperar', validarRecuperacion, authController.solicitarRecuperacion);

router.post('/verificar-recuperacion', validarCodigo, authController.verificarCodigoRecuperacion);

router.post('/resetear-contrasena', validarResetContrasena, authController.resetearContrasena);

router.post('/reenviar-codigo', authController.reenviarCodigo);

router.post('/logout', authController.logout);

router.get('/perfil', protegerRuta, authController.obtenerPerfil);

module.exports = router;