// Modelado de códigos de verificción
// Verificación de registro
// OTP de login 2FA
// Recuperación de contraseña
const pool = require('../config/db');

/**
 * IDs de tipos de código
 */
const TIPOS = {
  REGISTRO: 1,
  LOGIN_OTP: 2,
  RECUPERACION: 3,
};

/**
 * Crea un nuevo código de verificación.
 * @param {Object} datos
 * @param {number} datos.usuarioId - ID del usuario al que pertenece.
 * @param {string} datos.codigoCifrado - Código hasheado con bcrypt.
 * @param {number} datos.tipoCodigoId - Tipo.
 * @param {Date} datos.vigenteHasta - Fecha/hora de expiración del código.
 * @returns {number} ID del código recién creado.
 */
async function crearCodigo(
    {usuarioId,
      codigoCifrado,
      tipoCodigoId,
      vigenteHasta })
{
  const [resultado] = await pool.query(
    `INSERT INTO codigos_verificacion (usuario_id, codigo_cifrado, tipo_codigo_id, vigente_hasta)
     VALUES (?, ?, ?, ?)`,
    [usuarioId, codigoCifrado, tipoCodigoId, vigenteHasta]
  );
  return resultado.insertId;
}

/**
 * Busca el código más reciente que esté vigente para cad usuario en especifico
 * @param {number} usuarioId
 * @param {number} tipoCodigoId
 * @returns {Object|undefined}
 */
async function buscarCodigoVigente(usuarioId, tipoCodigoId) {
  const [rows] = await pool.query(
    `SELECT id, codigo_cifrado, vigente_hasta, intentos, usado
     FROM codigos_verificacion
     WHERE usuario_id = ?
       AND tipo_codigo_id = ?
       AND usado = FALSE
       AND vigente_hasta > NOW()
     ORDER BY id DESC
     LIMIT 1`,
    [usuarioId, tipoCodigoId]
  );
  return rows[0];
}

/**
 * Marca un código como usado para que no se pueda reutilizar
 * @param {number} codigoId
 */
async function marcarComoUsado(codigoId) {
  await pool.query(
    'UPDATE codigos_verificacion SET usado = TRUE WHERE id = ?',
    [codigoId]
  );
}

/**
 * Contador de intesntos fallidos
 * @param {number} codigoId
 */
async function incrementarIntentos(codigoId) {
  await pool.query(
    'UPDATE codigos_verificacion SET intentos = intentos + 1 WHERE id = ?',
    [codigoId]
  );
}

/**
 * En caso de solcitar un nuevo código se invalidan los anteriores para mejor control
 * @param {number} usuarioId
 * @param {number} tipoCodigoId
 */
async function invalidarCodigosPrevios(usuarioId, tipoCodigoId) {
  await pool.query(
    `UPDATE codigos_verificacion
     SET usado = TRUE
     WHERE usuario_id = ?
       AND tipo_codigo_id = ?
       AND usado = FALSE`,
    [usuarioId, tipoCodigoId]
  );
}

module.exports = {
  TIPOS,
  crearCodigo,
  buscarCodigoVigente,
  marcarComoUsado,
  incrementarIntentos,
  invalidarCodigosPrevios,
};
