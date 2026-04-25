import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyOrders } from '../services/orders'

const formatMoney = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value) || 0)

const formatDate = (value) => new Date(value).toLocaleDateString('en-IN', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

const statusLabelClass = (status) => {
  if (status === 'delivered') return 'badge badge--good'
  if (status === 'cancelled') return 'badge badge--danger'
  return 'badge'
}

export function MyOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadOrders = async () => {
      try {
        setLoading(true)
        const data = await fetchMyOrders()

        if (!isMounted) {
          return
        }

        setOrders(data.orders || [])
        setError('')
      } catch (requestError) {
        if (isMounted) {
          setError(requestError?.response?.data?.message || 'Unable to load orders.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadOrders()

    return () => {
      isMounted = false
    }
  }, [])

  const hasOrders = useMemo(() => orders.length > 0, [orders])

  if (loading) {
    return <div className="page-status">Loading your orders...</div>
  }

  return (
    <section className="orders-page">
      <header className="catalog-hero">
        <div>
          <p className="eyebrow">Day 22 orders UI</p>
          <h1>Track your order history in one clean, readable timeline.</h1>
          <p className="hero-text">
            This page uses the logged-in user order API and gives a quick summary of each purchase.
          </p>
        </div>

        <div className="orders-summary-pill">
          <strong>{orders.length}</strong>
          <span>orders found</span>
        </div>
      </header>

      {error ? <div className="catalog-state catalog-state--error">{error}</div> : null}

      {hasOrders ? (
        <div className="orders-grid">
          {orders.map((order) => (
            <article key={order._id} className="order-card">
              <div className="order-card__top">
                <div>
                  <p className="eyebrow">Order</p>
                  <h2>#{String(order._id).slice(-6).toUpperCase()}</h2>
                </div>
                <span className={statusLabelClass(order.orderStatus)}>{order.orderStatus}</span>
              </div>

              <div className="order-card__metrics">
                <div>
                  <span>Placed</span>
                  <strong>{formatDate(order.createdAt)}</strong>
                </div>
                <div>
                  <span>Items</span>
                  <strong>{order.totalItems}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>{formatMoney(order.grandTotal)}</strong>
                </div>
              </div>

              <div className="order-card__details">
                <span>Payment: {order.paymentMethod?.toUpperCase()}</span>
                <span>Status: {order.paymentStatus}</span>
              </div>

              <Link to={`/orders/${order._id}`} className="button button--solid">
                View details
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-cart">
          <p className="eyebrow">No orders yet</p>
          <h2>Your purchased items will appear here after checkout.</h2>
          <Link to="/products" className="button button--solid">
            Browse products
          </Link>
        </div>
      )}
    </section>
  )
}