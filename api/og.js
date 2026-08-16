module.exports = async function handler(req, res) {
  try {
    const { ImageResponse } = await import("@vercel/og");

    const requestUrl = new URL(req.url, "https://onedreameach.com");
    const number = requestUrl.searchParams.get("number");
    const mode = requestUrl.searchParams.get("mode") || "og";

    if (!number) {
      return res.status(400).json({ error: "Dream number required" });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Supabase environment variables missing" });
    }

    const apiUrl =
      supabaseUrl +
      "/rest/v1/Dreams" +
      "?select=dream_number,nickname,dream_text,country,instagram,tiktok" +
      "&dream_number=eq." + encodeURIComponent(number) +
      "&limit=1";

    const response = await fetch(apiUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: "Bearer " + supabaseKey
      }
    });

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(500).json({
        error: "Unable to load dream",
        details: responseText
      });
    }

    const dreams = responseText ? JSON.parse(responseText) : [];

    if (!Array.isArray(dreams) || dreams.length === 0) {
      return res.status(404).json({ error: "Dream not found" });
    }

    const dream = dreams[0];

    const paddedNumber = String(dream.dream_number).padStart(6, "0");
    const nickname = String(dream.nickname || "Anonymous").trim().slice(0, 40);
    const dreamText = String(dream.dream_text || "").trim().slice(0, 280);
    const country = String(dream.country || "World").trim().slice(0, 60);

    function normalizeSocial(value) {
      if (!value) return "";
      let clean = String(value).trim();
      if (!clean) return "";

      clean = clean
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .replace(/^instagram\.com\//i, "")
        .replace(/^tiktok\.com\/@?/i, "")
        .replace(/^@+/, "")
        .split(/[?#]/)[0]
        .replace(/\/$/, "")
        .trim();

      if (!clean) return "";
      return "@" + clean.slice(0, 30);
    }

    const instagramHandle = normalizeSocial(dream.instagram);
    const tiktokHandle = normalizeSocial(dream.tiktok);

    const COUNTRY_CODES = {
      "afghanistan":"af","albania":"al","algeria":"dz","andorra":"ad","angola":"ao",
      "argentina":"ar","armenia":"am","australia":"au","austria":"at","azerbaijan":"az",
      "bahamas":"bs","bahrain":"bh","bangladesh":"bd","barbados":"bb","belarus":"by",
      "belgium":"be","belize":"bz","benin":"bj","bhutan":"bt","bolivia":"bo",
      "bosnia and herzegovina":"ba","botswana":"bw","brazil":"br","brunei":"bn","bulgaria":"bg",
      "burkina faso":"bf","burundi":"bi","cambodia":"kh","cameroon":"cm","canada":"ca",
      "cape verde":"cv","central african republic":"cf","chad":"td","chile":"cl","china":"cn",
      "colombia":"co","comoros":"km","congo":"cg","costa rica":"cr","croatia":"hr",
      "cuba":"cu","cyprus":"cy","czech republic":"cz","czechia":"cz","denmark":"dk",
      "dominican republic":"do","ecuador":"ec","egypt":"eg","el salvador":"sv","estonia":"ee",
      "ethiopia":"et","fiji":"fj","finland":"fi","france":"fr","gabon":"ga","gambia":"gm",
      "georgia":"ge","germany":"de","ghana":"gh","greece":"gr","guatemala":"gt","guinea":"gn",
      "guyana":"gy","haiti":"ht","honduras":"hn","hungary":"hu","iceland":"is","india":"in",
      "indonesia":"id","iran":"ir","iraq":"iq","ireland":"ie","israel":"il","italy":"it",
      "ivory coast":"ci","jamaica":"jm","japan":"jp","jordan":"jo","kazakhstan":"kz",
      "kenya":"ke","kuwait":"kw","kyrgyzstan":"kg","laos":"la","latvia":"lv","lebanon":"lb",
      "libya":"ly","liechtenstein":"li","lithuania":"lt","luxembourg":"lu","madagascar":"mg",
      "malaysia":"my","maldives":"mv","mali":"ml","malta":"mt","mauritania":"mr","mauritius":"mu",
      "mexico":"mx","moldova":"md","monaco":"mc","mongolia":"mn","montenegro":"me","morocco":"ma",
      "mozambique":"mz","myanmar":"mm","namibia":"na","nepal":"np","netherlands":"nl",
      "new zealand":"nz","nicaragua":"ni","niger":"ne","nigeria":"ng","north korea":"kp",
      "north macedonia":"mk","norway":"no","oman":"om","pakistan":"pk","panama":"pa",
      "paraguay":"py","peru":"pe","philippines":"ph","poland":"pl","portugal":"pt","qatar":"qa",
      "romania":"ro","russia":"ru","rwanda":"rw","san marino":"sm","saudi arabia":"sa",
      "senegal":"sn","serbia":"rs","singapore":"sg","slovakia":"sk","slovenia":"si",
      "somalia":"so","south africa":"za","south korea":"kr","spain":"es","sri lanka":"lk",
      "sudan":"sd","suriname":"sr","sweden":"se","switzerland":"ch","syria":"sy","taiwan":"tw",
      "tajikistan":"tj","tanzania":"tz","thailand":"th","togo":"tg","tunisia":"tn","turkey":"tr",
      "turkmenistan":"tm","uganda":"ug","ukraine":"ua","united arab emirates":"ae",
      "united kingdom":"gb","uk":"gb","united states":"us","united states of america":"us","usa":"us",
      "uruguay":"uy","uzbekistan":"uz","vatican city":"va","venezuela":"ve","vietnam":"vn",
      "yemen":"ye","zambia":"zm","zimbabwe":"zw"
    };

    const countryCode = COUNTRY_CODES[country.toLowerCase()] || "";
    const flagUrl = countryCode
      ? "https://flagcdn.com/w160/" + countryCode + ".png"
      : "";

    const backgroundUrl =
      "https://onedreameach.com/dream-card-template-v1.png?v=2";

    const antonUrl =
      "https://onedreameach.com/anton.ttf";

    const barlowUrl =
      "https://onedreameach.com/barlow-condensed-extrabold-italic.ttf";

    const [antonFont, barlowFont] = await Promise.all([
      fetch(antonUrl).then(async r => {
        if (!r.ok) throw new Error("anton.ttf not found");
        return r.arrayBuffer();
      }),
      fetch(barlowUrl).then(async r => {
        if (!r.ok) throw new Error("barlow-condensed-extrabold-italic.ttf not found");
        return r.arrayBuffer();
      })
    ]);

    function getDreamStyle(length) {
      if (length <= 45) {
        return { size: 100, width: 830, top: 500, height: 470, gap: 15 };
      }
      if (length <= 80) {
        return { size: 84, width: 850, top: 500, height: 500, gap: 14 };
      }
      if (length <= 120) {
        return { size: 72, width: 860, top: 490, height: 520, gap: 13 };
      }
      if (length <= 165) {
        return { size: 62, width: 870, top: 485, height: 535, gap: 12 };
      }
      if (length <= 220) {
        return { size: 54, width: 880, top: 480, height: 545, gap: 11 };
      }
      return { size: 47, width: 890, top: 475, height: 555, gap: 10 };
    }

    const GOLD = "#F6C84B";
    const CYAN = "#22E4EE";
    const WHITE = "#FFFFFF";
    const SOFT = "#DCE7EA";

    const goldWords = new Set([
      "dream","dreams","courage","freedom","future","success","hope",
      "believe","change","purpose","goal","goals","family"
    ]);

    const cyanWords = new Set([
      "life","world","love","peace","home","travel","happy",
      "happiness","heart","heal","healing"
    ]);

    function createDreamWords(text, style) {
      return text
        .toUpperCase()
        .split(/\s+/)
        .filter(Boolean)
        .map((word, index) => {
          const normalized =
            word.toLowerCase().replace(/[^a-zà-ÿ]/gi, "");

          let color = WHITE;

          if (goldWords.has(normalized)) {
            color = GOLD;
          } else if (cyanWords.has(normalized)) {
            color = CYAN;
          }

          return {
            type: "span",
            props: {
              key: "dream-word-" + index,
              style: {
                display: "flex",
                marginRight: style.gap + "px",
                marginBottom: "8px",
                fontFamily: "DreamPoster",
                fontSize: style.size + "px",
                fontWeight: 800,
                fontStyle: "italic",
                lineHeight: 0.98,
                letterSpacing: "-1.7px",
                color: color
              },
              children: word
            }
          };
        });
    }

    if (mode === "story") {
      const dreamStyle = getDreamStyle(dreamText.length);

      const story = new ImageResponse(
        {
          type: "div",
          props: {
            style: {
              width: "1080px",
              height: "1920px",
              position: "relative",
              display: "flex",
              overflow: "hidden",
              backgroundColor: "#02070A",
              color: WHITE
            },

            children: [
              {
                type: "img",
                props: {
                  src: backgroundUrl,
                  width: 1080,
                  height: 1920,
                  style: {
                    position: "absolute",
                    left: "0px",
                    top: "0px",
                    width: "1080px",
                    height: "1920px",
                    objectFit: "cover"
                  }
                }
              },

              /* ================= HEADER ================= */
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "430px",
                    top: "66px",
                    width: "575px",
                    height: "320px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start"
                  },

                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          fontFamily: "DreamPoster",
                          fontSize: "42px",
                          fontWeight: 800,
                          fontStyle: "italic",
                          color: WHITE,
                          letterSpacing: "13px",
                          lineHeight: 1
                        },
                        children: "DREAM"
                      }
                    },

                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          marginTop: "8px",
                          fontFamily: "Anton",
                          fontSize: "156px",
                          fontWeight: 400,
                          color: WHITE,
                          letterSpacing: "1px",
                          lineHeight: 0.95
                        },
                        children: "#" + paddedNumber
                      }
                    },

                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          marginTop: "16px",
                          fontFamily: "DreamPoster",
                          fontSize: "36px",
                          fontWeight: 800,
                          fontStyle: "italic",
                          color: CYAN,
                          letterSpacing: "4px",
                          lineHeight: 1
                        },
                        children: "ONE HUMAN DREAM"
                      }
                    }
                  ]
                }
              },

              /* ================= DREAM TEXT ================= */
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: ((1080 - dreamStyle.width) / 2) + "px",
                    top: dreamStyle.top + "px",
                    width: dreamStyle.width + "px",
                    height: dreamStyle.height + "px",
                    display: "flex",
                    flexWrap: "wrap",
                    alignContent: "center",
                    alignItems: "baseline",
                    justifyContent: "center",
                    textAlign: "center"
                  },

                  children: createDreamWords(dreamText, dreamStyle)
                }
              },

              /* ================= PROMISE BAR ================= */
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "85px",
                    top: "1125px",
                    width: "910px",
                    height: "126px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "2px solid rgba(246,200,75,.75)",
                    borderBottom: "2px solid rgba(34,228,238,.55)"
                  },

                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "300px",
                          height: "80px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRight: "1px solid rgba(255,255,255,.20)",
                          fontFamily: "DreamPoster",
                          fontSize: "38px",
                          fontWeight: 800,
                          fontStyle: "italic",
                          color: GOLD
                        },
                        children: "ONE DREAM"
                      }
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "300px",
                          height: "80px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRight: "1px solid rgba(255,255,255,.20)",
                          fontFamily: "DreamPoster",
                          fontSize: "38px",
                          fontWeight: 800,
                          fontStyle: "italic",
                          color: CYAN
                        },
                        children: "ONE NUMBER"
                      }
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "300px",
                          height: "80px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "DreamPoster",
                          fontSize: "38px",
                          fontWeight: 800,
                          fontStyle: "italic",
                          color: GOLD
                        },
                        children: "ONE PLACE"
                      }
                    }
                  ]
                }
              },

              /* ================= AUTHOR ================= */
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "100px",
                    top: "1280px",
                    width: "880px",
                    height: "260px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start"
                  },

                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          fontFamily: "DreamPoster",
                          fontSize: "28px",
                          fontWeight: 800,
                          fontStyle: "italic",
                          letterSpacing: "11px",
                          color: CYAN,
                          lineHeight: 1
                        },
                        children: "DREAMED BY"
                      }
                    },

                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          marginTop: "26px",
                          maxWidth: "760px",
                          fontFamily: "DreamPoster",
                          fontSize:
                            nickname.length > 24 ? "56px" :
                            nickname.length > 16 ? "66px" :
                            "78px",
                          fontWeight: 800,
                          fontStyle: "italic",
                          letterSpacing: "-1px",
                          color: WHITE,
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
                          display: "flex",
                          marginTop: "18px",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "14px",
                          fontFamily: "DreamPoster",
                          fontSize: "31px",
                          fontWeight: 800,
                          fontStyle: "italic",
                          letterSpacing: "4px",
                          color: SOFT,
                          lineHeight: 1
                        },

                        children: [
                          flagUrl
                            ? {
                                type: "img",
                                props: {
                                  src: flagUrl,
                                  width: 50,
                                  height: 34,
                                  style: {
                                    width: "50px",
                                    height: "34px",
                                    objectFit: "cover",
                                    borderRadius: "4px"
                                  }
                                }
                              }
                            : null,

                          {
                            type: "span",
                            props: {
                              style: {
                                display: "flex"
                              },
                              children: country.toUpperCase()
                            }
                          }
                        ].filter(Boolean)
                      }
                    }
                  ]
                }
              },

              /* ================= SOCIALS ================= */
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "120px",
                    top: "1535px",
                    width: "840px",
                    height: "70px",
                    display:
                      instagramHandle || tiktokHandle
                        ? "flex"
                        : "none",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "26px",
                    borderTop: "1px solid rgba(255,255,255,.12)",
                    borderBottom: "1px solid rgba(255,255,255,.12)",
                    fontFamily: "DreamPoster",
                    fontSize: "25px",
                    fontWeight: 800,
                    fontStyle: "italic",
                    letterSpacing: "1px",
                    color: WHITE
                  },

                  children: [
                    instagramHandle
                      ? {
                          type: "span",
                          props: {
                            style: {
                              display: "flex",
                              color: CYAN
                            },
                            children: "IG " + instagramHandle
                          }
                        }
                      : null,

                    instagramHandle && tiktokHandle
                      ? {
                          type: "span",
                          props: {
                            style: {
                              display: "flex",
                              color: "rgba(255,255,255,.35)"
                            },
                            children: "|"
                          }
                        }
                      : null,

                    tiktokHandle
                      ? {
                          type: "span",
                          props: {
                            style: {
                              display: "flex",
                              color: GOLD
                            },
                            children: "TT " + tiktokHandle
                          }
                        }
                      : null
                  ].filter(Boolean)
                }
              },

              /* ================= CTA ================= */
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "60px",
                    top: "1660px",
                    width: "960px",
                    height: "180px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start"
                  },

                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          fontFamily: "DreamPoster",
                          fontSize: "62px",
                          fontWeight: 800,
                          fontStyle: "italic",
                          letterSpacing: "-1px",
                          color: CYAN,
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
                          marginTop: "32px",
                          minWidth: "540px",
                          height: "70px",
                          padding: "0 30px",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "2px solid " + CYAN,
                          borderRadius: "10px",
                          background: "rgba(0,0,0,.64)",
                          fontFamily: "Anton",
                          fontSize: "32px",
                          fontWeight: 400,
                          letterSpacing: "7px",
                          color: WHITE
                        },
                        children: "ONEDREAMEACH.COM"
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

      const buffer = await story.arrayBuffer();

      res.setHeader("Content-Type", "image/png");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="onedreameach-dream-${paddedNumber}.png"`
      );
      res.setHeader("Cache-Control", "no-store, max-age=0");

      return res.status(200).send(Buffer.from(buffer));
    }

    /* ================= NORMAL OG ================= */

    const og = new ImageResponse(
      {
        type: "div",
        props: {
          style: {
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg,#02070A 0%,#041214 55%,#07100C 100%)",
            color: WHITE,
            textAlign: "center",
            padding: "60px"
          },

          children: [
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  fontFamily: "Anton",
                  fontSize: "90px",
                  color: CYAN
                },
                children: "DREAM #" + paddedNumber
              }
            },

            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  marginTop: "25px",
                  maxWidth: "1000px",
                  fontFamily: "DreamPoster",
                  fontSize: "54px",
                  lineHeight: 1.08,
                  color: WHITE
                },
                children: dreamText
              }
            }
          ]
        }
      },

      {
        width: 1200,
        height: 630,
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

    const ogBuffer = await og.arrayBuffer();

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store, max-age=0");

    return res.status(200).send(Buffer.from(ogBuffer));
  }

  catch (error) {
    console.error("OG ERROR:", error);

    return res.status(500).json({
      error: "Unable to generate Dream Card",
      message:
        error && error.message
          ? error.message
          : String(error)
    });
  }
};
