import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Items from './pages/Items'
import Cart from './pages/Cart'
import Navbar from './components/Navbar'
import { api, storage } from './lib/api'

export default function App() {
  const [user, setUser] = useState(() => storage.getUser())
  const [cartCount, setCartCount] = useState(0)
  const navigate = useNavigate()

  async function refreshCartCount() {
    if (!storage.getToken()) { setCartCount(0); return }
    try {
      const data = await api('/api/cart')
      setCartCount(data.cart.reduce((sum, c) => sum + c.quantity, 0))
    } catch {}
  }

  useEffect(() => { refreshCartCount() }, [user])

  function onLogout() {
    storage.clearToken(); storage.setUser(null); setUser(null); setCartCount(0); navigate('/')
  }

  return (
    <div>
      <Navbar user={user} onLogout={onLogout} cartCount={cartCount} />
      <Routes>
        <Route path="/login" element={<Login onAuth={setUser} />} />
        <Route path="/signup" element={<Signup onAuth={setUser} />} />
        <Route path="/cart" element={storage.getToken() ? <Cart /> : <Navigate to="/login" replace />} />
        <Route path="/" element={<Items user={user} onAddedToCart={refreshCartCount} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
