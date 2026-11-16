import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verificationPhoneSchema } from "./mobile-verification-rules";

export const sendMobileOtp = createServerFn({ method: "POST" })
  .validator(z.object({ phone: verificationPhoneSchema }))
  .handler(async ({ data }) => {
    const { sendOtpChallenge } = await import("./api-otp.server");
    const result = await sendOtpChallenge(data.phone);
    return { ok: result.ok, message: result.message };
  });

export const checkMobileOtp = createServerFn({ method: "POST" })
  .validator(
    z.object({
      phone: verificationPhoneSchema,
      code: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "Enter a valid 6-digit code."),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const { verifyOtpChallenge } = await import("./api-otp.server");
      const result = await verifyOtpChallenge(data.phone, data.code);
      return { ok: result.ok, phone: result.phone };
    } catch {
      return { ok: false, phone: data.phone };
    }
  });
