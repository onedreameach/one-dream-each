const Stripe =
  require("stripe");


const stripe =
  new Stripe(
    process.env.STRIPE_SECRET_KEY
  );


/*
 * =====================================================
 * CONSTANTS
 * =====================================================
 */

const ONE_MILLION =
  1000000;


const DEFAULT_SITE_URL =
  "https://onedreameach.com";


const EMAIL_FROM =
  "OneDreamEach <dreams@onedreameach.com>";


/*
 * =====================================================
 * ESCAPE HTML
 * Protect email HTML from user-entered content.
 * =====================================================
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
 * =====================================================
 * GET DREAM EMAIL STATE
 * =====================================================
 */

async function getDreamEmailState({
  supabaseUrl,
  supabaseKey,
  stripeSessionId
}) {

  const url =
    supabaseUrl +
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


  if (!response.ok) {

    throw new Error(
      "Unable to read dream email state: " +
      responseText
    );

  }


  const rows =
    responseText
      ? JSON.parse(
          responseText
        )
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
 * =====================================================
 * MARK EMAIL AS SENT
 * =====================================================
 */

async function markEmailAsSent({
  supabaseUrl,
  supabaseKey,
  stripeSessionId
}) {

  const sentAt =
    new Date()
      .toISOString();


  const url =
    supabaseUrl +
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
            supabaseKey,

          Authorization:
            "Bearer " +
            supabaseKey,

          Prefer:
            "return=minimal"

        },

        body:
          JSON.stringify({

            confirmation_email_sent_at:
              sentAt

          })

      }
    );


  const responseText =
    await response.text();


  if (!response.ok) {

    throw new Error(
      "Unable to mark confirmation email as sent: " +
      responseText
    );

  }


  return sentAt;

}


/*
 * =====================================================
 * BUILD EMAIL HTML
 * =====================================================
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
    escapeHtml(
      nickname
    );


  const safeDream =
    escapeHtml(
      dreamText
    );


  const safeCountry =
    escapeHtml(
      country
    );


  const safeRemaining =
    Number(
      remaining
    )
      .toLocaleString(
        "en-US"
      );


  return `
<!doctype html>

<html>

<head>

  <meta charset="utf-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
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

  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="
      background:#050505;
      margin:0;
      padding:0;
    "
  >

    <tr>

      <td
        align="center"
        style="
          padding:
            38px 14px
            50px;
        "
      >

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width:100%;
            max-width:620px;
          "
        >


          <!-- BRAND -->

          <tr>

            <td
              align="center"
              style="
                padding-bottom:28px;
              "
            >

              <img
                src="https://onedreameach.com/logo.png"
                alt="OneDreamEach"
                width="230"
                style="
                  display:block;
                  max-width:230px;
                  width:100%;
                  height:auto;
                  border:0;
                "
              >

            </td>

          </tr>


          <!-- EYEBROW -->

          <tr>

            <td
              align="center"
              style="
                color:#A78BFA;
                font-size:11px;
                font-weight:700;
                letter-spacing:3px;
                padding-bottom:18px;
              "
            >

              YOU ARE NOW PART OF IT

            </td>

          </tr>


          <!-- TITLE -->

          <tr>

            <td
              align="center"
              style="
                color:#FFFFFF;
                font-size:40px;
                line-height:1.08;
                font-weight:800;
                letter-spacing:-1.5px;
                padding:
                  0 10px
                  18px;
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

            </td>

          </tr>


          <!-- NUMBER -->

          <tr>

            <td
              align="center"
              style="
                padding-bottom:10px;
              "
            >

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
                  margin-top:4px;
                  color:#FFFFFF;
                  font-size:54px;
                  font-weight:900;
                  letter-spacing:2px;
                "
              >
                #${paddedNumber}
              </div>

            </td>

          </tr>


          <!-- INTRO -->

          <tr>

            <td
              align="center"
              style="
                color:#A7A7B2;
                font-size:16px;
                line-height:1.7;
                padding:
                  8px 24px
                  30px;
              "
            >

              ${safeNickname}, your dream is now
              officially part of OneDreamEach.

              <br><br>

              You are one of the first people
              helping build a wall of
              <strong
                style="
                  color:#FFFFFF;
                "
              >
                1,000,000 human dreams.
              </strong>

            </td>

          </tr>


          <!-- DREAM -->

          <tr>

            <td>

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  border:
                    1px solid
                    rgba(167,139,250,.25);
                  border-radius:18px;
                  background:#0A0A0F;
                "
              >

                <tr>

                  <td
                    style="
                      padding:28px;
                    "
                  >

                    <div
                      style="
                        color:#A78BFA;
                        font-size:10px;
                        font-weight:800;
                        letter-spacing:2px;
                        margin-bottom:14px;
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
                      "
                    >
                      &ldquo;${safeDream}&rdquo;
                    </div>

                    <div
                      style="
                        margin-top:22px;
                        padding-top:18px;
                        border-top:
                          1px solid
                          #202027;
                        color:#8D8D98;
                        font-size:13px;
                      "
                    >
                      ${safeNickname}
                      &nbsp;&middot;&nbsp;
                      ${safeCountry}
                    </div>

                  </td>

                </tr>

              </table>

            </td>

          </tr>


          <!-- STORY CARD LABEL -->

          <tr>

            <td
              align="center"
              style="
                color:#A7A7B2;
                font-size:14px;
                line-height:1.6;
                padding:
                  34px 15px
                  16px;
              "
            >

              Your official
              <strong
                style="
                  color:#FFFFFF;
                "
              >
                9:16 Dream Card
              </strong>
              is ready.

              <br>

              Save it.
              Share it.
              Make your dream part of the story.

            </td>

          </tr>


          <!-- STORY CARD IMAGE -->

          <tr>

            <td
              align="center"
            >

              <a
                href="${cardUrl}"
                style="
                  text-decoration:none;
                "
              >

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
                    border:
                      1px solid
                      #30233F;
                    border-radius:18px;
                  "
                >

              </a>

            </td>

          </tr>


          <!-- VIEW DREAM CTA -->

          <tr>

            <td
              align="center"
              style="
                padding-top:32px;
              "
            >

              <a
                href="${dreamUrl}"
                style="
                  display:inline-block;
                  width:82%;
                  max-width:420px;
                  padding:
                    17px 18px;
                  background:#7C3AED;
                  border-radius:12px;
                  color:#FFFFFF;
                  font-size:14px;
                  font-weight:800;
                  text-decoration:none;
                  letter-spacing:.4px;
                "
              >
                VIEW MY DREAM
              </a>

            </td>

          </tr>


          <!-- CARD CTA -->

          <tr>

            <td
              align="center"
              style="
                padding-top:12px;
              "
            >

              <a
                href="${cardUrl}"
                style="
                  display:inline-block;
                  width:82%;
                  max-width:420px;
                  padding:
                    16px 18px;
                  background:#0D0D13;
                  border:
                    1px solid
                    #353540;
                  border-radius:12px;
                  color:#E8E8ED;
                  font-size:13px;
                  font-weight:800;
                  text-decoration:none;
                "
              >
                OPEN / SAVE MY DREAM CARD
              </a>

            </td>

          </tr>


          <!-- VIRAL SECTION -->

          <tr>

            <td
              align="center"
              style="
                padding:
                  38px 20px
                  10px;
              "
            >

              <div
                style="
                  color:#FFFFFF;
                  font-size:23px;
                  line-height:1.25;
                  font-weight:800;
                "
              >
                Help us find the
                <br>
                next dream.
              </div>

              <div
                style="
                  max-width:460px;
                  margin:14px auto 0;
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

            </td>

          </tr>


          <!-- PROGRESS -->

          <tr>

            <td
              align="center"
              style="
                padding:
                  28px 12px;
              "
            >

              <table
                role="presentation"
                cellspacing="0"
                cellpadding="0"
                border="0"
                width="100%"
                style="
                  max-width:460px;
                  background:#09090D;
                  border:
                    1px solid
                    #202027;
                  border-radius:14px;
                "
              >

                <tr>

                  <td
                    align="center"
                    style="
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
                        color:#FFFFFF;
                        font-size:27px;
                        font-weight:900;
                      "
                    >
                      ${paddedNumber}
                      / 1,000,000
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

                  </td>

                </tr>

              </table>

            </td>

          </tr>


          <!-- FINAL -->

          <tr>

            <td
              align="center"
              style="
                padding:
                  18px 20px
                  8px;
                color:#D8D8E0;
                font-size:18px;
                font-weight:700;
                line-height:1.5;
              "
            >

              One person.
              One dream.
              One place.

              <br>

              <span
                style="
                  color:#A78BFA;
                "
              >
                One million.
              </span>

            </td>

          </tr>


          <tr>

            <td
              align="center"
              style="
                padding:
                  22px 20px
                  6px;
                color:#555560;
                font-size:11px;
                line-height:1.6;
              "
            >

              This email was sent because
              Dream #${paddedNumber}
              was successfully claimed on
              OneDreamEach.

            </td>

          </tr>


          <tr>

            <td
              align="center"
              style="
                color:#6D6D78;
                font-size:11px;
                padding-bottom:20px;
              "
            >
              onedreameach.com
            </td>

          </tr>


        </table>

      </td>

    </tr>

  </table>

</body>

</html>
`;

}


/*
 * =====================================================
 * SEND CONFIRMATION EMAIL
 * =====================================================
 */

async function sendConfirmationEmail({
  resendApiKey,
  customerEmail,
  sessionId,
  paddedNumber,
  nickname,
  dreamText,
  country,
  dreamUrl,
  cardUrl,
  remaining
}) {

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


  const text =
    [
      "Your dream is now part of OneDreamEach.",
      "",
      "Dream #" + paddedNumber,
      "",
      '"' + dreamText + '"',
      "",
      nickname + " · " + country,
      "",
      "View your dream:",
      dreamUrl,
      "",
      "Open your 9:16 Dream Card:",
      cardUrl,
      "",
      "Share it and tag @onedreameach",
      "#OneDreamEach",
      "",
      remaining.toLocaleString("en-US") +
        " dreams still waiting.",
      "",
      "One person. One dream. One place. One million."
    ]
      .join("\n");


  const resendResponse =
    await fetch(
      "https://api.resend.com/emails",
      {

        method:
          "POST",

        headers: {

          Authorization:
            "Bearer " +
            resendApiKey,

          "Content-Type":
            "application/json",

          /*
           * Prevent duplicate email if
           * Stripe retries this webhook.
           */

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
              html,

            text:
              text

          })

      }
    );


  const resendText =
    await resendResponse.text();


  if (!resendResponse.ok) {

    throw new Error(
      "Resend error: " +
      resendText
    );

  }


  const resendData =
    resendText
      ? JSON.parse(
          resendText
        )
      : {};


  return resendData;

}


/*
 * =====================================================
 * WEBHOOK
 * =====================================================
 */

module.exports =
  async function handler(
    req,
    res
  ) {

    if (
      req.method !==
      "POST"
    ) {

      return res
        .status(405)
        .json({

          error:
            "Method not allowed"

        });

    }


    try {

      /*
       * =================================================
       * STRIPE SIGNATURE
       * =================================================
       */

      const signature =
        req.headers[
          "stripe-signature"
        ];


      if (!signature) {

        return res
          .status(400)
          .json({

            error:
              "Missing Stripe signature"

          });

      }


      /*
       * =================================================
       * RAW BODY
       * =================================================
       */

      const chunks =
        [];


      for await (
        const chunk of req
      ) {

        chunks.push(
          Buffer.from(
            chunk
          )
        );

      }


      const rawBody =
        Buffer.concat(
          chunks
        );


      /*
       * =================================================
       * VERIFY STRIPE EVENT
       * =================================================
       */

      const event =
        stripe.webhooks
          .constructEvent(

            rawBody,

            signature,

            process.env
              .STRIPE_WEBHOOK_SECRET

          );


      console.log(
        "STRIPE EVENT:",
        event.type
      );


      /*
       * =================================================
       * ONLY CHECKOUT COMPLETE
       * =================================================
       */

      if (
        event.type !==
        "checkout.session.completed"
      ) {

        return res
          .status(200)
          .json({

            received:
              true,

            ignored:
              true

          });

      }


      const session =
        event.data.object;


      console.log(
        "CHECKOUT SESSION:",
        session.id
      );


      console.log(
        "PAYMENT STATUS:",
        session.payment_status
      );


      /*
       * =================================================
       * ONLY PAID SESSIONS
       * =================================================
       */

      if (
        session.payment_status !==
        "paid"
      ) {

        return res
          .status(200)
          .json({

            received:
              true,

            paid:
              false

          });

      }


      /*
       * =================================================
       * METADATA
       * =================================================
       */

      const metadata =
        session.metadata || {};


      const nickname =
        String(
          metadata.nickname ||
          ""
        )
          .trim()
          .slice(
            0,
            40
          );


      const dreamText =
        String(
          metadata.dream_text ||
          ""
        )
          .trim()
          .slice(
            0,
            280
          );


      const country =
        String(
          metadata.country ||
          ""
        )
          .trim()
          .slice(
            0,
            60
          );


      const instagram =
        String(
          metadata.instagram ||
          ""
        )
          .trim()
          .slice(
            0,
            60
          );


      const tiktok =
        String(
          metadata.tiktok ||
          ""
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


      /*
       * =================================================
       * CUSTOMER EMAIL
       * =================================================
       *
       * Stripe Checkout supplies this
       * after the customer completes payment.
       */

      const customerEmail =
        String(

          (
            session
              .customer_details &&
            session
              .customer_details
              .email
          ) ||

          session
            .customer_email ||

          ""

        )
          .trim()
          .toLowerCase();


      /*
       * =================================================
       * SUPABASE
       * =================================================
       */

      const supabaseUrl =
        process.env
          .SUPABASE_URL;


      const supabaseKey =
        process.env
          .SUPABASE_SERVICE_ROLE_KEY;


      if (!supabaseUrl) {

        throw new Error(
          "SUPABASE_URL is missing"
        );

      }


      if (!supabaseKey) {

        throw new Error(
          "SUPABASE_SERVICE_ROLE_KEY is missing"
        );

      }


      /*
       * =================================================
       * CREATE DREAM ATOMICALLY
       * =================================================
       */

      const rpcResponse =
        await fetch(

          supabaseUrl +
          "/rest/v1/rpc/create_paid_dream",

          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json",

              apikey:
                supabaseKey,

              Authorization:
                "Bearer " +
                supabaseKey

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


      if (!rpcResponse.ok) {

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


      console.log(

        dream.already_created
          ? "DREAM ALREADY EXISTS:"
          : "DREAM CREATED:",

        paddedNumber

      );


      /*
       * =================================================
       * URLs
       * =================================================
       */

      const siteUrl =
        String(
          process.env.SITE_URL ||
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


      /*
       * =================================================
       * EMAIL STATE
       * =================================================
       */

      let emailSent =
        false;


      let emailSkipped =
        false;


      let emailId =
        null;


      /*
       * No customer email:
       * dream stays valid,
       * webhook still succeeds.
       */

      if (!customerEmail) {

        console.warn(
          "NO CUSTOMER EMAIL FOR DREAM:",
          paddedNumber
        );


        emailSkipped =
          true;

      }

      else {

        if (
          !process.env
            .RESEND_API_KEY
        ) {

          throw new Error(
            "RESEND_API_KEY is missing"
          );

        }


        /*
         * Check permanent DB protection.
         */

        const emailState =
          await getDreamEmailState({

            supabaseUrl,
            supabaseKey,

            stripeSessionId:
              session.id

          });


        if (
          emailState
            .confirmation_email_sent_at
        ) {

          console.log(
            "CONFIRMATION EMAIL ALREADY SENT:",
            paddedNumber
          );


          emailSkipped =
            true;

        }

        else {

          /*
           * =================================================
           * SEND EMAIL
           * =================================================
           */

          console.log(
            "SENDING CONFIRMATION EMAIL:",
            customerEmail
          );


          const emailResult =
            await sendConfirmationEmail({

              resendApiKey:
                process.env
                  .RESEND_API_KEY,

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

            });


          emailId =
            emailResult &&
            emailResult.id
              ? emailResult.id
              : null;


          console.log(
            "EMAIL SENT:",
            emailId ||
            paddedNumber
          );


          /*
           * =================================================
           * MARK AS SENT
           * =================================================
           *
           * Only after Resend confirms success.
           */

          await markEmailAsSent({

            supabaseUrl,
            supabaseKey,

            stripeSessionId:
              session.id

          });


          emailSent =
            true;

        }

      }


      /*
       * =================================================
       * SUCCESS
       * =================================================
       */

      return res
        .status(200)
        .json({

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


      /*
       * Important:
       *
       * If the Dream was already inserted,
       * create_paid_dream will NOT create
       * another one on Stripe retry.
       *
       * Returning 500 makes Stripe retry
       * transient webhook/email failures.
       *
       * Resend Idempotency-Key +
       * confirmation_email_sent_at protect
       * against duplicate emails.
       */

      return res
        .status(500)
        .json({

          error:
            "Webhook processing error",

          details:
            error &&
            error.message
              ? error.message
              : String(error)

        });

    }

  };
