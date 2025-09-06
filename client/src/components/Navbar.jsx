import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar({ user, onLogout, cartCount }) {
  return (
    <div className="nav">
      <div className="nav-inner container">
        <Link to="/" className="brand">
          <span className="logo">🛍️</span>
          <span>MERN Shop</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className="btn ghost">Browse</Link>
          <Link to="/cart" className="btn">Cart <span className="badge">{cartCount}</span></Link>
          {user ? (
            <>
              <span className="chip">Signed in as <b style={{ marginLeft: 6 }}>{user.name}</b></span>
              <button className="btn danger" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn ghost">Login</Link>
              <Link to="/signup" className="btn primary">Signup</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
