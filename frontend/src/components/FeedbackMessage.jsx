import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import React from 'react';

const FeedbackMessage = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div className={`feedback-message feedback-message-${type}`} role="alert">
      <Icon size={18} />
      <span>{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Cerrar mensaje">
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default FeedbackMessage;
