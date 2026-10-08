import { FieldError, Input, Label, TextField } from '@heroui/react'

export function FormField({ label, error, required = false, className = '', inputClassName = '', ...inputProps }) {
  return (
    <TextField className={`space-y-1.5 ${className}`} isInvalid={Boolean(error)} isRequired={required}>
      <Label className="text-sm font-bold text-slate-700">{label}</Label>
      <Input
        {...inputProps}
        className={`min-h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-red-400'} ${inputClassName}`}
      />
      {error && <FieldError className="text-xs font-semibold text-red-600">{error}</FieldError>}
    </TextField>
  )
}
