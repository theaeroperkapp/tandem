import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';
import { Requirements, OfficeListing } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const LEASE_SYSTEM_PROMPT = `You are a legal document generator specializing in commercial office leases. Generate professional, comprehensive lease agreements based on the provided details. Format the output in clean Markdown.`;

function buildLeasePrompt(listing: OfficeListing, requirements: Requirements): string {
  const specialClauses: string[] = [];

  if (requirements.growthPlans) {
    specialClauses.push('- Expansion rights clause (right of first refusal on adjacent space)');
  }

  specialClauses.push('- Early termination option (with 3-month penalty)');

  return `Generate a commercial office lease agreement with the following details:

**PARTIES:**
- Tenant: ${requirements.companyName || '[COMPANY NAME]'}
- Tenant Structure: ${requirements.businessStructure || 'Corporation'}
- Tenant Address: ${requirements.companyAddress || '[COMPANY ADDRESS]'}
- Signing Authority: ${requirements.signingAuthority || 'CEO'}
- Landlord: Tandem Properties LLC
- Landlord Address: 100 California Street, Suite 500, San Francisco, CA 94111

**PROPERTY:**
- Address: ${listing.address}
- Square Footage: ${listing.square_feet.toLocaleString()} sqft
- Maximum Capacity: ${listing.max_capacity} persons

**TERMS:**
- Lease Term: ${requirements.leaseTermMonths || 24} months
- Commencement Date: ${requirements.moveInDate || listing.available_date}
- Monthly Base Rent: $${listing.price_per_month.toLocaleString()}
- Security Deposit: $${(listing.price_per_month * 2).toLocaleString()} (2 months rent)

**INCLUDED AMENITIES:**
${Object.entries(listing.amenities)
  .filter(([, value]) => value)
  .map(([key, value]) => `- ${key.replace(/_/g, ' ')}: ${typeof value === 'boolean' ? 'Yes' : value}`)
  .join('\n')}

**SPECIAL CLAUSES TO INCLUDE:**
${specialClauses.join('\n')}

Generate a complete commercial lease agreement with the following sections:
1. PARTIES (with complete legal names and addresses)
2. PREMISES (legal description, permitted use: general office)
3. TERM (start date, end date, renewal options)
4. RENT & DEPOSITS (monthly rent, deposit, payment terms - due on 1st of each month)
5. USE OF PREMISES (permitted business use, restrictions)
6. MAINTENANCE & REPAIRS (landlord vs tenant responsibilities)
7. INSURANCE & INDEMNITY (required coverages: general liability $1M, property insurance)
8. UTILITIES (tenant responsible for electricity, internet; landlord covers water, HVAC maintenance)
9. ALTERATIONS (tenant improvements require written consent)
10. EXPANSION RIGHTS (if applicable)
11. EARLY TERMINATION (if applicable)
12. DEFAULT & REMEDIES (30-day cure period for non-monetary defaults)
13. GENERAL PROVISIONS (notices, assignment/subletting, governing law - state of property)
14. SIGNATURES (signature blocks for both parties with date lines)

Make it professional but readable. Include placeholder brackets [LIKE THIS] for any missing information.

End with a disclaimer: "This lease agreement is a template for discussion purposes. Both parties should have legal counsel review before signing."`;
}

export async function POST(request: NextRequest) {
  try {
    const { listingId, requirements } = await request.json();

    if (!listingId || !requirements) {
      return NextResponse.json(
        { error: 'Listing ID and requirements are required' },
        { status: 400 }
      );
    }

    // Fetch the listing
    const { data: listing, error: listingError } = await supabase
      .from('office_listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Generate lease using Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: LEASE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildLeasePrompt(listing as OfficeListing, requirements as Requirements),
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent legal docs
    });

    const leaseContent = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    return NextResponse.json({
      leaseDocument: leaseContent,
      listing,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Lease generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate lease' },
      { status: 500 }
    );
  }
}
