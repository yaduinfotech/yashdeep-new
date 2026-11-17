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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  hotel,
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
                    className={`relative shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${selectedPhoto === img
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
                    <Phone className="size-3.5 mr-1" /> Call Reception {hotel.phone} / {hotel.phone2}
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
  return (
    <>
      <PageBanner
        title="Privacy & booking enquiries"
        description="Clear information about your enquiry and reservation."
      />
      <section className="section">
        <div className="content-width privacy-copy">
          <h2>Your information</h2>
          <p>
            Information entered here remains in the current page and is used to prepare an email in
            your own email application. Booking requests submitted after verification are saved
            securely along with your contact details. Customer accounts store your profile name and
            verified email. No payment information is collected. Sending the prepared email shares
            your details with reception.
          </p>
          <h2>Reservation terms</h2>
          <p>
            Enquiries are not confirmed reservations. The hotel must confirm availability, the total
            price including taxes, meal inclusions, cancellation and refund policies, and check-in /
            check-out times directly. Do not make payments without confirming the recipient and
            terms with the hotel.
          </p>
          <h2>External services</h2>
          <p>
            Email, telephone and map links open external applications. The contact page includes
            Google Maps, which may process information under Google's own privacy policy. No
            analytics or advertising tracking has been installed.
          </p>
          <h2>Questions</h2>
          <p>
            Contact <a href={`mailto:${hotel.email}`}>{hotel.email}</a> for questions about your
            enquiry.
          </p>
        </div>
      </section>
    </>
  );
}
