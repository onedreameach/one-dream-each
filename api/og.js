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
              "Bearer " + supabaseKey
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
      "https://onedreameach.com/dream-card-bg-v4.png?v=4";

    const antonUrl =
      "https://onedreameach.com/anton.ttf";

    const barlowUrl =
      "https://onedreameach.com/barlow-condensed-extrabold-italic.ttf";

    /*
     * =====================================================
     * LOAD CUSTOM FONTS
     * =====================================================
     */

    const [
      antonFont,
      barlowFont
    ] =
      await Promise.all([

        fetch(
          antonUrl
        ).then(
          async (r) => {
            if (!r.ok) {
              throw new Error(
                "anton.ttf not found"
              );
            }

            return r.arrayBuffer();
          }
        ),

        fetch(
          barlowUrl
        ).then(
          async (r) => {
            if (!r.ok) {
              throw new Error(
                "barlow-condensed-extrabold-italic.ttf not found"
              );
            }

            return r.arrayBuffer();
          }
        )

      ]);

    /*
     * =====================================================
     * STORY TYPOGRAPHY
     * =====================================================
     *
     * Short dreams become huge.
     * Long dreams shrink automatically.
     */

    function getDreamTypography(length) {
      if (length <= 35) {
        return {
          size: 96,
          wordGap: 15,
          lineHeight: 0.98
        };
      }

      if (length <= 55) {
        return {
          size: 88,
          wordGap: 14,
          lineHeight: 0.98
        };
      }

      if (length <= 80) {
        return {
          size: 78,
          wordGap: 13,
          lineHeight: 1.0
        };
      }

      if (length <= 110) {
        return {
          size: 69,
          wordGap: 12,
          lineHeight: 1.0
        };
      }

      if (length <= 145) {
        return {
          size: 61,
          wordGap: 11,
          lineHeight: 1.01
        };
      }

      if (length <= 185) {
        return {
          size: 54,
          wordGap: 10,
          lineHeight: 1.02
        };
      }

      if (length <= 230) {
        return {
          size: 48,
          wordGap: 9,
          lineHeight: 1.03
        };
      }

      return {
        size: 43,
        wordGap: 8,
        lineHeight: 1.04
      };
    }

    /*
     * =====================================================
     * WORDS TO HIGHLIGHT
     * =====================================================
     */

    const highlightWords =
      new Set([
        "dream",
        "dreams",
        "love",
        "peace",
        "war",
        "world",
        "freedom",
        "free",
        "family",
        "life",
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
        "healing",
        "heart",
        "believe",
        "change"
      ]);

    /*
     * =====================================================
     * CREATE DREAM WORDS
     * =====================================================
     */

    function createDreamWords(
      text,
      typography
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

          const highlighted =
            highlightWords.has(
              normalized
            );

          return {
            type:
              "div",

            props: {
              key:
                "dream-word-" +
                index,

              style: {
                display:
                  "flex",

                marginRight:
                  typography.wordGap +
                  "px",

                marginBottom:
                  "6px",

                color:
                  highlighted
                    ? "#A855F7"
                    : "#FFFFFF",

                fontFamily:
                  "DreamPoster",

                fontSize:
                  typography.size +
                  "px",

                fontWeight:
                  800,

                fontStyle:
                  "italic",

                lineHeight:
                  typography.lineHeight,

                letterSpacing:
                  "-1.4px"
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
     * STORY MODE
     * 1080 × 1920
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
                  "#FFFFFF"
              },

              children: [

                /*
                 * =============================================
                 * BACKGROUND V4
                 * =============================================
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
                 * =============================================
                 * DREAM LABEL
                 * =============================================
                 */

                {
                  type:
                    "div",

                  props: {
                    style: {
                      position:
                        "absolute",

                      left:
                        "0px",

                      top:
                        "354px",

                      width:
                        "1080px",

                      display:
                        "flex",

                      justifyContent:
                        "center",

                      alignItems:
                        "center",

                      color:
                        "#B56BFF",

                      fontFamily:
                        "DreamPoster",

                      fontSize:
                        "31px",

                      fontWeight:
                        800,

                      fontStyle:
                        "italic",

                      letterSpacing:
                        "8px"
                    },

                    children:
                      "DREAM #"
                  }
                },

                /*
                 * =============================================
                 * DREAM NUMBER
                 * =============================================
                 */

                {
                  type:
                    "div",

                  props: {
                    style: {
                      position:
                        "absolute",

                      left:
                        "0px",

                      top:
                        "392px",

                      width:
                        "1080px",

                      height:
                        "190px",

                      display:
                        "flex",

                      justifyContent:
                        "center",

                      alignItems:
                        "center",

                      color:
                        "#FFFFFF",

                      fontFamily:
                        "Anton",

                      fontSize:
                        "178px",

                      fontWeight:
                        400,

                      lineHeight:
                        1,

                      letterSpacing:
                        "4px"
                    },

                    children:
                      paddedNumber
                  }
                },

                /*
                 * =============================================
                 * SMALL DIVIDER / HEART
                 * =============================================
                 */

                {
                  type:
                    "div",

                  props: {
                    style: {
                      position:
                        "absolute",

                      left:
                        "140px",

                      top:
                        "594px",

                      width:
                        "800px",

                      height:
                        "30px",

                      display:
                        "flex",

                      justifyContent:
                        "center",

                      alignItems:
                        "center",

                      color:
                        "#A855F7",

                      fontSize:
                        "28px"
                    },

                    children:
                      "♡"
                  }
                },

                /*
                 * =============================================
                 * OPENING QUOTE
                 * =============================================
                 */

                {
                  type:
                    "div",

                  props: {
                    style: {
                      position:
                        "absolute",

                      left:
                        "92px",

                      top:
                        "630px",

                      display:
                        "flex",

                      color:
                        "#9B5DE5",

                      fontFamily:
                        "Anton",

                      fontSize:
                        "104px",

                      lineHeight:
                        1
                    },

                    children:
                      "“"
                  }
                },

                /*
                 * =============================================
                 * DREAM TEXT
                 * =============================================
                 */

                {
                  type:
                    "div",

                  props: {
                    style: {
                      position:
                        "absolute",

                      left:
                        "145px",

                      top:
                        "648px",

                      width:
                        "790px",

                      height:
                        "410px",

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
                        typography
                      )
                  }
                },

                /*
                 * =============================================
                 * CLOSING QUOTE
                 * =============================================
                 */

                {
                  type:
                    "div",

                  props: {
                    style: {
                      position:
                        "absolute",

                      right:
                        "92px",

                      top:
                        "970px",

                      display:
                        "flex",

                      color:
                        "#9B5DE5",

                      fontFamily:
                        "Anton",

                      fontSize:
                        "104px",

                      lineHeight:
                        1
                    },

                    children:
                      "”"
                  }
                },

                /*
                 * =============================================
                 * AUTHOR ROW
                 * =============================================
                 */

                {
                  type:
                    "div",

                  props: {
                    style: {
                      position:
                        "absolute",

                      left:
                        "150px",

                      top:
                        "1055px",

                      width:
                        "780px",

                      height:
                        "105px",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "space-between"
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
                              "46%",

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
                                    "#B56BFF",

                                  fontFamily:
                                    "DreamPoster",

                                  fontSize:
                                    "15px",

                                  fontWeight:
                                    800,

                                  letterSpacing:
                                    "2.4px",

                                  marginBottom:
                                    "6px"
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

                                  fontFamily:
                                    "Arial",

                                  fontSize:
                                    "27px",

                                  fontWeight:
                                    700
                                },

                                children:
                                  nickname
                              }
                            }

                          ]
                        }
                      },

                      /*
                       * CENTER LINE
                       */

                      {
                        type:
                          "div",

                        props: {
                          style: {
                            width:
                              "1px",

                            height:
                              "58px",

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
                        type:
                          "div",

                        props: {
                          style: {
                            width:
                              "43%",

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
                                    "#B56BFF",

                                  fontFamily:
                                    "DreamPoster",

                                  fontSize:
                                    "15px",

                                  fontWeight:
                                    800,

                                  letterSpacing:
                                    "2.4px",

                                  marginBottom:
                                    "6px"
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

                                  fontFamily:
                                    "Arial",

                                  fontSize:
                                    "27px",

                                  fontWeight:
                                    700
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
                  barlowFont,

                weight:
                  800,

                style:
                  "italic"
              }
            ]
          }
        );

      /*
       * =====================================================
       * STORY → PNG
       * =====================================================
       */

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
     * NORMAL OPEN GRAPH IMAGE
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
                "Arial"
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
               * MAIN DREAM
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

    /*
     * =====================================================
     * OG → PNG
     * =====================================================
     */

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
