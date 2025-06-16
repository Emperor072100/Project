// components/TablaProyectos.tsx
import React from 'react';
import { Proyecto } from '../views';
import { useNavigate } from 'react-router-dom';

interface TablaProyectosProps {
  proyectos: Proyecto[];
  editando: { id: number | null; campo: string | null };
  handleEdit: (id: number, campo: string) => void;
  handleSave: (id: number, campo: keyof Proyecto, valor: any) => void;
  getColorEstado: (estado: string) => string;
  getColorPrioridad: (prioridad: string) => string;
  filtrarProyectos: () => Proyecto[];
}

const opcionesTipo = ['Otro', 'Informe', 'Automatización', 'Desarrollo'];
const opcionesEquipo = [
  'Dirección TI',
  'Estrategia CX',
  'Dirección Financiera',
  'Dirección de Servicios',
  'Dirección Comercial',
  'Dirección GH',
  'Desarrollo CX'
];
const opcionesPrioridad = ['Alta', 'Media', 'Baja'];
const opcionesEstado = {
  pendientes: ['Conceptual', 'Análisis', 'Sin Empezar'],
  enProceso: ['En diseño', 'En desarrollo', 'En curso', 'Etapa pruebas'],
  terminados: ['Cancelado', 'Pausado', 'En producción', 'Desarrollado']
};

const formatArrayOrString = (value: string[] | string | undefined): string => {
  if (!value) return '';
  if (Array.isArray(value)) return value.join(', ');
  return value;
};

const TablaProyectos: React.FC<TablaProyectosProps> = ({
  proyectos,
  editando,
  handleEdit,
  handleSave,
  getColorEstado,
  getColorPrioridad,
  filtrarProyectos
}) => {
  const navigate = useNavigate();

  // Use createUniqueKey for all options to ensure uniqueness
  const createUniqueKey = (prefix: string, id: number, value: string) => 
    `${prefix}-${id}-${value.replace(/\s+/g, '-')}`;

  return (
    <div className="p-6 w-full bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {["Nombre", "Responsable", "Estado", "Tipo", "Equipo", "Prioridad",
              "Objetivo", "Fecha Inicio", "Fecha Fin", "Progreso", "Enlace", "Observaciones", "Acciones"
            ].map(header => (
              <th key={`header-${header.toLowerCase().replace(/\s+/g, '-')}`} 
                  className="px-4 py-2 text-left text-xs font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filtrarProyectos().map(proyecto => (
            <tr key={`proyecto-${proyecto.id}`} className="hover:bg-gray-50">
              <td className="px-4 py-2">
                {editando.id === proyecto.id && editando.campo === 'nombre' ? (
                  <input type="text" value={proyecto.nombre}
                    onChange={(e) => handleSave(proyecto.id, 'nombre', e.target.value)}
                    className="border p-1 rounded" />
                ) : (
                  <span onClick={() => handleEdit(proyecto.id, 'nombre')}>{proyecto.nombre}</span>
                )}
              </td>
              <td className="px-4 py-2">{proyecto.responsable_nombre || proyecto.responsable}</td>
              <td className="px-4 py-2">
                {editando.id === proyecto.id && editando.campo === 'estado' ? (
                  <select 
                    value={proyecto.estado} 
                    onChange={(e) => handleSave(proyecto.id, 'estado', e.target.value)} 
                    className="border p-1 rounded"
                  >
                    {Object.values(opcionesEstado).flat().map(op => (
                      <option key={createUniqueKey('estado', proyecto.id, op)} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span 
                    className={getColorEstado(proyecto.estado)} 
                    onClick={() => handleEdit(proyecto.id, 'estado')}
                  >
                    {proyecto.estado}
                  </span>
                )}
              </td>
              <td className="px-4 py-2">
                {editando.id === proyecto.id && editando.campo === 'tipo' ? (
                  <select 
                    multiple 
                    value={Array.isArray(proyecto.tipo) ? proyecto.tipo : [proyecto.tipo]} 
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, o => o.value);
                      handleSave(proyecto.id, 'tipo', values);
                    }} 
                    className="border p-1 rounded"
                  >
                    {opcionesTipo.map(op => (
                      <option key={createUniqueKey('tipo', proyecto.id, op)} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div onClick={() => handleEdit(proyecto.id, 'tipo')}>
                    {formatArrayOrString(proyecto.tipo)}
                  </div>
                )}
              </td>
              <td className="px-4 py-2">
                {editando.id === proyecto.id && editando.campo === 'equipo' ? (
                  <select 
                    multiple 
                    value={Array.isArray(proyecto.equipo) ? proyecto.equipo : [proyecto.equipo]} 
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, o => o.value);
                      handleSave(proyecto.id, 'equipo', values);
                    }} 
                    className="border p-1 rounded"
                  >
                    {opcionesEquipo.map(op => (
                      <option key={createUniqueKey('equipo', proyecto.id, op)} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div onClick={() => handleEdit(proyecto.id, 'equipo')}>
                    {formatArrayOrString(proyecto.equipo)}
                  </div>
                )}
              </td>
              <td className="px-4 py-2">
                {editando.id === proyecto.id && editando.campo === 'prioridad' ? (
                  <select 
                    value={proyecto.prioridad} 
                    onChange={(e) => handleSave(proyecto.id, 'prioridad', e.target.value)} 
                    className="border p-1 rounded"
                  >
                    {opcionesPrioridad.map(p => (
                      <option key={createUniqueKey('prioridad', proyecto.id, p)} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span 
                    className={getColorPrioridad(proyecto.prioridad)} 
                    onClick={() => handleEdit(proyecto.id, 'prioridad')}
                  >
                    {proyecto.prioridad}
                  </span>
                )}
              </td>
              <td className="px-4 py-2">
                {editando.id === proyecto.id && editando.campo === 'objetivo' ? (
                  <input type="text" value={proyecto.objetivo} onChange={(e) => handleSave(proyecto.id, 'objetivo', e.target.value)} className="border p-1 rounded" />
                ) : (
                  <span onClick={() => handleEdit(proyecto.id, 'objetivo')}>{proyecto.objetivo}</span>
                )}
              </td>
              <td className="px-4 py-2">
                {editando.id === proyecto.id && editando.campo === 'fechaInicio' ? (
                  <input type="date" value={proyecto.fechaInicio} onChange={(e) => handleSave(proyecto.id, 'fechaInicio', e.target.value)} className="border p-1 rounded" />
                ) : (
                  <span onClick={() => handleEdit(proyecto.id, 'fechaInicio')}>{proyecto.fechaInicio}</span>
                )}
              </td>
              <td className="px-4 py-2">
                {editando.id === proyecto.id && editando.campo === 'fechaFin' ? (
                  <input type="date" value={proyecto.fechaFin} onChange={(e) => handleSave(proyecto.id, 'fechaFin', e.target.value)} className="border p-1 rounded" />
                ) : (
                  <span onClick={() => handleEdit(proyecto.id, 'fechaFin')}>{proyecto.fechaFin}</span>
                )}
              </td>
              <td className="px-4 py-2">{proyecto.progreso}%</td>
              <td className="px-4 py-2">
                <a href={proyecto.enlace} target="_blank" rel="noreferrer" className="text-blue-600 underline">Ver</a>
              </td>
              <td className="px-4 py-2">
                {editando.id === proyecto.id && editando.campo === 'observaciones' ? (
                  <textarea value={proyecto.observaciones} onChange={(e) => handleSave(proyecto.id, 'observaciones', e.target.value)} className="border p-1 rounded w-full" rows={3} />
                ) : (
                  <span onClick={() => handleEdit(proyecto.id, 'observaciones')} className="block max-w-xs truncate" title={proyecto.observaciones}>{proyecto.observaciones}</span>
                )}
              </td>
              <td className="px-4 py-2">
                <button onClick={() => navigate(`/proyecto/${proyecto.id}`)} className="text-green-600 hover:text-green-800">Ver</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaProyectos;
