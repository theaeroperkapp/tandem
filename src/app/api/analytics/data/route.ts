import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check admin secret key
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    const adminKey = process.env.ADMIN_SECRET_KEY;
    if (!adminKey || key !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Get time range filter
    const range = searchParams.get('range') || '7d';
    const dateFilter = new Date();
    switch (range) {
      case '24h':
        dateFilter.setHours(dateFilter.getHours() - 24);
        break;
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      default:
        dateFilter.setDate(dateFilter.getDate() - 7);
    }

    // Fetch page visits
    const { data: visits, error: visitsError } = await supabase
      .from('page_visits')
      .select('*')
      .gte('visited_at', dateFilter.toISOString())
      .order('visited_at', { ascending: false });

    if (visitsError) {
      console.error('Error fetching visits:', visitsError);
    }

    // Fetch chat analytics
    const { data: chats, error: chatsError } = await supabase
      .from('chat_analytics')
      .select('*')
      .gte('started_at', dateFilter.toISOString())
      .order('started_at', { ascending: false });

    if (chatsError) {
      console.error('Error fetching chats:', chatsError);
    }

    // Calculate stats
    const visitsList = visits || [];
    const chatsList = chats || [];

    const stats = {
      totalVisits: visitsList.length,
      uniqueSessions: new Set(visitsList.map(v => v.session_id)).size,
      totalChats: chatsList.length,
      matchesShown: chatsList.filter(c => c.matches_shown > 0).length,
      leasesGenerated: chatsList.filter(c => c.lease_generated).length,

      // By device
      byDevice: visitsList.reduce((acc, v) => {
        acc[v.device_type] = (acc[v.device_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),

      // By browser
      byBrowser: visitsList.reduce((acc, v) => {
        acc[v.browser] = (acc[v.browser] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),

      // By OS
      byOS: visitsList.reduce((acc, v) => {
        acc[v.os] = (acc[v.os] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),

      // By city searched
      byCity: chatsList.reduce((acc, c) => {
        if (c.city_searched) {
          acc[c.city_searched] = (acc[c.city_searched] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),

      // Visits by hour (last 24h)
      visitsByHour: Array.from({ length: 24 }, (_, i) => {
        const hour = new Date();
        hour.setHours(hour.getHours() - (23 - i), 0, 0, 0);
        const nextHour = new Date(hour);
        nextHour.setHours(nextHour.getHours() + 1);
        return {
          hour: hour.toISOString(),
          count: visitsList.filter(v => {
            const vTime = new Date(v.visited_at);
            return vTime >= hour && vTime < nextHour;
          }).length,
        };
      }),
    };

    return NextResponse.json({
      stats,
      recentVisits: visitsList.slice(0, 50),
      recentChats: chatsList.slice(0, 50),
    });
  } catch (error) {
    console.error('Analytics data error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
