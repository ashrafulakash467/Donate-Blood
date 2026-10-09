import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'

export function BrandMark({ compact = false, inverted = false }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5" aria-label="LifeFlow home">
      <img src={logo} alt="" width="72" height="70" className="size-10 shrink-0 rounded-xl object-contain shadow-lg shadow-red-600/15" />
      {!compact && (
        <span className={`text-xl font-extrabold tracking-tight ${inverted ? 'text-white' : 'text-slate-950'}`}>
          Life<span className="text-red-600">Flow</span>
        </span>
      )}
    </Link>
  )
}
