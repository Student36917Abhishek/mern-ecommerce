import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="auth-screen">
      <div className="auth-card">
        <p className="eyebrow">404</p>
        <h1>This route does not exist.</h1>
        <p className="hero-text">Use the navigation to return to the app shell.</p>
        <Link to="/" className="button button--solid">
          Go home
        </Link>
      </div>
    </section>
  )
}