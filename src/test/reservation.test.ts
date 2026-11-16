import { describe, expect, it } from "vitest";
import { validateStay, enquiryMail, type Stay } from "@/lib/hotel";
const stay: Stay = {
  checkIn: "2026-12-01",
  checkOut: "2026-12-02",
  adults: 2,
  children: 0,
  rooms: 1,
  room: "",
};
describe("Reservation enquiry rules", () => {
  it("requires departure after arrival", () =>
    expect(validateStay({ ...stay, checkOut: "2026-12-01" }, "2026-11-15")).toBe(
      "Check-out must be after check-in.",
    ));
  it("does not allow a past check-in", () =>
    expect(validateStay({ ...stay, checkIn: "2026-11-14" }, "2026-11-15")).toBe(
      "Check-in cannot be in the past.",
    ));
  it("accepts a valid stay without confirming availability", () =>
    expect(validateStay(stay, "2026-11-15")).toBeUndefined());
  it("only prepares a reception email, not a booking confirmation", () =>
    expect(enquiryMail("Reservation enquiry", "Guest & dates")).toBe(
      "mailto:reception@yashdeeppalace.com?subject=Reservation%20enquiry&body=Guest%20%26%20dates",
    ));
});
