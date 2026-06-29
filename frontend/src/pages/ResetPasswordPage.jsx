import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import './ResetPasswordPage.css';
import authService from '../services/auth.service';
import { useToast } from '../context/ToastContext';

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const token = location.state?.token || '';
  
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmacionContrasena, setConfirmacionContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!token) {
      showToast('error', 'Acceso denegado. Solicita una recuperación de contraseña.');
      navigate('/login');
    }
  }, [token, navigate]);

  const checkResetLength = (pwd) => pwd.length >= 8;
  const checkResetUpper = (pwd) => /[A-Z]/.test(pwd);
  const checkResetNumber = (pwd) => /[0-9]/.test(pwd);
  const checkResetSpecial = (pwd) => /[@$!%*?&]/.test(pwd);

  const isResetValid = () => {
    return (
      nuevaContrasena !== '' &&
      nuevaContrasena === confirmacionContrasena &&
      checkResetLength(nuevaContrasena) &&
      checkResetUpper(nuevaContrasena) &&
      checkResetNumber(nuevaContrasena) &&
      checkResetSpecial(nuevaContrasena)
    );
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!isResetValid()) return;

    setCargando(true);
    try {
      const datos = await authService.resetearContrasena({ token, nuevaContrasena });
      if (datos.exito) {
        showToast('success', 'Contraseña restablecida con éxito. Ya puedes iniciar sesión.');
        navigate('/login');
      }
    } catch (error) {
      showToast('error', error.response?.data?.mensaje || 'Error al restablecer la contraseña.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthLayout>
      <div className="fade-in">
        <div className="back-link" onClick={() => navigate('/login')}>
          <ArrowLeft size={16} />
          <span>Volver al inicio</span>
        </div>

        <div className="form-header">
          <h2 className="form-title">Restablecer Contraseña</h2>
          <p className="form-subtitle">
            Cree una clave robusta para asegurar el acceso a su bóveda digital.
          </p>
        </div>

        <form onSubmit={handleResetSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reset-password">Nueva Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon-left" size={18} />
              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                className="input-field"
                placeholder="••••••••"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
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

          <div className="form-group">
            <label className="form-label" htmlFor="reset-confirm">Confirmar Nueva Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon-left" size={18} />
              <input
                id="reset-confirm"
                type={showConfirmPassword ? "text" : "password"}
                className="input-field"
                placeholder="••••••••"
                value={confirmacionContrasena}
                onChange={(e) => setConfirmacionContrasena(e.target.value)}
                required
                disabled={cargando}
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={cargando}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Circular checklist rules */}
          <div className="requirements-grid">
            <div className={`requirement-item-circle ${checkResetLength(nuevaContrasena) ? 'met' : 'unmet'}`}>
              <span className={`circle-check ${checkResetLength(nuevaContrasena) ? 'met' : 'unmet'}`} />
              <span>Más de 8 caracteres</span>
            </div>

            <div className={`requirement-item-circle ${checkResetUpper(nuevaContrasena) ? 'met' : 'unmet'}`}>
              <span className={`circle-check ${checkResetUpper(nuevaContrasena) ? 'met' : 'unmet'}`} />
              <span>Mayúscula</span>
            </div>

            <div className={`requirement-item-circle ${checkResetNumber(nuevaContrasena) ? 'met' : 'unmet'}`}>
              <span className={`circle-check ${checkResetNumber(nuevaContrasena) ? 'met' : 'unmet'}`} />
              <span>Número</span>
            </div>

            <div className={`requirement-item-circle ${checkResetSpecial(nuevaContrasena) ? 'met' : 'unmet'}`}>
              <span className={`circle-check ${checkResetSpecial(nuevaContrasena) ? 'met' : 'unmet'}`} />
              <span>Carácter especial</span>
            </div>
          </div>

          {nuevaContrasena !== '' && confirmacionContrasena !== '' && nuevaContrasena !== confirmacionContrasena && (
            <p style={{ color: 'var(--error-red)', fontSize: '13px', marginBottom: '16px', fontWeight: '500' }}>
              ⚠ Las contraseñas no coinciden.
            </p>
          )}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={!isResetValid() || cargando}
          >
            {cargando ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
