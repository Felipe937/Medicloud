import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import Loading from '../components/Loading';
import { Plus, XCircle, Calendar as CalendarIcon } from 'lucide-react';

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // For dropdowns in the form
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id_paciente: '', id_medico: '', fecha_hora: '', motivo: '', observaciones: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCitas();
    fetchSelectData();
  }, []);

  const fetchCitas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/citas');
      if (response.data.success) {
        setCitas(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching citas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectData = async () => {
    try {
      const [pacientesRes, medicosRes] = await Promise.all([
        api.get('/pacientes'),
        api.get('/medicos')
      ]);
      if (pacientesRes.data.success) setPacientes(pacientesRes.data.data);
      if (medicosRes.data.success) setMedicos(medicosRes.data.data);
    } catch (error) {
      console.error('Error fetching select data', error);
    }
  };

  const openModal = () => {
    setFormData({ id_paciente: '', id_medico: '', fecha_hora: '', motivo: '', observaciones: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      await api.post('/citas', formData);
      setIsModalOpen(false);
      fetchCitas();
    } catch (error) {
      console.error('Error saving cita:', error);
      alert(error.response?.data?.message || 'Error al agendar la cita');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelCita = async (id) => {
    if (window.confirm('¿Estás seguro de cancelar esta cita?')) {
      try {
        await api.put(`/citas/cancelar/${id}`);
        fetchCitas();
      } catch (error) {
        console.error('Error canceling:', error);
      }
    }
  };

  const getStatusBadge = (estado) => {
    switch(estado) {
      case 'programada': return <span className="badge badge-warning">Programada</span>;
      case 'atendida': return <span className="badge badge-success">Atendida</span>;
      case 'cancelada': return <span className="badge badge-danger">Cancelada</span>;
      default: return <span className="badge badge-warning">{estado}</span>;
    }
  };

  if (loading && citas.length === 0) return <Loading message="Cargando citas..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Gestión de Citas</h1>
        <button className="btn btn-primary" onClick={openModal}>
          <Plus size={18} /> Agendar Cita
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citas.map((cita) => (
              <tr key={cita.id_cita}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarIcon size={16} color="var(--text-muted)" />
                    {new Date(cita.fecha_hora).toLocaleString()}
                  </div>
                </td>
                <td style={{ fontWeight: '500' }}>{cita.paciente_nombre}</td>
                <td>{cita.medico_nombre}</td>
                <td>{cita.motivo}</td>
                <td>{getStatusBadge(cita.estado)}</td>
                <td>
                  {cita.estado !== 'cancelada' && cita.estado !== 'atendida' && (
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.375rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} 
                      onClick={() => handleCancelCita(cita.id_cita)}
                      title="Cancelar Cita"
                    >
                      <XCircle size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {citas.length === 0 && !loading && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No se encontraron citas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Agendar Nueva Cita"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Paciente <span style={{color: 'var(--danger)'}}>*</span></label>
            <select 
              className="form-control"
              value={formData.id_paciente}
              onChange={e => setFormData({...formData, id_paciente: e.target.value})}
              required
            >
              <option value="">Seleccione un paciente</option>
              {pacientes.map(p => (
                <option key={p.id_paciente} value={p.id_paciente}>{p.nombre} ({p.documento})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Médico <span style={{color: 'var(--danger)'}}>*</span></label>
            <select 
              className="form-control"
              value={formData.id_medico}
              onChange={e => setFormData({...formData, id_medico: e.target.value})}
              required
            >
              <option value="">Seleccione un médico</option>
              {medicos.map(m => (
                <option key={m.id_medico} value={m.id_medico}>{m.nombre} - {m.especialidad}</option>
              ))}
            </select>
          </div>

          <FormInput 
            label="Fecha y Hora" 
            type="datetime-local"
            value={formData.fecha_hora} 
            onChange={e => setFormData({...formData, fecha_hora: e.target.value})} 
            required 
          />
          <FormInput 
            label="Motivo" 
            value={formData.motivo} 
            onChange={e => setFormData({...formData, motivo: e.target.value})} 
            required 
          />
          <FormInput 
            label="Observaciones" 
            type="textarea"
            value={formData.observaciones} 
            onChange={e => setFormData({...formData, observaciones: e.target.value})} 
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Agendando...' : 'Agendar Cita'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Citas;
