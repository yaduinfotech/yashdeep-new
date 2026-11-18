import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "@/components/hotel-pages";
import { pageHead } from "@/lib/hotel";

export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "Terms & Conditions",
      "Official room booking policies, check-in rules, mandatory government photo ID verification, tariffs, cancellations, and guest house rules for Yashdeep Palace.",
      {
        path: "/terms",
        image: "/assets/og-home.jpg",
        imageAlt: "Terms & Conditions of Yashdeep Palace",
        cta: "Read our hotel stay policies and booking terms.",
      },
    ),
  component: TermsPage,
});
