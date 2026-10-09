import { Table } from '@heroui/react'
import { Check, Eye, Pencil, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppButton } from '../common/AppButton'
import { StatusBadge } from '../common/StatusBadge'
import { formatDate, formatTime } from '../../utils/formatters'

function ActionButtons({ request, onAction, busy }) {
  const isInProgress = request.donationStatus === 'inprogress'
  return (
    <div className="flex flex-wrap gap-2">
      <Link to={`/donation-requests/${request._id}`} aria-label={`View request for ${request.recipientName}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:border-red-300 hover:text-red-700"><Eye className="size-3.5" /> View</Link>
      <Link to={`/dashboard/edit-donation-request/${request._id}`} aria-label={`Edit request for ${request.recipientName}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:border-red-300 hover:text-red-700"><Pencil className="size-3.5" /> Edit</Link>
      <AppButton tone="ghost" className="min-h-9 px-3 text-xs text-red-700" onPress={() => onAction('delete', request)} isDisabled={busy}><Trash2 className="size-3.5" /> Delete</AppButton>
      {isInProgress && <AppButton tone="outline" className="min-h-9 px-3 text-xs" onPress={() => onAction('done', request)} isDisabled={busy}><Check className="size-3.5" /> Done</AppButton>}
      {isInProgress && <AppButton tone="ghost" className="min-h-9 px-3 text-xs" onPress={() => onAction('canceled', request)} isDisabled={busy}><X className="size-3.5" /> Cancel</AppButton>}
    </div>
  )
}

export function MyDonationRequestsTable({ requests, onAction, busy = false }) {
  return (
    <>
      <div className="hidden lg:block">
        <Table variant="secondary" className="border border-slate-200 bg-white shadow-sm">
          <Table.ScrollContainer>
            <Table.Content aria-label="My donation requests">
              <Table.Header>
                <Table.Column isRowHeader>Recipient</Table.Column>
                <Table.Column>Location</Table.Column>
                <Table.Column>Date and time</Table.Column>
                <Table.Column>Blood</Table.Column>
                <Table.Column>Status</Table.Column>
                <Table.Column>Donor</Table.Column>
                <Table.Column>Actions</Table.Column>
              </Table.Header>
              <Table.Body>
                {requests.map((request) => (
                  <Table.Row id={request._id} key={request._id}>
                    <Table.Cell><span className="font-bold text-slate-950">{request.recipientName}</span></Table.Cell>
                    <Table.Cell>{request.recipientUpazila}, {request.recipientDistrict}</Table.Cell>
                    <Table.Cell><span className="block font-semibold">{formatDate(request.donationDate)}</span><span className="text-xs text-slate-500">{formatTime(request.donationTime)}</span></Table.Cell>
                    <Table.Cell><span className="font-black text-red-600">{request.bloodGroup}</span></Table.Cell>
                    <Table.Cell><StatusBadge status={request.donationStatus} /></Table.Cell>
                    <Table.Cell>{request.donationStatus === 'inprogress' && request.donorName ? <span><span className="block font-semibold text-slate-900">{request.donorName}</span><span className="text-xs text-slate-500">{request.donorEmail}</span></span> : <span className="text-slate-400">Not assigned</span>}</Table.Cell>
                    <Table.Cell><ActionButtons request={request} onAction={onAction} busy={busy} /></Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>

      <div className="grid gap-4 lg:hidden">
        {requests.map((request) => (
          <article key={request._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4"><div><h3 className="font-extrabold text-slate-950">{request.recipientName}</h3><p className="mt-1 text-sm text-slate-500">{request.recipientUpazila}, {request.recipientDistrict}</p></div><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 font-black text-red-600">{request.bloodGroup}</span></div>
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm"><div><span className="block text-xs text-slate-500">Date</span><span className="font-semibold text-slate-800">{formatDate(request.donationDate)}</span></div><div><span className="block text-xs text-slate-500">Time</span><span className="font-semibold text-slate-800">{formatTime(request.donationTime)}</span></div></div>
            <div className="mt-4 flex items-center justify-between gap-3"><StatusBadge status={request.donationStatus} />{request.donationStatus === 'inprogress' && request.donorName && <span className="text-right text-xs text-slate-500"><strong className="block text-slate-800">{request.donorName}</strong>{request.donorEmail}</span>}</div>
            <div className="mt-5 border-t border-slate-100 pt-4"><ActionButtons request={request} onAction={onAction} busy={busy} /></div>
          </article>
        ))}
      </div>
    </>
  )
}
