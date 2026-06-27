import api from './api';

const authService = {
  async registrar({ nombreCompleto, correo, contrasena, fechaNacimiento }) {
    const response = await api.post('/auth/registro', {
      nombreCompleto,
      correo,
      contrasena,
      fechaNacimiento,
    });
    return response.data;
  },

  async verificarCuenta({ correo, codigo }) {
    const response = await api.post('/auth/verificar-cuenta', { correo, codigo });
    return response.data;
  },

  async login({ correo, contrasena }) {
    const response = await api.post('/auth/login', { correo, contrasena });
    return response.data;
  },

  async verificar2FA({ correo, codigo }) {
    const response = await api.post('/auth/verificar-2fa', { correo, codigo });
    return response.data;
  },

  async recuperar({ correo }) {
    const response = await api.post('/auth/recuperar', { correo });
    return response.data;
  },

  async verificarRecuperacion({ correo, codigo }) {
    const response = await api.post('/auth/verificar-recuperacion', { correo, codigo });
    return response.data;
  },

  async resetearContrasena({ token, nuevaContrasena }) {
    const response = await api.post('/auth/resetear-contrasena', { token, nuevaContrasena });
    return response.data;
  },

  async reenviarCodigo({ correo, tipo }) {
    const response = await api.post('/auth/reenviar-codigo', { correo, tipo });
    return response.data;
  },

  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
  },

  async obtenerPerfil() {
    const response = await api.get('/auth/perfil');
    return response.data;
  },
};

export default authService;
