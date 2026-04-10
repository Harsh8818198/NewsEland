-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'institutional')),
  preferences JSONB DEFAULT '{}'::jsonb,
  onboarding_completed BOOLEAN DEFAULT false
);

-- Portfolios
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_default BOOLEAN DEFAULT false
);

-- Holdings
CREATE TABLE IF NOT EXISTS holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  company_name TEXT,
  quantity DECIMAL,
  purchase_price DECIMAL,
  purchase_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(portfolio_id, symbol)
);

-- News Articles
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  url TEXT UNIQUE,
  source TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  entities JSONB DEFAULT '[]'::jsonb,
  sentiment_score DECIMAL,
  processed BOOLEAN DEFAULT false,
  image_url TEXT
);

-- Entities (companies, people, events)
CREATE TABLE IF NOT EXISTS entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('company', 'person', 'event', 'concept')),
  symbol TEXT,
  metadata JSONB DEFAULT '{}' : : jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, type)
);

-- Entity Relationships (simplified knowledge graph)
CREATE TABLE IF NOT EXISTS entity_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  target_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  relationship_type TEXT,
  strength DECIMAL DEFAULT 1.0,
  context JSONB DEFAULT '{}' : : jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Signals (ENTRY/EXIT recommendations)
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  signal_type TEXT CHECK (signal_type IN ('ENTRY', 'EXIT', 'HOLD')),
  confidence DECIMAL CHECK (confidence >= 0 AND confidence <= 1),
  reasoning TEXT,
  reasoning_layers JSONB DEFAULT '{}' : : jsonb,
  news_article_id UUID REFERENCES news_articles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE
);

-- Analysis History (track AI reasoning over time)
CREATE TABLE IF NOT EXISTS analysis_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_article_id UUID REFERENCES news_articles(id),
  user_id UUID REFERENCES user_profiles(id),
  analysis_type TEXT,
  input_data JSONB,
  output_data JSONB,
  model_used TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_processed ON news_articles(processed) WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_signals_user ON signals(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_symbol ON signals(symbol, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_holdings_portfolio ON holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_symbol ON entities(symbol) WHERE symbol IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own portfolios" ON portfolios;
DROP POLICY IF EXISTS "Users can manage own portfolios" ON portfolios;
DROP POLICY IF EXISTS "Users can view own holdings" ON holdings;
DROP POLICY IF EXISTS "Users can manage own holdings" ON holdings;
DROP POLICY IF EXISTS "Users can view own signals" ON signals;
DROP POLICY IF EXISTS "Users can update own signals" ON signals;
DROP POLICY IF EXISTS "Anyone can read news" ON news_articles;
DROP POLICY IF EXISTS "Anyone can read entities" ON entities;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for portfolios
CREATE POLICY "Users can view own portfolios" ON portfolios
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own portfolios" ON portfolios
  FOR ALL USING (user_id = auth.uid());

-- Policies for holdings
CREATE POLICY "Users can view own holdings" ON holdings
  FOR SELECT USING (portfolio_id IN (
    SELECT id FROM portfolios WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own holdings" ON holdings
  FOR ALL USING (portfolio_id IN (
    SELECT id FROM portfolios WHERE user_id = auth.uid()
  ));

-- Policies for signals
CREATE POLICY "Users can view own signals" ON signals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own signals" ON signals
  FOR UPDATE USING (user_id = auth.uid());

-- Public read access for news and entities
CREATE POLICY "Anyone can read news" ON news_articles
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read entities" ON entities
  FOR SELECT USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_holdings_updated_at ON holdings;
CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON holdings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_entities_updated_at ON entities;
CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
