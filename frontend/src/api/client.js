import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '../utils/token'

export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const UNKNOWN_ERROR_MESSAGE = 'Ocurrió un error inesperado.'

const FIELD_LABELS = {
  email: 'Correo',
  password: 'Contraseña',
  password_confirm: 'Confirmación de contraseña',
  first_name: 'Nombre',
  last_name: 'Apellido',
  detail: '',
  non_field_errors: '',
}

function buildHeaders(auth, hasBody) {
  const headers = {}
  if (hasBody) {
    headers['Content-Type'] = 'application/json'
  }
  if (auth) {
    const accessToken = getAccessToken()
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }
  }
  return headers
}

async function parseJson(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function firstFieldMessage(value) {
  if (Array.isArray(value)) {
    return value.length ? String(value[0]) : ''
  }
  if (typeof value === 'string') {
    return value
  }
  return ''
}

function extractMessage(data) {
  if (!data) return UNKNOWN_ERROR_MESSAGE
  if (typeof data === 'string') return data
  if (typeof data.detail === 'string') return data.detail

  const keys = Object.keys(data)
  for (const key of keys) {
    const message = firstFieldMessage(data[key])
    if (message) {
      return message
    }
  }
  return UNKNOWN_ERROR_MESSAGE
}

async function refreshAccessToken() {
  const refresh = getRefreshToken()
  if (!refresh) return false

  try {
    const response = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
    if (!response.ok) return false

    const data = await parseJson(response)
    if (!data || !data.access) return false

    setTokens({ access: data.access, refresh })
    return true
  } catch {
    return false
  }
}

export async function request(
  path,
  { method = 'GET', body, auth = true, retry = true } = {},
) {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`
  const hasBody = body !== undefined

  let response
  try {
    response = await fetch(url, {
      method,
      headers: buildHeaders(auth, hasBody),
      body: hasBody ? JSON.stringify(body) : undefined,
    })
  } catch {
    const error = new Error('No se pudo conectar con el servidor.')
    error.status = 0
    throw error
  }

  if (response.status === 401 && auth && retry) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return request(path, { method, body, auth, retry: false })
    }

    clearTokens()
    const error = new Error('Tu sesión expiró. Iniciá sesión nuevamente.')
    error.status = 401
    throw error
  }

  const data = await parseJson(response)

  if (!response.ok) {
    const error = new Error(extractMessage(data))
    error.data = data
    error.status = response.status
    throw error
  }

  return data
}

export function getErrorMessage(error) {
  if (!error) return UNKNOWN_ERROR_MESSAGE

  const data = error.data
  if (data && typeof data === 'object') {
    if (typeof data.detail === 'string' && data.detail) {
      return data.detail
    }

    const messages = []
    Object.entries(data).forEach(([field, value]) => {
      const message = firstFieldMessage(value)
      if (!message) return

      const label = FIELD_LABELS[field]
      if (label) {
        messages.push(`${label}: ${message}`)
      } else if (label === undefined) {
        messages.push(`${field}: ${message}`)
      } else {
        messages.push(message)
      }
    })

    if (messages.length) {
      return messages.join(' ')
    }
  }

  return error.message || UNKNOWN_ERROR_MESSAGE
}
