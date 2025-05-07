import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Projects from './pages/Projects'

export default function App() {
  return (
    <div className="flex">
      <div className="w-64">
        {/* Aquí ya se renderiza el Sidebar desde main.jsx */}
      </div>
      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <Routes>
          <Route path="/" element={<Projects />} />
          {/* Aquí podrías agregar más rutas */}
        </Routes>
      </main>
    </div>
  )
}
