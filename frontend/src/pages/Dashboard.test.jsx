import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import Dashboard from './Dashboard';
import api from '../services/api';

vi.mock('../services/api');

const mockStats = {
  totalPacientes: 150,
  totalMedicos: 25,
  totalCitas: 340,
  citasHoy: 12,
  citasPendientes: 8,
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderizado', () => {
    it('debe mostrar estado de carga inicialmente', () => {
      api.get.mockResolvedValue({ data: { success: true, data: mockStats } });

      const { container } = render(<Dashboard />);

      expect(screen.getByText('Cargando dashboard...')).toBeInTheDocument();
      expect(container.querySelector('.dashboard-loading')).toBeInTheDocument();
    });

    it('debe mostrar el header del dashboard tras la carga', async () => {
      api.get.mockResolvedValue({ data: { success: true, data: mockStats } });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      expect(screen.getByText('Resumen hospitalario')).toBeInTheDocument();
    });

    it('debe mostrar las 5 tarjetas de estadisticas', async () => {
      api.get.mockResolvedValue({ data: { success: true, data: mockStats } });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      expect(screen.getByText('Pacientes')).toBeInTheDocument();
      expect(screen.getByText('Medicos')).toBeInTheDocument();
      expect(screen.getByText('Citas')).toBeInTheDocument();
      expect(screen.getByText('Citas hoy')).toBeInTheDocument();
      expect(screen.getByText('Pendientes')).toBeInTheDocument();
    });

    it('debe mostrar la grid de estadisticas', async () => {
      api.get.mockResolvedValue({ data: { success: true, data: mockStats } });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByLabelText('Estadisticas del dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Estadisticas', () => {
    it('debe mostrar los valores formateados correctamente', async () => {
      api.get.mockResolvedValue({ data: { success: true, data: mockStats } });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument();
      });

      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('340')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('debe mostrar las descripciones de cada tarjeta', async () => {
      api.get.mockResolvedValue({ data: { success: true, data: mockStats } });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Registros activos')).toBeInTheDocument();
      });

      expect(screen.getByText('Equipo disponible')).toBeInTheDocument();
      expect(screen.getByText('Agenda historica')).toBeInTheDocument();
      expect(screen.getByText('Atencion del dia')).toBeInTheDocument();
      expect(screen.getByText('Por gestionar')).toBeInTheDocument();
    });

    it('debe mostrar valor 0 cuando stats son null', async () => {
      api.get.mockResolvedValue({ data: { success: true, data: null } });

      render(<Dashboard />);

      await waitFor(() => {
        const zeros = screen.getAllByText('0');
        expect(zeros.length).toBeGreaterThanOrEqual(5);
      });
    });
  });

  describe('Manejo de errores', () => {
    it('debe mostrar mensaje de error cuando la API falla', async () => {
      api.get.mockRejectedValue(new Error('Network Error'));

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('No fue posible conectar con el dashboard.')).toBeInTheDocument();
      });
    });

    it('debe mostrar mensaje cuando la API retorna success false', async () => {
      api.get.mockResolvedValue({ data: { success: false } });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('No fue posible cargar las estadisticas.')).toBeInTheDocument();
      });
    });
  });

  describe('Llamada a la API', () => {
    it('debe llamar al endpoint /dashboard/stats al montar', async () => {
      api.get.mockResolvedValue({ data: { success: true, data: mockStats } });

      render(<Dashboard />);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/dashboard/stats');
      });

      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });
});
