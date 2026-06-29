import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { Mail, ArrowLeft } from 'lucide-react';
import './RecoverPage.css';
import authService from '../services/auth.service';
import { useToast } from '../context/ToastContext';

const RecoverPage = () => {
  const [correo, setCorreo] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleRecoverSubmit = async (e) => {
    e.preventDefault();
    if (!correo) {
      showToast('error', 'Por favor introduce un correo válido.');
      return;
    }

    setCargando(true);
    try {
      const datos = await authService.recuperar({ correo });
      if (datos.exito) {
        showToast('success', datos.mensaje);
        // Redirigir a verificación de código de recuperación
        navigate('/verificar-recuperacion', { state: { correo } });
      }
    } catch (error) {
      showToast('error', error.response?.data?.mensaje || 'Error al procesar recuperación.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthLayout>
      <div className="fade-in">
        <div className="form-header">
          <h2 className="form-title">Recuperar Cuenta</h2>
          <p className="form-subtitle">
            Introduzca la dirección de correo electrónico asociada a su cuenta para recibir un código de seguridad.
          </p>
        </div>

        <form onSubmit={handleRecoverSubmit}>
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label" htmlFor="recover-email">Correo Electrónico</label>
            <div className="input-wrapper">
              <Mail className="input-icon-left" size={18} />
              <input
                id="recover-email"
                type="email"
                className="input-field"
                placeholder="ejemplo@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                disabled={cargando}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={cargando}>
            {cargando ? 'Enviando...' : 'Enviar Código'}
          </button>
        </form>

        <div 
          className="back-link-bottom"
          onClick={() => navigate('/login')}
          style={{ cursor: 'pointer' }}
        >
          <ArrowLeft size={16} />
          <span>Volver al inicio de sesión</span>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RecoverPage;
