import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hmsValidateCoupon } from "@/lib/hms-gateway.server";
import { calculateStayPricing } from "@/lib/hotel";

describe("API-Driven Coupon Validation & Redemption", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      HMS_BASE_URL: "https://hms.yashdeeppalace.com",
      HMS_BEARER_TOKEN: "test-hms-token",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("1. Coupon Code API Validation", () => {
    it("validates standard welcome coupon code WELCOME10", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          valid: true,
          discountPercent: 10,
          message: "10% Welcome Discount applied!",
        }),
      });

      const res = await hmsValidateCoupon("WELCOME10", "guest@example.com", 2000);
      expect(res.ok).toBe(true);
      expect(res.code).toBe("WELCOME10");
      expect(res.discountPercent).toBe(10);
      expect(res.message).toContain("10%");
    });

    it("validates promotional coupon YDP10 with lowercase input", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          valid: true,
          discountPercent: 10,
        }),
      });

      const res = await hmsValidateCoupon("  ydp10  ", "guest@example.com", 2000);
      expect(res.ok).toBe(true);
      expect(res.code).toBe("YDP10");
      expect(res.discountPercent).toBe(10);
    });

    it("rejects empty coupon code", async () => {
      const res = await hmsValidateCoupon("", "guest@example.com", 2000);
      expect(res.ok).toBe(false);
      expect(res.message).toBe("Please enter a coupon code.");
    });

    it("rejects invalid or unknown coupon codes", async () => {
      // Mock HMS API returning invalid
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ valid: false, message: "Invalid or expired coupon code" }),
      });

      const res = await hmsValidateCoupon("EXPIRED99", "guest@example.com", 2000);
      expect(res.ok).toBe(false);
      expect(res.message).toContain("Invalid or expired coupon code");
    });

    it("validates dynamic coupons dispatched by the HMS cloud endpoint", async () => {
      let capturedUrl = "";
      let capturedBody: any = null;

      global.fetch = vi.fn().mockImplementation(async (url, init) => {
        capturedUrl = String(url);
        capturedBody = JSON.parse(init?.body as string);
        return {
          ok: true,
          status: 200,
          json: async () => ({
            valid: true,
            discountPercent: 10,
            code: "ROYAL10",
          }),
        };
      });

      const res = await hmsValidateCoupon("ROYAL10", "royal@example.com", 2000);
      expect(res.ok).toBe(true);
      expect(res.code).toBe("ROYAL10");
      expect(res.discountPercent).toBe(10);
      expect(capturedUrl).toBe("https://hms.yashdeeppalace.com/api/coupons/validate");
      expect(capturedBody.code).toBe("ROYAL10");
      expect(capturedBody.email).toBe("royal@example.com");
    });
  });

  describe("2. Live Pricing with Conditional Coupon Application", () => {
    const stay = {
      checkIn: "2026-12-01",
      checkOut: "2026-12-03", // 2 nights
      adults: 2,
      children: 0,
      rooms: 1,
      room: "Deluxe Room", // ₹1,600/night
    };

    it("does NOT apply discount when coupon has not been validated", () => {
      const pricing = calculateStayPricing(stay, false);
      expect(pricing.baseRate).toBe(3200); // 1600 * 2
      expect(pricing.taxes).toBe(160); // 5% GST
      expect(pricing.discount).toBe(0);
      expect(pricing.total).toBe(3360);
    });

    it("applies 10% discount ONLY after coupon is validated", () => {
      const pricing = calculateStayPricing(stay, true);
      expect(pricing.baseRate).toBe(3200);
      expect(pricing.taxes).toBe(160); // 5% GST
      expect(pricing.discount).toBe(336); // 10% of 3360
      expect(pricing.total).toBe(3024); // 3360 - 336
    });
  });
});
