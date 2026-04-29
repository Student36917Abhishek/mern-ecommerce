import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import fallbackImage from '../assets/hero.png'
import {
  clearCart,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from '../services/cart'
import { resolveImageUrl } from '../utils/image'

const formatMoney = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value) || 0)

export function CartPage() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [busyItem, setBusyItem] = useState('')

  const loadCart = async () => {
    try {
      setLoading(true)
      const data = await fetchCart()
      setCart(data.cart)
      setError('')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load your cart.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [])

  const items = cart?.items || []

  const summary = useMemo(() => cart?.summary || {
    totalItems: 0,
    subtotal: 0,
    tax: 0,
    shippingFee: 0,
    grandTotal: 0,
  }, [cart])

  const handleChangeQuantity = async (productId, nextQuantity) => {
    try {
      setBusyItem(productId)
      await updateCartItem(productId, nextQuantity)
      await loadCart()
      setStatusMessage('Cart updated.')
    } catch (requestError) {
      setStatusMessage(requestError?.response?.data?.message || 'Unable to update cart item.')
    } finally {
      setBusyItem('')
    }
  }

  const handleRemove = async (productId) => {
    try {
      setBusyItem(productId)
      await removeCartItem(productId)
      await loadCart()
      setStatusMessage('Item removed from cart.')
    } catch (requestError) {
      setStatusMessage(requestError?.response?.data?.message || 'Unable to remove cart item.')
    } finally {
      setBusyItem('')
    }
  }

  const handleClearCart = async () => {
    try {
      setBusyItem('clear')
      await clearCart()
      await loadCart()
      setStatusMessage('Cart cleared.')
    } catch (requestError) {
      setStatusMessage(requestError?.response?.data?.message || 'Unable to clear cart.')
    } finally {
      setBusyItem('')
    }
  }

  if (loading) {
    return <div className="page-status">Loading your cart...</div>
  }

  return (
    <section className="cart-page">
      <header className="catalog-hero">
        <div>
          <p className="eyebrow">Shopping cart</p>
          <h1>Review your items before checkout.</h1>
          <p className="hero-text">
            Update quantities, remove products, and confirm your order total.
          </p>
        </div>

        <div className="cart-summary-pill">
          <strong>{summary.totalItems}</strong>
          <span>items in cart</span>
        </div>
      </header>

      {error ? <div className="catalog-state catalog-state--error">{error}</div> : null}
      {statusMessage ? <div className="catalog-state">{statusMessage}</div> : null}

      {items.length > 0 ? (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <article key={String(item.product)} className="cart-item">
                <div className="cart-item__media">
                  <img
                    src={resolveImageUrl(item.image) || fallbackImage}
                    alt={item.name}
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage
                    }}
                  />
                </div>

                <div className="cart-item__content">
                  <Link to={`/products/${item.product}`}>
                    <h2>{item.name}</h2>
                  </Link>
                  <p>{formatMoney(item.price)} each</p>

                  <div className="cart-item__meta">
                    <span>Total: {formatMoney(item.price * item.quantity)}</span>
                    <span>Qty {item.quantity}</span>
                  </div>

                  <div className="cart-item__actions">
                    <button
                      type="button"
                      className="button button--ghost button--compact"
                      onClick={() => handleChangeQuantity(item.product, item.quantity - 1)}
                      disabled={busyItem === item.product || item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity-chip">{item.quantity}</span>
                    <button
                      type="button"
                      className="button button--ghost button--compact"
                      onClick={() => handleChangeQuantity(item.product, item.quantity + 1)}
                      disabled={busyItem === item.product}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="button button--solid button--compact"
                      onClick={() => handleRemove(item.product)}
                      disabled={busyItem === item.product}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary-card">
            <h2>Order summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatMoney(summary.subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <strong>{formatMoney(summary.tax)}</strong>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <strong>{formatMoney(summary.shippingFee)}</strong>
            </div>
            <div className="summary-row summary-row--total">
              <span>Grand total</span>
              <strong>{formatMoney(summary.grandTotal)}</strong>
            </div>

            <div className="cart-summary-actions">
              <Link to="/products" className="button button--ghost">
                Continue shopping
              </Link>
              <Link to="/checkout" className="button button--solid">
                Go to checkout
              </Link>
              <button
                type="button"
                className="button button--ghost"
                onClick={handleClearCart}
                disabled={busyItem === 'clear'}
              >
                Clear cart
              </button>
            </div>

            <p className="form-help">
              Shipping is free on orders above Rs. 1,000.
            </p>
          </aside>
        </div>
      ) : (
        <div className="empty-cart">
          <p className="eyebrow">Cart is empty</p>
          <h2>Add products from the catalog to continue.</h2>
          <Link to="/products" className="button button--solid">
            Browse products
          </Link>
        </div>
      )}
    </section>
  )
}
