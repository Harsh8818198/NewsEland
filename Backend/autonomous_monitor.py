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
from cognitive_layer import CognitiveLayer  # NEW: Human-like reasoning
from deduplication_engine import DeduplicationEngine  # NEW: Prevent re-processing

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
    
    print("🧠 COGNITIVE LAYER (Human Reasoning)... ", end="", flush=True)
    cognitive = CognitiveLayer()  # NEW: "So What?" Engine
    print("ONLINE.")
    
    print("🧠 HIPPOCAMPUS (Memory)... ", end="", flush=True)
    memory = ContextMemory()
    print(f"ONLINE (Tracking {len(memory.knowledge_graph.get('stories', {}))} stories).")
    
    print("🛡️  DEDUPLICATION ENGINE... ", end="", flush=True)
    dedup = DeduplicationEngine()  # NEW: Prevent re-processing
    print(f"ONLINE ({dedup.get_stats()['total_urls']} URLs cached).")
    
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
                
                # 1.1 DEDUPLICATION CHECK (NEW)
                dup_check = dedup.is_duplicate(article)
                if dup_check['is_duplicate']:
                    print(f"   ⏭️  SKIPPED - Duplicate ({dup_check['reason']})")
                    continue  # Skip this article

                
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
                
                # 2.5 COGNITIVE REASONING (NEW: Human-like thinking)
                print("   🧠 COGNITIVE REASONING (So What?)...")
                cognitive_reasoning = cognitive.reason_about_news(article, raw_entities, analysis_result)
                
                # Store cognitive insights in analysis
                analysis_result['cognitive'] = cognitive_reasoning
                
                # 3. MEMORY (Brain 1)
                print("   🧠 UPDATING MEMORY...")
                # Fetch related entities for graph connections
                entities = analysis_result.get('entities', [])
                
                story = memory.update_story(article, analysis_result, entities)
                
                # 3.5 UPDATE THESIS (NEW: Living belief system)
                if story and len(story.get('events', [])) > 0:
                    latest_event = story['events'][-1]
                    updated_thesis = cognitive.update_thesis(story, latest_event, cognitive_reasoning)
                    story['thesis'] = updated_thesis
                    memory._save_graph()  # Save thesis update
                
                # 3.6 DETECT OPPORTUNITY (NEW: Asymmetric plays)
                opportunity = cognitive.detect_opportunity_type(cognitive_reasoning, story)
                story['opportunity'] = opportunity
                memory._save_graph()
                
                if check_user_relevance(user, analysis_result):
                    # 4. REPORT & ADVISE (Brain 2)
                    print(f"   📖 STORY UPDATE: {story.get('main_topic', 'Unknown')}")
                    print(f"   ⏳ Maturity: {story.get('maturity', 'DEVELOPING')} (Events: {story.get('updates_count', 0)})")
                    
                    # Display cognitive insights
                    print(f"   🎯 Conviction: {cognitive_reasoning.get('conviction', 0)}/10")
                    if opportunity.get('is_opportunity'):
                        print(f"   💎 OPPORTUNITY: {opportunity['opportunity_type']} ({opportunity.get('expected_return', 'Unknown')})")
                    
                    thesis = story.get('thesis', {})
                    if thesis.get('core_belief'):
                        print(f"   📝 Thesis: {thesis['core_belief'][:80]}... ({thesis.get('thesis_status', 'FORMING')})")
                    
                    # Display real-world opportunities (NEW)
                    real_world_opps = cognitive_reasoning.get('real_world_opportunities', [])
                    if real_world_opps:
                        print(f"\n   🌍 REAL-WORLD OPPORTUNITIES ({len(real_world_opps)}):")
                        for opp in real_world_opps[:3]:  # Show top 3
                            print(f"      {opp['type']}: {opp['item']}")
                            print(f"         Action: {opp['action']}")
                            print(f"         Timing: {opp['timing']} | Investment: {opp['investment']} → Save: {opp.get('expected_savings', 'TBD')}")
                            print(f"         Why: {opp['reasoning'][:100]}...")


                    
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
            
                # Mark article as processed (NEW: Prevent re-processing)
                dedup.mark_processed(article)
            
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
