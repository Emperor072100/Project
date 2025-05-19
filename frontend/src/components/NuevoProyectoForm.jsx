import React, { useState, useEffect } from 'react';

const NuevoProyectoForm = ({ onSave, onCancel, proyectoInicial }) => {
  const [proyecto, setProyecto] = useState({
    nombre: '',
    responsable: '',
    estado: '',
    tipo: [],
    equipo: [],
    prioridad: '',
    objetivo: '',
    fechaInicio: '',
    fechaFin: '',
    progreso: 0,
    enlace: '',
    observaciones: ''
  });

  // Cargar datos del proyecto si estamos en modo edición
  useEffect(() => {
    if (proyectoInicial) {
      setProyecto(proyectoInicial);
    }
  }, [proyectoInicial]);

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
    setProyecto({
      ...proyecto,
      [name]: value
    });
  };

  const handleMultipleSelect = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    
    setProyecto({
      ...proyecto,
      [name]: selectedValues
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Generar ID único para el nuevo proyecto o mantener el existente
    const nuevoProyecto = {
      ...proyecto,
      id: proyecto.id || Date.now(),
      progreso: proyecto.progreso || calcularProgreso(proyecto)
    };
    onSave(nuevoProyecto);
  };

  const calcularProgreso = (proyecto) => {
    // Aquí implementarías la lógica para calcular el progreso
    // Por ahora, simplemente devolvemos un valor aleatorio entre 0 y 100
    return Math.floor(Math.random() * 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{proyectoInicial ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={proyecto.nombre}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            
            {/* Responsable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
              <input
                type="text"
                name="responsable"
                value={proyecto.responsable}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            
            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                name="estado"
                value={proyecto.estado}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="">Selecciona un estado</option>
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
            
            {/* Tipo (selección múltiple) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                name="tipo"
                multiple
                value={proyecto.tipo}
                onChange={handleMultipleSelect}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
              >
                {opcionesTipo.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Mantén presionado Ctrl para seleccionar múltiples opciones</p>
            </div>
            
            {/* Equipo (selección múltiple) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipo</label>
              <select
                name="equipo"
                multiple
                value={proyecto.equipo}
                onChange={handleMultipleSelect}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
              >
                {opcionesEquipo.map(equipo => (
                  <option key={equipo} value={equipo}>{equipo}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Mantén presionado Ctrl para seleccionar múltiples opciones</p>
            </div>
            
            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select
                name="prioridad"
                value={proyecto.prioridad}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="">Selecciona una prioridad</option>
                {opcionesPrioridad.map(prioridad => (
                  <option key={prioridad} value={prioridad}>{prioridad}</option>
                ))}
              </select>
            </div>
            
            {/* Objetivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
              <input
                type="text"
                name="objetivo"
                value={proyecto.objetivo}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            
            {/* Fecha inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
              <input
                type="date"
                name="fechaInicio"
                value={proyecto.fechaInicio}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            
            {/* Fecha fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
              <input
                type="date"
                name="fechaFin"
                value={proyecto.fechaFin}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            
            {/* Enlace */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enlace</label>
              <input
                type="url"
                name="enlace"
                value={proyecto.enlace}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="https://..."
              />
            </div>
          </div>
          
          {/* Observaciones (texto largo) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              name="observaciones"
              value={proyecto.observaciones}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              {proyectoInicial ? 'Actualizar Proyecto' : 'Guardar Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevoProyectoForm;