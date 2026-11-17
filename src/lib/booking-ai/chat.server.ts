import { convertToModelMessages, validateUIMessages, type UIMessage } from "ai";
import { createGeminiResponsesCall } from "./responses.server";
import { bookingTools } from "./tools.server";
import { hotel, rooms } from "../hotel";

const chatRateLimitStore = new Map<string, { count: number; resetAt: number }>();
const MAX_MESSAGES_PER_WINDOW = 20;
const WINDOW_DURATION_MS = 15 * 60 * 1000;

function checkChatRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = chatRateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    chatRateLimitStore.set(key, { count: 1, resetAt: now + WINDOW_DURATION_MS });
    return true;
  }
  if (entry.count >= MAX_MESSAGES_PER_WINDOW) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function handleBookingChat(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json(
      { error: "Please open the booking assistant on this website." },
      { status: 403 },
    );
  }

  const raw = await request.text();
  if (raw.length > 120_000) {
    return Response.json(
      { error: "This conversation is too long. Clear it to begin again." },
      { status: 413 },
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const tools = bookingTools(today);
  let messages: UIMessage[];

  try {
    const body = JSON.parse(raw);
    if (
      !Array.isArray(body.messages) ||
      !body.messages.length ||
      body.messages.some((m: { role?: string }) => m.role !== "user" && m.role !== "assistant")
    ) {
      throw new Error("Invalid conversation");
    }
    messages = await validateUIMessages({ messages: body.messages, tools });
  } catch {
    return Response.json(
      { error: "The conversation could not be read. Please clear it and try again." },
      { status: 400 },
    );
  }

  const address =
    request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "local";
  if (!checkChatRateLimit(address)) {
    return Response.json(
      { error: "Too many messages. Please wait 15 minutes or contact the front desk." },
      { status: 429, headers: { "Retry-After": "900" } },
    );
  }

  // Connect to Google Gemini API
  const apiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"];
  if (!apiKey) {
    return Response.json(
      {
        error:
          "The booking concierge is temporarily unavailable. Please call reception at " +
          hotel.phone +
          "/" +
          hotel.phone2 +
          ".",
      },
      { status: 503 },
    );
  }

  const instructions = `You are the Yashdeep Palace booking concierge. Today is ${today} (UTC). Reply warmly and concisely in the guest's language.
Help collect check-in/check-out dates, adults, children, rooms and room preference, asking only for missing details. Once supplied use prepareStay to offer a validated draft. Supported room names: ${rooms.map((room) => room.name).join(", ")}. Never invent descriptions, amenities, rates, reviews, policies, hours, discounts, capacity, live availability or confirmations.
Property is in Khushkhera, Rajasthan. Front desk: ${hotel.phone}, phone link ${hotel.phoneLink}, WhatsApp ${hotel.whatsapp}. Address, rates, amenities and policies need reception confirmation; do not present them as verified.
Mobile OTP is connected in the booking form. Email verification and mobile verification are both required; you cannot verify contacts, generate OTPs, submit requests, take payment or confirm reservations. Never say booked, received, reserved or submitted. A draft is not a reservation. Offer reception call/WhatsApp for arranging a real stay.
Do not request email, phone, passwords, payment details or OTP in chat; contact details belong in the booking form. Chat is saved in this browser only. For an unrelated question politely return to hotel booking. Use prepareStay only for drafts, never invent guest choices. Use hotelInformation for listing questions.`;

  try {
    const call = createGeminiResponsesCall(
      request,
      {
        baseURL: process.env["GEMINI_BASE_URL"],
        apiKey,
        model: process.env["GEMINI_MODEL"] || "gemini-2.5-flash",
      },
      await convertToModelMessages(messages),
      instructions,
      tools,
      messages,
    );
    return await call.response();
  } catch (err) {
    if (request.signal.aborted || (err instanceof Error && err.name === "AbortError")) {
      return new Response(null, { status: 499 });
    }
    return Response.json(
      { error: "The assistant could not respond. Please contact reception or try again." },
      { status: 500 },
    );
  }
}
