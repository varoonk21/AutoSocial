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

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path),
}

/**
 * Uploads a file to S3 via presigned URL.
 * Returns metadata for saving to backend.
 */
export async function uploadFileToS3(file, onProgress) {
  const { presignedUrl, key, url } = await api.post('/media/upload-url', {
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
  })

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', presignedUrl)
    xhr.setRequestHeader('Content-Type', file.type)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = async () => {
      if (xhr.status === 200 || xhr.status === 204) {
        try {
          const media = await api.post('/media', {
            key,
            url,
            originalName: file.name,
            contentType: file.type,
            fileSize: file.size,
          })
          resolve(media.media)
        } catch (err) {
          reject(err)
        }
      } else {
        reject(new Error('S3 upload failed'))
      }
    }

    xhr.onerror = () => reject(new Error('S3 upload failed'))
    xhr.send(file)
  })
}
