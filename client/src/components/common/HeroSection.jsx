import { ChevronLeft, ChevronRight, Heart, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import bannerEight from '../../assets/banner/8.jfif'
import bannerNine from '../../assets/banner/9.jfif'
import bannerTen from '../../assets/banner/10.jpg'
import bannerEleven from '../../assets/banner/11.jpg'
import bannerTwelve from '../../assets/banner/12.jpg'

const AUTOPLAY_DELAY = 5_000

const slides = [
  { image: bannerEight, badge: 'Every drop matters', title: 'Donate Blood,', accent: 'Save a Life.', description: 'Your single act of kindness can give someone another chance at life. Become a blood donor today.', actions: ['join', 'search'] },
  { image: bannerNine, badge: "Be someone's hero", title: 'Be the Reason', accent: 'Someone Smiles Again.', description: 'A small donation can make a life-changing difference for patients in need.', actions: ['join', 'search'] },
  { image: bannerTen, badge: 'Together we save lives', title: 'Connecting Donors', accent: 'With Those in Need.', description: 'Find blood donors quickly and help patients receive the support they need.', actions: ['search', 'join'] },
  { image: bannerEleven, badge: 'Give hope, give blood', title: 'Your Blood Donation', accent: 'Can Change Everything.', description: 'Join a caring community committed to helping people during their most critical moments.', actions: ['join', 'search'] },
  { image: bannerTwelve, badge: 'Join the movement', title: 'One Community.', accent: 'Countless Lives Saved.', description: 'Together, we can make blood donation easier, faster and more accessible for everyone.', actions: ['join', 'search'] },
]

const actionDetails = {
  join: { label: 'Join as a Donor', to: '/register', icon: Heart, primary: true },
  search: { label: 'Search Donors', to: '/search', icon: Search, primary: false },
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (event) => setReducedMotion(event.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return reducedMotion
}

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const reducedMotion = useReducedMotion()

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length)
  }, [])

  const showNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length)
  }, [])

  useEffect(() => {
    if (isPaused || reducedMotion) return undefined
    const timer = window.setInterval(showNext, AUTOPLAY_DELAY)
    return () => window.clearInterval(timer)
  }, [isPaused, reducedMotion, showNext])

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      showPrevious()
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      showNext()
    }
  }

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false)
  }

  return (
    <section
      className="group relative h-[520px] overflow-hidden bg-slate-950 sm:h-[540px]"
      aria-roledescription="carousel"
      aria-label="Blood donation highlights"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={handleBlur}
    >
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <img
            key={slide.image}
            src={slide.image}
            alt=""
            aria-hidden={index !== activeIndex}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className={`absolute inset-0 size-full object-cover object-center transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${index === activeIndex ? 'scale-100 opacity-100' : 'scale-[1.025] opacity-0'}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent" />
      </div>

      <div className="page-shell relative z-10 flex h-full items-center px-9 sm:px-12 lg:px-0">
        {slides.map((slide, index) => (
          <div
            key={slide.badge}
            aria-hidden={index !== activeIndex}
            className={`absolute max-w-3xl transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${index === activeIndex ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-5 opacity-0'}`}
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-red-100 backdrop-blur-md"><span className="size-1.5 rounded-full bg-red-500" /> {slide.badge}</p>
            <h1 className="mt-5 text-4xl font-black leading-[1.03] tracking-[-0.04em] text-white drop-shadow-[0_3px_12px_rgba(15,23,42,0.65)] sm:text-5xl lg:text-6xl">{slide.title}<br /><span className="text-red-500">{slide.accent}</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-100 drop-shadow-[0_2px_8px_rgba(15,23,42,0.8)] sm:text-lg sm:leading-8">{slide.description}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {slide.actions.map((actionKey) => {
                const action = actionDetails[actionKey]
                const Icon = action.icon
                return (
                  <Link
                    key={actionKey}
                    to={action.to}
                    tabIndex={index === activeIndex ? 0 : -1}
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 font-bold transition-all ${action.primary ? 'bg-red-600 text-white shadow-xl shadow-red-950/30 hover:-translate-y-0.5 hover:bg-red-700' : 'border border-white/70 bg-white/10 text-white backdrop-blur-md hover:-translate-y-0.5 hover:bg-white hover:text-slate-950'}`}
                  >
                    <Icon className={`size-5 ${action.primary ? 'fill-current' : ''}`} aria-hidden="true" /> {action.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={showPrevious} className="absolute left-3 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-slate-950/45 text-white backdrop-blur transition hover:bg-red-600 sm:left-6" aria-label="Show previous slide"><ChevronLeft className="size-5" aria-hidden="true" /></button>
      <button type="button" onClick={showNext} className="absolute right-3 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-slate-950/45 text-white backdrop-blur transition hover:bg-red-600 sm:right-6" aria-label="Show next slide"><ChevronRight className="size-5" aria-hidden="true" /></button>

      <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center gap-2" role="group" aria-label="Choose a hero slide">
        {slides.map((slide, index) => (
          <button key={slide.badge} type="button" onClick={() => setActiveIndex(index)} className={`h-2.5 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-red-500' : 'w-2.5 bg-white/60 hover:bg-white'}`} aria-label={`Show slide ${index + 1}: ${slide.badge}`} aria-current={index === activeIndex ? 'true' : undefined} />
        ))}
      </div>

      <p className="sr-only" aria-live="polite">Slide {activeIndex + 1} of {slides.length}: {slides[activeIndex].badge}</p>
    </section>
  )
}
