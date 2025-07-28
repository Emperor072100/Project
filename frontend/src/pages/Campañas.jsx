import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaPlus, FaEdit, FaHistory, FaUsers, FaBullhorn, FaChartBar, FaBoxOpen, FaFileInvoiceDollar } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const Campañas = () => {
  const location = useLocation();
  // Estados principales
  const [campañas, setCampañas] = useState([]);
  const [clientesCorporativos, setClientesCorporativos] = useState([]);
  const [contactos, setContactos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total_clientes_corporativos: 0,
    total_contactos: 0,
    total_campañas: 0,
    por_servicio: { SAC: 0, TMC: 0, TVT: 0, CBZ: 0 }
  });

  // Estados para modales
  const [modalClienteCorporativo, setModalClienteCorporativo] = useState(false);
  const [modalContacto, setModalContacto] = useState(false);
  const [modalCampaña, setModalCampaña] = useState(false);
  const [modalAdministrar, setModalAdministrar] = useState(false);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [campañaSeleccionada, setCampañaSeleccionada] = useState(null);
  
  // Nuevos modales independientes
  const [modalProductos, setModalProductos] = useState(false);
  const [modalFacturacion, setModalFacturacion] = useState(false);
  
  const [mostrarProductos, setMostrarProductos] = useState(false);
  const [formProducto, setFormProducto] = useState({
    tipo: 'Producto',
    producto_servicio: '',
    proveedor: '',
    propiedad: 'Propia',
    cantidad: 1
  });
  const [mostrarFacturacion, setMostrarFacturacion] = useState(false);
  const [formFacturacion, setFormFacturacion] = useState({
    unidad: '',
    cantidad: 1,
    valor: '',
    periodicidad: ''
  });
  const [facturacionGuardada, setFacturacionGuardada] = useState([]);
  const [productoGuardado, setProductoGuardado] = useState([]);

  // Estado para edición de campania
  const [editando, setEditando] = useState(false);
  const [formEditar, setFormEditar] = useState({
    nombre: '',
    descripcion: '',
    tipo: '',
    cje: '',
    lider: '',
    cliente_id: '',
    contacto_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: '',
    presupuesto: '',
    observaciones: ''
  });
  
  // Estados para formularios
  const [formClienteCorporativo, setFormClienteCorporativo] = useState({
    nombre: '',
    logo: '',
    sector: ''
  });

  const [formContacto, setFormContacto] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    cliente_corporativo_id: ''
  });

  const [formCampaña, setFormCampaña] = useState({
    nombre: '',
    tipo: 'SAC',
    cliente_corporativo_id: '',
    contacto_id: '',
    lider_de_campaña: '',
    ejecutivo: '',
    fecha_de_produccion: '',
    estado: 'activo'
  });

  const [loading, setLoading] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // Abrir modal administrar si adminId está en la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const adminId = params.get('adminId');
    if (adminId && campañas.length > 0) {
      const camp = campañas.find(c => String(c.id) === String(adminId));
      if (camp) {
        setCampañaSeleccionada(camp);
        setModalAdministrar(true);
      }
    }
  }, [location.search, campañas]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [campañasRes, clientesCorporativosRes, contactosRes, estadisticasRes] = await Promise.all([
        axios.get('http://localhost:8000/campanas', config),
        axios.get('http://localhost:8000/clientes-corporativos', config),
        axios.get('http://localhost:8000/contactos', config),
        axios.get('http://localhost:8000/campanas/estadisticas', config)
      ]);

      // Mapear los datos de campañas con información relacionada
      const campañasConDatos = campañasRes.data.map(campaña => {
        const clienteCorporativo = clientesCorporativosRes.data.find(
          cliente => cliente.id === campaña.cliente_corporativo_id
        );
        const contacto = contactosRes.data.find(
          cont => cont.id === campaña.contacto_id
        );

        return {
          ...campaña,
          cliente_nombre: clienteCorporativo?.nombre || 'Sin asignar',
          contacto_nombre: contacto?.nombre || 'Sin asignar',
          contacto_telefono: contacto?.telefono || '',
          // Mapear campos para compatibilidad con la tabla existente
          cje: campaña.ejecutivo,
          lider: campaña.lider_de_campaña,
          // Asegurar que el estado tenga un valor por defecto
          estado: campaña.estado || 'activo'
        };
      });

      setCampañas(campañasConDatos);
      setClientesCorporativos(clientesCorporativosRes.data);
      setContactos(contactosRes.data);
      setEstadisticas(estadisticasRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Función para crear cliente corporativo
  const handleClienteCorporativoSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:8000/clientes-corporativos/', formClienteCorporativo, config);
      Swal.fire({
        icon: 'success',
        title: 'Cliente corporativo creado',
        text: 'El cliente corporativo se ha creado exitosamente',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        setModalClienteCorporativo(false);
        setFormClienteCorporativo({ nombre: '', logo: '', sector: '' });
        cargarDatos();
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al crear el cliente corporativo',
      });
    }
  };

  // Función para crear contacto
  const handleContactoSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:8000/contactos/', formContacto, config);
      Swal.fire({
        icon: 'success',
        title: 'Contacto creado',
        text: 'El contacto se ha creado exitosamente',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        setModalContacto(false);
        setFormContacto({ nombre: '', telefono: '', correo: '', cliente_corporativo_id: '' });
        cargarDatos();
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al crear el contacto',
      });
    }
  };

  // Función para crear campania
  const handleCampañaSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const datosEnvio = {
        nombre: formCampaña.nombre,
        tipo: formCampaña.tipo,
        cliente_corporativo_id: parseInt(formCampaña.cliente_corporativo_id),
        contacto_id: parseInt(formCampaña.contacto_id),
        lider_de_campaña: formCampaña.lider_de_campaña,
        ejecutivo: formCampaña.ejecutivo,
        fecha_de_produccion: formCampaña.fecha_de_produccion || null,
        estado: formCampaña.estado
      };

      await axios.post('http://localhost:8000/campanas/', datosEnvio, config);
      Swal.fire({
        icon: 'success',
        title: 'Campaña creada',
        text: 'La campaña se ha creado exitosamente',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        setModalCampaña(false);
        setFormCampaña({
          nombre: '',
          tipo: 'SAC',
          cliente_corporativo_id: '',
          contacto_id: '',
          lider_de_campaña: '',
          ejecutivo: '',
          fecha_de_produccion: '',
          estado: 'activo'
        });
        cargarDatos();
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al crear la campaña',
      });
    }
  };

  const handleAdministrar = (campaña) => {
    setCampañaSeleccionada(campaña);
    setModalAdministrar(true);
    setMostrarProductos(false);
    setMostrarFacturacion(false);
    setEditando(false);
    setFormEditar({
      nombre: campaña.nombre || '',
      descripcion: campaña.descripcion || '',
      tipo: campaña.tipo || '',
      cje: campaña.ejecutivo || '', // Usar el campo correcto
      lider: campaña.lider_de_campaña || '', // Usar el campo correcto
      cliente_id: campaña.cliente_corporativo_id ? campaña.cliente_corporativo_id.toString() : '', // Convertir a string para el select
      contacto_id: campaña.contacto_id ? campaña.contacto_id.toString() : '', // Convertir a string para el select
      fecha_inicio: campaña.fecha_de_produccion ? campaña.fecha_de_produccion : '',
      fecha_fin: campaña.fecha_fin ? campaña.fecha_fin.slice(0, 16) : '',
      estado: campaña.estado || 'activo',
      presupuesto: campaña.presupuesto || '',
      observaciones: campaña.observaciones || ''
    });
    setProductoGuardado([]);
    setFacturacionGuardada([]);
  };


  const handleGuardarEdicion = async () => {
    if (!campañaSeleccionada?.id) {
      toast.error('ID de campaña inválido. No se puede guardar.');
      return;
    }
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        nombre: formEditar.nombre,
        tipo: formEditar.tipo,
        cliente_corporativo_id: parseInt(formEditar.cliente_id),
        contacto_id: parseInt(formEditar.contacto_id),
        lider_de_campaña: formEditar.lider,
        ejecutivo: formEditar.cje,
        fecha_de_produccion: formEditar.fecha_inicio || null,
        estado: formEditar.estado
      };
      
      await axios.put(encodeURI(`http://localhost:8000/campanas/${campañaSeleccionada.id}`), payload, config);
      setCampañaSeleccionada((prev) => ({ ...prev, ...payload }));
      
      // Actualizar la lista de campañas
      setCampañas((prev) => 
        prev.map((c) => 
          c.id === campañaSeleccionada.id ? { ...c, ...payload } : c
        )
      );
      
      // Actualizar el historial (el backend ya registra el cambio automáticamente)
      await actualizarHistorial();
      Swal.fire({
        icon: 'success',
        title: 'Campaña actualizada',
        text: 'La campaña se ha actualizado correctamente',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        setEditando(false);
        cargarDatos(); // Refresca la lista tras editar
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        Swal.fire({
          icon: 'error',
          title: 'No se encontró la campaña',
          text: 'Puede que haya sido eliminada o el ID es incorrecto.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al guardar los cambios',
        });
      }
    }
  };

  const handleFacturacionChange = (e) => {
    const { name, value } = e.target;
    setFormFacturacion((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardarFacturacion = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const facturacionData = {
        unidad: formFacturacion.unidad,
        cantidad: parseInt(formFacturacion.cantidad),
        valor: parseFloat(formFacturacion.valor),
        periodicidad: formFacturacion.periodicidad
      };

      let res;
      if (formFacturacion.id) {
        // Si tiene ID, es una edición
        res = await axios.put(
          `http://localhost:8000/campanas/${campañaSeleccionada.id}/facturacion/${formFacturacion.id}`,
          facturacionData,
          config
        );
        
        // Actualizar la lista reemplazando el elemento editado
        setFacturacionGuardada(prev => prev.map(item => 
          item.id === formFacturacion.id ? res.data : item
        ));
        await Swal.fire({
          icon: 'success',
          title: 'Unidad de facturación actualizada',
          text: 'La unidad de facturación se ha actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Si no tiene ID, es una creación
        res = await axios.post(
          `http://localhost:8000/campanas/${campañaSeleccionada.id}/facturacion`,
          facturacionData,
          config
        );
        
        setFacturacionGuardada(prev => [...prev, res.data]);
        await Swal.fire({
          icon: 'success',
          title: 'Unidad de facturación guardada',
          text: 'La unidad de facturación se ha guardado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setFormFacturacion({ unidad: '', cantidad: 1, valor: '', periodicidad: '' });
    } catch (error) {
      console.error('Error guardando facturación:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar la unidad de facturación',
      });
    }
  };

  const handleProductoChange = (e) => {
    const { name, value } = e.target;
    setFormProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    try {
      console.log('Campaña seleccionada:', campañaSeleccionada);
      console.log('ID de campaña:', campañaSeleccionada?.id);
      
      if (!campañaSeleccionada?.id) {
        toast.error('No hay campaña seleccionada');
        return;
      }

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const productoData = {
        tipo: formProducto.tipo,
        producto_servicio: formProducto.producto_servicio,
        proveedor: formProducto.proveedor,
        propiedad: formProducto.propiedad,
        cantidad: parseInt(formProducto.cantidad)
      };

      console.log('Datos del producto a enviar:', productoData);

      let res;
      if (formProducto.id) {
        // Si tiene ID, es una edición
        console.log('URL del endpoint (PUT):', `http://localhost:8000/campanas/${campañaSeleccionada.id}/productos/${formProducto.id}`);
        res = await axios.put(
          `http://localhost:8000/campanas/${campañaSeleccionada.id}/productos/${formProducto.id}`,
          productoData,
          config
        );
        
        // Actualizar la lista reemplazando el elemento editado
        setProductoGuardado(prev => prev.map(item => 
          item.id === formProducto.id ? res.data : item
        ));
        await Swal.fire({
          icon: 'success',
          title: 'Producto/servicio actualizado',
          text: 'El producto/servicio se ha actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Si no tiene ID, es una creación
        console.log('URL del endpoint (POST):', `http://localhost:8000/campanas/${campañaSeleccionada.id}/productos`);
        res = await axios.post(
          `http://localhost:8000/campanas/${campañaSeleccionada.id}/productos`,
          productoData,
          config
        );
        
        setProductoGuardado(prev => [...prev, res.data]);
        await Swal.fire({
          icon: 'success',
          title: 'Producto/servicio guardado',
          text: 'El producto/servicio se ha guardado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setFormProducto({ tipo: 'Producto', producto_servicio: '', proveedor: '', propiedad: 'Propia', cantidad: 1 });
    } catch (error) {
      console.error('Error guardando producto:', error);
      console.error('Respuesta del servidor:', error.response);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar el producto/servicio',
      });
    }
  };

  const handleHistorial = async (campaña) => {
    setCampañaSeleccionada(campaña);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:8000/campanas/${campaña.id}/historial`, config);
      setHistorial(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setHistorial([]);
      toast.error('No se pudo cargar el historial', error);
    }
    setModalHistorial(true);
  };

  // Función para actualizar el historial sin abrir modal
  const actualizarHistorial = async () => {
    if (!campañaSeleccionada?.id) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:8000/campanas/${campañaSeleccionada.id}/historial`, config);
      setHistorial(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log('Error actualizando historial:', error);
      // No mostrar error al usuario ya que es una actualización silenciosa
    }
  };

  // Nuevas funciones para los modales independientes
  const handleAbrirProductos = async (campaña) => {
    setCampañaSeleccionada(campaña);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:8000/campanas/${campaña.id}/productos`, config);
      setProductoGuardado(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setProductoGuardado([]);
    }
    setModalProductos(true);
  };

  const handleAbrirFacturacion = async (campaña) => {
    setCampañaSeleccionada(campaña);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:8000/campanas/${campaña.id}/facturacion`, config);
      setFacturacionGuardada(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error cargando facturación:', error);
      setFacturacionGuardada([]);
    }
    setModalFacturacion(true);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Modal Historial de Campaña */}
      <Modal
        isOpen={modalHistorial}
        onClose={() => setModalHistorial(false)}
        title={
          <div className="flex items-center justify-between w-full">
            <span className="font-semibold text-lg">Historial de Cambios</span>
          </div>
        }
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{campañaSeleccionada?.nombre || 'Campaña'}</h3>
              <p className="text-sm text-gray-500">Historial completo de actividad</p>
            </div>
          </div>
          
          {historial.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">No hay historial aún</p>
              <p className="text-gray-400 text-sm">Los cambios aparecerán aquí cuando se modifique la campaña</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {historial.map((h, idx) => {
                const fecha = new Date(new Date(h.fecha).getTime() - (5 * 60 * 60 * 1000));
                const fechaTexto = fecha.toLocaleString('es-CO', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                });
                
                return (
                  <div key={idx} className="relative">
                    {/* Línea vertical del timeline */}
                    {idx !== historial.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-full bg-gradient-to-b from-blue-200 to-transparent"></div>
                    )}
                    
                    {/* Contenido del evento */}
                    <div className="flex gap-4">
                      {/* Indicador circular */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      
                      {/* Tarjeta de contenido */}
                      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="p-4">
                          {/* Header con fecha */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                {idx === 0 ? 'Más reciente' : `Hace ${idx === 1 ? '1 cambio' : `${idx} cambios`}`}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 font-mono">
                              {fechaTexto}
                            </div>
                          </div>
                          
                          {/* Contenido del cambio */}
                          <div className="text-gray-700">
                            {h.observaciones ? (
                              <p className="leading-relaxed">{h.observaciones}</p>
                            ) : (
                              <div className="space-y-1">
                                {Object.entries(h.cambios || {}).map(([k, v]) => (
                                  <div key={k} className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <span><span className="font-semibold text-gray-800">{k}:</span> {String(v)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Footer con gradiente sutil */}
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-b-xl"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal Administrar Campaña */}
      <Modal
        isOpen={modalAdministrar}
        onClose={() => setModalAdministrar(false)}
        title={
          <div className="flex items-center justify-between w-full">
            <span className="font-semibold text-lg">Administrar Campaña</span>
          </div>
        }
      >
        {campañaSeleccionada && (
          <div className="p-6">
            <div className="relative">
              {/* Información principal y botones SIEMPRE visibles */}
              {/* Vista o edición de datos principales */}
              {!editando ? (
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Info principal organizada en grid */}
                  <div className="flex-1 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                      <div>
                        <span className="block text-xs font-semibold text-gray-500">Cliente Corporativo</span>
                        <span className="text-base text-gray-800">{campañaSeleccionada.cliente_nombre || <span className='italic text-gray-400'>Sin asignar</span>}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500">Tipo de Servicio</span>
                        <span className="text-base text-gray-800">{campañaSeleccionada.tipo || <span className='italic text-gray-400'>Sin asignar</span>}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500">Nombre de la Campaña</span>
                        <span className="text-base text-gray-800">{campañaSeleccionada.nombre || <span className='italic text-gray-400'>Sin nombre</span>}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500">Contacto Asociado</span>
                        <span className="text-base text-gray-800">{campañaSeleccionada.contacto_nombre || <span className='italic text-gray-400'>Sin contacto</span>}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500">Número de Contacto</span>
                        <span className="text-base text-gray-800">{campañaSeleccionada.contacto_telefono || <span className='italic text-gray-400'>Sin número</span>}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500">Líder de Campaña</span>
                        <span className="text-base text-gray-800">{campañaSeleccionada.lider_de_campaña || <span className='italic text-gray-400'>Sin asignar</span>}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500">Ejecutivo</span>
                        <span className="text-base text-gray-800">{campañaSeleccionada.ejecutivo || <span className='italic text-gray-400'>Sin asignar</span>}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500">Fecha de Producción</span>
                        <span className="text-base text-gray-800">{campañaSeleccionada.fecha_de_produccion || <span className='italic text-gray-400'>Sin fecha</span>}</span>
                      </div>
                    </div>
                    {/* Botón de Editar Campaña */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg border border-orange-200"
                        onClick={() => setEditando(true)}
                      >
                        <span className="inline-flex items-center gap-2">
                          <FaEdit className="text-white text-base" /> Editar Campaña
                        </span>
                      </button>
                    </div>
                    {/* Botones de acción para Productos y Facturación */}
                    <div className="flex flex-col md:flex-row gap-3 mt-6">
                      <button
                        type="button"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg border border-blue-200"
                        onClick={() => handleAbrirProductos(campañaSeleccionada)}
                      >
                        <span className="inline-flex items-center gap-2">
                          <FaBoxOpen className="text-white text-base" /> Productos y/o Servicio
                        </span>
                      </button>
                      <button
                        type="button"
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg border border-green-200"
                        onClick={() => handleAbrirFacturacion(campañaSeleccionada)}
                      >
                        <span className="inline-flex items-center gap-2">
                          <FaFileInvoiceDollar className="text-white text-base" /> Unidades de Facturación
                        </span>
                      </button>
                    </div>
                  </div>
                  {/* Logo y Estado */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-start space-y-2 mt-2">
                    {/* Logo */}
                    <div className="w-28 h-28 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                      {(() => {
                        const cliente = clientesCorporativos.find(c => c.id === campañaSeleccionada.cliente_corporativo_id);
                        if (cliente && cliente.logo) {
                          return <img src={cliente.logo} alt="Logo cliente" className="object-contain w-full h-full" />;
                        }
                        return <span className="text-gray-400 italic text-sm">Sin logo</span>;
                      })()}
                    </div>
                    {/* Estado */}
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-500 mb-1">Estado</p>
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                        campañaSeleccionada.estado === 'activo' ? 
                          'bg-green-100 text-green-800 border border-green-200' :
                        campañaSeleccionada.estado === 'inactivo' ? 
                          'bg-red-100 text-red-800 border border-red-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {campañaSeleccionada.estado === 'activo' ? 'Activo' : 
                         campañaSeleccionada.estado === 'inactivo' ? 'Inactivo' : 
                         'Sin estado'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-orange-700">Editar Campaña</h3>
                    <button
                      onClick={() => setEditando(false)}
                      className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                      ×
                    </button>
                  </div>
                  
                  <form onSubmit={e => { 
                    e.preventDefault(); 
                    handleGuardarEdicion(); 
                  }} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Nombre de la Campaña */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Nombre de la Campaña *
                        </label>
                        <input
                          type="text"
                          required
                          value={formEditar.nombre}
                          onChange={(e) => setFormEditar({...formEditar, nombre: e.target.value})}
                          className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white"
                          placeholder="Nombre de la campaña"
                        />
                      </div>

                      {/* Tipo de Servicio */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Tipo de Servicio *
                        </label>
                        <select
                          required
                          value={formEditar.tipo}
                          onChange={(e) => setFormEditar({...formEditar, tipo: e.target.value})}
                          className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white"
                        >
                          <option value="">Seleccionar tipo</option>
                          <option value="SAC">SAC - Atención al Cliente</option>
                          <option value="TMC">TMC - Telemarketing</option>
                          <option value="TVT">TVT - Televentas</option>
                          <option value="CBZ">CBZ - Cobranza</option>
                        </select>
                      </div>

                      {/* Cliente Corporativo */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Cliente Corporativo *
                        </label>
                        <select
                          required
                          value={formEditar.cliente_id}
                          onChange={(e) => setFormEditar({...formEditar, cliente_id: e.target.value})}
                          className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white"
                        >
                          <option value="">Seleccionar empresa</option>
                          {clientesCorporativos.map(cliente => (
                            <option key={cliente.id} value={cliente.id}>
                              {cliente.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Contacto */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Contacto *
                        </label>
                        <select
                          required
                          value={formEditar.contacto_id}
                          onChange={(e) => setFormEditar({...formEditar, contacto_id: e.target.value})}
                          className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white"
                        >
                          <option value="">Seleccionar contacto</option>
                          {contactos.filter(contacto => 
                            !formEditar.cliente_id || 
                            contacto.cliente_corporativo_id.toString() === formEditar.cliente_id
                          ).map(contacto => (
                            <option key={contacto.id} value={contacto.id}>
                              {contacto.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Líder de Campaña */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Líder de Campaña *
                        </label>
                        <input
                          type="text"
                          required
                          value={formEditar.lider}
                          onChange={(e) => setFormEditar({...formEditar, lider: e.target.value})}
                          className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white"
                          placeholder="Nombre del líder"
                        />
                      </div>

                      {/* Ejecutivo */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Ejecutivo *
                        </label>
                        <input
                          type="text"
                          required
                          value={formEditar.cje}
                          onChange={(e) => setFormEditar({...formEditar, cje: e.target.value})}
                          className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white"
                          placeholder="Nombre del ejecutivo"
                        />
                      </div>

                      {/* Fecha de Producción */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Fecha de Producción *
                        </label>
                        <input
                          type="date"
                          required
                          value={formEditar.fecha_inicio}
                          onChange={(e) => setFormEditar({...formEditar, fecha_inicio: e.target.value})}
                          className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white"
                        />
                      </div>

                      {/* Estado */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Estado *
                        </label>
                        <select
                          required
                          value={formEditar.estado}
                          onChange={(e) => setFormEditar({...formEditar, estado: e.target.value})}
                          className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white"
                        >
                          <option value="activo">Activo</option>
                          <option value="inactivo">Inactivo</option>
                        </select>
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-3 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setEditando(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-6 rounded-lg font-medium transition-colors duration-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2.5 px-6 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </form>
                </div>
              )}
              {/* Formulario de Facturación expandible */}
              {mostrarFacturacion && (
                <div className="transition-all duration-300 overflow-hidden" style={{maxHeight: 600, opacity: 1, marginBottom: 24}}>
                  <form className="space-y-6" onSubmit={handleGuardarFacturacion}>
                    <h3 className="text-lg font-bold mb-4 text-green-800 flex items-center gap-2">
                      <FaBullhorn className="text-green-500" /> Unidades de facturación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-green-50 border border-green-100 rounded-xl p-4 mb-4 shadow-sm">
                      <div>
                        <label className="block text-sm font-semibold text-green-800 mb-1">Unidad de facturación</label>
                        <input name="unidad" value={formFacturacion.unidad} onChange={handleFacturacionChange} className="w-full border-2 border-green-200 rounded-lg px-3 py-2 focus:border-green-400 focus:ring-2 focus:ring-green-100 bg-white" required placeholder="Ej: Horas, Llamadas, etc." />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-green-800 mb-1">Cantidad</label>
                        <input type="number" name="cantidad" value={formFacturacion.cantidad} min={1} onChange={handleFacturacionChange} className="w-full border-2 border-green-200 rounded-lg px-3 py-2 focus:border-green-400 focus:ring-2 focus:ring-green-100 bg-white" required placeholder="Ej: 1" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-green-800 mb-1">Valor</label>
                        <div className="flex items-center">
                          <span className="mr-2 text-green-500 font-semibold">$</span>
                          <input type="number" name="valor" value={formFacturacion.valor} min={0} onChange={handleFacturacionChange} className="w-full border-2 border-green-200 rounded-lg px-3 py-2 focus:border-green-400 focus:ring-2 focus:ring-green-100 bg-white" required placeholder="Ej: 1000" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button type="button" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition" onClick={() => { setMostrarFacturacion(false); setFacturacionGuardada(null); }}>Cancelar</button>
                      <button type="submit" className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition">Guardar</button>
                    </div>
                  </form>
                  {facturacionGuardada && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-green-700 mb-2">Última facturación guardada:</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-green-900 text-sm border border-green-200 rounded">
                          <thead>
                            <tr className="bg-green-100">
                              <th className="px-3 py-2 border-b border-green-200 text-left">Unidad</th>
                              <th className="px-3 py-2 border-b border-green-200 text-left">Cantidad</th>
                              <th className="px-3 py-2 border-b border-green-200 text-left">Valor</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-3 py-2 border-b border-green-100">{facturacionGuardada.unidad}</td>
                              <td className="px-3 py-2 border-b border-green-100">{facturacionGuardada.cantidad}</td>
                              <td className="px-3 py-2 border-b border-green-100">${facturacionGuardada.valor}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Formulario de Productos expandible */}
              {mostrarProductos && (
                <div className="transition-all duration-300 overflow-hidden" style={{maxHeight: 600, opacity: 1, marginBottom: 24}}>
                  <form className="space-y-6" onSubmit={handleGuardarProducto}>
                    <h3 className="text-lg font-bold mb-4 text-blue-800 flex items-center gap-2">
                      <FaUsers className="text-blue-500" /> Productos y/o servicios
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 shadow-sm">
                      <div>
                        <label className="block text-sm font-semibold text-blue-800 mb-1">Tipo</label>
                        <select name="tipo" value={formProducto.tipo} onChange={handleProductoChange} className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white">
                          <option value="Producto">Producto</option>
                          <option value="Servicio">Servicio</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-blue-800 mb-1">Proveedor</label>
                        <input name="proveedor" value={formProducto.proveedor} onChange={handleProductoChange} className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white" required placeholder="Nombre del proveedor" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-blue-800 mb-1">Propiedad</label>
                        <select name="propiedad" value={formProducto.propiedad} onChange={handleProductoChange} className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white">
                          <option value="Propia">Propia</option>
                          <option value="Alquilada">Alquilada</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-blue-800 mb-1">Cantidad</label>
                        <input type="number" name="cantidad" value={formProducto.cantidad} min={1} onChange={handleProductoChange} className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white" required placeholder="Ej: 1" />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button type="button" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition" onClick={() => { setMostrarProductos(false); setProductoGuardado(null); }}>Cancelar</button>
                      <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition">Guardar</button>
                    </div>
                  </form>
                  {productoGuardado && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-blue-700 mb-2">Último producto/servicio guardado:</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-blue-900 text-sm border border-blue-200 rounded">
                          <thead>
                            <tr className="bg-blue-100">
                              <th className="px-3 py-2 border-b border-blue-200 text-left">Tipo</th>
                              <th className="px-3 py-2 border-b border-blue-200 text-left">Proveedor</th>
                              <th className="px-3 py-2 border-b border-blue-200 text-left">Propiedad</th>
                              <th className="px-3 py-2 border-b border-blue-200 text-left">Cantidad</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-3 py-2 border-b border-blue-100">{productoGuardado.tipo}</td>
                              <td className="px-3 py-2 border-b border-blue-100">{productoGuardado.proveedor}</td>
                              <td className="px-3 py-2 border-b border-blue-100">{productoGuardado.propiedad}</td>
                              <td className="px-3 py-2 border-b border-blue-100">{productoGuardado.cantidad}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Campañas</h1>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
        {/* Columna izquierda - Tarjetas apiladas */}
        <div className="flex flex-col h-full space-y-3">
          {/* Tarjeta Clientes */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex-1">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FaUsers className="text-blue-600 text-2xl" />
                </div>
                <div>
                  <p className="text-gray-600 text-lg font-medium">Clientes Corporativos</p>
                  <p className="text-gray-500 text-base">Empresas registradas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-blue-600">{estadisticas.total_clientes_corporativos}</p>
              </div>
            </div>
          </div>

          {/* Tarjeta Campañas */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex-1">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <FaBullhorn className="text-green-600 text-2xl" />
                </div>
                <div>
                  <p className="text-gray-600 text-lg font-medium">Campañas</p>
                  <p className="text-gray-500 text-base">Activas en sistema</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-green-600">{estadisticas.total_campañas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta Por Servicio - Más grande (2 columnas) */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 h-full">
            {/* Título superior */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <FaChartBar className="text-purple-600 text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Distribución por Servicio</h3>
                <p className="text-gray-500 text-base">Campañas actuales por tipo</p>
              </div>
            </div>
            
            {/* Grid 2x2 con mini tarjetas */}
            <div className="grid grid-cols-2 gap-2">
              {/* Mini tarjeta SAC */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-2 hover:shadow-sm transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-base font-semibold">SAC</p>
                    <p className="text-blue-800 text-base mt-1">Atención al Cliente</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-800">{estadisticas.por_servicio.SAC}</span>
                  </div>
                </div>
              </div>

              {/* Mini tarjeta TMC */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-2 hover:shadow-sm transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-base font-semibold">TMC</p>
                    <p className="text-green-800 text-base mt-1">Telemarketing</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green-800">{estadisticas.por_servicio.TMC}</span>
                  </div>
                </div>
              </div>

              {/* Mini tarjeta TVT */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-2 hover:shadow-sm transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-base font-semibold">TVT</p>
                    <p className="text-purple-800 text-base mt-1">Televentas</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-purple-800">{estadisticas.por_servicio.TVT}</span>
                  </div>
                </div>
              </div>

              {/* Mini tarjeta CBZ */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-2 hover:shadow-sm transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-base font-semibold">CBZ</p>
                    <p className="text-orange-800 text-base mt-1">Cobranza</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-orange-800">{estadisticas.por_servicio.CBZ}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setModalClienteCorporativo(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FaPlus /> Agregar Cliente Corporativo
        </button>
        <button
          onClick={() => setModalContacto(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FaPlus /> Agregar Contacto
        </button>
        <button
          onClick={() => setModalCampaña(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FaPlus /> Agregar Campaña
        </button>
      </div>

      {/* Tabla de campañas */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="text-gray-500 text-lg">Cargando...</div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Encabezado de la tabla */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Campañas Registradas</h2>
            <p className="text-gray-600 text-sm mt-1">Lista completa de todas las campañas activas</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Campaña
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Tipo de Servicio
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Ejecutivo
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Líder
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campañas.map((campaña, index) => (
                  <tr 
                    key={campaña.id} 
                    className={`hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-25 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {campaña.cliente_nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {campaña.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg border ${
                        campaña.tipo === 'SAC' ? 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 border-blue-200' :
                        campaña.tipo === 'TMC' ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-800 border-green-200' :
                        campaña.tipo === 'TVT' ? 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800 border-purple-200' :
                        campaña.tipo === 'CBZ' ? 'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-800 border-orange-200' :
                        'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {campaña.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900 font-medium">
                        {campaña.cje || <span className="text-gray-400 italic">Sin asignar</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900 font-medium">
                        {campaña.lider || <span className="text-gray-400 italic">Sin asignar</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${
                        campaña.estado === 'activo' ? 
                          'bg-green-100 text-green-800 border border-green-200' :
                        campaña.estado === 'inactivo' ? 
                          'bg-red-100 text-red-800 border border-red-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {campaña.estado === 'activo' ? 'Activo' : 
                         campaña.estado === 'inactivo' ? 'Inactivo' : 
                         'Sin estado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleAdministrar(campaña)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <FaEdit className="text-xs" />
                          Administrar
                        </button>
                        <button
                          onClick={() => handleHistorial(campaña)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <FaHistory className="text-xs" />
                          Historial
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer de la tabla */}
          {campañas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FaBullhorn className="mx-auto text-4xl mb-2 opacity-50" />
              <p className="text-lg font-medium">No hay campañas registradas</p>
              <p className="text-sm">Comienza agregando tu primera campaña</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Agregar Cliente Corporativo */}
      <Modal
        isOpen={modalClienteCorporativo}
        onClose={() => setModalClienteCorporativo(false)}
        title="Agregar Nuevo Cliente Corporativo"
      >
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <FaUsers className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Información del Cliente Corporativo</h3>
              <p className="text-blue-600">Complete los datos de la empresa</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleClienteCorporativoSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                required
                value={formClienteCorporativo.nombre}
                onChange={(e) => setFormClienteCorporativo({...formClienteCorporativo, nombre: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                placeholder="Ingrese el nombre de la empresa"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sector
              </label>
              <input
                type="text"
                required
                value={formClienteCorporativo.sector}
                onChange={(e) => setFormClienteCorporativo({...formClienteCorporativo, sector: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                placeholder="Ej: Tecnología, Salud, Financiero"
              />
            </div>

            <div className="relative md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Logo (URL)
              </label>
              <input
                type="url"
                value={formClienteCorporativo.logo}
                onChange={(e) => setFormClienteCorporativo({...formClienteCorporativo, logo: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                placeholder="https://empresa.com/logo.png"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setModalClienteCorporativo(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Crear Cliente Corporativo
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Agregar Contacto */}
      <Modal
        isOpen={modalContacto}
        onClose={() => setModalContacto(false)}
        title="Agregar Nuevo Contacto"
      >
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <FaUsers className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-800">Información del Contacto</h3>
              <p className="text-purple-600">Complete los datos del contacto</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleContactoSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={formContacto.nombre}
                onChange={(e) => setFormContacto({...formContacto, nombre: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white"
                placeholder="Ingrese el nombre del contacto"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cliente Corporativo *
              </label>
              <select
                required
                value={formContacto.cliente_corporativo_id}
                onChange={(e) => setFormContacto({...formContacto, cliente_corporativo_id: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white"
              >
                <option value="">Seleccionar empresa</option>
                {clientesCorporativos.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                required
                value={formContacto.telefono}
                onChange={(e) => setFormContacto({...formContacto, telefono: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white"
                placeholder="Ej: +1 234 567 8900"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                value={formContacto.correo}
                onChange={(e) => setFormContacto({...formContacto, correo: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white"
                placeholder="contacto@empresa.com"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setModalContacto(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Crear Contacto
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Agregar Campaña */}
      <Modal
        isOpen={modalCampaña}
        onClose={() => setModalCampaña(false)}
        title="Agregar Nueva Campaña"
      >
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <FaBullhorn className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Nueva Campaña</h3>
              <p className="text-green-600">Configure los detalles de la campaña</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCampañaSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nombre de la Campaña *
              </label>
              <input
                type="text"
                required
                value={formCampaña.nombre}
                onChange={(e) => setFormCampaña({...formCampaña, nombre: e.target.value})}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
                placeholder="Ingrese el nombre de la campaña"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tipo de Servicio *
              </label>
              <select
                value={formCampaña.tipo}
                onChange={(e) => setFormCampaña({...formCampaña, tipo: e.target.value})}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
              >
                <option value="SAC">SAC - Atención al Cliente</option>
                <option value="TMC">TMC - Telemarketing</option>
                <option value="TVT">TVT - Televentas</option>
                <option value="CBZ">CBZ - Cobranza</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Cliente Corporativo *
              </label>
              <select
                required
                value={formCampaña.cliente_corporativo_id}
                onChange={(e) => setFormCampaña({...formCampaña, cliente_corporativo_id: e.target.value})}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
              >
                <option value="">Seleccionar empresa</option>
                {clientesCorporativos.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Contacto *
              </label>
              <select
                required
                value={formCampaña.contacto_id}
                onChange={(e) => setFormCampaña({...formCampaña, contacto_id: e.target.value})}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
              >
                <option value="">Seleccionar contacto</option>
                {contactos.filter(contacto => 
                  !formCampaña.cliente_corporativo_id || 
                  contacto.cliente_corporativo_id.toString() === formCampaña.cliente_corporativo_id
                ).map(contacto => (
                  <option key={contacto.id} value={contacto.id}>
                    {contacto.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Líder de Campaña *
              </label>
              <input
                type="text"
                required
                value={formCampaña.lider_de_campaña}
                onChange={(e) => setFormCampaña({...formCampaña, lider_de_campaña: e.target.value})}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
                placeholder="Nombre del líder"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Ejecutivo *
              </label>
              <input
                type="text"
                required
                value={formCampaña.ejecutivo}
                onChange={(e) => setFormCampaña({...formCampaña, ejecutivo: e.target.value})}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
                placeholder="Nombre del ejecutivo"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Fecha de Producción *
              </label>
              <input
                type="date"
                required
                value={formCampaña.fecha_de_produccion}
                onChange={(e) => setFormCampaña({...formCampaña, fecha_de_produccion: e.target.value})}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Estado *
              </label>
              <select
                required
                value={formCampaña.estado}
                onChange={(e) => setFormCampaña({...formCampaña, estado: e.target.value})}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setModalCampaña(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2.5 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Crear Campaña
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Productos */}
      <Modal
        isOpen={modalProductos}
        onClose={() => setModalProductos(false)}
        title="Productos y/o Servicios"
      >
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-600 rounded-lg">
              <FaBoxOpen className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Gestión de Productos</h3>
              <p className="text-yellow-600">Administra los productos y servicios de la campaña</p>
            </div>
          </div>
        </div>

        {/* Formulario para agregar producto */}
        <form className="space-y-4 mb-6" onSubmit={handleGuardarProducto}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select 
                name="tipo" 
                value={formProducto.tipo} 
                onChange={handleProductoChange} 
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200"
              >
                <option value="Producto">Producto</option>
                <option value="Servicio">Servicio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Producto/Servicio</label>
              <input 
                name="producto_servicio" 
                value={formProducto.producto_servicio} 
                onChange={handleProductoChange} 
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200"
                placeholder="Especifica el producto o servicio"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Proveedor</label>
              <input 
                name="proveedor" 
                value={formProducto.proveedor} 
                onChange={handleProductoChange} 
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200"
                placeholder="Nombre del proveedor"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Propiedad</label>
              <select 
                name="propiedad" 
                value={formProducto.propiedad} 
                onChange={handleProductoChange} 
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200"
              >
                <option value="Propia">Propia</option>
                <option value="Alquilada">Alquilada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cantidad</label>
              <input 
                type="number" 
                name="cantidad" 
                value={formProducto.cantidad} 
                min={1} 
                onChange={handleProductoChange} 
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200"
                required 
              />
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setFormProducto({ tipo: 'Producto', producto_servicio: '', proveedor: '', propiedad: 'Propia', cantidad: 1 })}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              Limpiar
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Agregar Producto
            </button>
          </div>
        </form>

        {/* Mostrar productos guardados */}
        {productoGuardado.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-yellow-700 mb-2">Productos/servicios guardados:</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-yellow-900 text-sm border border-yellow-200 rounded">
                <thead>
                  <tr className="bg-yellow-100">
                    <th className="px-3 py-2 border-b border-yellow-200 text-left">Tipo</th>
                    <th className="px-3 py-2 border-b border-yellow-200 text-left">Producto/Servicio</th>
                    <th className="px-3 py-2 border-b border-yellow-200 text-left">Proveedor</th>
                    <th className="px-3 py-2 border-b border-yellow-200 text-left">Propiedad</th>
                    <th className="px-3 py-2 border-b border-yellow-200 text-left">Cantidad</th>
                    <th className="px-3 py-2 border-b border-yellow-200 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productoGuardado.map((producto, index) => (
                    <tr key={producto.id || index}>
                      <td className="px-3 py-2 border-b border-yellow-100">{producto.tipo}</td>
                      <td className="px-3 py-2 border-b border-yellow-100">{producto.producto_servicio}</td>
                      <td className="px-3 py-2 border-b border-yellow-100">{producto.proveedor}</td>
                      <td className="px-3 py-2 border-b border-yellow-100">{producto.propiedad}</td>
                      <td className="px-3 py-2 border-b border-yellow-100">{producto.cantidad}</td>
                      <td className="px-3 py-2 border-b border-yellow-100">
                        <button 
                          onClick={async () => {
                            setFormProducto(producto);
                            // Para editar, llenamos el formulario pero no eliminamos del backend aún
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-2 font-medium"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm('¿Estás seguro de que quieres eliminar este producto/servicio?')) {
                              try {
                                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                                const config = { headers: { Authorization: `Bearer ${token}` } };
                                await axios.delete(`http://localhost:8000/campanas/${campañaSeleccionada.id}/productos/${producto.id}`, config);
                                setProductoGuardado(prev => prev.filter(p => p.id !== producto.id));
                                toast.success('Producto/servicio eliminado');
                              } catch (error) {
                                console.error('Error eliminando producto:', error);
                                toast.error('Error al eliminar el producto/servicio');
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {productoGuardado.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FaBoxOpen className="text-4xl mx-auto mb-4 text-gray-400" />
              <p>No hay productos registrados para esta campaña</p>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setModalProductos(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Facturación */}
      <Modal
        isOpen={modalFacturacion}
        onClose={() => setModalFacturacion(false)}
        title="Unidades de Facturación"
      >
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <FaFileInvoiceDollar className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Gestión de Facturación</h3>
              <p className="text-green-600">Administra las unidades de facturación de la campaña</p>
            </div>
          </div>
        </div>

        {/* Formulario para agregar facturación */}
        <form className="space-y-4 mb-6" onSubmit={handleGuardarFacturacion}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Unidad de facturación</label>
              <input 
                name="unidad" 
                value={formFacturacion.unidad} 
                onChange={handleFacturacionChange} 
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200" 
                placeholder="Ej: Horas, Productos, Servicios"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cantidad</label>
              <input 
                type="number" 
                name="cantidad" 
                value={formFacturacion.cantidad} 
                min={1} 
                onChange={handleFacturacionChange} 
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valor</label>
              <div className="flex items-center">
                <span className="mr-2 text-gray-500 font-semibold">$</span>
                <input 
                  type="number" 
                  name="valor" 
                  value={formFacturacion.valor} 
                  min={0} 
                  onChange={handleFacturacionChange} 
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200" 
                  placeholder="0.00"
                  required 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Periodicidad</label>
              <input 
                name="periodicidad" 
                value={formFacturacion.periodicidad} 
                onChange={handleFacturacionChange} 
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200" 
                placeholder="Ej: Mensual, Anual, Por evento"
                required 
              />
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setFormFacturacion({ unidad: '', cantidad: 1, valor: '', periodicidad: '' })}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              Limpiar
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Agregar Unidad
            </button>
          </div>
        </form>

        {/* Mostrar facturación guardada */}
        {facturacionGuardada.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-green-700 mb-2">Unidades de facturación guardadas:</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-green-900 text-sm border border-green-200 rounded">
                <thead>
                  <tr className="bg-green-100">
                    <th className="px-3 py-2 border-b border-green-200 text-left">Unidad</th>
                    <th className="px-3 py-2 border-b border-green-200 text-left">Cantidad</th>
                    <th className="px-3 py-2 border-b border-green-200 text-left">Valor</th>
                    <th className="px-3 py-2 border-b border-green-200 text-left">Periodicidad</th>
                    <th className="px-3 py-2 border-b border-green-200 text-left">Total</th>
                    <th className="px-3 py-2 border-b border-green-200 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {facturacionGuardada.map((factura, index) => (
                    <tr key={factura.id || index}>
                      <td className="px-3 py-2 border-b border-green-100">{factura.unidad}</td>
                      <td className="px-3 py-2 border-b border-green-100">{factura.cantidad}</td>
                      <td className="px-3 py-2 border-b border-green-100">${factura.valor}</td>
                      <td className="px-3 py-2 border-b border-green-100">{factura.periodicidad}</td>
                      <td className="px-3 py-2 border-b border-green-100">${(factura.cantidad * factura.valor).toLocaleString()}</td>
                      <td className="px-3 py-2 border-b border-green-100">
                        <button 
                          onClick={async () => {
                            setFormFacturacion(factura);
                            // Para editar, llenamos el formulario pero no eliminamos del backend aún
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-2 font-medium"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm('¿Estás seguro de que quieres eliminar esta unidad de facturación?')) {
                              try {
                                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                                const config = { headers: { Authorization: `Bearer ${token}` } };
                                await axios.delete(`http://localhost:8000/campanas/${campañaSeleccionada.id}/facturacion/${factura.id}`, config);
                                setFacturacionGuardada(prev => prev.filter(f => f.id !== factura.id));
                                toast.success('Unidad de facturación eliminada');
                              } catch (error) {
                                console.error('Error eliminando facturación:', error);
                                toast.error('Error al eliminar la unidad de facturación');
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {facturacionGuardada.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FaFileInvoiceDollar className="text-4xl mx-auto mb-4 text-gray-400" />
              <p>No hay unidades de facturación registradas para esta campaña</p>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setModalFacturacion(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Campañas;
