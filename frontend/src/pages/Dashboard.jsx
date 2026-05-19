import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';
import { Users, Calendar, Clock, Activity } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Loading message="Cargando panel de control..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard General</h1>
      </div>

      <div style={styles.statsGrid}>
        <StatCard 
          title="Citas de Hoy" 
          value={stats?.citas_hoy || 0} 
          icon={<Calendar color="var(--primary)" size={24} />} 
        />
        <StatCard 
          title="Pacientes Atendidos" 
          value={stats?.pacientes_atendidos_hoy || 0} 
          icon={<Users color="var(--secondary)" size={24} />} 
        />
        <StatCard 
          title="Médicos Disponibles" 
          value={stats?.disponibilidad_medicos?.length || 0} 
          icon={<Activity color="var(--warning)" size={24} />} 
        />
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <Clock size={20} />
          Disponibilidad de Médicos (Próximas 4 horas)
        </h2>
        
        {stats?.disponibilidad_medicos?.length === 0 ? (
          <p style={styles.emptyState}>No hay médicos con turnos próximos.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Médico</th>
                  <th>Citas Programadas</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {stats?.disponibilidad_medicos?.map((medico) => (
                  <tr key={medico.id_medico}>
                    <td>#{medico.id_medico}</td>
                    <td style={{ fontWeight: '500' }}>{medico.nombre}</td>
                    <td>{medico.citas_programadas} citas</td>
                    <td>
                      {medico.citas_programadas > 3 ? (
                        <span className="badge badge-warning">Alta demanda</span>
                      ) : (
                        <span className="badge badge-success">Disponible</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div style={styles.statCard}>
    <div style={styles.statIconWrapper}>{icon}</div>
    <div>
      <p style={styles.statTitle}>{title}</p>
      <h3 style={styles.statValue}>{value}</h3>
    </div>
  </div>
);

const styles = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: 'var(--surface)',
    padding: '1.5rem',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  statIconWrapper: {
    padding: '1rem',
    backgroundColor: 'var(--bg-color)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
  },
  statTitle: {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    marginBottom: '0.25rem',
  },
  statValue: {
    color: 'var(--text-main)',
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: 0,
  },
  section: {
    backgroundColor: 'var(--surface)',
    padding: '1.5rem',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border-color)',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.125rem',
    color: 'var(--text-main)',
    marginBottom: '1.5rem',
  },
  emptyState: {
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '2rem',
  }
};

export default Dashboard;
