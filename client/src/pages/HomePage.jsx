import { Link } from 'react-router-dom'

const highlights = [
  {
    title: 'Fast product browsing',
    text: 'A clean entry point for products, filters, and product detail pages.',
  },
  {
    title: 'Auth-first navigation',
    text: 'The app shell already understands login, register, and protected flows.',
  },
  {
    title: 'Backend-ready structure',
    text: 'Service layer and auth context are prepared for the Day 18-24 features.',
  },
  {
    title: 'Catalog-first demo path',
    text: 'Product browsing now connects directly to the backend product API.',
  },
]

export function HomePage() {
  return (
    <section className="hero-grid">
      <div className="hero-copy">
        <p className="eyebrow">Day 25 demo-ready polish</p>
        <h1>Build an e-commerce demo that feels crafted, clean, and complete.</h1>
        <p className="hero-text">
          This frontend now covers the full internship MVP loop: routing, auth, catalog, cart,
          checkout, orders, and admin product management with a more finished presentation.
        </p>

        <div className="hero-actions">
          <Link to="/products" className="button button--solid">
            Browse products
          </Link>
          <Link to="/register" className="button button--solid">
            Create account
          </Link>
          <Link to="/login" className="button button--ghost">
            Sign in
          </Link>
        </div>
      </div>

      <aside className="hero-panel">
        <div className="stats-card">
          <span className="stats-label">Demo ready</span>
          <strong>Router + auth + commerce flow</strong>
          <p>The MVP now reads like a finished store experience for walkthroughs and demos.</p>
        </div>

        <div className="highlight-list">
          {highlights.map((item) => (
            <article key={item.title} className="highlight-card">
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </aside>
    </section>
  )
}