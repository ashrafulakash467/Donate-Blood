import axios from 'axios'
import { env } from '../config/environment'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

function getUploadErrorMessage(error) {
  if (!axios.isAxiosError(error)) return error?.message || 'The image could not be uploaded.'

  const providerMessage = error.response?.data?.error?.message
  if (typeof providerMessage === 'string' && providerMessage.trim()) {
    return `ImgBB rejected the image: ${providerMessage.trim()}`
  }
  if (error.code === 'ECONNABORTED') return 'The image upload timed out. Please try again.'
  if (!error.response) return 'Could not reach ImgBB. Check your connection and try again.'
  if (error.response.status === 400 || error.response.status === 403) {
    return 'ImgBB rejected the upload. Check that VITE_IMGBB_API_KEY is valid.'
  }
  return 'ImgBB could not upload the image. Please try again.'
}

export async function uploadAvatar(file) {
  if (!file || !ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Choose a JPG, PNG, GIF, or WebP image.')
  }

  if (!file.size) throw new Error('The selected image is empty.')
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('The avatar must be 5 MB or smaller.')
  }

  if (!env.imgbbApiKey) {
    throw new Error('ImgBB upload is not configured. Add VITE_IMGBB_API_KEY to the client environment.')
  }

  const body = new FormData()
  body.append('image', file)

  try {
    const response = await axios.post('https://api.imgbb.com/1/upload', body, {
      params: { key: env.imgbbApiKey },
      timeout: 30_000,
    })

    const imageUrl = response.data?.data?.display_url || response.data?.data?.url
    if (response.data?.success !== true || typeof imageUrl !== 'string' || !imageUrl.startsWith('https://')) {
      throw new Error('ImgBB returned an invalid upload response.')
    }
    return imageUrl
  } catch (error) {
    throw new Error(getUploadErrorMessage(error))
  }
}
