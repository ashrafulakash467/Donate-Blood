export const apiEndpoints = Object.freeze({
  health: '/health',
  auth: '/api/auth',
  users: {
    me: '/users/me',
    search: '/users/search',
    all: '/users',
    status: (id) => `/users/${id}/status`,
    role: (id) => `/users/${id}/role`,
  },
  donations: {
    all: '/donations',
    create: '/donations',
    mine: '/donations/mine',
    manage: '/donations/manage',
    details: (id) => `/donations/${id}`,
    confirm: (id) => `/donations/${id}/confirm`,
    status: (id) => `/donations/${id}/status`,
    cancelAssignment: (id) => `/donations/${id}/cancel-assignment`,
  },
  dashboard: {
    stats: '/dashboard/stats',
    donationTrends: '/dashboard/donation-trends',
  },
  fundings: {
    all: '/fundings',
    checkout: '/fundings/checkout',
    webhook: '/fundings/webhook',
  },
  contacts: '/contacts',
})
