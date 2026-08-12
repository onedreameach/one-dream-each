module.exports = async function handler(req, res) {
  try {

    const {
      ImageResponse
    } = await import(
      "@vercel/og"
    );


    /*
     * DREAM NUMBER
     */

    const requestUrl =
      new URL(
        req.url,
        "https://onedreameach.com"
      );

    const number =
      requestUrl.searchParams.get(
        "number"
      );


    if (!number) {

      return res
        .status(400)
        .json({
          error:
            "Dream number required"
        });

    }


    /*
     * SUPABASE
     */

    const supabaseUrl =
      process.env.SUPABASE_URL;

    const supabaseKey =
      process.env.SUPABASE_ANON_KEY;


    if (
      !supabaseUrl ||
      !supabaseKey
    ) {

      return res
        .status(500)
        .json({
          error:
            "Supabase environment variables missing"
        });

    }


    const apiUrl =
      supabaseUrl +
      "/rest/v1/Dreams" +
      "?select=dream_number,nickname,dream_text,country" +
      "&dream_number=eq." +
      encodeURIComponent(
        number
      ) +
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


    const responseText =
      await response.text();


    if (!response.ok) {

      return res
        .status(500)
        .json({
          error:
            "Unable to load dream",

          details:
            responseText
        });

    }


    const dreams =
      responseText
        ? JSON.parse(
            responseText
          )
        : [];


    if (
      !Array.isArray(dreams) ||
      dreams.length === 0
    ) {

      return res
        .status(404)
        .json({
          error:
            "Dream not found"
        });

    }


    const dream =
      dreams[0];


    /*
     * SAFE VALUES
     */

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


    /*
     * DYNAMIC FONT SIZE
     */

    let dreamFontSize =
      58;


    if (
      dreamText.length > 160
    ) {

      dreamFontSize =
        42;

    }

    else if (
      dreamText.length > 100
    ) {

      dreamFontSize =
        48;

    }


    /*
     * CREATE OG IMAGE
     */

    const image =
      new ImageResponse(
        {
          type: "div",

          props: {

            style: {
              width:
                "100%",

              height:
                "100%",

              display:
                "flex",

              flexDirection:
                "column",

              justifyContent:
                "space-between",

              background:
                "radial-gradient(circle at 82% 12%, rgba(124,58,237,.34), transparent 34%), #050505",

              color:
                "#ffffff",

              padding:
                "68px 74px",

              fontFamily:
                "Arial, sans-serif"
            },

            children: [

              /*
               * HEADER
               */

              {
                type: "div",

                props: {

                  style: {
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "center"
                  },

                  children: [

                    {
                      type: "div",

                      props: {

                        style: {
                          display:
                            "flex",

                          alignItems:
                            "center",

                          gap:
                            "18px"
                        },

                        children: [

                          {
                            type: "div",

                            props: {

                              style: {
                                width:
                                  "54px",

                                height:
                                  "54px",

                                display:
                                  "flex",

                                justifyContent:
                                  "center",

                                alignItems:
                                  "center",

                                border:
                                  "1px solid rgba(167,139,250,.8)",

                                color:
                                  "#a78bfa",

                                fontSize:
                                  "25px",

                                fontWeight:
                                  700
                              },

                              children:
                                "1"
                            }
                          },

                          {
                            type: "div",

                            props: {

                              style: {
                                fontSize:
                                  "23px",

                                fontWeight:
                                  700,

                                letterSpacing:
                                  "3px"
                              },

                              children:
                                "ONE DREAM EACH"
                            }
                          }

                        ]
                      }
                    },


                    {
                      type: "div",

                      props: {

                        style: {
                          fontSize:
                            "19px",

                          color:
                            "#a78bfa",

                          letterSpacing:
                            "3px"
                        },

                        children:
                          "#" +
                          paddedNumber
                      }
                    }

                  ]
                }
              },


              /*
               * DREAM
               */

              {
                type: "div",

                props: {

                  style: {
                    display:
                      "flex",

                    flexDirection:
                      "column",

                    maxWidth:
                      "1000px"
                  },

                  children: [

                    {
                      type: "div",

                      props: {

                        style: {
                          fontSize:
                            "28px",

                          color:
                            "#8b8b95",

                          marginBottom:
                            "20px"
                        },

                        children:
                          nickname +
                          (
                            country
                              ? " · " +
                                country
                              : ""
                          )
                      }
                    },


                    {
                      type: "div",

                      props: {

                        style: {
                          fontSize:
                            dreamFontSize +
                            "px",

                          lineHeight:
                            1.15,

                          fontWeight:
                            700,

                          letterSpacing:
                            "-2px",

                          whiteSpace:
                            "pre-wrap"
                        },

                        children:
                          "“" +
                          dreamText +
                          "”"
                      }
                    }

                  ]
                }
              },


              /*
               * FOOTER
               */

              {
                type: "div",

                props: {

                  style: {
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "center",

                    fontSize:
                      "17px",

                    color:
                      "#777780"
                  },

                  children: [

                    {
                      type: "div",

                      props: {
                        children:
                          "One place. One dream."
                      }
                    },

                    {
                      type: "div",

                      props: {
                        children:
                          "onedreameach.com"
                      }
                    }

                  ]
                }
              }

            ]
          }
        },

        {
          width:
            1200,

          height:
            630
        }
      );


    const arrayBuffer =
      await image.arrayBuffer();


    res.setHeader(
      "Content-Type",
      "image/png"
    );


    res.setHeader(
      "Cache-Control",
      "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
    );


    return res
      .status(200)
      .send(
        Buffer.from(
          arrayBuffer
        )
      );

  }

  catch (error) {

    console.error(
      "OG IMAGE ERROR:",
      error
    );


    return res
      .status(500)
      .json({

        error:
          "Unable to generate OG image",

        details:
          error &&
          error.message
            ? error.message
            : String(error)

      });

  }
};
