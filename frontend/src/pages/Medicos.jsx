import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import Loading from '../components/Loading';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Medicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMedico, setCurrentMedico] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '', especialidad: '', telefono: '', email: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchMedicos();
  }, []);

  const fetchMedicos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medicos');
      if (response.data.success) {
        setMedicos(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching medicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (medico = null) => {
    if (medico) {
      setCurrentMedico(medico);
      setFormData({
        nombre: medico.nombre,
        especialidad: medico.especialidad,
        telefono: medico.telefono,
        email: medico.email
      });
    } else {
      setCurrentMedico(null);
      setFormData({ nombre: '', especialidad: '', telefono: '', email: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      if (currentMedico) {
        await api.put(`/medicos/${currentMedico.id_medico}`, formData);
      } else {
        await api.post('/medicos', formData);
      }
      setIsModalOpen(false);
      fetchMedicos();
    } catch (error) {
      console.error('Error saving medico:', error);
      alert('Error al guardar el médico');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este médico?')) {
      try {
        await api.delete(`/medicos/${id}`);
        fetchMedicos();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  if (loading && medicos.length === 0) return <Loading message="Cargando médicos..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Gestión de Médicos</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Nuevo Médico
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Especialidad</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {medicos.map((medico) => (
              <tr key={medico.id_medico}>
                <td>#{medico.id_medico}</td>
                <td style={{ fontWeight: '500' }}>{medico.nombre}</td>
                <td><span className="badge badge-success">{medico.especialidad}</span></td>
                <td>{medico.telefono}</td>
                <td>{medico.email}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.375rem' }} onClick={() => openModal(medico)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.375rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(medico.id_medico)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {medicos.length === 0 && !loading && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No se encontraron médicos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentMedico ? 'Editar Médico' : 'Nuevo Médico'}
      >
        <form onSubmit={handleSubmit}>
          <FormInput 
            label="Nombre Completo" 
            value={formData.nombre} 
            onChange={e => setFormData({...formData, nombre: e.target.value})} 
            required 
          />
          <FormInput 
            label="Especialidad" 
            value={formData.especialidad} 
            onChange={e => setFormData({...formData, especialidad: e.target.value})} 
            required 
          />
          <FormInput 
            label="Teléfono" 
            value={formData.telefono} 
            onChange={e => setFormData({...formData, telefono: e.target.value})} 
            required 
          />
          <FormInput 
            label="Email" 
            type="email"
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required 
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Guardando...' : 'Guardar Médico'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Medicos;
