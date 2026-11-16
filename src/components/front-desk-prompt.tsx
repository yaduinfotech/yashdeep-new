import { useEffect, useRef, useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { hotel } from "@/lib/hotel";
import { FRONT_DESK_PROMPT_MS } from "@/lib/booking-rules";
export function FrontDeskPrompt() {
  const [open, setOpen] = useState(false);
  const shown = useRef(false);
  useEffect(() => {
    let pending = false;
    const show = () => {
      if (shown.current) return;
      if (document.visibilityState === "hidden") {
        pending = true;
        return;
      }
      if (document.querySelector('[role="dialog"]')) return;
      shown.current = true;
      setOpen(true);
    };
    const timer = setTimeout(show, FRONT_DESK_PROMPT_MS);
    const exit = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) show();
    };
    const visibility = () => {
      if (document.visibilityState === "hidden") pending = true;
      else if (pending) show();
    };
    document.addEventListener("mouseout", exit);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", exit);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="front-desk-modal">
        <div className="eyebrow">A personal welcome</div>
        <DialogTitle className="front-desk-title">
          Let us help plan
          <br />
          your stay.
        </DialogTitle>
        <DialogDescription>Speak directly with the Yashdeep Palace front desk.</DialogDescription>
        <div className="prompt-actions">
          <Button variant="hotel" asChild>
            <a href={hotel.phoneLink}>
              <Phone />
              Call front desk
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={hotel.whatsapp} target="_blank" rel="noreferrer">
              <MessageCircle />
              WhatsApp front desk
            </a>
          </Button>
        </div>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          I'll keep exploring
        </Button>
      </DialogContent>
    </Dialog>
  );
}
