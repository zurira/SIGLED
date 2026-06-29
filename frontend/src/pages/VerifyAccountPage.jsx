import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import OTPInput from '../components/OTPInput';
import { ArrowLeft } from 'lucide-react';
import './VerifyAccountPage.css';
import Modal from '../components/Modal';
import authService from '../services/auth.service';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const VerifyAccountPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { loginUser } = useAuth();
  
  const correo = location.state?.correo || '';
  const [otpFields, setOtpFields] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(105); // 1:45
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosLogin, setDatosLogin] = useState(null);

  // Redirigir si no hay correo
  useEffect(() => {
    if (!correo) {
      showToast('error', 'Falta el correo electrónico para verificar.');
      navigate('/registro');
    }
  }, [correo, navigate]);

  // Efecto para el temporizador
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
      const datos = await authService.verificarCuenta({ correo, codigo });
      if (datos.exito) {
        showToast('success', 'Cuenta verificada correctamente.');
        setDatosLogin(datos);
        setModalAbierto(true);
      }
    } catch (error) {
      showToast('error', error.response?.data?.mensaje || 'Error al verificar cuenta.');
    } finally {
      setCargando(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await authService.reenviarCodigo({ correo, tipo: 'REGISTRO' });
      setTimer(105);
      setOtpFields(['', '', '', '', '', '']);
      showToast('success', 'Se ha enviado un nuevo código de verificación.');
    } catch (error) {
      showToast('error', error.response?.data?.mensaje || 'Error al reenviar código.');
    }
  };

  const handleModalClose = () => {
    setModalAbierto(false);
    if (datosLogin) {
      loginUser(datosLogin.usuario, datosLogin.token);
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout>
      <div className="fade-in">
        <div className="back-link" onClick={() => navigate('/registro')}>
          <ArrowLeft size={16} />
          <span>Volver</span>
        </div>

        <div className="form-header">
          <h2 className="form-title">Verificar Cuenta</h2>
          <p className="form-subtitle">
            Hemos enviado un código de seguridad de 6 dígitos a <strong>{correo}</strong> para confirmar su registro.
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

      <Modal 
        isOpen={modalAbierto} 
        onClose={handleModalClose} 
        title="¡Cuenta Activada!"
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <p style={{ fontSize: '16px', marginBottom: '24px' }}>
            Tu cuenta ha sido activada exitosamente. Ahora puedes acceder de manera segura a tu Bóveda de Legados Digitales.
          </p>
          <button 
            className="btn-primary" 
            onClick={handleModalClose}
          >
            Ir al Dashboard
          </button>
        </div>
      </Modal>
    </AuthLayout>
  );
};

export default VerifyAccountPage;
