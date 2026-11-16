import { createFileRoute } from "@tanstack/react-router";
import { BookingAgent } from "@/components/booking-agent";
import { pageHead } from "@/lib/hotel";

export const Route = createFileRoute("/booking-assistant")({
  staticData: { sitemap: false },
  head: () =>
    pageHead(
      "AI Booking Concierge",
      "Plan a Yashdeep Palace stay with the AI booking concierge and contact reception to confirm rates and availability.",
    ),
  component: () => (
    <section className="section">
      <div className="content-width">
        <BookingAgent />
      </div>
    </section>
  ),
});
