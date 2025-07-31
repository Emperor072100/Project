import React from 'react';
import { Proyecto } from '../views';
import { 
  FaProjectDiagram, 
  FaChartLine
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

const KPIs: React.FC<KPIsProps> = ({ proyectos }) => {
  const total = proyectos.length;

  const promedioAvance = total > 0
    ? Math.round(proyectos.reduce((sum, p) => sum + (p.progreso || 0), 0) / total)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-4">
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
    </div>
  );
};

export default KPIs;