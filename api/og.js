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
        .join("   •   ");

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
     * STORY MODE V6 - SOCIAL FIRST
     * 1080 x 1920
     * =====================================================
     */

    if (mode === "story") {
      const baseTypography = getDreamTypography(dreamText.length);

      // Keep the dream visually dominant but never oversized.
      const storyDreamSize = Math.max(
        50,
        Math.min(82, baseTypography.size)
      );

      const storyDreamLineHeight =
        dreamText.length > 190 ? 1.08 : 1.04;

      const storyImage = new ImageResponse(
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
                "radial-gradient(circle at 50% 32%, rgba(124,58,237,.26), transparent 32%), radial-gradient(circle at 92% 88%, rgba(91,33,182,.18), transparent 30%), linear-gradient(180deg, #080611 0%, #05050A 46%, #07070D 100%)",
              color: "#FFFFFF",
              fontFamily: "DreamPoster"
            },
            children: [

              // Fine border
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "42px",
                    top: "42px",
                    width: "996px",
                    height: "1836px",
                    display: "flex",
                    border: "1px solid rgba(196,181,253,.18)",
                    borderRadius: "38px"
                  }
                }
              },

              // Brand logo
              {
                type: "img",
                props: {
                  src: logoUrl,
                  width: 300,
                  height: 90,
                  style: {
                    position: "absolute",
                    left: "78px",
                    top: "76px",
                    width: "300px",
                    height: "90px",
                    objectFit: "contain",
                    objectPosition: "left center"
                  }
                }
              },

              // Social identity badge
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    right: "78px",
                    top: "88px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "66px",
                    padding: "0 26px",
                    border: "1px solid rgba(167,139,250,.38)",
                    borderRadius: "999px",
                    background: "rgba(124,58,237,.11)",
                    color: "#E9D5FF",
                    fontSize: "27px",
                    fontWeight: 800,
                    fontStyle: "italic",
                    letterSpacing: "2px"
                  },
                  children: "I'M DREAM #" + paddedNumber
                }
              },

              // Micro-label
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "90px",
                    top: "274px",
                    width: "900px",
                    display: "flex",
                    justifyContent: "center",
                    color: "#BFA4FF",
                    fontSize: "24px",
                    fontWeight: 800,
                    fontStyle: "italic",
                    letterSpacing: "8px"
                  },
                  children: "ONE HUMAN DREAM"
                }
              },

              // Main dream number - strong identity, not giant
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "80px",
                    top: "320px",
                    width: "920px",
                    height: "180px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontFamily: "Anton",
                    fontSize: "132px",
                    fontWeight: 400,
                    letterSpacing: "6px",
                    lineHeight: 1
                  },
                  children: "#" + paddedNumber
                }
              },

              // Accent line
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "390px",
                    top: "510px",
                    width: "300px",
                    height: "5px",
                    display: "flex",
                    borderRadius: "999px",
                    background: "linear-gradient(90deg, rgba(124,58,237,0), #A855F7, rgba(124,58,237,0))"
                  }
                }
              },

              // Dream statement container
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "105px",
                    top: "565px",
                    width: "870px",
                    height: "590px",
                    display: "flex",
                    flexWrap: "wrap",
                    alignContent: "center",
                    alignItems: "baseline",
                    justifyContent: "center",
                    textAlign: "center"
                  },
                  children: dreamText
                    .toUpperCase()
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((word, index) => {
                      const normalized = word
                        .toLowerCase()
                        .replace(/[^a-zà-ÿ]/gi, "");
                      const highlighted = highlightWords.has(normalized);

                      return {
                        type: "div",
                        props: {
                          key: "story-word-" + index,
                          style: {
                            display: "flex",
                            marginRight: "15px",
                            marginBottom: "10px",
                            color: highlighted ? "#A855F7" : "#FFFFFF",
                            fontSize: storyDreamSize + "px",
                            fontWeight: 800,
                            fontStyle: "italic",
                            lineHeight: storyDreamLineHeight,
                            letterSpacing: "-1.5px"
                          },
                          children: word
                        }
                      };
                    })
                }
              },

              // Dreamer block
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "105px",
                    top: "1215px",
                    width: "870px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          color: "#8D819F",
                          fontSize: "21px",
                          fontWeight: 800,
                          fontStyle: "italic",
                          letterSpacing: "6px",
                          marginBottom: "14px"
                        },
                        children: "DREAMED BY"
                      }
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#FFFFFF",
                          fontSize: nickname.length > 22 ? "44px" : "52px",
                          fontWeight: 800,
                          fontStyle: "italic",
                          lineHeight: 1,
                          textAlign: "center"
                        },
                        children: nickname.toUpperCase()
                      }
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "2px",
                          height: "24px",
                          display: "flex",
                          margin: "14px 0",
                          background: "rgba(168,85,247,.7)"
                        }
                      }
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          color: "#C4B5FD",
                          fontSize: country.length > 24 ? "28px" : "34px",
                          fontWeight: 800,
                          fontStyle: "italic",
                          letterSpacing: "2px",
                          textAlign: "center"
                        },
                        children: country.toUpperCase()
                      }
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: instagramHandle || tiktokHandle ? "flex" : "none",
                          marginTop: "22px",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "18px",
                          color: "#D8CCF7",
                          fontSize: "21px",
                          fontWeight: 800,
                          fontStyle: "italic"
                        },
                        children: [
                          instagramHandle
                            ? {
                                type: "div",
                                props: {
                                  style: { display: "flex" },
                                  children: "IG " + instagramHandle
                                }
                              }
                            : null,
                          instagramHandle && tiktokHandle
                            ? {
                                type: "div",
                                props: {
                                  style: {
                                    width: "1px",
                                    height: "24px",
                                    display: "flex",
                                    background: "rgba(255,255,255,.18)"
                                  }
                                }
                              }
                            : null,
                          tiktokHandle
                            ? {
                                type: "div",
                                props: {
                                  style: { display: "flex" },
                                  children: "TT " + tiktokHandle
                                }
                              }
                            : null
                        ].filter(Boolean)
                      }
                    }
                  ]
                }
              },

              // Footer separator
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "88px",
                    top: "1540px",
                    width: "904px",
                    height: "1px",
                    display: "flex",
                    background: "rgba(255,255,255,.10)"
                  }
                }
              },

              // Viral CTA
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "90px",
                    top: "1595px",
                    width: "900px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          color: "#FFFFFF",
                          fontFamily: "Anton",
                          fontSize: "58px",
                          fontWeight: 400,
                          letterSpacing: "1px",
                          lineHeight: 1
                        },
                        children: "WHAT'S YOUR DREAM?"
                      }
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          marginTop: "20px",
                          color: "#B56BFF",
                          fontSize: "31px",
                          fontWeight: 800,
                          fontStyle: "italic",
                          letterSpacing: "5px"
                        },
                        children: "ONEDREAMEACH.COM"
                      }
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          marginTop: "20px",
                          padding: "13px 24px",
                          border: "1px solid rgba(167,139,250,.28)",
                          borderRadius: "999px",
                          background: "rgba(124,58,237,.08)",
                          color: "#C9BDD9",
                          fontSize: "19px",
                          fontWeight: 800,
                          fontStyle: "italic",
                          letterSpacing: "2px"
                        },
                        children: "ONE DREAM. ONE NUMBER. ONE PLACE FOREVER."
                      }
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          marginTop: "18px",
                          color: "#68616F",
                          fontSize: "18px",
                          fontWeight: 800,
                          fontStyle: "italic",
                          letterSpacing: "3px"
                        },
                        children: "1 OF 1,000,000"
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

      const storyBuffer = await storyImage.arrayBuffer();

      res.setHeader("Content-Type", "image/png");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="onedreameach-dream-${paddedNumber}.png"`
      );
      res.setHeader(
        "Cache-Control",
        "public, max-age=0, s-maxage=120, stale-while-revalidate=600"
      );

      return res.status(200).send(Buffer.from(storyBuffer));
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





                          
