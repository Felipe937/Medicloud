import { AlertTriangle } from 'lucide-react';
import React from 'react';

const ConfirmDialog = ({
  isOpen,
  title = 'Confirmar accion',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  onCancel,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(event) => event.stopPropagation()}>
        <div className="confirm-icon">
          <AlertTriangle size={24} />
        </div>
        <div className="confirm-content">
          <h3>{title}</h3>
          <p>{message}</p>
        </div>
        <div className="confirm-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
