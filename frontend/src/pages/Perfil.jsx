import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

// Recibe la prop sidebarCollapsed desde el layout
export default function Perfil({ sidebarCollapsed = false }) {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    rol: "usuario",
    foto: null,
    id: null
  });
  const [proyectos, setProyectos] = useState([]);
  const [fileInput, setFileInput] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [campañas, setCampañas] = useState([]);
  const [clientesCorporativos, setClientesCorporativos] = useState([]);
  const [implementaciones, setImplementaciones] = useState([]);
  const [activeCard, setActiveCard] = useState(null); // 'proyectos', 'campañas', 'implementaciones'

  useEffect(() => {
    // Obtener usuario y proyectos asociados
    const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user');
    let userData = {
      nombre: '',
      apellido: '',
      correo: '',
      rol: 'usuario',
      foto: null,
      id: null
    };
    if (userRaw) {
      try {
        const userObj = JSON.parse(userRaw);
        userData = {
          nombre: userObj.nombre || '',
          apellido: userObj.apellido || '',
          correo: userObj.correo || '',
          rol: userObj.rol || 'usuario',
          foto: userObj.foto || null,
          id: userObj.id || null
        };
      } catch (error) {
        console.error('Error al parsear datos de usuario:', error);
      }
    }
    setUsuario(userData);
    // Proyectos asociados
    const fetchProyectosUsuario = async () => {
      if (!userData.id) return;
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      try {
        const response = await fetch(`${API_URL}/proyectos/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (userData.rol === 'admin') {
            setProyectos(data);
          } else {
            const proyectosUsuario = data.filter(p => p.responsable_id === userData.id);
            setProyectos(proyectosUsuario);
          }
        } else {
          setProyectos([]);
        }
      } catch (error) {
        console.error('Error al obtener proyectos:', error);
        setProyectos([]);
      }
    };
    fetchProyectosUsuario();
  }, []);

  useEffect(() => {
    // Campañas, clientes corporativos e implementaciones solo cuando usuario.id está listo
    if (!usuario.id) return;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const fetchDatos = async () => {
      try {
        // Obtener campañas, clientes corporativos e implementaciones
        const respCampañas = await fetch(`${API_URL}/campanas/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const respClientes = await fetch(`${API_URL}/clientes-corporativos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const respImplementaciones = await fetch(`${API_URL}/implementaciones/basic`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let campañasData = [];
        let clientesData = [];
        let implementacionesData = [];
        
        if (respCampañas.ok) {
          campañasData = await respCampañas.json();
        }
        if (respClientes.ok) {
          clientesData = await respClientes.json();
        }
        if (respImplementaciones.ok) {
          implementacionesData = await respImplementaciones.json();
        }
        
        if (usuario.rol === 'admin') {
          setCampañas(campañasData);
          setImplementaciones(implementacionesData);
        } else {
          setCampañas(campañasData.filter(camp => camp.lider_de_campaña === usuario.nombre || camp.ejecutivo === usuario.nombre));
          // Para implementaciones, mostrar todas si es admin, o filtrar según algún criterio si es necesario
          setImplementaciones(implementacionesData);
        }
        setClientesCorporativos(clientesData);
      } catch (error) {
        console.error('Error al obtener datos:', error);
        setCampañas([]);
        setClientesCorporativos([]);
        setImplementaciones([]);
      }
    };
    fetchDatos();
  }, [usuario.id, usuario.nombre, usuario.rol]);

  // Función para obtener las iniciales del usuario
  const getUserInitials = () => {
    if (!usuario.nombre && !usuario.apellido) return 'U';
    return `${usuario.nombre.charAt(0)}${usuario.apellido ? usuario.apellido.charAt(0) : ''}`;
  };

  // Función para obtener el nombre completo
  const getFullName = () => {
    return `${usuario.nombre} ${usuario.apellido || ''}`.trim();
  };

  // Función para obtener el texto del rol en español
  const getRoleText = () => {
    if (!usuario.rol) return '';
    return usuario.rol === 'admin' ? 'Administrador' : 'Usuario';
  };

  // Manejar cambio de foto
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Crear URL para previsualización
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
      // En un entorno real, aquí subirías la imagen a un servidor
      // Por ahora, solo actualizamos el estado local
      setUsuario({...usuario, foto: reader.result});
    };
    reader.readAsDataURL(file);
  };

  // Abrir selector de archivos
  const handleSelectPhoto = () => {
    if (fileInput) {
      fileInput.click();
    }
  };

  // Determinar el ancho máximo según el estado del sidebar
  const maxWidth = sidebarCollapsed ? 'max-w-4xl' : 'max-w-2xl';

  // Función para manejar el clic en las tarjetas
  const handleCardClick = (cardType) => {
    setActiveCard(activeCard === cardType ? null : cardType);
  };

  return (
    <div className="p-8 bg-gradient-to-br from-green-50 to-white min-h-screen flex flex-col items-center">
      <div className={`bg-white rounded-xl shadow-lg p-8 flex flex-col md:flex-row items-center w-full ${maxWidth} mb-8`}>
        {/* Icono/Foto/Letra con opción para cambiar */}
        <div className="flex-shrink-0 relative group mb-6 md:mb-0">
          {previewUrl || usuario.foto ? (
            <img
              src={previewUrl || usuario.foto}
              alt={getFullName()}
              className="w-24 h-24 rounded-full object-cover border-4 border-green-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-4xl font-bold border-4 border-green-200">
              {getUserInitials()}
            </div>
          )}
          {/* Botón para cambiar foto */}
          <button 
            onClick={handleSelectPhoto}
            className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            title="Cambiar foto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h6m2 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6" />
            </svg>
          </button>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={input => setFileInput(input)}
            onChange={handlePhotoChange}
          />
        </div>
        {/* Info usuario */}
        <div className="ml-0 md:ml-8 flex-1">
          <h2 className="text-2xl font-bold mb-2">{getFullName()}</h2>
          <div className="text-gray-500 mb-2">{usuario.correo}</div>
          <div className="mb-2">
            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              {getRoleText()}
            </span>
          </div>
        </div>
      </div>
      {/* Tarjetas de navegación */}
      <div className={`bg-white rounded-xl shadow-lg p-6 w-full ${maxWidth} mb-8`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Tarjeta Proyectos */}
          <div 
            onClick={() => handleCardClick('proyectos')} 
            className={`cursor-pointer rounded-lg border-2 p-6 flex flex-col items-center text-center transition-all duration-200 hover:shadow-lg ${
              activeCard === 'proyectos' ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' : 'border-gray-200 bg-gradient-to-br from-blue-50 to-white hover:border-blue-300'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-blue-700 mb-2">Proyectos</h3>
            <p className="text-sm text-gray-600 mb-3">{usuario.rol === 'admin' ? 'Todos los proyectos' : 'Mis proyectos'}</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-800">{proyectos.length}</span>
              <span className="text-sm text-gray-500">registros</span>
            </div>
          </div>

          {/* Tarjeta Campañas */}
          <div 
            onClick={() => handleCardClick('campañas')} 
            className={`cursor-pointer rounded-lg border-2 p-6 flex flex-col items-center text-center transition-all duration-200 hover:shadow-lg ${
              activeCard === 'campañas' ? 'border-green-500 bg-green-50 shadow-lg scale-105' : 'border-gray-200 bg-gradient-to-br from-green-50 to-white hover:border-green-300'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h6m-6 0V7a4 4 0 00-4-4H5a4 4 0 00-4 4v10a4 4 0 004 4h6a4 4 0 004-4v-2" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-green-700 mb-2">Campañas</h3>
            <p className="text-sm text-gray-600 mb-3">Campañas relacionadas</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-800">{campañas.length}</span>
              <span className="text-sm text-gray-500">registros</span>
            </div>
          </div>

          {/* Tarjeta Implementaciones */}
          <div 
            onClick={() => handleCardClick('implementaciones')} 
            className={`cursor-pointer rounded-lg border-2 p-6 flex flex-col items-center text-center transition-all duration-200 hover:shadow-lg ${
              activeCard === 'implementaciones' ? 'border-purple-500 bg-purple-50 shadow-lg scale-105' : 'border-gray-200 bg-gradient-to-br from-purple-50 to-white hover:border-purple-300'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-purple-700 mb-2">Implementaciones</h3>
            <p className="text-sm text-gray-600 mb-3">Implementaciones del sistema</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-purple-800">{implementaciones.length}</span>
              <span className="text-sm text-gray-500">registros</span>
            </div>
          </div>
        </div>

        {/* Contenido expandible */}
        {activeCard && (
          <div className="border-t pt-6 animate-fadeIn">
            {/* Contenido de Proyectos */}
            {activeCard === 'proyectos' && proyectos.length > 0 && (
              <div>
                <h4 className="text-xl font-bold mb-4 text-blue-700 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {usuario.rol === 'admin' ? 'Todos los Proyectos' : 'Mis Proyectos'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {proyectos.map(proy => (
                    <div key={proy.id} className="rounded-lg border border-gray-200 shadow-sm p-4 bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-blue-700 text-lg">{proy.nombre}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full w-fit">{proy.estado || 'Sin estado'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 text-sm mt-2">
                        <span className="text-gray-500">Responsable: <span className="font-semibold text-gray-700">{proy.responsable_nombre || proy.responsable_id}</span></span>
                        {proy.fecha_inicio && (
                          <span className="text-gray-500">Inicio: <span className="font-semibold text-gray-700">{new Date(proy.fecha_inicio).toLocaleDateString()}</span></span>
                        )}
                        {proy.fecha_fin && (
                          <span className="text-gray-500">Fin: <span className="font-semibold text-gray-700">{new Date(proy.fecha_fin).toLocaleDateString()}</span></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contenido de Campañas */}
            {activeCard === 'campañas' && campañas.length > 0 && (
              <div>
                <h4 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h6m-6 0V7a4 4 0 00-4-4H5a4 4 0 00-4 4v10a4 4 0 004 4h6a4 4 0 004-4v-2" />
                  </svg>
                  Campañas Relacionadas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campañas.map(camp => {
                    // Buscar el cliente corporativo relacionado
                    const cliente = clientesCorporativos.find(c => c.id === camp.cliente_corporativo_id);
                    const logo = cliente?.logo;
                    const handleCampañaClick = () => {
                      navigate(`/campañas?adminId=${camp.id}`);
                    };
                    return (
                      <div key={camp.id} onClick={handleCampañaClick} className="cursor-pointer rounded-lg border border-gray-200 shadow-sm p-4 bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center gap-4 mb-2">
                          {logo ? (
                            <img src={logo} alt="Logo cliente corporativo" className="w-12 h-12 object-contain rounded-lg border border-gray-200 bg-white" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-bold border border-gray-200">?</div>
                          )}
                          <div>
                            <span className="font-bold text-green-700 text-lg">{camp.nombre}</span>
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{camp.tipo}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 text-sm mt-2">
                          <span className="text-gray-500">Estado: <span className="font-semibold text-gray-700">{camp.estado}</span></span>
                          <span className="text-gray-500">Líder: <span className="font-semibold text-gray-700">{camp.lider_de_campaña}</span></span>
                          <span className="text-gray-500">Ejecutivo: <span className="font-semibold text-gray-700">{camp.ejecutivo}</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contenido de Implementaciones */}
            {activeCard === 'implementaciones' && implementaciones.length > 0 && (
              <div>
                <h4 className="text-xl font-bold mb-4 text-purple-700 flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Implementaciones del Sistema
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {implementaciones.map(impl => (
                    <div key={impl.id} className="rounded-lg border border-gray-200 shadow-sm p-4 bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xl font-bold">
                          {impl.cliente ? impl.cliente.charAt(0).toUpperCase() : 'I'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-purple-700 text-lg">{impl.cliente}</span>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full w-fit">{impl.estado || 'Sin estado'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 text-sm mt-2">
                        <span className="text-gray-500">Proceso: <span className="font-semibold text-gray-700">{impl.proceso}</span></span>
                        <span className="text-gray-500">ID: <span className="font-semibold text-gray-700">#{impl.id}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mensajes cuando no hay datos */}
            {activeCard === 'proyectos' && proyectos.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p>No hay proyectos disponibles</p>
              </div>
            )}
            {activeCard === 'campañas' && campañas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h6m-6 0V7a4 4 0 00-4-4H5a4 4 0 00-4 4v10a4 4 0 004 4h6a4 4 0 004-4v-2" />
                </svg>
                <p>No hay campañas disponibles</p>
              </div>
            )}
            {activeCard === 'implementaciones' && implementaciones.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p>No hay implementaciones disponibles</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}