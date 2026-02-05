// Custom React Hooks for API Calls

import { useState, useEffect, useCallback, useRef } from 'react'
import type { IApiService, ProfileUpdateRequest } from './api'
import { ApiError } from './api'
import type { Story, UserProfile, SystemHealth, AnalysisResult } from '../types/investment'
import { ApiDataTransformer } from './dataTransformer'

export interface UseApiState<T> {
    data: T | null
    loading: boolean
    error: ApiError | null
    refetch: () => Promise<void>
}

const transformer = new ApiDataTransformer()

/**
 * Generic hook for API calls with loading and error states
 */
export function useApiCall<T>(
    apiCall: () => Promise<T>,
    dependencies: any[] = []
): UseApiState<T> {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<ApiError | null>(null)
    const mountedRef = useRef(true)

    const execute = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await apiCall()
            if (mountedRef.current) {
                setData(result)
                setError(null)
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(err instanceof ApiError ? err : new ApiError(0, String(err)))
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false)
            }
        }
    }, [apiCall])

    useEffect(() => {
        execute()

        return () => {
            mountedRef.current = false
        }
    }, dependencies)

    return {
        data,
        loading,
        error,
        refetch: execute,
    }
}

/**
 * Hook for fetching stories
 */
export function useStories(apiService: IApiService, autoRefresh: boolean = false) {
    const [stories, setStories] = useState<Story[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<ApiError | null>(null)
    const refreshIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

    const fetchStories = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await apiService.getStories()
            const transformedStories = response.stories.map((story) => transformer.transformStory(story))
            setStories(transformedStories)
            setError(null)
        } catch (err) {
            setError(err instanceof ApiError ? err : new ApiError(0, String(err)))
        } finally {
            setLoading(false)
        }
    }, [apiService])

    useEffect(() => {
        fetchStories()

        if (autoRefresh) {
            refreshIntervalRef.current = setInterval(fetchStories, 60000) // 60s
        }

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current)
            }
        }
    }, [fetchStories, autoRefresh])

    return {
        stories,
        loading,
        error,
        refetch: fetchStories,
    }
}

/**
 * Hook for user profile
 */
export function useUserProfile(apiService: IApiService) {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<ApiError | null>(null)

    const fetchProfile = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await apiService.getUserProfile()
            const transformedProfile = transformer.transformUserProfile(response)
            setProfile(transformedProfile)
            setError(null)
        } catch (err) {
            setError(err instanceof ApiError ? err : new ApiError(0, String(err)))
        } finally {
            setLoading(false)
        }
    }, [apiService])

    const updateProfile = useCallback(
        async (profileUpdate: ProfileUpdateRequest) => {
            setLoading(true)
            setError(null)
            try {
                await apiService.updateUserProfile(profileUpdate)
                // Refetch the profile after update
                await fetchProfile()
            } catch (err) {
                setError(err instanceof ApiError ? err : new ApiError(0, String(err)))
                throw err
            }
        },
        [apiService, fetchProfile]
    )

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    return {
        profile,
        loading,
        error,
        refetch: fetchProfile,
        updateProfile,
    }
}

/**
 * Hook for system status with optional auto-refresh
 */
export function useSystemStatus(apiService: IApiService, refreshInterval: number = 15000) {
    const [status, setStatus] = useState<SystemHealth | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<ApiError | null>(null)
    const refreshIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

    const fetchStatus = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await apiService.getSystemStatus()
            const transformedStatus = transformer.transformSystemStatus(response)
            setStatus(transformedStatus)
            setError(null)
        } catch (err) {
            setError(err instanceof ApiError ? err : new ApiError(0, String(err)))
        } finally {
            setLoading(false)
        }
    }, [apiService])

    useEffect(() => {
        fetchStatus()

        if (refreshInterval > 0) {
            refreshIntervalRef.current = setInterval(fetchStatus, refreshInterval)
        }

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current)
            }
        }
    }, [fetchStatus, refreshInterval])

    return {
        status,
        loading,
        error,
        refetch: fetchStatus,
    }
}

/**
 * Hook for headline analysis
 */
export function useAnalyzeHeadline(apiService: IApiService) {
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)

    const analyze = useCallback(
        async (text: string) => {
            setLoading(true)
            setError(null)
            try {
                const response = await apiService.analyzeHeadline(text)
                const transformedResult = transformer.transformAnalysis(response)
                setResult(transformedResult)
                setError(null)
            } catch (err) {
                const apiError = err instanceof ApiError ? err : new ApiError(0, String(err))
                setError(apiError)
                throw apiError
            } finally {
                setLoading(false)
            }
        },
        [apiService]
    )

    return {
        analyze,
        result,
        loading,
        error,
    }
}

/**
 * Hook for decision logic
 */
export function useDecisionLogic(apiService: IApiService) {
    const [logic, setLogic] = useState<Record<string, string> | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<ApiError | null>(null)

    const fetchLogic = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await apiService.getDecisionLogic()
            setLogic({
                Conservative: response.Conservative,
                Aggressive: response.Aggressive,
                Contrarian: response.Contrarian,
            })
            setError(null)
        } catch (err) {
            setError(err instanceof ApiError ? err : new ApiError(0, String(err)))
        } finally {
            setLoading(false)
        }
    }, [apiService])

    useEffect(() => {
        fetchLogic()
    }, [fetchLogic])

    return {
        logic,
        loading,
        error,
        refetch: fetchLogic,
    }
}
