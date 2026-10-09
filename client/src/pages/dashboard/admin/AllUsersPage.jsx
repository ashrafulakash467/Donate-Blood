import { Dropdown, Table, toast } from '@heroui/react'
import { EllipsisVertical, ShieldCheck, UserCog } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { ConfirmationModal } from '../../../components/common/ConfirmationModal'
import { EmptyState } from '../../../components/common/EmptyState'
import { ErrorMessage } from '../../../components/common/ErrorMessage'
import { PageHeader } from '../../../components/common/PageHeader'
import { Pagination } from '../../../components/common/Pagination'
import { StatusBadge } from '../../../components/common/StatusBadge'
import { SelectField } from '../../../components/forms/SelectField'
import { useAuth } from '../../../hooks/useAuth'
import { getAllUsers, updateUserRole, updateUserStatus } from '../../../services/staffDashboardApi'
import { getUserManagementActions } from '../../../utils/dashboardPermissions'

const PAGE_SIZE = 10
const statusFilters = [{ value: 'active', label: 'Active' }, { value: 'blocked', label: 'Blocked' }]

function UserActions({ user, isCurrentUser, onAction }) {
  const labels = { blocked: 'Block user', active: 'Unblock user', volunteer: 'Make volunteer', admin: 'Make admin' }
  const items = getUserManagementActions(user).map((id) => ({ id, label: labels[id], danger: id === 'blocked' }))

  if (isCurrentUser) return <span className="text-xs font-semibold text-slate-400">Current account</span>
  return (
    <Dropdown>
      <Dropdown.Trigger aria-label={`Actions for ${user.name}`}><EllipsisVertical className="size-5" /></Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu aria-label={`Manage ${user.name}`} onAction={(key) => onAction(String(key), user)}>
          {items.map((item) => <Dropdown.Item key={item.id} id={item.id} variant={item.danger ? 'danger' : undefined}>{item.label}</Dropdown.Item>)}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}

function UsersSkeleton() {
  return <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">{Array.from({ length: 5 }, (_, index) => <div key={index} className="flex animate-pulse items-center gap-4 p-5"><div className="size-10 rounded-xl bg-slate-200" /><div className="flex-1"><div className="h-4 w-40 rounded bg-slate-200" /><div className="mt-2 h-3 w-56 rounded bg-slate-100" /></div><div className="h-7 w-20 rounded bg-slate-200" /></div>)}</div>
}

export function AllUsersPage() {
  const { profile } = useAuth()
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [busy, setBusy] = useState(false)

  const loadUsers = useCallback(async (signal) => {
    setLoading(true); setError(null)
    try {
      const data = await getAllUsers({ page, limit: PAGE_SIZE, ...(status && { status }) }, signal)
      setUsers(data?.items ?? []); setPagination(data?.pagination ?? { page, totalPages: 0, total: 0 })
    } catch (requestError) { if (requestError.code !== 'ERR_CANCELED') setError(requestError.apiError || { message: requestError.message }) }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [page, status])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => loadUsers(controller.signal), 0)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [loadUsers])

  const requestAction = (action, user) => {
    const isStatus = action === 'active' || action === 'blocked'
    setPendingAction({ action, user, isStatus, title: isStatus ? `${action === 'blocked' ? 'Block' : 'Unblock'} ${user.name}?` : `Make ${user.name} ${action}?`, description: isStatus ? `This will change the account status to ${action}.` : `This grants ${action} permissions to this account.` })
  }
  const confirmAction = async () => {
    if (!pendingAction) return
    setBusy(true)
    try {
      if (pendingAction.isStatus) await updateUserStatus(pendingAction.user._id, pendingAction.action)
      else await updateUserRole(pendingAction.user._id, pendingAction.action)
      toast.success(pendingAction.isStatus ? 'User status updated' : 'User role updated')
      setPendingAction(null)
      await loadUsers()
    } catch (requestError) { toast.danger('User update failed', { description: requestError.apiError?.message || requestError.message }) }
    finally { setBusy(false) }
  }

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader eyebrow="Administration" title="All users" description="Review accounts and apply privileged role or status changes with confirmation." />
      <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between"><SelectField label="Filter by status" options={statusFilters} placeholder="All statuses" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className="w-full sm:max-w-xs" /><p className="text-sm font-semibold text-slate-500">{pagination.total || 0} users</p></div>
      <div className="mt-6">
        {loading && <UsersSkeleton />}
        {error && <ErrorMessage title="Could not load users" message={error.message} errors={error.errors} />}
        {!loading && !error && users.length === 0 && <EmptyState title="No users found" description="Try changing the selected status filter." />}
        {!loading && !error && users.length > 0 && <>
          <div className="hidden lg:block"><Table variant="secondary" className="border border-slate-200 bg-white shadow-sm"><Table.ScrollContainer><Table.Content aria-label="All users"><Table.Header><Table.Column isRowHeader>User</Table.Column><Table.Column>Email</Table.Column><Table.Column>Role</Table.Column><Table.Column>Status</Table.Column><Table.Column>Actions</Table.Column></Table.Header><Table.Body>{users.map((user) => <Table.Row id={user._id} key={user._id}><Table.Cell><div className="flex items-center gap-3">{user.avatar ? <img src={user.avatar} alt="" className="size-10 rounded-xl object-cover" /> : <span className="grid size-10 place-items-center rounded-xl bg-slate-900 text-xs font-black text-white">{user.name?.slice(0, 2).toUpperCase()}</span>}<span className="font-bold text-slate-950">{user.name}</span></div></Table.Cell><Table.Cell>{user.email}</Table.Cell><Table.Cell><span className="inline-flex items-center gap-1.5 capitalize text-slate-700"><ShieldCheck className="size-4 text-red-600" />{user.role}</span></Table.Cell><Table.Cell><StatusBadge status={user.status} /></Table.Cell><Table.Cell><UserActions user={user} isCurrentUser={user._id === profile?._id} onAction={requestAction} /></Table.Cell></Table.Row>)}</Table.Body></Table.Content></Table.ScrollContainer></Table></div>
          <div className="grid gap-4 lg:hidden">{users.map((user) => <article key={user._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start gap-3">{user.avatar ? <img src={user.avatar} alt="" className="size-11 rounded-xl object-cover" /> : <span className="grid size-11 place-items-center rounded-xl bg-slate-900 text-xs font-black text-white">{user.name?.slice(0, 2).toUpperCase()}</span>}<div className="min-w-0 flex-1"><h2 className="truncate font-extrabold text-slate-950">{user.name}</h2><p className="truncate text-sm text-slate-500">{user.email}</p></div><UserActions user={user} isCurrentUser={user._id === profile?._id} onAction={requestAction} /></div><div className="mt-4 flex items-center justify-between"><span className="inline-flex items-center gap-1.5 text-sm capitalize"><UserCog className="size-4 text-red-600" />{user.role}</span><StatusBadge status={user.status} /></div></article>)}</div>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4"><Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} /></div>
        </>}
      </div>
      <ConfirmationModal isOpen={Boolean(pendingAction)} onOpenChange={(open) => !open && !busy && setPendingAction(null)} title={pendingAction?.title} description={pendingAction?.description} confirmLabel="Confirm update" tone={pendingAction?.action === 'blocked' ? 'danger' : 'primary'} onConfirm={confirmAction} isLoading={busy} />
    </section>
  )
}
