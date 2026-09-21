# Dream Mug launch notes

## Included
- `dream-mug.html` — finished customer-facing product page.
- `mug-success.html` — Stripe success page.
- `api/mug-checkout.js` — Stripe Checkout for the mug.
- `dream-mug-print-front.png` — 826 × 1062 px transparent print file prepared for the supplier's one-side 71 × 90 mm print area.
- `dream-mug-print-preview.jpg` — on-site print preview.
- Home page entry points: desktop header button, mobile fixed button, and a full Dream Mug feature section.

## Product facts used
The page was built against Hoplix's current Magic Mug listing: 330 ml / 11 oz, Ø 8.2 × 9.5 cm, glossy heat-changing ceramic, black when cold and white when heated, one-side base print, hand wash only, food-safe, gift box, and estimated 3–5 working-day production.

## Checkout / fulfilment
The checkout uses the existing `STRIPE_SECRET_KEY` and `SITE_URL` environment variables. Product sessions have `metadata.order_type = dream_mug`, so the dream webhooks are explicitly told to ignore them.

Shipping is currently configured from the supplier's economy table for the countries present in `api/mug-checkout.js`. The customer must choose the destination before Checkout; Stripe then restricts the shipping address to that chosen country.

IMPORTANT: Stripe payment and Hoplix fulfilment are separate in this version. After a Dream Mug order arrives in Stripe, the order still needs to be submitted to Hoplix manually (or later automated with Hoplix/API credentials). Do not market the flow as fully automated until that connection is added.

## Before public launch
1. Upload `dream-mug-print-front.png` to Hoplix Magic Mug, one-side print.
2. Order one physical sample and compare placement/colors against the page.
3. Re-check Hoplix shipping rates and production timing.
4. Run a Stripe test-mode order end to end.
5. Switch to live Stripe keys only after the sample and checkout are verified.
