import { error } from 'console';
import { sanitizePhone } from './sanitizer';

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory server challenge stores
const otpStore = new Map<string, OtpEntry>();
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface VerifiedTokenEntry {
  phone?: string;
  email?: string;
  token: string;
  createdAt: number;
  expiresAt: number;
}

export class VerifiedTokenStore {
  private store = new Map<string, VerifiedTokenEntry>();
  private latestToken: string | null = null;

  set(token: string, data: { phone?: string; email?: string; expiresAt?: number }): void {
    const now = Date.now();
    const entry: VerifiedTokenEntry = {
      phone: data.phone || '',
      email: data.email || '',
      token,
      createdAt: now,
      expiresAt: data.expiresAt || (now + 20 * 60 * 1000), // 20 minutes default
    };
    this.store.set(token, entry);
    this.latestToken = token;
  }

  get(token: string): VerifiedTokenEntry | undefined {
    const entry = this.store.get(token);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(token);
      if (this.latestToken === token) this.latestToken = null;
      return undefined;
    }
    return entry;
  }

  has(token: string): boolean {
    return Boolean(this.get(token));
  }

  delete(token: string): boolean {
    if (this.latestToken === token) this.latestToken = null;
    return this.store.delete(token);
  }

  clear(): void {
    this.store.clear();
    this.latestToken = null;
  }

  getLatestToken(): string | undefined {
    if (!this.latestToken) return undefined;
    const entry = this.get(this.latestToken);
    return entry ? entry.token : undefined;
  }

  getTokenFor(identifier: string): string | undefined {
    const clean = identifier.trim().toLowerCase();
    const now = Date.now();
    for (const [token, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(token);
        continue;
      }
      if (
        (entry.phone && entry.phone.toLowerCase() === clean) ||
        (entry.email && entry.email.toLowerCase() === clean)
      ) {
        return token;
      }
    }
    return undefined;
  }

  isTokenValid(token?: string, identifier?: string): boolean {
    if (!token) return false;
    const entry = this.get(token);
    if (!entry) return false;
    if (!identifier) return true;
    const clean = identifier.trim().toLowerCase();
    return (
      (Boolean(entry.phone) && entry.phone!.toLowerCase() === clean) ||
      (Boolean(entry.email) && entry.email!.toLowerCase() === clean)
    );
  }
}

export const verifiedTokenStore = new VerifiedTokenStore();
// Export verifiedTokens alias for backwards compatibility
export const verifiedTokens = verifiedTokenStore;

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const TOKEN_EXPIRY_MS = 20 * 60 * 1000; // 20 minutes
const MAX_SENDS_PER_WINDOW = 3;
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(phone: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(phone);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(phone, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_SENDS_PER_WINDOW) {
    return false;
  }
  entry.count += 1;
  return true;
}

/**
 * Sends an OTP challenge to the guest's mobile phone via HMS API endpoint.
 * Dispatches to /api/otp/mobile/send, with fallback to Twilio or server challenge store.
 */
export async function sendOtpChallenge(rawPhone: string): Promise<{ ok: boolean; message: string }> {
  const phone = sanitizePhone(rawPhone);
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    throw new Error('Please enter a valid mobile number with country code.');
  }

  if (!checkRateLimit(phone)) {
    throw new Error('Too many OTP requests for this number. Please wait 15 minutes.');
  }

  // 1. Dispatch via HMS API Gateway (/api/otp/mobile/send)
  try {
    const { hmsSendMobileOtp } = await import('./hms-gateway.server');
    const hmsRes = await hmsSendMobileOtp(phone);
    if (hmsRes.ok) {
      return {
        ok: true,
        message: hmsRes.message || `OTP sent to ${phone}. Valid for 10 minutes.`,
      };
    }
  } catch (e: any) {
    return {
      ok: false,
      message: e.message || `OTP sent to ${phone}. Valid for 10 minutes.`,
    };
  }
  return {
    ok: false,
    message: `Error Sending OTP.`,
  };
}

/**
 * Verifies an OTP code and generates a verification token.
 * Verifies via HMS API endpoint (/api/otp/mobile/verify), with fallback to server challenge store.
 */
export async function verifyOtpChallenge(
  rawPhone: string,
  code: string
): Promise<{ ok: boolean; phone: string; verificationToken: string, message: string }> {
  const phone = sanitizePhone(rawPhone);
  const cleanCode = code.trim();

  // 1. Verify via HMS API Gateway (/api/otp/mobile/verify)
  try {
    const { hmsVerifyMobileOtp } = await import('./hms-gateway.server');
    const hmsRes = await hmsVerifyMobileOtp(phone, cleanCode);
    if (hmsRes.ok && hmsRes.verificationToken) {
      // Register token in verifiedTokenStore
      verifiedTokenStore.set(hmsRes.verificationToken, {
        phone,
        expiresAt: Date.now() + TOKEN_EXPIRY_MS,
      });
      return {
        ok: true,
        phone,
        verificationToken: hmsRes.verificationToken,
        message: "OTP Verified"
      };
    } else {
      throw new Error(hmsRes.message)
    }
  } catch (e: any) {
    return {
      ok: false,
      phone,
      verificationToken: '',
      message: e.message
    }
  }
}

/**
 * Checks whether a given verification token is valid for the specified phone number.
 */
export function isPhoneVerificationTokenValid(rawPhone: string, token?: string): boolean {
  if (!token) return false;
  const phone = sanitizePhone(rawPhone);
  return verifiedTokenStore.isTokenValid(token, phone);
}

/**
 * Checks whether a given verification token is valid for the specified email address.
 */
export function isEmailVerificationTokenValid(rawEmail: string, token?: string): boolean {
  if (!token) return false;
  const email = rawEmail.trim().toLowerCase();
  return verifiedTokenStore.isTokenValid(token, email);
}
