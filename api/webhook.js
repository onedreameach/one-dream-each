```javascript
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).json({
      error: "Missing Stripe signature"
    });
  }

  try {
    // Stripe needs the RAW request body
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }

    const rawBody = Buffer.concat(chunks);

    // Verify Stripe webhook
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("STRIPE EVENT:", event.type);

    // We only need completed Checkout Sessions
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log("PAYMENT CONFIRMED:", session.id);

      const dream = session.metadata || {};

      console.log("DREAM DATA:", dream);

      /*
       * CHECK IF THIS STRIPE SESSION
       * HAS ALREADY CREATED A DREAM
       */

      const existingResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/Dreams?select=id&stripe_session_id=eq.${encodeURIComponent(
          session.id
        )}`,
        {
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization:
              `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          }
        }
      );

      if (!existingResponse.ok) {
        const errorText = await existingResponse.text();

        throw new Error(
          `Unable to check existing dream: ${errorText}`
        );
      }

      const existingDreams =
        await existingResponse.json();

      if (existingDreams.length > 0) {
        console.log(
          "DREAM ALREADY SAVED:",
          session.id
        );

        return res.status(200).json({
          received: true,
          duplicate: true
        });
      }

      /*
       * GET EXISTING DREAMS
       */

      const countResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/Dreams?select=id`,
        {
          headers: {
            apikey:
              process.env.SUPABASE_SERVICE_ROLE_KEY,

            Authorization:
              `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          }
        }
      );

      if (!countResponse.ok) {
        const errorText =
          await countResponse.text();

        throw new Error(
          `Unable to read Dreams table: ${errorText}`
        );
      }

      const allDreams =
        await countResponse.json();

      /*
       * NEXT DREAM NUMBER
       */

      const dreamNumber =
        allDreams.length + 1;

      /*
       * INSERT DREAM INTO SUPABASE
       */

      const insertResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/Dreams`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            apikey:
              process.env.SUPABASE_SERVICE_ROLE_KEY,

            Authorization:
              `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,

            Prefer: "return=minimal"
          },

          body: JSON.stringify({
            stripe_session_id: session.id,

            dream_number:
              dreamNumber,

            nickname:
              String(
                dream.nickname || ""
              ).slice(0, 40),

            dream_text:
              String(
                dream.dream_text || ""
              ).slice(0, 280),

            country:
              String(
                dream.country || ""
              ).slice(0, 60),

            instagram:
              String(
                dream.instagram || ""
              ).slice(0, 60),

            tiktok:
              String(
                dream.tiktok || ""
              ).slice(0, 60)
          })
        }
      );

      if (!insertResponse.ok) {
        const errorText =
          await insertResponse.text();

        if (insertResponse.status === 409) {
          console.log(
            "DREAM ALREADY EXISTS:",
            session.id
          );

          return res.status(200).json({
            received: true,
            duplicate: true
          });
        }

        throw new Error(
          `Supabase insert failed: ${errorText}`
        );
      }

      console.log(
        "DREAM SAVED:",
        dreamNumber
      );
    }

    return res.status(200).json({
      received: true
    });

  } catch (error) {
    console.error(
      "WEBHOOK ERROR:",
      error
    );

    return res.status(400).json({
      error: "Webhook error",
      details: error.message
    });
  }
};
```
