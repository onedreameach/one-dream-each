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
              color: white;
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
              color: #ffffff;
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


  <style>

    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');


    :root {
      --black: #050505;
      --white: #ffffff;
      --purple: #7c3aed;
      --purple-light: #a78bfa;
      --muted: #8b8b95;
      --line: rgba(255,255,255,.09);
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
      background: var(--black);
      color: var(--white);
      font-family: Inter, sans-serif;
      overflow-x: hidden;
    }


    body::before {
      content: "";

      position: fixed;

      width: 900px;
      height: 900px;

      left: 50%;
      top: -150px;

      transform:
        translateX(-50%);

      background:
        radial-gradient(
          circle,
          rgba(124,58,237,.16),
          transparent 66%
        );

      pointer-events: none;

      z-index: -1;
    }


    .container {
      width: min(1120px, 92%);
      margin: auto;
    }


    /*
     * NAVBAR
     */

    nav {
      min-height: 116px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 24px;

      border-bottom:
        1px solid
        var(--line);
    }


    .brand {
      display: flex;
      align-items: center;

      flex: 1;

      min-width: 0;

      text-decoration: none;
    }


    .brand-logo {
      width: 285px;
      height: 94px;

      max-width: 100%;

      display: block;

      object-fit: contain;
      object-position: left center;

      filter:
        drop-shadow(
          0 0 22px
          rgba(167,139,250,.17)
        );
    }


    /*
     * RETURN TO WALL BUTTON
     */

    .back {
      width: auto;

      min-width: 236px;
      min-height: 48px;

      padding:
        0 20px;

      display: inline-flex;

      align-items: center;
      justify-content: center;

      flex-shrink: 0;

      border:
        1px solid
        rgba(167,139,250,.38);

      border-radius:
        999px;

      background:
        linear-gradient(
          180deg,
          rgba(255,255,255,.055),
          rgba(255,255,255,.018)
        );

      color:
        #f0eef8;

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        10px;

      font-weight:
        700;

      letter-spacing:
        .65px;

      line-height:
        1;

      white-space:
        nowrap;

      text-decoration:
        none;

      box-shadow:
        inset 0 1px 0
        rgba(255,255,255,.045);

      transition:
        transform .2s ease,
        border-color .2s ease,
        background .2s ease,
        box-shadow .2s ease;
    }


    .back:hover {
      color:
        #ffffff;

      border-color:
        var(--purple-light);

      background:
        rgba(124,58,237,.14);

      transform:
        translateY(-2px);

      box-shadow:
        0 10px 30px
        rgba(124,58,237,.12);
    }


    /*
     * PAGE
     */

    main {
      min-height:
        calc(100vh - 180px);

      display: flex;

      justify-content: center;
      align-items: center;

      padding:
        90px 0 115px;
    }


    /*
     * DREAM CARD
     */

    .dream-card {
      width:
        min(820px,100%);

      position: relative;

      overflow: hidden;

      padding:
        64px 60px 52px;

      border:
        1px solid
        rgba(255,255,255,.105);

      border-radius:
        18px;

      background:

        radial-gradient(
          circle at 100% 0%,
          rgba(124,58,237,.19),
          transparent 40%
        ),

        radial-gradient(
          circle at 0% 100%,
          rgba(167,139,250,.06),
          transparent 38%
        ),

        linear-gradient(
          145deg,
          rgba(255,255,255,.028),
          rgba(255,255,255,.007)
        ),

        #090909;

      box-shadow:
        0 35px 120px
        rgba(0,0,0,.50);
    }


    .dream-card::before {
      content: "“";

      position: absolute;

      right: 25px;
      top: 78px;

      color:
        rgba(167,139,250,.075);

      font-family:
        Georgia,
        serif;

      font-size:
        180px;

      line-height:
        .6;

      pointer-events: none;
    }


    .dream-card::after {
      content: "";

      position: absolute;

      width: 280px;
      height: 280px;

      right: -140px;
      bottom: -150px;

      border-radius:
        50%;

      background:
        rgba(124,58,237,.10);

      filter:
        blur(50px);

      pointer-events:
        none;
    }


    /*
     * CARD TOP
     */

    .dream-top {
      position: relative;

      z-index: 1;

      display: flex;

      align-items: center;
      justify-content: space-between;

      gap: 20px;

      margin-bottom:
        48px;
    }


    .number {
      color:
        var(--purple-light);

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
        rgba(255,255,255,.10);

      border-radius:
        999px;

      background:
        rgba(255,255,255,.035);

      color:
        #a2a2ac;

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
      position: relative;

      z-index: 1;

      margin-bottom:
        18px;

      color:
        #60606a;

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
      position: relative;

      z-index: 1;

      max-width:
        680px;

      color:
        #f4f4f6;

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

      margin-top:
        48px;

      padding-top:
        28px;

      border-top:
        1px solid
        rgba(255,255,255,.07);
    }


    .dreamer-label {
      margin-bottom:
        8px;

      color:
        #5f5f69;

      font-size:
        8px;

      font-weight:
        700;

      letter-spacing:
        1.8px;

      text-transform:
        uppercase;
    }


    .nickname {
      color:
        #dcdce2;

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        26px;

      font-weight:
        700;

      letter-spacing:
        -1px;

      word-break:
        break-word;
    }


    /*
     * AUTHOR SOCIALS
     */

    .author-socials {
      position: relative;

      z-index: 2;

      margin-top:
        28px;
    }


    .author-social-label {
      margin-bottom:
        10px;

      color:
        #595963;

      font-size:
        8px;

      font-weight:
        700;

      letter-spacing:
        1.7px;

      text-transform:
        uppercase;
    }


    .author-social-buttons {
      display: flex;

      gap: 9px;

      flex-wrap: wrap;
    }


    .author-social {
      min-height:
        38px;

      padding:
        0 15px;

      display:
        inline-flex;

      align-items:
        center;

      gap: 7px;

      border:
        1px solid
        rgba(167,139,250,.20);

      border-radius:
        999px;

      background:
        rgba(124,58,237,.06);

      color:
        #cabffd;

      text-decoration:
        none;

      font-size:
        10px;

      font-weight:
        700;

      transition:
        .2s ease;
    }


    .author-social:hover {
      color:
        white;

      border-color:
        rgba(167,139,250,.60);

      background:
        rgba(124,58,237,.13);

      transform:
        translateY(-2px);
    }


    .social-icon {
      font-size:
        14px;
    }


    /*
     * DIVIDER
     */

    .divider {
      position: relative;

      z-index: 1;

      width:
        100%;

      height:
        1px;

      margin:
        45px 0 32px;

      background:
        linear-gradient(
          90deg,
          transparent,
          rgba(167,139,250,.25),
          transparent
        );
    }


    /*
     * SHARE
     */

    .share-area {
      position: relative;

      z-index: 2;
    }


    .share-title {
      margin-bottom:
        16px;

      color:
        #696973;

      font-size:
        9px;

      font-weight:
        700;

      letter-spacing:
        2px;

      text-transform:
        uppercase;
    }


    .share-buttons {
      display: grid;

      grid-template-columns:
        1.35fr
        1fr
        1fr
        1fr;

      gap:
        10px;
    }


    .share-button {
      min-height:
        48px;

      padding:
        0 15px;

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
        #cfcfd5;

      font-family:
        Inter,
        sans-serif;

      font-size:
        10px;

      font-weight:
        700;

      letter-spacing:
        .4px;

      cursor:
        pointer;

      text-decoration:
        none;

      transition:
        .22s ease;
    }


    .share-button:hover {
      color:
        white;

      transform:
        translateY(-2px);

      border-color:
        rgba(167,139,250,.55);

      background:
        rgba(124,58,237,.10);

      box-shadow:
        0 10px 30px
        rgba(0,0,0,.25);
    }


    .share-main {
      color:
        #070707;

      background:
        linear-gradient(
          135deg,
          #ffffff,
          #d9d0ff
        );

      border-color:
        transparent;

      box-shadow:
        0 10px 30px
        rgba(124,58,237,.12);
    }


    .share-main:hover {
      color:
        #050505;

      background:
        var(--purple-light);

      border-color:
        transparent;
    }


    .share-icon {
      font-size:
        14px;
    }


    .copy-status {
      min-height:
        18px;

      margin-top:
        14px;

      color:
        var(--purple-light);

      font-size:
        10px;
    }


    .signature {
      position: relative;

      z-index: 1;

      margin-top:
        27px;

      color:
        #505059;

      font-size:
        9px;

      letter-spacing:
        1.5px;

      text-transform:
        uppercase;
    }


    /*
     * FOOTER
     */

    footer {
      border-top:
        1px solid
        var(--line);

      padding:
        30px 0;

      text-align:
        center;

      color:
        #55555d;

      font-size:
        12px;
    }


    /*
     * MOBILE / ANDROID
     */

    @media (max-width: 650px) {

      .container {
        width: 94%;
      }


      nav {
        min-height:
          86px;

        gap:
          8px;
      }


      .brand {
        flex:
          1 1 auto;
      }


      .brand-logo {
        width:
          clamp(
            125px,
            38vw,
            160px
          );

        height:
          62px;
      }


      /*
       * IMPORTANT:
       * full button stays visible
       */

      .back {
        min-width:
          0;

        min-height:
          42px;

        padding:
          0 11px;

        flex:
          0 0 auto;

        border:
          1px solid
          rgba(167,139,250,.42);

        border-radius:
          999px;

        background:
          rgba(124,58,237,.08);

        color:
          #f1eefb;

        font-size:
          7.4px;

        font-weight:
          700;

        letter-spacing:
          .05px;

        white-space:
          nowrap;

        box-shadow:
          inset 0 1px 0
          rgba(255,255,255,.04);
      }


      main {
        padding:
          55px 0 85px;
      }


      .dream-card {
        padding:
          37px 22px 32px;

        border-radius:
          14px;
      }


      .dream-card::before {
        right:
          8px;

        top:
          90px;

        font-size:
          115px;
      }


      .dream-top {
        gap:
          10px;

        margin-bottom:
          36px;
      }


      .number {
        font-size:
          10px;

        letter-spacing:
          1px;
      }


      .country {
        max-width:
          115px;

        padding:
          6px 9px;

        font-size:
          7.5px;

        letter-spacing:
          .7px;
      }


      .dream {
        font-size:
          26px;

        letter-spacing:
          -.9px;
      }


      .dreamer {
        margin-top:
          36px;
      }


      .nickname {
        font-size:
          22px;
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
        min-height:
          46px;

        padding:
          0 8px;

        font-size:
          9px;
      }

    }


    /*
     * SMALL ANDROID / IPHONE
     */

    @media (max-width: 430px) {

      .container {
        width:
          95%;
      }


      nav {
        min-height:
          82px;

        gap:
          6px;
      }


      .brand-logo {
        width:
          128px;

        height:
          56px;
      }


      .back {
        min-height:
          40px;

        padding:
          0 8px;

        border:
          1px solid
          rgba(167,139,250,.42);

        border-radius:
          999px;

        background:
          rgba(124,58,237,.09);

        color:
          #f3f0fc;

        font-size:
          6.8px;

        letter-spacing:
          0;

        white-space:
          nowrap;
      }


      .dream-card {
        padding:
          34px 18px 30px;
      }


      .dream {
        font-size:
          24px;
      }


      .share-buttons {
        grid-template-columns:
          1fr;
      }


      .share-main {
        grid-column:
          auto;
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


      <article class="dream-card">


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


        <div class="share-area">


          <div class="share-title">
            SHARE THIS DREAM
          </div>


          <div class="share-buttons">


            <button
              type="button"
              class="share-button share-main"
              onclick="shareDream()"
            >

              <span class="share-icon">
                ↗
              </span>

              SHARE DREAM

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

    const dreamUrl =
      ${JSON.stringify(
        canonicalUrl
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
     * Temporaneamente niente cache:
     * utile mentre stiamo modificando la pagina.
     */

    res.setHeader(
      "Cache-Control",
      "no-store"
    );


    return res
      .status(200)
      .send(html);

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


    return res.status(500).send(`
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
          color:white;
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
