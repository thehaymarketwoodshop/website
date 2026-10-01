# Haymarket redesign (test build)

A redesign of thehaymarketwoodshop.com built on top of the existing codebase. Shopify shop and cart,
custom orders, contact email, invoices with e-signature, admin, woods, stain samples and care guide all still work.

Run: `npm run dev` → http://localhost:3000. It uses the same `.env.local` as the live project.

## Where things live
- `src/content/site.ts`: all copy, the nav, the five disciplines, process, woods, testimonials and values (the template lever)
- `src/app/globals.css` `:root`: colour, spacing and type tokens
- `src/components/home/*`: homepage story, one component per section
- `src/components/motion/*`: Lenis + GSAP smooth scroll, RevealText, ParallaxImage
- `public/media/grain-*.jpg`: original procedural wood textures (`node scripts/gen/wood.mjs <dir>`)

## Motion
- Hero: growth rings draw in on load; scroll scrubs scale and rotation
- Statement: words ink in with scroll
- What we make: 5 stacked sticky panels; each recedes as the next slides over
- Anatomy of a board: pinned, scrubbed 4-step story (fully reversible)
- Commission: pinned horizontal track on ≥1024px, vertical list below that
- All motion is off with prefers-reduced-motion; Lenis is disabled there too

## Needs owner input
- Lead time: contact page says 2–10 weeks, care guide says 4–12 weeks for custom work
- Real photography for dining tables, cabinetry, built-ins and custom furniture (currently wood-grain studies)
- Shop / woods / stain samples / care guide / legal pages inherit the new tokens but keep their old layouts
