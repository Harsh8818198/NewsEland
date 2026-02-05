// Data Transformation Layer - Converts backend responses to frontend models

import type {
    Story,
    SystemHealth,
    UserProfile,
    AnalysisResult,
    Sentiment,
    RiskTolerance,
    InvestmentHorizon,
} from '../types/investment'
import type {
    BackendStory,
    SystemStatusResponse,
    UserProfileResponse,
    AnalysisResponse,
} from './api'

export interface DataTransformer {
    transformStory(backendStory: BackendStory): Story
    transformSystemStatus(backendStatus: SystemStatusResponse): SystemHealth
    transformUserProfile(backendProfile: UserProfileResponse): UserProfile
    transformAnalysis(backendAnalysis: AnalysisResponse): AnalysisResult
}

export class ApiDataTransformer implements DataTransformer {
    transformStory(backendStory: BackendStory): Story {
        return {
            id: `story-${Date.now()}-${Math.random()}`,
            title: backendStory.main_topic,
            summary: `Analysis of ${backendStory.main_topic}`,
            maturity: backendStory.maturity === 'MATURE' ? 'Mature' : 'Developing',
            updateCount: backendStory.updates_count,
            sentiment: (backendStory.sentiment as Sentiment) || 'neutral',
            topic: backendStory.main_topic,
            lastUpdated: backendStory.last_updated || 'Recently',
            sentimentHistory: [],
            updates: [],
            relatedEntities: backendStory.entities || [],
        }
    }

    transformSystemStatus(backendStatus: SystemStatusResponse): SystemHealth {
        const mapStatus = (status: string) => {
            if (status === 'healthy') return 'healthy'
            if (status === 'warning') return 'warning'
            return 'error'
        }

        return {
            ingestion: {
                status: mapStatus(backendStatus.brains.ingestion),
                lastUpdate: 'Recently',
                articlesProcessed: 0,
            },
            analysis: {
                status: mapStatus(backendStatus.brains.analysis),
                lastUpdate: 'Recently',
                analysisCount: 0,
            },
            memory: {
                status: mapStatus(backendStatus.brains.memory),
                lastUpdate: 'Recently',
                storiesTracked: backendStatus.stories_tracked || 0,
            },
        }
    }

    transformUserProfile(backendProfile: UserProfileResponse): UserProfile {
        const mapRiskTolerance = (risk: string): RiskTolerance => {
            if (risk === 'Aggressive') return 'Aggressive'
            if (risk === 'Contrarian') return 'Contrarian'
            return 'Conservative'
        }

        const mapHorizon = (horizon: string): InvestmentHorizon => {
            if (horizon === 'Long') return 'Long'
            if (horizon === 'Short') return 'Short'
            return 'Medium'
        }

        return {
            riskTolerance: mapRiskTolerance(backendProfile.risk_tolerance),
            capitalAvailable: backendProfile.capital,
            investmentHorizon: mapHorizon(backendProfile.horizon),
        }
    }

    transformAnalysis(backendAnalysis: AnalysisResponse): AnalysisResult {
        // Extract sentiment label from Gemini response and map to our enum
        let sentiment: Sentiment = 'neutral';
        const geminiSentiment = backendAnalysis.analysis?.sentiment;

        if (typeof geminiSentiment === 'object' && geminiSentiment?.sentiment_label) {
            const label = geminiSentiment.sentiment_label?.toLowerCase() || 'neutral';
            if (label.includes('bullish') || label.includes('positive')) {
                sentiment = 'positive';
            } else if (label.includes('bearish') || label.includes('negative')) {
                sentiment = 'negative';
            } else {
                sentiment = 'neutral';
            }
        } else if (typeof geminiSentiment === 'string') {
            const label = geminiSentiment.toLowerCase();
            if (label.includes('positive') || label.includes('bullish')) {
                sentiment = 'positive';
            } else if (label.includes('negative') || label.includes('bearish')) {
                sentiment = 'negative';
            }
        }

        return {
            id: `analysis-${Date.now()}`,
            timestamp: new Date().toISOString(),
            inputText: backendAnalysis.analysis?.text || '',
            entities: backendAnalysis.entities || [],
            sentiment,
            sentimentScore: backendAnalysis.analysis?.sentiment_score || 0,
            storyContext: backendAnalysis.story_context?.topic || null,
            personalizedAdvice: backendAnalysis.advice || '',
        }
    }
}
