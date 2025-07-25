import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
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

interface ProyectoEditar {
  id: number;
  nombre: string;
  responsable: string;
  responsable_id: number;
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

interface Props {
  onCreado: () => void;
  onCancel?: () => void;
  proyectoEditar?: ProyectoEditar | null;
  openExternally?: boolean;
  setOpenExternally?: (open: boolean) => void;
}

// Constantes para opciones
const opcionesTipo = ['Otro', 'Informe', 'Automatización', 'Desarrollo'];
const opcionesEquipo = ['Dirección TI', 'Estrategia CX', 'Dirección Financiera', 'Dirección de Servicios', 'Dirección Comercial', 'Dirección GH', 'Desarrollo CX'];
const opcionesPrioridad = ['Alta', 'Media', 'Baja'];

const NuevoProyecto: React.FC<Props> = ({ onCreado, onCancel, proyectoEditar, openExternally, setOpenExternally }) => {
  // Un solo estado para controlar el modal
  const [modalOpen, setModalOpen] = useState(false);

  // Permitir control externo del modal (para integración con tabla/lista)
  useEffect(() => {
    if (typeof openExternally === 'boolean') {
      setModalOpen(openExternally);
    }
  }, [openExternally]);
  
  // Estado para cargar estados, prioridades, tipos y equipos desde la API
  const [estados, setEstados] = useState<Estado[]>([]);
  const [prioridades, setPrioridades] = useState<Prioridad[]>([]);
  const [tiposDisponibles, setTiposDisponibles] = useState<Tipo[]>([]);
  const [equiposDisponibles, setEquiposDisponibles] = useState<Equipo[]>([]);
  
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

  // Pre-cargar datos si es edición
  useEffect(() => {
    if (proyectoEditar && modalOpen) {
      setFormulario({
        nombre: proyectoEditar.nombre || '',
        responsable: proyectoEditar.responsable || '',
        responsable_id: proyectoEditar.responsable_id || '',
        estado_id: proyectoEditar.estado_id || 0,
        prioridad_id: proyectoEditar.prioridad_id || 0,
        tipos: proyectoEditar.tipos || [],
        equipos: proyectoEditar.equipos || [],
        objetivo: proyectoEditar.objetivo || '',
        fecha_inicio: proyectoEditar.fecha_inicio ? proyectoEditar.fecha_inicio.split('T')[0] : new Date().toISOString().split('T')[0],
        fecha_fin: proyectoEditar.fecha_fin ? proyectoEditar.fecha_fin.split('T')[0] : null,
        progreso: proyectoEditar.progreso || 0,
        enlace: proyectoEditar.enlace || '',
        observaciones: proyectoEditar.observaciones || ''
      });
    } else if (!proyectoEditar && modalOpen) {
      resetForm();
    }
  }, [proyectoEditar, modalOpen]);
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);

  // Estado para el AlertDialog - simplificado a uno solo
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: 'Exitoso!',
    message: '¡Proyecto creado con éxito!',
    type: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (modalOpen) {
      cargarDatos();
    }
  }, [modalOpen]);

  // Función para cargar usuarios, estados, prioridades, tipos y equipos
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        showAlert('Sesión expirada', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'warning');
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      console.log('🔍 Iniciando carga de datos...');
      console.log('🔑 Token:', token ? 'Presente' : 'Ausente');
      console.log('🌐 API Base:', 'http://localhost:8000');
      
      // Cargar cada endpoint individualmente para mejor debug
      try {
        console.log('📡 Cargando usuarios...');
        const usuariosRes = await axios.get('http://localhost:8000/usuarios/', config);
        console.log('✅ Usuarios cargados:', usuariosRes.data.length);
        setUsuarios(usuariosRes.data);
      } catch (error: any) {
        console.error('❌ Error cargando usuarios:', error.response?.status, error.message);
        throw error;
      }

      try {
        console.log('📡 Cargando estados...');
        const estadosRes = await axios.get('http://localhost:8000/estados/', config);
        console.log('✅ Estados cargados:', estadosRes.data.length);
        setEstados(estadosRes.data);
      } catch (error: any) {
        console.error('❌ Error cargando estados:', error.response?.status, error.message);
        throw error;
      }

      try {
        console.log('📡 Cargando prioridades...');
        const prioridadesRes = await axios.get('http://localhost:8000/prioridades/', config);
        console.log('✅ Prioridades cargadas:', prioridadesRes.data.length, prioridadesRes.data);
        setPrioridades(prioridadesRes.data);
      } catch (error: any) {
        console.error('❌ Error cargando prioridades:', error.response?.status, error.message);
        throw error;
      }

      try {
        console.log('📡 Cargando tipos...');
        const tiposRes = await axios.get('http://localhost:8000/tipos/', config);
        console.log('✅ Tipos cargados:', tiposRes.data.length);
        setTiposDisponibles(tiposRes.data);
      } catch (error: any) {
        console.error('❌ Error cargando tipos:', error.response?.status, error.message);
        throw error;
      }

      try {
        console.log('📡 Cargando equipos...');
        const equiposRes = await axios.get('http://localhost:8000/equipos/', config);
        console.log('✅ Equipos cargados:', equiposRes.data.length);
        setEquiposDisponibles(equiposRes.data);
      } catch (error: any) {
        console.error('❌ Error cargando equipos:', error.response?.status, error.message);
        throw error;
      }

      console.log('🎉 Todos los datos cargados exitosamente');
      
    } catch (error: any) {
      console.error('💥 Error general al cargar datos:', error);
      
      if (error.response?.status === 401) {
        showAlert('Sesión expirada', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'warning');
        // Limpiar tokens y redirigir al login
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.response?.status === 405) {
        showAlert('Error del servidor', 'El servidor backend no tiene las rutas configuradas correctamente. Verifica que el servidor esté funcionando.', 'error');
      } else {
        toast.error('No se pudieron cargar los datos necesarios');
      }
    } finally {
      setLoading(false);
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

  // Función para mostrar el diálogo de alerta personalizado
  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setAlertDialog({
      isOpen: true,
      title,
      message,
      type
    });
  };

  // Cerrar el diálogo de alerta
  const closeAlert = () => {
    setAlertDialog(prev => ({...prev, isOpen: false}));
    
    // Si el tipo es success, recargar la página después de cerrar
    if (alertDialog.type === 'success') {
      window.location.reload();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validación estricta de campos obligatorios
    if (!formulario.nombre.trim()) {
      showAlert('Información!', 'El nombre del proyecto es obligatorio', 'warning');
      return;
    }
    if (!formulario.responsable_id || isNaN(Number(formulario.responsable_id))) {
      showAlert('Información!', 'Debes seleccionar un responsable', 'warning');
      return;
    }
    if (!formulario.estado_id || isNaN(Number(formulario.estado_id))) {
      showAlert('Información!', 'Debes seleccionar un estado', 'warning');
      return;
    }
    if (!formulario.prioridad_id || isNaN(Number(formulario.prioridad_id))) {
      showAlert('Información!', 'Debes seleccionar una prioridad', 'warning');
      return;
    }
    // Si el backend requiere al menos un tipo o equipo, descomenta las siguientes líneas:
    // if (!formulario.tipos.length) {
    //   showAlert('Información!', 'Debes seleccionar al menos un tipo de proyecto', 'warning');
    //   return;
    // }
    // if (!formulario.equipos.length) {
    //   showAlert('Información!', 'Debes seleccionar al menos un equipo', 'warning');
    //   return;
    // }
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      // Asegurar que todos los IDs sean number y los campos requeridos estén presentes
      // Buscar el nombre del estado y prioridad seleccionados
      const estadoObj = estados.find(e => e.id === Number(formulario.estado_id));
      const prioridadObj = prioridades.find(p => p.id === Number(formulario.prioridad_id));
      const datosAEnviar = {
        nombre: formulario.nombre.trim(),
        responsable_id: Number(formulario.responsable_id),
        estado_id: Number(formulario.estado_id),
        estado: estadoObj ? estadoObj.nombre : '',
        prioridad_id: Number(formulario.prioridad_id),
        prioridad: prioridadObj ? prioridadObj.nivel : '',
        tipos: Array.isArray(formulario.tipos) ? formulario.tipos.map(Number) : [],
        equipos: Array.isArray(formulario.equipos) ? formulario.equipos.map(Number) : [],
        objetivo: formulario.objetivo?.trim() || '',
        fecha_inicio: formulario.fecha_inicio,
        fecha_fin: formulario.fecha_fin && formulario.fecha_fin !== '' ? formulario.fecha_fin : null,
        progreso: Number(formulario.progreso),
        enlace: formulario.enlace?.trim() || '',
        observaciones: formulario.observaciones?.trim() || ''
      };
      // Validar que no haya ningún campo requerido vacío o nulo
      for (const [key, value] of Object.entries(datosAEnviar)) {
        if ((value === null || value === '' || (Array.isArray(value) && value.length === 0)) && ['nombre','responsable_id','estado_id','prioridad_id'].includes(key)) {
          showAlert('Información!', `El campo ${key} es obligatorio`, 'warning');
          setLoading(false);
          return;
        }
      }
      console.log('Datos enviados al backend:', JSON.stringify(datosAEnviar, null, 2));
      let response;
      if (proyectoEditar && proyectoEditar.id) {
        // Modo edición
        response = await axios.put(`http://localhost:8000/proyectos/${proyectoEditar.id}`, datosAEnviar, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Modo creación
        response = await axios.post('http://localhost:8000/proyectos/', datosAEnviar, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      if (response.status === 201 || response.status === 200) {
        showAlert('Exitoso!', proyectoEditar ? '¡Proyecto editado con éxito!' : '¡Proyecto creado con éxito!', 'success');
        setModalOpen(false);
        if (setOpenExternally) setOpenExternally(false);
        resetForm();
        onCreado();
      }
    } catch (error: any) {
      console.error('Error al crear/editar proyecto:', error);
      if (error.response?.status === 401) {
        showAlert('Sesión expirada', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'warning');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
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
        showAlert('Error!', proyectoEditar ? 'Error al editar el proyecto' : 'Error al crear el proyecto', 'error');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    // Mantener los IDs por defecto de estado y prioridad
    const estadoDefault = estados.find(e => e.nombre === 'Sin Empezar')?.id || 0;
    const prioridadDefault = prioridades.find(p => p.nivel === 'Media')?.id || 0;
    
    setFormulario({
      nombre: '',
      responsable: '',
      responsable_id: '',
      estado_id: estadoDefault,
      prioridad_id: prioridadDefault,
      tipos: [],
      equipos: [],
      objetivo: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: null,
      progreso: 0,
      enlace: '',
      observaciones: ''
    });
  };
  
  const closeModal = () => {
    setModalOpen(false);
    if (setOpenExternally) setOpenExternally(false);
    resetForm();
    onCancel?.();
  };

  return (
    <>
      {/* Botón para abrir modal de nuevo o editar proyecto */}
      {!proyectoEditar && !openExternally && (
        <button 
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          onClick={() => setModalOpen(true)}
        >
          + Nuevo Proyecto
        </button>
      )}
      {/* Modal con fondo difuminado */}
      <Modal 
        isOpen={modalOpen} 
        onClose={closeModal}
        title={proyectoEditar ? 'Editar Proyecto' : 'Nuevo Proyecto'}
      >
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
                    value={formulario.responsable_id?.toString() || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    required
                  >
                    <option value="">Selecciona responsable</option>
                    {usuarios.map((usuario) => (
                      <option key={usuario.id} value={usuario.id.toString()}>
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
                    value={formulario.estado_id?.toString() || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    required
                  >
                    <option value="">Selecciona estado</option>
                    {estados.map((estado) => (
                      <option key={estado.id} value={estado.id.toString()}>
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
                    value={formulario.prioridad_id?.toString() || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                  >
                    <option value="">Selecciona prioridad</option>
                    {prioridades.map((prioridad) => (
                      <option key={prioridad.id} value={prioridad.id.toString()}>
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
                  Tipo de proyecto <span className="text-red-500">*</span>
                </label>
                <select
                  name="tipos"
                  value={formulario.tipos[0]?.toString() || ''}
                  onChange={e => {
                    const selected = Number(e.target.value);
                    setFormulario({ ...formulario, tipos: selected ? [selected] : [] });
                  }}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                  required
                >
                  <option value="">Selecciona tipo</option>
                  {tiposDisponibles.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                  ))}
                </select>
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
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {loading ? (proyectoEditar ? 'Guardando...' : 'Creando...') : (proyectoEditar ? 'Guardar Cambios' : 'Crear Proyecto')}
              </button>
            </div>
          </form>
        </div>
      </Modal>
      
      {/* Solo usar una instancia de AlertDialog */}
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

export default NuevoProyecto;