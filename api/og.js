module.exports = async function handler(req, res) {
  try {
    const { ImageResponse } = await import("@vercel/og");

    const requestUrl = new URL(
      req.url,
      "https://onedreameach.com"
    );

    const number =
      requestUrl.searchParams.get("number");

    const mode =
      requestUrl.searchParams.get("mode") || "og";

    if (!number) {
      return res.status(400).json({
        error: "Dream number required"
      });
    }

    /*
     * =====================================================
     * SUPABASE
     * =====================================================
     */

    const supabaseUrl =
      process.env.SUPABASE_URL;

    const supabaseKey =
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        error: "Supabase environment variables missing"
      });
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
            apikey: supabaseKey,

            Authorization:
              "Bearer " +
              supabaseKey
          }
        }
      );

    const responseText =
      await response.text();

    if (!response.ok) {
      return res.status(500).json({
        error: "Unable to load dream",
        details: responseText
      });
    }

    const dreams =
      responseText
        ? JSON.parse(responseText)
        : [];

    if (
      !Array.isArray(dreams) ||
      dreams.length === 0
    ) {
      return res.status(404).json({
        error: "Dream not found"
      });
    }

    const dream =
      dreams[0];

    /*
     * =====================================================
     * DREAM DATA
     * =====================================================
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
      )
        .trim()
        .slice(
          0,
          42
        );

    const dreamText =
      String(
        dream.dream_text ||
        ""
      )
        .trim()
        .slice(
          0,
          280
        );

    const country =
      String(
        dream.country ||
        "World"
      )
        .trim()
        .slice(
          0,
          60
        );

    /*
     * =====================================================
     * ASSETS
     * =====================================================
     */

    const logoUrl =
      "https://onedreameach.com/logo.png";

    const storyBackgroundUrl =
      "https://onedreameach.com/dream-card-bg.png";

    /*
     * =====================================================
     * STORY FONT SIZE
     * =====================================================
     */

    const getStoryFontSize =
      (length) => {

        if (length <= 45) {
          return 92;
        }

        if (length <= 85) {
          return 80;
        }

        if (length <= 130) {
          return 68;
        }

        if (length <= 180) {
          return 58;
        }

        if (length <= 230) {
          return 50;
        }

        return 44;
      };

    /*
     * =====================================================
     * STORY CARD
     * 1080 × 1920
     * =====================================================
     */

    if (
      mode ===
      "story"
    ) {

      const storyFontSize =
        getStoryFontSize(
          dreamText.length
        );

      const storyImage =
        new ImageResponse(
          {
            type: "div",

            props: {

              style: {
                width: "100%",
                height: "100%",

                display: "flex",

                position: "relative",

                overflow: "hidden",

                backgroundColor:
                  "#050611",

                color:
                  "#FFFFFF",

                fontFamily:
                  "Arial, sans-serif"
              },

              children: [

                /*
                 * BACKGROUND
                 */

                {
                  type: "img",

                  props: {

                    src:
                      storyBackgroundUrl,

                    width:
                      1080,

                    height:
                      1920,

                    style: {

                      position:
                        "absolute",

                      left:
                        "0px",

                      top:
                        "0px",

                      width:
                        "1080px",

                      height:
                        "1920px",

                      objectFit:
                        "cover"

                    }

                  }

                },

                /*
                 * DREAM NUMBER
                 */

                {
                  type: "div",

                  props: {

                    style: {

                      position:
                        "absolute",

                      left:
                        "120px",

                      top:
                        "332px",

                      width:
                        "840px",

                      height:
                        "255px",

                      display:
                        "flex",

                      flexDirection:
                        "column",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      borderRadius:
                        "34px",

                      background:
                        "linear-gradient(180deg, rgba(5,6,17,.985), rgba(9,8,25,.965))"

                    },

                    children: [

                      {
                        type: "div",

                        props: {

                          style: {

                            display:
                              "flex",

                            color:
                              "#B46BFF",

                            fontSize:
                              "27px",

                            fontWeight:
                              800,

                            letterSpacing:
                              "8px",

                            marginBottom:
                              "12px"

                          },

                          children:
                            "DREAM #"

                        }

                      },

                      {
                        type: "div",

                        props: {

                          style: {

                            display:
                              "flex",

                            color:
                              "#FBFAFF",

                            fontSize:
                              "154px",

                            lineHeight:
                              1,

                            fontWeight:
                              900,

                            letterSpacing:
                              "7px",

                            textShadow:
                              "0 0 22px rgba(196,181,253,.55), 0 0 55px rgba(124,58,237,.34)"

                          },

                          children:
                            paddedNumber

                        }

                      }

                    ]

                  }

                },

                /*
                 * DREAM TEXT
                 */

                {
                  type: "div",

                  props: {

                    style: {

                      position:
                        "absolute",

                      left:
                        "105px",

                      top:
                        "620px",

                      width:
                        "870px",

                      height:
                        "530px",

                      display:
                        "flex",

                      flexDirection:
                        "column",

                      justifyContent:
                        "center",

                      padding:
                        "46px 50px",

                      borderRadius:
                        "34px",

                      background:
                        "linear-gradient(135deg, rgba(7,8,24,.985), rgba(12,8,30,.955))",

                      border:
                        "1px solid rgba(196,181,253,.32)",

                      boxShadow:
                        "0 24px 80px rgba(0,0,0,.30)"

                    },

                    children: [

                      /*
                       * OPEN QUOTE
                       */

                      {
                        type: "div",

                        props: {

                          style: {

                            position:
                              "absolute",

                            left:
                              "-34px",

                            top:
                              "-54px",

                            display:
                              "flex",

                            color:
                              "#A855F7",

                            fontSize:
                              "136px",

                            lineHeight:
                              1,

                            fontWeight:
                              900

                          },

                          children:
                            "“"

                        }

                      },

                      /*
                       * DREAM
                       */

                      {
                        type: "div",

                        props: {

                          style: {

                            width:
                              "100%",

                            display:
                              "flex",

                            color:
                              "#F8F7FB",

                            fontSize:
                              storyFontSize +
                              "px",

                            lineHeight:
                              1.08,

                            fontWeight:
                              900,

                            fontStyle:
                              "italic",

                            letterSpacing:
                              "-1.5px",

                            textAlign:
                              "left",

                            textShadow:
                              "0 4px 18px rgba(0,0,0,.30)"

                          },

                          children:
                            dreamText

                        }

                      },

                      /*
                       * CLOSE QUOTE
                       */

                      {
                        type: "div",

                        props: {

                          style: {

                            position:
                              "absolute",

                            right:
                              "-26px",

                            bottom:
                              "-62px",

                            display:
                              "flex",

                            color:
                              "#A855F7",

                            fontSize:
                              "136px",

                            lineHeight:
                              1,

                            fontWeight:
                              900

                          },

                          children:
                            "”"

                        }

                      }

                    ]

                  }

                },

                /*
                 * DREAMER / COUNTRY
                 */

                {
                  type: "div",

                  props: {

                    style: {

                      position:
                        "absolute",

                      left:
                        "110px",

                      top:
                        "1160px",

                      width:
                        "860px",

                      height:
                        "122px",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "space-between",

                      padding:
                        "18px 34px",

                      borderRadius:
                        "28px",

                      background:
                        "linear-gradient(90deg, rgba(7,8,24,.94), rgba(9,8,25,.88))"

                    },

                    children: [

                      /*
                       * DREAMER
                       */

                      {
                        type: "div",

                        props: {

                          style: {

                            width:
                              "48%",

                            display:
                              "flex",

                            flexDirection:
                              "column"

                          },

                          children: [

                            {
                              type: "div",

                              props: {

                                style: {

                                  display:
                                    "flex",

                                  color:
                                    "#B46BFF",

                                  fontSize:
                                    "15px",

                                  fontWeight:
                                    800,

                                  letterSpacing:
                                    "2.5px",

                                  marginBottom:
                                    "7px"

                                },

                                children:
                                  "DREAMER"

                              }

                            },

                            {
                              type: "div",

                              props: {

                                style: {

                                  display:
                                    "flex",

                                  color:
                                    "#FFFFFF",

                                  fontSize:
                                    "27px",

                                  fontWeight:
                                    800

                                },

                                children:
                                  nickname

                              }

                            }

                          ]

                        }

                      },

                      /*
                       * SEPARATOR
                       */

                      {
                        type: "div",

                        props: {

                          style: {

                            width:
                              "1px",

                            height:
                              "66px",

                            display:
                              "flex",

                            background:
                              "rgba(196,181,253,.35)"

                          }

                        }

                      },

                      /*
                       * COUNTRY
                       */

                      {
                        type: "div",

                        props: {

                          style: {

                            width:
                              "44%",

                            display:
                              "flex",

                            flexDirection:
                              "column"

                          },

                          children: [

                            {
                              type: "div",

                              props: {

                                style: {

                                  display:
                                    "flex",

                                  color:
                                    "#B46BFF",

                                  fontSize:
                                    "15px",

                                  fontWeight:
                                    800,

                                  letterSpacing:
                                    "2.5px",

                                  marginBottom:
                                    "7px"

                                },

                                children:
                                  "FROM"

                              }

                            },

                            {
                              type: "div",

                              props: {

                                style: {

                                  display:
                                    "flex",

                                  color:
                                    "#FFFFFF",

                                  fontSize:
                                    "27px",

                                  fontWeight:
                                    800

                                },

                                children:
                                  country

                              }

                            }

                          ]

                        }

                      }

                    ]

                  }

                }

              ]

            }

          },

          {
            width: 1080,
            height: 1920
          }

        );

      const storyBuffer =
        await storyImage
          .arrayBuffer();

      res.setHeader(
        "Content-Type",
        "image/png"
      );

      res.setHeader(
        "Content-Disposition",
        `inline; filename="onedreameach-dream-${paddedNumber}.png"`
      );

      res.setHeader(
        "Cache-Control",
        "public, max-age=0, s-maxage=300, stale-while-revalidate=3600"
      );

      return res
        .status(200)
        .send(
          Buffer.from(
            storyBuffer
          )
        );

    }

    /*
     * =====================================================
     * NORMAL OG
     * 1200 × 630
     * =====================================================
     */

    let ogFontSize =
      58;

    if (
      dreamText.length >
      160
    ) {
      ogFontSize =
        42;
    }

    else if (
      dreamText.length >
      100
    ) {
      ogFontSize =
        48;
    }

    const image =
      new ImageResponse(
        {

          type:
            "div",

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

              position:
                "relative",

              overflow:
                "hidden",

              backgroundColor:
                "#05050A",

              backgroundImage:
                "radial-gradient(circle at 88% 8%, rgba(109,40,217,.24), transparent 32%), radial-gradient(circle at 5% 100%, rgba(49,46,129,.18), transparent 35%), linear-gradient(155deg, #080812 0%, #05050A 58%, #090611 100%)",

              color:
                "#F5F1EB",

              padding:
                "55px 65px",

              fontFamily:
                "Arial, sans-serif"

            },

            children: [

              /*
               * HEADER
               */

              {
                type:
                  "div",

                props: {

                  style: {

                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "center",

                    width:
                      "100%"

                  },

                  children: [

                    {
                      type:
                        "img",

                      props: {

                        src:
                          logoUrl,

                        width:
                          250,

                        height:
                          72,

                        style: {

                          width:
                            "250px",

                          height:
                            "72px",

                          objectFit:
                            "contain",

                          objectPosition:
                            "left center"

                        }

                      }

                    },

                    {
                      type:
                        "div",

                      props: {

                        style: {

                          display:
                            "flex",

                          color:
                            "#C4B5FD",

                          fontSize:
                            "17px",

                          fontWeight:
                            800,

                          letterSpacing:
                            "3px"

                        },

                        children:
                          "DREAM " +
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
                type:
                  "div",

                props: {

                  style: {

                    display:
                      "flex",

                    flexDirection:
                      "column",

                    justifyContent:
                      "center",

                    flex:
                      1,

                    width:
                      "100%"

                  },

                  children: [

                    {
                      type:
                        "div",

                      props: {

                        style: {

                          display:
                            "flex",

                          color:
                            "#F5F1EB",

                          fontFamily:
                            "Georgia, serif",

                          fontStyle:
                            "italic",

                          fontSize:
                            ogFontSize +
                            "px",

                          fontWeight:
                            700,

                          lineHeight:
                            1.08,

                          letterSpacing:
                            "-2px",

                          maxWidth:
                            "1020px"

                        },

                        children:
                          "“" +
                          dreamText +
                          "”"

                      }

                    },

                    {
                      type:
                        "div",

                      props: {

                        style: {

                          display:
                            "flex",

                          color:
                            "rgba(255,255,255,.52)",

                          fontSize:
                            "16px",

                          fontWeight:
                            700,

                          marginTop:
                            "26px"

                        },

                        children:
                          nickname +
                          " · " +
                          country

                      }

                    }

                  ]

                }

              },

              /*
               * FOOTER
               */

              {
                type:
                  "div",

                props: {

                  style: {

                    width:
                      "100%",

                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "center",

                    paddingTop:
                      "18px",

                    borderTop:
                      "1px solid rgba(255,255,255,.06)"

                  },

                  children: [

                    {
                      type:
                        "div",

                      props: {

                        style: {

                          display:
                            "flex",

                          color:
                            "rgba(255,255,255,.34)",

                          fontSize:
                            "12px",

                          fontWeight:
                            700,

                          letterSpacing:
                            "2px"

                        },

                        children:
                          "ONE OF ONE MILLION"

                      }

                    },

                    {
                      type:
                        "div",

                      props: {

                        style: {

                          display:
                            "flex",

                          color:
                            "#C4B5FD",

                          fontSize:
                            "16px",

                          fontWeight:
                            900

                        },

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
          width: 1200,
          height: 630
        }

      );

    const arrayBuffer =
      await image
        .arrayBuffer();

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
          "Unable to generate image",

        details:
          error &&
          error.message
            ? error.message
            : String(error)

      });

  }
};
