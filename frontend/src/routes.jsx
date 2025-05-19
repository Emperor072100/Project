import React from "react";
import Projects from "./pages/Projects.jsx";
import KanbanView from "./components/KanbanView.jsx";
import Sidebar from "./components/Sidebar.jsx"; // Importamos el componente Sidebar
import Views from "./views.jsx";
import Tareas from "./pages/Tareas.jsx";
import Perfil from "./pages/Perfil.jsx";


// Componente de layout que incluye la barra lateral
const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  
  return (
    <div className="flex">
      <Sidebar 
        user={{ nombre: "Usuario", rol: "Admin" }} 
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
    path: "/",
    element: (
      <Layout>
        <Views />
      </Layout>
    ),
  },
  {
    path: "/kanban",
    element: (
      <Layout>
        <KanbanView />
      </Layout>
    ),
  },
  {
    path: "/tareas",
    element: (
      <Layout>
        <Tareas />
      </Layout>
    ),
  },
  {
    path: "/perfil",
    element: (
      <Layout>
        <Perfil />
      </Layout>
    ),
  },
];