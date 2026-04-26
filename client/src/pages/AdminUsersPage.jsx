import { useEffect, useMemo, useState } from 'react'
import { AdminNav } from '../components/AdminNav'
import { fetchRegisteredUsers, fetchSellerRequests, reviewSellerRequest } from '../services/admin'

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value))
    : 'N/A'

export function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sellerRequests, setSellerRequests] = useState([])
  const [busyRequestId, setBusyRequestId] = useState('')
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const loadUsers = async () => {
    const data = await fetchRegisteredUsers()
    setUsers(data.users || [])
  }

  const loadSellerRequests = async () => {
    const data = await fetchSellerRequests()
    setSellerRequests(data.requests || [])
  }

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        const [usersData, requestsData] = await Promise.all([
          fetchRegisteredUsers(),
          fetchSellerRequests(),
        ])

        if (isMounted) {
          setUsers(usersData.users || [])
          setSellerRequests(requestsData.requests || [])
          setError('')
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError?.response?.data?.message || 'Unable to load registered users.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSellerRequest = async (requestUser, action) => {
    try {
      setBusyRequestId(requestUser._id)
      setError('')
      setStatusMessage('')
      await reviewSellerRequest(requestUser._id, action)
      await Promise.all([loadUsers(), loadSellerRequests()])
      setStatusMessage(`${requestUser.name} request ${action}d.`)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to review seller request.')
    } finally {
      setBusyRequestId('')
    }
  }

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) {
      return users
    }

    return users.filter((user) =>
      [user.name, user.email, user.role].some((value) => String(value || '').toLowerCase().includes(term)),
    )
  }, [search, users])

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((user) => user.role === 'admin').length,
      verified: users.filter((user) => user.isEmailVerified).length,
    }),
    [users],
  )

  if (loading) {
    return <div className="page-status">Loading registered users...</div>
  }

  return (
    <section className="admin-page">
      <AdminNav />

      <header className="catalog-hero">
        <div>
          <p className="eyebrow">Customer directory</p>
          <h1>View registered users and account activity.</h1>
          <p className="hero-text">
            Review customer accounts, admin roles, email verification, and saved shipping addresses.
          </p>
        </div>

        <div className="admin-summary-row">
          <div className="admin-summary-pill">
            <strong>{stats.total}</strong>
            <span>users</span>
          </div>
          <div className="admin-summary-pill">
            <strong>{stats.admins}</strong>
            <span>admins</span>
          </div>
          <div className="admin-summary-pill">
            <strong>{stats.verified}</strong>
            <span>verified</span>
          </div>
        </div>
      </header>

      {error ? <div className="catalog-state catalog-state--error">{error}</div> : null}
      {statusMessage ? <div className="catalog-state">{statusMessage}</div> : null}

      <section className="panel-card admin-list-panel">
        <div className="admin-list-panel__header">
          <div>
            <p className="eyebrow">Seller approvals</p>
            <h2>Pending seller requests</h2>
          </div>
          <span className="badge">{sellerRequests.length} pending</span>
        </div>

        <div className="admin-activity-list">
          {sellerRequests.map((requestUser) => (
            <article key={requestUser._id} className="admin-activity-row">
              <div>
                <strong>{requestUser.name}</strong>
                <span>{requestUser.email}</span>
                <span>{requestUser.sellerRequest?.note || 'No note provided.'}</span>
              </div>
              <div className="admin-summary-row">
                <button
                  type="button"
                  className="button button--ghost button--compact"
                  onClick={() => handleSellerRequest(requestUser, 'reject')}
                  disabled={busyRequestId === requestUser._id}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="button button--solid button--compact"
                  onClick={() => handleSellerRequest(requestUser, 'approve')}
                  disabled={busyRequestId === requestUser._id}
                >
                  Approve
                </button>
              </div>
            </article>
          ))}
        </div>

        {!sellerRequests.length ? (
          <div className="empty-cart">
            <p className="eyebrow">No pending requests</p>
            <h2>All seller requests are reviewed.</h2>
          </div>
        ) : null}
      </section>

      <div className="catalog-toolbar">
        <label className="search-field">
          <span>Search users</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or role"
          />
        </label>
      </div>

      <div className="admin-user-grid">
        {filteredUsers.map((user) => (
          <article key={user._id} className="admin-user-card">
            <div className="account-avatar admin-user-avatar">
              {user.avatar ? <img src={user.avatar} alt={user.name} /> : <span>{user.name?.charAt(0) || 'U'}</span>}
            </div>

            <div>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
            </div>

            <div className="admin-user-badges">
              <span className={user.role === 'admin' ? 'badge badge--good' : 'badge'}>{user.role}</span>
              <span className={user.isEmailVerified ? 'badge badge--good' : 'badge'}>
                {user.isEmailVerified ? 'verified' : 'unverified'}
              </span>
            </div>

            <div className="admin-user-meta">
              <span>Joined {formatDate(user.createdAt)}</span>
              <span>{user.addresses?.length || 0} saved address(es)</span>
            </div>
          </article>
        ))}
      </div>

      {!filteredUsers.length ? (
        <div className="empty-cart">
          <p className="eyebrow">No users found</p>
          <h2>Try a different search term.</h2>
        </div>
      ) : null}
    </section>
  )
}
