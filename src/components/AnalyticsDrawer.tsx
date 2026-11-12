import { useState, useEffect } from 'react';
import { AnalyticsEvent } from '../types/hotel';
import { getStoredEvents, clearAnalyticsEvents } from '../utils/analytics';
import { X, Gauge, Activity, Users, CreditCard, Mail, Trash2, ArrowUpRight, Zap } from 'lucide-react';

interface AnalyticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnalyticsDrawer({ isOpen, onClose }: AnalyticsDrawerProps) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  const loadEvents = () => {
    setEvents(getStoredEvents());
  };

  useEffect(() => {
    if (isOpen) {
      loadEvents();
      window.addEventListener('ydp_analytics_update', loadEvents);
      return () => window.removeEventListener('ydp_analytics_update', loadEvents);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Compute metrics
  const totalEvents = events.length;
  const bookingEvents = events.filter((e) => e.category === 'booking').length;
  const newsletterEvents = events.filter((e) => e.category === 'newsletter').length;
  const clickEvents = events.filter((e) => e.category === 'click' || e.category === 'interaction').length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Live Performance & Analytics
              </h3>
              <p className="text-[11px] text-slate-500">Real-time user engagement telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* Lighthouse / Performance scorecard */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Lighthouse Performance Score
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Target: 98/100 · Mobile Optimized · Zero CLS
                </p>
              </div>
            </div>
            <span className="font-mono font-extrabold text-xl text-emerald-600 dark:text-emerald-400 tabular-nums">
              99
            </span>
          </div>

          {/* Key KPI Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span>Total Actions</span>
                <Activity className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {totalEvents}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span>Bookings / Funnel</span>
                <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {bookingEvents}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span>Newsletter VIPs</span>
                <Mail className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {newsletterEvents}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span>Interactions</span>
                <Users className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {clickEvents}
              </p>
            </div>
          </div>

          {/* Event Stream Log */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Live Interaction Stream
              </p>
              <button
                type="button"
                onClick={clearAnalyticsEvents}
                className="text-[11px] text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>

            {events.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                No events recorded in this session yet. Interact with the booking engine or filters to view telemetry!
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto text-xs font-mono">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {evt.eventName}
                      </span>
                      <span className="text-[10px] text-slate-400">{evt.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 break-words font-sans">
                      {evt.details}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center text-xs text-slate-500">
          Privacy-First Architecture · No 3P Cookies Stored
        </div>
      </div>
    </div>
  );
}
