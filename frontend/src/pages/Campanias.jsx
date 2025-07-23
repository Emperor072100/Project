import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaHistory, FaUsers, FaBullhorn, FaChartBar } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import dayjs from 'dayjs';

const Campanias = () => {
  // Estados principales
  const [campanias, setCampanias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total_clientes: 0,
    total_campanias: 0,
    por_servicio: { SAC: 0, TMC: 0, TVT: 0, CBZ: 0 }
  });

  // Estados para modales
  const [modalCliente, setModalCliente] = useState(false);
  const [modalCampania, setModalCampania] = useState(false);
  const [modalAdministrar, setModalAdministrar] = useState(false);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [campaniaSeleccionada, setCampaniaSeleccionada] = useState(null);
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
    cliente: '',
    tipo_servicio: '',
    nombre: '',
    contactos: '',
    estado: '',
    logo: ''
  });
  
  // Estados para formularios
  const [formCliente, setFormCliente] = useState({
    nombre: '',
    telefono: '',
    correo: ''
  });

  const [formCampania, setFormCampania] = useState({
    nombre: '',
    tipo: 'SAC',
    cliente_id: '',
    lider: '',
    ejecutivo: '',
    fecha_inicio: ''
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
      
      const [campaniasRes, clientesRes, estadisticasRes] = await Promise.all([
        axios.get('http://localhost:8000/campanias', config),
        axios.get('http://localhost:8000/clientes', config),
        axios.get('http://localhost:8000/campanias/estadisticas', config)
      ]);
      
      setCampanias(campaniasRes.data);
      setClientes(clientesRes.data);
      setEstadisticas(estadisticasRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Función para crear cliente
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
        telefono: '',
        correo: ''
      });
      cargarDatos();
    } catch (error) {
      console.error('Error creando cliente:', error);
      toast.error('Error al crear el cliente');
    }
  };

  // Función para crear campania
  const handleCampaniaSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const datosEnvio = {
        ...formCampania,
        cliente_id: parseInt(formCampania.cliente_id),
        cje: formCampania.ejecutivo, // Mapear ejecutivo a cje para el backend
        fecha_inicio: formCampania.fecha_inicio || null,
        estado: 'Activa'
      };

      await axios.post('http://localhost:8000/campanias/', datosEnvio, config);
      
      toast.success('Campania creada exitosamente');
      setModalCampania(false);
      setFormCampania({
        nombre: '',
        tipo: 'SAC',
        cliente_id: '',
        lider: '',
        ejecutivo: '',
        fecha_inicio: ''
      });
      cargarDatos();
    } catch (error) {
      console.error('Error creando campania:', error);
      toast.error('Error al crear la campania');
    }
  };

  const handleAdministrar = (campania) => {
    setCampaniaSeleccionada(campania);
    setModalAdministrar(true);
    setMostrarProductos(false);
    setMostrarFacturacion(false);
    setEditando(false);
    setFormEditar({
      nombre: campania.nombre || '',
      descripcion: campania.descripcion || '',
      tipo: campania.tipo || '',
      cje: campania.cje || '',
      lider: campania.lider || '',
      cliente_id: campania.cliente_id || '',
      fecha_inicio: campania.fecha_inicio || '',
      fecha_fin: campania.fecha_fin || '',
      estado: campania.estado || '',
      presupuesto: campania.presupuesto || '',
      observaciones: campania.observaciones || ''
    });
    setProductoGuardado(null);
    setFacturacionGuardada(null);
  };

  const handleEditarChange = (e) => {
    const { name, value } = e.target;
    setFormEditar((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardarEdicion = async () => {
    if (!campaniaSeleccionada?.id) {
      toast.error('ID de campania inválido. No se puede guardar.');
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
      await axios.put(`http://localhost:8000/campanias/${campaniaSeleccionada.id}`, payload, config);
      setCampaniaSeleccionada((prev) => ({ ...prev, ...payload }));
      await axios.post(`http://localhost:8000/campanias/${campaniaSeleccionada.id}/historial`, {
        fecha: new Date().toISOString(),
        cambios: { ...payload },
      }, config);
      setEditando(false);
      toast.success('Datos de campania actualizados');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.error('No se encontró la campania. Puede que haya sido eliminada o el ID es incorrecto.');
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
    setTimeout(() => toast.success('Unidad de facturación guardada correctamente'), 100);
  };

  const handleProductoChange = (e) => {
    const { name, value } = e.target;
    setFormProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardarProducto = (e) => {
    e.preventDefault();
    setProductoGuardado(formProducto);
    setTimeout(() => toast.success('Producto/servicio guardado correctamente'), 100);
  };

  const handleHistorial = async (campania) => {
    setCampaniaSeleccionada(campania);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:8000/campanias/${campania.id}/historial`, config);
      setHistorial(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setHistorial([]);
      toast.error('No se pudo cargar el historial');
    }
    setModalHistorial(true);
  };

  return (
    <div className="container mx-auto p-6">
      {/* ...existing code... */}
    </div>
  );
};

export default Campanias;
