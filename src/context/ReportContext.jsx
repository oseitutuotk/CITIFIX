import { createContext, useState } from 'react'

const defaultReport = {
  category: '',
  customCategory: '',
  description: '',
  photos: [],
  coords: null,
  locationName: '',
  exifCoords: null,   // GPS extracted from photo EXIF — pre-fills Step 2 map
}

const ReportContext = createContext(null)

export { ReportContext }

export function ReportProvider({ children }) {
  const [reportData, setReportData] = useState(defaultReport)

  function updateReport(fields) {
    setReportData(prev => ({ ...prev, ...fields }))
  }

  function resetReport() {
    setReportData(defaultReport)
  }

  return (
    <ReportContext.Provider value={{ reportData, updateReport, resetReport }}>
      {children}
    </ReportContext.Provider>
  )
}
