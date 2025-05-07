import React from 'react';

export default function ProjectTable() {
  const proyectos = [
    {
      nombre: 'Landing Page',
      responsable: 'Ana',
      estado: 'En progreso',
      tipo: 'Web',
      prioridad: 'Alta',
      inicio: '2024-05-01',
      fin: '2024-06-01',
      progreso: '40%',
    },
    {
      nombre: 'App Móvil',
      responsable: 'Luis',
      estado: 'Pausado',
      tipo: 'Mobile',
      prioridad: 'Media',
      inicio: '2024-04-10',
      fin: '2024-07-20',
      progreso: '20%',
    },
  ];

  return (
    <table className="w-full bg-white shadow rounded mt-4">
      <thead className="bg-gray-200 text-left">
        <tr>
          <th className="p-2">Nombre</th>
          <th className="p-2">Responsable</th>
          <th className="p-2">Estado</th>
          <th className="p-2">Tipo</th>
          <th className="p-2">Prioridad</th>
          <th className="p-2">Inicio</th>
          <th className="p-2">Fin</th>
          <th className="p-2">Progreso</th>
        </tr>
      </thead>
      <tbody>
        {proyectos.map((p, i) => (
          <tr key={i} className="border-t">
            <td className="p-2">{p.nombre}</td>
            <td className="p-2">{p.responsable}</td>
            <td className="p-2">{p.estado}</td>
            <td className="p-2">{p.tipo}</td>
            <td className="p-2">{p.prioridad}</td>
            <td className="p-2">{p.inicio}</td>
            <td className="p-2">{p.fin}</td>
            <td className="p-2">{p.progreso}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
