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
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const [error, setError] = useState('')

  const loadDashboard = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const [dashboardData, logsData] = await Promise.all([
        fetchAdminDashboard(),
        fetchAdminAuditLogs(),
      ])

      setDashboard(dashboardData)
      setAuditLogs(logsData.logs || [])
      setLastUpdated(new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }))
      setError('')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load admin dashboard.')
    } finally {
      if (silent) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const metrics = dashboard?.metrics || {}

  const metricCards = useMemo(
    () => {
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

  const deliveryRate = useMemo(() => {
    const totalOrders = Number(metrics.totalOrders || 0)
    const deliveredOrders = Number(metrics.deliveredOrders || 0)

    if (!totalOrders) {
      return 0
    }

    return Math.round((deliveredOrders / totalOrders) * 100)
  }, [metrics.deliveredOrders, metrics.totalOrders])

  const quickActions = [
    {
      title: 'Manage products',
      text: 'Create listings, update prices, and fix stock quickly.',
      link: '/admin/products',
      cta: 'Open products',
    },
    {
      title: 'Track orders',
      text: 'Review incoming orders and update fulfillment status.',
      link: '/admin/orders',
      cta: 'Open orders',
    },
    {
      title: 'Review users',
      text: 'Check newly registered users and roles.',
      link: '/admin/users',
      cta: 'Open users',
    },
  ]

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

      <header className="catalog-hero admin-dashboard-hero">
        <div>
          <p className="eyebrow">Shopora admin</p>
          <h1>Monitor store activity from one dashboard.</h1>
          <p className="hero-text">
            Track sales, orders, stock alerts, users, and the newest activity in your store.
          </p>
        </div>

        <div className="admin-dashboard-actions">
          <Link to="/admin/products" className="button button--solid">
            Add product
          </Link>
          <Link to="/admin/orders" className="button button--ghost">
            View orders
          </Link>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => loadDashboard({ silent: true })}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <span className="admin-last-updated">Updated {lastUpdated || 'just now'}</span>
        </div>
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

      <div className="admin-health-strip">
        <article className="admin-health-card">
          <p>Fulfillment rate</p>
          <strong>{deliveryRate}%</strong>
          <span>{metrics.deliveredOrders || 0} delivered of {metrics.totalOrders || 0} total orders</span>
        </article>
        <article className="admin-health-card">
          <p>Pending queue</p>
          <strong>{metrics.pendingOrders || 0}</strong>
          <span>Orders waiting for processing</span>
        </article>
        <article className="admin-health-card">
          <p>Low stock alerts</p>
          <strong>{metrics.lowStockCount || 0}</strong>
          <span>Products at or below stock threshold</span>
        </article>
      </div>

      <section className="admin-quick-actions-grid">
        {quickActions.map((item) => (
          <article key={item.title} className="panel-card admin-quick-action-card">
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <Link to={item.link} className="button button--ghost button--compact">
              {item.cta}
            </Link>
          </article>
        ))}
      </section>

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

            {!(dashboard?.recentOrders || []).length ? (
              <div className="admin-panel-empty">
                <p>No orders yet.</p>
              </div>
            ) : null}
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

            {!(dashboard?.lowStockProducts || []).length ? (
              <div className="admin-panel-empty">
                <p>Great! No low stock products right now.</p>
              </div>
            ) : null}
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
                <div className="admin-user-role-stack">
                  <span className="badge">{user.role}</span>
                  <span className={user.isEmailVerified ? 'badge badge--good' : 'badge'}>
                    {user.isEmailVerified ? 'verified' : 'unverified'}
                  </span>
                </div>
              </article>
            ))}

            {!(dashboard?.recentUsers || []).length ? (
              <div className="admin-panel-empty">
                <p>No recent registrations to show.</p>
              </div>
            ) : null}
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
            <div className="admin-panel-empty">
              <p>No audit logs yet. Admin and seller actions will appear here.</p>
            </div>
          ) : null}
        </section>
      </div>
    </section>
  )
}
