import { createFileRoute } from '@tanstack/react-router';
import { getRouterInstance } from '@tanstack/react-start';
import { rooms } from '@/lib/hotel';
import { isSitemapRouteIncluded, sitemapPathForLocation, sitemapStaticPaths, sitemapXML, type SitemapEntry } from '@/lib/sitemap';

const BASE_URL = 'https://yashdeeppalace.com';

export const Route = createFileRoute('/sitemap.xml')({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map(path => ({ path }));
        const routeId = '/rooms/$room';
        if (isSitemapRouteIncluded(router.routesById[routeId])) {
          for (const room of rooms) {
            const location = router.buildLocation({ to: '/rooms/$room', params: { room: room.slug }, search: () => ({}), hash: '' });
            const path = sitemapPathForLocation(router, location, routeId);
            if (path) entries.push({ path });
          }
        }
        if (entries.length === 0) {
          return new Response('No public pages are included in the sitemap', { status: 404, headers: { 'Cache-Control': 'no-store' } });
        }
        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' },
        });
      },
    },
  },
});