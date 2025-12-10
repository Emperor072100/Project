import axiosInstance from './axiosConfig';

// Ejemplo de implementación faltante

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  localStorage.setItem('token', response.data.access_token);
  return response.data;
};