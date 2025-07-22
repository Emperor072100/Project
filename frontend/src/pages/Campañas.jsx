import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaHistory, FaUsers, FaBullhorn, FaChartBar } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

const Campañas = () => {
  // Estados principales
  const [campañas, setCampañas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total_clientes: 0,
    total_campañas: 0,
    por_servicio: { SAC: 0, TMC: 0, TVT: 0, CBZ: 0 }
  });
  
  // Estados para modales
  const [modalCliente, setModalCliente] = useState(false);
  const [modalCampaña, setModalCampaña] = useState(false);
  
  // Estados para formularios
  const [formCliente, setFormCliente] = useState({
    nombre: '',
    empresa: '',
    correo: '',
    telefono: '',
    direccion: '',
    contacto_principal: '',
    observaciones: ''
  });
  
  const [formCampaña, setFormCampaña] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'SAC',
    cje: '',
    lider: '',
    cliente_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'Activa',
    presupuesto: '',
    observaciones: ''
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
      
      const [campañasRes, clientesRes, estadisticasRes] = await Promise.all([
        axios.get('http://localhost:8000/campañas', config),
        axios.get('http://localhost:8000/clientes', config),
        axios.get('http://localhost:8000/campañas/estadisticas', config)
      ]);
      
      setCampañas(campañasRes.data);
      setClientes(clientesRes.data);
      setEstadisticas(estadisticasRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleClienteSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.post('http://localhost:8000/clientes/', formCliente, config);
      
      toast.success('Cliente creado exitosamente');
      setModalCliente(false);
      setFormCliente({
        nombre: '',
        empresa: '',
        correo: '',
        telefono: '',
        direccion: '',
        contacto_principal: '',
        observaciones: ''
      });
      cargarDatos();
    } catch (error) {
      console.error('Error creando cliente:', error);
      toast.error('Error al crear el cliente');
    }
  };

  const handleCampañaSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Preparar datos para envío
      const datosEnvio = {
        ...formCampaña,
        cliente_id: parseInt(formCampaña.cliente_id),
        fecha_inicio: formCampaña.fecha_inicio || null,
        fecha_fin: formCampaña.fecha_fin || null
      };
      
      await axios.post('http://localhost:8000/campañas/', datosEnvio, config);
      
      toast.success('Campaña creada exitosamente');
      setModalCampaña(false);
      setFormCampaña({
        nombre: '',
        descripcion: '',
        tipo: 'SAC',
        cje: '',
        lider: '',
        cliente_id: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'Activa',
        presupuesto: '',
        observaciones: ''
      });
      cargarDatos();
    } catch (error) {
      console.error('Error creando campaña:', error);
      toast.error('Error al crear la campaña');
    }
  };

  const handleAdministrar = (campaña) => {
    toast.info(`Administrando campaña: ${campaña.nombre}`);
    // Aquí puedes implementar la lógica de administración
  };

  const handleHistorial = (campaña) => {
    toast.info(`Ver historial de: ${campaña.nombre}`);
    // Aquí puedes implementar la lógica del historial
  };

  return (
    <div className="container mx-auto p-6">
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
                  <p className="text-gray-600 text-lg font-medium">Clientes</p>
                  <p className="text-gray-500 text-base">Registrados en sistema</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-blue-600">{estadisticas.total_clientes}</p>
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
                    <p className="text-blue-800 text-base mt-1">Servicio de Atención</p>
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
                    <p className="text-green-800 text-base mt-1">Telemarketing Central</p>
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
                    <p className="text-purple-800 text-base mt-1">Televentas Total</p>
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
                    <p className="text-orange-800 text-base mt-1">Call Back Zone</p>
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
          onClick={() => setModalCliente(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaPlus /> Agregar Cliente
        </button>
        <button
          onClick={() => setModalCampaña(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaPlus /> Agregar Campaña
        </button>
      </div>

      {/* Tabla de campañas */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Cargando...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaña</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CJE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Líder</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campañas.map((campaña) => (
                <tr key={campaña.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaña.cliente_nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaña.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      campaña.tipo === 'SAC' ? 'bg-blue-100 text-blue-800' :
                      campaña.tipo === 'TMC' ? 'bg-green-100 text-green-800' :
                      campaña.tipo === 'TVT' ? 'bg-purple-100 text-purple-800' :
                      campaña.tipo === 'CBZ' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaña.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaña.cje || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaña.lider || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAdministrar(campaña)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <FaEdit /> Administrar
                      </button>
                      <button
                        onClick={() => handleHistorial(campaña)}
                        className="text-green-600 hover:text-green-900 flex items-center gap-1"
                      >
                        <FaHistory /> Historial
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Agregar Cliente */}
      <Modal
        isOpen={modalCliente}
        onClose={() => setModalCliente(false)}
        title="Agregar Nuevo Cliente"
      >
        <form onSubmit={handleClienteSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formCliente.nombre}
                onChange={(e) => setFormCliente({...formCliente, nombre: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa
              </label>
              <input
                type="text"
                value={formCliente.empresa}
                onChange={(e) => setFormCliente({...formCliente, empresa: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo
              </label>
              <input
                type="email"
                value={formCliente.correo}
                onChange={(e) => setFormCliente({...formCliente, correo: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={formCliente.telefono}
                onChange={(e) => setFormCliente({...formCliente, telefono: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contacto Principal
              </label>
              <input
                type="text"
                value={formCliente.contacto_principal}
                onChange={(e) => setFormCliente({...formCliente, contacto_principal: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={formCliente.direccion}
                onChange={(e) => setFormCliente({...formCliente, direccion: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              rows="3"
              value={formCliente.observaciones}
              onChange={(e) => setFormCliente({...formCliente, observaciones: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setModalCliente(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
            >
              Crear Cliente
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
        <form onSubmit={handleCampañaSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Campaña *
              </label>
              <input
                type="text"
                required
                value={formCampaña.nombre}
                onChange={(e) => setFormCampaña({...formCampaña, nombre: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente *
              </label>
              <select
                required
                value={formCampaña.cliente_id}
                onChange={(e) => setFormCampaña({...formCampaña, cliente_id: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                value={formCampaña.tipo}
                onChange={(e) => setFormCampaña({...formCampaña, tipo: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="SAC">SAC</option>
                <option value="TMC">TMC</option>
                <option value="TVT">TVT</option>
                <option value="CBZ">CBZ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CJE
              </label>
              <input
                type="text"
                value={formCampaña.cje}
                onChange={(e) => setFormCampaña({...formCampaña, cje: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Líder
              </label>
              <input
                type="text"
                value={formCampaña.lider}
                onChange={(e) => setFormCampaña({...formCampaña, lider: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="datetime-local"
                value={formCampaña.fecha_inicio}
                onChange={(e) => setFormCampaña({...formCampaña, fecha_inicio: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin
              </label>
              <input
                type="datetime-local"
                value={formCampaña.fecha_fin}
                onChange={(e) => setFormCampaña({...formCampaña, fecha_fin: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presupuesto
              </label>
              <input
                type="text"
                value={formCampaña.presupuesto}
                onChange={(e) => setFormCampaña({...formCampaña, presupuesto: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ej: $50,000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              rows="3"
              value={formCampaña.descripcion}
              onChange={(e) => setFormCampaña({...formCampaña, descripcion: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              rows="2"
              value={formCampaña.observaciones}
              onChange={(e) => setFormCampaña({...formCampaña, observaciones: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setModalCampaña(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
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
