import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../services/axiosConfig';
import toast from 'react-hot-toast';

// Crear el contexto
const ProyectosContext = createContext();

// Hook personalizado para usar el contexto
export const useProyectos = () => useContext(ProyectosContext);

// Proveedor del contexto
export const ProyectosProvider = ({ children }) => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estadosDisponibles, setEstadosDisponibles] = useState([]);
  const [prioridadesDisponibles, setPrioridadesDisponibles] = useState([]);
  
  // Flag para prevenir llamadas múltiples durante la inicialización
  const [initialized, setInitialized] = useState(false);
  
  // Función para obtener prioridades disponibles del backend
  const fetchPrioridades = async () => {
    try {
      console.log('🎯 fetchPrioridades called');
      const response = await axiosInstance.get('/prioridades');
      console.log('🎯 Prioridades disponibles en el backend:', response.data);
      setPrioridadesDisponibles(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener prioridades:', error);
      // Prioridades por defecto si no se pueden cargar del backend
      const prioridadesDefault = [
        { id: 1, nivel: 'Alta' },
        { id: 2, nivel: 'Media' },
        { id: 3, nivel: 'Baja' }
      ];
      setPrioridadesDisponibles(prioridadesDefault);
      return prioridadesDefault;
    }
  };
  const fetchEstados = async () => {
    try {
      const response = await axiosInstance.get('/estados');
      console.log('📋 Estados disponibles en el backend:', response.data);
      setEstadosDisponibles(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estados:', error);
      // Estados por defecto si no se pueden cargar del backend
      const estadosDefault = [
        'Conceptual', 'Análisis', 'Sin empezar', 'En diseño', 'En desarrollo', 
        'En curso', 'Etapa pruebas', 'Cancelado', 'Pausado', 'En producción', 
        'Desarrollado', 'Listo'
      ];
      setEstadosDisponibles(estadosDefault);
      return estadosDefault;
    }
  };
  
  // Función para obtener todos los proyectos
  const fetchProyectos = async () => {
    try {
      console.log('🚀 fetchProyectos called');
      setLoading(true);
      const res = await axiosInstance.get('/proyectos');
      // Normalizar los datos para que sean consistentes en todas las vistas
      const proyectosNormalizados = res.data.map((p) => ({
        ...p,
        id: p.id,
        nombre: p.nombre,
        tipo: p.tipos || [], // Cambiado de p.tipo a p.tipos
        equipo: p.equipos || [], // Cambiado de p.equipo a p.equipos
        responsable: p.responsable || '',
        responsable_nombre: p.responsable_nombre || p.responsable,
        responsable_id: p.responsable_id,
        estado: p.estado,
        prioridad: p.prioridad || 'Media',
        objetivo: p.objetivo || '',
        fechaInicio: p.fecha_inicio || p.fechaInicio || '',
        fechaFin: p.fecha_fin || p.fechaFin || '',
        progreso: p.progreso || 0,
        enlace: p.enlace || '',
        observaciones: p.observaciones || '',
        // Campos adicionales para Kanban
        column: mapEstadoToColumn(p.estado),
        subcolumn: p.estado,
        // Campos adicionales para Gantt
        fechaInicioObj: p.fecha_inicio ? new Date(p.fecha_inicio) : new Date(p.fechaInicio || Date.now()),
        fechaFinObj: p.fecha_fin ? new Date(p.fecha_fin) : new Date(p.fechaFin || Date.now()),
        color: getColorByEstado(p.estado)
      }));
      setProyectos(proyectosNormalizados);
      setError(null);
      console.log('✅ Proyectos cargados exitosamente:', proyectosNormalizados.length);
    } catch (error) {
      console.error('❌ Error al cargar proyectos:', error);
      
      // Si es error 401, no mostrar toast de error adicional porque 
      // el interceptor ya maneja la redirección al login
      if (error.response?.status !== 401) {
        setError('Error al cargar proyectos');
        toast.error("Error al cargar proyectos");
      } else {
        console.log('🔐 Error 401 - El interceptor manejará la redirección');
        setError('No autenticado');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Función para calcular progreso automáticamente basado en el estado
  const getProgresoByEstado = (estado) => {
    const progresoMap = {
      // Estados pendientes (0-25%)
      'Conceptual': 5,
      'Análisis': 15,
      'Sin Empezar': 0,
      
      // Estados en proceso (30-80%)
      'En diseño': 60,
      'En desarrollo': 60,
      'En curso': 60,
      'Etapa pruebas': 80,
      
      // Estados terminados (85-100% o casos especiales)
      'Cancelado': 0,
      'Pausado': 25,
      'En producción': 100,
      'Desarrollado': 95,
      'Listo': 100  // Agregado estado Listo
    };
    
    return progresoMap[estado] !== undefined ? progresoMap[estado] : 0;
  };

  // Función para actualizar un proyecto
  const updateProyecto = async (id, campo, valor) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Obtener el proyecto actual
      const proyectoActual = proyectos.find(p => p.id === id);
      if (!proyectoActual) {
        throw new Error('Proyecto no encontrado');
      }
      
      // Crear una copia completa del proyecto con la actualización
      const proyectoActualizado = { ...proyectoActual };
      
      // Mapear los nombres de campos de frontend a backend si es necesario
      switch(campo) {
        case 'fechaInicio':
          proyectoActualizado['fecha_inicio'] = valor;
          break;
        case 'fechaFin':
          proyectoActualizado['fecha_fin'] = valor;
          break;
        case 'tipo':
        case 'equipo':
          // Asegurar que estos campos siempre sean arrays
          proyectoActualizado[campo] = Array.isArray(valor) ? valor : [valor].filter(Boolean);
          break;
        case 'responsable':
          // El backend espera responsable_nombre, no responsable
          proyectoActualizado['responsable_nombre'] = valor;
          break;
        case 'progreso':
          // Asegurar que progreso sea un número
          proyectoActualizado[campo] = typeof valor === 'number' ? valor : parseFloat(valor) || 0;
          break;
        case 'nombre':
        case 'objetivo':
        case 'observaciones':
        case 'enlace':
          proyectoActualizado[campo] = String(valor);
          break;
        case 'prioridad':
          // Validar que la prioridad sea válida antes de asignarla
          const prioridadValida = prioridadesDisponibles.find(p => 
            (typeof p === 'string' && p === valor) || 
            (typeof p === 'object' && p.nivel === valor)
          );
          
          if (!prioridadValida && prioridadesDisponibles.length > 0) {
            console.error(`⚠️ Prioridad "${valor}" no es válida. Prioridades disponibles:`, prioridadesDisponibles);
            toast.error(`Prioridad "${valor}" no es válida`);
            return false;
          }
          
          proyectoActualizado[campo] = String(valor);
          break;
        case 'estado':
          // Validar que el estado sea válido antes de asignarlo
          const estadoValido = estadosDisponibles.find(e => 
            (typeof e === 'string' && e === valor) || 
            (typeof e === 'object' && e.nombre === valor)
          );
          
          if (!estadoValido && estadosDisponibles.length > 0) {
            console.error(`⚠️ Estado "${valor}" no es válido. Estados disponibles:`, estadosDisponibles);
            toast.error(`Estado "${valor}" no es válido`);
            return false;
          }
          
          proyectoActualizado[campo] = String(valor);
          break;
        default:
          proyectoActualizado[campo] = valor;
      }
      
      // Preparar los datos ESPECÍFICOS para PATCH (solo el campo modificado)
      let patchData = {};
      
      // Mapear campos del frontend a campos del backend para PATCH
      switch(campo) {
        case 'estado':
          patchData.estado = proyectoActualizado.estado;
          break;
        case 'tipo':
          patchData.tipos = Array.isArray(proyectoActualizado.tipo) ? proyectoActualizado.tipo : 
                           (proyectoActualizado.tipos ? proyectoActualizado.tipos : []);
          break;
        case 'equipo':
          patchData.equipos = Array.isArray(proyectoActualizado.equipo) ? proyectoActualizado.equipo : 
                              (proyectoActualizado.equipos ? proyectoActualizado.equipos : []);
          break;
        case 'prioridad':
          patchData.prioridad = proyectoActualizado.prioridad;
          break;
        case 'fechaInicio':
        case 'fecha_inicio':
          patchData.fecha_inicio = proyectoActualizado.fecha_inicio || proyectoActualizado.fechaInicio;
          break;
        case 'fechaFin':
        case 'fecha_fin':
          patchData.fecha_fin = proyectoActualizado.fecha_fin || proyectoActualizado.fechaFin;
          break;
        case 'progreso':
          patchData.progreso = Number(proyectoActualizado.progreso) || 0;
          break;
        case 'nombre':
          patchData.nombre = proyectoActualizado.nombre;
          break;
        case 'objetivo':
          patchData.objetivo = proyectoActualizado.objetivo;
          break;
        case 'observaciones':
          patchData.observaciones = proyectoActualizado.observaciones;
          break;
        case 'enlace':
          patchData.enlace = proyectoActualizado.enlace;
          break;
        case 'responsable':
        case 'responsable_nombre':
          patchData.responsable_nombre = proyectoActualizado.responsable_nombre || proyectoActualizado.responsable;
          break;
        default:
          // Para campos no reconocidos, usar el nombre tal como viene
          patchData[campo] = valor;
      }
      
      console.log(`Actualizando campo ${campo} con valor:`, valor);
      console.log('📤 Datos PATCH enviados a la API (solo campos modificados):', JSON.stringify(patchData, null, 2));
      
      // Si estamos actualizando el estado, también actualizamos la columna para Kanban
      if (campo === 'estado') {
        const column = mapEstadoToColumn(valor);
        const progresoAutomatico = getProgresoByEstado(valor);
        
        console.log(`📊 Estado "${valor}" → Progreso automático: ${progresoAutomatico}%`);
        
        // Incluir progreso en los datos PATCH si cambió automáticamente
        if (progresoAutomatico !== (proyectoActual.progreso || 0)) {
          patchData.progreso = progresoAutomatico;
        }
        
        // Actualizar localmente primero para UI responsiva
        setProyectos(prev =>
          prev.map(proy => proy.id === id ? { 
            ...proy, 
            [campo]: valor,
            progreso: progresoAutomatico,
            column,
            subcolumn: valor,
            color: getColorByEstado(valor),
            // Agregar keys para forzar re-render
            lastUpdated: Date.now(),
            progressKey: `progress-${id}-${progresoAutomatico}-${Date.now()}`
          } : proy)
        );
      } else if (campo === 'progreso') {
        // Si se actualiza el progreso manualmente, agregar keys para re-render
        setProyectos(prev =>
          prev.map(proy => proy.id === id ? { 
            ...proy, 
            [campo]: typeof valor === 'number' ? valor : parseFloat(valor) || 0,
            lastUpdated: Date.now(),
            progressKey: `progress-${id}-${valor}-${Date.now()}`
          } : proy)
        );
      } else {
        // Actualizar localmente primero para otros campos
        setProyectos(prev =>
          prev.map(proy => proy.id === id ? { ...proy, [campo]: valor } : proy)
        );
      }
      
      // Enviar PATCH con solo los campos modificados
      console.log('📤 Enviando PATCH con datos específicos:', JSON.stringify(patchData, null, 2));
      // Temporalmente usar PUT mientras debuggeamos PATCH
      const response = await axiosInstance.put(`/proyectos/${id}`, patchData);
      
      console.log('📥 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      // Verificar que la respuesta sea exitosa
      if (response.status === 200) {
        console.log(`✅ Proyecto ${id} actualizado exitosamente en el backend`);
        toast.success("Guardado correctamente");
        return true;
      } else {
        throw new Error(`Error al guardar: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      console.error('📍 Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Mostrar detalles específicos del error 422
      if (error.response?.status === 422) {
        console.error('🔍 Error de validación 422 - Detalles completos:', JSON.stringify(error.response.data, null, 2));
        const validationErrors = error.response?.data?.detail;
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach((err, index) => {
            console.error(`Error ${index + 1}:`, err);
          });
          const errorMessages = validationErrors.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
          toast.error(`Error de validación: ${errorMessages}`);
        } else {
          toast.error("Error de validación: " + (error.response?.data?.detail || "Datos inválidos"));
        }
      } else {
        toast.error("Error al guardar: " + (error.response?.data?.detail || error.message || "Error desconocido"));
      }
      
      // Recargar proyectos para asegurar consistencia
      fetchProyectos();
      return false;
    }
  };

  // Función para actualizar un proyecto desde Kanban (cambio de columna)
  const updateProyectoFromKanban = async (id, newColumn) => {
    try {
      // Encontrar el proyecto
      const proyecto = proyectos.find(p => p.id.toString() === id.toString());
      if (!proyecto) {
        console.error('Proyecto no encontrado:', id);
        return false;
      }
      
      // Mapeo correcto de columnas a estados de la base de datos
      // Basado en los estados disponibles del backend: ['Conceptual', 'Análisis', 'Sin Empezar', 'En diseño', 'En desarrollo', 'En curso', 'Etapa pruebas', 'Cancelado', 'Pausado', 'En producción', 'Desarrollado']
      const columnToEstadoMap = {
        'pendientes': 'Conceptual',  // Estado por defecto cuando se arrastra a pendientes
        'enProceso': 'En diseño',    // Estado por defecto cuando se arrastra a en proceso
        'terminados': 'Desarrollado' // Estado por defecto cuando se arrastra a terminados
      };
      
      const nuevoEstado = columnToEstadoMap[newColumn];
      
      if (!nuevoEstado) {
        console.error(`Columna '${newColumn}' no tiene mapeo de estado válido`);
        return false;
      }
      
      console.log(`Actualizando proyecto ${id} de "${proyecto.estado}" a "${nuevoEstado}"`);
      console.log(`Columna de destino: ${newColumn}`);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Usar el nuevo endpoint PATCH específico para estados
      const nuevoProgreso = getProgresoByEstado(nuevoEstado);
      const updateData = {
        estado: nuevoEstado,
        progreso: nuevoProgreso  // Incluir progreso en la actualización
      };
      
      console.log('📤 Datos enviados para actualización de Kanban:', updateData);
      
      const response = await axiosInstance.patch(`/proyectos/${id}/estado`, updateData);
      
      console.log('📥 Respuesta del servidor (Kanban):', {
        status: response.status,
        data: response.data
      });
      
      if (response.status === 200) {
        // Calcular progreso automático para el nuevo estado
        const nuevoProgreso = getProgresoByEstado(nuevoEstado);
        
        // Actualizar estado local incluyendo el progreso automático
        const column = mapEstadoToColumn(nuevoEstado);
        const timestamp = Date.now();
        
        setProyectos(prev =>
          prev.map(proy => proy.id === id ? { 
            ...proy, 
            estado: nuevoEstado,
            progreso: nuevoProgreso,
            column,
            subcolumn: nuevoEstado,
            // Forzar re-render con keys únicas
            lastUpdated: timestamp,
            progressKey: `progress-${id}-${nuevoProgreso}-${timestamp}`,
            renderKey: `render-${timestamp}`
          } : proy)
        );
        
        console.log(`🔄 Proyecto ${id} actualizado: ${nuevoEstado} (${nuevoProgreso}%)`);
        toast.success(`Proyecto movido correctamente - Progreso: ${nuevoProgreso}%`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error al actualizar proyecto desde Kanban:', error);
      console.error('Detalles del error:', error.response?.data);
      toast.error("Error al mover proyecto: " + (error.response?.data?.detail || error.message));
      return false;
    }
  };
  
  // Función para eliminar un proyecto
  const deleteProyecto = async (id) => {
    try {
      await axiosInstance.delete(`/proyectos/${id}`);
      // Actualizar estado local
      setProyectos(prev => prev.filter(p => p.id !== id));
      toast.success("Proyecto eliminado");
      return true;
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      toast.error("Error al eliminar");
      return false;
    }
  };
  // Función para crear un nuevo proyecto
  const createProyecto = async (nuevoProyecto) => {
    try {
      // Preparar datos para la API
      const apiData = {
        ...nuevoProyecto,
        fecha_inicio: nuevoProyecto.fechaInicio,
        fecha_fin: nuevoProyecto.fechaFin
      };
      const res = await axiosInstance.post('/proyectos', apiData);
      // Añadir el nuevo proyecto al estado
      const proyectoCreado = {
        ...res.data,
        tipo: res.data.tipo || [],
        equipo: res.data.equipo || [],
        responsable_nombre: res.data.responsable_nombre || res.data.responsable,
        fechaInicio: res.data.fecha_inicio || '',
        fechaFin: res.data.fecha_fin || '',
        column: mapEstadoToColumn(res.data.estado),
        subcolumn: res.data.estado,
        fechaInicioObj: res.data.fecha_inicio ? new Date(res.data.fecha_inicio) : new Date(),
        fechaFinObj: res.data.fecha_fin ? new Date(res.data.fecha_fin) : new Date(),
        color: getColorByEstado(res.data.estado)
      };
      setProyectos(prev => [...prev, proyectoCreado]);
      toast.success("Proyecto creado correctamente");
      return true;
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      toast.error("Error al crear proyecto");
      return false;
    }
  };
  
  // Funciones auxiliares
  const mapEstadoToColumn = (estado) => {
    const estadosMap = {
      // Estados pendientes
      'Conceptual': 'pendientes',
      'Análisis': 'pendientes',
      'Sin Empezar': 'pendientes',  // Corregido: con mayúsculas
      
      // Estados en proceso
      'En diseño': 'enProceso',
      'En desarrollo': 'enProceso',
      'En curso': 'enProceso',
      'Etapa pruebas': 'enProceso',
      
      // Estados terminados
      'Cancelado': 'terminados',
      'Pausado': 'terminados',
      'En producción': 'terminados',
      'Desarrollado': 'terminados',  // Corregido: ortografía correcta
      'Listo': 'terminados',  // Agregado estado Listo
      
      // Estados adicionales por compatibilidad
      'Pendiente': 'pendientes',
      'En proceso': 'enProceso',
      'Terminado': 'terminados'
    };
    
    return estadosMap[estado] || 'pendientes';
  };
  
  const getColorByEstado = (estado) => {
    // Colores para Gantt con estados reales de la base de datos
    if (['Cancelado', 'Pausado', 'En producción', 'Desarollado', 'Listo', 'Terminado'].includes(estado)) {
      return '#4CAF50'; // Verde
    } else if (['En diseño', 'En desarrollo', 'En curso', 'Etapa pruebas', 'En proceso'].includes(estado)) {
      return '#2196F3'; // Azul
    } else if (['Conceptual', 'Análisis', 'Sin empezar', 'Pendiente'].includes(estado)) {
      return '#FFC107'; // Amarillo
    } else if (['peruano'].includes(estado)) {
      return '#9C27B0'; // Púrpura para estado "peruano"
    } else {
      return '#9E9E9E'; // Gris
    }
  };
  
  // Cargar proyectos y estados al montar el componente
  useEffect(() => {
    if (initialized) {
      console.log('🛑 Ya inicializado, saltando carga de datos');
      return;
    }
    
    console.log('🚀 Iniciando carga de datos del contexto');
    const initializeData = async () => {
      try {
        setInitialized(true);
        await fetchEstados(); // Cargar estados primero
        await fetchPrioridades(); // Cargar prioridades
        await fetchProyectos(); // Luego cargar proyectos
        console.log('✅ Datos del contexto cargados exitosamente');
      } catch (error) {
        console.error('❌ Error al inicializar datos:', error);
        setError('Error al inicializar datos');
        setLoading(false);
      }
    };
    initializeData();
  }, [initialized]);
  
  // Valor del contexto
  const value = {
    proyectos,
    loading,
    error,
    estadosDisponibles,
    prioridadesDisponibles,
    fetchProyectos,
    fetchEstados,
    fetchPrioridades,
    updateProyecto,
    updateProyectoFromKanban,
    deleteProyecto,
    createProyecto,
  };
  
  return (
    <ProyectosContext.Provider value={value}>
      {children}
    </ProyectosContext.Provider>
  );
};