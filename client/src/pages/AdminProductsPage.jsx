import { useEffect, useMemo, useState } from 'react'
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from '../services/products'

const initialForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
  image: '',
}

const formatMoney = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value) || 0)

export function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busyProductId, setBusyProductId] = useState('')
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [formData, setFormData] = useState(initialForm)

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await fetchProducts({ limit: 100, sort: 'newest' })
      setProducts(data.products || [])
      setError('')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const isEditing = Boolean(selectedProduct)

  const formTitle = useMemo(
    () => (isEditing ? `Edit ${selectedProduct?.name || 'product'}` : 'Add a new product'),
    [isEditing, selectedProduct],
  )

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const resetForm = () => {
    setSelectedProduct(null)
    setFormData(initialForm)
    setStatusMessage('')
  }

  const beginEdit = (product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      category: product.category || '',
      stock: String(product.stock ?? ''),
      image: product.image || '',
    })
    setStatusMessage('Editing product from list.')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setStatusMessage('')

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category.trim(),
        stock: Number(formData.stock),
        image: formData.image.trim(),
      }

      if (isEditing) {
        await updateProduct(selectedProduct._id, payload)
        setStatusMessage('Product updated successfully.')
      } else {
        await createProduct(payload)
        setStatusMessage('Product created successfully.')
      }

      await loadProducts()
      resetForm()
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to save product.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Delete ${product.name}?`)
    if (!confirmed) {
      return
    }

    try {
      setBusyProductId(product._id)
      setError('')
      setStatusMessage('')
      await deleteProduct(product._id)

      if (selectedProduct?._id === product._id) {
        resetForm()
      }

      await loadProducts()
      setStatusMessage('Product deleted successfully.')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to delete product.')
    } finally {
      setBusyProductId('')
    }
  }

  if (loading) {
    return <div className="page-status">Loading admin products...</div>
  }

  return (
    <section className="admin-page">
      <header className="catalog-hero">
        <div>
          <p className="eyebrow">Day 23 admin UI</p>
          <h1>Manage products from one focused admin workspace.</h1>
          <p className="hero-text">
            Add new catalog items, edit existing inventory, and remove products with a simple
            backend-connected admin panel.
          </p>
        </div>

        <div className="admin-summary-pill">
          <strong>{products.length}</strong>
          <span>products managed</span>
        </div>
      </header>

      {error ? <div className="catalog-state catalog-state--error">{error}</div> : null}
      {statusMessage ? <div className="catalog-state">{statusMessage}</div> : null}

      <div className="admin-layout">
        <form className="panel-card admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__header">
            <div>
              <p className="eyebrow">Product form</p>
              <h2>{formTitle}</h2>
            </div>

            {isEditing ? (
              <button type="button" className="button button--ghost" onClick={resetForm}>
                Cancel edit
              </button>
            ) : null}
          </div>

          <div className="admin-form-grid">
            <label>
              Name
              <input name="name" value={formData.name} onChange={handleFieldChange} required />
            </label>
            <label>
              Category
              <input name="category" value={formData.category} onChange={handleFieldChange} />
            </label>
            <label>
              Price
              <input name="price" type="number" min="0" value={formData.price} onChange={handleFieldChange} required />
            </label>
            <label>
              Stock
              <input name="stock" type="number" min="0" value={formData.stock} onChange={handleFieldChange} required />
            </label>
            <label className="admin-form-grid__full">
              Description
              <textarea name="description" rows="5" value={formData.description} onChange={handleFieldChange} required />
            </label>
            <label className="admin-form-grid__full">
              Image URL
              <input name="image" value={formData.image} onChange={handleFieldChange} placeholder="https://..." />
            </label>
          </div>

          <div className="admin-form__actions">
            <button type="submit" className="button button--solid" disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Update product' : 'Create product'}
            </button>
          </div>
        </form>

        <aside className="panel-card admin-list-panel">
          <div className="admin-list-panel__header">
            <div>
              <p className="eyebrow">Catalog inventory</p>
              <h2>Existing products</h2>
            </div>
          </div>

          <div className="admin-product-list">
            {products.map((product) => (
              <article key={product._id} className="admin-product-row">
                <img src={product.image || 'https://placehold.co/96x96?text=P'} alt={product.name} />
                <div className="admin-product-row__content">
                  <h3>{product.name}</h3>
                  <p>{product.category || 'General'}</p>
                  <span>
                    {formatMoney(product.price)} · Stock {product.stock}
                  </span>
                </div>

                <div className="admin-product-row__actions">
                  <button
                    type="button"
                    className="button button--ghost button--compact"
                    onClick={() => beginEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button button--solid button--compact"
                    onClick={() => handleDelete(product)}
                    disabled={busyProductId === product._id}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}