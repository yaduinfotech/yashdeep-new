import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RoomDetail, DiningPage, AboutPage } from '@/components/hotel-pages';
import { rooms, hotel, diningInfo, aboutInfo } from '@/lib/hotel';

// Mock TanStack Router Link & router hooks
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    Link: ({ children, to, search, params, ...props }: any) => {
      let href = typeof to === 'string' ? to : '';
      if (params?.room) href = href.replace('$room', params.room);
      return <a href={href} {...props}>{children}</a>;
    },
    useRouterState: () => '/',
  };
});

describe('Enhanced Hotel Pages', () => {
  describe('RoomDetail Component', () => {
    it('renders room details for Deluxe Room', () => {
      render(<RoomDetail slug="deluxe" />);

      // Room name & description
      expect(screen.getAllByText('Deluxe Room').length).toBeGreaterThan(0);
      expect(screen.getByText(/₹1,600/)).toBeInTheDocument();
      expect(screen.getByText(/per night \+ 5% GST/)).toBeInTheDocument();

      // Inclusions & specs
      expect(screen.getByText('High-speed optical fiber Wi-Fi')).toBeInTheDocument();
      expect(screen.getByText(/Free secured on-premises/)).toBeInTheDocument();
      expect(screen.getByText('King bed')).toBeInTheDocument();
      expect(screen.getByText('2 adults')).toBeInTheDocument();

      // Categorized amenities
      expect(screen.getByText('Comfort & Climate')).toBeInTheDocument();
      expect(screen.getByText('Bathroom & Care')).toBeInTheDocument();
      expect(screen.getByText('Work & Connectivity')).toBeInTheDocument();

      // House rules & policies
      expect(screen.getByText('Stay Policies & House Rules')).toBeInTheDocument();
      expect(screen.getByText(/Check-in & Check-out/)).toBeInTheDocument();

      // Reservation button
      const bookButtons = screen.getAllByRole('link', { name: /Reserve this room/i });
      expect(bookButtons.length).toBeGreaterThan(0);
    });

    it('renders room details for Deluxe Room With Breakfast', () => {
      render(<RoomDetail slug="deluxe-with-breakfast" />);

      expect(screen.getAllByText('Deluxe Room With Breakfast').length).toBeGreaterThan(0);
      expect(screen.getByText(/₹2,000/)).toBeInTheDocument();
      expect(screen.getByText(/Daily freshly prepared hot breakfast/i)).toBeInTheDocument();
    });

    it('shows fallback when room slug is not found', () => {
      render(<RoomDetail slug="non-existent-room" />);

      expect(screen.getAllByText('Room not available').length).toBeGreaterThan(0);
      expect(screen.getByRole('link', { name: /View all rooms/i })).toBeInTheDocument();
    });
  });

  describe('DiningPage Component', () => {
    it('renders dining hero, hours, highlights, and menu tabs', () => {
      render(<DiningPage />);

      // Title & descriptions
      expect(screen.getAllByText('Restaurant & Dining').length).toBeGreaterThan(0);
      expect(screen.getByText(/A meal to make/i)).toBeInTheDocument();

      // Operating hours
      expect(screen.getByText('Breakfast Buffet & A La Carte')).toBeInTheDocument();
      expect(screen.getByText(/07:30 AM/)).toBeInTheDocument();
      expect(screen.getByText('Executive Lunch')).toBeInTheDocument();
      expect(screen.getByText(/12:30 PM/)).toBeInTheDocument();

      // Menu categories tabs
      const breakfastTab = screen.getByRole('button', { name: /Morning Breakfast/i });
      const mainsTab = screen.getByRole('button', { name: /North Indian & Tandoor/i });
      expect(breakfastTab).toBeInTheDocument();
      expect(mainsTab).toBeInTheDocument();

      // Check active tab dishes
      expect(screen.getByText('Stuffed Tawa Parathas')).toBeInTheDocument();

      // Switch to Mains tab
      fireEvent.click(mainsTab);
      expect(screen.getByText('Paneer Butter Masala')).toBeInTheDocument();

      // Corporate meal banner
      expect(screen.getByText(/Hosting an executive lunch or company dinner\?/i)).toBeInTheDocument();
    });
  });

  describe('AboutPage Component', () => {
    it('renders about story, key stats, pillars, and proximity table', () => {
      render(<AboutPage />);

      // Title
      expect(screen.getAllByText('About Yashdeep Palace').length).toBeGreaterThan(0);
      expect(screen.getByText(/Rooted in hospitality/i)).toBeInTheDocument();

      // Stats
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('Power Backup')).toBeInTheDocument();
      expect(screen.getByText('2 min')).toBeInTheDocument();
      expect(screen.getByText('From Honda Car Gate 4')).toBeInTheDocument();

      // Proximity table
      expect(screen.getByText('Nearby Corporate & Industrial Hubs')).toBeInTheDocument();
      expect(screen.getByText('Honda Cars India Limited (Gate No. 4)')).toBeInTheDocument();
      expect(screen.getByText('2 mins walk')).toBeInTheDocument();
      expect(screen.getByText('Tapukara Industrial Area')).toBeInTheDocument();

      // Facilities
      expect(screen.getByText('Hotel Facilities & Services')).toBeInTheDocument();
      expect(screen.getByText('Spacious AC Rooms')).toBeInTheDocument();
      expect(screen.getByText('Elevator / Lift Access')).toBeInTheDocument();
    });
  });
});
