import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Views from './views'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <Views />
      </div>
    </BrowserRouter>
  </React.StrictMode>
)
