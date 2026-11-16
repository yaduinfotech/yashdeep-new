import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/components/hotel-pages";
import { pageHead } from "@/lib/hotel";
export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "Privacy & Booking Terms",
      "Learn how Yashdeep Palace website enquiries work, how your information is handled securely, and what terms apply to your booking.",
      {
        path: "/privacy",
        image: "/assets/og-home.jpg",
        imageAlt: "Privacy and Booking Terms at Yashdeep Palace",
        cta: "Read our guest privacy and data policies.",
      },
    ),
  component: PrivacyPage,
});
