import exterior from "@/assets/exterior.asset.json";
import deluxe from "@/assets/deluxe.asset.json";
import luxury from "@/assets/luxury.asset.json";
import restaurant from "@/assets/restaurant.asset.json";
import meeting from "@/assets/meeting.asset.json";
import reception from "@/assets/reception.asset.json";
export const hotel = {
  name: "Yashdeep Palace",
  tagline: "Comfort. Hospitality. Elegance.",
  phone: "+91 82220 20599",
  phone2: "+91 82220 20699",
  phoneLink: "tel:+918222020599",
  whatsapp:
    "https://wa.me/918222020599?text=Hello%20Yashdeep%20Palace%2C%20I%20would%20like%20help%20planning%20my%20stay.",
  email: "reception@yashdeeppalace.com",
  area: "Khushkhera, Rajasthan",
  address: "Opposite Honda Car Gate No. 4, RA 403, Karuli Industrial Area, Khushkhera, Rajasthan",
  maps: "https://www.google.com/maps/search/?api=1&query=Yashdeep+Palace+Khushkhera+Rajasthan",
  checkInTime: "12:00 PM",
  checkOutTime: "10:00 AM",
};

export const images = {
  exterior: exterior.url,
  deluxe: deluxe.url,
  luxury: luxury.url,
  restaurant: restaurant.url,
  meeting: meeting.url,
  reception: reception.url,
};

export interface RoomAmenityGroup {
  category: string;
  items: string[];
}

export interface RoomInfo {
  slug: string;
  name: string;
  original_price?: number;
  price: number;
  image: string;
  description: string;
  bed: string;
  occupancy: string;
  size?: string;
  view?: string;
  tag?: string;
  gallery?: string[];
  inclusions?: string[];
  amenityGroups?: RoomAmenityGroup[];
}

export const rooms: RoomInfo[] = [
  {
    slug: "deluxe",
    name: "Deluxe Room",
    original_price: 2500,
    price: 1600,
    image: images.deluxe,
    description:
      "A restful retreat with comfortable furnishings, whisper-quiet air conditioning, and a welcoming atmosphere for your business or leisure stay.",
    bed: "King bed",
    occupancy: "2 adults",
    size: "180 sq.ft (17sqm²)",
    view: "Courtyard & City View",
    tag: "Best Value",
    gallery: [images.deluxe, "/assets/room3.jpg", images.luxury, images.reception],
    inclusions: [
      "High-speed optical fiber Wi-Fi",
      "Daily comprehensive room housekeeping",
      "Electric kettle for Hot Water",
      "Free secured on-premises car & bike parking",
      "24/7 Front desk & room service assistance",
    ],
    amenityGroups: [
      {
        category: "Comfort & Climate",
        items: [
          "King-size bed with comfortable mattress",
          "Crisp cotton linens & cozy duvet",
          "Individual split air-conditioning with climate remote",
          "Blackout curtains & acoustic sound-insulated glazing",
          "Wardrobe with luggage rack & clothing hangers",
        ],
      },
      {
        category: "Work & Connectivity",
        items: [
          "High-speed Wi-Fi throughout the room",
          "Bedside electrical power sockets",
          "Smart LED TV with wifi",
        ],
      },
      {
        category: "Bathroom & Care",
        items: [
          "Private en-suite bathroom with hot & cold shower",
          "24/7 hot water supply",
          "Complimentary luxury soap, shampoo & toiletries",
          "Fresh bath towels",
          "Spacious vanity mirror with bright lighting",
        ],
      },
      {
        category: "Services & Safety",
        items: [
          "24/7 In-room dining and room service",
          "Daily morning housekeeping & trash clearance",
          "100% Silent generator power backup",
          "Emergency reception support",
        ],
      },
    ],
  },
  {
    slug: "deluxe-with-breakfast",
    name: "Deluxe Room With Breakfast",
    original_price: 3000,
    price: 2000,
    image: images.luxury,
    description:
      "Thoughtfully furnished premium accommodation with a king bed and wholesome complimentary breakfast served fresh every morning.",
    bed: "King bed",
    occupancy: "2 adults",
    size: "180 sq.ft (17sqm²)",
    view: "",
    tag: "Includes Breakfast",
    gallery: [images.luxury, images.deluxe, "/assets/room3.jpg", images.restaurant],
    inclusions: [
      "Daily freshly prepared hot breakfast buffet / set menu",
      "High-speed optical fiber Wi-Fi",
      "Daily comprehensive room housekeeping",
      "Electric kettle for Hot Water",
      "Free secured on-premises car & bike parking",
      "Priority early check-in (subject to room availability)",
      "24/7 Front desk & room service assistance",
    ],
    amenityGroups: [
      {
        category: "Comfort & Climate",
        items: [
          "Premium King-size bed with luxury dual-comfort mattress",
          "High-thread-count white linens & duvet",
          "Individual split air-conditioning with remote control",
          "Blackout curtains & double-glazed quiet windows",
          "wardrobe, clothes hangers & luggage space",
        ],
      },
      {
        category: "Dining Inclusions",
        items: [
          "Daily complimentary morning breakfast (8:30 AM – 10:30 AM)",
          "Choice of hot Indian classics (Parathas, Poori Bhaji, Poha) or Eggs to order",
          "Freshly brewed Masala Chai, Coffee & Seasonal Beverages",
          "In-room dining service available until 10:00 PM",
        ],
      },
      {
        category: "Work & Connectivity",
        items: [
          "High-speed Wi-Fi with strong coverage",
          "Convenient bedside electrical charging points",
          "Smart Flat-screen LED TV with wifi",
        ],
      },
      {
        category: "Bathroom & Care",
        items: [
          "Modern private en-suite bathroom with shower enclosure",
          "24/7 Instant hot and cold water",
          "Premium toiletries, soap & shampoo kit",
          "Fresh bath towels",
          "Vanity area with well-lit mirror",
        ],
      },
      {
        category: "Services & Safety",
        items: [
          "Priority front desk assistance & early check-in privilege",
          "24/7 Security surveillance and secure property parking",
          "100% Uninterrupted generator power backup",
          "Daily thorough room sanitization & housekeeping",
        ],
      },
    ],
  },
];

export const diningInfo = {
  title: "Restaurant & Dining",
  eyebrow: "Good Food · Warm Company",
  tagline: "Wholesome flavours, freshly prepared with genuine care.",
  description:
    "Whether you are fueling up for a demanding day in the Khushkhera industrial corridor, sharing an executive lunch with colleagues, or enjoying a relaxed family dinner, our multi-cuisine restaurant delivers delicious homestyle food in an air-conditioned, welcoming environment.",
  hours: [
    {
      meal: "Breakfast Buffet & A La Carte",
      time: "08:30 AM – 10:30 AM",
      note: "Freshly prepared parathas, poori bhaji, eggs, poha, and hot tea/coffee*.",
    },
    {
      meal: "Executive Lunch",
      time: "12:30 PM – 03:30 PM",
      note: "Wholesome North Indian thalis, curries, tandoori breads, and quick corporate meals.",
    },
    {
      meal: "Evening Dinner",
      time: "07:30 PM – 10:00 PM",
      note: "Rich curries, paneer & chicken specialties, Chinese favorites, and desserts.",
    },
    {
      meal: "In-Room Dining Service",
      time: "09:00 AM – 10:00 PM",
      note: "Hot, freshly packed meals delivered right to your room.",
    },
  ],
  features: [
    {
      title: "Authentic Multi-Cuisine",
      description:
        "North Indian classics, Rajasthani specialties, homestyle curries, and comforting Chinese dishes cooked to perfection.",
    },
    {
      title: "Corporate Meal Packages",
      description:
        "Tailored executive lunches, quick-serve thalis, and group dining options for business teams visiting Honda Cars and nearby industrial plants.",
    },
    {
      title: "Strict Hygiene & Quality",
      description:
        "100% RO-purified water, spotless kitchen, fresh daily local produce, and dedicated vegetarian preparation.",
    },
    {
      title: "Comfortable Seating & Room Delivery",
      description:
        "Spacious 50+ seater air-conditioned dining hall, cozy cafe lounge, plus prompt in-room dining service.",
    },
  ],
  menuHighlights: [
    {
      category: "Morning Breakfast",
      description: "Start your morning in Rajasthan energized and satisfied.",
      items: [
        {
          name: "Stuffed Tawa Parathas",
          description:
            "Freshly rolled Aloo, Gobhi, or Paneer parathas served with thick curd and homemade pickle.",
          tag: "Popular",
        },
        {
          name: "Traditional Poori Bhaji",
          description: "Crispy golden pooris served with spiced North Indian potato curry.",
          tag: "Classic",
        },
        {
          name: "Masala Poha & Upma",
          description:
            "Lightly tempered flattened rice or semolina with peanuts, curry leaves, and mustard seeds.",
        },
        {
          name: "Eggs to Order",
          description:
            "Two farm-fresh eggs prepared as Masala Omelette, Sunny-side up, Boiled, or Scrambled with toasted bread.",
        },
        {
          name: "Adrak Elaichi Chai & Coffee",
          description: "Steaming ginger-cardamom tea or hot filtered coffee brewed fresh.",
        },
      ],
    },
    {
      category: "North Indian & Tandoor",
      description: "Rich, aromatic curries cooked with authentic ground spices.",
      items: [
        {
          name: "Paneer Butter Masala",
          description:
            "Soft cottage cheese cubes simmered in a velvety tomato, cream, and butter gravy.",
          tag: "Chef Choice",
        },
        {
          name: "Dal Makhani & Dal Tadka",
          description:
            "Slow-cooked black lentils simmered overnight, or yellow lentils tempered with cumin and garlic.",
          tag: "Guest Favorite",
        },
        {
          name: "Kadhai Paneer / Mix Veg",
          description:
            "Tossed with fresh capsicum, onions, and freshly ground whole spices in a robust gravy.",
        },
        {
          name: "Special Chicken Curry / Kadhai Chicken",
          description: "Tender chicken pieces cooked in rich, aromatic homestyle gravy.",
        },
        {
          name: "Tandoori Roti & Naan Basket",
          description: "Crisp whole-wheat rotis and butter naans baked fresh to order.",
        },
      ],
    },
    {
      category: "Snacks & Quick Bites",
      description: "Ideal accompaniments for your evening tea or late-afternoon break.",
      items: [
        {
          name: "Paneer Tikka / Pakora",
          description: "Spiced cottage cheese cubes charred to smoky perfection with mint chutney.",
        },
        {
          name: "Crispy Golden French Fries",
          description: "Classic salted or peri-peri seasoned french fries.",
        },
        {
          name: "Grilled Vegetable Club Sandwich",
          description:
            "Three-layer toasted sandwich stuffed with fresh vegetables, cheese, and herb spread.",
        },
        {
          name: "Crispy Corn Salt & Pepper",
          description: "Sweet corn kernels tossed with crunchy bell peppers and black pepper.",
        },
      ],
    },
    {
      category: "Beverages & Sweets",
      description: "Refreshing sips and sweet endings.",
      items: [
        {
          name: "Sweet Lassi & Masala Chaas",
          description:
            "Chilled traditional yogurt beverages flavored with roasted cumin or sweet rose.",
          tag: "Refreshing",
        },
        {
          name: "Hot Gulab Jamun",
          description:
            "Soft, melt-in-the-mouth milk dumplings served warm in fragrant sugar syrup.",
        },
        {
          name: "Fresh Lime Soda / Water",
          description: "Prepared sweet, salted, or mixed to refresh your senses.",
        },
      ],
    },
  ],
  gallery: [images.restaurant, "/assets/restaurant3.jpg", "/assets/cafe1.jpg", "/assets/cafe2.jpg"],
};

export const aboutInfo = {
  eyebrow: "Our Welcome, Your Memories",
  title: "About Yashdeep Palace",
  subtitle:
    "A quiet haven of comfort, dignity, and authentic hospitality in Rajasthan’s premier industrial hub.",
  story: [
    "Yashdeep Palace was conceived with a clear vision: to create a peaceful, spotless, and truly hospitable sanctuary in the heart of the Khushkhera, Karuli, and Tapukara industrial belt.",
    "As the industrial corridor expanded with world-class manufacturing leaders like Honda Cars India Limited and leading global automotive ancillaries, traveling executives, audit professionals, and corporate teams needed more than just a place to sleep—they deserved quiet comfort, spotless hygiene, delicious food, and warm personal care.",
    'At Yashdeep Palace, we combine the age-old Rajasthani philosophy of "Atithi Devo Bhava" (The Guest is Sacred) with modern hotel infrastructure. From our spacious air-conditioned rooms and 100% generator power backup to our multi-cuisine restaurant and conference lounge, every detail is tuned to make your journey seamless and restorative.',
  ],
  stats: [
    { value: "100%", label: "Power Backup", detail: "Silent generator backup 24/7" },
    { value: "2 min", label: "From Honda Car Gate 4", detail: "Opposite Karuli Industrial Area" },
    { value: "50+", label: "Restaurant Covers", detail: "Air-conditioned dining & room service" },
    { value: "24/7", label: "Front Desk & Security", detail: "Round-the-clock service & CCTV" },
  ],
  pillars: [
    {
      title: "Pristine Cleanliness & Restful Sleep",
      description:
        "We believe genuine luxury begins with spotless hygiene. Every room features high-thread-count sanitized linen, immaculate private bathrooms, and acoustic insulation for peaceful, deep rest.",
    },
    {
      title: "Prime Zero-Commute Location",
      description:
        "Strategically located directly opposite Honda Car Gate No. 4, eliminating lengthy travel times so you arrive at meetings and site audits relaxed and on schedule.",
    },
    {
      title: "Authentic Indian Hospitality",
      description:
        "Our attentive team treats every guest with dignity, prompt responsiveness, and heartfelt warmth—whether you are here for an overnight audit or a month-long corporate project.",
    },
    {
      title: "All-In-One Modern Amenities",
      description:
        "Enjoy high-speed Wi-Fi, multi-cuisine restaurant dining, in-room food delivery, meeting facilities, elevator access, and guarded parking—all within one integrated property.",
    },
  ],
  landmarks: [
    {
      name: "Honda Cars India Limited (Gate No. 4)",
      distance: "200 meters",
      travelTime: "2 mins walk",
      category: "Automotive Hub",
    },
    {
      name: "Karuli Industrial Area (RIICO)",
      distance: "On Premises",
      travelTime: "0 mins",
      category: "Industrial Zone",
    },
    {
      name: "Tapukara Industrial Area",
      distance: "3.5 km",
      travelTime: "5 mins drive",
      category: "Industrial Zone",
    },
    {
      name: "Keihin Fie, Musashi, FCC & Auto Ancillaries",
      distance: "1.5 – 5 km",
      travelTime: "4–8 mins drive",
      category: "Manufacturing",
    },
    {
      name: "Bhiwadi Industrial Corridor",
      distance: "22 km",
      travelTime: "25 mins drive",
      category: "Commercial City",
    },
    {
      name: "Alwar Junction Railway Station",
      distance: "65 km",
      travelTime: "70 mins drive",
      category: "Transit",
    },
    {
      name: "Indira Gandhi International Airport (Delhi)",
      distance: "75 km",
      travelTime: "85 mins drive",
      category: "Air Travel",
    },
  ],
  facilities: [
    {
      title: "Spacious AC Rooms",
      description:
        "Deluxe and Executive accommodations with comfortable mattresses and en-suite showers.",
    },
    {
      title: "Multi-Cuisine Dining",
      description:
        "Freshly prepared North Indian, Rajasthani, and Continental favorites with room service.",
    },
    {
      title: "Executive Meeting Room",
      description:
        "Fully equipped corporate lounge and conference space for business meetings and client discussions.",
    },
    {
      title: "Elevator / Lift Access",
      description: "Modern passenger elevator serving all floors comfortably.",
    },
    {
      title: "100% Power Backup",
      description:
        "Heavy-duty silent generators ensuring uninterrupted air conditioning and lighting.",
    },
    {
      title: "Secure On-Site Parking",
      description:
        "Ample guarded parking for guest cars, executive vehicles, and buses with 24/7 CCTV.",
    },
  ],
  gallery: [
    images.exterior,
    images.reception,
    "/assets/front5.jpg",
    "/assets/corridore.jpg",
    "/assets/lift.jpg",
    images.restaurant,
    "/assets/front6.jpg",
    images.meeting,
  ],
};
export const photos = [
  { image: images.exterior, title: "Yashdeep Palace exterior", category: "Exterior" },
  { image: "/assets/front5.jpg", title: "Yashdeep Palace Front View", category: "Exterior" },
  { image: "/assets/front6.jpg", title: "Yashdeep Palace Side View", category: "Exterior" },

  { image: images.reception, title: "Yashdeep Palace Reception and lounge", category: "Reception" },
  {
    image: "/assets/reception2.jpg",
    title: "Yashdeep Palace Reception View",
    category: "Reception",
  },

  { image: images.deluxe, title: "Yashdeep Palace Deluxe Room", category: "Rooms" },
  { image: images.luxury, title: "Yashdeep Palace Deluxe Room", category: "Rooms" },
  { image: "/assets/room3.jpg", title: "Yashdeep Palace Deluxe Room", category: "Rooms" },

  { image: images.restaurant, title: "Yashdeep Palace Restaurant and dining", category: "Dining" },
  { image: images.meeting, title: "Yashdeep Palace Meeting room and lounge", category: "Meetings" },
  { image: "/assets/cafe1.jpg", title: "Yashdeep Palace Lobby", category: "Interior" },
  { image: "/assets/cafe2.jpg", title: "Yashdeep Palace Lobby", category: "Interior" },
  { image: "/assets/corridore.jpg", title: "Yashdeep Palace Corridore", category: "Interior" },
  { image: "/assets/lift.jpg", title: "Yashdeep Palace Lift View", category: "Interior" },
];
export const faqs = [
  [
    "Where is Yashdeep Palace located?",
    "Yashdeep Palace located opposite to Honda Car Gate No. 4, RA 403, Karuli Industrial Area, Khushkhera, Rajasthan. Please contact reception to confirm directions before travelling.",
  ],
  [
    "How can I reserve a room?",
    "Choose your dates and guests, then prepare a reservation enquiry or call reception. The hotel will confirm the current rate and availability before your booking is final.",
  ],
  [
    "What room types are available?",
    "We have Deluxe Rooms and Deluxe Rooms with Breakfast. Ask reception about the right room for your stay.",
  ],
  [
    "What are the room prices and check-in times?",
    "Contact reception for current rates, taxes, inclusions, check-in and check-out times, and cancellation terms.",
  ],
  [
    "Does the hotel offer dining and meeting spaces?",
    "Yes. we have a restaurant and a meeting room / lounge. Contact the hotel for timings, menus, capacity and arrangements.",
  ],
  [
    "Are parking and Wi-Fi available?",
    "Free secured parking and High speed Wi-Fi available. Please confirm any specific requirements with reception before booking.",
  ],
  [
    "What is the check-in and check-out time?",
    "Check-in is at 12:00 PM and check-out is at 10:00 AM. Please contact reception for any early check-in or late check-out requests.",
  ],
  ["Are pets allowed in the hotel?", "No, pets are not allowed in the hotel."],
  [
    "Do you provide airport or railway station pickup?",
    "Yes, we provide airport and railway station pickup and drop on extra payment. Please contact reception for more information.",
  ],
  [
    "What is the best way to reach Yashdeep Palace?",
    "If you are traveling by train, get down at Alwar Railway Station and hire a taxi to Khushkhera. If you are coming from Delhi/NCR you can take a bus or hire a taxi to Khushkhera. Please contact reception for more information.",
  ],
];
export interface PageHeadOptions {
  path?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageType?: string;
  cta?: string;
  type?: "website" | "article";
}

export const SITE_URL = "https://yashdeeppalace.com";
export const DEFAULT_OG_IMAGE = "/assets/og-home.jpg";
export const DEFAULT_CTA =
  "Book direct with Yashdeep Palace for best rates & instant confirmation.";

export function pageHead(title: string, description: string, options?: PageHeadOptions) {
  const fullTitle = title.includes("Yashdeep Palace") ? title : `${title} | Yashdeep Palace`;
  const cta = options?.cta ?? DEFAULT_CTA;
  const trimmedDesc = description.trim();
  const fullDescription = cta ? `${trimmedDesc} ${cta}` : trimmedDesc;
  const path = options?.path
    ? options.path.startsWith("/")
      ? options.path
      : `/${options.path}`
    : "";
  const canonicalUrl = `${SITE_URL}${path}`;

  const imagePath = options?.image || DEFAULT_OG_IMAGE;
  const imageUrl =
    imagePath.startsWith("http://") || imagePath.startsWith("https://")
      ? imagePath
      : `${SITE_URL}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
  const imageSecureUrl = imageUrl.replace(/^http:/, "https:");

  const imageWidth = String(options?.imageWidth || 1200);
  const imageHeight = String(options?.imageHeight || 630);
  const imageType = options?.imageType || "image/jpeg";
  const imageAlt = options?.imageAlt || `${title} - Yashdeep Palace Khushkhera`;
  const ogType = options?.type || "website";

  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: fullDescription },
      { property: "og:site_name", content: hotel.name },
      { property: "og:type", content: ogType },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: fullDescription },
      { property: "og:url", content: canonicalUrl },
      { property: "og:image", content: imageUrl },
      { property: "og:image:secure_url", content: imageSecureUrl },
      { property: "og:image:type", content: imageType },
      { property: "og:image:width", content: imageWidth },
      { property: "og:image:height", content: imageHeight },
      { property: "og:image:alt", content: imageAlt },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: fullDescription },
      { name: "twitter:image", content: imageUrl },
      { name: "twitter:image:alt", content: imageAlt },
    ],
    links: options?.path
      ? [{ rel: "canonical", href: canonicalUrl }]
      : [{ rel: "canonical", href: SITE_URL }],
  };
}
export type Stay = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  room: string;
};
export function validateStay(stay: Stay, today: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(stay.checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(stay.checkOut))
    return "Please select your check-in and check-out dates.";
  if (stay.checkIn < today) return "Check-in cannot be in the past.";
  if (stay.checkOut <= stay.checkIn) return "Check-out must be after check-in.";
  if (stay.adults < 1 || stay.rooms < 1 || stay.children < 0)
    return "Please select valid guest and room numbers.";
  return undefined;
}
export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function enquiryMail(subject: string, body: string) {
  return `mailto:${hotel.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export interface PricingBreakdown {
  ratePerNight: number;
  originalRatePerNight: number;
  nights: number;
  roomCount: number;
  baseRate: number;
  taxes: number;
  discount: number;
  total: number;
  roomName: string;
}

export function calculateStayPricing(stay: Stay, hasDiscount = false): PricingBreakdown {
  const selectedRoom = rooms.find((r) => r.name === stay.room || r.slug === stay.room) || rooms[0];
  const ratePerNight = selectedRoom?.price || 1800;
  const originalRatePerNight = selectedRoom?.original_price;
  let nights = 1;
  if (stay.checkIn && stay.checkOut && stay.checkOut > stay.checkIn) {
    const d1 = new Date(stay.checkIn);
    const d2 = new Date(stay.checkOut);
    nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
  }
  const roomCount = stay.rooms || 1;
  const baseRate = ratePerNight * nights * roomCount;
  const taxes = Math.round(baseRate * 0.05); // 5% standard GST
  const subtotal = baseRate + taxes;
  const discount = hasDiscount ? Math.round(subtotal * 0.1) : 0; // 10% welcome discount
  const total = subtotal - discount;

  return {
    ratePerNight,
    originalRatePerNight: originalRatePerNight || 0,
    nights,
    roomCount,
    baseRate,
    taxes,
    discount,
    total,
    roomName: selectedRoom?.name || "Deluxe Room",
  };
}
