/*
 * OneDreamEach — Permanent Dream Page
 * Rebuilt to match the current OneDreamEach shell and the checkout Dream Card.
 * Cloudflare Worker module.
 */

export async function handleDreamPage(request, env, dreamNumber) {
  try {
    dreamNumber = String(dreamNumber || "").trim();

    if (!dreamNumber) {
      return htmlResponse(errorPage("Dream number missing.", "This place needs a Dream number."), 400);
    }

    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are missing");
    }

    const apiUrl =
      supabaseUrl +
      "/rest/v1/Dreams" +
      "?select=id,dream_number,nickname,dream_text,country,instagram,tiktok,created_at" +
      "&dream_number=eq." + encodeURIComponent(dreamNumber) +
      "&limit=1";

    const dbResponse = await fetch(apiUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: "Bearer " + supabaseKey
      }
    });

    const raw = await dbResponse.text();
    if (!dbResponse.ok) throw new Error("Supabase request failed: " + raw);

    const rows = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(rows) || !rows.length) {
      return htmlResponse(errorPage("Dream not found.", "This permanent place does not seem to exist."), 404);
    }

    const dream = rows[0];
    const number = Number(dream.dream_number || dreamNumber || 0);
    const padded = String(number).padStart(6, "0");
    const nickname = String(dream.nickname || "Anonymous").trim() || "Anonymous";
    const dreamText = String(dream.dream_text || "").trim();
    const country = String(dream.country || "World").trim() || "World";
    const instagram = normalizeHandle(dream.instagram);
    const tiktok = normalizeHandle(dream.tiktok);

    const safeNickname = escapeHtml(nickname);
    const safeDream = escapeHtml(dreamText);
    const safeCountry = escapeHtml(country);
    const countryCode = getCountryCode(country);
    const flagUrl = countryCode
      ? "https://flagcdn.com/w160/" + countryCode.toLowerCase() + ".png"
      : "";

    const siteUrl = String(env.SITE_URL || "https://onedreameach.com").replace(/\/+$/, "");
    const canonicalUrl = siteUrl + "/dream/" + encodeURIComponent(number);
    const ogImageUrl = siteUrl + "/api/og?number=" + encodeURIComponent(number);
    const pageTitle = "Dream #" + padded + " — OneDreamEach";
    const metaDescription = escapeHtml(
      String(dreamText || "One real person. One dream. One permanent place.")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 180)
    );

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#07101b">
  <meta name="robots" content="index,follow">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${metaDescription}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="OneDreamEach">
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
  <meta name="twitter:description" content="${metaDescription}">
  <meta name="twitter:image" content="${ogImageUrl}">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700;800&display=swap');

    :root{
      --bg:#07101b;--bg2:#091322;--panel:#0b1726;--panel2:#10182c;
      --text:#f3f6f9;--muted:#93a2ad;--soft:#667b89;
      --cyan:#72e7ef;--violet:#aa8cff;--pink:#e58ed1;
      --line:rgba(132,197,220,.12);
    }

    *{box-sizing:border-box}

    html{
      scroll-behavior:smooth;
      background:#050a11;
    }

    body{
      margin:0;
      min-height:100vh;
      background:
        radial-gradient(circle at 7% 14%,rgba(48,196,213,.08),transparent 27%),
        radial-gradient(circle at 91% 8%,rgba(150,93,226,.11),transparent 31%),
        linear-gradient(180deg,#0a1425 0%,#07101b 48%,#061019 100%);
      color:var(--text);
      font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      overflow-x:hidden;
    }

    body:before{
      content:"";
      position:fixed;
      inset:0;
      pointer-events:none;
      opacity:.22;
      background-image:
        linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),
        linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px);
      background-size:34px 34px;
      mask-image:linear-gradient(to bottom,black,transparent 72%);
    }

    a{color:inherit}

    button,a{
      -webkit-tap-highlight-color:transparent;
    }

    .shell{
      width:min(1160px,92%);
      margin:auto;
    }

    /* =========================================================
       TOP — SAME FOUR-WORLD SHELL AS THE REST OF THE SITE
       ========================================================= */

    .top{
      padding-top:max(10px,env(safe-area-inset-top));
      position:relative;
      z-index:30;
    }

    .top-nav{
      min-height:82px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:14px;
    }

    .brand{
      text-decoration:none;
      color:inherit;
      display:flex;
      align-items:center;
    }

    .brand strong{
      display:block;
      color:#f6f8fb;
      font-family:"Space Grotesk",Inter,sans-serif;
      font-size:18px;
      font-weight:700;
      line-height:1;
      letter-spacing:-.045em;
    }

    .brand small{
      margin-top:7px;
      display:flex;
      align-items:center;
      gap:6px;
      color:#748697;
      font-size:6.6px;
      font-weight:900;
      letter-spacing:.14em;
      line-height:1;
      white-space:nowrap;
    }

    .brand small i{
      width:5px;
      height:5px;
      border-radius:50%;
      display:block;
      background:#73e9e0;
      box-shadow:0 0 11px rgba(115,233,224,.68);
    }

    .brand small b{
      color:#c7b1fb;
      font-size:6.6px;
      letter-spacing:.14em;
    }

    .home-link{
      min-height:50px;
      padding:6px 12px 6px 7px;
      border-radius:17px;
      display:flex;
      align-items:center;
      gap:9px;
      text-decoration:none;
      color:#eef3f7;
      background:
        linear-gradient(
          145deg,
          rgba(16,25,38,.94),
          rgba(10,14,24,.98)
        );
      border:1px solid rgba(153,193,220,.15);
      box-shadow:
        0 0 0 1px rgba(0,0,0,.62),
        inset 0 1px 0 rgba(255,255,255,.045);
    }

    .home-icon{
      width:36px;
      height:36px;
      border-radius:12px;
      display:grid;
      place-items:center;
      background:
        linear-gradient(
          145deg,
          rgba(65,211,218,.18),
          rgba(152,102,235,.23)
        );
      border:1px solid rgba(140,213,232,.13);
    }

    .home-icon svg{
      width:20px;
      height:20px;
    }

    .home-copy small{
      display:block;
      color:#6f8291;
      font-size:5.4px;
      font-weight:900;
      letter-spacing:.14em;
    }

    .home-copy b{
      display:block;
      margin-top:3px;
      color:#f2f6f8;
      font:700 9px/1 "Space Grotesk",Inter,sans-serif;
      letter-spacing:.04em;
    }

    .world-tabs{
      display:grid;
      grid-template-columns:repeat(4,minmax(0,1fr));
      gap:8px;
      margin:4px 0 30px;
    }

    .world-tab{
      position:relative;
      min-width:0;
      min-height:66px;
      padding:8px 10px;
      border-radius:18px;
      border:1px solid rgba(137,190,216,.12);
      background:
        linear-gradient(
          155deg,
          rgba(12,23,34,.95),
          rgba(8,13,23,.98)
        );
      box-shadow:
        0 0 0 1px rgba(0,0,0,.65),
        inset 0 1px 0 rgba(255,255,255,.035);
      display:grid;
      grid-template-columns:38px minmax(0,1fr) 16px;
      align-items:center;
      gap:9px;
      color:#92a6b3;
      text-decoration:none;
      transition:.18s ease;
    }

    .world-tab:hover,
    .world-tab:focus-visible{
      transform:translateY(-2px);
      border-color:rgba(167,139,250,.36);
    }

    .world-tab-icon{
      width:38px;
      height:38px;
      border-radius:13px;
      display:grid;
      place-items:center;
      color:#8fe8ef;
      background:rgba(5,13,22,.60);
      border:1px solid rgba(132,206,225,.11);
    }

    .world-tab:nth-child(2) .world-tab-icon{
      color:#c3a7ff;
    }

    .world-tab:nth-child(3) .world-tab-icon{
      color:#79e3cf;
    }

    .world-tab:nth-child(4) .world-tab-icon{
      color:#d9a8f8;
    }

    .world-tab-icon svg{
      display:block;
      width:24px;
      height:24px;
    }

    .world-tab-copy small{
      display:block;
      color:#657b89;
      font-size:5.5px;
      font-weight:900;
      letter-spacing:.14em;
    }

    .world-tab-copy b{
      display:block;
      margin-top:4px;
      color:inherit;
      font:700 10px/1 "Space Grotesk",Inter,sans-serif;
      letter-spacing:.045em;
    }

    .world-tab>em{
      font-style:normal;
      color:#5e7380;
      font-size:13px;
    }

    /* =========================================================
       HERO — SAME PAGE LANGUAGE, NOT A SEPARATE DESIGN SYSTEM
       ========================================================= */

    .hero{
      position:relative;
      overflow:hidden;
      margin:0 auto 34px;
      padding:48px 34px 42px;
      border:1px solid rgba(129,195,219,.15);
      border-radius:31px;
      background:
        radial-gradient(
          circle at 3% 4%,
          rgba(52,213,224,.13),
          transparent 32%
        ),
        radial-gradient(
          circle at 100% 4%,
          rgba(163,102,239,.13),
          transparent 36%
        ),
        linear-gradient(
          145deg,
          rgba(11,28,40,.94),
          rgba(18,20,39,.96)
        );
      box-shadow:
        0 20px 60px rgba(0,0,0,.18),
        inset 0 1px 0 rgba(255,255,255,.035);
    }

    .hero:before{
      content:"";
      position:absolute;
      left:0;
      right:0;
      top:0;
      height:2px;
      background:
        linear-gradient(
          90deg,
          #63e6ee,
          rgba(120,154,255,.75),
          #cc83ef
        );
      opacity:.7;
    }

    .hero-kicker{
      display:flex;
      align-items:center;
      justify-content:center;
      gap:9px;
      color:#7cdfe8;
      font-size:7px;
      font-weight:900;
      letter-spacing:.19em;
      text-align:center;
    }

    .hero-kicker i{
      width:7px;
      height:7px;
      border-radius:50%;
      background:#70e8ef;
      box-shadow:0 0 15px rgba(112,232,239,.82);
    }

    .hero h1{
      margin:25px auto 0;
      max-width:850px;
      text-align:center;
      font:
        800
        clamp(43px,6.1vw,78px)/.96
        "Space Grotesk",
        Inter,
        sans-serif;
      letter-spacing:-.055em;
      color:#f5f6f8;
    }

    .hero h1 span{
      background:
        linear-gradient(
          90deg,
          #74e5ed 0%,
          #a8b1ff 48%,
          #e08bd3 100%
        );
      -webkit-background-clip:text;
      background-clip:text;
      color:transparent;
    }

    .hero p{
      max-width:760px;
      margin:24px auto 0;
      text-align:center;
      color:#a2b0ba;
      font-size:clamp(15px,2vw,21px);
      line-height:1.55;
    }

    .hero p strong{
      color:#d8c4ff;
    }

    /* =========================================================
       OFFICIAL DREAM CARD — TRANSPLANTED FROM CHECKOUT
       ========================================================= */

    .card-wrap{
      width:min(790px,100%);
      margin:0 auto;
    }

    .dream-card{
      --card-cyan:#69e4f0;
      --card-violet:#a58bff;
      --card-pink:#e68dcc;
      position:relative;
      overflow:hidden;
      margin:0;
      padding:0;
      border-radius:26px;
      border:1px solid rgba(155,138,255,.36);
      background:
        radial-gradient(
          circle at 8% 0%,
          rgba(74,221,240,.18),
          transparent 33%
        ),
        radial-gradient(
          circle at 95% 12%,
          rgba(203,111,255,.24),
          transparent 35%
        ),
        radial-gradient(
          circle at 72% 92%,
          rgba(236,118,194,.11),
          transparent 32%
        ),
        linear-gradient(
          145deg,
          #081724 0%,
          #10152b 50%,
          #1a1130 100%
        );
      box-shadow:
        0 0 0 1px rgba(0,0,0,.78),
        0 26px 64px rgba(0,0,0,.34),
        0 0 42px rgba(137,113,255,.10),
        inset 0 1px 0 rgba(255,255,255,.07);
      isolation:isolate;
    }

    .dream-card:before{
      content:"";
      position:absolute;
      inset:0;
      border-radius:inherit;
      padding:1px;
      background:
        linear-gradient(
          120deg,
          rgba(101,231,241,.82),
          rgba(148,137,255,.24) 42%,
          rgba(216,126,255,.78) 70%,
          rgba(242,142,201,.35)
        );
      -webkit-mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
      -webkit-mask-composite:xor;
      mask-composite:exclude;
      pointer-events:none;
      z-index:8;
      opacity:.85;
    }

    .dream-card:after{
      content:"";
      position:absolute;
      width:290px;
      height:290px;
      right:-94px;
      top:154px;
      border-radius:50%;
      border:1px solid rgba(196,139,255,.12);
      box-shadow:
        0 0 0 45px rgba(97,225,238,.025),
        0 0 0 90px rgba(188,117,255,.018);
      pointer-events:none;
      z-index:0;
    }

    .card-aura{
      position:absolute;
      inset:-30% -25%;
      background:
        conic-gradient(
          from 100deg,
          transparent,
          rgba(89,231,241,.10),
          transparent 28%,
          rgba(194,118,255,.14),
          transparent 58%,
          rgba(239,132,203,.08),
          transparent
        );
      animation:aura 14s linear infinite;
      z-index:-1;
      pointer-events:none;
    }

    .card-sweep{
      position:absolute;
      top:0;
      left:-42%;
      width:28%;
      height:100%;
      background:
        linear-gradient(
          90deg,
          transparent,
          rgba(255,255,255,.055),
          transparent
        );
      transform:skewX(-18deg);
      animation:sweep 7.8s ease-in-out infinite;
      z-index:7;
      pointer-events:none;
    }

    @keyframes aura{
      to{
        transform:rotate(360deg);
      }
    }

    @keyframes sweep{
      0%,58%{
        transform:translateX(0) skewX(-18deg);
        opacity:0;
      }

      66%{
        opacity:1;
      }

      86%{
        transform:translateX(540%) skewX(-18deg);
        opacity:0;
      }

      100%{
        opacity:0;
      }
    }

    .card-livebar{
      min-height:54px;
      padding:0 24px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      border-bottom:1px solid rgba(255,255,255,.055);
      background:rgba(4,10,18,.35);
      position:relative;
      z-index:2;
    }

    .card-livebar span{
      display:flex;
      align-items:center;
      gap:8px;
      color:#a9dce5;
      font-size:8px;
      font-weight:900;
      letter-spacing:1.55px;
    }

    .card-livebar span i{
      width:8px;
      height:8px;
      border-radius:50%;
      background:#6de8ef;
      box-shadow:0 0 14px rgba(109,232,239,.82);
    }

    .card-livebar b{
      color:#d4b6ff;
      font-size:7.5px;
      letter-spacing:1.35px;
    }

    .card-top,
    .card-bottom{
      position:relative;
      z-index:2;
      display:flex;
      justify-content:space-between;
      gap:20px;
    }

    .card-top{
      padding:28px 27px 0;
      align-items:flex-start;
    }

    .card-id span,
    .card-location-copy span,
    .card-bottom span{
      display:block;
      color:#718697;
      font-size:7.4px;
      font-weight:900;
      letter-spacing:1.45px;
    }

    .card-id strong{
      display:block;
      margin-top:6px;
      color:#d3bcff;
      font-family:"Space Grotesk",Inter,sans-serif;
      font-size:22px;
      letter-spacing:-.015em;
      text-shadow:0 0 20px rgba(182,125,255,.2);
    }

    .card-location{
      display:flex;
      align-items:center;
      gap:11px;
      min-width:0;
      padding:9px 14px 9px 9px;
      border:1px solid rgba(255,255,255,.07);
      border-radius:18px;
      background:rgba(5,11,20,.44);
      box-shadow:0 0 0 1px rgba(0,0,0,.52);
    }

    .flag{
      width:62px;
      height:48px;
      position:relative;
      display:grid;
      place-items:center;
      overflow:hidden;
      border-radius:13px;
      background:
        linear-gradient(
          145deg,
          #0d1724,
          #19162a
        );
      box-shadow:
        0 0 0 1px rgba(0,0,0,.72),
        0 0 22px rgba(162,118,255,.10),
        inset 0 1px 0 rgba(255,255,255,.06);
    }

    .flag img{
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    }

    .flag-fallback{
      font:
        800
        13px/1
        "Space Grotesk",
        Inter,
        sans-serif;
      color:#dce9f1;
      letter-spacing:.08em;
    }

    .card-country{
      max-width:170px;
      margin-top:5px;
      color:#eff3f6;
      font-family:"Space Grotesk",Inter,sans-serif;
      font-size:10px;
      font-weight:800;
      line-height:1.25;
      letter-spacing:.8px;
      text-transform:uppercase;
      overflow-wrap:anywhere;
    }

    .quote-mark{
      position:absolute;
      left:27px;
      top:127px;
      color:rgba(159,122,255,.38);
      font-size:76px;
      font-family:Georgia,serif;
      line-height:1;
      z-index:1;
    }

    .dream-text{
      position:relative;
      z-index:2;
      min-height:330px;
      margin:52px 27px 30px;
      padding:24px 16px 22px 47px;
      display:flex;
      align-items:flex-start;
      color:#fbfcff;
      font-family:Inter,system-ui,sans-serif;
      font-size:clamp(28px,4.4vw,42px);
      line-height:1.25;
      font-weight:650;
      letter-spacing:-1.25px;
      text-shadow:0 8px 28px rgba(0,0,0,.22);
      overflow-wrap:anywhere;
    }

    .dream-text.long{
      font-size:clamp(23px,3.5vw,34px);
      line-height:1.3;
    }

    .dream-text.very-long{
      font-size:clamp(19px,3vw,28px);
      line-height:1.34;
    }

    .card-bottom{
      margin:0 27px;
      padding:20px 0 21px;
      border-top:1px solid rgba(110,222,238,.09);
      align-items:flex-end;
    }

    .card-bottom strong{
      display:block;
      margin-top:6px;
      font-family:"Space Grotesk",Inter,sans-serif;
      font-size:16px;
      color:#eef2f5;
    }

    .card-status{
      text-align:right;
    }

    .card-status strong{
      color:#f3f3f7;
      font-size:15px;
      letter-spacing:.55px;
    }

    .worldline{
      margin:0 19px 17px;
      padding:10px;
      display:grid;
      grid-template-columns:repeat(4,1fr);
      gap:8px;
      border:1px solid rgba(255,255,255,.045);
      border-radius:17px;
      background:rgba(4,10,18,.34);
      position:relative;
      z-index:2;
    }

    .world-chip{
      min-height:58px;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:7px;
      border:1px solid rgba(255,255,255,.045);
      border-radius:13px;
      background:rgba(255,255,255,.018);
      box-shadow:0 0 0 1px rgba(0,0,0,.35);
    }

    .world-chip svg{
      width:30px;
      height:30px;
    }

    .world-chip b{
      color:#bac7cf;
      font-size:7.4px;
      letter-spacing:1px;
    }

    .world-chip.map{
      border-color:rgba(88,221,239,.11);
    }

    .world-chip.wall{
      border-color:rgba(187,129,255,.12);
    }

    .world-chip.chain{
      border-color:rgba(89,222,206,.10);
    }

    .world-chip.puzzle{
      border-color:rgba(193,127,255,.12);
    }

    .shareline{
      margin:0 19px 19px;
      padding:12px 11px;
      border-radius:13px;
      background:
        linear-gradient(
          90deg,
          rgba(70,213,233,.07),
          rgba(173,116,255,.10)
        );
      color:#8299aa;
      font-size:7px;
      font-weight:900;
      letter-spacing:1px;
      text-align:center;
    }

    .shareline span{
      color:#c99aff;
    }

    /* SMALL PERSONAL DETAIL — NO SECOND CARD LANGUAGE */

    .under-card{
      width:min(790px,100%);
      margin:17px auto 0;
      display:grid;
      grid-template-columns:minmax(0,1fr) auto;
      gap:10px;
      align-items:stretch;
    }

    .memory-button,
    .world-entry{
      border:1px solid rgba(139,202,221,.12);
      border-radius:18px;
      background:
        linear-gradient(
          145deg,
          rgba(9,23,34,.86),
          rgba(15,16,31,.92)
        );
      box-shadow:
        0 0 0 1px rgba(0,0,0,.55),
        inset 0 1px 0 rgba(255,255,255,.035);
      color:#d9e4ea;
      min-height:64px;
    }

    .memory-button{
      appearance:none;
      width:100%;
      padding:11px 15px;
      display:flex;
      align-items:center;
      gap:12px;
      text-align:left;
      cursor:pointer;
    }

    .memory-heart{
      width:40px;
      height:40px;
      border-radius:13px;
      display:grid;
      place-items:center;
      color:#e2a3d7;
      background:rgba(151,77,152,.12);
      border:1px solid rgba(219,137,207,.16);
    }

    .memory-heart svg{
      width:21px;
      height:21px;
    }

    .memory-copy small{
      display:block;
      color:#7a8e9a;
      font-size:6px;
      font-weight:900;
      letter-spacing:.13em;
    }

    .memory-copy b{
      display:block;
      margin-top:4px;
      font:700 10px/1 "Space Grotesk",Inter,sans-serif;
    }

    .memory-button.active{
      border-color:rgba(225,137,207,.34);
      background:
        linear-gradient(
          145deg,
          rgba(54,26,65,.76),
          rgba(14,28,39,.92)
        );
    }

    .memory-button.active .memory-heart{
      color:#fff;
      background:rgba(211,105,191,.24);
    }

    .world-entry{
      padding:0 18px;
      display:flex;
      align-items:center;
      text-decoration:none;
      font:700 9px/1 "Space Grotesk",Inter,sans-serif;
      letter-spacing:.06em;
      white-space:nowrap;
    }

    /* =========================================================
       SHARE + FOUR WORLDS
       ========================================================= */

    .section{
      margin-top:38px;
      padding:30px;
      border:1px solid rgba(131,194,218,.13);
      border-radius:29px;
      background:
        radial-gradient(
          circle at 3% 2%,
          rgba(70,213,224,.08),
          transparent 30%
        ),
        linear-gradient(
          145deg,
          rgba(9,24,35,.92),
          rgba(15,18,34,.95)
        );
      box-shadow:
        0 18px 55px rgba(0,0,0,.16),
        inset 0 1px 0 rgba(255,255,255,.03);
    }

    .section-head small{
      display:block;
      color:#75dce7;
      font-size:6.8px;
      font-weight:900;
      letter-spacing:.17em;
    }

    .section-head h2{
      margin:7px 0 0;
      font:
        800
        clamp(28px,4vw,46px)/.98
        "Space Grotesk",
        Inter,
        sans-serif;
      letter-spacing:-.045em;
    }

    .section-head h2 span{
      background:
        linear-gradient(
          90deg,
          #71e4ee,
          #a7afff,
          #df8ed2
        );
      -webkit-background-clip:text;
      background-clip:text;
      color:transparent;
    }

    .section-head p{
      max-width:700px;
      margin:13px 0 0;
      color:#8497a4;
      font-size:12px;
      line-height:1.65;
    }

    .share-actions{
      display:grid;
      grid-template-columns:repeat(3,1fr);
      gap:9px;
      margin-top:22px;
    }

    .share-action{
      appearance:none;
      min-height:70px;
      padding:12px 14px;
      border:1px solid rgba(134,201,221,.12);
      border-radius:17px;
      background:rgba(5,14,23,.50);
      color:#e8f0f4;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:10px;
      text-decoration:none;
      cursor:pointer;
      font:700 9px/1.1 "Space Grotesk",Inter,sans-serif;
      letter-spacing:.07em;
    }

    .share-action.primary{
      border-color:rgba(105,226,239,.28);
      background:
        linear-gradient(
          145deg,
          rgba(29,114,133,.24),
          rgba(78,56,141,.27)
        );
    }

    .share-action svg{
      width:22px;
      height:22px;
      color:#75e5ef;
    }

    .share-action:nth-child(2) svg{
      color:#c09aff;
    }

    .share-action:nth-child(3) svg{
      color:#8ce7d3;
    }

    .share-status{
      min-height:18px;
      margin-top:10px;
      color:#6f8794;
      font-size:8px;
      font-weight:700;
      letter-spacing:.04em;
      text-align:center;
    }

    .world-grid{
      display:grid;
      grid-template-columns:repeat(4,minmax(0,1fr));
      gap:9px;
      margin-top:22px;
    }

    .world-card{
      min-width:0;
      min-height:108px;
      padding:13px;
      border-radius:18px;
      display:grid;
      grid-template-columns:44px minmax(0,1fr) 14px;
      align-items:center;
      gap:9px;
      text-decoration:none;
      color:#a2b3bd;
      background:rgba(5,13,22,.46);
      border:1px solid rgba(137,198,218,.10);
      transition:.18s ease;
    }

    .world-card:hover,
    .world-card:focus-visible{
      transform:translateY(-2px);
      border-color:rgba(174,135,248,.32);
    }

    .world-card-icon{
      width:44px;
      height:44px;
      border-radius:14px;
      display:grid;
      place-items:center;
      background:rgba(8,17,27,.76);
      border:1px solid rgba(126,202,220,.10);
    }

    .world-card-icon svg{
      width:28px;
      height:28px;
    }

    .world-card small{
      display:block;
      color:#657985;
      font-size:5.5px;
      font-weight:900;
      letter-spacing:.12em;
    }

    .world-card b{
      display:block;
      margin-top:4px;
      color:#e5edf1;
      font:700 11px/1 "Space Grotesk",Inter,sans-serif;
    }

    .world-card em{
      display:block;
      margin-top:6px;
      color:#6f838e;
      font-size:6.4px;
      font-style:normal;
      line-height:1.35;
    }

    .world-card>strong{
      color:#607681;
      font-size:13px;
    }

    .socials{
      display:flex;
      flex-wrap:wrap;
      align-items:center;
      gap:8px;
      margin-top:17px;
    }

    .social-label{
      width:100%;
      color:#667c89;
      font-size:6px;
      font-weight:900;
      letter-spacing:.15em;
    }

    .social-link{
      min-height:38px;
      padding:0 12px;
      border:1px solid rgba(146,198,217,.11);
      border-radius:12px;
      display:flex;
      align-items:center;
      text-decoration:none;
      color:#a9bac4;
      font-size:8px;
      font-weight:700;
      background:rgba(5,13,22,.36);
    }

    .cta{
      text-align:center;
      margin:38px 0 54px;
      padding:42px 24px;
      border:1px solid rgba(149,116,226,.18);
      border-radius:30px;
      background:
        radial-gradient(
          circle at 50% 0%,
          rgba(145,88,220,.13),
          transparent 40%
        ),
        linear-gradient(
          145deg,
          rgba(12,21,34,.93),
          rgba(20,15,34,.95)
        );
    }

    .cta small{
      color:#7cdde6;
      font-size:6.5px;
      font-weight:900;
      letter-spacing:.18em;
    }

    .cta h2{
      margin:10px 0 0;
      font:
        800
        clamp(32px,5vw,58px)/.98
        "Space Grotesk",
        Inter,
        sans-serif;
      letter-spacing:-.05em;
    }

    .cta h2 span{
      background:
        linear-gradient(
          90deg,
          #6ce1ec,
          #adabff,
          #e18dcf
        );
      -webkit-background-clip:text;
      background-clip:text;
      color:transparent;
    }

    .cta p{
      max-width:600px;
      margin:15px auto 0;
      color:#8396a2;
      font-size:12px;
      line-height:1.65;
    }

    .cta a{
      margin-top:21px;
      min-height:56px;
      padding:0 22px;
      border-radius:17px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      text-decoration:none;
      color:white;
      background:
        linear-gradient(
          100deg,
          #25b5cc,
          #755be8 48%,
          #bd5ee2
        );
      box-shadow:0 16px 40px rgba(112,82,218,.24);
      font:700 10px/1 "Space Grotesk",Inter,sans-serif;
      letter-spacing:.07em;
    }

    @media(max-width:760px){

      .shell{
        width:min(100% - 24px,1160px);
      }

      .top-nav{
        min-height:72px;
      }

      .brand strong{
        font-size:15px;
      }

      .brand small{
        margin-top:6px;
        font-size:5.6px;
        gap:5px;
        letter-spacing:.11em;
      }

      .brand small b{
        font-size:5.6px;
      }

      .home-link{
        min-height:44px;
        padding:5px 8px 5px 5px;
        gap:6px;
      }

      .home-icon{
        width:32px;
        height:32px;
        border-radius:10px;
      }

      .home-copy small{
        display:none;
      }

      .home-copy b{
        font-size:8px;
        margin:0;
      }

      .world-tabs{
        gap:6px;
        margin:2px 0 22px;
      }

      .world-tab{
        min-height:70px;
        padding:7px 4px;
        border-radius:15px;
        display:flex;
        flex-direction:column;
        justify-content:center;
        gap:5px;
      }

      .world-tab-icon{
        width:34px;
        height:34px;
        border-radius:11px;
      }

      .world-tab-icon svg{
        width:23px;
        height:23px;
      }

      .world-tab-copy small{
        display:none;
      }

      .world-tab-copy b{
        font-size:7.6px;
        margin:0;
        letter-spacing:.05em;
      }

      .world-tab>em{
        display:none;
      }

      .hero{
        padding:34px 20px 31px;
        border-radius:27px;
        margin-bottom:28px;
      }

      .hero-kicker{
        font-size:6.1px;
      }

      .hero h1{
        font-size:clamp(42px,12vw,63px);
        margin-top:20px;
      }

      .hero p{
        font-size:15px;
        line-height:1.55;
        margin-top:20px;
      }

      .dream-card{
        border-radius:23px;
      }

      .card-livebar{
        min-height:46px;
        padding:0 14px;
      }

      .card-livebar span{
        font-size:6.4px;
        letter-spacing:1.2px;
      }

      .card-livebar b{
        font-size:6px;
      }

      .card-top{
        padding:20px 15px 0;
        gap:8px;
      }

      .card-id span,
      .card-location-copy span{
        font-size:6.3px;
      }

      .card-id strong{
        font-size:16px;
        margin-top:5px;
      }

      .card-location{
        padding:7px 9px 7px 7px;
        gap:7px;
        border-radius:15px;
      }

      .flag{
        width:49px;
        height:38px;
        border-radius:10px;
      }

      .card-country{
        max-width:112px;
        font-size:7.4px;
        letter-spacing:.65px;
      }

      .quote-mark{
        left:15px;
        top:101px;
        font-size:55px;
      }

      .dream-text{
        min-height:330px;
        margin:34px 15px 24px;
        padding:24px 5px 18px 35px;
        font-size:clamp(27px,7.6vw,36px);
        line-height:1.28;
        letter-spacing:-.9px;
      }

      .dream-text.long{
        font-size:clamp(22px,6.4vw,30px);
      }

      .dream-text.very-long{
        font-size:clamp(18px,5.3vw,25px);
        line-height:1.34;
      }

      .card-bottom{
        margin:0 15px;
        padding:15px 0 16px;
      }

      .card-bottom span{
        font-size:6.2px;
      }

      .card-bottom strong{
        font-size:12px;
      }

      .card-status strong{
        font-size:10px;
      }

      .worldline{
        margin:0 10px 10px;
        padding:7px;
        gap:5px;
        border-radius:14px;
      }

      .world-chip{
        min-height:46px;
        gap:4px;
        border-radius:11px;
      }

      .world-chip svg{
        width:23px;
        height:23px;
      }

      .world-chip b{
        font-size:5.8px;
      }

      .shareline{
        margin:0 10px 11px;
        padding:9px 7px;
        font-size:5.7px;
      }

      .under-card{
        grid-template-columns:1fr;
      }

      .world-entry{
        min-height:52px;
        justify-content:center;
      }

      .section{
        margin-top:28px;
        padding:22px 16px;
        border-radius:24px;
      }

      .section-head h2{
        font-size:31px;
      }

      .section-head p{
        font-size:11px;
      }

      .share-actions{
        grid-template-columns:1fr;
        gap:7px;
      }

      .share-action{
        min-height:58px;
      }

      .world-grid{
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:7px;
      }

      .world-card{
        min-height:88px;
        padding:9px;
        grid-template-columns:36px minmax(0,1fr) 12px;
        gap:7px;
      }

      .world-card-icon{
        width:36px;
        height:36px;
        border-radius:11px;
      }

      .world-card-icon svg{
        width:23px;
        height:23px;
      }

      .world-card em{
        font-size:5.8px;
      }

      .cta{
        margin-top:28px;
        padding:34px 18px;
        border-radius:25px;
      }

      .cta p{
        font-size:11px;
      }
    }

    @media(max-width:390px){

      .card-country{
        max-width:88px;
      }

      .card-id strong{
        font-size:14px;
      }

      .dream-text{
        font-size:25px;
      }

      .world-chip b{
        font-size:5px;
      }

      .world-chip svg{
        width:21px;
        height:21px;
      }
    }

    @media(prefers-reduced-motion:reduce){

      *{
        scroll-behavior:auto!important;
      }

      .card-aura,
      .card-sweep{
        animation:none!important;
      }

      .world-tab,
      .world-card{
        transition:none!important;
      }
    }
  </style>
</head>

<body>

  <header class="top">

    <div class="shell">

      <div class="top-nav">

        <a
          class="brand"
          href="/"
          aria-label="OneDreamEach home"
        >

          <span>

            <strong>
              OneDreamEach
            </strong>

            <small>
              <i></i>
              <span>
                PERMANENT ARCHIVE
              </span>
              <b>
                DREAM #${padded}
              </b>
            </small>

          </span>

        </a>

        <a
          class="home-link"
          href="/"
          aria-label="Home"
        >

          <span
            class="home-icon"
            aria-hidden="true"
          >
            ${rocketIcon()}
          </span>

          <span class="home-copy">
            <small>
              BACK TO
            </small>
            <b>
              HOME
            </b>
          </span>
        </a>
      </div>

      <nav class="world-tabs" aria-label="OneDreamEach worlds">
        ${worldTab("map","WORLD 01","MAP","/world-dream-map.html")}
        ${worldTab("wall","WORLD 02","WALL","/explore")}
        ${worldTab("chain","WORLD 03","CHAIN","/chain.html")}
        ${worldTab("puzzle","WORLD 04","PUZZLE","/puzzle.html")}
      </nav>
    </div>
  </header>

  <main class="shell">
    <section class="hero">
      <div class="hero-kicker"><i></i> ONE DREAM EACH &middot; PERMANENT DREAM PAGE</div>
      <h1>ONE DREAM.<br><span>FOUR WORLDS.</span></h1>
      <p>One real person. One permanent number. The same Dream lives across the Map, Wall, Chain and Puzzle. This is <strong>Dream #${padded}</strong>.</p>
    </section>

    <div class="card-wrap">
      <article class="dream-card" id="official-dream-card" aria-label="Official Dream Card">

        <div class="card-aura" aria-hidden="true"></div>
        <div class="card-sweep" aria-hidden="true"></div>

        <div class="card-livebar">
          <span><i></i> OFFICIAL DREAM CARD</span>
          <b>LIVE IN THE ARCHIVE</b>
        </div>

        <div class="card-top">

          <div class="card-id">
            <span>PERMANENT NUMBER</span>
            <strong>DREAM #${padded}</strong>
          </div>

          <div class="card-location">

            <div class="flag" aria-hidden="true">
              ${
                flagUrl
                  ? `<img src="${flagUrl}" alt="">`
                  : `<span class="flag-fallback">${escapeHtml(countryCode || "WORLD")}</span>`
              }
            </div>

            <div class="card-location-copy">
              <span>FROM</span>
              <div class="card-country">${safeCountry}</div>
            </div>

          </div>

        </div>

        <div class="quote-mark" aria-hidden="true">&ldquo;</div>

        <blockquote
          class="dream-text${
            dreamText.length > 170
              ? " very-long"
              : dreamText.length > 95
              ? " long"
              : ""
          }"
        >
          ${safeDream}
        </blockquote>

        <div class="card-bottom">

          <div>
            <span>DREAMED BY</span>
            <strong>${safeNickname}</strong>
          </div>

          <div class="card-status">
            <span>STATUS</span>
            <strong>PERMANENT &middot; PUBLIC</strong>
          </div>

        </div>

        <div class="worldline" aria-label="Four Dream worlds">
          ${worldChip("map","MAP")}
          ${worldChip("wall","WALL")}
          ${worldChip("chain","CHAIN")}
          ${worldChip("puzzle","PUZZLE")}
        </div>

        <div class="shareline">
          <span>&#10022;</span>
          LIVE PAGE + SHAREABLE 9:16 OFFICIAL DREAM CARD
        </div>

      </article>
    </div>

    <div class="under-card">

      <button
        class="memory-button"
        id="memory-button"
        type="button"
        aria-pressed="false"
      >

        <span
          class="memory-heart"
          aria-hidden="true"
        >
          ${heartIcon()}
        </span>

        <span class="memory-copy">
          <small>YOUR WALL MEMORY</small>
          <b id="memory-label">STAYED WITH ME</b>
        </span>

      </button>

      <a
        class="world-entry"
        href="#four-worlds"
      >
        OPEN THE FOUR WORLDS &darr;
      </a>

    </div>

    ${buildSocialHtml(instagram,tiktok)}

    <section
      class="section"
      id="share-actions"
    >

      <div class="section-head">

        <small>
          MAKE THE DREAM TRAVEL
        </small>

        <h2>
          SHARE THE
          <span>OFFICIAL CARD.</span>
        </h2>

        <p>
          The downloadable image uses the same identity as this permanent
          Dream Page: number, country, Dream, person and the four worlds.
        </p>

      </div>

      <div class="share-actions">

        <button
          class="share-action primary"
          id="share-card"
          type="button"
        >
          ${shareIcon()}
          <span>SHARE DREAM CARD</span>
        </button>

        <button
          class="share-action"
          id="download-card"
          type="button"
        >
          ${downloadIcon()}
          <span>DOWNLOAD 9:16</span>
        </button>

        <button
          class="share-action"
          id="copy-link"
          type="button"
        >
          ${linkIcon()}
          <span>COPY DREAM LINK</span>
        </button>

      </div>

      <div
        class="share-status"
        id="share-status"
        role="status"
        aria-live="polite"
      ></div>

    </section>

    <section
      class="section"
      id="four-worlds"
    >

      <div class="section-head">

        <small>
          ONE CARD &middot; FOUR WORLDS
        </small>

        <h2>
          THE SAME DREAM.<br>
          <span>EVERYWHERE.</span>
        </h2>

        <p>
          This page is the permanent source. The same Official Dream Card
          becomes the visual language used when this Dream opens in every world.
        </p>

      </div>

      <div class="world-grid">

        ${worldCard(
          "map",
          "WORLD 01",
          "MAP",
          "See it on Earth",
          "/world-dream-map.html"
        )}

        ${worldCard(
          "wall",
          "WORLD 02",
          "WALL",
          "Read it in the archive",
          "/explore"
        )}

        ${worldCard(
          "chain",
          "WORLD 03",
          "CHAIN",
          "Pass it forward",
          "/chain.html"
        )}

        ${worldCard(
          "puzzle",
          "WORLD 04",
          "PUZZLE",
          "Find its piece",
          "/puzzle.html"
        )}

      </div>

    </section>

    <section class="cta">

      <small>
        ONE MILLION PEOPLE &middot; ONE DREAM EACH
      </small>

      <h2>
        THIS DREAM HAS A PLACE.<br>
        <span>WHAT ABOUT YOURS?</span>
      </h2>

      <p>
        Leave one Dream, receive your permanent number and enter
        the same four-world archive.
      </p>

      <a href="/#leave">
        LEAVE YOUR DREAM &middot; &euro;1
      </a>

    </section>

  </main>

  <script>

  (function(){

    "use strict";

    const dream =
      ${JSON.stringify({
        dream_number:number,
        dream_text:dreamText,
        nickname,
        country,
        countryCode,
        flagUrl
      })};

    const padded =
      ${JSON.stringify(padded)};

    const dreamUrl =
      ${JSON.stringify(canonicalUrl)};

    const shareStatus =
      document.getElementById(
        "share-status"
      );

    const memoryButton =
      document.getElementById(
        "memory-button"
      );

    const memoryLabel =
      document.getElementById(
        "memory-label"
      );

    function setStatus(text) {

      if (shareStatus) {
        shareStatus.textContent =
          text || "";
      }

    }

    /*
     * WALL MEMORY
     */

    function syncMemory() {

      let stayed =
        false;

      try {

        stayed =
          localStorage.getItem(
            "ode-wall-stayed-" +
            dream.dream_number
          ) === "1";

      }
      catch (error) {}

      if (memoryButton) {

        memoryButton
          .classList
          .toggle(
            "active",
            stayed
          );

        memoryButton
          .setAttribute(
            "aria-pressed",
            stayed
              ? "true"
              : "false"
          );

      }

      if (memoryLabel) {

        memoryLabel.textContent =
          stayed
            ? "IT STAYED WITH ME"
            : "STAYED WITH ME";

      }

      return stayed;
    }

    if (memoryButton) {

      memoryButton
        .addEventListener(
          "click",
          function() {

            const next =
              !syncMemory();

            try {

              localStorage.setItem(
                "ode-wall-stayed-" +
                dream.dream_number,
                next
                  ? "1"
                  : "0"
              );

              if (next) {

                localStorage.setItem(
                  "ode-wall-stayed-data-" +
                  dream.dream_number,
                  JSON.stringify({
                    dream_number:
                      dream.dream_number,

                    dream_text:
                      dream.dream_text,

                    nickname:
                      dream.nickname,

                    country:
                      dream.country
                  })
                );

              }

            }
            catch (error) {}

            syncMemory();

          }
        );

    }

    syncMemory();

    /*
     * COPY
     */

    async function copyText(text) {

      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {

        await navigator
          .clipboard
          .writeText(
            text
          );

        return;
      }

      const textarea =
        document.createElement(
          "textarea"
        );

      textarea.value =
        text;

      textarea.style.position =
        "fixed";

      textarea.style.opacity =
        "0";

      document.body
        .appendChild(
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
     * CANVAS HELPERS
     */

    function roundRect(
      ctx,
      x,
      y,
      width,
      height,
      radius,
      fill,
      stroke
    ) {

      const r =
        Math.min(
          radius,
          width / 2,
          height / 2
        );

      ctx.beginPath();

      ctx.moveTo(
        x + r,
        y
      );

      ctx.arcTo(
        x + width,
        y,
        x + width,
        y + height,
        r
      );

      ctx.arcTo(
        x + width,
        y + height,
        x,
        y + height,
        r
      );

      ctx.arcTo(
        x,
        y + height,
        x,
        y,
        r
      );

      ctx.arcTo(
        x,
        y,
        x + width,
        y,
        r
      );

      ctx.closePath();

      if (fill) {

        ctx.fillStyle =
          fill;

        ctx.fill();

      }

      if (stroke) {

        ctx.strokeStyle =
          stroke;

        ctx.stroke();

      }

    }

    function fitLines(
      ctx,
      text,
      maxWidth,
      maxLines
    ) {

      const words =
        String(
          text || ""
        )
          .trim()
          .split(/\s+/)
          .filter(Boolean);

      const lines =
        [];

      let line =
        "";

      for (
        const word
        of words
      ) {

        const test =
          line
            ? line + " " + word
            : word;

        if (
          ctx
            .measureText(
              test
            )
            .width <=
          maxWidth
        ) {

          line =
            test;

        }
        else {

          if (line) {
            lines.push(
              line
            );
          }

          line =
            word;

          if (
            lines.length >=
            maxLines - 1
          ) {
            break;
          }

        }

      }

      if (
        line &&
        lines.length <
          maxLines
      ) {

        lines.push(
          line
        );

      }

      return lines;
    }

    /*
     * FLAG FOR DOWNLOADED CARD
     */

    async function loadFlag() {

      if (!dream.flagUrl) {
        return null;
      }

      try {

        const response =
          await fetch(
            dream.flagUrl,
            {
              mode:
                "cors",

              cache:
                "force-cache"
            }
          );

        if (!response.ok) {
          return null;
        }

        const blob =
          await response.blob();

        const url =
          URL.createObjectURL(
            blob
          );

        const image =
          new Image();

        await new Promise(
          function(
            resolve,
            reject
          ) {

            image.onload =
              resolve;

            image.onerror =
              reject;

            image.src =
              url;

          }
        );

        image.__url =
          url;

        return image;

      }
      catch (error) {

        return null;

      }

    }

    /*
     * 9:16 OFFICIAL DREAM CARD
     */

    async function buildCardBlob() {

      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width =
        1080;

      canvas.height =
        1920;

      const ctx =
        canvas.getContext(
          "2d",
          {
            alpha:
              false
          }
        );

      if (!ctx) {

        throw new Error(
          "Canvas unavailable"
        );

      }

      /*
       * BACKGROUND
       */

      const background =
        ctx.createLinearGradient(
          0,
          0,
          1080,
          1920
        );

      background
        .addColorStop(
          0,
          "#071827"
        );

      background
        .addColorStop(
          .52,
          "#10152b"
        );

      background
        .addColorStop(
          1,
          "#1b1030"
        );

      ctx.fillStyle =
        background;

      ctx.fillRect(
        0,
        0,
        1080,
        1920
      );

      const cyanGlow =
        ctx.createRadialGradient(
          90,
          70,
          0,
          90,
          70,
          520
        );

      cyanGlow
        .addColorStop(
          0,
          "rgba(78,226,239,.24)"
        );

      cyanGlow
        .addColorStop(
          1,
          "rgba(78,226,239,0)"
        );

      ctx.fillStyle =
        cyanGlow;

      ctx.fillRect(
        0,
        0,
        700,
        700
      );

      const violetGlow =
        ctx.createRadialGradient(
          1000,
          180,
          0,
          1000,
          180,
          650
        );

      violetGlow
        .addColorStop(
          0,
          "rgba(199,108,255,.28)"
        );

      violetGlow
        .addColorStop(
          1,
          "rgba(199,108,255,0)"
        );

      ctx.fillStyle =
        violetGlow;

      ctx.fillRect(
        400,
        0,
        680,
        850
      );

      /*
       * BORDER
       */

      ctx.lineWidth =
        3;

      roundRect(
        ctx,
        42,
        44,
        996,
        1832,
        58,
        null,
        "rgba(166,137,255,.65)"
      );

      /*
       * TOP BAR
       */

      roundRect(
        ctx,
        44,
        46,
        992,
        120,
        56,
        "rgba(3,10,18,.40)"
      );

      ctx.fillStyle =
        "#9edbe5";

      ctx.font =
        "800 24px Arial";

      ctx.fillText(
        "OFFICIAL DREAM CARD",
        92,
        120
      );

      ctx.fillStyle =
        "#d5b6ff";

      ctx.textAlign =
        "right";

      ctx.fillText(
        "LIVE IN THE ARCHIVE",
        984,
        120
      );

      ctx.textAlign =
        "left";

      /*
       * DREAM NUMBER
       */

      ctx.fillStyle =
        "#718697";

      ctx.font =
        "800 20px Arial";

      ctx.fillText(
        "PERMANENT NUMBER",
        88,
        245
      );

      ctx.fillStyle =
        "#d6c1ff";

      ctx.font =
        "800 52px Arial";

      ctx.fillText(
        "DREAM #" +
        padded,
        88,
        307
      );

      /*
       * COUNTRY
       */

      roundRect(
        ctx,
        612,
        205,
        370,
        135,
        34,
        "rgba(4,12,22,.52)",
        "rgba(255,255,255,.12)"
      );

      const flag =
        await loadFlag();

      if (flag) {

        ctx.save();

        roundRect(
          ctx,
          634,
          226,
          112,
          92,
          23,
          "#101522"
        );

        ctx.clip();

        ctx.drawImage(
          flag,
          634,
          226,
          112,
          92
        );

        ctx.restore();

        URL.revokeObjectURL(
          flag.__url
        );

      }
      else {

        roundRect(
          ctx,
          634,
          226,
          112,
          92,
          23,
          "#101522",
          "rgba(255,255,255,.08)"
        );

        ctx.fillStyle =
          "#dceaf0";

        ctx.font =
          "800 28px Arial";

        ctx.textAlign =
          "center";

        ctx.fillText(
          dream.countryCode ||
          "WORLD",
          690,
          282
        );

        ctx.textAlign =
          "left";

      }

      ctx.fillStyle =
        "#718697";

      ctx.font =
        "800 18px Arial";

      ctx.fillText(
        "FROM",
        770,
        248
      );

      ctx.fillStyle =
        "#f2f5f7";

      ctx.font =
        "800 22px Arial";

      const countryLines =
        fitLines(
          ctx,
          String(
            dream.country ||
            "World"
          ).toUpperCase(),
          180,
          2
        );

      countryLines
        .forEach(
          function(
            line,
            index
          ) {

            ctx.fillText(
              line,
              770,
              282 +
              index * 28
            );

          }
        );

      /*
       * DREAM
       */

      ctx.fillStyle =
        "rgba(159,122,255,.45)";

      ctx.font =
        "120px Georgia";

      ctx.fillText(
        "\u201c",
        86,
        470
      );

      let fontSize =
        64;

      if (
        dream.dream_text.length >
        100
      ) {
        fontSize =
          52;
      }

      if (
        dream.dream_text.length >
        180
      ) {
        fontSize =
          42;
      }

      if (
        dream.dream_text.length >
        280
      ) {
        fontSize =
          34;
      }

      ctx.font =
        "650 " +
        fontSize +
        "px Arial";

      const dreamLines =
        fitLines(
          ctx,
          dream.dream_text,
          860,
          11
        );

      const lineHeight =
        Math.round(
          fontSize *
          1.28
        );

      const blockHeight =
        dreamLines.length *
        lineHeight;

      let y =
        570 +
        Math.max(
          0,
          (
            650 -
            blockHeight
          ) / 2
        );

      ctx.fillStyle =
        "#fbfcff";

      for (
        const line
        of dreamLines
      ) {

        ctx.fillText(
          line,
          110,
          y
        );

        y +=
          lineHeight;

      }

      /*
       * AUTHOR / STATUS
       */

      ctx.strokeStyle =
        "rgba(110,222,238,.15)";

      ctx.lineWidth =
        2;

      ctx.beginPath();

      ctx.moveTo(
        88,
        1320
      );

      ctx.lineTo(
        992,
        1320
      );

      ctx.stroke();

      ctx.fillStyle =
        "#718697";

      ctx.font =
        "800 19px Arial";

      ctx.fillText(
        "DREAMED BY",
        90,
        1374
      );

      ctx.fillStyle =
        "#f0f3f5";

      ctx.font =
        "800 32px Arial";

      ctx.fillText(
        String(
          dream.nickname ||
          "Anonymous"
        ),
        90,
        1420
      );

      ctx.textAlign =
        "right";

      ctx.fillStyle =
        "#718697";

      ctx.font =
        "800 19px Arial";

      ctx.fillText(
        "STATUS",
        990,
        1374
      );

      ctx.fillStyle =
        "#f0f3f5";

      ctx.font =
        "800 29px Arial";

      ctx.fillText(
        "PERMANENT  /  PUBLIC",
        990,
        1420
      );

      ctx.textAlign =
        "left";

      /*
       * FOUR WORLDS
       */

      const labels =
        [
          "MAP",
          "WALL",
          "CHAIN",
          "PUZZLE"
        ];

      for (
        let i = 0;
        i < 4;
        i++
      ) {

        const boxX =
          84 +
          i * 232;

        roundRect(
          ctx,
          boxX,
          1500,
          214,
          112,
          26,
          "rgba(4,11,20,.40)",
          i === 0
            ? "rgba(96,225,239,.20)"
            : "rgba(188,136,255,.16)"
        );

        ctx.fillStyle =
          i === 0
            ? "#7ce9ef"
            : "#c5a9ff";

        ctx.font =
          "800 24px Arial";

        ctx.textAlign =
          "center";

        ctx.fillText(
          labels[i],
          boxX + 107,
          1568
        );

      }

      ctx.textAlign =
        "left";

      /*
       * BRAND LINE
       */

      roundRect(
        ctx,
        84,
        1650,
        912,
        88,
        28,
        "rgba(121,87,184,.12)",
        "rgba(201,147,255,.12)"
      );

      ctx.fillStyle =
        "#bd9ee7";

      ctx.font =
        "800 19px Arial";

      ctx.textAlign =
        "center";

      ctx.fillText(
        "ONE DREAM EACH  /  ONE CARD  /  FOUR WORLDS",
        540,
        1705
      );

      ctx.fillStyle =
        "#6f8292";

      ctx.font =
        "700 18px Arial";

      ctx.fillText(
        "onedreameach.com/dream/" +
        dream.dream_number,
        540,
        1810
      );

      ctx.textAlign =
        "left";

      return await new Promise(
        function(
          resolve,
          reject
        ) {

          canvas.toBlob(
            function(blob) {

              if (blob) {
                resolve(blob);
              }
              else {
                reject(
                  new Error(
                    "Unable to create image"
                  )
                );
              }

            },
            "image/png",
            1
          );

        }
      );

    }

    function downloadBlob(blob) {

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href =
        url;

      link.download =
        "onedreameach-dream-" +
        padded +
        ".png";

      document.body
        .appendChild(
          link
        );

      link.click();
      link.remove();

      setTimeout(
        function() {

          URL.revokeObjectURL(
            url
          );

        },
        1200
      );

    }

    async function getCardFile() {

      const blob =
        await buildCardBlob();

      return new File(
        [
          blob
        ],
        "onedreameach-dream-" +
        padded +
        ".png",
        {
          type:
            "image/png"
        }
      );

    }

    /*
     * DOWNLOAD
     */

    document
      .getElementById(
        "download-card"
      )
      ?.addEventListener(
        "click",
        async function() {

          try {

            setStatus(
              "Creating your Official Dream Card..."
            );

            const file =
              await getCardFile();

            downloadBlob(
              file
            );

            setStatus(
              "Dream Card ready."
            );

          }
          catch (error) {

            console.error(
              error
            );

            setStatus(
              "Unable to create the card right now."
            );

          }

        }
      );

    /*
     * SHARE
     */

    document
      .getElementById(
        "share-card"
      )
      ?.addEventListener(
        "click",
        async function() {

          try {

            setStatus(
              "Preparing your Dream Card..."
            );

            const file =
              await getCardFile();

            if (
              navigator.share &&
              navigator.canShare &&
              navigator.canShare({
                files:[
                  file
                ]
              })
            ) {

              await navigator.share({
                title:
                  "Dream #" +
                  padded +
                  " — OneDreamEach",

                text:
                  "One real person. One Dream. One permanent place.",

                files:[
                  file
                ]
              });

              setStatus(
                "Dream shared."
              );

            }
            else if (
              navigator.share
            ) {

              await navigator.share({
                title:
                  "Dream #" +
                  padded +
                  " — OneDreamEach",

                text:
                  "One real person. One Dream. One permanent place.",

                url:
                  dreamUrl
              });

              setStatus(
                "Dream page shared."
              );

            }
            else {

              downloadBlob(
                file
              );

              setStatus(
                "Dream Card downloaded — share it anywhere."
              );

            }

          }
          catch (error) {

            if (
              error &&
              error.name ===
              "AbortError"
            ) {

              setStatus("");

            }
            else {

              console.error(
                error
              );

              setStatus(
                "Unable to share right now."
              );

            }

          }

        }
      );

    /*
     * COPY LINK
     */

    document
      .getElementById(
        "copy-link"
      )
      ?.addEventListener(
        "click",
        async function() {

          try {

            await copyText(
              dreamUrl
            );

            setStatus(
              "Dream link copied."
            );

          }
          catch (error) {

            setStatus(
              "Unable to copy the link."
            );

          }

        }
      );

  })();

  </script>

</body>
</html>`;

    return htmlResponse(
      html,
      200
    );

  }
  catch (error) {

    console.error(
      "DREAM PAGE ERROR:",
      error
    );

    return htmlResponse(
      errorPage(
        "Unable to load this Dream.",
        "Please try again later."
      ),
      500
    );

  }

}


/*
 * =========================================================
 * HELPERS
 * =========================================================
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


function htmlResponse(
  html,
  status
) {

  return new Response(
    html,
    {
      status,

      headers:{
        "content-type":
          "text/html; charset=utf-8",

        "cache-control":
          "no-store",

        "x-content-type-options":
          "nosniff"
      }
    }
  );

}


function normalizeHandle(value) {

  return String(
    value || ""
  )
    .trim()
    .replace(
      /^@/,
      ""
    );

}


/*
 * SOCIALS
 */

function buildSocialHtml(
  instagram,
  tiktok
) {

  if (
    !instagram &&
    !tiktok
  ) {
    return "";
  }

  const links =
    [];

  if (instagram) {

    links.push(
      '<a class="social-link" href="https://instagram.com/' +
      encodeURIComponent(
        instagram
      ) +
      '" target="_blank" rel="noopener noreferrer">' +
      'INSTAGRAM &middot; @' +
      escapeHtml(
        instagram
      ) +
      '</a>'
    );

  }

  if (tiktok) {

    links.push(
      '<a class="social-link" href="https://tiktok.com/@' +
      encodeURIComponent(
        tiktok
      ) +
      '" target="_blank" rel="noopener noreferrer">' +
      'TIKTOK &middot; @' +
      escapeHtml(
        tiktok
      ) +
      '</a>'
    );

  }

  return (
    '<div class="socials">' +
      '<div class="social-label">' +
        'FIND THE DREAMER' +
      '</div>' +
      links.join("") +
    '</div>'
  );

}


/*
 * WORLD ELEMENTS
 */

function worldTab(
  type,
  kicker,
  label,
  href
) {

  return (
    '<a class="world-tab" href="' +
      href +
    '">' +

      '<span class="world-tab-icon">' +
        worldIcon(
          type
        ) +
      '</span>' +

      '<span class="world-tab-copy">' +
        '<small>' +
          kicker +
        '</small>' +
        '<b>' +
          label +
        '</b>' +
      '</span>' +

      '<em aria-hidden="true">&nearr;</em>' +

    '</a>'
  );

}


function worldChip(
  type,
  label
) {

  return (
    '<div class="world-chip ' +
      type +
    '">' +

      worldIcon(
        type
      ) +

      '<b>' +
        label +
      '</b>' +

    '</div>'
  );

}


function worldCard(
  type,
  kicker,
  label,
  description,
  href
) {

  return (
    '<a class="world-card" href="' +
      href +
    '">' +

      '<span class="world-card-icon">' +
        worldIcon(
          type
        ) +
      '</span>' +

      '<span>' +
        '<small>' +
          kicker +
        '</small>' +
        '<b>' +
          label +
        '</b>' +
        '<em>' +
          description +
        '</em>' +
      '</span>' +

      '<strong>&nearr;</strong>' +

    '</a>'
  );

}


/*
 * WORLD ICONS
 */

function worldIcon(type) {

  if (
    type ===
    "map"
  ) {

    return `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle
          cx="32"
          cy="32"
          r="23"
          fill="#0E2130"
          stroke="#6EDFF2"
          stroke-width="1.7"
        />
        <path
          d="M14 32h36
             M19 24.5c3.8 1.8 8.1 2.7 13 2.7s9.2-.9 13-2.7
             M19 39.5c3.8-1.8 8.1-2.7 13-2.7s9.2.9 13 2.7"
          stroke="#6EDFF2"
          stroke-opacity=".35"
          stroke-width="1.4"
          fill="none"
        />
        <path
          fill="#9BE8F4"
          d="M22 21l6 1 3 4-3 5-6 1-4-4z"
        />
        <path
          fill="#A6B8FF"
          d="M37 28l6-1 4 4-2 6-6 1-4-4z"
        />
      </svg>
    `;

  }

  if (
    type ===
    "wall"
  ) {

    return `
      <svg viewBox="0 0 64 64" aria-hidden="true">

        <rect
          x="11"
          y="15"
          width="42"
          height="34"
          rx="9"
          fill="#0A121B"
          stroke="#A98BFF"
          stroke-width="1.5"
        />

        <path
          d="M11 27h42
             M11 38h42
             M25 15v12
             M39 15v12
             M18 27v11
             M32 27v11
             M46 27v11"
          stroke="#A98BFF"
          stroke-opacity=".30"
        />

        <rect
          x="27"
          y="20"
          width="11"
          height="15"
          rx="2"
          fill="#F1E3C9"
          transform="rotate(-5 32 28)"
        />

      </svg>
    `;

  }

  if (
    type ===
    "chain"
  ) {

    return `
      <svg viewBox="0 0 64 64" aria-hidden="true">

        <path
          d="M23 40l-6 6a8.5 8.5 0 1 1-12-12l9-9a8.5 8.5 0 0 1 12 0"
          fill="none"
          stroke="#9BE7F4"
          stroke-width="5"
          stroke-linecap="round"
        />

        <path
          d="M41 24l6-6a8.5 8.5 0 1 1 12 12l-9 9a8.5 8.5 0 0 1-12 0"
          fill="none"
          stroke="#AEB0FF"
          stroke-width="5"
          stroke-linecap="round"
        />

        <path
          d="M23 41l18-18"
          stroke="#D6F9FF"
          stroke-width="2.8"
          stroke-linecap="round"
        />

      </svg>
    `;

  }

  return `
    <svg viewBox="0 0 64 64" aria-hidden="true">

      <path
        fill="#8EF03B"
        d="M25 10c0 4 3 7 7 7 .8 0 1.5-.1 2-.3v6.5h8c.8 0 1.3.5 1.3 1.3 0 .3-.1.6-.3.9-.8 1-1.3 2.2-1.3 3.6 0 3.2 2.6 5.8 5.8 5.8 1.4 0 2.6-.5 3.6-1.3.3-.2.6-.3.9-.3.8 0 1.3.5 1.3 1.3V42h-7c.2.6.3 1.3.3 2 0 4-3 7-7 7s-7-3-7-7c0-.7.1-1.4.3-2H25v-7.5c0-.8-.5-1.3-1.3-1.3-.3 0-.6.1-.9.3-1 .8-2.2 1.3-3.6 1.3-3.2 0-5.8-2.6-5.8-5.8 0-1.4.5-2.6 1.3-3.6.2-.3.3-.6.3-.9 0-.8-.5-1.3-1.3-1.3H10V15h8c-.2-.6-.3-1.3-.3-2 0-4 3-7 7-7z"
      />

    </svg>
  `;

}


/*
 * OTHER ICONS
 */

function rocketIcon() {

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">

      <path
        d="M14.8 4.2c2.6-.8 4.5-.5 5-.2.3.5.6 2.4-.2 5-1 3.2-3.4 5.4-6.1 7.1l-3.6-3.6c1.6-2.7 3.8-5.2 6.9-6.2Z"
        fill="#8fb5ff"
        stroke="#c5a8ff"
        stroke-width=".8"
      />

      <circle
        cx="16.5"
        cy="7.5"
        r="2"
        fill="#70e6ef"
      />

      <path
        d="m9.9 12.5-3.5.4-2.2 2.2 4.5.7M13.5 16.1l-.4 3.5-2.2 2.2-.7-4.5"
        fill="#7ce8ef"
        opacity=".9"
      />

      <path
        d="M8.3 16.6 5 20"
        stroke="#e78ed1"
        stroke-width="1.8"
        stroke-linecap="round"
      />

    </svg>
  `;

}


function heartIcon() {

  return `
    <svg
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 20s-7-4.3-8.7-8.1C1.8 8.7 3.5 5.5 6.7 5.1c2-.2 3.6.8 5.3 2.7 1.7-1.9 3.3-2.9 5.3-2.7 3.2.4 4.9 3.6 3.4 6.8C19 15.7 12 20 12 20Z"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linejoin="round"
      />
    </svg>
  `;

}


function shareIcon() {

  return `
    <svg
      viewBox="0 0 24 24"
      fill="none"
    >

      <path
        d="M8.5 12.5 15.8 7m-7.3 4.5 7.3 5.5"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />

      <circle
        cx="6"
        cy="12"
        r="2.6"
        stroke="currentColor"
        stroke-width="1.7"
      />

      <circle
        cx="18"
        cy="6"
        r="2.6"
        stroke="currentColor"
        stroke-width="1.7"
      />

      <circle
        cx="18"
        cy="18"
        r="2.6"
        stroke="currentColor"
        stroke-width="1.7"
      />

    </svg>
  `;

}


function downloadIcon() {

  return `
    <svg
      viewBox="0 0 24 24"
      fill="none"
    >

      <path
        d="M12 3v11m0 0 4-4m-4 4-4-4M5 17v3h14v-3"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

    </svg>
  `;

}


function linkIcon() {

  return `
    <svg
      viewBox="0 0 24 24"
      fill="none"
    >

      <path
        d="m9.5 14.5 5-5M7.8 16.2l-1.5 1.5a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0M16.2 7.8l1.5-1.5a3.5 3.5 0 1 1 5 5l-4 4a3.5 3.5 0 0 1-5 0"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />

    </svg>
  `;

}


/*
 * ERROR PAGE
 */

function errorPage(
  title,
  text
) {

  return `
    <!DOCTYPE html>

    <html lang="en">

    <head>

      <meta charset="UTF-8">

      <meta
        name="viewport"
        content="width=device-width,initial-scale=1"
      >

      <title>
        ${escapeHtml(title)} — OneDreamEach
      </title>

      <style>

        *{
          box-sizing:border-box;
        }

        body{
          min-height:100vh;
          margin:0;
          display:grid;
          place-items:center;
          background:
            radial-gradient(
              circle at 50% 10%,
              rgba(121,74,219,.18),
              transparent 35%
            ),
            #07101b;
          color:#eef2f7;
          font-family:Arial,sans-serif;
          text-align:center;
        }

        .box{
          width:min(520px,90%);
          padding:44px 28px;
          border:
            1px solid
            rgba(131,112,223,.25);
          border-radius:24px;
          background:
            rgba(8,10,18,.78);
        }

        h1{
          font-size:32px;
          margin:0;
        }

        p{
          margin:12px 0 0;
          color:#98a2b1;
          line-height:1.6;
        }

        a{
          display:inline-flex;
          margin-top:22px;
          padding:13px 18px;
          border:
            1px solid
            rgba(101,226,246,.28);
          border-radius:13px;
          color:#dffaff;
          text-decoration:none;
          font-weight:700;
          font-size:12px;
        }

      </style>

    </head>

    <body>

      <div class="box">

        <h1>
          ${escapeHtml(title)}
        </h1>

        <p>
          ${escapeHtml(text)}
        </p>

        <a href="/explore">
          RETURN TO THE DREAM WALL
        </a>

      </div>

    </body>

    </html>
  `;

}


/*
 * COUNTRY CODES
 */

function getCountryCode(country) {

  const key =
    String(
      country || ""
    )
      .trim()
      .toLowerCase();

  const codes = {

    "afghanistan":"AF",
    "albania":"AL",
    "algeria":"DZ",
    "andorra":"AD",
    "angola":"AO",
    "antigua and barbuda":"AG",
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
    "cabo verde":"CV",
    "central african republic":"CF",
    "chad":"TD",
    "chile":"CL",
    "china":"CN",
    "colombia":"CO",
    "comoros":"KM",
    "congo":"CG",
    "democratic republic of the congo":"CD",
    "dr congo":"CD",
    "costa rica":"CR",
    "croatia":"HR",
    "cuba":"CU",
    "cyprus":"CY",
    "czech republic":"CZ",
    "czechia":"CZ",
    "denmark":"DK",
    "djibouti":"DJ",
    "dominica":"DM",
    "dominican republic":"DO",
    "ecuador":"EC",
    "egypt":"EG",
    "el salvador":"SV",
    "equatorial guinea":"GQ",
    "eritrea":"ER",
    "estonia":"EE",
    "eswatini":"SZ",
    "swaziland":"SZ",
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
    "grenada":"GD",
    "guatemala":"GT",
    "guinea":"GN",
    "guinea-bissau":"GW",
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
    "cote d'ivoire":"CI",
    "jamaica":"JM",
    "japan":"JP",
    "jordan":"JO",
    "kazakhstan":"KZ",
    "kenya":"KE",
    "kiribati":"KI",
    "kuwait":"KW",
    "kyrgyzstan":"KG",
    "laos":"LA",
    "latvia":"LV",
    "lebanon":"LB",
    "lesotho":"LS",
    "liberia":"LR",
    "libya":"LY",
    "liechtenstein":"LI",
    "lithuania":"LT",
    "luxembourg":"LU",
    "madagascar":"MG",
    "malawi":"MW",
    "malaysia":"MY",
    "maldives":"MV",
    "mali":"ML",
    "malta":"MT",
    "marshall islands":"MH",
    "mauritania":"MR",
    "mauritius":"MU",
    "mexico":"MX",
    "micronesia":"FM",
    "moldova":"MD",
    "monaco":"MC",
    "mongolia":"MN",
    "montenegro":"ME",
    "morocco":"MA",
    "mozambique":"MZ",
    "myanmar":"MM",
    "namibia":"NA",
    "nauru":"NR",
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
    "palau":"PW",
    "palestine":"PS",
    "panama":"PA",
    "papua new guinea":"PG",
    "paraguay":"PY",
    "peru":"PE",
    "philippines":"PH",
    "poland":"PL",
    "portugal":"PT",
    "qatar":"QA",
    "romania":"RO",
    "russia":"RU",
    "rwanda":"RW",
    "saint kitts and nevis":"KN",
    "saint lucia":"LC",
    "saint vincent and the grenadines":"VC",
    "samoa":"WS",
    "san marino":"SM",
    "sao tome and principe":"ST",
    "saudi arabia":"SA",
    "senegal":"SN",
    "serbia":"RS",
    "seychelles":"SC",
    "sierra leone":"SL",
    "singapore":"SG",
    "slovakia":"SK",
    "slovenia":"SI",
    "solomon islands":"SB",
    "somalia":"SO",
    "south africa":"ZA",
    "south korea":"KR",
    "south sudan":"SS",
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
    "timor-leste":"TL",
    "east timor":"TL",
    "togo":"TG",
    "tonga":"TO",
    "trinidad and tobago":"TT",
    "tunisia":"TN",
    "turkey":"TR",
    "türkiye":"TR",
    "turkmenistan":"TM",
    "tuvalu":"TV",
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
    "vanuatu":"VU",
    "vatican city":"VA",
    "venezuela":"VE",
    "vietnam":"VN",
    "yemen":"YE",
    "zambia":"ZM",
    "zimbabwe":"ZW"

  };

  return (
    codes[key] ||
    ""
  );

}



          
