# Tandem AI Office Matchmaker - Technical Architecture

## System Overview
AI-powered office space matching platform for Tandem, replacing traditional brokers with intelligent conversation-driven discovery and automated lease generation.

**Markets:** San Francisco, New York City  
**Build Timeline:** 48-72 hours  
**Core Value:** Extract requirements through natural conversation → Match spaces → Generate contracts

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI Library:** shadcn/ui + Tailwind CSS
- **State Management:** React Context + useState
- **Image Handling:** Next/Image with Cloudinary/S3
- **Deployment:** Vercel

### Backend
- **Database:** Supabase (PostgreSQL)
- **AI:** Anthropic Claude Sonnet 4.5 API
- **File Storage:** Supabase Storage (listing images)
- **API Routes:** Next.js API routes

### Key Dependencies
```json
{
  "@anthropic-ai/sdk": "^0.27.0",
  "@supabase/supabase-js": "^2.39.0",
  "zod": "^3.22.4",
  "react-markdown": "^9.0.0"
}
```

---

## Database Schema

### `office_listings` Table
```sql
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

CREATE INDEX idx_city ON office_listings(city);
CREATE INDEX idx_available ON office_listings(is_available);
CREATE INDEX idx_price ON office_listings(price_per_month);
```

### `conversations` Table
```sql
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

CREATE INDEX idx_session ON conversations(session_id);
```

---

## Core Components

### 1. Chat Interface (`/app/page.tsx`)
```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Requirements {
  teamSize: number;
  budget: { min: number; max: number };
  city: 'San Francisco' | 'New York';
  neighborhoods?: string[];
  amenities: string[];
  desiredSqft?: number;
  leaseTermMonths?: number;
  moveInDate?: string;
  growthPlans?: string;
}
```

**Key Features:**
- Streaming responses from Claude
- Message history with conversation memory
- Automatic requirement extraction
- Trigger listing search when requirements are sufficient

### 2. AI Integration (`/app/api/chat/route.ts`)

**Endpoints:**
- `POST /api/chat` - Main conversation handler
- `POST /api/match` - Trigger listing search
- `POST /api/generate-lease` - Create lease document

**Claude Integration Pattern:**
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// System prompt loaded from CLAUDE_INSTRUCTIONS.md
const systemPrompt = await fs.readFile('./CLAUDE_INSTRUCTIONS.md', 'utf-8');

const response = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 4000,
  system: systemPrompt,
  messages: conversationHistory,
  temperature: 0.7,
});
```

**Conversation Memory Strategy:**
- Store full conversation in `conversations` table
- Pass last 10 messages + extracted requirements to Claude
- Use structured outputs for requirement extraction

### 3. Matching Algorithm (`/lib/matching.ts`)

**Scoring Logic:**
```typescript
interface MatchScore {
  listingId: string;
  totalScore: number;
  breakdown: {
    priceScore: number;      // 30% weight
    sizeScore: number;        // 25% weight
    locationScore: number;    // 20% weight
    amenityScore: number;     // 15% weight
    availabilityScore: number; // 10% weight
  };
  reasoning: string;
}

function calculateMatch(
  listing: OfficeListing,
  requirements: Requirements
): MatchScore {
  // Price Score (0-100)
  const priceScore = listing.price_per_month <= requirements.budget.max
    ? 100 - (Math.abs(listing.price_per_month - requirements.budget.max) / requirements.budget.max) * 50
    : 0;

  // Size Score (0-100)
  const idealSqft = requirements.teamSize * 150; // 150 sqft per person
  const sizeScore = 100 - Math.abs(listing.square_feet - idealSqft) / idealSqft * 50;

  // Location Score (0-100)
  const locationScore = requirements.neighborhoods?.includes(listing.neighborhood) ? 100 : 50;

  // Amenity Score (0-100)
  const requiredAmenities = requirements.amenities.length;
  const matchedAmenities = requirements.amenities.filter(a => 
    listing.amenities[a] === true
  ).length;
  const amenityScore = (matchedAmenities / requiredAmenities) * 100;

  // Availability Score (0-100)
  const availabilityScore = /* Calculate based on move-in date */;

  const totalScore = 
    priceScore * 0.30 +
    sizeScore * 0.25 +
    locationScore * 0.20 +
    amenityScore * 0.15 +
    availabilityScore * 0.10;

  return { totalScore, breakdown, reasoning: generateReasoning() };
}
```

**Return Top 3-5 Matches** with scores and reasoning.

### 4. Listing Display (`/app/components/ListingCard.tsx`)

**Features:**
- Image carousel (primary image + additional images)
- Key metrics card ($/month, sqft, $/sqft, capacity)
- Amenities grid with icons
- Location map preview (Google Maps embed)
- "Why this match" section with AI reasoning
- CTA: "Generate Lease" button

**Image Handling:**
```typescript
<div className="relative h-64 w-full">
  <Image
    src={listing.primary_image_url}
    alt={listing.title}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 50vw"
  />
</div>
```

### 5. Comparison View (`/app/compare`)

Side-by-side table comparing up to 3 listings:
- Monthly cost
- Total lease value (monthly × term)
- $/sqft
- Size & capacity
- Key amenities
- Commute analysis
- Expansion options
- Availability

### 6. Lease Generator (`/app/api/generate-lease/route.ts`)

**Input:**
- Listing details
- Extracted requirements
- User business info (collected during chat)

**Output:**
- Markdown-formatted lease document
- Key sections: Parties, Premises, Term, Rent, Deposits, Use, Maintenance, Insurance
- AI-generated clauses based on requirements (e.g., expansion rights, early termination)

**Prompt Pattern:**
```typescript
const leasePrompt = `Generate a commercial office lease agreement for:

Tenant: ${requirements.companyName}
Landlord: Tandem Properties
Property: ${listing.address}
Term: ${requirements.leaseTermMonths} months
Monthly Rent: $${listing.price_per_month}

Include standard commercial lease clauses plus:
${requirements.growthPlans ? '- Expansion rights clause' : ''}
${requirements.earlyTermination ? '- Early termination option' : ''}

Format as professional legal document.`;
```

---

## API Routes Structure
```
/app/api/
├── chat/
│   └── route.ts          # Main conversation handler
├── match/
│   └── route.ts          # Trigger listing search
├── generate-lease/
│   └── route.ts          # Lease document generation
├── listings/
│   ├── route.ts          # GET all listings (with filters)
│   └── [id]/route.ts     # GET single listing
└── conversation/
    └── route.ts          # Save/load conversation state
```

---

## Conversation Flow

1. **User lands on page** → Generate session ID → Initialize conversation
2. **User sends message** → POST to `/api/chat` with message + session ID
3. **Claude processes** → Extracts requirements → Stores in DB
4. **When sufficient info** → Automatically trigger `/api/match`
5. **Display matches** → Show top 3-5 with reasoning
6. **User selects listing** → Show detailed view
7. **User clicks "Generate Lease"** → POST to `/api/generate-lease`
8. **Display draft lease** → Markdown rendered, downloadable as PDF

---

## Mock Data Strategy (MVP)

### San Francisco Listings (8-10 properties)
**Neighborhoods:** SOMA, Financial District, Mission Bay, Dogpatch
**Price Range:** $4,000 - $25,000/month
**Size Range:** 800 - 5,000 sqft

### New York Listings (8-10 properties)
**Neighborhoods:** Flatiron, Chelsea, Financial District, Brooklyn (DUMBO)
**Price Range:** $5,000 - $30,000/month
**Size Range:** 1,000 - 6,000 sqft

**Image Sources:**
- Unsplash API (free high-quality office images)
- Pexels API
- Or curated set of 20-30 office images

---

## Environment Variables
```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Deployment Checklist

- [ ] Seed database with 15-20 mock listings (with images)
- [ ] Test conversation flow end-to-end
- [ ] Verify requirement extraction accuracy
- [ ] Test matching algorithm with various inputs
- [ ] Ensure lease generation works
- [ ] Mobile responsive check
- [ ] Deploy to Vercel
- [ ] Test production environment
- [ ] Create demo Loom video

---

## Phase 2 Enhancements (Post-Demo)
- User authentication
- Save favorite listings
- Email lease documents
- Calendar integration for property tours
- Commute time calculator (Google Maps API)
- 3D virtual tours
- Landlord dashboard