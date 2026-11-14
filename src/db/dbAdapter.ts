import mysql from 'mysql2/promise';
import {
  PhysicalRoom,
  BookingData,
  RoomChange,
  Expense,
  ServiceRequest,
  GuestFolioItem,
  StaffUser,
  HotelInfo,
  Room,
  DiningInfo,
  DiningSpecial,
  GalleryItem,
  Review,
  RedeemableBenefit,
} from '../types/hotel.ts';

const SEED_HOTEL_INFO: HotelInfo = {
  name: 'Yashdeep Palace',
  subtitle: 'Luxury Hotel, Fine Dining',
  address: 'Opposite Honda Car Gate No. 4, RA 403, Karuli Industrial Area, Khuskheda, Tapukrah, Rajasthan 301707, India',
  phone: '+91 82220 20699',
  phoneAlt: '+91 82220 20599',
  email: 'reception@yashdeeppalace.com',
  checkInTime: '1:00 PM',
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
    '24/7 Front Desk & Concierge',
    'Free & Secured Parking',
  ],
};

const SEED_ROOMS: Room[] = [
  {
    id: 'luxury-double',
    name: 'Deluxe Double Room',
    tagline: 'King Bed, Complimentary Breakfast & Modern Luxury',
    category: 'deluxe',
    price: 2200,
    originalPrice: 3600,
    sizeSqFt: 180,
    bedType: '1 King Bed',
    maxOccupancy: 2,
    rating: 4.8,
    reviewsCount: 156,
    isPopular: true,
    availableUnits: 4,
    image: '/src/assets/images/room_deluxe_king_1794500883485.jpg',
    gallery: [
      '/src/assets/images/room_deluxe_king_1794500883485.jpg',
      '/src/assets/images/hero_yashdeep_palace_1794500883865.jpg',
    ],
    description: 'Features 1 King Bed, complimentary breakfast, free high-speed Wi-Fi, acoustic soundproofing, and luxury amenities blending traditional charm with contemporary comfort opposite Honda Car Gate 4.',
    amenities: [
      'High-Speed Wi-Fi',
      'Complimentary Breakfast',
      '32" Smart LED TV',
      'Water Kettle',
      'Room Air Conditioner (AC)',
      'Toiletries',
      'Daily Housekeeping',
    ],
  },
  {
    id: 'deluxe-room',
    name: 'Deluxe Room',
    tagline: 'Premium Amenities & In-Room Service',
    category: 'deluxe',
    price: 1600,
    originalPrice: 3000,
    sizeSqFt: 180,
    bedType: '1 King Bed',
    maxOccupancy: 2,
    rating: 4.9,
    reviewsCount: 98,
    availableUnits: 6,
    image: '/src/assets/images/room_executive_suite_1794500885220.jpg',
    gallery: [
      '/src/assets/images/room_executive_suite_1794500885220.jpg',
      '/src/assets/images/room_deluxe_king_1794500883485.jpg',
    ],
    description: 'Spacious layout with modern furnishings, special facilities for business delegates, and Italian marble bathroom with shower and 24*7 hot water.',
    amenities: [
      'High-Speed Wi-Fi',
      '32" Smart LED TV',
      'Water Kettle',
      'Room Air Conditioner (AC)',
      'Toiletries',
      'Daily Housekeeping',
    ],
  },
];

const SEED_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Rajiv Malhotra',
    city: 'Gurugram',
    rating: 5,
    stayType: 'Business',
    comment: 'Best hotel near Honda Car plant Khuskheda. Super clean, quiet soundproofing for remote calls, high-speed Wi-Fi, and phenomenal North Indian food at The Royal Feast.',
    date: 'Stayed Oct 2026',
    verified: true,
  },
  {
    id: 'rev-3',
    author: 'Kenji Takahashi',
    city: 'Tokyo / Bhiwadi',
    rating: 5,
    stayType: 'Business',
    comment: 'Impressed by the cleanliness, safety, and international standards. The front desk team was very polite and helpful. Room service is fast and the Continental breakfast was delightful.',
    date: 'Stayed Aug 2026',
    verified: true,
  },
  {
    id: 'rev-4',
    author: 'Deepak Chawla',
    city: 'New Delhi',
    rating: 5,
    stayType: 'Family',
    comment: 'Booked the Royal Family Suite on our road trip through Alwar. Very spacious, modern amenities, secure parking, and kid-friendly food. Seamless online booking experience with instant confirmation.',
    date: 'Stayed Nov 2026',
    verified: true,
  },
];

const SEED_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Twilight facade illumination & fountains',
    tag: '#PalaceArchitecture',
    imageUrl: '/src/assets/images/hero_yashdeep_palace_1794500883865.jpg',
    likes: 428,
    handle: '@yashdeeppalace',
  },
  {
    id: 'gal-2',
    title: 'The Royal Feast multi-cuisine restaurant',
    tag: '#RoyalDining',
    imageUrl: '/src/assets/images/restaurant_royal_feast_1794500885409.jpg',
    likes: 367,
    handle: '@yashdeeppalace',
  },
  {
    id: 'gal-4',
    title: 'Executive King Room comfort & luxury',
    tag: '#LuxuryStays',
    imageUrl: '/src/assets/images/room_deluxe_king_1794500883485.jpg',
    likes: 295,
    handle: '@yashdeeppalace',
  },
  {
    id: 'gal-5',
    title: 'Royal Club Suite private lounge',
    tag: '#SuiteLife',
    imageUrl: '/src/assets/images/room_executive_suite_1794500885220.jpg',
    likes: 384,
    handle: '@yashdeeppalace',
  },
];

const SEED_DINING: DiningInfo = {
  restaurantName: 'The Royal Feast',
  cuisine: 'North Indian, Rajasthani Royal Thali, Continental, Pan-Asian & Tandoori',
  timings: {
    breakfast: '7:00 AM – 10:30 AM',
    lunch: '12:30 PM – 3:30 PM',
    dinner: '7:00 PM – 10:30 PM',
  },
  description: 'An opulent dining sanctuary beneath crystal chandeliers serving authentic royal delicacies alongside comforting global favorites. Our master chefs prepare every dish with organic local spices and farm-fresh ingredients.',
  specials: [
    { id: 'dish-1', name: 'Royal Dal Bukhara & Shahi Paneer', price: '₹480', category: 'Royal Specialties' },
    { id: 'dish-2', name: 'Laal Maas Heritage Rajasthani Mutton', price: '₹680', category: 'Chef Signature' },
    { id: 'dish-3', name: 'Paneer Tikka Angara & Murgh Malai Kebab', price: '₹420', category: 'Tandoor Grill' },
    { id: 'dish-4', name: 'Gourmet Wood-Fired Herb Pizza & Pastas', price: '₹450', category: 'Continental' },
  ],
};

const SEED_BENEFITS: RedeemableBenefit[] = [
  {
    id: 'benefit-1',
    title: '10% Off Direct Stay Tariff',
    pointsCost: 300,
    description: 'Instant 10% deduction applied to your room total for any deluxe room or luxury suite.',
    code: 'YDP-REWARD-10',
    type: 'room_discount',
    value: '10% Discount',
  },
  {
    id: 'benefit-2',
    title: 'Complimentary Royal Buffet Breakfast',
    pointsCost: 200,
    description: 'Enjoy a lavish multi-cuisine morning buffet for up to 2 guests at The Royal Feast.',
    code: 'YDP-FREE-BF',
    type: 'free_breakfast',
    value: 'Free Breakfast (₹700 Value)',
  },
  {
    id: 'benefit-3',
    title: 'Priority Early Check-in (from 10 AM)',
    pointsCost: 150,
    description: 'Guaranteed flexible check-in and complimentary late checkout until 2:00 PM.',
    code: 'YDP-EARLY-IN',
    type: 'early_checkin',
    value: 'Free Early Check-in (₹600 Value)',
  },
  {
    id: 'benefit-4',
    title: 'Complimentary Royal Suite Upgrade',
    pointsCost: 500,
    description: 'Upgrade your Deluxe King Room reservation to a spacious Royal Club Suite with balcony.',
    code: 'YDP-SUITE-UP',
    type: 'suite_upgrade',
    value: 'Free Suite Upgrade (₹1,500 Value)',
  },
];

let mysqlPool: mysql.Pool | null = null;
let isMysqlConnected = false;

/**
 * Returns active MySQL pool or throws if not connected
 */
function getPool(): mysql.Pool {
  if (!mysqlPool || !isMysqlConnected) {
    throw new Error('MySQL Database is not connected');
  }
  return mysqlPool;
}

/**
 * Initializes MySQL pool and runs automated DDL migrations & initial seeding
 */
export async function initDb() {
  const host = process.env.MYSQL_HOST || process.env.DB_HOST || 'yashdeeppalace.com';
  const user = process.env.MYSQL_USER || process.env.DB_USER || 'yashdeep';
  const password = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || 'yashdeep@123';
  const database = process.env.MYSQL_DATABASE || process.env.DB_NAME || 'yashdeep';
  const port = Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306);

  try {
    mysqlPool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 15000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });

    // Test connection
    const [testRows] = await mysqlPool.query('SELECT 1 as test');
    isMysqlConnected = true;
    console.log(`✅ Connected to MySQL database successfully on ${host}:${port} (${database})`);

    // Run DDL migrations
    // await runMigrations(mysqlPool, database);

    // Seed initial data if tables are empty
    // await seedInitialData(mysqlPool);
  } catch (err: any) {
    console.error('❌ Failed to connect to MySQL database:', err.message);
    isMysqlConnected = false;
    throw err;
  }
}

/**
 * Ensures all required hotel tables and columns exist in MySQL
 */
async function runMigrations(pool: mysql.Pool, databaseName: string) {
  // 1. Hotel Info Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hotel_info (
      id VARCHAR(50) PRIMARY KEY,
      data_json LONGTEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2. Room Categories Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS room_categories (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      tagline VARCHAR(255),
      category VARCHAR(50) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      original_price DECIMAL(10,2) NOT NULL,
      size_sq_ft INT DEFAULT 180,
      bed_type VARCHAR(50) DEFAULT '1 King Bed',
      max_occupancy INT DEFAULT 2,
      available_units INT DEFAULT 1,
      description TEXT,
      image VARCHAR(500),
      gallery_json LONGTEXT,
      rating DECIMAL(3,2) DEFAULT 4.8,
      reviews_count INT DEFAULT 40,
      amenities_json LONGTEXT,
      is_popular TINYINT(1) DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3. Physical Rooms Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS physical_rooms (
      room_number VARCHAR(10) PRIMARY KEY,
      room_type_id VARCHAR(50) NOT NULL,
      floor INT NOT NULL,
      housekeeping_status VARCHAR(20) DEFAULT 'clean',
      occupancy_status VARCHAR(20) DEFAULT 'vacant',
      current_booking_reference VARCHAR(50),
      notes TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 4. Upgrade bookings table with PMS columns if missing
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_reference VARCHAR(50) UNIQUE,
      room_id VARCHAR(50),
      room_name VARCHAR(100),
      check_in_date DATE,
      check_out_date DATE,
      nights INT DEFAULT 1,
      adults INT DEFAULT 2,
      children INT DEFAULT 0,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      gst_number VARCHAR(50),
      special_requests TEXT,
      add_ons_json LONGTEXT,
      room_rate_total DECIMAL(10,2) DEFAULT 0,
      add_ons_total DECIMAL(10,2) DEFAULT 0,
      tax_amount DECIMAL(10,2) DEFAULT 0,
      grand_total DECIMAL(10,2) DEFAULT 0,
      payment_method VARCHAR(50) DEFAULT 'pay_at_hotel',
      payment_status VARCHAR(50) DEFAULT 'pending',
      stay_status VARCHAR(50) DEFAULT 'confirmed',
      assigned_room_number VARCHAR(10),
      id_proof_type VARCHAR(50),
      id_proof_number VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Safely check and add any missing columns in bookings
  const [existingCols]: any = await pool.query(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bookings';
  `, [databaseName]);
  const colSet = new Set(existingCols.map((c: any) => c.COLUMN_NAME.toLowerCase()));

  const columnsToAdd: Array<{ name: string; ddl: string }> = [
    { name: 'booking_reference', ddl: 'ADD COLUMN booking_reference VARCHAR(50) UNIQUE' },
    { name: 'room_id', ddl: 'ADD COLUMN room_id VARCHAR(50)' },
    { name: 'room_name', ddl: 'ADD COLUMN room_name VARCHAR(100)' },
    { name: 'nights', ddl: 'ADD COLUMN nights INT DEFAULT 1' },
    { name: 'gst_number', ddl: 'ADD COLUMN gst_number VARCHAR(50)' },
    { name: 'special_requests', ddl: 'ADD COLUMN special_requests TEXT' },
    { name: 'add_ons_json', ddl: 'ADD COLUMN add_ons_json LONGTEXT' },
    { name: 'room_rate_total', ddl: 'ADD COLUMN room_rate_total DECIMAL(10,2) DEFAULT 0' },
    { name: 'add_ons_total', ddl: 'ADD COLUMN add_ons_total DECIMAL(10,2) DEFAULT 0' },
    { name: 'tax_amount', ddl: 'ADD COLUMN tax_amount DECIMAL(10,2) DEFAULT 0' },
    { name: 'grand_total', ddl: 'ADD COLUMN grand_total DECIMAL(10,2) DEFAULT 0' },
    { name: 'payment_method', ddl: "ADD COLUMN payment_method VARCHAR(50) DEFAULT 'pay_at_hotel'" },
    { name: 'payment_status', ddl: "ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending'" },
    { name: 'stay_status', ddl: "ADD COLUMN stay_status VARCHAR(50) DEFAULT 'confirmed'" },
    { name: 'assigned_room_number', ddl: 'ADD COLUMN assigned_room_number VARCHAR(10)' },
    { name: 'id_proof_type', ddl: 'ADD COLUMN id_proof_type VARCHAR(50)' },
    { name: 'id_proof_number', ddl: 'ADD COLUMN id_proof_number VARCHAR(100)' },
  ];

  for (const col of columnsToAdd) {
    if (!colSet.has(col.name.toLowerCase())) {
      try {
        await pool.query(`ALTER TABLE bookings ${col.ddl};`);
        console.log(`[MySQL Migration] Added missing column '${col.name}' to bookings table.`);
      } catch (err: any) {
        console.warn(`[MySQL Migration] Could not add column ${col.name}:`, err.message);
      }
    }
  }

  // 5. Room Changes Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS room_changes (
      id VARCHAR(50) PRIMARY KEY,
      booking_reference VARCHAR(50) NOT NULL,
      from_room_number VARCHAR(10) NOT NULL,
      to_room_number VARCHAR(10) NOT NULL,
      reason TEXT NOT NULL,
      changed_by VARCHAR(100) NOT NULL,
      changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 6. Expenses Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id VARCHAR(50) PRIMARY KEY,
      category VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      receipt_number VARCHAR(50),
      date DATE NOT NULL,
      recorded_by VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 7. Service Requests Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS service_requests (
      id VARCHAR(50) PRIMARY KEY,
      room_number VARCHAR(10) NOT NULL,
      guest_name VARCHAR(100) NOT NULL,
      request_type VARCHAR(50) NOT NULL,
      priority VARCHAR(20) NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      assigned_to VARCHAR(100),
      notes TEXT,
      requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 8. Dining Info Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS dining_info (
      id VARCHAR(50) PRIMARY KEY,
      data_json LONGTEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 9. Dining Specials Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS dining_specials (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      price VARCHAR(50) NOT NULL,
      category VARCHAR(50) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 10. Reward Benefits Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reward_benefits (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      points_cost INT NOT NULL,
      description TEXT,
      code VARCHAR(64) NOT NULL,
      type VARCHAR(64) NOT NULL,
      value VARCHAR(128) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 11. Media Gallery Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gallery (
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      tag VARCHAR(50) NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      likes INT DEFAULT 0,
      handle VARCHAR(100),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 12. Reviews Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(50) PRIMARY KEY,
      author VARCHAR(100) NOT NULL,
      city VARCHAR(100) NOT NULL,
      rating DECIMAL(3,2) NOT NULL,
      stay_type VARCHAR(50) NOT NULL,
      comment TEXT NOT NULL,
      date VARCHAR(50) NOT NULL,
      verified TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 13. Guest Folios Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS guest_folios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_reference VARCHAR(50) NOT NULL,
      item_type VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      recorded_by VARCHAR(100) DEFAULT 'Front Desk',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 14. Staff Users Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS staff_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

/**
 * Seeds initial hotel data into MySQL if tables are empty
 */
async function seedInitialData(pool: mysql.Pool) {
  // Check if hotel_info is seeded
  const [infoRows]: any = await pool.query('SELECT COUNT(*) as count FROM hotel_info;');
  if (Number(infoRows[0].count) === 0) {
    console.log('🌱 Seeding initial hotel_info into MySQL...');
    await pool.query(
      'INSERT INTO hotel_info (id, data_json) VALUES (?, ?);',
      ['primary', JSON.stringify(SEED_HOTEL_INFO)]
    );
  }

  // Check if room_categories is seeded
  const [roomRows]: any = await pool.query('SELECT COUNT(*) as count FROM room_categories;');
  if (Number(roomRows[0].count) === 0) {
    console.log('🌱 Seeding initial room categories into MySQL...');
    for (const r of SEED_ROOMS) {
      await pool.query(
        `INSERT INTO room_categories 
         (id, name, tagline, category, price, original_price, size_sq_ft, bed_type, max_occupancy, available_units, description, image, gallery_json, rating, reviews_count, amenities_json, is_popular)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          r.id,
          r.name,
          r.tagline || '',
          r.category,
          r.price,
          r.originalPrice,
          r.sizeSqFt || 180,
          r.bedType || '1 King Bed',
          r.maxOccupancy || 2,
          r.availableUnits || 1,
          r.description || '',
          r.image || '',
          JSON.stringify(r.gallery || []),
          r.rating || 4.8,
          r.reviewsCount || 40,
          JSON.stringify(r.amenities || []),
          r.isPopular ? 1 : 0,
        ]
      );
    }
  }

  // Check if physical_rooms is seeded
  const [physRows]: any = await pool.query('SELECT COUNT(*) as count FROM physical_rooms;');
  if (Number(physRows[0].count) === 0) {
    console.log('🌱 Seeding initial physical rooms into MySQL...');
    const seedPhysicalRooms: PhysicalRoom[] = [
      { roomNumber: '101', roomTypeId: 'luxury-double', floor: 1, housekeepingStatus: 'clean', occupancyStatus: 'vacant', currentBookingReference: null, notes: 'Executive King opposite courtyard, acoustic insulated' },
      { roomNumber: '102', roomTypeId: 'luxury-double', floor: 1, housekeepingStatus: 'clean', occupancyStatus: 'vacant', currentBookingReference: null, notes: 'Garden view, newly painted' },
      { roomNumber: '103', roomTypeId: 'deluxe-room', floor: 1, housekeepingStatus: 'clean', occupancyStatus: 'vacant', currentBookingReference: null, notes: 'Direct lobby floor access' },
      { roomNumber: '201', roomTypeId: 'luxury-double', floor: 2, housekeepingStatus: 'clean', occupancyStatus: 'vacant', currentBookingReference: null, notes: 'Corner suite with balcony view' },
      { roomNumber: '202', roomTypeId: 'deluxe-room', floor: 2, housekeepingStatus: 'clean', occupancyStatus: 'vacant', currentBookingReference: null, notes: 'Quiet corner room for corporate executives' },
      { roomNumber: '203', roomTypeId: 'deluxe-room', floor: 2, housekeepingStatus: 'clean', occupancyStatus: 'vacant', currentBookingReference: null, notes: 'Equipped with extra workstation desk' },
      { roomNumber: '301', roomTypeId: 'luxury-double', floor: 3, housekeepingStatus: 'clean', occupancyStatus: 'vacant', currentBookingReference: null, notes: 'Top floor penthouse suite with sunset terrace' },
      { roomNumber: '302', roomTypeId: 'deluxe-room', floor: 3, housekeepingStatus: 'clean', occupancyStatus: 'vacant', currentBookingReference: null, notes: 'Quiet executive view overlooking Honda Gate 4' },
      { roomNumber: '303', roomTypeId: 'deluxe-room', floor: 3, housekeepingStatus: 'clean', occupancyStatus: 'vacant', currentBookingReference: null, notes: 'King bed with soundproofed glass' },
    ];
    for (const pr of seedPhysicalRooms) {
      await pool.query(
        `INSERT INTO physical_rooms 
         (room_number, room_type_id, floor, housekeeping_status, occupancy_status, current_booking_reference, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [pr.roomNumber, pr.roomTypeId, pr.floor, pr.housekeepingStatus, pr.occupancyStatus, pr.currentBookingReference || null, pr.notes || '']
      );
    }
  }

  // Check if dining_info is seeded
  const [diningRows]: any = await pool.query('SELECT COUNT(*) as count FROM dining_info;');
  if (Number(diningRows[0].count) === 0) {
    console.log('🌱 Seeding initial dining_info and specials into MySQL...');
    await pool.query(
      'INSERT INTO dining_info (id, data_json) VALUES (?, ?);',
      ['primary', JSON.stringify({
        restaurantName: SEED_DINING.restaurantName,
        cuisine: SEED_DINING.cuisine,
        timings: SEED_DINING.timings,
        description: SEED_DINING.description,
      })]
    );
    for (let idx = 0; idx < SEED_DINING.specials.length; idx++) {
      const sp = SEED_DINING.specials[idx];
      await pool.query(
        'INSERT INTO dining_specials (id, name, price, category) VALUES (?, ?, ?, ?);',
        [`dish-${idx + 1}`, sp.name, sp.price, sp.category]
      );
    }
  }

  // Check if reward_benefits is seeded
  const [benefitRows]: any = await pool.query('SELECT COUNT(*) as count FROM reward_benefits;');
  if (Number(benefitRows[0].count) === 0) {
    console.log('🌱 Seeding initial reward benefits into MySQL...');
    for (const b of SEED_BENEFITS) {
      await pool.query(
        'INSERT INTO reward_benefits (id, title, points_cost, description, code, type, value, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1);',
        [b.id, b.title, b.pointsCost, b.description, b.code, b.type, b.value]
      );
    }
  }

  // Check if gallery is seeded
  const [galleryRows]: any = await pool.query('SELECT COUNT(*) as count FROM gallery;');
  if (Number(galleryRows[0].count) === 0) {
    console.log('🌱 Seeding initial gallery into MySQL...');
    for (const g of SEED_GALLERY) {
      await pool.query(
        'INSERT INTO gallery (id, title, tag, image_url, likes, handle) VALUES (?, ?, ?, ?, ?, ?);',
        [g.id, g.title, g.tag, g.imageUrl, g.likes, g.handle]
      );
    }
  }

  // Check if reviews is seeded
  const [reviewRows]: any = await pool.query('SELECT COUNT(*) as count FROM reviews;');
  if (Number(reviewRows[0].count) === 0) {
    console.log('🌱 Seeding initial reviews into MySQL...');
    for (const r of SEED_REVIEWS) {
      await pool.query(
        'INSERT INTO reviews (id, author, city, rating, stay_type, comment, date, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
        [r.id, r.author, r.city, r.rating, r.stayType, r.comment, r.date, r.verified ? 1 : 0]
      );
    }
  }

  // Check if staff_users is seeded
  const [staffRows]: any = await pool.query('SELECT COUNT(*) as count FROM staff_users;');
  if (Number(staffRows[0].count) === 0) {
    console.log('🌱 Seeding initial manager staff into MySQL...');
    await pool.query(
      'INSERT INTO staff_users (id, email, name, role) VALUES (?, ?, ?, ?);',
      [1, 'rasu2027@gmail.com', 'Rasu Kumar', 'general_manager']
    );
  }
}

// ==================== 1. HOTEL INFO ====================

export async function getHotelInfo(): Promise<HotelInfo> {
  const pool = getPool();
  const [rows]: any = await pool.query('SELECT data_json FROM hotel_info WHERE id = "primary";');
  if (rows && rows.length > 0) {
    return JSON.parse(rows[0].data_json);
  }
  return SEED_HOTEL_INFO;
}

export async function updateHotelInfo(updates: Partial<HotelInfo>): Promise<HotelInfo> {
  const pool = getPool();
  const current = await getHotelInfo();
  const merged = { ...current, ...updates };
  await pool.query(
    'INSERT INTO hotel_info (id, data_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE data_json = VALUES(data_json), updated_at = NOW();',
    ['primary', JSON.stringify(merged)]
  );
  return merged;
}

// ==================== 2. ROOM CATEGORIES ====================

export async function getRooms(): Promise<Room[]> {
  const pool = getPool();
  const [rows]: any = await pool.query('SELECT * FROM room_categories ORDER BY price ASC;');
  if (!rows || rows.length === 0) return [];
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    tagline: r.tagline || '',
    category: r.category,
    price: Number(r.price),
    originalPrice: Number(r.original_price),
    sizeSqFt: Number(r.size_sq_ft),
    bedType: r.bed_type,
    maxOccupancy: Number(r.max_occupancy),
    availableUnits: Number(r.available_units),
    description: r.description || '',
    image: r.image || '',
    gallery: r.gallery_json ? JSON.parse(r.gallery_json) : [],
    rating: Number(r.rating),
    reviewsCount: Number(r.reviews_count),
    amenities: r.amenities_json ? JSON.parse(r.amenities_json) : [],
    isPopular: Boolean(r.is_popular),
  }));
}

export async function upsertRoom(room: Room): Promise<Room> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO room_categories 
     (id, name, tagline, category, price, original_price, size_sq_ft, bed_type, max_occupancy, available_units, description, image, gallery_json, rating, reviews_count, amenities_json, is_popular)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       tagline = VALUES(tagline),
       category = VALUES(category),
       price = VALUES(price),
       original_price = VALUES(original_price),
       size_sq_ft = VALUES(size_sq_ft),
       bed_type = VALUES(bed_type),
       max_occupancy = VALUES(max_occupancy),
       available_units = VALUES(available_units),
       description = VALUES(description),
       image = VALUES(image),
       gallery_json = VALUES(gallery_json),
       rating = VALUES(rating),
       reviews_count = VALUES(reviews_count),
       amenities_json = VALUES(amenities_json),
       is_popular = VALUES(is_popular),
       updated_at = NOW();`,
    [
      room.id,
      room.name,
      room.tagline || '',
      room.category,
      room.price,
      room.originalPrice,
      room.sizeSqFt || 180,
      room.bedType || '1 King Bed',
      room.maxOccupancy || 2,
      room.availableUnits || 1,
      room.description || '',
      room.image || '',
      JSON.stringify(room.gallery || []),
      room.rating || 4.8,
      room.reviewsCount || 40,
      JSON.stringify(room.amenities || []),
      room.isPopular ? 1 : 0,
    ]
  );
  return room;
}

export async function deleteRoom(id: string): Promise<boolean> {
  const pool = getPool();
  await pool.query('DELETE FROM room_categories WHERE id = ?;', [id]);
  return true;
}

// ==================== 3. PHYSICAL ROOMS ====================

export async function getPhysicalRooms(): Promise<PhysicalRoom[]> {
  const pool = getPool();
  const [rows]: any = await pool.query('SELECT * FROM physical_rooms ORDER BY floor ASC, room_number ASC;');
  if (!rows || rows.length === 0) return [];
  return rows.map((r: any) => ({
    roomNumber: r.room_number,
    roomTypeId: r.room_type_id,
    floor: Number(r.floor),
    housekeepingStatus: r.housekeeping_status,
    occupancyStatus: r.occupancy_status,
    currentBookingReference: r.current_booking_reference,
    notes: r.notes || '',
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
  }));
}

export async function upsertPhysicalRoom(room: PhysicalRoom): Promise<PhysicalRoom> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO physical_rooms 
     (room_number, room_type_id, floor, housekeeping_status, occupancy_status, current_booking_reference, notes, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       room_type_id = VALUES(room_type_id),
       floor = VALUES(floor),
       housekeeping_status = VALUES(housekeeping_status),
       occupancy_status = VALUES(occupancy_status),
       current_booking_reference = VALUES(current_booking_reference),
       notes = VALUES(notes),
       updated_at = NOW();`,
    [
      room.roomNumber,
      room.roomTypeId,
      room.floor,
      room.housekeepingStatus,
      room.occupancyStatus,
      room.currentBookingReference || null,
      room.notes || '',
    ]
  );
  return room;
}

export async function deletePhysicalRoom(roomNumber: string): Promise<boolean> {
  const pool = getPool();
  await pool.query('DELETE FROM physical_rooms WHERE room_number = ?;', [roomNumber]);
  return true;
}

export async function updatePhysicalRoomStatus(
  roomNumber: string,
  updates: Partial<PhysicalRoom>
): Promise<PhysicalRoom | null> {
  const pool = getPool();
  const sets: string[] = [];
  const vals: any[] = [];
  if (updates.housekeepingStatus !== undefined) { sets.push('housekeeping_status = ?'); vals.push(updates.housekeepingStatus); }
  if (updates.occupancyStatus !== undefined) { sets.push('occupancy_status = ?'); vals.push(updates.occupancyStatus); }
  if (updates.currentBookingReference !== undefined) { sets.push('current_booking_reference = ?'); vals.push(updates.currentBookingReference); }
  if (updates.notes !== undefined) { sets.push('notes = ?'); vals.push(updates.notes); }

  if (sets.length > 0) {
    sets.push('updated_at = NOW()');
    vals.push(roomNumber);
    await pool.query(`UPDATE physical_rooms SET ${sets.join(', ')} WHERE room_number = ?;`, vals);
  }
  const [rows]: any = await pool.query('SELECT * FROM physical_rooms WHERE room_number = ?;', [roomNumber]);
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    roomNumber: r.room_number,
    roomTypeId: r.room_type_id,
    floor: Number(r.floor),
    housekeepingStatus: r.housekeeping_status,
    occupancyStatus: r.occupancy_status,
    currentBookingReference: r.current_booking_reference,
    notes: r.notes || '',
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

// ==================== 4. BOOKINGS & PMS RESERVATIONS ====================

export async function getBookings(): Promise<BookingData[]> {
  const pool = getPool();
  const [rows]: any = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC;');
  if (!rows || rows.length === 0) return [];
  return rows.map(mapBookingRow);
}

function mapBookingRow(r: any): BookingData {
  return {
    id: String(r.id),
    bookingReference: r.booking_reference || `YDP-${new Date().getFullYear()}-${r.id}`,
    roomId: r.room_id || 'luxury-double',
    roomName: r.room_name || 'Deluxe Room',
    checkIn: r.check_in_date ? new Date(r.check_in_date).toISOString().split('T')[0] : '',
    checkOut: r.check_out_date ? new Date(r.check_out_date).toISOString().split('T')[0] : '',
    nights: Number(r.nights || 1),
    adultCount: Number(r.adults || 2),
    childCount: Number(r.children || 0),
    guestName: r.full_name,
    guestEmail: r.email,
    guestPhone: r.phone,
    gstNumber: r.gst_number || undefined,
    specialRequests: r.special_requests || undefined,
    addOns: r.add_ons_json ? JSON.parse(r.add_ons_json) : { breakfast: false, airportTransfer: false, earlyCheckIn: false },
    roomRateTotal: Number(r.room_rate_total || r.grand_total || 2200),
    addOnsTotal: Number(r.add_ons_total || 0),
    taxAmount: Number(r.tax_amount || 0),
    grandTotal: Number(r.grand_total || 2200),
    paymentMethod: r.payment_method || 'pay_at_hotel',
    paymentStatus: r.payment_status || 'pending',
    stayStatus: r.stay_status || 'confirmed',
    assignedRoomNumber: r.assigned_room_number || undefined,
    idProofType: r.id_proof_type || undefined,
    idProofNumber: r.id_proof_number || undefined,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
  };
}

export async function createBooking(data: Partial<BookingData>): Promise<BookingData> {
  const pool = getPool();
  const reference = data.bookingReference || `YDP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const [res]: any = await pool.query(
    `INSERT INTO bookings 
     (booking_reference, room_id, room_name, check_in_date, check_out_date, nights, adults, children, full_name, email, phone, gst_number, special_requests, add_ons_json, room_rate_total, add_ons_total, tax_amount, grand_total, payment_method, payment_status, stay_status, assigned_room_number, id_proof_type, id_proof_number, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW());`,
    [
      reference,
      data.roomId || 'luxury-double',
      data.roomName || 'Deluxe Room',
      data.checkIn || new Date().toISOString().split('T')[0],
      data.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      data.nights || 1,
      data.adultCount || 2,
      data.childCount || 0,
      data.guestName || '',
      data.guestEmail || '',
      data.guestPhone || '',
      data.gstNumber || null,
      data.specialRequests || null,
      JSON.stringify(data.addOns || {}),
      data.roomRateTotal || 2200,
      data.addOnsTotal || 0,
      data.taxAmount || 0,
      data.grandTotal || 2200,
      data.paymentMethod || 'pay_at_hotel',
      data.paymentStatus || 'pending',
      data.stayStatus || 'confirmed',
      data.assignedRoomNumber || null,
      data.idProofType || null,
      data.idProofNumber || null,
    ]
  );

  const [rows]: any = await pool.query('SELECT * FROM bookings WHERE id = ?;', [res.insertId]);
  return mapBookingRow(rows[0]);
}

export async function updateBookingStatus(reference: string, status: string): Promise<BookingData | null> {
  const pool = getPool();
  await pool.query('UPDATE bookings SET stay_status = ?, updated_at = NOW() WHERE booking_reference = ?;', [status, reference]);
  const [rows]: any = await pool.query('SELECT * FROM bookings WHERE booking_reference = ?;', [reference]);
  if (!rows || rows.length === 0) return null;
  return mapBookingRow(rows[0]);
}

export async function checkInGuest(params: {
  bookingReference: string;
  roomNumber: string;
  idProofType?: string;
  idProofNumber?: string;
}): Promise<BookingData | null> {
  const pool = getPool();
  await pool.query(
    `UPDATE bookings 
     SET assigned_room_number = ?, stay_status = 'checked_in', id_proof_type = ?, id_proof_number = ?, updated_at = NOW()
     WHERE booking_reference = ?;`,
    [params.roomNumber, params.idProofType || null, params.idProofNumber || null, params.bookingReference]
  );
  await pool.query(
    `UPDATE physical_rooms 
     SET occupancy_status = 'occupied', current_booking_reference = ?, updated_at = NOW()
     WHERE room_number = ?;`,
    [params.bookingReference, params.roomNumber]
  );
  const [rows]: any = await pool.query('SELECT * FROM bookings WHERE booking_reference = ?;', [params.bookingReference]);
  if (!rows || rows.length === 0) return null;
  return mapBookingRow(rows[0]);
}

export async function checkOutGuest(params: {
  bookingReference: string;
  roomNumber: string;
}): Promise<BookingData | null> {
  const pool = getPool();
  await pool.query(
    `UPDATE bookings 
     SET stay_status = 'checked_out', payment_status = 'paid', updated_at = NOW()
     WHERE booking_reference = ?;`,
    [params.bookingReference]
  );
  await pool.query(
    `UPDATE physical_rooms 
     SET occupancy_status = 'vacant', housekeeping_status = 'dirty', current_booking_reference = NULL, updated_at = NOW()
     WHERE room_number = ?;`,
    [params.roomNumber]
  );
  const [rows]: any = await pool.query('SELECT * FROM bookings WHERE booking_reference = ?;', [params.bookingReference]);
  if (!rows || rows.length === 0) return null;
  return mapBookingRow(rows[0]);
}

export async function changeGuestRoom(params: {
  bookingReference: string;
  fromRoomNumber: string;
  toRoomNumber: string;
  reason: string;
  changedBy: string;
}): Promise<{ booking: BookingData; roomChange: RoomChange }> {
  const pool = getPool();
  const changeId = `rc-${Date.now()}`;

  // 1. Insert room change log
  await pool.query(
    `INSERT INTO room_changes (id, booking_reference, from_room_number, to_room_number, reason, changed_by, changed_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW());`,
    [changeId, params.bookingReference, params.fromRoomNumber, params.toRoomNumber, params.reason, params.changedBy]
  );

  // 2. Vacate previous room and mark dirty
  await pool.query(
    `UPDATE physical_rooms 
     SET occupancy_status = 'vacant', housekeeping_status = 'dirty', current_booking_reference = NULL, updated_at = NOW()
     WHERE room_number = ?;`,
    [params.fromRoomNumber]
  );

  // 3. Occupy new room
  await pool.query(
    `UPDATE physical_rooms 
     SET occupancy_status = 'occupied', current_booking_reference = ?, updated_at = NOW()
     WHERE room_number = ?;`,
    [params.bookingReference, params.toRoomNumber]
  );

  // 4. Update booking
  await pool.query(
    'UPDATE bookings SET assigned_room_number = ?, updated_at = NOW() WHERE booking_reference = ?;',
    [params.toRoomNumber, params.bookingReference]
  );

  const [bRows]: any = await pool.query('SELECT * FROM bookings WHERE booking_reference = ?;', [params.bookingReference]);
  const [rcRows]: any = await pool.query('SELECT * FROM room_changes WHERE id = ?;', [changeId]);

  return {
    booking: mapBookingRow(bRows[0]),
    roomChange: {
      id: rcRows[0].id,
      bookingReference: rcRows[0].booking_reference,
      fromRoomNumber: rcRows[0].from_room_number,
      toRoomNumber: rcRows[0].to_room_number,
      reason: rcRows[0].reason,
      changedBy: rcRows[0].changed_by,
      changedAt: new Date(rcRows[0].changed_at).toISOString(),
    },
  };
}

export async function getRoomChanges(bookingReference?: string): Promise<RoomChange[]> {
  const pool = getPool();
  let query = 'SELECT * FROM room_changes';
  const params: any[] = [];
  if (bookingReference) {
    query += ' WHERE booking_reference = ?';
    params.push(bookingReference);
  }
  query += ' ORDER BY changed_at DESC;';
  const [rows]: any = await pool.query(query, params);
  if (!rows || rows.length === 0) return [];
  return rows.map((r: any) => ({
    id: r.id,
    bookingReference: r.booking_reference,
    fromRoomNumber: r.from_room_number,
    toRoomNumber: r.to_room_number,
    reason: r.reason,
    changedBy: r.changed_by,
    changedAt: new Date(r.changed_at).toISOString(),
  }));
}

// ==================== 5. EXPENSES ====================

export async function getExpenses(): Promise<Expense[]> {
  const pool = getPool();
  const [rows]: any = await pool.query('SELECT * FROM expenses ORDER BY date DESC, created_at DESC;');
  if (!rows || rows.length === 0) return [];
  return rows.map((r: any) => ({
    id: r.id,
    category: r.category,
    description: r.description,
    amount: Number(r.amount),
    paymentMethod: r.payment_method,
    receiptNumber: r.receipt_number || undefined,
    date: r.date ? new Date(r.date).toISOString().split('T')[0] : '',
    recordedBy: r.recorded_by || 'Duty Manager',
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

export async function createExpense(data: Omit<Expense, 'id' | 'createdAt'> & { id?: string }): Promise<Expense> {
  const pool = getPool();
  const id = data.id || `exp-${Date.now()}`;
  await pool.query(
    `INSERT INTO expenses (id, category, description, amount, payment_method, receipt_number, date, recorded_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW());`,
    [id, data.category, data.description, data.amount, data.paymentMethod, data.receiptNumber || null, data.date, data.recordedBy || null]
  );
  const [rows]: any = await pool.query('SELECT * FROM expenses WHERE id = ?;', [id]);
  const r = rows[0];
  return {
    id: r.id,
    category: r.category,
    description: r.description,
    amount: Number(r.amount),
    paymentMethod: r.payment_method,
    receiptNumber: r.receipt_number || undefined,
    date: r.date ? new Date(r.date).toISOString().split('T')[0] : '',
    recordedBy: r.recorded_by || 'Duty Manager',
    createdAt: new Date(r.created_at).toISOString(),
  };
}

export async function deleteExpense(id: string): Promise<boolean> {
  const pool = getPool();
  await pool.query('DELETE FROM expenses WHERE id = ?;', [id]);
  return true;
}

// ==================== 6. SERVICE REQUESTS ====================

export async function getServiceRequests(): Promise<ServiceRequest[]> {
  const pool = getPool();
  const [rows]: any = await pool.query('SELECT * FROM service_requests ORDER BY requested_at DESC;');
  if (!rows || rows.length === 0) return [];
  return rows.map((r: any) => ({
    id: r.id,
    roomNumber: r.room_number,
    guestName: r.guest_name,
    requestType: r.request_type,
    priority: r.priority,
    description: r.description,
    status: r.status,
    assignedTo: r.assigned_to || undefined,
    notes: r.notes || undefined,
    requestedAt: new Date(r.requested_at).toISOString(),
    completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : undefined,
  }));
}

export async function createServiceRequest(
  data: Omit<ServiceRequest, 'id' | 'requestedAt'> & { id?: string }
): Promise<ServiceRequest> {
  const pool = getPool();
  const id = data.id || `sr-${Date.now()}`;
  await pool.query(
    `INSERT INTO service_requests (id, room_number, guest_name, request_type, priority, description, status, assigned_to, notes, requested_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW());`,
    [id, data.roomNumber, data.guestName, data.requestType, data.priority, data.description, data.status || 'pending', data.assignedTo || null, data.notes || null]
  );
  const [rows]: any = await pool.query('SELECT * FROM service_requests WHERE id = ?;', [id]);
  const r = rows[0];
  return {
    id: r.id,
    roomNumber: r.room_number,
    guestName: r.guest_name,
    requestType: r.request_type,
    priority: r.priority,
    description: r.description,
    status: r.status,
    assignedTo: r.assigned_to || undefined,
    notes: r.notes || undefined,
    requestedAt: new Date(r.requested_at).toISOString(),
  };
}

export async function updateServiceRequestStatus(
  id: string,
  status: 'pending' | 'in_progress' | 'completed',
  notes?: string
): Promise<ServiceRequest | null> {
  const pool = getPool();
  const completedAt = status === 'completed' ? 'NOW()' : 'NULL';
  await pool.query(
    `UPDATE service_requests 
     SET status = ?, notes = COALESCE(?, notes), completed_at = ${completedAt}
     WHERE id = ?;`,
    [status, notes || null, id]
  );
  const [rows]: any = await pool.query('SELECT * FROM service_requests WHERE id = ?;', [id]);
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    roomNumber: r.room_number,
    guestName: r.guest_name,
    requestType: r.request_type,
    priority: r.priority,
    description: r.description,
    status: r.status,
    assignedTo: r.assigned_to || undefined,
    notes: r.notes || undefined,
    requestedAt: new Date(r.requested_at).toISOString(),
    completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : undefined,
  };
}

export async function deleteServiceRequest(id: string): Promise<boolean> {
  const pool = getPool();
  await pool.query('DELETE FROM service_requests WHERE id = ?;', [id]);
  return true;
}

// ==================== 7. GUEST FOLIOS ====================

export async function getGuestFolios(bookingReference: string): Promise<GuestFolioItem[]> {
  const pool = getPool();
  const [rows]: any = await pool.query('SELECT * FROM guest_folios WHERE booking_reference = ? ORDER BY created_at ASC;', [bookingReference]);
  if (!rows || rows.length === 0) return [];
  return rows.map((r: any) => ({
    id: r.id,
    bookingReference: r.booking_reference,
    itemType: r.item_type,
    description: r.description,
    amount: Number(r.amount),
    recordedBy: r.recorded_by,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

export async function addGuestFolioItem(data: {
  bookingReference: string;
  itemType: string;
  description: string;
  amount: number;
  recordedBy?: string;
}): Promise<GuestFolioItem> {
  const pool = getPool();
  const [res]: any = await pool.query(
    `INSERT INTO guest_folios (booking_reference, item_type, description, amount, recorded_by, created_at)
     VALUES (?, ?, ?, ?, ?, NOW());`,
    [data.bookingReference, data.itemType, data.description, data.amount, data.recordedBy || 'Front Desk']
  );
  const [rows]: any = await pool.query('SELECT * FROM guest_folios WHERE id = ?;', [res.insertId]);
  const r = rows[0];
  return {
    id: r.id,
    bookingReference: r.booking_reference,
    itemType: r.item_type,
    description: r.description,
    amount: Number(r.amount),
    recordedBy: r.recorded_by,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

// ==================== 8. DINING & SPECIALS ====================

export async function getDining(): Promise<DiningInfo> {
  const pool = getPool();
  const [infoRows]: any = await pool.query('SELECT data_json FROM dining_info WHERE id = "primary";');
  const [specialRows]: any = await pool.query('SELECT * FROM dining_specials ORDER BY id ASC;');

  const base = infoRows && infoRows.length > 0
    ? JSON.parse(infoRows[0].data_json)
    : {
      restaurantName: SEED_DINING.restaurantName,
      cuisine: SEED_DINING.cuisine,
      timings: SEED_DINING.timings,
      description: SEED_DINING.description,
    };

  const specials: DiningSpecial[] = (specialRows || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    price: s.price,
    category: s.category,
  }));

  return { ...base, specials };
}

export async function updateDining(updates: Partial<DiningInfo>): Promise<DiningInfo> {
  const pool = getPool();
  const current = await getDining();
  const merged = { ...current, ...updates };
  await pool.query(
    'INSERT INTO dining_info (id, data_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE data_json = VALUES(data_json), updated_at = NOW();',
    ['primary', JSON.stringify({
      restaurantName: merged.restaurantName,
      cuisine: merged.cuisine,
      timings: merged.timings,
      description: merged.description,
    })]
  );
  return merged;
}

export async function addDiningSpecial(special: Omit<DiningSpecial, 'id'> & { id?: string }): Promise<DiningSpecial> {
  const pool = getPool();
  const id = special.id || `dish-${Date.now()}`;
  await pool.query(
    'INSERT INTO dining_specials (id, name, price, category) VALUES (?, ?, ?, ?);',
    [id, special.name, special.price, special.category]
  );
  return { id, name: special.name, price: special.price, category: special.category };
}

export async function updateDiningSpecial(id: string, updates: Partial<DiningSpecial>): Promise<DiningSpecial | null> {
  const pool = getPool();
  const sets: string[] = [];
  const vals: any[] = [];
  if (updates.name !== undefined) { sets.push('name = ?'); vals.push(updates.name); }
  if (updates.price !== undefined) { sets.push('price = ?'); vals.push(updates.price); }
  if (updates.category !== undefined) { sets.push('category = ?'); vals.push(updates.category); }
  if (sets.length > 0) {
    sets.push('updated_at = NOW()');
    vals.push(id);
    await pool.query(`UPDATE dining_specials SET ${sets.join(', ')} WHERE id = ?;`, vals);
  }
  const [rows]: any = await pool.query('SELECT * FROM dining_specials WHERE id = ?;', [id]);
  if (!rows || rows.length === 0) return null;
  return { id: rows[0].id, name: rows[0].name, price: rows[0].price, category: rows[0].category };
}

export async function deleteDiningSpecial(id: string): Promise<boolean> {
  const pool = getPool();
  await pool.query('DELETE FROM dining_specials WHERE id = ?;', [id]);
  return true;
}

// ==================== 9. REWARD BENEFITS ====================

export async function getRewardBenefits(): Promise<RedeemableBenefit[]> {
  const pool = getPool();
  const [rows]: any = await pool.query('SELECT * FROM reward_benefits WHERE is_active = 1 ORDER BY points_cost ASC;');
  if (!rows || rows.length === 0) return [];
  return rows.map((r: any) => ({
    id: r.id,
    title: r.title,
    pointsCost: Number(r.points_cost),
    description: r.description,
    code: r.code,
    type: r.type,
    value: r.value,
  }));
}

export async function upsertRewardBenefit(benefit: RedeemableBenefit): Promise<RedeemableBenefit> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO reward_benefits (id, title, points_cost, description, code, type, value, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       points_cost = VALUES(points_cost),
       description = VALUES(description),
       code = VALUES(code),
       type = VALUES(type),
       value = VALUES(value),
       is_active = 1;`,
    [benefit.id, benefit.title, benefit.pointsCost, benefit.description, benefit.code, benefit.type, benefit.value]
  );
  return benefit;
}

// ==================== 10. MEDIA GALLERY ====================

export async function getGallery(): Promise<GalleryItem[]> {
  const pool = getPool();
  const [rows]: any = await pool.query('SELECT * FROM gallery ORDER BY id ASC;');
  if (!rows || rows.length === 0) return [];
  return rows.map((r: any) => ({
    id: r.id,
    title: r.title,
    tag: r.tag,
    imageUrl: r.image_url,
    likes: Number(r.likes || 0),
    handle: r.handle || '@yashdeeppalace',
  }));
}

export async function addGalleryItem(item: Omit<GalleryItem, 'id'> & { id?: string }): Promise<GalleryItem> {
  const pool = getPool();
  const id = item.id || `gal-${Date.now()}`;
  await pool.query(
    'INSERT INTO gallery (id, title, tag, image_url, likes, handle) VALUES (?, ?, ?, ?, ?, ?);',
    [id, item.title, item.tag, item.imageUrl, item.likes || 0, item.handle || '@yashdeeppalace']
  );
  return { id, title: item.title, tag: item.tag, imageUrl: item.imageUrl, likes: item.likes || 0, handle: item.handle || '@yashdeeppalace' };
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem | null> {
  const pool = getPool();
  const sets: string[] = [];
  const vals: any[] = [];
  if (updates.title !== undefined) { sets.push('title = ?'); vals.push(updates.title); }
  if (updates.tag !== undefined) { sets.push('tag = ?'); vals.push(updates.tag); }
  if (updates.imageUrl !== undefined) { sets.push('image_url = ?'); vals.push(updates.imageUrl); }
  if (updates.likes !== undefined) { sets.push('likes = ?'); vals.push(updates.likes); }
  if (updates.handle !== undefined) { sets.push('handle = ?'); vals.push(updates.handle); }
  if (sets.length > 0) {
    sets.push('updated_at = NOW()');
    vals.push(id);
    await pool.query(`UPDATE gallery SET ${sets.join(', ')} WHERE id = ?;`, vals);
  }
  const [rows]: any = await pool.query('SELECT * FROM gallery WHERE id = ?;', [id]);
  if (!rows || rows.length === 0) return null;
  return {
    id: rows[0].id,
    title: rows[0].title,
    tag: rows[0].tag,
    imageUrl: rows[0].image_url,
    likes: Number(rows[0].likes || 0),
    handle: rows[0].handle || '@yashdeeppalace',
  };
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  const pool = getPool();
  await pool.query('DELETE FROM gallery WHERE id = ?;', [id]);
  return true;
}

// ==================== 11. REVIEWS ====================

export async function getReviews(): Promise<Review[]> {
  const pool = getPool();
  const [rows]: any = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC;');
  if (!rows || rows.length === 0) return [];
  return rows.map((r: any) => ({
    id: r.id,
    author: r.author,
    city: r.city,
    rating: Number(r.rating),
    stayType: r.stay_type,
    comment: r.comment,
    date: r.date,
    verified: Boolean(r.verified),
  }));
}

export async function addReview(review: Omit<Review, 'id'> & { id?: string }): Promise<Review> {
  const pool = getPool();
  const id = review.id || `rev-${Date.now()}`;
  await pool.query(
    'INSERT INTO reviews (id, author, city, rating, stay_type, comment, date, verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW());',
    [id, review.author, review.city, review.rating, review.stayType, review.comment, review.date, review.verified ? 1 : 0]
  );
  return {
    id,
    author: review.author,
    city: review.city,
    rating: review.rating,
    stayType: review.stayType,
    comment: review.comment,
    date: review.date,
    verified: review.verified,
  };
}

export async function updateReview(id: string, updates: Partial<Review>): Promise<Review | null> {
  const pool = getPool();
  const sets: string[] = [];
  const vals: any[] = [];
  if (updates.author !== undefined) { sets.push('author = ?'); vals.push(updates.author); }
  if (updates.city !== undefined) { sets.push('city = ?'); vals.push(updates.city); }
  if (updates.rating !== undefined) { sets.push('rating = ?'); vals.push(updates.rating); }
  if (updates.stayType !== undefined) { sets.push('stay_type = ?'); vals.push(updates.stayType); }
  if (updates.comment !== undefined) { sets.push('comment = ?'); vals.push(updates.comment); }
  if (updates.date !== undefined) { sets.push('date = ?'); vals.push(updates.date); }
  if (updates.verified !== undefined) { sets.push('verified = ?'); vals.push(updates.verified ? 1 : 0); }
  if (sets.length > 0) {
    vals.push(id);
    await pool.query(`UPDATE reviews SET ${sets.join(', ')} WHERE id = ?;`, vals);
  }
  const [rows]: any = await pool.query('SELECT * FROM reviews WHERE id = ?;', [id]);
  if (!rows || rows.length === 0) return null;
  return {
    id: rows[0].id,
    author: rows[0].author,
    city: rows[0].city,
    rating: Number(rows[0].rating),
    stayType: rows[0].stay_type,
    comment: rows[0].comment,
    date: rows[0].date,
    verified: Boolean(rows[0].verified),
  };
}

export async function deleteReview(id: string): Promise<boolean> {
  const pool = getPool();
  await pool.query('DELETE FROM reviews WHERE id = ?;', [id]);
  return true;
}

// ==================== 12. STAFF USERS ====================

export async function getStaffUsers(): Promise<StaffUser[]> {
  const pool = getPool();
  const [rows]: any = await pool.query('SELECT * FROM staff_users ORDER BY id ASC;');
  if (!rows || rows.length === 0) return [];
  return rows.map((r: any) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
  }));
}

export async function verifyStaffLogin(email: string): Promise<StaffUser | null> {
  const pool = getPool();
  const [rows]: any = await pool.query('SELECT * FROM staff_users WHERE LOWER(email) = LOWER(?);', [email.trim()]);
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
    isActive: Boolean(r.is_active ?? true),
  };
}

// ==================== 13. BATCH SYNC FLUSH ====================

/**
 * Replays a batch of queued offline operations directly in MySQL
 */
export async function executeBatchSync(actions: Array<{ actionType: string; payload: any }>): Promise<number> {
  let executedCount = 0;

  for (const action of actions) {
    const { actionType, payload } = action;
    try {
      switch (actionType) {
        case 'UPDATE_HOTEL_INFO':
          await updateHotelInfo(payload);
          break;
        case 'CREATE_ROOM':
        case 'UPDATE_ROOM_CATEGORY':
          await upsertRoom(payload);
          break;
        case 'DELETE_ROOM_CATEGORY':
          await deleteRoom(payload.id);
          break;
        case 'CREATE_PHYSICAL_ROOM':
        case 'UPDATE_PHYSICAL_ROOM':
          await upsertPhysicalRoom(payload);
          break;
        case 'DELETE_PHYSICAL_ROOM':
          await deletePhysicalRoom(payload.roomNumber);
          break;
        case 'CREATE_BOOKING':
          await createBooking(payload);
          break;
        case 'UPDATE_BOOKING_STATUS':
          await updateBookingStatus(payload.reference, payload.status);
          break;
        case 'UPDATE_ROOM':
          await updatePhysicalRoomStatus(payload.roomNumber, { housekeepingStatus: payload.housekeepingStatus });
          break;
        case 'CHECK_IN':
          await checkInGuest(payload);
          break;
        case 'CHECK_OUT':
          await checkOutGuest(payload);
          break;
        case 'CHANGE_ROOM':
        case 'ROOM_CHANGE':
          await changeGuestRoom(payload);
          break;
        case 'ADD_EXPENSE':
        case 'CREATE_EXPENSE':
          await createExpense(payload);
          break;
        case 'DELETE_EXPENSE':
          await deleteExpense(payload.id);
          break;
        case 'ADD_SERVICE_REQUEST':
        case 'CREATE_SERVICE_REQUEST':
          await createServiceRequest(payload);
          break;
        case 'UPDATE_SERVICE_REQUEST':
          await updateServiceRequestStatus(payload.id, payload.status, payload.notes);
          break;
        case 'DELETE_SERVICE_REQUEST':
          await deleteServiceRequest(payload.id);
          break;
        case 'UPDATE_DINING':
          await updateDining(payload);
          break;
        case 'ADD_DINING_SPECIAL':
          await addDiningSpecial(payload);
          break;
        case 'UPDATE_DINING_SPECIAL':
          await updateDiningSpecial(payload.id, payload);
          break;
        case 'DELETE_DINING_SPECIAL':
          await deleteDiningSpecial(payload.id);
          break;
        case 'ADD_GALLERY_ITEM':
          await addGalleryItem(payload);
          break;
        case 'UPDATE_GALLERY_ITEM':
          await updateGalleryItem(payload.id, payload);
          break;
        case 'DELETE_GALLERY_ITEM':
          await deleteGalleryItem(payload.id);
          break;
        case 'ADD_REVIEW':
          await addReview(payload);
          break;
        case 'UPDATE_REVIEW':
          await updateReview(payload.id, payload);
          break;
        case 'DELETE_REVIEW':
          await deleteReview(payload.id);
          break;
        case 'ADD_FOLIO':
          await addGuestFolioItem(payload);
          break;
        default:
          console.warn(`[BatchSync] Unknown action type: ${actionType}`);
      }
      executedCount++;
    } catch (err: any) {
      console.error(`[BatchSync] Failed to execute action ${actionType}:`, err.message);
    }
  }

  return executedCount;
}

export const dbAdapter = {
  initDb,
  getHotelInfo,
  updateHotelInfo,
  getRooms,
  upsertRoom,
  deleteRoom,
  getPhysicalRooms,
  upsertPhysicalRoom,
  deletePhysicalRoom,
  updatePhysicalRoomStatus,
  getBookings,
  createBooking,
  updateBookingStatus,
  checkInGuest,
  checkOutGuest,
  changeGuestRoom,
  getRoomChanges,
  getExpenses,
  createExpense,
  deleteExpense,
  getServiceRequests,
  createServiceRequest,
  updateServiceRequestStatus,
  deleteServiceRequest,
  getGuestFolios,
  addGuestFolioItem,
  getStaffUsers,
  verifyStaffLogin,
  getDining,
  updateDining,
  addDiningSpecial,
  updateDiningSpecial,
  deleteDiningSpecial,
  getRewardBenefits,
  upsertRewardBenefit,
  getGallery,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getReviews,
  addReview,
  updateReview,
  deleteReview,
  executeBatchSync,
};
