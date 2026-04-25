import api from './api'

export async function fetchOrderMeta() {
  const { data } = await api.get('/orders/meta')
  return data
}

export async function placeOrder(payload) {
  const { data } = await api.post('/orders', payload)
  return data
}

export async function fetchMyOrders() {
  const { data } = await api.get('/orders/my')
  return data
}

export async function fetchOrderById(orderId) {
  const { data } = await api.get(`/orders/${orderId}`)
  return data
}