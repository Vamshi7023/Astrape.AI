import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Cart() {
  const [cart, setCart] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await api('/api/cart')
      setCart(data.cart); setTotal(data.total)
    } catch (e) {
      const msg = e?.message || 'Failed to load cart'
      setError(msg)
      if (msg.includes('401') || msg.toLowerCase().includes('expired')) {
        navigate('/login')
      }
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function inc(itemId) { try { await api('/api/cart/add', { method:'POST', body:{ itemId, quantity:1 } }); await load() } catch (e) { setError(e?.message || 'Failed to update cart') } }
  async function dec(itemId) { try { await api('/api/cart/remove', { method:'POST', body:{ itemId, quantity:1 } }); await load() } catch (e) { setError(e?.message || 'Failed to update cart') } }
  async function removeAll(itemId) { try { await api('/api/cart/remove', { method:'POST', body:{ itemId } }); await load() } catch (e) { setError(e?.message || 'Failed to update cart') } }
  async function clearCart() { try { await api('/api/cart/clear', { method:'DELETE' }); await load() } catch (e) { setError(e?.message || 'Failed to clear cart') } }

  return (
    <div className="container" style={{ marginTop: 22 }}>
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2>Your Cart</h2>
          <button className="btn danger" onClick={clearCart}>Clear cart</button>
        </div>
        <div className="divider" />
        {error && <div className="badge" style={{ borderColor:'rgba(239,68,68,0.4)', color:'#fecaca', marginBottom:8 }}>⚠ {error}</div>}
        {loading ? <div className="muted">Loading…</div> : cart.length === 0 ? (
          <div className="muted">Cart is empty.</div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Item</th><th>Price</th><th>Qty</th><th className="right">Subtotal</th><th></th></tr>
            </thead>
            <tbody>
              {cart.map(({ item, quantity, subtotal }) => (
                <tr key={item._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <img src={item.imageUrl || `https://picsum.photos/seed/${item._id}/96/64`} width="72" height="48" style={{ borderRadius:8, objectFit:'cover' }} />
                      <div>
                        <div style={{ fontWeight:700 }}>{item.name}</div>
                        <div className="muted">{item.category || 'General'}</div>
                      </div>
                    </div>
                  </td>
                  <td>${Number(item.price || 0).toFixed(2)}</td>
                  <td>
                    <div className="stack">
                      <button className="btn" onClick={() => dec(item._id)}>-</button>
                      <span className="badge">{quantity}</span>
                      <button className="btn" onClick={() => inc(item._id)}>+</button>
                    </div>
                  </td>
                  <td className="right">${Number(subtotal || 0).toFixed(2)}</td>
                  <td className="right"><button className="btn" onClick={() => removeAll(item._id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="right" style={{ fontWeight:800 }}>Total</td>
                <td className="right" style={{ fontWeight:800 }}>${Number(total || 0).toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
