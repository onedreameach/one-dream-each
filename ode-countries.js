(function () {
  "use strict";

  /* One shared country source for every OneDreamEach world. */
  const PAIRS = `
Afghanistan|AF
Albania|AL
Algeria|DZ
Andorra|AD
Angola|AO
Antigua and Barbuda|AG
Argentina|AR
Armenia|AM
Australia|AU
Austria|AT
Azerbaijan|AZ
Bahamas|BS
Bahrain|BH
Bangladesh|BD
Barbados|BB
Belarus|BY
Belgium|BE
Belize|BZ
Benin|BJ
Bhutan|BT
Bolivia|BO
Bosnia and Herzegovina|BA
Botswana|BW
Brazil|BR
Brunei|BN
Bulgaria|BG
Burkina Faso|BF
Burundi|BI
Cabo Verde|CV
Cambodia|KH
Cameroon|CM
Canada|CA
Central African Republic|CF
Chad|TD
Chile|CL
China|CN
Colombia|CO
Comoros|KM
Costa Rica|CR
Croatia|HR
Cuba|CU
Cyprus|CY
Czechia|CZ
Democratic Republic of the Congo|CD
Denmark|DK
Djibouti|DJ
Dominica|DM
Dominican Republic|DO
Ecuador|EC
Egypt|EG
El Salvador|SV
Equatorial Guinea|GQ
Eritrea|ER
Estonia|EE
Eswatini|SZ
Ethiopia|ET
Fiji|FJ
Finland|FI
France|FR
Gabon|GA
Gambia|GM
Georgia|GE
Germany|DE
Ghana|GH
Greece|GR
Grenada|GD
Guatemala|GT
Guinea|GN
Guinea-Bissau|GW
Guyana|GY
Haiti|HT
Honduras|HN
Hungary|HU
Iceland|IS
India|IN
Indonesia|ID
Iran|IR
Iraq|IQ
Ireland|IE
Israel|IL
Italy|IT
Ivory Coast|CI
Jamaica|JM
Japan|JP
Jordan|JO
Kazakhstan|KZ
Kenya|KE
Kiribati|KI
Kosovo|XK
Kuwait|KW
Kyrgyzstan|KG
Laos|LA
Latvia|LV
Lebanon|LB
Lesotho|LS
Liberia|LR
Libya|LY
Liechtenstein|LI
Lithuania|LT
Luxembourg|LU
Madagascar|MG
Malawi|MW
Malaysia|MY
Maldives|MV
Mali|ML
Malta|MT
Marshall Islands|MH
Mauritania|MR
Mauritius|MU
Mexico|MX
Micronesia|FM
Moldova|MD
Monaco|MC
Mongolia|MN
Montenegro|ME
Morocco|MA
Mozambique|MZ
Myanmar|MM
Namibia|NA
Nauru|NR
Nepal|NP
Netherlands|NL
New Zealand|NZ
Nicaragua|NI
Niger|NE
Nigeria|NG
North Korea|KP
North Macedonia|MK
Norway|NO
Oman|OM
Pakistan|PK
Palau|PW
Palestine|PS
Panama|PA
Papua New Guinea|PG
Paraguay|PY
Peru|PE
Philippines|PH
Poland|PL
Portugal|PT
Qatar|QA
Republic of the Congo|CG
Romania|RO
Russia|RU
Rwanda|RW
Saint Kitts and Nevis|KN
Saint Lucia|LC
Saint Vincent and the Grenadines|VC
Samoa|WS
San Marino|SM
Sao Tome and Principe|ST
Saudi Arabia|SA
Senegal|SN
Serbia|RS
Seychelles|SC
Sierra Leone|SL
Singapore|SG
Slovakia|SK
Slovenia|SI
Solomon Islands|SB
Somalia|SO
South Africa|ZA
South Korea|KR
South Sudan|SS
Spain|ES
Sri Lanka|LK
Sudan|SD
Suriname|SR
Sweden|SE
Switzerland|CH
Syria|SY
Taiwan|TW
Tajikistan|TJ
Tanzania|TZ
Thailand|TH
Timor-Leste|TL
Togo|TG
Tonga|TO
Trinidad and Tobago|TT
Tunisia|TN
Turkey|TR
Turkmenistan|TM
Tuvalu|TV
Uganda|UG
Ukraine|UA
United Arab Emirates|AE
United Kingdom|GB
United States|US
Uruguay|UY
Uzbekistan|UZ
Vanuatu|VU
Vatican City|VA
Venezuela|VE
Vietnam|VN
Yemen|YE
Zambia|ZM
Zimbabwe|ZW`;

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, " and ")
      .replace(/[’']/g, "")
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim()
      .toLowerCase();
  }

  const countryCodes = Object.create(null);
  PAIRS.trim().split("\n").forEach(function (row) {
    const parts = row.split("|");
    countryCodes[normalize(parts[0])] = parts[1];
  });

  const aliases = {
    usa: "US",
    us: "US",
    "u s a": "US",
    america: "US",
    uk: "GB",
    gb: "GB",
    britain: "GB",
    "great britain": "GB",
    england: "GB",
    "uae": "AE",
    "south korea republic of korea": "KR",
    korea: "KR",
    "republic of korea": "KR",
    "dprk": "KP",
    "czech republic": "CZ",
    "cape verde": "CV",
    "swaziland": "SZ",
    "burma": "MM",
    "russian federation": "RU",
    "viet nam": "VN",
    "lao peoples democratic republic": "LA",
    "iran islamic republic of": "IR",
    "syrian arab republic": "SY",
    "bolivia plurinational state of": "BO",
    "venezuela bolivarian republic of": "VE",
    "tanzania united republic of": "TZ",
    "moldova republic of": "MD",
    "brunei darussalam": "BN",
    "micronesia federated states of": "FM",
    "the bahamas": "BS",
    "the gambia": "GM",
    "cote divoire": "CI",
    "cote d ivoire": "CI",
    "congo kinshasa": "CD",
    "dr congo": "CD",
    "drc": "CD",
    "congo democratic republic of the": "CD",
    "congo brazzaville": "CG",
    "congo": "CG",
    "state of palestine": "PS",
    "holy see": "VA",
    "vatican": "VA",
    "east timor": "TL",
    "macedonia": "MK",
    "turkiye": "TR",
    "sao tome principe": "ST"
  };
  Object.keys(aliases).forEach(function (key) {
    countryCodes[normalize(key)] = aliases[key];
  });

  function code(country) {
    const raw = String(country || "").trim();
    if (/^[a-z]{2}$/i.test(raw)) return raw.toUpperCase();
    return countryCodes[normalize(raw)] || "";
  }

  function emojiFromCode(countryCode) {
    const value = String(countryCode || "").toUpperCase();
    if (!/^[A-Z]{2}$/.test(value)) return "🌍";
    return String.fromCodePoint(
      127397 + value.charCodeAt(0),
      127397 + value.charCodeAt(1)
    );
  }

  function emoji(country) {
    return emojiFromCode(code(country));
  }

  function url(country, width) {
    const countryCode = code(country);
    return countryCode
      ? "https://flagcdn.com/w" + (width || 80) + "/" + countryCode.toLowerCase() + ".png"
      : "";
  }

  function codeFromEmoji(value) {
    const points = Array.from(String(value || ""));
    if (points.length !== 2) return "";
    const a = points[0].codePointAt(0) - 127397;
    const b = points[1].codePointAt(0) - 127397;
    if (a < 65 || a > 90 || b < 65 || b > 90) return "";
    return String.fromCharCode(a, b);
  }

  function imageForCode(countryCode) {
    const img = document.createElement("img");
    img.className = "ode-flag-img";
    img.src = "https://flagcdn.com/w80/" + countryCode.toLowerCase() + ".png";
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", function () {
      const fallback = document.createElement("span");
      fallback.className = "ode-flag-fallback";
      fallback.dataset.odeFlagFallback = "true";
      fallback.textContent = emojiFromCode(countryCode);
      fallback.setAttribute("aria-hidden", "true");
      img.replaceWith(fallback);
    }, { once: true });
    return img;
  }

  function upgradeTextNode(node) {
    const value = node.nodeValue || "";
    const flagPattern = /[\u{1F1E6}-\u{1F1FF}]{2}/gu;
    if (!flagPattern.test(value)) return;
    flagPattern.lastIndex = 0;

    const parent = node.parentElement;
    if (!parent || parent.closest("script,style,textarea,select,option,noscript,[data-ode-flag-fallback]")) return;

    const fragment = document.createDocumentFragment();
    let cursor = 0;
    let match;
    while ((match = flagPattern.exec(value))) {
      if (match.index > cursor) {
        fragment.appendChild(document.createTextNode(value.slice(cursor, match.index)));
      }
      const countryCode = codeFromEmoji(match[0]);
      fragment.appendChild(countryCode ? imageForCode(countryCode) : document.createTextNode(match[0]));
      cursor = match.index + match[0].length;
    }
    if (cursor < value.length) fragment.appendChild(document.createTextNode(value.slice(cursor)));
    node.replaceWith(fragment);
  }

  function upgradeFlags(root) {
    const target = root && root.nodeType ? root : document.body;
    if (!target) return;
    if (target.nodeType === Node.TEXT_NODE) {
      upgradeTextNode(target);
      return;
    }
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(upgradeTextNode);
  }

  window.ODECountries = {
    code: code,
    emoji: emoji,
    url: url,
    upgradeFlags: upgradeFlags
  };

  function start() {
    upgradeFlags(document.body);
    if (!document.body || !window.MutationObserver) return;
    let queued = false;
    const pending = new Set();
    const observer = new MutationObserver(function (records) {
      records.forEach(function (record) {
        if (record.type === "characterData") pending.add(record.target);
        record.addedNodes.forEach(function (node) { pending.add(node); });
      });
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        const targets = Array.from(pending);
        pending.clear();
        targets.forEach(upgradeFlags);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
