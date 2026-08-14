module.exports = async function handler(req, res) {
  try {
    const { ImageResponse } = await import("@vercel/og");

    /*
     * =====================================================
     * REQUEST
     * =====================================================
     */

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
      return res.status(500).json({
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
      return res.status(404).json({
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

    const antonUrl =
      "https://onedreameach.com/anton.ttf";

    const dreamFontUrl =
      "https://onedreameach.com/barlow-condensed-extrabold-italic.ttf";

    /*
     * =====================================================
     * LOAD FONTS
     * =====================================================
     */

    const [
      antonFont,
      dreamFont
    ] =
      await Promise.all([
        fetch(
          antonUrl
        ).then(
          r => {
            if (!r.ok) {
              throw new Error(
                "Unable to load anton.ttf"
              );
            }

            return r.arrayBuffer();
          }
        ),

        fetch(
          dreamFontUrl
        ).then(
          r => {
            if (!r.ok) {
              throw new Error(
                "Unable to load Barlow font"
              );
            }

            return r.arrayBuffer();
          }
        )
      ]);

    /*
     * =====================================================
     * STORY FONT SIZE
     * =====================================================
     */

    function getDreamTypography(
      length
    ) {
      if (length <= 38) {
        return {
          size: 102,
          gap: 7
        };
      }

      if (length <= 65) {
        return {
          size: 91,
          gap: 6
        };
      }

      if (length <= 95) {
        return {
          size: 80,
          gap: 5
        };
      }

      if (length <= 130) {
        return {
          size: 70,
          gap: 5
        };
      }

      if (length <= 170) {
        return {
          size: 61,
          gap: 4
        };
      }

      if (length <= 220) {
        return {
          size: 53,
          gap: 4
        };
      }

      return {
        size: 46,
        gap: 3
      };
    }

    /*
     * =====================================================
     * PURPLE WORDS
     * =====================================================
     */

    const highlightWords =
      new Set([
        "dream",
        "dreams",
        "love",
        "peace",
        "war",
        "freedom",
        "free",
        "family",
        "life",
        "world",
        "hope",
        "future",
        "home",
        "travel",
        "happy",
        "happiness",
        "success",
        "successful",
        "mother",
        "mom",
        "mum",
        "father",
        "dad",
        "heal",
        "healing"
      ]);

    /*
     * Creates every word as its own flex item.
     * This allows purple highlights without
     * causing Satori display errors.
     */

    function createDreamWords(
      text,
      fontSize,
      gap
    ) {
      const words =
        text
          .toUpperCase()
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

          const isHighlight =
            highlightWords.has(
              normalized
            );

          return {
            type:
              "div",

            props: {
              key:
                `word-${index}`,

              style: {
                display:
                  "flex",

                marginRight:
                  `${gap * 2}px`,

                marginBottom:
                  `${gap}px`,

                color:
                  isHighlight
                    ? "#A855F7"
                    : "#F8F7FB",

                fontFamily:
                  "DreamPoster",

                fontSize:
                  `${fontSize}px`,

                fontWeight:
                  800,

                fontStyle:
                  "italic",

                lineHeight:
                  0.98,

                letterSpacing:
                  "-1px",

                textShadow:
                  isHighlight
                    ? "0 0 18px rgba(168,85,247,.42)"
                    : "0 4px 14px rgba(0,0,0,.32)"
              },

              children:
                word
            }
          };
        }
      );
    }

    /*
     * =====================================================
     * STORY CARD
     * =====================================================
     */

    if (
      mode ===
      "story"
    ) {
      const typography =
        getDreamTypography(
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

                color:
                  "#FFFFFF",

                fontFamily:
                  "Arial"
              },

              children: [

                /*
                 * =================================================
                 * ORIGINAL PREMIUM BACKGROUND
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
                 * =================================================
                 * NUMBER CLEAN AREA
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
                        "115px",

                      top:
                        "330px",

                      width:
                        "850px",

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
                        "32px",

                      background:
                        "linear-gradient(180deg, rgba(4,6,18,.985), rgba(8,7,25,.97))"
                    },

                    children: [

                      /*
                       * DREAM #
                       */

                      {
                        type:
                          "div",

                        props: {
                          style: {
                            display:
                              "flex",

                            color:
                              "#B46BFF",

                            fontFamily:
                              "DreamPoster",

                            fontSize:
                              "33px",

                            fontWeight:
                              800,

                            fontStyle:
                              "italic",

                            letterSpacing:
                              "8px",

                            marginBottom:
                              "4px"
                          },

                          children:
                            "DREAM #"
                        }
                      },

                      /*
                       * NUMBER
                       */

                      {
                        type:
                          "div",

                        props: {
                          style: {
                            display:
                              "flex",

                            color:
                              "#FAFAFF",

                            fontFamily:
                              "Anton",

                            fontSize:
                              "178px",

                            fontWeight:
                              400,

                            lineHeight:
                              0.92,

                            letterSpacing:
                              "4px",

                            textShadow:
                              "0 0 18px rgba(255,255,255,.25), 0 0 42px rgba(139,92,246,.45)"
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
                 * DREAM PANEL
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
                        "102px",

                      top:
                        "605px",

                      width:
                        "876px",

                      height:
                        "555px",

                      display:
                        "flex",

                      flexDirection:
                        "column",

                      justifyContent:
                        "center",

                      padding:
                        "50px 48px",

                      borderRadius:
                        "34px",

                      background:
                        "linear-gradient(135deg, rgba(5,7,22,.965), rgba(10,7,29,.93))",

                      border:
                        "1px solid rgba(196,181,253,.30)",

                      boxShadow:
                        "0 30px 80px rgba(0,0,0,.28)"
                    },

                    children: [

                      /*
                       * QUOTE LEFT
                       */

                      {
                        type:
                          "div",

                        props: {
                          style: {
                            display:
                              "flex",

                            position:
                              "absolute",

                            left:
                              "-42px",

                            top:
                              "-58px",

                            color:
                              "#9B5DE5",

                            fontFamily:
                              "Anton",

                            fontSize:
                              "138px",

                            lineHeight:
                              1
                          },

                          children:
                            "“"
                        }
                      },

                      /*
                       * DREAM WORDS
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

                            flexWrap:
                              "wrap",

                            alignContent:
                              "center",

                            alignItems:
                              "baseline",

                            justifyContent:
                              "flex-start"
                          },

                          children:
                            createDreamWords(
                              dreamText,
                              typography.size,
                              typography.gap
                            )
                        }
                      },

                      /*
                       * QUOTE RIGHT
                       */

                      {
                        type:
                          "div",

                        props: {
                          style: {
                            display:
                              "flex",

                            position:
                              "absolute",

                            right:
                              "-30px",

                            bottom:
                              "-68px",

                            color:
                              "#9B5DE5",

                            fontFamily:
                              "Anton",

                            fontSize:
                              "138px",

                            lineHeight:
                              1
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
                        "112px",

                      top:
                        "1166px",

                      width:
                        "856px",

                      height:
                        "112px",

                      display:
                        "flex",

                      justifyContent:
                        "space-between",

                      alignItems:
                        "center",

                      padding:
                        "16px 34px",

                      borderRadius:
                        "25px",

                      background:
                        "linear-gradient(90deg, rgba(5,7,22,.93), rgba(10,7,29,.86))"
                    },

                    children: [

                      /*
                       * DREAMER
                       */

                      {
                        type:
                          "div",

                        props: {
                          style: {
                            width:
                              "47%",

                            display:
                              "flex",

                            flexDirection:
                              "column"
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
                                    "2.5px",

                                  marginBottom:
                                    "7px"
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
                       * DIVIDER
                       */

                      {
                        type:
                          "div",

                        props: {
                          style: {
                            width:
                              "1px",

                            height:
                              "60px",

                            display:
                              "flex",

                            background:
                              "rgba(196,181,253,.32)"
                          }
                        }
                      },

                      /*
                       * COUNTRY
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
                              "column"
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
                                    "2.5px",

                                  marginBottom:
                                    "7px"
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
              1920,

            fonts: [
              {
                name:
                  "Anton",

                data:
                  antonFont,

                weight:
                  400,

                style:
                  "normal"
              },

              {
                name:
                  "DreamPoster",

                data:
                  dreamFont,

                weight:
                  800,

                style:
                  "italic"
              }
            ]
          }
        );

      const storyBuffer =
        await storyImage.arrayBuffer();

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
        "public, max-age=0, s-maxage=120, stale-while-revalidate=600"
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
      dreamText.length > 160
    ) {
      ogFontSize =
        42;
    }

    else if (
      dreamText.length > 100
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
                    width:
                      "100%",

                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "center"
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
                    width:
                      "100%",

                    display:
                      "flex",

                    flexDirection:
                      "column",

                    justifyContent:
                      "center",

                    flex:
                      1
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

                          fontSize:
                            ogFontSize +
                            "px",

                          fontWeight:
                            800,

                          lineHeight:
                            1.08,

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

                    borderTop:
                      "1px solid rgba(255,255,255,.06)",

                    paddingTop:
                      "18px"
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
          "Unable to generate image",

        details:
          error &&
          error.message
            ? error.message
            : String(error)
      });
  }
};
