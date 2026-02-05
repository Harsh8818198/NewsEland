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
    transformStory(backendStory: any): Story {
        // Extract events/updates from the backend story
        const events = backendStory.events || [];
        
        // Build sentiment history from events
        const sentimentHistory = events.map((event: any, index: number) => {
            const sentimentLabel = event.sentiment?.sentiment_label?.toLowerCase() || 'neutral';
            let sentiment: Sentiment = 'neutral';
            
            if (sentimentLabel.includes('bullish') || sentimentLabel.includes('positive')) {
                sentiment = 'positive';
            } else if (sentimentLabel.includes('bearish') || sentimentLabel.includes('negative')) {
                sentiment = 'negative';
            }
            
            return {
                date: new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: event.sentiment?.sentiment_score || 0,
                sentiment,
            };
        }).slice(-5); // Last 5 data points for the chart
        
        // Build updates list from events
        const updates = events.map((event: any, index: number) => {
            const sentimentLabel = event.sentiment?.sentiment_label?.toLowerCase() || 'neutral';
            let sentiment: Sentiment = 'neutral';
            
            if (sentimentLabel.includes('bullish') || sentimentLabel.includes('positive')) {
                sentiment = 'positive';
            } else if (sentimentLabel.includes('bearish') || sentimentLabel.includes('negative')) {
                sentiment = 'negative';
            }
            
            const eventDate = new Date(event.date);
            const now = new Date();
            const diffMs = now.getTime() - eventDate.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            let timeAgo = 'Recently';
            if (diffMins < 60) {
                timeAgo = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
            } else if (diffHours < 24) {
                timeAgo = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            } else {
                timeAgo = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
            }
            
            return {
                id: `update-${index}`,
                timestamp: timeAgo,
                headline: event.title,
                sentiment,
            };
        }).reverse(); // Most recent first
        
        // Determine overall sentiment from latest event
        const latestEvent = events[events.length - 1];
        const latestSentimentLabel = latestEvent?.sentiment?.sentiment_label?.toLowerCase() || 'neutral';
        let overallSentiment: Sentiment = 'neutral';
        
        if (latestSentimentLabel.includes('bullish') || latestSentimentLabel.includes('positive')) {
            overallSentiment = 'positive';
        } else if (latestSentimentLabel.includes('bearish') || latestSentimentLabel.includes('negative')) {
            overallSentiment = 'negative';
        }
        
        // Calculate time since last update
        const lastEventDate = latestEvent ? new Date(latestEvent.date) : new Date(backendStory.created_at);
        const now = new Date();
        const diffMs = now.getTime() - lastEventDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        let lastUpdated = 'Recently';
        if (diffMins < 60) {
            lastUpdated = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            lastUpdated = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else {
            lastUpdated = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        }
        
        // Build comprehensive summary from events
        const eventTypes = events.map((e: any) => e.sentiment?.key_event_type).filter((t: any) => t && t !== 'None');
        const uniqueEventTypes = [...new Set(eventTypes)];
        const summary = `Tracking ${backendStory.main_topic} with ${backendStory.updates_count} updates. ` +
            (uniqueEventTypes.length > 0 
                ? `Key events include: ${uniqueEventTypes.slice(0, 3).join(', ')}.` 
                : 'Monitoring for significant developments.');
        
        return {
            id: backendStory.id || `story-${Date.now()}-${Math.random()}`,
            title: backendStory.main_topic,
            summary,
            maturity: backendStory.maturity === 'MATURE' ? 'Mature' : 'Developing',
            updateCount: backendStory.updates_count,
            sentiment: overallSentiment,
            topic: backendStory.main_topic.split(' involving ')[0] || backendStory.main_topic,
            lastUpdated,
            sentimentHistory,
            updates,
            relatedEntities: backendStory.entities || [],
            subreport: backendStory.subreport || undefined,
        };
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
