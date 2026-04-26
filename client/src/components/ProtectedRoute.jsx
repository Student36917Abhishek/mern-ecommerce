import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, requiredRole, requiredRoles }) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="page-status">Loading your workspace...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const allowedRoles = Array.isArray(requiredRoles) && requiredRoles.length
    ? requiredRoles
    : requiredRole
      ? [requiredRole]
      : []

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <section className="auth-screen">
        <div className="auth-card">
          <p className="eyebrow">Access denied</p>
          <h1>You do not have permission to open this page.</h1>
          <p className="hero-text">This area is restricted to admin users.</p>
          <div className="hero-actions">
            <Link to="/sell" className="button button--solid">
              Become a seller
            </Link>
            <Link to="/app" className="button button--ghost">
              Go to dashboard
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return children
}