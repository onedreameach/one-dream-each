import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const signature = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log("PAYMENT CONFIRMED:", session.id);
      console.log("DREAM DATA:", session.metadata);
    }

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error("Webhook error:", error.message);

    return res.status(400).json({
      error: error.message,
    });
  }
}
