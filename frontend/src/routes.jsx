import React from "react";

import KanbanView from "./components/KanbanView.jsx";
import GanttView from "./components/GanttView.jsx"; // Importar el nuevo componente
import Sidebar from "./components/Sidebar.jsx";
import Views from "./views.tsx";
import Tareas from "./pages/Tareas.jsx";
import Perfil from "./pages/Perfil.jsx";
import Usuarios from "./pages/Usuarios.jsx"; // Importar el componente de usuarios
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Componente de layout que incluye la barra lateral
const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  
  return (
    <div className="flex">
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
      />
      <main className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'} flex-1 p-6`}>
        {children}
      </main>
    </div>
  );
};

export const routes = [
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout>
          <Views />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/kanban",
    element: (
      <ProtectedRoute>
        <Layout>
          <KanbanView />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/gantt", // Nueva ruta para la vista Gantt
    element: (
      <ProtectedRoute>
        <Layout>
          <GanttView />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/tareas",
    element: (
      <ProtectedRoute>
        <Layout>
          <Tareas />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/perfil",
    element: (
      <ProtectedRoute>
        <Layout>
          <Perfil />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/usuarios",
    element: (
      <ProtectedRoute>
        <Layout>
          <Usuarios />
        </Layout>
      </ProtectedRoute>
    ),
  },
];