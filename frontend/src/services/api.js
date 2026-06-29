import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el token JWT en las cabeceras de cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para capturar errores de respuesta (por ejemplo, token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el backend responde con 401 Unauthorized, limpiamos la sesión
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      
      // Solo recargar o redirigir si no estamos en una pantalla pública
      const publicPaths = ['/login', '/registro', '/recuperar', '/verificar-cuenta', '/verificar-2fa', '/verificar-recuperacion', '/resetear-contrasena'];
      const currentPath = window.location.pathname;
      if (!publicPaths.includes(currentPath) && currentPath !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
