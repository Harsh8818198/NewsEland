import time
import logging
from dotenv import load_dotenv

load_dotenv(override=True)

from data_ingestion import NewsScraper, EntityExtractor, ArticleContentFetcher
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
    content_fetcher = ArticleContentFetcher()  # NEW: Full-text scraper
    print("ONLINE.")
    
    print("🧠 BRAIN 3 (Prophet)... ", end="", flush=True)
    analyzer = AnalysisEngine()
    print("ONLINE.")
    
    print("🧠 BRAIN 2 (Synthesizer)... ", end="", flush=True)
    reporter = SubReportGenerator(mock_mode=False) 
    decision_engine = DecisionEngine(mock_mode=False)
    print("ONLINE.")
    
    print("🧠 HIPPOCAMPUS (Memory)... ", end="", flush=True)
    memory = ContextMemory()
    print(f"ONLINE (Tracking {len(memory.knowledge_graph.get('stories', {}))} stories).")
    
    user = UserProfile("U1", "Conservative", 100000, "Long-term")
    print(f"\n👤 Guiding User: {user.risk_tolerance} | ${user.capital_available:,}\n")
    print("🔴 BUILDING NARRATIVES FROM NEWS STREAM...\n")

    print("   ✅ Monitor Active. Press Ctrl+C to stop.")
    
    while True:
        try:
            print(f"\n[{time.strftime('%H:%M:%S')}] 📡 Scanning for financial news...")
            
            # 1. SCALP
            articles = scraper.fetch_articles()
            
            if not articles:
                print("   💤 No new impactful news found. Sleeping...")
            
            for article in articles:
                print(f"   🔎 Found: {article['title']}")
                
                # 1.5 FETCH FULL CONTENT (NEW)
                print(f"   📄 Fetching full article content...")
                full_content = content_fetcher.fetch_content(article['url'])
                
                if not full_content:
                    print(f"   ⚠️  Could not fetch content, using title only.")
                    full_content = article['title']
                else:
                    print(f"   ✅ Extracted {len(full_content)} characters.")
                
                # Store content in article dict for later use
                article['content'] = full_content
                
                # 1.6 EXTRACT ENTITIES (Now from full content)
                raw_entities = extractor.extract_entities(full_content)

                # 2. ANALYZE (Brain 3)
                print("   ⚖️  ANALYZING (Why/What/How)...")
                analysis_result = analyzer.analyze_news(article, raw_entities)
                
                # 3. MEMORY (Brain 1)
                print("   🧠 UPDATING MEMORY...")
                # Fetch related entities for graph connections
                entities = analysis_result.get('entities', [])
                
                story = memory.update_story(article, analysis_result, entities)
                
                if check_user_relevance(user, analysis_result):
                    # 4. REPORT & ADVISE (Brain 2)
                    print(f"   📖 STORY UPDATE: {story.get('main_topic', 'Unknown')}")
                    print(f"   ⏳ Maturity: {story.get('maturity', 'DEVELOPING')} (Events: {story.get('updates_count', 0)})")
                    
                    # ALERT SYSTEM
                    try:
                        import winsound
                        winsound.Beep(1000, 500) # Frequency 1000Hz, Duration 500ms
                    except:
                        pass

                    report = reporter.generate_sub_report(story, analysis_result)
                    advice = decision_engine.generate_advice(user, report, story)
                    
                    print("\n" + "!"*60)
                    print(f" >> FINANCIAL GUIDE ALERT <<")
                    print("-" * 60)
                    print(advice)
                    print("!" * 60 + "\n")
            
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
