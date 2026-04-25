import { useAuth } from '../context/AuthContext'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <section className="dashboard-grid">
      <div className="dashboard-hero">
        <p className="eyebrow">Protected workspace</p>
        <h1>Hello, {user?.name || 'user'}. The frontend foundation is ready.</h1>
        <p>
          This space will hold products, cart, checkout, and orders as the roadmap continues.
        </p>
      </div>

      <div className="dashboard-cards">
        <article>
          <strong>Auth state</strong>
          <p>Token persistence and route protection are wired.</p>
        </article>
        <article>
          <strong>API client</strong>
          <p>The Axios layer is ready for authenticated backend calls.</p>
        </article>
        <article>
          <strong>Next build</strong>
          <p>Product listing and detail UI can land on Day 19.</p>
        </article>
      </div>
    </section>
  )
}