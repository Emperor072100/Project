import React from 'react'
import { createRoot} from 'react-dom/client'
import { RouterProvider, createBrowserRouter as Router } from 'react-router-dom'
import './index.css'
import { setupAuthInterceptor } from './services/authService'
import { ProyectosProvider } from './context/ProyectosContext'

import { routes } from './routes'

// Configurar interceptor de autenticación
setupAuthInterceptor();

const router = Router(routes)

const root = createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <ProyectosProvider>
      <RouterProvider router={router}/>
    </ProyectosProvider>
  </React.StrictMode>
)