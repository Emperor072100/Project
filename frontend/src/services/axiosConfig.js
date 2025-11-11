import axios from 'axios';
import toast from 'react-hot-toast';
import { authService } from './authService';

// Determinar la URL base según el entorno
const API_URL = import.meta.env.VITE_API_URL;

// Crear una instancia de axios
const axiosInstance = axios.create({
  baseURL: API_URL
});

// Interceptor de solicitud que añade automáticamente el token
axiosInstance.interceptors.request.use(
  config => {
    // Obtener token del almacenamiento
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // Si hay token, añadirlo al header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejar errores comunes
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Manejar error 401 (No autorizado)
      if (error.response.status === 401) {
        console.log('❌ Error 401: Sesión expirada o token inválido');
        
        // Limpiar tokens solo una vez
        const hasToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (hasToken) {
          console.log('🧹 Limpiando tokens de autenticación');
          authService.logout();
          
          // Notificar al usuario
          toast.error('Sesión expirada. Redirigiendo a login...');
          
          // Usar la función controlada de redirección
          authService.redirectToLogin();
        } else {
          console.log('🚫 No hay tokens para limpiar');
        }
      }
      
      // Manejar error 403 (Prohibido)
      if (error.response.status === 403) {
        toast.error('No tienes permiso para realizar esta acción');
      }
      
      // Manejar error 500 (Error del servidor)
      if (error.response.status >= 500) {
        toast.error('Error del servidor. Intenta más tarde');
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      toast.error('No se pudo conectar con el servidor');
    } else {
      // Algo ocurrió al configurar la solicitud
      toast.error('Error al enviar la solicitud');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;