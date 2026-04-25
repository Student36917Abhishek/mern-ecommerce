import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const { signUp, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (loading) {
    return <div className="page-status">Preparing sign-up...</div>
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    }

    try {
      await signUp(payload)
      navigate('/app', { replace: true })
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Registration failed. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-screen">
      <div className="auth-card">
        <p className="eyebrow">Create your account</p>
        <h1>Set up the user journey from the first click.</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input name="name" type="text" placeholder="Abhishek" required />
          </label>
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
                placeholder="Create a password"
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

          <p className="form-help">A demo account will be enough for the Day 19 product flow.</p>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="button button--solid" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-footnote">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  )
}