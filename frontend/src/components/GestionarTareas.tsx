import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosConfig.js';
import Modal from './Modal.tsx';
import AlertDialog from './AlertDialog.tsx';
import NuevaTarea from './NuevaTarea.tsx';
import toast from 'react-hot-toast';

interface Tarea {
  id: number;
  descripcion: string;
  completado: boolean;
  proyecto_id: number;
}

interface Props {
  proyecto: {
    id: number;
    nombre: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const GestionarTareas: React.FC<Props> = ({ proyecto, isOpen, onClose }) => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(false);
  const [editandoTarea, setEditandoTarea] = useState<number | null>(null);
  const [tareaEditada, setTareaEditada] = useState<string>('');

  // Estado para el AlertDialog
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    if (isOpen && proyecto.id) {
      cargarTareas();
    }
  }, [isOpen, proyecto.id]);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/tareas/?proyecto_id=${proyecto.id}`);
      const tareasData = Array.isArray(response.data) ? response.data : [];
      setTareas(tareasData);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      showAlert('Error!', 'No se pudieron cargar las tareas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setAlertDialog({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const closeAlert = () => {
    setAlertDialog(prev => ({...prev, isOpen: false}));
  };

  const toggleCompletado = async (tareaId: number, completado: boolean) => {
    try {
      await axiosInstance.put(`/tareas/${tareaId}`, { completado: !completado });
      cargarTareas(); // Recargar tareas
      toast.success('Tarea actualizada correctamente');
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      showAlert('Error!', 'Error al actualizar la tarea', 'error');
    }
  };

  const iniciarEdicion = (tarea: Tarea) => {
    setEditandoTarea(tarea.id);
    setTareaEditada(tarea.descripcion);
  };

  const cancelarEdicion = () => {
    setEditandoTarea(null);
    setTareaEditada('');
  };

  const guardarEdicion = async (tareaId: number) => {
    if (!tareaEditada.trim()) {
      showAlert('Información!', 'La descripción no puede estar vacía', 'warning');
      return;
    }

    try {
      await axiosInstance.put(`/tareas/${tareaId}`, { descripcion: tareaEditada.trim() });
      setEditandoTarea(null);
      setTareaEditada('');
      cargarTareas(); // Recargar tareas
      toast.success('Tarea actualizada correctamente');
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      showAlert('Error!', 'Error al actualizar la tarea', 'error');
    }
  };

  const eliminarTarea = async (tareaId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/tareas/${tareaId}`);
      cargarTareas(); // Recargar tareas
      toast.success('Tarea eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      showAlert('Error!', 'Error al eliminar la tarea', 'error');
    }
  };

  const handleTareaCreada = () => {
    cargarTareas(); // Recargar tareas cuando se crea una nueva
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        title={`Tareas del Proyecto: ${proyecto.nombre}`}
      >
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Header con botón de nueva tarea */}
          <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Gestión de Tareas
            </h3>
            <NuevaTarea 
              onCreada={handleTareaCreada}
              proyectoIdPorDefecto={proyecto.id}
              mostrarSelectorProyecto={false}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando tareas...</span>
            </div>
          ) : tareas.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-gray-500 text-lg">No hay tareas en este proyecto</p>
              <p className="text-gray-400 text-sm">Usa el botón "Nueva Tarea" para agregar la primera tarea</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tareas.map((tarea) => (
                <div 
                  key={tarea.id} 
                  className={`p-4 border rounded-lg transition-all duration-200 ${
                    tarea.completado 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox para completado */}
                    <button
                      onClick={() => toggleCompletado(tarea.id, tarea.completado)}
                      className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        tarea.completado
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {tarea.completado && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1">
                      {editandoTarea === tarea.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={tareaEditada}
                            onChange={(e) => setTareaEditada(e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => guardarEdicion(tarea.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={cancelarEdicion}
                              className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className={`text-sm ${tarea.completado ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {tarea.descripcion}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              tarea.completado 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {tarea.completado ? 'Completada' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => iniciarEdicion(tarea)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Editar tarea"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => eliminarTarea(tarea.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Eliminar tarea"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Footer con estadísticas */}
          {tareas.length > 0 && (
            <div className="mt-6 pt-4 border-t bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total de tareas: {tareas.length}</span>
                <span>Completadas: {tareas.filter(t => t.completado).length}</span>
                <span>Pendientes: {tareas.filter(t => !t.completado).length}</span>
              </div>
            </div>
          )}
        </div>

        {/* Botón de cerrar */}
        <div className="px-6 pb-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </Modal>
      
      <AlertDialog 
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        onClose={closeAlert}
      />
    </>
  );
};

export default GestionarTareas;
