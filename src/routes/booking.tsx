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
      "Seamless 4-step direct room reservation with instant confirmation, 10% welcome coupon, and zero advance payment required.",
      {
        path: "/booking",
        image: "/assets/og-home.jpg",
        imageAlt: "Direct Room Booking at Yashdeep Palace Khushkhera",
        cta: "Book online in under 2 minutes.",
      },
    ),
  component: BookingRoute,
});
function BookingRoute() {
  const initial = Route.useSearch();
  return <BookingPage initial={initial} />;
}
