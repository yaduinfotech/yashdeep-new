import { staySchema } from "./booking-rules";
import { validateStay, rooms, type Stay } from "./hotel";

export function prepareAgentStay(
  input: unknown,
  today: string,
): { ok: true; stay: Stay } | { ok: false; message: string } {
  const parsed = staySchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      message: "Choose valid dates, one to four adults and rooms, and zero to four children.",
    };
  const stay = parsed.data;
  for (const date of [stay.checkIn, stay.checkOut]) {
    const value = new Date(`${date}T00:00:00Z`);
    if (!Number.isFinite(value.getTime()) || value.toISOString().slice(0, 10) !== date)
      return { ok: false, message: "Choose real calendar dates." };
  }
  const problem = validateStay(stay, today);
  if (problem) return { ok: false, message: problem };
  if (stay.room && !rooms.some((room) => room.name === stay.room))
    return { ok: false, message: "Choose Deluxe Room, Luxury Double Room or no preference." };
  return { ok: true, stay };
}

export const BOOKING_CHAT_STORAGE_KEY = "yashdeep-booking-conversation";
