// API Context Provider for State Management

import { createContext, useContext, useState, useCallback, useEffect, PropsWithChildren } from 'react'
import { getApiClient, type IApiService, ApiError } from './api'
import type { Story, UserProfile, SystemHealth, AnalysisResult } from '../types/investment'
import { ApiDataTransformer } from './dataTransformer'
import type { ProfileUpdateRequest } from './api'

export interface ApiState {
    stories: {
        data: Story[]
        loading: boolean
        error: ApiError | null
        lastFetch: Date | null
    }
    userProfile: {
        data: UserProfile | null
        loading: boolean
        error: ApiError | null
    }
    systemStatus: {
        data: SystemHealth | null
        loading: boolean
        error: ApiError | null
    }
    analysis: {
        results: AnalysisResult[]
        loading: boolean
        error: ApiError | null
    }
}

export interface ApiContextValue extends ApiState {
    actions: {
        fetchStories: () => Promise<void>
        fetchUserProfile: () => Promise<void>
        updateUserProfile: (profile: ProfileUpdateRequest) => Promise<void>
        fetchSystemStatus: () => Promise<void>
        analyzeHeadline: (text: string) => Promise<void>
        refreshNews: () => Promise<void>
        resetMemory: () => Promise<void>
        clearError: (section: keyof ApiState) => void
    }
}

const ApiContext = createContext<ApiContextValue | null>(null)

const initialState: ApiState = {
    stories: {
        data: [],
        loading: false,
        error: null,
        lastFetch: null,
    },
    userProfile: {
        data: null,
        loading: false,
        error: null,
    },
    systemStatus: {
        data: null,
        loading: false,
        error: null,
    },
    analysis: {
        results: [],
        loading: false,
        error: null,
    },
}

export interface ApiProviderProps extends PropsWithChildren {
    apiService?: IApiService
}

export function ApiProvider({ children, apiService }: ApiProviderProps) {
    const [state, setState] = useState<ApiState>(initialState)
    const api = apiService || getApiClient()
    const transformer = new ApiDataTransformer()

    // Clear errors
    const clearError = useCallback((section: keyof ApiState) => {
        setState((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                error: null,
            },
        }))
    }, [])

    // Fetch stories
    const fetchStories = useCallback(async () => {
        setState((prev) => ({
            ...prev,
            stories: {
                ...prev.stories,
                loading: true,
                error: null,
            },
        }))

        try {
            const response = await api.getStories()
            const transformedStories = response.stories.map((story) => transformer.transformStory(story))

            setState((prev) => ({
                ...prev,
                stories: {
                    data: transformedStories,
                    loading: false,
                    error: null,
                    lastFetch: new Date(),
                },
            }))
        } catch (error) {
            const apiError = error instanceof ApiError ? error : new ApiError(0, String(error))
            setState((prev) => ({
                ...prev,
                stories: {
                    ...prev.stories,
                    loading: false,
                    error: apiError,
                },
            }))
            throw apiError
        }
    }, [api, transformer])

    // Fetch user profile
    const fetchUserProfile = useCallback(async () => {
        setState((prev) => ({
            ...prev,
            userProfile: {
                ...prev.userProfile,
                loading: true,
                error: null,
            },
        }))

        try {
            const response = await api.getUserProfile()
            const transformedProfile = transformer.transformUserProfile(response)

            setState((prev) => ({
                ...prev,
                userProfile: {
                    data: transformedProfile,
                    loading: false,
                    error: null,
                },
            }))
        } catch (error) {
            const apiError = error instanceof ApiError ? error : new ApiError(0, String(error))
            setState((prev) => ({
                ...prev,
                userProfile: {
                    ...prev.userProfile,
                    loading: false,
                    error: apiError,
                },
            }))
            throw apiError
        }
    }, [api, transformer])

    // Update user profile
    const updateUserProfile = useCallback(
        async (profile: ProfileUpdateRequest) => {
            setState((prev) => ({
                ...prev,
                userProfile: {
                    ...prev.userProfile,
                    loading: true,
                    error: null,
                },
            }))

            try {
                await api.updateUserProfile(profile)
                // Refetch the profile
                await fetchUserProfile()
            } catch (error) {
                const apiError = error instanceof ApiError ? error : new ApiError(0, String(error))
                setState((prev) => ({
                    ...prev,
                    userProfile: {
                        ...prev.userProfile,
                        loading: false,
                        error: apiError,
                    },
                }))
                throw apiError
            }
        },
        [api, fetchUserProfile]
    )

    // Fetch system status
    const fetchSystemStatus = useCallback(async () => {
        setState((prev) => ({
            ...prev,
            systemStatus: {
                ...prev.systemStatus,
                loading: true,
                error: null,
            },
        }))

        try {
            const response = await api.getSystemStatus()
            const transformedStatus = transformer.transformSystemStatus(response)

            setState((prev) => ({
                ...prev,
                systemStatus: {
                    data: transformedStatus,
                    loading: false,
                    error: null,
                },
            }))
        } catch (error) {
            const apiError = error instanceof ApiError ? error : new ApiError(0, String(error))
            setState((prev) => ({
                ...prev,
                systemStatus: {
                    ...prev.systemStatus,
                    loading: false,
                    error: apiError,
                },
            }))
            throw apiError
        }
    }, [api, transformer])

    // Analyze headline
    const analyzeHeadline = useCallback(
        async (text: string) => {
            setState((prev) => ({
                ...prev,
                analysis: {
                    ...prev.analysis,
                    loading: true,
                    error: null,
                },
            }))

            try {
                const response = await api.analyzeHeadline(text)
                const transformedResult = transformer.transformAnalysis(response)

                setState((prev) => ({
                    ...prev,
                    analysis: {
                        results: [transformedResult, ...prev.analysis.results],
                        loading: false,
                        error: null,
                    },
                }))
            } catch (error) {
                const apiError = error instanceof ApiError ? error : new ApiError(0, String(error))
                setState((prev) => ({
                    ...prev,
                    analysis: {
                        ...prev.analysis,
                        loading: false,
                        error: apiError,
                    },
                }))
                throw apiError
            }
        },
        [api, transformer]
    )

    // Refresh news
    const refreshNews = useCallback(async (): Promise<void> => {
        try {
            const response: RefreshResponse = await api.refreshNews()
            console.log(response.message)
        } catch (error) {
            console.error('Failed to refresh news:', error)
            throw error
        }
    }, [api])

    // Reset memory
    const resetMemory = useCallback(async () => {
        try {
            await api.resetMemory()
            // Refetch stories after reset
            await fetchStories()
        } catch (error) {
            const apiError = error instanceof ApiError ? error : new ApiError(0, String(error))
            throw apiError
        }
    }, [api, fetchStories])

    // Load initial data on mount only
    useEffect(() => {
        let isMounted = true

        const loadInitialData = async () => {
            try {
                await Promise.all([fetchStories(), fetchUserProfile(), fetchSystemStatus()])
            } catch (error) {
                if (isMounted) {
                    console.error('Failed to fetch initial data:', error)
                }
            }
        }

        loadInitialData()

        return () => {
            isMounted = false
        }
    }, [])

    const value: ApiContextValue = {
        ...state,
        actions: {
            fetchStories,
            fetchUserProfile,
            updateUserProfile,
            fetchSystemStatus,
            analyzeHeadline,
            refreshNews,
            resetMemory,
            clearError,
        },
    }

    return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}

export function useApiContext(): ApiContextValue {
    const context = useContext(ApiContext)
    if (!context) {
        throw new Error('useApiContext must be used within ApiProvider')
    }
    return context
}

export interface RefreshResponse {
    message: string;
}
