import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  MoreHorizontal,
  Clock,
  MapPin,
  Sparkles,
  Camera,
  Eye,
  EyeOff,
  Send,
  Droplets,
  Lightbulb,
  Trash2,
  Zap,
  TriangleAlert,
  Share2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  AlertCircle,
  Waves,
} from 'lucide-react'
import AppHeader from '../components/AppHeader.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useAuth } from '../hooks/useAuth.js'
import {
  fetchReportById,
  toggleReportVisibility,
  submitComment,
} from '../services/reportService.js'

function RoadsIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17h18M3 12h18M9 7h6" />
      <path d="M5 17l-2 5M19 17l2 5M5 7l-2-5M19 7l2-5" />
    </svg>
  )
}

const CATEGORY_INFO = {
  roads:        { label: 'Roads & Transport', icon: RoadsIcon    },
  drainage:     { label: 'Drainage',          icon: Droplets     },
  streetlights: { label: 'Streetlights',      icon: Lightbulb    },
  waste:        { label: 'Waste',             icon: Trash2       },
  electricity:  { label: 'Electricity',       icon: Zap          },
  water:        { label: 'Water',             icon: Waves        },
  other:        { label: 'Other',             icon: TriangleAlert },
}

function getSeverityStyle(severity) {
  const s = severity?.toLowerCase()
  if (s === 'high')   return { label: 'High',   color: 'text-red-500',   bg: 'bg-red-50'   }
  if (s === 'medium') return { label: 'Medium', color: 'text-amber-500', bg: 'bg-amber-50' }
  return                     { label: 'Low',    color: 'text-green-600', bg: 'bg-green-50' }
}

function getStaticMapUrl(lat, lng) {
  if (!lat || !lng) return null
  const delta = 0.003
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta},${lat - delta},${lng + delta},${lat + delta}&layer=mapnik&marker=${lat},${lng}`
}

// ── Swipeable carousel ─────────────────────────────────────────────────────────
function InfoCarousel({ report }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const startX = useRef(null)

  const hasAI = report.ai_summary || report.ai_category

  const cards = [
    {
      id: 'summary',
      label: 'Issue Summary',
      icon: Sparkles,
      iconColor: 'text-blue-600',
      content: report.ai_summary || 'AI analysis pending — check back shortly.',
      contentColor: 'text-blue-800',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      showMeta: true,
    },
    {
      id: 'description',
      label: 'Your Description',
      icon: FileText,
      iconColor: 'text-gray-500',
      content: report.description,
      contentColor: 'text-gray-700',
      bg: 'bg-white',
      border: 'border-gray-100',
      showMeta: false,
    },
  ]

  const active = cards[activeIndex]

  function handleTouchStart(e) { startX.current = e.touches[0].clientX }
  function handleTouchEnd(e) {
    if (startX.current === null) return
    const delta = e.changedTouches[0].clientX - startX.current
    if (delta < -40 && activeIndex < cards.length - 1) setActiveIndex(activeIndex + 1)
    if (delta > 40 && activeIndex > 0) setActiveIndex(activeIndex - 1)
    startX.current = null
  }

  return (
    <div
      className={`rounded-2xl border p-4 ${active.bg} ${active.border}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <active.icon size={14} className={active.iconColor} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${active.iconColor}`}>
            {active.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            className="w-5 h-5 flex items-center justify-center disabled:opacity-30"
          >
            <ChevronLeft size={14} className="text-gray-400" />
          </button>
          {cards.map((_, i) => (
            <div key={i} onClick={() => setActiveIndex(i)}
              className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-colors ${
                i === activeIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
          <button
            onClick={() => setActiveIndex(Math.min(cards.length - 1, activeIndex + 1))}
            disabled={activeIndex === cards.length - 1}
            className="w-5 h-5 flex items-center justify-center disabled:opacity-30"
          >
            <ChevronRight size={14} className="text-gray-400" />
          </button>
        </div>
      </div>

      <p className={`text-sm leading-relaxed ${active.contentColor}`}>
        {active.content}
      </p>

      {active.showMeta && hasAI && (
        <div className="flex gap-4 mt-3">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Severity
            </p>
            {(() => {
              const s = getSeverityStyle(report.ai_severity)
              return (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.color} ${s.bg}`}>
                  {s.label}
                </span>
              )
            })()}
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Category
            </p>
            <p className="text-sm font-bold text-gray-800">{report.ai_category}</p>
          </div>
        </div>
      )}

      <p className="text-[10px] text-gray-400 text-center mt-3">
        {activeIndex === 0 ? 'Swipe left to see your description →' : '← Swipe right for AI summary'}
      </p>
    </div>
  )
}

// ── Admin update ───────────────────────────────────────────────────────────────
function AdminUpdate({ update }) {
  if (update.is_latest) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                {update.status_label}
              </span>
            </div>
            <span className="text-[10px] text-gray-400">
              {new Date(update.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <div className="border-l-4 border-blue-500 pl-3">
            <p className="text-sm text-gray-700 mb-1.5">{update.body}</p>
            {update.author_name && (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-blue-600">
                    {update.author_name[0]}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{update.author_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 opacity-60">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          {update.status_label}
        </span>
        <span className="text-[10px] text-gray-400">
          {new Date(update.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </span>
      </div>
      <p className="text-sm text-gray-500">{update.body}</p>
    </div>
  )
}

// ── Comment item ───────────────────────────────────────────────────────────────
function CommentItem({ comment }) {
  const initials = (comment.author_name || 'U')
    .split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 flex gap-3">
      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-gray-600">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-sm font-semibold text-gray-900">{comment.author_name || 'User'}</span>
          <span className="text-xs text-gray-400">
            {new Date(comment.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{comment.body}</p>
      </div>
    </div>
  )
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function ReportDetailScreen() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()

  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPublic, setIsPublic] = useState(true)
  const [comment, setComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [comments, setComments] = useState([])

  useEffect(() => {
    async function loadReport() {
      setLoading(true)
      setError(null)
      const { data, error } = await fetchReportById(id)
      if (error || !data) {
        setError('Could not load this report.')
      } else {
        setReport(data)
        setIsPublic(data.is_public)
        setComments(data.comments || [])
      }
      setLoading(false)
    }
    loadReport()
  }, [id])

  async function handleToggleVisibility() {
    const newValue = !isPublic
    setIsPublic(newValue)
    await toggleReportVisibility(id, newValue)
  }

  async function handleSubmitComment() {
    if (!comment.trim() || !user?.id) return
    setSubmittingComment(true)
    const { data, error } = await submitComment(id, user.id, comment.trim())
    if (!error && data) {
      setComments((prev) => [...prev, {
        ...data,
        author_name: user.user_metadata?.full_name || 'You',
      }])
      setComment('')
    }
    setSubmittingComment(false)
  }

  async function handleShare() {
    const shareUrl = `${window.location.origin}/reports/${id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: report?.title || 'CitiFix Report', url: shareUrl })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        alert('Report link copied to clipboard!')
      }
    } catch (_) {}
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <AppHeader title="Report Detail" />
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <Loader2 size={28} className="text-blue-600 animate-spin" />
          <p className="text-sm text-gray-400">Loading report...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <AppHeader title="Report Detail" />
        <div className="flex flex-col items-center justify-center flex-1 gap-3 px-6 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <p className="text-sm font-semibold text-gray-600">{error}</p>
          <button onClick={() => navigate(-1)} className="text-sm text-blue-600 font-semibold">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const categoryInfo = CATEGORY_INFO[report.category] || CATEGORY_INFO.other
  const CategoryIcon = categoryInfo.icon
  const photos = report.report_photos || []
  const adminUpdates = report.admin_updates || []
  const mapUrl = getStaticMapUrl(report.coords_lat, report.coords_lng)

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <AppHeader
        title="Report Detail"
        rightAction={
          <button
            onClick={handleShare}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 tap-active"
          >
            <Share2 size={17} className="text-gray-600" />
          </button>
        }
      />

      <div className="page-scroll px-4 pt-4 space-y-4">

        {/* Title block */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <CategoryIcon size={13} className="text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                {categoryInfo.label}
              </span>
            </div>
            <StatusBadge status={report.status} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight mb-1">
            {report.title || `${report.category} issue at ${report.location_name?.split(',')[0] || 'your area'}`}
          </h1>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {new Date(report.created_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {report.location_name || 'Location not set'}
            </span>
          </div>
        </div>

        {/* Swipeable carousel */}
        <InfoCarousel report={report} />

        {/* Photo + map grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Photo */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 relative h-28">
            {photos.length > 0 ? (
              <>
                <img
                  src={photos[0].storage_url}
                  alt="Report photo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 rounded-lg px-2 py-0.5 flex items-center gap-1">
                  <Camera size={10} className="text-white" />
                  <span className="text-white text-[10px] font-medium">
                    Photo ({photos.length})
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Camera size={20} className="text-gray-300" />
              </div>
            )}
          </div>

          {/* Map */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 h-28">
            {mapUrl ? (
              <iframe
                src={mapUrl}
                title="Report location"
                className="w-full h-full border-0 pointer-events-none"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400 text-xs">No location</span>
              </div>
            )}
          </div>
        </div>

        {/* Public / Private toggle */}
        <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isPublic
              ? <Eye size={16} className="text-blue-500" />
              : <EyeOff size={16} className="text-gray-400" />
            }
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {isPublic ? 'Public Report' : 'Private Report'}
              </p>
              <p className="text-xs text-gray-400">
                {isPublic
                  ? 'Visible to neighbours in your area'
                  : 'Only visible to you and the assembly'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleVisibility}
            className={`w-12 h-6 rounded-full transition-colors flex items-center ${
              isPublic ? 'bg-blue-600 justify-end pr-1' : 'bg-gray-200 justify-start pl-1'
            }`}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow" />
          </button>
        </div>

        {/* Admin updates */}
        {adminUpdates.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3">Admin Updates</h2>
            <div className="space-y-3">
              {adminUpdates.map((update) => (
                <AdminUpdate key={update.id} update={update} />
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Comments</h2>
            <span className="text-xs text-gray-400">{comments.length} Total</span>
          </div>
          {comments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-6 text-center">
              <p className="text-sm text-gray-400">No comments yet. Be the first to comment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <CommentItem key={c.id} comment={c} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Fixed comment input */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
            placeholder="Write a comment..."
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none min-w-0"
          />
          <button
            onClick={handleSubmitComment}
            disabled={!comment.trim() || submittingComment}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              comment.trim() && !submittingComment ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            {submittingComment
              ? <Loader2 size={16} className="text-gray-400 animate-spin" />
              : <Send size={16} className={comment.trim() ? 'text-white' : 'text-gray-400'} />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
