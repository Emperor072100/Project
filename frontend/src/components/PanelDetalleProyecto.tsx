// src/components/PanelDetalleProyecto.tsx
import React, { useState, useEffect } from 'react';
import { Proyecto } from '../views';
import axiosInstance from '../services/axiosConfig.js';
import NuevaTarea from './NuevaTarea.tsx';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface Tarea {
  id: number;
  descripcion: string;
  completado: boolean;
  proyecto_id: number;
}

interface PanelDetalleProyectoProps {
  proyecto: Proyecto;
  onClose: () => void;
}

const PanelDetalleProyecto: React.FC<PanelDetalleProyectoProps> = ({ proyecto, onClose }) => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(false);
  const [editandoTarea, setEditandoTarea] = useState<number | null>(null);
  const [tareaEditada, setTareaEditada] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'detalles' | 'tareas'>('detalles');

  // Clave para localStorage específica del proyecto
  const getStorageKey = (proyectoId: number) => `tareas_completadas_${proyectoId}`;

  // Cargar estado de completado desde localStorage
  const cargarEstadoCompletado = (proyectoId: number): { [key: number]: boolean } => {
    try {
      const stored = localStorage.getItem(getStorageKey(proyectoId));
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error al cargar estado desde localStorage:', error);
      return {};
    }
  };

  // Guardar estado de completado en localStorage
  const guardarEstadoCompletado = (proyectoId: number, tareaId: number, completado: boolean) => {
    try {
      const estadosActuales = cargarEstadoCompletado(proyectoId);
      if (completado) {
        estadosActuales[tareaId] = true;
      } else {
        delete estadosActuales[tareaId];
      }
      localStorage.setItem(getStorageKey(proyectoId), JSON.stringify(estadosActuales));
    } catch (error) {
      console.error('Error al guardar estado en localStorage:', error);
    }
  };

  useEffect(() => {
    if (proyecto.id) {
      cargarTareas();
    }
  }, [proyecto.id]);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      console.log('📋 Cargando tareas para el proyecto:', proyecto.id);
      
      const response = await axiosInstance.get(`/tareas/?proyecto_id=${proyecto.id}`);
      console.log('📋 Respuesta del servidor al cargar tareas:', response.data);
      
      const tareasData = Array.isArray(response.data) ? response.data : [];
      
      // Aplicar estado de completado desde localStorage
      const estadosCompletados = cargarEstadoCompletado(proyecto.id);
      const tareasConEstado = tareasData.map(tarea => ({
        ...tarea,
        completado: estadosCompletados[tarea.id] || false
      }));
      
      console.log('📋 Tareas con estado aplicado:', tareasConEstado.map(t => ({
        id: t.id,
        descripcion: t.descripcion,
        completado: t.completado,
        proyecto_id: t.proyecto_id
      })));
      
      setTareas(tareasConEstado);
    } catch (error: any) {
      console.error('❌ Error al cargar tareas:', error);
      toast.error('Error al cargar las tareas del proyecto');
    } finally {
      setLoading(false);
    }
  };

  const toggleCompletado = async (tareaId: number, completado: boolean) => {
    try {
      // Actualizar estado local inmediatamente
      const nuevoEstado = !completado;
      
      setTareas(prevTareas => 
        prevTareas.map(tarea => 
          tarea.id === tareaId 
            ? { ...tarea, completado: nuevoEstado }
            : tarea
        )
      );
      
      // Guardar en localStorage
      guardarEstadoCompletado(proyecto.id, tareaId, nuevoEstado);
      
      // Mostrar mensaje de éxito
      const mensaje = nuevoEstado ? 'Tarea marcada como completada ✅' : 'Tarea marcada como pendiente 📝';
      toast.success(mensaje);
      
      console.log('✅ Estado actualizado:', { tareaId, completado: nuevoEstado, guardadoEnLocalStorage: true });
      
    } catch (error: any) {
      console.error('❌ Error al actualizar tarea:', error);
      
      // Revertir cambio en caso de error
      setTareas(prevTareas => 
        prevTareas.map(tarea => 
          tarea.id === tareaId 
            ? { ...tarea, completado }
            : tarea
        )
      );
      
      toast.error('No se pudo actualizar el estado de la tarea');
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
      toast.error('La descripción no puede estar vacía');
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
      toast.error('Error al actualizar la tarea');
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
      try {
        await axiosInstance.delete(`/tareas/${tareaId}`);
        cargarTareas(); // Recargar tareas
        toast.success('Tarea eliminada correctamente 🗑️');
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
        toast.error('No se pudo eliminar la tarea');
      }
    }
  };

  const handleTareaCreada = () => {
    cargarTareas(); // Recargar tareas cuando se crea una nueva
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatArrayValue = (value: string[] | string) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value || 'No definido';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {proyecto.nombre}
              </h2>
              <p className="text-blue-100 text-sm">Detalles del proyecto y gestión de tareas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('detalles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'detalles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Detalles del Proyecto</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tareas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'tareas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>Tareas ({tareas.length})</span>
                {tareas.filter(t => t.completado).length > 0 && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                    {tareas.filter(t => t.completado).length} completadas
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'detalles' && (
            <div className="px-6 py-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Información General
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Nombre</p>
                      <p className="text-sm text-blue-900 font-medium">{proyecto.nombre}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Responsable</p>
                      <p className="text-sm text-blue-900">{proyecto.responsable_nombre || proyecto.responsable || 'Sin asignar'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Estado</p>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {proyecto.estado}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Progreso y Prioridad
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Progreso</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-green-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${proyecto.progreso || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-green-700">{proyecto.progreso || 0}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Prioridad</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        proyecto.prioridad === 'Alta' ? 'bg-red-100 text-red-800' :
                        proyecto.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {proyecto.prioridad}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <h3 className="text-sm font-semibold text-purple-800 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Cronograma
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Fecha de Inicio</p>
                      <p className="text-sm text-purple-900">{formatDate(proyecto.fechaInicio)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Fecha de Fin</p>
                      <p className="text-sm text-purple-900">{formatDate(proyecto.fechaFin)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Recursos
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Tipo</p>
                      <p className="text-sm text-gray-900">{formatArrayValue(proyecto.tipo)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Equipo</p>
                      <p className="text-sm text-gray-900">{formatArrayValue(proyecto.equipo)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Objetivo y enlaces */}
              <div className="space-y-4">
                {proyecto.objetivo && (
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                    <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Objetivo del Proyecto
                    </h3>
                    <p className="text-sm text-amber-900 leading-relaxed">{proyecto.objetivo}</p>
                  </div>
                )}

                {proyecto.enlace && (
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
                    <h3 className="text-sm font-semibold text-indigo-800 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Enlaces del Proyecto
                    </h3>
                    <a 
                      href={proyecto.enlace} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-indigo-700 hover:text-indigo-900 underline break-all"
                    >
                      {proyecto.enlace}
                    </a>
                  </div>
                )}

                {proyecto.observaciones && (
                  <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-4 rounded-xl border border-rose-200">
                    <h3 className="text-sm font-semibold text-rose-800 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      Observaciones
                    </h3>
                    <p className="text-sm text-rose-900 leading-relaxed">{proyecto.observaciones}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tareas' && (
            <div className="px-6 py-6">
              {/* Header con botón de nueva tarea */}
              <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Gestión de Tareas
                  </h3>
                  <p className="text-sm text-gray-600">
                    Administra las tareas del proyecto "{proyecto.nombre}"
                  </p>
                </div>
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
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas en este proyecto</h3>
                  <p className="text-gray-500 mb-4">Comienza agregando la primera tarea para organizar el trabajo.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {tareas.map((tarea) => (
                      <div 
                        key={tarea.id} 
                        className={`p-4 border rounded-xl transition-all duration-200 ${
                          tarea.completado 
                            ? 'bg-green-50 border-green-200 shadow-sm' 
                            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-4">
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
                              <div className="space-y-3">
                                <textarea
                                  value={tareaEditada}
                                  onChange={(e) => setTareaEditada(e.target.value)}
                                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  rows={2}
                                  placeholder="Descripción de la tarea..."
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => guardarEdicion(tarea.id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Guardar</span>
                                  </button>
                                  <button
                                    onClick={cancelarEdicion}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors flex items-center space-x-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span>Cancelar</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex-1">
                                {/* Descripción de la tarea con mejor diseño */}
                                <div className={`p-4 rounded-lg transition-all duration-300 ${
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
                                  <div className="flex items-center justify-between mt-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
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
                          <div className="flex space-x-1">
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
                  
                  {/* Footer con estadísticas mejoradas */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Resumen de Tareas
                    </h4>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {/* Total de tareas */}
                      <div className="text-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <div className="text-2xl font-bold text-gray-800">{tareas.length}</div>
                        <div className="text-xs text-gray-600 font-medium">Total de Tareas</div>
                      </div>
                      
                      {/* Tareas completadas */}
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200 shadow-sm">
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
                      <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200 shadow-sm">
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
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-2">
                          <span>Progreso de tareas del proyecto</span>
                          <span className="font-semibold">{Math.round((tareas.filter(t => t.completado).length / tareas.length) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                            style={{ 
                              width: `${Math.round((tareas.filter(t => t.completado).length / tareas.length) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {activeTab === 'tareas' && tareas.length > 0 && (
                <span>
                  {tareas.filter(t => t.completado).length} de {tareas.length} tareas completadas
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Cerrar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelDetalleProyecto;