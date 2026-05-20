import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Cursor from './components/Cursor'
import Loader from './components/Loader'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Register from './pages/Register'
import Auction from './pages/Auction'
import Leaderboard from './pages/Leaderboard'
import Matches from './pages/Matches'
import Admin from './pages/Admin'
import Teams from './pages/Teams'


export default function App() {
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 3200)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <Loader />

  return (
    <>
      <Cursor />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#16161f',
            border: '1px solid rgba(255,58,0,0.3)',
            color: '#F0EDE8',
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#00FF87', secondary: '#16161f' } },
          error: { iconTheme: { primary: '#FF3A00', secondary: '#16161f' } },
        }}
      />
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auction" element={<Auction />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </>
  )
}
