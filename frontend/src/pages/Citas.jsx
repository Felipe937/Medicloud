import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import FeedbackMessage from '../components/FeedbackMessage';
import FormInput from '../components/FormInput';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import api from '../services/api';
import getApiErrorMessage from '../utils/apiError';

const emptyForm = {
  id_paciente: '',
  id_medico: '',
  fecha_hora: '',
  motivo: '',
  observaciones: ''
};

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchCitas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/citas');
      if (response.data.success) {
        setCitas(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching citas:', error);
      setFeedback({ type: 'error', message: getApiErrorMessage(error, 'No fue posible cargar las citas.') });
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectData = async () => {
    try {
      const [pacientesRes, medicosRes] = await Promise.all([
        api.get('/api/pacientes'),
        api.get('/api/medicos')
      ]);
      if (pacientesRes.data.success) setPacientes(pacientesRes.data.data);
      if (medicosRes.data.success) setMedicos(medicosRes.data.data);
    } catch (error) {
      console.error('Error fetching select data:', error);
      setFeedback({ type: 'error', message: getApiErrorMessage(error, 'No fue posible cargar pacientes o medicos.') });
    }
  };

  useEffect(() => {
    fetchCitas();
    fetchSelectData();
  }, []);

  const openModal = () => {
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setFormLoading(true);
      await api.post('/citas', formData);
      closeModal();
      setFeedback({ type: 'success', message: 'Cita agendada correctamente.' });
      await fetchCitas();
    } catch (error) {
      console.error('Error saving cita:', error);
      setFeedback({ type: 'error', message: getApiErrorMessage(error, 'Error al agendar la cita.') });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await api.delete(`/citas/${deleteTarget.id_cita}`);
      setFeedback({ type: 'success', message: 'Cita eliminada correctamente.' });
      setDeleteTarget(null);
      await fetchCitas();
    } catch (error) {
      console.error('Error deleting cita:', error);
      setFeedback({ type: 'error', message: getApiErrorMessage(error, 'Error al eliminar la cita.') });
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'programada': return <span className="badge badge-warning">Programada</span>;
      case 'completada':
      case 'atendida': return <span className="badge badge-success">Atendida</span>;
      case 'cancelada': return <span className="badge badge-danger">Cancelada</span>;
      default: return <span className="badge badge-warning">{estado}</span>;
    }
  };

  if (loading && citas.length === 0) {
    return <Loading message="Cargando citas..." />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Gestion de Citas</h1>
        <button className="btn btn-primary" onClick={openModal}>
          <Plus size={18} /> Agendar Cita
        </button>
      </div>

      <FeedbackMessage
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: '', message: '' })}
      />

      {citas.length === 0 ? (
        <EmptyState icon={CalendarIcon} title="No hay citas" message="Agenda una cita para comenzar a organizar la atencion medica." />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Paciente</th>
                <th>Medico</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((cita) => (
                <tr key={cita.id_cita}>
                  <td>
                    <div style={styles.dateCell}>
                      <CalendarIcon size={16} color="var(--text-muted)" />
                      {new Date(cita.fecha_hora).toLocaleString()}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{cita.paciente_nombre}</td>
                  <td>{cita.medico_nombre}</td>
                  <td>{cita.motivo}</td>
                  <td>{getStatusBadge(cita.estado)}</td>
                  <td>
                    <button
                      className="btn btn-outline"
                      style={styles.deleteButton}
                      onClick={() => setDeleteTarget(cita)}
                      title="Eliminar cita"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Agendar Nueva Cita">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Paciente <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select className="form-control" value={formData.id_paciente} onChange={(e) => setFormData({ ...formData, id_paciente: e.target.value })} required>
              <option value="">Seleccione un paciente</option>
              {pacientes.map((paciente) => (
                <option key={paciente.id_paciente} value={paciente.id_paciente}>{paciente.nombre} ({paciente.documento})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Medico <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select className="form-control" value={formData.id_medico} onChange={(e) => setFormData({ ...formData, id_medico: e.target.value })} required>
              <option value="">Seleccione un medico</option>
              {medicos.map((medico) => (
                <option key={medico.id_medico} value={medico.id_medico}>{medico.nombre} - {medico.especialidad}</option>
              ))}
            </select>
          </div>

          <FormInput label="Fecha y Hora" type="datetime-local" value={formData.fecha_hora} onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })} required />
          <FormInput label="Motivo" value={formData.motivo} onChange={(e) => setFormData({ ...formData, motivo: e.target.value })} required />
          <FormInput label="Observaciones" type="textarea" value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} />

          <div style={styles.formActions}>
            <button type="button" className="btn btn-outline" onClick={closeModal} disabled={formLoading}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>{formLoading ? 'Agendando...' : 'Agendar Cita'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Eliminar cita"
        message="Esta accion eliminara la cita seleccionada de la agenda."
        confirmText="Eliminar"
        loading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

const styles = {
  dateCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  deleteButton: {
    padding: '0.375rem',
    color: 'var(--danger)',
    borderColor: 'var(--danger)'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '2rem'
  }
};

export default Citas;
