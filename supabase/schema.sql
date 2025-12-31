-- Tandem Office Matchmaker Database Schema

-- Office Listings Table
CREATE TABLE office_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL CHECK (city IN ('San Francisco', 'New York')),
  neighborhood TEXT NOT NULL,

  -- Space Details
  square_feet INTEGER NOT NULL,
  price_per_month INTEGER NOT NULL,
  price_per_sqft DECIMAL(10,2) GENERATED ALWAYS AS (price_per_month::decimal / square_feet) STORED,
  max_capacity INTEGER NOT NULL,

  -- Lease Terms
  available_date DATE NOT NULL,
  min_lease_months INTEGER NOT NULL,
  max_lease_months INTEGER,

  -- Amenities (JSONB for flexibility)
  amenities JSONB NOT NULL DEFAULT '{}',
  -- Example: {"conference_rooms": 2, "kitchen": true, "parking_spots": 5, "24_7_access": true}

  -- Images
  images JSONB NOT NULL DEFAULT '[]',
  -- Example: [{"url": "...", "caption": "Main workspace", "order": 1}]
  primary_image_url TEXT,

  -- Description
  description TEXT,
  highlights TEXT[], -- ["Natural light", "Walking distance to BART"]

  -- Metadata
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for office_listings
CREATE INDEX idx_listings_city ON office_listings(city);
CREATE INDEX idx_listings_available ON office_listings(is_available);
CREATE INDEX idx_listings_price ON office_listings(price_per_month);
CREATE INDEX idx_listings_neighborhood ON office_listings(neighborhood);
CREATE INDEX idx_listings_capacity ON office_listings(max_capacity);

-- Conversations Table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id TEXT, -- Optional if you add auth later
  messages JSONB NOT NULL DEFAULT '[]',
  extracted_requirements JSONB, -- Structured requirements from AI
  matched_listings UUID[], -- Array of listing IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for conversations
CREATE INDEX idx_conversations_session ON conversations(session_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_office_listings_updated_at
  BEFORE UPDATE ON office_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional, for when you add auth)
ALTER TABLE office_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Public read access for listings
CREATE POLICY "Public read access for listings"
  ON office_listings FOR SELECT
  USING (true);

-- Anyone can read/write conversations (for MVP)
CREATE POLICY "Anyone can view conversations"
  ON conversations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update conversations"
  ON conversations FOR UPDATE
  USING (true);
