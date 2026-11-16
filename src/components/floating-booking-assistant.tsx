import { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { MessageCircle, ClipboardList, MessagesSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookingAgent } from "./booking-agent";
import { BookingPage } from "./booking-wizard";
import { hotel, type Stay } from "@/lib/hotel";

export function FloatingBookingAssistant() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "booking">("chat");
  const [draft, setDraft] = useState<Partial<Stay>>({});
  const [revision, setRevision] = useState(0);
  const search = useRouterState({ select: (state) => state.location.search });
  function startBooking(stay?: Stay) {
    const current = search as Partial<Stay>;
    setDraft(
      stay ?? {
        checkIn: current.checkIn ?? "",
        checkOut: current.checkOut ?? "",
        adults: current.adults ?? 2,
        children: current.children ?? 0,
        rooms: current.rooms ?? 1,
        room: current.room ?? "",
      },
    );
    setRevision((value) => value + 1);
    setView("booking");
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="floating-enquiry booking-launcher"
          aria-label="Open AI booking assistant"
          title="AI booking assistant"
        >
          <MessageCircle size={23} />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="floating-booking-modal"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <header className="floating-booking-heading">
          <div>
            <DialogTitle>Yashdeep Palace</DialogTitle>
            <DialogDescription>Booking concierge</DialogDescription>
          </div>
          <a href={hotel.phoneLink} aria-label="Call front desk" title="Call front desk">
            <Phone size={18} />
          </a>
        </header>
        <div className="floating-booking-tabs" role="tablist" aria-label="Booking assistant views">
          <Button
            role="tab"
            aria-selected={view === "chat"}
            variant={view === "chat" ? "secondary" : "ghost"}
            onClick={() => setView("chat")}
          >
            <MessagesSquare />
            Concierge
          </Button>
          <Button
            role="tab"
            aria-selected={view === "booking"}
            variant={view === "booking" ? "secondary" : "ghost"}
            onClick={() => {
              if (!revision) startBooking();
              else setView("booking");
            }}
          >
            <ClipboardList />
            Booking request
          </Button>
        </div>
        <div className="floating-booking-body">
          <div hidden={view !== "chat"}>
            <BookingAgent compact onReview={startBooking} />
          </div>
          {revision > 0 && (
            <div hidden={view !== "booking"}>
              <BookingPage key={revision} initial={draft} embedded />
            </div>
          )}
        </div>
        <footer className="floating-booking-note">
          Availability and price will be confirmed by reception.
        </footer>
      </DialogContent>
    </Dialog>
  );
}
