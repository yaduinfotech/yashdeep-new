import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowLeft,
  BedDouble,
  Users,
  Wifi,
  Wind,
  Phone,
  Mail,
  MapPin,
  Coffee,
  CheckCircle,
  ParkingMeter,
  Car,
  PhoneCall,
  KeyRound,
  ShieldCheck,
  Check,
  Sparkles,
  Clock,
  Zap,
  Maximize2,
  Compass,
  Info,
  MessageCircle,
  Shield,
  FileText,
  Lock,
  Scale,
  AlertTriangle,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  hotel,
  legalAndPrivacy,
  images,
  rooms,
  photos,
  diningInfo,
  aboutInfo,
  enquiryMail,
  validateStay,
  localToday,
  type Stay,
} from "@/lib/hotel";
import { submitEnquiry } from "@/lib/api.functions";
import { sendEmailCode, verifyEmailCode } from "@/lib/customer.functions";
import { useCustomer } from "./customer-session";
import { PageBanner, FinalCTA } from "./hotel-layout";
import { RoomCards, FAQSection } from "./hotel-sections";

export function RoomsPage() {
  return (
    <>
      <PageBanner
        title="Rooms & accommodation"
        description="A quiet space to rest, recharge and feel at home. Explore our accommodation and contact reception for current rates and availability."
        eyebrow="Make yourself at home"
      />
      <section className="section">
        <div className="content-width">
          <RoomCards />
          <p className="rate-note mt-4">
            Please confirm your preferred configuration and inclusions before booking.
          </p>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

export function RoomDetail({ slug }: { slug: string }) {
  const room = rooms.find((r) => r.slug === slug);
  const gallery = room?.gallery && room.gallery.length > 0 ? room.gallery : [room?.image || ""];
  const [selectedPhoto, setSelectedPhoto] = useState(gallery[0]);

  if (!room) {
    return (
      <>
        <PageBanner
          title="Room not available"
          description="The requested room could not be found. Please explore our accommodation or contact reception."
        />
        <section className="section">
          <div className="content-width text-center py-12">
            <p className="text-muted-foreground mb-6">
              Explore our available rooms or speak with our front desk team.
            </p>
            <Button variant="hotel" asChild>
              <Link to="/rooms">
                View all rooms <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </>
    );
  }

  // Other room for comparison/cross-sell
  const otherRoom = rooms.find((r) => r.slug !== slug);

  return (
    <>
      <PageBanner
        title={room.name}
        description={room.description}
        eyebrow="Your Private Sanctuary · Khushkhera"
      />

      <section className="section">
        <div className="content-width detail-grid">
          {/* Left Column: Image showcase with interactive thumbnails */}
          <div>
            <div className="relative overflow-hidden rounded-xl border border-border shadow-sm bg-muted/30">
              <img
                src={selectedPhoto}
                alt={`${room.name} at Yashdeep Palace`}
                className="w-full aspect-[4/3] object-cover transition-all duration-300 hover:scale-[1.02]"
                width="800"
                height="600"
              />
              {room.tag && (
                <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded shadow">
                  {room.tag}
                </span>
              )}
            </div>

            {/* Gallery thumbnails */}
            {gallery.length > 1 && (
              <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1" aria-label="Room photos">
                {gallery.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setSelectedPhoto(img)}
                    className={`relative shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedPhoto === img
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${room.name} view ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Trust Highlights */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-card border border-border/80 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-primary size-4 shrink-0" />
                <span>Best Rate Guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary size-4 shrink-0" />
                <span>Free 24h Cancellation</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="text-primary size-4 shrink-0" />
                <span>100% Power Backup</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="text-primary size-4 shrink-0" />
                <span>Free Secured Parking</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="text-primary size-4 shrink-0" />
                <span>High-Speed Wi-Fi</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-primary size-4 shrink-0" />
                <span>24/7 Front Desk</span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Specs, and Booking Action Card */}
          <div className="detail-copy flex flex-col justify-between">
            <div>
              <div className="room-rate-display mb-4">
                <div className="room-rate-numbers flex items-baseline gap-3">
                  <span
                    className="room-current-price"
                    style={{ fontSize: "32px", fontWeight: 600 }}
                  >
                    ₹{room.price.toLocaleString("en-IN")}
                  </span>
                  {room.original_price && (
                    <span className="room-original-price line-through text-muted-foreground text-lg">
                      ₹{room.original_price.toLocaleString("en-IN")}
                    </span>
                  )}
                  {room.original_price && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Save ₹{(room.original_price - room.price).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <span className="room-rate-period text-xs text-muted-foreground mt-1 block">
                  per night + 5% GST · Best direct rate guaranteed · Zero booking fees
                </span>
              </div>

              <h2>Settle in. Slow down.</h2>
              <p className="mt-2 text-sm leading-relaxed">{room.description}</p>

              {/* Room Specifications Ribbon */}
              <div className="my-5 grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-muted/40 rounded-lg border border-border text-xs">
                <div className="flex items-center gap-2">
                  <Users className="text-primary size-4 shrink-0" />
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                      Occupancy
                    </span>
                    <span className="font-medium text-foreground">{room.occupancy}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BedDouble className="text-primary size-4 shrink-0" />
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                      Bed Type
                    </span>
                    <span className="font-medium text-foreground">{room.bed}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="text-primary size-4 shrink-0" />
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                      Climate
                    </span>
                    <span className="font-medium text-foreground">Split AC</span>
                  </div>
                </div>
                {room.size && (
                  <div className="flex items-center gap-2">
                    <Maximize2 className="text-primary size-4 shrink-0" />
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                        Room Size
                      </span>
                      <span className="font-medium text-foreground">{room.size}</span>
                    </div>
                  </div>
                )}
                {room.view && (
                  <div className="flex items-center gap-2">
                    <Compass className="text-primary size-4 shrink-0" />
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                        View
                      </span>
                      <span className="font-medium text-foreground">{room.view}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="text-primary size-4 shrink-0" />
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                      Timing
                    </span>
                    <span className="font-medium text-foreground">
                      {hotel.checkInTime} In / {hotel.checkOutTime} Out
                    </span>
                  </div>
                </div>
              </div>

              {/* Inclusions summary list */}
              {room.inclusions && room.inclusions.length > 0 && (
                <div className="mb-6 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    What's included in your stay:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {room.inclusions.map((inc) => (
                      <div key={inc} className="flex items-start gap-2">
                        <Check className="text-primary size-3.5 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Booking & Instant Help Actions */}
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <Button
                variant="hotel"
                size="lg"
                className="w-full text-xs tracking-wider uppercase font-semibold"
                asChild
              >
                <Link to="/booking" search={{ room: room.name }}>
                  Reserve this room <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                  <a href={hotel.phoneLink}>
                    <Phone className="size-3.5 mr-1" /> Call Reception {hotel.phone} /{" "}
                    {hotel.phone2}
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                  <a href={hotel.whatsapp} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-3.5 mr-1 text-emerald-600" /> WhatsApp Enquiry
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Amenities by Category */}
        {room.amenityGroups && room.amenityGroups.length > 0 && (
          <div className="content-width mt-16 pt-12 border-t border-border">
            <div className="section-heading mb-8">
              <div>
                <div className="eyebrow">Everything you need for a restful stay</div>
                <h2>Room Amenities & Comforts</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {room.amenityGroups.map((grp) => (
                <div
                  key={grp.category}
                  className="p-5 rounded-xl bg-card border border-border shadow-xs space-y-3"
                >
                  <h3 className="font-serif text-lg font-medium text-foreground pb-2 border-b border-border/70">
                    {grp.category}
                  </h3>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {grp.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="text-primary size-3.5 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stay Policies & Guidelines Card */}
        <div className="content-width mt-12">
          <div className="p-6 rounded-xl bg-muted/40 border border-border">
            <h3 className="font-serif text-xl font-medium mb-3 flex items-center gap-2">
              <Info className="text-primary size-5" /> Stay Policies & House Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-muted-foreground mt-4">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Check-in & Check-out</h4>
                <p>
                  Standard check-in is at {hotel.checkInTime} and check-out is at{" "}
                  {hotel.checkOutTime}. Early check-in or late check-out is available upon request
                  (subject to room availability).
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Government ID Requirement</h4>
                <p>
                  All adult guests must present a valid government-issued photo ID (Aadhaar,
                  Passport, or Driving License) at the reception desk during check-in.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Cancellation & Changes</h4>
                <p>
                  Enjoy flexible reservations with free cancellation up to 24 hours prior to
                  check-in. Contact reception directly to reschedule or modify your booking.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Room Comparison Card */}
        {otherRoom && (
          <div className="content-width mt-12 p-6 rounded-xl border border-border bg-card flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={otherRoom.image}
                alt={otherRoom.name}
                className="w-24 h-20 rounded-lg object-cover border border-border shrink-0"
              />
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Also available
                </span>
                <h3 className="font-serif text-xl font-medium mt-0.5">{otherRoom.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-md line-clamp-1">
                  {otherRoom.description}
                </p>
                <span className="text-sm font-semibold text-primary mt-1 block">
                  ₹{otherRoom.price.toLocaleString("en-IN")} / night + 5% GST
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button variant="outline" asChild>
                <Link to="/rooms/$room" params={{ room: otherRoom.slug }}>
                  View details
                </Link>
              </Button>
              <Button variant="hotel" asChild>
                <Link to="/booking" search={{ room: otherRoom.name }}>
                  Book {otherRoom.name} <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </section>

      <FAQSection />
    </>
  );
}

export function DiningPage() {
  const [activeMenuTab, setActiveMenuTab] = useState(0);

  return (
    <>
      <PageBanner
        title={diningInfo.title}
        description={diningInfo.description}
        eyebrow={diningInfo.eyebrow}
      />

      {/* Main Dining Showcase Section */}
      <section className="section">
        <div className="content-width detail-grid">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl border border-border shadow-sm">
              <img
                src={images.restaurant}
                alt="Actual restaurant at Yashdeep Palace"
                className="w-full aspect-[4/3] object-cover transition-all duration-300 hover:scale-[1.02]"
                width="800"
                height="600"
              />
              <span className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1.5 rounded border border-border/80">
                Multi-Cuisine Dining · Khushkhera
              </span>
            </div>

            {/* Quick Dining Atmosphere Thumbnails */}
            <div className="grid grid-cols-3 gap-2.5">
              {diningInfo.gallery.slice(1).map((photo, idx) => (
                <div
                  key={photo + idx}
                  className="rounded-lg overflow-hidden border border-border aspect-[4/3]"
                >
                  <img
                    src={photo}
                    alt={`Dining atmosphere ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="detail-copy flex flex-col justify-between">
            <div>
              <div className="eyebrow">At the table</div>
              <h2>
                A meal to make
                <br />
                your day memorable.
              </h2>
              <p className="mt-3 text-sm leading-relaxed">
                Bring your appetite and your favourite company. The restaurant at Yashdeep Palace
                offers a comfortable, air-conditioned setting for resident guests, visiting business
                delegates, and local visitors alike.
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                Our kitchen blends the authentic culinary traditions of Rajasthan and North India
                with homestyle care, comforting Chinese favourites, and wholesome breakfasts.
                Whether you need a quick executive lunch or a relaxed dinner after work, we make
                space for great food and genuine company.
              </p>

              {/* Key Dining Pillars */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {diningInfo.features.map((f) => (
                  <div
                    key={f.title}
                    className="p-3 rounded-lg bg-card border border-border/80 space-y-1"
                  >
                    <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-primary shrink-0" />
                      {f.title}
                    </h4>
                    <p className="text-muted-foreground text-[11px] leading-normal">
                      {f.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center gap-3">
              <Button variant="hotel" asChild>
                <a
                  href="https://zeesto.ai.studio/menu/yashdeep-palace"
                  target="_blank"
                  rel="noreferrer"
                  title="Explore Digital Menu"
                >
                  View full digital menu <ArrowRight />
                </a>
              </Button>
              <Button variant="hotel" size="sm" asChild>
                <a href={hotel.phoneLink}>
                  <Phone className="size-3.5 mr-1.5" /> Call Front Desk
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Operating Hours & Meal Schedule */}
        <div className="content-width mt-16 pt-12 border-t border-border">
          <div className="section-heading mb-8">
            <div>
              <div className="eyebrow">Timings & Service</div>
              <h2>Operating Hours & Meal Schedule</h2>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs">
              Room service delivery and takeaway available for all resident guests.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {diningInfo.hours.map((h, i) => (
              <div
                key={h.meal}
                className="p-5 rounded-xl bg-card border border-border shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    Meal {i + 1}
                  </span>
                  <Clock className="size-4 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-lg font-medium text-foreground">{h.meal}</h3>
                <div className="text-sm font-semibold text-primary">{h.time}</div>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/60">
                  {h.note}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate & Group Dining Banner */}
        <div className="content-width mt-16 p-8 rounded-2xl bg-secondary text-hero-foreground flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">
              Corporate & Group Gatherings
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-medium text-hero-foreground">
              Hosting an executive lunch or company dinner?
            </h3>
            <p className="text-xs text-hero-muted leading-relaxed">
              We provide customized corporate thalis, buffet spreads, and private hall arrangements
              for teams visiting Honda Cars, Karuli, Tapukara, and Khushkhera plants. Special
              dietary plans and packed boxes available.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button variant="hotel" asChild>
              <Link to="/contact" search={{ type: "Restaurant enquiry" }}>
                Plan corporate meal <ArrowRight />
              </Link>
            </Button>
            <Button variant="hotelOutline" asChild>
              <a href={hotel.phoneLink}>
                <Phone className="size-4" /> Call manager
              </a>
            </Button>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

export function MeetingsPage() {
  return (
    <>
      <PageBanner
        title="Meetings & events"
        description="Bring people together for business conversations, small gatherings and time well spent."
        eyebrow="Space for connection"
      />
      <section className="section">
        <div className="content-width detail-grid">
          <img
            src={images.meeting}
            alt="Actual Yashdeep Palace meeting room and lounge"
            width="800"
            height="650"
          />
          <div className="detail-copy">
            <h2>
              A place to meet.
              <br />A reason to connect.
            </h2>
            <p>
              Our meeting room and lounge provide a setting for business travellers and groups
              visiting the Khushkhera industrial area.
            </p>
            <p>
              Share your date, group size and requirements with the hotel. Reception will confirm
              seating capacity, layout, equipment, catering options and pricing.
            </p>
            <Button variant="hotel" asChild>
              <Link to="/contact" search={{ type: "Meeting or event enquiry" }}>
                Plan your gathering <ArrowRight />
              </Link>
            </Button>
            <div className="policy-note">
              Meeting facilities are available. Specific event arrangements and capacities are
              subject to confirmation.
            </div>
          </div>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

export function AboutPage() {
  return (
    <>
      <PageBanner
        title={aboutInfo.title}
        description={aboutInfo.subtitle}
        eyebrow={aboutInfo.eyebrow}
      />

      <section className="section">
        {/* Story Section */}
        <div className="content-width detail-grid">
          <div className="relative overflow-hidden rounded-xl border border-border shadow-sm">
            <img
              src={images.exterior}
              alt="Yashdeep Palace hotel facade in Khushkhera"
              className="w-full aspect-[4/3] object-cover transition-all duration-300 hover:scale-[1.02]"
              width="800"
              height="600"
            />
            <span className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1.5 rounded border border-border/80">
              Opposite Honda Car Gate No. 4 · Khushkhera
            </span>
          </div>

          <div className="detail-copy flex flex-col justify-between">
            <div>
              <div className="eyebrow">Our Story</div>
              <h2>
                Rooted in hospitality.
                <br />
                Crafted for your stay.
              </h2>
              {aboutInfo.story.map((para, i) => (
                <p key={i} className="mt-3 text-sm leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-border flex items-center gap-4">
              <Button variant="hotel" asChild>
                <Link to="/booking">
                  Book your stay <ArrowRight />
                </Link>
              </Button>
              <Link to="/gallery" className="text-link text-xs">
                View property gallery <ArrowRight />
              </Link>
            </div>
          </div>
        </div>

        {/* Fact Sheet & Key Numbers */}
        <div className="content-width mt-16 pt-12 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {aboutInfo.stats.map((s) => (
              <div
                key={s.label}
                className="p-6 rounded-xl bg-card border border-border text-center shadow-xs space-y-1"
              >
                <span className="font-serif text-3xl md:text-4xl font-semibold text-primary block">
                  {s.value}
                </span>
                <span className="font-medium text-xs text-foreground block">{s.label}</span>
                <span className="text-[11px] text-muted-foreground block">{s.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Core Hospitality Pillars */}
        <div className="content-width mt-16">
          <div className="section-heading mb-8">
            <div>
              <div className="eyebrow">Why Guests Choose Us</div>
              <h2>Our Core Hospitality Pillars</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aboutInfo.pillars.map((p, idx) => (
              <div
                key={p.title}
                className="p-6 rounded-xl bg-card border border-border shadow-xs space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-serif text-primary text-xl font-semibold">0{idx + 1}.</span>
                  <h3 className="font-serif text-xl font-medium text-foreground">{p.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Industrial Proximity Matrix */}
        <div className="content-width mt-16">
          <div className="section-heading mb-8">
            <div>
              <div className="eyebrow">Prime Industrial Location</div>
              <h2>Nearby Corporate & Industrial Hubs</h2>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs">
              Direct access across the Karuli, Tapukara, and Khushkhera manufacturing zones.
            </p>
          </div>

          <div className="rounded-xl border border-border overflow-hidden bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/70 border-b border-border text-foreground font-semibold">
                  <tr>
                    <th className="p-3.5">Destination / Hub</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Approx Distance</th>
                    <th className="p-3.5">Travel Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {aboutInfo.landmarks.map((lm) => (
                    <tr key={lm.name} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 font-medium text-foreground flex items-center gap-2">
                        <MapPin className="size-3.5 text-primary shrink-0" />
                        {lm.name}
                      </td>
                      <td className="p-3.5 text-muted-foreground">{lm.category}</td>
                      <td className="p-3.5 text-foreground font-mono">{lm.distance}</td>
                      <td className="p-3.5">
                        <span className="inline-block px-2 py-0.5 rounded bg-primary/15 text-primary font-medium text-[11px]">
                          {lm.travelTime}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3.5 bg-muted/40 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
              <span>
                GPS: Yashdeep Palace, Opposite Honda Car Gate No. 4, Karuli Industrial Area,
                Khushkhera
              </span>
              <a
                href={hotel.maps}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                Open in Google Maps <ArrowRight className="size-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Hotel Facilities Grid */}
        <div className="content-width mt-16">
          <div className="section-heading mb-8">
            <div>
              <div className="eyebrow">Integrated Comfort</div>
              <h2>Hotel Facilities & Services</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {aboutInfo.facilities.map((fac) => (
              <div
                key={fac.title}
                className="p-5 rounded-xl bg-card border border-border shadow-xs space-y-2"
              >
                <h3 className="font-serif text-lg font-medium text-foreground flex items-center gap-2">
                  <CheckCircle className="size-4 text-primary shrink-0" />
                  {fac.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{fac.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Walkthrough Gallery */}
        <div className="content-width mt-16">
          <div className="section-heading mb-8">
            <div>
              <div className="eyebrow">See For Yourself</div>
              <h2>Property Atmosphere</h2>
            </div>
            <Link to="/gallery" className="text-link text-xs">
              View complete photo gallery <ArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {aboutInfo.gallery.slice(0, 4).map((img, idx) => (
              <div
                key={img + idx}
                className="rounded-xl overflow-hidden border border-border aspect-[4/3] relative group"
              >
                <img
                  src={img}
                  alt={`Yashdeep Palace property highlight ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
export function GalleryPage() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<number | undefined>();
  const filtered = photos.filter((p) => filter === "All" || p.category === filter);
  const current = selected === undefined ? undefined : filtered[selected];
  return (
    <>
      <PageBanner
        title="The property gallery"
        description="An honest glimpse of Yashdeep Palace."
        eyebrow="See your stay"
      />
      <section className="section">
        <div className="content-width">
          <div className="filter-tabs" aria-label="Gallery filters">
            {["All", "Exterior", "Reception", "Rooms", "Dining", "Meetings"].map((f) => (
              <Button
                key={f}
                variant={f === filter ? "default" : "outline"}
                onClick={() => {
                  setFilter(f);
                  setSelected(undefined);
                }}
                aria-pressed={f === filter}
              >
                {f}
              </Button>
            ))}
          </div>
          <div className="gallery-grid">
            {filtered.map((p, i) => (
              <Button
                className="gallery-tile"
                variant="ghost"
                key={p.title}
                onClick={() => setSelected(i)}
                aria-label={`View ${p.title}`}
              >
                <img src={p.image} alt={p.title} loading="lazy" width="500" height="385" />
                <span>{p.title}</span>
              </Button>
            ))}
          </div>
        </div>
      </section>
      <Dialog
        open={selected !== undefined}
        onOpenChange={(o) => {
          if (!o) setSelected(undefined);
        }}
      >
        <DialogContent className="lightbox">
          <DialogTitle>{current?.title}</DialogTitle>
          <DialogDescription>Yashdeep Palace property photograph</DialogDescription>
          {current && <img className="lightbox-image" src={current.image} alt={current.title} />}
          <div className="lightbox-controls">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous photograph"
              onClick={() => setSelected((i) => ((i ?? 0) - 1 + filtered.length) % filtered.length)}
            >
              <ArrowLeft />
            </Button>
            <span>
              {(selected ?? 0) + 1} / {filtered.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next photograph"
              onClick={() => setSelected((i) => ((i ?? 0) + 1) % filtered.length)}
            >
              <ArrowRight />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <FinalCTA />
    </>
  );
}

type EnquiryType =
  "General enquiry" | "Restaurant enquiry" | "Meeting or event enquiry" | "Reservation enquiry";

export { BookingPage } from "./booking-wizard";
export function ContactPage({ type = "General enquiry" }: { type?: string | undefined }) {
  const { user } = useCustomer();
  const [review, setReview] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    email: string;
    phone: string;
    type: EnquiryType;
    message: string;
  }>({
    name: "",
    email: user?.email || "",
    phone: "",
    type: (type as EnquiryType) || "General enquiry",
    message: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  // Email OTP verification state before submitting enquiry
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpNotice, setOtpNotice] = useState("");
  const [verificationToken, setVerificationToken] = useState("");

  const submitFn = useServerFn(submitEnquiry);
  const sendEmailOtp = useServerFn(sendEmailCode);
  const verifyEmailOtp = useServerFn(verifyEmailCode);

  const isEmailAlreadyVerified = Boolean(
    user?.email_confirmed_at && user.email?.toLowerCase() === form.email.trim().toLowerCase(),
  );

  async function handleSendEmailOtp() {
    setError("");
    setOtpNotice("");
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const res = await sendEmailOtp({
        data: {
          email: form.email.trim(),
          name: form.name.trim(),
          signup: false,
        },
      });
      if (res?.ok) {
        setOtpSent(true);
        setOtpNotice(res.message || `Verification code sent to ${form.email}.`);
      } else {
        setError(res?.message || "Could not send verification code.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send verification code. Please check your email.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    // If email is not yet verified, require email OTP
    if (!isEmailAlreadyVerified && !verificationToken) {
      if (!otpSent) {
        await handleSendEmailOtp();
        return;
      }
      if (!otpCode || otpCode.trim().length < 6) {
        setError("Please enter the 6-digit verification code sent to your email.");
        return;
      }

      setBusy(true);
      try {
        const verifyRes = await verifyEmailOtp({
          data: {
            email: form.email.trim(),
            code: otpCode.trim(),
          },
        });
        if (!verifyRes?.ok) {
          setError(verifyRes?.message || "Invalid or expired verification code.");
          setBusy(false);
          return;
        }

        const token = verifyRes.verificationToken;
        if (token) setVerificationToken(token);

        const res = await submitFn({
          data: {
            ...form,
            email: form.email.trim(),
            verificationToken: token,
          },
        });
        setReference(res.reference || "RECEIVED");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unable to verify code or submit enquiry.";
        setError(msg);
      } finally {
        setBusy(false);
      }
      return;
    }

    // Direct submission when email is already verified
    setBusy(true);
    try {
      const res = await submitFn({
        data: {
          ...form,
          email: form.email.trim(),
          verificationToken,
        },
      });
      setReference(res.reference || "RECEIVED");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to submit enquiry.";
      setError(msg);
      setReview(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageBanner
        title="Contact & directions"
        description="A question, a room enquiry, or a gathering to plan? Get in touch with reception."
        eyebrow="Let's make your visit easy"
      />
      <section className="section">
        <div className="content-width enquiry-layout">
          <div>
            {reference ? (
              <div className="review-panel">
                <CheckCircle className="text-gold mb-3" size={36} />
                <h2>Enquiry received.</h2>
                <p>Thank you, {form.name}. Your enquiry has been routed directly to reception.</p>
                <p className="rate-note">Enquiry reference: {reference}</p>
                <div className="wizard-actions mt-6">
                  <Button variant="hotel" asChild>
                    <a href={hotel.phoneLink}>
                      <Phone />
                      Call reception
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReference("");
                      setOtpSent(false);
                      setOtpCode("");
                      setVerificationToken("");
                      setForm({
                        name: "",
                        email: user?.email || "",
                        phone: "",
                        type: "General enquiry",
                        message: "",
                      });
                    }}
                  >
                    Submit another enquiry
                  </Button>
                </div>
              </div>
            ) : (
              <form className="enquiry-form" onSubmit={handleSubmit}>
                <h2 className="full-field">We'd love to hear from you.</h2>
                <div className="form-field">
                  <label htmlFor="contact-name">Full name *</label>
                  <input
                    id="contact-name"
                    required
                    maxLength={150}
                    value={form.name}
                    onChange={(e) => {
                      setReview(false);
                      setForm((f) => ({ ...f, name: e.target.value }));
                    }}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="contact-email">Email address *</label>
                  <input
                    id="contact-email"
                    readOnly={isEmailAlreadyVerified}
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => {
                      setReview(false);
                      setOtpSent(false);
                      setVerificationToken("");
                      setForm((f) => ({ ...f, email: e.target.value }));
                    }}
                  />
                  {isEmailAlreadyVerified && (
                    <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                      <ShieldCheck size={14} /> Email verified
                    </span>
                  )}
                </div>
                <div className="form-field">
                  <label htmlFor="contact-phone">Phone Number *</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => {
                      setReview(false);
                      setForm((f) => ({ ...f, phone: e.target.value }));
                    }}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="contact-type">Enquiry type</label>
                  <select
                    id="contact-type"
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value as EnquiryType }))
                    }
                  >
                    {[
                      "General enquiry",
                      "Restaurant enquiry",
                      "Meeting or event enquiry",
                      "Reservation enquiry",
                    ].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field full-field">
                  <label htmlFor="contact-message">Your message *</label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    maxLength={2000}
                    value={form.message}
                    onChange={(e) => {
                      setReview(false);
                      setForm((f) => ({ ...f, message: e.target.value }));
                    }}
                  />
                </div>

                {/* Email OTP Verification Challenge Section */}
                {otpSent && !isEmailAlreadyVerified && !verificationToken && (
                  <div className="full-field rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
                    <h3 className="text-base font-semibold flex items-center gap-2">
                      <KeyRound className="text-gold" size={18} /> Verify Your Email Address
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      We sent a 6-digit verification code to <strong>{form.email}</strong>. Please
                      enter it below to confirm your enquiry.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={8}
                        placeholder="6-digit code"
                        className="w-44 px-3 py-2 rounded-md border border-input bg-background font-mono text-center tracking-widest text-base"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      />
                      <Button
                        type="submit"
                        variant="hotel"
                        disabled={busy || otpCode.trim().length < 6}
                      >
                        {busy ? "Verifying & Submitting…" : "Verify & Submit Enquiry"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={handleSendEmailOtp}
                      >
                        Resend code
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode("");
                        }}
                      >
                        Change email
                      </Button>
                    </div>
                    {otpNotice && (
                      <p className="text-xs text-emerald-600 font-medium">{otpNotice}</p>
                    )}
                  </div>
                )}

                {error && (
                  <p className="form-error full-field" role="alert">
                    {error}
                  </p>
                )}
                <div className="full-field">
                  {review ? (
                    <>
                      <p className="policy-note">
                        The server was unable to save your enquiry automatically. Open your email
                        app to send it directly to reception or call reception at{" "}
                        <a href={`tel:${hotel.phone}`}>{hotel.phone}</a>.
                      </p>
                      <Button variant="hotel" asChild>
                        <a
                          href={enquiryMail(
                            `${form.type} — Yashdeep Palace`,
                            `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`,
                          )}
                        >
                          <Mail />
                          Open email enquiry
                        </a>
                      </Button>
                    </>
                  ) : (
                    !otpSent && (
                      <>
                        <Button variant="hotel" type="submit" disabled={busy}>
                          {busy
                            ? "Sending verification code…"
                            : isEmailAlreadyVerified
                              ? "Send enquiry"
                              : "Verify Email & Send Enquiry"}
                          <ArrowRight />
                        </Button>

                        <a
                          type="button"
                          className="ml-5 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hotel-button bg-primary text-primary-foreground hover:bg-primary/85 h-9 px-4 py-2 "
                          href={`tel:${hotel.phone}`}
                        >
                          {"Call Reception"}
                        </a>
                      </>
                    )
                  )}
                </div>
              </form>
            )}
          </div>
          <aside className="booking-aside">
            <h2>Speak with reception.</h2>
            <div className="footer-contact">
              <Phone />
              <a href={hotel.phoneLink}>{hotel.phone}</a>
            </div>
            <div className="footer-contact">
              <Mail />
              <a href={`mailto:${hotel.email}`}>{hotel.email}</a>
            </div>
            <div className="footer-contact">
              <MapPin />
              <span>{hotel.address}</span>
            </div>
            <p>Please confirm directions before travelling.</p>
            <Button variant="outline" asChild>
              <a href={hotel.maps} target="_blank" rel="noreferrer">
                <MapPin />
                Find directions
              </a>
            </Button>
            <p className="mt-6">
              For restaurant hours, early check-in, late check-out and specific accessibility
              requirements, please call reception.
            </p>
          </aside>
        </div>
        <div className="content-width">
          <iframe
            title="Yashdeep Palace location search"
            className="map-frame"
            src="https://maps.google.com/maps?q=Yashdeep%20Palace%20Khushkhera%20Rajasthan&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}
export function PrivacyPage() {
  const { grievanceOfficer } = legalAndPrivacy;

  return (
    <>
      <PageBanner
        title="Privacy Policy"
        description="Statutory notice & data governance under the Digital Personal Data Protection Act, 2023 (DPDP Act)."
        eyebrow="DPDP Act Compliance"
      />

      <section className="section">
        <div className="content-width legal-container">
          {/* Quick Legal Switcher */}
          <nav className="legal-nav-tabs" aria-label="Legal document tabs">
            <Link to="/privacy" className="legal-nav-tab active">
              <Shield size={16} /> Privacy Policy (DPDP Act)
            </Link>
            <Link to="/terms" className="legal-nav-tab">
              <FileText size={16} /> Terms & Conditions
            </Link>
          </nav>

          <div className="privacy-copy">
            {/* Statutory DPDP Act Notice Box (Section 5) */}
            <div className="legal-callout">
              <div className="legal-badge">
                <ShieldCheck size={14} /> Statutory Notice under Section 5, DPDP Act 2023
              </div>
              <p className="text-sm font-medium text-foreground mb-2">
                <strong>Data Fiduciary:</strong> {legalAndPrivacy.dataFiduciary} ·{" "}
                {legalAndPrivacy.registeredAddress}
              </p>
              <p className="text-xs text-muted-foreground mb-0">
                This Privacy Policy serves as the mandatory statutory notice issued by Yashdeep
                Palace to you, the &ldquo;Data Principal&rdquo;, pursuant to Section 5 of
                India&apos;s{" "}
                <strong>Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023)</strong>. It
                itemises the personal data we collect, our specified lawful processing purposes,
                your enforceable rights, and our designated grievance redressal mechanism.
              </p>
            </div>

            <h2>1. Legislative Scope & Application</h2>
            <p>
              This policy governs digital personal data collected online through the Yashdeep Palace
              website (<span className="font-mono text-xs">yashdeeppalace.com</span>), our direct
              booking wizard, customer account portal, and front desk communications, as well as
              personal data collected in non-digital form that is subsequently digitized for hotel
              guest registration.
            </p>
            <p>
              Under the DPDP Act, <strong>Yashdeep Palace</strong> operates as the{" "}
              <strong>Data Fiduciary</strong> determining the purpose and means of processing your
              personal data, and you as the guest or visitor are the <strong>Data Principal</strong>
              .
            </p>

            <h2>2. Categories of Personal Data Collected (Itemised Notice)</h2>
            <p>
              In accordance with Section 5(1)(a) of the DPDP Act, we collect only the personal data
              strictly necessary for specified hospitality and regulatory purposes:
            </p>

            <div className="legal-grid">
              <div className="legal-grid-item">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2 text-foreground">
                  <Users size={16} className="text-gold" /> Identity & Contact
                </h3>
                <p className="text-xs text-muted-foreground mb-0">
                  Full guest name, verified email address, verified Indian mobile phone number
                  (+91), and WhatsApp communication preferences.
                </p>
              </div>

              <div className="legal-grid-item">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2 text-foreground">
                  <BedDouble size={16} className="text-gold" /> Reservation Parameters
                </h3>
                <p className="text-xs text-muted-foreground mb-0">
                  Arrival (check-in) and departure (check-out) dates, selected room category, guest
                  occupancy counts, and special stay requests.
                </p>
              </div>

              <div className="legal-grid-item">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2 text-foreground">
                  <KeyRound size={16} className="text-gold" /> Verification & Auth
                </h3>
                <p className="text-xs text-muted-foreground mb-0">
                  Temporary One-Time Password (OTP) verification tokens, verification timestamps,
                  and Google OAuth identity profile (if selected).
                </p>
              </div>

              <div className="legal-grid-item">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2 text-foreground">
                  <Shield size={16} className="text-gold" /> Statutory In-Person ID
                </h3>
                <p className="text-xs text-muted-foreground mb-0">
                  Physical Government-issued photo ID (Aadhaar, Passport, Voter ID, Driving License;
                  Form C / Visa for foreigners) presented at check-in.
                </p>
              </div>
            </div>

            <p className="text-sm">
              <strong>Technical & Diagnostic Data:</strong> Standard IP addresses and browser
              user-agent signatures are logged ephemerally solely for firewall defenses, rate
              limiting (<span className="font-mono text-xs">consume_request_limit</span>), and
              anti-abuse protection.
            </p>
            <p className="text-sm">
              <strong>Client-Side AI Concierge History:</strong> Conversations with our AI booking
              concierge are stored exclusively in your local web browser&apos;s{" "}
              <span className="font-mono text-xs">localStorage</span>. We do not sell or monetize
              your conversation prompts.
            </p>
            <div className="policy-note">
              <strong>Cardholder Financial Data Protection:</strong> Yashdeep Palace does{" "}
              <strong>NOT</strong> collect, process, or store credit card numbers, debit card PINs,
              CVVs, or Net Banking credentials on this website. Room payments are settled in-person
              at the hotel front desk or through authorized payment POS/UPI terminals.
            </div>

            <h2>3. Specified Lawful Purposes of Processing</h2>
            <p>
              Under Sections 4 and 6 of the DPDP Act, personal data is processed solely for
              explicit, lawful purposes:
            </p>
            <ul className="list-disc">
              <li>
                <strong>Fulfillment of Room Reservations:</strong> Registering and processing your
                booking requests, allocating guest rooms, generating booking references, and
                providing front desk hospitality.
              </li>
              <li>
                <strong>Fraud Prevention & Anti-Spam Safeguards:</strong> Authenticating guest
                identities via dual server-verified OTP (SMS and email) to ensure genuine
                reservations and prevent denial-of-inventory attacks.
              </li>
              <li>
                <strong>Statutory Compliance with Indian Laws:</strong> Adhering to mandatory guest
                register maintenance under the <em>Sarais Act, 1867</em>, foreign guest reporting
                (Form C) under the <em>Foreigners Act, 1946</em>, and tax invoicing under the{" "}
                <em>Central Goods and Services Tax (CGST) Act, 2017</em>.
              </li>
              <li>
                <strong>Account Administration:</strong> Managing your authenticated guest profile,
                verifying eligibility for customer promotions (e.g. 10% welcome coupon), and
                streamlining future reservations.
              </li>
              <li>
                <strong>Guest Communication & Support:</strong> Transmitting stay confirmations,
                responding to inquiries via email or WhatsApp, and handling customer service
                requests.
              </li>
              <li>
                <strong>Medical Emergency & Public Health (Section 7):</strong> Responding to any
                medical emergency or breakdown affecting a guest during their stay on premises.
              </li>
            </ul>

            <h2>4. Consent & Right to Withdraw Consent (Section 6)</h2>
            <p>
              Your consent to the processing of your personal data is free, specific, informed,
              unconditional, and unambiguous, indicated by affirmative action when submitting a
              booking request, verifying an OTP, or registering a customer account.
            </p>
            <p>
              <strong>Withdrawal of Consent:</strong> In accordance with Section 6(4) of the DPDP
              Act, you have the right to withdraw your consent at any time with equal ease. You can
              withdraw consent by sending an email with your request to our Data Protection
              Grievance Officer at{" "}
              <a href={`mailto:${grievanceOfficer.email}`} className="text-gold underline">
                {grievanceOfficer.email}
              </a>
              .
            </p>
            <p className="text-sm text-muted-foreground">
              <em>Consequences of Withdrawal:</em> Upon withdrawal, Yashdeep Palace will cease
              processing your digital personal data and remove your active customer profile, except
              where retention is legally mandated by Indian statutory authorities (such as GST tax
              invoices or police guest register records). Withdrawal does not affect the legality of
              processing undertaken prior to such withdrawal.
            </p>

            <h2>5. Rights of the Data Principal (Sections 11–14)</h2>
            <p>
              As a Data Principal under the DPDP Act 2023, you enjoy statutory, enforceable rights:
            </p>

            <div className="legal-grid">
              <div className="legal-grid-item">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2 text-foreground">
                  <FileText size={16} className="text-gold" /> Right to Access Information (Sec. 11)
                </h3>
                <p className="text-xs text-muted-foreground mb-0">
                  Request a summary of your digital personal data being processed, processing
                  activities undertaken, and identities of Data Processors with whom data has been
                  shared.
                </p>
              </div>

              <div className="legal-grid-item">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2 text-foreground">
                  <CheckCircle size={16} className="text-gold" /> Right to Correction & Erasure
                  (Sec. 12)
                </h3>
                <p className="text-xs text-muted-foreground mb-0">
                  Request correction of inaccurate or misleading data, completion of incomplete
                  records, updating of contact details, or erasure of data no longer required for
                  the specified purpose.
                </p>
              </div>

              <div className="legal-grid-item">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2 text-foreground">
                  <Scale size={16} className="text-gold" /> Right of Grievance Redressal (Sec. 13)
                </h3>
                <p className="text-xs text-muted-foreground mb-0">
                  Avail readily accessible redressal from our designated Grievance Officer within 30
                  calendar days before escalating to statutory boards.
                </p>
              </div>

              <div className="legal-grid-item">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2 text-foreground">
                  <Users size={16} className="text-gold" /> Right to Nominate (Sec. 14)
                </h3>
                <p className="text-xs text-muted-foreground mb-0">
                  Nominate any individual who shall, in the event of your death or incapacity,
                  exercise your data rights in accordance with the DPDP Act.
                </p>
              </div>
            </div>

            <h2>6. Duties of the Data Principal (Section 15)</h2>
            <p>The DPDP Act also outlines corresponding duties for Data Principals:</p>
            <ul className="list-disc">
              <li>
                You must comply with all provisions of applicable laws when exercising rights.
              </li>
              <li>
                You must not impersonate another individual when providing personal data for room
                bookings.
              </li>
              <li>
                You must provide authentic, verifiably accurate information (specifically mobile
                numbers and email addresses).
              </li>
              <li>
                You must not file false, frivolous, or vexatious grievances or complaints with the
                Data Fiduciary or the Data Protection Board of India.
              </li>
            </ul>

            <h2>7. Protection of Children & Minors (Section 9)</h2>
            <p>
              Yashdeep Palace strictly observes the child protection requirements under Section 9 of
              the DPDP Act:
            </p>
            <ul className="list-disc">
              <li>
                Our online reservation portal is intended for use solely by individuals who are at
                least 18 years of age.
              </li>
              <li>
                We do not knowingly process personal data of children (under 18 years) without
                verifiable consent from a parent or lawful guardian (obtained during in-person
                family check-in).
              </li>
              <li>
                We do not track, behaviorally monitor, profile, or direct targeted advertising
                toward children under any circumstances.
              </li>
            </ul>

            <h2>8. Authorized Data Processors & Disclosures</h2>
            <p>
              We do not sell, rent, or trade your personal data. We disclose personal data only to
              authorized Data Processors acting under strict contractual confidentiality and data
              protection safeguards:
            </p>
            <ul className="list-disc">
              <li>
                <strong>Hotel Management System (HMS API Gateway):</strong> Secure centralized
                reservation repository for room bookings and check-in records.
              </li>
              <li>
                <strong>Twilio Inc. (Twilio Verify):</strong> Delivery of SMS verification OTPs with
                active RiskCheck and fraud prevention.
              </li>
              <li>
                <strong>Transactional Email Gateway (SMTP):</strong> Delivery of email OTPs and stay
                confirmations.
              </li>
              <li>
                <strong>Google Identity Services:</strong> Optional OAuth authentication for users
                who voluntarily sign in with Google.
              </li>
              <li>
                <strong>Indian Statutory Authorities:</strong> Local law enforcement, police
                verification desks, and GST tax authorities where disclosure is mandatory under
                Indian law.
              </li>
            </ul>

            <h2>9. Technical Safeguards & Data Breach Protocol</h2>
            <p>
              In compliance with Section 8(5) of the DPDP Act, Yashdeep Palace employs robust
              technical and organizational measures:
            </p>
            <ul className="list-disc">
              <li>
                <strong>Transport Encryption:</strong> All digital communications are encrypted in
                transit using TLS 1.3 / HTTPS.
              </li>
              <li>
                <strong>Strict Rate Limiting:</strong> Verification endpoints are throttled to
                prevent brute-force attacks and automated credential stuffing.
              </li>
              <li>
                <strong>Breach Notification:</strong> In the event of a personal data breach,
                Yashdeep Palace will notify the{" "}
                <strong>Data Protection Board of India (DPBI)</strong> and all affected Data
                Principals in the form and manner prescribed by the DPDP Rules.
              </li>
            </ul>

            <h2>10. Data Retention & Erasure Schedule</h2>
            <p>
              Digital personal data is retained only for as long as necessary to fulfill the
              specified purpose or to satisfy Indian legal obligations:
            </p>
            <ul className="list-disc">
              <li>
                <strong>Website Inquiries & Drafts:</strong> Unconfirmed booking drafts and
                transient session tokens are purged after 90 days.
              </li>
              <li>
                <strong>Customer Accounts:</strong> Retained until you request account closure or
                withdraw consent.
              </li>
              <li>
                <strong>Tax & Statutory Guest Records:</strong> Invoices and GST tax filings are
                retained for 6 to 8 years as required under the <em>Income Tax Act, 1961</em> and
                the <em>CGST Act, 2017</em>. Guest register logs are retained as mandated by local
                police regulations.
              </li>
            </ul>

            <h2>11. Data Protection Grievance Officer & Redressal (Section 13)</h2>
            <p>
              If you have any questions, wish to exercise your statutory rights (access, correction,
              erasure, nomination), or wish to register a grievance regarding the processing of your
              personal data, please contact our designated Grievance Officer:
            </p>

            <div className="legal-grievance-box">
              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <Building size={18} className="text-gold" /> {grievanceOfficer.title}
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground uppercase font-medium">
                    Data Fiduciary
                  </dt>
                  <dd className="font-medium text-foreground">{grievanceOfficer.entity}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase font-medium">
                    Dedicated Privacy Email
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${grievanceOfficer.email}`}
                      className="text-gold font-medium hover:underline"
                    >
                      {grievanceOfficer.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase font-medium">
                    Front Desk Contact
                  </dt>
                  <dd className="text-foreground">
                    <a href={`tel:${hotel.phoneLink}`} className="hover:underline">
                      {grievanceOfficer.phone}
                    </a>{" "}
                    ·{" "}
                    <a href={`mailto:${hotel.email}`} className="hover:underline">
                      {grievanceOfficer.contactEmail}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase font-medium">
                    Response Timelines
                  </dt>
                  <dd className="text-foreground">
                    Acknowledgement: {grievanceOfficer.acknowledgementTimeline}
                    <br />
                    Resolution: {grievanceOfficer.resolutionTimeline}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-xs text-muted-foreground uppercase font-medium">
                    Postal Address
                  </dt>
                  <dd className="text-foreground">{grievanceOfficer.address}</dd>
                </div>
              </dl>
            </div>

            <p className="text-xs text-muted-foreground">
              <strong>Escalation to Data Protection Board of India:</strong> In case you are not
              satisfied with the resolution provided by our Grievance Officer, or if you do not
              receive a response within 30 days, you may file a complaint before the{" "}
              <strong>Data Protection Board of India (DPBI)</strong> in accordance with Section
              13(3) of the Digital Personal Data Protection Act, 2023.
            </p>

            <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>Last updated: {legalAndPrivacy.lastUpdated}</span>
              <Link to="/terms" className="text-gold font-medium hover:underline">
                View Terms & Conditions <ArrowRight size={14} className="inline ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function TermsPage() {
  const { grievanceOfficer } = legalAndPrivacy;

  return (
    <>
      <PageBanner
        title="Terms & Conditions"
        description="Official reservation terms, stay policies, guest identification rules, and hotel house regulations."
        eyebrow="Guest Agreement"
      />

      <section className="section">
        <div className="content-width legal-container">
          {/* Quick Legal Switcher */}
          <nav className="legal-nav-tabs" aria-label="Legal document tabs">
            <Link to="/privacy" className="legal-nav-tab">
              <Shield size={16} /> Privacy Policy (DPDP Act)
            </Link>
            <Link to="/terms" className="legal-nav-tab active">
              <FileText size={16} /> Terms & Conditions
            </Link>
          </nav>

          <div className="privacy-copy">
            {/* Highlights Card */}
            <div className="legal-callout">
              <div className="legal-badge">
                <FileText size={14} /> Core Stay Rules & Key Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                <div>
                  <span className="text-xs uppercase text-muted-foreground block font-medium">
                    Check-in
                  </span>
                  <strong className="text-foreground text-base">{hotel.checkInTime}</strong>
                </div>
                <div>
                  <span className="text-xs uppercase text-muted-foreground block font-medium">
                    Check-out
                  </span>
                  <strong className="text-foreground text-base">{hotel.checkOutTime}</strong>
                </div>
                <div>
                  <span className="text-xs uppercase text-muted-foreground block font-medium">
                    Statutory ID
                  </span>
                  <strong className="text-foreground">Govt Photo ID Mandatory</strong>
                </div>
                <div>
                  <span className="text-xs uppercase text-muted-foreground block font-medium">
                    Cancellation
                  </span>
                  <strong className="text-foreground">Free up to 24 hrs prior</strong>
                </div>
              </div>
            </div>

            <h2>1. Contractual Agreement & Eligibility</h2>
            <p>
              These Terms & Conditions (&ldquo;Terms&rdquo;) constitute a legally binding agreement
              between you (&ldquo;Guest&rdquo;, &ldquo;Customer&rdquo;, or &ldquo;User&rdquo;) and{" "}
              <strong>Yashdeep Palace</strong> (&ldquo;Hotel&rdquo;, &ldquo;we&rdquo;,
              &ldquo;us&rdquo;), governing your access to and use of our website (
              <span className="font-mono text-xs">yashdeeppalace.com</span>) and any booking
              requests, inquiries, or accommodation services provided at our property in Khushkhera,
              Rajasthan.
            </p>
            <p>
              By accessing our website, creating a customer account, or submitting a reservation
              request, you confirm that you are at least 18 years of age, possess the legal capacity
              to enter into contracts under the <em>Indian Contract Act, 1872</em>, and agree to
              these Terms and our Privacy Policy under the DPDP Act.
            </p>

            <h2>2. Booking Requests vs. Confirmed Reservations</h2>
            <p>
              To maintain the highest hospitality standards and room allocation accuracy, our
              booking system operates under an explicit request-and-confirmation workflow:
            </p>
            <ul className="list-disc">
              <li>
                <strong>Booking Request Submission:</strong> Completing the 4-step wizard creates a
                verified booking request recorded directly into our Hotel Management System (HMS).
              </li>
              <li>
                <strong>Confirmation Notice:</strong> An online enquiry or booking request
                constitutes an offer to reserve accommodations and does <strong>not</strong>{" "}
                constitute an instant or guaranteed room block until accepted and formally confirmed
                by the hotel via official confirmation email, SMS, or front desk confirmation.
              </li>
              <li>
                <strong>Right of Cancellation / Modification:</strong> The hotel reserves the right
                to decline or cancel unconfirmed booking requests in the event of obvious pricing
                errors, room unavailability, fraudulent contact details, or failure to complete dual
                contact verification.
              </li>
            </ul>

            <h2>3. Dual Server-Verified Contact Safeguards</h2>
            <p>
              In accordance with our security policies, booking submissions require dual
              server-verified contacts:
            </p>
            <ul className="list-disc">
              <li>
                The guest&apos;s email address must be authenticated via an Email One-Time Password
                (OTP).
              </li>
              <li>
                The guest&apos;s Indian mobile number must be verified via an SMS OTP (powered by
                Twilio with fraud prevention).
              </li>
              <li>
                Booking requests failing dual server verification are rejected to safeguard
                inventory for genuine guests.
              </li>
            </ul>

            <h2>4. Mandatory Government Photo ID Verification at Check-in</h2>
            <p>
              Under Indian hospitality statutes, including the <em>Sarais Act, 1867</em>, the{" "}
              <em>Foreigners Act, 1946</em>, and local Rajasthan Police guest registration
              directives,{" "}
              <strong>
                every adult guest staying at Yashdeep Palace MUST present an original, valid,
                Government-issued physical photo identity document at the front desk upon check-in.
              </strong>
            </p>

            <div className="policy-note">
              <strong>Mandatory ID Rules for Indian Nationals:</strong>
              <br />
              Acceptable documents:{" "}
              <strong>Aadhaar Card, Passport, Voter ID Card, or Driving License</strong>.
              <br />
              <span className="text-destructive font-semibold">Important Notice:</span>{" "}
              <strong>PAN Cards are NOT acceptable</strong> as proof of identity or address under
              Indian hotel regulations and will not be accepted for check-in.
            </div>

            <div className="policy-note">
              <strong>Mandatory ID Rules for Foreign Nationals:</strong>
              <br />
              Foreign passport holders must present their original valid <strong>
                Passport
              </strong>{" "}
              and valid <strong>Indian Visa or OCI card</strong>, and complete mandatory Form C
              reporting at reception.
            </div>

            <p className="text-sm text-destructive font-medium">
              Failure to present statutory photo ID for each occupant will result in immediate
              denial of check-in, and the reservation will be treated as a same-day cancellation
              with forfeiture of applicable room charges.
            </p>

            <h2>5. Tariffs, Inclusions, Taxes (GST) & Payments</h2>
            <ul className="list-disc">
              <li>
                <strong>Published Rates:</strong> All room tariffs are displayed in Indian Rupees
                (INR ₹) per room per night, based on the designated room occupancy.
              </li>
              <li>
                <strong>Goods & Services Tax (GST):</strong> As required under Indian tax laws, GST
                is levied on accommodation and dining services at applicable government rates (e.g.
                5% or 12%).
              </li>
              <li>
                <strong>Standard Room Inclusions:</strong> Room rates include high-speed optical
                fiber Wi-Fi, daily housekeeping, electric hot water kettle, free on-premises secure
                parking, and 24/7 front desk assistance.
              </li>
              <li>
                <strong>Meal Plans:</strong> Published room tariffs do not include meals unless a
                specific breakfast/dining package (such as &ldquo;Deluxe Room With Breakfast&rdquo;)
                is explicitly selected and confirmed.
              </li>
              <li>
                <strong>Payment Settlement:</strong> We do not collect credit card credentials on
                our website. Final room tariff and incidental charges are payable at the hotel front
                desk via UPI, major Indian debit/credit cards, or cash within statutory Income Tax
                Act limits.
              </li>
            </ul>

            <h2>6. Check-in & Check-out Policies</h2>
            <ul className="list-disc">
              <li>
                <strong>Standard Check-in Time:</strong> {hotel.checkInTime}
              </li>
              <li>
                <strong>Standard Check-out Time:</strong> {hotel.checkOutTime}
              </li>
              <li>
                <strong>Early Check-in:</strong> Check-in between 8:00 AM and {hotel.checkInTime} is
                subject to room availability and may attract a nominal early check-in charge.
                Check-in prior to 8:00 AM requires reserving the room for the preceding night.
              </li>
              <li>
                <strong>Late Check-out:</strong> Extension up to 2:00 PM is subject to room
                availability and may incur a half-day charge; check-out after 2:00 PM incurs a full
                night&apos;s tariff.
              </li>
            </ul>

            <h2>7. Cancellation, Amendment & Refund Policy</h2>
            <ul className="list-disc">
              <li>
                <strong>Free Cancellation Window:</strong> Guests may cancel their booking request
                free of charge up to <strong>24 hours prior</strong> to the scheduled check-in time
                (12:00 PM on the arrival date).
              </li>
              <li>
                <strong>Late Cancellation & No-Show:</strong> Cancellations received less than 24
                hours before check-in, or failure of the guest to arrive on the scheduled date
                (&ldquo;No-Show&rdquo;), will be billed an amount equal to 100% of the first
                night&apos;s room tariff plus applicable taxes.
              </li>
              <li>
                <strong>Modifications:</strong> Date changes are subject to room availability and
                the prevailing tariff on the revised dates.
              </li>
              <li>
                <strong>Refund Processing:</strong> Any approved refunds are credited back to the
                original mode of payment within 7 to 10 business days as per banking cycles.
              </li>
            </ul>

            <h2>8. Guest Conduct, Safety & Property Care</h2>
            <ul className="list-disc">
              <li>
                <strong>Prohibited Substances & Contraband:</strong> The possession or consumption
                of illegal narcotics or psychotropic substances under the <em>NDPS Act, 1985</em>,
                unlicensed weapons, explosives, or hazardous materials is strictly prohibited on
                hotel premises. Violations will result in immediate police referral and eviction.
              </li>
              <li>
                <strong>100% Non-Smoking Guest Rooms:</strong> All rooms at Yashdeep Palace are
                designated strictly non-smoking. Smoking is permitted only in designated outdoor
                spaces. A deep-cleaning sanitation charge of ₹2,500 will be levied for in-room
                smoking violations.
              </li>
              <li>
                <strong>Care of Property:</strong> Guests are liable for any physical damage,
                breakage, staining, or missing hotel fixtures, linens, furniture, or electronic
                appliances caused by themselves or their accompanying visitors.
              </li>
              <li>
                <strong>Quiet Hours:</strong> To ensure peace for all guests, quiet hours are
                observed from 10:00 PM to 7:00 AM.
              </li>
              <li>
                <strong>Visitor Policy:</strong> External non-resident visitors are permitted in the
                lobby and restaurant. External visitors are not permitted into guest rooms after
                9:00 PM without front desk registration and statutory photo ID.
              </li>
            </ul>

            <h2>9. AI Front Desk Concierge Disclaimer</h2>
            <p>
              The AI concierge on our website provides conversational assistance, room descriptions,
              and preliminary price calculations. The AI assistant cannot bypass contact
              verification or directly generate legally binding room commitments. All prices and
              special packages remain subject to front desk confirmation.
            </p>

            <h2>10. Limitation of Liability & Force Majeure</h2>
            <p>
              The hotel shall not be liable for loss, theft, or damage of personal valuables or cash
              left unattended in guest rooms. Guests are advised to keep high-value items in their
              personal custody or request reception safe-keeping where available.
            </p>
            <p>
              Neither party shall be liable for non-performance or delay arising from events of
              Force Majeure, including acts of God, extreme weather, flooding, fire, epidemics,
              government directives, infrastructure grid failures, or civil disturbances.
            </p>

            <h2>11. Governing Law & Dispute Jurisdiction</h2>
            <p>
              These Terms, all room bookings, and all disputes arising out of or related to your
              stay at Yashdeep Palace shall be governed exclusively by the laws of India.
            </p>
            <p>
              Any legal proceeding, dispute, or claim arising in connection with these Terms or your
              stay shall be subject to the exclusive jurisdiction of the competent courts in{" "}
              <strong>{legalAndPrivacy.jurisdiction}</strong>.
            </p>

            <h2>12. Contact Information</h2>
            <div className="legal-grievance-box">
              <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                <Building size={18} className="text-gold" /> Front Desk & Reception
              </h3>
              <p className="text-sm text-foreground mb-1">
                <strong>Yashdeep Palace</strong> · {hotel.address}
              </p>
              <p className="text-sm text-muted-foreground mb-0">
                Telephone:{" "}
                <a href={hotel.phoneLink} className="text-gold hover:underline">
                  {hotel.phone}
                </a>{" "}
                /{" "}
                <a href={`tel:${hotel.phone2.replace(/\s+/g, "")}`} className="hover:underline">
                  {hotel.phone2}
                </a>{" "}
                · Email:{" "}
                <a href={`mailto:${hotel.email}`} className="text-gold hover:underline">
                  {hotel.email}
                </a>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>Last updated: {legalAndPrivacy.lastUpdated}</span>
              <Link to="/privacy" className="text-gold font-medium hover:underline">
                View Privacy Policy (DPDP Act) <ArrowRight size={14} className="inline ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
