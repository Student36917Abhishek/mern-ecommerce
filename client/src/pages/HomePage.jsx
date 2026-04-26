import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'
import { addItemToCart } from '../services/cart'
import { fetchProducts } from '../services/products'

const valueHighlights = [
  { value: '24+', label: 'curated picks' },
  { value: '4', label: 'shopping steps' },
  { value: '100%', label: 'secure checkout flow' },
]

const categories = [
  {
    title: 'Daily essentials',
    text: 'Simple products for everyday routines, home needs, and quick purchases.',
  },
  {
    title: 'Smart electronics',
    text: 'Helpful gadgets, accessories, and tech picks with clear stock status.',
  },
  {
    title: 'Style finds',
    text: 'Fresh fashion and lifestyle items for a clean and modern shopping experience.',
  },
]

const shoppingSteps = [
  'Explore the catalog',
  'Add favorites to cart',
  'Confirm secure checkout',
  'Track every order',
]

const benefits = [
  'Live product catalog connected to your backend',
  'Protected cart, checkout, and order pages',
  'Admin product controls ready for store management',
]

export function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [featuredError, setFeaturedError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadFeaturedProducts = async () => {
      try {
        setLoadingFeatured(true)
        const data = await fetchProducts({ limit: 4, sort: 'newest' })

        if (isMounted) {
          setFeaturedProducts(data.products || [])
          setFeaturedError('')
        }
      } catch (requestError) {
        if (isMounted) {
          setFeaturedError(
            requestError?.response?.data?.message ||
              'Featured products will appear when the backend is running.',
          )
        }
      } finally {
        if (isMounted) {
          setLoadingFeatured(false)
        }
      }
    }

    loadFeaturedProducts()

    return () => {
      isMounted = false
    }
  }, [])

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
    <section className="home-page">
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Welcome to Shopora</p>
          <h1>Everything you need for smooth everyday shopping.</h1>
          <p className="hero-text">
            Shopora brings products, cart, checkout, order history, and admin management into one
            clean MERN e-commerce experience.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="button button--solid">
              Start shopping
            </Link>
            <Link to="/register" className="button button--ghost">
              Create account
            </Link>
          </div>

          <div className="hero-metrics" aria-label="Shopora highlights">
            {valueHighlights.map((item) => (
              <span key={item.label}>
                <strong>{item.value}</strong>
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <aside className="hero-panel">
          <div className="home-deal-card">
            <span className="stats-label">Today on Shopora</span>
            <strong>Fresh picks for smarter carts</strong>
            <p>
              Browse featured products, compare details, and move from discovery to checkout
              without friction.
            </p>
            <Link to="/products" className="button button--solid button--compact">
              View catalog
            </Link>
          </div>

          <div className="home-checklist">
            {benefits.map((benefit) => (
              <span key={benefit}>{benefit}</span>
            ))}
          </div>
        </aside>
      </div>

      <section className="home-section">
        <div className="section-heading">
          <p className="eyebrow">Shop by mood</p>
          <h2>Clear categories for quick product discovery.</h2>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <article key={category.title} className="category-card">
              <h3>{category.title}</h3>
              <p>{category.text}</p>
              <Link to="/products">Explore products</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-section--split">
        <div className="section-heading">
          <p className="eyebrow">Shopping flow</p>
          <h2>From browsing to order tracking in a clean path.</h2>
        </div>

        <div className="step-list">
          {shoppingSteps.map((step, index) => (
            <article key={step} className="step-card">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading section-heading--row">
          <div>
            <p className="eyebrow">New arrivals</p>
            <h2>Featured products from your catalog.</h2>
          </div>
          <Link to="/products" className="button button--ghost button--compact">
            See all products
          </Link>
        </div>

        {statusMessage ? <div className="catalog-state">{statusMessage}</div> : null}

        {loadingFeatured ? (
          <div className="product-grid product-grid--loading">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="product-skeleton" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        ) : (
          <div className="catalog-state">{featuredError || 'No featured products yet.'}</div>
        )}
      </section>
    </section>
  )
}
