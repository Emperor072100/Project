import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contraseña: '', // El nombre del campo debe coincidir con el backend: 'contraseña'
    rol: 'usuario'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Nuevo estado para el término de búsqueda

  // Cargar usuarios al montar el componente y cuando searchTerm cambie
  useEffect(() => {
    fetchUsuarios();
  }, [searchTerm]); // Se ejecuta cuando searchTerm cambia

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      let url = 'http://localhost:8000/usuarios';
      if (searchTerm) {
        url += `?nombre=${encodeURIComponent(searchTerm)}`; // Añadir parámetro de búsqueda si existe
      }
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'No se pudieron cargar los usuarios' }));
        throw new Error(errorData.detail || 'No se pudieron cargar los usuarios');
      }
      
      const data = await response.json();
      setUsuarios(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar usuarios: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpiar errores previos
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const url = editingId 
        ? `http://localhost:8000/usuarios/${editingId}` 
        : 'http://localhost:8000/usuarios'; 
      
      const method = editingId ? 'PUT' : 'POST';
      
      // Para PUT, no enviar la contraseña si está vacía
      const bodyData = { ...formData };
      if (editingId && !formData.contraseña) {
        delete bodyData.contraseña;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData) // Usar bodyData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Error al guardar usuario' }));
        throw new Error(errorData.detail || 'Error al guardar usuario');
      }
      
      // Actualizar la lista de usuarios
      fetchUsuarios();
      
      // Limpiar el formulario
      setFormData({
        nombre: '',
        apellido: '', // ← añadir esto
        correo: '',
        contraseña: '',
        rol: 'usuario'
      });   
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      setError('Error: ' + err.message);
      console.error(err);
    }
  };

  const handleEdit = (usuario) => {
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido || '',
      correo: usuario.correo,
      contraseña: '', // No mostramos la contraseña por seguridad
      rol: usuario.rol
    });
    setEditingId(usuario.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) return;
    
    setError(null); // Limpiar errores previos
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/usuarios/${id}`, { // Esta URL debe coincidir con el backend
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Intentar obtener un mensaje de error más detallado del backend
        const errorData = await response.json().catch(() => ({ detail: 'Error al eliminar usuario' }));
        throw new Error(errorData.detail || 'Error al eliminar usuario');
      }
      
      // Actualizar la lista de usuarios
      fetchUsuarios();
    } catch (err) {
      setError('Error: ' + err.message);
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        {/* Input de búsqueda */}
        <div className="w-1/3">
          <input 
            type="text"
            placeholder="Buscar por nombre..."
            className="w-full p-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => {
            setFormData({
              nombre: '',
              apellido: '', // ← añadir esto
              correo: '',
              contraseña: '',
              rol: 'usuario'
            });
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <FaPlus className="mr-2" />
          {showForm ? 'Cancelar' : 'Nuevo Usuario'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  name="contraseña"
                  value={formData.contraseña}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required={!editingId}
                  placeholder={editingId ? '(Dejar en blanco para mantener)' : ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">Cargando usuarios...</div>
      ) : (
        <div className="bg-white shadow rounded overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.length > 0 ? (
                usuarios.map(usuario => (
                  <tr key={usuario.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{usuario.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{usuario.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{usuario.apellido}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{usuario.correo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${usuario.rol === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                        {/* Mostrar 'Administrador' o 'Usuario' basado en el rol */}
                        {usuario.rol === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(usuario)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(usuario.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? 'No hay usuarios que coincidan con la búsqueda.' : 'No hay usuarios registrados'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

console.log(JSON.parse(localStorage.getItem('user'))); // o sessionStorage

export default Usuarios;