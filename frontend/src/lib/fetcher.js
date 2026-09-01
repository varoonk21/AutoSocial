const BASE = '/api'

async function request(method, path, body) {
  const opts = {
    method,
    credentials: 'include',
    headers: {},
  }

  if (body && !(body instanceof FormData)) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  } else if (body instanceof FormData) {
    opts.body = body
  }

  const res = await fetch(`${BASE}${path}`, opts)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

export const fetcher = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path),
}
