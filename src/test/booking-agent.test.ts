import { describe, expect, it } from "vitest";
import { prepareAgentStay } from "@/lib/booking-agent-rules";
import {
  approvedMobileCheck,
  verificationPhoneSchema,
  mobileVerificationParameters,
  MOBILE_SEND_LIMIT,
  MOBILE_CHECK_LIMIT,
} from "@/lib/mobile-verification-rules";
const stay = {
  checkIn: "2026-12-01",
  checkOut: "2026-12-03",
  adults: 2,
  children: 0,
  rooms: 1,
  room: "Deluxe Room",
};
describe("Booking agent safeguards", () => {
  it("restricts verification destinations to India before sending", () => {
    expect(verificationPhoneSchema.parse("8222020699")).toBe("+918222020699");
    expect(verificationPhoneSchema.parse("+91 82220 20699")).toBe("+918222020699");
    for (const phone of ["+14155552671", "+447911123456", "+971501234567", "+9182220206990"]) {
      expect(verificationPhoneSchema.safeParse(phone).success).toBe(false);
      expect(() => mobileVerificationParameters(phone)).toThrow();
    }
  });
  it("explicitly enables Twilio risk checks on every SMS verification send", () => {
    expect(Object.fromEntries(mobileVerificationParameters("+918222020699"))).toEqual({
      To: "+918222020699",
      Channel: "sms",
      RiskCheck: "enable",
    });
  });
  it("prepares exact stay details without a reservation status", () => {
    expect(prepareAgentStay(stay, "2026-11-15")).toEqual({ ok: true, stay });
  });
  it("rejects impossible dates", () => {
    expect(prepareAgentStay({ ...stay, checkIn: "2026-02-30" }, "2026-01-01").ok).toBe(false);
  });
  it("rejects fabricated room types", () => {
    expect(prepareAgentStay({ ...stay, room: "Presidential Suite" }, "2026-11-15").ok).toBe(false);
  });
  it("requires provider approval, valid code and exact mobile", () => {
    expect(
      approvedMobileCheck(
        { status: "approved", valid: true, to: "+918222020699" },
        "+918222020699",
      ),
    ).toBe(true);
    expect(
      approvedMobileCheck({ status: "pending", valid: true, to: "+918222020699" }, "+918222020699"),
    ).toBe(false);
    expect(
      approvedMobileCheck(
        { status: "approved", valid: true, to: "+918222020599" },
        "+918222020699",
      ),
    ).toBe(false);
  });
  it("limits mobile requests to three and checks to five per 15 minutes", () => {
    expect(MOBILE_SEND_LIMIT).toEqual({ max: 3, seconds: 900 });
    expect(MOBILE_CHECK_LIMIT).toEqual({ max: 5, seconds: 900 });
  });
});
