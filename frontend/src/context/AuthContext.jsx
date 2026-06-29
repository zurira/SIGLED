import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const inicializarSesion = async () => {
      const tokenGuardado = localStorage.getItem('token');
      if (tokenGuardado) {
        try {
          // Intentar verificar el token obteniendo el perfil
          const datos = await authService.obtenerPerfil();
          if (datos.exito && datos.usuario) {
            setUsuario(datos.usuario);
            setToken(tokenGuardado);
            setAutenticado(true);
          } else {
            // Limpiar si no es exitoso
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
          }
        } catch (error) {
          console.error('Error al inicializar sesión:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
        }
      }
      setCargando(false);
    };

    inicializarSesion();
  }, []);

  const loginUser = (datosUsuario, tokenSesion) => {
    localStorage.setItem('token', tokenSesion);
    localStorage.setItem('usuario', JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
    setToken(tokenSesion);
    setAutenticado(true);
  };

  const logoutUser = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      setUsuario(null);
      setToken(null);
      setAutenticado(false);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, token, autenticado, cargando, loginUser, logoutUser, setUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
