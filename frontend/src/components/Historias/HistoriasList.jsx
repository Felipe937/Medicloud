import { Edit3, Eye, FileText } from 'lucide-react';
import React from 'react';

const formatDate = (value) => {
  if (!value) return 'Sin fecha';

  return new Date(value).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

const HistoriasList = ({ historias, pacientesById, loading, error, onView, onEdit }) => {
  if (loading) {
    return (
      <div className="historias-loading">
        <div className="historias-spinner" />
        <p>Cargando historias clinicas...</p>
      </div>
    );
  }

  if (error) {
    return <div className="historias-alert">{error}</div>;
  }

  if (historias.length === 0) {
    return (
      <div className="historias-empty">
        <FileText size={44} />
        <h3>No hay historias clinicas</h3>
        <p>Cuando registres una historia, aparecera en este panel.</p>
      </div>
    );
  }

  return (
    <section className="historias-grid" aria-label="Listado de historias clinicas">
      {historias.map((historia) => {
        const pacienteId = historia.id_paciente || historia.paciente;
        const paciente = pacientesById[pacienteId];

        return (
          <article className="historia-card" key={historia.id_historia}>
            <div className="historia-card-header">
              <div>
                <span className="historia-eyebrow">Paciente</span>
                <h3>{paciente?.nombre || `Paciente #${pacienteId}`}</h3>
              </div>
              <span className="historia-date">{formatDate(historia.fecha_creacion)}</span>
            </div>

            <div className="historia-summary">
              <div>
                <span>Diagnostico</span>
                <p>{historia.diagnostico}</p>
              </div>
              <div>
                <span>Tratamiento</span>
                <p>{historia.tratamiento}</p>
              </div>
            </div>

            <div className="historia-actions">
              <button type="button" className="btn btn-outline" onClick={() => onView(historia)}>
                <Eye size={16} />
                Visualizar
              </button>
              <button type="button" className="btn btn-primary" onClick={() => onEdit(historia)}>
                <Edit3 size={16} />
                Editar
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
};

export default HistoriasList;
