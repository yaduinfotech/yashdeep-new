import { createFileRoute } from "@tanstack/react-router";
import { DiningPage } from "@/components/hotel-pages";
import { pageHead } from "@/lib/hotel";
export const Route = createFileRoute("/restaurant")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "Restaurant & Dining",
      "Discover fresh multi-cuisine dining, breakfast, snacks, and beverages at Yashdeep Palace in Khushkhera.",
      {
        path: "/restaurant",
        image: "/assets/og-restaurant.jpg",
        imageAlt: "Restaurant and Dining at Yashdeep Palace Khushkhera",
        cta: "View dining menu & reserve a table.",
      },
    ),
  component: DiningPage,
});
