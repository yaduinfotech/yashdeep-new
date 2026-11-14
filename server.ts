import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import * as dbAdapter from './src/db/dbAdapter.ts';
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

  // Initialize DB connection (MySQL if configured, otherwise persistent JSON)
  await dbAdapter.initDb();

  // ==================== REALTIME HOTEL DATA APIS ====================

  // 1. Hotel Info (GET & PUT)
  app.get('/api/hotel-info', async (_req, res) => {
    try {
      const info = await dbAdapter.getHotelInfo();
      res.json(info);
    } catch (err: any) {
      console.error('Error fetching hotel info:', err);
      res.status(500).json({ error: 'Failed to fetch hotel info' });
    }
  });

  app.put('/api/hotel-info', async (req, res) => {
    try {
      const updated = await dbAdapter.updateHotelInfo(req.body);
      res.json({ success: true, hotelInfo: updated });
    } catch (err: any) {
      console.error('Error updating hotel info:', err);
      res.status(500).json({ error: 'Failed to update hotel info' });
    }
  });

  // 2. Room Categories CRUD
  app.get('/api/rooms', async (_req, res) => {
    try {
      const storeRooms = await dbAdapter.getRooms();
      res.json(storeRooms);
    } catch (err: any) {
      console.error('Error fetching rooms:', err);
      res.status(500).json({ error: 'Failed to fetch rooms' });
    }
  });

  app.post('/api/rooms', async (req, res) => {
    try {
      const roomData = req.body;
      const updated = await dbAdapter.upsertRoom(roomData);
      res.json({ success: true, room: updated });
    } catch (err: any) {
      console.error('Error saving room:', err);
      res.status(500).json({ error: 'Failed to save room to database' });
    }
  });

  app.put('/api/rooms/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const roomData = { ...req.body, id };
      const updated = await dbAdapter.upsertRoom(roomData);
      res.json({ success: true, room: updated });
    } catch (err: any) {
      console.error('Error updating room:', err);
      res.status(500).json({ error: 'Failed to update room' });
    }
  });

  app.delete('/api/rooms/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await dbAdapter.deleteRoom(id);
      res.json({ success: true, deletedId: id });
    } catch (err: any) {
      console.error('Error deleting room:', err);
      res.status(500).json({ error: 'Failed to delete room from database' });
    }
  });

  // 3. Physical Rooms CRUD & Housekeeping
  app.get('/api/physical-rooms', async (_req, res) => {
    try {
      const physRooms = await dbAdapter.getPhysicalRooms();
      res.json(physRooms);
    } catch (err: any) {
      console.error('Error fetching physical rooms:', err);
      res.status(500).json({ error: 'Failed to fetch physical rooms' });
    }
  });

  app.get('/api/manager/rooms/physical', async (_req, res) => {
    try {
      const physRooms = await dbAdapter.getPhysicalRooms();
      res.json(physRooms);
    } catch (err: any) {
      console.error('Error fetching physical rooms:', err);
      res.status(500).json({ error: 'Failed to query physical room inventory' });
    }
  });

  app.post('/api/physical-rooms', async (req, res) => {
    try {
      const room = await dbAdapter.upsertPhysicalRoom(req.body);
      res.status(201).json({ success: true, room });
    } catch (err: any) {
      console.error('Error creating physical room:', err);
      res.status(500).json({ error: 'Failed to create physical room' });
    }
  });

  app.put('/api/physical-rooms/:roomNumber', async (req, res) => {
    try {
      const { roomNumber } = req.params;
      const room = await dbAdapter.upsertPhysicalRoom({ ...req.body, roomNumber });
      res.json({ success: true, room });
    } catch (err: any) {
      console.error('Error updating physical room:', err);
      res.status(500).json({ error: 'Failed to update physical room' });
    }
  });

  app.delete('/api/physical-rooms/:roomNumber', async (req, res) => {
    try {
      const { roomNumber } = req.params;
      const success = await dbAdapter.deletePhysicalRoom(roomNumber);
      res.json({ success, roomNumber });
    } catch (err: any) {
      console.error('Error deleting physical room:', err);
      res.status(500).json({ error: 'Failed to delete physical room' });
    }
  });

  app.patch(['/api/physical-rooms/:roomNumber/housekeeping', '/api/manager/rooms/:roomNumber'], async (req, res) => {
    try {
      const { roomNumber } = req.params;
      const updates = req.body;
      const updated = await dbAdapter.updatePhysicalRoomStatus(roomNumber, updates);
      res.json({ success: true, room: updated });
    } catch (err: any) {
      console.error('Error updating physical room housekeeping:', err);
      res.status(500).json({ error: 'Failed to update physical room' });
    }
  });

  // 4. Dining & Menu Specials CRUD
  app.get('/api/dining', async (_req, res) => {
    try {
      const dining = await dbAdapter.getDining();
      res.json(dining);
    } catch (err: any) {
      console.error('Error fetching dining info:', err);
      res.status(500).json({ error: 'Failed to fetch dining details' });
    }
  });

  app.put('/api/dining', async (req, res) => {
    try {
      const updated = await dbAdapter.updateDining(req.body);
      res.json({ success: true, dining: updated });
    } catch (err: any) {
      console.error('Error updating dining info:', err);
      res.status(500).json({ error: 'Failed to update dining info' });
    }
  });

  app.post('/api/dining/specials', async (req, res) => {
    try {
      const newSpecial = await dbAdapter.addDiningSpecial(req.body);
      res.status(201).json({ success: true, special: newSpecial });
    } catch (err: any) {
      console.error('Error adding dining special:', err);
      res.status(500).json({ error: 'Failed to add dining special' });
    }
  });

  app.put('/api/dining/specials/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await dbAdapter.updateDiningSpecial(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Special dish not found' });
      }
      res.json({ success: true, special: updated });
    } catch (err: any) {
      console.error('Error updating dining special:', err);
      res.status(500).json({ error: 'Failed to update dining special' });
    }
  });

  app.delete('/api/dining/specials/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await dbAdapter.deleteDiningSpecial(id);
      res.json({ success, deletedId: id });
    } catch (err: any) {
      console.error('Error deleting dining special:', err);
      res.status(500).json({ error: 'Failed to delete dining special' });
    }
  });
  // 6. Media Gallery CRUD
  app.get('/api/gallery', async (_req, res) => {
    try {
      const gallery = await dbAdapter.getGallery();
      res.json(gallery);
    } catch (err: any) {
      console.error('Error fetching gallery:', err);
      res.status(500).json({ error: 'Failed to fetch gallery' });
    }
  });

  app.post('/api/gallery', async (req, res) => {
    try {
      const newItem = await dbAdapter.addGalleryItem(req.body);
      res.status(201).json({ success: true, item: newItem });
    } catch (err: any) {
      console.error('Error adding gallery photo:', err);
      res.status(500).json({ error: 'Failed to add gallery photo' });
    }
  });

  app.put('/api/gallery/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await dbAdapter.updateGalleryItem(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Gallery item not found' });
      }
      res.json({ success: true, item: updated });
    } catch (err: any) {
      console.error('Error updating gallery photo:', err);
      res.status(500).json({ error: 'Failed to update gallery photo' });
    }
  });

  app.delete('/api/gallery/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await dbAdapter.deleteGalleryItem(id);
      res.json({ success, deletedId: id });
    } catch (err: any) {
      console.error('Error deleting gallery photo:', err);
      res.status(500).json({ error: 'Failed to delete gallery photo' });
    }
  });

  // 7. Guest Reviews CRUD
  app.get('/api/reviews', async (_req, res) => {
    try {
      const reviews = await dbAdapter.getReviews();
      res.json(reviews);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  app.post('/api/reviews', async (req, res) => {
    try {
      const newReview = await dbAdapter.addReview(req.body);
      res.status(201).json({ success: true, review: newReview });
    } catch (err: any) {
      console.error('Error adding review:', err);
      res.status(500).json({ error: 'Failed to add review' });
    }
  });

  app.put('/api/reviews/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await dbAdapter.updateReview(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Review not found' });
      }
      res.json({ success: true, review: updated });
    } catch (err: any) {
      console.error('Error updating review:', err);
      res.status(500).json({ error: 'Failed to update review' });
    }
  });

  app.delete('/api/reviews/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await dbAdapter.deleteReview(id);
      res.json({ success, deletedId: id });
    } catch (err: any) {
      console.error('Error deleting review:', err);
      res.status(500).json({ error: 'Failed to delete review' });
    }
  });

  // ==================== BOOKINGS & ADVANCE RESERVATION ENGINE ====================

  // Get all bookings
  app.get('/api/bookings', async (_req, res) => {
    try {
      const bookingList = await dbAdapter.getBookings();
      res.json(bookingList);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  // Create new advance booking
  app.post('/api/bookings', async (req, res) => {
    try {
      const bookingData = req.body;
      const result = await dbAdapter.createBooking(bookingData);

      // Trigger booking confirmation email & printable summary voucher
      const emailNotification = simulateBookingConfirmationEmail(result as any);

      res.status(201).json({
        success: true,
        booking: result,
        emailNotification,
      });
    } catch (err: any) {
      console.error('Error saving booking:', err);
      res.status(500).json({ error: 'Failed to save reservation' });
    }
  });

  // Get confirmation email for a booking reference
  app.get('/api/bookings/:reference/email', (req, res) => {
    const { reference } = req.params;
    const notification = getEmailNotification(reference);
    if (!notification) {
      return res.status(404).json({ error: 'Confirmation email not found for reference ' + reference });
    }
    res.json({ success: true, emailNotification: notification });
  });

  // Generate and view downloadable/printable PDF voucher summary
  app.get('/api/bookings/:reference/pdf-summary', async (req, res) => {
    const { reference } = req.params;
    try {
      const allBookings = await dbAdapter.getBookings();
      const booking = allBookings.find((b) => b.bookingReference === reference);

      if (!booking) {
        return res.status(404).send('<h2>Booking not found for reference: ' + reference + '</h2>');
      }

      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Reservation Voucher & Tax Invoice – ${booking.bookingReference}</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; background: #f8fafc; }
              .pdf-container { max-width: 780px; margin: 0 auto; background: #ffffff; border: 2px solid #e2e8f0; border-radius: 16px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
              .top-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 24px; }
              .hotel-title { font-size: 24px; font-weight: 800; font-family: Georgia, serif; letter-spacing: 1px; text-transform: uppercase; color: #0b0f19; margin: 0; }
              .hotel-sub { font-size: 11px; text-transform: uppercase; color: #b45309; letter-spacing: 1px; font-weight: 700; margin-top: 4px; }
              .badge { background: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
              .voucher-title { font-size: 16px; font-weight: 700; margin-bottom: 20px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; }
              .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
              .field { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; }
              .field-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; }
              .field-value { font-size: 14px; font-weight: 700; color: #0f172a; }
              .field-value.mono { font-family: monospace; font-size: 16px; color: #b45309; }
              .price-summary { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
              .price-row { display: flex; justify-content: space-between; font-size: 13px; color: #475569; margin-bottom: 6px; }
              .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: #0f172a; border-top: 2px solid #fde68a; padding-top: 10px; margin-top: 8px; }
              .instructions { font-size: 12px; color: #475569; line-height: 1.6; border-top: 1px dashed #cbd5e1; padding-top: 18px; margin-bottom: 20px; }
              .print-btn-bar { text-align: center; margin-bottom: 20px; }
              .print-btn { background: #0b0f19; color: #ffffff; padding: 10px 24px; border-radius: 8px; font-weight: 700; font-size: 12px; text-transform: uppercase; border: none; cursor: pointer; }
              @media print { .print-btn-bar { display: none; } body { padding: 0; background: #fff; } .pdf-container { border: none; box-shadow: none; padding: 0; } }
            </style>
          </head>
          <body>
            <div class="print-btn-bar">
              <button class="print-btn" onclick="window.print()">🖨️ Print / Download PDF Voucher</button>
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
                  <span class="badge">Advance Confirmed</span>
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
                  <div class="field-label">Assigned Room</div>
                  <div class="field-value">${booking.assignedRoomNumber ? `Room ${booking.assignedRoomNumber}` : 'Allocated upon Front Desk arrival'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Stay Duration</div>
                  <div class="field-value">${booking.nights} Night(s) · ${booking.adultCount} Adult(s) ${booking.childCount ? `· ${booking.childCount} Child` : ''}</div>
                </div>
                <div class="field">
                  <div class="field-label">Scheduled Check-In</div>
                  <div class="field-value">${booking.checkIn} (from 12:00 PM)</div>
                </div>
                <div class="field">
                  <div class="field-label">Scheduled Check-Out</div>
                  <div class="field-value">${booking.checkOut} (by 11:00 AM)</div>
                </div>
                <div class="field">
                  <div class="field-label">Contact Details</div>
                  <div class="field-value">${booking.guestPhone} | ${booking.guestEmail}</div>
                </div>
              </div>

              <div class="price-summary">
                <div class="price-row">
                  <span>Room Tariff (${booking.nights} night/s):</span>
                  <span>₹${booking.roomRateTotal.toLocaleString('en-IN')}</span>
                </div>
                ${booking.addOnsTotal ? `<div class="price-row"><span>Hospitality Add-ons:</span><span>+₹${booking.addOnsTotal.toLocaleString('en-IN')}</span></div>` : ''}
                <div class="price-row">
                  <span>GST Taxes (5%):</span>
                  <span>+₹${(booking.taxAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div class="total-row">
                  <span>Total Amount Payable (Payment Mode: ${(booking.paymentMethod || 'Pay at Hotel').toUpperCase()}):</span>
                  <span>₹${booking.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div class="instructions">
                <strong>Important Guest Information:</strong><br/>
                • Present this voucher and valid government photo ID (Aadhaar / Passport / Driving License) upon check-in.<br/>
                • Corporate travelers may furnish company GSTIN details at front desk for tax credit invoicing.<br/>
                • Complimentary high-speed Wi-Fi, secure parking, and 24/7 in-room dining assistance are included.<br/>
                • Concierge desk: +91 82220 20699 / +91 82220 20599 | reception@yashdeeppalace.com
              </div>

              <div style="text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                Generated by YashDeep Palace Realtime Reservation Engine · Khuskheda, Bhiwadi
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

  // Update booking status
  app.patch('/api/bookings/:reference/status', async (req, res) => {
    try {
      const { reference } = req.params;
      const { status } = req.body;
      const result = await dbAdapter.updateBookingStatus(reference, status);
      res.json({ success: true, booking: result });
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      res.status(500).json({ error: 'Failed to update booking status' });
    }
  });

  // Room Change / Transfer API
  app.post('/api/bookings/:reference/room-change', async (req, res) => {
    try {
      const { reference } = req.params;
      const { fromRoomNumber, toRoomNumber, reason, changedBy } = req.body;

      if (!toRoomNumber || !reason) {
        return res.status(400).json({ error: 'Target room number and change reason are required' });
      }

      const result = await dbAdapter.changeGuestRoom({
        bookingReference: reference,
        fromRoomNumber,
        toRoomNumber,
        reason,
        changedBy: changedBy || 'Front Desk Duty Manager',
      });

      res.json({ success: true, ...result });
    } catch (err: any) {
      console.error('Error executing room change:', err);
      res.status(500).json({ error: err.message || 'Failed to execute room change' });
    }
  });

  app.get('/api/room-changes', async (req, res) => {
    try {
      const { reference } = req.query;
      const changes = await dbAdapter.getRoomChanges(reference as string | undefined);
      res.json(changes);
    } catch (err: any) {
      console.error('Error fetching room changes:', err);
      res.status(500).json({ error: 'Failed to fetch room changes' });
    }
  });

  // Front Desk Check-In
  app.post('/api/manager/check-in', async (req, res) => {
    try {
      const { bookingReference, roomNumber, idProofType, idProofNumber } = req.body;
      if (!bookingReference || !roomNumber) {
        return res.status(400).json({ error: 'Booking reference and room number are required for check-in' });
      }

      const booking = await dbAdapter.checkInGuest({
        bookingReference,
        roomNumber,
        idProofType,
        idProofNumber,
      });

      res.json({ success: true, booking });
    } catch (err: any) {
      console.error('Error checking in guest:', err);
      res.status(500).json({ error: err.message || 'Failed to execute guest check-in' });
    }
  });

  // Front Desk Check-Out
  app.post('/api/manager/check-out', async (req, res) => {
    try {
      const { bookingReference, roomNumber } = req.body;
      if (!bookingReference || !roomNumber) {
        return res.status(400).json({ error: 'Booking reference and room number are required for check-out' });
      }

      const booking = await dbAdapter.checkOutGuest({
        bookingReference,
        roomNumber,
      });

      res.json({ success: true, booking });
    } catch (err: any) {
      console.error('Error checking out guest:', err);
      res.status(500).json({ error: err.message || 'Failed to execute guest check-out' });
    }
  });

  // Guest Folio Ledger
  app.get('/api/manager/folios/:bookingReference', async (req, res) => {
    try {
      const { bookingReference } = req.params;
      const folios = await dbAdapter.getGuestFolios(bookingReference);

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

  app.post('/api/manager/folios/:bookingReference', async (req, res) => {
    try {
      const { bookingReference } = req.params;
      const { itemType, description, amount, recordedBy } = req.body;

      if (!description || typeof amount !== 'number') {
        return res.status(400).json({ error: 'Valid description and amount are required' });
      }

      const folioItem = await dbAdapter.addGuestFolioItem({
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

  // ==================== OPERATIONAL EXPENSES ====================
  app.get('/api/expenses', async (_req, res) => {
    try {
      const expenses = await dbAdapter.getExpenses();
      res.json(expenses);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  });

  app.post('/api/expenses', async (req, res) => {
    try {
      const expense = await dbAdapter.createExpense(req.body);
      res.status(201).json({ success: true, expense });
    } catch (err: any) {
      console.error('Error creating expense:', err);
      res.status(500).json({ error: 'Failed to record expense' });
    }
  });

  app.delete('/api/expenses/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await dbAdapter.deleteExpense(id);
      res.json({ success, id });
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  });

  // ==================== SERVICE REQUESTS ====================
  app.get('/api/service-requests', async (_req, res) => {
    try {
      const requests = await dbAdapter.getServiceRequests();
      res.json(requests);
    } catch (err: any) {
      console.error('Error fetching service requests:', err);
      res.status(500).json({ error: 'Failed to fetch service requests' });
    }
  });

  app.post('/api/service-requests', async (req, res) => {
    try {
      const request = await dbAdapter.createServiceRequest(req.body);
      res.status(201).json({ success: true, request });
    } catch (err: any) {
      console.error('Error creating service request:', err);
      res.status(500).json({ error: 'Failed to create service request' });
    }
  });

  app.patch('/api/service-requests/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const updated = await dbAdapter.updateServiceRequestStatus(id, status, notes);
      res.json({ success: true, request: updated });
    } catch (err: any) {
      console.error('Error updating service request status:', err);
      res.status(500).json({ error: 'Failed to update service request' });
    }
  });

  app.delete('/api/service-requests/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await dbAdapter.deleteServiceRequest(id);
      res.json({ success, id });
    } catch (err: any) {
      console.error('Error deleting service request:', err);
      res.status(500).json({ error: 'Failed to delete service request' });
    }
  });
  // ==================== STAFF AUTHENTICATION & MULTI-ROLE ====================
  app.get('/api/staff-users', async (_req, res) => {
    try {
      const staff = await dbAdapter.getStaffUsers();
      res.json(staff);
    } catch (err: any) {
      console.error('Error fetching staff users:', err);
      res.status(500).json({ error: 'Failed to fetch staff accounts' });
    }
  });

  app.post('/api/manager/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const staff = await dbAdapter.verifyStaffLogin(email);
      if (!staff) {
        return res.status(401).json({ error: 'Invalid staff credentials or unauthorized account' });
      }

      res.json({
        success: true,
        manager: {
          id: staff.id,
          email: staff.email,
          name: staff.name,
          role: staff.role,
        },
      });
    } catch (err: any) {
      console.error('Error authenticating staff:', err);
      res.status(500).json({ error: 'Staff authentication failed' });
    }
  });

  // Reward Benefits
  app.get('/api/rewards/benefits', async (_req, res) => {
    try {
      const benefits = await dbAdapter.getRewardBenefits();
      res.json(benefits);
    } catch (err: any) {
      console.error('Error fetching reward benefits:', err);
      res.status(500).json({ error: 'Failed to fetch reward benefits' });
    }
  });

  // 13. Health Check & Sync Batch Flush
  app.get('/api/health', async (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.post('/api/sync/batch-flush', async (req, res) => {
    try {
      const { actions } = req.body;
      if (!Array.isArray(actions) || actions.length === 0) {
        return res.json({ success: true, processed: 0 });
      }
      const result = await dbAdapter.executeBatchSync(actions);
      res.json(result);
    } catch (err: any) {
      console.error('Error during batch-flush sync:', err);
      res.status(500).json({ error: 'Failed to process sync batch', details: err?.message || String(err) });
    }
  });

  // Live HMS Overview Metrics
  app.get('/api/manager/overview', async (_req, res) => {
    try {
      const [physRooms, allBookings, expenses, serviceRequests] = await Promise.all([
        dbAdapter.getPhysicalRooms(),
        dbAdapter.getBookings(),
        dbAdapter.getExpenses(),
        dbAdapter.getServiceRequests(),
      ]);

      const totalRooms = physRooms.length;
      const occupiedRooms = physRooms.filter((r) => r.occupancyStatus === 'occupied');
      const occupiedCount = occupiedRooms.length;
      const cleanVacantCount = physRooms.filter((r) => r.occupancyStatus === 'vacant' && r.housekeepingStatus === 'clean').length;
      const dirtyCount = physRooms.filter((r) => r.housekeepingStatus === 'dirty').length;
      const outOfOrderCount = physRooms.filter((r) => r.housekeepingStatus === 'out_of_order').length;

      const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

      const inHouseBookings = allBookings.filter((b) => b.stayStatus === 'checked_in');
      const inHouseGuests = inHouseBookings.reduce((sum, b) => sum + (b.adultCount || 2) + (b.childCount || 0), 0);

      const today = new Date().toISOString().split('T')[0];
      const todayArrivals = allBookings.filter((b) => b.checkIn === today && b.stayStatus !== 'checked_out').length;
      const todayDepartures = allBookings.filter((b) => b.checkOut === today && b.stayStatus === 'checked_in').length;

      const totalRoomRevenue = allBookings
        .filter((b) => b.paymentStatus === 'paid' || b.stayStatus === 'checked_in' || b.stayStatus === 'checked_out')
        .reduce((sum, b) => sum + (b.grandTotal || 0), 0);

      const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const pendingServiceRequests = serviceRequests.filter((sr) => sr.status === 'pending').length;

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
        totalExpenses,
        pendingServiceRequests,

      });
    } catch (err: any) {
      console.error('Error fetching manager overview:', err);
      res.status(500).json({ error: 'Failed to compute manager overview metrics' });
    }
  });

  // Newsletter
  app.post('/api/newsletter', async (_req, res) => {
    res.json({ success: true, promoCode: 'ROYAL15' });
  });

  // Sync Google User
  app.post('/api/users/sync', async (req, res) => {
    const { uid, email, name, avatar } = req.body;
    res.json({ success: true, user: { uid, email, name, avatar } });
  });

  // Explicitly serve static public assets (WASM binaries, robots, sitemap) with correct MIME types
  app.use(
    express.static(path.resolve(__dirname, 'public'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.wasm')) {
          res.setHeader('Content-Type', 'application/wasm');
        }
      },
    })
  );

  // --- VITE MIDDLEWARE / STATIC ASSETS MOUNT ---
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(
      express.static(path.resolve(__dirname, 'dist'), {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.wasm')) {
            res.setHeader('Content-Type', 'application/wasm');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
