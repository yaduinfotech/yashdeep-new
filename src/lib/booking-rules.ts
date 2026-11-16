import { z } from "zod";
export const FRONT_DESK_PROMPT_MS = 40_000;
export const SIGNUP_DISCOUNT_PERCENT = 10;
export const LIMITS = {
  email: { max: 3, seconds: 900 },
  verify: { max: 5, seconds: 900 },
  booking: { max: 3, seconds: 3600 },
};
export const emailSchema = z
  .string()
  .trim()
  .email()
  .max(255)
  .transform((v) => v.toLowerCase());
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()-]/g, ""))
  .transform((v) => (/^\d{10}$/.test(v) ? `+91${v}` : v))
  .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Enter a valid mobile number with country code."));
export const guestSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  phone: phoneSchema,
  requests: z.string().trim().max(1500),
});
export const staySchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().int().min(1).max(4),
  children: z.number().int().min(0).max(4),
  rooms: z.number().int().min(1).max(4),
  room: z.string().max(100),
});
export function hasVerifiedContacts(
  user: { email?: string; email_confirmed_at?: string },
  email: string,
  phoneVerified: boolean,
) {
  return Boolean(
    user.email_confirmed_at && user.email?.toLowerCase() === email.toLowerCase() && phoneVerified,
  );
}
