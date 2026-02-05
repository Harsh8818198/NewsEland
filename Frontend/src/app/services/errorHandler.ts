// Error Handling System

import { ApiError } from './api'

export enum ErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    CLIENT_ERROR = 'CLIENT_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}

export interface ErrorResponse {
    type: ErrorType
    message: string
    userMessage: string
    retryable: boolean
    retryAfter?: number
}

export class ErrorClassifier {
    static classify(error: ApiError | Error): ErrorResponse {
        if (!(error instanceof ApiError)) {
            return {
                type: ErrorType.VALIDATION_ERROR,
                message: error.message,
                userMessage: error.message || 'An unexpected error occurred.',
                retryable: false,
            }
        }

        if (error.status === 0 || !navigator.onLine) {
            return {
                type: ErrorType.NETWORK_ERROR,
                message: error.message,
                userMessage: 'Unable to connect. Please check your internet connection.',
                retryable: true,
                retryAfter: 5000,
            }
        }

        if (error.status >= 400 && error.status < 500) {
            return {
                type: ErrorType.CLIENT_ERROR,
                message: error.message,
                userMessage: 'Invalid request. Please check your input and try again.',
                retryable: false,
            }
        }

        if (error.status >= 500) {
            return {
                type: ErrorType.SERVER_ERROR,
                message: error.message,
                userMessage: 'Server error. Please try again in a moment.',
                retryable: true,
                retryAfter: 2000,
            }
        }

        return {
            type: ErrorType.VALIDATION_ERROR,
            message: error.message,
            userMessage: error.message,
            retryable: false,
        }
    }
}

export interface RetryConfig {
    maxRetries: number
    baseDelay: number
    maxDelay: number
    retryCondition: (error: ApiError) => boolean
}

export const defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    retryCondition: (error: ApiError) => error.isNetworkError,
}

export class RetryableApiClient {
    constructor(
        private executeOperation: <T>(operation: () => Promise<T>) => Promise<T>,
        private retryConfig: RetryConfig = defaultRetryConfig
    ) { }

    async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
        let lastError: ApiError | undefined

        for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
            try {
                return await this.executeOperation(operation)
            } catch (error) {
                lastError = error as ApiError

                if (!this.retryConfig.retryCondition(lastError) || attempt === this.retryConfig.maxRetries) {
                    throw lastError
                }

                const delay = Math.min(
                    this.retryConfig.baseDelay * Math.pow(2, attempt),
                    this.retryConfig.maxDelay
                )
                await this.sleep(delay)
            }
        }

        throw lastError || new Error('Operation failed')
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }
}
