import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchOrderById } from '../services/orders'

const formatMoney = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value) || 0)

const formatDate = (value) => new Date(value).toLocaleString('en-IN', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const trackingSteps = ['placed', 'processing', 'shipped', 'delivered']

export function OrderDetailPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadOrder = async () => {
      try {
        setLoading(true)
        const data = await fetchOrderById(orderId)

        if (!isMounted) {
          return
        }

        setOrder(data.order)
        setError('')
      } catch (requestError) {
        if (isMounted) {
          setError(requestError?.response?.data?.message || 'Unable to load order details.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadOrder()

    return () => {
      isMounted = false
    }
  }, [orderId])

  const activeStepIndex = useMemo(() => {
    if (!order) return 0
    const nextIndex = trackingSteps.indexOf(order.orderStatus)
    return nextIndex === -1 ? 0 : nextIndex
  }, [order])

  if (loading) {
    return <div className="page-status">Loading order details...</div>
  }

  if (error) {
    return (
      <section className="auth-screen">
        <div className="auth-card">
          <p className="eyebrow">Order unavailable</p>
          <h1>{error}</h1>
          <Link to="/orders" className="button button--solid">
            Back to orders
          </Link>
        </div>
      </section>
    )
  }

  if (!order) {
    return null
  }

  return (
    <section className="order-detail-page">
      <Link to="/orders" className="back-link">
        Back to orders
      </Link>

      <header className="catalog-hero">
        <div>
          <p className="eyebrow">Order tracking</p>
          <h1>Order #{String(order._id).slice(-6).toUpperCase()}</h1>
          <p className="hero-text">
            Review the shipping details, item snapshot, and fulfillment status for this purchase.
          </p>
        </div>

        <div className="order-detail-pill">
          <strong>{order.orderStatus}</strong>
          <span>{order.isPaid ? 'Paid' : 'Payment pending'}</span>
        </div>
      </header>

      <div className="order-detail-layout">
        <div className="order-detail-main">
          <article className="panel-card order-panel">
            <h2>Tracking</h2>
            <div className="tracking-timeline">
              {trackingSteps.map((step, index) => (
                <div
                  key={step}
                  className={index <= activeStepIndex ? 'timeline-step timeline-step--active' : 'timeline-step'}
                >
                  <span />
                  <strong>{step}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel-card order-panel">
            <h2>Items</h2>
            <div className="order-items-list">
              {order.orderItems.map((item) => (
                <div key={String(item.product?._id || item.product)} className="order-item-row">
                  <img src={item.image || 'https://placehold.co/120x120?text=Item'} alt={item.name} />
                  <div>
                    <strong>{item.name}</strong>
                    <span>Qty {item.quantity}</span>
                  </div>
                  <strong>{formatMoney(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="order-detail-side">
          <article className="panel-card order-panel">
            <h2>Shipping</h2>
            <div className="order-address">
              <strong>{order.shippingAddress.fullName}</strong>
              <span>{order.shippingAddress.line1}</span>
              {order.shippingAddress.line2 ? <span>{order.shippingAddress.line2}</span> : null}
              <span>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </span>
              <span>{order.shippingAddress.country}</span>
              <span>{order.shippingAddress.phone}</span>
            </div>
          </article>

          <article className="panel-card order-panel">
            <h2>Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatMoney(order.subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <strong>{formatMoney(order.tax)}</strong>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <strong>{formatMoney(order.shippingFee)}</strong>
            </div>
            <div className="summary-row summary-row--total">
              <span>Grand total</span>
              <strong>{formatMoney(order.grandTotal)}</strong>
            </div>
            <div className="order-meta-list">
              <span>Payment method: {order.paymentMethod.toUpperCase()}</span>
              <span>Payment status: {order.paymentStatus}</span>
              <span>Placed: {formatDate(order.createdAt)}</span>
              {order.deliveredAt ? <span>Delivered: {formatDate(order.deliveredAt)}</span> : null}
            </div>
          </article>
        </aside>
      </div>
    </section>
  )
}