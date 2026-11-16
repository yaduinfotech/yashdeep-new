import { createFileRoute } from '@tanstack/react-router';
import { GalleryPage } from '@/components/hotel-pages';
import { pageHead } from '@/lib/hotel';
export const Route = createFileRoute('/gallery')({ staticData: { sitemap: true },head:()=>pageHead('Property Photo Gallery','View real photographs of the Yashdeep Palace exterior, reception, guest rooms, restaurant and meeting lounge.'),component:GalleryPage});