-- Analytics Tables for Tandem

-- Page visits tracking
CREATE TABLE IF NOT EXISTS page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  page_path TEXT NOT NULL,
  referrer TEXT,

  -- User agent info
  user_agent TEXT,
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  device_type TEXT, -- desktop, mobile, tablet

  -- Location (from IP)
  ip_address TEXT,
  country TEXT,
  city TEXT,
  region TEXT,

  -- Screen info
  screen_width INTEGER,
  screen_height INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,

  -- Timing
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  time_on_page INTEGER, -- seconds, updated on page leave

  -- Additional context
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

-- Chat interactions tracking
CREATE TABLE IF NOT EXISTS chat_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  message_count INTEGER DEFAULT 0,
  matches_shown INTEGER DEFAULT 0,
  lease_generated BOOLEAN DEFAULT false,
  requirements_extracted BOOLEAN DEFAULT false,
  city_searched TEXT,
  budget_min INTEGER,
  budget_max INTEGER,
  team_size INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_visits_time ON page_visits(visited_at DESC);
CREATE INDEX idx_visits_session ON page_visits(session_id);
CREATE INDEX idx_chat_session ON chat_analytics(session_id);
CREATE INDEX idx_chat_time ON chat_analytics(started_at DESC);

-- Enable RLS
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_analytics ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon (for tracking)
CREATE POLICY "Allow anonymous inserts on page_visits"
  ON page_visits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on chat_analytics"
  ON chat_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous updates on chat_analytics"
  ON chat_analytics FOR UPDATE
  USING (true);

-- Only service role can read (for admin page)
CREATE POLICY "Service role can read page_visits"
  ON page_visits FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can read chat_analytics"
  ON chat_analytics FOR SELECT
  USING (auth.role() = 'service_role');
