import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminNav } from '../components/AdminNav'
import { fetchAllOrders, updateOrderStatus } from '../services/admin'
import { formatPrice } from '../utils/format'

const orderStatuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled']

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(value))
    : 'N/A'

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyOrderId, setBusyOrderId] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await fetchAllOrders()
      setOrders(data.orders || [])
      setError('')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load admin orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const filteredOrders = useMemo(() => {
    if (filter === 'all') {
      return orders
    }

    return orders.filter((order) => order.orderStatus === filter)
  }, [filter, orders])

  const summary = useMemo(
    () => ({
      total: orders.length,
      revenue: orders.reduce((sum, order) => sum + Number(order.grandTotal || 0), 0),
      pending: orders.filter((order) => order.orderStatus === 'placed').length,
    }),
    [orders],
  )

  const handleStatusChange = async (order, nextStatus) => {
    try {
      setBusyOrderId(order._id)
      setError('')
      setStatusMessage('')
      await updateOrderStatus(order._id, nextStatus)
      await loadOrders()
      setStatusMessage(`Order #${String(order._id).slice(-6).toUpperCase()} moved to ${nextStatus}.`)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to update order status.')
    } finally {
      setBusyOrderId('')
    }
  }

  if (loading) {
    return <div className="page-status">Loading admin orders...</div>
  }

  return (
    <section className="admin-page">
      <AdminNav />

      <header className="catalog-hero">
        <div>
          <p className="eyebrow">Order control</p>
          <h1>View all orders and update fulfillment status.</h1>
          <p className="hero-text">
            Track order totals, customer details, payment mode, and move orders through the delivery flow.
          </p>
        </div>

        <div className="admin-summary-row">
          <div className="admin-summary-pill">
            <strong>{summary.total}</strong>
            <span>orders</span>
          </div>
          <div className="admin-summary-pill">
            <strong>{summary.pending}</strong>
            <span>pending</span>
          </div>
          <div className="admin-summary-pill">
            <strong>{formatPrice(summary.revenue)}</strong>
            <span>revenue</span>
          </div>
        </div>
      </header>

      {error ? <div className="catalog-state catalog-state--error">{error}</div> : null}
      {statusMessage ? <div className="catalog-state">{statusMessage}</div> : null}

      <div className="catalog-toolbar admin-filterbar">
        <label className="search-field">
          <span>Filter by status</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">All orders</option>
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-order-list">
        {filteredOrders.map((order) => (
          <article key={order._id} className="admin-order-card">
            <div className="admin-order-card__main">
              <div>
                <p className="eyebrow">Order #{String(order._id).slice(-6).toUpperCase()}</p>
                <h2>{order.user?.name || 'Customer'}</h2>
                <p>{order.user?.email || 'No email available'}</p>
              </div>

              <div className="admin-order-metrics">
                <span>
                  <strong>{formatPrice(order.grandTotal)}</strong>
                  Total
                </span>
                <span>
                  <strong>{order.totalItems}</strong>
                  Items
                </span>
                <span>
                  <strong>{order.paymentMethod?.toUpperCase()}</strong>
                  Payment
                </span>
              </div>
            </div>

            <div className="admin-order-card__footer">
              <span className="badge">{order.paymentStatus}</span>
              <span className="badge badge--good">{order.orderStatus}</span>
              <span>{formatDate(order.createdAt)}</span>
              <select
                value={order.orderStatus}
                onChange={(event) => handleStatusChange(order, event.target.value)}
                disabled={busyOrderId === order._id}
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <Link to={`/orders/${order._id}`} className="button button--ghost button--compact">
                Details
              </Link>
            </div>
          </article>
        ))}
      </div>

      {!filteredOrders.length ? (
        <div className="empty-cart">
          <p className="eyebrow">No orders</p>
          <h2>No orders match this status yet.</h2>
        </div>
      ) : null}
    </section>
  )
}
