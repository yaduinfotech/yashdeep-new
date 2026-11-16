import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/hotel-sections";
import { pageHead } from "@/lib/hotel";
export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    ...pageHead(
      "Hotel in Khushkhera, Rajasthan",
      "Discover Yashdeep Palace in the Khushkhera–Tapukara area. Explore genuine room photographs, dining, meeting facilities and direct reservation enquiries.",
    ),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Hotel",
          name: "Yashdeep Palace",
          description:
            "Hotel with accommodation, restaurant and meeting facilities in Khushkhera, Rajasthan.",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Khushkhera",
            addressRegion: "Rajasthan",
            addressCountry: "IN",
          },
        }),
      },
    ],
  }),
  component: HomePage,
});
