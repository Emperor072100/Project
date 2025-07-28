// components/TablaProyectos.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Proyecto } from '../views';
import { useNavigate } from 'react-router-dom';
import PanelDetalleProyecto from './PanelDetalleProyecto';
import NuevoProyecto from './NuevoProyecto';
import { toast } from 'react-hot-toast';

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
const opcionesEstado = {
  pendientes: ['Conceptual', 'Análisis', 'Sin empezar'],
  enProceso: ['En diseño', 'En desarrollo', 'En curso', 'Etapa pruebas'],
  terminados: ['Cancelado', 'Pausado', 'En producción', 'Desarollado', 'Listo']
};

const formatArrayOrString = (value: string[] | string | undefined): string => {
  if (!value) return '';
  if (Array.isArray(value)) return value.join(', ');
  return value;
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
    acciones: true
  };
  const defaultColumnOrder = [
    'nombre', 'responsable', 'estado', 'tipo', 'equipo', 'prioridad',
    'objetivo', 'fechaInicio', 'fechaFin', 'progreso', 'enlace', 'observaciones', 'acciones'
  ];
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('tablaProyectos_visibleColumns');
    return saved ? JSON.parse(saved) : defaultVisibleColumns;
  });
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('tablaProyectos_columnOrder');
    return saved ? JSON.parse(saved) : defaultColumnOrder;
  });
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

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
      acciones: { key: 'acciones', label: 'Acciones', fixed: true }
    };

    return columnOrder.map(key => allColumns[key]);
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
          <td key={`${proyecto.id}-nombre`} className="px-6 py-4 whitespace-normal">
            <span className="text-green-700 font-medium hover:text-green-900 hover:underline cursor-pointer">
              {proyecto.nombre}
            </span>
          </td>
        );

      case 'responsable':
        return (
          <td key={`${proyecto.id}-responsable`} className="px-6 py-4 whitespace-normal">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                {(proyecto.responsable_nombre || 'S/A').charAt(0).toUpperCase()}
              </span>
              <span>{proyecto.responsable_nombre || 'Sin asignar'}</span>
            </div>
          </td>
        );

      case 'estado':
        return (
          <td key={`${proyecto.id}-estado`} className="px-6 py-4 whitespace-normal">
            {editando.id === proyecto.id && editando.campo === 'estado' ? (
              <div className="space-y-2">
                <div className="font-medium text-xs text-gray-500 mb-1">Pendiente</div>
                <div className="flex flex-wrap gap-1">
                  {opcionesEstado.pendientes.map(estado => (
                    <button
                      key={createUniqueKey('estado', proyecto.id, estado)}
                      onClick={() => {
                        console.log(`🎯 Cambiando estado a: ${estado} para proyecto ${proyecto.id}`);
                        handleSave(proyecto.id, 'estado', estado);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        estado === proyecto.estado
                          ? 'bg-yellow-200 text-yellow-800 ring-2 ring-yellow-500'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                    >
                      {estado}
                    </button>
                  ))}
                </div>

                <div className="font-medium text-xs text-gray-500 mb-1 mt-3">En curso</div>
                <div className="flex flex-wrap gap-1">
                  {opcionesEstado.enProceso.map(estado => (
                    <button
                      key={createUniqueKey('estado', proyecto.id, estado)}
                      onClick={() => {
                        console.log(`🎯 Cambiando estado a: ${estado} para proyecto ${proyecto.id}`);
                        handleSave(proyecto.id, 'estado', estado);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        estado === proyecto.estado
                          ? 'bg-blue-200 text-blue-800 ring-2 ring-blue-500'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      {estado}
                    </button>
                  ))}
                </div>

                <div className="font-medium text-xs text-gray-500 mb-1 mt-3">Completado</div>
                <div className="flex flex-wrap gap-1">
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
                      bgColor = 'bg-red-100';
                      textColor = 'text-red-800';
                      hoverColor = 'hover:bg-red-200';
                      ringColor = 'ring-red-500';
                    }

                    return (
                      <button
                        key={createUniqueKey('estado', proyecto.id, estado)}
                        onClick={() => {
                          console.log(`🎯 Cambiando estado a: ${estado} para proyecto ${proyecto.id}`);
                          handleSave(proyecto.id, 'estado', estado);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          estado === proyecto.estado
                            ? `${bgColor} ${textColor} ring-2 ${ringColor}`
                            : `${bgColor} ${textColor} ${hoverColor}`
                        }`}
                      >
                        {estado}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center ${getColorEstado(proyecto.estado)} cursor-pointer`}
                onClick={() => handleEdit(proyecto.id, 'estado')}
              >
                {proyecto.estado}
              </span>
            )}
          </td>
        );

      case 'tipo':
        return (
          <td key={`${proyecto.id}-tipo`} className="px-6 py-4 whitespace-normal">
            {editando.id === proyecto.id && editando.campo === 'tipo' ? (
              <select
                multiple
                value={Array.isArray(proyecto.tipo) ? proyecto.tipo : [proyecto.tipo]}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, o => o.value);
                  handleSave(proyecto.id, 'tipo', values);
                }}
                className="border p-1 rounded w-full"
              >
                {opcionesTipo.map(op => (
                  <option key={createUniqueKey('tipo', proyecto.id, op)} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            ) : (
              <div onClick={() => handleEdit(proyecto.id, 'tipo')} className="cursor-pointer">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {formatArrayOrString(proyecto.tipo)}
                </span>
              </div>
            )}
          </td>
        );

      case 'equipo':
        return (
          <td key={`${proyecto.id}-equipo`} className="px-6 py-4 whitespace-normal">
            {editando.id === proyecto.id && editando.campo === 'equipo' ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {opcionesEquipo.map(equipo => {
                    let bgColor = '';
                    let textColor = '';

                    switch (equipo) {
                      case 'Dirección TI':
                        bgColor = 'bg-red-100';
                        textColor = 'text-red-800';
                        break;
                      case 'Estrategia CX':
                        bgColor = 'bg-orange-100';
                        textColor = 'text-orange-800';
                        break;
                      case 'Dirección Financiera':
                        bgColor = 'bg-gray-100';
                        textColor = 'text-gray-800';
                        break;
                      case 'Dirección de Servicios':
                        bgColor = 'bg-blue-100';
                        textColor = 'text-blue-800';
                        break;
                      case 'Dirección Comercial':
                        bgColor = 'bg-green-100';
                        textColor = 'text-green-800';
                        break;
                      case 'Dirección GH':
                        bgColor = 'bg-blue-100';
                        textColor = 'text-blue-800';
                        break;
                      case 'Desarrollo CX':
                        bgColor = 'bg-amber-100';
                        textColor = 'text-amber-800';
                        break;
                      default:
                        bgColor = 'bg-gray-100';
                        textColor = 'text-gray-800';
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
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${bgColor} ${textColor} ${
                          isSelected ? `ring-2 ring-${textColor.replace('text-', '')}` : 'opacity-70 hover:opacity-100'
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
                className="cursor-pointer flex flex-wrap gap-1 min-h-[2rem] items-center"
              >
                {Array.isArray(proyecto.equipo) && proyecto.equipo.length > 0 ? proyecto.equipo.map(equipo => {
                  let bgColor = '';
                  let textColor = '';

                  switch (equipo) {
                    case 'Dirección TI':
                      bgColor = 'bg-red-100';
                      textColor = 'text-red-800';
                      break;
                    case 'Estrategia CX':
                      bgColor = 'bg-orange-100';
                      textColor = 'text-orange-800';
                      break;
                    case 'Dirección Financiera':
                      bgColor = 'bg-gray-100';
                      textColor = 'text-gray-800';
                      break;
                    case 'Dirección de Servicios':
                      bgColor = 'bg-blue-100';
                      textColor = 'text-blue-800';
                      break;
                    case 'Dirección Comercial':
                      bgColor = 'bg-green-100';
                      textColor = 'text-green-800';
                      break;
                    case 'Dirección GH':
                      bgColor = 'bg-blue-100';
                      textColor = 'text-blue-800';
                      break;
                    case 'Desarrollo CX':
                      bgColor = 'bg-amber-100';
                      textColor = 'text-amber-800';
                      break;
                    default:
                      bgColor = 'bg-gray-100';
                      textColor = 'text-gray-800';
                  }

                  return (
                    <span
                      key={createUniqueKey('equipo-display', proyecto.id, equipo)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
                    >
                      {equipo}
                    </span>
                  );
                }) : proyecto.equipo && !Array.isArray(proyecto.equipo) ? (
                  <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {proyecto.equipo}
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-dashed border-gray-300 hover:bg-gray-100 transition-colors">
                    + Seleccionar equipo
                  </span>
                )}
              </div>
            )}
          </td>
        );

      case 'prioridad':
        return (
          <td key={`${proyecto.id}-prioridad`} className="px-6 py-4 whitespace-normal">
            {editando.id === proyecto.id && editando.campo === 'prioridad' ? (
              <select
                value={proyecto.prioridad}
                onChange={(e) => handleSave(proyecto.id, 'prioridad', e.target.value)}
                className="border p-1 rounded w-full"
              >
                {opcionesPrioridad.map(p => (
                  <option key={createUniqueKey('prioridad', proyecto.id, p)} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            ) : (
              <span
                className={`${getColorPrioridad(proyecto.prioridad)} px-2 py-1 rounded-full text-xs cursor-pointer`}
                onClick={() => handleEdit(proyecto.id, 'prioridad')}
              >
                {proyecto.prioridad}
              </span>
            )}
          </td>
        );

      case 'objetivo':
        return (
          <td key={`${proyecto.id}-objetivo`} className="px-6 py-4 whitespace-normal">
            {editando.id === proyecto.id && editando.campo === 'objetivo' ? (
              <input
                type="text"
                value={proyecto.objetivo}
                onChange={(e) => handleSave(proyecto.id, 'objetivo', e.target.value)}
                className="border p-1 rounded w-full"
              />
            ) : (
              <span
                onClick={() => handleEdit(proyecto.id, 'objetivo')}
                className="cursor-pointer"
              >
                {proyecto.objetivo}
              </span>
            )}
          </td>
        );

      case 'fechaInicio':
        return (
          <td key={`${proyecto.id}-fechaInicio`} className="px-6 py-4 whitespace-normal">
            {editando.id === proyecto.id && editando.campo === 'fechaInicio' ? (
              <input
                type="date"
                value={proyecto.fechaInicio}
                onChange={(e) => handleSave(proyecto.id, 'fechaInicio', e.target.value)}
                className="border p-1 rounded w-full"
              />
            ) : (
              <span
                onClick={() => handleEdit(proyecto.id, 'fechaInicio')}
                className="cursor-pointer"
              >
                {proyecto.fechaInicio}
              </span>
            )}
          </td>
        );

      case 'fechaFin':
        return (
          <td key={`${proyecto.id}-fechaFin`} className="px-6 py-4 whitespace-normal">
            {editando.id === proyecto.id && editando.campo === 'fechaFin' ? (
              <input
                type="date"
                value={proyecto.fechaFin}
                onChange={(e) => handleSave(proyecto.id, 'fechaFin', e.target.value)}
                className="border p-1 rounded w-full"
              />
            ) : (
              <span
                onClick={() => handleEdit(proyecto.id, 'fechaFin')}
                className="cursor-pointer"
              >
                {proyecto.fechaFin}
              </span>
            )}
          </td>
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
          <td key={`${proyecto.id}-progreso`} className="px-6 py-4 whitespace-normal">
            {editando.id === proyecto.id && editando.campo === 'progreso' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    value={proyecto.progreso || 0}
                    onChange={(e) => handleSave(proyecto.id, 'progreso', parseInt(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    value={proyecto.progreso || 0}
                    onChange={(e) => handleSave(proyecto.id, 'progreso', parseInt(e.target.value))}
                    min="0"
                    max="100"
                    className="w-16 border p-1 rounded"
                  />
                </div>
              </div>
            ) : (
              <div
                onClick={() => handleEdit(proyecto.id, 'progreso')}
                className="cursor-pointer space-y-1"
              >
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{proyecto.progreso || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${getProgressColor(proyecto.progreso || 0)}`}
                    style={{ width: `${proyecto.progreso || 0}%` }}
                  ></div>
                </div>
              </div>
            )}
          </td>
        );

      case 'enlace':
        return (
          <td key={`${proyecto.id}-enlace`} className="px-6 py-4 whitespace-normal">
            <a
              href={proyecto.enlace}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              Ver
            </a>
          </td>
        );

      case 'observaciones':
        return (
          <td key={`${proyecto.id}-observaciones`} className="px-6 py-4 whitespace-normal">
            {editando.id === proyecto.id && editando.campo === 'observaciones' ? (
              <textarea
                value={proyecto.observaciones}
                onChange={(e) => handleSave(proyecto.id, 'observaciones', e.target.value)}
                className="border p-1 rounded w-full"
                rows={3}
              />
            ) : (
              <span
                onClick={() => handleEdit(proyecto.id, 'observaciones')}
                className="block max-w-xs truncate cursor-pointer"
                title={proyecto.observaciones}
              >
                {proyecto.observaciones}
              </span>
            )}
          </td>
        );

      case 'acciones':
        return (
          <td key={`${proyecto.id}-acciones`} className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onVerDetalle?.(proyecto)}
                className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-colors duration-200"
              >
                Ver más
              </button>
              <button
                onClick={() => navigate(`/proyecto/${proyecto.id}`)}
                className="inline-flex items-center px-3 py-1.5 rounded-md bg-green-50 text-green-700 hover:bg-green-100 text-sm font-medium transition-colors duration-200"
              >
                Editar
              </button>
              {onEliminar && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEliminar(proyecto.id);
                  }}
                  className="inline-flex items-center px-3 py-1.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium transition-colors duration-200"
                >
                  Eliminar
                </button>
              )}
            </div>
          </td>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Header con botón de nuevo proyecto */}
      <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
        <div className="flex flex-wrap gap-2">
          <h2 className="text-xl font-semibold text-gray-800">Gestión de Proyectos</h2>
          
          {/* Editor de columnas */}
          <div className="relative">
            <button
              onClick={() => setShowColumnEditor(!showColumnEditor)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Columnas
            </button>
            
            {showColumnEditor && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-3 min-w-64">
                <div className="text-sm font-medium text-gray-700 mb-2">Mostrar/Ocultar y Reordenar Columnas</div>
                <div className="text-xs text-gray-500 mb-3">Arrastra las columnas para reordenarlas</div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {getOrderedColumnConfig().map(column => (
                    <div 
                      key={column.key} 
                      className={`flex items-center gap-2 text-sm p-2 rounded border ${
                        draggedColumn === column.key ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                      } ${!column.fixed ? 'cursor-move' : 'cursor-default'}`}
                      draggable={!column.fixed}
                      onDragStart={(e) => !column.fixed && handleColumnDragStart(e, column.key)}
                      onDragOver={handleColumnDragOver}
                      onDrop={(e) => handleColumnDrop(e, column.key)}
                      onDragEnd={handleColumnDragEnd}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {!column.fixed && (
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                          </svg>
                        )}
                        <input
                          type="checkbox"
                          checked={visibleColumns[column.key]}
                          onChange={() => !column.fixed && toggleColumn(column.key)}
                          disabled={column.fixed}
                          className="rounded"
                        />
                        <span className={column.fixed ? 'text-gray-400' : 'text-gray-700'}>
                          {column.label}
                        </span>
                      </div>
                      {column.fixed && (
                        <span className="text-xs text-gray-400 italic">Fija</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <NuevoProyecto onCreado={handleProyectoCreado} />
        </div>
      </div>

      {/* Tabla con Edición Inline */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-300">
          <table className="min-w-full text-xs text-left bg-white">
            <thead className="bg-gradient-to-r from-green-500 to-green-600 text-white top-0 z-10">
              <tr>
                {getOrderedColumnConfig().filter(col => visibleColumns[col.key]).map(column => (
                  <th key={`header-${column.key}`}
                    className="px-4 py-2 font-semibold text-xs tracking-wide">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtrarProyectos().map((proyecto) => (
                <tr key={proyecto.id}
                  className="hover:bg-green-50/50 transition-all duration-200">
                  {getOrderedColumnConfig()
                    .filter(col => visibleColumns[col.key])
                    .map(column => renderCell(column.key, proyecto))
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
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10">
            <PanelDetalleProyecto
              proyecto={proyectoSeleccionado}
              onClose={() => setProyectoSeleccionado(null)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TablaProyectos;
