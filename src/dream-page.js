export async function handleDreamPage(request, env, dreamNumber) {
  try {

    /*
     * DREAM NUMBER
     */

    dreamNumber =
      String(
        dreamNumber || ""
      ).trim();

    if (!dreamNumber) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="en">

        <head>
          <meta charset="UTF-8">

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          >

          <title>
            Dream not found — One Dream Each
          </title>

          <style>
            body {
              min-height: 100vh;
              margin: 0;
              display: grid;
              place-items: center;
              background: #050505;
              color: #E8E8ED;
              font-family: Arial, sans-serif;
              text-align: center;
            }

            a {
              color: #a78bfa;
            }
          </style>
        </head>

        <body>
          <div>
            <h1>
              Dream number missing.
            </h1>

            <a href="/">
              Return to One Dream Each
            </a>
          </div>
        </body>

        </html>
      `, {
        status: 400,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store"
        }
      });
    }


    /*
     * SUPABASE
     */

    const supabaseUrl =
      env.SUPABASE_URL;

    const supabaseKey =
      env.SUPABASE_ANON_KEY;

    if (
      !supabaseUrl ||
      !supabaseKey
    ) {
      throw new Error(
        "Supabase environment variables are missing"
      );
    }


    /*
     * LOAD DREAM
     */

    const url =
      supabaseUrl +
      "/rest/v1/Dreams" +
      "?select=id,dream_number,nickname,dream_text,country,instagram,tiktok,created_at" +
      "&dream_number=eq." +
      encodeURIComponent(dreamNumber) +
      "&limit=1";

    const response =
      await fetch(
        url,
        {
          headers: {
            apikey: supabaseKey,
            Authorization:
              "Bearer " +
              supabaseKey
          }
        }
      );

    const responseText =
      await response.text();

    if (!response.ok) {
      throw new Error(
        "Supabase request failed: " +
        responseText
      );
    }

    const dreams =
      responseText
        ? JSON.parse(responseText)
        : [];


    /*
     * NOT FOUND
     */

    if (
      !Array.isArray(dreams) ||
      dreams.length === 0
    ) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="en">

        <head>
          <meta charset="UTF-8">

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          >

          <title>
            Dream not found — One Dream Each
          </title>

          <style>
            body {
              min-height: 100vh;
              margin: 0;
              display: grid;
              place-items: center;
              background: #050505;
              color: #E8E8ED;
              font-family: Arial, sans-serif;
              text-align: center;
            }

            .box {
              padding: 50px 25px;
            }

            a {
              display: inline-flex;
              margin-top: 20px;
              color: #a78bfa;
              text-decoration: none;
            }
          </style>
        </head>

        <body>
          <div class="box">

            <h1>
              Dream not found.
            </h1>

            <p>
              This place doesn't seem to exist.
            </p>

            <a href="/#world">
              ← Return to the Dream Wall
            </a>

          </div>
        </body>

        </html>
      `, {
        status: 404,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store"
        }
      });
    }


    const dream =
      dreams[0];


    /*
     * ESCAPE HTML
     */

    function escapeHtml(value) {
      return String(
        value ?? ""
      )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }


    /*
     * SAFE VALUES
     */

    const paddedNumber =
      String(
        dream.dream_number
      ).padStart(
        6,
        "0"
      );

    const safeNickname =
      escapeHtml(
        dream.nickname ||
        "Anonymous"
      );

    const safeDream =
      escapeHtml(
        dream.dream_text ||
        ""
      );


    /*
     * =========================================================
     * COUNTRY -> FLAG
     * =========================================================
     */

    const COUNTRY_CODES = {
      "afghanistan":"AF",
      "albania":"AL",
      "algeria":"DZ",
      "andorra":"AD",
      "angola":"AO",
      "argentina":"AR",
      "armenia":"AM",
      "australia":"AU",
      "austria":"AT",
      "azerbaijan":"AZ",
      "bahamas":"BS",
      "bahrain":"BH",
      "bangladesh":"BD",
      "barbados":"BB",
      "belarus":"BY",
      "belgium":"BE",
      "belize":"BZ",
      "benin":"BJ",
      "bhutan":"BT",
      "bolivia":"BO",
      "bosnia and herzegovina":"BA",
      "botswana":"BW",
      "brazil":"BR",
      "brunei":"BN",
      "bulgaria":"BG",
      "burkina faso":"BF",
      "burundi":"BI",
      "cambodia":"KH",
      "cameroon":"CM",
      "canada":"CA",
      "cape verde":"CV",
      "central african republic":"CF",
      "chad":"TD",
      "chile":"CL",
      "china":"CN",
      "colombia":"CO",
      "comoros":"KM",
      "congo":"CG",
      "costa rica":"CR",
      "croatia":"HR",
      "cuba":"CU",
      "cyprus":"CY",
      "czech republic":"CZ",
      "czechia":"CZ",
      "denmark":"DK",
      "dominican republic":"DO",
      "ecuador":"EC",
      "egypt":"EG",
      "el salvador":"SV",
      "estonia":"EE",
      "ethiopia":"ET",
      "fiji":"FJ",
      "finland":"FI",
      "france":"FR",
      "gabon":"GA",
      "gambia":"GM",
      "georgia":"GE",
      "germany":"DE",
      "ghana":"GH",
      "greece":"GR",
      "guatemala":"GT",
      "guinea":"GN",
      "guyana":"GY",
      "haiti":"HT",
      "honduras":"HN",
      "hungary":"HU",
      "iceland":"IS",
      "india":"IN",
      "indonesia":"ID",
      "iran":"IR",
      "iraq":"IQ",
      "ireland":"IE",
      "israel":"IL",
      "italy":"IT",
      "ivory coast":"CI",
      "jamaica":"JM",
      "japan":"JP",
      "jordan":"JO",
      "kazakhstan":"KZ",
      "kenya":"KE",
      "kuwait":"KW",
      "kyrgyzstan":"KG",
      "laos":"LA",
      "latvia":"LV",
      "lebanon":"LB",
      "libya":"LY",
      "liechtenstein":"LI",
      "lithuania":"LT",
      "luxembourg":"LU",
      "madagascar":"MG",
      "malaysia":"MY",
      "maldives":"MV",
      "mali":"ML",
      "malta":"MT",
      "mauritania":"MR",
      "mauritius":"MU",
      "mexico":"MX",
      "moldova":"MD",
      "monaco":"MC",
      "mongolia":"MN",
      "montenegro":"ME",
      "morocco":"MA",
      "mozambique":"MZ",
      "myanmar":"MM",
      "namibia":"NA",
      "nepal":"NP",
      "netherlands":"NL",
      "new zealand":"NZ",
      "nicaragua":"NI",
      "niger":"NE",
      "nigeria":"NG",
      "north korea":"KP",
      "north macedonia":"MK",
      "norway":"NO",
      "oman":"OM",
      "pakistan":"PK",
      "panama":"PA",
      "paraguay":"PY",
      "peru":"PE",
      "philippines":"PH",
      "poland":"PL",
      "portugal":"PT",
      "qatar":"QA",
      "romania":"RO",
      "russia":"RU",
      "rwanda":"RW",
      "san marino":"SM",
      "saudi arabia":"SA",
      "senegal":"SN",
      "serbia":"RS",
      "singapore":"SG",
      "slovakia":"SK",
      "slovenia":"SI",
      "somalia":"SO",
      "south africa":"ZA",
      "south korea":"KR",
      "spain":"ES",
      "sri lanka":"LK",
      "sudan":"SD",
      "suriname":"SR",
      "sweden":"SE",
      "switzerland":"CH",
      "syria":"SY",
      "taiwan":"TW",
      "tajikistan":"TJ",
      "tanzania":"TZ",
      "thailand":"TH",
      "togo":"TG",
      "tunisia":"TN",
      "turkey":"TR",
      "turkmenistan":"TM",
      "uganda":"UG",
      "ukraine":"UA",
      "united arab emirates":"AE",
      "united kingdom":"GB",
      "uk":"GB",
      "united states":"US",
      "united states of america":"US",
      "usa":"US",
      "uruguay":"UY",
      "uzbekistan":"UZ",
      "vatican city":"VA",
      "venezuela":"VE",
      "vietnam":"VN",
      "yemen":"YE",
      "zambia":"ZM",
      "zimbabwe":"ZW"
    };


    const plainCountry =
      String(
        dream.country ||
        "WORLD"
      ).trim();


    const countryCode =
      COUNTRY_CODES[
        plainCountry.toLowerCase()
      ] || "";


    /*
     * REAL PNG FLAG
     *
     * This avoids the Windows/Chrome emoji problem.
     */

    const safeFlagUrl =
      countryCode
        ? (
            "https://flagcdn.com/w80/" +
            countryCode.toLowerCase() +
            ".png"
          )
        : "";


    const safeCountry =
      escapeHtml(
        plainCountry
      );


    /*
     * META
     */

    const plainDescription =
      String(
        dream.dream_text ||
        "One dream. One place. One story."
      )
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 180);

    const metaDescription =
      escapeHtml(
        plainDescription
      );

    const canonicalUrl =
      "https://onedreameach.com/dream/" +
      encodeURIComponent(
        dream.dream_number
      );

    const ogImageUrl =
      "https://onedreameach.com/api/og?number=" +
      encodeURIComponent(
        dream.dream_number
      );

    const pageTitle =
      "Dream #" +
      paddedNumber +
      " — One Dream Each";

    const cardTone =
      Number(
        dream.dream_number || 0
      ) % 4;


    /*
     * AUTHOR SOCIALS
     */

    let instagramHtml = "";

    if (dream.instagram) {
      const username =
        String(
          dream.instagram
        )
          .trim()
          .replace(/^@/, "");

      instagramHtml = `
        <a
          class="author-social"
          href="https://instagram.com/${encodeURIComponent(username)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="social-icon">
            ◎
          </span>

          Instagram
        </a>
      `;
    }


    let tiktokHtml = "";

    if (dream.tiktok) {
      const username =
        String(
          dream.tiktok
        )
          .trim()
          .replace(/^@/, "");

      tiktokHtml = `
        <a
          class="author-social"
          href="https://tiktok.com/@${encodeURIComponent(username)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="social-icon">
            ♪
          </span>

          TikTok
        </a>
      `;
    }


    const socialsHtml =
      instagramHtml ||
      tiktokHtml
        ? `
          <div class="author-socials">

            <div class="author-social-label">
              FIND THE DREAMER
            </div>

            <div class="author-social-buttons">
              ${instagramHtml}
              ${tiktokHtml}
            </div>

          </div>
        `
        : "";


    /*
     * PAGE HTML
     */

    const html = `
<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <meta
    name="robots"
    content="index, follow"
  >

  <link
    rel="icon"
    type="image/png"
    sizes="32x32"
    href="/favicon-32.png"
  >

  <link
    rel="icon"
    type="image/png"
    sizes="64x64"
    href="/favicon-64.png"
  >

  <link
    rel="apple-touch-icon"
    sizes="180x180"
    href="/apple-touch-icon.png"
  >

  <link
    rel="manifest"
    href="/site.webmanifest"
  >

  <meta
    name="theme-color"
    content="#050505"
  >

  <title>
    ${escapeHtml(pageTitle)}
  </title>

  <meta
    name="description"
    content="${metaDescription}"
  >

  <link
    rel="canonical"
    href="${canonicalUrl}"
  >


  <!-- OPEN GRAPH -->

  <meta
    property="og:type"
    content="website"
  >

  <meta
    property="og:site_name"
    content="OneDreamEach"
  >

  <meta
    property="og:title"
    content="${escapeHtml(pageTitle)}"
  >

  <meta
    property="og:description"
    content="${metaDescription}"
  >

  <meta
    property="og:url"
    content="${canonicalUrl}"
  >

  <meta
    property="og:image"
    content="${ogImageUrl}"
  >

  <meta
    property="og:image:secure_url"
    content="${ogImageUrl}"
  >

  <meta
    property="og:image:width"
    content="1200"
  >

  <meta
    property="og:image:height"
    content="630"
  >

  <meta
    property="og:image:type"
    content="image/png"
  >

  <meta
    property="og:image:alt"
    content="Dream #${paddedNumber} on One Dream Each"
  >


  <!-- X / TWITTER -->

  <meta
    name="twitter:card"
    content="summary_large_image"
  >

  <meta
    name="twitter:title"
    content="${escapeHtml(pageTitle)}"
  >

  <meta
    name="twitter:description"
    content="${metaDescription}"
  >

  <meta
    name="twitter:image"
    content="${ogImageUrl}"
  >






  <style>

    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');


    :root {
      --black: #050505;
      --white: #E8E8ED;
      --muted: #A7A7B2;
      --soft: #747480;

      --purple: #7C3AED;
      --purple-light: #A78BFA;

      --line:
        rgba(255,255,255,.09);
    }


    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }


    html {
      scroll-behavior: smooth;
    }


    body {
      min-height: 100vh;

      background:
        #050505;

      color:
        var(--white);

      font-family:
        Inter,
        sans-serif;

      overflow-x:
        hidden;
    }
    body::before {
      content: "";

      position:
        fixed;

      width:
        900px;

      height:
        900px;

      left:
        50%;

      top:
        -150px;

      transform:
        translateX(-50%);

      background:
        radial-gradient(
          circle,
          rgba(139,92,246,.14),
          transparent 66%
        );

      pointer-events:
        none;

      z-index:
        -1;
    }


    .container {
      width:
        min(1120px,92%);

      margin:
        auto;
    }


    /*
     * NAVBAR
     */

    nav {
      min-height:
        116px;

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        24px;

      border-bottom:
        1px solid
        var(--line);
    }


    .brand {
      display:
        flex;

      align-items:
        center;

      flex:
        1;

      min-width:
        0;

      text-decoration:
        none;
    }


    .brand-logo {
      width:
        285px;

      height:
        94px;

      max-width:
        100%;

      display:
        block;

      object-fit:
        contain;

      object-position:
        left center;

      filter:
        drop-shadow(
          0 0 22px
          rgba(167,139,250,.17)
        );
    }


    /*
     * RETURN TO THE DREAM WALL
     */

    .back {
      min-width:
        220px;

      min-height:
        46px;

      padding:
        0 20px;

      display:
        inline-flex;

      align-items:
        center;

      justify-content:
        center;

      flex-shrink:
        0;

      border:
        1px solid
        rgba(167,139,250,.34);

      border-radius:
        999px;

      background:
        rgba(255,255,255,.025);

      color:
        #E8E8ED;

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        12px;

      font-weight:
        700;

      letter-spacing:
        1px;

      line-height:
        1;

      white-space:
        nowrap;

      text-decoration:
        none;

      box-shadow:
        inset 0 1px 0
        rgba(255,255,255,.035);

      transition:
        .2s ease;
    }


    .back:hover {
      color:
        #F4F4F7;

      border-color:
        #A78BFA;

      background:
        rgba(124,58,237,.10);

      transform:
        translateY(-1px);

      box-shadow:
        0 0 30px
        rgba(124,58,237,.10);
    }


    /*
     * PAGE
     */

    main {
      min-height:
        calc(100vh - 180px);

      display:
        flex;

      flex-direction:
        column;

      justify-content:
        center;

      align-items:
        center;

      gap:
        42px;

      padding:
        90px 0 115px;
    }


    /*
     * DREAM CARD
     */

    .dream-card {
      --detail-accent:
        #A78BFA;

      --detail-rgb:
        167,139,250;

      width:
        min(820px,100%);

      position:
        relative;

      overflow:
        hidden;

      padding:
        64px 60px 52px;

      border:
        1px solid
        rgba(
          var(--detail-rgb),
          .20
        );

      border-radius:
        18px;

      background:

        radial-gradient(
          circle at 92% 7%,
          rgba(
            var(--detail-rgb),
            .19
          ),
          transparent 34%
        ),

        radial-gradient(
          circle at 0% 100%,
          rgba(
            var(--detail-rgb),
            .055
          ),
          transparent 35%
        ),

        linear-gradient(
          145deg,
          rgba(255,255,255,.03),
          rgba(255,255,255,.006)
        ),

        #09090b;

      box-shadow:
        0 35px 120px
        rgba(0,0,0,.50);
    }


    .dream-card.tone-1 {
      --detail-accent:
        #A78BFA;

      --detail-rgb:
        167,139,250;
    }


    .dream-card.tone-2 {
      --detail-accent:
        #8B5CF6;

      --detail-rgb:
        139,92,246;
    }


    .dream-card.tone-3 {
      --detail-accent:
        #C084FC;

      --detail-rgb:
        192,132,252;
    }


    .dream-card.tone-0 {
      --detail-accent:
        #C4B5FD;

      --detail-rgb:
        196,181,253;
    }


    .dream-card::before {
      content:
        "“";

      position:
        absolute;

      right:
        25px;

      top:
        78px;

      color:
        rgba(
          var(--detail-rgb),
          .075
        );

      font-family:
        Georgia,
        serif;

      font-size:
        210px;

      font-weight:
        700;

      line-height:
        .75;

      pointer-events:
        none;
    }


    .dream-card::after {
      content: "";

      position:
        absolute;

      width:
        220px;

      height:
        220px;

      right:
        -90px;

      bottom:
        -100px;

      border:
        1px solid
        rgba(
          var(--detail-rgb),
          .09
        );

      border-radius:
        50%;

      box-shadow:
        0 0 100px
        rgba(
          var(--detail-rgb),
          .05
        );

      pointer-events:
        none;
    }


    .dream-top {
      position:
        relative;

      z-index:
        2;

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        20px;

      margin-bottom:
        48px;
    }


    .dream-number {
      display:
        inline-flex;

      align-items:
        center;

      min-height:
        34px;

      padding:
        0 13px;

      border:
        1px solid
        rgba(
          var(--detail-rgb),
          .34
        );

      border-radius:
        999px;

      background:
        rgba(
          var(--detail-rgb),
          .07
        );

      color:
        var(--detail-accent);

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        11px;

      font-weight:
        700;

      letter-spacing:
        1.6px;

      line-height:
        1;

      white-space:
        nowrap;
    }


    .country {
      display:
        inline-flex;

      align-items:
        center;

      gap:
        8px;

      max-width:
        55%;

      color:
        #9B9BA6;

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        11px;

      font-weight:
        700;

      letter-spacing:
        1.6px;

      line-height:
        1.2;

      text-align:
        right;

      text-transform:
        uppercase;
    }


    .country-flag {
      width:
        28px;

      height:
        19px;

      display:
        block;

      flex:
        0 0 auto;

      object-fit:
        cover;

      border-radius:
        3px;

      box-shadow:
        0 0 0 1px rgba(255,255,255,.10),
        0 4px 12px rgba(0,0,0,.28);
    }


    .country-world {
      display:
        inline-flex;

      align-items:
        center;

      justify-content:
        center;

      font-size:
        16px;

      line-height:
        1;
    }


    /*
     * IMPORTANT FIX:
     * Every line of the dream starts from exactly
     * the same left edge.
     */

    .dream {
      position:
        relative;

      z-index:
        2;

      width:
        100%;

      max-width:
        690px;

      margin:
        0;

      margin-left:
        0;

      padding:
        0;

      padding-left:
        0;

      color:
        #F0F0F3;

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        clamp(
          31px,
          5vw,
          48px
        );

      font-weight:
        600;

      line-height:
        1.22;

      letter-spacing:
        -1.4px;

      text-align:
        left;

      text-indent:
        0;

      overflow-wrap:
        anywhere;

      word-break:
        normal;

      align-self:
        stretch;
    }


    .dream-author {
      position:
        relative;

      z-index:
        2;

      margin-top:
        42px;

      padding-top:
        26px;

      border-top:
        1px solid
        rgba(255,255,255,.08);
    }


    .dream-author-label {
      margin-bottom:
        8px;

      color:
        #73737E;

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        10px;

      font-weight:
        700;

      letter-spacing:
        1.8px;

      text-transform:
        uppercase;
    }


    .dream-author-name {
      color:
        #D8D8DE;

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        17px;

      font-weight:
        600;

      line-height:
        1.35;
    }


    /*
     * AUTHOR SOCIALS
     */

    .author-socials {
      position:
        relative;

      z-index:
        2;

      margin-top:
        27px;
    }


    .author-social-label {
      margin-bottom:
        12px;

      color:
        #686873;

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        9px;

      font-weight:
        700;

      letter-spacing:
        1.7px;
    }


    .author-social-buttons {
      display:
        flex;

      flex-wrap:
        wrap;

      gap:
        10px;
    }


    .author-social {
      min-height:
        38px;

      padding:
        0 14px;

      display:
        inline-flex;

      align-items:
        center;

      justify-content:
        center;

      gap:
        8px;

      border:
        1px solid
        rgba(
          var(--detail-rgb),
          .19
        );

      border-radius:
        999px;

      background:
        rgba(
          var(--detail-rgb),
          .045
        );

      color:
        #BEBEC7;

      font-family:
        Inter,
        sans-serif;

      font-size:
        11px;

      font-weight:
        600;

      text-decoration:
        none;

      transition:
        .2s ease;
    }


    .author-social:hover {
      color:
        #FFFFFF;

      border-color:
        rgba(
          var(--detail-rgb),
          .44
        );

      background:
        rgba(
          var(--detail-rgb),
          .11
        );

      transform:
        translateY(-1px);
    }


    .social-icon {
      color:
        var(--detail-accent);

      font-size:
        14px;
    }
    /*
     * DETAIL PROOF
     */

    .detail-proof {
      position:
        relative;

      z-index:
        1;

      display:
        grid;

      grid-template-columns:
        repeat(3,1fr);

      gap:
        10px;

      margin-top:
        30px;
    }


    .proof-item {
      padding:
        14px 12px;

      border:
        1px solid
        rgba(
          var(--detail-rgb),
          .12
        );

      border-radius:
        10px;

      background:
        rgba(
          var(--detail-rgb),
          .025
        );

      text-align:
        center;
    }


    .proof-value {
      color:
        var(--detail-accent);

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        12px;

      font-weight:
        700;
    }


    .proof-label {
      margin-top:
        5px;

      color:
        #676772;

      font-size:
        7px;

      font-weight:
        700;

      letter-spacing:
        1px;

      text-transform:
        uppercase;
    }


    /*
     * SHARE AREA
     */

    .share-section {
      position:
        relative;

      z-index:
        1;

      margin-top:
        36px;

      padding:
        27px 25px;

      border:
        1px solid
        rgba(
          var(--detail-rgb),
          .14
        );

      border-radius:
        14px;

      background:

        radial-gradient(
          circle at 100% 0%,
          rgba(
            var(--detail-rgb),
            .09
          ),
          transparent 45%
        ),

        rgba(255,255,255,.012);
    }


    .share-title {
      color:
        var(--detail-accent);

      font-size:
        9px;

      font-weight:
        800;

      letter-spacing:
        2px;

      text-transform:
        uppercase;
    }


    .share-description {
      max-width:
        560px;

      margin-top:
        10px;

      color:
        #858590;

      font-size:
        10px;

      line-height:
        1.6;
    }


    .share-buttons {
      display:
        flex;

      flex-wrap:
        wrap;

      gap:
        9px;

      margin-top:
        18px;
    }


    .share-button {
      min-height:
        44px;

      padding:
        0 17px;

      display:
        inline-flex;

      align-items:
        center;

      justify-content:
        center;

      gap:
        8px;

      border:
        1px solid
        rgba(255,255,255,.10);

      border-radius:
        9px;

      background:
        rgba(255,255,255,.025);

      color:
        #D7D7DF;

      font-family:
        Inter,
        sans-serif;

      font-size:
        9px;

      font-weight:
        800;

      letter-spacing:
        .3px;

      cursor:
        pointer;

      text-decoration:
        none;

      transition:
        .2s ease;
    }


    .share-button:hover {
      transform:
        translateY(-1px);

      color:
        #F4F4F7;

      border-color:
        rgba(
          var(--detail-rgb),
          .50
        );

      background:
        rgba(
          var(--detail-rgb),
          .08
        );
    }


    .share-button.primary {
      color:
        #F4F4F7;

      border-color:
        rgba(
          var(--detail-rgb),
          .30
        );

      background:
        linear-gradient(
          135deg,
          rgba(
            var(--detail-rgb),
            .30
          ),
          rgba(
            var(--detail-rgb),
            .13
          )
        );

      box-shadow:
        0 10px 30px
        rgba(
          var(--detail-rgb),
          .09
        );
    }


    .share-button.primary:hover {
      border-color:
        var(--detail-accent);

      box-shadow:
        0 13px 34px
        rgba(
          var(--detail-rgb),
          .14
        );
    }


    .share-note {
      margin-top:
        14px;

      color:
        #5F5F69;

      font-size:
        8px;

      line-height:
        1.55;
    }


    /*
     * CLEAN DREAM CTA
     */

    .dream-next {
      width:
        min(820px,100%);

      position:
        relative;

      padding:
        60px 30px 18px;

      text-align:
        center;

      border-top:
        1px solid
        rgba(167,139,250,.13);
    }


    .dream-next::before {
      content:
        "";

      position:
        absolute;

      width:
        520px;

      height:
        220px;

      left:
        50%;

      top:
        30px;

      transform:
        translateX(-50%);

      background:
        radial-gradient(
          circle,
          rgba(139,92,246,.10),
          transparent 68%
        );

      pointer-events:
        none;
    }


    .dream-next > * {
      position:
        relative;

      z-index:
        1;
    }


    .dream-next-kicker {
      color:
        #747480;

      font-size:
        8px;

      font-weight:
        800;

      letter-spacing:
        2.5px;

      text-transform:
        uppercase;
    }


    .dream-next h2 {
      max-width:
        650px;

      margin:
        15px auto 0;

      color:
        #E8E8ED;

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        clamp(
          30px,
          5vw,
          46px
        );

      font-weight:
        600;

      line-height:
        1.08;

      letter-spacing:
        -1.5px;
    }


    .dream-next h2 span {
      color:
        #A78BFA;
    }


    .dream-next p {
      max-width:
        570px;

      margin:
        18px auto 0;

      color:
        #858590;

      font-size:
        12px;

      line-height:
        1.75;
    }


    .dream-next-button {
      min-width:
        230px;

      min-height:
        52px;

      margin-top:
        28px;

      padding:
        0 24px;

      display:
        inline-flex;

      align-items:
        center;

      justify-content:
        center;

      border:
        1px solid
        rgba(167,139,250,.38);

      border-radius:
        999px;

      background:
        linear-gradient(
          135deg,
          rgba(124,58,237,.24),
          rgba(167,139,250,.10)
        );

      color:
        #F4F4F7;

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        11px;

      font-weight:
        700;

      letter-spacing:
        .8px;

      text-decoration:
        none;

      box-shadow:
        0 14px 40px
        rgba(124,58,237,.10);

      transition:
        .2s ease;
    }


    .dream-next-button:hover {
      transform:
        translateY(-2px);

      border-color:
        #A78BFA;

      box-shadow:
        0 18px 46px
        rgba(124,58,237,.16);
    }


    /*
     * TOAST
     */

    .toast {
      position:
        fixed;

      left:
        50%;

      bottom:
        28px;

      z-index:
        999;

      transform:
        translate(-50%,30px);

      padding:
        12px 17px;

      border:
        1px solid
        rgba(167,139,250,.24);

      border-radius:
        999px;

      background:
        rgba(9,9,11,.94);

      color:
        #E8E8ED;

      font-size:
        10px;

      font-weight:
        700;

      letter-spacing:
        .4px;

      opacity:
        0;

      pointer-events:
        none;

      transition:
        .25s ease;

      box-shadow:
        0 14px 45px
        rgba(0,0,0,.45);

      backdrop-filter:
        blur(14px);
    }


    .toast.show {
      opacity:
        1;

      transform:
        translate(-50%,0);
    }
    /*
     * RESPONSIVE
     */

    @media (max-width: 760px) {

      nav {
        min-height:
          92px;

        gap:
          12px;
      }


      .brand-logo {
        width:
          190px;

        height:
          68px;
      }


      .back {
        min-width:
          auto;

        min-height:
          40px;

        padding:
          0 13px;

        font-size:
          9px;

        letter-spacing:
          .5px;
      }


      main {
        padding:
          60px 0 90px;

        gap:
          34px;
      }


      .dream-card {
        padding:
          42px 28px 36px;

        border-radius:
          16px;
      }


      .dream-card::before {
        right:
          5px;

        top:
          92px;

        font-size:
          155px;
      }


      .dream-top {
        margin-bottom:
          38px;

        gap:
          12px;
      }


      .dream-number {
        min-height:
          30px;

        padding:
          0 10px;

        font-size:
          9px;

        letter-spacing:
          1px;
      }


      .country {
        max-width:
          52%;

        gap:
          6px;

        font-size:
          9px;

        letter-spacing:
          1px;
      }


      .country-flag {
        width:
          25px;

        height:
          17px;
      }


      /*
       * MOBILE DREAM TEXT FIX
       *
       * Keep every line aligned to the same left edge.
       */

      .dream {
        width:
          100%;

        max-width:
          none;

        margin:
          0;

        padding:
          0;

        text-align:
          left;

        text-indent:
          0;

        font-size:
          clamp(
            27px,
            8vw,
            38px
          );

        line-height:
          1.24;

        letter-spacing:
          -1px;
      }


      .dream-author {
        margin-top:
          34px;

        padding-top:
          22px;
      }


      .dream-author-name {
        font-size:
          16px;
      }


      .author-social-buttons {
        gap:
          8px;
      }


      .author-social {
        min-height:
          36px;

        padding:
          0 12px;

        font-size:
          10px;
      }


      .detail-proof {
        grid-template-columns:
          1fr;

        gap:
          8px;
      }


      .proof-item {
        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          15px;

        padding:
          12px 14px;

        text-align:
          left;
      }


      .proof-label {
        margin-top:
          0;
      }


      .share-section {
        margin-top:
          30px;

        padding:
          23px 18px;
      }


      .share-buttons {
        display:
          grid;

        grid-template-columns:
          1fr 1fr;

        gap:
          8px;
      }


      .share-button {
        width:
          100%;

        min-height:
          44px;

        padding:
          0 10px;

        font-size:
          8px;
      }


      .dream-next {
        padding:
          50px 15px 10px;
      }


      .dream-next h2 {
        letter-spacing:
          -1px;
      }

    }


    @media (max-width: 470px) {

      .container {
        width:
          93%;
      }


      nav {
        min-height:
          82px;
      }


      .brand-logo {
        width:
          155px;

        height:
          60px;
      }


      .back {
        min-height:
          37px;

        padding:
          0 10px;

        font-size:
          8px;
      }


      main {
        padding-top:
          45px;
      }


      .dream-card {
        padding:
          34px 21px 30px;
      }


      .dream-top {
        align-items:
          flex-start;

        margin-bottom:
          32px;
      }


      .dream-number {
        font-size:
          8px;
      }


      .country {
        max-width:
          50%;

        font-size:
          8px;

        text-align:
          right;
      }


      .country-flag {
        width:
          23px;

        height:
          16px;
      }


      .dream {
        font-size:
          clamp(
            25px,
            8.5vw,
            34px
          );

        line-height:
          1.25;

        /*
         * Do not indent the opening quote or first line.
         */
        text-align:
          left;

        text-indent:
          0;

        margin-left:
          0;

        padding-left:
          0;
      }


      .share-buttons {
        grid-template-columns:
          1fr;
      }


      .toast {
        width:
          calc(100% - 32px);

        max-width:
          390px;

        text-align:
          center;
      }

    }


  
    /* =========================================================
       ODE PREMIUM NAV BUTTON — FINAL OVERRIDE
       ========================================================= */

    .back {
      min-width: 205px;
      min-height: 60px;
      padding: 0 32px;

      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      position: relative;
      overflow: hidden;

      border: 1px solid rgba(125,211,252,.48);
      border-radius: 15px;

      background:
        radial-gradient(
          circle at 18% 15%,
          rgba(139,92,246,.25),
          transparent 43%
        ),
        linear-gradient(
          135deg,
          #0A0C12 0%,
          #141321 53%,
          #07171C 100%
        );

      color: #F8FAFC;

      font-family: "Space Grotesk", sans-serif;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 2.15px;
      line-height: 1;
      text-transform: uppercase;
      text-decoration: none;
      white-space: nowrap;

      text-shadow:
        0 0 16px rgba(255,255,255,.10);

      box-shadow:
        0 12px 34px rgba(0,0,0,.34),
        0 0 30px rgba(124,58,237,.12),
        0 0 24px rgba(34,211,238,.10),
        inset 0 1px 0 rgba(255,255,255,.09);

      transition:
        transform .22s ease,
        border-color .22s ease,
        box-shadow .22s ease,
        background .22s ease;
    }

    .back::before {
      content: "";
      position: absolute;
      inset: 0;

      background:
        linear-gradient(
          108deg,
          transparent 24%,
          rgba(255,255,255,.18) 47%,
          transparent 69%
        );

      transform: translateX(-145%);
      transition: transform .58s ease;
      pointer-events: none;
    }

    .back::after {
      content: "";
      position: absolute;
      left: 16%;
      right: 16%;
      bottom: 0;
      height: 2px;

      background:
        linear-gradient(
          90deg,
          transparent,
          #8B5CF6 30%,
          #22D3EE 72%,
          transparent
        );

      opacity: .95;
      pointer-events: none;
    }

    .back:hover {
      color: #FFFFFF;

      transform:
        translateY(-3px)
        scale(1.025);

      border-color:
        rgba(103,232,249,.78);

      background:
        radial-gradient(
          circle at 18% 15%,
          rgba(139,92,246,.34),
          transparent 44%
        ),
        linear-gradient(
          135deg,
          #0C0F17 0%,
          #1A162B 52%,
          #082027 100%
        );

      box-shadow:
        0 17px 44px rgba(0,0,0,.40),
        0 0 38px rgba(139,92,246,.18),
        0 0 34px rgba(34,211,238,.17),
        inset 0 1px 0 rgba(255,255,255,.13);
    }

    .back:hover::before {
      transform: translateX(145%);
    }

    .back:active {
      transform:
        translateY(-1px)
        scale(.99);
    }

    @media (max-width: 760px) {
      .back {
        min-width: 150px;
        min-height: 50px;
        padding: 0 18px;
        border-radius: 13px;
        font-size: 12px;
        letter-spacing: 1.45px;
      }
    }

    @media (max-width: 470px) {
      .back {
        min-width: 134px;
        min-height: 46px;
        padding: 0 14px;
        font-size: 11px;
        letter-spacing: 1.15px;
      }
    }



    /* SPECIAL ATTRIBUTION — DREAM #000012 ONLY */
    .famous-dream-note {
      position: relative;
      z-index: 2;
      margin-top: 18px;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,.055);
      color: rgba(232,232,237,.48);
      font-size: 8px;
      line-height: 1.55;
      letter-spacing: .35px;
      text-align: center;
    }

    .famous-dream-note strong {
      color: rgba(232,232,237,.62);
      font-weight: 700;
      letter-spacing: .7px;
    }

    /* CONNECT EVERY DREAM PAGE BACK TO THE GLOBAL CHALLENGE */
    .dream-challenge-ribbon {
      width: fit-content;
      max-width: 92%;
      margin: 22px auto -32px;
      padding: 9px 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px solid rgba(167,139,250,.16);
      border-radius: 999px;
      background: rgba(124,58,237,.05);
      color: #9595A0;
      font-family: Inter, sans-serif;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 1.25px;
      text-transform: uppercase;
      text-align: center;
    }

    .dream-challenge-ribbon span {
      width: 6px;
      height: 6px;
      flex: 0 0 auto;
      border-radius: 50%;
      background: #A78BFA;
      box-shadow: 0 0 12px rgba(167,139,250,.50);
    }

  </style>

</head>


<body>


  <div class="container">


    <!-- NAV -->

    <nav>

      <a
        href="/"
        class="brand"
        aria-label="One Dream Each home"
      >
        <img
          src="/logo.png"
          alt="One Dream Each"
          class="brand-logo"
        >
      </a>


      <a
        href="/explore"
        class="back"
      >
        DREAM WALL
      </a>

    </nav>

    <div class="dream-challenge-ribbon">
      <span></span> PART OF THE 1,000,000 HUMAN DREAM CHALLENGE
    </div>


    <!-- PAGE -->

    <main>


      <article
        class="dream-card tone-${cardTone}"
      >


        <!-- TOP -->

        <div class="dream-top">


          <div class="dream-number">
            DREAM #${paddedNumber}
          </div>


          <div class="country">

            ${
              safeFlagUrl
                ? `
                  <img
                    class="country-flag"
                    src="${safeFlagUrl}"
                    alt=""
                    width="28"
                    height="19"
                  >
                `
                : `
                  <span class="country-world">
                    🌍
                  </span>
                `
            }

            <span>
              ${safeCountry}
            </span>

          </div>


        </div>


        <!-- DREAM -->

        <div class="dream">${safeDream}</div>


        <!-- AUTHOR -->

        <div class="dream-author">

          <div class="dream-author-label">
            DREAMED BY
          </div>

          <div class="dream-author-name">
            ${safeNickname}
          </div>

        </div>


        ${socialsHtml}


        <!-- PROOF -->

        <div class="detail-proof">


          <div class="proof-item">

            <div class="proof-value">
              #${paddedNumber}
            </div>

            <div class="proof-label">
              UNIQUE NUMBER
            </div>

          </div>


          <div class="proof-item">

            <div class="proof-value">
              PUBLIC
            </div>

            <div class="proof-label">
              DREAM PAGE
            </div>

          </div>


          <div class="proof-item">

            <div class="proof-value">
              1 / 1M
            </div>

            <div class="proof-label">
              ONE DREAM EACH
            </div>

          </div>


        </div>


        ${
          Number(dream.dream_number) === 12
            ? `
              <div class="famous-dream-note">
                <strong>FAMOUS DREAM · UNOFFICIAL TRIBUTE</strong><br>
                Based on publicly available statements. MrBeast is not affiliated with or endorsing OneDreamEach.
              </div>
            `
            : ""
        }


        <!-- SHARE -->

        <section class="share-section">

          <div class="share-title">
            SHARE THIS DREAM
          </div>


          <div class="share-description">
            Share the Dream Card or this page and let this dream travel beyond the wall.
          </div>


          <div class="share-buttons">


            <button
              type="button"
              class="share-button primary"
              id="share-story-card"
            >
              ✦ SHARE DREAM CARD
            </button>


            <button
              type="button"
              class="share-button"
              id="save-story-card"
            >
              ↓ SAVE DREAM CARD
            </button>


            <button
              type="button"
              class="share-button"
              id="share-link"
            >
              ↗ SHARE PAGE
            </button>


            <button
              type="button"
              class="share-button"
              id="copy-link"
            >
              ⧉ COPY LINK
            </button>


          </div>


          <div
            class="share-note"
            id="share-status"
          ></div>


        </section>


      </article>


      <!-- NEXT DREAM CTA -->

      <section class="dream-next">


        <div class="dream-next-kicker">
          ONE MILLION PEOPLE · ONE DREAM EACH
        </div>


        <h2>
          This dream has a place.<br>
          <span>
            What about yours?
          </span>
        </h2>


        <p>
          Leave one dream, receive your own unique number
          and become part of a wall built to hold
          one million human dreams.
        </p>


        <a
          href="/#leave"
          class="dream-next-button"
        >
          LEAVE YOUR DREAM — €1
        </a>


      </section>


    </main>


  </div>


  <div
    class="toast"
    id="toast"
  ></div>
  <script>

    /*
     * PAGE VALUES
     */

    const dreamUrl =
      ${JSON.stringify(
        canonicalUrl
      )};


    const dreamNumber =
      ${JSON.stringify(
        dream.dream_number
      )};


    const paddedDreamNumber =
      ${JSON.stringify(
        paddedNumber
      )};



    const currentDreamData = {
      dream_number:
        ${JSON.stringify(
          dream.dream_number
        )},
      nickname:
        ${JSON.stringify(
          dream.nickname || "Anonymous"
        )},
      dream_text:
        ${JSON.stringify(
          dream.dream_text || ""
        )},
      country:
        ${JSON.stringify(
          dream.country || "World"
        )},
      instagram:
        ${JSON.stringify(
          dream.instagram || ""
        )},
      tiktok:
        ${JSON.stringify(
          dream.tiktok || ""
        )}
    };


    const STORY_COUNTRY_CODES =
      ${JSON.stringify(
        COUNTRY_CODES
      )};


    function getCountryCode(
      country
    ) {
      return STORY_COUNTRY_CODES[
        String(
          country ||
          ""
        )
          .trim()
          .toLowerCase()
      ] || "";
    }


    const shareText =
      ${JSON.stringify(
        "This dream has a permanent place on OneDreamEach — #" +
        dream.dream_number +
        "."
      )};


    /*
     * =========================================================
     * CLIENT-SIDE STORY CARD GENERATOR
     * =========================================================
     */

    const CARD_GOLD = "#F6C64B";
    const CARD_CYAN = "#22E4EE";
    const CARD_WHITE = "#FFFFFF";
    const CARD_SOFT = "#D7E5E9";

    const CARD_GOLD_WORDS = new Set([
      "dream","dreams","courage","freedom","future","success",
      "hope","believe","change","purpose","goal","goals"
    ]);

    const CARD_CYAN_WORDS = new Set([
      "life","world","love","peace","family","home","travel",
      "happy","happiness","heart","heal","healing"
    ]);

    function normalizeStorySocial(value) {
      if (!value) return "";

      let clean = String(value).trim();
      let lower = clean.toLowerCase();

      if (lower.startsWith("https://")) {
        clean = clean.slice(8);
      } else if (lower.startsWith("http://")) {
        clean = clean.slice(7);
      }

      lower = clean.toLowerCase();

      if (lower.startsWith("www.")) {
        clean = clean.slice(4);
      }

      lower = clean.toLowerCase();

      if (lower.startsWith("instagram.com/")) {
        clean = clean.slice(14);
      } else if (lower.startsWith("tiktok.com/")) {
        clean = clean.slice(11);
      }

      while (clean.startsWith("@")) {
        clean = clean.slice(1);
      }

      const questionIndex = clean.indexOf("?");
      const hashIndex = clean.indexOf("#");
      let cutIndex = clean.length;

      if (questionIndex !== -1) cutIndex = Math.min(cutIndex, questionIndex);
      if (hashIndex !== -1) cutIndex = Math.min(cutIndex, hashIndex);

      clean = clean.slice(0, cutIndex);

      while (clean.endsWith("/")) {
        clean = clean.slice(0, -1);
      }

      clean = clean.trim();

      return clean ? "@" + clean.slice(0, 30) : "";
    }

        function getStoryTypography(length) {
      if (length <= 40) return { size: 92, lineHeight: 88 };
      if (length <= 70) return { size: 80, lineHeight: 78 };
      if (length <= 105) return { size: 70, lineHeight: 69 };
      if (length <= 145) return { size: 61, lineHeight: 61 };
      if (length <= 190) return { size: 54, lineHeight: 55 };
      if (length <= 235) return { size: 48, lineHeight: 49 };
      return { size: 43, lineHeight: 44 };
    }

    function loadStoryImage(src) {
      return new Promise(function(resolve, reject) {
        const image = new Image();
        image.onload = function() { resolve(image); };
        image.onerror = function() {
          reject(new Error("Unable to load Story Card asset: " + src));
        };
        image.crossOrigin = "anonymous";
        image.src = src;
      });
    }

    async function loadStoryFonts() {
      if (!document.fonts || typeof FontFace === "undefined") return;

      const fonts = [
        new FontFace(
          "ODEAnton",
          "url(/anton.ttf)",
          { style: "normal", weight: "400" }
        ),
        new FontFace(
          "ODEPoster",
          "url(/barlow-condensed-extrabold-italic.ttf)",
          { style: "italic", weight: "800" }
        )
      ];

      await Promise.all(
        fonts.map(async function(font) {
          try {
            const loaded = await font.load();
            document.fonts.add(loaded);
          } catch (error) {
            console.warn("Story Card font fallback:", error);
          }
        })
      );
    }

    function drawLetterSpacedText(ctx, text, x, y, spacing, align) {
      const chars = Array.from(String(text));
      const widths = chars.map(function(char) {
        return ctx.measureText(char).width;
      });

      const total =
        widths.reduce(function(sum, width) { return sum + width; }, 0) +
        Math.max(0, chars.length - 1) * spacing;

      let cursor = x;
      if (align === "center") cursor = x - total / 2;
      else if (align === "right") cursor = x - total;

      chars.forEach(function(char, index) {
        ctx.fillText(char, cursor, y);
        cursor += widths[index] + spacing;
      });
    }

    function cardWordColor(word) {
      const normalized = String(word)
        .toLowerCase()
        .replace(/[^a-zà-ÿ]/gi, "");

      if (CARD_GOLD_WORDS.has(normalized)) return CARD_GOLD;
      if (CARD_CYAN_WORDS.has(normalized)) return CARD_CYAN;
      return CARD_WHITE;
    }

    function buildStoryLines(ctx, text, maxWidth) {
      const words = String(text)
        .toUpperCase()
        .split(/\s+/)
        .filter(Boolean);

      const lines = [];
      let line = [];
      let width = 0;
      const gap = ctx.measureText(" ").width;

      words.forEach(function(word) {
        const wordWidth = ctx.measureText(word).width;
        const nextWidth = line.length ? width + gap + wordWidth : wordWidth;

        if (line.length && nextWidth > maxWidth) {
          lines.push(line);
          line = [word];
          width = wordWidth;
        } else {
          line.push(word);
          width = nextWidth;
        }
      });

      if (line.length) lines.push(line);
      return lines;
    }

    function drawColoredDream(ctx, text) {
      const typography = getStoryTypography(String(text).length);

      ctx.font =
        'italic 800 ' +
        typography.size +
        'px "ODEPoster", Impact, sans-serif';

      ctx.textBaseline = "alphabetic";
      ctx.shadowColor = "rgba(0,0,0,.82)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 5;

      const lines = buildStoryLines(ctx, text, 794);
      const totalHeight = lines.length * typography.lineHeight;

      let y =
        475 +
        (520 - totalHeight) / 2 +
        typography.size * .78;

      lines.forEach(function(words) {
        const gap = ctx.measureText(" ").width;

        const widths = words.map(function(word) {
          return ctx.measureText(word).width;
        });

        const lineWidth =
          widths.reduce(function(sum, value) { return sum + value; }, 0) +
          Math.max(0, words.length - 1) * gap;

        let x = 512 - lineWidth / 2;

        words.forEach(function(word, index) {
          ctx.fillStyle = cardWordColor(word);
          ctx.fillText(word, x, y);
          x += widths[index] + gap;
        });

        y += typography.lineHeight;
      });

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }

    async function buildStoryCardBlob(cardData) {
      await loadStoryFonts();

      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1536;

      const ctx = canvas.getContext("2d", { alpha: false });

      if (!ctx) {
        throw new Error("Canvas is unavailable");
      }

      ctx.fillStyle = "#020507";
      ctx.fillRect(0, 0, 1024, 1536);

      const template = await loadStoryImage("/dream-card-template-v2.png");
      ctx.drawImage(template, 0, 0, 1024, 1536);

      const padded = String(cardData.dream_number).padStart(6, "0");

      ctx.textAlign = "right";
      ctx.fillStyle = "#E8FCFF";
      ctx.font = 'italic 800 32px "ODEPoster", Impact, sans-serif';
      ctx.shadowColor = "rgba(34,228,238,.65)";
      ctx.shadowBlur = 15;

      drawLetterSpacedText(ctx, "DREAM", 960, 130, 10, "right");

      ctx.font = '400 132px "ODEAnton", Impact, sans-serif';
      ctx.fillStyle = CARD_WHITE;
      ctx.shadowColor = "rgba(34,228,238,.58)";
      ctx.shadowBlur = 25;
      ctx.fillText("#" + padded, 960, 255);

      ctx.font = 'italic 800 29px "ODEPoster", Impact, sans-serif';
      ctx.fillStyle = CARD_CYAN;
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      drawLetterSpacedText(ctx, "ONE HUMAN DREAM", 960, 307, 4, "right");

      drawColoredDream(ctx, cardData.dream_text || "");

      ctx.textAlign = "center";
      ctx.fillStyle = CARD_CYAN;
      ctx.font = 'italic 800 23px "ODEPoster", Impact, sans-serif';
      drawLetterSpacedText(ctx, "DREAMED BY", 512, 1058, 10, "center");

      const nickname = String(cardData.nickname || "Anonymous")
        .trim()
        .toUpperCase();

      const nicknameSize =
        nickname.length > 22 ? 48 :
        nickname.length > 15 ? 56 : 66;

      ctx.font =
        'italic 800 ' +
        nicknameSize +
        'px "ODEPoster", Impact, sans-serif';

      ctx.fillStyle = CARD_WHITE;
      ctx.shadowColor = "rgba(0,0,0,.9)";
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 4;
      ctx.fillText(nickname, 512, 1138, 680);

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      const country = String(cardData.country || "World").trim();
      const countryCode =
        typeof getCountryCode === "function"
          ? getCountryCode(country)
          : "";

      ctx.font = 'italic 800 25px "ODEPoster", Impact, sans-serif';

      const countryLabel = country.toUpperCase();
      const countryWidth = ctx.measureText(countryLabel).width;
      const flagWidth = countryCode ? 46 : 0;
      const gap = countryCode ? 12 : 0;
      const countryTotal = flagWidth + gap + countryWidth;

      let countryX = 512 - countryTotal / 2;

      if (countryCode) {
        try {
          const flag = await loadStoryImage(
            "https://flagcdn.com/w160/" +
            countryCode.toLowerCase() +
            ".png"
          );

          ctx.save();

          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(countryX, 1171, 46, 30, 4);
            ctx.clip();
          }

          ctx.drawImage(flag, countryX, 1171, 46, 30);
          ctx.restore();

          countryX += 46 + gap;
        } catch (error) {
          console.warn("Story Card flag fallback:", error);
        }
      }

      ctx.textAlign = "left";
      ctx.fillStyle = CARD_SOFT;
      ctx.fillText(countryLabel, countryX, 1197);

      const instagram = normalizeStorySocial(cardData.instagram);
      const tiktok = normalizeStorySocial(cardData.tiktok);

      if (instagram || tiktok) {
        ctx.font = 'italic 800 19px "ODEPoster", Impact, sans-serif';

        const parts = [];

        if (instagram) {
          parts.push({ text: "IG " + instagram, color: CARD_CYAN });
        }

        if (instagram && tiktok) {
          parts.push({ text: " | ", color: "rgba(255,255,255,.35)" });
        }

        if (tiktok) {
          parts.push({ text: "TT " + tiktok, color: CARD_GOLD });
        }

        const widths = parts.map(function(part) {
          return ctx.measureText(part.text).width;
        });

        const total = widths.reduce(function(sum, value) {
          return sum + value;
        }, 0);

        let x = 512 - total / 2;
        ctx.textAlign = "left";

        parts.forEach(function(part, index) {
          ctx.fillStyle = part.color;
          ctx.fillText(part.text, x, 1245);
          x += widths[index];
        });
      }

      // Permanent OneDreamEach branding on every downloaded/shared card.
      ctx.textAlign = "center";
      ctx.fillStyle = CARD_WHITE;
      ctx.font = 'italic 800 25px "ODEPoster", Impact, sans-serif';
      ctx.shadowColor = "rgba(34,228,238,.45)";
      ctx.shadowBlur = 12;
      drawLetterSpacedText(ctx, "ONEDREAMEACH.COM", 512, 1452, 4, "center");
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      return await new Promise(function(resolve, reject) {
        canvas.toBlob(
          function(blob) {
            if (!blob) {
              reject(new Error("Unable to encode Story Card"));
              return;
            }

            resolve(blob);
          },
          "image/png",
          1
        );
      });
    }




    /*
     * ELEMENTS
     */

    const shareStatus =
      document.getElementById(
        "share-status"
      );


    const shareStoryButton =
      document.getElementById(
        "share-story-card"
      );


    const saveStoryButton =
      document.getElementById(
        "save-story-card"
      );


    const shareLinkButton =
      document.getElementById(
        "share-link"
      );


    const copyLinkButton =
      document.getElementById(
        "copy-link"
      );


    /*
     * GET STORY CARD FILE
     */

    async function getStoryCardFile() {

      const blob =
        await buildStoryCardBlob(
          currentDreamData
        );

      return new File(
        [
          blob
        ],
        "onedreameach-dream-" +
        paddedDreamNumber +
        "-story.png",
        {
          type:
            "image/png"
        }
      );

    }


    /*
     * SAVE FILE
     */

    function downloadFile(
      file
    ) {

      const objectUrl =
        URL.createObjectURL(
          file
        );

      const link =
        document.createElement(
          "a"
        );

      link.href =
        objectUrl;

      link.download =
        file.name;

      link.style.display =
        "none";

      document.body.appendChild(
        link
      );

      link.click();

      setTimeout(
        function() {

          link.remove();

          URL.revokeObjectURL(
            objectUrl
          );

        },
        2500
      );

    }


    /*
     * SHARE STORY CARD
     */

    async function shareStoryCard() {

      try {

        shareStatus.textContent =
          "Creating your Story Card...";


        const file =
          await getStoryCardFile();


        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({
            files: [
              file
            ]
          })
        ) {

          await navigator.share({

            title:
              ${JSON.stringify(
                pageTitle
              )},

            text:
              "A dream with a permanent place on OneDreamEach.",

            files: [
              file
            ]

          });


          shareStatus.textContent =
            "Story Card ready to share.";

        }

        else {

          downloadFile(
            file
          );


          shareStatus.textContent =
            "Story Card saved. Post it to Instagram or TikTok.";

        }

      }

      catch (error) {

        if (
          error.name ===
          "AbortError"
        ) {

          shareStatus.textContent =
            "Your Story Card is generated automatically from this dream.";

          return;

        }


        console.error(
          "Story card share error:",
          error
        );


        shareStatus.textContent =
          "Unable to share the Story Card right now.";

      }


      setTimeout(
        function() {

          shareStatus.textContent =
            "Your Story Card is generated automatically from this dream.";

        },
        3500
      );

    }


    /*
     * SAVE STORY CARD
     */

    async function saveStoryCard() {

      try {

        shareStatus.textContent =
          "Creating your Dream Card...";


        const file =
          await getStoryCardFile();


        downloadFile(
          file
        );


        shareStatus.textContent =
          "Story Card saved.";

      }

      catch (error) {

        console.error(
          "Story card save error:",
          error
        );


        shareStatus.textContent =
          "Unable to save the Story Card.";

      }


      setTimeout(
        function() {

          shareStatus.textContent =
            "Your Story Card is generated automatically from this dream.";

        },
        3000
      );

    }


    /*
     * SHARE LINK
     */

    async function shareDreamLink() {

      if (
        navigator.share
      ) {

        try {

          await navigator.share({

            title:
              ${JSON.stringify(
                pageTitle
              )},

            text:
              shareText,

            url:
              dreamUrl

          });


          return;

        }

        catch (error) {

          if (
            error.name !==
            "AbortError"
          ) {

            console.error(
              "Share link error:",
              error
            );

          }

          else {

            return;

          }

        }

      }


      await copyDreamLink();

    }


    /*
     * COPY LINK
     */

    async function copyDreamLink() {

      try {

        await navigator
          .clipboard
          .writeText(
            dreamUrl
          );


        shareStatus.textContent =
          "✓ Dream link copied.";

      }

      catch (error) {

        console.error(
          "Copy link error:",
          error
        );


        shareStatus.textContent =
          "Unable to copy the link.";

      }


      setTimeout(
        function() {

          shareStatus.textContent =
            "Your Story Card is generated automatically from this dream.";

        },
        2500
      );

    }


    /*
     * BUTTON EVENTS
     */

    if (
      shareStoryButton
    ) {

      shareStoryButton
        .addEventListener(
          "click",
          shareStoryCard
        );

    }


    if (
      saveStoryButton
    ) {

      saveStoryButton
        .addEventListener(
          "click",
          saveStoryCard
        );

    }


    if (
      shareLinkButton
    ) {

      shareLinkButton
        .addEventListener(
          "click",
          shareDreamLink
        );

    }


    if (
      copyLinkButton
    ) {

      copyLinkButton
        .addEventListener(
          "click",
          copyDreamLink
        );

    }

  </script>

</body>

</html>
`;


    /*
     * RESPONSE
     */

    return new Response(
      html,
      {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store"
        }
      }
    );

  }


  catch (error) {

    console.error(
      "DREAM PAGE ERROR:",
      error
    );


    return new Response(`
        <!DOCTYPE html>

        <html lang="en">

        <head>

          <meta charset="UTF-8">

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          >

          <title>
            Error — One Dream Each
          </title>

        </head>


        <body
          style="
            min-height:100vh;
            margin:0;
            background:#050505;
            color:#E8E8ED;
            font-family:Arial,sans-serif;
            text-align:center;
            display:grid;
            place-items:center;
          "
        >

          <div>

            <h1>
              Unable to load this dream.
            </h1>

            <p>
              Please try again later.
            </p>

            <a
              href="/#world"
              style="
                display:inline-block;
                margin-top:20px;
                color:#a78bfa;
              "
            >
              ← Return to the Dream Wall
            </a>

          </div>

        </body>

        </html>
      `, {
        status: 500,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store"
        }
      });

  }
}


    
