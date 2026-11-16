import { tool } from 'ai';
import { z } from 'zod';
import { prepareAgentStay } from '../booking-agent-rules';
import { readHotelProfile } from './hotel-profile.server';

export function bookingTools(today: string) {
  return {
    hotelInformation: tool({ description: 'Read the selected managed YASHDEEP PALACE Google listing for location and contact information. Does not check room availability or prices.', inputSchema: z.object({}).strict(), strict: true, execute: readHotelProfile }),
    prepareStay: tool({
      description: 'Prepare and validate a stay draft for the guest to review in the existing booking form. Does not submit a request, check live availability, verify contacts or confirm a booking. Only call after the guest supplies dates and guest/room counts; room can be empty for no preference.',
      inputSchema: z.object({ checkIn: z.string(), checkOut: z.string(), adults: z.number(), children: z.number(), rooms: z.number(), room: z.string() }).strict(),
      strict: true,
      execute: async input => prepareAgentStay(input, today),
    }),
  };
}