import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Parse user agent to extract browser, OS, device info
function parseUserAgent(ua: string) {
  const result = {
    browser: 'Unknown',
    browser_version: '',
    os: 'Unknown',
    device_type: 'desktop',
  };

  // Browser detection
  if (ua.includes('Firefox/')) {
    result.browser = 'Firefox';
    result.browser_version = ua.match(/Firefox\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Edg/')) {
    result.browser = 'Edge';
    result.browser_version = ua.match(/Edg\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Chrome/')) {
    result.browser = 'Chrome';
    result.browser_version = ua.match(/Chrome\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    result.browser = 'Safari';
    result.browser_version = ua.match(/Version\/(\d+)/)?.[1] || '';
  }

  // OS detection
  if (ua.includes('Windows')) {
    result.os = 'Windows';
  } else if (ua.includes('Mac OS')) {
    result.os = 'macOS';
  } else if (ua.includes('Linux')) {
    result.os = 'Linux';
  } else if (ua.includes('Android')) {
    result.os = 'Android';
  } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
    result.os = 'iOS';
  }

  // Device type
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
    result.device_type = 'mobile';
  } else if (ua.includes('Tablet') || ua.includes('iPad')) {
    result.device_type = 'tablet';
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      pagePath,
      referrer,
      screenWidth,
      screenHeight,
      viewportWidth,
      viewportHeight,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    // Get IP and user agent from headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Parse user agent
    const uaInfo = parseUserAgent(userAgent);

    // Get location from IP using free geolocation API
    let city = null;
    let region = null;
    let country = null;
    try {
      if (ip && ip !== 'unknown') {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          city = geoData.city || null;
          region = geoData.regionName || null;
          country = geoData.country || null;
        }
      }
    } catch {
      // Silently fail geolocation - don't block tracking
    }

    // Insert visit record
    const { error } = await supabase.from('page_visits').insert({
      session_id: sessionId,
      page_path: pagePath,
      referrer: referrer || null,
      user_agent: userAgent,
      browser: uaInfo.browser,
      browser_version: uaInfo.browser_version,
      os: uaInfo.os,
      device_type: uaInfo.device_type,
      ip_address: ip,
      city,
      region,
      country,
      screen_width: screenWidth,
      screen_height: screenHeight,
      viewport_width: viewportWidth,
      viewport_height: viewportHeight,
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
    });

    if (error) {
      console.error('Analytics tracking error:', error);
      return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}
