module.exports = async function handler(req, res) {
  try {

    /*
     * DREAM NUMBER
     */

    const dreamNumber = req.query.number;

    if (!dreamNumber) {
      res.setHeader(
        "Content-Type",
        "text/html; charset=utf-8"
      );

      return res.status(400).send(`
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
      `);
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
      res.setHeader(
        "Content-Type",
        "text/html; charset=utf-8"
      );

      return res.status(404).send(`
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
      `);
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

    const safeCountry =
      escapeHtml(
        dream.country ||
        "WORLD"
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

  <title>${escapeHtml(pageTitle)}</title>

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
    content="One Dream Each"
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


  <!-- VERCEL ANALYTICS -->

  <script
    defer
    src="https://cdn.vercel-insights.com/v1/script.js"
  ></script>


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

      justify-content:
        center;

      align-items:
        center;

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
        180px;

      line-height:
        .6;

      pointer-events:
        none;
    }


    .dream-card::after {
      content:
        "";

      position:
        absolute;

      width:
        280px;

      height:
        280px;

      right:
        -140px;

      bottom:
        -150px;

      border-radius:
        50%;

      background:
        rgba(
          var(--detail-rgb),
          .10
        );

      filter:
        blur(50px);

      pointer-events:
        none;
    }


    /*
     * CARD TOP
     */

    .dream-top {
      position:
        relative;

      z-index:
        1;

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


    .number {
      color:
        var(--detail-accent);

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        14px;

      font-weight:
        700;

      letter-spacing:
        1.8px;
    }


    .country {
      max-width:
        220px;

      padding:
        7px 12px;

      border:
        1px solid
        rgba(
          var(--detail-rgb),
          .25
        );

      border-radius:
        999px;

      background:
        rgba(
          var(--detail-rgb),
          .075
        );

      color:
        #EEEEF4;

      font-size:
        9px;

      font-weight:
        700;

      letter-spacing:
        1.2px;

      text-transform:
        uppercase;

      overflow:
        hidden;

      text-overflow:
        ellipsis;

      white-space:
        nowrap;
    }


    /*
     * DREAM TEXT
     */

    .dream-label {
      position:
        relative;

      z-index:
        1;

      margin-bottom:
        18px;

      color:
        rgba(
          var(--detail-rgb),
          .58
        );

      font-size:
        9px;

      font-weight:
        700;

      letter-spacing:
        2.3px;

      text-transform:
        uppercase;
    }


    .dream {
      position:
        relative;

      z-index:
        1;

      max-width:
        680px;

      color:
        #E8E8ED;

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        clamp(
          28px,
          4vw,
          45px
        );

      line-height:
        1.28;

      letter-spacing:
        -1.5px;

      white-space:
        pre-wrap;

      word-break:
        break-word;
    }
    /*
     * DREAMER
     */

    .dreamer {
      position: relative;
      z-index: 1;
      margin-top: 48px;
      padding-top: 28px;
      border-top: 1px solid rgba(255,255,255,.07);
    }


    .dreamer-label {
      margin-bottom: 8px;

      color:
        var(--detail-accent);

      font-size: 8px;
      font-weight: 700;

      letter-spacing: 1.8px;
      text-transform: uppercase;
    }


    .nickname {
      color: #DCDCE4;

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size: 26px;
      font-weight: 700;

      letter-spacing: -1px;

      word-break: break-word;
    }


    /*
     * AUTHOR SOCIALS
     */

    .author-socials {
      position: relative;
      z-index: 2;

      margin-top: 28px;
    }


    .author-social-label {
      margin-bottom: 10px;

      color:
        var(--detail-accent);

      font-size: 8px;
      font-weight: 700;

      letter-spacing: 1.7px;
      text-transform: uppercase;
    }


    .author-social-buttons {
      display: flex;

      gap: 9px;

      flex-wrap: wrap;
    }


    .author-social {
      min-height: 38px;

      padding: 0 15px;

      display: inline-flex;

      align-items: center;

      gap: 7px;

      border:
        1px solid
        rgba(
          var(--detail-rgb),
          .22
        );

      border-radius: 999px;

      background:
        rgba(
          var(--detail-rgb),
          .06
        );

      color: #D5CCFC;

      text-decoration: none;

      font-size: 10px;
      font-weight: 700;

      transition: .2s ease;
    }


    .author-social:hover {
      color: #F4F4F7;

      border-color:
        rgba(
          var(--detail-rgb),
          .60
        );

      background:
        rgba(
          var(--detail-rgb),
          .13
        );

      transform:
        translateY(-2px);
    }


    .social-icon {
      font-size: 14px;
    }


    /*
     * DIVIDER
     */

    .divider {
      position: relative;
      z-index: 1;

      width: 100%;
      height: 1px;

      margin: 45px 0 32px;

      background:
        linear-gradient(
          90deg,
          transparent,
          rgba(
            var(--detail-rgb),
            .35
          ),
          transparent
        );
    }


    /*
     * SHARE AREA
     */

    .share-area {
      position: relative;
      z-index: 2;

      padding: 22px;

      border:
        1px solid
        rgba(
          var(--detail-rgb),
          .16
        );

      border-radius: 14px;

      background:
        radial-gradient(
          circle at 50% 0%,
          rgba(
            var(--detail-rgb),
            .07
          ),
          transparent 65%
        ),
        rgba(255,255,255,.012);
    }


    .share-title {
      color:
        var(--detail-accent);

      font-size: 9px;
      font-weight: 700;

      letter-spacing: 2px;
      text-transform: uppercase;
    }


    .share-subtitle {
      margin-top: 7px;
      margin-bottom: 19px;

      max-width: 560px;

      color: #858590;

      font-size: 11px;
      line-height: 1.55;
    }


    /*
     * STORY CARD BUTTONS
     */

    .story-actions {
      display: grid;

      grid-template-columns:
        1.35fr 1fr;

      gap: 10px;

      margin-bottom: 10px;
    }


    .story-button {
      min-height: 52px;

      padding: 0 15px;

      display: inline-flex;

      align-items: center;
      justify-content: center;

      gap: 8px;

      border-radius: 10px;

      font-family:
        Inter,
        sans-serif;

      font-size: 10px;
      font-weight: 800;

      letter-spacing: .45px;

      cursor: pointer;

      transition: .22s ease;
    }


    .story-button-primary {
      border:
        1px solid
        rgba(
          var(--detail-rgb),
          .34
        );

      background:
        linear-gradient(
          135deg,
          #7C3AED,
          #6D28D9
        );

      color: #F4F4F7;

      box-shadow:
        0 12px 34px
        rgba(124,58,237,.18);
    }


    .story-button-secondary {
      border:
        1px solid
        rgba(255,255,255,.10);

      background:
        rgba(255,255,255,.025);

      color: #D8D8E0;
    }


    .story-button:hover {
      transform:
        translateY(-2px);

      border-color:
        rgba(
          var(--detail-rgb),
          .60
        );
    }


    .story-button-primary:hover {
      background:
        linear-gradient(
          135deg,
          #8B5CF6,
          #7C3AED
        );

      box-shadow:
        0 16px 42px
        rgba(124,58,237,.25);
    }


    .story-note {
      margin-bottom: 18px;

      color: #6F6F7A;

      font-size: 9px;

      line-height: 1.5;

      text-align: center;
    }


    /*
     * NORMAL SHARE BUTTONS
     */

    .share-buttons {
      display: grid;

      grid-template-columns:
        1.35fr
        1fr
        1fr
        1fr;

      gap: 10px;
    }


    .share-button {
      min-height: 48px;

      padding: 0 15px;

      display: inline-flex;

      align-items: center;
      justify-content: center;

      gap: 8px;

      border:
        1px solid
        rgba(255,255,255,.10);

      border-radius: 9px;

      background:
        rgba(255,255,255,.025);

      color: #CFCFD7;

      font-family:
        Inter,
        sans-serif;

      font-size: 10px;
      font-weight: 700;

      letter-spacing: .4px;

      cursor: pointer;

      text-decoration: none;

      transition: .22s ease;
    }


    .share-button:hover {
      color: #F4F4F7;

      transform:
        translateY(-2px);

      border-color:
        rgba(
          var(--detail-rgb),
          .55
        );

      background:
        rgba(
          var(--detail-rgb),
          .09
        );

      box-shadow:
        0 10px 30px
        rgba(0,0,0,.25);
    }


    .share-main {
      color: #F4F4F7;

      background:
        linear-gradient(
          135deg,
          rgba(124,58,237,.82),
          rgba(109,40,217,.82)
        );

      border-color:
        rgba(167,139,250,.25);

      box-shadow:
        0 10px 30px
        rgba(124,58,237,.12);
    }


    .share-main:hover {
      color: #FFFFFF;

      background:
        linear-gradient(
          135deg,
          #8B5CF6,
          #7C3AED
        );

      border-color:
        rgba(167,139,250,.38);
    }


    .share-icon {
      font-size: 14px;
    }


    .copy-status {
      min-height: 18px;

      margin-top: 14px;

      color:
        var(--detail-accent);

      font-size: 10px;

      text-align: center;
    }


    /*
     * TRUST / DETAIL PROOF
     */

    .detail-proof {
      display: grid;

      grid-template-columns:
        repeat(3,1fr);

      gap: 8px;

      margin-top: 26px;
    }


    .detail-proof span {
      padding: 11px 8px;

      border:
        1px solid
        rgba(255,255,255,.07);

      border-radius: 8px;

      background:
        rgba(255,255,255,.018);

      color: #6F6F79;

      font-size: 8px;
      font-weight: 700;

      letter-spacing: .65px;

      text-align: center;
      text-transform: uppercase;
    }


    .detail-proof b {
      display: block;

      margin-bottom: 3px;

      color: #D9D9DF;

      font-size: 9px;
    }


    .signature {
      position: relative;
      z-index: 1;

      margin-top: 27px;

      color: #595965;

      font-size: 9px;

      letter-spacing: 1.5px;
      text-transform: uppercase;
    }


    /*
     * FOOTER
     */

    footer {
      border-top:
        1px solid
        var(--line);

      padding: 30px 0;

      text-align: center;

      color: #5E5E69;

      font-size: 12px;
    }


    /*
     * MOBILE / ANDROID
     */

    @media (max-width: 650px) {

      .container {
        width: 94%;
      }


      nav {
        min-height: 88px;

        gap: 9px;
      }


      .brand {
        flex:
          1 1 auto;

        min-width: 0;
      }


      .brand-logo {
        width:
          clamp(
            128px,
            38vw,
            165px
          );

        height: 62px;
      }


      /*
       * SAME VISUAL WEIGHT AS
       * HOME / EXPLORE BUTTON
       */

      .back {
        min-width: 170px;
        min-height: 44px;

        padding:
          0 12px;

        flex:
          0 0 auto;

        border:
          1px solid
          rgba(167,139,250,.42);

        border-radius:
          999px;

        background:
          rgba(124,58,237,.09);

        color:
          #F0EEF8;

        font-size:
          8.5px;

        font-weight:
          700;

        letter-spacing:
          .25px;

        white-space:
          nowrap;
      }


      main {
        padding:
          55px 0 85px;
      }


      .dream-card {
        padding:
          38px 22px 32px;

        border-radius:
          14px;
      }


      .dream-card::before {
        right: 8px;
        top: 90px;

        font-size: 115px;
      }


      .dream-top {
        gap: 10px;

        margin-bottom: 36px;
      }


      .number {
        font-size: 10px;

        letter-spacing: 1px;
      }


      .country {
        max-width: 120px;

        padding:
          6px 9px;

        font-size: 7.5px;

        letter-spacing: .7px;
      }


      .dream-label {
        font-size: 8px;

        letter-spacing: 1.7px;
      }


      .dream {
        font-size: 26px;

        letter-spacing: -.9px;
      }


      .dreamer {
        margin-top: 36px;
      }


      .nickname {
        font-size: 22px;
      }


      .share-area {
        padding: 17px;
      }


      .story-actions {
        grid-template-columns:
          1fr;
      }


      .story-button {
        width: 100%;

        min-height: 49px;

        font-size: 9px;
      }


      .share-buttons {
        grid-template-columns:
          1fr 1fr;
      }


      .share-main {
        grid-column:
          1 / -1;
      }


      .share-button {
        min-height: 46px;

        padding:
          0 8px;

        font-size: 9px;
      }


      .detail-proof {
        grid-template-columns:
          1fr;
      }

    }


    /*
     * SMALL ANDROID / IPHONE
     */

    @media (max-width: 430px) {

      .container {
        width: 95%;
      }


      nav {
        min-height: 84px;

        gap: 6px;
      }


      .brand-logo {
        width: 128px;

        height: 56px;
      }


      .back {
        min-width: 162px;
        min-height: 42px;

        padding:
          0 10px;

        border:
          1px solid
          rgba(167,139,250,.42);

        border-radius:
          999px;

        background:
          rgba(124,58,237,.09);

        color:
          #F3F0FC;

        font-size: 8px;

        letter-spacing: 0;

        white-space:
          nowrap;
      }


      .dream-card {
        padding:
          34px 18px 30px;
      }


      .dream {
        font-size: 24px;
      }


      .share-buttons {
        grid-template-columns:
          1fr;
      }


      .share-main {
        grid-column: auto;
      }

    }

  </style>

</head>


<body>


  <div class="container">


    <nav>


      <a
        class="brand"
        href="/"
        aria-label="One Dream Each - Home"
      >

        <img
          src="/logo.png"
          alt="One Dream Each"
          class="brand-logo"
        >

      </a>


      <a
        class="back"
        href="/#world"
      >
        ← RETURN TO THE DREAM WALL
      </a>


    </nav>


    <main>


      <article
        class="dream-card tone-${cardTone}"
      >


        <div class="dream-top">


          <div class="number">
            DREAM #${paddedNumber}
          </div>


          <div class="country">
            ${safeCountry}
          </div>


        </div>


        <div class="dream-label">
          ONE OF 1,000,000 DREAMS
        </div>


        <div class="dream">
          “${safeDream}”
        </div>


        <div class="dreamer">


          <div class="dreamer-label">
            DREAMED BY
          </div>


          <div class="nickname">
            ${safeNickname}
          </div>


        </div>


        ${socialsHtml}


        <div class="divider"></div>


        <!-- SHARE -->

        <div class="share-area">


          <div class="share-title">
            TURN THIS DREAM INTO A STORY
          </div>


          <div class="share-subtitle">
            Create a vertical Dream Card made for Instagram Stories,
            TikTok and other social platforms — or share the link anywhere.
          </div>


          <!-- 9:16 STORY CARD -->

          <div class="story-actions">


            <button
              type="button"
              class="story-button story-button-primary"
              onclick="shareStoryCard()"
            >

              <span class="share-icon">
                ✦
              </span>

              SHARE STORY CARD

            </button>


            <button
              type="button"
              class="story-button story-button-secondary"
              onclick="saveStoryCard()"
            >

              <span class="share-icon">
                ↓
              </span>

              SAVE 9:16 CARD

            </button>


          </div>


          <div class="story-note">
            1080 × 1920 · designed for vertical social posts and Stories
          </div>


          <!-- LINK SHARE -->

          <div class="share-buttons">


            <button
              type="button"
              class="share-button share-main"
              onclick="shareDream()"
            >

              <span class="share-icon">
                ↗
              </span>

              SHARE LINK

            </button>


            <button
              type="button"
              class="share-button"
              onclick="copyDreamLink()"
            >

              <span class="share-icon">
                ⧉
              </span>

              COPY LINK

            </button>


            <button
              type="button"
              class="share-button"
              onclick="shareWhatsApp()"
            >

              <span class="share-icon">
                ◉
              </span>

              WHATSAPP

            </button>


            <button
              type="button"
              class="share-button"
              onclick="shareX()"
            >

              <span class="share-icon">
                𝕏
              </span>

              X

            </button>


          </div>


          <div
            class="copy-status"
            id="copy-status"
          ></div>


        </div>


        <!-- VALUE / TRUST -->

        <div class="detail-proof">


          <span>
            <b>
              UNIQUE
            </b>

            DREAM #${paddedNumber}
          </span>


          <span>
            <b>
              PUBLIC
            </b>

            YOUR OWN PAGE
          </span>


          <span>
            <b>
              PART OF
            </b>

            1,000,000 DREAMS
          </span>


        </div>


        <div class="signature">
          ONE DREAM EACH · YOUR DREAM HAS A PLACE
        </div>


      </article>


    </main>


  </div>


  <footer>
    ONE DREAM EACH · One million people. One million dreams.
  </footer>


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


    const shareText =
      ${JSON.stringify(
        String(
          dream.nickname ||
          "Someone"
        ) +
        " left dream #" +
        dream.dream_number +
        " on One Dream Each."
      )};


    /*
     * STORY CARD ENDPOINT
     */

    const storyCardUrl =
      "/api/story-card?number=" +
      encodeURIComponent(
        dreamNumber
      );


    /*
     * GET STORY IMAGE
     */

    async function getStoryCardFile() {

      const response =
        await fetch(
          storyCardUrl,
          {
            cache:
              "no-store"
          }
        );


      if (!response.ok) {

        throw new Error(
          "Unable to create story card"
        );

      }


      const blob =
        await response.blob();


      return new File(
        [
          blob
        ],
        "one-dream-each-" +
        paddedDreamNumber +
        ".png",
        {
          type:
            "image/png"
        }
      );

    }
        /*
     * SHARE STORY CARD
     */

    async function shareStoryCard() {

      const status =
        document.getElementById(
          "copy-status"
        );


      try {

        status.textContent =
          "Creating your story card...";


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
              "My dream has a place on One Dream Each.",

            files: [
              file
            ]

          });


          status.textContent =
            "Story card ready to share.";

        }

        else {

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


          document.body
            .appendChild(
              link
            );


          link.click();


          link.remove();


          setTimeout(
            function() {

              URL.revokeObjectURL(
                objectUrl
              );

            },
            1000
          );


          status.textContent =
            "Story card saved. Post it to Instagram or TikTok.";

        }

      }

      catch (error) {

        if (
          error.name ===
          "AbortError"
        ) {

          status.textContent =
            "";

          return;
        }


        console.error(
          "Story card share error:",
          error
        );


        status.textContent =
          "Unable to share the story card right now.";

      }


      setTimeout(
        function() {

          status.textContent =
            "";

        },
        3500
      );

    }


    /*
     * SAVE STORY CARD
     */

    async function saveStoryCard() {

      const status =
        document.getElementById(
          "copy-status"
        );


      try {

        status.textContent =
          "Creating your 9:16 card...";


        const file =
          await getStoryCardFile();


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


        document.body
          .appendChild(
            link
          );


        link.click();


        link.remove();


        setTimeout(
          function() {

            URL.revokeObjectURL(
              objectUrl
            );

          },
          1000
        );


        status.textContent =
          "Story card saved.";

      }

      catch (error) {

        console.error(
          "Story card save error:",
          error
        );


        status.textContent =
          "Unable to save the story card.";

      }


      setTimeout(
        function() {

          status.textContent =
            "";

        },
        3000
      );

    }


    /*
     * COPY LINK
     */

    async function copyDreamLink() {

      const status =
        document.getElementById(
          "copy-status"
        );


      try {

        await navigator
          .clipboard
          .writeText(
            dreamUrl
          );


        status.textContent =
          "✓ Link copied";

      }

      catch (error) {

        status.textContent =
          "Unable to copy.";

      }


      setTimeout(
        function() {

          status.textContent =
            "";

        },
        2500
      );

    }


    /*
     * SHARE LINK
     */

    async function shareDream() {

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

        }

        catch (error) {

          if (
            error.name !==
            "AbortError"
          ) {

            console.error(
              error
            );

          }

        }


        return;
      }


      copyDreamLink();

    }


    /*
     * WHATSAPP
     */

    function shareWhatsApp() {

      window.open(

        "https://wa.me/?text=" +

        encodeURIComponent(

          shareText +
          "\\n" +
          dreamUrl

        ),

        "_blank",

        "noopener,noreferrer"

      );

    }


    /*
     * X
     */

    function shareX() {

      window.open(

        "https://twitter.com/intent/tweet?text=" +

        encodeURIComponent(
          shareText
        ) +

        "&url=" +

        encodeURIComponent(
          dreamUrl
        ),

        "_blank",

        "noopener,noreferrer"

      );

    }


  </script>


</body>


</html>
`;


    /*
     * RESPONSE
     */

    res.setHeader(
      "Content-Type",
      "text/html; charset=utf-8"
    );


    /*
     * NO CACHE WHILE WE ARE STILL
     * ACTIVELY TESTING THE DREAM PAGE
     */

    res.setHeader(
      "Cache-Control",
      "no-store"
    );


    return res
      .status(200)
      .send(
        html
      );

  }


  catch (error) {

    console.error(
      "DREAM PAGE ERROR:",
      error
    );


    res.setHeader(
      "Content-Type",
      "text/html; charset=utf-8"
    );


    return res
      .status(500)
      .send(`
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
      `);

  }
};



    
