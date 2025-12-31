'use client';

import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function Analytics() {
  useEffect(() => {
    // Get or create session ID
    let sessionId = localStorage.getItem('tandem_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('tandem_session_id', sessionId);
    }

    // Get UTM params from URL
    const params = new URLSearchParams(window.location.search);

    // Track page visit
    const trackVisit = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            pagePath: window.location.pathname,
            referrer: document.referrer,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            utmSource: params.get('utm_source'),
            utmMedium: params.get('utm_medium'),
            utmCampaign: params.get('utm_campaign'),
          }),
        });
      } catch (error) {
        // Silently fail - don't break the app for analytics
        console.debug('Analytics tracking failed:', error);
      }
    };

    trackVisit();
  }, []);

  return null;
}
