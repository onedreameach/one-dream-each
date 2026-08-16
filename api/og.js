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

    function normalizeSocial(value, platform) {
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

    const instagramHandle = normalizeSocial(dream.instagram, "instagram");
    const tiktokHandle = normalizeSocial(dream.tiktok, "tiktok");

    // Country -> ISO code for flag image
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
      "https://onedreameach.com/dream-card-template-v1.png?v=1";

    const antonUrl = "https://onedreameach.com/anton.ttf";
    const barlowUrl = "https://onedreameach.com/barlow-condensed-extrabold-italic.ttf";

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

    function dreamSize(len) {
      if (len <= 45) return 82;
      if (len <= 80) return 72;
      if (len <= 120) return 63;
      if (len <= 165) return 56;
      if (len <= 220) return 49;
      return 43;
    }

    const highlightGold = new Set([
      "dream","dreams","courage","freedom","future","success","hope","believe","change"
    ]);
    const highlightCyan = new Set([
      "life","world","love","peace","family","home","travel","happy","happiness","heart"
    ]);

    function makeDreamWords(text) {
      const size = dreamSize(text.length);
      return text.toUpperCase().split(/\s+/).filter(Boolean).map((word, i) => {
        const clean = word.toLowerCase().replace(/[^a-zà-ÿ]/gi, "");
        let color = "#FFFFFF";
        if (highlightGold.has(clean)) color = "#F6C344";
        if (highlightCyan.has(clean)) color = "#2CE7F0";

        return {
          type: "span",
          props: {
            key: "w" + i,
            style: {
              display: "flex",
              marginRight: "13px",
              marginBottom: "7px",
              fontFamily: "DreamPoster",
              fontSize: size + "px",
              fontWeight: 800,
              fontStyle: "italic",
              lineHeight: 1.0,
              letterSpacing: "-1px",
              color
            },
            children: word
          }
        };
      });
    }

    if (mode === "story") {
      const story = new ImageResponse({
        type: "div",
        props: {
          style: {
            width: "1080px",
            height: "1920px",
            position: "relative",
            display: "flex",
            overflow: "hidden",
            backgroundColor: "#02070A",
            color: "#FFFFFF"
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
                  inset: 0,
                  width: "1080px",
                  height: "1920px",
                  objectFit: "cover"
                }
              }
            },

            // HEADER
            {
              type: "div",
              props: {
                style: {
                  position: "absolute",
                  left: "430px",
                  top: "85px",
                  width: "570px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        fontFamily: "DreamPoster",
                        fontSize: "44px",
                        letterSpacing: "13px",
                        color: "#DDFBFF",
                        textShadow: "0 0 18px rgba(44,231,240,.75)"
                      },
                      children: "DREAM"
                    }
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        marginTop: "-5px",
                        fontFamily: "Anton",
                        fontSize: "152px",
                        lineHeight: 1,
                        color: "#FFFFFF",
                        letterSpacing: "2px",
                        textShadow: "0 0 22px rgba(44,231,240,.85)"
                      },
                      children: "#" + paddedNumber
                    }
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        marginTop: "6px",
                        fontFamily: "DreamPoster",
                        fontSize: "38px",
                        letterSpacing: "5px",
                        color: "#2CE7F0"
                      },
                      children: "ONE HUMAN DREAM"
                    }
                  }
                ]
              }
            },

            // DREAM TEXT - NO BOX
            {
              type: "div",
              props: {
                style: {
                  position: "absolute",
                  left: "120px",
                  top: "520px",
                  width: "840px",
                  height: "540px",
                  display: "flex",
                  flexWrap: "wrap",
                  alignContent: "center",
                  justifyContent: "flex-start"
                },
                children: makeDreamWords(dreamText)
              }
            },

            // THREE PROMISES
            {
              type: "div",
              props: {
                style: {
                  position: "absolute",
                  left: "100px",
                  top: "1195px",
                  width: "880px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontFamily: "DreamPoster",
                  fontSize: "31px",
                  letterSpacing: "1px"
                },
                children: [
                  { type: "div", props: { style: { display:"flex", color:"#F6C344" }, children: "ONE DREAM" } },
                  { type: "div", props: { style: { display:"flex", color:"#2CE7F0" }, children: "ONE NUMBER" } },
                  { type: "div", props: { style: { display:"flex", color:"#F6C344" }, children: "ONE PLACE" } }
                ]
              }
            },

            // DREAMED BY
            {
              type: "div",
              props: {
                style: {
                  position: "absolute",
                  left: "100px",
                  top: "1325px",
                  width: "880px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        fontFamily: "DreamPoster",
                        fontSize: "27px",
                        color: "#2CE7F0",
                        letterSpacing: "10px"
                      },
                      children: "DREAMED BY"
                    }
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        marginTop: "18px",
                        fontFamily: "DreamPoster",
                        fontSize: nickname.length > 18 ? "58px" : "72px",
                        lineHeight: 1,
                        color: "#FFFFFF",
                        letterSpacing: "1px"
                      },
                      children: nickname.toUpperCase()
                    }
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        marginTop: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        fontFamily: "DreamPoster",
                        fontSize: "29px",
                        letterSpacing: "4px",
                        color: "#F1F1F1"
                      },
                      children: [
                        flagUrl ? {
                          type: "img",
                          props: {
                            src: flagUrl,
                            width: 44,
                            height: 30,
                            style: {
                              width: "44px",
                              height: "30px",
                              objectFit: "cover",
                              borderRadius: "4px"
                            }
                          }
                        } : null,
                        country.toUpperCase()
                      ].filter(Boolean)
                    }
                  }
                ]
              }
            },

            // SOCIALS
            {
              type: "div",
              props: {
                style: {
                  position: "absolute",
                  left: "140px",
                  top: "1510px",
                  width: "800px",
                  display: (instagramHandle || tiktokHandle) ? "flex" : "none",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "32px",
                  fontFamily: "DreamPoster",
                  fontSize: "23px",
                  color: "#E8FBFF",
                  letterSpacing: "1px"
                },
                children: [
                  instagramHandle ? "IG " + instagramHandle : "",
                  (instagramHandle && tiktokHandle) ? "|" : "",
                  tiktokHandle ? "TT " + tiktokHandle : ""
                ].filter(Boolean)
              }
            },

            // CTA
            {
              type: "div",
              props: {
                style: {
                  position: "absolute",
                  left: "70px",
                  top: "1650px",
                  width: "940px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        fontFamily: "DreamPoster",
                        fontSize: "53px",
                        color: "#2CE7F0",
                        letterSpacing: "1px",
                        textShadow: "0 0 18px rgba(44,231,240,.45)"
                      },
                      children: "WHAT'S YOUR DREAM?"
                    }
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        marginTop: "26px",
                        padding: "12px 28px",
                        border: "2px solid rgba(44,231,240,.75)",
                        borderRadius: "12px",
                        background: "rgba(2,7,10,.72)",
                        fontFamily: "Anton",
                        fontSize: "33px",
                        letterSpacing: "7px",
                        color: "#FFFFFF",
                        boxShadow: "0 0 20px rgba(44,231,240,.22)"
                      },
                      children: "ONEDREAMEACH.COM"
                    }
                  }
                ]
              }
            }
          ]
        }
      }, {
        width: 1080,
        height: 1920,
        fonts: [
          { name: "Anton", data: antonFont, weight: 400, style: "normal" },
          { name: "DreamPoster", data: barlowFont, weight: 800, style: "italic" }
        ]
      });

      const buffer = await story.arrayBuffer();
      res.setHeader("Content-Type", "image/png");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="onedreameach-dream-${paddedNumber}.png"`
      );

      // during design phase: always return newest version
      res.setHeader("Cache-Control", "no-store, max-age=0");
      return res.status(200).send(Buffer.from(buffer));
    }

    // Standard OG fallback
    const og = new ImageResponse({
      type: "div",
      props: {
        style: {
          width:"100%",
          height:"100%",
          display:"flex",
          flexDirection:"column",
          justifyContent:"center",
          alignItems:"center",
          background:"#02070A",
          color:"#fff",
          padding:"60px",
          textAlign:"center"
        },
        children: [
          {
            type:"div",
            props:{
              style:{
                fontFamily:"Anton",
                fontSize:"90px",
                color:"#2CE7F0"
              },
              children:"DREAM #" + paddedNumber
            }
          },
          {
            type:"div",
            props:{
              style:{
                marginTop:"24px",
                fontFamily:"DreamPoster",
                fontSize:"54px",
                lineHeight:1.1,
                color:"#FFFFFF"
              },
              children:dreamText
            }
          }
        ]
      }
    }, {
      width:1200,
      height:630,
      fonts:[
        { name:"Anton", data:antonFont, weight:400, style:"normal" },
        { name:"DreamPoster", data:barlowFont, weight:800, style:"italic" }
      ]
    });

    const ogBuffer = await og.arrayBuffer();
    res.setHeader("Content-Type","image/png");
    res.setHeader("Cache-Control","no-store, max-age=0");
    return res.status(200).send(Buffer.from(ogBuffer));
  } catch (error) {
    console.error("OG ERROR:", error);
    return res.status(500).json({
      error: "Unable to generate Dream Card",
      message: error && error.message ? error.message : String(error)
    });
  }
};
