const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return res.status(400).json({
        error: "Missing Stripe signature",
      });
    }

    /*
     * BODY RAW
     * Necessario per verificare la firma di Stripe.
     */
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }

    const rawBody = Buffer.concat(chunks);

    /*
     * VERIFICA WEBHOOK STRIPE
     */
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("STRIPE EVENT:", event.type);

    /*
     * Ignora tutti gli eventi che non ci interessano.
     */
    if (event.type !== "checkout.session.completed") {
      return res.status(200).json({
        received: true,
        ignored: true,
      });
    }

    const session = event.data.object;

    console.log("CHECKOUT SESSION:", session.id);
    console.log("PAYMENT STATUS:", session.payment_status);

    /*
     * Il dream viene creato SOLO dopo
     * un pagamento effettivamente completato.
     */
    if (session.payment_status !== "paid") {
      return res.status(200).json({
        received: true,
        paid: false,
      });
    }

    /*
     * METADATA
     */
    const metadata = session.metadata || {};

    const nickname =
      String(metadata.nickname || "").slice(0, 40);

    const dream_text =
      String(metadata.dream_text || "").slice(0, 280);

    const country =
      String(metadata.country || "").slice(0, 60);

    const instagram =
      String(metadata.instagram || "").slice(0, 60);

    const tiktok =
      String(metadata.tiktok || "").slice(0, 60);

    if (!nickname || !dream_text || !country) {
      throw new Error("Missing dream metadata");
    }

    /*
     * SUPABASE
     */
    const supabaseUrl =
      process.env.SUPABASE_URL;

    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL is missing");
    }

    if (!supabaseKey) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is missing"
      );
    }

    /*
     * ------------------------------------------------
     * CONTROLLA SE IL PAGAMENTO È GIÀ STATO SALVATO
     * ------------------------------------------------
     */

    const existingUrl =
      supabaseUrl +
      "/rest/v1/Dreams" +
      "?select=id,dream_number" +
      "&stripe_session_id=eq." +
      encodeURIComponent(session.id) +
      "&limit=1";

    const existingResponse = await fetch(
      existingUrl,
      {
        method: "GET",

        headers: {
          apikey: supabaseKey,
          Authorization:
            "Bearer " + supabaseKey,
        },
      }
    );

    const existingText =
      await existingResponse.text();

    if (!existingResponse.ok) {
      throw new Error(
        "Unable to check existing dream: " +
          existingText
      );
    }

    const existingDreams =
      existingText
        ? JSON.parse(existingText)
        : [];

    if (existingDreams.length > 0) {
      console.log(
        "DREAM ALREADY EXISTS:",
        session.id
      );

      return res.status(200).json({
        received: true,
        already_created: true,
        dream_number:
          existingDreams[0].dream_number,
      });
    }

    /*
     * ------------------------------------------------
     * TROVA L'ULTIMO DREAM NUMBER
     * ------------------------------------------------
     */

    const lastUrl =
      supabaseUrl +
      "/rest/v1/Dreams" +
      "?select=dream_number" +
      "&order=dream_number.desc" +
      "&limit=1";

    const lastResponse = await fetch(
      lastUrl,
      {
        method: "GET",

        headers: {
          apikey: supabaseKey,
          Authorization:
            "Bearer " + supabaseKey,
        },
      }
    );

    const lastText =
      await lastResponse.text();

    if (!lastResponse.ok) {
      throw new Error(
        "Unable to read last dream number: " +
          lastText
      );
    }

    const lastDreams =
      lastText
        ? JSON.parse(lastText)
        : [];

    const lastNumber =
      lastDreams.length > 0
        ? Number(
            lastDreams[0].dream_number
          ) || 0
        : 0;

    const nextNumber =
      lastNumber + 1;

    /*
     * MASSIMO 1.000.000
     */
    if (nextNumber > 1000000) {
      throw new Error(
        "All one million dreams have already been claimed"
      );
    }

    console.log(
      "CREATING DREAM:",
      nextNumber
    );

    /*
     * ------------------------------------------------
     * CREA IL DREAM
     * ------------------------------------------------
     */

    const insertUrl =
      supabaseUrl +
      "/rest/v1/Dreams";

    const insertResponse = await fetch(
      insertUrl,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          apikey: supabaseKey,

          Authorization:
            "Bearer " + supabaseKey,

          Prefer:
            "return=representation",
        },

        body: JSON.stringify({
          dream_number: nextNumber,

          nickname: nickname,

          dream_text: dream_text,

          country: country,

          instagram: instagram,

          tiktok: tiktok,

          stripe_session_id: session.id,
        }),
      }
    );

    const insertText =
      await insertResponse.text();

    if (!insertResponse.ok) {
      throw new Error(
        "Unable to create dream: " +
          insertText
      );
    }

    const insertedDream =
      insertText
        ? JSON.parse(insertText)
        : [];

    console.log(
      "DREAM CREATED:",
      insertedDream
    );

    /*
     * SUCCESS
     */
    return res.status(200).json({
      received: true,
      paid: true,
      dream_number: nextNumber,
    });

  } catch (error) {
    console.error(
      "STRIPE WEBHOOK ERROR:",
      error
    );

    return res.status(400).json({
      error: "Webhook error",
      details: error.message,
    });
  }
};
