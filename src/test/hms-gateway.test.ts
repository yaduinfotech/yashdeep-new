import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  dispatchHmsRequest,
  hmsSubmitBooking,
  hmsSubmitEnquiry,
  hmsSubmitFeedback,
  hmsSendMobileOtp,
  hmsVerifyMobileOtp,
  hmsSendEmailOtp,
  hmsVerifyEmailOtp,
  verifiedTokenStore,
} from "@/lib/hms-gateway.server";

describe("HMS Centralized API Gateway", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    verifiedTokenStore.clear();
    process.env = {
      ...originalEnv,
      HMS_BASE_URL: "https://hms.yashdeeppalace.com",
      HMS_BEARER_TOKEN: "test-secret-bearer-token",
    };
  });

  afterEach(() => {
    verifiedTokenStore.clear();
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("uses bearer token from verifiedTokenStore when available", async () => {
    delete process.env["HMS_BEARER_TOKEN"];
    verifiedTokenStore.set("vtok_store_test_abc", { phone: "+918222020599" });

    let capturedHeaders: Record<string, string> = {};
    global.fetch = vi.fn().mockImplementation(async (url, init) => {
      capturedHeaders = init?.headers as Record<string, string>;
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      };
    });

    const res = await dispatchHmsRequest("/api/test", { phone: "8222020599" });
    expect(res.ok).toBe(true);
    expect(capturedHeaders["Authorization"]).toBe("Bearer vtok_store_test_abc");
  });

  it("sends POST request with Authorization Bearer header and sanitized payload", async () => {
    let capturedUrl = "";
    let capturedHeaders: Record<string, string> = {};
    let capturedBody: any = null;

    global.fetch = vi.fn().mockImplementation(async (url, init) => {
      capturedUrl = String(url);
      capturedHeaders = init?.headers as Record<string, string>;
      capturedBody = JSON.parse(init?.body as string);
      return {
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          bookingReference: "YDP-2026-9999",
        }),
      };
    });

    const res = await dispatchHmsRequest("/api/test-endpoint", {
      rawHtml: "<b>Bold</b>",
      email: " GUEST@EXAMPLE.COM ",
    });

    expect(res.ok).toBe(true);
    expect(res.statusCode).toBe(201);
    expect(res.reference).toBe("YDP-2026-9999");
    expect(capturedUrl).toBe("https://hms.yashdeeppalace.com/api/test-endpoint");
    expect(capturedHeaders["Authorization"]).toBe("Bearer test-secret-bearer-token");
    expect(capturedHeaders["Content-Type"]).toBe("application/json");
    expect(capturedHeaders["X-Client-Source"]).toBe("yashdeep-web");
    expect(capturedBody.rawHtml).toBe("Bold");
    expect(capturedBody.email).toBe("guest@example.com");
  });

  it("handles non-200 responses gracefully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "Invalid room availability" }),
    });

    const res = await dispatchHmsRequest("/api/bookings/new", { room: "Deluxe" });
    expect(res.ok).toBe(false);
    expect(res.statusCode).toBe(400);
    expect(res.message).toBe("Invalid room availability");
  });

  it("submits booking payload via hmsSubmitBooking to /api/bookings/new", async () => {
    let capturedUrl = "";
    let capturedBody: any = null;

    global.fetch = vi.fn().mockImplementation(async (url, init) => {
      capturedUrl = String(url);
      capturedBody = JSON.parse(init?.body as string);
      return {
        ok: true,
        status: 200,
        json: async () => ({ bookingReference: "YDP-2026-1234" }),
      };
    });

    const res = await hmsSubmitBooking({
      guest: {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "8222020599",
        requests: "Early check-in",
      },
      stay: {
        checkIn: "2026-12-01",
        checkOut: "2026-12-03",
        adults: 2,
        children: 1,
        rooms: 1,
        room: "Luxury Double Room",
      },
      userId: "user-uuid-123",
    });

    expect(res.ok).toBe(true);
    expect(res.reference).toBe("YDP-2026-1234");
    expect(capturedUrl).toBe("https://hms.yashdeeppalace.com/api/bookings/new");
    expect(capturedBody.guestName).toBe("Jane Doe");
    expect(capturedBody.phone).toBe("+918222020599");
    expect(capturedBody.checkIn).toBe("2026-12-01");
    expect(capturedBody.roomPreference).toBe("Luxury Double Room");
  });

  it("submits room enquiry via hmsSubmitEnquiry to /api/enquiries/new", async () => {
    let capturedUrl = "";
    let capturedBody: any = null;

    global.fetch = vi.fn().mockImplementation(async (url, init) => {
      capturedUrl = String(url);
      capturedBody = JSON.parse(init?.body as string);
      return {
        ok: true,
        status: 200,
        json: async () => ({ reference: "ENQ-888" }),
      };
    });

    const res = await hmsSubmitEnquiry({
      name: "Alice",
      email: "alice@example.com",
      phone: "8222020599",
      type: "Meeting or event enquiry",
      message: "Need banquet hall for 50 people.",
    });

    expect(res.ok).toBe(true);
    expect(res.reference).toBe("ENQ-888");
    expect(capturedUrl).toBe("https://hms.yashdeeppalace.com/api/enquiries/new");
    expect(capturedBody.name).toBe("Alice");
    expect(capturedBody.enquiryType).toBe("Meeting or event enquiry");
  });

  it("submits feedback via hmsSubmitFeedback to /api/feedback/new", async () => {
    let capturedUrl = "";
    let capturedBody: any = null;

    global.fetch = vi.fn().mockImplementation(async (url, init) => {
      capturedUrl = String(url);
      capturedBody = JSON.parse(init?.body as string);
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: "FDB-555" }),
      };
    });

    const res = await hmsSubmitFeedback({
      guestName: "Bob Smith",
      rating: 5,
      comments: "Wonderful hospitality and delicious food!",
    });

    expect(res.ok).toBe(true);
    expect(res.reference).toBe("FDB-555");
    expect(capturedUrl).toBe("https://hms.yashdeeppalace.com/api/feedback/new");
    expect(capturedBody.guestName).toBe("Bob Smith");
    expect(capturedBody.rating).toBe(5);
  });

  describe("HMS OTP Endpoints", () => {
    it("dispatches mobile OTP send to /api/otp/mobile/send", async () => {
      let capturedUrl = "";
      let capturedBody: any = null;

      global.fetch = vi.fn().mockImplementation(async (url, init) => {
        capturedUrl = String(url);
        capturedBody = JSON.parse(init?.body as string);
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            message: "OTP sent to mobile phone.",
          }),
        };
      });

      const res = await hmsSendMobileOtp("8222020599");
      expect(res.ok).toBe(true);
      expect(res.message).toBe("OTP sent to mobile phone.");
      expect(capturedUrl).toBe("https://hms.yashdeeppalace.com/api/otp/mobile/send");
      expect(capturedBody.phone).toBe("+918222020599");
      expect(capturedBody.type).toBe("mobile");
    });

    it("dispatches mobile OTP verify to /api/otp/mobile/verify", async () => {
      let capturedUrl = "";
      let capturedBody: any = null;

      global.fetch = vi.fn().mockImplementation(async (url, init) => {
        capturedUrl = String(url);
        capturedBody = JSON.parse(init?.body as string);
        return {
          ok: true,
          status: 200,
          json: async () => ({
            verified: true,
            verificationToken: "vtok_hms_verified_123",
          }),
        };
      });

      const res = await hmsVerifyMobileOtp("8222020599", "123456");
      expect(res.ok).toBe(true);
      expect(res.phone).toBe("+918222020599");
      expect(res.verificationToken).toBe("vtok_hms_verified_123");
      expect(capturedUrl).toBe("https://hms.yashdeeppalace.com/api/otp/mobile/verify");
      expect(capturedBody.phone).toBe("+918222020599");
      expect(capturedBody.code).toBe("123456");
    });

    it("dispatches email OTP send to /api/otp/email/send", async () => {
      let capturedUrl = "";
      let capturedBody: any = null;

      global.fetch = vi.fn().mockImplementation(async (url, init) => {
        capturedUrl = String(url);
        capturedBody = JSON.parse(init?.body as string);
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            message: "Email OTP code sent.",
          }),
        };
      });

      const res = await hmsSendEmailOtp("GUEST@EXAMPLE.COM", "Guest User", true);
      expect(res.ok).toBe(true);
      expect(res.message).toBe("Email OTP code sent.");
      expect(capturedUrl).toBe("https://hms.yashdeeppalace.com/api/otp/email/send");
      expect(capturedBody.email).toBe("guest@example.com");
      expect(capturedBody.name).toBe("Guest User");
      expect(capturedBody.signup).toBe(true);
      expect(capturedBody.type).toBe("email");
    });

    it("dispatches email OTP verify to /api/otp/email/verify", async () => {
      let capturedUrl = "";
      let capturedBody: any = null;

      global.fetch = vi.fn().mockImplementation(async (url, init) => {
        capturedUrl = String(url);
        capturedBody = JSON.parse(init?.body as string);
        return {
          ok: true,
          status: 200,
          json: async () => ({
            verified: true,
            token: "vtok_email_verified_456",
          }),
        };
      });

      const res = await hmsVerifyEmailOtp("guest@example.com", "654321");
      expect(res.ok).toBe(true);
      expect(res.email).toBe("guest@example.com");
      expect(res.verificationToken).toBe("vtok_email_verified_456");
      expect(capturedUrl).toBe("https://hms.yashdeeppalace.com/api/otp/email/verify");
      expect(capturedBody.email).toBe("guest@example.com");
      expect(capturedBody.code).toBe("654321");
    });
  });
});
