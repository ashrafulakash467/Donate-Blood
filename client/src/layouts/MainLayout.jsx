import { Outlet } from 'react-router-dom'
import { Footer } from '../components/common/Footer'
import { Navbar } from '../components/common/Navbar'

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  )
}
