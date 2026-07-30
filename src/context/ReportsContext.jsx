import { createContext, useContext, useState, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { fetchUserReports } from '../services/reportService.js'

const ReportsContext = createContext(null)

// Maps a real Supabase report row to the shape ReportCard expects.
// Defined here once so both HomeScreen and MyReportsScreen use
// the exact same mapping without duplicating code.
export function mapReport(report) {
  return {
    id: report.id,
    category: report.category,
    title:
      report.title ||
      `${report.category} issue at ${
        report.location_name?.split(',')[0] || 'your area'
      }`,
    status: report.status,
    location_name: report.location_name || 'Unknown location',
    display_date: new Date(report.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    photo_urls: report.report_photos?.map((p) => p.storage_url) || [],
  }
}

export function ReportsProvider({ children }) {
  const { user } = useAuth()

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [loaded, setLoaded] = useState(false)

  // Main fetch — called on first load or after invalidation
  const loadReports = useCallback(
    async ({ silent = false } = {}) => {
      if (!user?.id) return
      if (!silent) setLoading(true)
      setError(null)

      const { data, error } = await fetchUserReports(user.id)

      if (error) {
        setError('Failed to load reports.')
      } else {
        setReports(data || [])
        setLoaded(true)
      }

      setLoading(false)
      setRefreshing(false)
    },
    [user?.id]
  )

  // Pull-to-refresh — sets refreshing state for the spinner
  const refresh = useCallback(async () => {
    if (!user?.id) return
    setRefreshing(true)
    await loadReports({ silent: true })
  }, [loadReports, user?.id])

  // Call this after a new report is submitted to bust the cache
  const invalidate = useCallback(() => {
    setLoaded(false)
    loadReports()
  }, [loadReports])

  // Remove a report from the local cache immediately (optimistic update)
  // so the UI updates instantly without waiting for a re-fetch
  function removeFromCache(reportId) {
    setReports((prev) => prev.filter((r) => r.id !== reportId))
  }

  return (
    <ReportsContext.Provider
      value={{
        reports,
        loading,
        refreshing,
        error,
        loaded,
        loadReports,
        refresh,
        invalidate,
        removeFromCache,
      }}
    >
      {children}
    </ReportsContext.Provider>
  )
}

export function useReports() {
  const context = useContext(ReportsContext)
  if (!context) {
    throw new Error('useReports must be used inside a <ReportsProvider>')
  }
  return context
}
