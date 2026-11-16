import { createFileRoute } from '@tanstack/react-router';
import { handleBookingChat } from '@/lib/booking-ai/chat.server';

export const Route = createFileRoute('/api/booking-agent')({ staticData: { sitemap: false },
  server: { handlers: { POST: ({ request }) => handleBookingChat(request) } },
});