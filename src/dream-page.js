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
    const countryCode = getCountryCode(country);
    const flagUrl = countryCode
      ? "https://flagcdn.com/w160/" + countryCode.toLowerCase() + ".png"
      : "";

    // Optional origin image: if a MapTiler key is available, the Worker
    // generates a small country map image server-side and embeds it as a data URL.
    // If Static Maps is unavailable on the account, the card falls back to the flag.
    const originImageDataUrl = await getOriginVisual(env, country);

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
       V13 — COMPACT OFFICIAL DREAM CARD
       OneDreamEach / Dream / Origin / Dreamer / Four Worlds
       ========================================================= */

    .compact-card-wrap{width:min(690px,100%);margin:0 auto}
    .compact-card{
      position:relative;overflow:hidden;border-radius:30px;padding:16px;
      background:
        radial-gradient(circle at 4% 0%,rgba(67,226,239,.14),transparent 30%),
        radial-gradient(circle at 100% 4%,rgba(198,102,255,.17),transparent 34%),
        linear-gradient(145deg,#071521 0%,#0d1428 52%,#1c102a 100%);
      border:1px solid rgba(173,128,255,.42);
      box-shadow:0 0 0 1px rgba(0,0,0,.82),0 25px 70px rgba(0,0,0,.38),0 0 45px rgba(93,226,239,.08),0 0 52px rgba(201,107,255,.08),inset 0 1px 0 rgba(255,255,255,.06);
      isolation:isolate;
    }
    .compact-card:before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;background:linear-gradient(120deg,rgba(91,231,241,.82),rgba(145,137,255,.18) 48%,rgba(213,112,255,.74));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;z-index:5}
    .compact-card:after{content:"";position:absolute;right:-92px;top:42%;width:280px;height:280px;border-radius:50%;border:1px solid rgba(190,132,255,.10);box-shadow:0 0 0 50px rgba(90,226,239,.018),0 0 0 100px rgba(188,112,255,.014);pointer-events:none}

    .compact-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;position:relative;z-index:2;margin-bottom:12px}
    .compact-brand strong{display:block;font:800 clamp(29px,5.5vw,44px)/.94 "Space Grotesk",Inter,sans-serif;letter-spacing:-.05em;color:#f7fafc;text-shadow:0 0 20px rgba(130,181,255,.12)}
    .compact-number-label{display:block;margin-top:8px;color:#7de1e9;font-size:8px;font-weight:900;letter-spacing:.22em}
    .compact-number{display:block;margin-top:4px;font:900 clamp(21px,4.9vw,34px)/1 "Space Grotesk",Inter,sans-serif;letter-spacing:-.03em;background:linear-gradient(90deg,#6de7ee 0%,#adaeff 55%,#e28cd1 100%);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 0 24px rgba(141,120,255,.10)}
    .compact-live{position:relative;overflow:hidden;flex:0 0 auto;min-height:34px;padding:0 13px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(218,159,255,.32);background:rgba(25,14,44,.46);color:#eac3ff;font:900 7px/1 Inter,sans-serif;letter-spacing:.12em;box-shadow:0 0 20px rgba(202,104,255,.10),inset 0 1px 0 rgba(255,255,255,.05);animation:compactLive 2.5s ease-in-out infinite}
    .compact-live i{width:7px;height:7px;border-radius:50%;background:#66e9ef;box-shadow:0 0 13px rgba(102,233,239,.78)}
    .compact-live:after{content:"";position:absolute;inset:1px auto 1px -30%;width:28%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.16),transparent);transform:skewX(-18deg);animation:compactSweep 4.6s ease-in-out infinite}
    @keyframes compactLive{0%,100%{box-shadow:0 0 16px rgba(202,104,255,.09),inset 0 1px 0 rgba(255,255,255,.05)}50%{box-shadow:0 0 28px rgba(202,104,255,.18),inset 0 1px 0 rgba(255,255,255,.07)}}
    @keyframes compactSweep{0%,56%{transform:translateX(0) skewX(-18deg);opacity:0}67%{opacity:.9}88%{transform:translateX(480%) skewX(-18deg);opacity:0}100%{opacity:0}}

    .origin-panel{position:relative;z-index:2;overflow:hidden;min-height:212px;border-radius:24px;border:1px solid rgba(128,208,231,.18);background:#07111c;box-shadow:0 0 0 1px rgba(0,0,0,.54),inset 0 1px 0 rgba(255,255,255,.04)}
    .origin-panel:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(4,12,20,.92) 0%,rgba(4,12,20,.54) 48%,rgba(15,8,28,.58) 100%);z-index:1}
    .origin-panel:after{content:"";position:absolute;inset:0;background:linear-gradient(130deg,rgba(80,230,240,.11),transparent 38%,rgba(197,101,255,.13));z-index:2;pointer-events:none}
    .origin-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.82) contrast(1.08) brightness(.60);transform:scale(1.03)}
    .origin-fallback{position:absolute;inset:0;background-size:cover;background-position:center;filter:blur(10px) saturate(.7) brightness(.35);transform:scale(1.15);opacity:.72}
    .origin-content{position:relative;z-index:3;min-height:212px;padding:20px 22px;display:grid;grid-template-columns:minmax(0,1fr) 74px;align-items:end;gap:14px}
    .origin-flag{justify-self:end;align-self:start;width:74px;height:74px;border-radius:22px;display:grid;place-items:center;overflow:hidden;background:#09121e;border:2px solid rgba(98,231,240,.68);box-shadow:0 0 0 4px rgba(0,0,0,.38),0 0 26px rgba(94,230,240,.17)}
    .origin-flag img{width:100%;height:100%;object-fit:cover}
    .origin-copy small{display:block;color:#76dfe7;font-size:7px;font-weight:900;letter-spacing:.18em}
    .origin-country{margin-top:8px;color:#fff;font:900 clamp(38px,8vw,62px)/.90 "Space Grotesk",Inter,sans-serif;letter-spacing:-.055em;text-transform:uppercase;text-shadow:0 7px 30px rgba(0,0,0,.42);max-width:100%;word-break:normal;overflow-wrap:normal}.origin-country.country-long{font-size:clamp(32px,6.6vw,50px)}.origin-country.country-very-long{font-size:clamp(26px,5.5vw,40px);line-height:.95}
    .origin-tools{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:14px}.origin-number-chip{display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:0 14px;border-radius:999px;border:1px solid rgba(148,130,255,.22);background:rgba(8,15,28,.45);box-shadow:inset 0 1px 0 rgba(255,255,255,.05);color:#d7b7f6;font:900 10px/1 Inter,sans-serif;letter-spacing:.14em}.mini-socials{display:flex;align-items:center;gap:8px}.mini-social{width:34px;height:34px;border-radius:12px;display:grid;place-items:center;background:rgba(8,15,28,.58);border:1px solid rgba(104,227,239,.16);box-shadow:inset 0 1px 0 rgba(255,255,255,.04);color:#d9e7ef;text-decoration:none;transition:.18s ease}.mini-social:hover,.mini-social:focus-visible{transform:translateY(-1px);border-color:rgba(218,159,255,.35);color:#fff}.mini-social svg{width:16px;height:16px}.mini-social.disabled{opacity:.35;border-color:rgba(255,255,255,.08);color:#8396a3;pointer-events:none}

    .compact-dream{position:relative;z-index:2;margin:12px 0 0;padding:21px 16px 20px 36px;border-radius:20px;border:1px solid rgba(159,126,255,.11);background:linear-gradient(145deg,rgba(4,12,21,.38),rgba(18,11,33,.34));color:#fbfcff;font-size:clamp(22px,4.8vw,35px);line-height:1.18;font-weight:780;letter-spacing:-.048em;text-align:left;overflow-wrap:anywhere}
    .compact-dream:before{content:"“";position:absolute;left:12px;top:8px;color:#875ce4;font:70px/1 Georgia,serif;opacity:.78}
    .compact-dream.long{font-size:clamp(18px,4.2vw,29px);line-height:1.24}
    .compact-dream.very-long{font-size:clamp(15px,3.6vw,24px);line-height:1.28}

    .compact-meta{position:relative;z-index:2;margin-top:13px;padding:15px 2px 12px;border-top:1px solid rgba(105,225,239,.10);display:flex;align-items:center;justify-content:space-between;gap:14px}
    .compact-dreamer small{display:block;color:#72e4ed;font-size:7px;font-weight:900;letter-spacing:.20em}
    .compact-dreamer strong{display:block;margin-top:6px;color:#f5f8fa;font:800 clamp(18px,4.2vw,28px)/1.02 "Space Grotesk",Inter,sans-serif;letter-spacing:-.03em;max-width:240px;word-break:normal;overflow-wrap:anywhere}.compact-dreamer strong.name-long{font-size:clamp(16px,3.7vw,24px)}.compact-dreamer strong.name-very-long{font-size:clamp(14px,3.3vw,20px);line-height:1.05}
    .compact-side{display:flex;align-items:center;gap:10px}
    .compact-status{display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:0 13px;border-radius:999px;border:1px solid rgba(108,226,239,.18);background:rgba(8,15,29,.46);color:#f7f2ff;font:900 7px/1 Inter,sans-serif;letter-spacing:.13em;white-space:nowrap}
    .compact-status:before{content:"";width:7px;height:7px;margin-right:7px;border-radius:50%;background:#79e9df;box-shadow:0 0 10px rgba(121,233,223,.55)}
    .compact-seal{width:52px;height:52px;border-radius:18px;display:grid;place-items:center;border:1px solid rgba(225,147,255,.34);background:radial-gradient(circle,rgba(202,116,255,.18),rgba(13,11,27,.72) 65%);box-shadow:0 0 20px rgba(195,110,255,.12);color:#e5b8ff;font-size:24px}

    .compact-worlds{position:relative;z-index:2;margin-top:1px;padding-top:12px;border-top:1px solid rgba(255,255,255,.055);display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
    .compact-world{min-width:0;min-height:62px;border-radius:15px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:#b9c8d0;background:rgba(4,11,20,.28);border:1px solid rgba(255,255,255,.04)}
    .compact-world svg{width:30px;height:30px;filter:drop-shadow(0 0 9px rgba(105,225,239,.08))}
    .compact-world b{font:800 7px/1 "Space Grotesk",Inter,sans-serif;letter-spacing:.12em}
    .compact-world:nth-child(1){border-color:rgba(86,224,238,.11)}
    .compact-world:nth-child(2){border-color:rgba(190,132,255,.12)}
    .compact-world:nth-child(3){border-color:rgba(87,222,205,.11)}
    .compact-world:nth-child(4){border-color:rgba(156,240,74,.12)}
    .compact-keep{position:relative;z-index:2;margin:12px 0 2px;padding:11px 14px;border-radius:16px;border:1px solid rgba(192,132,255,.14);background:linear-gradient(90deg,rgba(68,214,232,.08),rgba(111,104,237,.09),rgba(202,96,226,.12));text-align:center;color:#9fb0ba;font-size:8px;font-weight:900;letter-spacing:.16em}.compact-keep span{background:linear-gradient(90deg,#6de7ee,#acaeff,#e38ed2);-webkit-background-clip:text;background-clip:text;color:transparent}

    /* =========================================================
       DREAM PAGE V20 — DEFINITIVE PERSONAL DREAM EXPERIENCE
       Clean, brighter, social-first and tied to the real 9:16 card.
       ========================================================= */
    .dream-intro{position:relative;overflow:hidden;margin:0 auto 28px;padding:42px 34px 38px;border:1px solid rgba(107,225,239,.20);border-radius:31px;background:
      radial-gradient(circle at 0% 0%,rgba(63,224,237,.19),transparent 34%),
      radial-gradient(circle at 100% 0%,rgba(201,104,255,.20),transparent 38%),
      linear-gradient(145deg,rgba(12,32,45,.97),rgba(21,20,44,.98));
      box-shadow:0 26px 74px rgba(0,0,0,.22),0 0 54px rgba(88,226,239,.07),inset 0 1px 0 rgba(255,255,255,.06)}
    .dream-intro:before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,#65e9ef,#a8a7ff 52%,#e98bd2)}
    .dream-intro:after{content:"";position:absolute;right:-130px;bottom:-230px;width:500px;height:500px;border-radius:50%;border:1px solid rgba(203,129,255,.12);box-shadow:0 0 0 64px rgba(90,225,239,.022),0 0 0 128px rgba(192,105,255,.018);pointer-events:none}
    .dream-intro-kicker{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;gap:9px;color:#83ebf1;font-size:7.5px;font-weight:900;letter-spacing:.18em;text-align:center}.dream-intro-kicker i{width:8px;height:8px;border-radius:50%;background:#6cebf0;box-shadow:0 0 16px rgba(108,235,240,.90)}
    .dream-intro h1{position:relative;z-index:2;margin:20px auto 0;max-width:900px;text-align:center;font:850 clamp(44px,6.6vw,80px)/.91 "Space Grotesk",Inter,sans-serif;letter-spacing:-.065em;color:#f8fbfd}.dream-intro h1 span{background:linear-gradient(90deg,#78eaf0,#b5adff 50%,#ed91d5);-webkit-background-clip:text;background-clip:text;color:transparent}
    .dream-intro p{position:relative;z-index:2;max-width:710px;margin:22px auto 0;text-align:center;color:#adbdc6;font-size:15px;line-height:1.58}.dream-intro p strong{color:#fff}
    .dream-intro-facts{position:relative;z-index:2;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;max-width:720px;margin:24px auto 0}.dream-intro-fact{min-height:60px;padding:11px 14px;border-radius:17px;border:1px solid rgba(129,211,230,.14);background:rgba(4,13,23,.40);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.035)}.dream-intro-fact small{color:#718b98;font-size:6px;font-weight:900;letter-spacing:.14em}.dream-intro-fact b{display:block;margin-top:6px;color:#eef7fa;font:800 12px/1 "Space Grotesk",Inter,sans-serif;letter-spacing:.045em}.dream-intro-fact:nth-child(2){border-color:rgba(190,135,255,.18)}.dream-intro-fact:nth-child(2) b{color:#edd9ff}.dream-intro-fact:nth-child(3){border-color:rgba(106,231,217,.16)}.dream-intro-fact:nth-child(3) b{color:#bdf4eb}

    .compact-card{box-shadow:0 0 0 1px rgba(0,0,0,.82),0 36px 96px rgba(0,0,0,.40),0 0 72px rgba(90,228,239,.12),0 0 84px rgba(200,106,255,.11),inset 0 1px 0 rgba(255,255,255,.09)}
    .compact-dream{background:linear-gradient(145deg,rgba(5,17,29,.60),rgba(28,13,43,.48));border-color:rgba(163,126,255,.16)}
    .under-card{margin-top:14px}.memory-button,.world-entry{border-color:rgba(129,211,231,.18);background:linear-gradient(145deg,rgba(10,29,41,.92),rgba(19,18,39,.95))}

    .share-studio{position:relative;overflow:hidden;margin-top:34px;padding:30px;border:1px solid rgba(111,222,239,.20);border-radius:30px;background:
      radial-gradient(circle at 0% 0%,rgba(70,221,235,.13),transparent 34%),
      radial-gradient(circle at 100% 12%,rgba(197,107,255,.15),transparent 36%),
      linear-gradient(145deg,rgba(9,28,40,.97),rgba(20,17,39,.98));box-shadow:0 22px 62px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.05)}
    .share-studio:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(110deg,transparent 0%,rgba(255,255,255,.025) 42%,transparent 58%)}
    .share-studio-grid{position:relative;z-index:2;display:grid;grid-template-columns:minmax(230px,310px) minmax(0,1fr);gap:34px;align-items:center}
    .share-preview-shell{position:relative;width:min(100%,290px);aspect-ratio:9/16;margin:auto;padding:7px;border-radius:28px;background:linear-gradient(145deg,rgba(99,232,240,.72),rgba(161,126,255,.44) 47%,rgba(235,137,211,.70));box-shadow:0 24px 64px rgba(0,0,0,.36),0 0 42px rgba(104,225,239,.10)}
    .share-preview-shell:after{content:"9:16 · STORY READY";position:absolute;left:50%;bottom:-13px;transform:translateX(-50%);min-height:26px;padding:0 11px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:#0a1523;border:1px solid rgba(115,224,239,.20);color:#a7eaf0;font:900 6.3px/1 Inter,sans-serif;letter-spacing:.13em;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.25)}
    .share-preview-inner{position:relative;overflow:hidden;width:100%;height:100%;border-radius:22px;background:linear-gradient(145deg,#071723,#17132e);display:grid;place-items:center}
    .share-preview-image{display:block;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .28s ease}.share-preview-image.ready{opacity:1}
    .share-preview-loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#8fa8b3;font:900 7px/1 Inter,sans-serif;letter-spacing:.12em;text-align:center}.share-preview-loading i{width:24px;height:24px;border-radius:50%;border:2px solid rgba(116,228,239,.18);border-top-color:#74e4ed;animation:previewSpin .9s linear infinite}@keyframes previewSpin{to{transform:rotate(360deg)}}
    .share-studio-copy{min-width:0}.share-studio-copy>small{display:block;color:#77e3eb;font-size:7px;font-weight:900;letter-spacing:.18em}.share-studio-copy h2{margin:9px 0 0;font:850 clamp(32px,4.7vw,56px)/.95 "Space Grotesk",Inter,sans-serif;letter-spacing:-.055em}.share-studio-copy h2 span{background:linear-gradient(90deg,#74e9ef,#b1adff,#e98fd3);-webkit-background-clip:text;background-clip:text;color:transparent}.share-studio-copy p{max-width:620px;margin:15px 0 0;color:#97aab5;font-size:13px;line-height:1.6}.share-studio-copy p strong{color:#eef7fa}
    .share-ready-row{display:flex;flex-wrap:wrap;gap:7px;margin-top:16px}.share-ready-row span{min-height:29px;padding:0 10px;border-radius:999px;display:inline-flex;align-items:center;border:1px solid rgba(133,207,227,.13);background:rgba(5,13,22,.42);color:#90a8b4;font:900 6px/1 Inter,sans-serif;letter-spacing:.12em}.share-ready-row span:nth-child(2){color:#e2c7ff;border-color:rgba(194,135,255,.18)}.share-ready-row span:nth-child(3){color:#b5efe7;border-color:rgba(98,226,209,.16)}
    .share-actions{grid-template-columns:1.25fr 1fr;margin-top:19px}.share-action{min-height:64px;border-color:rgba(134,211,230,.17);background:rgba(5,15,25,.58);font-size:9px}.share-action.primary{border-color:rgba(103,231,240,.34);background:linear-gradient(110deg,rgba(35,159,179,.38),rgba(92,70,190,.42) 54%,rgba(183,83,210,.30));box-shadow:0 14px 34px rgba(73,121,194,.15)}.share-action.copy{grid-column:1/-1;min-height:48px;background:rgba(5,13,22,.36);color:#9fb1bb}.share-status{font-size:8.5px;color:#86a0ad;margin-top:11px;text-align:left}

    .section{border-color:rgba(131,204,223,.17);background:radial-gradient(circle at 3% 2%,rgba(70,213,224,.10),transparent 30%),linear-gradient(145deg,rgba(10,28,40,.95),rgba(18,18,38,.97));box-shadow:0 20px 58px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.045)}
    .world-card{border-color:rgba(137,207,224,.14);background:linear-gradient(145deg,rgba(6,18,28,.60),rgba(16,14,30,.62))}

    @media(max-width:760px){
      .dream-intro{padding:30px 17px 27px;border-radius:26px;margin-bottom:24px}.dream-intro-kicker{font-size:5.8px;letter-spacing:.14em}.dream-intro h1{font-size:clamp(39px,12.4vw,58px);margin-top:16px}.dream-intro p{font-size:13px;margin-top:16px}.dream-intro-facts{gap:6px;margin-top:18px}.dream-intro-fact{min-height:52px;padding:8px 5px;border-radius:14px}.dream-intro-fact small{font-size:4.8px}.dream-intro-fact b{font-size:8px}
      .share-studio{padding:20px 14px 22px;border-radius:25px;margin-top:28px}.share-studio-grid{grid-template-columns:1fr;gap:30px}.share-preview-shell{width:min(74vw,270px)}.share-studio-copy{text-align:center}.share-studio-copy>small{font-size:6px}.share-studio-copy h2{font-size:clamp(34px,10vw,47px)}.share-studio-copy p{font-size:11.5px;margin:13px auto 0}.share-ready-row{justify-content:center;margin-top:14px}.share-ready-row span{font-size:5.4px}.share-actions{grid-template-columns:1fr;gap:7px}.share-action,.share-action.copy{grid-column:auto;min-height:57px}.share-status{text-align:center;font-size:7.5px}
    }

    @media(max-width:760px){
      .compact-card-wrap{width:min(640px,100%)}
      .compact-card{border-radius:24px;padding:12px}
      .compact-head{margin:2px 2px 10px;gap:9px}
      .compact-brand strong{font-size:26px}
      .compact-number-label{font-size:6.5px}
      .compact-number{font-size:20px}
      .compact-live{min-height:30px;padding:0 10px;font-size:6px}
      .origin-panel,.origin-content{min-height:165px}
      .origin-content{grid-template-columns:minmax(0,1fr) 60px;padding:15px;gap:10px}
      .origin-flag{width:60px;height:60px;border-radius:18px}
      .origin-copy small{font-size:6px}
      .origin-country{font-size:clamp(30px,10vw,48px)}.origin-country.country-long{font-size:clamp(26px,8.2vw,38px)}.origin-country.country-very-long{font-size:clamp(22px,6.8vw,30px)}
      .origin-tools{gap:6px;margin-top:10px}.origin-number-chip{min-height:28px;padding:0 10px;font-size:7px}.mini-socials{gap:6px}.mini-social{width:28px;height:28px;border-radius:10px}.mini-social svg{width:13px;height:13px}
      .compact-dream{margin-top:11px;padding:18px 12px 17px 31px;font-size:clamp(20px,6.6vw,28px);border-radius:18px}
      .compact-dream:before{left:10px;top:7px;font-size:54px}
      .compact-dream.long{font-size:clamp(17px,5.2vw,24px)}
      .compact-dream.very-long{font-size:clamp(14px,4.4vw,20px)}
      .compact-meta{margin-top:10px;padding:13px 1px 10px;gap:10px}
      .compact-dreamer strong{font-size:20px;max-width:150px}.compact-dreamer strong.name-long{font-size:17px}.compact-dreamer strong.name-very-long{font-size:15px}
      .compact-status{min-height:28px;padding:0 10px;font-size:6.3px}
      .compact-seal{width:44px;height:44px;border-radius:15px;font-size:20px}
      .compact-worlds{gap:4px;padding-top:10px}
      .compact-world{min-height:54px;border-radius:12px}
      .compact-world svg{width:26px;height:26px}
      .compact-world b{font-size:6px}
      .compact-keep{font-size:6px;padding:10px 8px}
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
    <section class="dream-intro">
      <div class="dream-intro-kicker"><i></i> DREAM #${padded} &middot; ${safeCountry.toUpperCase()} &middot; PERMANENT</div>
      <h1>THIS DREAM<br><span>EXISTS NOW.</span></h1>
      <p>A real person put one thing they want from life into the world. It now has a <strong>permanent number, a public place and four ways to be discovered.</strong></p>
      <div class="dream-intro-facts">
        <div class="dream-intro-fact"><small>OFFICIAL NUMBER</small><b>#${padded}</b></div>
        <div class="dream-intro-fact"><small>ORIGIN</small><b>${safeCountry}</b></div>
        <div class="dream-intro-fact"><small>ARCHIVE</small><b>1 OF 1,000,000</b></div>
      </div>
    </section>

    <div class="compact-card-wrap">
      <article class="compact-card" id="official-dream-card" aria-label="Official Dream Card">
        <div class="compact-head">
          <div class="compact-brand">
            <strong>OneDreamEach</strong>
            <span class="compact-number-label">OFFICIAL DREAM CARD</span>
            <span class="compact-number">DREAM #${padded}</span>
          </div>
          <div class="compact-live"><i></i> LIVE IN THE ARCHIVE</div>
        </div>

        <div class="origin-panel">
          ${originImageDataUrl
            ? `<img class="origin-image" src="${originImageDataUrl}" alt="Map of ${safeCountry}">`
            : flagUrl
              ? `<div class="origin-fallback" style="background-image:url('${flagUrl}')"></div>`
              : ``}
          <div class="origin-content">
            <div class="origin-copy">
              <small>FROM</small>
              <div class="origin-country${countryClass}">${safeCountry}</div>
              <div class="origin-tools">
                <div class="origin-number-chip">ONE OF 1,000,000</div>
                <div class="mini-socials">
                  ${miniSocialLink("instagram", instagram, "https://instagram.com/" + encodeURIComponent(instagram), "Instagram")}
                  ${miniSocialLink("tiktok", tiktok, "https://tiktok.com/@" + encodeURIComponent(tiktok), "TikTok")}
                  ${miniSocialLink("x", xHandle, xHandle ? "https://x.com/" + encodeURIComponent(xHandle) : "", "X")}
                </div>
              </div>
            </div>
            <div class="origin-flag">
              ${flagUrl ? `<img src="${flagUrl}" alt="Flag of ${safeCountry}">` : `<span class="flag-fallback">${escapeHtml(countryCode || "WORLD")}</span>`}
            </div>
          </div>
        </div>

        <blockquote class="compact-dream${dreamText.length > 190 ? " very-long" : dreamText.length > 105 ? " long" : ""}">${safeDream}</blockquote>

        <div class="compact-meta">
          <div class="compact-dreamer">
            <small>DREAMED BY</small>
            <strong class="${nameClass.trim()}">${safeNickname}</strong>
          </div>
          <div class="compact-side">
            <div class="compact-status">PERMANENT · PUBLIC</div>
            <div class="compact-seal" aria-label="Official Dream Card">✦</div>
          </div>
        </div>

        <div class="compact-worlds" aria-label="Four Dream worlds">
          <div class="compact-world">${worldIcon("map")}<b>MAP</b></div>
          <div class="compact-world">${worldIcon("wall")}<b>WALL</b></div>
          <div class="compact-world">${worldIcon("chain")}<b>CHAIN</b></div>
          <div class="compact-world">${worldIcon("puzzle")}<b>PUZZLE</b></div>
        </div>

        <div class="compact-keep"><span>KEEP THIS DREAM CLOSE</span> · SAVE · SHARE · CARRY</div>
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

    <section class="share-studio" id="share-actions">
      <div class="share-studio-grid">
        <div class="share-preview-shell" aria-label="Preview of the downloadable Dream Card">
          <div class="share-preview-inner">
            <div class="share-preview-loading" id="share-preview-loading"><i></i><span>BUILDING YOUR<br>OFFICIAL CARD</span></div>
            <img class="share-preview-image" id="share-preview-image" alt="Official OneDreamEach Dream #${padded} 9:16 card preview">
          </div>
        </div>
        <div class="share-studio-copy">
          <small>MAKE THIS DREAM TRAVEL</small>
          <h2>ONE TAP.<br><span>OUT INTO THE WORLD.</span></h2>
          <p>This is not a screenshot. OneDreamEach generates a real <strong>1080 × 1920 Official Dream Card</strong> built for Stories, Reels, TikTok and messages.</p>
          <div class="share-ready-row"><span>1080 × 1920</span><span>STORY / REEL READY</span><span>SAME OFFICIAL IDENTITY</span></div>
          <div class="share-actions">
            <button class="share-action primary" id="share-card" type="button">${shareIcon()}<span>SHARE 9:16 CARD</span></button>
            <button class="share-action" id="download-card" type="button">${downloadIcon()}<span>SAVE 9:16 IMAGE</span></button>
            <button class="share-action copy" id="copy-link" type="button">${linkIcon()}<span>COPY PERMANENT DREAM LINK</span></button>
          </div>
          <div class="share-status" id="share-status" role="status" aria-live="polite"></div>
        </div>
      </div>
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
    const dream = ${JSON.stringify({dream_number:number,dream_text:dreamText,nickname,country,countryCode,flagUrl,originImageDataUrl,instagram,tiktok,xHandle})};
    const padded = ${JSON.stringify(padded)};
    const dreamUrl = ${JSON.stringify(canonicalUrl)};
    const shareCaption = ${JSON.stringify("OneDreamEach · Dream #" + padded + "\nKeep this dream close. Share it forward. ✦")};
    const shareStatus = document.getElementById("share-status");
    const memoryButton = document.getElementById("memory-button");
    const memoryLabel = document.getElementById("memory-label");

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
      c.width=1080;
      c.height=1920;
      const x=c.getContext("2d",{alpha:false});
      if(!x)throw new Error("Canvas unavailable");

      function txt(value,xp,yp,font,color,align){
        x.font=font;x.fillStyle=color;x.textAlign=align||"left";x.textBaseline="alphabetic";x.fillText(String(value||""),xp,yp);
      }
      function rr(px,py,pw,ph,r,fill,stroke){roundRect(x,px,py,pw,ph,r,fill,stroke);}
      function pill(px,py,pw,ph,fill,stroke){rr(px,py,pw,ph,ph/2,fill,stroke);}
      function line(x1,y1,x2,y2,color,w){x.beginPath();x.strokeStyle=color;x.lineWidth=w||1;x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke();}
      function glowText(value,xp,yp,font,color,align,glow){x.save();x.shadowColor=glow||"rgba(0,0,0,.45)";x.shadowBlur=18;x.shadowOffsetY=5;txt(value,xp,yp,font,color,align);x.restore();}
      function cover(img,dx,dy,dw,dh){const ir=img.width/img.height,dr=dw/dh;let sx=0,sy=0,sw=img.width,sh=img.height;if(ir>dr){sw=img.height*dr;sx=(img.width-sw)/2}else{sh=img.width/dr;sy=(img.height-sh)/2}x.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);}
      function contain(img,dx,dy,dw,dh){const scale=Math.min(dw/img.width,dh/img.height);const w=img.width*scale,h=img.height*scale;x.drawImage(img,dx+(dw-w)/2,dy+(dh-h)/2,w,h);}
      function splitLongWord(word,maxWidth){if(x.measureText(word).width<=maxWidth)return[word];const chunks=[];let chunk="";for(const ch of word){const test=chunk+ch;if(x.measureText(test).width<=maxWidth)chunk=test;else{if(chunk)chunks.push(chunk);chunk=ch}}if(chunk)chunks.push(chunk);return chunks;}
      function wrapText(value,maxWidth){const words=String(value||"").trim().split(/\\s+/).filter(Boolean),out=[];let current="";for(const rawWord of words){for(const word of splitLongWord(rawWord,maxWidth)){const test=current?current+" "+word:word;if(x.measureText(test).width<=maxWidth)current=test;else{if(current)out.push(current);current=word}}}if(current)out.push(current);return out.length?out:[""];}
      function fitDream(value,maxWidth,maxHeight){const attempts=[{size:62,maxLines:8,lh:1.14},{size:58,maxLines:9,lh:1.15},{size:54,maxLines:9,lh:1.16},{size:50,maxLines:10,lh:1.17},{size:46,maxLines:11,lh:1.18},{size:42,maxLines:12,lh:1.19},{size:38,maxLines:13,lh:1.20},{size:34,maxLines:14,lh:1.21},{size:30,maxLines:15,lh:1.22},{size:27,maxLines:16,lh:1.23}];for(const a of attempts){x.font="800 "+a.size+"px Inter, Arial";const lines=wrapText(value,maxWidth),lineH=Math.round(a.size*a.lh);if(lines.length<=a.maxLines&&lines.length*lineH<=maxHeight)return{size:a.size,lines,lineH}}x.font="800 25px Inter, Arial";let lines=wrapText(value,maxWidth),lineH=31,maxLines=Math.floor(maxHeight/lineH);if(lines.length>maxLines){lines=lines.slice(0,maxLines);let last=lines[maxLines-1]||"";while(last&&x.measureText(last+"…").width>maxWidth)last=last.slice(0,-1).trim();lines[maxLines-1]=(last||"")+"…"}return{size:25,lines,lineH};}
      function fitCountry(value,maxWidth){const label=String(value||"World").toUpperCase();for(let size=76;size>=34;size-=2){x.font="900 "+size+"px Space Grotesk, Inter, Arial";const lines=wrapText(label,maxWidth);if(lines.length<=2)return{size,lines,lineH:Math.round(size*.92)}}return{size:34,lines:wrapText(label,maxWidth).slice(0,2),lineH:32};}
      function fitName(value,maxWidth){const name=String(value||"Anonymous");for(let size=39;size>=23;size--){x.font="800 "+size+"px Space Grotesk, Inter, Arial";if(x.measureText(name).width<=maxWidth)return size}return 23;}
      async function loadImageSafe(src){if(!src)return null;try{const img=new Image();img.crossOrigin="anonymous";await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=src});return img}catch(e){return null}}
      async function loadFlag(){if(!dream.flagUrl)return null;try{const r=await fetch(dream.flagUrl,{mode:"cors",cache:"force-cache"});if(!r.ok)return null;const b=await r.blob(),u=URL.createObjectURL(b),img=new Image();await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=u});img.__url=u;return img}catch(e){return null}}

      function iconMap(cx,cy,accent){x.save();x.strokeStyle=accent;x.lineWidth=3;x.beginPath();x.arc(cx,cy,21,0,Math.PI*2);x.stroke();x.beginPath();x.arc(cx,cy,9,0,Math.PI*2);x.stroke();line(cx-20,cy,cx+20,cy,accent,2);x.restore();}
      function iconWall(cx,cy,accent){x.save();x.strokeStyle=accent;x.lineWidth=3;rr(cx-22,cy-24,44,48,8,null,accent);line(cx-13,cy-11,cx+13,cy-11,accent,2.5);line(cx-13,cy,cx+13,cy,accent,2.5);line(cx-13,cy+11,cx+5,cy+11,accent,2.5);x.restore();}
      function iconChain(cx,cy,accent){x.save();x.strokeStyle=accent;x.lineWidth=4;x.lineCap="round";x.beginPath();x.ellipse(cx-10,cy,17,11,-.55,0,Math.PI*2);x.stroke();x.beginPath();x.ellipse(cx+10,cy,17,11,-.55,0,Math.PI*2);x.stroke();line(cx-7,cy+6,cx+7,cy-6,accent,3);x.restore();}
      function iconPuzzle(cx,cy,accent){x.save();x.strokeStyle=accent;x.fillStyle="rgba(158,240,77,.08)";x.lineWidth=3;x.beginPath();x.moveTo(cx-21,cy-19);x.lineTo(cx-4,cy-19);x.bezierCurveTo(cx-8,cy-7,cx+8,cy-7,cx+4,cy-19);x.lineTo(cx+21,cy-19);x.lineTo(cx+21,cy-3);x.bezierCurveTo(cx+9,cy-7,cx+9,cy+9,cx+21,cy+5);x.lineTo(cx+21,cy+20);x.lineTo(cx+5,cy+20);x.bezierCurveTo(cx+9,cy+8,cx-7,cy+8,cx-3,cy+20);x.lineTo(cx-21,cy+20);x.closePath();x.fill();x.stroke();x.restore();}
      function worldChip(px,py,label,type,accent){rr(px,py,216,112,24,"rgba(4,13,23,.55)","rgba(255,255,255,.065)");rr(px+17,py+19,58,58,18,"rgba(8,19,31,.85)",accent);const cx=px+46,cy=py+48;if(type==="map")iconMap(cx,cy,accent);else if(type==="wall")iconWall(cx,cy,accent);else if(type==="chain")iconChain(cx,cy,accent);else iconPuzzle(cx,cy,accent);txt(label,px+108,py+94,"900 13px Inter, Arial","#C9D8DF","center");}
      function socialDot(cx,cy,label,active){rr(cx-25,cy-25,50,50,16,active?"rgba(8,19,31,.78)":"rgba(8,19,31,.42)",active?"rgba(102,228,239,.26)":"rgba(255,255,255,.07)");txt(label,cx,cy+6,"900 15px Inter, Arial",active?"#E4F1F5":"#617783","center");}

      /* Background — designed to survive TikTok / Instagram UI overlays. */
      const bg=x.createLinearGradient(0,0,1080,1920);bg.addColorStop(0,"#050B12");bg.addColorStop(.42,"#081522");bg.addColorStop(.73,"#14122A");bg.addColorStop(1,"#210E28");x.fillStyle=bg;x.fillRect(0,0,1080,1920);
      const cyan=x.createRadialGradient(50,120,0,50,120,760);cyan.addColorStop(0,"rgba(70,230,240,.24)");cyan.addColorStop(1,"rgba(70,230,240,0)");x.fillStyle=cyan;x.fillRect(0,0,800,850);
      const violet=x.createRadialGradient(1040,150,0,1040,150,760);violet.addColorStop(0,"rgba(203,104,255,.23)");violet.addColorStop(1,"rgba(203,104,255,0)");x.fillStyle=violet;x.fillRect(350,0,730,880);
      const magenta=x.createRadialGradient(860,1800,0,860,1800,700);magenta.addColorStop(0,"rgba(235,113,195,.14)");magenta.addColorStop(1,"rgba(235,113,195,0)");x.fillStyle=magenta;x.fillRect(260,1150,820,770);

      x.save();x.globalAlpha=.17;x.strokeStyle="rgba(137,112,238,.24)";x.lineWidth=2;x.beginPath();x.ellipse(750,950,480,215,-.55,0,Math.PI*2);x.stroke();x.strokeStyle="rgba(92,228,239,.17)";x.beginPath();x.ellipse(730,950,610,278,-.55,0,Math.PI*2);x.stroke();x.restore();
      x.save();x.globalAlpha=.38;for(let i=0;i<34;i++){const px=56+((i*173)%965),py=70+((i*311)%1760),r=(i%5===0?2.2:1.2);x.beginPath();x.fillStyle=i%3===0?"rgba(111,231,239,.42)":"rgba(211,161,255,.28)";x.arc(px,py,r,0,Math.PI*2);x.fill()}x.restore();

      const frameX=48,frameY=58,frameW=984,frameH=1804;
      x.save();x.shadowColor="rgba(0,0,0,.54)";x.shadowBlur=54;x.shadowOffsetY=18;rr(frameX,frameY,frameW,frameH,58,"rgba(5,12,22,.97)");x.restore();
      x.lineWidth=4;rr(frameX,frameY,frameW,frameH,58,"rgba(5,12,22,.98)","rgba(185,111,255,.68)");x.lineWidth=2;rr(frameX+7,frameY+7,frameW-14,frameH-14,52,null,"rgba(94,230,240,.46)");
      const frame=x.createLinearGradient(frameX,frameY,frameX+frameW,frameY+frameH);frame.addColorStop(0,"rgba(8,28,40,.98)");frame.addColorStop(.54,"rgba(15,21,42,.99)");frame.addColorStop(1,"rgba(39,17,49,.99)");rr(frameX+13,frameY+13,frameW-26,frameH-26,48,frame);

      /* Header */
      txt("ONEDREAMEACH",86,132,"900 18px Inter, Arial","#A8EDF1");txt("OFFICIAL DREAM · PERMANENT ARCHIVE",86,164,"900 11px Inter, Arial","#758E9A");
      const num=x.createLinearGradient(85,0,610,0);num.addColorStop(0,"#6DEAF0");num.addColorStop(.50,"#B3B0FF");num.addColorStop(1,"#EC91D5");glowText("#"+padded,84,248,"900 84px Space Grotesk, Inter, Arial",num,"left","rgba(129,115,255,.18)");
      pill(720,110,246,52,"rgba(33,17,54,.54)","rgba(225,156,255,.34)");x.beginPath();x.arc(748,136,7,0,Math.PI*2);x.fillStyle="#67EBF0";x.shadowColor="rgba(103,235,240,.92)";x.shadowBlur=13;x.fill();x.shadowBlur=0;txt("LIVE IN THE ARCHIVE",852,142,"900 12px Inter, Arial","#F0CBFF","center");
      pill(720,174,246,52,"rgba(5,16,27,.50)","rgba(102,228,239,.20)");txt("1 OF 1,000,000",843,207,"900 13px Inter, Arial","#BAEDF1","center");

      /* Origin */
      const ox=82,oy=292,ow=916,oh=300;rr(ox,oy,ow,oh,34,"#07121E","rgba(98,221,239,.22)");
      const scenic=(dream.originImageDataUrl&&/^data:/i.test(dream.originImageDataUrl))?await loadImageSafe(dream.originImageDataUrl):null;
      if(scenic){x.save();rr(ox,oy,ow,oh,34);x.clip();cover(scenic,ox,oy,ow,oh);x.restore()}
      const overlay=x.createLinearGradient(ox,oy,ox+ow,oy);overlay.addColorStop(0,"rgba(3,11,19,.96)");overlay.addColorStop(.60,"rgba(4,12,21,.62)");overlay.addColorStop(1,"rgba(30,9,39,.66)");rr(ox,oy,ow,oh,34,overlay);
      txt("FROM",118,354,"900 14px Inter, Arial","#78E6ED");const countryFit=fitCountry(dream.country,610);countryFit.lines.forEach((ln,i)=>glowText(ln,116,430+i*countryFit.lineH,"900 "+countryFit.size+"px Space Grotesk, Inter, Arial","#FFFFFF","left","rgba(0,0,0,.48)"));
      const flag=await loadFlag();rr(820,340,128,98,25,"rgba(5,14,24,.80)","rgba(102,231,240,.44)");if(flag){x.save();rr(826,346,116,86,20,"#0D1722");x.clip();contain(flag,834,354,100,70);x.restore();if(flag.__url)URL.revokeObjectURL(flag.__url)}else{txt(dream.countryCode||"WORLD",884,398,"900 18px Inter, Arial","#DDEAF0","center")}
      pill(116,510,230,48,"rgba(6,16,28,.55)","rgba(158,129,255,.26)");txt("REAL HUMAN DREAM",231,541,"900 11px Inter, Arial","#DCC4F6","center");socialDot(386,534,"IG",!!dream.instagram);socialDot(448,534,"TT",!!dream.tiktok);socialDot(510,534,"X",!!dream.xHandle);

      /* Dream — largest visual priority */
      const dx=82,dy=628,dw=916,dh=670;rr(dx,dy,dw,dh,34,"rgba(4,11,21,.58)","rgba(165,126,255,.17)");
      const dreamGlow=x.createRadialGradient(170,720,0,170,720,550);dreamGlow.addColorStop(0,"rgba(82,225,239,.055)");dreamGlow.addColorStop(1,"rgba(82,225,239,0)");x.fillStyle=dreamGlow;rr(dx+2,dy+2,dw-4,dh-4,32,dreamGlow);
      txt("“",110,730,"132px Georgia, serif","rgba(143,91,236,.86)");line(144,738,144,1238,"rgba(103,231,240,.22)",3);
      const fit=fitDream(dream.dream_text,760,530),blockH=fit.lines.length*fit.lineH;let yy=dy+86+Math.max(0,(dh-150-blockH)/2)+fit.size*.76;for(const ln of fit.lines){glowText(ln,184,yy,"800 "+fit.size+"px Inter, Arial","#FCFDFF","left","rgba(0,0,0,.40)");yy+=fit.lineH}
      x.save();x.translate(970,965);x.rotate(-Math.PI/2);txt("DREAM #"+padded,0,0,"900 76px Inter, Arial","rgba(196,148,255,.045)","center");x.restore();

      /* Dreamer */
      line(86,1333,994,1333,"rgba(105,229,239,.16)",2);txt("DREAMED BY",88,1382,"900 13px Inter, Arial","#76E4EC");const name=String(dream.nickname||"Anonymous"),nameSize=fitName(name,360);txt(name,88,1431,"800 "+nameSize+"px Space Grotesk, Inter, Arial","#F8FBFC");
      pill(570,1367,298,54,"rgba(6,17,29,.52)","rgba(103,229,239,.20)");x.beginPath();x.arc(598,1394,6,0,Math.PI*2);x.fillStyle="#79E9DE";x.fill();txt("PERMANENT · PUBLIC",722,1401,"900 12px Inter, Arial","#F5F2FF","center");rr(892,1357,78,78,24,"rgba(31,14,49,.65)","rgba(226,150,255,.38)");txt("✦",931,1410,"900 34px Arial","#E8B9FF","center");

      /* Four worlds */
      txt("ONE DREAM · FOUR WORLDS",88,1492,"900 11px Inter, Arial","#7E96A2");const wy=1520;worldChip(82,wy,"MAP","map","rgba(93,229,240,.82)");worldChip(312,wy,"WALL","wall","rgba(187,136,255,.78)");worldChip(542,wy,"CHAIN","chain","rgba(102,226,209,.78)");worldChip(772,wy,"PUZLE","puzzle","rgba(158,240,77,.78)");

      /* Viral footer / identity */
      const bar=x.createLinearGradient(84,0,996,0);bar.addColorStop(0,"rgba(70,220,235,.14)");bar.addColorStop(.5,"rgba(113,104,239,.14)");bar.addColorStop(1,"rgba(211,96,225,.18)");rr(82,1660,916,94,28,bar,"rgba(192,132,255,.22)");txt("THIS DREAM EXISTS NOW.",540,1701,"900 18px Inter, Arial","#F3F6FA","center");txt("SAVE IT · SHARE IT · LET SOMEONE ELSE DREAM BIGGER",540,1731,"900 10px Inter, Arial","#CBAEEB","center");
      txt("ONEDREAMEACH.COM/DREAM/"+String(dream.dream_number||padded),540,1812,"900 13px Inter, Arial","#8FE8EF","center");txt("ONE PERSON · ONE DREAM · ONE PERMANENT PLACE",540,1840,"900 9px Inter, Arial","#6F8591","center");

      return await new Promise((resolve,reject)=>c.toBlob(blob=>blob?resolve(blob):reject(new Error("Unable to create image")),"image/png",1));
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
    let sharePreviewUrl="";
    async function hydrateSharePreview(){
      try{
        const file=await prepareCardFile();
        const preview=document.getElementById("share-preview-image");
        const loading=document.getElementById("share-preview-loading");
        if(!preview)return;
        if(sharePreviewUrl)URL.revokeObjectURL(sharePreviewUrl);
        sharePreviewUrl=URL.createObjectURL(file);
        preview.onload=function(){preview.classList.add("ready");if(loading)loading.style.display="none";};
        preview.src=sharePreviewUrl;
      }catch(e){
        const loading=document.getElementById("share-preview-loading");
        if(loading)loading.innerHTML="<span>PREVIEW UNAVAILABLE<br>THE CARD CAN STILL BE SAVED</span>";
      }
    }
    setTimeout(hydrateSharePreview,260);
    window.addEventListener("beforeunload",function(){if(sharePreviewUrl)URL.revokeObjectURL(sharePreviewUrl);});
async function getShareCardFile(){
      return await prepareCardFile();
    }

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
        setStatus("Preparing the 9:16 Official Dream Card...");
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
          setStatus("Official 9:16 Dream Card shared.");
        }else if(navigator.share){
          await navigator.share({title:"OneDreamEach · Dream #"+padded,text:shareCaption,url:dreamUrl});
          setStatus("Permanent Dream link shared.");
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
