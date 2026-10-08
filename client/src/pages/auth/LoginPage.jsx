import { toast } from '@heroui/react'
import { LoaderCircle, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AppButton } from '../../components/common/AppButton'
import { FormField } from '../../components/forms/FormField'
import { useAuth } from '../../hooks/useAuth'
import { authClient } from '../../lib/auth-client'
import { applyZodErrors } from '../../utils/applyZodErrors'
import { loginSchema } from '../../validators/authSchemas'

export function LoginPage() {
  const { authenticated, loading, refreshSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [authError, setAuthError] = useState('')
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '', password: '' },
  })

  if (!loading && authenticated) return <Navigate to="/dashboard" replace />

  const submitLogin = async (values) => {
    setAuthError('')
    const result = loginSchema.safeParse(values)
    if (!result.success) {
      applyZodErrors(result.error, setError)
      return
    }

    try {
      const response = await authClient.signIn.email(result.data)
      if (response.error) {
        const message = response.error.message || 'Email or password is incorrect.'
        setAuthError(message)
        toast.danger('Sign in failed', { description: message })
        return
      }

      await refreshSession()
      toast.success('Welcome back to LifeFlow')
      const intended = location.state?.from
      const destination = intended ? `${intended.pathname}${intended.search || ''}${intended.hash || ''}` : '/dashboard'
      navigate(destination, { replace: true })
    } catch (error) {
      const message = error.message || 'Unable to reach the authentication server.'
      setAuthError(message)
      toast.danger('Sign in failed', { description: message })
    }
  }

  return (
    <div className="w-full rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-9">
      <span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600"><LockKeyhole className="size-6" /></span>
      <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.22em] text-red-600">Welcome back</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Sign in to LifeFlow</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Access your profile and blood donation dashboard securely.</p>

      <form className="mt-7 space-y-5" noValidate onSubmit={handleSubmit(submitLogin)}>
        <FormField label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} required {...register('email')} />
        <FormField label="Password" type="password" autoComplete="current-password" placeholder="At least 8 characters" error={errors.password?.message} required {...register('password')} />
        {authError && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700" role="alert">{authError}</p>}
        <AppButton type="submit" fullWidth isDisabled={isSubmitting || loading}>
          {isSubmitting ? <><LoaderCircle className="size-4 animate-spin" /> Signing in…</> : 'Sign in'}
        </AppButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">New here? <Link to="/register" className="font-bold text-red-600 hover:text-red-700">Create an account</Link></p>
    </div>
  )
}
