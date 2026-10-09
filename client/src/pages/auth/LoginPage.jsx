import { toast } from '@heroui/react'
import { LoaderCircle, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AppButton } from '../../components/common/AppButton'
import { AuthCard } from '../../components/forms/AuthCard'
import { DemoLoginPanel } from '../../components/forms/DemoLoginPanel'
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
  const [activeDemoRole, setActiveDemoRole] = useState('')
  const { register, handleSubmit, setError, setValue, formState: { errors, isSubmitting } } = useForm({
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

  const loginAsDemoUser = async ({ role, email, password }) => {
    setValue('email', email, { shouldDirty: true, shouldValidate: true })
    setValue('password', password, { shouldDirty: true, shouldValidate: true })
    setActiveDemoRole(role)
    try {
      await submitLogin({ email, password })
    } finally {
      setActiveDemoRole('')
    }
  }

  return (
    <AuthCard>
      <form className="space-y-5" noValidate onSubmit={handleSubmit(submitLogin)}>
        <FormField label="Email" icon={Mail} type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} required {...register('email')} />
        <FormField label="Password" icon={LockKeyhole} showPasswordToggle type="password" autoComplete="current-password" placeholder="Enter your password" error={errors.password?.message} required {...register('password')} />
        {authError && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700" role="alert">{authError}</p>}
        <AppButton type="submit" fullWidth className="min-h-11" isDisabled={isSubmitting || loading || Boolean(activeDemoRole)}>
          {isSubmitting ? <><LoaderCircle className="size-4 animate-spin" /> Signing in…</> : 'Sign In'}
        </AppButton>
      </form>

      {/* Comment out the DemoLoginPanel line below to hide all demo-user login buttons. */}
      <DemoLoginPanel activeRole={activeDemoRole} disabled={isSubmitting || loading || Boolean(activeDemoRole)} onSelect={loginAsDemoUser} />
    </AuthCard>
  )
}
