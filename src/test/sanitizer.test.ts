import { describe, expect, it } from 'vitest';
import {
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  sanitizeDate,
  sanitizeObject,
} from '@/lib/sanitizer';

describe('Sanitizer utilities', () => {
  describe('sanitizeText', () => {
    it('strips HTML tags and script injections', () => {
      const malicious = '<script>alert("xss")</script>Hello <b>World</b>!';
      expect(sanitizeText(malicious)).toBe('alert("xss")Hello World!');
    });

    it('trims leading and trailing whitespace', () => {
      expect(sanitizeText('   Yashdeep Palace   ')).toBe('Yashdeep Palace');
    });

    it('caps length to maxLen', () => {
      expect(sanitizeText('1234567890', 5)).toBe('12345');
    });

    it('returns empty string for non-string input', () => {
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
      expect(sanitizeText(123)).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('lowercases and trims emails', () => {
      expect(sanitizeEmail('  Guest.VIP@Example.COM  ')).toBe('guest.vip@example.com');
    });

    it('returns empty string for invalid inputs', () => {
      expect(sanitizeEmail(null)).toBe('');
    });
  });

  describe('sanitizePhone', () => {
    it('formats 10-digit Indian phone numbers with +91', () => {
      expect(sanitizePhone('8222020699')).toBe('+918222020699');
      expect(sanitizePhone('822-202-0699')).toBe('+918222020699');
      expect(sanitizePhone('(822) 202 0699')).toBe('+918222020699');
    });

    it('preserves existing country code', () => {
      expect(sanitizePhone('+918222020699')).toBe('+918222020699');
      expect(sanitizePhone('+15551234567')).toBe('+15551234567');
    });
  });

  describe('sanitizeDate', () => {
    it('accepts valid YYYY-MM-DD dates', () => {
      expect(sanitizeDate('2026-11-15')).toBe('2026-11-15');
    });

    it('rejects invalid date formats', () => {
      expect(sanitizeDate('15/11/2026')).toBe('');
      expect(sanitizeDate('invalid-date')).toBe('');
      expect(sanitizeDate('')).toBe('');
    });
  });

  describe('sanitizeObject', () => {
    it('recursively sanitizes complex nested structures', () => {
      const payload = {
        name: '<b>John Doe</b>',
        guestEmail: '  JOHN@EXAMPLE.COM ',
        mobileNumber: '8222020699',
        checkIn: ' 2026-12-01 ',
        notes: '<p>Quiet room please</p>',
        tags: ['<i>VIP</i>', ' Honeymoon '],
        guestCount: 2,
      };

      const sanitized = sanitizeObject(payload);
      expect(sanitized).toEqual({
        name: 'John Doe',
        guestEmail: 'john@example.com',
        mobileNumber: '+918222020699',
        checkIn: '2026-12-01',
        notes: 'Quiet room please',
        tags: ['VIP', 'Honeymoon'],
        guestCount: 2,
      });
    });
  });
});
