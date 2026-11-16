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
  head: ({ loaderData, params }) => {
    const isWithBreakfast =
      params.room === "deluxe-with-breakfast" ||
      params.room === "luxury" ||
      loaderData?.slug === "deluxe-with-breakfast";
    const ogImage = isWithBreakfast ? "/assets/og-luxury.jpg" : "/assets/og-deluxe.jpg";
    const roomName = loaderData?.name ?? "Room";
    const roomPrice = loaderData?.price
      ? ` from ₹${loaderData.price.toLocaleString("en-IN")}/night`
      : "";
    const description = loaderData?.description
      ? `${loaderData.description} Features ${loaderData.bed ?? "King bed"}, split AC, and high-speed Wi-Fi${roomPrice}.`
      : "Explore comfortable accommodation at Yashdeep Palace Khushkhera.";

    return pageHead(`${roomName} — Accommodation`, description, {
      path: `/rooms/${params.room}`,
      image: ogImage,
      imageAlt: `${roomName} at Yashdeep Palace Khushkhera`,
      cta: `Reserve ${roomName} direct for best rates & instant confirmation.`,
    });
  },
  component: RoomRoute,
});
function RoomRoute() {
  const { room } = Route.useParams();
  return <RoomDetail slug={room} />;
}
