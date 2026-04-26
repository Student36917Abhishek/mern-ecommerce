import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProducts } from '../services/products'
import { addItemToCart } from '../services/cart'
import { useAuth } from '../context/AuthContext'
import { ProductCard } from '../components/ProductCard'

const catalogTone = [
  'Fresh deals',
  'Fast checkout',
  'Secure account',
]

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
          <p className="eyebrow">Shopora catalog</p>
          <h1>Shop daily essentials, electronics, fashion, and more.</h1>
          <p className="hero-text">
            Browse live products from your backend, add items to cart, and continue to checkout.
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
