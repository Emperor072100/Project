import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosConfig.js';
import Modal from './Modal.tsx';
import AlertDialog from './AlertDialog.tsx';
import toast from 'react-hot-toast';

interface Proyecto {
  id: number;
  nombre: string;
}

interface FormularioTarea {
  descripcion: string;
  proyecto_id: number;
}

interface Props {
  onCreada: () => void;
  onCancel?: () => void;
  proyectoIdPorDefecto?: number;
  mostrarSelectorProyecto?: boolean;
}

const NuevaTarea: React.FC<Props> = ({ 
  onCreada, 
  onCancel, 
  proyectoIdPorDefecto = 0,
  mostrarSelectorProyecto = true 
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(false);

  const [formulario, setFormulario] = useState<FormularioTarea>({
    descripcion: '',
    proyecto_id: proyectoIdPorDefecto
  });

  // Estado para el AlertDialog
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: 'Exitoso!',
    message: '¡Tarea creada con éxito!',
    type: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Cargar proyectos cuando se abre el modal
  useEffect(() => {
    if (modalOpen && mostrarSelectorProyecto) {
      cargarProyectos();
    }
  }, [modalOpen, mostrarSelectorProyecto]);

  // Establecer el proyecto por defecto cuando se proporciona
  useEffect(() => {
    if (proyectoIdPorDefecto > 0) {
      setFormulario(prev => ({
        ...prev,
        proyecto_id: proyectoIdPorDefecto
      }));
    }
  }, [proyectoIdPorDefecto]);

  const cargarProyectos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/proyectos');
      const proyectosData = Array.isArray(response.data) ? response.data : [];
      setProyectos(proyectosData);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      toast.error('No se pudieron cargar los proyectos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'proyecto_id') {
      setFormulario(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormulario(prev => ({ ...prev, [name]: value }));
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
    
    if (alertDialog.type === 'success') {
      setModalOpen(false);
      resetForm();
      onCreada();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formulario.descripcion.trim()) {
      showAlert('Información!', 'La descripción de la tarea es obligatoria', 'warning');
      return;
    }

    if (!formulario.proyecto_id || formulario.proyecto_id === 0) {
      showAlert('Información!', 'Debes seleccionar un proyecto', 'warning');
      return;
    }
    
    try {
      setLoading(true);
      
      const datosAEnviar = {
        descripcion: formulario.descripcion.trim(),
        proyecto_id: formulario.proyecto_id
      };
      
      console.log('Datos de tarea enviados al backend:', JSON.stringify(datosAEnviar, null, 2));
      
      const response = await axiosInstance.post('/tareas/', datosAEnviar);

      if (response.status === 201 || response.status === 200) {
        showAlert('Exitoso!', '¡Tarea creada con éxito!', 'success');
      }
    } catch (error: any) {
      console.error('Error al crear tarea:', error);
      
      if (error.response?.data?.detail) {
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
        showAlert('Error!', 'Error al crear la tarea', 'error');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormulario({
      descripcion: '',
      proyecto_id: proyectoIdPorDefecto
    });
  };
  
  const closeModal = () => {
    setModalOpen(false);
    resetForm();
    setProyectos([]);
    onCancel?.();
  };

  return (
    <>
      <button 
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-2 text-sm"
        onClick={() => setModalOpen(true)}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Nueva Tarea
      </button>
      
      <Modal 
        isOpen={modalOpen} 
        onClose={closeModal}
        title="Nueva Tarea"
      >
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selector de proyecto (solo si mostrarSelectorProyecto es true) */}
              {mostrarSelectorProyecto && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proyecto <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="proyecto_id"
                    value={formulario.proyecto_id || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    required
                  >
                    <option value="">Selecciona un proyecto</option>
                    {proyectos.map((proyecto) => (
                      <option key={proyecto.id} value={proyecto.id}>
                        {proyecto.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Descripción de la tarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="descripcion"
                  placeholder="Describe la tarea a realizar"
                  value={formulario.descripcion}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                  required
                />
              </div>

              {/* ...eliminado campo completado... */}
              
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {loading ? 'Creando...' : 'Crear Tarea'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
      
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

export default NuevaTarea;
