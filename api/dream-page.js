module.exports = async function handler(req, res) {
  try {

    /*
     * DREAM NUMBER
     */

    const dreamNumber =
      req.query.number;


    if (!dreamNumber) {

      res.setHeader(
        "Content-Type",
        "text/html; charset=utf-8"
      );

      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Dream not found — One Dream Each</title>
        </head>
        <body style="background:#050505;color:white;font-family:Arial;text-align:center;padding:80px;">
          <h1>Dream number missing.</h1>
          <a href="/" style="color:#a78bfa;">
            Return to One Dream Each
          </a>
        </body>
        </html>
      `);

    }


    /*
     * SUPABASE VARIABLES
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

            a {
              color: #a78bfa;
            }
          </style>
        </head>

        <body>

          <div>

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
        .replace(
          /&/g,
          "&amp;"
        )
        .replace(
          /</g,
          "&lt;"
        )
        .replace(
          />/g,
          "&gt;"
        )
        .replace(
          /"/g,
          "&quot;"
        )
        .replace(
          /'/g,
          "&#039;"
        );

    }


    /*
     * SAFE VALUES
     */

    const safeNumber =
      escapeHtml(
        dream.dream_number
      );


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
        ""
      );


    /*
     * META DESCRIPTION
     */

    const plainDescription =
      String(
        dream.dream_text ||
        "One dream. One place. One story."
      )
        .replace(
          /\s+/g,
          " "
        )
        .trim()
        .slice(
          0,
          180
        );


    const metaDescription =
      escapeHtml(
        plainDescription
      );


    /*
     * PAGE URL
     */

    const canonicalUrl =
      "https://onedreameach.com/dream/" +
      encodeURIComponent(
        dream.dream_number
      );


    /*
     * PAGE TITLE
     */

    const pageTitle =
      "Dream #" +
      paddedNumber +
      " — One Dream Each";


    /*
     * AUTHOR SOCIALS
     */

    let instagramHtml =
      "";


    if (dream.instagram) {

      const username =
        String(
          dream.instagram
        )
          .trim()
          .replace(
            /^@/,
            ""
          );


      instagramHtml = `
        <a
          class="author-social"
          href="https://instagram.com/${encodeURIComponent(username)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram ↗
        </a>
      `;

    }


    let tiktokHtml =
      "";


    if (dream.tiktok) {

      const username =
        String(
          dream.tiktok
        )
          .trim()
          .replace(
            /^@/,
            ""
          );


      tiktokHtml = `
        <a
          class="author-social"
          href="https://tiktok.com/@${encodeURIComponent(username)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          TikTok ↗
        </a>
      `;

    }


    const socialsHtml =
      instagramHtml ||
      tiktokHtml
        ? `
          <div class="author-socials">
            ${instagramHtml}
            ${tiktokHtml}
          </div>
        `
        : "";


    /*
     * HTML PAGE
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


  <!-- CANONICAL -->

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


  <!-- X / TWITTER -->

  <meta
    name="twitter:card"
    content="summary"
  >

  <meta
    name="twitter:title"
    content="${escapeHtml(pageTitle)}"
  >

  <meta
    name="twitter:description"
    content="${metaDescription}"
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
      width: 760px;
      height: 760px;
      left: 50%;
      top: 8%;
      transform: translateX(-50%);
      background: radial-gradient(
        circle,
        rgba(124,58,237,.14),
        transparent 66%
      );
      pointer-events: none;
      z-index: -1;
    }


    .container {
      width: min(1100px, 90%);
      margin: auto;
    }


    nav {
      height: 88px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--line);
    }


    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: "Space Grotesk", sans-serif;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: .5px;
      color: white;
      text-decoration: none;
    }


    .logo {
      width: 34px;
      height: 34px;
      border: 1px solid rgba(167,139,250,.7);
      display: grid;
      place-items: center;
      color: var(--purple-light);
      font-weight: 700;
      position: relative;
    }


    .logo::after {
      content: "";
      position: absolute;
      width: 5px;
      height: 5px;
      background: var(--purple);
      border-radius: 50%;
      right: 5px;
      top: 5px;
      box-shadow: 0 0 15px var(--purple);
    }


    .back {
      color: var(--muted);
      text-decoration: none;
      font-size: 13px;
      transition: .2s ease;
    }


    .back:hover {
      color: var(--white);
    }


    main {
      min-height: calc(100vh - 160px);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 90px 0;
    }


    .dream-card {
      width: min(780px, 100%);
      position: relative;
      text-align: center;
      padding: 72px 55px 58px;
      border: 1px solid var(--line);
      border-radius: 10px;

      background:
        radial-gradient(
          circle at top right,
          rgba(124,58,237,.12),
          transparent 42%
        ),
        rgba(9,9,9,.90);

      box-shadow:
        0 35px 110px
        rgba(0,0,0,.40);
    }


    .dream-label {
      color: #5f5f68;
      font-size: 9px;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }


    .number {
      color: var(--purple-light);
      font-family: "Space Grotesk", sans-serif;
      font-size: 13px;
      letter-spacing: 3px;
      font-weight: 700;
      margin-bottom: 34px;
    }


    .nickname {
      font-family: "Space Grotesk", sans-serif;
      font-size: clamp(42px, 7vw, 72px);
      line-height: .95;
      letter-spacing: -4px;
      margin-bottom: 18px;
      word-break: break-word;
    }


    .country {
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 54px;
    }


    .quote-mark {
      font-family: "Space Grotesk", sans-serif;
      color: rgba(167,139,250,.35);
      font-size: 56px;
      line-height: .7;
      margin-bottom: 12px;
    }


    .dream {
      font-family: "Space Grotesk", sans-serif;
      font-size: clamp(25px, 4vw, 42px);
      line-height: 1.25;
      letter-spacing: -1.3px;
      max-width: 650px;
      margin: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }


    .author-socials {
      margin-top: 46px;
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    }


    .author-social {
      padding: 11px 17px;
      border: 1px solid var(--line);
      color: #d7d7dc;
      text-decoration: none;
      font-size: 11px;
      border-radius: 5px;
    }


    .author-social:hover {
      color: var(--purple-light);
      border-color: rgba(167,139,250,.55);
    }


    .divider {
      width: 100%;
      height: 1px;
      background: var(--line);
      margin: 52px 0 34px;
    }


    .share-title {
      font-size: 10px;
      color: #666670;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }


    .share-buttons {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    }


    .share-button {
      min-height: 44px;
      padding: 0 17px;
      border: 1px solid var(--line);
      background: transparent;
      color: var(--white);
      border-radius: 5px;
      font-family: Inter, sans-serif;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      transition: .2s ease;
    }


    .share-button:hover {
      color: var(--purple-light);
      border-color: rgba(167,139,250,.55);
      transform: translateY(-2px);
    }


    .share-main {
      color: #050505;
      background: #ffffff;
      border-color: #ffffff;
    }


    .copy-status {
      height: 18px;
      margin-top: 13px;
      color: var(--purple-light);
      font-size: 10px;
    }


    .signature {
      margin-top: 28px;
      color: #55555d;
      font-size: 10px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }


    footer {
      border-top: 1px solid var(--line);
      padding: 30px 0;
      text-align: center;
      color: #55555d;
      font-size: 12px;
    }


    @media (max-width: 600px) {

      nav {
        height: 72px;
      }


      .brand {
        font-size: 12px;
      }


      .dream-card {
        padding:
          52px 23px
          42px;
      }


      .nickname {
        font-size: 45px;
        letter-spacing: -2.5px;
      }


      .dream {
        font-size: 26px;
      }


      .share-buttons {
        display: grid;
        grid-template-columns:
          1fr 1fr;
      }


      .share-button {
        width: 100%;
      }


      .share-main {
        grid-column:
          1 / -1;
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
      >

        <div class="logo">
          1
        </div>

        ONE DREAM EACH

      </a>


      <a
        class="back"
        href="/#world"
      >
        ← Back to the wall
      </a>

    </nav>


    <main>


      <article class="dream-card">


        <div class="dream-label">
          ONE PLACE · ONE DREAM
        </div>


        <div class="number">
          DREAM #${paddedNumber}
        </div>


        <div class="nickname">
          ${safeNickname}
        </div>


        <div class="country">
          ${safeCountry}
        </div>


        <div class="quote-mark">
          “
        </div>


        <div class="dream">
          ${safeDream}
        </div>


        ${socialsHtml}


        <div class="divider"></div>


        <div class="share-title">
          Share this dream
        </div>


        <div class="share-buttons">


          <button
            type="button"
            class="share-button share-main"
            onclick="shareDream()"
          >
            SHARE THIS DREAM
          </button>


          <button
            type="button"
            class="share-button"
            onclick="copyDreamLink()"
          >
            COPY LINK
          </button>


          <button
            type="button"
            class="share-button"
            onclick="shareWhatsApp()"
          >
            WHATSAPP
          </button>


          <button
            type="button"
            class="share-button"
            onclick="shareX()"
          >
            X / TWITTER
          </button>


        </div>


        <div
          class="copy-status"
          id="copy-status"
        ></div>


        <div class="signature">
          One Dream Each · Your dream has a place.
        </div>


      </article>


    </main>


  </div>


  <footer>
    ONE DREAM EACH · One million people. One million dreams.
  </footer>


  <script>

    const dreamUrl =
      ${JSON.stringify(canonicalUrl)};


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
          "Link copied.";

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
              ${JSON.stringify(pageTitle)},

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

      <html>

      <head>

        <meta charset="UTF-8">

        <title>
          Error — One Dream Each
        </title>

      </head>


      <body
        style="
          background:#050505;
          color:white;
          font-family:Arial;
          text-align:center;
          padding:80px;
        "
      >

        <h1>
          Unable to load this dream.
        </h1>

        <p>
          Please try again later.
        </p>

        <a
          href="/#world"
          style="color:#a78bfa;"
        >
          ← Return to the Dream Wall
        </a>

      </body>

      </html>
    `);

  }
};
