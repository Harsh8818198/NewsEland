"""
Validation and Learning Systems

Consolidates:
- Pattern Validator (consistency checking)
- Sentiment Trend Analyzer (trend detection)
- Backtesting Engine (prediction tracking)
- Feedback System (user learning loop)
"""

import json
import logging
from typing import Dict, List
from datetime import datetime
from collections import Counter
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)


# ============================================================================
# PATTERN VALIDATOR
# ============================================================================

class PatternValidator:
    """Validates pattern consistency"""
    
    def validate_pattern_consistency(self, story: Dict) -> Dict:
        events = story.get('events', [])
        
        if len(events) < 2:
            return {"is_consistent": True, "dominant_pattern": events[0].get('pattern', 'Unknown') if events else 'Unknown', "consistency_score": 1.0, "warning": None}
        
        patterns = [event.get('pattern', 'Unknown') for event in events]
        pattern_counts = Counter(patterns)
        dominant_pattern, dominant_count = pattern_counts.most_common(1)[0]
        consistency_score = dominant_count / len(patterns)
        is_consistent = consistency_score >= 0.7
        
        warning = None
        if not is_consistent and len(pattern_counts) > 1:
            secondary_pattern = pattern_counts.most_common(2)[1][0]
            warning = f"PATTERN DRIFT: '{dominant_pattern}' → '{secondary_pattern}'"
        
        return {
            "is_consistent": is_consistent,
            "dominant_pattern": dominant_pattern,
            "consistency_score": consistency_score,
            "warning": warning
        }


# ============================================================================
# SENTIMENT TREND ANALYZER
# ============================================================================

class SentimentTrendAnalyzer:
    """Analyzes sentiment evolution"""
    
    def analyze_trend(self, story: Dict) -> Dict:
        events = story.get('events', [])
        
        if len(events) < 3:
            return {"trend": "STABLE", "velocity": 0.0, "signal": "HOLD", "confidence": 0.0}
        
        sentiment_scores = [event.get('sentiment', {}).get('sentiment_score', 0.5) for event in events]
        x = np.arange(len(sentiment_scores))
        y = np.array(sentiment_scores)
        slope, intercept = np.polyfit(x, y, 1)
        velocity = slope
        
        if velocity > 0.05:
            trend = "STRENGTHENING"
            signal = "BUY" if velocity > 0.1 else "HOLD"
        elif velocity < -0.05:
            trend = "DETERIORATING"
            signal = "EXIT" if velocity < -0.1 else "HOLD"
        else:
            trend = "STABLE"
            signal = "HOLD"
        
        y_pred = slope * x + intercept
        ss_res = np.sum((y - y_pred) ** 2)
        ss_tot = np.sum((y - np.mean(y)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
        confidence = max(0, r_squared)
        
        return {
            "trend": trend,
            "velocity": velocity,
            "signal": signal,
            "confidence": confidence,
            "sentiment_history": sentiment_scores
        }


# ============================================================================
# BACKTESTING ENGINE
# ============================================================================

class BacktestEngine:
    """Tracks predictions vs actual outcomes"""
    
    def __init__(self, backtest_file: str = None):
        # Persist backtest results in dedicated data directory
        self.backtest_file = backtest_file or os.path.join(DATA_DIR, "backtest_results.json")
        self.predictions = {}
        self._load_results()
    
    def _load_results(self):
        if os.path.exists(self.backtest_file):
            try:
                with open(self.backtest_file, 'r') as f:
                    self.predictions = json.load(f)
            except:
                pass
    
    def _save_results(self):
        with open(self.backtest_file, 'w') as f:
            json.dump(self.predictions, f, indent=2)
    
    def record_prediction(self, story_id: str, recommendation: Dict, story: Dict):
        self.predictions[story_id] = {
            "prediction_date": datetime.now().isoformat(),
            "story_topic": story.get('main_topic', 'Unknown'),
            "predicted_return": recommendation.get('expected_return', 'Unknown'),
            "conviction": story.get('thesis', {}).get('conviction_score', 0),
            "pattern": story.get('events', [{}])[-1].get('pattern', 'Unknown') if story.get('events') else 'Unknown',
            "validated": False
        }
        self._save_results()
    
    def validate_outcome(self, story_id: str, actual_return: float, actual_timing_days: int):
        if story_id not in self.predictions:
            return
        
        prediction = self.predictions[story_id]
        predicted_return = self._parse_return_range(prediction['predicted_return'])
        return_error = abs(actual_return - predicted_return)
        return_accuracy = max(0, 1 - (return_error / abs(predicted_return))) if predicted_return != 0 else 0
        
        prediction['actual_outcome'] = {
            "actual_return": actual_return,
            "actual_timing_days": actual_timing_days,
            "return_accuracy": return_accuracy
        }
        prediction['validated'] = True
        self._save_results()
    
    def _parse_return_range(self, return_str: str) -> float:
        try:
            if '-' in return_str and '%' in return_str:
                parts = return_str.replace('%', '').split('-')
                return (float(parts[0]) + float(parts[1])) / 200
            elif '%' in return_str:
                return float(return_str.replace('%', '').replace('+', '')) / 100
            return 0.0
        except:
            return 0.0
    
    def generate_performance_report(self) -> Dict:
        validated = [p for p in self.predictions.values() if p['validated']]
        
        if not validated:
            return {"total_predictions": len(self.predictions), "validated_predictions": 0, "win_rate": 0}
        
        wins = sum(1 for p in validated if p['actual_outcome']['actual_return'] > 0)
        return {
            "total_predictions": len(self.predictions),
            "validated_predictions": len(validated),
            "win_rate": wins / len(validated),
            "avg_return": sum(p['actual_outcome']['actual_return'] for p in validated) / len(validated)
        }


# ============================================================================
# FEEDBACK SYSTEM
# ============================================================================

class FeedbackSystem:
    """Captures user feedback for learning"""
    
    def __init__(self, feedback_file: str = None):
        # Persist feedback in dedicated data directory
        self.feedback_file = feedback_file or os.path.join(DATA_DIR, "user_feedback.json")
        self.feedback_data = {}
        self.pattern_weights = {}
        self._load_feedback()
    
    def _load_feedback(self):
        if os.path.exists(self.feedback_file):
            try:
                with open(self.feedback_file, 'r') as f:
                    data = json.load(f)
                    self.feedback_data = data.get('feedback', {})
                    self.pattern_weights = data.get('pattern_weights', {})
            except:
                pass
    
    def _save_feedback(self):
        data = {
            'feedback': self.feedback_data,
            'pattern_weights': self.pattern_weights,
            'last_updated': datetime.now().isoformat()
        }
        with open(self.feedback_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def record_feedback(self, story_id: str, recommendation_id: str, outcome: Dict):
        feedback_id = f"{story_id}_{recommendation_id}"
        self.feedback_data[feedback_id] = {
            "story_id": story_id,
            "feedback_date": datetime.now().isoformat(),
            "followed": outcome.get('followed', False),
            "result": outcome.get('result', 'NEUTRAL'),
            "actual_return": outcome.get('actual_return', 0),
            "user_rating": outcome.get('user_rating', 3)
        }
        self._save_feedback()
    
    def get_feedback_summary(self) -> Dict:
        if not self.feedback_data:
            return {"total_feedback": 0, "success_rate": 0}
        
        total = len(self.feedback_data)
        successes = sum(1 for f in self.feedback_data.values() if f['result'] == 'SUCCESS')
        return {
            "total_feedback": total,
            "success_rate": successes / total if total > 0 else 0
        }
