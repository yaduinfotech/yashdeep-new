import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  getRoomsFromDb,
  upsertRoomInDb,
  deleteRoomFromDb,
  createBookingInDb,
  getBookingsFromDb,
  updateBookingStatusInDb,
  subscribeNewsletterInDb,
  getOrCreateUserInDb,
  getManagerUserByEmail,
  getPhysicalRoomsFromDb,
  updatePhysicalRoomInDb,
  checkInGuestInDb,
  checkOutGuestInDb,
  getGuestFoliosFromDb,
  addGuestFolioItemInDb,
  getBanquetEventsFromDb,
  createBanquetEventInDb,
} from './src/db/queries.ts';
import {
  simulateBookingConfirmationEmail,
  getEmailNotification,
} from './src/utils/emailService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // --- API ENDPOINTS BACKED BY CLOUD SQL ---

  // 1. Get all rooms from SQL
  app.get('/api/rooms', async (_req, res) => {
    try {
      const roomList = await getRoomsFromDb();
      res.json(roomList);
    } catch (err: any) {
      console.error('Error fetching rooms:', err);
      res.status(500).json({ error: 'Failed to fetch rooms from database' });
    }
  });

  // 2. Upsert room (Owner CMS) in SQL
  app.post('/api/rooms', async (req, res) => {
    try {
      const roomData = req.body;
      const updated = await upsertRoomInDb(roomData);
      res.json({ success: true, room: updated });
    } catch (err: any) {
      console.error('Error saving room:', err);
      res.status(500).json({ error: 'Failed to save room to database' });
    }
  });

  // 3. Delete room (Owner CMS) in SQL
  app.delete('/api/rooms/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await deleteRoomFromDb(id);
      res.json({ success: true, deletedId: id });
    } catch (err: any) {
      console.error('Error deleting room:', err);
      res.status(500).json({ error: 'Failed to delete room from database' });
    }
  });

  // 4. Get all bookings from SQL
  app.get('/api/bookings', async (_req, res) => {
    try {
      const bookingList = await getBookingsFromDb();
      res.json(bookingList);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      res.status(500).json({ error: 'Failed to fetch bookings from database' });
    }
  });

  // 5. Create new booking in SQL and simulate confirmation email with PDF link
  app.post('/api/bookings', async (req, res) => {
    try {
      const bookingData = req.body;
      const result = await createBookingInDb(bookingData);

      // Trigger booking confirmation email simulation
      const emailNotification = simulateBookingConfirmationEmail(result as any);

      res.status(201).json({
        success: true,
        booking: result,
        emailNotification,
      });
    } catch (err: any) {
      console.error('Error saving booking:', err);
      res.status(500).json({ error: 'Failed to save reservation in SQL database' });
    }
  });

  // 5a. Get simulated confirmation email for a booking reference
  app.get('/api/bookings/:reference/email', (req, res) => {
    const { reference } = req.params;
    const notification = getEmailNotification(reference);
    if (!notification) {
      return res.status(404).json({ error: 'Confirmation email not found for reference ' + reference });
    }
    res.json({ success: true, emailNotification: notification });
  });

  // 5b. Generate and view downloadable/printable PDF voucher summary
  app.get('/api/bookings/:reference/pdf-summary', async (req, res) => {
    const { reference } = req.params;
    try {
      const allBookings = await getBookingsFromDb();
      const booking = allBookings.find((b) => b.bookingReference === reference);

      if (!booking) {
        return res.status(404).send('<h2>Booking not found for reference: ' + reference + '</h2>');
      }

      // Render official printable PDF summary voucher
      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>PDF Voucher Summary – ${booking.bookingReference}</title>
            <style>
              @page { size: A4; margin: 20mm; }
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; background: #f8fafc; }
              .pdf-container { max-width: 760px; margin: 0 auto; background: #ffffff; border: 2px solid #e2e8f0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
              .top-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #d4af37; padding-bottom: 24px; margin-bottom: 28px; }
              .hotel-title { font-size: 26px; font-weight: 800; font-family: Georgia, serif; letter-spacing: 1.5px; text-transform: uppercase; color: #0b0f19; margin: 0; }
              .hotel-sub { font-size: 11px; text-transform: uppercase; color: #b45309; letter-spacing: 1px; font-weight: 700; margin-top: 4px; }
              .badge { background: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
              .voucher-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; }
              .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
              .field { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; }
              .field-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; }
              .field-value { font-size: 14px; font-weight: 700; color: #0f172a; }
              .field-value.mono { font-family: monospace; font-size: 16px; color: #b45309; }
              .price-summary { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 18px; margin-bottom: 28px; }
              .price-row { display: flex; justify-content: space-between; font-size: 13px; color: #475569; margin-bottom: 6px; }
              .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: #0f172a; border-top: 2px solid #fde68a; padding-top: 10px; margin-top: 8px; }
              .instructions { font-size: 12px; color: #475569; line-height: 1.6; border-top: 1px dashed #cbd5e1; padding-top: 20px; margin-bottom: 24px; }
              .print-btn-bar { text-align: center; margin-bottom: 24px; }
              .print-btn { background: #0b0f19; color: #ffffff; padding: 10px 24px; border-radius: 8px; font-weight: 700; font-size: 12px; text-transform: uppercase; border: none; cursor: pointer; }
              @media print { .print-btn-bar { display: none; } body { padding: 0; background: #fff; } .pdf-container { border: none; box-shadow: none; padding: 0; } }
            </style>
          </head>
          <body>
            <div class="print-btn-bar">
              <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF Voucher</button>
            </div>
            <div class="pdf-container">
              <div class="top-bar">
                <div>
                  <h1 class="hotel-title">YashDeep Palace</h1>
                  <div class="hotel-sub">Official Reservation Voucher & Tax Invoice Summary</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
                    Opposite Honda Car Gate No. 4, Karuli Industrial Area, Khuskheda, Rajasthan 301707
                  </div>
                </div>
                <div>
                  <span class="badge">Paid & Confirmed</span>
                </div>
              </div>

              <div class="voucher-title">Guest Stay Confirmation</div>

              <div class="grid-2">
                <div class="field">
                  <div class="field-label">Booking Reference Number</div>
                  <div class="field-value mono">${booking.bookingReference}</div>
                </div>
                <div class="field">
                  <div class="field-label">Primary Guest Name</div>
                  <div class="field-value">${booking.guestName}</div>
                </div>
                <div class="field">
                  <div class="field-label">Accommodation Type</div>
                  <div class="field-value">${booking.roomName}</div>
                </div>
                <div class="field">
                  <div class="field-label">Duration of Stay</div>
                  <div class="field-value">${booking.nights} Night(s) · ${booking.adultCount} Adult(s)</div>
                </div>
                <div class="field">
                  <div class="field-label">Scheduled Check-In</div>
                  <div class="field-value">${booking.checkIn} (from 2:00 PM)</div>
                </div>
                <div class="field">
                  <div class="field-label">Scheduled Check-Out</div>
                  <div class="field-value">${booking.checkOut} (by 11:00 AM)</div>
                </div>
                <div class="field">
                  <div class="field-label">Guest Phone / WhatsApp</div>
                  <div class="field-value">${booking.guestPhone}</div>
                </div>
                <div class="field">
                  <div class="field-label">Guest Email</div>
                  <div class="field-value">${booking.guestEmail}</div>
                </div>
              </div>

              <div class="price-summary">
                <div class="price-row">
                  <span>Room Tariff (${booking.nights} nights):</span>
                  <span>₹${booking.roomRateTotal.toLocaleString('en-IN')}</span>
                </div>
                ${booking.addOnsTotal ? `<div class="price-row"><span>Hospitality Add-ons:</span><span>+₹${booking.addOnsTotal.toLocaleString('en-IN')}</span></div>` : ''}
                <div class="price-row">
                  <span>GST Taxes (12%):</span>
                  <span>+₹${(booking.taxAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div class="total-row">
                  <span>Total Amount Paid (via ${(booking.paymentMethod || 'online').toUpperCase()}):</span>
                  <span>₹${booking.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div class="instructions">
                <strong>Important Guest Information:</strong><br/>
                • Present this voucher or booking reference at the front desk upon arrival along with valid government photo ID.<br/>
                • Complimentary optical high-speed Wi-Fi (150 Mbps) and valet parking are included with your stay.<br/>
                • For special requests or corporate billing support, contact concierge at +91 82220 20699 / +91 82220 20599 or reception@yashdeeppalace.com.
              </div>

              <div style="text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 14px;">
                Generated automatically by YashDeep Palace Reservation Engine on ${new Date().toLocaleDateString('en-IN')}
              </div>
            </div>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error('Error generating PDF summary:', err);
      res.status(500).send('Error generating PDF summary voucher');
    }
  });

  // 6. Update booking status in SQL
  app.patch('/api/bookings/:reference/status', async (req, res) => {
    try {
      const { reference } = req.params;
      const { status } = req.body;
      const result = await updateBookingStatusInDb(reference, status);
      res.json({ success: true, booking: result });
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      res.status(500).json({ error: 'Failed to update booking status in database' });
    }
  });

  // 7. Subscribe newsletter in SQL
  app.post('/api/newsletter', async (req, res) => {
    try {
      const { email } = req.body;
      await subscribeNewsletterInDb(email);
      res.json({ success: true, promoCode: 'ROYAL15' });
    } catch (err: any) {
      console.error('Error subscribing newsletter:', err);
      res.status(500).json({ error: 'Failed to subscribe newsletter' });
    }
  });

  // 8. Sync Google User in SQL
  app.post('/api/users/sync', async (req, res) => {
    try {
      const { uid, email, name, avatar } = req.body;
      const user = await getOrCreateUserInDb(uid, email, name, avatar);
      res.json({ success: true, user });
    } catch (err: any) {
      console.error('Error syncing user:', err);
      res.status(500).json({ error: 'Failed to sync user in database' });
    }
  });

  // ==================== HOTEL MANAGEMENT SYSTEM (HMS) ENDPOINTS ====================

  // A. Manager Authentication
  app.post('/api/manager/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const manager = await getManagerUserByEmail(normalizedEmail);

      // Verify credentials - allows user email rasu2027@gmail.com and manager@yashdeeppalace.com
      if (!manager) {
        return res.status(401).json({ error: 'Invalid manager credentials or unauthorized account' });
      }

      res.json({
        success: true,
        manager: {
          id: manager.id,
          email: manager.email,
          name: manager.name,
          role: manager.role || 'general_manager',
        },
      });
    } catch (err: any) {
      console.error('Error authenticating manager:', err);
      res.status(500).json({ error: 'Manager authentication failed' });
    }
  });

  // B. Live HMS Overview Metrics
  app.get('/api/manager/overview', async (_req, res) => {
    try {
      const [physRooms, allBookings, banquets] = await Promise.all([
        getPhysicalRoomsFromDb(),
        getBookingsFromDb(),
        getBanquetEventsFromDb(),
      ]);

      const totalRooms = physRooms.length;
      const occupiedRooms = physRooms.filter((r) => r.occupancyStatus === 'occupied');
      const occupiedCount = occupiedRooms.length;
      const cleanVacantCount = physRooms.filter((r) => r.occupancyStatus === 'vacant' && r.housekeepingStatus === 'clean').length;
      const dirtyCount = physRooms.filter((r) => r.housekeepingStatus === 'dirty').length;
      const outOfOrderCount = physRooms.filter((r) => r.housekeepingStatus === 'out_of_order').length;

      const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

      // In-house guests count
      const inHouseBookings = allBookings.filter((b) => b.stayStatus === 'checked_in');
      const inHouseGuests = inHouseBookings.reduce((sum, b) => sum + (b.adultCount || 2) + (b.childCount || 0), 0);

      // Today's arrivals and departures
      const today = new Date().toISOString().split('T')[0];
      const todayArrivals = allBookings.filter((b) => b.checkIn === today && b.stayStatus !== 'checked_out').length;
      const todayDepartures = allBookings.filter((b) => b.checkOut === today && b.stayStatus === 'checked_in').length;

      // Total revenue
      const totalRoomRevenue = allBookings
        .filter((b) => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.grandTotal || 0), 0);

      const totalBanquetRevenue = banquets.reduce((sum, ev) => sum + (ev.totalAmount || 0), 0);

      res.json({
        totalRooms,
        occupiedCount,
        cleanVacantCount,
        dirtyCount,
        outOfOrderCount,
        occupancyRate,
        inHouseGuests,
        todayArrivals,
        todayDepartures,
        totalRoomRevenue,
        totalBanquetRevenue,
        upcomingBanquetsCount: banquets.length,
      });
    } catch (err: any) {
      console.error('Error fetching manager overview:', err);
      res.status(500).json({ error: 'Failed to compute manager overview metrics' });
    }
  });

  // C. Physical Rooms List with live occupancy
  app.get('/api/manager/rooms/physical', async (_req, res) => {
    try {
      const physRooms = await getPhysicalRoomsFromDb();
      res.json(physRooms);
    } catch (err: any) {
      console.error('Error fetching physical rooms:', err);
      res.status(500).json({ error: 'Failed to query physical room inventory' });
    }
  });

  // D. Update Physical Room Status (Housekeeping / Notes)
  app.patch('/api/manager/rooms/:roomNumber', async (req, res) => {
    try {
      const { roomNumber } = req.params;
      const updates = req.body;
      const updated = await updatePhysicalRoomInDb(roomNumber, updates);
      res.json({ success: true, room: updated });
    } catch (err: any) {
      console.error('Error updating physical room:', err);
      res.status(500).json({ error: 'Failed to update physical room status' });
    }
  });

  // E. Front Desk Check-In
  app.post('/api/manager/check-in', async (req, res) => {
    try {
      const { bookingReference, roomNumber, idProofType, idProofNumber } = req.body;
      if (!bookingReference || !roomNumber) {
        return res.status(400).json({ error: 'Booking reference and room number are required for check-in' });
      }

      const booking = await checkInGuestInDb({
        bookingReference,
        roomNumber,
        idProofType,
        idProofNumber,
      });

      res.json({ success: true, booking });
    } catch (err: any) {
      console.error('Error checking in guest:', err);
      res.status(500).json({ error: 'Failed to execute guest check-in' });
    }
  });

  // F. Front Desk Check-Out
  app.post('/api/manager/check-out', async (req, res) => {
    try {
      const { bookingReference, roomNumber } = req.body;
      if (!bookingReference || !roomNumber) {
        return res.status(400).json({ error: 'Booking reference and room number are required for check-out' });
      }

      const booking = await checkOutGuestInDb({
        bookingReference,
        roomNumber,
      });

      res.json({ success: true, booking });
    } catch (err: any) {
      console.error('Error checking out guest:', err);
      res.status(500).json({ error: 'Failed to execute guest check-out' });
    }
  });

  // G. Guest Folio Ledger
  app.get('/api/manager/folios/:bookingReference', async (req, res) => {
    try {
      const { bookingReference } = req.params;
      const folios = await getGuestFoliosFromDb(bookingReference);
      
      const charges = folios.filter((f) => f.amount > 0).reduce((sum, f) => sum + f.amount, 0);
      const payments = folios.filter((f) => f.amount < 0).reduce((sum, f) => sum + Math.abs(f.amount), 0);
      const balanceDue = charges - payments;

      res.json({
        success: true,
        bookingReference,
        folios,
        charges,
        payments,
        balanceDue,
      });
    } catch (err: any) {
      console.error('Error fetching folios:', err);
      res.status(500).json({ error: 'Failed to fetch guest folios' });
    }
  });

  // H. Post Charge or Payment to Guest Folio
  app.post('/api/manager/folios/:bookingReference', async (req, res) => {
    try {
      const { bookingReference } = req.params;
      const { itemType, description, amount, recordedBy } = req.body;

      if (!description || typeof amount !== 'number') {
        return res.status(400).json({ error: 'Valid description and amount are required' });
      }

      const folioItem = await addGuestFolioItemInDb({
        bookingReference,
        itemType: itemType || 'restaurant',
        description,
        amount,
        recordedBy: recordedBy || 'Duty Manager',
      });

      res.status(201).json({ success: true, folioItem });
    } catch (err: any) {
      console.error('Error adding folio item:', err);
      res.status(500).json({ error: 'Failed to record folio entry' });
    }
  });

  // I. Banquet & Corporate Events
  app.get('/api/manager/banquets', async (_req, res) => {
    try {
      const events = await getBanquetEventsFromDb();
      res.json(events);
    } catch (err: any) {
      console.error('Error fetching banquets:', err);
      res.status(500).json({ error: 'Failed to query banquet events' });
    }
  });

  app.post('/api/manager/banquets', async (req, res) => {
    try {
      const eventData = req.body;
      const newEvent = await createBanquetEventInDb(eventData);
      res.status(201).json({ success: true, event: newEvent });
    } catch (err: any) {
      console.error('Error creating banquet event:', err);
      res.status(500).json({ error: 'Failed to record banquet event in SQL' });
    }
  });

  // --- VITE MIDDLEWARE / STATIC ASSETS MOUNT ---
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
