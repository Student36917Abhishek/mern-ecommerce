import { NavLink } from 'react-router-dom'

const adminNavClass = ({ isActive }) =>
  isActive ? 'admin-tab admin-tab--active' : 'admin-tab'

export function AdminNav() {
  return (
    <nav className="admin-tabs" aria-label="Admin navigation">
      <NavLink to="/admin" className={adminNavClass} end>
        Dashboard
      </NavLink>
      <NavLink to="/admin/products" className={adminNavClass}>
        Products
      </NavLink>
      <NavLink to="/admin/orders" className={adminNavClass}>
        Orders
      </NavLink>
      <NavLink to="/admin/users" className={adminNavClass}>
        Users
      </NavLink>
    </nav>
  )
}
