import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const neighborhood = searchParams.get('neighborhood');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minCapacity = searchParams.get('minCapacity');

    let query = supabase
      .from('office_listings')
      .select('*')
      .eq('is_available', true);

    // Apply filters
    if (city) {
      query = query.eq('city', city);
    }

    if (neighborhood) {
      query = query.eq('neighborhood', neighborhood);
    }

    if (minPrice) {
      query = query.gte('price_per_month', parseInt(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price_per_month', parseInt(maxPrice));
    }

    if (minCapacity) {
      query = query.gte('max_capacity', parseInt(minCapacity));
    }

    // Order by price
    query = query.order('price_per_month', { ascending: true });

    const { data: listings, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch listings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ listings: listings || [] });
  } catch (error) {
    console.error('Listings API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
