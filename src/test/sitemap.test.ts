import { describe, expect, it } from "vitest";
import { createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "@/routeTree.gen";
import { sitemapStaticPaths, sitemapPathForLocation, sitemapXML } from "@/lib/sitemap";

const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

describe("Hotel sitemap discovery", () => {
  it("includes guest pages without exposing account or service destinations", () => {
    const paths = sitemapStaticPaths(router);
    expect(paths).toContain("/");
    expect(paths).toContain("/rooms");
    expect(paths).toContain("/contact");
    expect(paths).toContain("/booking");
    expect(paths).not.toContain("/auth");
    expect(paths).not.toContain("/api/booking-agent");
    expect(paths).not.toContain("/sitemap.xml");
    expect(paths).not.toContain("/booking-assistant");
  });
  it("accepts the public room destination but rejects private and unknown destinations", () => {
    const location = router.buildLocation({
      to: "/rooms/$room",
      params: { room: "deluxe" },
      search: () => ({}),
      hash: "",
    });
    expect(sitemapPathForLocation(router, location, "/rooms/$room")).toBe("/rooms/deluxe");
    expect(
      sitemapPathForLocation(router, { pathname: "/auth", publicHref: "/auth" }, "/auth"),
    ).toBeUndefined();
    expect(
      sitemapPathForLocation(router, { pathname: "/unknown", publicHref: "/unknown" }, "/unknown"),
    ).toBeUndefined();
  });
  it("uses the published origin, deduplicates URLs and omits unsupported change dates", () => {
    const xml = sitemapXML("https://yashdeeppalace.com", [
      { path: "/" },
      { path: "/" },
      { path: "/rooms/deluxe" },
    ]);
    expect(xml.match(/<url>/g)).toHaveLength(2);
    expect(xml).toContain("<loc>https://yashdeeppalace.com/rooms/deluxe</loc>");
    expect(xml).not.toContain("<lastmod>");
    expect(() => sitemapXML("https://example.com", [{ path: "//private.example" }])).toThrow(
      "Invalid sitemap path",
    );
  });
});
