import React from 'react';
import { Proyecto } from '../views';
import { 
  FaProjectDiagram, 
  FaChartLine, 
  FaExclamationTriangle,
  FaListAlt
} from 'react-icons/fa';

interface KPIsProps {
  proyectos: Proyecto[];
}

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color, trend }) => (
  <div className={`flex items-center justify-between min-h-[6rem] bg-white px-4 py-3 rounded-xl border ${color} shadow-sm hover:shadow transition duration-200`}>
    <div className="flex flex-col">
      <span className="text-sm text-gray-500 font-medium">{title}</span>
      <span className="text-xl font-bold text-gray-800">{value}</span>
      {trend !== undefined && (
        <span className={`text-xs mt-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="p-2 rounded-md bg-gray-100">
      {icon}
    </div>
  </div>
);

// Componente especial para la tarjeta de resumen
const ResumenCard: React.FC<{ pendientes: number; enCurso: number; completados: number; total: number }> = ({ pendientes, enCurso, completados, total }) => (
  <div className="flex items-center justify-between min-h-[6rem] bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow transition duration-200">
    <div className="flex flex-col w-full">
      <span className="text-sm text-gray-500 font-medium mb-1">Resumen de Proyectos</span>
      <div className="flex items-center justify-between text-xs space-x-3">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span className="text-yellow-700 font-semibold">{pendientes}</span>
          <span className="text-yellow-600 text-xs">Pendiente</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-blue-700 font-semibold">{enCurso}</span>
          <span className="text-blue-600 text-xs">En Curso</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-700 font-semibold">{completados}</span>
          <span className="text-green-600 text-xs">Completado</span>
        </div>
      </div>
    </div>
    <div className="p-2 rounded-md bg-gray-100">
      <FaListAlt className="w-5 h-5 text-purple-400" />
    </div>
  </div>
);

const KPIs: React.FC<KPIsProps> = ({ proyectos }) => {
  const total = proyectos.length;

  const promedioAvance = total > 0
    ? Math.round(proyectos.reduce((sum, p) => sum + (p.progreso || 0), 0) / total)
    : 0;

  const prioridadAlta = proyectos.filter(p => p.prioridad === 'Alta').length;

  // Contar proyectos por categoría de estado (similar a TarjetasInformativas)
  const contarProyectosPorCategoria = () => {
    const estadosPendientes = ['conceptual', 'análisis', 'analisis', 'sin empezar', 'pendiente'];
    const estadosEnCurso = ['diseño', 'desarrollo', 'curso', 'pruebas', 'proceso'];
    const estadosCompletados = ['cancelado', 'pausado', 'producción', 'produccion', 'desarrollado', 'listo', 'completado', 'terminado'];

    const pendientes = proyectos.filter(p => 
      estadosPendientes.some(keyword => p.estado?.toLowerCase().includes(keyword))
    ).length;

    const enCurso = proyectos.filter(p => 
      estadosEnCurso.some(keyword => p.estado?.toLowerCase().includes(keyword))
    ).length;

    const completados = proyectos.filter(p => 
      estadosCompletados.some(keyword => p.estado?.toLowerCase().includes(keyword))
    ).length;

    return { pendientes, enCurso, completados };
  };

  const { pendientes, enCurso, completados } = contarProyectosPorCategoria();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pr-4">
      <KPICard
        title="Total Proyectos"
        value={total}
        icon={<FaProjectDiagram className="w-5 h-5 text-green-400" />}
        color="border-gray-200"
      />
      <KPICard
        title="Promedio de Avance"
        value={`${promedioAvance}%`}
        icon={<FaChartLine className="w-5 h-5 text-blue-400" />}
        color="border-gray-200"
        trend={5}
      />
      <KPICard
        title="Prioridad Alta"
        value={prioridadAlta}
        icon={<FaExclamationTriangle className="w-5 h-5 text-red-400" />}
        color="border-gray-200"
      />
      <ResumenCard 
        pendientes={pendientes}
        enCurso={enCurso}
        completados={completados}
        total={total}
      />
    </div>
  );
};

export default KPIs;