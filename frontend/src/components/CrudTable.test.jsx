import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import CrudTable from './CrudTable';

describe('CrudTable Component', () => {
  let mockColumns;
  let mockData;
  let mockOnEdit;
  let mockOnDelete;

  beforeEach(() => {
    mockOnEdit = vi.fn();
    mockOnDelete = vi.fn();

    mockColumns = [
      { header: 'Nombre', accessor: 'name' },
      { header: 'Email', accessor: 'email' },
      { header: 'Edad', accessor: 'age' },
    ];

    mockData = [
      { id: 1, name: 'Juan Pérez', email: 'juan@example.com', age: 30 },
      { id: 2, name: 'María García', email: 'maria@example.com', age: 28 },
      { id: 3, name: 'Carlos López', email: 'carlos@example.com', age: 35 },
    ];
  });

  describe('Renderizado', () => {
    it('debe renderizar la tabla correctamente', () => {
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
        />
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('debe mostrar los encabezados de columnas', () => {
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
        />
      );

      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Edad')).toBeInTheDocument();
    });

    it('debe renderizar todas las filas de datos', () => {
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
        />
      );

      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('María García')).toBeInTheDocument();
      expect(screen.getByText('Carlos López')).toBeInTheDocument();
    });

    it('debe renderizar los valores de las celdas correctamente', () => {
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
        />
      );

      expect(screen.getByText('juan@example.com')).toBeInTheDocument();
      expect(screen.getByText('maria@example.com')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
    });

    it('debe mostrar mensaje de vacío cuando no hay datos', () => {
      const emptyMessage = 'No hay pacientes registrados';
      render(
        <CrudTable
          columns={mockColumns}
          data={[]}
          emptyMessage={emptyMessage}
        />
      );

      expect(screen.getByText(emptyMessage)).toBeInTheDocument();
    });

    it('debe mostrar mensaje de vacío por defecto', () => {
      render(
        <CrudTable
          columns={mockColumns}
          data={[]}
        />
      );

      expect(screen.getByText('No hay registros disponibles.')).toBeInTheDocument();
    });
  });

  describe('Búsqueda y Filtrado', () => {
    it('debe filtrar datos según el término de búsqueda', async () => {
      const user = userEvent.setup();
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
          searchPlaceholder="Buscar personas..."
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar personas...');
      await user.type(searchInput, 'Juan');

      // Juan Pérez debe estar visible
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      // Los otros nombres no deben estar visibles
      expect(screen.queryByText('María García')).not.toBeInTheDocument();
      expect(screen.queryByText('Carlos López')).not.toBeInTheDocument();
    });

    it('debe buscar en múltiples campos', async () => {
      const user = userEvent.setup();
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar...');
      await user.type(searchInput, 'maria@example.com');

      expect(screen.getByText('María García')).toBeInTheDocument();
      expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
    });

    it('debe ser insensible a mayúsculas', async () => {
      const user = userEvent.setup();
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar...');
      await user.type(searchInput, 'JUAN');

      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    it('debe mostrar todos los datos cuando se limpia la búsqueda', async () => {
      const user = userEvent.setup();
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar...');
      await user.type(searchInput, 'Juan');
      expect(screen.queryByText('María García')).not.toBeInTheDocument();

      await user.clear(searchInput);
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('María García')).toBeInTheDocument();
      expect(screen.getByText('Carlos López')).toBeInTheDocument();
    });

    it('debe mostrar mensaje de vacío cuando la búsqueda no tiene resultados', async () => {
      const user = userEvent.setup();
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
          emptyMessage="No se encontraron resultados"
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar...');
      await user.type(searchInput, 'XYZ123');

      expect(screen.getByText('No se encontraron resultados')).toBeInTheDocument();
    });
  });

  describe('Acciones', () => {
    it('debe mostrar botón de edición cuando se proporciona onEdit', () => {
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
          onEdit={mockOnEdit}
        />
      );

      const editButtons = screen.getAllByTitle('Editar');
      expect(editButtons.length).toBe(mockData.length);
    });

    it('debe mostrar botón de eliminación cuando se proporciona onDelete', () => {
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByTitle('Eliminar');
      expect(deleteButtons.length).toBe(mockData.length);
    });

    it('debe no mostrar columna de acciones cuando no hay onEdit ni onDelete', () => {
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
        />
      );

      const table = screen.getByRole('table');
      const headers = within(table).getAllByRole('columnheader');
      
      // No debe haber columna de acciones
      expect(headers).not.toContainEqual(
        expect.objectContaining({ textContent: 'Acciones' })
      );
    });

    it('debe llamar a onEdit con la fila correcta', async () => {
      const user = userEvent.setup();
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
          onEdit={mockOnEdit}
        />
      );

      const editButtons = screen.getAllByTitle('Editar');
      await user.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(mockData[0]);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('debe llamar a onDelete con la fila correcta', async () => {
      const user = userEvent.setup();
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByTitle('Eliminar');
      await user.click(deleteButtons[1]);

      expect(mockOnDelete).toHaveBeenCalledWith(mockData[1]);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('debe permitir múltiples clics en acciones', async () => {
      const user = userEvent.setup();
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
          onEdit={mockOnEdit}
        />
      );

      const editButtons = screen.getAllByTitle('Editar');
      await user.click(editButtons[0]);
      await user.click(editButtons[1]);
      await user.click(editButtons[2]);

      expect(mockOnEdit).toHaveBeenCalledTimes(3);
      expect(mockOnEdit).toHaveBeenNthCalledWith(1, mockData[0]);
      expect(mockOnEdit).toHaveBeenNthCalledWith(2, mockData[1]);
      expect(mockOnEdit).toHaveBeenNthCalledWith(3, mockData[2]);
    });
  });

  describe('Estados de carga', () => {
    it('debe mostrar indicador de carga cuando loading es true', () => {
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
          loading={true}
        />
      );

      expect(screen.getByText('Cargando registros...')).toBeInTheDocument();
    });

    it('debe mostrar tabla cuando loading es false', () => {
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
          loading={false}
        />
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.queryByText('Cargando registros...')).not.toBeInTheDocument();
    });

    it('debe ocultarse tabla durante carga', () => {
      const { rerender } = render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
          loading={false}
        />
      );

      expect(screen.getByRole('table')).toBeInTheDocument();

      rerender(
        <CrudTable
          columns={mockColumns}
          data={mockData}
          loading={true}
        />
      );

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.getByText('Cargando registros...')).toBeInTheDocument();
    });
  });

  describe('Columnas personalizadas', () => {
    it('debe renderizar columnas con render personalizado', () => {
      const customColumns = [
        {
          header: 'Nombre',
          accessor: 'name',
          render: (row) => `${row.name.toUpperCase()}`,
        },
        { header: 'Email', accessor: 'email' },
      ];

      render(
        <CrudTable
          columns={customColumns}
          data={mockData}
        />
      );

      expect(screen.getByText('JUAN PÉREZ')).toBeInTheDocument();
      expect(screen.getByText('MARÍA GARCÍA')).toBeInTheDocument();
    });

    it('debe manejar valores undefined en las celdas', () => {
      const dataWithMissing = [
        { id: 1, name: 'Juan Pérez', email: 'juan@example.com' },
        { id: 2, name: 'María García' },
      ];

      render(
        <CrudTable
          columns={mockColumns}
          data={dataWithMissing}
        />
      );

      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('María García')).toBeInTheDocument();
    });
  });

  describe('Key de fila personalizada', () => {
    it('debe usar rowKey como identificador de fila', () => {
      const dataWithCustomKey = [
        { uuid: 'abc-1', name: 'Juan Pérez', email: 'juan@example.com', age: 30 },
        { uuid: 'abc-2', name: 'María García', email: 'maria@example.com', age: 28 },
      ];

      const { container } = render(
        <CrudTable
          columns={mockColumns}
          data={dataWithCustomKey}
          rowKey="uuid"
        />
      );

      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(2);
    });
  });

  describe('Input de búsqueda', () => {
    it('debe mostrar el placeholder de búsqueda personalizado', () => {
      const customPlaceholder = 'Buscar médicos...';
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
          searchPlaceholder={customPlaceholder}
        />
      );

      expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
    });

    it('debe permitir escribir en el input de búsqueda', async () => {
      const user = userEvent.setup();
      render(
        <CrudTable
          columns={mockColumns}
          data={mockData}
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar...');
      await user.type(searchInput, 'test search');

      expect(searchInput.value).toBe('test search');
    });
  });
});
