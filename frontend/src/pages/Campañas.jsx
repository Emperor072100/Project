import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaHistory, FaUsers, FaBullhorn, FaChartBar } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const Campañas = () => {
  // Estados principales
  const [campañas, setCampañas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total_clientes: 0,
    total_campañas: 0,
    por_servicio: { SAC: 0, TMC: 0, TVT: 0, CBZ: 0 }
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

  const handleAdministrar = (campaña) => {
    toast.info(`Administrando campaña: ${campaña.nombre}`);
    // Aquí puedes implementar la lógica de administración
  };

  const handleHistorial = (campaña) => {
    toast.info(`Ver historial de: ${campaña.nombre}`);
    // Aquí puedes implementar la lógica del historial
  };

  // Función para mostrar formulario de cliente con SweetAlert2
  const mostrarFormularioCliente = async () => {
    const { value: formValues } = await Swal.fire({
      title: '👥 Agregar Nuevo Cliente',
      html: `
        <div class="space-y-4">
          <div class="text-left">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
            <input id="swal-input1" class="swal2-input w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Ingrese el nombre del cliente">
          </div>
          <div class="text-left">
            <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
            <input id="swal-input2" class="swal2-input w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Ej: +1 234 567 8900">
          </div>
          <div class="text-left">
            <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
            <input id="swal-input3" type="email" class="swal2-input w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="cliente@empresa.com">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '✅ Crear Cliente',
      cancelButtonText: '❌ Cancelar',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'rounded-2xl',
        title: 'text-lg font-semibold text-gray-800',
        confirmButton: 'font-medium px-6 py-3 rounded-lg',
        cancelButton: 'font-medium px-6 py-3 rounded-lg',
      },
      preConfirm: () => {
        const nombre = document.getElementById('swal-input1').value;
        const telefono = document.getElementById('swal-input2').value;
        const correo = document.getElementById('swal-input3').value;
        
        if (!nombre || !telefono || !correo) {
          Swal.showValidationMessage('Por favor complete todos los campos');
          return false;
        }
        
        if (!correo.includes('@')) {
          Swal.showValidationMessage('Por favor ingrese un correo válido');
          return false;
        }
        
        return { nombre, telefono, correo };
      }
    });

    if (formValues) {
      await crearCliente(formValues);
    }
  };

  // Función para mostrar formulario de campaña con SweetAlert2
  const mostrarFormularioCampaña = async () => {
    const clientesOptions = clientes.map(cliente => 
      `<option value="${cliente.id}">${cliente.nombre}</option>`
    ).join('');

    const { value: formValues } = await Swal.fire({
      title: '📢 Agregar Nueva Campaña',
      html: `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="text-left">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Campaña *</label>
            <input id="swal-nombre" class="swal2-input w-full p-2.5 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200" placeholder="Ingrese el nombre de la campaña">
          </div>
          <div class="text-left">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Servicio *</label>
            <select id="swal-tipo" class="swal2-select w-full p-2.5 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200">
              <option value="SAC">SAC - Servicio de Atención</option>
              <option value="TMC">TMC - Telemarketing Central</option>
              <option value="TVT">TVT - Televentas Total</option>
              <option value="CBZ">CBZ - Cobranza</option>
            </select>
          </div>
          <div class="text-left">
            <label class="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <select id="swal-cliente" class="swal2-select w-full p-2.5 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200">
              <option value="">Seleccionar cliente</option>
              ${clientesOptions}
            </select>
          </div>
          <div class="text-left">
            <label class="block text-sm font-medium text-gray-700 mb-1">Líder de Campaña *</label>
            <input id="swal-lider" class="swal2-input w-full p-2.5 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200" placeholder="Nombre del líder">
          </div>
          <div class="text-left">
            <label class="block text-sm font-medium text-gray-700 mb-1">Ejecutivo *</label>
            <input id="swal-ejecutivo" class="swal2-input w-full p-2.5 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200" placeholder="Nombre del ejecutivo">
          </div>
          <div class="text-left">
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio *</label>
            <input id="swal-fecha" type="datetime-local" class="swal2-input w-full p-2.5 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200">
          </div>
        </div>
      `,
      width: '800px',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '✅ Crear Campaña',
      cancelButtonText: '❌ Cancelar',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'rounded-2xl',
        title: 'text-lg font-semibold text-gray-800',
        confirmButton: 'font-medium px-6 py-3 rounded-lg',
        cancelButton: 'font-medium px-6 py-3 rounded-lg',
      },
      preConfirm: () => {
        const nombre = document.getElementById('swal-nombre').value;
        const tipo = document.getElementById('swal-tipo').value;
        const cliente_id = document.getElementById('swal-cliente').value;
        const lider = document.getElementById('swal-lider').value;
        const ejecutivo = document.getElementById('swal-ejecutivo').value;
        const fecha_inicio = document.getElementById('swal-fecha').value;
        
        if (!nombre || !cliente_id || !lider || !ejecutivo || !fecha_inicio) {
          Swal.showValidationMessage('Por favor complete todos los campos');
          return false;
        }
        
        return { nombre, tipo, cliente_id, lider, ejecutivo, fecha_inicio };
      }
    });

    if (formValues) {
      await crearCampaña(formValues);
    }
  };

  // Función para crear cliente
  const crearCliente = async (datosCliente) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.post('http://localhost:8000/clientes/', datosCliente, config);
      
      await Swal.fire({
        title: '¡Éxito! 🎉',
        text: 'Cliente creado exitosamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'font-medium px-6 py-3 rounded-lg',
        }
      });
      
      cargarDatos();
    } catch (error) {
      console.error('Error creando cliente:', error);
      await Swal.fire({
        title: '¡Error! ❌',
        text: 'Hubo un problema al crear el cliente',
        icon: 'error',
        confirmButtonText: 'Intentar de nuevo',
        confirmButtonColor: '#dc2626',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'font-medium px-6 py-3 rounded-lg',
        }
      });
    }
  };

  // Función para crear campaña
  const crearCampaña = async (datosCampaña) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const datosEnvio = {
        ...datosCampaña,
        cliente_id: parseInt(datosCampaña.cliente_id),
        cje: datosCampaña.ejecutivo,
        fecha_inicio: datosCampaña.fecha_inicio || null,
        estado: 'Activa'
      };
      
      await axios.post('http://localhost:8000/campañas/', datosEnvio, config);
      
      await Swal.fire({
        title: '¡Éxito! 🎉',
        text: 'Campaña creada exitosamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#16a34a',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'font-medium px-6 py-3 rounded-lg',
        }
      });
      
      cargarDatos();
    } catch (error) {
      console.error('Error creando campaña:', error);
      await Swal.fire({
        title: '¡Error! ❌',
        text: 'Hubo un problema al crear la campaña',
        icon: 'error',
        confirmButtonText: 'Intentar de nuevo',
        confirmButtonColor: '#dc2626',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'font-medium px-6 py-3 rounded-lg',
        }
      });
    }
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
          onClick={mostrarFormularioCliente}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FaPlus /> Agregar Cliente
        </button>
        <button
          onClick={mostrarFormularioCampaña}
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
    </div>
  );
};

export default Campañas;
