import { toast } from '@heroui/react'
import { LoaderCircle, Pencil, RotateCcw, Save, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { AppButton } from '../../components/common/AppButton'
import { PageHeader } from '../../components/common/PageHeader'
import { StatusBadge } from '../../components/common/StatusBadge'
import { AvatarUploader } from '../../components/forms/AvatarUploader'
import { FormField } from '../../components/forms/FormField'
import { SelectField } from '../../components/forms/SelectField'
import { apiEndpoints } from '../../config/apiEndpoints'
import { bloodGroups } from '../../data/authOptions'
import { districts, getUpazilasByDistrictName } from '../../data/bangladeshLocations'
import { useAuth } from '../../hooks/useAuth'
import { axiosSecure } from '../../services/axiosSecure'
import { applyZodErrors } from '../../utils/applyZodErrors'
import { profileSchema } from '../../validators/profileSchema'

const toFormValues = (profile) => ({
  name: profile?.name || '',
  avatar: profile?.avatar || '',
  bloodGroup: profile?.bloodGroup || '',
  district: profile?.district || '',
  upazila: profile?.upazila || '',
})

export function ProfilePage() {
  const { profile, user, role, status, refreshProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isImageUploading, setIsImageUploading] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: toFormValues(profile) })

  const district = useWatch({ control, name: 'district' })
  const avatar = useWatch({ control, name: 'avatar' })
  const displayedAvatar = avatar || profile?.avatar
  const upazilas = useMemo(() => getUpazilasByDistrictName(district), [district])
  const districtField = register('district')

  useEffect(() => {
    reset(toFormValues(profile))
  }, [profile, reset])

  const cancelEditing = () => {
    reset(toFormValues(profile))
    setIsEditing(false)
  }

  const saveProfile = async (values) => {
    const result = profileSchema.safeParse(values)
    if (!result.success) {
      applyZodErrors(result.error, setError)
      return
    }

    try {
      await axiosSecure.patch(apiEndpoints.users.me, result.data)
      await refreshProfile()
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.danger('Unable to update profile', { description: error.apiError?.message || error.message })
    }
  }

  return (
    <section className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Account"
        title="My profile"
        description="Keep your public donor information accurate. Your email and account permissions cannot be changed here."
        actions={!isEditing && <AppButton onPress={() => setIsEditing(true)}><Pencil className="size-4" /> Edit profile</AppButton>}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <aside className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/40">
          <div className="mx-auto size-28 overflow-hidden rounded-3xl bg-slate-800">
            {displayedAvatar ? <img src={displayedAvatar} alt={`${profile?.name || user?.name} avatar`} className="size-full object-cover" /> : <div className="grid size-full place-items-center text-3xl font-black text-slate-400">{(profile?.name || user?.name || 'U')[0].toUpperCase()}</div>}
          </div>
          <h2 className="mt-5 text-center text-xl font-black">{profile?.name || user?.name}</h2>
          <p className="mt-1 text-center text-sm text-slate-400">{profile?.email || user?.email}</p>
          <div className="mt-5 flex justify-center gap-2"><StatusBadge status={role} /><StatusBadge status={status} /></div>
          <div className="mt-6 flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300"><ShieldCheck className="size-5 shrink-0 text-red-400" /><p>Identity comes from Better Auth, while role and status come from the protected profile API.</p></div>
        </aside>

        <form className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" noValidate onSubmit={handleSubmit(saveProfile)}>
          <AvatarUploader
            value={avatar}
            onChange={(url) => setValue('avatar', url, { shouldDirty: true, shouldValidate: true })}
            onUploadingChange={(uploading) => {
              setIsImageUploading(uploading)
              if (uploading) setIsEditing(true)
            }}
            disabled={isSubmitting}
            error={errors.avatar?.message}
            successMessage="Image uploaded. Save changes to update your profile."
          />
          <input type="hidden" {...register('avatar')} />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <FormField label="Full name" disabled={!isEditing} error={errors.name?.message} {...register('name')} />
            <FormField label="Email" type="email" value={profile?.email || user?.email || ''} readOnly disabled aria-describedby="email-lock-note" />
            <SelectField label="Blood group" options={bloodGroups} disabled={!isEditing} error={errors.bloodGroup?.message} {...register('bloodGroup')} />
            <SelectField
              label="District"
              options={districts.map((item) => ({ value: item.name, label: item.name }))}
              disabled={!isEditing}
              error={errors.district?.message}
              {...districtField}
              onChange={(event) => {
                districtField.onChange(event)
                setValue('upazila', '', { shouldDirty: true })
              }}
            />
            <SelectField label="Upazila" options={upazilas.map((item) => ({ value: item.name, label: item.name }))} disabled={!isEditing || !district} error={errors.upazila?.message} {...register('upazila')} />
          </div>
          <p id="email-lock-note" className="mt-5 text-xs font-medium text-slate-500">Email is permanently read-only in profile updates.</p>

          {isEditing && (
            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <AppButton type="button" tone="outline" onPress={cancelEditing} isDisabled={isSubmitting}><RotateCcw className="size-4" /> Cancel</AppButton>
              <AppButton type="submit" isDisabled={isSubmitting || isImageUploading}>{isSubmitting ? <><LoaderCircle className="size-4 animate-spin" /> Saving…</> : <><Save className="size-4" /> Save changes</>}</AppButton>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
