import api from './api'

export async function fetchProducts(params = {}) {
  const { data } = await api.get('/products', { params })
  return data
}

export async function fetchProductById(productId) {
  const { data } = await api.get(`/products/${productId}`)
  return data
}

export async function fetchMyProducts() {
  const { data } = await api.get('/products/mine')
  return data
}

export async function createProduct(payload) {
  const config = payload instanceof FormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : undefined
  const { data } = await api.post('/products', payload, config)
  return data
}

export async function updateProduct(productId, payload) {
  const config = payload instanceof FormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : undefined
  const { data } = await api.put(`/products/${productId}`, payload, config)
  return data
}

export async function deleteProduct(productId) {
  const { data } = await api.delete(`/products/${productId}`)
  return data
}