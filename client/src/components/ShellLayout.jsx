import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }) =>
  isActive ? 'nav-link nav-link--active' : 'nav-link'

export function ShellLayout() {
  const { user, isAuthenticated, signOut } = useAuth()

  return (
    <div className="app-shell">
      <div className="background-orb background-orb--one" />
      <div className="background-orb background-orb--two" />

      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">M</span>
          <span>
            <strong>Mosaic Mart</strong>
            <small>Internship MVP</small>
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
            <NavLink to="/admin/products" className={navLinkClass}>
              Admin
            </NavLink>
          ) : null}
          <NavLink to="/login" className={navLinkClass}>
            Login
          </NavLink>
          <NavLink to="/register" className={navLinkClass}>
            Register
          </NavLink>
          <NavLink to="/app" className={navLinkClass}>
            Dashboard
          </NavLink>
        </nav>

        <div className="topbar-actions">
          <span className="demo-chip">Day 25 ready</span>
          {isAuthenticated ? (
            <>
              <span className="user-chip">{user?.name || 'User'}</span>
              <button type="button" className="button button--ghost" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/register" className="button button--solid">
              Start building
            </NavLink>
          )}
        </div>
      </header>

      <main className="content-shell">
        <Outlet />
      </main>
    </div>
  )
}