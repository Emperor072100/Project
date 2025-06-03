import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaSave, FaArrowLeft } from 'react-icons/fa';
import axios from "axios";

// Tipo completo para Proyecto
export interface Proyecto {
  id: number;
  nombre: string;
  responsable: string;
  estado: string;
  tipo: string[];
  equipo: string[];
  prioridad: string;
  objetivo: string;
  fechaInicio: string;
  fechaFin: string;
  progreso: number;
  enlace: string;
  observaciones: string;
}

export const Dashboard: React.FC = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [filtros, setFiltros] = useState({
    estado: '',
    equipo: '',
    prioridad: '',
    responsable: ''
  });
  const [busqueda, setBusqueda] = useState<string>('');
  const [editando, setEditando] = useState<{ id: number | null; campo: string | null }>({ id: null, campo: null });
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string; rol: string }>({ id: '', rol: '' });

  useEffect(() => {
    // Obtener userId y token
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId') || '';
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    if (userId && token) {
      fetch(`http://localhost:8000/usuarios/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject('No se pudo obtener el usuario'))
        .then(data => setUser({ id: data.id?.toString() || userId, rol: data.rol || '' }))
        .catch(() => setUser({ id: userId, rol: '' }));
    }
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('token');
        const proyectosResponse = await axios.get("http://localhost:8000/proyectos", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProyectos(proyectosResponse.data);
      } catch (error) {
        console.error("Error al cargar datos iniciales", error);
      }
    };
    fetchInitialData();

    axios.get('http://localhost:8000/proyectos/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')?.replace(/^"|"$/g, '')}`
      }
    })
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
      const coincideNombre = busqueda === '' ||
        proyecto.nombre.toLowerCase().includes(busqueda.toLowerCase());
      // Si es admin, ve todos; si es usuario, solo los que creó
      const puedeVer = user.rol === 'admin' || proyecto.responsable === user.id;
      return coincideNombre && puedeVer && (
        (filtros.estado === '' || proyecto.estado.includes(filtros.estado)) &&
        (filtros.equipo === '' || proyecto.equipo.includes(filtros.equipo)) &&
        (filtros.prioridad === '' || proyecto.prioridad === filtros.prioridad) &&
        (filtros.responsable === '' || proyecto.responsable === filtros.responsable)
      );
    });
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const getColorEstado = (estado: string) => {
    if (opcionesEstado.pendientes.includes(estado)) return 'bg-yellow-100 text-yellow-800';
    if (opcionesEstado.enProceso.includes(estado)) return 'bg-blue-100 text-blue-800';
    if (["Cancelado", "Pausado"].includes(estado)) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getColorPrioridad = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (id: number, campo: string) => {
    setEditando({ id, campo });
  };

  const handleSave = (id: number, campo: keyof Proyecto, valor: any) => {
    setProyectos(prev =>
      prev.map(proy => proy.id === id ? { ...proy, [campo]: valor } : proy)
    );
    setEditando({ id: null, campo: null });
  };

  const handleViewDetails = (id: number) => {
    navigate(`/proyecto/${id}`);
  };

  return (
    <div className="p-6 w-full bg-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-600">Proyectos Andes BPO</h1>
          <p className="text-gray-600">Implementando la transformación en Andes BPO</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por nombre</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre del proyecto"
            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

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
              {opcionesEstado.pendientes.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </optgroup>
            <optgroup label="En Proceso">
              {opcionesEstado.enProceso.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </optgroup>
            <optgroup label="Terminados">
              {opcionesEstado.terminados.map((estado) => (
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
            {opcionesEquipo.map((equipo) => (
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
            {opcionesPrioridad.map((prioridad) => (
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
            {[...new Set(proyectos.map(p => p.responsable))].map(res => (
              <option key={res} value={res}>{res}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6 w-full bg-white">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-semibold">Nombre</th>
          <th className="px-4 py-2 text-left text-xs font-semibold">Responsable</th>
          <th className="px-4 py-2 text-left text-xs font-semibold">Estado</th>
          <th className="px-4 py-2 text-left text-xs font-semibold">Tipo</th>
          <th className="px-4 py-2 text-left text-xs font-semibold">Equipo</th>
          <th className="px-4 py-2 text-left text-xs font-semibold">Prioridad</th>
          <th className="px-4 py-2 text-left text-xs font-semibold">Objetivo</th>
          <th className="px-4 py-2 text-left text-xs font-semibold">Fecha Inicio</th>
          <th className="px-4 py-2 text-left text-xs font-semibold">Fecha Fin</th>
          <th className="px-4 py-2 text-left text-xs font-semibold">Progreso</th>
          <th className="px-4 py-2 text-left text-xs font-semibold">Enlace</th>
          <th className="px-4 py-2 text-left text-xs font-semibold">Observaciones</th>
          <th className="px-4 py-2 text-left text-xs font-semibold">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {filtrarProyectos().map((proyecto) => (
          <tr key={proyecto.id} className="hover:bg-gray-50">
            <td className="px-4 py-2">
              {editando.id === proyecto.id && editando.campo === 'nombre' ? (
                <input type="text" value={proyecto.nombre} onChange={(e) => handleSave(proyecto.id, 'nombre', e.target.value)} className="border p-1 rounded" />
              ) : (
                <span onClick={() => handleEdit(proyecto.id, 'nombre')}>{proyecto.nombre}</span>
              )}
            </td>
            <td className="px-4 py-2">{proyecto.responsable}</td>
            <td className="px-4 py-2">
              {editando.id === proyecto.id && editando.campo === 'estado' ? (
                <select value={proyecto.estado} onChange={(e) => handleSave(proyecto.id, 'estado', e.target.value)} className="border p-1 rounded">
                  {Object.values(opcionesEstado).flat().map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              ) : (
                <span className={getColorEstado(proyecto.estado)} onClick={() => handleEdit(proyecto.id, 'estado')}>{proyecto.estado}</span>
              )}
            </td>
            <td className="px-4 py-2">
              {editando.id === proyecto.id && editando.campo === 'tipo' ? (
                <select multiple value={proyecto.tipo} onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, o => o.value);
                  handleSave(proyecto.id, 'tipo', values);
                }} className="border p-1 rounded">
                  {opcionesTipo.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
              ) : (
                <div onClick={() => handleEdit(proyecto.id, 'tipo')}>
                  {proyecto.tipo.join(', ')}
                </div>
              )}
            </td>
            <td className="px-4 py-2">
              {editando.id === proyecto.id && editando.campo === 'equipo' ? (
                <select multiple value={proyecto.equipo} onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, o => o.value);
                  handleSave(proyecto.id, 'equipo', values);
                }} className="border p-1 rounded">
                  {opcionesEquipo.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
              ) : (
                <div onClick={() => handleEdit(proyecto.id, 'equipo')}>
                  {proyecto.equipo.join(', ')}
                </div>
              )}
            </td>
            <td className="px-4 py-2">
              {editando.id === proyecto.id && editando.campo === 'prioridad' ? (
                <select value={proyecto.prioridad} onChange={(e) => handleSave(proyecto.id, 'prioridad', e.target.value)} className="border p-1 rounded">
                  {opcionesPrioridad.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              ) : (
                <span className={getColorPrioridad(proyecto.prioridad)} onClick={() => handleEdit(proyecto.id, 'prioridad')}>{proyecto.prioridad}</span>
              )}
            </td>
            <td className="px-4 py-2">
              {editando.id === proyecto.id && editando.campo === 'objetivo' ? (
                <input type="text" value={proyecto.objetivo} onChange={(e) => handleSave(proyecto.id, 'objetivo', e.target.value)} className="border p-1 rounded" />
              ) : (
                <span onClick={() => handleEdit(proyecto.id, 'objetivo')}>{proyecto.objetivo}</span>
              )}
            </td>
            <td className="px-4 py-2">
              {editando.id === proyecto.id && editando.campo === 'fechaInicio' ? (
                <input type="date" value={proyecto.fechaInicio} onChange={(e) => handleSave(proyecto.id, 'fechaInicio', e.target.value)} className="border p-1 rounded" />
              ) : (
                <span onClick={() => handleEdit(proyecto.id, 'fechaInicio')}>{proyecto.fechaInicio}</span>
              )}
            </td>
            <td className="px-4 py-2">
              {editando.id === proyecto.id && editando.campo === 'fechaFin' ? (
                <input type="date" value={proyecto.fechaFin} onChange={(e) => handleSave(proyecto.id, 'fechaFin', e.target.value)} className="border p-1 rounded" />
              ) : (
                <span onClick={() => handleEdit(proyecto.id, 'fechaFin')}>{proyecto.fechaFin}</span>
              )}
            </td>
            {/* <td className="px-4 py-2">
              {calcularProgreso(proyecto.valorInicial, proyecto.valorFinal)}%
            </td> */}
            <td className="px-4 py-2">
              <a href={proyecto.enlace} target="_blank" rel="noreferrer" className="text-blue-600 underline">Ver</a>
            </td>
            <td className="px-4 py-2">
              {editando.id === proyecto.id && editando.campo === 'observaciones' ? (
                <textarea value={proyecto.observaciones} onChange={(e) => handleSave(proyecto.id, 'observaciones', e.target.value)} className="border p-1 rounded w-full" rows={3} />
              ) : (
                <span onClick={() => handleEdit(proyecto.id, 'observaciones')} className="block max-w-xs truncate" title={proyecto.observaciones}>{proyecto.observaciones}</span>
              )}
            </td>
            <td className="px-4 py-2">
              <button onClick={() => handleViewDetails(proyecto.id)} className="text-green-600 hover:text-green-800">
                Ver
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

    </div>
  );
};

export default Dashboard;