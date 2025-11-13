import React from 'react'
import { createRoot} from 'react-dom/client'
import { RouterProvider, createBrowserRouter as Router } from 'react-router-dom'
import './index.css'
import { ProyectosProvider } from './context/ProyectosContext'

import { routes } from './routes'

// Nota: El interceptor de autenticación se configura automáticamente en axiosConfig.js

const router = Router(routes)

const root = createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <ProyectosProvider>
      <RouterProvider router={router}/>
    </ProyectosProvider>
  </React.StrictMode>
)