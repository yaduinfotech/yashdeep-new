import { describe, expect, it } from "vitest";
import { pageHead, SITE_URL, DEFAULT_OG_IMAGE, DEFAULT_CTA, rooms } from "@/lib/hotel";
import fs from "node:fs";
import path from "node:path";

describe("Open Graph & Twitter Card Metadata Previews", () => {
  it("emits complete Open Graph & Twitter Card tags with default fallbacks", () => {
    const head = pageHead("Rooms & Accommodation", "Explore our comfortable rooms.");
    const meta = head.meta;

    // Title & Description
    expect(meta.find((m) => "title" in m)?.title).toBe("Rooms & Accommodation | Yashdeep Palace");
    const descMeta = meta.find((m) => "name" in m && m.name === "description");
    expect(descMeta?.content).toContain("Explore our comfortable rooms.");
    expect(descMeta?.content).toContain(DEFAULT_CTA);

    // Open Graph
    expect(meta.find((m) => "property" in m && m.property === "og:site_name")?.content).toBe(
      "Yashdeep Palace",
    );
    expect(meta.find((m) => "property" in m && m.property === "og:type")?.content).toBe("website");
    expect(meta.find((m) => "property" in m && m.property === "og:title")?.content).toBe(
      "Rooms & Accommodation | Yashdeep Palace",
    );
    expect(meta.find((m) => "property" in m && m.property === "og:description")?.content).toContain(
      DEFAULT_CTA,
    );
    expect(meta.find((m) => "property" in m && m.property === "og:url")?.content).toBe(SITE_URL);
    expect(meta.find((m) => "property" in m && m.property === "og:image")?.content).toBe(
      `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    );
    expect(meta.find((m) => "property" in m && m.property === "og:image:width")?.content).toBe(
      "1200",
    );
    expect(meta.find((m) => "property" in m && m.property === "og:image:height")?.content).toBe(
      "630",
    );
    expect(meta.find((m) => "property" in m && m.property === "og:image:type")?.content).toBe(
      "image/jpeg",
    );
    expect(meta.find((m) => "property" in m && m.property === "og:locale")?.content).toBe("en_IN");

    // Twitter Card
    expect(meta.find((m) => "name" in m && m.name === "twitter:card")?.content).toBe(
      "summary_large_image",
    );
    expect(meta.find((m) => "name" in m && m.name === "twitter:image")?.content).toBe(
      `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    );

    // Canonical link
    expect(head.links).toEqual([{ rel: "canonical", href: SITE_URL }]);
  });

  it("applies page-specific parameters and resolves absolute URLs for crawlers", () => {
    const head = pageHead("Restaurant & Dining", "Enjoy fresh North Indian cuisine.", {
      path: "/restaurant",
      image: "/assets/og-restaurant.jpg",
      imageAlt: "Restaurant at Yashdeep Palace",
      cta: "View dining menu & reserve a table.",
    });

    const meta = head.meta;
    const ogUrl = meta.find((m) => "property" in m && m.property === "og:url");
    const ogImage = meta.find((m) => "property" in m && m.property === "og:image");
    const ogDesc = meta.find((m) => "property" in m && m.property === "og:description");
    const twitterImage = meta.find((m) => "name" in m && m.name === "twitter:image");

    expect(ogUrl?.content).toBe("https://yashdeeppalace.com/restaurant");
    expect(ogImage?.content).toBe("https://yashdeeppalace.com/assets/og-restaurant.jpg");
    expect(twitterImage?.content).toBe("https://yashdeeppalace.com/assets/og-restaurant.jpg");
    expect(ogDesc?.content).toBe(
      "Enjoy fresh North Indian cuisine. View dining menu & reserve a table.",
    );
    expect(head.links).toEqual([
      { rel: "canonical", href: "https://yashdeeppalace.com/restaurant" },
    ]);
  });

  it("generates distinct dynamic preview cards for Deluxe and Deluxe with Breakfast rooms", () => {
    const deluxeRoom = rooms.find((r) => r.slug === "deluxe");
    const breakfastRoom = rooms.find((r) => r.slug === "deluxe-with-breakfast");

    expect(deluxeRoom).toBeDefined();
    expect(breakfastRoom).toBeDefined();

    const deluxeHead = pageHead(
      `${deluxeRoom?.name} — Accommodation`,
      `${deluxeRoom?.description}`,
      {
        path: `/rooms/${deluxeRoom?.slug}`,
        image: "/assets/og-deluxe.jpg",
        cta: "Reserve Deluxe Room direct for best rates.",
      },
    );

    const breakfastHead = pageHead(
      `${breakfastRoom?.name} — Accommodation`,
      `${breakfastRoom?.description}`,
      {
        path: `/rooms/${breakfastRoom?.slug}`,
        image: "/assets/og-luxury.jpg",
        cta: "Reserve Deluxe Room with Breakfast direct for best rates.",
      },
    );

    const deluxeImg = deluxeHead.meta.find(
      (m) => "property" in m && m.property === "og:image",
    )?.content;
    const breakfastImg = breakfastHead.meta.find(
      (m) => "property" in m && m.property === "og:image",
    )?.content;

    expect(deluxeImg).toBe("https://yashdeeppalace.com/assets/og-deluxe.jpg");
    expect(breakfastImg).toBe("https://yashdeeppalace.com/assets/og-luxury.jpg");
    expect(deluxeImg).not.toBe(breakfastImg);

    const deluxeUrl = deluxeHead.meta.find(
      (m) => "property" in m && m.property === "og:url",
    )?.content;
    const breakfastUrl = breakfastHead.meta.find(
      (m) => "property" in m && m.property === "og:url",
    )?.content;

    expect(deluxeUrl).toBe("https://yashdeeppalace.com/rooms/deluxe");
    expect(breakfastUrl).toBe("https://yashdeeppalace.com/rooms/deluxe-with-breakfast");
  });

  it("verifies physical existence and valid 1200x630 dimensions of all OG images", () => {
    const expectedOgFiles = [
      "og-home.jpg",
      "og-deluxe.jpg",
      "og-luxury.jpg",
      "og-restaurant.jpg",
      "og-meetings.jpg",
      "og-contact.jpg",
    ];

    for (const file of expectedOgFiles) {
      const fullPath = path.resolve(process.cwd(), "public/assets", file);
      expect(fs.existsSync(fullPath)).toBe(true);

      const buf = fs.readFileSync(fullPath);
      // Ensure file is within WhatsApp 300KB recommended limit
      expect(buf.length).toBeLessThan(300 * 1024);

      // Verify JPEG dimensions
      let width = 0;
      let height = 0;
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) break;
        const marker = buf[i + 1];
        if (marker === 0xc0 || marker === 0xc2) {
          height = buf.readUInt16BE(i + 5);
          width = buf.readUInt16BE(i + 7);
          break;
        }
        i += 2 + buf.readUInt16BE(i + 2);
      }

      expect(width).toBe(1200);
      expect(height).toBe(630);
    }
  });
});
