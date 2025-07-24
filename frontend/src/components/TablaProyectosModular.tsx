// components/TablaProyectos.tsx
import React, { useState, useMemo } from 'react';
import { Proyecto } from '../views';
import { useNavigate } from 'react-router-dom';
import PanelDetalleProyecto from './PanelDetalleProyecto';
import NuevoProyecto from './NuevoProyecto';
import CustomTable from './CustomTable';
import { toast } from 'react-hot-toast';

interface TablaProyectosProps {
  proyectos: Proyecto[];
  editando: { id: number | null; campo: string | null };
  handleEdit: (id: number, campo: keyof Proyecto) => void;
  handleSave: (id: number, campo: keyof Proyecto, valor: any) => void;
  getColorEstado: (estado: string) => string;
  getColorPrioridad: (prioridad: string) => string;
  filtrarProyectos: () => Proyecto[];
  onVerDetalle: (proyecto: Proyecto) => void;
  onEliminar?: (id: number) => void;
}

const TablaProyectos: React.FC<TablaProyectosProps> = ({
  proyectos,
  editando,
  handleEdit,
  handleSave,
  getColorEstado,
  getColorPrioridad,
  filtrarProyectos,
  onVerDetalle,
  onEliminar
}) => {
  const navigate = useNavigate();
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null);

  // Configuración de columnas para la tabla modular
  const tableColumns = useMemo(() => [
    {
      value: 'nombre',
      text: 'Nombre',
      selected: true,
      fixed: true,
      type: 'text' as const
    },
    {
      value: 'responsable_nombre',
      text: 'Responsable',
      selected: true,
      type: 'text' as const
    },
    {
      value: 'estado',
      text: 'Estado',
      selected: true,
      type: 'text' as const
    },
    {
      value: 'tipo',
      text: 'Tipo',
      selected: true,
      type: 'text' as const
    },
    {
      value: 'equipo',
      text: 'Equipo',
      selected: true,
      type: 'text' as const
    },
    {
      value: 'prioridad',
      text: 'Prioridad',
      selected: true,
      type: 'text' as const
    },
    {
      value: 'objetivo',
      text: 'Objetivo',
      selected: true,
      type: 'text' as const
    },
    {
      value: 'fechaInicio',
      text: 'Fecha Inicio',
      selected: true,
      type: 'text' as const
    },
    {
      value: 'fechaFin',
      text: 'Fecha Fin',
      selected: true,
      type: 'text' as const
    },
    {
      value: 'progreso',
      text: 'Progreso',
      selected: true,
      type: 'text' as const
    },
    {
      value: 'enlace',
      text: 'Enlace',
      selected: false,
      type: 'text' as const
    },
    {
      value: 'observaciones',
      text: 'Observaciones',
      selected: false,
      type: 'text' as const
    },
    {
      value: 'acciones',
      text: 'Acciones',
      selected: true,
      fixed: true,
      type: 'actions' as const
    }
  ], []);

  // Manejar la creación de un nuevo proyecto
  const handleProyectoCreado = () => {
    toast.success("Proyecto creado exitosamente");
  };

  // Manejar acciones de la tabla
  const handleTableAction = (action: string, row: Proyecto) => {
    switch (action) {
      case 'ver':
        setProyectoSeleccionado(row);
        onVerDetalle(row);
        break;
      case 'edit':
        navigate(`/proyecto/${row.id}`);
        break;
      case 'delete':
        if (onEliminar) {
          onEliminar(row.id);
        }
        break;
      default:
        break;
    }
  };

  // Adapter functions for CustomTable compatibility
  const adaptedHandleEdit = (id: number, campo: string) => {
    handleEdit(id, campo as keyof Proyecto);
  };

  const adaptedHandleSave = (id: number, campo: string, valor: any) => {
    handleSave(id, campo as keyof Proyecto, valor);
  };

  return (
    <>
      {/* Header con botón de nuevo proyecto */}
      <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
        <div className="flex flex-wrap gap-2">
          <h2 className="text-xl font-semibold text-gray-800">Gestión de Proyectos</h2>
        </div>
        
        <div>
          <NuevoProyecto onCreado={handleProyectoCreado} />
        </div>
      </div>

      {/* Tabla Modular */}
      <CustomTable
        tableOptions={tableColumns}
        paginatedData={filtrarProyectos()}
        tableId="proyectos-table"
        onAction={handleTableAction}
        onEdit={adaptedHandleEdit}
        onSave={adaptedHandleSave}
        editando={editando}
        getColorEstado={getColorEstado}
        getColorPrioridad={getColorPrioridad}
      />

      {/* Panel de Detalle Modal */}
      {proyectoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setProyectoSeleccionado(null)}
          ></div>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10">
            <PanelDetalleProyecto
              proyecto={proyectoSeleccionado}
              onClose={() => setProyectoSeleccionado(null)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TablaProyectos;
