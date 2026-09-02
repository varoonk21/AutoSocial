import { apiGet } from './fetcher'

let cachedS3PublicUrl: string | null = null
let fetchPromise: Promise<string> | null = null

async function fetchS3PublicUrl(): Promise<string> {
  if (cachedS3PublicUrl !== null) return cachedS3PublicUrl
  if (fetchPromise) return fetchPromise

  fetchPromise = apiGet<{ s3PublicUrl: string }>('/config').then((data) => {
    cachedS3PublicUrl = data.s3PublicUrl || ''
    return cachedS3PublicUrl
  })

  return fetchPromise
}

export async function initS3PublicUrl() {
  await fetchS3PublicUrl()
}

export function getS3PublicUrl(): string {
  return cachedS3PublicUrl || ''
}

export function getLogoUrl(key: string | null | undefined): string {
  if (!key) return ''
  if (key.startsWith('http') || key.startsWith('blob:')) return key
  const base = cachedS3PublicUrl || ''
  return base ? `${base}/${key}` : key
}
