import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

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
      } catch {}
    }
    setUsuario(userData);
    // Proyectos asociados
    const fetchProyectosUsuario = async () => {
      if (!userData.id) return;
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:8000/proyectos/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const proyectosUsuario = data.filter(p => p.responsable_id === userData.id);
          setProyectos(proyectosUsuario);
        } else {
          setProyectos([]);
        }
      } catch {
        setProyectos([]);
      }
    };
    fetchProyectosUsuario();
  }, []);

  useEffect(() => {
    // Campañas y clientes corporativos solo cuando usuario.id está listo
    if (!usuario.id) return;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const fetchCampañasYClientes = async () => {
      try {
        // Obtener campañas
        const respCampañas = await fetch('http://localhost:8000/campanas/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const respClientes = await fetch('http://localhost:8000/clientes-corporativos', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        let campañasData = [];
        let clientesData = [];
        if (respCampañas.ok) {
          campañasData = await respCampañas.json();
        }
        if (respClientes.ok) {
          clientesData = await respClientes.json();
        }
        setCampañas(campañasData);
        setClientesCorporativos(clientesData);
      } catch {
        setCampañas([]);
        setClientesCorporativos([]);
      }
    };
    fetchCampañasYClientes();
  }, [usuario.id, usuario.nombre]);

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
      {/* Proyectos del usuario si existen */}
      {proyectos && proyectos.length > 0 && (
        <div className={`bg-white rounded-xl shadow-lg p-6 w-full ${maxWidth} mb-8`}>
          <h3 className="text-lg font-semibold mb-4">{usuario.rol === 'admin' ? 'Todos los Proyectos' : 'Mis Proyectos'}</h3>
          <ul className="list-disc pl-6">
            {proyectos.map(proy => (
              <li key={proy.id || proy.nombre}>{proy.nombre}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Campañas relacionadas */}
      {campañas && campañas.length > 0 && (
        <div className={`bg-white rounded-xl shadow-lg p-6 w-full ${maxWidth}`}>
          <h3 className="text-xl font-bold mb-6 text-green-700 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h6m-6 0V7a4 4 0 00-4-4H5a4 4 0 00-4 4v10a4 4 0 004 4h6a4 4 0 004-4v-2" /></svg>
            Campañas Relacionadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campañas.map(camp => {
              // Buscar el cliente corporativo relacionado
              const cliente = clientesCorporativos.find(c => c.id === camp.cliente_corporativo_id);
              const logo = cliente?.logo;
              const handleClick = () => {
                navigate(`/campañas?adminId=${camp.id}`);
              };
              return (
                <div key={camp.id} onClick={handleClick} className="cursor-pointer rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center gap-4 mb-2">
                    {logo ? (
                      <img src={logo} alt="Logo cliente corporativo" className="w-14 h-14 object-contain rounded-lg border border-gray-200 bg-white" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-2xl font-bold border border-gray-200">?</div>
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
    </div>
  );
}