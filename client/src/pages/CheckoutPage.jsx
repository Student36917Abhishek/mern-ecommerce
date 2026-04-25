import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchCart } from '../services/cart'
import { fetchOrderMeta, placeOrder } from '../services/orders'

const formatMoney = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value) || 0)

const initialAddress = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [orderResult, setOrderResult] = useState(null)
  const [formData, setFormData] = useState(initialAddress)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadCheckout = async () => {
      try {
        setLoading(true)
        const [cartData, metaData] = await Promise.all([fetchCart(), fetchOrderMeta()])

        if (!isMounted) {
          return
        }

        setCart(cartData.cart)
        setMeta(metaData)
        setError('')
      } catch (requestError) {
        if (isMounted) {
          setError(requestError?.response?.data?.message || 'Unable to load checkout.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadCheckout()

    return () => {
      isMounted = false
    }
  }, [])

  const items = cart?.items || []
  const summary = useMemo(() => cart?.summary || {
    totalItems: 0,
    subtotal: 0,
    tax: 0,
    shippingFee: 0,
    grandTotal: 0,
  }, [cart])

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setPlacingOrder(true)
      setError('')
      setStatusMessage('')

      const payload = {
        shippingAddress: formData,
        paymentMethod,
        notes,
      }

      const response = await placeOrder(payload)
      setOrderResult(response.order)
      setStatusMessage('Order placed successfully.')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to place order.')
    } finally {
      setPlacingOrder(false)
    }
  }

  if (loading) {
    return <div className="page-status">Preparing checkout...</div>
  }

  if (!items.length) {
    return (
      <section className="checkout-empty">
        <div className="empty-cart">
          <p className="eyebrow">Checkout unavailable</p>
          <h1>Your cart is empty.</h1>
          <p className="hero-text">Add products before trying to place an order.</p>
          <Link to="/products" className="button button--solid">
            Browse products
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="checkout-page">
      <header className="catalog-hero">
        <div>
          <p className="eyebrow">Day 21 checkout UI</p>
          <h1>Capture shipping details and place the order from a clean checkout screen.</h1>
          <p className="hero-text">
            The checkout flow uses the backend cart totals and places the order as a persisted
            snapshot.
          </p>
        </div>

        <div className="checkout-summary-pill">
          <strong>{summary.totalItems}</strong>
          <span>items ready</span>
        </div>
      </header>

      {error ? <div className="catalog-state catalog-state--error">{error}</div> : null}
      {statusMessage ? <div className="catalog-state">{statusMessage}</div> : null}

      {orderResult ? (
        <div className="checkout-success">
          <p className="eyebrow">Order placed</p>
          <h2>Order #{String(orderResult._id).slice(-6).toUpperCase()} is confirmed.</h2>
          <p>
            Your order snapshot is saved and the cart is cleared. The orders page will be built next.
          </p>

          <div className="checkout-success__actions">
            <Link to="/products" className="button button--ghost">
              Continue browsing
            </Link>
            <Link to="/cart" className="button button--solid">
              Back to cart
            </Link>
          </div>
        </div>
      ) : (
        <div className="checkout-layout">
          <form className="checkout-form panel-card" onSubmit={handleSubmit}>
            <h2>Shipping address</h2>

            <div className="checkout-grid">
              <label>
                Full name
                <input name="fullName" value={formData.fullName} onChange={handleFieldChange} required />
              </label>
              <label>
                Phone
                <input name="phone" value={formData.phone} onChange={handleFieldChange} required />
              </label>
              <label className="checkout-grid__full">
                Address line 1
                <input name="line1" value={formData.line1} onChange={handleFieldChange} required />
              </label>
              <label className="checkout-grid__full">
                Address line 2
                <input name="line2" value={formData.line2} onChange={handleFieldChange} />
              </label>
              <label>
                City
                <input name="city" value={formData.city} onChange={handleFieldChange} required />
              </label>
              <label>
                State
                <input name="state" value={formData.state} onChange={handleFieldChange} required />
              </label>
              <label>
                Postal code
                <input name="postalCode" value={formData.postalCode} onChange={handleFieldChange} required />
              </label>
              <label>
                Country
                <input name="country" value={formData.country} onChange={handleFieldChange} required />
              </label>
            </div>

            <label>
              Payment method
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                {(meta?.paymentMethods || ['cod', 'card', 'upi']).map((method) => (
                  <option key={method} value={method}>
                    {method.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Order notes
              <textarea
                rows="4"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Delivery instructions or short note"
              />
            </label>

            <div className="checkout-actions">
              <Link to="/cart" className="button button--ghost">
                Back to cart
              </Link>
              <button type="submit" className="button button--solid" disabled={placingOrder}>
                {placingOrder ? 'Placing order...' : 'Place order'}
              </button>
            </div>
          </form>

          <aside className="checkout-summary panel-card">
            <h2>Order summary</h2>
            <div className="checkout-items">
              {items.map((item) => (
                <div key={String(item.product)} className="checkout-item-row">
                  <div>
                    <strong>{item.name}</strong>
                    <span>Qty {item.quantity}</span>
                  </div>
                  <strong>{formatMoney(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>

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

            <p className="form-help">
              Payment methods: {(meta?.paymentMethods || ['cod', 'card', 'upi']).join(', ').toUpperCase()}.
            </p>
          </aside>
        </div>
      )}
    </section>
  )
}