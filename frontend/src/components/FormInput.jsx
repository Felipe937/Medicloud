import React from 'react';

const FormInput = ({ label, type = 'text', id, error, required, ...props }) => {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label} {required && <span style={{color: 'var(--danger)'}}>*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea 
          id={id}
          className="form-control" 
          style={{ minHeight: '100px', resize: 'vertical' }}
          {...props} 
        />
      ) : (
        <input 
          type={type} 
          id={id}
          className="form-control" 
          {...props} 
        />
      )}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

export default FormInput;
