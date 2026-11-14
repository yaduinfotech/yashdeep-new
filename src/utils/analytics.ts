import { AnalyticsEvent } from '../types/hotel';
import {
  logOfflineAnalyticsEvent,
  getOfflineAnalyticsEvents,
  clearOfflineAnalyticsEvents as clearSqliteAnalytics,
} from './offlineSqlite';

// In-memory cache backed by SQLite
let memoryEvents: AnalyticsEvent[] = [];
let isHydrated = false;

// Preload analytics events from SQLite
export async function initAnalyticsFromSqlite() {
  if (isHydrated) return;
  try {
    const rows = await getOfflineAnalyticsEvents();
    if (Array.isArray(rows) && rows.length > 0) {
      memoryEvents = rows.map((r) => ({
        id: `evt-${r.id}`,
        timestamp: r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : new Date().toLocaleTimeString(),
        eventName: r.eventName,
        category: (r.category as any) || 'interaction',
        details: r.label || '',
      }));
    }
    isHydrated = true;
  } catch (err) {
    console.warn('[Analytics] Failed to hydrate analytics from SQLite:', err);
  }
}

// Auto-hydrate on startup
if (typeof window !== 'undefined') {
  initAnalyticsFromSqlite().catch(() => {});
}

export const trackEvent = (
  eventName: string,
  category: 'view' | 'click' | 'booking' | 'newsletter' | 'interaction',
  details: string
) => {
  try {
    const newEvent: AnalyticsEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      eventName,
      category,
      details,
    };

    memoryEvents = [newEvent, ...memoryEvents.slice(0, 99)]; // Keep last 100 in memory

    // Persist into SQLite table sqlite_analytics_events
    logOfflineAnalyticsEvent({
      eventName,
      category,
      label: details,
    }).catch((err) => console.warn('[Analytics] Could not write to SQLite:', err));

    // Dispatch custom event for real-time reactivity in AnalyticsDrawer
    window.dispatchEvent(new CustomEvent('ydp_analytics_update'));
  } catch {
    // Gracefully handle any browser error
  }
};

export const getStoredEvents = (): AnalyticsEvent[] => {
  return memoryEvents;
};

export const clearAnalyticsEvents = () => {
  memoryEvents = [];
  clearSqliteAnalytics().catch((err) => console.warn('[Analytics] Could not clear SQLite events:', err));
  window.dispatchEvent(new CustomEvent('ydp_analytics_update'));
};
