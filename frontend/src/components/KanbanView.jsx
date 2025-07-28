import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DragOverlay,
  useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProyectos } from '../context/ProyectosContext';


const KanbanView = () => {
  const { proyectos, loading, updateProyectoFromKanban, fetchProyectos, fetchEstados } = useProyectos();

  const [columns, setColumns] = useState([
    { id: 'pendientes', title: 'PENDIENTES', color: 'bg-yellow-50' },
    { id: 'enProceso', title: 'EN PROCESO', color: 'bg-blue-50' },
    { id: 'terminados', title: 'TERMINADOS', color: 'bg-green-50' }
  ]);

  // Estado local para el orden de los proyectos por columna
  const [columnProjects, setColumnProjects] = useState({
    pendientes: [],
    enProceso: [],
    terminados: []
  });

  const [columnCounts, setColumnCounts] = useState({});
  const [activeProject, setActiveProject] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );


  // Debug: mostrar estados disponibles al cargar
  useEffect(() => {
    const showEstados = async () => {
      console.log('=== DEBUG: Obteniendo estados disponibles ===');
      await fetchEstados();
    };
    showEstados();
  }, []);

  // Sincronizar el estado local con los proyectos del contexto
  useEffect(() => {
    // Evitar duplicados al sincronizar, manteniendo solo una instancia de cada proyecto en la columna correcta
    const uniqueProyectos = [...proyectos];
    
    const newColumnProjects = {
      pendientes: uniqueProyectos.filter(p => p.column === 'pendientes'),
      enProceso: uniqueProyectos.filter(p => p.column === 'enProceso'),
      terminados: uniqueProyectos.filter(p => p.column === 'terminados'),
    };
    
    console.log('Sincronizando proyectos por columna:', newColumnProjects); // Debug
    setColumnProjects(newColumnProjects);

    // Actualizar contadores de columnas
    const counts = {};
    columns.forEach(col => {
      counts[col.id] = newColumnProjects[col.id].length;
    });
    setColumnCounts(counts);
  }, [proyectos]);

  const handleDragStart = (event) => {
    const { active } = event;
    const project = proyectos.find(p => p.id.toString() === active.id.toString());
    setActiveProject(project);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveProject(null);
    // No modificar expandedCards aquí, así la expansión se mantiene tras el drag
    if (!over) return;

    const activeProject = proyectos.find(p => p.id.toString() === active.id.toString());
    if (!activeProject) return;

    const fromColumn = activeProject.column;
    let toColumn = fromColumn;

    // Verificar si se soltó directamente sobre una columna
    if (columns.find(col => col.id === over.id)) {
      toColumn = over.id;
    } else {
      // Si se soltó sobre otro proyecto, obtener su columna
      const overProject = proyectos.find(p => p.id.toString() === over.id.toString());
      if (overProject) {
        toColumn = overProject.column;
      }
    }

    console.log(`Moviendo de ${fromColumn} a ${toColumn}`); // Debug
    console.log(`Proyecto actual:`, activeProject); // Debug adicional
    console.log(`Estados de todos los proyectos:`, proyectos.map(p => ({ id: p.id, nombre: p.nombre, estado: p.estado, column: p.column }))); // Debug completo

    // Si se mueve a otra columna
    if (fromColumn !== toColumn) {
      try {
        // Actualizar primero el estado local para un efecto visual inmediato
        setColumnProjects(prev => {
          // Crear nuevo estado asegurando que todas las columnas existen
          const newColumnProjects = {
            pendientes: [...(prev.pendientes || [])],
            enProceso: [...(prev.enProceso || [])],
            terminados: [...(prev.terminados || [])]
          };
          
          // Eliminar el proyecto de cualquier columna donde pudiera estar
          Object.keys(newColumnProjects).forEach(colKey => {
            newColumnProjects[colKey] = newColumnProjects[colKey].filter(p => p.id !== activeProject.id);
          });
          
          // Agregar a la columna destino
          if (!newColumnProjects[toColumn]) {
            newColumnProjects[toColumn] = [];
          }
          newColumnProjects[toColumn].push({ ...activeProject, column: toColumn });
          
          console.log(`Estado actualizado:`, newColumnProjects); // Debug
          return newColumnProjects;
        });
        
        // Luego enviar la actualización al backend
        const success = await updateProyectoFromKanban(activeProject.id, toColumn);
        
        if (success) {
          console.log(`✅ Proyecto ${activeProject.id} movido a columna ${toColumn} exitosamente`);
          // Recargar los datos para asegurar persistencia
          setTimeout(() => {
            fetchProyectos();
          }, 500);
        } else {
          console.error(`❌ Error al guardar proyecto ${activeProject.id} en backend`);
          // Revertir cambio visual si hay error en el backend
          setColumnProjects(prev => {
            const updatedColumns = { ...prev };
            // Quitar el proyecto de todas las columnas
            Object.keys(updatedColumns).forEach(colKey => {
              updatedColumns[colKey] = updatedColumns[colKey].filter(p => p.id !== activeProject.id);
            });
            // Ponerlo en su columna original
            updatedColumns[fromColumn] = [...updatedColumns[fromColumn], activeProject];
            return updatedColumns;
          });
        }
      } catch (error) {
        console.error("Error al mover proyecto:", error);
        // Revertir cambio visual si hay error en el backend
        setColumnProjects(prev => {
          // Volver a sincronizar con los datos originales
          const updatedColumns = { ...prev };
          // Quitar el proyecto de todas las columnas
          Object.keys(updatedColumns).forEach(colKey => {
            updatedColumns[colKey] = updatedColumns[colKey].filter(p => p.id !== activeProject.id);
          });
          // Ponerlo en su columna original
          updatedColumns[fromColumn] = [...updatedColumns[fromColumn], activeProject];
          return updatedColumns;
        });
      }
      return;
    }

    // Si es la misma columna y no es el mismo elemento, reordenar
    if (active.id !== over.id) {
      const columnList = [...columnProjects[fromColumn]];
      const oldIndex = columnList.findIndex(p => p.id.toString() === active.id.toString());
      const newIndex = columnList.findIndex(p => p.id.toString() === over.id.toString());
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newColumnList = arrayMove(columnList, oldIndex, newIndex);
        setColumnProjects(prev => ({ ...prev, [fromColumn]: newColumnList }));
      }
    }
  };


  // Usar el estado local para el orden visual
  const getProjectsByColumn = (columnId) => columnProjects[columnId] || [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-100 text-red-800';
      case 'Media':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progreso) => {
    if (progreso < 25) return 'bg-red-500';
    if (progreso < 50) return 'bg-orange-500';
    if (progreso < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit' 
    });
  };

  const [expandedCards, setExpandedCards] = useState(new Set());

  const ProjectCard = React.memo(({ project }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition
    } = useSortable({ id: project.id.toString() });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition
    };

    const isExpanded = expandedCards.has(project.id);

    // Toggle expansión solo con click (no drag)
    const handleCardClick = (e) => {
      // Evitar drag
      if (e.target.closest('.kanban-drag-handle')) return;
      setExpandedCards(prev => {
        const newSet = new Set(prev);
        if (newSet.has(project.id)) {
          newSet.delete(project.id);
        } else {
          newSet.add(project.id);
        }
        return newSet;
      });
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-white rounded-md shadow-sm mb-2 border-l-4 border-blue-500 hover:shadow-md transition-shadow cursor-pointer p-3`}
        onClick={handleCardClick}
      >
        {/* Header compacto siempre visible, drag handle */}
        <div className="flex justify-between items-start mb-2 kanban-drag-handle" {...attributes} {...listeners}>
          <h3 className="font-medium text-sm text-gray-800 leading-tight">{project.nombre}</h3>
          <span className={`${getPriorityColor(project.prioridad)} px-2 py-0.5 rounded-full text-xs font-medium`}>
            {project.prioridad}
          </span>
        </div>
        <div className="flex items-center mb-2">
          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2 text-xs">
            {(project.responsable_nombre || project.responsable || 'S/A').charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-500 truncate">
            {Array.isArray(project.equipo) ? project.equipo[0] : project.equipo || 'Sin equipo'}
          </span>
        </div>
        <div className="text-xs bg-gray-100 px-2 py-1 rounded mb-2 text-center">
          {project.subcolumn || project.estado}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(project.progreso || 0)}`} 
            style={{ width: `${project.progreso || 0}%` }}
          ></div>
        </div>
        {/* Si está expandida, mostrar detalles debajo del header, sin modificar el header */}
        {isExpanded && (
          <div className="rounded-lg bg-gray-50 border-t border-gray-200 mt-2 px-2 py-2 space-y-2 overflow-hidden">
            {/* Fechas */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-100 px-2 py-1 rounded flex flex-col items-center">
                <span className="text-blue-600 font-semibold">Inicio</span>
                <span className="text-blue-800 whitespace-nowrap">{formatDate(project.fechaInicio)}</span>
              </div>
              <div className="bg-red-100 px-2 py-1 rounded flex flex-col items-center">
                <span className="text-red-600 font-semibold">Fin</span>
                <span className="text-red-800 whitespace-nowrap">{formatDate(project.fechaFin)}</span>
              </div>
            </div>
            {/* Progreso detallado */}
            <div className="bg-white rounded p-2 border flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-700">Progreso</span>
                <span className="text-xs font-bold text-gray-800">{project.progreso || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progreso || 0)}`} 
                  style={{ width: `${project.progreso || 0}%` }}
                ></div>
              </div>
            </div>
            {/* Objetivo si existe */}
            {project.objetivo && (
              <div className="bg-green-100 px-2 py-2 rounded text-xs border border-green-200">
                <span className="text-green-700 font-semibold">Objetivo:</span>
                <div className="text-green-800 text-xs leading-tight break-words">
                  {project.objetivo}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  });

  const Column = ({ column, projects }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: column.id,
    });

    // Calcular estadísticas de la columna
    const totalProjects = projects.length;
    return (
      <div
        ref={setNodeRef}
        className={`${column.color} p-4 rounded-lg shadow-sm flex-1 min-w-[300px] max-w-[350px] min-h-[500px] transition-colors ${
          isOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        }`}
      >
        {/* Header de la columna */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-gray-700">{column.title}</h2>
            <span className="bg-white text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {totalProjects}
            </span>
          </div>
        </div>
        <SortableContext
          items={projects.map((p) => p.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 min-h-[400px]">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            {projects.length === 0 && (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                Arrastra aquí las tarjetas
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  // Calcular estadísticas generales
  const totalProjects = proyectos.length;
  const completedProjects = proyectos.filter(p => p.column === 'terminados').length;
  const inProgressProjects = proyectos.filter(p => p.column === 'enProceso').length;
  const pendingProjects = proyectos.filter(p => p.column === 'pendientes').length;
  const overallProgress = totalProjects > 0 
    ? Math.round(proyectos.reduce((sum, p) => sum + (p.progreso || 0), 0) / totalProjects)
    : 0;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Vista Kanban</h2>
      <p className="text-gray-600 mb-4">
        Gestión ágil de proyectos. Arrastra las tarjetas para cambiar su estado o reordenarlas.
      </p>

      {/* Panel de estadísticas generales */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Resumen General</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-blue-600 text-sm font-medium">Total Proyectos</div>
            <div className="text-2xl font-bold text-blue-800">{totalProjects}</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-yellow-600 text-sm font-medium">Pendientes</div>
            <div className="text-2xl font-bold text-yellow-800">{pendingProjects}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-blue-600 text-sm font-medium">En Proceso</div>
            <div className="text-2xl font-bold text-blue-800">{inProgressProjects}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-green-600 text-sm font-medium">Terminados</div>
            <div className="text-2xl font-bold text-green-800">{completedProjects}</div>
          </div>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              projects={getProjectsByColumn(column.id)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeProject ? (
            <div className="bg-white p-3 rounded-md shadow-lg mb-2 border-l-4 border-blue-500 opacity-90 transform rotate-3">
              {/* Header con nombre y prioridad */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm text-gray-800 leading-tight">{activeProject.nombre}</h3>
                <span className={`${getPriorityColor(activeProject.prioridad)} px-2 py-0.5 rounded-full text-xs font-medium`}>
                  {activeProject.prioridad}
                </span>
              </div>
              
              {/* Responsable y equipo */}
              <div className="flex items-center mb-2">
                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2 text-xs">
                  {(activeProject.responsable_nombre || activeProject.responsable || 'S/A').charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-gray-500 truncate">
                  {Array.isArray(activeProject.equipo) ? activeProject.equipo[0] : activeProject.equipo || 'Sin equipo'}
                </span>
              </div>
              
              {/* Estado actual */}
              <div className="text-xs bg-gray-100 px-2 py-1 rounded mb-2 text-center">
                {activeProject.subcolumn || activeProject.estado}
              </div>
              
              {/* Fechas */}
              <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                <div className="bg-blue-50 px-2 py-1 rounded">
                  <div className="text-blue-600 font-medium">Inicio</div>
                  <div className="text-blue-800">{formatDate(activeProject.fechaInicio)}</div>
                </div>
                <div className="bg-red-50 px-2 py-1 rounded">
                  <div className="text-red-600 font-medium">Fin</div>
                  <div className="text-red-800">{formatDate(activeProject.fechaFin)}</div>
                </div>
              </div>
              
              {/* Progreso mejorado */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700">Progreso</span>
                  <span className="text-xs font-bold text-gray-800">{activeProject.progreso || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(activeProject.progreso || 0)}`} 
                    style={{ width: `${activeProject.progreso || 0}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Objetivo si existe */}
              {activeProject.objetivo && (
                <div className="bg-green-50 px-2 py-1 rounded text-xs">
                  <div className="text-green-600 font-medium mb-1">Objetivo:</div>
                  <div className="text-green-800 text-xs leading-tight line-clamp-2">
                    {activeProject.objetivo}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanView;

const SUBESTADOS = {
  pendientes: [
    { name: 'Conceptual', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Análisis', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Sin empezar', color: 'bg-yellow-100 text-yellow-800' }
  ],
  enProceso: [
    { name: 'En diseño', color: 'bg-blue-100 text-blue-800' },
    { name: 'En desarrollo', color: 'bg-blue-100 text-blue-800' },
    { name: 'En curso', color: 'bg-blue-100 text-blue-800' },
    { name: 'Etapa pruebas', color: 'bg-blue-100 text-blue-800' }
  ],
  terminados: [
    { name: 'Cancelado', color: 'bg-red-100 text-red-800' },
    { name: 'Pausado', color: 'bg-red-100 text-red-800' },
    { name: 'En producción', color: 'bg-green-100 text-green-800' },
    { name: 'Desarollado', color: 'bg-green-100 text-green-800' },
    { name: 'Listo', color: 'bg-green-100 text-green-800' }
  ]
};
