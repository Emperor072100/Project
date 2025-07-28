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
  const { proyectos, loading, updateProyectoFromKanban, fetchProyectos, updateProyecto } = useProyectos();

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

  const [activeProject, setActiveProject] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );


  // Sincronizar el estado local con los proyectos del contexto
  useEffect(() => {
    const newColumnProjects = {
      pendientes: proyectos.filter(p => p.column === 'pendientes'),
      enProceso: proyectos.filter(p => p.column === 'enProceso'),
      terminados: proyectos.filter(p => p.column === 'terminados'),
    };
    
    // Debug: Log de los proyectos por columna
    console.log('🔍 Proyectos por columna:', {
      pendientes: newColumnProjects.pendientes.map(p => ({ id: p.id, nombre: p.nombre, estado: p.estado, column: p.column })),
      enProceso: newColumnProjects.enProceso.map(p => ({ id: p.id, nombre: p.nombre, estado: p.estado, column: p.column })),
      terminados: newColumnProjects.terminados.map(p => ({ id: p.id, nombre: p.nombre, estado: p.estado, column: p.column }))
    });
    
    setColumnProjects(newColumnProjects);
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

    // Si se mueve a otra columna
    if (fromColumn !== toColumn) {
      try {
        console.log(`🔄 KANBAN: Iniciando movimiento de tarjeta`);
        console.log(`   Proyecto: ${activeProject.nombre} (ID: ${activeProject.id})`);
        console.log(`   Estado actual: ${activeProject.estado} (${activeProject.progreso}%)`);
        console.log(`   De columna: ${fromColumn} → A columna: ${toColumn}`);
        
        // Mapeo directo para mostrar inmediatamente el cambio esperado
        // Usando los estados reales del backend
        const expectedStates = {
          'pendientes': { estado: 'Conceptual', progreso: 5 },
          'enProceso': { estado: 'En diseño', progreso: 30 },
          'terminados': { estado: 'Desarrollado', progreso: 95 }
        };
        
        const expectedChange = expectedStates[toColumn];
        console.log(`   Cambio esperado: ${expectedChange.estado} (${expectedChange.progreso}%)`);
        
        const success = await updateProyectoFromKanban(activeProject.id, toColumn);
        
        if (success) {
          console.log(`✅ KANBAN: Proyecto ${activeProject.id} movido exitosamente`);
          // NO recargar inmediatamente - dejar que el contexto maneje la actualización
          // El contexto ya actualiza el estado local, no necesitamos fetchProyectos aquí
        } else {
          console.error(`❌ KANBAN: Error - updateProyectoFromKanban retornó false`);
        }
      } catch (error) {
        console.error("❌ KANBAN: Error al mover proyecto:", error);
        console.error("Detalles del error:", error.response?.data);
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

  // Estados disponibles por columna para cambiar el porcentaje
  // Basado en los estados reales del backend
  const estadosPorColumna = {
    'pendientes': [
      { nombre: 'Conceptual', porcentaje: 5 },
      { nombre: 'Análisis', porcentaje: 15 },
      { nombre: 'Sin Empezar', porcentaje: 0 }
    ],
    'enProceso': [
      { nombre: 'En diseño', porcentaje: 30 },
      { nombre: 'En desarrollo', porcentaje: 50 },
      { nombre: 'En curso', porcentaje: 65 },
      { nombre: 'Etapa pruebas', porcentaje: 80 }
    ],
    'terminados': [
      { nombre: 'Cancelado', porcentaje: 0 },
      { nombre: 'Pausado', porcentaje: 25 },
      { nombre: 'En producción', porcentaje: 100 },
      { nombre: 'Desarrollado', porcentaje: 95 },
      { nombre: 'Listo', porcentaje: 100 }
    ]
  };

  // Función para cambiar el estado dentro de la misma columna
  const cambiarEstadoEnColumna = async (project, nuevoEstado) => {
    try {
      const estadoInfo = Object.values(estadosPorColumna)
        .flat()
        .find(e => e.nombre === nuevoEstado);
      
      if (!estadoInfo) return;

      console.log(`🔄 Cambiando estado en columna: ${project.estado} → ${nuevoEstado} (${estadoInfo.porcentaje}%)`);
      
      // Usar solo updateProyecto con el estado - el contexto se encarga del progreso automáticamente
      console.log(`📤 Actualizando estado del proyecto ${project.id} a "${nuevoEstado}"`);
      const success = await updateProyecto(project.id, 'estado', nuevoEstado);
      
      if (success) {
        console.log(`✅ Estado actualizado exitosamente a "${nuevoEstado}"`);
        
        // Verificar persistencia después de 2 segundos
        setTimeout(async () => {
          console.log(`🔍 Verificando persistencia del proyecto ${project.id}...`);
          await fetchProyectos(true);
        }, 2000);
      } else {
        console.error(`❌ Error al actualizar estado`);
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

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
        className="bg-white rounded-md shadow-sm mb-2 border-l-4 border-blue-500 hover:shadow-md transition-shadow cursor-pointer p-3"
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
            {project.responsable_nombre || project.responsable || 'Sin responsable'}
          </span>
        </div>

        <div className="text-xs bg-gray-100 px-2 py-1 rounded mb-2 text-center">
          {project.estado}
        </div>

        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
          <div 
            key={project.progressKey || `progress-${project.id}-${project.progreso || 0}-${project.lastUpdated || 0}`}
            className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${getProgressColor(project.progreso || 0)}`} 
            style={{ 
              width: `${project.progreso || 0}%`,
              transition: 'width 1s ease-out, background-color 0.5s ease',
              transform: 'translateZ(0)', // Hardware acceleration
              willChange: 'width' // Optimize for animations
            }}
          ></div>
        </div>
        
        {/* Mostrar progreso numérico para debug */}
        <div className="text-xs text-gray-600 text-center mb-1">
          {project.progreso || 0}% - Estado: {project.estado}
        </div>

        {/* Si está expandida, mostrar detalles debajo del header */}
        {isExpanded && (
          <div className="rounded-lg bg-gray-50 border-t border-gray-200 mt-2 px-2 py-2 space-y-2 overflow-hidden">
            {/* Selector de estado para ajustar porcentaje */}
            <div className="bg-white rounded p-2 border">
              <div className="text-xs font-medium text-gray-700 mb-2">Cambiar estado y porcentaje:</div>
              <div className="grid grid-cols-2 gap-1">
                {estadosPorColumna[project.column]?.map((estado) => (
                  <button
                    key={estado.nombre}
                    onClick={(e) => {
                      e.stopPropagation();
                      cambiarEstadoEnColumna(project, estado.nombre);
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      project.estado === estado.nombre
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {estado.nombre} ({estado.porcentaje}%)
                  </button>
                ))}
              </div>
            </div>
            
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
                  key={project.progressKey || `progress-detailed-${project.id}-${project.progreso || 0}-${project.lastUpdated || 0}`}
                  className={`h-2 rounded-full transition-all duration-1000 ease-out ${getProgressColor(project.progreso || 0)}`} 
                  style={{ 
                    width: `${project.progreso || 0}%`,
                    transition: 'width 1s ease-out, background-color 0.5s ease',
                    transform: 'translateZ(0)', // Hardware acceleration
                    willChange: 'width' // Optimize for animations
                  }}
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

    return (
      <div
        ref={setNodeRef}
        className={`${column.color} p-4 rounded-lg shadow-sm flex-1 min-w-[300px] max-w-[350px] min-h-[500px] transition-colors ${
          isOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        }`}
      >
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-gray-700">{column.title}</h2>
            <span className="bg-white text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {projects.length}
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

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Vista Kanban</h2>
      <p className="text-gray-600 mb-4">
        Gestión ágil de proyectos. Arrastra las tarjetas para cambiar su estado.
      </p>

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
              
              {/* Responsable */}
              <div className="flex items-center mb-2">
                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2 text-xs">
                  {(activeProject.responsable_nombre || activeProject.responsable || 'S/A').charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-gray-500 truncate">
                  {activeProject.responsable_nombre || activeProject.responsable || 'Sin responsable'}
                </span>
              </div>
              
              {/* Estado actual */}
              <div className="text-xs bg-gray-100 px-2 py-1 rounded mb-2 text-center">
                {activeProject.estado}
              </div>
              
              {/* Progreso compacto */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                <div 
                  key={activeProject.progressKey || `progress-drag-${activeProject.id}-${activeProject.progreso || 0}-${activeProject.lastUpdated || 0}`}
                  className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${getProgressColor(activeProject.progreso || 0)}`} 
                  style={{ 
                    width: `${activeProject.progreso || 0}%`,
                    transition: 'width 1s ease-out, background-color 0.5s ease',
                    transform: 'translateZ(0)', // Hardware acceleration
                    willChange: 'width' // Optimize for animations
                  }}
                ></div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanView;
