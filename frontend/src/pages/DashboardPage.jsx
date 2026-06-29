import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  LayoutDashboard,
  FileText,
  Heart,
  Users,
  LogOut,
  Bell,
  User,
  CheckCircle2,
  Smile,
  FileStack,
  ShieldCheck,
  ListTodo,
  AlertTriangle,
} from 'lucide-react';
import './DashboardPage.css';

/* Componente de Círculo de Progreso */
const ProgressCircle = ({ percentage }) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-circle-container" style={{ position: 'relative' }}>
      <svg className="progress-circle-svg" viewBox="0 0 56 56">
        <circle className="progress-circle-bg" cx="28" cy="28" r={radius} />
        <circle
          className="progress-circle-fill"
          cx="28"
          cy="28"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(0deg)',
          fontSize: '13px',
          fontWeight: 700,
          color: '#2563eb',
        }}
      >
        {percentage}%
      </span>
    </div>
  );
};

const DashboardPage = () => {
  const { usuario, logoutUser } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    await logoutUser();
    showToast('success', 'Sesión cerrada de forma segura.');
  };

  // Obtener primer nombre de forma segura
  const primerNombre = usuario?.nombre_completo
    ? usuario.nombre_completo.split(' ')[0]
    : 'Usuario';

  // Datos mock de campos del perfil
  const camposPerfil = [
    { nombre: 'Fecha de nacimiento', completo: true },
    { nombre: 'Ciudad de nacimiento', completo: true },
    { nombre: 'Nacionalidad', completo: true },
    { nombre: 'Estado civil', completo: true },
    { nombre: 'Domicilio', completo: false },
    { nombre: 'Nombre de los padres', completo: false },
  ];

  const porcentajePerfil = 68;

  return (
    <div className="dashboard-layout">
      {/* ========== SIDEBAR ========== */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon-circle">
            <ShieldCheck size={18} />
          </div>
          <span className="brand-logo-text">SecureLegacy</span>
        </div>

        <nav>
          <ul className="sidebar-menu">
            <li className="menu-item active">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </li>
            <li
              className="menu-item"
              onClick={() => showToast('success', 'Módulo de Documentos próximamente.')}
            >
              <FileText size={18} />
              <span>Documentos</span>
            </li>
            <li
              className="menu-item"
              onClick={() => showToast('success', 'Módulo de Recuerdos próximamente.')}
            >
              <Heart size={18} />
              <span>Recuerdos</span>
            </li>
            <li
              className="menu-item"
              onClick={() => showToast('success', 'Módulo de Contactos próximamente.')}
            >
              <Users size={18} />
              <span>Contactos</span>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="menu-item" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Salir</span>
          </div>
        </div>
      </aside>

      {/* ========== CONTENIDO PRINCIPAL ========== */}
      <main className="dashboard-main">
        {/* Barra Superior */}
        <header className="dashboard-topbar">
          <h1 className="topbar-title">Dashboard</h1>
          <div className="topbar-actions">
            <button className="topbar-icon-btn" aria-label="Notificaciones">
              <Bell size={20} />
            </button>
            <div className="topbar-avatar">
              <User size={20} />
            </div>
          </div>
        </header>

        {/* Cuerpo */}
        <div className="dashboard-body">
          {/* Tarjeta de Bienvenida */}
          <div className="welcome-card fade-in">
            <h2 className="welcome-title">Bienvenid@ {primerNombre}</h2>
            <p className="welcome-subtitle">
              Tu legado digital esta seguro y actualizado
            </p>
          </div>

          {/* Grid: Estadísticas + Panel de Perfil */}
          <div className="dashboard-grid fade-in">
            {/* Columna Izquierda: 4 tarjetas en grid 2x2 */}
            <div className="stats-grid">
              {/* Total */}
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-header-icon">
                    <FileStack size={16} />
                  </span>
                  <span className="stat-header-label">Total</span>
                </div>
                <span className="stat-value">24</span>
                <span className="stat-description">Documentos totales</span>
              </div>

              {/* 75% Completo */}
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-header-icon" style={{ color: '#16a34a' }}>
                    <ShieldCheck size={16} />
                  </span>
                  <span className="stat-header-label green">75% Completo</span>
                </div>
                <span className="stat-value green">18</span>
                <span className="stat-description">Verificados con éxito</span>
              </div>

              {/* Pendientes */}
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-header-icon">
                    <ListTodo size={16} />
                  </span>
                  <span className="stat-header-label">Pendientes</span>
                </div>
                <span className="stat-value">04</span>
                <span className="stat-description">Borradores en curso</span>
              </div>

              {/* Atención */}
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-header-icon" style={{ color: '#ef4444' }}>
                    <AlertTriangle size={16} />
                  </span>
                  <span className="stat-header-label red">Atención</span>
                </div>
                <span className="stat-value red">02</span>
                <span className="stat-description">
                  Requieren corrección o actualización
                </span>
              </div>
            </div>

            {/* Columna Derecha: Panel de Datos Personales */}
            <div className="profile-completion-card">
              <div className="profile-card-header">
                <h3 className="profile-card-title">
                  Completa tus datos
                  <br />
                  personales
                </h3>
                <ProgressCircle percentage={porcentajePerfil} />
              </div>
              <p className="profile-card-subtitle">Datos generales necesarios</p>

              <div className="profile-fields-list">
                {camposPerfil.map((campo, idx) => (
                  <div className="profile-field-item" key={idx}>
                    {campo.completo ? (
                      <span className="field-icon-complete">
                        <CheckCircle2 size={18} />
                      </span>
                    ) : (
                      <span className="field-icon-pending">
                        <Smile size={18} />
                      </span>
                    )}
                    <span>{campo.nombre}</span>
                  </div>
                ))}
              </div>

              <button
                className="btn-complete-profile"
                onClick={() =>
                  showToast('success', 'Formulario de datos personales próximamente.')
                }
              >
                Completar datos personales
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
