import Stripe from "stripe";

const ONE_MILLION = 1000000;
const DEFAULT_SITE_URL = "https://onedreameach.com";
const EMAIL_FROM = "OneDreamEach <dreams@onedreameach.com>";


/*
 * =========================================================
 * RESPONSE HELPERS
 * =========================================================
 */

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "content-type":
          "application/json; charset=UTF-8"
      }
    }
  );
}


function htmlResponse(
  html,
  status = 200,
  extraHeaders = {}
) {
  return new Response(
    html,
    {
      status,
      headers: {
        "content-type":
          "text/html; charset=UTF-8",
        ...extraHeaders
      }
    }
  );
}


function xmlResponse(
  xml,
  status = 200
) {
  return new Response(
    xml,
    {
      status,
      headers: {
        "content-type":
          "application/xml; charset=UTF-8",

        "cache-control":
          "public, s-maxage=300, stale-while-revalidate=3600"
      }
    }
  );
}


/*
 * =========================================================
 * SUPABASE PUBLIC KEY
 * =========================================================
 *
 * Public read endpoints use ANON when available.
 * SERVICE_ROLE is a server-side fallback.
 */

function getSupabaseReadKey(env) {
  return (
    env.SUPABASE_ANON_KEY ||
    env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  );
}


/*
 * =========================================================
 * ESCAPE HTML
 * =========================================================
 */

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/*
 * =========================================================
 * ESCAPE XML
 * =========================================================
 */

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}


/*
 * =========================================================
 * CONFIRMATION EMAIL HTML
 * =========================================================
 */

function buildEmailHtml({
  paddedNumber,
  nickname,
  dreamText,
  country,
  dreamUrl,
  cardUrl,
  remaining
}) {

  const safeNickname =
    escapeHtml(nickname);

  const safeDream =
    escapeHtml(dreamText);

  const safeCountry =
    escapeHtml(country);

  const safeRemaining =
    Number(remaining)
      .toLocaleString("en-US");


  return `
<!doctype html>

<html>

<head>

  <meta charset="utf-8">

  <meta
    name="viewport"
    content="width=device-width,initial-scale=1"
  >

</head>


<body
  style="
    margin:0;
    padding:0;
    background:#050505;
    color:#E8E8ED;
    font-family:Arial,Helvetica,sans-serif;
  "
>

  <div
    style="
      max-width:620px;
      margin:0 auto;
      padding:38px 18px 50px;
      text-align:center;
    "
  >

    <img
      src="https://onedreameach.com/logo.png"
      alt="OneDreamEach"
      width="230"
      style="
        max-width:230px;
        width:100%;
        height:auto;
        margin-bottom:28px;
      "
    >


    <div
      style="
        color:#A78BFA;
        font-size:11px;
        font-weight:700;
        letter-spacing:3px;
        margin-bottom:18px;
      "
    >
      YOU ARE NOW PART OF IT
    </div>


    <h1
      style="
        color:#fff;
        font-size:40px;
        line-height:1.08;
        margin:0 0 22px;
      "
    >
      Your dream has
      <br>

      <span
        style="
          color:#A78BFA;
        "
      >
        a place.
      </span>
    </h1>


    <div
      style="
        color:#8B5CF6;
        font-size:12px;
        font-weight:800;
        letter-spacing:4px;
      "
    >
      DREAM
    </div>


    <div
      style="
        color:#fff;
        font-size:54px;
        font-weight:900;
        margin:4px 0 20px;
      "
    >
      #${paddedNumber}
    </div>


    <p
      style="
        color:#A7A7B2;
        font-size:16px;
        line-height:1.7;
      "
    >
      ${safeNickname},
      your dream is now officially
      part of OneDreamEach.
    </p>


    <div
      style="
        border:1px solid rgba(167,139,250,.25);
        border-radius:18px;
        background:#0A0A0F;
        padding:28px;
        text-align:left;
        margin-top:30px;
      "
    >

      <div
        style="
          color:#A78BFA;
          font-size:10px;
          font-weight:800;
          letter-spacing:2px;
        "
      >
        YOUR DREAM
      </div>


      <div
        style="
          color:#F3F3F5;
          font-size:23px;
          line-height:1.45;
          font-weight:700;
          margin-top:14px;
        "
      >
        &ldquo;${safeDream}&rdquo;
      </div>


      <div
        style="
          margin-top:22px;
          padding-top:18px;
          border-top:1px solid #202027;
          color:#8D8D98;
          font-size:13px;
        "
      >
        ${safeNickname} · ${safeCountry}
      </div>

    </div>


    <p
      style="
        color:#A7A7B2;
        font-size:14px;
        line-height:1.6;
        margin-top:34px;
      "
    >
      Your official
      <strong style="color:#fff;">
        9:16 Dream Card
      </strong>
      is ready.
    </p>


    <a href="${cardUrl}">

      <img
        src="${cardUrl}"
        alt="Dream #${paddedNumber}"
        width="340"
        style="
          display:block;
          width:100%;
          max-width:340px;
          height:auto;
          margin:0 auto;
          border:1px solid #30233F;
          border-radius:18px;
        "
      >

    </a>


    <p
      style="
        margin-top:32px;
      "
    >

      <a
        href="${dreamUrl}"
        style="
          display:inline-block;
          width:82%;
          max-width:420px;
          padding:17px 18px;
          background:#7C3AED;
          border-radius:12px;
          color:#fff;
          font-size:14px;
          font-weight:800;
          text-decoration:none;
        "
      >
        VIEW MY DREAM
      </a>

    </p>


    <p>

      <a
        href="${cardUrl}"
        style="
          display:inline-block;
          width:82%;
          max-width:420px;
          padding:16px 18px;
          background:#0D0D13;
          border:1px solid #353540;
          border-radius:12px;
          color:#E8E8ED;
          font-size:13px;
          font-weight:800;
          text-decoration:none;
        "
      >
        OPEN / SAVE MY DREAM CARD
      </a>

    </p>


    <div
      style="
        margin-top:38px;
        color:#fff;
        font-size:23px;
        font-weight:800;
      "
    >
      Help us find the next dream.
    </div>


    <div
      style="
        margin-top:14px;
        color:#93939D;
        font-size:14px;
        line-height:1.7;
      "
    >
      Share your Dream Card on
      TikTok or Instagram.

      <br>

      Tag
      <strong
        style="
          color:#D8D8E0;
        "
      >
        @onedreameach
      </strong>

      and use

      <strong
        style="
          color:#A78BFA;
        "
      >
        #OneDreamEach
      </strong>.
    </div>


    <div
      style="
        margin:28px auto 0;
        max-width:460px;
        background:#09090D;
        border:1px solid #202027;
        border-radius:14px;
        padding:24px 15px;
      "
    >

      <div
        style="
          color:#A78BFA;
          font-size:11px;
          font-weight:800;
          letter-spacing:2px;
        "
      >
        ONE MILLION DREAM CHALLENGE
      </div>


      <div
        style="
          margin-top:12px;
          color:#fff;
          font-size:27px;
          font-weight:900;
        "
      >
        ${paddedNumber} / 1,000,000
      </div>


      <div
        style="
          margin-top:7px;
          color:#777782;
          font-size:13px;
        "
      >
        ${safeRemaining}
        dreams still waiting.
      </div>

    </div>

  </div>

</body>

</html>
`;

}


/*
 * =========================================================
 * GET DREAM EMAIL STATE
 * =========================================================
 */

async function getDreamEmailState(
  env,
  stripeSessionId
) {

  const url =
    env.SUPABASE_URL +
    "/rest/v1/Dreams" +
    "?select=dream_number,confirmation_email_sent_at" +
    "&stripe_session_id=eq." +
    encodeURIComponent(
      stripeSessionId
    ) +
    "&limit=1";


  const response =
    await fetch(
      url,
      {
        headers: {

          apikey:
            env.SUPABASE_SERVICE_ROLE_KEY,

          Authorization:
            "Bearer " +
            env.SUPABASE_SERVICE_ROLE_KEY

        }
      }
    );


  const text =
    await response.text();


  if (!response.ok) {

    throw new Error(
      "Unable to read dream email state: " +
      text
    );

  }


  const rows =
    text
      ? JSON.parse(text)
      : [];


  if (
    !Array.isArray(rows) ||
    rows.length === 0
  ) {

    throw new Error(
      "Dream not found after creation"
    );

  }


  return rows[0];

}


/*
 * =========================================================
 * MARK CONFIRMATION EMAIL AS SENT
 * =========================================================
 */

async function markEmailAsSent(
  env,
  stripeSessionId
) {

  const url =
    env.SUPABASE_URL +
    "/rest/v1/Dreams" +
    "?stripe_session_id=eq." +
    encodeURIComponent(
      stripeSessionId
    ) +
    "&confirmation_email_sent_at=is.null";


  const response =
    await fetch(
      url,
      {
        method:
          "PATCH",

        headers: {

          "Content-Type":
            "application/json",

          apikey:
            env.SUPABASE_SERVICE_ROLE_KEY,

          Authorization:
            "Bearer " +
            env.SUPABASE_SERVICE_ROLE_KEY,

          Prefer:
            "return=minimal"

        },

        body:
          JSON.stringify({
            confirmation_email_sent_at:
              new Date()
                .toISOString()
          })

      }
    );


  const text =
    await response.text();


  if (!response.ok) {

    throw new Error(
      "Unable to mark email as sent: " +
      text
    );

  }

}


/*
 * =========================================================
 * SEND CONFIRMATION EMAIL
 * =========================================================
 */

async function sendConfirmationEmail(
  env,
  {
    customerEmail,
    sessionId,
    paddedNumber,
    nickname,
    dreamText,
    country,
    dreamUrl,
    cardUrl,
    remaining
  }
) {

  const subject =
    "💭 Your Dream #" +
    paddedNumber +
    " is now part of OneDreamEach";


  const html =
    buildEmailHtml({
      paddedNumber,
      nickname,
      dreamText,
      country,
      dreamUrl,
      cardUrl,
      remaining
    });


  const response =
    await fetch(
      "https://api.resend.com/emails",
      {
        method:
          "POST",

        headers: {

          Authorization:
            "Bearer " +
            env.RESEND_API_KEY,

          "Content-Type":
            "application/json",

          "Idempotency-Key":
            "dream-confirmation/" +
            sessionId

        },

        body:
          JSON.stringify({

            from:
              EMAIL_FROM,

            to: [
              customerEmail
            ],

            subject:
              subject,

            html:
              html

          })

      }
    );


  const text =
    await response.text();


  if (!response.ok) {

    throw new Error(
      "Resend error: " +
      text
    );

  }


  return text
    ? JSON.parse(text)
    : {};

}


/*
 * =========================================================
 * CHECKOUT
 * =========================================================
 */

async function handleCheckout(
  request,
  env
) {

  if (
    request.method !==
    "POST"
  ) {

    return json(
      {
        error:
          "Method not allowed"
      },
      405
    );

  }


  try {

    const body =
      await request.json();


    const nickname =
      String(
        body.nickname || ""
      ).trim();


    const dreamText =
      String(
        body.dream_text || ""
      ).trim();


    const country =
      String(
        body.country || ""
      ).trim();


    const instagram =
      String(
        body.instagram || ""
      ).trim();


    const tiktok =
      String(
        body.tiktok || ""
      ).trim();


    if (
      !nickname ||
      !dreamText ||
      !country
    ) {

      return json(
        {
          error:
            "Nickname, dream and country are required."
        },
        400
      );

    }


    if (
      !env.STRIPE_SECRET_KEY
    ) {

      throw new Error(
        "STRIPE_SECRET_KEY is missing"
      );

    }


    const stripe =
      new Stripe(
        env.STRIPE_SECRET_KEY
      );


    const siteUrl =
      String(
        env.SITE_URL ||
        DEFAULT_SITE_URL
      )
        .replace(
          /\/+$/,
          ""
        );


    const session =
      await stripe
        .checkout
        .sessions
        .create({

          mode:
            "payment",


          line_items: [

            {

              price_data: {

                currency:
                  "eur",

                product_data: {

                  name:
                    "One Dream Each",

                  description:
                    "One place. One dream."

                },

                unit_amount:
                  100

              },


              quantity:
                1

            }

          ],


          success_url:
            siteUrl +
            "/success.html?session_id={CHECKOUT_SESSION_ID}",


          cancel_url:
            siteUrl +
            "/#leave",


          metadata: {

            nickname:
              nickname.slice(
                0,
                40
              ),

            dream_text:
              dreamText.slice(
                0,
                280
              ),

            country:
              country.slice(
                0,
                60
              ),

            instagram:
              instagram.slice(
                0,
                60
              ),

            tiktok:
              tiktok.slice(
                0,
                60
              )

          }

        });


    return json({
      url:
        session.url
    });

  }


  catch (error) {

    console.error(
      "CHECKOUT ERROR:",
      error
    );


    return json(
      {

        error:
          "Unable to create checkout",

        details:
          error?.message ||
          String(error)

      },
      500
    );

  }

}


/*
 * =========================================================
 * STRIPE WEBHOOK
 * =========================================================
 */

async function handleStripeWebhook(
  request,
  env
) {

  if (
    request.method !==
    "POST"
  ) {

    return json(
      {
        error:
          "Method not allowed"
      },
      405
    );

  }


  try {

    const signature =
      request.headers.get(
        "stripe-signature"
      );


    if (!signature) {

      return json(
        {
          error:
            "Missing Stripe signature"
        },
        400
      );

    }


    if (
      !env.STRIPE_SECRET_KEY
    ) {

      throw new Error(
        "STRIPE_SECRET_KEY is missing"
      );

    }


    if (
      !env.STRIPE_WEBHOOK_SECRET
    ) {

      throw new Error(
        "STRIPE_WEBHOOK_SECRET is missing"
      );

    }


    /*
     * Stripe requires the exact
     * unmodified request body.
     */

    const rawBody =
      await request.text();


    const stripe =
      new Stripe(
        env.STRIPE_SECRET_KEY
      );


    const event =
      await stripe
        .webhooks
        .constructEventAsync(

          rawBody,

          signature,

          env.STRIPE_WEBHOOK_SECRET

        );


    if (
      event.type !==
      "checkout.session.completed"
    ) {

      return json({

        received:
          true,

        ignored:
          true

      });

    }


    const session =
      event.data.object;


    if (
      session.payment_status !==
      "paid"
    ) {

      return json({

        received:
          true,

        paid:
          false

      });

    }


    const metadata =
      session.metadata || {};


    const nickname =
      String(
        metadata.nickname || ""
      )
        .trim()
        .slice(
          0,
          40
        );


    const dreamText =
      String(
        metadata.dream_text || ""
      )
        .trim()
        .slice(
          0,
          280
        );


    const country =
      String(
        metadata.country || ""
      )
        .trim()
        .slice(
          0,
          60
        );


    const instagram =
      String(
        metadata.instagram || ""
      )
        .trim()
        .slice(
          0,
          60
        );


    const tiktok =
      String(
        metadata.tiktok || ""
      )
        .trim()
        .slice(
          0,
          60
        );


    if (
      !nickname ||
      !dreamText ||
      !country
    ) {

      throw new Error(
        "Missing dream metadata"
      );

    }


    const customerEmail =
      String(

        session
          .customer_details
          ?.email ||

        session
          .customer_email ||

        ""

      )
        .trim()
        .toLowerCase();


    if (
      !env.SUPABASE_URL
    ) {

      throw new Error(
        "SUPABASE_URL is missing"
      );

    }


    if (
      !env.SUPABASE_SERVICE_ROLE_KEY
    ) {

      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is missing"
      );

    }


    /*
     * ATOMIC DREAM CREATION
     */

    const rpcResponse =
      await fetch(

        env.SUPABASE_URL +
        "/rest/v1/rpc/create_paid_dream",

        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json",

            apikey:
              env.SUPABASE_SERVICE_ROLE_KEY,

            Authorization:
              "Bearer " +
              env.SUPABASE_SERVICE_ROLE_KEY

          },


          body:
            JSON.stringify({

              p_stripe_session_id:
                session.id,

              p_nickname:
                nickname,

              p_dream_text:
                dreamText,

              p_country:
                country,

              p_instagram:
                instagram,

              p_tiktok:
                tiktok

            })

        }

      );


    const rpcText =
      await rpcResponse.text();


    if (
      !rpcResponse.ok
    ) {

      throw new Error(
        "Unable to create dream: " +
        rpcText
      );

    }


    const result =
      rpcText
        ? JSON.parse(
            rpcText
          )
        : [];


    if (
      !Array.isArray(result) ||
      result.length === 0
    ) {

      throw new Error(
        "Database function returned no dream"
      );

    }


    const dream =
      result[0];


    const dreamNumber =
      Number(
        dream.dream_number
      );


    if (
      !Number.isFinite(
        dreamNumber
      )
    ) {

      throw new Error(
        "Invalid dream number"
      );

    }


    const paddedNumber =
      String(
        dreamNumber
      )
        .padStart(
          6,
          "0"
        );


    const siteUrl =
      String(
        env.SITE_URL ||
        DEFAULT_SITE_URL
      )
        .replace(
          /\/+$/,
          ""
        );


    const dreamUrl =
      siteUrl +
      "/dream/" +
      encodeURIComponent(
        dreamNumber
      );


    const cardUrl =
      siteUrl +
      "/api/og?number=" +
      encodeURIComponent(
        dreamNumber
      ) +
      "&mode=story";


    const remaining =
      Math.max(
        0,
        ONE_MILLION -
        dreamNumber
      );


    let emailSent =
      false;


    let emailSkipped =
      false;


    let emailId =
      null;


    if (
      !customerEmail
    ) {

      emailSkipped =
        true;

    }


    else {

      if (
        !env.RESEND_API_KEY
      ) {

        throw new Error(
          "RESEND_API_KEY is missing"
        );

      }


      const emailState =
        await getDreamEmailState(
          env,
          session.id
        );


      if (
        emailState
          .confirmation_email_sent_at
      ) {

        emailSkipped =
          true;

      }


      else {

        const emailResult =
          await sendConfirmationEmail(
            env,
            {

              customerEmail,

              sessionId:
                session.id,

              paddedNumber,

              nickname,

              dreamText,

              country,

              dreamUrl,

              cardUrl,

              remaining

            }
          );


        emailId =
          emailResult?.id ||
          null;


        await markEmailAsSent(
          env,
          session.id
        );


        emailSent =
          true;

      }

    }


    return json({

      received:
        true,

      paid:
        true,

      already_created:
        Boolean(
          dream.already_created
        ),

      dream_number:
        dreamNumber,

      confirmation_email_sent:
        emailSent,

      confirmation_email_skipped:
        emailSkipped,

      email_id:
        emailId

    });

  }


  catch (error) {

    console.error(
      "STRIPE WEBHOOK ERROR:",
      error
    );


    return json(
      {

        error:
          "Webhook processing error",

        details:
          error?.message ||
          String(error)

      },
      500
    );

  }

}


/*
 * =========================================================
 * DREAM STATUS
 * =========================================================
 *
 * Used by success.html after Stripe Checkout.
 */

async function handleDreamStatus(
  request,
  env
) {

  try {

    if (
      request.method !==
      "GET"
    ) {

      return json(
        {
          error:
            "Method not allowed"
        },
        405
      );

    }


    const url =
      new URL(
        request.url
      );


    const sessionId =
      String(
        url.searchParams
          .get(
            "session_id"
          ) ||
        ""
      ).trim();


    if (
      !sessionId
    ) {

      return json(
        {
          error:
            "Session ID required"
        },
        400
      );

    }


    if (
      !sessionId.startsWith(
        "cs_"
      )
    ) {

      return json(
        {
          error:
            "Invalid session ID"
        },
        400
      );

    }


    if (
      !env.STRIPE_SECRET_KEY
    ) {

      throw new Error(
        "STRIPE_SECRET_KEY is missing"
      );

    }


    const stripe =
      new Stripe(
        env.STRIPE_SECRET_KEY
      );


    const session =
      await stripe
        .checkout
        .sessions
        .retrieve(
          sessionId
        );


    if (
      session.payment_status !==
      "paid"
    ) {

      return json({

        ready:
          false,

        paid:
          false,

        message:
          "Payment is not confirmed yet."

      });

    }


    const supabaseUrl =
      env.SUPABASE_URL;


    const supabaseKey =
      env.SUPABASE_SERVICE_ROLE_KEY ||
      env.SUPABASE_ANON_KEY;


    if (
      !supabaseUrl ||
      !supabaseKey
    ) {

      throw new Error(
        "Supabase environment variables are missing"
      );

    }


    const dreamUrl =
      supabaseUrl +
      "/rest/v1/Dreams" +
      "?select=dream_number,nickname,dream_text,country,created_at" +
      "&stripe_session_id=eq." +
      encodeURIComponent(
        sessionId
      ) +
      "&limit=1";


    const response =
      await fetch(
        dreamUrl,
        {

          method:
            "GET",

          headers: {

            apikey:
              supabaseKey,

            Authorization:
              "Bearer " +
              supabaseKey

          }

        }
      );


    const responseText =
      await response.text();


    if (
      !response.ok
    ) {

      throw new Error(
        "Supabase request failed: " +
        responseText
      );

    }


    const dreams =
      responseText
        ? JSON.parse(
            responseText
          )
        : [];


    /*
     * Payment exists but webhook
     * may still be creating dream.
     */

    if (
      !Array.isArray(
        dreams
      ) ||
      dreams.length === 0
    ) {

      return json({

        ready:
          false,

        paid:
          true,

        message:
          "Dream is being created."

      });

    }


    const dream =
      dreams[0];


    return json({

      ready:
        true,

      paid:
        true,

      dream_number:
        dream.dream_number,

      nickname:
        dream.nickname || "",

      dream_text:
        dream.dream_text || "",

      country:
        dream.country || "",

      dream_url:
        "/dream/" +
        dream.dream_number

    });

  }


  catch (error) {

    console.error(
      "DREAM STATUS ERROR:",
      error
    );


    return json(
      {

        error:
          "Unable to check dream status",

        details:
          error?.message ||
          String(error)

      },
      500
    );

  }

}


/*
 * =========================================================
 * SINGLE DREAM API
 * =========================================================
 */

async function handleDream(
  request,
  env
) {

  try {

    if (
      request.method !==
      "GET"
    ) {

      return json(
        {
          error:
            "Method not allowed"
        },
        405
      );

    }


    const requestUrl =
      new URL(
        request.url
      );


    const dreamNumber =
      requestUrl
        .searchParams
        .get(
          "number"
        );


    if (
      !dreamNumber
    ) {

      return json(
        {
          error:
            "Dream number required"
        },
        400
      );

    }


    const supabaseUrl =
      env.SUPABASE_URL;


    const supabaseKey =
      getSupabaseReadKey(
        env
      );


    if (
      !supabaseUrl ||
      !supabaseKey
    ) {

      return json(
        {
          error:
            "Supabase environment variables are missing"
        },
        500
      );

    }


    const url =
      supabaseUrl +
      "/rest/v1/Dreams" +
      "?select=id,dream_number,nickname,dream_text,country,instagram,tiktok,created_at" +
      "&dream_number=eq." +
      encodeURIComponent(
        dreamNumber
      ) +
      "&limit=1";


    const response =
      await fetch(
        url,
        {

          method:
            "GET",

          headers: {

            apikey:
              supabaseKey,

            Authorization:
              "Bearer " +
              supabaseKey

          }

        }
      );


    const responseText =
      await response.text();


    if (
      !response.ok
    ) {

      return json(
        {

          error:
            "Supabase request failed",

          status:
            response.status,

          details:
            responseText

        },
        500
      );

    }


    const dreams =
      responseText
        ? JSON.parse(
            responseText
          )
        : [];


    if (
      !Array.isArray(
        dreams
      ) ||
      dreams.length === 0
    ) {

      return json(
        {
          error:
            "Dream not found"
        },
        404
      );

    }


    return json(
      dreams[0]
    );

  }


  catch (error) {

    console.error(
      "DREAM API ERROR:",
      error
    );


    return json(
      {

        error:
          "Unable to load dream",

        details:
          error?.message ||
          String(error)

      },
      500
    );

  }

}


/*
 * =========================================================
 * DREAMS API
 * =========================================================
 *
 * Pagination, search, country filter,
 * newest / oldest.
 */

async function handleDreams(
  request,
  env
) {

  try {

    if (
      request.method !==
      "GET"
    ) {

      return json(
        {
          error:
            "Method not allowed"
        },
        405
      );

    }


    const requestUrl =
      new URL(
        request.url
      );


    const page =
      Math.max(
        parseInt(
          requestUrl
            .searchParams
            .get(
              "page"
            ) ||
          "1",
          10
        ),
        1
      );


    const limit =
      Math.min(

        Math.max(
          parseInt(
            requestUrl
              .searchParams
              .get(
                "limit"
              ) ||
            "30",
            10
          ),
          1
        ),

        50

      );


    const sort =
      requestUrl
        .searchParams
        .get(
          "sort"
        ) === "oldest"
        ? "oldest"
        : "newest";


    const search =
      String(
        requestUrl
          .searchParams
          .get(
            "search"
          ) ||
        ""
      )
        .trim()
        .slice(
          0,
          100
        );


    const country =
      String(
        requestUrl
          .searchParams
          .get(
            "country"
          ) ||
        ""
      )
        .trim()
        .slice(
          0,
          60
        );


    const offset =
      (page - 1) *
      limit;


    const params =
      new URLSearchParams();


    params.set(
      "select",
      "id,dream_number,nickname,dream_text,country,instagram,tiktok,created_at"
    );


    params.set(
      "order",
      sort === "oldest"
        ? "dream_number.asc"
        : "dream_number.desc"
    );


    params.set(
      "limit",
      String(limit)
    );


    params.set(
      "offset",
      String(offset)
    );


    /*
     * SEARCH
     */

    if (
      search
    ) {

      const safeSearch =
        search.replace(
          /[%(),]/g,
          ""
        );


      params.set(
        "or",
        `(nickname.ilike.*${safeSearch}*,dream_text.ilike.*${safeSearch}*,country.ilike.*${safeSearch}*)`
      );

    }


    /*
     * COUNTRY
     */

    if (
      country &&
      country.toLowerCase() !==
      "all"
    ) {

      params.set(
        "country",
        `ilike.${country}`
      );

    }


    const supabaseUrl =
      env.SUPABASE_URL;


    const supabaseKey =
      getSupabaseReadKey(
        env
      );


    if (
      !supabaseUrl ||
      !supabaseKey
    ) {

      throw new Error(
        "Supabase environment variables are missing"
      );

    }


    const url =
      supabaseUrl +
      "/rest/v1/Dreams?" +
      params.toString();


    const response =
      await fetch(
        url,
        {

          headers: {

            apikey:
              supabaseKey,

            Authorization:
              "Bearer " +
              supabaseKey,

            Prefer:
              "count=exact"

          }

        }
      );


    const responseText =
      await response.text();


    if (
      !response.ok
    ) {

      return json(
        {

          error:
            "Supabase request failed",

          status:
            response.status,

          details:
            responseText

        },
        500
      );

    }


    const dreams =
      responseText
        ? JSON.parse(
            responseText
          )
        : [];


    const contentRange =
      response.headers
        .get(
          "content-range"
        );


    let count =
      0;


    if (
      contentRange &&
      contentRange.includes(
        "/"
      )
    ) {

      const totalPart =
        contentRange
          .split(
            "/"
          )
          .pop();


      if (
        totalPart &&
        totalPart !==
        "*"
      ) {

        count =
          Number(
            totalPart
          ) ||
          0;

      }

    }


    if (
      !contentRange
    ) {

      count =
        dreams.length;

    }


    const totalPages =
      count > 0
        ? Math.ceil(
            count /
            limit
          )
        : 0;


    const hasMore =
      page <
      totalPages;


    return json({

      count:
        count,

      page:
        page,

      limit:
        limit,

      totalPages:
        totalPages,

      hasMore:
        hasMore,

      dreams:
        dreams

    });

  }


  catch (error) {

    console.error(
      "DREAMS API ERROR:",
      error
    );


    return json(
      {

        error:
          "Unable to load dreams",

        details:
          error?.message ||
          String(error)

      },
      500
    );

  }

}


/*
 * =========================================================
 * SITEMAP
 * =========================================================
 */

async function handleSitemap(
  request,
  env
) {

  try {

    if (
      request.method !==
      "GET"
    ) {

      return new Response(
        "Method not allowed",
        {
          status:
            405
        }
      );

    }


    const supabaseUrl =
      env.SUPABASE_URL;


    const supabaseKey =
      getSupabaseReadKey(
        env
      );


    if (
      !supabaseUrl ||
      !supabaseKey
    ) {

      throw new Error(
        "Supabase environment variables are missing"
      );

    }


    const response =
      await fetch(

        supabaseUrl +
        "/rest/v1/Dreams" +
        "?select=dream_number,created_at" +
        "&order=dream_number.asc",

        {

          headers: {

            apikey:
              supabaseKey,

            Authorization:
              "Bearer " +
              supabaseKey

          }

        }

      );


    const text =
      await response.text();


    if (
      !response.ok
    ) {

      throw new Error(
        "Supabase request failed: " +
        text
      );

    }


    const dreams =
      text
        ? JSON.parse(
            text
          )
        : [];


    let urls =
      `
  <url>
    <loc>https://onedreameach.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://onedreameach.com/explore</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;


    dreams.forEach(
      function (
        dream
      ) {

        const number =
          dream.dream_number;


        if (
          !number
        ) {

          return;

        }


        const lastmod =
          dream.created_at
            ? new Date(
                dream.created_at
              )
                .toISOString()
            : null;


        urls +=
          `
  <url>
    <loc>${escapeXml(
      "https://onedreameach.com/dream/" +
      number
    )}</loc>
    ${
      lastmod
        ? `<lastmod>${lastmod}</lastmod>`
        : ""
    }
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;

      }
    );


    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${urls}
</urlset>`;


    return xmlResponse(
      xml
    );

  }


  catch (error) {

    console.error(
      "SITEMAP ERROR:",
      error
    );


    return new Response(
      "Unable to generate sitemap",
      {
        status:
          500,

        headers: {
          "content-type":
            "text/plain; charset=UTF-8"
        }
      }
    );

  }

}


/*
 * =========================================================
 * MAIN WORKER
 * =========================================================
 */

export default {

  async fetch(
    request,
    env
  ) {

    const url =
      new URL(
        request.url
      );


    const path =
      url.pathname;


    /*
     * =====================================================
     * API — CHECKOUT
     * =====================================================
     */

    if (
      path ===
      "/api/checkout"
    ) {

      return handleCheckout(
        request,
        env
      );

    }


    /*
     * =====================================================
     * API — STRIPE WEBHOOK
     * =====================================================
     */

    if (
      path ===
        "/api/stripe-webhook" ||
      path ===
        "/api/webhook"
    ) {

      return handleStripeWebhook(
        request,
        env
      );

    }


    /*
     * =====================================================
     * API — DREAM STATUS
     * =====================================================
     */

    if (
      path ===
      "/api/dream-status"
    ) {

      return handleDreamStatus(
        request,
        env
      );

    }


    /*
     * =====================================================
     * API — SINGLE DREAM
     * =====================================================
     */

    if (
      path ===
      "/api/dream"
    ) {

      return handleDream(
        request,
        env
      );

    }


    /*
     * =====================================================
     * API — DREAM LIST
     * =====================================================
     */

    if (
      path ===
      "/api/dreams"
    ) {

      return handleDreams(
        request,
        env
      );

    }


    /*
     * =====================================================
     * SITEMAP
     * =====================================================
     */

    if (
      path ===
      "/sitemap.xml"
    ) {

      return handleSitemap(
        request,
        env
      );

    }


    /*
     * =====================================================
     * EXPLORE FRIENDLY URL
     * =====================================================
     */

    if (
      path ===
      "/explore"
    ) {

      const assetUrl =
        new URL(
          "/explore.html",
          request.url
        );


      return env.ASSETS.fetch(

        new Request(
          assetUrl,
          request
        )

      );

    }


    /*
     * =====================================================
     * DREAM PAGE
     * =====================================================
     *
     * NOT YET MIGRATED.
     *
     * We will connect:
     *
     * /dream/12
     * /dream/13
     * /dream/14
     *
     * to src/dream-page.js in the next step.
     */


    /*
     * =====================================================
     * OG / DREAM CARD
     * =====================================================
     *
     * NOT YET MIGRATED.
     *
     * @vercel/og cannot simply be copied
     * into Cloudflare Worker unchanged.
     */


    /*
     * =====================================================
     * STATIC ASSETS
     * =====================================================
     */

    return env.ASSETS.fetch(
      request
    );

  }

};
