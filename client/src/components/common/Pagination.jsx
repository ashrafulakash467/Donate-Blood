import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AppButton } from './AppButton'

export function Pagination({ page = 1, totalPages = 1, onPageChange = () => {} }) {
  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-between gap-4" aria-label="Pagination">
      <AppButton tone="outline" onPress={() => onPageChange(page - 1)} isDisabled={page <= 1}>
        <ChevronLeft className="size-4" /> Previous
      </AppButton>
      <span className="text-sm font-semibold text-slate-600">Page {page} of {totalPages}</span>
      <AppButton tone="outline" onPress={() => onPageChange(page + 1)} isDisabled={page >= totalPages}>
        Next <ChevronRight className="size-4" />
      </AppButton>
    </nav>
  )
}
