import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
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
  documento: '',
  nombre: '',
  fecha_nacimiento: '',
  telefono: '',
  direccion: ''
};

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPaciente, setCurrentPaciente] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/pacientes');
      if (response.data.success) {
        setPacientes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching pacientes:', error);
      setFeedback({ type: 'error', message: getApiErrorMessage(error, 'No fue posible cargar los pacientes.') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const handleSearch = async (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      fetchPacientes();
      return;
    }

    try {
      const response = await api.get('/api/pacientes/search', { params: { q: value } });
      if (response.data.success) {
        setPacientes(response.data.data);
      }
    } catch (error) {
      console.error('Error searching pacientes:', error);
      setFeedback({ type: 'error', message: getApiErrorMessage(error, 'No fue posible buscar pacientes.') });
    }
  };

  const openModal = (paciente = null) => {
    setCurrentPaciente(paciente);
    setFormData(paciente ? {
      documento: paciente.documento || '',
      nombre: paciente.nombre || '',
      fecha_nacimiento: paciente.fecha_nacimiento?.split('T')[0] || '',
      telefono: paciente.telefono || '',
      direccion: paciente.direccion || ''
    } : emptyForm);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPaciente(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setFormLoading(true);
      if (currentPaciente) {
        await api.put(`/api/pacientes/${currentPaciente.id_paciente}`, formData);
      } else {
        await api.post('/api/pacientes', formData);
      }

      setFeedback({
        type: 'success',
        message: currentPaciente ? 'Paciente actualizado correctamente.' : 'Paciente creado correctamente.'
      });
      await fetchPacientes();
    } catch (error) {
      console.error('Error saving paciente:', error);
      setFeedback({ type: 'error', message: getApiErrorMessage(error, 'Error al guardar el paciente.') });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await api.delete(`/api/pacientes/${deleteTarget.id_paciente}`);
      setFeedback({ type: 'success', message: 'Paciente eliminado correctamente.' });
      setDeleteTarget(null);
      await fetchPacientes();
    } catch (error) {
      console.error('Error deleting paciente:', error);
      setFeedback({ type: 'error', message: getApiErrorMessage(error, 'Error al eliminar el paciente.') });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && pacientes.length === 0) {
    return <Loading message="Cargando pacientes..." />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Gestion de Pacientes</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Nuevo Paciente
        </button>
      </div>

      <FeedbackMessage
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: '', message: '' })}
      />

      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="search"
            placeholder="Buscar por documento, nombre o fecha..."
            value={searchTerm}
            onChange={handleSearch}
            style={styles.searchInput}
          />
        </div>
      </div>

      {pacientes.length === 0 ? (
        <EmptyState title="No hay pacientes" message="Crea un paciente o ajusta la busqueda para ver resultados." />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre</th>
                <th>Telefono</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((paciente) => (
                <tr key={paciente.id_paciente}>
                  <td>{paciente.documento}</td>
                  <td style={{ fontWeight: 500 }}>{paciente.nombre}</td>
                  <td>{paciente.telefono}</td>
                  <td>{paciente.email}</td>
                  <td>
                    <div style={styles.actions}>
                      <button className="btn btn-outline" style={styles.iconBtn} onClick={() => openModal(paciente)} title="Editar paciente">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-outline" style={{ ...styles.iconBtn, color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setDeleteTarget(paciente)} title="Eliminar paciente">
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}>
        <form onSubmit={handleSubmit}>
          {!currentPaciente && (
            <FormInput label="Nombre Completo" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
          )}
          <FormInput label="Documento de Identidad" value={formData.documento} onChange={(e) => setFormData({ ...formData, documento: e.target.value })} required />
          {!currentPaciente && (
            <FormInput label="Fecha de Nacimiento" type="date" value={formData.fecha_nacimiento} onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })} required />
          )}
          <FormInput label="Telefono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} required />
          <FormInput label="Direccion" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} required />

          <div style={styles.formActions}>
            <button type="button" className="btn btn-outline" onClick={closeModal} disabled={formLoading}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>{formLoading ? 'Guardando...' : 'Guardar Paciente'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Eliminar paciente"
        message={`Esta accion eliminara a ${deleteTarget?.nombre || 'este paciente'} del listado activo.`}
        confirmText="Eliminar"
        loading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

const styles = {
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1.5rem'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '0.5rem 1rem',
    width: '100%',
    maxWidth: '400px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '0.875rem',
    background: 'transparent'
  },
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

export default Pacientes;
