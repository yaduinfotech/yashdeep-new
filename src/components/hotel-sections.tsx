import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarDays,
  Users,
  BedDouble,
  Wifi,
  Car,
  UtensilsCrossed,
  BriefcaseBusiness,
  Wind,
  Coffee,
  Phone,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { rooms, hotel, images, faqs, validateStay, localToday, type Stay } from "@/lib/hotel";
import { FinalCTA } from "./hotel-layout";

export function BookingSearch() {
  const navigate = useNavigate();
  const [stay, setStay] = useState<Stay>({
    checkIn: "",
    checkOut: "",
    adults: 2,
    children: 0,
    rooms: 1,
    room: "",
  });
  const [error, setError] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    const problem = validateStay(stay, localToday());
    if (problem) {
      setError(problem);
      return;
    }
    navigate({ to: "/booking", search: stay });
  }
  const field = (key: keyof Stay, value: string) =>
    setStay((s) => ({
      ...s,
      [key]: ["adults", "children", "rooms"].includes(key) ? Number(value) : value,
    }));
  return (
    <div className="booking-band">
      <form className="booking-search" onSubmit={submit}>
        <div className="booking-field">
          <label htmlFor="search-in">
            <CalendarDays />
            Check-in
          </label>
          <input
            id="search-in"
            type="date"
            required
            min={localToday()}
            value={stay.checkIn}
            onChange={(e) => field("checkIn", e.target.value)}
          />
        </div>
        <div className="booking-field">
          <label htmlFor="search-out">
            <CalendarDays />
            Check-out
          </label>
          <input
            id="search-out"
            type="date"
            required
            min={stay.checkIn || localToday()}
            value={stay.checkOut}
            onChange={(e) => field("checkOut", e.target.value)}
          />
        </div>
        {(["adults", "children", "rooms"] as const).map((key) => (
          <div className="booking-field" key={key}>
            <label htmlFor={`search-${key}`}>
              {key === "rooms" ? <BedDouble /> : <Users />}
              {key}
            </label>
            <select
              id={`search-${key}`}
              value={stay[key]}
              onChange={(e) => field(key, e.target.value)}
            >
              {Array.from({ length: key === "children" ? 5 : 4 }, (_, i) =>
                key === "children" ? i : i + 1,
              ).map((n) => (
                <option key={n} value={n}>
                  {n}{" "}
                  {key === "rooms"
                    ? n === 1
                      ? "room"
                      : "rooms"
                    : key === "adults"
                      ? n === 1
                        ? "adult"
                        : "adults"
                      : n === 1
                        ? "child"
                        : "children"}
                </option>
              ))}
            </select>
          </div>
        ))}
        <Button variant="hotel" type="submit">
          Check availability <ArrowRight />
        </Button>
      </form>
      {error && (
        <p className="content-width form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export function RoomCards() {
  return (
    <div className="room-grid">
      {rooms.map((room) => (
        <article className="room-card" key={room.slug}>
          <div className="room-image-wrap">
            <img
              src={room.image}
              alt={`${room.name} at Yashdeep Palace`}
              loading="lazy"
              width="700"
              height="410"
            />
            <span className="room-tag">Your private retreat</span>
          </div>
          <div className="room-card-body">
            <h3>{room.name}</h3>
            <p>{room.description}</p>
            <div className="room-meta">
              <span>
                <Users />
                {room.occupancy}
              </span>
              <span>
                <BedDouble />
                {room.bed}
              </span>
              <span>
                <Wind />
                Air conditioning
              </span>
            </div>
            <div className="room-bottom">
              <div className="room-rate-display">
                <div className="room-rate-numbers">
                  <span className="room-current-price">₹{room.price.toLocaleString("en-IN")}</span>
                  {room.original_price && (
                    <span className="room-original-price">
                      ₹{room.original_price.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <span className="room-rate-period">per night + 5% GST</span>
              </div>
              <Link to="/rooms/$room" params={{ room: room.slug }} className="text-link">
                Explore room <ArrowRight />
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
export function FAQSection() {
  return (
    <section className="section">
      <div className="content-width faq-layout">
        <div>
          <div className="eyebrow">A little more to know</div>
          <h2>Before you arrive.</h2>
          <p className="text-muted-foreground">A few answers for a more comfortable stay.</p>
          <Link to="/contact" className="text-link">
            Ask reception <ArrowRight />
          </Link>
        </div>
        <div>
          {faqs.map(([q, a]) => (
            <details className="faq-item" key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
export function HomePage() {
  return (
    <>
      <section className="home-hero">
        <img
          className="hero-photo"
          src={images.exterior}
          alt="The actual Yashdeep Palace hotel exterior in Khushkhera"
          fetchPriority="high"
          width="1600"
          height="1000"
        />
        <div className="hero-content">
          <div className="eyebrow">A warm welcome in Khushkhera, Rajasthan</div>
          <h1>
            Experience Comfort,
            <br />
            Hospitality &amp; <em>Elegance</em>
            <br />
            at Yashdeep Palace.
          </h1>
          <p className="hero-description">
            Your welcoming retreat in the Khushkhera–Tapukara area. Comfortable rooms, thoughtful
            dining, and warm hospitality, whether you're here for business or a little time away.
          </p>
          <div className="hero-buttons">
            <Button variant="hotel" asChild>
              <Link to="/booking">
                Book your stay <ArrowRight />
              </Link>
            </Button>
            <Button variant="hotelOutline" asChild>
              <a href={hotel.phoneLink}>
                <Phone />
                Call now
              </a>
            </Button>
          </div>
        </div>
        <div className="hero-counter">
          <span>01</span>
          <span className="counter-line" />
          <span>YASHDEEP PALACE</span>
        </div>
        <div className="hero-location">
          <MapPin size={13} />
          KHUSHKHERA · RAJASTHAN
        </div>
      </section>
      <BookingSearch />
      <section className="section">
        <div className="content-width welcome-grid">
          <div className="welcome-photos">
            <img
              src={images.reception}
              alt="Yashdeep Palace reception"
              loading="lazy"
              width="700"
              height="540"
            />
            <img
              className="welcome-small"
              src={images.deluxe}
              alt="Comfortable guest accommodation"
              loading="lazy"
              width="350"
              height="350"
            />
          </div>
          <div className="welcome-copy">
            <div className="eyebrow">Welcome to Yashdeep Palace</div>
            <h2>
              More than a stay.
              <br />A feeling of belonging.
            </h2>
            <p>
              Set in Rajasthan's Khushkhera industrial area, Yashdeep Palace brings together the
              ease of a comfortable hotel and the warmth of a personal welcome.
            </p>
            <p>
              From a restful night after a busy day to a meal shared with family, we make space for
              the moments that matter. Stay for business, visit for dining, or bring your next
              gathering together.
            </p>
            <Link to="/about" className="text-link">
              Discover our story <ArrowRight />
            </Link>
            <div className="welcome-features">
              <span>
                <ShieldCheck />
                Warm hospitality
              </span>
              <span>
                <BedDouble />
                Comfortable stays
              </span>
              <span>
                <MapPin />
                Convenient location
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="section room-section">
        <div className="content-width">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Rest. Recharge. Feel at home.</div>
              <h2>A room for your kind of stay.</h2>
            </div>
            <Link to="/rooms" className="text-link">
              View all rooms <ArrowRight />
            </Link>
          </div>
          <RoomCards />
        </div>
      </section>
      <section className="section">
        <div className="content-width">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Beyond your room</div>
              <h2>Good food. Great company.</h2>
            </div>
          </div>
          <div className="experience-grid">
            <article className="experience">
              <img src={images.restaurant} alt="Yashdeep Palace restaurant" loading="lazy" />
              <div>
                <div className="eyebrow">Restaurant & dining</div>
                <h3>Gather around the table.</h3>
                <p>A welcoming setting for everyday meals and moments worth sharing.</p>
                <Link to="/restaurant" className="text-link">
                  Discover dining <ArrowRight />
                </Link>
              </div>
            </article>
            <article className="experience">
              <img
                src={images.meeting}
                alt="Yashdeep Palace meeting room and lounge"
                loading="lazy"
              />
              <div>
                <div className="eyebrow">Meetings & gatherings</div>
                <h3>Make room for connection.</h3>
                <p>
                  A place for productive conversations, business meetings, and small gatherings.
                </p>
                <Link to="/meetings" className="text-link">
                  Plan a gathering <ArrowRight />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
      <div className="amenities-band">
        <div className="content-width amenities">
          {[
            [Wifi, "Wi-Fi"],
            [Car, "Parking"],
            [Wind, "Air conditioning"],
            [UtensilsCrossed, "Restaurant"],
            [BriefcaseBusiness, "Meeting lounge"],
            [Coffee, "Room service"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof Wifi;
            return (
              <div className="amenity" key={String(label)}>
                <I />
                {String(label)}
              </div>
            );
          })}
        </div>
      </div>
      <section className="section">
        <div className="content-width">
          <div className="section-heading">
            <div>
              <div className="eyebrow">A glimpse of your next stay</div>
              <h2>See the palace for yourself.</h2>
            </div>
            <Link to="/gallery" className="text-link">
              Explore gallery <ArrowRight />
            </Link>
          </div>
          <div className="gallery-preview">
            <img src={images.exterior} alt="Hotel facade" loading="lazy" />
            <img src={images.luxury} alt="Luxury Double Room" loading="lazy" />
            <img src={images.restaurant} alt="Hotel restaurant" loading="lazy" />
          </div>
        </div>
      </section>
      <FAQSection />
      <FinalCTA />
    </>
  );
}
