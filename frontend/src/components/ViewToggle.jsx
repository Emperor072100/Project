import React from 'react';

export default function ViewToggle() {
  return (
    <div className="flex space-x-2">
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Tabla
      </button>
      <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
        Kanban
      </button>
      <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
        Gantt
      </button>
    </div>
  );
}