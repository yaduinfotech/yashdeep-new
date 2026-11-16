import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/hotel-pages";
import { pageHead } from "@/lib/hotel";
export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "About the Hotel",
      "Get to know Yashdeep Palace, a hotel offering warm hospitality, comfortable accommodation, dining and meeting spaces in Khushkhera, Rajasthan.",
      {
        path: "/about",
        image: "/assets/og-home.jpg",
        imageAlt: "About Yashdeep Palace Khushkhera",
        cta: "Experience genuine hospitality in Khushkhera.",
      },
    ),
  component: AboutPage,
});
