import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import OTPInput from '../components/OTPInput';
import { ArrowLeft } from 'lucide-react';
import './Verify2FAPage.css';
import authService from '../services/auth.service';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const Verify2FAPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { loginUser } = useAuth();

  const correo = location.state?.correo || '';
  const correoParcial = location.state?.correoParcial || '';
  
  const [otpFields, setOtpFields] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(105); // 1:45
  const [cargando, setCargando] = useState(false);

  // Redirigir si no hay correo
  useEffect(() => {
    if (!correo) {
      showToast('error', 'Sesión no iniciada. Por favor introduce tus credenciales.');
      navigate('/login');
    }
  }, [correo, navigate]);

  // Temporizador de reenvío
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

  const handleVerify2FASubmit = async (e) => {
    e.preventDefault();
    const codigo = otpFields.join('');
    if (codigo.length < 6) {
      showToast('error', 'Por favor, ingresa los 6 dígitos del código.');
      return;
    }

    setCargando(true);
    try {
      const datos = await authService.verificar2FA({ correo, codigo });
      if (datos.exito) {
        showToast('success', 'Sesión iniciada con éxito. ¡Bienvenido!');
        loginUser(datos.usuario, datos.token);
        navigate('/dashboard');
      }
    } catch (error) {
      showToast('error', error.response?.data?.mensaje || 'Error en la verificación 2FA.');
    } finally {
      setCargando(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await authService.reenviarCodigo({ correo, tipo: 'LOGIN_OTP' });
      setTimer(105);
      setOtpFields(['', '', '', '', '', '']);
      showToast('success', 'Código de verificación reenviado.');
    } catch (error) {
      showToast('error', error.response?.data?.mensaje || 'Error al reenviar código.');
    }
  };

  return (
    <AuthLayout>
      <div className="fade-in">
        <div className="back-link" onClick={() => navigate('/login')}>
          <ArrowLeft size={16} />
          <span>Volver al Login</span>
        </div>

        <div className="form-header">
          <h2 className="form-title">Verificación</h2>
          <p className="form-subtitle">
            Hemos enviado un código de acceso rápido a su correo <strong>{correoParcial}</strong>. Ingréselo para continuar.
          </p>
        </div>

        <form onSubmit={handleVerify2FASubmit}>
          <OTPInput value={otpFields} onChange={setOtpFields} />

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ marginTop: '32px' }}
            disabled={cargando}
          >
            {cargando ? 'Iniciando sesión...' : 'Confirmar Código'}
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

export default Verify2FAPage;
