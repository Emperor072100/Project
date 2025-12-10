import React, { useState, useEffect } from 'react';
import NuevoProyecto from '../components/NuevoProyecto';
import EditarProyecto from '../components/EditarProyecto';
import axiosInstance from '../services/axiosConfig';

const Proyectos = () => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [proyectoIdToEdit, setProyectoIdToEdit] = useState<number | null>(null);

  // Cargar proyectos
  const fetchProyectos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar axiosInstance configurado para manejar correctamente la URL de la API
      console.log('🔄 Cargando proyectos...');
      const response = await axiosInstance.get('/proyectos');
      console.log('✅ Proyectos cargados:', response.data);
      
      setProyectos(response.data);
    } catch (err: any) {
      console.error('Error al cargar proyectos:', err);
      setError(err.response?.data?.detail || 'Error al cargar los proyectos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProyectos();
  }, []);

  // Función para manejar click en editar
  const handleEditClick = (id: number) => {
    setProyectoIdToEdit(id);
    setEditModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Proyectos</h1>
        <NuevoProyecto onCreado={fetchProyectos} />
      </div>

      {/* Tabla de proyectos */}
      {loading ? (
        <div className="text-center py-4">Cargando proyectos...</div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <div className="bg-white shadow rounded overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* ...table header... */}
            <tbody className="bg-white divide-y divide-gray-200">
              {proyectos.map((proyecto: any) => (
                <tr key={proyecto.id}>
                  {/* ...table cells... */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {/* Ver detalles */}}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Ver más
                    </button>
                    <button
                      onClick={() => handleEditClick(proyecto.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {/* Eliminar */}}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edición */}
      <EditarProyecto
        proyectoId={proyectoIdToEdit}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onActualizado={fetchProyectos}
      />
    </div>
  );
};

export default Proyectos;
