import React, { useRef } from 'react';
import { useToast } from '../context/ToastContext';
import './OTPInput.css';

const OTPInput = ({ value, onChange }) => {
  const { showToast } = useToast();
  const refs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  const handleOtpChange = (index, val) => {
    // Solo permitir números
    if (val !== '' && !/^[0-9]$/.test(val)) return;

    const newValue = [...value];
    newValue[index] = val;
    onChange(newValue);

    // Auto-focus al siguiente input
    if (val !== '' && index < 5) {
      refs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (value[index] === '' && index > 0) {
        // Borrar el anterior y enfocarlo
        const newValue = [...value];
        newValue[index - 1] = '';
        onChange(newValue);
        refs[index - 1].current.focus();
      } else {
        const newValue = [...value];
        newValue[index] = '';
        onChange(newValue);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^[0-9]{6}$/.test(pasteData)) {
      const codeDigits = pasteData.split('');
      onChange(codeDigits);
      // Enfocar el último campo
      refs[5].current.focus();
    } else {
      showToast('error', 'Por favor, pega un código de 6 dígitos numéricos.');
    }
  };

  return (
    <div className="otp-container">
      {value.map((val, idx) => (
        <input
          key={idx}
          ref={refs[idx]}
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
  );
};

export default OTPInput;
