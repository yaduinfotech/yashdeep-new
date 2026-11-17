import crypto from "node:crypto";
import { sanitizePhone } from "./sanitizer";

interface OtpEntry {
  code: string;
  name?: string;
  expiresAt: number;
  attempts: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Single shared in-memory stores for all OTP challenges & rate limits
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
      phone: data.phone || "",
      email: data.email || "",
      token,
      createdAt: now,
      expiresAt: data.expiresAt || now + 20 * 60 * 1000, // 20 minutes default
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
export const verifiedTokens = verifiedTokenStore;

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const TOKEN_EXPIRY_MS = 20 * 60 * 1000; // 20 minutes
const MAX_OTP_ATTEMPTS = 5;
const MAX_SENDS_PER_WINDOW = 3;
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(identifier: string): boolean {
  const key = identifier.trim().toLowerCase();
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_SENDS_PER_WINDOW) {
    return false;
  }
  entry.count += 1;
  return true;
}

function generateLocalOtp(identifier: string, name?: string): string {
  const code = String(crypto.randomInt(100000, 1000000));
  otpStore.set(identifier.trim().toLowerCase(), {
    code,
    name,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  });
  return code;
}

function verifyLocalOtp(identifier: string, code: string): { valid: boolean; name?: string } {
  const key = identifier.trim().toLowerCase();
  const entry = otpStore.get(key);
  if (!entry) return { valid: false };

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(key);
    throw new Error("OTP code has expired. Please request a new one.");
  }

  entry.attempts += 1;
  if (entry.attempts > MAX_OTP_ATTEMPTS) {
    otpStore.delete(key);
    throw new Error("Too many failed attempts. Please request a new OTP.");
  }

  if (entry.code !== code) {
    return { valid: false };
  }

  const savedName = entry.name;
  otpStore.delete(key);
  return { valid: true, name: savedName };
}

/**
 * Fallback email sender using environment variables (Nodemailer SMTP or Resend HTTP API).
 */
async function sendAppFallbackEmailOtp(email: string, code: string, name?: string): Promise<void> {
  const fromAddress =
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER ||
    "no-reply@yashdeeppalace.com";

  const greeting = name ? `Hello ${name},` : "Hello Guest,";
  const subject = `${code} is your Yashdeep Palace verification code`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="margin-top: 0; color: #111827;">Yashdeep Palace</h2>
      <p style="color: #374151; font-size: 14px;">${greeting}</p>
      <p style="color: #374151; font-size: 14px;">Use the verification code below to confirm your booking or account:</p>
      <div style="margin: 24px 0; padding: 16px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; text-align: center;">
        <span style="font-family: monospace; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #92400e;">${code}</span>
      </div>
      <p style="color: #6b7280; font-size: 12px;">This code is valid for 10 minutes. If you did not request this code, you can safely ignore this email.</p>
    </div>
  `;
  const text = `${greeting} Your Yashdeep Palace verification code is ${code}. Valid for 10 minutes.`;

  const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
  const smtpSecure =
    process.env.SMTP_SECURE === "true" || process.env.EMAIL_SECURE === "true" || smtpPort === 465;

  if (smtpHost && smtpUser && smtpPass) {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
      tls: {
        rejectUnauthorized: false, // Prevents TLS cert mismatch errors on shared cPanel hosts
      },
    });

    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject,
      text,
      html,
    });
    return;
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.message || `Resend email failed with status ${res.status}`);
    }
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(`[DEV EMAIL OTP FALLBACK] To: ${email} | Code: ${code}`);
    return;
  }

  throw new Error("Email OTP service is not configured. Please check SMTP env settings.");
}

export async function sendOtpChallenge(
  rawPhone?: string,
  rawEmail?: string,
  otpType: "phone" | "email" = "email",
  options?: { name?: string; signup?: boolean },
): Promise<{ ok: boolean; message: string }> {
  if (otpType === "phone") {
    const phone = sanitizePhone(rawPhone);
    if (!/^\+?[1-9]\d{7,14}$/.test(phone)) {
      throw new Error("Please enter a valid mobile number with country code.");
    }

    if (!checkRateLimit(phone)) {
      throw new Error("Too many OTP requests for this number. Please wait 15 minutes.");
    }

    const { hmsSendMobileOtp } = await import("./hms-gateway.server");
    const hmsRes = await hmsSendMobileOtp(phone);
    if (!hmsRes.ok) {
      throw new Error(hmsRes.message || "Could not send OTP to your mobile number.");
    }

    return {
      ok: true,
      message: hmsRes.message || `OTP sent to ${phone}. Valid for 10 minutes.`,
    };
  } else {
    const email = rawEmail?.trim().toLowerCase();

    if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      throw new Error("Please enter a valid email address.");
    }

    if (!checkRateLimit(email)) {
      throw new Error("Too many OTP requests for this email address. Please wait 15 minutes.");
    }

    // 1. Try HMS Gateway first
    try {
      const { hmsSendEmailOtp } = await import("./hms-gateway.server");
      const hmsRes = await hmsSendEmailOtp(email, options?.name, options?.signup);
      if (hmsRes.ok) {
        otpStore.delete(email);
        return {
          ok: true,
          message: hmsRes.message || `Check your inbox for a verification code sent to ${email}.`,
        };
      }
    } catch (e) {
      console.warn("[Email OTP] HMS send failed, falling back to app SMTP:", e);
    }

    // 2. Fallback: Generate OTP in app & send via env SMTP/API settings
    const fallbackCode = generateLocalOtp(email, options?.name);
    await sendAppFallbackEmailOtp(email, fallbackCode, options?.name);

    return {
      ok: true,
      message: `Check your inbox for a verification code sent to ${email}.`,
    };
  }
}

/**
 * Verifies an OTP code and returns the verification token.
 * Checks local app fallback store first (if an app OTP was issued), then HMS API Gateway.
 */
export async function verifyOtpChallenge(
  rawPhone?: string,
  rawEmail?: string,
  otpType: "phone" | "email" | string = "email",
  code?: string,
): Promise<{
  ok: boolean;
  verificationToken: string;
  phone: string;
  email: string;
  name?: string;
  message: string;
}> {
  const phone = rawPhone ? sanitizePhone(rawPhone) : "";
  const email = rawEmail?.trim().toLowerCase() ?? "";
  const cleanCode = code?.trim() ?? "";

  if (!/^\d{6,8}$/.test(cleanCode)) {
    throw new Error("Please enter a valid OTP code.");
  }

  if (otpType === "phone") {
    if (phone && otpStore.has(phone.toLowerCase())) {
      const local = verifyLocalOtp(phone, cleanCode);
      if (local.valid) {
        const token = crypto.randomUUID();
        verifiedTokenStore.set(token, {
          phone,
          email,
          expiresAt: Date.now() + TOKEN_EXPIRY_MS,
        });
        return {
          ok: true,
          verificationToken: token,
          phone,
          email,
          name: local.name,
          message: "OTP Verified",
        };
      }
      throw new Error("Invalid OTP code");
    }

    const { hmsVerifyMobileOtp } = await import("./hms-gateway.server");
    const hmsRes = await hmsVerifyMobileOtp(phone, cleanCode);
    if (hmsRes.ok && hmsRes.verificationToken) {
      verifiedTokenStore.set(hmsRes.verificationToken, {
        phone,
        email,
        expiresAt: Date.now() + TOKEN_EXPIRY_MS,
      });
      return {
        ok: true,
        verificationToken: hmsRes.verificationToken,
        phone,
        email,
        message: hmsRes.message || "OTP Verified",
      };
    }
    throw new Error(hmsRes.message || "Invalid OTP code");
  } else if (otpType === "email") {
    // 1. If a local fallback OTP was issued for this email, verify against otpStore
    if (email && otpStore.has(email)) {
      const local = verifyLocalOtp(email, cleanCode);
      if (local.valid) {
        const token = crypto.randomUUID();
        verifiedTokenStore.set(token, {
          phone,
          email,
          expiresAt: Date.now() + TOKEN_EXPIRY_MS,
        });
        return {
          ok: true,
          verificationToken: token,
          phone,
          email,
          name: local.name,
          message: "Email verified.",
        };
      }
      throw new Error("Invalid verification code");
    }

    // 2. Otherwise verify via HMS API Gateway
    const { hmsVerifyEmailOtp } = await import("./hms-gateway.server");
    const hmsRes = await hmsVerifyEmailOtp(email, cleanCode);
    if (hmsRes.ok && hmsRes.verificationToken) {
      verifiedTokenStore.set(hmsRes.verificationToken, {
        phone,
        email,
        expiresAt: Date.now() + TOKEN_EXPIRY_MS,
      });
      return {
        ok: true,
        verificationToken: hmsRes.verificationToken,
        phone,
        email,
        message: hmsRes.message || "Email verified.",
      };
    }
    throw new Error(hmsRes.message || "Invalid or expired verification code.");
  } else {
    throw new Error("Invalid OTP verification type");
  }
}

export function isPhoneVerificationTokenValid(rawPhone: string, token?: string): boolean {
  if (!token) return false;
  const phone = sanitizePhone(rawPhone);
  return verifiedTokenStore.isTokenValid(token, phone);
}

export function isEmailVerificationTokenValid(rawEmail: string, token?: string): boolean {
  if (!token) return false;
  const email = rawEmail.trim().toLowerCase();
  return verifiedTokenStore.isTokenValid(token, email);
}
