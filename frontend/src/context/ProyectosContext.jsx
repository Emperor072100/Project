import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
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
  
  // Función para obtener todos los proyectos
  const fetchProyectos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/proyectos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Normalizar los datos para que sean consistentes en todas las vistas
      // En la función fetchProyectos
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
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      setError('Error al cargar proyectos');
      toast.error("Error al cargar proyectos");
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
      'En diseño': 30,
      'En desarrollo': 50,
      'En curso': 65,
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
      
      // Preparar los datos para la API
      const apiData = {};
      
      // Mapear los nombres de campos de frontend a backend si es necesario
      switch(campo) {
        case 'fechaInicio':
          apiData['fecha_inicio'] = valor;
          break;
        case 'fechaFin':
          apiData['fecha_fin'] = valor;
          break;
        case 'tipo':
        case 'equipo':
          // Asegurar que estos campos siempre sean arrays
          apiData[campo] = Array.isArray(valor) ? valor : [valor].filter(Boolean);
          break;
        case 'responsable':
          // El backend espera responsable_nombre, no responsable
          apiData['responsable_nombre'] = valor;
          break;
        case 'progreso':
          // Asegurar que progreso sea un número
          apiData[campo] = typeof valor === 'number' ? valor : parseFloat(valor) || 0;
          break;
        case 'nombre':
        case 'objetivo':
        case 'observaciones':
        case 'enlace':
        case 'prioridad':
        case 'estado':
          // Asegurar que estos campos sean strings
          apiData[campo] = String(valor);
          break;
        default:
          apiData[campo] = valor;
      }
      
      console.log(`Actualizando campo ${campo} con valor:`, valor);
      console.log('Datos enviados a la API:', apiData);
      
      // Si estamos actualizando el estado, también actualizamos la columna para Kanban
      if (campo === 'estado') {
        const column = mapEstadoToColumn(valor);
        const progresoAutomatico = getProgresoByEstado(valor);
        
        console.log(`📊 Estado "${valor}" → Progreso automático: ${progresoAutomatico}%`);
        
        // Incluir progreso en los datos a enviar al backend
        apiData.progreso = progresoAutomatico;
        
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
      
      // Enviar actualización a la API
      console.log('📤 Enviando datos a la API:', JSON.stringify(apiData, null, 2));
      const response = await axiosInstance.put(`/proyectos/${id}`, apiData);
      
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
      
      toast.error("Error al guardar: " + (error.response?.data?.detail || error.message || "Error desconocido"));
      
      // Recargar proyectos para asegurar consistencia
      fetchProyectos();
      return false;
    }
  };
  
  // Función para obtener estados disponibles (para debug)
  const fetchEstados = async () => {
    try {
      const response = await axiosInstance.get('/estados');
      console.log('Estados disponibles en la base de datos:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estados:', error);
      return [];
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
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.delete(`http://localhost:8000/proyectos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Preparar datos para la API
      const apiData = {
        ...nuevoProyecto,
        fecha_inicio: nuevoProyecto.fechaInicio,
        fecha_fin: nuevoProyecto.fechaFin
      };
      
      const res = await axios.post('http://localhost:8000/proyectos', apiData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
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
  
  // Cargar proyectos al montar el componente
  useEffect(() => {
    fetchProyectos();
  }, []);
  
  // Valor del contexto
  const value = {
    proyectos,
    loading,
    error,
    fetchProyectos,
    updateProyecto,
    updateProyectoFromKanban,
    deleteProyecto,
    createProyecto,
    fetchEstados
  };
  
  return (
    <ProyectosContext.Provider value={value}>
      {children}
    </ProyectosContext.Provider>
  );
};