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
      "https://onedreameach.com/dream-card-bg-final.png?v=1";

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


    /* COUNTRY -> ISO FLAG */
    const COUNTRY_CODES = {"afghanistan":"AF","albania":"AL","algeria":"DZ","american samoa":"AS","andorra":"AD","angola":"AO","anguilla":"AI","antarctica":"AQ","antigua and barbuda":"AG","arab republic of egypt":"EG","argentina":"AR","argentine republic":"AR","armenia":"AM","aruba":"AW","australia":"AU","austria":"AT","azerbaijan":"AZ","bahamas":"BS","bahrain":"BH","bangladesh":"BD","barbados":"BB","belarus":"BY","belgium":"BE","belize":"BZ","benin":"BJ","bermuda":"BM","bhutan":"BT","bolivarian republic of venezuela":"VE","bolivia":"BO","bolivia, plurinational state of":"BO","bonaire, sint eustatius and saba":"BQ","bosnia and herzegovina":"BA","botswana":"BW","bouvet island":"BV","brazil":"BR","british indian ocean territory":"IO","british virgin islands":"VG","brunei":"BN","brunei darussalam":"BN","bulgaria":"BG","burkina faso":"BF","burundi":"BI","cabo verde":"CV","cambodia":"KH","cameroon":"CM","canada":"CA","cape verde":"CV","cayman islands":"KY","central african republic":"CF","chad":"TD","chile":"CL","china":"CN","christmas island":"CX","cocos (keeling) islands":"CC","colombia":"CO","commonwealth of dominica":"DM","commonwealth of the bahamas":"BS","commonwealth of the northern mariana islands":"MP","comoros":"KM","congo":"CG","congo, the democratic republic of the":"CD","cook islands":"CK","costa rica":"CR","cote d'ivoire":"CI","croatia":"HR","cuba":"CU","curaçao":"CW","cyprus":"CY","czech republic":"CZ","czechia":"CZ","côte d'ivoire":"CI","democratic people's republic of korea":"KP","democratic republic of sao tome and principe":"ST","democratic republic of the congo":"CD","democratic republic of timor-leste":"TL","democratic socialist republic of sri lanka":"LK","denmark":"DK","djibouti":"DJ","dominica":"DM","dominican republic":"DO","dr congo":"CD","east timor":"TL","eastern republic of uruguay":"UY","ecuador":"EC","egypt":"EG","el salvador":"SV","equatorial guinea":"GQ","eritrea":"ER","estonia":"EE","eswatini":"SZ","ethiopia":"ET","falkland islands (malvinas)":"FK","faroe islands":"FO","federal democratic republic of ethiopia":"ET","federal democratic republic of nepal":"NP","federal republic of germany":"DE","federal republic of nigeria":"NG","federal republic of somalia":"SO","federated states of micronesia":"FM","federative republic of brazil":"BR","fiji":"FJ","finland":"FI","france":"FR","french guiana":"GF","french polynesia":"PF","french republic":"FR","french southern territories":"TF","gabon":"GA","gabonese republic":"GA","gambia":"GM","georgia":"GE","germany":"DE","ghana":"GH","gibraltar":"GI","grand duchy of luxembourg":"LU","great britain":"GB","greece":"GR","greenland":"GL","grenada":"GD","guadeloupe":"GP","guam":"GU","guatemala":"GT","guernsey":"GG","guinea":"GN","guinea-bissau":"GW","guyana":"GY","haiti":"HT","hashemite kingdom of jordan":"JO","heard island and mcdonald islands":"HM","hellenic republic":"GR","holy see (vatican city state)":"VA","honduras":"HN","hong kong":"HK","hong kong special administrative region of china":"HK","hungary":"HU","iceland":"IS","independent state of papua new guinea":"PG","independent state of samoa":"WS","india":"IN","indonesia":"ID","iran":"IR","iran, islamic republic of":"IR","iraq":"IQ","ireland":"IE","islamic republic of afghanistan":"AF","islamic republic of iran":"IR","islamic republic of mauritania":"MR","islamic republic of pakistan":"PK","isle of man":"IM","israel":"IL","italian republic":"IT","italy":"IT","ivory coast":"CI","jamaica":"JM","japan":"JP","jersey":"JE","jordan":"JO","kazakhstan":"KZ","kenya":"KE","kingdom of bahrain":"BH","kingdom of belgium":"BE","kingdom of bhutan":"BT","kingdom of cambodia":"KH","kingdom of denmark":"DK","kingdom of eswatini":"SZ","kingdom of lesotho":"LS","kingdom of morocco":"MA","kingdom of norway":"NO","kingdom of saudi arabia":"SA","kingdom of spain":"ES","kingdom of sweden":"SE","kingdom of thailand":"TH","kingdom of the netherlands":"NL","kingdom of tonga":"TO","kiribati":"KI","korea, democratic people's republic of":"KP","korea, republic of":"KR","kuwait":"KW","kyrgyz republic":"KG","kyrgyzstan":"KG","lao people's democratic republic":"LA","laos":"LA","latvia":"LV","lebanese republic":"LB","lebanon":"LB","lesotho":"LS","liberia":"LR","libya":"LY","liechtenstein":"LI","lithuania":"LT","luxembourg":"LU","macao":"MO","macao special administrative region of china":"MO","macedonia":"MK","madagascar":"MG","malawi":"MW","malaysia":"MY","maldives":"MV","mali":"ML","malta":"MT","marshall islands":"MH","martinique":"MQ","mauritania":"MR","mauritius":"MU","mayotte":"YT","mexico":"MX","micronesia":"FM","micronesia, federated states of":"FM","moldova":"MD","moldova, republic of":"MD","monaco":"MC","mongolia":"MN","montenegro":"ME","montserrat":"MS","morocco":"MA","mozambique":"MZ","myanmar":"MM","namibia":"NA","nauru":"NR","nepal":"NP","netherlands":"NL","new caledonia":"NC","new zealand":"NZ","nicaragua":"NI","niger":"NE","nigeria":"NG","niue":"NU","norfolk island":"NF","north korea":"KP","north macedonia":"MK","northern mariana islands":"MP","norway":"NO","oman":"OM","pakistan":"PK","palau":"PW","palestine":"PS","palestine, state of":"PS","panama":"PA","papua new guinea":"PG","paraguay":"PY","people's democratic republic of algeria":"DZ","people's republic of bangladesh":"BD","people's republic of china":"CN","peru":"PE","philippines":"PH","pitcairn":"PN","plurinational state of bolivia":"BO","poland":"PL","portugal":"PT","portuguese republic":"PT","principality of andorra":"AD","principality of liechtenstein":"LI","principality of monaco":"MC","puerto rico":"PR","qatar":"QA","republic of albania":"AL","republic of angola":"AO","republic of armenia":"AM","republic of austria":"AT","republic of azerbaijan":"AZ","republic of belarus":"BY","republic of benin":"BJ","republic of bosnia and herzegovina":"BA","republic of botswana":"BW","republic of bulgaria":"BG","republic of burundi":"BI","republic of cabo verde":"CV","republic of cameroon":"CM","republic of chad":"TD","republic of chile":"CL","republic of colombia":"CO","republic of costa rica":"CR","republic of croatia":"HR","republic of cuba":"CU","republic of cyprus":"CY","republic of côte d'ivoire":"CI","republic of djibouti":"DJ","republic of ecuador":"EC","republic of el salvador":"SV","republic of equatorial guinea":"GQ","republic of estonia":"EE","republic of fiji":"FJ","republic of finland":"FI","republic of ghana":"GH","republic of guatemala":"GT","republic of guinea":"GN","republic of guinea-bissau":"GW","republic of guyana":"GY","republic of haiti":"HT","republic of honduras":"HN","republic of iceland":"IS","republic of india":"IN","republic of indonesia":"ID","republic of iraq":"IQ","republic of kazakhstan":"KZ","republic of kenya":"KE","republic of kiribati":"KI","republic of latvia":"LV","republic of liberia":"LR","republic of lithuania":"LT","republic of madagascar":"MG","republic of malawi":"MW","republic of maldives":"MV","republic of mali":"ML","republic of malta":"MT","republic of mauritius":"MU","republic of moldova":"MD","republic of mozambique":"MZ","republic of myanmar":"MM","republic of namibia":"NA","republic of nauru":"NR","republic of nicaragua":"NI","republic of north macedonia":"MK","republic of palau":"PW","republic of panama":"PA","republic of paraguay":"PY","republic of peru":"PE","republic of poland":"PL","republic of san marino":"SM","republic of senegal":"SN","republic of serbia":"RS","republic of seychelles":"SC","republic of sierra leone":"SL","republic of singapore":"SG","republic of slovenia":"SI","republic of south africa":"ZA","republic of south sudan":"SS","republic of suriname":"SR","republic of tajikistan":"TJ","republic of the congo":"CG","republic of the gambia":"GM","republic of the marshall islands":"MH","republic of the niger":"NE","republic of the philippines":"PH","republic of the sudan":"SD","republic of trinidad and tobago":"TT","republic of tunisia":"TN","republic of türkiye":"TR","republic of uganda":"UG","republic of uzbekistan":"UZ","republic of vanuatu":"VU","republic of yemen":"YE","republic of zambia":"ZM","republic of zimbabwe":"ZW","romania":"RO","russia":"RU","russian federation":"RU","rwanda":"RW","rwandese republic":"RW","réunion":"RE","saint barthélemy":"BL","saint helena, ascension and tristan da cunha":"SH","saint kitts and nevis":"KN","saint lucia":"LC","saint martin (french part)":"MF","saint pierre and miquelon":"PM","saint vincent and the grenadines":"VC","samoa":"WS","san marino":"SM","sao tome and principe":"ST","saudi arabia":"SA","senegal":"SN","serbia":"RS","seychelles":"SC","sierra leone":"SL","singapore":"SG","sint maarten (dutch part)":"SX","slovak republic":"SK","slovakia":"SK","slovenia":"SI","socialist republic of viet nam":"VN","solomon islands":"SB","somalia":"SO","south africa":"ZA","south georgia and the south sandwich islands":"GS","south korea":"KR","south sudan":"SS","spain":"ES","sri lanka":"LK","state of israel":"IL","state of kuwait":"KW","state of qatar":"QA","sudan":"SD","sultanate of oman":"OM","suriname":"SR","svalbard and jan mayen":"SJ","swaziland":"SZ","sweden":"SE","swiss confederation":"CH","switzerland":"CH","syria":"SY","syrian arab republic":"SY","taiwan":"TW","taiwan, province of china":"TW","tajikistan":"TJ","tanzania":"TZ","tanzania, united republic of":"TZ","thailand":"TH","the state of eritrea":"ER","the state of palestine":"PS","timor-leste":"TL","togo":"TG","togolese republic":"TG","tokelau":"TK","tonga":"TO","trinidad and tobago":"TT","tunisia":"TN","turkmenistan":"TM","turks and caicos islands":"TC","tuvalu":"TV","türkiye":"TR","u.s.a.":"US","uganda":"UG","uk":"GB","ukraine":"UA","union of the comoros":"KM","united arab emirates":"AE","united kingdom":"GB","united kingdom of great britain and northern ireland":"GB","united mexican states":"MX","united republic of tanzania":"TZ","united states":"US","united states minor outlying islands":"UM","united states of america":"US","uruguay":"UY","usa":"US","uzbekistan":"UZ","vanuatu":"VU","venezuela":"VE","venezuela, bolivarian republic of":"VE","viet nam":"VN","vietnam":"VN","virgin islands of the united states":"VI","virgin islands, british":"VG","virgin islands, u.s.":"VI","wallis and futuna":"WF","western sahara":"EH","yemen":"YE","zambia":"ZM","zimbabwe":"ZW","åland islands":"AX"};

    function normalizeCountryKey(value) {
      return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
    }

    function getCountryCode(value) {
      return COUNTRY_CODES[normalizeCountryKey(value)] || "";
    }

    const countryCode = getCountryCode(country);
    const flagUrl = countryCode
      ? "https://flagcdn.com/w80/" + countryCode.toLowerCase() + ".png"
      : "";

    /*
     * =====================================================
     * STORY MODE V7 - CYAN / GOLD DYNAMIC CARD
     * Background contains ONLY fixed art. Dynamic values are
     * always rendered here from Supabase.
     * =====================================================
     */

    if (mode === "story") {
      const typography = getDreamTypography(dreamText.length);

      const GOLD = "#F5C84C";
      const CYAN = "#35E7E0";
      const WHITE = "#F7FAFC";
      const INK = "#02080A";

      const goldWords = new Set([
        "dream","dreams","courage","success","future","hope","believe","freedom","change","family","love"
      ]);
      const cyanWords = new Set([
        "life","world","travel","peace","home","happy","happiness","heal","healing","heart","free"
      ]);

      function createV7Words(text) {
        const words = String(text || "").toUpperCase().split(/\s+/).filter(Boolean);
        return words.map((word, index) => {
          const normalized = word.toLowerCase().replace(/[^a-zà-ÿ]/gi, "");
          const color = goldWords.has(normalized)
            ? GOLD
            : cyanWords.has(normalized)
            ? CYAN
            : WHITE;

          return {
            type: "div",
            props: {
              key: "v7-word-" + index,
              style: {
                display: "flex",
                marginRight: typography.wordGap + "px",
                marginBottom: "8px",
                color,
                fontFamily: "DreamPoster",
                fontSize: typography.size + "px",
                fontWeight: 800,
                fontStyle: "italic",
                lineHeight: typography.lineHeight,
                letterSpacing: "-1.2px",
                textShadow: color === WHITE
                  ? "0 3px 10px rgba(0,0,0,.72)"
                  : "0 0 18px rgba(53,231,224,.24)"
              },
              children: word
            }
          };
        });
      }

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
              backgroundColor: "#020708",
              color: WHITE
            },
            children: [
              {
                type: "img",
                props: {
                  src: "https://onedreameach.com/dream-card-bg-final.png?v=1",
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

              /* Cover the placeholder #000000 baked into the artwork. */
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    right: "22px",
                    top: "58px",
                    width: "610px",
                    height: "400px",
                    display: "flex",
                    background: "linear-gradient(135deg, rgba(1,8,10,.98), rgba(2,16,18,.96) 72%, rgba(2,8,9,.96))",
                    borderRadius: "28px"
                  }
                }
              },

              /* DREAM */
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    right: "72px",
                    top: "88px",
                    width: "520px",
                    display: "flex",
                    justifyContent: "center",
                    color: WHITE,
                    fontFamily: "DreamPoster",
                    fontSize: "42px",
                    fontWeight: 800,
                    fontStyle: "italic",
                    letterSpacing: "14px",
                    textShadow: "0 0 18px rgba(53,231,224,.55)"
                  },
                  children: "D R E A M"
                }
              },

              /* DYNAMIC DREAM NUMBER */
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    right: "44px",
                    top: "142px",
                    width: "565px",
                    height: "170px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: WHITE,
                    fontFamily: "Anton",
                    fontSize: paddedNumber.length > 6 ? "132px" : "150px",
                    fontWeight: 400,
                    lineHeight: 1,
                    letterSpacing: "1px",
                    textShadow: "0 0 12px rgba(53,231,224,.9), 0 8px 24px rgba(0,0,0,.7)"
                  },
                  children: "#" + paddedNumber
                }
              },

              /* ONE HUMAN DREAM */
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    right: "55px",
                    top: "326px",
                    width: "545px",
                    display: "flex",
                    justifyContent: "center",
                    color: CYAN,
                    fontFamily: "DreamPoster",
                    fontSize: "43px",
                    fontWeight: 800,
                    fontStyle: "italic",
                    letterSpacing: "5px",
                    textShadow: "0 0 15px rgba(53,231,224,.38)"
                  },
                  children: "ONE HUMAN DREAM"
                }
              },

              /* DREAM TEXT */
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "118px",
                    top: "548px",
                    width: "844px",
                    height: "565px",
                    display: "flex",
                    flexWrap: "wrap",
                    alignContent: "center",
                    alignItems: "baseline",
                    justifyContent: "flex-start"
                  },
                  children: createV7Words(dreamText)
                }
              },

              /* DREAMER NAME */
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "145px",
                    top: "1410px",
                    width: "790px",
                    height: "82px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: CYAN,
                    fontFamily: "Anton",
                    fontSize: nickname.length > 24 ? "48px" : nickname.length > 16 ? "57px" : "68px",
                    fontWeight: 400,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    textShadow: "0 0 14px rgba(53,231,224,.46)"
                  },
                  children: nickname
                }
              },

              /* COUNTRY + FLAG */
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "185px",
                    top: "1495px",
                    width: "710px",
                    height: "56px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "16px"
                  },
                  children: [
                    flagUrl ? {
                      type: "img",
                      props: {
                        src: flagUrl,
                        width: 46,
                        height: 31,
                        style: {
                          width: "46px",
                          height: "31px",
                          objectFit: "cover",
                          borderRadius: "3px",
                          boxShadow: "0 0 10px rgba(245,200,76,.22)"
                        }
                      }
                    } : null,
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          color: WHITE,
                          fontFamily: "DreamPoster",
                          fontSize: country.length > 20 ? "31px" : "38px",
                          fontWeight: 800,
                          fontStyle: "italic",
                          letterSpacing: "5px",
                          textTransform: "uppercase"
                        },
                        children: country
                      }
                    }
                  ].filter(Boolean)
                }
              },

              /* INSTAGRAM */
              instagramHandle ? {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "176px",
                    top: "1600px",
                    width: "330px",
                    height: "45px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: WHITE,
                    fontFamily: "DreamPoster",
                    fontSize: "27px",
                    fontWeight: 800,
                    fontStyle: "italic",
                    letterSpacing: "1px"
                  },
                  children: instagramHandle
                }
              } : null,

              /* TIKTOK */
              tiktokHandle ? {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: "570px",
                    top: "1600px",
                    width: "330px",
                    height: "45px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: WHITE,
                    fontFamily: "DreamPoster",
                    fontSize: "27px",
                    fontWeight: 800,
                    fontStyle: "italic",
                    letterSpacing: "1px"
                  },
                  children: tiktokHandle
                }
              } : null
            ].filter(Boolean)
          }
        },
        {
          width: 1080,
          height: 1920,
          fonts: [
            { name: "Anton", data: antonFont, weight: 400, style: "normal" },
            { name: "DreamPoster", data: barlowFont, weight: 800, style: "italic" }
          ]
        }
      );

      const storyBuffer = await storyImage.arrayBuffer();
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", `inline; filename="onedreameach-dream-${paddedNumber}.png"`);
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=120, stale-while-revalidate=600");
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





                          
