export function formatDate(dateValue, options = {}) {
  if (!dateValue) return 'Not provided'
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(dateValue) ? `${dateValue}T00:00:00` : dateValue
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return String(dateValue)
  return new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium', ...options }).format(date)
}

export function formatTime(timeValue) {
  if (!/^\d{2}:\d{2}$/.test(timeValue || '')) return timeValue || 'Not provided'
  const [hours, minutes] = timeValue.split(':').map(Number)
  const date = new Date(2000, 0, 1, hours, minutes)
  return new Intl.DateTimeFormat('en-BD', { hour: 'numeric', minute: '2-digit' }).format(date)
}

export function formatCurrency(amount, currency = 'bdt') {
  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount)) return '—'
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: currency.toUpperCase(), maximumFractionDigits: 2 }).format(numericAmount)
}
