import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Credenciales temporales para desarrollo
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        // Simular token JWT
        const mockToken = {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTY5MDAwMDAwMH0',
          token_type: 'bearer'
        };
        
        // Guardar token en localStorage o sessionStorage según rememberMe
        if (rememberMe) {
          localStorage.setItem('token', mockToken.access_token);
          localStorage.setItem('tokenType', mockToken.token_type);
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('userName', 'Administrador');
        } else {
          sessionStorage.setItem('token', mockToken.access_token);
          sessionStorage.setItem('tokenType', mockToken.token_type);
          sessionStorage.setItem('userRole', 'admin');
          sessionStorage.setItem('userName', 'Administrador');
        }
        
        // Redirigir al dashboard
        navigate('/');
        return;
      }
      
      // Credenciales de usuario normal
      if (credentials.username === 'usuario' && credentials.password === 'usuario123') {
        // Simular token JWT
        const mockToken = {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3VhcmlvIiwicm9sZSI6InVzdWFyaW8iLCJleHAiOjE2OTAwMDAwMDB9',
          token_type: 'bearer'
        };
        
        // Guardar token en localStorage o sessionStorage según rememberMe
        if (rememberMe) {
          localStorage.setItem('token', mockToken.access_token);
          localStorage.setItem('tokenType', mockToken.token_type);
          localStorage.setItem('userRole', 'usuario');
          localStorage.setItem('userName', 'Usuario Normal');
        } else {
          sessionStorage.setItem('token', mockToken.access_token);
          sessionStorage.setItem('tokenType', mockToken.token_type);
          sessionStorage.setItem('userRole', 'usuario');
          sessionStorage.setItem('userName', 'Usuario Normal');
        }
        
        // Redirigir al dashboard
        navigate('/');
        return;
      }
      
      // Si las credenciales no coinciden
      throw new Error('Usuario o contraseña incorrectos');
      
      /* Código original comentado para cuando tengas la base de datos
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Error al iniciar sesión');
      }
      
      // Guardar token en localStorage o sessionStorage según rememberMe
      if (rememberMe) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('tokenType', data.token_type);
      } else {
        sessionStorage.setItem('token', data.access_token);
        sessionStorage.setItem('tokenType', data.token_type);
      }
      
      // Redirigir al dashboard
      navigate('/');
      */
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Implementar recuperación de contraseña
    alert('Funcionalidad de recuperación de contraseña pendiente');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-8 text-center">
          {/* Icono de candado */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <FaLock className="text-green-600 text-2xl" />
          </div>
          
          <h1 className="text-xl font-bold text-green-700 mb-1">Sistema de ANDESBPO</h1>
          <p className="text-sm text-gray-500 mb-6">Accede a tu cuenta para continuar</p>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario o Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-green-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={credentials.username}
                  onChange={handleChange}
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tu usuario o email"
                />
              </div>
            </div>
            
            <div className="text-left">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-green-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-400 hover:text-green-500" />
                  ) : (
                    <FaEye className="text-gray-400 hover:text-green-500" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Recordarme
                </label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-green-600 hover:text-green-500"
              >
                Olvidé mi contraseña
              </button>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              Ingresar
            </button>
          </form>
          
          {/* Credenciales de desarrollo */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg text-sm text-left">
            <p className="font-semibold text-blue-700 mb-1">Credenciales para desarrollo:</p>
            <p className="text-blue-600"><strong>Admin:</strong> usuario: admin / contraseña: admin123</p>
            <p className="text-blue-600"><strong>Usuario:</strong> usuario: usuario / contraseña: usuario123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;