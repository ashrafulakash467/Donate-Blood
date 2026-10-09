import { Card } from '@gravity-ui/uikit'
import { Activity, Banknote, ClipboardList, Clock3, HeartHandshake, UsersRound } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '../../utils/formatters'

const cards = [
  { key: 'totalUsers', secondaryKey: 'totalDonors', title: 'Users / donors', icon: UsersRound, value: (stats) => `${stats.totalUsers ?? 0} / ${stats.totalDonors ?? 0}` },
  { key: 'totalFunding', title: 'Total funding', icon: Banknote, value: (stats) => formatCurrency((stats.totalFunding ?? 0) / 100, 'BDT') },
  { key: 'totalDonationRequests', title: 'Total requests', icon: ClipboardList, value: (stats) => stats.totalDonationRequests ?? 0 },
  { key: 'pendingRequests', title: 'Pending', icon: Clock3, value: (stats) => stats.pendingRequests ?? 0 },
  { key: 'inprogressRequests', title: 'In progress', icon: Activity, value: (stats) => stats.inprogressRequests ?? 0 },
  { key: 'completedRequests', title: 'Completed', icon: HeartHandshake, value: (stats) => stats.completedRequests ?? 0 },
]

export function DashboardStatsCards({ stats }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(({ key, title, icon: Icon, value }) => <Card key={key} type="container" view="outlined" size="l" className="bg-white p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-slate-500">{title}</p><p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value(stats)}</p></div><span className="grid size-11 place-items-center rounded-2xl bg-red-50 text-red-600"><Icon className="size-5" /></span></div></Card>)}</div>
}

export function DashboardStatsSkeleton() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"><div className="h-4 w-24 rounded bg-slate-200" /><div className="mt-4 h-9 w-32 rounded bg-slate-200" /></div>)}</div>
}

export function DonationTrendChart({ trends }) {
  const chartData = (trends?.labels ?? []).map((label, index) => ({ label, requests: trends.values?.[index] ?? 0 }))
  return (
    <div className="h-80 w-full" role="img" aria-label="Donation request trend chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
          <defs><linearGradient id="requestTrend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#dc2626" stopOpacity={0.28} /><stop offset="95%" stopColor="#dc2626" stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 14, borderColor: '#e2e8f0' }} />
          <Area type="monotone" dataKey="requests" stroke="#dc2626" strokeWidth={3} fill="url(#requestTrend)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
