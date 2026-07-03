const STATUS_STYLES = {
  'In Progress': {
    wrapper: 'bg-blue-100',
    dot: 'bg-blue-500',
    text: 'text-blue-700',
  },
  'Investigating': {
    wrapper: 'bg-blue-100',
    dot: 'bg-blue-500',
    text: 'text-blue-700',
  },
  'Pending': {
    wrapper: 'bg-orange-100',
    dot: 'bg-orange-400',
    text: 'text-orange-600',
  },
  'Processing': {
    wrapper: 'bg-purple-100',
    dot: 'bg-purple-400',
    text: 'text-purple-600',
  },
  'Resolved': {
    wrapper: 'bg-green-100',
    dot: 'bg-green-500',
    text: 'text-green-700',
  },
  'Rejected': {
    wrapper: 'bg-red-100',
    dot: 'bg-red-400',
    text: 'text-red-600',
  },
}

const FALLBACK_STYLE = {
  wrapper: 'bg-gray-100',
  dot: 'bg-gray-400',
  text: 'text-gray-600',
}

export default function StatusBadge({ status }) {
  const styles = STATUS_STYLES[status] ?? FALLBACK_STYLE

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.wrapper} ${styles.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
      {status}
    </span>
  )
}
