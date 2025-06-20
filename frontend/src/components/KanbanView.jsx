import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor
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

  const [columnCounts, setColumnCounts] = useState({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    // Actualizar contadores de columnas cuando cambian los proyectos
    const counts = {};
    columns.forEach(col => {
      counts[col.id] = proyectos.filter(p => p.column === col.id).length;
    });
    setColumnCounts(counts);
  }, [proyectos, columns]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Encontrar los proyectos involucrados
    const activeProject = proyectos.find(p => p.id.toString() === active.id.toString());
    const overProject = proyectos.find(p => p.id.toString() === over.id.toString());

    if (!activeProject || !overProject) return;

    const sameColumn = activeProject.column === overProject.column;

    if (!sameColumn) {
      // Si se mueve a otra columna, actualizar el estado del proyecto
      await updateProyectoFromKanban(activeProject.id, overProject.column);
    }
    // No necesitamos manejar el reordenamiento dentro de la misma columna
    // ya que no afecta al estado del proyecto
  };

  const getProjectsByColumn = (columnId) =>
    proyectos.filter((project) => project.column === columnId);

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
    return (
      <div
        className={`${column.color} p-4 rounded-lg shadow-sm flex-1 min-w-[300px] max-w-[350px]`}
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
          <div className="space-y-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
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
