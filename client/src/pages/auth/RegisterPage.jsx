import { toast } from '@heroui/react'
import { LoaderCircle, UserRoundPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AppButton } from '../../components/common/AppButton'
import { AvatarUploader } from '../../components/forms/AvatarUploader'
import { FormField } from '../../components/forms/FormField'
import { SelectField } from '../../components/forms/SelectField'
import { bloodGroups } from '../../data/authOptions'
import { districts, getUpazilasByDistrictName } from '../../data/bangladeshLocations'
import { useAuth } from '../../hooks/useAuth'
import { authClient } from '../../lib/auth-client'
import { applyZodErrors } from '../../utils/applyZodErrors'
import { registrationSchema } from '../../validators/authSchemas'

export function RegisterPage() {
  const { authenticated, loading, refreshSession } = useAuth()
  const navigate = useNavigate()
  const [authError, setAuthError] = useState('')
  const [isImageUploading, setIsImageUploading] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: '', email: '', avatar: '', bloodGroup: '', district: '', upazila: '', password: '', confirmPassword: '' },
  })

  const selectedDistrict = useWatch({ control, name: 'district' })
  const avatar = useWatch({ control, name: 'avatar' })
  const upazilas = useMemo(() => getUpazilasByDistrictName(selectedDistrict), [selectedDistrict])
  const districtField = register('district')

  if (!loading && authenticated) return <Navigate to="/dashboard" replace />

  const submitRegistration = async (values) => {
    setAuthError('')
    const result = registrationSchema.safeParse(values)
    if (!result.success) {
      applyZodErrors(result.error, setError)
      return
    }

    const registrationData = {
      name: result.data.name,
      email: result.data.email,
      avatar: result.data.avatar,
      bloodGroup: result.data.bloodGroup,
      district: result.data.district,
      upazila: result.data.upazila,
      password: result.data.password,
    }
    try {
      const response = await authClient.signUp.email(registrationData)
      if (response.error) {
        const message = response.error.message || 'Unable to create your account.'
        setAuthError(message)
        toast.danger('Registration failed', { description: message })
        return
      }

      await refreshSession()
      toast.success('Donor account created', { description: 'Your account is active and ready to use.' })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const message = error.message || 'Unable to reach the authentication server.'
      setAuthError(message)
      toast.danger('Registration failed', { description: message })
    }
  }

  return (
    <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9">
      <span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600"><UserRoundPlus className="size-6" /></span>
      <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.22em] text-red-600">Join the network</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Become a blood donor</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Every new account starts as an active donor. Privileged roles cannot be selected here.</p>

      <form className="mt-7 space-y-5" noValidate onSubmit={handleSubmit(submitRegistration)}>
        <AvatarUploader value={avatar} onChange={(url) => setValue('avatar', url, { shouldDirty: true, shouldValidate: true })} onUploadingChange={setIsImageUploading} disabled={isSubmitting} error={errors.avatar?.message} />
        <input type="hidden" {...register('avatar')} />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Full name" autoComplete="name" placeholder="Your full name" error={errors.name?.message} required {...register('name')} />
          <FormField label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} required {...register('email')} />
          <SelectField label="Blood group" options={bloodGroups} error={errors.bloodGroup?.message} required {...register('bloodGroup')} />
          <SelectField
            label="District"
            options={districts.map((district) => ({ value: district.name, label: district.name }))}
            error={errors.district?.message}
            required
            {...districtField}
            onChange={(event) => {
              districtField.onChange(event)
              setValue('upazila', '', { shouldDirty: true })
            }}
          />
          <SelectField label="Upazila" options={upazilas.map((upazila) => ({ value: upazila.name, label: upazila.name }))} error={errors.upazila?.message} required disabled={!selectedDistrict} {...register('upazila')} />
          <div className="hidden sm:block" aria-hidden="true" />
          <FormField label="Password" type="password" autoComplete="new-password" placeholder="At least 8 characters" error={errors.password?.message} required {...register('password')} />
          <FormField label="Confirm password" type="password" autoComplete="new-password" placeholder="Repeat your password" error={errors.confirmPassword?.message} required {...register('confirmPassword')} />
        </div>

        {authError && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700" role="alert">{authError}</p>}
        <AppButton type="submit" fullWidth isDisabled={isSubmitting || isImageUploading || loading}>
          {isSubmitting ? <><LoaderCircle className="size-4 animate-spin" /> Creating account…</> : 'Create donor account'}
        </AppButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">Already registered? <Link to="/login" className="font-bold text-red-600 hover:text-red-700">Sign in</Link></p>
    </div>
  )
}
