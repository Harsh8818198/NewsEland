# ============================================================================
# ENHANCED PORTFOLIO ENDPOINTS - WAR ROOM
# ============================================================================

@app.get("/api/portfolio/enhanced")
def get_enhanced_portfolio():
    """Get portfolio with full story context and AI signals"""
    portfolio_summary = portfolio.get_portfolio_summary()
    positions = portfolio_summary.get('positions', [])
    
    # Enhance each position with story context and AI signals
    enhanced_positions = []
    for pos in positions:
        story_id = pos.get('story_id')
        enhanced_pos = pos.copy()
        
        if story_id:
            # Get story from memory
            story = memory.knowledge_graph.get('stories', {}).get(story_id)
            if story:
                # Add story context
                enhanced_pos['story_title'] = story.get('main_topic', 'Unknown Story')
                enhanced_pos['story_maturity'] = story.get('maturity', 'DEVELOPING')
                
                # Add current sentiment
                current_hyp = story.get('current_hypothesis', {})
                enhanced_pos['current_sentiment'] = {
                    'score': current_hyp.get('sentiment_score', 0),
                    'label': current_hyp.get('sentiment_label', 'Neutral'),
                    'trend': _calculate_sentiment_trend(story)
                }
                
                # Calculate AI signal
                enhanced_pos['ai_signal'] = _calculate_ai_signal(story, pos)
                enhanced_pos['risk_level'] = _calculate_risk_level(story, pos)
                enhanced_pos['last_story_update'] = story.get('last_update', '')
        else:
            # No story linked
            enhanced_pos['story_title'] = 'No Story Linked'
            enhanced_pos['story_maturity'] = 'UNKNOWN'
            enhanced_pos['current_sentiment'] = {'score': 0, 'label': 'Neutral', 'trend': 'STABLE'}
            enhanced_pos['ai_signal'] = 'WATCH'
            enhanced_pos['risk_level'] = 'MEDIUM'
        
        enhanced_positions.append(enhanced_pos)
    
    return {
        **portfolio_summary,
        'positions': enhanced_positions
    }

@app.get("/api/portfolio/signals")
def get_portfolio_signals():
    """Get AI signals for all positions"""
    portfolio_summary = portfolio.get_portfolio_summary()
    positions = portfolio_summary.get('positions', [])
    
    signals = []
    for pos in positions:
        story_id = pos.get('story_id')
        if story_id:
            story = memory.knowledge_graph.get('stories', {}).get(story_id)
            if story:
                signal = _calculate_ai_signal(story, pos)
                signals.append({
                    'ticker': pos.get('ticker'),
                    'signal': signal,
                    'confidence': _calculate_signal_confidence(story),
                    'reasoning': _get_signal_reasoning(story, signal)
                })
    
    return {'signals': signals}

@app.get("/api/portfolio/alerts")
def get_portfolio_alerts():
    """Get active alerts for portfolio positions"""
    portfolio_summary = portfolio.get_portfolio_summary()
    positions = portfolio_summary.get('positions', [])
    
    alerts = []
    alert_id = 0
    
    for pos in positions:
        story_id = pos.get('story_id')
        if not story_id:
            continue
            
        story = memory.knowledge_graph.get('stories', {}).get(story_id)
        if not story:
            continue
        
        ticker = pos.get('ticker', 'Unknown')
        
        # Check for sentiment changes
        current_hyp = story.get('current_hypothesis', {})
        previous_hyp = story.get('previous_hypothesis', {})
        
        if current_hyp and previous_hyp:
            current_sentiment = current_hyp.get('sentiment_label', 'Neutral')
            previous_sentiment = previous_hyp.get('sentiment_label', 'Neutral')
            
            if current_sentiment != previous_sentiment:
                alerts.append({
                    'id': f'alert_{alert_id}',
                    'ticker': ticker,
                    'type': 'SENTIMENT_CHANGE',
                    'severity': 'WARNING' if current_sentiment == 'Bearish' else 'INFO',
                    'message': f'{ticker}: Sentiment changed from {previous_sentiment} to {current_sentiment}',
                    'story_id': story_id,
                    'timestamp': story.get('last_update', datetime.now().isoformat()),
                    'action_required': current_sentiment == 'Bearish'
                })
                alert_id += 1
        
        # Check for high risk
        risk_level = _calculate_risk_level(story, pos)
        if risk_level == 'HIGH':
            alerts.append({
                'id': f'alert_{alert_id}',
                'ticker': ticker,
                'type': 'RISK_INCREASE',
                'severity': 'CRITICAL',
                'message': f'{ticker}: Risk level elevated to HIGH',
                'story_id': story_id,
                'timestamp': datetime.now().isoformat(),
                'action_required': True
            })
            alert_id += 1
        
        # Check for exit signals
        ai_signal = _calculate_ai_signal(story, pos)
        if ai_signal == 'EXIT':
            alerts.append({
                'id': f'alert_{alert_id}',
                'ticker': ticker,
                'type': 'EXIT_SIGNAL',
                'severity': 'CRITICAL',
                'message': f'{ticker}: AI recommends EXIT',
                'story_id': story_id,
                'timestamp': datetime.now().isoformat(),
                'action_required': True
            })
            alert_id += 1
    
    return {'alerts': alerts, 'count': len(alerts)}

@app.get("/api/portfolio/opportunities")
def get_investment_opportunities():
    """Get actionable stories not yet invested in"""
    stories = memory.knowledge_graph.get('stories', {})
    portfolio_summary = portfolio.get_portfolio_summary()
    invested_story_ids = set()
    
    # Get story IDs we're already invested in
    for pos in portfolio_summary.get('positions', []):
        story_id = pos.get('story_id')
        if story_id:
            invested_story_ids.add(story_id)
    
    opportunities = []
    
    for story_id, story in stories.items():
        # Skip if already invested
        if story_id in invested_story_ids:
            continue
        
        # Only include ACTIONABLE stories
        if story.get('maturity') != 'ACTIONABLE':
            continue
        
        # Skip inactive stories
        if story.get('status') != 'ACTIVE':
            continue
        
        current_hyp = story.get('current_hypothesis', {})
        cognitive = story.get('cognitive', {})
        
        # Calculate confidence score
        conviction = cognitive.get('conviction', 0.5)
        sentiment_score = abs(current_hyp.get('sentiment_score', 0))
        confidence = (conviction + sentiment_score) / 2
        
        # Get suggested ticker from cognitive analysis
        winners = cognitive.get('winners', [])
        suggested_ticker = winners[0].get('ticker') if winners else 'TBD'
        
        opportunities.append({
            'story_id': story_id,
            'story_title': story.get('main_topic', 'Unknown'),
            'maturity': story.get('maturity'),
            'sentiment': {
                'score': current_hyp.get('sentiment_score', 0),
                'label': current_hyp.get('sentiment_label', 'Neutral')
            },
            'confidence': round(confidence * 100, 1),
            'suggested_ticker': suggested_ticker,
            'suggested_allocation_pct': 10.0,  # Default 10%
            'reasoning': current_hyp.get('expected_impact', 'No reasoning available')
        })
    
    # Sort by confidence (highest first)
    opportunities.sort(key=lambda x: x['confidence'], reverse=True)
    
    return {'opportunities': opportunities[:10], 'count': len(opportunities)}  # Top 10

# Helper functions for portfolio intelligence
def _calculate_sentiment_trend(story):
    """Calculate sentiment trend (IMPROVING/DECLINING/STABLE)"""
    current_hyp = story.get('current_hypothesis', {})
    previous_hyp = story.get('previous_hypothesis', {})
    
    if not previous_hyp:
        return 'STABLE'
    
    current_score = current_hyp.get('sentiment_score', 0)
    previous_score = previous_hyp.get('sentiment_score', 0)
    
    diff = current_score - previous_score
    
    if diff > 0.1:
        return 'IMPROVING'
    elif diff < -0.1:
        return 'DECLINING'
    else:
        return 'STABLE'

def _calculate_ai_signal(story, position):
    """Calculate AI signal: BUY, HOLD, EXIT, WATCH"""
    maturity = story.get('maturity', 'DEVELOPING')
    current_hyp = story.get('current_hypothesis', {})
    sentiment_label = current_hyp.get('sentiment_label', 'Neutral')
    sentiment_score = current_hyp.get('sentiment_score', 0)
    
    # Get P&L
    pnl_pct = position.get('pnl_pct', 0)
    
    # EXIT conditions
    if sentiment_label == 'Bearish' and maturity == 'ACTIONABLE':
        return 'EXIT'
    if pnl_pct < -15:  # Stop loss at -15%
        return 'EXIT'
    
    # BUY conditions (add to position)
    if sentiment_label == 'Bullish' and maturity == 'ACTIONABLE' and sentiment_score > 0.7:
        return 'BUY'
    
    # HOLD conditions
    if sentiment_label == 'Bullish' or (sentiment_label == 'Neutral' and pnl_pct > 0):
        return 'HOLD'
    
    # Default to WATCH
    return 'WATCH'

def _calculate_risk_level(story, position):
    """Calculate risk level: LOW, MEDIUM, HIGH"""
    current_hyp = story.get('current_hypothesis', {})
    sentiment_label = current_hyp.get('sentiment_label', 'Neutral')
    pnl_pct = position.get('pnl_pct', 0)
    
    # HIGH risk
    if sentiment_label == 'Bearish':
        return 'HIGH'
    if pnl_pct < -10:
        return 'HIGH'
    
    # LOW risk
    if sentiment_label == 'Bullish' and pnl_pct > 10:
        return 'LOW'
    
    # MEDIUM risk (default)
    return 'MEDIUM'

def _calculate_signal_confidence(story):
    """Calculate confidence in AI signal (0-100)"""
    cognitive = story.get('cognitive', {})
    conviction = cognitive.get('conviction', 0.5)
    maturity = story.get('maturity', 'DEVELOPING')
    
    # Higher confidence for ACTIONABLE stories
    maturity_bonus = 0.2 if maturity == 'ACTIONABLE' else 0
    
    confidence = (conviction + maturity_bonus) * 100
    return min(100, round(confidence, 1))

def _get_signal_reasoning(story, signal):
    """Get reasoning for AI signal"""
    current_hyp = story.get('current_hypothesis', {})
    sentiment_label = current_hyp.get('sentiment_label', 'Neutral')
    maturity = story.get('maturity', 'DEVELOPING')
    
    if signal == 'EXIT':
        return f"Bearish sentiment detected with {maturity} maturity. Consider exiting position."
    elif signal == 'BUY':
        return f"Strong bullish signal with {maturity} maturity. Consider adding to position."
    elif signal == 'HOLD':
        return f"{sentiment_label} sentiment with {maturity} maturity. Maintain current position."
    else:
        return f"Neutral signal. Monitor story developments."

