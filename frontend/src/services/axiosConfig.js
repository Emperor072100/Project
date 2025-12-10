import axios from 'axios';
import toast from 'react-hot-toast';
import { authService } from './authService';

// Determinar la URL base según el entorno
const API_URL = import.meta.env.VITE_API_URL;

// Resolver la URL final y prevenir "Mixed Content" cuando la app está en HTTPS
const resolveApiUrl = () => {
  let url = API_URL || '';

  try {
    if (typeof window !== 'undefined' && window.location) {
      const isHttps = window.location.protocol === 'https:';
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      console.log('🌍 Entorno detectado:', {
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        isProduction,
        configuredUrl: url,
        finalUrl: url || '/api'
      });
      
      // MODO 1: Si hay URL configurada, usarla directamente (llamadas browser -> backend)
      if (url && url.trim()) {
        console.info(`🔗 Usando URL configurada: ${url}`);
        return url;
      }
      
      // MODO 2: Sin URL configurada, usar proxy nginx (frontend nginx -> backend)
      // Esto requiere que nginx.conf tenga location /api/ configurado
      console.info('🔄 Usando proxy /api (nginx redirige al backend)');
      return '/api';
    }
  } catch (e) {
    // En entornos de build/server donde `window` no existe, no hacer nada
    console.warn('⚠️ No se pudo acceder a window.location:', e.message || e);
  }

  // Fallback: Si no hay URL explícita, usar rutas relativas
  return url || '/api';
};

const RESOLVED_API_URL = resolveApiUrl();

// Crear una instancia de axios con baseURL dinámica
const axiosInstance = axios.create({
  timeout: 30000, // 30 segundos timeout
});

// Interceptor para resolver la URL dinámicamente en cada petición
axiosInstance.interceptors.request.use(
  config => {
    // Resolver la baseURL dinámicamente si no está establecida
    if (!config.baseURL) {
      const dynamicBaseURL = resolveApiUrl();
      config.baseURL = dynamicBaseURL;
      console.log('🔗 Usando baseURL:', dynamicBaseURL, 'para URL:', config.url);
    }
    
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