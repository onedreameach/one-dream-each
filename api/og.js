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
      return res
        .status(400)
        .json({
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
        ? JSON.parse(responseText)
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
     * =====================================================
     * DREAM DATA
     * =====================================================
     */

    const paddedNumber =
      String(
        dream.dream_number
      )
        .padStart(
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
     * STORY TYPOGRAPHY
     * =====================================================
     */

    function getStoryTextStyle(
      length
    ) {
      if (
        length <=
        45
      ) {
        return {
          fontSize: 92,
          lineHeight: 1.02,
          letterSpacing: -2.8
        };
      }

      if (
        length <=
        85
      ) {
        return {
          fontSize: 80,
          lineHeight: 1.04,
          letterSpacing: -2.2
        };
      }

      if (
        length <=
        130
      ) {
        return {
          fontSize: 68,
          lineHeight: 1.06,
          letterSpacing: -1.7
        };
      }

      if (
        length <=
        180
      ) {
        return {
          fontSize: 58,
          lineHeight: 1.08,
          letterSpacing: -1.2
        };
      }

      if (
        length <=
        230
      ) {
        return {
          fontSize: 50,
          lineHeight: 1.10,
          letterSpacing: -0.8
        };
      }

      return {
        fontSize: 44,
        lineHeight: 1.11,
        letterSpacing: -0.5
      };
    }

    /*
     * Words that receive
     * the purple accent.
     */

    const highlightWords =
      new Set([
        "dream",
        "dreams",
        "love",
        "peace",
        "world",
        "family",
        "mother",
        "mom",
        "mum",
        "father",
        "dad",
        "freedom",
        "free",
        "life",
        "happy",
        "happiness",
        "travel",
        "home",
        "future",
        "hope",
        "war",
        "heal",
        "healing",
        "success",
        "successful"
      ]);

    function dreamWordNodes(
      text
    ) {
      const words =
        text
          .split(/\s+/)
          .filter(Boolean);

      return words.map(
        (
          word,
          index
        ) => {
          const normalized =
            word
              .toLowerCase()
              .replace(
                /[^a-zà-ÿ]/gi,
                ""
              );

          const highlighted =
            highlightWords
              .has(
                normalized
              );

          return {
            type:
              "span",

            props: {
              key:
                "word-" +
                index,

              style: {
                color:
                  highlighted
                    ? "#A855F7"
                    : "#F8F7FB",

                textShadow:
                  highlighted
                    ? "0 0 22px rgba(168,85,247,.34)"
                    : "0 4px 18px rgba(0,0,0,.28)"
              },

              children:
                word +
                (
                  index ===
                  words.length - 1
                    ? ""
                    : " "
                )
            }
          };
        }
      );
    }

    /*
     * =====================================================
     * STORY MODE
     * 1080 × 1920
     * =====================================================
     */

    if (
      mode ===
      "story"
    ) {
      const type =
        getStoryTextStyle(
          dreamText.length
        );

      const storyImage =
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

                position:
                  "relative",

                overflow:
                  "hidden",

                backgroundColor:
                  "#050611",

                fontFamily:
                  "Arial, sans-serif",

                color:
                  "#FFFFFF"
              },

              children: [

                /*
                 * =================================================
                 * BACKGROUND TEMPLATE
                 * =================================================
                 */

                {
                  type:
                    "img",

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

                      inset:
                        "0",

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
                 * =================================================
                 * DREAM NUMBER
                 * Covers the 000000 placeholder.
                 * =================================================
                 */

                {
                  type:
                    "div",

                  props: {
                    style: {
                      position:
                        "absolute",

                      left:
                        "125px",

                      top:
                        "335px",

                      width:
                        "830px",

                      height:
                        "250px",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      borderRadius:
                        "34px",

                      background:
                        "linear-gradient(180deg, rgba(5,6,17,.98), rgba(8,8,24,.97))"
                    },

                    children: [

                      {
                        type:
                          "div",

                        props: {
                          style: {
                            position:
                              "absolute",

                            top:
                              "-42px",

                            display:
                              "flex",

                            color:
                              "#B46BFF",

                            fontSize:
                              "28px",

                            fontWeight:
                              800,

                            letterSpacing:
                              "8px"
                          },

                          children:
                            "DREAM #"
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
                              "#FBFAFF",

                            fontSize:
                              "164px",

                            lineHeight:
                              1,

                            fontWeight:
                              900,

                            letterSpacing:
                              "8px",

                            textShadow:
                              "0 0 22px rgba(196,181,253,.55), 0 0 55px rgba(124,58,237,.36)"
                          },

                          children:
                            paddedNumber
                        }
                      }
                    ]
                  }
                },

                /*
                 * =================================================
                 * DREAM TEXT
                 * Covers the empty/placeholder quote area.
                 * =================================================
                 */

                {
                  type:
                    "div",

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
                        "535px",

                      display:
                        "flex",

                      flexDirection:
                        "column",

                      justifyContent:
                        "center",

                      padding:
                        "48px 50px",

                      borderRadius:
                        "34px",

                      background:
                        "linear-gradient(135deg, rgba(7,8,24,.98), rgba(12,8,30,.96))",

                      border:
                        "1px solid rgba(196,181,253,.32)",

                      boxShadow:
                        "0 24px 80px rgba(0,0,0,.30)"
                    },

                    children: [

                      /*
                       * Opening quote
                       */

                      {
                        type:
                          "div",

                        props: {
                          style: {
                            position:
                              "absolute",

                            left:
                              "-36px",

                            top:
                              "-48px",

                            display:
                              "flex",

                            color:
                              "#9B5DE5",

                            fontSize:
                              "138px",

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
                       * Dynamic Dream text
                       */

                      {
                        type:
                          "div",

                        props: {
                          style: {
                            width:
                              "100%",

                            display:
                              "block",

                            color:
                              "#F8F7FB",

                            fontSize:
                              type.fontSize +
                              "px",

                            lineHeight:
                              type.lineHeight,

                            fontWeight:
                              900,

                            fontStyle:
                              "italic",

                            letterSpacing:
                              type.letterSpacing +
                              "px",

                            textAlign:
                              "left"
                          },

                          children:
                            dreamWordNodes(
                              dreamText
                            )
                        }
                      },

                      /*
                       * Closing quote
                       */

                      {
                        type:
                          "div",

                        props: {
                          style: {
                            position:
                              "absolute",

                            right:
                              "-24px",

                            bottom:
                              "-60px",

                            display:
                              "flex",

                            color:
                              "#9B5DE5",

                            fontSize:
                              "138px",

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
                 * =================================================
                 * DREAMER + COUNTRY
                 * Covers Your Name / Your Country placeholders.
                 * =================================================
                 */

                {
                  type:
                    "div",

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
                        "125px",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "space-between",

                      padding:
                        "18px 34px",

                      background:
                        "linear-gradient(90deg, rgba(7,8,24,.94), rgba(9,8,25,.88))",

                      borderRadius:
                        "28px"
                    },

                    children: [

                      /*
                       * Dreamer
                       */

                      {
                        type:
                          "div",

                        props: {
                          style: {
                            width:
                              "48%",

                            display:
                              "flex",

                            flexDirection:
                              "column",

                            gap:
                              "7px"
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
                                    "#B46BFF",

                                  fontSize:
                                    "16px",

                                  fontWeight:
                                    800,

                                  letterSpacing:
                                    "2.5px"
                                },

                                children:
                                  "DREAMER"
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
                       * Separator
                       */

                      {
                        type:
                          "div",

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
                       * Country
                       */

                      {
                        type:
                          "div",

                        props: {
                          style: {
                            width:
                              "44%",

                            display:
                              "flex",

                            flexDirection:
                              "column",

                            alignItems:
                              "flex-start",

                            gap:
                              "7px"
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
                                    "#B46BFF",

                                  fontSize:
                                    "16px",

                                  fontWeight:
                                    800,

                                  letterSpacing:
                                    "2.5px"
                                },

                                children:
                                  "FROM"
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
            width:
              1080,

            height:
              1920
          }
        );

      /*
       * =====================================================
       * STORY → PNG
       * =====================================================
       */

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
     * NORMAL OPEN GRAPH MODE
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
               * Background Dream number
               */

              {
                type:
                  "div",

                props: {
                  style: {
                    position:
                      "absolute",

                    right:
                      "-20px",

                    top:
                      "145px",

                    display:
                      "flex",

                    color:
                      "rgba(255,255,255,.025)",

                    fontSize:
                      "190px",

                    fontWeight:
                      900,

                    letterSpacing:
                      "-18px"
                  },

                  children:
                    paddedNumber
                }
              },

              /*
               * Header
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

                    position:
                      "relative",

                    zIndex:
                      3
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
               * Main OG Dream
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

                    flexDirection:
                      "column",

                    justifyContent:
                      "center",

                    position:
                      "relative",

                    zIndex:
                      3,

                    flex:
                      1,

                    padding:
                      "25px 5px"
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

                    /*
                     * OG author
                     */

                    {
                      type:
                        "div",

                      props: {
                        style: {
                          display:
                            "flex",

                          alignItems:
                            "center",

                          gap:
                            "12px",

                          marginTop:
                            "26px",

                          color:
                            "rgba(255,255,255,.52)",

                          fontSize:
                            "16px",

                          fontWeight:
                            700
                        },

                        children: [

                          {
                            type:
                              "div",

                            props: {
                              style: {
                                width:
                                  "7px",

                                height:
                                  "7px",

                                borderRadius:
                                  "999px",

                                background:
                                  "#A78BFA"
                              }
                            }
                          },

                          {
                            type:
                              "div",

                            props: {
                              children:
                                nickname +
                                " · " +
                                country
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              },

              /*
               * OG footer
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

                    position:
                      "relative",

                    zIndex:
                      3,

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
          width:
            1200,

          height:
            630
        }
      );

    /*
     * =====================================================
     * OG → PNG
     * =====================================================
     */

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
