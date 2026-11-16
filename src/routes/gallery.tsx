import { createFileRoute } from "@tanstack/react-router";
import { GalleryPage } from "@/components/hotel-pages";
import { pageHead } from "@/lib/hotel";
export const Route = createFileRoute("/gallery")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "Property Photo Gallery",
      "View real photographs of the Yashdeep Palace exterior, reception, deluxe & luxury guest rooms, restaurant, and meeting lounge.",
      {
        path: "/gallery",
        image: "/assets/og-home.jpg",
        imageAlt: "Photo Gallery of Yashdeep Palace Khushkhera",
        cta: "Take a visual tour and explore our property.",
      },
    ),
  component: GalleryPage,
});
