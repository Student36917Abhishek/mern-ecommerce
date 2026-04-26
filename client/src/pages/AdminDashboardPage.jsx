import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminNav } from '../components/AdminNav'
import { fetchAdminAuditLogs, fetchAdminDashboard } from '../services/admin'
import { formatPrice } from '../utils/format'

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value))
    : 'N/A'

export function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      try {
        setLoading(true)
        const [dashboardData, logsData] = await Promise.all([
          fetchAdminDashboard(),
          fetchAdminAuditLogs(),
        ])

        if (isMounted) {
          setDashboard(dashboardData)
          setAuditLogs(logsData.logs || [])
          setError('')
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError?.response?.data?.message || 'Unable to load admin dashboard.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const metricCards = useMemo(
    () => {
      const metrics = dashboard?.metrics || {}

      return [
        { label: 'Revenue', value: formatPrice(metrics.totalRevenue), tone: 'strong' },
        { label: 'Orders', value: metrics.totalOrders || 0 },
        { label: 'Products', value: metrics.totalProducts || 0 },
        { label: 'Users', value: metrics.totalUsers || 0 },
        { label: 'Pending', value: metrics.pendingOrders || 0 },
        { label: 'Low stock', value: metrics.lowStockCount || 0, tone: 'danger' },
      ]
    },
    [dashboard],
  )

  const readableAction = (action) =>
    String(action || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())

  if (loading) {
    return <div className="page-status">Loading admin dashboard...</div>
  }

  return (
    <section className="admin-page">
      <AdminNav />

      <header className="catalog-hero">
        <div>
          <p className="eyebrow">Shopora admin</p>
          <h1>Monitor store activity from one dashboard.</h1>
          <p className="hero-text">
            Track sales, orders, stock alerts, users, and the newest activity in your store.
          </p>
        </div>

        <Link to="/admin/products" className="button button--solid">
          Add product
        </Link>
      </header>

      {error ? <div className="catalog-state catalog-state--error">{error}</div> : null}

      <div className="admin-metric-grid">
        {metricCards.map((metric) => (
          <article key={metric.label} className={`admin-metric-card admin-metric-card--${metric.tone || 'default'}`}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <section className="panel-card admin-list-panel">
          <div className="admin-list-panel__header">
            <div>
              <p className="eyebrow">Recent orders</p>
              <h2>Latest sales</h2>
            </div>
            <Link to="/admin/orders" className="button button--ghost button--compact">
              View all
            </Link>
          </div>

          <div className="admin-activity-list">
            {(dashboard?.recentOrders || []).map((order) => (
              <article key={order._id} className="admin-activity-row">
                <div>
                  <strong>#{String(order._id).slice(-6).toUpperCase()}</strong>
                  <span>{order.user?.name || 'Customer'} - {formatDate(order.createdAt)}</span>
                </div>
                <div>
                  <strong>{formatPrice(order.grandTotal)}</strong>
                  <span className="badge">{order.orderStatus}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel-card admin-list-panel">
          <div className="admin-list-panel__header">
            <div>
              <p className="eyebrow">Inventory alerts</p>
              <h2>Low stock products</h2>
            </div>
            <Link to="/admin/products" className="button button--ghost button--compact">
              Manage
            </Link>
          </div>

          <div className="admin-activity-list">
            {(dashboard?.lowStockProducts || []).map((product) => (
              <article key={product._id} className="admin-activity-row">
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.category || 'General'}</span>
                </div>
                <span className={product.stock === 0 ? 'badge badge--danger' : 'badge'}>
                  Stock {product.stock}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="panel-card admin-list-panel">
          <div className="admin-list-panel__header">
            <div>
              <p className="eyebrow">New users</p>
              <h2>Recent registrations</h2>
            </div>
            <Link to="/admin/users" className="button button--ghost button--compact">
              View users
            </Link>
          </div>

          <div className="admin-activity-list">
            {(dashboard?.recentUsers || []).map((user) => (
              <article key={user._id} className="admin-activity-row">
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
                <span className="badge">{user.role}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="panel-card admin-list-panel">
          <div className="admin-list-panel__header">
            <div>
              <p className="eyebrow">Recent audit logs</p>
              <h2>Admin activity</h2>
            </div>
            <span className="badge">{auditLogs.length} entries</span>
          </div>

          <div className="admin-activity-list">
            {auditLogs.map((log) => (
              <article key={log._id} className="admin-activity-row">
                <div>
                  <strong>{readableAction(log.action)}</strong>
                  <span>
                    {log.actor?.name || 'System'} ({log.actorRole}) - {formatDate(log.createdAt)}
                  </span>
                </div>
                <span className="badge">
                  {log.targetType} #{String(log.targetId).slice(-6).toUpperCase()}
                </span>
              </article>
            ))}
          </div>

          {!auditLogs.length ? (
            <div className="empty-cart">
              <p className="eyebrow">No logs yet</p>
              <h2>Audit entries will appear after admin and seller actions.</h2>
            </div>
          ) : null}
        </section>
      </div>
    </section>
  )
}
