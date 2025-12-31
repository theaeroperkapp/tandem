import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getTopMatches } from '@/lib/matching';
import { OfficeListing, Requirements } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { requirements, sessionId } = await request.json();

    if (!requirements) {
      return NextResponse.json(
        { error: 'Requirements are required' },
        { status: 400 }
      );
    }

    // Fetch listings from database
    let query = supabase
      .from('office_listings')
      .select('*')
      .eq('is_available', true);

    // Filter by city if specified
    if (requirements.city) {
      query = query.eq('city', requirements.city);
    }

    const { data: listings, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch listings' },
        { status: 500 }
      );
    }

    if (!listings || listings.length === 0) {
      return NextResponse.json({
        matches: [],
        message: 'No listings found matching your criteria',
      });
    }

    // Calculate matches
    const matches = getTopMatches(
      listings as OfficeListing[],
      requirements as Requirements,
      5
    );

    // Update conversation with matched listings
    if (sessionId) {
      const matchedIds = matches.map(m => m.id);
      await supabase
        .from('conversations')
        .update({ matched_listings: matchedIds })
        .eq('session_id', sessionId);
    }

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Match API error:', error);
    return NextResponse.json(
      { error: 'Failed to find matches' },
      { status: 500 }
    );
  }
}
