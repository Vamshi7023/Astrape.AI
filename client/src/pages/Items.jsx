import React, { useEffect, useState } from 'react'
import Filters from '../components/Filters'
import { api } from '../lib/api'

function ItemCard({ it, onAdd }) {
  return (
    <div className="card item">
      <img src={it.imageUrl || `https://picsum.photos/seed/${it._id}/480/360`} alt={it.name} loading="lazy" />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <div style={{ fontWeight:700 }}>{it.name}</div>
        <div className="price">${Number(it.price || 0).toFixed(2)}</div>
      </div>
      <div className="muted">{it.category || 'General'}</div>
      <div className="stack">
        <button className="btn primary" onClick={() => onAdd(it._id)}>Add to cart</button>
        <span className="chip">Stock: {it.stock ?? '∞'}</span>
      </div>
    </div>
  )
}

export default function Items({ user, onAddedToCart }) {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
    const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(500)
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const limit = 12

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    params.set('minPrice', String(minPrice))
    params.set('maxPrice', String(maxPrice))
    if (sort) params.set('sort', sort)
    params.set('page', String(page))
    params.set('limit', String(limit))
    try {
      const data = await api(`/api/items?${params.toString()}`, { auth:false })
      setItems(data.items); setTotal(data.total)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page])

  async function addToCart(itemId) {
    if (!user) { window.location.href = '/login'; return }
    try {
      await api('/api/cart/add', { method:'POST', body:{ itemId, quantity:1 } })
      setToast('Added to cart')
      if (onAddedToCart) onAddedToCart()
    } catch (err) {
      setToast(err.message || 'Failed to add')
    }
  }

  const pages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="container" style={{ marginTop: 22 }}>
      <Filters
        q={q} setQ={setQ}
        category={category} setCategory={setCategory}
        minPrice={minPrice} setMinPrice={setMinPrice}
        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
        sort={sort} setSort={setSort}
        total={total}
        onApply={() => { setPage(1); load() }}
        categoriesOptions={['electronics','home','clothing','books']}
        priceMinLimit={0}
        priceMaxLimit={500}
      />

      <div className="spacer" />

      {loading ? (
        <div className="grid items">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="card" key={i}>
              <div className="skeleton img" />
              <div className="skeleton" style={{ height:18, marginTop:10 }} />
              <div className="skeleton" style={{ height:14, marginTop:8, width:'60%' }} />
              <div className="skeleton" style={{ height:36, marginTop:10 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid items">
          {items.map((it) => (
            <ItemCard key={it._id} it={it} onAdd={addToCart} />
          ))}
        </div>
      )}

      <div className="spacer" />
      <div className="stack" style={{ justifyContent:'center' }}>
        <button className="btn" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
        <span className="badge">Page {page} / {pages}</span>
        <button className="btn" disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>

      {toast && <div className="toast" onAnimationEnd={() => setToast('')}>{toast}</div>}
    </div>
  )
}
