const pool = require('../config/db');

/**
 * Busca un usuario por correo electrónico.
 * Retorna el registro completo necesario para login y validaciones.
 * @param {string} correo
 * @returns {Object|undefined} Registro del usuario o undefined si no existe.
 */
async function buscarPorCorreo(correo) {
  const [rows] = await pool.query(
    `SELECT id, rol_id, estado_id, nombre_completo, correo, contrasena,
            fecha_nacimiento, intentos_fallidos, bloqueado_hasta, creado_en
     FROM usuarios
     WHERE correo = ?`,
    [correo]
  );
  return rows[0];
}

/**
 * Busca un usuario por su ID.
 * Usado para cargar perfil
 * @param {number} id
 * @returns {Object|undefined}
 */
async function buscarPorId(id) {
  const [rows] = await pool.query(
    `SELECT id, rol_id, estado_id, nombre_completo, correo,
            fecha_nacimiento, creado_en
     FROM usuarios
     WHERE id = ?`,
    [id]
  );
  return rows[0];
}

/**
 * Crea un nuevo usuario en la base de datos.
 * @param {Object} datos
 * @returns {number}
 */
async function crearUsuario({ nombreCompleto, correo, contrasenaHash, rolId, estadoId, fechaNacimiento }) {
  const [resultado] = await pool.query(
    `INSERT INTO usuarios (rol_id, estado_id, nombre_completo, correo, contrasena, fecha_nacimiento)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [rolId, estadoId, nombreCompleto, correo, contrasenaHash, fechaNacimiento]
  );
  return resultado.insertId;
}

/**
 * Actualiza el estado de un usuario
 * @param {number} userId
 * @param {number} estadoId
 */
async function actualizarEstado(userId, estadoId) {
  await pool.query(
    'UPDATE usuarios SET estado_id = ? WHERE id = ?',
    [estadoId, userId]
  );
}

/**
 * Incrementa el contador de intentos fallidos de login
 * @param {number} userId
 */
async function incrementarIntentosFallidos(userId) {
  await pool.query(
    'UPDATE usuarios SET intentos_fallidos = intentos_fallidos + 1 WHERE id = ?',
    [userId]
  );
}

/**
 * Bloquea la cuenta del usuario hasta la fecha indicada.
 * Se usa cuando alcanza el máximo de intentos fallidos
 * @param {number} userId
 * @param {Date} hasta
 */
async function bloquearCuenta(userId, hasta) {
  await pool.query(
    'UPDATE usuarios SET bloqueado_hasta = ? WHERE id = ?',
    [hasta, userId]
  );
}

/**
 * Resetea los intentos fallidos y el bloqueo después de un login exitoso.
 * @param {number} userId
 */
async function resetearIntentos(userId) {
  await pool.query(
    'UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?',
    [userId]
  );
}

/**
 * Actualiza la contraseña de un usuario
 * @param {number} userId
 * @param {string} contrasenaHash
 */
async function actualizarContrasena(userId, contrasenaHash) {
  await pool.query(
    'UPDATE usuarios SET contrasena = ? WHERE id = ?',
    [contrasenaHash, userId]
  );
}

module.exports = {
  buscarPorCorreo,
  buscarPorId,
  crearUsuario,
  actualizarEstado,
  incrementarIntentosFallidos,
  bloquearCuenta,
  resetearIntentos,
  actualizarContrasena,
};