import { Link } from 'react-router-dom'
import fallbackImage from '../assets/hero.png'
import { formatPrice } from '../utils/format'

export function ProductCard({ product, onAddToCart }) {
  const availability = product.stock > 0 ? `${product.stock} in stock` : 'Sold out'

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} className="product-card__media">
        <img
          src={product.image || fallbackImage}
          alt={product.name}
          onError={(event) => {
            event.currentTarget.src = fallbackImage
          }}
        />
      </Link>

      <div className="product-card__body">
        <div className="product-card__meta">
          <span>{product.category || 'General'}</span>
          <span className={product.stock > 0 ? 'badge badge--good' : 'badge badge--danger'}>
            {availability}
          </span>
        </div>

        <h2>
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </h2>
        <p>{product.description}</p>

        <div className="product-card__footer">
          <strong>{formatPrice(product.price)}</strong>
          <div className="product-card__actions">
            <Link className="button button--ghost button--compact" to={`/products/${product._id}`}>
              View
            </Link>
            <button
              type="button"
              className="button button--solid button--compact"
              onClick={() => onAddToCart(product)}
              disabled={product.stock <= 0}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
