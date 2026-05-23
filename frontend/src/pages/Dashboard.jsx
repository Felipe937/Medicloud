import {
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  Stethoscope,
  Users
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import api from '../services/api';
import './Dashboard.css';

const formatNumber = (value) => new Intl.NumberFormat('es-CO').format(value || 0);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/api/dashboard/stats');

        if (response.data.success) {
          setStats(response.data.data);
          return;
        }

        setError('No fue posible cargar las estadisticas.');
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('No fue posible conectar con el dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = useMemo(() => {
    const safeStats = stats || {};

    return [
      {
        title: 'Pacientes',
        value: safeStats.totalPacientes,
        description: 'Registros activos',
        icon: Users,
        variant: 'blue'
      },
      {
        title: 'Medicos',
        value: safeStats.totalMedicos,
        description: 'Equipo disponible',
        icon: Stethoscope,
        variant: 'green'
      },
      {
        title: 'Citas',
        value: safeStats.totalCitas,
        description: 'Agenda historica',
        icon: ClipboardList,
        variant: 'indigo'
      },
      {
        title: 'Citas hoy',
        value: safeStats.citasHoy,
        description: 'Atencion del dia',
        icon: CalendarCheck,
        variant: 'amber'
      },
      {
        title: 'Pendientes',
        value: safeStats.citasPendientes,
        description: 'Por gestionar',
        icon: CalendarClock,
        variant: 'rose'
      }
    ];
  }, [stats]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner" />
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-kicker">Resumen hospitalario</p>
          <h1>Dashboard</h1>
        </div>
      </header>

      {error && <div className="dashboard-error">{error}</div>}

      <section className="dashboard-grid" aria-label="Estadisticas del dashboard">
        {cards.map((card, index) => (
          <StatCard key={card.title} index={index} {...card} />
        ))}
      </section>
    </div>
  );
};

const StatCard = ({ title, value, description, icon: Icon, variant, index }) => (
  <article
    className={`dashboard-card dashboard-card-${variant}`}
    style={{ animationDelay: `${index * 70}ms` }}
  >
    <div className="dashboard-card-icon">
      <Icon size={24} strokeWidth={2.2} />
    </div>

    <div className="dashboard-card-content">
      <span>{title}</span>
      <strong>{formatNumber(value)}</strong>
      <small>{description}</small>
    </div>
  </article>
);

export default Dashboard;
