import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import KPIs from './components/KPIs';
import TablaProyectos from './components/TablaProyectos';
import NuevoProyecto from './components/NuevoProyecto';
import PanelDetalleProyecto from './components/PanelDetalleProyecto';
import { useProyectos } from './context/ProyectosContext';


export interface Proyecto {
  id: number;
  nombre: string;
  responsable: string;
  responsable_nombre?: string;
  responsable_id?: number;
  estado: string;
  tipo: string[] | string;
  equipo: string[] | string;
  prioridad: string;
  objetivo: string;
  fechaInicio: string;
  fechaFin: string;
  progreso: number;
  enlace: string;
  observaciones: string;
}

// Add this helper function before the Dashboard component
const createSelectKey = (prefix: string, value: string | number, index?: number) => 
  `${prefix}-${value?.toString().toLowerCase().replace(/\s+/g, '-')}${index !== undefined ? `-${index}` : ''}`;

export const Dashboard: React.FC = () => {
  // Usar el contexto de proyectos en lugar del estado local
  const { proyectos, updateProyecto, deleteProyecto, fetchProyectos } = useProyectos();
  
  const [filtros, setFiltros] = useState({ estado: '', equipo: '', prioridad: '', responsable: '' });
  const [busqueda, setBusqueda] = useState<string>('');
  const [editando, setEditando] = useState<{ id: number | null; campo: string | null }>({ id: null, campo: null });
  const [user, setUser] = useState<{ id: string; rol: string }>({ id: '', rol: '' });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
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
  }, []);

  const handleSave = async (id: number, campo: keyof Proyecto, valor: any) => {
    await updateProyecto(id, campo, valor);
    setEditando({ id: null, campo: null });
  };

  const handleEliminar = async (id: number) => {
    await deleteProyecto(id);
  };

  const opcionesEstado = {
    pendientes: ['Conceptual', 'Análisis', 'Sin Empezar'],
    enProceso: ['En diseño', 'En desarrollo', 'En curso', 'Etapa pruebas'],
    terminados: ['Cancelado', 'Pausado', 'En producción', 'Desarrollado']
  };
  const opcionesEquipo = ['Dirección TI', 'Estrategia CX', 'Dirección Financiera', 'Dirección de Servicios', 'Dirección Comercial', 'Dirección GH', 'Desarrollo CX'];
  const opcionesPrioridad = ['Alta', 'Media', 'Baja'];

  const filtrarProyectos = () => {
    return proyectos.filter(proyecto => {
      const coincideNombre = busqueda === '' || proyecto.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const responsableNombre = proyecto.responsable_nombre || proyecto.responsable;
      return coincideNombre && (
        (filtros.estado === '' || proyecto.estado.includes(filtros.estado)) &&
        (filtros.equipo === '' || proyecto.equipo.includes(filtros.equipo)) &&
        (filtros.prioridad === '' || proyecto.prioridad === filtros.prioridad) &&
        (filtros.responsable === '' || responsableNombre === filtros.responsable)
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
  return (
    <div className="p-4 w-full bg-white space-y-4">
      <h1 className="text-xl font-bold text-green-600">Proyectos Andes BPO</h1>
      <p className="text-sm text-gray-600">Implementando la transformación en Andes BPO</p>

      {/* Filtros y botón de crear proyecto */}
      <div className="flex flex-wrap gap-2 justify-between items-center mb-2">
        <div className="flex flex-wrap gap-2 flex-grow">
          <input 
            type="text" 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
            placeholder="Buscar por nombre" 
            className="w-48 border border-gray-300 rounded-md shadow-sm p-1 text-sm" 
          />
          
          {/* Estado select */}
          <select 
            name="estado" 
            value={filtros.estado} 
            onChange={handleFiltroChange} 
            className="w-48 border p-1 rounded text-sm"
          >
            <option key={createSelectKey('estado', 'todos')} value="">Todos los estados</option>
            {Object.entries(opcionesEstado).flatMap(([grupo, estados]) => (
              <optgroup key={`grupo-${grupo}`} label={grupo}>
                {estados.map((estado) => (
                  <option key={createSelectKey('estado', estado)} value={estado}>
                    {estado}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* Equipo select */}
          <select 
            name="equipo" 
            value={filtros.equipo} 
            onChange={handleFiltroChange} 
            className="w-64 border p-2 rounded"
          >
            <option key={createSelectKey('equipo', 'todos')} value="">Todos los equipos</option>
            {opcionesEquipo.map(equipo => (
              <option key={createSelectKey('equipo', equipo)} value={equipo}>
                {equipo}
              </option>
            ))}
          </select>

          {/* Prioridad select */}
          <select 
            name="prioridad" 
            value={filtros.prioridad} 
            onChange={handleFiltroChange} 
            className="w-64 border p-2 rounded"
          >
            <option key={createSelectKey('prioridad', 'todos')} value="">Todas las prioridades</option>
            {opcionesPrioridad.map(prioridad => (
              <option key={createSelectKey('prioridad', prioridad)} value={prioridad}>
                {prioridad}
              </option>
            ))}
          </select>

          {/* Responsable select */}
          <select 
            name="responsable" 
            value={filtros.responsable} 
            onChange={handleFiltroChange} 
            className="w-64 border p-2 rounded"
          >
            <option key={createSelectKey('responsable', 'todos')} value="">Todos los responsables</option>
            {[...new Set(proyectos.map(p => p.responsable_nombre || p.responsable))]
              .filter(Boolean)
              .map((res, index) => (
                <option 
                  key={createSelectKey('responsable', res, index)} 
                  value={res}
                  style={{color: 'red'}}
                >
                  {res}
                </option>
              ))}
          </select>
        </div>
        
        {/* Botón para mostrar modal - Solo visible para administradores */}
        {(user.rol === 'admin') && (
        <button
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 ml-auto text-sm"
          onClick={() => setMostrarModal(true)}
        >
          + Nuevo Proyecto
        </button>
        )}
      </div>
      
      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setMostrarModal(false)}
            >✕</button>
            <h2 className="text-xl font-semibold mb-4">Nuevo Proyecto</h2>
            <NuevoProyecto
              onCreado={() => {
                setMostrarModal(false);
              }}
            />
          </div>
        </div>
      )}
      
      {/* KPIs */}
      <div className="mb-2">
        <KPIs proyectos={proyectos} />
      </div>

      {/* Tabla */}
      <TablaProyectos
        proyectos={proyectos}
        editando={editando}
        handleEdit={(id, campo) => setEditando({ id, campo })}
        handleSave={handleSave}
        getColorEstado={getColorEstado}
        getColorPrioridad={getColorPrioridad}
        filtrarProyectos={filtrarProyectos}
        onVerDetalle={(proyecto) => setProyectoSeleccionado(proyecto)}
        onEliminar={handleEliminar}
      />

      {/* Panel de Detalle */}
      {proyectoSeleccionado && (
        <PanelDetalleProyecto
          proyecto={proyectoSeleccionado}
          onClose={() => setProyectoSeleccionado(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
