import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PrivacyPage, TermsPage } from "@/components/hotel-pages";
import { legalAndPrivacy, hotel } from "@/lib/hotel";

// Mock TanStack Router Link
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    Link: ({ children, to, ...props }: any) => {
      return (
        <a href={typeof to === "string" ? to : ""} {...props}>
          {children}
        </a>
      );
    },
    useRouterState: () => "/",
  };
});

describe("DPDP Act Privacy Policy & Terms and Conditions", () => {
  describe("PrivacyPage (DPDP Act Compliance)", () => {
    it("renders the statutory notice under Section 5 of the DPDP Act 2023", () => {
      render(<PrivacyPage />);

      expect(
        screen.getByText(/Statutory Notice under Section 5, DPDP Act 2023/i),
      ).toBeInTheDocument();
      expect(
        screen.getAllByText(new RegExp(legalAndPrivacy.dataFiduciary, "i")).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByText(/Digital Personal Data Protection Act, 2023/i).length,
      ).toBeGreaterThan(0);
    });

    it("displays itemised categories of personal data collected", () => {
      render(<PrivacyPage />);

      expect(screen.getByText(/Identity & Contact/i)).toBeInTheDocument();
      expect(screen.getByText(/Reservation Parameters/i)).toBeInTheDocument();
      expect(screen.getByText(/Verification & Auth/i)).toBeInTheDocument();
      expect(screen.getByText(/Statutory In-Person ID/i)).toBeInTheDocument();
      expect(screen.getByText(/Cardholder Financial Data Protection/i)).toBeInTheDocument();
    });

    it("details lawful processing purposes and consent withdrawal under Section 6", () => {
      render(<PrivacyPage />);

      expect(screen.getByText(/Specified Lawful Purposes of Processing/i)).toBeInTheDocument();
      expect(screen.getByText(/Fulfillment of Room Reservations/i)).toBeInTheDocument();
      expect(screen.getByText(/Fraud Prevention & Anti-Spam Safeguards/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Consent & Right to Withdraw Consent \(Section 6\)/i),
      ).toBeInTheDocument();
    });

    it("enumerates Data Principal rights under Sections 11 through 14", () => {
      render(<PrivacyPage />);

      expect(screen.getByText(/Right to Access Information \(Sec\. 11\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Right to Correction & Erasure \(Sec\. 12\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Right of Grievance Redressal \(Sec\. 13\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Right to Nominate \(Sec\. 14\)/i)).toBeInTheDocument();
    });

    it("includes child data protection safeguards under Section 9", () => {
      render(<PrivacyPage />);

      expect(
        screen.getByText(/Protection of Children & Minors \(Section 9\)/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /do not track, behaviorally monitor, profile, or direct targeted advertising/i,
        ),
      ).toBeInTheDocument();
    });

    it("publishes designated Data Protection Grievance Officer details and DPBI escalation", () => {
      render(<PrivacyPage />);

      expect(
        screen.getAllByText(new RegExp(legalAndPrivacy.grievanceOfficer.title, "i")).length,
      ).toBeGreaterThan(0);
      expect(screen.getAllByText(legalAndPrivacy.grievanceOfficer.email).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Data Protection Board of India/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/30 calendar days/i).length).toBeGreaterThan(0);
    });

    it("provides quick navigation between Privacy Policy and Terms & Conditions", () => {
      render(<PrivacyPage />);

      const termsLinks = screen.getAllByRole("link", { name: /Terms & Conditions/i });
      expect(termsLinks.length).toBeGreaterThan(0);
      expect(termsLinks[0]).toHaveAttribute("href", "/terms");
    });
  });

  describe("TermsPage (Hotel Stay & Booking Policies)", () => {
    it("renders core stay rules and timings", () => {
      render(<TermsPage />);

      expect(screen.getAllByText(hotel.checkInTime).length).toBeGreaterThan(0);
      expect(screen.getAllByText(hotel.checkOutTime).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Free up to 24 hrs prior/i).length).toBeGreaterThan(0);
    });

    it("explicitly mandates physical Government Photo ID and disallows PAN Cards", () => {
      render(<TermsPage />);

      expect(
        screen.getByText(/Mandatory Government Photo ID Verification at Check-in/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Aadhaar Card, Passport, Voter ID Card, or Driving License/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/PAN Cards are NOT acceptable/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Foreign passport holders must present their original valid/i),
      ).toBeInTheDocument();
    });

    it("clarifies booking request versus confirmed reservation", () => {
      render(<TermsPage />);

      expect(screen.getByText(/Booking Requests vs\. Confirmed Reservations/i)).toBeInTheDocument();
      expect(screen.getByText(/Dual Server-Verified Contact Safeguards/i)).toBeInTheDocument();
    });

    it("details tariffs, GST, non-smoking policy, and jurisdiction", () => {
      render(<TermsPage />);

      expect(
        screen.getByText(/Tariffs, Inclusions, Taxes \(GST\) & Payments/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/100% Non-Smoking Guest Rooms/i)).toBeInTheDocument();
      expect(screen.getByText(/₹2,500/)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(legalAndPrivacy.jurisdiction, "i"))).toBeInTheDocument();
    });

    it("provides quick navigation back to Privacy Policy (DPDP Act)", () => {
      render(<TermsPage />);

      const privacyLinks = screen.getAllByRole("link", { name: /Privacy Policy \(DPDP Act\)/i });
      expect(privacyLinks.length).toBeGreaterThan(0);
      expect(privacyLinks[0]).toHaveAttribute("href", "/privacy");
    });
  });
});
