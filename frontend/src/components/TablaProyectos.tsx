// components/TablaProyectos.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Proyecto } from '../views';
import { useNavigate } from 'react-router-dom';
import PanelDetalleProyecto from './PanelDetalleProyecto';
import NuevoProyecto from './NuevoProyecto';
import GestionarTareas from './GestionarTareas';
import { toast } from 'react-hot-toast';
import { useProyectos } from '../context/ProyectosContext';
import Swal from 'sweetalert2';

interface TablaProyectosProps {
  proyectos: Proyecto[];
  editando: { id: number | null; campo: string | null };
  handleEdit: (id: number, campo: keyof Proyecto) => void;
  handleSave: (id: number, campo: keyof Proyecto, valor: any) => void;
  getColorEstado: (estado: string) => string;
  getColorPrioridad: (prioridad: string) => string;
  filtrarProyectos: () => Proyecto[];
  onVerDetalle: (proyecto: Proyecto) => void;
  onEliminar?: (id: number) => void;
}

// Options constants
const opcionesTipo = ['Otro', 'Informe', 'Automatización', 'Desarrollo'];
const opcionesEquipo = [
  'Dirección TI',
  'Estrategia CX',
  'Dirección Financiera',
  'Dirección de Servicios',
  'Dirección Comercial',
  'Dirección GH',
  'Desarrollo CX'
];
const opcionesPrioridad = ['Alta', 'Media', 'Baja'];

const formatArrayOrString = (value: string[] | string | undefined): string => {
  if (!value) return '';
  if (Array.isArray(value)) return value.join(', ');
  return value;
};

// Componente de progreso circular
const CircularProgress = ({ progress, size = 50, strokeWidth = 4, onClick }: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  onClick?: () => void;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  // Obtener color basado en el progreso
  const getStrokeColor = (prog: number) => {
    if (prog < 25) return '#ef4444'; // red-500
    if (prog < 50) return '#f97316'; // orange-500
    if (prog < 75) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  // Obtener color de fondo basado en el progreso
  const getBackgroundColor = (prog: number) => {
    if (prog < 25) return 'bg-red-50';
    if (prog < 50) return 'bg-orange-50';
    if (prog < 75) return 'bg-yellow-50';
    return 'bg-green-50';
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center cursor-pointer group rounded-full p-1 transition-all duration-300 hover:shadow-lg ${getBackgroundColor(progress)}`}
      onClick={onClick}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 transition-all duration-300 group-hover:scale-105"
      >
        {/* Círculo de fondo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
          opacity="0.3"
        />
        {/* Círculo de progreso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getStrokeColor(progress)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
          }}
        />
        {/* Punto indicador al final del progreso */}
        {progress > 0 && (
          <circle
            cx={size / 2 + radius * Math.cos(2 * Math.PI * (progress / 100) - Math.PI / 2)}
            cy={size / 2 + radius * Math.sin(2 * Math.PI * (progress / 100) - Math.PI / 2)}
            r={strokeWidth / 2}
            fill={getStrokeColor(progress)}
            className="animate-pulse"
          />
        )}
      </svg>
      {/* Texto del porcentaje */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-700 group-hover:text-emerald-600 transition-colors duration-200">
          {progress}%
        </span>
      </div>
      {/* Tooltip hover */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
        {progress}% completado
      </div>
    </div>
  );
};

// Función auxiliar para obtener colores de prioridad de forma más limpia
const getPrioridadColors = (prioridad: string) => {
  switch (prioridad) {
    case 'Alta': 
      return {
        bg: '#f0fdf4',
        text: '#16a34a',
        border: '#bbf7d0'
      };
    case 'Media': 
      return {
        bg: '#fffbeb',
        text: '#d97706',
        border: '#fed7aa'
      };
    case 'Baja': 
      return {
        bg: '#fef2f2',
        text: '#dc2626',
        border: '#fecaca'
      };
    default: 
      return {
        bg: '#f9fafb',
        text: '#374151',
        border: '#d1d5db'
      };
  }
};

const TablaProyectos: React.FC<TablaProyectosProps> = ({
  proyectos,
  editando,
  handleEdit,
  handleSave,
  getColorEstado,
  getColorPrioridad,
  filtrarProyectos,
  onVerDetalle,
  onEliminar
}) => {
  // Obtener estados y prioridades del contexto
  const { estadosDisponibles, prioridadesDisponibles } = useProyectos();
  
  // Organizar estados dinámicamente basado en los datos del backend
  const opcionesEstado = React.useMemo(() => {
    if (!estadosDisponibles || estadosDisponibles.length === 0) {
      // Estados por defecto si no hay datos del backend
      return {
        pendientes: ['Conceptual', 'Análisis', 'Sin empezar'],
        enProceso: ['En diseño', 'En desarrollo', 'En curso', 'Etapa pruebas'],
        terminados: ['Cancelado', 'Pausado', 'En producción', 'Desarrollado', 'Listo']
      };
    }
    
    // Extraer nombres de estados del backend
    const estados = estadosDisponibles.map(e => typeof e === 'string' ? e : e.nombre || e);
    console.log('📋 Estados disponibles para la tabla:', estados);
    
    // Organizar estados por categorías basándose en nombres comunes
    const pendientes = estados.filter(e => 
      ['conceptual', 'análisis', 'analisis', 'sin empezar', 'pendiente'].some(keyword => 
        e.toLowerCase().includes(keyword)
      )
    );
    
    const enProceso = estados.filter(e => 
      ['diseño', 'desarrollo', 'curso', 'pruebas', 'proceso'].some(keyword => 
        e.toLowerCase().includes(keyword)
      )
    );
    
    const terminados = estados.filter(e => 
      ['cancelado', 'pausado', 'producción', 'produccion', 'desarrollado', 'listo', 'completado', 'terminado'].some(keyword => 
        e.toLowerCase().includes(keyword)
      )
    );
    
    // Si hay estados que no se categorizaron, ponerlos en pendientes
    const categorizados = [...pendientes, ...enProceso, ...terminados];
    const sinCategorizar = estados.filter(e => !categorizados.includes(e));
    
    return {
      pendientes: pendientes.length > 0 ? pendientes : ['Conceptual', 'Análisis', 'Sin empezar'],
      enProceso: enProceso.length > 0 ? enProceso : ['En diseño', 'En desarrollo', 'En curso', 'Etapa pruebas'],
      terminados: terminados.length > 0 ? terminados : ['Cancelado', 'Pausado', 'En producción', 'Desarrollado', 'Listo'],
      otros: sinCategorizar // Estados que no se pudieron categorizar
    };
  }, [estadosDisponibles]);

  // Obtener prioridades dinámicamente del backend
  const opcionesPrioridadDinamicas = React.useMemo(() => {
    if (!prioridadesDisponibles || prioridadesDisponibles.length === 0) {
      // Prioridades por defecto si no hay datos del backend
      return ['Alta', 'Media', 'Baja'];
    }

    // Extraer los niveles de prioridad del backend
    const prioridades = prioridadesDisponibles.map(p => 
      typeof p === 'string' ? p : p.nivel
    );

    console.log('🎯 Prioridades dinámicas procesadas:', prioridades);
    
    return prioridades;
  }, [prioridadesDisponibles]);
  // Debug: Log de los proyectos que llegan
  console.log('🎯 TablaProyectos - Proyectos recibidos:', proyectos.map(p => ({
    id: p.id,
    nombre: p.nombre,
    progreso: p.progreso,
    tipo_progreso: typeof p.progreso,
    estado: p.estado
  })));

  // Si no hay proyectos debido a error de autenticación, mostrar mensaje
  if (!proyectos || proyectos.length === 0) {
    console.log('⚠️ No hay proyectos disponibles. Posible problema de autenticación.');
  }

  const navigate = useNavigate();
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null);
  const [showColumnEditor, setShowColumnEditor] = useState(false);
  const [gestionarTareasModal, setGestionarTareasModal] = useState({
    isOpen: false,
    proyecto: null as Proyecto | null
  });
  // Leer configuración de columnas desde localStorage
  const defaultVisibleColumns = {
    nombre: true,
    responsable: true,
    estado: true,
    tipo: true,
    equipo: true,
    prioridad: true,
    objetivo: true,
    fechaInicio: true,
    fechaFin: true,
    progreso: true,
    enlace: false,
    observaciones: false,
    tareas: true,
    verDetalles: true,
    eliminar: true
  };
  const defaultColumnOrder = [
    'nombre', 'responsable', 'estado', 'tipo', 'equipo', 'prioridad',
    'objetivo', 'fechaInicio', 'fechaFin', 'progreso', 'enlace', 'observaciones', 'tareas', 'verDetalles', 'eliminar'
  ];
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('tablaProyectos_visibleColumns');
    const savedData = saved ? JSON.parse(saved) : defaultVisibleColumns;
    
    // Limpiar configuraciones obsoletas (como 'acciones')
    const cleanedData = { ...defaultVisibleColumns };
    Object.keys(savedData).forEach(key => {
      if (defaultVisibleColumns.hasOwnProperty(key)) {
        cleanedData[key] = savedData[key];
      }
    });
    
    return cleanedData;
  });
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('tablaProyectos_columnOrder');
    const savedOrder = saved ? JSON.parse(saved) : defaultColumnOrder;
    
    // Filtrar columnas obsoletas y agregar nuevas columnas al final
    const validKeys = Object.keys(defaultVisibleColumns);
    const cleanedOrder = savedOrder.filter(key => validKeys.includes(key));
    
    // Agregar nuevas columnas que no estén en el orden guardado
    validKeys.forEach(key => {
      if (!cleanedOrder.includes(key)) {
        cleanedOrder.push(key);
      }
    });
    
    return cleanedOrder;
  });
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  // Limpiar localStorage de configuraciones obsoletas al cargar el componente
  React.useEffect(() => {
    // Actualizar localStorage con configuraciones limpias
    localStorage.setItem('tablaProyectos_visibleColumns', JSON.stringify(visibleColumns));
    localStorage.setItem('tablaProyectos_columnOrder', JSON.stringify(columnOrder));
  }, []); // Solo al montar el componente

  const createUniqueKey = (prefix: string, id: number, value: string) =>
    `${prefix}-${id}-${value.replace(/\s+/g, '-')}`;

  // Función para obtener el color de la barra de progreso según el porcentaje
  const getProgressColor = (progreso: number) => {
    if (progreso < 25) return 'bg-red-500';
    if (progreso < 50) return 'bg-orange-500';
    if (progreso < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Manejar la creación de un nuevo proyecto
  const handleProyectoCreado = () => {
    toast.success("Proyecto creado exitosamente");
  };

  // Función para confirmar eliminación con SweetAlert2
  const handleEliminarProyecto = async (proyectoId: number, nombreProyecto: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      html: `
        <p>Esta acción eliminará permanentemente el proyecto:</p>
        <p><strong>"${nombreProyecto}"</strong></p>
        <p>Para confirmar, escribe <strong>ELIMINAR</strong> en el campo de abajo:</p>
      `,
      input: 'text',
      inputPlaceholder: 'Escribe ELIMINAR para confirmar',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (value !== 'ELIMINAR') {
          return 'Debes escribir exactamente "ELIMINAR" para confirmar';
        }
      },
      preConfirm: (value) => {
        if (value !== 'ELIMINAR') {
          Swal.showValidationMessage('Debes escribir exactamente "ELIMINAR" para confirmar');
          return false;
        }
        return true;
      }
    });

    if (result.isConfirmed) {
      // Llamar a la función onEliminar si está definida
      if (onEliminar) {
        onEliminar(proyectoId);
        
        // Mostrar mensaje de éxito
        Swal.fire({
          title: 'Eliminado!',
          text: 'El proyecto ha sido eliminado correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    }
  };

  // Manejar la visibilidad de columnas
  const toggleColumn = (columnKey: string) => {
    setVisibleColumns(prev => {
      const updated = {
        ...prev,
        [columnKey]: !prev[columnKey]
      };
      localStorage.setItem('tablaProyectos_visibleColumns', JSON.stringify(updated));
      return updated;
    });
  };

  // Manejar el drag and drop de columnas
  const handleColumnDragStart = (e: React.DragEvent, columnKey: string) => {
    setDraggedColumn(columnKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = (e: React.DragEvent, targetColumnKey: string) => {
    e.preventDefault();
    
    if (!draggedColumn || draggedColumn === targetColumnKey) {
      setDraggedColumn(null);
      return;
    }

    const newOrder = [...columnOrder];
    const draggedIndex = newOrder.indexOf(draggedColumn);
    const targetIndex = newOrder.indexOf(targetColumnKey);

    // Remover el elemento arrastrado
    newOrder.splice(draggedIndex, 1);
    // Insertarlo en la nueva posición
    newOrder.splice(targetIndex, 0, draggedColumn);

    setColumnOrder(() => {
      localStorage.setItem('tablaProyectos_columnOrder', JSON.stringify(newOrder));
      return newOrder;
    });
    setDraggedColumn(null);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
  };

  // Definir las columnas y sus configuraciones (ahora organizadas por orden)
  const getOrderedColumnConfig = () => {
    const allColumns = {
      nombre: { key: 'nombre', label: 'Nombre', fixed: true },
      responsable: { key: 'responsable', label: 'Responsable' },
      estado: { key: 'estado', label: 'Estado' },
      tipo: { key: 'tipo', label: 'Tipo' },
      equipo: { key: 'equipo', label: 'Equipo' },
      prioridad: { key: 'prioridad', label: 'Prioridad' },
      objetivo: { key: 'objetivo', label: 'Objetivo' },
      fechaInicio: { key: 'fechaInicio', label: 'Fecha Inicio' },
      fechaFin: { key: 'fechaFin', label: 'Fecha Fin' },
      progreso: { key: 'progreso', label: 'Progreso' },
      enlace: { key: 'enlace', label: 'Enlace' },
      observaciones: { key: 'observaciones', label: 'Observaciones' },
      tareas: { key: 'tareas', label: 'Tareas' },
      verDetalles: { key: 'verDetalles', label: 'Ver', fixed: true },
      eliminar: { key: 'eliminar', label: 'Eliminar', fixed: true }
    };

    return columnOrder.map(key => allColumns[key]).filter(col => col !== undefined);
  };

  // Función para actualizar el equipo en el backend
  const actualizarEquipo = async (proyectoId: number, nuevoEquipo: string[]) => {
    try {
      console.log('Actualizando equipo:', { proyectoId, nuevoEquipo });
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Intentar con PATCH primero (más específico)
      try {
        const response = await axios.patch(
          `http://localhost:8000/proyectos/${proyectoId}/equipo`,
          { equipo: nuevoEquipo },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Respuesta del servidor (PATCH):', response.data);
        toast.success('Equipo actualizado');
        return;
      } catch (patchError: any) {
        console.log('PATCH falló, intentando con PUT...');
        
        // Si PATCH falla, usar PUT pero con datos mínimos
        const response = await axios.put(
          `http://localhost:8000/proyectos/${proyectoId}`,
          { equipo: nuevoEquipo },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Respuesta del servidor (PUT):', response.data);
        toast.success('Equipo actualizado');
      }
    } catch (error: any) {
      console.error('Error completo al actualizar equipo:', error);
      console.error('Respuesta del error:', error?.response?.data);
      console.error('Detalle del error:', JSON.stringify(error?.response?.data?.detail, null, 2));
      toast.error(error?.response?.data?.detail || 'Error al actualizar equipo');
    }
  };

  // Función para renderizar una celda específica
  const renderCell = (columnKey: string, proyecto: any) => {
    switch (columnKey) {
      case 'nombre':
        return (
          <div className="flex flex-col items-center justify-center">
            <span className="text-emerald-700 font-semibold hover:text-emerald-900 hover:underline cursor-pointer transition-colors duration-200 text-center px-2">
              {proyecto.nombre}
            </span>
          </div>
        );

      case 'responsable':
        return (
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-emerald-100 to-green-200 text-emerald-700 text-sm font-bold shadow-md">
              {(proyecto.responsable_nombre || 'S/A').charAt(0).toUpperCase()}
            </span>
            <span className="text-center font-medium text-gray-700">
              {proyecto.responsable_nombre || 'Sin asignar'}
            </span>
          </div>
        );

      case 'estado':
        return (
          <div className="flex flex-col items-center justify-center">
            {editando.id === proyecto.id && editando.campo === 'estado' ? (
              <div className="space-y-3 w-full max-w-xs">
                <div className="text-center">
                  <div className="font-semibold text-xs text-gray-600 mb-2 bg-yellow-50 rounded-lg py-1 px-3">📋 Pendiente</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {opcionesEstado.pendientes.map(estado => (
                      <button
                        key={createUniqueKey('estado', proyecto.id, estado)}
                        onClick={() => {
                          console.log(`🎯 Cambiando estado a: ${estado} para proyecto ${proyecto.id}`);
                          handleSave(proyecto.id, 'estado', estado);
                        }}
                        className={`px-2 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                          estado === proyecto.estado
                            ? 'bg-yellow-200 text-yellow-800 ring-2 ring-yellow-500 shadow-md scale-105'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:shadow-md hover:scale-105'
                        }`}
                      >
                        {estado}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-semibold text-xs text-gray-600 mb-2 bg-blue-50 rounded-lg py-1 px-3">🚀 En Curso</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {opcionesEstado.enProceso.map(estado => (
                      <button
                        key={createUniqueKey('estado', proyecto.id, estado)}
                        onClick={() => {
                          console.log(`🎯 Cambiando estado a: ${estado} para proyecto ${proyecto.id}`);
                          handleSave(proyecto.id, 'estado', estado);
                        }}
                        className={`px-2 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                          estado === proyecto.estado
                            ? 'bg-blue-200 text-blue-800 ring-2 ring-blue-500 shadow-md scale-105'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200 hover:shadow-md hover:scale-105'
                        }`}
                      >
                        {estado}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-semibold text-xs text-gray-600 mb-2 bg-green-50 rounded-lg py-1 px-3">✅ Completado</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {opcionesEstado.terminados.map(estado => {
                      let bgColor = 'bg-green-100';
                      let textColor = 'text-green-800';
                      let hoverColor = 'hover:bg-green-200';
                      let ringColor = 'ring-green-500';

                      if (estado === 'Cancelado') {
                        bgColor = 'bg-red-100';
                        textColor = 'text-red-800';
                        hoverColor = 'hover:bg-red-200';
                        ringColor = 'ring-red-500';
                      } else if (estado === 'Pausado') {
                        bgColor = 'bg-orange-100';
                        textColor = 'text-orange-800';
                        hoverColor = 'hover:bg-orange-200';
                        ringColor = 'ring-orange-500';
                      }

                      return (
                        <button
                          key={createUniqueKey('estado', proyecto.id, estado)}
                          onClick={() => {
                            console.log(`🎯 Cambiando estado a: ${estado} para proyecto ${proyecto.id}`);
                            handleSave(proyecto.id, 'estado', estado);
                          }}
                          className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                            estado === proyecto.estado
                              ? `${bgColor} ${textColor} ring-2 ${ringColor} shadow-md scale-105`
                              : `${bgColor} ${textColor} ${hoverColor} hover:shadow-md hover:scale-105`
                          }`}
                        >
                          {estado}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Agregar categoría "otros" si hay estados sin categorizar */}
                {opcionesEstado.otros && opcionesEstado.otros.length > 0 && (
                  <div className="text-center">
                    <div className="font-semibold text-xs text-gray-600 mb-2 bg-purple-50 rounded-lg py-1 px-3">🔮 Otros</div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {opcionesEstado.otros.map(estado => (
                        <button
                          key={createUniqueKey('estado', proyecto.id, estado)}
                          onClick={() => {
                            console.log(`🎯 Cambiando estado a: ${estado} para proyecto ${proyecto.id}`);
                            handleSave(proyecto.id, 'estado', estado);
                          }}
                          className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                            estado === proyecto.estado
                              ? 'bg-purple-200 text-purple-800 ring-2 ring-purple-500 shadow-md scale-105'
                              : 'bg-purple-100 text-purple-800 hover:bg-purple-200 hover:shadow-md hover:scale-105'
                          }`}
                        >
                          {estado}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center justify-center ${getColorEstado(proyecto.estado)} cursor-pointer hover:shadow-lg hover:scale-110 transition-all duration-200 min-w-[100px]`}
                onClick={() => handleEdit(proyecto.id, 'estado')}
              >
                {proyecto.estado}
              </span>
            )}
          </div>
        );

      case 'tipo':
        return (
          <div className="flex flex-col items-center justify-center">
            {editando.id === proyecto.id && editando.campo === 'tipo' ? (
              <div className="flex flex-wrap gap-2 justify-center">
                {opcionesTipo.map(op => {
                  const isSelected = Array.isArray(proyecto.tipo)
                    ? proyecto.tipo.includes(op)
                    : proyecto.tipo === op;
                  return (
                    <button
                      key={createUniqueKey('tipo', proyecto.id, op)}
                      onClick={() => {
                        let newTipos = Array.isArray(proyecto.tipo)
                          ? [...proyecto.tipo]
                          : proyecto.tipo ? [proyecto.tipo] : [];
                        if (isSelected) {
                          newTipos = newTipos.filter(t => t !== op);
                        } else {
                          newTipos.push(op);
                        }
                        handleSave(proyecto.id, 'tipo', newTipos);
                      }}
                      className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${isSelected ? 'bg-emerald-200 text-emerald-800 ring-2 ring-emerald-500 shadow-md scale-105' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 hover:shadow-md hover:scale-105'}`}
                    >
                      {op}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div onClick={() => handleEdit(proyecto.id, 'tipo')} className="cursor-pointer group flex flex-wrap gap-1 justify-center items-center min-h-[2rem]">
                {Array.isArray(proyecto.tipo) && proyecto.tipo.length > 0 ? proyecto.tipo.map(tipo => (
                  <span
                    key={createUniqueKey('tipo-display', proyecto.id, tipo)}
                    className="px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-100 to-green-200 text-emerald-800 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    {tipo}
                  </span>
                )) : (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 shadow-md">
                    Sin tipo
                  </span>
                )}
              </div>
            )}
          </div>
        );

      case 'equipo':
        return (
          <div className="flex flex-col items-center justify-center">
            {editando.id === proyecto.id && editando.campo === 'equipo' ? (
              <div className="space-y-3 w-full max-w-sm">
                <div className="flex flex-wrap gap-2 justify-center">
                  {opcionesEquipo.map(equipo => {
                    let bgColor = '';
                    let textColor = '';
                    let hoverColor = '';

                    switch (equipo) {
                      case 'Dirección TI':
                        bgColor = 'bg-red-100';
                        textColor = 'text-red-800';
                        hoverColor = 'hover:bg-red-200';
                        break;
                      case 'Estrategia CX':
                        bgColor = 'bg-orange-100';
                        textColor = 'text-orange-800';
                        hoverColor = 'hover:bg-orange-200';
                        break;
                      case 'Dirección Financiera':
                        bgColor = 'bg-gray-100';
                        textColor = 'text-gray-800';
                        hoverColor = 'hover:bg-gray-200';
                        break;
                      case 'Dirección de Servicios':
                        bgColor = 'bg-blue-100';
                        textColor = 'text-blue-800';
                        hoverColor = 'hover:bg-blue-200';
                        break;
                      case 'Dirección Comercial':
                        bgColor = 'bg-green-100';
                        textColor = 'text-green-800';
                        hoverColor = 'hover:bg-green-200';
                        break;
                      case 'Dirección GH':
                        bgColor = 'bg-purple-100';
                        textColor = 'text-purple-800';
                        hoverColor = 'hover:bg-purple-200';
                        break;
                      case 'Desarrollo CX':
                        bgColor = 'bg-amber-100';
                        textColor = 'text-amber-800';
                        hoverColor = 'hover:bg-amber-200';
                        break;
                      default:
                        bgColor = 'bg-gray-100';
                        textColor = 'text-gray-800';
                        hoverColor = 'hover:bg-gray-200';
                    }

                    const isSelected = Array.isArray(proyecto.equipo)
                      ? proyecto.equipo.includes(equipo)
                      : proyecto.equipo === equipo;

                    return (
                      <button
                        key={createUniqueKey('equipo', proyecto.id, equipo)}
                        onClick={async () => {
                          const currentEquipo = Array.isArray(proyecto.equipo) 
                            ? [...proyecto.equipo] 
                            : (proyecto.equipo ? [proyecto.equipo] : []);
                          let newEquipo;

                          if (isSelected) {
                            newEquipo = currentEquipo.filter(e => e !== equipo);
                          } else {
                            newEquipo = [...currentEquipo, equipo];
                          }

                          // Actualizar en el backend primero
                          await actualizarEquipo(proyecto.id, newEquipo);
                          // Luego actualizar en el frontend
                          handleSave(proyecto.id, 'equipo', newEquipo);
                        }}
                        className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${bgColor} ${textColor} ${hoverColor} ${
                          isSelected ? 'ring-2 ring-blue-500 shadow-md scale-105' : 'opacity-80 hover:opacity-100 hover:shadow-md hover:scale-105'
                        }`}
                      >
                        {equipo}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                onClick={() => handleEdit(proyecto.id, 'equipo')}
                className="cursor-pointer flex flex-wrap gap-1 justify-center items-center min-h-[3rem]"
              >
                {Array.isArray(proyecto.equipo) && proyecto.equipo.length > 0 ? proyecto.equipo.map(equipo => {
                  let bgColor = '';
                  let textColor = '';

                  switch (equipo) {
                    case 'Dirección TI':
                      bgColor = 'bg-gradient-to-r from-red-100 to-red-200';
                      textColor = 'text-red-800';
                      break;
                    case 'Estrategia CX':
                      bgColor = 'bg-gradient-to-r from-orange-100 to-orange-200';
                      textColor = 'text-orange-800';
                      break;
                    case 'Dirección Financiera':
                      bgColor = 'bg-gradient-to-r from-gray-100 to-gray-200';
                      textColor = 'text-gray-800';
                      break;
                    case 'Dirección de Servicios':
                      bgColor = 'bg-gradient-to-r from-blue-100 to-blue-200';
                      textColor = 'text-blue-800';
                      break;
                    case 'Dirección Comercial':
                      bgColor = 'bg-gradient-to-r from-green-100 to-green-200';
                      textColor = 'text-green-800';
                      break;
                    case 'Dirección GH':
                      bgColor = 'bg-gradient-to-r from-purple-100 to-purple-200';
                      textColor = 'text-purple-800';
                      break;
                    case 'Desarrollo CX':
                      bgColor = 'bg-gradient-to-r from-amber-100 to-amber-200';
                      textColor = 'text-amber-800';
                      break;
                    default:
                      bgColor = 'bg-gradient-to-r from-gray-100 to-gray-200';
                      textColor = 'text-gray-800';
                  }

                  return (
                    <span
                      key={createUniqueKey('equipo-display', proyecto.id, equipo)}
                      className={`px-3 py-2 rounded-full text-xs font-semibold ${bgColor} ${textColor} shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200`}
                    >
                      {equipo}
                    </span>
                  );
                }) : proyecto.equipo && !Array.isArray(proyecto.equipo) ? (
                  <span className="px-3 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 shadow-md">
                    {proyecto.equipo}
                  </span>
                ) : (
                  <span className="px-4 py-3 rounded-full text-sm font-medium bg-gradient-to-r from-gray-50 to-gray-100 text-gray-500 border-2 border-dashed border-gray-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:border-emerald-300 hover:text-emerald-600 transition-all duration-200 cursor-pointer">
                    + Seleccionar equipo
                  </span>
                )}
              </div>
            )}
          </div>
        );

      case 'prioridad':
        return (
          <div className="flex flex-col items-center justify-center">
            {editando.id === proyecto.id && editando.campo === 'prioridad' ? (
              <div className="flex flex-wrap gap-2 justify-center">
                {opcionesPrioridadDinamicas.map(p => {
                  const colors = getPrioridadColors(p);
                  const isSelected = proyecto.prioridad === p;
                  return (
                    <button
                      key={createUniqueKey('prioridad', proyecto.id, p)}
                      onClick={() => handleSave(proyecto.id, 'prioridad', p)}
                      className={`px-3 py-2 rounded-full text-xs font-bold transition-all duration-200 focus:outline-none shadow-md ${isSelected ? 'scale-105 ring-2 ring-emerald-500' : 'hover:scale-105 hover:ring-2 hover:ring-emerald-300'} `}
                      style={{
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: `2px solid ${colors.border}`,
                        boxShadow: isSelected ? '0 2px 8px rgba(16,185,129,0.15)' : '0 1px 4px rgba(0,0,0,0.08)'
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            ) : (
              <span
                className={`${getColorPrioridad(proyecto.prioridad)} px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer hover:opacity-90 hover:shadow-lg hover:scale-110 transition-all duration-200 min-w-[64px] text-center inline-block`}
                onClick={() => handleEdit(proyecto.id, 'prioridad')}
              >
                {proyecto.prioridad}
              </span>
            )}
          </div>
        );

      case 'objetivo':
        return (
          <div className="flex flex-col items-center justify-center">
            {editando.id === proyecto.id && editando.campo === 'objetivo' ? (
              <input
                type="text"
                value={proyecto.objetivo}
                onChange={(e) => handleSave(proyecto.id, 'objetivo', e.target.value)}
                className="border-2 border-emerald-300 p-1.5 rounded-xl w-full max-w-xs text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-lg"
                placeholder="Ingrese el objetivo..."
              />
            ) : (
              <span
                onClick={() => handleEdit(proyecto.id, 'objetivo')}
                className="cursor-pointer text-center px-3 py-2 rounded-lg bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 max-w-xs block"
              >
                {proyecto.objetivo || 'Sin objetivo definido'}
              </span>
            )}
          </div>
        );

      case 'fechaInicio':
        return (
          <div className="flex flex-col items-center justify-center">
            {editando.id === proyecto.id && editando.campo === 'fechaInicio' ? (
              <input
                type="date"
                value={proyecto.fechaInicio}
                onChange={(e) => handleSave(proyecto.id, 'fechaInicio', e.target.value)}
                className="border-2 border-emerald-300 p-2 rounded-xl w-full max-w-xs text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-lg"
              />
            ) : (
              <span
                onClick={() => handleEdit(proyecto.id, 'fechaInicio')}
                className="cursor-pointer text-center px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-md transition-all duration-200 font-medium"
              >
                {proyecto.fechaInicio || 'Sin fecha'}
              </span>
            )}
          </div>
        );

      case 'fechaFin':
        return (
          <div className="flex flex-col items-center justify-center">
            {editando.id === proyecto.id && editando.campo === 'fechaFin' ? (
              <input
                type="date"
                value={proyecto.fechaFin}
                onChange={(e) => handleSave(proyecto.id, 'fechaFin', e.target.value)}
                className="border-2 border-emerald-300 p-2 rounded-xl w-full max-w-xs text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-lg"
              />
            ) : (
              <span
                onClick={() => handleEdit(proyecto.id, 'fechaFin')}
                className="cursor-pointer text-center px-3 py-2 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 hover:shadow-md transition-all duration-200 font-medium"
              >
                {proyecto.fechaFin || 'Sin fecha'}
              </span>
            )}
          </div>
        );

      case 'progreso':
        // Debug: Log del progreso actual
        console.log(`📊 TablaProyectos - Renderizando progreso para proyecto ${proyecto.id}:`, {
          progreso: proyecto.progreso,
          tipo: typeof proyecto.progreso,
          estado: proyecto.estado,
          nombre: proyecto.nombre
        });
        
        return (
          <div className="flex flex-col items-center justify-center">
            {editando.id === proyecto.id && editando.campo === 'progreso' ? (
              <div className="space-y-3 w-full max-w-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    value={proyecto.progreso || 0}
                    onChange={(e) => handleSave(proyecto.id, 'progreso', parseInt(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="number"
                    value={proyecto.progreso || 0}
                    onChange={(e) => handleSave(proyecto.id, 'progreso', parseInt(e.target.value))}
                    min="0"
                    max="100"
                    className="w-16 border-2 border-emerald-300 p-1 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center">
                <CircularProgress 
                  progress={proyecto.progreso || 0}
                  size={45}
                  strokeWidth={4}
                  onClick={() => handleEdit(proyecto.id, 'progreso')}
                />
              </div>
            )}
          </div>
        );

      case 'enlace':
        return (
          <div className="flex flex-col items-center justify-center">
            {proyecto.enlace ? (
              <a
                href={proyecto.enlace}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-xs hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Ver enlace
              </a>
            ) : (
              <span className="text-gray-400 text-sm italic">Sin enlace</span>
            )}
          </div>
        );



      case 'observaciones':
        return (
          <div className="flex flex-col items-center justify-center">
            {editando.id === proyecto.id && editando.campo === 'observaciones' ? (
              <ObservacionesEditor
                proyecto={proyecto}
                handleSave={handleSave}
              />
            ) : (
              <span
                onClick={() => handleEdit(proyecto.id, 'observaciones')}
                className={`block max-w-xs text-center cursor-pointer px-3 py-2 rounded-lg transition-all duration-200 ${proyecto.observaciones ? 'bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700' : 'bg-yellow-50 text-yellow-700 border border-yellow-300 hover:bg-yellow-100 hover:text-yellow-900'}`}
                title={proyecto.observaciones}
              >
                {proyecto.observaciones ? (
                  proyecto.observaciones.length > 50 
                    ? `${proyecto.observaciones.substring(0, 50)}...` 
                    : proyecto.observaciones
                ) : <span className="italic font-semibold">+ Agregar observación</span>}
              </span>
            )}
          </div>
        );


      case 'acciones':
        return (
          <div className="flex items-center justify-center">
            <button
              onClick={() => onVerDetalle?.(proyecto)}
              className="inline-flex items-center px-2 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver
            </button>
          </div>
        );

      case 'tareas':
        return (
          <div className="flex items-center justify-center">
            <button
              onClick={() => setGestionarTareasModal({ 
                isOpen: true, 
                proyecto: proyecto 
              })}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Tareas
            </button>
          </div>
        );

      case 'eliminar':
        return (
          <div className="flex items-center justify-center">
            {onEliminar && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEliminarProyecto(proyecto.id, proyecto.nombre);
                }}
                className="inline-flex items-center px-2 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            )}
          </div>
        );

      case 'verDetalles':
        return (
          <div className="flex items-center justify-center">
            <button
              onClick={() => onVerDetalle?.(proyecto)}
              className="inline-flex items-center px-2 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // Editor de observaciones con estado local
  const ObservacionesEditor: React.FC<{ proyecto: any; handleSave: (id: number, campo: keyof Proyecto, valor: any) => void }> = ({ proyecto, handleSave }) => {
    const [valor, setValor] = React.useState(proyecto.observaciones || '');

    React.useEffect(() => {
      setValor(proyecto.observaciones || '');
    }, [proyecto.id]);

    const handleBlur = () => {
      if (valor !== proyecto.observaciones) {
        handleSave(proyecto.id, 'observaciones', valor);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave(proyecto.id, 'observaciones', valor);
        (e.target as HTMLTextAreaElement).blur();
      }
    };

    return (
      <textarea
        value={valor}
        onChange={e => setValor(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="border-2 border-emerald-300 p-1.5 rounded-xl w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-lg resize-none"
        rows={2}
        placeholder="Ingrese observaciones..."
        autoFocus
      />
    );
  };

  return (
    <>
      {/* Header con botón de nuevo proyecto - Mejorado */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-5 p-4 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 rounded-2xl border border-emerald-200 shadow-lg">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Gestión de Proyectos
              </h2>
              <p className="text-xs text-gray-600 font-medium">
                {filtrarProyectos().length} proyecto{filtrarProyectos().length !== 1 ? 's' : ''} encontrado{filtrarProyectos().length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {/* Editor de columnas mejorado */}
          <div className="relative">
            <button
              onClick={() => setShowColumnEditor(!showColumnEditor)}
              className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:from-gray-200 hover:to-gray-300 hover:shadow-md flex items-center gap-2 transition-all duration-200 border border-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Columnas
              <svg className={`w-4 h-4 transform transition-transform duration-200 ${showColumnEditor ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showColumnEditor && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-4 min-w-80 backdrop-blur-sm bg-white/95">
                <div className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Configurar Columnas
                </div>
                <div className="text-sm text-gray-600 mb-4 bg-blue-50 p-2 rounded-lg">
                  💡 Arrastra las columnas para reordenarlas
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                  {getOrderedColumnConfig().map(column => (
                    <div 
                      key={column.key} 
                      className={`flex items-center gap-3 text-sm p-3 rounded-xl border-2 transition-all duration-200 ${
                        draggedColumn === column.key 
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 shadow-md' 
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 hover:from-emerald-50 hover:to-green-50 hover:border-emerald-200'
                      } ${!column.fixed ? 'cursor-move' : 'cursor-default'}`}
                      draggable={!column.fixed}
                      onDragStart={(e) => !column.fixed && handleColumnDragStart(e, column.key)}
                      onDragOver={handleColumnDragOver}
                      onDrop={(e) => handleColumnDrop(e, column.key)}
                      onDragEnd={handleColumnDragEnd}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {!column.fixed && (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                          </svg>
                        )}
                        <input
                          type="checkbox"
                          checked={visibleColumns[column.key]}
                          onChange={() => !column.fixed && toggleColumn(column.key)}
                          disabled={column.fixed}
                          className="rounded-md w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className={`font-semibold ${column.fixed ? 'text-gray-500' : 'text-gray-800'}`}>
                          {column.label}
                        </span>
                      </div>
                      {column.fixed && (
                        <span className="text-xs text-gray-500 italic bg-gray-200 px-2 py-1 rounded-lg">
                          Fija
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <NuevoProyecto onCreado={handleProyectoCreado} />
        </div>
      </div>

      {/* Tabla con estilo similar a la de campañas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full text-xs bg-white">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              {getOrderedColumnConfig().filter(col => visibleColumns[col.key]).map(column => (
                <th key={`header-${column.key}`}
                  className="px-4 py-3 font-semibold text-sm text-gray-700 uppercase tracking-wide text-center">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrarProyectos().map((proyecto, index) => (
              <tr key={proyecto.id}
                className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                {getOrderedColumnConfig()
                  .filter(col => visibleColumns[col.key])
                  .map(column => (
                    <td key={`${proyecto.id}-${column.key}`} 
                        className="px-4 py-2 text-center align-middle">
                      <div className="flex justify-center items-center min-h-[1.75rem]">
                        {renderCell(column.key, proyecto)}
                      </div>
                    </td>
                  ))
                }
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Panel de Detalle Modal */}
      {proyectoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setProyectoSeleccionado(null)}
          ></div>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto z-10">
            <PanelDetalleProyecto
              proyecto={proyectoSeleccionado}
              onClose={() => setProyectoSeleccionado(null)}
            />
          </div>
        </div>
      )}

      {/* Modal de Gestión de Tareas */}
      {gestionarTareasModal.isOpen && gestionarTareasModal.proyecto && (
        <GestionarTareas
          proyecto={gestionarTareasModal.proyecto}
          isOpen={gestionarTareasModal.isOpen}
          onClose={() => setGestionarTareasModal({ isOpen: false, proyecto: null })}
        />
      )}
    </>
  );
};

export default TablaProyectos;
