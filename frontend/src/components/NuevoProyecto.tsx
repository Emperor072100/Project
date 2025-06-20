// NuevoProyecto.tsx avanzado
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
}

interface FormularioProyecto {
  nombre: string;
  responsable: string;
  responsable_id: string | number;
  estado: string;
  tipo: string[];  // Will be sent as tipo_id
  equipo: string[];  // Will be sent as equipo_id
  prioridad: string;
  objetivo: string;
  fecha_inicio: string;
  fecha_fin: string;
  progreso: number;
  enlace: string;
  observaciones: string;
}

interface Props {
  onCreado: () => void;
}

const opcionesEstado = ['Conceptual', 'Análisis', 'En diseño', 'En desarrollo', 'Etapa pruebas', 'Cancelado', 'Pausado', 'En producción'];
const opcionesTipo = ['Otro', 'Informe', 'Automatización', 'Desarrollo'];
const opcionesEquipo = ['Dirección TI', 'Estrategia CX', 'Dirección Financiera', 'Dirección de Servicios', 'Dirección Comercial', 'Dirección GH', 'Desarrollo CX'];
const opcionesPrioridad = ['Alta', 'Media', 'Baja'];

const NuevoProyecto: React.FC<Props> = ({ onCreado }) => {
  const [formulario, setFormulario] = useState<FormularioProyecto>({
    nombre: '',
    responsable: '',
    responsable_id: '',
    estado: '',
    tipo: [],
    equipo: [],
    prioridad: '',
    objetivo: '',
    fecha_inicio: '',
    fecha_fin: '',
    progreso: 0,
    enlace: '',
    observaciones: ''
  });
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        setCargandoUsuarios(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/usuarios', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsuarios(response.data);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        toast.error('No se pudieron cargar los usuarios');
      } finally {
        setCargandoUsuarios(false);
      }
    };

    cargarUsuarios();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Si el campo es responsable_id, también actualizar el campo responsable con el nombre del usuario
    if (name === 'responsable_id' && value) {
      const usuarioSeleccionado = usuarios.find(u => u.id === parseInt(value));
      if (usuarioSeleccionado) {
        setFormulario({
          ...formulario,
          [name]: value,
          responsable: `${usuarioSeleccionado.nombre} ${usuarioSeleccionado.apellido}`
        });
        return;
      }
    }
    
    // Manejar campos tipo y equipo como arrays
    if (name === 'tipo' || name === 'equipo') {
      // Si el valor está vacío, usar un array vacío
      // Si no, convertir el valor en un array con un solo elemento
      const newValue = value ? [value] : [];
      setFormulario({ ...formulario, [name]: newValue });
    } else {
      // Para otros campos, asignar el valor directamente
      setFormulario({ ...formulario, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      // Validate required fields
      if (!formulario.nombre || !formulario.estado || !formulario.responsable_id) {
        toast.error('Por favor completa los campos requeridos');
        return;
      }

      // Format data for backend
      const datosAEnviar = {
        nombre: formulario.nombre.trim(),
        responsable_id: Number(formulario.responsable_id),  // Ensure it's a number
        estado: formulario.estado,
        tipo_id: formulario.tipo,  // Change to tipo_id to match backend
        equipo_id: formulario.equipo,  // Change to equipo_id to match backend
        prioridad: formulario.prioridad,
        objetivo: formulario.objetivo.trim(),
        fecha_inicio: formulario.fecha_inicio || null,  // Handle empty dates
        fecha_fin: formulario.fecha_fin || null,  // Handle empty dates
        progreso: Number(formulario.progreso) || 0,  // Ensure it's a number
        enlace: formulario.enlace.trim(),
        observaciones: formulario.observaciones.trim()
      };

      console.log('Sending data:', datosAEnviar); // Debug log

      const response = await axios.post('http://localhost:8000/proyectos/', datosAEnviar, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 201 || response.status === 200) {
        toast.success('Proyecto creado con éxito');
        onCreado();
        // Reset form
        setFormulario({
          nombre: '',
          responsable: '',
          responsable_id: '',
          estado: '',
          tipo: [],
          equipo: [],
          prioridad: '',
          objetivo: '',
          fecha_inicio: '',
          fecha_fin: '',
          progreso: 0,
          enlace: '',
          observaciones: ''
        });
      }
    } catch (error: any) {
      // Enhanced error handling
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      
      if (error.response?.data?.detail) {
        toast.error(`Error: ${error.response.data.detail}`);
      } else if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Error al crear el proyecto');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded shadow">
      <input name="nombre" placeholder="Nombre" value={formulario.nombre} onChange={handleChange} className="w-full border p-2 rounded" />
      
      <select 
        name="responsable_id" 
        value={formulario.responsable_id} 
        onChange={handleChange} 
        className="w-full border p-2 rounded"
        disabled={cargandoUsuarios}
      >
        <option value="">Selecciona responsable</option>
        {usuarios.map((usuario) => (
          <option key={usuario.id} value={usuario.id}>
            {usuario.nombre} {usuario.apellido}
          </option>
        ))}
      </select>

      <select name="estado" value={formulario.estado} onChange={handleChange} className="w-full border p-2 rounded">
        <option value="">Selecciona estado</option>
        {opcionesEstado.map((op) => <option key={op} value={op}>{op}</option>)}
      </select>

      <select name="tipo" value={formulario.tipo.join(',')} onChange={handleChange} className="w-full border p-2 rounded">
        <option value="">Selecciona tipo</option>
        {opcionesTipo.map((op) => <option key={op} value={op}>{op}</option>)}
      </select>

      <select name="equipo" value={formulario.equipo.join(',')} onChange={handleChange} className="w-full border p-2 rounded">
        <option value="">Selecciona equipo</option>
        {opcionesEquipo.map((op) => <option key={op} value={op}>{op}</option>)}
      </select>

      <select name="prioridad" value={formulario.prioridad} onChange={handleChange} className="w-full border p-2 rounded">
        <option value="">Selecciona prioridad</option>
        {opcionesPrioridad.map((op) => <option key={op} value={op}>{op}</option>)}
      </select>

      <textarea name="objetivo" placeholder="Objetivo" value={formulario.objetivo} onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="fecha_inicio" type="date" value={formulario.fecha_inicio} onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="fecha_fin" type="date" value={formulario.fecha_fin} onChange={handleChange} className="w-full border p-2 rounded" />
      
      {/* Control de progreso */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Progreso: {formulario.progreso}%</label>
        <div className="flex items-center gap-4">
          <input 
            type="range" 
            name="progreso" 
            min="0" 
            max="100" 
            value={formulario.progreso} 
            onChange={handleChange} 
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
          />
          <input 
            type="number" 
            name="progreso" 
            min="0" 
            max="100" 
            value={formulario.progreso} 
            onChange={handleChange} 
            className="w-16 border p-2 rounded" 
          />
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-600 h-2.5 rounded-full" 
            style={{ width: `${formulario.progreso}%` }}
          ></div>
        </div>
      </div>
      
      <input name="enlace" placeholder="Enlace" value={formulario.enlace} onChange={handleChange} className="w-full border p-2 rounded" />
      <textarea name="observaciones" placeholder="Observaciones" value={formulario.observaciones} onChange={handleChange} className="w-full border p-2 rounded" />

      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Crear Proyecto</button>
    </form>
  );
};

export default NuevoProyecto;