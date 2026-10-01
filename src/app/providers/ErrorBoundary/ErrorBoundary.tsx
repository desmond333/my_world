import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import './ErrorBoundary.css'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    }
  }

  componentDidCatch(_error: unknown, _info: ErrorInfo) {
    void _info
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: '' })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="error-boundary">
          <p className="error-boundary__title">Что-то пошло не так</p>
          {this.state.message && <p className="error-boundary__message">{this.state.message}</p>}
          <button className="error-boundary__retry" onClick={this.handleRetry}>
            Попробовать снова
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
