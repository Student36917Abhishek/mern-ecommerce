import api from './api'

export async function fetchAdminDashboard() {
  const { data } = await api.get('/admin/dashboard')
  return data
}

export async function fetchRegisteredUsers() {
  const { data } = await api.get('/admin/users')
  return data
}

export async function fetchAdminAuditLogs() {
  const { data } = await api.get('/admin/audit-logs')
  return data
}

export async function fetchSellerRequests() {
  const { data } = await api.get('/admin/seller-requests')
  return data
}

export async function reviewSellerRequest(userId, action, reviewNote = '') {
  const { data } = await api.put(`/admin/seller-requests/${userId}`, { action, reviewNote })
  return data
}

export async function fetchAllOrders() {
  const { data } = await api.get('/orders/admin/all')
  return data
}

export async function updateOrderStatus(orderId, orderStatus) {
  const { data } = await api.put(`/orders/admin/${orderId}/status`, { orderStatus })
  return data
}
