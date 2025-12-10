import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosConfig';
import Modal from './Modal';
import AlertDialog from './AlertDialog';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
}

interface Estado {
  id: number;
  nombre: string;
  categoria?: string;
}

interface Prioridad {
  id: number;
  nivel: string;
}

interface Tipo {
  id: number;
  nombre: string;
}

interface Equipo {
  id: number;
  nombre: string;
}

interface FormularioProyecto {
  nombre: string;
  responsable: string;
  responsable_id: string | number;
  estado_id: number;
  prioridad_id: number;
  tipos: number[];
  equipos: number[];
  objetivo: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  progreso: number;
  enlace: string;
  observaciones: string;
}

interface Proyecto {
  id: number;
  nombre: string;
  responsable_id: number;
  responsable: string;
  estado_id: number;
  estado: string;
  prioridad_id: number;
  prioridad: string;
  tipos: { id: number; nombre: string }[];
  equipos: { id: number; nombre: string }[];
  objetivo: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  progreso: number;
  enlace: string;
  observaciones: string;
}

interface Props {
  proyectoId?: number | null;
  isOpen: boolean;
  onClose: () => void;
  onActualizado: () => void;
}

const EditarProyecto: React.FC<Props> = ({ proyectoId, isOpen, onClose, onActualizado }) => {
  const [formulario, setFormulario] = useState<FormularioProyecto>({
    nombre: '',
    responsable: '',
    responsable_id: '',
    estado_id: 0,
    prioridad_id: 0,
    tipos: [],
    equipos: [],
    objetivo: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: null,
    progreso: 0,
    enlace: '',
    observaciones: ''
  });
  
  // Estado para alertas y carga
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: 'Exitoso!',
    message: '¡Proyecto actualizado con éxito!',
    type: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Estados para datos de selección
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [prioridades, setPrioridades] = useState<Prioridad[]>([]);
  const [tiposDisponibles, setTiposDisponibles] = useState<Tipo[]>([]);
  const [equiposDisponibles, setEquiposDisponibles] = useState<Equipo[]>([]);

  // Cargar datos cuando se abre el modal y hay un proyectoId
  useEffect(() => {
    if (isOpen && proyectoId) {
      cargarDatosIniciales();
      cargarProyecto(proyectoId);
    }
  }, [isOpen, proyectoId]);

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Cargar todos los datos necesarios en paralelo
      const [usuariosRes, estadosRes, prioridadesRes, tiposRes, equiposRes] = await Promise.all([
        axiosInstance.get(`/usuarios/`, config),
        axiosInstance.get(`/estados/`, config),
        axiosInstance.get(`/prioridades/`, config),
        axiosInstance.get(`/tipos/`, config),
        axiosInstance.get(`/equipos/`, config)
      ]);

      setUsuarios(usuariosRes.data);
      setEstados(estadosRes.data);
      setPrioridades(prioridadesRes.data);
      setTiposDisponibles(tiposRes.data);
      setEquiposDisponibles(equiposRes.data);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      showAlert('Error', 'No se pudieron cargar los datos necesarios', 'error');
    } finally {
      setCargando(false);
    }
  };

  const cargarProyecto = async (id: number) => {
    try {
      setCargando(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axiosInstance.get(`/proyectos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const proyecto = response.data;
      
      // Preparar los datos para el formulario
      setFormulario({
        nombre: proyecto.nombre,
        responsable: proyecto.responsable,
        responsable_id: proyecto.responsable_id,
        estado_id: proyecto.estado_id,
        prioridad_id: proyecto.prioridad_id,
        tipos: proyecto.tipos.map((t: any) => t.id),
        equipos: proyecto.equipos.map((e: any) => e.id),
        objetivo: proyecto.objetivo || '',
        fecha_inicio: proyecto.fecha_inicio,
        fecha_fin: proyecto.fecha_fin || null,
        progreso: proyecto.progreso || 0,
        enlace: proyecto.enlace || '',
        observaciones: proyecto.observaciones || ''
      });
    } catch (error) {
      console.error('Error al cargar el proyecto:', error);
      showAlert('Error', 'No se pudo cargar el proyecto', 'error');
      onClose(); // Cerrar el modal si no se puede cargar el proyecto
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
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
    
    if (name === 'progreso') {
      const numeroValue = Math.min(100, Math.max(0, parseInt(value) || 0));
      setFormulario({ ...formulario, [name]: numeroValue });
      return;
    }
    
    setFormulario({ ...formulario, [name]: value });
  };

  const handleCheckboxChange = (name: 'tipos' | 'equipos', id: number, checked: boolean) => {
    if (checked) {
      // Añadir a la selección
      setFormulario({
        ...formulario,
        [name]: [...formulario[name], id]
      });
    } else {
      // Quitar de la selección
      setFormulario({
        ...formulario,
        [name]: formulario[name].filter(item => item !== id)
      });
    }
  };

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setAlertDialog({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const closeAlert = () => {
    setAlertDialog(prev => ({...prev, isOpen: false}));
    
    // Si el tipo es success, llamar a onActualizado para refrescar la tabla
    if (alertDialog.type === 'success') {
      onActualizado();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formulario.nombre.trim()) {
      showAlert('Advertencia', 'El nombre del proyecto es obligatorio', 'warning');
      return;
    }

    if (!formulario.responsable_id) {
      showAlert('Advertencia', 'Debes seleccionar un responsable', 'warning');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const datosAEnviar = {
        nombre: formulario.nombre.trim(),
        responsable_id: Number(formulario.responsable_id),
        estado_id: Number(formulario.estado_id),
        prioridad_id: Number(formulario.prioridad_id),
        tipos: formulario.tipos.length > 0 ? formulario.tipos : [],
        equipos: formulario.equipos.length > 0 ? formulario.equipos : [],
        objetivo: formulario.objetivo?.trim() || '',
        fecha_inicio: formulario.fecha_inicio,
        fecha_fin: formulario.fecha_fin || null,
        progreso: Number(formulario.progreso),
        enlace: formulario.enlace?.trim() || '',
        observaciones: formulario.observaciones?.trim() || ''
      };
      
      console.log('Datos enviados al backend:', JSON.stringify(datosAEnviar, null, 2));
      
      const response = await axiosInstance.put(`/proyectos/${proyectoId}`, datosAEnviar, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        showAlert('Exitoso!', '¡Proyecto actualizado con éxito!', 'success');
      }
    } catch (error: any) {
      console.error('Error al actualizar proyecto:', error);
      
      if (error.response?.data?.detail) {
        console.log('Detalles del error:', error.response.data.detail);
        
        if (Array.isArray(error.response.data.detail)) {
          const mensajes = error.response.data.detail.map((err: any) => {
            const campo = err.loc[1];
            return `Error en ${campo}: ${err.msg}`;
          }).join('\n');
          
          showAlert('Error!', mensajes, 'error');
        } else {
          showAlert('Error!', error.response.data.detail, 'error');
        }
      } else {
        showAlert('Error!', 'Error al actualizar el proyecto', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        title="Editar Proyecto"
      >
        {cargando ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Cargando datos del proyecto...</p>
          </div>
        ) : (
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primera columna */}
                <div className="space-y-4">
                  {/* Nombre del proyecto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del proyecto <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="nombre"
                      placeholder="Nombre del proyecto"
                      value={formulario.nombre}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      required
                    />
                  </div>
                  
                  {/* Responsable */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsable <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="responsable_id"
                      value={formulario.responsable_id}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      required
                    >
                      <option value="">Selecciona responsable</option>
                      {usuarios.map((usuario) => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.nombre} {usuario.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="estado_id"
                      value={formulario.estado_id}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      required
                    >
                      <option value="">Selecciona estado</option>
                      {estados.map((estado) => (
                        <option key={estado.id} value={estado.id}>
                          {estado.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Prioridad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridad
                    </label>
                    <select
                      name="prioridad_id"
                      value={formulario.prioridad_id}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    >
                      <option value="">Selecciona prioridad</option>
                      {prioridades.map((prioridad) => (
                        <option key={prioridad.id} value={prioridad.id}>
                          {prioridad.nivel}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Fechas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha inicio
                      </label>
                      <input
                        name="fecha_inicio"
                        type="date"
                        value={formulario.fecha_inicio}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha fin
                      </label>
                      <input
                        name="fecha_fin"
                        type="date"
                        value={formulario.fecha_fin || ''}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Progreso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Progreso: {formulario.progreso}%
                    </label>
                    <div className="flex items-center gap-2">
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
                        className="w-16 border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Segunda columna */}
                <div className="space-y-4">
                  {/* Tipo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de proyecto
                    </label>
                    <div className="space-y-2">
                      {tiposDisponibles.map(tipo => (
                        <div key={tipo.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`tipo-${tipo.id}`}
                            checked={formulario.tipos.includes(tipo.id)}
                            onChange={(e) => handleCheckboxChange('tipos', tipo.id, e.target.checked)}
                            className="h-4 w-4 text-green-600 border-gray-300 rounded"
                          />
                          <label htmlFor={`tipo-${tipo.id}`} className="ml-2 text-sm text-gray-700">
                            {tipo.nombre}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Equipo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Equipo
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                      {equiposDisponibles.map(equipo => (
                        <div key={equipo.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`equipo-${equipo.id}`}
                            checked={formulario.equipos.includes(equipo.id)}
                            onChange={(e) => handleCheckboxChange('equipos', equipo.id, e.target.checked)}
                            className="h-4 w-4 text-green-600 border-gray-300 rounded"
                          />
                          <label htmlFor={`equipo-${equipo.id}`} className="ml-2 text-sm text-gray-700">
                            {equipo.nombre}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Objetivo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Objetivo
                    </label>
                    <textarea
                      name="objetivo"
                      placeholder="Describe el objetivo del proyecto"
                      value={formulario.objetivo}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    ></textarea>
                  </div>
                  
                  {/* Enlace */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enlace
                    </label>
                    <input
                      name="enlace"
                      type="url"
                      placeholder="https://..."
                      value={formulario.enlace}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    />
                  </div>
                  
                  {/* Observaciones */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observaciones
                    </label>
                    <textarea
                      name="observaciones"
                      placeholder="Observaciones adicionales"
                      value={formulario.observaciones}
                      onChange={handleChange}
                      rows={2}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {loading ? 'Actualizando...' : 'Actualizar Proyecto'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* AlertDialog para mostrar mensajes */}
      <AlertDialog 
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        onClose={closeAlert}
      />
    </>
  );
};

export default EditarProyecto;
