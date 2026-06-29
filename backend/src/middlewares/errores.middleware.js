class AppError extends Error {
  constructor(mensaje, statusCode) {
    super(mensaje);
    this.statusCode = statusCode;
    this.isOperational = true; // Distingue errores esperados de bugs

    // Captura el stack trace excluyendo el constructor de AppError
    Error.captureStackTrace(this, this.constructor);
  }
}


const manejadorErrores = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const mensaje = err.isOperational
    ? err.message
    : 'Error interno del servidor. Intenta de nuevo más tarde.';

  // Log del error para debugging del servidor
  console.error(`[ERROR ${statusCode}] ${err.message}`);
  if (!err.isOperational) {
    console.error('Stack trace:', err.stack);
  }

  res.status(statusCode).json({
    exito: false,
    mensaje,
  });
};

module.exports = { AppError, manejadorErrores };
