import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import Loading from '../components/Loading';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPaciente, setCurrentPaciente] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    documento: '', nombre: '', fecha_nacimiento: '', telefono: '', direccion: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pacientes');
      if (response.data.success) {
        setPacientes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      fetchPacientes();
      return;
    }

    try {
      const response = await api.get(`/pacientes/search?q=${value}`);
      if (response.data.success) {
        setPacientes(response.data.data);
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const openModal = (paciente = null) => {
    if (paciente) {
      setCurrentPaciente(paciente);
      setFormData({
        documento: paciente.documento,
        nombre: paciente.nombre,
        fecha_nacimiento: paciente.fecha_nacimiento.split('T')[0], // format for input date
        telefono: paciente.telefono,
        direccion: paciente.direccion
      });
    } else {
      setCurrentPaciente(null);
      setFormData({ documento: '', nombre: '', fecha_nacimiento: '', telefono: '', direccion: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      if (currentPaciente) {
        await api.put(`/pacientes/${currentPaciente.id_paciente}`, formData);
      } else {
        await api.post('/pacientes', formData);
      }
      setIsModalOpen(false);
      fetchPacientes();
    } catch (error) {
      console.error('Error saving paciente:', error);
      alert('Error al guardar el paciente');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este paciente?')) {
      try {
        await api.delete(`/pacientes/${id}`);
        fetchPacientes();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  if (loading && pacientes.length === 0) return <Loading message="Cargando pacientes..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Gestión de Pacientes</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Nuevo Paciente
        </button>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Buscar por documento, nombre o fecha..." 
            value={searchTerm}
            onChange={handleSearch}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((paciente) => (
              <tr key={paciente.id_paciente}>
                <td>{paciente.documento}</td>
                <td style={{ fontWeight: '500' }}>{paciente.nombre}</td>
                <td>{paciente.telefono}</td>
                <td>{paciente.email}</td>
                <td>
                  <div style={styles.actions}>
                    <button className="btn btn-outline" style={styles.iconBtn} onClick={() => openModal(paciente)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-outline" style={{...styles.iconBtn, color: 'var(--danger)', borderColor: 'var(--danger)'}} onClick={() => handleDelete(paciente.id_paciente)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pacientes.length === 0 && !loading && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No se encontraron pacientes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}
      >
        <form onSubmit={handleSubmit}>
          {!currentPaciente && (
            <FormInput 
              label="Nombre Completo" 
              value={formData.nombre} 
              onChange={e => setFormData({...formData, nombre: e.target.value})} 
              required 
            />
          )}
          <FormInput 
            label="Documento de Identidad" 
            value={formData.documento} 
            onChange={e => setFormData({...formData, documento: e.target.value})} 
            required 
          />
          {!currentPaciente && (
            <FormInput 
              label="Fecha de Nacimiento" 
              type="date"
              value={formData.fecha_nacimiento} 
              onChange={e => setFormData({...formData, fecha_nacimiento: e.target.value})} 
              required 
            />
          )}
          <FormInput 
            label="Teléfono" 
            value={formData.telefono} 
            onChange={e => setFormData({...formData, telefono: e.target.value})} 
            required 
          />
          <FormInput 
            label="Dirección" 
            value={formData.direccion} 
            onChange={e => setFormData({...formData, direccion: e.target.value})} 
            required 
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Guardando...' : 'Guardar Paciente'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const styles = {
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
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
    maxWidth: '400px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '0.875rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  iconBtn: {
    padding: '0.375rem',
  }
};

export default Pacientes;
