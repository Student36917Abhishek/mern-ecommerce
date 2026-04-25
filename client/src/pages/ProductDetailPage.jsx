import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchProductById } from '../services/products'
import { formatPrice } from './ProductsPage'
import { addItemToCart } from '../services/cart'
import { useAuth } from '../context/AuthContext'

export function ProductDetailPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionState, setActionState] = useState({ loading: false, message: '' })

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

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      setActionState({ loading: true, message: '' })
      await addItemToCart(product._id, 1)
      setActionState({ loading: false, message: 'Added to cart.' })
    } catch (requestError) {
      setActionState({
        loading: false,
        message: requestError?.response?.data?.message || 'Unable to add item to cart.',
      })
    }
  }

  return (
    <section className="product-detail">
      <Link to="/products" className="back-link">
        Back to catalog
      </Link>

      <div className="product-detail__shell">
        <div className="product-detail__media">
          <img src={product.image || 'https://placehold.co/960x720?text=Product'} alt={product.name} />
        </div>

        <div className="product-detail__content">
          <p className="eyebrow">{product.category || 'General'}</p>
          <h1>{product.name}</h1>
          <p className="hero-text">{product.description}</p>

          <div className="detail-price-row">
            <strong>{formatPrice(product.price)}</strong>
            <span className={product.stock > 0 ? 'badge badge--good' : 'badge badge--danger'}>
              {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </span>
          </div>

          <div className="detail-card-list">
            <article>
              <span>Product ID</span>
              <strong>{product._id}</strong>
            </article>
            <article>
              <span>Status</span>
              <strong>{product.stock > 0 ? 'Ready for cart flow' : 'Sold out'}</strong>
            </article>
          </div>

          <div className="detail-actions">
            <button type="button" className="button button--solid" onClick={handleAddToCart} disabled={actionState.loading || product.stock <= 0}>
              {actionState.loading ? 'Adding...' : 'Add to cart'}
            </button>
            <Link to="/cart" className="button button--ghost">
              Go to cart
            </Link>
          </div>

          {actionState.message ? <p className="form-help">{actionState.message}</p> : null}
        </div>
      </div>
    </section>
  )
}