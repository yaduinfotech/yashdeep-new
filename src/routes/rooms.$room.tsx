import { createFileRoute, notFound } from "@tanstack/react-router";
import { RoomDetail } from "@/components/hotel-pages";
import { rooms, pageHead } from "@/lib/hotel";
export const Route = createFileRoute("/rooms/$room")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const room = rooms.find((r) => r.slug === params.room);
    if (!room) throw notFound();
    return room;
  },
  head: ({ loaderData }) =>
    pageHead(
      loaderData?.name ?? "Room unavailable",
      loaderData?.description ?? "Explore Yashdeep Palace accommodation.",
    ),
  component: RoomRoute,
});
function RoomRoute() {
  const { room } = Route.useParams();
  return <RoomDetail slug={room} />;
}
