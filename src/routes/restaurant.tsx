import { createFileRoute } from "@tanstack/react-router";
import { DiningPage } from "@/components/hotel-pages";
import { pageHead } from "@/lib/hotel";
export const Route = createFileRoute("/restaurant")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "Restaurant & Dining",
      "Discover restaurant dining at Yashdeep Palace in Khushkhera. Contact the hotel for menus, hours and table enquiries.",
    ),
  component: DiningPage,
});
