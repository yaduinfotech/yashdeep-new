import { sanitizeObject, sanitizeText, sanitizeEmail, sanitizePhone } from './sanitizer';
import { rooms } from './hotel.ts';
import { verifiedTokenStore, isEmailVerificationTokenValid } from './api-otp.server';

export { verifiedTokenStore };
export interface HmsResponse<T = unknown> {
  ok: boolean;
  data?: T;
  reference?: string;
  message?: string;
  statusCode: number;
  messages?: {
    error?: string
  }
}

export interface HmsBookingPayload {
  guest: {
    name: string;
    email: string;
    phone: string;
    requests?: string;
  };
  stay: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    rooms: number;
    room?: string;
  };
  userId?: string;
  verificationToken?: string;
}

export interface HmsEnquiryPayload {
  name: string;
  email: string;
  phone?: string;
  type: string;
  message: string;
  verificationToken?: string;
}

export interface HmsFeedbackPayload {
  guestName: string;
  email?: string;
  rating: number;
  category?: string;
  comments: string;
}

/**
 * Dispatches an outbound request through the centralized HMS API Gateway.
 * All outgoing payloads are deeply sanitized and authenticated with Bearer tokens.
 */
export async function dispatchHmsRequest<T = Record<string, unknown>>(
  endpoint: string,
  rawPayload: Record<string, unknown>,
  tokenOverride?: string
): Promise<HmsResponse<T>> {
  const baseUrl = (process.env['HMS_BASE_URL'] || 'https://hms.yashdeeppalace.com').replace(/\/+$/, '');

  // Deep sanitize payload before transmission
  const sanitizedPayload = sanitizeObject(rawPayload);

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const targetUrl = `${baseUrl}${cleanEndpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Client-Source': 'yashdeep-web',
  };

  headers['Authorization'] = `Bearer ${process.env.HMS_BEARER_TOKEN}`;

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(sanitizedPayload),
      signal: controller.signal,
    });



    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const errorMsg =
        json?.message || json?.messages?.error ||
        json?.error ||
        `HMS API request to ${cleanEndpoint} failed with status ${res.status}`;
      return {
        ok: false,
        message: errorMsg,
        statusCode: res.status,
      };
    }


    const reference =
      json?.booking_id ||
      json?.bookingReference ||
      json?.reference ||
      json?.id ||
      json?.booking?.bookingReference ||
      json?.booking?.id ||
      'RECEIVED';

    return {
      ok: true,
      data: json as T,
      reference: String(reference),
      statusCode: res.status,
    };
  } catch (err: unknown) {
    const error = err as Error;
    if (error.name === 'AbortError') {
      return {
        ok: false,
        message: 'HMS request timed out. Please try again.',
        statusCode: 504,
      };
    }
    return {
      ok: false,
      message: error.message || 'Unable to reach HMS server.',
      statusCode: 500,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Specialized helper: Submits an automated booking to /api/bookings/new
 */
export async function hmsSubmitBooking(payload: HmsBookingPayload) {
  const requestBody = {
    guestName: payload.guest.name,
    email: payload.guest.email,
    phone: payload.guest.phone,
    checkIn: payload.stay.checkIn,
    checkOut: payload.stay.checkOut,
    adults: payload.stay.adults,
    children: payload.stay.children,
    rooms: payload.stay.rooms,
    roomPreference: payload.stay.room || '',
    specialRequests: payload.guest.requests || '',
    // Snake_case aliases for compatibility with backend models
    guest_name: payload.guest.name,
    check_in: payload.stay.checkIn,
    check_out: payload.stay.checkOut,
    check_in_date: payload.stay.checkIn,
    check_out_date: payload.stay.checkOut,
    room_preference: payload.stay.room || '',
    // get room charges as per room (if multiple rooms booked then get charges of max price room)
    room_charges_per_night: rooms?.filter((r) => r.name == payload.stay.room)?.[0]?.price || rooms[0]?.price,
    special_requests: payload.guest.requests || '',
    user_id: payload.userId,
    verificationToken: payload.verificationToken,
    source: 'website',
  };

  return dispatchHmsRequest('/api/bookings/new', requestBody, payload.verificationToken);
}

/**
 * Specialized helper: Submits room or general enquiry to /api/enquiries/new
 */
export async function hmsSubmitEnquiry(payload: HmsEnquiryPayload) {
  const requestBody = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone || '',
    enquiryType: payload.type,
    message: payload.message,
    verificationToken: payload.verificationToken,
    // Aliases
    enquiry_type: payload.type,
    source: 'website',
  };

  return dispatchHmsRequest('/api/enquiries/new', requestBody, payload.verificationToken);
}

export interface EnquirySubmissionData {
  name: string;
  email: string;
  phone?: string;
  type: 'General enquiry' | 'Restaurant enquiry' | 'Meeting or event enquiry' | 'Reservation enquiry';
  message: string;
  verificationToken?: string;
}

/**
 * Pure handler for enquiry submission with email OTP token verification.
 */
export async function handleEnquirySubmission(data: EnquirySubmissionData) {
  const token = data.verificationToken || verifiedTokenStore.getTokenFor(data.email);
  const valid = isEmailVerificationTokenValid(data.email, token);

  if (!valid) {
    throw new Error('Please verify your email address with the OTP code before submitting.');
  }

  const res = await hmsSubmitEnquiry({
    name: data.name,
    email: data.email || '',
    phone: data.phone || '',
    type: data.type,
    message: data.message,
    verificationToken: token || '',
  });

  if (!res.ok) {
    throw new Error(res.message || 'Unable to submit enquiry to reception.');
  }

  return {
    ok: true,
    reference: res.reference || 'RECEIVED',
  };
}

/**
 * Specialized helper: Submits guest feedback or review to /api/feedback/new
 */
export async function hmsSubmitFeedback(payload: HmsFeedbackPayload) {
  const requestBody = {
    guestName: payload.guestName,
    email: payload.email || '',
    rating: payload.rating,
    category: payload.category || 'General',
    comments: payload.comments,
    guest_name: payload.guestName,
    source: 'website',
  };

  return dispatchHmsRequest('/api/feedback/new', requestBody);
}

/**
 * Specialized helper: Validates a coupon code via /api/coupons/validate on HMS
 */
export async function hmsValidateCoupon(rawCode: string, rawEmail?: string) {
  const code = sanitizeText(rawCode, 50).toUpperCase();
  const email = rawEmail ? sanitizeEmail(rawEmail) : undefined;

  if (!code) {
    return { ok: false, message: 'Please enter a coupon code.' };
  }

  // Attempt to validate with remote HMS API
  try {
    const res = await dispatchHmsRequest<{ valid?: boolean; discountPercent?: number; message?: string }>(
      '/api/coupons/validate',
      { code, email, source: 'website' }
    );

    if (res.ok && (res.data?.valid || res.data?.discountPercent)) {
      return {
        ok: true,
        code,
        discountPercent: res.data.discountPercent || 10,
        message: res.data.message,
      };
    }
  } catch (e) {
    console.warn('[Coupon] HMS API validation failed:', e);
  }

  return {
    ok: false,
    message: 'Invalid or expired coupon code. Please check the code sent to your email.',
  };
}

export interface HmsOtpSendResponse {
  ok: boolean;
  message?: string;
  messages?: { error?: string }
}

export interface HmsOtpVerifyResponse {
  ok: boolean;
  message?: string;
  phone?: string;
  email?: string;
  verificationToken?: string;
}

/**
 * Specialized helper: Sends a mobile OTP challenge via HMS API endpoint: /api/otp/mobile/send
 */
export async function hmsSendMobileOtp(rawPhone: string): Promise<HmsOtpSendResponse> {
  const phone = sanitizePhone(rawPhone);
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    return { ok: false, message: 'Please enter a valid mobile number with country code.' };
  }

  const res = await dispatchHmsRequest<{ message?: string; code?: string }>(
    '/api/otp/mobile/send',
    { phone, type: 'mobile', source: 'website' }
  );

  if (res.ok) {
    return {
      ok: true,
      message: res.message || res.data?.message || `OTP sent to ${phone}. Valid for 10 minutes.`,
    };
  }

  return {
    ok: false,
    message: res.message || 'Failed to send mobile OTP via HMS API.',
  };
}

/**
 * Specialized helper: Verifies a mobile OTP code via HMS API endpoint: /api/otp/mobile/verify
 */
export async function hmsVerifyMobileOtp(
  rawPhone: string,
  rawCode: string
): Promise<HmsOtpVerifyResponse> {
  const phone = sanitizePhone(rawPhone);
  const code = sanitizeText(rawCode, 10).trim();

  const res = await dispatchHmsRequest<{ verified?: boolean; verificationToken?: string; token?: string; message?: string }>(
    '/api/otp/mobile/verify',
    { phone, code, type: 'mobile', source: 'website' }
  );

  if (res.ok) {
    const token = res.data?.verificationToken || res.data?.token || '';
    if (token) {
      verifiedTokenStore.set(token, { phone });
    }
    return {
      ok: true,
      phone,
      verificationToken: token,
      message: res.message || res.data?.message || 'Mobile verified successfully.',
    };
  }

  return {
    ok: false,
    message: res.message || 'Invalid or expired OTP code.',
  };
}

/**
 * Specialized helper: Sends an email verification OTP via HMS API endpoint: /api/otp/email/send
 */
export async function hmsSendEmailOtp(
  rawEmail: string,
  rawName: string,
  signup = false
): Promise<HmsOtpSendResponse> {
  const email = sanitizeEmail(rawEmail);
  const name = sanitizeText(rawName, 100);

  const res = await dispatchHmsRequest<{ message?: string; code?: string, messages?: { error?: string } }>(
    '/api/otp/email/send',
    { email, name, signup, type: 'email', source: 'website' }
  );

  return {
    ok: true,
    message: `Check your inbox for a verification code sent to ${email}.`,
  };

  if (res.ok) {
    return {
      ok: true,
      message: res.message || res.data?.message || `Check your inbox for a verification code sent to ${email}.`,
    };
  }

  return {
    ok: false,
    message: res.message || res?.messages?.error || 'Failed to send email verification code via HMS API.',
  };
}

/**
 * Specialized helper: Verifies an email verification OTP via HMS API endpoint: /api/otp/email/verify
 */
export async function hmsVerifyEmailOtp(
  rawEmail: string,
  rawCode: string
): Promise<HmsOtpVerifyResponse> {
  const email = sanitizeEmail(rawEmail);
  const code = sanitizeText(rawCode, 10).trim();

  const res = await dispatchHmsRequest<{ verified?: boolean; verificationToken?: string; token?: string; message?: string }>(
    '/api/otp/email/verify',
    { email, code, type: 'email', source: 'website' }
  );

  if (res.ok) {
    return {
      ok: true,
      email,
      verificationToken: res.data?.verificationToken || res.data?.token || '',
      message: res.message || res.data?.message || 'Email verified successfully.',
    };
  }

  return {
    ok: false,
    message: res.message || 'The code is invalid or expired.',
  };
}


