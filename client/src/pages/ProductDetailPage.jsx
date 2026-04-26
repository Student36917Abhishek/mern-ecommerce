import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import fallbackImage from '../assets/hero.png'
import { addItemToCart } from '../services/cart'
import { fetchProductById } from '../services/products'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/format'

const purchaseBenefits = [
  {
    title: 'Fast checkout',
    text: 'Add this item to your cart and complete the order in a guided checkout flow.',
  },
  {
    title: 'Order tracking',
    text: 'Every successful checkout creates an order you can review from your account.',
  },
  {
    title: 'Stock protected',
    text: 'Shopora checks live stock before cart updates and again before placing orders.',
  },
]

export function ProductDetailPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionState, setActionState] = useState({ loading: false, message: '' })
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    let isMounted = true

    const loadProduct = async () => {
      try {
        setLoading(true)
        const data = await fetchProductById(productId)

        if (!isMounted) {
          return
        }

        setProduct(data.product)
        setError('')
      } catch (requestError) {
        if (isMounted) {
          setError(requestError?.response?.data?.message || 'Unable to load this product.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      isMounted = false
    }
  }, [productId])

  if (loading) {
    return <div className="page-status">Loading product details...</div>
  }

  if (error) {
    return (
      <section className="auth-screen">
        <div className="auth-card">
          <p className="eyebrow">Product unavailable</p>
          <h1>{error}</h1>
          <Link to="/products" className="button button--solid">
            Back to catalog
          </Link>
        </div>
      </section>
    )
  }

  if (!product) {
    return null
  }

  const maxQuantity = Math.min(product.stock || 0, 10)
  const availabilityLabel = product.stock > 0 ? `${product.stock} available` : 'Out of stock'
  const estimatedTotal = product.price * quantity

  const handleAddToCart = async (nextAction = 'stay') => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      setActionState({ loading: true, message: '' })
      await addItemToCart(product._id, quantity)
      setActionState({ loading: false, message: `${quantity} item(s) added to cart.` })

      if (nextAction === 'checkout') {
        navigate('/checkout')
      }
    } catch (requestError) {
      setActionState({
        loading: false,
        message: requestError?.response?.data?.message || 'Unable to add item to cart.',
      })
    }
  }

  const handleImageError = (event) => {
    event.currentTarget.src = fallbackImage
  }

  return (
    <section className="product-detail">
      <Link to="/products" className="back-link">
        Back to catalog
      </Link>

      <div className="product-detail__shell">
        <div className="product-detail__media">
          <img src={product.image || fallbackImage} alt={product.name} onError={handleImageError} />
        </div>

        <div className="product-detail__content">
          <div className="detail-title-row">
            <p className="eyebrow">{product.category || 'General'}</p>
            <span className={product.stock > 0 ? 'badge badge--good' : 'badge badge--danger'}>
              {availabilityLabel}
            </span>
          </div>

          <h1>{product.name}</h1>
          <p className="hero-text">{product.description}</p>

          <div className="detail-price-row">
            <div>
              <span>Price</span>
              <strong>{formatPrice(product.price)}</strong>
            </div>
            <div>
              <span>Estimated item total</span>
              <strong>{formatPrice(estimatedTotal)}</strong>
            </div>
          </div>

          <div className="detail-purchase-panel">
            <div className="quantity-control">
              <span>Quantity</span>
              <div className="quantity-control__buttons">
                <button
                  type="button"
                  className="button button--ghost button--compact"
                  onClick={() => setQuantity((current) => Math.max(current - 1, 1))}
                  disabled={quantity <= 1 || actionState.loading}
                >
                  -
                </button>
                <strong>{quantity}</strong>
                <button
                  type="button"
                  className="button button--ghost button--compact"
                  onClick={() => setQuantity((current) => Math.min(current + 1, maxQuantity))}
                  disabled={quantity >= maxQuantity || actionState.loading || product.stock <= 0}
                >
                  +
                </button>
              </div>
            </div>

            <div className="stock-meter" aria-label="Stock level">
              <span style={{ width: `${Math.min(product.stock || 0, 100)}%` }} />
            </div>

            <div className="detail-actions">
              <button
                type="button"
                className="button button--solid"
                onClick={() => handleAddToCart('stay')}
                disabled={actionState.loading || product.stock <= 0}
              >
                {actionState.loading ? 'Adding...' : 'Add to cart'}
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => handleAddToCart('checkout')}
                disabled={actionState.loading || product.stock <= 0}
              >
                Buy now
              </button>
            </div>

            {actionState.message ? <p className="form-help">{actionState.message}</p> : null}
          </div>

          <div className="detail-card-list">
            {purchaseBenefits.map((benefit) => (
              <article key={benefit.title}>
                <span>{benefit.title}</span>
                <strong>{benefit.text}</strong>
              </article>
            ))}
          </div>

          <div className="detail-meta-strip">
            <span>Product ID: {product._id}</span>
            <Link to="/cart">Review cart</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
