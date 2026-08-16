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
     * =========================================================
     * SUPABASE
     * =========================================================
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
     * =========================================================
     * DYNAMIC DATA
     * =========================================================
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
          40
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

    function normalizeSocial(value) {
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

      return (
        "@" +
        clean.slice(
          0,
          30
        )
      );
    }

    const instagramHandle =
      normalizeSocial(
        dream.instagram
      );

    const tiktokHandle =
      normalizeSocial(
        dream.tiktok
      );

    /*
     * =========================================================
     * COUNTRY FLAGS
     * =========================================================
     */

    const COUNTRY_CODES = {
      "afghanistan":"af",
      "albania":"al",
      "algeria":"dz",
      "andorra":"ad",
      "angola":"ao",
      "argentina":"ar",
      "armenia":"am",
      "australia":"au",
      "austria":"at",
      "azerbaijan":"az",
      "bahamas":"bs",
      "bahrain":"bh",
      "bangladesh":"bd",
      "barbados":"bb",
      "belarus":"by",
      "belgium":"be",
      "belize":"bz",
      "benin":"bj",
      "bhutan":"bt",
      "bolivia":"bo",
      "bosnia and herzegovina":"ba",
      "botswana":"bw",
      "brazil":"br",
      "brunei":"bn",
      "bulgaria":"bg",
      "burkina faso":"bf",
      "burundi":"bi",
      "cambodia":"kh",
      "cameroon":"cm",
      "canada":"ca",
      "cape verde":"cv",
      "central african republic":"cf",
      "chad":"td",
      "chile":"cl",
      "china":"cn",
      "colombia":"co",
      "comoros":"km",
      "congo":"cg",
      "costa rica":"cr",
      "croatia":"hr",
      "cuba":"cu",
      "cyprus":"cy",
      "czech republic":"cz",
      "czechia":"cz",
      "denmark":"dk",
      "dominican republic":"do",
      "ecuador":"ec",
      "egypt":"eg",
      "el salvador":"sv",
      "estonia":"ee",
      "ethiopia":"et",
      "fiji":"fj",
      "finland":"fi",
      "france":"fr",
      "gabon":"ga",
      "gambia":"gm",
      "georgia":"ge",
      "germany":"de",
      "ghana":"gh",
      "greece":"gr",
      "guatemala":"gt",
      "guinea":"gn",
      "guyana":"gy",
      "haiti":"ht",
      "honduras":"hn",
      "hungary":"hu",
      "iceland":"is",
      "india":"in",
      "indonesia":"id",
      "iran":"ir",
      "iraq":"iq",
      "ireland":"ie",
      "israel":"il",
      "italy":"it",
      "ivory coast":"ci",
      "jamaica":"jm",
      "japan":"jp",
      "jordan":"jo",
      "kazakhstan":"kz",
      "kenya":"ke",
      "kuwait":"kw",
      "kyrgyzstan":"kg",
      "laos":"la",
      "latvia":"lv",
      "lebanon":"lb",
      "libya":"ly",
      "liechtenstein":"li",
      "lithuania":"lt",
      "luxembourg":"lu",
      "madagascar":"mg",
      "malaysia":"my",
      "maldives":"mv",
      "mali":"ml",
      "malta":"mt",
      "mauritania":"mr",
      "mauritius":"mu",
      "mexico":"mx",
      "moldova":"md",
      "monaco":"mc",
      "mongolia":"mn",
      "montenegro":"me",
      "morocco":"ma",
      "mozambique":"mz",
      "myanmar":"mm",
      "namibia":"na",
      "nepal":"np",
      "netherlands":"nl",
      "new zealand":"nz",
      "nicaragua":"ni",
      "niger":"ne",
      "nigeria":"ng",
      "north korea":"kp",
      "north macedonia":"mk",
      "norway":"no",
      "oman":"om",
      "pakistan":"pk",
      "panama":"pa",
      "paraguay":"py",
      "peru":"pe",
      "philippines":"ph",
      "poland":"pl",
      "portugal":"pt",
      "qatar":"qa",
      "romania":"ro",
      "russia":"ru",
      "rwanda":"rw",
      "san marino":"sm",
      "saudi arabia":"sa",
      "senegal":"sn",
      "serbia":"rs",
      "singapore":"sg",
      "slovakia":"sk",
      "slovenia":"si",
      "somalia":"so",
      "south africa":"za",
      "south korea":"kr",
      "spain":"es",
      "sri lanka":"lk",
      "sudan":"sd",
      "suriname":"sr",
      "sweden":"se",
      "switzerland":"ch",
      "syria":"sy",
      "taiwan":"tw",
      "tajikistan":"tj",
      "tanzania":"tz",
      "thailand":"th",
      "togo":"tg",
      "tunisia":"tn",
      "turkey":"tr",
      "turkmenistan":"tm",
      "uganda":"ug",
      "ukraine":"ua",
      "united arab emirates":"ae",
      "united kingdom":"gb",
      "uk":"gb",
      "united states":"us",
      "united states of america":"us",
      "usa":"us",
      "uruguay":"uy",
      "uzbekistan":"uz",
      "vatican city":"va",
      "venezuela":"ve",
      "vietnam":"vn",
      "yemen":"ye",
      "zambia":"zm",
      "zimbabwe":"zw"
    };

    const countryCode =
      COUNTRY_CODES[
        country.toLowerCase()
      ] || "";

    const flagUrl =
      countryCode
        ? (
            "https://flagcdn.com/w160/" +
            countryCode +
            ".png"
          )
        : "";

    /*
     * =========================================================
     * ASSETS
     * =========================================================
     */

    const templateUrl =
      "https://onedreameach.com/dream-card-template-v2.png?v=1";

    const antonUrl =
      "https://onedreameach.com/anton.ttf";

    const barlowUrl =
      "https://onedreameach.com/barlow-condensed-extrabold-italic.ttf";

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
                "barlow font not found"
              );
            }

            return r.arrayBuffer();
          }
        )
      ]);

    /*
     * =========================================================
     * TYPOGRAPHY
     * =========================================================
     */

    function getDreamTypography(length) {
      if (length <= 40) {
        return {
          size: 92,
          lineHeight: .96,
          gap: 14
        };
      }

      if (length <= 70) {
        return {
          size: 80,
          lineHeight: .97,
          gap: 13
        };
      }

      if (length <= 105) {
        return {
          size: 70,
          lineHeight: .98,
          gap: 12
        };
      }

      if (length <= 145) {
        return {
          size: 61,
          lineHeight: .99,
          gap: 11
        };
      }

      if (length <= 190) {
        return {
          size: 54,
          lineHeight: 1,
          gap: 10
        };
      }

      if (length <= 235) {
        return {
          size: 48,
          lineHeight: 1.01,
          gap: 9
        };
      }

      return {
        size: 43,
        lineHeight: 1.02,
        gap: 8
      };
    }

    const typography =
      getDreamTypography(
        dreamText.length
      );

    const GOLD =
      "#F6C64B";

    const CYAN =
      "#22E4EE";

    const WHITE =
      "#FFFFFF";

    const SOFT =
      "#D7E5E9";

    const goldWords =
      new Set([
        "dream",
        "dreams",
        "courage",
        "freedom",
        "future",
        "success",
        "hope",
        "believe",
        "change",
        "purpose",
        "goal",
        "goals"
      ]);

    const cyanWords =
      new Set([
        "life",
        "world",
        "love",
        "peace",
        "family",
        "home",
        "travel",
        "happy",
        "happiness",
        "heart",
        "heal",
        "healing"
      ]);

    function createDreamWords(text) {
      return text
        .toUpperCase()
        .split(/\s+/)
        .filter(Boolean)
        .map(
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

            let color =
              WHITE;

            if (
              goldWords.has(
                normalized
              )
            ) {
              color =
                GOLD;
            }

            else if (
              cyanWords.has(
                normalized
              )
            ) {
              color =
                CYAN;
            }

            return {
              type:
                "span",

              props: {
                key:
                  "word-" +
                  index,

                style: {
                  display:
                    "flex",

                  marginRight:
                    typography.gap +
                    "px",

                  marginBottom:
                    "7px",

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
                    "-1.4px",

                  color:
                    color,

                  textShadow:
                    "0 5px 18px rgba(0,0,0,.82)"
                },

                children:
                  word
              }
            };
          }
        );
    }

    /*
     * =========================================================
     * STORY MODE
     *
     * IMPORTANT:
     * The approved image is 1024 x 1536.
     * We render at the SAME native ratio so nothing is cropped
     * or stretched and the fixed footer remains perfect.
     * =========================================================
     */

    if (
      mode ===
      "story"
    ) {
      const image =
        new ImageResponse(
          {
            type:
              "div",

            props: {
              style: {
                position:
                  "relative",

                width:
                  "1024px",

                height:
                  "1536px",

                display:
                  "flex",

                overflow:
                  "hidden",

                backgroundColor:
                  "#020507",

                color:
                  WHITE
              },

              children: [

                /*
                 * BACKGROUND TEMPLATE
                 */

                {
                  type:
                    "img",

                  props: {
                    src:
                      templateUrl,

                    width:
                      1024,

                    height:
                      1536,

                    style: {
                      position:
                        "absolute",

                      left:
                        "0px",

                      top:
                        "0px",

                      width:
                        "1024px",

                      height:
                        "1536px",

                      objectFit:
                        "cover"
                    }
                  }
                },

                /*
                 * DREAM NUMBER — TOP RIGHT
                 */

                {
                  type:
                    "div",

                  props: {
                    style: {
                      position:
                        "absolute",

                      right:
                        "64px",

                      top:
                        "105px",

                      width:
                        "540px",

                      display:
                        "flex",

                      flexDirection:
                        "column",

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

                            fontFamily:
                              "DreamPoster",

                            fontSize:
                              "32px",

                            fontWeight:
                              800,

                            fontStyle:
                              "italic",

                            letterSpacing:
                              "10px",

                            color:
                              "#E8FCFF",

                            textShadow:
                              "0 0 15px rgba(34,228,238,.65)"
                          },

                          children:
                            "DREAM"
                        }
                      },

                      {
                        type:
                          "div",

                        props: {
                          style: {
                            display:
                              "flex",

                            marginTop:
                              "4px",

                            fontFamily:
                              "Anton",

                            fontSize:
                              "132px",

                            fontWeight:
                              400,

                            lineHeight:
                              .94,

                            letterSpacing:
                              "1px",

                            color:
                              WHITE,

                            textShadow:
                              "0 0 25px rgba(34,228,238,.58)"
                          },

                          children:
                            "#" +
                            paddedNumber
                        }
                      },

                      {
                        type:
                          "div",

                        props: {
                          style: {
                            display:
                              "flex",

                            marginTop:
                              "11px",

                            fontFamily:
                              "DreamPoster",

                            fontSize:
                              "29px",

                            fontWeight:
                              800,

                            fontStyle:
                              "italic",

                            letterSpacing:
                              "4px",

                            color:
                              CYAN
                          },

                          children:
                            "ONE HUMAN DREAM"
                        }
                      }

                    ]
                  }
                },

                /*
                 * MAIN DREAM
                 *
                 * Huge central open field of the new template.
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
                        "475px",

                      width:
                        "794px",

                      height:
                        "520px",

                      display:
                        "flex",

                      flexWrap:
                        "wrap",

                      alignContent:
                        "center",

                      alignItems:
                        "baseline",

                      justifyContent:
                        "center",

                      textAlign:
                        "center"
                    },

                    children:
                      createDreamWords(
                        dreamText
                      )
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
                      position:
                        "absolute",

                      left:
                        "150px",

                      top:
                        "1010px",

                      width:
                        "724px",

                      height:
                        "240px",

                      display:
                        "flex",

                      flexDirection:
                        "column",

                      justifyContent:
                        "center",

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

                            fontFamily:
                              "DreamPoster",

                            fontSize:
                              "23px",

                            fontWeight:
                              800,

                            fontStyle:
                              "italic",

                            letterSpacing:
                              "10px",

                            color:
                              CYAN,

                            lineHeight:
                              1
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
                            display:
                              "flex",

                            marginTop:
                              "18px",

                            maxWidth:
                              "680px",

                            fontFamily:
                              "DreamPoster",

                            fontSize:
                              nickname.length > 22
                                ? "48px"
                                : nickname.length > 15
                                  ? "56px"
                                  : "66px",

                            fontWeight:
                              800,

                            fontStyle:
                              "italic",

                            lineHeight:
                              1,

                            letterSpacing:
                              "-1px",

                            color:
                              WHITE,

                            textAlign:
                              "center",

                            textShadow:
                              "0 4px 16px rgba(0,0,0,.9)"
                          },

                          children:
                            nickname
                              .toUpperCase()
                        }
                      },

                      {
                        type:
                          "div",

                        props: {
                          style: {
                            display:
                              "flex",

                            marginTop:
                              "13px",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",

                            gap:
                              "12px",

                            fontFamily:
                              "DreamPoster",

                            fontSize:
                              "25px",

                            fontWeight:
                              800,

                            fontStyle:
                              "italic",

                            letterSpacing:
                              "3px",

                            color:
                              SOFT
                          },

                          children: [

                            flagUrl
                              ? {
                                  type:
                                    "img",

                                  props: {
                                    src:
                                      flagUrl,

                                    width:
                                      46,

                                    height:
                                      30,

                                    style: {
                                      width:
                                        "46px",

                                      height:
                                        "30px",

                                      objectFit:
                                        "cover",

                                      borderRadius:
                                        "4px"
                                    }
                                  }
                                }
                              : null,

                            {
                              type:
                                "span",

                              props: {
                                style: {
                                  display:
                                    "flex"
                                },

                                children:
                                  country
                                    .toUpperCase()
                              }
                            }

                          ]
                            .filter(
                              Boolean
                            )
                        }
                      },

                      /*
                       * SOCIALS
                       */

                      {
                        type:
                          "div",

                        props: {
                          style: {
                            display:
                              (
                                instagramHandle ||
                                tiktokHandle
                              )
                                ? "flex"
                                : "none",

                            marginTop:
                              "18px",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",

                            gap:
                              "20px",

                            fontFamily:
                              "DreamPoster",

                            fontSize:
                              "19px",

                            fontWeight:
                              800,

                            fontStyle:
                              "italic",

                            letterSpacing:
                              ".8px"
                          },

                          children: [

                            instagramHandle
                              ? {
                                  type:
                                    "span",

                                  props: {
                                    style: {
                                      display:
                                        "flex",

                                      color:
                                        CYAN
                                    },

                                    children:
                                      "IG " +
                                      instagramHandle
                                  }
                                }
                              : null,

                            (
                              instagramHandle &&
                              tiktokHandle
                            )
                              ? {
                                  type:
                                    "span",

                                  props: {
                                    style: {
                                      display:
                                        "flex",

                                      color:
                                        "rgba(255,255,255,.35)"
                                    },

                                    children:
                                      "|"
                                  }
                                }
                              : null,

                            tiktokHandle
                              ? {
                                  type:
                                    "span",

                                  props: {
                                    style: {
                                      display:
                                        "flex",

                                      color:
                                        GOLD
                                    },

                                    children:
                                      "TT " +
                                      tiktokHandle
                                  }
                                }
                              : null

                          ]
                            .filter(
                              Boolean
                            )
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
              1024,

            height:
              1536,

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

      const buffer =
        await image.arrayBuffer();

      res.setHeader(
        "Content-Type",
        "image/png"
      );

      res.setHeader(
        "Content-Disposition",
        `inline; filename="onedreameach-dream-${paddedNumber}.png"`
      );

      /*
       * DESIGN PHASE:
       * no stale cards while positions/fonts are being refined.
       */
      res.setHeader(
        "Cache-Control",
        "no-store, max-age=0"
      );

      return res
        .status(200)
        .send(
          Buffer.from(
            buffer
          )
        );
    }

    /*
     * =========================================================
     * STANDARD OPEN GRAPH
     * =========================================================
     */

    const ogImage =
      new ImageResponse(
        {
          type:
            "div",

          props: {
            style: {
              width:
                "1200px",

              height:
                "630px",

              display:
                "flex",

              flexDirection:
                "column",

              justifyContent:
                "center",

              alignItems:
                "center",

              padding:
                "60px",

              background:
                "linear-gradient(135deg,#020507 0%,#061316 100%)",

              color:
                WHITE,

              textAlign:
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

                    fontFamily:
                      "Anton",

                    fontSize:
                      "90px",

                    color:
                      CYAN
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
                    display:
                      "flex",

                    marginTop:
                      "22px",

                    maxWidth:
                      "1000px",

                    fontFamily:
                      "DreamPoster",

                    fontSize:
                      dreamText.length > 150
                        ? "42px"
                        : dreamText.length > 90
                          ? "49px"
                          : "58px",

                    fontWeight:
                      800,

                    fontStyle:
                      "italic",

                    lineHeight:
                      1.05,

                    color:
                      WHITE
                  },

                  children:
                    dreamText
                }
              }

            ]
          }
        },

        {
          width:
            1200,

          height:
            630,

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

    const ogBuffer =
      await ogImage.arrayBuffer();

    res.setHeader(
      "Content-Type",
      "image/png"
    );

    res.setHeader(
      "Cache-Control",
      "no-store, max-age=0"
    );

    return res
      .status(200)
      .send(
        Buffer.from(
          ogBuffer
        )
      );
  }

  catch (error) {
    console.error(
      "OG ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        error:
          "Unable to generate Dream Card",

        message:
          error &&
          error.message
            ? error.message
            : String(error)
      });
  }
};
