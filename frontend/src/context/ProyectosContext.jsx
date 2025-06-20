import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
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
        
        // Actualizar localmente primero para UI responsiva
        setProyectos(prev =>
          prev.map(proy => proy.id === id ? { 
            ...proy, 
            [campo]: valor,
            column,
            subcolumn: valor,
            color: getColorByEstado(valor)
          } : proy)
        );
      } else {
        // Actualizar localmente primero para otros campos
        setProyectos(prev =>
          prev.map(proy => proy.id === id ? { ...proy, [campo]: valor } : proy)
        );
      }
      
      // Enviar actualización a la API
      const response = await axios.put(`http://localhost:8000/proyectos/${id}`, apiData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Verificar que la respuesta sea exitosa
      if (response.status === 200) {
        toast.success("Guardado correctamente");
        return true;
      } else {
        throw new Error(`Error al guardar: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      toast.error("Error al guardar: " + (error.response?.data?.detail || error.message || "Error desconocido"));
      
      // Recargar proyectos para asegurar consistencia
      fetchProyectos();
      return false;
    }
  };
  
  // Función para actualizar un proyecto desde Kanban (cambio de columna)
  const updateProyectoFromKanban = async (id, newColumn) => {
    // Encontrar el proyecto
    const proyecto = proyectos.find(p => p.id.toString() === id.toString());
    if (!proyecto) return false;
    
    // Determinar el nuevo estado basado en la columna
    const estadosPosibles = {
      pendientes: ['Conceptual', 'Análisis', 'Sin Empezar'],
      enProceso: ['En diseño', 'En desarrollo', 'En curso', 'Etapa pruebas'],
      terminados: ['Cancelado', 'Pausado', 'En producción', 'Desarrollado']
    };
    
    // Si el proyecto ya tiene un subestado en la columna destino, mantenerlo
    // Si no, asignar el primer subestado de la columna
    let nuevoEstado = proyecto.estado;
    if (!estadosPosibles[newColumn].includes(proyecto.estado)) {
      nuevoEstado = estadosPosibles[newColumn][0];
    }
    
    // Actualizar el proyecto con el nuevo estado
    return await updateProyecto(proyecto.id, 'estado', nuevoEstado);
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
      'Conceptual': 'pendientes',
      'Análisis': 'pendientes',
      'Sin Empezar': 'pendientes',
      'En diseño': 'enProceso',
      'En desarrollo': 'enProceso',
      'En curso': 'enProceso',
      'Etapa pruebas': 'enProceso',
      'Cancelado': 'terminados',
      'Pausado': 'terminados',
      'En producción': 'terminados',
      'Desarrollado': 'terminados'
    };
    
    return estadosMap[estado] || 'pendientes';
  };
  
  const getColorByEstado = (estado) => {
    // Colores para Gantt
    if (['En producción', 'Desarrollado'].includes(estado)) {
      return '#4CAF50'; // Verde
    } else if (['En diseño', 'En desarrollo', 'En curso', 'Etapa pruebas'].includes(estado)) {
      return '#2196F3'; // Azul
    } else if (['Pausado'].includes(estado)) {
      return '#FFC107'; // Amarillo
    } else if (['Cancelado'].includes(estado)) {
      return '#F44336'; // Rojo
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
    createProyecto
  };
  
  return (
    <ProyectosContext.Provider value={value}>
      {children}
    </ProyectosContext.Provider>
  );
};