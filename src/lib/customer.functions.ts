import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { emailSchema, guestSchema, staySchema, LIMITS } from "./booking-rules";
import { validateStay } from "./hotel";

interface EmailOtpEntry {
  code: string;
  name: string;
  expiresAt: number;
  attempts: number;
}

const emailOtpStore = new Map<string, EmailOtpEntry>();
const emailRateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkEmailRateLimit(email: string): boolean {
  const now = Date.now();
  const entry = emailRateLimitStore.get(email);
  if (!entry || now > entry.resetAt) {
    emailRateLimitStore.set(email, { count: 1, resetAt: now + LIMITS.email.seconds * 1000 });
    return true;
  }
  if (entry.count >= LIMITS.email.max) {
    return false;
  }
  entry.count += 1;
  return true;
}

export const sendEmailCode = createServerFn({ method: "POST" })
  .validator(
    z.object({ email: emailSchema, name: z.string().trim().min(2).max(100), signup: z.boolean() }),
  )
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();
    if (!checkEmailRateLimit(email)) {
      return {
        ok: false,
        message: "Too many code requests. Please wait 15 minutes before trying again.",
      };
    }

    // 1. Dispatch via HMS API Gateway (/api/otp/email/send)
    try {
      const { hmsSendEmailOtp } = await import("./hms-gateway.server");
      const hmsRes = await hmsSendEmailOtp(email, data.name, data.signup);
      if (hmsRes.ok) {
        setResponseHeader("Cache-Control", "no-store");
        return {
          ok: true,
          message: hmsRes.message || `Check your inbox for a verification code sent to ${email}.`,
        };
      }
    } catch (e: unknown) {
      const err = e as Error;
      return {
        ok: false,
        message: err?.message || `Check your inbox for a verification code sent to ${email}.`,
      };
    }
  });

export const verifyEmailCode = createServerFn({ method: "POST" })
  .validator(z.object({ email: emailSchema, code: z.string().regex(/^\d{6,8}$/) }))
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();

    // 1. Verify via HMS API Gateway (/api/otp/email/verify)
    try {
      const { hmsVerifyEmailOtp } = await import("./hms-gateway.server");
      const { verifiedTokenStore } = await import("./api-otp.server");
      const hmsRes = await hmsVerifyEmailOtp(email, data.code);
      if (hmsRes.ok) {
        const token = hmsRes.verificationToken || "";
        verifiedTokenStore.set(token, {
          email,
          expiresAt: Date.now() + 20 * 60 * 1000,
        });
        setResponseHeader("Cache-Control", "no-store");
        const confirmedAt = new Date().toISOString();
        return {
          ok: true,
          message: hmsRes.message || "Email verified.",
          verificationToken: token,
          session: {
            user: {
              id: token,
              email,
              user_metadata: { display_name: email.split("@")[0] },
              email_confirmed_at: confirmedAt,
            },
          },
        };
      }
    } catch (e) {
      console.warn("[Email OTP] HMS API verification error, falling back:", e);
    }
  });

export { sendMobileOtp as requestMobileCode } from "./mobile.functions";

export const submitBookingRequest = createServerFn({ method: "POST" })
  .validator(
    z.object({
      stay: staySchema,
      guest: guestSchema,
      verificationToken: z.string(),
      couponCode: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const today = new Date().toISOString().slice(0, 10);
    const problem = validateStay(data.stay, today);
    if (problem) throw new Error(problem);

    if (data.verificationToken) {
      const { isPhoneVerificationTokenValid } = await import("./api-otp.server");
      const valid = isPhoneVerificationTokenValid(data.guest.phone, data.verificationToken);
      if (!valid) {
        throw new Error(
          "Mobile verification token is invalid or expired. Please verify your number.",
        );
      }
    }

    const { hmsSubmitBooking } = await import("./hms-gateway.server");
    const hmsResult = await hmsSubmitBooking({
      guest: data.guest,
      stay: data.stay,
      verificationToken: data.verificationToken,
    });

    if (!hmsResult.ok) {
      throw new Error(hmsResult.message || "HMS automated booking could not be completed.");
    }

    return {
      id:
        hmsResult.reference ||
        `YDP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "confirmed",
    };
  });
