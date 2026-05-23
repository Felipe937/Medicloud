import React from 'react';

const Loading = ({ message = 'Cargando...' }) => {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-spinner" />
      <p>{message}</p>
    </div>
  );
};

export default Loading;
