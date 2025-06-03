import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

const NuevoProyecto = () => {
  const navigate = useNavigate();

  const handleSave = () => {
    // Lógica para guardar un nuevo proyecto.
    // Esto implicaría un formulario y una llamada a axios.post
    // Por ahora, simplemente volvemos al dashboard.
    navigate('/');
  };

  return (
    <div className="p-6 w-full bg-white">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-gray-600 hover:text-gray-800 flex items-center"
      >
        <FaArrowLeft className="mr-2" /> Volver al Dashboard
      </button>
      <h1 className="text-2xl font-bold text-green-600 mb-4">Añadir Nuevo Proyecto</h1>
      <p>Aquí iría el formulario para crear un nuevo proyecto.</p>
      <button
        onClick={handleSave}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md flex items-center"
      >
        <FaSave className="mr-2" /> Guardar Nuevo Proyecto
      </button>
    </div>
  );
};

export default NuevoProyecto;