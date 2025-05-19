import React, { useState } from "react";

const proyectosMock = [
  {
    id: 1,
    nombre: "Sistema de gestión de facturas",
    tareas: [
      { id: 1, nombre: "Diseño de base de datos", estado: "Completada" },
      { id: 2, nombre: "Integración API", estado: "Pendiente" }
    ]
  },
  {
    id: 2,
    nombre: "Automatización de facturación",
    tareas: [
      { id: 1, nombre: "Revisión de scripts", estado: "En progreso" }
    ]
  }
];

export default function Tareas() {
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  return (
    <div className="p-6 bg-white w-full">
      <h1 className="text-2xl font-bold mb-4">Panel de Tareas</h1>
      <div className="flex gap-8">
        <div>
          <h2 className="font-semibold mb-2">Proyectos</h2>
          <ul>
            {proyectosMock.map(p => (
              <li key={p.id}>
                <button
                  className={`block px-4 py-2 rounded ${proyectoSeleccionado?.id === p.id ? "bg-green-100" : "hover:bg-gray-100"}`}
                  onClick={() => setProyectoSeleccionado(p)}
                >
                  {p.nombre}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          <h2 className="font-semibold mb-2">Tareas</h2>
          {proyectoSeleccionado ? (
            <ul>
              {proyectoSeleccionado.tareas.map(t => (
                <li key={t.id} className="mb-2">
                  <span className="font-medium">{t.nombre}</span>
                  <span className="ml-2 text-xs text-gray-500">({t.estado})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Selecciona un proyecto para ver sus tareas.</p>
          )}
        </div>
      </div>
    </div>
  );
}