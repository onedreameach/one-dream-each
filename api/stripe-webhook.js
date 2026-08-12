const Stripe = require("stripe");

const stripe =
  new Stripe(
    process.env.STRIPE_SECRET_KEY
  );


module.exports =
  async function handler(req, res) {

    if (
      req.method !== "POST"
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
       * STRIPE SIGNATURE
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
       * RAW BODY
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
       * VERIFY STRIPE EVENT
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
       * ONLY CHECKOUT COMPLETE
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
       * ONLY PAID SESSIONS
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
       * METADATA
       */

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


      /*
       * SUPABASE
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
       * ATOMIC DATABASE FUNCTION
       *
       * The database itself:
       * - locks numbering
       * - checks duplicate Stripe session
       * - chooses the next dream number
       * - inserts the dream
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


      console.log(
        dream.already_created
          ? "DREAM ALREADY EXISTS:"
          : "DREAM CREATED:",
        dream.dream_number
      );


      /*
       * SUCCESS
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
            dream.dream_number

        });

    }


    catch (error) {

      console.error(
        "STRIPE WEBHOOK ERROR:",
        error
      );


      return res
        .status(400)
        .json({

          error:
            "Webhook error",

          details:
            error &&
            error.message
              ? error.message
              : String(error)

        });

    }

  };
