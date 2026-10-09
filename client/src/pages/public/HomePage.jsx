import { Card } from '@heroui/react'
import { Activity, ArrowRight, Clock3, Droplet, HeartHandshake, HeartPulse, Salad, Search, ShieldCheck, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import heroImage from '../../assets/lifeflow-hero-optimized.jpg'
import { ContactSection } from '../../components/common/ContactSection'
import { useAuth } from '../../hooks/useAuth'

const reasons = [
  { icon: HeartPulse, title: 'Help in critical moments', text: 'A timely donation supports surgeries, trauma care, childbirth complications, and long-term treatment.' },
  { icon: Activity, title: 'Support local readiness', text: 'Regular voluntary donors help communities respond before a shortage becomes an emergency.' },
  { icon: HeartHandshake, title: 'Create a culture of care', text: 'One calm, informed decision can encourage friends, families, and entire neighborhoods to participate.' },
]

const steps = [
  { number: '01', title: 'Create your donor profile', text: 'Add your blood group and location so requests can be matched responsibly.' },
  { number: '02', title: 'Find the right request', text: 'Review pending requests and confirm only when your profile is eligible.' },
  { number: '03', title: 'Donate with confidence', text: 'Coordinate with the requester and donate at the stated healthcare facility.' },
]

const awareness = [
  { icon: Salad, text: 'Eat well and stay hydrated before donating.' },
  { icon: Clock3, text: 'Rest properly and allow enough recovery time.' },
  { icon: Stethoscope, text: 'Always follow the screening advice of healthcare professionals.' },
]

export function HomePage() {
  const { authenticated } = useAuth()

  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent" />
        <div className="page-shell grid min-h-[680px] items-center gap-12 py-14 lg:grid-cols-[0.88fr_1.12fr] lg:py-20">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-red-700"><HeartPulse className="size-4" /> Give hope. Share life.</span>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">Your blood can be someone’s <span className="text-red-600">next heartbeat.</span></h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">LifeFlow connects verified community members with urgent blood requests across Bangladesh—clearly, securely, and compassionately.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={authenticated ? '/dashboard' : '/register'} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 font-bold text-white shadow-xl shadow-red-600/20 hover:bg-red-700">{authenticated ? 'Open dashboard' : 'Join as a donor'} <ArrowRight className="size-5" /></Link>
              <Link to="/search" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-800 hover:border-red-300 hover:text-red-700"><Search className="size-5" /> Search donors</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-600"><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-red-600" /> Secure profiles</span><span className="flex items-center gap-2"><Droplet className="size-4 fill-red-600 text-red-600" /> Eight blood groups</span></div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-red-100/70 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border-8 border-white shadow-2xl shadow-slate-900/20">
              <img src={heroImage} alt="A voluntary blood donor receiving attentive care at a modern donation clinic" width="1400" height="700" className="aspect-[16/10] w-full object-cover object-center" fetchPriority="high" decoding="async" />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-slate-950/80 p-4 text-white backdrop-blur-lg sm:left-auto sm:max-w-xs">
                <p className="text-xs font-extrabold uppercase tracking-widest text-red-300">A small act, lasting impact</p><p className="mt-1 text-sm leading-6 text-slate-200">Register accurately. Respond responsibly. Donate safely.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-24">
        <div className="page-shell">
          <div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-red-600">Why donate blood</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">A human connection no machine can replace.</h2><p className="mt-4 leading-7 text-slate-600">Blood cannot be manufactured. Safe, voluntary donors remain an essential part of healthcare.</p></div>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {reasons.map(({ icon: Icon, title, text }) => <Card key={title} className="h-full border border-slate-200 bg-white shadow-sm transition-transform hover:-translate-y-1"><Card.Content className="h-full p-6"><span className="grid size-11 place-items-center rounded-xl bg-red-50 text-red-600"><Icon className="size-5" /></span><h3 className="mt-5 text-lg font-extrabold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></Card.Content></Card>)}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="page-shell grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div className="lg:sticky lg:top-28"><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-red-600">How it works</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Three clear steps from intention to impact.</h2><p className="mt-4 leading-7 text-slate-600">LifeFlow keeps identity, eligibility, and request status visible throughout the process.</p><Link to="/donation-requests" className="mt-6 inline-flex items-center gap-2 font-bold text-red-600 hover:text-red-700">Browse pending requests <ArrowRight className="size-4" /></Link></div>
          <div className="space-y-4">{steps.map((step) => <div key={step.number} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-[auto_1fr] sm:items-center"><span className="text-3xl font-black text-red-200">{step.number}</span><div><h3 className="font-extrabold text-slate-950">{step.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{step.text}</p></div></div>)}</div>
        </div>
      </section>

      <section className="bg-red-600 py-14 text-white">
        <div className="page-shell"><div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-red-100">Donation awareness</p><h2 className="mt-3 text-3xl font-black">Prepare well. Donate safely.</h2></div><div className="mt-8 grid gap-4 md:grid-cols-3">{awareness.map(({ icon: Icon, text }) => <div key={text} className="flex gap-3 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur"><Icon className="size-6 shrink-0 text-red-100" /><p className="text-sm font-semibold leading-6">{text}</p></div>)}</div></div>
      </section>

      <ContactSection />
    </>
  )
}
