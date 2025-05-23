// Servicio para manejar la autenticación
const BASE_URL = 'http://localhost:8000';

export const authService = {
  // Iniciar sesión
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al iniciar sesión');
    }
    
    return response.json();
  },
  
  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('tokenType');
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
  }
};

// Interceptor para refrescar token automáticamente
export const setupAuthInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (url, options = {}) => {
    // Si la URL es para login, no añadir token
    if (url.includes('/auth/login')) {
      return originalFetch(url, options);
    }
    
    // Añadir token a las peticiones
    const token = authService.getToken();
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    try {
      const response = await originalFetch(url, options);
      
      // Si hay error 401 (no autorizado), intentar refrescar token
      if (response.status === 401) {
        const refreshedToken = await authService.refreshToken();
        if (refreshedToken) {
          // Reintentar con el nuevo token
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${refreshedToken}`
          };
          return originalFetch(url, options);
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };
};