import { fetcher } from '../lib/fetcher'

export const api = fetcher

/**
 * Uploads a file to S3 via presigned URL.
 * Returns metadata for saving to backend.
 */
export async function uploadFileToS3(file, onProgress, source = "user") {
  const { presignedUrl, key } = await fetcher.post('/media/upload-url', {
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
          const media = await fetcher.post('/media', {
            key,
            originalName: file.name,
            contentType: file.type,
            fileSize: file.size,
            source,
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
