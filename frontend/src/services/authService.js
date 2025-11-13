import axiosInstance from './axiosConfig';

// Flag para prevenir múltiples redirecciones
let redirectingToLogin = false;

export const authService = {
  // Iniciar sesión
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    console.log('🔐 Intentando login...');
    
    try {
      const response = await axiosInstance.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Login exitoso');
      return response.data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Error al iniciar sesión';
      throw new Error(errorMessage);
    }
  },
  
  // Cerrar sesión
  logout: () => {
    console.log('🔓 Cerrando sesión...');
    redirectingToLogin = false; // Reset flag
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('tokenType');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('user');
  },
  
  // Obtener token
  getToken: () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  },
  
  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return !!authService.getToken();
  },
  
  // Refrescar token (implementación pendiente)
  refreshToken: async () => {
    // Implementación pendiente
    return null;
  },
  
  // Función para manejar redirección al login de manera controlada
  redirectToLogin: () => {
    if (redirectingToLogin) {
      console.log('🔄 Ya redirigiendo al login, saltando...');
      return;
    }
    
    const currentPath = window.location.pathname;
    if (currentPath === '/login') {
      console.log('🔄 Ya estamos en login, no redirigir');
      return;
    }
    
    console.log('🔄 Redirigiendo a login desde:', currentPath);
    redirectingToLogin = true;
    
    setTimeout(() => {
      window.location.href = '/login';
    }, 100); // Reducir el tiempo de espera
  }
};

// Nota: El interceptor de autenticación se maneja automáticamente en axiosConfig.js
// No necesitamos setupAuthInterceptor ya que axios maneja esto por nosotros