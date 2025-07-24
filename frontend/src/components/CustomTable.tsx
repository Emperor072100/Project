import React, { useState, useEffect, useMemo, useRef } from 'react';
import TableSettingsModal from './TableSettingsModal';
import { FaCog, FaEye, FaEdit, FaTrash } from 'react-icons/fa';

interface TableColumn {
  value: string;
  text: string;
  selected: boolean;
  fixed?: boolean;
  type?: 'text' | 'relation' | 'calculated' | 'actions';
  relationField?: string;
  calculation?: string;
}

interface CustomTableProps {
  tableOptions: TableColumn[];
  paginatedData: any[];
  tableId: string;
  onAction: (action: string, row: any) => void;
  onEdit?: (id: number, campo: string) => void;
  onSave?: (id: number, campo: string, valor: any) => void;
  editando?: { id: number | null; campo: string | null };
  getColorEstado?: (estado: string) => string;
  getColorPrioridad?: (prioridad: string) => string;
}

const CustomTable: React.FC<CustomTableProps> = ({ 
  tableOptions: initialOptions, 
  paginatedData, 
  tableId, 
  onAction,
  onEdit,
  onSave,
  editando,
  getColorEstado,
  getColorPrioridad
}) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [tableOptions, setTableOptions] = useState<TableColumn[]>([]);
  const [columnSizingMode, setColumnSizingMode] = useState('estaticas');
  const [columnResizing, setColumnResizing] = useState<Record<string, { width: number; isResizing: boolean }>>({});
  const [columnOriginalWidths, setColumnOriginalWidths] = useState<Record<string, number>>({});
  const [isResizing, setIsResizing] = useState(false);
  const [currentColumn, setCurrentColumn] = useState<number | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedOptions = localStorage.getItem(`${tableId}_table_settings`);
    const savedMode = localStorage.getItem(`${tableId}_column_sizing_mode`);
    const savedResizing = localStorage.getItem(`${tableId}_column_resizing`);
    const savedOriginalWidths = localStorage.getItem(`${tableId}_column_original_widths`);

    let opts = JSON.parse(JSON.stringify(initialOptions));

    if (savedOptions) {
      try {
        const parsed = JSON.parse(savedOptions);
        parsed.forEach((saved: TableColumn) => {
          const match = opts.find((o: TableColumn) => o.value === saved.value);
          if (match) match.selected = saved.selected;
        });
      } catch (e) {
        console.error('Error parsing saved options:', e);
      }
    }

    setTableOptions(opts);
    
    if (savedMode) {
      setColumnSizingMode(savedMode);
    }
    
    if (savedResizing) {
      try {
        setColumnResizing(JSON.parse(savedResizing));
      } catch (e) {
        console.error('Error parsing saved resizing:', e);
      }
    }
    
    if (savedOriginalWidths) {
      try {
        setColumnOriginalWidths(JSON.parse(savedOriginalWidths));
      } catch (e) {
        console.error('Error parsing saved widths:', e);
      }
    }
  }, [initialOptions, tableId]);

  // Visible columns
  const allVisibleColumns = useMemo(() => {
    return tableOptions.filter(opt => opt.selected || opt.fixed);
  }, [tableOptions]);

  // Save settings
  const updateTableSettings = () => {
    localStorage.setItem(`${tableId}_table_settings`, JSON.stringify(tableOptions));
    localStorage.setItem(`${tableId}_column_sizing_mode`, columnSizingMode);
    localStorage.setItem(`${tableId}_column_resizing`, JSON.stringify(columnResizing));
    localStorage.setItem(`${tableId}_column_original_widths`, JSON.stringify(columnOriginalWidths));
  };

  // Resize logic
  const startResize = (e: React.MouseEvent, columnIndex: number) => {
    if (columnSizingMode !== 'redimensionables') return;
    
    const startX = e.clientX;
    const th = (e.target as HTMLElement).closest('th');
    if (!th) return;
    
    const startWidth = th.offsetWidth;
    const columnKey = allVisibleColumns[columnIndex].value;
    
    setIsResizing(true);
    setCurrentColumn(columnIndex);

    // Guardar anchos originales si no existen
    if (!columnOriginalWidths[columnKey]) {
      const newOriginalWidths = { ...columnOriginalWidths };
      allVisibleColumns.forEach((col, index) => {
        const thEl = tableRef.current?.querySelector(`th:nth-child(${index + 1})`) as HTMLElement;
        if (thEl) {
          newOriginalWidths[col.value] = thEl.offsetWidth;
        }
      });
      setColumnOriginalWidths(newOriginalWidths);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      const newWidth = Math.max(80, startWidth + diff); // Ancho mínimo aumentado

      setColumnResizing(prev => ({
        ...prev,
        [columnKey]: {
          width: newWidth,
          isResizing: true
        }
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setCurrentColumn(null);
      setHoveredColumn(null);
      
      // Actualizar configuraciones después del redimensionamiento
      setTimeout(() => {
        updateTableSettings();
      }, 100);
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
    e.stopPropagation();
  };

  // Display logic
  const getDisplayValue = (row: any, option: TableColumn) => {
    if (option.value === 'acciones') return '';
    
    if (option.type === 'relation' && option.relationField) {
      const fields = option.relationField.split('.');
      return fields.reduce((val, key) => (val && val[key] !== undefined ? val[key] : '-'), row);
    }
    
    if (option.type === 'calculated') {
      switch (option.calculation) {
        case 'count_asesores':
          return row.asesores ? row.asesores.length : 0;
        case 'count_contratos':
          return row.contratos ? row.contratos.length : 0;
        case 'sum_valor':
          return row.contratos?.reduce((sum: number, c: any) => sum + (parseFloat(c.valor) || 0), 0) || 0;
        case 'count_activos':
          return row.contratos?.filter((c: any) => c.estado === 'activo').length || 0;
        default:
          return '-';
      }
    }
    
    return row[option.value] ?? '-';
  };

  const getColumnStyle = (option: TableColumn) => {
    const key = option.value;
    if (columnSizingMode === 'redimensionables') {
      const resized = columnResizing[key]?.width;
      const original = columnOriginalWidths[key];
      const width = resized || original || 100;
      return {
        width: `${width}px`,
        minWidth: `${width}px`,
        maxWidth: `${width}px`,
      };
    }
    return { width: 'auto' };
  };

  const handleAction = (action: string, row: any) => {
    if (typeof onAction === 'function') onAction(action, row);
  };

  const renderCellContent = (row: any, col: TableColumn) => {
    if (col.value === 'acciones') {
      return (
        <div className="flex items-center gap-2">
          <button 
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-colors duration-200"
            title="Ver"
            onClick={() => handleAction('ver', row)}
          >
            <FaEye className="w-3 h-3" />
          </button>
          <button 
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-green-50 text-green-700 hover:bg-green-100 text-sm font-medium transition-colors duration-200"
            title="Editar"
            onClick={() => handleAction('edit', row)}
          >
            <FaEdit className="w-3 h-3" />
          </button>
          <button 
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium transition-colors duration-200"
            title="Eliminar"
            onClick={() => handleAction('delete', row)}
          >
            <FaTrash className="w-3 h-3" />
          </button>
        </div>
      );
    }

    // Handle editable fields
    if (editando?.id === row.id && editando?.campo === col.value && onSave) {
      if (col.value === 'estado') {
        return (
          <select
            value={getDisplayValue(row, col)}
            onChange={(e) => onSave(row.id, col.value, e.target.value)}
            className="border p-1 rounded w-full text-xs"
          >
            <option value="Sin Empezar">Sin Empezar</option>
            <option value="En curso">En curso</option>
            <option value="Completado">Completado</option>
            <option value="Pausado">Pausado</option>
          </select>
        );
      }
      
      if (col.value === 'prioridad') {
        return (
          <select
            value={getDisplayValue(row, col)}
            onChange={(e) => onSave(row.id, col.value, e.target.value)}
            className="border p-1 rounded w-full text-xs"
          >
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        );
      }

      return (
        <input
          type="text"
          value={getDisplayValue(row, col)}
          onChange={(e) => onSave(row.id, col.value, e.target.value)}
          className="border p-1 rounded w-full text-xs"
          autoFocus
        />
      );
    }

    // Display logic for specific columns
    const value = getDisplayValue(row, col);
    
    if (col.value === 'estado' && getColorEstado) {
      return (
        <span
          className={`${getColorEstado(value)} px-2 py-1 rounded-full text-xs cursor-pointer`}
          onClick={() => onEdit?.(row.id, col.value)}
        >
          {value}
        </span>
      );
    }
    
    if (col.value === 'prioridad' && getColorPrioridad) {
      return (
        <span
          className={`${getColorPrioridad(value)} px-2 py-1 rounded-full text-xs cursor-pointer`}
          onClick={() => onEdit?.(row.id, col.value)}
        >
          {value}
        </span>
      );
    }

    if (col.value === 'progreso') {
      return (
        <div className="w-full">
          <div className="flex justify-between text-xs mb-1">
            <span>{value}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${value}%` }}
            ></div>
          </div>
        </div>
      );
    }

    return (
      <span
        className="cursor-pointer"
        onClick={() => onEdit?.(row.id, col.value)}
      >
        {Array.isArray(value) ? value.join(', ') : value}
      </span>
    );
  };

  return (
    <div className="custom-table-wrapper">
      <div className="table-settings-wrap mb-4">
        <div className={`table-settings ${settingsVisible ? 'active' : ''}`}>
          <button 
            className="settings-btn bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            onClick={() => setShowColumnModal(true)}
          >
            <FaCog className="w-4 h-4" />
            Configurar Columnas
          </button>
        </div>
      </div>

      <div className="table-scroll-container overflow-x-auto rounded-xl shadow-lg border border-gray-300">
        <table
          ref={tableRef}
          className={`custom-table min-w-full text-xs text-left bg-white ${isResizing ? 'resizing' : ''}`}
          data-sizing-mode={columnSizingMode}
          style={{
            tableLayout: columnSizingMode === 'redimensionables' ? 'fixed' : 'auto',
            minWidth: '800px',
            width: columnSizingMode === 'redimensionables' ? 'auto' : '100%',
          }}
        >
          <colgroup>
            {allVisibleColumns.map((col) => (
              <col key={col.value} style={getColumnStyle(col)} />
            ))}
          </colgroup>

          <thead 
            className="bg-gradient-to-r from-green-500 to-green-600 text-white sticky top-0 z-10"
            onClick={() => !isResizing && setSettingsVisible(prev => !prev)}
          >
            <tr>
              {allVisibleColumns.map((col, index) => (
                <th
                  key={col.value}
                  className={`resizable-header px-4 py-2 font-semibold text-xs tracking-wide relative ${isResizing && currentColumn === index ? 'column-resizing' : ''}`}
                >
                  {col.text}
                  {columnSizingMode === 'redimensionables' && 
                   col.value !== 'acciones' && 
                   index < allVisibleColumns.length - 1 && (
                    <div
                      className="column-resizer absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-green-400 hover:opacity-100 opacity-0 transition-all duration-150"
                      onMouseDown={(e) => startResize(e, index)}
                      onMouseEnter={() => setHoveredColumn(index)}
                      onMouseLeave={() => setHoveredColumn(null)}
                      style={{
                        backgroundColor: hoveredColumn === index ? '#10b981' : 'transparent',
                        opacity: hoveredColumn === index || currentColumn === index ? 1 : 0
                      }}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row) => (
              <tr 
                key={row.id}
                className="hover:bg-green-50/50 transition-all duration-200"
              >
                {allVisibleColumns.map((col) => (
                  <td key={col.value} className="px-4 py-3 whitespace-normal">
                    {renderCellContent(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showColumnModal && (
        <TableSettingsModal
          tableOptions={tableOptions}
          setTableOptions={setTableOptions}
          columnSizingMode={columnSizingMode}
          setColumnSizingMode={setColumnSizingMode}
          closeModal={() => setShowColumnModal(false)}
          updateTableSettings={updateTableSettings}
        />
      )}

      <style>
        {`
        .resizing {
          user-select: none;
          cursor: col-resize !important;
        }
        .resizing * {
          cursor: col-resize !important;
        }
        .column-resizer {
          transition: background-color 0.15s ease, opacity 0.15s ease;
          z-index: 10;
        }
        .column-resizer:hover {
          background-color: #10b981 !important;
          opacity: 1 !important;
        }
        .column-resizing {
          background-color: rgba(34, 197, 94, 0.2) !important;
        }
        .resizable-header {
          position: relative;
        }
        .resizable-header:hover .column-resizer {
          opacity: 0.7;
        }
        table.custom-table {
          border-collapse: separate;
          border-spacing: 0;
        }
        .custom-table th {
          position: relative;
          border-right: 1px solid rgba(255, 255, 255, 0.2);
        }
        .custom-table th:last-child {
          border-right: none;
        }
        `}
      </style>
    </div>
  );
};

export default CustomTable;
