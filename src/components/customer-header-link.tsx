import { Link } from "@tanstack/react-router";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomer } from "./customer-session";
export function CustomerHeaderLink() {
  const { user } = useCustomer();
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      title={user ? "Your account" : "Customer signup"}
      aria-label={user ? "Your account" : "Customer signup"}
    >
      <Link to="/auth">
        <UserRound />
      </Link>
    </Button>
  );
}
