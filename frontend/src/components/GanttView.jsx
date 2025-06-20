import React, { useState, useEffect } from 'react';
import { useProyectos } from '../context/ProyectosContext';

const GanttView = () => {
  const { proyectos, loading } = useProyectos();
  const [timeRange, setTimeRange] = useState('quarter'); // 'month', 'quarter', 'year'
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Función para añadir días a una fecha
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // Función para formatear fechas
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para formatear fechas cortas (para mostrar en las barras)
  const formatShortDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Función para formatear mes
  const formatMonth = (date) => {
    return date.toLocaleDateString('es-ES', { month: 'short' });
  };

  // Función para calcular la diferencia en días entre dos fechas
  const diffDays = (date1, date2) => {
    const diffTime = Math.abs(date2 - date1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    // Ajustar el rango de fechas según la selección
    const today = new Date();
    
    switch(timeRange) {
      case 'month':
        setStartDate(today);
        setEndDate(addDays(today, 30));
        break;
      case 'quarter':
        setStartDate(today);
        setEndDate(addDays(today, 90));
        break;
      case 'year':
        setStartDate(today);
        setEndDate(addDays(today, 365));
        break;
      default:
        setStartDate(today);
        setEndDate(addDays(today, 90));
    }
  }, [timeRange]);

  // Generar los días para el encabezado del Gantt
  const generateDays = () => {
    const days = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    return days;
  };

  // Calcular la posición y ancho de la barra de proyecto
  const calculateBarPosition = (proyecto) => {
    // Asegurarse de que las fechas son objetos Date
    const fechaInicio = proyecto.fechaInicioObj || new Date(proyecto.fechaInicio);
    const fechaFin = proyecto.fechaFinObj || new Date(proyecto.fechaFin);
    
    // Verificar si el proyecto está dentro del rango visible
    if (fechaFin < startDate || fechaInicio > endDate) {
      return { left: 0, width: 0, visible: false };
    }
    
    // Calcular fecha de inicio visible (la más tardía entre la fecha de inicio del proyecto y startDate)
    const visibleStartDate = fechaInicio < startDate ? startDate : fechaInicio;
    
    // Calcular fecha de fin visible (la más temprana entre la fecha de fin del proyecto y endDate)
    const visibleEndDate = fechaFin > endDate ? endDate : fechaFin;
    
    // Calcular posición izquierda (días desde startDate hasta el inicio visible)
    const leftDays = diffDays(startDate, visibleStartDate);
    
    // Calcular ancho (días desde inicio visible hasta fin visible)
    const widthDays = diffDays(visibleStartDate, visibleEndDate) + 1;
    
    return {
      left: `${leftDays * 40}px`,
      width: `${widthDays * 40}px`,
      visible: true,
      startOutOfRange: fechaInicio < startDate,
      endOutOfRange: fechaFin > endDate
    };
  };

  // Obtener el color de fondo según el estado
  const getColorEstado = (estado) => {
    switch (estado) {
      case 'En producción':
      case 'Desarrollado':
        return 'bg-green-100 text-green-800';
      case 'En desarrollo':
      case 'En diseño':
      case 'En curso':
      case 'Etapa pruebas':
        return 'bg-blue-100 text-blue-800';
      case 'Pausado':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  const days = generateDays();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-600">Vista Gantt de Proyectos</h1>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-md ${timeRange === 'month' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Mes
          </button>
          <button 
            onClick={() => setTimeRange('quarter')}
            className={`px-4 py-2 rounded-md ${timeRange === 'quarter' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Trimestre
          </button>
          <button 
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 rounded-md ${timeRange === 'year' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Año
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-600">
          Periodo: <span className="font-semibold">{formatDate(startDate)} - {formatDate(endDate)}</span>
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <div className="gantt-container" style={{ minWidth: `${days.length * 40 + 300}px` }}>
          {/* Cabecera con información de proyectos */}
          <div className="flex border-b border-gray-200">
            <div className="w-72 flex-shrink-0 p-2 font-semibold bg-gray-100">Proyecto</div>
            <div className="w-36 flex-shrink-0 p-2 font-semibold bg-gray-100">Responsable</div>
            <div className="w-28 flex-shrink-0 p-2 font-semibold bg-gray-100">Estado</div>
            <div className="w-24 flex-shrink-0 p-2 font-semibold bg-gray-100">Progreso</div>
            <div className="flex-grow"></div>
          </div>
          
          {/* Cabecera con días */}
          <div className="flex border-b border-gray-200">
            <div className="w-72 flex-shrink-0"></div>
            <div className="w-36 flex-shrink-0"></div>
            <div className="w-28 flex-shrink-0"></div>
            <div className="w-24 flex-shrink-0"></div>
            <div className="flex">
              {days.map((day, index) => (
                <div 
                  key={index} 
                  className={`w-10 flex-shrink-0 p-1 text-center text-xs border-r border-gray-200 ${
                    day.getDate() === 1 ? 'bg-gray-100 font-semibold' : ''
                  } ${
                    day.getDay() === 0 || day.getDay() === 6 ? 'bg-gray-50' : ''
                  }`}
                >
                  {day.getDate() === 1 ? formatMonth(day) : ''}
                  <div className={day.getDate() === 1 ? 'mt-1' : ''}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Filas de proyectos */}
          {proyectos.map((proyecto) => {
            const barPosition = calculateBarPosition(proyecto);
            
            return (
              <div key={proyecto.id} className="flex border-b border-gray-200 hover:bg-gray-50">
                <div className="w-72 flex-shrink-0 p-2 font-medium">{proyecto.nombre}</div>
                <div className="w-36 flex-shrink-0 p-2 text-sm">{proyecto.responsable_nombre || proyecto.responsable}</div>
                <div className="w-28 flex-shrink-0 p-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getColorEstado(proyecto.estado)}`}>
                    {proyecto.estado}
                  </span>
                </div>
                <div className="w-24 flex-shrink-0 p-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${proyecto.progreso}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-center mt-1">{proyecto.progreso}%</div>
                </div>
                <div className="flex-grow relative">
                  {barPosition.visible && (
                    <div 
                      className="absolute top-2 h-8 rounded-md flex items-center justify-center text-xs text-white font-medium group"
                      style={{ 
                        left: barPosition.left, 
                        width: barPosition.width,
                        backgroundColor: proyecto.color || '#4CAF50',
                        opacity: barPosition.startOutOfRange || barPosition.endOutOfRange ? 0.7 : 1
                      }}
                    >
                      {barPosition.startOutOfRange && <span className="absolute -left-1 top-0 bottom-0 w-2 bg-gradient-to-r from-white to-transparent"></span>}
                      {barPosition.endOutOfRange && <span className="absolute -right-1 top-0 bottom-0 w-2 bg-gradient-to-l from-white to-transparent"></span>}
                      
                      {/* Fechas de inicio y fin */}
                      <div className="flex justify-between w-full px-2 absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-gray-800 text-white px-1 py-0.5 rounded text-xs whitespace-nowrap">
                          Inicio: {formatShortDate(proyecto.fechaInicioObj || new Date(proyecto.fechaInicio))}
                        </span>
                        <span className="bg-gray-800 text-white px-1 py-0.5 rounded text-xs whitespace-nowrap">
                          Fin: {formatShortDate(proyecto.fechaFinObj || new Date(proyecto.fechaFin))}
                        </span>
                      </div>
                      
                      {proyecto.nombre}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="text-sm font-medium">Leyenda:</div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-sm bg-green-500 mr-2"></div>
          <span className="text-sm">Completado</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-sm bg-blue-500 mr-2"></div>
          <span className="text-sm">En desarrollo</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-sm bg-yellow-500 mr-2"></div>
          <span className="text-sm">Pausado</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-sm bg-gray-500 mr-2"></div>
          <span className="text-sm">Sin empezar</span>
        </div>
      </div>
    </div>
  );
};

export default GanttView;