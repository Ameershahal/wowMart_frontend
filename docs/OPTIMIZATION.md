# Optimization notes

- **Static generation**: This app is a **static SPA** (Vite build outputs static JS/CSS/HTML). Pages are client-rendered; there is no pre-rendered HTML per route. For full static site generation (SSG) or per-route pre-rendering you’d need a different setup (e.g. Vite SSG plugin or Next.js).

- **Server-side rendering (SSR)**: Not used. Only add SSR if you need SEO for dynamic content or faster first-contentful paint for crawlers; the current stack is tuned for a static front end talking to an API.

- **Tailwind**: All UI is built with Tailwind CSS. No heavy UI libraries (MUI, Chakra, etc.) are used.

- **Dynamic imports**: Route-level code splitting (lazy routes), Confetti and SweetAlert2 loaded on demand to keep the main bundle smaller.

- **Images**: `loading="lazy"` and `decoding="async"` on images; main product image uses `loading="eager"` for LCP.

- **Build**: Vendor chunks split (react, router, axios); console/debugger stripped in production builds.
