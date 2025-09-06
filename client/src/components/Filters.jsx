import React from 'react'

export default function Filters({
  q, setQ,
  category, setCategory,
  // categories & setCategories no longer used (replaced by dropdown)
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  sort, setSort,
  onApply, total,
  categoriesOptions,
  priceMinLimit = 0,
  priceMaxLimit = 500,
}) {
  const opts = Array.isArray(categoriesOptions) && categoriesOptions.length
    ? ['All', ...categoriesOptions]
    : ['All', 'electronics', 'home', 'clothing', 'books']

  const curMin = Number(minPrice === '' || minPrice == null ? priceMinLimit : minPrice)
  const curMax = Number(maxPrice === '' || maxPrice == null ? priceMaxLimit : maxPrice)

  function handleCategoryChange(e) {
    const v = e.target.value
    setCategory(v === 'All' ? '' : v)
  }

  function handleMinChange(e) {
    const v = Number(e.target.value)
    setMinPrice(v)
    if (v > curMax) setMaxPrice(v)
  }

  function handleMaxChange(e) {
    const v = Number(e.target.value)
    setMaxPrice(v)
    if (v < curMin) setMinPrice(v)
  }

  return (
    <div className="card">
      <div className="hero">
        <div>
          <h1>Discover products</h1>
          <div className="muted">Search, filter and sort items</div>
        </div>
        <div className="kpi">Total <b style={{ marginLeft:6 }}>{total}</b></div>
      </div>
      <div className="inputs">
        <input className="grow" placeholder="Search (q)" value={q} onChange={e=>setQ(e.target.value)} />
        <select value={category || 'All'} onChange={handleCategoryChange}>
          {opts.map(o => <option key={o} value={o}>{o[0].toUpperCase() + o.slice(1)}</option>)}
        </select>
        <div style={{ gridColumn: 'span 3' }}>
          <div className="stack" style={{ justifyContent:'space-between' }}>
            <span className="muted">Price range</span>
            <span className="badge">${curMin} - ${curMax}</span>
          </div>
          <div className="stack" style={{ alignItems:'center', marginTop: 8 }}>
            <input type="range" min={priceMinLimit} max={priceMaxLimit} value={curMin} onChange={handleMinChange} style={{ flex:1 }} />
            <input type="range" min={priceMinLimit} max={priceMaxLimit} value={curMax} onChange={handleMaxChange} style={{ flex:1 }} />
          </div>
        </div>
        <select value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
      <div className="stack" style={{ marginTop: 12 }}>
        <button className="btn primary" onClick={onApply}>Apply filters</button>
        <span className="muted">Use the dropdown to select a category and sliders to set price range</span>
      </div>
    </div>
  )
}
