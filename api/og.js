module.exports = async function handler(req, res) {

  try {

    const {
      ImageResponse
    } = await import(
      "@vercel/og"
    );


    /*
     * =====================================================
     * REQUEST
     * =====================================================
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


    const mode =
      requestUrl.searchParams.get(
        "mode"
      ) || "og";


    if (!number) {

      return res
        .status(400)
        .json({
          error:
            "Dream number required"
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
     * REAL ONEDREAMEACH LOGO
     *
     * This is the actual logo.png
     * uploaded to the root of the site.
     */

    const logoUrl =
      "https://onedreameach.com/logo.png";


    /*
     * =====================================================
     * DREAM CARD
     * 1080 x 1920
     * EDITORIAL / MANIFESTO EDITION
     * =====================================================
     */

    if (
      mode ===
      "story"
    ) {


      /*
       * DREAM FONT SIZE
       *
       * The shorter the dream,
       * the more dramatic it becomes.
       */

      let dreamFontSize =
        126;


      let dreamLineHeight =
        1.02;


      let dreamSpacing =
        "-4.5px";


      if (
        dreamText.length >
        230
      ) {

        dreamFontSize =
          58;

        dreamLineHeight =
          1.12;

        dreamSpacing =
          "-1.5px";

      }


      else if (
        dreamText.length >
        180
      ) {

        dreamFontSize =
          66;

        dreamLineHeight =
          1.10;

        dreamSpacing =
          "-2px";

      }


      else if (
        dreamText.length >
        135
      ) {

        dreamFontSize =
          76;

        dreamLineHeight =
          1.08;

        dreamSpacing =
          "-2.4px";

      }


      else if (
        dreamText.length >
        95
      ) {

        dreamFontSize =
          88;

        dreamLineHeight =
          1.06;

        dreamSpacing =
          "-3px";

      }


      else if (
        dreamText.length >
        60
      ) {

        dreamFontSize =
          104;

        dreamLineHeight =
          1.04;

        dreamSpacing =
          "-3.6px";

      }


      /*
       * =====================================================
       * STORY IMAGE
       * =====================================================
       */

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

                flexDirection:
                  "column",

                position:
                  "relative",

                overflow:
                  "hidden",

                /*
                 * New palette:
                 *
                 * black
                 * midnight blue
                 * violet
                 * subtle warm magenta
                 */

                backgroundColor:
                  "#05050A",

                backgroundImage:
                  "radial-gradient(circle at 85% 8%, rgba(109,40,217,.28), transparent 28%), radial-gradient(circle at 0% 58%, rgba(49,46,129,.24), transparent 35%), radial-gradient(circle at 95% 92%, rgba(157,23,77,.12), transparent 30%), linear-gradient(155deg, #080812 0%, #05050A 48%, #090611 100%)",

                color:
                  "#F7F5F2",

                padding:
                  "72px 70px 68px",

                fontFamily:
                  "Georgia, serif"

              },


              children: [


                /*
                 * =================================================
                 * AMBIENT GLOW
                 * =================================================
                 */

                {

                  type:
                    "div",


                  props: {


                    style: {

                      position:
                        "absolute",

                      width:
                        "580px",

                      height:
                        "580px",

                      borderRadius:
                        "999px",

                      right:
                        "-310px",

                      top:
                        "430px",

                      background:
                        "rgba(124,58,237,.10)",

                      boxShadow:
                        "0 0 180px rgba(124,58,237,.22)"

                    }

                  }

                },


                /*
                 * =================================================
                 * HUGE COLLECTIBLE NUMBER
                 * =================================================
                 */

                {

                  type:
                    "div",


                  props: {


                    style: {

                      position:
                        "absolute",

                      right:
                        "-36px",

                      top:
                        "330px",

                      display:
                        "flex",

                      color:
                        "rgba(255,255,255,.027)",

                      fontFamily:
                        "Arial, sans-serif",

                      fontSize:
                        "315px",

                      fontWeight:
                        900,

                      letterSpacing:
                        "-30px",

                      lineHeight:
                        .85

                    },


                    children:
                      paddedNumber

                  }

                },


                /*
                 * =================================================
                 * THIN FRAME
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
                        "34px",

                      top:
                        "34px",

                      right:
                        "34px",

                      bottom:
                        "34px",

                      border:
                        "1px solid rgba(255,255,255,.07)",

                      borderRadius:
                        "30px"

                    }

                  }

                },


                /*
                 * =================================================
                 * HEADER
                 * =================================================
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
                        5

                    },


                    children: [


                      /*
                       * REAL LOGO
                       */

                      {

                        type:
                          "img",


                        props: {

                          src:
                            logoUrl,

                          width:
                            310,

                          height:
                            90,

                          style: {

                            width:
                              "310px",

                            height:
                              "90px",

                            objectFit:
                              "contain",

                            objectPosition:
                              "left center"

                          }

                        }

                      },


                      /*
                       * COLLECTION MARK
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

                            alignItems:
                              "flex-end",

                            gap:
                              "6px",

                            fontFamily:
                              "Arial, sans-serif"

                          },


                          children: [


                            {

                              type:
                                "div",


                              props: {


                                style: {

                                  color:
                                    "#A78BFA",

                                  fontSize:
                                    "14px",

                                  fontWeight:
                                    800,

                                  letterSpacing:
                                    "3px"

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

                                  color:
                                    "rgba(255,255,255,.40)",

                                  fontSize:
                                    "12px",

                                  fontWeight:
                                    600,

                                  letterSpacing:
                                    "2px"

                                },


                                children:
                                  "EST. 2026"

                              }

                            }

                          ]

                        }

                      }

                    ]

                  }

                },


                /*
                 * =================================================
                 * MAIN MANIFESTO
                 * =================================================
                 */

                {

                  type:
                    "div",


                  props: {


                    style: {

                      flex:
                        1,

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
                        4,

                      padding:
                        "70px 10px 45px"

                    },


                    children: [


                      /*
                       * DREAM NUMBER
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
                              "18px",

                            marginBottom:
                              "48px",

                            fontFamily:
                              "Arial, sans-serif"

                          },


                          children: [


                            {

                              type:
                                "div",


                              props: {


                                style: {

                                  width:
                                    "58px",

                                  height:
                                    "2px",

                                  background:
                                    "linear-gradient(90deg, #7C3AED, #C4B5FD)",

                                  boxShadow:
                                    "0 0 22px rgba(139,92,246,.45)"

                                }

                              }

                            },


                            {

                              type:
                                "div",


                              props: {


                                style: {

                                  color:
                                    "#C4B5FD",

                                  fontSize:
                                    "21px",

                                  fontWeight:
                                    800,

                                  letterSpacing:
                                    "4px"

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
                       * LARGE OPENING QUOTE
                       */

                      {

                        type:
                          "div",


                        props: {


                          style: {

                            position:
                              "absolute",

                            left:
                              "-8px",

                            top:
                              "180px",

                            display:
                              "flex",

                            color:
                              "rgba(196,181,253,.13)",

                            fontFamily:
                              "Georgia, serif",

                            fontSize:
                              "190px",

                            lineHeight:
                              .7

                          },


                          children:
                            "“"

                        }

                      },


                      /*
                       * DREAM TEXT
                       */

                      {

                        type:
                          "div",


                        props: {


                          style: {

                            maxWidth:
                              "920px",

                            display:
                              "flex",

                            color:
                              "#F5F1EB",

                            fontFamily:
                              "Georgia, serif",

                            fontStyle:
                              "italic",

                            fontSize:
                              dreamFontSize +
                              "px",

                            lineHeight:
                              dreamLineHeight,

                            fontWeight:
                              700,

                            letterSpacing:
                              dreamSpacing,

                            whiteSpace:
                              "pre-wrap",

                            textShadow:
                              "0 12px 50px rgba(0,0,0,.45)"

                          },


                          children:
                            dreamText

                        }

                      },


                      /*
                       * AUTHOR AREA
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

                            justifyContent:
                              "space-between",

                            marginTop:
                              "58px",

                            fontFamily:
                              "Arial, sans-serif"

                          },


                          children: [


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
                                    "14px"

                                },


                                children: [


                                  {

                                    type:
                                      "div",


                                    props: {


                                      style: {

                                        width:
                                          "9px",

                                        height:
                                          "9px",

                                        borderRadius:
                                          "999px",

                                        background:
                                          "#A78BFA",

                                        boxShadow:
                                          "0 0 20px rgba(167,139,250,.8)"

                                      }

                                    }

                                  },


                                  {

                                    type:
                                      "div",


                                    props: {


                                      style: {

                                        color:
                                          "#E8E5E1",

                                        fontSize:
                                          "25px",

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


                            {

                              type:
                                "div",


                              props: {


                                style: {

                                  color:
                                    "rgba(255,255,255,.45)",

                                  fontSize:
                                    "15px",

                                  fontWeight:
                                    700,

                                  letterSpacing:
                                    "2px",

                                  textTransform:
                                    "uppercase"

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

                },
                /*
                 * =================================================
                 * SIGNATURE / MANIFESTO FOOTER
                 * =================================================
                 */

                {

                  type:
                    "div",


                  props: {


                    style: {

                      width:
                        "100%",

                      position:
                        "relative",

                      zIndex:
                        5,

                      display:
                        "flex",

                      flexDirection:
                        "column",

                      padding:
                        "0 10px 8px"

                    },


                    children: [


                      /*
                       * SOFT DIVIDER
                       */

                      {

                        type:
                          "div",


                        props: {


                          style: {

                            width:
                              "100%",

                            height:
                              "1px",

                            background:
                              "linear-gradient(90deg, rgba(167,139,250,.70), rgba(255,255,255,.12), transparent)",

                            marginBottom:
                              "34px"

                          }

                        }

                      },


                      /*
                       * QUESTION
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
                              "flex-end",

                            width:
                              "100%"

                          },


                          children: [


                            /*
                             * LEFT SIDE
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

                                  gap:
                                    "10px"

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
                                          "47px",

                                        fontWeight:
                                          700,

                                        letterSpacing:
                                          "-1.5px"

                                      },


                                      children:
                                        "What's your dream?"

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
                                          "rgba(255,255,255,.42)",

                                        fontFamily:
                                          "Arial, sans-serif",

                                        fontSize:
                                          "13px",

                                        fontWeight:
                                          700,

                                        letterSpacing:
                                          "2.5px"

                                      },


                                      children:
                                        "ADD YOURS TO THE ARCHIVE"

                                    }

                                  }

                                ]

                              }

                            },


                            /*
                             * DOMAIN
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

                                  alignItems:
                                    "flex-end",

                                  gap:
                                    "7px",

                                  fontFamily:
                                    "Arial, sans-serif"

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
                                          "#C4B5FD",

                                        fontSize:
                                          "22px",

                                        fontWeight:
                                          900,

                                        letterSpacing:
                                          "-.4px"

                                      },


                                      children:
                                        "onedreameach.com"

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
                                          "rgba(255,255,255,.32)",

                                        fontSize:
                                          "11px",

                                        fontWeight:
                                          700,

                                        letterSpacing:
                                          "2px"

                                      },


                                      children:
                                        "ONE DREAM · ONE PLACE"

                                    }

                                  }

                                ]

                              }

                            }

                          ]

                        }

                      },


                      /*
                       * VERY BOTTOM COLLECTION LINE
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
                              "100%",

                            marginTop:
                              "34px",

                            paddingTop:
                              "19px",

                            borderTop:
                              "1px solid rgba(255,255,255,.045)",

                            fontFamily:
                              "Arial, sans-serif"

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
                                    "rgba(255,255,255,.27)",

                                  fontSize:
                                    "11px",

                                  fontWeight:
                                    700,

                                  letterSpacing:
                                    "2.4px"

                                },


                                children:
                                  "A HUMAN DREAM ARCHIVE"

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
                                    "rgba(255,255,255,.27)",

                                  fontSize:
                                    "11px",

                                  fontWeight:
                                    700,

                                  letterSpacing:
                                    "2.4px"

                                },


                                children:
                                  "#" +
                                  paddedNumber +
                                  " / 1,000,000"

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


          /*
           * =====================================================
           * INSTAGRAM / TIKTOK STORY FORMAT
           * =====================================================
           */

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


      /*
       * Shorter cache while we are
       * still refining the visual design.
       */

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
     * 1200 x 630
     *
     * This is separate from the Story Card.
     * Used when somebody shares a Dream URL.
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


    /*
     * =====================================================
     * HORIZONTAL OG IMAGE
     * =====================================================
     */

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
               * OG BACKGROUND NUMBER
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
               * OG HEADER
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


                    /*
                     * REAL LOGO
                     */

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


                    /*
                     * DREAM NUMBER
                     */

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
               * OG MAIN DREAM
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
               * OG FOOTER
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


        /*
         * OG SIZE
         */

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


  /*
   * =====================================================
   * ERROR HANDLING
   * =====================================================
   */

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
            : String(
                error
              )

      });

  }

};



                
