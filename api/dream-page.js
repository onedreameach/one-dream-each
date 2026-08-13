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

  <meta
    name="robots"
    content="index, follow"
  >

  <!-- OneDreamEach Icons / PWA -->
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="icon" type="image/png" sizes="64x64" href="/favicon-64.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#050505">

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
      position:
        relative;

      z-index:
        1;

      margin-top:
        48px;

      padding-top:
        26px;

      border-top:
        1px solid
        rgba(255,255,255,.07);
    }


    .dreamer-label {
      margin-bottom:
        8px;

      color:
        #666672;

      font-size:
        8px;

      font-weight:
        700;

      letter-spacing:
        2px;

      text-transform:
        uppercase;
    }


    .dreamer-name {
      color:
        #DCDCE4;

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        22px;

      font-weight:
        700;
    }


    /*
     * AUTHOR SOCIALS
     */

    .author-socials {
      position:
        relative;

      z-index:
        1;

      margin-top:
        28px;

      padding-top:
        24px;

      border-top:
        1px solid
        rgba(255,255,255,.06);
    }


    .author-social-label {
      margin-bottom:
        13px;

      color:
        #666672;

      font-size:
        8px;

      font-weight:
        700;

      letter-spacing:
        2px;

      text-transform:
        uppercase;
    }


    .author-social-buttons {
      display:
        flex;

      gap:
        10px;

      flex-wrap:
        wrap;
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

      gap:
        8px;

      border:
        1px solid
        rgba(
          var(--detail-rgb),
          .20
        );

      border-radius:
        9px;

      background:
        rgba(
          var(--detail-rgb),
          .045
        );

      color:
        #CFCFD8;

      font-size:
        9px;

      font-weight:
        700;

      text-decoration:
        none;

      transition:
        .2s ease;
    }


    .author-social:hover {
      color:
        #F2F2F6;

      border-color:
        var(--detail-accent);

      background:
        rgba(
          var(--detail-rgb),
          .10
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
        .4px;

      cursor:
        pointer;

      transition:
        .2s ease;
    }


    .share-button:hover {
      transform:
        translateY(-1px);

      border-color:
        var(--detail-accent);

      background:
        rgba(
          var(--detail-rgb),
          .08
        );

      color:
        #FFFFFF;
    }


    .share-button.primary {
      border-color:
        rgba(
          var(--detail-rgb),
          .34
        );

      background:
        linear-gradient(
          135deg,
          rgba(
            var(--detail-rgb),
            .19
          ),
          rgba(
            var(--detail-rgb),
            .08
          )
        );

      color:
        #F2F2F7;
    }


    .share-note {
      min-height:
        18px;

      margin-top:
        12px;

      color:
        #777783;

      font-size:
        8px;

      line-height:
        1.5;
    }


    /*
     * NEXT DREAM CTA
     */

    .dream-next {
      width:
        min(720px,100%);

      padding-top:
        52px;

      text-align:
        center;
    }


    .next-kicker {
      color:
        #8B5CF6;

      font-size:
        9px;

      font-weight:
        800;

      letter-spacing:
        2.5px;

      text-transform:
        uppercase;
    }


    .dream-next h2 {
      margin-top:
        15px;

      color:
        #E8E8ED;

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        clamp(
          27px,
          4vw,
          42px
        );

      line-height:
        1.1;

      letter-spacing:
        -1.6px;
    }


    .dream-next p {
      max-width:
        540px;

      margin:
        17px auto 0;

      color:
        #7D7D88;

      font-size:
        11px;

      line-height:
        1.75;
    }


    .next-actions {
      display:
        flex;

      justify-content:
        center;

      flex-wrap:
        wrap;

      gap:
        10px;

      margin-top:
        25px;
    }


    .next-button {
      min-height:
        46px;

      padding:
        0 22px;

      display:
        inline-flex;

      align-items:
        center;

      justify-content:
        center;

      border:
        1px solid
        rgba(255,255,255,.10);

      border-radius:
        999px;

      background:
        rgba(255,255,255,.025);

      color:
        #DADAE2;

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        10px;

      font-weight:
        700;

      letter-spacing:
        .7px;

      text-decoration:
        none;

      transition:
        .2s ease;
    }


    .next-button:hover {
      transform:
        translateY(-1px);

      border-color:
        #A78BFA;

      color:
        #FFFFFF;
    }


    .next-button.primary {
      border-color:
        rgba(167,139,250,.42);

      background:
        linear-gradient(
          135deg,
          #7C3AED,
          #8B5CF6
        );

      color:
        white;

      box-shadow:
        0 15px 45px
        rgba(124,58,237,.20);
    }


    /*
     * FOOTER
     */

    footer {
      padding:
        28px 0 34px;

      border-top:
        1px solid
        rgba(255,255,255,.06);

      color:
        #4F4F59;

      font-size:
        8px;

      font-weight:
        700;

      letter-spacing:
        1.3px;

      text-align:
        center;

      text-transform:
        uppercase;
    }


    /*
     * RESPONSIVE
     */

    @media (
      max-width: 700px
    ) {

      nav {
        min-height:
          86px;

        gap:
          12px;
      }


      .brand-logo {
        width:
          175px;

        height:
          64px;
      }


      .back {
        min-width:
          auto;

        min-height:
          39px;

        padding:
          0 13px;

        font-size:
          8px;

        letter-spacing:
          .5px;
      }


      main {
        gap:
          30px;

        padding:
          52px 0 78px;
      }


      .dream-card {
        padding:
          34px 22px 30px;

        border-radius:
          15px;
      }


      .dream-card::before {
        right:
          5px;

        top:
          65px;

        font-size:
          125px;
      }


      .dream-top {
        margin-bottom:
          36px;
      }


      .number {
        font-size:
          11px;
      }


      .country {
        max-width:
          145px;

        padding:
          6px 9px;

        font-size:
          7px;
      }


      .dream {
        font-size:
          clamp(
            25px,
            8vw,
            34px
          );

        line-height:
          1.32;

        letter-spacing:
          -1px;
      }


      .dreamer {
        margin-top:
          38px;

        padding-top:
          22px;
      }


      .dreamer-name {
        font-size:
          19px;
      }


      .detail-proof {
        grid-template-columns:
          1fr;

        gap:
          7px;
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

        text-align:
          right;
      }


      .share-section {
        margin-top:
          28px;

        padding:
          22px 17px;
      }


      .share-buttons {
        display:
          grid;

        grid-template-columns:
          1fr 1fr;
      }


      .share-button {
        width:
          100%;

        padding:
          0 10px;

        font-size:
          8px;
      }


      .dream-next {
        padding-top:
          44px;
      }


      .next-actions {
        display:
          grid;

        grid-template-columns:
          1fr;

        width:
          min(360px,100%);

        margin:
          24px auto 0;
      }


      .next-button {
        width:
          100%;
      }

    }


    @media (
      max-width: 430px
    ) {

      .container {
        width:
          min(94%,1120px);
      }


      .brand-logo {
        width:
          145px;

        height:
          58px;
      }


      .back {
        padding:
          0 10px;

        font-size:
          7px;
      }


      .share-buttons {
        grid-template-columns:
          1fr;
      }

    }


    /*
     * DREAM PAGE FINAL POLISH
     */

    .dream-card {
      width:
        min(790px,100%);

      padding-top:
        58px;
    }


    .dream-card::before {
      opacity:
        .72;
    }


    .dream-label {
      letter-spacing:
        1.9px;
    }


    .share-description {
      font-size:
        11px;
    }


    .dream-next {
      padding-top:
        52px;
    }


    @media (
      max-width: 700px
    ) {

      .dream-card {
        padding-top:
          34px;
      }


      .dream-next {
        padding-top:
          44px;
      }

    }

  </style>

</head>


<body>

  <div class="container">

    <!-- NAVIGATION -->

    <nav>

      <a
        class="brand"
        href="/"
        aria-label="OneDreamEach Home"
      >
        <img
          class="brand-logo"
          src="/logo.png"
          alt="OneDreamEach"
        >
      </a>


      <a
        class="back"
        href="/#world"
      >
        ← DREAM WALL
      </a>

    </nav>


    <!-- MAIN -->

    <main>


      <!-- DREAM CARD -->

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
          A DREAM WITH A PLACE
        </div>


        <div class="dream">
          ${safeDream}
        </div>


        <div class="dreamer">

          <div class="dreamer-label">
            DREAM LEFT BY
          </div>

          <div class="dreamer-name">
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
              UNIQUE DREAM
            </div>

          </div>


          <div class="proof-item">

            <div class="proof-value">
              €1
            </div>

            <div class="proof-label">
              ONE-TIME PLACE
            </div>

          </div>


          <div class="proof-item">

            <div class="proof-value">
              PART OF THE ARCHIVE
            </div>

            <div class="proof-label">
              GLOBAL ARCHIVE
            </div>

          </div>

        </div>


        <!-- SHARE -->

        <section class="share-section">

          <div class="share-title">
            SHARE THIS DREAM
          </div>


          <p class="share-description">
            Turn this dream into a vertical Story Card or share its permanent link.
            Someone who sees it might decide to leave a dream of their own.
          </p>


          <div class="share-buttons">

            <button
              class="share-button primary"
              id="shareStoryButton"
              type="button"
            >
              SHARE STORY CARD
            </button>


            <button
              class="share-button"
              id="saveStoryButton"
              type="button"
            >
              SAVE 9:16 CARD
            </button>


            <button
              class="share-button"
              id="shareLinkButton"
              type="button"
            >
              SHARE LINK
            </button>


            <button
              class="share-button"
              id="copyLinkButton"
              type="button"
            >
              COPY LINK
            </button>

          </div>


          <div
            class="share-note"
            id="shareNote"
          >
            Your Story Card is generated automatically from this dream.
          </div>

        </section>

      </article>


      <!-- NEXT CTA -->

      <section class="dream-next">

        <div class="next-kicker">
          YOUR TURN
        </div>


        <h2>
          This dream found its place.<br>
          Where will yours lead?
        </h2>


        <p>
          For €1, your dream receives a unique number,
          a permanent public page and a Story Card made to share.
        </p>


        <div class="next-actions">

          <a
            class="next-button primary"
            href="/#leave-dream"
          >
            LEAVE YOUR DREAM · €1
          </a>


          <a
            class="next-button"
            href="/explore"
          >
            EXPLORE MORE DREAMS
          </a>

        </div>

      </section>

    </main>


    <footer>
      ONE DREAM EACH · A PLACE FOR EVERY DREAM
    </footer>

  </div>


  <script>

    const dreamData = {
      dream_number:
        ${JSON.stringify(
          dream.dream_number
        )},

      nickname:
        ${JSON.stringify(
          dream.nickname ||
          "Anonymous"
        )},

      dream_text:
        ${JSON.stringify(
          dream.dream_text ||
          ""
        )},

      country:
        ${JSON.stringify(
          dream.country ||
          "WORLD"
        )}
    };


    const canonicalUrl =
      ${JSON.stringify(
        canonicalUrl
      )};


    const storyCardUrl =
      "/api/story-card?number=" +
      encodeURIComponent(
        dreamData.dream_number
      );


    const shareNote =
      document.getElementById(
        "shareNote"
      );


    function setShareNote(
      message
    ) {

      shareNote.textContent =
        message;


      window.setTimeout(
        function () {

          shareNote.textContent =
            "Your Story Card is generated automatically from this dream.";

        },
        3500
      );

    }


    async function copyText(
      value
    ) {

      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {

        await navigator.clipboard
          .writeText(
            value
          );

        return;

      }


      const textarea =
        document.createElement(
          "textarea"
        );


      textarea.value =
        value;


      textarea.style.position =
        "fixed";


      textarea.style.opacity =
        "0";


      document.body.appendChild(
        textarea
      );


      textarea.focus();
      textarea.select();


      document.execCommand(
        "copy"
      );


      textarea.remove();

    }
    /*
     * GET STORY CARD
     */

    async function getStoryCardFile() {

      const url =
        "/api/og?number=" +
        encodeURIComponent(
          dreamData.dream_number
        ) +
        "&mode=story";


      const response =
        await fetch(
          url,
          {
            cache:
              "no-store"
          }
        );


      if (!response.ok) {

        throw new Error(
          "Unable to generate Story Card"
        );

      }


      const blob =
        await response.blob();


      return new File(
        [
          blob
        ],
        "onedreameach-dream-" +
        String(
          dreamData.dream_number
        ).padStart(
          6,
          "0"
        ) +
        ".png",
        {
          type:
            "image/png"
        }
      );

    }


    /*
     * DOWNLOAD FILE
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


      document.body
        .appendChild(
          link
        );


      link.click();


      link.remove();


      setTimeout(
        function () {

          URL.revokeObjectURL(
            objectUrl
          );

        },
        1000
      );

    }


    /*
     * SHARE STORY CARD
     */

    async function shareStoryCard() {

      const button =
        document.getElementById(
          "shareStoryButton"
        );


      try {

        if (button) {

          button.disabled =
            true;


          button.textContent =
            "CREATING...";

        }


        shareNote.textContent =
          "Creating the 9:16 Story Card...";


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
              "Dream #" +
              String(
                dreamData.dream_number
              ),

            text:
              "A dream with a permanent place on OneDreamEach.",

            files: [
              file
            ]

          });


          setShareNote(
            "Story Card ready to share."
          );

        }

        else {

          downloadFile(
            file
          );


          setShareNote(
            "Story Card saved. Share it on Instagram, TikTok or anywhere you want."
          );

        }

      }

      catch (error) {

        if (
          error &&
          error.name ===
          "AbortError"
        ) {

          shareNote.textContent =
            "Your Story Card is generated automatically from this dream.";

          return;

        }


        console.error(
          "Story Card share error:",
          error
        );


        setShareNote(
          "Unable to share the Story Card right now."
        );

      }

      finally {

        if (button) {

          button.disabled =
            false;


          button.textContent =
            "SHARE STORY CARD";

        }

      }

    }


    /*
     * SAVE STORY CARD
     */

    async function saveStoryCard() {

      const button =
        document.getElementById(
          "saveStoryButton"
        );


      try {

        if (button) {

          button.disabled =
            true;


          button.textContent =
            "CREATING...";

        }


        shareNote.textContent =
          "Creating your 9:16 Story Card...";


        const file =
          await getStoryCardFile();


        downloadFile(
          file
        );


        setShareNote(
          "Story Card saved."
        );

      }

      catch (error) {

        console.error(
          "Story Card save error:",
          error
        );


        setShareNote(
          "Unable to save the Story Card right now."
        );

      }

      finally {

        if (button) {

          button.disabled =
            false;


          button.textContent =
            "SAVE 9:16 CARD";

        }

      }

    }


    /*
     * SHARE DREAM LINK
     */

    async function shareDreamLink() {

      const shareText =
        "This dream has a permanent place on OneDreamEach — #" +
        dreamData.dream_number +
        ".";


      if (
        navigator.share
      ) {

        try {

          await navigator.share({

            title:
              "Dream #" +
              String(
                dreamData.dream_number
              ) +
              " — OneDreamEach",

            text:
              shareText,

            url:
              canonicalUrl

          });


          setShareNote(
            "Dream shared."
          );


          return;

        }

        catch (error) {

          if (
            error &&
            error.name ===
            "AbortError"
          ) {

            return;

          }


          console.error(
            "Share link error:",
            error
          );

        }

      }


      try {

        await copyText(
          canonicalUrl
        );


        setShareNote(
          "Dream link copied."
        );

      }

      catch (error) {

        console.error(
          "Copy fallback error:",
          error
        );


        setShareNote(
          "Unable to share this link right now."
        );

      }

    }


    /*
     * COPY LINK
     */

    async function copyDreamLink() {

      try {

        await copyText(
          canonicalUrl
        );


        setShareNote(
          "✓ Dream link copied."
        );

      }

      catch (error) {

        console.error(
          "Copy link error:",
          error
        );


        setShareNote(
          "Unable to copy the Dream link."
        );

      }

    }


    /*
     * BUTTON EVENTS
     */

    const shareStoryButton =
      document.getElementById(
        "shareStoryButton"
      );


    const saveStoryButton =
      document.getElementById(
        "saveStoryButton"
      );


    const shareLinkButton =
      document.getElementById(
        "shareLinkButton"
      );


    const copyLinkButton =
      document.getElementById(
        "copyLinkButton"
      );


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

    res.setHeader(
      "Content-Type",
      "text/html; charset=utf-8"
    );


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

          <meta
            name="theme-color"
            content="#050505"
          >

          <title>
            Error — OneDreamEach
          </title>

        </head>


        <body
          style="
            min-height:100vh;
            margin:0;
            padding:24px;
            box-sizing:border-box;
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

            <p
              style="
                color:#8d8d98;
              "
            >
              Please try again later.
            </p>

            <a
              href="/explore"
              style="
                display:inline-block;
                margin-top:20px;
                color:#a78bfa;
                text-decoration:none;
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
