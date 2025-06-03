import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

const opcionesEstado = {
  pendientes: ['Conceptual', 'Análisis', 'Sin Empezar'],
  enProceso: ['En diseño', 'En desarrollo', 'En curso', 'Etapa pruebas'],
  terminados: ['Cancelado', 'Pausado', 'En producción', 'Desarrollado']
};

const getColorEstado = (estado) => {
  if (opcionesEstado.pendientes.includes(estado)) return 'bg-yellow-100 text-yellow-800';
  if (opcionesEstado.enProceso.includes(estado)) return 'bg-blue-100 text-blue-800';
  if (['Cancelado', 'Pausado'].includes(estado)) return 'bg-red-100 text-red-800';
  if (['En producción', 'Desarrollado'].includes(estado)) return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
};

const getColorPrioridad = (prioridad) => {
  switch (prioridad) {
    case 'Alta': return 'bg-red-100 text-red-800';
    case 'Media': return 'bg-yellow-100 text-yellow-800';
    case 'Baja': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const DetalleProyecto = () => {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const proyectosResponse = await axios.get("http://localhost:8000/proyectos");
        const proyectoEncontrado = proyectosResponse.data.find(p => p.id === parseInt(id || '0'));

        if (proyectoEncontrado) {
          setProyecto(proyectoEncontrado);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error("Error al cargar detalles del proyecto:", error);
        navigate('/');
      }
    };

    fetchProjectDetails();
  }, [id, navigate]);

  if (!proyecto) return <div>Cargando...</div>;

  return (
    <div className="p-6 w-full bg-white">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-gray-600 hover:text-gray-800 flex items-center"
      >
        <FaArrowLeft className="mr-2" /> Volver
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-green-600 mb-4">{proyecto.nombre}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p><strong>Responsable:</strong> {proyecto.responsable}</p>
            <p><strong>Estado:</strong> <span className={`px-2 py-1 rounded-full ${getColorEstado(proyecto.estado)}`}>
              {proyecto.estado}
            </span></p>
            <p><strong>Prioridad:</strong> <span className={`px-2 py-1 rounded-full ${getColorPrioridad(proyecto.prioridad)}`}>
              {proyecto.prioridad}
            </span></p>
          </div>

          <div className="space-y-2">
            <p><strong>Fecha Inicio:</strong> {proyecto.fechaInicio}</p>
            <p><strong>Fecha Fin:</strong> {proyecto.fechaFin}</p>
            <p><strong>Progreso:</strong>
              <div className="w-32 bg-gray-200 rounded-full h-2.5 mt-1">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${proyecto.progreso}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500">{proyecto.progreso}%</span>
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Detalles del Proyecto</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Objetivo</h3>
              <p className="text-gray-600">{proyecto.objetivo}</p>
            </div>

            <div>
              <h3 className="font-medium">Equipos Involucrados</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {proyecto.equipo.map((equipo, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {equipo}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium">Enlace del Proyecto</h3>
              <a
                href={proyecto.enlace}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {proyecto.enlace}
              </a>
            </div>

            <div>
              <h3 className="font-medium">Observaciones</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{proyecto.observaciones}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleProyecto;