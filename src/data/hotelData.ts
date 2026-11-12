import { Room, Review, GalleryItem } from '../types/hotel';

export const HOTEL_INFO = {
  name: 'Yashdeep Palace',
  subtitle: 'Luxury Hotel, Fine Dining & Regal Banquets',
  address: 'Opposite Honda Car Gate No. 4, RA 403, Karuli Industrial Area, Khuskheda, Tapukrah, Rajasthan 301707, India',
  phone: '+91 82220 20699',
  phoneAlt: '+91 82220 20599',
  email: 'reception@yashdeeppalace.com',
  checkInTime: '2:00 PM',
  checkOutTime: '11:00 AM',
  rating: 4.8,
  totalReviews: 342,
  coordinates: {
    lat: 28.0931,
    lng: 76.8452,
  },
  highlights: [
    'Directly Opposite Honda Car Gate 4',
    'High-Speed Fibre Wi-Fi',
    'The Royal Feast Multi-Cuisine Dining',
    'Grand Banquet & Conference Hall',
    '24/7 Front Desk & Concierge',
    'Dedicated Valet & EV Charging',
  ]
};

export const ROOMS_DATA: Room[] = [
  {
    id: 'luxury-double',
    name: 'Luxury Double Room',
    tagline: 'King Bed, Complimentary Breakfast & Modern Luxury',
    category: 'deluxe',
    price: 2800,
    originalPrice: 3600,
    sizeSqFt: 340,
    bedType: '1 King Bed',
    maxOccupancy: 2,
    rating: 4.8,
    reviewsCount: 156,
    isPopular: true,
    availableUnits: 8,
    image: '/src/assets/images/room_deluxe_king_1794500883485.jpg',
    gallery: [
      '/src/assets/images/room_deluxe_king_1794500883485.jpg',
      '/src/assets/images/hero_yashdeep_palace_1794500883865.jpg'
    ],
    description: 'Features 1 King Bed, complimentary breakfast, free high-speed Wi-Fi, acoustic soundproofing, and luxury amenities blending traditional charm with contemporary comfort opposite Honda Car Gate 4.',
    amenities: [
      'High-Speed Wi-Fi (150 Mbps)',
      'Complimentary Royal Breakfast',
      '43" 4K Smart LED TV',
      'Tea & Coffee Maker',
      'Electronic Digital Safe',
      'Central Climate Control (AC)',
      'Luxury Herbal Toiletries',
      'Daily Housekeeping'
    ]
  },
  {
    id: 'deluxe-room',
    name: 'Deluxe Executive Room',
    tagline: 'Spacious Layout with Premium Amenities & In-Room Service',
    category: 'deluxe',
    price: 3400,
    originalPrice: 4400,
    sizeSqFt: 380,
    bedType: '1 King Bed or 2 Twin Beds',
    maxOccupancy: 3,
    rating: 4.9,
    reviewsCount: 98,
    availableUnits: 6,
    image: '/src/assets/images/room_executive_suite_1794500885220.jpg',
    gallery: [
      '/src/assets/images/room_executive_suite_1794500885220.jpg',
      '/src/assets/images/room_deluxe_king_1794500883485.jpg'
    ],
    description: 'Spacious layout with modern furnishings, ergonomic workstation for business delegates visiting Honda Car plant, and Italian marble rain-shower bathroom.',
    amenities: [
      'High-Speed Wi-Fi (150 Mbps)',
      'Acoustic Soundproofing',
      '43" 4K Smart TV',
      'Ergonomic Workstation',
      'Italian Marble Rain Shower',
      'Electronic Digital Safe',
      '24/7 Room Service',
      'Express Laundry Service'
    ]
  },
  {
    id: 'super-deluxe-suite',
    name: 'Super Deluxe Executive Suite',
    tagline: 'Living Area, Scenic Balcony & Luxury Hospitality',
    category: 'suite',
    price: 4800,
    originalPrice: 6200,
    sizeSqFt: 520,
    bedType: '1 Royal Emperor King Bed',
    maxOccupancy: 3,
    rating: 4.9,
    reviewsCount: 74,
    availableUnits: 4,
    image: '/src/assets/images/room_executive_suite_1794500885220.jpg',
    gallery: [
      '/src/assets/images/room_executive_suite_1794500885220.jpg',
      '/src/assets/images/hero_yashdeep_palace_1794500883865.jpg'
    ],
    description: 'A residential-style suite featuring a dedicated designer parlor, private open-air balcony with panoramic views of the Karuli Industrial Area, espresso bar, and evening turn-down service.',
    amenities: [
      'Scenic Private Balcony',
      'Separate Living & Dining Lounge',
      '55" Ultra HD Smart TV',
      'Espresso Pod Coffee Machine',
      'Complimentary Gourmet Minibar',
      'Luxury Bathrobes & Slippers',
      'Priority Concierge Service',
      'Evening Turn-down Service'
    ]
  },
  {
    id: 'executive-family-suite',
    name: 'Executive Royal Family Suite',
    tagline: 'Interconnected Living for Families & Wedding Guests',
    category: 'family',
    price: 5800,
    originalPrice: 7400,
    sizeSqFt: 680,
    bedType: '2 Queen Beds + Sofa Bed',
    maxOccupancy: 5,
    rating: 4.8,
    reviewsCount: 62,
    availableUnits: 3,
    image: '/src/assets/images/room_deluxe_king_1794500883485.jpg',
    gallery: [
      '/src/assets/images/room_deluxe_king_1794500883485.jpg',
      '/src/assets/images/restaurant_royal_feast_1794500885409.jpg'
    ],
    description: 'Expansive multi-room sanctuary tailored for wedding attendees and traveling families visiting the Bhiwadi-Alwar corridor. Features dual queen beds, double vanity sinks, and spacious wardrobes.',
    amenities: [
      'Dual Queen Bed Layout',
      'Double Marble Vanity Sink',
      'Family Dining Corner',
      'Microwave & Mini-Fridge',
      '50" Smart LED TV',
      'Kids Welcome Amenities',
      'High-Speed Wi-Fi',
      'Large Luggage Wardrobes'
    ]
  }
];

export const REVIEWS_DATA: Review[] = [
  {
    id: 'rev-1',
    author: 'Rajiv Malhotra',
    city: 'Gurugram',
    rating: 5,
    stayType: 'Business',
    comment: 'Best hotel near Honda Car plant Khuskheda. As an automotive supplier executive, this is my go-to stay. Super clean, quiet soundproofing for remote calls, high-speed Wi-Fi, and phenomenal North Indian food at The Royal Feast.',
    date: 'Stayed Oct 2026',
    verified: true
  },
  {
    id: 'rev-2',
    author: 'Sunita & Vikram Sharma',
    city: 'Jaipur',
    rating: 5,
    stayType: 'Wedding & Event',
    comment: 'Hosted our daughter’s wedding banquet and family stay at Yashdeep Palace. The banquet hall with the crystal chandeliers was breathtaking. Flawless hospitality by the staff and incredible catering arrangements.',
    date: 'Stayed Sep 2026',
    verified: true
  },
  {
    id: 'rev-3',
    author: 'Kenji Takahashi',
    city: 'Tokyo / Bhiwadi',
    rating: 5,
    stayType: 'Business',
    comment: 'Impressed by the cleanliness, safety, and international standards. The front desk team was very polite and helpful. Room service is fast and the Continental breakfast was delightful.',
    date: 'Stayed Aug 2026',
    verified: true
  },
  {
    id: 'rev-4',
    author: 'Deepak Chawla',
    city: 'New Delhi',
    rating: 5,
    stayType: 'Family',
    comment: 'Booked the Royal Family Suite on our road trip through Alwar. Very spacious, modern amenities, secure parking, and kid-friendly food. Seamless online booking experience with instant confirmation.',
    date: 'Stayed Nov 2026',
    verified: true
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Twilight facade illumination & fountains',
    tag: '#PalaceArchitecture',
    imageUrl: '/src/assets/images/hero_yashdeep_palace_1794500883865.jpg',
    likes: 428,
    handle: '@yashdeeppalace'
  },
  {
    id: 'gal-2',
    title: 'The Royal Feast multi-cuisine restaurant',
    tag: '#RoyalDining',
    imageUrl: '/src/assets/images/restaurant_royal_feast_1794500885409.jpg',
    likes: 367,
    handle: '@yashdeeppalace'
  },
  {
    id: 'gal-3',
    title: 'Grand Ballroom & Wedding Banquet setup',
    tag: '#PalaceWeddings',
    imageUrl: '/src/assets/images/palace_banquet_hall_1794500885387.jpg',
    likes: 512,
    handle: '@yashdeeppalace'
  },
  {
    id: 'gal-4',
    title: 'Executive King Room comfort & luxury',
    tag: '#LuxuryStays',
    imageUrl: '/src/assets/images/room_deluxe_king_1794500883485.jpg',
    likes: 295,
    handle: '@yashdeeppalace'
  },
  {
    id: 'gal-5',
    title: 'Royal Club Suite private lounge',
    tag: '#SuiteLife',
    imageUrl: '/src/assets/images/room_executive_suite_1794500885220.jpg',
    likes: 384,
    handle: '@yashdeeppalace'
  }
];

export const DINING_HIGHLIGHTS = {
  restaurantName: 'The Royal Feast',
  cuisine: 'North Indian, Rajasthani Royal Thali, Continental, Pan-Asian & Tandoori',
  timings: {
    breakfast: '7:00 AM – 10:30 AM',
    lunch: '12:30 PM – 3:30 PM',
    dinner: '7:00 PM – 11:30 PM'
  },
  description: 'An opulent dining sanctuary beneath crystal chandeliers serving authentic royal delicacies alongside comforting global favorites. Our master chefs prepare every dish with organic local spices and farm-fresh ingredients.',
  specials: [
    { name: 'Royal Dal Bukhara & Shahi Paneer', price: '₹480', category: 'Royal Specialties' },
    { name: 'Laal Maas Heritage Rajasthani Mutton', price: '₹680', category: 'Chef Signature' },
    { name: 'Paneer Tikka Angara & Murgh Malai Kebab', price: '₹420', category: 'Tandoor Grill' },
    { name: 'Gourmet Wood-Fired Herb Pizza & Pastas', price: '₹450', category: 'Continental' }
  ]
};

export const BANQUET_HIGHLIGHTS = {
  venueName: 'The Grand Imperial Ballroom & Royal Lawn',
  capacity: 'Up to 800+ Guests',
  suitableFor: 'Weddings, Receptions, Corporate Summits, Automotive Product Launches, Gala Dinners',
  features: [
    'Fully Air-Conditioned Pillarless Ballroom (6,500 sq ft)',
    'Manicured Open-Air Lawn for Evening Celebrations',
    'Advanced High-Definition Audio-Visual Rig & LED Wall',
    'Dedicated Bridal Suites & Green Rooms',
    'Custom Royal Buffet Catering & Live Food Stations',
    'Valet Parking for 200+ Vehicles'
  ]
};
