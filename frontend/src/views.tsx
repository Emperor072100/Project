// views.tsx (actualizado)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaSave, FaArrowLeft } from 'react-icons/fa';
import axios from "axios";
import TablaProyectos from './components/TablaProyectos';

// Tipo completo para Proyecto
export interface Proyecto {
  id: number;
  nombre: string;
  responsable: string;
  responsable_nombre?: string; // Nuevo campo para el nombre del responsable
  responsable_id?: number; // ID del responsable
  estado: string;
  tipo: string[] | string;  // Allow both array and string
  equipo: string[] | string; // Allow both array and string
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
        let rawToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!rawToken) {
          console.warn("⚠️ No hay token en localStorage/sessionStorage");
          return;
        }
        const token = rawToken.replace(/^"|"$/g, '');
        const proyectosResponse = await axios.get("http://localhost:8000/proyectos", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const proyectosNormalizados = proyectosResponse.data.map((p: any) => ({
          ...p,
          tipo: p.tipo || [],
          equipo: p.equipo || [],
          responsable_nombre: p.responsable_nombre || p.responsable,
          fechaInicio: p.fecha_inicio || '',
          fechaFin: p.fecha_fin || ''
        }));
        
        setProyectos(proyectosNormalizados);
      } catch (error: any) {
        // Mejor log para AxiosError
        if (error.response) {
          console.error("🚫 Error al cargar proyectos:", error.message, error.response.status, error.response.data);
        } else if (error.request) {
          console.error("🚫 Error al cargar proyectos: No response received", error.message, error.request);
        } else {
          console.error("🚫 Error al cargar proyectos:", error.message);
        }
      }
    };

    fetchInitialData();
  }, []);

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
      const puedeVer = user.rol === 'admin' || proyecto.responsable_id?.toString() === user.id || proyecto.responsable === user.id;
      const responsableNombre = proyecto.responsable_nombre || proyecto.responsable;
      return coincideNombre && puedeVer && (
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

  const handleEdit = (id: number, campo: string) => {
    setEditando({ id, campo });
  };

  const handleSave = (id: number, campo: keyof Proyecto, valor: any) => {
    setProyectos(prev =>
      prev.map(proy => proy.id === id ? { ...proy, [campo]: valor } : proy)
    );
    setEditando({ id: null, campo: null });
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
            {[...new Set(proyectos.map(p => p.responsable_nombre || p.responsable))].map(res => (
              <option key={res} value={res}>{res}</option>
            ))}
          </select>
        </div>
      </div>

      <TablaProyectos
        proyectos={proyectos}
        editando={editando}
        handleEdit={handleEdit}
        handleSave={handleSave}
        getColorEstado={getColorEstado}
        getColorPrioridad={getColorPrioridad}
        filtrarProyectos={filtrarProyectos}
      />
    </div>
  );
};
localStorage.removeItem("user");
localStorage.removeItem("token");
localStorage.removeItem("userId");

export default Dashboard;
