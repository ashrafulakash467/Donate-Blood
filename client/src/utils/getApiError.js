export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  const responseData = error?.response?.data

  return {
    message: responseData?.message || error?.message || fallback,
    errors: Array.isArray(responseData?.errors) ? responseData.errors : [],
    status: error?.response?.status ?? null,
  }
}
