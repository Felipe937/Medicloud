import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import Loading from '../components/Loading';
import { FileText, Plus, Search } from 'lucide-react';

const Historias = () => {
  const [pacientes, setPacientes] = useState([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState('');
  
  const [historias, setHistorias] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoContenido, setNuevoContenido] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    // Fetch pacientes to populate select
    const fetchPacientes = async () => {
      try {
        const response = await api.get('/pacientes');
        if (response.data.success) {
          setPacientes(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching pacientes:', error);
      }
    };
    fetchPacientes();
  }, []);

  useEffect(() => {
    if (selectedPacienteId) {
      fetchHistorias(selectedPacienteId);
    } else {
      setHistorias([]);
    }
  }, [selectedPacienteId]);

  const fetchHistorias = async (idPaciente) => {
    try {
      setLoading(true);
      const response = await api.get(`/historias/paciente/${idPaciente}`);
      if (response.data.success) {
        setHistorias(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching historias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPacienteId) {
      alert("Seleccione un paciente primero");
      return;
    }

    setFormLoading(true);
    try {
      await api.post('/historias', {
        id_paciente: selectedPacienteId,
        contenido: nuevoContenido
      });
      setIsModalOpen(false);
      setNuevoContenido('');
      fetchHistorias(selectedPacienteId); // Refresh
    } catch (error) {
      console.error('Error saving historia:', error);
      alert('Error al guardar la historia clínica');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Historias Clínicas</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setIsModalOpen(true)}
          disabled={!selectedPacienteId}
        >
          <Plus size={18} /> Agregar Registro
        </button>
      </div>

      <div style={styles.selectorContainer}>
        <div className="form-group" style={{ maxWidth: '400px', margin: 0 }}>
          <label className="form-label">Seleccionar Paciente</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', marginLeft: '10px' }} />
            <select 
              className="form-control"
              style={{ paddingLeft: '2rem' }}
              value={selectedPacienteId}
              onChange={(e) => setSelectedPacienteId(e.target.value)}
            >
              <option value="">-- Seleccione para ver historial --</option>
              {pacientes.map(p => (
                <option key={p.id_paciente} value={p.id_paciente}>{p.nombre} ({p.documento})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!selectedPacienteId ? (
        <div style={styles.emptyState}>
          <FileText size={48} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
          <h3>No hay paciente seleccionado</h3>
          <p>Seleccione un paciente en la lista superior para ver su historial médico.</p>
        </div>
      ) : loading ? (
        <Loading message="Cargando historial cifrado..." />
      ) : (
        <div style={styles.timeline}>
          {historias.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>El paciente seleccionado no tiene registros en su historia clínica.</p>
          ) : (
            historias.map(historia => (
              <div key={historia.id_historia} style={styles.timelineItem}>
                <div style={styles.timelineDate}>
                  {new Date(historia.fecha_creacion).toLocaleDateString()} a las {new Date(historia.fecha_creacion).toLocaleTimeString()}
                </div>
                <div style={styles.timelineContent}>
                  {historia.contenido}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Nuevo Registro Clínico"
      >
        <form onSubmit={handleSubmit}>
          <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Este registro será <strong>cifrado</strong> en la base de datos automáticamente (AES-256).
          </p>
          <FormInput 
            label="Contenido / Observaciones Médicas" 
            type="textarea"
            value={nuevoContenido} 
            onChange={e => setNuevoContenido(e.target.value)} 
            required 
            style={{ minHeight: '200px', resize: 'vertical' }}
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Cifrando y Guardando...' : 'Guardar Registro'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const styles = {
  selectorContainer: {
    backgroundColor: 'var(--surface)',
    padding: '1.5rem',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border-color)',
    marginBottom: '2rem'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
    backgroundColor: 'var(--surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px dashed var(--border-color)',
    color: 'var(--text-muted)',
    textAlign: 'center'
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  timelineItem: {
    backgroundColor: 'var(--surface)',
    padding: '1.5rem',
    borderRadius: 'var(--radius-md)',
    borderLeft: '4px solid var(--primary)',
    boxShadow: 'var(--shadow-sm)'
  },
  timelineDate: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--primary)',
    marginBottom: '0.5rem',
    textTransform: 'uppercase'
  },
  timelineContent: {
    color: 'var(--text-main)',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap'
  }
};

export default Historias;
