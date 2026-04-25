import api from './api'

export async function fetchProducts(params = {}) {
  const { data } = await api.get('/products', { params })
  return data
}

export async function fetchProductById(productId) {
  const { data } = await api.get(`/products/${productId}`)
  return data
}

export async function createProduct(payload) {
  const { data } = await api.post('/products', payload)
  return data
}

export async function updateProduct(productId, payload) {
  const { data } = await api.put(`/products/${productId}`, payload)
  return data
}

export async function deleteProduct(productId) {
  const { data } = await api.delete(`/products/${productId}`)
  return data
}