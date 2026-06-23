import { useState, useEffect, useRef } from 'react';
import './App.css';

// SVG Icons defined as components for convenience, clean layout, and zero dependencies
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon-left"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon-left"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon-left"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon-left"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
);

const CheckCircleIcon = ({ met }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={met ? "var(--success-green)" : "#d0d5dd"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="requirement-icon">
    {met ? (
      <>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </>
    ) : (
      <circle cx="12" cy="12" r="10" />
    )}
  </svg>
);

// Decorative Left Panel Component
const LeftPanel = () => {
  return (
    <div className="left-panel">
      <div className="waves-container">
        <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 500 800">
          <path className="wave-line" d="M -50 220 C 120 180, 240 380, 480 260 C 600 210, 800 380, 800 380" />
          <path className="wave-line" d="M -50 360 C 180 440, 220 220, 520 380 C 620 430, 800 320, 800 320" />
          <path className="wave-line" d="M -50 510 C 80 620, 320 440, 500 560 C 600 620, 800 480, 800 480" />
        </svg>
      </div>
      <div className="left-content">
        <h1 className="brand-title">Legado<br />Eterno</h1>
        <p className="brand-subtitle">
          Comienza a construir el puente entre tu presente y el futuro de tus seres queridos.
        </p>
      </div>
    </div>
  );
};

function App() {
  // Navigation Screen States: 'login' | 'register' | 'recover' | 'verify' | 'reset' | 'dashboard'
  const [screen, setScreen] = useState('login');
  
  // Email storage to customize UI text and direct logic
  const [emailForOTP, setEmailForOTP] = useState('');
  // Source context of OTP: 'register' | 'recover'
  const [otpSource, setOtpSource] = useState('register');
  
  // Show / Hide password states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification Timer (starts at 105 seconds i.e. 1:45)
  const [timer, setTimer] = useState(105);
  
  // Toast Alert States
  const [toasts, setToasts] = useState([]);

  // Form Fields State
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    birthDate: '',
    email: '',
    password: ''
  });

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [recoverForm, setRecoverForm] = useState({
    email: ''
  });

  const [otpFields, setOtpFields] = useState(['', '', '', '', '', '']);

  const [resetForm, setResetForm] = useState({
    password: '',
    confirmPassword: ''
  });

  // Focus reference for OTP fields
  const otpRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // OTP Countdown Timer effect
  useEffect(() => {
    if (screen !== 'verify') return;
    
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [screen]);

  // Helper to trigger toast messages
  const showToast = (type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto remove after 4.5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Helper to format remaining timer seconds to MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Password validators for registration
  const checkLength = (pwd) => pwd.length >= 8;
  const checkUpperLowerNum = (pwd) => {
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNum = /[0-9]/.test(pwd);
    return hasUpper && hasLower && hasNum;
  };
  const checkSpecial = (pwd) => /[@$!%*?&]/.test(pwd);

  // Password validators for Reset Password screen
  const checkResetLength = (pwd) => pwd.length >= 8;
  const checkResetUpper = (pwd) => /[A-Z]/.test(pwd);
  const checkResetNumber = (pwd) => /[0-9]/.test(pwd);
  const checkResetSpecial = (pwd) => /[@$!%*?&]/.test(pwd);

  // Check if all registration inputs are valid
  const isRegisterValid = () => {
    const { fullName, birthDate, email, password } = registerForm;
    return (
      fullName.trim() !== '' &&
      birthDate !== '' &&
      email.trim() !== '' &&
      checkLength(password) &&
      checkUpperLowerNum(password) &&
      checkSpecial(password)
    );
  };

  // Check if all reset inputs are valid
  const isResetValid = () => {
    const { password, confirmPassword } = resetForm;
    return (
      password !== '' &&
      password === confirmPassword &&
      checkResetLength(password) &&
      checkResetUpper(password) &&
      checkResetNumber(password) &&
      checkResetSpecial(password)
    );
  };

  // Handle transitions between screens cleanly
  const navigateTo = (targetScreen) => {
    // Reset toggle values
    setShowPassword(false);
    setShowConfirmPassword(false);
    setScreen(targetScreen);
  };

  // FORM SUBMIT ACTIONS

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!isRegisterValid()) return;

    // Simulate OTP generation
    setEmailForOTP(registerForm.email);
    setOtpSource('register');
    setOtpFields(['', '', '', '', '', '']);
    setTimer(105); // 1:45
    
    showToast('success', 'Cuenta creada. Se ha enviado un código de verificación.');
    navigateTo('verify');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginForm.email.trim() === '' || loginForm.password.trim() === '') {
      showToast('error', 'Por favor, introduce tu correo y contraseña.');
      return;
    }

    showToast('success', 'Sesión iniciada con éxito. ¡Bienvenido!');
    navigateTo('dashboard');
  };

  const handleRecoverSubmit = (e) => {
    e.preventDefault();
    if (recoverForm.email.trim() === '') {
      showToast('error', 'Por favor, introduce una dirección de correo válida.');
      return;
    }

    setEmailForOTP(recoverForm.email);
    setOtpSource('recover');
    setOtpFields(['', '', '', '', '', '']);
    setTimer(105); // 1:45
    
    showToast('success', 'Código de recuperación enviado al correo.');
    navigateTo('verify');
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    const code = otpFields.join('');
    if (code.length < 6) {
      showToast('error', 'Por favor, ingresa los 6 dígitos del código.');
      return;
    }

    // Mock validation: accept any code for demonstration purposes
    showToast('success', 'Identidad verificada correctamente.');
    if (otpSource === 'register') {
      // If registering, complete verification and lead to login
      showToast('success', '¡Cuenta activada con éxito! Inicia sesión ahora.');
      navigateTo('login');
    } else {
      // If recovering, lead to password resetting
      navigateTo('reset');
    }
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!isResetValid()) return;

    showToast('success', 'Contraseña restablecida con éxito. Puedes iniciar sesión.');
    // Clear forms
    setResetForm({ password: '', confirmPassword: '' });
    setLoginForm({ email: emailForOTP, password: '' });
    navigateTo('login');
  };

  const handleResendCode = () => {
    setTimer(105); // reset countdown to 1:45
    showToast('success', 'Un nuevo código de seguridad ha sido enviado a tu correo.');
  };

  // OTP Inputs key handlers
  const handleOtpChange = (index, value) => {
    // Only accept numeric inputs
    if (value !== '' && !/^[0-9]$/.test(value)) return;
    
    const newOtp = [...otpFields];
    newOtp[index] = value;
    setOtpFields(newOtp);

    // Auto-focus next field
    if (value !== '' && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otpFields[index] === '' && index > 0) {
        // Clear previous box and focus it
        const newOtp = [...otpFields];
        newOtp[index - 1] = '';
        setOtpFields(newOtp);
        otpRefs[index - 1].current.focus();
      } else {
        const newOtp = [...otpFields];
        newOtp[index] = '';
        setOtpFields(newOtp);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^[0-9]{6}$/.test(pasteData)) {
      const codeDigits = pasteData.split('');
      setOtpFields(codeDigits);
      // Focus on the last field
      otpRefs[5].current.focus();
    } else {
      showToast('error', 'Por favor, pega un código de 6 dígitos numéricos.');
    }
  };

  return (
    <div className="app-container">
      {/* Toast System */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="toast-icon">{t.type === 'success' ? '✓' : '⚠'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Split Screen Container */}
      {screen !== 'dashboard' && <LeftPanel />}

      <div className="right-panel" style={screen === 'dashboard' ? { width: '100%' } : {}}>
        <div className="form-wrapper">
          
          {/* SCREEN: LOGIN (BIENVENIDO) */}
          {screen === 'login' && (
            <div className="fade-in">
              <div className="form-header">
                <h2 className="form-title">Bienvenido</h2>
                <p className="form-subtitle">Acceda a su legado digital de forma segura.</p>
              </div>

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="login-email">Correo electrónico</label>
                  <div className="input-wrapper">
                    <MailIcon />
                    <input
                      id="login-email"
                      type="email"
                      className="input-field"
                      placeholder="nombre@ejemplo.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-label">
                    <label htmlFor="login-password">Contraseña</label>
                    <span 
                      className="forgot-password-link"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigateTo('recover')}
                    >
                      ¿Olvidó su contraseña?
                    </span>
                  </div>
                  <div className="input-wrapper">
                    <LockIcon />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      className="input-field"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="input-icon-right"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '32px' }}>
                  Iniciar sesión
                </button>
              </form>

              <p className="form-footer-text">
                ¿No tienes una cuenta?{' '}
                <span 
                  style={{ color: 'var(--brand-blue)', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' }}
                  onClick={() => navigateTo('register')}
                >
                  Regístrate
                </span>
              </p>
            </div>
          )}

          {/* SCREEN: REGISTER (CREAR NUEVA CUENTA) */}
          {screen === 'register' && (
            <div className="fade-in">
              <div className="form-header">
                <h2 className="form-title">Crear nueva cuenta</h2>
                <p className="form-subtitle">Únete a la plataforma que asegura tu legado.</p>
              </div>

              <form onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-name">Nombre completo</label>
                  <div className="input-wrapper">
                    <UserIcon />
                    <input
                      id="reg-name"
                      type="text"
                      className="input-field"
                      placeholder="Ej: Maria García"
                      value={registerForm.fullName}
                      onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-birth">Fecha de nacimiento</label>
                  <div className="input-wrapper">
                    <CalendarIcon />
                    <input
                      id="reg-birth"
                      type="date"
                      className="input-field"
                      value={registerForm.birthDate}
                      onChange={(e) => setRegisterForm({ ...registerForm, birthDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-email">Correo electrónico</label>
                  <div className="input-wrapper">
                    <MailIcon />
                    <input
                      id="reg-email"
                      type="email"
                      className="input-field"
                      placeholder="nombre@ejemplo.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-password">Contraseña segura</label>
                  <div className="input-wrapper">
                    <LockIcon />
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      className="input-field"
                      placeholder="••••••••"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="input-icon-right"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {/* Requirements Checklist */}
                <div className="password-requirements">
                  <p className="password-requirements-title">Requisitos de seguridad:</p>
                  <ul className="requirements-list">
                    <li className={`requirement-item ${checkLength(registerForm.password) ? 'met' : 'unmet'}`}>
                      <CheckCircleIcon met={checkLength(registerForm.password)} />
                      <span>Mínimo 8 caracteres</span>
                    </li>
                    <li className={`requirement-item ${checkUpperLowerNum(registerForm.password) ? 'met' : 'unmet'}`}>
                      <CheckCircleIcon met={checkUpperLowerNum(registerForm.password)} />
                      <span>Mayúscula, minúscula y número</span>
                    </li>
                    <li className={`requirement-item ${checkSpecial(registerForm.password) ? 'met' : 'unmet'}`}>
                      <CheckCircleIcon met={checkSpecial(registerForm.password)} />
                      <span>Un carácter especial (@$!%*?&)</span>
                    </li>
                  </ul>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={!isRegisterValid()}
                >
                  Crear Cuenta
                </button>
              </form>

              <p className="form-footer-text">
                ¿Ya tienes una cuenta?{' '}
                <span 
                  style={{ color: 'var(--brand-blue)', fontWeight: '600', cursor: 'pointer' }}
                  onClick={() => navigateTo('login')}
                >
                  Inicia sesión
                </span>
              </p>
            </div>
          )}

          {/* SCREEN: RECOVER (RECUPERAR CUENTA) */}
          {screen === 'recover' && (
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
                    <MailIcon />
                    <input
                      id="recover-email"
                      type="email"
                      className="input-field"
                      placeholder="ejemplo@correo.com"
                      value={recoverForm.email}
                      onChange={(e) => setRecoverForm({ email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary">
                  Enviar Código
                </button>
              </form>

              <div 
                className="back-link-bottom"
                onClick={() => navigateTo('login')}
              >
                <ArrowLeftIcon />
                <span>Volver al inicio de sesión</span>
              </div>
            </div>
          )}

          {/* SCREEN: VERIFY (VERIFICAR IDENTIDAD / OTP) */}
          {screen === 'verify' && (
            <div className="fade-in">
              <div className="back-link" onClick={() => navigateTo(otpSource === 'register' ? 'register' : 'recover')}>
                <ArrowLeftIcon />
                <span>Volver</span>
              </div>

              <div className="form-header">
                <h2 className="form-title">Verificar Identidad</h2>
                <p className="form-subtitle">
                  Hemos enviado un código de seguridad de 6 dígitos a <strong>{emailForOTP || 'su correo electrónico registrado'}</strong> para confirmar su acceso.
                </p>
              </div>

              <form onSubmit={handleVerifySubmit}>
                <div className="otp-container">
                  {otpFields.map((val, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength="1"
                      className="otp-box"
                      value={val}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                      required
                    />
                  ))}
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '32px' }}>
                  Verificar Código
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
          )}

          {/* SCREEN: RESET (RESTABLECER CONTRASEÑA) */}
          {screen === 'reset' && (
            <div className="fade-in">
              <div className="back-link" onClick={() => navigateTo('login')}>
                <ArrowLeftIcon />
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
                    <LockIcon />
                    <input
                      id="reset-password"
                      type={showPassword ? "text" : "password"}
                      className="input-field"
                      placeholder="••••••••"
                      value={resetForm.password}
                      onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="input-icon-right"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reset-confirm">Confirmar Nueva Contraseña</label>
                  <div className="input-wrapper">
                    <LockIcon />
                    <input
                      id="reset-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      className="input-field"
                      placeholder="••••••••"
                      value={resetForm.confirmPassword}
                      onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="input-icon-right"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {/* Circular checklist rules */}
                <div className="requirements-grid">
                  <div className={`requirement-item-circle ${checkResetLength(resetForm.password) ? 'met' : 'unmet'}`}>
                    <span className={`circle-check ${checkResetLength(resetForm.password) ? 'met' : 'unmet'}`} />
                    <span>Más de 8 caracteres</span>
                  </div>

                  <div className={`requirement-item-circle ${checkResetUpper(resetForm.password) ? 'met' : 'unmet'}`}>
                    <span className={`circle-check ${checkResetUpper(resetForm.password) ? 'met' : 'unmet'}`} strokeWidth="2.5" />
                    <span>Mayúscula</span>
                  </div>

                  <div className={`requirement-item-circle ${checkResetNumber(resetForm.password) ? 'met' : 'unmet'}`}>
                    <span className={`circle-check ${checkResetNumber(resetForm.password) ? 'met' : 'unmet'}`} />
                    <span>Número</span>
                  </div>

                  <div className={`requirement-item-circle ${checkResetSpecial(resetForm.password) ? 'met' : 'unmet'}`}>
                    <span className={`circle-check ${checkResetSpecial(resetForm.password) ? 'met' : 'unmet'}`} />
                    <span>Carácter especial</span>
                  </div>
                </div>

                {resetForm.password !== '' && resetForm.confirmPassword !== '' && resetForm.password !== resetForm.confirmPassword && (
                  <p style={{ color: 'var(--error-red)', fontSize: '13px', marginBottom: '16px', fontWeight: '500' }}>
                    ⚠ Las contraseñas no coinciden.
                  </p>
                )}

                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={!isResetValid()}
                >
                  Restablecer Contraseña
                </button>
              </form>
            </div>
          )}

          {/* SCREEN: MOCK DASHBOARD (INICIO DE SESIÓN EXITOSO) */}
          {screen === 'dashboard' && (
            <div className="dashboard-container fade-in">
              <div className="dashboard-avatar">LE</div>
              <h2 className="dashboard-title">¡Bienvenido a tu Bóveda!</h2>
              <p className="dashboard-welcome-msg">
                Has iniciado sesión de forma segura en <strong>Legado Eterno</strong>. Tu información, legados y bóvedas digitales están ahora protegidos.
              </p>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={() => {
                    showToast('success', 'Sincronización segura completada.');
                  }}
                >
                  Ver mis Legados
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    // Log out
                    setLoginForm({ email: '', password: '' });
                    showToast('success', 'Sesión cerrada de forma segura.');
                    navigateTo('login');
                  }}
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
