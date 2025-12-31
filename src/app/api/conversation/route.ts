import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Load conversation by session ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - that's okay for new sessions
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      conversation: conversation || null,
    });
  } catch (error) {
    console.error('Conversation API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

// POST - Create or update conversation
export async function POST(request: NextRequest) {
  try {
    const { sessionId, messages, extractedRequirements, matchedListings } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Check if conversation exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('conversations')
        .update({
          messages: messages || [],
          extracted_requirements: extractedRequirements,
          matched_listings: matchedListings,
        })
        .eq('session_id', sessionId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({ conversation: data });
    } else {
      // Create new
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          session_id: sessionId,
          messages: messages || [],
          extracted_requirements: extractedRequirements,
          matched_listings: matchedListings,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({ conversation: data });
    }
  } catch (error) {
    console.error('Conversation save error:', error);
    return NextResponse.json(
      { error: 'Failed to save conversation' },
      { status: 500 }
    );
  }
}
