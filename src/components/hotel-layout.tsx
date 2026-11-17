import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Crown, Phone, MapPin, Mail, Menu, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { hotel } from "@/lib/hotel";
import { CustomerHeaderLink } from "./customer-header-link";

const nav = [
  { to: "/", label: "Home" },
  { to: "/rooms", label: "Rooms & Suites" },
  { to: "/restaurant", label: "Dining" },
  { to: "/meetings", label: "Meetings & Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;
export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Yashdeep Palace home">
      <span className="brand-mark">
        <img src="/assets/logo.png" alt="Logo" />
      </span>
      <span className="brand-title">
        Yashdeep Palace<span className="brand-subtitle">Comfort. Hospitality. Elegance.</span>
      </span>
    </Link>
  );
}
export function HotelHeader() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className={`nav-link ${path === n.to ? "active" : ""}`}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <CustomerHeaderLink />
            <a
              className="phone-icon"
              href={hotel.phoneLink}
              aria-label="Call reception"
              title="Call reception"
            >
              <Phone size={17} />
            </a>
            <Button variant="hotel" asChild>
              <Link to="/booking">
                Book your stay <ArrowRight />
              </Link>
            </Button>
            <Button
              className="mobile-menu-trigger"
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </Button>
          </div>
        </div>
      </header>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Yashdeep Palace</DialogTitle>
          <DialogDescription>Explore the hotel</DialogDescription>
          <nav className="footer-links">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}>
                {n.label}
              </Link>
            ))}
            <Link to="/auth" onClick={() => setOpen(false)}>
              Customer signup / account
            </Link>
            <Link to="/booking" onClick={() => setOpen(false)}>
              Book your stay
            </Link>
          </nav>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="content-width">
        <div>
          <h2>Your next stay, thoughtfully taken care of.</h2>
          <p>A warm welcome awaits at Yashdeep Palace, Khushkhera.</p>
        </div>
        <Button variant="hotel" asChild>
          <Link to="/booking">
            Plan your stay <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}
export function HotelFooter() {
  return (
    <>
      <footer className="site-footer">
        <div className="content-width">
          <div className="footer-grid">
            <div>
              <Brand />
              <p>
                Comfortable stays, warm Indian hospitality,
                <br />
                and a little room to slow down.
              </p>
            </div>
            <div>
              <h3>Discover</h3>
              <div className="footer-links">
                <Link to="/rooms">Rooms & accommodation</Link>
                <Link to="/restaurant">Restaurant & dining</Link>
                <Link to="/meetings">Meetings & events</Link>
                <Link to="/gallery">Property gallery</Link>
              </div>
            </div>
            <div>
              <h3>Your stay</h3>
              <div className="footer-links">
                <Link to="/about">About Yashdeep Palace</Link>
                <Link to="/booking">Reservation enquiries</Link>
                <Link to="/contact">Contact & directions</Link>
                <Link to="/privacy">Privacy & booking terms</Link>
              </div>
            </div>
            <div>
              <h3>Find us</h3>
              <div className="footer-contact">
                <MapPin />
                <a href={hotel.maps} target="_blank" rel="noreferrer">
                  {hotel.address}
                </a>
              </div>
              <div className="footer-contact">
                <Phone />
                <a href={hotel.phoneLink}>{hotel.phone}</a> /
                <a href={hotel.phone2}>{hotel.phone2}</a>
              </div>
              <div className="footer-contact">
                <Mail />
                <a href={`mailto:${hotel.email}`}>{hotel.email}</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Yashdeep Palace. All rights reserved.</span>
            <span>Khushkhera, Rajasthan · Indian hospitality, warmly delivered.</span>
          </div>
        </div>
      </footer>
      <div className="mobile-booking">
        <span>
          Make yourself at home.
          <br />
          Plan your next stay.
        </span>
        <Button variant="hotel" asChild>
          <Link to="/booking">
            Book your stay <ArrowRight />
          </Link>
        </Button>
      </div>
    </>
  );
}
export function PageBanner({
  title,
  description,
  eyebrow = "Yashdeep Palace",
}: {
  title: string;
  description: string;
  eyebrow?: string;
}) {
  return (
    <section className="page-banner">
      <div className="content-width">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{title}</span>
        </div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
