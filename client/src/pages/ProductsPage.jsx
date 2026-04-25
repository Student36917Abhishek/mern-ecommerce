import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchProducts } from '../services/products'
import { addItemToCart } from '../services/cart'
import { useAuth } from '../context/AuthContext'

const catalogTone = [
  'Curated drops',
  'Local demo inventory',
  'Backend-powered browsing',
]

const formatPrice = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value) || 0)

function ProductCard({ product, onAddToCart }) {
  const availability = product.stock > 0 ? `${product.stock} in stock` : 'Sold out'

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} className="product-card__media">
        <img src={product.image || 'https://placehold.co/640x480?text=Product'} alt={product.name} />
      </Link>

      <div className="product-card__body">
        <div className="product-card__meta">
          <span>{product.category || 'General'}</span>
          <span className={product.stock > 0 ? 'badge badge--good' : 'badge badge--danger'}>
            {availability}
          </span>
        </div>

        <h2>
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </h2>
        <p>{product.description}</p>

        <div className="product-card__footer">
          <strong>{formatPrice(product.price)}</strong>
          <div className="product-card__actions">
            <Link className="button button--ghost button--compact" to={`/products/${product._id}`}>
              View details
            </Link>
            <button
              type="button"
              className="button button--solid button--compact"
              onClick={() => onAddToCart(product)}
              disabled={product.stock <= 0}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export function ProductsPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      try {
        setLoading(true)
        const data = await fetchProducts({ limit: 24, sort: 'newest', search })

        if (!isMounted) {
          return
        }

        setProducts(data.products || [])
        setError('')
      } catch (requestError) {
        if (isMounted) {
          setError(requestError?.response?.data?.message || 'Unable to load products.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [search])

  const emptyState = useMemo(() => {
    if (search.trim()) {
      return 'No matching products were found.'
    }

    return 'No products are available yet.'
  }, [search])

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      setStatusMessage('')
      await addItemToCart(product._id, 1)
      setStatusMessage(`${product.name} added to cart.`)
    } catch (requestError) {
      setStatusMessage(requestError?.response?.data?.message || 'Unable to add item to cart.')
    }
  }

  return (
    <section className="catalog-page">
      <header className="catalog-hero">
        <div>
          <p className="eyebrow">Day 19 product listing</p>
          <h1>Browse the catalog through a bold, demo-ready storefront.</h1>
          <p className="hero-text">
            This page pulls products from the backend and renders a focused shopping grid with
            price, stock, and category context.
          </p>
        </div>

        <div className="catalog-tags">
          {catalogTone.map((item) => (
            <span key={item} className="catalog-tag">
              {item}
            </span>
          ))}
        </div>
      </header>

      <div className="catalog-toolbar">
        <label className="search-field">
          <span>Search products</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name"
          />
        </label>
      </div>

      {statusMessage ? <div className="catalog-state">{statusMessage}</div> : null}

      {error ? <div className="catalog-state catalog-state--error">{error}</div> : null}

      {loading ? (
        <div className="product-grid product-grid--loading">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="product-skeleton" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      ) : (
        <div className="catalog-state">{emptyState}</div>
      )}
    </section>
  )
}

export { ProductCard, formatPrice }