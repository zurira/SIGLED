import React from 'react';
import './LeftPanel.css';

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

export default LeftPanel;
