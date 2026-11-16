import { createFileRoute } from "@tanstack/react-router";
import { RoomsPage } from "@/components/hotel-pages";
import { pageHead } from "@/lib/hotel";
export const Route = createFileRoute("/rooms/")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "Rooms & Accommodation",
      "Explore Deluxe and Luxury Double Rooms at Yashdeep Palace with air-conditioned comfort, high-speed Wi-Fi, and 24/7 room service.",
      {
        path: "/rooms",
        image: "/assets/og-deluxe.jpg",
        imageAlt: "Deluxe and Luxury Rooms at Yashdeep Palace Khushkhera",
        cta: "Compare rooms & reserve your stay today.",
      },
    ),
  component: RoomsPage,
});
