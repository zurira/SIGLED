const { verificarToken } = require('../utils/jwt.util');
const { AppError } = require('./errores.middleware');

const protegerRuta = (req, res, next) => {
  try {
    //Extraer el header de autorización
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Acceso no autorizado. Debes iniciar sesión.', 401);
    }

    // Obtener el token (quitar "Bearer ")
    const token = authHeader.split(' ')[1];

    //Verificar y decodificar
    const decoded = verificarToken(token);

    //Adjuntar datos del usuario al request para uso posterior
    req.usuario = {
      id: decoded.id,
      correo: decoded.correo,
      rol: decoded.rol,
    };

    next();
  } catch (error) {
    // Errores específicos de JWT
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Tu sesión ha expirado. Inicia sesión nuevamente.', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token inválido. Acceso denegado.', 401));
    }
    next(error);
  }
};

module.exports = { protegerRuta };
