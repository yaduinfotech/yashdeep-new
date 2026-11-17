import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authClient } from "@/lib/auth-client";

const { mockGoogleOAuthSignup } = vi.hoisted(() => ({
  mockGoogleOAuthSignup: vi.fn(),
}));

vi.mock("@/lib/customer.functions", () => ({
  googleOAuthSignup: mockGoogleOAuthSignup,
}));

describe("authClient", () => {
  const originalLocation = window.location;
  const originalHistory = window.history;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.location = originalLocation;
    window.history = originalHistory;
  });

  describe("extractOAuthCallback", () => {
    it("returns null when no token or error exists in URL", () => {
      // Mock window.location
      // @ts-expect-error mock location
      delete window.location;
      window.location = new URL("https://yashdeeppalace.com/auth") as unknown as Location;

      const res = authClient.extractOAuthCallback();
      expect(res).toBeNull();
    });

    it("extracts access_token from hash and clears the hash via replaceState", () => {
      const replaceStateSpy = vi.fn();
      // @ts-expect-error mock history
      window.history.replaceState = replaceStateSpy;

      // @ts-expect-error mock location
      delete window.location;
      window.location = new URL(
        "https://yashdeeppalace.com/auth#access_token=ya29.sample_token&token_type=Bearer&expires_in=3600",
      ) as unknown as Location;

      const res = authClient.extractOAuthCallback();
      expect(res).toEqual({ accessToken: "ya29.sample_token", error: undefined });
      expect(replaceStateSpy).toHaveBeenCalledWith(null, "", "/auth");
    });

    it("extracts error from hash when user cancels or OAuth fails", () => {
      const replaceStateSpy = vi.fn();
      // @ts-expect-error mock history
      window.history.replaceState = replaceStateSpy;

      // @ts-expect-error mock location
      delete window.location;
      window.location = new URL(
        "https://yashdeeppalace.com/auth#error=access_denied&error_description=User%20denied%20access",
      ) as unknown as Location;

      const res = authClient.extractOAuthCallback();
      expect(res?.error).toBe("User denied access");
      expect(replaceStateSpy).toHaveBeenCalled();
    });
  });

  describe("signUpWithGoogleAccessToken", () => {
    it("calls googleOAuthSignup server function and returns session", async () => {
      mockGoogleOAuthSignup.mockResolvedValueOnce({
        ok: true,
        message: "Signed in successfully.",
        session: {
          user: {
            id: "usr_123",
            email: "guest@example.com",
            user_metadata: { display_name: "Guest" },
            email_confirmed_at: "2026-11-17T00:00:00.000Z",
          },
        },
      });

      const res = await authClient.signUpWithGoogleAccessToken("ya29.token123");
      expect(res.ok).toBe(true);
      expect(res.session?.user.email).toBe("guest@example.com");
      expect(mockGoogleOAuthSignup).toHaveBeenCalledWith({
        data: { accessToken: "ya29.token123" },
      });
    });

    it("returns error on failure from googleOAuthSignup", async () => {
      mockGoogleOAuthSignup.mockResolvedValueOnce({
        ok: false,
        message: "HMS authentication failed.",
      });

      const res = await authClient.signUpWithGoogleAccessToken("invalid_token");
      expect(res.ok).toBe(false);
      expect(res.error?.message).toBe("HMS authentication failed.");
    });
  });
});
