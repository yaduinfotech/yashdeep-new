import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ContactPage } from "@/components/hotel-pages";
import { pageHead } from "@/lib/hotel";
export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  validateSearch: z.object({
    type: z
      .enum([
        "General enquiry",
        "Restaurant enquiry",
        "Meeting or event enquiry",
        "Reservation enquiry",
      ])
      .optional()
      .catch(undefined),
  }),
  head: () =>
    pageHead(
      "Contact & Directions",
      "Contact Yashdeep Palace reception for reservations, restaurant enquiries and meetings. Find directions to Khushkhera, Rajasthan.",
    ),
  component: ContactRoute,
});
function ContactRoute() {
  const { type } = Route.useSearch();
  return <ContactPage type={type} />;
}
