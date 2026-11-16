import { createFileRoute } from "@tanstack/react-router";
import { BookingAgent } from "@/components/booking-agent";
import { pageHead } from "@/lib/hotel";

export const Route = createFileRoute("/booking-assistant")({
  staticData: { sitemap: false },
  head: () =>
    pageHead(
      "AI Booking Concierge",
      "Plan your Yashdeep Palace stay with our virtual AI concierge, check amenities, and explore tailored room recommendations.",
      {
        path: "/booking-assistant",
        image: "/assets/og-home.jpg",
        imageAlt: "AI Booking Concierge at Yashdeep Palace",
        cta: "Chat with our virtual concierge for tailored assistance.",
      },
    ),
  component: () => (
    <section className="section">
      <div className="content-width">
        <BookingAgent />
      </div>
    </section>
  ),
});
