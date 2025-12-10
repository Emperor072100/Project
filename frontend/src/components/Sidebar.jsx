import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import axiosInstance from '../services/axiosConfig';
import Swal from 'sweetalert2';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    nombre: '',
    apellido: '',
    rol: '',
    foto: null
  });

  useEffect(() => {
    // Get user ID and token from storage
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!userId || !token) return;

    axiosInstance.get(`/usuarios/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => setUser(res.data))
      .catch(() => setUser({ nombre: '', apellido: '', rol: '', foto: null }));
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro que deseas cerrar tu sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        authService.logout();
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Has cerrado sesión correctamente',
          timer: 1500,
          showConfirmButton: false
        });
        navigate('/login');
      }
    });
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
    <aside className={`${collapsed ? 'w-20' : 'w-64'} h-screen bg-gray-800 text-white flex flex-col shadow-lg fixed transition-all duration-300 ease-in-out`} style={{zIndex: 50, position: 'fixed', left: 0, top: 0}}>
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
              className={`flex items-center w-full text-left ${collapsed ? 'justify-center px-2' : 'px-4'} py-2 rounded transition-all duration-300 ${location.pathname === '/' ? '' : 'hover:bg-gray-700'}`}
              style={location.pathname === '/' ? { backgroundColor: '#374151' } : {}}
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
              className={`flex items-center w-full text-left ${collapsed ? 'justify-center px-2' : 'px-4'} py-2 rounded transition-all duration-300 ${location.pathname === '/kanban' ? '' : 'hover:bg-gray-700'}`}
              style={location.pathname === '/kanban' ? { backgroundColor: '#374151' } : {}}
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
              className={`flex items-center w-full text-left ${collapsed ? 'justify-center px-2' : 'px-4'} py-2 rounded transition-all duration-300 ${location.pathname === '/gantt' ? '' : 'hover:bg-gray-700'}`}
              style={location.pathname === '/gantt' ? { backgroundColor: '#374151' } : {}}
              title="Gantt"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={`transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 inline'}`}>
                Gantt
              </span>
            </button>
            
            {/* Opción de Usuarios (solo visible para administradores) */}
            {user.rol === 'admin' && (
              <button
                onClick={() => navigate('/usuarios')}
                className={`flex items-center w-full text-left ${collapsed ? 'justify-center px-2' : 'px-4'} py-2 rounded transition-all duration-300 ${location.pathname === '/usuarios' ? '' : 'hover:bg-gray-700'}`}
                style={location.pathname === '/usuarios' ? { backgroundColor: '#374151' } : {}}
                title="Gestión de Usuarios"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className={`transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 inline'}`}>
                  Usuarios
                </span>
              </button>
            )}

            {/* Opción de Campañas */}
            <button
              onClick={() => navigate('/campañas')}
              className={`flex items-center w-full text-left ${collapsed ? 'justify-center px-2' : 'px-4'} py-2 rounded transition-all duration-300 ${location.pathname === '/campañas' ? '' : 'hover:bg-gray-700'}`}
              style={location.pathname === '/campañas' ? { backgroundColor: '#374151' } : {}}
              title="Gestión de Campañas"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <span className={`transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 inline'}`}>
                Campañas
              </span>
            </button>

            {/* Opción de Implementaciones */}
            <button
              onClick={() => navigate('/implementaciones')}
              className={`flex items-center w-full text-left ${collapsed ? 'justify-center px-2' : 'px-4'} py-2 rounded transition-all duration-300 ${location.pathname === '/implementaciones' ? '' : 'hover:bg-gray-700'}`}
              style={location.pathname === '/implementaciones' ? { backgroundColor: '#374151' } : {}}
              title="Gestión de Implementaciones"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className={`transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 inline'}`}>
                Implementaciones
              </span>
            </button>
            
            <button
              onClick={() => navigate('/perfil')}
              className={`flex items-center w-full text-left ${collapsed ? 'justify-center px-2' : 'px-4'} py-2 rounded transition-all duration-300 ${location.pathname === '/perfil' ? '' : 'hover:bg-gray-700'}`}
              style={location.pathname === '/perfil' ? { backgroundColor: '#374151' } : {}}
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