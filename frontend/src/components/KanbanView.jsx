// import React, { useState, useEffect } from 'react';
// import { DndContext, closestCenter, useSensors, useSensor, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
// import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';

// const KanbanView = () => {
//   // Definir las columnas del tablero Kanban
//   const [columns, setColumns] = useState([
//     { id: 'pendientes', title: 'PENDIENTES', color: 'bg-yellow-50' },
//     { id: 'enProceso', title: 'EN PROCESO', color: 'bg-blue-50' },
//     { id: 'terminados', title: 'TERMINADOS', color: 'bg-green-50' }
//   ]);

//   // Estados para los proyectos y contadores
//   const [projects, setProjects] = useState([]);
//   const [columnCounts, setColumnCounts] = useState({});

//   // Configuración de sensores para drag & drop
//   const sensors = useSensors(
//     useSensor(PointerSensor),
//     useSensor(KeyboardSensor)
//   );

//   useEffect(() => {
//     // Cargar proyectos desde la API (simulado por ahora)
//     const exampleProjects = [
//       { 
//         id: '1', 
//         name: 'Sistema de gestión de facturas', 
//         responsable: 'Felipe Gómez',
//         column: 'pendientes',
//         subcolumn: 'Conceptual',
//         priority: 'Alta',
//         progress: 0,
//         team: 'Dirección Comercial'
//       },
//       { 
//         id: '2', 
//         name: 'Desarrollo Incidencias', 
//         responsable: 'Felipe Gómez',
//         column: 'pendientes',
//         subcolumn: 'Análisis',
//         priority: 'Media',
//         progress: 25,
//         team: 'Dirección TI'
//       },
//       { 
//         id: '3', 
//         name: 'BI Seguimiento Automatismo', 
//         responsable: 'Felipe Gómez',
//         column: 'enProceso',
//         subcolumn: 'En desarrollo',
//         priority: 'Baja',
//         progress: 50,
//         team: 'Dirección TI'
//       },
//       { 
//         id: '4', 
//         name: 'Calidad UX', 
//         responsable: 'Felipe Gómez',
//         column: 'enProceso',
//         subcolumn: 'Etapa pruebas',
//         priority: 'Alta',
//         progress: 75,
//         team: 'Estrategia CX'
//       },
//       { 
//         id: '5', 
//         name: 'Plantillas CRM: Migración', 
//         responsable: 'Felipe Gómez',
//         column: 'terminados',
//         subcolumn: 'En producción',
//         priority: 'Media',
//         progress: 100,
//         team: 'Dirección Comercial'
//       },
//       { 
//         id: '6', 
//         name: 'Contabilización', 
//         responsable: 'Felipe Gómez',
//         column: 'terminados',
//         subcolumn: 'Pausado',
//         priority: 'Media',
//         progress: 30,
//         team: 'Dirección Financiera'
//       },
//       { 
//         id: '7', 
//         name: 'Andes Calibre', 
//         responsable: 'Felipe Gómez',
//         column: 'terminados',
//         subcolumn: 'Desarrollado',
//         priority: 'Alta',
//         progress: 100,
//         team: 'Dirección GH'
//       },
//     ];

//     setProjects(exampleProjects);
    
//     // Calcular contadores por columna
//     const counts = {};
//     columns.forEach(col => {
//       counts[col.id] = exampleProjects.filter(p => p.column === col.id).length;
//     });
//     setColumnCounts(counts);
//   }, []);

//   // Función para manejar el fin del arrastre
//   const handleDragEnd = (event) => {
//     const { active, over } = event;
    
//     if (over && active.id !== over.id) {
//       // Obtener el proyecto y la columna de destino
//       const activeProject = projects.find(p => p.id === active.id);
//       const overColumn = over.id;
      
//       // Si el over.id es una columna, mover el proyecto a esa columna
//       if (columns.some(col => col.id === overColumn)) {
//         setProjects(
//           projects.map(project => 
//             project.id === activeProject.id 
//               ? { ...project, column: overColumn } 
//               : project
//           )
//         );
        
//         // Actualizar contadores
//         const newCounts = { ...columnCounts };
//         newCounts[activeProject.column]--;
//         newCounts[overColumn]++;
//         setColumnCounts(newCounts);
//       }
//     }
//   };

//   // Obtener proyectos por columna
//   const getProjectsByColumn = (columnId) => {
//     return projects.filter(project => project.column === columnId);
//   };

//   // Renderizar el color de prioridad
//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case 'Alta':
//         return 'bg-red-100 text-red-800';
//       case 'Media':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'Baja':
//         return 'bg-green-100 text-green-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Componente para las tarjetas de proyecto
//   const ProjectCard = ({ project }) => {
//     const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
//       id: project.id,
//     });
    
//     const style = {
//       transform: CSS.Transform.toString(transform),
//       transition,
//     };
    
//     return (
//       <div 
//         ref={setNodeRef} 
//         style={style} 
//         {...attributes} 
//         {...listeners}
//         className="bg-white p-3 rounded-md shadow-sm mb-2 cursor-move border-l-4 border-blue-500"
//       >
//         <div className="flex justify-between items-start mb-2">
//           <h3 className="font-medium text-sm">{project.name}</h3>
//           <span className={`${getPriorityColor(project.priority)} px-2 py-0.5 rounded-full text-xs font-medium`}>
//             {project.priority}
//           </span>
//         </div>
//         <div className="flex items-center mb-2">
//           <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2 text-xs">
//             {project.responsable.charAt(0)}
//           </div>
//           <span className="text-xs text-gray-500">{project.team}</span>
//         </div>
//         <div className="text-xs bg-gray-100 px-2 py-1 rounded mb-2">
//           {project.subcolumn}
//         </div>
//         <div className="w-full bg-gray-200 rounded-full h-1.5">
//           <div 
//             className="bg-blue-600 h-1.5 rounded-full" 
//             style={{ width: `${project.progress}%` }}
//           ></div>
//         </div>
//       </div>
//     );
//   };

//   // Componente para las columnas
//   const Column = ({ column, projects }) => {
//     return (
//       <div className={`${column.color} p-4 rounded-lg shadow-sm flex-1 min-w-[300px] max-w-[350px]`}>
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="font-semibold text-gray-700">{column.title}</h2>
//           <span className="bg-white text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
//             {columnCounts[column.id] || 0}
//           </span>
//         </div>
//         <SortableContext items={projects.map(p => p.id)} strategy={horizontalListSortingStrategy}>
//           <div className="space-y-2">
//             {projects.map(project => (
//               <ProjectCard key={project.id} project={project} />
//             ))}
//           </div>
//         </SortableContext>
//       </div>
//     );
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-semibold mb-2">Vista Kanban</h2>
//       <p className="text-gray-600 mb-6">
//         Gestión ágil de proyectos. Arrastra las tarjetas para cambiar su estado.
//       </p>
      
//       <DndContext 
//         sensors={sensors}
//         collisionDetection={closestCenter}
//         onDragEnd={handleDragEnd}
//       >
//         <div className="flex space-x-4 overflow-x-auto pb-4">
//           {columns.map(column => (
//             <Column 
//               key={column.id} 
//               column={column} 
//               projects={getProjectsByColumn(column.id)} 
//             />
//           ))}
//         </div>
//       </DndContext>
//     </div>
//   );
// };

// export default KanbanView;
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

const KanbanView = () => {
  const [columns, setColumns] = useState([
    { id: 'pendientes', title: 'PENDIENTES', color: 'bg-yellow-50' },
    { id: 'enProceso', title: 'EN PROCESO', color: 'bg-blue-50' },
    { id: 'terminados', title: 'TERMINADOS', color: 'bg-green-50' }
  ]);

  const [projects, setProjects] = useState([]);
  const [columnCounts, setColumnCounts] = useState({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    const exampleProjects = [
      {
        id: '1',
        name: 'Sistema de gestión de facturas',
        responsable: 'Felipe Gómez',
        column: 'pendientes',
        subcolumn: 'Conceptual',
        priority: 'Alta',
        progress: 0,
        team: 'Dirección Comercial'
      },
      {
        id: '2',
        name: 'Desarrollo Incidencias',
        responsable: 'Felipe Gómez',
        column: 'pendientes',
        subcolumn: 'Análisis',
        priority: 'Media',
        progress: 25,
        team: 'Dirección TI'
      },
      {
        id: '3',
        name: 'BI Seguimiento Automatismo',
        responsable: 'Felipe Gómez',
        column: 'enProceso',
        subcolumn: 'En desarrollo',
        priority: 'Baja',
        progress: 50,
        team: 'Dirección TI'
      },
      {
        id: '4',
        name: 'Calidad UX',
        responsable: 'Felipe Gómez',
        column: 'enProceso',
        subcolumn: 'Etapa pruebas',
        priority: 'Alta',
        progress: 75,
        team: 'Estrategia CX'
      },
      {
        id: '5',
        name: 'Plantillas CRM: Migración',
        responsable: 'Felipe Gómez',
        column: 'terminados',
        subcolumn: 'En producción',
        priority: 'Media',
        progress: 100,
        team: 'Dirección Comercial'
      },
      {
        id: '6',
        name: 'Contabilización',
        responsable: 'Felipe Gómez',
        column: 'terminados',
        subcolumn: 'Pausado',
        priority: 'Media',
        progress: 30,
        team: 'Dirección Financiera'
      },
      {
        id: '7',
        name: 'Andes Calibre',
        responsable: 'Felipe Gómez',
        column: 'terminados',
        subcolumn: 'Desarrollado',
        priority: 'Alta',
        progress: 100,
        team: 'Dirección GH'
      }
    ];

    setProjects(exampleProjects);

    const counts = {};
    columns.forEach(col => {
      counts[col.id] = exampleProjects.filter(p => p.column === col.id).length;
    });
    setColumnCounts(counts);
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIndex = projects.findIndex(p => p.id === active.id);
    const overIndex = projects.findIndex(p => p.id === over.id);

    if (activeIndex === -1 || overIndex === -1) return;

    const activeProject = projects[activeIndex];
    const overProject = projects[overIndex];

    const sameColumn = activeProject.column === overProject.column;

    let updatedProjects = [...projects];

    if (sameColumn) {
      const columnProjects = projects.filter(p => p.column === activeProject.column);
      const ids = columnProjects.map(p => p.id);
      const oldIndex = ids.indexOf(active.id);
      const newIndex = ids.indexOf(over.id);
      const reordered = arrayMove(columnProjects, oldIndex, newIndex);

      let i = 0;
      updatedProjects = projects.map(p => {
        if (p.column !== activeProject.column) return p;
        return reordered[i++];
      });
    } else {
      updatedProjects[activeIndex] = { ...activeProject, column: overProject.column };
    }

    setProjects(updatedProjects);

    const newCounts = {};
    columns.forEach((col) => {
      newCounts[col.id] = updatedProjects.filter((p) => p.column === col.id).length;
    });
    setColumnCounts(newCounts);
  };

  const getProjectsByColumn = (columnId) =>
    projects.filter((project) => project.column === columnId);

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
    } = useSortable({ id: project.id });

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
          <h3 className="font-medium text-sm">{project.name}</h3>
          <span className={`${getPriorityColor(project.priority)} px-2 py-0.5 rounded-full text-xs font-medium`}>
            {project.priority}
          </span>
        </div>
        <div className="flex items-center mb-2">
          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2 text-xs">
            {project.responsable.charAt(0)}
          </div>
          <span className="text-xs text-gray-500">{project.team}</span>
        </div>
        <div className="text-xs bg-gray-100 px-2 py-1 rounded mb-2">
          {project.subcolumn}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
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
          items={projects.map((p) => p.id)}
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
