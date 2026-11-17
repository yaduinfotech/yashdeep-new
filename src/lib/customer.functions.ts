import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { emailSchema, guestSchema, staySchema } from "./booking-rules";
import { validateStay, localToday } from "./hotel";

export const sendEmailCode = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: emailSchema,
      name: z.string().trim().min(2).max(100),
      signup: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();
    try {
      const { sendOtpChallenge } = await import("./api-otp.server");
      const res = await sendOtpChallenge(undefined, email, "email", {
        name: data.name,
        signup: data.signup,
      });
      setResponseHeader("Cache-Control", "no-store");
      return res;
    } catch (e: unknown) {
      const err = e as Error;
      return {
        ok: false,
        message: err?.message || "Unable to send verification code. Please try again.",
      };
    }
  });

export const verifyEmailCode = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: emailSchema,
      code: z
        .string()
        .trim()
        .regex(/^\d{6,8}$/),
    }),
  )
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();
    try {
      const { verifyOtpChallenge } = await import("./api-otp.server");
      const res = await verifyOtpChallenge(undefined, email, "email", data.code);

      setResponseHeader("Cache-Control", "no-store");
      const confirmedAt = new Date().toISOString();
      const displayName = res.name || email.split("@")[0];

      return {
        ok: true,
        message: res.message || "Email verified.",
        verificationToken: res.verificationToken,
        session: {
          user: {
            id: res.verificationToken,
            email,
            user_metadata: { display_name: displayName },
            email_confirmed_at: confirmedAt,
          },
        },
      };
    } catch (e: unknown) {
      const err = e as Error;
      return {
        ok: false,
        message: err?.message || "The verification code is invalid or expired.",
      };
    }
  });

export { sendMobileOtp as requestMobileCode } from "./mobile.functions";

export const googleOAuthSignup = createServerFn({ method: "POST" })
  .validator(
    z.object({
      accessToken: z.string().min(1, "Access token is required"),
    }),
  )
  .handler(async ({ data }) => {
    const accessToken = data.accessToken.trim();

    let googleProfile:
      | {
          id?: string;
          email?: string;
          name?: string;
          picture?: string;
          verifiedEmail?: boolean;
        }
      | undefined = undefined;

    const { hmsGoogleOAuthSignup } = await import("./hms-gateway.server");
    const hmsRes = await hmsGoogleOAuthSignup({
      accessToken: accessToken as string,
      profile: googleProfile as any,
    });

    if (!hmsRes.ok) {
      throw new Error(hmsRes.message || "Failed to sign up with Google via HMS API.");
    }

    const email = hmsRes.user?.email || googleProfile?.email || "";
    const name = hmsRes.user?.name || googleProfile?.name || email.split("@")[0] || "Guest";
    const id = hmsRes.user?.id || googleProfile?.id || hmsRes.verificationToken || email;
    const token = hmsRes.verificationToken || hmsRes.token || "";
    if (token && email) {
      const { verifiedTokenStore } = await import("./api-otp.server");
      verifiedTokenStore.set(token, {
        email,
        expiresAt: Date.now() + 20 * 60 * 1000,
      });
    }

    setResponseHeader("Cache-Control", "no-store");
    const confirmedAt = new Date().toISOString();

    return {
      ok: true,
      message: hmsRes.message || "Signed in with Google successfully.",
      verificationToken: token,
      session: {
        user: {
          id,
          email,
          user_metadata: {
            display_name: name,
            ...(googleProfile?.picture ? { avatar_url: googleProfile.picture } : {}),
          },
          email_confirmed_at: confirmedAt,
        },
      },
    };
  });

import crypto from "node:crypto";

export const submitBookingRequest = createServerFn({ method: "POST" })
  .validator(
    z.object({
      stay: staySchema,
      guest: guestSchema,
      verificationToken: z.string().optional(),
      isLoggedIn: z.boolean().optional(),
      couponCode: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const today = localToday();
    const problem = validateStay(data.stay, today);
    if (problem) throw new Error(problem);

    const { verifiedTokenStore, isPhoneVerificationTokenValid, isEmailVerificationTokenValid } =
      await import("./api-otp.server");

    let token =
      data.verificationToken ||
      verifiedTokenStore.getTokenFor(data.guest.email) ||
      verifiedTokenStore.getTokenFor(data.guest.phone) ||
      "";

    // If user is already logged in on the portal, register a session token so OTP isn't needed
    if (data.isLoggedIn && data.guest.email) {
      if (!token || token.startsWith("session:")) {
        token = token || `session_${crypto.randomUUID()}`;
      }
      verifiedTokenStore.set(token, {
        email: data.guest.email.toLowerCase(),
        phone: data.guest.phone,
        expiresAt: Date.now() + 20 * 60 * 1000,
      });
    } else {
      const isEmailValid = isEmailVerificationTokenValid(data.guest.email, token);
      const isPhoneValid = isPhoneVerificationTokenValid(data.guest.phone, token);

      if (!isEmailValid && !isPhoneValid) {
        throw new Error(
          "Verification token is invalid or expired. Please verify your email or mobile number.",
        );
      }
    }

    const { hmsSubmitBooking } = await import("./hms-gateway.server");
    const hmsResult = await hmsSubmitBooking({
      guest: data.guest,
      stay: data.stay,
      couponCode: data.couponCode || "",
      verificationToken: token,
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
