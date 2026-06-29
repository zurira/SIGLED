import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { User, Calendar, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import './RegisterPage.css';
import PasswordRequirements from '../components/PasswordRequirements';
import authService from '../services/auth.service';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const checkLength = (pwd) => pwd.length >= 8;
  const checkUpperLowerNum = (pwd) => {
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNum = /[0-9]/.test(pwd);
    return hasUpper && hasLower && hasNum;
  };
  const checkSpecial = (pwd) => /[@$!%*?&]/.test(pwd);

  const isRegisterValid = () => {
    return (
      nombreCompleto.trim() !== '' &&
      fechaNacimiento !== '' &&
      correo.trim() !== '' &&
      checkLength(contrasena) &&
      checkUpperLowerNum(contrasena) &&
      checkSpecial(contrasena)
    );
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!isRegisterValid()) return;

    setCargando(true);
    try {
      const datos = await authService.registrar({
        nombreCompleto,
        correo,
        contrasena,
        fechaNacimiento,
      });

      if (datos.exito) {
        showToast('success', 'Cuenta creada. Se ha enviado un código de verificación.');
        // Navegar a la verificación pasando el correo en el estado
        navigate('/verificar-cuenta', { state: { correo } });
      }
    } catch (error) {
      showToast('error', error.response?.data?.mensaje || 'Error al registrar usuario.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthLayout>
      <div className="fade-in">
        <div className="form-header">
          <h2 className="form-title">Crear nueva cuenta</h2>
          <p className="form-subtitle">Únete a la plataforma que asegura tu legado.</p>
        </div>

        <form onSubmit={handleRegisterSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Nombre completo</label>
            <div className="input-wrapper">
              <User className="input-icon-left" size={18} />
              <input
                id="reg-name"
                type="text"
                className="input-field"
                placeholder="Ej: Maria García"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                required
                disabled={cargando}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-birth">Fecha de nacimiento</label>
            <div className="input-wrapper">
              <Calendar className="input-icon-left" size={18} />
              <input
                id="reg-birth"
                type="date"
                className="input-field"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                required
                disabled={cargando}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Correo electrónico</label>
            <div className="input-wrapper">
              <Mail className="input-icon-left" size={18} />
              <input
                id="reg-email"
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
            <label className="form-label" htmlFor="reg-password">Contraseña segura</label>
            <div className="input-wrapper">
              <Lock className="input-icon-left" size={18} />
              <input
                id="reg-password"
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

          <PasswordRequirements password={contrasena} />

          <button 
            type="submit" 
            className="btn-primary"
            disabled={!isRegisterValid() || cargando}
          >
            {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="form-footer-text">
          ¿Ya tienes una cuenta?{' '}
          <span 
            style={{ color: 'var(--brand-blue)', fontWeight: '600', cursor: 'pointer' }}
            onClick={() => navigate('/login')}
          >
            Inicia sesión
          </span>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
