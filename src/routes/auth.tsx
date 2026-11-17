import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { oauthReturnPath } from "@/lib/oauth-return-path";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, LogOut, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBanner } from "@/components/hotel-layout";
import { EmailVerification } from "@/components/email-verification";
import { GoogleSignup } from "@/components/google-signup";
import { useCustomer } from "@/components/customer-session";
import { authClient } from "@/lib/auth-client";
import { emailSchema, SIGNUP_DISCOUNT_PERCENT } from "@/lib/booking-rules";
import { pageHead } from "@/lib/hotel";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { next?: string } =>
    typeof s["next"] === "string" ? { next: oauthReturnPath(s["next"]) } : {},
  staticData: { sitemap: false },
  head: () =>
    pageHead(
      "Customer Signup & Sign In",
      "Access your Yashdeep Palace account, manage your reservations, and unlock an exclusive 10% welcome coupon on your stay.",
      {
        path: "/auth",
        image: "/assets/og-home.jpg",
        imageAlt: "Customer Sign In at Yashdeep Palace",
        cta: "Sign up today to claim a 10% welcome discount.",
      },
    ),
  component: CustomerAccount,
});

function CustomerAccount() {
  const { user, ready, setUser, signOut } = useCustomer();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const navigate = useNavigate();
  const query = useQueryClient();
  const [error, setError] = useState("");
  const [next, setNext] = useState("");

  useEffect(() => {
    const callback = authClient.extractOAuthCallback();
    if (!callback) return;

    if (callback.error) {
      setError(callback.error);
      return;
    }

    if (callback.accessToken) {
      setOauthLoading(true);
      setError("");
      authClient
        .signUpWithGoogleAccessToken(callback.accessToken)
        .then((res) => {
          if (res.ok && res.session?.user) {
            setUser(res.session.user);
            navigate({ to: callback.nextUrl || "/auth" });
            // if (callback.nextUrl) {
            //   setNext(callback.nextUrl);
            // }
          } else {
            setError(
              res.error?.message ||
                "Google sign-in could not be completed with HMS. Please try again or use email.",
            );
          }
        })
        .catch((err) => {
          setError(
            err?.message || "Google sign-in could not be completed. Please try again or use email.",
          );
        })
        .finally(() => {
          setOauthLoading(false);
        });
    }
  }, [setUser]);

  // useEffect(() => {
  //   if (ready && user && next && next !== "/") {
  //     window.location.assign(next);
  //   }
  // }, [ready, user, next]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2 || !emailSchema.safeParse(email).success) {
      setError("Please enter your full name and a valid email.");
      return;
    }
    setError("");
    setSubmitted(true);
  }

  async function handleSignOut() {
    await query.cancelQueries();
    query.clear();
    signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <>
      <PageBanner
        title={user ? "Your customer account" : "A warm welcome, just for you."}
        description={
          user
            ? "Your verified email and customer profile."
            : "Create a customer profile or sign in with Google or email."
        }
        eyebrow="Yashdeep Palace guests"
      />
      <section className="section">
        <div className="content-width enquiry-layout">
          <div>
            {ready && !user && !oauthLoading && <GoogleSignup next={next} />}
            {oauthLoading ? (
              <p>Signing you in with Google and loading your profile…</p>
            ) : !ready ? (
              <p>Loading your account…</p>
            ) : user ? (
              <>
                <h2 className="text-4xl">Welcome to Yashdeep Palace.</h2>
                <p>{user.email}</p>
                <p className="rate-note">
                  Your email is {user.email_confirmed_at ? "verified" : "awaiting verification"}.
                </p>
                <div className="wizard-actions">
                  <Button variant="hotel" asChild>
                    <Link to="/booking">
                      Plan your stay
                      <ArrowRight />
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut />
                    Sign out
                  </Button>
                </div>
              </>
            ) : submitted ? (
              <>
                <EmailVerification email={email} name={name} signup />
                <Button variant="ghost" onClick={() => setSubmitted(false)}>
                  Change details
                </Button>
              </>
            ) : (
              <form className="enquiry-form" onSubmit={submit}>
                <h2 className="full-field">Your customer profile.</h2>
                <div className="form-field full-field">
                  <label htmlFor="signup-name">Full name *</label>
                  <input
                    id="signup-name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-field full-field">
                  <label htmlFor="signup-email">Email address *</label>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    maxLength={255}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && (
                  <p className="form-error full-field" role="alert">
                    {error}
                  </p>
                )}
                <div className="full-field">
                  <Button type="submit" variant="hotel">
                    Continue with email
                    <ArrowRight />
                  </Button>
                  <p className="rate-note mt-4">
                    Signup or login using your email address to access your customer account.{" "}
                    <Link to="/privacy">Privacy information</Link>
                  </p>
                </div>
              </form>
            )}
          </div>
          <aside className="booking-aside">
            <Gift className="text-gold mb-4" size={30} />
            <h2>
              An extra {SIGNUP_DISCOUNT_PERCENT}% off
              <br />
              for new customers.
            </h2>
            <p>
              A coupon will be delivered to your verified email after successfull SIgnup. Use that
              for your next booking to avail extra 10% off*.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
