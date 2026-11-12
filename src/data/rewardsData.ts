import { RedeemableBenefit, UserProfile } from '../types/hotel';

export const REDEEMABLE_BENEFITS: RedeemableBenefit[] = [
  {
    id: 'benefit-1',
    title: '10% Off Direct Stay Tariff',
    pointsCost: 300,
    description: 'Instant 10% deduction applied to your room total for any deluxe room or luxury suite.',
    code: 'YDP-REWARD-10',
    type: 'room_discount',
    value: '10% Discount',
  },
  {
    id: 'benefit-2',
    title: 'Complimentary Royal Buffet Breakfast',
    pointsCost: 200,
    description: 'Enjoy a lavish multi-cuisine morning buffet for up to 2 guests at The Royal Feast.',
    code: 'YDP-FREE-BF',
    type: 'free_breakfast',
    value: 'Free Breakfast (₹700 Value)',
  },
  {
    id: 'benefit-3',
    title: 'Priority Early Check-in (from 10 AM)',
    pointsCost: 150,
    description: 'Guaranteed flexible check-in and complimentary late checkout until 2:00 PM.',
    code: 'YDP-EARLY-IN',
    type: 'early_checkin',
    value: 'Free Early Check-in (₹600 Value)',
  },
  {
    id: 'benefit-4',
    title: 'Complimentary Royal Suite Upgrade',
    pointsCost: 500,
    description: 'Upgrade your Deluxe King Room reservation to a spacious Royal Club Suite with balcony.',
    code: 'YDP-SUITE-UP',
    type: 'suite_upgrade',
    value: 'Free Suite Upgrade (₹1,500 Value)',
  },
];

export const INITIAL_GOOGLE_USER: UserProfile = {
  id: 'usr-google-922882',
  name: 'Rasu Kumar',
  email: 'rasu2027@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80',
  tier: 'Gold Royal',
  points: 850,
  memberSince: 'March 2026',
  redeemedBenefits: [],
};
