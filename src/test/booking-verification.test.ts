import { describe,expect,it } from 'vitest';
import { FRONT_DESK_PROMPT_MS,SIGNUP_DISCOUNT_PERCENT,hasVerifiedContacts,phoneSchema,LIMITS } from '@/lib/booking-rules';
import { hotel } from '@/lib/hotel';
describe('Customer booking requirements',()=>{
 it('prompts after exactly 40 seconds',()=>expect(FRONT_DESK_PROMPT_MS).toBe(40000));
 it('sets signup offer to an extra 10 percent',()=>expect(SIGNUP_DISCOUNT_PERCENT).toBe(10));
 it('uses the owner-confirmed WhatsApp number',()=>expect(hotel.whatsapp).toContain('wa.me/918222020699?'));
 it('requires both verified email and mobile',()=>{expect(hasVerifiedContacts({email:'guest@example.com',email_confirmed_at:'2026-11-15'},'guest@example.com',false)).toBe(false);expect(hasVerifiedContacts({email:'guest@example.com'},'guest@example.com',true)).toBe(false);expect(hasVerifiedContacts({email:'guest@example.com',email_confirmed_at:'2026-11-15'},'other@example.com',true)).toBe(false);expect(hasVerifiedContacts({email:'guest@example.com',email_confirmed_at:'2026-11-15'},'guest@example.com',true)).toBe(true);});
 it('normalizes Indian mobile numbers',()=>expect(phoneSchema.parse('8222020699')).toBe('+918222020699'));
 it('rejects malformed phone input',()=>expect(phoneSchema.safeParse('not a number').success).toBe(false));
 it('limits verification to five attempts per fifteen minutes',()=>expect(LIMITS.verify).toEqual({max:5,seconds:900}));
});