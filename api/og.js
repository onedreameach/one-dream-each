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
      "?select=dream_number,nickname,dream_text,country,instagram,tiktok" +
      "&dream_number=eq." +
      encodeURIComponent(number) +
      "&limit=1";

    const response =
      await fetch(
        apiUrl,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: "Bearer " + supabaseKey
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
     * DREAMER SOCIALS
     * =====================================================
     */

    function normalizeSocial(value, platform) {
      if (!value) {
        return "";
      }

      let clean =
        String(value)
          .trim();

      if (!clean) {
        return "";
      }

      clean =
        clean
          .replace(/^https?:\/\//i, "")
          .replace(/^www\./i, "")
          .replace(/^instagram\.com\//i, "")
          .replace(/^tiktok\.com\/@?/i, "")
          .replace(/^@+/, "")
          .split(/[?#]/)[0]
          .replace(/\/$/, "")
          .trim();

      if (!clean) {
        return "";
      }

      return "@" + clean.slice(0, 30);
    }

    const instagramHandle =
      normalizeSocial(
        dream.instagram,
        "instagram"
      );

    const tiktokHandle =
      normalizeSocial(
        dream.tiktok,
        "tiktok"
      );

    const dreamerSocials =
      [
        instagramHandle
          ? "Instagram " + instagramHandle
          : "",
        tiktokHandle
          ? "TikTok " + tiktokHandle
          : ""
      ]
        .filter(Boolean)
        .join("   â€¢   ");

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
                /[^a-zÃ -Ã¿]/gi,
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
     * 1080 Ã— 1920
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

      const authorLine =
        [nickname, country]
          .filter(Boolean)
          .join("  Â·  ");

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
                backgroundColor: "#05050A",
                backgroundImage:
                  "radial-gradient(circle at 50% 22%, rgba(124,58,237,.27), transparent 31%), radial-gradient(circle at 92% 84%, rgba(192,132,252,.13), transparent 27%), radial-gradient(circle at 4% 92%, rgba(79,70,229,.10), transparent 28%), linear-gradient(180deg, #080711 0%, #05050A 48%, #06050B 100%)",

                color: "#FFFFFF"
              },

              children: [

                /* SOFT FRAME */
                {
                  type: "div",
                  props: {
                    style: {
                      position: "absolute",
                      left: "48px",
                      top: "48px",
                      width: "984px",
                      height: "1824px",
                      display: "flex",
                      border: "1px solid rgba(255,255,255,.075)",
                      borderRadius: "42px",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,.035)"
                    }
                  }
                },

                /* TOP BRAND */
                {
                  type: "div",
                  props: {
                    style: {
                      position: "absolute",
                      left: "90px",
                      top: "92px",
                      width: "900px",
                      height: "92px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    },
                    children: [
                      {
                        type: "img",
                        props: {
                          src: logoUrl,
                          width: 300,
                          height: 82,
                          style: {
                            width: "300px",
                            height: "82px",
                            objectFit: "contain",
                            objectPosition: "left center"
                          }
                        }
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            padding: "14px 20px",
                            border: "1px solid rgba(196,181,253,.24)",
                            borderRadius: "999px",
                            background: "rgba(124,58,237,.075)",
                            color: "#D8CCFF",
                            fontFamily: "DreamPoster",
                            fontSize: "24px",
                            fontWeight: 800,
                            fontStyle: "italic",
                            letterSpacing: "2px"
                          },
                          children: "DREAM #" + paddedNumber
                        }
                      }
                    ]
                  }
                },

                /* MICRO LABEL */
                {
                  type: "div",
                  props: {
                    style: {
                      position: "absolute",
                      left: "90px",
                      top: "320px",
                      width: "900px",
                      display: "flex",
                      justifyContent: "center",
                      color: "#9E8BCB",
                      fontFamily: "DreamPoster",
                      fontSize: "24px",
                      fontWeight: 800,
                      fontStyle: "italic",
                      letterSpacing: "7px"
                    },
                    children: "ONE HUMAN DREAM"
                  }
                },

                /* PURPLE QUOTE */
                {
                  type: "div",
                  props: {
                    style: {
                      position: "absolute",
                      left: "100px",
                      top: "405px",
                      display: "flex",
                      color: "#A855F7",
                      fontFamily: "Anton",
                      fontSize: "112px",
                      lineHeight: 1,
                      opacity: .92
                    },
                    children: "â€œ"
                  }
                },

                /* DREAM â€” THE HERO */
                {
                  type: "div",
                  props: {
                    style: {
                      position: "absolute",
                      left: "105px",
                      top: "430px",
                      width: "870px",
                      height: "760px",
                      display: "flex",
                      flexWrap: "wrap",
                      alignContent: "center",
                      alignItems: "baseline",
                      justifyContent: "center",
                      textAlign: "center"
                    },
                    children:
                      createDreamWords(
                        dreamText,
                        {
                          size: Math.max(typography.size - 2, 41),
                          wordGap: typography.wordGap + 2,
                          lineHeight: typography.lineHeight
                        }
                      )
                  }
                },

                /* AUTHOR */
                {
                  type: "div",
                  props: {
                    style: {
                      position: "absolute",
                      left: "110px",
                      top: "1240px",
                      width: "860px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center"
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            color: "#8D839B",
                            fontFamily: "DreamPoster",
                            fontSize: "21px",
                            fontWeight: 800,
                            fontStyle: "italic",
                            letterSpacing: "5px"
                          },
                          children: "DREAMED BY"
                        }
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            marginTop: "12px",
                            color: "#FFFFFF",
                            fontFamily: "DreamPoster",
                            fontSize: authorLine.length > 34 ? "42px" : "50px",
                            fontWeight: 800,
                            fontStyle: "italic",
                            lineHeight: 1,
                            letterSpacing: "-.5px"
                          },
                          children: authorLine.toUpperCase()
                        }
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            display: dreamerSocials ? "flex" : "none",
                            marginTop: "18px",
                            color: "#CDBBF8",
                            fontFamily: "DreamPoster",
                            fontSize: "23px",
                            fontWeight: 800,
                            fontStyle: "italic",
                            letterSpacing: ".7px"
                          },
                          children: dreamerSocials
                        }
                      }
                    ]
                  }
                },

                /* BOTTOM SOCIAL SIGNATURE */
                {
                  type: "div",
                  props: {
                    style: {
                      position: "absolute",
                      left: "90px",
                      bottom: "112px",
                      width: "900px",
                      height: "210px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderTop: "1px solid rgba(255,255,255,.09)"
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            color: "#FFFFFF",
                            fontFamily: "Anton",
                            fontSize: "42px",
                            letterSpacing: "1.5px"
                          },
                          children: "ONE OF 1,000,000"
                        }
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            marginTop: "9px",
                            color: "#A78BFA",
                            fontFamily: "DreamPoster",
                            fontSize: "27px",
                            fontWeight: 800,
                            fontStyle: "italic",
                            letterSpacing: "4px"
                          },
                          children: "ONEDREAMEACH.COM"
                        }
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            marginTop: "12px",
                            color: "#716B7B",
                            fontFamily: "DreamPoster",
                            fontSize: "18px",
                            fontWeight: 800,
                       
     fontStyle: "italic",
                            letterSpacing: "2px"
                          },
                          children: "WHAT'S YOUR DREAM?"
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
            height: 1920,
            fonts: [
              {
                name: "Anton",
                data: antonFont,
                weight: 400,
                style: "normal"
              },
              {
                name: "DreamPoster",
                data: barlowFont,
                weight: 800,
                style: "italic"
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
     * NORMAL OPEN GRAPH IMAGE
     * 1200 Ã— 630
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
                          "â€œ" +
                          dreamText +
                          "â€�"
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
                          " Â· " +
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
     * OG â†’ PNG
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





                          
