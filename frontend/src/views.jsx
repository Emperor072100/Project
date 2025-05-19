import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaSave } from 'react-icons/fa';

const Dashboard = () => {
  const [proyectos, setProyectos] = useState([]);
  const [filtros, setFiltros] = useState({
    estado: '',
    equipo: '',
    prioridad: '',
    responsable: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState({ id: null, campo: null });
  const navigate = useNavigate();

  useEffect(() => {
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
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const getColorEstado = (estado) => {
    if (opcionesEstado.pendientes.includes(estado)) return 'bg-yellow-100 text-yellow-800';
    if (opcionesEstado.enProceso.includes(estado)) return 'bg-blue-100 text-blue-800';
    if (['Cancelado', 'Pausado'].includes(estado)) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getColorPrioridad = (prioridad) => {
    switch(prioridad) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (id, campo) => {
    setEditando({ id, campo });
  };

  const handleSave = (id, campo, valor) => {
    setProyectos(proyectos.map(proy => 
      proy.id === id ? { ...proy, [campo]: valor } : proy
    ));
    setEditando({ id: null, campo: null });
  };

  const handleViewDetails = (id) => {
    navigate(`/proyecto/${id}`);
  };

  return (
    <div className="p-6 w-full bg-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-600">Proyectos Andes BPO</h1>
          <p className="text-gray-600">Implementando la transformación en Andes BPO</p>
        </div>
        <button 
          onClick={() => navigate('/nuevo-proyecto')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Nuevo Proyecto
        </button>
      </div>

      {/* Filtros */}
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
          </select>
        </div>
      </div>

      {/* Tabla de proyectos */}
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {filtrarProyectos().map((proyecto) => (
              <tr key={proyecto.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap font-medium">
                  {editando.id === proyecto.id && editando.campo === 'nombre' ? (
                    <input
                      type="text"
                      value={proyecto.nombre}
                      onChange={(e) => handleSave(proyecto.id, 'nombre', e.target.value)}
                      className="border rounded p-1"
                    />
                  ) : (
                    <span onClick={() => handleViewDetails(proyecto.id)} className="cursor-pointer hover:underline">
                      {proyecto.nombre}
                    </span>
                  )}
                </td>
                
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2">
                      {proyecto.responsable.charAt(0)}
                    </div>
                    <span>{proyecto.responsable}</span>
                  </div>
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {editando.id === proyecto.id && editando.campo === 'estado' ? (
                    <div className="p-2 rounded border bg-white shadow flex flex-col gap-2 min-w-[300px]">
                      <div>
                        <span className="block text-xs font-bold text-gray-500 mb-1">PENDIENTES</span>
                        <div className="flex gap-2 mb-2">
                          {opcionesEstado.pendientes.map(estado => (
                            <button
                              key={estado}
                              type="button"
                              className={`px-3 py-1 rounded-full font-semibold text-sm transition ${proyecto.estado === estado ? 'bg-yellow-300 text-yellow-900 ring-2 ring-yellow-400' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                              onClick={() => handleSave(proyecto.id, 'estado', estado)}
                            >
                              {estado}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-500 mb-1">EN PROCESO</span>
                        <div className="flex gap-2 mb-2">
                          {opcionesEstado.enProceso.map(estado => (
                            <button
                              key={estado}
                              type="button"
                              className={`px-3 py-1 rounded-full font-semibold text-sm transition ${proyecto.estado === estado ? 'bg-blue-300 text-blue-900 ring-2 ring-blue-400' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                              onClick={() => handleSave(proyecto.id, 'estado', estado)}
                            >
                              {estado}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-500 mb-1">TERMINADOS</span>
                        <div className="flex gap-2">
                          {opcionesEstado.terminados.map(estado => (
                            <button
                              key={estado}
                              type="button"
                              className={`px-3 py-1 rounded-full font-semibold text-sm transition ${
                                ['Cancelado', 'Pausado'].includes(estado)
                                  ? (proyecto.estado === estado ? 'bg-red-300 text-red-900 ring-2 ring-red-400' : 'bg-red-100 text-red-700 hover:bg-red-200')
                                  : (proyecto.estado === estado ? 'bg-green-300 text-green-900 ring-2 ring-green-400' : 'bg-green-100 text-green-700 hover:bg-green-200')
                              }`}
                              onClick={() => handleSave(proyecto.id, 'estado', estado)}
                            >
                              {estado}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span 
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getColorEstado(proyecto.estado)}`}
                      onClick={() => handleEdit(proyecto.id, 'estado')}
                      style={{ cursor: 'pointer' }}
                    >
                      {proyecto.estado}
                    </span>
                  )}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {editando.id === proyecto.id && editando.campo === 'tipo' ? (
                    <div className="flex flex-wrap gap-2 p-2 rounded border bg-white shadow min-w-[200px]">
                      {opcionesTipo.map(tipo => (
                        <button
                          key={tipo}
                          type="button"
                          className={`px-3 py-1 rounded-full font-semibold text-sm transition ${
                            proyecto.tipo.includes(tipo)
                              ? 'bg-gray-400 text-white ring-2 ring-gray-500'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          onClick={() => {
                            const nuevoTipo = proyecto.tipo.includes(tipo)
                              ? proyecto.tipo.filter(t => t !== tipo)
                              : [...proyecto.tipo, tipo];
                            handleSave(proyecto.id, 'tipo', nuevoTipo);
                          }}
                        >
                          {tipo}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div 
                      className="flex flex-wrap gap-1"
                      onClick={() => handleEdit(proyecto.id, 'tipo')}
                    >
                      {proyecto.tipo.map((t, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {editando.id === proyecto.id && editando.campo === 'equipo' ? (
                    <div className="flex flex-wrap gap-2 p-2 rounded border bg-white shadow min-w-[200px]">
                      {opcionesEquipo.map(equipo => (
                        <button
                          key={equipo}
                          type="button"
                          className={`px-3 py-1 rounded-full font-semibold text-sm transition ${
                            proyecto.equipo.includes(equipo)
                              ? 'bg-blue-500 text-white ring-2 ring-blue-400'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                          onClick={() => {
                            const nuevoEquipo = proyecto.equipo.includes(equipo)
                              ? proyecto.equipo.filter(e => e !== equipo)
                              : [...proyecto.equipo, equipo];
                            handleSave(proyecto.id, 'equipo', nuevoEquipo);
                          }}
                        >
                          {equipo}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div 
                      className="flex flex-wrap gap-1"
                      onClick={() => handleEdit(proyecto.id, 'equipo')}
                    >
                      {proyecto.equipo.map((e, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                          {e}
                        </span>
                      ))}
                    </div>
                  )}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {editando.id === proyecto.id && editando.campo === 'prioridad' ? (
                    <div className="flex gap-2 p-2 rounded border bg-white shadow min-w-[180px]">
                      {opcionesPrioridad.map(prioridad => (
                        <button
                          key={prioridad}
                          type="button"
                          className={`px-3 py-1 rounded-full font-semibold text-sm transition ${
                            prioridad === 'Alta'
                              ? (proyecto.prioridad === prioridad ? 'bg-red-200 text-red-800 ring-2 ring-red-300' : 'bg-red-100 text-red-700 hover:bg-red-200')
                              : prioridad === 'Media'
                                ? (proyecto.prioridad === prioridad ? 'bg-yellow-200 text-yellow-800 ring-2 ring-yellow-300' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200')
                                : (proyecto.prioridad === prioridad ? 'bg-green-200 text-green-800 ring-2 ring-green-300' : 'bg-green-100 text-green-700 hover:bg-green-200')
                          }`}
                          onClick={() => handleSave(proyecto.id, 'prioridad', prioridad)}
                        >
                          {prioridad}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span 
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        proyecto.prioridad === 'Alta'
                          ? 'bg-red-200 text-red-800'
                          : proyecto.prioridad === 'Media'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-green-200 text-green-800'
                      }`}
                      onClick={() => handleEdit(proyecto.id, 'prioridad')}
                      style={{ cursor: 'pointer' }}
                    >
                      {proyecto.prioridad}
                    </span>
                  )}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {editando.id === proyecto.id && editando.campo === 'objetivo' ? (
                    <input
                      type="text"
                      value={proyecto.objetivo}
                      onChange={(e) => handleSave(proyecto.id, 'objetivo', e.target.value)}
                      className="border rounded p-1 w-full"
                    />
                  ) : (
                    <span onClick={() => handleEdit(proyecto.id, 'objetivo')}>
                      {proyecto.objetivo}
                    </span>
                  )}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {editando.id === proyecto.id && editando.campo === 'fechaInicio' ? (
                    <input
                      type="date"
                      value={proyecto.fechaInicio}
                      onChange={(e) => handleSave(proyecto.id, 'fechaInicio', e.target.value)}
                      className="border rounded p-1"
                    />
                  ) : (
                    <span onClick={() => handleEdit(proyecto.id, 'fechaInicio')}>
                      {proyecto.fechaInicio}
                    </span>
                  )}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {editando.id === proyecto.id && editando.campo === 'fechaFin' ? (
                    <input
                      type="date"
                      value={proyecto.fechaFin}
                      onChange={(e) => handleSave(proyecto.id, 'fechaFin', e.target.value)}
                      className="border rounded p-1"
                    />
                  ) : (
                    <span onClick={() => handleEdit(proyecto.id, 'fechaFin')}>
                      {proyecto.fechaFin}
                    </span>
                  )}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {editando.id === proyecto.id && editando.campo === 'progreso' ? (
                    <div className="flex items-center gap-2 w-32">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={proyecto.progreso}
                        onChange={(e) => handleSave(proyecto.id, 'progreso', Number(e.target.value))}
                        className="w-24"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={proyecto.progreso}
                        onChange={(e) => handleSave(proyecto.id, 'progreso', Number(e.target.value))}
                        className="w-12 border rounded p-1 text-xs"
                      />
                      <button
                        onClick={() => setEditando({ id: null, campo: null })}
                        className="text-green-600 hover:text-green-800"
                        title="Guardar"
                      >
                        <FaSave size={16} />
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => handleEdit(proyecto.id, 'progreso')} className="cursor-pointer">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full" 
                          style={{ width: `${proyecto.progreso}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{proyecto.progreso}%</span>
                    </div>
                  )}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  <a 
                    href={proyecto.enlace} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline"
                  >
                    Ver enlace
                  </a>
                </td>

                <td className="px-4 py-4">
                  {editando.id === proyecto.id && editando.campo === 'observaciones' ? (
                    <textarea
                      value={proyecto.observaciones}
                      onChange={(e) => handleSave(proyecto.id, 'observaciones', e.target.value)}
                      className="border rounded p-1 w-full"
                      rows="3"
                    />
                  ) : (
                    <p 
                      className="text-sm text-gray-500 max-w-xs truncate" 
                      title={proyecto.observaciones}
                      onClick={() => handleEdit(proyecto.id, 'observaciones')}
                    >
                      {proyecto.observaciones}
                    </p>
                  )}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {editando.id === proyecto.id ? (
                      <button
                        onClick={() => setEditando({ id: null, campo: null })}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaSave size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(proyecto.id, 'nombre')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DetalleProyecto = () => {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simular carga de datos desde API
    const proyectosGuardados = JSON.parse(localStorage.getItem('proyectos')) || [];
    const proyectoEncontrado = proyectosGuardados.find(p => p.id === parseInt(id));
    
    if (proyectoEncontrado) {
      setProyecto(proyectoEncontrado);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  if (!proyecto) return <div>Cargando...</div>;

  return (
    <div className="p-6 w-full bg-white">
      <button 
        onClick={() => navigate(-1)}
        className="mb-4 text-gray-600 hover:text-gray-800 flex items-center"
      >
        <FaArrowLeft className="mr-2" /> Volver
      </button>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-green-600 mb-4">{proyecto.nombre}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p><strong>Responsable:</strong> {proyecto.responsable}</p>
            <p><strong>Estado:</strong> <span className={`px-2 py-1 rounded-full ${getColorEstado(proyecto.estado)}`}>
              {proyecto.estado}
            </span></p>
            <p><strong>Prioridad:</strong> <span className={`px-2 py-1 rounded-full ${getColorPrioridad(proyecto.prioridad)}`}>
              {proyecto.prioridad}
            </span></p>
          </div>
          
          <div className="space-y-2">
            <p><strong>Fecha Inicio:</strong> {proyecto.fechaInicio}</p>
            <p><strong>Fecha Fin:</strong> {proyecto.fechaFin}</p>
            <p><strong>Progreso:</strong> 
              <div className="w-32 bg-gray-200 rounded-full h-2.5 mt-1">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${proyecto.progreso}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500">{proyecto.progreso}%</span>
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Detalles del Proyecto</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Objetivo</h3>
              <p className="text-gray-600">{proyecto.objetivo}</p>
            </div>
            
            <div>
              <h3 className="font-medium">Equipos Involucrados</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {proyecto.equipo.map((equipo, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {equipo}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium">Enlace del Proyecto</h3>
              <a 
                href={proyecto.enlace} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline"
              >
                {proyecto.enlace}
              </a>
            </div>
            
            <div>
              <h3 className="font-medium">Observaciones</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{proyecto.observaciones}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NuevoProyecto = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    responsable: 'Felipe Gómez',
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    
    setFormData(prev => ({ ...prev, [name]: selectedValues }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevosProyectos = JSON.parse(localStorage.getItem('proyectos') || []);
    const nuevoId = nuevosProyectos.length > 0 
      ? Math.max(...nuevosProyectos.map(p => p.id)) + 1 
      : 1;
    
    const nuevoProyecto = {
      ...formData,
      id: nuevoId,
      progreso: 0
    };
    
    localStorage.setItem('proyectos', JSON.stringify([...nuevosProyectos, nuevoProyecto]));
    navigate('/');
  };

  return (
    <div className="w-full bg-white p-6">
      <button 
        onClick={() => navigate(-1)}
        className="mb-4 text-gray-600 hover:text-gray-800 flex items-center"
      >
        <FaArrowLeft className="mr-2" /> Volver
      </button>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-green-600 mb-6">Crear Nuevo Proyecto</h1>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campos del formulario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Proyecto
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo (Múltiple selección)
              </label>
              <select
                multiple
                name="tipo"
                value={formData.tipo}
                onChange={handleMultiSelect}
                className="w-full border border-gray-300 rounded-md p-2 h-32"
                required
              >
                {opcionesTipo.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipo (Múltiple selección)
              </label>
              <select
                multiple
                name="equipo"
                value={formData.equipo}
                onChange={handleMultiSelect}
                className="w-full border border-gray-300 rounded-md p-2 h-32"
                required
              >
                {opcionesEquipo.map(equipo => (
                  <option key={equipo} value={equipo}>{equipo}</option>
                ))}
              </select>
            </div>

            {/* Resto de campos del formulario */}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              Crear Proyecto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Views = () => {
  return (
    <div className="flex-1 min-h-screen bg-white">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/proyecto/:id" element={<DetalleProyecto />} />
        <Route path="/nuevo-proyecto" element={<NuevoProyecto />} />
      </Routes>
    </div>
  );
};

export default Views;
