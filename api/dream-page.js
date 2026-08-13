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

  line-height:
    1.08;

  letter-spacing:
    -2px;
}


.dream-next h2 span {
  color:
    #A78BFA;
}


.dream-next-text {
  max-width:
    520px;

  margin:
    15px auto 0;

  color:
    #858590;

  font-size:
    11px;

  line-height:
    1.7;
}


.dream-next-button {
  min-height:
    52px;

  margin-top:
    25px;

  padding:
    0 27px;

  display:
    inline-flex;

  align-items:
    center;

  justify-content:
    center;

  border:
    1px solid
    rgba(167,139,250,.28);

  border-radius:
    10px;

  background:
    linear-gradient(
      135deg,
      #7C3AED,
      #6D28D9
    );

  color:
    #F4F4F7;

  font-size:
    10px;

  font-weight:
    800;

  letter-spacing:
    .6px;

  text-decoration:
    none;

  box-shadow:
    0 14px 38px
    rgba(124,58,237,.16);

  transition:
    .22s ease;
}


.dream-next-button:hover {
  transform:
    translateY(-2px);

  background:
    linear-gradient(
      135deg,
      #8B5CF6,
      #7C3AED
    );
}


.dream-next-number {
  margin-top:
    24px;

  color:
    #60606A;

  font-size:
    8px;

  font-weight:
    700;

  letter-spacing:
    1.4px;

  text-transform:
    uppercase;
}


.dream-next-number strong {
  color:
    #A78BFA;
}


@media (max-width:700px) {

  .dream-next {
    padding:
      48px 15px 5px;
  }


  .dream-next h2 {
    font-size:
      30px;

    letter-spacing:
      -1.3px;
  }


  .dream-next-button {
    width:
      100%;

    max-width:
      360px;
  }

}
    footer {
      border-top:
        1px solid
        var(--line);

      padding:
        30px 0 36px;

      color:
        #55555D;

      text-align:
        center;

      font-size:
        8px;

      letter-spacing:
        1.4px;

      text-transform:
        uppercase;
    }


    /*
     * RESPONSIVE
     */

    @media (
      max-width:
      700px
    ) {

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
          70px;
      }


      .back {
        min-width:
          0;

        min-height:
          42px;

        padding:
          0 15px;

        font-size:
          9px;

        letter-spacing:
          .6px;
      }


      main {
        padding:
          55px 0 80px;

        align-items:
          flex-start;
      }


      .dream-card {
        padding:
          36px 22px 28px;

        border-radius:
          15px;
      }


      .dream-card::before {
        right:
          5px;

        top:
          62px;

        font-size:
          130px;
      }


      .dream-top {
        margin-bottom:
          34px;

        align-items:
          flex-start;
      }


      .number {
        font-size:
          11px;

        letter-spacing:
          1.2px;
      }


      .country {
        max-width:
          120px;

        font-size:
          7px;
      }


      .dream {
        font-size:
          clamp(
            26px,
            8vw,
            35px
          );

        line-height:
          1.3;

        letter-spacing:
          -1px;
      }


      .dreamer {
        margin-top:
          36px;
      }


      .share-section {
        padding:
          22px 17px;
      }


      .share-buttons {
        flex-direction:
          column;
      }


      .share-button {
        width:
          100%;

        min-height:
          47px;
      }


      .author-social-buttons {
        flex-direction:
          column;
      }


      .author-social {
        width:
          100%;

        justify-content:
          center;
      }


      .detail-proof {
        grid-template-columns:
          1fr;
      }


      .viral-loop {
        margin-top:
          14px;

        padding:
          28px 18px;

        border-radius:
          14px;
      }


      .viral-loop h2 {
        font-size:
          27px;

        letter-spacing:
          -1.1px;
      }


      .viral-cta {
        width:
          100%;

        min-height:
          50px;
      }


      .viral-progress-top {
        align-items:
          flex-start;

        flex-direction:
          column;

        text-align:
          left;
      }

    }


    @media (
      max-width:
      430px
    ) {

      .container {
        width:
          min(94%,1120px);
      }


      nav {
        min-height:
          86px;
      }


      .brand-logo {
        width:
          160px;

        height:
          64px;
      }


      .back {
        min-height:
          40px;

        padding:
          0 12px;

        font-size:
          8px;

        letter-spacing:
          .4px;
      }


      .dream-card {
        padding:
          32px 18px 25px;
      }

    }

  </style>

</head>


<body>


  <!-- NAVBAR -->

  <nav class="container">

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
      href="/#world"
      class="back"
    >
      ← RETURN TO THE DREAM WALL
    </a>

  </nav>


  <!-- DREAM -->

  <main class="container">

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
        ONE DREAM · ONE PLACE
      </div>


      <div class="dream">
        “${safeDream}”
      </div>


      <div class="dreamer">

        <div class="dreamer-label">
          DREAMED BY
        </div>

        <div class="dreamer-name">
          ${safeNickname}
        </div>

      </div>


      ${socialsHtml}


      <div class="detail-proof">

        <div class="proof-item">

          <div class="proof-value">
            #${paddedNumber}
          </div>

          <div class="proof-label">
            UNIQUE PLACE
          </div>

        </div>


        <div class="proof-item">

          <div class="proof-value">
            €1
          </div>

          <div class="proof-label">
            ONE TIME
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


      <!-- SHARE -->

      <section class="share-section">

        <div class="share-title">
          SHARE THIS DREAM
        </div>


        <div class="share-description">
          Create a vertical Dream Card for Instagram Stories and TikTok.
          Every share can bring another dream into the wall.
        </div>


        <div class="share-buttons">

          <button
            type="button"
            class="share-button primary"
            id="share-story-card"
          >
            ✦ SHARE STORY CARD
          </button>


          <button
            type="button"
            class="share-button"
            id="save-story-card"
          >
            ↓ SAVE 9:16 CARD
          </button>


          <button
            type="button"
            class="share-button"
            id="share-link"
          >
            ↗ SHARE LINK
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
        >
          Your Dream Card is generated automatically from this page.
        </div>

      </section>

    </article>


  <!-- NEXT DREAM -->

<section class="dream-next">

  <div class="dream-next-kicker">
    ONE DREAM EACH
  </div>

  <h2>
    This dream has a place.<br>
    <span>
      What's yours?
    </span>
  </h2>

  <div class="dream-next-text">
    One euro gives your dream its own number,
    its own page and its place among one million dreams.
  </div>

  <a
    href="/#leave"
    class="dream-next-button"
  >
    LEAVE YOUR DREAM — €1
  </a>

  <div class="dream-next-number">
    DREAM
    <strong>
      #${paddedNumber}
    </strong>
    OF 1,000,000
  </div>

</section>

  </main>
  <footer>
    ONE DREAM EACH · ONE MILLION PEOPLE · ONE MILLION DREAMS
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
      "/api/og?number=" +
      encodeURIComponent(
        dreamNumber
      ) +
      "&mode=story";


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
              "My dream has a place on One Dream Each.",

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
            "Your Dream Card is generated automatically from this page.";

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
            "Your Dream Card is generated automatically from this page.";

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
          "Creating your 9:16 Dream Card...";


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
            "Your Dream Card is generated automatically from this page.";

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
            "Your Dream Card is generated automatically from this page.";

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

    res.setHeader(
      "Content-Type",
      "text/html; charset=utf-8"
    );


    /*
     * NO CACHE WHILE TESTING
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




