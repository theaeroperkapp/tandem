// Message types for chat
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Requirements extracted from conversation
export interface Requirements {
  teamSize?: number;
  budget?: {
    min: number;
    max: number;
  };
  city?: 'San Francisco' | 'New York';
  neighborhoods?: string[];
  amenities?: string[];
  amenityDetails?: Record<string, number | boolean>;
  desiredSqft?: number;
  leaseTermMonths?: number;
  moveInDate?: string;
  growthPlans?: string;
  workStyle?: string;
  businessType?: string;
  dealBreakers?: string[];
  companyName?: string;
  signingAuthority?: string;
  businessStructure?: string;
  companyAddress?: string;
}

export interface ExtractedRequirements {
  requirements_extracted: boolean;
  data: Requirements;
  confidenceLevel: 'high' | 'medium' | 'low';
}

// Office listing types
export interface Amenities {
  conference_rooms?: number;
  kitchen?: boolean;
  parking_spots?: number;
  '24_7_access'?: boolean;
  natural_light?: boolean;
  rooftop?: boolean;
  gym?: boolean;
  bike_storage?: boolean;
  shower?: boolean;
  mail_room?: boolean;
  reception?: boolean;
  furnished?: boolean;
  pet_friendly?: boolean;
}

export interface ListingImage {
  url: string;
  caption: string;
  order: number;
}

export interface OfficeListing {
  id: string;
  title: string;
  address: string;
  city: 'San Francisco' | 'New York';
  neighborhood: string;
  square_feet: number;
  price_per_month: number;
  price_per_sqft: number;
  max_capacity: number;
  available_date: string;
  min_lease_months: number;
  max_lease_months?: number;
  amenities: Amenities;
  images: ListingImage[];
  primary_image_url: string;
  description: string;
  highlights: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Match score breakdown
export interface MatchScoreBreakdown {
  priceScore: number;
  sizeScore: number;
  locationScore: number;
  amenityScore: number;
  availabilityScore: number;
}

export interface MatchedListing extends OfficeListing {
  matchScore: number;
  breakdown: MatchScoreBreakdown;
  reasoning: string;
}

// Conversation state
export interface Conversation {
  id: string;
  session_id: string;
  user_id?: string;
  messages: Message[];
  extracted_requirements?: Requirements;
  matched_listings?: string[];
  created_at: string;
  updated_at: string;
}

// API request/response types
export interface ChatRequest {
  message: string;
  sessionId: string;
}

export interface ChatResponse {
  message: string;
  requirements?: ExtractedRequirements;
  triggerMatch?: boolean;
}

export interface MatchRequest {
  requirements: Requirements;
  sessionId: string;
}

export interface MatchResponse {
  matches: MatchedListing[];
}

export interface LeaseRequest {
  listingId: string;
  requirements: Requirements;
  sessionId: string;
}

export interface LeaseResponse {
  leaseDocument: string;
}
