import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchCart } from '../services/cart'
import { fetchMyOrders } from '../services/orders'

const emptyAddress = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: true,
}

export function DashboardPage() {
  const { user, updateProfile } = useAuth()
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
  })
  const [addressForm, setAddressForm] = useState(emptyAddress)
  const [ordersCount, setOrdersCount] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      avatar: user?.avatar || '',
    })
  }, [user])

  useEffect(() => {
    let isMounted = true

    const loadAccountSummary = async () => {
      try {
        setLoadingSummary(true)
        const [cartData, ordersData] = await Promise.all([fetchCart(), fetchMyOrders()])

        if (!isMounted) {
          return
        }

        setCartCount(cartData?.summary?.totalItems || cartData?.cart?.totalItems || 0)
        setOrdersCount(ordersData?.orders?.length || 0)
      } catch {
        if (isMounted) {
          setError('Account summary could not be loaded right now.')
        }
      } finally {
        if (isMounted) {
          setLoadingSummary(false)
        }
      }
    }

    loadAccountSummary()

    return () => {
      isMounted = false
    }
  }, [])

  const savedAddresses = useMemo(() => user?.addresses || [], [user])

  const avatarInitial = useMemo(() => (
    user?.name?.trim()?.charAt(0)?.toUpperCase() || 'S'
  ), [user])

  const handleProfileChange = (event) => {
    const { name, value } = event.target
    setProfileForm((current) => ({ ...current, [name]: value }))
  }

  const handleAddressChange = (event) => {
    const { name, type, checked, value } = event.target
    setAddressForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()

    try {
      setSavingProfile(true)
      setError('')
      setMessage('')
      await updateProfile({
        name: profileForm.name.trim(),
        avatar: profileForm.avatar.trim(),
        addresses: savedAddresses,
      })
      setMessage('Profile updated successfully.')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAddressSubmit = async (event) => {
    event.preventDefault()

    const nextAddress = {
      ...addressForm,
      fullName: addressForm.fullName.trim(),
      phone: addressForm.phone.trim(),
      line1: addressForm.line1.trim(),
      line2: addressForm.line2.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      postalCode: addressForm.postalCode.trim(),
      country: addressForm.country.trim(),
    }

    const nextAddresses = addressForm.isDefault
      ? [nextAddress, ...savedAddresses.map((address) => ({ ...address, isDefault: false }))]
      : [...savedAddresses, nextAddress]

    try {
      setSavingAddress(true)
      setError('')
      setMessage('')
      await updateProfile({
        name: user?.name || profileForm.name,
        avatar: user?.avatar || profileForm.avatar,
        addresses: nextAddresses,
      })
      setAddressForm(emptyAddress)
      setMessage('Shipping address saved.')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to save address.')
    } finally {
      setSavingAddress(false)
    }
  }

  const handleRemoveAddress = async (indexToRemove) => {
    const nextAddresses = savedAddresses.filter((_, index) => index !== indexToRemove)

    try {
      setError('')
      setMessage('')
      await updateProfile({
        name: user?.name || profileForm.name,
        avatar: user?.avatar || profileForm.avatar,
        addresses: nextAddresses,
      })
      setMessage('Address removed.')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to remove address.')
    }
  }

  return (
    <section className="account-page">
      <header className="account-hero">
        <div className="account-avatar">
          {user?.avatar ? <img src={user.avatar} alt={user.name} /> : <span>{avatarInitial}</span>}
        </div>
        <div>
          <p className="eyebrow">Shopora account</p>
          <h1>Hello, {user?.name || 'user'}.</h1>
          <p className="hero-text">
            Manage your profile, saved shipping address, cart, orders, and account access.
          </p>
        </div>
        <div className="account-status">
          <span className={user?.isEmailVerified ? 'badge badge--good' : 'badge'}>
            {user?.isEmailVerified ? 'Email verified' : 'Email not verified'}
          </span>
          <span className="badge">{user?.role || 'user'}</span>
        </div>
      </header>

      {message ? <div className="catalog-state">{message}</div> : null}
      {error ? <div className="catalog-state catalog-state--error">{error}</div> : null}

      <div className="account-stats">
        <article>
          <span>Cart items</span>
          <strong>{loadingSummary ? '...' : cartCount}</strong>
          <Link to="/cart">Open cart</Link>
        </article>
        <article>
          <span>Total orders</span>
          <strong>{loadingSummary ? '...' : ordersCount}</strong>
          <Link to="/orders">View orders</Link>
        </article>
        <article>
          <span>Saved addresses</span>
          <strong>{savedAddresses.length}</strong>
          <a href="#address-form">Add address</a>
        </article>
        {user?.role === 'admin' ? (
          <article>
            <span>Admin access</span>
            <strong>On</strong>
            <Link to="/admin">Open admin</Link>
          </article>
        ) : user?.role === 'seller' ? (
          <article>
            <span>Seller access</span>
            <strong>On</strong>
            <Link to="/seller/products">Manage products</Link>
          </article>
        ) : (
          <article>
            <span>Seller access</span>
            <strong>{user?.sellerRequest?.status === 'pending' ? 'Pending' : 'Off'}</strong>
            <Link to="/sell">Request seller access</Link>
          </article>
        )}
      </div>

      <div className="account-layout">
        <form className="panel-card account-form" onSubmit={handleProfileSubmit}>
          <div>
            <p className="eyebrow">Profile</p>
            <h2>Personal information</h2>
          </div>

          <label>
            Full name
            <input name="name" value={profileForm.name} onChange={handleProfileChange} required />
          </label>

          <label>
            Email
            <input value={user?.email || ''} disabled />
          </label>

          <label>
            Avatar image URL
            <input
              name="avatar"
              value={profileForm.avatar}
              onChange={handleProfileChange}
              placeholder="https://example.com/avatar.jpg"
            />
          </label>

          <div className="account-actions">
            <button type="submit" className="button button--solid" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>

        <form id="address-form" className="panel-card account-form" onSubmit={handleAddressSubmit}>
          <div>
            <p className="eyebrow">Shipping</p>
            <h2>Add delivery address</h2>
          </div>

          <div className="account-form-grid">
            <label>
              Full name
              <input name="fullName" value={addressForm.fullName} onChange={handleAddressChange} required />
            </label>
            <label>
              Phone
              <input name="phone" value={addressForm.phone} onChange={handleAddressChange} required />
            </label>
            <label className="account-form-grid__full">
              Address line 1
              <input name="line1" value={addressForm.line1} onChange={handleAddressChange} required />
            </label>
            <label className="account-form-grid__full">
              Address line 2
              <input name="line2" value={addressForm.line2} onChange={handleAddressChange} />
            </label>
            <label>
              City
              <input name="city" value={addressForm.city} onChange={handleAddressChange} required />
            </label>
            <label>
              State
              <input name="state" value={addressForm.state} onChange={handleAddressChange} required />
            </label>
            <label>
              Postal code
              <input name="postalCode" value={addressForm.postalCode} onChange={handleAddressChange} required />
            </label>
            <label>
              Country
              <input name="country" value={addressForm.country} onChange={handleAddressChange} required />
            </label>
          </div>

          <label className="checkbox-row">
            <input
              name="isDefault"
              type="checkbox"
              checked={addressForm.isDefault}
              onChange={handleAddressChange}
            />
            Set as default shipping address
          </label>

          <div className="account-actions">
            <button type="submit" className="button button--solid" disabled={savingAddress}>
              {savingAddress ? 'Saving...' : 'Save address'}
            </button>
          </div>
        </form>
      </div>

      <section className="panel-card saved-addresses">
        <div>
          <p className="eyebrow">Saved addresses</p>
          <h2>Delivery addresses</h2>
        </div>

        {savedAddresses.length ? (
          <div className="address-list">
            {savedAddresses.map((address, index) => (
              <article key={`${address.line1}-${address.postalCode}-${index}`} className="address-card">
                <div>
                  <div className="address-card__header">
                    <strong>{address.fullName}</strong>
                    {address.isDefault ? <span className="badge badge--good">Default</span> : null}
                  </div>
                  <p>{address.line1}</p>
                  {address.line2 ? <p>{address.line2}</p> : null}
                  <p>
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p>{address.country}</p>
                  <p>Phone: {address.phone}</p>
                </div>
                <button
                  type="button"
                  className="button button--ghost button--compact"
                  onClick={() => handleRemoveAddress(index)}
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-cart">
            <p className="eyebrow">No saved address</p>
            <h2>Add one delivery address to speed up checkout.</h2>
          </div>
        )}
      </section>
    </section>
  )
}
