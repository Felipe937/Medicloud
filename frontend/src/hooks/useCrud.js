import { useCallback, useEffect, useMemo, useState } from 'react';

import api from '../services/api.js';

const normalizeEndpoint = (endpoint) => {
  if (!endpoint) {
    throw new Error('El endpoint es requerido');
  }

  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};

const getResponseData = (response) => response.data?.data ?? response.data;

const getErrorMessage = (error, fallback) => {
  return error.response?.data?.message || error.message || fallback;
};

const useCrud = (endpoint, options = {}) => {
  const {
    autoFetch = true,
    refreshAfterMutation = true
  } = options;

  const resourceUrl = useMemo(() => normalizeEndpoint(endpoint), [endpoint]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getAll = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(resourceUrl, { params });
      const responseData = getResponseData(response);

      setData(Array.isArray(responseData) ? responseData : []);
      return responseData;
    } catch (err) {
      const message = getErrorMessage(err, 'Error al obtener registros');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [resourceUrl]);

  const create = useCallback(async (payload) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post(resourceUrl, payload);
      const responseData = getResponseData(response);

      if (refreshAfterMutation) {
        await getAll();
      }

      return responseData;
    } catch (err) {
      const message = getErrorMessage(err, 'Error al crear registro');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAll, refreshAfterMutation, resourceUrl]);

  const update = useCallback(async (id, payload) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.put(`${resourceUrl}/${id}`, payload);
      const responseData = getResponseData(response);

      if (refreshAfterMutation) {
        await getAll();
      }

      return responseData;
    } catch (err) {
      const message = getErrorMessage(err, 'Error al actualizar registro');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAll, refreshAfterMutation, resourceUrl]);

  const remove = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.delete(`${resourceUrl}/${id}`);
      const responseData = getResponseData(response);

      if (refreshAfterMutation) {
        await getAll();
      }

      return responseData;
    } catch (err) {
      const message = getErrorMessage(err, 'Error al eliminar registro');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAll, refreshAfterMutation, resourceUrl]);

  useEffect(() => {
    if (autoFetch) {
      getAll();
    }
  }, [autoFetch, getAll]);

  return {
    data,
    setData,
    loading,
    error,
    clearError,
    getAll,
    create,
    update,
    delete: remove,
    remove
  };
};

export default useCrud;
