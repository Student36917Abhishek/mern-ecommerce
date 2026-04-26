import { useEffect, useMemo, useState } from 'react'
import fallbackImage from '../assets/hero.png'
import { AdminNav } from '../components/AdminNav'
import {
  createProduct,
  deleteProduct,
  fetchMyProducts,
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

export function AdminProductsPage({ mode = 'admin' }) {
  const isSellerMode = mode === 'seller'
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busyProductId, setBusyProductId] = useState('')
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [formData, setFormData] = useState(initialForm)
  const [inventoryFilter, setInventoryFilter] = useState('all')

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = isSellerMode
        ? await fetchMyProducts()
        : await fetchProducts({ limit: 100, sort: 'newest' })
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
  }, [isSellerMode])

  const isEditing = Boolean(selectedProduct)

  const formTitle = useMemo(
    () => (isEditing ? `Edit ${selectedProduct?.name || 'product'}` : 'Add a new product'),
    [isEditing, selectedProduct],
  )

  const inventorySummary = useMemo(
    () => ({
      total: products.length,
      lowStock: products.filter((product) => product.stock > 0 && product.stock <= 5).length,
      outOfStock: products.filter((product) => product.stock === 0).length,
    }),
    [products],
  )

  const filteredProducts = useMemo(() => {
    if (inventoryFilter === 'low') {
      return products.filter((product) => product.stock > 0 && product.stock <= 5)
    }

    if (inventoryFilter === 'out') {
      return products.filter((product) => product.stock === 0)
    }

    return products
  }, [inventoryFilter, products])

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

  const buildProductPayload = (source) => ({
    name: source.name.trim(),
    description: source.description.trim(),
    price: Number(source.price),
    category: source.category.trim(),
    stock: Number(source.stock),
    image: source.image.trim(),
  })

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setStatusMessage('')

      const payload = buildProductPayload(formData)

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

  const handleStockAdjust = async (product, nextStock) => {
    try {
      setBusyProductId(product._id)
      setError('')
      setStatusMessage('')
      await updateProduct(product._id, {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category || '',
        stock: Math.max(Number(nextStock) || 0, 0),
        image: product.image || '',
      })
      await loadProducts()
      setStatusMessage(`${product.name} stock updated.`)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to update stock.')
    } finally {
      setBusyProductId('')
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
      {!isSellerMode ? <AdminNav /> : null}

      <header className="catalog-hero">
        <div>
          <p className="eyebrow">{isSellerMode ? 'Seller workspace' : 'Shopora admin'}</p>
          <h1>{isSellerMode ? 'Manage your own products and inventory.' : 'Manage products, pricing, and inventory.'}</h1>
          <p className="hero-text">
            {isSellerMode
              ? 'Add products for your shop, update listing details, and keep stock updated.'
              : 'Add new products, update catalog details, remove products, and adjust stock quickly.'}
          </p>
        </div>

        <div className="admin-summary-row">
          <div className="admin-summary-pill">
            <strong>{inventorySummary.total}</strong>
            <span>products</span>
          </div>
          <div className="admin-summary-pill">
            <strong>{inventorySummary.lowStock}</strong>
            <span>low stock</span>
          </div>
          <div className="admin-summary-pill">
            <strong>{inventorySummary.outOfStock}</strong>
            <span>sold out</span>
          </div>
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
            <select value={inventoryFilter} onChange={(event) => setInventoryFilter(event.target.value)}>
              <option value="all">All stock</option>
              <option value="low">Low stock</option>
              <option value="out">Sold out</option>
            </select>
          </div>

          <div className="admin-product-list">
            {filteredProducts.map((product) => (
              <article key={product._id} className="admin-product-row">
                <img
                  src={product.image || fallbackImage}
                  alt={product.name}
                  onError={(event) => {
                    event.currentTarget.src = fallbackImage
                  }}
                />
                <div className="admin-product-row__content">
                  <h3>{product.name}</h3>
                  <p>{product.category || 'General'}</p>
                  <span>{formatMoney(product.price)} - Stock {product.stock}</span>
                </div>

                <div className="admin-product-row__actions">
                  <button
                    type="button"
                    className="button button--ghost button--compact"
                    onClick={() => handleStockAdjust(product, product.stock - 1)}
                    disabled={busyProductId === product._id || product.stock <= 0}
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    className="button button--ghost button--compact"
                    onClick={() => handleStockAdjust(product, product.stock + 1)}
                    disabled={busyProductId === product._id}
                  >
                    +1
                  </button>
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

          {!filteredProducts.length ? (
            <div className="empty-cart">
              <p className="eyebrow">No products</p>
              <h2>No products match this inventory filter.</h2>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  )
}
