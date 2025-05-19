import React from "react";

// Simula datos de usuario y proyectos
const usuario = {
  nombre: "Felipe Gómez",
  correo: "felipe.gomez@andesbpo.com",
  rol: "Administrador",
  foto: null // Si tienes una URL de foto, ponla aquí. Si no, se muestra la inicial.
};

const proyectos = [
  { id: 1, nombre: "Sistema de gestión de facturas" },
  { id: 2, nombre: "Automatización de facturación" }
];

export default function Perfil() {
  return (
    <div className="p-8 bg-gradient-to-br from-green-50 to-white min-h-screen flex flex-col items-center">
      <div className="bg-white rounded-xl shadow-lg p-8 flex items-center w-full max-w-2xl mb-8">
        {/* Icono/Foto/Letra */}
        <div className="flex-shrink-0">
          {usuario.foto ? (
            <img
              src={usuario.foto}
              alt={usuario.nombre}
              className="w-20 h-20 rounded-full object-cover border-4 border-green-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-4xl font-bold border-4 border-green-200">
              {usuario.nombre.charAt(0)}
            </div>
          )}
        </div>
        {/* Info usuario */}
        <div className="ml-8 flex-1">
          <h1 className="text-3xl font-extrabold text-green-700 mb-1">{usuario.nombre}</h1>
          <div className="text-gray-500 mb-2">{usuario.correo}</div>
          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
            {usuario.rol}
          </span>
        </div>
      </div>
      {/* Proyectos */}
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold text-green-700 mb-4">Proyectos a cargo</h2>
        {proyectos.length > 0 ? (
          <ul className="space-y-2">
            {proyectos.map(proy => (
              <li key={proy.id} className="px-4 py-2 rounded bg-green-50 hover:bg-green-100 transition">
                <span className="font-medium text-green-800">{proy.nombre}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-400">No tienes proyectos asignados.</div>
        )}
      </div>
    </div>
  );
}