export interface SignInOptions {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
}

export interface SignInResult {
  error?: Error;
  redirected?: boolean;
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

      window.location.assign(url.href);
      return { redirected: true };
    }

    return { redirected: false };
  },
};
