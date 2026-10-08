import { Button } from '@heroui/react'

const variants = {
  primary: 'bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700',
  secondary: 'bg-slate-900 text-white hover:bg-slate-800',
  outline: 'border border-slate-300 bg-white text-slate-800 hover:border-red-300 hover:text-red-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
}

export function AppButton({ tone = 'primary', className = '', ...props }) {
  return (
    <Button
      {...props}
      className={`min-h-10 rounded-xl px-4 font-semibold transition-colors ${variants[tone]} ${className}`}
    />
  )
}
