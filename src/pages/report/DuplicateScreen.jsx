import { useNavigate } from 'react-router-dom'
import { TriangleAlert, Clock, MapPin, ChevronRight, Info } from 'lucide-react'
import StatusBadge from '../../components/StatusBadge.jsx'
import { useReport } from '../../hooks/useReport.js'
import mockReports from '../../data/mockReports.js'

export default function DuplicateScreen() {
  const navigate = useNavigate()
  const { reportData } = useReport()

  // Find a mock report matching the user's selected category — this
  // simulates what a real proximity + category match would surface.
  // Falls back to the first mock report if no category match exists.
  const similarReport =
    mockReports.find((r) => r.category === reportData.category) ||
    mockReports[0]

  function handleViewExisting() {
    navigate(`/reports/${similarReport.id}`)
  }

  function handleSubmitAnyway() {
    navigate('/report/success')
  }

  // Tapping the dimmed backdrop dismisses back to the review screen,
  // same as a real bottom sheet would behave
  function handleBackdropClick() {
    navigate('/report/step3')
  }

  return (
    <div
      onClick={handleBackdropClick}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      className="flex flex-col h-full justify-end overflow-hidden"
    >
      {/* Bottom sheet — no BottomNav on this screen so the sheet has
          full room to show both action buttons without clipping.
          stopPropagation so clicks inside don't trigger the dismiss. */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl shrink-0 max-h-[92%] overflow-y-auto"
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />

        <div className="px-4 pb-6 space-y-4">

          {/* Heading */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
              <TriangleAlert size={18} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Similar Report Found
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                A report in this category was submitted{' '}
                <strong className="text-gray-700">recently</strong> nearby your location.
              </p>
            </div>
          </div>

          {/* Existing report mini-card */}
          <button
            onClick={handleViewExisting}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 flex items-center gap-3 text-left tap-active"
          >
            <div className="w-16 h-14 rounded-xl bg-gray-200 overflow-hidden shrink-0">
              <img
                src={similarReport.photo_urls[0]}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <StatusBadge status={similarReport.status} />
                <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                  <Clock size={9} />
                  {similarReport.display_date}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-800 truncate">
                {similarReport.title}
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-0.5">
                <MapPin size={10} />
                {similarReport.location_name}
              </p>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0" />
          </button>

          {/* Hint */}
          <div className="flex items-start gap-1.5">
            <Info size={13} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-500 italic">
              This might be the same issue you're reporting.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleViewExisting}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl tap-active"
            >
              View Existing Report
            </button>
            <button
              type="button"
              onClick={handleSubmitAnyway}
              className="w-full border-2 border-gray-200 text-gray-800 font-bold py-3.5 rounded-2xl tap-active"
            >
              Submit Anyway
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
