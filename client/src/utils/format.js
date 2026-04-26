export const formatPrice = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value) || 0)

export const shortId = (value) => String(value || '').slice(-6).toUpperCase()
