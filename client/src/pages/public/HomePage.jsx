import { Card } from '@heroui/react'
import { Activity, ArrowRight, Clock3, HeartHandshake, HeartPulse, Salad, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ContactSection } from '../../components/common/ContactSection'
import { HeroSection } from '../../components/common/HeroSection'

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
  return (
    <>
      <HeroSection />

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
