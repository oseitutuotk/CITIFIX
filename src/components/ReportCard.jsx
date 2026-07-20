import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Droplets,
  Lightbulb,
  Trash2,
  Zap,
  Waves,
  MoreHorizontal,
  Calendar,
  MapPin,
  Loader2,
} from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'

const CATEGORY_CONFIG = {
  roads: {
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17h18M3 12h18M9 7h6" />
        <path d="M5 17l-2 5M19 17l2 5M5 7l-2-5M19 7l2-5" />
      </svg>
    ),
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  drainage:     { icon: Droplets,      color: 'text-blue-500',   bg: 'bg-blue-50'   },
  streetlights: { icon: Lightbulb,     color: 'text-yellow-500', bg: 'bg-yellow-50' },
  waste:        { icon: Trash2,        color: 'text-gray-500',   bg: 'bg-gray-100'  },
  water:        { icon: Waves,         color: 'text-cyan-500',   bg: 'bg-cyan-50'   },
  electricity:  { icon: Zap,           color: 'text-amber-500',  bg: 'bg-amber-50'  },
  other:        { icon: MoreHorizontal, color: 'text-purple-500', bg: 'bg-purple-50' },
}

const FALLBACK_CONFIG = {
  icon: MoreHorizontal,
  color: 'text-gray-400',
  bg: 'bg-gray-100',
}

function CategoryIcon({ category }) {
  const config = CATEGORY_CONFIG[category] ?? FALLBACK_CONFIG
  const Icon = config.icon
  return (
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}>
      <span className={config.color}>
        <Icon size={20} />
      </span>
    </div>
  )
}

// Derives a human-readable temp title from category + location.
// Used while Gemini is processing the report — replaced by the real
// AI-generated title once processing completes.
function getTempTitle(category, locationName) {
  const categoryLabel = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'Issue'
  const location = locationName?.split(',')[0] || 'your area'
  return `${categoryLabel} issue at ${location}`
}

export default function ReportCard({ report }) {
  const navigate = useNavigate()

  const isProcessing = report.status === 'Processing'

  // Show temp title while AI is processing, real title once done
  const displayTitle = isProcessing
    ? getTempTitle(report.category, report.location_name)
    : report.title

  return (
    <button
      onClick={() => navigate(`/reports/${report.id}`)}
      className="w-full bg-white rounded-2xl border border-gray-100 p-3 flex items-start gap-3 text-left tap-active"
    >
      <CategoryIcon category={report.category} />

      <div className="flex-1 min-w-0">
        {/* Category label + date */}
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
            {report.category}
          </span>
          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
            <Calendar size={9} />
            {report.display_date}
          </span>
        </div>

        {/* Title — italic and muted while processing */}
        <p className={`text-sm leading-snug mb-1.5 line-clamp-2 ${
          isProcessing
            ? 'text-gray-400 italic font-normal'
            : 'text-gray-900 font-semibold'
        }`}>
          {displayTitle}
        </p>

        {/* Status badge + location */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <StatusBadge status={report.status} />
            {isProcessing && (
              <Loader2 size={11} className="text-purple-400 animate-spin" />
            )}
          </div>
          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
            <MapPin size={9} />
            {report.location_name?.split(',')[0]}
          </span>
        </div>
      </div>

      <ChevronRight size={16} className="text-gray-300 shrink-0 mt-1" />
    </button>
  )
}
