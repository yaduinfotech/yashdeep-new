import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/rooms")({
  staticData: { sitemap: false },
  component: Outlet,
});
