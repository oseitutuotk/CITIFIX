import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Camera,
  ImagePlus,
  X,
  Droplets,
  Lightbulb,
  Trash2,
  Zap,
  MoreHorizontal,
  MapPin,
  Route,
} from 'lucide-react'
import AppHeader from '../../components/AppHeader.jsx'
import BottomNav from '../../components/BottomNav.jsx'
import StepIndicator from '../../components/StepIndicator.jsx'
import { useReport } from '../../hooks/useReport.js'
import { useExifGps } from '../../hooks/useExifGps.js'

const CATEGORIES = [
  { id: 'roads',        label: 'Roads',        icon: Route         },
  { id: 'drainage',     label: 'Drainage',     icon: Droplets      },
  { id: 'streetlights', label: 'Streetlights', icon: Lightbulb     },
  { id: 'waste',        label: 'Waste',        icon: Trash2        },
  { id: 'electricity',  label: 'Electricity',  icon: Zap           },
  { id: 'other',        label: 'Other',        icon: MoreHorizontal },
]

const MAX_PHOTOS = 5
const MAX_DESCRIPTION_LENGTH = 250

export default function Step1Details() {
  const navigate = useNavigate()
  const { reportData, updateReport } = useReport()

  const [photos, setPhotos] = useState(reportData.photos || [])
  const [showPhotoSheet, setShowPhotoSheet] = useState(false)

  // Two hidden file inputs — one for gallery, one for camera
  const galleryInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const { extractGps, hasExif } = useExifGps()

  const isOtherSelected = reportData.category === 'other'
  const canContinue =
    reportData.category &&
    reportData.description?.trim() &&
    (!isOtherSelected || reportData.customCategory?.trim())

  function handleSelectCategory(id) {
    if (id !== 'other') {
      updateReport({ category: id, customCategory: '' })
    } else {
      updateReport({ category: id })
    }
  }

  function handleDescriptionChange(e) {
    const value = e.target.value.slice(0, MAX_DESCRIPTION_LENGTH)
    updateReport({ description: value })
  }

  // Handles files selected from either gallery or camera input.
  // Also attempts EXIF GPS extraction from the first photo — if found,
  // stores it in context so Step 2 can pre-fill the map pin.
  async function handleFileChange(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const remaining = MAX_PHOTOS - photos.length
    const toAdd = files.slice(0, remaining)

    // Convert each File to a local object URL for preview
    const newPhotos = toAdd.map((file) => URL.createObjectURL(file))
    setPhotos((prev) => [...prev, ...newPhotos])

    // Try to extract GPS from the first new photo only
    const gpsCoords = await extractGps(toAdd[0])
    if (gpsCoords) {
      updateReport({ exifCoords: gpsCoords })
    }
    setShowPhotoSheet(false)

    // Reset the input so the same file can be re-selected if needed
    e.target.value = ''
  }

  function handleRemovePhoto(indexToRemove) {
    setPhotos((prev) => prev.filter((_, i) => i !== indexToRemove))
  }

  function handleContinue() {
    if (!canContinue) return
    updateReport({ photos })
    navigate('/report/step2')
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <AppHeader title="New Report" onBack={() => navigate('/')} />

      <div className="page-scroll px-4 pt-4 space-y-5">

        <StepIndicator current={1} />

        {/* Category selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Select Category
            </span>
            <span className="text-xs text-red-400 bg-red-50 px-2 py-0.5 rounded-full">
              Required
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {CATEGORIES.map(({ id, label, icon: Icon }) => {
              const isSelected = reportData.category === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectCategory(id)}
                  className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-colors tap-active ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <span
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-blue-600' : 'bg-gray-100'
                    }`}
                  >
                    <Icon
                      size={20}
                      className={isSelected ? 'text-white' : 'text-gray-500'}
                    />
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      isSelected ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Custom category input for "Other" */}
          {isOtherSelected && (
            <div className="mt-3">
              <input
                type="text"
                value={reportData.customCategory || ''}
                onChange={(e) => updateReport({ customCategory: e.target.value })}
                placeholder="What kind of issue is this? (e.g. Noise complaint)"
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
              <p className="text-xs text-gray-400 mt-1.5 px-1">
                Tell us briefly what category this falls under, or continue and we'll review it manually.
              </p>
            </div>
          )}
        </div>

        {/* Description textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Issue Description
            </span>
            <span className="text-xs text-gray-400">
              {reportData.description?.length || 0}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
          <textarea
            value={reportData.description || ''}
            onChange={handleDescriptionChange}
            placeholder="Describe the problem in detail (e.g. huge pothole on Spintex Route near the pharmacy)..."
            rows={4}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Photo upload */}
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
            Add Photos
          </span>

          {/* Thumbnail previews */}
          {photos.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {photos.map((url, index) => (
                <div
                  key={index}
                  className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200"
                >
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Wide upload tile — hidden when max photos reached */}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => setShowPhotoSheet(true)}
              className="w-full h-16 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center gap-3 tap-active"
            >
              <ImagePlus size={20} className="text-gray-400 shrink-0" />
              <span className="text-sm font-medium text-gray-400">
                Click here to upload photo
              </span>
            </button>
          )}

          <p className="text-xs text-gray-400 mt-2">
            * Max {MAX_PHOTOS} photos. Clear photos help officials act faster.
          </p>
        </div>

        {/* EXIF GPS notice — shown when location was detected from a photo */}
        {hasExif && (
          <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-2xl px-3 py-2.5">
            <MapPin size={14} className="text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-green-700 leading-relaxed">
              Location detected from your photo. The map in Step 2 will be pre-filled — you can still adjust it.
            </p>
          </div>
        )}

        {/* Continue button */}
        <div className="pt-1 pb-2">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full bg-blue-600 disabled:bg-gray-200 text-white disabled:text-gray-400 font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors tap-active"
          >
            Continue to Location
            <ChevronRight size={20} />
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            Step 1 of 3: You can edit these details later.
          </p>
        </div>

      </div>

      {/* Photo source action sheet */}
      {showPhotoSheet && (
        <div
          onClick={() => setShowPhotoSheet(false)}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          className="absolute inset-0 z-50 flex flex-col justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl shrink-0"
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />

            <div className="px-4 pb-6 pt-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-4">
                Add Photo
              </p>

              {/* Gallery option */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="w-full flex items-center gap-4 px-4 py-4 bg-gray-50 rounded-2xl mb-3 tap-active"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <ImagePlus size={20} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    Choose from Gallery
                  </p>
                  <p className="text-xs text-gray-400">
                    Select a photo from your device
                  </p>
                </div>
              </button>

              {/* Camera option */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center gap-4 px-4 py-4 bg-gray-50 rounded-2xl mb-3 tap-active"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Camera size={20} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    Take a Photo
                  </p>
                  <p className="text-xs text-gray-400">
                    Open camera and capture now
                  </p>
                </div>
              </button>

              {/* Cancel */}
              <button
                type="button"
                onClick={() => setShowPhotoSheet(false)}
                className="w-full py-3.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 tap-active"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <BottomNav />
    </div>
  )
}
