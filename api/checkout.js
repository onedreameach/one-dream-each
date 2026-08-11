const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      nickname,
      dream_text,
      country,
      instagram,
      tiktok
    } = req.body || {};

    if (!nickname || !dream_text || !country) {
      return res.status(400).json({
        error: "Nickname, dream and country are required."
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "eur",

            product_data: {
              name: "One Dream Each",
              description: "One place. One dream."
            },

            unit_amount: 100
          },

          quantity: 1
        }
      ],

      success_url:
        `${process.env.SITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url:
        `${process.env.SITE_URL}/#leave`,

      metadata: {
        nickname: String(nickname).slice(0, 40),
        dream_text: String(dream_text).slice(0, 280),
        country: String(country).slice(0, 60),
        instagram: String(instagram || "").slice(0, 60),
        tiktok: String(tiktok || "").slice(0, 60)
      }
    });

    return res.status(200).json({
      url: session.url
    });

  } catch (error) {
    console.error("CHECKOUT ERROR:", error);

    return res.status(500).json({
      error: "Unable to create checkout",
      details: error.message
    });
  }
};
