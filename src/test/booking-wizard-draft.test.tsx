import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BookingPage } from '@/components/booking-wizard';
import { BOOKING_DRAFT_KEY, clearBookingDraft, saveBookingDraft } from '@/lib/booking-draft';
import { localToday } from '@/lib/hotel';

// Mock TanStack Router Link
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  };
});

// Mock TanStack Start useServerFn
vi.mock('@tanstack/react-start', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-start')>();
  return {
    ...actual,
    useServerFn: (fn: any) => fn,
  };
});

// Mock customer session
vi.mock('@/components/customer-session', () => ({
  useCustomer: () => ({ user: null }),
}));

describe('BookingPage 36-Hour Draft Landing & Progression', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    });

    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('directly lands user on Step 2 when draft left on Step 2 within 36 hours', async () => {
    const today = localToday();
    const d1 = new Date();
    d1.setDate(d1.getDate() + 5);
    const d2 = new Date();
    d2.setDate(d2.getDate() + 7);
    const checkIn = d1.toISOString().split('T')[0];
    const checkOut = d2.toISOString().split('T')[0];

    saveBookingDraft({
      step: 2,
      stay: {
        checkIn,
        checkOut,
        adults: 2,
        children: 1,
        rooms: 1,
        room: 'Deluxe Room',
      },
      guest: {
        name: 'Amit Patel',
        email: 'amit@example.com',
        phone: '+919876543210',
        requests: 'Early check-in',
      },
    });

    render(<BookingPage initial={{}} />);

    await waitFor(() => {
      // Step 2 heading: "A little about you."
      expect(screen.getByText('A little about you.')).toBeDefined();
    });

    // Check that guest values were restored
    const nameInput = screen.getByLabelText(/Full name/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Amit Patel');

    const emailInput = screen.getByLabelText(/Email address/i) as HTMLInputElement;
    expect(emailInput.value).toBe('amit@example.com');

    // Banner indicates step 2 was restored
    expect(screen.getByText(/Restored your stay in progress/i)).toBeDefined();
  });

  it('directly lands user on Step 3 when draft left on Step 3 within 36 hours', async () => {
    const d1 = new Date();
    d1.setDate(d1.getDate() + 10);
    const d2 = new Date();
    d2.setDate(d2.getDate() + 12);
    const checkIn = d1.toISOString().split('T')[0];
    const checkOut = d2.toISOString().split('T')[0];

    saveBookingDraft({
      step: 3,
      stay: {
        checkIn,
        checkOut,
        adults: 2,
        children: 0,
        rooms: 1,
        room: 'Deluxe Room With Breakfast',
      },
      guest: {
        name: 'Sunita Sharma',
        email: 'sunita@example.com',
        phone: '9811223344',
        requests: 'Quiet room',
      },
    });

    render(<BookingPage initial={{}} />);

    await waitFor(() => {
      // Step 3 heading: "Review your booking."
      expect(screen.getByText('Review your booking.')).toBeDefined();
    });

    // Verify summary is rendered
    expect(screen.getByText('Sunita Sharma')).toBeDefined();
    expect(screen.getByText('Deluxe Room With Breakfast')).toBeDefined();
    expect(screen.getByText(/Restored your stay in progress/i)).toBeDefined();
  });

  it('allows user to click "Start fresh" to clear draft and return to Step 1', async () => {
    const d1 = new Date();
    d1.setDate(d1.getDate() + 3);
    const d2 = new Date();
    d2.setDate(d2.getDate() + 5);

    saveBookingDraft({
      step: 2,
      stay: {
        checkIn: d1.toISOString().split('T')[0],
        checkOut: d2.toISOString().split('T')[0],
        adults: 2,
        children: 0,
        rooms: 1,
        room: 'Deluxe Room',
      },
      guest: {
        name: 'Reset Test',
        email: 'reset@example.com',
        phone: '9876543210',
        requests: '',
      },
    });

    render(<BookingPage initial={{}} />);

    await waitFor(() => {
      expect(screen.getByText('A little about you.')).toBeDefined();
    });

    const startFreshBtn = screen.getByText('Start fresh');
    fireEvent.click(startFreshBtn);

    await waitFor(() => {
      // Should return to Step 1: "A stay made for you."
      expect(screen.getByText('A stay made for you.')).toBeDefined();
    });

    // LocalStorage should now be cleared
    expect(mockStorage[BOOKING_DRAFT_KEY]).toBeUndefined();
  });
});
