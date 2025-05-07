import React from 'react';

export default function Header() {
  return (
    <div className="flex justify-between items-center">
      <input
        type="text"
        placeholder="Buscar proyecto..."
        className="p-2 border rounded w-full max-w-sm"
      />
      <div className="ml-4 flex space-x-2">
        <select className="p-2 border rounded">
          <option>Todos los estados</option>
          <option>En progreso</option>
          <option>Pausado</option>
        </select>
        <select className="p-2 border rounded">
          <option>Prioridad</option>
          <option>Alta</option>
          <option>Media</option>
          <option>Baja</option>
        </select>
      </div>
    </div>
  );
}
