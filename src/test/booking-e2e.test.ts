import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hmsSubmitBooking } from '@/lib/hms-gateway.server';
import { hasVerifiedContacts, phoneSchema, staySchema, guestSchema, LIMITS } from '@/lib/booking-rules';
import { validateStay } from '@/lib/hotel';

describe('End-to-End Automated Booking Flow via HMS API', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      HMS_BASE_URL: 'https://hms.yashdeeppalace.com',
      HMS_BEARER_TOKEN: 'secret-hms-bearer-token',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('1. Pre-Submission Verification & Invariants', () => {
    it('rejects booking submission when email is not confirmed', () => {
      const user = { email: 'guest@example.com', email_confirmed_at: undefined };
      const guestEmail = 'guest@example.com';
      const phoneVerified = true;
      expect(hasVerifiedContacts(user, guestEmail, phoneVerified)).toBe(false);
    });

    it('rejects booking submission when mobile is not verified', () => {
      const user = { email: 'guest@example.com', email_confirmed_at: '2026-11-15T00:00:00Z' };
      const guestEmail = 'guest@example.com';
      const phoneVerified = false;
      expect(hasVerifiedContacts(user, guestEmail, phoneVerified)).toBe(false);
    });

    it('rejects booking submission when guest email does not match user account email', () => {
      const user = { email: 'account@example.com', email_confirmed_at: '2026-11-15T00:00:00Z' };
      const guestEmail = 'other@example.com';
      const phoneVerified = true;
      expect(hasVerifiedContacts(user, guestEmail, phoneVerified)).toBe(false);
    });

    it('approves pre-submission only when BOTH email and mobile are verified for the same user', () => {
      const user = { email: 'verified@example.com', email_confirmed_at: '2026-11-15T00:00:00Z' };
      const guestEmail = 'VERIFIED@EXAMPLE.COM';
      const phoneVerified = true;
      expect(hasVerifiedContacts(user, guestEmail, phoneVerified)).toBe(true);
    });

    it('validates stay dates and prevents past check-in', () => {
      const today = '2026-11-15';
      const invalidStay = {
        checkIn: '2026-11-14',
        checkOut: '2026-11-16',
        adults: 2,
        children: 0,
        rooms: 1,
        room: 'Deluxe Room',
      };
      expect(validateStay(invalidStay, today)).toBe('Check-in cannot be in the past.');
    });

    it('validates stay dates and prevents check-out before or on check-in', () => {
      const today = '2026-11-15';
      const invalidStay = {
        checkIn: '2026-12-05',
        checkOut: '2026-12-05',
        adults: 2,
        children: 0,
        rooms: 1,
        room: 'Deluxe Room',
      };
      expect(validateStay(invalidStay, today)).toBe('Check-out must be after check-in.');
    });
  });

  describe('2. HMS Automated Booking Dispatch (End-to-End)', () => {
    it('executes full end-to-end booking dispatch to HMS with Bearer auth and sanitized payload', async () => {
      let capturedUrl = '';
      let capturedMethod = '';
      let capturedHeaders: Record<string, string> = {};
      let capturedBody: any = null;

      global.fetch = vi.fn().mockImplementation(async (url, init) => {
        capturedUrl = String(url);
        capturedMethod = init?.method || '';
        capturedHeaders = init?.headers as Record<string, string>;
        capturedBody = JSON.parse(init?.body as string);
        return {
          ok: true,
          status: 201,
          json: async () => ({
            success: true,
            bookingReference: 'YDP-2026-9876',
            status: 'confirmed',
          }),
        };
      });

      const guestInput = {
        name: '<b>Vikram Singh</b>',
        email: '  VIKRAM@EXAMPLE.COM  ',
        phone: '9876543210',
        requests: 'High floor with quiet view <script>alert("xss")</script>',
      };

      const stayInput = {
        checkIn: '2026-12-10',
        checkOut: '2026-12-12',
        adults: 2,
        children: 1,
        rooms: 1,
        room: 'Deluxe Room',
      };

      // Ensure stay and guest inputs conform to schemas
      expect(guestSchema.safeParse(guestInput).success).toBe(true);
      expect(staySchema.safeParse(stayInput).success).toBe(true);

      const result = await hmsSubmitBooking({
        guest: guestInput,
        stay: stayInput,
        userId: 'guest-uuid-999',
      });

      // 1. Verify result shape returned to client
      expect(result.ok).toBe(true);
      expect(result.reference).toBe('YDP-2026-9876');
      expect(result.statusCode).toBe(201);

      // 2. Verify target URL and HTTP method
      expect(capturedUrl).toBe('https://hms.yashdeeppalace.com/api/bookings/new');
      expect(capturedMethod).toBe('POST');

      // 3. Verify security headers
      expect(capturedHeaders['Authorization']).toBe('Bearer secret-hms-bearer-token');
      expect(capturedHeaders['Content-Type']).toBe('application/json');
      expect(capturedHeaders['X-Client-Source']).toBe('yashdeep-web');

      // 4. Verify sanitization was applied
      expect(capturedBody.guestName).toBe('Vikram Singh');
      expect(capturedBody.email).toBe('vikram@example.com');
      expect(capturedBody.phone).toBe('+919876543210');
      expect(capturedBody.specialRequests).toBe('High floor with quiet view alert("xss")');

      // 5. Verify payload fields and snake_case compatibility aliases
      expect(capturedBody.checkIn).toBe('2026-12-10');
      expect(capturedBody.checkOut).toBe('2026-12-12');
      expect(capturedBody.adults).toBe(2);
      expect(capturedBody.children).toBe(1);
      expect(capturedBody.rooms).toBe(1);
      expect(capturedBody.roomPreference).toBe('Deluxe Room');
      expect(capturedBody.source).toBe('website');
      expect(capturedBody.check_in).toBe('2026-12-10');
      expect(capturedBody.check_out).toBe('2026-12-12');
      expect(capturedBody.room_preference).toBe('Deluxe Room');
      expect(capturedBody.guest_name).toBe('Vikram Singh');
    });

    it('extracts booking reference from nested response shapes', async () => {
      // Test alternative response shape: { booking: { id: "REF-777" } }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          booking: {
            id: 'REF-777',
            status: 'confirmed',
          },
        }),
      });

      const res = await hmsSubmitBooking({
        guest: { name: 'Priya Sharma', email: 'priya@example.com', phone: '+919876543210' },
        stay: { checkIn: '2026-12-01', checkOut: '2026-12-03', adults: 2, children: 0, rooms: 1 },
      });

      expect(res.ok).toBe(true);
      expect(res.reference).toBe('REF-777');
    });

    it('handles HMS API error response gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ error: 'Selected room is sold out for these dates' }),
      });

      const res = await hmsSubmitBooking({
        guest: { name: 'Raj Kumar', email: 'raj@example.com', phone: '+919876543210' },
        stay: { checkIn: '2026-12-25', checkOut: '2026-12-27', adults: 2, children: 0, rooms: 1, room: 'Luxury Double Room' },
      });

      expect(res.ok).toBe(false);
      expect(res.statusCode).toBe(409);
      expect(res.message).toBe('Selected room is sold out for these dates');
    });

    it('handles HMS network timeout gracefully', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      global.fetch = vi.fn().mockRejectedValue(abortError);

      const res = await hmsSubmitBooking({
        guest: { name: 'Test Guest', email: 'test@example.com', phone: '+919876543210' },
        stay: { checkIn: '2026-12-01', checkOut: '2026-12-02', adults: 1, children: 0, rooms: 1 },
      });

      expect(res.ok).toBe(false);
      expect(res.statusCode).toBe(504);
      expect(res.message).toContain('HMS request timed out');
    });
  });
});
