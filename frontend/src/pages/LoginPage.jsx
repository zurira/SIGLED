import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';
import authService from '../services/auth.service';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!correo || !contrasena) {
      showToast('error', 'Por favor, introduce tu correo y contraseña.');
      return;
    }

    setCargando(true);
    try {
      const datos = await authService.login({ correo, contrasena });
      if (datos.exito) {
        showToast('success', 'Credenciales correctas. Código 2FA enviado.');
        // Navegar a la pantalla 2FA pasando el correo y el correo parcial
        navigate('/verificar-2fa', { 
          state: { 
            correo, 
            correoParcial: datos.correoParcial 
          } 
        });
      }
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'Error al iniciar sesión.';
      showToast('error', mensaje);
      
      // Si la cuenta está pendiente de verificación, redirigir a verificar-cuenta
      if (mensaje.includes('pendiente de verificación')) {
        navigate('/verificar-cuenta', { state: { correo } });
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthLayout>
      <div className="fade-in">
        <div className="form-header">
          <h2 className="form-title">Bienvenido</h2>
          <p className="form-subtitle">Acceda a su legado digital de forma segura.</p>
        </div>

        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Correo electrónico</label>
            <div className="input-wrapper">
              <Mail className="input-icon-left" size={18} />
              <input
                id="login-email"
                type="email"
                className="input-field"
                placeholder="nombre@ejemplo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                disabled={cargando}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-label">
              <label htmlFor="login-password">Contraseña</label>
              <span 
                className="forgot-password-link"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/recuperar')}
              >
                ¿Olvidó su contraseña?
              </span>
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon-left" size={18} />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="input-field"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                disabled={cargando}
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                disabled={cargando}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ marginTop: '32px' }}
            disabled={cargando}
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="form-footer-text">
          ¿No tienes una cuenta?{' '}
          <span 
            style={{ color: 'var(--brand-blue)', fontWeight: '600', cursor: 'pointer' }}
            onClick={() => navigate('/registro')}
          >
            Regístrate
          </span>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
