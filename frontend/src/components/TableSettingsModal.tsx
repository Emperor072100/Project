import React, { useState, useEffect, useRef } from 'react';

interface TableColumn {
  value: string;
  text: string;
  selected: boolean;
  fixed?: boolean;
  type?: 'text' | 'relation' | 'calculated' | 'actions';
  relationField?: string;
  calculation?: string;
}

interface TableSettingsModalProps {
  tableOptions: TableColumn[];
  setTableOptions: React.Dispatch<React.SetStateAction<TableColumn[]>>;
  columnSizingMode: string;
  setColumnSizingMode: React.Dispatch<React.SetStateAction<string>>;
  closeModal: () => void;
  updateTableSettings: () => void;
}

const TableSettingsModal: React.FC<TableSettingsModalProps> = ({
  tableOptions,
  setTableOptions,
  columnSizingMode,
  setColumnSizingMode,
  closeModal,
  updateTableSettings
}) => {
  const [optionsCopy, setOptionsCopy] = useState<TableColumn[]>([]);
  const draggedIndex = useRef<number | null>(null);

  useEffect(() => {
    setOptionsCopy([...tableOptions]);
  }, [tableOptions]);

  const handleToggle = (index: number) => {
    const updated = [...optionsCopy];
    if (!updated[index].fixed) {
      updated[index].selected = !updated[index].selected;
    }
    setOptionsCopy(updated);
  };

  const handleDragStart = (index: number) => {
    draggedIndex.current = index;
  };

  const handleDrop = (index: number) => {
    if (draggedIndex.current === null) return;

    const updated = [...optionsCopy];
    const [draggedItem] = updated.splice(draggedIndex.current, 1);
    updated.splice(index, 0, draggedItem);

    draggedIndex.current = null;
    setOptionsCopy(updated);
  };

  const handleSave = () => {
    setTableOptions(optionsCopy);
    updateTableSettings();
    closeModal();
  };

  const handleCancel = () => {
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Configuración de Tabla
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Column visibility and ordering */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Columnas Visibles
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Selecciona las columnas que quieres mostrar y arrastra para reordenar.
            </p>
            
            <div className="columns-list space-y-2 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {optionsCopy.map((col, index) => (
                <div
                  key={col.value}
                  className={`column-item flex items-center p-2 border rounded-md ${
                    col.fixed 
                      ? 'bg-gray-100 border-gray-300 cursor-default' 
                      : 'bg-white border-gray-200 cursor-move hover:border-green-300'
                  }`}
                  draggable={!col.fixed}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                >
                  <input
                    type="checkbox"
                    checked={col.selected || col.fixed}
                    disabled={col.fixed}
                    onChange={() => handleToggle(index)}
                    className="mr-3 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className={`flex-grow text-sm ${col.fixed ? 'text-gray-500' : 'text-gray-800'}`}>
                    {col.text}
                  </span>
                  {col.fixed && (
                    <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                      Fijo
                    </span>
                  )}
                  {!col.fixed && (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Column sizing mode */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Modo de Tamaño de Columnas
            </h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="estaticas"
                  checked={columnSizingMode === 'estaticas'}
                  onChange={(e) => setColumnSizingMode(e.target.value)}
                  className="mr-2 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span className="text-sm text-gray-800">Estáticas</span>
                <span className="text-xs text-gray-500 ml-2">
                  (Tamaño automático basado en contenido)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="redimensionables"
                  checked={columnSizingMode === 'redimensionables'}
                  onChange={(e) => setColumnSizingMode(e.target.value)}
                  className="mr-2 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span className="text-sm text-gray-800">Redimensionables</span>
                <span className="text-xs text-gray-500 ml-2">
                  (Permite ajustar ancho de columnas manualmente)
                </span>
              </label>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Instrucciones:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Marca/desmarca las casillas para mostrar/ocultar columnas</li>
              <li>• Arrastra los elementos para reordenar las columnas</li>
              <li>• Las columnas fijas no se pueden ocultar ni reordenar</li>
              <li>• En modo redimensionable, arrastra los bordes de las columnas para ajustar el ancho</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableSettingsModal;
