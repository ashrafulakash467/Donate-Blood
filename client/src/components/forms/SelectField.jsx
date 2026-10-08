export function SelectField({ label, error, required = false, options, placeholder = 'Select an option', disabled = false, className = '', ...selectProps }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="block text-sm font-bold text-slate-700">{label}{required && <span className="ml-1 text-red-600">*</span>}</span>
      <select
        {...selectProps}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className={`min-h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-red-400'}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label
          return <option key={value} value={value}>{optionLabel}</option>
        })}
      </select>
      {error && <span className="block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  )
}
