import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, storage } from '../lib/api'

export default function Signup({ onAuth }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const { token, user } = await api('/api/auth/signup', { method: 'POST', body: { name, email, password }, auth: false })
      storage.setToken(token); storage.setUser(user); onAuth(user); navigate('/')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <div className="container" style={{ marginTop: 28 }}>
      <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="hero"><h1>Create your account</h1><span className="muted">Join MERN Shop</span></div>
        <form onSubmit={submit} className="stack v">
          <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          {error && <div className="badge" style={{ borderColor:'rgba(239,68,68,0.4)', color:'#fecaca' }}>⚠ {error}</div>}
          <button className="btn primary" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
          <span className="muted">Already have an account? <Link to="/login">Login</Link></span>
        </form>
      </div>
    </div>
  )
}
