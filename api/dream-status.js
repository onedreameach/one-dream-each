const Stripe = require("stripe");

const stripe =
  new Stripe(
    process.env.STRIPE_SECRET_KEY
  );


module.exports =
  async function handler(req, res) {

    try {

      /*
       * ONLY GET
       */

      if (
        req.method !== "GET"
      ) {

        return res
          .status(405)
          .json({
            error:
              "Method not allowed"
          });

      }


      /*
       * SESSION ID
       */

      const sessionId =
        String(
          req.query.session_id ||
          ""
        ).trim();


      if (!sessionId) {

        return res
          .status(400)
          .json({
            error:
              "Session ID required"
          });

      }


      /*
       * BASIC SESSION ID CHECK
       */

      if (
        !sessionId.startsWith(
          "cs_"
        )
      ) {

        return res
          .status(400)
          .json({
            error:
              "Invalid session ID"
          });

      }


      /*
       * VERIFY SESSION WITH STRIPE
       */

      const session =
        await stripe
          .checkout
          .sessions
          .retrieve(
            sessionId
          );


      /*
       * PAYMENT NOT COMPLETE
       */

      if (
        session.payment_status !==
        "paid"
      ) {

        return res
          .status(200)
          .json({
            ready:
              false,

            paid:
              false,

            message:
              "Payment is not confirmed yet."
          });

      }


      /*
       * SUPABASE
       *
       * This runs only on the server.
       */

      const supabaseUrl =
        process.env.SUPABASE_URL;


      const supabaseKey =
        process.env
          .SUPABASE_SERVICE_ROLE_KEY ||
        process.env
          .SUPABASE_ANON_KEY;


      if (
        !supabaseUrl ||
        !supabaseKey
      ) {

        throw new Error(
          "Supabase environment variables are missing"
        );

      }


      /*
       * FIND DREAM CREATED BY THIS
       * STRIPE CHECKOUT SESSION
       */

      const url =
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
       * PAYMENT IS CONFIRMED,
       * BUT WEBHOOK MAY STILL BE
       * SAVING THE DREAM.
       */

      if (
        !Array.isArray(dreams) ||
        dreams.length === 0
      ) {

        return res
          .status(200)
          .json({

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


      /*
       * READY
       */

      return res
        .status(200)
        .json({

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


      return res
        .status(500)
        .json({

          error:
            "Unable to check dream status",

          details:
            error &&
            error.message
              ? error.message
              : String(error)

        });

    }

  };
