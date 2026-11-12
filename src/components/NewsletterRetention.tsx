import { useState } from 'react';
import { Mail, Sparkles, Check, Copy, Tag, Gift } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

export default function NewsletterRetention() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);
  const promoCode = 'ROYAL15';

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    try {
      const subscribers = JSON.parse(localStorage.getItem('ydp_newsletter_subscribers') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('ydp_newsletter_subscribers', JSON.stringify(subscribers));
      }
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {
      // storage safe
    }

    trackEvent('newsletter_signup', 'newsletter', `Email: ${email}`);
    setSubscribed(true);
    setEmail('');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    trackEvent('coupon_copied', 'click', `Code: ${promoCode}`);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden border-y border-amber-500/20">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Gift className="w-3.5 h-3.5" />
          <span>Exclusive Palace Privileges</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold font-royal text-white mb-3">
          Join the Yashdeep Royal Circle
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
          Subscribe to receive secret seasonal tariff offers, priority banquet dates, and an instant
          15% welcome discount voucher for your next stay.
        </p>

        {subscribed ? (
          <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-6 max-w-md mx-auto space-y-3 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-base">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Welcome to the Royal Circle!</span>
            </div>
            <p className="text-xs text-slate-300">
              Here is your instant 15% VIP reservation coupon code. Use it at checkout or quote it at the front desk:
            </p>

            <div className="flex items-center justify-between p-3 bg-slate-900/90 rounded-xl border border-amber-400/40">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <span className="font-mono font-extrabold text-base tracking-wider text-amber-300">
                  {promoCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <div className="relative flex-1">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your corporate or personal email"
                className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Claim 15% Off</span>
            </button>
          </form>
        )}

        <p className="text-[11px] text-slate-500 mt-4">
          Zero spam. We respect your privacy. Unsubscribe at any time with one click.
        </p>
      </div>
    </section>
  );
}
