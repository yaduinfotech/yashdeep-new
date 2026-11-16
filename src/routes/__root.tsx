import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { HotelHeader, HotelFooter } from "@/components/hotel-layout";
import { CustomerSession } from "@/components/customer-session";
import { FrontDeskPrompt } from "@/components/front-desk-prompt";
import { FloatingBookingAssistant } from "@/components/floating-booking-assistant";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  staticData: { sitemap: false },
  head: () => ({
    // Replace these placeholders with the app's name and description when first building the app.
    // Each content route, / included, must still set its own head(). Never add og:image or
    // twitter:image here: every page without its own would inherit the root's preview image.
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Yashdeep Palace | Hotel in Khushkhera, Rajasthan" },
      {
        name: "description",
        content:
          "Comfortable rooms, multi-cuisine dining, and meeting facilities in Khushkhera, Rajasthan. Book direct for best rates & instant confirmation.",
      },
      { name: "author", content: "Yashdeep Palace" },
      { name: "google-site-verification", content: "19he4ixh9ms68poL8rHgX0xg3kSMcVwOX-csjQpyECQ" },
      { property: "og:site_name", content: "Yashdeep Palace" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Yashdeep Palace | Hotel in Khushkhera, Rajasthan" },
      {
        property: "og:description",
        content:
          "Comfortable rooms, multi-cuisine dining, and meeting facilities in Khushkhera, Rajasthan. Book direct for best rates & instant confirmation.",
      },
      { property: "og:url", content: "https://yashdeeppalace.com" },
      { property: "og:image", content: "https://yashdeeppalace.com/assets/og-home.jpg" },
      { property: "og:image:secure_url", content: "https://yashdeeppalace.com/assets/og-home.jpg" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Yashdeep Palace Hotel in Khushkhera, Rajasthan" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Yashdeep Palace | Hotel in Khushkhera, Rajasthan" },
      {
        name: "twitter:description",
        content:
          "Comfortable rooms, multi-cuisine dining, and meeting facilities in Khushkhera, Rajasthan. Book direct for best rates & instant confirmation.",
      },
      { name: "twitter:image", content: "https://yashdeeppalace.com/assets/og-home.jpg" },
      { name: "twitter:image:alt", content: "Yashdeep Palace Hotel in Khushkhera, Rajasthan" },
    ],
    links: [
      { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
      { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,400..600;1,9..40,400..600&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/assets/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CustomerSession>
        <HotelHeader />
        <main id="main-content">
          <Outlet />
        </main>
        <HotelFooter />
        <FrontDeskPrompt />
        <FloatingBookingAssistant />
      </CustomerSession>
    </QueryClientProvider>
  );
}
