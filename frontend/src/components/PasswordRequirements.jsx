import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import './PasswordRequirements.css';

const PasswordRequirements = ({ password }) => {
  const checkLength = (pwd) => pwd.length >= 8;
  
  const checkUpperLowerNum = (pwd) => {
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNum = /[0-9]/.test(pwd);
    return hasUpper && hasLower && hasNum;
  };

  const checkSpecial = (pwd) => /[@$!%*?&]/.test(pwd);

  return (
    <div className="password-requirements">
      <p className="password-requirements-title">Requisitos de seguridad:</p>
      <ul className="requirements-list">
        <li className={`requirement-item ${checkLength(password) ? 'met' : 'unmet'}`}>
          {checkLength(password) ? (
            <CheckCircle2 size={16} className="requirement-icon checked" />
          ) : (
            <Circle size={16} className="requirement-icon unchecked" />
          )}
          <span>Mínimo 8 caracteres</span>
        </li>
        <li className={`requirement-item ${checkUpperLowerNum(password) ? 'met' : 'unmet'}`}>
          {checkUpperLowerNum(password) ? (
            <CheckCircle2 size={16} className="requirement-icon checked" />
          ) : (
            <Circle size={16} className="requirement-icon unchecked" />
          )}
          <span>Mayúscula, minúscula y número</span>
        </li>
        <li className={`requirement-item ${checkSpecial(password) ? 'met' : 'unmet'}`}>
          {checkSpecial(password) ? (
            <CheckCircle2 size={16} className="requirement-icon checked" />
          ) : (
            <Circle size={16} className="requirement-icon unchecked" />
          )}
          <span>Un carácter especial (@$!%*?&)</span>
        </li>
      </ul>
    </div>
  );
};

export default PasswordRequirements;
