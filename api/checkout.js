import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],

      success_url: "https://onedreameach.com/?success=true",
      cancel_url: "https://onedreameach.com/?cancelled=true",

      metadata: {
  source: "one-dream-each",
  nickname: req.body.nickname || "",
  dream_text: req.body.dream_text || "",
  country: req.body.country || "",
  instagram: req.body.instagram || "",
  tiktok: req.body.tiktok || "",
},
    });

    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

   return res.status(500).json({
  error: error.message,
});
  }
}
