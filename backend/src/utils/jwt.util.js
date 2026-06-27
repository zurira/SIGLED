const jwt = require('jsonwebtoken');

/**
 * Generación de JWT
 * @param {Object} payload
 * @param {string} expiresIn
 * @returns {string}
 */
const generarToken = (payload, expiresIn) => {
  const duracion = expiresIn || process.env.JWT_EXPIRES_IN || '1h';
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: duracion });
};

/**
 * Verifica y decodifica un JWT.
 * @param {string} token - Token JWT a verificar.
 * @returns {Object} Payload decodificado si el token es válido.
 * @throws {JsonWebTokenError|TokenExpiredError} Si el token es inválido o expiró.
 */
const verificarToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generarToken, verificarToken };
