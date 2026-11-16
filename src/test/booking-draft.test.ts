import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BOOKING_DRAFT_KEY,
  BOOKING_DRAFT_COOKIE,
  BOOKING_DRAFT_TTL_MS,
  saveBookingDraft,
  loadBookingDraft,
  clearBookingDraft,
  hasMeaningfulBookingData,
} from "@/lib/booking-draft";

describe("Booking Draft 36-Hour Persistence (LocalStorage & Cookie)", () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    });

    // Mock document.cookie
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("correctly calculates 36 hours TTL", () => {
    expect(BOOKING_DRAFT_TTL_MS).toBe(36 * 60 * 60 * 1000);
    expect(BOOKING_DRAFT_TTL_MS).toBe(129600000);
  });

  it("detects meaningful booking data accurately", () => {
    expect(
      hasMeaningfulBookingData({
        step: 1,
        stay: { checkIn: "", checkOut: "", adults: 2, children: 0, rooms: 1, room: "" },
        guest: { name: "", email: "", phone: "", requests: "" },
      }),
    ).toBe(false);

    expect(
      hasMeaningfulBookingData({
        step: 2,
        stay: { checkIn: "", checkOut: "", adults: 2, children: 0, rooms: 1, room: "" },
        guest: { name: "", email: "", phone: "", requests: "" },
      }),
    ).toBe(true);

    expect(
      hasMeaningfulBookingData({
        step: 1,
        stay: {
          checkIn: "2026-12-01",
          checkOut: "2026-12-03",
          adults: 2,
          children: 0,
          rooms: 1,
          room: "Deluxe Room",
        },
        guest: { name: "", email: "", phone: "", requests: "" },
      }),
    ).toBe(true);
  });

  it("saves booking draft to localStorage and cookie with 36-hour expiry", () => {
    const fakeNow = 1700000000000;
    vi.spyOn(Date, "now").mockReturnValue(fakeNow);

    const testDraft = {
      step: 2,
      stay: {
        checkIn: "2026-12-01",
        checkOut: "2026-12-03",
        adults: 2,
        children: 1,
        rooms: 1,
        room: "Deluxe Room",
      },
      guest: {
        name: "Rajesh Sharma",
        email: "rajesh@example.com",
        phone: "+919876543210",
        requests: "High floor please",
      },
      appliedCoupon: {
        code: "WELCOME10",
        discountPercent: 10,
      },
    };

    saveBookingDraft(testDraft);

    // Verify localStorage
    expect(mockStorage[BOOKING_DRAFT_KEY]).toBeDefined();
    const stored = JSON.parse(mockStorage[BOOKING_DRAFT_KEY]);
    expect(stored.step).toBe(2);
    expect(stored.guest.name).toBe("Rajesh Sharma");
    expect(stored.stay.checkIn).toBe("2026-12-01");
    expect(stored.appliedCoupon?.code).toBe("WELCOME10");
    expect(stored.savedAt).toBe(fakeNow);
    expect(stored.expiresAt).toBe(fakeNow + 36 * 60 * 60 * 1000);

    // Verify cookie
    expect(document.cookie).toContain(BOOKING_DRAFT_COOKIE);
  });

  it("loads valid draft within 36 hours and preserves left-off step", () => {
    const fakeNow = 1700000000000;
    vi.spyOn(Date, "now").mockReturnValue(fakeNow);

    const testDraft = {
      step: 3,
      stay: {
        checkIn: "2026-12-10",
        checkOut: "2026-12-12",
        adults: 2,
        children: 0,
        rooms: 1,
        room: "Deluxe Room With Breakfast",
      },
      guest: {
        name: "Priya Singh",
        email: "priya@example.com",
        phone: "+919811223344",
        requests: "Vegetarian breakfast",
      },
    };

    saveBookingDraft(testDraft);

    // Simulate returning 24 hours later (24h < 36h)
    vi.spyOn(Date, "now").mockReturnValue(fakeNow + 24 * 60 * 60 * 1000);

    const loaded = loadBookingDraft();
    expect(loaded).not.toBeNull();
    expect(loaded?.step).toBe(3);
    expect(loaded?.guest.name).toBe("Priya Singh");
    expect(loaded?.stay.room).toBe("Deluxe Room With Breakfast");
  });

  it("expires and deletes draft when returning after 36 hours", () => {
    const fakeNow = 1700000000000;
    vi.spyOn(Date, "now").mockReturnValue(fakeNow);

    const testDraft = {
      step: 2,
      stay: {
        checkIn: "2026-12-01",
        checkOut: "2026-12-03",
        adults: 2,
        children: 0,
        rooms: 1,
        room: "Deluxe Room",
      },
      guest: {
        name: "Vikram Mehta",
        email: "vikram@example.com",
        phone: "+919876543210",
        requests: "",
      },
    };

    saveBookingDraft(testDraft);

    // Simulate returning 37 hours later (37h > 36h)
    vi.spyOn(Date, "now").mockReturnValue(fakeNow + 37 * 60 * 60 * 1000);

    const loaded = loadBookingDraft();
    expect(loaded).toBeNull();

    // Verify draft was cleared from storage
    expect(mockStorage[BOOKING_DRAFT_KEY]).toBeUndefined();
  });

  it("clears draft manually via clearBookingDraft", () => {
    saveBookingDraft({
      step: 2,
      stay: {
        checkIn: "2026-12-01",
        checkOut: "2026-12-03",
        adults: 2,
        children: 0,
        rooms: 1,
        room: "Deluxe Room",
      },
      guest: { name: "Test User", email: "test@example.com", phone: "+919876543210", requests: "" },
    });

    expect(loadBookingDraft()).not.toBeNull();
    clearBookingDraft();
    expect(loadBookingDraft()).toBeNull();
  });
});
