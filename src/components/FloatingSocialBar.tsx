import { useState } from 'react';
import { MessageCircle, Phone, X, Send, Calendar, Sparkles } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { useHotelData } from '../context/HotelDataContext';

interface FloatingSocialBarProps {
  onOpenBooking: () => void;
}

export default function FloatingSocialBar({ onOpenBooking }: FloatingSocialBarProps) {
  const { hotelInfo } = useHotelData();
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const rawPhone = hotelInfo?.phone?.replace(/\D/g, '') || '918222020699';

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatMessage.trim() || `Hello ${hotelInfo.name} Front Desk, I would like to inquire about room availability and tariffs.`;
    trackEvent('whatsapp_concierge_chat', 'interaction', `Msg: ${text}`);
    window.open(`https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`, '_blank');
    setChatMessage('');
    setIsOpen(false);
  };

  const handleCall = () => {
    trackEvent('direct_phone_call', 'click', `Call ${hotelInfo.phone}`);
    window.location.href = `tel:${hotelInfo.phone}`;
  };

  return (
    <>
      {/* Floating Concierge Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                YP
              </div>
              <div>
                <p className="font-bold text-sm">Yashdeep Palace Concierge</p>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Available 24/7 on WhatsApp
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="text-white/80 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-3 bg-slate-50 dark:bg-slate-950 text-xs">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-slate-800 dark:text-slate-200">
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                Namaste! Welcome to Yashdeep Palace.
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                How may we assist you today? We can arrange corporate stay discounts, table reservations at The Royal Feast, or express check-in.
              </p>
            </div>

            {/* Quick response pills */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-slate-400">Quick Inquiries</p>
              <button
                type="button"
                onClick={() => setChatMessage('Hi, what is the best corporate rate for executive rooms this week?')}
                className="w-full text-left p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] hover:border-emerald-500 text-slate-700 dark:text-slate-300 transition-colors"
              >
                🏢 Corporate room tariff inquiry
              </button>
              <button
                type="button"
                onClick={() => setChatMessage('Hello, I would like to reserve a dining table at The Royal Feast.')}
                className="w-full text-left p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] hover:border-emerald-500 text-slate-700 dark:text-slate-300 transition-colors"
              >
                🍽️ Table reservation inquiry
              </button>
            </div>
          </div>

          <form onSubmit={handleSendWhatsApp} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Bar */}
      <aside aria-label="Quick contact and booking concierge" className="fixed bottom-4 right-4 sm:right-6 z-40 flex items-center gap-2">
        {/* Direct Call Button */}
        <button
          onClick={handleCall}
          type="button"
          aria-label="Call Yashdeep Palace Front Desk"
          className="p-3 bg-slate-900 dark:bg-slate-800 text-amber-400 hover:text-white rounded-full shadow-lg border border-slate-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Direct Front Desk Call (+91 82220 20699)"
        >
          <Phone className="w-5 h-5" />
        </button>

        {/* Floating WhatsApp Concierge Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          aria-label="Open WhatsApp Concierge"
          className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">WhatsApp Concierge</span>
        </button>
      </aside>
    </>
  );
}
