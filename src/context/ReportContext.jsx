import { createContext, useEffect, useState } from 'react'
import { removeFiles } from '../lib/fileStore.js'

const STORAGE_KEY = 'citifix:in_progress_report'

const defaultReport = {
  category: '',
  customCategory: '',
  description: '',
  photos: [],
  originalFileIds: [],
  coords: null,
  locationName: '',
  exifCoords: null, // GPS extracted from photo EXIF — pre-fills Step 2 map
}

const ReportContext = createContext(null)

export { ReportContext }

export function ReportProvider({ children }) {
  const [reportData, setReportData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch (err) {
      // ignore parse errors
    }
    return defaultReport
  })

  // whether we rehydrated from storage on startup
  const [rehydrated] = useState(() => {
    try {
      return !!localStorage.getItem(STORAGE_KEY)
    } catch (e) {
      return false
    }
  })

  // Persist to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reportData))
    } catch (err) {
      // ignore quota errors silently
    }
  }, [reportData])

  // Cleanup any object URLs stored in photos when resetting/removing
  function revokePhotoObjectURLs(photos) {
    if (!Array.isArray(photos)) return
    photos.forEach((p) => {
      try {
        if (typeof p === 'string' && p.startsWith('blob:')) {
          URL.revokeObjectURL(p)
        }
      } catch (e) {
        // ignore
      }
    })
  }

  function updateReport(fields) {
    // Defer updates slightly to avoid React warning when called during another
    // component's render phase (e.g., event handlers that resolve synchronously).
    Promise.resolve().then(() => {
      setReportData((prev) => ({ ...prev, ...fields }))
    })
  }

  function resetReport() {
    revokePhotoObjectURLs(reportData.photos)
    // delete any original files stored in IndexedDB (fire-and-forget)
    try {
      if (Array.isArray(reportData.originalFileIds) && reportData.originalFileIds.length) {
        removeFiles(reportData.originalFileIds).catch(() => {})
      }
    } catch (e) {}
    setReportData(defaultReport)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      // ignore
    }
  }

  return (
    <ReportContext.Provider value={{ reportData, updateReport, resetReport, rehydrated }}>
      {children}
    </ReportContext.Provider>
  )
}
