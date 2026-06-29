// ============================================================================
// app.js — Configuración de la aplicación Express
// ============================================================================
// Configura middlewares globales, prefijos de rutas, y el manejador global
// de errores para asegurar que la app responda siempre en formato JSON.
// ============================================================================

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const { manejadorErrores } = require('./middlewares/errores.middleware');

const app = express();

// Configuración de CORS para permitir peticiones del frontend (Vite en puerto 5173)
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// Middleware para procesar cuerpos JSON en peticiones
app.use(express.json());

// Registrar rutas de autenticación
app.use('/api/auth', authRoutes);

// Manejador global de errores (Debe ser el último middleware registrado)
app.use(manejadorErrores);

module.exports = app;