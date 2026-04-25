import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="page-status">Loading your workspace...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <section className="auth-screen">
        <div className="auth-card">
          <p className="eyebrow">Access denied</p>
          <h1>You do not have permission to open this page.</h1>
          <p className="hero-text">This area is restricted to admin users.</p>
          <Link to="/app" className="button button--solid">
            Go to dashboard
          </Link>
        </div>
      </section>
    )
  }

  return children
}