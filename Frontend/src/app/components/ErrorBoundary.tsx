// Error Boundary and Error Display Components

import { Component, PropsWithChildren, ErrorInfo } from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

interface ErrorBoundaryProps extends PropsWithChildren { }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo })
        console.error('Error Boundary caught error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-900">Something went wrong</h3>
                            <p className="text-sm text-red-700 mt-1">{this.state.error?.message}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

interface ErrorMessageProps {
    message: string
    onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm text-red-700">{message}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

interface LoadingSkeletonProps {
    count?: number
    height?: string
}

export function LoadingSkeleton({ count = 1, height = 'h-20' }: LoadingSkeletonProps) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`${height} bg-gray-200 rounded animate-pulse`} />
            ))}
        </div>
    )
}
