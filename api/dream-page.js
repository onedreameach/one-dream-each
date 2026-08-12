module.exports = async function handler(req, res) {

  try {

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
      encodeURIComponent(
        dreamNumber
      ) +
      "&limit=1";


    const response =
      await fetch(
        url,
        {
          headers: {

            apikey:
              supabaseKey,

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
        ? JSON.parse(
            responseText
          )
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
     * SOCIALS
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
          <span class="social-icon">◎</span>
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
          <span class="social-icon">♪</span>
          TikTok
        </a>
      `;

    }


    const socialsHtml =
      instagramHtml || tiktokHtml
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
     * PAGE
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


  <!-- TWITTER / X -->

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

      width: min(1120px, 90%);
      margin: auto;

    }


    /*
     * NAV
     */

    nav {

      min-height: 120px;

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

      min-width: 0;

      text-decoration: none;

      flex: 1;

    }


    .brand-logo {

      width: 310px;
      height: 100px;

      max-width: 100%;

      object-fit: contain;
      object-position: left center;

      display: block;

      filter:
        drop-shadow(
          0 0 20px
          rgba(167,139,250,.18)
        );

    }


    /*
     * RETURN TO WALL
     */

   .back {
  min-width: 150px;
  min-height: 42px;

  padding: 0 12px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: 8px;
  font-weight: 700;

  letter-spacing: .15px;

  line-height: 1.1;

  white-space: nowrap;

  text-align: center;

  flex-shrink: 0;
}

    .back:hover {

      color: white;

      border-color:
        var(--purple-light);

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

      display: flex;

      justify-content: center;
      align-items: center;

      padding: 95px 0 120px;

    }


    /*
     * DREAM CARD
     */

    .dream-card {

      width: min(820px, 100%);

      position: relative;

      overflow: hidden;

      padding:
        64px 60px 54px;

      border:
        1px solid
        rgba(255,255,255,.10);

      border-radius: 18px;

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

      right: 28px;
      top: 72px;

      color:
        rgba(167,139,250,.08);

      font-family:
        Georgia,
        serif;

      font-size: 190px;
      line-height: .6;

      pointer-events: none;

    }


    .dream-card::after {

      content: "";

      position: absolute;

      width: 280px;
      height: 280px;

      right: -140px;
      bottom: -150px;

      border-radius: 50%;

      background:
        rgba(124,58,237,.10);

      filter:
        blur(50px);

      pointer-events: none;

    }


    /*
     * TOP
     */

    .dream-top {

      position: relative;
      z-index: 1;

      display: flex;

      justify-content: space-between;
      align-items: center;

      gap: 20px;

      margin-bottom: 50px;

    }


    .number {

      color:
        var(--purple-light);

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size: 14px;
      font-weight: 700;

      letter-spacing: 2px;

    }


    .country {

      max-width: 220px;

      padding: 7px 12px;

      border:
        1px solid
        rgba(255,255,255,.10);

      border-radius: 999px;

      background:
        rgba(255,255,255,.035);

      color: #a2a2ac;

      font-size: 9px;
      font-weight: 700;

      letter-spacing: 1.4px;

      text-transform: uppercase;

      overflow: hidden;

      text-overflow: ellipsis;

      white-space: nowrap;

    }


    /*
     * DREAM
     */

    .dream-label {

      position: relative;
      z-index: 1;

      color: #60606a;

      font-size: 9px;
      font-weight: 700;

      letter-spacing: 2.4px;

      text-transform: uppercase;

      margin-bottom: 19px;

    }


    .dream {

      position: relative;
      z-index: 1;

      max-width: 680px;

      color: #f4f4f6;

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size:
        clamp(
          28px,
          4vw,
          45px
        );

      line-height: 1.28;

      letter-spacing: -1.5px;

      white-space: pre-wrap;

      word-break: break-word;

    }


    /*
     * DREAMER
     */

    .dreamer {

      position: relative;
      z-index: 1;

      margin-top: 48px;

      padding-top: 28px;

      border-top:
        1px solid
        rgba(255,255,255,.07);

    }


    .dreamer-label {

      color: #5f5f69;

      font-size: 8px;
      font-weight: 700;

      letter-spacing: 1.8px;

      text-transform: uppercase;

      margin-bottom: 8px;

    }


    .nickname {

      font-family:
        "Space Grotesk",
        sans-serif;

      font-size: 26px;
      font-weight: 700;

      letter-spacing: -1px;

      color: #dcdce2;

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

      color: #595963;

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
        rgba(167,139,250,.18);

      border-radius: 999px;

      background:
        rgba(124,58,237,.055);

      color: #cabffd;

      text-decoration: none;

      font-size: 10px;
      font-weight: 700;

      transition: .2s ease;

    }


    .author-social:hover {

      color: white;

      border-color:
        rgba(167,139,250,.60);

      background:
        rgba(124,58,237,.13);

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

      color: #696973;

      font-size: 9px;
      font-weight: 700;

      letter-spacing: 2px;

      text-transform: uppercase;

      margin-bottom: 16px;

    }


    .share-buttons {

      display: grid;

      grid-template-columns:
        1.35fr 1fr 1fr 1fr;

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

      color: #cfcfd5;

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

      color: white;

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

      color: #070707;

      background:
        linear-gradient(
          135deg,
          #ffffff,
          #d9d0ff
        );

      border-color: transparent;

      box-shadow:
        0 10px 30px
        rgba(124,58,237,.12);

    }


    .share-main:hover {

      color: #050505;

      background:
        var(--purple-light);

      border-color: transparent;

    }


    .share-icon {

      font-size: 14px;

    }


    .copy-status {

      min-height: 18px;

      margin-top: 14px;

      color:
        var(--purple-light);

      font-size: 10px;

    }


    .signature {

      position: relative;
      z-index: 1;

      margin-top: 27px;

      color: #505059;

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

      color: #55555d;

      font-size: 12px;

    }


    /*
     * TABLET / MOBILE
     */

    @media (max-width: 650px) {

      .container {

        width: 92%;

      }


      nav {

        min-height: 92px;

        gap: 10px;

      }


      .brand-logo {

        width: 185px;
        height: 70px;

      }


      /*
       * FIXED MOBILE RETURN BUTTON
       */

      .back {

        min-width: 0;
        min-height: 42px;

        padding: 0 12px;

        font-size: 7.5px;
        font-weight: 700;

        letter-spacing: .2px;

        line-height: 1;

        white-space: nowrap;

      }


      main {

        padding:
          60px 0 90px;

      }


      .dream-card {

        padding:
          38px 23px 34px;

        border-radius: 14px;

      }


      .dream-card::before {

        right: 10px;
        top: 88px;

        font-size: 120px;

      }


      .dream-top {

        margin-bottom: 38px;

      }


      .number {

        font-size: 11px;

        letter-spacing: 1.2px;

      }


      .country {

        max-width: 120px;

        font-size: 8px;

      }


      .dream {

        font-size: 27px;

        letter-spacing: -1px;

      }


      .dreamer {

        margin-top: 38px;

      }


      .nickname {

        font-size: 22px;

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

        font-size: 9px;

        padding: 0 8px;

      }

    }


    /*
     * SMALL MOBILE
     */

    @media (max-width: 430px) {

      nav {

        gap: 7px;

      }


      .brand-logo {

        width: 145px;
        height: 62px;

      }


      .back {

        min-height: 40px;

        padding: 0 9px;

        font-size: 7px;

        letter-spacing: 0;

      }


      .share-buttons {

        grid-template-columns: 1fr;

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

      if (navigator.share) {

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
     * SEND HTML
     */

    res.setHeader(
      "Content-Type",
      "text/html; charset=utf-8"
    );


    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
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
