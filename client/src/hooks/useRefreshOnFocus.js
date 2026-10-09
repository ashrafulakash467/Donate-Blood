import { useEffect } from 'react'

export function useRefreshOnFocus(refresh) {
  useEffect(() => {
    let refreshTimer
    const scheduleRefresh = () => {
      window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => void refresh(), 100)
    }
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') scheduleRefresh()
    }

    window.addEventListener('focus', scheduleRefresh)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      window.clearTimeout(refreshTimer)
      window.removeEventListener('focus', scheduleRefresh)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [refresh])
}
