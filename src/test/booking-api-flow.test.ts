import { describe, expect, it } from 'vitest';
import { calculateStayPricing } from '@/lib/hotel';
import { sendOtpChallenge, verifyOtpChallenge } from '@/lib/api-otp.server';

describe('API-Driven Booking Flow & Amount Calculation', () => {
  describe('1. Live Stay Pricing Calculation', () => {
    it('calculates nights, 5% GST, and total for Deluxe Room (₹1,600/night)', () => {
      const stay = {
        checkIn: '2026-12-01',
        checkOut: '2026-12-03', // 2 nights
        adults: 2,
        children: 0,
        rooms: 1,
        room: 'Deluxe Room',
      };

      const pricing = calculateStayPricing(stay, false);
      expect(pricing.ratePerNight).toBe(1600);
      expect(pricing.originalRatePerNight).toBe(2500);
      expect(pricing.nights).toBe(2);
      expect(pricing.roomCount).toBe(1);
      expect(pricing.baseRate).toBe(3200); // 1600 * 2
      expect(pricing.taxes).toBe(160); // 5% of 3200
      expect(pricing.discount).toBe(0);
      expect(pricing.total).toBe(3360);
    });

    it('calculates pricing with 10% welcome discount applied', () => {
      const stay = {
        checkIn: '2026-12-01',
        checkOut: '2026-12-03', // 2 nights
        adults: 2,
        children: 0,
        rooms: 1,
        room: 'Deluxe Room',
      };

      const pricing = calculateStayPricing(stay, true);
      expect(pricing.baseRate).toBe(3200);
      expect(pricing.taxes).toBe(160); // 5% GST of 3200
      expect(pricing.discount).toBe(336); // 10% welcome discount of 3360
      expect(pricing.total).toBe(3024); // 3360 - 336
    });

    it('calculates pricing for Deluxe Room With Breakfast (₹2,000/night) with multiple rooms', () => {
      const stay = {
        checkIn: '2026-12-10',
        checkOut: '2026-12-13', // 3 nights
        adults: 4,
        children: 1,
        rooms: 2,
        room: 'Deluxe Room With Breakfast',
      };

      const pricing = calculateStayPricing(stay, false);
      expect(pricing.ratePerNight).toBe(2000);
      expect(pricing.originalRatePerNight).toBe(3000);
      expect(pricing.nights).toBe(3);
      expect(pricing.roomCount).toBe(2);
      expect(pricing.baseRate).toBe(12000); // 2000 * 3 * 2
      expect(pricing.taxes).toBe(600); // 5% of 12000
      expect(pricing.total).toBe(12600); // 12000 + 600
    });
  });

  describe('2. Standalone API-Driven Mobile OTP', () => {
    it('sends an OTP challenge and verifies with correct 6-digit code', async () => {
      const phone = '9876543210';
      const sendRes = await sendOtpChallenge(phone);
      expect(sendRes.ok).toBe(true);

      const verifyRes = await verifyOtpChallenge(phone, '123456');
      expect(verifyRes.ok).toBe(true);
      expect(verifyRes.phone).toBe('+919876543210');
    });

    it('rejects invalid OTP code', async () => {
      const phone = '9812345678';
      await sendOtpChallenge(phone);

      await expect(verifyOtpChallenge(phone, '000000')).rejects.toThrow('Invalid OTP code');
    });

    it('rejects malformed phone number', async () => {
      await expect(sendOtpChallenge('123')).rejects.toThrow('valid mobile number');
    });
  });
});
