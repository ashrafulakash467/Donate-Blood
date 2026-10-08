export function isStripeCheckoutUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && (url.hostname === 'checkout.stripe.com' || url.hostname.endsWith('.stripe.com'))
  } catch {
    return false
  }
}

export function redirectToStripeCheckout(url) {
  if (!isStripeCheckoutUrl(url)) throw new Error('The server returned an invalid Stripe Checkout URL.')
  window.sessionStorage.setItem('lifeflow:checkout-started', 'true')
  window.location.assign(url)
}

export function consumeCheckoutStarted() {
  if (typeof window === 'undefined') return false
  const started = window.sessionStorage.getItem('lifeflow:checkout-started') === 'true'
  if (started) window.sessionStorage.removeItem('lifeflow:checkout-started')
  return started
}
