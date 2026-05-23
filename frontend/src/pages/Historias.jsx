import { FilePlus2, RefreshCw } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import FeedbackMessage from '../components/FeedbackMessage';
import HistoriaForm from '../components/Historias/HistoriaForm';
import HistoriasList from '../components/Historias/HistoriasList';
import Modal from '../components/Modal';
import api from '../services/api';
import getApiErrorMessage from '../utils/apiError';
import './Historias.css';

const Historias = () => {
  const [historias, setHistorias] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHistoria, setSelectedHistoria] = useState(null);
  const [viewHistoria, setViewHistoria] = useState(null);

  const pacientesById = useMemo(() => {
    return pacientes.reduce((acc, paciente) => {
      acc[paciente.id_paciente] = paciente;
      return acc;
    }, {});
  }, [pacientes]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [historiasResponse, pacientesResponse] = await Promise.all([
        api.get('/historias'),
        api.get('/api/pacientes')
      ]);

      if (historiasResponse.data.success) {
        setHistorias(historiasResponse.data.data);
      }

      if (pacientesResponse.data.success) {
        setPacientes(pacientesResponse.data.data);
      }
    } catch (err) {
      console.error('Error loading historias:', err);
      setError(getApiErrorMessage(err, 'No fue posible cargar las historias clinicas.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateForm = () => {
    setSelectedHistoria(null);
    setIsFormOpen(true);
  };

  const openEditForm = (historia) => {
    setSelectedHistoria(historia);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedHistoria(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (formData) => {
    try {
      setFormLoading(true);
      setError('');

      if (selectedHistoria) {
        await api.put(`/historias/${selectedHistoria.id_historia}`, formData);
      } else {
        await api.post('/historias', formData);
      }

      setSuccess(selectedHistoria ? 'Historia clinica actualizada correctamente.' : 'Historia clinica creada correctamente.');
      closeForm();
      await fetchData();
    } catch (err) {
      console.error('Error saving historia:', err);
      setError(getApiErrorMessage(err, 'No fue posible guardar la historia clinica.'));
    } finally {
      setFormLoading(false);
    }
  };

  const viewedPaciente = viewHistoria
    ? pacientesById[viewHistoria.id_paciente || viewHistoria.paciente]
    : null;

  return (
    <div className="historias-page">
      <header className="historias-header">
        <div>
          <p>Gestion clinica</p>
          <h1>Historias clinicas</h1>
        </div>

        <div className="historias-toolbar">
          <button type="button" className="btn btn-outline" onClick={fetchData} disabled={loading}>
            <RefreshCw size={17} />
            Actualizar
          </button>
          <button type="button" className="btn btn-primary" onClick={openCreateForm}>
            <FilePlus2 size={17} />
            Nueva historia
          </button>
        </div>
      </header>

      <FeedbackMessage
        type="success"
        message={success}
        onClose={() => setSuccess('')}
      />

      <HistoriasList
        historias={historias}
        pacientesById={pacientesById}
        loading={loading}
        error={error}
        onView={setViewHistoria}
        onEdit={openEditForm}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={selectedHistoria ? 'Editar historia clinica' : 'Nueva historia clinica'}
      >
        <HistoriaForm
          pacientes={pacientes}
          historia={selectedHistoria}
          loading={formLoading}
          onCancel={closeForm}
          onSubmit={handleSubmit}
        />
      </Modal>

      <Modal
        isOpen={Boolean(viewHistoria)}
        onClose={() => setViewHistoria(null)}
        title="Detalle de historia clinica"
      >
        {viewHistoria && (
          <div className="historia-detail">
            <div>
              <span>Paciente</span>
              <strong>{viewedPaciente?.nombre || `Paciente #${viewHistoria.paciente}`}</strong>
            </div>
            <div>
              <span>Diagnostico</span>
              <p>{viewHistoria.diagnostico}</p>
            </div>
            <div>
              <span>Tratamiento</span>
              <p>{viewHistoria.tratamiento}</p>
            </div>
            <div>
              <span>Notas medicas</span>
              <p>{viewHistoria.notas_medicas || 'Sin notas registradas.'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Historias;
