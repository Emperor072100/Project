import React, { useState, useEffect } from "react";

export default function Perfil() {
  const [usuario, setUsuario] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    rol: "",
    foto: null
  });

  const [proyectos, setProyectos] = useState([]);
  const [fileInput, setFileInput] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    // Obtener datos del usuario del localStorage o sessionStorage
    const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole') || 'usuario';
    
    // Simular datos de usuario para desarrollo
    let userData;
    if (userRole === 'admin') {
      userData = {
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        correo: 'carlos.rodriguez@andesbpo.com',
        rol: 'admin',
        foto: null
      };
      
      // Proyectos para administrador (puede ver todos)
      setProyectos([
        { id: 1, nombre: "Sistema de gestión de facturas" },
        { id: 2, nombre: "Automatización de facturación" },
        { id: 3, nombre: "Desarrollo de dashboard" },
        { id: 4, nombre: "Integración API" },
        { id: 5, nombre: "Sistema de reportes" }
      ]);
    } else {
      userData = {
        nombre: 'María',
        apellido: 'González',
        correo: 'maria.gonzalez@andesbpo.com',
        rol: 'usuario',
        foto: null
      };
      
      // Proyectos para usuario normal (solo ve los propios)
      setProyectos([
        { id: 2, nombre: "Automatización de facturación" },
        { id: 4, nombre: "Integración API" }
      ]);
    }
    
    setUsuario(userData);
  }, []);

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

  return (
    <div className="p-8 bg-gradient-to-br from-green-50 to-white min-h-screen flex flex-col items-center">
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col md:flex-row items-center w-full max-w-2xl mb-8">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          {/* Input oculto para seleccionar archivo */}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handlePhotoChange}
            ref={input => setFileInput(input)}
          />
        </div>
        
        {/* Info usuario */}
        <div className="ml-0 md:ml-8 flex-1 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-green-700 mb-1">{getFullName()}</h1>
          <div className="text-gray-500 mb-2">{usuario.correo}</div>
          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
            {getRoleText()}
          </span>
        </div>
      </div>
      
      {/* Proyectos */}
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold text-green-700 mb-4">
          {usuario.rol === 'admin' ? 'Todos los Proyectos' : 'Mis Proyectos'}
        </h2>
        {proyectos.length > 0 ? (
          <ul className="space-y-2">
            {proyectos.map(proy => (
              <li key={proy.id} className="px-4 py-2 rounded bg-green-50 hover:bg-green-100 transition">
                <span className="font-medium text-green-800">{proy.nombre}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-400">No tienes proyectos asignados.</div>
        )}
      </div>
    </div>
  );
}