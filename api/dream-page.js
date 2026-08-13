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
