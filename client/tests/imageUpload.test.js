import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    isAxiosError: vi.fn((error) => Boolean(error?.isAxiosError)),
  },
}))

vi.mock('../src/config/environment', () => ({
  env: { imgbbApiKey: 'test-imgbb-key' },
}))

const { uploadAvatar } = await import('../src/services/imageUpload')

const imageFile = (type = 'image/png', size = 12) => {
  const file = new Blob([new Uint8Array(size)], { type })
  Object.defineProperty(file, 'name', { value: 'avatar.png' })
  return file
}

describe('uploadAvatar', () => {
  beforeEach(() => vi.clearAllMocks())

  it('uploads an allowed image and returns the secure display URL', async () => {
    axios.post.mockResolvedValue({
      data: { success: true, data: { display_url: 'https://i.ibb.co/avatar.png' } },
    })

    await expect(uploadAvatar(imageFile())).resolves.toBe('https://i.ibb.co/avatar.png')
    expect(axios.post).toHaveBeenCalledOnce()
    expect(axios.post.mock.calls[0][2]).toMatchObject({
      params: { key: 'test-imgbb-key' },
      timeout: 30_000,
    })
  })

  it('rejects unsupported image formats before making a request', async () => {
    await expect(uploadAvatar(imageFile('image/svg+xml'))).rejects.toThrow('Choose a JPG, PNG, GIF, or WebP image.')
    expect(axios.post).not.toHaveBeenCalled()
  })

  it('rejects images larger than 5 MB before making a request', async () => {
    await expect(uploadAvatar(imageFile('image/jpeg', (5 * 1024 * 1024) + 1))).rejects.toThrow('5 MB or smaller')
    expect(axios.post).not.toHaveBeenCalled()
  })

  it('returns the provider error without exposing configuration values', async () => {
    axios.post.mockRejectedValue({
      isAxiosError: true,
      response: { status: 400, data: { error: { message: 'Invalid API key' } } },
    })

    await expect(uploadAvatar(imageFile())).rejects.toThrow('ImgBB rejected the image: Invalid API key')
  })
})
