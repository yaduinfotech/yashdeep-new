import type { Stay } from "./hotel";

export const BOOKING_DRAFT_KEY = "yashdeep-booking-draft";
export const BOOKING_DRAFT_COOKIE = "ydp_booking_draft";

// 36 hours TTL: 36 * 60 * 60 * 1000 = 129,600,000 ms
export const BOOKING_DRAFT_TTL_MS = 36 * 60 * 60 * 1000;
export const BOOKING_DRAFT_COOKIE_MAX_AGE = 36 * 60 * 60; // 129,600 seconds

export interface BookingGuestData {
  name: string;
  email: string;
  phone: string;
  requests: string;
}

export interface BookingCouponData {
  code: string;
  discountPercent: number;
}

export interface BookingDraftData {
  step: number;
  stay: Stay;
  guest: BookingGuestData;
  appliedCoupon?: BookingCouponData | null;
}

export interface StoredBookingDraft extends BookingDraftData {
  savedAt: number;
  expiresAt: number;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie.match(
      new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"),
    );
    return match ? decodeURIComponent(match[1] || "") : null;
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`;
  } catch {
    // Ignore cookie write errors if cookies are blocked
  }
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
  } catch {
    // Ignore cookie deletion errors
  }
}

/**
 * Checks whether a booking draft has any meaningful customer input worth persisting.
 */
export function hasMeaningfulBookingData(data: BookingDraftData): boolean {
  if (data.step > 1) return true;
  if (data.stay.checkIn || data.stay.checkOut || data.stay.room) return true;
  if (data.guest.name || data.guest.phone || data.guest.email || data.guest.requests) return true;
  if (data.appliedCoupon) return true;
  return false;
}

/**
 * Saves customer booking progress to both localStorage and cookie with a 36-hour TTL.
 */
export function saveBookingDraft(data: BookingDraftData): void {
  if (typeof window === "undefined") return;
  if (!hasMeaningfulBookingData(data)) return;

  const now = Date.now();
  const stored: StoredBookingDraft = {
    step: Math.min(Math.max(data.step, 1), 3),
    stay: {
      checkIn: data.stay.checkIn ?? "",
      checkOut: data.stay.checkOut ?? "",
      adults: data.stay.adults ?? 2,
      children: data.stay.children ?? 0,
      rooms: data.stay.rooms ?? 1,
      room: data.stay.room ?? "",
    },
    guest: {
      name: data.guest.name ?? "",
      email: data.guest.email ?? "",
      phone: data.guest.phone ?? "",
      requests: data.guest.requests ?? "",
    },
    appliedCoupon: data.appliedCoupon ?? null,
    savedAt: now,
    expiresAt: now + BOOKING_DRAFT_TTL_MS,
  };

  const serialized = JSON.stringify(stored);

  try {
    localStorage.setItem(BOOKING_DRAFT_KEY, serialized);
  } catch {
    // Ignore localStorage write failures (e.g. private mode quota)
  }

  setCookie(BOOKING_DRAFT_COOKIE, serialized, BOOKING_DRAFT_COOKIE_MAX_AGE);
}

/**
 * Loads the active booking draft from localStorage or cookie.
 * If expired (> 36 hours) or corrupted, clears it and returns null.
 */
export function loadBookingDraft(): StoredBookingDraft | null {
  if (typeof window === "undefined") return null;

  let raw: string | null = null;
  try {
    raw = localStorage.getItem(BOOKING_DRAFT_KEY);
  } catch {
    raw = null;
  }

  if (!raw) {
    raw = getCookie(BOOKING_DRAFT_COOKIE);
  }

  if (!raw) return null;

  try {
    const draft: StoredBookingDraft = JSON.parse(raw);
    const now = Date.now();

    // Verify expiration (36 hours TTL)
    if (!draft.expiresAt || now > draft.expiresAt) {
      clearBookingDraft();
      return null;
    }

    // Verify basic structure
    if (!draft.stay || !draft.guest || typeof draft.step !== "number") {
      clearBookingDraft();
      return null;
    }

    // Clamp step to 1-3
    draft.step = Math.min(Math.max(draft.step, 1), 3);

    return draft;
  } catch {
    clearBookingDraft();
    return null;
  }
}

/**
 * Clears any saved booking draft from both localStorage and cookie.
 */
export function clearBookingDraft(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(BOOKING_DRAFT_KEY);
  } catch {
    // Ignore localStorage cleanup errors
  }

  deleteCookie(BOOKING_DRAFT_COOKIE);
}
