export interface SignInOptions {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
}

export interface SignInResult {
  error?: Error;
  redirected?: boolean;
}

export interface OAuthCallbackResult {
  accessToken?: string | undefined;
  error?: string | undefined;
  nextUrl?: string | undefined;
}

export interface GoogleSignupResult {
  ok: boolean;
  message?: string;
  session?: {
    user: {
      id: string;
      email: string;
      user_metadata?: { display_name?: string; avatar_url?: string };
      email_confirmed_at?: string;
    };
  };
  error?: Error;
}

export const authClient = {
  signInWithOAuth: async (provider: "google", opts?: SignInOptions): Promise<SignInResult> => {
    if (provider !== "google") {
      return { error: new Error("Unsupported provider") };
    }

    const clientId =
      (typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.VITE_GOOGLE_CLIENT_ID) ||
      "";

    const redirectUri =
      opts?.redirect_uri || (typeof window !== "undefined" ? `${window.location.origin}/auth` : "");

    if (!clientId) {
      return {
        error: new Error("Google sign-in is not configured yet. Please continue with email."),
      };
    }

    if (typeof window !== "undefined") {
      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      url.searchParams.set("client_id", clientId);
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("response_type", "token");
      url.searchParams.set("scope", "openid email profile");
      // 👇 remove extra parameters
      sessionStorage.removeItem("nextUrl"); // Clean up after reading

      if (opts?.extraParams) {
        Object.entries(opts.extraParams).forEach(([key, value]) => {
          // url.searchParams.set(key, value.toString());
          sessionStorage.setItem(key, value.toString());
        });
      }

      window.location.assign(url.href);
      return { redirected: true };
    }

    return { redirected: false };
  },

  /**
   * Extracts Google OAuth token or error from the URL hash or query params.
   * Automatically clears the hash fragment using history.replaceState to avoid exposing tokens.
   */
  extractOAuthCallback: (): OAuthCallbackResult | null => {
    if (typeof window === "undefined") return null;
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    const hashParams = new URLSearchParams(hash);
    const searchParams = new URLSearchParams(window.location.search);
    const accessToken = hashParams.get("access_token") || searchParams.get("access_token");
    const error =
      hashParams.get("error_description") ||
      hashParams.get("error") ||
      searchParams.get("error_description") ||
      searchParams.get("error");

    let nextUrl = searchParams.get("nextUrl") || "";
    if (!nextUrl) {
      nextUrl = sessionStorage.getItem("nextUrl") || "";
      sessionStorage.removeItem("nextUrl"); // Clean up after reading
    }
    if (accessToken || error) {
      if (window.location.hash) {
        const cleanUrl =
          window.location.pathname + (window.location.search ? window.location.search : "");
        window.history.replaceState(null, "", cleanUrl);
      }
      return {
        accessToken: accessToken || undefined,
        error: error || undefined,
        nextUrl: nextUrl || undefined,
      };
    }

    return null;
  },

  /**
   * Sends Google OAuth access token to HMS API via server function to signup/login and retrieve profile.
   */
  signUpWithGoogleAccessToken: async (accessToken: string): Promise<GoogleSignupResult> => {
    try {
      const { googleOAuthSignup } = await import("./customer.functions");
      const res = await googleOAuthSignup({ data: { accessToken } });
      if (res && res.ok && res.session?.user) {
        return {
          ok: true,
          message: res.message,
          session: res.session,
        };
      }
      return {
        ok: false,
        error: new Error(res?.message || "Failed to sign up with Google."),
      };
    } catch (err: unknown) {
      const e = err as Error;
      return {
        ok: false,
        error: e,
      };
    }
  },
};
