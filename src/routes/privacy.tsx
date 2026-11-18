import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/components/hotel-pages";
import { pageHead } from "@/lib/hotel";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "Privacy Policy (DPDP Act)",
      "Digital Personal Data Protection Act, 2023 compliance notice, guest privacy rights, lawful data processing, and grievance redressal for Yashdeep Palace.",
      {
        path: "/privacy",
        image: "/assets/og-home.jpg",
        imageAlt: "Privacy Policy under DPDP Act at Yashdeep Palace",
        cta: "Read our guest privacy policy under the DPDP Act.",
      },
    ),
  component: PrivacyPage,
});
