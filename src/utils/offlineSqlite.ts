import initSqlJs, { Database } from 'sql.js';
import { PhysicalRoom, BookingData, GuestFolioItem, BanquetEvent } from '../types/hotel';

// Singleton in-memory SQLite database instance
let sqliteDb: Database | null = null;
const SQLITE_STORAGE_KEY = 'ydp_sqlite_hms_binary';

/**
 * Initializes the client-side SQLite database using WebAssembly
 * Loads previous state from persistent local storage if present.
 */
export async function getSqliteDb(): Promise<Database> {
  if (sqliteDb) return sqliteDb;

  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  const savedData = localStorage.getItem(SQLITE_STORAGE_KEY);
  if (savedData) {
    try {
      const binaryString = atob(savedData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      sqliteDb = new SQL.Database(bytes);
      console.log('[SQLite] Restored existing offline SQLite database from storage.');
    } catch (e) {
      console.warn('[SQLite] Failed to restore database from storage, creating fresh instance:', e);
      sqliteDb = new SQL.Database();
    }
  } else {
    sqliteDb = new SQL.Database();
    console.log('[SQLite] Initialized new offline SQLite database.');
  }

  // Create SQLite Tables
  createSqliteTables(sqliteDb);
  return sqliteDb;
}

/**
 * Persists SQLite binary data to browser localStorage
 */
export function persistSqliteDb(db: Database) {
  try {
    const data = db.export();
    let binary = '';
    const bytes = new Uint8Array(data);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    localStorage.setItem(SQLITE_STORAGE_KEY, base64);
  } catch (err) {
    console.warn('[SQLite] Could not persist to localStorage:', err);
  }
}

/**
 * Creates schema tables in SQLite
 */
function createSqliteTables(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS sqlite_physical_rooms (
      room_number TEXT PRIMARY KEY,
      room_type_id TEXT NOT NULL,
      floor INTEGER NOT NULL,
      housekeeping_status TEXT DEFAULT 'clean',
      occupancy_status TEXT DEFAULT 'vacant',
      current_booking_reference TEXT,
      notes TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sqlite_bookings (
      booking_reference TEXT PRIMARY KEY,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT NOT NULL,
      room_name TEXT NOT NULL,
      assigned_room_number TEXT,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      nights INTEGER NOT NULL,
      adult_count INTEGER NOT NULL,
      grand_total INTEGER NOT NULL,
      payment_status TEXT DEFAULT 'paid',
      stay_status TEXT DEFAULT 'confirmed'
    );

    CREATE TABLE IF NOT EXISTS sqlite_guest_folios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_reference TEXT NOT NULL,
      item_type TEXT NOT NULL,
      description TEXT NOT NULL,
      amount INTEGER NOT NULL,
      recorded_by TEXT DEFAULT 'Front Desk',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sqlite_banquet_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT NOT NULL,
      client_name TEXT NOT NULL,
      company_name TEXT,
      phone TEXT NOT NULL,
      hall_name TEXT NOT NULL,
      event_date TEXT NOT NULL,
      guest_count INTEGER NOT NULL,
      total_amount INTEGER NOT NULL,
      advance_paid INTEGER DEFAULT 0,
      status TEXT DEFAULT 'confirmed'
    );

    CREATE TABLE IF NOT EXISTS sqlite_pending_sync (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

/**
 * Synchronizes online data from Cloud SQL into local SQLite
 */
export async function syncCloudSqlToSqlite(
  rooms: PhysicalRoom[],
  bookings: BookingData[],
  banquets: BanquetEvent[]
) {
  const db = await getSqliteDb();

  // Populate or refresh physical rooms
  for (const r of rooms) {
    db.run(
      `INSERT OR REPLACE INTO sqlite_physical_rooms 
       (room_number, room_type_id, floor, housekeeping_status, occupancy_status, current_booking_reference, notes, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        r.roomNumber,
        r.roomTypeId,
        r.floor,
        r.housekeepingStatus,
        r.occupancyStatus,
        r.currentBookingReference || null,
        r.notes || null,
        r.updatedAt || new Date().toISOString(),
      ]
    );
  }

  // Populate bookings
  for (const b of bookings) {
    db.run(
      `INSERT OR REPLACE INTO sqlite_bookings
       (booking_reference, guest_name, guest_email, guest_phone, room_name, assigned_room_number, check_in, check_out, nights, adult_count, grand_total, payment_status, stay_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        b.bookingReference,
        b.guestName,
        b.guestEmail,
        b.guestPhone,
        b.roomName,
        b.assignedRoomNumber || null,
        b.checkIn,
        b.checkOut,
        b.nights,
        b.adultCount,
        b.grandTotal,
        b.paymentStatus,
        b.stayStatus || 'confirmed',
      ]
    );
  }

  // Populate banquets
  for (const ev of banquets) {
    db.run(
      `INSERT OR REPLACE INTO sqlite_banquet_events
       (id, event_name, client_name, company_name, phone, hall_name, event_date, guest_count, total_amount, advance_paid, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        ev.id,
        ev.eventName,
        ev.clientName,
        ev.companyName || null,
        ev.phone,
        ev.hallName,
        ev.eventDate,
        ev.guestCount,
        ev.totalAmount,
        ev.advancePaid,
        ev.status,
      ]
    );
  }

  persistSqliteDb(db);
  console.log('[SQLite] Cloud SQL inventory synced into local SQLite WebAssembly database.');
}

/**
 * Reads physical rooms from SQLite
 */
export async function getOfflinePhysicalRooms(): Promise<PhysicalRoom[]> {
  const db = await getSqliteDb();
  const res = db.exec('SELECT * FROM sqlite_physical_rooms ORDER BY floor, room_number;');
  if (!res || res.length === 0) return [];

  const columns = res[0].columns;
  return res[0].values.map((row) => {
    const item: any = {};
    columns.forEach((col, idx) => {
      // Convert snake_case to camelCase
      if (col === 'room_number') item.roomNumber = row[idx];
      else if (col === 'room_type_id') item.roomTypeId = row[idx];
      else if (col === 'housekeeping_status') item.housekeepingStatus = row[idx];
      else if (col === 'occupancy_status') item.occupancyStatus = row[idx];
      else if (col === 'current_booking_reference') item.currentBookingReference = row[idx];
      else if (col === 'updated_at') item.updatedAt = row[idx];
      else item[col] = row[idx];
    });
    return item as PhysicalRoom;
  });
}

/**
 * Updates room housekeeping status in SQLite while offline
 */
export async function updateOfflineHousekeeping(roomNumber: string, status: string) {
  const db = await getSqliteDb();
  db.run(
    'UPDATE sqlite_physical_rooms SET housekeeping_status = ?, updated_at = datetime("now") WHERE room_number = ?;',
    [status, roomNumber]
  );
  // Queue sync for when connection resumes
  db.run(
    'INSERT INTO sqlite_pending_sync (action_type, payload) VALUES (?, ?);',
    ['UPDATE_ROOM', JSON.stringify({ roomNumber, housekeepingStatus: status })]
  );
  persistSqliteDb(db);
}

/**
 * Executes offline check-in in SQLite
 */
export async function checkInOfflineGuest(params: {
  bookingReference: string;
  roomNumber: string;
  idProofType: string;
  idProofNumber: string;
}) {
  const db = await getSqliteDb();
  db.run(
    `UPDATE sqlite_bookings 
     SET assigned_room_number = ?, stay_status = 'checked_in' 
     WHERE booking_reference = ?;`,
    [params.roomNumber, params.bookingReference]
  );

  db.run(
    `UPDATE sqlite_physical_rooms 
     SET occupancy_status = 'occupied', current_booking_reference = ?, updated_at = datetime('now') 
     WHERE room_number = ?;`,
    [params.bookingReference, params.roomNumber]
  );

  // Queue sync
  db.run(
    'INSERT INTO sqlite_pending_sync (action_type, payload) VALUES (?, ?);',
    ['CHECK_IN', JSON.stringify(params)]
  );

  persistSqliteDb(db);
}

/**
 * Reads offline guest folios from SQLite
 */
export async function getOfflineGuestFolios(bookingReference: string): Promise<GuestFolioItem[]> {
  const db = await getSqliteDb();
  const res = db.exec(
    `SELECT * FROM sqlite_guest_folios WHERE booking_reference = '${bookingReference.replace(/'/g, "''")}' ORDER BY created_at;`
  );
  if (!res || res.length === 0) return [];

  const columns = res[0].columns;
  return res[0].values.map((row) => {
    const item: any = {};
    columns.forEach((col, idx) => {
      if (col === 'booking_reference') item.bookingReference = row[idx];
      else if (col === 'item_type') item.itemType = row[idx];
      else if (col === 'recorded_by') item.recordedBy = row[idx];
      else if (col === 'created_at') item.createdAt = row[idx];
      else item[col] = row[idx];
    });
    return item as GuestFolioItem;
  });
}

/**
 * Adds an offline folio item in SQLite
 */
export async function addOfflineFolioItem(data: {
  bookingReference: string;
  itemType: string;
  description: string;
  amount: number;
  recordedBy?: string;
}) {
  const db = await getSqliteDb();
  db.run(
    `INSERT INTO sqlite_guest_folios (booking_reference, item_type, description, amount, recorded_by, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'));`,
    [
      data.bookingReference,
      data.itemType,
      data.description,
      data.amount,
      data.recordedBy || 'Offline Duty Manager',
    ]
  );

  // Queue sync
  db.run(
    'INSERT INTO sqlite_pending_sync (action_type, payload) VALUES (?, ?);',
    ['ADD_FOLIO', JSON.stringify(data)]
  );

  persistSqliteDb(db);
}

/**
 * Gets count of pending offline changes awaiting sync to Cloud SQL
 */
export async function getPendingSyncCount(): Promise<number> {
  const db = await getSqliteDb();
  const res = db.exec('SELECT COUNT(*) as count FROM sqlite_pending_sync;');
  if (!res || res.length === 0) return 0;
  return Number(res[0].values[0][0]) || 0;
}

/**
 * Flushes pending changes to Cloud SQL when reconnected
 */
export async function flushPendingSyncToCloud(): Promise<number> {
  const db = await getSqliteDb();
  const res = db.exec('SELECT id, action_type, payload FROM sqlite_pending_sync ORDER BY id ASC;');
  if (!res || res.length === 0) return 0;

  let synced = 0;
  for (const row of res[0].values) {
    const id = row[0];
    const actionType = row[1];
    const payload = JSON.parse(row[2] as string);

    try {
      if (actionType === 'UPDATE_ROOM') {
        await fetch(`/api/manager/rooms/${payload.roomNumber}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ housekeepingStatus: payload.housekeepingStatus }),
        });
      } else if (actionType === 'CHECK_IN') {
        await fetch('/api/manager/check-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else if (actionType === 'ADD_FOLIO') {
        await fetch(`/api/manager/folios/${payload.bookingReference}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      // Remove synced item
      db.run('DELETE FROM sqlite_pending_sync WHERE id = ?;', [id]);
      synced++;
    } catch (err) {
      console.warn(`[SQLite Sync] Failed to sync pending item ${id}:`, err);
      break; // Stop and retry later if network still fails
    }
  }

  persistSqliteDb(db);
  return synced;
}
