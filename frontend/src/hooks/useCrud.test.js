import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import useCrud from './useCrud';
import api from '../services/api';

vi.mock('../services/api');

const endpoint = '/test-resource';
const mockData = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];

describe('useCrud Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Estado inicial', () => {
    it('debe iniciar con loading true cuando autoFetch es true', () => {
      api.get.mockResolvedValue({ data: { data: [] } });

      const { result } = renderHook(() => useCrud(endpoint));

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('debe iniciar con loading false cuando autoFetch es false', () => {
      const { result } = renderHook(() => useCrud(endpoint, { autoFetch: false }));

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('debe normalizar el endpoint con slash', async () => {
      api.get.mockResolvedValue({ data: { data: [] } });

      renderHook(() => useCrud('test-resource'));

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/test-resource', { params: undefined });
      });
    });

    it('debe lanzar error si endpoint esta vacio', () => {
      expect(() => {
        renderHook(() => useCrud(''));
      }).toThrow('El endpoint es requerido');
    });
  });

  describe('getAll', () => {
    it('debe obtener datos exitosamente', async () => {
      api.get.mockResolvedValue({ data: { data: mockData } });

      const { result } = renderHook(() => useCrud(endpoint, { autoFetch: false }));

      await act(async () => {
        await result.current.getAll();
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('debe manejar respuesta sin propiedad data', async () => {
      api.get.mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useCrud(endpoint, { autoFetch: false }));

      await act(async () => {
        await result.current.getAll();
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('debe establecer array vacio si respuesta no es array', async () => {
      api.get.mockResolvedValue({ data: { data: { id: 1 } } });

      const { result } = renderHook(() => useCrud(endpoint, { autoFetch: false }));

      await act(async () => {
        await result.current.getAll();
      });

      expect(result.current.data).toEqual([]);
    });

    it('debe manejar error en getAll', async () => {
      api.get.mockRejectedValue({
        response: { data: { message: 'Error del servidor' } },
      });

      const { result } = renderHook(() => useCrud(endpoint, { autoFetch: false }));

      await act(async () => {
        try { await result.current.getAll(); } catch (_) { /* empty */ }
      });

      expect(result.current.error).toBe('Error del servidor');
      expect(result.current.loading).toBe(false);
    });

    it('debe usar mensaje por defecto si no hay mensaje de error ni error.message', async () => {
      api.get.mockRejectedValue({});

      const { result } = renderHook(() => useCrud(endpoint, { autoFetch: false }));

      await act(async () => {
        try { await result.current.getAll(); } catch (_) { /* empty */ }
      });

      expect(result.current.error).toBe('Error al obtener registros');
    });
  });

  describe('create', () => {
    const newItem = { name: 'New Item' };
    const createdItem = { id: 3, name: 'New Item' };

    it('debe crear un registro exitosamente', async () => {
      api.post.mockResolvedValue({ data: { data: createdItem } });
      api.get.mockResolvedValue({ data: { data: mockData } });

      const { result } = renderHook(() => useCrud(endpoint, { autoFetch: false }));

      await act(async () => {
        const response = await result.current.create(newItem);
        expect(response).toEqual(createdItem);
      });

      expect(api.post).toHaveBeenCalledWith('/test-resource', newItem);
    });

    it('debe refrescar datos despues de crear si refreshAfterMutation es true', async () => {
      api.post.mockResolvedValue({ data: { data: createdItem } });
      api.get.mockResolvedValue({ data: { data: [...mockData, createdItem] } });

      const { result } = renderHook(() => useCrud(endpoint, { autoFetch: false, refreshAfterMutation: true }));

      await act(async () => {
        await result.current.create(newItem);
      });

      expect(api.get).toHaveBeenCalled();
    });

    it('debe manejar error en create', async () => {
      api.post.mockRejectedValue({
        response: { data: { message: 'Error al crear' } },
      });

      const { result } = renderHook(() => useCrud(endpoint, { autoFetch: false }));

      await act(async () => {
        try { await result.current.create(newItem); } catch (_) { /* empty */ }
      });

      expect(result.current.error).toBe('Error al crear');
    });
  });

  describe('update', () => {
    const updatedItem = { id: 1, name: 'Updated Item' };

    it('debe actualizar un registro exitosamente', async () => {
      api.put.mockResolvedValue({ data: { data: updatedItem } });
      api.get.mockResolvedValue({ data: { data: [updatedItem, mockData[1]] } });

      const { result } = renderHook(() => useCrud(endpoint, { autoFetch: false }));

      await act(async () => {
        const response = await result.current.update(1, { name: 'Updated Item' });
        expect(response).toEqual(updatedItem);
      });

      expect(api.put).toHaveBeenCalledWith('/test-resource/1', { name: 'Updated Item' });
    });

    it('debe manejar error en update', async () => {
      api.put.mockRejectedValue({
        response: { data: { message: 'Error de validacion' } },
      });

      const { result } = renderHook(() => useCrud(endpoint, { autoFetch: false }));

      await act(async () => {
        try { await result.current.update(1, {}); } catch (_) { /* empty */ }
      });

      expect(result.current.error).toBe('Error de validacion');
    });
  });

  describe('remove', () => {
    it('debe eliminar un registro exitosamente', async () => {
      api.delete.mockResolvedValue({ data: { data: { id: 1 } } });
      api.get.mockResolvedValue({ data: { data: [mockData[1]] } });

      const { result } = renderHook(() => useCrud(endpoint, { autoFetch: false }));

      await act(async () => {
        await result.current.remove(1);
      });

      expect(api.delete).toHaveBeenCalledWith('/test-resource/1');
    });

    it('debe exponer delete como alias de remove', () => {
      api.get.mockResolvedValue({ data: { data: [] } });

      const { result } = renderHook(() => useCrud(endpoint, { autoFetch: false }));

      expect(result.current.delete).toBe(result.current.remove);
    });

    it('debe manejar error en remove', async () => {
      api.delete.mockRejectedValue({
        response: { data: { message: 'Error al eliminar' } },
      });

      const { result } = renderHook(() => useCrud(endpoint, { autoFetch: false }));

      await act(async () => {
        try { await result.current.remove(1); } catch (_) { /* empty */ }
      });

      expect(result.current.error).toBe('Error al eliminar');
    });
  });

  describe('clearError', () => {
    it('debe limpiar el error', async () => {
      api.get.mockRejectedValue({
        response: { data: { message: 'Error del servidor' } },
      });

      const { result } = renderHook(() => useCrud(endpoint, { autoFetch: false }));

      await act(async () => {
        try { await result.current.getAll(); } catch (_) { /* empty */ }
      });

      expect(result.current.error).toBe('Error del servidor');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('autoFetch', () => {
    it('debe llamar a getAll automaticamente cuando autoFetch es true', async () => {
      api.get.mockResolvedValue({ data: { data: mockData } });

      renderHook(() => useCrud(endpoint));

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/test-resource', { params: undefined });
      });
    });

    it('no debe llamar a getAll cuando autoFetch es false', () => {
      renderHook(() => useCrud(endpoint, { autoFetch: false }));

      expect(api.get).not.toHaveBeenCalled();
    });
  });

  describe('setData', () => {
    it('debe permitir establecer datos manualmente', () => {
      api.get.mockResolvedValue({ data: { data: [] } });

      const { result } = renderHook(() => useCrud(endpoint, { autoFetch: false }));

      act(() => {
        result.current.setData(mockData);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });
});
