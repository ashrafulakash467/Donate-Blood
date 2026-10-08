import { Droplet } from 'lucide-react'
import { Link } from 'react-router-dom'

export function BrandMark({ compact = false, inverted = false }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5" aria-label="LifeFlow home">
      <span className="grid size-10 place-items-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20">
        <Droplet className="size-5 fill-current" aria-hidden="true" />
      </span>
      {!compact && (
        <span className={`text-xl font-extrabold tracking-tight ${inverted ? 'text-white' : 'text-slate-950'}`}>
          Life<span className="text-red-600">Flow</span>
        </span>
      )}
    </Link>
  )
}
