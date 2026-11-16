import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendEmailCode, verifyEmailCode } from "@/lib/customer.functions";
import { useCustomer } from "./customer-session";

export function EmailVerification({
  email,
  name,
  signup = false,
}: {
  email: string;
  name: string;
  signup?: boolean;
}) {
  const { user, setUser } = useCustomer();
  const send = useServerFn(sendEmailCode);
  const verify = useServerFn(verifyEmailCode);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);

  const verified = Boolean(
    user?.email_confirmed_at && user.email?.toLowerCase() === email.toLowerCase(),
  );

  async function request() {
    setBusy(true);
    try {
      const result = await send({ data: { email, name, signup } });
      setMessage(result.message);
      if (result.ok) setSent(true);
    } catch {
      setMessage("Please enter a valid email and name, or try again later.");
    } finally {
      setBusy(false);
    }
  }

  async function check() {
    setBusy(true);
    try {
      const result = await verify({ data: { email, code } });
      setMessage(result.message);
      if (result.ok && result.session?.user) {
        setUser(result.session.user);
      }
    } catch {
      setMessage("Enter the 6–8 digit code from your email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="verification-block">
      <div className="verification-heading">
        <Mail />
        <h3>Email verification</h3>
        {verified && (
          <span className="verified-label">
            <ShieldCheck />
            Verified
          </span>
        )}
      </div>
      {!verified && (
        <>
          <p className="rate-note">Verify {email}. Check your inbox for your verification code.</p>
          <Button variant="outline" disabled={busy} onClick={request}>
            {busy ? "Please wait…" : sent ? "Resend email" : "Send email verification"}
          </Button>
          {sent && (
            <div className="otp-controls">
              <div className="form-field">
                <label htmlFor="email-code">Email code</label>
                <input
                  id="email-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <Button variant="hotel" disabled={busy || code.length < 6} onClick={check}>
                Verify email
              </Button>
            </div>
          )}
        </>
      )}
      {message && (
        <p role="status" className="rate-note mt-3">
          {message}
        </p>
      )}
    </div>
  );
}
