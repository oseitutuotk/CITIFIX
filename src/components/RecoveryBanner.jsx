import { useState } from 'react'
import { useReport } from '../hooks/useReport.js'

export default function RecoveryBanner() {
  const { rehydrated } = useReport()
  const [visible, setVisible] = useState(Boolean(rehydrated))
  if (!visible || !rehydrated) return null
  return (
    <div className="w-full bg-yellow-50 border-b border-yellow-100 text-yellow-800 px-4 py-2 text-xs">
      In-progress report restored after an unexpected reload. Your photos and details were preserved.
      <button onClick={() => setVisible(false)} className="ml-3 font-semibold underline">Dismiss</button>
    </div>
  )
}
