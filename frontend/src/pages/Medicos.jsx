import { Edit2, Plus, Stethoscope, Trash2 } from 'lucide-react';
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
  nombre: '',
  especialidad: '',
  telefono: '',
  email: ''
};

const Medicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMedico, setCurrentMedico] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchMedicos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/medicos');
      if (response.data.success) {
        setMedicos(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching medicos:', error);
      setFeedback({ type: 'error', message: getApiErrorMessage(error, 'No fue posible cargar los medicos.') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicos();
  }, []);

  const openModal = (medico = null) => {
    setCurrentMedico(medico);
    setFormData(medico ? {
      nombre: medico.nombre || '',
      especialidad: medico.especialidad || '',
      telefono: medico.telefono || '',
      email: medico.email || ''
    } : emptyForm);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMedico(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setFormLoading(true);
      if (currentMedico) {
        await api.put(`/api/medicos/${currentMedico.id_medico}`, formData);
      } else {
        await api.post('/api/medicos', formData);
      }

      closeModal();
      setFeedback({
        type: 'success',
        message: currentMedico ? 'Medico actualizado correctamente.' : 'Medico creado correctamente.'
      });
      await fetchMedicos();
    } catch (error) {
      console.error('Error saving medico:', error);
      setFeedback({ type: 'error', message: getApiErrorMessage(error, 'Error al guardar el medico.') });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await api.delete(`/api/medicos/${deleteTarget.id_medico}`);
      setFeedback({ type: 'success', message: 'Medico eliminado correctamente.' });
      setDeleteTarget(null);
      await fetchMedicos();
    } catch (error) {
      console.error('Error deleting medico:', error);
      setFeedback({ type: 'error', message: getApiErrorMessage(error, 'Error al eliminar el medico.') });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && medicos.length === 0) {
    return <Loading message="Cargando medicos..." />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Gestion de Medicos</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Nuevo Medico
        </button>
      </div>

      <FeedbackMessage
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: '', message: '' })}
      />

      {medicos.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No hay medicos" message="Registra el primer medico para empezar a gestionar la agenda." />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Especialidad</th>
                <th>Telefono</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {medicos.map((medico) => (
                <tr key={medico.id_medico}>
                  <td>#{medico.id_medico}</td>
                  <td style={{ fontWeight: 500 }}>{medico.nombre}</td>
                  <td><span className="badge badge-success">{medico.especialidad}</span></td>
                  <td>{medico.telefono}</td>
                  <td>{medico.email}</td>
                  <td>
                    <div style={styles.actions}>
                      <button className="btn btn-outline" style={styles.iconBtn} onClick={() => openModal(medico)} title="Editar medico">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-outline" style={{ ...styles.iconBtn, color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setDeleteTarget(medico)} title="Eliminar medico">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentMedico ? 'Editar Medico' : 'Nuevo Medico'}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Nombre Completo" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
          <FormInput label="Especialidad" value={formData.especialidad} onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })} required />
          <FormInput label="Telefono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} required />
          <FormInput label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />

          <div style={styles.formActions}>
            <button type="button" className="btn btn-outline" onClick={closeModal} disabled={formLoading}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>{formLoading ? 'Guardando...' : 'Guardar Medico'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Eliminar medico"
        message={`Esta accion eliminara a ${deleteTarget?.nombre || 'este medico'} del listado activo.`}
        confirmText="Eliminar"
        loading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

const styles = {
  actions: {
    display: 'flex',
    gap: '0.5rem'
  },
  iconBtn: {
    padding: '0.375rem'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '2rem'
  }
};

export default Medicos;
