import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// Vista del Dashboard principal
const Dashboard = () => {
  const [proyectos, setProyectos] = useState([]);
  const [filtros, setFiltros] = useState({
    estado: '',
    equipo: '',
    prioridad: '',
    responsable: ''
  });
  
  useEffect(() => {
    // Aquí normalmente harías una llamada a la API para obtener los proyectos
    // Por ahora, usaremos datos de ejemplo basados en la imagen
    const datosEjemplo = [
      { 
        id: 1, 
        nombre: 'Factura Online', 
        responsable: 'Felipe Gómez', 
        estado: 'En producción', 
        tipo: ['Automatización', 'Desarrollo'], 
        equipo: ['Dirección Comercial'], 
        prioridad: 'Media',
        objetivo: 'Sistema de gestión de facturas',
        fechaInicio: '01/07/2023',
        fechaFin: '15/08/2023',
        progreso: 100,
        enlace: 'https://github.com/andesbpo/factura-online',
        observaciones: 'Proyecto completado y en funcionamiento'
      },
      { 
        id: 2, 
        nombre: 'Factura Auditoria', 
        responsable: 'Felipe Gómez', 
        estado: 'En desarrollo', 
        tipo: ['Automatización'], 
        equipo: ['Dirección Comercial', 'Dirección Financiera'], 
        prioridad: 'Alta',
        objetivo: 'Automatización de facturación',
        fechaInicio: '01/07/2023',
        fechaFin: '15/09/2023',
        progreso: 65,
        enlace: 'https://github.com/andesbpo/factura-auditoria',
        observaciones: 'En fase de pruebas de integración'
      },
      { 
        id: 3, 
        nombre: 'Gestión comercial', 
        responsable: 'Felipe Gómez', 
        estado: 'Desarrollado', 
        tipo: ['Desarrollo'], 
        equipo: ['Dirección Comercial'], 
        prioridad: 'Media',
        objetivo: 'Seguimiento de propuestas comerciales',
        fechaInicio: '01/06/2023',
        fechaFin: '30/08/2023',
        progreso: 100,
        enlace: 'https://github.com/andesbpo/gestion-comercial',
        observaciones: 'Desarrollo completado'
      },
      { 
        id: 4, 
        nombre: 'Contabilidad', 
        responsable: 'Felipe Gómez', 
        estado: 'Pausado', 
        tipo: ['Desarrollo', 'Automatización'], 
        equipo: ['Dirección GH', 'Dirección Financiera'], 
        prioridad: 'Media',
        objetivo: 'Seguimiento de contratos Andes',
        fechaInicio: '01/10/2023',
        fechaFin: '15/11/2023',
        progreso: 45,
        enlace: 'https://github.com/andesbpo/contabilidad',
        observaciones: 'Lógica de seguimiento a contratos implementada'
      },
      { 
        id: 5, 
        nombre: 'Actividad Juego del mes', 
        responsable: 'Felipe Gómez', 
        estado: 'En producción', 
        tipo: ['Desarrollo'], 
        equipo: ['Dirección GH'], 
        prioridad: 'Baja',
        objetivo: 'Actividad juego del mes',
        fechaInicio: '01/08/2023',
        fechaFin: '14/11/2023',
        progreso: 100,
        enlace: 'https://github.com/andesbpo/juego-mes',
        observaciones: 'El item está como desarrollado, se está implementando'
      },
    ];
    
    setProyectos(datosEjemplo);
  }, []);

  const opcionesEstado = {
    pendientes: ['Conceptual', 'Análisis', 'Sin Empezar'],
    enProceso: ['En diseño', 'En desarrollo', 'En curso', 'Etapa pruebas'],
    terminados: ['Cancelado', 'Pausado', 'En producción', 'Desarrollado']
  };

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

  const filtrarProyectos = () => {
    return proyectos.filter(proyecto => {
      return (
        (filtros.estado === '' || proyecto.estado.includes(filtros.estado)) &&
        (filtros.equipo === '' || proyecto.equipo.includes(filtros.equipo)) &&
        (filtros.prioridad === '' || proyecto.prioridad === filtros.prioridad) &&
        (filtros.responsable === '' || proyecto.responsable === filtros.responsable)
      );
    });
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  const getColorEstado = (estado) => {
    if (opcionesEstado.pendientes.includes(estado)) return 'bg-yellow-100 text-yellow-800';
    if (opcionesEstado.enProceso.includes(estado)) return 'bg-blue-100 text-blue-800';
    if (['Cancelado', 'Pausado'].includes(estado)) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800'; // En producción, Desarrollado
  };

  const getColorPrioridad = (prioridad) => {
    if (prioridad === 'Alta') return 'bg-red-100 text-red-800';
    if (prioridad === 'Media') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800'; // Baja
  };

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6 text-green-600">Proyectos Andes BPO</h1>
      <p className="mb-4 text-gray-600">Implementando la transformación en Andes BPO</p>
      
      {/* Filtros rápidos */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select 
            name="estado" 
            value={filtros.estado} 
            onChange={handleFiltroChange}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Todos los estados</option>
            <optgroup label="Pendientes">
              {opcionesEstado.pendientes.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </optgroup>
            <optgroup label="En Proceso">
              {opcionesEstado.enProceso.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </optgroup>
            <optgroup label="Terminados">
              {opcionesEstado.terminados.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </optgroup>
          </select>
        </div>
        
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Equipo</label>
          <select 
            name="equipo" 
            value={filtros.equipo} 
            onChange={handleFiltroChange}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Todos los equipos</option>
            {opcionesEquipo.map(equipo => (
              <option key={equipo} value={equipo}>{equipo}</option>
            ))}
          </select>
        </div>
        
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
          <select 
            name="prioridad" 
            value={filtros.prioridad} 
            onChange={handleFiltroChange}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Todas las prioridades</option>
            {opcionesPrioridad.map(prioridad => (
              <option key={prioridad} value={prioridad}>{prioridad}</option>
            ))}
          </select>
        </div>
        
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
          <select 
            name="responsable" 
            value={filtros.responsable} 
            onChange={handleFiltroChange}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Todos los responsables</option>
            <option value="Felipe Gómez">Felipe Gómez</option>
            {/* Aquí se añadirían más responsables desde la API */}
          </select>
        </div>
      </div>
      
      {/* Tabla estilo Notion */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objetivo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Fin</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progreso</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enlace</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observaciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtrarProyectos().map((proyecto) => (
              <tr key={proyecto.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap font-medium">{proyecto.nombre}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2">
                      {proyecto.responsable.charAt(0)}
                    </div>
                    <span>{proyecto.responsable}</span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getColorEstado(proyecto.estado)}`}>
                    {proyecto.estado}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {proyecto.tipo.map((t, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {proyecto.equipo.map((e, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                        {e}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getColorPrioridad(proyecto.prioridad)}`}>
                    {proyecto.prioridad}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{proyecto.objetivo}</td>
                <td className="px-4 py-4 whitespace-nowrap">{proyecto.fechaInicio}</td>
                <td className="px-4 py-4 whitespace-nowrap">{proyecto.fechaFin}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${proyecto.progreso}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{proyecto.progreso}%</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <a href={proyecto.enlace} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Ver enlace
                  </a>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-gray-500 max-w-xs truncate" title={proyecto.observaciones}>
                    {proyecto.observaciones}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Vista de detalles de un proyecto
const DetalleProyecto = () => {
  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6 text-green-600">Detalle del Proyecto</h1>
      <p className="text-gray-600 mb-6">Esta vista mostrará los detalles de un proyecto específico</p>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p>Contenido del detalle del proyecto</p>
      </div>
    </div>
  );
};

// Vista para crear un nuevo proyecto
const NuevoProyecto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    responsable: '',
    estado: '',
    tipo: [],
    equipo: [],
    prioridad: '',
    objetivo: '',
    fechaInicio: '',
    fechaFin: '',
    enlace: '',
    observaciones: ''
  });

  const opcionesEstado = {
    pendientes: ['Conceptual', 'Análisis', 'Sin Empezar'],
    enProceso: ['En diseño', 'En desarrollo', 'En curso', 'Etapa pruebas'],
    terminados: ['Cancelado', 'Pausado', 'En producción', 'Desarrollado']
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleMultiSelect = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    
    setFormData({
      ...formData,
      [name]: selectedValues
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos a la API
    console.log('Datos del formulario:', formData);
    alert('Proyecto creado con éxito!');
  };

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6 text-green-600">Crear Nuevo Proyecto</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del proyecto</label>
              <input 
                type="text" 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
              <select 
                name="responsable" 
                value={formData.responsable} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="">Seleccionar responsable</option>
                <option value="Felipe Gómez">Felipe Gómez</option>
                {/* Aquí se añadirían más responsables desde la API */}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select 
                name="estado" 
                value={formData.estado} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="">Seleccionar estado</option>
                <optgroup label="Pendientes">
                  {opcionesEstado.pendientes.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </optgroup>
                <optgroup label="En Proceso">
                  {opcionesEstado.enProceso.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </optgroup>
                <optgroup label="Terminados">
                  {opcionesEstado.terminados.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo (múltiple)</label>
              <select 
                name="tipo" 
                multiple 
                value={formData.tipo} 
                onChange={handleMultiSelect}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                required
              >
                {opcionesTipo.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Mantén presionado Ctrl (o Cmd en Mac) para seleccionar múltiples opciones</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipo (múltiple)</label>
              <select 
                name="equipo" 
                multiple 
                value={formData.equipo} 
                onChange={handleMultiSelect}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                required
              >
                {opcionesEquipo.map(equipo => (
                  <option key={equipo} value={equipo}>{equipo}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Mantén presionado Ctrl (o Cmd en Mac) para seleccionar múltiples opciones</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select 
                name="prioridad" 
                value={formData.prioridad} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="">Seleccionar prioridad</option>
                {opcionesPrioridad.map(prioridad => (
                  <option key={prioridad} value={prioridad}>{prioridad}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
              <input 
                type="text" 
                name="objetivo" 
                value={formData.objetivo} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input 
                type="date" 
                name="fechaInicio" 
                value={formData.fechaInicio} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input 
                type="date" 
                name="fechaFin" 
                value={formData.fechaFin} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enlace</label>
              <input 
                type="url" 
                name="enlace" 
                value={formData.enlace} 
                onChange={handleChange} 
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea 
              name="observaciones" 
              value={formData.observaciones} 
              onChange={handleChange} 
              rows="4"
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
            ></textarea>
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Crear Proyecto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente principal que contiene todas las rutas
const Views = () => {
  return (
    <div className="flex-1 bg-gray-100 min-h-screen">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/proyecto/:id" element={<DetalleProyecto />} />
        <Route path="/nuevo-proyecto" element={<NuevoProyecto />} />
      </Routes>
    </div>
  );
};

export default Views;