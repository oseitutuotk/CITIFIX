import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  Send,
  MapPin,
  Camera,
  Sparkles,
  Droplets,
  Lightbulb,
  Trash2,
  Zap,
  MoreHorizontal,
  TriangleAlert,
  Clock,
  Info,
  ChevronRight,
} from 'lucide-react'
import AppHeader from '../../components/AppHeader.jsx'
import BottomNav from '../../components/BottomNav.jsx'
import StepIndicator from '../../components/StepIndicator.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { useReport } from '../../hooks/useReport.js'
import mockReports from '../../data/mockReports.js'
import { submitReport } from '../../services/reportService.js'
import { useAuth } from '../../hooks/useAuth.js'
import { getDeviceId } from '../../lib/deviceId.js'
import { useReports } from '../../context/ReportsContext.jsx'
import { AlertCircle, Loader2 } from 'lucide-react'

function RoadsIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17h18M3 12h18M9 7h6" />
      <path d="M5 17l-2 5M19 17l2 5M5 7l-2-5M19 7l2-5" />
    </svg>
  )
}

const CATEGORY_INFO = {
  roads:        { label: 'Roads',        icon: RoadsIcon      },
  drainage:     { label: 'Drainage',     icon: Droplets       },
  streetlights: { label: 'Streetlights', icon: Lightbulb      },
  waste:        { label: 'Waste',        icon: Trash2         },
  electricity:  { label: 'Electricity',  icon: Zap            },
  other:        { label: 'Other',        icon: MoreHorizontal },
}

// Builds an OSM embed URL centred on the given coordinates
function getStaticMapUrl(coords) {
  if (!coords) return null
  const { lat, lng } = coords
  const delta = 0.003
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta},${lat - delta},${lng + delta},${lat + delta}&layer=mapnik&marker=${lat},${lng}`
}

// ── Duplicate overlay ──────────────────────────────────────────────────────────
function DuplicateOverlay({ reportData, onDismiss, onSubmitAnyway }) {
  const navigate = useNavigate()
  const sheetRef = useRef(null)

  const dragStartY = useRef(null)
  const [dragY, setDragY] = useState(0)
  const DISMISS_THRESHOLD = 100

  const similarReport =
    mockReports.find((r) => r.category === reportData.category) ||
    mockReports[0]

  function handleViewExisting() {
    navigate(`/reports/${similarReport.id}`)
  }

  function handlePointerDown(e) {
    dragStartY.current = e.clientY
    sheetRef.current?.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e) {
    if (dragStartY.current === null) return
    const delta = e.clientY - dragStartY.current
    if (delta > 0) setDragY(delta)
  }

  function handlePointerUp() {
    if (dragY >= DISMISS_THRESHOLD) {
      onDismiss()
    }
    setDragY(0)
    dragStartY.current = null
  }

  return (
    <div
      onClick={onDismiss}
      style={{ backgroundColor: `rgba(0,0,0,${Math.max(0, 0.5 - dragY / 600)})` }}
      className="absolute inset-0 z-50 flex flex-col justify-end"
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragY === 0 ? 'transform 0.3s ease' : 'none',
        }}
        className="bg-white rounded-t-3xl shrink-0 max-h-[92%] overflow-y-auto touch-none"
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4 cursor-grab" />

        <div className="px-4 pb-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
              <TriangleAlert size={18} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Similar Report Found</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                A report in this category was submitted{' '}
                <strong className="text-gray-700">recently</strong> nearby your location.
              </p>
            </div>
          </div>

          <button
            onClick={handleViewExisting}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 flex items-center gap-3 text-left tap-active"
          >
            <div className="w-16 h-14 rounded-xl bg-gray-200 overflow-hidden shrink-0">
              <img src={similarReport.photo_urls[0]} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <StatusBadge status={similarReport.status} />
                <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                  <Clock size={9} /> {similarReport.display_date}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-800 truncate">{similarReport.title}</p>
              <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
                <MapPin size={10} /> {similarReport.location_name}
              </p>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0" />
          </button>

          <div className="flex items-start gap-1.5">
            <Info size={13} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-500 italic">
              This might be the same issue you're reporting.
            </p>
          </div>

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
              onClick={onSubmitAnyway}
              disabled={submitting}
              className="w-full border-2 border-gray-200 text-gray-800 font-bold py-3.5 rounded-2xl tap-active disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Anyway'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Step 3 Review ──────────────────────────────────────────────────────────────
export default function Step3Review() {
  const navigate = useNavigate()
  const { reportData } = useReport()

  const { user } = useAuth()
  const { invalidate } = useReports()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showGeofenceWarning, setShowGeofenceWarning] = useState(false)
  const [geofenceAcknowledged, setGeofenceAcknowledged] = useState(false)
  const [showDuplicate, setShowDuplicate] = useState(false)
  const [duplicateDetected, setDuplicateDetected] = useState(false)

  const categoryInfo = CATEGORY_INFO[reportData.category] || CATEGORY_INFO.other
  const CategoryIcon = categoryInfo.icon

  const displayCategoryLabel =
    reportData.category === 'other' && reportData.customCategory
      ? reportData.customCategory
      : categoryInfo.label

  const mapUrl = getStaticMapUrl(reportData.coords)


  const OKAIKWEI_BOUNDS = {
    minLat: 5.5400, maxLat: 5.6200,
    minLng: -0.2600, maxLng: -0.1800,
  }

  function isInServiceArea(lat, lng) {
    if (!lat || !lng) return true
    return (
      lat >= OKAIKWEI_BOUNDS.minLat && lat <= OKAIKWEI_BOUNDS.maxLat &&
      lng >= OKAIKWEI_BOUNDS.minLng && lng <= OKAIKWEI_BOUNDS.maxLng
    )
  }

  async function doSubmit() {
    setSubmitting(true)
    setSubmitError('')
    const inArea = isInServiceArea(reportData.coords?.lat, reportData.coords?.lng)
    const { error } = await submitReport(
      {
        ...reportData,
        is_in_service_area: inArea,
        constituency: inArea ? 'Okaikwei North' : 'Outside Service Area',
      },
      user?.id || null,
      getDeviceId()
    )
    setSubmitting(false)
    if (error) {
      setSubmitError('Failed to submit report. Please try again.')
      return false
    }
    invalidate()
    return true
  }

  async function handleSubmit() {
    if (submitting) return
    const inArea = isInServiceArea(reportData.coords?.lat, reportData.coords?.lng)
    if (!inArea && !geofenceAcknowledged) {
      setShowGeofenceWarning(true)
      return
    }
    if (duplicateDetected) {
      setShowDuplicate(true)
      return
    }
    const isDuplicate = Math.random() < 0.5
    if (isDuplicate) {
      setDuplicateDetected(true)
      setShowDuplicate(true)
      return
    }
    const success = await doSubmit()
    if (success) navigate('/report/success')
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <AppHeader title="Review Your Report" onBack={() => navigate('/report/step2')} />

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-4">

        <StepIndicator current={3} />

        {showGeofenceWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">Outside Service Area</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Your location appears to be outside the Okaikwei North Municipal Assembly area.
                  Your report will still be submitted but may not be actioned by the assembly.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowGeofenceWarning(false); navigate('/report/step2') }}
                className="flex-1 border border-amber-300 text-amber-700 font-semibold py-2.5 rounded-xl text-sm tap-active"
              >
                Fix Location
              </button>
              <button
                onClick={async () => {
                  setShowGeofenceWarning(false)
                  setGeofenceAcknowledged(true)
                  const success = await doSubmit()
                  if (success) navigate('/report/success')
                }}
                className="flex-1 bg-amber-500 text-white font-bold py-2.5 rounded-xl text-sm tap-active"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold text-gray-900">One last check!</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Review the details below to ensure your report is accurate. AI will
            analyse this data for faster resolution.
          </p>
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

          {/* Category row */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <CategoryIcon size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</p>
              <p className="text-base font-bold text-gray-900 truncate">{displayCategoryLabel}</p>
            </div>
            <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
              <Sparkles size={10} />
              Pending AI Analysis
            </span>
          </div>

          {/* Description */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Issue Description
            </p>
            <p className="text-sm text-gray-700 italic leading-relaxed">
              "{reportData.description}"
            </p>
          </div>

          {/* Location */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin size={11} /> Location Details
            </p>
            <p className="text-sm font-semibold text-gray-800 mb-2">
              {reportData.locationName || 'Location not set'}
            </p>

            {/* Static OSM map */}
            <div className="h-32 rounded-xl overflow-hidden border border-gray-100">
              {mapUrl ? (
                <iframe
                  src={mapUrl}
                  title="Report location"
                  className="w-full h-full border-0 pointer-events-none"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-400">No location set</span>
                </div>
              )}
            </div>

            {reportData.coords && (
              <p className="text-[10px] text-gray-400 mt-1.5">
                GPS: {reportData.coords.lat.toFixed(4)}° N,{' '}
                {Math.abs(reportData.coords.lng).toFixed(4)}° W
              </p>
            )}
          </div>

          {/* Photo evidence */}
          {reportData.photos?.length > 0 && (
            <div className="p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Camera size={11} />
                Photo Evidence ({reportData.photos.length})
              </p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {reportData.photos.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Evidence ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-xl shrink-0 border border-gray-100"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Fixed bottom actions */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 space-y-2">
        {submitError && (
          <p className="text-xs text-red-500 text-center">{submitError}</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-blue-600 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 tap-active"
        >
          {submitting ? (
            <><Loader2 size={16} className="animate-spin" /> Submitting...</>
          ) : (
            <>Submit Report <Send size={16} /></>
          )}
        </button>

        {/* More prominent Go Back — outlined button instead of plain text */}
        <button
          onClick={() => navigate('/report/step2')}
          className="w-full border border-gray-300 text-gray-600 font-semibold py-3 rounded-2xl flex items-center justify-center gap-1.5 tap-active"
        >
          <ChevronLeft size={16} />
          Go Back
        </button>

        <p className="text-center text-[10px] text-gray-400 uppercase tracking-wide pt-0.5">
          By submitting, you agree that this information is accurate to the best of your knowledge.
        </p>
      </div>

      <BottomNav />

      {showDuplicate && (
        <DuplicateOverlay
          reportData={reportData}
          onDismiss={() => setShowDuplicate(false)}
          onSubmitAnyway={async () => {
            const success = await doSubmit()
            if (success) {
              setShowDuplicate(false)
              navigate('/report/success')
            }
          }}
          submitting={submitting}
        />
      )}
    </div>
  )
}