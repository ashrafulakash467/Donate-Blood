import { toast } from '@heroui/react'
import { LoaderCircle, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { env } from '../../config/environment'
import { submitContactMessage } from '../../services/publicWebsiteApi'
import { applyZodErrors } from '../../utils/applyZodErrors'
import { contactFormSchema, toContactPayload } from '../../validators/contactSchema'
import { AppButton } from './AppButton'
import { FormField } from '../forms/FormField'

export function ContactSection() {
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', email: '', contactNumber: '', message: '' },
  })

  const submitContact = async (values) => {
    const result = contactFormSchema.safeParse(values)
    if (!result.success) {
      applyZodErrors(result.error, setError)
      return
    }

    try {
      await submitContactMessage(toContactPayload(result.data))
      reset()
      toast.success('Message sent successfully', { description: 'Thank you for contacting LifeFlow.' })
    } catch (error) {
      toast.danger('Unable to send message', { description: error.apiError?.message || error.message })
    }
  }

  return (
    <section className="bg-white py-16 sm:py-24" id="contact">
      <div className="page-shell grid overflow-hidden rounded-[2rem] bg-slate-950 shadow-2xl shadow-slate-300/50 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="relative p-7 text-white sm:p-10 lg:p-12">
          <div className="absolute -left-20 -top-20 size-64 rounded-full bg-red-600/25 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-red-400">Contact us</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Questions deserve a human answer.</h2>
            <p className="mt-4 leading-7 text-slate-300">Send us a message about volunteering, blood requests, or using the platform.</p>
            <div className="mt-9 space-y-4 text-sm text-slate-300">
              <p className="flex items-center gap-3"><Phone className="size-5 text-red-400" /> {env.contactNumber || 'Share your contact number in the form'}</p>
              <p className="flex items-center gap-3"><Mail className="size-5 text-red-400" /> Support through the contact form</p>
              <p className="flex items-center gap-3"><MapPin className="size-5 text-red-400" /> Serving communities across Bangladesh</p>
            </div>
          </div>
        </div>

        <form className="bg-white p-7 sm:p-10 lg:p-12" noValidate onSubmit={handleSubmit(submitContact)}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Name" placeholder="Your name" autoComplete="name" error={errors.name?.message} required {...register('name')} />
            <FormField label="Email" type="email" placeholder="you@example.com" autoComplete="email" error={errors.email?.message} required {...register('email')} />
            <FormField className="sm:col-span-2" label="Contact number" type="tel" placeholder="+880 1XXX XXXXXX" autoComplete="tel" error={errors.contactNumber?.message} required {...register('contactNumber')} />
          </div>
          <label className="mt-5 block space-y-1.5">
            <span className="block text-sm font-bold text-slate-700">Message <span className="text-red-600">*</span></span>
            <textarea {...register('message')} rows="6" maxLength="2000" placeholder="How can we help?" className={`w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${errors.message ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-red-400'}`} />
            {errors.message && <span className="block text-xs font-semibold text-red-600">{errors.message.message}</span>}
          </label>
          <AppButton type="submit" className="mt-6" isDisabled={isSubmitting}>{isSubmitting ? <><LoaderCircle className="size-4 animate-spin" /> Sending…</> : <><Send className="size-4" /> Send message</>}</AppButton>
        </form>
      </div>
    </section>
  )
}
