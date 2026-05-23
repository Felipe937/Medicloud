import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import HistoriaForm from './HistoriaForm';

describe('HistoriaForm Component', () => {
  let mockPacientes;
  let mockOnSubmit;
  let mockOnCancel;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
    mockOnCancel = vi.fn();

    mockPacientes = [
      { id_paciente: 1, nombre: 'Juan Pérez', documento: '12345678' },
      { id_paciente: 2, nombre: 'María García', documento: '87654321' },
    ];
  });

  describe('Renderizado', () => {
    it('debe renderizar el formulario correctamente', () => {
      const { container } = render(
        <HistoriaForm
          pacientes={mockPacientes}
          loading={false}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      expect(container.querySelector('form.historia-form')).toBeInTheDocument();
    });

    it('debe mostrar el selector de pacientes', () => {
      render(
        <HistoriaForm
          pacientes={mockPacientes}
          loading={false}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByLabelText(/paciente/i)).toBeInTheDocument();
    });

    it('debe listar los pacientes en el selector', () => {
      render(
        <HistoriaForm
          pacientes={mockPacientes}
          loading={false}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3); // placeholder + 2 pacientes
      expect(screen.getByText('Juan Pérez (12345678)')).toBeInTheDocument();
      expect(screen.getByText('María García (87654321)')).toBeInTheDocument();
    });

    it('debe mostrar los campos de texto', () => {
      render(
        <HistoriaForm
          pacientes={mockPacientes}
          loading={false}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByLabelText(/diagnostico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tratamiento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notas medicas/i)).toBeInTheDocument();
    });

    it('debe mostrar botones de accion', () => {
      render(
        <HistoriaForm
          pacientes={mockPacientes}
          loading={false}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /crear historia/i })).toBeInTheDocument();
    });

    it('debe mostrar boton de actualizar en modo edicion', () => {
      render(
        <HistoriaForm
          pacientes={mockPacientes}
          historia={{ id_historia: 1, id_paciente: 1, diagnostico: 'Gripe', tratamiento: 'Reposo' }}
          loading={false}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByRole('button', { name: /actualizar historia/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /crear historia/i })).not.toBeInTheDocument();
    });
  });

  describe('Inputs', () => {
    it('debe permitir seleccionar un paciente', async () => {
      const user = userEvent.setup();
      render(
        <HistoriaForm
          pacientes={mockPacientes}
          loading={false}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      const select = screen.getByLabelText(/paciente/i);
      await user.selectOptions(select, '1');
      expect(select.value).toBe('1');
    });

    it('debe permitir escribir diagnostico', async () => {
      const user = userEvent.setup();
      render(
        <HistoriaForm
          pacientes={mockPacientes}
          loading={false}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByLabelText(/diagnostico/i);
      await user.type(input, 'Hipertensión arterial');
      expect(input.value).toBe('Hipertensión arterial');
    });

    it('debe permitir escribir tratamiento', async () => {
      const user = userEvent.setup();
      render(
        <HistoriaForm
          pacientes={mockPacientes}
          loading={false}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByLabelText(/tratamiento/i);
      await user.type(input, 'Enalapril 10mg');
      expect(input.value).toBe('Enalapril 10mg');
    });

    it('debe permitir escribir notas medicas', async () => {
      const user = userEvent.setup();
      render(
        <HistoriaForm
          pacientes={mockPacientes}
          loading={false}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByLabelText(/notas medicas/i);
      await user.type(input, 'Paciente estable');
      expect(input.value).toBe('Paciente estable');
    });
  });

  describe('Edicion', () => {
    it('debe precargar datos cuando se proporciona historia', () => {
      render(
        <HistoriaForm
          pacientes={mockPacientes}
          historia={{
            id_historia: 1,
            id_paciente: 2,
            diagnostico: 'Diabetes tipo 2',
            tratamiento: 'Metformina',
            notas_medicas: 'Control en 3 meses'
          }}
          loading={false}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByLabelText(/diagnostico/i).value).toBe('Diabetes tipo 2');
      expect(screen.getByLabelText(/tratamiento/i).value).toBe('Metformina');
      expect(screen.getByLabelText(/notas medicas/i).value).toBe('Control en 3 meses');
      expect(screen.getByLabelText(/paciente/i).value).toBe('2');
    });

    it('debe limpiar el formulario cuando historia es null', () => {
      const { rerender } = render(
        <HistoriaForm
          pacientes={mockPacientes}
          historia={{
            id_historia: 1,
            id_paciente: 1,
            diagnostico: 'Gripe',
            tratamiento: 'Reposo',
          }}
          loading={false}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByLabelText(/diagnostico/i).value).toBe('Gripe');

      rerender(
        <HistoriaForm
          pacientes={mockPacientes}
          historia={null}
          loading={false}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByLabelText(/diagnostico/i).value).toBe('');
      expect(screen.getByLabelText(/paciente/i).value).toBe('');
    });
  });

  describe('Envio', () => {
    it('debe llamar a onSubmit con los datos del formulario', async () => {
      const user = userEvent.setup();
      render(
        <HistoriaForm
          pacientes={mockPacientes}
          loading={false}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      await user.selectOptions(screen.getByLabelText(/paciente/i), '1');
      await user.type(screen.getByLabelText(/diagnostico/i), 'Migraña');
      await user.type(screen.getByLabelText(/tratamiento/i), 'Ibuprofeno');
      await user.type(screen.getByLabelText(/notas medicas/i), 'Seguimiento en 2 semanas');
      await user.click(screen.getByRole('button', { name: /crear historia/i }));

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        paciente: '1',
        diagnostico: 'Migraña',
        tratamiento: 'Ibuprofeno',
        notas_medicas: 'Seguimiento en 2 semanas'
      });
    });

    it('debe deshabilitar botones durante carga', () => {
      render(
        <HistoriaForm
          pacientes={mockPacientes}
          loading={true}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled();
    });
  });

  describe('Cancelar', () => {
    it('debe llamar a onCancel al hacer clic en cancelar', async () => {
      const user = userEvent.setup();
      render(
        <HistoriaForm
          pacientes={mockPacientes}
          loading={false}
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
        />
      );

      await user.click(screen.getByRole('button', { name: /cancelar/i }));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });
});
