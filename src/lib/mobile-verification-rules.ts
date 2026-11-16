import { phoneSchema } from "./booking-rules";

export const verificationPhoneSchema = phoneSchema.refine(
  (phone) => /^\+91\d{10}$/.test(phone),
  "SMS verification is available only for Indian (+91) mobile numbers.",
);
export function mobileVerificationParameters(phone: string) {
  return new URLSearchParams({
    To: verificationPhoneSchema.parse(phone),
    Channel: "sms",
    RiskCheck: "enable",
  });
}
export const MOBILE_SEND_LIMIT = { max: 3, seconds: 900 };
export const MOBILE_CHECK_LIMIT = { max: 5, seconds: 900 };
export function approvedMobileCheck(
  result: { status?: string; valid?: boolean; to?: string },
  phone: string,
) {
  return result.status === "approved" && result.valid === true && result.to === phone;
}
