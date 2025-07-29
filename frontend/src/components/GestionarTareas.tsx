import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosConfig.js';
import Modal from './Modal.tsx';
import NuevaTarea from './NuevaTarea.tsx';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

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
      Swal.fire({
        title: '¡Error!',
        text: 'No se pudieron cargar las tareas',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCompletado = async (tareaId: number, completado: boolean) => {
    try {
      // Find the current task to get its description
      const tareaActual = tareas.find(t => t.id === tareaId);
      if (!tareaActual) {
        Swal.fire({
          title: '¡Error!',
          text: 'No se encontró la tarea',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#ef4444'
        });
        return;
      }

      // Send complete task data with updated completed status
      const datosActualizados = {
        descripcion: tareaActual.descripcion,
        completado: !completado,
        proyecto_id: tareaActual.proyecto_id
      };

      console.log('🔄 Actualizando tarea:', { tareaId, datosActualizados });
      
      const response = await axiosInstance.put(`/tareas/${tareaId}`, datosActualizados);
      console.log('✅ Respuesta del servidor:', response.data);
      
      // Update local state immediately for better UX
      setTareas(prevTareas => 
        prevTareas.map(tarea => 
          tarea.id === tareaId 
            ? { ...tarea, completado: !completado }
            : tarea
        )
      );
      
      toast.success(!completado ? 'Tarea marcada como completada ✅' : 'Tarea marcada como pendiente 📝');
    } catch (error: any) {
      console.error('❌ Error al actualizar tarea:', error);
      console.error('Detalles del error:', error.response?.data);
      
      const errorMessage = error.response?.data?.detail || 'Error al actualizar la tarea';
      Swal.fire({
        title: '¡Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444'
      });
      
      // Reload tasks to ensure consistency
      cargarTareas();
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
      Swal.fire({
        title: '¡Atención!',
        text: 'La descripción no puede estar vacía',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f59e0b'
      });
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
      Swal.fire({
        title: '¡Error!',
        text: 'Error al actualizar la tarea',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const eliminarTarea = async (tareaId: number) => {
    // Encontrar la tarea para mostrar su descripción en la confirmación
    const tarea = tareas.find(t => t.id === tareaId);
    const descripcionTarea = tarea?.descripcion || 'esta tarea';

    const result = await Swal.fire({
      title: '¿Eliminar tarea?',
      html: `
        <div class="text-center">
          <p class="mb-3">¿Estás seguro de que deseas eliminar la siguiente tarea?</p>
          <div class="bg-gray-100 p-3 rounded-lg border-l-4 border-red-500">
            <p class="font-semibold text-gray-800">"${descripcionTarea}"</p>
          </div>
          <p class="mt-3 text-sm text-red-600">
            <strong>⚠️ Esta acción no se puede deshacer</strong>
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'animate__animated animate__pulse'
      }
    });

    if (result.isConfirmed) {
      // Mostrar loading
      Swal.fire({
        title: 'Eliminando tarea...',
        text: 'Por favor espera un momento',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        await axiosInstance.delete(`/tareas/${tareaId}`);
        
        // Mostrar éxito
        Swal.fire({
          title: '¡Eliminada!',
          text: 'La tarea ha sido eliminada correctamente',
          icon: 'success',
          confirmButtonText: '¡Perfecto!',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
          customClass: {
            popup: 'animate__animated animate__bounceIn'
          }
        });

        cargarTareas(); // Recargar tareas
        toast.success('Tarea eliminada correctamente 🗑️');
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo eliminar la tarea. Inténtalo de nuevo.',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#ef4444',
          customClass: {
            popup: 'animate__animated animate__shakeX'
          }
        });
      }
    }
  };

  // Función alternativa para confirmar eliminación con información más detallada
  const confirmarEliminarTarea = async (tareaId: number, descripcionTarea: string) => {
    const result = await Swal.fire({
      title: 'Confirmar eliminación',
      html: `
        <div class="text-center space-y-4">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </div>
          </div>
          <p class="text-lg font-semibold text-gray-800">¿Eliminar esta tarea?</p>
          <div class="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-200 max-w-md mx-auto">
            <p class="text-sm text-gray-600 mb-2">Tarea a eliminar:</p>
            <p class="font-semibold text-gray-800">"${descripcionTarea}"</p>
          </div>
          <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p class="text-sm text-yellow-800">
              <strong>⚠️ Advertencia:</strong> Esta acción es permanente y no se puede deshacer
            </p>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<i class="fas fa-trash-alt"></i> Sí, eliminar',
      cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'animate__animated animate__fadeInDown',
        confirmButton: 'font-semibold',
        cancelButton: 'font-semibold'
      },
      buttonsStyling: true
    });

    if (result.isConfirmed) {
      await eliminarTarea(tareaId);
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
                    {/* Checkbox mejorado para completado */}
                    <button
                      onClick={() => toggleCompletado(tarea.id, tarea.completado)}
                      className={`group relative mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        tarea.completado
                          ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500 text-white shadow-lg shadow-green-500/30'
                          : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md'
                      }`}
                      title={tarea.completado ? 'Marcar como pendiente' : 'Marcar como completada'}
                    >
                      {tarea.completado && (
                        <svg 
                          className="w-4 h-4 animate-in zoom-in-75 duration-200" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      )}
                      
                      {/* Efecto de hover para tareas no completadas */}
                      {!tarea.completado && (
                        <div className="absolute inset-0 rounded-lg bg-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
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
                        <div className="flex-1">
                          {/* Descripción de la tarea con mejor diseño */}
                          <div className={`p-3 rounded-lg transition-all duration-300 ${
                            tarea.completado 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}>
                            <p className={`text-sm transition-all duration-300 ${
                              tarea.completado 
                                ? 'line-through text-gray-500' 
                                : 'text-gray-800 font-medium'
                            }`}>
                              {tarea.descripcion}
                            </p>
                            
                            {/* Indicador visual de estado */}
                            <div className="flex items-center justify-between mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                                tarea.completado 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {tarea.completado ? (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Completada ✅
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    Pendiente 📝
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acciones mejoradas */}
                    <div className="flex flex-col gap-1 ml-2">
                      <button
                        onClick={() => iniciarEdicion(tarea)}
                        className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
                        title="Editar tarea"
                      >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => eliminarTarea(tarea.id)}
                        className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
                        title="Eliminar tarea"
                      >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Footer con estadísticas mejoradas */}
          {tareas.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Resumen del Proyecto
                </h4>
                
                <div className="grid grid-cols-3 gap-4">
                  {/* Total de tareas */}
                  <div className="text-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="text-2xl font-bold text-gray-800">{tareas.length}</div>
                    <div className="text-xs text-gray-600 font-medium">Total de Tareas</div>
                  </div>
                  
                  {/* Tareas completadas */}
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200 shadow-sm">
                    <div className="text-2xl font-bold text-green-700">
                      {tareas.filter(t => t.completado).length}
                    </div>
                    <div className="text-xs text-green-600 font-medium flex items-center justify-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Completadas
                    </div>
                  </div>
                  
                  {/* Tareas pendientes */}
                  <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200 shadow-sm">
                    <div className="text-2xl font-bold text-amber-700">
                      {tareas.filter(t => !t.completado).length}
                    </div>
                    <div className="text-xs text-amber-600 font-medium flex items-center justify-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Pendientes
                    </div>
                  </div>
                </div>
                
                {/* Barra de progreso */}
                {tareas.length > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progreso del proyecto</span>
                      <span>{Math.round((tareas.filter(t => t.completado).length / tareas.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${Math.round((tareas.filter(t => t.completado).length / tareas.length) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
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
    </>
  );
};

export default GestionarTareas;
