import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../img/logo.png'; // ajusta el path según tu estructura

const Sidebar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Lógica de cierre de sesión
    console.log('Sesión cerrada');
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white flex flex-col shadow-lg">
      {/* Logo y usuario */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-700">
        <div className="bg-gray-700 p-2 rounded-full">
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-full" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{user?.nombre || 'Usuario'}</h2>
          <p className="text-sm text-gray-400">{user?.rol || 'Invitado'}</p>
        </div>
      </div>

      {/* Menú */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="mb-4">
          <h3 className="text-xs uppercase text-gray-500 font-semibold px-4 mb-2">Navegación</h3>
          <div className="space-y-1">
            <button
              onClick={() => navigate('/')}
              className="flex items-center w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Inicio
            </button>
            
            {user?.rol === "Administrador" && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Panel de Administrador
              </button>
            )}
            
            <button
              onClick={() => navigate('/tareas')}
              className="flex items-center w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Panel de Tareas
            </button>
            
            <button
              onClick={() => navigate('/perfil')}
              className="flex items-center w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mi Perfil
            </button>
          </div>
        </div>
      </nav>

      {/* Salir */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
