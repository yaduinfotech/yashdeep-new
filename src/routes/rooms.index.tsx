import { createFileRoute } from '@tanstack/react-router';
import { RoomsPage } from '@/components/hotel-pages';
import { pageHead } from '@/lib/hotel';
export const Route = createFileRoute('/rooms/')({ staticData: { sitemap: true }, head:()=>pageHead('Rooms & Accommodation','Explore Deluxe and Luxury Double Rooms at Yashdeep Palace. Contact reception for current rates and availability.'),component:RoomsPage });