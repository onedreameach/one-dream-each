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
    const xHandle = normalizeHandle(dream.x || dream.twitter || dream.twitter_handle || "");
    const countryClass = country.length > 22 ? " country-very-long" : country.length > 14 ? " country-long" : "";
    const nameClass = nickname.length > 24 ? " name-very-long" : nickname.length > 15 ? " name-long" : "";

    const safeNickname = escapeHtml(nickname);
    const safeDream = escapeHtml(dreamText);
    const safeCountry = escapeHtml(country);
    const dreamDate = formatDreamDate(dream.created_at);
    const safeDreamDate = escapeHtml(dreamDate);
    const countryCode = getCountryCode(country);
    const flagUrl = countryCode
      ? "https://flagcdn.com/w160/" + countryCode.toLowerCase() + ".png"
      : "";

    // V22 card no longer needs a heavy MapTiler image. Keeping this empty removes
    // an extra server-side map request and makes every Dream page noticeably faster.
    const originImageDataUrl = "";

    const siteUrl = String(env.PUBLIC_SITE_URL || "https://onedreameach.com").replace(/\/+$/, "");
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
    html{scroll-behavior:smooth;background:#050a11}
    body{margin:0;min-height:100vh;background:
      radial-gradient(circle at 7% 14%,rgba(48,196,213,.08),transparent 27%),
      radial-gradient(circle at 91% 8%,rgba(150,93,226,.11),transparent 31%),
      linear-gradient(180deg,#0a1425 0%,#07101b 48%,#061019 100%);
      color:var(--text);font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      overflow-x:hidden;
    }
    body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.22;background-image:linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px);background-size:34px 34px;mask-image:linear-gradient(to bottom,black,transparent 72%)}
    a{color:inherit}
    button,a{-webkit-tap-highlight-color:transparent}
    .shell{width:min(1160px,92%);margin:auto}

    /* =========================================================
       TOP — SAME FOUR-WORLD SHELL AS THE REST OF THE SITE
       ========================================================= */
    .top{padding-top:max(10px,env(safe-area-inset-top));position:relative;z-index:30}
    .top-nav{min-height:82px;display:flex;align-items:center;justify-content:space-between;gap:14px}
    .brand{text-decoration:none;color:inherit;display:flex;align-items:center}
    .brand strong{display:block;color:#f6f8fb;font-family:"Space Grotesk",Inter,sans-serif;font-size:18px;font-weight:700;line-height:1;letter-spacing:-.045em}
    .brand small{margin-top:7px;display:flex;align-items:center;gap:6px;color:#748697;font-size:6.6px;font-weight:900;letter-spacing:.14em;line-height:1;white-space:nowrap}
    .brand small i{width:5px;height:5px;border-radius:50%;display:block;background:#73e9e0;box-shadow:0 0 11px rgba(115,233,224,.68)}
    .brand small b{color:#c7b1fb;font-size:6.6px;letter-spacing:.14em}
    .home-link{position:relative;display:flex;align-items:center;justify-content:flex-start;gap:9px;min-width:112px;height:50px;padding:4px 12px 4px 5px;border-radius:18px;text-decoration:none;color:#eef3f7;background:linear-gradient(145deg,rgba(12,23,35,.98),rgba(8,12,22,.99));border:1px solid rgba(139,202,226,.16);box-shadow:0 0 0 1px rgba(0,0,0,.62),0 10px 24px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.045);overflow:hidden}
    .home-link:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 18% 50%,rgba(90,225,238,.09),transparent 36%),radial-gradient(circle at 78% 30%,rgba(167,116,255,.08),transparent 42%);pointer-events:none}
    .home-icon{position:relative;z-index:1;flex:0 0 40px;width:40px;height:40px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(58,199,220,.18),rgba(128,88,223,.23));border:1px solid rgba(150,211,232,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
    .home-icon svg{width:22px;height:22px}
    .home-copy{position:relative;z-index:1;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;line-height:1}
    .home-copy small{display:none}
    .home-copy b{display:block;margin-top:0;color:#f2f6f8;font:800 10px/1 "Space Grotesk",Inter,sans-serif;letter-spacing:.09em}

    .world-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:4px 0 30px}
    .world-tab{position:relative;min-width:0;min-height:66px;padding:8px 10px;border-radius:18px;border:1px solid rgba(137,190,216,.12);background:linear-gradient(155deg,rgba(12,23,34,.95),rgba(8,13,23,.98));box-shadow:0 0 0 1px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.035);display:grid;grid-template-columns:38px minmax(0,1fr) 16px;align-items:center;gap:9px;color:#92a6b3;text-decoration:none;transition:.18s ease}
    .world-tab:hover,.world-tab:focus-visible{transform:translateY(-2px);border-color:rgba(167,139,250,.36)}
    .world-tab-icon{width:38px;height:38px;border-radius:13px;display:grid;place-items:center;color:#8fe8ef;background:rgba(5,13,22,.60);border:1px solid rgba(132,206,225,.11)}
    .world-tab:nth-child(2) .world-tab-icon{color:#c3a7ff}.world-tab:nth-child(3) .world-tab-icon{color:#79e3cf}.world-tab:nth-child(4) .world-tab-icon{color:#d9a8f8}
    .world-tab-icon svg{display:block;width:24px;height:24px}
    .world-tab-copy small{display:block;color:#657b89;font-size:5.5px;font-weight:900;letter-spacing:.14em}.world-tab-copy b{display:block;margin-top:4px;color:inherit;font:700 10px/1 "Space Grotesk",Inter,sans-serif;letter-spacing:.045em}
    .world-tab>em{font-style:normal;color:#5e7380;font-size:13px}

    /* =========================================================
       HERO — SAME PAGE LANGUAGE, NOT A SEPARATE DESIGN SYSTEM
       ========================================================= */
    .hero{position:relative;overflow:hidden;margin:0 auto 34px;padding:48px 34px 42px;border:1px solid rgba(129,195,219,.15);border-radius:31px;background:
      radial-gradient(circle at 3% 4%,rgba(52,213,224,.16),transparent 32%),
      radial-gradient(circle at 100% 4%,rgba(163,102,239,.16),transparent 36%),
      linear-gradient(145deg,rgba(11,28,40,.94),rgba(18,20,39,.96));box-shadow:0 20px 60px rgba(0,0,0,.18),0 0 46px rgba(102,224,239,.05),inset 0 1px 0 rgba(255,255,255,.035);animation:heroFloat 10s ease-in-out infinite}
    .hero:before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,#63e6ee,rgba(120,154,255,.75),#cc83ef);opacity:.78}.hero:after{content:"";position:absolute;inset:auto -10% -35% auto;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(207,111,255,.18),rgba(207,111,255,0) 68%);pointer-events:none}
    .hero-kicker{display:flex;align-items:center;justify-content:center;gap:9px;color:#7cdfe8;font-size:7px;font-weight:900;letter-spacing:.19em;text-align:center}.hero-kicker i{width:7px;height:7px;border-radius:50%;background:#70e8ef;box-shadow:0 0 15px rgba(112,232,239,.82)}
    .hero h1{margin:25px auto 0;max-width:850px;text-align:center;font:800 clamp(43px,6.1vw,78px)/.96 "Space Grotesk",Inter,sans-serif;letter-spacing:-.055em;color:#f5f6f8}
    .hero h1 span{background:linear-gradient(90deg,#74e5ed 0%,#a8b1ff 48%,#e08bd3 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
    .hero p{max-width:760px;margin:24px auto 0;text-align:center;color:#a2b0ba;font-size:clamp(15px,2vw,21px);line-height:1.55}.hero p strong{color:#d8c4ff}.hero-pills{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:24px auto 0}.hero-pills span{display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:0 14px;border-radius:999px;border:1px solid rgba(131,198,220,.16);background:linear-gradient(145deg,rgba(9,22,34,.72),rgba(26,20,44,.72));box-shadow:inset 0 1px 0 rgba(255,255,255,.04);color:#dbe9ef;font:800 9px/1 "Space Grotesk",Inter,sans-serif;letter-spacing:.12em}.hero-pills span:nth-child(2){border-color:rgba(192,133,255,.22);color:#edd9ff}.hero-pills span:nth-child(3){border-color:rgba(110,233,240,.18);color:#bceef2}.hero-pills span i{width:7px;height:7px;border-radius:50%;margin-right:8px;background:#67e8ef;box-shadow:0 0 14px rgba(103,232,239,.85)}@keyframes heroFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}

    /* =========================================================
       OFFICIAL DREAM CARD — TRANSPLANTED FROM CHECKOUT
       ========================================================= */
    .card-wrap{width:min(790px,100%);margin:0 auto}
    .dream-card{--card-cyan:#69e4f0;--card-violet:#a58bff;--card-pink:#e68dcc;position:relative;overflow:hidden;margin:0;padding:0;border-radius:28px;border:1px solid rgba(155,138,255,.42);background:
      radial-gradient(circle at 5% -3%,rgba(74,221,240,.22),transparent 34%),
      radial-gradient(circle at 103% 9%,rgba(203,111,255,.29),transparent 38%),
      radial-gradient(circle at 74% 98%,rgba(236,118,194,.14),transparent 35%),
      linear-gradient(145deg,#071724 0%,#0d1730 47%,#1d1030 100%);
      box-shadow:0 0 0 1px rgba(0,0,0,.82),0 32px 88px rgba(0,0,0,.42),0 0 58px rgba(102,224,239,.10),0 0 70px rgba(194,107,255,.10),inset 0 1px 0 rgba(255,255,255,.085);isolation:isolate}
    .dream-card:before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;background:linear-gradient(120deg,rgba(101,231,241,.82),rgba(148,137,255,.24) 42%,rgba(216,126,255,.78) 70%,rgba(242,142,201,.35));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;z-index:8;opacity:.85}
    .dream-card:after{content:"";position:absolute;width:290px;height:290px;right:-94px;top:154px;border-radius:50%;border:1px solid rgba(196,139,255,.12);box-shadow:0 0 0 45px rgba(97,225,238,.025),0 0 0 90px rgba(188,117,255,.018);pointer-events:none;z-index:0}
    .card-aura{position:absolute;inset:-30% -25%;background:conic-gradient(from 100deg,transparent,rgba(89,231,241,.10),transparent 28%,rgba(194,118,255,.14),transparent 58%,rgba(239,132,203,.08),transparent);animation:aura 14s linear infinite;z-index:-1;pointer-events:none}.card-sweep{position:absolute;top:0;left:-42%;width:28%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.055),transparent);transform:skewX(-18deg);animation:sweep 7.8s ease-in-out infinite;z-index:7;pointer-events:none}
    @keyframes aura{to{transform:rotate(360deg)}}@keyframes sweep{0%,58%{transform:translateX(0) skewX(-18deg);opacity:0}66%{opacity:1}86%{transform:translateX(540%) skewX(-18deg);opacity:0}100%{opacity:0}}
    .card-livebar{min-height:56px;padding:0 24px;display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid rgba(255,255,255,.06);background:linear-gradient(90deg,rgba(4,16,25,.52),rgba(13,8,26,.42));position:relative;z-index:3}.card-livebar span{display:flex;align-items:center;gap:9px;color:#b4e6ec;font-size:8px;font-weight:900;letter-spacing:1.62px}.card-livebar span i{width:9px;height:9px;border-radius:50%;background:#62ebf1;box-shadow:0 0 16px rgba(98,235,241,.92)}.card-livebar b{display:inline-flex;align-items:center;justify-content:center;min-height:30px;padding:0 13px;border-radius:999px;border:1px solid rgba(224,174,255,.34);background:linear-gradient(145deg,rgba(67,38,105,.24),rgba(22,14,40,.18));box-shadow:0 0 0 1px rgba(255,255,255,.035),0 0 24px rgba(206,119,255,.12),inset 0 1px 0 rgba(255,255,255,.07);color:#f0c6ff;font-size:7.2px;letter-spacing:1.34px;animation:archivePulse 2.4s ease-in-out infinite}.card-livebar b:before{content:"";width:6px;height:6px;border-radius:50%;margin-right:7px;background:#f0c6ff;box-shadow:0 0 12px rgba(240,198,255,.7)}.card-livebar b:after{content:"";position:absolute;inset:1px auto 1px -30%;width:28%;border-radius:999px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);transform:skewX(-18deg);animation:archiveSweep 4.8s ease-in-out infinite}.card-livebar b{position:relative;overflow:hidden}
    .card-number-watermark{position:absolute;right:-18px;top:31%;z-index:0;color:rgba(184,145,255,.035);font:800 156px/.8 "Space Grotesk",Inter,sans-serif;letter-spacing:-.08em;transform:rotate(-90deg);transform-origin:center;pointer-events:none;user-select:none}
    .card-top,.card-bottom{position:relative;z-index:2;display:flex;justify-content:space-between;gap:20px}
    .card-top{padding:28px 27px 0;align-items:flex-start}.card-id span,.card-location-copy span,.card-bottom span{display:block;color:#718697;font-size:7.4px;font-weight:900;letter-spacing:1.45px}.card-id strong{display:block;margin-top:6px;font-family:"Space Grotesk",Inter,sans-serif;font-size:23px;font-weight:800;letter-spacing:-.02em;background:linear-gradient(90deg,#80edf3 0%,#b9b3ff 48%,#e79bd5 100%);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 0 24px rgba(141,120,255,.10)}
    .card-identity-strip{position:relative;z-index:2;margin:15px 27px 0;padding:8px 11px;border:1px solid rgba(255,255,255,.045);border-radius:11px;background:linear-gradient(90deg,rgba(70,213,233,.06),rgba(173,116,255,.08));display:flex;align-items:center;justify-content:space-between;gap:10px;color:#7f97a5;font-size:6.5px;font-weight:900;letter-spacing:1.05px;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}.card-identity-strip b{color:#bda7f0;font-size:6.5px;letter-spacing:1.05px}
    .card-location{display:flex;align-items:center;gap:11px;min-width:0;padding:9px 14px 9px 9px;border:1px solid rgba(188,148,255,.12);border-radius:18px;background:linear-gradient(145deg,rgba(5,13,22,.58),rgba(22,13,37,.50));box-shadow:0 0 0 1px rgba(0,0,0,.56),inset 0 1px 0 rgba(255,255,255,.04),0 8px 24px rgba(0,0,0,.14)}
    .flag{width:62px;height:48px;position:relative;display:grid;place-items:center;overflow:hidden;border-radius:13px;background:linear-gradient(145deg,#0d1724,#19162a);box-shadow:0 0 0 1px rgba(0,0,0,.72),0 0 22px rgba(162,118,255,.10),inset 0 1px 0 rgba(255,255,255,.06)}.flag img{width:100%;height:100%;object-fit:cover;display:block}.flag-fallback{font:800 13px/1 "Space Grotesk",Inter,sans-serif;color:#dce9f1;letter-spacing:.08em}
    .card-country{max-width:170px;margin-top:5px;color:#eff3f6;font-family:"Space Grotesk",Inter,sans-serif;font-size:10px;font-weight:800;line-height:1.25;letter-spacing:.8px;text-transform:uppercase;overflow-wrap:anywhere}
    .quote-mark{position:absolute;left:27px;top:127px;color:rgba(159,122,255,.38);font-size:76px;font-family:Georgia,serif;line-height:1;z-index:1}
    .dream-text{position:relative;z-index:2;min-height:330px;margin:42px 27px 30px;padding:30px 20px 26px 50px;display:flex;align-items:center;color:#fbfcff;font-family:Inter,system-ui,sans-serif;font-size:clamp(29px,4.45vw,43px);line-height:1.24;font-weight:760;letter-spacing:-1.35px;text-shadow:0 10px 32px rgba(0,0,0,.28);overflow-wrap:anywhere}.dream-text:before{content:"";position:absolute;left:33px;top:25px;bottom:25px;width:1px;background:linear-gradient(180deg,transparent,rgba(104,230,239,.22),rgba(193,126,255,.20),transparent)}
    .dream-text.long{font-size:clamp(23px,3.5vw,34px);line-height:1.3}.dream-text.very-long{font-size:clamp(19px,3vw,28px);line-height:1.34}
    .card-bottom{margin:0 27px;padding:20px 0 21px;border-top:1px solid rgba(110,222,238,.12);align-items:flex-end}.card-bottom strong{display:block;margin-top:6px;font-family:"Space Grotesk",Inter,sans-serif;font-size:16px;color:#f2f5f7}.card-status{text-align:right}.card-status strong{color:#f7f2ff;font-size:15px;letter-spacing:.55px}.card-status strong:before{content:"";display:inline-block;width:6px;height:6px;margin:0 7px 1px 0;border-radius:50%;background:#7be9df;box-shadow:0 0 10px rgba(123,233,223,.55)}
    .worldline{margin:0 19px 17px;padding:10px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;border:1px solid rgba(255,255,255,.055);border-radius:17px;background:linear-gradient(145deg,rgba(3,10,18,.46),rgba(14,9,25,.38));position:relative;z-index:2}.world-chip{min-height:62px;display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid rgba(255,255,255,.055);border-radius:14px;background:linear-gradient(145deg,rgba(8,18,28,.62),rgba(11,11,24,.60));box-shadow:0 0 0 1px rgba(0,0,0,.40),inset 0 1px 0 rgba(255,255,255,.025)}.world-chip svg{width:31px;height:31px;filter:drop-shadow(0 0 9px rgba(103,225,238,.08))}.world-chip b{color:#ced7dd;font-size:7.5px;letter-spacing:1.05px}.world-chip.map{border-color:rgba(88,221,239,.17)}.world-chip.wall{border-color:rgba(187,129,255,.18)}.world-chip.chain{border-color:rgba(89,222,206,.15)}.world-chip.puzzle{border-color:rgba(193,127,255,.18)}
    .shareline{margin:0 19px 19px;padding:13px 11px;border:1px solid rgba(191,133,255,.09);border-radius:13px;background:linear-gradient(90deg,rgba(70,213,233,.09),rgba(109,106,239,.09) 48%,rgba(203,102,226,.12));color:#91a4b2;font-size:7px;font-weight:900;letter-spacing:1px;text-align:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)}.shareline span{color:#d1a2ff;text-shadow:0 0 10px rgba(197,126,255,.4)}

    @keyframes archivePulse{0%,100%{box-shadow:0 0 0 1px rgba(255,255,255,.035),0 0 18px rgba(206,119,255,.10),inset 0 1px 0 rgba(255,255,255,.07);transform:translateY(0)}50%{box-shadow:0 0 0 1px rgba(255,255,255,.05),0 0 32px rgba(206,119,255,.20),inset 0 1px 0 rgba(255,255,255,.09);transform:translateY(-1px)}}@keyframes archiveSweep{0%,55%{transform:translateX(0) skewX(-18deg);opacity:0}65%{opacity:.8}88%{transform:translateX(470%) skewX(-18deg);opacity:0}100%{opacity:0}}

    /* SMALL PERSONAL DETAIL — NO SECOND CARD LANGUAGE */
    .under-card{width:min(790px,100%);margin:17px auto 0;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:stretch}
    .memory-button,.world-entry{border:1px solid rgba(139,202,221,.12);border-radius:18px;background:linear-gradient(145deg,rgba(9,23,34,.86),rgba(15,16,31,.92));box-shadow:0 0 0 1px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.035);color:#d9e4ea;min-height:64px}
    .memory-button{appearance:none;width:100%;padding:11px 15px;display:flex;align-items:center;gap:12px;text-align:left;cursor:pointer}.memory-heart{width:40px;height:40px;border-radius:13px;display:grid;place-items:center;color:#e2a3d7;background:rgba(151,77,152,.12);border:1px solid rgba(219,137,207,.16)}.memory-heart svg{width:21px;height:21px}.memory-copy small{display:block;color:#7a8e9a;font-size:6px;font-weight:900;letter-spacing:.13em}.memory-copy b{display:block;margin-top:4px;font:700 10px/1 "Space Grotesk",Inter,sans-serif}.memory-button.active{border-color:rgba(225,137,207,.34);background:linear-gradient(145deg,rgba(54,26,65,.76),rgba(14,28,39,.92))}.memory-button.active .memory-heart{color:#fff;background:rgba(211,105,191,.24)}
    .world-entry{padding:0 18px;display:flex;align-items:center;text-decoration:none;font:700 9px/1 "Space Grotesk",Inter,sans-serif;letter-spacing:.06em;white-space:nowrap}

    /* =========================================================
       SHARE + FOUR WORLDS
       ========================================================= */
    .section{margin-top:38px;padding:30px;border:1px solid rgba(131,194,218,.13);border-radius:29px;background:radial-gradient(circle at 3% 2%,rgba(70,213,224,.08),transparent 30%),linear-gradient(145deg,rgba(9,24,35,.92),rgba(15,18,34,.95));box-shadow:0 18px 55px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.03)}
    .section-head small{display:block;color:#75dce7;font-size:6.8px;font-weight:900;letter-spacing:.17em}.section-head h2{margin:7px 0 0;font:800 clamp(28px,4vw,46px)/.98 "Space Grotesk",Inter,sans-serif;letter-spacing:-.045em}.section-head h2 span{background:linear-gradient(90deg,#71e4ee,#a7afff,#df8ed2);-webkit-background-clip:text;background-clip:text;color:transparent}.section-head p{max-width:700px;margin:13px 0 0;color:#8497a4;font-size:12px;line-height:1.65}
    .share-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:22px}.share-action{appearance:none;min-height:70px;padding:12px 14px;border:1px solid rgba(134,201,221,.12);border-radius:17px;background:rgba(5,14,23,.50);color:#e8f0f4;display:flex;align-items:center;justify-content:center;gap:10px;text-decoration:none;cursor:pointer;font:700 9px/1.1 "Space Grotesk",Inter,sans-serif;letter-spacing:.07em}.share-action.primary{position:relative;overflow:hidden;border-color:rgba(105,226,239,.28);background:linear-gradient(145deg,rgba(29,114,133,.24),rgba(78,56,141,.27))}.share-action.primary:after{content:"";position:absolute;left:-35%;top:0;width:30%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent);transform:skewX(-18deg);animation:entrySweep 6s ease-in-out infinite}.share-action svg{width:22px;height:22px;color:#75e5ef}.share-action:nth-child(2) svg{color:#c09aff}.share-action:nth-child(3) svg{color:#8ce7d3}@keyframes entrySweep{0%,60%{transform:translateX(0) skewX(-18deg);opacity:0}70%{opacity:1}92%{transform:translateX(480%) skewX(-18deg);opacity:0}100%{opacity:0}}.share-status{min-height:18px;margin-top:10px;color:#6f8794;font-size:8px;font-weight:700;letter-spacing:.04em;text-align:center}

    .world-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:22px}.world-card{min-width:0;min-height:108px;padding:13px;border-radius:18px;display:grid;grid-template-columns:44px minmax(0,1fr) 14px;align-items:center;gap:9px;text-decoration:none;color:#a2b3bd;background:rgba(5,13,22,.46);border:1px solid rgba(137,198,218,.10);transition:.18s ease}.world-card:hover,.world-card:focus-visible{transform:translateY(-2px);border-color:rgba(174,135,248,.32)}.world-card-icon{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:rgba(8,17,27,.76);border:1px solid rgba(126,202,220,.10)}.world-card-icon svg{width:28px;height:28px}.world-card small{display:block;color:#657985;font-size:5.5px;font-weight:900;letter-spacing:.12em}.world-card b{display:block;margin-top:4px;color:#e5edf1;font:700 11px/1 "Space Grotesk",Inter,sans-serif}.world-card em{display:block;margin-top:6px;color:#6f838e;font-size:6.4px;font-style:normal;line-height:1.35}.world-card>strong{color:#607681;font-size:13px}

    .socials{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:17px}.social-label{width:100%;color:#667c89;font-size:6px;font-weight:900;letter-spacing:.15em}.social-link{min-height:38px;padding:0 12px;border:1px solid rgba(146,198,217,.11);border-radius:12px;display:flex;align-items:center;text-decoration:none;color:#a9bac4;font-size:8px;font-weight:700;background:rgba(5,13,22,.36)}

    .cta{text-align:center;margin:38px 0 54px;padding:42px 24px;border:1px solid rgba(149,116,226,.18);border-radius:30px;background:radial-gradient(circle at 50% 0%,rgba(145,88,220,.13),transparent 40%),linear-gradient(145deg,rgba(12,21,34,.93),rgba(20,15,34,.95))}.cta small{color:#7cdde6;font-size:6.5px;font-weight:900;letter-spacing:.18em}.cta h2{margin:10px 0 0;font:800 clamp(32px,5vw,58px)/.98 "Space Grotesk",Inter,sans-serif;letter-spacing:-.05em}.cta h2 span{background:linear-gradient(90deg,#6ce1ec,#adabff,#e18dcf);-webkit-background-clip:text;background-clip:text;color:transparent}.cta p{max-width:600px;margin:15px auto 0;color:#8396a2;font-size:12px;line-height:1.65}.cta a{margin-top:21px;min-height:56px;padding:0 22px;border-radius:17px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;color:white;background:linear-gradient(100deg,#25b5cc,#755be8 48%,#bd5ee2);box-shadow:0 16px 40px rgba(112,82,218,.24);font:700 10px/1 "Space Grotesk",Inter,sans-serif;letter-spacing:.07em}

    @media(max-width:760px){
      .shell{width:min(100% - 24px,1160px)}
      .top-nav{min-height:72px}.brand strong{font-size:15px}.brand small{margin-top:6px;font-size:5.6px;gap:5px;letter-spacing:.11em}.brand small b{font-size:5.6px}
      .home-link{flex:0 0 106px;min-width:106px;width:106px;height:48px;padding:4px 10px 4px 5px;border-radius:18px;gap:8px}.home-icon{flex-basis:38px;width:38px;height:38px;border-radius:13px}.home-icon svg{width:21px;height:21px}.home-copy small{display:none}.home-copy b{font-size:9px;margin:0;letter-spacing:.08em}.hero{padding:38px 18px 30px}.hero-pills{gap:8px;margin-top:20px}.hero-pills span{min-height:30px;padding:0 11px;font-size:7.3px;letter-spacing:.11em}
      .world-tabs{gap:6px;margin:2px 0 22px}.world-tab{min-height:70px;padding:7px 4px;border-radius:15px;display:flex;flex-direction:column;justify-content:center;gap:5px}.world-tab-icon{width:34px;height:34px;border-radius:11px}.world-tab-icon svg{width:23px;height:23px}.world-tab-copy small{display:none}.world-tab-copy b{font-size:7.6px;margin:0;letter-spacing:.05em}.world-tab>em{display:none}
      .hero{padding:34px 20px 31px;border-radius:27px;margin-bottom:28px}.hero-kicker{font-size:6.1px}.hero h1{font-size:clamp(42px,12vw,63px);margin-top:20px}.hero p{font-size:15px;line-height:1.55;margin-top:20px}
      .dream-card{border-radius:24px}.card-livebar{min-height:48px;padding:0 14px}.card-livebar b{min-height:26px;padding:0 10px;font-size:6.6px;letter-spacing:1.15px}.card-livebar span{font-size:6.4px;letter-spacing:1.2px}.card-livebar b{font-size:6px}.card-number-watermark{right:-26px;top:34%;font-size:92px}.card-top{padding:20px 15px 0;gap:8px}.card-id span,.card-location-copy span{font-size:6.3px}.card-id strong{font-size:16.5px;margin-top:5px}.card-location{padding:7px 9px 7px 7px;gap:7px;border-radius:15px}.flag{width:49px;height:38px;border-radius:10px}.card-country{max-width:112px;font-size:7.4px;letter-spacing:.65px}.card-identity-strip{margin:11px 15px 0;padding:7px 9px;font-size:5.5px;letter-spacing:.8px}.card-identity-strip b{font-size:5.5px;letter-spacing:.8px}.quote-mark{left:15px;top:127px;font-size:55px}.dream-text{min-height:350px;margin:28px 15px 24px;padding:30px 5px 22px 36px;font-size:clamp(27px,7.6vw,36px);line-height:1.27;letter-spacing:-.95px}.dream-text:before{left:27px;top:24px;bottom:24px}.dream-text.long{font-size:clamp(22px,6.4vw,30px)}.dream-text.very-long{font-size:clamp(18px,5.3vw,25px);line-height:1.34}.card-bottom{margin:0 15px;padding:15px 0 16px}.card-bottom span{font-size:6.2px}.card-bottom strong{font-size:12px}.card-status strong{font-size:10px}.worldline{margin:0 10px 10px;padding:7px;gap:5px;border-radius:14px}.world-chip{min-height:48px;gap:4px;border-radius:11px}.world-chip svg{width:23px;height:23px}.world-chip b{font-size:5.8px}.shareline{margin:0 10px 11px;padding:10px 7px;font-size:5.7px}
      .under-card{grid-template-columns:1fr}.world-entry{min-height:52px;justify-content:center}
      .section{margin-top:28px;padding:22px 16px;border-radius:24px}.section-head h2{font-size:31px}.section-head p{font-size:11px}.share-actions{grid-template-columns:1fr;gap:7px}.share-action{min-height:58px}.world-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.world-card{min-height:88px;padding:9px;grid-template-columns:36px minmax(0,1fr) 12px;gap:7px}.world-card-icon{width:36px;height:36px;border-radius:11px}.world-card-icon svg{width:23px;height:23px}.world-card em{font-size:5.8px}
      .cta{margin-top:28px;padding:34px 18px;border-radius:25px}.cta p{font-size:11px}
    }
    @media(max-width:390px){.card-country{max-width:88px}.card-id strong{font-size:14px}.dream-text{font-size:25px}.world-chip b{font-size:5px}.world-chip svg{width:21px;height:21px}}
    @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}.card-aura,.card-sweep{animation:none!important}.world-tab,.world-card{transition:none!important}}


    /* =========================================================
       V22 — FINAL 3D OFFICIAL DREAM CARD
       Minimal physical collectible. The Dream is the hero.
       ========================================================= */

    .compact-card-wrap{
      --tilt-x:2.2deg;--tilt-y:-2.4deg;--shine-x:50%;--shine-y:22%;
      width:min(700px,100%);margin:8px auto 0;padding:32px 18px 46px;
      perspective:1600px;perspective-origin:50% 42%;position:relative;
    }
    .compact-card-wrap:after{content:"";position:absolute;left:12%;right:8%;bottom:22px;height:34px;border-radius:50%;background:rgba(0,0,0,.52);filter:blur(22px);transform:translateZ(-80px);pointer-events:none}
    .compact-card{
      position:relative;min-height:860px;transform-style:preserve-3d;
      transform:rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
      transition:transform .22s cubic-bezier(.2,.75,.2,1);will-change:transform;
      animation:cardArrival .9s cubic-bezier(.16,.84,.24,1) both;
    }
    .card-edge{position:absolute;inset:14px -15px -19px 14px;border-radius:38px;background:linear-gradient(145deg,#2bd9ed 0%,#6078f7 49%,#bc62e7 100%);box-shadow:0 30px 70px rgba(0,0,0,.55),0 0 26px rgba(86,211,239,.11),0 0 34px rgba(178,96,231,.10);transform:translateZ(-42px);opacity:.72;pointer-events:none}
    .card-edge:after{content:"";position:absolute;inset:3px;border-radius:35px;background:#050911;opacity:.66}
    .card-face{
      position:relative;z-index:2;min-height:860px;padding:34px 36px 30px;overflow:hidden;border-radius:36px;
      background:radial-gradient(circle at 8% 0%,rgba(71,220,238,.105),transparent 28%),radial-gradient(circle at 98% 3%,rgba(181,100,238,.115),transparent 30%),linear-gradient(155deg,#07121b 0%,#050a11 44%,#080713 100%);
      border:1px solid rgba(169,189,223,.17);
      box-shadow:inset 0 1px 0 rgba(255,255,255,.065),inset 0 0 70px rgba(71,134,190,.025),0 34px 85px rgba(0,0,0,.43);
      transform-style:preserve-3d;
    }
    .card-face:before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at var(--shine-x) var(--shine-y),rgba(255,255,255,.085),transparent 20%);opacity:.8;mix-blend-mode:screen;transition:opacity .2s ease}
    .card-face:after{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;background:linear-gradient(125deg,rgba(92,231,241,.72),rgba(255,255,255,.045) 34%,rgba(149,130,255,.13) 58%,rgba(224,124,236,.58));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
    @keyframes cardArrival{0%{opacity:0;transform:translateY(42px) scale(.96) rotateX(11deg) rotateY(-8deg)}100%{opacity:1;transform:rotateX(var(--tilt-x)) rotateY(var(--tilt-y))}}

    .card-main-head{display:flex;align-items:center;justify-content:space-between;gap:16px;position:relative;z-index:2;transform:translateZ(34px)}
    .card-brand-name{font:800 clamp(20px,4vw,29px)/1 "Space Grotesk",Inter,sans-serif;letter-spacing:-.045em;color:#f7f9fb}
    .card-official{display:flex;align-items:center;gap:8px;color:#8998a8;font-size:7.5px;font-weight:900;letter-spacing:.19em;white-space:nowrap}.card-official i{width:7px;height:7px;border-radius:50%;background:#80eaf0;box-shadow:0 0 13px rgba(128,234,240,.75)}

    .card-big-number{position:relative;z-index:2;margin-top:42px;font:900 clamp(68px,14vw,116px)/.82 "Space Grotesk",Inter,sans-serif;letter-spacing:-.075em;background:linear-gradient(92deg,#52e3ee 0%,#79b7ff 43%,#a883ff 69%,#e07ed7 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 16px 30px rgba(91,170,255,.07));transform:translateZ(62px)}

    .card-facts{position:relative;z-index:2;margin-top:43px;display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:24px;align-items:center;transform:translateZ(42px)}
    .card-fact{min-width:0}.card-fact-label{display:block;margin-bottom:8px;color:#687989;font-size:7px;font-weight:900;letter-spacing:.18em}.card-fact strong{display:block;color:#f1f4f7;font:750 clamp(15px,3vw,21px)/1.05 "Space Grotesk",Inter,sans-serif;letter-spacing:-.025em;overflow-wrap:anywhere}
    .card-origin-fact{display:flex;align-items:center;gap:12px}.card-flag{flex:0 0 auto;width:57px;height:42px;border-radius:12px;overflow:hidden;background:#0b1420;border:1px solid rgba(255,255,255,.13);box-shadow:0 9px 20px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.06)}.card-flag img{display:block;width:100%;height:100%;object-fit:cover}.card-flag .flag-fallback{height:100%;display:grid;place-items:center;color:#d9e3ea;font:800 10px/1 Inter,sans-serif}
    .card-date strong{white-space:nowrap;font-size:clamp(13px,2.55vw,18px)}

    .card-dream-area{position:relative;z-index:2;min-height:430px;margin-top:34px;padding:36px 0 28px;display:flex;flex-direction:column;justify-content:center;transform:translateZ(72px)}
    .card-dream-label{display:block;margin-bottom:23px;color:#6b7c8d;font-size:7px;font-weight:900;letter-spacing:.20em}.card-quote{display:block;margin:0 0 12px;color:#8d7df7;font:700 68px/.55 Georgia,serif;text-shadow:0 0 24px rgba(130,106,246,.18)}
    .card-dream-copy{margin:0;max-width:96%;color:#fcfdff;font:760 clamp(27px,5.4vw,42px)/1.15 Inter,system-ui,sans-serif;letter-spacing:-.045em;text-wrap:pretty;overflow-wrap:anywhere}.card-dream-copy.long{font-size:clamp(23px,4.65vw,35px);line-height:1.20}.card-dream-copy.very-long{font-size:clamp(19px,3.9vw,29px);line-height:1.25}

    .card-footer-final{position:relative;z-index:2;margin-top:auto;padding-top:18px;display:flex;align-items:flex-end;justify-content:space-between;gap:18px;transform:translateZ(38px)}
    .card-archive small,.card-signoff small{display:block;color:#647684;font-size:6.5px;font-weight:900;letter-spacing:.17em}.card-archive strong{display:block;margin-top:7px;background:linear-gradient(90deg,#6de5ed,#a9a6ff,#dc87d2);-webkit-background-clip:text;background-clip:text;color:transparent;font:850 13px/1 "Space Grotesk",Inter,sans-serif;letter-spacing:.05em}
    .card-signoff{text-align:right}.card-signoff strong{display:block;margin-top:7px;color:#edf2f5;font:800 10px/1.15 "Space Grotesk",Inter,sans-serif;letter-spacing:.09em}.card-url{display:block;margin-top:8px;color:#75dce6;font-size:7px;font-weight:800;letter-spacing:.06em}

    @media(max-width:760px){
      .compact-card-wrap{width:100%;padding:18px 5px 34px;perspective:1150px;--tilt-x:1.6deg;--tilt-y:-1.2deg}
      .compact-card,.card-face{min-height:690px}
      .card-edge{inset:9px -7px -12px 8px;border-radius:30px;transform:translateZ(-28px)}
      .card-face{padding:25px 24px 23px;border-radius:28px}
      .card-brand-name{font-size:20px}.card-official{font-size:6px;letter-spacing:.14em}
      .card-big-number{margin-top:31px;font-size:clamp(60px,18vw,86px)}
      .card-facts{margin-top:31px;grid-template-columns:1fr 1fr;gap:18px 14px}.card-origin-fact{grid-column:1 / -1}.card-dreamer-fact{display:block}.card-date{grid-column:2;grid-row:2;text-align:right}
      .card-flag{width:48px;height:36px;border-radius:10px}.card-fact-label{font-size:6px;margin-bottom:6px}.card-fact strong{font-size:15px}.card-date strong{font-size:11px}
      .card-dream-area{min-height:355px;margin-top:20px;padding:27px 0 19px}.card-dream-label{font-size:6px;margin-bottom:17px}.card-quote{font-size:55px}.card-dream-copy{font-size:clamp(24px,7.2vw,32px)}.card-dream-copy.long{font-size:clamp(20px,6.1vw,27px)}.card-dream-copy.very-long{font-size:clamp(16.5px,5vw,22px);line-height:1.27}
      .card-footer-final{padding-top:12px}.card-archive small,.card-signoff small{font-size:5.6px}.card-archive strong{font-size:10px}.card-signoff strong{font-size:8px}.card-url{font-size:5.6px}
    }
    @media(max-width:390px){.card-face{padding:22px 20px 21px}.card-big-number{font-size:57px}.card-origin-fact{gap:8px}.card-flag{width:43px;height:32px}.card-dream-copy{font-size:23px}.card-dream-copy.long{font-size:19px}.card-dream-copy.very-long{font-size:15.5px}}
    @media(prefers-reduced-motion:reduce){.compact-card{animation:none!important;transition:none!important}}

    /* =========================================================
       V23 — SMALL FLOATING COLLECTIBLE
       The in-page card is intentionally compact: it should feel
       like a physical object, not another full page.
       The 1080×1920 exported/social card remains full resolution.
       ========================================================= */
    .compact-card-wrap{
      --tilt-x:4deg;
      --tilt-y:-6deg;
      width:min(420px,64vw);
      margin:10px auto 2px;
      padding:34px 28px 52px;
      perspective:1400px;
      perspective-origin:50% 45%;
    }
    .compact-card-wrap:before{
      content:"";
      position:absolute;
      left:13%;right:5%;bottom:22px;height:34px;
      border-radius:50%;
      background:linear-gradient(90deg,rgba(46,229,247,.25),rgba(97,112,255,.18) 48%,rgba(232,84,222,.28));
      filter:blur(22px);
      opacity:.72;
      transform:translateZ(-95px) rotate(-1deg);
      pointer-events:none;
    }
    .compact-card-wrap:after{
      left:17%;right:12%;bottom:16px;height:18px;
      background:rgba(0,0,0,.62);
      filter:blur(16px);
    }
    .compact-card{
      min-height:610px;
      filter:drop-shadow(0 30px 34px rgba(0,0,0,.44));
    }
    .compact-card:after{
      content:"";
      position:absolute;
      z-index:-3;
      left:8%;right:5%;bottom:-28px;height:24px;
      border-radius:50%;
      background:linear-gradient(90deg,rgba(43,220,244,.42),rgba(114,91,250,.20) 50%,rgba(228,78,216,.44));
      filter:blur(16px);
      opacity:.72;
      pointer-events:none;
    }
    .card-edge{
      inset:11px -15px -19px 11px;
      border-radius:29px;
      background:linear-gradient(145deg,#35e6f8 0%,#4d9dff 32%,#766dff 58%,#e05ee0 100%);
      box-shadow:
        0 26px 52px rgba(0,0,0,.58),
        -7px 3px 20px rgba(44,221,247,.18),
        12px 10px 25px rgba(222,82,223,.17);
      transform:translateZ(-58px) translateY(3px);
      opacity:.94;
    }
    .card-edge:after{
      inset:3px 3px 4px 4px;
      border-radius:26px;
      background:linear-gradient(145deg,#07111a 0%,#070a13 54%,#100919 100%);
      opacity:.92;
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.035);
    }
    .card-face{
      min-height:610px;
      padding:24px 24px 22px;
      border-radius:27px;
      border:1px solid rgba(188,210,235,.16);
      background:
        radial-gradient(circle at 6% 1%,rgba(44,222,245,.16),transparent 27%),
        radial-gradient(circle at 98% 7%,rgba(219,83,225,.16),transparent 30%),
        radial-gradient(circle at 76% 100%,rgba(104,96,255,.10),transparent 30%),
        linear-gradient(155deg,#07131c 0%,#050910 47%,#0a0713 100%);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.08),
        inset 0 0 50px rgba(78,134,188,.035),
        0 25px 58px rgba(0,0,0,.42);
    }
    .card-face:after{
      padding:1.4px;
      background:linear-gradient(130deg,#55edfa 0%,rgba(255,255,255,.08) 27%,rgba(126,116,255,.35) 58%,#ef65dd 100%);
      opacity:.92;
    }
    .card-main-head{transform:translateZ(42px)}
    .card-brand-name{font-size:16px}
    .card-official{gap:6px;font-size:5.4px;letter-spacing:.15em}.card-official i{width:5px;height:5px}
    .card-big-number{margin-top:27px;font-size:58px;transform:translateZ(74px);filter:drop-shadow(0 10px 20px rgba(84,181,255,.13))}
    .card-facts{margin-top:28px;grid-template-columns:1.2fr .9fr .95fr;gap:13px;transform:translateZ(50px)}
    .card-fact-label{margin-bottom:5px;font-size:5.4px;letter-spacing:.15em}
    .card-fact strong{font-size:12px}
    .card-origin-fact{gap:8px}
    .card-flag{width:39px;height:29px;border-radius:8px;box-shadow:0 7px 15px rgba(0,0,0,.34),0 0 0 1px rgba(99,228,239,.10)}
    .card-date strong{font-size:10px}
    .card-dream-area{min-height:304px;margin-top:17px;padding:21px 0 15px;transform:translateZ(84px)}
    .card-dream-label{margin-bottom:13px;font-size:5.3px}
    .card-quote{margin-bottom:8px;font-size:43px;text-shadow:0 0 20px rgba(133,100,255,.24)}
    .card-dream-copy{max-width:100%;font-size:19px;line-height:1.16;letter-spacing:-.04em}
    .card-dream-copy.long{font-size:16px;line-height:1.20}
    .card-dream-copy.very-long{font-size:13.4px;line-height:1.24}
    .card-footer-final{padding-top:10px;gap:10px;transform:translateZ(46px)}
    .card-archive small,.card-signoff small{font-size:4.8px;letter-spacing:.14em}
    .card-archive strong{margin-top:5px;font-size:8.5px}
    .card-signoff strong{margin-top:5px;font-size:6.6px;letter-spacing:.07em}
    .card-url{margin-top:6px;font-size:4.8px}

    @media(max-width:760px){
      .compact-card-wrap{
        --tilt-x:3deg;--tilt-y:-5deg;
        width:min(72vw,310px);
        padding:27px 22px 44px;
        margin:4px auto 0;
        perspective:1050px;
      }
      .compact-card{min-height:500px}
      .card-edge{inset:8px -12px -16px 8px;border-radius:24px;transform:translateZ(-48px) translateY(3px)}
      .card-edge:after{border-radius:21px}
      .card-face{min-height:500px;padding:19px 18px 17px;border-radius:22px}
      .card-brand-name{font-size:13px}
      .card-official{font-size:4.4px;gap:4px}.card-official i{width:4px;height:4px}
      .card-big-number{margin-top:21px;font-size:46px}
      .card-facts{margin-top:22px;grid-template-columns:1.15fr .85fr;gap:12px 10px}
      .card-origin-fact{grid-column:1 / -1}.card-date{grid-column:2;grid-row:2;text-align:right}
      .card-fact-label{font-size:4.5px;margin-bottom:4px}
      .card-fact strong{font-size:10px}.card-date strong{font-size:8px}
      .card-flag{width:34px;height:25px;border-radius:7px}
      .card-origin-fact{gap:7px}
      .card-dream-area{min-height:244px;margin-top:13px;padding:17px 0 11px}
      .card-dream-label{font-size:4.5px;margin-bottom:10px}
      .card-quote{font-size:35px;margin-bottom:6px}
      .card-dream-copy{font-size:16px;line-height:1.16}
      .card-dream-copy.long{font-size:13.4px;line-height:1.21}
      .card-dream-copy.very-long{font-size:11.2px;line-height:1.25}
      .card-footer-final{padding-top:8px;gap:8px}
      .card-archive small,.card-signoff small{font-size:4px}
      .card-archive strong{font-size:7px}.card-signoff strong{font-size:5.5px}.card-url{font-size:3.9px}
    }
    @media(max-width:390px){
      .compact-card-wrap{width:min(70vw,286px);padding-left:19px;padding-right:19px}
      .compact-card,.card-face{min-height:472px}
      .card-face{padding:17px 16px 15px}
      .card-big-number{font-size:42px}
      .card-dream-area{min-height:229px}
      .card-dream-copy{font-size:14.8px}.card-dream-copy.long{font-size:12.5px}.card-dream-copy.very-long{font-size:10.5px}
    }


    /* =========================================================
       V24 — MINI 3D COLLECTIBLE
       In-page card intentionally < 1/2 mobile viewport width.
       Strong perspective + visible physical depth.
       Exported 9:16 card is untouched.
       ========================================================= */
    .compact-card-wrap{
      --tilt-x:6deg;--tilt-y:-11deg;--shine-x:38%;--shine-y:18%;
      width:100%;
      margin:0 auto 2px;
      padding:26px 0 42px;
      display:flex;
      justify-content:center;
      align-items:center;
      perspective:900px;
      perspective-origin:50% 44%;
      overflow:visible;
    }
    .compact-card-wrap:before{
      left:50%;right:auto;bottom:12px;width:min(42vw,176px);height:24px;
      transform:translateX(-43%) translateZ(-100px) rotate(-2deg);
      background:linear-gradient(90deg,rgba(31,224,246,.44),rgba(92,98,255,.22) 50%,rgba(239,64,220,.48));
      filter:blur(18px);opacity:.90;
    }
    .compact-card-wrap:after{
      left:50%;right:auto;bottom:12px;width:min(36vw,150px);height:15px;
      transform:translateX(-42%);
      background:rgba(0,0,0,.72);filter:blur(12px);
    }
    .compact-card{
      width:min(44vw,188px);
      min-height:0;
      aspect-ratio:9 / 16;
      transform-style:preserve-3d;
      transform:rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) rotateZ(.45deg);
      transform-origin:50% 52%;
      filter:drop-shadow(18px 28px 24px rgba(0,0,0,.58));
      animation:miniCardArrival .9s cubic-bezier(.16,.84,.24,1) both;
    }
    .compact-card:before{
      content:"";position:absolute;z-index:-4;
      inset:10px -19px -22px 12px;
      border-radius:20px;
      background:linear-gradient(145deg,#07121a 0%,#090a16 48%,#13091b 100%);
      border:1px solid rgba(188,101,255,.36);
      box-shadow:-7px 0 20px rgba(43,226,247,.17),14px 15px 27px rgba(231,69,217,.20);
      transform:translateZ(-62px);
      pointer-events:none;
    }
    .compact-card:after{
      left:8%;right:-8%;bottom:-19px;height:18px;
      background:linear-gradient(90deg,rgba(38,228,248,.70),rgba(99,95,255,.34) 50%,rgba(238,67,220,.74));
      filter:blur(13px);opacity:.9;
    }
    .card-edge{
      inset:7px -14px -17px 7px;
      border-radius:20px;
      background:linear-gradient(145deg,#29efff 0%,#378cff 28%,#7665ff 56%,#f04bd8 100%);
      box-shadow:
        -5px 2px 16px rgba(39,229,250,.34),
        11px 11px 22px rgba(236,67,218,.30),
        0 22px 36px rgba(0,0,0,.62),
        inset 0 0 10px rgba(255,255,255,.12);
      transform:translateZ(-42px) translateY(2px);
      opacity:1;
    }
    .card-edge:after{
      inset:2px 3px 4px 4px;border-radius:17px;
      background:linear-gradient(145deg,#07131b 0%,#050910 52%,#100817 100%);
      opacity:.94;
    }
    .card-face{
      min-height:0;height:100%;
      padding:12px 11px 10px;
      border-radius:18px;
      display:flex;flex-direction:column;
      background:
        radial-gradient(circle at 3% 2%,rgba(38,229,249,.22),transparent 28%),
        radial-gradient(circle at 100% 4%,rgba(239,71,220,.20),transparent 30%),
        radial-gradient(circle at 72% 98%,rgba(99,88,255,.15),transparent 34%),
        linear-gradient(155deg,#07151e 0%,#04080e 47%,#0b0612 100%);
      border:1px solid rgba(207,228,246,.19);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.11),
        inset 0 0 28px rgba(76,157,208,.045),
        0 18px 38px rgba(0,0,0,.48);
    }
    .card-face:before{
      background:
        linear-gradient(112deg,transparent 17%,rgba(255,255,255,.075) 30%,transparent 42%),
        radial-gradient(circle at var(--shine-x) var(--shine-y),rgba(255,255,255,.15),transparent 18%);
      opacity:.92;
    }
    .card-face:after{
      padding:1.15px;
      background:linear-gradient(130deg,#48f1ff 0%,rgba(255,255,255,.12) 26%,rgba(103,104,255,.38) 57%,#f15bdc 100%);
      opacity:1;
    }
    .card-main-head{gap:6px;transform:translateZ(33px)}
    .card-brand-name{font-size:9.4px;letter-spacing:-.04em}
    .card-official{font-size:2.9px;gap:3px;letter-spacing:.13em}.card-official i{width:3px;height:3px;box-shadow:0 0 7px rgba(128,234,240,.9)}
    .card-big-number{margin-top:13px;font-size:31px;line-height:.82;transform:translateZ(54px);filter:drop-shadow(0 7px 13px rgba(82,184,255,.18))}
    .card-facts{margin-top:15px;grid-template-columns:1fr 1fr;gap:8px 6px;transform:translateZ(37px)}
    .card-origin-fact{grid-column:1 / -1;gap:5px}.card-date{grid-column:2;grid-row:2;text-align:right}
    .card-fact-label{margin-bottom:2.5px;font-size:2.8px;letter-spacing:.14em}
    .card-fact strong{font-size:6.4px;line-height:1.05}.card-date strong{font-size:5.3px}
    .card-flag{width:23px;height:17px;border-radius:5px;box-shadow:0 4px 8px rgba(0,0,0,.38),0 0 0 1px rgba(85,234,244,.14)}
    .card-dream-area{min-height:0;flex:1;margin-top:7px;padding:9px 0 5px;justify-content:center;transform:translateZ(58px)}
    .card-dream-label{margin-bottom:6px;font-size:2.8px;letter-spacing:.16em}
    .card-quote{margin-bottom:4px;font-size:23px;line-height:.55;text-shadow:0 0 12px rgba(137,102,255,.36)}
    .card-dream-copy{max-width:100%;font-size:9.1px;line-height:1.16;letter-spacing:-.038em}
    .card-dream-copy.long{font-size:7.7px;line-height:1.19}
    .card-dream-copy.very-long{font-size:6.55px;line-height:1.21}
    .card-footer-final{padding-top:5px;gap:5px;transform:translateZ(34px)}
    .card-archive small,.card-signoff small{font-size:2.4px;letter-spacing:.12em}
    .card-archive strong{margin-top:3px;font-size:4.5px}
    .card-signoff strong{margin-top:3px;font-size:3.5px;letter-spacing:.045em}
    .card-url{margin-top:3px;font-size:2.35px}

    @keyframes miniCardArrival{
      0%{opacity:0;transform:translateY(22px) scale(.88) rotateX(14deg) rotateY(-24deg) rotateZ(1deg)}
      100%{opacity:1;transform:rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) rotateZ(.45deg)}
    }

    @media(max-width:760px){
      .compact-card-wrap{
        --tilt-x:7deg;--tilt-y:-13deg;
        width:100%;padding:20px 0 36px;margin:0 auto;
        perspective:720px;
      }
      .compact-card{width:min(45vw,184px);min-height:0;aspect-ratio:9 / 16}
      .card-face{min-height:0;height:100%;padding:11px 10px 9px;border-radius:17px}
      .card-edge{inset:6px -13px -15px 6px;border-radius:19px;transform:translateZ(-40px) translateY(2px)}
      .card-edge:after{border-radius:16px}
      .card-brand-name{font-size:8.8px}.card-official{font-size:2.7px}
      .card-big-number{margin-top:12px;font-size:29px}
      .card-facts{margin-top:13px;gap:7px 5px}
      .card-fact strong{font-size:6px}.card-date strong{font-size:5px}
      .card-flag{width:22px;height:16px}
      .card-dream-area{margin-top:6px;padding:8px 0 5px}
      .card-dream-copy{font-size:8.7px}.card-dream-copy.long{font-size:7.4px}.card-dream-copy.very-long{font-size:6.3px}
      .card-footer-final{padding-top:4px}
    }
    @media(max-width:390px){
      .compact-card{width:44vw;max-width:172px}
      .card-face{padding:10px 9px 8px}
      .card-big-number{font-size:27px}
      .card-dream-copy{font-size:8.1px}.card-dream-copy.long{font-size:6.9px}.card-dream-copy.very-long{font-size:5.9px}
    }
  </style>
</head>
<body>
  <header class="top">
    <div class="shell">
      <div class="top-nav">
        <a class="brand" href="${siteUrl}/" aria-label="OneDreamEach home">
          <span>
            <strong>OneDreamEach</strong>
            <small><i></i><span>PERMANENT ARCHIVE</span><b>DREAM #${padded}</b></small>
          </span>
        </a>
        <a class="home-link" href="${siteUrl}/" aria-label="Home">
          <span class="home-icon" aria-hidden="true">${rocketIcon()}</span>
          <span class="home-copy"><small>BACK TO</small><b>HOME</b></span>
        </a>
      </div>

      <nav class="world-tabs" aria-label="OneDreamEach worlds">
        ${worldTab("map","WORLD 01","MAP",siteUrl + "/world-dream-map.html")}
        ${worldTab("wall","WORLD 02","WALL",siteUrl + "/explore")}
        ${worldTab("chain","WORLD 03","CHAIN",siteUrl + "/chain.html")}
        ${worldTab("puzzle","WORLD 04","PUZZLE",siteUrl + "/puzzle.html")}
      </nav>
    </div>
  </header>

  <main class="shell">
    <section class="hero">
      <div class="hero-kicker"><i></i> ONE DREAM EACH &middot; PERMANENT DREAM PAGE</div>
      <h1>ONE DREAM.<br><span>FOUR WORLDS.</span></h1>
      <p>One real person. One permanent number. The same Dream lives across the Map, Wall, Chain and Puzzle. This is <strong>Dream #${padded}</strong>.</p>
      <div class="hero-pills">
        <span><i></i> REAL HUMAN DREAM</span>
        <span>ONE OF 1,000,000</span>
        <span>SHAREABLE OFFICIAL CARD</span>
      </div>
    </section>

    <div class="compact-card-wrap" id="dream-card-stage">
      <article class="compact-card" id="official-dream-card" aria-label="Official Dream Card">
        <div class="card-edge" aria-hidden="true"></div>
        <div class="card-face">
          <div class="card-main-head">
            <div class="card-brand-name">OneDreamEach</div>
            <div class="card-official"><i></i> OFFICIAL DREAM</div>
          </div>

          <div class="card-big-number">#${padded}</div>

          <div class="card-facts">
            <div class="card-fact card-origin-fact">
              <div class="card-flag">
                ${flagUrl ? `<img src="${flagUrl}" alt="Flag of ${safeCountry}">` : `<span class="flag-fallback">${escapeHtml(countryCode || "WORLD")}</span>`}
              </div>
              <div>
                <span class="card-fact-label">FROM</span>
                <strong>${safeCountry.toUpperCase()}</strong>
              </div>
            </div>
            <div class="card-fact card-dreamer-fact">
              <span class="card-fact-label">DREAMER</span>
              <strong class="${nameClass.trim()}">${safeNickname}</strong>
            </div>
            <div class="card-fact card-date">
              <span class="card-fact-label">DATE</span>
              <strong>${safeDreamDate}</strong>
            </div>
          </div>

          <div class="card-dream-area">
            <span class="card-dream-label">THE DREAM</span>
            <span class="card-quote" aria-hidden="true">“</span>
            <p class="card-dream-copy${dreamText.length > 190 ? " very-long" : dreamText.length > 105 ? " long" : ""}">${safeDream}</p>
          </div>

          <div class="card-footer-final">
            <div class="card-archive">
              <small>PERMANENT ARCHIVE</small>
              <strong>1 OF 1,000,000</strong>
            </div>
            <div class="card-signoff">
              <small>DREAMED BY ${safeNickname.toUpperCase()}</small>
              <strong>ONE PERSON. ONE DREAM.</strong>
              <span class="card-url">ONEDREAMEACH.COM/DREAM/${number}</span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div class="under-card">
      <button class="memory-button" id="memory-button" type="button" aria-pressed="false">
        <span class="memory-heart" aria-hidden="true">${heartIcon()}</span>
        <span class="memory-copy"><small>YOUR WALL MEMORY</small><b id="memory-label">STAYED WITH ME</b></span>
      </button>
      <a class="world-entry" href="#four-worlds">OPEN THE FOUR WORLDS &darr;</a>
    </div>

    ${buildSocialHtml(instagram,tiktok)}

    <section class="section" id="share-actions">
      <div class="section-head">
        <small>MAKE THE DREAM TRAVEL</small>
        <h2>SHARE THE <span>OFFICIAL CARD.</span></h2>
        <p>The 9:16 export matches the card itself: number, flag, country, Dreamer, date and Dream — ready for Stories, Reels and TikTok.</p>
      </div>
      <div class="share-actions">
        <button class="share-action primary" id="share-card" type="button">${shareIcon()}<span>SHARE DREAM CARD</span></button>
        <button class="share-action" id="download-card" type="button">${downloadIcon()}<span>DOWNLOAD 9:16</span></button>
        <button class="share-action" id="copy-link" type="button">${linkIcon()}<span>COPY DREAM LINK</span></button>
      </div>
      <div class="share-status" id="share-status" role="status" aria-live="polite"></div>
    </section>

    <section class="section" id="four-worlds">
      <div class="section-head">
        <small>ONE CARD &middot; FOUR WORLDS</small>
        <h2>THE SAME DREAM.<br><span>EVERYWHERE.</span></h2>
        <p>This page is the permanent source. The same Official Dream Card becomes the visual language used when this Dream opens in every world.</p>
      </div>
      <div class="world-grid">
        ${worldCard("map","WORLD 01","MAP","See it on Earth",siteUrl + "/world-dream-map.html")}
        ${worldCard("wall","WORLD 02","WALL","Read it in the archive",siteUrl + "/explore")}
        ${worldCard("chain","WORLD 03","CHAIN","Pass it forward",siteUrl + "/chain.html")}
        ${worldCard("puzzle","WORLD 04","PUZZLE","Find its piece",siteUrl + "/puzzle.html")}
      </div>
    </section>

    <section class="cta">
      <small>ONE MILLION PEOPLE &middot; ONE DREAM EACH</small>
      <h2>THIS DREAM HAS A PLACE.<br><span>WHAT ABOUT YOURS?</span></h2>
      <p>Leave one Dream, receive your permanent number and enter the same four-world archive.</p>
      <a href="${siteUrl}/#leave">LEAVE YOUR DREAM &middot; &euro;1</a>
    </section>
  </main>

  <script>
  (function(){
    "use strict";
    const dream = ${JSON.stringify({dream_number:number,dream_text:dreamText,nickname,country,countryCode,flagUrl,originImageDataUrl,instagram,tiktok,xHandle,dateLabel:dreamDate})};
    const padded = ${JSON.stringify(padded)};
    const dreamUrl = ${JSON.stringify(canonicalUrl)};
    const shareCaption = ${JSON.stringify("OneDreamEach · Dream #" + padded + "\nKeep this dream close. Share it forward. ✦")};
    const shareStatus = document.getElementById("share-status");
    const memoryButton = document.getElementById("memory-button");
    const memoryLabel = document.getElementById("memory-label");
    const dreamCardStage = document.getElementById("dream-card-stage");
    const dreamCard = document.getElementById("official-dream-card");

    // Premium 3D interaction: subtle on desktop, scroll-safe on mobile.
    if(dreamCardStage && dreamCard && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      let raf=0;
      dreamCardStage.addEventListener("pointermove",function(ev){
        if(ev.pointerType==="touch" || window.innerWidth<760)return;
        const r=dreamCardStage.getBoundingClientRect();
        const px=Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width));
        const py=Math.max(0,Math.min(1,(ev.clientY-r.top)/r.height));
        cancelAnimationFrame(raf);
        raf=requestAnimationFrame(function(){
          dreamCardStage.style.setProperty("--tilt-y",(-11 + (px-.5)*10).toFixed(2)+"deg");
          dreamCardStage.style.setProperty("--tilt-x",(6 + (.5-py)*7).toFixed(2)+"deg");
          dreamCardStage.style.setProperty("--shine-x",(px*100).toFixed(1)+"%");
          dreamCardStage.style.setProperty("--shine-y",(py*100).toFixed(1)+"%");
        });
      });
      dreamCardStage.addEventListener("pointerleave",function(){
        dreamCardStage.style.setProperty("--tilt-x","6deg");
        dreamCardStage.style.setProperty("--tilt-y","-11deg");
        dreamCardStage.style.setProperty("--shine-x","50%");
        dreamCardStage.style.setProperty("--shine-y","22%");
      });
    }

    function setStatus(text){ if(shareStatus) shareStatus.textContent = text || ""; }

    function syncMemory(){
      let stayed=false;
      try{ stayed=localStorage.getItem("ode-wall-stayed-"+dream.dream_number)==="1"; }catch(e){}
      if(memoryButton){memoryButton.classList.toggle("active",stayed);memoryButton.setAttribute("aria-pressed",stayed?"true":"false");}
      if(memoryLabel) memoryLabel.textContent=stayed?"IT STAYED WITH ME":"STAYED WITH ME";
      return stayed;
    }
    memoryButton && memoryButton.addEventListener("click",function(){
      const next=!syncMemory();
      try{
        localStorage.setItem("ode-wall-stayed-"+dream.dream_number,next?"1":"0");
        if(next){localStorage.setItem("ode-wall-stayed-data-"+dream.dream_number,JSON.stringify({dream_number:dream.dream_number,dream_text:dream.dream_text,nickname:dream.nickname,country:dream.country}));}
      }catch(e){}
      syncMemory();
    });
    syncMemory();

    async function copyText(text){
      if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(text);return;}
      const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.focus();ta.select();document.execCommand("copy");ta.remove();
    }

    function roundRect(ctx,x,y,w,h,r,fill,stroke){
      const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
    }
    function fitLines(ctx,text,maxWidth,maxLines){
      const words=String(text||"").trim().split(/\\s+/).filter(Boolean),lines=[];let line="";
      for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width<=maxWidth){line=test;}else{if(line)lines.push(line);line=word;if(lines.length>=maxLines-1)break;}}
      if(line && lines.length<maxLines)lines.push(line);return lines;
    }
    async function loadFlag(){
      if(!dream.flagUrl)return null;
      try{const r=await fetch(dream.flagUrl,{mode:"cors",cache:"force-cache"});if(!r.ok)return null;const b=await r.blob();const u=URL.createObjectURL(b);const img=new Image();await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=u});img.__url=u;return img;}catch(e){return null;}
    }
    async function buildCardBlob(){
      await (document.fonts?.ready || Promise.resolve());

      const c=document.createElement("canvas");
      c.width=1080;c.height=1920;
      const x=c.getContext("2d",{alpha:false});
      if(!x)throw new Error("Canvas unavailable");

      function txt(v,xp,yp,font,color,align){x.font=font;x.fillStyle=color;x.textAlign=align||"left";x.textBaseline="alphabetic";x.fillText(String(v||""),xp,yp)}
      function rr(px,py,pw,ph,r,fill,stroke){roundRect(x,px,py,pw,ph,r,fill,stroke)}
      function cover(img,dx,dy,dw,dh){const ir=img.width/img.height,dr=dw/dh;let sx=0,sy=0,sw=img.width,sh=img.height;if(ir>dr){sw=img.height*dr;sx=(img.width-sw)/2}else{sh=img.width/dr;sy=(img.height-sh)/2}x.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh)}
      function splitWord(word,maxWidth){if(x.measureText(word).width<=maxWidth)return[word];const out=[];let part="";for(const ch of word){const t=part+ch;if(x.measureText(t).width<=maxWidth)part=t;else{if(part)out.push(part);part=ch}}if(part)out.push(part);return out}
      function wrap(value,maxWidth){const words=String(value||"").trim().split(/\s+/).filter(Boolean),out=[];let line="";for(const raw of words){for(const word of splitWord(raw,maxWidth)){const test=line?line+" "+word:word;if(x.measureText(test).width<=maxWidth)line=test;else{if(line)out.push(line);line=word}}}if(line)out.push(line);return out.length?out:[""]}
      function fitDream(value,maxWidth,maxHeight){const sizes=[64,60,56,52,48,44,40,36,32,28];for(const size of sizes){x.font="800 "+size+"px Inter, Arial";const lines=wrap(value,maxWidth);const lh=Math.round(size*1.18);if(lines.length*lh<=maxHeight)return{size,lines,lh}}x.font="800 28px Inter, Arial";let lines=wrap(value,maxWidth);const lh=34,maxLines=Math.floor(maxHeight/lh);if(lines.length>maxLines){lines=lines.slice(0,maxLines);let last=lines[maxLines-1]||"";while(last&&x.measureText(last+"…").width>maxWidth)last=last.slice(0,-1).trim();lines[maxLines-1]=(last||"")+"…"}return{size:28,lines,lh}}
      function fitSmall(value,maxWidth,start,min){let size=start;while(size>min){x.font="800 "+size+"px Space Grotesk, Inter, Arial";if(x.measureText(String(value||"")).width<=maxWidth)break;size--}return size}

      // Social canvas: mostly black, the collectible itself provides the color.
      const bg=x.createLinearGradient(0,0,1080,1920);bg.addColorStop(0,"#03070c");bg.addColorStop(.55,"#07101a");bg.addColorStop(1,"#080610");x.fillStyle=bg;x.fillRect(0,0,1080,1920);
      let g=x.createRadialGradient(120,160,0,120,160,660);g.addColorStop(0,"rgba(67,220,237,.16)");g.addColorStop(1,"rgba(67,220,237,0)");x.fillStyle=g;x.fillRect(0,0,780,780);
      g=x.createRadialGradient(1000,420,0,1000,420,700);g.addColorStop(0,"rgba(185,93,231,.14)");g.addColorStop(1,"rgba(185,93,231,0)");x.fillStyle=g;x.fillRect(360,0,720,1080);

      const cardX=80,cardY=68,cardW=920,cardH=1768;
      // Physical depth.
      const edge=x.createLinearGradient(cardX,cardY,cardX+cardW,cardY+cardH);edge.addColorStop(0,"#36D9EA");edge.addColorStop(.52,"#667EF6");edge.addColorStop(1,"#C05DDF");
      x.save();x.shadowColor="rgba(0,0,0,.62)";x.shadowBlur=46;x.shadowOffsetY=28;rr(cardX+16,cardY+22,cardW,cardH,54,edge);x.restore();
      rr(cardX+22,cardY+28,cardW-4,cardH-4,51,"rgba(3,7,13,.82)");

      const face=x.createLinearGradient(cardX,cardY,cardX+cardW,cardY+cardH);face.addColorStop(0,"#07151F");face.addColorStop(.46,"#050A11");face.addColorStop(1,"#090713");
      x.lineWidth=2;rr(cardX,cardY,cardW,cardH,54,face,"rgba(164,189,220,.22)");
      x.lineWidth=2;rr(cardX+5,cardY+5,cardW-10,cardH-10,50,null,"rgba(86,225,239,.30)");

      // Header.
      txt("OneDreamEach",132,180,"800 40px Space Grotesk, Inter, Arial","#F7FAFC");
      x.beginPath();x.arc(732,165,6,0,Math.PI*2);x.fillStyle="#79E8EF";x.shadowColor="rgba(121,232,239,.7)";x.shadowBlur=12;x.fill();x.shadowBlur=0;
      txt("OFFICIAL DREAM",946,174,"900 15px Inter, Arial","#8D9BAA","right");

      const numGrad=x.createLinearGradient(128,0,760,0);numGrad.addColorStop(0,"#52E4EE");numGrad.addColorStop(.44,"#78B9FF");numGrad.addColorStop(.72,"#A782FF");numGrad.addColorStop(1,"#DF7CD5");
      txt("#"+padded,124,370,"900 170px Space Grotesk, Inter, Arial",numGrad);

      // Facts are not boxes: three clear identity points.
      const flag=await loadFlag();
      rr(132,454,92,66,16,"#0A1420","rgba(255,255,255,.13)");
      if(flag){x.save();rr(136,458,84,58,13);x.clip();cover(flag,136,458,84,58);x.restore();if(flag.__url)URL.revokeObjectURL(flag.__url)}
      txt("FROM",244,466,"900 12px Inter, Arial","#6D7D8C");
      const country=String(dream.country||"World").toUpperCase();const countrySize=fitSmall(country,250,30,18);txt(country,244,508,"800 "+countrySize+"px Space Grotesk, Inter, Arial","#F3F6F8");

      txt("DREAMER",520,466,"900 12px Inter, Arial","#6D7D8C");
      const name=String(dream.nickname||"Anonymous");const nameSize=fitSmall(name,210,28,18);txt(name,520,508,"800 "+nameSize+"px Space Grotesk, Inter, Arial","#F3F6F8");

      txt("DATE",790,466,"900 12px Inter, Arial","#6D7D8C");
      txt(String(dream.dateLabel||""),790,508,"800 23px Space Grotesk, Inter, Arial","#F3F6F8");

      // Dream — no decorative panel or divider. Just the content.
      txt("THE DREAM",132,622,"900 13px Inter, Arial","#6A7A89");
      txt("“",128,734,"92px Georgia, serif","#8A7BF6");
      const fit=fitDream(dream.dream_text,800,760);const blockH=fit.lines.length*fit.lh;let yy=785+Math.max(0,(720-blockH)/2)+fit.size*.78;
      for(const line of fit.lines){x.save();x.shadowColor="rgba(0,0,0,.35)";x.shadowBlur=14;x.shadowOffsetY=4;txt(line,150,yy,"800 "+fit.size+"px Inter, Arial","#FCFDFF");x.restore();yy+=fit.lh}

      // Footer identity.
      txt("PERMANENT ARCHIVE",132,1610,"900 12px Inter, Arial","#657685");
      const rankGrad=x.createLinearGradient(132,0,360,0);rankGrad.addColorStop(0,"#65E1EA");rankGrad.addColorStop(.55,"#A6A4FF");rankGrad.addColorStop(1,"#DD86D1");
      txt("1 OF 1,000,000",132,1648,"900 24px Space Grotesk, Inter, Arial",rankGrad);
      txt("DREAMED BY "+name.toUpperCase(),946,1598,"900 11px Inter, Arial","#6C7D8B","right");
      txt("ONE PERSON. ONE DREAM.",946,1639,"800 19px Space Grotesk, Inter, Arial","#EEF2F5","right");
      txt("ONEDREAMEACH.COM/DREAM/"+dream.dream_number,946,1682,"800 13px Inter, Arial","#70DDE7","right");

      // Tiny authenticity mark, intentionally quiet.
      txt("OFFICIAL #"+padded,132,1772,"900 10px Inter, Arial","rgba(138,151,165,.52)");
      txt("SAVE · SHARE · KEEP",946,1772,"900 10px Inter, Arial","rgba(138,151,165,.52)","right");

      return await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error("Unable to create image")),"image/png",1));
    }
    function downloadBlob(blob){
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;
      a.download=blob.name||("onedreameach-dream-"+padded+".png");
      a.rel="noopener";
      a.target="_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),4000);
    }
    function blobToDataUrl(blob){
      return new Promise((resolve,reject)=>{
        const reader=new FileReader();
        reader.onload=()=>resolve(reader.result);
        reader.onerror=()=>reject(reader.error||new Error("Unable to prepare download"));
        reader.readAsDataURL(blob);
      });
    }
    async function downloadGeneratedFile(file){
      const filename=file.name||("onedreameach-dream-"+padded+".png");
      try{
        // Data URLs are much more reliable than blob: downloads inside Android/WebView browsers.
        const dataUrl=await blobToDataUrl(file);
        const a=document.createElement("a");
        a.href=dataUrl;
        a.download=filename;
        a.setAttribute("download",filename);
        a.style.display="none";
        document.body.appendChild(a);
        a.click();
        a.remove();
        return true;
      }catch(err){
        console.warn("Direct data download unavailable",err);
      }

      try{
        // Fallback for browsers that support blob downloads normally.
        downloadBlob(file);
        return true;
      }catch(err){
        console.warn("Blob download unavailable",err);
      }

      // Final fallback: open the image so the user can save it from the browser UI.
      const fallbackUrl=URL.createObjectURL(file);
      window.open(fallbackUrl,"_blank","noopener");
      setTimeout(()=>URL.revokeObjectURL(fallbackUrl),15000);
      return true;
    }
    async function getCardFile(){const blob=await buildCardBlob();return new File([blob],"OneDreamEach-Dream-"+padded+".png",{type:"image/png"});}
    let cachedCardFilePromise=null;
    function prepareCardFile(){
      if(!cachedCardFilePromise){
        cachedCardFilePromise=getCardFile().catch(err=>{cachedCardFilePromise=null;throw err;});
      }
      return cachedCardFilePromise;
    }
    setTimeout(()=>{prepareCardFile().catch(()=>{});},350);
async function buildSharePreviewBlob(){
      await (document.fonts?.ready || Promise.resolve());
      const c=document.createElement("canvas");c.width=1080;c.height=1080;const x=c.getContext("2d",{alpha:false});if(!x)throw new Error("Canvas unavailable");
      function txt(v,xp,yp,font,color,align){x.font=font;x.fillStyle=color;x.textAlign=align||"left";x.textBaseline="alphabetic";x.fillText(String(v||""),xp,yp)}
      function rr(px,py,pw,ph,r,fill,stroke){roundRect(x,px,py,pw,ph,r,fill,stroke)}
      function cover(img,dx,dy,dw,dh){const ir=img.width/img.height,dr=dw/dh;let sx=0,sy=0,sw=img.width,sh=img.height;if(ir>dr){sw=img.height*dr;sx=(img.width-sw)/2}else{sh=img.width/dr;sy=(img.height-sh)/2}x.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh)}
      function wrap(text,maxWidth){const words=String(text||"").trim().split(/\s+/),lines=[];let line="";for(const w of words){const t=line?line+" "+w:w;if(x.measureText(t).width<=maxWidth)line=t;else{if(line)lines.push(line);line=w}}if(line)lines.push(line);return lines}
      function fit(text,maxWidth,maxLines){for(let size=45;size>=27;size-=2){x.font="800 "+size+"px Inter, Arial";const lines=wrap(text,maxWidth);if(lines.length<=maxLines)return{size,lines,lh:Math.round(size*1.18)}}x.font="800 27px Inter, Arial";let lines=wrap(text,maxWidth).slice(0,maxLines);if(wrap(text,maxWidth).length>maxLines)lines[maxLines-1]=(lines[maxLines-1]||"").replace(/[.,;:!?]*$/,'')+"…";return{size:27,lines,lh:32}}

      const bg=x.createLinearGradient(0,0,1080,1080);bg.addColorStop(0,"#03080D");bg.addColorStop(.6,"#07101A");bg.addColorStop(1,"#090611");x.fillStyle=bg;x.fillRect(0,0,1080,1080);
      let g=x.createRadialGradient(90,100,0,90,100,580);g.addColorStop(0,"rgba(69,222,238,.18)");g.addColorStop(1,"rgba(69,222,238,0)");x.fillStyle=g;x.fillRect(0,0,700,700);
      g=x.createRadialGradient(1040,200,0,1040,200,620);g.addColorStop(0,"rgba(190,92,232,.16)");g.addColorStop(1,"rgba(190,92,232,0)");x.fillStyle=g;x.fillRect(390,0,690,760);

      const cx=100,cy=92,cw=880,ch=896;const edge=x.createLinearGradient(cx,cy,cx+cw,cy+ch);edge.addColorStop(0,"#36D9EA");edge.addColorStop(.52,"#657CF5");edge.addColorStop(1,"#BD5EDF");
      x.save();x.shadowColor="rgba(0,0,0,.58)";x.shadowBlur=42;x.shadowOffsetY=20;rr(cx+14,cy+18,cw,ch,46,edge);x.restore();rr(cx+20,cy+24,cw-2,ch-2,43,"rgba(3,7,13,.82)");
      const face=x.createLinearGradient(cx,cy,cx+cw,cy+ch);face.addColorStop(0,"#07151F");face.addColorStop(.5,"#050A11");face.addColorStop(1,"#090713");x.lineWidth=2;rr(cx,cy,cw,ch,46,face,"rgba(164,190,221,.22)");

      txt("OneDreamEach",150,178,"800 37px Space Grotesk, Inter, Arial","#F8FAFC");txt("OFFICIAL DREAM",930,174,"900 12px Inter, Arial","#8B99A8","right");
      const ng=x.createLinearGradient(148,0,680,0);ng.addColorStop(0,"#53E4EE");ng.addColorStop(.46,"#78B9FF");ng.addColorStop(.72,"#A782FF");ng.addColorStop(1,"#DE7CD4");txt("#"+padded,144,322,"900 118px Space Grotesk, Inter, Arial",ng);

      const flag=await loadFlag();rr(150,370,72,52,13,"#0A1420","rgba(255,255,255,.13)");if(flag){x.save();rr(154,374,64,44,10);x.clip();cover(flag,154,374,64,44);x.restore();if(flag.__url)URL.revokeObjectURL(flag.__url)}
      txt(String(dream.country||"World").toUpperCase(),240,406,"800 22px Space Grotesk, Inter, Arial","#F3F6F8");txt(String(dream.dateLabel||""),930,406,"800 18px Space Grotesk, Inter, Arial","#AAB5C0","right");

      txt("“",148,510,"72px Georgia, serif","#897AF6");const ft=fit(dream.dream_text,735,6);let yy=538;for(const ln of ft.lines){txt(ln,190,yy,"800 "+ft.size+"px Inter, Arial","#FCFDFF");yy+=ft.lh}

      txt("DREAMED BY",150,864,"900 10px Inter, Arial","#6B7B89");txt(String(dream.nickname||"Anonymous"),150,900,"800 26px Space Grotesk, Inter, Arial","#F2F5F7");txt("1 OF 1,000,000",930,866,"900 13px Inter, Arial","#A8A5FF","right");txt("ONE PERSON. ONE DREAM.",930,902,"800 16px Space Grotesk, Inter, Arial","#E8EEF2","right");txt("ONEDREAMEACH.COM/DREAM/"+dream.dream_number,930,936,"800 10px Inter, Arial","#70DDE7","right");

      return await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error("Unable to create share preview")),"image/png",1));
    }
    async function getShareCardFile(){const blob=await buildSharePreviewBlob();return new File([blob],"OneDreamEach-Dream-"+padded+".png",{type:"image/png"});}

    document.getElementById("download-card")?.addEventListener("click",async function(){
      try{
        setStatus("Creating your Official Dream Card...");
        let file;
        try{file=await prepareCardFile();}
        catch(firstError){cachedCardFilePromise=null;file=await prepareCardFile();}
        await downloadGeneratedFile(file);
        setStatus("Dream Card ready to save.");
      }catch(e){
        if(e&&e.name==="AbortError")setStatus("");
        else{console.error("DREAM CARD DOWNLOAD ERROR",e);setStatus("Unable to download the card right now.");}
      }
    });
    document.getElementById("share-card")?.addEventListener("click",async function(){
      try{
        setStatus("Preparing your share card...");
        const file=await getShareCardFile();
        const shareData={
          title:"OneDreamEach · Dream #"+padded,
          text:shareCaption,
          url:dreamUrl,
          files:[file]
        };
        if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
          try{
            await navigator.share(shareData);
          }catch(primaryError){
            if(primaryError&&primaryError.name==="AbortError")throw primaryError;
            // Some Android share sheets reject url + files together; keep branded caption as fallback.
            await navigator.share({
              title:"OneDreamEach · Dream #"+padded,
              text:shareCaption,
              files:[file]
            });
          }
          setStatus("Dream shared.");
        }else if(navigator.share){
          await navigator.share({title:"OneDreamEach · Dream #"+padded,text:shareCaption,url:dreamUrl});
          setStatus("Dream page shared.");
        }else{
          await downloadGeneratedFile(file);
          setStatus("Share card saved — share it anywhere.");
        }
      }catch(e){
        if(e&&e.name==="AbortError")setStatus("");
        else{console.error(e);setStatus("Unable to share right now.");}
      }
    });
    document.getElementById("copy-link")?.addEventListener("click",async function(){try{await copyText(dreamUrl);setStatus("Dream link copied.");}catch(e){setStatus("Unable to copy the link.");}});
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


async function getOriginVisual(env, country) {
  const key = env.MAPTILER_KEY || env.MAPTILER_API_KEY || env.NEXT_PUBLIC_MAPTILER_KEY || "";
  if (!key || !country || String(country).toLowerCase() === "world") return "";

  try {
    const geocodeUrl =
      "https://api.maptiler.com/geocoding/" + encodeURIComponent(country) +
      ".json?types=country&limit=1&language=en&key=" + encodeURIComponent(key);

    const geoRes = await fetchWithTimeout(geocodeUrl, {}, 2200);
    if (!geoRes.ok) return "";
    const geo = await geoRes.json();
    const feature = Array.isArray(geo.features) ? geo.features[0] : null;
    if (!feature) return "";

    const mapId = String(env.MAPTILER_ORIGIN_MAP_ID || "hybrid-v4");
    let area = "";

    if (Array.isArray(feature.bbox) && feature.bbox.length === 4) {
      area = feature.bbox.map(n => Number(n).toFixed(5)).join(",");
    } else if (feature.geometry && Array.isArray(feature.geometry.coordinates)) {
      const [lon, lat] = feature.geometry.coordinates;
      area = Number(lon).toFixed(5) + "," + Number(lat).toFixed(5) + ",4";
    } else {
      return "";
    }

    const staticUrl =
      "https://api.maptiler.com/maps/" + encodeURIComponent(mapId) +
      "/static/" + area + "/720x360.png?key=" + encodeURIComponent(key);

    const imageRes = await fetchWithTimeout(staticUrl, {}, 2600);
    if (!imageRes.ok) return "";

    const type = imageRes.headers.get("content-type") || "image/png";
    if (!type.startsWith("image/")) return "";
    const buffer = await imageRes.arrayBuffer();
    if (!buffer || buffer.byteLength > 900000) return "";

    return "data:" + type + ";base64," + arrayBufferToBase64(buffer);
  } catch (error) {
    console.warn("Origin visual unavailable:", error?.message || error);
    return "";
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  }
  return btoa(binary);
}

function formatDreamDate(value){
  const d=new Date(value||Date.now());
  if(Number.isNaN(d.getTime()))return "—";
  const months=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return String(d.getUTCDate()).padStart(2,"0")+" "+months[d.getUTCMonth()]+" "+d.getUTCFullYear();
}
function escapeHtml(value){return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");}
function htmlResponse(html,status){return new Response(html,{status,headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});}
function normalizeHandle(value){return String(value||"").trim().replace(/^@/,"");}

function miniSocialLink(type,handle,href,label){
  const icon = socialMiniIcon(type);
  if(handle && href){
    return '<a class="mini-social" href="'+href+'" target="_blank" rel="noopener noreferrer" aria-label="'+label+' @'+escapeHtml(handle)+'">'+icon+'</a>';
  }
  return '<span class="mini-social disabled" aria-hidden="true">'+icon+'</span>';
}

function socialMiniIcon(type){
  if(type==="instagram")return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4.5" y="4.5" width="15" height="15" rx="4.2" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3.6" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.8" r="1.1" fill="currentColor"/></svg>';
  if(type==="tiktok")return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13.2 5v8.4a3.4 3.4 0 1 1-3.4-3.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.2 5c1 1.8 2.3 3 4.4 3.3" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
  return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 5l12 14M18 5 6 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
}

function buildSocialHtml(instagram,tiktok){
  if(!instagram&&!tiktok)return "";const links=[];
  if(instagram)links.push('<a class="social-link" href="https://instagram.com/'+encodeURIComponent(instagram)+'" target="_blank" rel="noopener noreferrer">INSTAGRAM &middot; @'+escapeHtml(instagram)+'</a>');
  if(tiktok)links.push('<a class="social-link" href="https://tiktok.com/@'+encodeURIComponent(tiktok)+'" target="_blank" rel="noopener noreferrer">TIKTOK &middot; @'+escapeHtml(tiktok)+'</a>');
  return '<div class="socials"><div class="social-label">FIND THE DREAMER</div>'+links.join("")+'</div>';
}

function worldTab(type,kicker,label,href){return '<a class="world-tab" href="'+href+'"><span class="world-tab-icon">'+worldIcon(type)+'</span><span class="world-tab-copy"><small>'+kicker+'</small><b>'+label+'</b></span><em aria-hidden="true">&nearr;</em></a>';}
function worldChip(type,label){return '<div class="world-chip '+type+'">'+worldIcon(type)+'<b>'+label+'</b></div>';}
function worldCard(type,kicker,label,desc,href){return '<a class="world-card" href="'+href+'"><span class="world-card-icon">'+worldIcon(type)+'</span><span><small>'+kicker+'</small><b>'+label+'</b><em>'+desc+'</em></span><strong>&nearr;</strong></a>';}

function worldIcon(type){
  if(type==="map")return '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="23" fill="#0E2130" stroke="#6EDFF2" stroke-width="1.7"/><path d="M14 32h36M19 24.5c3.8 1.8 8.1 2.7 13 2.7s9.2-.9 13-2.7M19 39.5c3.8-1.8 8.1-2.7 13-2.7s9.2.9 13 2.7" stroke="#6EDFF2" stroke-opacity=".35" stroke-width="1.4" fill="none"/><path fill="#9BE8F4" d="M22 21l6 1 3 4-3 5-6 1-4-4z"/><path fill="#A6B8FF" d="M37 28l6-1 4 4-2 6-6 1-4-4z"/></svg>';
  if(type==="wall")return '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="11" y="15" width="42" height="34" rx="9" fill="#0A121B" stroke="#A98BFF" stroke-width="1.5"/><path d="M11 27h42M11 38h42M25 15v12M39 15v12M18 27v11M32 27v11M46 27v11" stroke="#A98BFF" stroke-opacity=".30"/><rect x="27" y="20" width="11" height="15" rx="2" fill="#F1E3C9" transform="rotate(-5 32 28)"/></svg>';
  if(type==="chain")return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M23 40l-6 6a8.5 8.5 0 1 1-12-12l9-9a8.5 8.5 0 0 1 12 0" fill="none" stroke="#9BE7F4" stroke-width="5" stroke-linecap="round"/><path d="M41 24l6-6a8.5 8.5 0 1 1 12 12l-9 9a8.5 8.5 0 0 1-12 0" fill="none" stroke="#AEB0FF" stroke-width="5" stroke-linecap="round"/><path d="M23 41l18-18" stroke="#D6F9FF" stroke-width="2.8" stroke-linecap="round"/></svg>';
  return '<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="#8EF03B" d="M25 10c0 4 3 7 7 7 .8 0 1.5-.1 2-.3v6.5h8c.8 0 1.3.5 1.3 1.3 0 .3-.1.6-.3.9-.8 1-1.3 2.2-1.3 3.6 0 3.2 2.6 5.8 5.8 5.8 1.4 0 2.6-.5 3.6-1.3.3-.2.6-.3.9-.3.8 0 1.3.5 1.3 1.3V42h-7c.2.6.3 1.3.3 2 0 4-3 7-7 7s-7-3-7-7c0-.7.1-1.4.3-2H25v-7.5c0-.8-.5-1.3-1.3-1.3-.3 0-.6.1-.9.3-1 .8-2.2 1.3-3.6 1.3-3.2 0-5.8-2.6-5.8-5.8 0-1.4.5-2.6 1.3-3.6.2-.3.3-.6.3-.9 0-.8-.5-1.3-1.3-1.3H10V15h8c-.2-.6-.3-1.3-.3-2 0-4 3-7 7-7z"/></svg>';
}
function rocketIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="odeRocketG" x1="4" y1="20" x2="20" y2="4" gradientUnits="userSpaceOnUse"><stop stop-color="#72E7EF"/><stop offset=".55" stop-color="#9FB7FF"/><stop offset="1" stop-color="#E191D4"/></linearGradient></defs><path d="M14.7 3.7c2.2-.6 4-.4 4.6 0 .4.6.6 2.4 0 4.6-.8 2.9-2.9 5-5.6 6.8l-4.2-4.2c1.7-2.7 3.8-4.8 6.7-7.2Z" fill="url(#odeRocketG)"/><circle cx="15.9" cy="8.1" r="1.8" fill="#071522" opacity=".9"/><path d="M9.5 11.4 6.4 12l-2.3 2.3 4.2.5M12.7 14.6l-.6 3.1-2.3 2.3-.5-4.2" fill="#74E6EF" opacity=".92"/><path d="M8.3 16.1 4.7 19.7" stroke="#E58ED1" stroke-width="1.7" stroke-linecap="round"/></svg>';}
function heartIcon(){return '<svg viewBox="0 0 24 24" fill="none"><path d="M12 20s-7-4.3-8.7-8.1C1.8 8.7 3.5 5.5 6.7 5.1c2-.2 3.6.8 5.3 2.7 1.7-1.9 3.3-2.9 5.3-2.7 3.2.4 4.9 3.6 3.4 6.8C19 15.7 12 20 12 20Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';}
function shareIcon(){return '<svg viewBox="0 0 24 24" fill="none"><path d="M8.5 12.5 15.8 7m-7.3 4.5 7.3 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="6" cy="12" r="2.6" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="6" r="2.6" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="18" r="2.6" stroke="currentColor" stroke-width="1.7"/></svg>';}
function downloadIcon(){return '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 17v3h14v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';}
function linkIcon(){return '<svg viewBox="0 0 24 24" fill="none"><path d="m9.5 14.5 5-5M7.8 16.2l-1.5 1.5a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0M16.2 7.8l1.5-1.5a3.5 3.5 0 1 1 5 5l-4 4a3.5 3.5 0 0 1-5 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';}

function errorPage(title,text){return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escapeHtml(title)+' — OneDreamEach</title><style>*{box-sizing:border-box}body{min-height:100vh;margin:0;display:grid;place-items:center;background:radial-gradient(circle at 50% 10%,rgba(121,74,219,.18),transparent 35%),#07101b;color:#eef2f7;font-family:Arial,sans-serif;text-align:center}.box{width:min(520px,90%);padding:44px 28px;border:1px solid rgba(131,112,223,.25);border-radius:24px;background:rgba(8,10,18,.78)}h1{font-size:32px;margin:0}p{margin:12px 0 0;color:#98a2b1;line-height:1.6}a{display:inline-flex;margin-top:22px;padding:13px 18px;border:1px solid rgba(101,226,246,.28);border-radius:13px;color:#dffaff;text-decoration:none;font-weight:700;font-size:12px}</style></head><body><div class="box"><h1>'+escapeHtml(title)+'</h1><p>'+escapeHtml(text)+'</p><a href="/explore">RETURN TO THE DREAM WALL</a></div></body></html>';}

function getCountryCode(country){
  const key=String(country||"").trim().toLowerCase();const codes={
    "afghanistan":"AF","albania":"AL","algeria":"DZ","andorra":"AD","angola":"AO","antigua and barbuda":"AG","argentina":"AR","armenia":"AM","australia":"AU","austria":"AT","azerbaijan":"AZ","bahamas":"BS","bahrain":"BH","bangladesh":"BD","barbados":"BB","belarus":"BY","belgium":"BE","belize":"BZ","benin":"BJ","bhutan":"BT","bolivia":"BO","bosnia and herzegovina":"BA","botswana":"BW","brazil":"BR","brunei":"BN","bulgaria":"BG","burkina faso":"BF","burundi":"BI","cambodia":"KH","cameroon":"CM","canada":"CA","cape verde":"CV","cabo verde":"CV","central african republic":"CF","chad":"TD","chile":"CL","china":"CN","colombia":"CO","comoros":"KM","congo":"CG","democratic republic of the congo":"CD","dr congo":"CD","costa rica":"CR","croatia":"HR","cuba":"CU","cyprus":"CY","czech republic":"CZ","czechia":"CZ","denmark":"DK","djibouti":"DJ","dominica":"DM","dominican republic":"DO","ecuador":"EC","egypt":"EG","el salvador":"SV","equatorial guinea":"GQ","eritrea":"ER","estonia":"EE","eswatini":"SZ","swaziland":"SZ","ethiopia":"ET","fiji":"FJ","finland":"FI","france":"FR","gabon":"GA","gambia":"GM","georgia":"GE","germany":"DE","ghana":"GH","greece":"GR","grenada":"GD","guatemala":"GT","guinea":"GN","guinea-bissau":"GW","guyana":"GY","haiti":"HT","honduras":"HN","hungary":"HU","iceland":"IS","india":"IN","indonesia":"ID","iran":"IR","iraq":"IQ","ireland":"IE","israel":"IL","italy":"IT","ivory coast":"CI","cote d'ivoire":"CI","jamaica":"JM","japan":"JP","jordan":"JO","kazakhstan":"KZ","kenya":"KE","kiribati":"KI","kuwait":"KW","kyrgyzstan":"KG","laos":"LA","latvia":"LV","lebanon":"LB","lesotho":"LS","liberia":"LR","libya":"LY","liechtenstein":"LI","lithuania":"LT","luxembourg":"LU","madagascar":"MG","malawi":"MW","malaysia":"MY","maldives":"MV","mali":"ML","malta":"MT","marshall islands":"MH","mauritania":"MR","mauritius":"MU","mexico":"MX","micronesia":"FM","moldova":"MD","monaco":"MC","mongolia":"MN","montenegro":"ME","morocco":"MA","mozambique":"MZ","myanmar":"MM","namibia":"NA","nauru":"NR","nepal":"NP","netherlands":"NL","new zealand":"NZ","nicaragua":"NI","niger":"NE","nigeria":"NG","north korea":"KP","north macedonia":"MK","norway":"NO","oman":"OM","pakistan":"PK","palau":"PW","palestine":"PS","panama":"PA","papua new guinea":"PG","paraguay":"PY","peru":"PE","philippines":"PH","poland":"PL","portugal":"PT","qatar":"QA","romania":"RO","russia":"RU","rwanda":"RW","saint kitts and nevis":"KN","saint lucia":"LC","saint vincent and the grenadines":"VC","samoa":"WS","san marino":"SM","sao tome and principe":"ST","saudi arabia":"SA","senegal":"SN","serbia":"RS","seychelles":"SC","sierra leone":"SL","singapore":"SG","slovakia":"SK","slovenia":"SI","solomon islands":"SB","somalia":"SO","south africa":"ZA","south korea":"KR","south sudan":"SS","spain":"ES","sri lanka":"LK","sudan":"SD","suriname":"SR","sweden":"SE","switzerland":"CH","syria":"SY","taiwan":"TW","tajikistan":"TJ","tanzania":"TZ","thailand":"TH","timor-leste":"TL","east timor":"TL","togo":"TG","tonga":"TO","trinidad and tobago":"TT","tunisia":"TN","turkey":"TR","türkiye":"TR","turkmenistan":"TM","tuvalu":"TV","uganda":"UG","ukraine":"UA","united arab emirates":"AE","united kingdom":"GB","uk":"GB","united states":"US","united states of america":"US","usa":"US","uruguay":"UY","uzbekistan":"UZ","vanuatu":"VU","vatican city":"VA","venezuela":"VE","vietnam":"VN","yemen":"YE","zambia":"ZM","zimbabwe":"ZW"
  };return codes[key]||"";
}
