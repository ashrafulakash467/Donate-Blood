import { Camera, ImageUp, LoaderCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from '@heroui/react'
import { uploadAvatar } from '../../services/imageUpload'

export function AvatarUploader({ value, onChange, onUploadingChange, disabled = false, error }) {
  const inputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setIsUploading(true)
    onUploadingChange?.(true)
    try {
      const imageUrl = await uploadAvatar(file)
      onChange(imageUrl)
      toast.success('Avatar uploaded successfully')
    } catch (uploadError) {
      toast.danger('Avatar upload failed', { description: uploadError.message })
    } finally {
      setIsUploading(false)
      onUploadingChange?.(false)
    }
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-bold text-slate-700">Avatar</span>
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
        <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-200 text-slate-500">
          {value ? <img src={value} alt="Uploaded avatar preview" className="size-full object-cover" /> : <Camera className="size-7" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-700">Upload a profile photo</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">JPG, PNG, GIF, or WebP. Maximum 5 MB.</p>
          <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} disabled={disabled || isUploading} />
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-red-300 hover:text-red-700 disabled:cursor-wait disabled:opacity-60"
            disabled={disabled || isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? <LoaderCircle className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
            {isUploading ? 'Uploading…' : value ? 'Replace image' : 'Choose image'}
          </button>
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  )
}
