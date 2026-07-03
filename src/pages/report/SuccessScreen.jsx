import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, ChevronRight } from 'lucide-react'
import BottomNav from '../../components/BottomNav.jsx'
import { useReport } from '../../hooks/useReport.js'

function generateReferenceId() {
  const random = Math.floor(10000 + Math.random() * 90000)
  return `#CFX-${random}-ACCRA`
}

// Animated checkmark drawn via SVG stroke-dashoffset animation.
// The circle and the tick both draw in sequence for a satisfying
// "success" feeling on submission.
function AnimatedCheckmark() {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    // Small delay so the animation fires after the screen has mounted
    const t = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="w-24 h-24 flex items-center justify-center">
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle */}
        <circle
          cx="48"
          cy="48"
          r="44"
          stroke="#dcfce7"
          strokeWidth="4"
          fill="#f0fdf4"
        />
        {/* Animated circle border */}
        <circle
          cx="48"
          cy="48"
          r="44"
          stroke="#16a34a"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="276.46"
          strokeDashoffset={animate ? '0' : '276.46'}
          transform="rotate(-90 48 48)"
          style={{
            transition: animate
              ? 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'none',
          }}
        />
        {/* Animated tick */}
        <path
          d="M28 50L42 64L68 34"
          stroke="#16a34a"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="60"
          strokeDashoffset={animate ? '0' : '60'}
          style={{
            transition: animate
              ? 'stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.5s'
              : 'none',
          }}
        />
      </svg>
    </div>
  )
}

export default function SuccessScreen() {
  const navigate = useNavigate()
  const { resetReport } = useReport()
  const [referenceId] = useState(generateReferenceId)

  useEffect(() => {
    resetReport()
  }, [])

  return (
    <div className="flex flex-col h-full bg-gray-50 items-center justify-center px-6 pb-16">

      <AnimatedCheckmark />

      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center mt-4">
        Report Submitted!
      </h1>
      <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
        Thank you for helping CitiFix. Your report is being processed by the
        local assembly. You'll be notified of status updates.
      </p>

      {/* Reference ID card */}
      <div className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
          <Info size={16} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Reference ID
          </p>
          <p className="text-sm font-bold text-gray-900 truncate">
            {referenceId}
          </p>
        </div>
        <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full shrink-0">
          Pending
        </span>
      </div>

      <div className="w-full space-y-2">
        <button
          onClick={() => navigate('/my-reports')}
          className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 tap-active"
        >
          View My Reports
          <ChevronRight size={18} />
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-2xl tap-active"
        >
          Back to Home
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
