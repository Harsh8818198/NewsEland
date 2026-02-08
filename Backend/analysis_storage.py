import json
import os
from datetime import datetime, date
from typing import Dict, List, Optional
import logging

class DateTimeEncoder(json.JSONEncoder):
    """Custom JSON encoder for datetime and other non-serializable objects"""
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        try:
            return super().default(obj)
        except TypeError:
            return str(obj)

class AnalysisStorage:
    """
    Persistent storage for story analyses
    Stores comprehensive analysis results for future reference
    """
    
    def __init__(self, storage_file: str = "analysis_storage.json"):
        self.storage_file = storage_file
        self._ensure_storage_exists()
    
    def _ensure_storage_exists(self):
        """Create storage file if it doesn't exist"""
        if not os.path.exists(self.storage_file):
            with open(self.storage_file, 'w') as f:
                json.dump({}, f)
            logging.info(f"Created analysis storage file: {self.storage_file}")
    
    def save_analysis(self, story_id: str, story_title: str, analysis: Dict, user_notes: str = "") -> bool:
        """
        Save analysis result for a story
        
        Args:
            story_id: Unique story identifier
            story_title: Title of the story
            analysis: Complete analysis object containing all analysis results
            user_notes: Optional user notes about the analysis
        
        Returns:
            bool: True if saved successfully
        """
        try:
            # Load existing data
            with open(self.storage_file, 'r') as f:
                data = json.load(f)
            
            # Create analysis entry
            data[story_id] = {
                "timestamp": datetime.now().isoformat(),
                "story_title": story_title,
                "analysis": analysis,
                "user_notes": user_notes
            }
            
            # Save back to file
            with open(self.storage_file, 'w') as f:
                json.dump(data, f, indent=2, cls=DateTimeEncoder)
            
            logging.info(f"Saved analysis for story: {story_id}")
            return True
        
        except Exception as e:
            logging.error(f"Failed to save analysis: {e}")
            return False
    
    def get_analysis(self, story_id: str) -> Optional[Dict]:
        """
        Get stored analysis for a specific story
        
        Args:
            story_id: Story identifier
        
        Returns:
            Dict or None: Analysis data if exists
        """
        try:
            with open(self.storage_file, 'r') as f:
                data = json.load(f)
            
            return data.get(story_id)
        
        except Exception as e:
            logging.error(f"Failed to get analysis: {e}")
            return None
    
    def list_analyses(self, limit: int = 50) -> List[Dict]:
        """
        List all stored analyses
        
        Args:
            limit: Maximum number of analyses to return
        
        Returns:
            List of analysis summaries
        """
        try:
            with open(self.storage_file, 'r') as f:
                data = json.load(f)
            
            # Convert to list and sort by timestamp (newest first)
            analyses = []
            for story_id, analysis_data in data.items():
                analyses.append({
                    "story_id": story_id,
                    "story_title": analysis_data.get("story_title", "Unknown"),
                    "timestamp": analysis_data.get("timestamp"),
                    "has_notes": bool(analysis_data.get("user_notes"))
                })
            
            # Sort by timestamp descending
            analyses.sort(key=lambda x: x["timestamp"], reverse=True)
            
            return analyses[:limit]
        
        except Exception as e:
            logging.error(f"Failed to list analyses: {e}")
            return []
    
    def update_notes(self, story_id: str, user_notes: str) -> bool:
        """
        Update user notes for an existing analysis
        
        Args:
            story_id: Story identifier
            user_notes: New notes text
        
        Returns:
            bool: True if updated successfully
        """
        try:
            with open(self.storage_file, 'r') as f:
                data = json.load(f)
            
            if story_id not in data:
                logging.warning(f"Analysis not found for story: {story_id}")
                return False
            
            data[story_id]["user_notes"] = user_notes
            data[story_id]["notes_updated_at"] = datetime.now().isoformat()
            
            with open(self.storage_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            logging.info(f"Updated notes for story: {story_id}")
            return True
        
        except Exception as e:
            logging.error(f"Failed to update notes: {e}")
            return False
    
    def delete_analysis(self, story_id: str) -> bool:
        """
        Delete a stored analysis
        
        Args:
            story_id: Story identifier
        
        Returns:
            bool: True if deleted successfully
        """
        try:
            with open(self.storage_file, 'r') as f:
                data = json.load(f)
            
            if story_id in data:
                del data[story_id]
                
                with open(self.storage_file, 'w') as f:
                    json.dump(data, f, indent=2)
                
                logging.info(f"Deleted analysis for story: {story_id}")
                return True
            
            return False
        
        except Exception as e:
            logging.error(f"Failed to delete analysis: {e}")
            return False
