import { BookingData, EmailNotification } from '../types/hotel';

// In-memory cache for generated confirmation emails
const emailStore = new Map<string, EmailNotification>();

/**
 * Simulates sending a booking confirmation email with a PDF summary link
 * once a successful payment/booking event occurs in the SQL database.
 */
export function simulateBookingConfirmationEmail(booking: BookingData): EmailNotification {
  const sentDate = new Date();
  const formattedDate = sentDate.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });

  const pdfSummaryUrl = `/api/bookings/${booking.bookingReference}/pdf-summary`;
  const messageId = `smtp_msg_${booking.bookingReference.toLowerCase()}_${Date.now()}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Reservation Confirmed – YashDeep Palace</title>
        <style>
          body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; }
          .header { background: #0b0f19; padding: 32px 24px; text-align: center; border-bottom: 3px solid #d4af37; }
          .logo { font-size: 24px; font-weight: 800; letter-spacing: 2px; color: #ffffff; font-family: Georgia, serif; text-transform: uppercase; margin: 0; }
          .sublogo { font-size: 11px; color: #d4af37; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 6px; font-weight: 600; }
          .content { padding: 32px 24px; }
          .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
          .intro { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
          .voucher-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
          .ref-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 12px; margin-bottom: 12px; }
          .ref-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
          .ref-value { font-size: 16px; font-family: monospace; font-weight: 800; color: #b45309; }
          .badge-paid { background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
          .grid-item { margin-bottom: 8px; }
          .item-label { color: #64748b; font-size: 11px; margin-bottom: 2px; }
          .item-value { font-weight: 700; color: #1e293b; }
          .total-box { margin-top: 16px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: baseline; }
          .total-price { font-size: 20px; font-weight: 800; color: #0f172a; font-family: monospace; }
          .cta-btn { display: block; text-align: center; background: #d4af37; color: #0b0f19; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding: 14px 24px; border-radius: 10px; text-decoration: none; margin: 28px 0; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3); }
          .location-box { background: #f1f5f9; border-radius: 10px; padding: 14px; font-size: 12px; color: #334155; line-height: 1.5; margin-bottom: 20px; }
          .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">YashDeep Palace</h1>
            <div class="sublogo">Regal Hospitality · Khuskheda, Rajasthan</div>
          </div>
          <div class="content">
            <div class="greeting">Namaste ${booking.guestName},</div>
            <p class="intro">
              Thank you for booking directly with YashDeep Palace. Your reservation has been successfully confirmed and recorded in our hotel database. Below is your reservation summary and secure PDF voucher download link.
            </p>

            <div class="voucher-box">
              <div class="ref-row">
                <div>
                  <div class="ref-label">Booking Reference</div>
                  <div class="ref-value">${booking.bookingReference}</div>
                </div>
                <div>
                  <span class="badge-paid">✓ PAID & CONFIRMED</span>
                </div>
              </div>

              <div class="grid">
                <div class="grid-item">
                  <div class="item-label">Selected Room</div>
                  <div class="item-value">${booking.roomName}</div>
                </div>
                <div class="grid-item">
                  <div class="item-label">Duration & Guests</div>
                  <div class="item-value">${booking.nights} Night(s) · ${booking.adultCount} Adult(s)</div>
                </div>
                <div class="grid-item">
                  <div class="item-label">Check-In Date</div>
                  <div class="item-value">${booking.checkIn} (from 2:00 PM)</div>
                </div>
                <div class="grid-item">
                  <div class="item-label">Check-Out Date</div>
                  <div class="item-value">${booking.checkOut} (by 11:00 AM)</div>
                </div>
                <div class="grid-item">
                  <div class="item-label">Payment Method</div>
                  <div class="item-value">${booking.paymentMethod.toUpperCase()} (${booking.paymentDetails?.transactionId || 'Instant Verification'})</div>
                </div>
                <div class="grid-item">
                  <div class="item-label">Contact Phone</div>
                  <div class="item-value">${booking.guestPhone}</div>
                </div>
              </div>

              <div class="total-box">
                <span style="font-weight: 700; font-size: 13px;">Total Tariff (incl. 12% GST):</span>
                <span class="total-price">₹${booking.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <!-- PDF Summary Link -->
            <a href="${pdfSummaryUrl}" class="cta-btn" target="_blank">
              📄 Download Official PDF Summary Voucher
            </a>

            <div class="location-box">
              <strong>🏨 Location & Arrival Coordinates:</strong><br/>
              Opposite Honda Car Gate No. 4, RA 403, Karuli Industrial Area, Khuskheda, Tapukrah, Rajasthan 301707, India.<br/>
              Front Desk Concierge: +91 82220 20699 / +91 82220 20599
            </div>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} YashDeep Palace. All rights reserved.<br/>
            This is an automated booking confirmation email sent via YashDeep Palace Reservation Engine.
          </div>
        </div>
      </body>
    </html>
  `.trim();

  const emailNotification: EmailNotification = {
    id: `email_${Date.now()}`,
    bookingReference: booking.bookingReference,
    recipientEmail: booking.guestEmail,
    recipientName: booking.guestName,
    senderEmail: 'reservations@yashdeeppalace.com',
    senderName: 'YashDeep Palace Reservations',
    subject: `Booking Confirmed: YashDeep Palace – Ref #${booking.bookingReference}`,
    sentAt: formattedDate,
    status: 'delivered',
    pdfSummaryUrl,
    htmlContent,
    messageId,
  };

  // Cache notification in memory
  emailStore.set(booking.bookingReference, emailNotification);

  console.log(`[EmailService] Simulated confirmation email dispatched:`, {
    to: booking.guestEmail,
    subject: emailNotification.subject,
    pdfLink: pdfSummaryUrl,
    messageId,
  });

  return emailNotification;
}

export function getEmailNotification(bookingReference: string): EmailNotification | undefined {
  return emailStore.get(bookingReference);
}
