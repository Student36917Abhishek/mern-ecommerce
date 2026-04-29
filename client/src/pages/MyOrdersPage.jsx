import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import fallbackImage from '../assets/hero.png'
import { fetchMyOrders } from '../services/orders'
import { resolveImageUrl } from '../utils/image'

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

const getItemIdLabel = (item) => {
  const rawId = item?.product?._id || item?.product || ''
  const shortId = String(rawId).slice(-8).toUpperCase()
  return shortId ? `ID: ${shortId}` : 'ID: N/A'
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
          <p className="eyebrow">My orders</p>
          <h1>Track your Shopora order history.</h1>
          <p className="hero-text">
            Review recent purchases, payment status, delivery status, and order details.
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

              <div className="order-card__items">
                {(order.orderItems || []).map((item) => (
                  <div key={String(item.product?._id || item.product)} className="order-card__item">
                    <div className="order-card__media">
                      <img
                        src={resolveImageUrl(item.image) || fallbackImage}
                        alt={item.name}
                        onError={(event) => {
                          event.currentTarget.src = fallbackImage
                        }}
                      />
                    </div>
                    <div className="order-card__item-body">
                      <strong>{item.name}</strong>
                      <span>{formatMoney(item.price)} each</span>
                      <small>{getItemIdLabel(item)}</small>
                    </div>
                  </div>
                ))}
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
