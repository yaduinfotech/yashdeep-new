import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Smartphone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendMobileOtp, checkMobileOtp } from "@/lib/mobile.functions";

export function MobileVerification({
  phone,
  emailVerified,
  onVerified,
}: {
  phone: string;
  emailVerified: boolean;
  onVerified: (phone: string) => void;
}) {
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const send = useServerFn(sendMobileOtp);
  const check = useServerFn(checkMobileOtp);
  async function request() {
    setBusy(true);
    try {
      const result = await send({ data: { phone } });
      setSent(result.ok);
      setMessage(result.message);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not request a mobile code.");
    } finally {
      setBusy(false);
    }
  }
  async function verify() {
    setBusy(true);
    try {
      const result = await check({ data: { phone, code } });
      if (result.ok) {
        setVerified(true);
        onVerified(result.phone);
        setMessage("Mobile verified.");
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not verify the mobile code.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="verification-block">
      <div className="verification-heading">
        <Smartphone />
        <h3>Mobile verification</h3>
        {verified && (
          <span className="verified-label">
            <ShieldCheck />
            Verified
          </span>
        )}
      </div>
      <p className="rate-note">{phone}</p>
      {!verified && (
        <>
          <Button variant="outline" disabled={busy || !emailVerified} onClick={request}>
            {sent ? "Resend mobile OTP" : "Send mobile OTP"}
          </Button>
          {sent && (
            <div className="otp-controls">
              <div className="form-field">
                <label htmlFor="mobile-code">Mobile code</label>
                <input
                  id="mobile-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <Button variant="hotel" disabled={busy || code.length !== 6} onClick={verify}>
                Verify mobile
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
