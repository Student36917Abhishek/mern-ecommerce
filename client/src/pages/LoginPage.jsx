import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { signIn, isAuthenticated, loading, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (loading) {
    return <div className="page-status">Checking your account...</div>
  }

  if (isAuthenticated) {
    const roleHome = user?.role === 'admin' ? '/admin' : user?.role === 'seller' ? '/seller/products' : '/app'
    return <Navigate to={roleHome} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    const payload = {
      email: formData.get('email'),
      password: formData.get('password'),
    }

    try {
      const data = await signIn(payload)
      const roleHome = data?.user?.role === 'admin'
        ? '/admin'
        : data?.user?.role === 'seller'
          ? '/seller/products'
          : '/app'
      navigate(location.state?.from?.pathname || roleHome, { replace: true })
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Login failed. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-screen">
      <div className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to your Shopora account.</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>

          <label>
            Password
            <div className="field-row">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="field-toggle"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <p className="form-help">Use your registered email and password.</p>
          <p className="form-help">
            Admin login uses the same form. Default admin: <strong>admin@ecommerce.com</strong> / <strong>Admin@123</strong>
          </p>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="button button--solid" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footnote">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  )
}
