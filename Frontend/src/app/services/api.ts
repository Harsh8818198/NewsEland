// API Service Layer - Handles all backend communication

export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public details?: any
    ) {
        super(message)
        this.name = 'ApiError'
    }

    get isNetworkError(): boolean {
        return this.status === 0 || this.status >= 500
    }

    get isClientError(): boolean {
        return this.status >= 400 && this.status < 500
    }

    get userMessage(): string {
        if (this.isNetworkError) {
            return 'Unable to connect to the server. Please check your connection.'
        }
        if (this.isClientError) {
            return this.message || 'Invalid request. Please check your input.'
        }
        return 'An unexpected error occurred. Please try again.'
    }
}

// HTTP Client Interface and Implementation
export interface IHttpClient {
    get<T>(endpoint: string): Promise<T>
    post<T>(endpoint: string, data?: any): Promise<T>
    put<T>(endpoint: string, data: any): Promise<T>
    delete<T>(endpoint: string): Promise<T>
}

export class FetchHttpClient implements IHttpClient {
    constructor(private baseURL: string) { }

    async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`)
        return this.handleResponse<T>(response)
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify(data) : undefined,
        })
        return this.handleResponse<T>(response)
    }

    async put<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        return this.handleResponse<T>(response)
    }

    async delete<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
        })
        return this.handleResponse<T>(response)
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`
            try {
                const errorBody = await response.text()
                errorMessage = errorBody || errorMessage
            } catch {
                // Ignore parsing errors
            }
            throw new ApiError(response.status, errorMessage)
        }

        try {
            return await response.json()
        } catch {
            throw new ApiError(response.status, 'Failed to parse response')
        }
    }
}

// Backend Response Types
export interface HealthResponse {
    status: string
    message: string
}

export interface BackendStory {
    main_topic: string
    maturity: 'DEVELOPING' | 'MATURE'
    updates_count: number
    status: 'ACTIVE' | 'INACTIVE'
    sentiment?: 'positive' | 'neutral' | 'negative'
    last_updated?: string
    entities?: string[]
}

export interface StoriesResponse {
    stories: BackendStory[]
}

export interface SystemStatusResponse {
    status: string
    brains: {
        ingestion: string
        analysis: string
        memory: string
    }
    stories_tracked: number
}

export interface UserProfileResponse {
    user_id: string
    risk_tolerance: string
    capital: number
    horizon: string
    description: string
}

export interface ProfileUpdateRequest {
    user_id: string
    risk_tolerance: string
    capital_available: number
    investment_horizon: string
}

export interface ProfileUpdateResponse {
    success: boolean
    message: string
}

export interface AnalysisResponse {
    analysis: any
    entities: string[]
    story_context: {
        topic: string
        maturity: string
        updates: number
    }
    advice: string
    user_profile: string
}

export interface DecisionLogicResponse {
    Conservative: string
    Aggressive: string
    Contrarian: string
    logic_version: string
}

export interface RefreshResponse {
    success: boolean
    message: string
    new_stories?: number
    updated_stories?: number
}

export interface ResetResponse {
    success: boolean
    message: string
}

// API Service Interface
export interface IApiService {
    // Health and Status
    healthCheck(): Promise<HealthResponse>
    getSystemStatus(): Promise<SystemStatusResponse>

    // Stories Management
    getStories(): Promise<StoriesResponse>
    refreshNews(): Promise<RefreshResponse>
    resetMemory(): Promise<ResetResponse>

    // User Profile
    getUserProfile(): Promise<UserProfileResponse>
    updateUserProfile(profile: ProfileUpdateRequest): Promise<ProfileUpdateResponse>

    // Analysis
    analyzeHeadline(text: string): Promise<AnalysisResponse>
    getDecisionLogic(): Promise<DecisionLogicResponse>
}

// API Client Implementation
export class ApiClient implements IApiService {
    private httpClient: IHttpClient

    constructor(private baseURL: string = 'http://localhost:8000') {
        this.httpClient = new FetchHttpClient(this.baseURL)
    }

    async healthCheck(): Promise<HealthResponse> {
        return this.httpClient.get<HealthResponse>('/api/health')
    }

    async getSystemStatus(): Promise<SystemStatusResponse> {
        return this.httpClient.get<SystemStatusResponse>('/api/system/status')
    }

    async getStories(): Promise<StoriesResponse> {
        return this.httpClient.get<StoriesResponse>('/api/stories')
    }

    async refreshNews(): Promise<RefreshResponse> {
        return this.httpClient.post<RefreshResponse>('/api/refresh')
    }

    async resetMemory(): Promise<ResetResponse> {
        return this.httpClient.post<ResetResponse>('/api/reset')
    }

    async getUserProfile(): Promise<UserProfileResponse> {
        return this.httpClient.get<UserProfileResponse>('/api/profile')
    }

    async updateUserProfile(profile: ProfileUpdateRequest): Promise<ProfileUpdateResponse> {
        return this.httpClient.post<ProfileUpdateResponse>('/api/profile', profile)
    }

    async analyzeHeadline(text: string): Promise<AnalysisResponse> {
        return this.httpClient.post<AnalysisResponse>('/api/analyze', { text })
    }

    async getDecisionLogic(): Promise<DecisionLogicResponse> {
        return this.httpClient.get<DecisionLogicResponse>('/api/decision-logic')
    }
}

// Singleton instance
let apiClientInstance: ApiClient | null = null

export function getApiClient(): ApiClient {
    if (!apiClientInstance) {
        apiClientInstance = new ApiClient()
    }
    return apiClientInstance
}
