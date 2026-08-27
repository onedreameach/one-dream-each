/*
 * OneDreamEach â€” Permanent Dream Page / Unified Official Dream Card
 * Cloudflare Worker module
 *
 * Route target: /dream/:number
 * Expected call: handleDreamPage(request, env, dreamNumber)
 *
 * The visual card is intentionally self-contained under .ode-card-* classes
 * so the same component can later be lifted into Map / Wall / Chain / Puzzle.
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
      "&dream_number=eq." +
      encodeURIComponent(dreamNumber) +
      "&limit=1";

    const dbResponse = await fetch(apiUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: "Bearer " + supabaseKey
      }
    });

    const raw = await dbResponse.text();

    if (!dbResponse.ok) {
      throw new Error("Supabase request failed: " + raw);
    }

    const rows = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(rows) || !rows.length) {
      return htmlResponse(errorPage("Dream not found.", "This permanent place does not seem to exist."), 404);
    }

    const dream = rows[0];

    const escapeHtml = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");

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
    const title = "Dream #" + padded + " â€” OneDreamEach";
    const description = (dreamText || "One real person. One Dream. One permanent place.")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);

    const authorSocialHtml = buildSocialHtml(instagram, tiktok);
    const famousNote = number === 12
      ? '<div class="ode-famous-note"><b>UNOFFICIAL TRIBUTE DREAM</b><span>Based on public statements. No affiliation or endorsement is implied.</span></div>'
      : "";

    const flagHtml = flagUrl
      ? '<img class="ode-card-flag" src="' + escapeHtml(flagUrl) + '" alt="" width="72" height="48">'
      : '<span class="ode-card-world">â—Ž</span>';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#05070b">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="OneDreamEach">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:image" content="${escapeHtml(ogImageUrl)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}">

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,600&family=Inter:wght@500;600;700;800&family=Oxanium:wght@600;700;800&display=swap');

    :root{
      --page:#05070b;
      --panel:#0a0d16;
      --text:#f6f7fb;
      --muted:#9aa4b4;
      --cyan:#67e9ff;
      --cyan2:#36c9f0;
      --violet:#8c7cff;
      --pink:#e27ae9;
      --line:rgba(255,255,255,.10);
      --card-display:"Oxanium",Impact,"Arial Narrow Bold",sans-serif;
      --card-serif:"Bodoni Moda",Georgia,"Times New Roman",serif;
      --ui:"Inter",Arial,sans-serif;
    }

    *{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{
      min-height:100vh;
      overflow-x:hidden;
      background:
        radial-gradient(circle at 12% 10%,rgba(43,210,238,.12),transparent 26%),
        radial-gradient(circle at 90% 18%,rgba(184,91,235,.14),transparent 31%),
        linear-gradient(180deg,#04060a,#070914 55%,#05070b);
      color:var(--text);
      font-family:var(--ui);
    }
    body:before{
      content:"";position:fixed;inset:0;pointer-events:none;opacity:.22;z-index:-1;
      background-image:linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px);
      background-size:46px 46px;
      mask-image:linear-gradient(to bottom,black,transparent 76%);
    }

    a{color:inherit}
    button{font:inherit}
    .ode-shell{width:min(1040px,92%);margin:auto;padding:26px 0 80px}

    .ode-nav{min-height:82px;display:flex;align-items:center;justify-content:space-between;gap:18px}
    .ode-brand{display:inline-flex;align-items:center;text-decoration:none}
    .ode-brand img{width:220px;max-width:46vw;height:68px;object-fit:contain;object-position:left center;filter:drop-shadow(0 0 18px rgba(123,204,255,.12))}
    .ode-back{min-height:46px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(128,216,238,.24);border-radius:14px;background:rgba(7,12,20,.62);text-decoration:none;font-size:10px;font-weight:800;letter-spacing:.16em;color:#d9f7ff}

    .ode-hero{text-align:center;padding:42px 0 30px}
    .ode-kicker{display:inline-flex;align-items:center;gap:9px;padding:9px 15px;border:1px solid rgba(171,116,248,.33);border-radius:999px;background:rgba(17,12,32,.56);font-size:9px;font-weight:800;letter-spacing:.23em;color:#d9d2e9}
    .ode-kicker i{width:8px;height:8px;border-radius:50%;background:var(--cyan);box-shadow:0 0 18px var(--cyan)}
    .ode-hero h1{margin-top:24px;font-family:var(--card-display);font-size:clamp(42px,8vw,76px);line-height:.98;letter-spacing:-.055em;text-transform:uppercase}
    .ode-hero h1 span{background:linear-gradient(90deg,var(--cyan),#a8b3ff 54%,var(--pink));-webkit-background-clip:text;color:transparent}
    .ode-hero p{max-width:620px;margin:14px auto 0;color:#a9b2c1;font-size:15px;line-height:1.6}

    /* =========================================================
       REUSABLE OFFICIAL DREAM CARD
       Keep this block portable to all four worlds.
       ========================================================= */
    .ode-card-wrap{width:min(820px,100%);margin:0 auto;position:relative}
    .ode-card-wrap:before{content:"";position:absolute;inset:-18px;border-radius:42px;background:radial-gradient(circle at 0 10%,rgba(79,225,255,.13),transparent 34%),radial-gradient(circle at 100% 88%,rgba(218,92,240,.15),transparent 39%);filter:blur(22px);pointer-events:none}

    .ode-card{
      position:relative;overflow:hidden;isolation:isolate;
      padding:0 28px 26px;
      border:1px solid rgba(154,126,255,.48);
      border-radius:32px;
      background:
        radial-gradient(circle at 2% 0%,rgba(40,209,239,.18),transparent 33%),
        radial-gradient(circle at 100% 8%,rgba(198,76,226,.22),transparent 37%),
        radial-gradient(circle at 70% 68%,rgba(89,64,182,.16),transparent 33%),
        linear-gradient(145deg,rgba(5,20,31,.98),rgba(15,10,32,.98) 72%,rgba(22,10,37,.98));
      box-shadow:0 38px 100px rgba(0,0,0,.48),0 0 0 1px rgba(101,227,255,.10),inset 0 1px 0 rgba(255,255,255,.08);
    }
    .ode-card:before{content:"";position:absolute;inset:0;z-index:-2;border-radius:inherit;background:linear-gradient(115deg,rgba(101,235,255,.72),transparent 18%,transparent 76%,rgba(224,104,239,.78));padding:1px;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;pointer-events:none}
    .ode-card:after{content:"";position:absolute;right:-165px;top:180px;width:500px;height:500px;border-radius:50%;z-index:-1;background:radial-gradient(circle,rgba(117,70,225,.22),rgba(93,43,160,.10) 45%,transparent 70%);border:1px solid rgba(166,125,255,.10);box-shadow:inset 0 0 0 54px rgba(122,80,220,.025),inset 0 0 0 110px rgba(76,217,243,.018);pointer-events:none}

    .ode-card-head{min-height:72px;margin:0 -28px;padding:0 28px;display:flex;align-items:center;justify-content:space-between;gap:18px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(90deg,rgba(30,171,198,.08),rgba(126,53,182,.13))}
    .ode-card-head span{display:flex;align-items:center;gap:9px;font-family:var(--card-display);font-size:10px;font-weight:700;letter-spacing:.22em;color:#b7f5ff}
    .ode-card-head span i{width:8px;height:8px;border-radius:50%;background:var(--cyan);box-shadow:0 0 16px var(--cyan)}
    .ode-card-head b{font-family:var(--card-display);font-size:9px;letter-spacing:.20em;color:#edb7f3}

    .ode-card-meta{display:grid;grid-template-columns:1fr auto;gap:22px;align-items:center;padding:30px 0 18px}
    .ode-card-number small{display:block;font-family:var(--card-display);font-size:9px;font-weight:700;letter-spacing:.24em;color:#76dff0}
    .ode-card-number strong{display:block;margin-top:8px;font-family:var(--card-display);font-size:clamp(31px,6vw,52px);line-height:.92;letter-spacing:-.04em;font-weight:800;font-style:italic;background:linear-gradient(90deg,#7cf1ff,#9eb3ff 55%,#e283ec);-webkit-background-clip:text;color:transparent;text-shadow:0 8px 26px rgba(56,204,238,.08)}

    .ode-card-country{min-width:250px;max-width:320px;padding:11px 15px 11px 11px;display:grid;grid-template-columns:74px 1fr;align-items:center;gap:12px;border:1px solid rgba(174,104,238,.36);border-radius:22px;background:linear-gradient(135deg,rgba(17,16,38,.85),rgba(55,22,74,.76));box-shadow:0 12px 28px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.06)}
    .ode-card-flag{width:72px;height:48px;display:block;object-fit:cover;border-radius:13px;box-shadow:0 7px 16px rgba(0,0,0,.32)}
    .ode-card-world{width:72px;height:48px;display:grid;place-items:center;border-radius:13px;background:rgba(99,226,246,.08);font-size:26px;color:#79eaff}
    .ode-card-country small{display:block;font-family:var(--card-display);font-size:8px;font-weight:700;letter-spacing:.20em;color:#a7a1c6}
    .ode-card-country b{display:block;margin-top:5px;font-family:var(--card-display);font-size:11px;line-height:1.35;letter-spacing:.11em;text-transform:uppercase;color:#fff;word-break:break-word}

    .ode-card-quote{position:relative;min-height:310px;padding:38px 26px 44px 58px;display:flex;align-items:center;border-bottom:1px solid rgba(255,255,255,.08)}
    .ode-card-quote:before,.ode-card-quote:after{position:absolute;font-family:Georgia,serif;font-weight:700;line-height:1;background:linear-gradient(180deg,#5ebef0,#a34ee0);-webkit-background-clip:text;color:transparent;opacity:.68}
    .ode-card-quote:before{content:"â€œ";left:0;top:28px;font-size:70px}
    .ode-card-quote:after{content:"â€";right:14px;bottom:12px;font-size:82px}
    .ode-card-quote p{max-width:650px;font-family:var(--card-serif);font-size:clamp(30px,5vw,48px);font-weight:500;line-height:1.13;letter-spacing:-.035em;color:#f7f4fb;text-wrap:balance;text-shadow:0 5px 22px rgba(0,0,0,.42)}

    .ode-card-person{padding:22px 0 18px;display:flex;align-items:end;justify-content:space-between;gap:24px}
    .ode-card-person small{display:block;font-family:var(--card-display);font-size:8px;font-weight:700;letter-spacing:.24em;color:#7f9fb1}
    .ode-card-person strong{display:block;margin-top:7px;font-family:var(--card-display);font-size:16px;letter-spacing:.06em;color:#fff}
    .ode-card-status{text-align:right}
    .ode-card-status strong{font-size:15px;letter-spacing:.06em}

    .ode-card-worlds{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;padding:11px;border:1px solid rgba(143,109,225,.15);border-radius:20px;background:rgba(3,7,14,.42)}
    .ode-world{min-height:66px;display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid rgba(129,188,226,.18);border-radius:15px;background:linear-gradient(145deg,rgba(11,22,34,.86),rgba(17,12,32,.84));text-decoration:none;transition:.22s ease}
    .ode-world i{font-style:normal;font-size:20px;filter:drop-shadow(0 0 8px rgba(111,226,255,.22))}
    .ode-world b{font-family:var(--card-display);font-size:9px;letter-spacing:.13em;color:#e9ecf5}
    .ode-world:hover{transform:translateY(-2px);border-color:rgba(123,229,250,.48);box-shadow:0 10px 22px rgba(0,0,0,.25),0 0 20px rgba(124,83,226,.09)}

    .ode-card-foot{margin-top:12px;min-height:50px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(143,111,226,.16);border-radius:16px;background:linear-gradient(90deg,rgba(47,196,224,.05),rgba(180,73,214,.10));font-family:var(--card-display);font-size:9px;font-weight:700;letter-spacing:.22em;color:#d8aef0;text-align:center}

    .ode-memory-row{width:min(820px,100%);margin:16px auto 0;display:grid;grid-template-columns:1fr 1fr;gap:11px}
    .ode-memory,.ode-open-share{min-height:58px;border-radius:17px;border:1px solid rgba(113,211,235,.22);background:rgba(6,13,23,.72);color:#edf8fb;cursor:pointer;font-family:var(--card-display);font-size:10px;font-weight:700;letter-spacing:.10em;transition:.2s ease}
    .ode-memory.active{border-color:rgba(225,127,221,.58);background:linear-gradient(115deg,rgba(96,43,120,.72),rgba(29,82,91,.56));box-shadow:0 0 28px rgba(222,103,206,.12)}
    .ode-memory:hover,.ode-open-share:hover{transform:translateY(-2px)}

    .ode-actions{width:min(820px,100%);margin:22px auto 0;padding:20px;border:1px solid rgba(139,111,220,.20);border-radius:24px;background:linear-gradient(145deg,rgba(8,15,25,.84),rgba(15,9,29,.82));box-shadow:0 20px 56px rgba(0,0,0,.22)}
    .ode-actions-title{text-align:center;font-family:var(--card-display);font-size:9px;font-weight:700;letter-spacing:.24em;color:#96a7bb}
    .ode-share-grid{margin-top:14px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
    .ode-action{min-height:72px;padding:10px 12px;border:1px solid rgba(104,218,240,.28);border-radius:17px;background:linear-gradient(145deg,rgba(5,26,36,.82),rgba(16,10,35,.84));color:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;transition:.2s ease}
    .ode-action.purple{border-color:rgba(211,100,233,.34)}
    .ode-action i{font-style:normal;font-size:22px;color:#70e9ff}
    .ode-action.purple i{color:#ef91f5}
    .ode-action b{font-family:var(--card-display);font-size:9px;letter-spacing:.14em}
    .ode-action:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,0,0,.28)}
    .ode-share-status{min-height:20px;margin-top:12px;text-align:center;color:#90a2b4;font-size:11px}

    .ode-socials{width:min(820px,100%);margin:16px auto 0;display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap}
    .ode-socials-label{width:100%;text-align:center;font-family:var(--card-display);font-size:8px;letter-spacing:.2em;color:#718496}
    .ode-social{min-height:40px;padding:0 14px;display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(255,255,255,.025);text-decoration:none;font-size:10px;font-weight:700;color:#cdd6df}

    .ode-famous-note{width:min(820px,100%);margin:16px auto 0;padding:13px 15px;border:1px solid rgba(255,205,107,.18);border-radius:15px;background:rgba(64,42,13,.16);color:#c7b386;font-size:9px;line-height:1.55;text-align:center}
    .ode-famous-note b{display:block;color:#e9cc8d;letter-spacing:.14em}

    .ode-cta{width:min(820px,100%);margin:26px auto 0;padding:34px 24px;border:1px solid rgba(135,111,221,.20);border-radius:26px;text-align:center;background:radial-gradient(circle at 50% 0,rgba(131,68,205,.17),transparent 48%),rgba(9,10,17,.66)}
    .ode-cta small{font-family:var(--card-display);font-size:8px;font-weight:700;letter-spacing:.22em;color:#7ecfe0}
    .ode-cta h2{margin-top:10px;font-family:var(--ui);font-size:clamp(27px,5vw,42px);letter-spacing:-.04em}
    .ode-cta h2 span{background:linear-gradient(90deg,var(--cyan),#b296f0,var(--pink));-webkit-background-clip:text;color:transparent}
    .ode-cta p{max-width:510px;margin:12px auto 0;color:#95a1b0;font-size:13px;line-height:1.65}
    .ode-claim{min-height:56px;margin-top:19px;padding:0 24px;display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(117,229,249,.35);border-radius:16px;background:linear-gradient(105deg,#1aa7bd,#6e46cf 54%,#b54ac3);text-decoration:none;font-family:var(--card-display);font-size:10px;font-weight:800;letter-spacing:.11em;box-shadow:0 12px 35px rgba(91,75,218,.22)}

    .ode-toast{position:fixed;left:50%;bottom:26px;z-index:50;transform:translate(-50%,18px);opacity:0;pointer-events:none;padding:11px 16px;border:1px solid rgba(117,222,241,.28);border-radius:999px;background:rgba(6,12,21,.94);box-shadow:0 16px 42px rgba(0,0,0,.42);color:#eaf9fc;font-size:11px;font-weight:700;transition:.22s ease}
    .ode-toast.show{opacity:1;transform:translate(-50%,0)}

    @media(max-width:720px){
      .ode-shell{width:94%;padding-top:12px}
      .ode-nav{min-height:68px}
      .ode-brand img{width:164px;height:58px}
      .ode-back{min-height:40px;padding:0 11px;font-size:8px}
      .ode-hero{padding:28px 0 22px}
      .ode-hero h1{font-size:clamp(38px,12vw,58px)}
      .ode-hero p{font-size:13px}
      .ode-card{padding:0 17px 18px;border-radius:25px}
      .ode-card-head{min-height:60px;margin:0 -17px;padding:0 17px}
      .ode-card-head span,.ode-card-head b{font-size:7px;letter-spacing:.16em}
      .ode-card-meta{grid-template-columns:1fr;gap:15px;padding:22px 0 12px}
      .ode-card-number strong{font-size:clamp(32px,11vw,46px)}
      .ode-card-country{min-width:0;width:100%;max-width:none;grid-template-columns:58px 1fr;border-radius:17px}
      .ode-card-flag,.ode-card-world{width:58px;height:39px;border-radius:11px}
      .ode-card-quote{min-height:270px;padding:34px 22px 38px 39px}
      .ode-card-quote:before{left:-3px;font-size:54px}.ode-card-quote:after{right:6px;font-size:66px}
      .ode-card-quote p{font-size:clamp(28px,8.4vw,38px);line-height:1.12}
      .ode-card-person{padding:19px 0 15px;gap:14px}
      .ode-card-person strong{font-size:13px}.ode-card-status strong{font-size:12px}
      .ode-card-worlds{grid-template-columns:repeat(2,1fr)}
      .ode-world{min-height:58px}
      .ode-memory-row{grid-template-columns:1fr}
      .ode-share-grid{grid-template-columns:1fr}
      .ode-action{min-height:60px;flex-direction:row}
    }
    @media(max-width:390px){
      .ode-card-quote p{font-size:27px}
      .ode-card-country b{font-size:10px}
      .ode-card-worlds{gap:7px;padding:8px}
      .ode-world b{font-size:8px}
    }
    @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
  </style>
</head>
<body>
  <div class="ode-shell">
    <nav class="ode-nav">
      <a class="ode-brand" href="/" aria-label="OneDreamEach home"><img src="/logo.png" alt="OneDreamEach"></a>
      <a class="ode-back" href="/explore">â† DREAM WALL</a>
    </nav>

    <header class="ode-hero">
      <div class="ode-kicker"><i></i> PERMANENT DREAM PAGE</div>
      <h1>DREAM <span>#${padded}</span></h1>
      <p>One real person. One Dream. One permanent place across all four worlds.</p>
    </header>

    <main>
      <div class="ode-card-wrap">
        <article class="ode-card" id="official-dream-card" data-dream-number="${number}">
          <header class="ode-card-head">
            <span><i></i> OFFICIAL DREAM CARD</span>
            <b>READY TO SHARE</b>
          </header>

          <section class="ode-card-meta">
            <div class="ode-card-number">
              <small>PERMANENT NUMBER</small>
              <strong>DREAM #${padded}</strong>
            </div>
            <div class="ode-card-country">
              ${flagHtml}
              <div><small>FROM</small><b>${safeCountry}</b></div>
            </div>
          </section>

          <section class="ode-card-quote"><p>${safeDream}</p></section>

          <section class="ode-card-person">
            <div><small>DREAMED BY</small><strong>${safeNickname}</strong></div>
            <div class="ode-card-status"><small>STATUS</small><strong>PERMANENT Â· PUBLIC</strong></div>
          </section>

          <nav class="ode-card-worlds" aria-label="Dream worlds">
            <a class="ode-world" href="/world-dream-map.html"><i>â—‰</i><b>MAP</b></a>
            <a class="ode-world" href="/explore"><i>â–¦</i><b>WALL</b></a>
            <a class="ode-world" href="/#dream-chain-home"><i>â›“</i><b>CHAIN</b></a>
            <a class="ode-world" href="/#dream-puzzle-home"><i>âœš</i><b>PUZZLE</b></a>
          </nav>

          <div class="ode-card-foot">âœ¦ ONE CARD Â· FOUR WORLDS Â· ONE PERMANENT PLACE</div>
        </article>
      </div>

      <div class="ode-memory-row">
        <button type="button" id="stayed-btn" class="ode-memory">â™¡ STAYED WITH ME</button>
        <button type="button" id="share-card-shortcut" class="ode-open-share">â†— SEND THIS DREAM FURTHER</button>
      </div>

      ${authorSocialHtml}
      ${famousNote}

      <section class="ode-actions" id="share-actions">
        <div class="ode-actions-title">SHARE THIS DREAM</div>
        <div class="ode-share-grid">
          <button type="button" class="ode-action" id="share-card"><i>â†—</i><b>SHARE CARD</b></button>
          <button type="button" class="ode-action" id="download-card"><i>â†“</i><b>DOWNLOAD 9:16</b></button>
          <button type="button" class="ode-action purple" id="copy-link"><i>â›“</i><b>COPY DREAM LINK</b></button>
        </div>
        <div class="ode-share-status" id="share-status">The downloadable card uses this same Official Dream Card identity.</div>
      </section>

      <section class="ode-cta">
        <small>ONE MILLION PEOPLE Â· ONE DREAM EACH</small>
        <h2>This Dream has a place.<br><span>What about yours?</span></h2>
        <p>Leave one Dream, receive your own permanent number, public Dream Page and shareable Official Dream Card.</p>
        <a class="ode-claim" href="/#leave">LEAVE YOUR DREAM â€” â‚¬1</a>
      </section>
    </main>
  </div>

  <div class="ode-toast" id="toast" role="status" aria-live="polite"></div>

  <script>
    (function(){
      "use strict";

      var DREAM = ${JSON.stringify({
        dream_number: number,
        nickname,
        dream_text: dreamText,
        country,
        instagram,
        tiktok,
        country_code: countryCode,
        canonical_url: canonicalUrl
      })};

      var padded = String(DREAM.dream_number || 0).padStart(6, "0");
      var status = document.getElementById("share-status");
      var toast = document.getElementById("toast");
      var stayedBtn = document.getElementById("stayed-btn");
      var toastTimer = 0;

      function showToast(message){
        if(!toast) return;
        toast.textContent = message;
        toast.classList.remove("show");
        void toast.offsetWidth;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function(){ toast.classList.remove("show"); }, 1900);
      }

      function setStatus(message){
        if(status) status.textContent = message;
      }

      function stayedKey(){ return "ode-wall-stayed-" + Number(DREAM.dream_number || 0); }
      function stayedDataKey(){ return "ode-wall-stayed-data-" + Number(DREAM.dream_number || 0); }

      function syncStayed(){
        var active = false;
        try{ active = localStorage.getItem(stayedKey()) === "1"; }catch(e){}
        if(stayedBtn){
          stayedBtn.classList.toggle("active", active);
          stayedBtn.textContent = active ? "â™¥ IT STAYED WITH ME" : "â™¡ STAYED WITH ME";
          stayedBtn.setAttribute("aria-pressed", active ? "true" : "false");
        }
      }

      if(stayedBtn){
        stayedBtn.addEventListener("click", function(){
          var next = true;
          try{
            next = localStorage.getItem(stayedKey()) !== "1";
            localStorage.setItem(stayedKey(), next ? "1" : "0");
            if(next){
              localStorage.setItem(stayedDataKey(), JSON.stringify({
                dream_number: DREAM.dream_number,
                nickname: DREAM.nickname,
                dream_text: DREAM.dream_text,
                country: DREAM.country
              }));
            }else{
              localStorage.removeItem(stayedDataKey());
            }
          }catch(e){}
          syncStayed();
          showToast(next ? "This Dream stayed with you â™¥" : "Removed from your Wall Memory");
        });
      }
      syncStayed();

      function roundRect(ctx,x,y,w,h,r){
        var rr = Math.min(r,w/2,h/2);
        ctx.beginPath();
        ctx.moveTo(x+rr,y);
        ctx.arcTo(x+w,y,x+w,y+h,rr);
        ctx.arcTo(x+w,y+h,x,y+h,rr);
        ctx.arcTo(x,y+h,x,y,rr);
        ctx.arcTo(x,y,x+w,y,rr);
        ctx.closePath();
      }

      function letterText(ctx,text,x,y,spacing,align){
        var chars = Array.from(String(text || ""));
        var widths = chars.map(function(c){ return ctx.measureText(c).width; });
        var total = widths.reduce(function(a,b){ return a+b; },0) + Math.max(0,chars.length-1)*spacing;
        var cursor = x;
        if(align === "center") cursor = x-total/2;
        if(align === "right") cursor = x-total;
        chars.forEach(function(c,i){ctx.fillText(c,cursor,y);cursor += widths[i]+spacing;});
      }

      async function ensureCardFonts(){
        if(!document.fonts) return;
        try{
          await Promise.all([
            document.fonts.load('800 70px "Oxanium"'),
            document.fonts.load('600 70px "Bodoni Moda"'),
            document.fonts.ready
          ]);
        }catch(e){}
      }

      function fitDream(ctx,text,maxWidth,maxLines){
        var clean = String(text || "").replace(/\s+/g," ").trim();
        for(var size=80; size>=42; size-=2){
          ctx.font = '600 ' + size + 'px "Bodoni Moda", Georgia, serif';
          var words = clean.split(" ");
          var lines=[]; var line="";
          words.forEach(function(word){
            var test = line ? line + " " + word : word;
            if(line && ctx.measureText(test).width > maxWidth){ lines.push(line); line=word; }
            else line=test;
          });
          if(line) lines.push(line);
          if(lines.length <= maxLines) return {size:size,lines:lines,lineHeight:Math.round(size*1.13)};
        }
        ctx.font = '600 40px "Bodoni Moda", Georgia, serif';
        var words2 = clean.split(" "); var lines2=[]; var line2="";
        words2.forEach(function(word){
          var test2=line2?line2+" "+word:word;
          if(line2 && ctx.measureText(test2).width>maxWidth){lines2.push(line2);line2=word}else line2=test2;
        });
        if(line2) lines2.push(line2);
        return {size:40,lines:lines2.slice(0,maxLines),lineHeight:46};
      }

      function loadImage(src){
        return new Promise(function(resolve,reject){
          var img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = function(){resolve(img)};
          img.onerror = function(){reject(new Error("image load failed"))};
          img.src = src;
        });
      }

      async function buildCardBlob(){
        await ensureCardFonts();
        var canvas=document.createElement("canvas");
        canvas.width=1080;canvas.height=1920;
        var ctx=canvas.getContext("2d",{alpha:false});
        if(!ctx) throw new Error("Canvas unavailable");

        var bg=ctx.createLinearGradient(0,0,1080,1920);
        bg.addColorStop(0,"#03111a");bg.addColorStop(.52,"#090c1b");bg.addColorStop(1,"#12071b");
        ctx.fillStyle=bg;ctx.fillRect(0,0,1080,1920);

        var cyan=ctx.createRadialGradient(80,150,0,80,150,520);cyan.addColorStop(0,"rgba(59,225,255,.26)");cyan.addColorStop(1,"rgba(59,225,255,0)");ctx.fillStyle=cyan;ctx.fillRect(0,0,1080,900);
        var violet=ctx.createRadialGradient(1010,450,0,1010,450,620);violet.addColorStop(0,"rgba(201,74,235,.27)");violet.addColorStop(1,"rgba(201,74,235,0)");ctx.fillStyle=violet;ctx.fillRect(300,0,780,1150);

        roundRect(ctx,64,64,952,1792,42);ctx.fillStyle="rgba(5,8,18,.70)";ctx.fill();ctx.lineWidth=3;var stroke=ctx.createLinearGradient(64,64,1016,1856);stroke.addColorStop(0,"#5eeaff");stroke.addColorStop(.48,"#746fff");stroke.addColorStop(1,"#e16ee8");ctx.strokeStyle=stroke;ctx.stroke();

        ctx.fillStyle="#7feeff";ctx.font='700 24px "Oxanium",sans-serif';letterText(ctx,"OFFICIAL DREAM CARD",112,138,5,"left");
        ctx.textAlign="right";ctx.fillStyle="#e9aaf1";ctx.font='700 21px "Oxanium",sans-serif';letterText(ctx,"READY TO SHARE",958,138,5,"right");
        ctx.strokeStyle="rgba(255,255,255,.10)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(92,180);ctx.lineTo(988,180);ctx.stroke();

        ctx.textAlign="left";ctx.fillStyle="#70dff1";ctx.font='700 19px "Oxanium",sans-serif';letterText(ctx,"PERMANENT NUMBER",100,260,4,"left");
        var numGrad=ctx.createLinearGradient(100,280,690,390);numGrad.addColorStop(0,"#78eeff");numGrad.addColorStop(.55,"#9da7ff");numGrad.addColorStop(1,"#e180eb");ctx.fillStyle=numGrad;ctx.font='italic 800 74px "Oxanium",Impact,sans-serif';ctx.fillText("DREAM #"+padded,100,350,700);

        if(DREAM.country_code){
          try{
            var flag=await loadImage("https://flagcdn.com/w320/"+String(DREAM.country_code).toLowerCase()+".png");
            roundRect(ctx,735,232,215,116,26);ctx.save();ctx.clip();ctx.drawImage(flag,735,232,215,116);ctx.restore();
          }catch(e){}
        }
        ctx.textAlign="right";ctx.fillStyle="#a7a7c6";ctx.font='700 16px "Oxanium",sans-serif';letterText(ctx,"FROM",958,390,4,"right");ctx.fillStyle="#fff";ctx.font='700 24px "Oxanium",sans-serif';ctx.fillText(String(DREAM.country||"WORLD").toUpperCase(),958,428,410);

        ctx.textAlign="left";ctx.fillStyle="rgba(114,102,236,.55)";ctx.font='600 130px Georgia,serif';ctx.fillText("â€œ",94,585);
        var fitted=fitDream(ctx,DREAM.dream_text,820,8);ctx.font='600 '+fitted.size+'px "Bodoni Moda",Georgia,serif';ctx.fillStyle="#f7f4fb";ctx.shadowColor="rgba(0,0,0,.55)";ctx.shadowBlur=18;var totalH=fitted.lines.length*fitted.lineHeight;var y=590+Math.max(0,(600-totalH)/2)+fitted.size;fitted.lines.forEach(function(line){ctx.fillText(line,130,y,820);y+=fitted.lineHeight});ctx.shadowColor="transparent";
        ctx.textAlign="right";ctx.fillStyle="rgba(182,88,231,.72)";ctx.font='600 130px Georgia,serif';ctx.fillText("â€",950,1180);

        ctx.strokeStyle="rgba(255,255,255,.10)";ctx.beginPath();ctx.moveTo(96,1260);ctx.lineTo(984,1260);ctx.stroke();
        ctx.textAlign="left";ctx.fillStyle="#8298a9";ctx.font='700 17px "Oxanium",sans-serif';letterText(ctx,"DREAMED BY",100,1320,4,"left");ctx.fillStyle="#fff";ctx.font='700 34px "Oxanium",sans-serif';ctx.fillText(String(DREAM.nickname||"Anonymous").toUpperCase(),100,1370,480);
        ctx.textAlign="right";ctx.fillStyle="#8298a9";ctx.font='700 17px "Oxanium",sans-serif';letterText(ctx,"STATUS",960,1320,4,"right");ctx.fillStyle="#fff";ctx.font='700 28px "Oxanium",sans-serif';ctx.fillText("PERMANENT Â· PUBLIC",960,1370);

        var labels=["MAP","WALL","CHAIN","PUZZLE"];var icons=["â—‰","â–¦","â›“","âœš"];for(var i=0;i<4;i++){var x=98+i*224;roundRect(ctx,x,1432,202,112,22);ctx.fillStyle="rgba(8,16,29,.76)";ctx.fill();ctx.strokeStyle=i===0?"rgba(82,226,255,.52)":"rgba(178,102,239,.35)";ctx.stroke();ctx.textAlign="center";ctx.fillStyle=i===0?"#6eeaff":"#bf8dff";ctx.font='700 34px "Oxanium",sans-serif';ctx.fillText(icons[i],x+101,1478);ctx.fillStyle="#edf1f7";ctx.font='700 18px "Oxanium",sans-serif';letterText(ctx,labels[i],x+101,1518,3,"center")}

        roundRect(ctx,98,1582,864,82,24);var foot=ctx.createLinearGradient(98,0,962,0);foot.addColorStop(0,"rgba(58,213,241,.12)");foot.addColorStop(1,"rgba(206,82,229,.16)");ctx.fillStyle=foot;ctx.fill();ctx.textAlign="center";ctx.fillStyle="#d5a7ef";ctx.font='700 18px "Oxanium",sans-serif';letterText(ctx,"ONE CARD Â· FOUR WORLDS Â· ONE PERMANENT PLACE",530,1632,3,"center");

        ctx.fillStyle="#6edff2";ctx.font='700 18px "Oxanium",sans-serif';letterText(ctx,"ONEDREAMEACH.COM",540,1772,5,"center");ctx.fillStyle="#7f8494";ctx.font='600 16px "Oxanium",sans-serif';letterText(ctx,"ONE REAL PERSON Â· ONE DREAM",540,1810,3,"center");

        return await new Promise(function(resolve,reject){canvas.toBlob(function(blob){blob?resolve(blob):reject(new Error("Card encoding failed"))},"image/png",1)});
      }

      async function cardFile(){
        var blob=await buildCardBlob();
        return new File([blob],"onedreameach-dream-"+padded+".png",{type:"image/png"});
      }

      function downloadFile(file){
        var url=URL.createObjectURL(file);var a=document.createElement("a");a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},1200);
      }

      async function shareCard(){
        try{
          setStatus("Creating the Official Dream Card...");
          var file=await cardFile();
          if(navigator.share && navigator.canShare && navigator.canShare({files:[file]})){
            await navigator.share({title:"Dream #"+padded+" â€” OneDreamEach",text:"One real person. One Dream. One permanent place.",files:[file],url:DREAM.canonical_url});
            setStatus("Dream Card ready to travel.");
          }else{
            downloadFile(file);setStatus("Dream Card downloaded â€” share it anywhere.");
          }
        }catch(error){console.error(error);setStatus("Unable to create the Dream Card right now.");}
      }

      async function downloadCard(){
        try{setStatus("Creating your 9:16 Dream Card...");var file=await cardFile();downloadFile(file);setStatus("Dream Card downloaded.");showToast("9:16 Dream Card ready âœ¦");}catch(error){console.error(error);setStatus("Unable to download the Dream Card right now.");}
      }

      async function copyLink(){
        try{
          if(navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(DREAM.canonical_url);
          else{
            var ta=document.createElement("textarea");ta.value=DREAM.canonical_url;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.focus();ta.select();document.execCommand("copy");ta.remove();
          }
          setStatus("Permanent Dream link copied.");showToast("Dream link copied â›“");
        }catch(error){setStatus("Unable to copy the link.");}
      }

      document.getElementById("share-card")?.addEventListener("click",shareCard);
      document.getElementById("download-card")?.addEventListener("click",downloadCard);
      document.getElementById("copy-link")?.addEventListener("click",copyLink);
      document.getElementById("share-card-shortcut")?.addEventListener("click",function(){document.getElementById("share-actions")?.scrollIntoView({behavior:"smooth",block:"center"});setTimeout(function(){document.getElementById("share-card")?.focus()},420)});
    })();
  </script>
</body>
</html>`;

    return htmlResponse(html, 200);
  } catch (error) {
    console.error("DREAM PAGE ERROR:", error);
    return htmlResponse(errorPage("Unable to load this Dream.", "Please try again later."), 500);
  }
}

function htmlResponse(html, status) {
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

function normalizeHandle(value) {
  return String(value || "").trim().replace(/^@/, "");
}

function buildSocialHtml(instagram, tiktok) {
  if (!instagram && !tiktok) return "";
  const esc = (v) => String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");
  const links = [];
  if (instagram) links.push('<a class="ode-social" href="https://instagram.com/' + encodeURIComponent(instagram) + '" target="_blank" rel="noopener noreferrer">â—Ž @' + esc(instagram) + '</a>');
  if (tiktok) links.push('<a class="ode-social" href="https://tiktok.com/@' + encodeURIComponent(tiktok) + '" target="_blank" rel="noopener noreferrer">â™ª @' + esc(tiktok) + '</a>');
  return '<div class="ode-socials"><div class="ode-socials-label">FIND THE DREAMER</div>' + links.join("") + '</div>';
}

function errorPage(title, text) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} â€” OneDreamEach</title><style>*{box-sizing:border-box}body{min-height:100vh;margin:0;display:grid;place-items:center;background:radial-gradient(circle at 50% 10%,rgba(121,74,219,.18),transparent 35%),#05070b;color:#eef2f7;font-family:Arial,sans-serif;text-align:center}.box{width:min(520px,90%);padding:44px 28px;border:1px solid rgba(131,112,223,.25);border-radius:24px;background:rgba(8,10,18,.78)}h1{font-size:32px;margin:0}p{margin:12px 0 0;color:#98a2b1;line-height:1.6}a{display:inline-flex;margin-top:22px;padding:13px 18px;border:1px solid rgba(101,226,246,.28);border-radius:13px;color:#dffaff;text-decoration:none;font-weight:700;font-size:12px}</style></head><body><div class="box"><h1>${title}</h1><p>${text}</p><a href="/explore">â† Return to the Dream Wall</a></div></body></html>`;
}

function getCountryCode(country) {
  const key = String(country || "").trim().toLowerCase();
  const codes = {
    "afghanistan":"AF","albania":"AL","algeria":"DZ","andorra":"AD","angola":"AO","antigua and barbuda":"AG","argentina":"AR","armenia":"AM","australia":"AU","austria":"AT","azerbaijan":"AZ",
    "bahamas":"BS","bahrain":"BH","bangladesh":"BD","barbados":"BB","belarus":"BY","belgium":"BE","belize":"BZ","benin":"BJ","bhutan":"BT","bolivia":"BO","bosnia and herzegovina":"BA","botswana":"BW","brazil":"BR","brunei":"BN","bulgaria":"BG","burkina faso":"BF","burundi":"BI",
    "cambodia":"KH","cameroon":"CM","canada":"CA","cape verde":"CV","cabo verde":"CV","central african republic":"CF","chad":"TD","chile":"CL","china":"CN","colombia":"CO","comoros":"KM","congo":"CG","democratic republic of the congo":"CD","dr congo":"CD","costa rica":"CR","croatia":"HR","cuba":"CU","cyprus":"CY","czech republic":"CZ","czechia":"CZ",
    "denmark":"DK","djibouti":"DJ","dominica":"DM","dominican republic":"DO","ecuador":"EC","egypt":"EG","el salvador":"SV","equatorial guinea":"GQ","eritrea":"ER","estonia":"EE","eswatini":"SZ","swaziland":"SZ","ethiopia":"ET","fiji":"FJ","finland":"FI","france":"FR",
    "gabon":"GA","gambia":"GM","georgia":"GE","germany":"DE","ghana":"GH","greece":"GR","grenada":"GD","guatemala":"GT","guinea":"GN","guinea-bissau":"GW","guyana":"GY","haiti":"HT","honduras":"HN","hungary":"HU","iceland":"IS","india":"IN","indonesia":"ID","iran":"IR","iraq":"IQ","ireland":"IE","israel":"IL","italy":"IT","ivory coast":"CI","cote d'ivoire":"CI",
    "jamaica":"JM","japan":"JP","jordan":"JO","kazakhstan":"KZ","kenya":"KE","kiribati":"KI","kuwait":"KW","kyrgyzstan":"KG","laos":"LA","latvia":"LV","lebanon":"LB","lesotho":"LS","liberia":"LR","libya":"LY","liechtenstein":"LI","lithuania":"LT","luxembourg":"LU",
    "madagascar":"MG","malawi":"MW","malaysia":"MY","maldives":"MV","mali":"ML","malta":"MT","marshall islands":"MH","mauritania":"MR","mauritius":"MU","mexico":"MX","micronesia":"FM","moldova":"MD","monaco":"MC","mongolia":"MN","montenegro":"ME","morocco":"MA","mozambique":"MZ","myanmar":"MM",
    "namibia":"NA","nauru":"NR","nepal":"NP","netherlands":"NL","new zealand":"NZ","nicaragua":"NI","niger":"NE","nigeria":"NG","north korea":"KP","north macedonia":"MK","norway":"NO","oman":"OM","pakistan":"PK","palau":"PW","palestine":"PS","panama":"PA","papua new guinea":"PG","paraguay":"PY","peru":"PE","philippines":"PH","poland":"PL","portugal":"PT","qatar":"QA",
    "romania":"RO","russia":"RU","rwanda":"RW","saint kitts and nevis":"KN","saint lucia":"LC","saint vincent and the grenadines":"VC","samoa":"WS","san marino":"SM","sao tome and principe":"ST","saudi arabia":"SA","senegal":"SN","serbia":"RS","seychelles":"SC","sierra leone":"SL","singapore":"SG","slovakia":"SK","slovenia":"SI","solomon islands":"SB","somalia":"SO","south africa":"ZA","south korea":"KR","south sudan":"SS","spain":"ES","sri lanka":"LK","sudan":"SD","suriname":"SR","sweden":"SE","switzerland":"CH","syria":"SY",
    "taiwan":"TW","tajikistan":"TJ","tanzania":"TZ","thailand":"TH","timor-leste":"TL","east timor":"TL","togo":"TG","tonga":"TO","trinidad and tobago":"TT","tunisia":"TN","turkey":"TR","tÃ¼rkiye":"TR","turkmenistan":"TM","tuvalu":"TV","uganda":"UG","ukraine":"UA","united arab emirates":"AE","united kingdom":"GB","uk":"GB","united states":"US","united states of america":"US","usa":"US","uruguay":"UY","uzbekistan":"UZ","vanuatu":"VU","vatican city":"VA","venezuela":"VE","vietnam":"VN","yemen":"YE","zambia":"ZM","zimbabwe":"ZW"
  };
  return codes[key] || "";
}
