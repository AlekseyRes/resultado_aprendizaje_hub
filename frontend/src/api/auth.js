import { request } from './client'

export function loginApi({ email, password }) {
  return request('/auth/token/', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
}

export function meApi() {
  return request('/auth/me/')
}

export function registerApi(payload) {
  return request('/auth/register/', {
    method: 'POST',
    body: payload,
    auth: false,
  })
}
