import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    nombre: '',
    apellido: '',
    rol: '',
    foto: null
  });

  useEffect(() => {
    // Obtener datos del usuario del localStorage o sessionStorage
    const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole') || 'usuario';
    const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName') || 'Usuario';
    
    // Simular datos de usuario para desarrollo
    let userData;
    if (userRole === 'admin') {
      userData = {
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        rol: 'admin',
        foto: null
      };
    } else {
      userData = {
        nombre: 'María',
        apellido: 'González',
        rol: 'usuario',
        foto: null
      };
    }
    
    setUser(userData);
  }, []);

  const handleLogout = () => {
    // Lógica de cierre de sesión
    authService.logout();
    console.log('Sesión cerrada');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Función para obtener las iniciales del usuario
  const getUserInitials = () => {
    if (!user.nombre && !user.apellido) return 'U';
    return `${user.nombre.charAt(0)}${user.apellido ? user.apellido.charAt(0) : ''}`;
  };

  // Función para obtener el nombre completo
  const getFullName = () => {
    return `${user.nombre} ${user.apellido || ''}`.trim();
  };

  // Función para obtener el texto del rol en español
  const getRoleText = () => {
    return user.rol === 'admin' ? 'Administrador' : 'Usuario';
  };

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} h-screen bg-gray-800 text-white flex flex-col shadow-lg fixed transition-all duration-300 ease-in-out`}>
      {/* Botón para colapsar/expandir */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 bg-gray-800 text-white p-1 rounded-full shadow-lg z-10 hover:bg-gray-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Logo y usuario */}
      <div className={`p-6 flex ${collapsed ? 'justify-center' : 'items-center gap-3'} border-b border-gray-700 transition-all duration-300`}>
        <div className="bg-gray-700 p-2 rounded-full">
          {user.foto ? (
            <img 
              src={user.foto} 
              alt={getFullName()} 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
              {getUserInitials()}
            </div>
          )}
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          <h2 className="text-lg font-semibold truncate">{getFullName()}</h2>
          <p className="text-sm text-gray-400 truncate">{getRoleText()}</p>
        </div>
      </div>

      {/* Menú */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="mb-4">
          <h3 className={`text-xs uppercase text-gray-500 font-semibold px-4 mb-2 transition-opacity duration-300 ${collapsed ? 'opacity-0 h-0' : 'opacity-100'}`}>
            NAVEGACIÓN
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center w-full text-left ${collapsed ? 'justify-center px-2' : 'px-4'} py-2 rounded hover:bg-gray-700 transition-all duration-300`}
              title="Inicio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className={`transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 inline'}`}>
                Inicio
              </span>
            </button>
            
            <button
              onClick={() => navigate('/kanban')}
              className={`flex items-center w-full text-left ${collapsed ? 'justify-center px-2' : 'px-4'} py-2 rounded hover:bg-gray-700 transition-all duration-300`}
              title="Kanban"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className={`transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 inline'}`}>
                Kanban
              </span>
            </button>
            
            {/* Nuevo botón para la vista Gantt */}
            <button
              onClick={() => navigate('/gantt')}
              className={`flex items-center w-full text-left ${collapsed ? 'justify-center px-2' : 'px-4'} py-2 rounded hover:bg-gray-700 transition-all duration-300`}
              title="Gantt"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={`transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 inline'}`}>
                Gantt
              </span>
            </button>
            
            <button
              onClick={() => navigate('/perfil')}
              className={`flex items-center w-full text-left ${collapsed ? 'justify-center px-2' : 'px-4'} py-2 rounded hover:bg-gray-700 transition-all duration-300`}
              title="Mi Perfil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className={`transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 inline'}`}>
                Mi Perfil
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Salir */}
      <div className={`p-4 border-t border-gray-700 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={handleLogout}
          className={`flex items-center ${collapsed ? 'justify-center w-12 h-12 rounded-full' : 'justify-center w-full'} bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition-all duration-300`}
          title="Cerrar Sesión"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${collapsed ? '' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className={`transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 inline'}`}>
            Cerrar Sesión
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
