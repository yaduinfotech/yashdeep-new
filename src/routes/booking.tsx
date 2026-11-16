import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { BookingPage } from "@/components/hotel-pages";
import { pageHead } from "@/lib/hotel";
const searchSchema = z.object({
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  adults: z.coerce.number().int().min(1).max(4).optional().catch(undefined),
  children: z.coerce.number().int().min(0).max(4).optional().catch(undefined),
  rooms: z.coerce.number().int().min(1).max(4).optional().catch(undefined),
  room: z.string().optional(),
});
export const Route = createFileRoute("/booking")({
  staticData: { sitemap: true },
  validateSearch: searchSchema,
  head: () =>
    pageHead(
      "Reservation Enquiries",
      "Choose dates, guests and your preferred room, then contact Yashdeep Palace reception to confirm rates and availability.",
    ),
  component: BookingRoute,
});
function BookingRoute() {
  const initial = Route.useSearch();
  return <BookingPage initial={initial} />;
}
