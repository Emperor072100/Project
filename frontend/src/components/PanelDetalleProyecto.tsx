// src/components/PanelDetalleProyecto.tsx
import React from 'react';
import { Proyecto } from '../views';

interface PanelDetalleProyectoProps {
  proyecto: Proyecto;
  onClose: () => void;
}

const PanelDetalleProyecto: React.FC<PanelDetalleProyectoProps> = ({ proyecto, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Detalles del Proyecto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
              <p className="mt-1 text-sm text-gray-900">{proyecto.nombre}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Responsable</h3>
              <p className="mt-1 text-sm text-gray-900">
                {proyecto.responsable_nombre || 'Sin asignar'}
              </p>
            </div>
            {/* Add more project details as needed */}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanelDetalleProyecto;