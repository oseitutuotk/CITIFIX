import { useContext } from 'react'
import { ReportContext } from '../context/ReportContext.jsx'

export function useReport() {
  const context = useContext(ReportContext)
  if (!context) {
    throw new Error('useReport must be used inside a <ReportProvider>')
  }
  return context
}