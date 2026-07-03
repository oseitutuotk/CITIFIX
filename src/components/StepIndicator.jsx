// StepIndicator — used in Step1Details, Step2Location, Step3Review
// Props:
//   current  — the active step number (1, 2, or 3)
//   total    — total number of steps (always 3 for CitiFix)

export default function StepIndicator({ current, total = 3 }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const stepNumber = i + 1
        const isCompleted = stepNumber < current
        const isActive = stepNumber === current

        return (
          <div
            key={stepNumber}
            className={`h-1.5 rounded-full flex-1 transition-colors ${
              isActive || isCompleted ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
        )
      })}

      <span className="text-xs text-gray-400 shrink-0 ml-1">
        Step {current} of {total}
      </span>
    </div>
  )
}
