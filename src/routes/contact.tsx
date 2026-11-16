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
      "Contact Yashdeep Palace reception for direct room reservations, restaurant dining, and conference meetings in Khushkhera, Rajasthan.",
      {
        path: "/contact",
        image: "/assets/og-contact.jpg",
        imageAlt: "Front Desk & Entrance of Yashdeep Palace Khushkhera",
        cta: "Get in touch with front desk 24/7.",
      },
    ),
  component: ContactRoute,
});
function ContactRoute() {
  const { type } = Route.useSearch();
  return <ContactPage type={type} />;
}
