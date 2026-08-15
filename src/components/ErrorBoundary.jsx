import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // TODO: send to analytics/logging service
    // console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center p-6">
          <div className="max-w-lg text-center">
            <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600">Reloading the app may fix this — your in-progress report is saved.</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
