import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function SellerHubPage() {
  const navigate = useNavigate()
  const { user, submitSellerRequest } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [note, setNote] = useState('')

  const isAdmin = user?.role === 'admin'
  const isSeller = user?.role === 'seller'
  const requestStatus = user?.sellerRequest?.status || 'none'

  const handleSubmitRequest = async () => {
    try {
      setIsSubmitting(true)
      setError('')
      setMessage('')
      const data = await submitSellerRequest({ note })
      setMessage(data?.message || 'Seller request submitted.')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to submit seller request right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="admin-page">
      <header className="catalog-hero">
        <div>
          <p className="eyebrow">Seller hub</p>
          <h1>Start selling on Shopora.</h1>
          <p className="hero-text">
            Submit your seller request to start listing products. Once approved by admin, you can
            manage your own product inventory.
          </p>
        </div>

        {isAdmin ? (
          <Link to="/admin" className="button button--solid">
            Open admin dashboard
          </Link>
        ) : isSeller ? (
          <button type="button" className="button button--solid" onClick={() => navigate('/seller/products')}>
            Open seller products
          </button>
        ) : requestStatus === 'pending' ? (
          <span className="badge">Seller request pending approval</span>
        ) : (
          <button type="button" className="button button--solid" onClick={handleSubmitRequest} disabled={isSubmitting}>
            {isSubmitting
              ? 'Submitting request...'
              : requestStatus === 'rejected'
                ? 'Resubmit seller request'
                : 'Submit seller request'}
          </button>
        )}
      </header>

      {error ? <div className="catalog-state catalog-state--error">{error}</div> : null}
      {message ? <div className="catalog-state">{message}</div> : null}
      {requestStatus === 'rejected' ? (
        <div className="catalog-state catalog-state--error">Your previous request was rejected. You can resubmit with more details.</div>
      ) : null}

      {!isAdmin && !isSeller && requestStatus !== 'pending' ? (
        <div className="catalog-toolbar">
          <label className="search-field">
            <span>Why do you want to sell? (optional)</span>
            <textarea
              rows="4"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Tell us what products you want to list."
            />
          </label>
        </div>
      ) : null}

      <div className="admin-dashboard-grid">
        <article className="admin-metric-card">
          <span>Product catalog</span>
          <strong>Create and edit listings</strong>
        </article>
        <article className="admin-metric-card">
          <span>Inventory</span>
          <strong>Control stock in real time</strong>
        </article>
        <article className="admin-metric-card">
          <span>Orders</span>
          <strong>Track and update fulfillment</strong>
        </article>
      </div>
    </section>
  )
}