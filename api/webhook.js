import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const signature = req.headers["stripe-signature"];

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }

    const rawBody = Buffer.concat(chunks);

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log("PAYMENT CONFIRMED:", session.id);
      console.log("DREAM DATA:", session.metadata);

      const dream = session.metadata;

      // Trova il prossimo numero del dream
      const countResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/Dreams?select=id`,
        {
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }
      );

      if (!countResponse.ok) {
        throw new Error("Unable to read Dreams table");
      }

      const existingDreams = await countResponse.json();
      const dreamNumber = existingDreams.length + 1;

      // Salva il dream
      const insertResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/Dreams`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            dream_number: dreamNumber,
            nickname: dream.nickname || "",
            dream_text: dream.dream_text || "",
            country: dream.country || "",
            instagram: dream.instagram || "",
            tiktok: dream.tiktok || "",
          }),
        }
      );

      if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        throw new Error(`Supabase insert failed: ${errorText}`);
      }

      console.log("DREAM SAVED:", dreamNumber);
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
