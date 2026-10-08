import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar'

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="lg:pl-72">
        <DashboardHeader onMenuOpen={() => setIsSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
