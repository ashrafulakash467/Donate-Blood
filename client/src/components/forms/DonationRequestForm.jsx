import { toast } from '@heroui/react'
import { LoaderCircle, Phone, Save } from 'lucide-react'
import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { AppButton } from '../common/AppButton'
import { FormField } from './FormField'
import { SelectField } from './SelectField'
import { bloodGroups } from '../../data/authOptions'
import { districts, getUpazilasByDistrictName } from '../../data/bangladeshLocations'
import { applyZodErrors } from '../../utils/applyZodErrors'
import { donationRequestSchema, emptyDonationRequest } from '../../validators/donationSchema'

export function DonationRequestForm({ profile, initialValues = emptyDonationRequest, submitLabel, onSubmit }) {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { ...emptyDonationRequest, ...initialValues } })
  const selectedDistrict = useWatch({ control, name: 'recipientDistrict' })
  const upazilas = useMemo(() => getUpazilasByDistrictName(selectedDistrict), [selectedDistrict])
  const districtField = register('recipientDistrict')

  const submit = async (values) => {
    const result = donationRequestSchema.safeParse(values)
    if (!result.success) {
      applyZodErrors(result.error, setError)
      return
    }
    try {
      await onSubmit(result.data)
    } catch (error) {
      toast.danger('Request could not be saved', { description: error.apiError?.message || error.message })
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="space-y-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div>
        <h2 className="text-lg font-extrabold text-slate-950">Requester identity</h2>
        <p className="mt-1 text-sm text-slate-500">Verified from your account and never taken from the request payload.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField label="Requester name" value={profile?.name || ''} readOnly disabled />
          <FormField label="Requester email" type="email" value={profile?.email || ''} readOnly disabled />
          <FormField className="sm:col-span-2" label="Requester phone" icon={Phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="01712345678 or +8801712345678" error={errors.requesterPhone?.message} {...register('requesterPhone')} />
        </div>
      </div>

      <div className="border-t border-slate-200 pt-7">
        <h2 className="text-lg font-extrabold text-slate-950">Recipient and donation details</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField label="Recipient name" placeholder="Patient's full name" error={errors.recipientName?.message} required {...register('recipientName')} />
          <SelectField label="Blood group" options={bloodGroups} error={errors.bloodGroup?.message} required {...register('bloodGroup')} />
          <SelectField
            label="Recipient district"
            options={districts.map(({ name }) => ({ value: name, label: name }))}
            error={errors.recipientDistrict?.message}
            required
            {...districtField}
            onChange={(event) => {
              districtField.onChange(event)
              setValue('recipientUpazila', '', { shouldDirty: true, shouldValidate: true })
            }}
          />
          <SelectField label="Recipient upazila" options={upazilas.map(({ name }) => ({ value: name, label: name }))} error={errors.recipientUpazila?.message} disabled={!selectedDistrict} required {...register('recipientUpazila')} />
          <FormField label="Hospital name" placeholder="Hospital or clinic" error={errors.hospitalName?.message} required {...register('hospitalName')} />
          <FormField label="Full address" placeholder="Ward, road and nearby landmark" error={errors.fullAddress?.message} required {...register('fullAddress')} />
          <FormField label="Donation date" type="date" error={errors.donationDate?.message} required {...register('donationDate')} />
          <FormField label="Donation time" type="time" error={errors.donationTime?.message} required {...register('donationTime')} />
        </div>
        <label className="mt-5 block space-y-1.5">
          <span className="block text-sm font-bold text-slate-700">Request message <span className="text-red-600">*</span></span>
          <textarea {...register('requestMessage')} rows={5} maxLength={2000} placeholder="Explain why blood is needed and include useful instructions." aria-invalid={Boolean(errors.requestMessage)} className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${errors.requestMessage ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-red-400'}`} />
          {errors.requestMessage && <span className="block text-xs font-semibold text-red-600">{errors.requestMessage.message}</span>}
        </label>
      </div>

      <div className="flex justify-end border-t border-slate-200 pt-6">
        <AppButton type="submit" isDisabled={isSubmitting}>
          {isSubmitting ? <><LoaderCircle className="size-4 animate-spin" /> Saving…</> : <><Save className="size-4" /> {submitLabel}</>}
        </AppButton>
      </div>
    </form>
  )
}
