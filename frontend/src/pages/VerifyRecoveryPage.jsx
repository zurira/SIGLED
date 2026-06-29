import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import OTPInput from '../components/OTPInput';
import { ArrowLeft } from 'lucide-react';
import './VerifyRecoveryPage.css';
import authService from '../services/auth.service';
import { useToast } from '../context/ToastContext';

const VerifyRecoveryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const correo = location.state?.correo || '';
  const [otpFields, setOtpFields] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(105); // 1:45
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!correo) {
      showToast('error', 'Falta el correo electrónico para verificar.');
      navigate('/recuperar');
    }
  }, [correo, navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    const codigo = otpFields.join('');
    if (codigo.length < 6) {
      showToast('error', 'Por favor, ingresa los 6 dígitos del código.');
      return;
    }

    setCargando(true);
    try {
      const datos = await authService.verificarRecuperacion({ correo, codigo });
      if (datos.exito && datos.token) {
        showToast('success', 'Código verificado. Procede a cambiar tu contraseña.');
        navigate('/resetear-contrasena', { state: { token: datos.token } });
      }
    } catch (error) {
      showToast('error', error.response?.data?.mensaje || 'Error al verificar el código.');
    } finally {
      setCargando(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await authService.reenviarCodigo({ correo, tipo: 'RECUPERACION' });
      setTimer(105);
      setOtpFields(['', '', '', '', '', '']);
      showToast('success', 'Se ha enviado un nuevo código de recuperación.');
    } catch (error) {
      showToast('error', error.response?.data?.mensaje || 'Error al reenviar código.');
    }
  };

  return (
    <AuthLayout>
      <div className="fade-in">
        <div className="back-link" onClick={() => navigate('/recuperar')}>
          <ArrowLeft size={16} />
          <span>Volver</span>
        </div>

        <div className="form-header">
          <h2 className="form-title">Verificar Código</h2>
          <p className="form-subtitle">
            Hemos enviado un código de recuperación a <strong>{correo}</strong>. Ingréselo para restablecer su clave.
          </p>
        </div>

        <form onSubmit={handleVerifySubmit}>
          <OTPInput value={otpFields} onChange={setOtpFields} />

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ marginTop: '32px' }}
            disabled={cargando}
          >
            {cargando ? 'Verificando...' : 'Verificar Código'}
          </button>
        </form>

        <div className="resend-text">
          ¿No recibió el código?<br />
          {timer > 0 ? (
            <span className="resend-link disabled">
              Reenviar código (disponible en {formatTime(timer)})
            </span>
          ) : (
            <span className="resend-link" onClick={handleResendCode}>
              Reenviar código
            </span>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyRecoveryPage;
