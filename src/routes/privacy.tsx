import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/components/hotel-pages";
import { pageHead } from "@/lib/hotel";
export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "Privacy & Booking Terms",
      "How Yashdeep Palace website enquiries work, how your information is used, and what to confirm before reserving.",
    ),
  component: PrivacyPage,
});
