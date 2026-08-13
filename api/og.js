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
     */

    if (
      mode ===
      "story"
    ) {


      let dreamFontSize =
        76;


      if (
        dreamText.length >
        210
      ) {

        dreamFontSize =
          50;

      }

      else if (
        dreamText.length >
        155
      ) {

        dreamFontSize =
          57;

      }

      else if (
        dreamText.length >
        95
      ) {

        dreamFontSize =
          65;

      }


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
                  `radial-gradient(circle at 86% 9%, ${tone.glow}, transparent 28%), radial-gradient(circle at 12% 76%, rgba(124,58,237,.13), transparent 34%), linear-gradient(180deg, #07070a 0%, #050507 100%)`,

                color:
                  "#E8E8ED",

                padding:
                  "88px 78px 82px",

                fontFamily:
                  "Arial, sans-serif"

              },


              children: [


                /*
                 * BIG QUOTE
                 */

                {
                  type:
                    "div",

                  props: {

                    style: {

                      position:
                        "absolute",

                      top:
                        "310px",

                      right:
                        "-36px",

                      fontSize:
                        "430px",

                      lineHeight:
                        .75,

                      color:
                        "rgba(196,181,253,.055)",

                      fontFamily:
                        "Georgia, serif"

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
                                    "62px",

                                  height:
                                    "62px",

                                  display:
                                    "flex",

                                  justifyContent:
                                    "center",

                                  alignItems:
                                    "center",

                                  border:
                                    `1px solid ${tone.accent}`,

                                  borderRadius:
                                    "16px",

                                  background:
                                    "rgba(255,255,255,.025)",

                                  color:
                                    tone.accent,

                                  fontSize:
                                    "27px",

                                  fontWeight:
                                    800,

                                  boxShadow:
                                    `0 0 30px ${tone.glow}`

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
                                    "5px"

                                },


                                children: [


                                  {
                                    type:
                                      "div",

                                    props: {

                                      style: {

                                        fontSize:
                                          "25px",

                                        fontWeight:
                                          800,

                                        letterSpacing:
                                          "3px"

                                      },

                                      children:
                                        "ONE DREAM EACH"

                                    }
                                  },


                                  {
                                    type:
                                      "div",

                                    props: {

                                      style: {

                                        color:
                                          "#747480",

                                        fontSize:
                                          "13px",

                                        letterSpacing:
                                          "2px"

                                      },

                                      children:
                                        "ONE MILLION PEOPLE · ONE MILLION DREAMS"

                                    }
                                  }

                                ]

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

                            padding:
                              "11px 16px",

                            border:
                              `1px solid ${tone.accent}`,

                            borderRadius:
                              "999px",

                            color:
                              tone.accent,

                            fontSize:
                              "19px",

                            fontWeight:
                              800,

                            letterSpacing:
                              "2px"

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
                 * MAIN CONTENT
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

                      paddingTop:
                        "70px",

                      paddingBottom:
                        "70px"

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
                              "12px",

                            marginBottom:
                              "34px"

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
                                    "15px",

                                  fontWeight:
                                    800,

                                  letterSpacing:
                                    "3px"

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

                                  color:
                                    "#747480",

                                  fontSize:
                                    "14px"

                                },

                                children:
                                  "·"

                              }
                            },


                            {
                              type:
                                "div",

                              props: {

                                style: {

                                  color:
                                    "#A7A7B2",

                                  fontSize:
                                    "15px",

                                  fontWeight:
                                    700,

                                  letterSpacing:
                                    "2px"

                                },

                                children:
                                  country
                                    .toUpperCase()

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

                            maxWidth:
                              "900px",

                            color:
                              "#F0F0F4",

                            fontSize:
                              dreamFontSize +
                              "px",

                            lineHeight:
                              1.16,

                            fontWeight:
                              800,

                            letterSpacing:
                              "-2.5px",

                            whiteSpace:
                              "pre-wrap"

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

                            marginTop:
                              "44px",

                            display:
                              "flex",

                            flexDirection:
                              "column",

                            gap:
                              "8px"

                          },


                          children: [


                            {
                              type:
                                "div",

                              props: {

                                style: {

                                  color:
                                    "#666672",

                                  fontSize:
                                    "13px",

                                  fontWeight:
                                    700,

                                  letterSpacing:
                                    "3px"

                                },

                                children:
                                  "DREAMED BY"

                              }
                            },


                            {
                              type:
                                "div",

                              props: {

                                style: {

                                  color:
                                    "#DCDCE4",

                                  fontSize:
                                    "31px",

                                  fontWeight:
                                    800

                                },

                                children:
                                  nickname

                              }
                            }

                          ]

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

                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap:
                        "26px"

                    },


                    children: [


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
                              .40

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

                            justifyContent:
                              "space-between",

                            alignItems:
                              "flex-end"

                          },


                          children: [


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
                                    "7px"

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
                                          "18px",

                                        fontWeight:
                                          800,

                                        letterSpacing:
                                          "2px"

                                      },

                                      children:
                                        dream.dream_number +
                                        " / 1,000,000"

                                    }
                                  },


                                  {
                                    type:
                                      "div",

                                    props: {

                                      style: {

                                        color:
                                          "#747480",

                                        fontSize:
                                          "14px",

                                        letterSpacing:
                                          "1px"

                                      },

                                      children:
                                        "YOUR DREAM HAS A PLACE"

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

                                  textAlign:
                                    "right",

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

                                        color:
                                          "#E8E8ED",

                                        fontSize:
                                          "21px",

                                        fontWeight:
                                          800

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
                                          "#666672",

                                        fontSize:
                                          "13px",

                                        letterSpacing:
                                          "1px"

                                      },

                                      children:
                                        "WHAT'S YOUR DREAM?"

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


      res.setHeader(
        "Cache-Control",
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
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
                                  700

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
                      type:
                        "div",

                      props: {

                        style: {

                          fontSize:
                            "19px",

                          color:
                            tone.accent,

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
               * OG DREAM
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
