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
        
        // Helper function to convert sentiment label to Sentiment type
        const mapSentimentLabel = (label: string): Sentiment => {
            const lowerLabel = label?.toLowerCase() || 'neutral';
            if (lowerLabel.includes('bullish') || lowerLabel.includes('positive')) {
                return 'positive';
            } else if (lowerLabel.includes('bearish') || lowerLabel.includes('negative')) {
                return 'negative';
            }
            return 'neutral';
        };
        
        // Build sentiment history from events
        const sentimentHistory = events.map((event: any) => {
            const sentimentLabel = event.sentiment?.sentiment_label || 'Neutral';
            const sentiment = mapSentimentLabel(sentimentLabel);
            
            return {
                date: new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: event.sentiment?.sentiment_score || 0,
                sentiment,
            };
        }).slice(-10); // Last 10 data points for the chart
        
        // Build updates list from events
        const updates = events.map((event: any, index: number) => {
            const sentimentLabel = event.sentiment?.sentiment_label || 'Neutral';
            const sentiment = mapSentimentLabel(sentimentLabel);
            
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
                sentimentScore: event.sentiment?.sentiment_score,
                keyEventType: event.sentiment?.key_event_type,
                pattern: event.pattern,
            };
        }).reverse(); // Most recent first
        
        // Deduplicate updates by headline (case-insensitive)
        const seenHeadlines = new Set<string>();
        const uniqueUpdates = updates.filter((update: any) => {
            const normalizedHeadline = update.headline.trim().toLowerCase();
            if (seenHeadlines.has(normalizedHeadline)) {
                return false;
            }
            seenHeadlines.add(normalizedHeadline);
            return true;
        });
        
        // Get current hypothesis or use latest event sentiment
        const currentHypothesis = backendStory.current_hypothesis || 
            (events.length > 0 ? events[events.length - 1]?.sentiment : null);
        
        // Determine overall sentiment from current hypothesis
        const sentimentLabel = currentHypothesis?.sentiment_label || 'Neutral';
        const overallSentiment = mapSentimentLabel(sentimentLabel);
        const sentimentScore = currentHypothesis?.sentiment_score || 0;
        
        // Calculate time since last update
        const lastEventDate = events.length > 0 ? new Date(events[events.length - 1].date) : new Date(backendStory.created_at);
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
        
        // Build summary from current hypothesis if available
        let summary = backendStory.main_topic;
        if (currentHypothesis?.what) {
            summary = currentHypothesis.what;
        } else if (events.length > 0) {
            summary = events[events.length - 1].title;
        }
        
        // Transform events to StoryEvent format
        const transformedEvents: any[] = events.map((event: any) => ({
            date: event.date,
            title: event.title,
            sentiment: {
                sentiment_score: event.sentiment?.sentiment_score || 0,
                sentiment_label: event.sentiment?.sentiment_label || 'Neutral',
                key_event_type: event.sentiment?.key_event_type || 'None',
                why: event.sentiment?.why || '',
                what: event.sentiment?.what || '',
                how: event.sentiment?.how || '',
                expected_impact: event.sentiment?.expected_impact || '',
            },
            pattern: event.pattern || 'None',
        }));
        
        // Transform hypotheses
        const transformHypothesis = (hyp: any): any => {
            if (!hyp) return null;
            return {
                sentiment_score: hyp.sentiment_score || 0,
                sentiment_label: hyp.sentiment_label || 'Neutral',
                key_event_type: hyp.key_event_type || 'None',
                why: hyp.why || '',
                what: hyp.what || '',
                how: hyp.how || '',
                expected_impact: hyp.expected_impact || '',
            };
        };
        
        return {
            id: backendStory.id || `story-${Date.now()}-${Math.random()}`,
            title: backendStory.main_topic,
            summary,
            maturity: backendStory.maturity === 'MATURE' ? 'Mature' : 'Developing',
            status: backendStory.status || 'ACTIVE',
            updateCount: backendStory.updates_count || uniqueUpdates.length,
            sentiment: overallSentiment,
            sentimentScore,
            sentimentLabel: sentimentLabel as any,
            topic: backendStory.main_topic.split(' involving ')[0] || backendStory.main_topic,
            lastUpdated,
            sentimentHistory,
            updates: uniqueUpdates,
            relatedEntities: backendStory.entities || [],
            subreport: backendStory.subreport || undefined,
            currentHypothesis: transformHypothesis(backendStory.current_hypothesis),
            previousHypothesis: transformHypothesis(backendStory.previous_hypothesis),
            events: transformedEvents,
            createdAt: backendStory.created_at,
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
