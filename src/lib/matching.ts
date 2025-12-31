import { OfficeListing, Requirements, MatchedListing, MatchScoreBreakdown, Amenities } from '@/types';

const WEIGHTS = {
  price: 0.30,
  size: 0.25,
  location: 0.20,
  amenity: 0.15,
  availability: 0.10,
};

// Calculate ideal square footage based on team size
// Standard: 150 sqft per person
function calculateIdealSqft(teamSize: number): number {
  return teamSize * 150;
}

// Calculate price score (0-100)
function calculatePriceScore(
  listingPrice: number,
  budget: { min: number; max: number }
): number {
  if (listingPrice > budget.max) {
    // Over budget - penalize heavily but don't completely exclude
    const overBy = (listingPrice - budget.max) / budget.max;
    return Math.max(0, 50 - overBy * 100);
  }

  if (listingPrice < budget.min) {
    // Under budget - slight bonus for savings
    return 100;
  }

  // Within budget - higher score for better value
  const range = budget.max - budget.min;
  const position = (budget.max - listingPrice) / range;
  return 70 + position * 30;
}

// Calculate size score (0-100)
function calculateSizeScore(
  listingSqft: number,
  teamSize: number,
  growthPlans?: string
): number {
  const idealSqft = calculateIdealSqft(teamSize);

  // Account for growth if mentioned
  let targetSqft = idealSqft;
  if (growthPlans) {
    // Add 20% buffer for growth
    targetSqft = idealSqft * 1.2;
  }

  const difference = Math.abs(listingSqft - targetSqft);
  const percentDiff = difference / targetSqft;

  if (listingSqft < idealSqft * 0.8) {
    // Too small - heavy penalty
    return Math.max(0, 40 - percentDiff * 50);
  }

  if (listingSqft > idealSqft * 2) {
    // Way too big - moderate penalty (paying for unused space)
    return Math.max(30, 70 - percentDiff * 30);
  }

  // Good fit
  return Math.max(0, 100 - percentDiff * 50);
}

// Calculate location score (0-100)
function calculateLocationScore(
  listingNeighborhood: string,
  preferredNeighborhoods?: string[]
): number {
  if (!preferredNeighborhoods || preferredNeighborhoods.length === 0) {
    return 70; // Neutral if no preference
  }

  const normalizedListing = listingNeighborhood.toLowerCase();
  const isMatch = preferredNeighborhoods.some(
    n => normalizedListing.includes(n.toLowerCase()) ||
         n.toLowerCase().includes(normalizedListing)
  );

  return isMatch ? 100 : 50;
}

// Calculate amenity score (0-100)
function calculateAmenityScore(
  listingAmenities: Amenities,
  requiredAmenities?: string[]
): number {
  if (!requiredAmenities || requiredAmenities.length === 0) {
    return 80; // Good score if no specific requirements
  }

  let matched = 0;
  const amenitiesRecord = listingAmenities as Record<string, unknown>;
  for (const amenity of requiredAmenities) {
    const key = amenity.toLowerCase().replace(/\s+/g, '_');
    if (amenitiesRecord[key] !== undefined && amenitiesRecord[key] !== false) {
      matched++;
    }
  }

  return (matched / requiredAmenities.length) * 100;
}

// Calculate availability score (0-100)
function calculateAvailabilityScore(
  availableDate: string,
  desiredMoveIn?: string
): number {
  if (!desiredMoveIn) {
    return 80; // Neutral if no specific date
  }

  const available = new Date(availableDate);
  const desired = new Date(desiredMoveIn);
  const today = new Date();

  // If already available
  if (available <= today) {
    if (desired <= today) {
      return 100; // Perfect - ready now
    }
    return 90; // Available now, they want it later (still good)
  }

  // Days until available
  const daysUntilAvailable = Math.ceil(
    (available.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Days until desired
  const daysUntilDesired = Math.ceil(
    (desired.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (available <= desired) {
    return 100; // Will be ready by their desired date
  }

  // Available after desired date - penalize based on delay
  const delayDays = daysUntilAvailable - daysUntilDesired;
  return Math.max(0, 100 - delayDays * 2);
}

// Generate human-readable reasoning
function generateReasoning(
  listing: OfficeListing,
  requirements: Requirements,
  breakdown: MatchScoreBreakdown
): string {
  const reasons: string[] = [];

  // Price reasoning - use breakdown score to inform messaging
  if (requirements.budget && breakdown.priceScore > 0) {
    if (listing.price_per_month <= requirements.budget.max) {
      const savings = requirements.budget.max - listing.price_per_month;
      if (savings > 500) {
        reasons.push(
          `At $${listing.price_per_month.toLocaleString()}/month, this is $${savings.toLocaleString()} under your max budget`
        );
      } else {
        reasons.push(
          `Fits comfortably within your budget at $${listing.price_per_month.toLocaleString()}/month`
        );
      }
    } else {
      const over = listing.price_per_month - requirements.budget.max;
      reasons.push(
        `Slightly over budget at $${listing.price_per_month.toLocaleString()}/month (+$${over.toLocaleString()})`
      );
    }
  }

  // Size reasoning
  if (requirements.teamSize) {
    const sqftPerPerson = Math.round(listing.square_feet / requirements.teamSize);
    const maxComfortable = Math.floor(listing.square_feet / 100);

    if (sqftPerPerson >= 150) {
      reasons.push(
        `${listing.square_feet.toLocaleString()} sqft gives your team of ${requirements.teamSize} a comfortable ${sqftPerPerson} sqft per person`
      );
    } else if (sqftPerPerson >= 100) {
      reasons.push(
        `At ${sqftPerPerson} sqft per person, it's workable for ${requirements.teamSize} people but cozy`
      );
    }

    if (requirements.growthPlans) {
      reasons.push(
        `Room to grow to ~${maxComfortable} people before needing to move`
      );
    }
  }

  // Location reasoning
  if (requirements.neighborhoods && requirements.neighborhoods.length > 0) {
    const isPreferred = requirements.neighborhoods.some(
      n => listing.neighborhood.toLowerCase().includes(n.toLowerCase())
    );
    if (isPreferred) {
      reasons.push(`Located in ${listing.neighborhood} as requested`);
    } else {
      reasons.push(
        `In ${listing.neighborhood} (you mentioned preferring ${requirements.neighborhoods.join(' or ')})`
      );
    }
  } else {
    reasons.push(`Prime ${listing.neighborhood} location`);
  }

  // Amenity highlights
  const amenityHighlights: string[] = [];
  if (listing.amenities.conference_rooms) {
    amenityHighlights.push(`${listing.amenities.conference_rooms} conference room${listing.amenities.conference_rooms > 1 ? 's' : ''}`);
  }
  if (listing.amenities.parking_spots) {
    amenityHighlights.push(`${listing.amenities.parking_spots} parking spots`);
  }
  if (listing.amenities.kitchen) {
    amenityHighlights.push('full kitchen');
  }
  if (listing.amenities['24_7_access']) {
    amenityHighlights.push('24/7 access');
  }

  if (amenityHighlights.length > 0) {
    reasons.push(`Includes ${amenityHighlights.join(', ')}`);
  }

  return reasons.join('. ') + '.';
}

// Main matching function
export function calculateMatch(
  listing: OfficeListing,
  requirements: Requirements
): MatchedListing {
  const breakdown: MatchScoreBreakdown = {
    priceScore: requirements.budget
      ? calculatePriceScore(listing.price_per_month, requirements.budget)
      : 70,
    sizeScore: requirements.teamSize
      ? calculateSizeScore(listing.square_feet, requirements.teamSize, requirements.growthPlans)
      : 70,
    locationScore: calculateLocationScore(listing.neighborhood, requirements.neighborhoods),
    amenityScore: calculateAmenityScore(listing.amenities, requirements.amenities),
    availabilityScore: calculateAvailabilityScore(listing.available_date, requirements.moveInDate),
  };

  const totalScore =
    breakdown.priceScore * WEIGHTS.price +
    breakdown.sizeScore * WEIGHTS.size +
    breakdown.locationScore * WEIGHTS.location +
    breakdown.amenityScore * WEIGHTS.amenity +
    breakdown.availabilityScore * WEIGHTS.availability;

  const reasoning = generateReasoning(listing, requirements, breakdown);

  return {
    ...listing,
    matchScore: Math.round(totalScore),
    breakdown,
    reasoning,
  };
}

// Get top matches from all listings
export function getTopMatches(
  listings: OfficeListing[],
  requirements: Requirements,
  limit: number = 5
): MatchedListing[] {
  // Filter by city first
  let filtered = listings;
  if (requirements.city) {
    filtered = listings.filter(l => l.city === requirements.city);
  }

  // Filter only available listings
  filtered = filtered.filter(l => l.is_available);

  // Calculate match scores
  const scored = filtered.map(listing => calculateMatch(listing, requirements));

  // Sort by score descending
  scored.sort((a, b) => b.matchScore - a.matchScore);

  // Return top N
  return scored.slice(0, limit);
}
