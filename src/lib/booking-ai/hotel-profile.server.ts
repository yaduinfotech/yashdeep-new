import { hotel, rooms } from "../hotel";

export async function readHotelProfile() {
  return {
    ok: true,
    source: "Yashdeep Palace Information",
    name: hotel.name,
    address: hotel.address,
    area: hotel.area,
    phone: hotel.phone,
    phone2: hotel.phone2,
    email: hotel.email,
    maps: hotel.maps,
    rooms: rooms.map((r) => ({
      name: r.name,
      occupancy: r.occupancy,
      bed: r.bed,
      price: r.price,
    })),
    note: "Listing information only; reception confirms room rates, availability and booking terms.",
  };
}
