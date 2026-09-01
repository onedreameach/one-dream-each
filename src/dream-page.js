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
    const safeNickname = escapeHtml(nickname);
    const safeDream = escapeHtml(dreamText);
    const safeCountry = escapeHtml(country);
    const dreamDate = formatDreamDate(dream.created_at);
    const safeDreamDate = escapeHtml(dreamDate);
    const countryCode = getCountryCode(country);
    const flagUrl = countryCode
      ? "https://flagcdn.com/w160/" + countryCode.toLowerCase() + ".png"
      : "";

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
       V29 — HYPER NEON LUXURY COLLECTIBLE
       One 1080x1920 render powers both the page and the download.
       ========================================================= */
    .compact-card-wrap{
      --tilt-x:1.5deg;--tilt-y:-3deg;--shine-x:34%;--shine-y:16%;
      width:min(360px,66vw);margin:22px auto 28px;padding:26px 27px 60px;
      perspective:1450px;perspective-origin:50% 46%;position:relative;isolation:isolate;
      animation:cardStageFloat 5.8s ease-in-out 1s infinite;
    }
    .compact-card-wrap:before,.compact-card-wrap:after,.compact-card:before,.compact-card:after{content:"";position:absolute;pointer-events:none}
    .compact-card-wrap:before{z-index:-4;left:15%;right:8%;bottom:25px;height:28px;border-radius:50%;background:linear-gradient(90deg,rgba(47,235,253,.34),rgba(104,91,255,.14) 48%,rgba(249,80,220,.38));filter:blur(13px);opacity:.72}
    .compact-card-wrap:after{z-index:-3;left:22%;right:14%;bottom:27px;height:15px;border-radius:50%;background:rgba(0,0,0,.72);filter:blur(9px)}
    .compact-card{width:100%;aspect-ratio:9/16;position:relative;transform-style:preserve-3d;transform:rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) rotateZ(.12deg);transform-origin:50% 58%;transition:transform .18s cubic-bezier(.2,.75,.2,1);will-change:transform;filter:drop-shadow(7px 15px 14px rgba(0,0,0,.40));animation:cardArrival .85s cubic-bezier(.16,.84,.24,1) both}
    .compact-card:before{display:none}
    .compact-card:after{z-index:-2;left:14%;right:4%;bottom:-13px;height:10px;border-radius:50%;background:linear-gradient(90deg,rgba(49,232,250,.34),rgba(111,99,255,.10) 50%,rgba(246,79,219,.38));filter:blur(6px);opacity:.70}
    .card-edge{position:absolute;z-index:0;inset:4px -7px -9px 4px;border-radius:39px;background:linear-gradient(145deg,#15333c 0%,#0b1320 43%,#100c1c 68%,#32142d 100%);box-shadow:inset 1px 0 0 rgba(73,234,249,.55),inset -2px -2px 0 rgba(245,91,218,.44),5px 8px 13px rgba(0,0,0,.42),3px 4px 9px rgba(114,80,255,.12);transform:translateZ(-24px)}
    .card-edge:after{content:"";position:absolute;inset:1px;border-radius:38px;background:linear-gradient(145deg,#091720 0%,#060a11 52%,#160a18 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
    .card-face{position:absolute;z-index:2;inset:0;border-radius:38px;overflow:hidden;background:#050912;border:1px solid rgba(221,237,250,.30);box-shadow:inset 0 1px 0 rgba(255,255,255,.15),0 11px 24px rgba(0,0,0,.24);transform:translateZ(0)}
    .card-face:before{content:"";position:absolute;z-index:3;inset:0;pointer-events:none;background:linear-gradient(112deg,transparent 7%,rgba(255,255,255,.11) 17%,transparent 29%),radial-gradient(circle at var(--shine-x) var(--shine-y),rgba(255,255,255,.14),transparent 14%);mix-blend-mode:screen;opacity:.62;transition:background .18s ease}
    .card-face:after{content:"";position:absolute;z-index:4;inset:0;border-radius:inherit;padding:1px;background:linear-gradient(130deg,#51f2ff 0%,rgba(255,255,255,.14) 22%,rgba(116,104,255,.30) 57%,#ff69df 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;opacity:.42}
    .card-render{display:block;width:100%;height:100%;border-radius:inherit;opacity:0;transition:opacity .24s ease;image-rendering:auto}
    .compact-card.is-rendered .card-render{opacity:1}
    .card-loading{position:absolute;inset:0;display:grid;place-items:center;color:#9caec0;font-size:12px;font-weight:900;letter-spacing:.16em;background:radial-gradient(circle at 12% 4%,rgba(55,230,250,.15),transparent 26%),radial-gradient(circle at 96% 4%,rgba(246,79,221,.14),transparent 28%),linear-gradient(155deg,#071722,#040811 48%,#100717);transition:opacity .2s ease}
    .card-loading:before{content:"";width:44px;height:44px;border:2px solid rgba(255,255,255,.12);border-top-color:#65eaf4;border-right-color:#bc7dff;border-radius:50%;animation:cardSpin .8s linear infinite}
    .compact-card.is-rendered .card-loading{opacity:0;pointer-events:none}
    .card-semantic{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
    @keyframes cardArrival{0%{opacity:0;transform:translateY(24px) scale(.95) rotateX(7deg) rotateY(-6deg)}100%{opacity:1;transform:rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) rotateZ(.12deg)}}
    @keyframes cardStageFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes cardSpin{to{transform:rotate(360deg)}}
    @media(max-width:760px){
      .compact-card-wrap{--tilt-x:1deg;--tilt-y:-2deg;width:min(284px,64vw);padding:18px 14px 48px;margin:18px auto 26px;perspective:1150px}
      .card-edge{inset:3px -6px -8px 3px;border-radius:31px;transform:translateZ(-19px)}
      .card-edge:after{border-radius:30px}.card-face{border-radius:30px}
      .compact-card-wrap:before{left:13%;right:5%;bottom:20px;height:24px;filter:blur(11px)}
      .compact-card-wrap:after{bottom:22px;height:13px}
    }
    @media(max-width:390px){.compact-card-wrap{width:min(278px,65vw);padding-left:12px;padding-right:12px}.card-face{border-radius:27px}.card-edge{border-radius:28px}.card-edge:after{border-radius:27px}}
    @media(prefers-reduced-motion:reduce){.compact-card-wrap,.compact-card,.card-render,.card-loading{animation:none!important;transition:none!important}}
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
          <canvas class="card-render" id="official-dream-card-canvas" width="1080" height="1920" aria-hidden="true"></canvas>
          <div class="card-loading" aria-hidden="true"><span class="card-semantic">CREATING OFFICIAL DREAM CARD</span></div>
          <div class="card-semantic">
            <strong>OneDreamEach Official Dream #${padded}</strong>
            <span>From ${safeCountry}. Dreamed by ${safeNickname} on ${safeDreamDate}.</span>
            <p>${safeDream}</p>
            <span>Permanent archive. One of one million.</span>
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
    const dream = ${JSON.stringify({dream_number:number,dream_text:dreamText,nickname,country,countryCode,flagUrl,instagram,tiktok,xHandle,dateLabel:dreamDate})};
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
          dreamCardStage.style.setProperty("--tilt-y",(-3 + (px-.5)*4).toFixed(2)+"deg");
          dreamCardStage.style.setProperty("--tilt-x",(1.5 + (.5-py)*3).toFixed(2)+"deg");
          dreamCardStage.style.setProperty("--shine-x",(px*100).toFixed(1)+"%");
          dreamCardStage.style.setProperty("--shine-y",(py*100).toFixed(1)+"%");
        });
      });
      dreamCardStage.addEventListener("pointerleave",function(){
        dreamCardStage.style.setProperty("--tilt-x",window.innerWidth<760?"1deg":"1.5deg");
        dreamCardStage.style.setProperty("--tilt-y",window.innerWidth<760?"-2deg":"-3deg");
        dreamCardStage.style.setProperty("--shine-x","34%");
        dreamCardStage.style.setProperty("--shine-y","16%");
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
    async function loadFlag(){
      if(!dream.flagUrl)return null;
      try{const r=await fetch(dream.flagUrl,{mode:"cors",cache:"force-cache"});if(!r.ok)return null;const b=await r.blob();const u=URL.createObjectURL(b);const img=new Image();await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=u});img.__url=u;return img;}catch(e){return null;}
    }
    let cachedCardCanvasPromise=null;
    async function buildCardCanvas(){
      await (document.fonts?.ready || Promise.resolve());
      const c=document.getElementById("official-dream-card-canvas")||document.createElement("canvas");
      c.width=1080;c.height=1920;
      const x=c.getContext("2d",{alpha:false});
      if(!x)throw new Error("Canvas unavailable");

      function txt(v,xp,yp,font,color,align){
        x.font=font;x.fillStyle=color;x.textAlign=align||"left";x.textBaseline="alphabetic";
        x.fillText(String(v||""),xp,yp);
      }
      function rr(px,py,pw,ph,r,fill,stroke){
        x.lineWidth=1;roundRect(x,px,py,pw,ph,r,fill,stroke);
      }
      function cover(img,dx,dy,dw,dh){
        const ir=img.width/img.height,dr=dw/dh;let sx=0,sy=0,sw=img.width,sh=img.height;
        if(ir>dr){sw=img.height*dr;sx=(img.width-sw)/2}else{sh=img.width/dr;sy=(img.height-sh)/2}
        x.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);
      }
      function splitWord(word,maxWidth){
        if(x.measureText(word).width<=maxWidth)return[word];
        const out=[];let part="";
        for(const ch of word){const next=part+ch;if(x.measureText(next).width<=maxWidth)part=next;else{if(part)out.push(part);part=ch}}
        if(part)out.push(part);return out;
      }
      function wrap(value,maxWidth){
        const words=String(value||"").trim().split(/\\s+/).filter(Boolean),out=[];let line="";
        for(const raw of words){for(const word of splitWord(raw,maxWidth)){const next=line?line+" "+word:word;if(x.measureText(next).width<=maxWidth)line=next;else{if(line)out.push(line);line=word}}}
        if(line)out.push(line);return out.length?out:[""];
      }
      function fitDream(value,maxWidth,maxHeight){
        const sizes=[116,108,100,92,86,80,74,68,62,58,54,50,46,42];
        for(const size of sizes){
          x.font="850 "+size+"px Inter, Arial";
          const lines=wrap(value,maxWidth),lh=Math.round(size*1.08);
          if(lines.length<=9&&lines.length*lh<=maxHeight)return{size,lines,lh};
        }
        x.font="850 42px Inter, Arial";
        let lines=wrap(value,maxWidth),lh=46,maxLines=Math.max(1,Math.floor(maxHeight/lh));
        if(lines.length>maxLines){
          lines=lines.slice(0,maxLines);let last=lines[maxLines-1]||"";
          while(last&&x.measureText(last+"…").width>maxWidth)last=last.slice(0,-1).trim();
          lines[maxLines-1]=(last||"")+"…";
        }
        return{size:42,lines,lh};
      }
      function fitSmall(value,maxWidth,start,min,weight){
        let size=start;
        while(size>min){x.font=(weight||"800")+" "+size+"px Space Grotesk, Inter, Arial";if(x.measureText(String(value||"")).width<=maxWidth)break;size-=1}
        return size;
      }
      function gradient(x1,y1,x2,y2,stops){
        const g=x.createLinearGradient(x1,y1,x2,y2);for(const stop of stops)g.addColorStop(stop[0],stop[1]);return g;
      }

      x.clearRect(0,0,1080,1920);
      const bg=gradient(0,0,1080,1920,[[0,"#061923"],[.32,"#050b14"],[.68,"#090815"],[1,"#17091a"]]);
      x.fillStyle=bg;x.fillRect(0,0,1080,1920);
      let glow=x.createRadialGradient(70,120,0,70,120,760);glow.addColorStop(0,"rgba(50,236,255,.30)");glow.addColorStop(.35,"rgba(43,162,231,.12)");glow.addColorStop(1,"rgba(27,120,195,0)");x.fillStyle=glow;x.fillRect(0,0,900,940);
      glow=x.createRadialGradient(1060,360,0,1060,360,820);glow.addColorStop(0,"rgba(255,70,220,.27)");glow.addColorStop(.38,"rgba(145,79,255,.14)");glow.addColorStop(1,"rgba(145,79,255,0)");x.fillStyle=glow;x.fillRect(260,0,820,1150);
      glow=x.createRadialGradient(720,1900,0,720,1900,700);glow.addColorStop(0,"rgba(113,82,255,.18)");glow.addColorStop(1,"rgba(113,82,255,0)");x.fillStyle=glow;x.fillRect(160,1200,920,720);

      x.save();x.strokeStyle="rgba(147,214,234,.032)";x.lineWidth=1;
      for(let gx=36;gx<1080;gx+=54){x.beginPath();x.moveTo(gx,0);x.lineTo(gx,1920);x.stroke()}
      for(let gy=36;gy<1920;gy+=54){x.beginPath();x.moveTo(0,gy);x.lineTo(1080,gy);x.stroke()}
      x.restore();

      const border=gradient(28,26,1052,1894,[[0,"#57f4ff"],[.25,"#55b6ff"],[.55,"#806bff"],[.78,"#d85dff"],[1,"#ff70cf"]]);
      x.lineWidth=3;roundRect(x,25,25,1030,1870,58,null,border);
      const topRail=gradient(68,0,1012,0,[[0,"rgba(67,241,255,.92)"],[.42,"rgba(111,111,255,.46)"],[1,"rgba(255,91,220,.92)"]]);
      x.fillStyle=topRail;rr(70,62,940,5,3,topRail);

      txt("OneDreamEach",82,145,"800 48px Space Grotesk, Inter, Arial","#F9FBFF");
      txt("ONE PERSON · ONE DREAM · ONE PERMANENT PLACE",84,183,"800 14px Inter, Arial","#8195A7");
      const officialFill=gradient(720,0,995,0,[[0,"rgba(38,216,237,.18)"],[1,"rgba(214,72,224,.22)"]]);
      rr(735,102,270,72,36,officialFill,"rgba(163,198,240,.25)");
      x.save();x.shadowColor="rgba(99,238,247,.85)";x.shadowBlur=15;x.fillStyle="#75EFF7";x.beginPath();x.arc(774,138,8,0,Math.PI*2);x.fill();x.restore();
      txt("OFFICIAL DREAM",980,145,"900 17px Inter, Arial","#D8E6F1","right");

      txt("DREAM ID",82,261,"900 16px Inter, Arial","#8799AA");
      const numberGradient=gradient(74,0,958,0,[[0,"#47F1FF"],[.30,"#62C9FF"],[.58,"#8B83FF"],[.80,"#C765FF"],[1,"#FF6BD3"]]);
      x.save();x.shadowColor="rgba(100,117,255,.35)";x.shadowBlur=18;txt("#"+padded,72,424,"900 184px Space Grotesk, Inter, Arial",numberGradient);x.restore();

      const identityFill=gradient(70,460,1010,700,[[0,"rgba(8,31,43,.88)"],[.5,"rgba(12,17,35,.92)"],[1,"rgba(35,12,39,.90)"]]);
      x.save();x.shadowColor="rgba(0,0,0,.36)";x.shadowBlur=18;x.shadowOffsetY=10;rr(70,468,940,248,34,identityFill,"rgba(158,184,230,.22)");x.restore();
      x.lineWidth=2;roundRect(x,77,475,926,234,29,null,"rgba(106,229,244,.10)");
      const flag=await loadFlag();
      rr(98,500,160,112,24,"rgba(5,13,24,.95)","rgba(255,255,255,.20)");
      if(flag){
        x.save();rr(104,506,148,100,19);x.clip();cover(flag,104,506,148,100);x.restore();
      }else{
        txt(String(dream.countryCode||"WORLD").toUpperCase(),178,566,"900 24px Inter, Arial","#DCE9F2","center");
      }
      txt("FROM",286,524,"900 14px Inter, Arial","#8093A6");
      const country=String(dream.country||"World").toUpperCase();
      const countrySize=fitSmall(country,390,42,26,"850");
      txt(country,286,574,"850 "+countrySize+"px Space Grotesk, Inter, Arial","#F7FAFC");
      const dateValue=String(dream.dateLabel||"");
      txt("ARCHIVED",972,522,"900 14px Inter, Arial","#8093A6","right");
      txt(dateValue,972,565,"800 28px Space Grotesk, Inter, Arial","#E9F0F6","right");
      const identityDivider=gradient(98,0,982,0,[[0,"rgba(66,232,246,.28)"],[.5,"rgba(255,255,255,.08)"],[1,"rgba(246,87,220,.28)"]]);
      x.fillStyle=identityDivider;x.fillRect(98,632,884,2);
      txt("DREAMER",99,648,"900 14px Inter, Arial","#8497A9");
      const name=String(dream.nickname||"Anonymous");
      const nameSize=fitSmall(name,850,64,40,"850");
      const nameGradient=gradient(98,0,940,0,[[0,"#FFFFFF"],[.54,"#DDEBFF"],[1,"#D8C6FF"]]);
      txt(name,98,704,"850 "+nameSize+"px Space Grotesk, Inter, Arial",nameGradient);

      const dreamFill=gradient(70,760,1010,1608,[[0,"rgba(5,21,31,.88)"],[.48,"rgba(7,11,22,.94)"],[1,"rgba(27,8,31,.91)"]]);
      rr(70,752,940,864,38,dreamFill,"rgba(156,182,231,.20)");
      x.lineWidth=2;roundRect(x,78,760,924,848,31,null,"rgba(110,223,243,.085)");
      txt("THE DREAM",112,834,"900 17px Inter, Arial","#91A4B6");
      rr(112,856,122,5,3,numberGradient);
      x.save();x.globalAlpha=.12;txt("“",932,1060,"700 300px Georgia, serif",numberGradient,"right");x.restore();
      const dreamFit=fitDream(dream.dream_text,790,640);
      const dreamTotal=dreamFit.lines.length*dreamFit.lh;
      let dreamY=912+Math.max(0,(610-dreamTotal)/2)+dreamFit.size*.78;
      const railY=Math.max(900,dreamY-dreamFit.size),railH=Math.min(610,dreamTotal+dreamFit.size*.30);
      const dreamRail=gradient(0,railY,0,railY+railH,[[0,"#4AF0FF"],[.54,"#8874FF"],[1,"#FF62D9"]]);
      x.save();x.shadowColor="rgba(109,112,255,.34)";x.shadowBlur=12;rr(111,railY,6,railH,3,dreamRail);x.restore();
      for(const line of dreamFit.lines){
        x.save();x.shadowColor="rgba(0,0,0,.50)";x.shadowBlur=7;x.shadowOffsetY=3;
        txt(line,148,dreamY,"850 "+dreamFit.size+"px Inter, Arial","#FDFEFF");
        x.restore();dreamY+=dreamFit.lh;
      }

      const footerLine=gradient(82,0,998,0,[[0,"rgba(72,235,247,.34)"],[.48,"rgba(255,255,255,.10)"],[1,"rgba(247,88,220,.34)"]]);
      x.fillStyle=footerLine;x.fillRect(82,1660,916,2);
      txt("PERMANENT ARCHIVE",82,1711,"900 14px Inter, Arial","#8194A7");
      const rankGradient=gradient(82,0,480,0,[[0,"#50EEFA"],[.54,"#9991FF"],[1,"#FA6ED8"]]);
      txt("1 OF 1,000,000",82,1764,"900 43px Space Grotesk, Inter, Arial",rankGradient);
      txt("DREAMED BY",998,1709,"900 13px Inter, Arial","#8194A7","right");
      const footerNameSize=fitSmall(name.toUpperCase(),410,29,18,"850");
      txt(name.toUpperCase(),998,1745,"850 "+footerNameSize+"px Space Grotesk, Inter, Arial","#F3F6FA","right");
      txt("ONE PERSON. ONE DREAM.",998,1791,"850 27px Space Grotesk, Inter, Arial","#F5F8FB","right");
      const urlGradient=gradient(690,0,998,0,[[0,"#55EAF3"],[1,"#FF72D8"]]);
      txt("ONEDREAMEACH.COM/DREAM/"+dream.dream_number,998,1826,"850 16px Inter, Arial",urlGradient,"right");
      txt("COLLECTIBLE DREAM CARD · 9:16",82,1826,"900 13px Inter, Arial","#687B8D");

      if(flag&&flag.__url)URL.revokeObjectURL(flag.__url);
      dreamCard&&dreamCard.classList.add("is-rendered");
      return c;
    }
    function prepareCardCanvas(){
      if(!cachedCardCanvasPromise){
        cachedCardCanvasPromise=buildCardCanvas().catch(err=>{cachedCardCanvasPromise=null;throw err});
      }
      return cachedCardCanvasPromise;
    }
    async function buildCardBlob(){
      const c=await prepareCardCanvas();
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
    prepareCardCanvas().catch(error=>{
      console.error("DREAM CARD RENDER ERROR",error);
      const loading=dreamCard&&dreamCard.querySelector(".card-loading");
      if(loading)loading.textContent="UNABLE TO RENDER CARD";
    });
    async function getShareCardFile(){return prepareCardFile();}

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
