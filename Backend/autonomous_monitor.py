import time
import logging
from dotenv import load_dotenv

load_dotenv(override=True)

from data_ingestion import NewsScraper, EntityExtractor
from analysis_engine import AnalysisEngine
from gemini_subreport import SubReportGenerator
from user_profile import UserProfile
from decision_engine import DecisionEngine
from context_memory import ContextMemory

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s', datefmt='%H:%M:%S')

def check_user_relevance(user, analysis):
    """
    BRAIN 2 FILTER:
    Check if the news event is actually relevant to the User's Profile.
    Returns: Boolean
    """
    sentiment = analysis['analysis']['sentiment']
    patterns = analysis['analysis']['matched_patterns']
    
    is_impactful = len(patterns) > 0 or abs(sentiment.get('sentiment_score', 0)) > 0.4
    if not is_impactful:
        return False
    return True # Simplified for Context Demo (Let Memory decide maturity)

def autonomous_loop():
    print("\n================================================================")
    print("   AI FINANCIAL GUIDE - CONTEXT AWARE SENTINEL (ACTIVE)        ")
    print("   Memory: Enabled | Strategy: Advisory Mode                   ")
    print("================================================================\n")
    
    print("🧠 BRAIN 1 (Observer)... ", end="", flush=True)
    scraper = NewsScraper() 
    extractor = EntityExtractor()
    print("ONLINE.")
    
    print("🧠 BRAIN 3 (Prophet)... ", end="", flush=True)
    analyzer = AnalysisEngine()
    print("ONLINE.")
    
    print("🧠 BRAIN 2 (Synthesizer)... ", end="", flush=True)
    report_gen = SubReportGenerator(mock_mode=False) 
    decision_engine = DecisionEngine(mock_mode=False)
    print("ONLINE.")
    
    print("🧠 HIPPOCAMPUS (Memory)... ", end="", flush=True)
    memory = ContextMemory()
    print(f"ONLINE (Tracking {len(memory.knowledge_graph.get('stories', {}))} stories).")
    
    user = UserProfile("U1", "Conservative", 100000, "Long-term")
    print(f"\n👤 Guiding User: {user.risk_tolerance} | ${user.capital_available:,}\n")
    print("🔴 BUILDING NARRATIVES FROM NEWS STREAM...\n")

    seen_urls = set()

    while True:
        try:
            logging.info("Scanning for updates...")
            articles = scraper.fetch_articles()
            new_articles = [a for a in articles if a['url'] not in seen_urls]
            
            if not new_articles:
                print("No new articles found.")
            
            for article in new_articles:
                seen_urls.add(article['url'])
                print(f"\nScanning: {article['title']}...")
                
                entities = extractor.extract_entities(article['title'])

                analysis_result = analyzer.analyze_news(article, entities)
                
                story = memory.update_story(article, analysis_result, entities)
                
                if check_user_relevance(user, analysis_result):
                    
                    print(f"   📖 STORY UPDATE: {story['main_topic']}")
                    print(f"   ⏳ Maturity: {story['maturity']} (Events: {story['updates_count']})")
                    
                    sub_report = report_gen.generate_report(article, analysis_result, story_context=story)
                    advice = decision_engine.generate_advice(user, sub_report, story_context=story)
                    
                    print("\n" + "!"*60)
                    print(f" >> FINANCIAL GUIDE ALERT <<")
                    print("-" * 60)
                    print(advice)
                    print("!" * 60 + "\n")
                    
                else:
                    print("   ❌ IGNORE: Noise.")
            
            print("\n💤 Sleeping for 30s (Demo Mode)...")
            time.sleep(30) 
            
        except KeyboardInterrupt:
            print("\n🛑 Guide Mode Deactivated.")
            break
        except Exception as e:
            logging.error(f"Loop Error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    autonomous_loop()
