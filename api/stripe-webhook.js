```javascript
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    /*
     * Vercel deve passare il body RAW a Stripe.
     */
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return res.status(400).json({
        error: "Missing Stripe signature"
      });
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    /*
     * Ci interessa solamente quando Stripe
     * conferma il checkout completato.
     */
    if (event.type !== "checkout.session.completed") {
      return res.status(200).json({
        received: true
      });
    }

    const session = event.data.object;

    /*
     * Sicurezza:
     * il dream viene creato SOLO se Stripe
     * dice che il pagamento è realmente pagato.
     */
    if (session.payment_status !== "paid") {
      return res.status(200).json({
        received: true,
        paid: false
      });
    }

    const metadata = session.metadata || {};

    const nickname = metadata.nickname || "";
    const dream_text = metadata.dream_text || "";
    const country = metadata.country || "";
    const instagram = metadata.instagram || "";
    const tiktok = metadata.tiktok || "";

    if (!nickname || !dream_text || !country) {
      throw new Error("Missing dream metadata");
    }

    /*
     * SUPABASE
     */

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are missing");
    }

    /*
     * EVITIAMO DOPPI DREAM
     *
     * Stripe può ritentare un webhook.
     * Controlliamo se questa sessione è già stata salvata.
     */

    const existingResponse = await fetch(
      `${supabaseUrl}/rest/v1/Dreams?select=id,dream_number&stripe_session_id=eq.${encodeURIComponent(session.id)}&limit=1`,
      {
        method: "GET",
        headers: {
          apikey: supabaseKey,
          Authorization: "Bearer " + supabaseKey
        }
      }
    );

    const existingText = await existingResponse.text();

    if (!existingResponse.ok) {
      throw new Error(
        "Unable to check existing dream: " + existingText
      );
    }

    const existingDreams = JSON.parse(existingText);

    if (existingDreams.length > 0) {
      return res.status(200).json({
        received: true,
        already_created: true,
        dream_number: existingDreams[0].dream_number
      });
    }

    /*
     * TROVA L'ULTIMO DREAM NUMBER
     */

    const lastResponse = await fetch(
      `${supabaseUrl}/rest/v1/Dreams?select=dream_number&order=dream_number.desc&limit=1`,
      {
        method: "GET",
        headers: {
          apikey: supabaseKey,
          Authorization: "Bearer " + supabaseKey
        }
      }
    );

    const lastText = await lastResponse.text();

    if (!lastResponse.ok) {
      throw new Error(
        "Unable to read last dream number: " + lastText
      );
    }

    const lastDreams = JSON.parse(lastText);

    const lastNumber =
      lastDreams.length > 0
        ? Number(lastDreams[0].dream_number) || 0
        : 0;

    const nextNumber = lastNumber + 1;

    /*
     * MASSIMO 1.000.000
     */

    if (nextNumber > 1000000) {
      throw new Error(
        "All one million dreams have already been claimed"
      );
    }

    /*
     * CREA IL DREAM
     */

    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/Dreams`,
      {
        method: "POST",

        headers: {
          apikey: supabaseKey,
          Authorization: "Bearer " + supabaseKey,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },

        body: JSON.stringify({
          dream_number: nextNumber,
          nickname: nickname,
          dream_text: dream_text,
          country: country,
          instagram: instagram,
          tiktok: tiktok,
          stripe_session_id: session.id
        })
      }
    );

    const insertText = await insertResponse.text();

    if (!insertResponse.ok) {
      throw new Error(
        "Unable to create dream: " + insertText
      );
    }

    const insertedDream = JSON.parse(insertText);

    console.log(
      "DREAM CREATED:",
      insertedDream
    );

    return res.status(200).json({
      received: true,
      paid: true,
      dream_number: nextNumber
    });

  } catch (error) {
    console.error(
      "STRIPE WEBHOOK ERROR:",
      error
    );

    return res.status(400).json({
      error: "Webhook error",
      details: error.message
    });
  }
};
```
