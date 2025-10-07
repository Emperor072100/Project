import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
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
  FaChevronDown,
  FaChartPie,
  FaHashtag
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
  const [implementacionesProgreso, setImplementacionesProgreso] = useState({});
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
  
  // Estados para modo edición
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingImplementacion, setEditingImplementacion] = useState(null);
  const [expandedDetailSection, setExpandedDetailSection] = useState(null);
  
  // Estados para edición inline de subsesiones
  const [editingSubsession, setEditingSubsession] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [savingSubsession, setSavingSubsession] = useState(false);
  const [recentlyUpdated, setRecentlyUpdated] = useState(null);
  
  // Estados para eliminación con doble seguridad
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [implementacionToDelete, setImplementacionToDelete] = useState(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);

  // Efecto para cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editingEstado && !event.target.closest('.estado-dropdown')) {
        setEditingEstado(null);
      }
      // También cerrar la edición de subsesiones al hacer clic fuera
      if (editingSubsession && !event.target.closest('.estado-editable')) {
        cancelarEdicionSubsesion();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingEstado, editingSubsession]);

  // Cargar implementaciones
  const cargarImplementaciones = async () => {
    setLoading(true);
    try {
      // Cambiar la URL para usar solo los datos básicos
      const response = await axios.get('http://localhost:8000/implementaciones/basic');
      setImplementaciones(response.data);
      console.log('Implementaciones cargadas:', response.data);
      
      // Debug específico para tarjetas KPI
      const implementacionesTMk = response.data.filter(imp => imp.proceso === 'TMk');
      const implementacionesFinalizadas = response.data.filter(imp => imp.estado === 'Finalizado');
      
      console.log(`🟢 Debug TMk: Encontradas ${implementacionesTMk.length} implementaciones con proceso 'TMk':`, implementacionesTMk);
      console.log(`🟣 Debug Finalizadas: Encontradas ${implementacionesFinalizadas.length} implementaciones con estado 'Finalizado':`, implementacionesFinalizadas);
      
      // Mostrar todos los procesos únicos para verificar
      const procesosUnicos = [...new Set(response.data.map(imp => imp.proceso))];
      const estadosUnicos = [...new Set(response.data.map(imp => imp.estado))];
      
      console.log(`📊 Procesos únicos encontrados:`, procesosUnicos);
      console.log(`📊 Estados únicos encontrados:`, estadosUnicos);
      
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

  // Hook para analizar implementaciones con 0% automáticamente (deshabilitado temporalmente)
  /*
  useEffect(() => {
    const analizarImplementacionesCero = async () => {
      // Esperar un poco para que se carguen los progresos
      setTimeout(async () => {
        console.log(`🔍 === ANÁLISIS AUTOMÁTICO DE IMPLEMENTACIONES EN 0% ===`);
        
        const implementacionesEnCero = Object.entries(implementacionesProgreso)
          .filter(([, progreso]) => progreso === 0)
          .map(([id]) => id);
        
        if (implementacionesEnCero.length > 0) {
          console.log(`📊 Encontradas ${implementacionesEnCero.length} implementaciones en 0%:`, implementacionesEnCero);
          
          // Analizar cada una
          for (const implementacionId of implementacionesEnCero.slice(0, 3)) { // Solo las primeras 3 para no saturar
            try {
              const token = localStorage.getItem('token') || sessionStorage.getItem('token');
              const config = { headers: { Authorization: `Bearer ${token}` } };
              
              console.log(`\n🔍 Analizando implementación ${implementacionId}...`);
              const response = await axios.get(`http://localhost:8000/implementaciones/${implementacionId}`, config);
              
              analizarImplementacionDetallado(response.data, implementacionId);
              
              // Pequeña pausa entre análisis
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
              console.error(`❌ Error analizando implementación ${implementacionId}:`, error);
            }
          }
        } else {
          console.log(`✅ No se encontraron implementaciones en 0%`);
        }
      }, 3000); // Esperar 3 segundos para que se carguen los progresos
    };

    // Solo ejecutar si hay implementaciones y algunos progresos calculados
    if (implementaciones.length > 0 && Object.keys(implementacionesProgreso).length > 0) {
      analizarImplementacionesCero();
    }
  }, [implementaciones, implementacionesProgreso, analizarImplementacionDetallado]);
  */

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

  // Función para obtener el peso de un estado
  const obtenerPesoEstado = useCallback((estado) => {
    const pesos = {
      'ok': 100,
      'cancelado': 100,
      'en proceso': 50,
      'No definido': 0
    };
    return pesos[estado] || 0;
  }, []);

  // Función para analizar una implementación en detalle (para debugging)
  const analizarImplementacionDetallado = useCallback((datosCompletos, implementacionId) => {
    console.log(`🔍 === ANÁLISIS DETALLADO IMPLEMENTACIÓN ${implementacionId} ===`);
    
    const analisis = {
      implementacionId,
      seccionesEncontradas: [],
      totalSubsesiones: 0,
      subsesionesConEstado: 0,
      distribicionEstados: {},
      pesoTotal: 0,
      detallesPorSeccion: {}
    };

    const secciones = [
      {
        nombre: 'Contractual',
        data: datosCompletos.contractual,
        subsesiones: [
          { key: 'modeloContrato', nombre: 'Modelo Contrato' },
          { key: 'modeloConfidencialidad', nombre: 'Modelo Confidencialidad' },
          { key: 'alcance', nombre: 'Alcance' },
          { key: 'fechaInicio', nombre: 'Fecha Inicio' }
        ]
      },
      {
        nombre: 'Talento Humano',
        data: datosCompletos.talento_humano,
        subsesiones: [
          { key: 'perfilPersonal', nombre: 'Perfil Personal' },
          { key: 'cantidadAsesores', nombre: 'Cantidad Asesores' },
          { key: 'horarios', nombre: 'Horarios' },
          { key: 'formador', nombre: 'Formador' },
          { key: 'capacitacionesAndes', nombre: 'Capacitaciones Andes' },
          { key: 'capacitacionesCliente', nombre: 'Capacitaciones Cliente' }
        ]
      },
      {
        nombre: 'Procesos',
        data: datosCompletos.procesos,
        subsesiones: [
          { key: 'responsableCliente', nombre: 'Responsable Cliente' },
          { key: 'responsableAndes', nombre: 'Responsable Andes' },
          { key: 'responsablesOperacion', nombre: 'Responsables Operación' },
          { key: 'listadoReportes', nombre: 'Listado Reportes' },
          { key: 'protocoloComunicaciones', nombre: 'Protocolo Comunicaciones' },
          { key: 'guionesProtocolos', nombre: 'Guiones Protocolos' },
          { key: 'procesoMonitoreo', nombre: 'Proceso Monitoreo' },
          { key: 'cronogramaTecnologia', nombre: 'Cronograma Tecnología' },
          { key: 'cronogramaCapacitaciones', nombre: 'Cronograma Capacitaciones' },
          { key: 'realizacionPruebas', nombre: 'Realización Pruebas' }
        ]
      },
      {
        nombre: 'Tecnología',
        data: datosCompletos.tecnologia,
        subsesiones: [
          { key: 'creacionModulo', nombre: 'Creación Módulo' },
          { key: 'tipificacionInteracciones', nombre: 'Tipificación Interacciones' },
          { key: 'aplicativosProceso', nombre: 'Aplicativos Proceso' },
          { key: 'whatsapp', nombre: 'WhatsApp' },
          { key: 'correosElectronicos', nombre: 'Correos Electrónicos' },
          { key: 'requisitosGrabacion', nombre: 'Requisitos Grabación' }
        ]
      }
    ];

    secciones.forEach(seccion => {
      console.log(`\n📂 Sección: ${seccion.nombre}`);
      console.log(`   Datos disponibles:`, !!seccion.data);
      
      if (seccion.data) {
        analisis.seccionesEncontradas.push(seccion.nombre);
        analisis.detallesPorSeccion[seccion.nombre] = {
          subsesiones: [],
          pesoSeccion: 0
        };

        seccion.subsesiones.forEach(subsesion => {
          const estado = seccion.data[subsesion.key]?.estado;
          const peso = obtenerPesoEstado(estado);
          
          console.log(`     ├─ ${subsesion.nombre}: ${estado || 'SIN ESTADO'} (peso: ${peso})`);
          
          analisis.totalSubsesiones++;
          if (estado) {
            analisis.subsesionesConEstado++;
            analisis.distribicionEstados[estado] = (analisis.distribicionEstados[estado] || 0) + 1;
          }
          analisis.pesoTotal += peso;
          
          analisis.detallesPorSeccion[seccion.nombre].subsesiones.push({
            nombre: subsesion.nombre,
            estado: estado || 'sin estado',
            peso
          });
          analisis.detallesPorSeccion[seccion.nombre].pesoSeccion += peso;
        });
      } else {
        console.log(`   ❌ No hay datos para esta sección`);
      }
    });
    
    const maxPosible = analisis.totalSubsesiones * 100;
    const porcentajeFinal = maxPosible > 0 ? Math.round((analisis.pesoTotal / maxPosible) * 100) : 0;
    
    console.log(`\n📊 RESUMEN:`);
    console.log(`   Total subsesiones: ${analisis.totalSubsesiones}`);
    console.log(`   Subsesiones con estado: ${analisis.subsesionesConEstado}`);
    console.log(`   Peso total acumulado: ${analisis.pesoTotal}`);
    console.log(`   Peso máximo posible: ${maxPosible}`);
    console.log(`   Porcentaje final: ${porcentajeFinal}%`);
    console.log(`   Distribución de estados:`, analisis.distribicionEstados);
    
    return analisis;
  }, [obtenerPesoEstado]);

  // Función para calcular el progreso de una sección
  const calcularProgresoSeccion = (seccionData, subsesiones) => {
    if (!seccionData || !subsesiones || subsesiones.length === 0) return 0;
    
    const totalPeso = subsesiones.reduce((suma, subsesion) => {
      const estado = seccionData[subsesion.key]?.estado;
      return suma + obtenerPesoEstado(estado);
    }, 0);
    
    const maxPosible = subsesiones.length * 100;
    return Math.round((totalPeso / maxPosible) * 100);
  };

  // Función para calcular el progreso real de una implementación específica
  const calcularProgresoRealImplementacion = (datosCompletos) => {
    if (!datosCompletos) return 0;

    const secciones = [
      {
        data: datosCompletos.contractual,
        subsesiones: [
          { key: 'modeloContrato' },
          { key: 'modeloConfidencialidad' },
          { key: 'alcance' },
          { key: 'fechaInicio' }
        ]
      },
      {
        data: datosCompletos.talento_humano,
        subsesiones: [
          { key: 'perfilPersonal' },
          { key: 'cantidadAsesores' },
          { key: 'horarios' },
          { key: 'formador' },
          { key: 'capacitacionesAndes' },
          { key: 'capacitacionesCliente' }
        ]
      },
      {
        data: datosCompletos.procesos,
        subsesiones: [
          { key: 'responsableCliente' },
          { key: 'responsableAndes' },
          { key: 'responsablesOperacion' },
          { key: 'listadoReportes' },
          { key: 'protocoloComunicaciones' },
          { key: 'guionesProtocolos' },
          { key: 'procesoMonitoreo' },
          { key: 'cronogramaTecnologia' },
          { key: 'cronogramaCapacitaciones' },
          { key: 'realizacionPruebas' }
        ]
      },
      {
        data: datosCompletos.tecnologia,
        subsesiones: [
          { key: 'creacionModulo' },
          { key: 'tipificacionInteracciones' },
          { key: 'aplicativosProceso' },
          { key: 'whatsapp' },
          { key: 'correosElectronicos' },
          { key: 'requisitosGrabacion' }
        ]
      }
    ];

    let totalPeso = 0;
    let totalSubsesiones = 0;

    secciones.forEach(seccion => {
      if (seccion.data && seccion.subsesiones) {
        seccion.subsesiones.forEach(subsesion => {
          const estado = seccion.data[subsesion.key]?.estado;
          totalPeso += obtenerPesoEstado(estado);
          totalSubsesiones += 1;
        });
      }
    });

    if (totalSubsesiones === 0) return 0;
    const maxPosible = totalSubsesiones * 100;
    return Math.round((totalPeso / maxPosible) * 100);
  };



  // Componente para mostrar el progreso en la tabla
  const ProgresoImplementacionCelda = ({ implementacion }) => {
    const progresoGuardado = implementacionesProgreso[implementacion.id];
    const [progreso, setProgreso] = useState(progresoGuardado ?? null);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
      // Si ya tenemos el progreso guardado globalmente, usarlo
      if (progresoGuardado !== undefined) {
        setProgreso(progresoGuardado);
        return;
      }

      // Si ya estamos cargando o ya tenemos progreso local, no hacer nada
      if (cargando || progreso !== null) return;

      const cargarProgreso = async () => {
        setCargando(true);
        
        try {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          const config = { headers: { Authorization: `Bearer ${token}` } };
          
          console.log(`🔍 Cargando progreso para implementación ${implementacion.id} (${implementacion.nombre_proyecto || 'Sin nombre'})`);
          
          const response = await axios.get(`http://localhost:8000/implementaciones/${implementacion.id}`, config);
          console.log(`📊 Datos completos para implementación ${implementacion.id}:`, response.data);
          
          const progresoCalculado = calcularProgresoRealImplementacion(response.data);
          
          // Crear información de debug solo para la primera carga
          const debug = analizarImplementacionDetallado(response.data, implementacion.id);
          
          console.log(`✅ Progreso calculado para ${implementacion.id}: ${progresoCalculado}%`);
          console.log(`🔬 Análisis detallado:`, debug);
          
          setProgreso(progresoCalculado);
          // También actualizar el estado global
          setImplementacionesProgreso(prev => ({
            ...prev,
            [implementacion.id]: progresoCalculado
          }));
          
        } catch (error) {
          console.error(`❌ Error al cargar progreso de implementación ${implementacion.id}:`, error);
          setProgreso(0);
        } finally {
          setCargando(false);
        }
      };

      cargarProgreso();
    }, [implementacion.id, progresoGuardado, cargando, progreso, implementacion.nombre_proyecto]);

    if (cargando) {
      return (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    const handleDebugClick = async (e) => {
      e.stopPropagation();
      console.log(`🚀 DEBUG MANUAL IMPLEMENTACIÓN ${implementacion.id}`);
      console.log(`📋 Datos básicos:`, implementacion);
      
      try {
        setCargando(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const response = await axios.get(`http://localhost:8000/implementaciones/${implementacion.id}`, config);
        analizarImplementacionDetallado(response.data, implementacion.id);
        
      } catch (error) {
        console.error(`❌ Error en debug manual:`, error);
      } finally {
        setCargando(false);
      }
    };

    return (
      <div className="flex justify-center items-center">
        <div className="relative group">
          <div onClick={handleDebugClick} className="cursor-pointer">
            <RuedaProgreso 
              porcentaje={progreso || 0}
              size={40}
              strokeWidth={4}
            />
          </div>
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
            <div>Progreso real: {progreso || 0}%</div>
            <div className="text-gray-300 mt-1">Click para debug en consola</div>
          </div>
        </div>
      </div>
    );
  };

  // Función para calcular el progreso total de toda la implementación
  const calcularProgresoTotal = () => {
    if (!implementacionDetail) return 0;

    const secciones = [
      {
        data: implementacionDetail.contractual,
        subsesiones: [
          { key: 'modeloContrato' },
          { key: 'modeloConfidencialidad' },
          { key: 'alcance' },
          { key: 'fechaInicio' }
        ]
      },
      {
        data: implementacionDetail.talento_humano,
        subsesiones: [
          { key: 'perfilPersonal' },
          { key: 'cantidadAsesores' },
          { key: 'horarios' },
          { key: 'formador' },
          { key: 'capacitacionesAndes' },
          { key: 'capacitacionesCliente' }
        ]
      },
      {
        data: implementacionDetail.procesos,
        subsesiones: [
          { key: 'responsableCliente' },
          { key: 'responsableAndes' },
          { key: 'responsablesOperacion' },
          { key: 'listadoReportes' },
          { key: 'protocoloComunicaciones' },
          { key: 'guionesProtocolos' },
          { key: 'procesoMonitoreo' },
          { key: 'cronogramaTecnologia' },
          { key: 'cronogramaCapacitaciones' },
          { key: 'realizacionPruebas' }
        ]
      },
      {
        data: implementacionDetail.tecnologia,
        subsesiones: [
          { key: 'creacionModulo' },
          { key: 'tipificacionInteracciones' },
          { key: 'aplicativosProceso' },
          { key: 'whatsapp' },
          { key: 'correosElectronicos' },
          { key: 'requisitosGrabacion' }
        ]
      }
    ];

    let totalPeso = 0;
    let totalSubsesiones = 0;

    secciones.forEach(seccion => {
      if (seccion.data && seccion.subsesiones) {
        seccion.subsesiones.forEach(subsesion => {
          const estado = seccion.data[subsesion.key]?.estado;
          totalPeso += obtenerPesoEstado(estado);
          totalSubsesiones += 1;
        });
      }
    });

    if (totalSubsesiones === 0) return 0;
    const maxPosible = totalSubsesiones * 100;
    return Math.round((totalPeso / maxPosible) * 100);
  };

  // Componente de rueda de progreso
  const RuedaProgreso = ({ porcentaje, size = 60, strokeWidth = 6 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (porcentaje / 100) * circumference;
    
    // Determinar color basado en el porcentaje
    const getProgressColor = () => {
      if (porcentaje >= 80) return "#10B981"; // Verde
      if (porcentaje >= 50) return "#F59E0B"; // Amarillo/Naranja
      if (porcentaje >= 25) return "#EF4444"; // Rojo
      return "#6B7280"; // Gris
    };
    
    const progressColor = getProgressColor();
    
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Círculo de fondo */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Círculo de progreso */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-in-out"
          />
        </svg>
        {/* Texto del porcentaje */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-bold transition-colors duration-300 ${
            porcentaje >= 80 ? 'text-green-700' :
            porcentaje >= 50 ? 'text-orange-700' :
            porcentaje >= 25 ? 'text-red-700' :
            'text-gray-600'
          }`}>
            {porcentaje}%
          </span>
        </div>
      </div>
    );
  };

  // Componente para mostrar estado editable de subsesión
  const EstadoEditable = ({ seccion, campo, estado }) => {
    const isEditing = editingSubsession === `${seccion}.${campo}`;
    const estadosDisponibles = [
      { value: 'No definido', label: '⚪ No definido', color: 'bg-gray-100 text-gray-700' },
      { value: 'ok', label: '✅ Completado', color: 'bg-emerald-100 text-emerald-700' },
      { value: 'en proceso', label: '🔄 En Proceso', color: 'bg-blue-100 text-blue-700' },
      { value: 'cancelado', label: '❌ Cancelado', color: 'bg-red-100 text-red-700' }
    ];

    const getEstadoConfig = (estadoValue) => {
      return estadosDisponibles.find(e => e.value === estadoValue) || estadosDisponibles[0];
    };

    if (isEditing) {
      return (
        <div className="estado-editable flex items-center gap-2 p-2 bg-white border-2 border-blue-200 rounded-lg shadow-sm animate-pulse">
          <span className="font-medium text-gray-700 text-sm">Estado:</span>
          <div className="flex items-center gap-2">
            <select
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={(e) => manejarTeclasSubsesion(e, seccion, campo)}
              disabled={savingSubsession}
              className={`px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[140px] ${
                savingSubsession ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              autoFocus
            >
              {estadosDisponibles.map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
            <div className="flex gap-1">
              <button
                onClick={() => guardarEstadoSubsesion(seccion, campo)}
                disabled={savingSubsession}
                className={`px-3 py-1.5 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 flex items-center gap-1 ${
                  savingSubsession 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                }`}
                title={savingSubsession ? "Guardando..." : "Guardar cambios"}
              >
                {savingSubsession ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span className="text-xs">💾</span>
                    Guardar
                  </>
                )}
              </button>
              <button
                onClick={cancelarEdicionSubsesion}
                disabled={savingSubsession}
                className={`px-3 py-1.5 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 flex items-center gap-1 ${
                  savingSubsession 
                    ? 'bg-gray-300 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
                }`}
                title={savingSubsession ? "Guardando..." : "Cancelar edición"}
              >
                <span className="text-xs">🚫</span>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      );
    }

    const estadoConfig = getEstadoConfig(estado);
    const isRecentlyUpdated = recentlyUpdated === `${seccion}.${campo}`;

    return (
      <div className="estado-editable flex items-center gap-2">
        <span className="font-medium text-gray-600 text-sm">Estado:</span>
        <button
          onClick={() => iniciarEdicionSubsesion(seccion, campo, estado)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-md border-2 border-transparent hover:border-gray-300 ${estadoConfig.color} group relative ${
            isRecentlyUpdated ? 'animate-pulse ring-2 ring-green-400 ring-opacity-75' : ''
          }`}
          title="Haz clic para editar el estado"
        >
          <span className="flex items-center gap-1">
            {estadoConfig.label}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs">
              ✏️
            </span>
          </span>
          
          {/* Indicador de hover más sutil */}
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
        </button>
      </div>
    );
  };

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

  // Función para iniciar la edición de una subsesión
  const iniciarEdicionSubsesion = (seccion, campo, valorActual) => {
    setEditingSubsession(`${seccion}.${campo}`);
    setEditingValue(valorActual || '');
  };

  // Función para cancelar la edición de una subsesión
  const cancelarEdicionSubsesion = () => {
    setEditingSubsession(null);
    setEditingValue('');
  };

  // Función para manejar teclas en la edición de subsesiones
  const manejarTeclasSubsesion = (e, seccion, campo) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      guardarEstadoSubsesion(seccion, campo);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelarEdicionSubsesion();
    }
  };

  // Función para guardar el cambio de estado de una subsesión
  const guardarEstadoSubsesion = async (seccion, campo) => {
    if (savingSubsession) return; // Evitar múltiples envíos
    
    setSavingSubsession(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Preparar el payload completo de la implementación con el campo actualizado
      const currentSection = implementacionDetail[seccion] || {};
      const currentField = currentSection[campo] || {};
      
      const updatedField = {
        seguimiento: currentField.seguimiento || '',
        estado: editingValue,
        responsable: currentField.responsable || '',
        notas: currentField.notas || ''
      };

      const updateData = {
        cliente: implementacionDetail.cliente || '',
        proceso: implementacionDetail.proceso || '',
        estado: implementacionDetail.estado || '',
        contractual: implementacionDetail.contractual || {},
        talento_humano: implementacionDetail.talento_humano || {},
        procesos: implementacionDetail.procesos || {},
        tecnologia: implementacionDetail.tecnologia || {},
        [seccion]: {
          ...currentSection,
          [campo]: updatedField
        }
      };

      console.log('📤 Datos que se envían para actualizar subsesión:', updateData);
      console.log('🎯 Campo específico actualizado:', { seccion, campo, nuevoEstado: editingValue });

      // Intentar primero con un endpoint específico para subsesiones si existe
      try {
        // Endpoint específico para actualizar subsesiones
        await axios.patch(
          `http://localhost:8000/implementaciones/${implementacionDetail.id}/subsesion`,
          {
            seccion: seccion,
            campo: campo,
            estado: editingValue
          },
          config
        );
        console.log('✅ Actualización exitosa con endpoint específico');
      } catch {
        console.log('⚠️ Endpoint de subsesión no disponible, usando PUT completo...');
        try {
          // Si no existe el endpoint específico, usar PUT completo
          await axios.put(
            `http://localhost:8000/implementaciones/${implementacionDetail.id}`,
            updateData,
            config
          );
          console.log('✅ Actualización exitosa con PUT completo');
        } catch {
          console.log('⚠️ PUT completo falló, intentando con datos mínimos...');
          // Como último recurso, enviar solo los datos básicos necesarios
          const minimalData = {
            cliente: implementacionDetail.cliente,
            proceso: implementacionDetail.proceso,
            estado: implementacionDetail.estado,
            [seccion]: {
              [campo]: {
                estado: editingValue
              }
            }
          };
          
          await axios.put(
            `http://localhost:8000/implementaciones/${implementacionDetail.id}`,
            minimalData,
            config
          );
          console.log('✅ Actualización exitosa con datos mínimos');
        }
      }

      // Actualizar el estado local
      setImplementacionDetail(prev => ({
        ...prev,
        [seccion]: {
          ...prev[seccion],
          [campo]: {
            ...prev[seccion]?.[campo],
            estado: editingValue
          }
        }
      }));

      setEditingSubsession(null);
      setEditingValue('');
      
      // Mostrar efecto de éxito temporal
      const updatedKey = `${seccion}.${campo}`;
      setRecentlyUpdated(updatedKey);
      setTimeout(() => setRecentlyUpdated(null), 2000);
      
      toast.success('✅ Estado actualizado correctamente');
    } catch (error) {
      console.error('❌ Error completo al actualizar estado de subsesión:', error);
      console.error('📋 Detalles del error:', error.response?.data);
      console.error('🔍 Status:', error.response?.status);
      console.error('📊 Headers de respuesta:', error.response?.headers);
      
      // Mostrar mensaje de error más específico
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Error desconocido al actualizar el estado';
      
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setSavingSubsession(false);
    }
  };

  const guardarImplementacion = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Preparar datos para el backend
      const formDataBackend = {
        ...formData,
        talento_humano: formData.talentoHumano,
        talentoHumano: undefined // opcional, para no enviar duplicado
      };
      
      // Limpiar campos undefined
      delete formDataBackend.talentoHumano;
      
      console.log('Datos que se enviarán al backend:', formDataBackend);
      console.log('Modo edición:', isEditMode);
      console.log('Implementación a editar:', editingImplementacion);
      
      if (isEditMode && editingImplementacion) {
        // Modo edición - actualizar implementación existente
        console.log(`🔄 Actualizando implementación ID: ${editingImplementacion.id}`);
        console.log('📤 URL de actualización:', `http://localhost:8000/implementaciones/${editingImplementacion.id}`);
        console.log('📊 Datos contractuales que se envían:', formDataBackend.contractual);
        console.log('👥 Datos talento humano que se envían:', formDataBackend.talento_humano);
        
        const response = await axios.put(`http://localhost:8000/implementaciones/${editingImplementacion.id}`, formDataBackend, config);
        console.log('✅ Respuesta del servidor (actualización):', response.data);
        console.log('📍 Status code:', response.status);
        
        toast.success('Implementación actualizada exitosamente');
      } else {
        // Modo creación - crear nueva implementación
        console.log('Creando nueva implementación');
        const response = await axios.post('http://localhost:8000/implementaciones', formDataBackend, config);
        console.log('Respuesta del servidor (creación):', response.data);
        toast.success('Implementación guardada exitosamente');
      }
      
      setShowModal(false);
      resetFormulario();
      cargarImplementaciones();
    } catch (error) {
      console.error('Error completo al guardar/actualizar:', error);
      console.error('Detalles del error:', error.response?.data);
      toast.error(isEditMode ? 'Error al actualizar implementación' : 'Error al guardar implementación');
    }
  };

  // Función para abrir modal en modo edición
  const abrirModalEdicion = async (implementacion) => {
    setIsEditMode(true);
    setEditingImplementacion(implementacion);
    
    // Cargar los detalles completos para la edición
    setLoadingDetail(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`http://localhost:8000/implementaciones/${implementacion.id}`, config);
      
      // Mapear los datos del backend al formato del formulario
      const detalles = response.data;
      console.log('Datos recibidos del backend para edición:', detalles);
      
      // Función auxiliar para mapear correctamente los objetos anidados
      const mapearSeccion = (seccionData, defaultStructure) => {
        if (!seccionData || typeof seccionData !== 'object') {
          return defaultStructure;
        }
        
        const mapped = {};
        Object.keys(defaultStructure).forEach(key => {
          mapped[key] = {
            seguimiento: seccionData[key]?.seguimiento || '',
            estado: seccionData[key]?.estado || '',
            responsable: seccionData[key]?.responsable || '',
            notas: seccionData[key]?.notas || ''
          };
        });
        return mapped;
      };
      
      const defaultContractual = {
        modeloContrato: { seguimiento: '', estado: '', responsable: '', notas: '' },
        modeloConfidencialidad: { seguimiento: '', estado: '', responsable: '', notas: '' },
        alcance: { seguimiento: '', estado: '', responsable: '', notas: '' },
        fechaInicio: { seguimiento: '', estado: '', responsable: '', notas: '' }
      };
      
      const defaultTalentoHumano = {
        perfilPersonal: { seguimiento: '', estado: '', responsable: '', notas: '' },
        cantidadAsesores: { seguimiento: '', estado: '', responsable: '', notas: '' },
        horarios: { seguimiento: '', estado: '', responsable: '', notas: '' },
        formador: { seguimiento: '', estado: '', responsable: '', notas: '' },
        capacitacionesAndes: { seguimiento: '', estado: '', responsable: '', notas: '' },
        capacitacionesCliente: { seguimiento: '', estado: '', responsable: '', notas: '' }
      };
      
      const defaultProcesos = {
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
      };
      
      const defaultTecnologia = {
        creacionModulo: { seguimiento: '', estado: '', responsable: '', notas: '' },
        tipificacionInteracciones: { seguimiento: '', estado: '', responsable: '', notas: '' },
        aplicativosProceso: { seguimiento: '', estado: '', responsable: '', notas: '' },
        whatsapp: { seguimiento: '', estado: '', responsable: '', notas: '' },
        correosElectronicos: { seguimiento: '', estado: '', responsable: '', notas: '' },
        requisitosGrabacion: { seguimiento: '', estado: '', responsable: '', notas: '' }
      };
      
      const mappedFormData = {
        cliente: detalles.cliente || '',
        estado: detalles.estado || '',
        proceso: detalles.proceso || '',
        contractual: mapearSeccion(detalles.contractual, defaultContractual),
        talentoHumano: mapearSeccion(detalles.talento_humano, defaultTalentoHumano),
        procesos: mapearSeccion(detalles.procesos, defaultProcesos),
        tecnologia: mapearSeccion(detalles.tecnologia, defaultTecnologia)
      };
      
      console.log('Datos mapeados para el formulario:', mappedFormData);
      setFormData(mappedFormData);
    } catch (error) {
      console.error('Error al cargar detalles para edición:', error);
      toast.error('Error al cargar los datos para edición');
      // Si falla, usar datos básicos y estructura vacía
      setFormData({
        cliente: implementacion.cliente || '',
        estado: implementacion.estado || '',
        proceso: implementacion.proceso || '',
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
    } finally {
      setLoadingDetail(false);
    }
    
    setShowModal(true);
  };

  // Funciones para eliminación con doble seguridad
  const abrirModalEliminacion = (implementacion) => {
    setImplementacionToDelete(implementacion);
    setDeleteConfirmText('');
    setShowDeleteModal(true);
  };

  const cerrarModalEliminacion = () => {
    setShowDeleteModal(false);
    setImplementacionToDelete(null);
    setDeleteConfirmText('');
    setDeletingInProgress(false);
  };

  const eliminarImplementacion = async () => {
    if (deleteConfirmText.toLowerCase() !== 'eliminar') {
      toast.error('Debes escribir "eliminar" para confirmar la eliminación');
      return;
    }

    setDeletingInProgress(true);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(`http://localhost:8000/implementaciones/${implementacionToDelete.id}`, config);
      
      toast.success(`Implementación "${implementacionToDelete.cliente}" eliminada exitosamente`);
      
      // Recargar la lista de implementaciones
      await cargarImplementaciones();
      
      // Cerrar modal
      cerrarModalEliminacion();
      
    } catch (error) {
      console.error('Error al eliminar implementación:', error);
      const errorMessage = error.response?.data?.detail || 'Error al eliminar la implementación';
      toast.error(errorMessage);
      setDeletingInProgress(false);
    }
  };

  // Función para exportar a Excel con plantilla específica usando ExcelJS
  const exportarImplementacionExcel = async (implementacion) => {
    try {
      console.log('🟢 Iniciando exportación para implementación:', implementacion);
      toast.loading('Preparando exportación a Excel...', { id: 'excel-export' });
      
      // Cargar el detalle completo de la implementación
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      console.log('🟢 Obteniendo datos del backend para ID:', implementacion.id);
      const response = await axios.get(`http://localhost:8000/implementaciones/${implementacion.id}`, config);
      console.log('🟢 Datos recibidos del backend:', response.data);
      const detalleCompleto = response.data;
      
      // =========================
      // Setup: crear libro y hoja usando ExcelJS
      // =========================
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Mapa Implementación');

      // -------------------------------------------------
      // Configuración de columnas y alturas de filas
      // -------------------------------------------------
      // Anchos específicos convertidos de píxeles a unidades de Excel:
      // A: 132px ≈ 18 unidades, B: 156px ≈ 21 unidades, C: 134px ≈ 18 unidades
      // D-E: 264px ≈ 36 unidades, F-G: 140px ≈ 19 unidades  
      // H-I: 176px ≈ 24 unidades, J-K: 264px ≈ 36 unidades
      ws.columns = [
        { width: 20 },  // A: 132px
        { width: 25 },  // B: 156px
        { width: 25 },  // C: 134px
        { width: 18 },  // D: 264px (fusionada con E)
        { width: 18 },  // E: 264px (fusionada con D)
        { width: 8 },  // F: 140px (fusionada con G)
        { width: 8 },  // G: 140px (fusionada con F)
        { width: 10 },  // H: 176px (fusionada con I)
        { width: 10 },  // I: 176px (fusionada con H)
        { width: 15 },  // J: 264px (fusionada con K)
        { width: 15 }   // K: 264px (fusionada con J)
      ];
      
      // Fijar altura de las primeras 6 filas para el bloque de título
      ws.getRow(1).height = 20;
      ws.getRow(2).height = 20;
      ws.getRow(3).height = 20;
      ws.getRow(4).height = 20;
      ws.getRow(5).height = 20;
      ws.getRow(6).height = 20;
      ws.getRow(7).height = 1;
      ws.getRow(8).height = 12;
      ws.getRow(9).height = 12;
      ws.getRow(35).height = 28;
      
      // Configurar altura automática para las filas de contenido (fila 10 en adelante)
      // Las siguientes filas tendrán altura automática basada en el contenido

      // =========================
      // Bloque de título (A1:K6) - Diseño como la imagen de muestra
      // =========================
      
      // Fondo blanco para todo el bloque
      const whiteFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      const blackBorder = { style: 'thin', color: { argb: 'FF000000' } };
      
      // Aplicar fondo blanco y bordes a todo el bloque A1:K6
      for (let r = 1; r <= 6; r++) {
        for (let c = 1; c <= 11; c++) {
          const cell = ws.getRow(r).getCell(c);
          cell.fill = whiteFill;
          
          // Aplicar bordes solo en el perímetro del bloque
          let cellBorder = {};
          if (r === 1) cellBorder.top = blackBorder;
          if (r === 6) cellBorder.bottom = blackBorder;
          if (c === 1) cellBorder.left = blackBorder;
          if (c === 11) cellBorder.right = blackBorder;
          cell.border = cellBorder;
        }
      }

      // Título con el nombre del cliente (centrado en la parte superior izquierda)
      ws.mergeCells('A2:G3');
      const titleCell = ws.getCell('A2');
      titleCell.value = detalleCompleto.cliente || implementacion.cliente || 'Cliente';
      titleCell.font = { 
        bold: true, 
        size: 24, 
        color: { argb: 'FF000000' },
        name: 'Arial'
      };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = whiteFill;

      // Subtítulo "MAPA DE IMPLEMENTACION SERVICIOS" (centrado en la parte inferior izquierda)
      ws.mergeCells('A4:G5');
      const subtitleCell = ws.getCell('A4');
      subtitleCell.value = 'MAPA DE IMPLEMENTACION SERVICIOS';
      subtitleCell.font = { 
        bold: false, 
        size: 16, 
        color: { argb: 'FF666666' },
        name: 'Arial'
      };
      subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      subtitleCell.fill = whiteFill;

      // Área para el logo Andes BPO (esquina superior derecha)
      // Función para cargar y convertir la imagen PNG a base64
      const loadLogoAsBase64 = async () => {
        try {
          // Cargar la imagen del logo desde la carpeta public
          const response = await fetch('/logo-andesbpo.png');
          const blob = await response.blob();
          
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.log('⚠️ No se pudo cargar el logo desde archivo:', error);
          return null;
        }
      };

      // Intentar agregar el logo como imagen
      try {
        const logoBase64 = await loadLogoAsBase64();
        
        if (logoBase64) {
          // Crear imagen desde base64
          const logoImageId = wb.addImage({
            base64: logoBase64,
            extension: 'png',
          });

          // Posicionar el logo en la parte superior izquierda del área derecha (columnas H-K, filas 1-5)
          ws.addImage(logoImageId, {
            tl: { col: 6.5, row: 0.2 }, // Movido más a la izquierda y hacia arriba
            ext: { width: 240, height: 80 } // Tamaño reducido 20% (300→240, 100→80)
          });
          
          console.log('✅ Logo agregado exitosamente al Excel');
        } else {
          throw new Error('No se pudo cargar el logo');
        }
      } catch (error) {
        console.log('⚠️ No se pudo agregar el logo como imagen, usando fallback:', error);
        
        // Fallback: agregar texto "ANDES BPO" con mejor simetría
        ws.mergeCells('H2:K5');
        const logoTextCell = ws.getCell('H2');
        logoTextCell.value = 'ANDES BPO\nBusiness Process\nOutsourcing\nContact Center';
        logoTextCell.font = { 
          bold: true, 
          size: 12, 
          color: { argb: 'FF0DB14B' },
          name: 'Arial'
        };
        logoTextCell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle',
          wrapText: true 
        };
        logoTextCell.fill = whiteFill;
      }
      
      // Línea divisoria inferior opcional (fila 6)
      ws.mergeCells('A6:K6');
      const dividerCell = ws.getCell('A6');
      dividerCell.value = '';
      dividerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
      
      // Dejar la fila 1 completamente limpia para mejor diseño
      ws.mergeCells('A1:K1');
      const topCell = ws.getCell('A1');
      topCell.value = '';
      topCell.fill = whiteFill;

      // Definir el estilo de borde con puntos seguidos y muy juntos
      const dottedBorder = { style: 'dotted', color: { argb: 'FF434343' } };
      const fullDottedBorder = {
        top: dottedBorder,
        left: dottedBorder,
        bottom: dottedBorder,
        right: dottedBorder
      };

      // Definir el estilo de borde grueso para columnas A y B (filas 10-36)
      const thickBlueBorder = { style: 'thick', color: { argb: 'FF1155CC' } };
      const fullThickBlueBorder = {
        top: thickBlueBorder,
        left: thickBlueBorder,
        bottom: thickBlueBorder,
        right: thickBlueBorder
      };

      // Definir el estilo de borde delgado negro para encabezados (filas 8-9)
      const thinBlackBorder = { style: 'thin', color: { argb: 'FF000000' } };
      const fullThinBlackBorder = {
        top: thinBlackBorder,
        left: thinBlackBorder,
        bottom: thinBlackBorder,
        right: thinBlackBorder
      };

      // -----------------------------
      // Encabezados de la tabla (fila 8)
      // -----------------------------
      ws.mergeCells('A8:A9');
      const headerFase = ws.getCell('A8');
      headerFase.value = 'Fase';
      headerFase.alignment = { horizontal: 'center', vertical: 'middle' };
      headerFase.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
      headerFase.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0DB14B' } };
      headerFase.border = fullThinBlackBorder;
      // Aplicar bordes a A9 también
      ws.getCell('A9').border = fullThinBlackBorder;

      ws.mergeCells('B8:B9');
      const headerProceso = ws.getCell('B8');
      headerProceso.value = 'Proceso';
      headerProceso.alignment = { horizontal: 'center', vertical: 'middle' };
      headerProceso.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
      headerProceso.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0DB14B' } };
      headerProceso.border = {
        top: thinBlackBorder,
        left: thinBlackBorder,
        bottom: thinBlackBorder,
        right: dottedBorder // Borde derecho punteado para separar de columna C
      };
      // Aplicar bordes a B9 también con borde derecho punteado
      ws.getCell('B9').border = {
        top: thinBlackBorder,
        left: thinBlackBorder,
        bottom: thinBlackBorder,
        right: dottedBorder
      };

      ws.mergeCells('C8:C9');
      const headerActividades = ws.getCell('C8');
      headerActividades.value = 'Actividades';
      headerActividades.alignment = { horizontal: 'center', vertical: 'middle' };
      headerActividades.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
      headerActividades.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0DB14B' } };
      headerActividades.border = {
        top: thinBlackBorder,
        left: dottedBorder, // Borde izquierdo punteado para separar de columna B
        bottom: thinBlackBorder,
        right: thinBlackBorder
      };
      // Aplicar bordes a C9 también con borde izquierdo punteado
      ws.getCell('C9').border = {
        top: thinBlackBorder,
        left: dottedBorder,
        bottom: thinBlackBorder,
        right: thinBlackBorder
      };

      ws.mergeCells('D8:E9');
      const headerSeguimiento = ws.getCell('D8');
      headerSeguimiento.value = 'Seguimiento Actividades';
      headerSeguimiento.alignment = { horizontal: 'center', vertical: 'middle' };
      headerSeguimiento.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
      headerSeguimiento.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0DB14B' } };
      headerSeguimiento.border = fullThinBlackBorder;
      // Aplicar bordes a D9 y E8, E9 también
      ws.getCell('D9').border = fullThinBlackBorder;
      ws.getCell('E8').border = fullThinBlackBorder;
      ws.getCell('E9').border = fullThinBlackBorder;

      ws.mergeCells('F8:G9');
      const headerEstado = ws.getCell('F8');
      headerEstado.value = 'Estado';
      headerEstado.alignment = { horizontal: 'center', vertical: 'middle' };
      headerEstado.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
      headerEstado.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0DB14B' } };
      headerEstado.border = fullThinBlackBorder;
      // Aplicar bordes a F9 y G8, G9 también
      ws.getCell('F9').border = fullThinBlackBorder;
      ws.getCell('G8').border = fullThinBlackBorder;
      ws.getCell('G9').border = fullThinBlackBorder;

      ws.mergeCells('H8:I9');
      const headerResponsable = ws.getCell('H8');
      headerResponsable.value = 'Responsable';
      headerResponsable.alignment = { horizontal: 'center', vertical: 'middle' };
      headerResponsable.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
      headerResponsable.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0DB14B' } };
      headerResponsable.border = fullThinBlackBorder;
      // Aplicar bordes a H9 y I8, I9 también
      ws.getCell('H9').border = fullThinBlackBorder;
      ws.getCell('I8').border = fullThinBlackBorder;
      ws.getCell('I9').border = fullThinBlackBorder;

      ws.mergeCells('J8:K9');
      const headerNotas = ws.getCell('J8');
      headerNotas.value = 'Notas';
      headerNotas.alignment = { horizontal: 'center', vertical: 'middle' };
      headerNotas.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
      headerNotas.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0DB14B' } };
      headerNotas.border = fullThinBlackBorder;
      // Aplicar bordes a J9 y K8, K9 también
      ws.getCell('J9').border = fullThinBlackBorder;
      ws.getCell('K8').border = fullThinBlackBorder;
      ws.getCell('K9').border = fullThinBlackBorder;

      // =========================
      // Contenido de datos (empezando en fila 10)
      // =========================
      let currentRow = 10;
      
      // Función auxiliar para agregar datos con estilos
      const addDataRow = (fase, proceso, actividad, seguimiento, estado, responsable, notas, isProcess = false, isPhase = false, customBgColor = null) => {
        // La altura de esta fila será automática basada en el contenido (wrapText: true)
        
        // Columna A (Fase)
        const cellFase = ws.getCell(`A${currentRow}`);
        cellFase.value = fase;
        cellFase.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        // Aplicar borde grueso azul para filas 10-36, sino borde normal
        if (currentRow >= 10 && currentRow <= 36) {
          cellFase.border = fullThickBlueBorder;
        } else {
          cellFase.border = fullDottedBorder;
        }
        if (isPhase) {
          cellFase.font = { bold: true, color: { argb: 'FF000000' } };
          cellFase.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
        }

        // Columna B (Proceso)
        const cellProceso = ws.getCell(`B${currentRow}`);
        cellProceso.value = proceso;
        cellProceso.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        // Aplicar borde grueso azul para filas 10-36, pero con borde derecho punteado para separar de columna C
        if (currentRow >= 10 && currentRow <= 36) {
          cellProceso.border = {
            top: thickBlueBorder,
            left: thickBlueBorder,
            bottom: thickBlueBorder,
            right: dottedBorder // Borde derecho punteado para separar de columna C
          };
        } else {
          cellProceso.border = fullDottedBorder;
        }
        
        // Aplicar fuente Calibri tamaño 12 para toda la columna B (filas 10-36)
        if (currentRow >= 10 && currentRow <= 36) {
          if (isProcess) {
            cellProceso.font = { bold: true, color: { argb: 'FF000000' }, name: 'Calibri', size: 12 };
            // Aplicar color personalizado si se proporciona, sino usar el color por defecto
            if (customBgColor) {
              cellProceso.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: customBgColor } };
            } else {
              cellProceso.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
            }
          } else {
            // Para celdas que no son proceso, aplicar solo la fuente sin negrita
            cellProceso.font = { name: 'Calibri', size: 12 };
          }
        } else {
          // Para filas fuera del rango 10-36, mantener el comportamiento original
          if (isProcess) {
            cellProceso.font = { bold: true, color: { argb: 'FF000000' } };
            if (customBgColor) {
              cellProceso.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: customBgColor } };
            } else {
              cellProceso.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
            }
          }
        }

        // Columna C (Actividades)
        const cellActividad = ws.getCell(`C${currentRow}`);
        cellActividad.value = actividad;
        cellActividad.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        // Aplicar borde específico para columnas C-K en filas 10-36
        if (currentRow >= 10 && currentRow <= 36) {
          cellActividad.border = fullDottedBorder;
        } else {
          cellActividad.border = fullDottedBorder;
        }
        // Aplicar fuente Calibri tamaño 11 para columnas C-K (filas 10-35)
        if (currentRow >= 10 && currentRow <= 35) {
          cellActividad.font = { name: 'Calibri', size: 11 };
        }

        // Columnas D:E (Seguimiento)
        ws.mergeCells(`D${currentRow}:E${currentRow}`);
        const cellSeguimiento = ws.getCell(`D${currentRow}`);
        cellSeguimiento.value = seguimiento;
        cellSeguimiento.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        // Aplicar borde específico para columnas C-K en filas 10-36
        if (currentRow >= 10 && currentRow <= 36) {
          cellSeguimiento.border = fullDottedBorder;
        } else {
          cellSeguimiento.border = fullDottedBorder;
        }
        // Aplicar bordes también a la celda E para la fusión
        const cellE = ws.getCell(`E${currentRow}`);
        if (currentRow >= 10 && currentRow <= 36) {
          cellE.border = fullDottedBorder;
        } else {
          cellE.border = fullDottedBorder;
        }
        // Aplicar fuente Calibri tamaño 11 para columnas C-K (filas 10-35)
        if (currentRow >= 10 && currentRow <= 35) {
          cellSeguimiento.font = { name: 'Calibri', size: 11 };
        }

        // Columnas F:G (Estado)
        ws.mergeCells(`F${currentRow}:G${currentRow}`);
        const cellEstado = ws.getCell(`F${currentRow}`);
        cellEstado.value = estado;
        cellEstado.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        // Aplicar borde específico para columnas C-K en filas 10-36
        if (currentRow >= 10 && currentRow <= 36) {
          cellEstado.border = fullDottedBorder;
        } else {
          cellEstado.border = fullDottedBorder;
        }
        // Aplicar bordes también a la celda G para la fusión
        const cellG = ws.getCell(`G${currentRow}`);
        if (currentRow >= 10 && currentRow <= 36) {
          cellG.border = fullDottedBorder;
        } else {
          cellG.border = fullDottedBorder;
        }
        // Aplicar fuente Calibri tamaño 11 para columnas C-K (filas 10-35)
        if (currentRow >= 10 && currentRow <= 35) {
          cellEstado.font = { name: 'Calibri', size: 11 };
        }

        // Columnas H:I (Responsable)
        ws.mergeCells(`H${currentRow}:I${currentRow}`);
        const cellResponsable = ws.getCell(`H${currentRow}`);
        cellResponsable.value = responsable;
        cellResponsable.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        // Aplicar borde específico para columnas C-K en filas 10-36
        if (currentRow >= 10 && currentRow <= 36) {
          cellResponsable.border = fullDottedBorder;
        } else {
          cellResponsable.border = fullDottedBorder;
        }
        // Aplicar bordes también a la celda I para la fusión
        const cellI = ws.getCell(`I${currentRow}`);
        if (currentRow >= 10 && currentRow <= 36) {
          cellI.border = fullDottedBorder;
        } else {
          cellI.border = fullDottedBorder;
        }
        // Aplicar fuente Calibri tamaño 11 para columnas C-K (filas 10-35)
        if (currentRow >= 10 && currentRow <= 35) {
          cellResponsable.font = { name: 'Calibri', size: 11 };
        }

        // Columnas J:K (Notas)
        ws.mergeCells(`J${currentRow}:K${currentRow}`);
        const cellNotas = ws.getCell(`J${currentRow}`);
        cellNotas.value = notas;
        cellNotas.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        // Aplicar borde específico para columnas C-K en filas 10-36
        if (currentRow >= 10 && currentRow <= 36) {
          cellNotas.border = fullDottedBorder;
        } else {
          cellNotas.border = fullDottedBorder;
        }
        // Aplicar bordes también a la celda K para la fusión
        const cellK = ws.getCell(`K${currentRow}`);
        if (currentRow >= 10 && currentRow <= 36) {
          cellK.border = fullDottedBorder;
        } else {
          cellK.border = fullDottedBorder;
        }
        // Aplicar fuente Calibri tamaño 11 para columnas C-K (filas 10-35)
        if (currentRow >= 10 && currentRow <= 35) {
          cellNotas.font = { name: 'Calibri', size: 11 };
        }

        currentRow++;
      };

      // FASE: INICIO
      const inicioStartRow = currentRow;
      
      // Proceso: Desarrollar el acta de Inicio
      const contractualStartRow = currentRow;
      addDataRow('INICIO', 'Desarrollar el acta de Inicio', 'Modelo de contrato', 
                 detalleCompleto.contractual?.modeloContrato?.seguimiento || '', 
                 detalleCompleto.contractual?.modeloContrato?.estado || '', 
                 detalleCompleto.contractual?.modeloContrato?.responsable || '',
                 detalleCompleto.contractual?.modeloContrato?.notas || '', true, false, 'FFD6DCE4');

      addDataRow('', '', 'Modelo del Acuerdo de Confidencialidad', 
                 detalleCompleto.contractual?.modeloConfidencialidad?.seguimiento || '', 
                 detalleCompleto.contractual?.modeloConfidencialidad?.estado || '', 
                 detalleCompleto.contractual?.modeloConfidencialidad?.responsable || '',
                 detalleCompleto.contractual?.modeloConfidencialidad?.notas || '');

      addDataRow('', '', 'Alcance', 
                 detalleCompleto.contractual?.alcance?.seguimiento || '', 
                 detalleCompleto.contractual?.alcance?.estado || '', 
                 detalleCompleto.contractual?.alcance?.responsable || '',
                 detalleCompleto.contractual?.alcance?.notas || '');

      addDataRow('', '', 'Fecha de Inicio prestación del Servicio', 
                 detalleCompleto.contractual?.fechaInicio?.seguimiento || '', 
                 detalleCompleto.contractual?.fechaInicio?.estado || '', 
                 detalleCompleto.contractual?.fechaInicio?.responsable || '',
                 detalleCompleto.contractual?.fechaInicio?.notas || '');

      // Fusionar células del proceso contractual
      ws.mergeCells(`B${contractualStartRow}:B${currentRow - 1}`);
      
      // Fusionar y aplicar color de fondo para la fase INICIO (filas 10-13)
      ws.mergeCells(`A${inicioStartRow}:A${currentRow - 1}`);
      const faseInicioCell = ws.getCell(`A${inicioStartRow}`);
      faseInicioCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8496B0' } };
      faseInicioCell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Texto blanco para mejor contraste

      // FASE: DESARROLLO (desde fila 14)
      const desarrolloStartRow = currentRow;

      // Proceso: Talento Humano
      const talentoStartRow = currentRow;
      addDataRow('', 'Talento Humano', 'Perfil del Personal Requerido', 
                 detalleCompleto.talento_humano?.perfilPersonal?.seguimiento || '', 
                 detalleCompleto.talento_humano?.perfilPersonal?.estado || '', 
                 detalleCompleto.talento_humano?.perfilPersonal?.responsable || '',
                 detalleCompleto.talento_humano?.perfilPersonal?.notas || '', true, false, 'FFDEEAF6');

      addDataRow('', '', 'Cantidad de Asesores requeridos', 
                 detalleCompleto.talento_humano?.cantidadAsesores?.seguimiento || '', 
                 detalleCompleto.talento_humano?.cantidadAsesores?.estado || '', 
                 detalleCompleto.talento_humano?.cantidadAsesores?.responsable || '',
                 detalleCompleto.talento_humano?.cantidadAsesores?.notas || '');

      addDataRow('', '', 'Horarios', 
                 detalleCompleto.talento_humano?.horarios?.seguimiento || '', 
                 detalleCompleto.talento_humano?.horarios?.estado || '', 
                 detalleCompleto.talento_humano?.horarios?.responsable || '',
                 detalleCompleto.talento_humano?.horarios?.notas || '');

      addDataRow('', '', 'Formador', 
                 detalleCompleto.talento_humano?.formador?.seguimiento || '', 
                 detalleCompleto.talento_humano?.formador?.estado || '', 
                 detalleCompleto.talento_humano?.formador?.responsable || '',
                 detalleCompleto.talento_humano?.formador?.notas || '');

      addDataRow('', '', 'Programa de Capacitaciones de Andes BPO', 
                 detalleCompleto.talento_humano?.capacitacionesAndes?.seguimiento || '', 
                 detalleCompleto.talento_humano?.capacitacionesAndes?.estado || '', 
                 detalleCompleto.talento_humano?.capacitacionesAndes?.responsable || '',
                 detalleCompleto.talento_humano?.capacitacionesAndes?.notas || '');

      addDataRow('', '', 'Programa de Capacitaciones del cliente', 
                 detalleCompleto.talento_humano?.capacitacionesCliente?.seguimiento || '', 
                 detalleCompleto.talento_humano?.capacitacionesCliente?.estado || '', 
                 detalleCompleto.talento_humano?.capacitacionesCliente?.responsable || '',
                 detalleCompleto.talento_humano?.capacitacionesCliente?.notas || '');

      // Fusionar células del proceso talento humano
      ws.mergeCells(`B${talentoStartRow}:B${currentRow - 1}`);

      // Proceso: Tecnología
      const tecnologiaStartRow = currentRow;
      addDataRow('', 'Tecnología', 'Creación Módulo en Wolkvox para cliente nuevo', 
                 detalleCompleto.tecnologia?.creacionModulo?.seguimiento || '', 
                 detalleCompleto.tecnologia?.creacionModulo?.estado || '', 
                 detalleCompleto.tecnologia?.creacionModulo?.responsable || '',
                 detalleCompleto.tecnologia?.creacionModulo?.notas || '', true, false, 'FFDEEAF6');

      addDataRow('', '', 'Tipificación de interacciones', 
                 detalleCompleto.tecnologia?.tipificacionInteracciones?.seguimiento || '', 
                 detalleCompleto.tecnologia?.tipificacionInteracciones?.estado || '', 
                 detalleCompleto.tecnologia?.tipificacionInteracciones?.responsable || '',
                 detalleCompleto.tecnologia?.tipificacionInteracciones?.notas || '');

      addDataRow('', '', 'Aplicativos para el proceso', 
                 detalleCompleto.tecnologia?.aplicativosProceso?.seguimiento || '', 
                 detalleCompleto.tecnologia?.aplicativosProceso?.estado || '', 
                 detalleCompleto.tecnologia?.aplicativosProceso?.responsable || '',
                 detalleCompleto.tecnologia?.aplicativosProceso?.notas || '');

      addDataRow('', '', 'WhatsApp', 
                 detalleCompleto.tecnologia?.whatsapp?.seguimiento || '', 
                 detalleCompleto.tecnologia?.whatsapp?.estado || '', 
                 detalleCompleto.tecnologia?.whatsapp?.responsable || '',
                 detalleCompleto.tecnologia?.whatsapp?.notas || '');

      addDataRow('', '', 'Correos Electrónicos (Condiciones de uso, capacidades)', 
                 detalleCompleto.tecnologia?.correosElectronicos?.seguimiento || '', 
                 detalleCompleto.tecnologia?.correosElectronicos?.estado || '', 
                 detalleCompleto.tecnologia?.correosElectronicos?.responsable || '',
                 detalleCompleto.tecnologia?.correosElectronicos?.notas || '');

      addDataRow('', '', 'Requisitos Grabación de llamada, entrega y resguardo', 
                 detalleCompleto.tecnologia?.requisitosGrabacion?.seguimiento || '', 
                 detalleCompleto.tecnologia?.requisitosGrabacion?.estado || '', 
                 detalleCompleto.tecnologia?.requisitosGrabacion?.responsable || '',
                 detalleCompleto.tecnologia?.requisitosGrabacion?.notas || '');

      // Fusionar células del proceso tecnología
      ws.mergeCells(`B${tecnologiaStartRow}:B${currentRow - 1}`);

      // Proceso: Procesos
      const procesosStartRow = currentRow;
      addDataRow('', 'Procesos', 'Nombrar Responsable de Implementar el Proyecto por el cliente', 
                 detalleCompleto.procesos?.responsableCliente?.seguimiento || '', 
                 detalleCompleto.procesos?.responsableCliente?.estado || '', 
                 detalleCompleto.procesos?.responsableCliente?.responsable || '',
                 detalleCompleto.procesos?.responsableCliente?.notas || '', true, false, 'FFDEEAF6');

      addDataRow('', '', 'Nombrar Responsable de Implementar el Proyecto por parte de Andes BPO', 
                 detalleCompleto.procesos?.responsableAndes?.seguimiento || '', 
                 detalleCompleto.procesos?.responsableAndes?.estado || '', 
                 detalleCompleto.procesos?.responsableAndes?.responsable || '',
                 detalleCompleto.procesos?.responsableAndes?.notas || '');

      addDataRow('', '', 'Responsables de la operación', 
                 detalleCompleto.procesos?.responsablesOperacion?.seguimiento || '', 
                 detalleCompleto.procesos?.responsablesOperacion?.estado || '', 
                 detalleCompleto.procesos?.responsablesOperacion?.responsable || '',
                 detalleCompleto.procesos?.responsablesOperacion?.notas || '');

      addDataRow('', '', 'Listado Reportes de Andes BPO', 
                 detalleCompleto.procesos?.listadoReportes?.seguimiento || '', 
                 detalleCompleto.procesos?.listadoReportes?.estado || '', 
                 detalleCompleto.procesos?.listadoReportes?.responsable || '',
                 detalleCompleto.procesos?.listadoReportes?.notas || '');

      addDataRow('', '', 'Protocolo de Comunicaciones', 
                 detalleCompleto.procesos?.protocoloComunicaciones?.seguimiento || '', 
                 detalleCompleto.procesos?.protocoloComunicaciones?.estado || '', 
                 detalleCompleto.procesos?.protocoloComunicaciones?.responsable || '',
                 detalleCompleto.procesos?.protocoloComunicaciones?.notas || '');

      addDataRow('', '', 'Guiones y/o Protocolos de la atención', 
                 detalleCompleto.procesos?.guionesProtocolos?.seguimiento || '', 
                 detalleCompleto.procesos?.guionesProtocolos?.estado || '', 
                 detalleCompleto.procesos?.guionesProtocolos?.responsable || '',
                 detalleCompleto.procesos?.guionesProtocolos?.notas || '');

      addDataRow('', '', 'Proceso Monitoreo y Calidad Andes BPO', 
                 detalleCompleto.procesos?.procesoMonitoreo?.seguimiento || '', 
                 detalleCompleto.procesos?.procesoMonitoreo?.estado || '', 
                 detalleCompleto.procesos?.procesoMonitoreo?.responsable || '',
                 detalleCompleto.procesos?.procesoMonitoreo?.notas || '');

      addDataRow('', '', 'Cronograma de Tecnología con Tiempos ajustados', 
                 detalleCompleto.procesos?.cronogramaTecnologia?.seguimiento || '', 
                 detalleCompleto.procesos?.cronogramaTecnologia?.estado || '', 
                 detalleCompleto.procesos?.cronogramaTecnologia?.responsable || '',
                 detalleCompleto.procesos?.cronogramaTecnologia?.notas || '');

      addDataRow('', '', 'Cronograma de Capacitaciones con Duraciones y Fechas', 
                 detalleCompleto.procesos?.cronogramaCapacitaciones?.seguimiento || '', 
                 detalleCompleto.procesos?.cronogramaCapacitaciones?.estado || '', 
                 detalleCompleto.procesos?.cronogramaCapacitaciones?.responsable || '',
                 detalleCompleto.procesos?.cronogramaCapacitaciones?.notas || '');

      addDataRow('', '', 'Realización de pruebas', 
                 detalleCompleto.procesos?.realizacionPruebas?.seguimiento || '', 
                 detalleCompleto.procesos?.realizacionPruebas?.estado || '', 
                 detalleCompleto.procesos?.realizacionPruebas?.responsable || '',
                 detalleCompleto.procesos?.realizacionPruebas?.notas || '');

      // Fusionar células del proceso procesos
      ws.mergeCells(`B${procesosStartRow}:B${currentRow - 1}`);

      // Fusionar y aplicar color de fondo para la fase DESARROLLO (filas 14-35)
      ws.mergeCells(`A${desarrolloStartRow}:A${currentRow - 1}`);
      const faseDesarrolloCell = ws.getCell(`A${desarrolloStartRow}`);
      faseDesarrolloCell.value = 'DESARROLLO';
      faseDesarrolloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9CC2E5' } };
      faseDesarrolloCell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Texto blanco para mejor contraste
      faseDesarrolloCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

      // FASE: CIERRE
      const cierreStartRow = currentRow;
      addDataRow('CIERRE', 'Entrega al Área de Servicios', 'Acta de Cierre', 
                 detalleCompleto.contractual?.actaCierre?.seguimiento || '', 
                 detalleCompleto.contractual?.actaCierre?.estado || '', 
                 detalleCompleto.contractual?.actaCierre?.responsable || '',
                 detalleCompleto.contractual?.actaCierre?.notas || '', true, true);

      // Aplicar estilo específico a la celda A36 (CIERRE)
      const cellA36 = ws.getCell('A36');
      cellA36.font = { name: 'Calibri', size: 18, color: { argb: 'FFFFFFFF' } };

      // Generar buffer y descargar
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const nombreArchivo = `Mapa_Implementacion_${detalleCompleto.cliente || implementacion.cliente}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      saveAs(blob, nombreArchivo);
      
      console.log('🟢 Archivo Excel generado exitosamente');
      toast.success('Excel exportado exitosamente', { id: 'excel-export' });
      
    } catch (error) {
      console.error('❌ Error al exportar a Excel:', error);
      toast.error('Error al exportar a Excel', { id: 'excel-export' });
    }
  };

  // Función para resetear el formulario
  const resetFormulario = () => {
    setIsEditMode(false);
    setEditingImplementacion(null);
    setExpandedSections({});
    setFormData({
      cliente: '',
      estado: '',
      proceso: '',
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
  };

  return (
    <div className="container mx-auto px-4">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Implementaciones</h1>
      </div>

      {/* Modal de Nueva/Editar Implementación */}
      <Modal 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false);
          resetFormulario();
        }} 
        title={isEditMode ? `Editar Implementación: ${editingImplementacion?.cliente || ''}` : "Nueva Implementación"}
      >
        <div className="max-h-[80vh] overflow-y-auto">
          {/* Sección inicial */}
          <div className={`rounded-lg p-6 mb-6 ${
            isEditMode 
              ? 'bg-gradient-to-br from-green-50 to-green-100' 
              : 'bg-gradient-to-br from-blue-50 to-blue-100'
          }`}>
            <div className="flex items-center space-x-4 mb-6">
              <div className={`p-3 rounded-lg ${
                isEditMode ? 'bg-green-600' : 'bg-blue-600'
              }`}>
                {isEditMode ? (
                  <FaEdit className="text-white text-xl" />
                ) : (
                  <FaPlus className="text-white text-xl" />
                )}
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  isEditMode ? 'text-green-800' : 'text-blue-800'
                }`}>
                  {isEditMode ? 'Editando Implementación' : 'Información Principal'}
                </h3>
                <p className={`${
                  isEditMode ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {isEditMode 
                    ? 'Modifique los datos de la implementación existente'
                    : 'Complete los datos básicos de la implementación'
                  }
                </p>
              </div>
              {isEditMode && (
                <div className="ml-auto">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Modo Edición
                  </span>
                </div>
              )}
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
                  <option value="TMk">TMk - Telemarketing</option>
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
              onClick={() => {
                setShowModal(false);
                resetFormulario();
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={guardarImplementacion}
              disabled={loadingDetail}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
                loadingDetail 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : isEditMode 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
              }`}
            >
              {loadingDetail ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Cargando...
                </div>
              ) : (
                isEditMode ? 'Actualizar Implementación' : 'Guardar Implementación'
              )}
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
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-8 mb-8 border border-indigo-100 shadow-lg animate-slideDown">
                <div className="flex items-center space-x-6 mb-8">
                  <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                    <FaUsers className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {implementacionDetail.cliente}
                    </h3>
                    <p className="text-lg text-slate-600 font-medium">Información General de la Implementación</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Tarjeta Proceso */}
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md">
                        <FaCogs className="text-white text-xl" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Proceso</p>
                        <p className="text-xl font-bold text-gray-900">{implementacionDetail.proceso}</p>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  </div>

                  {/* Tarjeta Estado General */}
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-md">
                          <FaChartPie className="text-white text-xl" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Estado General</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold shadow-sm ${
                            implementacionDetail.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            implementacionDetail.estado === 'Pendiente' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            implementacionDetail.estado === 'En Proceso' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            implementacionDetail.estado === 'Finalizado' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                            'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {implementacionDetail.estado || 'Sin estado'}
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur animate-pulse"></div>
                        <RuedaProgreso 
                          porcentaje={calcularProgresoTotal()}
                          size={55}
                          strokeWidth={6}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">
                        Progreso: <span className="font-bold text-emerald-600">{calcularProgresoTotal()}%</span> completado
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                        26 subsesiones totales
                      </div>
                    </div>
                    
                    <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-4"></div>
                  </div>

                  {/* Tarjeta ID */}
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
                        <FaHashtag className="text-white text-xl" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">ID de Implementación</p>
                        <p className="text-xl font-bold text-gray-900">#{implementacionDetail.id}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        Identificador único del proyecto
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-4"></div>
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
                    <div className="flex-1">
                      <h4 className="font-bold text-purple-800 text-lg">Contractual</h4>
                      <p className="text-sm text-purple-600">Documentos contractuales</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                            4 elementos
                          </span>
                          {expandedDetailSection === 'contractual' ? (
                            <FaChevronDown className="text-purple-600" />
                          ) : (
                            <FaChevronRight className="text-purple-600" />
                          )}
                        </div>
                        <RuedaProgreso 
                          porcentaje={calcularProgresoSeccion(
                            implementacionDetail.contractual,
                            [
                              { key: 'modeloContrato' },
                              { key: 'modeloConfidencialidad' },
                              { key: 'alcance' },
                              { key: 'fechaInicio' }
                            ]
                          )}
                          size={50}
                        />
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
                    <div className="flex-1">
                      <h4 className="font-bold text-green-800 text-lg">Talento Humano</h4>
                      <p className="text-sm text-green-600">Personal y capacitación</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                            6 elementos
                          </span>
                          {expandedDetailSection === 'talentoHumano' ? (
                            <FaChevronDown className="text-green-600" />
                          ) : (
                            <FaChevronRight className="text-green-600" />
                          )}
                        </div>
                        <RuedaProgreso 
                          porcentaje={calcularProgresoSeccion(
                            implementacionDetail.talento_humano,
                            [
                              { key: 'perfilPersonal' },
                              { key: 'cantidadAsesores' },
                              { key: 'horarios' },
                              { key: 'formador' },
                              { key: 'capacitacionesAndes' },
                              { key: 'capacitacionesCliente' }
                            ]
                          )}
                          size={50}
                        />
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
                    <div className="flex-1">
                      <h4 className="font-bold text-amber-800 text-lg">Procesos</h4>
                      <p className="text-sm text-amber-600">Configuración de procesos</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
                            10 elementos
                          </span>
                          {expandedDetailSection === 'procesos' ? (
                            <FaChevronDown className="text-amber-600" />
                          ) : (
                            <FaChevronRight className="text-amber-600" />
                          )}
                        </div>
                        <RuedaProgreso 
                          porcentaje={calcularProgresoSeccion(
                            implementacionDetail.procesos,
                            [
                              { key: 'responsableCliente' },
                              { key: 'responsableAndes' },
                              { key: 'responsablesOperacion' },
                              { key: 'listadoReportes' },
                              { key: 'protocoloComunicaciones' },
                              { key: 'guionesProtocolos' },
                              { key: 'procesoMonitoreo' },
                              { key: 'cronogramaTecnologia' },
                              { key: 'cronogramaCapacitaciones' },
                              { key: 'realizacionPruebas' }
                            ]
                          )}
                          size={50}
                        />
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
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-800 text-lg">Tecnología</h4>
                      <p className="text-sm text-blue-600">Sistemas y configuración</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                            6 elementos
                          </span>
                          {expandedDetailSection === 'tecnologia' ? (
                            <FaChevronDown className="text-blue-600" />
                          ) : (
                            <FaChevronRight className="text-blue-600" />
                          )}
                        </div>
                        <RuedaProgreso 
                          porcentaje={calcularProgresoSeccion(
                            implementacionDetail.tecnologia,
                            [
                              { key: 'creacionModulo' },
                              { key: 'tipificacionInteracciones' },
                              { key: 'aplicativosProceso' },
                              { key: 'whatsapp' },
                              { key: 'correosElectronicos' },
                              { key: 'requisitosGrabacion' }
                            ]
                          )}
                          size={50}
                        />
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
                              <EstadoEditable 
                                seccion="contractual"
                                campo={item.key}
                                estado={implementacionDetail.contractual?.[item.key]?.estado}
                              />
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
                              <EstadoEditable 
                                seccion="talento_humano"
                                campo={item.key}
                                estado={implementacionDetail.talento_humano?.[item.key]?.estado}
                              />
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
                              <EstadoEditable 
                                seccion="procesos"
                                campo={item.key}
                                estado={implementacionDetail.procesos?.[item.key]?.estado}
                              />
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
                              <EstadoEditable 
                                seccion="tecnologia"
                                campo={item.key}
                                estado={implementacionDetail.tecnologia?.[item.key]?.estado}
                              />
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

      {/* Modal de Confirmación de Eliminación */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={cerrarModalEliminacion} 
        title="Confirmar Eliminación"
        size="medium"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-100 rounded-full">
              <FaTrash className="text-red-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                ¿Estás seguro de eliminar esta implementación?
              </h3>
              <p className="text-gray-600 mt-1">
                Esta acción no se puede deshacer.
              </p>
            </div>
          </div>

          {implementacionToDelete && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <FaUsers className="text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{implementacionToDelete.cliente}</p>
                  <p className="text-sm text-gray-600">
                    Estado: <span className="font-medium">{implementacionToDelete.estado}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Proceso: <span className="font-medium">{implementacionToDelete.proceso}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Para confirmar la eliminación, escribe <span className="font-bold text-red-600">"eliminar"</span>:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Escribe 'eliminar' para confirmar"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              disabled={deletingInProgress}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={cerrarModalEliminacion}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={deletingInProgress}
            >
              Cancelar
            </button>
            <button
              onClick={eliminarImplementacion}
              disabled={deletingInProgress || deleteConfirmText.toLowerCase() !== 'eliminar'}
              className={`px-4 py-2 text-white rounded-lg transition-colors ${
                deletingInProgress || deleteConfirmText.toLowerCase() !== 'eliminar'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {deletingInProgress ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Eliminando...
                </div>
              ) : (
                'Eliminar Definitivamente'
              )}
            </button>
          </div>
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
              {/* TMk */}
              <div className="rounded-lg p-4 bg-gradient-to-r from-green-50 to-green-100 flex items-center justify-between border-2 border-green-400">
                <div>
                  <span className="text-green-700 font-bold text-lg">TMk</span>
                  <p className="text-gray-500 text-sm">Telemarketing</p>
                </div>
                <span className="text-green-700 text-2xl font-bold">{implementaciones.filter(imp => imp.proceso === 'TMk').length}</span>
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
              onClick={() => {
                resetFormulario();
                setShowModal(true);
              }}
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
                  <div className="flex items-center justify-center gap-2">
                    <FaChartPie className="text-emerald-500" />
                    Progreso
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
                          implementacion.proceso === 'TMk' ? 'bg-green-100 text-green-800' :
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
                      <ProgresoImplementacionCelda implementacion={implementacion} />
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => abrirModalEdicion(implementacion)}
                          className="inline-flex items-center px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Editar implementación"
                        >
                          <FaEdit className="mr-1.5" size={12} />
                          Editar
                        </button>
                        <button
                          onClick={() => abrirModalEliminacion(implementacion)}
                          className="inline-flex items-center px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Eliminar implementación"
                        >
                          <FaTrash className="mr-1.5" size={12} />
                          Eliminar
                        </button>
                        <button
                          onClick={() => exportarImplementacionExcel(implementacion)}
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
                  <td colSpan={5} className="px-6 py-12 text-center">
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
