const {
  ImageResponse
} = require(
  "@vercel/og"
);


const {
  createClient
} = require(
  "@supabase/supabase-js"
);



/*
 * SUPABASE
 */

const supabase =
  createClient(

    process.env
      .SUPABASE_URL,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY

  );



/*
 * HELPERS
 */

function cleanText(
  value,
  fallback = ""
) {

  if (
    value ===
    null
    ||
    value ===
    undefined
  ) {

    return fallback;

  }


  return String(
    value
  )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}



function getTone(
  number
) {

  const tones = [

    {
      accent:
        "#A78BFA",

      glow:
        "rgba(124,58,237,.24)"
    },

    {
      accent:
        "#C4B5FD",

      glow:
        "rgba(139,92,246,.22)"
    },

    {
      accent:
        "#DDD6FE",

      glow:
        "rgba(167,139,250,.20)"
    }

  ];


  return tones[
    Math.abs(
      Number(number) || 0
    )
    %
    tones.length
  ];

}



/*
 * API
 */

module.exports =
async function handler(
  req,
  res
) {

  try {


    /*
     * QUERY
     */

    const {
      number,
      mode
    } =
      req.query;


    const dreamNumber =
      Number(
        number
      );


    if (
      !Number.isInteger(
        dreamNumber
      )
      ||
      dreamNumber <
      1
    ) {

      return res
        .status(400)
        .json({
          error:
            "Invalid dream number"
        });

    }



    /*
     * LOAD DREAM
     */

    const {
      data,
      error
    } =
      await supabase

        .from(
          "Dreams"
        )

        .select(
          "dream_number,nickname,dream_text,country"
        )

        .eq(
          "dream_number",
          dreamNumber
        )

        .maybeSingle();



    if (
      error
    ) {

      console.error(
        "OG Supabase error:",
        error
      );


      return res
        .status(500)
        .json({
          error:
            "Unable to load dream"
        });

    }



    if (
      !data
    ) {

      return res
        .status(404)
        .json({
          error:
            "Dream not found"
        });

    }



    /*
     * DREAM DATA
     */

    const paddedNumber =
      String(
        data.dream_number
      )
        .padStart(
          6,
          "0"
        );


    const nickname =
      cleanText(
        data.nickname,
        "Anonymous"
      )
        .slice(
          0,
          40
        );


    const dreamText =
      cleanText(
        data.dream_text,
        "A dream waiting to be remembered."
      )
        .slice(
          0,
          280
        );


    const country =
      cleanText(
        data.country,
        "World"
      )
        .slice(
          0,
          60
        );


    const tone =
      getTone(
        data.dream_number
      );



    /*
     * STORY MODE
     * 1080 x 1920
     *
     * DREAM CARD 2.0
     *
     * The Dream is intentionally
     * the strongest visual element.
     */

    if (
      mode ===
      "story"
    ) {


      /*
       * ADAPTIVE DREAM TYPOGRAPHY
       *
       * Short dreams become huge.
       * Longer dreams progressively
       * scale down so the card remains
       * elegant and readable.
       */

      let dreamFontSize =
        116;


      let dreamLineHeight =
        1.03;


      let dreamLetterSpacing =
        "-4px";



      if (
        dreamText.length >
        220
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
        170
      ) {

        dreamFontSize =
          66;

        dreamLineHeight =
          1.10;

        dreamLetterSpacing =
          "-2.4px";

      }


      else if (
        dreamText.length >
        120
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
        80
      ) {

        dreamFontSize =
          92;

        dreamLineHeight =
          1.06;

        dreamLetterSpacing =
          "-3.2px";

      }


      else if (
        dreamText.length >
        45
      ) {

        dreamFontSize =
          104;

        dreamLineHeight =
          1.04;

        dreamLetterSpacing =
          "-3.6px";

      }



      /*
       * CREATE STORY CARD
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
                  "#050506",

                backgroundImage:
                  `radial-gradient(circle at 82% 10%, ${tone.glow}, transparent 30%), radial-gradient(circle at 14% 62%, rgba(124,58,237,.14), transparent 37%), linear-gradient(180deg, #08080b 0%, #050506 52%, #060609 100%)`,

                color:
                  "#F4F4F7",

                padding:
                  "70px 68px 66px",

                fontFamily:
                  "Arial, sans-serif"

              },


              children: [


                /*
                 * HUGE DREAM NUMBER
                 * IN THE BACKGROUND
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

                      top:
                        "250px",

                      color:
                        "rgba(255,255,255,.025)",

                      fontSize:
                        "360px",

                      fontWeight:
                        900,

                      letterSpacing:
                        "-30px",

                      lineHeight:
                        .8

                    },


                    children:
                      paddedNumber

                  }

                },



                /*
                 * GIANT DECORATIVE
                 * QUOTATION MARK
                 */

                {

                  type:
                    "div",


                  props: {


                    style: {

                      position:
                        "absolute",

                      left:
                        "38px",

                      top:
                        "500px",

                      color:
                        "rgba(196,181,253,.055)",

                      fontFamily:
                        "Georgia, serif",

                      fontSize:
                        "360px",

                      lineHeight:
                        .65

                    },


                    children:
                      "“"

                  }

                },



                /*
                 * TOP BRAND AREA
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
                        2

                    },


                    children: [


                      /*
                       * LEFT BRAND
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
                             * SMALL BRAND MARK
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

                                  borderRadius:
                                    "15px",

                                  border:
                                    `1px solid ${tone.accent}`,

                                  background:
                                    "rgba(255,255,255,.025)",

                                  display:
                                    "flex",

                                  alignItems:
                                    "center",

                                  justifyContent:
                                    "center",

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
                                          "2.2px"

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
                       * COLLECTIBLE BADGE
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
                              "1.5px"

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

                      zIndex:
                        2,

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
                              "42px"

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

                                  color:
                                    tone.accent,

                                  fontSize:
                                    "34px",

                                  fontWeight:
                                    900,

                                  letterSpacing:
                                    "1.4px",

                                  textShadow:
                                    `0 0 24px ${tone.glow}`

                                },


                                children:
                                  "DREAM #" +
                                  paddedNumber

                              }

                            },



                            /*
                             * COUNTRY BADGE
                             */

                            {

                              type:
                                "div",


                              props: {


                                style: {

                                  padding:
                                    "10px 15px",

                                  borderRadius:
                                    "999px",

                                  border:
                                    `1px solid ${tone.accent}`,

                                  background:
                                    "rgba(124,58,237,.06)",

                                  color:
                                    "#D8D4E8",

                                  fontSize:
                                    "14px",

                                  fontWeight:
                                    800,

                                  letterSpacing:
                                    "1.5px"

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
                       *
                       * This is intentionally
                       * the visual hero.
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
                              "pre-wrap",

                            textWrap:
                              "balance",

                            textShadow:
                              "0 10px 44px rgba(0,0,0,.30)"

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
                              "18px"

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
                                    "52px",

                                  height:
                                    "2px",

                                  background:
                                    tone.accent,

                                  boxShadow:
                                    `0 0 18px ${tone.glow}`

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
                                    "15px",

                                  fontWeight:
                                    700,

                                  letterSpacing:
                                    "1.5px"

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
                 * VIRAL CTA FOOTER
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
                        2,

                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap:
                        "22px"

                    },


                    children: [


                      /*
                       * GLOW DIVIDER
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
                              .58

                          }

                        }

                      },



                      /*
                       * CTA CARD
                       */

                      {

                        type:
                          "div",


                        props: {


                          style: {

                            width:
                              "100%",

                            padding:
                              "30px 32px",

                            border:
                              "1px solid rgba(167,139,250,.22)",

                            borderRadius:
                              "22px",

                            background:
                              "linear-gradient(135deg, rgba(124,58,237,.12), rgba(255,255,255,.025))",

                            display:
                              "flex",

                            justifyContent:
                              "space-between",

                            alignItems:
                              "center",

                            boxShadow:
                              `0 18px 55px rgba(0,0,0,.20), 0 0 36px ${tone.glow}`

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
                                    "7px"

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
                                          "#8C8C98",

                                        fontSize:
                                          "14px",

                                        fontWeight:
                                          700,

                                        letterSpacing:
                                          "1.2px"

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
                                    "6px"

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
                                          "1.2px"

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
           * STORY DIMENSIONS
           */

          {

            width:
              1080,

            height:
              1920

          }

        );



      /*
       * CONVERT STORY
       * TO PNG BUFFER
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
       * SHORT CACHE WHILE
       * WE PERFECT THE DESIGN
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
     * This is NOT the Story Card.
     * It is the horizontal preview
     * used when a Dream URL is shared.
     */

    const ogFontSize =
      dreamText.length >
      200
        ? 42
        : dreamText.length >
          140
          ? 48
          : dreamText.length >
            90
            ? 54
            : 62;



    const ogImage =
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
                "#050505",

              backgroundImage:
                `radial-gradient(circle at 82% 12%, ${tone.glow}, transparent 34%), radial-gradient(circle at 12% 86%, rgba(124,58,237,.08), transparent 30%)`,

              color:
                "#FFFFFF",

              padding:
                "48px 56px",

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

                          color:
                            "#F2F2F5",

                          fontSize:
                            "22px",

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
                            tone.accent,

                          fontSize:
                            "17px",

                          fontWeight:
                            900,

                          letterSpacing:
                            "1.2px"

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

                    gap:
                      "22px",

                    maxWidth:
                      "1040px"

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
                            ogFontSize +
                            "px",

                          lineHeight:
                            1.08,

                          fontWeight:
                            900,

                          letterSpacing:
                            "-2px"

                        },


                        children:
                          dreamText

                      }

                    },


                    {

                      type:
                        "div",


                      props: {


                        style: {

                          color:
                            "#9898A3",

                          fontSize:
                            "18px",

                          fontWeight:
                            700

                        },


                        children:
                          "— " +
                          nickname +
                          " · " +
                          country

                      }

                    }

                  ]

                }

              },






                    
