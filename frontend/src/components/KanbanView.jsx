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
  const { proyectos, loading, updateProyectoFromKanban } = useProyectos();

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


  // Sincronizar el estado local con los proyectos del contexto
  useEffect(() => {
    // Evitar duplicados al sincronizar, manteniendo solo una instancia de cada proyecto en la columna correcta
    const uniqueProyectos = [...proyectos];
    
    const newColumnProjects = {
      pendientes: uniqueProyectos.filter(p => p.column === 'pendientes'),
      enProceso: uniqueProyectos.filter(p => p.column === 'enProceso'),
      terminados: uniqueProyectos.filter(p => p.column === 'terminados'),
    };
    setColumnProjects(newColumnProjects);

    // Actualizar contadores de columnas
    const counts = {};
    columns.forEach(col => {
      counts[col.id] = newColumnProjects[col.id].length;
    });
    setColumnCounts(counts);
  }, [proyectos, columns]);

  const handleDragStart = (event) => {
    const { active } = event;
    const project = proyectos.find(p => p.id.toString() === active.id.toString());
    setActiveProject(project);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveProject(null);
    
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
        // Actualizar primero el estado local para un efecto visual inmediato
        setColumnProjects(prev => {
          // Eliminar el proyecto de cualquier columna donde pudiera estar
          const newColumnProjects = {};
          Object.keys(prev).forEach(colKey => {
            newColumnProjects[colKey] = prev[colKey].filter(p => p.id !== activeProject.id);
          });
          
          // Agregar a la columna destino
          newColumnProjects[toColumn] = [
            ...newColumnProjects[toColumn],
            { ...activeProject, column: toColumn }
          ];
          
          return newColumnProjects;
        });
        
        // Luego enviar la actualización al backend
        await updateProyectoFromKanban({
          ...activeProject,
          column: toColumn
        });
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

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-white p-3 rounded-md shadow-sm mb-2 cursor-move border-l-4 border-blue-500"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-sm">{project.nombre}</h3>
          <span className={`${getPriorityColor(project.prioridad)} px-2 py-0.5 rounded-full text-xs font-medium`}>
            {project.prioridad}
          </span>
        </div>
        <div className="flex items-center mb-2">
          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2 text-xs">
            {(project.responsable_nombre || project.responsable || 'S/A').charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-500">{Array.isArray(project.equipo) ? project.equipo[0] : project.equipo}</span>
        </div>
        <div className="text-xs bg-gray-100 px-2 py-1 rounded mb-2">
          {project.subcolumn}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${project.progreso}%` }}></div>
        </div>
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-700">{column.title}</h2>
          <span className="bg-white text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
            {projects.length}
          </span>
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
      <p className="text-gray-600 mb-6">
        Gestión ágil de proyectos. Arrastra las tarjetas para cambiar su estado o reordenarlas.
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
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm">{activeProject.nombre}</h3>
                <span className={`${getPriorityColor(activeProject.prioridad)} px-2 py-0.5 rounded-full text-xs font-medium`}>
                  {activeProject.prioridad}
                </span>
              </div>
              <div className="flex items-center mb-2">
                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2 text-xs">
                  {(activeProject.responsable_nombre || activeProject.responsable || 'S/A').charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-gray-500">{Array.isArray(activeProject.equipo) ? activeProject.equipo[0] : activeProject.equipo}</span>
              </div>
              <div className="text-xs bg-gray-100 px-2 py-1 rounded mb-2">
                {activeProject.subcolumn}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${activeProject.progreso}%` }}></div>
              </div>
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
    { name: 'Sin Empezar', color: 'bg-yellow-100 text-yellow-800' }
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
    { name: 'Desarrollado', color: 'bg-green-100 text-green-800' }
  ]
};
