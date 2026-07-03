import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Navigation, ChevronLeft, ChevronRight, Search, X, MapPin, Loader2 } from 'lucide-react'
import AppHeader from '../../components/AppHeader.jsx'
import BottomNav from '../../components/BottomNav.jsx'
import StepIndicator from '../../components/StepIndicator.jsx'
import { useReport } from '../../hooks/useReport.js'
import { useGeolocation } from '../../hooks/useGeolocation.js'
import { useReverseGeocode } from '../../hooks/useReverseGeocode.js'
import { useLocationSearch } from '../../hooks/useLocationSearch.js'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const DEFAULT_CENTER = { lat: 5.6037, lng: -0.1870 }

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function MapRecenter({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], map.getZoom(), { duration: 0.8 })
    }
  }, [position, map])
  return null
}

export default function Step2Location() {
  const navigate = useNavigate()
  const { reportData, updateReport } = useReport()
  const { coords: gpsCoords, loading: gpsLoading, error: gpsError, refetch } = useGeolocation()

  const [position, setPosition] = useState(reportData.coords || DEFAULT_CENTER)
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [showExifNotice, setShowExifNotice] = useState(!!reportData.exifCoords)

  const { address, loading: addressLoading } = useReverseGeocode(position)
  const { results, loading: searchLoading, search, clearResults } = useLocationSearch()

  // Priority order for pre-filling the pin:
  // 1. Previously saved coords (user already visited this step)
  // 2. EXIF GPS from uploaded photo
  // 3. Live GPS from device
  // 4. Default centre (Accra)
  useEffect(() => {
    if (reportData.coords) return // already saved, don't override
    if (reportData.exifCoords) {
      setPosition(reportData.exifCoords)
      return
    }
    if (gpsCoords) {
      setPosition(gpsCoords)
    }
  }, [gpsCoords, reportData.exifCoords])

  function handleUseMyLocation() {
    if (gpsCoords) {
      setPosition(gpsCoords)
    } else {
      refetch()
    }
  }

  function handleSearchChange(e) {
    const value = e.target.value
    setSearchQuery(value)
    setShowResults(true)
    search(value)
  }

  function handleSelectResult(result) {
    setPosition({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) })
    setSearchQuery('')
    setShowResults(false)
    clearResults()
  }

  function handleClearSearch() {
    setSearchQuery('')
    setShowResults(false)
    clearResults()
  }

  function handleNext() {
    updateReport({
      coords: position,
      locationName: address || 'Selected location, Accra',
    })
    navigate('/report/step3')
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <AppHeader title="Pin the Location" onBack={() => navigate('/report/step1')} />

      {/* Step indicator — compact, no extra wrapper padding */}
      <div className="px-4 pt-2.5 pb-2 bg-white border-b border-gray-100">
        <StepIndicator current={2} />
      </div>

      {/* Map area — relative for overlays */}
      <div className="relative flex-1 min-h-0">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={15}
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[position.lat, position.lng]} />
          <MapClickHandler onLocationSelect={setPosition} />
          <MapRecenter position={position} />
        </MapContainer>

        {/* Search box overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-1000">
          <div className="bg-white rounded-xl shadow-md flex items-center gap-2 px-3 py-2">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowResults(true)}
              placeholder="Search for a place or street..."
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 focus:outline-none min-w-0"
            />
            {searchLoading && <Loader2 size={14} className="text-gray-400 animate-spin shrink-0" />}
            {searchQuery && !searchLoading && (
              <button onClick={handleClearSearch} className="shrink-0">
                <X size={14} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {showResults && results.length > 0 && (
            <div className="mt-1.5 bg-white rounded-xl shadow-md overflow-hidden max-h-40 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleSelectResult(result)}
                  className="w-full flex items-start gap-2 px-3 py-2.5 text-left border-b border-gray-50 last:border-0 hover:bg-gray-50"
                >
                  <MapPin size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 leading-snug line-clamp-2">
                    {result.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GPS status badge */}
        <div className="absolute top-16 right-2.5 z-1000 bg-white rounded-lg shadow-md px-2.5 py-1 flex items-center gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              gpsLoading ? 'bg-amber-400' : gpsError ? 'bg-red-400' : 'bg-green-500'
            }`}
          />
          <span className="text-[10px] font-semibold text-gray-700">
            {gpsLoading ? 'LOCATING' : gpsError ? 'GPS OFF' : 'GPS ON'}
          </span>
        </div>

        {/* Tap hint */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-1000 bg-gray-900/75 text-white text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap">
          Tap the map to move the pin
        </div>
      </div>

      {/* Bottom panel — tightened spacing to avoid scroll */}
      <div className="bg-white px-4 pt-2.5 pb-2 space-y-2 shrink-0 mb-16">

        {/* EXIF GPS notice — dismissible, shown when photo location was used */}
        {showExifNotice && (
          <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
            <MapPin size={13} className="text-green-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-green-700 flex-1 leading-relaxed">
              Location pre-filled from your photo. You can still adjust the pin.
            </p>
            <button
              onClick={() => setShowExifNotice(false)}
              className="shrink-0 tap-active"
            >
              <X size={13} className="text-green-500" />
            </button>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
          <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">
            Target Location
          </p>
          <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 flex items-center gap-1.5">
            {addressLoading ? (
              <>
                <Loader2 size={11} className="animate-spin text-blue-400" />
                Looking up address...
              </>
            ) : (
              address || 'Move the pin to detect address'
            )}
          </p>
        </div>

        <button
          onClick={handleUseMyLocation}
          className="w-full bg-blue-600 text-white font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 tap-active"
        >
          <Navigation size={15} />
          Use My Current Location
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => navigate('/report/step1')}
            className="flex-1 border border-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl flex items-center justify-center gap-1 tap-active"
          >
            <ChevronLeft size={15} />
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex-1 bg-blue-600 text-white font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-1 tap-active"
          >
            Next Step
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
