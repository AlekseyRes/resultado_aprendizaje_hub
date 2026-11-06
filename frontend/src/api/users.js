import { request } from './client'

export function listUsers() {
  return request('/users/')
}

export function createUser(payload) {
  return request('/users/', { method: 'POST', body: payload })
}

export function updateUser(id, payload) {
  return request(`/users/${id}/`, { method: 'PATCH', body: payload })
}

export function deleteUser(id) {
  return request(`/users/${id}/`, { method: 'DELETE' })
}
