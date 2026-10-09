import { useEffect, useState } from 'react'
import { ErrorMessage } from '../common/ErrorMessage'
import { PageHeader } from '../common/PageHeader'
import { SelectField } from '../forms/SelectField'
import { useAuth } from '../../hooks/useAuth'
import { getDashboardStats, getDonationTrends } from '../../services/staffDashboardApi'
import { DashboardStatsCards, DashboardStatsSkeleton, DonationTrendChart } from './DashboardStats'

const periods = [{ value: 'daily', label: 'Last 7 days' }, { value: 'weekly', label: 'Last 8 weeks' }, { value: 'monthly', label: 'Last 12 months' }]

export function StaffDashboardHome({ roleLabel }) {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [trends, setTrends] = useState(null)
  const [period, setPeriod] = useState('daily')
  const [loading, setLoading] = useState(true)
  const [trendLoading, setTrendLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError(null)
      try { setStats(await getDashboardStats(controller.signal)) }
      catch (requestError) { if (requestError.code !== 'ERR_CANCELED') setError(requestError.apiError || { message: requestError.message }) }
      finally { if (!controller.signal.aborted) setLoading(false) }
    }, 0)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setTrendLoading(true)
      try { setTrends(await getDonationTrends(period, controller.signal)) }
      catch (requestError) { if (requestError.code !== 'ERR_CANCELED') setError(requestError.apiError || { message: requestError.message }) }
      finally { if (!controller.signal.aborted) setTrendLoading(false) }
    }, 0)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [period])

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader eyebrow={`${roleLabel} overview`} title={`Welcome, ${profile?.name || roleLabel.toLowerCase()}`} description="Monitor real platform activity and coordinate blood donation operations." />
      <div className="mt-8">{loading ? <DashboardStatsSkeleton /> : error && !stats ? <ErrorMessage title="Could not load dashboard statistics" message={error.message} /> : <DashboardStatsCards stats={stats || {}} />}</div>
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-600">Request activity</p><h2 className="mt-1 text-2xl font-black text-slate-950">Donation trends</h2></div><SelectField label="Chart period" options={periods} value={period} onChange={(event) => setPeriod(event.target.value)} className="w-full sm:max-w-52" /></div>
        <div className="mt-6">{trendLoading ? <div className="h-80 animate-pulse rounded-2xl bg-slate-100" /> : trends ? <DonationTrendChart trends={trends} /> : <ErrorMessage title="Could not load trend data" message={error?.message} />}</div>
      </section>
    </section>
  )
}
