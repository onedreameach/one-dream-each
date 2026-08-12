import React from "react";
import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge"
};

export default async function handler(request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const number =
      searchParams.get("number");

    if (!number) {
      return new Response(
        "Dream number required",
        {
          status: 400
        }
      );
    }

    const supabaseUrl =
      process.env.SUPABASE_URL;

    const supabaseKey =
      process.env.SUPABASE_ANON_KEY;

    if (
      !supabaseUrl ||
      !supabaseKey
    ) {
      return new Response(
        "Supabase environment variables missing",
        {
          status: 500
        }
      );
    }

    const apiUrl =
      supabaseUrl +
      "/rest/v1/Dreams" +
      "?select=dream_number,nickname,dream_text,country" +
      "&dream_number=eq." +
      encodeURIComponent(number) +
      "&limit=1";

    const response =
      await fetch(
        apiUrl,
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

    if (!response.ok) {
      return new Response(
        "Unable to load dream",
        {
          status: 500
        }
      );
    }

    const dreams =
      await response.json();

    if (
      !Array.isArray(dreams) ||
      dreams.length === 0
    ) {
      return new Response(
        "Dream not found",
        {
          status: 404
        }
      );
    }

    const dream =
      dreams[0];

    const paddedNumber =
      String(
        dream.dream_number
      ).padStart(
        6,
        "0"
      );

    const nickname =
      String(
        dream.nickname ||
        "Anonymous"
      ).slice(
        0,
        40
      );

    const dreamText =
      String(
        dream.dream_text ||
        ""
      ).slice(
        0,
        220
      );

    const country =
      String(
        dream.country ||
        ""
      ).slice(
        0,
        60
      );

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background:
              "radial-gradient(circle at 80% 10%, rgba(124,58,237,.35), transparent 35%), #050505",
            color: "#ffffff",
            padding: "70px",
            fontFamily:
              "Arial, sans-serif"
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px"
              }}
            >

              <div
                style={{
                  width: "54px",
                  height: "54px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border:
                    "1px solid rgba(167,139,250,.8)",
                  color:
                    "#a78bfa",
                  fontSize:
                    "25px",
                  fontWeight:
                    700
                }}
              >
                1
              </div>

              <div
                style={{
                  fontSize:
                    "24px",
                  fontWeight:
                    700,
                  letterSpacing:
                    "3px"
                }}
              >
                ONE DREAM EACH
              </div>

            </div>

            <div
              style={{
                fontSize:
                  "20px",
                color:
                  "#a78bfa",
                letterSpacing:
                  "3px"
              }}
            >
              #{paddedNumber}
            </div>

          </div>


          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              maxWidth:
                "980px"
            }}
          >

            <div
              style={{
                fontSize:
                  "30px",
                color:
                  "#8b8b95",
                marginBottom:
                  "22px"
              }}
            >
              {nickname}
              {country
                ? " · " +
                  country
                : ""}
            </div>

            <div
              style={{
                fontSize:
                  dreamText.length > 140
                    ? "47px"
                    : "58px",

                lineHeight:
                  1.15,

                fontWeight:
                  700,

                letterSpacing:
                  "-2px",

                whiteSpace:
                  "pre-wrap"
              }}
            >
              “{dreamText}”
            </div>

          </div>


          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              fontSize:
                "18px",
              color:
                "#777780"
            }}
          >

            <div>
              One place. One dream.
            </div>

            <div>
              onedreameach.com
            </div>

          </div>

        </div>
      ),
      {
        width: 1200,
        height: 630
      }
    );

  } catch (error) {

    console.error(
      "OG IMAGE ERROR:",
      error
    );

    return new Response(
      "Unable to generate image",
      {
        status: 500
      }
    );
  }
}
