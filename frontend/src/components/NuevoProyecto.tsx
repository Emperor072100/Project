import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import AlertDialog from './AlertDialog';
import axiosInstance from '../services/axiosConfig';

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

interface Props {
  onCreado: () => void;
  onCancel?: () => void;
}

// Constantes para opciones
const opcionesTipo = ['Otro', 'Informe', 'Automatización', 'Desarrollo'];
const opcionesEquipo = ['Dirección TI', 'Estrategia CX', 'Dirección Financiera', 'Dirección de Servicios', 'Dirección Comercial', 'Dirección GH', 'Desarrollo CX'];
const opcionesPrioridad = ['Alta', 'Media', 'Baja'];

const NuevoProyecto: React.FC<Props> = ({ onCreado, onCancel }) => {
  // Un solo estado para controlar el modal
  const [modalOpen, setModalOpen] = useState(false);
  
  // Debug: log cuando cambia modalOpen
  useEffect(() => {
    console.log('🎭 Modal state cambió a:', modalOpen);
  }, [modalOpen]);
  
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
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);

  // Debug: log del progreso actual
  console.log('📊 NuevoProyecto - Progreso actual en render:', formulario.progreso);
  console.log('📊 Estado actual:', formulario.estado_id, 'Estados cargados:', estados.length);

  // Estado para el AlertDialog - simplificado a uno solo
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: 'Exitoso!',
    message: '¡Proyecto creado con éxito!',
    type: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Función para obtener el progreso automático basado en el estado
  const getProgresoByEstado = (estadoNombre: string) => {
    console.log('🔍 getProgresoByEstado llamada con:', estadoNombre);
    
    const progresoMap: { [key: string]: number } = {
      // Estados pendientes (0-25%)
      'Conceptual': 5,
      'Análisis': 15,
      'Sin Empezar': 0,      // Cambiado para coincidir con backend
      'Sin empezar': 0,       // Mantenido por compatibilidad
      'Pendiente': 0,
      
      // Estados en proceso (30-80%)
      'En diseño': 30,
      'En desarrollo': 50,
      'En curso': 65,
      'Etapa pruebas': 80,
      'En proceso': 50,
      
      // Estados terminados (85-100% o casos especiales)
      'Cancelado': 0,
      'Pausado': 25,
      'En producción': 100,
      'Desarrollado': 95,   // Corregido el error de escritura
      'Desarollado': 95,    // Mantenido por compatibilidad
      'Listo': 100,
      'Terminado': 100
    };
    
    const progreso = progresoMap[estadoNombre] !== undefined ? progresoMap[estadoNombre] : 0;
    console.log('📊 Progreso calculado:', progreso, 'para estado:', estadoNombre);
    console.log('🔍 Claves disponibles en progresoMap:', Object.keys(progresoMap));
    return progreso;
  };

  // Test de la función al cargar el componente
  useEffect(() => {
    console.log('🧪 Test de getProgresoByEstado:');
    console.log('Sin Empezar:', getProgresoByEstado('Sin Empezar'));
    console.log('En curso:', getProgresoByEstado('En curso'));
    console.log('Estado inexistente:', getProgresoByEstado('Estado que no existe'));
  }, []);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    console.log('🔄 useEffect modalOpen triggered, modalOpen:', modalOpen);
    if (modalOpen) {
      cargarDatos();
    }
  }, [modalOpen]);

  // Actualizar progreso cuando cambien los estados o el estado_id del formulario
  useEffect(() => {
    if (estados.length > 0 && formulario.estado_id && formulario.estado_id !== 0) {
      const estadoActual = estados.find(e => e.id === formulario.estado_id);
      if (estadoActual) {
        const progresoCalculado = getProgresoByEstado(estadoActual.nombre);
        console.log(`🔄 Sincronizando progreso: ${formulario.progreso}% → ${progresoCalculado}% (Estado: ${estadoActual.nombre})`);
        
        // Solo actualizar si el progreso es diferente para evitar loops infinitos
        if (progresoCalculado !== formulario.progreso) {
          setFormulario(prev => ({
            ...prev,
            progreso: progresoCalculado
          }));
        }
      }
    }
  }, [estados.length, formulario.estado_id]); // Removemos formulario.progreso de las dependencias

  // Función para cargar usuarios, estados, prioridades, tipos y equipos
  const cargarDatos = async () => {
    try {
      console.log('🚀 Iniciando carga de datos...');
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('🔑 Token encontrado:', !!token);
      
      // Cargar todos los datos necesarios en paralelo
      const [usuariosRes, estadosRes, prioridadesRes, tiposRes, equiposRes] = await Promise.all([
        axiosInstance.get('/usuarios/'),
        axiosInstance.get('/estados/'),
        axiosInstance.get('/prioridades/'),
        axiosInstance.get('/tipos/'),
        axiosInstance.get('/equipos/')
      ]);

      console.log('📡 Respuestas recibidas:');
      console.log('Usuarios response:', usuariosRes.status, usuariosRes.data?.length || 0);
      console.log('Estados response:', estadosRes.status, estadosRes.data?.length || 0);
      console.log('Prioridades response:', prioridadesRes.status, prioridadesRes.data?.length || 0);

      // Verificar que las respuestas sean válidas y asignar datos con fallbacks
      const usuariosData = Array.isArray(usuariosRes.data) ? usuariosRes.data : [];
      const estadosData = Array.isArray(estadosRes.data) ? estadosRes.data : [];
      const prioridadesData = Array.isArray(prioridadesRes.data) ? prioridadesRes.data : [];
      const tiposData = Array.isArray(tiposRes.data) ? tiposRes.data : [];
      const equiposData = Array.isArray(equiposRes.data) ? equiposRes.data : [];

      console.log('📊 Datos procesados:');
      console.log('Usuarios:', usuariosData.length);
      console.log('Estados:', estadosData.length);
      console.log('Prioridades:', prioridadesData.length);

      setUsuarios(usuariosData);
      setEstados(estadosData);
      setPrioridades(prioridadesData);
      setTiposDisponibles(tiposData);
      setEquiposDisponibles(equiposData);
      
      // Debug: mostrar datos cargados
      console.log('Datos cargados desde la base de datos:');
      console.log('Usuarios:', usuariosData);
      console.log('Estados:', estadosData);
      console.log('Prioridades:', prioridadesData);
      console.log('Tipos:', tiposData);
      console.log('Equipos:', equiposData);
      
      // Establecer valores predeterminados usando IDs
      if (estadosData && estadosData.length > 0 && prioridadesData && prioridadesData.length > 0) {
        // Buscar estado por defecto de manera más robusta
        let estadoDefault = estadosData.find((e: Estado) => 
          e.nombre === 'Sin Empezar' || e.nombre === 'Sin empezar' || e.nombre === 'Pendiente'
        );
        
        // Si no encuentra ningún estado específico, usar el primero
        if (!estadoDefault) {
          estadoDefault = estadosData[0];
          console.log('⚠️ No se encontró estado específico, usando el primero:', estadoDefault);
        }
        
        const prioridadDefault = prioridadesData.find((p: Prioridad) => p.nivel === 'Media') || prioridadesData[0];
        
        console.log('🔍 Estado por defecto encontrado:', estadoDefault);
        console.log('🔍 Todos los estados disponibles:', estadosData.map(e => ({ id: e.id, nombre: e.nombre })));
        
        if (estadoDefault) {
          const progresoDefault = getProgresoByEstado(estadoDefault.nombre);
          
          console.log(`✨ Estableciendo progreso inicial a ${progresoDefault}% para estado: "${estadoDefault.nombre}"`);
          console.log('🔧 Estado ID que se va a establecer:', estadoDefault.id);
          
          // Actualizar el formulario de una sola vez con todos los valores
          setFormulario(prev => {
            const nuevoFormulario = {
              ...prev,
              estado_id: estadoDefault.id,
              prioridad_id: prioridadDefault?.id || 0,
              progreso: progresoDefault
            };
            console.log('🔧 Formulario completo después de actualizar:', {
              estado_id: nuevoFormulario.estado_id,
              progreso: nuevoFormulario.progreso,
              nombre_estado: estadoDefault.nombre
            });
            return nuevoFormulario;
          });
        } else {
          console.log('❌ No se pudo establecer estado por defecto');
        }
      } else {
        console.log('❌ No hay datos suficientes para establecer valores por defecto');
        console.log('Estados length:', estadosData?.length || 0);
        console.log('Prioridades length:', prioridadesData?.length || 0);
      }
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('No se pudieron cargar los datos necesarios');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    console.log('🔄 handleChange llamado:', { name, value });
    
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
    
    // Si se cambia el estado, actualizar automáticamente el progreso
    if (name === 'estado_id' && value) {
      console.log('🎯 Iniciando actualización de estado...');
      console.log('🔍 Valor recibido:', value, 'tipo:', typeof value);
      console.log('🔍 Estados disponibles:', estados);
      
      const estadoId = parseInt(value);
      const estadoSeleccionado = estados.find(e => e.id === estadoId);
      
      console.log('🎯 Estado ID parseado:', estadoId);
      console.log('🎯 Estado encontrado:', estadoSeleccionado);
      
      if (estadoSeleccionado && estadoSeleccionado.nombre) {
        const nuevoProgreso = getProgresoByEstado(estadoSeleccionado.nombre);
        console.log(`✨ Actualizando progreso de ${formulario.progreso}% a ${nuevoProgreso}% para estado: ${estadoSeleccionado.nombre}`);
        
        setFormulario(prev => {
          const nuevoFormulario = {
            ...prev,
            estado_id: estadoId,
            progreso: nuevoProgreso
          };
          console.log('🔧 Nuevo formulario:', nuevoFormulario);
          return nuevoFormulario;
        });
        return;
      } else {
        console.log('❌ No se encontró el estado seleccionado o no tiene nombre');
        console.log('❌ Estados disponibles:', estados.map(e => `ID: ${e.id}, Nombre: ${e.nombre}`));
      }
    }
    
    if (name === 'progreso') {
      const numeroValue = Math.min(100, Math.max(0, parseInt(value) || 0));
      setFormulario(prev => ({ ...prev, [name]: numeroValue }));
      return;
    }
    
    // Para otros campos
    setFormulario(prev => ({ ...prev, [name]: value }));
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
    
    if (!formulario.nombre.trim()) {
      showAlert('Información!', 'El nombre del proyecto es obligatorio', 'warning');
      return;
    }

    if (!formulario.responsable_id) {
      showAlert('Información!', 'Debes seleccionar un responsable', 'warning');
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
      
      const response = await axiosInstance.post('/proyectos/', datosAEnviar);

      if (response.status === 201 || response.status === 200) {
        // Mostrar mensaje personalizado de éxito
        showAlert('Exitoso!', '¡Proyecto creado con éxito!', 'success');
        
        // Cerrar el modal y resetear el formulario
        setModalOpen(false);
        resetForm();
        
        // Llamar a la función onCreado
        onCreado();
      }
    } catch (error: any) {
      console.error('Error al crear proyecto:', error);
      
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
        showAlert('Error!', 'Error al crear el proyecto', 'error');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    // Mantener los IDs por defecto de estado y prioridad
    const estadoDefault = estados.find(e => e.nombre === 'Sin Empezar' || e.nombre === 'Sin empezar')?.id || 0;
    const prioridadDefault = prioridades.find(p => p.nivel === 'Media')?.id || 0;
    const estadoNombre = estados.find(e => e.id === estadoDefault)?.nombre || 'Sin Empezar';
    const progresoDefault = getProgresoByEstado(estadoNombre);
    
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
      progreso: progresoDefault,
      enlace: '',
      observaciones: ''
    });
  };
  
  const closeModal = () => {
    setModalOpen(false);
    resetForm();
    // Limpiar los datos cargados para asegurar una carga fresca la próxima vez
    setUsuarios([]);
    setEstados([]);
    setPrioridades([]);
    setTiposDisponibles([]);
    setEquiposDisponibles([]);
    onCancel?.();
  };

  return (
    <>
      {/* Único botón para abrir el modal */}
      <button 
        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        onClick={() => {
          console.log('🚀 Botón "+ Nuevo Proyecto" clickeado');
          console.log('🔧 Estado actual del modal antes de abrir:', modalOpen);
          setModalOpen(true);
          console.log('🔧 setModalOpen(true) ejecutado');
        }}
      >
        + Nuevo Proyecto
      </button>
      
      {/* Modal con fondo difuminado */}
      <Modal 
        isOpen={modalOpen} 
        onClose={closeModal}
        title="Nuevo Proyecto"
      >
        <div className="p-6">
          {(() => {
            console.log('🎭 Modal renderizando, modalOpen:', modalOpen, 'loading:', loading);
            return null;
          })()}
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Cargando datos...</span>
            </div>
          ) : (
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
                    value={formulario.estado_id || ''}
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
                    value={formulario.prioridad_id || ''}
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
                {loading ? 'Creando...' : 'Crear Proyecto'}
              </button>
            </div>
          </form>
          )}
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