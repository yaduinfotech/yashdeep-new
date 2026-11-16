import { createFileRoute } from "@tanstack/react-router";
import { MeetingsPage } from "@/components/hotel-pages";
import { pageHead } from "@/lib/hotel";
export const Route = createFileRoute("/meetings")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "Meetings & Events",
      "Plan business meetings and small gatherings at Yashdeep Palace. Enquire about seating, catering and arrangements.",
    ),
  component: MeetingsPage,
});
