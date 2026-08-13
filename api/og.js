module.exports = async function handler(req, res) {
  try {

    const {
      ImageResponse
    } = await import(
      "@vercel/og"
    );


    /*
     * URL PARAMS
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


    /*
     * LOAD DREAM
     */

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
     * VALUES
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
        42
      );


    const dreamText =
      String(
        dream.dream_text ||
        ""
      ).slice(
        0,
        280
      );


    const country =
      String(
        dream.country ||
        "WORLD"
      ).slice(
        0,
        60
      );


    /*
     * COLOR TONE
     */

    const toneIndex =
      Math.abs(
        Number(
          dream.dream_number
        ) || 0
      ) % 4;


    const tones = [

      {
        accent:
          "#A78BFA",

        accent2:
          "#7C3AED",

        glow:
          "rgba(139,92,246,.36)"
      },

      {
        accent:
          "#8B5CF6",

        accent2:
          "#6D28D9",

        glow:
          "rgba(124,58,237,.34)"
      },

      {
        accent:
          "#C084FC",

        accent2:
          "#9333EA",

        glow:
          "rgba(168,85,247,.30)"
      },

      {
        accent:
          "#C4B5FD",

        accent2:
          "#8B5CF6",

        glow:
          "rgba(196,181,253,.25)"
      }

    ];


    const tone =
      tones[
        toneIndex
      ];


    /*
     * STORY MODE
     * 1080 x 1920
     *
     * DREAM CARD 2.0
     */

    if (
      mode ===
      "story"
    ) {


      /*
       * ADAPTIVE DREAM TYPOGRAPHY
       */

      let dreamFontSize =
        118;


      let dreamLineHeight =
        1.03;


      let dreamLetterSpacing =
        "-4px";


      if (
        dreamText.length >
        225
      ) {

        dreamFontSize =
          58;

        dreamLineHeight =
          1.12;

        dreamLetterSpacing =
          "-2px";

      }


      else if (
        dreamText.length >
        175
      ) {

        dreamFontSize =
          66;

        dreamLineHeight =
          1.10;

        dreamLetterSpacing =
          "-2.3px";

      }


      else if (
        dreamText.length >
        125
      ) {

        dreamFontSize =
          78;

        dreamLineHeight =
          1.08;

        dreamLetterSpacing =
          "-2.8px";

      }


      else if (
        dreamText.length >
        85
      ) {

        dreamFontSize =
          90;

        dreamLineHeight =
          1.06;

        dreamLetterSpacing =
          "-3.1px";

      }


      else if (
        dreamText.length >
        48
      ) {

        dreamFontSize =
          104;

        dreamLineHeight =
          1.04;

        dreamLetterSpacing =
          "-3.5px";

      }


      /*
       * GENERATE STORY CARD
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

                justifyContent:
                  "space-between",

                position:
                  "relative",

                overflow:
                  "hidden",

                backgroundColor:
                  "#050507",

                backgroundImage:
                  `radial-gradient(circle at 84% 10%, ${tone.glow}, transparent 28%), radial-gradient(circle at 12% 68%, rgba(124,58,237,.13), transparent 34%), linear-gradient(180deg, #08080b 0%, #050507 55%, #07070a 100%)`,

                color:
                  "#F4F4F7",

                padding:
                  "74px 68px 66px",

                fontFamily:
                  "Arial, sans-serif"

              },


              children: [


                /*
                 * LARGE BACKGROUND NUMBER
                 */

                {
                  type:
                    "div",

                  props: {

                    style: {

                      position:
                        "absolute",

                      right:
                        "-30px",

                      top:
                        "300px",

                      color:
                        "rgba(255,255,255,.026)",

                      fontSize:
                        "320px",

                      fontWeight:
                        900,

                      letterSpacing:
                        "-28px",

                      lineHeight:
                        .82

                    },

                    children:
                      paddedNumber

                  }
                },


                /*
                 * DECORATIVE QUOTE
                 */

                {
                  type:
                    "div",

                  props: {

                    style: {

                      position:
                        "absolute",

                      left:
                        "36px",

                      top:
                        "520px",

                      color:
                        "rgba(196,181,253,.05)",

                      fontFamily:
                        "Georgia, serif",

                      fontSize:
                        "340px",

                      lineHeight:
                        .65

                    },

                    children:
                      "“"

                  }
                },


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
                        "100%",

                      position:
                        "relative"

                    },


                    children: [


                      /*
                       * BRAND LEFT
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
                              "16px"

                          },


                          children: [


                            /*
                             * BRAND ICON
                             */

                            {
                              type:
                                "div",

                              props: {

                                style: {

                                  width:
                                    "52px",

                                  height:
                                    "52px",

                                  display:
                                    "flex",

                                  justifyContent:
                                    "center",

                                  alignItems:
                                    "center",

                                  border:
                                    `1px solid ${tone.accent}`,

                                  borderRadius:
                                    "15px",

                                  background:
                                    "rgba(255,255,255,.025)",

                                  color:
                                    tone.accent,

                                  fontSize:
                                    "23px",

                                  fontWeight:
                                    900,

                                  boxShadow:
                                    `0 0 28px ${tone.glow}`

                                },

                                children:
                                  "1"

                              }
                            },


                            /*
                             * BRAND TEXT
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
                                    "3px"

                                },


                                children: [


                                  {
                                    type:
                                      "div",

                                    props: {

                                      style: {

                                        color:
                                          "#F2F2F5",

                                        fontSize:
                                          "25px",

                                        fontWeight:
                                          900,

                                        letterSpacing:
                                          "2px"

                                      },

                                      children:
                                        "ONEDREAMEACH"

                                    }
                                  },


                                  {
                                    type:
                                      "div",

                                    props: {

                                      style: {

                                        color:
                                          "#71717B",

                                        fontSize:
                                          "12px",

                                        fontWeight:
                                          700,

                                        letterSpacing:
                                          "2.1px"

                                      },

                                      children:
                                        "A PLACE FOR EVERY DREAM"

                                    }
                                  }

                                ]

                              }
                            }

                          ]

                        }
                      },


                      /*
                       * 1 OF 1,000,000
                       */

                      {
                        type:
                          "div",

                        props: {

                          style: {

                            padding:
                              "11px 16px",

                            border:
                              "1px solid rgba(255,255,255,.12)",

                            borderRadius:
                              "999px",

                            background:
                              "rgba(255,255,255,.025)",

                            color:
                              "#B5B5C0",

                            fontSize:
                              "14px",

                            fontWeight:
                              800,

                            letterSpacing:
                              "1.3px"

                          },

                          children:
                            "1 OF 1,000,000"

                        }
                      }

                    ]

                  }
                },


                /*
                 * MAIN DREAM AREA
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

                      position:
                        "relative",

                      paddingTop:
                        "54px",

                      paddingBottom:
                        "54px"

                    },


                    children: [


                      /*
                       * DREAM NUMBER + COUNTRY
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

                            marginBottom:
                              "38px"

                          },


                          children: [


                            {
                              type:
                                "div",

                              props: {

                                style: {

                                  color:
                                    tone.accent,

                                  fontSize:
                                    "35px",

                                  fontWeight:
                                    900,

                                  letterSpacing:
                                    "1.2px"

                                },

                                children:
                                  "DREAM #" +
                                  paddedNumber

                              }
                            },


                            {
                              type:
                                "div",

                              props: {

                                style: {

                                  padding:
                                    "10px 15px",

                                  border:
                                    `1px solid ${tone.accent}`,

                                  borderRadius:
                                    "999px",

                                  background:
                                    "rgba(124,58,237,.055)",

                                  color:
                                    "#DAD7E8",

                                  fontSize:
                                    "14px",

                                  fontWeight:
                                    800,

                                  letterSpacing:
                                    "1.4px"

                                },

                                children:
                                  country
                                    .toUpperCase()

                              }
                            }

                          ]

                        }
                      },


                      /*
                       * THE DREAM
                       */

                      {
                        type:
                          "div",

                        props: {

                          style: {

                            maxWidth:
                              "930px",

                            color:
                              "#FFFFFF",

                            fontSize:
                              dreamFontSize +
                              "px",

                            lineHeight:
                              dreamLineHeight,

                            fontWeight:
                              900,

                            letterSpacing:
                              dreamLetterSpacing,

                            whiteSpace:
                              "pre-wrap"

                          },

                          children:
                            dreamText

                        }
                      },
                      /*
                       * DREAMER
                       */

                      {
                        type:
                          "div",

                        props: {

                          style: {

                            marginTop:
                              "48px",

                            display:
                              "flex",

                            alignItems:
                              "center",

                            gap:
                              "17px"

                          },


                          children: [


                            /*
                             * ACCENT LINE
                             */

                            {
                              type:
                                "div",

                              props: {

                                style: {

                                  width:
                                    "50px",

                                  height:
                                    "2px",

                                  background:
                                    tone.accent

                                }

                              }
                            },


                            /*
                             * NICKNAME
                             */

                            {
                              type:
                                "div",

                              props: {

                                style: {

                                  color:
                                    "#E0E0E7",

                                  fontSize:
                                    "27px",

                                  fontWeight:
                                    800

                                },

                                children:
                                  nickname

                              }
                            },


                            /*
                             * DREAMER LABEL
                             */

                            {
                              type:
                                "div",

                              props: {

                                style: {

                                  color:
                                    "#777782",

                                  fontSize:
                                    "14px",

                                  fontWeight:
                                    700,

                                  letterSpacing:
                                    "1.4px"

                                },

                                children:
                                  "DREAMER"

                              }
                            }

                          ]

                        }
                      }

                    ]

                  }
                },


                /*
                 * FOOTER / VIRAL CTA
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
                        "20px",

                      position:
                        "relative"

                    },


                    children: [


                      /*
                       * PURPLE DIVIDER
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
                              `linear-gradient(90deg, transparent, ${tone.accent}, transparent)`,

                            opacity:
                              .52

                          }

                        }
                      },


                      /*
                       * MAIN CTA BOX
                       */

                      {
                        type:
                          "div",

                        props: {

                          style: {

                            width:
                              "100%",

                            padding:
                              "28px 30px",

                            border:
                              "1px solid rgba(167,139,250,.22)",

                            borderRadius:
                              "20px",

                            background:
                              "linear-gradient(135deg, rgba(124,58,237,.12), rgba(255,255,255,.022))",

                            display:
                              "flex",

                            justifyContent:
                              "space-between",

                            alignItems:
                              "center"

                          },


                          children: [


                            /*
                             * CTA LEFT
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
                                    "6px"

                                },


                                children: [


                                  {
                                    type:
                                      "div",

                                    props: {

                                      style: {

                                        color:
                                          "#FFFFFF",

                                        fontSize:
                                          "38px",

                                        fontWeight:
                                          900,

                                        letterSpacing:
                                          "-1px"

                                      },

                                      children:
                                        "WHAT'S YOUR DREAM?"

                                    }
                                  },


                                  {
                                    type:
                                      "div",

                                    props: {

                                      style: {

                                        color:
                                          "#8B8B96",

                                        fontSize:
                                          "14px",

                                        fontWeight:
                                          700,

                                        letterSpacing:
                                          "1px"

                                      },

                                      children:
                                        "LEAVE YOURS · €1 · GET YOUR NUMBER"

                                    }
                                  }

                                ]

                              }
                            },


                            /*
                             * CTA RIGHT
                             */

                            {
                              type:
                                "div",

                              props: {

                                style: {

                                  textAlign:
                                    "right",

                                  display:
                                    "flex",

                                  flexDirection:
                                    "column",

                                  gap:
                                    "5px"

                                },


                                children: [


                                  {
                                    type:
                                      "div",

                                    props: {

                                      style: {

                                        color:
                                          tone.accent,

                                        fontSize:
                                          "22px",

                                        fontWeight:
                                          900

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

                                        color:
                                          "#676772",

                                        fontSize:
                                          "12px",

                                        fontWeight:
                                          700,

                                        letterSpacing:
                                          "1.1px"

                                      },

                                      children:
                                        "SHARE THE DREAM"

                                    }
                                  }

                                ]

                              }
                            }

                          ]

                        }
                      },


                      /*
                       * BOTTOM BRAND LINE
                       */

                      {
                        type:
                          "div",

                        props: {

                          style: {

                            textAlign:
                              "center",

                            color:
                              "#5F5F69",

                            fontSize:
                              "12px",

                            fontWeight:
                              700,

                            letterSpacing:
                              "2px"

                          },

                          children:
                            "ONE PERSON · ONE DREAM · ONE GROWING ARCHIVE"

                        }
                      }

                    ]

                  }
                }

              ]

            }
          },


          /*
           * STORY SIZE
           */

          {
            width:
              1080,

            height:
              1920
          }
        );


      /*
       * TURN STORY INTO PNG
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
        `inline; filename="one-dream-each-${paddedNumber}.png"`
      );


      /*
       * SHORT CACHE WHILE WE
       * PERFECT THE DREAM CARD
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
     * NORMAL OG MODE
     * 1200 x 630
     *
     * This is the horizontal image
     * used when sharing a Dream link.
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

              backgroundColor:
                "#050505",

              backgroundImage:
                `radial-gradient(circle at 82% 12%, ${tone.glow}, transparent 34%)`,

              color:
                "#E8E8ED",

              padding:
                "68px 74px",

              fontFamily:
                "Arial, sans-serif"

            },


            children: [


              /*
               * OG HEADER
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
                      "center"

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
                            "18px"

                        },


                        children: [


                          {
                            type:
                              "div",

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
                                  `1px solid ${tone.accent}`,

                                color:
                                  tone.accent,

                                fontSize:
                                  "25px",

                                fontWeight:
                                  900

                              },

                              children:
                                "1"

                            }
                          },


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
                                  "4px"

                              },


                              children: [


                                {
                                  type:
                                    "div",

                                  props: {

                                    style: {

                                      color:
                                        "#F2F2F5",

                                      fontSize:
                                        "25px",

                                      fontWeight:
                                        900,

                                      letterSpacing:
                                        "2px"

                                    },

                                    children:
                                      "ONEDREAMEACH"

                                  }
                                },


                                {
                                  type:
                                    "div",

                                  props: {

                                    style: {

                                      color:
                                        "#696971",

                                      fontSize:
                                        "12px",

                                      letterSpacing:
                                        "2px"

                                    },

                                    children:
                                      "ONE PERSON · ONE DREAM"

                                  }
                                }

                              ]

                            }
                          }

                        ]

                      }
                    },


                    /*
                     * OG DREAM NUMBER
                     */

                    {
                      type:
                        "div",

                      props: {

                        style: {

                          color:
                            tone.accent,

                          fontSize:
                            "20px",

                          fontWeight:
                            900,

                          letterSpacing:
                            "1.5px"

                        },

                        children:
                          "DREAM #" +
                          paddedNumber

                      }
                    }

                  ]

                }
              },
              /*
               * OG DREAM CONTENT
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

                    maxWidth:
                      "1000px"

                  },


                  children: [


                    /*
                     * DREAMER + COUNTRY
                     */

                    {
                      type:
                        "div",

                      props: {

                        style: {

                          fontSize:
                            "28px",

                          color:
                            "#A7A7B2",

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


                    /*
                     * DREAM TEXT
                     */

                    {
                      type:
                        "div",

                      props: {

                        style: {

                          fontSize:
                            ogFontSize +
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
               * OG FOOTER
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

                    fontSize:
                      "17px",

                    color:
                      "#747480"

                  },


                  children: [


                    {
                      type:
                        "div",

                      props: {

                        children:
                          "One place. One dream."

                      }
                    },


                    {
                      type:
                        "div",

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


    /*
     * TURN OG IMAGE INTO PNG
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
            : String(
                error
              )

      });

  }

};





                      
