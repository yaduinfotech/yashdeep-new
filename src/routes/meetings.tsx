import { createFileRoute } from "@tanstack/react-router";
import { MeetingsPage } from "@/components/hotel-pages";
import { pageHead } from "@/lib/hotel";
export const Route = createFileRoute("/meetings")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "Meetings & Events",
      "Host corporate conferences, business meetings, and banquets in Khushkhera with audio-visual equipment, flexible seating, and dedicated catering.",
      {
        path: "/meetings",
        image: "/assets/og-meetings.jpg",
        imageAlt: "Meetings and Conference Facilities at Yashdeep Palace Khushkhera",
        cta: "Enquire today for corporate bookings & events.",
      },
    ),
  component: MeetingsPage,
});
