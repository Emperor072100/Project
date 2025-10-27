import axios from 'axios';

// Ejemplo de implementación faltante
const API_URL = import.meta.env.VITE_API_URL;

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  localStorage.setItem('token', response.data.access_token);
  return response.data;
};