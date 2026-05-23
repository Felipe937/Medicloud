import React, { useEffect, useState } from 'react';

import FormInput from '../FormInput';

const initialForm = {
  paciente: '',
  diagnostico: '',
  tratamiento: '',
  notas_medicas: ''
};

const HistoriaForm = ({ pacientes, historia, loading, onCancel, onSubmit }) => {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (historia) {
      setFormData({
        paciente: String(historia.id_paciente || historia.paciente || ''),
        diagnostico: historia.diagnostico || '',
        tratamiento: historia.tratamiento || '',
        notas_medicas: historia.notas_medicas || ''
      });
      return;
    }

    setFormData(initialForm);
  }, [historia]);

  const handleChange = (field) => (event) => {
    setFormData((current) => ({
      ...current,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="historia-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="historia-paciente">
          Paciente <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <select
          id="historia-paciente"
          className="form-control"
          value={formData.paciente}
          onChange={handleChange('paciente')}
          required
        >
          <option value="">Seleccione un paciente</option>
          {pacientes.map((paciente) => (
            <option key={paciente.id_paciente} value={paciente.id_paciente}>
              {paciente.nombre} {paciente.documento ? `(${paciente.documento})` : ''}
            </option>
          ))}
        </select>
      </div>

      <FormInput
        id="historia-diagnostico"
        label="Diagnostico"
        type="textarea"
        value={formData.diagnostico}
        onChange={handleChange('diagnostico')}
        required
      />

      <FormInput
        id="historia-tratamiento"
        label="Tratamiento"
        type="textarea"
        value={formData.tratamiento}
        onChange={handleChange('tratamiento')}
        required
      />

      <FormInput
        id="historia-notas"
        label="Notas medicas"
        type="textarea"
        value={formData.notas_medicas}
        onChange={handleChange('notas_medicas')}
      />

      <div className="historia-form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : historia ? 'Actualizar historia' : 'Crear historia'}
        </button>
      </div>
    </form>
  );
};

export default HistoriaForm;
