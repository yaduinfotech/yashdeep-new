import { useState } from 'react';
import { UserProfile, RedeemableBenefit, BookingData, EmailNotification } from '../types/hotel';
import { REDEEMABLE_BENEFITS } from '../data/rewardsData';
import {
  X,
  Award,
  Crown,
  Sparkles,
  Gift,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  LogOut,
  Tag,
  CreditCard,
  Printer,
  ChevronRight,
  Mail,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { simulateBookingConfirmationEmail } from '../utils/emailService';
import EmailPreviewModal from './EmailPreviewModal';

interface RewardsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  onUpdatePoints: (newPoints: number, redeemedCode?: string) => void;
  userBookings: BookingData[];
  onOpenBookingWithBenefit?: (benefitCode: string) => void;
}

export default function RewardsDashboardModal({
  isOpen,
  onClose,
  currentUser,
  onGoogleSignIn,
  onSignOut,
  onUpdatePoints,
  userBookings,
  onOpenBookingWithBenefit,
}: RewardsDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<'benefits' | 'history'>('benefits');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewEmail, setPreviewEmail] = useState<EmailNotification | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!isOpen) return null;

  const handleRedeem = (benefit: RedeemableBenefit) => {
    if (!currentUser) {
      onGoogleSignIn();
      return;
    }

    if (currentUser.points < benefit.pointsCost) {
      alert(`You need ${benefit.pointsCost} points to redeem this benefit. Your current balance is ${currentUser.points} points.`);
      return;
    }

    const remaining = currentUser.points - benefit.pointsCost;
    onUpdatePoints(remaining, benefit.code);
    trackEvent('reward_benefit_redeemed', 'interaction', `Benefit: ${benefit.title}, PointsCost: ${benefit.pointsCost}`);

    setSuccessMessage(`Successfully redeemed ${benefit.title}! Promo Code: ${benefit.code}`);
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  const calculatePointsToNextTier = () => {
    if (!currentUser) return 0;
    if (currentUser.points < 500) return 500 - currentUser.points;
    if (currentUser.points < 1500) return 1500 - currentUser.points;
    return 0; // Already Platinum Maharaja
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl my-6 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-royal text-lg font-bold text-slate-900 dark:text-amber-400">
                YASHDEEP REWARDS
              </h3>
              <p className="text-[11px] text-slate-500">
                Royal Guest Privilege & Loyalty Dashboard
              </p>
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

        {/* User Status Bar / Google Sign-in Prompt */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
          {!currentUser ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Sign in with Google to Access Yashdeep Rewards
                </h4>
                <p className="text-xs text-slate-500">
                  Earn 10 points for every ₹100 spent. Receive 200 instant welcome bonus points.
                </p>
              </div>

              {/* Official Google Sign-In Styled Button */}
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-xs flex items-center gap-2.5 transition-all hover:shadow-md cursor-pointer shrink-0"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Profile Card */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shrink-0 bg-slate-200">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name);
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {currentUser.name}
                    </h4>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      {currentUser.tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                </div>
              </div>

              {/* Points Card */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Accrued Reward Points
                </p>
                <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                  {currentUser.points.toLocaleString()} <span className="text-xs font-normal text-slate-400">PTS</span>
                </p>
                {calculatePointsToNextTier() > 0 ? (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {calculatePointsToNextTier()} points needed for Platinum Maharaja
                  </p>
                ) : (
                  <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">
                    ★ Highest Maharaja Tier Achieved
                  </p>
                )}
              </div>

              {/* Sign out */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onSignOut}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-red-500 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tab Controls */}
        <div className="px-6 pt-4 border-b border-slate-200 dark:border-slate-800 flex gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('benefits')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'benefits'
                ? 'border-amber-400 text-amber-600 dark:text-amber-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Redeemable Benefits & Privileges
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-600 dark:text-amber-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            My Stay History ({userBookings.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Notification banner */}
          {successMessage && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{successMessage}</span>
              </div>
              {onOpenBookingWithBenefit && (
                <button
                  type="button"
                  onClick={() => {
                    const code = successMessage.split('Promo Code: ')[1];
                    onClose();
                    onOpenBookingWithBenefit(code);
                  }}
                  className="underline font-bold text-emerald-700 dark:text-emerald-200 cursor-pointer"
                >
                  Apply to New Stay Now →
                </button>
              )}
            </div>
          )}

          {/* TAB 1: REDEEMABLE BENEFITS */}
          {activeTab === 'benefits' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Select a privilege to redeem using your points balance:</span>
                <span>Tier Bonus Active: {currentUser?.tier || 'Silver'}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REDEEMABLE_BENEFITS.map((benefit) => {
                  const canAfford = (currentUser?.points || 0) >= benefit.pointsCost;
                  return (
                    <div
                      key={benefit.id}
                      className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-amber-400/60 transition-all flex flex-col justify-between space-y-4 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5" />
                            {benefit.value}
                          </span>
                          <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                            {benefit.pointsCost} PTS
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white font-royal">
                          {benefit.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <span className="font-mono text-[11px] text-slate-400">
                          Code: {benefit.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRedeem(benefit)}
                          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                            canAfford
                              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Redeem Voucher' : 'Need More Points'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: STAY HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {userBookings.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-3">
                  <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-semibold">No booking history recorded yet.</p>
                  <p className="text-xs max-w-sm mx-auto">
                    Reserve a stay with your Google account to automatically track reservations and accrue reward points!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                            {b.bookingReference}
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 px-2 py-0.5 rounded-sm">
                            Confirmed & Paid
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {b.roomName}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {b.checkIn} to {b.checkOut} ({b.nights} nights) · {b.adultCount} Adult(s)
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <div className="text-right mr-1">
                          <p className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                            ₹{b.grandTotal.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                            +{(b.grandTotal * 0.1).toFixed(0)} PTS Accrued
                          </p>
                        </div>

                        {/* Preview Confirmation Email */}
                        <button
                          type="button"
                          onClick={() => {
                            const email = simulateBookingConfirmationEmail(b);
                            setPreviewEmail(email);
                            setIsPreviewOpen(true);
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-900"
                          title="View Confirmation Email"
                        >
                          <Mail className="w-3.5 h-3.5 text-amber-500" />
                          <span className="hidden md:inline">Email</span>
                        </button>

                        {/* PDF Summary Link */}
                        <a
                          href={`/api/bookings/${b.bookingReference}/pdf-summary`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-900"
                          title="Open PDF Summary Voucher"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-500" />
                          <span className="hidden md:inline">PDF</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>

                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-300 dark:border-slate-700"
                          title="Print Stay Voucher"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Simulated Confirmation Email Preview Modal */}
      <EmailPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        email={previewEmail}
      />
    </div>
  );
}
