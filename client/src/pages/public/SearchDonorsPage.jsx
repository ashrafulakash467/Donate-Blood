import { Card } from '@heroui/react'
import { Droplet, LoaderCircle, MapPin, Search, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppButton } from '../../components/common/AppButton'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorMessage } from '../../components/common/ErrorMessage'
import { PageHeader } from '../../components/common/PageHeader'
import { Pagination } from '../../components/common/Pagination'
import { SelectField } from '../../components/forms/SelectField'
import { bloodGroups } from '../../data/authOptions'
import { districts, getUpazilasByDistrictName } from '../../data/bangladeshLocations'
import { useAuth } from '../../hooks/useAuth'
import { searchActiveDonors } from '../../services/publicWebsiteApi'

const PAGE_SIZE = 8

export function SearchDonorsPage() {
  const { authenticated } = useAuth()
  const [filters, setFilters] = useState({ bloodGroup: '', district: '', upazila: '' })
  const [appliedFilters, setAppliedFilters] = useState(null)
  const [page, setPage] = useState(1)
  const [donors, setDonors] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const upazilas = useMemo(() => getUpazilasByDistrictName(filters.district), [filters.district])

  useEffect(() => {
    if (!appliedFilters || !authenticated) return undefined
    const controller = new AbortController()

    const searchDonors = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = Object.fromEntries(Object.entries({ ...appliedFilters, page, limit: PAGE_SIZE }).filter(([, value]) => value !== ''))
        const data = await searchActiveDonors(params, controller.signal)
        setDonors(data?.items ?? [])
        setPagination(data?.pagination ?? { page, totalPages: 0, total: 0 })
      } catch (requestError) {
        if (requestError.code !== 'ERR_CANCELED') setError(requestError.apiError || { message: requestError.message })
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    searchDonors()
    return () => controller.abort()
  }, [appliedFilters, authenticated, page])

  const handleSearch = (event) => {
    event.preventDefault()
    if (!authenticated) {
      setError({ message: 'Sign in to search active donor profiles.' })
      return
    }
    setPage(1)
    setAppliedFilters({ ...filters })
  }

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value, ...(field === 'district' ? { upazila: '' } : {}) }))
  }

  return (
    <section className="page-shell py-12 sm:py-16">
      <PageHeader eyebrow="Donor directory" title="Find a nearby blood donor" description="Search active donor profiles by blood group and Bangladesh location. Results appear only after you search." />

      <form className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr_1fr_auto] md:items-end" onSubmit={handleSearch}>
        <SelectField label="Blood group" options={bloodGroups} value={filters.bloodGroup} onChange={(event) => updateFilter('bloodGroup', event.target.value)} placeholder="Any blood group" />
        <SelectField label="District" options={districts.map((district) => ({ value: district.name, label: district.name }))} value={filters.district} onChange={(event) => updateFilter('district', event.target.value)} placeholder="Any district" />
        <SelectField label="Upazila" options={upazilas.map((upazila) => ({ value: upazila.name, label: upazila.name }))} value={filters.upazila} onChange={(event) => updateFilter('upazila', event.target.value)} disabled={!filters.district} placeholder="Any upazila" />
        <AppButton type="submit" className="md:min-w-28" isDisabled={loading}>{loading ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />} Search</AppButton>
      </form>

      {error && <div className="mt-8"><ErrorMessage title="Donor search unavailable" message={error.message} />{!authenticated && <Link to="/login" state={{ from: { pathname: '/search', search: '', hash: '' } }} className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">Sign in to search</Link>}</div>}
      {!appliedFilters && !error && <div className="mt-8"><EmptyState title="Start with a donor search" description="Choose one or more filters above, then select Search. No donor profiles are loaded initially." action={<Search className="size-5 text-red-600" />} /></div>}
      {loading && <div className="mt-10 flex items-center justify-center gap-3 text-sm font-bold text-slate-600"><LoaderCircle className="size-5 animate-spin text-red-600" /> Searching active donors…</div>}
      {!loading && appliedFilters && !error && donors.length === 0 && <div className="mt-8"><EmptyState title="No matching donors" description="Try changing the blood group or broadening the location filters." /></div>}
      {!loading && !error && donors.length > 0 && (
        <>
          <div className="mt-8 flex items-center justify-between"><p className="text-sm font-semibold text-slate-600">Active donors matching your search</p><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-extrabold text-red-700">{pagination.total} found</span></div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {donors.map((donor) => (
              <Card key={donor._id} className="border border-slate-200 bg-white shadow-sm">
                <Card.Content className="p-5 text-center">
                  <div className="mx-auto grid size-20 place-items-center overflow-hidden rounded-3xl bg-slate-100 text-slate-400">{donor.avatar ? <img src={donor.avatar} alt={`${donor.name} avatar`} className="size-full object-cover" /> : <UserRound className="size-8" />}</div>
                  <h2 className="mt-4 font-extrabold text-slate-950">{donor.name}</h2>
                  <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-sm font-black text-white"><Droplet className="size-4 fill-current" /> {donor.bloodGroup}</span>
                  <p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600"><MapPin className="size-4 text-red-500" /> {donor.upazila}, {donor.district}</p>
                </Card.Content>
              </Card>
            ))}
          </div>
          <div className="mt-9"><Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} /></div>
        </>
      )}
    </section>
  )
}
