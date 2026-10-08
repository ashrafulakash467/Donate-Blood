export function applyZodErrors(error, setError) {
  for (const issue of error.issues) {
    const field = issue.path[0]
    if (typeof field === 'string') {
      setError(field, { type: 'validation', message: issue.message })
    }
  }
}
