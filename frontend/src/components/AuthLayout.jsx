import React from 'react';
import LeftPanel from './LeftPanel';
import './AuthLayout.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="app-container">
      {/* Decorative Branding Panel */}
      <LeftPanel />

      {/* Right Side Form Panel */}
      <div className="right-panel">
        <div className="form-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
