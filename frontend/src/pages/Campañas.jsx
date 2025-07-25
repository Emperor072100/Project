import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaHistory, FaUsers, FaBullhorn, FaChartBar } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import dayjs from 'dayjs';

const Campañas = () => {
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
  const [mostrarProductos, setMostrarProductos] = useState(false);
  const [formProducto, setFormProducto] = useState({
    tipo: 'Producto',
    proveedor: '',
    propiedad: 'Propia',
    cantidad: 1
  });
  const [mostrarFacturacion, setMostrarFacturacion] = useState(false);
  const [formFacturacion, setFormFacturacion] = useState({
    unidad: '',
    cantidad: 1,
    valor: ''
  });
  const [facturacionGuardada, setFacturacionGuardada] = useState(null);

  const [productoGuardado, setProductoGuardado] = useState(null);

  // Estado para edición de campania
  const [editando, setEditando] = useState(false);
  const [formEditar, setFormEditar] = useState({
    nombre: '',
    descripcion: '',
    tipo: '',
    cje: '',
    lider: '',
    cliente_id: '',
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
    fecha_de_produccion: ''
  });

  const [loading, setLoading] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [campañasRes, clientesCorporativosRes, contactosRes, estadisticasRes] = await Promise.all([
        axios.get('http://localhost:8000/campañas', config),
        axios.get('http://localhost:8000/clientes-corporativos', config),
        axios.get('http://localhost:8000/contactos', config),
        axios.get('http://localhost:8000/campañas/estadisticas', config)
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
          lider: campaña.lider_de_campaña
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
      
      toast.success('Cliente corporativo creado exitosamente');
      setModalClienteCorporativo(false);
      setFormClienteCorporativo({
        nombre: '',
        logo: '',
        sector: ''
      });
      cargarDatos();
    } catch (error) {
      console.error('Error creando cliente corporativo:', error);
      toast.error('Error al crear el cliente corporativo');
    }
  };

  // Función para crear contacto
  const handleContactoSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.post('http://localhost:8000/contactos/', formContacto, config);
      
      toast.success('Contacto creado exitosamente');
      setModalContacto(false);
      setFormContacto({
        nombre: '',
        telefono: '',
        correo: '',
        cliente_corporativo_id: ''
      });
      cargarDatos();
    } catch (error) {
      console.error('Error creando contacto:', error);
      toast.error('Error al crear el contacto');
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
        fecha_de_produccion: formCampaña.fecha_de_produccion || null
      };

      await axios.post('http://localhost:8000/campañas/', datosEnvio, config);
      toast.success('Campaña creada exitosamente');
      setModalCampaña(false);
      setFormCampaña({
        nombre: '',
        tipo: 'SAC',
        cliente_corporativo_id: '',
        contacto_id: '',
        lider_de_campaña: '',
        ejecutivo: '',
        fecha_de_produccion: ''
      });
      cargarDatos();
    } catch (error) {
      console.error('Error creando campaña:', error);
      toast.error('Error al crear la campaña');
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
      cliente_id: campaña.cliente_corporativo_id || '', // Usar el campo correcto
      fecha_inicio: campaña.fecha_de_produccion ? campaña.fecha_de_produccion : '',
      fecha_fin: campaña.fecha_fin ? campaña.fecha_fin.slice(0, 16) : '',
      estado: campaña.estado || '',
      presupuesto: campaña.presupuesto || '',
      observaciones: campaña.observaciones || ''
    });
    setProductoGuardado(null);
    setFacturacionGuardada(null);
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
        descripcion: formEditar.descripcion,
        tipo: formEditar.tipo,
        cje: formEditar.cje,
        lider: formEditar.lider,
        cliente_id: parseInt(formEditar.cliente_id),
        fecha_inicio: formEditar.fecha_inicio || null,
        fecha_fin: formEditar.fecha_fin || null,
        estado: formEditar.estado,
        presupuesto: formEditar.presupuesto,
        observaciones: formEditar.observaciones
      };
      await axios.put(encodeURI(`http://localhost:8000/campañas/${campañaSeleccionada.id}`), payload, config);
      setCampañaSeleccionada((prev) => ({ ...prev, ...payload }));
      await axios.post(`http://localhost:8000/campañas/${campañaSeleccionada.id}/historial`, {
        fecha: new Date().toISOString(),
        cambios: { ...payload },
      }, config);
      setEditando(false);
      toast.success('Datos de campaña actualizados');
      cargarDatos(); // Refresca la lista tras editar
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.error('No se encontró la campaña. Puede que haya sido eliminada o el ID es incorrecto.');
      } else {
        toast.error('Error al guardar los cambios');
      }
    }
  };

  const handleFacturacionChange = (e) => {
    const { name, value } = e.target;
    setFormFacturacion((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardarFacturacion = (e) => {
    e.preventDefault();
    setFacturacionGuardada(formFacturacion);
    setTimeout(() => toast.success('Unidad de facturación guardada correctamente'), 100); // toast después de render
    // No cierres el formulario automáticamente
  };

  const handleProductoChange = (e) => {
    const { name, value } = e.target;
    setFormProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardarProducto = (e) => {
    e.preventDefault();
    setProductoGuardado(formProducto);
    setTimeout(() => toast.success('Producto/servicio guardado correctamente'), 100); // toast después de render
    // No cierres el formulario automáticamente
  };

  const handleHistorial = async (campaña) => {
    setCampañaSeleccionada(campaña);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:8000/campañas/${campaña.id}/historial`, config);
      setHistorial(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setHistorial([]);
      toast.error('No se pudo cargar el historial', error);
    }
    setModalHistorial(true);
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
        <div className="p-4">
          <h3 className="font-semibold mb-2">{campañaSeleccionada?.nombre || 'Campaña'}</h3>
          {historial.length === 0 ? (
            <div className="text-gray-500 italic">No hay historial de cambios para esta campaña.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200 rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 border-b border-gray-200 text-left">Fecha</th>
                    <th className="px-3 py-2 border-b border-gray-200 text-left">Cambios</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 border-b border-gray-100">{dayjs(h.fecha).format('DD/MM/YYYY HH:mm')}</td>
                      <td className="px-3 py-2 border-b border-gray-100">
                        <ul className="list-disc ml-4">
                          {Object.entries(h.cambios).map(([k, v]) => (
                            <li key={k}><b>{k}:</b> {v}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  {/* Info principal */}
                  <div className="flex-1 space-y-3 w-full">
                    <div>
                      <span className="font-semibold">Cliente Corporativo:</span> {campañaSeleccionada.cliente_nombre || <span className='italic text-gray-400'>Sin asignar</span>}
                    </div>
                    <div>
                      <span className="font-semibold">Tipo de Servicio:</span> {campañaSeleccionada.tipo || <span className='italic text-gray-400'>Sin asignar</span>}
                    </div>
                    <div>
                      <span className="font-semibold">Nombre de la Campaña:</span> {campañaSeleccionada.nombre || <span className='italic text-gray-400'>Sin nombre</span>}
                    </div>
                    <div>
                      <span className="font-semibold">Contacto Asociado:</span> {campañaSeleccionada.contacto_nombre || <span className='italic text-gray-400'>Sin contacto</span>}
                    </div>
                    <div>
                      <span className="font-semibold">Número de Contacto:</span> {campañaSeleccionada.contacto_telefono || <span className='italic text-gray-400'>Sin número</span>}
                    </div>
                    {/* Botones de acción para Productos y Facturación */}
                    <div className="flex flex-col md:flex-row gap-3 mt-6">
                      <button
                        type="button"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg border border-blue-200"
                        onClick={() => setMostrarProductos((prev) => !prev)}
                      >
                        <span className="inline-flex items-center gap-2">
                          <FaUsers className="text-white text-base" /> Productos y/o Servicio
                        </span>
                      </button>
                      <button
                        type="button"
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg border border-green-200"
                        onClick={() => setMostrarFacturacion((prev) => !prev)}
                      >
                        <span className="inline-flex items-center gap-2">
                          <FaBullhorn className="text-white text-base" /> Unidades de Facturación
                        </span>
                      </button>
                    </div>
                  </div>
                  {/* Logo */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-32 h-32 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                    {campañaSeleccionada.logo ? (
                      <img src={campañaSeleccionada.logo} alt="Logo cliente" className="object-contain w-full h-full" />
                    ) : (
                      <span className="text-gray-400 italic">Sin logo</span>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); handleGuardarEdicion(); }}>
                  {/* ...formulario de edición aquí si editando... */}
                </form>
              )}
              {/* Formulario de Facturación expandible */}
              {mostrarFacturacion && (
                <div className="transition-all duration-300 overflow-hidden" style={{maxHeight: 600, opacity: 1, marginBottom: 24}}>
                  <form className="space-y-6" onSubmit={handleGuardarFacturacion}>
                    <h3 className="text-lg font-semibold mb-4">Unidades de facturación</h3>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm font-medium mb-1">Unidad de facturación</label>
                        <input name="unidad" value={formFacturacion.unidad} onChange={handleFacturacionChange} className="w-full border rounded px-3 py-2" required />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-sm font-medium mb-1">Cantidad</label>
                        <input type="number" name="cantidad" value={formFacturacion.cantidad} min={1} onChange={handleFacturacionChange} className="w-full border rounded px-3 py-2" required />
                      </div>
                      <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm font-medium mb-1">Valor</label>
                        <div className="flex items-center">
                          <span className="mr-2 text-gray-500 font-semibold">$</span>
                          <input type="number" name="valor" value={formFacturacion.valor} min={0} onChange={handleFacturacionChange} className="w-full border rounded px-3 py-2" required />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button type="button" className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition" onClick={() => { setMostrarFacturacion(false); setFacturacionGuardada(null); }}>Cancelar</button>
                      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">Guardar</button>
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
                    <h3 className="text-lg font-semibold mb-4">Productos y/o servicios</h3>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm font-medium mb-1">Tipo</label>
                        <select name="tipo" value={formProducto.tipo} onChange={handleProductoChange} className="w-full border rounded px-3 py-2">
                          <option value="Producto">Producto</option>
                          <option value="Servicio">Servicio</option>
                        </select>
                      </div>
                      <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm font-medium mb-1">Proveedor</label>
                        <input name="proveedor" value={formProducto.proveedor} onChange={handleProductoChange} className="w-full border rounded px-3 py-2" required />
                      </div>
                      <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm font-medium mb-1">Propiedad</label>
                        <select name="propiedad" value={formProducto.propiedad} onChange={handleProductoChange} className="w-full border rounded px-3 py-2">
                          <option value="Propia">Propia</option>
                          <option value="Alquilada">Alquilada</option>
                        </select>
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-sm font-medium mb-1">Cantidad</label>
                        <input type="number" name="cantidad" value={formProducto.cantidad} min={1} onChange={handleProductoChange} className="w-full border rounded px-3 py-2" required />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button type="button" className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition" onClick={() => { setMostrarProductos(false); setProductoGuardado(null); }}>Cancelar</button>
                      <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">Guardar</button>
                    </div>
                  </form>
                  {productoGuardado && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-yellow-700 mb-2">Último producto/servicio guardado:</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-yellow-900 text-sm border border-yellow-200 rounded">
                          <thead>
                            <tr className="bg-yellow-100">
                              <th className="px-3 py-2 border-b border-yellow-200 text-left">Tipo</th>
                              <th className="px-3 py-2 border-b border-yellow-200 text-left">Proveedor</th>
                              <th className="px-3 py-2 border-b border-yellow-200 text-left">Propiedad</th>
                              <th className="px-3 py-2 border-b border-yellow-200 text-left">Cantidad</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-3 py-2 border-b border-yellow-100">{productoGuardado.tipo}</td>
                              <td className="px-3 py-2 border-b border-yellow-100">{productoGuardado.proveedor}</td>
                              <td className="px-3 py-2 border-b border-yellow-100">{productoGuardado.propiedad}</td>
                              <td className="px-3 py-2 border-b border-yellow-100">{productoGuardado.cantidad}</td>
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

        <form onSubmit={handleCampañaSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de la Campaña *
              </label>
              <input
                type="text"
                required
                value={formCampaña.nombre}
                onChange={(e) => setFormCampaña({...formCampaña, nombre: e.target.value})}
                className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
                placeholder="Ingrese el nombre de la campaña"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Servicio *
              </label>
              <select
                value={formCampaña.tipo}
                onChange={(e) => setFormCampaña({...formCampaña, tipo: e.target.value})}
                className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
              >
                <option value="SAC">SAC - Atención al Cliente</option>
                <option value="TMC">TMC - Telemarketing</option>
                <option value="TVT">TVT - Televentas</option>
                <option value="CBZ">CBZ - Cobranza</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cliente Corporativo *
              </label>
              <select
                required
                value={formCampaña.cliente_corporativo_id}
                onChange={(e) => setFormCampaña({...formCampaña, cliente_corporativo_id: e.target.value})}
                className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
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
                Contacto *
              </label>
              <select
                required
                value={formCampaña.contacto_id}
                onChange={(e) => setFormCampaña({...formCampaña, contacto_id: e.target.value})}
                className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Líder de Campaña *
              </label>
              <input
                type="text"
                required
                value={formCampaña.lider_de_campaña}
                onChange={(e) => setFormCampaña({...formCampaña, lider_de_campaña: e.target.value})}
                className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
                placeholder="Nombre del líder"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ejecutivo *
              </label>
              <input
                type="text"
                required
                value={formCampaña.ejecutivo}
                onChange={(e) => setFormCampaña({...formCampaña, ejecutivo: e.target.value})}
                className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
                placeholder="Nombre del ejecutivo"
              />
            </div>

            <div className="relative md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de Producción *
              </label>
              <input
                type="date"
                required
                value={formCampaña.fecha_de_produccion}
                onChange={(e) => setFormCampaña({...formCampaña, fecha_de_produccion: e.target.value})}
                className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setModalCampaña(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Crear Campaña
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Campañas;
