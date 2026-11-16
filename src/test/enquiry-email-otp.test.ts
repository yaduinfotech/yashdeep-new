import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleEnquirySubmission } from '@/lib/hms-gateway.server';
import { verifiedTokenStore } from '@/lib/api-otp.server';

describe('Enquiry Submission with Email OTP Verification', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    verifiedTokenStore.clear();
    process.env = {
      ...originalEnv,
      HMS_BASE_URL: 'https://hms.yashdeeppalace.com',
    };
  });

  afterEach(() => {
    verifiedTokenStore.clear();
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('rejects enquiry submission if email has not been verified via OTP', async () => {
    const enquiryData = {
      name: 'Rohan Sharma',
      email: 'rohan@example.com',
      phone: '9876543210',
      type: 'General enquiry' as const,
      message: 'Interested in booking meeting rooms for corporate workshop.',
    };

    // Attempt direct submission without verification token
    await expect(
      handleEnquirySubmission(enquiryData)
    ).rejects.toThrow('Please verify your email address with the OTP code before submitting.');
  });

  it('rejects enquiry submission if verification token is for a different email', async () => {
    verifiedTokenStore.set('vtok_other_user', { email: 'other@example.com' });

    const enquiryData = {
      name: 'Rohan Sharma',
      email: 'rohan@example.com',
      phone: '9876543210',
      type: 'General enquiry' as const,
      message: 'Interested in booking meeting rooms.',
      verificationToken: 'vtok_other_user',
    };

    await expect(
      handleEnquirySubmission(enquiryData)
    ).rejects.toThrow('Please verify your email address with the OTP code before submitting.');
  });

  it('successfully submits enquiry after email is verified via OTP', async () => {
    let capturedUrl = '';
    let capturedBody: any = null;

    global.fetch = vi.fn().mockImplementation(async (url, init) => {
      capturedUrl = String(url);
      capturedBody = JSON.parse(init?.body as string);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          reference: 'ENQ-2026-7890',
        }),
      };
    });

    const email = 'rohan@example.com';
    const name = 'Rohan Sharma';

    // Simulate setting a verified token in verifiedTokenStore (which verifyEmailCode does)
    const verificationToken = 'vtok_email_verified_rohan_123';
    verifiedTokenStore.set(verificationToken, {
      email,
      expiresAt: Date.now() + 20 * 60 * 1000,
    });

    // Submit enquiry with verificationToken
    const submitRes = await handleEnquirySubmission({
      name,
      email,
      phone: '9876543210',
      type: 'General enquiry',
      message: 'Interested in booking meeting rooms for corporate workshop.',
      verificationToken,
    });

    expect(submitRes.ok).toBe(true);
    expect(submitRes.reference).toBe('ENQ-2026-7890');
    expect(capturedUrl).toBe('https://hms.yashdeeppalace.com/api/enquiries/new');
    expect(capturedBody.name).toBe('Rohan Sharma');
    expect(capturedBody.email).toBe('rohan@example.com');
    expect(capturedBody.verificationToken).toBe(verificationToken);
  });
});
