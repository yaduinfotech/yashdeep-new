import { useEffect, useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Tag,
  KeyRound,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  hotel,
  images,
  rooms,
  validateStay,
  localToday,
  calculateStayPricing,
  type Stay,
} from "@/lib/hotel";
import { guestSchema } from "@/lib/booking-rules";
import { submitBookingRequest } from "@/lib/customer.functions";
import { requestMobileOtpApi, verifyMobileOtpApi, validateCouponApi } from "@/lib/api.functions";
import { saveBookingDraft, loadBookingDraft, clearBookingDraft } from "@/lib/booking-draft";
import { PageBanner } from "./hotel-layout";
import { useCustomer } from "./customer-session";
import { GoogleSignup } from "./google-signup";

export function BookingPage({
  initial,
  embedded = false,
}: {
  initial: { [K in keyof Stay]?: Stay[K] | undefined };
  embedded?: boolean;
}) {
  const { user } = useCustomer();
  const [step, setStep] = useState(1);
  const [stay, setStay] = useState<Stay>({
    checkIn: initial.checkIn ?? "",
    checkOut: initial.checkOut ?? "",
    adults: initial.adults ?? 2,
    children: initial.children ?? 0,
    rooms: initial.rooms ?? 1,
    room: initial.room ?? "",
  });
  const [guest, setGuest] = useState({ name: "", email: "", phone: "", requests: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");
  const [restoredDraft, setRestoredDraft] = useState(false);

  // Coupon validation state (discount is only given after verifying code received on email)
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);

  // Auto-fill guest email if user is logged in
  useEffect(() => {
    if (user?.email && !guest.email) {
      setGuest((g) => ({ ...g, email: user.email || "" }));
    }
  }, [user]);

  // Restore booking progress from 36-hour storage on mount
  useEffect(() => {
    const draft = loadBookingDraft();
    if (!draft) return;

    const today = localToday();
    const draftStay = { ...draft.stay };
    let targetStep = draft.step;

    // If saved checkIn date has passed, reset dates and keep user on Step 1
    if (draftStay.checkIn && draftStay.checkIn < today) {
      draftStay.checkIn = "";
      draftStay.checkOut = "";
      targetStep = 1;
    }

    const hasExplicitInitialDates = Boolean(initial.checkIn && initial.checkOut);
    const hasExplicitRoom = Boolean(initial.room);

    setStay((prev) => ({
      checkIn: hasExplicitInitialDates
        ? (initial.checkIn ?? draftStay.checkIn)
        : draftStay.checkIn || prev.checkIn,
      checkOut: hasExplicitInitialDates
        ? (initial.checkOut ?? draftStay.checkOut)
        : draftStay.checkOut || prev.checkOut,
      adults: initial.adults ?? draftStay.adults ?? prev.adults,
      children: initial.children ?? draftStay.children ?? prev.children,
      rooms: initial.rooms ?? draftStay.rooms ?? prev.rooms,
      room: hasExplicitRoom ? (initial.room ?? draftStay.room) : draftStay.room || prev.room,
    }));

    if (draft.guest) {
      setGuest((prev) => ({
        name: draft.guest.name || prev.name,
        email: draft.guest.email || prev.email,
        phone: draft.guest.phone || prev.phone,
        requests: draft.guest.requests || prev.requests,
      }));
    }

    if (draft.appliedCoupon) {
      setAppliedCoupon(draft.appliedCoupon);
      setCouponCode(draft.appliedCoupon.code);
      setCouponSuccess(
        `Coupon ${draft.appliedCoupon.code} restored (${draft.appliedCoupon.discountPercent}% OFF)`,
      );
    }

    if (targetStep > 1) {
      setStep(targetStep);
    }
    setRestoredDraft(true);
  }, []);

  // Persist draft for 36 hours as customer progresses through the wizard
  useEffect(() => {
    if (reference) return; // Do not save once booking is confirmed
    saveBookingDraft({
      step,
      stay,
      guest,
      appliedCoupon,
    });
  }, [step, stay, guest, appliedCoupon, reference]);

  // In-Place Mobile OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpNotice, setOtpNotice] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);

  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (embedded) container.current?.closest(".floating-booking-body")?.scrollTo({ top: 0 });
  }, [step, embedded]);

  const submitBooking = useServerFn(submitBookingRequest);
  const requestOtp = useServerFn(requestMobileOtpApi);
  const verifyOtp = useServerFn(verifyMobileOtpApi);
  const validateCoupon = useServerFn(validateCouponApi);

  const hasDiscount = Boolean(appliedCoupon);
  const pricing = calculateStayPricing(stay, hasDiscount);

  const field = (key: keyof Stay, value: string) =>
    setStay((s) => ({
      ...s,
      [key]: ["adults", "children", "rooms"].includes(key) ? Number(value) : value,
    }));

  function next(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (step === 1) {
      const problem = validateStay(stay, localToday());
      if (problem) {
        setError(problem);
        return;
      }
    }
    if (step === 2) {
      const parsed = guestSchema.safeParse(guest);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Check your contact details.");
        return;
      }
      setGuest(parsed.data);
    }
    setStep((s) => Math.min(s + 1, 3));
  }

  // Request Mobile OTP via API
  async function handleSendOtp() {
    setError("");
    setOtpNotice("");
    setOtpBusy(true);
    try {
      const res = await requestOtp({ data: { phone: guest.phone } });
      setOtpSent(true);
      setOtpNotice(res.message || "OTP sent to your mobile phone.");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Could not send OTP. Please check your phone number.",
      );
    } finally {
      setOtpBusy(false);
    }
  }

  // Validate coupon code via API
  async function handleApplyCoupon() {
    setCouponError("");
    setCouponSuccess("");
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }
    setCouponBusy(true);
    try {
      const res = await validateCoupon({
        data: {
          code: couponCode.trim(),
          email: guest.email || user?.email || undefined,
          subtotal: pricing.total,
        },
      });
      if (res.ok) {
        setAppliedCoupon({
          code: res.code || couponCode.trim().toUpperCase(),
          discountPercent: res.discountPercent || 10,
        });
        setCouponSuccess(res.message || "10% Welcome Discount applied!");
      } else {
        setCouponError(res.message || "Invalid or expired coupon code. Please check your email.");
      }
    } catch (err: unknown) {
      setCouponError(err instanceof Error ? err.message : "Invalid or expired coupon code.");
    } finally {
      setCouponBusy(false);
    }
  }

  // Verify OTP and submit booking to HMS API
  async function handleVerifyAndSubmit() {
    setError("");
    setBusy(true);
    try {
      let token = verificationToken;
      if (!token) {
        if (!otpCode || otpCode.length !== 6) {
          setError("Please enter the 6-digit OTP code sent to your phone.");
          setBusy(false);
          return;
        }
        const verifyRes = await verifyOtp({ data: { phone: guest.phone, code: otpCode } });
        token = verifyRes.verificationToken;
        if (!token) {
          throw new Error(verifyRes.message);
        }
        setVerificationToken(token);
      }

      // Submit booking to HMS API
      if (token) {
        const result = await submitBooking({
          data: {
            stay,
            guest,
            verificationToken: token,
            couponCode: appliedCoupon?.code || undefined,
          },
        });
        setReference(result.id);
        clearBookingDraft();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Your booking could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={container} className={embedded ? "booking-embedded" : ""}>
      {!embedded && (
        <PageBanner
          title="Plan your stay"
          description="Select your dates, review pricing with real-time tax breakdown, and confirm your booking securely."
          eyebrow="Your warm welcome starts here"
        />
      )}

      <section className="section">
        <div className="content-width">
          {/* Restored Progress Banner */}
          {restoredDraft && !reference && step > 1 && (
            <div className="mb-4 flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Sparkles size={16} className="text-gold shrink-0" />
                Restored your stay in progress (landed on Step {step} of 3)
              </span>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 shrink-0 cursor-pointer"
                onClick={() => {
                  clearBookingDraft();
                  setRestoredDraft(false);
                  setStep(1);
                  setStay({
                    checkIn: initial.checkIn ?? "",
                    checkOut: initial.checkOut ?? "",
                    adults: initial.adults ?? 2,
                    children: initial.children ?? 0,
                    rooms: initial.rooms ?? 1,
                    room: initial.room ?? "",
                  });
                  setGuest({ name: "", email: user?.email || "", phone: "", requests: "" });
                  setAppliedCoupon(null);
                  setCouponCode("");
                  setCouponSuccess("");
                  setOtpSent(false);
                  setOtpCode("");
                  setVerificationToken("");
                }}
              >
                Start fresh
              </button>
            </div>
          )}

          {/* 3-Step Wizard Navigation */}
          <nav
            className="wizard-steps"
            aria-label="Booking progress"
            style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
          >
            {["Your stay", "Guest details", "Review & confirm"].map((title, i) => (
              <div
                className={`wizard-step ${step === i + 1 ? "current" : ""} ${step > i + 1 ? "complete" : ""}`}
                key={title}
                aria-current={step === i + 1 ? "step" : undefined}
              >
                <span>
                  {step > i + 1 ? <ShieldCheck size={15} /> : String(i + 1).padStart(2, "0")}
                </span>
                <span>{title}</span>
              </div>
            ))}
          </nav>

          <div className="enquiry-layout">
            <div>
              {reference ? (
                /* Confirmed Booking Panel */
                <div className="review-panel">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <CheckCircle2 size={32} />
                    <span className="font-semibold text-lg">Booking Confirmed in HMS</span>
                  </div>
                  <h2>We look forward to welcoming you!</h2>
                  <p>Your booking has been received and registered directly in our hotel system.</p>

                  <div className="my-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                      Booking Reference
                    </p>
                    <p className="text-2xl font-mono font-extrabold text-gold mt-1">{reference}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      A confirmation SMS has been dispatched to <strong>{guest.phone}</strong>.
                    </p>
                  </div>

                  <dl className="review-list mb-6">
                    <div>
                      <dt>Reserved Room</dt>
                      <dd>{pricing.roomName}</dd>
                    </div>
                    <div>
                      <dt>Total Payable</dt>
                      <dd className="font-bold text-base text-foreground">
                        ₹{pricing.total.toLocaleString("en-IN")}
                      </dd>
                    </div>
                    <div>
                      <dt>Stay Dates</dt>
                      <dd>
                        {stay.checkIn} → {stay.checkOut} ({pricing.nights} night
                        {pricing.nights > 1 ? "s" : ""})
                      </dd>
                    </div>
                    <div>
                      <dt>Primary Guest</dt>
                      <dd>{guest.name}</dd>
                    </div>
                  </dl>

                  <div className="wizard-actions">
                    <Button asChild variant="hotel">
                      <a href={hotel.phoneLink}>
                        <Phone />
                        Call front desk {hotel.phone} / {hotel.phone2}
                      </a>
                    </Button>
                    <Button asChild variant="outline">
                      <a
                        href={`https://wa.me/91${hotel.phone}?text=${encodeURIComponent(
                          `Hello Yashdeep Palace, my booking is confirmed! Reference: ${reference}, Guest: ${guest.name}, Check-in: ${stay.checkIn}`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle />
                        WhatsApp reception
                      </a>
                    </Button>
                  </div>
                </div>
              ) : step === 1 ? (
                /* STEP 1: YOUR STAY */
                <form className="enquiry-form" onSubmit={next}>
                  <h2 className="full-field">A stay made for you.</h2>
                  <div className="form-field">
                    <label htmlFor="booking-in">Check-in date *</label>
                    <input
                      id="booking-in"
                      type="date"
                      required
                      min={localToday()}
                      value={stay.checkIn}
                      onChange={(e) => field("checkIn", e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="booking-out">Check-out date *</label>
                    <input
                      id="booking-out"
                      type="date"
                      required
                      min={stay.checkIn || localToday()}
                      value={stay.checkOut}
                      onChange={(e) => field("checkOut", e.target.value)}
                    />
                  </div>
                  {(["adults", "children", "rooms"] as const).map((key) => (
                    <div className="form-field" key={key}>
                      <label htmlFor={`booking-${key}`}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <select
                        id={`booking-${key}`}
                        value={stay[key]}
                        onChange={(e) => field(key, e.target.value)}
                      >
                        {Array.from({ length: key === "children" ? 5 : 4 }, (_, i) =>
                          key === "children" ? i : i + 1,
                        ).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <div className="form-field">
                    <label htmlFor="room-preference">Room category</label>
                    <select
                      id="room-preference"
                      value={stay.room}
                      required
                      onChange={(e) => field("room", e.target.value)}
                    >
                      <option value="">Please advise</option>
                      {rooms.map((r) => (
                        <option key={r.slug} value={r.name}>
                          {r.name} — ₹{r.price?.toLocaleString("en-IN")}/night{" "}
                          {r.original_price
                            ? `(was ₹${r.original_price?.toLocaleString("en-IN")})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  {error && (
                    <p className="form-error full-field" role="alert">
                      {error}
                    </p>
                  )}
                  <div className="wizard-actions full-field">
                    <Button variant="hotel" type="submit">
                      Continue to guest details <ArrowRight />
                    </Button>
                  </div>
                </form>
              ) : step === 2 ? (
                /* STEP 2: GUEST DETAILS */
                <form className="enquiry-form" onSubmit={next}>
                  <h2 className="full-field">A little about you.</h2>
                  {(["name", "email", "phone"] as const).map((key) => (
                    <div className={`form-field ${key === "name" ? "full-field" : ""}`} key={key}>
                      <label htmlFor={`guest-${key}`}>
                        {key === "name"
                          ? "Full name"
                          : key === "email"
                            ? "Email address"
                            : "Mobile number"}{" "}
                        *
                      </label>
                      <input
                        id={`guest-${key}`}
                        type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                        required
                        readOnly={key === "email" && user?.email ? true : false}
                        maxLength={key === "phone" ? 10 : 100}
                        placeholder={key === "phone" ? "10-digit mobile number" : undefined}
                        value={guest[key]}
                        onChange={(e) => setGuest((g) => ({ ...g, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <div className="form-field full-field">
                    <label htmlFor="requests">Special requests</label>
                    <textarea
                      id="requests"
                      rows={3}
                      maxLength={1500}
                      placeholder="Early check-in, dietary preferences, or quiet floor"
                      value={guest.requests}
                      onChange={(e) => setGuest((g) => ({ ...g, requests: e.target.value }))}
                    />
                  </div>
                  {error && (
                    <p className="form-error full-field" role="alert">
                      {error}
                    </p>
                  )}
                  <div className="wizard-actions full-field">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft /> Back
                    </Button>
                    <Button variant="hotel" type="submit">
                      Review & price breakdown <ArrowRight />
                    </Button>
                  </div>
                </form>
              ) : (
                /* STEP 3: REVIEW, PRICE CALCULATION & IN-PLACE MOBILE OTP VERIFICATION */
                <div className="review-panel">
                  <h2>Review your booking.</h2>
                  <p className="rate-note mb-4">
                    Please verify your details and mobile number before final submission.
                  </p>

                  {/* Stay & Guest Summary */}
                  <dl className="review-list mb-6">
                    {Object.entries({
                      Guest: guest.name,
                      Email: guest.email,
                      Mobile: guest.phone,
                      "Check-in": stay.checkIn,
                      "Check-out": stay.checkOut,
                      Duration: `${pricing.nights} night${pricing.nights > 1 ? "s" : ""}`,
                      Occupancy: `${stay.adults} adult${stay.adults > 1 ? "s" : ""}${stay.children ? `, ${stay.children} child` : ""}`,
                      Rooms: `${stay.rooms} room(s)`,
                      Category: pricing.roomName,
                      Requests: guest.requests || "None",
                    }).map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>

                  {/* LIVE AMOUNT CALCULATION BOX */}
                  <div className="rounded-xl border border-border bg-card/60 p-5 mb-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="text-gold" size={18} /> Price Breakdown & Estimated Total
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>
                          {pricing.roomName} (₹{pricing.ratePerNight.toLocaleString("en-IN")}
                          {pricing.originalRatePerNight && (
                            <span className="line-through text-xs ml-1.5 opacity-75">
                              ₹{pricing.originalRatePerNight.toLocaleString("en-IN")}
                            </span>
                          )}{" "}
                          × {pricing.nights} night{pricing.nights > 1 ? "s" : ""} ×{" "}
                          {pricing.roomCount} room{pricing.roomCount > 1 ? "s" : ""})
                        </span>
                        <span>₹{pricing.baseRate.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Estimated Taxes & Fees (GST 5%)</span>
                        <span>₹{pricing.taxes.toLocaleString("en-IN")}</span>
                      </div>

                      {hasDiscount && (
                        <div className="flex justify-between text-emerald-600 font-medium">
                          <span className="flex items-center gap-1">
                            <Tag size={14} /> Coupon {appliedCoupon?.code} (10% OFF applied)
                          </span>
                          <span>- ₹{pricing.discount.toLocaleString("en-IN")}</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-border flex justify-between items-baseline">
                        <span className="font-semibold text-base">Grand Total</span>
                        <span className="text-2xl font-extrabold text-gold font-mono">
                          ₹{pricing.total.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* GOOGLE SIGNUP FOR WELCOME COUPON */}
                  {!user && !hasDiscount && (
                    <div className="rounded-xl border border-gold/40 bg-gold/5 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <Gift className="text-gold" size={18} /> New Guest? Get 10% Off Your First
                          Stay!
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sign up with Google to receive your exclusive 10% welcome coupon sent
                          directly to your email.
                        </p>
                      </div>
                      <div className="shrink-0">
                        <GoogleSignup next="/booking" />
                      </div>
                    </div>
                  )}

                  {/* EXPLICIT COUPON CODE INPUT & API VALIDATION BOX */}
                  <div className="rounded-xl border border-border bg-card p-5 mb-6 shadow-sm">
                    <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                      <Tag className="text-gold" size={18} /> Enter Welcome Coupon Code
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Enter the coupon code received on your email after signing up to unlock your
                      10% discount.
                    </p>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={18} />
                          <span className="font-semibold text-sm">
                            Coupon <strong>{appliedCoupon.code}</strong> verified via API (
                            {appliedCoupon.discountPercent}% OFF)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setAppliedCoupon(null);
                            setCouponSuccess("");
                            setCouponCode("");
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Enter coupon code (e.g. WELCOME10)"
                            className="flex-1 px-3 py-2 rounded-md border border-input bg-background font-mono uppercase text-sm"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase());
                              setCouponError("");
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={couponBusy || !couponCode.trim()}
                            onClick={handleApplyCoupon}
                          >
                            {couponBusy ? "Validating…" : "Apply Coupon"}
                          </Button>
                        </div>
                        {couponError && (
                          <p className="text-xs text-red-500 mt-2 font-medium" role="alert">
                            {couponError}
                          </p>
                        )}
                        {couponSuccess && (
                          <p className="text-xs text-emerald-600 mt-2 font-medium">
                            {couponSuccess}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* IN-PLACE MOBILE OTP VERIFICATION SECTION */}
                  <div className="rounded-xl border border-border bg-card p-5 mb-6">
                    <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                      <KeyRound className="text-gold" size={18} /> Verify Mobile Number via OTP
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      To confirm your reservation request, verify your mobile number (
                      <strong>{guest.phone}</strong>) via SMS OTP.
                    </p>

                    {!otpSent ? (
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="hotel"
                          disabled={otpBusy}
                          onClick={handleSendOtp}
                        >
                          {otpBusy ? "Sending OTP…" : "Send Mobile Verification OTP"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {otpNotice && (
                          <p className="text-xs text-emerald-600 font-medium">{otpNotice}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="6-digit OTP code"
                            className="w-48 px-3 py-2 rounded-md border border-input bg-background font-mono text-center tracking-widest text-lg"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          />
                          <Button
                            type="button"
                            variant="hotel"
                            disabled={busy || otpCode.length !== 6}
                            onClick={handleVerifyAndSubmit}
                          >
                            {busy ? "Verifying & Confirming…" : "Verify & Confirm Booking"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={otpBusy}
                            onClick={handleSendOtp}
                          >
                            Resend code
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* <Button
                                        type="button"
                                        variant="hotel"
                                        disabled={busy}
                                        onClick={handleSubmitBooking}
                                    >
                                        {busy ? 'Verifying & Confirming…' : 'Verify & Confirm Booking'}
                                    </Button> */}

                  {error && (
                    <p className="form-error mb-4" role="alert">
                      {error}
                    </p>
                  )}

                  <div className="wizard-actions">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>
                      <ArrowLeft /> Edit details
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar with Hotel Contact Details */}
            <aside className="booking-aside">
              <img src={images.deluxe} alt="Yashdeep Palace guest room" />
              <h2>
                Prefer a personal
                <br />
                conversation?
              </h2>
              <p>
                Speak directly with the front desk for immediate inquiries, bulk corporate rates, or
                directions.
              </p>
              <div className="aside-actions">
                <Button variant="outline" asChild>
                  <a href={hotel.phoneLink}>
                    <Phone />
                    {hotel.phone} / {hotel.phone2}
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={hotel.whatsapp} target="_blank" rel="noreferrer">
                    <MessageCircle />
                    WhatsApp front desk
                  </a>
                </Button>
              </div>
              <div className="policy-note">
                Your reservation is placed directly into our Hotel Management System upon
                verification.
              </div>
              <Link to="/booking-assistant" className="text-link mb-5">
                AI booking concierge <ArrowRight />
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
