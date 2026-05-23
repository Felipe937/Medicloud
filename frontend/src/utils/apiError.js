const getApiErrorMessage = (error, fallback = 'Ocurrio un error inesperado.') => {
  const apiMessage = error?.response?.data?.message;
  const validationErrors = error?.response?.data?.errors;

  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors.map((item) => item.message || item.msg).filter(Boolean).join(' ');
  }

  return apiMessage || error?.message || fallback;
};

export default getApiErrorMessage;
