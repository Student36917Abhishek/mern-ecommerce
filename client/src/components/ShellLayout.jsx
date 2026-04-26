import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }) =>
  isActive ? 'nav-link nav-link--active' : 'nav-link'

export function ShellLayout() {
  const { user, isAuthenticated, signOut } = useAuth()

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">S</span>
          <span>
            <strong>Shopora</strong>
            <small>Your everyday store</small>
          </span>
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>
          <NavLink to="/cart" className={navLinkClass}>
            Cart
          </NavLink>
          <NavLink to="/orders" className={navLinkClass}>
            Orders
          </NavLink>
          {user?.role === 'admin' ? (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          ) : user?.role === 'seller' ? (
            <NavLink to="/seller/products" className={navLinkClass}>
              Seller
            </NavLink>
          ) : isAuthenticated ? (
            <NavLink to="/sell" className={navLinkClass}>
              Sell
            </NavLink>
          ) : null}
          {isAuthenticated ? (
            <NavLink to="/app" className={navLinkClass}>
              Account
            </NavLink>
          ) : null}
        </nav>

        <div className="topbar-actions">
          {isAuthenticated ? (
            <>
              <span className="user-chip">{user?.name || 'User'}</span>
              <button type="button" className="button button--ghost" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="button button--ghost">
                Sign in
              </NavLink>
              <NavLink to="/register" className="button button--solid">
                Register
              </NavLink>
            </>
          )}
        </div>
      </header>

      <main className="content-shell">
        <Outlet />
      </main>
    </div>
  )
}
