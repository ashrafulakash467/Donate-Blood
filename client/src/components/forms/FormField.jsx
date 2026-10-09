import { FieldError, Input, Label, TextField } from '@heroui/react'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export function FormField({ label, error, required = false, className = '', inputClassName = '', icon: Icon, showPasswordToggle = false, type = 'text', ...inputProps }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const resolvedType = showPasswordToggle && isPasswordVisible ? 'text' : type

  return (
    <TextField className={`space-y-1.5 ${className}`} isInvalid={Boolean(error)} isRequired={required}>
      <Label className="text-sm font-bold text-slate-700">{label}</Label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />}
        <Input
          {...inputProps}
          type={resolvedType}
          className={`min-h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${Icon ? 'pl-10' : ''} ${showPasswordToggle ? 'pr-11' : ''} ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-red-400'} ${inputClassName}`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isPasswordVisible}
            onClick={() => setIsPasswordVisible((visible) => !visible)}
          >
            {isPasswordVisible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        )}
      </div>
      {error && <FieldError className="text-xs font-semibold text-red-600">{error}</FieldError>}
    </TextField>
  )
}
