import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { emailSchema } from "./booking-rules";

export const enquiryInputSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(150),
  email: emailSchema,
  phone: z.string().trim(),
  type: z.enum([
    "General enquiry",
    "Restaurant enquiry",
    "Meeting or event enquiry",
    "Reservation enquiry",
  ]),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(2000),
  verificationToken: z.string().optional(),
});

export const feedbackInputSchema = z.object({
  guestName: z.string().trim().min(2, "Name must be at least 2 characters").max(150),
  email: emailSchema.optional(),
  rating: z.number().int().min(1).max(5),
  category: z.string().trim().max(100).optional(),
  comments: z.string().trim().min(5, "Comments must be at least 5 characters").max(2000),
});

/**
 * Server function: Handles guest enquiries (general, room, dining, meetings)
 * and dispatches them through the centralized HMS gateway after email OTP verification.
 */
export const submitEnquiry = createServerFn({ method: "POST" })
  .validator(enquiryInputSchema)
  .handler(async ({ data }) => {
    const { hmsSubmitEnquiry } = await import("./hms-gateway.server");
    const res = await hmsSubmitEnquiry({
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      verificationToken: data.verificationToken || "",
      // Aliases
      type: data.type,
    });

    if (!res.ok) {
      throw new Error(res.message || "Unable to submit feedback.");
    }

    return {
      ok: true,
      reference: res.reference || "RECEIVED",
    };
  });

/**
 * Server function: Handles guest reviews and feedback
 * and dispatches them through the centralized HMS gateway.
 */
export const submitFeedback = createServerFn({ method: "POST" })
  .validator(feedbackInputSchema)
  .handler(async ({ data }) => {
    const { hmsSubmitFeedback } = await import("./hms-gateway.server");
    const res = await hmsSubmitFeedback({
      guestName: data.guestName,
      email: data.email || "",
      rating: data.rating || 5,
      category: data.category || "",
      comments: data.comments,
    });

    if (!res.ok) {
      throw new Error(res.message || "Unable to submit feedback.");
    }

    return {
      ok: true,
      reference: res.reference || "RECEIVED",
    };
  });

/**
 * Server function: Requests an OTP code for mobile verification via API (no ).
 */
export const requestMobileOtpApi = createServerFn({ method: "POST" })
  .validator(z.object({ phone: z.string().trim().min(8).max(25) }))
  .handler(async ({ data }) => {
    const { sendOtpChallenge } = await import("./api-otp.server");
    return sendOtpChallenge(data.phone);
  });

/**
 * Server function: Verifies the 6-digit OTP code and returns a verification token.
 */
export const verifyMobileOtpApi = createServerFn({ method: "POST" })
  .validator(
    z.object({
      phone: z.string().trim().min(8).max(25),
      code: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "Enter a valid 6-digit code."),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const { verifyOtpChallenge } = await import("./api-otp.server");
      return await verifyOtpChallenge(data.phone, data.code);
    } catch (e: unknown) {
      const err = e as Error;
      return {
        ok: false,
        phone: data.phone,
        verificationToken: "",
        message: err?.message || "Invalid OTP code",
      };
    }
  });

/**
 * Server function: Validates an email coupon code via HMS API.
 */
export const validateCouponApi = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: z.string().trim().min(2, "Enter a valid coupon code").max(50),
      email: z.string().trim().email().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { hmsValidateCoupon } = await import("./hms-gateway.server");
    return hmsValidateCoupon(data.code, data.email);
  });
