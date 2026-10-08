export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.22em] text-red-600">{eyebrow}</p>}
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}
