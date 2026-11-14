import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MapPin, Building2, Utensils, Wifi, ShieldCheck, Sparkles } from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'location' | 'amenities' | 'corporate' | 'dining';
  question: string;
  shortAnswer: string;
  detailedAnswer: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'location',
    question: 'Where is YashDeep Palace located relative to Honda Car India Plant in Khuskheda?',
    shortAnswer: 'Directly opposite Honda Car India Gate No. 4, Karuli Industrial Area, Khuskheda, Rajasthan 301707.',
    detailedAnswer:
      'Hotel YashDeep Palace is situated immediately across from Honda Cars India Ltd (Gate 4) in the Karuli RIICO Industrial Area. This strategic location makes it the premier choice for automotive vendors, plant audit teams, Japanese expatriates, and technical consultants visiting the Khuskheda-Tapukrah industrial belt.',
  },
  {
    id: 'faq-2',
    category: 'corporate',
    question: 'What amenities are tailored for corporate and business travelers?',
    shortAnswer: 'Dedicated high-speed Wi-Fi, 24/7 power backup, in-room tea/coffee, and GST corporate tax invoice billing.',
    detailedAnswer:
      'Every executive room includes optical fibre Wi-Fi, soundproof double-glazed windows to eliminate highway and factory noise, 24/7 hot water, laundry service with same-day express turnaround, and automated GST billing receipts for corporate travel reimbursement.',
  },
  {
    id: 'faq-3',
    category: 'dining',
    question: 'What are the dining options at YashDeep Palace Restaurant?',
    shortAnswer: 'The Royal Feast Restaurant serves multi-cuisine North Indian, Chinese, Continental, vegetarian and non-vegeterian thalis.',
    detailedAnswer:
      'The in-house dining venue "The Royal Feast" provides breakfast buffets starting at 9:00 AM, executive express lunches for corporate lunch meetings, and a la carte dinner with royal specialities like Handi Paneer, Dal Makhani, and Butter Chicken. In-room dining is available for guests.',
  },
  {
    id: 'faq-4',
    category: 'corporate',
    question: 'How can corporate clients and plant audit teams make advance reservations with special tariffs?',
    shortAnswer: 'Direct advance reservations with instant GST billing and corporate tariffs can be confirmed directly online or by calling the front desk.',
    detailedAnswer:
      'We offer corporate tie-ups and priority billing for vendors and visiting delegations across the Khuskheda-Bhiwadi industrial belt. Call our 24/7 front desk or reserve online with instant confirmation and pay-at-hotel flexibility.',
  },
  {
    id: 'faq-5',
    category: 'location',
    question: 'How to reach YashDeep Palace from Delhi Airport, Gurgaon, and Bhiwadi?',
    shortAnswer: 'Accessible via NH-48 (Delhi-Jaipur Highway) through Dharuhera or Bhiwadi bypass, approximately 75 minutes from IGI Airport Delhi.',
    detailedAnswer:
      'From New Delhi IGI Airport (T3), take NH-48 towards Dharuhera and turn onto the Bhiwadi-Alwar State Highway towards Tapukrah and Karuli Industrial Area. From Cyber City Gurgaon, the drive takes roughly 55-65 minutes. Free secured parking is provided on-site.',
  },
  {
    id: 'faq-6',
    category: 'amenities',
    question: 'What are the standard check-in and check-out timings and cancellation policies?',
    shortAnswer: 'Standard Check-in is 13:00 PM and Check-out is 11:00 AM. Free advance reservation with Pay-at-Check-In.',
    detailedAnswer:
      'Guests can book their advance reservation online without upfront pre-payment using our "Pay-at-Check-In" guarantee. Early check-in from 10:00 AM or late check-out up to 3:00 PM can be arranged upon availability by notifying the front desk in advance.',
  },
];

export default function AeoKnowledgeFaq() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'location' | 'corporate' | 'dining' | 'amenities'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');

  const filteredFaqs = activeCategory === 'all' ? FAQS : FAQS.filter((f) => f.category === activeCategory);

  return (
    <section id="faq" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Knowledge Base & Guest Queries</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions & Location Guide
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            Authoritative information regarding YashDeep Palace Hotel & Restaurant, proximity to Honda Car India Gate 4,
            corporate amenities, and travel logistics in Khuskheda, Tapukrah & Bhiwadi.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {[
              { id: 'all', label: 'All Queries' },
              { id: 'location', label: 'Location & Honda Gate 4' },
              { id: 'corporate', label: 'Corporate & Stays' },
              { id: 'dining', label: 'Restaurant & Dining' },
              { id: 'amenities', label: 'Policies & Check-in' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${activeCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-4">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/40 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-snug">
                        {faq.question}
                      </h3>
                      {!isExpanded && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {faq.shortAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-slate-400 shrink-0 mt-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-amber-600" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    <div className="p-3.5 bg-amber-500/10 rounded-lg border border-amber-500/20 mb-3 text-slate-900 dark:text-amber-200 font-medium text-xs">
                      ⚡ Quick Take: {faq.shortAnswer}
                    </div>
                    <p>{faq.detailedAnswer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Local Highlights Card for Search & Generative AI Engines */}
        <div className="mt-12 p-6 rounded-2xl bg-linear-to-r from-amber-50 to-orange-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-amber-200/70 dark:border-amber-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500 text-white shadow-md shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-slate-900 dark:text-white text-base">
                Prime Karuli Industrial Area Location (Opposite Honda Car Gate No. 4)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Serving Khuskheda, Tapukrah, Karuli RIICO Industrial Area, and Greater Bhiwadi. 24/7 reception support, secure parking,
                and corporate concierge.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+918222020699"
              className="px-4 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors"
            >
              Call +91 82220 20699
            </a>
            <a
              href="https://maps.google.com/?q=28.1062,76.8488"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
            >
              Open in Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
