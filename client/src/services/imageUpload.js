import axios from 'axios'
import { env } from '../config/environment'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export async function uploadAvatar(file) {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('Please choose a valid image file.')
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('The avatar must be 5 MB or smaller.')
  }

  if (!env.imgbbApiKey) {
    throw new Error('ImgBB upload is not configured. Add VITE_IMGBB_API_KEY to the client environment.')
  }

  const body = new FormData()
  body.append('image', file)

  const response = await axios.post('https://api.imgbb.com/1/upload', body, {
    params: { key: env.imgbbApiKey },
    timeout: 30_000,
  })

  const imageUrl = response.data?.data?.url
  if (!imageUrl) throw new Error('ImgBB did not return an image URL.')
  return imageUrl
}
