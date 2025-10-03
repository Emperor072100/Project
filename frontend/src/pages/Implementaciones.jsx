import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaPlus, 
  FaEdit, 
  FaSearch, 
  FaUsers, 
  FaCogs, 
  FaLaptop, 
  FaFileContract,
  FaTrash,
  FaFileExcel,
  FaChevronRight,
  FaChevronDown 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

// Agregar estilos CSS para la animación
const slideDownStyle = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-slideDown {
    animation: slideDown 0.3s ease-out;
  }
`;

// Inyectar los estilos en el head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = slideDownStyle;
  document.head.appendChild(styleSheet);
}

const Implementaciones = () => {
  const [implementaciones, setImplementaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState({ nombre: '', rol: 'usuario' });
  const [showModal, setShowModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [formData, setFormData] = useState({
    cliente: '',
    proceso: '',
    estado: '',
    contractual: {
      modeloContrato: { seguimiento: '', estado: '', responsable: '', notas: '' },
      modeloConfidencialidad: { seguimiento: '', estado: '', responsable: '', notas: '' },
      alcance: { seguimiento: '', estado: '', responsable: '', notas: '' },
      fechaInicio: { seguimiento: '', estado: '', responsable: '', notas: '' }
    },
    talentoHumano: {
      perfilPersonal: { seguimiento: '', estado: '', responsable: '', notas: '' },
      cantidadAsesores: { seguimiento: '', estado: '', responsable: '', notas: '' },
      horarios: { seguimiento: '', estado: '', responsable: '', notas: '' },
      formador: { seguimiento: '', estado: '', responsable: '', notas: '' },
      capacitacionesAndes: { seguimiento: '', estado: '', responsable: '', notas: '' },
      capacitacionesCliente: { seguimiento: '', estado: '', responsable: '', notas: '' }
    },
    procesos: {
      responsableCliente: { seguimiento: '', estado: '', responsable: '', notas: '' },
      responsableAndes: { seguimiento: '', estado: '', responsable: '', notas: '' },
      responsablesOperacion: { seguimiento: '', estado: '', responsable: '', notas: '' },
      listadoReportes: { seguimiento: '', estado: '', responsable: '', notas: '' },
      protocoloComunicaciones: { seguimiento: '', estado: '', responsable: '', notas: '' },
      guionesProtocolos: { seguimiento: '', estado: '', responsable: '', notas: '' },
      procesoMonitoreo: { seguimiento: '', estado: '', responsable: '', notas: '' },
      cronogramaTecnologia: { seguimiento: '', estado: '', responsable: '', notas: '' },
      cronogramaCapacitaciones: { seguimiento: '', estado: '', responsable: '', notas: '' },
      realizacionPruebas: { seguimiento: '', estado: '', responsable: '', notas: '' }
    },
    tecnologia: {
      creacionModulo: { seguimiento: '', estado: '', responsable: '', notas: '' },
      tipificacionInteracciones: { seguimiento: '', estado: '', responsable: '', notas: '' },
      aplicativosProceso: { seguimiento: '', estado: '', responsable: '', notas: '' },
      whatsapp: { seguimiento: '', estado: '', responsable: '', notas: '' },
      correosElectronicos: { seguimiento: '', estado: '', responsable: '', notas: '' },
      requisitosGrabacion: { seguimiento: '', estado: '', responsable: '', notas: '' }
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [editingEstado, setEditingEstado] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedImplementacion, setSelectedImplementacion] = useState(null);
  const [implementacionDetail, setImplementacionDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [expandedDetailSection, setExpandedDetailSection] = useState(null);

  // Efecto para cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editingEstado && !event.target.closest('.estado-dropdown')) {
        setEditingEstado(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingEstado]);

  // Cargar implementaciones
  const cargarImplementaciones = async () => {
    setLoading(true);
    try {
      // Cambiar la URL para usar solo los datos básicos
      const response = await axios.get('http://localhost:8000/implementaciones/basic');
      setImplementaciones(response.data);
      console.log('Implementaciones cargadas:', response.data);
    } catch (error) {
      console.error('Error completo:', error);
      toast.error('Error al cargar implementaciones');
      // Si falla, intentar con datos mock para desarrollo
      setImplementaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarImplementaciones();
  }, []);

  // Obtener usuario del localStorage/sessionStorage al montar
  useEffect(() => {
    const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userRaw) {
      try {
        const userObj = JSON.parse(userRaw);
        setUsuario({ nombre: userObj.nombre || '', rol: userObj.rol || 'usuario' });
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      }
    }
  }, []);

  const implementacionesFiltradas = implementaciones.filter(imp => {
    const matchSearch =
      (imp.cliente && imp.cliente.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (imp.proceso && imp.proceso.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchEstado = estadoFiltro ? (imp.estado === estadoFiltro || imp.estado?.toLowerCase() === estadoFiltro.toLowerCase()) : true;
    return matchSearch && matchEstado;
  });

  const cargarDetalleImplementacion = async (implementacionId) => {
    setLoadingDetail(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Intentar cargar los detalles completos de la implementación
      const response = await axios.get(`http://localhost:8000/implementaciones/${implementacionId}`, config);
      setImplementacionDetail(response.data);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      // Si no existe el endpoint completo, usar datos básicos y estructura vacía
      const basicImpl = implementaciones.find(imp => imp.id === implementacionId);
      if (basicImpl) {
        setImplementacionDetail({
          ...basicImpl,
          contractual: {},
          talento_humano: {},
          procesos: {},
          tecnologia: {}
        });
      }
      toast.error('Error al cargar los detalles completos');
    } finally {
      setLoadingDetail(false);
    }
  };

  const abrirModalDetalle = async (implementacion) => {
    setSelectedImplementacion(implementacion);
    setShowDetailModal(true);
    setExpandedDetailSection(null); // Reiniciar la sección expandida
    await cargarDetalleImplementacion(implementacion.id);
  };

  const cambiarEstado = async (implementacionId, nuevoEstado) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.put(
        `http://localhost:8000/implementaciones/${implementacionId}/estado`,
        { estado: nuevoEstado },
        config
      );
      
      // Actualizar el estado local
      setImplementaciones(prev => 
        prev.map(imp => 
          imp.id === implementacionId 
            ? { ...imp, estado: nuevoEstado }
            : imp
        )
      );
      
      setEditingEstado(null);
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el estado');
      console.error(error);
    }
  };

  const guardarImplementacion = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Adaptar nombres de campos para el backend
      const formDataBackend = {
        ...formData,
        talento_humano: formData.talentoHumano,
        talentoHumano: undefined // opcional, para no enviar duplicado
      };
      await axios.post('http://localhost:8000/implementaciones', formDataBackend, config);
      toast.success('Implementación guardada');
      setShowModal(false);
      cargarImplementaciones();
    } catch (error) {
      toast.error('Error al guardar implementación');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Implementaciones</h1>
      </div>

      {/* Modal de Nueva Implementación */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Implementación">
        <div className="max-h-[80vh] overflow-y-auto">
          {/* Sección inicial */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-blue-600 rounded-lg">
                <FaPlus className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Información Principal</h3>
                <p className="text-blue-600">Complete los datos básicos de la implementación</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente *</label>
                <input
                  type="text"
                  required
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                  placeholder="Nombre del cliente"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado *</label>
                <select
                  required
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                >
                  <option value="">Seleccione una opción</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Proceso *</label>
                <select
                  required
                  value={formData.proceso}
                  onChange={(e) => setFormData({ ...formData, proceso: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                >
                  <option value="">Seleccione una opción</option>
                  <option value="SAC">SAC - Servicio al Cliente</option>
                  <option value="TVT">TVT - Televentas</option>
                  <option value="TMC">TMC - Telemercadeo</option>
                  <option value="CBZ">CBZ - Cobranza</option>
                </select>
              </div>
            </div>
          </div>

          {/* Secciones principales */}
          <div className="space-y-6">
            {/* Sección Contractual */}
            <div className="rounded-lg p-6 bg-gradient-to-br from-purple-50 to-purple-100 shadow-sm">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <FaFileContract className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-800">Contractual</h3>
                  <p className="text-purple-600">Gestión de documentos contractuales</p>
                </div>
              </div>
              <div className="space-y-6">
                {Object.entries({
                  modeloContrato: "Modelo de contrato",
                  modeloConfidencialidad: "Modelo del Acuerdo de Confidencialidad",
                  alcance: "Alcance",
                  fechaInicio: "Fecha de Inicio prestación del Servicio"
                }).map(([key, title]) => (
                  <div key={key} className="border-t pt-4 first:border-t-0 first:pt-0">
                    <button 
                      onClick={() => setExpandedSections(prev => ({...prev, ['contractual_' + key]: !prev['contractual_' + key]}))}
                      className="flex items-center w-full text-left font-medium mb-3 hover:text-blue-600 transition-colors"
                    >
                      {expandedSections['contractual_' + key] ? 
                        <FaChevronDown className="mr-2 text-blue-500" size={14} /> : 
                        <FaChevronRight className="mr-2 text-gray-500" size={14} />
                      }
                      {title}
                    </button>
                    <div className={`grid grid-cols-1 gap-4 ${expandedSections['contractual_' + key] ? 'block' : 'hidden'}`}>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Seguimiento</label>
                        <textarea
                          value={formData.contractual[key].seguimiento}
                          onChange={(e) => setFormData({
                            ...formData,
                            contractual: {
                              ...formData.contractual,
                              [key]: { ...formData.contractual[key], seguimiento: e.target.value }
                            }
                          })}
                          rows={4}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white resize-y"
                          placeholder="Ingrese el seguimiento detallado..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                        <select
                          value={formData.contractual[key].estado}
                          onChange={(e) => setFormData({
                            ...formData,
                            contractual: {
                              ...formData.contractual,
                              [key]: { ...formData.contractual[key], estado: e.target.value }
                            }
                          })}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white"
                        >
                          <option value="">Seleccione una opción</option>
                          <option value="ok">OK</option>
                          <option value="en proceso">En Proceso</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                        <select
                          value={formData.contractual[key].responsable}
                          onChange={(e) => setFormData({
                            ...formData,
                            contractual: {
                              ...formData.contractual,
                              [key]: { ...formData.contractual[key], responsable: e.target.value }
                            }
                          })}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                        >
                          <option value="">Seleccione una opción</option>
                          <option value="Andes BPO">Andes BPO</option>
                          <option value="Cliente">Cliente</option>
                          <option value="Ambos">Ambos</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Notas</label>
                        <textarea
                          value={formData.contractual[key].notas}
                          onChange={(e) => setFormData({
                            ...formData,
                            contractual: {
                              ...formData.contractual,
                              [key]: { ...formData.contractual[key], notas: e.target.value }
                            }
                          })}
                          rows={3}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sección Talento Humano */}
            <div className="rounded-lg p-6 bg-gradient-to-br from-green-50 to-green-100 shadow-sm">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-green-600 rounded-lg">
                  <FaUsers className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Talento Humano</h3>
                  <p className="text-green-600">Gestión del personal y capacitación</p>
                </div>
              </div>
              <div className="space-y-6">
                {Object.entries({
                  perfilPersonal: "Perfil del Personal Requerido",
                  cantidadAsesores: "Cantidad de Asesores requeridos",
                  horarios: "Horarios",
                  formador: "Formador",
                  capacitacionesAndes: "Programa de Capacitaciones de Andes BPO",
                  capacitacionesCliente: "Programa de Capacitaciones del cliente"
                }).map(([key, title]) => (
                  <div key={key} className="border-t pt-4 first:border-t-0 first:pt-0">
                    <button 
                      onClick={() => setExpandedSections(prev => ({...prev, ['talentoHumano_' + key]: !prev['talentoHumano_' + key]}))}
                      className="flex items-center w-full text-left font-medium mb-3 hover:text-blue-600 transition-colors"
                    >
                      {expandedSections['talentoHumano_' + key] ? 
                        <FaChevronDown className="mr-2 text-blue-500" size={14} /> : 
                        <FaChevronRight className="mr-2 text-gray-500" size={14} />
                      }
                      {title}
                    </button>
                    <div className={`grid grid-cols-1 gap-4 ${expandedSections['talentoHumano_' + key] ? 'block' : 'hidden'}`}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seguimiento</label>
                        <textarea
                          value={formData.talentoHumano[key].seguimiento}
                          onChange={(e) => setFormData({
                            ...formData,
                            talentoHumano: {
                              ...formData.talentoHumano,
                              [key]: { ...formData.talentoHumano[key], seguimiento: e.target.value }
                            }
                          })}
                          rows={4}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white resize-y"
                          placeholder="Ingrese el seguimiento detallado..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                          value={formData.talentoHumano[key].estado}
                          onChange={(e) => setFormData({
                            ...formData,
                            talentoHumano: {
                              ...formData.talentoHumano,
                              [key]: { ...formData.talentoHumano[key], estado: e.target.value }
                            }
                          })}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                        >
                          <option value="">Seleccione una opción</option>
                          <option value="ok">OK</option>
                          <option value="en proceso">En Proceso</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                        <select
                          value={formData.talentoHumano[key].responsable}
                          onChange={(e) => setFormData({
                            ...formData,
                            talentoHumano: {
                              ...formData.talentoHumano,
                              [key]: { ...formData.talentoHumano[key], responsable: e.target.value }
                            }
                          })}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                        >
                          <option value="">Seleccione una opción</option>
                          <option value="Andes BPO">Andes BPO</option>
                          <option value="Cliente">Cliente</option>
                          <option value="Ambos">Ambos</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                        <textarea
                          value={formData.talentoHumano[key].notas}
                          onChange={(e) => setFormData({
                            ...formData,
                            talentoHumano: {
                              ...formData.talentoHumano,
                              [key]: { ...formData.talentoHumano[key], notas: e.target.value }
                            }
                          })}
                          rows={3}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sección Procesos */}
            <div className="rounded-lg p-6 bg-gradient-to-br from-amber-50 to-amber-100 shadow-sm">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-amber-600 rounded-lg">
                  <FaCogs className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-800">Procesos</h3>
                  <p className="text-amber-600">Gestión y configuración de procesos</p>
                </div>
              </div>
              <div className="space-y-6">
                {Object.entries({
                  responsableCliente: "Nombrar Responsable de Implementar el Proyecto por el cliente",
                  responsableAndes: "Nombrar Responsable de Implementar el Proyecto por parte de Andes BPO",
                  responsablesOperacion: "Responsables de la operación",
                  listadoReportes: "Listado Reportes de Andes BPO",
                  protocoloComunicaciones: "Protocolo de Comunicaciones de ambas empresas",
                  guionesProtocolos: "Guiones y/o Protocolos de la atención",
                  procesoMonitoreo: "Proceso Monitoreo y Calidad Andes BPO",
                  cronogramaTecnologia: "Cronograma de Tecnología con Tiempos ajustados",
                  cronogramaCapacitaciones: "Cronograma de Capacitaciones con Duraciones y Fechas",
                  realizacionPruebas: "Realización de pruebas"
                }).map(([key, title]) => (
                  <div key={key} className="border-t pt-4 first:border-t-0 first:pt-0">
                    <button 
                      onClick={() => setExpandedSections(prev => ({...prev, ['procesos_' + key]: !prev['procesos_' + key]}))}
                      className="flex items-center w-full text-left font-medium mb-3 hover:text-blue-600 transition-colors"
                    >
                      {expandedSections['procesos_' + key] ? 
                        <FaChevronDown className="mr-2 text-blue-500" size={14} /> : 
                        <FaChevronRight className="mr-2 text-gray-500" size={14} />
                      }
                      {title}
                    </button>
                    <div className={`grid grid-cols-1 gap-4 ${expandedSections['procesos_' + key] ? 'block' : 'hidden'}`}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seguimiento</label>
                        <textarea
                          value={formData.procesos[key].seguimiento}
                          onChange={(e) => setFormData({
                            ...formData,
                            procesos: {
                              ...formData.procesos,
                              [key]: { ...formData.procesos[key], seguimiento: e.target.value }
                            }
                          })}
                          rows={4}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white resize-y"
                          placeholder="Ingrese el seguimiento detallado..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                          value={formData.procesos[key].estado}
                          onChange={(e) => setFormData({
                            ...formData,
                            procesos: {
                              ...formData.procesos,
                              [key]: { ...formData.procesos[key], estado: e.target.value }
                            }
                          })}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                        >
                          <option value="">Seleccione una opción</option>
                          <option value="ok">OK</option>
                          <option value="en proceso">En Proceso</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                        <select
                          value={formData.procesos[key].responsable}
                          onChange={(e) => setFormData({
                            ...formData,
                            procesos: {
                              ...formData.procesos,
                              [key]: { ...formData.procesos[key], responsable: e.target.value }
                            }
                          })}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                        >
                          <option value="">Seleccione una opción</option>
                          <option value="Andes BPO">Andes BPO</option>
                          <option value="Cliente">Cliente</option>
                          <option value="Ambos">Ambos</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                        <textarea
                          value={formData.procesos[key].notas}
                          onChange={(e) => setFormData({
                            ...formData,
                            procesos: {
                              ...formData.procesos,
                              [key]: { ...formData.procesos[key], notas: e.target.value }
                            }
                          })}
                          rows={3}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sección Tecnología */}
            <div className="rounded-lg p-6 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <FaLaptop className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">Tecnología</h3>
                  <p className="text-blue-600">Configuración tecnológica y sistemas</p>
                </div>
              </div>
              <div className="space-y-6">
                {Object.entries({
                  creacionModulo: "Creación Modulo en Wolkvox para cliente nuevo",
                  tipificacionInteracciones: "Tipificación de interacciones",
                  aplicativosProceso: "Aplicativos para el proceso",
                  whatsapp: "Whatsapp",
                  correosElectronicos: "Correos Electronicos (Condiciones de Uso, capacidades)",
                  requisitosGrabacion: "Requisitos Grabación de llamada, entrega y resguardo de las mismas"
                }).map(([key, title]) => (
                  <div key={key} className="border-t pt-4 first:border-t-0 first:pt-0">
                    <button 
                      onClick={() => setExpandedSections(prev => ({...prev, ['tecnologia_' + key]: !prev['tecnologia_' + key]}))}
                      className="flex items-center w-full text-left font-medium mb-3 hover:text-blue-600 transition-colors"
                    >
                      {expandedSections['tecnologia_' + key] ? 
                        <FaChevronDown className="mr-2 text-blue-500" size={14} /> : 
                        <FaChevronRight className="mr-2 text-gray-500" size={14} />
                      }
                      {title}
                    </button>
                    <div className={`grid grid-cols-1 gap-4 ${expandedSections['tecnologia_' + key] ? 'block' : 'hidden'}`}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seguimiento</label>
                        <textarea
                          value={formData.tecnologia[key].seguimiento}
                          onChange={(e) => setFormData({
                            ...formData,
                            tecnologia: {
                              ...formData.tecnologia,
                              [key]: { ...formData.tecnologia[key], seguimiento: e.target.value }
                            }
                          })}
                          rows={4}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-y bg-white"
                          placeholder="Ingrese el seguimiento detallado..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                          value={formData.tecnologia[key].estado}
                          onChange={(e) => setFormData({
                            ...formData,
                            tecnologia: {
                              ...formData.tecnologia,
                              [key]: { ...formData.tecnologia[key], estado: e.target.value }
                            }
                          })}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                        >
                          <option value="">Seleccione una opción</option>
                          <option value="ok">OK</option>
                          <option value="en proceso">En Proceso</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                        <select
                          value={formData.tecnologia[key].responsable}
                          onChange={(e) => setFormData({
                            ...formData,
                            tecnologia: {
                              ...formData.tecnologia,
                              [key]: { ...formData.tecnologia[key], responsable: e.target.value }
                            }
                          })}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                        >
                          <option value="">Seleccione una opción</option>
                          <option value="Andes BPO">Andes BPO</option>
                          <option value="Cliente">Cliente</option>
                          <option value="Ambos">Ambos</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                        <textarea
                          value={formData.tecnologia[key].notas}
                          onChange={(e) => setFormData({
                            ...formData,
                            tecnologia: {
                              ...formData.tecnologia,
                              [key]: { ...formData.tecnologia[key], notas: e.target.value }
                            }
                          })}
                          rows={3}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 flex justify-end gap-4 border-t pt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={guardarImplementacion}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Guardar Implementación
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Detalle de Implementación */}
      <Modal 
        isOpen={showDetailModal} 
        onClose={() => setShowDetailModal(false)} 
        title={`Detalles de Implementación: ${selectedImplementacion?.cliente || ''}`}
        size="extraLarge"
      >
        <div className="max-h-[85vh] overflow-y-auto">
          {loadingDetail ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <p className="text-gray-600">Cargando detalles...</p>
              </div>
            </div>
          ) : implementacionDetail ? (
            <>
              {/* Información General */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-slate-600 rounded-lg">
                    <FaUsers className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{implementacionDetail.cliente}</h3>
                    <p className="text-slate-600">Información General de la Implementación</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Proceso</p>
                    <p className="text-lg font-semibold text-gray-900">{implementacionDetail.proceso}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Estado</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                      implementacionDetail.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' :
                      implementacionDetail.estado === 'Pendiente' ? 'bg-amber-100 text-amber-800' :
                      implementacionDetail.estado === 'En Proceso' ? 'bg-blue-100 text-blue-800' :
                      implementacionDetail.estado === 'Finalizado' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {implementacionDetail.estado || 'Sin estado'}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-500">ID</p>
                    <p className="text-lg font-semibold text-gray-900">#{implementacionDetail.id}</p>
                  </div>
                </div>
              </div>

              {/* Tarjetas de Secciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {/* Tarjeta Contractual */}
                <button
                  onClick={() => setExpandedDetailSection(expandedDetailSection === 'contractual' ? null : 'contractual')}
                  className={`bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-left transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                    expandedDetailSection === 'contractual' ? 'ring-2 ring-purple-500 shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-600 rounded-lg">
                      <FaFileContract className="text-white text-2xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-800 text-lg">Contractual</h4>
                      <p className="text-sm text-purple-600">Documentos contractuales</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                          4 elementos
                        </span>
                        {expandedDetailSection === 'contractual' ? (
                          <FaChevronDown className="text-purple-600" />
                        ) : (
                          <FaChevronRight className="text-purple-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Tarjeta Talento Humano */}
                <button
                  onClick={() => setExpandedDetailSection(expandedDetailSection === 'talentoHumano' ? null : 'talentoHumano')}
                  className={`bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-left transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                    expandedDetailSection === 'talentoHumano' ? 'ring-2 ring-green-500 shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-600 rounded-lg">
                      <FaUsers className="text-white text-2xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-800 text-lg">Talento Humano</h4>
                      <p className="text-sm text-green-600">Personal y capacitación</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                          6 elementos
                        </span>
                        {expandedDetailSection === 'talentoHumano' ? (
                          <FaChevronDown className="text-green-600" />
                        ) : (
                          <FaChevronRight className="text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Tarjeta Procesos */}
                <button
                  onClick={() => setExpandedDetailSection(expandedDetailSection === 'procesos' ? null : 'procesos')}
                  className={`bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6 text-left transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                    expandedDetailSection === 'procesos' ? 'ring-2 ring-amber-500 shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-600 rounded-lg">
                      <FaCogs className="text-white text-2xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-800 text-lg">Procesos</h4>
                      <p className="text-sm text-amber-600">Configuración de procesos</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
                          10 elementos
                        </span>
                        {expandedDetailSection === 'procesos' ? (
                          <FaChevronDown className="text-amber-600" />
                        ) : (
                          <FaChevronRight className="text-amber-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Tarjeta Tecnología */}
                <button
                  onClick={() => setExpandedDetailSection(expandedDetailSection === 'tecnologia' ? null : 'tecnologia')}
                  className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-left transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                    expandedDetailSection === 'tecnologia' ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-lg">
                      <FaLaptop className="text-white text-2xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-800 text-lg">Tecnología</h4>
                      <p className="text-sm text-blue-600">Sistemas y configuración</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                          6 elementos
                        </span>
                        {expandedDetailSection === 'tecnologia' ? (
                          <FaChevronDown className="text-blue-600" />
                        ) : (
                          <FaChevronRight className="text-blue-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Sección Expandida con Detalles en 3 Columnas */}
              {expandedDetailSection && (
                <div className="mt-6 bg-white rounded-lg border-2 border-gray-200 shadow-lg overflow-hidden animate-slideDown">
                  <div className={`px-6 py-4 border-b ${
                    expandedDetailSection === 'contractual' ? 'bg-purple-50 border-purple-200' :
                    expandedDetailSection === 'talentoHumano' ? 'bg-green-50 border-green-200' :
                    expandedDetailSection === 'procesos' ? 'bg-amber-50 border-amber-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-bold ${
                        expandedDetailSection === 'contractual' ? 'text-purple-800' :
                        expandedDetailSection === 'talentoHumano' ? 'text-green-800' :
                        expandedDetailSection === 'procesos' ? 'text-amber-800' :
                        'text-blue-800'
                      }`}>
                        {expandedDetailSection === 'contractual' && 'Detalles Contractuales'}
                        {expandedDetailSection === 'talentoHumano' && 'Detalles de Talento Humano'}
                        {expandedDetailSection === 'procesos' && 'Detalles de Procesos'}
                        {expandedDetailSection === 'tecnologia' && 'Detalles de Tecnología'}
                      </h3>
                      <button
                        onClick={() => setExpandedDetailSection(null)}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {expandedDetailSection === 'contractual' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { key: 'modeloContrato', label: 'Modelo de contrato' },
                          { key: 'modeloConfidencialidad', label: 'Acuerdo de Confidencialidad' },
                          { key: 'alcance', label: 'Alcance' },
                          { key: 'fechaInicio', label: 'Fecha de Inicio' }
                        ].map(item => (
                          <div key={item.key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">{item.label}</h5>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">Estado:</span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                  implementacionDetail.contractual?.[item.key]?.estado === 'ok' ? 'bg-green-100 text-green-800' :
                                  implementacionDetail.contractual?.[item.key]?.estado === 'en proceso' ? 'bg-blue-100 text-blue-800' :
                                  implementacionDetail.contractual?.[item.key]?.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {implementacionDetail.contractual?.[item.key]?.estado || 'No definido'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Responsable:</span>
                                <span className="ml-2 text-gray-800">
                                  {implementacionDetail.contractual?.[item.key]?.responsable || 'No asignado'}
                                </span>
                              </div>
                              {implementacionDetail.contractual?.[item.key]?.seguimiento && (
                                <div>
                                  <span className="font-medium text-gray-600">Seguimiento:</span>
                                  <p className="text-gray-800 mt-1 text-sm leading-relaxed bg-white p-3 rounded border">
                                    {implementacionDetail.contractual[item.key].seguimiento}
                                  </p>
                                </div>
                              )}
                              {implementacionDetail.contractual?.[item.key]?.notas && (
                                <div>
                                  <span className="font-medium text-gray-600">Notas:</span>
                                  <p className="text-gray-800 mt-1 text-sm leading-relaxed bg-white p-3 rounded border">
                                    {implementacionDetail.contractual[item.key].notas}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {expandedDetailSection === 'talentoHumano' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { key: 'perfilPersonal', label: 'Perfil del Personal' },
                          { key: 'cantidadAsesores', label: 'Cantidad de Asesores' },
                          { key: 'horarios', label: 'Horarios' },
                          { key: 'formador', label: 'Formador' },
                          { key: 'capacitacionesAndes', label: 'Capacitaciones Andes BPO' },
                          { key: 'capacitacionesCliente', label: 'Capacitaciones Cliente' }
                        ].map(item => (
                          <div key={item.key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">{item.label}</h5>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">Estado:</span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                  implementacionDetail.talento_humano?.[item.key]?.estado === 'ok' ? 'bg-green-100 text-green-800' :
                                  implementacionDetail.talento_humano?.[item.key]?.estado === 'en proceso' ? 'bg-blue-100 text-blue-800' :
                                  implementacionDetail.talento_humano?.[item.key]?.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {implementacionDetail.talento_humano?.[item.key]?.estado || 'No definido'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Responsable:</span>
                                <span className="ml-2 text-gray-800">
                                  {implementacionDetail.talento_humano?.[item.key]?.responsable || 'No asignado'}
                                </span>
                              </div>
                              {implementacionDetail.talento_humano?.[item.key]?.seguimiento && (
                                <div>
                                  <span className="font-medium text-gray-600">Seguimiento:</span>
                                  <p className="text-gray-800 mt-1 text-sm leading-relaxed bg-white p-3 rounded border">
                                    {implementacionDetail.talento_humano[item.key].seguimiento}
                                  </p>
                                </div>
                              )}
                              {implementacionDetail.talento_humano?.[item.key]?.notas && (
                                <div>
                                  <span className="font-medium text-gray-600">Notas:</span>
                                  <p className="text-gray-800 mt-1 text-sm leading-relaxed bg-white p-3 rounded border">
                                    {implementacionDetail.talento_humano[item.key].notas}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {expandedDetailSection === 'procesos' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { key: 'responsableCliente', label: 'Responsable Cliente' },
                          { key: 'responsableAndes', label: 'Responsable Andes BPO' },
                          { key: 'responsablesOperacion', label: 'Responsables Operación' },
                          { key: 'listadoReportes', label: 'Listado Reportes' },
                          { key: 'protocoloComunicaciones', label: 'Protocolo Comunicaciones' },
                          { key: 'guionesProtocolos', label: 'Guiones y Protocolos' },
                          { key: 'procesoMonitoreo', label: 'Proceso Monitoreo' },
                          { key: 'cronogramaTecnologia', label: 'Cronograma Tecnología' },
                          { key: 'cronogramaCapacitaciones', label: 'Cronograma Capacitaciones' },
                          { key: 'realizacionPruebas', label: 'Realización Pruebas' }
                        ].map(item => (
                          <div key={item.key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">{item.label}</h5>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">Estado:</span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                  implementacionDetail.procesos?.[item.key]?.estado === 'ok' ? 'bg-green-100 text-green-800' :
                                  implementacionDetail.procesos?.[item.key]?.estado === 'en proceso' ? 'bg-blue-100 text-blue-800' :
                                  implementacionDetail.procesos?.[item.key]?.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {implementacionDetail.procesos?.[item.key]?.estado || 'No definido'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Responsable:</span>
                                <span className="ml-2 text-gray-800">
                                  {implementacionDetail.procesos?.[item.key]?.responsable || 'No asignado'}
                                </span>
                              </div>
                              {implementacionDetail.procesos?.[item.key]?.seguimiento && (
                                <div>
                                  <span className="font-medium text-gray-600">Seguimiento:</span>
                                  <p className="text-gray-800 mt-1 text-sm leading-relaxed bg-white p-3 rounded border">
                                    {implementacionDetail.procesos[item.key].seguimiento}
                                  </p>
                                </div>
                              )}
                              {implementacionDetail.procesos?.[item.key]?.notas && (
                                <div>
                                  <span className="font-medium text-gray-600">Notas:</span>
                                  <p className="text-gray-800 mt-1 text-sm leading-relaxed bg-white p-3 rounded border">
                                    {implementacionDetail.procesos[item.key].notas}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {expandedDetailSection === 'tecnologia' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { key: 'creacionModulo', label: 'Creación Módulo Wolkvox' },
                          { key: 'tipificacionInteracciones', label: 'Tipificación Interacciones' },
                          { key: 'aplicativosProceso', label: 'Aplicativos del Proceso' },
                          { key: 'whatsapp', label: 'WhatsApp' },
                          { key: 'correosElectronicos', label: 'Correos Electrónicos' },
                          { key: 'requisitosGrabacion', label: 'Requisitos Grabación' }
                        ].map(item => (
                          <div key={item.key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">{item.label}</h5>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">Estado:</span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                  implementacionDetail.tecnologia?.[item.key]?.estado === 'ok' ? 'bg-green-100 text-green-800' :
                                  implementacionDetail.tecnologia?.[item.key]?.estado === 'en proceso' ? 'bg-blue-100 text-blue-800' :
                                  implementacionDetail.tecnologia?.[item.key]?.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {implementacionDetail.tecnologia?.[item.key]?.estado || 'No definido'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Responsable:</span>
                                <span className="ml-2 text-gray-800">
                                  {implementacionDetail.tecnologia?.[item.key]?.responsable || 'No asignado'}
                                </span>
                              </div>
                              {implementacionDetail.tecnologia?.[item.key]?.seguimiento && (
                                <div>
                                  <span className="font-medium text-gray-600">Seguimiento:</span>
                                  <p className="text-gray-800 mt-1 text-sm leading-relaxed bg-white p-3 rounded border">
                                    {implementacionDetail.tecnologia[item.key].seguimiento}
                                  </p>
                                </div>
                              )}
                              {implementacionDetail.tecnologia?.[item.key]?.notas && (
                                <div>
                                  <span className="font-medium text-gray-600">Notas:</span>
                                  <p className="text-gray-800 mt-1 text-sm leading-relaxed bg-white p-3 rounded border">
                                    {implementacionDetail.tecnologia[item.key].notas}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <FaLaptop className="mx-auto text-gray-400 text-4xl mb-4" />
              <p className="text-gray-600">No se pudieron cargar los detalles</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Resumen estilo campañas */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* Tarjetas estadísticas en 2 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 lg:max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-200 flex items-center gap-4 p-4 shadow-sm">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaLaptop className="text-blue-600 text-2xl" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 font-semibold">Total Implementaciones</p>
              <p className="text-gray-400 text-sm">Registradas</p>
            </div>
            <span className="text-blue-600 text-2xl font-bold">{implementaciones.length}</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 flex items-center gap-4 p-4 shadow-sm">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaUsers className="text-green-600 text-2xl" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 font-semibold">Activas</p>
              <p className="text-gray-400 text-sm">En sistema</p>
            </div>
            <span className="text-green-600 text-2xl font-bold">{implementaciones.filter(imp => imp.estado === 'Activo').length}</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 flex items-center gap-4 p-4 shadow-sm">
            <div className="p-3 bg-amber-100 rounded-lg">
              <FaCogs className="text-amber-600 text-2xl" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 font-semibold">Pendientes</p>
              <p className="text-gray-400 text-sm">Por iniciar</p>
            </div>
            <span className="text-amber-600 text-2xl font-bold">{implementaciones.filter(imp => imp.estado === 'Pendiente').length}</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 flex items-center gap-4 p-4 shadow-sm">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaFileContract className="text-purple-600 text-2xl" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 font-semibold">Finalizadas</p>
              <p className="text-gray-400 text-sm">Completadas</p>
            </div>
            <span className="text-purple-600 text-2xl font-bold">{implementaciones.filter(imp => imp.estado === 'Finalizado').length}</span>
          </div>
        </div>
        {/* Distribución por Servicio */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaLaptop className="text-purple-600 text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Distribución por Servicio</h2>
                <p className="text-gray-500 text-sm">Implementaciones actuales por tipo</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {/* SAC */}
              <div className="rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-between border-2 border-blue-400">
                <div>
                  <span className="text-blue-700 font-bold text-lg">SAC</span>
                  <p className="text-gray-500 text-sm">Atención al Cliente</p>
                </div>
                <span className="text-blue-700 text-2xl font-bold">{implementaciones.filter(imp => imp.proceso === 'SAC').length}</span>
              </div>
              {/* TVT */}
              <div className="rounded-lg p-4 bg-gradient-to-r from-purple-50 to-purple-100 flex items-center justify-between border-2 border-purple-400">
                <div>
                  <span className="text-purple-700 font-bold text-lg">TVT</span>
                  <p className="text-gray-500 text-sm">Televentas</p>
                </div>
                <span className="text-purple-700 text-2xl font-bold">{implementaciones.filter(imp => imp.proceso === 'TVT').length}</span>
              </div>
              {/* TMC */}
              <div className="rounded-lg p-4 bg-gradient-to-r from-green-50 to-green-100 flex items-center justify-between border-2 border-green-400">
                <div>
                  <span className="text-green-700 font-bold text-lg">TMC</span>
                  <p className="text-gray-500 text-sm">Telemercadeo</p>
                </div>
                <span className="text-green-700 text-2xl font-bold">{implementaciones.filter(imp => imp.proceso === 'TMC').length}</span>
              </div>
              {/* CBZ */}
              <div className="rounded-lg p-4 bg-gradient-to-r from-orange-50 to-orange-100 flex items-center justify-between border-2 border-orange-400">
                <div>
                  <span className="text-orange-700 font-bold text-lg">CBZ</span>
                  <p className="text-gray-500 text-sm">Cobranza</p>
                </div>
                <span className="text-orange-700 text-2xl font-bold">{implementaciones.filter(imp => imp.proceso === 'CBZ').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles y filtros mejorados */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <FaPlus size={16} />
              Nueva Implementación
            </button>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
              <select
                value={estadoFiltro}
                onChange={e => setEstadoFiltro(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 shadow-sm transition-all duration-200 min-w-[160px]"
              >
                <option value="">Todos los estados</option>
                <option value="Pendiente">🟡 Pendiente</option>
                <option value="En Proceso">🔵 En Proceso</option>  
                <option value="Finalizado">🟢 Finalizado</option>
                <option value="Activo">✅ Activo</option>
                <option value="Cancelado">🔴 Cancelado</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 min-w-[280px]"
                placeholder="Buscar por cliente o proceso..."
              />
            </div>
            
            {/* Indicador de resultados */}
            {searchTerm && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-xs text-blue-700 font-medium">
                  {implementacionesFiltradas.length} resultado{implementacionesFiltradas.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                  title="Limpiar búsqueda"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Resumen de filtros activos */}
        {(estadoFiltro || searchTerm) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Filtros activos:</span>
              {estadoFiltro && (
                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                  Estado: {estadoFiltro}
                </span>
              )}
              {searchTerm && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Búsqueda: "{searchTerm}"
                </span>
              )}
              <button
                onClick={() => {
                  setEstadoFiltro('');
                  setSearchTerm('');
                }}
                className="text-blue-600 hover:text-blue-800 text-xs underline ml-2"
              >
                Limpiar todos
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de implementaciones */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaLaptop className="text-blue-600 text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Lista de Implementaciones</h2>
              <p className="text-sm text-gray-600">Gestión completa de implementaciones de clientes</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-blue-500" />
                    Cliente
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaCogs className="text-purple-500" />
                    Proceso
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaFileContract className="text-green-500" />
                    Estado
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {implementacionesFiltradas.length > 0 ? (
                implementacionesFiltradas.map((implementacion, index) => (
                  <tr 
                    key={implementacion.id} 
                    className={`hover:bg-blue-50 transition-all duration-200 cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                    onClick={() => abrirModalDetalle(implementacion)}
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <FaUsers className="text-blue-600 text-sm" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{implementacion.cliente}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          implementacion.proceso === 'SAC' ? 'bg-blue-100 text-blue-800' :
                          implementacion.proceso === 'TVT' ? 'bg-purple-100 text-purple-800' :
                          implementacion.proceso === 'TMC' ? 'bg-green-100 text-green-800' :
                          implementacion.proceso === 'CBZ' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {implementacion.proceso}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {editingEstado === implementacion.id ? (
                        <div className="relative inline-block w-52 estado-dropdown">
                          {/* Dropdown personalizado estilizado */}
                          <div className="absolute top-0 left-0 bg-white border-2 border-blue-300 rounded-xl shadow-2xl p-3 z-50 transform transition-all duration-300 ease-out scale-100 opacity-100 min-w-[200px]">
                            <div className="mb-2 pb-2 border-b border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <FaEdit className="text-blue-500" size={12} />
                                Cambiar Estado
                              </h4>
                            </div>
                            <div className="space-y-1">
                              {[
                                { value: 'Pendiente', label: '🟡 Pendiente', bg: 'bg-amber-50', text: 'text-amber-800', hover: 'hover:bg-amber-100' },
                                { value: 'En Proceso', label: '🔵 En Proceso', bg: 'bg-blue-50', text: 'text-blue-800', hover: 'hover:bg-blue-100' },
                                { value: 'Activo', label: '✅ Activo', bg: 'bg-emerald-50', text: 'text-emerald-800', hover: 'hover:bg-emerald-100' },
                                { value: 'Finalizado', label: '🟢 Finalizado', bg: 'bg-indigo-50', text: 'text-indigo-800', hover: 'hover:bg-indigo-100' },
                                { value: 'Cancelado', label: '🔴 Cancelado', bg: 'bg-red-50', text: 'text-red-800', hover: 'hover:bg-red-100' }
                              ].map((estado) => (
                                <button
                                  key={estado.value}
                                  onClick={() => cambiarEstado(implementacion.id, estado.value)}
                                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 transform hover:scale-105 ${estado.bg} ${estado.text} ${estado.hover} ${
                                    implementacion.estado === estado.value ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-sm' : ''
                                  }`}
                                >
                                  <span className="text-base">{estado.label.split(' ')[0]}</span>
                                  <span>{estado.label.split(' ').slice(1).join(' ')}</span>
                                  {implementacion.estado === estado.value && (
                                    <span className="ml-auto text-blue-600">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-200">
                              <button
                                onClick={() => setEditingEstado(null)}
                                className="w-full text-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                              >
                                <span>✕</span>
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingEstado(implementacion.id)}
                          className={`group inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 hover:shadow-lg cursor-pointer border-2 ${
                            implementacion.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 hover:border-emerald-300' :
                            implementacion.estado === 'Pendiente' ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 hover:border-amber-300' :
                            implementacion.estado === 'En Proceso' ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:border-blue-300' :
                            implementacion.estado === 'Finalizado' ? 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200 hover:border-indigo-300' :
                            'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 hover:border-gray-300'
                          }`}
                          title="Haz clic para cambiar el estado"
                        >
                          <div className={`w-2.5 h-2.5 rounded-full mr-2 transition-all duration-200 ${
                            implementacion.estado === 'Activo' ? 'bg-emerald-500' :
                            implementacion.estado === 'Pendiente' ? 'bg-amber-500' :
                            implementacion.estado === 'En Proceso' ? 'bg-blue-500' :
                            implementacion.estado === 'Finalizado' ? 'bg-indigo-500' :
                            'bg-gray-500'
                          }`}></div>
                          <span className="font-medium">{implementacion.estado || 'Sin estado'}</span>
                          <FaEdit className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-110" size={10} />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => console.log('Editar', implementacion.id)}
                          className="inline-flex items-center px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Editar implementación"
                        >
                          <FaEdit className="mr-1.5" size={12} />
                          Editar
                        </button>
                        <button
                          onClick={() => console.log('Eliminar', implementacion.id)}
                          className="inline-flex items-center px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Eliminar implementación"
                        >
                          <FaTrash className="mr-1.5" size={12} />
                          Eliminar
                        </button>
                        <button
                          onClick={() => console.log('Descargar Excel', implementacion.id)}
                          className="inline-flex items-center px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Descargar en Excel"
                        >
                          <FaFileExcel className="mr-1.5" size={12} />
                          Excel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <FaLaptop className="text-gray-400 text-2xl" />
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">
                          {loading ? 'Cargando implementaciones...' : 'No hay implementaciones registradas'}
                        </p>
                        {!loading && (
                          <p className="text-gray-400 text-sm mt-1">
                            Comienza creando una nueva implementación
                          </p>
                        )}
                      </div>
                      {loading && (
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer de la tabla */}
        {implementacionesFiltradas.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Mostrando <span className="font-medium">{implementacionesFiltradas.length}</span> de{' '}
                <span className="font-medium">{implementaciones.length}</span> implementaciones
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">Total registros:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {implementaciones.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Implementaciones;
