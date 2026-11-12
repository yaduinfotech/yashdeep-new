import { AnalyticsEvent } from '../types/hotel';

const STORAGE_KEY = 'ydp_analytics_events';

export const trackEvent = (
  eventName: string,
  category: 'view' | 'click' | 'booking' | 'newsletter' | 'interaction',
  details: string
) => {
  try {
    const existing = getStoredEvents();
    const newEvent: AnalyticsEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      eventName,
      category,
      details,
    };
    const updated = [newEvent, ...existing.slice(0, 99)]; // Keep last 100
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom event for real-time reactivity in AnalyticsDrawer
    window.dispatchEvent(new CustomEvent('ydp_analytics_update'));
  } catch {
    // Gracefully handle storage limitations
  }
};

export const getStoredEvents = (): AnalyticsEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const clearAnalyticsEvents = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('ydp_analytics_update'));
};
